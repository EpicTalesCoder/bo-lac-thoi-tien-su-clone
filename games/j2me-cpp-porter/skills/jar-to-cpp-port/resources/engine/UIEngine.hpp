#pragma once

#include "engine/GraphicsContext.hpp"
#include "engine/ScreenBase.hpp"
#include "engine/Sprite.hpp"
#include "engine/Types.hpp"
#include <array>
#include <cstdint>
#include <memory>
#include <string>
#include <unordered_map>
#include <vector>

namespace engine {

class UIWidget;
class UIPanel;
class UIListNav;

class UIListener {
public:
    virtual ~UIListener() = default;
    virtual void onUIEvent(const std::array<int, 3>& evt, const std::array<int, 4>& extra) = 0;
};

struct UIBox {
    int x = 0;
    int y = 0;
    int w = 0;
    int h = 0;
};

class UISpriteIcon {
public:
    void load(int sprId, bool longStride, int8_t nextAnim);
    void setAnim(int8_t anim, int8_t nextAnim);
    void setFrameOrAnim(int val) { index = static_cast<int16_t>(val); }
    void setLoop() { flipMode = 1; }
    void tick();
    void draw(GraphicsContext& g, const UIBox& box, int align);
    void release();

    uint8_t drawMode = 4; // 2=frame, 3=anim
    SpriteInstance* sprite() { return hasSpr_ ? &spr_ : nullptr; }

private:
    SpriteInstance spr_;
    bool hasSpr_ = false;
    int8_t flipMode = 0;
    int16_t index = -1;
};

struct UIGridCell {
    std::unique_ptr<UISpriteIcon> icon;
    int up = 0;
    int down = 0;
    int left = 0;
    int right = 0;
    int active = 0; // f: 0=empty, 1=active
};

struct UIStyle {
    std::u16string text;
    int scrollState[2] = {0, 0};
    int scrollStep = 1;
    int align = 4;
    int iconAlign = 4;
    bool wrap = false;
    int focusBgColor = 0xFFFFFF;
    int focusBorderColor = 0xFFFFFF;
    int focusTextColor = 0xFFFFFF;
    int8_t outlineMode = -1;
    std::unique_ptr<UISpriteIcon> focusIcon;
    int unfocusBgColor = 0xFFFFFF;
    int unfocusBorderColor = 0xFFFFFF;
    int unfocusTextColor = 0xFFFFFF;
    std::unique_ptr<UISpriteIcon> unfocusIcon;

    UIBox lastBox;
    std::u16string prevText;
    bool prevFocused = false;
    bool scrollFlags[2] = {false, false};
    TextScrollTiming scrollTiming;

    // Sibling-aware expanded/wrapped text region decoupled from sprite/bg box geometry.
    bool hasTextBounds = false;
    int textDx = 0;
    int textW = 0;
    int textAlignOverride = -1;
    bool textAutoWrap = false;

    void resetScroll();
    bool isScrollFinished() const { return scrollFlags[1]; }
    void draw(GraphicsContext& g, int x, int y, int w, int h, bool focused, int8_t padA, int8_t padB);
};

class UIWidget {
public:
    virtual ~UIWidget() = default;
    virtual int kind() const = 0; // 0=panel, 1=label, 2=grid

    virtual int id() const = 0;
    virtual void setId(int id) = 0;
    virtual int x() const = 0;
    virtual void setX(int x, UIWidget* root) = 0;
    virtual int y() const = 0;
    virtual void setY(int y, UIWidget* root) = 0;
    virtual int w() const = 0;
    virtual void setW(int w, UIWidget* root) = 0;
    virtual int h() const = 0;
    virtual void setH(int h, UIWidget* root) = 0;

    virtual UIListNav* listNav() = 0;
    virtual void setListNav(UIListNav* nav) = 0;
    virtual std::vector<std::unique_ptr<UIWidget>>& children() = 0;
    virtual UIStyle* style() = 0;
    virtual int parentId() const = 0;
    virtual void setParentId(int pid) = 0;
    virtual void setVisible(bool v) = 0;
    virtual void layout(UIWidget* root) = 0;

    virtual void draw(GraphicsContext& g, bool focused, bool animActive, UIWidget* root, const std::vector<int>& focusPath) = 0;
    virtual void tick(bool flagA, bool animActive, UIWidget* root, const std::vector<int>& focusPath) = 0;
};

UIWidget* findWidgetById(UIWidget* root, int targetId);
void shiftWidgetTree(UIWidget* w, int dx, int dy, UIWidget* root);

class UIListNav {
public:
    explicit UIListNav(int navKind);

