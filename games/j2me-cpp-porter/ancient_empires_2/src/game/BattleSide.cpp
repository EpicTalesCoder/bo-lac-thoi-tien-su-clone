#include "game/BattleSide.hpp"
#include "game/GameEngine.hpp"
#include "game/PakAndLang.hpp"

#include <algorithm>

namespace game {

const char* const BattleSide::kTerrainNames[8] = {
    "road", "grass", "woods", "hill", "mountain", "water", "bridge", "town"
};
const int8_t BattleSide::kTerrainTileIdx[10] = {0, 1, 1, 1, 4, 5, 6, 7, 7, 7};
const int8_t BattleSide::kTerrainBgIdx[10] = {0, 1, 2, 3, 4, 5, 6, 7, 7, 7};
const char* const BattleSide::kUnitSpriteNames[11] = {
    "soldier", "archer", "lizard", "wizard", "wisp", "spider",
    "golem", "catapult", "wyvern", "king", "skeleton"
};
const int8_t BattleSide::kSideDir[2] = {3, -3};

BattleSide::BattleSide(GameEngine* eng, Unit* u, BattleSide* otherSide)
    : engine(eng), unit(u), other(otherSide) {
    unitType = u->unitType;
    startHp = static_cast<int8_t>(u->hp);
    displayedHp = startHp;
    startCount = static_cast<int8_t>(u->getSquadVisualCount());
    curCount = startCount;

    int sideOffsetX = 0;
    if (!otherSide) {
        sideIndex = 0;
        shakeX = 0;
        facingRight = true;
    } else {
        sideOffsetX = eng->battleHalfW;
        sideIndex = 1;
        phase = 0;
        facingRight = false;
    }

    terrainType = eng->getTerrainAt(u->gridX, u->gridY);
    int8_t bgIdx = kTerrainBgIdx[terrainType];
    int8_t tileIdx = kTerrainTileIdx[terrainType];

    if (otherSide && tileIdx == kTerrainTileIdx[otherSide->terrainType]) {
        terrainTiles = otherSide->terrainTiles;
    } else {
        Sprite tmp(kTerrainNames[tileIdx]);
        terrainTiles = tmp.frames;
    }
    if (sideIndex == 1) {
        for (auto& reg : terrainTiles) {
            reg = ImageRegion(reg, 1);
        }
    }

    std::string bgName = std::string(kTerrainNames[bgIdx]) + "_bg";
    if (PakStore::exists(bgName + ".png")) {
        if (otherSide && bgIdx == kTerrainBgIdx[otherSide->terrainType]) {
            bgRegion = otherSide->bgRegion;
        } else {
            bgRegion = ImageRegion(bgName);
        }
        if (sideIndex == 1) {
            bgRegion = ImageRegion(bgRegion, 1);
        }
    }
    if (bgRegion.isValid()) {
        bgHeight = bgRegion.h;
    }

    int tw = (!terrainTiles.empty() && terrainTiles[0].w > 0) ? terrainTiles[0].w : 24;
    int th = (!terrainTiles.empty() && terrainTiles[0].h > 0) ? terrainTiles[0].h : 24;
    tileCols = (eng->battleHalfW + tw - 1) / tw;
    tileRows = (eng->battleViewH - bgHeight + th - 1) / th;
    tileGrid.assign(static_cast<size_t>(tileCols), std::vector<uint8_t>(static_cast<size_t>(tileRows), 0));
    for (int cx = 0; cx < tileCols; ++cx) {
        for (int cy = 0; cy < tileRows; ++cy) {
            tileGrid[static_cast<size_t>(cx)][static_cast<size_t>(cy)] =
                static_cast<uint8_t>(terrainTiles.empty() ? 0 : GameRng::nextInt(static_cast<int>(terrainTiles.size())));
        }
    }

    baseSprite = std::make_unique<Sprite>(kUnitSpriteNames[unitType], eng->playerTeam[u->player]);
    if (otherSide && otherSide->unitType == unitType) {
        if (otherSide->slashProto) slashProto = std::make_unique<Sprite>(*otherSide->slashProto);
        if (otherSide->projectileProto) projectileProto = std::make_unique<Sprite>(*otherSide->projectileProto);
        if (otherSide->hitEffectProto) hitEffectProto = std::make_unique<Sprite>(*otherSide->hitEffectProto);
        if (otherSide->kingHeadFrontProto) {
            kingHeadFrontProto = std::make_unique<Sprite>(*otherSide->kingHeadFrontProto);
            kingHeadBackProto = std::make_unique<Sprite>(*otherSide->kingHeadBackProto);
        }
    } else if (unitType == 0 || unitType == 10 || unitType == 5) {
        slashProto = std::make_unique<Sprite>("slash");
    } else if (unitType == 1) {
        hitEffectProto = std::make_unique<Sprite>("archer_arrow");
    } else if (unitType == 9) {
        projectileProto = std::make_unique<Sprite>("kingwave");
        slashProto = std::make_unique<Sprite>("kingslash");
        kingHeadFrontProto = std::make_unique<Sprite>("king_heads");
        kingHeadBackProto = std::make_unique<Sprite>("king_heads_back");
    } else if (unitType == 2) {
        projectileProto = std::make_unique<Sprite>("watermagic");
        hitEffectProto = std::make_unique<Sprite>("fish");
    } else if (unitType == 7 || unitType == 6) {
        hitEffectProto = std::make_unique<Sprite>("crater");
    } else if (unitType == 3) {
        projectileProto = std::make_unique<Sprite>("spell");
        hitEffectProto = std::make_unique<Sprite>(*projectileProto);
    }

    if (projectileProto) projectileProto->setAnim(0, facingRight);
    if (hitEffectProto) hitEffectProto->setAnim(0, facingRight);
    if (slashProto) slashProto->setAnim(0, facingRight);
    if (kingHeadFrontProto) {
        kingHeadFrontProto->setAnim(u->kingVariant, facingRight);
        kingHeadFrontProto->setFrameIndex(u->kingVariant);
        kingHeadBackProto->setAnim(0, facingRight);
        kingHeadBackProto->setFrameIndex(u->kingVariant);
    }

    const auto& offsets = Unit::sSquadOffsets[static_cast<size_t>(unitType)];
    squadBasePos.resize(offsets.size());
    for (size_t i = 0; i < offsets.size(); ++i) {
        int px = offsets[i][0] * eng->screenW / 128;
        if (sideIndex == 1) {
            px = eng->battleHalfW - px - baseSprite->frameW + sideOffsetX;
        }
        int py = offsets[i][1] * eng->battleViewH / 128 - baseSprite->frameH;
        squadBasePos[i] = {px, py};
    }

    squadSprites.resize(static_cast<size_t>(startCount), nullptr);
    if (unitType == 4 || unitType == 6) {
        floatAngles.resize(static_cast<size_t>(startCount), 0);
    }

    for (int i = 0; i < startCount; ++i) {
        auto sp = std::make_unique<Sprite>(*baseSprite);
        Sprite* raw = sp.get();
        eng->addBattleSprite(std::move(sp));
        squadSprites[static_cast<size_t>(i)] = raw;
        raw->setPos(squadBasePos[static_cast<size_t>(i)][0], squadBasePos[static_cast<size_t>(i)][1]);
        raw->prevX = raw->x;
        raw->prevY = raw->y;
        raw->setAnim(0, facingRight);
        raw->removeWhenDone = false;
        raw->vy = 0;
        if (unitType == 6) {
            raw->floatPhaseActive = true;
            floatAngles[static_cast<size_t>(i)] = GameRng::nextInt(360);
            raw->zOff = -6 + engine::floorDivPow2(4 * Trig::sin1024(floatAngles[static_cast<size_t>(i)]), 10);
        } else if (unitType == 4) {
            raw->floatPhaseActive = true;
            raw->zOff = -5 - GameRng::nextInt(10);
            floatAngles[static_cast<size_t>(i)] = GameRng::nextInt(360);
        } else if (unitType == 9) {
            raw->kingHeadFront = kingHeadFrontProto.get();
            raw->kingHeadBack = kingHeadBackProto.get();
        }
    }
}

int BattleSide::mirrorX(const Sprite* sp, int localX) const {
    return (sideIndex == 1) ? (baseSprite->frameW - localX - sp->frameW) : localX;
}

void BattleSide::startAttack() {
    attacking = true;
    phase = 1;
    phaseTimerMs = engine->gameTimeMs;
}

void BattleSide::shakeAll() {
    for (int i = 0; i < curCount; ++i) {
        squadSprites[static_cast<size_t>(i)]->shakeTicks = 6;
    }
}

void BattleSide::tick() {
    if (shaking) {
        if (engine->gameTimeMs - shakeTimerMs >= 300ULL) {
            shaking = false;
            shakeX = 0;
            shakeY = 0;
        } else {
            shakeX = (shakeX > 0) ? -2 : 2;
            shakeY = GameRng::nextInt() % 1;
        }
    }
    if (damageApplied && displayedHp > endHp) {
        displayedHp -= 2;
        if (displayedHp < endHp) displayedHp = endHp;
        engine->battleHudDirty = true;
    }

    if (unitType == 8 || unitType == 9 || unitType == 7 || unitType == 1 ||
        unitType == 3 || unitType == 2 || unitType == 6) {
        switch (phase) {
            case 1:
                if (unitType == 6) {
                    if (subStep == 0) {
                        if (engine->gameTimeMs - phaseTimerMs >= 200ULL) {
                            if (spawnIdx < curCount) {
                                squadSprites[static_cast<size_t>(spawnIdx)]->auxState = -1;
                                squadSprites[static_cast<size_t>(spawnIdx)]->floatPhaseActive = false;
                                squadSprites[static_cast<size_t>(spawnIdx)]->gravityY = 0;
                            }
                            if (++spawnIdx >= curCount) {
                                spawnIdx = 0;
                                subStep = 1;
                                phaseTimerMs = engine->gameTimeMs;
                            }
                        }
                    } else if (subStep == 1) {
                        if (engine->gameTimeMs - phaseTimerMs >= 200ULL) {
                            if (spawnIdx < curCount) {
                                squadSprites[static_cast<size_t>(spawnIdx)]->gravityY = -1;
                            }
                            if (++spawnIdx >= curCount) {
                                spawnIdx = 0;
                                subStep = 2;
                                phaseTimerMs = engine->gameTimeMs;
                            }
                        }
                    } else if (subStep == 2) {
                        bool done = true;
                        if (engine->gameTimeMs - phaseTimerMs >= 200ULL) {
                            if (spawnIdx < curCount) {
                                auto* s = squadSprites[static_cast<size_t>(spawnIdx)];
                                s->auxState = 0;
                                s->gravityY = 0;
                                s->setAnim(2, facingRight);
                                s->loopsLeft = 1;
                            }
                            if (++spawnIdx < curCount) done = false;
                        } else {
                            done = false;
                        }
                        for (int i = 0; i < curCount; ++i) {
                            auto* s = squadSprites[static_cast<size_t>(i)];
                            if (s->auxState == 0) {
                                if (s->frameIdx == 1) {
                                    s->zOff = 0;
                                    s->auxState = 1;
                                    engine->triggerBattleShake(1200);
                                    for (int k = 0; k < 2; ++k) {
                                        Sprite* sm = engine->createBattleEffect(
                                            engine->smokeProto.get(), 0, 0, -1, 1, GameRng::nextInt(4) * 50, 0);
                                        sm->setPos(s->x + GameRng::nextInt(baseSprite->frameW - sm->frameW),
                                                   s->y + baseSprite->frameH - sm->frameH + 2);
                                        sm->drawOver = true;
                                    }
                                    Sprite* smL = engine->createBattleEffect(
                                        engine->smokeProto.get(), -1, 0, -1, 1, GameRng::nextInt(4) * 50, 0);
                                    smL->setPos(s->x, s->y + baseSprite->frameH - smL->frameH + 2);
                                    smL->drawOver = true;
                                    Sprite* smR = engine->createBattleEffect(
                                        engine->smokeProto.get(), 1, 0, -1, 1, GameRng::nextInt(4) * 50, 0);
                                    smR->setPos(s->x + baseSprite->frameW - smR->frameW, s->y + baseSprite->frameH - smR->frameH + 2);
                                    smR->drawOver = true;
                                }
                                done = false;
                            } else if (s->auxState != -1) {
                                if (s->loopsLeft > 0) {
                                    done = false;
                                } else if (s->loopsLeft != -1) {
                                    if (s->auxState == 1) {
                                        s->setAnim(3, facingRight);
                                        s->loopsLeft = 1;
                                        s->auxState = 2;
                                        done = false;
                                    } else if (s->auxState == 2) {
                                        s->zOff = -6;
                                        s->floatPhaseActive = true;
                                        s->gravityY = GameRng::range(-2, 3);
                                        s->setAnim(0, facingRight);
                                        s->loopsLeft = -1;
                                        s->auxState = 3;
                                        done = false;
                                    }
                                }
                            }
                        }
                        if (done) {
                            subStep = 0;
                            phaseTimerMs = engine->gameTimeMs;
                            phase = 4;
                        }
                    }
                } else if (subStep == 0) {
                    if (engine->gameTimeMs - phaseTimerMs >= 200ULL) {
                        if (unitType == 9) activeProjectiles.assign(static_cast<size_t>(curCount * 2), nullptr);
                        else if (unitType != 7 && unitType != 1) activeProjectiles.assign(static_cast<size_t>(curCount), nullptr);
                        subStep = 1;
                        spawnIdx = 0;
                        phaseTimerMs = engine->gameTimeMs;
                    }
                } else if (subStep == 1) {
                    bool done = true;
                    if (spawnIdx < curCount) {
                        auto* s = squadSprites[static_cast<size_t>(spawnIdx)];
                        s->setAnim(2, facingRight);
                        s->loopsLeft = 1;
                        if (unitType == 3 || unitType == 2) {
                            Sprite* p = engine->createBattleEffect(projectileProto.get(), 0, 0, 0, 1, 50, 0);
                            p->setPos(s->x + mirrorX(p, s->frameW), s->y);
                            activeProjectiles[static_cast<size_t>(spawnIdx)] = p;
                        } else if (unitType == 1) {
                            Sprite* p = engine->createBattleEffect(hitEffectProto.get(), 0, 0, 0, 1, 0, 0);
                            p->setAnim(1, facingRight);
                            p->setPos(s->x + mirrorX(p, s->frameW), s->y);
                        } else if (unitType == 7) {
                            s->shakeTicks = 5;
                            for (int k = 0; k < 3; ++k) {
                                Sprite* sm = engine->createBattleEffect(
                                    engine->smokeProto.get(), GameRng::range(-1, 2), 0, 0, 1, GameRng::nextInt(4) * 50, 0);
                                sm->setPos(s->x + baseSprite->frameW / 2, s->y);
                                sm->drawOver = true;
                            }
                        } else if (unitType == 9) {
                            Sprite* sl = engine->createBattleEffect(slashProto.get(), 0, 0, 0, 1, 200, 0);
                            sl->setPos(squadSprites[0]->x, squadSprites[0]->y + baseSprite->frameH);
                            sl->zOff = -baseSprite->frameH;
                            int wvx = kSideDir[sideIndex] * 3;
                            Sprite* w0 = engine->createBattleEffect(projectileProto.get(), wvx, -2, 0, -1, 100, 0);
                            int wx = s->x + mirrorX(w0, s->frameW / 2);
                            int wy = s->y + baseSprite->frameH - w0->frameH + 2;
                            w0->setPos(wx, wy);
                            w0->sideOwner = sideIndex;
                            activeProjectiles[0] = w0;
                            Sprite* w1 = engine->createBattleEffect(projectileProto.get(), wvx, 1, 0, -1, 100, 0);
                            w1->setPos(wx, wy);
                            w1->sideOwner = sideIndex;
                            activeProjectiles[1] = w1;
                        } else if (unitType == 8) {
                            Sprite* beam = engine->createBattleEffect(nullptr, kSideDir[sideIndex], 0, 0, -1, 2000, 6);
                            beam->setPos(s->x + mirrorX(beam, s->frameW + 2), s->y + 30);
                            beam->drawOver = true;
                            activeProjectiles[static_cast<size_t>(spawnIdx)] = beam;
                            engine->triggerBattleShake(1200);
                        }
                    }
                    if (++spawnIdx < curCount) done = false;
                    for (int i = 0; i < curCount; ++i) {
                        auto* s = squadSprites[static_cast<size_t>(i)];
                        if (s->loopsLeft > 0) {
                            done = false;
                        } else if (unitType != 7 && s->loopsLeft != -1) {
                            if (s->auxState == 0) {
                                s->setAnim(3, facingRight);
                                s->loopsLeft = 1;
                                s->auxState = 1;
                                if (unitType == 8 && activeProjectiles[static_cast<size_t>(i)]) {
                                    activeProjectiles[static_cast<size_t>(i)]->alive = false;
                                }
                                done = false;
                            } else if (s->auxState == 1) {
                                s->setAnim(0, facingRight);
                                s->loopsLeft = -1;
                                s->auxState = 2;
                                done = false;
                            }
                        }
                        if (unitType == 8 && activeProjectiles[static_cast<size_t>(i)] &&
                            activeProjectiles[static_cast<size_t>(i)]->alive) {
                            auto* beam = activeProjectiles[static_cast<size_t>(i)];
                            Sprite* sm = engine->createBattleEffect(
                                engine->smokeProto.get(), kSideDir[sideIndex] * GameRng::range(1, 4),
                                GameRng::range(-2, 3), 0, 1, 50 * GameRng::nextInt(4), 0);
                            sm->setPos(s->x + mirrorX(sm, baseSprite->frameW),
                                       beam->y + GameRng::nextInt(std::max(1, 30 - beam->frameH)) - 15);
                            sm->drawOver = true;
                        }
                    }
                    if (done) {
                        phase = (unit->unitType == 9) ? 6 : 4;
                        waitMs = (unit->unitType == 8) ? 0 : 400;
                        phaseTimerMs = engine->gameTimeMs;
                        subStep = 0;
                    }
                }
                break;
            case 4:
                if (subStep == 0) {
                    if (engine->gameTimeMs - phaseTimerMs >= static_cast<uint64_t>(waitMs)) {
                        other->applyDamage();
                        if (unitType != 1) engine->triggerBattleShake(200);
                        impactCount = hitEffectProto ? static_cast<int>(Unit::sSquadOffsets[static_cast<size_t>(unitType)].size()) : 0;
                        subStep = 1;
                    }
                } else if (subStep == 1) {
                    if (--impactCount < 0) {
                        phase = 7;
                        phaseTimerMs = engine->gameTimeMs;
                    } else {
                        int loops = (unitType == 3 || unitType == 2 || unitType == 1) ? 1 : -1;
                        Sprite* eff = engine->createBattleEffect(hitEffectProto.get(), 0, 0, 0, loops, 0, 0);
                        if (unitType == 2 || unitType == 1) eff->removeWhenDone = false;
                        int ex = GameRng::nextInt(std::max(1, engine->battleHalfW - eff->frameW));
                        int bgOff = bgRegion.isValid() ? (bgRegion.h - eff->frameH) : 0;
                        int maxOff = static_cast<int>(Unit::sSquadOffsets[static_cast<size_t>(unitType)].size()) * 2;
                        int ey = (engine->battleViewH - bgOff) * (impactCount * 2 + 1) / std::max(1, maxOff) - eff->frameH / 2 + bgOff;
                        if (sideIndex == 0) ex += engine->battleHalfW;
                        if (unitType == 7 || unitType == 6) {
                            eff->zOff = ey;
                            ey = 0;
                        }
                        eff->setPos(ex, ey);
                        for (int k = 0; k < 3; ++k) {
                            if (unitType != 7 && unitType != 6) {
                                Sprite* sm = engine->createBattleEffect(engine->smokeProto.get(), GameRng::range(-1, 2), 0, -1, 1, 100, 0);
                                sm->setPos(ex + GameRng::nextInt(std::max(1, eff->frameW - sm->frameW)), ey + eff->frameH - sm->frameH + 1);
                            } else {
                                Sprite* sp = engine->createBattleEffect(
                                    engine->sparkProto.get(), GameRng::range(-1, 2), 0, GameRng::range(-2, 0), 1, GameRng::nextInt(4) * 50, 0);
                                sp->setPos(ex + GameRng::nextInt(std::max(1, eff->frameW - sp->frameW)), eff->zOff + eff->frameH - sp->frameH + 1);
                                sp->zOff = -eff->frameH / 2;
                            }
                        }
                    }
                }
                break;
            case 6: {
                bool allDone = true;
                for (size_t i = 0; i < activeProjectiles.size(); ++i) {
                    Sprite* p = activeProjectiles[i];
                    if (!p) continue;
                    if (unitType == 9 && GameRng::nextInt(2) == 0) {
                        Sprite* sm = engine->createBattleEffect(engine->smokeProto.get(), GameRng::range(-2, 1), 0, -1, 1, 100, 0);
                        sm->setPos(p->x + mirrorX(p, 0), p->y + p->frameH - sm->frameH);
                        sm->sideOwner = (p->auxState == 1) ? other->sideIndex : sideIndex;
                    }
                    if (unitType == 9) {
                        if (sideIndex == 0) {
                            if (p->x >= engine->battleHalfW) {
                                if (p->auxState == 0) {
                                    p->setPos(engine->battleHalfW - p->frameW, p->y);
                                    p->sideOwner = other->sideIndex;
                                    p->auxState = 1;
                                    allDone = false;
                                } else if (p->auxState == 1) {
                                    p->alive = false;
                                    p->auxState = 2;
                                }
                            } else {
                                allDone = false;
                            }
                        } else {
                            if (p->x + p->frameW < 0) {
                                if (p->auxState == 0) {
                                    p->setPos(engine->battleHalfW, p->y);
                                    p->sideOwner = other->sideIndex;
                                    p->auxState = 1;
                                    allDone = false;
                                } else if (p->auxState == 1) {
                                    p->alive = false;
                                    p->auxState = 2;
                                }
                            } else {
                                allDone = false;
                            }
                        }
                    }
                }
                if (allDone) {
                    subStep = 0;
                    phase = 4;
                    phaseTimerMs = engine->gameTimeMs;
                }
                break;
            }
            case 7:
                if (engine->gameTimeMs - phaseTimerMs >= 1000ULL) {
                    phase = 0;
                    actionDone = true;
                }
                break;
            default:
                break;
        }
    } else if (unitType == 4) {
        switch (phase) {
            case 1:
                if (subStep == 0) {
                    if (engine->gameTimeMs - phaseTimerMs >= 200ULL) {
                        subStep = 1;
                        phaseTimerMs = engine->gameTimeMs;
                    }
                } else {
                    if (subStep == 1) {
                        spinSpeed += 5;
                        if (spinSpeed >= 90) {
                            ++subStep;
                            phaseTimerMs = engine->gameTimeMs;
                        }
                        if ((spinSpeed - 20) % 15 == 0) {
                            for (size_t i = 0; i < squadSprites.size(); ++i) {
                                Sprite* sm = engine->createBattleEffect(engine->smokeProto.get(), GameRng::range(-1, 2), 0, 0, 1, 100, 0);
                                sm->setPos(squadSprites[i]->x + GameRng::nextInt(std::max(1, baseSprite->frameW - sm->frameW)),
                                           squadSprites[i]->y + baseSprite->frameH - sm->frameH + 1);
                            }
                        }
                    } else if (subStep == 2 && engine->gameTimeMs - phaseTimerMs >= 400ULL) {
                        spinSpeed = 20;
                        other->applyDamage();
                        phase = 4;
                        other->shaking = false;
                        phaseTimerMs = engine->gameTimeMs;
                    }
                    if (++animIndex >= 2) {
                        for (size_t i = 0; i < other->squadSprites.size(); ++i) {
                            auto* os = other->squadSprites[i];
                            Sprite* eff = engine->createBattleEffect(engine->redsparkProto.get(), 0, 0, 0, 1, 50, 0);
                            eff->setPos(os->x + GameRng::nextInt(std::max(1, os->frameW - eff->frameW)),
                                       os->y + GameRng::nextInt(std::max(1, os->frameH - eff->frameH)));
                            eff->drawOver = true;
                        }
                        animIndex = 0;
                        other->shakeAll();
                    }
                }
                break;
            case 4:
                if (engine->gameTimeMs - phaseTimerMs >= 800ULL) {
                    actionDone = true;
                    phase = 0;
                }
                break;
            default:
                break;
        }
        bool spawnFloat = false;
        if (engine->gameTimeMs - floatTimerMs >= 300ULL) {
            spawnFloat = true;
            floatTimerMs = engine->gameTimeMs;
        }
        for (size_t i = 0; i < squadSprites.size(); ++i) {
            auto* s = squadSprites[i];
            if (spawnFloat) {
                Sprite* p = engine->createBattleEffect(nullptr, 0, 0, 0, 1, 500, 4);
                p->setPos(s->x + (s->frameW >> 1), s->y + (s->frameH >> 1) + s->zOff);
            }
            int radius = s->frameW / 3;
            s->setPos(squadBasePos[i][0] + engine::floorDivPow2(radius * Trig::cos1024(floatAngles[i]), 10),
                      squadBasePos[i][1] + engine::floorDivPow2((radius * Trig::sin1024(floatAngles[i])) / 3, 10));
            floatAngles[i] = (floatAngles[i] + spinSpeed) % 360;
        }
    } else {
        switch (phase) {
            case 1:
                if (engine->gameTimeMs - phaseTimerMs >= 200ULL) phase = 3;
                break;
            case 3: {
                bool done = true;
                if (subStep < curCount) {
                    if (unitType == 0 || unitType == 5) squadSprites[static_cast<size_t>(subStep)]->gravityY = -6;
                    if (unitType == 5) {
                        squadSprites[static_cast<size_t>(subStep)]->vx = 2 * kSideDir[sideIndex];
                        for (int k = 0; k < 3; ++k) {
                            Sprite* sm = engine->createBattleEffect(engine->smokeProto.get(), GameRng::range(-1, 2), 0, -1, 1, 100, 0);
                            sm->setPos(squadSprites[static_cast<size_t>(subStep)]->x + GameRng::nextInt(std::max(1, baseSprite->frameW - sm->frameW)),
                                       squadSprites[static_cast<size_t>(subStep)]->y + baseSprite->frameH - sm->frameH + 1);
                        }
                    } else {
                        squadSprites[static_cast<size_t>(subStep)]->vx = kSideDir[sideIndex];
                    }
                    squadSprites[static_cast<size_t>(subStep)]->setAnim(1, facingRight);
                    ++subStep;
                    done = false;
                }
                for (int i = 0; i < subStep; ++i) {
                    auto* s = squadSprites[static_cast<size_t>(i)];
                    if (unitType == 10) {
                        if (s->auxState != -1) {
                            ++s->auxState;
                            if (s->auxState >= 16) {
                                s->setAnim(2, facingRight);
                                s->vx = 0;
                                s->auxState = -1;
                                Sprite* spk = engine->createBattleEffect(nullptr, 0, 0, 0, 1, 800, 2);
                                spk->setPos(s->x + mirrorX(spk, baseSprite->frameW), s->y + baseSprite->frameH);
                                Sprite* sl = engine->createBattleEffect(slashProto.get(), 0, 0, 0, 1, 150, 0);
                                sl->setPos(s->x + mirrorX(sl, 24), s->y + 3);
                            } else {
                                done = false;
                            }
                        }
                    } else if (s->zOff < 0) {
                        ++s->gravityY;
                        done = false;
                    } else if (s->gravityY >= 6) {
                        s->zOff = 0;
                        s->gravityY = 0;
                        s->vx = 0;
                        if (unitType == 0 || unitType == 5) {
                            s->setAnim(2, facingRight);
                            if (unitType == 0) {
                                Sprite* sl = engine->createBattleEffect(slashProto.get(), 0, 0, 0, 1, 150, 0);
                                sl->setPos(s->x + mirrorX(sl, 14), s->y + s->frameH);
                                sl->zOff = 4 - s->frameH;
                            } else {
                                Sprite* r = engine->createBattleEffect(engine->redsparkProto.get(), 0, 0, 0, 1, 50, 0);
                                r->setPos(s->x + mirrorX(r, baseSprite->frameW * 3 / 4), s->y + s->frameH);
                                r->zOff = -r->frameH;
                            }
                        }
                    }
                }
                if (done) {
                    subStep = 0;
                    phase = 6;
                    other->applyDamage();
                    engine->triggerBattleShake(200);
                    phaseTimerMs = engine->gameTimeMs;
                }
                break;
            }
            case 4: {
                bool done = true;
                if (subStep < curCount) {
                    auto* s = squadSprites[static_cast<size_t>(subStep)];
                    if (unitType == 0 || unitType == 2 || unitType == 5) s->gravityY = -6;
                    else if (unitType == 10) s->auxState = 0;
                    s->vx = (unitType == 5) ? (-2 * kSideDir[sideIndex]) : -kSideDir[sideIndex];
                    s->setAnim(3, facingRight);
                    ++subStep;
                    done = false;
                }
                for (int i = 0; i < subStep; ++i) {
                    auto* s = squadSprites[static_cast<size_t>(i)];
                    if (unitType == 10) {
                        if (s->auxState != -1) {
                            ++s->auxState;
                            if (s->auxState >= 16) {
                                s->setAnim(0, facingRight);
                                s->vx = 0;
                                s->auxState = -1;
                            } else {
                                done = false;
                            }
                        }
                    } else if (s->zOff < 0) {
                        ++s->gravityY;
                        done = false;
                    } else if (s->gravityY >= 6) {
                        s->gravityY = 0;
                        s->vx = 0;
                        s->zOff = 0;
                        s->setAnim(0, facingRight);
                    }
                }
                if (done) {
                    actionDone = true;
                    phase = 0;
                    phaseTimerMs = engine->gameTimeMs;
                }
                break;
            }
            case 6:
                if ((unitType == 10 && engine->gameTimeMs - phaseTimerMs >= 400ULL) ||
                    ((unitType == 0 || unitType == 2 || unitType == 5) && engine->gameTimeMs - phaseTimerMs >= 50ULL)) {
                    phase = 4;
                }
                break;
            default:
                break;
        }
    }

    if (unitType == 6) {
        for (size_t i = 0; i < squadSprites.size(); ++i) {
            if (squadSprites[i]->floatPhaseActive) {
                squadSprites[i]->zOff = -6 + engine::floorDivPow2(4 * Trig::sin1024(floatAngles[i]), 10);
                floatAngles[i] = (floatAngles[i] + 10) % 360;
            }
        }
    }
}

void BattleSide::applyDamage() {
    damageApplied = true;
    deadCount = startCount - endCount;
    curCount = endCount;

    for (int i = 0; i < deadCount; ++i) {
        auto* s = squadSprites[static_cast<size_t>(i)];
        s->alive = false;
        Sprite* r = engine->createBattleEffect(engine->redsparkProto.get(), 0, 0, 0, 1, 0, 0);
        r->setPos(s->x + (s->frameW - r->frameW) / 2, engine->screenH);
        r->zOff = s->y + (s->frameH - r->frameH) / 2 - engine->screenH;
        for (int k = 0; k < 3; ++k) {
            Sprite* sp = engine->createBattleEffect(
                engine->sparkProto.get(), -1 + k, 0, GameRng::range(-4, -1), 1, GameRng::nextInt(4) * 50, 0);
            sp->setPos(s->x + (s->frameW - sp->frameW) / 2, s->y + s->frameH - sp->frameH + 3);
        }
        Sprite* sm = engine->createBattleEffect(engine->smokeProto.get(), 0, 0, -1, 1, 200, 0);
        sm->setPos(s->x + (s->frameW - sm->frameW) / 2, s->y + s->frameH - sm->frameH + 3);
    }

    std::vector<Sprite*> survivors(static_cast<size_t>(curCount));
    for (int i = 0; i < curCount; ++i) {
        survivors[static_cast<size_t>(i)] = squadSprites[static_cast<size_t>(deadCount + i)];
    }
    squadSprites = std::move(survivors);

    auto txt = Sprite::createFloatingText(std::to_string(endHp - startHp), 0, -4, 1);
    int tx = 0;
    int ty = 0;
    if (endCount == 1 && !squadSprites.empty()) {
        tx = squadSprites[0]->x + squadSprites[0]->frameW / 2;
        ty = squadSprites[0]->y + squadSprites[0]->frameH + 1;
    } else {
        tx = engine->battleHalfW / 2;
        if (sideIndex == 1) tx += engine->battleHalfW;
        ty = (engine->battleViewH + bgHeight) / 2;
    }
    txt->setPos(tx, ty);
    txt->drawOver = true;
    engine->addBattleSprite(std::move(txt));
}

void BattleSide::drawBackground(engine::GraphicsContext& g, int offX, int offY) {
    g.translate(offX, offY);
    int px = 0;
    for (int cx = 0; cx < tileCols; ++cx) {
        int py = bgHeight + offY;
        for (int cy = 0; cy < tileRows; ++cy) {
            uint8_t idx = tileGrid[static_cast<size_t>(cx)][static_cast<size_t>(cy)];
            if (idx < terrainTiles.size()) {
                terrainTiles[idx].draw(g, px, py);
            }
            py += 24;
        }
        px += 24;
    }
    if (bgRegion.isValid() && bgRegion.w > 0) {
        int bw = bgRegion.w;
        int bx = 0;
        int cnt = engine->battleHalfW / bw;
        for (int i = 0; i < cnt; ++i) {
            bgRegion.draw(g, bx, 0);
            bx += bw;
        }
    }
    g.translate(-offX, -offY);
}

void BattleSide::drawHpText(engine::GraphicsContext& g) {
    int y = engine->screenH - GameEngine::kBattleHudHeight / 2;
    SpriteFont::draw(g, std::to_string(displayedHp) + "/100", engine->battleHalfW / 2, y, 1,
                     engine::HCENTER | engine::VCENTER);
}

void BattleSide::drawShadows(engine::GraphicsContext& g) {
    g.setColor(4210752);
    for (int i = 0; i < curCount; ++i) {
        Sprite* s = squadSprites[static_cast<size_t>(i)];
        if (unitType == 0 || unitType == 4 || unitType == 5 || unitType == 6) {
            g.fillArc(s->x, s->y + s->frameH * 4 / 5, s->frameW, s->frameH / 4, 0, 360);
        }
    }
}

} // namespace game
