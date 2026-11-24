#include "engine/GraphicsContext.hpp"
#include "engine/Types.hpp"
#include "game/GameEngine.hpp"
#include "platform/InputSystem.hpp"
#include "platform/Platform.hpp"
#include "platform/RenderSystem.hpp"
#include "platform/SaveSystem.hpp"

#include <cassert>
#include <cstdio>
#include <vector>

static void stepFrames(game::GameEngine& g, engine::GraphicsContext& gfx, int count) {
    for (int i = 0; i < count; ++i) {
        g.tick();
        g.interpValid = true;
        g.render(gfx, 0.5f, true);
    }
}

static void tapKey(game::GameEngine& g, engine::GraphicsContext& gfx, int32_t jkey, int wait = 2) {
    g.onKeyPressed(jkey);
    g.tick();
    g.render(gfx, 1.0f, false);
    g.onKeyReleased(jkey);
    stepFrames(g, gfx, wait);
}

int main() {
    std::setvbuf(stdout, nullptr, _IONBF, 0);
    assert(platform::init("ancient_empires_2_qa"));
    engine::GraphicsContext::initSystemFonts();

    // 1. Display scale math for 240x320
    platform::RenderSystem::setOriginalResolution(240, 320);
    assert(platform::RenderSystem::originalWidth() == 240);
    assert(platform::RenderSystem::originalHeight() == 320);
    assert(platform::RenderSystem::gameCanvasWidth(platform::DisplayScaleMode::FHD_1920x1080) == 568);
    assert(platform::RenderSystem::gameCanvasWidth(platform::DisplayScaleMode::FHD_ASPECT_FIT) == 240);
    assert(platform::RenderSystem::gameCanvasWidth(platform::DisplayScaleMode::NATIVE_8X) == 240);
    assert(platform::RenderSystem::gameCanvasHeight() == 320);

    // 2. floorDiv16 & lerpCoordRound
    assert(engine::floorDiv16(-1) == -1);
    assert(engine::floorDiv16(-16) == -1);
    assert(engine::floorDiv16(-17) == -2);
    assert(engine::lerpCoordRound(0, 24, 0.5f, true) == 12);
    assert(engine::lerpCoordRound(0, 200, 0.5f, true) == 200);

    // 3. Boot GameEngine in 16:9 568x320
    std::vector<uint32_t> fb(568 * 320, 0xFF000000u);
    engine::GraphicsContext gfx(fb.data(), 568, 320);
    game::GameEngine game;
    assert(game.init(568, 320));
    std::printf("Boot OK: strings loaded, 1.pak loaded, units.bin loaded\n");

    // Intro -> Main Menu
    stepFrames(game, gfx, 65);
    assert(game.appState == 2);
    assert(game.activePanel != nullptr);
    std::printf("Main Menu OK\n");

    // 4. Test all 8 Campaign missions
    for (int m = 0; m < 8; ++m) {
        game.startNewCampaign(m);
        assert(game.appState == 1);
        assert(game.mapW > 0 && game.mapH > 0);
        assert(!game.units.empty());
        stepFrames(game, gfx, 5);
        tapKey(game, gfx, -5, 2); // dismiss intro banner
    }
    std::printf("All 8 Campaign missions (m0..m7) loaded & rendered OK\n");

    // 5. Test all 12 Skirmish maps
    for (int s = 0; s < 12; ++s) {
        game.selectedSkirmishMap = s;
        game.startSkirmishMatch();
        assert(game.appState == 1);
        assert(game.mapW > 0 && game.mapH > 0);
        assert(!game.units.empty());
        stepFrames(game, gfx, 5);
        tapKey(game, gfx, -5, 2); // dismiss banner
    }
    std::printf("All 12 Skirmish maps (s0..s11) loaded & rendered OK\n");

    // 6. Test Campaign 0 gameplay: open Minimap (key '0' = 48), close (-7), open In-game menu (-7), Save & Reload
    game.startNewCampaign(0);
    tapKey(game, gfx, -5, 2); // close mission banner
    tapKey(game, gfx, 48, 2); // '0' -> Minimap
    assert(game.activePanel != nullptr && game.activePanel->panelType == 8);
    tapKey(game, gfx, -7, 2); // RSK close minimap
    assert(game.activePanel == nullptr);

    // Move cursor & test phone keypad codes
    tapKey(game, gfx, 54, 2); // '6' -> RIGHT
    tapKey(game, gfx, 50, 2); // '2' -> UP
    tapKey(game, gfx, 52, 2); // '4' -> LEFT
    tapKey(game, gfx, 56, 2); // '8' -> DOWN

    // Save & Load
    assert(game.saveCurrentGame());
    assert(game.hasSavedGame());
    assert(game.loadSavedGame());
    platform::SaveSystem::deleteRecordStore("ae2_save");
    std::printf("Minimap, keypad, and Save/Load OK\n");

    // 7. Test Battle animation (both sides)
    game.startNewCampaign(0);
    tapKey(game, gfx, -5, 2);
    game::Unit* p0 = nullptr;
    game::Unit* p1 = nullptr;
    for (const auto& u : game.units) {
        if (u->player == 0 && !p0) p0 = u.get();
        if (u->player == 1 && !p1) p1 = u.get();
    }
    assert(p0 && p1);
    int minR = game::Unit::sMinRange[static_cast<size_t>(p0->unitType)];
    p1->setGridPos(p0->gridX + minR, p0->gridY);
    game.optFightAnim = true;
    game.onPanelAction(nullptr, 0, "", 1);
    // Select p0, move in place, attack p1
    game.setCursorGrid(p0->gridX, p0->gridY);
    tapKey(game, gfx, -5, 2); // select unit
    tapKey(game, gfx, -5, 30); // confirm same tile -> action wheel (opens)
    assert(game.activePanel != nullptr && game.activePanel->panelType == 0);
    assert(game.activePanel->state == 2);
    tapKey(game, gfx, -5, 2); // select ATTACK
    assert(game.playState == 3);
    tapKey(game, gfx, -5, 10); // start battle
    assert(game.playState == 10);
    stepFrames(game, gfx, 60); // animate battle
    std::printf("Split-screen Battle Animation OK (playState=%d)\n", (int)game.playState);

    game.shutdown();
    engine::GraphicsContext::shutdownSystemFonts();
    platform::shutdown();
    std::printf("ALL ANCIENT EMPIRES II QA TESTS PASSED!\n");
    return 0;
}