    void stepNext(int delta, UIWidget* root);
    void stepPrev(int delta, UIWidget* root);
    void setMode(int mode);

    void drawItem(GraphicsContext& g, int widgetId, bool panelFocused, const std::vector<int>& focusPath, bool animActive, UIWidget* root);
    void tickItem(int widgetId, const std::vector<int>& focusPath, bool animActive, UIWidget* root);

    int totalCount = 0;
    std::vector<int> slotIds;
    std::vector<std::vector<std::vector<int>>> animTables;
    int visibleCount = 0;
    int scrollTop = 0;
    int cursor = 0;
    bool loop = true;
    int modeH = 0;
    int centerOffset = 0;
    int kind = 0;
    std::vector<std::u16string> labels;

private:
    int layoutMode_ = -1;
    std::vector<UIBox> slotBoxes_;
    bool boxesInit_ = false;
    void ensureBoxes(UIWidget* root);
};

class UIPanel : public UIWidget {
public:
    UIPanel();
    int kind() const override { return 0; }
    int id() const override { return id_; }
    void setId(int id) override { id_ = id; }
    int x() const override { return x_; }
    void setX(int x, UIWidget* root) override { x_ = x; layout(root); }
    int y() const override { return y_; }
    void setY(int y, UIWidget* root) override { y_ = y; layout(root); }
    int w() const override { return w_; }
    void setW(int w, UIWidget* root) override { w_ = w; layout(root); }
    int h() const override { return h_; }
    void setH(int h, UIWidget* root) override { h_ = h; layout(root); }

    UIListNav* listNav() override { return attachedNav_; }
    void setListNav(UIListNav* nav) override { attachedNav_ = nav; }
    std::vector<std::unique_ptr<UIWidget>>& children() override { return children_; }
    UIStyle* style() override { return &style_; }
    int parentId() const override { return parentId_; }
    void setParentId(int pid) override { parentId_ = pid; }
    void setVisible(bool v) override { visible_ = v; }
    void layout(UIWidget* root) override;

    void draw(GraphicsContext& g, bool focused, bool animActive, UIWidget* root, const std::vector<int>& focusPath) override;
    void tick(bool flagA, bool animActive, UIWidget* root, const std::vector<int>& focusPath) override;

    std::unique_ptr<UIListNav> navA;
    std::unique_ptr<UIListNav> navB;
    std::vector<std::array<int8_t, 4>> keyRules;

private:
    int id_ = -1;
    int x_ = 0, y_ = 0, w_ = 0, h_ = 0;
    int parentId_ = -1;
    bool visible_ = true;
    UIStyle style_;
    UIListNav* attachedNav_ = nullptr;
    std::vector<std::unique_ptr<UIWidget>> children_;
};

class UILabel : public UIWidget {
public:
    UILabel() = default;
    int kind() const override { return 1; }
    int id() const override { return id_; }
    void setId(int id) override { id_ = id; }
    int x() const override { return x_; }
    void setX(int x, UIWidget* root) override { x_ = x; layout(root); }
    int y() const override { return y_; }
    void setY(int y, UIWidget* root) override { y_ = y; layout(root); }
    int w() const override { return w_; }
    void setW(int w, UIWidget* root) override { w_ = w; layout(root); }
    int h() const override { return h_; }
    void setH(int h, UIWidget* root) override { h_ = h; layout(root); }

    UIListNav* listNav() override { return attachedNav_; }
    void setListNav(UIListNav* nav) override { attachedNav_ = nav; }
    std::vector<std::unique_ptr<UIWidget>>& children() override { static std::vector<std::unique_ptr<UIWidget>> empty; return empty; }
    UIStyle* style() override { return &style_; }
    int parentId() const override { return parentId_; }
    void setParentId(int pid) override { parentId_ = pid; }
    void setVisible(bool v) override { visible_ = v; }
    void layout(UIWidget* root) override { (void)root; }

    void initBox() { style_.lastBox = {x_, y_, w_, h_}; style_.resetScroll(); }
    void draw(GraphicsContext& g, bool focused, bool animActive, UIWidget* root, const std::vector<int>& focusPath) override;
    void tick(bool flagA, bool animActive, UIWidget* root, const std::vector<int>& focusPath) override;

