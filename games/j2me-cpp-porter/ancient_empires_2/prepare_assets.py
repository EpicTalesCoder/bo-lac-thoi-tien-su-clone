#!/usr/bin/env python3
"""
Prepare Ancient Empires II assets from decompiled_java/raw_assets/ into assets/:
- Copies 1.pak, lang.dat, gameicon.png
- Verifies all PNG entries inside 1.pak
- Extracts the 9 MIDI BGM tracks into assets/bgm/{0..8}.mid
"""

import os
import shutil
import struct
import zlib

ROOT = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(ROOT, "decompiled_java", "raw_assets")
ASSETS = os.path.join(ROOT, "assets")

BGM_ORDER = [
    "main_theme.mid",
    "bg_story.mid",
    "bg_good.mid",
    "bg_bad.mid",
    "battle_good.mid",
    "battle_bad.mid",
    "victory.mid",
    "gameover.mid",
    "game_complete.mid",
]


def verify_png(png_bytes: bytes, label: str):
    if png_bytes[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError(f"Invalid PNG signature in {label}")
    pos = 8
    idat_buf = bytearray()
    saw_iend = False
    while pos < len(png_bytes):
        length = struct.unpack(">I", png_bytes[pos : pos + 4])[0]
        ctype = png_bytes[pos + 4 : pos + 8]
        cdata = png_bytes[pos + 8 : pos + 8 + length]
        crc_exp = struct.unpack(">I", png_bytes[pos + 8 + length : pos + 12 + length])[0]
        crc_act = zlib.crc32(ctype + cdata) & 0xFFFFFFFF
        if crc_exp != crc_act:
            raise ValueError(f"CRC mismatch in {label} chunk {ctype!r}")
        if ctype == b"IDAT":
            idat_buf.extend(cdata)
        elif ctype == b"IEND":
            saw_iend = True
        pos += 12 + length
    if not saw_iend:
        raise ValueError(f"Missing IEND in {label}")
    zlib.decompress(bytes(idat_buf))


def main():
    os.makedirs(ASSETS, exist_ok=True)
    bgm_dir = os.path.join(ASSETS, "bgm")
    os.makedirs(bgm_dir, exist_ok=True)

    for fname in ("1.pak", "lang.dat", "gameicon.png"):
        shutil.copy2(os.path.join(RAW, fname), os.path.join(ASSETS, fname))

    pak = open(os.path.join(RAW, "1.pak"), "rb").read()
    hdr_len, count = struct.unpack(">HH", pak[:4])
    pos = 4
    entries = {}
    for _ in range(count):
        slen = struct.unpack(">H", pak[pos : pos + 2])[0]
        pos += 2
        name = pak[pos : pos + slen].decode("utf-8")
        pos += slen
        off, length = struct.unpack(">IH", pak[pos : pos + 6])
        pos += 6
        entries[name] = pak[hdr_len + off : hdr_len + off + length]

    png_ok = 0
    for name, blob in entries.items():
        if name.endswith(".png"):
            verify_png(blob, name)
            png_ok += 1

    bgm_ok = 0
    for idx, mname in enumerate(BGM_ORDER):
        if mname in entries:
            with open(os.path.join(bgm_dir, f"{idx}.mid"), "wb") as f:
                f.write(entries[mname])
            bgm_ok += 1

    print(f"Prepared assets/: 1.pak ({count} entries, {png_ok} PNGs verified), lang.dat, bgm={bgm_ok}/9")


if __name__ == "__main__":
    main()
