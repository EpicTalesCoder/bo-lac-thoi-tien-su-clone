#include "game/GameEngine.hpp"
#include "platform/AudioSystem.hpp"
#include "platform/Platform.hpp"
#include "platform/SaveSystem.hpp"

#include <algorithm>
#include <cmath>
#include <cstdlib>

namespace game {

const int8_t GameEngine::kTerrainDef[10] = {0, 5, 10, 10, 15, 0, 5, 15, 15, 15};
const int8_t GameEngine::kTerrainCost[10] = {1, 1, 2, 2, 3, 3, 1, 1, 1, 1};
const int GameEngine::kTeamColors[5] = {10526880, 26054, 15204434, 39473, 16754};
const int GameEngine::kSkirmishStartingGold[3] = {500, 1000, 2000};
const int GameEngine::kSkirmishUnitCap[3] = {10, 20, 25};

GameEngine::GameEngine() {
    Panel::engine = this;
}

GameEngine::~GameEngine() {
    shutdown();
}

bool GameEngine::init(int w, int h) {
    resize(w, h);
    if (!PakStore::load()) return false;
    if (!Lang::load()) return false;
    Trig::init();
    SpriteFont::init();
    Unit::loadUnitTable(this);
    loadAssets();
    loadSettingsRecord();

    skirmishMapNames.clear();
    for (int i = 0; i < 12; ++i) {
        skirmishMapNames.push_back(Lang::get(101 + i));
    }

    appState = 0;
    introStep = 0;
    stateTimerMs = gameTimeMs;
    playBgmTrack(0, -1);
    return true;
}

void GameEngine::shutdown() {
    stopBgmTrack();
    activePanel = nullptr;
    panelStack.clear();
    confirmPanel.reset();
    minimapPanel.reset();
    buyPanel.reset();
    buyInfoPanel.reset();
    unitInfoPanel.reset();
    helpPanel.reset();
    settingsPanel.reset();
    selectLevelPanel.reset();
    victoryPanel.reset();
    ownedMainMenu.reset();
    ownedSubPanel.reset();
    ownedInGameMenu.reset();
    ownedPopup.reset();
    ownedBottomBanner.reset();
    ownedDialog.reset();
    battleLeft.reset();
    battleRight.reset();
    battleSprites.clear();
    worldEffects.clear();
    units.clear();
    tempUnits.clear();
    SpriteFont::shutdown();
}

void GameEngine::resize(int w, int h) {
    screenW = std::max(240, w);
    screenH = std::max(240, h);
    gamePanelHeight = screenH - 16;
    battleViewH = screenH - kBattleHudHeight;
    battleHalfW = screenW / 2;
    mapDirty = true;
    hudDirty = true;
    softkeyBarDirty = true;
}

void GameEngine::loadAssets() {
    actionIcons = Sprite("action_icons").frames;
    menuIcons = Sprite("menu_icons").frames;
    hudIcons = std::make_unique<Sprite>("hud_icons");
    hudIcons2 = std::make_unique<Sprite>("hud_icons_2");
    arrowIcons = std::make_unique<Sprite>("arrow_icons");
    sideArrowSprite = std::make_unique<Sprite>("side_arrow");
    smallArrowSprite = std::make_unique<Sprite>("arrow");
    buttonsSprite = std::make_unique<Sprite>("buttons");
    borderSprite = std::make_unique<Sprite>("menu");
    bigCircleProto = std::make_unique<Sprite>("big_circle");
    smallCircleProto = std::make_unique<Sprite>("small_circle");
    smallSparkProto = std::make_unique<Sprite>("small_spark");
    smokeProto = std::make_unique<Sprite>("smoke");
    sparkProto = std::make_unique<Sprite>("spark");
    redsparkProto = std::make_unique<Sprite>("redspark");
    levelupProto = std::make_unique<Sprite>("levelup");
    alphaSprite = std::make_unique<Sprite>("alpha");
    cursorSprite = std::make_unique<Sprite>("cursor");
    portraitsSprite = std::make_unique<Sprite>("portraits");
    unitIcons = std::make_unique<Sprite>("unit_icons");
    kingHeadIcons[0] = std::make_unique<Sprite>("king_head_icons", 1);
    kingHeadIcons[1] = std::make_unique<Sprite>("king_head_icons", 0);

    msLogo = ImageRegion("ms_logo");
    if (PakStore::exists("ae_logo.png")) aeLogo = ImageRegion("ae_logo");
    if (PakStore::exists("gameover.png")) gameoverLogo = ImageRegion("gameover");

    if (const auto* prop = PakStore::getBytes("tiles0.prop")) {
        engine::ByteReader r(*prop);
        int16_t cnt = r.readShort();
        r.readShort();
        tileTerrain.resize(static_cast<size_t>(std::max<int>(0, cnt)));
        for (int i = 0; i < cnt; ++i) {
            tileTerrain[static_cast<size_t>(i)] = r.readByte();
        }
    }
    tileRegions = Sprite("stiles0").frames;
    miniIcons = Sprite("mini_icons").frames;
    castleTileStart = 37;

    static const char* const kUnitNames[12] = {
        "soldier", "archer", "lizard", "wizard", "wisp", "spider",
        "golem", "catapult", "wyvern", "king", "skeleton", "crystal"
    };
    for (int team = 0; team < 5; ++team) {
        for (int ut = 0; ut < 12; ++ut) {
            if (PakStore::exists(std::string(kUnitNames[ut]) + ".sprite")) {
                unitTemplates[static_cast<size_t>(team)][static_cast<size_t>(ut)] =
                    std::make_unique<Sprite>(kUnitNames[ut], team);
            }
        }
    }
}

Sprite* GameEngine::getUnitSpriteTemplate(int8_t teamId, int8_t type) {
    if (teamId < 0 || teamId >= 5 || type < 0 || type >= 12) return nullptr;
    return unitTemplates[static_cast<size_t>(teamId)][static_cast<size_t>(type)].get();
}

void GameEngine::onKeyPressed(int32_t j2meKey) {
    input.onKeyPressed(j2meKey);
}

void GameEngine::onKeyReleased(int32_t j2meKey) {
    input.onKeyReleased(j2meKey);
}

void GameEngine::clearHeldInputs() {
    input.clearAll();
}

void GameEngine::playBgmTrack(int trackId, int loops) {
    if (!optSound) return;
    if (curBgmTrack != trackId) {
        curBgmTrack = trackId;
        platform::AudioSystem::playBgm(trackId, loops);
    }
}

void GameEngine::stopBgmTrack() {
    curBgmTrack = -1;
    platform::AudioSystem::stopBgm();
}

int GameEngine::lerpColor(int c0, int c1, int step, int maxStep) {
    if (maxStep <= 0) return c1;
    int r0 = (c0 >> 16) & 0xFF, g0 = (c0 >> 8) & 0xFF, b0 = c0 & 0xFF;
    int r1 = (c1 >> 16) & 0xFF, g1 = (c1 >> 8) & 0xFF, b1 = c1 & 0xFF;
    int r = r0 + (r1 - r0) * step / maxStep;
    int g = g0 + (g1 - g0) * step / maxStep;
    int b = b0 + (b1 - b0) * step / maxStep;
    return ((r & 0xFF) << 16) | ((g & 0xFF) << 8) | (b & 0xFF);
}

int GameEngine::lerpColorTri(int c0, int c1, int c2) {
    return lerpColor(c0, c1, c2, 255);
}

void GameEngine::pushPanel(Panel* p) {
    if (!p) return;
    if (activePanel && activePanel != p) {
        panelStack.push_back(activePanel);
    }
    activePanel = p;
    activePanel->onShow();
    softkeyBarDirty = true;
}

void GameEngine::popPanel(Panel* target) {
    if (target) {
        activePanel = target;
        while (!panelStack.empty() && panelStack.back() == target) {
            panelStack.pop_back();
        }
        activePanel->onShow();
    } else if (!panelStack.empty()) {
        activePanel = panelStack.back();
        panelStack.pop_back();
        activePanel->onShow();
    } else {
        activePanel = nullptr;
    }
    mapDirty = true;
    hudDirty = true;
    softkeyBarDirty = true;
}

Unit* GameEngine::getUnitAt(int gx, int gy, uint8_t layerState) {
    for (const auto& u : units) {
        if (u->gridX == gx && u->gridY == gy) {
            if (layerState == 0 && u->state != 3 && u->state != 4) return u.get();
            if (layerState == 1 && u->state == 3) return u.get();
        }
    }
    return nullptr;
}

int8_t GameEngine::getTerrainAt(int gx, int gy) const {
    if (gx < 0 || gy < 0 || gx >= mapW || gy >= mapH) return 1;
    int tid = static_cast<uint8_t>(mapTiles[static_cast<size_t>(gx)][static_cast<size_t>(gy)]);
    if (tid >= 0 && tid < static_cast<int>(tileTerrain.size())) {
        return tileTerrain[static_cast<size_t>(tid)];
    }
    return 1;
}

int GameEngine::findBuildingIndex(int gx, int gy) const {
    for (size_t i = 0; i < buildings.size(); ++i) {
        if (buildings[i][0] == gx && buildings[i][1] == gy) return static_cast<int>(i);
    }
    return -1;
}

bool GameEngine::isBuildingAllied(int gx, int gy, int alliance) const {
    int idx = findBuildingIndex(gx, gy);
    if (idx < 0) return false;
    int ownerTeam = buildings[static_cast<size_t>(idx)][2];
    if (ownerTeam <= 0) return false;
    for (int p = 0; p < playerCount; ++p) {
        if (playerTeam[static_cast<size_t>(p)] == ownerTeam) {
            return playerAlliance[static_cast<size_t>(p)] == alliance;
        }
    }
    return false;
}

bool GameEngine::isBuildingOwnedBy(int gx, int gy, int plr) const {
    int idx = findBuildingIndex(gx, gy);
    if (idx < 0) return false;
    return buildings[static_cast<size_t>(idx)][2] == playerTeam[static_cast<size_t>(plr)];
}

void GameEngine::setBuildingOwner(int gx, int gy, int8_t teamId) {
    int idx = findBuildingIndex(gx, gy);
    if (idx >= 0) buildings[static_cast<size_t>(idx)][2] = teamId;
    int8_t ter = getTerrainAt(gx, gy);
    if (ter == 8) {
        mapTiles[static_cast<size_t>(gx)][static_cast<size_t>(gy)] = (teamId == 0) ? 27 : static_cast<int8_t>(castleTileStart + teamId - 1);
    } else if (ter == 9) {
        mapTiles[static_cast<size_t>(gx)][static_cast<size_t>(gy)] = (teamId == 0) ? 35 : static_cast<int8_t>(castleTileStart + 4 + teamId - 1);
    }
    mapDirty = true;
}

void GameEngine::destroyTownAt(int8_t /*teamId*/, int gx, int gy) {
    if (gx >= 0 && gy >= 0 && gx < mapW && gy < mapH) {
        mapTiles[static_cast<size_t>(gx)][static_cast<size_t>(gy)] = 26; // ruined town
        int idx = findBuildingIndex(gx, gy);
        if (idx >= 0) buildings[static_cast<size_t>(idx)][2] = 0;
        brokenTowns.push_back({static_cast<int8_t>(gx), static_cast<int8_t>(gy)});
        mapDirty = true;
    }
}

Sprite* GameEngine::spawnEffect(const Sprite* proto, int x, int y, int vx, int vy, int loops, int delayMs) {
    auto sp = Sprite::createEffect(proto, vx, vy, 0, loops, delayMs, 0);
    sp->setPos(x, y);
    Sprite* raw = sp.get();
    worldEffects.push_back(std::move(sp));
    return raw;
}

void GameEngine::addBattleSprite(std::unique_ptr<Sprite> sp) {
    battleSprites.push_back(std::move(sp));
}

Sprite* GameEngine::createBattleEffect(const Sprite* proto, int vx, int vy, int gravY, int loops, int delayMs, uint8_t kind) {
    auto sp = Sprite::createEffect(proto, vx, vy, gravY, loops, delayMs, kind);
    Sprite* raw = sp.get();
    battleSprites.push_back(std::move(sp));
    return raw;
}

void GameEngine::removeUnit(Unit* u) {
    for (size_t i = 0; i < units.size(); ++i) {
        if (units[i].get() == u) {
            units.erase(units.begin() + static_cast<ptrdiff_t>(i));
            return;
        }
    }
}

void GameEngine::triggerBattleShake(int durMs) {
    battleShakeActive = true;
    battleShakeEndMs = gameTimeMs + static_cast<uint64_t>(durMs);
}

void GameEngine::centerCameraOnGrid(int gx, int gy) {
    int wx = gx * 24 + 12;
    int wy = gy * 24 + 12;
    targetCamX = std::clamp(wx - screenW / 2, 0, std::max(0, mapPxW - screenW));
    targetCamY = std::clamp(wy - gamePanelHeight / 2, 0, std::max(0, mapPxH - gamePanelHeight));
    camX = targetCamX;
    camY = targetCamY;
    prevCamX = camX;
    prevCamY = camY;
}

void GameEngine::setCursorGrid(int gx, int gy) {
    cursorGx = std::clamp(gx, 0, std::max(0, mapW - 1));
    cursorGy = std::clamp(gy, 0, std::max(0, mapH - 1));
    if (cursorSprite) {
        cursorSprite->setPos(cursorGx * 24, cursorGy * 24);
    }
    int px = cursorGx * 24;
    int py = cursorGy * 24;
    if (px - camX < 24) targetCamX = std::max(0, px - 24);
    else if (px - camX > screenW - 48) targetCamX = std::min(std::max(0, mapPxW - screenW), px - screenW + 48);
    if (py - camY < 24) targetCamY = std::max(0, py - 24);
    else if (py - camY > gamePanelHeight - 48) targetCamY = std::min(std::max(0, mapPxH - gamePanelHeight), py - gamePanelHeight + 48);
    mapDirty = true;
}

bool GameEngine::moveCameraToward(int wx, int wy) {
    int tx = std::clamp(wx - screenW / 2, 0, std::max(0, mapPxW - screenW));
    int ty = std::clamp(wy - gamePanelHeight / 2, 0, std::max(0, mapPxH - gamePanelHeight));
    targetCamX = tx;
    targetCamY = ty;
    return std::abs(camX - tx) <= 8 && std::abs(camY - ty) <= 8;
}

void GameEngine::tick() {
    gameTimeMs += 50ULL;
    prevCamX = camX;
    prevCamY = camY;
    if (camX < targetCamX) camX = std::min(targetCamX, camX + 8);
    else if (camX > targetCamX) camX = std::max(targetCamX, camX - 8);
    if (camY < targetCamY) camY = std::min(targetCamY, camY + 8);
    else if (camY > targetCamY) camY = std::max(targetCamY, camY - 8);

    if (appState == 0) {
        tickIntro();
    } else if (appState == 2) {
        tickTitle();
    } else if (appState == 3) {
        tickGameOver();
    } else {
        tickInGame();
    }
}

void GameEngine::tickIntro() {
    if (introStep == 0) {
        if (gameTimeMs - stateTimerMs >= 1400ULL || input.consumeJustPressed(GK_FIRE | GK_LSK | GK_RSK)) {
            introStep = 1;
            stateTimerMs = gameTimeMs;
            input.clearAll();
        }
    } else if (introStep == 1) {
        if (gameTimeMs - stateTimerMs >= 1400ULL || input.consumeJustPressed(GK_FIRE | GK_LSK | GK_RSK)) {
            openMainMenu();
            input.clearAll();
        }
    }
}

void GameEngine::openMainMenu() {
    appState = 2;
    playBgmTrack(0, -1);
    std::vector<std::string> items;
    if (hasSavedGame()) {
        items = {Lang::get(0), Lang::get(1), Lang::get(2), Lang::get(4), Lang::get(5), Lang::get(7), Lang::get(8), Lang::get(9), Lang::get(10)};
    } else {
        items = {Lang::get(1), Lang::get(2), Lang::get(5), Lang::get(7), Lang::get(8), Lang::get(9), Lang::get(10)};
    }
    ownedMainMenu = std::make_unique<Panel>(11, 0);
    ownedMainMenu->setupListMenu(std::move(items), screenW / 2, screenH - 28, 128, screenH / 2 + 20, engine::HCENTER | engine::BOTTOM, engine::HCENTER);
    ownedMainMenu->setSoftkey(0, true);
    ownedMainMenu->setSoftkey(1, false);
    activePanel = ownedMainMenu.get();
    panelStack.clear();
    activePanel->onShow();
}

void GameEngine::tickTitle() {
    titleWaterOff = (titleWaterOff + 1) % 24;
    if (activePanel) activePanel->tick(true);
}

void GameEngine::tickGameOver() {
    if (input.consumeJustPressed(GK_FIRE | GK_LSK | GK_RSK)) {
        input.clearAll();
        openMainMenu();
    }
}

void GameEngine::tickInGame() {
    if (gameMode == 0) tickCampaignEvents();
    if (playState == 10) {
        tickBattle();
        return;
    }

    if (gameTimeMs - waterBlinkMs >= 300ULL) {
        waterBlink = !waterBlink;
        waterBlinkMs = gameTimeMs;
    }

    for (auto& u : units) {
        u->tick();
    }
    for (size_t i = 0; i < worldEffects.size();) {
        worldEffects[i]->tick();
        if (!worldEffects[i]->alive) {
            worldEffects.erase(worldEffects.begin() + static_cast<ptrdiff_t>(i));
        } else {
            ++i;
        }
    }

    if (activePanel) {
        activePanel->tick(true);
        return;
    }

    if (playerControl[static_cast<size_t>(currentPlayer)] == 0) {
        tickAi();
        return;
    }

    // Human player input on map
    if (playState == 0) {
        if (input.consumeJustPressed(GK_RSK)) {
            openInGameMenu();
            return;
        }
        if (input.consumeJustPressed(GK_UP) || input.isRepeat(GK_UP, platform::getUiTicksMs())) {
            setCursorGrid(cursorGx, cursorGy - 1);
        } else if (input.consumeJustPressed(GK_DOWN) || input.isRepeat(GK_DOWN, platform::getUiTicksMs())) {
            setCursorGrid(cursorGx, cursorGy + 1);
        } else if (input.consumeJustPressed(GK_LEFT) || input.isRepeat(GK_LEFT, platform::getUiTicksMs())) {
            setCursorGrid(cursorGx - 1, cursorGy);
        } else if (input.consumeJustPressed(GK_RIGHT) || input.isRepeat(GK_RIGHT, platform::getUiTicksMs())) {
            setCursorGrid(cursorGx + 1, cursorGy);
        } else if (input.consumeJustPressed(GK_0)) {
            minimapPanel = std::make_unique<Panel>(8, 15);
            minimapPanel->setupMinimap(screenW - 16, gamePanelHeight - 16, mapTiles, true);
            minimapPanel->setPos(screenW / 2, gamePanelHeight / 2, engine::HCENTER | engine::VCENTER);
            minimapPanel->setSoftkey(0, false);
            minimapPanel->setSoftkey(1, true);
            pushPanel(minimapPanel.get());
        } else if (input.consumeJustPressed(GK_FIRE)) {
            Unit* u = getUnitAt(cursorGx, cursorGy, 0);
            if (u && u->player == currentPlayer && u->state == 0) {
                selectedUnit = u;
                savedCursorGx = cursorGx;
                savedCursorGy = cursorGy;
                moveCostGrid.assign(static_cast<size_t>(mapW), std::vector<int8_t>(static_cast<size_t>(mapH), 0));
                u->computeMoveGrid(moveCostGrid);
                showMoveRange = true;
                playState = 1;
            } else if (getTerrainAt(cursorGx, cursorGy) == 9 && isBuildingOwnedBy(cursorGx, cursorGy, currentPlayer) && !u) {
                buyPanel = std::make_unique<Panel>(3, 0);
                buyPanel->setPos(0, gamePanelHeight - buyPanel->height, engine::LEFT | engine::TOP);
                buyPanel->setSoftkey(0, true);
                buyPanel->setSoftkey(1, true);
                buyInfoPanel = std::make_unique<Panel>(2, 0);
                buyInfoPanel->setPos(0, buyPanel->targetY - buyInfoPanel->height, engine::LEFT | engine::TOP);
                buyInfoPanel->selectedIdx = 0;
                pushPanel(buyPanel.get());
            } else if (u) {
                unitInfoPanel = std::make_unique<Panel>(5, 0);
                unitInfoPanel->infoUnit = u;
                unitInfoPanel->setPos(0, gamePanelHeight - unitInfoPanel->height, engine::LEFT | engine::TOP);
                unitInfoPanel->setSoftkey(0, false);
                unitInfoPanel->setSoftkey(1, true);
                pushPanel(unitInfoPanel.get());
            } else {
                openInGameMenu();
            }
        }
    } else if (playState == 1) {
        // Selecting move destination
        if (input.consumeJustPressed(GK_RSK)) {
            showMoveRange = false;
            selectedUnit = nullptr;
            setCursorGrid(savedCursorGx, savedCursorGy);
            playState = 0;
            return;
        }
        if (input.consumeJustPressed(GK_UP) || input.isRepeat(GK_UP, platform::getUiTicksMs())) {
            setCursorGrid(cursorGx, cursorGy - 1);
        } else if (input.consumeJustPressed(GK_DOWN) || input.isRepeat(GK_DOWN, platform::getUiTicksMs())) {
            setCursorGrid(cursorGx, cursorGy + 1);
        } else if (input.consumeJustPressed(GK_LEFT) || input.isRepeat(GK_LEFT, platform::getUiTicksMs())) {
            setCursorGrid(cursorGx - 1, cursorGy);
        } else if (input.consumeJustPressed(GK_RIGHT) || input.isRepeat(GK_RIGHT, platform::getUiTicksMs())) {
            setCursorGrid(cursorGx + 1, cursorGy);
        } else if (input.consumeJustPressed(GK_FIRE)) {
            if (selectedUnit && moveCostGrid[static_cast<size_t>(cursorGx)][static_cast<size_t>(cursorGy)] > 0) {
                Unit* occ = getUnitAt(cursorGx, cursorGy, 0);
                if (!occ || occ == selectedUnit) {
                    showMoveRange = false;
                    if (cursorGx != selectedUnit->gridX || cursorGy != selectedUnit->gridY) {
                        selectedUnit->startMoveTo(cursorGx, cursorGy, true, false);
                        playState = 2;
                    } else {
                        startActionMenuForUnit(selectedUnit);
                    }
                }
            }
        }
    } else if (playState == 2) {
        // Unit moving along path
        if (selectedUnit && selectedUnit->state == 0) {
            startActionMenuForUnit(selectedUnit);
        }
    } else if (playState == 3) {
        // Selecting attack target
        if (input.consumeJustPressed(GK_RSK)) {
            showAttackRange = false;
            attackTargets.clear();
            startActionMenuForUnit(selectedUnit);
            return;
        }
        if (!attackTargets.empty()) {
            if (input.consumeJustPressed(GK_LEFT) || input.consumeJustPressed(GK_UP)) {
                attackTargetIdx = (attackTargetIdx - 1 + static_cast<int>(attackTargets.size())) % static_cast<int>(attackTargets.size());
                setCursorGrid(attackTargets[static_cast<size_t>(attackTargetIdx)]->gridX,
                              attackTargets[static_cast<size_t>(attackTargetIdx)]->gridY);
            } else if (input.consumeJustPressed(GK_RIGHT) || input.consumeJustPressed(GK_DOWN)) {
                attackTargetIdx = (attackTargetIdx + 1) % static_cast<int>(attackTargets.size());
                setCursorGrid(attackTargets[static_cast<size_t>(attackTargetIdx)]->gridX,
                              attackTargets[static_cast<size_t>(attackTargetIdx)]->gridY);
            } else if (input.consumeJustPressed(GK_FIRE)) {
                showAttackRange = false;
                Unit* target = attackTargets[static_cast<size_t>(attackTargetIdx)];
                attackTargets.clear();
                startBattle(selectedUnit, target);
            }
        }
    }
}

void GameEngine::startActionMenuForUnit(Unit* u) {
    if (!u) { playState = 0; return; }
    currentActionIds.clear();
    std::vector<std::string> labels;
    std::vector<ImageRegion> icons;

    attackTargets = u->findTargets(u->gridX, u->gridY, 0);
    if (!attackTargets.empty()) {
        currentActionIds.push_back(0);
        labels.push_back(Lang::get(61)); // ATTACK
        if (actionIcons.size() > 0) icons.push_back(actionIcons[0]);
    }
    int8_t ter = getTerrainAt(u->gridX, u->gridY);
    if (u->hasAbility(8) && ter == 8 && !isBuildingAllied(u->gridX, u->gridY, playerAlliance[currentPlayer])) {
        currentActionIds.push_back(1);
        labels.push_back(Lang::get(66)); // OCCUPY
        if (actionIcons.size() > 1) icons.push_back(actionIcons[1]);
    }
    if (u->hasAbility(16) && ter == 9 && !isBuildingAllied(u->gridX, u->gridY, playerAlliance[currentPlayer])) {
        currentActionIds.push_back(1);
        labels.push_back(Lang::get(66)); // OCCUPY castle
        if (actionIcons.size() > 1) icons.push_back(actionIcons[1]);
    }
    if (u->hasAbility(32)) {
        auto graves = u->findTargets(u->gridX, u->gridY, 1);
        if (!graves.empty()) {
            currentActionIds.push_back(2);
            labels.push_back(Lang::get(68)); // RAISE
            if (actionIcons.size() > 2) icons.push_back(actionIcons[2]);
        }
    }
    currentActionIds.push_back(3);
    labels.push_back(Lang::get(63)); // END MOVE
    if (actionIcons.size() > 3) icons.push_back(actionIcons[3]);

    ownedPopup = std::make_unique<Panel>(0, 15);
    ownedPopup->setupRadialMenu(std::move(labels), std::move(icons), screenW / 2, gamePanelHeight / 2, -1,
                                engine::HCENTER | engine::VCENTER, 1);
    ownedPopup->setSoftkey(0, true);
    ownedPopup->setSoftkey(1, true);
    pushPanel(ownedPopup.get());
}

void GameEngine::openInGameMenu() {
    std::vector<std::string> items = {
        Lang::get(65), // END TURN
        Lang::get(3),  // SAVE GAME
        Lang::get(4),  // LOAD GAME
        Lang::get(7),  // SETTINGS
        Lang::get(8),  // INSTRUCTIONS
        Lang::get(59)  // MAIN MENU
    };
    ownedInGameMenu = std::make_unique<Panel>(11, 0);
    ownedInGameMenu->setupListMenu(std::move(items), screenW / 2, gamePanelHeight / 2, 136, gamePanelHeight - 24,
                                   engine::HCENTER | engine::VCENTER, engine::HCENTER);
    ownedInGameMenu->setSoftkey(0, true);
    ownedInGameMenu->setSoftkey(1, true);
    pushPanel(ownedInGameMenu.get());
}

void GameEngine::openSkirmishSetup() {
    std::vector<std::string> mapList = skirmishMapNames;
    ownedSubPanel = std::make_unique<Panel>(11, 0);
    ownedSubPanel->setupListMenu(std::move(mapList), screenW / 2, gamePanelHeight / 2, 156, gamePanelHeight - 36,
                                 engine::HCENTER | engine::VCENTER, engine::HCENTER);
    ownedSubPanel->setSoftkey(0, true);
    ownedSubPanel->setSoftkey(1, true);
    pushPanel(ownedSubPanel.get());
}

void GameEngine::startBattle(Unit* att, Unit* def) {
    attackerUnit = att;
    defenderUnit = def;
    int dmg = att->dealDamageTo(def);
    (void)dmg;
    bool counter = (def->hp > 0 && def->canCounter(att, att->gridX, att->gridY));
    if (counter) {
        def->dealDamageTo(att);
    }

    if (!optFightAnim || def->state == 4) {
        if (def->state == 4) {
            destroyTownAt(playerTeam[att->player], def->gridX, def->gridY);
        } else {
            if (def->hp <= 0) {
                if (def->unitType == 9) def->state = 3;
                else def->removeFromWorld();
            }
            if (att->hp <= 0) {
                if (att->unitType == 9) att->state = 3;
                else att->removeFromWorld();
            }
        }
        if (att->hp > 0) {
            att->tryPromote();
            att->endTurnAction();
        }
        tempUnits.clear();
        selectedUnit = nullptr;
        playState = 0;
        checkVictoryConditions();
        return;
    }

    battleSprites.clear();
    battleLeft = std::make_unique<BattleSide>(this, att, nullptr);
    battleRight = std::make_unique<BattleSide>(this, def, battleLeft.get());
    battleLeft->other = battleRight.get();
    battleLeft->endHp = static_cast<int8_t>(att->hp);
    battleRight->endHp = static_cast<int8_t>(def->hp);
    battleLeft->endCount = static_cast<int8_t>(att->hp > 0 ? att->getSquadVisualCount() : 0);
    battleRight->endCount = static_cast<int8_t>(def->hp > 0 ? def->getSquadVisualCount() : 0);

    battlePhase = 0;
    battleTimerMs = gameTimeMs;
    battleShakeActive = false;
    playState = 10;
    battleLeft->startAttack();
    playBgmTrack((att->player == 0) ? 4 : 5, -1);
}

void GameEngine::tickBattle() {
    if (battleShakeActive) {
        if (gameTimeMs >= battleShakeEndMs) {
            battleShakeActive = false;
            battleShakeOffX = 0;
            battleShakeOffY = 0;
        } else {
            battleShakeOffX = GameRng::range(-2, 3);
            battleShakeOffY = GameRng::range(-2, 3);
        }
    }
    for (size_t i = 0; i < battleSprites.size();) {
        battleSprites[i]->prevX = battleSprites[i]->x;
        battleSprites[i]->prevY = battleSprites[i]->y;
        battleSprites[i]->prevZOff = battleSprites[i]->zOff;
        battleSprites[i]->tick();
        if (!battleSprites[i]->alive) {
            battleSprites.erase(battleSprites.begin() + static_cast<ptrdiff_t>(i));
        } else {
            ++i;
        }
    }
    if (battleLeft) battleLeft->tick();
    if (battleRight) battleRight->tick();

    if (input.consumeJustPressed(GK_FIRE | GK_LSK | GK_RSK)) {
        finishBattle();
        return;
    }

    if (battlePhase == 0 && battleLeft && battleLeft->actionDone) {
        if (defenderUnit && defenderUnit->hp > 0 && defenderUnit->canCounter(attackerUnit, attackerUnit->gridX, attackerUnit->gridY)) {
            battlePhase = 1;
            battleRight->startAttack();
        } else {
            finishBattle();
        }
    } else if (battlePhase == 1 && battleRight && battleRight->actionDone) {
        finishBattle();
    }
}

void GameEngine::finishBattle() {
    battleLeft.reset();
    battleRight.reset();
    battleSprites.clear();
    if (defenderUnit && defenderUnit->hp <= 0) {
        if (defenderUnit->unitType == 9) defenderUnit->state = 3;
        else defenderUnit->removeFromWorld();
    }
    if (attackerUnit && attackerUnit->hp <= 0) {
        if (attackerUnit->unitType == 9) attackerUnit->state = 3;
        else attackerUnit->removeFromWorld();
    }
    if (attackerUnit && attackerUnit->hp > 0) {
        attackerUnit->tryPromote();
        attackerUnit->endTurnAction();
    }
    attackerUnit = nullptr;
    defenderUnit = nullptr;
    selectedUnit = nullptr;
    tempUnits.clear();
    playState = 0;
    playBgmTrack((playerTeam[currentPlayer] == 1) ? 2 : 3, -1);
    checkVictoryConditions();
}

void GameEngine::beginPlayerTurn() {
    for (const auto& u : units) {
        if (u->player == currentPlayer) {
            if (u->state == 2) u->state = 0;
            if ((u->statusFlags & 1) != 0) {
                u->hp = std::max(1, u->hp - 10);
                if (u->poisonTurn != currentPlayer) u->removeStatus(1);
            }
            if (isBuildingOwnedBy(u->gridX, u->gridY, currentPlayer) && u->hp < 100) {
                u->hp = std::min(100, u->hp + 20);
            }
        }
    }
    int income = 0;
    for (const auto& b : buildings) {
        if (b[2] == playerTeam[currentPlayer]) {
            int8_t ter = getTerrainAt(b[0], b[1]);
            income += (ter == 9) ? 100 : 50;
        }
    }
    playerGold[currentPlayer] += income;
    if (playerControl[currentPlayer] == 0) {
        aiPendingUnits.clear();
        for (const auto& u : units) {
            if (u->player == currentPlayer && u->state == 0) {
                aiPendingUnits.push_back(u.get());
            }
        }
        aiPhase = 0;
        aiActiveUnit = nullptr;
    }
    playBgmTrack((playerTeam[currentPlayer] == 1) ? 2 : 3, -1);
}

void GameEngine::advanceToNextPlayer() {
    playerLastCursor[currentPlayer][0] = static_cast<int8_t>(cursorGx);
    playerLastCursor[currentPlayer][1] = static_cast<int8_t>(cursorGy);
    do {
        currentPlayer = static_cast<int8_t>((currentPlayer + 1) % playerCount);
        if (currentPlayer == 0) ++turnNumber;
    } while (playerControl[currentPlayer] == 2);
    setCursorGrid(playerLastCursor[currentPlayer][0], playerLastCursor[currentPlayer][1]);
    beginPlayerTurn();
}

int GameEngine::countAliveUnits(int8_t typeFilter, int stateFilter, int8_t plr) const {
    int cnt = 0;
    for (const auto& u : units) {
        if ((plr < 0 || u->player == plr) &&
            (typeFilter < 0 || u->unitType == typeFilter) &&
            (stateFilter < 0 || u->state == stateFilter)) {
            ++cnt;
        }
    }
    return cnt;
}

void GameEngine::checkVictoryConditions() {
    if (appState != 1) return;
    int humanAlive = 0;
    int enemyAlive = 0;
    for (int p = 0; p < playerCount; ++p) {
        if (playerControl[p] == 2) continue;
        int c = countAliveUnits(-1, 0, static_cast<int8_t>(p)) + countAliveUnits(-1, 2, static_cast<int8_t>(p));
        if (playerAlliance[p] == 0) humanAlive += c;
        else enemyAlive += c;
    }
    if (humanAlive == 0) {
        appState = 3;
        playBgmTrack(7, 1);
    } else if (enemyAlive == 0) {
        isMissionWon = true;
        playBgmTrack(6, 1);
        showBanner(Lang::get(70), Lang::get(75) + " " + Lang::get(0), 2500);
        if (gameMode == 0 && missionIdx + 1 < 8) {
            maxCampaignUnlocked = std::max(maxCampaignUnlocked, missionIdx + 1);
            saveSettingsRecord();
        }
    }
}

void GameEngine::showBanner(const std::string& title, const std::string& body, int autoMs) {
    ownedBottomBanner = std::make_unique<Panel>(10, 0);
    ownedBottomBanner->setupTextBox(title, body, screenW - 16, -1);
    ownedBottomBanner->setPos(screenW / 2, gamePanelHeight / 2, engine::HCENTER | engine::VCENTER);
    ownedBottomBanner->autoCloseMs = autoMs;
    ownedBottomBanner->setSoftkey(0, true);
    pushPanel(ownedBottomBanner.get());
}

void GameEngine::showSpeech(int strId, int8_t portrait, int8_t side) {
    ownedDialog = std::make_unique<Panel>(7, 0);
    ownedDialog->setupSpeechDialog(Lang::get(strId), screenW - 16, gamePanelHeight / 2, portrait, side);
    ownedDialog->setPos(screenW / 2, gamePanelHeight - 8, engine::HCENTER | engine::BOTTOM);
    ownedDialog->setSoftkey(0, true);
    pushPanel(ownedDialog.get());
}

void GameEngine::onPanelAction(Panel* panel, int itemIdx, const std::string& itemText, int8_t actionType) {
    if (actionType == 1) { // RSK / Cancel
        if (panel == buyPanel.get()) {
            buyInfoPanel.reset();
            popPanel(nullptr);
            buyPanel.reset();
            tempUnits.clear();
        } else if (panel == ownedPopup.get()) {
            popPanel(nullptr);
            if (selectedUnit) {
                selectedUnit->setGridPos(savedCursorGx, savedCursorGy);
                setCursorGrid(savedCursorGx, savedCursorGy);
                selectedUnit = nullptr;
            }
            playState = 0;
        } else {
            popPanel(nullptr);
        }
        return;
    }

    if (panel == ownedMainMenu.get()) {
        if (itemText == Lang::get(0)) { // PLAY / CONTINUE
            if (loadSavedGame()) {
                appState = 1;
                activePanel = nullptr;
                panelStack.clear();
                playBgmTrack(2, -1);
            }
        } else if (itemText == Lang::get(1)) { // NEW GAME
            startNewCampaign(0);
        } else if (itemText == Lang::get(2)) { // SELECT LEVEL
            std::vector<std::string> stages;
            for (int i = 0; i <= std::min(7, maxCampaignUnlocked); ++i) {
                stages.push_back(Lang::get(121 + i));
            }
            selectLevelPanel = std::make_unique<Panel>(11, 0);
            selectLevelPanel->setupListMenu(std::move(stages), screenW / 2, screenH / 2, 160, screenH - 40,
                                            engine::HCENTER | engine::VCENTER, engine::HCENTER);
            selectLevelPanel->setSoftkey(0, true);
            selectLevelPanel->setSoftkey(1, true);
            pushPanel(selectLevelPanel.get());
        } else if (itemText == Lang::get(4)) { // LOAD GAME
            if (loadSavedGame()) {
                appState = 1;
                activePanel = nullptr;
                panelStack.clear();
            }
        } else if (itemText == Lang::get(5)) { // SKIRMISH
            openSkirmishSetup();
        } else if (itemText == Lang::get(7)) { // SETTINGS
            std::vector<std::string> opts = {
                Lang::get(36) + ": " + Lang::get(optSound ? 39 : 40),
                Lang::get(34) + ": " + Lang::get(optFightAnim ? 39 : 40),
                Lang::get(38) + ": " + Lang::get(optVibrate ? 39 : 40),
                Lang::get(41)
            };
            settingsPanel = std::make_unique<Panel>(11, 0);
            settingsPanel->setupListMenu(std::move(opts), screenW / 2, screenH / 2, 160, screenH - 40,
                                         engine::HCENTER | engine::VCENTER, engine::HCENTER);
            settingsPanel->setSoftkey(0, true);
            settingsPanel->setSoftkey(1, true);
            pushPanel(settingsPanel.get());
        } else if (itemText == Lang::get(8)) { // INSTRUCTIONS
            helpPanel = std::make_unique<Panel>(10, 0);
            helpPanel->setupTextBox(Lang::get(8),
                Lang::getWithKeys(12) + "\n\nControls: Arrows/WASD move, Enter/Space/5 confirm, Q/Tab LSK, E/Backspace RSK, 0 Minimap, F4 Display 1920x1080/x8.",
                screenW - 16, screenH - 32);
            helpPanel->setPos(screenW / 2, screenH / 2, engine::HCENTER | engine::VCENTER);
            helpPanel->setSoftkey(0, true);
            helpPanel->setSoftkey(1, true);
            pushPanel(helpPanel.get());
        } else if (itemText == Lang::get(9)) { // ABOUT
            helpPanel = std::make_unique<Panel>(10, 0);
            helpPanel->setupTextBox(Lang::get(9), Lang::format(14, "1.0.2"), screenW - 16, screenH - 32);
            helpPanel->setPos(screenW / 2, screenH / 2, engine::HCENTER | engine::VCENTER);
            helpPanel->setSoftkey(0, true);
            helpPanel->setSoftkey(1, true);
            pushPanel(helpPanel.get());
        } else if (itemText == Lang::get(10)) { // EXIT
            std::exit(0);
        }
    } else if (panel == selectLevelPanel.get()) {
        startNewCampaign(itemIdx);
    } else if (panel == ownedSubPanel.get()) {
        selectedSkirmishMap = itemIdx;
        startSkirmishMatch();
    } else if (panel == settingsPanel.get()) {
        if (itemIdx == 0) {
            optSound = !optSound;
            if (!optSound) stopBgmTrack();
            else playBgmTrack(appState == 1 ? 2 : 0, -1);
            saveSettingsRecord();
        } else if (itemIdx == 1) {
            optFightAnim = !optFightAnim;
            saveSettingsRecord();
        } else if (itemIdx == 2) {
            optVibrate = !optVibrate;
            saveSettingsRecord();
        } else {
            popPanel(nullptr);
            return;
        }
        panel->items[0] = Lang::get(36) + ": " + Lang::get(optSound ? 39 : 40);
        panel->items[1] = Lang::get(34) + ": " + Lang::get(optFightAnim ? 39 : 40);
        panel->items[2] = Lang::get(38) + ": " + Lang::get(optVibrate ? 39 : 40);
    } else if (panel == ownedInGameMenu.get()) {
        if (itemIdx == 0) { // END TURN
            popPanel(nullptr);
            advanceToNextPlayer();
        } else if (itemIdx == 1) { // SAVE GAME
            popPanel(nullptr);
            if (saveCurrentGame()) showBanner("", Lang::get(76), 1200);
        } else if (itemIdx == 2) { // LOAD GAME
            popPanel(nullptr);
            if (loadSavedGame()) showBanner("", Lang::get(77), 1200);
        } else if (itemIdx == 3) { // SETTINGS
            std::vector<std::string> opts = {
                Lang::get(36) + ": " + Lang::get(optSound ? 39 : 40),
                Lang::get(34) + ": " + Lang::get(optFightAnim ? 39 : 40),
                Lang::get(38) + ": " + Lang::get(optVibrate ? 39 : 40),
                Lang::get(41)
            };
            settingsPanel = std::make_unique<Panel>(11, 0);
            settingsPanel->setupListMenu(std::move(opts), screenW / 2, screenH / 2, 160, screenH - 40,
                                         engine::HCENTER | engine::VCENTER, engine::HCENTER);
            settingsPanel->setSoftkey(0, true);
            settingsPanel->setSoftkey(1, true);
            pushPanel(settingsPanel.get());
        } else if (itemIdx == 4) { // INSTRUCTIONS
            helpPanel = std::make_unique<Panel>(10, 0);
            helpPanel->setupTextBox(Lang::get(8), Lang::getWithKeys(12), screenW - 16, gamePanelHeight - 24);
            helpPanel->setPos(screenW / 2, gamePanelHeight / 2, engine::HCENTER | engine::VCENTER);
            helpPanel->setSoftkey(0, true);
            helpPanel->setSoftkey(1, true);
            pushPanel(helpPanel.get());
        } else if (itemIdx == 5) { // MAIN MENU
            popPanel(nullptr);
            openMainMenu();
        }
    } else if (panel == ownedPopup.get()) {
        if (itemIdx >= 0 && itemIdx < static_cast<int>(currentActionIds.size())) {
            int act = currentActionIds[static_cast<size_t>(itemIdx)];
            popPanel(nullptr);
            if (act == 0) { // ATTACK
                attackTargetIdx = 0;
                showAttackRange = true;
                if (!attackTargets.empty()) {
                    setCursorGrid(attackTargets[0]->gridX, attackTargets[0]->gridY);
                }
                playState = 3;
            } else if (act == 1 && selectedUnit) { // OCCUPY
                setBuildingOwner(selectedUnit->gridX, selectedUnit->gridY, playerTeam[currentPlayer]);
                selectedUnit->endTurnAction();
                selectedUnit = nullptr;
                playState = 0;
                showBanner("", Lang::get(71), 1000);
                checkVictoryConditions();
            } else if (act == 2 && selectedUnit) { // RAISE
                auto graves = selectedUnit->findTargets(selectedUnit->gridX, selectedUnit->gridY, 1);
                if (!graves.empty()) {
                    Unit* g = graves[0];
                    Unit* skel = Unit::create(10, currentPlayer, g->gridX, g->gridY, true);
                    skel->endTurnAction();
                    g->removeFromWorld();
                }
                selectedUnit->endTurnAction();
                selectedUnit = nullptr;
                playState = 0;
            } else if (act == 3 && selectedUnit) { // END MOVE
                selectedUnit->endTurnAction();
                selectedUnit = nullptr;
                playState = 0;
            }
        }
    } else if (panel == buyPanel.get()) {
        if (actionType == 2 || actionType == 3) {
            if (buyInfoPanel) buyInfoPanel->selectedIdx = itemIdx;
        } else if (actionType == 0) {
            if (itemIdx >= 0 && itemIdx < static_cast<int>(buyPanel->buyUnits.size())) {
                Unit* tmpl = buyPanel->buyUnits[static_cast<size_t>(itemIdx)];
                if (tmpl->cost <= playerGold[currentPlayer]) {
                    playerGold[currentPlayer] -= tmpl->cost;
                    if (tmpl->state == 3) {
                        tmpl->state = 2;
                        tmpl->hp = 100;
                        tmpl->setGridPos(cursorGx, cursorGy);
                    } else {
                        Unit* spawned = Unit::create(tmpl->unitType, currentPlayer, cursorGx, cursorGy, true);
                        spawned->endTurnAction();
                    }
                    buyInfoPanel.reset();
                    popPanel(nullptr);
                    buyPanel.reset();
                    tempUnits.clear();
                }
            }
        }
    } else {
        popPanel(nullptr);
        if (isMissionWon && gameMode == 0 && missionIdx + 1 < 8) {
            isMissionWon = false;
            startNewCampaign(missionIdx + 1);
        } else if (isMissionWon) {
            isMissionWon = false;
            openMainMenu();
        }
    }
}

void GameEngine::render(engine::GraphicsContext& g, float renderAlpha, bool smooth60Fps) {
    if (appState == 0) {
        drawIntro(g);
    } else if (appState == 2) {
        drawTitle(g);
    } else if (appState == 3) {
        drawGameOver(g);
    } else if (playState == 10) {
        drawBattle(g, renderAlpha, smooth60Fps);
    } else {
        drawInGame(g, renderAlpha, smooth60Fps);
    }
    if (activePanel && appState != 0 && appState != 3) {
        if (buyInfoPanel && activePanel == buyPanel.get()) {
            buyInfoPanel->draw(g);
        }
        activePanel->draw(g);
    }
}

void GameEngine::drawIntro(engine::GraphicsContext& g) {
    g.setColor(0xFFFFFF);
    g.fillRect(0, 0, screenW, screenH);
    if (introStep == 0 && msLogo.isValid()) {
        msLogo.draw(g, screenW / 2, screenH / 2, engine::HCENTER | engine::VCENTER);
    } else if (aeLogo.isValid()) {
        aeLogo.draw(g, screenW / 2, screenH / 2, engine::HCENTER | engine::VCENTER);
    } else {
        g.setColor(0x142238);
        g.setFontId(0);
        g.drawString("ANCIENT EMPIRES II", screenW / 2, screenH / 2, engine::HCENTER | engine::VCENTER);
    }
}

void GameEngine::drawTitle(engine::GraphicsContext& g) {
    drawActiveScreenBackground(g);
}

void GameEngine::drawActiveScreenBackground(engine::GraphicsContext& g) {
    if (appState == 2) {
        g.setColor(0x102848);
        g.fillRect(0, 0, screenW, screenH);
        if (!tileRegions.empty()) {
            for (int x = -24 + titleWaterOff; x < screenW; x += 24) {
                for (int y = 0; y < screenH; y += 24) {
                    tileRegions[0].draw(g, x, y);
                }
            }
        }
        if (aeLogo.isValid()) {
            aeLogo.draw(g, screenW / 2, 16, engine::HCENTER | engine::TOP);
        } else {
            Panel::drawFramedBox(g, screenW / 2 - 96, 18, 192, 34, 0);
            g.setColor(0xFFFFFF);
            g.setFontId(0);
            g.drawString("ANCIENT EMPIRES II", screenW / 2, 35, engine::HCENTER | engine::VCENTER);
        }
    } else {
        drawInGame(g, 1.0f, false);
    }
}

void GameEngine::drawInGame(engine::GraphicsContext& g, float renderAlpha, bool smooth60Fps) {
    g.setColor(0);
    g.fillRect(0, 0, screenW, screenH);
    int rCamX = (smooth60Fps && interpValid) ? engine::lerpCoordRound(prevCamX, camX, renderAlpha, true) : camX;
    int rCamY = (smooth60Fps && interpValid) ? engine::lerpCoordRound(prevCamY, camY, renderAlpha, true) : camY;

    g.setClip(0, 0, screenW, gamePanelHeight);
    g.translate(-rCamX, -rCamY);

    int col0 = std::max(0, rCamX / 24);
    int col1 = std::min(mapW - 1, (rCamX + screenW) / 24 + 1);
    int row0 = std::max(0, rCamY / 24);
    int row1 = std::min(mapH - 1, (rCamY + gamePanelHeight) / 24 + 1);

    for (int cx = col0; cx <= col1; ++cx) {
        for (int cy = row0; cy <= row1; ++cy) {
            int tid = static_cast<uint8_t>(mapTiles[static_cast<size_t>(cx)][static_cast<size_t>(cy)]);
            if (tid >= 0 && tid < static_cast<int>(tileRegions.size())) {
                tileRegions[static_cast<size_t>(tid)].draw(g, cx * 24, cy * 24);
            }
        }
    }

    if (showMoveRange && alphaSprite) {
        for (int cx = col0; cx <= col1; ++cx) {
            for (int cy = row0; cy <= row1; ++cy) {
                if (moveCostGrid[static_cast<size_t>(cx)][static_cast<size_t>(cy)] > 0) {
                    alphaSprite->drawFrame(g, 0, cx * 24, cy * 24, 0);
                }
            }
        }
    } else if (showAttackRange && alphaSprite) {
        for (Unit* t : attackTargets) {
            alphaSprite->drawFrame(g, 1, t->gridX * 24, t->gridY * 24, 0);
        }
    }

    for (const auto& u : units) {
        if (u->state == 3) {
            u->drawUnit(g, 0, 0, true);
        }
    }
    for (const auto& u : units) {
        if (u->state != 3) {
            int ix = (smooth60Fps && interpValid) ? engine::lerpCoordRound(u->prevX, u->x, renderAlpha, true) : u->x;
            int iy = (smooth60Fps && interpValid) ? engine::lerpCoordRound(u->prevY, u->y, renderAlpha, true) : u->y;
            u->drawUnit(g, 0, 0, false, ix, iy, smooth60Fps && interpValid);
            u->drawHpBadge(g, 0, 0, ix, iy, smooth60Fps && interpValid);
        }
    }

    for (const auto& ef : worldEffects) {
        ef->draw(g, 0, 0);
    }

    if (showCursor && cursorSprite && !activePanel) {
        cursorSprite->drawFrame(g, waterBlink ? 1 : 0, cursorGx * 24, cursorGy * 24, 0);
    }

    g.translate(rCamX, rCamY);
    g.setClip(0, 0, screenW, screenH);
    drawTopHud(g);
}

void GameEngine::drawTopHud(engine::GraphicsContext& g) {
    g.setColor(0x182438);
    g.fillRect(0, gamePanelHeight, screenW, screenH - gamePanelHeight);
    g.setColor(kTeamColors[playerTeam[currentPlayer]]);
    g.fillRect(0, gamePanelHeight, 6, screenH - gamePanelHeight);
    std::string goldStr = std::to_string(playerGold[currentPlayer]);
    if (hudIcons2) hudIcons2->drawFrame(g, 1, 10, gamePanelHeight + 8, engine::LEFT | engine::VCENTER);
    SpriteFont::draw(g, goldStr, 24, gamePanelHeight + 8, 0, engine::LEFT | engine::VCENTER);

    std::string turnStr = "T" + std::to_string(turnNumber);
    g.setColor(0xFFFFFF);
    g.setFontId(1);
    g.drawString(turnStr, screenW / 2, gamePanelHeight + 8, engine::HCENTER | engine::VCENTER);

    if (!activePanel && playerControl[currentPlayer] == 1) {
        drawSoftkeyLabel(g, GK_RSK, 1, screenH);
    }
}

void GameEngine::drawSoftkeyLabel(engine::GraphicsContext& g, int32_t keyBit, int side, int yBottom) {
    std::string txt = (keyBit == GK_LSK) ? Lang::get(11) : Lang::get(41);
    g.setColor(0xFFFFFF);
    g.setFontId(1);
    if (side == 0) {
        g.drawString(txt, 4, yBottom - 2, engine::LEFT | engine::BOTTOM);
    } else {
        g.drawString(txt, screenW - 4, yBottom - 2, engine::RIGHT | engine::BOTTOM);
    }
}

void GameEngine::drawBattle(engine::GraphicsContext& g, float renderAlpha, bool smooth60Fps) {
    g.setColor(0);
    g.fillRect(0, 0, screenW, screenH);
    if (battleLeft) battleLeft->drawBackground(g, battleShakeOffX, battleShakeOffY);
    if (battleRight) battleRight->drawBackground(g, battleHalfW + battleShakeOffX, battleShakeOffY);
    if (battleLeft) battleLeft->drawShadows(g);
    if (battleRight) battleRight->drawShadows(g);

    for (const auto& sp : battleSprites) {
        if (!sp->drawOver) {
            int sx = (smooth60Fps && interpValid) ? engine::lerpCoordRound(sp->prevX, sp->x, renderAlpha, true) : sp->x;
            int sy = (smooth60Fps && interpValid) ? engine::lerpCoordRound(sp->prevY, sp->y, renderAlpha, true) : sp->y;
            int savedX = sp->x, savedY = sp->y;
            sp->x = sx;
            sp->y = sy + sp->zOff;
            sp->draw(g, battleShakeOffX, battleShakeOffY);
            sp->x = savedX;
            sp->y = savedY;
        }
    }
    for (const auto& sp : battleSprites) {
        if (sp->drawOver) {
            sp->draw(g, battleShakeOffX, battleShakeOffY);
        }
    }

    g.setColor(0x142034);
    g.fillRect(0, battleViewH, screenW, kBattleHudHeight);
    if (battleLeft) battleLeft->drawHpText(g);
    if (battleRight) {
        g.translate(battleHalfW, 0);
        battleRight->drawHpText(g);
        g.translate(-battleHalfW, 0);
    }
}

void GameEngine::drawGameOver(engine::GraphicsContext& g) {
    g.setColor(0);
    g.fillRect(0, 0, screenW, screenH);
    if (gameoverLogo.isValid()) {
        gameoverLogo.draw(g, screenW / 2, screenH / 2, engine::HCENTER | engine::VCENTER);
    } else {
        g.setColor(0xFF4040);
        g.setFontId(0);
        g.drawString(Lang::get(57), screenW / 2, screenH / 2, engine::HCENTER | engine::VCENTER);
    }
}

} // namespace game
