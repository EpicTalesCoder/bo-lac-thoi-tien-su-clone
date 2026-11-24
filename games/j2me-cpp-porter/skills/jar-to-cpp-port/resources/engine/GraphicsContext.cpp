#include "engine/GraphicsContext.hpp"
#include "engine/BitmapFont.hpp"
#include "platform/Platform.hpp"

#include <algorithm>
#include <cmath>
#include <cstdlib>

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

void GraphicsContext::drawString(const std::u16string& str, int x, int y, int anchor) {
    BitmapFont::drawAnchored(*this, str, x, y, anchor);
}

void GraphicsContext::drawString(const std::string& utf8, int x, int y, int anchor) {
    BitmapFont::drawAnchored(*this, platform::utf8ToU16(utf8), x, y, anchor);
}

} // namespace engine
