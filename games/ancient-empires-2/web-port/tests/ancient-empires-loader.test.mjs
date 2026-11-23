import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { decodeMap, decodeSprite, decodeTerrainProperties, decodeUnits } from '../ancient-empires-loader.js';

const asset = name => new URL(`../assets/${name}`, import.meta.url);

function i32(value) {
  const bytes = Buffer.alloc(4);
  bytes.writeInt32BE(value);
  return bytes;
}

function i16(value) {
  const bytes = Buffer.alloc(2);
  bytes.writeInt16BE(value);
  return bytes;
}

test('map decoder preserves x-major cells, opaque values, and Java integer division', () => {
  const map = Buffer.concat([
    i32(2), i32(2),
    Buffer.from([1, 2, 3, 4]), // x-major: (0,0),(0,1),(1,0),(1,1)
    i32(1), i32(-17),
    i32(2), Buffer.from([9]), i16(27), i16(-25), Buffer.from([12]), i16(48), i16(24),
  ]);
  const decoded = decodeMap(map, 'synthetic');
  assert.deepEqual(decoded.tiles, [[1, 2], [3, 4]]);
  assert.deepEqual(decoded.opaqueSection, { count: 1 });
  assert.deepEqual(decoded.units, [
    { encodedType: 9, encodedTypeByte: 9, type: 9, playerSelector: 1, pixelX: 27, pixelY: -25, x: 1, y: -1 },
    { encodedType: 12, encodedTypeByte: 12, type: 0, playerSelector: 2, pixelX: 48, pixelY: 24, x: 2, y: 1 },
  ]);
  assert.throws(() => decodeMap(Buffer.concat([i32(0), i32(2)]), 'bad-map'), /invalid dimensions/);
});

test('real units.bin keeps all signed records and consumes its exact original bytes', async () => {
  const raw = new Uint8Array(await readFile(asset('units.bin')));
  const decoded = decodeUnits(raw);
  assert.equal(decoded.length, 12);
  assert.equal(decoded[0].fields.length, 6);
  assert.equal(decoded[10].shortValue, -1);
  assert.deepEqual(decoded[0].frameOffsets[2], [8, 80]);
  assert.deepEqual(decoded[11].fields, [4, 0, 0, 15, 0, 0]);
  assert.throws(() => decodeUnits(raw.subarray(0, raw.length - 1)), /truncated|trailing/);
});

test('original terrain table preserves signed bytes and uninterpreted trailer', async () => {
  const decoded = decodeTerrainProperties(new Uint8Array(await readFile(asset('tiles0.prop'))));
  assert.equal(decoded.count, 47);
  assert.equal(decoded.headerValue, 1);
  assert.equal(decoded.properties.length, 47);
  assert.deepEqual(decoded.trailer, [8, 9]);
});

test('original tiles0 and buildings sprite tables retain metadata frames', async () => {
  const tiles = decodeSprite(new Uint8Array(await readFile(asset('tiles0.sprite'))), 'tiles0.sprite');
  assert.equal(tiles.frameCount, 37);
  assert.equal(tiles.frameWidth, 24);
  assert.equal(tiles.frameHeight, 24);
  assert.deepEqual(tiles.frames[36], { sourceFrame: 36, rawTransformFlags: 0, transform: 0, offsetX: 0, offsetY: 0 });

  const buildings = decodeSprite(new Uint8Array(await readFile(asset('buildings.sprite'))), 'buildings.sprite');
  assert.equal(buildings.frameCount, 2);
  assert.deepEqual(buildings.frames.map(frame => frame.sourceFrame), [0, 1]);
});

test('binary decoders reject trailing bytes instead of silently reinterpreting records', () => {
  const valid = Buffer.concat([i32(1), i32(1), Buffer.from([0]), i32(0), i32(0)]);
  assert.equal(decodeMap(valid).units.length, 0);
  assert.throws(() => decodeMap(Buffer.concat([valid, Buffer.from([0])])), /trailing/);
});
