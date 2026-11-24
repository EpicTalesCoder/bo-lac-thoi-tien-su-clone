#pragma once

#include <cstdint>

namespace platform {

class AudioSystem {
public:
    static bool init();
    static void shutdown();

    static void playBgm(int trackId, int loopCount = -1);
    static void stopBgm();
    static void pauseAll();
    static void resumeAll();
    static void setVolumeLevel(uint8_t level0to5); // Maps {0,20,40,60,80,100}%
    static uint8_t getVolumeLevel();
    static int currentTrack();
};

} // namespace platform
