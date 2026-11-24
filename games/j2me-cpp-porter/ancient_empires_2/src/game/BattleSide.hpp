#pragma once

#include "game/Sprite.hpp"
#include "game/Unit.hpp"
#include <array>
#include <cstdint>
#include <memory>
#include <vector>

namespace game {

class GameEngine;

class BattleSide {
public:
    static const char* const kTerrainNames[8];
    static const int8_t kTerrainTileIdx[10];
    static const int8_t kTerrainBgIdx[10];
    static const char* const kUnitSpriteNames[11];
    static const int8_t kSideDir[2];

    BattleSide(GameEngine* eng, Unit* unit, BattleSide* otherSide);

    int mirrorX(const Sprite* sp, int localX) const;
    void startAttack();
    void tick();
    void shakeAll();
    void applyDamage();

    void drawBackground(engine::GraphicsContext& g, int offX, int offY);
    void drawHpText(engine::GraphicsContext& g);
    void drawShadows(engine::GraphicsContext& g);

    GameEngine* engine = nullptr;
    Unit* unit = nullptr;
    BattleSide* other = nullptr;

    int8_t unitType = 0;
    bool attacking = false;
    bool actionDone = false;
    bool damageApplied = false;

    int8_t startHp = 0;
    int8_t endHp = 0;
    int8_t terrainType = 0;
    int8_t startCount = 0;
    int8_t endCount = 0;
    int8_t curCount = 0;
    int8_t sideIndex = 0; // 0 = left, 1 = right
    bool facingRight = true;
    int phase = 0; // 0=idle, 1=prepare, 3=charge, 4=return/hit, 6=mid-delay, 7=post-delay

    int shakeX = 0;
    int shakeY = 0;
    uint64_t floatTimerMs = 0;
    uint64_t phaseTimerMs = 0;
    uint64_t shakeTimerMs = 0;
    bool shaking = false;

    int bgHeight = 0;
    int tileCols = 0;
    int tileRows = 0;
    int displayedHp = 0;
    int deadCount = 0;

    std::unique_ptr<Sprite> baseSprite;
    std::unique_ptr<Sprite> projectileProto;
    std::unique_ptr<Sprite> hitEffectProto;
    std::unique_ptr<Sprite> slashProto;
    std::unique_ptr<Sprite> kingHeadFrontProto;
    std::unique_ptr<Sprite> kingHeadBackProto;

    std::vector<Sprite*> squadSprites; // owned by engine->battleSprites
    std::vector<Sprite*> activeProjectiles;
    std::vector<ImageRegion> terrainTiles;
    ImageRegion bgRegion;

    std::vector<std::array<int, 2>> squadBasePos;
    std::vector<int> floatAngles;
    std::vector<std::vector<uint8_t>> tileGrid;

    int animIndex = 0;
    int spinSpeed = 20;
    int subStep = 0;
    int waitMs = 0;
    int impactCount = 0;
    int spawnIdx = 0;
};

} // namespace game
