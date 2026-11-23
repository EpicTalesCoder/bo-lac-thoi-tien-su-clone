import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateReachability, movementCost, resolveOriginalDamage, advancePlayerTurn, buildStraightPath } from '../ancient-empires-core.js';

test('source movement uses loaded movement-cost constants, mask exceptions, and blockers', () => {
  const base = { playerPalette: [0, 1], playerAtUnit: 0, occupantPlayer: null, movementMask: 0 };
  assert.equal(movementCost({ ...base, x: 0, y: 0, unitType: 0, terrainProperty: 18 }), 171);
  assert.equal(movementCost({ ...base, x: 0, y: 0, unitType: 0, terrainProperty: 1, movementMask: 1 }), 83);
  assert.equal(movementCost({ ...base, x: 0, y: 0, unitType: 0, terrainProperty: 5, movementMask: 2 }), 83);
  assert.equal(movementCost({ ...base, x: 0, y: 0, unitType: 11, terrainProperty: 4 }), 1000);
  assert.equal(movementCost({ ...base, x: -1, y: 0, unitType: 0, terrainProperty: 0 }), 10000);
  assert.equal(movementCost({ x: 0, y: 0, unitType: 0, terrainProperty: 0, occupantPlayer: 1, playerPalette: [0, 1], playerAtUnit: 0, movementMask: 0 }), 1000);
});

test('range expansion respects source terrain costs and friendly occupied cells', () => {
  const reach = calculateReachability({
    origin: { id: 1, x: 1, y: 1 }, width: 3, height: 3, movementBudget: 166, movementRadius: 2,
    unitType: 0, movementMask: 0,
    terrainAt: (x, y) => x === 2 && y === 1 ? 9 : 0,
    playerAt: () => 0,
    playerPalette: [0],
    units: [{ id: 1, x: 1, y: 1 }, { id: 2, x: 1, y: 0 }],
  });
  assert.equal(reach.costs.has('1,0'), false);
  assert.equal(reach.costs.get('2,1'), 84);
  assert.equal(reach.costs.get('1,2'), 83);
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

test('observed source income is computed only from explicit property ownership facts', () => {
  const owners = [[0, 1], [1, 0]];
  const terrain = [[8, 9], [9, 0]];
  const balances = [100, 200];
  const turn = advancePlayerTurn({
    playerIndex: 0, playerCount: 2, turnCount: 4, playerModes: [1, 1], playerPositions: [], units: [], balances,
    propertyOwnerAt: Object.assign((x, y, player) => owners[x][y] === player, { width: 2, height: 2 }),
    terrainPropertyAt: (x, y) => terrain[x][y],
  });
  assert.deepEqual(turn, { playerIndex: 1, turnCount: 5, income: 100 });
  assert.deepEqual(balances, [100, 300]);
});

test('source movement path is straight x-first then y with signed-short narrowing', () => {
  assert.deepEqual(buildStraightPath(2, 3, 4, 1), [[2, 3], [3, 3], [4, 3], [4, 2], [4, 1]]);
});
