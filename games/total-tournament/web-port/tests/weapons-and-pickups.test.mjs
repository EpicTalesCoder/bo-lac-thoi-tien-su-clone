import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  decodeCa, decodeColumnTable, decodeCu2, decodeEffects, decodeLevel, decodeObjectBlocks,
  decodeWeaponSets, decodeWeaponTable,
} from '../tt-loader.js';
import {
  createSourceMatch, tickSourceMatch, fireWeapon, switchWeapon, RESPAWN_TICKS,
} from '../tt-match.js';
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

test('weapon firing consumes ammo, damages enemy, triggers death and respawn after cK ticks', () => {
  const tables = loadTablesSync();
  const match = createSourceMatch(tables, { mode: MODE.DEATHMATCH, levelIndex: 0, character: 0, settings: { I: 2, F: 5 } });
  const player = match.actors[0];
  const enemy = match.actors[1];

  // Position enemy directly in front of player and give player Railgun (weapon 5, 100 damage)
  player.x = 120; player.y = 120; player.facing = 1; player.inAir = 0;
  enemy.x = 160; enemy.y = 120; enemy.facing = -1; enemy.health = 40; enemy.armor = 0;
  player.ownedWeapons[5] = 1;
  player.ammo[5] = 3;
  player.weapon = 5;

  const fired = fireWeapon(match, 0, tables);
  assert.equal(fired, true);
  assert.equal(player.ammo[5], 2);
  assert.equal(match.projectiles.length, 1);

  tickSourceMatch(match, {}, tables);
  assert.equal(enemy.status, 0, 'railgun 100 dmg should eliminate 40 HP enemy');
  assert.equal(player.kills, 1);
  assert.equal(enemy.deaths, 1);

  // Advance RESPAWN_TICKS to verify enemy respawns automatically
  for (let i = 0; i < RESPAWN_TICKS + 2; i++) tickSourceMatch(match, {}, tables);
  assert.equal(enemy.status, 1, 'enemy should respawn after RESPAWN_TICKS');
  assert.equal(enemy.health, enemy.maxHealth);
});

test('pickups heal HP/armor, grant new weapons, and switchWeapon cycles owned weapons', () => {
  const tables = loadTablesSync();
  const match = createSourceMatch(tables, { mode: MODE.DEATHMATCH, levelIndex: 0, character: 0, settings: { I: 2 } });
  const player = match.actors[0];

  // Inject deterministic medkit + rocket launcher pickups right at player tile
  const tx = player.x >> 4;
  const ty = player.y >> 4;
  player.health = 50;
  match.pickups = [
    { tx, ty, x: tx * 16, y: ty * 16, type: 0, frameId: 69, respawnTimer: 0 },
    { tx, ty, x: tx * 16, y: ty * 16, type: 10, frameId: 79, respawnTimer: 0 }, // weapon 3 (rocket)
  ];

  tickSourceMatch(match, {}, tables);
  assert.equal(player.health, 80);
  assert.equal(player.ownedWeapons[3], 1);
  assert.equal(player.weapon, 3);
  assert.ok(match.pickups[0].respawnTimer > 0);

  const next = switchWeapon(player, 1);
  assert.notEqual(next, 3);
});

test('Railgun beam truncates at hit target and Rocket splash deals ar=72 damage & self-kill penalty', () => {
  const tables = loadTablesSync();
  const match = createSourceMatch(tables, { mode: MODE.DEATHMATCH, levelIndex: 0, character: 0, settings: { I: 3, F: 10 } });
  const p = match.actors[0];
  const e1 = match.actors[1];
  const e2 = match.actors[2];

  // Railgun should hit e1 first, truncate width, and NOT pierce e2 behind e1
  p.x = 100; p.y = 140; p.facing = 1; p.inAir = 0; p.fireCooldown = 0;
  e1.x = 140; e1.y = 140; e1.health = 100; e1.armor = 0; e1.inAir = 0;
  e2.x = 200; e2.y = 140; e2.health = 100; e2.armor = 0; e2.inAir = 0;
  p.ownedWeapons[5] = 1; p.ammo[5] = 2; p.weapon = 5;

  fireWeapon(match, 0, tables);
  tickSourceMatch(match, {}, tables);
  assert.ok(e1.health < 100, 'front target should take railgun damage');
  assert.equal(e2.health, 100, 'rear target should not be hit after beam truncation');
  assert.equal(match.projectiles.length, 1);
  assert.ok(match.projectiles[0].width < 120, 'beam width should truncate to target distance');

  // Tick 2: beam stays non-damaging on lingering visual frame and clears on tick 3
  const e1AfterTick1 = e1.health;
  tickSourceMatch(match, {}, tables);
  assert.equal(e1.health, e1AfterTick1, 'lingering rail beam must not deal duplicate tick damage');

  // Self-kill via Rocket splash within ar=72 subtracts 1 kill (O[self] -= 2 before +1)
  p.status = 1; p.health = 10; p.armor = 0; p.kills = 2; p.fireCooldown = 0;
  p.x = 120; p.y = 200; p.facing = 1;
  e1.x = 260; e1.y = 200;
  match.projectiles.push({
    x: 165, y: 185, prevX: 165, prevY: 185, vx: 8, damage: 0,
    owner: 0, life: 5, width: 14, height: 6, weapon: 3, facing: 1, hitOnce: false,
  });
  // Place rocket into wall tile x=8
  p.x = 24; p.y = 140; p.facing = -1;
  match.projectiles.length = 0;
  match.projectiles.push({
    x: 10, y: 130, prevX: 18, prevY: 130, vx: -8, damage: 0,
    owner: 0, life: 5, width: 14, height: 6, weapon: 3, facing: -1, hitOnce: false,
  });
  tickSourceMatch(match, {}, tables);
  assert.equal(p.status, 0, 'splash inside ar=72 should eliminate low-HP owner');
  assert.equal(p.kills, 1, 'self-kill should net -1 kill (2 -> 1)');
});
