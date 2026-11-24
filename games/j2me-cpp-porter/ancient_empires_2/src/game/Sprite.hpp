#pragma once

#include "engine/GraphicsContext.hpp"
#include "engine/Image.hpp"
#include "engine/Types.hpp"
#include <array>
#include <cstdint>
#include <memory>
#include <string>
#include <vector>

namespace game {

class ImageRegion {
public:
    ImageRegion() = default;
    explicit ImageRegion(const std::string& name, int teamId = 1);
    ImageRegion(const ImageRegion& parent, int col, int row, int w, int h);
    ImageRegion(const ImageRegion& src, int transformFlags);

    void applyAnchorOffset(int anchor, int fw, int fh);
    void addOffset(int dx, int dy);

    void draw(engine::GraphicsContext& g, int x, int y, int anchor = (engine::LEFT | engine::TOP)) const;

    bool isValid() const { return img && img->isValid(); }

    engine::ImagePtr img;
    bool isSub = false;
    int srcX = 0;
    int srcY = 0;
    int w = 0;
    int h = 0;
    int offX = 0;
    int offY = 0;
    int transform = 0;
};

class Sprite {
public:
    Sprite() = default;
    explicit Sprite(const std::string& name, int teamId = 1);
    explicit Sprite(std::vector<ImageRegion> regions);
    Sprite(int w, int h);
    Sprite(const Sprite& other);
    Sprite& operator=(const Sprite& other) = default;
    virtual ~Sprite() = default;

    static std::unique_ptr<Sprite> createFloatingText(const std::string& text, int vx, int gravityY, int fontId);
    static std::unique_ptr<Sprite> createEffect(const Sprite* proto, int vx, int vy, int gravityY,
                                                int loops, int frameDelayMs, uint8_t kind);

    int seqLength() const { return static_cast<int>(seq.size()); }
    int totalFrames() const { return static_cast<int>(frames.size()); }
    void setFrameIndex(int idx);
    void setPos(int x, int y);
    void advanceFrame();
    void setSequence(std::vector<uint8_t> newSeq);
    void setAnim(int animIdx, bool useUpperHalf = false);

    virtual void tick();
    virtual void draw(engine::GraphicsContext& g, int offX, int offY);
    void drawFrame(engine::GraphicsContext& g, int frameSlot, int offX, int offY, int anchor);
    void drawCurrent(engine::GraphicsContext& g, int offX, int offY, int anchor);

    std::vector<ImageRegion> frames;
    std::vector<uint8_t> seq;
    std::vector<std::vector<uint8_t>> anims;

    int frameIdx = 0;
    int x = 0;
    int y = 0;
    int prevX = 0;
    int prevY = 0;
    int zOff = 0; // r in f.java (vertical jump / bounce offset)
    int prevZOff = 0;
    bool visible = true;
    int frameW = 0;
    int frameH = 0;

    uint8_t kind = 0;       // k in f.java (0=normal, 2=spark, 4=white-spark, 5=text, 6=dragon-beam)
    int loopsLeft = -1;     // s in f.java
    int animTimerMs = 0;    // t in f.java
    int frameDelayMs = 0;   // u in f.java
    int vx = 0;             // v in f.java
    int vy = 0;             // w in f.java
    int gravityY = 0;       // x in f.java
    bool alive = true;      // d in f.java
    bool removeWhenDone = false; // e in f.java
    bool drawOver = false;  // f in f.java
    int shakeTicks = -1;    // y in f.java
    int8_t sideOwner = -1;  // l in f.java (battle side clip)
    bool floatPhaseActive = false; // g in f.java (wisp/golem float)
    int auxState = 0;       // z in f.java

    // Text mode (kind == 5)
    std::string text;
    int textFontId = 0;

    // King overlay heads (king.sprite)
    Sprite* kingHeadFront = nullptr; // a in f.java
    Sprite* kingHeadBack = nullptr;  // b in f.java

    // Particle mode (kind == 2 or 4)
    std::array<std::array<int, 2>, 5> pPos{};
    std::array<std::array<int16_t, 2>, 5> pVel{};
    std::array<uint8_t, 5> pSize{};
    std::array<bool, 5> pAlive{};
    int particleColor = 16769024;

private:
    void loadFromPak(const std::string& name, int teamId);
    void tickParticles();
};

} // namespace game
