#include "engine/BitmapFont.hpp"
#include "engine/GraphicsContext.hpp"
#include "engine/ResourceMgr.hpp"
#include "engine/ScreenBase.hpp"
#include "engine/Sprite.hpp"
#include "engine/UIEngine.hpp"
#include "game/DialogBox.hpp"
#include "platform/InputSystem.hpp"
#include "platform/Platform.hpp"

#include <SDL.h>
#include <cassert>
#include <cmath>
#include <cstdio>
#include <cstdlib>
#include <vector>

namespace {

std::u16string utf8(const char* s) {
    return platform::utf8ToU16(s);
}

void measureHorizontalSim(uint64_t frameDtMs, const std::u16string& txt, int boxW,
                          int& outOffsetAfter1s, int& outOffsetAfter5_5s,
                          int& outMaxSeen, int& outWrapFrameCount) {
    platform::resetUiTicksMs(1000ULL);
    std::vector<uint32_t> fb(320 * 240, 0xFF000000u);
    engine::GraphicsContext g(fb.data(), 320, 240);

    engine::UIStyle st;
    st.text = txt;
    st.wrap = false;
    st.align = 3; // left middle
    st.focusTextColor = static_cast<int>(0xFFFFFFFFu);
    st.unfocusTextColor = static_cast<int>(0xFFFFFFFFu);
    st.resetScroll();

    const int strW = engine::BitmapFont::stringWidth(txt);
    const int expectedMax = strW - boxW;
    assert(expectedMax > 20);

    outOffsetAfter1s = -1;
    outOffsetAfter5_5s = -1;
    outMaxSeen = 0;
    outWrapFrameCount = 0;

    int prevOffset = 0;
    bool wrapped = false;
    uint64_t elapsed = 0;
    // Simulate 32 seconds of display frames (2.5s start hold + ~13.3 px/s scroll + 2.2s end hold)
    for (int f = 0; elapsed <= 32000; ++f) {
        st.draw(g, 10, 10, boxW, 20, true, -1, -1);
        int cur = st.scrollState[0];
        // Verify duplicate render on the exact same uiTicksMs frame does NOT double-step
        st.draw(g, 10, 10, boxW, 20, true, -1, -1);
        assert(st.scrollState[0] == cur);

        if (cur > outMaxSeen) outMaxSeen = cur;
        assert(cur >= 0 && cur <= expectedMax);
        if (elapsed >= 2000 && outOffsetAfter1s == -1) outOffsetAfter1s = cur;
        if (elapsed >= 5500 && outOffsetAfter5_5s == -1) outOffsetAfter5_5s = cur;
        if (!wrapped && prevOffset > 0 && cur == 0) {
            wrapped = true;
            outWrapFrameCount = f;
        }
        prevOffset = cur;

        platform::advanceUiTicksMs(frameDtMs);
        elapsed += frameDtMs;
    }
    assert(outMaxSeen == expectedMax);
    assert(wrapped);
}

} // namespace

