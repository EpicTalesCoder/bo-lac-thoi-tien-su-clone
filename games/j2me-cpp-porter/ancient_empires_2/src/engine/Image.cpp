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

ImagePtr Image::createFromMemory(const uint8_t* data, size_t len) {
    if (!data || len == 0) {
        return std::make_shared<Image>(1, 1, false);
    }
    SDL_RWops* rw = SDL_RWFromConstMem(data, static_cast<int>(len));
    if (!rw) {
        return std::make_shared<Image>(1, 1, false);
    }
    SDL_Surface* loaded = IMG_Load_RW(rw, 1);
    if (!loaded) {
        std::fprintf(stderr, "IMG_Load_RW failed: %s\n", IMG_GetError());
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

ImagePtr Image::cloneWithTeamPalette(int teamId) const {
    auto img = std::make_shared<Image>();
    img->width_ = width_;
    img->height_ = height_;
    img->mutable_ = mutable_;
    img->pixels_ = pixels_;
    if (teamId == 1) {
        return img;
    }
    static constexpr uint8_t kPal[5][4][3] = {
        {{0, 0, 0}, {0, 0, 0}, {0, 0, 0}, {0, 0, 0}},
        {{150, 217, 244}, {65, 149, 233}, {0, 100, 198}, {12, 53, 112}},
        {{244, 158, 156}, {219, 36, 113}, {161, 0, 112}, {95, 5, 120}},
        {{171, 237, 90}, {99, 190, 37}, {0, 153, 55}, {0, 85, 82}},
        {{0, 118, 150}, {0, 65, 114}, {0, 43, 75}, {0, 22, 48}},
    };
    for (uint32_t& px : img->pixels_) {
        uint32_t a = px & 0xFF000000u;
        if (a == 0) continue;
        uint8_t r = static_cast<uint8_t>((px >> 16) & 0xFF);
        uint8_t g = static_cast<uint8_t>((px >> 8) & 0xFF);
        uint8_t b = static_cast<uint8_t>(px & 0xFF);
        if (teamId == 0) {
            if (r != 244 || g != 244 || b != 230) {
                uint8_t gray = static_cast<uint8_t>((static_cast<int>(r) + g + b) / 3);
                px = a | (static_cast<uint32_t>(gray) << 16) | (static_cast<uint32_t>(gray) << 8) | gray;
            }
        } else if (teamId >= 2 && teamId <= 4) {
            for (int k = 0; k < 4; ++k) {
                if (r == kPal[1][k][0] && g == kPal[1][k][1] && b == kPal[1][k][2]) {
                    px = a | (static_cast<uint32_t>(kPal[teamId][k][0]) << 16) |
                             (static_cast<uint32_t>(kPal[teamId][k][1]) << 8) |
                             kPal[teamId][k][2];
                    break;
                }
            }
        }
    }
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
