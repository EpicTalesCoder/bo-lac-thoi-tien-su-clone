#!/usr/bin/env python3
"""
Normalize assets from decompiled_java/raw_assets/ into assets/ for Desktop C++17 SDL2 builds.
- Converts disguised PNGs (data/img/*.mid) to assets/data/img/*.png
- Reconstructs stripped-header PNGs (data/tex/*.mid) to assets/data/tex/*.png
- Copies logos, sprites, maps, mod tables, UI files, scripts, events, and font.bin
- Verifies PNG signatures, IHDR/IDAT integrity, and zlib decompression
"""

import os
import shutil
import struct
import zlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "decompiled_java", "raw_assets")
ROMFS = os.path.join(ROOT, "assets")


def make_chunk(chunk_type: bytes, data: bytes) -> bytes:
    crc = zlib.crc32(chunk_type + data) & 0xFFFFFFFF
    return struct.pack(">I", len(data)) + chunk_type + data + struct.pack(">I", crc)


def reconstruct_stripped_png(raw_bytes: bytes) -> bytes:
    pos = 0
    w, h, bit_depth, color_type = struct.unpack(">IIBB", raw_bytes[pos : pos + 10])
    pos += 10

    chunks = [b"\x89PNG\r\n\x1a\n"]
    ihdr = struct.pack(">IIBBBBB", w, h, bit_depth, color_type, 0, 0, 0)
    chunks.append(make_chunk(b"IHDR", ihdr))

    if color_type == 3:
        plte_len = struct.unpack(">I", raw_bytes[pos : pos + 4])[0]
        pos += 4
        plte = raw_bytes[pos : pos + plte_len]
        pos += plte_len
        chunks.append(make_chunk(b"PLTE", plte))

        next_val = struct.unpack(">I", raw_bytes[pos : pos + 4])[0]
        pos += 4
        if next_val == 1951551059:  # "tRNS"
            trns_count = raw_bytes[pos]
            pos += 1
            if trns_count == 0:
                trns_count = 256
            transp_idx = raw_bytes[pos]
            pos += 1
            trns = bytes(0 if i == transp_idx else 255 for i in range(trns_count))
            chunks.append(make_chunk(b"tRNS", trns))
            idat_len = struct.unpack(">I", raw_bytes[pos : pos + 4])[0]
            pos += 4
        else:
            idat_len = next_val
    elif color_type == 6:
        idat_len = struct.unpack(">I", raw_bytes[pos : pos + 4])[0]
        pos += 4
    else:
        raise ValueError(f"Unsupported stripped PNG color_type={color_type}")

    idat = raw_bytes[pos : pos + idat_len]
    pos += idat_len
    chunks.append(make_chunk(b"IDAT", idat))
    chunks.append(make_chunk(b"IEND", b""))
    return b"".join(chunks)


def verify_png(png_bytes: bytes, path_label: str) -> tuple[int, int]:
    if png_bytes[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError(f"Invalid PNG signature in {path_label}")
    pos = 8
    w = h = 0
    idat_buf = bytearray()
    saw_iend = False
    while pos < len(png_bytes):
        length = struct.unpack(">I", png_bytes[pos : pos + 4])[0]
        ctype = png_bytes[pos + 4 : pos + 8]
        cdata = png_bytes[pos + 8 : pos + 8 + length]
        crc_expected = struct.unpack(">I", png_bytes[pos + 8 + length : pos + 12 + length])[0]
        crc_actual = zlib.crc32(ctype + cdata) & 0xFFFFFFFF
        if crc_expected != crc_actual:
            raise ValueError(f"CRC mismatch in {path_label} chunk {ctype!r}")
        if ctype == b"IHDR":
            w, h = struct.unpack(">II", cdata[:8])
        elif ctype == b"IDAT":
            idat_buf.extend(cdata)
        elif ctype == b"IEND":
            saw_iend = True
        pos += 12 + length
    if not saw_iend:
        raise ValueError(f"Missing IEND in {path_label}")
    zlib.decompress(bytes(idat_buf))
    return w, h


def copy_tree_files(src_rel: str, dst_rel: str, exclude=()):
    src_dir = os.path.join(RAW, src_rel)
    dst_dir = os.path.join(ROMFS, dst_rel)
    os.makedirs(dst_dir, exist_ok=True)
    count = 0
    for name in sorted(os.listdir(src_dir)):
        if name in exclude:
            continue
        sp = os.path.join(src_dir, name)
        if os.path.isfile(sp):
            shutil.copy2(sp, os.path.join(dst_dir, name))
            count += 1
    return count


def main():
    os.makedirs(ROMFS, exist_ok=True)

    # 1. data/img/*.mid -> romfs/data/img/*.png
    img_src = os.path.join(RAW, "data", "img")
    img_dst = os.path.join(ROMFS, "data", "img")
    os.makedirs(img_dst, exist_ok=True)
    img_count = 0
    for name in sorted(os.listdir(img_src)):
        if not name.endswith(".mid"):
            continue
        data = open(os.path.join(img_src, name), "rb").read()
        verify_png(data, f"data/img/{name}")
        out_name = name[:-4] + ".png"
        open(os.path.join(img_dst, out_name), "wb").write(data)
        img_count += 1

    # 2. data/tex/*.mid -> romfs/data/tex/*.png
    tex_src = os.path.join(RAW, "data", "tex")
    tex_dst = os.path.join(ROMFS, "data", "tex")
    os.makedirs(tex_dst, exist_ok=True)
    tex_count = 0
    for name in sorted(os.listdir(tex_src)):
        if not name.endswith(".mid"):
            continue
        raw = open(os.path.join(tex_src, name), "rb").read()
        if raw[:8] == b"\x89PNG\r\n\x1a\n":
            png_bytes = raw
        else:
            png_bytes = reconstruct_stripped_png(raw)
        w, h = verify_png(png_bytes, f"data/tex/{name}")
        out_name = name[:-4] + ".png"
        open(os.path.join(tex_dst, out_name), "wb").write(png_bytes)
        tex_count += 1

    # 3. Logos & icon
    logo_count = copy_tree_files(os.path.join("data", "logo"), os.path.join("data", "logo"))
    shutil.copy2(os.path.join(RAW, "icon.png"), os.path.join(ROMFS, "icon.png"))
    shutil.copy2(os.path.join(RAW, "font.bin"), os.path.join(ROMFS, "font.bin"))

    # 4. Binary game data directories
    spr_count = copy_tree_files(os.path.join("data", "spr"), os.path.join("data", "spr"))
    map_count = copy_tree_files(os.path.join("data", "map"), os.path.join("data", "map"))
    mod_count = copy_tree_files(os.path.join("data", "mod"), os.path.join("data", "mod"))
    ui_count = copy_tree_files(os.path.join("data", "ui"), os.path.join("data", "ui"))
    script_count = copy_tree_files(os.path.join("data", "script"), os.path.join("data", "script"))
    event_count = copy_tree_files(
        os.path.join("data", "event"),
        os.path.join("data", "event"),
        exclude=("scene_13.mib",),
    )

    print(
        f"Prepared assets/: img={img_count}, tex={tex_count}, logo={logo_count}, "
        f"spr={spr_count}, map={map_count}, mod={mod_count}, ui={ui_count}, "
        f"script={script_count}, event={event_count}"
    )


if __name__ == "__main__":
    main()
