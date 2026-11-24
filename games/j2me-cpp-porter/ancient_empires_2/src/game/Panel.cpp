#include "game/Panel.hpp"
#include "game/GameEngine.hpp"
#include "game/PakAndLang.hpp"

#include <algorithm>
#include <cstdlib>

namespace game {

GameEngine* Panel::engine = nullptr;

Panel::Panel(int8_t type, int bMask) : panelType(type), borderMask(bMask) {
    if (type == 15) {
        groupHeight = engine->gamePanelHeight - engine->smallArrowSprite->frameH;
        animateCursor = true;
    } else if (type == 0 || type == 11) {
        softkeys[0] = true;
        softkeys[1] = true;
    } else if (type == 3) {
        radialCircleProto = engine->bigCircleProto.get();
        initSparks();
        animateCursor = false;
        focusable = true;
        fontAscentDiff = engine::GraphicsContext::fontHeight(0) - engine::GraphicsContext::fontBaseline(0);
        width = engine->screenW;
        height = engine->bigCircleProto->frameH + kPad2;
        if ((bMask & 2) == 0) height += 5;
        buyUnits = Unit::getBuyList(engine->currentPlayer);
        itemStep = static_cast<int>(buyUnits.size());
        int availW = width - engine->sideArrowSprite->frameW * 2;
        if ((bMask & 4) == 0) availW -= 8;
        if ((bMask & 8) == 0) availW -= 8;
        visibleCount = std::max(1, availW / (engine->bigCircleProto->frameW + 3));
        if (visibleCount > itemStep) visibleCount = itemStep;
        lineHeight = (visibleCount > 0) ? (availW / visibleCount) : availW;
        centerPad = (availW - lineHeight * visibleCount) / 2;
        cursorSpeed = 2;
    } else if (type == 2 || type == 5) {
        animateCursor = false;
        height = 5 + kPad + 24 + kPad2 + engine->smallCircleProto->frameH * 2 + kPad + kPad + 1;
        if (type == 5) {
            height += kPad2 + engine::GraphicsContext::fontHeight(0);
            infoUnit = engine->getUnitAt(engine->cursorGx, engine->cursorGy, 0);
            if (infoUnit) selectedIdx = infoUnit->unitType;
        }
        width = engine->screenW;
    } else if (type == 8) {
        bgColor = 8;
        softkeys[0] = true;
    }
    dirty = true;
}

void Panel::onShow() {
    radialRotOffset = 0;
    if (!sparks.empty()) randomizeSparks();
    fadeTimer = 4;
    dirty = true;
    bgDirty = true;
    if (engine) engine->mapDirty = true;
    if (detailPanel) detailPanel->dirty = true;
    if (panelType == 15) {
        for (auto& ch : children) {
            ch->onShow();
            ch->bgDirty = false;
        }
    }
}

void Panel::setSoftkey(int idx, bool enabled) {
    if (idx == 0 || idx == 1) softkeys[idx] = enabled;
}

void Panel::setBackPanel(Panel* back) {
    backTarget = back;
    softkeys[1] = (back != nullptr);
}

Panel* Panel::attachDetailTextBox(const std::string& text) {
    detailPanel = std::make_unique<Panel>(10, 0);
    detailPanel->setupTextBox("", text, engine->screenW, -1);
    return detailPanel.get();
}

void Panel::addChildPanel(std::unique_ptr<Panel> child, int x, int y, int anchor) {
    if (groupPageHeights.empty()) {
        groupPageHeights.assign(5, groupHeight);
        for (int i = 1; i < 5; ++i) {
            groupPageHeights[static_cast<size_t>(i)] -= engine->smallArrowSprite->frameH;
        }
    }
    child->setPos(x, y, anchor);
    int cy = child->targetY;
    for (int i = 0; i < 5; ++i) {
        if (cy < groupPageHeights[static_cast<size_t>(i)]) {
            if (cy + child->height > groupPageHeights[static_cast<size_t>(i)]) {
                groupPageHeights[static_cast<size_t>(i)] = cy;
                if (i + 1 > groupMaxPage) groupMaxPage = i + 1;
            }
            break;
        }
        cy -= groupPageHeights[static_cast<size_t>(i)];
    }
    child->setSoftkey(0, false);
    child->setSoftkey(1, false);
    children.push_back(std::move(child));
}

void Panel::setupMinimap(int maxW, int maxH, const std::vector<std::vector<int8_t>>& tiles, bool showUnits) {
    borderMask = 15;
    minimapTiles = tiles;
    minimapShowUnits = showUnits;
    bgColor = 8;
    softkeys[0] = true;
    animateCursor = true;
    mapCols = static_cast<int>(tiles.size());
    mapRows = mapCols > 0 ? static_cast<int>(tiles[0].size()) : 0;
    int mw = engine->miniIcons.empty() ? 4 : engine->miniIcons[0].w;
    int mh = engine->miniIcons.empty() ? 4 : engine->miniIcons[0].h;
    width = mapCols * mw + 8;
    height = mapRows * mh + 8;
    if (width > maxW) {
        mapViewCols = (maxW - 8) / mw;
        width = mw * mapViewCols + 8;
    } else {
        mapViewCols = mapCols;
    }
    if (height > maxH) {
        mapViewRows = (maxH - 8) / mh;
        height = mh * mapViewRows + 8;
    } else {
        mapViewRows = mapRows;
    }
    panelType = 8;
}

void Panel::setPos(int x, int y, int anchor) {
    targetX = x;
    targetY = y;
    if ((anchor & engine::HCENTER) != 0) targetX -= (width >> 1);
    else if ((anchor & engine::RIGHT) != 0) targetX -= width;
    if ((anchor & engine::VCENTER) != 0) targetY -= (height >> 1);
    else if ((anchor & engine::BOTTOM) != 0) targetY -= height;
    curX = targetX;
    curY = targetY;
}

void Panel::setupSpeechDialog(const std::string& text, int maxW, int maxH, int8_t pId, int8_t /*side*/) {
    portraitId = pId;
    if (pId == -1) {
        borderMask = 14;
    } else {
        portraitPad = engine->portraitsSprite->frameW - 8;
    }
    int wrapW = maxW - portraitPad - 16;
    auto wrapped = Lang::wrapText(text, wrapW, 1);
    setupTextLines("", std::move(wrapped), maxW, maxH);
    hasScrollBar = false;
    panelType = 7;
}

void Panel::setupTextLines(const std::string& title, std::vector<std::string> lines, int w, int h) {
    animateCursor = false;
    width = w;
    height = h;
    itemStep = static_cast<int>(lines.size());
    selectedIdx = 0;
    scrollIdx = 0;
    scrollPixelOff = 0;
    hasScrollBar = false;
    int wrapW = w - portraitPad - 16;
    if (!title.empty()) {
        titleLines = Lang::wrapText(title, wrapW, 1);
    } else {
        titleLines.clear();
    }
    items = std::move(lines);
    lineHeight = engine::GraphicsContext::fontHeight(1);
    fontAscentDiff = engine::GraphicsContext::fontHeight(1) - engine::GraphicsContext::fontBaseline(1);
    fontHalfDiff = fontAscentDiff / 2;

    int availH = (h <= 0) ? engine->screenH : h;
    if ((borderMask & 1) == 0) availH -= 5;
    if ((borderMask & 2) == 0) availH -= 5;
    if (!titleLines.empty()) availH -= static_cast<int>(titleLines.size()) * lineHeight;

    visibleCount = (availH - 2) / std::max(1, lineHeight);
    if (visibleCount > itemStep) {
        visibleCount = itemStep;
    } else if (visibleCount < itemStep) {
        hasScrollBar = true;
    }

    if (h < 0) {
        height = static_cast<int>(titleLines.size()) * lineHeight + visibleCount * lineHeight;
        if ((borderMask & 1) == 0) height += 5;
        if ((borderMask & 2) == 0) height += 5;
    } else {
        centerPad = (availH - visibleCount * lineHeight) / 2;
    }
    panelType = 10;
    state = 2;
}

void Panel::setupTextBox(const std::string& title, const std::string& body, int w, int h) {
    int wrapW = w - portraitPad;
    if ((borderMask & 4) == 0) wrapW -= 8;
    if ((borderMask & 8) == 0) wrapW -= 8;
    auto lines = Lang::wrapText(body, wrapW, 1);
    setupTextLines(title, std::move(lines), w, h);
    if (hasScrollBar) {
        wrapW -= engine->smallArrowSprite->frameW;
        lines = Lang::wrapText(body, wrapW, 1);
        setupTextLines(title, std::move(lines), w, h);
    }
}

void Panel::initSparks() {
    sparks.clear();
    for (int i = 0; i < 3; ++i) {
        sparks.push_back(std::make_unique<Sprite>(*engine->smallSparkProto));
    }
    randomizeSparks();
}

void Panel::randomizeSparks() {
    if (!radialCircleProto) return;
    for (auto& sp : sparks) {
        sp->visible = true;
        sp->setPos(GameRng::nextInt(std::max(1, radialCircleProto->frameW)),
                   GameRng::nextInt(std::max(1, radialCircleProto->frameH)));
        sp->setFrameIndex(GameRng::nextInt(std::max(1, sp->totalFrames())));
    }
}

void Panel::setupIconBar(std::vector<std::string> labels, std::vector<ImageRegion> icns, int x, int y, int anchor) {
    borderMask = 15;
    items = std::move(labels);
    icons = std::move(icns);
    itemStep = static_cast<int>(items.size());
    width = 0;
    for (const auto& s : items) {
        width = std::max(width, engine::GraphicsContext::stringWidth(1, s));
    }
    fontAscentDiff = engine::GraphicsContext::fontHeight(1) - engine::GraphicsContext::fontBaseline(1);
    fontHalfDiff = fontAscentDiff / 2;
    iconSize = engine->smallCircleProto->frameW;
    lineHeight = iconSize + fontAscentDiff;
    width += itemStep * lineHeight + 32;
    if (width > engine->screenW) width = engine->screenW;
    height = iconSize;
    setPos(x, y, anchor);
    panelType = 13;
    state = 2;
}

void Panel::setupLeftRightSelector(std::vector<std::string> labels, int minW, int h) {
    items = std::move(labels);
    itemStep = static_cast<int>(items.size());
    focusable = true;
    animateCursor = false;
    height = h;
    int maxW = 0;
    for (const auto& s : items) {
        maxW = std::max(maxW, engine::GraphicsContext::stringWidth(1, s));
    }
    width = maxW + 16 + engine->sideArrowSprite->frameW * 2;
    if (width < minW) width = minW;
    if (height < 0) {
        height = engine::GraphicsContext::fontHeight(1);
        if (engine->sideArrowSprite->frameH > height) height = engine->sideArrowSprite->frameH;
        if ((borderMask & 1) == 0) height += 5;
        if ((borderMask & 2) == 0) height += 5;
    }
    panelType = 14;
    state = 2;
}

void Panel::setupListMenu(std::vector<std::string> list, int x, int y, int minW, int maxH, int anchor, int textAlign) {
    items = std::move(list);
    itemStep = static_cast<int>(items.size());
    fontAscentDiff = engine::GraphicsContext::fontHeight(1) - engine::GraphicsContext::fontBaseline(1);
    lineHeight = engine::GraphicsContext::fontHeight(1);
    int maxW = 0;
    for (const auto& s : items) {
        maxW = std::max(maxW, engine::GraphicsContext::stringWidth(1, s));
    }
    width = maxW + 4 + 16;
    if (width > engine->screenW) width = engine->screenW;
    else if (width < minW) {
        if (textAlign == engine::LEFT) leftTextPad = (minW - width) / 2;
        width = minW;
    }
    height = lineHeight * itemStep + fontAscentDiff + 16;
    if (height > maxH) height = maxH;
    setupTextLines("", items, width, height);
    if (width < engine->screenW && hasScrollBar) {
        width += engine->smallArrowSprite->frameW;
    }
    panelType = 11;
    setPos(x, y, anchor);
}

void Panel::setupRadialMenu(std::vector<std::string> labels, std::vector<ImageRegion> icns,
                            int cx, int cy, int hHint, int anchor, int8_t rKind) {
    radialKind = rKind;
    items = std::move(labels);
    icons = std::move(icns);
    itemStep = static_cast<int>(items.size());
    if (rKind == 1) {
        radialCircleProto = engine->bigCircleProto.get();
    } else if (rKind == 2) {
        radialCircleProto = engine->smallCircleProto.get();
        if (itemStep < 4) {
            items.resize(4);
            itemStep = 4;
        }
    }
    fontAscentDiff = engine::GraphicsContext::fontHeight(1) - engine::GraphicsContext::fontBaseline(1);
    borderMask = 15;
    iconSize = radialCircleProto->frameW;
    iconHalf = iconSize >> 1;
    initSparks();
    radialAngles.resize(static_cast<size_t>(itemStep));
    radialStepDeg = 360 / std::max(1, itemStep);
    radialBaseDeg = radialStepDeg / 2;
    radialRotStep = radialBaseDeg;
    for (int i = 0; i < itemStep; ++i) {
        radialAngles[static_cast<size_t>(i)] = static_cast<int16_t>(radialStepDeg * i);
    }
    if (itemStep == 1) {
        radialRadius = 0;
        radialOuterR = iconSize / 2;
    } else if (hHint <= 0) {
        radialRadius = (radialCircleProto->frameW << 10) / std::max(1, 2 * Trig::sin1024(45));
        radialOuterR = radialRadius + radialCircleProto->frameW / 2;
        hHint = radialOuterR * 2 + engine::GraphicsContext::fontHeight(1) + 2;
    } else {
        int maxR = (radialCircleProto->frameW << 10) / std::max<int>(1, Trig::sin1024(radialStepDeg / 2)) + radialCircleProto->frameH / 2;
        radialOuterR = (hHint - engine::GraphicsContext::fontHeight(1)) / 2 - 2;
        if (radialOuterR > maxR) radialOuterR = maxR;
        radialRadius = radialOuterR - radialCircleProto->frameH / 2;
    }
    radialCurRadius = 0;
    width = radialOuterR * 2;
    height = hHint;
    state = 0;
    setPos(cx, cy, anchor);
}

int Panel::findNextFocusableChild(int dir) const {
    int idx = focusedChild;
    int start = focusedChild;
    int cnt = static_cast<int>(children.size());
    if (cnt == 0) return -1;
    do {
        idx += dir;
        if (idx < 0) idx = cnt - 1;
        else if (idx >= cnt) {
            if (start < 0) return -1;
            idx = 0;
        }
    } while (!children[static_cast<size_t>(idx)]->focusable);
    return idx;
}

void Panel::tick(bool handleInput) {
    if (state == 3) return;
    if (panelType == 10 && autoCloseMs > 0 && autoCloseMs <= 250) {
        ++fadeTimer;
        dirty = true;
    } else if (fadeTimer > 0) {
        --fadeTimer;
        dirty = true;
    }

    if (handleInput && state == 2) {
        bool fired = false;
        if (softkeys[0] && (engine->input.consumeJustPressed(GK_LSK) || engine->input.consumeJustPressed(GK_FIRE))) {
            fired = true;
            engine->input.clearKeyBit(GK_LSK | GK_FIRE);
        }

        if (panelType == 0 || panelType == 3) {
            for (auto& sp : sparks) {
                if (sp->frameIdx == sp->totalFrames() - 1) {
                    if (radialRotOffset == 0) {
                        sp->setPos(GameRng::nextInt(std::max(1, radialCircleProto->frameW - sp->frameW)),
                                   GameRng::nextInt(std::max(1, radialCircleProto->frameH - sp->frameH)));
                    } else {
                        sp->visible = false;
                    }
                }
                sp->advanceFrame();
            }
            dirty = true;
        }

        if (panelType == 15) {
            if (!allHighlight && focusedChild >= 0 && focusedChild < static_cast<int>(children.size())) {
                if (engine->input.consumeJustPressed(GK_UP)) {
                    children[static_cast<size_t>(focusedChild)]->dirty = true;
                    focusedChild = findNextFocusableChild(-1);
                    auto* ch = children[static_cast<size_t>(focusedChild)].get();
                    ch->dirty = true;
                    int cy = ch->targetY;
                    for (int i = 0; i < 5; ++i) {
                        if (cy < groupPageHeights[static_cast<size_t>(i)]) {
                            if (groupPage != i) { onShow(); groupPage = i; }
                            break;
                        }
                        cy -= groupPageHeights[static_cast<size_t>(i)];
                    }
                } else if (engine->input.consumeJustPressed(GK_DOWN)) {
                    children[static_cast<size_t>(focusedChild)]->dirty = true;
                    focusedChild = findNextFocusableChild(1);
                    auto* ch = children[static_cast<size_t>(focusedChild)].get();
                    ch->dirty = true;
                    int cy = ch->targetY;
                    for (int i = 0; i < 5; ++i) {
                        if (cy < groupPageHeights[static_cast<size_t>(i)]) {
                            if (groupPage != i) { onShow(); groupPage = i; }
                            break;
                        }
                        cy -= groupPageHeights[static_cast<size_t>(i)];
                    }
                }
            }
            if (fired) {
                engine->onPanelAction(this, focusedChild, "", 0);
                return;
            }
            for (size_t i = 0; i < children.size(); ++i) {
                children[i]->tick(allHighlight || static_cast<int>(i) == focusedChild);
            }
            dirty = true;
        } else if (panelType == 0) {
            dirty = true;
            if (engine->input.consumeJustPressed(GK_LEFT)) {
                radialRotOffset -= radialStepDeg;
                radialTargetRot += radialStepDeg;
                if (--selectedIdx < 0) selectedIdx = itemStep - 1;
            } else if (engine->input.consumeJustPressed(GK_RIGHT)) {
                radialRotOffset += radialStepDeg;
                radialTargetRot -= radialStepDeg;
                if (radialTargetRot < 0) radialTargetRot += 360;
                if (++selectedIdx >= itemStep) selectedIdx = 0;
            }
            if (radialRotOffset != 0) {
                int step = -radialRotOffset / 2;
                if (step == 0) radialRotOffset = 0;
                else radialRotOffset += step;
                if (radialRotOffset == 0) randomizeSparks();
            } else if (engine->input.isRepeat(GK_LEFT, platform::getUiTicksMs())) {
                radialRotOffset -= radialStepDeg;
                radialTargetRot += radialStepDeg;
                if (--selectedIdx < 0) selectedIdx = itemStep - 1;
            } else if (engine->input.isRepeat(GK_RIGHT, platform::getUiTicksMs())) {
                radialRotOffset += radialStepDeg;
                radialTargetRot -= radialStepDeg;
                if (radialTargetRot < 0) radialTargetRot += 360;
                if (++selectedIdx >= itemStep) selectedIdx = 0;
            }
            if (fired) {
                engine->onPanelAction(this, selectedIdx, items[static_cast<size_t>(selectedIdx)], 0);
                return;
            }
        } else if (panelType == 13 || panelType == 14) {
            if (engine->input.consumeJustPressed(GK_LEFT)) {
                if (--selectedIdx < 0) selectedIdx = itemStep - 1;
                if (panelType == 14) engine->onPanelAction(this, selectedIdx, "", 2);
                dirty = true;
            } else if (engine->input.consumeJustPressed(GK_RIGHT)) {
                if (++selectedIdx >= itemStep) selectedIdx = 0;
                if (panelType == 14) engine->onPanelAction(this, selectedIdx, "", 2);
                dirty = true;
            } else if (fired) {
                engine->onPanelAction(this, selectedIdx, items[static_cast<size_t>(selectedIdx)], 0);
                return;
            }
        } else if (panelType == 3) {
            if (scrollPixelOff != 0) {
                if (std::abs(scrollPixelOff) < 2) scrollPixelOff = 0;
                else scrollPixelOff -= scrollPixelOff / 2;
                dirty = true;
            }
            if (fired) {
                engine->onPanelAction(this, selectedIdx, "", 0);
                return;
            }
            if (engine->input.consumeJustPressed(GK_LEFT)) {
                if (selectedIdx < scrollIdx) selectedIdx += itemStep;
                if (--selectedIdx < scrollIdx) {
                    if (selectedIdx < 0) selectedIdx += itemStep;
                    scrollIdx = selectedIdx;
                    scrollPixelOff = -lineHeight;
                }
                selectedIdx %= itemStep;
                engine->onPanelAction(this, selectedIdx, "", 2);
                randomizeSparks();
                dirty = true;
            } else if (engine->input.consumeJustPressed(GK_RIGHT)) {
                if (selectedIdx < scrollIdx) selectedIdx += itemStep;
                if (++selectedIdx >= scrollIdx + visibleCount) {
                    scrollPixelOff = lineHeight;
                    scrollIdx = (scrollIdx + 1) % itemStep;
                }
                selectedIdx %= itemStep;
                engine->onPanelAction(this, selectedIdx, "", 3);
                randomizeSparks();
                dirty = true;
            }
        } else if (panelType == 8) {
            if (engine->input.consumeJustPressed(GK_UP) && mapOriginY > 0) { --mapOriginY; dirty = true; }
            else if (engine->input.consumeJustPressed(GK_DOWN) && mapOriginY + mapViewRows < mapRows) { ++mapOriginY; dirty = true; }
            if (engine->input.consumeJustPressed(GK_LEFT) && mapOriginX > 0) { --mapOriginX; dirty = true; }
            else if (engine->input.consumeJustPressed(GK_RIGHT) && mapOriginX + mapViewCols < mapCols) { ++mapOriginX; dirty = true; }
        } else if (panelType == 10 || panelType == 7 || panelType == 11) {
            if (autoCloseMs != -1) {
                if (autoCloseMs > 0) autoCloseMs -= 50;
                else engine->popPanel(backTarget);
            }
            if (scrollPixelOff > 0) {
                scrollPixelOff = std::max(0, scrollPixelOff - (lineHeight / 3 + 1));
                dirty = true;
            } else if (scrollPixelOff < 0) {
                scrollPixelOff = std::min(0, scrollPixelOff + lineHeight / 3 + 1);
                dirty = true;
            }
            if (scrollPixelOff == 0) {
                if ((panelType == 11 || panelType == 10) && fired) {
                    std::string sel = (selectedIdx >= 0 && selectedIdx < static_cast<int>(items.size())) ? items[static_cast<size_t>(selectedIdx)] : "";
                    engine->onPanelAction(this, selectedIdx, sel, 0);
                    return;
                }
                if (panelType != 7 && engine->input.consumeJustPressed(GK_UP)) {
                    if (panelType == 11) {
                        if (--selectedIdx < 0) {
                            selectedIdx = itemStep - 1;
                            scrollIdx = std::max(0, itemStep - visibleCount);
                        } else if (selectedIdx < scrollIdx) {
                            scrollPixelOff = -lineHeight;
                            --scrollIdx;
                        }
                        engine->onPanelAction(this, selectedIdx, "", 2);
                        dirty = true;
                    } else if (scrollIdx > 0) {
                        scrollPixelOff = -lineHeight;
                        --scrollIdx;
                        dirty = true;
                    }
                    engine->input.clearAll();
                }
                if (engine->input.consumeJustPressed(GK_DOWN) || (panelType == 7 && engine->input.consumeJustPressed(GK_RSK))) {
                    if (panelType == 11) {
                        if (++selectedIdx >= itemStep) {
                            selectedIdx = 0;
                            scrollIdx = 0;
                        } else if (selectedIdx >= scrollIdx + visibleCount) {
                            scrollPixelOff = lineHeight;
                            ++scrollIdx;
                        }
                        engine->onPanelAction(this, selectedIdx, "", 3);
                        dirty = true;
                    } else if (scrollIdx + visibleCount < itemStep) {
                        scrollPixelOff = lineHeight;
                        ++scrollIdx;
                        dirty = true;
                    } else if (panelType == 7) {
                        engine->onPanelAction(this, 0, "", 0);
                        return;
                    }
                    engine->input.clearAll();
                }
            }
        }

        if (state == 2 && softkeys[1] && engine->input.consumeJustPressed(GK_RSK)) {
            engine->input.clearKeyBit(GK_RSK);
            engine->input.clearAll();
            if (backTarget) engine->popPanel(backTarget);
            if (!items.empty() && selectedIdx >= 0 && selectedIdx < static_cast<int>(items.size())) {
                engine->onPanelAction(this, selectedIdx, items[static_cast<size_t>(selectedIdx)], 1);
            } else {
                engine->onPanelAction(this, -1, "", 1);
            }
            return;
        }
    }

    if (animateCursor && ++cursorTick >= cursorSpeed) {
        cursorFrame = (cursorFrame == 0) ? 2 : 0;
        cursorTick = 0;
        dirty = true;
    }

    if (state == 0) {
        if (panelType == 0) {
            if (radialCurRadius < radialRadius) {
                int step = (radialKind == 2) ? (radialRadius / 2) : (radialRadius / 5);
                if (step < 1) step = 1;
                radialCurRadius = std::min(radialRadius, radialCurRadius + step);
            } else {
                radialRotStep = std::clamp(std::abs(360 - radialAngles[0]) / 2, 1, radialBaseDeg);
            }
            if (radialKind == 1) {
                for (auto& ang : radialAngles) ang = static_cast<int16_t>((ang + radialRotStep) % 360);
            }
            if (engine->input.anyHeld() || (radialCurRadius >= radialRadius && radialAngles[0] == 0)) {
                radialCurRadius = radialRadius;
                for (int i = 0; i < itemStep; ++i) radialAngles[static_cast<size_t>(i)] = static_cast<int16_t>(radialStepDeg * i);
                state = 2;
                if (focusable) engine->input.clearAll();
            }
        } else if (panelType == 13) {
            curX += (targetX - curX) / 2;
            if (++radialDrawOff == 2) {
                state = 2;
                curX = targetX;
            }
        } else {
            int step = (targetX - curX) / 4;
            if (step <= 0) step = 1;
            curX += step;
            if (curX >= targetX) { curX = targetX; state = 2; }
        }
        dirty = true;
    } else if (state == 1) {
        state = 3;
    }
}

void Panel::fillRoundedRect(engine::GraphicsContext& g, int x, int y, int w, int h) {
    if (h <= 2) {
        g.fillRect(x, y, w, h);
    } else {
        g.fillRect(x, y + 1, w, h - 2);
        g.fillRect(x + 1, y, w - 2, h);
    }
}

void Panel::drawFramedBox(engine::GraphicsContext& g, int x, int y, int w, int h, int bMask) {
    drawFramedBoxGrad(g, x, y, w, h, bMask, 2370117, 2370117, 0, 0);
}

void Panel::drawFramedBoxGrad(engine::GraphicsContext& g, int x, int y, int w, int h, int bMask,
                              int bgCol, int gradCol, int fadeStep, int fadeMax) {
    Sprite* border = engine->borderSprite.get();
    g.setClip(x, y, w, h);
    g.setColor(bgCol);
    g.fillRect(x, y, w, h);
    if (gradCol != bgCol && fadeMax > 0) {
        int gh = h / 4;
        int gy = y + 5;
        for (int i = 0; i < gh; ++i) {
            int c = GameEngine::lerpColor(gradCol, bgCol, i, gh);
            g.setColor(GameEngine::lerpColor(c, bgCol, fadeStep, fadeMax));
            g.fillRect(x, gy++, w, 1);
        }
    }
    if (bMask != 15 && border) {
        bool hasL = (bMask & 4) == 0;
        bool hasR = (bMask & 8) == 0;
        bool hasT = (bMask & 1) == 0;
        bool hasB = (bMask & 2) == 0;
        int bw = std::max(1, border->frameW);
        int bh = std::max(1, border->frameH);
        int cols = w / bw - 2 + (w % bw != 0 ? 1 : 0) + (!hasL ? 1 : 0) + (!hasR ? 1 : 0);
        int rows = h / bh - 2 + (h % bh != 0 ? 1 : 0) + (!hasT ? 1 : 0) + (!hasB ? 1 : 0);

        int px = x + (hasL ? bw : 0);
        int botY = y + h - bh;
        for (int i = 0; i < cols; ++i) {
            if (hasT) border->drawFrame(g, 1, px, y, 0);
            if (hasB) border->drawFrame(g, 6, px, botY, 0);
            px += bw;
        }
        int py = y + (hasT ? bh : 0);
        int rightX = x + w - bw;
        for (int i = 0; i < rows; ++i) {
            if (hasL) border->drawFrame(g, 3, x, py, 0);
            if (hasR) border->drawFrame(g, 4, rightX, py, 0);
            py += bh;
        }
        if (hasL && hasT) border->drawFrame(g, 0, x, y, 0);
        if (hasR && hasT) border->drawFrame(g, 2, rightX, y, 0);
        if (hasL && hasB) border->drawFrame(g, 5, x, botY, 0);
        if (hasR && hasB) border->drawFrame(g, 7, rightX, botY, 0);
    }
}

void Panel::draw(engine::GraphicsContext& g, int offX, int offY, bool highlighted) {
    if (state == 3) return;
    dirty = false;
    if ((engine->activePanel == this && bgDirty) || panelType == 0) {
        engine->drawActiveScreenBackground(g);
    }
    bgDirty = false;
    g.setClip(0, 0, engine->screenW, engine->screenH);
    if (detailPanel) detailPanel->draw(g);

    int dx = curX + offX;
    int dy = curY + offY;
    if (panelType != 0 && panelType != 13) {
        drawFramedBoxGrad(g, dx, dy, width, height, borderMask, gradColor, bgColor, fadeTimer, 5);
        g.setClip(0, 0, engine->screenW, engine->screenH);
    }

    int innerW = width;
    int innerH = height;
    if ((borderMask & 1) == 0) { innerH -= 5; dy += 5; }
    if ((borderMask & 2) == 0) { innerH -= 5; }
    if ((borderMask & 4) == 0) { dx += 8; innerW -= 8; }
    if ((borderMask & 8) == 0) { innerW -= 8; }

    g.translate(dx, dy);
    g.setFontId(fontId);

    if (leftIcon.isValid() && (items.empty() || engine::GraphicsContext::stringWidth(fontId, items[0]) < innerW - leftIcon.w * 2)) {
        leftIcon.draw(g, 0, innerH / 2, engine::LEFT | engine::VCENTER);
    }
    if (highlighted) {
        g.setColor(5594742);
        fillRoundedRect(g, 0, 0, innerW, innerH);
    }

    if (panelType == 0) {
        g.setColor(16777215);
        int baseRot = radialTargetRot + radialRotOffset;
        int fH = engine::GraphicsContext::fontHeight(1);
        for (int i = itemStep - 1; i >= 0; --i) {
            int deg = (radialAngles[static_cast<size_t>(i)] + baseRot) % 360;
            if (deg < 0) deg += 360;
            int ix = radialOuterR + ((Trig::sin1024(deg) * radialCurRadius) >> 10);
            int iy = fH + radialOuterR + 2 - ((Trig::cos1024(deg) * radialCurRadius) >> 10);
            if (state == 2 && i == selectedIdx) {
                radialCircleProto->drawFrame(g, 1, ix, iy, engine::HCENTER | engine::VCENTER);
                if (radialRotOffset == 0) {
                    for (auto& sp : sparks) sp->draw(g, ix - iconHalf, iy - iconHalf);
                }
            } else {
                radialCircleProto->drawFrame(g, 0, ix, iy, engine::HCENTER | engine::VCENTER);
            }
            if (i < static_cast<int>(icons.size()) && icons[static_cast<size_t>(i)].isValid()) {
                icons[static_cast<size_t>(i)].draw(g, ix, iy, engine::HCENTER | engine::VCENTER);
            }
        }
        if (state == 2) {
            for (auto& sp : sparks) sp->draw(g, (width - iconSize) / 2, fH);
            g.setColor(1645370);
            if (radialKind == 2) {
                int bw = width;
                if (selectedIdx >= 0 && selectedIdx < static_cast<int>(items.size()) && !items[static_cast<size_t>(selectedIdx)].empty()) {
                    bw = std::max(bw, engine::GraphicsContext::stringWidth(1, items[static_cast<size_t>(selectedIdx)]) + 2);
                }
                fillRoundedRect(g, (width - bw) / 2, 1, bw, fH);
            } else {
                fillRoundedRect(g, 2 - targetX, 1, engine->screenW - 4, fH);
            }
            if (selectedIdx >= 0 && selectedIdx < static_cast<int>(items.size()) && !items[static_cast<size_t>(selectedIdx)].empty()) {
                g.setColor(16777215);
                SpriteFont::drawSystem(g, items[static_cast<size_t>(selectedIdx)], radialOuterR, (fontAscentDiff >> 1) + 1,
                                       engine::HCENTER | engine::TOP);
            }
        }
    } else if (panelType == 2 || panelType == 5) {
        g.setClip(0, 0, innerW, innerH);
        int pad = kPad2 / 2;
        if (engine->screenH <= 143) pad = 1;
        int charW = SpriteFont::stringWidth(0, "0");
        int cy = pad;
        Unit* u = (panelType == 5) ? infoUnit : ((selectedIdx >= 0 && selectedIdx < static_cast<int>(buyUnits.size())) ? buyUnits[static_cast<size_t>(selectedIdx)] : nullptr);
        if (u) {
            u->drawUnit(g, -u->x + pad, -u->y + cy);
            int midY = cy + u->frameH / 2;
            g.setFontId(1);
            g.setColor(textColor);
            SpriteFont::drawSystem(g, u->name, pad + u->frameW + pad, midY - engine::GraphicsContext::fontHeight(0) / 2, engine::LEFT | engine::TOP);
            std::string valStr = (panelType == 2) ? std::to_string(u->cost) : std::to_string(u->hp);
            if (panelType == 2) {
                engine->hudIcons2->drawFrame(g, 1, innerW - pad - SpriteFont::stringWidth(1, valStr), midY, engine::RIGHT | engine::VCENTER);
            }
            SpriteFont::draw(g, valStr, innerW - pad, midY, 1, engine::RIGHT | engine::VCENTER);
            cy += u->frameH + pad;
            g.setColor(textColor);
            g.drawLine(pad, cy, innerW - pad * 2, cy);
            cy += 1 + pad;
            if (panelType == 5) {
                int fH0 = engine::GraphicsContext::fontHeight(0);
                int barMid = cy + fH0 / 2;
                SpriteFont::drawSystem(g, Lang::get(97), pad, cy, engine::LEFT | engine::TOP);
                int bx = pad + engine::GraphicsContext::stringWidth(1, Lang::get(97)) + pad;
                int bw = innerW - bx - pad - engine->hudIcons->frameW - charW - pad;
                g.setColor(textColor);
                fillRoundedRect(g, bx, cy, bw, fH0);
                g.setColor(2370117);
                int expReq = std::max(1, u->getExpToNextLevel());
                int fillW = std::max(1, bw * u->expTotal / expReq);
                g.fillRect(bx + 1, cy + 1, std::min(bw - 2, fillW), fH0 - 2);
                int ex = innerW - pad - charW;
                engine->hudIcons->drawFrame(g, 2, ex, barMid, engine::RIGHT | engine::VCENTER);
                SpriteFont::draw(g, std::to_string(u->expTotal), ex, barMid, 0, engine::LEFT | engine::VCENTER);
                cy += fH0 + pad;
                g.setColor(textColor);
                g.drawLine(pad, cy, innerW - pad * 2, cy);
                cy += 1 + pad;
            }
            int cellW = (innerW - pad * 3) / 2;
            int iconH = engine->hudIcons->frameH;
            int circH = engine->smallCircleProto->frameH;
            int halfCirc = circH / 2;
            for (int r = 0; r < 2; ++r) {
                int boxY = cy + halfCirc - iconH / 2;
                int rx = pad;
                for (int c = 0; c < 2; ++c) {
                    if (r == 0 || c == 0) {
                        int boxX = rx + halfCirc;
                        fillRoundedRect(g, boxX, boxY, cellW - halfCirc, iconH);
                        engine->smallCircleProto->draw(g, rx, cy);
                        int statIdx = r * 2 + c;
                        if (statIdx == 0 || statIdx == 1) {
                            engine->hudIcons->drawFrame(g, statIdx, boxX, cy + halfCirc, engine::HCENTER | engine::VCENTER);
                        }
                        int mod = 0;
                        std::string statStr;
                        if (statIdx == 0) {
                            if (panelType == 5) mod = u->getAttackBonus(nullptr);
                            statStr = std::to_string(u->atkMin + mod) + "-" + std::to_string(u->atkMax + mod);
                        } else if (statIdx == 1) {
                            if (panelType == 5) mod = u->getDefenseBonus(nullptr);
                            statStr = std::to_string(u->defense + mod);
                        } else if (statIdx == 2) {
                            if (engine->actionIcons.size() > 5) engine->actionIcons[5].draw(g, boxX, cy + halfCirc, engine::HCENTER | engine::VCENTER);
                            statStr = std::to_string(Unit::sMoveRange[static_cast<size_t>(u->unitType)]);
                        }
                        SpriteFont::draw(g, statStr, rx + circH + 1, cy + halfCirc, 0, engine::LEFT | engine::VCENTER);
                        if (mod > 0) engine->arrowIcons->drawFrame(g, 1, boxX + cellW - halfCirc - 1, cy + halfCirc, engine::RIGHT | engine::VCENTER);
                        else if (mod < 0) engine->arrowIcons->drawFrame(g, 2, boxX + cellW - halfCirc - 1, cy + halfCirc, engine::RIGHT | engine::VCENTER);
                        rx += cellW + pad;
                    }
                }
                cy += circH;
            }
            cy += pad;
            g.setColor(textColor);
            g.drawLine(pad, cy, innerW - pad * 2, cy);
        }
    } else if (panelType == 3) {
        g.setClip(0, 0, innerW, innerH);
        int topY = (engine->screenH <= 143) ? 1 : 2;
        g.setColor(11515819);
        g.drawLine(topY, topY, innerW - topY * 2, topY);
        int midY = topY + 1 + topY + engine->bigCircleProto->frameH / 2;
        int sx = engine->sideArrowSprite->frameW + scrollPixelOff + centerPad;
        int startI = scrollIdx;
        int endI = scrollIdx + visibleCount;
        if (scrollPixelOff > 0) { --startI; sx -= lineHeight; }
        else if (scrollPixelOff < 0) { ++endI; }

        for (int i = startI; i < endI; ++i) {
            int idx = ((i % itemStep) + itemStep) % itemStep;
            int cx = sx + lineHeight / 2;
            engine->bigCircleProto->drawFrame(g, (idx == selectedIdx) ? 1 : 0, cx, midY, engine::HCENTER | engine::VCENTER);
            Unit* bu = buyUnits[static_cast<size_t>(idx)];
            bu->drawUnit(g, cx - bu->x - bu->frameW / 2, midY - bu->y - bu->frameH / 2,
                         bu->cost > engine->playerGold[engine->currentPlayer]);
            if (idx == selectedIdx) {
                int spX = cx - radialCircleProto->frameW / 2;
                int spY = midY - radialCircleProto->frameW / 2;
                for (auto& sp : sparks) sp->draw(g, spX, spY);
            }
            sx += lineHeight;
        }
        engine->sideArrowSprite->drawFrame(g, 0, 0, midY, engine::LEFT | engine::VCENTER);
        engine->sideArrowSprite->drawFrame(g, 1, innerW, midY, engine::RIGHT | engine::VCENTER);
    } else if (panelType == 7 || panelType == 10 || panelType == 11) {
        g.setFontId(1);
        if (portraitId != -1) {
            engine->portraitsSprite->drawFrame(g, portraitId, -8, innerH, engine::LEFT | engine::BOTTOM);
        }
        innerW -= portraitPad;
        g.setClip(0, 0, innerW, height - 10);
        int clipTop = 0;
        int py = 0;
        if (!titleLines.empty()) {
            g.setColor(GameEngine::lerpColor(16777215, gradColor, fadeTimer, 5));
            for (const auto& tl : titleLines) {
                SpriteFont::drawSystem(g, tl, portraitPad + innerW / 2, py + fontHalfDiff, engine::HCENTER | engine::TOP);
                py += lineHeight;
            }
            g.setColor(10463131);
            g.drawLine(0, py, innerW - 1, py);
            clipTop = py;
        }
        int listTop = py + centerPad;
        int startRow = scrollIdx;
        int endRow = scrollIdx + visibleCount;
        if (scrollPixelOff > 0) { --startRow; py -= lineHeight; }
        else if (scrollPixelOff < 0) { ++endRow; }
        py += scrollPixelOff + centerPad;
        g.setClip(portraitPad, clipTop, innerW, innerH - clipTop);
        int drawW = hasScrollBar ? (innerW - engine->smallArrowSprite->frameW) : innerW;
        int centerX = portraitPad + drawW / 2;
        for (int r = startRow; r < endRow; ++r) {
            if (r < 0 || r >= static_cast<int>(items.size())) { py += lineHeight; continue; }
            int clipAmt = 0;
            if (py < listTop) clipAmt = listTop - py;
            else if (py + lineHeight > innerH - centerPad) clipAmt = py + lineHeight - innerH + centerPad;
            int col = 0;
            if (panelType == 11 && r == selectedIdx) {
                g.setColor(5594742);
                fillRoundedRect(g, 0, py, drawW, lineHeight);
                col = GameEngine::lerpColor(gradColor, 16777215, lineHeight - clipAmt, lineHeight);
            } else {
                col = GameEngine::lerpColor(gradColor, textColor, lineHeight - clipAmt, lineHeight);
            }
            g.setColor(GameEngine::lerpColor(col, gradColor, fadeTimer, 5));
            if (leftTextPad >= 0) {
                SpriteFont::drawSystem(g, items[static_cast<size_t>(r)], leftTextPad, py + fontHalfDiff, engine::LEFT | engine::TOP);
            } else {
                SpriteFont::drawSystem(g, items[static_cast<size_t>(r)], centerX, py + fontHalfDiff, engine::HCENTER | engine::TOP);
            }
            py += lineHeight;
        }
        if (hasScrollBar) {
            int aw = engine->smallArrowSprite->frameW;
            int ah = engine->smallArrowSprite->frameH;
            int barW = aw / 2;
            int barH = innerH - ah * 2 - 2;
            int barX = innerW - (aw + barW) / 2;
            if (barH > 2 && itemStep > 0) {
                g.setColor(textColor);
                fillRoundedRect(g, barX, ah + 1, barW, barH);
                int thumbH = std::max(1, (barH - 2) * visibleCount / itemStep);
                g.setColor(2370117);
                fillRoundedRect(g, barX + 1, ah + (barH - 2) * scrollIdx / itemStep + 2, barW - 2, thumbH);
                engine->smallArrowSprite->drawFrame(g, 0, innerW - aw, 0, engine::LEFT | engine::TOP);
                engine->smallArrowSprite->drawFrame(g, 1, innerW - aw, innerH, engine::LEFT | engine::BOTTOM);
            } else {
                if (scrollIdx > 0) engine->smallArrowSprite->drawFrame(g, 0, innerW - aw, 0, engine::LEFT | engine::TOP);
                if (scrollIdx + visibleCount < itemStep) engine->smallArrowSprite->drawFrame(g, 1, innerW - aw, innerH, engine::LEFT | engine::BOTTOM);
            }
        }
        if (panelType == 7) {
            g.setClip(0, 0, engine->screenW, engine->screenH);
            int ay = innerH + ((borderMask & 2) == 0 ? 5 : 0);
            engine->smallArrowSprite->drawFrame(g, 1, innerW + portraitPad, ay, engine::RIGHT | engine::BOTTOM);
        }
    } else if (panelType == 8 && !engine->miniIcons.empty()) {
        drawFramedBox(g, 0, 0, width, height, 15);
        int mw = engine->miniIcons[0].w;
        int mh = engine->miniIcons[0].h;
        int endC = mapOriginX + mapViewCols;
        int endR = mapOriginY + mapViewRows;
        int py = 4;
        for (int r = mapOriginY; r < endR; ++r) {
            int px = 4;
            for (int c = mapOriginX; c < endC; ++c) {
                int tid = minimapTiles[static_cast<size_t>(c)][static_cast<size_t>(r)];
                int mIdx = engine->tileTerrain[tid];
                if (tid >= engine->castleTileStart) {
                    int bIdx = (tid - engine->castleTileStart) / 2;
                    mIdx = 2 * bIdx + 8 + mIdx - 8;
                }
                if (mIdx >= 0 && mIdx < static_cast<int>(engine->miniIcons.size())) {
                    engine->miniIcons[static_cast<size_t>(mIdx)].draw(g, px, py);
                }
                px += mw;
            }
            py += mh;
        }
        if (minimapShowUnits && cursorFrame == 0) {
            int ox = -mapOriginX * mw + 4;
            int oy = -mapOriginY * mh + 4;
            for (const auto& u : engine->units) {
                if (u->gridX >= mapOriginX && u->gridX < endC && u->gridY >= mapOriginY && u->gridY < endR) {
                    engine->unitIcons->drawFrame(g, engine->playerTeam[u->player] - 1, u->gridX * mw + ox, u->gridY * mh + oy, 0);
                }
            }
        }
        if (cursorFrame == 0) {
            if (mapOriginY > 0) engine->smallArrowSprite->drawFrame(g, 0, innerW / 2, 0, engine::HCENTER | engine::TOP);
            if (endR < mapRows) engine->smallArrowSprite->drawFrame(g, 1, innerW / 2, innerH, engine::HCENTER | engine::BOTTOM);
            if (mapOriginX > 0) engine->sideArrowSprite->drawFrame(g, 0, 0, innerH / 2, engine::LEFT | engine::VCENTER);
            if (endC < mapCols) engine->sideArrowSprite->drawFrame(g, 1, innerW, innerH / 2, engine::RIGHT | engine::VCENTER);
        }
    } else if (panelType == 13) {
        int fH = engine::GraphicsContext::fontHeight(1);
        int barY = (height - fH) / 2;
        g.setColor(GameEngine::lerpColor(1645370, 16777215, fadeTimer, 5));
        fillRoundedRect(g, 0, barY, width, fH);
        g.setFontId(1);
        g.setColor(16777215);
        if (selectedIdx >= 0 && selectedIdx < static_cast<int>(items.size())) {
            SpriteFont::drawSystem(g, items[static_cast<size_t>(selectedIdx)], 16, barY + fontHalfDiff, engine::LEFT | engine::TOP);
        }
        int ix = width - lineHeight;
        for (int i = itemStep - 1; i >= 0; --i) {
            engine->smallCircleProto->drawFrame(g, (i == selectedIdx) ? 1 : 0, ix, 0, engine::LEFT | engine::TOP);
            if (i < static_cast<int>(icons.size())) {
                icons[static_cast<size_t>(i)].draw(g, ix + engine->smallCircleProto->frameW / 2, height / 2, engine::HCENTER | engine::VCENTER);
            }
            ix -= lineHeight;
        }
    } else if (panelType == 14) {
        g.setFontId(1);
        g.setColor(GameEngine::lerpColor(16777215, 1645370, fadeTimer, 5));
        int midY = innerH / 2;
        if (selectedIdx >= 0 && selectedIdx < static_cast<int>(items.size())) {
            SpriteFont::drawSystem(g, items[static_cast<size_t>(selectedIdx)], innerW / 2, (innerH - engine::GraphicsContext::fontHeight(0)) / 2, engine::HCENTER | engine::TOP);
        }
        engine->sideArrowSprite->drawFrame(g, 0, 0, midY, engine::LEFT | engine::VCENTER);
        engine->sideArrowSprite->drawFrame(g, 1, innerW, midY, engine::RIGHT | engine::VCENTER);
    } else if (panelType == 15) {
        int pageStart = 0;
        int yOff = 0;
        int pageEnd = groupPageHeights.empty() ? height : groupPageHeights[0];
        for (int i = 1; i <= groupPage && i < static_cast<int>(groupPageHeights.size()); ++i) {
            pageStart = pageEnd;
            pageEnd += groupPageHeights[static_cast<size_t>(i)];
        }
        if (groupPage > 0) yOff = -pageStart + engine->smallArrowSprite->frameH;
        for (size_t i = 0; i < children.size(); ++i) {
            auto& ch = children[i];
            if (ch->targetY >= pageStart && ch->targetY < pageEnd) {
                ch->draw(g, 0, yOff, static_cast<int>(i) == focusedChild);
            }
        }
        g.setClip(0, 0, engine->screenW, engine->screenH);
        if (groupPage > 0) {
            g.setColor(2370117);
            g.fillRect(0, 0, engine->screenW, engine->smallArrowSprite->frameH);
            engine->smallArrowSprite->drawFrame(g, 0, engine->screenW / 2, -cursorFrame, engine::HCENTER | engine::TOP);
        }
        if (groupPage < groupMaxPage && groupPage < static_cast<int>(groupPageHeights.size())) {
            g.setColor(2370117);
            int botY = groupPageHeights[static_cast<size_t>(groupPage)];
            if (groupPage > 0) botY += engine->smallArrowSprite->frameH;
            g.fillRect(0, botY, engine->screenW, engine->gamePanelHeight - botY);
            engine->smallArrowSprite->drawFrame(g, 1, engine->screenW / 2, engine->gamePanelHeight + cursorFrame, engine::HCENTER | engine::BOTTOM);
        }
    }

    g.translate(-dx, -dy);
    g.setClip(0, 0, engine->screenW, engine->screenH);
    if (engine->activePanel == this && state == 2) {
        if (softkeys[0]) engine->drawSoftkeyLabel(g, GK_LSK, 0, engine->gamePanelHeight);
        if (softkeys[1]) engine->drawSoftkeyLabel(g, GK_RSK, 1, engine->gamePanelHeight);
    }
}

} // namespace game
