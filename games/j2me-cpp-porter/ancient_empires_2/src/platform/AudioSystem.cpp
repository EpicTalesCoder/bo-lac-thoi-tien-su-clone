#include "platform/AudioSystem.hpp"
#include "platform/CrashLogger.hpp"
#include "platform/Platform.hpp"

#include <SDL_mixer.h>
#include <cstdio>
#include <string>

namespace platform {

namespace {
bool g_audioReady = false;
Mix_Music* g_music = nullptr;
int g_currentTrack = -1;
uint8_t g_volLevel = 3; // default 60%
constexpr int kLevels[6] = {0, 20, 40, 60, 80, 100};
} // namespace

bool AudioSystem::init() {
    if (Mix_Init(MIX_INIT_OGG | MIX_INIT_MID) == 0) {
        CrashLogger::logf("[WARN] Mix_Init warning: %s", Mix_GetError());
    }
    if (Mix_OpenAudio(44100, MIX_DEFAULT_FORMAT, 2, 2048) < 0) {
        CrashLogger::logf("[WARN] Mix_OpenAudio failed: %s", Mix_GetError());
        return false;
    }
    g_audioReady = true;
    setVolumeLevel(g_volLevel);
    return true;
}

void AudioSystem::shutdown() {
    stopBgm();
    if (g_audioReady) {
        Mix_CloseAudio();
        Mix_Quit();
        g_audioReady = false;
    }
}

void AudioSystem::playBgm(int trackId, int loopCount) {
    if (!g_audioReady) return;
    if (trackId < 0) {
        stopBgm();
        return;
    }
    if (g_volLevel == 0) {
        g_currentTrack = trackId;
        return;
    }
    if (g_currentTrack == trackId && g_music && Mix_PlayingMusic()) {
        return;
    }
    stopBgm();
    std::string path = resolveRomfsPath("bgm/" + std::to_string(trackId) + ".ogg");
    if (!fileExists(path)) {
        path = resolveRomfsPath("bgm/" + std::to_string(trackId) + ".mid");
    }
    g_music = Mix_LoadMUS(path.c_str());
    if (!g_music) {
        std::fprintf(stderr, "Mix_LoadMUS(%s) failed: %s\n", path.c_str(), Mix_GetError());
        return;
    }
    g_currentTrack = trackId;
    Mix_VolumeMusic((kLevels[g_volLevel] * MIX_MAX_VOLUME) / 100);
    Mix_PlayMusic(g_music, loopCount);
}

void AudioSystem::stopBgm() {
    if (g_music) {
        Mix_HaltMusic();
        Mix_FreeMusic(g_music);
        g_music = nullptr;
    }
    g_currentTrack = -1;
}

void AudioSystem::pauseAll() {
    if (g_audioReady && Mix_PlayingMusic()) {
        Mix_PauseMusic();
    }
}

void AudioSystem::resumeAll() {
    if (g_audioReady && Mix_PausedMusic()) {
        Mix_ResumeMusic();
    }
}

void AudioSystem::setVolumeLevel(uint8_t level0to5) {
    if (level0to5 > 5) level0to5 = 5;
    g_volLevel = level0to5;
    if (!g_audioReady) return;
    int vol = (kLevels[g_volLevel] * MIX_MAX_VOLUME) / 100;
    Mix_VolumeMusic(vol);
    if (g_volLevel == 0) {
        if (Mix_PlayingMusic()) Mix_PauseMusic();
    } else if (g_currentTrack >= 0) {
        if (!g_music) {
            int t = g_currentTrack;
            g_currentTrack = -1;
            playBgm(t, -1);
        } else if (Mix_PausedMusic()) {
            Mix_ResumeMusic();
        }
    }
}

uint8_t AudioSystem::getVolumeLevel() { return g_volLevel; }
int AudioSystem::currentTrack() { return g_currentTrack; }

} // namespace platform
