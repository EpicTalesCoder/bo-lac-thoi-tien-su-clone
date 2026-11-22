# Kiến trúc Dự án & Định hướng Thiết kế (Project Design & Roadmap)

Tài liệu này dành cho các thành viên mới và **AI Agent** tham gia phát triển kho mã nguồn **REA + J2ME Native Web Ports Monorepo** (bao gồm tựa game **Bộ lạc thời tiền sử — Prehistoric Tribes** và nền tảng dịch ngược **REA**).

---

## 1. Tổng quan Kiến trúc Monorepo

Kho mã nguồn hợp nhất **2 tầng công việc** trong cùng một repository để lập trình viên và AI Agent có thể dịch ngược (reverse-engineer) và port game J2ME ngay trong một workspace duy nhất:

```text
.
├── src/, bridge/, native/, scripts/, tests/   # Mã nguồn đầy đủ của REA (Reverse Engineering Agent / MCP)
├── .agents/, .claude-plugin/, .codex-plugin/, # Cấu hình skill/plugin cho AI Agent (Claude, Codex, Cursor, AGY)
│   .cursor-plugin/, AGENTS.md, mcp.json
├── docs/                                      # Tài liệu kỹ thuật REA & tài liệu thiết kế game
│   └── PROJECT_DESIGN_AND_ROADMAP.md          # (File này) Hướng dẫn kiến trúc & lộ trình mở rộng
├── api/
│   └── mp.mjs                                 # Vercel Serverless Relay (/api/mp) nối cầu MQTT đa instance
├── portal/
│   ├── index.html                             # Cổng Launcher chọn game
│   ├── terms.html                             # Điều khoản dịch vụ (Discord Activity)
│   └── privacy.html                           # Chính sách bảo mật (Discord Activity)
├── games/
│   ├── games-manifest.json                    # Đăng ký các tựa game hiển thị trên Portal
│   └── bo-lac-thoi-tien-su/                   # Game 1: Bộ lạc thời tiền sử (Prehistoric Tribes)
│       ├── original/Bolacthoitiensu.jar       # File JAR gốc nguyên bản (KHÔNG CHỈNH SỬA)
│       ├── analysis/                          # Dữ liệu dịch ngược, bytecode, decompiled Java
│       └── web-port/                          # Bản HTML5 Canvas + ES Modules chạy trực tiếp
├── tools/
│   ├── build-portal.py                        # Build dist/ + tự gắn ?v=<timestamp> chống cache
│   ├── new-game-port.py                       # Khởi tạo nhanh khung port cho game .jar mới
│   └── extract_a.py                           # Giải mã bảng nhị phân gốc từ JAR
└── vercel.json                                # Deploy tĩnh dist/ + /api/mp (sin1) + header no-store
```

---

## 2. Kiến trúc Game `bo-lac-thoi-tien-su/web-port`

Toàn bộ game được port **thuần HTML5/ES Modules** dựa trực tiếp trên bảng nhị phân gốc `/a`, `/ma`, `/pd0`, `/sa`, `/pi0`, `/pi9` (không chạy JVM):

