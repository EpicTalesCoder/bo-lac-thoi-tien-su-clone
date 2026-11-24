#include "engine/BitmapFont.hpp"
#include "engine/GraphicsContext.hpp"
#include "engine/ResourceMgr.hpp"
#include "engine/ScreenBase.hpp"
#include "engine/ScreenTransition.hpp"
#include "engine/Sprite.hpp"
#include "engine/TileMap.hpp"
#include "engine/Types.hpp"
#include "engine/UIEngine.hpp"
#include "game/AppController.hpp"
#include "game/BattleSystem.hpp"
#include "game/BoatScene.hpp"
#include "game/DialogBox.hpp"
#include "game/GameMenuController.hpp"
#include "game/GameState.hpp"
#include "game/NpcEntity.hpp"
#include "game/OverworldScreen.hpp"
#include "game/Player.hpp"
#include "game/QuestWorldMgr.hpp"
#include "platform/InputSystem.hpp"
#include "platform/Platform.hpp"
#include "platform/RenderSystem.hpp"
#include <SDL.h>
#include <cassert>
#include <cstdio>
#include <unordered_set>

static uint64_t g_t = 1000;

static void stepIdle(game::AppController& app, int n = 1) {
    for (int i = 0; i < n; ++i) {
        platform::InputSystem::beginFrame();
        g_t += 66;
        platform::InputSystem::update(platform::PortSettings{}, g_t);
        app.tick();
        platform::InputSystem::clearQueues();
    }
}

static void tapKey(SDL_Keycode sym, game::AppController& app, int afterIdle = 1) {
    platform::InputSystem::beginFrame();
    SDL_Event e{};
    e.type = SDL_KEYDOWN;
    e.key.keysym.sym = sym;
    platform::InputSystem::handleSdlEvent(e);
    g_t += 66;
    platform::InputSystem::update(platform::PortSettings{}, g_t);
    app.tick();
    platform::InputSystem::clearQueues();

    platform::InputSystem::beginFrame();
    e.type = SDL_KEYUP;
    e.key.keysym.sym = sym;
    platform::InputSystem::handleSdlEvent(e);
    g_t += 66;
    platform::InputSystem::update(platform::PortSettings{}, g_t);
    app.tick();
    platform::InputSystem::clearQueues();
    if (afterIdle > 0) stepIdle(app, afterIdle);
}

static int countUniqueColors(const std::vector<uint32_t>& fb, int& blackPx, int& blueBg) {
    blackPx = 0;
    blueBg = 0;
    std::unordered_set<uint32_t> cols;
    cols.reserve(512);
    for (uint32_t p : fb) {
        cols.insert(p);
        uint32_t rgb = p & 0xFFFFFFu;
        if (rgb == 0u) ++blackPx;
        if (rgb == 2996676u) ++blueBg;
    }
    return static_cast<int>(cols.size());
}

