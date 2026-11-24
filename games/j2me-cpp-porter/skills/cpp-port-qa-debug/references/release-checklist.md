# Checklist Tiền Phát Hành Bản Port C++17 Desktop (`SDL2`)

Chạy đủ danh sách dưới đây trước khi kết luận bàn giao:

## 1. Biên Dịch & Vệ Sinh Code
- [ ] Desktop `-O2` (`cmake --build build --clean-first -j 8`): **0 warnings**, **0 errors** trong `src/`.
- [ ] Bật `-std=c++17 -fno-rtti -fno-exceptions -Wall -Wextra` sạch sẽ, không còn code phụ thuộc `libnx`/`__SWITCH__`/Joy-Con.
- [ ] Không dùng dịch bit trái trên số âm (`dir << k` -> `dir * (1 << k)`), dùng `floorDiv16`/`floorDivPow2` thay chia âm cuộn camera, bảo vệ `!vec.empty()` + `i < kMax`, và kiểm tra `platform::romfsFileExists()` trước sprite biến thể.

## 2. Kiểm Thử Tự Động & Sanitizer (`ASan + UBSan`)
- [ ] Chạy `./scripts/build_and_verify.sh <project_dir> <target> [tests...]`:
  - Build `RelWithDebInfo` với `-O1 -g -fno-omit-frame-pointer -fsanitize=address,undefined -fno-sanitize-recover=all` và `-Wl,-rpath,/opt/homebrew/lib` trên **cả** CMake ASan lẫn binary test rời.
  - Chạy headless với `ASAN_OPTIONS=detect_leaks=0 SDL_VIDEODRIVER=dummy SDL_AUDIODRIVER=dummy` bọc `perl -e 'alarm 45; exec @ARGV'`.
- [ ] Kiểm tra hành vi runtime:
  - Dọn `boot.log` sạch `[EXIT] clean_shutdown`, không UAF khi về Title / New Game / Battle.
  - Mở 100% map/room, test trigger đi bộ, shop miễn phí không còn SMS/`vnđ`.
  - Test **Bàn phím số ĐT** (`0..9` + Numpad, `*`, `#` kể cả khi nhả `Shift` trước `3`/`8`, Mũi tên/`WASD`, `Enter`/`Space` = FIRE, `Q` = LSK, `E`/`Backspace` = RSK).
  - Test **Hiển thị `1920x1080` và `x8` tỉ lệ gốc** (`RenderSystem::setOriginalResolution`, `F4` đổi mode, `F11` Fullscreen), tọa độ chuột HiDPI (`windowToGameCoords`).
  - Test `OverlayMenuView` (`selectedRow`/`scrollTop`), `clearQueues()` khi bật/tắt menu vs `resetAllState()` khi mất focus, và cờ autosave `saveGame(true)`.
  - Kiểm tra UI & font: `textOverlaps == 0`, fallback chữ hoa có dấu (`À->A`, `Đ->D`), wrap không rớt ký tự cuối.
- [ ] Xóa sạch thư mục tạm `build_asan` sau khi kiểm tra xong.

## 3. Kiểm Tra Trực Tiếp Trên Cửa Sổ Desktop
- [ ] Kiểm tra 60 FPS mượt (`SDL_GetPerformanceCounter()` microsecond, **không bóng mờ lệch pha giữa Camera + Hero + Mob + Tuyết + Phi tiêu**), đúng thứ tự lớp vẽ & cờ đồ họa Cao/Cổ điển.
- [ ] Kiểm tra `Esc`/`F1` Pause Overlay, `F3` Cheat Menu, `F2` tốc độ `1x/2x/4x/8x`, âm lượng nhạc nền `.ogg`.
