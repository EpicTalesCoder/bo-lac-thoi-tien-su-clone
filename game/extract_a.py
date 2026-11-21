#!/usr/bin/env python3
"""Strict offline parser/extractor for the game's packed resource `a`."""

from __future__ import annotations

import argparse
import hashlib
import json
import struct
import sys
from pathlib import Path

RECORD_COUNT = 312
PAYLOAD_CAPACITY = 17_638
TABLE_COUNT = 5
TABLE_VALUE_CAPACITY = 570


class ParseError(ValueError):
    pass


class Reader:
    def __init__(self, data: bytes) -> None:
        self.data = data
        self.offset = 0

    def take(self, count: int, what: str) -> bytes:
        if count < 0 or self.offset > len(self.data) or count > len(self.data) - self.offset:
            raise ParseError(
                f"truncated {what} at offset {self.offset}: need {count} bytes, "
                f"only {max(0, len(self.data) - self.offset)} remain"
            )
        start = self.offset
        self.offset += count
        return self.data[start:self.offset]

    def u16(self, what: str) -> int:
        # CFR's bytecode-oriented decompilation shows low byte read first.
        return struct.unpack("<H", self.take(2, what))[0]


def parse_container(data: bytes) -> tuple[list[bytes], list[list[int]], dict[str, object]]:
    reader = Reader(data)
    records: list[bytes] = []
    declared_lengths: list[int] = []
    running_size = 0
    for index in range(RECORD_COUNT):
        length = reader.u16(f"record {index} length")
        if length > PAYLOAD_CAPACITY - running_size:
            raise ParseError(
                f"record {index} length {length} exceeds payload capacity "
                f"{PAYLOAD_CAPACITY} at cumulative offset {running_size}"
            )
        records.append(reader.take(length, f"record {index} payload"))
        declared_lengths.append(length)
        running_size += length

    counts: list[int] = []
    tables: list[list[int]] = []
    total_values = 0
    for index in range(TABLE_COUNT):
        count = reader.u16(f"table {index} count")
        if count > TABLE_VALUE_CAPACITY - total_values:
            raise ParseError(
                f"table {index} count {count} exceeds {TABLE_VALUE_CAPACITY}-value "
                f"capacity at cumulative count {total_values}"
            )
        table = [reader.u16(f"table {index} value {value_index}") for value_index in range(count)]
        counts.append(count)
        tables.append(table)
        total_values += count

    if reader.offset != len(data):
        raise ParseError(f"{len(data) - reader.offset} trailing byte(s) after declared structure")

    return records, tables, {
        "record_count": RECORD_COUNT,
        "record_lengths": declared_lengths,
        "payload_bytes": running_size,
        "payload_capacity": PAYLOAD_CAPACITY,
        "table_counts": counts,
        "table_value_count": total_values,
        "table_value_capacity": TABLE_VALUE_CAPACITY,
        "parsed_bytes": reader.offset,
        "source_bytes": len(data),
    }


def image_info(blob: bytes) -> tuple[str, int, int] | None:
    """Recognize image signatures and read dimensions from bounded headers only."""
    if blob.startswith(b"\x89PNG\r\n\x1a\n"):
        if len(blob) < 24 or blob[12:16] != b"IHDR":
            raise ParseError("PNG signature found but complete IHDR header is absent")
        width, height = struct.unpack(">II", blob[16:24])
        fmt = "png"
    elif blob.startswith((b"GIF87a", b"GIF89a")):
        if len(blob) < 10:
            raise ParseError("GIF signature found but logical screen descriptor is truncated")
        width, height = struct.unpack("<HH", blob[6:10])
        fmt = "gif"
    elif blob.startswith(b"BM"):
        if len(blob) < 26:
            raise ParseError("BMP signature found but DIB header is truncated")
        dib_size = struct.unpack_from("<I", blob, 14)[0]
        if dib_size >= 40:
            if len(blob) < 26:
                raise ParseError("BMP dimensions are truncated")
            width, signed_height = struct.unpack_from("<ii", blob, 18)
            height = abs(signed_height)
        elif dib_size == 12:
            width, height = struct.unpack_from("<HH", blob, 18)
        else:
            raise ParseError(f"unsupported BMP DIB header size {dib_size}")
        fmt = "bmp"
    elif blob.startswith(b"\xff\xd8\xff"):
        width, height = jpeg_dimensions(blob)
        fmt = "jpeg"
    elif len(blob) >= 12 and blob[:4] == b"RIFF" and blob[8:12] == b"WEBP":
        width, height = webp_dimensions(blob)
        fmt = "webp"
    else:
        return None
    if width <= 0 or height <= 0:
        raise ParseError(f"{fmt.upper()} header has invalid dimensions {width}x{height}")
    return fmt, width, height


