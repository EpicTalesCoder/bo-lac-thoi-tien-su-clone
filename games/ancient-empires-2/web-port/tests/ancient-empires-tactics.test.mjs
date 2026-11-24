import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advancePlayerTurn,
  chooseAiUnitAction,
  executeCombat,
  getAttackableTargets,
  getTargetableTowns,
} from '../ancient-empires-core.js';

test('AI Sorceress prioritizes raising adjacent tombstone into a Skeleton', () => {
  const map = {
    width: 5,
    height: 5,
    tiles: Array.from({ length: 5 }, () => new Int8Array(5)),
  };
  const sorceress = {
    id: 1, type: 3, playerSelector: 2, x: 1, y: 1,
    movementRange: 4, atkMin: 40, atkMax: 50, defense: 10, minRange: 1, maxRange: 1,
    hp: 100, action: 0, movementMask: 0,
  };
  const tomb = {
    id: 2, type: 0, playerSelector: 1, x: 2, y: 1,
    hp: 0, action: 3, tombTimer: 2,
  };
  const units = [sorceress, tomb];
  const act = chooseAiUnitAction({
    unit: sorceress,
    units,
    map,
    terrainAt: () => 0,
    unitAt: (x, y) => units.find(u => u.x === x && u.y === y && u.action !== 3),
    teamForPlayer: p => p,
    myPalette: 2,
  });
  assert.equal(act.kind, 'raise');
  assert.equal(act.tombId, 2);
});

test('Dire Wolf inflicts poison, Wisp grants +10 aura, and Catapult cannot fire after moving', () => {
  const wolf = {
    id: 1, type: 5, playerSelector: 1, x: 1, y: 1,
    atkMin: 55, atkMax: 55, defense: 15, minRange: 1, maxRange: 1,
    hp: 100, xp: 0, level: 0, status: 0, action: 0,
  };
  const target = {
    id: 2, type: 0, playerSelector: 2, x: 2, y: 1,
    atkMin: 40, atkMax: 40, defense: 10, minRange: 1, maxRange: 1,
    hp: 100, xp: 0, level: 0, status: 0, action: 0,
  };
  executeCombat({
    attacker: wolf,
    defender: target,
    terrainAt: () => 0,
    rawTileAt: () => 0,
    rng: () => 0.5,
  });
  assert.equal((target.status & 1) !== 0, true, 'Dire Wolf attack must inflict poison bit 1');

  const wisp = { id: 3, type: 4, playerSelector: 1, x: 1, y: 2, hp: 100, action: 0, status: 0 };
  const units = [wolf, target, wisp];
  advancePlayerTurn({
    playerIndex: 1,
    playerCount: 2,
    turnCount: 0,
    playerModes: [1, 0],
    playerPositions: [[0, 0], [0, 0]],
    units,
    propertyOwnerAt: Object.assign(() => false, { width: 5, height: 5 }),
    terrainPropertyAt: () => 0,
    balances: [100, 100],
  });
  assert.equal((wolf.status & 2) !== 0, true, 'adjacent Wisp must grant +10 attack aura bit 2');

  const catapult = {
    id: 4, type: 7, playerSelector: 1, x: 0, y: 1,
    minRange: 2, maxRange: 4, hp: 100, action: 0, movedThisTurn: true,
  };
  assert.equal(getAttackableTargets(catapult, [catapult, target], p => p).length, 0, 'moved Catapult cannot fire');
  catapult.movedThisTurn = false;
  assert.equal(getAttackableTargets(catapult, [catapult, target], p => p).length, 1, 'stationary Catapult can fire at range 2');
});

