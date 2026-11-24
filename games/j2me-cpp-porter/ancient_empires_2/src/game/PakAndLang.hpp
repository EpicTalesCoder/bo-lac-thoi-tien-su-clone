#pragma once

#include "engine/GraphicsContext.hpp"
#include "engine/Types.hpp"
#include <cstdint>
#include <memory>
#include <string>
#include <unordered_map>
#include <vector>

namespace game {

class Sprite;

// J2ME GameAction bitmasks from e.java
enum GameKeyBit : int32_t {
    GK_UP    = 1,
    GK_DOWN  = 2,
    GK_LEFT  = 4,
    GK_RIGHT = 8,
    GK_FIRE  = 16,
    GK_0     = 32,
    GK_1     = 64,
    GK_3     = 128,
    GK_7     = 256,
    GK_9     = 512,
    GK_LSK   = 1024,
    GK_RSK   = 2048,
    GK_OTHER = 4096
};

class PakStore {
public:
    static bool load();
    static const std::vector<uint8_t>* getBytes(const std::string& name);
    static bool exists(const std::string& name);
};

class Lang {
public:
    static bool load();
    static const std::string& get(int id);
    static std::string getWithKeys(int id);
    static std::string format(int id, const std::string& arg);
    static std::string format(int id, const std::vector<std::string>& args);
    static std::string replaceAll(const std::string& src, const std::string& from, const std::string& to, bool all);
    static std::vector<std::string> wrapText(const std::string& text, int maxWidth, int fontId);
};

class Trig {
public:
    static void init();
    static int16_t sin1024(int deg);
    static int16_t cos1024(int deg);
};

class GameInput {
public:
    static int32_t mapJ2meKeyToAction(int32_t j2meKey);
    static std::string keyBitLabel(int32_t actionBit);

    void onKeyPressed(int32_t j2meKey);
    void onKeyReleased(int32_t j2meKey);
    void clearAll();

    bool anyHeld() const { return heldMask_ != 0; }
    bool consumeJustPressed(int32_t mask);
    bool isHeld(int32_t mask) const { return (heldMask_ & mask) != 0; }
    bool isRepeat(int32_t mask, uint64_t nowMs) const;
    void clearKeyBit(int32_t mask) { heldMask_ &= ~mask; justMask_ &= ~mask; }

private:
    int32_t heldMask_ = 0;
    int32_t justMask_ = 0;
    int32_t lastKey_ = 0;
    uint64_t lastKeyTimeMs_ = 0;
};

class SpriteFont {
public:
    static bool init();
    static void shutdown();
    static int stringWidth(int fontId, const std::string& str);
    static int height(int fontId);
    static void draw(engine::GraphicsContext& g, const std::string& str, int x, int y, int fontId, int anchor);
    static void drawSystem(engine::GraphicsContext& g, const std::string& str, int x, int y, int anchor);
};

namespace GameRng {
int nextInt();
int nextInt(int bound);
int range(int minVal, int maxVal); // [minVal, maxVal)
} // namespace GameRng

} // namespace game
