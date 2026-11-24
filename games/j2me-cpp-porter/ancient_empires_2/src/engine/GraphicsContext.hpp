#pragma once

#include "engine/Image.hpp"
#include "engine/Types.hpp"
#include <cstdint>
#include <string>

namespace engine {

class GraphicsContext {
public:
    GraphicsContext() = default;
    GraphicsContext(uint32_t* targetPixels, int width, int height);

    void setTarget(uint32_t* targetPixels, int width, int height);

    void translate(int dx, int dy) { tx_ += dx; ty_ += dy; }
    int getTranslateX() const { return tx_; }
    int getTranslateY() const { return ty_; }

    int width() const { return width_; }
    int height() const { return height_; }

    void setColor(int32_t rgb);
    void setColor(int r, int g, int b);
    int32_t getColor() const { return color_ & 0x00FFFFFF; }

    void setClip(int x, int y, int w, int h);
    void clipRect(int x, int y, int w, int h);
    void resetClip();
    int getClipX() const { return clipX_ - tx_; }
    int getClipY() const { return clipY_ - ty_; }
    int getClipWidth() const { return clipW_; }
    int getClipHeight() const { return clipH_; }

    void fillRect(int x, int y, int w, int h);
    void drawRect(int x, int y, int w, int h);
    void drawRoundRect(int x, int y, int w, int h, int arcW, int arcH);
    void fillRoundRect(int x, int y, int w, int h, int arcW, int arcH);
    void fillArc(int x, int y, int w, int h, int startAngle, int arcAngle);
    void drawLine(int x1, int y1, int x2, int y2);
    void plotPixel(int x, int y);

    void drawImage(const ImagePtr& img, int x, int y, int anchor);
    void drawScaledOpaque(const ImagePtr& img, int xDst, int yDst, int dstW, int dstH);
    void drawRegion(const ImagePtr& img, int xSrc, int ySrc, int w, int h, int transform, int xDst, int yDst, int anchor);
    void drawRGB(const int32_t* rgbData, int offset, int scanlength, int x, int y, int w, int h, bool processAlpha);

    void drawString(const std::u16string& str, int x, int y, int anchor);
    void drawString(const std::string& utf8, int x, int y, int anchor);

    static bool initSystemFonts();
    static void shutdownSystemFonts();
    void setFontId(int fontId) { fontId_ = (fontId == 1) ? 1 : 0; }
    int fontId() const { return fontId_; }
    static int fontHeight(int fontId);
    static int fontBaseline(int fontId);
    static int stringWidth(int fontId, const std::string& utf8);
    static int stringWidth(int fontId, const std::u16string& u16);

private:
    uint32_t* pixels_ = nullptr;
    int width_ = 0;
    int height_ = 0;
    int tx_ = 0;
    int ty_ = 0;
    uint32_t color_ = 0xFF000000u;
    int fontId_ = 0; // 0 = medium bold, 1 = small bold
    int clipX_ = 0;
    int clipY_ = 0;
    int clipW_ = 0;
    int clipH_ = 0;

    void applyAnchor(int& x, int& y, int w, int h, int anchor) const;
    void blendPixel(int x, int y, uint32_t argb);
};

} // namespace engine
