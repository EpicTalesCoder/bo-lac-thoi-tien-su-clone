#!/usr/bin/env python3
"""
Build static Multi-Game Web Portal + all games/<slug>/web-port into dist/
for zero-config deployment on Vercel, Cloudflare Pages, Netlify, and GitHub Pages.
Automatically stamps all built HTML/JS/CSS references with a unique build version
so Discord Activity & browsers never serve stale cached code.
"""
import json
import pathlib
import re
import shutil
import time

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
MANIFEST = ROOT / "games" / "games-manifest.json"
BUILD_VER = str(int(time.time()))


def bust_web_port_cache(dst_web: pathlib.Path, ver: str):
    # 1. Stamp index.html script & stylesheet URLs
    idx_path = dst_web / "index.html"
    if idx_path.exists():
        html = idx_path.read_text(encoding="utf-8")
        html = re.sub(r'src="game\.js(?:\?v=[^"]*)?"', f'src="game.js?v={ver}"', html)
        html = re.sub(r'href="style\.css(?:\?v=[^"]*)?"', f'href="style.css?v={ver}"', html)
        idx_path.write_text(html, encoding="utf-8")

    # 2. Stamp relative ES module imports (from './foo.js') in all built .js files
    import_re = re.compile(r"""(from\s+['"]\./[A-Za-z0-9._-]+\.js)(?:\?v=[^'"]*)?(['"])""")
    for js_file in dst_web.glob("*.js"):
        src = js_file.read_text(encoding="utf-8")
        stamped = import_re.sub(rf"\1?v={ver}\2", src)
        if stamped != src:
            js_file.write_text(stamped, encoding="utf-8")


def main():
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True, exist_ok=True)

    # Copy portal index.html + legal pages (Terms of Service & Privacy Policy for Discord Activity)
    shutil.copy2(ROOT / "portal" / "index.html", DIST / "index.html")
    for page in ("terms", "privacy"):
        src_page = ROOT / "portal" / f"{page}.html"
        if src_page.exists():
            shutil.copy2(src_page, DIST / f"{page}.html")
            (DIST / page).mkdir(parents=True, exist_ok=True)
            shutil.copy2(src_page, DIST / page / "index.html")

    # Copy games manifest (append build version to entry links so portal opens fresh game HTML)
    (DIST / "games").mkdir(parents=True, exist_ok=True)
    games = json.loads(MANIFEST.read_text(encoding="utf-8"))
    for game in games:
        if isinstance(game.get("entry"), str):
            base_entry = game["entry"].split("?")[0]
            game["entry"] = f"{base_entry}?v={BUILD_VER}"
    (DIST / "games" / "games-manifest.json").write_text(
        json.dumps(games, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    for game in games:
        slug = game["slug"]
        src_web = ROOT / "games" / slug / "web-port"
        dst_web = DIST / "games" / slug / "web-port"
        if not src_web.exists():
            raise FileNotFoundError(f"Missing web-port directory for {slug}: {src_web}")
        shutil.copytree(
            src_web,
            dst_web,
            ignore=shutil.ignore_patterns("tests", "*.test.mjs"),
        )
        bust_web_port_cache(dst_web, BUILD_VER)
        print(f"[OK] Packaged games/{slug}/web-port -> dist/games/{slug}/web-port (v={BUILD_VER})")

    print(f"[DONE] Multi-game portal built at: {DIST}")


if __name__ == "__main__":
    main()