    int8_t padA = -1;
    int8_t padB = -1;

private:
    int id_ = -1;
    int x_ = 0, y_ = 0, w_ = 0, h_ = 0;
    int parentId_ = -1;
    bool visible_ = true;
    UIStyle style_;
    UIListNav* attachedNav_ = nullptr;
};

class UIGrid : public UIWidget {
public:
    UIGrid() = default;
    int kind() const override { return 2; }
    int id() const override { return id_; }
    void setId(int id) override { id_ = id; }
    int x() const override { return x_; }
    void setX(int x, UIWidget* root) override { (void)root; x_ = x; }
    int y() const override { return y_; }
    void setY(int y, UIWidget* root) override { (void)root; y_ = y; }
    int w() const override;
    void setW(int w, UIWidget* root) override { (void)w; (void)root; }
    int h() const override;
    void setH(int h, UIWidget* root) override { (void)h; (void)root; }

    UIListNav* listNav() override { return nullptr; }
    void setListNav(UIListNav* nav) override { (void)nav; }
    std::vector<std::unique_ptr<UIWidget>>& children() override { static std::vector<std::unique_ptr<UIWidget>> empty; return empty; }
    UIStyle* style() override { return nullptr; }
    int parentId() const override { return parentId_; }
    void setParentId(int pid) override { parentId_ = pid; }
    void setVisible(bool v) override { visible_ = v; }
    void layout(UIWidget* root) override { (void)root; }

    void initAutoCells();
    void initEmptyCells(int cols, int rows);
    bool moveCursor(int8_t dir);
    void setCursor(int idx);

    void draw(GraphicsContext& g, bool focused, bool animActive, UIWidget* root, const std::vector<int>& focusPath) override;
    void tick(bool flagA, bool animActive, UIWidget* root, const std::vector<int>& focusPath) override;

    int bgColor = 0;
    std::unique_ptr<UISpriteIcon> bgIcon;
    std::unique_ptr<UISpriteIcon> cursorIcon;
    bool cursorVisible = false;
    std::vector<UIGridCell> cells;

    int cellW = 0, cellH = 0, gapX = 0, gapY = 0;
    int cols = 0, rows = 0;
    int curOffX = 0, curOffY = 0;
    int visCols = 0, scrollCol = 0;
    int visRows = 0, scrollRow = 0;
    int wrapH = 0, pageH = 0, wrapV = 0, pageV = 0;
    int selected = 0;

private:
    int id_ = -1;
    int x_ = 0, y_ = 0;
    int parentId_ = -1;
    bool visible_ = true;
};

class UIScreen {
public:
    explicit UIScreen(UIListener* listener) : listener_(listener) {}
    void load(const std::string& path, int sprMode);
    void render(GraphicsContext& g);
    void tick();
    UIWidget* find(int widgetId);
    UIPanel* rootPanel() { return root_.get(); }
    bool dispatchAction(int actionCode);

private:
    std::unique_ptr<UIPanel> root_;
    std::vector<int> focusIndexPath_; // f
    std::vector<int> focusIdPath_;    // g
    UIListener* listener_ = nullptr;

    void parsePanel(ByteReader& r, UIPanel* panel, int sprMode);
    void optimizeVietnameseLayout(UIPanel* panel);
    UIBox computeBounds(UIWidget* w);
    UIWidget* resolveFocusedWidget();
    void rebuildFocusIdPath();
    bool focusBack();
    bool focusEnter(UIWidget* w, int targetId);
    int findFirstFocusable(UIWidget* w, int targetId, bool setGridCursor);
    std::vector<int> buildIndexPathTo(int targetId);
};

class UIManager {
public:
    static UIManager& instance();

    void clearAll();
    void render(GraphicsContext& g);
    void tick();

    void openScreen(const std::string& path, int sprMode, UIListener* listener);
    void closeScreen(const std::string& path);
    bool isTopScreen(const std::string& path) const;
    bool isScreenOpen(const std::string& path) const;
    UIScreen* getScreen(const std::string& path);
    UIScreen* topScreen() { return top_; }

private:
    UIManager() = default;
    std::unordered_map<std::string, std::unique_ptr<UIScreen>> cache_;
    std::vector<std::string> stackPaths_;
    std::vector<UIScreen*> stackScreens_;
    UIScreen* top_ = nullptr;
};

} // namespace engine
