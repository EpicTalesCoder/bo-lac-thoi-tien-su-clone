#pragma once

#include <cstdint>
#include <string>
#include <vector>

namespace platform {

enum class DisplayScaleMode : uint8_t {
    FHD_1920x1080 = 0,  // 1920x1080 Widescreen 16:9 (fills 1080p edge-to-edge)
    FHD_ASPECT_FIT = 1, // 1920x1080 window preserving exact original J2ME aspect ratio
    NATIVE_8X = 2       // Exact 8x scale of the original J2ME resolution (origW*8 x origH*8)
};

struct PortSettings {
    DisplayScaleMode scaleMode = DisplayScaleMode::FHD_1920x1080;
    bool fullscreen = false;       // F11 desktop fullscreen toggle
    bool highQuality = true;       // Visual parallax/weather effects
    uint8_t bgmVolume = 3;         // 0..5 -> {0, 20, 40, 60, 80, 100}%
    bool showPrompts = true;       // Desktop keyboard/keypad hint bar
    uint8_t speedMultiplier = 1;   // 1, 2, 4, 8
    bool smooth60Fps = true;       // 60 FPS sub-tick interpolation
    bool showFps = false;          // On-screen FPS badge
    bool numpadMirrorDpad = false; // Optional: mirror KP 2/4/6/8/5 -> D-Pad/FIRE if game ignores raw '2','4','6','8'
};

inline uint8_t sanitizeSpeedMultiplier(uint8_t v) {
    return (v == 1 || v == 2 || v == 4 || v == 8) ? v : 1;
}

inline uint8_t stepSpeedMultiplier(uint8_t current, int delta) {
    static constexpr uint8_t kSpeeds[4] = {1, 2, 4, 8};
    int idx = 0;
    for (int i = 0; i < 4; ++i) {
        if (kSpeeds[i] == current) {
            idx = i;
            break;
        }
    }
    int next = (idx + (delta % 4) + 4) % 4;
    return kSpeeds[next];
}

inline DisplayScaleMode stepDisplayScaleMode(DisplayScaleMode current, int delta = 1) {
    int idx = static_cast<int>(current);
    int next = (idx + (delta % 3) + 3) % 3;
    return static_cast<DisplayScaleMode>(next);
}

class SaveSystem {
public:
    static bool hasRecordStore(const std::string& storeName);
    static bool loadRecord(const std::string& storeName, int recordId, std::vector<uint8_t>& out);
    static bool saveRecord(const std::string& storeName, int recordId, const std::vector<uint8_t>& data);
    static int getNumRecords(const std::string& storeName);
    static bool deleteRecordStore(const std::string& storeName);

    static PortSettings loadSettings();
    static bool saveSettings(const PortSettings& settings);
};

} // namespace platform
