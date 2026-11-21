#!/usr/bin/env python3
"""
Scaffold a new J2ME (.jar) reverse-engineering & HTML5 web-port project inside games/<slug>/.
Usage:
  python3 tools/new-game-port.py <slug> <path-to-jar> ["Display Title"]
"""
import hashlib
import json
import pathlib
import shutil
import sys
import zipfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
MANIFEST_PATH = ROOT / "games" / "games-manifest.json"


def sha256_file(path: pathlib.Path) -> str:
    h = hashlib.sha256()
    h.update(path.read_bytes())
    return h.hexdigest()


def main():
    if len(sys.argv) < 3:
        print("Usage: python3 tools/new-game-port.py <slug> <path-to-jar> [\"Display Title\"]")
        sys.exit(1)

    slug = sys.argv[1].strip().lower()
    jar_src = pathlib.Path(sys.argv[2]).expanduser().resolve()
    title = sys.argv[3] if len(sys.argv) >= 4 else slug.replace("-", " ").title()

    if not jar_src.exists():
        print(f"Error: JAR file not found: {jar_src}")
        sys.exit(1)

    game_dir = ROOT / "games" / slug
    orig_dir = game_dir / "original"
    analysis_dir = game_dir / "analysis"
    recovered_dir = analysis_dir / "recovered"
    decompiled_dir = analysis_dir / "decompiled-cfr"
    bytecode_dir = analysis_dir / "bytecode-evidence"
    web_dir = game_dir / "web-port"
    assets_dir = web_dir / "assets"

    for d in [orig_dir, recovered_dir, decompiled_dir, bytecode_dir, assets_dir]:
        d.mkdir(parents=True, exist_ok=True)

    # 1. Copy untouched original JAR
    jar_dst = orig_dir / jar_src.name
    shutil.copy2(jar_src, jar_dst)
    print(f"[1/4] Copied untouched JAR to {jar_dst} (SHA-256: {sha256_file(jar_dst)})")

    # 2. Extract JAR contents into analysis/recovered and record SHA-256 manifest
    manifest_lines = []
    with zipfile.ZipFile(jar_dst, "r") as zf:
        zf.extractall(recovered_dir)
    for item in sorted(recovered_dir.rglob("*")):
        if item.is_file():
            rel = item.relative_to(recovered_dir)
            manifest_lines.append(f"{sha256_file(item)}  {rel}")
    (analysis_dir / "ASSETS-SHA256.txt").write_text("\n".join(manifest_lines) + "\n", encoding="utf-8")
    print(f"[2/4] Extracted {len(manifest_lines)} entries into {recovered_dir}")

    # 3. Create starter web-port/index.html + phaser-engine.js if not present
    shutil.copy2(
        ROOT / "games" / "bo-lac-thoi-tien-su" / "web-port" / "phaser-engine.js",
        web_dir / "phaser-engine.js",
    )
    index_html = web_dir / "index.html"
    if not index_html.exists():
        index_html.write_text(
            f"""<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title} — Phaser 3 Web Port</title>
</head>
<body style="background:#111;color:#eee;font-family:monospace;text-align:center;padding:32px">
  <h1>{title}</h1>
  <canvas id="game" width="240" height="320" style="border:1px solid #444;image-rendering:pixelated"></canvas>
  <p><a href="../../../index.html" style="color:#9cff7b">← Quay lại Cổng Game</a></p>
  <script src="https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js"></script>
  <script type="module">
    import {{ mountPhaserRuntime }} from './phaser-engine.js';
    mountPhaserRuntime({{
      canvas: document.getElementById('game'),
      width: 240,
      height: 320,
      tickMs: 120,
      onStepSimulation() {{}},
      onFrameInterpolate() {{ return false; }},
      onRenderFrame(ctx) {{
        ctx.fillStyle = '#18241b';
        ctx.fillRect(0, 0, 240, 320);
        ctx.fillStyle = '#9cff7b';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('{title}', 120, 150);
        ctx.fillStyle = '#ffd84d';
        ctx.font = '10px monospace';
        ctx.fillText('Phaser 3 WebGL Ready', 120, 172);
      }}
    }});
  </script>
</body>
</html>
""",
            encoding="utf-8",
        )
    print(f"[3/4] Initialized Phaser 3 web-port shell at {web_dir}")

    # 4. Register in games/games-manifest.json if not already listed
    games = json.loads(MANIFEST_PATH.read_text(encoding="utf-8")) if MANIFEST_PATH.exists() else []
    if not any(g["slug"] == slug for g in games):
        games.append(
            {
                "slug": slug,
                "title": title,
                "originalTitle": title,
                "vendor": "J2ME MIDP 2.0",
                "resolution": "240×320",
                "genre": "J2ME Classic",
                "jarFile": f"games/{slug}/original/{jar_src.name}",
                "playUrl": f"./games/{slug}/web-port/index.html",
                "directGameUrl": f"./games/{slug}/web-port/index.html",
                "coverImage": "./games/bo-lac-thoi-tien-su/web-port/assets/campaign-captures/frame-03.png",
                "status": "in-progress",
                "features": ["Original JAR extracted", "Web port scaffolded"],
            }
        )
        MANIFEST_PATH.write_text(json.dumps(games, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"[4/4] Registered '{slug}' in {MANIFEST_PATH}")


if __name__ == "__main__":
    main()
