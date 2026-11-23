#!/usr/bin/env python3
"""Convert Ancient Empires II map records into inspectable JSON, without running game code."""
from __future__ import annotations

import json
from pathlib import Path
import struct
import sys


def decode(path: Path) -> dict:
    data = path.read_bytes()
    if len(data) < 8:
        raise ValueError(f"{path.name}: truncated dimensions")
    width, height = struct.unpack_from(">ii", data)
    if not (1 <= width <= 128 and 1 <= height <= 128):
        raise ValueError(f"{path.name}: unreasonable map dimensions {width}x{height}")
    count = width * height
    pos = 8
    if pos + count > len(data):
        raise ValueError(f"{path.name}: truncated tile grid")
    # Decompiled i.b(int) and bytecode show that the archive stores x outermost,
    # y innermost. Preserve that shape as tiles[x][y] for direct source parity.
    flat_tiles = list(data[pos : pos + count])
    tiles = [
        [flat_tiles[x * height + y] for y in range(height)]
        for x in range(width)
    ]
    pos += count
    if pos + 4 > len(data):
        raise ValueError(f"{path.name}: missing owner metadata count")
    owner_count, = struct.unpack_from(">i", data, pos)
    pos += 4
    if not 0 <= owner_count <= 4096 or pos + owner_count * 4 > len(data):
        raise ValueError(f"{path.name}: invalid owner metadata count {owner_count}")
    owner_metadata = list(struct.unpack_from(f">{owner_count}i", data, pos)) if owner_count else []
    pos += owner_count * 4
    if pos + 4 > len(data):
        raise ValueError(f"{path.name}: missing unit record count")
    unit_count, = struct.unpack_from(">i", data, pos)
    pos += 4
    if not 0 <= unit_count <= 512 or pos + unit_count * 5 > len(data):
        raise ValueError(f"{path.name}: invalid unit record count {unit_count}")
    units = []
    for _ in range(unit_count):
        kind, pixel_x, pixel_y = struct.unpack_from(">Bhh", data, pos)
        pos += 5
        units.append({
            "encodedType": kind,
            "type": kind % 12,
            "team": kind // 12,
            "pixelX": pixel_x,
            "pixelY": pixel_y,
            "x": pixel_x // 24,
            "y": pixel_y // 24,
        })
    if pos != len(data):
        raise ValueError(f"{path.name}: {len(data) - pos} trailing bytes after unit records")
    return {
        "source": path.name,
        "width": width,
        "height": height,
        "tileSize": 24,
        "tiles": tiles,
        "skippedSection": {"count": owner_count, "int32ValuesRaw": owner_metadata},
        "units": units,
    }


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: decode_maps.py RESOURCE_PACK_DIR OUTPUT_JSON", file=sys.stderr)
        return 2
    source, output = Path(sys.argv[1]), Path(sys.argv[2])
    maps = {}
    for prefix, stop in (("m", 8), ("s", 12)):
        for index in range(stop):
            path = source / f"{prefix}{index}"
            if path.exists():
                key = f"{prefix}{index}"
                maps[key] = decode(path)
    if not maps:
        raise SystemExit(f"no supported maps found in {source}")
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps({"format": "ancient-empires-ii-map-json-v1", "maps": maps}, indent=2) + "\n", encoding="utf-8")
    print(f"Decoded {len(maps)} maps into {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
