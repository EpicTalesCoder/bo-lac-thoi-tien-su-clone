#include "engine/GraphicsContext.hpp"
#include "game/GameEngine.hpp"
#include "platform/AudioSystem.hpp"
#include "platform/CrashLogger.hpp"
#include "platform/InputSystem.hpp"
#include "platform/Platform.hpp"
#include "platform/RenderSystem.hpp"
#include "platform/SaveSystem.hpp"

#include <SDL.h>
#include <algorithm>
#include <vector>

namespace {

enum class CheatTab {
    ACTIONS = 0,
    MISSIONS = 1
};

void buildCheatOverlay(platform::OverlayMenuView& view, game::GameEngine& game, int tab, int row) {
    view.open = true;
    view.title = "Ancient Empires II - Debug / Cheat (F3)";
    view.tabs = {"Quick Cheats", "Jump Mission"};
    view.activeTab = std::clamp(tab, 0, 1);
    view.rows.clear();
    if (view.activeTab == 0) {
        view.rows.push_back({"Add +1000 Gold", std::to_string(game.playerGold[game.currentPlayer]), false, true});
        view.rows.push_back({"Heal All Friendly Units", "100 HP", false, false});
        view.rows.push_back({"Refresh Friendly Turns", "Ready", false, false});
        view.rows.push_back({"Unlock All 8 Missions", std::to_string(game.maxCampaignUnlocked + 1) + "/8", false, false});
    } else {
        for (int i = 0; i < 8; ++i) {
            view.rows.push_back({"Campaign Mission " + std::to_string(i + 1), game::Lang::get(121 + i), false, i == game.missionIdx});
        }
    }
    int maxRow = std::max(0, static_cast<int>(view.rows.size()) - 1);
    view.selectedRow = std::clamp(row, 0, maxRow);
    view.scrollTop = std::max(0, view.selectedRow - 5);
    view.footerHint = "Up/Down: Select | Left/Right: Tab | Enter: Apply | F3/Esc: Close";
}

} // namespace

