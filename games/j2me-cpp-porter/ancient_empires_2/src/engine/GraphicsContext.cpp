#include "engine/GraphicsContext.hpp"
#include "engine/BitmapFont.hpp"
#include "platform/Platform.hpp"

#include <SDL.h>
#include <SDL_ttf.h>
#include <algorithm>
#include <cmath>
#include <cstdlib>
#include <unordered_map>

namespace engine {

namespace {
inline uint32_t div255(uint32_t c) {
    return (c + 1u + (c >> 8)) >> 8;
}

inline uint32_t alphaOver(uint32_t dst, uint32_t src) {
    uint32_t a = src >> 24;
    if (a == 0) return dst;
    if (a == 255) return src;
    uint32_t inv = 255u - a;
    uint32_t sr = (src >> 16) & 0xFFu;
    uint32_t sg = (src >> 8) & 0xFFu;
    uint32_t sb = src & 0xFFu;
    uint32_t dr = (dst >> 16) & 0xFFu;
    uint32_t dg = (dst >> 8) & 0xFFu;
    uint32_t db = dst & 0xFFu;
    uint32_t rr = div255(sr * a + dr * inv);
    uint32_t rg = div255(sg * a + dg * inv);
    uint32_t rb = div255(sb * a + db * inv);
    return 0xFF000000u | (rr << 16) | (rg << 8) | rb;
}

inline void alphaBlendPixel(uint32_t& dst, uint32_t s) {
    uint32_t a = s >> 24;
    if (a == 255u) {
        dst = s;
    } else if (a > 0u) {
        dst = alphaOver(dst, s);
    }
}
} // namespace

GraphicsContext::GraphicsContext(uint32_t* targetPixels, int width, int height) {
    setTarget(targetPixels, width, height);
}

void GraphicsContext::setTarget(uint32_t* targetPixels, int width, int height) {
    pixels_ = targetPixels;
    width_ = width;
    height_ = height;
    tx_ = 0;
    ty_ = 0;
    resetClip();
}

void GraphicsContext::setColor(int32_t rgb) {
    color_ = 0xFF000000u | (static_cast<uint32_t>(rgb) & 0x00FFFFFFu);
}

void GraphicsContext::setColor(int r, int g, int b) {
    uint32_t rr = static_cast<uint32_t>(std::clamp(r, 0, 255));
    uint32_t gg = static_cast<uint32_t>(std::clamp(g, 0, 255));
    uint32_t bb = static_cast<uint32_t>(std::clamp(b, 0, 255));
    color_ = 0xFF000000u | (rr << 16) | (gg << 8) | bb;
}

void GraphicsContext::setClip(int x, int y, int w, int h) {
    x += tx_;
    y += ty_;
    int x0 = std::max(0, x);
    int y0 = std::max(0, y);
    int x1 = std::min(width_, x + std::max(0, w));
    int y1 = std::min(height_, y + std::max(0, h));
    clipX_ = x0;
    clipY_ = y0;
    clipW_ = std::max(0, x1 - x0);
    clipH_ = std::max(0, y1 - y0);
}

void GraphicsContext::clipRect(int x, int y, int w, int h) {
    x += tx_;
    y += ty_;
    int x0 = std::max(clipX_, x);
    int y0 = std::max(clipY_, y);
    int x1 = std::min(clipX_ + clipW_, x + std::max(0, w));
    int y1 = std::min(clipY_ + clipH_, y + std::max(0, h));
    clipX_ = x0;
    clipY_ = y0;
    clipW_ = std::max(0, x1 - x0);
    clipH_ = std::max(0, y1 - y0);
}

void GraphicsContext::resetClip() {
    clipX_ = 0;
    clipY_ = 0;
    clipW_ = width_;
    clipH_ = height_;
}

void GraphicsContext::plotPixel(int x, int y) {
    if (!pixels_) return;
    x += tx_;
    y += ty_;
    if (x < clipX_ || x >= clipX_ + clipW_ || y < clipY_ || y >= clipY_ + clipH_) return;
    pixels_[static_cast<size_t>(y) * width_ + x] = color_;
}

void GraphicsContext::blendPixel(int x, int y, uint32_t argb) {
    if (!pixels_) return;
    x += tx_;
    y += ty_;
    if (x < clipX_ || x >= clipX_ + clipW_ || y < clipY_ || y >= clipY_ + clipH_) return;
    uint32_t& dst = pixels_[static_cast<size_t>(y) * width_ + x];
    dst = alphaOver(dst, argb);
}

void GraphicsContext::fillRect(int x, int y, int w, int h) {
    if (!pixels_ || w <= 0 || h <= 0) return;
    x += tx_;
    y += ty_;
    int x0 = std::max(clipX_, x);
    int y0 = std::max(clipY_, y);
    int x1 = std::min(clipX_ + clipW_, x + w);
    int y1 = std::min(clipY_ + clipH_, y + h);
    if (x0 >= x1 || y0 >= y1) return;
    for (int py = y0; py < y1; ++py) {
        uint32_t* row = pixels_ + static_cast<size_t>(py) * width_;
        std::fill(row + x0, row + x1, color_);
    }
}

void GraphicsContext::drawRect(int x, int y, int w, int h) {
    if (w < 0 || h < 0) return;
    drawLine(x, y, x + w, y);
    drawLine(x, y + h, x + w, y + h);
    drawLine(x, y, x, y + h);
    drawLine(x + w, y, x + w, y + h);
}

void GraphicsContext::drawRoundRect(int x, int y, int w, int h, int arcW, int arcH) {
    if (w < 0 || h < 0) return;
    int r = std::min({arcW / 2, arcH / 2, w / 2, h / 2});
    if (r <= 1) {
        drawRect(x, y, w, h);
        return;
    }
    drawLine(x + r, y, x + w - r, y);
    drawLine(x + r, y + h, x + w - r, y + h);
    drawLine(x, y + r, x, y + h - r);
    drawLine(x + w, y + r, x + w, y + h - r);
    for (int a = 0; a <= 90; a += 5) {
        double rad = a * 3.141592653589793 / 180.0;
        int dx = static_cast<int>(std::round(std::cos(rad) * r));
        int dy = static_cast<int>(std::round(std::sin(rad) * r));
        plotPixel(x + r - dx, y + r - dy);
        plotPixel(x + w - r + dx, y + r - dy);
        plotPixel(x + r - dx, y + h - r + dy);
        plotPixel(x + w - r + dx, y + h - r + dy);
    }
}

void GraphicsContext::fillRoundRect(int x, int y, int w, int h, int arcW, int arcH) {
    if (w <= 0 || h <= 0) return;
    int r = std::min({arcW / 2, arcH / 2, w / 2, h / 2});
    if (r <= 1) {
        fillRect(x, y, w, h);
        return;
    }
    fillRect(x, y + r, w, h - 2 * r);
    for (int dy = 0; dy < r; ++dy) {
        int cy = r - dy;
        int dx = static_cast<int>(std::floor(std::sqrt(static_cast<double>(r * r - cy * cy))));
        int spanX = x + (r - dx);
        int spanW = w - 2 * (r - dx);
        fillRect(spanX, y + dy, spanW, 1);
        fillRect(spanX, y + h - 1 - dy, spanW, 1);
    }
}

void GraphicsContext::fillArc(int x, int y, int w, int h, int startAngle, int arcAngle) {
    if (!pixels_ || w <= 0 || h <= 0 || arcAngle == 0) return;
    x += tx_;
    y += ty_;
    double rx = w * 0.5;
    double ry = h * 0.5;
    double cx = x + rx;
    double cy = y + ry;
    bool fullCircle = std::abs(arcAngle) >= 360;

    int x0 = std::max(clipX_, x);
    int y0 = std::max(clipY_, y);
    int x1 = std::min(clipX_ + clipW_, x + w);
    int y1 = std::min(clipY_ + clipH_, y + h);

    double sDeg = std::fmod(static_cast<double>(startAngle), 360.0);
    if (sDeg < 0) sDeg += 360.0;
    double eDeg = sDeg + arcAngle;

    for (int py = y0; py < y1; ++py) {
        double ny = (py + 0.5 - cy) / ry;
        double ny2 = ny * ny;
        if (ny2 > 1.0) continue;
        for (int px = x0; px < x1; ++px) {
            double nx = (px + 0.5 - cx) / rx;
            if (nx * nx + ny2 > 1.0) continue;
            if (!fullCircle) {
                double ang = std::atan2(-ny, nx) * 180.0 / 3.141592653589793;
                if (ang < 0) ang += 360.0;
                bool inside = false;
                if (arcAngle > 0) {
                    double d = std::fmod(ang - sDeg + 360.0, 360.0);
                    inside = (d <= arcAngle);
                } else {
                    double d = std::fmod(sDeg - ang + 360.0, 360.0);
                    inside = (d <= -arcAngle);
                }
                if (!inside) continue;
                (void)eDeg;
            }
            pixels_[static_cast<size_t>(py) * width_ + px] = color_;
        }
    }
}

void GraphicsContext::drawLine(int x1, int y1, int x2, int y2) {
    if (x1 == x2 && y1 == y2) {
        plotPixel(x1, y1);
        return;
    }
    int dx = std::abs(x2 - x1);
    int sx = x1 < x2 ? 1 : -1;
    int dy = -std::abs(y2 - y1);
    int sy = y1 < y2 ? 1 : -1;
    int err = dx + dy;
    while (true) {
        plotPixel(x1, y1);
        if (x1 == x2 && y1 == y2) break;
        int e2 = err * 2;
        if (e2 >= dy) {
            err += dy;
            x1 += sx;
        }
        if (e2 <= dx) {
            err += dx;
            y1 += sy;
        }
    }
}

void GraphicsContext::applyAnchor(int& x, int& y, int w, int h, int anchor) const {
    if (anchor == 0) anchor = TOP | LEFT;
    if (anchor & HCENTER) x -= w / 2;
    else if (anchor & RIGHT) x -= w;

    if (anchor & VCENTER) y -= h / 2;
    else if (anchor & BOTTOM) y -= h;
    else if (anchor & BASELINE) y -= h;
}

void GraphicsContext::drawImage(const ImagePtr& img, int x, int y, int anchor) {
    if (!img || !img->isValid()) return;
    drawRegion(img, 0, 0, img->getWidth(), img->getHeight(), TRANS_NONE, x, y, anchor);
}

void GraphicsContext::drawScaledOpaque(const ImagePtr& img, int xDst, int yDst, int dstW, int dstH) {
    if (!pixels_ || !img || !img->isValid() || dstW <= 0 || dstH <= 0) return;
    const int srcW = img->getWidth();
    const int srcH = img->getHeight();
    if (srcW <= 0 || srcH <= 0) return;

    if (srcW == dstW && srcH == dstH) {
        drawRegion(img, 0, 0, srcW, srcH, TRANS_NONE, xDst, yDst, TOP | LEFT);
        return;
    }

    xDst += tx_;
    yDst += ty_;
    const int x0 = std::max(clipX_, xDst);
    const int y0 = std::max(clipY_, yDst);
    const int x1 = std::min(clipX_ + clipW_, xDst + dstW);
    const int y1 = std::min(clipY_ + clipH_, yDst + dstH);
    if (x0 >= x1 || y0 >= y1) return;

    const int spanW = x1 - x0;
    std::vector<int> xMap(static_cast<size_t>(spanW));
    for (int i = 0; i < spanW; ++i) {
        int sx = ((x0 + i - xDst) * srcW) / dstW;
        xMap[static_cast<size_t>(i)] = std::clamp(sx, 0, srcW - 1);
    }

    const uint32_t* srcPix = img->data();
    for (int py = y0; py < y1; ++py) {
        int sy = std::clamp(((py - yDst) * srcH) / dstH, 0, srcH - 1);
        const uint32_t* sRow = srcPix + static_cast<size_t>(sy) * srcW;
        uint32_t* dRow = pixels_ + static_cast<size_t>(py) * width_ + x0;
        for (int i = 0; i < spanW; ++i) {
            dRow[i] = sRow[xMap[static_cast<size_t>(i)]];
        }
    }
}

void GraphicsContext::drawRegion(const ImagePtr& img, int xSrc, int ySrc, int w, int h, int transform, int xDst, int yDst, int anchor) {
    if (!pixels_ || !img || !img->isValid() || w <= 0 || h <= 0) return;

    int imgW = img->getWidth();
    int imgH = img->getHeight();
    if (xSrc < 0 || ySrc < 0 || xSrc + w > imgW || ySrc + h > imgH) {
        // Clamp defensively
        if (xSrc < 0) { w += xSrc; xSrc = 0; }
        if (ySrc < 0) { h += ySrc; ySrc = 0; }
        if (xSrc + w > imgW) w = imgW - xSrc;
        if (ySrc + h > imgH) h = imgH - ySrc;
        if (w <= 0 || h <= 0) return;
    }

    bool swapWH = (transform == TRANS_ROT90 || transform == TRANS_ROT270 ||
                   transform == TRANS_MIRROR_ROT90 || transform == TRANS_MIRROR_ROT270);
    int dstW = swapWH ? h : w;
    int dstH = swapWH ? w : h;
    xDst += tx_;
    yDst += ty_;
    applyAnchor(xDst, yDst, dstW, dstH, anchor);

    int x0 = std::max(clipX_, xDst);
    int y0 = std::max(clipY_, yDst);
    int x1 = std::min(clipX_ + clipW_, xDst + dstW);
    int y1 = std::min(clipY_ + clipH_, yDst + dstH);
    if (x0 >= x1 || y0 >= y1) return;

    const uint32_t* srcPix = img->data();
    ptrdiff_t colStep = 1;
    ptrdiff_t rowStep = imgW;
    int sx0 = 0;
    int sy0 = 0;
    switch (transform) {
        case TRANS_NONE:          sx0 = 0;     sy0 = 0;     colStep = 1;     rowStep = imgW;  break;
        case TRANS_MIRROR_ROT180: sx0 = 0;     sy0 = h - 1; colStep = 1;     rowStep = -imgW; break;
        case TRANS_MIRROR:        sx0 = w - 1; sy0 = 0;     colStep = -1;    rowStep = imgW;  break;
        case TRANS_ROT180:        sx0 = w - 1; sy0 = h - 1; colStep = -1;    rowStep = -imgW; break;
        case TRANS_MIRROR_ROT270: sx0 = 0;     sy0 = 0;     colStep = imgW;  rowStep = 1;     break;
        case TRANS_ROT90:         sx0 = 0;     sy0 = h - 1; colStep = -imgW; rowStep = 1;     break;
        case TRANS_ROT270:        sx0 = w - 1; sy0 = 0;     colStep = imgW;  rowStep = -1;    break;
        case TRANS_MIRROR_ROT90:  sx0 = w - 1; sy0 = h - 1; colStep = -imgW; rowStep = -1;    break;
        default: break;
    }

    const ptrdiff_t baseIdx = static_cast<ptrdiff_t>(ySrc + sy0) * imgW + (xSrc + sx0);
    const ptrdiff_t dxStart = static_cast<ptrdiff_t>(x0 - xDst);
    const int spanW = x1 - x0;
    if (colStep == 1) {
        const ptrdiff_t dxOffset = baseIdx + dxStart;
        for (int py = y0; py < y1; ++py) {
            const uint32_t* sRow = srcPix + dxOffset + static_cast<ptrdiff_t>(py - yDst) * rowStep;
            uint32_t* dRow = pixels_ + static_cast<size_t>(py) * width_ + x0;
            for (int i = 0; i < spanW; ++i) {
                alphaBlendPixel(dRow[i], sRow[i]);
            }
        }
    } else {
        for (int py = y0; py < y1; ++py) {
            ptrdiff_t sIdx = baseIdx + static_cast<ptrdiff_t>(py - yDst) * rowStep + dxStart * colStep;
            uint32_t* dRow = pixels_ + static_cast<size_t>(py) * width_ + x0;
            for (int i = 0; i < spanW; ++i) {
                alphaBlendPixel(dRow[i], srcPix[sIdx]);
                sIdx += colStep;
            }
        }
    }
}

void GraphicsContext::drawRGB(const int32_t* rgbData, int offset, int scanlength, int x, int y, int w, int h, bool processAlpha) {
    if (!pixels_ || !rgbData || w <= 0 || h <= 0) return;
    x += tx_;
    y += ty_;
    int x0 = std::max(clipX_, x);
    int y0 = std::max(clipY_, y);
    int x1 = std::min(clipX_ + clipW_, x + w);
    int y1 = std::min(clipY_ + clipH_, y + h);
    if (x0 >= x1 || y0 >= y1) return;

    for (int py = y0; py < y1; ++py) {
        int sy = py - y;
        const int32_t* srcRow = rgbData + offset + sy * scanlength;
        uint32_t* dstRow = pixels_ + static_cast<size_t>(py) * width_;
        for (int px = x0; px < x1; ++px) {
            int sx = px - x;
            uint32_t s = static_cast<uint32_t>(srcRow[sx]);
            if (!processAlpha) {
                dstRow[px] = 0xFF000000u | (s & 0x00FFFFFFu);
            } else {
                uint32_t a = s >> 24;
                if (a == 255) dstRow[px] = s;
                else if (a > 0) dstRow[px] = alphaOver(dstRow[px], s);
            }
        }
    }
}

namespace {
TTF_Font* g_sysFonts[2] = {nullptr, nullptr};
bool g_sysFontsReady = false;

struct CachedGlyphRun {
    int w = 0;
    int h = 0;
    std::vector<uint8_t> alpha;
};
std::unordered_map<std::string, CachedGlyphRun> g_runCache;

const CachedGlyphRun* getGlyphRun(int fontId, const std::string& utf8) {
    if (!g_sysFontsReady || utf8.empty()) return nullptr;
    TTF_Font* f = g_sysFonts[fontId == 1 ? 1 : 0];
    if (!f) return nullptr;
    std::string key;
    key.reserve(utf8.size() + 2);
    key.push_back(fontId == 1 ? '1' : '0');
    key.push_back(':');
    key.append(utf8);
    auto it = g_runCache.find(key);
    if (it != g_runCache.end()) return &it->second;
    if (g_runCache.size() > 512) g_runCache.clear();

    SDL_Color white{255, 255, 255, 255};
    SDL_Surface* surf = TTF_RenderUTF8_Blended(f, utf8.c_str(), white);
    if (!surf) return nullptr;
    SDL_Surface* conv = SDL_ConvertSurfaceFormat(surf, SDL_PIXELFORMAT_ARGB8888, 0);
    SDL_FreeSurface(surf);
    if (!conv) return nullptr;

    CachedGlyphRun run;
    run.w = conv->w;
    run.h = conv->h;
    run.alpha.resize(static_cast<size_t>(run.w) * run.h);
    const uint8_t* src = static_cast<const uint8_t*>(conv->pixels);
    for (int y = 0; y < conv->h; ++y) {
        const uint32_t* row = reinterpret_cast<const uint32_t*>(src + y * conv->pitch);
        for (int x = 0; x < conv->w; ++x) {
            run.alpha[static_cast<size_t>(y) * run.w + x] = static_cast<uint8_t>(row[x] >> 24);
        }
    }
    SDL_FreeSurface(conv);
    auto res = g_runCache.emplace(std::move(key), std::move(run));
    return &res.first->second;
}
} // namespace

bool GraphicsContext::initSystemFonts() {
    if (g_sysFontsReady) return true;
    if (!TTF_WasInit() && TTF_Init() < 0) return false;
    std::string fontPath = platform::resolveRomfsPath("fonts/ui.ttf");
    if (!platform::fileExists(fontPath)) fontPath = platform::resolveRomfsPath("ui.ttf");
    g_sysFonts[0] = TTF_OpenFont(fontPath.c_str(), 12);
    g_sysFonts[1] = TTF_OpenFont(fontPath.c_str(), 10);
    if (g_sysFonts[0]) TTF_SetFontStyle(g_sysFonts[0], TTF_STYLE_BOLD);
    if (g_sysFonts[1]) TTF_SetFontStyle(g_sysFonts[1], TTF_STYLE_BOLD);
    g_sysFontsReady = (g_sysFonts[0] != nullptr || g_sysFonts[1] != nullptr);
    return g_sysFontsReady;
}

void GraphicsContext::shutdownSystemFonts() {
    g_runCache.clear();
    for (int i = 0; i < 2; ++i) {
        if (g_sysFonts[i]) {
            TTF_CloseFont(g_sysFonts[i]);
            g_sysFonts[i] = nullptr;
        }
    }
    g_sysFontsReady = false;
}

int GraphicsContext::fontHeight(int fontId) {
    TTF_Font* f = g_sysFonts[fontId == 1 ? 1 : 0];
    if (f) return TTF_FontHeight(f);
    return (fontId == 1) ? 12 : 14;
}

int GraphicsContext::fontBaseline(int fontId) {
    TTF_Font* f = g_sysFonts[fontId == 1 ? 1 : 0];
    if (f) return TTF_FontAscent(f);
    return (fontId == 1) ? 10 : 12;
}

int GraphicsContext::stringWidth(int fontId, const std::string& utf8) {
    if (utf8.empty()) return 0;
    TTF_Font* f = g_sysFonts[fontId == 1 ? 1 : 0];
    if (!f) return static_cast<int>(utf8.size()) * ((fontId == 1) ? 6 : 7);
    int w = 0, h = 0;
    if (TTF_SizeUTF8(f, utf8.c_str(), &w, &h) == 0) return w;
    return static_cast<int>(utf8.size()) * 6;
}

int GraphicsContext::stringWidth(int fontId, const std::u16string& u16) {
    return stringWidth(fontId, platform::u16ToUtf8(u16));
}

void GraphicsContext::drawString(const std::u16string& str, int x, int y, int anchor) {
    drawString(platform::u16ToUtf8(str), x, y, anchor);
}

void GraphicsContext::drawString(const std::string& utf8, int x, int y, int anchor) {
    if (!pixels_ || utf8.empty()) return;
    if (g_sysFontsReady) {
        const CachedGlyphRun* run = getGlyphRun(fontId_, utf8);
        if (!run || run->w <= 0 || run->h <= 0) return;
        int dx = x;
        int dy = y;
        if ((anchor & HCENTER) != 0) dx -= run->w / 2;
        else if ((anchor & RIGHT) != 0) dx -= run->w;
        if ((anchor & BOTTOM) != 0) dy -= run->h;
        else if ((anchor & BASELINE) != 0) dy -= fontBaseline(fontId_);
        else if ((anchor & VCENTER) != 0) dy -= run->h / 2;

        dx += tx_;
        dy += ty_;
        int x0 = std::max(clipX_, dx);
        int y0 = std::max(clipY_, dy);
        int x1 = std::min(clipX_ + clipW_, dx + run->w);
        int y1 = std::min(clipY_ + clipH_, dy + run->h);
        if (x0 >= x1 || y0 >= y1) return;

        uint32_t rgb = color_ & 0x00FFFFFFu;
        for (int py = y0; py < y1; ++py) {
            const uint8_t* aRow = run->alpha.data() + static_cast<size_t>(py - dy) * run->w + (x0 - dx);
            uint32_t* dRow = pixels_ + static_cast<size_t>(py) * width_ + x0;
            for (int px = 0; px < (x1 - x0); ++px) {
                uint8_t a = aRow[px];
                if (a >= 32) {
                    if (a >= 240) {
                        dRow[px] = 0xFF000000u | rgb;
                    } else {
                        dRow[px] = alphaOver(dRow[px], (static_cast<uint32_t>(a) << 24) | rgb);
                    }
                }
            }
        }
        return;
    }
    BitmapFont::drawAnchored(*this, platform::utf8ToU16(utf8), x, y, anchor);
}

} // namespace engine
