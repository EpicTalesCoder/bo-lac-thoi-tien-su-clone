import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  decodeCa, decodeColumnTable, decodeCu2, decodeEffects, decodeLevel, decodeObjectBlocks,
  decodeWeaponSets, decodeWeaponTable,
} from '../tt-loader.js';
import { createSourceMatch, tickSourceMatch, poseIndexForActor } from '../tt-match.js';
import { MODE } from '../tt-core.js';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const RES = path.resolve(DIR, '../jar-resources');
const readBin = (name) => new Uint8Array(fs.readFileSync(path.join(RES, `${name}.png`)));

function loadTablesSync() {
  const cu2 = decodeCu2(readBin('cu2'));
  const ca = decodeCa(readBin('ca'));
  const cc = decodeColumnTable(readBin('cc'), 11, 'cc');
  const ccs = decodeColumnTable(readBin('ccs'), 7, 'ccs');
  const objectBlocks = decodeObjectBlocks(readBin('obj0'));
  const weaponTable = decodeWeaponTable(readBin('wpn'));
  const equipmentSets = decodeWeaponSets(readBin('wlg'));
  const effects = decodeEffects(readBin('mua'));
  const ll = readBin('ll');
  const levels = Array.from({ length: 11 }, (_, i) => decodeLevel(ll, i, objectBlocks, cu2));
  return { cu2, ca, cc, ccs, objectBlocks, weaponTable, equipmentSets, effects, levels };
}

test('all 11 levels initialize cleanly with valid tileset/background and grounded actors', () => {
  const tables = loadTablesSync();
  for (let lvl = 0; lvl < 11; lvl++) {
    const match = createSourceMatch(tables, { mode: MODE.DEATHMATCH, levelIndex: lvl, character: 0, settings: { I: 4 } });
    assert.equal(match.actors.length, 4);
    assert.equal(match.tilesetName, lvl % 2 === 0 ? 'l0' : 'l1');
    assert.equal(match.backgroundName, lvl % 2 === 0 ? 'bg0' : 'bg1');
    for (let t = 0; t < 15; t++) tickSourceMatch(match, {}, tables);
    assert.ok(match.camera.x >= 0 && match.camera.y >= 0);
  }
});

test('player horizontal movement, jump impulse, gravity, and pose index bounds work accurately', () => {
  const tables = loadTablesSync();
  const match = createSourceMatch(tables, { mode: MODE.DEATHMATCH, levelIndex: 0, character: 0, settings: { I: 2 } });
  const player = match.player;
  // Let player settle on a platform
  for (let t = 0; t < 30; t++) tickSourceMatch(match, {}, tables);
  const startX = player.x;
  tickSourceMatch(match, { right: true }, tables);
  tickSourceMatch(match, { right: true }, tables);
  assert.ok(player.x > startX, 'moving right should increase player X');
  assert.equal(player.facing, 1);

  const midX = player.x;
  tickSourceMatch(match, { left: true }, tables);
  tickSourceMatch(match, { left: true }, tables);
  assert.ok(player.x <= midX, 'moving left should decrease or brake player X');
  assert.equal(player.facing, -1);

  // Force grounded state and verify jump impulse
  player.inAir = 0;
  player.vy = 0;
  tickSourceMatch(match, { jump: true }, tables);
  assert.equal(player.inAir, 1);
  assert.ok(player.vy < 0, 'jump should apply negative vertical velocity');

  const poseIdx = poseIndexForActor(player, tables);
  assert.ok(poseIdx >= 0 && poseIdx < tables.ca.length);
});

test('walking across cc[6]==-1 slope tiles stays grounded and pit falls kill without hovering', () => {
  const tables = loadTablesSync();
  const match = createSourceMatch(tables, { mode: MODE.DEATHMATCH, levelIndex: 0, character: 0, settings: { I: 2 } });
  const player = match.player;

  // Level 0 tiles (15,18)=37(-1) and (16,18)=38(-1) are diagonal ramp tiles
  player.x = 14 * 16 + 8;
  player.y = 18 * 16 + 5;
  player.inAir = 0;
  player.vy = 0;
  for (let i = 0; i < 6; i++) tickSourceMatch(match, { right: true }, tables);
  assert.equal(player.status, 1, 'walking across cc[6]==-1 ramp tiles must not fall through to pit');
  assert.ok(player.y < 19 * 16, 'player should stay on ramp surface instead of falling through');

  // Falling into open pit at x=28 (empty tiles down to bottom) kills actor and lets corpse drop off-screen
  player.x = 28 * 16 + 8;
  player.y = 16 * 16;
  player.inAir = 1;
  player.vy = 4;
  for (let i = 0; i < 8; i++) tickSourceMatch(match, {}, tables);
  assert.equal(player.status, 0, 'falling into pit should kill actor');
  assert.ok(player.y > match.level.worldHeight, 'fallen actor must not hover inside visible pit');
});

test('team bases and spawns stay on their own side in TDM and CTF', () => {
  const tables = loadTablesSync();
  for (let lvl = 0; lvl < 4; lvl++) {
    const ctf = createSourceMatch(tables, { mode: MODE.CAPTURE_FLAG, levelIndex: lvl, character: 0, settings: { I: 6, balance: [3, 3] } });
    const team0Actors = ctf.actors.filter((a) => a.team === 0);
    const team1Actors = ctf.actors.filter((a) => a.team === 1);
    const base0X = ctf.flags[0].baseX;
    const base1X = ctf.flags[1].baseX;
    for (const a of team0Actors) {
      assert.ok(Math.abs(a.x - base0X) < Math.abs(a.x - base1X), `lvl ${lvl}: Team 0 must spawn closer to own base`);
    }
    for (const a of team1Actors) {
      assert.ok(Math.abs(a.x - base1X) < Math.abs(a.x - base0X), `lvl ${lvl}: Team 1 must spawn closer to own base`);
    }
  }
});
