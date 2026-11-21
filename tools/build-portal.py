#!/usr/bin/env python3
"""
Build static Multi-Game Web Portal + all games/<slug>/web-port into dist/
for zero-config deployment on Vercel, Cloudflare Pages, Netlify, and GitHub Pages.
"""
import json
import pathlib
import shutil

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
MANIFEST = ROOT / "games" / "games-manifest.json"


def main():
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True, exist_ok=True)

    # Copy portal index.html
    shutil.copy2(ROOT / "portal" / "index.html", DIST / "index.html")

    # Copy games manifest
    (DIST / "games").mkdir(parents=True, exist_ok=True)
    shutil.copy2(MANIFEST, DIST / "games" / "games-manifest.json")

    games = json.loads(MANIFEST.read_text(encoding="utf-8"))
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
        print(f"[OK] Packaged games/{slug}/web-port -> dist/games/{slug}/web-port")

    print(f"[DONE] Multi-game portal built at: {DIST}")


if __name__ == "__main__":
    main()