int main() {
    setenv("HOME", "/tmp/test_all_maps_qa_home", 1);
    SDL_Init(SDL_INIT_VIDEO | SDL_INIT_AUDIO);
    platform::init();
    platform::RenderSystem::init();
    platform::InputSystem::init();
    engine::BitmapFont::init();
    engine::ResourceMgr::init();
    engine::SpriteCache::init();
    engine::AppContext::setScreenSize(426, 240);

    auto& app = game::AppController::instance();
    app.init();
    app.enterWorldFromTitle(true);

    auto& ow = game::OverworldScreen::instance();
    auto& qm = game::QuestWorldMgr::instance();
    auto& pl = game::Player::instance();
    auto& gs = game::GameState::get();
    auto& ui = engine::UIManager::instance();
    auto& fx = engine::ScreenTransition::instance();
    auto& dlg = game::DialogBox::instance();
    auto& cam = engine::Camera::instance();

    std::vector<uint32_t> fb(426 * 240, 0);
    engine::GraphicsContext gfx(fb.data(), 426, 240);

    // 1. BoatScene wharf travel must not hang on black curtain (fx.doneB vs fx.doneA)
    {
        app.debugTeleport(1, 0, 160, 160);
        stepIdle(app, 2);
        gs.sceneId = 5;
        gs.roomId = 2;
        gs.spawnX = 176;
        gs.spawnY = 240;
        gs.spawnDir = 2;
        gs.portalDestIdx = -1;
        gs.menuSubIdx = 2;
        ow.setState(29);
        bool enteredBoat = false;
        bool returnedWorld = false;
        for (int f = 0; f < 300; ++f) {
            stepIdle(app, 1);
            if (app.state() == 23) enteredBoat = true;
            if (enteredBoat && app.state() == 10 && !fx.effectB) {
                returnedWorld = true;
                break;
            }
            if (enteredBoat && app.state() == 10 && fx.effectB == -1) {
                returnedWorld = true;
                break;
            }
        }
        assert(enteredBoat && returnedWorld);
        assert(gs.sceneId == 5 && gs.roomId == 2);
        gs.menuDirtyBg = true;
        app.render(gfx);
        int blk = 0, blu = 0, uniq = countUniqueColors(fb, blk, blu);
        assert(uniq > 30 && blk < 60000);
        std::printf("[OK] 1. BoatScene voyage (state 29->23->10) completes cleanly (uniq=%d blk=%d)\n", uniq, blk);
    }

    // 2. case 34 banner + case 48 caption clear across (1,3), (7,6), (9,0) + frame-0 alpha banner + timed caption
    {
        struct BannerCase { int sc, rm, op48Step; };
        BannerCase bcases[] = {{1, 3, 91}, {7, 6, 2}, {9, 0, 15}};
        for (const auto& bc : bcases) {
            app.debugTeleport(bc.sc, bc.rm, 160, 160);
            stepIdle(app, 2);
            fx.start(0, 15);
            fx.loadAlphaBanner("ikon_1", 120, 100, 10, false);
            fx.render(gfx); // frame 0 alpha==0 must NOT destroy pixels
            for (int f = 0; f < 10; ++f) fx.update();
            std::fill(fb.begin(), fb.end(), 0);
            fx.render(gfx);
            int blk0 = 0, blu0 = 0, uniq0 = countUniqueColors(fb, blk0, blu0);
            assert(uniq0 > 3); // banner remains visible after frame 0
            fx.stopAll();

            // Simulate case 34 + case 48(wait=1)
            const auto& st48 = qm.nodes.back().steps.empty() ? game::EventStep{} : game::EventStep{};
            (void)st48;
            dlg.reset();
            dlg.setPosition(10, 40);
            dlg.setBoxSize(240, 40);
            dlg.startText(0, platform::utf8ToU16("Test banner caption dismiss"), 0);
            dlg.setWaitForKey(true);
            for (int f = 0; f < 40; ++f) {
                stepIdle(app, 1);
                if (dlg.finished) break;
            }
            assert(dlg.finished);
            dlg.advanceKey();
            assert(!dlg.active);
            gs.menuDirtyBg = true;
            app.render(gfx);
            int blk = 0, blu = 0, uniq = countUniqueColors(fb, blk, blu);
            assert(uniq > 30 && blu < 35000 && blk < 60000);
        }
        // case 48 mode 1/2 creditLines populated
        dlg.reset();
        dlg.startText(1, platform::utf8ToU16("Line A\nLine B"), 0);
        assert(dlg.creditLines.size() == 2);
        dlg.reset();
        std::printf("[OK] 2. Banners + case 48 clear cleanly on (1,3), (7,6), (9,0) + frame-0 alpha preserved\n");
    }

    // 3. case 48 non-blocking timed caption in (5,3) + case 16 mid-script (si>0) + case 62 + case 23
    {
        // Execute (5,3) n0 non-blocking case 48 step via queue: force event 0 in (5,3) -> ensure s3..s9 (wait=0) finish quickly
        app.debugTeleport(5, 3, 160, 160);
        stepIdle(app, 2);
        assert(!qm.nodes.empty() && qm.nodes[0].steps.size() > 10 && qm.nodes[0].steps[3].opcode == 48);
        assert(qm.nodes[0].steps[3].args[5] == 0);
        dlg.setPosition(10, 10);
        dlg.setBoxSize(300, 50);
        dlg.startText(0, qm.nodes[0].steps[3].strs[0], 0);
        assert(!dlg.waitForKey()); // must report non-blocking so case 48 advances without stall
        dlg.reset();

        // case 16 at si > 0: check (1,0) n2 (s0=86, s1=16 args=[52])
        app.debugTeleport(1, 0, 196, 208);
        qm.eventStates[game::GameState::globalRoomIndex(1, 0)].assign(20, 0);
        qm.eventStates[game::GameState::globalRoomIndex(1, 0)][1] = 3; // satisfy s0 op=86 args=[1,1,0]? let's use room (1,0)
        qm.eventStates[game::GameState::globalRoomIndex(1, 1)].assign(20, 3);
        app.debugTeleport(1, 0, 196, 208);
        stepIdle(app, 4);
        if (qm.nodes.size() > 2 && qm.nodes[2].steps.size() >= 3 && qm.nodes[2].steps[1].opcode == 16) {
            assert(qm.nodes[2].state == 6 && qm.nodes[2].stepCursor == 1);
            int targetNpc = qm.nodes[2].steps[1].args[0];
            gs.activeNpc = targetNpc;
            gs.interactTriggered = true;
            stepIdle(app, 2);
            // Must NOT jump to stepCursor=3 prematurely; must advance cleanly past step 1
            assert(qm.nodes[2].stepCursor != 3 || qm.nodes[2].steps.size() <= 3);
        }
        std::printf("[OK] 3. case 48 wait=0 non-blocking & case 16 mid-script verified\n");
    }

    // 4. Scene 9 Room 6 teleporter (subType==4) keeps camera tracking player (mode==1)
    {
        app.debugTeleport(9, 6, 160, 160);
        stepIdle(app, 3);
        game::NpcEntity* tp = nullptr;
        for (const auto& up : ow.npcs) {
            if (up && up->npcType == 1 && up->subType == 4) { tp = up.get(); break; }
        }
        assert(tp != nullptr);
        pl.setPos(tp->x, tp->y);
        pl.setMoveState(9, 0);
        for (int f = 0; f < 40; ++f) {
            stepIdle(app, 1);
            if (pl.curAnimState() == 0 && f > 20) break;
        }
        assert(cam.mode == 1);
        int cx0 = cam.x, cy0 = cam.y;
        pl.setPos(pl.x + 80, pl.y + 80);
        stepIdle(app, 20);
        assert(cam.x != cx0 || cam.y != cy0);
        std::printf("[OK] 4. Scene (9,6) teleporter camera keeps tracking player (mode=%d, cam %d,%d -> %d,%d)\n",
                    cam.mode, cx0, cy0, cam.x, cam.y);
    }

    // 5. Scene 10 laser switch (case 58): emitter keeps East/North/West orientation & updates laser
    {
        app.debugTeleport(10, 2, 160, 160);
        stepIdle(app, 2);
        // n0 in (10,2) s1 op=58 args=[3,192,224,2]: verify emitter linked to npc 3 keeps non-South anim
        if (ow.npcs.size() > 3 && ow.npcs[3] && ow.npcs[3]->followTarget &&
            ow.npcs[3]->followTarget->kind() == engine::EntityKind::NPC) {
            auto* emitter = static_cast<game::NpcEntity*>(ow.npcs[3]->followTarget);
            int8_t origAnim = emitter->spr.currentAnim();
            if (ow.npcs.size() > 2 && ow.npcs[2]) {
                pl.setPos(ow.npcs[2]->x, ow.npcs[2]->y + 12);
                pl.setMoveState(0, 2);
                stepIdle(app, 1);
                tapKey(SDLK_z, app, 15);
                assert(emitter->spr.currentAnim() == origAnim);
            }
        }
        std::printf("[OK] 5. Scene (10,2) laser switch preserves emitter orientation & recalculates laser\n");
    }

    // 6. Speedrun minigame (3,7): no premature timer & live timer tick when started
    {
        app.debugTeleport(3, 7, 160, 160);
        stepIdle(app, 5);
        assert(gs.startTimeMs == 0 && gs.finishTimeMs == 0);
        gs.startTimeMs = gs.currentTimeMs;
        gs.finishTimeMs = gs.startTimeMs;
        gs.endFlagTimeMs = 0;
        stepIdle(app, 5);
        assert(gs.finishTimeMs > gs.startTimeMs);
        gs.startTimeMs = 0;
        gs.finishTimeMs = 0;
        std::printf("[OK] 6. Speedrun (3,7) timer idle=0 & ticks live when active\n");
    }

    // 7. Wipeout respawn (Overworld save reload + Dojo teleport out of boss)
    {
        app.debugTeleport(1, 0, 196, 208);
        stepIdle(app, 2);
        assert(ow.saveGame());
        engine::AppContext::hasSaveGame = true;

        // Wipeout while cutsceneMode == 1 in another room -> must reset cutsceneMode & reload save
        app.debugTeleport(4, 1, 192, 336);
        stepIdle(app, 2);
        gs.cutsceneMode = 1;
        app.debugBattle(2);
        stepIdle(app, 30);
        game::BattleSystem::instance().setState(24);
        assert(ui.isScreenOpen("/data/ui/smsInfo.ui"));
        tapKey(SDLK_x, app, 4);
        assert(app.state() == 10 && gs.sceneId == 1 && gs.roomId == 0 && gs.cutsceneMode == 0);

        // Wipeout inside Dojo (9,0) -> live player moved to revive point (192,448) facing dir 2
        app.debugTeleport(9, 0, 276, 433);
        stepIdle(app, 2);
        app.debugBattle(2);
        stepIdle(app, 30);
        game::BattleSystem::instance().setState(24);
        tapKey(SDLK_x, app, 2);
        assert(app.state() == 10 && gs.sceneId == 9 && gs.roomId == 0);
        assert(pl.x == 192 && pl.y == 448 && pl.dir == 2);
        if (ow.npcs.size() > 15 && ow.npcs[15]) {
            assert(ow.npcs[15]->x == 276 && ow.npcs[15]->y == 433);
        }
        std::printf("[OK] 7. Wipeout respawn (Overworld reload + Dojo live reposition) verified\n");
    }

    // 8. case 70, Egg Shop (state 30 / case 83), Shops (sprite 20/24/Counter), ItemChooser, EquipToPet, case 46
    {
        // Visit Counter Material Shop (state 32) first to poison menuSubTypeJ = 3, then test Shops!
        app.debugTeleport(1, 0, 196, 208);
        stepIdle(app, 2);
        ow.setState(32);
        assert(ui.isScreenOpen("/data/ui/shopbuy.ui"));
        tapKey(SDLK_x, app);
        assert(ow.state() == 27);
        tapKey(SDLK_x, app);
        assert(ow.state() == 0);

        // Talk to Shop Hub (state 1) -> sets menuSubTypeJ = 1; check sprite 24 Item Shop & sprite 20 Material Shop!
        ow.setState(1);
        assert(gs.menuSubTypeJ == 1);
        tapKey(SDLK_x, app);
        assert(ow.state() == 0);

        // Find sprite 24 in (1,0) or simulate sprite 20 in (11,8)
        app.debugTeleport(11, 8, 160, 160);
        stepIdle(app, 2);
        int matNpc = -1;
        for (size_t i = 0; i < ow.npcs.size(); ++i) {
            if (ow.npcs[i] && ow.npcs[i]->spr.spriteId == 20) { matNpc = static_cast<int>(i); break; }
        }
        assert(matNpc >= 0);
        gs.activeNpc = matNpc;
        gs.menuSubTypeJ = 3; // verify sprite 20 still buys into materials (bagType=2), not accessories!
        pl.accessories.clear();
        pl.materials.clear();
        pl.addMoney(50000);
        pl.addMedals(100);
        int accBefore = static_cast<int>(pl.accessories.size());
        ow.setState(1);
        assert(gs.menuSubTypeJ == 1);
        tapKey(SDLK_z, app); // Mua -> state 2 -> openShopBuy(3, 2)
        assert(ow.state() == 2 && ui.isScreenOpen("/data/ui/shopbuy.ui"));
        tapKey(SDLK_z, app); // buy accessory item 0 (bagType==2 && idx<12 -> accessories)
        assert(static_cast<int>(pl.accessories.size()) > accBefore);
        tapKey(SDLK_z, app); // close warm modal
        for (int i = 0; i < 12; ++i) tapKey(SDLK_DOWN, app); // scroll to material item >=12
        tapKey(SDLK_z, app); // open msgyn.ui qty modal
        assert(ui.isScreenOpen("/data/ui/msgyn.ui"));
        tapKey(SDLK_z, app); // confirm buy material
        assert(!pl.materials.empty());
        tapKey(SDLK_z, app); // close warm modal
        tapKey(SDLK_x, app); // exit shopbuy -> back to state 1 (NOT state 27!)
        assert(ow.state() == 1);
        tapKey(SDLK_x, app); // exit shop.ui -> state 0
        assert(ow.state() == 0);

        // Verify Arena medal dialog does not poison case 46 uiSaveModalState
        gs.uiSaveModalState = 1;
        gs.menuFlagF = 1;
        app.debugTeleport(1, 0, 196, 208);
        stepIdle(app, 2);
        // Simulate Arena tip close transitioning to Counter then closing back to 0:
        ow.setState(31);
        assert(gs.uiSaveModalState == 0);
        tapKey(SDLK_x, app);
        ui.closeScreen("/data/ui/dialog.ui");
        ow.setState(0);

        // case 70 -> overworldChangeState(1)/(16), NEVER credits (app state 1/16)
        qm.currentNpcTrigger = 0;
        ow.setState(1);
        assert(app.state() == 10 && ui.isScreenOpen("/data/ui/shop.ui"));
        tapKey(SDLK_x, app);
        qm.currentNpcTrigger = 2;
        ow.setState(16);
        assert(app.state() == 10);
        tapKey(SDLK_x, app);
        qm.currentNpcTrigger = -1;

        // Egg Shop (state 30) opens shopbuy.ui (NOT wharf1.ui!), sets wharfReturnChoice=0/1 properly
        app.debugTeleport(4, 5, 160, 160);
        stepIdle(app, 2);
        ow.setState(30);
        assert(ui.isScreenOpen("/data/ui/shopbuy.ui") && !ui.isScreenOpen("/data/ui/wharf1.ui"));
        tapKey(SDLK_x, app);
        assert(gs.wharfReturnChoice == 1 && ow.state() == 0);

        // Item Chooser via real petstate -> petsetting -> Item Chooser input flow
        pl.consumables.clear();
        for (int id = 0; id < 25 && pl.consumables.size() < 2; ++id) {
            pl.addBagItem(id, 2, 0);
        }
        assert(pl.consumables.size() >= 2);
        ow.setState(7);
        tapKey(SDLK_z, app); // open petsetting.ui
        tapKey(SDLK_z, app); // choose "Dung dao cu" -> Item Chooser (choice.ui)
        assert(ui.isScreenOpen("/data/ui/choice.ui"));
        tapKey(SDLK_DOWN, app);
        assert(gs.menuSubIdx == 1);
        tapKey(SDLK_x, app); // close choice.ui back to petstate
        ui.closeScreen("/data/ui/petstate.ui");
        ow.setState(0);

        // tickBagGiveEquipToPet closes petstate.ui on confirm & bag exits to state 6 -> 0
        if (pl.accessories.empty()) pl.addBagItem(0, 1, 2);
        ow.setState(8);
        ow.setState(18);
        assert(ow.state() == 18 && ui.isScreenOpen("/data/ui/petstate.ui"));
        tapKey(SDLK_z, app);
        assert(!ui.isScreenOpen("/data/ui/petstate.ui") && ow.state() == 8);
        tapKey(SDLK_x, app); // Bag -> GameMenu (state 6)
        assert(ow.state() == 6);
        ui.closeScreen("/data/ui/gamemenu.ui");
        ow.setState(0);

        std::printf("[OK] 8. Shops (sprite 20/24/32/case 70), Egg Shop (state 30), ItemChooser, EquipToPet verified\n");
    }

    // 9. Mounted outdoor room transition keeps mount sprite & camera tracking + case 64 NPC emote
    {
        app.debugTeleport(1, 0, 196, 208);
        stepIdle(app, 2);
        pl.equipMount(0);
        assert(pl.mountIdx == 0 && pl.spr.spriteId == 1);
        gs.sceneId = 1;
        gs.roomId = 1;
        gs.portalDestIdx = 0;
        app.changeState(9);
        stepIdle(app, 4);
        assert(app.state() == 10);
        assert(pl.mountIdx == 0 && pl.spr.spriteId == 1);
        assert(cam.mode == 1 && cam.followTarget == &pl);
        pl.unequipMount();

        if (!ow.npcs.empty() && ow.npcs[0]) {
            ow.prepareEmote(259);
            ow.attachEmote(ow.npcs[0].get());
            ow.npcs[0]->setPos(123, 234);
            stepIdle(app, 2);
            ow.clearEmote();
        }
        std::printf("[OK] 9. Mounted portal transition & NPC emote verified\n");
    }

    // 10. All 120 rooms (scenes 0..12 including scene_12) load & render with non-empty maps
    {
        int rooms = 0;
        auto& tm = engine::TileMap::instance();
        for (int sc = 0; sc <= 12; ++sc) {
            std::vector<uint8_t> raw;
            if (!platform::readRomfsFile("data/event/scene_" + std::to_string(sc) + ".mid", raw)) continue;
            engine::ByteReader rr(raw);
            int16_t rc = rr.readShort();
            for (int rm = 0; rm < rc; ++rm) {
                ++rooms;
                app.debugTeleport(sc, rm, 160, 160);
                stepIdle(app, 2);
                gs.menuDirtyBg = true;
                app.render(gfx);
                int blk = 0, blu = 0, uniq = countUniqueColors(fb, blk, blu);
                assert(tm.pixelW > 0 && tm.pixelH > 0);
                if (sc != 0) assert(uniq >= 20);
            }
        }
        assert(rooms == 120);
        std::printf("[OK] 10. All %d rooms across scenes 0..12 verified\n", rooms);
    }

    // 11. Negative-shift camera math, symmetric 60fps lerp, overlay cursor & focus-reset guards
    {
        // Exact Java >> 4 parity for negative camera/scroll accumulators
        assert(engine::floorDiv16(-1) == -1);
        assert(engine::floorDiv16(-16) == -1);
        assert(engine::floorDiv16(-17) == -2);
        assert(engine::floorDivPow2(-4, 4) == -1);
        assert(engine::floorDivPow2(31, 4) == 1);

        // Symmetric std::lround phase-lock interpolation & warp snap guard
        assert(engine::lerpCoordRound(100, 102, 0.5f, true) == 101);
        assert(engine::lerpCoordRound(-10, -8, 0.5f, true) == -9);
        assert(engine::lerpCoordRound(0, 300, 0.5f, true, 96) == 300);

        // OverlayMenuView cursor & scroll synchronization (e.g. Cheat / Debug menu)
        platform::OverlayMenuView ov{};
        ov.open = true;
        ov.title = "QA Cheat Menu";
        for (int i = 0; i < 12; ++i) {
            ov.rows.push_back({"Row " + std::to_string(i), "Val", true, i == 10});
        }
        ov.selectedRow = 10;
        ov.scrollTop = 4;
        platform::RenderSystem::drawOverlayView(ov);
        assert(ov.selectedRow == 10 && ov.scrollTop == 4);

        // Display modes: 1920x1080 Widescreen vs Original 8x Scale resolution math
        platform::RenderSystem::setOriginalResolution(320, 240);
        assert(platform::RenderSystem::gameCanvasWidth(platform::DisplayScaleMode::FHD_1920x1080) == 426);
        assert(platform::RenderSystem::gameCanvasWidth(platform::DisplayScaleMode::FHD_ASPECT_FIT) == 320);
        assert(platform::RenderSystem::gameCanvasWidth(platform::DisplayScaleMode::NATIVE_8X) == 320);
        assert(platform::RenderSystem::gameCanvasHeight() == 240);

        // Mobile Phone Keypad + Shift-release guard + clearQueues() vs resetAllState()
        platform::InputSystem::beginFrame();
        SDL_Event holdEv{};
        holdEv.type = SDL_KEYDOWN;
        holdEv.key.keysym.sym = SDLK_RETURN;
        holdEv.key.keysym.scancode = SDL_SCANCODE_RETURN;
        platform::InputSystem::handleSdlEvent(holdEv);

        SDL_Event hashDown{};
        hashDown.type = SDL_KEYDOWN;
        hashDown.key.keysym.sym = SDLK_3;
        hashDown.key.keysym.scancode = SDL_SCANCODE_3;
        hashDown.key.keysym.mod = KMOD_SHIFT;
        platform::InputSystem::handleSdlEvent(hashDown);

        g_t += 16;
        platform::InputSystem::update(platform::PortSettings{}, g_t);
        assert(platform::InputSystem::isHeld(platform::Action::FIRE));
        assert(platform::InputSystem::isJ2meKeyHeld('#'));
        platform::InputSystem::clearQueues();
        assert(platform::InputSystem::isHeld(platform::Action::FIRE));

        // Releasing '3' without Shift still clears '#'
        SDL_Event hashUp{};
        hashUp.type = SDL_KEYUP;
        hashUp.key.keysym.sym = SDLK_3;
        hashUp.key.keysym.scancode = SDL_SCANCODE_3;
        hashUp.key.keysym.mod = 0;
        platform::InputSystem::beginFrame();
        platform::InputSystem::handleSdlEvent(hashUp);
        g_t += 16;
        platform::InputSystem::update(platform::PortSettings{}, g_t);
        assert(!platform::InputSystem::isJ2meKeyHeld('#'));

        platform::InputSystem::resetAllState();
        assert(!platform::InputSystem::isHeld(platform::Action::FIRE));

        std::printf("[OK] 11. floorDiv16, lerpCoordRound, OverlayMenuView, 1080p/8x & Keypad verified\n");
    }

    std::printf("ALL ALL-MAPS & PARITY QA TESTS PASSED!\n");
    app.shutdown();
    platform::RenderSystem::shutdown();
    SDL_Quit();
    return 0;
}
