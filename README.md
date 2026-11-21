# J2ME Native Web Ports Monorepo

Hệ thống Monorepo dùng để dịch ngược (reverse-engineer) và chuyển đổi trực tiếp các tựa game J2ME (`.jar` MIDP 2.0) sang **HTML5 Canvas + ES Modules + Web Audio API** chạy trực tiếp trên trình duyệt (không dùng giả lập Java).

---

## Cấu trúc thư mục chuẩn

```text
.
├── portal/
│   └── index.html                     # Cổng chọn game (Launcher) ở trang chủ
├── games/
│   ├── games-manifest.json            # Danh sách tất cả các game hiển thị trên Portal
│   └── bo-lac-thoi-tien-su/           # Game 1: Bộ lạc thời tiền sử (Prehistoric Tribes)
│       ├── original/
│       │   └── Bolacthoitiensu.jar    # File JAR gốc nguyên bản (bảo toàn 100% SHA-256)
│       ├── analysis/                  # Toàn bộ dữ liệu dịch ngược & đối chiếu bytecode
│       │   ├── ANALYSIS-README.md
│       │   ├── ASSETS-SHA256.txt
│       │   ├── CLASS-RESPONSIBILITIES.md
│       │   ├── bytecode-evidence/     # javap -c -p -v cho toàn bộ 8 class
│       │   ├── decoded-assets/        # Ảnh PNG giải mã từ /pi0, /pi8, /pi9
│       │   ├── decompiled-cfr/        # Mã nguồn Java dịch ngược bằng CFR
│       │   ├── decompiled-procyon/    # Mã nguồn Java dịch ngược bằng Procyon
│       │   ├── rebuild-attempt/       # Bản对照 & ảnh chụp màn hình từ FreeJ2ME
│       │   └── recovered/             # Tài nguyên nhị phân giải nén từ JAR (/a, /ma, /pd0, /sa, /0..4)
│       └── web-port/                  # Bản HTML5/Canvas/JS chạy trực tiếp trên trình duyệt
│           ├── index.html
│           ├── game.js
│           ├── render-original.js
│           ├── scenario-loader.js
│           ├── campaign-story.js
│           ├── storage-i18n.js
│           ├── audio-binary.js
│           └── assets/
├── tools/
│   ├── build-portal.py                # Đóng gói Portal + toàn bộ games/<slug>/web-port vào dist/
│   ├── new-game-port.py               # Khởi tạo nhanh cấu trúc thư mục cho một game .jar mới
│   └── extract_a.py                   # Script giải mã các bảng nhị phân từ /a, /pd0, /ma
├── vercel.json                        # Cấu hình CI/CD tự động cho Vercel
├── netlify.toml                       # Cấu hình CI/CD tự động cho Netlify
└── .github/workflows/
    └── deploy-web-port.yml            # GitHub Actions kiểm tra cú pháp & deploy tự động
```

---

## Cách thêm một dự án game `.jar` mới vào Monorepo

Khi bạn có một file `.jar` mới cần clone/port, chỉ cần chạy 1 lệnh:

```bash
python3 tools/new-game-port.py <slug-game> <duong-dan-file.jar> "Tên Hiển Thị Của Game"
```

Ví dụ:
```bash
python3 tools/new-game-port.py anh-hung-thoi-loan ~/Downloads/AnhHungThoiLoan.jar "Anh Hùng Thời Loạn"
```

Script `tools/new-game-port.py` sẽ tự động:
1. Copy file `.jar` gốc nguyên vẹn vào `games/<slug>/original/`.
2. Giải nén toàn bộ tài nguyên nhị phân vào `games/<slug>/analysis/recovered/` và ghi mã băm đối chiếu `ASSETS-SHA256.txt`.
3. Tạo khung `games/<slug>/web-port/index.html` và thư mục `assets/`.
4. Đăng ký game mới vào `games/games-manifest.json` để hiển thị ngay trên trang chủ Portal!

---

## Chạy thử ở máy local & Build CI/CD

- **Build toàn bộ cổng Portal + tất cả các game ra thư mục `dist/`**:
  ```bash
  python3 tools/build-portal.py
  python3 -m http.server 4179 --bind 127.0.0.1 --directory dist
  ```
- **Chạy bộ kiểm thử tự động của game Bộ lạc thời tiền sử**:
  ```bash
  node --test games/bo-lac-thoi-tien-su/web-port/tests/strategy.test.mjs
  ```
