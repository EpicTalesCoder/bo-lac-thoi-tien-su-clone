// Source-checked JAR resource parsing for Total Tournament.
// The original loader uses Java signed bytes; do not normalize all fields alike.
const BASE = new URL('./jar-resources/', import.meta.url);

export const s8 = (value) => ((value & 0xff) > 127 ? (value & 0xff) - 256 : (value & 0xff));
export const u8 = (value) => value & 0xff;

function requireLength(bytes, multiple, name) {
  if (bytes.length % multiple !== 0) throw new Error(`${name}: ${bytes.length} bytes is not divisible by ${multiple}`);
}

function pngDimensions(raw) {
  const png = decodeJ2meImageBytes(raw);
  return {
    width: new DataView(png.buffer, png.byteOffset, png.byteLength).getUint32(16, false),
    height: new DataView(png.buffer, png.byteOffset, png.byteLength).getUint32(20, false),
  };
}

// Port of c.<init>:123-196 and c.<init>:134-152. Option coordinates use the
// source dimensions (240x320), bitmap font metrics, `curs`, `ld` and `ccs`.
export function decodeUiLayout(ccs, cfBytes, cursorBytes, loadingBytes, width = 240, height = 320) {
  requireLength(cfBytes, 6, 'cf');
  const glyphIndex = 1062 - 848 - 32;
  const fontHeight = s8(cfBytes[glyphIndex * 6 + 3]) + 1;
  const cursor = pngDimensions(cursorBytes);
  const loading = pngDimensions(loadingBytes);
  const horizontalInset = Math.trunc(width / 13);
  const rowHeight = 22;
  const rowCount = 4;
  const textWidth = Math.trunc(width / 13);
  const textHeight = 16;
  const m = cursor.width >> 1;
  const cursorLineHeight = m + (m >> 3);
  const configTop = fontHeight + m;
  const rowListHeight = rowHeight * rowCount;
  const loadingQuarter = loading.height >> 2;
  const remainder = height - (configTop + rowListHeight + loadingQuarter + ccs[3][33]);
  const explanationLines = Math.trunc(remainder / fontHeight) - 1;
  const explanationLineCapacity = explanationLines * fontHeight;
  const descriptionTop = configTop + rowListHeight + loadingQuarter
    + (remainder >> 1) - (explanationLineCapacity >> 1) + 3;
  const statWidth = (ccs[2][27] << 1) + (ccs[2][27] >> 1) + (ccs[2][38] << 1);
  return {
    fontHeight, cursorWidth: cursor.width, cursorHeight: cursor.height,
    loadingWidth: loading.width, loadingHeight: loading.height,
    optionRowHeight: rowHeight, optionRows: rowCount,
    optionStartY: configTop + (rowHeight >> 1) - (fontHeight >> 1),
    optionHeight: ccs[3][27], leftTextX: horizontalInset,
    statSpriteX: width - statWidth,
    valueX: width - (ccs[2][27] >> 1) - (ccs[2][27] >> 2) - ccs[2][38],
    explanationX: (horizontalInset << 1) - (horizontalInset >> 1),
    explanationY: descriptionTop,
    explanationWidth: width - (horizontalInset << 1) - horizontalInset,
    explanationLines: Math.max(0, explanationLines), explanationLineHeight: fontHeight,
    characterColumnHeight: textHeight, levelPageArrowTop: ccs[3][33], horizontalInset,
    rowDescriptionWidth: width - (horizontalInset << 1) - horizontalInset,
    optionPageCount: 4, loadingProgressHeight: loadingQuarter, fontLineSpacing: cursorLineHeight,
  };
}

export async function fetchRawResource(name) {
  const url = new URL(`${name}.png`, BASE);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load original JAR resource ${name}.png: HTTP ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}

// `b.a(String)` decodes image resources by first trying the bytes as PNG,
// then XOR-stream-100. Do not use for resources read as raw tables in e.run().
export function decodeJ2meImageBytes(raw) {
  if (isPng(raw)) return raw;
  const decoded = xorStream(raw, 100);
  if (isPng(decoded)) return decoded;
  throw new Error('Original image is neither a PNG nor a valid XOR-100 PNG');
}

export function isPng(bytes) {
  return bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a;
}