int main(int /*argc*/, char** /*argv*/) {
    if (!platform::init("ancient_empires_2")) {
        return 1;
    }

    platform::PortSettings settings = platform::SaveSystem::loadSettings();
    platform::RenderSystem::setOriginalResolution(240, 320);
    if (!platform::RenderSystem::init(settings, "Ancient Empires II")) {
        platform::shutdown();
        return 1;
    }
    platform::InputSystem::init();
    platform::AudioSystem::init();
    platform::AudioSystem::setVolumeLevel(settings.bgmVolume);
    engine::GraphicsContext::initSystemFonts();

    int canvasW = platform::RenderSystem::gameCanvasWidth(settings.scaleMode);
    int canvasH = platform::RenderSystem::gameCanvasHeight();

    game::GameEngine game;
    if (!game.init(canvasW, canvasH)) {
        platform::CrashLogger::logf("[ERR] GameEngine::init failed");
        engine::GraphicsContext::shutdownSystemFonts();
        platform::AudioSystem::shutdown();
        platform::InputSystem::shutdown();
        platform::RenderSystem::shutdown();
        platform::shutdown();
        return 1;
    }

    std::vector<uint32_t> framebuffer(static_cast<size_t>(canvasW) * canvasH, 0xFF000000u);
    engine::GraphicsContext gfx(framebuffer.data(), canvasW, canvasH);

    platform::PauseMenuState pauseMenu{};
    platform::OverlayMenuView cheatView{};
    int cheatTab = 0;
    int cheatRow = 0;

    const uint64_t perfFreq = std::max<uint64_t>(1, SDL_GetPerformanceFrequency());
    uint64_t lastCounter = SDL_GetPerformanceCounter();
    uint64_t accumulatorUs = 0;
    uint64_t fpsTimerUs = 0;
    int fpsFrames = 0;
    float currentFps = 60.0f;

    constexpr uint64_t kFixedStepUs = 65000ULL; // 65ms J2ME tick

    bool running = true;
    while (running) {
        uint64_t nowCounter = SDL_GetPerformanceCounter();
        uint64_t dtUs = ((nowCounter - lastCounter) * 1000000ULL) / perfFreq;
        lastCounter = nowCounter;
        if (dtUs > 250000ULL) dtUs = 250000ULL;

        platform::InputSystem::beginFrame();
        SDL_Event ev;
        while (SDL_PollEvent(&ev)) {
            if (ev.type == SDL_QUIT) {
                running = false;
            } else if (ev.type == SDL_WINDOWEVENT) {
                if (ev.window.event == SDL_WINDOWEVENT_FOCUS_LOST ||
                    ev.window.event == SDL_WINDOWEVENT_MINIMIZED ||
                    ev.window.event == SDL_WINDOWEVENT_HIDDEN) {
                    platform::InputSystem::resetAllState();
                    game.clearHeldInputs();
                }
            }
            platform::InputSystem::handleSdlEvent(ev);
        }

        uint64_t nowMs = platform::getTicksMs();
        platform::InputSystem::update(settings, nowMs);

        // System hotkeys
        if (platform::InputSystem::justPressed(platform::Action::FULLSCREEN)) {
            settings.fullscreen = !settings.fullscreen;
            platform::RenderSystem::applyDisplaySettings(settings);
            platform::SaveSystem::saveSettings(settings);
        }
        if (platform::InputSystem::justPressed(platform::Action::SCALE_MODE)) {
            settings.scaleMode = platform::stepDisplayScaleMode(settings.scaleMode, 1);
            platform::RenderSystem::applyDisplaySettings(settings);
            platform::SaveSystem::saveSettings(settings);
            int nw = platform::RenderSystem::gameCanvasWidth(settings.scaleMode);
            int nh = platform::RenderSystem::gameCanvasHeight();
            if (nw != canvasW || nh != canvasH) {
                canvasW = nw;
                canvasH = nh;
                framebuffer.assign(static_cast<size_t>(canvasW) * canvasH, 0xFF000000u);
                gfx.setTarget(framebuffer.data(), canvasW, canvasH);
                game.resize(canvasW, canvasH);
            }
        }
        if (platform::InputSystem::justPressed(platform::Action::TOGGLE_FPS)) {
            settings.showFps = !settings.showFps;
            platform::SaveSystem::saveSettings(settings);
        }
        if (platform::InputSystem::justPressed(platform::Action::SPEED)) {
            settings.speedMultiplier = platform::stepSpeedMultiplier(settings.speedMultiplier, 1);
            platform::SaveSystem::saveSettings(settings);
        }
        if (platform::InputSystem::justPressed(platform::Action::PAUSE)) {
            if (cheatView.open) {
                cheatView.open = false;
            } else {
                pauseMenu.open = !pauseMenu.open;
                pauseMenu.inKeypadGuide = false;
            }
            platform::InputSystem::clearQueues();
            game.clearHeldInputs();
        }
        if (platform::InputSystem::justPressed(platform::Action::CHEAT)) {
            if (!pauseMenu.open) {
                cheatView.open = !cheatView.open;
                if (cheatView.open) buildCheatOverlay(cheatView, game, cheatTab, cheatRow);
                platform::InputSystem::clearQueues();
                game.clearHeldInputs();
            }
        }

        if (pauseMenu.open) {
            if (pauseMenu.inKeypadGuide) {
                if (platform::InputSystem::justPressed(platform::Action::FIRE) ||
                    platform::InputSystem::justPressed(platform::Action::RSK)) {
                    pauseMenu.inKeypadGuide = false;
                }
            } else {
                if (platform::InputSystem::justPressed(platform::Action::UP)) {
                    pauseMenu.selected = (pauseMenu.selected + 7) % 8;
                } else if (platform::InputSystem::justPressed(platform::Action::DOWN)) {
                    pauseMenu.selected = (pauseMenu.selected + 1) % 8;
                } else if (platform::InputSystem::justPressed(platform::Action::LEFT) ||
                           platform::InputSystem::justPressed(platform::Action::RIGHT) ||
                           platform::InputSystem::justPressed(platform::Action::FIRE)) {
                    int dir = platform::InputSystem::justPressed(platform::Action::LEFT) ? -1 : 1;
                    switch (pauseMenu.selected) {
                        case 0:
                            settings.scaleMode = platform::stepDisplayScaleMode(settings.scaleMode, dir);
                            platform::RenderSystem::applyDisplaySettings(settings);
                            {
                                int nw = platform::RenderSystem::gameCanvasWidth(settings.scaleMode);
                                int nh = platform::RenderSystem::gameCanvasHeight();
                                if (nw != canvasW || nh != canvasH) {
                                    canvasW = nw;
                                    canvasH = nh;
                                    framebuffer.assign(static_cast<size_t>(canvasW) * canvasH, 0xFF000000u);
                                    gfx.setTarget(framebuffer.data(), canvasW, canvasH);
                                    game.resize(canvasW, canvasH);
                                }
                            }
                            break;
                        case 1:
                            settings.fullscreen = !settings.fullscreen;
                            platform::RenderSystem::applyDisplaySettings(settings);
                            break;
                        case 2:
                            settings.bgmVolume = static_cast<uint8_t>((settings.bgmVolume + (dir > 0 ? 1 : 5)) % 6);
                            platform::AudioSystem::setVolumeLevel(settings.bgmVolume);
                            break;
                        case 3:
                            settings.highQuality = !settings.highQuality;
                            break;
                        case 4:
                            settings.smooth60Fps = !settings.smooth60Fps;
                            break;
                        case 5:
                            settings.showPrompts = !settings.showPrompts;
                            break;
                        case 6:
                            pauseMenu.inKeypadGuide = true;
                            break;
                        case 7:
                            pauseMenu.open = false;
                            break;
                    }
                    platform::SaveSystem::saveSettings(settings);
                } else if (platform::InputSystem::justPressed(platform::Action::RSK)) {
                    pauseMenu.open = false;
                }
            }
            platform::InputSystem::clearQueues();
        } else if (cheatView.open) {
            if (platform::InputSystem::justPressed(platform::Action::LEFT) ||
                platform::InputSystem::justPressed(platform::Action::RIGHT)) {
                cheatTab = 1 - cheatTab;
                cheatRow = 0;
                buildCheatOverlay(cheatView, game, cheatTab, cheatRow);
            } else if (platform::InputSystem::justPressed(platform::Action::UP)) {
                int n = std::max(1, static_cast<int>(cheatView.rows.size()));
                cheatRow = (cheatRow + n - 1) % n;
                buildCheatOverlay(cheatView, game, cheatTab, cheatRow);
            } else if (platform::InputSystem::justPressed(platform::Action::DOWN)) {
                int n = std::max(1, static_cast<int>(cheatView.rows.size()));
                cheatRow = (cheatRow + 1) % n;
                buildCheatOverlay(cheatView, game, cheatTab, cheatRow);
            } else if (platform::InputSystem::justPressed(platform::Action::FIRE)) {
                if (cheatTab == 0) {
                    if (cheatRow == 0) game.playerGold[game.currentPlayer] += 1000;
                    else if (cheatRow == 1) {
                        for (auto& u : game.units) {
                            if (u->player == game.currentPlayer && u->state != 3) u->hp = 100;
                        }
                    } else if (cheatRow == 2) {
                        for (auto& u : game.units) {
                            if (u->player == game.currentPlayer && u->state == 2) u->state = 0;
                        }
                    } else if (cheatRow == 3) {
                        game.maxCampaignUnlocked = 7;
                        game.saveSettingsRecord();
                    }
                    cheatView.statusBanner = "Cheat applied!";
                    buildCheatOverlay(cheatView, game, cheatTab, cheatRow);
                } else {
                    cheatView.open = false;
                    game.startNewCampaign(cheatRow);
                }
            } else if (platform::InputSystem::justPressed(platform::Action::RSK)) {
                cheatView.open = false;
            }
            platform::InputSystem::clearQueues();
        } else {
            // Route J2ME keypad events directly to GameEngine
            for (const auto& kev : platform::InputSystem::pollJ2meKeyEvents()) {
                if (kev.pressed) game.onKeyPressed(kev.j2meKeyCode);
                else game.onKeyReleased(kev.j2meKeyCode);
            }
            platform::InputSystem::clearQueues();

            accumulatorUs += dtUs * settings.speedMultiplier;
            int ranTicks = 0;
            while (accumulatorUs >= kFixedStepUs && ranTicks < 6) {
                game.tick();
                game.interpValid = true;
                accumulatorUs -= kFixedStepUs;
                ++ranTicks;
            }
        }

        float renderAlpha = (settings.smooth60Fps && settings.speedMultiplier == 1)
                                ? std::clamp(static_cast<float>(accumulatorUs) / static_cast<float>(kFixedStepUs), 0.0f, 1.0f)
                                : 1.0f;

        game.render(gfx, renderAlpha, settings.smooth60Fps && settings.speedMultiplier == 1);

        platform::RenderSystem::beginFrame();
        platform::RenderSystem::drawGameFramebuffer(framebuffer.data(), canvasW, canvasH, settings.scaleMode);
        if (settings.showPrompts && !pauseMenu.open && !cheatView.open) {
            platform::RenderSystem::drawHudPrompts({
                {"Arrows/WASD", "Move"},
                {"Enter/5", "OK"},
                {"Q/E", "LSK/RSK"},
                {"0", "Map"},
                {"F4", "1080p/8x"},
                {"Esc", "Menu"}
            });
        }
        platform::RenderSystem::drawSpeedBadge(settings.speedMultiplier);
        if (settings.showFps) {
            platform::RenderSystem::drawFpsCounter(currentFps, settings.smooth60Fps);
        }
        if (cheatView.open) {
            platform::RenderSystem::drawOverlayView(cheatView);
        }
        if (pauseMenu.open) {
            platform::RenderSystem::drawPauseOverlay(pauseMenu, settings);
        }
        platform::RenderSystem::endFrame();

        ++fpsFrames;
        fpsTimerUs += dtUs;
        if (fpsTimerUs >= 500000ULL) {
            currentFps = static_cast<float>(fpsFrames) * 1000000.0f / static_cast<float>(fpsTimerUs);
            fpsFrames = 0;
            fpsTimerUs = 0;
        }
    }

    game.shutdown();
    engine::GraphicsContext::shutdownSystemFonts();
    platform::AudioSystem::shutdown();
    platform::InputSystem::shutdown();
    platform::RenderSystem::shutdown();
    platform::shutdown();
    return 0;
}
