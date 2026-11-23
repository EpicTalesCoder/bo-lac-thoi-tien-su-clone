import { s8, s16, idiv } from './format.js';

const MAP_LIMIT = 128;
const UNIT_LIMIT = 512;
const RESOURCE_LIMIT = 64 * 1024 * 1024;

// Port of i.java:58 and h.java:136-191: exact palette replacements for the
// original PNG PLT palette rewrite. Index 1 is the unchanged source palette.
export const ORIGINAL_PALETTES = Object.freeze([
  null,
  [[150, 217, 244], [65, 149, 233], [0, 100, 198], [12, 53, 112]],
  [[244, 158, 156], [219, 36, 113], [161, 0, 112], [95, 5, 120]],
  [[171, 237, 90], [99, 190, 37], [0, 153, 55], [0, 85, 82]],
  [[0, 118, 150], [0, 65, 114], [0, 43, 75], [0, 22, 48]],
]);

export function transformPalettePixels(rgba, palette) {
  if (!(rgba instanceof Uint8ClampedArray) || rgba.length % 4 !== 0) throw new TypeError('expected RGBA pixel bytes');
  if (!Number.isInteger(palette) || palette < 0 || palette >= ORIGINAL_PALETTES.length) throw new RangeError('invalid original palette index');
  const output = new Uint8ClampedArray(rgba);
  const base = ORIGINAL_PALETTES[1];
  for (let index = 0; index < output.length; index += 4) {
    const r = output[index];
    const g = output[index + 1];
    const b = output[index + 2];
    if (palette === 0) {
      if (r === 244 && g === 244 && b === 230) continue;
      const gray = Math.trunc((r + g + b) / 3);
      output[index] = gray; output[index + 1] = gray; output[index + 2] = gray;
      continue;
    }
    if (palette === 1) continue;
    const colorIndex = base.findIndex(color => color[0] === r && color[1] === g && color[2] === b);
    if (colorIndex >= 0) {
      output[index] = ORIGINAL_PALETTES[palette][colorIndex][0];
      output[index + 1] = ORIGINAL_PALETTES[palette][colorIndex][1];
      output[index + 2] = ORIGINAL_PALETTES[palette][colorIndex][2];
    }
  }
  return output;
}

class BinaryReader {
  constructor(input, label) {
    const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
    if (bytes.byteLength > RESOURCE_LIMIT) throw new RangeError(`${label}: resource exceeds bound`);
    this.bytes = bytes;
    this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    this.offset = 0;
    this.label = label;
  }

  require(size) {
    if (!Number.isInteger(size) || size < 0 || this.offset + size > this.bytes.length) {
      throw new RangeError(`${this.label}: truncated record at ${this.offset}`);
    }
  }

  u8() { this.require(1); return this.bytes[this.offset++]; }
  s8() { return s8(this.u8()); }
  s16() { this.require(2); const value = this.view.getInt16(this.offset, false); this.offset += 2; return value; }
  u16() { this.require(2); const value = this.view.getUint16(this.offset, false); this.offset += 2; return value; }
  s32() { this.require(4); const value = this.view.getInt32(this.offset, false); this.offset += 4; return value; }
  remaining() { return this.bytes.length - this.offset; }
}

// Port of i.java:1826-1942. Preserve x-major source order and do not assign a
// meaning to the counted int32 section that the game merely skips.
export function decodeMap(input, source = 'map') {
  const reader = new BinaryReader(input, source);
  const width = reader.s32();
  const height = reader.s32();
  if (width < 1 || width > MAP_LIMIT || height < 1 || height > MAP_LIMIT) {
    throw new RangeError(`${source}: invalid dimensions ${width}x${height}`);
  }
  const tiles = Array.from({ length: width }, () => new Array(height));
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) tiles[x][y] = reader.s8();
  }
  const opaqueCount = reader.s32();
  if (opaqueCount < 0 || opaqueCount > width * height * 8) throw new RangeError(`${source}: invalid opaque-section count`);
  for (let index = 0; index < opaqueCount; index++) reader.s32();
  const unitCount = reader.s32();
  if (unitCount < 0 || unitCount > UNIT_LIMIT) throw new RangeError(`${source}: invalid unit count`);
  const units = new Array(unitCount);
  for (let index = 0; index < unitCount; index++) {
    const encodedTypeByte = reader.u8();
    const encodedType = s8(encodedTypeByte);
    const pixelX = reader.s16();
    const pixelY = reader.s16();
    units[index] = {
      encodedType,
      encodedTypeByte,
      type: encodedType % 12,
      playerSelector: 1 + idiv(encodedType, 12),
      pixelX,
      pixelY,
      x: idiv(pixelX, 24),
      y: idiv(pixelY, 24),
    };
  }
  if (reader.remaining() !== 0) throw new RangeError(`${source}: trailing ${reader.remaining()} bytes`);
  return { source, width, height, tileSize: 24, tiles, opaqueSection: { count: opaqueCount }, units };
}

