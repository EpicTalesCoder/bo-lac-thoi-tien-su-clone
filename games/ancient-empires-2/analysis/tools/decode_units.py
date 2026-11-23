#!/usr/bin/env python3
"""Decode units.bin using the read order observed in decompiled c.a(i)."""
from __future__ import annotations

import json
from pathlib import Path
import struct
import sys

UNIT_COUNT = 12
MAX_FILE_BYTES = 4096


def signed_byte(data: bytes, offset: int) -> tuple[int, int]:
    if offset >= len(data):
        raise ValueError("truncated byte")
    value = data[offset]
    return (value - 256 if value & 0x80 else value), offset + 1


def unsigned_byte(data: bytes, offset: int) -> tuple[int, int]:
    if offset >= len(data):
        raise ValueError("truncated byte")
    return data[offset], offset + 1


def decode(data: bytes) -> list[dict]:
    if len(data) > MAX_FILE_BYTES:
        raise ValueError(f"units.bin exceeds bounded size: {len(data)}")
    offset = 0
    records = []
    for record_id in range(UNIT_COUNT):
        fields = []
        for _ in range(6):
            value, offset = signed_byte(data, offset)
            fields.append(value)
        if offset + 2 > len(data):
            raise ValueError(f"record {record_id}: truncated short")
        short_value, = struct.unpack_from(">h", data, offset)
        offset += 2

        frame_count, offset = unsigned_byte(data, offset)
        if frame_count > 64 or offset + frame_count * 2 > len(data):
            raise ValueError(f"record {record_id}: invalid frame offset count {frame_count}")
        frame_offsets = []
        for _ in range(frame_count):
            dx, offset = signed_byte(data, offset)
            dy, offset = signed_byte(data, offset)
            frame_offsets.append([dx, dy])

        bit_count, offset = unsigned_byte(data, offset)
        if bit_count > 32:
            raise ValueError(f"record {record_id}: unreasonable movement-mask bit count {bit_count}")
        movement_mask_bits = []
        for _ in range(bit_count):
            bit_index, offset = unsigned_byte(data, offset)
            if bit_index > 15:
                raise ValueError(f"record {record_id}: movement-mask bit index out of range: {bit_index}")
            movement_mask_bits.append(bit_index)

        records.append({
            "recordId": record_id,
            "fields": fields,
            "shortValue": short_value,
            "frameOffsets": frame_offsets,
            "movementMaskBits": movement_mask_bits,
        })

    if offset != len(data):
        raise ValueError(f"{len(data) - offset} trailing bytes after {UNIT_COUNT} records")
    return records


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: decode_units.py UNITS_BIN OUTPUT_JSON", file=sys.stderr)
        return 2
    source, output = Path(sys.argv[1]), Path(sys.argv[2])
    records = decode(source.read_bytes())
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Decoded {len(records)} unit records into {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
