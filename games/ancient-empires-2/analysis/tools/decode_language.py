#!/usr/bin/env python3
"""Decode the MIDlet's DataInputStream.writeUTF-compatible language table."""
from __future__ import annotations

import json
from pathlib import Path
import struct
import sys


def decode(data: bytes) -> list[str]:
    if len(data) < 4:
        raise ValueError("truncated lang.dat header")
    count, = struct.unpack_from(">i", data)
    if not 0 <= count <= 10000:
        raise ValueError(f"unreasonable string count: {count}")
    pos = 4
    strings = []
    for _ in range(count):
        if pos + 2 > len(data):
            raise ValueError("truncated modified UTF-8 string length")
        size, = struct.unpack_from(">H", data, pos)
        pos += 2
        if pos + size > len(data):
            raise ValueError("truncated modified UTF-8 string")
        # This game's shipped English table uses standard UTF-8-compatible bytes.
        strings.append(data[pos : pos + size].decode("utf-8", errors="strict"))
        pos += size
    if pos != len(data):
        raise ValueError(f"{len(data) - pos} trailing bytes after string table")
    return strings


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: decode_language.py LANG_DAT OUTPUT_JSON", file=sys.stderr)
        return 2
    source, output = Path(sys.argv[1]), Path(sys.argv[2])
    strings = decode(source.read_bytes())
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(strings, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Decoded {len(strings)} strings into {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
