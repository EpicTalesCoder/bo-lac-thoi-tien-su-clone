#!/usr/bin/env python3
"""Decode the tile-property lookup using the read sequence from i.b()."""
from __future__ import annotations

import json
from pathlib import Path
import struct
import sys

MAX_TILE_COUNT = 512


def decode(data: bytes) -> dict:
    if len(data) < 4:
        raise ValueError("truncated tiles0.prop header")
    count, secondary = struct.unpack_from(">hh", data)
    if not 0 <= count <= MAX_TILE_COUNT or len(data) < 4 + count:
        raise ValueError(f"invalid tiles0.prop length/count: {len(data)}, {count}")
    properties = data[4 : 4 + count]
    trailer = data[4 + count :]
    return {
        "tileCount": count,
        "unknownHeaderValue": secondary,
        # Java reads exactly `count` signed bytes; preserve any unparsed trailer.
        "rawSignedProperties": [value - 256 if value & 0x80 else value for value in properties],
        "unparsedTrailerHex": trailer.hex(),
    }


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: decode_terrain_properties.py TILES0_PROP OUTPUT_JSON", file=sys.stderr)
        return 2
    source, output = Path(sys.argv[1]), Path(sys.argv[2])
    result = decode(source.read_bytes())
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Decoded {result['tileCount']} tile properties into {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
