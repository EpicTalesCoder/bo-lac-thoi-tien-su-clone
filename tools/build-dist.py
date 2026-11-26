#!/usr/bin/env python3
"""
Build the Multi-Game Web Portal + all game web-ports into dist/ for Vercel,
Netlify, GitHub Pages, or local serving.
"""
from concurrent.futures import ThreadPoolExecutor
import json
import os
import pathlib
import re
import shutil
import subprocess
import tempfile
import time

ROOT = pathlib.Path(__file__).resolve().parent.parent
PORTAL_DIR = ROOT / "portal"
MANIFEST = ROOT / "games" / "games-manifest.json"
DIST = ROOT / "dist"
BUILD_VER = str(int(time.time()))


def append_version(url: str, ver: str) -> str:
    base = re.sub(r"([?&])v=[^&]*&?", r"\1", url).rstrip("?&")
    sep = "&" if "?" in base else "?"
    return f"{base}{sep}v={ver}"


def bust_web_port_cache(dst_web: pathlib.Path, ver: str) -> None:
    """Stamp index.html and relative ES module imports with the build version."""
    idx_path = dst_web / "index.html"
    if idx_path.exists():
        html = idx_path.read_text(encoding="utf-8")
        html = re.sub(r'src="game\.js(?:\?v=[^"]*)?"', f'src="game.js?v={ver}"', html)
        html = re.sub(r'href="style\.css(?:\?v=[^"]*)?"', f'href="style.css?v={ver}"', html)
        idx_path.write_text(html, encoding="utf-8")

    import_re = re.compile(r"""(from\s+['"]\./[A-Za-z0-9._-]+\.js)(?:\?v=[^'"]*)?(['"])""")
    for js_file in dst_web.glob("*.js"):
        src = js_file.read_text(encoding="utf-8")
        stamped = import_re.sub(rf"\1?v={ver}\2", src)
        if stamped != src:
            js_file.write_text(stamped, encoding="utf-8")


def clone_remote_web_port(repo_url: str, clone_dir: pathlib.Path) -> pathlib.Path:
    """Sparse-checkout only web-port/ from a standalone sibling game repository."""
    sparse_cmd = [
        "git", "clone", "--depth", "1", "--filter=blob:none", "--no-checkout",
        repo_url, str(clone_dir),
    ]
    res = subprocess.run(sparse_cmd, capture_output=True, text=True)
    if res.returncode == 0:
        subprocess.run(["git", "-C", str(clone_dir), "sparse-checkout", "set", "web-port"], check=True, capture_output=True, text=True)
        subprocess.run(["git", "-C", str(clone_dir), "checkout"], check=True, capture_output=True, text=True)
    else:
        if clone_dir.exists():
            shutil.rmtree(clone_dir)
        subprocess.run(["git", "clone", "--depth", "1", repo_url, str(clone_dir)], check=True, capture_output=True, text=True)
    return clone_dir / "web-port"


def resolve_game_web_port(game: dict, tmp_root: pathlib.Path) -> tuple[str, pathlib.Path, str]:
    """Locate local web-port or fetch it from the game's GitHub repository."""
    slug = game["slug"]
    force_remote = os.environ.get("PORTAL_FORCE_REMOTE") == "1"

    if slug == "bo-lac-thoi-tien-su":
        return slug, ROOT / "web-port", "local"

    sibling_web = ROOT.parent / slug / "web-port"
    if sibling_web.is_dir() and not force_remote:
        return slug, sibling_web, "sibling"

    repo_url = game.get("repo") or f"https://github.com/EpicTalesCoder/{slug}-clone.git"
    return slug, clone_remote_web_port(repo_url, tmp_root / slug), "remote"


def main() -> None:
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True, exist_ok=True)

    if not PORTAL_DIR.exists() or not MANIFEST.exists():
        raise FileNotFoundError("Missing portal/ or games/games-manifest.json")

    shutil.copy2(PORTAL_DIR / "index.html", DIST / "index.html")
    for page in ("terms", "privacy"):
        src_page = PORTAL_DIR / f"{page}.html"
        if src_page.exists():
            shutil.copy2(src_page, DIST / f"{page}.html")
            (DIST / page).mkdir(parents=True, exist_ok=True)
            shutil.copy2(src_page, DIST / page / "index.html")

    games = json.loads(MANIFEST.read_text(encoding="utf-8"))
    manifest_out = []
    for game in games:
        entry = dict(game)
        for key in ("playUrl", "directGameUrl"):
            if isinstance(entry.get(key), str):
                entry[key] = append_version(entry[key], BUILD_VER)
        manifest_out.append(entry)

    (DIST / "games").mkdir(parents=True, exist_ok=True)
    (DIST / "games" / "games-manifest.json").write_text(
        json.dumps(manifest_out, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    with tempfile.TemporaryDirectory(prefix="portal-games-") as tmp_dir:
        tmp_root = pathlib.Path(tmp_dir)
        with ThreadPoolExecutor(max_workers=min(6, max(1, len(games)))) as pool:
            resolved = list(pool.map(lambda g: resolve_game_web_port(g, tmp_root), games))

        for slug, src_web, source_kind in resolved:
            if not src_web.is_dir():
                raise FileNotFoundError(f"Missing web-port directory for {slug}: {src_web}")
            dst_web = DIST / "games" / slug / "web-port"
            shutil.copytree(
                src_web,
                dst_web,
                ignore=shutil.ignore_patterns("tests", "*.test.mjs", ".DS_Store"),
            )
            bust_web_port_cache(dst_web, BUILD_VER)
            print(f"[OK] Packaged games/{slug}/web-port ({source_kind}) -> {dst_web} (v={BUILD_VER})")

    print(f"[DONE] Multi-game portal built at: {DIST} ({len(games)} games, v={BUILD_VER})")


if __name__ == "__main__":
    main()
