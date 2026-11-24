#include "game/PakAndLang.hpp"
#include "game/Sprite.hpp"
#include "platform/Platform.hpp"

#include <algorithm>
#include <array>
#include <cstdlib>
#include <random>

namespace game {

namespace {
std::unordered_map<std::string, std::vector<uint8_t>> g_pak;
std::vector<std::string> g_strings;
std::string g_missingString = "?";

std::array<int16_t, 360> g_sinTable{};
bool g_trigReady = false;

std::mt19937 g_rng(0xAE202026u);

std::unique_ptr<Sprite> g_spriteFonts[2];
constexpr int kFontStartChar[2] = {45, 43};
constexpr int kFontEndChar[2] = {57, 57};
constexpr int8_t kFontMap0[13] = {10, 11, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
constexpr int8_t kFontMap1[15] = {12, -1, 11, -1, 10, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
} // namespace

bool PakStore::load() {
    if (!g_pak.empty()) return true;
    std::vector<uint8_t> raw;
    if (!platform::readRomfsFile("1.pak", raw)) {
        return false;
    }
    engine::ByteReader r(raw);
    uint16_t hdrLen = r.readUShort();
    uint16_t count = r.readUShort();
    struct Entry {
        std::string name;
        uint32_t offset;
        uint16_t length;
    };
    std::vector<Entry> entries;
    entries.reserve(count);
    for (uint16_t i = 0; i < count; ++i) {
        std::u16string uname = r.readUTF();
        std::string name = platform::u16ToUtf8(uname);
        uint32_t off = static_cast<uint32_t>(r.readInt()) + hdrLen;
        uint16_t len = r.readUShort();
        entries.push_back({std::move(name), off, len});
    }
    for (const auto& e : entries) {
        if (e.offset + e.length <= raw.size()) {
            g_pak[e.name] = std::vector<uint8_t>(raw.begin() + e.offset, raw.begin() + e.offset + e.length);
        }
    }
    return !g_pak.empty();
}

const std::vector<uint8_t>* PakStore::getBytes(const std::string& name) {
    auto it = g_pak.find(name);
    if (it == g_pak.end()) return nullptr;
    return &it->second;
}

bool PakStore::exists(const std::string& name) {
    return g_pak.find(name) != g_pak.end();
}

bool Lang::load() {
    if (!g_strings.empty()) return true;
    std::vector<uint8_t> raw;
    if (!platform::readRomfsFile("lang.dat", raw)) {
        return false;
    }
    engine::ByteReader r(raw);
    int32_t count = r.readInt();
    if (count <= 0 || count > 10000) return false;
    g_strings.resize(static_cast<size_t>(count));
    for (int32_t i = 0; i < count; ++i) {
        std::u16string u16 = r.readUTF();
        g_strings[static_cast<size_t>(i)] = platform::u16ToUtf8(u16);
    }
    return true;
}

const std::string& Lang::get(int id) {
    if (id >= 0 && static_cast<size_t>(id) < g_strings.size()) {
        return g_strings[static_cast<size_t>(id)];
    }
    g_missingString = "?: " + std::to_string(id);
    return g_missingString;
}

std::string Lang::replaceAll(const std::string& src, const std::string& from, const std::string& to, bool all) {
    if (from.empty()) return src;
    std::string out = src;
    size_t pos = 0;
    while ((pos = out.find(from, pos)) != std::string::npos) {
        out.replace(pos, from.size(), to);
        if (!all) break;
        pos += to.size();
    }
    return out;
}

std::string Lang::getWithKeys(int id) {
    std::string s = get(id);
    if (s.find("%K") == std::string::npos) return s;
    std::string k5 = format(20, GameInput::keyBitLabel(GK_FIRE));
    s = replaceAll(s, "%K5", k5, true);
    s = replaceAll(s, "%K0", GameInput::keyBitLabel(GK_0), true);
    s = replaceAll(s, "%K7", GameInput::keyBitLabel(GK_7), true);
    s = replaceAll(s, "%K9", GameInput::keyBitLabel(GK_9), true);
    if (s.find("%KM") != std::string::npos) {
        std::vector<std::string> dirs = {
            GameInput::keyBitLabel(GK_UP),
            GameInput::keyBitLabel(GK_DOWN),
            GameInput::keyBitLabel(GK_LEFT),
            GameInput::keyBitLabel(GK_RIGHT)
        };
        std::string km = format(17, dirs);
        if (!km.empty()) km.push_back('/');
        km += get(18);
        s = replaceAll(s, "%KM", km, true);
    }
    return s;
}

std::string Lang::format(int id, const std::string& arg) {
    return replaceAll(get(id), "%U", arg, false);
}

std::string Lang::format(int id, const std::vector<std::string>& args) {
    std::string s = get(id);
    for (const auto& a : args) {
        s = replaceAll(s, "%U", a, false);
    }
    return s;
}

namespace {
bool isCjkChar(char16_t ch) {
    return (ch >= 11904 && ch < 44032) || (ch >= 63744 && ch < 64256) || (ch >= 65280 && ch < 65504);
}

int nextWordEnd(const std::u16string& u16, int start) {
    int len = static_cast<int>(u16.size());
    if (start >= len) return len;
    if (isCjkChar(u16[start])) return start + 1;
    int idx = start;
    while (idx < len && u16[idx] == u' ') ++idx;
    size_t sp = u16.find(u' ', static_cast<size_t>(idx));
    int end = (sp == std::u16string::npos) ? len : static_cast<int>(sp) + 1;
    for (int i = idx + 1; i < end; ++i) {
        if (isCjkChar(u16[i])) return i;
    }
    return end;
}

std::u16string trimU16(const std::u16string& s) {
    size_t a = 0;
    while (a < s.size() && s[a] <= u' ') ++a;
    size_t b = s.size();
    while (b > a && s[b - 1] <= u' ') --b;
    return s.substr(a, b - a);
}
} // namespace

std::vector<std::string> Lang::wrapText(const std::string& text, int maxWidth, int fontId) {
    std::vector<std::string> lines;
    std::u16string u16 = platform::utf8ToU16(text);
    int len = static_cast<int>(u16.size());
    if (len == 0) {
        lines.emplace_back("");
        return lines;
    }
    int lineStart = 0;
    std::u16string bestLine;
    do {
        int cur = lineStart;
        size_t nlPos = u16.find(u'\n', static_cast<size_t>(cur));
        int nl = (nlPos == std::u16string::npos) ? -1 : static_cast<int>(nlPos);
        while (true) {
            int prevCur = cur;
            std::u16string prevLine = bestLine;
            cur = nextWordEnd(u16, cur);
            if (nl >= 0 && nl < cur) cur = nl;
            bestLine = trimU16(u16.substr(static_cast<size_t>(lineStart), static_cast<size_t>(cur - lineStart)));
            if (engine::GraphicsContext::stringWidth(fontId, bestLine) > maxWidth) {
                if (prevCur == lineStart) {
                    bool cut = false;
                    for (int k = static_cast<int>(bestLine.size()) - 1; k > 0; --k) {
                        std::u16string sub = bestLine.substr(0, static_cast<size_t>(k));
                        if (engine::GraphicsContext::stringWidth(fontId, sub) <= maxWidth) {
                            cur = prevCur + k;
                            bestLine = sub;
                            cut = true;
                            break;
                        }
                    }
                    if (!cut && bestLine.size() > 1) {
                        cur = prevCur + 1;
                        bestLine = bestLine.substr(0, 1);
                    }
                    break;
                }
                cur = prevCur;
                bestLine = prevLine;
                break;
            }
            if (cur == nl) {
                ++cur;
                break;
            }
            if (cur >= len) break;
        }
        lines.push_back(platform::u16ToUtf8(bestLine));
        lineStart = cur;
    } while (lineStart < len);

    if (lines.empty()) lines.emplace_back("");
    return lines;
}

void Trig::init() {
    if (g_trigReady) return;
    int var1 = 360 * 10000 / 2 / 31415;
    int var2 = 1024 * var1;
    int var3 = 0;
    for (int i = 0; i < 360; ++i) {
        int var4 = var3 / var1;
        g_sinTable[static_cast<size_t>(i)] = static_cast<int16_t>(var4);
        var2 -= var4;
        var3 += var2 / var1;
    }
    g_sinTable[180] = 0;
    g_sinTable[270] = -1024;
    g_trigReady = true;
}

int16_t Trig::sin1024(int deg) {
    int d = deg % 360;
    if (d < 0) d += 360;
    return g_sinTable[static_cast<size_t>(d)];
}

int16_t Trig::cos1024(int deg) {
    int d = (deg + 90) % 360;
    if (d < 0) d += 360;
    return g_sinTable[static_cast<size_t>(d)];
}

int32_t GameInput::mapJ2meKeyToAction(int32_t j2meKey) {
    switch (j2meKey) {
        case -7: return GK_RSK;
        case -6: return GK_LSK;
        case -5: return GK_FIRE;
        case -4: return GK_RIGHT;
        case -3: return GK_LEFT;
        case -2: return GK_DOWN;
        case -1: return GK_UP;
        case 48: return GK_0;
        case 49: return GK_1;
        case 50: return GK_UP;
        case 51: return GK_3;
        case 52: return GK_LEFT;
        case 53: return GK_FIRE;
        case 54: return GK_RIGHT;
        case 55: return GK_7;
        case 56: return GK_DOWN;
        case 57: return GK_9;
        default: return GK_OTHER;
    }
}

std::string GameInput::keyBitLabel(int32_t actionBit) {
    switch (actionBit) {
        case GK_UP:    return "2/Up";
        case GK_DOWN:  return "8/Down";
        case GK_LEFT:  return "4/Left";
        case GK_RIGHT: return "6/Right";
        case GK_FIRE:  return "5/Enter";
        case GK_0:     return "0";
        case GK_1:     return "1";
        case GK_3:     return "3";
        case GK_7:     return "7";
        case GK_9:     return "9";
        case GK_LSK:   return "Q";
        case GK_RSK:   return "E";
        default:       return "";
    }
}

void GameInput::onKeyPressed(int32_t j2meKey) {
    int32_t act = mapJ2meKeyToAction(j2meKey);
    lastKey_ = act;
    lastKeyTimeMs_ = platform::getUiTicksMs();
    heldMask_ |= act;
    justMask_ |= act;
}

void GameInput::onKeyReleased(int32_t j2meKey) {
    int32_t act = mapJ2meKeyToAction(j2meKey);
    if (act == lastKey_) lastKey_ = 0;
    heldMask_ &= ~act;
}

void GameInput::clearAll() {
    lastKey_ = 0;
    heldMask_ = 0;
    justMask_ = 0;
}

bool GameInput::consumeJustPressed(int32_t mask) {
    bool hit = (justMask_ & mask) != 0;
    justMask_ &= ~mask;
    return hit;
}

bool GameInput::isRepeat(int32_t mask, uint64_t nowMs) const {
    return lastKey_ == mask && nowMs >= lastKeyTimeMs_ + 400ULL;
}

bool SpriteFont::init() {
    g_spriteFonts[0] = std::make_unique<Sprite>("chars");
    g_spriteFonts[1] = std::make_unique<Sprite>("lchars");
    return true;
}

void SpriteFont::shutdown() {
    g_spriteFonts[0].reset();
    g_spriteFonts[1].reset();
}

int SpriteFont::stringWidth(int fontId, const std::string& str) {
    if (fontId < 0 || fontId > 1 || !g_spriteFonts[fontId]) return 0;
    return g_spriteFonts[fontId]->frameW * static_cast<int>(str.size());
}

int SpriteFont::height(int fontId) {
    if (fontId < 0 || fontId > 1 || !g_spriteFonts[fontId]) return 8;
    return g_spriteFonts[fontId]->frameH;
}

void SpriteFont::draw(engine::GraphicsContext& g, const std::string& str, int x, int y, int fontId, int anchor) {
    if (fontId < 0 || fontId > 1 || !g_spriteFonts[fontId]) return;
    if ((anchor & engine::RIGHT) != 0) {
        x -= stringWidth(fontId, str);
    } else if ((anchor & engine::HCENTER) != 0) {
        x -= stringWidth(fontId, str) / 2;
    }
    if ((anchor & engine::BOTTOM) != 0) {
        y -= height(fontId);
    } else if ((anchor & engine::VCENTER) != 0) {
        y -= height(fontId) / 2;
    }

    Sprite* sp = g_spriteFonts[fontId].get();
    for (unsigned char ch : str) {
        if (ch >= kFontStartChar[fontId] && ch <= kFontEndChar[fontId]) {
            int idx = ch - kFontStartChar[fontId];
            int8_t mapped = (fontId == 0) ? kFontMap0[idx] : kFontMap1[idx];
            if (mapped >= 0) {
                sp->setFrameIndex(mapped);
                sp->draw(g, x, y);
                x += sp->frameW;
            } else {
                std::string one(1, static_cast<char>(ch));
                g.drawString(one, x, y, engine::LEFT | engine::TOP);
                x += engine::GraphicsContext::stringWidth(g.fontId(), one);
            }
        }
    }
}

void SpriteFont::drawSystem(engine::GraphicsContext& g, const std::string& str, int x, int y, int anchor) {
    g.drawString(str, x, y, anchor);
}

namespace GameRng {
int nextInt() {
    return static_cast<int>(static_cast<int32_t>(g_rng()));
}

int nextInt(int bound) {
    if (bound <= 0) return 0;
    return static_cast<int>(g_rng() % static_cast<uint32_t>(bound));
}

int range(int minVal, int maxVal) {
    if (maxVal <= minVal) return minVal;
    return minVal + nextInt(maxVal - minVal);
}
} // namespace GameRng

} // namespace game
