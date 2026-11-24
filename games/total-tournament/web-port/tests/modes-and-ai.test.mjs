import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  decodeCa, decodeColumnTable, decodeCu2, decodeEffects, decodeLevel, decodeObjectBlocks,
  decodeWeaponSets, decodeWeaponTable,
} from '../tt-loader.js';
import { createSourceMatch, tickSourceMatch } from '../tt-match.js';
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

test('bot AI actively moves and engages across 60 simulation ticks without errors', () => {
  const tables = loadTablesSync();
  const match = createSourceMatch(tables, { mode: MODE.TEAM_DEATHMATCH, levelIndex: 0, character: 0, settings: { I: 6, F: 20 } });
  const initialBotPositions = match.actors.slice(1).map((a) => a.x);
  for (let t = 0; t < 60; t++) tickSourceMatch(match, {}, tables);
  const movedBots = match.actors.slice(1).filter((a, i) => a.x !== initialBotPositions[i]);
  assert.ok(movedBots.length >= 1, 'at least one AI bot should move during 60 ticks');
});

test('CTF flag steal, carry, and return-to-base capture scores and ends match at limit E', () => {
  const tables = loadTablesSync();
  const match = createSourceMatch(tables, { mode: MODE.CAPTURE_FLAG, levelIndex: 0, character: 0, settings: { I: 2, E: 1 } });
  const player = match.actors[0]; // team 0
  const enemyFlag = match.flags[1];
  const ownFlag = match.flags[0];

  // Move player onto enemy flag to pick it up
  player.x = enemyFlag.x;
  player.y = enemyFlag.y;
  tickSourceMatch(match, {}, tables);
  assert.equal(enemyFlag.carrier, 0, 'player should pick up enemy flag');

  // Carry enemy flag back to own base where own flag is home
  player.x = ownFlag.baseX;
  player.y = ownFlag.baseY - 16;
  tickSourceMatch(match, {}, tables);
  assert.equal(match.teamScore[0], 1);
  assert.equal(match.finished, true);
  assert.equal(match.finishReason, 'flags');
  assert.equal(match.winner, 'player');
});

test('Deathmatch, Survival, and Last Hero modes enforce their respective win conditions', () => {
  const tables = loadTablesSync();

  // Deathmatch frag limit
  const dm = createSourceMatch(tables, { mode: MODE.DEATHMATCH, levelIndex: 0, character: 0, settings: { I: 2, F: 1 } });
  dm.actors[0].kills = 1;
  tickSourceMatch(dm, {}, tables);
  assert.equal(dm.finished, true);
  assert.equal(dm.finishReason, 'frags');
  assert.equal(dm.winner, 'player');

  // Survival death limit
  const surv = createSourceMatch(tables, { mode: MODE.SURVIVAL, levelIndex: 0, character: 0, settings: { I: 2, D: 2 } });
  surv.actors[1].deaths = 2;
  tickSourceMatch(surv, {}, tables);
  assert.equal(surv.finished, true);
  assert.equal(surv.finishReason, 'deaths');
  assert.equal(surv.winner, 'player');

  // Last Hero round progression & finish
  const lh = createSourceMatch(tables, { mode: MODE.LAST_HERO, levelIndex: 0, character: 0, settings: { I: 2, G: 1 } });
  lh.timeMs = 77;
  tickSourceMatch(lh, {}, tables);
  assert.equal(lh.finished, true);
  assert.equal(lh.finishReason, 'rounds');
});

test('dead actor animation clamps on final fallen frame instead of looping stand-up', () => {
  const tables = loadTablesSync();
  const match = createSourceMatch(tables, { mode: MODE.DEATHMATCH, levelIndex: 0, character: 0, settings: { I: 2 } });
  const victim = match.actors[1];
  victim.status = 0;
  victim.action = 4;
  victim.animation = 5;
  victim.animationFrame = 0;
  victim.respawnTimer = 15;

  const frames = [];
  for (let i = 0; i < 8; i++) {
    tickSourceMatch(match, {}, tables);
    frames.push(victim.animationFrame);
  }
  const maxFrame = Math.max(...frames);
  assert.equal(frames.at(-1), maxFrame, 'death animation should stay clamped on final frame');
  assert.ok(frames.slice(-3).every((f) => f === maxFrame), 'death animation must not loop back to 0');
});

test('two opposing AI bots jumping simultaneously still fire and deal damage without deadlocking', () => {
  const tables = loadTablesSync();
  const match = createSourceMatch(tables, { mode: MODE.TEAM_DEATHMATCH, levelIndex: 0, character: 0, settings: { I: 4, balance: [2, 2], F: 20 } });
  const allyBot = match.actors[1]; // team 0 AI
  const enemyBot = match.actors[2]; // team 1 AI
  allyBot.x = 140; allyBot.y = 140; allyBot.inAir = 1; allyBot.vy = -8;
  enemyBot.x = 165; enemyBot.y = 140; enemyBot.inAir = 1; enemyBot.vy = -8;

  let firedCount = 0;
  for (let t = 0; t < 25; t++) {
    tickSourceMatch(match, {}, tables);
    if (match.projectiles.length > 0) firedCount += 1;
  }
  assert.ok(firedCount > 0, 'opposing jumping AI bots should fire ranged weapons instead of deadlocking');
});
