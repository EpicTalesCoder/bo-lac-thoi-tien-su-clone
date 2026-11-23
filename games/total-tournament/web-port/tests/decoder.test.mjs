import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  decodeCa, decodeColumnTable, decodeCu2, decodeJ2meImageBytes, decodeLevel,
  decodeLzStartupImage, decodeObjectBlocks, s8, u8,
} from '../tt-loader.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../analysis/recovered');
async function source(name) { return new Uint8Array(await readFile(path.join(root, `${name}.png`))); }

test('Java signed and unsigned byte boundary values match the source', () => {
  assert.equal(s8(0x7f), 127);
  assert.equal(s8(0x80), -128);
  assert.equal(s8(0xff), -1);
  assert.equal(u8(-1), 255);
});

test('JAR images decode from original bytes using direct/XOR100 and lz-specific path', async () => {
  for (const name of ['bg0', 'bg1', 'or', 'li1', 'li2', 'f1', 'f2', 'fnt', 'curs', 'erou', 'ld']) {
    assert.equal(decodeJ2meImageBytes(await source(name))[0], 0x89, name);
  }
  for (const name of ['u0', 'u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 's0', 's1', 'l0', 'l1']) {
    assert.equal(decodeJ2meImageBytes(await source(name))[0], 0x89, name);
  }
  const lz = decodeLzStartupImage(await source('lz'));
  assert.equal(lz.length, 2271);
  assert.deepEqual(Array.from(lz.slice(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10]);
});

test('cu2 preserves source row identity and skips row zero', async () => {
  const bytes = await source('cu2');
  const rows = decodeCu2(bytes);
  assert.equal(bytes.length, 826);
  assert.equal(rows.length, 118);
  assert.deepEqual(rows[0], [0, 0, 0, 0, 0, 0, 0]);
  assert.deepEqual(rows[1], [0, 0, 25, 14, 0, 0, 1]);
  assert.equal(rows[8][2], 0);
  assert.equal(rows[43][4], -24);
});

test('ca preserves bytecode row lengths and exceptional signed-frame mapping', async () => {
  const rows = decodeCa(await source('ca'));
  assert.equal(rows.length, 220);
  assert.deepEqual(rows[0], [-12, 0, 1, -12, -12, 13, -15, -8, 20]);
  assert.equal(rows[1].length, 9);
  for (const index of [79, 90, 91, 108, 109, 189, 200, 201, 207, 218, 219]) {
    assert.equal(rows[index].length, 24, `exception row ${index}`);
  }
  assert.equal(rows[110].length, 9, 'row 110 retains source zero-triple termination');
  assert.equal(rows[79][2], 6);
});

test('cc and ccs are source column-major arrays with source byte conversion', async () => {
  const cc = decodeColumnTable(await source('cc'), 11, 'cc');
  const ccs = decodeColumnTable(await source('ccs'), 7, 'ccs');
  assert.equal(cc.length, 11);
  assert.equal(cc[0].length, 66);
  assert.equal(ccs.length, 7);
  assert.equal(ccs[0].length, 47);
  assert.deepEqual(ccs.map((column) => column[12]), [0, 9, 31, 15, 0, 0, 0]);
});

test('obj0 and ll decode original map records and 5x5 block placement', async () => {
  const rawBlocks = await source('obj0');
  const blocks = decodeObjectBlocks(rawBlocks);
  assert.equal(blocks.length, 73);
  assert.equal(blocks[0].length, 25);
  assert.deepEqual(blocks[0].slice(0, 8), [1, 1, 0, 0, 0, 5, 5, 0]);
  assert.deepEqual(blocks[2].slice(0, 5), [1, 9, 10, 0, 0]);
  assert.ok(blocks.every((block) => block.every((tile) => tile >= 0 && tile <= 255)));
  const ll = await source('ll');
  const dimensions = [[128, 20], [128, 22], [102, 26], [120, 23], [99, 40], [123, 21], [127, 23], [128, 22], [127, 22], [128, 21], [127, 22]];
  const firstPlacements = [[6, 12, 66], [18, 20, 7], [17, 22, 10], [12, 21, 35], [8, 35, 52], [47, 18, 23], [30, 21, 35], [3, 20, 7], [0, 20, 7], [15, 15, 12], [41, 21, 38]];
  dimensions.forEach(([width, height], index) => {
    const level = decodeLevel(ll, index, blocks);
    assert.deepEqual([level.width, level.height], [width, height]);
    assert.deepEqual(level.tilePlacements[0].map((value) => value & 0xff), firstPlacements[index]);
    assert.ok(level.tilePlacements.length > 0, `source tile placements ${index}`);
    assert.ok(level.tiles.flat().some((tile) => tile !== 0), `decoded map tiles ${index}`);
  });
});
