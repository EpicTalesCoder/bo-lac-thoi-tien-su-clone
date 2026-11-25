# Bộ lạc thời tiền sử (`Prehistoric Tribes`) — Standalone Clone

- **Vendor**: Inlogic Software
- **Resolution**: `240×320`
- **Genre**: Chiến thuật thời gian thực (RTS)

- Phaser 3 WebGL · 60 FPS Camera & Movement
- 10 màn Chiến dịch + Trận tùy chỉnh
- 5 ngôn ngữ gốc (/0../4) & Web Audio MIDI (/sa)

## Project Layout

- `original/` — Original untouched J2ME `.jar`
- `analysis/` — Decompiled Java sources, `javap` bytecode dumps, and decoded binary tables/assets
- `web-port/` — HTML5 Canvas/WebGL + ES Modules web port & Node unit tests
- `api/mp.mjs` — Same-origin multiplayer relay (`/api/mp`) for Vercel & Discord Activity
- `tools/build-dist.py` — Packages `web-port/` to `dist/` with cache-busting `?v=<timestamp>`
- `tools/verify-port-parity.py` — Runs syntax, unit tests, and decompilation parity checks


## Run, Test & Deploy

```bash
# Run unit tests
npm test

# Run parity checks
python3 tools/verify-port-parity.py

# Build dist/ and preview locally
npm run build
npm start
```
