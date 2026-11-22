# Thông tin decompile toàn bộ JAR trong monorepo

> Cập nhật: 22/11/2026 — quét đồng bộ cả 3 game (CFR 0.152 + javap + asset decode). Xem chi tiết từng game trong `games/<slug>/analysis/`.

## Tổng quan

| | Bộ lạc thời tiền sử | Green Farm 3 | Total Tournament |
|---|---|---|---|
| JAR | `Bolacthoitiensu.jar` (506KB) | `green-farm-3-240x320.jar` (998KB) | `total-tournament.jar` (250KB) |
| Vendor | THQ | Gameloft | mob.ua (JaFan.ru repack) |
| Version | 0.1.28 | 1.0.3 | 1.0 |
| Config/Profile | CLDC-1.0 / MIDP-2.0 | CLDC-1.1 / MIDP-2.0 | CLDC-1.0 / **MIDP-1.0** |
| MIDlet chính | `tribes` | `GloftGF2M` | `tr` |
| Entry trong manifest | MIDlet-1 | MIDlet-1 | MIDlet-1 |
| Entries trong JAR | 47 | 174 | 56 |
| Số class | 8 | 24 (gồm `wfree/*` WMA stub ×9, `WapTai/*` watermark ×1) | 14 |
| Đã decompile | 8/8 (+bản Procyon & renamed) | **24/24** ✅ (trước đây thiếu 11 class subpackage) | 14/14 |
| Tổng dòng Java | 13.450 | **44.738** | 6.842 |
| Asset format | Asset XOR riêng (loader `b.java`) | GLLib BSprite v5 (`0x5DF`) + resource pack đánh số | PNG XOR 3 tầng (loader `b.java`) |
| Web-port | playable (game 1 của repo) | playable (Phase C) | playable |
| Bytecode evidence | có | 8 class chính | **6/6 class ✅ (mới thêm)** |

## Kết quả quét bảo mật / mạng

| | URL ngoài | RecordStore (save) | SMS/IAP |
|---|---|---|---|
| Bộ lạc | `https://waptai.com` (watermark WapTai) | RecordStore `<tên base>+<slot>` (f.java:6250) | không |
| Green Farm 3 | `gameloft.com/privacy-notice`, `waptai.com` | `RMSHeader`, `rmsAvailableProfiles`, `rmsCurrentCarrier`, `rmsCurrentRegion`, `rmsItemType`, `rmsMoneySpent`, **`save_farm<slot>`** (a.java:28044) | IAP via HTTP (`IAP_texts`, PaySMS trong `l.java`) |
| Total Tournament | không có | RecordStore qua helper `b.java:71` (openRecordStore tên động) | không |

- **Không có endpoint lạ** — chỉ watermark waptai.com (2 game repack) và privacy Gameloft.
- `wfree/*` trong Green Farm 3 là WMA message stub nhúng theo waptai, không phải code game.
- Green Farm 3 dùng IAP qua SMS/HTTP → bản port đã loại bỏ, không mock.

## Việc đã làm trong đợt này

1. **Green Farm 3: decompile đủ 24/24 class** — trước đây thiếu 11 class subpackage (`wfree/BinaryMessage…TextMessage`, `WapTai/COM/WapTai`) do glob `*.class` không đệ quy.
2. **Total Tournament: tạo bytecode evidence** `analysis/bytecode-evidence/*.javap.txt` (6 class: `a`,`b`,`c`,`d`,`e`,`tr`) — trước đây chưa có.
3. Báo cáo này (`docs/JARS-INFO.md`).

## Con trỏ nhanh

- Green Farm 3: `analysis/PACK-MAP.md` (resource pack), `TEXT-MAP.md` (text VI), `FRAMES-MAP.md` (frame gốc), `decompiled-cfr/` (44.738 dòng, entry `GloftGF2M` → game class `a extends f(Canvas)`)
- Bộ lạc: `analysis/ANALYSIS-README.md`, `CLASS-RESPONSIBILITIES.md`, `decompiled-cfr*` (3 biến thể), `rebuild-attempt/` (MicroEmulator)
- Total Tournament: `analysis/decompiled-cfr/` (entry `tr`), `frames.json`
