#pragma once

#include "engine/GraphicsContext.hpp"
#include <cstdint>
#include <string>
#include <vector>

namespace engine {

class BitmapFont {
public:
    static bool init();
    static int height();
    static int spaceRefWidth(); // game.n.b = width("nhung1")

    static int charWidth(char16_t ch);
    static int stringWidth(const std::u16string& str);
    static int rangeWidth(const std::u16string& str, int start, int end);

    static int drawChar(GraphicsContext& g, char16_t ch, int x, int y);
    static void drawPlain(GraphicsContext& g, const std::u16string& str, int x, int y);
    static void drawAnchored(GraphicsContext& g, const std::u16string& str, int x, int y, int anchor);
    static std::vector<std::u16string> wrapLines(const std::u16string& str, int maxWidth);
};

} // namespace engine