function xorStream(bytes, initialKey) {
  const output = new Uint8Array(bytes.length);
  let key = initialKey & 0xff;
  for (let i = 0; i < bytes.length; i++) {
    output[i] = bytes[i] ^ key;
    key = (key + 1) & 0xff;
  }
  return output;
}

// Port of e.run():3120-3127. lz has its own exact length-prefixed XOR stream;
// it must not be sent through the ordinary image/XOR-100 path.
export function decodeLzStartupImage(raw) {
  if (raw.length < 3) throw new Error('lz: truncated three-byte header');
  const length = 3 + (u8(raw[0]) << 8) + u8(raw[1]);
  const key = u8(s8(raw[2]) - 3);
  if (length > raw.length) throw new Error(`lz: declared ${length} bytes, resource has ${raw.length}`);
  const decoded = new Uint8Array(length);
  for (let i = 0; i < length; i++) decoded[i] = raw[i] ^ ((key + i) & 0xff);
  if (!isPng(decoded.subarray(3))) throw new Error('lz: decoded payload is not PNG');
  return decoded.subarray(3);
}

export async function loadOriginalImages() {
  // Source b.a(String) exposes images and tables separately. Menu/background
  // bitmaps are raw PNG; actor/map/UI sheets use XOR-100 and are decoded here.
  const direct = ['bg0', 'bg1', 'or', 'li1', 'li2', 'f1', 'f2', 'fnt', 'curs', 'erou', 'ld'];
  const encrypted = [...Array.from({ length: 9 }, (_, index) => `u${index}`), 's0', 's1', 'l0', 'l1'];
  const imageFor = async (name, decode) => {
    const raw = await fetchRawResource(name);
    const png = decode ? decodeJ2meImageBytes(raw) : raw;
    const bitmap = await createImageBitmap(new Blob([png], { type: 'image/png' }));
    return [name, bitmap];
  };
  const entries = await Promise.all([
    ...direct.map((name) => imageFor(name, false)),
    ...encrypted.map((name) => imageFor(name, true)),
  ]);
  const lzPng = decodeLzStartupImage(await fetchRawResource('lz'));
  const lz = await createImageBitmap(new Blob([lzPng], { type: 'image/png' }));
  const images = Object.fromEntries([...entries, ['lz', lz]]);
  // Port of e.java:2389-2484. Source precomputes exact mirror images from u0-u4.
  for (let index = 0; index < 5; index++) {
    const source = images[`u${index}`];
    const mirror = new OffscreenCanvas(source.width, source.height);
    const mirrorContext = mirror.getContext('2d');
    mirrorContext.imageSmoothingEnabled = false;
    mirrorContext.translate(source.width, 0);
    mirrorContext.scale(-1, 1);
    mirrorContext.drawImage(source, 0, 0);
    images[`u${index + 9}`] = await createImageBitmap(mirror);
  }
  return images;
}

// Port of e.java:3734-3748. Preserve source row identity; Java leaves row 0 empty.
export function decodeCu2(bytes) {
  requireLength(bytes, 7, 'cu2');
  const rows = bytes.length / 7;
  const frames = Array.from({ length: rows }, () => [0, 0, 0, 0, 0, 0, 0]);
  for (let row = 1; row < rows; row++) {
    const offset = row * 7;
    frames[row] = Array.from(bytes.subarray(offset, offset + 7), s8);
  }
  return frames;
}

// Port of e.java:4023-4073. Ordinary rows stop at the first zero triple;
// listed exceptional rows retain the whole 24-byte record even when a triple
// is all zero. See javap's branch order for the exceptional-row loop.
const FULL_CA_ROWS = new Set([79, 90, 91, 108, 109, 110, 189, 200, 201, 207, 218, 219]);
export function decodeCa(bytes) {
  requireLength(bytes, 24, 'ca');
  const rows = bytes.length / 24;
  let rowLength = 1;
  return Array.from({ length: rows }, (_, row) => {
    const start = row * 24;
    if (FULL_CA_ROWS.has(row)) rowLength = 24;
    for (let offset = 0; offset < 24; offset += 3) {
      if (bytes[start + offset] === 0 && bytes[start + offset + 1] === 0 && bytes[start + offset + 2] === 0) {
        rowLength = offset;
        break;
      }
    }
    return Array.from(bytes.subarray(start, start + rowLength), (value, index) => {
      if (FULL_CA_ROWS.has(row) && index % 3 === 2) {
        const signedFrame = s8(value);
        if (signedFrame > 60 && signedFrame < 65) return 0;
        return signedFrame < 0 ? signedFrame + 256 : signedFrame;
      }
      return s8(value);
    });
  });
}

