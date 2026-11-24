import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advancePlayerTurn,
  chooseAiUnitAction,
  executeCombat,
  getAttackableTargets,
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
