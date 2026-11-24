#pragma once

#include "platform/SaveSystem.hpp"
#include <cstdint>
#include <vector>

union SDL_Event;

namespace platform {

enum class Action : uint8_t {
    UP = 0,
    DOWN,
    LEFT,
    RIGHT,
    FIRE,       // J2ME -5 (Enter / Space / J)
    LSK,        // J2ME -6 (Q / [ / Tab)
    RSK,        // J2ME -7 (E / ] / Backspace)
    PAUSE,      // Esc / F1 -> Desktop Port Settings Overlay
    SPEED,      // F2 -> Speed x1..x8
    CHEAT,      // F3 -> Cheat / Debug Overlay
    SCALE_MODE, // F4 -> Cycle 1920x1080 Wide / 1920x1080 Aspect / x8 Native
    FULLSCREEN, // F11 -> Toggle Desktop Fullscreen
    TOGGLE_FPS, // F12 -> Toggle FPS Counter
    COUNT
};

struct KeyEvent {
    int32_t j2meKeyCode;
    bool pressed;
};

struct PointerEvent {
    int x;
    int y;
    bool pressed;
};

class InputSystem {
public:
    static bool init();
    static void shutdown();

    static void beginFrame();
    static void handleSdlEvent(const SDL_Event& ev);
    static void update(const PortSettings& settings, uint64_t nowMs);

    static bool isHeld(Action a);
    static bool justPressed(Action a);
    static bool justReleased(Action a);
    static bool isRepeated(Action a); // true on press edge and auto-repeat ticks

    static bool isJ2meKeyHeld(int32_t keyCode);
    static bool justPressedJ2meKey(int32_t keyCode);

    static const std::vector<KeyEvent>& pollJ2meKeyEvents();
    static const std::vector<PointerEvent>& pollPointerEvents();

    /// Clear event queues on overlay toggle without wiping held-key tracking (avoids bogus next-frame presses).
    static void clearQueues();
    /// Wipe all held, previous, repeat, and queued states; call ONLY on window focus loss or log-viewer exit.
    static void resetAllState();

    static const char* actionName(Action a);
    static const char* j2meKeyLabel(int32_t keyCode);
};

} // namespace platform
