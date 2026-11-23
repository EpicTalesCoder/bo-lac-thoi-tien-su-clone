#!/usr/bin/env python3
"""Copy every non-class JAR resource byte-for-byte for the browser decoder.

The output directory must not exist or must be empty. This avoids extracting
archive paths over unrelated repository files. No archive code is executed.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path, PurePosixPath
import sys
import zipfile


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: python3 -I export_web_assets.py <original.jar> <new-empty-output-dir>", file=sys.stderr)
        return 2
    jar_path = Path(sys.argv[1]).resolve()
    out_dir = Path(sys.argv[2]).resolve()
    if not jar_path.is_file():
        raise SystemExit(f"JAR not found: {jar_path}")
    if out_dir.exists() and any(out_dir.iterdir()):
        raise SystemExit(f"Refusing to overwrite non-empty output directory: {out_dir}")
    out_dir.mkdir(parents=True, exist_ok=True)

    records: list[dict[str, object]] = []
    with zipfile.ZipFile(jar_path) as archive:
        for info in archive.infolist():
            if info.is_dir() or info.filename.endswith(".class") or info.filename.startswith("META-INF/"):
                continue
            rel = PurePosixPath(info.filename)
            if rel.is_absolute() or any(part in ("", ".", "..") for part in rel.parts):
                raise SystemExit(f"Unsafe resource path in JAR: {info.filename!r}")
            data = archive.read(info)
            target = out_dir.joinpath(*rel.parts)
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
            records.append({
                "path": rel.as_posix(),
                "bytes": len(data),
                "sha256": hashlib.sha256(data).hexdigest(),
            })
    manifest = {
        "sourceJar": jar_path.name,
        "sourceJarSha256": hashlib.sha256(jar_path.read_bytes()).hexdigest(),
        "resources": records,
    }
    (out_dir / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"Exported {len(records)} byte-identical JAR resources to {out_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
