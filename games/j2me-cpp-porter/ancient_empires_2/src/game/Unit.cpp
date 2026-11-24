#include "game/Unit.hpp"
#include "game/GameEngine.hpp"
#include "game/PakAndLang.hpp"

#include <algorithm>
#include <cmath>
#include <cstdlib>

namespace game {

GameEngine* Unit::engine = nullptr;

std::array<int8_t, Unit::kUnitTypeCount> Unit::sMoveRange{};
std::array<std::array<int8_t, 2>, Unit::kUnitTypeCount> Unit::sBaseAtk{};
std::array<int8_t, Unit::kUnitTypeCount> Unit::sBaseDef{};
std::array<int8_t, Unit::kUnitTypeCount> Unit::sMaxRange{};
std::array<int8_t, Unit::kUnitTypeCount> Unit::sMinRange{};
std::array<int16_t, Unit::kUnitTypeCount> Unit::sCost{};
std::array<std::vector<std::array<int8_t, 2>>, Unit::kUnitTypeCount> Unit::sSquadOffsets{};
std::array<int16_t, Unit::kUnitTypeCount> Unit::sAbilities{};

bool Unit::loadUnitTable(GameEngine* eng) {
    engine = eng;
    const std::vector<uint8_t>* bytes = PakStore::getBytes("units.bin");
    if (!bytes) return false;
    engine::ByteReader r(*bytes);
    for (int i = 0; i < kUnitTypeCount; ++i) {
        size_t idx = static_cast<size_t>(i);
        sMoveRange[idx] = r.readByte();
        sBaseAtk[idx][0] = r.readByte();
        sBaseAtk[idx][1] = r.readByte();
        sBaseDef[idx] = r.readByte();
        sMaxRange[idx] = r.readByte();
        sMinRange[idx] = r.readByte();
        sCost[idx] = r.readShort();
        int squadCount = r.readByte();
        sSquadOffsets[idx].resize(static_cast<size_t>(std::max(0, squadCount)));
        for (int j = 0; j < squadCount; ++j) {
            sSquadOffsets[idx][static_cast<size_t>(j)][0] = r.readByte();
            sSquadOffsets[idx][static_cast<size_t>(j)][1] = r.readByte();
        }
        int abCount = r.readByte();
        sAbilities[idx] = 0;
        for (int j = 0; j < abCount; ++j) {
            int bit = r.readByte();
            if (bit >= 0 && bit < 15) {
                sAbilities[idx] = static_cast<int16_t>(sAbilities[idx] | (1 << bit));
            }
        }
    }
    return true;
}

namespace {
const Sprite& safeUnitTemplate(GameEngine* eng, int8_t teamId, int8_t type) {
    static const Sprite kEmptySprite;
    if (eng) {
        if (Sprite* s = eng->getUnitSpriteTemplate(teamId, type)) {
            return *s;
        }
    }
    return kEmptySprite;
}
} // namespace

Unit::Unit(int8_t type, int8_t teamId, int gx, int gy, bool addToWorld)
    : Sprite(safeUnitTemplate(engine, teamId, type)) {
    unitType = type;
    state = 0;
    gridX = static_cast<int16_t>(gx);
    gridY = static_cast<int16_t>(gy);
    setPos(gx * 24, gy * 24);
    prevX = x;
    prevY = y;
    setLevel(0);
    if (addToWorld) {
        // Caller owns & inserts into engine->units
    }
}

Unit* Unit::create(int8_t type, int8_t plr, int gx, int gy, bool addToWorld) {
    int8_t teamId = engine->playerTeam[plr];
    auto u = std::make_unique<Unit>(type, teamId, gx, gy, addToWorld);
    u->player = plr;
    u->hp = 100;
    u->moveBonus = sMoveRange[static_cast<size_t>(type)];
    u->cost = sCost[static_cast<size_t>(type)];
    Unit* raw = u.get();
    if (type == 9) {
        raw->setKingVariant(teamId - 1);
        raw->commanderSlot = engine->commanderCount[plr];
        if (raw->commanderSlot < 8) {
            engine->commanders[plr][raw->commanderSlot] = raw;
            engine->commanderCount[plr]++;
        }
    }
    if (addToWorld) {
        engine->units.push_back(std::move(u));
    } else {
        engine->tempUnits.push_back(std::move(u));
    }
    return raw;
}

void Unit::setLevel(int8_t lvl) {
    level = lvl;
    int bonus = lvl * 2;
    size_t idx = static_cast<size_t>(unitType);
    atkMin = sBaseAtk[idx][0] + bonus;
    atkMax = sBaseAtk[idx][1] + bonus;
    defense = sBaseDef[idx] + bonus;
    if (unitType != 9) {
        int rank = std::min(3, static_cast<int>(level) / 2);
        name = Lang::get(139 + unitType * 4 + rank);
    }
}

void Unit::startBlink(int durMs) {
    blinking = true;
    blinkStartMs = engine->gameTimeMs;
    blinkDurationMs = durMs;
}

void Unit::removeFromWorld() {
    engine->removeUnit(this);
}

void Unit::setKingVariant(int idx) {
    kingVariant = static_cast<int8_t>(idx);
    name = Lang::get(idx + 93);
}

int Unit::getAttackBonusAt(const Unit* target, int gx, int gy) const {
    int bonus = atkBonus;
    if (target) {
        if (hasAbility(64) && target->hasAbility(1)) bonus += 15;
        if (unitType == 4 && target->unitType == 10) bonus += 15;
    }
    if (hasAbility(2) && engine->getTerrainAt(gx, gy) == 5) bonus += 10;
    if (gx >= 0 && gy >= 0 && gx < engine->mapW && gy < engine->mapH) {
        if (engine->mapTiles[gx][gy] == 34) bonus += 25;
    }
    return bonus;
}

int Unit::getDefenseBonusAt(const Unit* /*attacker*/, int gx, int gy) const {
    int8_t terrain = engine->getTerrainAt(gx, gy);
    int bonus = defBonus + GameEngine::kTerrainDef[terrain];
    if (hasAbility(2) && terrain == 5) bonus += 15;
    if (gx >= 0 && gy >= 0 && gx < engine->mapW && gy < engine->mapH) {
        if (engine->mapTiles[gx][gy] == 34) bonus += 15;
    }
    return bonus;
}

int Unit::dealDamageTo(Unit* defender) {
    int atk = GameRng::range(atkMin, atkMax) + getAttackBonus(defender);
    int def = defender->defense + defender->getDefenseBonus(this);
    int dmg = (atk - def) * hp / 100;
    if (dmg < 0) dmg = 0;
    else if (dmg > defender->hp) dmg = defender->hp;
    defender->hp -= dmg;
    expTotal += defender->getValue() * dmg;
    return dmg;
}

int Unit::getValue() const {
    return atkMin + atkMax + defense;
}

int Unit::getExpToNextLevel() const {
    return getValue() * 100 * 2 / 3;
}

bool Unit::tryPromote() {
    if (level < kMaxLevel) {
        int needed = getExpToNextLevel();
        if (expTotal >= needed) {
            expTotal -= needed;
            setLevel(static_cast<int8_t>(level + 1));
            return true;
        }
    }
    return false;
}

bool Unit::canCounter(const Unit* /*attacker*/, int attGx, int attGy) const {
    return state != 4 && hp > 0 && (std::abs(gridX - attGx) + std::abs(gridY - attGy) == 1) &&
           sMinRange[static_cast<size_t>(unitType)] == 1;
}

void Unit::addStatus(uint8_t flag) {
    statusFlags |= flag;
    recalcStatusBonuses();
    if (flag == 1) poisonTurn = engine->currentPlayer;
}

void Unit::removeStatus(uint8_t flag) {
    statusFlags = static_cast<uint8_t>(statusFlags & ~flag);
    recalcStatusBonuses();
}

void Unit::recalcStatusBonuses() {
    moveBonus = 0;
    atkBonus = 0;
    defBonus = 0;
    if ((statusFlags & 1) != 0) {
        atkBonus = static_cast<int16_t>(atkBonus - 10);
        defBonus = static_cast<int16_t>(defBonus - 10);
    }
    if ((statusFlags & 2) != 0) {
        atkBonus = static_cast<int16_t>(atkBonus + 10);
    }
}

void Unit::setGridPos(int gx, int gy) {
    gridX = static_cast<int16_t>(gx);
    gridY = static_cast<int16_t>(gy);
    x = gx * 24;
    y = gy * 24;
    prevX = x;
    prevY = y;
}

int Unit::getSquadVisualCount() const {
    int maxSquad = static_cast<int>(sSquadOffsets[static_cast<size_t>(unitType)].size());
    if (maxSquad <= 0) return 1;
    int step = 100 / maxSquad;
    int cnt = hp / step;
    if (hp != 100 && hp % step > 0) ++cnt;
    return cnt;
}

int Unit::getEvalScoreAt(int gx, int gy, const Unit* other) const {
    return (atkMin + atkMax + defense + getAttackBonusAt(other, gx, gy) + getDefenseBonusAt(other, gx, gy)) * hp / 100;
}

void Unit::markAttackRangeAt(std::vector<std::vector<int8_t>>& grid, int gx, int gy) const {
    int minR = sMinRange[static_cast<size_t>(unitType)];
    int maxR = sMaxRange[static_cast<size_t>(unitType)];
    int x0 = std::max(0, gx - maxR);
    int y0 = std::max(0, gy - maxR);
    int x1 = std::min(engine->mapW - 1, gx + maxR);
    int y1 = std::min(engine->mapH - 1, gy + maxR);
    for (int ix = x0; ix <= x1; ++ix) {
        for (int iy = y0; iy <= y1; ++iy) {
            int d = std::abs(ix - gx) + std::abs(iy - gy);
            if (d >= minR && d <= maxR && grid[ix][iy] <= 0) {
                grid[ix][iy] = 127;
            }
        }
    }
}

void Unit::computeFullThreatGrid(std::vector<std::vector<int8_t>>& grid) const {
    if (hasAbility(512)) {
        markAttackRangeAt(grid, gridX, gridY);
    } else {
        computeMoveGrid(grid);
        for (int ix = 0; ix < engine->mapW; ++ix) {
            for (int iy = 0; iy < engine->mapH; ++iy) {
                if (grid[ix][iy] > 0 && grid[ix][iy] != 127) {
                    markAttackRangeAt(grid, ix, iy);
                }
            }
        }
    }
}

std::vector<Unit*> Unit::findTargets(int gx, int gy, int8_t mode) const {
    return findTargets(gx, gy, sMinRange[static_cast<size_t>(unitType)], sMaxRange[static_cast<size_t>(unitType)], mode);
}

std::vector<Unit*> Unit::findTargets(int gx, int gy, int minR, int maxR, int8_t mode) const {
    std::vector<Unit*> res;
    int x0 = std::max(0, gx - maxR);
    int y0 = std::max(0, gy - maxR);
    int x1 = std::min(engine->mapW - 1, gx + maxR);
    int y1 = std::min(engine->mapH - 1, gy + maxR);
    for (int ix = x0; ix <= x1; ++ix) {
        for (int iy = y0; iy <= y1; ++iy) {
            int d = std::abs(ix - gx) + std::abs(iy - gy);
            if (d < minR || d > maxR) continue;
            if (mode == 0) {
                Unit* u = engine->getUnitAt(ix, iy, 0);
                if (u) {
                    if (engine->playerAlliance[u->player] != engine->playerAlliance[player]) {
                        res.push_back(u);
                    }
                } else if (unitType == 7 && engine->getTerrainAt(ix, iy) == 8 &&
                           engine->mapTiles[ix][iy] >= engine->castleTileStart &&
                           !engine->isBuildingAllied(ix, iy, engine->playerAlliance[player])) {
                    Unit* dummy = create(0, 0, ix, iy, false);
                    dummy->unitType = -1;
                    dummy->state = 4;
                    res.push_back(dummy);
                }
            } else if (mode == 1) {
                Unit* u = engine->getUnitAt(ix, iy, 1);
                if (u) res.push_back(u);
            } else if (mode == 2) {
                Unit* u = engine->getUnitAt(ix, iy, 0);
                if (u && engine->playerAlliance[u->player] == engine->playerAlliance[player]) {
                    res.push_back(u);
                }
            }
        }
    }
    return res;
}

void Unit::startMoveTo(int tx, int ty, bool usePathGrid, bool avoidOccupied) {
    if (usePathGrid) {
        movePath = buildPathFromGrid(gridX, gridY, tx, ty);
    } else {
        if (avoidOccupied && engine->getUnitAt(tx, ty, 0) != nullptr) {
            bool found = false;
            for (int ix = tx - 1; ix <= tx + 1 && !found; ++ix) {
                for (int iy = ty - 1; iy <= ty + 1 && !found; ++iy) {
                    if (((ix != tx || iy != ty) && (ix == tx || iy == ty)) &&
                        ix >= 0 && iy >= 0 && ix < engine->mapW && iy < engine->mapH &&
                        engine->getUnitAt(ix, iy, 0) == nullptr) {
                        tx = ix;
                        ty = iy;
                        found = true;
                    }
                }
            }
        }
        movePath.clear();
        movePath.emplace_back(gridX, gridY);
        int16_t cx = gridX;
        int dx = std::abs(tx - gridX);
        if (dx > 0) {
            int stepX = (tx - gridX) / dx;
            for (int i = 0; i < dx; ++i) {
                cx = static_cast<int16_t>(cx + stepX);
                movePath.emplace_back(cx, gridY);
            }
        }
        int16_t cy = gridY;
        int dy = std::abs(ty - gridY);
        if (dy > 0) {
            int stepY = (ty - gridY) / dy;
            for (int i = 0; i < dy; ++i) {
                cy = static_cast<int16_t>(cy + stepY);
                movePath.emplace_back(cx, cy);
            }
        }
    }
    destGx = tx;
    destGy = ty;
    moveAnimStep = 1;
    state = 1;
}

std::vector<std::pair<int16_t, int16_t>> Unit::buildPathFromGrid(int sx, int sy, int tx, int ty) const {
    std::vector<std::pair<int16_t, int16_t>> path;
    if (sx == tx && sy == ty) {
        path.emplace_back(static_cast<int16_t>(tx), static_cast<int16_t>(ty));
        return path;
    }
    int8_t up = (ty > 0) ? engine->moveCostGrid[tx][ty - 1] : 0;
    int8_t down = (ty < engine->mapH - 1) ? engine->moveCostGrid[tx][ty + 1] : 0;
    int8_t left = (tx > 0) ? engine->moveCostGrid[tx - 1][ty] : 0;
    int8_t right = (tx < engine->mapW - 1) ? engine->moveCostGrid[tx + 1][ty] : 0;
    int best = std::max({up, down, left, right});
    if (best <= 0) {
        path.emplace_back(static_cast<int16_t>(tx), static_cast<int16_t>(ty));
        return path;
    }
    if (best == up) path = buildPathFromGrid(sx, sy, tx, ty - 1);
    else if (best == down) path = buildPathFromGrid(sx, sy, tx, ty + 1);
    else if (best == left) path = buildPathFromGrid(sx, sy, tx - 1, ty);
    else path = buildPathFromGrid(sx, sy, tx + 1, ty);
    path.emplace_back(static_cast<int16_t>(tx), static_cast<int16_t>(ty));
    return path;
}

void Unit::computeMoveGrid(std::vector<std::vector<int8_t>>& grid) const {
    floodMove(grid, gridX, gridY, sMoveRange[static_cast<size_t>(unitType)] + moveBonus, -1, unitType, player, false);
}

bool Unit::floodMove(std::vector<std::vector<int8_t>>& grid, int gx, int gy, int remMove,
                     int fromDir, int8_t type, int8_t plr, bool stopAtEmpty) {
    if (gx < 0 || gy < 0 || gx >= engine->mapW || gy >= engine->mapH) return false;
    if (remMove > grid[gx][gy]) {
        grid[gx][gy] = static_cast<int8_t>(remMove);
        if (stopAtEmpty && engine->getUnitAt(gx, gy, 0) == nullptr) return true;
        int rem;
        if (fromDir != 1 && (rem = remMove - getTileMoveCost(gx, gy - 1, type, plr)) >= 0) {
            if (floodMove(grid, gx, gy - 1, rem, 2, type, plr, stopAtEmpty) && stopAtEmpty) return true;
        }
        if (fromDir != 2 && (rem = remMove - getTileMoveCost(gx, gy + 1, type, plr)) >= 0) {
            if (floodMove(grid, gx, gy + 1, rem, 1, type, plr, stopAtEmpty) && stopAtEmpty) return true;
        }
        if (fromDir != 4 && (rem = remMove - getTileMoveCost(gx - 1, gy, type, plr)) >= 0) {
            if (floodMove(grid, gx - 1, gy, rem, 8, type, plr, stopAtEmpty) && stopAtEmpty) return true;
        }
        if (fromDir != 8 && (rem = remMove - getTileMoveCost(gx + 1, gy, type, plr)) >= 0) {
            if (floodMove(grid, gx + 1, gy, rem, 4, type, plr, stopAtEmpty) && stopAtEmpty) return true;
        }
    }
    return false;
}

int Unit::getTileMoveCost(int gx, int gy, int8_t type, int8_t plr) {
    if (gx < 0 || gy < 0 || gx >= engine->mapW || gy >= engine->mapH) return 10000;
    Unit* u = engine->getUnitAt(gx, gy, 0);
    if (u && engine->playerAlliance[u->player] != engine->playerAlliance[plr]) return 1000;
    int8_t terrain = engine->getTerrainAt(gx, gy);
    if (type == 11) {
        if (terrain == 4) return 1000;
    } else {
        if (typeHasAbility(type, 1)) return 1;
        if (typeHasAbility(type, 2) && terrain == 5) return 1;
    }
    return GameEngine::kTerrainCost[terrain];
}

bool Unit::typeHasAbility(int8_t type, int16_t flag) {
    if (type < 0 || type >= kUnitTypeCount) return false;
    return (sAbilities[static_cast<size_t>(type)] & flag) != 0;
}

void Unit::tick() {
    prevX = x;
    prevY = y;
    if (blinking) {
        if (engine->gameTimeMs - blinkStartMs >= static_cast<uint64_t>(blinkDurationMs)) {
            blinking = false;
            blinkVisible = true;
        } else {
            blinkVisible = !blinkVisible;
        }
    }
    if (state == 1) {
        if (moveAnimStep >= static_cast<int>(movePath.size())) {
            state = 0;
            gridX = static_cast<int16_t>(x / 24);
            gridY = static_cast<int16_t>(y / 24);
            movePath.clear();
            moveAnimStep = 0;
        } else {
            if (raisedFrom && (x % 24 == 0) && (y % 24 == 0)) {
                raisedFrom->startMoveTo(gridX, gridY, false, false);
            }
            int tx = movePath[static_cast<size_t>(moveAnimStep)].first * 24;
            int ty = movePath[static_cast<size_t>(moveAnimStep)].second * 24;
            Sprite* smoke = nullptr;
            if (!raisedFrom && ++smokeCounter >= 24 / kMoveSpeed / 2) {
                smoke = engine->spawnEffect(engine->smokeProto.get(), x, y, 0, 0, 1, GameRng::range(1, 4) * 50);
                smokeCounter = 0;
            }
            if (tx < x) {
                x -= kMoveSpeed;
                if (smoke) smoke->setPos(x + frameW, y + frameH - smoke->frameH);
            } else if (tx > x) {
                x += kMoveSpeed;
                if (smoke) smoke->setPos(x - smoke->frameW, y + frameH - smoke->frameH);
            } else if (ty < y) {
                y -= kMoveSpeed;
                if (smoke) smoke->setPos(x + (frameW - smoke->frameW) / 2, y + frameH);
            } else if (ty > y) {
                y += kMoveSpeed;
                if (smoke) smoke->setPos(x + (frameW - smoke->frameW) / 2, y - smoke->frameH);
            }
            if (x == tx && y == ty) {
                gridX = movePath[static_cast<size_t>(moveAnimStep)].first;
                gridY = movePath[static_cast<size_t>(moveAnimStep)].second;
                ++moveAnimStep;
            }
        }
        advanceFrame();
    } else if (state == 0 && engine->gameTimeMs - idleAnimMs >= 200ULL) {
        advanceFrame();
        idleAnimMs = engine->gameTimeMs;
    }
}

void Unit::endTurnAction() {
    state = 2;
    Unit* grave = engine->getUnitAt(gridX, gridY, 1);
    if (grave) grave->removeFromWorld();
    if (hasAbility(256)) {
        auto allies = findTargets(gridX, gridY, 1, 2, 2);
        for (Unit* a : allies) {
            a->addStatus(2);
            engine->spawnEffect(engine->levelupProto.get(), a->x, a->y, 0, 0, 1, 50);
        }
    }
    engine->lastMovedUnit = this;
}

std::vector<Unit*> Unit::getBuyList(int8_t plr) {
    int cap = engine->commanderCount[plr];
    std::vector<Unit*> deadCmds;
    for (int i = 0; i < cap; ++i) {
        Unit* c = engine->commanders[plr][i];
        if (c && c->state == 3) {
            deadCmds.push_back(c);
        }
    }
    int buyableTypes = engine->maxBuyUnitType + 1;
    std::vector<Unit*> list;
    list.reserve(deadCmds.size() + buyableTypes);
    for (Unit* dc : deadCmds) list.push_back(dc);
    for (int t = 0; t < buyableTypes; ++t) {
        list.push_back(create(static_cast<int8_t>(t), plr, 0, 0, false));
    }
    return list;
}

void Unit::drawUnit(engine::GraphicsContext& g, int offX, int offY, bool forceGray,
                    int interpX, int interpY, bool useInterp) {
    if (state == 4) return;
    int savedX = x;
    int savedY = y;
    if (useInterp) {
        x = interpX;
        y = interpY;
    }
    if (blinking) {
        int sx = blinkVisible ? -2 : 2;
        Sprite::draw(g, offX + sx, offY);
    } else if (!forceGray && state != 2) {
        Sprite::draw(g, offX, offY);
    } else {
        Sprite* graySp = engine->getUnitSpriteTemplate(0, unitType);
        if (graySp) graySp->draw(g, x + offX, y + offY);
    }
    if (unitType == 9) {
        int hx = x + offX;
        int hy = y + offY;
        int headIconIdx = (forceGray || state == 2) ? 1 : 0;
        if (engine->kingHeadIcons[headIconIdx]) {
            engine->kingHeadIcons[headIconIdx]->drawFrame(g, kingVariant * 2 + frameIdx, hx, hy, 0);
        }
    }
    x = savedX;
    y = savedY;
}

void Unit::drawHpBadge(engine::GraphicsContext& g, int offX, int offY,
                       int interpX, int interpY, bool useInterp) const {
    if (state == 3 || hp >= 100) return;
    int bx = (useInterp ? interpX : x) + offX;
    int by = (useInterp ? interpY : y) + offY;
    SpriteFont::draw(g, std::to_string(hp), bx, by + frameH - 7, 0, 0);
}

} // namespace game
