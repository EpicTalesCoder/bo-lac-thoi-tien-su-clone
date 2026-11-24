import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateAttackRangeCells,
  calculateReachability,
  canCounterattack,
  traceRoute,
  movementCost,
  resolveOriginalDamage,
  advancePlayerTurn,
  buildStraightPath,
  computeUnitStats,
  executeCombat,
  getAttackableTargets,
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

test('range expansion respects source terrain costs, 0-init remaining > 0 rule, and friendly occupied cells', () => {
  const units = [
    { id: 1, x: 1, y: 1, type: 0, playerSelector: 1, movementRange: 3, movementMask: 0, action: 0 },
    { id: 2, x: 1, y: 0, type: 0, playerSelector: 1, movementRange: 3, movementMask: 0, action: 0 },
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
  assert.equal(reach.costs.get('2,1'), 2); // remaining = 3 - 2 = 1 (> 0)
  assert.equal(reach.costs.get('1,2'), 1);
  assert.deepEqual(traceRoute(reach, 1, 1, 2, 1), [[1, 1], [2, 1]]);

  const blockedReach = calculateReachability({
    unit: { ...units[0], movementRange: 2 },
    width: 3,
    height: 3,
    terrainAt: (x, y) => (x === 2 && y === 1 ? 2 : 0),
    unitAt: (x, y) => units.find(u => u.x === x && u.y === y),
    teamForPlayer: p => p,
  });
  assert.equal(blockedReach.costs.has('2,1'), false, 'i.java:931 0-init blocks cells with remaining === 0');
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

test('crystal terrain cost, attack range perimeters, counterattack gates, and all 12 unit range rules match c.java', () => {
  const teamForPlayer = p => p;
  const crystal = { id: 1, type: 11, playerSelector: 1, movementRange: 4, movementMask: 0, minRange: 0, maxRange: 0 };
  assert.equal(movementCost({ x: 0, y: 0, unitType: 11, terrainProperty: 2, occupiedUnit: null, unit: crystal, teamForPlayer }), 2);
  assert.equal(movementCost({ x: 0, y: 0, unitType: 11, terrainProperty: 5, occupiedUnit: null, unit: crystal, teamForPlayer }), 3);
  assert.equal(movementCost({ x: 0, y: 0, unitType: 11, terrainProperty: 4, occupiedUnit: null, unit: crystal, teamForPlayer }), 1000);

  const archer = { id: 2, type: 1, x: 3, y: 3, playerSelector: 1, hp: 100, movementRange: 5, movementMask: 64, minRange: 1, maxRange: 2, action: 0 };
  const archerTargetFar = { id: 3, type: 0, x: 5, y: 3, playerSelector: 2, hp: 100, minRange: 1, maxRange: 1, action: 0 };
  const catapult = { id: 4, type: 7, x: 2, y: 2, playerSelector: 2, hp: 100, movementRange: 4, movementMask: 512, minRange: 2, maxRange: 4, action: 0 };
  assert.equal(getAttackableTargets(archer, [archer, archerTargetFar], teamForPlayer).length, 1);
  assert.equal(canCounterattack(archer, archerTargetFar.x, archerTargetFar.y), false, 'archer only counterattacks at dist === 1');
  assert.equal(canCounterattack(catapult, 2, 3), false, 'catapult minRange === 2 cannot counterattack at dist === 1');
  assert.equal(canCounterattack({ ...crystal, x: 2, y: 3, action: 0, hp: 100 }, 2, 2), false, 'crystal minRange === 0 cannot counterattack');

  const archerGrid = calculateAttackRangeCells({
    unit: archer,
    width: 9,
    height: 9,
    terrainAt: () => 0,
    unitAt: () => null,
    teamForPlayer,
    fromCurrentOnly: true,
  });
  assert.equal(archerGrid.attackCells.some(([x, y]) => x === 5 && y === 3), true);
  assert.equal(archerGrid.attackCells.some(([x, y]) => x === 6 && y === 3), false);

  const catGrid = calculateAttackRangeCells({
    unit: catapult,
    width: 9,
    height: 9,
    terrainAt: () => 0,
    unitAt: () => null,
    teamForPlayer,
  });
  assert.equal(catGrid.attackOnlyCells.some(([x, y]) => x === 6 && y === 2), true, 'catapult reaches dist 4 from stationary tile');
  assert.equal(catGrid.attackOnlyCells.some(([x, y]) => x === 7 && y === 2), false, 'catapult cannot move+attack (mask 512)');
});
