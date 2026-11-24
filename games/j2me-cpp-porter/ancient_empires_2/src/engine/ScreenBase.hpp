#pragma once

#include "engine/GraphicsContext.hpp"
#include "engine/Types.hpp"
#include <algorithm>
#include <cstdint>
#include <functional>
#include <string>
#include <vector>

namespace engine {

class UIManager;

struct TextScrollTiming {
    uint64_t lastTickMs = 0;
    int phase = 0; // 0 = start hold, 1 = scrolling, 2 = end hold
    int accumMs = 0;
    void reset() {
        lastTickMs = 0;
        phase = 0;
        accumMs = 0;
    }
};

class InputStateTarget {
public:
    virtual ~InputStateTarget() = default;
    virtual void setActive(bool active) = 0;
    virtual void onKeyPressed(int32_t j2meKeyCode) = 0;
    virtual void onKeyReleased(int32_t j2meKeyCode) = 0;
    virtual void onPointerPressed(int x, int y) = 0;
    virtual void onPointerReleased(int x, int y) = 0;
    virtual void clearKeys() = 0;
};

class ScreenBase : public InputStateTarget {
public:
    virtual ~ScreenBase() = default;

    virtual void tick() = 0;
    virtual void render(GraphicsContext& g) = 0;
    virtual bool initScreen() = 0;
    virtual void cleanupScreen() = 0;
    virtual void setState(int8_t st) { state_ = st; }
    int8_t state() const { return state_; }

    void setActive(bool active) override {
        clearKeys();
        active_ = active;
    }

    void clearKeys() override {
        heldMask_ = pressedMask_ = releasedMask_ = 0;
        prevHeld_ = justPressed_ = justReleased_ = 0;
        if (child_) child_->clearKeys();
    }

    void updateKeyState() {
        prevHeld_ = heldMask_;
        justPressed_ = pressedMask_;
        justReleased_ = releasedMask_;
        pressedMask_ = 0;
        releasedMask_ = 0;
    }

    bool isKeyJustPressed(int32_t mask) const { return (justPressed_ & mask) != 0; }
    bool isAnyDirJustReleased() const { return (justReleased_ & 0xF154) != 0; }
    bool isKeyHeld(int32_t mask) const { return (prevHeld_ & mask) != 0; }

    bool hitPointerRect(int x, int y, int w, int h) {
        if (ptrX_ < x || ptrX_ > x + w || ptrY_ < y || ptrY_ > y + h) return false;
        ptrX_ = -1;
        ptrY_ = -1;
        return true;
    }

    void clearPointer() {
        ptrX_ = -1;
        ptrY_ = -1;
    }

    void onKeyPressed(int32_t j2meKeyCode) override {
        int32_t m = mapKeyCode(j2meKeyCode);
        pressedMask_ |= m;
        heldMask_ |= m;
        if (child_) child_->onKeyPressed(j2meKeyCode);
    }

    void onKeyReleased(int32_t j2meKeyCode) override {
        int32_t m = mapKeyCode(j2meKeyCode);
        releasedMask_ |= m;
        heldMask_ &= ~m;
        if (child_) child_->onKeyReleased(j2meKeyCode);
    }

    void syncHeldKey(int32_t j2meKeyCode, bool held) {
        int32_t m = mapKeyCode(j2meKeyCode);
        if (held) heldMask_ |= m;
        else heldMask_ &= ~m;
    }

    void onPointerPressed(int x, int y) override {
        if (child_) child_->onPointerPressed(x, y);
    }

    void onPointerReleased(int x, int y) override {
        ptrX_ = x;
        ptrY_ = y;
        if (child_) child_->onPointerReleased(x, y);
    }

    void setChild(InputStateTarget* child) {
        if (child_) {
            child_->setActive(false);
            child_ = nullptr;
        }
        if (child) {
            child->setActive(true);
            child_ = child;
        }
    }

    static int32_t mapKeyCode(int32_t keyCode);

    int8_t state_ = 0;
    int8_t prevState_ = 0;
    bool active_ = false;

protected:
    InputStateTarget* child_ = nullptr;
    int32_t heldMask_ = 0;
    int32_t pressedMask_ = 0;
    int32_t releasedMask_ = 0;
    int32_t prevHeld_ = 0;
    int32_t justPressed_ = 0;
    int32_t justReleased_ = 0;
    int ptrX_ = -1;
    int ptrY_ = -1;
};

// Global App / Engine Context replacing static fields in a.a and a.e
class AppContext {
public:
    static void setScreenSize(int16_t w, int16_t h);
    static int16_t screenWidth() { return screenW_; }
    static int16_t screenHeight() { return screenH_; }
    static int16_t halfWidth() { return static_cast<int16_t>(screenW_ / 2); }
    static int16_t halfHeight() { return static_cast<int16_t>(screenH_ / 2); }

    static int frameDelayMs() { return frameDelayMs_; }
    static void setFrameDelayMs(int ms) { frameDelayMs_ = ms; }
    static float renderAlpha() { return renderAlpha_; }
    static void setRenderAlpha(float alpha) { renderAlpha_ = std::clamp(alpha, 0.0f, 1.0f); }

    static int logoBgColor() { return logoBgColor_; }
    static void setLogoBgColor(int c) { logoBgColor_ = c; }

    static void startLoadingTimer();
    static void stopLoadingTimer();
    static void resetLoadingDone();
    static bool isLoadingDone();

    static int randInt(int bound);
    static int randRange(int minVal, int maxVal);
    static int randShake2();
    static int isqrt(int val, int mode);
    static int distApprox(int x1, int y1, int x2, int y2);

    // Rich text layout (#n, #0..#7) matching a.e.a(...)
    static int measureRichTextWidth(const std::u16string& text);
    static void drawRichText(GraphicsContext& g, const std::u16string& text, int defaultColor,
                             int x, int y, int lineHeight, int w, int h, bool wrap, int align,
                             int scrollStep, int scrollState[2], bool flagsOut[2],
                             TextScrollTiming* timing = nullptr);

    static void drawOutlinedText(GraphicsContext& g, const std::u16string& text, int color,
                                 int x, int y, int outlineMode);

    static void preparePagedText(const std::u16string& text, int lineH, int maxW);
    static void setPageAreaHeight(int h);
    static std::u16string getPageText(int pageIdx);
    static int totalPages();
    static void advancePage() { ++currentPage; }
    static int currentPage;
    static std::vector<std::u16string> pagedLines;

    // Tutorial / Lock state (a.a.f, a.a.g, a.a.r, a.a.h, a.a.i, a.a.e)
    static bool hasSaveGame;
    static bool gameActivated;
    static bool inSysDialog;
    static int8_t tutorialStep;
    static int8_t tutorialSub;
    static void setTutorialRule(int idx, int val);
    static bool isTutorialLocked(int keyId, int phase);
    static bool isTutorialMode1();
    static bool isTutorialMode2();
    static void clearTutorial();
    static int8_t getTutorialKey(int idx);
    static bool isTutorialActive() { return tutorialStep != -1; }

    // Offline SMS-unlock replacement (instantly unlocks full game & grants starter gift cleanly)
    static void grantOfflineActivationGift();

private:
    static int16_t screenW_;
    static int16_t screenH_;
    static int frameDelayMs_;
    static float renderAlpha_;
    static int logoBgColor_;
    static bool loadingDone_;
    static int8_t tutorialTable_[20][3];
    static int linesPerPage_;
    static int pageCursor_;
};

} // namespace engine
