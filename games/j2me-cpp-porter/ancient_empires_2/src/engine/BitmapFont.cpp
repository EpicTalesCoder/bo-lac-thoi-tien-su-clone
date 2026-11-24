#include "engine/BitmapFont.hpp"
#include "engine/Types.hpp"
#include "platform/Platform.hpp"

#include <cstdio>
#include <unordered_map>

namespace engine {

namespace {
int g_height = 10;
int g_spaceRefWidth = 10;
std::vector<int> g_widths;
std::vector<int> g_offsets;
std::vector<std::vector<uint8_t>> g_bitmap; // [row][col]
std::unordered_map<char16_t, int> g_charMap;
} // namespace

bool BitmapFont::init() {
    std::vector<uint8_t> raw;
    if (!platform::readRomfsFile("font.bin", raw)) {
        std::fprintf(stderr, "Failed to read font.bin\n");
        return false;
    }

    ByteReader r(raw);
    std::u16string chars = r.readUTF();
    g_height = r.readByte();
    if (g_height <= 0) g_height = 10;

    int count = static_cast<int>(chars.size());
    g_widths.resize(count);
    g_offsets.resize(count);
    g_charMap.clear();

    int totalWidth = 0;
    for (int i = 0; i < count; ++i) {
        g_widths[i] = r.readByte();
        g_offsets[i] = totalWidth;
        totalWidth += g_widths[i];
        g_charMap[chars[i]] = i;
    }

    g_bitmap.assign(g_height, std::vector<uint8_t>(totalWidth, 0));
    int bitPos = 7;
    uint8_t curByte = 0;
    for (int row = 0; row < g_height; ++row) {
        for (int col = 0; col < totalWidth; ++col) {
            if (++bitPos >= 8) {
                bitPos = 0;
                curByte = r.readUByte();
            }
            if ((curByte & 1) != 0) {
                g_bitmap[row][col] = 1;
            }
            curByte >>= 1;
        }
    }

    g_spaceRefWidth = stringWidth(u"nhung1");
    return true;
}

int BitmapFont::height() {
    return g_height;
}

int BitmapFont::spaceRefWidth() {
    return g_spaceRefWidth;
}

int BitmapFont::charWidth(char16_t ch) {
    auto it = g_charMap.find(ch);
    if (it == g_charMap.end()) return 0;
    return g_widths[it->second];
}

int BitmapFont::rangeWidth(const std::u16string& str, int start, int end) {
    int sum = 0;
    int n = static_cast<int>(str.size());
    if (start < 0) start = 0;
    if (end > n) end = n;
    for (int i = start; i < end; ++i) {
        sum += charWidth(str[i]);
    }
    return sum;
}

int BitmapFont::stringWidth(const std::u16string& str) {
    return rangeWidth(str, 0, static_cast<int>(str.size()));
}

int BitmapFont::drawChar(GraphicsContext& g, char16_t ch, int x, int y) {
    auto it = g_charMap.find(ch);
    if (it == g_charMap.end()) return 0;
    int idx = it->second;
    int w = g_widths[idx];
    int off = g_offsets[idx];
    for (int row = 0; row < g_height; ++row) {
        const uint8_t* rowPtr = g_bitmap[row].data();
        for (int col = 0; col < w; ++col) {
            if (rowPtr[off + col] != 0) {
                g.plotPixel(x + col, y + row);
            }
        }
    }
    return w;
}

void BitmapFont::drawPlain(GraphicsContext& g, const std::u16string& str, int x, int y) {
    int cx = x;
    for (char16_t ch : str) {
        cx += drawChar(g, ch, cx, y);
    }
}

void BitmapFont::drawAnchored(GraphicsContext& g, const std::u16string& str, int x, int y, int anchor) {
    int dx = x;
    int dy = y;
    if (anchor & HCENTER) {
        dx = x - stringWidth(str) / 2;
    } else if (anchor & RIGHT) {
        dx = x - stringWidth(str);
    }
    if (anchor & VCENTER) {
        dy = y - g_height / 2;
    } else if (anchor & (BOTTOM | BASELINE)) {
        dy = y - g_height;
    }
    drawPlain(g, str, dx, dy);
}

std::vector<std::u16string> BitmapFont::wrapLines(const std::u16string& str, int maxWidth) {
    std::vector<std::u16string> lines;
    const int effMax = std::max(1, maxWidth);
    const int len = static_cast<int>(str.size());
    std::u16string cur;
    int curW = 0;

    int i = 0;
    while (i < len) {
        char16_t ch = str[i];
        if (ch == u'\r') {
            ++i;
            continue;
        }
        if (ch == u'\n') {
            lines.push_back(cur);
            cur.clear();
            curW = 0;
            ++i;
            continue;
        }
        if (ch == u' ') {
            // Look ahead past consecutive spaces to the following sub-token to wrap on word boundaries
            int spEnd = i;
            int spW = 0;
            while (spEnd < len && str[spEnd] == u' ') {
                spW += charWidth(u' ');
                ++spEnd;
            }
            if (spEnd >= len || str[spEnd] == u'\n' || str[spEnd] == u'\r') {
                i = spEnd;
                continue;
            }
            int tokEnd = spEnd;
            int tokW = 0;
            while (tokEnd < len && str[tokEnd] != u' ' && str[tokEnd] != u'\n' && str[tokEnd] != u'\r') {
                tokW += charWidth(str[tokEnd]);
                char16_t tc = str[tokEnd];
                ++tokEnd;
                if (tc == u'-' || tc == u'/') break;
            }
            if (!cur.empty() && curW + spW + tokW > effMax) {
                lines.push_back(cur);
                cur.clear();
                curW = 0;
                i = spEnd; // drop wrapped whitespace so next line begins cleanly flush
                continue;
            }
            cur.append(str, i, tokEnd - i);
            curW += spW + tokW;
            i = tokEnd;
            continue;
        }

        // Non-space sub-token (at line start, or immediately following '-' / '/')
        int tokEnd = i;
        int tokW = 0;
        while (tokEnd < len && str[tokEnd] != u' ' && str[tokEnd] != u'\n' && str[tokEnd] != u'\r') {
            tokW += charWidth(str[tokEnd]);
            char16_t tc = str[tokEnd];
            ++tokEnd;
            if (tc == u'-' || tc == u'/') break;
        }
        if (!cur.empty() && curW + tokW > effMax) {
            lines.push_back(cur);
            cur.clear();
            curW = 0;
            continue;
        }
        if (cur.empty() && tokW > effMax) {
            // Force-break only when a single indivisible token exceeds the entire line width
            int split = i;
            int partW = 0;
            while (split < tokEnd) {
                int cw = charWidth(str[split]);
                if (split > i && partW + cw > effMax) break;
                partW += cw;
                ++split;
            }
            lines.push_back(str.substr(i, split - i));
            i = split;
            continue;
        }
        cur.append(str, i, tokEnd - i);
        curW += tokW;
        i = tokEnd;
    }
    if (!cur.empty() || lines.empty()) {
        if (!cur.empty()) lines.push_back(cur);
    }
    return lines;
}

} // namespace engine
