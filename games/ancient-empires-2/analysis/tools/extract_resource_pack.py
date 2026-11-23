#!/usr/bin/env python3
"""Extract Ancient Empires II's indexed 1.pak resources without executing code."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path, PurePosixPath
import struct
import sys


def u16(data: bytes, offset: int) -> tuple[int, int]:
    if offset + 2 > len(data):
        raise ValueError("truncated 1.pak uint16")
    return struct.unpack_from(">H", data, offset)[0], offset + 2


def parse(data: bytes) -> list[tuple[str, int, int]]:
    if len(data) < 4:
        raise ValueError("truncated 1.pak header")
    base, count = struct.unpack_from(">hH", data)
    if count > 4096:
        raise ValueError(f"unreasonable resource count: {count}")
    offset = 4
    records: list[tuple[str, int, int]] = []
    names: set[str] = set()
    for _ in range(count):
        name_size, offset = u16(data, offset)
        if offset + name_size > len(data):
            raise ValueError("truncated resource name")
        name = data[offset : offset + name_size].decode("utf-8")
        offset += name_size
        if offset + 6 > len(data):
            raise ValueError("truncated resource index record")
        relative, = struct.unpack_from(">i", data, offset)
        size, = struct.unpack_from(">h", data, offset + 4)
        offset += 6
        path = PurePosixPath(name)
        if not name or path.is_absolute() or ".." in path.parts or "\\" in name:
            raise ValueError(f"unsafe resource name: {name!r}")
        if name in names:
            raise ValueError(f"duplicate resource name: {name!r}")
        names.add(name)
        start, end = base + relative, base + relative + size
        if size < 0 or start < 0 or end > len(data):
            raise ValueError(f"resource outside archive: {name!r}")
        records.append((name, start, size))

    if offset != base:
        raise ValueError(f"index ends at {offset}, declared payload starts at {base}")
    intervals = sorted((start, start + size, name) for name, start, size in records)
    cursor = base
    for start, end, name in intervals:
        if start != cursor:
            raise ValueError(f"unexpected gap or overlap before {name!r}: {cursor}..{start}")
        cursor = end
    if cursor != len(data):
        raise ValueError(f"resource payload ends at {cursor}, archive ends at {len(data)}")
    return records


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: extract_resource_pack.py INPUT_1.PAK NEW_EMPTY_OUTPUT_DIR", file=sys.stderr)
        return 2
    source, output = Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve()
    if output.exists():
        raise SystemExit(f"output must not already exist: {output}")
    data = source.read_bytes()
    records = parse(data)
    output.mkdir(parents=True)
    manifest = []
    for name, start, size in records:
        payload = data[start : start + size]
        target = output.joinpath(*PurePosixPath(name).parts)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(payload)
        manifest.append({"name": name, "bytes": size, "sha256": hashlib.sha256(payload).hexdigest()})
    (output / "manifest.json").write_text(
        json.dumps({"source": "1.pak", "source_sha256": hashlib.sha256(data).hexdigest(), "resource_count": len(manifest), "resources": manifest}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Extracted {len(records)} resources from {source.name} into {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