def jpeg_dimensions(blob: bytes) -> tuple[int, int]:
    pos = 2
    sof_markers = {0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7,
                   0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF}
    while pos < len(blob):
        if blob[pos] != 0xFF:
            raise ParseError(f"invalid JPEG marker framing at byte {pos}")
        while pos < len(blob) and blob[pos] == 0xFF:
            pos += 1
        if pos >= len(blob):
            break
        marker = blob[pos]
        pos += 1
        if marker in (0xD8, 0xD9) or 0xD0 <= marker <= 0xD7 or marker == 0x01:
            if marker == 0xD9:
                break
            continue
        if pos + 2 > len(blob):
            break
        segment_length = struct.unpack_from(">H", blob, pos)[0]
        if segment_length < 2 or segment_length > len(blob) - pos:
            raise ParseError(f"invalid or truncated JPEG segment at byte {pos}")
        if marker in sof_markers:
            if segment_length < 7:
                raise ParseError("truncated JPEG SOF segment")
            height, width = struct.unpack_from(">HH", blob, pos + 3)
            return width, height
        pos += segment_length
    raise ParseError("JPEG signature found but no bounded SOF dimensions were present")


def webp_dimensions(blob: bytes) -> tuple[int, int]:
    declared = struct.unpack_from("<I", blob, 4)[0] + 8
    if declared > len(blob) or declared < 20:
        raise ParseError("WebP RIFF length is invalid or truncated")
    chunk = blob[12:16]
    if chunk == b"VP8X":
        if len(blob) < 30:
            raise ParseError("truncated WebP VP8X header")
        return 1 + int.from_bytes(blob[24:27], "little"), 1 + int.from_bytes(blob[27:30], "little")
    if chunk == b"VP8 " and len(blob) >= 30 and blob[23:26] == b"\x9d\x01\x2a":
        return struct.unpack_from("<H", blob, 26)[0] & 0x3FFF, struct.unpack_from("<H", blob, 28)[0] & 0x3FFF
    if chunk == b"VP8L" and len(blob) >= 25 and blob[20] == 0x2F:
        bits = int.from_bytes(blob[21:25], "little")
        return (bits & 0x3FFF) + 1, ((bits >> 14) & 0x3FFF) + 1
    raise ParseError(f"WebP signature found but supported dimension chunk absent ({chunk!r})")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="path to packed resource a")
    parser.add_argument("output_dir", type=Path, help="new, nonexistent directory for images and manifest")
    args = parser.parse_args()
    source = args.input.resolve(strict=True)
    output = args.output_dir.resolve()
    try:
        if not source.is_file():
            raise ParseError(f"input is not a regular file: {source}")
        if output.exists():
            raise ParseError(f"refusing to overwrite existing output path: {output}")
        raw = source.read_bytes()
        records, tables, structure = parse_container(raw)
        entries: list[dict[str, object]] = []
        for index, payload in enumerate(records):
            entry: dict[str, object] = {
                "index": index,
                "length": len(payload),
                "sha256": hashlib.sha256(payload).hexdigest(),
            }
            try:
                info = image_info(payload)
            except ParseError as exc:
                entry["parse_error"] = str(exc)
                entries.append(entry)
                continue
            if info is None:
                entry["format"] = "unknown"
                entries.append(entry)
                continue
            fmt, width, height = info
            entry.update({"format": fmt, "width": width, "height": height,
                          "filename": f"entry-{index:03d}.{fmt}"})
            entries.append(entry)

        output.mkdir(parents=True, exist_ok=False)
        for entry, payload in zip(entries, records):
            filename = entry.get("filename")
            if isinstance(filename, str):
                destination = output / filename
                with destination.open("xb") as image_file:
                    image_file.write(payload)
        manifest = {
            "source": str(source),
            "source_sha256": hashlib.sha256(raw).hexdigest(),
            "parser": "extract_a.py strict static parser",
            "structure": structure,
            "tables": tables,
            "image_entry_count": sum("filename" in entry for entry in entries),
            "entries": entries,
        }
        manifest_path = output / "manifest.json"
        with manifest_path.open("x", encoding="utf-8") as manifest_file:
            json.dump(manifest, manifest_file, indent=2, ensure_ascii=False)
            manifest_file.write("\n")
        print(json.dumps({
            "manifest": str(manifest_path),
            "output_dir": str(output),
            "record_count": len(records),
            "payload_bytes": structure["payload_bytes"],
            "table_counts": structure["table_counts"],
            "table_value_count": structure["table_value_count"],
            "image_entry_count": manifest["image_entry_count"],
            "non_image_entry_count": sum(entry["format"] == "unknown" for entry in entries),
            "image_header_errors": sum("parse_error" in entry for entry in entries),
            "source_sha256": manifest["source_sha256"],
        }, indent=2))
        return 0
    except (OSError, ParseError, struct.error) as exc:
        print(f"extract_a: error: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
