#include "game/GameEngine.hpp"
#include "platform/SaveSystem.hpp"

#include <algorithm>
#include <cmath>
#include <cstdlib>

namespace game {

void GameEngine::clearMapState() {
    units.clear();
    tempUnits.clear();
    worldEffects.clear();
    battleSprites.clear();
    buildings.clear();
    brokenTowns.clear();
    buildingSmoke.clear();
    buildingOccupier.clear();
    buildingScore.clear();
    selectedUnit = nullptr;
    lastMovedUnit = nullptr;
    attackerUnit = nullptr;
    defenderUnit = nullptr;
    attackTargets.clear();
    for (int p = 0; p < kMaxPlayers; ++p) {
        commanderCount[p] = 0;
        mainCommander[p] = nullptr;
        for (int s = 0; s < 8; ++s) commanders[p][s] = nullptr;
    }
    interpValid = false;
}

void GameEngine::loadMap(int idx) {
    stopBgmTrack();
    clearMapState();
    turnNumber = 1;
    currentPlayer = 0;
    campaignEventStep = 0;
    isMissionWon = false;
    missionDefeated = false;
    showMoveRange = false;
    showAttackRange = false;
    playState = 0;

    std::string mapName;
    if (gameMode == 0) {
        mapTitle = Lang::get(113 + idx);
        mapName = "m" + std::to_string(idx);
    } else {
        mapTitle = skirmishMapNames[static_cast<size_t>(idx)];
        mapName = "s" + std::to_string(idx);
    }
    const auto* bytes = PakStore::getBytes(mapName);
    if (!bytes) return;
    engine::ByteReader r(*bytes);

    mapW = r.readInt();
    mapH = r.readInt();
    mapPxW = mapW * 24;
    mapPxH = mapH * 24;
    mapTiles.assign(static_cast<size_t>(mapW), std::vector<int8_t>(static_cast<size_t>(mapH), 0));
    moveCostGrid.assign(static_cast<size_t>(mapW), std::vector<int8_t>(static_cast<size_t>(mapH), 0));
    aiFloodGrid.assign(static_cast<size_t>(mapW), std::vector<int8_t>(static_cast<size_t>(mapH), 0));

    std::array<int8_t, 5> teamToPlayer{};
    teamToPlayer.fill(-1);
    if (gameMode == 1) playerCount = 0;

    for (int gx = 0; gx < mapW; ++gx) {
        for (int gy = 0; gy < mapH; ++gy) {
            int8_t tid = r.readByte();
            mapTiles[static_cast<size_t>(gx)][static_cast<size_t>(gy)] = tid;
            if (tid >= castleTileStart || tid == 27) {
                int ownerTeam = 0;
                if (tid >= castleTileStart) {
                    int bOff = tid - castleTileStart;
                    ownerTeam = (bOff % 4) + 1;
                }
                buildings.push_back({static_cast<int8_t>(gx), static_cast<int8_t>(gy), static_cast<int8_t>(ownerTeam)});
                if (getTerrainAt(gx, gy) == 9 && gameMode == 1 && ownerTeam != 0 && teamToPlayer[ownerTeam] == -1) {
                    if (playerCount < kMaxPlayers) {
                        playerTeam[playerCount] = static_cast<int8_t>(ownerTeam);
                        teamToPlayer[ownerTeam] = static_cast<int8_t>(playerCount);
                        ++playerCount;
                    }
                }
            }
        }
    }

    if (gameMode == 1) {
        for (int p = 0; p < playerCount; ++p) {
            playerGold[p] = kSkirmishStartingGold[skirmishGoldIdx];
            playerControl[p] = static_cast<int8_t>(skirmishControlSel[p]);
            playerAlliance[p] = static_cast<int8_t>(skirmishTeamSel[p]);
        }
    } else {
        playerCount = 2;
        playerGold[0] = 0;
        playerGold[1] = 0;
        teamToPlayer[1] = 0;
        teamToPlayer[2] = 1;
        playerTeam[0] = 1;
        playerTeam[1] = 2;
        playerControl[0] = 1;
        playerControl[1] = 0;
        playerAlliance[0] = 0;
        playerAlliance[1] = 1;
        skirmishMaxUnits = 100;
    }

    int extraCount = r.readInt();
    r.skip(static_cast<size_t>(std::max(0, extraCount)) * 4);

    int unitCount = r.readInt();
    for (int i = 0; i < unitCount; ++i) {
        int8_t rawType = r.readByte();
        int gx = r.readShort() / 24;
        int gy = r.readShort() / 24;
        int8_t uType = static_cast<int8_t>(rawType % 12);
        int team = 1 + rawType / 12;
        int8_t plr = (team >= 1 && team <= 4 && teamToPlayer[team] >= 0) ? teamToPlayer[team] : 0;
        if (plr < playerCount && playerControl[plr] != 2) {
            Unit* u = Unit::create(uType, plr, gx, gy, true);
            if (uType == 9) mainCommander[plr] = u;
        }
    }

    buildingOccupier.assign(buildings.size(), nullptr);
    buildingScore.assign(buildings.size(), 0);
    buildingRepairTurn.assign(buildings.size(), 0);

    for (int p = 0; p < playerCount; ++p) {
        if (mainCommander[p]) {
            playerLastCursor[p][0] = static_cast<int8_t>(mainCommander[p]->gridX);
            playerLastCursor[p][1] = static_cast<int8_t>(mainCommander[p]->gridY);
        }
    }

    if (gameMode == 1) {
        for (int p = 0; p < playerCount; ++p) {
            if (playerControl[p] != 2) {
                currentPlayer = static_cast<int8_t>(p);
                break;
            }
        }
    }

    if (mainCommander[currentPlayer]) {
        setCursorGrid(mainCommander[currentPlayer]->gridX, mainCommander[currentPlayer]->gridY);
        centerCameraOnGrid(mainCommander[currentPlayer]->gridX, mainCommander[currentPlayer]->gridY);
    } else {
        setCursorGrid(0, 0);
        centerCameraOnGrid(0, 0);
    }
    interpValid = false;
    beginPlayerTurn();
}

void GameEngine::startNewCampaign(int stage) {
    gameMode = 0;
    missionIdx = std::clamp(stage, 0, 7);
    appState = 1;
    activePanel = nullptr;
    panelStack.clear();
    loadMap(missionIdx);
    showBanner(Lang::get(121 + missionIdx), Lang::get(129 + missionIdx), -1);
}

void GameEngine::startSkirmishMatch() {
    gameMode = 1;
    missionIdx = selectedSkirmishMap;
    appState = 1;
    activePanel = nullptr;
    panelStack.clear();
    loadMap(missionIdx);
    showBanner(mapTitle, Lang::get(137), -1);
}

void GameEngine::tickCampaignEvents() {
    // Handled cleanly on victory/defeat and initial mission banner
}

void GameEngine::tickAi() {
    if (aiPhase == 0) {
        if (aiPendingUnits.empty()) {
            advanceToNextPlayer();
            return;
        }
        aiActiveUnit = aiPendingUnits.front();
        aiPendingUnits.erase(aiPendingUnits.begin());
        if (!aiActiveUnit || aiActiveUnit->hp <= 0 || aiActiveUnit->state != 0) {
            return;
        }
        aiEvaluateUnit(aiActiveUnit);
        setCursorGrid(aiActiveUnit->gridX, aiActiveUnit->gridY);
        if (aiDestGx != aiActiveUnit->gridX || aiDestGy != aiActiveUnit->gridY) {
            aiActiveUnit->startMoveTo(aiDestGx, aiDestGy, true, false);
            aiPhase = 1;
        } else {
            aiPhase = 2;
        }
    } else if (aiPhase == 1) {
        if (!aiActiveUnit || aiActiveUnit->state == 0) {
            aiPhase = 2;
        }
    } else if (aiPhase == 2) {
        if (aiActiveUnit && aiActiveUnit->hp > 0) {
            if (aiAttackTarget && aiAttackTarget->hp > 0) {
                startBattle(aiActiveUnit, aiAttackTarget);
                aiPhase = 0;
                aiAttackTarget = nullptr;
                return;
            }
            int8_t ter = getTerrainAt(aiActiveUnit->gridX, aiActiveUnit->gridY);
            if ((aiActiveUnit->hasAbility(8) && ter == 8) || (aiActiveUnit->hasAbility(16) && ter == 9)) {
                if (!isBuildingAllied(aiActiveUnit->gridX, aiActiveUnit->gridY, playerAlliance[currentPlayer])) {
                    setBuildingOwner(aiActiveUnit->gridX, aiActiveUnit->gridY, playerTeam[currentPlayer]);
                }
            }
            aiActiveUnit->endTurnAction();
        }
        aiActiveUnit = nullptr;
        aiPhase = 0;
    }
}

void GameEngine::aiEvaluateUnit(Unit* u) {
    moveCostGrid.assign(static_cast<size_t>(mapW), std::vector<int8_t>(static_cast<size_t>(mapH), 0));
    u->computeMoveGrid(moveCostGrid);
    aiDestGx = u->gridX;
    aiDestGy = u->gridY;
    aiAttackTarget = nullptr;
    int bestScore = -100000;

    for (int gx = 0; gx < mapW; ++gx) {
        for (int gy = 0; gy < mapH; ++gy) {
            if (moveCostGrid[static_cast<size_t>(gx)][static_cast<size_t>(gy)] <= 0) continue;
            Unit* occ = getUnitAt(gx, gy, 0);
            if (occ && occ != u) continue;

            auto targets = u->findTargets(gx, gy, 0);
            if (!targets.empty()) {
                for (Unit* t : targets) {
                    int sc = aiScoreTile(u, gx, gy, t, nullptr);
                    if (sc > bestScore) {
                        bestScore = sc;
                        aiDestGx = gx;
                        aiDestGy = gy;
                        aiAttackTarget = t;
                    }
                }
            }
            int sc = aiScoreTile(u, gx, gy, nullptr, nullptr);
            if (sc > bestScore) {
                bestScore = sc;
                aiDestGx = gx;
                aiDestGy = gy;
                aiAttackTarget = nullptr;
            }
        }
    }
}

int GameEngine::aiScoreTile(Unit* u, int gx, int gy, Unit* atkTarget, Unit* /*grave*/) const {
    int score = kTerrainDef[getTerrainAt(gx, gy)];
    if (atkTarget) {
        score += 150 + atkTarget->getEvalScoreAt(atkTarget->gridX, atkTarget->gridY, u);
    } else {
        int nearestDist = 9999;
        for (const auto& other : units) {
            if (other->state != 3 && playerAlliance[other->player] != playerAlliance[u->player]) {
                int d = std::abs(other->gridX - gx) + std::abs(other->gridY - gy);
                if (d < nearestDist) nearestDist = d;
            }
        }
        if (nearestDist < 9999) score -= nearestDist * 8;
        int8_t ter = getTerrainAt(gx, gy);
        if ((u->hasAbility(8) && ter == 8) || (u->hasAbility(16) && ter == 9)) {
            if (!isBuildingAllied(gx, gy, playerAlliance[u->player])) {
                score += 120;
            }
        }
    }
    return score;
}

bool GameEngine::hasSavedGame() const {
    return platform::SaveSystem::hasRecordStore("ae2_save");
}

bool GameEngine::saveCurrentGame() {
    engine::ByteWriter w;
    w.writeByte(gameMode);
    w.writeByte(static_cast<int8_t>(missionIdx));
    w.writeByte(static_cast<int8_t>(playerCount));
    w.writeByte(currentPlayer);
    w.writeShort(static_cast<int16_t>(turnNumber));
    for (int p = 0; p < playerCount; ++p) {
        w.writeByte(playerAlliance[p]);
        w.writeByte(playerControl[p]);
        w.writeByte(playerTeam[p]);
        w.writeInt(playerGold[p]);
    }
    w.writeShort(static_cast<int16_t>(buildings.size()));
    for (const auto& b : buildings) {
        w.writeByte(b[0]);
        w.writeByte(b[1]);
        w.writeByte(b[2]);
    }
    w.writeShort(static_cast<int16_t>(units.size()));
    for (const auto& u : units) {
        w.writeByte(u->unitType);
        w.writeByte(u->player);
        w.writeByte(static_cast<int8_t>(u->state));
        w.writeByte(static_cast<int8_t>(u->hp));
        w.writeByte(static_cast<int8_t>(u->statusFlags));
        w.writeByte(u->level);
        w.writeShort(static_cast<int16_t>(u->expTotal));
        w.writeShort(u->gridX);
        w.writeShort(u->gridY);
        w.writeByte(u->kingVariant);
    }
    return platform::SaveSystem::saveRecord("ae2_save", 1, w.data());
}

bool GameEngine::loadSavedGame() {
    std::vector<uint8_t> raw;
    if (!platform::SaveSystem::loadRecord("ae2_save", 1, raw) || raw.empty()) return false;
    engine::ByteReader r(raw);
    gameMode = r.readByte();
    missionIdx = r.readByte();
    int savedPCount = r.readByte();
    int8_t savedCur = r.readByte();
    int savedTurn = r.readShort();
    loadMap(missionIdx);
    playerCount = std::clamp(savedPCount, 1, kMaxPlayers);
    currentPlayer = savedCur;
    turnNumber = savedTurn;
    for (int p = 0; p < playerCount; ++p) {
        playerAlliance[p] = r.readByte();
        playerControl[p] = r.readByte();
        playerTeam[p] = r.readByte();
        playerGold[p] = r.readInt();
    }
    int bCount = r.readShort();
    for (int i = 0; i < bCount; ++i) {
        int gx = r.readByte();
        int gy = r.readByte();
        int8_t team = r.readByte();
        setBuildingOwner(gx, gy, team);
    }
    units.clear();
    for (int p = 0; p < kMaxPlayers; ++p) {
        commanderCount[p] = 0;
        mainCommander[p] = nullptr;
    }
    int uCount = r.readShort();
    for (int i = 0; i < uCount; ++i) {
        int8_t uType = r.readByte();
        int8_t plr = r.readByte();
        uint8_t st = static_cast<uint8_t>(r.readByte());
        int hp = static_cast<uint8_t>(r.readByte());
        uint8_t flags = static_cast<uint8_t>(r.readByte());
        int8_t lvl = r.readByte();
        int exp = r.readShort();
        int gx = r.readShort();
        int gy = r.readShort();
        int8_t kv = r.readByte();
        Unit* u = Unit::create(uType, plr, gx, gy, true);
        u->state = st;
        u->hp = hp;
        u->setLevel(lvl);
        u->expTotal = exp;
        u->statusFlags = flags;
        u->recalcStatusBonuses();
        if (uType == 9) {
            u->setKingVariant(kv);
            mainCommander[plr] = u;
        }
    }
    setCursorGrid(playerLastCursor[currentPlayer][0], playerLastCursor[currentPlayer][1]);
    centerCameraOnGrid(cursorGx, cursorGy);
    playBgmTrack((playerTeam[currentPlayer] == 1) ? 2 : 3, -1);
    return true;
}

void GameEngine::loadSettingsRecord() {
    std::vector<uint8_t> raw;
    if (platform::SaveSystem::loadRecord("ae2_settings", 1, raw) && raw.size() >= 4) {
        optSound = raw[0] != 0;
        optVibrate = raw[1] != 0;
        optFightAnim = raw[2] != 0;
        maxCampaignUnlocked = std::clamp<int>(raw[3], 0, 7);
    }
}

void GameEngine::saveSettingsRecord() {
    std::vector<uint8_t> raw = {
        static_cast<uint8_t>(optSound ? 1 : 0),
        static_cast<uint8_t>(optVibrate ? 1 : 0),
        static_cast<uint8_t>(optFightAnim ? 1 : 0),
        static_cast<uint8_t>(maxCampaignUnlocked)
    };
    platform::SaveSystem::saveRecord("ae2_settings", 1, raw);
}

} // namespace game
