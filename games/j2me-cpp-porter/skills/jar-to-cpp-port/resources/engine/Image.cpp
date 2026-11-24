#include "engine/Image.hpp"
#include "engine/GraphicsContext.hpp"
#include "platform/Platform.hpp"

#include <SDL.h>
#include <SDL_image.h>
#include <algorithm>
#include <cstdio>

namespace engine {

Image::Image(int w, int h, bool mutableImg)
    : width_(w), height_(h), mutable_(mutableImg), pixels_(static_cast<size_t>(std::max(0, w)) * std::max(0, h), 0xFFFFFFFFu) {
}

ImagePtr Image::createMutable(int w, int h) {
    if (w <= 0 || h <= 0) {
        return std::make_shared<Image>(1, 1, true);
    }
    return std::make_shared<Image>(w, h, true);
}

ImagePtr Image::createFromRomfs(const std::string& relPath) {
    std::string path = platform::resolveRomfsPath(relPath);
    SDL_Surface* loaded = IMG_Load(path.c_str());
    if (!loaded) {
        std::fprintf(stderr, "IMG_Load failed for %s: %s\n", path.c_str(), IMG_GetError());
        return std::make_shared<Image>(1, 1, false);
    }

    SDL_Surface* conv = SDL_ConvertSurfaceFormat(loaded, SDL_PIXELFORMAT_ARGB8888, 0);
    SDL_FreeSurface(loaded);
    if (!conv) {
        return std::make_shared<Image>(1, 1, false);
    }

    auto img = std::make_shared<Image>();
    img->width_ = conv->w;
    img->height_ = conv->h;
    img->mutable_ = false;
    img->pixels_.resize(static_cast<size_t>(conv->w) * conv->h);
    const uint8_t* srcBytes = static_cast<const uint8_t*>(conv->pixels);
    for (int y = 0; y < conv->h; ++y) {
        const uint32_t* row = reinterpret_cast<const uint32_t*>(srcBytes + y * conv->pitch);
        std::copy(row, row + conv->w, img->pixels_.data() + static_cast<size_t>(y) * conv->w);
    }
    SDL_FreeSurface(conv);
    return img;
}

ImagePtr Image::createRGBImage(const int32_t* argb, int w, int h, bool processAlpha) {
    if (!argb || w <= 0 || h <= 0) {
        return std::make_shared<Image>(1, 1, false);
    }
    auto img = std::make_shared<Image>();
    img->width_ = w;
    img->height_ = h;
    img->mutable_ = false;
    img->pixels_.resize(static_cast<size_t>(w) * h);
    for (size_t i = 0; i < img->pixels_.size(); ++i) {
        uint32_t p = static_cast<uint32_t>(argb[i]);
        img->pixels_[i] = processAlpha ? p : (0xFF000000u | (p & 0x00FFFFFFu));
    }
    return img;
}

void Image::getRGB(int32_t* out, int offset, int scanlength, int x, int y, int w, int h) const {
    if (!out || w <= 0 || h <= 0) return;
    for (int ry = 0; ry < h; ++ry) {
        int sy = y + ry;
        if (sy < 0 || sy >= height_) continue;
        for (int rx = 0; rx < w; ++rx) {
            int sx = x + rx;
            if (sx < 0 || sx >= width_) continue;
            out[offset + ry * scanlength + rx] = static_cast<int32_t>(pixels_[static_cast<size_t>(sy) * width_ + sx]);
        }
    }
}

GraphicsContext Image::getGraphics() {
    return GraphicsContext(pixels_.data(), width_, height_);
}

} // namespace engine
