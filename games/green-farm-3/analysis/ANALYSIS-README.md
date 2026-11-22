# Green Farm 3 (Gameloft, 240×320) — Phân tích & Reverse Engineering

- **JAR gốc:** `original/green-farm-3-240x320.jar` (SHA-256 `b51cd43f4d9a25778311f3c1fd6dc6695b4c1d238f4799814d44a1ab6914fc04`, MIDP-2.0 / CLDC-1.1, v1.0.3)
- **MIDlet chính:** `GloftGF2M` (MIDlet-1), icon `/icon.png`
- **Trạng thái port:** `in-progress` — đã decompile toàn bộ, web-port đang là shell Phaser 3

## Kết cấu class (decompiled bằng CFR 0.152 → `decompiled-cfr/`)

| Class | Dòng (CFR) | Vai trò |
|-------|-----------|---------|
| `a` | 31,623 | **Class game chính** — extends `f` (Canvas), chứa game loop, state machine, render |
| `f` | 1,933 | Canvas trừu tượng gốc — nền tảng vẽ MIDP 2.0 |
| `e` | 3,260 | Logic phụ trợ của `a` (farm/level data) |
| `d` | 2,275 | Logic dữ liệu/đối tượng trong game |
| `l` | 1,941 | Logic UI/menu |
| `i`, `k`, `c` | ~3,300 | `Runnable` — thread tải tài nguyên, timer, network |
| `b` | 100 | Thread helper |
| `g`, `h`, `j` | nhỏ | Utilities |
| `WapTai.COM.WapTai`, `wfree/*` | — | Phần nhúng của waptai (WMA stub), không thuộc game gốc |

Tổng **44,307 dòng** Java decompiled; bytecode evidence (`javap -p -c`) cho 8 class chính nằm trong `bytecode-evidence/`.

## Tài nguyên (`recovered/`)

- Game dùng **resource pack nhị phân đánh số** (`0`, `2`–`11.*`, `EN.1`–`EN.9`, `IAP_texts`) chứ không lưu PNG lẻ:
  - `/0`: bảng MIME của pack (midi, mpeg, x-wav → nhạc MIDI/MP3 nhúng)
  - `/5`, `/10`: bảng offset (int32 LE) trỏ vào khối ảnh/nén bên trong pack
  - `EN.*`: gói text/ngôn ngữ (không phải ASCII thuần — cần decoder riêng)
- Ảnh duy nhất dạng PNG lẻ: `icon.png` (48×48) — đã copy sang `web-port/assets/`
- Toàn bộ hash đối chiếu: `ASSETS-SHA256.txt`

## Việc còn lại để playable

1. ~~Viết decoder cho pack `/5` và `/10`~~ ✅ **XONG** — `tools/decode_image.py`: 2.884 sprite PNG (packs 2/5/7/8/11), format GLLib BSprite v5, I64RLE table đã khôi phục. Chi tiết: `PACK-MAP.md`.
2. ~~Map game loop của `a` sang Phaser runtime~~ 🔄 **Phase B xong khung** — `web-port/gf-core.js` (state machine SPLASH→MENU→ABOUT/HELP/OPTIONS/EXIT_CONFIRM/FARM, keymap MIDP, pure/test được) + `game.js` (render menu tiếng Việt với sprite thật + input keyboard/touch). Farm view còn là placeholder → Phase C.
3. ~~Dịch text từ `EN.*`~~ ✅ **XONG** — pack "EN" thực chất là **tiếng Việt**, decode exact: `tools/decode_text.py` → `web-port/assets/text/en.json` (12 trang, 3.834 chuỗi). Chi tiết: `TEXT-MAP.md`.

Audio cũng đã trích xong: `tools/decode_audio.py` → 55 file (15 MIDI + 40 MP3) trong `web-port/assets/audio/`.
