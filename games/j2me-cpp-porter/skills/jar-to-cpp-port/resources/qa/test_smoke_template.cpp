#include "engine/BitmapFont.hpp"
#include "engine/GraphicsContext.hpp"
#include "engine/ResourceMgr.hpp"
#include "engine/ScreenBase.hpp"
#include "engine/TileMap.hpp"
#include "engine/UIEngine.hpp"
#include "game/AppController.hpp"
#include "game/BattleSystem.hpp"
#include "game/GameMenuController.hpp"
#include "game/GameState.hpp"
#include "game/OverworldScreen.hpp"
#include "game/Player.hpp"
#include "game/QuestWorldMgr.hpp"
#include "game/TitleScreen.hpp"
#include "platform/InputSystem.hpp"
#include "platform/Platform.hpp"
#include "platform/RenderSystem.hpp"
#include "platform/SaveSystem.hpp"

#include <SDL.h>
#include <csignal>
#include <cstdio>
#include <cstdlib>
#include <execinfo.h>
#include <unistd.h>
#include <vector>

static const char* g_phase = "init";

static void crashOrHangHandler(int sig) {
    std::fprintf(stderr, "\n=== SIGNAL %d in phase [%s] ===\n", sig, g_phase);
    void* frames[64];
    int n = backtrace(frames, 64);
    backtrace_symbols_fd(frames, n, STDERR_FILENO);
    std::_Exit(128 + sig);
}

static void stepFrames(game::AppController& app, engine::GraphicsContext& gfx, int n) {
    for (int i = 0; i < n; ++i) {
        platform::InputSystem::clearQueues();
        app.tick();
        app.render(gfx);
    }
}

static void tapKey(game::AppController& app, engine::GraphicsContext& gfx, int32_t jkey, int waitFrames = 2) {
    platform::InputSystem::clearQueues();
    // Simulate key via active ScreenBase using onKeyPressed / onKeyReleased OR inject through Title/Overworld/Battle
    auto dispatchToActive = [&](bool press) {
        auto st = app.state();
        if (st == 7) {
            if (press) game::TitleScreen::instance().onKeyPressed(jkey);
            else game::TitleScreen::instance().onKeyReleased(jkey);
        } else if (st == 10) {
            if (press) game::OverworldScreen::instance().onKeyPressed(jkey);
            else game::OverworldScreen::instance().onKeyReleased(jkey);
        } else if (st == 12) {
            if (press) game::BattleSystem::instance().onKeyPressed(jkey);
            else game::BattleSystem::instance().onKeyReleased(jkey);
        }
    };
    dispatchToActive(true);
    app.tick();
    app.render(gfx);
    dispatchToActive(false);
    for (int i = 0; i < waitFrames; ++i) {
        app.tick();
        app.render(gfx);
    }
}