| Module | Vai trò chính |
|---|---|
| `scenario-loader.js` | Giải mã 10 màn chơi từ `/ma`, thông số công trình (`mo[138]`), spawn dân làng / công trình / 4 phe (`prepareMultiplayerMatch`), logic vào/ra Lều (`enterRestHut`), sinh con (`spawnNewbornVillager`). |
| `render-original.js` | Bộ vẽ pixel-art 1:1 theo `f.java`: địa hình, bóng mây, công trình nhiều lớp, nhân vật lắp ghép (`pi0` / `pi9`), bảng màu tự động cho 4 phe (Xanh/Đỏ/Vàng/Tím), hiệu ứng va chạm vũ khí (`hitEffects`), đạn bay (`projectiles`), HUD gốc & minimap. |
| `game.js` | Vòng lặp mô phỏng RTS trung tâm: tìm đường A*, thu thập tài nguyên, xây dựng theo từng đợt nguyên liệu, hệ thống nghề & điểm kỹ năng (`grantSkillXp` chuẩn bảng `mo[126]`/`mo[127]`), sinh tồn (ăn/ngủ/vui/chữa bệnh), lão hoá tự nhiên (75–100+ tuổi), AI bộ lạc mô phỏng sinh hoạt thật (`stepAiCommander`), chiến đấu & thú dữ. |
| `phaser-engine.js` | Bộ tăng tốc WebGL 60 FPS (Phaser 3) kèm **Web Worker 120ms ticker** để trận đấu không bị dừng khi chuyển tab; tự fallback mượt về Canvas 2D nếu CDN bị chặn (như trong Discord Activity). |
| `multiplayer.js` | Phòng chơi **2–4 người chọn phe** với 4 kênh truyền song song: **Same-Origin `/api/mp`** (Discord Activity & mọi firewall), **Dual MQTT-WSS** (EMQX + HiveMQ đồng thời), **WebRTC P2P (PeerJS)**, và **BroadcastChannel** (nhiều tab cùng máy). |
| `api/mp.mjs` | Serverless relay tại `/api/mp` (region `sin1` Singapore), tự động mở cầu nối `wss://broker.emqx.io:8084/mqtt` ở phía server để đồng bộ tất cả instance Vercel và cho phép **Discord Activity chơi chéo với Web/Mobile**. |
| `campaign-story.js` | Giải mã kịch bản chiến dịch `/0/d0`..`/4/d0`, điều kiện thắng/thua 10 màn & tính điểm. |
| `storage-i18n.js` | Đa ngôn ngữ 5 gói (`0..4`) và lưu/tải game trên `localStorage`. |
| `audio-binary.js` | Giải mã hiệu ứng âm thanh và 5 bản nhạc MIDI nhúng trong `/sa`. |

### Các bảng dữ liệu gốc quan trọng cần giữ nguyên
- **`entityData` (`e[...]`)**:
  - Vị trí: `e[uid]` (x), `e[101 + uid]` (y), hướng `e[606 + uid]`.
  - Chỉ số sinh tồn: Tuổi `e[1414 + uid]`, Giới tính `e[1515 + uid]`, HP `e[1919 + uid]` / MaxHP `e[6767 + uid]`, Ngủ `e[2020 + uid]`, No `e[2121 + uid]`, Vui `e[505 + uid]`.
  - Kỹ năng chuẩn `mo[126]`/`mo[127]`: Thu thập `e[6969]`, Thợ rèn `e[7070]`, Đầu bếp `e[7171]`, DJ `e[7272]`, Pháp sư `e[7373]`, Xây dựng `e[7474]`, Chăm trẻ/PIA `e[7575]` (bias `-1`, lưu `1..10` hiển thị `0..9`); Cận chiến `e[1717]` (skill 14) và Ném xa `e[1616]` (skill 15) (bias `0`, `0..9`).
  - Top kỹ năng hiển thị trên Panel 4: Dân sự `e[2323]`, `e[2424]`; Chiến đấu `e[2525]`, `e[2626]`.
- **Không bao giờ sửa file gốc** `games/bo-lac-thoi-tien-su/original/Bolacthoitiensu.jar`.
- **Giữ nguyên thẻ** `<script type="module" src="game.js"></script>` trong file nguồn `web-port/index.html` (script `tools/build-portal.py` sẽ tự động gắn `?v=<timestamp>` khi đóng gói ra `dist/`).

---

## 3. Quy trình Phát triển, Kiểm thử & Deploy

### Chạy & kiểm thử ở máy local
```bash
# 1. Kiểm tra cú pháp JS
node --check games/bo-lac-thoi-tien-su/web-port/game.js
node --check games/bo-lac-thoi-tien-su/web-port/render-original.js
node --check games/bo-lac-thoi-tien-su/web-port/multiplayer.js
node --check api/mp.mjs

# 2. Chạy bộ unit test (phải pass 11/11 trước khi push)
node --test games/bo-lac-thoi-tien-su/web-port/tests/strategy.test.mjs

# 3. Build portal + đóng gói chống cache ra dist/
python3 tools/build-portal.py
python3 -m http.server 4179 --bind 127.0.0.1 --directory dist
```

