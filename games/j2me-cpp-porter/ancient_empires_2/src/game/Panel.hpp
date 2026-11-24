#pragma once

#include "engine/GraphicsContext.hpp"
#include "game/Sprite.hpp"
#include "game/Unit.hpp"
#include <cstdint>
#include <memory>
#include <string>
#include <vector>

namespace game {

class GameEngine;

class Panel {
public:
    static GameEngine* engine;
    static constexpr int kPad = 2;
    static constexpr int kPad2 = 5;

    Panel(int8_t panelType, int borderMask);
    ~Panel() = default;

    void onShow();
    void setSoftkey(int idx, bool enabled);
    void setBackPanel(Panel* back);

    Panel* attachDetailTextBox(const std::string& text);
    void addChildPanel(std::unique_ptr<Panel> child, int x, int y, int anchor);
    void setupMinimap(int maxW, int maxH, const std::vector<std::vector<int8_t>>& tiles, bool showUnits);
    void setPos(int x, int y, int anchor);

    void setupSpeechDialog(const std::string& text, int maxW, int maxH, int8_t portraitId, int8_t side);
    void setupTextLines(const std::string& title, std::vector<std::string> lines, int w, int h);
    void setupTextBox(const std::string& title, const std::string& body, int w, int h);
    void setupIconBar(std::vector<std::string> labels, std::vector<ImageRegion> icons, int x, int y, int anchor);
    void setupLeftRightSelector(std::vector<std::string> labels, int minW, int h);
    void setupListMenu(std::vector<std::string> items, int x, int y, int minW, int maxH, int anchor, int textAlign);
    void setupRadialMenu(std::vector<std::string> labels, std::vector<ImageRegion> icons,
                         int cx, int cy, int hHint, int anchor, int8_t radialKind);

    int findNextFocusableChild(int dir) const;
    void tick(bool handleInput = true);
    void draw(engine::GraphicsContext& g, int offX = 0, int offY = 0, bool highlighted = false);

    static void fillRoundedRect(engine::GraphicsContext& g, int x, int y, int w, int h);
    static void drawFramedBox(engine::GraphicsContext& g, int x, int y, int w, int h, int borderMask);
    static void drawFramedBoxGrad(engine::GraphicsContext& g, int x, int y, int w, int h, int borderMask,
                                  int bgCol, int gradCol, int fadeStep, int fadeMax);

    bool softkeys[2] = {false, false};
    int textColor = 13553358;
    int bgColor = 2370117;
    int gradColor = 2370117;

    int8_t panelType = 0;
    int borderMask = 0;
    int8_t state = 2; // 0=opening, 1=closing, 2=open, 3=closed

    int targetX = 0;
    int targetY = 0;
    int curX = 0;
    int curY = 0;
    int width = 0;
    int height = 0;
    int lineHeight = 0;
    int fontAscentDiff = 0;
    int fontHalfDiff = 0;

    int selectedIdx = 0;
    int scrollIdx = 0;
    int visibleCount = 0;
    int itemStep = 0;
    int scrollPixelOff = 0;
    int autoCloseMs = -1;
    int fadeTimer = 4;
    bool dirty = true;
    bool bgDirty = true;
    bool hasScrollBar = false;
    bool animateCursor = true;
    bool focusable = true;
    bool allHighlight = false;

    std::vector<std::string> items;
    std::vector<std::string> titleLines;
    std::vector<ImageRegion> icons;
    std::vector<Unit*> buyUnits;
    Unit* infoUnit = nullptr;
    Panel* backTarget = nullptr;
    std::unique_ptr<Panel> detailPanel;
    std::vector<std::unique_ptr<Panel>> children;
    int focusedChild = -1;

    // Minimap
    int mapOriginX = 0;
    int mapOriginY = 0;
    int mapViewCols = 0;
    int mapViewRows = 0;
    int mapCols = 0;
    int mapRows = 0;
    std::vector<std::vector<int8_t>> minimapTiles;
    bool minimapShowUnits = false;

    // Speech portrait
    int8_t portraitId = -1;
    int portraitPad = 0;
    int leftTextPad = -1;
    int centerPad = 0;

    // Radial menu
    int8_t radialKind = 0; // 1=actions, 2=skirmish/main
    int radialRadius = 0;
    int radialCurRadius = 0;
    int radialOuterR = 0;
    int radialRotStep = 0;
    int radialTargetRot = 0;
    int radialRotOffset = 0;
    int radialStepDeg = 0;
    int radialBaseDeg = 0;
    int radialDrawOff = 0;
    std::vector<int16_t> radialAngles;
    int iconSize = 0;
    int iconHalf = 0;
    int cursorFrame = 0;
    int cursorTick = 0;
    int8_t cursorSpeed = 2;
    Sprite* radialCircleProto = nullptr;
    std::vector<std::unique_ptr<Sprite>> sparks;

    // Group scrolling (type 15)
    int groupPage = 0;
    int groupMaxPage = 0;
    std::vector<int> groupPageHeights;
    int groupHeight = 0;
    int fontId = 1; // e.b (small bold)
    ImageRegion leftIcon;

private:
    void initSparks();
    void randomizeSparks();
};

} // namespace game
