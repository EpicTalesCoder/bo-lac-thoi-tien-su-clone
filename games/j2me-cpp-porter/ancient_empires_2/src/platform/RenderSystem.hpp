#pragma once

#include "platform/SaveSystem.hpp"
#include <cstdint>
#include <string>
#include <vector>

struct SDL_Renderer;

namespace platform {

struct PromptItem {
    std::string key;
    std::string label;
};

struct PauseMenuState {
    bool open = false;
    int selected = 0;
    bool inKeypadGuide = false;
};

struct OverlayMenuRow {
    std::string label;
    std::string value;
    bool adjustable = false;
    bool highlight = false;
};

struct OverlayMenuView {
    bool open = false;
    std::string title;
    std::vector<std::string> tabs;
    int activeTab = 0;
    std::vector<OverlayMenuRow> rows;
    int selectedRow = 0;
    int scrollTop = 0;
    std::string statusBanner;
    std::string footerHint;
};

class RenderSystem {
public:
    /// Call before init() so both 1920x1080 widescreen and exact 8x original scaling match the J2ME game.
    static void setOriginalResolution(int origW, int origH);
    static int originalWidth();
    static int originalHeight();

    static bool init(const PortSettings& settings = PortSettings{}, const char* windowTitle = "J2ME C++17 Desktop Port");
    static void shutdown();

    static void applyDisplaySettings(const PortSettings& settings);
    static int outputWidth();
    static int outputHeight();
    static int gameCanvasWidth(DisplayScaleMode mode);
    static int gameCanvasHeight();

    static void beginFrame();
    static void drawGameFramebuffer(const uint32_t* argbPixels, int w, int h, DisplayScaleMode mode);
    static void drawHudPrompts(const std::vector<PromptItem>& prompts);
    static void drawSpeedBadge(uint8_t speedMultiplier);
    static void drawFpsCounter(float fps, bool smooth60Fps);
    static void drawOverlayView(const OverlayMenuView& view);
    static void drawPauseOverlay(const PauseMenuState& menu, const PortSettings& settings);
    /// Interactive log/crash viewer; returns false if the user chose to quit.
    static bool runLogViewer(const PortSettings& settings, const std::string& title, bool isCrashPrompt);
    static void endFrame();

    static bool windowToGameCoords(int winX, int winY, int& gameX, int& gameY);
    static SDL_Renderer* renderer();
};

} // namespace platform
