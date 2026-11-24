#include "platform/CrashLogger.hpp"

#include <algorithm>
#include <cinttypes>
#include <csignal>
#include <cstdarg>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <exception>
#include <execinfo.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <unistd.h>

namespace {

constexpr size_t kRingCap = 48;
constexpr size_t kLineCap = 160;
constexpr size_t kPathCap = 256;

bool g_inited = false;
bool g_cleanMarked = false;
volatile sig_atomic_t g_inCrashHandler = 0;

char g_slug[64] = "j2me_port";
char g_logDir[kPathCap]{};
char g_bootLogPath[kPathCap]{};
char g_prevBootLogPath[kPathCap]{};
char g_lastCrashBootPath[kPathCap]{};
char g_crashLogPath[kPathCap]{};
char g_runningFlagPath[kPathCap]{};
char g_unreadFlagPath[kPathCap]{};

char g_lastStage[96] = "pre_init";
volatile int g_appState = -1;
volatile int g_sceneId = -1;
volatile int g_roomId = -1;
volatile uint64_t g_frameCount = 0;

char g_ring[kRingCap][kLineCap]{};
size_t g_ringHead = 0;
size_t g_ringCount = 0;

volatile int g_prevAppState = -1;
volatile int g_prevSceneId = -1;
volatile int g_prevRoomId = -1;
char g_envSummary[160] = "Desktop C++17 (SDL2)";

void copyCStr(char* dst, size_t cap, const char* src) {
    if (!dst || cap == 0) return;
    if (!src) { dst[0] = '\0'; return; }
    size_t i = 0;
    while (i + 1 < cap && src[i] != '\0') {
        dst[i] = src[i];
        ++i;
    }
    dst[i] = '\0';
}

void joinPath(char* dst, size_t cap, const char* dir, const char* name) {
    if (!dst || cap == 0) return;
    size_t pos = 0;
    if (dir) {
        while (pos + 1 < cap && dir[pos] != '\0') {
            dst[pos] = dir[pos];
            ++pos;
        }
    }
    if (name) {
        size_t j = 0;
        while (pos + 1 < cap && name[j] != '\0') {
            dst[pos++] = name[j++];
        }
    }
    dst[pos] = '\0';
}

void ensureDirC(const char* path) {
    if (!path || !path[0]) return;
    char tmp[kPathCap]{};
    copyCStr(tmp, sizeof(tmp), path);
    for (size_t i = 1; tmp[i] != '\0'; ++i) {
        if (tmp[i] == '/') {
            tmp[i] = '\0';
            mkdir(tmp, 0755);
            tmp[i] = '/';
        }
    }
    mkdir(tmp, 0755);
}

bool fileExistsC(const char* path) {
    if (!path || !path[0]) return false;
    struct stat st{};
    return stat(path, &st) == 0 && S_ISREG(st.st_mode);
}

void writeAllFd(int fd, const char* data, size_t len) {
    size_t written = 0;
    while (written < len) {
        ssize_t n = write(fd, data + written, len - written);
        if (n <= 0) break;
        written += static_cast<size_t>(n);
    }
}

void appendLineFd(const char* path, const char* line, size_t len) {
    if (!path || !path[0]) return;
    int fd = open(path, O_WRONLY | O_CREAT | O_APPEND, 0644);
    if (fd < 0) return;
    if (len > 0) writeAllFd(fd, line, len);
    writeAllFd(fd, "\n", 1);
    close(fd);
}

void touchFileC(const char* path) {
    if (!path || !path[0]) return;
    int fd = open(path, O_WRONLY | O_CREAT | O_TRUNC, 0644);
    if (fd >= 0) close(fd);
}

void copyFileC(const char* srcPath, const char* dstPath) {
    int inFd = open(srcPath, O_RDONLY);
    if (inFd < 0) return;
    int outFd = open(dstPath, O_WRONLY | O_CREAT | O_TRUNC, 0644);
    if (outFd < 0) { close(inFd); return; }
    char buf[2048];
    for (;;) {
        ssize_t r = read(inFd, buf, sizeof(buf));
        if (r <= 0) break;
        writeAllFd(outFd, buf, static_cast<size_t>(r));
    }
    close(outFd);
    close(inFd);
}

void emitLogLine(const char* line, bool flushDisk) {
    if (!line) return;
    copyCStr(g_ring[g_ringHead], kLineCap, line);
    g_ringHead = (g_ringHead + 1) % kRingCap;
    if (g_ringCount < kRingCap) ++g_ringCount;
    if (flushDisk && g_bootLogPath[0]) {
        appendLineFd(g_bootLogPath, line, std::strlen(line));
    }
}

void readFileLinesBounded(const char* path, std::vector<std::string>& out, size_t maxBytes) {
    FILE* fp = std::fopen(path, "rb");
    if (!fp) return;
    std::fseek(fp, 0, SEEK_END);
    long sz = std::ftell(fp);
    if (sz <= 0) { std::fclose(fp); return; }
    long start = (static_cast<size_t>(sz) > maxBytes) ? (sz - static_cast<long>(maxBytes)) : 0;
    std::fseek(fp, start, SEEK_SET);
    std::string data(static_cast<size_t>(sz - start), '\0');
    size_t n = std::fread(&data[0], 1, data.size(), fp);
    std::fclose(fp);
    data.resize(n);
    size_t lineStart = (start > 0) ? (data.find('\n') + 1) : 0;
    if (start > 0 && lineStart == 0) lineStart = 0;
    while (lineStart < data.size()) {
        size_t nl = data.find('\n', lineStart);
        if (nl == std::string::npos) nl = data.size();
        std::string line = data.substr(lineStart, nl - lineStart);
        if (!line.empty() && line.back() == '\r') line.pop_back();
        out.push_back(std::move(line));
        lineStart = nl + 1;
    }
}

void handleFatalSignalOrTerminate(const char* reason) {
    if (g_inCrashHandler) return;
    g_inCrashHandler = 1;
    if (!g_logDir[0]) copyCStr(g_logDir, sizeof(g_logDir), "./save/");
    ensureDirC(g_logDir);
    if (!g_crashLogPath[0]) joinPath(g_crashLogPath, sizeof(g_crashLogPath), g_logDir, "crash.log");
    if (!g_unreadFlagPath[0]) joinPath(g_unreadFlagPath, sizeof(g_unreadFlagPath), g_logDir, ".crash_unread");

    int fd = open(g_crashLogPath, O_WRONLY | O_CREAT | O_TRUNC, 0644);
    if (fd >= 0) {
        char buf[256];
        int n = std::snprintf(
            buf, sizeof(buf),
            "=== DESKTOP CRASH REPORT ===\nReason: %s\nEnv: %s\nLastStage: %s\nFrame: %" PRIu64 " | State=(%d,%d,%d)\n",
            reason ? reason : "unknown", g_envSummary, g_lastStage, g_frameCount,
            static_cast<int>(g_appState), static_cast<int>(g_sceneId), static_cast<int>(g_roomId));
        if (n > 0) writeAllFd(fd, buf, static_cast<size_t>(n));
        writeAllFd(fd, "\n--- Backtrace ---\n", 19);
        void* frames[48];
        int btCount = backtrace(frames, 48);
        backtrace_symbols_fd(frames, btCount, fd);
        writeAllFd(fd, "\n--- Recent Trace ---\n", 22);
        size_t start = (g_ringHead + kRingCap - g_ringCount) % kRingCap;
        for (size_t i = 0; i < g_ringCount; ++i) {
            const char* line = g_ring[(start + i) % kRingCap];
            size_t len = std::strlen(line);
            if (len > 0) { writeAllFd(fd, line, len); writeAllFd(fd, "\n", 1); }
        }
        close(fd);
    }
    touchFileC(g_unreadFlagPath);
}

void signalHandler(int sig) {
    char msg[64];
    std::snprintf(msg, sizeof(msg), "SIGNAL %d", sig);
    handleFatalSignalOrTerminate(msg);
    std::signal(sig, SIG_DFL);
    std::raise(sig);
}

void terminateHandler() {
    handleFatalSignalOrTerminate("std::terminate");
    std::abort();
}
} // namespace

