#include "platform/Platform.hpp"
#include "platform/CrashLogger.hpp"

#include <SDL.h>
#include <cstdio>
#include <cstdlib>
#include <sys/stat.h>

namespace platform {

namespace {
std::string g_assetsBase;
std::string g_saveBase;
std::string g_appSlug = "j2me_port";
uint64_t g_gameTicksMs = 1000ULL;
uint64_t g_uiTicksMs = 1000ULL;

bool dirExists(const std::string& path) {
    struct stat st{};
    return stat(path.c_str(), &st) == 0 && S_ISDIR(st.st_mode);
}

void ensureDir(const std::string& path) {
    if (path.empty() || dirExists(path)) return;
    std::string cur;
    for (size_t i = 0; i < path.size(); ++i) {
        cur.push_back(path[i]);
        if (path[i] == '/' || i + 1 == path.size()) {
            if (!cur.empty() && cur != "/") {
                mkdir(cur.c_str(), 0755);
            }
        }
    }
}
} // namespace

bool init(const char* appSlug) {
    if (appSlug && appSlug[0]) {
        g_appSlug = appSlug;
    }

    auto hasGameAssets = [](const std::string& dir) {
        if (!dirExists(dir)) return false;
        struct stat st{};
        std::string p1 = dir + "/1.pak";
        std::string p2 = dir + "/fonts/ui.ttf";
        return stat(p1.c_str(), &st) == 0 || stat(p2.c_str(), &st) == 0;
    };

    if (hasGameAssets("assets")) {
        g_assetsBase = "assets/";
    } else if (hasGameAssets("../assets")) {
        g_assetsBase = "../assets/";
    } else if (hasGameAssets("romfs")) {
        g_assetsBase = "romfs/";
    } else if (hasGameAssets("../romfs")) {
        g_assetsBase = "../romfs/";
    }
#ifdef PORT_ASSETS_FALLBACK_DIR
    else if (dirExists(PORT_ASSETS_FALLBACK_DIR)) {
        g_assetsBase = std::string(PORT_ASSETS_FALLBACK_DIR) + "/";
    }
#endif
#ifdef VQSV_ROMFS_FALLBACK_DIR
    else if (dirExists(VQSV_ROMFS_FALLBACK_DIR)) {
        g_assetsBase = std::string(VQSV_ROMFS_FALLBACK_DIR) + "/";
    }
#endif
    else {
        g_assetsBase = "assets/";
    }

    const char* home = std::getenv("HOME");
    if (home && home[0]) {
        g_saveBase = std::string(home) + "/." + g_appSlug + "_desktop_save/";
    } else {
        g_saveBase = "./save/";
    }
    ensureDir(g_saveBase);

    CrashLogger::setAppSlug(g_appSlug.c_str());
    CrashLogger::initEarly();
    CrashLogger::logEnvironmentInfo();
    return true;
}

void shutdown() {
}

std::string resolveRomfsPath(const std::string& relPath) {
    std::string clean = relPath;
    while (!clean.empty() && clean.front() == '/') {
        clean.erase(clean.begin());
    }
    return g_assetsBase + clean;
}

std::string resolveSavePath(const std::string& filename) {
    std::string clean = filename;
    for (char& ch : clean) {
        if (ch == '/' || ch == '\\' || ch == ':') ch = '_';
    }
    return g_saveBase + clean;
}

bool readFileBytes(const std::string& absPath, std::vector<uint8_t>& out) {
    FILE* fp = std::fopen(absPath.c_str(), "rb");
    if (!fp) return false;
    std::fseek(fp, 0, SEEK_END);
    long sz = std::ftell(fp);
    if (sz < 0) {
        std::fclose(fp);
        return false;
    }
    std::fseek(fp, 0, SEEK_SET);
    out.resize(static_cast<size_t>(sz));
    if (sz > 0) {
        size_t n = std::fread(out.data(), 1, static_cast<size_t>(sz), fp);
        if (n != static_cast<size_t>(sz)) {
            out.resize(n);
        }
    }
    std::fclose(fp);
    return true;
}

bool readRomfsFile(const std::string& relPath, std::vector<uint8_t>& out) {
    return readFileBytes(resolveRomfsPath(relPath), out);
}

bool romfsFileExists(const std::string& relPath) {
    return fileExists(resolveRomfsPath(relPath));
}

bool writeFileBytes(const std::string& absPath, const uint8_t* data, size_t size) {
    FILE* fp = std::fopen(absPath.c_str(), "wb");
    if (!fp) return false;
    bool ok = true;
    if (size > 0) {
        ok = (std::fwrite(data, 1, size, fp) == size);
    }
    std::fclose(fp);
    return ok;
}

bool deleteFile(const std::string& absPath) {
    return std::remove(absPath.c_str()) == 0;
}

bool fileExists(const std::string& absPath) {
    struct stat st{};
    return stat(absPath.c_str(), &st) == 0 && S_ISREG(st.st_mode);
}

uint64_t getTicksMs() {
    return SDL_GetTicks64();
}

uint64_t getGameTicksMs() {
    return g_gameTicksMs;
}

void advanceGameTicksMs(uint64_t deltaMs) {
    g_gameTicksMs += deltaMs;
}

void resetGameTicksMs(uint64_t valueMs) {
    g_gameTicksMs = (valueMs > 0ULL) ? valueMs : 1ULL;
}

uint64_t getUiTicksMs() {
    return g_uiTicksMs;
}

void advanceUiTicksMs(uint64_t deltaMs) {
    g_uiTicksMs += deltaMs;
}

void resetUiTicksMs(uint64_t valueMs) {
    g_uiTicksMs = (valueMs > 0ULL) ? valueMs : 1ULL;
}

std::u16string utf8ToU16(const std::string& utf8) {
    std::u16string out;
    out.reserve(utf8.size());
    size_t i = 0;
    while (i < utf8.size()) {
        uint8_t c = static_cast<uint8_t>(utf8[i]);
        uint32_t cp = 0;
        if (c < 0x80) {
            cp = c;
            i += 1;
        } else if ((c & 0xE0) == 0xC0 && i + 1 < utf8.size()) {
            cp = ((c & 0x1F) << 6) | (static_cast<uint8_t>(utf8[i + 1]) & 0x3F);
            i += 2;
        } else if ((c & 0xF0) == 0xE0 && i + 2 < utf8.size()) {
            cp = ((c & 0x0F) << 12) |
                 ((static_cast<uint8_t>(utf8[i + 1]) & 0x3F) << 6) |
                 (static_cast<uint8_t>(utf8[i + 2]) & 0x3F);
            i += 3;
        } else if ((c & 0xF8) == 0xF0 && i + 3 < utf8.size()) {
            cp = ((c & 0x07) << 18) |
                 ((static_cast<uint8_t>(utf8[i + 1]) & 0x3F) << 12) |
                 ((static_cast<uint8_t>(utf8[i + 2]) & 0x3F) << 6) |
                 (static_cast<uint8_t>(utf8[i + 3]) & 0x3F);
            i += 4;
        } else {
            cp = '?';
            i += 1;
        }
        if (cp <= 0xFFFF) {
            out.push_back(static_cast<char16_t>(cp));
        } else {
            cp -= 0x10000;
            out.push_back(static_cast<char16_t>(0xD800 + (cp >> 10)));
            out.push_back(static_cast<char16_t>(0xDC00 + (cp & 0x3FF)));
        }
    }
    return out;
}

std::string u16ToUtf8(const std::u16string& u16) {
    std::string out;
    out.reserve(u16.size() * 2);
    for (size_t i = 0; i < u16.size(); ++i) {
        uint32_t cp = u16[i];
        if (cp >= 0xD800 && cp <= 0xDBFF && i + 1 < u16.size()) {
            uint32_t lo = u16[i + 1];
            if (lo >= 0xDC00 && lo <= 0xDFFF) {
                cp = 0x10000 + (((cp - 0xD800) << 10) | (lo - 0xDC00));
                ++i;
            }
        }
        if (cp < 0x80) {
            out.push_back(static_cast<char>(cp));
        } else if (cp < 0x800) {
            out.push_back(static_cast<char>(0xC0 | (cp >> 6)));
            out.push_back(static_cast<char>(0x80 | (cp & 0x3F)));
        } else if (cp < 0x10000) {
            out.push_back(static_cast<char>(0xE0 | (cp >> 12)));
            out.push_back(static_cast<char>(0x80 | ((cp >> 6) & 0x3F)));
            out.push_back(static_cast<char>(0x80 | (cp & 0x3F)));
        } else {
            out.push_back(static_cast<char>(0xF0 | (cp >> 18)));
            out.push_back(static_cast<char>(0x80 | ((cp >> 12) & 0x3F)));
            out.push_back(static_cast<char>(0x80 | ((cp >> 6) & 0x3F)));
            out.push_back(static_cast<char>(0x80 | (cp & 0x3F)));
        }
    }
    return out;
}

std::u16string utf16beToU16(const uint8_t* data, size_t byteLen) {
    std::u16string out;
    out.reserve(byteLen / 2);
    for (size_t i = 0; i + 1 < byteLen; i += 2) {
        char16_t ch = static_cast<char16_t>((static_cast<uint16_t>(data[i]) << 8) | data[i + 1]);
        out.push_back(ch);
    }
    return out;
}

std::u16string modifiedUtf8ToU16(const uint8_t* data, size_t byteLen) {
    std::u16string out;
    out.reserve(byteLen);
    size_t i = 0;
    while (i < byteLen) {
        uint8_t a = data[i];
        if ((a & 0x80) == 0) {
            out.push_back(static_cast<char16_t>(a));
            ++i;
        } else if ((a & 0xE0) == 0xC0 && i + 1 < byteLen) {
            uint8_t b = data[i + 1];
            out.push_back(static_cast<char16_t>(((a & 0x1F) << 6) | (b & 0x3F)));
            i += 2;
        } else if ((a & 0xF0) == 0xE0 && i + 2 < byteLen) {
            uint8_t b = data[i + 1];
            uint8_t c = data[i + 2];
            out.push_back(static_cast<char16_t>(((a & 0x0F) << 12) | ((b & 0x3F) << 6) | (c & 0x3F)));
            i += 3;
        } else {
            out.push_back(u'?');
            ++i;
        }
    }
    return out;
}

} // namespace platform