test('Catapult bombards non-allied intact Towns, poison persists across victim turn, Skeleton vanishes, King revives at +200G', () => {
  // 1. Catapult town targeting (c.java:336-340)
  const map = {
    width: 6,
    height: 3,
    tiles: Array.from({ length: 6 }, () => new Int8Array(3)),
  };
  map.tiles[3][1] = 41; // Player 2 owned Town at dist 3
  map.tiles[4][1] = 39; // Player 1 owned Town at dist 4 (allied -> skip)
  map.tiles[2][1] = 27; // Ruined town at dist 2 (already ruined -> skip)
  const terrainAt = (x, y) => ([2, 3, 4].includes(x) && y === 1 ? 8 : 0);
  const catapult = {
    id: 10, type: 7, playerSelector: 1, x: 0, y: 1,
    movementRange: 3, atkMin: 50, atkMax: 60, defense: 5, minRange: 2, maxRange: 4,
    hp: 100, action: 0, movedThisTurn: false,
  };
  const towns = getTargetableTowns({
    unit: catapult,
    map,
    terrainAt,
    unitAt: () => null,
    teamForPlayer: p => p,
  });
  assert.deepEqual(towns.map(t => [t.x, t.y]), [[3, 1]]);
  const aiChoice = chooseAiUnitAction({
    unit: catapult,
    units: [catapult],
    map,
    terrainAt,
    unitAt: (x, y) => (x === catapult.x && y === catapult.y ? catapult : null),
    teamForPlayer: p => p,
    myPalette: 1,
  });
  assert.equal(aiChoice.kind, 'destroyTown');
  assert.equal(aiChoice.targetX, 3);
  assert.equal(aiChoice.targetY, 1);

  // 2. Poison lasts through victim's turn, clears when victim ends turn (i.java:2447)
  const victim = { id: 11, type: 0, playerSelector: 2, x: 1, y: 1, hp: 100, status: 1, action: 0 };
  const units = [catapult, victim];
  const noProps = Object.assign(() => false, { width: 6, height: 3 });
  advancePlayerTurn({
    playerIndex: 0,
    playerCount: 2,
    turnCount: 0,
    playerModes: [1, 0],
    playerPositions: [[0, 0], [0, 0]],
    units,
    propertyOwnerAt: noProps,
    terrainPropertyAt: () => 0,
    balances: [100, 100],
  });
  assert.equal((victim.status & 1) !== 0, true, 'Poison must stay active during victim turn');
  advancePlayerTurn({
    playerIndex: 1,
    playerCount: 2,
    turnCount: 1,
    playerModes: [1, 0],
    playerPositions: [[0, 0], [0, 0]],
    units,
    propertyOwnerAt: noProps,
    terrainPropertyAt: () => 0,
    balances: [100, 100],
  });
  assert.equal((victim.status & 1) === 0, true, 'Poison clears once victim finishes turn');

  // 3. Skeleton vanishes with NO tombstone, Commander moves off-map & increments +200G up to 1000G (i.java:2508-2518)
  const killer = { id: 12, type: 1, playerSelector: 1, x: 0, y: 0, atkMin: 150, atkMax: 150, defense: 20, minRange: 1, maxRange: 1, hp: 100, action: 0 };
  const skel = { id: 13, type: 10, playerSelector: 2, x: 1, y: 0, atkMin: 40, atkMax: 40, defense: 0, minRange: 1, maxRange: 1, hp: 20, action: 0 };
  executeCombat({ attacker: killer, defender: skel, terrainAt: () => 0, rawTileAt: () => 0, rng: () => 0.5 });
  assert.equal(skel.action, 4, 'Killed Skeleton must vanish (action=4, no tombstone)');

  const king = { id: 14, type: 9, playerSelector: 2, x: 1, y: 0, atkMin: 50, atkMax: 50, defense: 0, minRange: 1, maxRange: 1, hp: 20, action: 0, reviveCost: 800 };
  executeCombat({ attacker: killer, defender: king, terrainAt: () => 0, rawTileAt: () => 0, rng: () => 0.5 });
  assert.equal(king.action, 3);
  assert.equal(king.x, -10);
  assert.equal(king.y, -10);
  assert.equal(king.reviveCost, 1000);
});
