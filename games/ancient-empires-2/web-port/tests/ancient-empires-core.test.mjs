import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateReachability,
  movementCost,
  resolveOriginalDamage,
  advancePlayerTurn,
  buildStraightPath,
  computeUnitStats,
  executeCombat,
  getTileActionForUnit,
  chooseAiUnitAction,
} from '../ancient-empires-core.js';

test('source movement uses javap-verified i.g:[B terrain costs, mask exceptions, and blockers', () => {
  const teamForPlayer = p => p;
  const baseUnit = { playerSelector: 1, movementMask: 0 };
  assert.equal(movementCost({ x: 0, y: 0, unitType: 0, terrainProperty: 4, occupiedUnit: null, unit: baseUnit, teamForPlayer }), 3);
  assert.equal(movementCost({ x: 0, y: 0, unitType: 0, terrainProperty: 4, occupiedUnit: null, unit: { playerSelector: 1, movementMask: 1 }, teamForPlayer }), 1);
  assert.equal(movementCost({ x: 0, y: 0, unitType: 0, terrainProperty: 5, occupiedUnit: null, unit: { playerSelector: 1, movementMask: 2 }, teamForPlayer }), 1);
  assert.equal(movementCost({ x: 0, y: 0, unitType: 11, terrainProperty: 4, occupiedUnit: null, unit: baseUnit, teamForPlayer }), 1000);
  assert.equal(movementCost({ x: -1, y: 0, unitType: 0, terrainProperty: 0, occupiedUnit: null, unit: baseUnit, teamForPlayer }), 10000);
  assert.equal(movementCost({ x: 0, y: 0, unitType: 0, terrainProperty: 0, occupiedUnit: { playerSelector: 2, action: 0 }, unit: baseUnit, teamForPlayer }), 1000);
});

test('range expansion respects source terrain costs and friendly occupied cells', () => {
  const units = [
    { id: 1, x: 1, y: 1, type: 0, playerSelector: 1, movementRange: 2, movementMask: 0, action: 0 },
    { id: 2, x: 1, y: 0, type: 0, playerSelector: 1, movementRange: 2, movementMask: 0, action: 0 },
  ];
  const reach = calculateReachability({
    unit: units[0],
    width: 3,
    height: 3,
    terrainAt: (x, y) => (x === 2 && y === 1 ? 2 : 0), // property 2 costs 2
    unitAt: (x, y) => units.find(u => u.x === x && u.y === y),
    teamForPlayer: p => p,
  });
  assert.equal(reach.costs.has('1,0'), false);
  assert.equal(reach.costs.get('2,1'), 2);
  assert.equal(reach.costs.get('1,2'), 1);
});

test('original combat arithmetic uses Java truncation and field values without invented stat labels', () => {
  const result = resolveOriginalDamage({
    attacker: { rawFieldD: 20, rawFieldE: 10, rawFieldG: 75, rawFieldA: 100, rawD: 3, rawE: 4, rawF: 5 },
    defender: { rawFieldF: 14, rawFieldG: 60 },
    attackLookup: () => 30,
    attackerModifier: 2,
    defenderModifier: 3,
  });
  assert.deepEqual(result, { damage: 11, defenderFieldG: 49, attackerFieldA: 232 });
});

test('executeCombat applies strike, conditional counterstrike, and level-up', () => {
  const soldierRec = { fields: [5, 50, 55, 5, 1, 1], shortValue: 150, movementMaskBits: [3] };
  const sStats = computeUnitStats(soldierRec, 0);
  const attacker = { id: 1, type: 0, x: 1, y: 1, playerSelector: 1, hp: 100, xp: 0, level: 0, action: 0, ...sStats };
  const defender = { id: 2, type: 0, x: 1, y: 2, playerSelector: 2, hp: 100, xp: 0, level: 0, action: 0, ...sStats };
  const res = executeCombat({
    attacker,
    defender,
    terrainAt: () => 0,
    rawTileAt: () => 0,
    rng: () => 0,
  });
  assert.equal(res.damage, 45);
  assert.equal(defender.hp, 55);
  assert.ok(res.counterDamage > 0);
  assert.ok(attacker.hp < 100);
});

test('observed source income and healing are computed from owned properties', () => {
  const owners = [[0, 1], [1, 0]];
  const terrain = [[8, 9], [9, 0]];
  const balances = [100, 200];
  const units = [{ id: 1, type: 0, x: 1, y: 0, playerSelector: 2, hp: 70, action: 1, status: 0 }];
  const turn = advancePlayerTurn({
    playerIndex: 0,
    playerCount: 2,
    turnCount: 4,
    playerModes: [1, 1],
    playerPositions: [],
    units,
    balances,
    propertyOwnerAt: Object.assign((x, y, player) => owners[x][y] === player, { width: 2, height: 2 }),
    terrainPropertyAt: (x, y) => terrain[x][y],
  });
  assert.equal(turn.playerIndex, 1);
  assert.equal(turn.turnCount, 5);
  assert.equal(turn.income, 100);
  assert.deepEqual(balances, [100, 300]);
  assert.equal(units[0].hp, 90); // +20 heal on owned castle
  assert.equal(units[0].action, 0);
});

test('capture/repair predicates and AI scoring prioritize objective capture and kills', () => {
  const soldier = { id: 1, type: 0, x: 1, y: 1, playerSelector: 2, hp: 100, atkMin: 50, atkMax: 55, defense: 5, movementRange: 4, movementMask: 8, minRange: 1, maxRange: 1, action: 0 };
  assert.equal(getTileActionForUnit(soldier, 39, 8, 2), 'capture'); // palette 1 village != palette 2
  assert.equal(getTileActionForUnit(soldier, 10, 8, 2), 'repair');  // ruined village (< 37)

  const map = {
    width: 3,
    height: 3,
    tiles: [
      [0, 0, 0],
      [0, 0, 39],
      [0, 0, 0],
    ],
  };
  const aiMove = chooseAiUnitAction({
    unit: soldier,
    units: [soldier],
    map,
    terrainAt: (x, y) => (x === 1 && y === 2 ? 8 : 0),
    unitAt: (x, y) => (x === 1 && y === 1 ? soldier : null),
    teamForPlayer: p => p,
    myPalette: 2,
  });
  assert.equal(aiMove.kind, 'capture');
  assert.equal(aiMove.x, 1);
  assert.equal(aiMove.y, 2);
});

test('source movement path is straight x-first then y with signed-short narrowing', () => {
  assert.deepEqual(buildStraightPath(2, 3, 4, 1), [[2, 3], [3, 3], [4, 3], [4, 2], [4, 1]]);
});
