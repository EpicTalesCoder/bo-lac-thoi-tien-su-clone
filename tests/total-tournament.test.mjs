import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  decodeCa, decodeColumnTable, decodeCu2, decodeJ2meImageBytes, decodeLevel,
  decodeLzStartupImage, decodeObjectBlocks, decodeWeaponSets, decodeWeaponTable,
} from '../games/total-tournament/web-port/tt-loader.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ANALYSIS = path.join(ROOT, 'games/total-tournament/analysis/recovered');
const PORT = path.join(ROOT, 'games/total-tournament/web-port');
const source = async (name) => new Uint8Array(await readFile(path.join(ANALYSIS, `${name}.png`)));

test('source-faithful port no longer exposes the procedural shooter model', async () => {
  const core = await import('../games/total-tournament/web-port/tt-core.js');
  assert.equal(core.MAP_W, undefined);
  assert.equal(core.genArena, undefined);
  assert.equal(core.WEAPONS, undefined);
  assert.equal(core.TICK_TARGET_MS, 77);
});

test('original JAR remains immutable and its recorded checksum matches', async () => {
  const jar = await readFile(path.join(ROOT, 'games/total-tournament/original/total-tournament.jar'));
  const expected = (await readFile(path.join(ROOT, 'games/total-tournament/analysis/ASSETS-SHA256.txt'), 'utf8'))
    .split('\n').find((line) => line.endsWith('../original/total-tournament.jar')).split(/\s+/)[0];
  assert.equal(createHash('sha256').update(jar).digest('hex'), expected);
});

test('source binary decoders agree with JAR record sizes and first level header', async () => {
  assert.equal(decodeCu2(await source('cu2')).length, 118);
  const ca = decodeCa(await source('ca'));
  assert.equal(ca.length, 220);
  assert.deepEqual(ca[0], [-12, 0, 1, -12, -12, 13, -15, -8, 20]);
  assert.equal(decodeColumnTable(await source('cc'), 11, 'cc')[0].length, 66);
  assert.equal(decodeColumnTable(await source('ccs'), 7, 'ccs')[0].length, 47);
  const blocks = decodeObjectBlocks(await source('obj0'));
  assert.equal(blocks.length, 73);
  assert.equal(decodeWeaponSets(await source('wlg')).length, 16);
  assert.equal(decodeWeaponTable(await source('wpn')).length, 11);
  const level = decodeLevel(await source('ll'), 0, blocks);
  assert.deepEqual([level.width, level.height], [128, 20]);
});

test('all exported browser resources are byte-identical to JAR resource entries', async () => {
  const manifest = JSON.parse(await readFile(path.join(PORT, 'jar-resources/manifest.json'), 'utf8'));
  const jarDigest = createHash('sha256').update(await readFile(path.join(ROOT, 'games/total-tournament/original/total-tournament.jar'))).digest('hex');
  assert.equal(manifest.sourceJarSha256, jarDigest);
  for (const entry of manifest.resources) {
    const bytes = await readFile(path.join(PORT, 'jar-resources', entry.path));
    assert.equal(bytes.length, entry.bytes, entry.path);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256, entry.path);
  }
});

test('original image decode paths produce PNG data', async () => {
  for (const name of ['bg0', 'bg1', 'or', 'li1', 'li2', 'f1', 'f2', 'fnt', 'curs', 'erou', 'ld', 'u0', 'u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 's0', 's1', 'l0', 'l1']) {
    assert.equal(decodeJ2meImageBytes(await source(name))[0], 0x89, name);
  }
  assert.deepEqual(Array.from(decodeLzStartupImage(await source('lz')).slice(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10]);
});

test('entry page loads only local ESM and original controls', async () => {
  const html = await readFile(path.join(PORT, 'index.html'), 'utf8');
  assert.match(html, /<script type="module" src="game\.js"><\/script>/);
  assert.doesNotMatch(html, /phaser|mountPhaserRuntime|WASD.*mouse/i);
});