// Port of c.java:628-652. Retain raw fields; names and stat semantics are not
// supplied by this binary reader.
export function decodeUnits(input, source = 'units.bin') {
  const reader = new BinaryReader(input, source);
  const records = [];
  for (let recordId = 0; recordId < 12; recordId++) {
    const fields = Array.from({ length: 6 }, () => reader.s8());
    const shortValue = reader.s16();
    const frameCount = reader.u8();
    if (frameCount > 64) throw new RangeError(`${source}: unreasonable frame count ${frameCount}`);
    const frameOffsets = Array.from({ length: frameCount }, () => [reader.s8(), reader.s8()]);
    const bitCount = reader.u8();
    if (bitCount > 32) throw new RangeError(`${source}: unreasonable bit count ${bitCount}`);
    const movementMaskBits = Array.from({ length: bitCount }, () => reader.u8());
    if (movementMaskBits.some(bit => bit > 15)) throw new RangeError(`${source}: movement mask bit out of range`);
    records.push({ recordId, fields, shortValue, frameOffsets, movementMaskBits });
  }
  if (reader.remaining() !== 0) throw new RangeError(`${source}: trailing ${reader.remaining()} bytes`);
  return records;
}

// Port of i.java:418-425. The second short and any trailer are kept raw.
export function decodeTerrainProperties(input, source = 'tiles0.prop') {
  const reader = new BinaryReader(input, source);
  const count = reader.s16();
  const headerValue = reader.s16();
  if (count < 0 || count > 4096) throw new RangeError(`${source}: invalid property count ${count}`);
  const properties = Array.from({ length: count }, () => reader.s8());
  const trailer = Array.from({ length: reader.remaining() }, () => reader.s8());
  return { count, headerValue, properties, trailer };
}

const TRANSFORM_FLAGS = [
  [1, 2], [2, 1], [4, 6], [8, 3], [16, 5],
];

function transformFromFlags(flags) {
  for (const [bit, transform] of TRANSFORM_FLAGS) if ((flags & bit) !== 0) return transform;
  return 0;
}

// Port of h.java:72-104. Metadata anchor flags set the crop's persistent
// destination offset; signed per-frame offsets are applied afterward.
function metadataAnchorOffset(flags, transform, frameWidth, frameHeight) {
  let horizontal = flags & 0x0d;
  const vertical = flags & 0x32;
  if (transform === 2) {
    if (horizontal & 4) horizontal = 8;
    else if (horizontal & 8) horizontal = 4;
  } else if (transform === 1) {
    if (vertical & 16) horizontal = 32;
    else if (horizontal & 32) horizontal = 16;
  }
  const anchor = horizontal | vertical;
  let x = 0;
  let y = 0;
  if (anchor & 8) x = frameWidth - frameWidth;
  else if (anchor & 1) x = (frameWidth - frameWidth) >> 1;
  if (anchor & 32) y = frameHeight - frameHeight;
  else if (anchor & 2) y = (frameHeight - frameHeight) >> 1;
  return [x, y];
}

// Port of f.java:66-141 and h.java:34-62. Parse optional sections in exact
// read order and preserve the remaining bytes rather than guessing at them.
export function decodeSprite(input, source = 'sprite') {
  const reader = new BinaryReader(input, source);
  const frameCount = reader.u8();
  const frameWidth = reader.u8();
  const frameHeight = reader.u8();
  if (frameCount === 0 || frameWidth === 0 || frameHeight === 0) throw new RangeError(`${source}: invalid frame header`);
  const frames = Array.from({ length: frameCount }, () => {
    const sourceFrame = reader.u8();
    const rawTransformFlags = reader.u8();
    return { sourceFrame, rawTransformFlags, transform: transformFromFlags(rawTransformFlags), offsetX: 0, offsetY: 0 };
  });

  let anchorFlags = 0;
  let sequences = [];
  let sequenceDelayMs = 0;
  let explicitSequenceTable = false;
  if (reader.remaining() > 0) {
    const value = reader.u8();
    if (value > 0) anchorFlags = value;
  }
  if (reader.remaining() > 0) {
    const sequenceCount = reader.u8();
    if (sequenceCount > 0) {
      explicitSequenceTable = true;
      sequenceDelayMs = reader.u8() * 50;
      sequences = Array.from({ length: sequenceCount }, () => {
        const length = reader.u8();
        if (length > 128) throw new RangeError(`${source}: unreasonable animation length ${length}`);
        return Array.from({ length }, () => reader.s8());
      });
    }
  }
  let offsetTerminated = false;
  for (let index = 0; index < frameCount && reader.remaining() >= 2; index++) {
    const offsetX = reader.s8();
    const offsetY = reader.s8();
    if (offsetX === -1 || offsetY === -1) { offsetTerminated = true; break; }
    frames[index].offsetX = offsetX;
    frames[index].offsetY = offsetY;
  }
  // Any unread tail is retained as opaque evidence; no speculative parsing.
  const ignoredRemainder = Array.from({ length: reader.remaining() }, () => reader.u8());
  return { source, frameCount, frameWidth, frameHeight, anchorFlags, frames, sequences, sequenceDelayMs, explicitSequenceTable, offsetTerminated, ignoredRemainder };
}

export async function fetchBytes(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load ${url}: HTTP ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}

export async function loadOriginalMap(url) { return decodeMap(await fetchBytes(url), url); }
export async function loadOriginalSprite(url) { return decodeSprite(await fetchBytes(url), url); }
