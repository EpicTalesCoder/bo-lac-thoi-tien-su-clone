#include "engine/UIEngine.hpp"
#include "engine/BitmapFont.hpp"
#include "engine/ScreenBase.hpp"
#include "platform/Platform.hpp"

#include <algorithm>
#include <cstdlib>
#include <limits>

namespace engine {

void UISpriteIcon::load(int sprId, bool longStride, int8_t nextAnim) {
    if (sprId == -1) return;
    hasSpr_ = spr_.load(sprId, longStride);
    if (drawMode == 3) {
        spr_.setAnim(static_cast<int8_t>(index), nextAnim, true);
    }
}

void UISpriteIcon::setAnim(int8_t anim, int8_t nextAnim) {
    index = anim;
    if (hasSpr_) spr_.setAnim(anim, nextAnim, true);
}

void UISpriteIcon::tick() {
    if (hasSpr_ && drawMode == 3) spr_.tick();
}

void UISpriteIcon::draw(GraphicsContext& g, const UIBox& box, int align) {
    if (!hasSpr_ || index == -1) return;
    std::array<int, 4> rect{};
    bool ok = false;
    if (drawMode == 2) ok = spr_.getFrameBounds(index, 0, rect);
    else if (drawMode == 3) ok = spr_.getAnimBounds(index, 0, rect);
    if (!ok) return;

    int dx = box.x - rect[0];
    int dy = box.y - rect[1];
    switch (align) {
        case 0: dx = box.x - rect[0]; dy = box.y - rect[1]; break;
        case 1: dx = box.x + (box.w - rect[2]) / 2 - rect[0]; dy = box.y - rect[1]; break;
        case 2: dx = box.x + (box.w - rect[2]) - rect[0]; dy = box.y - rect[1]; break;
        case 3: dx = box.x - rect[0]; dy = box.y + (box.h - rect[3]) / 2 - rect[1]; break;
        case 4: dx = box.x + (box.w - rect[2]) / 2 - rect[0]; dy = box.y + (box.h - rect[3]) / 2 - rect[1]; break;
        case 5: dx = box.x + (box.w - rect[2]) - rect[0]; dy = box.y + (box.h - rect[3]) / 2 - rect[1]; break;
        case 6: dx = box.x - rect[0]; dy = box.y + (box.h - rect[3]) - rect[1]; break;
        case 7: dx = box.x + (box.w - rect[2]) / 2 - rect[0]; dy = box.y + (box.h - rect[3]) - rect[1]; break;
        case 8: dx = box.x + (box.w - rect[2]) - rect[0]; dy = box.y + (box.h - rect[3]) - rect[1]; break;
        default: break;
    }

    if (drawMode == 3) spr_.drawCurrent(g, dx, dy, flipMode);
    else if (drawMode == 2) spr_.drawFrame(g, index, dx, dy, 0, TOP | LEFT);
}

void UISpriteIcon::release() {
    if (hasSpr_) {
        spr_.freeAll();
        hasSpr_ = false;
    }
}

void UIStyle::resetScroll() {
    scrollState[1] = 0;
    scrollState[0] = 0;
    scrollFlags[0] = scrollFlags[1] = false;
    scrollTiming.reset();
}

void UIStyle::draw(GraphicsContext& g, int x, int y, int w, int h, bool focused, int8_t /*padA*/, int8_t /*padB*/) {
    UIBox box{x, y, w, h};
    lastBox = box;
    g.setClip(-g.getTranslateX(), -g.getTranslateY(), AppContext::screenWidth(), AppContext::screenHeight());

    int bg = focused ? focusBgColor : unfocusBgColor;
    int border = focused ? focusBorderColor : unfocusBorderColor;
    int txtCol = focused ? focusTextColor : unfocusTextColor;
    UISpriteIcon* ic = focused ? focusIcon.get() : unfocusIcon.get();

    if ((bg >> 24) != 0) {
        g.setColor(bg);
        g.fillRect(x, y, w, h);
    }
    if ((border >> 24) != 0) {
        g.setColor(border);
        g.drawRect(x, y, w, h);
    }
    if (ic) ic->draw(g, box, iconAlign);

    if ((txtCol >> 24) != 0 && !text.empty()) {
        if (text.size() > 2 && text[0] == u'#' && text[1] == u'P') {
            std::string numStr = platform::u16ToUtf8(text.substr(2));
            char* endp = nullptr;
            long pct = std::strtol(numStr.c_str(), &endp, 10);
            if (endp != numStr.c_str() && pct >= 0 && pct <= 100) {
                int fw = static_cast<int>(pct * w / 100);
                g.setColor(txtCol);
                g.fillRect(x + 1, y + 1, std::max(0, fw - 1), std::max(0, h - 1));
                return;
            }
        }
        if (prevText != text || (!prevFocused && focused)) {
            resetScroll();
            prevText = text;
        }
        prevFocused = focused;
        const int drawX = hasTextBounds ? (x + textDx) : x;
        const int drawW = hasTextBounds ? textW : w;
        const int effAlign = (textAlignOverride >= 0) ? textAlignOverride : align;
        const bool effWrap = wrap || textAutoWrap;

        // Tall single-line tabs/softkeys promoted to auto-wrap center cleanly when all wrapped lines fit vertically.
        if (!wrap && textAutoWrap && (effAlign == 1 || effAlign == 4 || effAlign == 7) &&
            text.find(u'#') == std::u16string::npos) {
            const auto lines = BitmapFont::wrapLines(text, drawW);
            const int fh = BitmapFont::height();
            const int totalH = static_cast<int>(lines.size()) * (fh + 1) - 1;
            if (!lines.empty() && totalH <= h + 1) {
                const int startY = y + std::max(0, (h - totalH) / 2);
                const int cx = drawX + drawW / 2;
                int ox = g.getClipX(), oy = g.getClipY(), ow = g.getClipWidth(), oh = g.getClipHeight();
                g.setClip(drawX, y, drawW, h);
                g.setColor(txtCol);
                for (size_t r = 0; r < lines.size(); ++r) {
                    BitmapFont::drawAnchored(g, lines[r], cx, startY + static_cast<int>(r) * (fh + 1), HCENTER | TOP);
                }
                g.setClip(ox, oy, ow, oh);
                scrollFlags[0] = scrollFlags[1] = true;
                return;
            }
        }

        // Scroll whenever multi-line wrapped OR single-line text exceeds drawW beyond 1px trailing glyph pad
        const int plainW = effWrap ? 0 : AppContext::measureRichTextWidth(text);
        const int effScroll = (effWrap || plainW > drawW + 1) ? scrollStep : 0;
        AppContext::drawRichText(g, text, txtCol, drawX, y, 8, drawW, h, effWrap, effAlign, effScroll, scrollState, scrollFlags, &scrollTiming);
    }
}

UIWidget* findWidgetById(UIWidget* root, int targetId) {
    if (!root) return nullptr;
    if (root->id() == targetId) return root;
    if (root->kind() == 0) {
        for (auto& ch : root->children()) {
            if (!ch) continue;
            if (ch->kind() == 0) {
                if (UIWidget* r = findWidgetById(ch.get(), targetId)) return r;
            } else if (ch->id() == targetId) {
                return ch.get();
            }
        }
    }
    return nullptr;
}

void shiftWidgetTree(UIWidget* w, int dx, int dy, UIWidget* root) {
    if (!w) return;
    w->setX(w->x() + dx, root);
    w->setY(w->y() + dy, root);
    if (w->kind() == 0) {
        for (auto& ch : w->children()) {
            if (ch) shiftWidgetTree(ch.get(), dx, dy, root);
        }
    }
}

UIListNav::UIListNav(int navKind) : kind(navKind) {
    slotIds.assign(50, -1);
}

void UIListNav::setMode(int mode) {
    layoutMode_ = (mode == 1 || mode == -1) ? mode : -1;
}

void UIListNav::stepNext(int delta, UIWidget* /*root*/) {
    if (totalCount <= 1) { cursor = 0; scrollTop = 0; return; }
    if (loop) {
        if (modeH == 0) {
            cursor += delta;
            if (cursor >= totalCount) {
                cursor %= totalCount;
                if (cursor >= scrollTop + visibleCount || cursor < scrollTop) scrollTop = cursor;
            } else if (cursor >= scrollTop + visibleCount) {
                scrollTop += delta;
                if (scrollTop + visibleCount >= totalCount) scrollTop = totalCount - visibleCount;
            }
        } else if (modeH == 1) {
            cursor = (cursor + delta) % totalCount;
            scrollTop = (cursor - centerOffset < 0) ? (totalCount + (cursor - centerOffset)) : (cursor - centerOffset);
        }
    } else {
        cursor += delta;
        if (cursor >= totalCount) {
            cursor = totalCount - 1;
            if (totalCount >= visibleCount) scrollTop = totalCount - visibleCount;
        } else if (cursor >= scrollTop + visibleCount) {
            scrollTop += delta;
        }
    }
}

void UIListNav::stepPrev(int delta, UIWidget* /*root*/) {
    if (totalCount <= 1) { cursor = 0; scrollTop = 0; return; }
    if (loop) {
        if (modeH == 0) {
            cursor -= delta;
            if (cursor < 0) {
                cursor = totalCount + (cursor % totalCount);
                if (cursor >= scrollTop + visibleCount || cursor < scrollTop) {
                    scrollTop = totalCount - visibleCount - (totalCount - cursor - 1);
                }
            } else if (cursor < scrollTop) {
                scrollTop = cursor;
            }
        } else if (modeH == 1) {
            cursor -= delta;
            if (cursor < 0) cursor = totalCount + (cursor % totalCount);
            scrollTop = (cursor - centerOffset < 0) ? (totalCount + (cursor - centerOffset)) : (cursor - centerOffset);
        }
    } else {
        cursor -= delta;
        if (cursor < 0) {
            cursor = 0;
            scrollTop = 0;
        } else if (cursor < scrollTop) {
            scrollTop -= delta;
        }
    }
}

void UIListNav::ensureBoxes(UIWidget* root) {
    if (!boxesInit_) {
        slotBoxes_.resize(20);
        for (int i = 0; i < visibleCount && i < 20; ++i) {
            if (UIWidget* w = findWidgetById(root, slotIds[i])) {
                slotBoxes_[i] = {w->x(), w->y(), w->w(), w->h()};
            }
        }
        boxesInit_ = true;
    }
}

void UIListNav::drawItem(GraphicsContext& g, int widgetId, bool panelFocused, const std::vector<int>& focusPath, bool animActive, UIWidget* root) {
    ensureBoxes(root);
    int slotIdx = -1;
    for (int i = 0; i < static_cast<int>(slotIds.size()) && slotIds[i] != -1; ++i) {
        if (slotIds[i] == widgetId) { slotIdx = i; break; }
    }
    std::vector<int> visSlots(50, -1);
    if (layoutMode_ == 1) {
        for (int i = 0; i < visibleCount; ++i) visSlots[i] = i;
    } else if (layoutMode_ == -1) {
        for (int i = 0; i < visibleCount; ++i) visSlots[i] = (scrollTop + i) % static_cast<int>(slotIds.size());
    }
    for (int i = 0; i < 50 && visSlots[i] != -1; ++i) {
        if (slotIdx == visSlots[i]) {
            UIWidget* w = findWidgetById(root, widgetId);
            if (!w) continue;
            int dx = w->x() - slotBoxes_[i].x;
            int dy = w->y() - slotBoxes_[i].y;
            int ow = w->w(), oh = w->h();
            shiftWidgetTree(w, -dx, -dy, root);
            w->setW(slotBoxes_[i].w, root);
            w->setH(slotBoxes_[i].h, root);
            bool itemFocus = false;
            if (panelFocused && totalCount > 0) {
                itemFocus = (layoutMode_ == 1) ? (cursor == (scrollTop + visSlots[i]) % totalCount) : (cursor == visSlots[i]);
            }
            w->draw(g, itemFocus, animActive, root, focusPath);
            shiftWidgetTree(w, dx, dy, root);
            w->setW(ow, root);
            w->setH(oh, root);
        }
    }
}

void UIListNav::tickItem(int widgetId, const std::vector<int>& focusPath, bool animActive, UIWidget* root) {
    ensureBoxes(root);
    int slotIdx = -1;
    for (int i = 0; i < static_cast<int>(slotIds.size()) && slotIds[i] != -1; ++i) {
        if (slotIds[i] == widgetId) { slotIdx = i; break; }
    }
    std::vector<int> visSlots(50, -1);
    if (layoutMode_ == 1) {
        for (int i = 0; i < visibleCount; ++i) visSlots[i] = i;
    } else if (layoutMode_ == -1) {
        for (int i = 0; i < visibleCount; ++i) visSlots[i] = (scrollTop + i) % static_cast<int>(slotIds.size());
    }
    for (int i = 0; i < 50 && visSlots[i] != -1; ++i) {
        if (slotIdx == visSlots[i]) {
            UIWidget* w = findWidgetById(root, widgetId);
            if (!w) continue;
            int dx = w->x() - slotBoxes_[i].x;
            int dy = w->y() - slotBoxes_[i].y;
            int ow = w->w(), oh = w->h();
            shiftWidgetTree(w, -dx, -dy, root);
            w->setW(slotBoxes_[i].w, root);
            w->setH(slotBoxes_[i].h, root);
            bool panelFocused = !focusPath.empty() && focusPath.back() == w->parentId();
            bool itemFocus = false;
            if (panelFocused && totalCount > 0) {
                itemFocus = (layoutMode_ == 1) ? (cursor == (scrollTop + visSlots[i]) % totalCount) : (cursor == visSlots[i]);
            }
            w->tick(itemFocus, animActive, root, focusPath);
            shiftWidgetTree(w, dx, dy, root);
            w->setW(ow, root);
            w->setH(oh, root);
        }
    }
}

UIPanel::UIPanel() {
    children_.reserve(60);
}

void UIPanel::layout(UIWidget* root) {
    if (!root) return;
    for (auto& ch : children_) {
        if (ch) ch->layout(root);
    }
}

void UIPanel::draw(GraphicsContext& g, bool focused, bool animActive, UIWidget* root, const std::vector<int>& focusPath) {
    if (!visible_) return;
    for (auto& ch : children_) {
        if (!ch) continue;
        if (ch->listNav()) {
            bool panelFocused = !focusPath.empty() && focusPath.back() == id_;
            ch->listNav()->drawItem(g, ch->id(), panelFocused, focusPath, animActive, root);
        } else {
            ch->draw(g, focused, animActive, root, focusPath);
        }
    }
}

void UIPanel::tick(bool flagA, bool animActive, UIWidget* root, const std::vector<int>& focusPath) {
    for (auto& ch : children_) {
        if (!ch) continue;
        if (ch->listNav()) {
            ch->listNav()->tickItem(ch->id(), focusPath, animActive, root);
        } else {
            ch->tick(flagA, animActive, root, focusPath);
        }
    }
}

void UILabel::draw(GraphicsContext& g, bool focused, bool /*animActive*/, UIWidget* /*root*/, const std::vector<int>& /*focusPath*/) {
    if (!visible_) return;
    style_.draw(g, x_, y_, w_, h_, focused, padA, padB);
}

void UILabel::tick(bool flagA, bool /*animActive*/, UIWidget* /*root*/, const std::vector<int>& /*focusPath*/) {
    if (flagA) {
        if (style_.focusIcon) style_.focusIcon->tick();
    } else {
        if (style_.unfocusIcon) style_.unfocusIcon->tick();
    }
}

int UIGrid::w() const {
    return (visCols > 0 && visCols <= cols) ? (cellW + gapX) * visCols + gapX : (cellW + gapX) * cols + gapX;
}

int UIGrid::h() const {
    return (visRows > 0 && visRows <= rows) ? (cellH + gapY) * visRows + gapY : (cellH + gapY) * rows + gapY;
}

void UIGrid::initEmptyCells(int c, int r) {
    cells.resize(static_cast<size_t>(c) * r);
}

void UIGrid::initAutoCells() {
    int total = cols * rows;
    cells.resize(total);
    for (int i = 0; i < total; ++i) {
        cells[i].active = 1;
        cells[i].up = i - cols;
        cells[i].down = i + cols;
        cells[i].left = i - 1;
        cells[i].right = i + 1;
    }
    for (int r = 0; r < rows; ++r) {
        int leftIdx = -1, rightIdx = -1;
        bool hasL = false, hasR = false;
        for (int c = 0; c < cols; ++c) {
            if (!hasL && cells[r * cols + c].active == 1) { hasL = true; leftIdx = r * cols + c; }
            if (!hasR && cells[(r + 1) * cols - c - 1].active == 1) { hasR = true; rightIdx = (r + 1) * cols - c - 1; }
        }
        if (hasL) {
            if (wrapH == 0) {
                cells[leftIdx].left = leftIdx;
                cells[rightIdx].right = rightIdx;
            } else {
                int nl = -1;
                for (int k = 0; k < total; ++k) {
                    int idx = (leftIdx - k - 1 + total) % total;
                    if (cells[idx].active == 1) { nl = idx; break; }
                }
                cells[leftIdx].left = nl;
                int nr = -1;
                for (int k = 0; k < total; ++k) {
                    int idx = (rightIdx + k + 1) % total;
                    if (cells[idx].active == 1) { nr = idx; break; }
                }
                cells[rightIdx].right = nr;
            }
        }
    }
    for (int c = 0; c < cols; ++c) {
        int topIdx = -1, botIdx = -1;
        bool hasT = false, hasB = false;
        for (int r = 0; r < rows; ++r) {
            if (!hasT && cells[c + cols * r].active == 1) { hasT = true; topIdx = c + cols * r; }
            if (!hasB && cells[c + cols * (rows - r - 1)].active == 1) { hasB = true; botIdx = c + cols * (rows - r - 1); }
        }
        if (hasT) {
            if (wrapV == 0) {
                cells[topIdx].up = topIdx;
                cells[botIdx].down = botIdx;
            } else {
                int nt = -1;
                for (int r = 0; r < rows; ++r) {
                    int row = (topIdx / cols - 1 - r + rows) % rows;
                    if (cells[row * cols + (topIdx % cols)].active == 1) { nt = row * cols + (topIdx % cols); break; }
                }
                cells[topIdx].up = nt;
                int nb = -1;
                for (int r = 0; r < rows; ++r) {
                    int row = (botIdx / cols + 1 + r) % rows;
                    if (cells[row * cols + (botIdx % cols)].active == 1) { nb = row * cols + (botIdx % cols); break; }
                }
                cells[botIdx].down = nb;
            }
        }
    }
}

bool UIGrid::moveCursor(int8_t dir) {
    if (cells.empty() || selected < 0 || selected >= static_cast<int>(cells.size())) return false;
    int nxt = selected;
    bool moved = false;
    if (dir == 0 && cells[selected].active == 1 && nxt != cells[selected].up) { nxt = cells[selected].up; moved = true; }
    else if (dir == 1 && cells[selected].active == 1 && nxt != cells[selected].down) { nxt = cells[selected].down; moved = true; }
    else if (dir == 2 && cells[selected].active == 1 && nxt != cells[selected].left) { nxt = cells[selected].left; moved = true; }
    else if (dir == 3 && cells[selected].active == 1 && nxt != cells[selected].right) { nxt = cells[selected].right; moved = true; }
    setCursor(nxt);
    return moved;
}

void UIGrid::setCursor(int idx) {
    if (idx < -1 || idx >= static_cast<int>(cells.size())) return;
    selected = idx;
    if (cols <= 0 || idx < 0) return;
    int row = selected / cols;
    if (pageV == 1) scrollRow = (row / std::max(1, visRows)) * std::max(1, visRows);
    else if (row < scrollRow) scrollRow = row;
    else if (row > scrollRow + visRows - 1) scrollRow = row - visRows + 1;

    int col = selected % cols;
    if (pageH == 1) scrollCol = (col / std::max(1, visCols)) * std::max(1, visCols);
    else if (col < scrollCol) scrollCol = col;
    else if (col > scrollCol + visCols - 1) scrollCol = col - visCols + 1;
}

void UIGrid::draw(GraphicsContext& g, bool /*focused*/, bool /*animActive*/, UIWidget* /*root*/, const std::vector<int>& /*focusPath*/) {
    if (!visible_) return;
    g.setColor(bgColor);
    g.fillRect(x_, y_, w(), h());
    if (bgIcon) bgIcon->draw(g, {x_, y_, w(), h()}, 0);
    int endR = scrollRow + visRows - 1;
    int endC = scrollCol + visCols - 1;
    for (int r = scrollRow; r <= endR; ++r) {
        for (int c = scrollCol; c <= endC; ++c) {
            int idx = r * cols + c;
            if (idx >= 0 && idx < static_cast<int>(cells.size()) && cells[idx].icon) {
                UIBox cb{x_ + gapX + (c - scrollCol) * (gapX + cellW), y_ + gapY + (r - scrollRow) * (gapY + cellH), cellW, cellH};
                cells[idx].icon->draw(g, cb, 0);
            }
        }
    }
    if (cursorVisible && cursorIcon && cols > 0) {
        UIBox cb{x_ + gapX + ((selected % cols) - scrollCol) * (gapX + cellW) + curOffX,
                 y_ + gapY + ((selected / cols) - scrollRow) * (gapY + cellH) + curOffY,
                 w(), h()};
        cursorIcon->draw(g, cb, 0);
    }
}

void UIGrid::tick(bool /*flagA*/, bool /*animActive*/, UIWidget* /*root*/, const std::vector<int>& /*focusPath*/) {
    if (bgIcon) bgIcon->tick();
    for (auto& c : cells) if (c.icon) c.icon->tick();
    if (cursorVisible && cursorIcon) cursorIcon->tick();
}

void UIScreen::load(const std::string& path, int sprMode) {
    std::vector<uint8_t> raw;
    if (!platform::readRomfsFile(path, raw)) return;
    ByteReader r(raw);

    root_ = std::make_unique<UIPanel>();
    r.readShort();
    r.readShort();
    root_->setId(0);
    root_->setParentId(-1);
    r.readByte(); // type
    root_->setId(r.readShort());
    root_->setX(r.readShort(), root_.get());
    root_->setY(r.readShort(), root_.get());
    root_->setW(r.readShort(), root_.get());
    root_->setH(r.readShort(), root_.get());
    parsePanel(r, root_.get(), sprMode);
    optimizeVietnameseLayout(root_.get());
    focusIndexPath_.clear();
    rebuildFocusIdPath();
}

namespace {

bool uiBoxesOverlapY(const UIWidget* a, const UIWidget* b) {
    return !(a->y() >= b->y() + b->h() || a->y() + a->h() <= b->y());
}

bool uiBoxesOverlapX(const UIWidget* a, const UIWidget* b) {
    return !(a->x() >= b->x() + b->w() || a->x() + a->w() <= b->x());
}

bool isExpandableTextLabel(const UIWidget* w) {
    if (!w || w->kind() != 1) return false;
    const UIStyle* st = const_cast<UIWidget*>(w)->style();
    if (!st || st->wrap) return false;
    if ((static_cast<unsigned>(st->unfocusBgColor) >> 24) != 0) return false;
    if ((static_cast<unsigned>(st->focusBgColor) >> 24) != 0) return false;
    if ((static_cast<unsigned>(st->unfocusBorderColor) >> 24) != 0) return false;
    if ((static_cast<unsigned>(st->focusBorderColor) >> 24) != 0) return false;
    if (w->h() < BitmapFont::height()) return false;
    if (st->text.rfind(u"#P", 0) == 0) return false;
    if (st->text.empty() && (st->unfocusIcon || st->focusIcon) && w->w() <= 15 && w->h() <= 15) {
        return false;
    }
    return true;
}

} // namespace

void UIScreen::optimizeVietnameseLayout(UIPanel* panel) {
    if (!panel) return;
    auto& ch = panel->children();
    for (auto& c : ch) {
        if (c && c->kind() == 0) {
            optimizeVietnameseLayout(static_cast<UIPanel*>(c.get()));
        }
    }

    // Trim trailing ASCII padding spaces left behind by fixed-width J2ME translations ("HP  ", "DEF  ").
    for (auto& c : ch) {
        if (!c || c->kind() != 1) continue;
        UIStyle* st = c->style();
        if (!st || st->text.empty()) continue;
        if (st->text.find_first_not_of(u' ') == std::u16string::npos) continue;
        while (!st->text.empty() && st->text.back() == u' ') {
            st->text.pop_back();
        }
    }

    const int fh = BitmapFont::height();
    for (size_t i = 0; i < ch.size(); ++i) {
        UIWidget* a = ch[i].get();
        if (!isExpandableTextLabel(a)) continue;
        UIStyle* st = a->style();
        const int ax = a->x();
        const int aw = a->w();
        const int ah = a->h();
        const int strW = st->text.empty() ? 0 : AppContext::measureRichTextWidth(st->text);

        // 1. Identify tightest enclosing panel/tab/row sprite containing this label (clamped to standard canvas unless already outside).
        const int canvasMinL = std::min(0, ax);
        const int canvasMaxR = std::max(320, ax + aw);
        int contL = canvasMinL;
        int contR = canvasMaxR;
        int contW = contR - contL;
        int bestArea = std::numeric_limits<int>::max();
        bool hasTightContainer = false;
        for (size_t j = 0; j < ch.size(); ++j) {
            if (i == j || !ch[j]) continue;
            UIWidget* b = ch[j].get();
            if (!uiBoxesOverlapY(a, b)) continue;
            if (b->y() <= a->y() + 2 && b->y() + b->h() >= a->y() + ah - 2 &&
                b->x() <= ax + 2 && b->x() + b->w() >= ax + aw - 2) {
                UIStyle* bst = b->style();
                const bool bOpaque = bst && (((static_cast<unsigned>(bst->unfocusBgColor) >> 24) != 0) ||
                                             ((static_cast<unsigned>(bst->focusBgColor) >> 24) != 0) ||
                                             ((static_cast<unsigned>(bst->unfocusBorderColor) >> 24) != 0) ||
                                             ((static_cast<unsigned>(bst->focusBorderColor) >> 24) != 0));
                // Skip 2px-larger decorative button icon badges (e.g. 26px icon under 24px label in battle.ui)
                if (!bOpaque && b->w() <= 28 && b->w() - aw <= 3) continue;
                if (b->w() > aw + 2 || b->h() > ah + 2 || bOpaque) {
                    const int cl = std::max(canvasMinL, b->x());
                    const int cr = std::min(canvasMaxR, b->x() + b->w());
                    const int cw = std::max(aw, cr - cl);
                    const int area = cw * b->h();
                    if (area < bestArea) {
                        bestArea = area;
                        contL = cl;
                        contR = cr;
                        contW = cw;
                        hasTightContainer = true;
                    }
                }
            }
        }

        const int pad = (hasTightContainer && contW > 24) ? 2 : 0;
        int safeL = std::max(canvasMinL, std::min(ax, contL + pad));
        int safeR = std::min(canvasMaxR, std::max(ax + aw, contR - pad));

        // 2. Respect non-overlapping horizontal neighbors while sharing empty gaps fairly between adjacent labels.
        for (size_t j = 0; j < ch.size(); ++j) {
            if (i == j || !ch[j]) continue;
            UIWidget* b = ch[j].get();
            if (!uiBoxesOverlapY(a, b)) continue;
            if (b->y() <= a->y() + 2 && b->y() + b->h() >= a->y() + ah - 2 &&
                b->x() <= ax + 2 && b->x() + b->w() >= ax + aw - 2) {
                continue;
            }
            if (uiBoxesOverlapX(a, b)) continue; // overlapping icon/decor layer on same X

            const int bL = b->x();
            const int bR = b->x() + b->w();
            if (bR <= ax) {
                int limL = bR + 2;
                if (isExpandableTextLabel(b)) {
                    UIStyle* bst = b->style();
                    const int bStrW = bst->text.empty() ? 0 : AppContext::measureRichTextWidth(bst->text);
                    const bool bOverflow = !bst->text.empty() && (bStrW > b->w());
                    const bool bIconOnly = bst->text.empty() && (bst->unfocusIcon || bst->focusIcon);
                    const bool bEmptyRightNeed = !bIconOnly && bst->text.empty() && (bst->align % 3 != 2) && (b->w() < 48);
                    if (bOverflow || bEmptyRightNeed) {
                        limL = (bR + ax) / 2;
                    }
                }
                safeL = std::max(safeL, std::min(ax, limL));
            } else if (bL >= ax + aw) {
                int limR = bL - 2;
                if (isExpandableTextLabel(b)) {
                    UIStyle* bst = b->style();
                    const int bStrW = bst->text.empty() ? 0 : AppContext::measureRichTextWidth(bst->text);
                    const bool bOverflowLeft = !bst->text.empty() && (bStrW > b->w()) && (bst->align % 3 != 0);
                    const bool bIconOnly = bst->text.empty() && (bst->unfocusIcon || bst->focusIcon);
                    const bool bEmptyCenterNeed = !bIconOnly && bst->text.empty() && (bst->align % 3 == 1) && (b->w() < 48);
                    if (bOverflowLeft || bEmptyCenterNeed) {
                        limR = (ax + aw + bL) / 2;
                    }
                }
                safeR = std::min(safeR, std::max(ax + aw, limR));
            }
        }

        // 3. Detect titles/tabs centered symmetrically inside a container despite using left-aligned align==0/3/6.
        int effAlign = st->align;
        if (effAlign % 3 == 0 && hasTightContainer && contW - aw >= 4) {
            const int marginL = ax - contL;
            const int marginR = contR - (ax + aw);
            if (marginL >= 2 && std::abs(marginL - marginR) <= 2) {
                effAlign += 1;
            }
        }

        // 4. Promote tall buttons/tabs (>= 2 lines high) to auto-wrap before wider horizontal spillover.
        if (ah >= 2 * fh + 1 && aw <= 72) {
            st->textAutoWrap = true;
            const int maxSoftW = std::min(safeR - safeL, aw + 8);
            const int center = ax + aw / 2;
            const int halfSym = std::min(center - safeL, safeR - center);
            int tw = std::max(aw, std::min(maxSoftW, 2 * halfSym));
            int tx = center - tw / 2;
            if (tx < safeL) { tx = safeL; tw = std::min(maxSoftW, safeR - safeL); }
            if (tx + tw > safeR) { tw = std::min(maxSoftW, safeR - tx); }
            st->hasTextBounds = true;
            st->textDx = tx - ax;
            st->textW = std::max(aw, tw);
            if (effAlign != st->align) st->textAlignOverride = effAlign;
            continue;
        }

        // 5. Compute safe expanded horizontal text bounds inside [safeL .. safeR].
        int tx = ax;
        int tw = aw;
        if (effAlign % 3 == 1) {
            const int center = ax + aw / 2;
            const int halfSym = std::min(center - safeL, safeR - center);
            tw = std::max(aw, 2 * halfSym);
            tx = center - tw / 2;
            // Allow bounded off-center use of remaining free room only when a known static string still overflows
            if (!st->text.empty() && strW > tw && (safeR - safeL) > tw) {
                const int targetW = std::min(safeR - safeL, strW);
                const int freeL = std::max(0, tx - safeL);
                const int extra = targetW - tw;
                const int shiftL = std::min(freeL, extra);
                tx -= shiftL;
                tw = targetW;
                if (tx + tw > safeR) tx = safeR - tw;
            }
        } else if (effAlign % 3 == 2) {
            if (!st->text.empty() && strW > aw) {
                tx = safeL;
                tw = std::max(aw, (ax + aw) - safeL);
            }
        } else {
            // Corner HUD widgets flush against the right canvas edge (e.g. world.ui "(B) Menu") expand leftward.
            if (st->text.empty() && ax >= 240 && (safeR - ax) < 36 && (ax - safeL) >= 48) {
                tx = safeL;
                tw = std::max(aw, safeR - safeL);
                effAlign += 2;
            } else {
                tw = std::max(aw, safeR - ax);
                const int minLeftSlack = (aw <= 24) ? 2 : 4;
                if (!st->text.empty() && strW > tw && (ax - safeL) >= minLeftSlack) {
                    const int extraNeeded = (strW - tw) + 1;
                    const int shiftL = std::min(ax - safeL, extraNeeded);
                    tx -= shiftL;
                    tw += shiftL;
                }
            }
        }

        st->hasTextBounds = true;
        st->textDx = tx - ax;
        st->textW = tw;
        if (effAlign != st->align) st->textAlignOverride = effAlign;
    }
}

void UIScreen::parsePanel(ByteReader& r, UIPanel* panel, int sprMode) {
    int8_t kCount = r.readByte();
    if (kCount > 0) {
        panel->keyRules.resize(kCount);
        for (int i = 0; i < kCount; ++i) {
            panel->keyRules[i][0] = r.readByte();
            panel->keyRules[i][1] = r.readByte();
            panel->keyRules[i][2] = r.readByte();
            panel->keyRules[i][3] = r.readByte();
        }
    }

    int8_t navCount = r.readByte();
    for (int i = 0; i < navCount; ++i) {
        int8_t nk = r.readByte();
        auto nav = std::make_unique<UIListNav>(nk);
        nav->loop = (r.readByte() != 0);
        nav->visibleCount = r.readShort();
        nav->totalCount = r.readShort();
        nav->modeH = r.readByte();
        nav->centerOffset = r.readByte();
        for (int k = 0; k < nav->totalCount; ++k) {
            nav->slotIds[k] = r.readShort();
            int16_t slen = r.readShort();
            std::vector<uint8_t> sb(std::max<int>(0, slen));
            if (slen > 0) r.readBytes(sb.data(), slen);
            nav->labels.push_back(platform::utf16beToU16(sb.data(), sb.size()));
        }
        nav->animTables.resize(nav->visibleCount + 19);
        int16_t atCnt = r.readShort();
        for (int a = 0; a < atCnt; ++a) {
            int16_t slot = r.readShort();
            int16_t rows = r.readShort();
            if (slot >= 0 && slot < static_cast<int>(nav->animTables.size())) {
                nav->animTables[slot].resize(std::max<int>(0, rows), std::vector<int>(5, 0));
                for (int rr = 0; rr < rows; ++rr) {
                    for (int cc = 0; cc < 5; ++cc) nav->animTables[slot][rr][cc] = r.readShort();
                }
            } else {
                for (int rr = 0; rr < rows * 5; ++rr) r.readShort();
            }
        }
        if (nk == 0) panel->navA = std::move(nav);
        else panel->navB = std::move(nav);
    }

    int16_t childCount = r.readShort();
    for (int i = 0; i < childCount; ++i) {
        int8_t ctype = r.readByte();
        if (ctype == 0) {
            auto sub = std::make_unique<UIPanel>();
            sub->setId(r.readShort());
            sub->setX(r.readShort(), root_.get());
            sub->setY(r.readShort(), root_.get());
            sub->setW(r.readShort(), root_.get());
            sub->setH(r.readShort(), root_.get());
            sub->setParentId(panel->id());
            if (panel->navA) {
                for (int sid : panel->navA->slotIds) {
                    if (sid == sub->id()) { sub->setListNav(panel->navA.get()); break; }
                }
            }
            if (panel->navB) {
                for (int sid : panel->navB->slotIds) {
                    if (sid == sub->id()) { sub->setListNav(panel->navB.get()); break; }
                }
            }
            UIPanel* subPtr = sub.get();
            panel->children().push_back(std::move(sub));
            parsePanel(r, subPtr, sprMode);
        } else if (ctype == 1) {
            auto lbl = std::make_unique<UILabel>();
            lbl->setId(r.readShort());
            lbl->setX(r.readShort(), root_.get());
            lbl->setY(r.readShort(), root_.get());
            lbl->setW(r.readShort(), root_.get());
            lbl->setH(r.readShort(), root_.get());
            lbl->initBox();
            int16_t slen = r.readShort();
            std::vector<uint8_t> sb(std::max<int>(0, slen));
            if (slen > 0) r.readBytes(sb.data(), slen);
            UIStyle* st = lbl->style();
            st->text = platform::utf16beToU16(sb.data(), sb.size());
            st->align = r.readByte();
            st->iconAlign = r.readByte();
            st->wrap = (r.readByte() != 0);
            st->focusBgColor = r.readInt();
            st->focusBorderColor = r.readInt();
            st->focusTextColor = r.readInt();
            int16_t fspr = r.readShort();
            int8_t fmode = r.readByte();
            if (fspr >= 0) {
                st->focusIcon = std::make_unique<UISpriteIcon>();
                st->focusIcon->drawMode = static_cast<uint8_t>(fmode);
                st->focusIcon->setFrameOrAnim(fspr);
            }
            st->unfocusBgColor = r.readInt();
            st->unfocusBorderColor = r.readInt();
            st->unfocusTextColor = r.readInt();
            int16_t uspr = r.readShort();
            int8_t umode = r.readByte();
            if (uspr >= 0) {
                st->unfocusIcon = std::make_unique<UISpriteIcon>();
                st->unfocusIcon->setFrameOrAnim(uspr);
                st->unfocusIcon->drawMode = static_cast<uint8_t>(umode);
            }
            st->outlineMode = r.readByte();
            if (st->focusIcon) st->focusIcon->load(sprMode, false, st->outlineMode);
            if (st->unfocusIcon) st->unfocusIcon->load(sprMode, false, st->outlineMode);

            lbl->setParentId(panel->id());
            if (panel->navA) {
                for (int sid : panel->navA->slotIds) {
                    if (sid == lbl->id()) { lbl->setListNav(panel->navA.get()); break; }
                }
            }
            if (panel->navB) {
                for (int sid : panel->navB->slotIds) {
                    if (sid == lbl->id()) { lbl->setListNav(panel->navB.get()); break; }
                }
            }
            lbl->padA = r.readByte();
            lbl->padB = r.readByte();
            panel->children().push_back(std::move(lbl));
        } else if (ctype == 2) {
            auto grid = std::make_unique<UIGrid>();
            grid->setId(r.readShort());
            grid->setX(r.readShort(), root_.get());
            grid->setY(r.readShort(), root_.get());
            grid->cellW = r.readByte();
            grid->cellH = r.readByte();
            grid->gapX = r.readByte();
            grid->gapY = r.readByte();
            grid->cols = r.readByte();
            grid->rows = r.readByte();
            grid->visCols = r.readByte();
            grid->visRows = r.readByte();
            grid->curOffX = r.readByte();
            grid->curOffY = r.readByte();
            grid->wrapH = r.readByte();
            grid->wrapV = r.readByte();
            grid->pageH = r.readByte();
            grid->pageV = r.readByte();
            grid->scrollCol = r.readByte();
            grid->scrollRow = r.readByte();
            grid->bgColor = r.readInt();

            int16_t bgspr = r.readShort();
            int8_t bgmode = r.readByte();
            if (bgspr >= 0) {
                grid->bgIcon = std::make_unique<UISpriteIcon>();
                grid->bgIcon->setFrameOrAnim(bgspr);
                grid->bgIcon->drawMode = static_cast<uint8_t>(bgmode);
                grid->bgIcon->load(sprMode, false, bgmode);
            }
            int16_t cspr = r.readShort();
            int8_t cmode = r.readByte();
            if (cspr >= 0) {
                grid->cursorIcon = std::make_unique<UISpriteIcon>();
                grid->cursorIcon->setFrameOrAnim(cspr);
                grid->cursorIcon->drawMode = static_cast<uint8_t>(cmode);
                grid->cursorIcon->load(sprMode, false, cmode);
            }
            grid->setCursor(r.readShort());
            int8_t cellMode = r.readByte();
            if (cellMode == 0) {
                grid->initAutoCells();
            } else if (cellMode == 1) {
                grid->initEmptyCells(grid->cols, grid->rows);
                int16_t cc = r.readShort();
                for (int k = 0; k < cc; ++k) {
                    int16_t idx = r.readShort();
                    int16_t ispr = r.readShort();
                    int8_t imode = r.readByte();
                    int16_t cu = r.readShort();
                    int16_t cd = r.readShort();
                    int16_t cl = r.readShort();
                    int16_t cr = r.readShort();
                    if (idx >= 0 && idx < static_cast<int>(grid->cells.size())) {
                        grid->cells[idx].active = 1;
                        grid->cells[idx].up = cu;
                        grid->cells[idx].down = cd;
                        grid->cells[idx].left = cl;
                        grid->cells[idx].right = cr;
                        if (ispr != -1) {
                            grid->cells[idx].icon = std::make_unique<UISpriteIcon>();
                            grid->cells[idx].icon->setFrameOrAnim(ispr);
                            grid->cells[idx].icon->drawMode = static_cast<uint8_t>(imode);
                            grid->cells[idx].icon->load(sprMode, false, imode);
                        }
                    }
                }
            }
            grid->setParentId(panel->id());
            panel->children().push_back(std::move(grid));
        }
    }
}

UIWidget* UIScreen::find(int widgetId) {
    return findWidgetById(root_.get(), widgetId);
}

void UIScreen::render(GraphicsContext& g) {
    if (!root_) return;
    root_->draw(g, false, true, root_.get(), focusIdPath_);
}

void UIScreen::tick() {
    if (!root_) return;
    root_->tick(false, true, root_.get(), focusIdPath_);
}

UIWidget* UIScreen::resolveFocusedWidget() {
    UIWidget* cur = root_.get();
    for (int idx : focusIndexPath_) {
        if (!cur || idx < 0 || idx >= static_cast<int>(cur->children().size())) break;
        cur = cur->children()[idx].get();
    }
    return cur;
}

void UIScreen::rebuildFocusIdPath() {
    focusIdPath_.clear();
    if (!root_) return;
    UIWidget* cur = root_.get();
    focusIdPath_.push_back(cur->id());
    for (int idx : focusIndexPath_) {
        if (!cur || idx < 0 || idx >= static_cast<int>(cur->children().size())) break;
        cur = cur->children()[idx].get();
        focusIdPath_.push_back(cur->id());
    }
}

int UIScreen::findFirstFocusable(UIWidget* w, int targetId, bool setGridCursor) {
    if (!w || w->kind() == 1) return -1;
    if (w->kind() == 2 && targetId == -1) {
        if (setGridCursor) static_cast<UIGrid*>(w)->cursorVisible = true;
        return w->id();
    }
    UIPanel* p = static_cast<UIPanel*>(w);
    if ((p->navA || p->navB) && targetId == -1) return p->id();
    for (auto& ch : p->children()) {
        if (!ch || ch->kind() == 1) continue;
        if (targetId == -1 || ch->id() == targetId) {
            int r = findFirstFocusable(ch.get(), -1, setGridCursor);
            if (r != -1) return r;
        }
    }
    return -1;
}

std::vector<int> UIScreen::buildIndexPathTo(int targetId) {
    std::vector<int> path;
    UIWidget* cur = find(targetId);
    while (cur && cur->parentId() != -1) {
        UIWidget* parent = find(cur->parentId());
        if (!parent) break;
        for (size_t i = 0; i < parent->children().size(); ++i) {
            if (parent->children()[i] && parent->children()[i]->id() == cur->id()) {
                path.insert(path.begin(), static_cast<int>(i));
                break;
            }
        }
        cur = parent;
    }
    return path;
}

bool UIScreen::focusEnter(UIWidget* w, int targetId) {
    if (!w || w->kind() == 1) return false;
    int r = findFirstFocusable(w, targetId, true);
    if (r == -1) return false;
    focusIndexPath_ = buildIndexPathTo(r);
    rebuildFocusIdPath();
    return true;
}

bool UIScreen::focusBack() {
    for (int i = static_cast<int>(focusIdPath_.size()) - 2; i >= 0; --i) {
        UIWidget* w = find(focusIdPath_[i]);
        if (w && w->kind() == 0) {
            UIPanel* p = static_cast<UIPanel*>(w);
            if (p->navA || p->navB) {
                focusIndexPath_ = buildIndexPathTo(p->id());
                rebuildFocusIdPath();
                return true;
            }
        }
    }
    return false;
}

bool UIScreen::dispatchAction(int actionCode) {
    UIWidget* w = resolveFocusedWidget();
    if (!w) return false;

    if (w->kind() == 2) {
        UIGrid* gr = static_cast<UIGrid*>(w);
        bool moved = false;
        switch (actionCode) {
            case 0: moved = gr->moveCursor(0); if (listener_) listener_->onUIEvent({-1, -1, 0}, {-1,-1,-1,-1}); break;
            case 1: moved = gr->moveCursor(1); if (listener_) listener_->onUIEvent({-1, -1, 1}, {-1,-1,-1,-1}); break;
            case 2: moved = gr->moveCursor(2); if (listener_) listener_->onUIEvent({-1, -1, 2}, {-1,-1,-1,-1}); break;
            case 3: moved = gr->moveCursor(3); if (listener_) listener_->onUIEvent({-1, -1, 3}, {-1,-1,-1,-1}); break;
            case 5: moved = true; if (listener_) listener_->onUIEvent({-1, -1, 4}, {-1,-1,-1,-1}); break;
            case 7:
                moved = focusBack();
                if (moved) { gr->cursorVisible = false; if (listener_) listener_->onUIEvent({-1, -1, 7}, {-1,-1,-1,-1}); }
                else { if (listener_) listener_->onUIEvent({-1, -1, 5}, {-1,-1,-1,-1}); }
                break;
            default: break;
        }
        return moved;
    }

    UIPanel* p = static_cast<UIPanel*>(w);
    std::vector<std::array<int8_t, 4>> rules = p->keyRules;
    if (rules.empty()) {
        rules = {{0,0,1,-1}, {1,1,1,-1}, {2,2,1,-1}, {3,3,1,-1}, {5,4,-1,-1}, {7,5,-1,-1}};
    }
    std::array<int, 3> evt = {p->navA ? p->navA->cursor : -1, p->navB ? p->navB->cursor : -1, 0};
    bool ruleMatched = false;
    bool handled = false;
    for (const auto& rule : rules) {
        if (rule[0] != actionCode) continue;
        ruleMatched = true;
        handled = false;
        switch (rule[1]) {
            case 0:
                evt[2] = 0;
                if (p->navA) {
                    if (rule[3] != -1 && p->navA->cursor % (rule[3] + 1) == 0) p->navA->stepNext(rule[3], root_.get());
                    else p->navA->stepPrev(rule[2], root_.get());
                    handled = true;
                    evt[0] = p->navA->cursor;
                }
                if (listener_) listener_->onUIEvent(evt, {-1,-1,-1,-1});
                break;
            case 1:
                evt[2] = 1;
                if (p->navA) {
                    if (rule[3] != -1 && (p->navA->cursor + 1) % (rule[3] + 1) == 0) p->navA->stepPrev(rule[3], root_.get());
                    else p->navA->stepNext(rule[2], root_.get());
                    handled = true;
                    evt[0] = p->navA->cursor;
                }
                if (listener_) listener_->onUIEvent(evt, {-1,-1,-1,-1});
                break;
            case 2:
                evt[2] = 2;
                if (p->navB) {
                    if (rule[3] != -1 && p->navB->cursor % (rule[3] + 1) == 0) p->navB->stepNext(rule[3], root_.get());
                    else p->navB->stepPrev(rule[2], root_.get());
                    handled = true;
                    evt[1] = p->navB->cursor;
                }
                if (listener_) listener_->onUIEvent(evt, {-1,-1,-1,-1});
                break;
            case 3:
                evt[2] = 3;
                if (p->navB) {
                    if (rule[3] != -1 && (p->navB->cursor + 1) % (rule[3] + 1) == 0) p->navB->stepPrev(rule[3], root_.get());
                    else p->navB->stepNext(rule[2], root_.get());
                    handled = true;
                    evt[1] = p->navB->cursor;
                }
                if (listener_) listener_->onUIEvent(evt, {-1,-1,-1,-1});
                break;
            case 4:
                if (p->navB) {
                    int cnt = 0;
                    for (int s : p->navB->slotIds) { if (s == -1) break; cnt++; }
                    int tid = (p->navB->cursor >= cnt) ? p->navB->slotIds[std::max(0, p->navB->cursor - p->navB->scrollTop)] : p->navB->slotIds[p->navB->cursor];
                    handled = focusEnter(p, tid);
                }
                if (!handled && p->navA) {
                    int cnt = 0;
                    for (int s : p->navA->slotIds) { if (s == -1) break; cnt++; }
                    int tid = (p->navA->cursor >= cnt) ? p->navA->slotIds[std::max(0, p->navA->cursor - p->navA->scrollTop)] : p->navA->slotIds[p->navA->cursor];
                    handled = focusEnter(p, tid);
                }
                evt[2] = handled ? 6 : 4;
                if (listener_) listener_->onUIEvent(evt, {-1,-1,-1,-1});
                break;
            case 5:
                handled = focusBack();
                evt[2] = handled ? 7 : 5;
                if (listener_) listener_->onUIEvent(evt, {-1,-1,-1,-1});
                break;
            default:
                break;
        }
        if (handled) break;
    }
    if (!ruleMatched && actionCode >= 14 && actionCode <= 23) {
        evt[2] = actionCode - 6;
        if (listener_) listener_->onUIEvent(evt, {-1,-1,-1,-1});
    }
    return handled;
}

UIManager& UIManager::instance() {
    static UIManager s_mgr;
    return s_mgr;
}

void UIManager::clearAll() {
    cache_.clear();
    stackPaths_.clear();
    stackScreens_.clear();
    top_ = nullptr;
}

void UIManager::render(GraphicsContext& g) {
    int uiOffsetX = (AppContext::screenWidth() - 320) / 2;
    if (uiOffsetX > 0 && !stackScreens_.empty()) {
        // Subtle dark sidebars so 320x240 UI overlays look balanced on 16:9 widescreen
        g.setColor(0);
    }
    g.translate(uiOffsetX, 0);
    for (UIScreen* s : stackScreens_) {
        if (s) s->render(g);
    }
    g.translate(-uiOffsetX, 0);
    g.resetClip();
}

void UIManager::tick() {
    if (top_) top_->tick();
}

void UIManager::openScreen(const std::string& path, int sprMode, UIListener* listener) {
    auto it = cache_.find(path);
    if (it != cache_.end()) {
        UIScreen* old = it->second.get();
        for (size_t i = 0; i < stackScreens_.size(); ++i) {
            if (stackScreens_[i] == old) {
                stackScreens_.erase(stackScreens_.begin() + i);
                break;
            }
        }
        for (size_t i = 0; i < stackPaths_.size(); ++i) {
            if (stackPaths_[i] == path) {
                stackPaths_.erase(stackPaths_.begin() + i);
                break;
            }
        }
        if (path != "/data/ui/dialog.ui") {
            cache_.erase(it);
        } else {
            stackScreens_.push_back(old);
            stackPaths_.push_back(path);
            top_ = old;
            return;
        }
    }
    auto scr = std::make_unique<UIScreen>(listener);
    scr->load(path, sprMode);
    UIScreen* ptr = scr.get();
    cache_[path] = std::move(scr);
    stackScreens_.push_back(ptr);
    stackPaths_.push_back(path);
    top_ = ptr;
}

void UIManager::closeScreen(const std::string& path) {
    auto it = cache_.find(path);
    if (it != cache_.end()) {
        UIScreen* ptr = it->second.get();
        if (top_ == ptr) top_ = nullptr;
        for (size_t i = 0; i < stackScreens_.size(); ++i) {
            if (stackScreens_[i] == ptr) {
                stackScreens_.erase(stackScreens_.begin() + i);
                break;
            }
        }
        for (size_t i = 0; i < stackPaths_.size(); ++i) {
            if (stackPaths_[i] == path) {
                stackPaths_.erase(stackPaths_.begin() + i);
                break;
            }
        }
        if (path != "/data/ui/dialog.ui") {
            cache_.erase(it);
        }
    }
    if (!stackScreens_.empty()) {
        top_ = stackScreens_.back();
    }
}

bool UIManager::isTopScreen(const std::string& path) const {
    return !stackPaths_.empty() && stackPaths_.back() == path;
}

bool UIManager::isScreenOpen(const std::string& path) const {
    for (const auto& p : stackPaths_) {
        if (p == path) return true;
    }
    return false;
}

UIScreen* UIManager::getScreen(const std::string& path) {
    auto it = cache_.find(path);
    return it != cache_.end() ? it->second.get() : nullptr;
}

} // namespace engine