// Port of e.java:2335-2363. Keep the table's column-major representation.
export function decodeColumnTable(bytes, columns, name) {
  requireLength(bytes, columns, name);
  const count = bytes.length / columns;
  const table = Array.from({ length: columns }, () => new Int16Array(count));
  for (let row = 0; row < count; row++) {
    for (let column = 0; column < columns; column++) {
      const value = s8(bytes[row * columns + column]);
      table[column][row] = column < 4 && value < 0 ? value + 256 : value;
    }
  }
  return table;
}

// Port of e.java:3749-3766; the 5x5 object block values become unsigned.
export function decodeObjectBlocks(bytes) {
  requireLength(bytes, 25, 'obj0');
  return Array.from({ length: bytes.length / 25 }, (_, block) =>
    Array.from(bytes.subarray(block * 25, block * 25 + 25), u8));
}

// Port of e.java:3957-3970. Keep Java `byte` values exactly, not unsigned.
export function decodeWeaponSets(bytes) {
  requireLength(bytes, 6, 'wlg');
  return Array.from({ length: bytes.length / 6 }, (_, row) => Array.from(bytes.subarray(row * 6, row * 6 + 6), s8));
}

// Port of e.java:3972-4019. Preserve level separator identity and raw signed
// fields; only derive weapon IDs with the source switch codes.
export function decodeWeaponTable(bytes) {
  requireLength(bytes, 3, 'wpn');
  const byLevel = [];
  let records = [];
  for (let offset = 0; offset < bytes.length; offset += 3) {
    const raw = Array.from(bytes.subarray(offset, offset + 3), s8);
    if (raw.every((value) => value === 0)) {
      byLevel.push(records);
      records = [];
      continue;
    }
    const rawCode = raw[2] + 256;
    const weaponId = ({ 242: 6, 243: 5, 245: 3, 246: 2, 247: 1 })[rawCode] ?? 0;
    records.push({ x: raw[0], y: raw[1] + 1, rawCode: raw[2], weaponId });
  }
  if (records.length) byLevel.push(records);
  return byLevel;
}

// Port of e.java:4077-4091. First byte is unsigned; remaining bytes signed.
export function decodeEffects(bytes) {
  requireLength(bytes, 25, 'mua');
  return Array.from({ length: bytes.length / 25 }, (_, row) => {
    const start = row * 25;
    return Array.from(bytes.subarray(start, start + 25), (value, index) => index === 0 ? u8(value) : s8(value));
  });
}

function rawTriples(bytes, start, stopAtZero = true) {
  const records = [];
  for (let offset = start; offset + 2 < bytes.length; offset += 3) {
    const signed = [s8(bytes[offset]), s8(bytes[offset + 1]), s8(bytes[offset + 2])];
    if (stopAtZero && signed.every((value) => value === 0)) break;
    records.push(signed);
  }
  return records;
}

function fourthSeparatorLevelOffset(bytes, level) {
  if (!Number.isInteger(level) || level < 0) throw new RangeError('level must be a non-negative integer');
  if (level === 0) return 0;
  let zeros = 0;
  let group = 0;
  for (let offset = 9; offset + 2 < bytes.length; offset += 3) {
    if (bytes[offset] === 0 && bytes[offset + 1] === 0 && bytes[offset + 2] === 0) zeros++;
    if (zeros === 4) {
      group++;
      if (group === level) return offset + 3;
      offset += 9;
      zeros = 0;
    }
  }
  throw new RangeError(`ll has no group for source level index ${level}`);
}

