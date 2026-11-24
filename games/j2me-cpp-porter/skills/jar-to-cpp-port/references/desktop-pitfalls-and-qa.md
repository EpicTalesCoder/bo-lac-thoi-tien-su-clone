# Kho Kinh Nghiệm Port J2ME Sang C++17 Desktop (`SDL2`) & QA Thực Chiến

Tổng hợp các lỗi thực tế và chuẩn mực kỹ thuật cho **Desktop C++17 (`SDL2`)** port thuần từ `.jar` (tập trung bàn phím số điện thoại, hiển thị `1920x1080` hoặc `x8` tỉ lệ gốc, 60 FPS không bóng mờ, và kiểm thử ASan/UBSan):

## A. Màn Hình Desktop `1920x1080` & `Tỉ lệ x8 Gốc`
1. **Hiển thị đúng 2 chuẩn kích thước yêu cầu (`DisplayScaleMode`)**:
   - **`FHD_1920x1080` (Mặc định Widescreen 16:9)**: Cửa sổ hướng tới **`1920x1080`**, khung vẽ logic mở rộng 16:9 theo chiều cao gốc (vd `240px` -> `426x240`, `320px` -> `568x320`) phủ kín `1920x1080` không viền đen. Khi mở rộng bề ngang, clamp `camX` mượt cho các phòng hẹp hơn màn hình và căn giữa các UI cố định (`-(w - origW) / 2`).
   - **`FHD_ASPECT_FIT` (`1920x1080` Giữ tỉ lệ gốc)**: Cửa sổ `1920x1080`, giữ đúng canvas `origW x origH`, phóng pixel-art sắc nét (`SDL_HINT_RENDER_SCALE_QUALITY = "0"`) căn giữa.
   - **`NATIVE_8X` (`Tỉ lệ x8 Bản gốc`)**: Cửa sổ & khung render nhắm chuẩn **`origW * 8 x origH * 8`** (vd `320x240` -> `2560x1920`, `240x320` -> `1920x2560`, `176x208` -> `1408x1664`). Trên màn hình HiDPI macOS (`SDL_WINDOW_ALLOW_HIGHDPI`), `RenderSystem::applyDisplaySettings()` tự quy đổi điểm logic/backing pixel để đạt đúng độ phân giải vật lý khi màn hình cho phép và kẹp an toàn nếu màn hình desktop thấp hơn. Phím **`F4`** chuyển nhanh giữa các chế độ, **`F11`** bật/tắt Fullscreen.
2. **Tọa độ chuột HiDPI (`windowToGameCoords`)**:
   - Luôn nhân tỉ lệ `SDL_GetRendererOutputSize / SDL_GetWindowSize` trước khi trừ `g_lastGameDest.x/y`, nếu không click chuột trên macOS Retina sẽ lệch gấp đôi!

## B. Bàn Phím Số Điện Thoại (`0..9, *, #`) & Input Focus
1. **Hỗ trợ trọn vẹn bàn phím số J2ME trên PC/Mac**:
   - Ánh xạ **cả** dãy số hàng trên (`SDLK_0..9`) **lẫn** Numpad (`SDLK_KP_0..9`) sang `'0'..'9'` (`48..57`); `*` (`SDLK_ASTERISK`, `SDLK_KP_MULTIPLY`, `Shift+8`, `KP_MINUS`) sang `42`; `#` (`SDLK_HASH`, `Shift+3`, `KP_PLUS`) sang `35`.
   - Điều hướng & Softkeys giữ đúng tinh thần điện thoại: Mũi tên / `WASD` (`-1..-4`), `Enter` / `Space` / `J` = FIRE (`-5`), `Q` / `[` / `Tab` = LSK (`-6`), `E` / `]` / `Backspace` = RSK (`-7`). Có thêm tùy chọn `numpadMirrorDpad` nếu gặp game chỉ dùng phím `2/4/6/8/5` cho di chuyển mà không check `keyCode` trực tiếp.
   - **Bẫy kẹt phím `*` / `#` khi nhả `Shift` sớm**: Theo dõi sở hữu phím theo `SDL_Scancode` (`g_scancodeNumSlot[sc]`), đảm bảo nhả `Shift` trước khi nhả `3`/`8` vẫn phát đúng sự kiện nhả `#` (`35`) / `*` (`42`).