int main() {
    setenv("HOME", "/tmp/j2me_ui_scroll_test_home", 1);
    setenv("SDL_VIDEODRIVER", "dummy", 1);
    setenv("SDL_AUDIODRIVER", "dummy", 1);
    if (SDL_Init(SDL_INIT_VIDEO) != 0) {
        std::fprintf(stderr, "SDL_Init failed: %s\n", SDL_GetError());
        return 1;
    }

    assert(platform::init());
    engine::BitmapFont::init();
    engine::ResourceMgr::init();
    engine::SpriteCache::init();
    engine::AppContext::setScreenSize(426, 240);

    std::vector<uint32_t> fb(426 * 240, 0xFF000000u);
    engine::GraphicsContext g(fb.data(), 426, 240);

    // 1. Short text and trailing color tag text never trigger false scroll
    {
        platform::resetUiTicksMs(1000ULL);
        engine::UIStyle st;
        st.text = utf8("#2Hi#0");
        st.wrap = false;
        st.focusTextColor = static_cast<int>(0xFFFFFFFFu);
        st.unfocusTextColor = static_cast<int>(0xFFFFFFFFu);
        st.resetScroll();
        int plainW = engine::BitmapFont::stringWidth(utf8("Hi"));
        assert(plainW > 0 && plainW < 40);
        for (int i = 0; i < 120; ++i) {
            st.draw(g, 0, 0, plainW + 6, 16, true, -1, -1);
            platform::advanceUiTicksMs(50);
        }
        assert(st.scrollState[0] == 0);
        assert(st.scrollFlags[0] && st.scrollFlags[1]);
        std::printf("[OK] Trailing color tags do not double-count width or falsely scroll\n");
    }

    // 2. FPS independence: 60 FPS (16ms), 120 FPS (8ms), 15 FPS (66ms) must match calmed speed
    {
        const std::u16string longDesc = utf8("Kỹ năng Liệt Hỏa Bạo Viêm gây sát thương lớn lên toàn bộ kẻ địch trong trận.");
        const int boxW = 110;
        int s2_60 = 0, s55_60 = 0, max60 = 0, wrap60 = 0;
        int s2_120 = 0, s55_120 = 0, max120 = 0, wrap120 = 0;
        int s2_15 = 0, s55_15 = 0, max15 = 0, wrap15 = 0;

        measureHorizontalSim(16, longDesc, boxW, s2_60, s55_60, max60, wrap60);
        measureHorizontalSim(8, longDesc, boxW, s2_120, s55_120, max120, wrap120);
        measureHorizontalSim(66, longDesc, boxW, s2_15, s55_15, max15, wrap15);

        // Start pause (2.5s) keeps text cleanly at 0 at 2.0s
        assert(s2_60 == 0 && s2_120 == 0 && s2_15 == 0);
        // After 5.5s total (2.5s pause + 3.0s scrolling @ ~13.3 px/s -> ~40 px)
        assert(s55_60 >= 34 && s55_60 <= 46);
        assert(std::abs(s55_60 - s55_120) <= 2);
        assert(std::abs(s55_60 - s55_15) <= 2);
        assert(max60 == max120 && max60 == max15);
        std::printf("[OK] Horizontal FPS independence verified: 2s=%dpx 5.5s=(60Hz:%dpx 120Hz:%dpx 15Hz:%dpx) max=%dpx\n",
                    s2_60, s55_60, s55_120, s55_15, max60);
    }

    // 3. Start pause (2.5s), End pause (2.2s), and slow Vertical wrapped text scroll speed (~4.55 px/s)
    {
        platform::resetUiTicksMs(1000ULL);
        engine::UIStyle st;
        st.text = utf8("Dòng 1: Mô tả chi tiết về nhiệm vụ cốt truyện dài để kiểm tra tự cuộn theo chiều dọc chậm rãi dễ đọc hơn nhiều.");
        st.wrap = true;
        st.focusTextColor = static_cast<int>(0xFFFFFFFFu);
        st.unfocusTextColor = static_cast<int>(0xFFFFFFFFu);
        st.resetScroll();

        const int boxW = 100;
        const int boxH = 30;
        // Verify start hold for first 2400ms
        for (int t = 0; t < 2400; t += 16) {
            st.draw(g, 10, 10, boxW, boxH, false, -1, -1);
            assert(st.scrollState[1] == 0);
            platform::advanceUiTicksMs(16);
        }
        // Advance through 4400ms -> ~100ms remaining hold + ~4300ms @ 220ms/px -> ~19px
        for (int t = 0; t < 4400; t += 16) {
            st.draw(g, 10, 10, boxW, boxH, false, -1, -1);
            platform::advanceUiTicksMs(16);
        }
        int midY = st.scrollState[1];
        assert(midY >= 14 && midY <= 25);

        // Continue until wrap-around sets isScrollFinished()
        bool finished = false;
        int maxY = 0;
        for (int f = 0; f < 3000; ++f) {
            st.draw(g, 10, 10, boxW, boxH, false, -1, -1);
            if (st.scrollState[1] > maxY) maxY = st.scrollState[1];
            if (st.isScrollFinished()) {
                finished = true;
                break;
            }
            platform::advanceUiTicksMs(50);
        }
        assert(finished);
        assert(maxY > midY);
        assert(st.scrollState[1] == 0); // Wrapped cleanly back to top
        std::printf("[OK] Vertical wrapped scroll calmed: midY=%dpx maxY=%dpx finished=%d\n", midY, maxY, finished ? 1 : 0);
    }

    // 4. Focus transition & text change reset scroll back to 0 + start pause
    {
        platform::resetUiTicksMs(1000ULL);
        engine::UIStyle st;
        st.text = utf8("Một chuỗi mô tả đủ dài vượt quá 90 pixel trong ô");
        st.wrap = false;
        st.focusTextColor = static_cast<int>(0xFFFFFFFFu);
        st.unfocusTextColor = static_cast<int>(0xFFFFFFFFu);
        st.resetScroll();

        // Draw unfocused wide box (w=90 >= 80) for 4s (>2.5s start hold) so it scrolls
        for (int t = 0; t < 4000; t += 16) {
            st.draw(g, 0, 0, 90, 16, false, -1, -1);
            platform::advanceUiTicksMs(16);
        }
        assert(st.scrollState[0] > 10);

        // Gain focus -> must reset cleanly back to 0 so reader starts from the first char
        st.draw(g, 0, 0, 90, 16, true, -1, -1);
        assert(st.scrollState[0] == 0);

        // Scroll again while focused, then change text -> resets back to 0
        for (int t = 0; t < 4000; t += 16) {
            st.draw(g, 0, 0, 90, 16, true, -1, -1);
            platform::advanceUiTicksMs(16);
        }
        assert(st.scrollState[0] > 10);
        st.text = utf8("Chuỗi dài khác cũng vượt quá chiều rộng khung hình");
        st.draw(g, 0, 0, 90, 16, true, -1, -1);
        assert(st.scrollState[0] == 0);

        // Narrow unfocused overflowing label stays still for the 2.5s start pause and THEN smoothly scrolls,
        // while a label within <= 1px trailing blank glyph pad stays stationary without jitter.
        engine::UIStyle narrow;
        narrow.text = st.text;
        narrow.wrap = false;
        narrow.focusTextColor = static_cast<int>(0xFFFFFFFFu);
        narrow.unfocusTextColor = static_cast<int>(0xFFFFFFFFu);
        for (int t = 0; t < 2000; t += 16) {
            narrow.draw(g, 0, 0, 60, 16, false, -1, -1);
            platform::advanceUiTicksMs(16);
        }
        assert(narrow.scrollState[0] == 0);
        for (int t = 0; t < 2000; t += 16) {
            narrow.draw(g, 0, 0, 60, 16, false, -1, -1);
            platform::advanceUiTicksMs(16);
        }
        assert(narrow.scrollState[0] > 10);

        engine::UIStyle tightFit;
        tightFit.text = utf8("Hỏa");
        tightFit.wrap = false;
        tightFit.focusTextColor = static_cast<int>(0xFFFFFFFFu);
        tightFit.unfocusTextColor = static_cast<int>(0xFFFFFFFFu);
        const int hoaW = engine::BitmapFont::stringWidth(tightFit.text);
        for (int t = 0; t < 4000; t += 16) {
            tightFit.draw(g, 0, 0, hoaW - 1, 16, false, -1, -1);
            platform::advanceUiTicksMs(16);
        }
        assert(tightFit.scrollState[0] == 0);
        std::printf("[OK] Focus gain, text change, unfocused overflow scroll & 1px trailing-pad guard verified\n");
    }

    // 5. Real UIScreen (.ui file) test: /data/ui/task.ui & /data/ui/skill.ui render smoothly
    {
        auto& mgr = engine::UIManager::instance();
        mgr.openScreen("/data/ui/task.ui", 257, nullptr);
        if (auto* sc = mgr.topScreen()) {
            if (auto* w = sc->find(8)) {
                if (w->kind() == 1) {
                    auto* lbl = static_cast<engine::UILabel*>(w);
                    lbl->style()->text = utf8("Nhiệm vụ chính tuyến dài: Hãy đi qua Rừng Hồi Ức và tìm kiếm dấu vết của Sủng Vật cổ đại.");
                }
            }
        }
        platform::resetUiTicksMs(1000ULL);
        for (int i = 0; i < 60; ++i) {
            mgr.tick();
            mgr.render(g);
            platform::advanceUiTicksMs(16);
        }
        mgr.clearAll();
        std::printf("[OK] Real UIScreen (/data/ui/task.ui) tick+render clean\n");
    }

    // 6. Paged rich text & slowed DialogBox pacing
    {
        const int fh = engine::BitmapFont::height();
        // Verify setPageAreaHeight((4*(fh+1)-1)) matches layoutRichText spacing (4 lines fit in 1 page!)
        const std::u16string wrappedTxt = utf8("Dòng chữ dài vừa đủ để tự động xuống dòng thành bốn dòng liên tiếp kiểm tra chiều cao phân trang chính xác");
        engine::AppContext::preparePagedText(wrappedTxt, fh, 150);
        const int lineCount = static_cast<int>(engine::AppContext::pagedLines.size());
        assert(lineCount >= 2);
        engine::AppContext::setPageAreaHeight(lineCount * (fh + 1) - 1);
        assert(engine::AppContext::totalPages() == 1);
        engine::AppContext::setPageAreaHeight((lineCount - 1) * (fh + 1) - 1);
        assert(engine::AppContext::totalPages() == 2);

        auto& dlg = game::DialogBox::instance();
        dlg.reset();
        dlg.setWaitForKey(true);
        dlg.setPosition(10, 10);
        dlg.setBoxSize(160, 4 * (fh + 1));
        const std::u16string multiLine = utf8("Đây là đoạn thoại dài gồm rất nhiều dòng để kiểm tra tốc độ gõ từng chữ một và thời gian tạm dừng đọc trước khi chuyển trang kế tiếp.");
        dlg.startText(0, multiLine, 0);
        for (int t = 0; t < 5; ++t) {
            dlg.tick();
            platform::advanceGameTicksMs(66);
        }
        assert(!dlg.finished);
        for (int t = 0; t < 600 && !dlg.finished; ++t) {
            dlg.tick();
            dlg.render(g);
            platform::advanceGameTicksMs(66);
        }
        assert(dlg.finished);
        std::printf("[OK] DialogBox slowed typewriter+page pause & setPageAreaHeight exact line fit verified (fh=%d)\n", fh);
    }

    // 7. Vietnamese word-boundary wrapping & UI anti-overflow verification across all key screens
    {
        const int fh = engine::BitmapFont::height();
        // BitmapFont::wrapLines must fill up to maxWidth and break cleanly at word boundaries
        const auto wrapped = engine::BitmapFont::wrapLines(
            utf8("Chiến đấu cùng Sủng vật Liệt Hỏa và Truy Ức Chi Sâm"), 100);
        assert(!wrapped.empty());
        std::u16string joined;
        for (size_t i = 0; i < wrapped.size(); ++i) {
            assert(!wrapped[i].empty());
            assert(wrapped[i].front() != u' ' && wrapped[i].back() != u' ');
            assert(engine::BitmapFont::stringWidth(wrapped[i]) <= 100);
            if (i > 0) joined += u' ';
            joined += wrapped[i];
        }
        assert(joined == utf8("Chiến đấu cùng Sủng vật Liệt Hỏa và Truy Ức Chi Sâm"));

        // Rich-text word wrap preserves #0..#7 tags cleanly without splitting words
        engine::AppContext::preparePagedText(
            utf8("#2Sủng vật #0chiến thắng #5Thương điếm #0và nhận #3Trang sức"), fh, 110);
        assert(!engine::AppContext::pagedLines.empty());
        for (const auto& ln : engine::AppContext::pagedLines) {
            assert(engine::AppContext::measureRichTextWidth(ln) <= 110);
        }

        // DialogBox mode=3 word wrapping fills up to boxW_ - 10 cleanly across ticks and render
        auto& dlg = game::DialogBox::instance();
        dlg.reset();
        dlg.setBoxSize(140, 40);
        dlg.startText(3, utf8("#FF0000Sủng vật#FFFFFF trong hành trang chiến đấu mạnh mẽ hơn nhiều"), 0);
        assert(dlg.active);
        for (int t = 0; t < 120; ++t) {
            dlg.tick();
            dlg.render(g);
        }

        // Key UI screens fit previously-clipped labels statically inside sibling bounds
        auto& mgr = engine::UIManager::instance();
        auto verifyWidgetFits = [&](const char* path, int wid, const char* expectedUtf8) {
            mgr.openScreen(path, 257, nullptr);
            auto* sc = mgr.topScreen();
            assert(sc != nullptr);
            auto* w = sc->find(wid);
            assert(w != nullptr && w->kind() == 1);
            auto* st = w->style();
            assert(st != nullptr);
            const std::u16string txt = expectedUtf8 ? utf8(expectedUtf8) : st->text;
            assert(st->hasTextBounds);
            assert(engine::BitmapFont::stringWidth(txt) <= st->textW + 1);
            mgr.closeScreen(path);
        };
        verifyWidgetFits("/data/ui/petsetting.ui", 7, nullptr); // "Vật phẩm trang sức"
        verifyWidgetFits("/data/ui/gamemenu.ui", 5, nullptr);   // "Tra xét sủng vật"
        verifyWidgetFits("/data/ui/gamemenu.ui", 10, nullptr);  // "Menu trò chơi"
        verifyWidgetFits("/data/ui/gamesystem.ui", 9, nullptr); // "Trở lại menu chính"
        verifyWidgetFits("/data/ui/battle.ui", 3, nullptr);     // "Chiến đấu"
        verifyWidgetFits("/data/ui/battle.ui", 7, nullptr);     // "Thương điếm"
        verifyWidgetFits("/data/ui/record.ui", 12, nullptr);    // "Bắt được sủng vật"
        verifyWidgetFits("/data/ui/record.ui", 13, nullptr);    // "Chỉ"
        verifyWidgetFits("/data/ui/world.ui", 5, "(B) Menu");
        verifyWidgetFits("/data/ui/world.ui", 7, "(X) Hệ thống");

        // Tall softkey "Di chuyển nhanh" promotes to auto-wrap cleanly onto 2 lines
        mgr.openScreen("/data/ui/wharf1.ui", 257, nullptr);
        auto* wharf = mgr.topScreen();
        assert(wharf != nullptr);
        if (auto* btn = wharf->find(9)) {
            assert(btn->style()->textAutoWrap);
            auto lines = engine::BitmapFont::wrapLines(btn->style()->text, btn->style()->textW);
            assert(lines.size() == 2);
            assert(static_cast<int>(lines.size()) * (fh + 1) - 1 <= btn->h());
            btn->draw(g, false, false, wharf->rootPanel(), {});
        }
        mgr.clearAll();
        std::printf("[OK] Vietnamese word-wrap, DialogBox pagination, & UI anti-overflow across screens verified\n");
    }

    engine::SpriteCache::shutdown();
    engine::ResourceMgr::shutdown();
    platform::shutdown();
    SDL_Quit();
    std::printf("=== ALL UI SCROLL TESTS PASSED ===\n");
    return 0;
}
