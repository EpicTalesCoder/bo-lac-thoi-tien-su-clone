# j2me-cpp-porter

Plugin chuyên biệt cho việc port game J2ME / Java `.jar` sang **C++17 + `SDL2` thuần trên Desktop** (macOS / Linux / PC) — **không kèm quy trình build hay điều khiển Nintendo Switch `.nro`** (giữ tách biệt hoàn toàn với `j2me-switch-porter`).

## Điểm Khác Biệt Cốt Lõi
- **Điều khiển theo Bàn Phím Số Điện Thoại (`Mobile Keypad`)**:
  - Hỗ trợ trực tiếp `0..9` (cả dãy số trên lẫn Numpad `KP_0..9`), `*` (`42`), `#` (`35`) chống kẹt phím khi nhả `Shift` sớm, `Mũi tên` / `WASD` (`-1..-4`), `Enter` / `Space` / `J` (`FIRE = -5`), `Q` / `[` / `Tab` (`LSK = -6`), `E` / `]` / `Backspace` (`RSK = -7`), kèm chuột (`windowToGameCoords` chuẩn HiDPI) và phím nóng `Esc/F1` (Cài đặt), `F2` (Speed), `F3` (Cheat), `F4` (Đổi kích thước màn hình), `F11` (Fullscreen), `F12` (FPS).
  - Không cấu hình tay cầm Joy-Con/Switch hay ép remap nút Nhảy khỏi phím Lên.
- **Hiển thị `1920x1080` hoặc `Tỉ lệ x8 Bản Gốc`**:
  - Gọi `RenderSystem::setOriginalResolution(origW, origH)` để tự động hỗ trợ cả **3 chế độ**:
    1. `1920x1080` Widescreen `16:9` (lấp đầy khung Full HD).
    2. `1920x1080` Giữ đúng tỉ lệ J2ME gốc căn giữa.
    3. `Tỉ lệ x8 Bản gốc` (`origW * 8 x origH * 8` nearest-neighbor sắc nét).
- **Kế thừa đầy đủ tinh hoa chất lượng port C++**:
  - Vòng lặp `SDL_GetPerformanceCounter()` microsecond + `lerpCoordRound` đồng bộ Camera & mọi Entity giúp chạy **60 FPS không bóng mờ**, `floorDivPow2`/`floorDiv16` sửa kẹt cuộn âm, `ByteReader` + `u16string`, tối ưu layout UI tiếng Việt không tràn/cắt chữ, khử hoàn toàn SMS/`vnđ`, và kiểm thử `ASan+UBSan` (có `-Wl,-rpath,/opt/homebrew/lib` + timeout `perl alarm 45`).

## Cấu Trúc Gói
- **`skills/jar-to-cpp-port/`**: Quy trình 5 giai đoạn từ `.jar` -> Decompile (Vineflower + CFR) -> Chuẩn hóa `assets/` -> Khung `platform/` (`SDL2` thuần) + `engine/` -> Kiểm thử `ASan+UBSan`.
- **`skills/cpp-port-qa-debug/`**: Playbook xử lý crash, ASan treo trước `main()`, bóng mờ 60 FPS, hiển thị `1920x1080` / `x8`, kẹt phím số điện thoại và lỗi font tiếng Việt.

## Cài Đặt Nhanh Khi Chia Sẻ (Antigravity / AI Agent)
- **Cách 1 — Cài trọn bộ Plugin (Khuyên dùng cho Antigravity)**:
  Copy thư mục `j2me-cpp-porter/` vào `~/.gemini/config/plugins/j2me-cpp-porter/` (hoặc chạy `./install.sh`). Plugin sẽ tự kích hoạt từ lượt chat tiếp theo.
- **Cách 2 — Chỉ cài 2 Skill (Dùng chung cho project hoặc agent hỗ trợ Agent Skills)**:
  Copy 2 thư mục bên trong `skills/` (`jar-to-cpp-port/` và `cpp-port-qa-debug/`) vào `~/.gemini/config/skills/` (global) hoặc `.agents/skills/` ở thư mục gốc dự án. *(Lưu ý giữ nguyên cả 2 thư mục cạnh nhau vì `cpp-port-qa-debug` có liên kết tương đối `../jar-to-cpp-port/...`).*

## Yêu Cầu Môi Trường Máy Đích
- `cmake` (>= 3.16), trình biên dịch C++17 (`clang++` / `g++`), Java JDK (để chạy Vineflower/CFR khi decompile `.jar`), Python 3.
- Thư viện `SDL2`, `SDL2_image`, `SDL2_mixer`, `SDL2_ttf` (macOS: `brew install cmake sdl2 sdl2_image sdl2_mixer sdl2_ttf`).
