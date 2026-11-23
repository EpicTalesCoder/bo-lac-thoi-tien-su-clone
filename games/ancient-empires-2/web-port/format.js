export const INT32_MIN = -0x80000000;
export const INT32_MAX = 0x7fffffff;

export const s8 = value => {
  const byte = value & 0xff;
  return byte > 127 ? byte - 256 : byte;
};

export const u8 = value => value & 0xff;

export const s16 = value => {
  const short = value & 0xffff;
  return short > 32767 ? short - 65536 : short;
};

export const u16 = value => value & 0xffff;
export const s32 = value => value | 0;
export const idiv = (dividend, divisor) => Math.trunc(dividend / divisor);

export function readI32BE(bytes, offset) {
  if (offset < 0 || offset + 4 > bytes.length) throw new RangeError('readI32BE exceeds input');
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getInt32(offset, false);
}

export function readI16BE(bytes, offset) {
  if (offset < 0 || offset + 2 > bytes.length) throw new RangeError('readI16BE exceeds input');
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getInt16(offset, false);
}

export function writeS32(value) {
  if (!Number.isInteger(value) || value < INT32_MIN || value > INT32_MAX) {
    throw new RangeError('expected signed 32-bit integer');
  }
  return value | 0;
}