2. **Tách `clearQueues()` (bật/tắt Menu) vs `resetAllState()` (Mất Focus)**:
   - Khi nhấn `Esc` / `F1` / `F3` mở/đóng Pause hoặc Cheat Menu, **chỉ gọi `InputSystem::clearQueues()` + `game.clearHeldInputs()`**. Không gọi `resetAllState()` vì xóa `g_curr`/`g_prev` lúc phím đang giữ sẽ làm frame sau sinh sự kiện `justPressed` giả!
   - Chỉ gọi `InputSystem::resetAllState()` khi gặp `SDL_WINDOWEVENT_FOCUS_LOST` / `MINIMIZED` / `HIDDEN` hoặc thoát Log Viewer.
3. **Đồng bộ con trỏ `OverlayMenuView`**:
   - Mọi hàm dựng `OverlayMenuView` cho menu Cheat/Debug **phải cập nhật đủ `view.selectedRow` và `view.scrollTop`**.

## C. Khử Triệt Để "Bóng Mờ" 60 FPS & Lỗi Port Logic J2ME
1. **Timer Microsecond `SDL_GetPerformanceCounter()` + Nội suy Đồng bộ**:
   - Không dùng `SDL_GetTicks64()` (sai số 1ms gây giật nhịp VSync 60Hz). Tích lũy `accumulatorUs` theo `kFixedStepUs` (`40000ULL` cho 25Hz, `66667ULL` cho 15Hz).
   - **Bắt buộc nội suy đồng bộ CẢ Camera (`renderCamX/Y`) lẫn TOÀN BỘ đối tượng di chuyển** (Hero, Mob, Thú/Pet, Đồng hành, Boss từng phần như `prevTakaX/Y`, Đạn/Phi tiêu, Móc câu, Tuyết rơi, Chữ bay) bằng `engine::lerpCoordRound` (`std::lround`). Nếu chỉ nội suy Hero mà quên Camera hoặc Tuyết -> camera và nền chạy lệch pha tạo **bóng mờ**!
   - Chỉ bật nội suy khi `smooth60Fps && speedMultiplier == 1` trong các state chuyển động thực (tắt ở menu/tạm dừng) và **snap `interp.valid = false`** ngay lúc chuyển map / quay về Title.
2. **Kẹt Camera Khi Cuộn Âm (`dO / 16` vs Java `>> 4`)**:
   - Khi tích lũy camera/scroll âm kết hợp bitmask (`ax += dO >> 4; dO &= 15;`), phép chia `/` của C++ cắt về `0` làm kẹt cứng lúc đi sang trái hoặc lên trên. Luôn dùng `engine::floorDiv16` / `engine::floorDivPow2` trong `Types.hpp`.
3. **UBSan Negative Left-Shift & Array Bounds**:
   - Đổi `dir << k` trên số âm thành `dir * (1 << k)`. Kiểm tra `!vec.empty()` trước khi đọc `[0]` (móc/dây) và chặn `i < count && i < kMax` trước mảng cố định để sạch `ASan` & `-Warray-bounds`.
4. **Cờ Đồ Họa, Lớp Vẽ, Cutscene VM & Gỡ SMS**:
   - So sánh 1:1 với Java gốc cờ `!lowQuality` vs `highQuality`, thứ tự lớp `eff nền -> tiles -> nhân vật -> tuyết/hiệu ứng -> foreground -> HUD`, giá trị trả về `O()` của cutscene (`true` chỉ khi đổi map), gỡ hoàn toàn cổng kích hoạt SMS / `vnđ` / `Midlet.a` -> nhận miễn phí 1 bấm.
5. **Font Bitmap & Kiểm Tra Sprite Biến Thể**:
   - Xóa ngưỡng `maxW - spaceRefWidth`, thêm fallback chữ hoa tiếng Việt có dấu (`À->A`, `Đ->D`), flush ký tự cuối khi wrap, giữ chữ hướng dẫn trong game khớp phím PC (`Mũi tên/WASD, 0-9, *, #, Enter, Q, E`), và check `romfsFileExists()` trước khi load sprite biến thể.

## D. Build & Test `ASan + UBSan` Trên macOS (`sdl2-compat`)
- **Bắt buộc truyền `-Wl,-rpath,/opt/homebrew/lib`** khi link **cả** binary CMake ASan lẫn binary test rời (nếu thiếu, `sdl2-compat` gọi `dlopen("libSDL3.0.dylib")` thất bại dưới ASan và treo vĩnh viễn ở hộp thoại `NSAlert` trước `main()` với thông báo `malloc: nano zone abandoned...`).
- Chạy test headless với `ASAN_OPTIONS=detect_leaks=0 SDL_VIDEODRIVER=dummy SDL_AUDIODRIVER=dummy perl -e 'alarm 45; exec @ARGV' ./test_bin`.
