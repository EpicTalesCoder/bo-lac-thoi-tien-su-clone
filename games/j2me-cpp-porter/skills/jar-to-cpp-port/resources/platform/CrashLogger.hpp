#pragma once

#include <cstdint>
#include <string>
#include <vector>

namespace platform {

/**
 * Persistent boot-stage tracing and POSIX desktop crash reporter.
 * Stores logs inside $HOME/.<app_slug>_desktop_save/.
 */
class CrashLogger {
public:
    static void setAppSlug(const char* appSlug);
    static void initEarly();
    static void checkpoint(const char* stage, bool flushDisk = true);
    static void logf(const char* fmt, ...);
    static void setGameState(int appState, int sceneId, int roomId, uint64_t frameCount);
    static void logEnvironmentInfo();
    static void markCleanExit();
    static bool hasUnreadCrash();
    static void clearUnreadCrash(bool deleteFiles = false);
    static const char* logDir();
    static std::string environmentSummary();
    static std::vector<std::string> loadViewerLines(bool prioritizeCrash);
};

} // namespace platform
