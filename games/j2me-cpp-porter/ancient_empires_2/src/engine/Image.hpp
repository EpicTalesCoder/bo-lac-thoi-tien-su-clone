#pragma once

#include <cstdint>
#include <memory>
#include <string>
#include <vector>

namespace engine {

class GraphicsContext;

class Image : public std::enable_shared_from_this<Image> {
public:
    Image() = default;
    Image(int w, int h, bool mutableImg);

    static std::shared_ptr<Image> createMutable(int w, int h);
    static std::shared_ptr<Image> createFromRomfs(const std::string& relPath);
    static std::shared_ptr<Image> createFromMemory(const uint8_t* data, size_t len);
    static std::shared_ptr<Image> createRGBImage(const int32_t* argb, int w, int h, bool processAlpha);
    std::shared_ptr<Image> cloneWithTeamPalette(int teamId) const;

    int getWidth() const { return width_; }
    int getHeight() const { return height_; }
    bool isValid() const { return width_ > 0 && height_ > 0 && !pixels_.empty(); }

    void getRGB(int32_t* out, int offset, int scanlength, int x, int y, int w, int h) const;
    GraphicsContext getGraphics();

    uint32_t* data() { return pixels_.data(); }
    const uint32_t* data() const { return pixels_.data(); }
    std::vector<uint32_t>& pixelVec() { return pixels_; }

private:
    int width_ = 0;
    int height_ = 0;
    bool mutable_ = false;
    std::vector<uint32_t> pixels_; // ARGB8888
};

using ImagePtr = std::shared_ptr<Image>;

} // namespace engine
