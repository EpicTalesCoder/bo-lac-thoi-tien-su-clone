#include "engine/ScreenBase.hpp"
#include "engine/BitmapFont.hpp"
#include "platform/Platform.hpp"
#include <algorithm>
#include <cstdlib>
#include <ctime>

namespace engine {

int16_t AppContext::screenW_ = 426;
int16_t AppContext::screenH_ = 240;
int AppContext::frameDelayMs_ = 66;
float AppContext::renderAlpha_ = 1.0f;
int AppContext::logoBgColor_ = 0;
bool AppContext::loadingDone_ = false;

bool AppContext::hasSaveGame = false;
bool AppContext::gameActivated = true; // Desktop C++17 native port is fully unlocked offline
bool AppContext::inSysDialog = false;
int8_t AppContext::tutorialStep = -1;
int8_t AppContext::tutorialSub = 0;
int8_t AppContext::tutorialTable_[20][3] = {
    {1, 1, 0}, {1, 2, 0}, {1, 3, 0}, {1, 0, 0}, {1, 1, 0},
    {1, 1, 0}, {1, 2, 0}, {1, 0, 0}, {1, 0, 0}, {1, 0, 0},
    {1, 0, 0}, {1, 0, 0}, {1, 0, 0}, {1, 0, 0}, {1, 0, 0},
    {1, 0, 0}, {1, 0, 0}, {1, 0, 0}, {1, 0, 0}, {1, 0, 0}
};

std::vector<std::u16string> AppContext::pagedLines;
int AppContext::currentPage = 1;
int AppContext::linesPerPage_ = 1;
int AppContext::pageCursor_ = 0;

int32_t ScreenBase::mapKeyCode(int32_t keyCode) {
    switch (keyCode) {
        case 48: case 109: return KEY_0;
        case 49: case 114: return KEY_1;
        case 50: case 116: return KEY_2 | KEY_UP;
        case 51: case 121: return KEY_3;
        case 52: case 102: return KEY_4 | KEY_LEFT;
        case 53: case 103: return KEY_5 | KEY_FIRE;
        case 54: case 104: return KEY_6 | KEY_RIGHT;
        case 55: case 118: return KEY_7;
        case 56: case 98:  return KEY_8 | KEY_DOWN;
        case 57: case 110: return KEY_9;
        case 42: case 106: return KEY_STAR;
        case 35: case 117: return KEY_POUND;
        case -1:           return KEY_UP | KEY_2;
        case -2:           return KEY_DOWN | KEY_8;
        case -3:           return KEY_LEFT | KEY_4;
        case -4:           return KEY_RIGHT | KEY_6;
        case -5:           return KEY_FIRE | KEY_5;
        case -21: case -6: return KEY_LSK;
        case -22: case -7: return KEY_RSK;
        default:           return 0;
    }
}

void AppContext::setScreenSize(int16_t w, int16_t h) {
    screenW_ = w;
    screenH_ = h;
}

void AppContext::startLoadingTimer() {
    // Loading completes synchronously on native hardware without artificial lag
}

void AppContext::stopLoadingTimer() {
    loadingDone_ = true;
}

void AppContext::resetLoadingDone() {
    loadingDone_ = false;
}

bool AppContext::isLoadingDone() {
    return loadingDone_;
}

namespace {
bool g_rngInit = false;
void ensureRng() {
    if (!g_rngInit) {
        std::srand(static_cast<unsigned>(std::time(nullptr)));
        g_rngInit = true;
    }
}
} // namespace

int AppContext::randInt(int bound) {
    ensureRng();
    if (bound <= 0) return 0;
    return std::rand() % bound;
}

int AppContext::randRange(int minVal, int maxVal) {
    ensureRng();
    if (maxVal <= minVal) return minVal;
    return minVal + (std::rand() % (maxVal - minVal + 1));
}

int AppContext::randShake2() {
    ensureRng();
    return -2 + (std::rand() % 4);
}

int AppContext::isqrt(int val, int mode) {
    if (val < 0) return -1;
    int r = 0;
    while ((r + 1) * (r + 1) <= val) ++r;
    if (mode == 0) {
        if (r * r < val) return r + 1;
        return r;
    }
    return r;
}

int AppContext::distApprox(int x1, int y1, int x2, int y2) {
    int64_t dx = x1 - x2;
    int64_t dy = y1 - y2;
    int64_t d2 = dx * dx + dy * dy;
    int64_t res = 0;
    for (int64_t bit = 0x40000000; bit > 0; bit >>= 2) {
        if (d2 >= res + bit) {
            d2 -= res + bit;
            res = (res >> 1) + bit;
        } else {
            res >>= 1;
        }
    }
    return static_cast<int>(res);
}

namespace {
constexpr int kTagColors[7] = {
    1862801, 15673612, 12067264, 11689977, 16359727, 0xFF0000, 255
};

struct TextSpan {
    int start = 0;
    int end = 0;
    int x = 0;
    int y = 0;
    int colorIdx = 0;
};

struct TextLayoutResult {
    std::vector<TextSpan> spans;
    int lastWidth = 0;
    int totalWidth = 0;
};

struct RichGlyph {
    int srcPos = 0;
    char16_t ch = 0;
    int w = 0;
    int colIdx = 0;
    bool hardBreak = false;
};

void emitWrappedSpans(TextLayoutResult& res, const std::vector<RichGlyph>& glyphs, int from, int to, int cy) {
    int cx = 0;
    int k = from;
    while (k < to) {
        int runColor = glyphs[k].colIdx;
        int srcStart = glyphs[k].srcPos;
        int runEnd = k + 1;
        int runW = glyphs[k].w;
        while (runEnd < to && glyphs[runEnd].colIdx == runColor &&
               glyphs[runEnd].srcPos == glyphs[runEnd - 1].srcPos + 1) {
            runW += glyphs[runEnd].w;
            ++runEnd;
        }
        int srcEnd = glyphs[runEnd - 1].srcPos + 1;
        res.spans.push_back({srcStart, srcEnd, cx, cy, runColor});
        cx += runW;
        k = runEnd;
    }
    res.lastWidth = cx;
}

TextLayoutResult layoutWrappedRichText(const std::u16string& text, int lineH, int maxW) {
    TextLayoutResult res;
    if (text.empty()) return res;

    const int n = static_cast<int>(text.size());
    std::vector<RichGlyph> glyphs;
    glyphs.reserve(static_cast<size_t>(n));
    int curCol = 0;
    for (int i = 0; i < n; ++i) {
        char16_t ch = text[i];
        if (ch == u'#' && i + 1 < n) {
            char16_t nxt = text[i + 1];
            if (nxt == u'n') {
                glyphs.push_back({i, u'\n', 0, curCol, true});
                ++i;
                continue;
            }
            if (nxt >= u'0' && nxt <= u'7') {
                curCol = (nxt == u'0') ? 0 : (nxt - u'0');
                ++i;
                continue;
            }
        }
        if (ch == u'\r') continue;
        if (ch == u'\n') {
            glyphs.push_back({i, u'\n', 0, curCol, true});
            continue;
        }
        glyphs.push_back({i, ch, BitmapFont::charWidth(ch), curCol, false});
    }

    const int m = static_cast<int>(glyphs.size());
    const int effMaxW = std::max(1, maxW);
    const int stepY = lineH + 1;
    int cy = 0;
    int gIdx = 0;
    while (gIdx < m) {
        if (glyphs[gIdx].hardBreak) {
            cy += stepY;
            ++gIdx;
            continue;
        }

        int lineStart = gIdx;
        int lineEnd = lineStart;
        int lineW = 0;
        int p = lineStart;
        bool wrappedLine = false;

        while (p < m && !glyphs[p].hardBreak) {
            if (glyphs[p].ch == u' ') {
                int spEnd = p;
                int spW = 0;
                while (spEnd < m && !glyphs[spEnd].hardBreak && glyphs[spEnd].ch == u' ') {
                    spW += glyphs[spEnd].w;
                    ++spEnd;
                }
                if (spEnd >= m || glyphs[spEnd].hardBreak) {
                    // Trim trailing whitespace before explicit break or end of text
                    p = spEnd;
                    break;
                }
                int tokEnd = spEnd;
                int tokW = 0;
                while (tokEnd < m && !glyphs[tokEnd].hardBreak && glyphs[tokEnd].ch != u' ') {
                    tokW += glyphs[tokEnd].w;
                    char16_t tc = glyphs[tokEnd].ch;
                    ++tokEnd;
                    if (tc == u'-' || tc == u'/') break;
                }
                if (lineW > 0 && lineW + spW + tokW > effMaxW) {
                    emitWrappedSpans(res, glyphs, lineStart, lineEnd, cy);
                    cy += stepY;
                    gIdx = spEnd;
                    wrappedLine = true;
                    break;
                }
                lineW += spW + tokW;
                lineEnd = tokEnd;
                p = tokEnd;
                continue;
            }

            int tokEnd = p;
            int tokW = 0;
            while (tokEnd < m && !glyphs[tokEnd].hardBreak && glyphs[tokEnd].ch != u' ') {
                tokW += glyphs[tokEnd].w;
                char16_t tc = glyphs[tokEnd].ch;
                ++tokEnd;
                if (tc == u'-' || tc == u'/') break;
            }
            if (lineW > 0 && lineW + tokW > effMaxW) {
                emitWrappedSpans(res, glyphs, lineStart, lineEnd, cy);
                cy += stepY;
                gIdx = p;
                wrappedLine = true;
                break;
            }
            if (lineW == 0 && tokW > effMaxW) {
                int split = p;
                int partW = 0;
                while (split < tokEnd) {
                    int cw = glyphs[split].w;
                    if (split > p && partW + cw > effMaxW) break;
                    partW += cw;
                    ++split;
                }
                emitWrappedSpans(res, glyphs, lineStart, split, cy);
                cy += stepY;
                gIdx = split;
                wrappedLine = true;
                break;
            }
            lineW += tokW;
            lineEnd = tokEnd;
            p = tokEnd;
        }

        if (!wrappedLine) {
            if (lineEnd > lineStart) {
                emitWrappedSpans(res, glyphs, lineStart, lineEnd, cy);
            }
            gIdx = p;
            if (gIdx < m && glyphs[gIdx].hardBreak) {
                cy += stepY;
                ++gIdx;
            }
        }
    }
    return res;
}

TextLayoutResult layoutRichText(const std::u16string& text, int lineH, int maxW, bool wrap) {
    if (wrap) return layoutWrappedRichText(text, lineH, maxW);
    TextLayoutResult res;
    if (text.empty()) return res;
    int n = static_cast<int>(text.size());
    int lastIdx = n - 1;
    int start = 0;
    int cx = 0;
    int cy = 0;
    int colIdx = 0;
    int wrapLimit2 = maxW - BitmapFont::spaceRefWidth();

    for (int i = 0; i <= lastIdx; ++i) {
        char16_t ch = text[i];
        if (ch == u'#' && i != lastIdx) {
            char16_t nxt = text[i + 1];
            if (nxt == u'n') {
                res.spans.push_back({start, i, cx, cy, colIdx});
                cx = 0;
                cy += lineH + 1;
                res.lastWidth = 0;
                start = i + 2;
                ++i;
                continue;
            } else if (nxt >= u'0' && nxt <= u'7') {
                res.totalWidth += res.lastWidth;
                res.lastWidth = 0;
                res.spans.push_back({start, i, cx, cy, colIdx});
                cx += BitmapFont::rangeWidth(text, start, i);
                colIdx = static_cast<int>(nxt - u'0');
                start = i + 2;
                ++i;
                continue;
            }
        } else if (i - start >= 0) {
            res.lastWidth = BitmapFont::rangeWidth(text, start, i + 1);
            if (wrap && (cx + res.lastWidth >= maxW || (ch == u' ' && cx + res.lastWidth >= wrapLimit2))) {
                res.spans.push_back({start, i, cx, cy, colIdx});
                cx = 0;
                cy += lineH + 1;
                res.lastWidth = 0;
                start = (ch == u' ') ? (i + 1) : i;
            }
        }
        if (i == lastIdx && start <= i) {
            res.spans.push_back({start, i + 1, cx, cy, colIdx});
        }
    }
    return res;
}

constexpr int kScrollStartPauseMs = 2500;
constexpr int kScrollEndPauseMs = 2200;
constexpr int kHorizScrollStepMs = 75; // ~13.3 px/sec (smooth readable marquee)
constexpr int kVertScrollStepMs = 220; // ~4.5 px/sec (~2.9s per line for comfortable reading)
constexpr uint64_t kMaxScrollFrameDeltaMs = 200;

int computeLayoutWidth(const std::u16string& text, const TextLayoutResult& layout) {
    int maxW = 0;
    for (const auto& sp : layout.spans) {
        int endX = sp.x + BitmapFont::rangeWidth(text, sp.start, sp.end);
        if (endX > maxW) maxW = endX;
    }
    return maxW;
}

// Advances one axis of rich-text marquee/scroll at a comfortable, FPS-independent pace.
void updateScrollAxis(int maxScroll, int scrollStep, int stepIntervalMs,
                      uint64_t nowMs, bool isVerticalWrap,
                      int& offsetOut, bool flagsOut[2],
                      TextScrollTiming* timing) {
    if (maxScroll <= 0 || scrollStep <= 0) {
        offsetOut = 0;
        if (timing) {
            timing->lastTickMs = nowMs;
            timing->phase = 0;
            timing->accumMs = 0;
        }
        flagsOut[0] = (maxScroll <= 0);
        flagsOut[1] = (maxScroll <= 0);
        return;
    }

    if (!timing) {
        if (offsetOut < 0) offsetOut = 0;
        offsetOut += std::max(1, scrollStep);
        if (offsetOut >= maxScroll) {
            offsetOut = 0;
            flagsOut[0] = true;
            flagsOut[1] = true;
        } else {
            flagsOut[0] = isVerticalWrap;
            flagsOut[1] = !isVerticalWrap;
        }
        return;
    }

    int elapsed = 0;
    if (timing->lastTickMs == 0 || nowMs < timing->lastTickMs) {
        timing->lastTickMs = nowMs;
    } else {
        uint64_t diff = nowMs - timing->lastTickMs;
        elapsed = static_cast<int>(std::min<uint64_t>(diff, kMaxScrollFrameDeltaMs));
        timing->lastTickMs = nowMs;
    }

    offsetOut = std::clamp(offsetOut, 0, maxScroll);
    const int stepMs = std::max(15, stepIntervalMs / std::max(1, scrollStep));
    timing->accumMs += elapsed;

    while (timing->accumMs > 0) {
        if (timing->phase == 0) {
            if (timing->accumMs < kScrollStartPauseMs) break;
            timing->accumMs -= kScrollStartPauseMs;
            timing->phase = 1;
        } else if (timing->phase == 1) {
            if (timing->accumMs < stepMs) break;
            timing->accumMs -= stepMs;
            if (++offsetOut >= maxScroll) {
                offsetOut = maxScroll;
                timing->phase = 2;
            }
        } else {
            if (timing->accumMs < kScrollEndPauseMs) break;
            timing->accumMs -= kScrollEndPauseMs;
            offsetOut = 0;
            timing->phase = 0;
            if (isVerticalWrap) flagsOut[1] = true;
        }
    }

    flagsOut[0] = isVerticalWrap ? true : (offsetOut >= maxScroll);
    if (!isVerticalWrap) flagsOut[1] = true;
}
} // namespace

int AppContext::measureRichTextWidth(const std::u16string& text) {
    if (text.empty()) return 0;
    TextLayoutResult layout = layoutRichText(text, BitmapFont::height(), 0, false);
    return computeLayoutWidth(text, layout);
}

void AppContext::drawRichText(GraphicsContext& g, const std::u16string& text, int defaultColor,
                              int x, int y, int lineHeight, int w, int h, bool wrap, int align,
                              int scrollStep, int scrollState[2], bool flagsOut[2],
                              TextScrollTiming* timing) {
    if (text.empty()) return;
    int lh = BitmapFont::height();
    if (lineHeight > lh) lh = lineHeight;
    int palette[8];
    palette[0] = defaultColor;
    for (int i = 1; i < 8; ++i) palette[i] = kTagColors[i - 1];

    TextLayoutResult layout = layoutRichText(text, lh, w, wrap);
    int totalW = computeLayoutWidth(text, layout);
    int strW = wrap ? 0 : totalW;
    if (!layout.spans.empty()) {
        const uint64_t nowMs = platform::getUiTicksMs();
        if (wrap) {
            int maxY = layout.spans.back().y + lh;
            updateScrollAxis(maxY - h, scrollStep, kVertScrollStepMs, nowMs, true,
                             scrollState[1], flagsOut, timing);
        } else {
            updateScrollAxis(strW - w, scrollStep, kHorizScrollStepMs, nowMs, false,
                             scrollState[0], flagsOut, timing);
        }
    }

    int ox = g.getClipX(), oy = g.getClipY(), ow = g.getClipWidth(), oh = g.getClipHeight();
    for (const auto& sp : layout.spans) {
        g.setClip(x, y, w, h);
        g.setColor(palette[sp.colorIdx % 8]);
        std::u16string seg = text.substr(sp.start, sp.end - sp.start);
        if (wrap) {
            const int drawScrollY = std::max(0, scrollState[1]);
            BitmapFont::drawAnchored(g, seg, x + sp.x, y + sp.y - drawScrollY, TOP | LEFT);
        } else {
            int ax = x;
            int ay = y;
            switch (align) {
                case 4: ax = (strW > w) ? x : x + (w - totalW) / 2; ay = y + (h - lh) / 2; break;
                case 3: ax = x; ay = y + (h - lh) / 2; break;
                case 5: ax = (strW > w) ? x : x + (w - totalW); ay = y + (h - lh) / 2; break;
                case 6: ax = x; ay = y + (h - lh); break;
                case 8: ax = (strW > w) ? x : x + (w - totalW); ay = y + (h - lh); break;
                case 7: ax = (strW > w) ? x : x + (w - totalW) / 2; ay = y + (h - lh); break;
                case 0: ax = x; ay = y; break;
                case 2: ax = (strW > w) ? x : x + (w - totalW); ay = y; break;
                case 1: ax = (strW > w) ? x : x + (w - totalW) / 2; ay = y; break;
                default: break;
            }
            const int drawScrollX = std::max(0, scrollState[0]);
            BitmapFont::drawAnchored(g, seg, ax + sp.x - drawScrollX, ay + sp.y, TOP | LEFT);
        }
        g.setClip(ox, oy, ow, oh);
    }
}

void AppContext::drawOutlinedText(GraphicsContext& g, const std::u16string& text, int color,
                                  int x, int y, int outlineMode) {
    const int outlineCol = 8607289;
    g.setColor(outlineCol);
    if (outlineMode == 0 || outlineMode == 2) {
        BitmapFont::drawAnchored(g, text, x - 1, y, HCENTER | TOP);
        BitmapFont::drawAnchored(g, text, x + 1, y, HCENTER | TOP);
    }
    if (outlineMode == 1 || outlineMode == 2) {
        BitmapFont::drawAnchored(g, text, x, y - 1, HCENTER | TOP);
        BitmapFont::drawAnchored(g, text, x, y + 1, HCENTER | TOP);
    }
    g.setColor(color);
    BitmapFont::drawAnchored(g, text, x, y, HCENTER | TOP);
}

void AppContext::preparePagedText(const std::u16string& text, int lineH, int maxW) {
    pagedLines.clear();
    currentPage = 1;
    pageCursor_ = 0;
    TextLayoutResult layout = layoutRichText(text, lineH, maxW, true);
    if (layout.spans.empty()) return;
    int curY = layout.spans[0].y;
    int start = 0;
    for (size_t i = 0; i < layout.spans.size(); ++i) {
        if (layout.spans[i].y != curY) {
            curY = layout.spans[i].y;
            pagedLines.push_back(text.substr(start, layout.spans[i].start - start));
            start = layout.spans[i].start;
        }
        if (i + 1 == layout.spans.size()) {
            pagedLines.push_back(text.substr(start, layout.spans[i].end - start));
            break;
        }
    }
}

void AppContext::setPageAreaHeight(int h) {
    int fh = BitmapFont::height();
    linesPerPage_ = std::max(1, (h + 1) / std::max(1, fh + 1));
}

std::u16string AppContext::getPageText(int pageIdx) {
    std::u16string out;
    int start = linesPerPage_ * pageCursor_;
    int end = std::min(static_cast<int>(pagedLines.size()), pageIdx * linesPerPage_);
    for (int i = start; i < end; ++i) {
        out += pagedLines[i];
    }
    pageCursor_ = pageIdx;
    return out;
}

int AppContext::totalPages() {
    if (pagedLines.empty()) return 1;
    return (static_cast<int>(pagedLines.size()) + linesPerPage_ - 1) / linesPerPage_;
}

void AppContext::setTutorialRule(int idx, int val) {
    if (tutorialStep != -1) {
        if (val == -1) tutorialTable_[tutorialStep][2] = 0;
        tutorialTable_[tutorialStep][idx] = static_cast<int8_t>(val);
    }
}

bool AppContext::isTutorialLocked(int keyId, int phase) {
    if (tutorialStep == -1) return false;
    if (phase != tutorialTable_[tutorialStep][2]) return true;
    if (tutorialTable_[tutorialStep][1] == -1) return true;
    return tutorialTable_[tutorialStep][1] == keyId;
}

bool AppContext::isTutorialMode1() {
    return tutorialStep == -1 ? true : (tutorialTable_[tutorialStep][0] == 1);
}

bool AppContext::isTutorialMode2() {
    return tutorialStep == -1 ? true : (tutorialTable_[tutorialStep][0] == 2);
}

void AppContext::clearTutorial() {
    setTutorialRule(1, -1);
    setTutorialRule(0, 0);
    tutorialStep = -1;
    tutorialSub = 0;
}

int8_t AppContext::getTutorialKey(int idx) {
    (void)idx;
    return tutorialStep == -1 ? -1 : tutorialTable_[tutorialStep][1];
}

void AppContext::grantOfflineActivationGift() {
    gameActivated = true;
}

} // namespace engine
