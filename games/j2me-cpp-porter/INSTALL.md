# Hướng Dẫn Cài Đặt & Chia Sẻ `j2me-cpp-porter`

Gói này chứa trọn bộ **plugin + 2 skill** port game J2ME / Java `.jar` sang **C++17 + SDL2 thuần trên Desktop** (hỗ trợ bàn phím số điện thoại `0-9, *, #`, màn hình `1920x1080` hoặc `x8` tỉ lệ gốc, khử bóng mờ 60 FPS, tối ưu UI tiếng Việt, kèm công cụ decompile Vineflower + CFR).

---

## 1. Cài Đặt Tự Động (macOS / Linux)

Mở Terminal trong thư mục vừa giải nén (`j2me-cpp-porter/`) và chạy 1 trong 3 lệnh sau:

- **Cài trọn bộ Plugin vào Antigravity (Khuyên dùng):**
  ```bash
  ./install.sh
  ```
  *(Chép vào `~/.gemini/config/plugins/j2me-cpp-porter`)*

- **Chỉ cài 2 Skill dùng chung mọi dự án (Global Skills):**
  ```bash
  ./install.sh --skills
  ```
  *(Chép `jar-to-cpp-port` và `cpp-port-qa-debug` vào `~/.gemini/config/skills/`)*

- **Cài riêng cho một thư mục dự án (Team Workspace `.agents/skills/`):**
  ```bash
  ./install.sh --workspace /duong/dan/toi/project
  ```

> Có thể chạy thử `./install.sh --dry-run` để xem trước nơi cài đặt trước khi chép file.

---

## 2. Cài Đặt Thủ Công (Windows / macOS / Linux)

1. **Cho Antigravity (Full Plugin):** copy nguyên thư mục `j2me-cpp-porter/` vào:
   - macOS/Linux: `~/.gemini/config/plugins/j2me-cpp-porter/`
   - Windows: `%USERPROFILE%\.gemini\config\plugins\j2me-cpp-porter\`
2. **Hoặc chỉ dùng 2 Skill (bất kỳ AI Agent hỗ trợ Agent Skills):**
   Copy **cả 2** thư mục `skills/jar-to-cpp-port` và `skills/cpp-port-qa-debug` đặt **cạnh nhau** trong `~/.gemini/config/skills/` hoặc `<project>/.agents/skills/` *(giữ cạnh nhau để link tương đối `../jar-to-cpp-port/...` hoạt động đúng)*.

---

## 3. Công Cụ Cần Cài Trên Máy Người Nhận

- **macOS (Homebrew):**
  ```bash
  brew install cmake sdl2 sdl2_image sdl2_mixer sdl2_ttf
  ```
  *(Cần thêm Java JDK để chạy `vineflower-1.12.0.jar` / `cfr-0.152.jar` khi decompile `.jar`.)*
- **Ubuntu / Debian:**
  ```bash
  sudo apt install cmake g++ libsdl2-dev libsdl2-image-dev libsdl2-mixer-dev libsdl2-ttf-dev openjdk-17-jre
  ```

---

## 4. Cách Dùng Sau Khi Cài

Mở cuộc trò chuyện mới trong thư mục chứa file `.jar` game J2ME và nhắn:
> `"Port game J2ME .jar trong thư mục này sang C++17 SDL2 thuần theo skill jar-to-cpp-port"`