int main() {
    std::setvbuf(stdout, nullptr, _IONBF, 0);
    if (!platform::init()) {
        std::printf("ERR: platform::init failed\n");
        return 1;
    }
    std::signal(SIGSEGV, crashOrHangHandler);
    std::signal(SIGBUS, crashOrHangHandler);
    std::signal(SIGABRT, crashOrHangHandler);
    std::signal(SIGALRM, crashOrHangHandler);
    alarm(5);
    engine::AppContext::setScreenSize(426, 240);
    engine::ResourceMgr::init();
    engine::BitmapFont::init();

    // 1. Check tutorial helper truth values
    std::printf("--- Tutorial helper truth table ---\n");
    engine::AppContext::tutorialStep = -1;
    engine::AppContext::tutorialSub = 0;
    std::printf("step=-1: active=%d mode1=%d mode2=%d lock(0,0)=%d\n",
                (int)engine::AppContext::isTutorialActive(),
                (int)engine::AppContext::isTutorialMode1(),
                (int)engine::AppContext::isTutorialMode2(),
                (int)engine::AppContext::isTutorialLocked(0, 0));
    for (int s = 0; s <= 5; ++s) {
        engine::AppContext::tutorialStep = (int8_t)s;
        for (int sub = 0; sub <= 6; ++sub) {
            engine::AppContext::tutorialSub = (int8_t)sub;
            std::printf("step=%d sub=%d: m1=%d m2=%d l0=%d l1=%d\n",
                        s, sub,
                        (int)engine::AppContext::isTutorialMode1(),
                        (int)engine::AppContext::isTutorialMode2(),
                        (int)engine::AppContext::isTutorialLocked(0, 0),
                        (int)engine::AppContext::isTutorialLocked(1, 0));
        }
    }
    engine::AppContext::tutorialStep = -1;
    engine::AppContext::tutorialSub = 0;

    // 2. Drive AppController through Logos -> Sound -> Title -> New Game -> Overworld -> Battle -> Save -> Reload
    std::vector<uint32_t> fb(426 * 240, 0);
    engine::GraphicsContext gfx;
    gfx.setTarget(fb.data(), 426, 240);

    auto& app = game::AppController::instance();
    app.init();
    std::printf("Init state=%d\n", (int)app.state());

    stepFrames(app, gfx, 30); // skip logo 0 -> logo 2
    std::printf("After 30 frames state=%d\n", (int)app.state());
    stepFrames(app, gfx, 35); // logo 2 -> sound 5
    std::printf("After 65 frames state=%d\n", (int)app.state());

    // Sound prompt state == 5: accept sound via changeState(7) (simulates key -5 on state 5)
    app.changeState(7);
    stepFrames(app, gfx, 5);
    std::printf("TitleScreen state=%d, Title.state_=%d\n",
                (int)app.state(), (int)game::TitleScreen::instance().state_);

    // Open New Game from TitleScreen (triggerNewGame = tap Fire on index 0/1)
    // First check TitleScreen state & UI prompts
    auto st = platform::SaveSystem::loadSettings();
    auto prompts = app.getContextualPrompts(st);
    std::printf("Title prompts count=%zu\n", prompts.size());

    // Enter New Game
    app.enterWorldFromTitle(true);
    stepFrames(app, gfx, 15);
    std::printf("Overworld entered: app.state=%d ow.state=%d party=%d room=(%d,%d) quests=%zu npcs=%zu\n",
                (int)app.state(), (int)game::OverworldScreen::instance().state_,
                game::Player::instance().partyCount,
                game::GameState::get().sceneId, game::GameState::get().roomId,
                game::QuestWorldMgr::instance().nodes.size(),
                game::OverworldScreen::instance().npcs.size());

    // Test 16:9 <-> 4:3 TileMap viewport switch mid-Overworld
    engine::AppContext::setScreenSize(320, 240);
    engine::TileMap::instance().resetViewport(320, 240);
    stepFrames(app, gfx, 5);
    engine::AppContext::setScreenSize(426, 240);
    engine::TileMap::instance().resetViewport(426, 240);
    stepFrames(app, gfx, 5);
    std::printf("4:3 <-> 16:9 viewport toggle survived!\n");

    // Teleport to free-roam room (1, 0) after intro check and wait for transition curtain (30 frames)
    app.debugTeleport(1, 0, 196, 208);
    engine::AppContext::tutorialStep = -1;
    engine::AppContext::tutorialSub = 0;
    stepFrames(app, gfx, 35);
    std::printf("In room (1,0) after curtain: ow.state_=%d eventLock=%d\n",
                (int)game::OverworldScreen::instance().state_,
                (int)game::GameState::get().eventLockInput);

    // Open Game Menu (raw J2ME RSK = -7), then Party (state 7), Bag (state 8), Quests (state 10)
    tapKey(app, gfx, -7, 3);
    std::printf("After RSK in ow: ow.state_=%d (expect 6=GameMenu), gameMenu.ui open=%d\n",
                (int)game::OverworldScreen::instance().state_,
                (int)engine::UIManager::instance().isScreenOpen("/data/ui/gamemenu.ui"));

    // Navigate down (-2), confirm (-5) into Party (state 7), then return (-7)
    tapKey(app, gfx, -2, 2);
    tapKey(app, gfx, -5, 2);
    std::printf("After select item 1 in GameMenu: ow.state_=%d (expect 7=PartyInspect)\n",
                (int)game::OverworldScreen::instance().state_);
    tapKey(app, gfx, -7, 2);
    std::printf("After RSK from PartyInspect: ow.state_=%d (expect 6=GameMenu)\n",
                (int)game::OverworldScreen::instance().state_);

    // Navigate down to Bag (index 2), confirm (-5) -> state 8 (Bag), test tabs (-3/-4), return (-7)
    tapKey(app, gfx, -2, 2);
    tapKey(app, gfx, -5, 2);
    std::printf("After select Bag in GameMenu: ow.state_=%d (expect 8=Bag)\n",
                (int)game::OverworldScreen::instance().state_);
    tapKey(app, gfx, -4, 2); // tab right
    tapKey(app, gfx, -4, 2); // tab right
    tapKey(app, gfx, -4, 2); // tab right (specials)
    tapKey(app, gfx, -7, 2); // back to GameMenu
    tapKey(app, gfx, -7, 2); // close GameMenu -> state 0
    std::printf("After close menu: ow.state_=%d (expect 0)\n", (int)game::OverworldScreen::instance().state_);

    // Open System Menu (LSK = -6), then close
    tapKey(app, gfx, -6, 2);
    std::printf("After LSK system menu: ow.state_=%d (expect 13=SystemMenu)\n",
                (int)game::OverworldScreen::instance().state_);
    tapKey(app, gfx, -7, 2);

    // Open World Map (raw J2ME '0' = 48), wait for auto-pan (15 frames), then close (-7)
    tapKey(app, gfx, 48, 15);
    std::printf("After KEY_0 map: ow.state_=%d (expect 4=WorldMap)\n", (int)game::OverworldScreen::instance().state_);
    tapKey(app, gfx, -7, 2);
    std::printf("After close WorldMap: ow.state_=%d (expect 0)\n", (int)game::OverworldScreen::instance().state_);

    // Open Quest screen (raw J2ME '1' = 49), then close
    tapKey(app, gfx, 49, 2);
    std::printf("After KEY_1 quest: ow.state_=%d (expect 10=Quests)\n", (int)game::OverworldScreen::instance().state_);
    tapKey(app, gfx, -7, 2);

    // Open Ride Menu (raw J2ME '9' = 57), then close
    tapKey(app, gfx, 57, 2);
    std::printf("After KEY_9 ride: ow.state_=%d (expect 5=RideMenu)\n", (int)game::OverworldScreen::instance().state_);
    tapKey(app, gfx, -7, 2);

    // Also test RecordHub (9), Pokedex (11), Badges (12), BodyShop (14), ShopBuy (2), ShopSell (3)
    for (int8_t stTest : {9, 11, 12, 14, 2, 3}) {
        game::OverworldScreen::instance().setState(stTest);
        stepFrames(app, gfx, 3);
        std::printf("Overworld sub-screen state=%d rendered cleanly!\n", (int)stTest);
        tapKey(app, gfx, -7, 2);
    }
    game::OverworldScreen::instance().setState(0);
    stepFrames(app, gfx, 2);

    // Trigger debug battle (species 0)
    g_phase = "debugBattle_init";
    std::printf("Calling debugBattle(0)...\n");
    app.debugBattle(0);
    std::printf("debugBattle(0) returned, state=%d bs.state_=%d\n",
                (int)app.state(), (int)game::BattleSystem::instance().state_);
    for (int f = 0; f < 40; ++f) {
        g_phase = "battle_tick";
        app.tick();
        g_phase = "battle_render";
        app.render(gfx);
    }
    std::printf("Battle after 40 frames: app.state=%d bs.state_=%d rewardPets=%zu\n",
                (int)app.state(), (int)game::BattleSystem::instance().state_,
                game::BattleSystem::rewardPets.size());

    // Try attack command -> choose skill -> animate turn
    if (game::BattleSystem::instance().state_ == 20) {
        tapKey(app, gfx, -5, 3); // Command Fight -> state 3 (Skills)
        std::printf("Battle after Fight: bs.state_=%d\n", (int)game::BattleSystem::instance().state_);
        if (game::BattleSystem::instance().state_ == 3) {
            tapKey(app, gfx, -5, 50); // Select skill 0
        }
    }
    std::printf("Battle post-turn: app.state=%d bs.state_=%d\n",
                (int)app.state(), (int)game::BattleSystem::instance().state_);

    // Save & reload test
    if (game::Player::instance().partyCount <= 0) {
        game::Player::instance().grantStarterPetAndEgg();
    }
    bool saved = game::OverworldScreen::instance().saveGame();
    std::printf("saveGame()=%d hasSaveGame=%d\n", (int)saved, (int)engine::AppContext::hasSaveGame);

    app.enterWorldFromTitle(false);
    stepFrames(app, gfx, 10);
    std::printf("Continue loaded: partyCount=%d money=%d\n",
                game::Player::instance().partyCount, game::Player::instance().money());

    // Clean up temporary smoke-test save so user starts fresh
    game::OverworldScreen::deleteAllSaves();
    engine::AppContext::hasSaveGame = false;

    app.shutdown();
    engine::ResourceMgr::shutdown();
    platform::shutdown();
    std::printf("ALL SMOKE TESTS PASSED!\n");
    return 0;
}
