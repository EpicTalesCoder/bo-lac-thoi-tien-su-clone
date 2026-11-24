#pragma once

#include "game/Sprite.hpp"
#include <array>
#include <cstdint>
#include <memory>
#include <string>
#include <utility>
#include <vector>

namespace game {

class GameEngine;

class Unit : public Sprite {
public:
    static constexpr int kUnitTypeCount = 12;
    static constexpr int kMaxLevel = 9;
    static constexpr int kMoveSpeed = 6;

    static GameEngine* engine;

    // Static unit stats from units.bin
    static std::array<int8_t, kUnitTypeCount> sMoveRange;
    static std::array<std::array<int8_t, 2>, kUnitTypeCount> sBaseAtk;
    static std::array<int8_t, kUnitTypeCount> sBaseDef;
    static std::array<int8_t, kUnitTypeCount> sMaxRange;
    static std::array<int8_t, kUnitTypeCount> sMinRange;
    static std::array<int16_t, kUnitTypeCount> sCost;
    static std::array<std::vector<std::array<int8_t, 2>>, kUnitTypeCount> sSquadOffsets;
    static std::array<int16_t, kUnitTypeCount> sAbilities;

    static bool loadUnitTable(GameEngine* eng);
    static Unit* create(int8_t type, int8_t player, int gx, int gy, bool addToWorld = true);
    static std::vector<Unit*> getBuyList(int8_t player);
    static bool typeHasAbility(int8_t type, int16_t flag);

    Unit(int8_t type, int8_t teamId, int gx, int gy, bool addToWorld);

    void setLevel(int8_t lvl);
    void startBlink(int durationMs);
    void removeFromWorld();
    void setKingVariant(int idx);

    int getAttackBonus(const Unit* target) const { return getAttackBonusAt(target, gridX, gridY); }
    int getAttackBonusAt(const Unit* target, int gx, int gy) const;
    int getDefenseBonus(const Unit* attacker) const { return getDefenseBonusAt(attacker, gridX, gridY); }
    int getDefenseBonusAt(const Unit* attacker, int gx, int gy) const;

    int dealDamageTo(Unit* defender);
    int getValue() const;
    int getExpToNextLevel() const;
    bool tryPromote();
    bool canCounter(const Unit* attacker, int attGx, int attGy) const;

    void addStatus(uint8_t flag);
    void removeStatus(uint8_t flag);
    void recalcStatusBonuses();

    void setGridPos(int gx, int gy);
    int getSquadVisualCount() const;
    int getEvalScoreAt(int gx, int gy, const Unit* other) const;

    void markAttackRangeAt(std::vector<std::vector<int8_t>>& grid, int gx, int gy) const;
    void computeFullThreatGrid(std::vector<std::vector<int8_t>>& grid) const;
    std::vector<Unit*> findTargets(int gx, int gy, int8_t mode) const;
    std::vector<Unit*> findTargets(int gx, int gy, int minR, int maxR, int8_t mode) const;

    void startMoveTo(int tx, int ty, bool usePathGrid, bool avoidOccupied = false);
    std::vector<std::pair<int16_t, int16_t>> buildPathFromGrid(int sx, int sy, int tx, int ty) const;
    void computeMoveGrid(std::vector<std::vector<int8_t>>& grid) const;
    static bool floodMove(std::vector<std::vector<int8_t>>& grid, int gx, int gy, int remMove,
                          int fromDir, int8_t type, int8_t player, bool stopAtEmpty);
    static int getTileMoveCost(int gx, int gy, int8_t type, int8_t player);

    void tick() override;
    bool hasAbility(int16_t flag) const { return typeHasAbility(unitType, flag); }
    void endTurnAction();

    void drawUnit(engine::GraphicsContext& g, int offX, int offY, bool forceGray = false,
                  int interpX = 0, int interpY = 0, bool useInterp = false);
    void drawHpBadge(engine::GraphicsContext& g, int offX, int offY, int interpX = 0, int interpY = 0, bool useInterp = false) const;

    std::string name;
    int16_t exp = 0;
    int expTotal = 0; //unused? a in c.java is level (byte) & exp (int)
    int8_t level = 0;
    int8_t unitType = 0;
    int8_t player = 0;
    int16_t gridX = 0;
    int16_t gridY = 0;
    int destGx = 0;
    int destGy = 0;
    int atkMin = 0;
    int atkMax = 0;
    int defense = 0;
    int hp = 100;
    uint8_t state = 0; // 0=idle, 1=moving, 2=done, 3=dead_commander, 4=dummy_target
    uint8_t statusFlags = 0; // 1=poison, 2=aura
    int16_t atkBonus = 0;
    int16_t defBonus = 0;
    int16_t moveBonus = 0;

    bool blinking = false;
    bool blinkVisible = true;
    int blinkDurationMs = 0;
    uint64_t blinkStartMs = 0;
    uint64_t idleAnimMs = 0;

    int8_t poisonTurn = 0;
    int8_t smokeCounter = 0;
    int smokeRefCount = 0;
    Unit* raisedFrom = nullptr;
    int8_t kingVariant = 0;
    int commanderSlot = 0;
    int cost = 0;
    int moveAnimStep = 0;

    std::vector<std::pair<int16_t, int16_t>> movePath;
};

} // namespace game
