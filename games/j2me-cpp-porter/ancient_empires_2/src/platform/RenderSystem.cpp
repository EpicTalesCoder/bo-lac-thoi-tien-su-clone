#include "platform/RenderSystem.hpp"
#include "platform/CrashLogger.hpp"
#include "platform/InputSystem.hpp"
#include "platform/Platform.hpp"

#include <SDL.h>
#include <SDL_image.h>
#include <SDL_ttf.h>
#include <algorithm>
#include <cmath>
#include <cstdio>
#include <unordered_map>

namespace platform {

namespace {
SDL_Window* g_window = nullptr;
SDL_Renderer* g_renderer = nullptr;
SDL_Texture* g_gameTex = nullptr;
int g_texW = 0;
int g_texH = 0;

int g_origW = 320;
int g_origH = 240;

TTF_Font* g_fontSmall = nullptr;
TTF_Font* g_fontMedium = nullptr;
TTF_Font* g_fontLarge = nullptr;
float g_loadedFontScale = 0.0f;

SDL_Rect g_lastGameDest{0, 0, 1920, 1080};
int g_lastCanvasW = 426;
int g_lastCanvasH = 240;

struct CachedText {
    SDL_Texture* tex = nullptr;
    int w = 0;
    int h = 0;
};
std::unordered_map<std::string, CachedText> g_textCache;

void clearTextCache() {
    for (auto& kv : g_textCache) {
        if (kv.second.tex) SDL_DestroyTexture(kv.second.tex);
    }
    g_textCache.clear();
}

int uiPx(int base720) {
    float sc = (g_loadedFontScale > 0.0f) ? g_loadedFontScale : 1.0f;
    return static_cast<int>(static_cast<float>(base720) * sc + 0.5f);
}

void ensureFontsForHeight(int outH) {
    float targetScale = std::clamp(static_cast<float>(outH) / 720.0f, 1.0f, 2.5f);
    if (g_fontSmall && g_loadedFontScale > 0.0f && std::fabs(targetScale - g_loadedFontScale) <= 0.2f) {
        return;
    }
    clearTextCache();
    if (g_fontSmall)  { TTF_CloseFont(g_fontSmall);  g_fontSmall = nullptr; }
    if (g_fontMedium) { TTF_CloseFont(g_fontMedium); g_fontMedium = nullptr; }
    if (g_fontLarge)  { TTF_CloseFont(g_fontLarge);  g_fontLarge = nullptr; }

    std::string fontPath = resolveRomfsPath("fonts/ui.ttf");
    if (!fileExists(fontPath)) fontPath = resolveRomfsPath("ui.ttf");
    g_loadedFontScale = targetScale;
    g_fontSmall  = TTF_OpenFont(fontPath.c_str(), static_cast<int>(16.0f * targetScale + 0.5f));
    g_fontMedium = TTF_OpenFont(fontPath.c_str(), static_cast<int>(22.0f * targetScale + 0.5f));
    g_fontLarge  = TTF_OpenFont(fontPath.c_str(), static_cast<int>(30.0f * targetScale + 0.5f));
}

CachedText getText(TTF_Font* font, const std::string& text, SDL_Color col, int sizeTag) {
    CachedText empty{};
    if (!font || text.empty()) return empty;
    char keyBuf[64];
    std::snprintf(keyBuf, sizeof(keyBuf), "%d_%02x%02x%02x%02x_", sizeTag, col.r, col.g, col.b, col.a);
    std::string key = std::string(keyBuf) + text;
    auto it = g_textCache.find(key);
    if (it != g_textCache.end()) return it->second;

    if (g_textCache.size() > 256) {
        clearTextCache();
    }
    SDL_Surface* surf = TTF_RenderUTF8_Blended(font, text.c_str(), col);
    if (!surf) return empty;
    SDL_Texture* tex = SDL_CreateTextureFromSurface(g_renderer, surf);
    CachedText ct{tex, surf->w, surf->h};
    SDL_FreeSurface(surf);
    auto res = g_textCache.emplace(std::move(key), ct);
    return res.first->second;
}

void drawText(TTF_Font* font, int sizeTag, const std::string& text, int x, int y, SDL_Color col, int align = 0) {
    CachedText ct = getText(font, text, col, sizeTag);
    if (!ct.tex) return;
    int dx = x;
    if (align == 1) dx -= ct.w / 2;
    else if (align == 2) dx -= ct.w;
    SDL_Rect dst{dx, y, ct.w, ct.h};
    SDL_RenderCopy(g_renderer, ct.tex, nullptr, &dst);
}

void fillRoundedBadge(int x, int y, int w, int h, SDL_Color fill, SDL_Color border) {
    SDL_Rect r{x, y, w, h};
    SDL_SetRenderDrawColor(g_renderer, fill.r, fill.g, fill.b, fill.a);
    SDL_RenderFillRect(g_renderer, &r);
    SDL_SetRenderDrawColor(g_renderer, border.r, border.g, border.b, border.a);
    SDL_RenderDrawRect(g_renderer, &r);
}

void desiredPixelTarget(DisplayScaleMode mode, int& reqW, int& reqH) {
    if (mode == DisplayScaleMode::NATIVE_8X) {
        reqW = g_origW * 8;
        reqH = g_origH * 8;
    } else {
        reqW = 1920;
        reqH = 1080;
    }
}

void computeFittedWindowSize(int reqPixW, int reqPixH, int dispIdx, float hiDpiScale, int& winW, int& winH) {
    SDL_Rect usable{0, 0, 1920, 1080};
    if (SDL_GetDisplayUsableBounds(std::max(0, dispIdx), &usable) != 0 || usable.w <= 0 || usable.h <= 0) {
        usable.w = 1920;
        usable.h = 1080;
    }
    const float sc = (hiDpiScale > 0.5f) ? hiDpiScale : 1.0f;
    float ptW = static_cast<float>(reqPixW) / sc;
    float ptH = static_cast<float>(reqPixH) / sc;
    // Scale down proportionally only if desired backing resolution exceeds host usable desktop
    const float maxW = static_cast<float>(std::max(640, usable.w));
    const float maxH = static_cast<float>(std::max(480, usable.h));
    if (ptW > maxW || ptH > maxH) {
        const float fit = std::min(maxW / ptW, maxH / ptH);
        ptW *= fit;
        ptH *= fit;
    }
    winW = std::max(320, static_cast<int>(std::lround(ptW)));
    winH = std::max(240, static_cast<int>(std::lround(ptH)));
}
} // namespace

void RenderSystem::setOriginalResolution(int origW, int origH) {
    if (origW > 0) g_origW = origW;
    if (origH > 0) g_origH = origH;
}

int RenderSystem::originalWidth() { return g_origW; }
int RenderSystem::originalHeight() { return g_origH; }

bool RenderSystem::init(const PortSettings& settings, const char* windowTitle) {
    if (IMG_Init(IMG_INIT_PNG | IMG_INIT_JPG) == 0) {
        CrashLogger::logf("[WARN] IMG_Init warning: %s", IMG_GetError());
    }
    if (TTF_Init() < 0) {
        CrashLogger::logf("[WARN] TTF_Init warning: %s", TTF_GetError());
    }

    int reqPixW = 1920, reqPixH = 1080;
    desiredPixelTarget(settings.scaleMode, reqPixW, reqPixH);
    int winW = reqPixW, winH = reqPixH;
    computeFittedWindowSize(reqPixW, reqPixH, 0, 1.0f, winW, winH);

    Uint32 winFlags = SDL_WINDOW_SHOWN | SDL_WINDOW_RESIZABLE | SDL_WINDOW_ALLOW_HIGHDPI;
    if (settings.fullscreen) winFlags |= SDL_WINDOW_FULLSCREEN_DESKTOP;

    g_window = SDL_CreateWindow(
        windowTitle ? windowTitle : "J2ME C++17 Desktop Port",
        SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED,
        winW, winH, winFlags
    );
    if (!g_window) {
        CrashLogger::logf("[ERR] SDL_CreateWindow failed: %s", SDL_GetError());
        return false;
    }

    g_renderer = SDL_CreateRenderer(g_window, -1, SDL_RENDERER_ACCELERATED | SDL_RENDERER_PRESENTVSYNC);
    const char* rendMode = "ACCEL_VSYNC";
    if (!g_renderer) {
        CrashLogger::logf("[WARN] Accelerated renderer failed (%s), falling back to software", SDL_GetError());
        g_renderer = SDL_CreateRenderer(g_window, -1, SDL_RENDERER_SOFTWARE);
        rendMode = "SOFTWARE";
    }
    if (!g_renderer) {
        CrashLogger::logf("[ERR] SDL_CreateRenderer failed: %s", SDL_GetError());
        return false;
    }
    SDL_SetRenderDrawBlendMode(g_renderer, SDL_BLENDMODE_BLEND);

    applyDisplaySettings(settings);
    ensureFontsForHeight(outputHeight());
    CrashLogger::logf("[GFX] orig=%dx%d output=%dx%d mode=%d renderer=%s fonts=(%d,%d,%d)",
                      g_origW, g_origH, outputWidth(), outputHeight(),
                      static_cast<int>(settings.scaleMode), rendMode,
                      g_fontSmall ? 1 : 0, g_fontMedium ? 1 : 0, g_fontLarge ? 1 : 0);
    return true;
}

void RenderSystem::shutdown() {
    clearTextCache();
    if (g_fontSmall)  { TTF_CloseFont(g_fontSmall);  g_fontSmall = nullptr; }
    if (g_fontMedium) { TTF_CloseFont(g_fontMedium); g_fontMedium = nullptr; }
    if (g_fontLarge)  { TTF_CloseFont(g_fontLarge);  g_fontLarge = nullptr; }
    g_loadedFontScale = 0.0f;
    if (g_gameTex)    { SDL_DestroyTexture(g_gameTex); g_gameTex = nullptr; }
    if (g_renderer)   { SDL_DestroyRenderer(g_renderer); g_renderer = nullptr; }
    if (g_window)     { SDL_DestroyWindow(g_window); g_window = nullptr; }
    TTF_Quit();
    IMG_Quit();
}

void RenderSystem::applyDisplaySettings(const PortSettings& settings) {
    if (!g_window) return;
    SDL_SetWindowFullscreen(g_window, settings.fullscreen ? SDL_WINDOW_FULLSCREEN_DESKTOP : 0);
    if (!settings.fullscreen) {
        int curWinW = 0, curWinH = 0;
        SDL_GetWindowSize(g_window, &curWinW, &curWinH);
        int outW = curWinW, outH = curWinH;
        if (g_renderer) SDL_GetRendererOutputSize(g_renderer, &outW, &outH);
        float hiDpiScale = (curWinH > 0) ? (static_cast<float>(outH) / static_cast<float>(curWinH)) : 1.0f;
        int reqPixW = 1920, reqPixH = 1080;
        desiredPixelTarget(settings.scaleMode, reqPixW, reqPixH);
        int targetWinW = reqPixW, targetWinH = reqPixH;
        computeFittedWindowSize(reqPixW, reqPixH, SDL_GetWindowDisplayIndex(g_window), hiDpiScale, targetWinW, targetWinH);
        SDL_SetWindowSize(g_window, targetWinW, targetWinH);
        SDL_SetWindowPosition(g_window, SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED);
    }
}

int RenderSystem::outputWidth() {
    int w = 1920, h = 1080;
    if (g_renderer) SDL_GetRendererOutputSize(g_renderer, &w, &h);
    return w;
}

int RenderSystem::outputHeight() {
    int w = 1920, h = 1080;
    if (g_renderer) SDL_GetRendererOutputSize(g_renderer, &w, &h);
    return h;
}

int RenderSystem::gameCanvasWidth(DisplayScaleMode mode) {
    if (mode == DisplayScaleMode::FHD_1920x1080) {
        int wideW = static_cast<int>(g_origH * 16.0 / 9.0) & ~1;
        return std::max(g_origW, wideW);
    }
    return g_origW;
}

int RenderSystem::gameCanvasHeight() {
    return g_origH;
}

void RenderSystem::beginFrame() {
    ensureFontsForHeight(outputHeight());
    SDL_SetRenderDrawColor(g_renderer, 0, 0, 0, 255);
    SDL_RenderClear(g_renderer);
}

void RenderSystem::drawGameFramebuffer(const uint32_t* argbPixels, int w, int h, DisplayScaleMode mode) {
    if (!g_renderer || !argbPixels || w <= 0 || h <= 0) return;

    if (!g_gameTex || g_texW != w || g_texH != h) {
        if (g_gameTex) SDL_DestroyTexture(g_gameTex);
        SDL_SetHint(SDL_HINT_RENDER_SCALE_QUALITY, "0"); // Crisp pixel art
        g_gameTex = SDL_CreateTexture(g_renderer, SDL_PIXELFORMAT_ARGB8888, SDL_TEXTUREACCESS_STREAMING, w, h);
        if (!g_gameTex) {
            CrashLogger::logf("[ERR] SDL_CreateTexture(%dx%d) failed: %s", w, h, SDL_GetError());
            g_texW = 0;
            g_texH = 0;
            return;
        }
        g_texW = w;
        g_texH = h;
    }

    SDL_UpdateTexture(g_gameTex, nullptr, argbPixels, w * sizeof(uint32_t));

    const int outW = outputWidth();
    const int outH = outputHeight();

    SDL_Rect dst{};
    if (mode == DisplayScaleMode::FHD_1920x1080) {
        dst = SDL_Rect{0, 0, outW, outH};
    } else if (mode == DisplayScaleMode::NATIVE_8X) {
        const int targetW = w * 8;
        const int targetH = h * 8;
        if (outW >= targetW && outH >= targetH) {
            dst.w = targetW;
            dst.h = targetH;
        } else {
            // Fit proportionally at crisp pixel scale if monitor output < 8x
            const int intScale = std::min(8, std::min(outW / w, outH / h));
            if (intScale >= 1 && (w * intScale * 1.0f / outW >= 0.85f || h * intScale * 1.0f / outH >= 0.85f)) {
                dst.w = w * intScale;
                dst.h = h * intScale;
            } else {
                const float s = std::min(static_cast<float>(outW) / w, static_cast<float>(outH) / h);
                dst.w = std::max(w, static_cast<int>(std::lround(w * s)));
                dst.h = std::max(h, static_cast<int>(std::lround(h * s)));
            }
        }
        dst.x = (outW - dst.w) / 2;
        dst.y = (outH - dst.h) / 2;
    } else {
        // FHD_ASPECT_FIT: preserve exact original aspect ratio inside 1920x1080
        const float s = std::min(static_cast<float>(outW) / w, static_cast<float>(outH) / h);
        dst.w = std::max(w, static_cast<int>(std::lround(w * s)));
        dst.h = std::max(h, static_cast<int>(std::lround(h * s)));
        dst.x = (outW - dst.w) / 2;
        dst.y = (outH - dst.h) / 2;
    }

    if (mode != DisplayScaleMode::FHD_1920x1080) {
        SDL_Rect frame{dst.x - 3, dst.y - 3, dst.w + 6, dst.h + 6};
        SDL_SetRenderDrawColor(g_renderer, 58, 72, 110, 210);
        SDL_RenderDrawRect(g_renderer, &frame);
    }

    g_lastGameDest = dst;
    g_lastCanvasW = w;
    g_lastCanvasH = h;
    SDL_RenderCopy(g_renderer, g_gameTex, nullptr, &dst);
}

void RenderSystem::drawHudPrompts(const std::vector<PromptItem>& prompts) {
    if (!g_renderer || !g_fontSmall || prompts.empty()) return;
    int outW = outputWidth();
    int outH = outputHeight();
    int barH = uiPx(34);
    SDL_Rect bar{0, outH - barH, outW, barH};
    SDL_SetRenderDrawBlendMode(g_renderer, SDL_BLENDMODE_BLEND);
    SDL_SetRenderDrawColor(g_renderer, 10, 14, 22, 180);
    SDL_RenderFillRect(g_renderer, &bar);
    SDL_SetRenderDrawColor(g_renderer, 65, 82, 118, 200);
    SDL_RenderDrawLine(g_renderer, 0, outH - barH, outW, outH - barH);

    int curX = uiPx(18);
    int badgeY = outH - barH + uiPx(5);
    int badgeH = uiPx(24);
    int yText = outH - barH + uiPx(7);
    for (const auto& p : prompts) {
        CachedText keyTxt = getText(g_fontSmall, p.key, SDL_Color{255, 255, 255, 255}, 1);
        CachedText lblTxt = getText(g_fontSmall, p.label, SDL_Color{232, 238, 248, 255}, 1);
        int bw = std::max(uiPx(28), keyTxt.w + uiPx(14));
        fillRoundedBadge(curX, badgeY, bw, badgeH, SDL_Color{38, 66, 112, 235}, SDL_Color{135, 185, 245, 220});
        drawText(g_fontSmall, 1, p.key, curX + bw / 2, yText, SDL_Color{255, 245, 210, 255}, 1);
        curX += bw + uiPx(6);
        drawText(g_fontSmall, 1, p.label, curX, yText, SDL_Color{232, 238, 248, 255}, 0);
        curX += lblTxt.w + uiPx(20);
        if (curX > outW - uiPx(120)) break;
    }
}

void RenderSystem::drawSpeedBadge(uint8_t speedMultiplier) {
    uint8_t spd = sanitizeSpeedMultiplier(speedMultiplier);
    if (!g_renderer || !g_fontSmall || spd <= 1) return;
    int outW = outputWidth();
    SDL_Color fill{25, 115, 175, 225}, border{120, 210, 255, 255};
    if (spd == 4) { fill = SDL_Color{185, 105, 20, 225}; border = SDL_Color{255, 195, 90, 255}; }
    else if (spd == 8) { fill = SDL_Color{175, 35, 85, 230}; border = SDL_Color{255, 130, 175, 255}; }
    char label[32];
    std::snprintf(label, sizeof(label), "SPEED x%u", static_cast<unsigned>(spd));
    CachedText ct = getText(g_fontSmall, label, SDL_Color{255, 255, 255, 255}, 1);
    int bw = std::max(uiPx(84), ct.w + uiPx(20));
    int bh = uiPx(26);
    int bx = outW - bw - uiPx(14);
    int by = uiPx(12);
    fillRoundedBadge(bx, by, bw, bh, fill, border);
    drawText(g_fontSmall, 1, label, bx + bw / 2, by + (bh - ct.h) / 2, SDL_Color{255, 255, 255, 255}, 1);
}

void RenderSystem::drawFpsCounter(float fps, bool smooth60Fps) {
    if (!g_renderer || !g_fontSmall) return;
    char label[48];
    int rounded = static_cast<int>(fps + 0.5f);
    std::snprintf(label, sizeof(label), "FPS: %d (%s)", rounded, smooth60Fps ? "60Hz" : "Gốc");
    CachedText ct = getText(g_fontSmall, label, SDL_Color{170, 255, 195, 255}, 1);
    int bw = std::max(uiPx(106), ct.w + uiPx(20));
    int bh = uiPx(26);
    fillRoundedBadge(uiPx(14), uiPx(12), bw, bh, SDL_Color{16, 26, 38, 215},
                     smooth60Fps ? SDL_Color{85, 210, 155, 240} : SDL_Color{195, 165, 85, 240});
    drawText(g_fontSmall, 1, label, uiPx(14) + bw / 2, uiPx(12) + (bh - ct.h) / 2, SDL_Color{190, 255, 210, 255}, 1);
}

void RenderSystem::drawOverlayView(const OverlayMenuView& view) {
    if (!view.open || !g_renderer || !g_fontSmall || !g_fontMedium) return;
    int outW = outputWidth();
    int outH = outputHeight();

    SDL_Rect dim{0, 0, outW, outH};
    SDL_SetRenderDrawBlendMode(g_renderer, SDL_BLENDMODE_BLEND);
    SDL_SetRenderDrawColor(g_renderer, 6, 8, 16, 215);
    SDL_RenderFillRect(g_renderer, &dim);

    const int boxW = std::min(outW - uiPx(60), uiPx(960));
    const int boxH = std::min(outH - uiPx(50), uiPx(610));
    const int bx = (outW - boxW) / 2;
    const int by = (outH - boxH) / 2;
    fillRoundedBadge(bx, by, boxW, boxH, SDL_Color{18, 24, 40, 250}, SDL_Color{95, 165, 250, 255});

    TTF_Font* titleFont = g_fontLarge ? g_fontLarge : g_fontMedium;
    drawText(titleFont, 3, view.title, outW / 2, by + uiPx(16), SDL_Color{255, 222, 105, 255}, 1);

    const int tabCount = static_cast<int>(view.tabs.size());
    const int tabY = by + uiPx(58);
    const int tabH = uiPx(34);
    if (tabCount > 0) {
        const int innerW = boxW - uiPx(48);
        const int gap = uiPx(8);
        const int tabW = (innerW - gap * (tabCount - 1)) / tabCount;
        for (int i = 0; i < tabCount; ++i) {
            int tx = bx + uiPx(24) + i * (tabW + gap);
            bool act = (i == view.activeTab);
            SDL_Color bg = act ? SDL_Color{48, 105, 195, 245} : SDL_Color{28, 36, 56, 235};
            SDL_Color bd = act ? SDL_Color{165, 215, 255, 255} : SDL_Color{70, 90, 130, 220};
            fillRoundedBadge(tx, tabY, tabW, tabH, bg, bd);
            drawText(g_fontSmall, 1, view.tabs[i], tx + tabW / 2, tabY + uiPx(7),
                     act ? SDL_Color{255, 255, 255, 255} : SDL_Color{175, 192, 220, 255}, 1);
        }
    }

    const int listTop = (tabCount > 0) ? (tabY + tabH + uiPx(14)) : (by + uiPx(66));
    const int footerH = uiPx(68);
    const int availListH = boxH - (listTop - by) - footerH;
    const int rowStep = uiPx(44);
    const int maxVis = std::max(1, availListH / rowStep);
    const int totalRows = static_cast<int>(view.rows.size());
    int startIdx = std::clamp(view.scrollTop, 0, std::max(0, totalRows - maxVis));
    if (view.selectedRow >= 0 && view.selectedRow < totalRows) {
        if (view.selectedRow < startIdx) startIdx = view.selectedRow;
        if (view.selectedRow >= startIdx + maxVis) startIdx = view.selectedRow - maxVis + 1;
    }

    for (int vis = 0; vis < maxVis && (startIdx + vis) < totalRows; ++vis) {
        int idx = startIdx + vis;
        const auto& row = view.rows[idx];
        int ry = listTop + vis * rowStep;
        bool sel = (idx == view.selectedRow);
        fillRoundedBadge(bx + uiPx(24), ry, boxW - uiPx(48), uiPx(38),
                         sel ? SDL_Color{45, 86, 165, 235} : SDL_Color{25, 32, 52, 180},
                         sel ? SDL_Color{140, 200, 255, 255} : SDL_Color{50, 65, 98, 180});
        SDL_Color lblCol = sel ? SDL_Color{255, 255, 255, 255} : SDL_Color{205, 218, 238, 255};
        drawText(g_fontMedium, 2, row.label, bx + uiPx(40), ry + uiPx(7), lblCol, 0);

        if (!row.value.empty()) {
            std::string valStr = row.adjustable ? ("< " + row.value + " >") : row.value;
            SDL_Color valCol = row.highlight
                ? SDL_Color{125, 245, 165, 255}
                : (sel ? SDL_Color{255, 225, 115, 255} : SDL_Color{165, 205, 250, 255});
            drawText(g_fontSmall, 1, valStr, bx + boxW - uiPx(42), ry + uiPx(9), valCol, 2);
        }
    }

    if (totalRows > maxVis) {
        char scBuf[32];
        std::snprintf(scBuf, sizeof(scBuf), "%d/%d", view.selectedRow + 1, totalRows);
        drawText(g_fontSmall, 1, scBuf, bx + boxW - uiPx(28), by + uiPx(24), SDL_Color{160, 185, 220, 255}, 2);
    }

    if (!view.statusBanner.empty()) {
        int sy = by + boxH - uiPx(68);
        fillRoundedBadge(bx + uiPx(24), sy, boxW - uiPx(48), uiPx(28), SDL_Color{24, 92, 68, 235}, SDL_Color{105, 235, 175, 255});
        drawText(g_fontSmall, 1, view.statusBanner, outW / 2, sy + uiPx(5), SDL_Color{230, 255, 240, 255}, 1);
    }
    drawText(g_fontSmall, 1, view.footerHint, outW / 2, by + boxH - uiPx(32), SDL_Color{165, 185, 220, 255}, 1);
}

void RenderSystem::drawPauseOverlay(const PauseMenuState& menu, const PortSettings& settings) {
    if (!menu.open || !g_renderer) return;
    int outW = outputWidth();
    int outH = outputHeight();

    SDL_Rect dim{0, 0, outW, outH};
    SDL_SetRenderDrawColor(g_renderer, 8, 10, 18, 215);
    SDL_RenderFillRect(g_renderer, &dim);

    int boxW = uiPx(780);
    int boxH = uiPx(610);
    int bx = (outW - boxW) / 2;
    int by = (outH - boxH) / 2;
    fillRoundedBadge(bx, by, boxW, boxH, SDL_Color{22, 28, 44, 250}, SDL_Color{90, 140, 230, 255});
    drawText(g_fontLarge, 3, "J2ME Desktop Port — Cài Đặt (Bàn Phím ĐT)", outW / 2, by + uiPx(16), SDL_Color{255, 220, 100, 255}, 1);

    if (!menu.inKeypadGuide) {
        const char* volNames[6] = {"Tắt (0%)", "20%", "40%", "60%", "80%", "100%"};
        const char* scaleLabel = "1920x1080 Toàn màn hình 16:9";
        char scale8x[64];
        if (settings.scaleMode == DisplayScaleMode::FHD_ASPECT_FIT) {
            scaleLabel = "1920x1080 Giữ tỉ lệ J2ME gốc";
        } else if (settings.scaleMode == DisplayScaleMode::NATIVE_8X) {
            std::snprintf(scale8x, sizeof(scale8x), "Tỉ lệ x8 Bản gốc (%dx%d)", g_origW * 8, g_origH * 8);
            scaleLabel = scale8x;
        }
        char speedBuf[64];
        std::snprintf(speedBuf, sizeof(speedBuf), "Tốc độ game: x%u  [F2]", static_cast<unsigned>(sanitizeSpeedMultiplier(settings.speedMultiplier)));

        std::vector<std::string> rows = {
            "Tiếp tục trò chơi",
            std::string("Hiển thị [F4]: ") + scaleLabel,
            std::string("Toàn màn hình [F11]: ") + (settings.fullscreen ? "Bật" : "Tắt"),
            std::string("Đồ họa: ") + (settings.highQuality ? "Cao (Đầy đủ hiệu ứng)" : "Cổ điển (Tối giản)"),
            std::string("Âm lượng nhạc nền: ") + volNames[settings.bgmVolume % 6],
            std::string("Thanh gợi ý phím ĐT: ") + (settings.showPrompts ? "Hiện" : "Ẩn"),
            std::string("Gán Numpad 2/4/6/8/5 -> Mũi tên/FIRE: ") + (settings.numpadMirrorDpad ? "Bật" : "Tắt (Phím số gốc)"),
            std::string(speedBuf),
            std::string("Chế độ mượt 60 FPS: ") + (settings.smooth60Fps ? "Bật (Mượt)" : "Tắt (FPS gốc)"),
            std::string("Hiện bộ đếm FPS [F12]: ") + (settings.showFps ? "Bật" : "Tắt"),
            "Mở Menu Cheat / Debug  [F3]...",
            "Hướng dẫn Bàn Phím Số Điện Thoại...",
            "Xem Nhật Ký Log & Thoát Game"
        };

        for (int i = 0; i < static_cast<int>(rows.size()); ++i) {
            int ry = by + uiPx(66) + i * uiPx(37);
            bool sel = (i == menu.selected);
            if (sel) {
                fillRoundedBadge(bx + uiPx(28), ry - uiPx(2), boxW - uiPx(56), uiPx(32), SDL_Color{50, 88, 168, 225}, SDL_Color{140, 195, 255, 255});
            }
            SDL_Color tc = sel ? SDL_Color{255, 255, 255, 255}
                               : (i == 10 ? SDL_Color{135, 245, 175, 255} : SDL_Color{190, 204, 228, 255});
            drawText(g_fontMedium, 2, rows[i], bx + uiPx(44), ry + uiPx(2), tc, 0);
        }
        drawText(g_fontSmall, 1, "Mũi tên: Chọn   |   Enter / Trái-Phải: Đổi   |   Esc / F1 / Backspace: Đóng", outW / 2, by + boxH - uiPx(32), SDL_Color{160, 178, 212, 255}, 1);
    } else {
        drawText(g_fontMedium, 2, "Sơ Đồ Bàn Phím Điện Thoại J2ME -> Bàn Phím PC", outW / 2, by + uiPx(68), SDL_Color{150, 210, 255, 255}, 1);
        const char* pairs[10][2] = {
            {"Mũi tên / W A S D", "Phím điều hướng D-Pad (-1 .. -4)"},
            {"Enter / Space / J", "Phím giữa / OK / Đánh (FIRE = -5)"},
            {"Q / [ / Tab",       "Phím mềm Trái (LSK = -6)"},
            {"E / ] / Backspace", "Phím mềm Phải / Quay lại (RSK = -7)"},
            {"0 .. 9 & Numpad",   "Phím số điện thoại 0..9 (48..57)"},
            {"* (Shift+8 / KP_*)", "Phím Sao * (42)"},
            {"# (Shift+3 / KP_+)", "Phím Thăng # (35)"},
            {"Esc / F1  |  F3",   "Menu Cài Đặt Port  |  Menu Cheat Debug"},
            {"F4  |  F11  |  F12", "Đổi 1920x1080 <-> x8 Gốc | Fullscreen | FPS"},
            {"F2",                "Tốc độ x1 / x2 / x4 / x8"}
        };
        for (int i = 0; i < 10; ++i) {
            int ry = by + uiPx(112) + i * uiPx(38);
            fillRoundedBadge(bx + uiPx(32), ry - uiPx(2), boxW - uiPx(64), uiPx(32), SDL_Color{28, 36, 56, 220}, SDL_Color{70, 90, 130, 200});
            drawText(g_fontSmall, 1, pairs[i][0], bx + uiPx(52), ry + uiPx(4), SDL_Color{255, 225, 120, 255}, 0);
            drawText(g_fontSmall, 1, pairs[i][1], bx + uiPx(270), ry + uiPx(4), SDL_Color{235, 240, 250, 255}, 0);
        }
        drawText(g_fontSmall, 1, "Enter / Backspace / Esc: Quay lại", outW / 2, by + boxH - uiPx(32), SDL_Color{160, 178, 212, 255}, 1);
    }
}

bool RenderSystem::runLogViewer(const PortSettings& settings, const std::string& title, bool isCrashPrompt) {
    if (!g_renderer) return true;
    std::vector<std::string> rawLines = CrashLogger::loadViewerLines(isCrashPrompt);
    std::vector<std::string> lines;
    for (const auto& line : rawLines) {
        if (line.size() <= 116) lines.push_back(line);
        else {
            for (size_t off = 0; off < line.size(); off += 116) lines.push_back(line.substr(off, 116));
        }
    }
    if (lines.empty()) lines.push_back("(Không có dữ liệu log)");

    int scroll = 0;
    bool keepRunning = true;
    bool resultContinue = true;
    while (keepRunning) {
        InputSystem::beginFrame();
        SDL_Event ev;
        while (SDL_PollEvent(&ev)) {
            if (ev.type == SDL_QUIT) { resultContinue = false; keepRunning = false; }
            InputSystem::handleSdlEvent(ev);
        }
        InputSystem::update(settings, getTicksMs());

        beginFrame();
        const int lineStep = uiPx(22);
        int outW = outputWidth();
        int outH = outputHeight();
        int bodyTop = uiPx(74);
        int bodyBottom = outH - uiPx(54);
        int visibleRows = std::max(5, (bodyBottom - bodyTop) / lineStep);
        int maxScroll = std::max(0, static_cast<int>(lines.size()) - visibleRows);

        if (InputSystem::isRepeated(Action::UP)) scroll = std::max(0, scroll - 1);
        if (InputSystem::isRepeated(Action::DOWN)) scroll = std::min(maxScroll, scroll + 1);
        if (InputSystem::justPressed(Action::LSK)) scroll = std::max(0, scroll - visibleRows);
        if (InputSystem::justPressed(Action::RSK)) scroll = std::min(maxScroll, scroll + visibleRows);
        if (InputSystem::justPressed(Action::FIRE) || InputSystem::justPressed(Action::PAUSE)) {
            if (isCrashPrompt) CrashLogger::clearUnreadCrash(false);
            resultContinue = true;
            keepRunning = false;
        } else if (InputSystem::justPressed(Action::CHEAT)) {
            CrashLogger::clearUnreadCrash(true);
            resultContinue = true;
            keepRunning = false;
        }

        SDL_Color hdrFill = isCrashPrompt ? SDL_Color{120, 26, 36, 245} : SDL_Color{24, 44, 86, 245};
        SDL_Color hdrBorder = isCrashPrompt ? SDL_Color{255, 110, 110, 255} : SDL_Color{110, 165, 255, 255};
        fillRoundedBadge(uiPx(16), uiPx(12), outW - uiPx(32), uiPx(48), hdrFill, hdrBorder);
        drawText(g_fontMedium, 2, title, uiPx(32), uiPx(22), SDL_Color{255, 245, 220, 255}, 0);
        fillRoundedBadge(uiPx(16), bodyTop - uiPx(6), outW - uiPx(32), bodyBottom - bodyTop + uiPx(10),
                         SDL_Color{14, 18, 28, 245}, SDL_Color{62, 80, 118, 255});

        for (int row = 0; row < visibleRows; ++row) {
            int idx = scroll + row;
            if (idx >= static_cast<int>(lines.size())) break;
            drawText(g_fontSmall, 1, lines[idx], uiPx(28), bodyTop + row * lineStep, SDL_Color{215, 225, 242, 255}, 0);
        }
        fillRoundedBadge(uiPx(16), outH - uiPx(42), outW - uiPx(32), uiPx(30), SDL_Color{20, 26, 40, 240}, SDL_Color{75, 95, 135, 255});
        drawText(g_fontSmall, 1, "[Enter / Esc] Vào game  |  [F3] Xóa crash.log cũ  |  [Mũi tên / Q / E] Cuộn", outW / 2, outH - uiPx(36), SDL_Color{185, 210, 245, 255}, 1);
        endFrame();
        SDL_Delay(16);
    }

    InputSystem::resetAllState();
    return resultContinue;
}

void RenderSystem::endFrame() {
    if (g_renderer) SDL_RenderPresent(g_renderer);
}

bool RenderSystem::windowToGameCoords(int winX, int winY, int& gameX, int& gameY) {
    if (g_lastGameDest.w <= 0 || g_lastGameDest.h <= 0) return false;
    int outX = winX, outY = winY;
    if (g_window && g_renderer) {
        int wW = 0, wH = 0, oW = 0, oH = 0;
        SDL_GetWindowSize(g_window, &wW, &wH);
        SDL_GetRendererOutputSize(g_renderer, &oW, &oH);
        if (wW > 0 && wH > 0) {
            outX = (winX * oW) / wW;
            outY = (winY * oH) / wH;
        }
    }
    if (outX < g_lastGameDest.x || outX >= g_lastGameDest.x + g_lastGameDest.w ||
        outY < g_lastGameDest.y || outY >= g_lastGameDest.y + g_lastGameDest.h) {
        return false;
    }
    gameX = (outX - g_lastGameDest.x) * g_lastCanvasW / g_lastGameDest.w;
    gameY = (outY - g_lastGameDest.y) * g_lastCanvasH / g_lastGameDest.h;
    return true;
}

SDL_Renderer* RenderSystem::renderer() { return g_renderer; }

} // namespace platform
