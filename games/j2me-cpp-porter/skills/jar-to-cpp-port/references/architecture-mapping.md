# Kiến Trúc Ánh Xạ J2ME / Java `.JAR` -> C++17 Desktop (`SDL2`) Thuần

## 1. Compiler & Memory Discipline (Bắt Buộc)
- Build thuần Desktop với **`-std=c++17 -fno-rtti -fno-exceptions -Wall -Wextra`** qua `CMakeLists.txt` (`CMakeLists.desktop.tmpl`). Không phụ thuộc `libnx`, `devkitPro`, hay bất kỳ API Nintendo Switch nào.
- Dùng `std::unique_ptr` / value semantics + `enum`/`int kind()` thay cho `dynamic_cast` / `try-catch`.
- Thư mục dữ liệu đọc qua `platform::resolveRomfsPath()`: tự động dò `assets/`, `../assets/`, `romfs/`, `../romfs/`, hoặc `PORT_ASSETS_FALLBACK_DIR`.
- Save & crash log lưu qua `platform::resolveSavePath()` -> `$HOME/.<app_slug>_desktop_save/`.

## 2. Bảng Ánh Xạ Thành Phần Gốc -> Engine Desktop `SDL2`

| Java / J2ME Gốc | File Tham Chiếu Trong `resources/` | Ghi Chú Port Quan Trọng |
| :--- | :--- | :--- |
| `javax.microedition.lcdui.Graphics` | `engine/GraphicsContext.*` | Giữ nguyên `translate`, `setClip`, `clipRect`, `anchor` (`HCENTER\|VCENTER\|LEFT\|RIGHT\|TOP\|BOTTOM\|BASELINE`), `drawRegion` đủ 8 `Transform` (`0..7`). |
| `javax.microedition.lcdui.Image` | `engine/Image.*` | Buffer `ARGB8888` CPU (`uint32_t*`) đẩy lên `SDL_Texture` qua `RenderSystem::drawGameFramebuffer`. |
| Màn hình & Tỉ lệ (`Canvas`) | `platform/RenderSystem.*` + `SaveSystem.hpp` (`DisplayScaleMode`) | Gọi `RenderSystem::setOriginalResolution(origW, origH)` trước `init()`. Hỗ trợ **3 chế độ**: **`1920x1080` Toàn màn hình 16:9** (`FHD_1920x1080`), **`1920x1080` Giữ tỉ lệ gốc** (`FHD_ASPECT_FIT`), và **`Tỉ lệ x8 Bản gốc`** (`NATIVE_8X` = `origW*8 x origH*8` pixel sắc nét, phím `F4` chuyển nhanh, `F11` Fullscreen). |
| Bàn phím Số Điện Thoại ĐT (`Canvas.keyPressed`) | `platform/InputSystem.*` | Hoạt động **chuẩn bàn phím số điện thoại J2ME**: hàng phím số `0..9` + Numpad `KP_0..9` (`48..57`), `*` (`42`), `#` (`35`), Mũi tên / `WASD` (`-1..-4`), `Enter`/`Space`/`J` = FIRE (`-5`), `Q`/`[`/`Tab` = LSK (`-6`), `E`/`]`/`Backspace` = RSK (`-7`), kèm chuột/pointer. Không phụ thuộc tay cầm. Dùng `clearQueues()` khi bật/tắt menu và `resetAllState()` chỉ khi mất focus cửa sổ. |
| `java.io.DataInputStream` | `engine/Types.hpp` (`ByteReader`, `floorDivPow2`, `lerpCoordRound`) | J2ME dùng **Big-Endian** + **Modified UTF-8**. Dùng `floorDivPow2`/`floorDiv16` thay `/` cho mẫu Java `>> k` kết hợp `& (2^k-1)` khi cuộn âm, và dùng `lerpCoordRound` (`std::lround`) đồng bộ cả Camera + Entities ở 60Hz với timer `SDL_GetPerformanceCounter()` microsecond. |
| `java.lang.String` | `std::u16string` | **Không dùng UTF-8 byte index** để thay `charAt` / `substring` của Java — phải dùng UTF-16 (`char16_t`) để cắt/giữ dấu tiếng Việt chuẩn xác. |
| `RecordStore` (RMS) | `platform/SaveSystem.*` | Header `"RMS1"` cho record store; cấu hình desktop dùng header `"DKP1"` lưu vào `desktop_settings.cfg`. |
| Assets & Variant Sprites | `platform/Platform::romfsFileExists` + `prepare_assets.py` | Kiểm tra magic bytes PNG bị ngụy trang `.mid` hoặc bị cắt header IHDR để tái dựng CRC trước khi chép `assets/`. Với sprite biến thể, luôn check `romfsFileExists()` trước khi load; bỏ `sms.txt`/`prefix.txt` và convert MIDI -> `.ogg`. |

## 3. Vòng Đời State & Thứ Tự Teardown An Toàn
1. **Dọn màn con giữ con trỏ thô TRƯỚC**, rồi mới reset nguồn sở hữu dữ liệu (tránh Use-After-Free khi New Game / Continue / chuyển trận).
2. Kiểm tra đủ 100% `case <state>:` trong vòng lặp game và 100% opcode kịch bản/cutscene (`O()` trả `false` với lệnh thường, chỉ trả `true` khi chuyển map).
3. Nếu `saveGame(true)` tự xóa cờ autosave bẩn (`aW`), caller không được xóa trước khi gọi `if (game.aW) game.saveGame(true)`.