namespace platform {

void CrashLogger::setAppSlug(const char* appSlug) {
    if (appSlug && appSlug[0]) {
        copyCStr(g_slug, sizeof(g_slug), appSlug);
    }
}

void CrashLogger::initEarly() {
    if (g_inited) return;
    g_inited = true;
    g_cleanMarked = false;

    const char* home = std::getenv("HOME");
    if (home && home[0]) {
        std::snprintf(g_logDir, sizeof(g_logDir), "%s/.%s_desktop_save/", home, g_slug);
    } else {
        copyCStr(g_logDir, sizeof(g_logDir), "./save/");
    }
    ensureDirC(g_logDir);

    joinPath(g_bootLogPath, sizeof(g_bootLogPath), g_logDir, "boot.log");
    joinPath(g_prevBootLogPath, sizeof(g_prevBootLogPath), g_logDir, "prev_boot.log");
    joinPath(g_lastCrashBootPath, sizeof(g_lastCrashBootPath), g_logDir, "last_crash_boot.log");
    joinPath(g_crashLogPath, sizeof(g_crashLogPath), g_logDir, "crash.log");
    joinPath(g_runningFlagPath, sizeof(g_runningFlagPath), g_logDir, ".running");
    joinPath(g_unreadFlagPath, sizeof(g_unreadFlagPath), g_logDir, ".crash_unread");

    const bool prevUnclean = fileExistsC(g_runningFlagPath);
    if (fileExistsC(g_bootLogPath)) {
        if (prevUnclean) copyFileC(g_bootLogPath, g_lastCrashBootPath);
        std::remove(g_prevBootLogPath);
        std::rename(g_bootLogPath, g_prevBootLogPath);
    }
    touchFileC(g_bootLogPath);
    touchFileC(g_runningFlagPath);

    std::signal(SIGABRT, signalHandler);
    std::signal(SIGSEGV, signalHandler);
    std::signal(SIGILL, signalHandler);
    std::signal(SIGFPE, signalHandler);
#ifdef SIGBUS
    std::signal(SIGBUS, signalHandler);
#endif
    std::set_terminate(terminateHandler);

    copyCStr(g_lastStage, sizeof(g_lastStage), "early_init");
    emitLogLine("[BOOT] === Desktop C++17 session start ===", true);
}

void CrashLogger::logEnvironmentInfo() {
    initEarly();
#ifdef __APPLE__
    copyCStr(g_envSummary, sizeof(g_envSummary), "Desktop Build (macOS / SDL2)");
#else
    copyCStr(g_envSummary, sizeof(g_envSummary), "Desktop Build (Linux/PC / SDL2)");
#endif
    logf("[ENV] %s", g_envSummary);
}

void CrashLogger::checkpoint(const char* stage, bool flushDisk) {
    if (!g_inited) initEarly();
    copyCStr(g_lastStage, sizeof(g_lastStage), stage ? stage : "?");
    char line[kLineCap];
    std::snprintf(line, sizeof(line), "[CHK] f=%" PRIu64 " %s", g_frameCount, g_lastStage);
    emitLogLine(line, flushDisk);
}

void CrashLogger::logf(const char* fmt, ...) {
    if (!g_inited) initEarly();
    char msg[kLineCap];
    va_list ap;
    va_start(ap, fmt);
    std::vsnprintf(msg, sizeof(msg), fmt ? fmt : "", ap);
    va_end(ap);
    emitLogLine(msg, true);
}

void CrashLogger::setGameState(int appState, int sceneId, int roomId, uint64_t frameCount) {
    g_appState = appState;
    g_sceneId = sceneId;
    g_roomId = roomId;
    g_frameCount = frameCount;
    if (appState != g_prevAppState || sceneId != g_prevSceneId || roomId != g_prevRoomId) {
        g_prevAppState = appState;
        g_prevSceneId = sceneId;
        g_prevRoomId = roomId;
        logf("[STATE] f=%" PRIu64 " app=%d scene=(%d,%d)", frameCount, appState, sceneId, roomId);
    }
}

void CrashLogger::markCleanExit() {
    if (!g_inited || g_cleanMarked) return;
    g_cleanMarked = true;
    emitLogLine("[EXIT] clean_shutdown", true);
    if (g_runningFlagPath[0]) std::remove(g_runningFlagPath);
}

bool CrashLogger::hasUnreadCrash() { return fileExistsC(g_unreadFlagPath); }

void CrashLogger::clearUnreadCrash(bool deleteFiles) {
    if (g_unreadFlagPath[0]) std::remove(g_unreadFlagPath);
    if (deleteFiles) {
        if (g_crashLogPath[0]) std::remove(g_crashLogPath);
        if (g_lastCrashBootPath[0]) std::remove(g_lastCrashBootPath);
    }
}

const char* CrashLogger::logDir() { return g_logDir[0] ? g_logDir : ""; }
std::string CrashLogger::environmentSummary() { return g_envSummary; }

std::vector<std::string> CrashLogger::loadViewerLines(bool prioritizeCrash) {
    std::vector<std::string> lines;
    lines.push_back(std::string("Log Dir: ") + logDir());
    lines.push_back(std::string("Env: ") + environmentSummary());
    if (prioritizeCrash && fileExistsC(g_crashLogPath)) {
        lines.push_back("--- crash.log ---");
        readFileLinesBounded(g_crashLogPath, lines, 8192);
    }
    if (fileExistsC(g_lastCrashBootPath)) {
        lines.push_back("--- last_crash_boot.log ---");
        readFileLinesBounded(g_lastCrashBootPath, lines, 6144);
    }
    if (fileExistsC(g_bootLogPath)) {
        lines.push_back("--- current boot.log ---");
        readFileLinesBounded(g_bootLogPath, lines, 6144);
    }
    return lines;
}

} // namespace platform