### Deploy trên Vercel & Discord Activity
- Push lên nhánh `main` → Vercel tự chạy `python3 tools/build-portal.py` (`installCommand: "true"`, không cần `npm install` để deploy nhanh ~15s).
- Mọi trang HTML/JS/CSS đều có header `no-store` (`vercel.json`) và tự gắn `?v=<timestamp>` trong `dist/` để Discord Activity không bị dính cache cũ.
- Trên **Discord Developer Portal → Activities → URL Mappings**, chỉ cần duy nhất 1 dòng:
  - Prefix `/` → Target `<ten-app>.vercel.app` (mọi request `/api/mp` đi thẳng cùng origin).

---

## 4. Định hướng Thiết kế & Lộ trình Mở rộng (Roadmap cho người tiếp theo)

Các cộng tác viên và AI Agent có thể tiếp tục phát triển theo **5 hướng ưu tiên** sau:

### Hướng 1: Nâng cấp Multiplayer & Hạ tầng Online
- **Server WebSocket / Durable Object riêng** (Cloudflare Workers + Durable Objects hoặc Render/Fly.io) hoặc **Upstash Redis** cho `/api/mp` để giảm độ trễ xuống <40ms, hỗ trợ hàng trăm phòng đồng thời không phụ thuộc public MQTT broker.
- **Tự động ghép phòng theo kênh thoại Discord (`instance_id`)**: tích hợp chính thức `@discord/embedded-app-sdk` để đọc tên người chơi Discord, avatar, và tự động gom các bạn trong cùng Voice Channel vào chung phòng mà không cần gõ mã 4 số.
- **Reconnection & Host Migration**: cho phép người chơi rớt mạng kết nối lại vào đúng bộ lạc đang chơi.

### Hướng 2: Chiều sâu Gameplay cho Prehistoric Tribes
- **Hoàn thiện cân bằng 4 phe & bản đồ đối kháng mới**: thiết kế thêm bản đồ đối xứng 2v2 / 4P FFA (cân bằng tài nguyên rừng, mỏ đá, cá, thú dữ ở 4 góc).
- **Kỹ năng tác động thực tế mạnh hơn**: tăng tốc độ chặt/đập/xây/nấu/rèn theo cấp độ kỹ năng `e[6969..7474]` (ví dụ thợ xây cấp cao đóng nhà nhanh hơn, thợ thu thập cấp cao vác được nhiều hơn).
- **Âm thanh & Hiệu ứng**: tinh chỉnh trình phát MIDI/SFX trong `audio-binary.js` để có âm thanh va chạm vũ khí, tiếng trống pháp sư, nhạc sàn disco và cảnh báo chiến trận rõ nét hơn.

### Hướng 3: Port thêm các tựa game J2ME mới vào Portal
- Sử dụng bộ công cụ dịch ngược **`rea`** có sẵn trong repo + lệnh khởi tạo:
  ```bash
  python3 tools/new-game-port.py <slug-game> <path/to/game.jar> "Tên Game"
  ```
- Giữ nguyên chuẩn cấu trúc `games/<slug>/{original,analysis,web-port}` và đăng ký vào `games/games-manifest.json` để tự động xuất hiện trên trang chủ Portal.

### Hướng 4: Trải nghiệm Mobile & Điều khiển cảm ứng
- Bổ sung thao tác chạm kéo khung chọn nhiều dân (2 ngón hoặc nút toggle Box-Select), phóng to/thu nhỏ pinch-to-zoom, và nút phím tắt nhanh trên màn hình cảm ứng (điện thoại & Discord Mobile).

### Hướng 5: Chất lượng mã & Kiểm thử tự động
- Mở rộng bộ test trong `games/bo-lac-thoi-tien-su/web-port/tests/` cho các kịch bản: AI sinh hoạt, lên cấp kỹ năng, sinh sản 4 phe, và mô phỏng đồng bộ `packWorldSnapshot` / `applyWorldSnapshot`.
- Tách dần `game.js` thành các module nhỏ theo miền nghiệp vụ (`ai-commander.js`, `combat.js`, `villager-needs.js`, `ui-menus.js`) để dễ bảo trì và cộng tác song song nhiều người/agent mà không xung đột merge.
