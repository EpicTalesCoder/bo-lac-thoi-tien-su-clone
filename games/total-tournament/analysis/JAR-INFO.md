# JAR Intel — Total Tournament (decompile toàn bộ)

Nguồn: `~/Downloads/game2/total-tournament.jar` (mirror Dertz, 250KB, 56 file, 14 class).
Bản decompile CFR đầy đủ 14/14 class nằm ở `analysis/decompiled-cfr/` (verify bằng re-run CFR mới, diff 0).
Bản decompile Vineflower 1.12.0 đầy đủ 14/14 class nằm ở `analysis/decompiled-vineflower/` — sạch 0 lỗi, đọc dễ hơn CFR ở 3 chỗ CFR fails structure: `b.a(String)` (bộ giải mã tài nguyên), `e.i()`, `e.run()` (game loop). Dùng bản VF làm nguồn chính khi viết lại code.
Bytecode evidence: `analysis/bytecode-evidence/*.javap.txt` — sinh lại bằng `javap 21 -p -c` thật (bản PR #17 trước đó chỉ là thông báo lỗi `javap: command not found`), nay gồm đủ 6 class game + 8 class stub `com/nokia/**`, `com/hellomoto/**`.

## 1. Nhận dạng (META-INF/MANIFEST.MF)

| Trường | Giá trị |
|---|---|
| MIDlet-Name | TOTAL TOURNAMENT JaFan.ru |
| MIDlet-Vendor | mob.ua (SiteURL: wap.mob.ua) |
| MIDlet-1 entry class | `tr` |
| Version | 1.0 (credits ghi "Версия: 2.1") |
| Configuration / Profile | CLDC-1.0 / MIDP-1.0 |
| Thêm | Nokia-MIDlet-Category: Game, Adapted-By: JAM-2.0.0.1 |

## 2. Bản đồ class (14)

| Class | Vai trò |
|---|---|
| `tr` | MIDlet entry (startApp/pauseApp) |
| `e` | Engine chính (~4120 dòng): game loop, render, AI, bảng frame `aO` (từ cu2), composite thân lính `aH` (từ ca), vũ khí, level, HUD |
| `b` | Loader tài nguyên: giải mã ảnh 3 tầng XOR, tokenizer chuỗi, RecordStore lưu game; instance tĩnh `b.d` = data accessor |
| `c` | Layout/wrap text lên bitmap font |
| `a` | Canvas fullscreen + bảng font metrics `cf` (6 byte/glyph) |
| `d` | File data accessor (đọc raw bytes trong jar) |
| `com/nokia/mid/ui/*` (6), `com/nokia/mid/sound/*` (2), `com/hellomoto/fullscreen/FullCn` | Stub API Nokia/hellomoto |
| **Lưu ý âm thanh:** jar KHÔNG có file nhạc/âm (.mid/.amr/.wav) — chỉ stub `com.nokia.mid.sound.Sound` |

## 3. Sơ đồ giải mã tài nguyên (b.java `b.a(String)`)

1. **PNG trần** → dùng ngay (`bg0, bg1, or, li1, li2, f1, f2, fnt, curs, erou, ld, lz(2 tầng), text1, text2`).
2. **XOR stream key 100 tăng dần** toàn bộ buffer → PNG (l0, l1, s0, s1, u0–u8).
3. **XOR kép**: XOR key-100-stream (in-place) → key mới = `buf[2]-3` (byte, signed) → XOR stream lần 2, cắt từ offset 3 (`lz`).
4. **Không giải mã — file dữ liệu nguỵ trang .png** (đọc raw qua `b.d.a(name, -1)`): `cu2, ca, cc, ccs, cf, ll, mua, obj0, wlg, wpn, text, text1–4`.

Script decode tham khảo: xem `analysis/data/` (đã kèm bản raw gốc).

## 4. Inventory ảnh (26 ảnh thật)

| File | Kích thước | Vai trò (từ code + vision) |
|---|---|---|
| u3 | 127×92 | **LÍNH nguyên thân** (bán phải): (0,0,40×39) lính A, hàng dưới (0,30) lính B "Мутант"; các frame khác 40–44px |
| u0 | 103×80 | Muzzle flash 2 màu: rows 43–45 vàng / 46–48 xanh, 3 frame |
| u6 | 116×101 | Cầu lửa/nổ: 10 frame lớn (rows 33–42) + 9 frame nhỏ (rows 69–77) |
| u4 | 32×42 | Cờ CTF 3 frame đỏ (cột 0) + xanh (cột 1), 15×14 |
| u7 | 24×46 | Căn cứ + cột (24×23) |
| u5 | 79×30 | 4 icon súng riêng (AK 37×8, rifle 37×14, plasma 42×17, launcher 37×16) |
| u1 | 86×35 | 7 mảnh debris tường |
| u2 | 114×111 | Props/decoration map (21 rect, KHÔNG phải lính) |
| f1, f2 | 72×72 | Nổ lớn 2 frame |
| l0, l1 | 128×128 | Tileset map |
| bg0, bg1 | 240×320 | Nền màn |
| or | 240×320 | Title screen |
| li1, li2 | 240×180 | Menu art |
| lz | 240×299 | Màn hình help/image |
| s0 | 58×108 | Radar + HUD pieces |
| s1 | 121×21 | HUD strips |
| fnt | 124×46 | Bitmap font nhỏ (3 màu) |
| curs | 32×27 | Con trỏ ngắm |
| erou | 14×15 | Icon hero minimap |
| ld | 20×38 | Cái thang/cửa |
| ico (MIDlet) | 52×52 | Icon app — decode mới succeed (double XOR) |

## 5. File dữ liệu (đã parse — `analysis/data/tables.json`)

| File | Format (từ code e.java) | Nội dung |
|---|---|---|
| `cu2` | rows × 7 byte (bx=7): [dx,dy,w,h,ofsX,ofsY,imgIdx] signed; **row 0 = header, bỏ** | Bảng frame 117 frame — **108 hợp lệ, 9 row rỗng** (rows 8,9,31,32,59,60,66–68; sửa số cũ "107"); decode đầy đủ trong `tables.json["cu2"]` |
| `ca` | 220 row × 24 byte = 8 triple/row (bw=24); triple thứ 3: 61–64→0, âm→+256 | **Bảng composite thân lính `aH`**: mỗi pose row ghép nhiều part (dx,dy,imgIdx) |
| `wlg` | 16×6 byte | Bảng set vũ khí 16 combo (slot→weapon id; 255 = trống) |
| `wpn` | records 3 byte [objIdx, slot+1, code]; code+256 → switch {242:6, 243:5, 245:3, 246:2, 247:1}; nhóm cách [0,0,0] | **Weapon spawn theo level** — 6527 records / 11 khối |
| `obj0` | 73 block × 25 byte (bJ×bK = 5×5), âm→+256 | Object spawn grid theo level |
| `ll` | records 9 byte, separator [0,0,0] (stride 9, 4 separator/level) | **Level layout** — 1213 records / 17 nhóm |
| `cc` | 66 entry × 11 byte, column-major (aJ[11][bt]) | Bảng cấu hình map/camera |
| `ccs` | 47 entry × 7 byte, column-major (h[11][bt]) | Bảng sound slots (dùng trong `r()`) |
| `mua` | 12 row × 25 byte (by=25) | Bảng particle/mưa |
| `cf` | n × 6 byte (6 cột/glyph) | Font metrics per language (a.java `b()`: `a[6][n]` column-major, signed byte; tên file = `cf` + ngôn ngữ, jar chỉ có `cf` = lang 0) — **96 glyph**, decode trong `tables.json["cf"]` |
| `text` | CP1251 thuần, field tách `=`, record tách xuống dòng | **UI strings Nga**: menu, 5 mode, HUD từng mode, pause dialog |
| `text1` | UTF-8 | Credits: NET Lizard 2008, v2.1, team dev |
| `text2` | UTF-8 | Help: mô tả 5 mode |
| `text3` | CP1251 | Mô tả cài đặt + mode |
| `text4` | CP1251 | Chuỗi phụ (Вкл/Выкл, Загрузка…) |

Đầy đủ string đã decode: `analysis/data/strings-ru.txt`.

## 6. Chuỗi UI quan trọng (text.png, dịch sang tiếng Việt)

- Menu: Новая игра (Chơi mới) = Опции (Tuỳ chọn) = Помощь (Trợ giúp) = Об игре (Về game) = Выход (Thoát)
- Chọn nhân vật: **Солдат (Lính) / Мутант (Đột biến)** → khớp lính A/B trong u3
- 5 mode: **Дедматч (DM), Тим дедматч (Team DM), Выжить (Sinh tồn), Захвати флаг (Cướp cờ), Последний герой (Anh hùng cuối)** — khớp 5 mode trong port web
- HUD theo mode: Фраги/Смерти/Флаги/Раунды + Время + Игроки + Баланс

## 7. Kiểm chứng với port web (`web-port/`)

| Trên JAR | Trong port | Trạng thái |
|---|---|---|
| 5 mode | 5 mode trong tt-core.js | ✅ đúng |
| Lính u3 40×39 + composite ca | u3 (0,0,40×39) + tint đội | ✅ (PR #16) |
| Muzzle flash u0 rows 43–48 | KIT.flash 3 frame | ✅ (PR #16) |
| Nổ u6 rows 33–42 / 69–77 | KIT.boomBig 10 / boomSmall 9 | ✅ (PR #16) |
| Cờ u4 + căn cứ u7 | KIT.flagRed/Green + base | ✅ (PR #16) |
| wlg 16 set vũ khí | 6 weapon tự thiết kế | ⚠️ port đơn giản hoá (theo thiết kế, không parse wlg) |
| wpn/obj0/ll level data | Map sinh thuật toán | ⚠️ port không dùng level data gốc (single-arena modes) |
| Âm thanh: không có data | WebAudio synth | ✅ tương đương |