// Port of e.java:3768-3955, including 9-byte section header and 3-byte records.
// This decoder exports the facts established by source without guessing the
// meaning of every object record. Its output feeds the later renderer/simulator.
export function decodeLevel(bytes, level, objectBlocks = [], cu2 = []) {
  const start = fourthSeparatorLevelOffset(bytes, level);
  if (start + 9 > bytes.length) throw new Error(`ll level ${level} header is truncated`);
  const width = u8(bytes[start]);
  const height = u8(bytes[start + 1]);
  if (width === 0 || height === 0 || width * height > 100_000) throw new Error(`ll level ${level} has invalid source dimensions ${width}x${height}`);
  let cursor = start + 9;
  let objectEnd = cursor;
  while (objectEnd + 2 < bytes.length && !(bytes[objectEnd] === 0 && bytes[objectEnd + 1] === 0 && bytes[objectEnd + 2] === 0)) objectEnd += 3;
  const objects = rawTriples(bytes, cursor);
  cursor = objectEnd + 3;

  const specialMarkers = rawTriples(bytes, cursor);
  cursor += 15; // e.java scans exactly five marker triples, including zero slots.
  const baseAndFlags = specialMarkers.filter(([, , marker]) => marker >= -7 && marker <= -4);
  let spawnCursor = cursor;
  while (spawnCursor + 2 < bytes.length && !(bytes[spawnCursor] === 0 && bytes[spawnCursor + 1] === 0 && bytes[spawnCursor + 2] === 0)) {
    spawnCursor += 3;
  }
  const teamSpawnAndPlatformRecords = rawTriples(bytes, cursor);
  cursor = spawnCursor + 3;
  const teamSpawnMarkers = teamSpawnAndPlatformRecords.filter(([, , marker]) => marker === -3 || marker === -2);
  const propPlacements = objects.map(([xRaw, yRaw, code]) => {
    const x = u8(xRaw), y = u8(yRaw) + 1;
    const frameIndex = code - 31;
    const effectIndex = code - 100;
    const frame = cu2[frameIndex];
    return {
      sourceX: x, sourceY: y, sourceCode: code, frameIndex, effectIndex,
      frameId: effectIndex + 69,
      x: (x << 4) + ((16 - (frame?.[2] ?? 0)) >> 1),
      y: y << 4,
    };
  });

  // Port of e.java:3927-3955: the next source triplets are (x,y,objectBlockId).
  const tilePlacements = rawTriples(bytes, cursor);
  const tiles = Array.from({ length: width }, () => new Uint8Array(height));
  for (const [xRaw, yRaw, blockRaw] of tilePlacements) {
    const x = u8(xRaw), y = u8(yRaw), block = u8(blockRaw);
    const blockIndex = block - 1;
    const matrix = objectBlocks[blockIndex];
    if (!matrix) continue;
    for (let index = 0; index < 25; index++) {
      const col = index % 5, row = Math.floor(index / 5);
      const tx = x + col, ty = y + row;
      if (tx < width && ty < height && matrix[index] !== 0) tiles[tx][ty] = matrix[index];
    }
  }
  return { level, sourceOffset: start, width, height, worldWidth: width * 16, worldHeight: height * 16, tiles,
    objects, specialMarkers, baseAndFlags, teamSpawnMarkers, teamSpawnAndPlatformRecords, propPlacements, tilePlacements };
}

export async function loadOriginalTables() {
  const names = ['cu2', 'ca', 'cc', 'ccs', 'cf', 'curs', 'ld', 'll', 'mua', 'obj0', 'wlg', 'wpn', 'text', 'text1', 'text2', 'text3', 'text4'];
  const raw = Object.fromEntries(await Promise.all(names.map(async (name) => [name, await fetchRawResource(name)])));
  const cu2 = decodeCu2(raw.cu2);
  const ca = decodeCa(raw.ca);
  const cc = decodeColumnTable(raw.cc, 11, 'cc');
  const ccs = decodeColumnTable(raw.ccs, 7, 'ccs');
  const cf = decodeColumnTable(raw.cf, 6, 'cf');
  const objectBlocks = decodeObjectBlocks(raw.obj0);
  const weaponTable = decodeWeaponTable(raw.wpn);
  const equipmentSets = decodeWeaponSets(raw.wlg);
  const effects = decodeEffects(raw.mua);
  const texts = Object.fromEntries(['text', 'text1', 'text2', 'text3', 'text4'].map((name) => [name, raw[name]]));
  const levels = Array.from({ length: 11 }, (_, index) => decodeLevel(raw.ll, index, objectBlocks, cu2));
  const uiLayout = decodeUiLayout(ccs, raw.cf, raw.curs, raw.ld);
  return { raw, cu2, ca, cc, ccs, cf, objectBlocks, weaponTable, equipmentSets, effects, texts, levels, level: levels[0], uiLayout };
}
