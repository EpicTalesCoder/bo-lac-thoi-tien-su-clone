import { idiv, s8, s16 } from './format.js';

// Port of i.java:64-65 (static byte[] f = terrain defense, static byte[] g = terrain movement cost)
export const TERRAIN_DEFENSE_BY_PROPERTY = Object.freeze([0, 5, 10, 10, 15, 0, 5, 15, 15, 15]);
export const MOVEMENT_COST_BY_PROPERTY = Object.freeze([1, 1, 2, 2, 3, 3, 1, 1, 1, 1]);
export const IMPASSABLE_COST = 1000;
export const OUT_OF_BOUNDS_COST = 10000;
export const FIRST_BUILDING_TILE = 37; // i.java:3606 (this.j = 37)

// Port of i.java:3616-3621: decode building palette owner from tile ID (>= 37)
export function buildingPaletteFromTile(rawTile) {
  const tile = s8(rawTile);
  if (tile >= FIRST_BUILDING_TILE) return idiv(tile - FIRST_BUILDING_TILE, 2);
  return -1;
}

// Port of i.java:3606-3610: encode captured/repaired building tile ID for a palette (1..4)
export function encodeBuildingTile(rawTile, palette) {
  const tile = s8(rawTile);
  const frame = tile >= FIRST_BUILDING_TILE ? (tile - FIRST_BUILDING_TILE) % 2 : 0;
  return FIRST_BUILDING_TILE + palette * 2 + frame;
}

// Port of c.java:465-487: exact terrain movement cost with flying/aquatic/enemy-blocker rules
export function movementCost({ x, y, unitType, terrainProperty, occupiedUnit, unit, teamForPlayer }) {
  if (x < 0 || y < 0) return OUT_OF_BOUNDS_COST;
  const uType = unitType ?? unit?.type ?? 0;
  const uMask = unit?.movementMask ?? 0;
  if (occupiedUnit && occupiedUnit.action !== 3 && occupiedUnit.action !== 4 && teamForPlayer(occupiedUnit.playerSelector) !== teamForPlayer(unit.playerSelector)) {
    return IMPASSABLE_COST;
  }
  if (uType === 11) {
    // Port of c.java:502-516: Crystal is blocked by mountains (prop 4), otherwise uses i.g[terrainProperty].
    if (terrainProperty === 4) return IMPASSABLE_COST;
  } else {
    if ((uMask & 1) !== 0) return 1; // c.java:477 flying ignores terrain
    if ((uMask & 2) !== 0 && terrainProperty === 5) return 1; // c.java:480 aquatic in water
  }
  if (terrainProperty == null || terrainProperty < 0 || terrainProperty >= MOVEMENT_COST_BY_PROPERTY.length) {
    return OUT_OF_BOUNDS_COST;
  }
  return MOVEMENT_COST_BY_PROPERTY[terrainProperty];
}

// Port of c.java:443-486 & i.java:931: exact recursive remaining-movement flood fill
// (range table initializes to 0, so cells with remaining <= 0 are impassable).
export function calculateReachability({ unit, width, height, terrainAt, unitAt, teamForPlayer }) {
  const range = Array.from({ length: width }, () => Array(height).fill(0));
  const maxRange = Math.max(0, Math.min(unit.movementRange ?? unit.budget ?? 0, 127));
  sourceRecursion(range, unit.x, unit.y, unit.type, maxRange, -1, unit, width, height, terrainAt, unitAt, teamForPlayer);

  const costs = new Map();
  const previous = new Map();
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (range[x][y] <= 0) continue;
      if (x === unit.x && y === unit.y) continue;
      const occupant = unitAt(x, y);
      if (occupant && occupant.id !== unit.id && occupant.action !== 3 && occupant.action !== 4) continue;
      const key = `${x},${y}`;
      costs.set(key, maxRange - range[x][y]);
      const parent = chooseSourceRouteParent(range, x, y, width, height);
      if (parent) previous.set(key, `${parent.x},${parent.y}`);
    }
  }
  return { costs, previous, cells: [...costs.keys()].map(k => k.split(',').map(Number)), range };
}

export function traceRoute(reachability, startX, startY, endX, endY) {
  const startKey = `${startX},${startY}`;
  let key = `${endX},${endY}`;
  if (!reachability?.previous || key === startKey || !reachability.costs?.has(key)) return [[startX, startY]];
  const reversed = [[endX, endY]];
  const visited = new Set([key]);
  while (key !== startKey) {
    const prevKey = reachability.previous.get(key);
    if (!prevKey || visited.has(prevKey)) break;
    visited.add(prevKey);
    const [px, py] = prevKey.split(',').map(Number);
    reversed.push([px, py]);
    key = prevKey;
    if (key === startKey) break;
  }
  if (reversed[reversed.length - 1][0] !== startX || reversed[reversed.length - 1][1] !== startY) {
    reversed.push([startX, startY]);
  }
  return reversed.reverse();
}

function sourceRecursion(range, x, y, unitType, remaining, blockedDirection, unit, width, height, terrainAt, unitAt, teamForPlayer) {
  if (x < 0 || y < 0 || x >= width || y >= height || remaining <= range[x][y]) return;
  range[x][y] = s16(remaining) > 127 ? 127 : s16(remaining);
  const neighbors = [
    { x, y: y - 1, direction: 1, reverse: 2 },
    { x, y: y + 1, direction: 2, reverse: 1 },
    { x: x - 1, y, direction: 4, reverse: 8 },
    { x: x + 1, y, direction: 8, reverse: 4 },
  ];
  for (const next of neighbors) {
    if (blockedDirection === next.direction) continue;
    if (next.x < 0 || next.y < 0 || next.x >= width || next.y >= height) continue;
    const target = unitAt(next.x, next.y);
    const stepCost = movementCost({
      x: next.x,
      y: next.y,
      unitType,
      terrainProperty: terrainAt(next.x, next.y),
      occupiedUnit: target,
      unit,
      teamForPlayer,
    });
    const nextRemaining = remaining - stepCost;
    if (nextRemaining < 0) continue;
    sourceRecursion(range, next.x, next.y, unitType, nextRemaining, next.reverse, unit, width, height, terrainAt, unitAt, teamForPlayer);
  }
}

function chooseSourceRouteParent(range, targetX, targetY, width, height) {
  // Port of c.java:401-437: ties resolve in north, south, west, east order
  const candidates = [
    { x: targetX, y: targetY - 1 }, { x: targetX, y: targetY + 1 },
    { x: targetX - 1, y: targetY }, { x: targetX + 1, y: targetY },
  ].filter(cell => cell.x >= 0 && cell.y >= 0 && cell.x < width && cell.y < height);
  let best = null;
  for (const cell of candidates) {
    if (range[cell.x][cell.y] > 0 && (!best || range[cell.x][cell.y] > range[best.x][best.y])) best = cell;
  }
  return best;
}

// Port of c.java:350-399: straight x-then-y path ordering using Java integer division
export function buildStraightPath(startX, startY, endX, endY) {
  const path = [[startX, startY]];
  const dx = endX - startX;
  const horizontalSteps = Math.abs(dx);
  if (horizontalSteps > 0) {
    const step = idiv(dx, horizontalSteps);
    for (let index = 0, x = startX; index < horizontalSteps; index++) {
      x = s16(x + step);
      path.push([x, startY]);
    }
  }
  const dy = endY - startY;
  const verticalSteps = Math.abs(dy);
  if (verticalSteps > 0) {
    const step = idiv(dy, verticalSteps);
    for (let index = 0, y = startY; index < verticalSteps; index++) {
      y = s16(y + step);
      path.push([endX, y]);
    }
  }
  return path;
}

// Port of c.java:76-89: build unit combat stats from units.bin record & level (0..9)
export function computeUnitStats(record, level = 0) {
  const lv = Math.max(0, Math.min(9, level | 0));
  const bonus = lv * 2;
  const movementMask = (record.movementMaskBits || []).reduce((m, bit) => m | (1 << bit), 0);
  return {
    movementRange: record.fields[0],
    atkMin: record.fields[1] + bonus,
    atkMax: record.fields[2] + bonus,
    defense: record.fields[3] + bonus,
    maxRange: record.fields[4],
    minRange: record.fields[5],
    cost: record.shortValue,
    movementMask,
  };
}

// Port of c.java:131-148: attack modifiers (status aura/poison, anti-air, wisp vs skeleton, aquatic in water, temple tile 34)
export function attackModifierFor(attacker, defender, ax, ay, terrainProp, rawTile) {
  let mod = 0;
  if (((attacker.status || 0) & 1) !== 0) mod -= 10; // c.java:219 poisoned
  if (((attacker.status || 0) & 2) !== 0) mod += 10; // c.java:223 wisp aura
  if (defender) {
    if (((attacker.movementMask || 0) & 64) !== 0 && ((defender.movementMask || 0) & 1) !== 0) mod += 15; // c.java:134
    if (attacker.type === 4 && defender.type === 10) mod += 15; // c.java:137 wisp vs skeleton
  }
  if (((attacker.movementMask || 0) & 2) !== 0 && terrainProp === 5) mod += 10; // c.java:141 aquatic in water
  if (rawTile === 34) mod += 25; // c.java:144 crystal/altar tile
  return mod;
}

// Port of c.java:154-164: defense modifiers (terrain defense i.f[prop], poison, aquatic in water, tile 34)
export function defenseModifierFor(defender, dx, dy, terrainProp, rawTile) {
  let mod = TERRAIN_DEFENSE_BY_PROPERTY[terrainProp] ?? 0; // c.java:156 i.f[by]
  if (((defender.status || 0) & 1) !== 0) mod -= 10; // c.java:221 poisoned
  if (((defender.movementMask || 0) & 2) !== 0 && terrainProp === 5) mod += 15; // c.java:157
  if (rawTile === 34) mod += 15; // c.java:160
  return mod;
}

// Port of c.java:166-196: exact damage, XP gain, and level-up arithmetic
export function resolveOriginalDamage({ attacker, defender, attackLookup, attackerModifier, defenderModifier }) {
  const attackValue = attackLookup(attacker.rawFieldD, attacker.rawFieldE) + attackerModifier;
  const defenseValue = defender.rawFieldF + defenderModifier;
  const raw = idiv((attackValue - defenseValue) * attacker.rawFieldG, 100);
  const damage = Math.max(0, Math.min(defender.rawFieldG, raw));
  const defenderWeight = defender.rawD != null
    ? (defender.rawD + defender.rawE + defender.rawF)
    : (attacker.rawD + attacker.rawE + attacker.rawF);
  return {
    damage,
    defenderFieldG: defender.rawFieldG - damage,
    attackerFieldA: attacker.rawFieldA + defenderWeight * damage,
  };
}

// Port of c.java:198-200: counterattack predicate (adjacent melee unit still alive)
export function canCounterattack(defender, attackerX, attackerY) {
  const dist = Math.abs(defender.x - attackerX) + Math.abs(defender.y - attackerY);
  return defender.action !== 4 && defender.hp > 0 && dist === 1 && (defender.minRange ?? 1) === 1;
}

// Port of c.java:166-200 & i.java:2358-2407: full combat strike + conditional counterstrike + level-up
export function executeCombat({ attacker, defender, terrainAt, rawTileAt, rng = Math.random, tombTurns = 2 }) {
  const roll = (min, max) => min + Math.floor(rng() * Math.max(1, max - min + 1));
  const attackerHpBefore = attacker.hp;
  const defenderHpBefore = defender.hp;
  const aProp = terrainAt(attacker.x, attacker.y) ?? 0;
  const dProp = terrainAt(defender.x, defender.y) ?? 0;
  const aTile = rawTileAt(attacker.x, attacker.y) ?? 0;
  const dTile = rawTileAt(defender.x, defender.y) ?? 0;

  const strike = resolveOriginalDamage({
    attacker: {
      rawFieldD: attacker.atkMin, rawFieldE: attacker.atkMax,
      rawFieldG: attacker.hp, rawFieldA: attacker.xp || 0,
      rawD: attacker.atkMin, rawE: attacker.atkMax, rawF: attacker.defense,
    },
    defender: {
      rawFieldF: defender.defense, rawFieldG: defender.hp,
      rawD: defender.atkMin, rawE: defender.atkMax, rawF: defender.defense,
    },
    attackLookup: roll,
    attackerModifier: attackModifierFor(attacker, defender, attacker.x, attacker.y, aProp, aTile),
    defenderModifier: defenseModifierFor(defender, defender.x, defender.y, dProp, dTile),
  });

  defender.hp = strike.defenderFieldG;
  attacker.xp = strike.attackerFieldA;
  // Dire Wolf (type 5) inflicts poison (status |= 1, c.java:202-208)
  if (attacker.type === 5 && defender.hp > 0) defender.status = (defender.status || 0) | 1;

  let attackerLeveled = applyLevelUp(attacker);
  let counterDamage = 0;
  let defenderLeveled = false;

  if (defender.hp <= 0) {
    markDefeatedUnit(defender, tombTurns);
  } else if (canCounterattack(defender, attacker.x, attacker.y)) {
    const counter = resolveOriginalDamage({
      attacker: {
        rawFieldD: defender.atkMin, rawFieldE: defender.atkMax,
        rawFieldG: defender.hp, rawFieldA: defender.xp || 0,
        rawD: defender.atkMin, rawE: defender.atkMax, rawF: defender.defense,
      },
      defender: {
        rawFieldF: attacker.defense, rawFieldG: attacker.hp,
        rawD: attacker.atkMin, rawE: attacker.atkMax, rawF: attacker.defense,
      },
      attackLookup: roll,
      attackerModifier: attackModifierFor(defender, attacker, defender.x, defender.y, dProp, dTile),
      defenderModifier: defenseModifierFor(attacker, attacker.x, attacker.y, aProp, aTile),
    });
    counterDamage = counter.damage;
    attacker.hp = counter.defenderFieldG;
    defender.xp = counter.attackerFieldA;
    if (defender.type === 5 && attacker.hp > 0) attacker.status = (attacker.status || 0) | 1;
    defenderLeveled = applyLevelUp(defender);
    if (attacker.hp <= 0) {
      markDefeatedUnit(attacker, tombTurns);
    }
  }

  return {
    damage: strike.damage,
    counterDamage,
    attackerLeveled,
    defenderLeveled,
    attackerHpBefore,
    defenderHpBefore,
    attackerHpAfter: attacker.hp,
    defenderHpAfter: defender.hp,
  };
}

function markDefeatedUnit(unit, tombTurns = 2) {
  unit.hp = 0;
  unit.rawStatus = 0;
  if (unit.type === 10 || unit.type === 11) {
    // Port of i.java:2508-2509: Skeletons (10) & Crystals (11) vanish cleanly with no tombstone
    unit.action = 4;
    unit.tombTimer = 0;
    return;
  }
  unit.action = 3; // Tombstone or off-map fallen Commander (i.java:2506-2518)
  if (unit.type === 9) {
    unit.x = -10;
    unit.y = -10;
    unit.tombTimer = 0;
    const currentCost = unit.reviveCost ?? 200;
    if (currentCost < 1000) unit.reviveCost = currentCost + 200;
    return;
  }
  unit.tombTimer = tombTurns;
}

// Port of c.java:180-196: experience threshold & +2/+2/+2 stat promotion up to level 9
export function applyLevelUp(unit) {
  let leveled = false;
  while ((unit.level || 0) < 9) {
    const weight = unit.atkMin + unit.atkMax + unit.defense;
    const needed = idiv(weight * 100 * 2, 3);
    if (needed <= 0 || (unit.xp || 0) < needed) break;
    unit.xp -= needed;
    unit.level = (unit.level || 0) + 1;
    unit.atkMin += 2;
    unit.atkMax += 2;
    unit.defense += 2;
    leveled = true;
  }
  return leveled;
}

// Port of c.java:248-278: Manhattan attack range check [minRange, maxRange]
export function getAttackableTargets(unit, units, teamForPlayer) {
  const minR = unit.minRange ?? 1;
  const maxR = unit.maxRange ?? 1;
  if (minR <= 0 || maxR <= 0) return [];
  // Catapult (minRange > 1) cannot fire after moving in AE2 unless still at start position
  if (minR > 1 && unit.movedThisTurn) return [];
  return units.filter(other => {
    if (other.id === unit.id || other.action === 3 || other.action === 4 || other.hp <= 0) return false;
    if (teamForPlayer(other.playerSelector) === teamForPlayer(unit.playerSelector)) return false;
    const dist = Math.abs(other.x - unit.x) + Math.abs(other.y - unit.y);
    return dist >= minR && dist <= maxR;
  });
}

// Port of c.java:251-298: exact move + attack reachability overlay (`range[x][y] === 127` for attack perimeter).
export function calculateAttackRangeCells({
  unit,
  width,
  height,
  terrainAt,
  unitAt,
  teamForPlayer,
  reachability = null,
  fromCurrentOnly = false,
}) {
  if (!unit) return { moveCells: [], attackCells: [], attackOnlyCells: [] };
  const minR = unit.minRange ?? 1;
  const maxR = unit.maxRange ?? 1;
  const stationaryOnly = fromCurrentOnly || ((unit.movementMask ?? 0) & 512) !== 0;
  const reach = reachability ?? (fromCurrentOnly ? { costs: new Map(), cells: [] } : calculateReachability({
    unit,
    width,
    height,
    terrainAt,
    unitAt,
    teamForPlayer,
  }));
  const moveCells = reach.cells || [];
  const moveSet = new Set([`${unit.x},${unit.y}`, ...moveCells.map(([cx, cy]) => `${cx},${cy}`)]);
  const origins = stationaryOnly ? [[unit.x, unit.y]] : [[unit.x, unit.y], ...moveCells];

  const attackCells = [];
  const attackOnlyCells = [];
  if (minR > 0 && maxR >= minR) {
    const attackSet = new Set();
    for (const [ox, oy] of origins) {
      const x0 = Math.max(0, ox - maxR);
      const y0 = Math.max(0, oy - maxR);
      const x1 = Math.min(width - 1, ox + maxR);
      const y1 = Math.min(height - 1, oy + maxR);
      for (let x = x0; x <= x1; x++) {
        for (let y = y0; y <= y1; y++) {
          const dist = Math.abs(x - ox) + Math.abs(y - oy);
          if (dist < minR || dist > maxR) continue;
          const k = `${x},${y}`;
          if (attackSet.has(k)) continue;
          attackSet.add(k);
          attackCells.push([x, y]);
          if (!moveSet.has(k)) attackOnlyCells.push([x, y]);
        }
      }
    }
  }
  return { moveCells, attackCells, attackOnlyCells };
}

// Port of c.java:336-340: unmoved Catapult (type 7) can bombard unoccupied non-allied Towns (prop 8, tile >= 37)
export function getTargetableTowns({ unit, map, terrainAt, unitAt, teamForPlayer, ownerTeamForTile }) {
  if (!unit || unit.type !== 7) return [];
  const minR = unit.minRange ?? 2;
  const maxR = unit.maxRange ?? 4;
  if (minR > 1 && unit.movedThisTurn) return [];
  const resolveTileTeam = ownerTeamForTile || (raw => {
    const pal = buildingPaletteFromTile(raw);
    return pal > 0 ? teamForPlayer(pal) : -1;
  });
  const targets = [];
  for (let x = 0; x < map.width; x++) {
    for (let y = 0; y < map.height; y++) {
      const dist = Math.abs(x - unit.x) + Math.abs(y - unit.y);
      if (dist < minR || dist > maxR) continue;
      if (unitAt(x, y)) continue;
      if ((terrainAt(x, y) ?? 0) !== 8) continue;
      const rawTile = s8(map.tiles[x][y]);
      if (rawTile < FIRST_BUILDING_TILE) continue;
      const tileTeam = resolveTileTeam(rawTile);
      if (tileTeam !== -1 && tileTeam === teamForPlayer(unit.playerSelector)) continue;
      targets.push({ x, y, rawTile });
    }
  }
  return targets;
}

// Port of i.java:3591-3600: capture & repair predicates
export function getTileActionForUnit(unit, rawTile, terrainProp, myPalette) {
  const tile = s8(rawTile);
  const mask = unit.movementMask || 0;
  const ownerPal = buildingPaletteFromTile(tile);
  if ((mask & 8) !== 0 && terrainProp === 8 && tile < FIRST_BUILDING_TILE) return 'repair';
  if ((mask & 8) !== 0 && terrainProp === 8 && tile >= FIRST_BUILDING_TILE && ownerPal !== myPalette) return 'capture';
  if ((mask & 16) !== 0 && terrainProp === 9 && tile >= FIRST_BUILDING_TILE && ownerPal !== myPalette) return 'capture';
  return null;
}

// Port of i.java:3533-3589 & i.java:2290-2301: turn advance, income (+30/+50), tombstones, Wisp aura, & +20 HP healing
export function advancePlayerTurn({
  playerIndex,
  playerCount,
  turnCount,
  playerModes,
  playerPositions,
  units,
  propertyOwnerAt,
  terrainPropertyAt,
  balances,
}) {
  const nextTurn = s16(turnCount + 1);
  playerPositions[playerIndex] = playerPositions[playerIndex] ?? [0, 0];
  let nextPlayer = (playerIndex + 1) % playerCount;
  let skipped = 0;
  while (playerModes[nextPlayer] === 2 && skipped < playerCount) {
    nextPlayer = (nextPlayer + 1) % playerCount;
    skipped++;
  }

  // Tombstone decay, status expiry, & reset unit action flags (i.java:2447, 3543-3558)
  for (let i = units.length - 1; i >= 0; i--) {
    const unit = units[i];
    if (unit.action === 4) {
      units.splice(i, 1);
      continue;
    }
    if (unit.action === 3 || unit.rawStatus === 3) {
      if (unit.type !== 9 && typeof unit.tombTimer === 'number') {
        unit.tombTimer -= 1;
        if (unit.tombTimer <= 0) units.splice(i, 1);
      }
      continue;
    }
    unit.action = 0;
    unit.rawStatus = 0;
    unit.rawTurnCounter = 0;
    unit.movedThisTurn = false;
    if (unit.playerSelector === playerIndex + 1) {
      // Clear expired poison (bit 1) at end of poisoned player's completed turn (i.java:2447)
      unit.status = (unit.status || 0) & ~1;
    }
    // Reset Wisp aura (bit 2) before recalculating adjacent Wisps below
    unit.status = (unit.status || 0) & ~2;
  }

  // Wisp (type 4) grants +10 attack aura (status |= 2) to adjacent allies (c.java:223)
  for (const wisp of units) {
    if (wisp.action === 3 || wisp.action === 4 || wisp.hp <= 0 || wisp.type !== 4) continue;
    for (const ally of units) {
      if (ally.action === 3 || ally.action === 4 || ally.hp <= 0 || ally.playerSelector !== wisp.playerSelector) continue;
      if (Math.abs(ally.x - wisp.x) + Math.abs(ally.y - wisp.y) === 1) {
        ally.status = (ally.status || 0) | 2;
      }
    }
  }

  // Income scan: owned village (prop 8) = +30, owned castle (prop 9) = +50 (i.java:3559-3572)
  let income = 0;
  for (let x = 0; x < propertyOwnerAt.width; x++) {
    for (let y = 0; y < propertyOwnerAt.height; y++) {
      if (!propertyOwnerAt(x, y, nextPlayer)) continue;
      const property = terrainPropertyAt(x, y);
      if (property === 8) income += 30;
      else if (property === 9) income += 50;
    }
  }
  balances[nextPlayer] = (balances[nextPlayer] ?? 0) + income;

  // Turn-start healing (+20 HP on Temple prop 7 or owned Village/Castle, i.java:2290-2301)
  const healed = [];
  for (const unit of units) {
    if (unit.action === 3 || unit.action === 4 || unit.hp <= 0 || unit.playerSelector !== nextPlayer + 1 || unit.hp >= 100) continue;
    const prop = terrainPropertyAt(unit.x, unit.y);
    const onHealTile = prop === 7 || propertyOwnerAt(unit.x, unit.y, nextPlayer);
    if (!onHealTile) continue;
    const amt = Math.min(20, 100 - unit.hp);
    unit.hp += amt;
    healed.push({ unitId: unit.id, x: unit.x, y: unit.y, amount: amt });
  }

  return { playerIndex: nextPlayer, turnCount: nextTurn, income, healed };
}

// Port of i.java:3774-4260 (strategic AI action scoring: capture > combat > bombard town > advance)
export function chooseAiUnitAction({ unit, units, map, terrainAt, unitAt, teamForPlayer, myPalette, ownerTeamForTile }) {
  const reach = calculateReachability({
    unit,
    width: map.width,
    height: map.height,
    terrainAt,
    unitAt,
    teamForPlayer,
  });
  const candidatePositions = [[unit.x, unit.y], ...reach.cells];
  let best = null;

  const enemies = units.filter(
    u => u.action !== 3 && u.action !== 4 && u.hp > 0 && teamForPlayer(u.playerSelector) !== teamForPlayer(unit.playerSelector)
  );

  for (const [cx, cy] of candidatePositions) {
    const moved = cx !== unit.x || cy !== unit.y;
    const rawTile = s8(map.tiles[cx][cy]);
    const prop = terrainAt(cx, cy) ?? 0;
    const defBonus = TERRAIN_DEFENSE_BY_PROPERTY[prop] ?? 0;

    // 1. Capture / Repair highest priority (i.java:3783-3824)
    const tileAct = getTileActionForUnit(unit, rawTile, prop, myPalette);
    if (tileAct) {
      const score = (prop === 9 ? 2600 : 1800) + defBonus;
      if (!best || score > best.score) best = { kind: tileAct, x: cx, y: cy, score };
    }

    // 1b. Sorceress (type 3) Raise Skeleton from adjacent tombstone (i.java:2515-2530)
    if (unit.type === 3) {
      const tomb = units.find(
        u => u.action === 3 && u.type !== 9 && u.x >= 0 && u.y >= 0 && Math.abs(u.x - cx) + Math.abs(u.y - cy) === 1 && !unitAt(u.x, u.y)
      );
      if (tomb) {
        const score = 1550 + defBonus;
        if (!best || score > best.score) best = { kind: 'raise', x: cx, y: cy, tombId: tomb.id, score };
      }
    }

    // 2. Attack any enemy reachable from (cx, cy)
    const virtualUnit = { ...unit, x: cx, y: cy, movedThisTurn: moved };
    const targets = getAttackableTargets(virtualUnit, units, teamForPlayer);
    for (const target of targets) {
      const estAtk = idiv(unit.atkMin + unit.atkMax, 2);
      const estDef = target.defense + (TERRAIN_DEFENSE_BY_PROPERTY[terrainAt(target.x, target.y) ?? 0] ?? 0);
      const estDmg = Math.max(0, Math.min(target.hp, idiv((estAtk - estDef) * unit.hp, 100)));
      const killBonus = estDmg >= target.hp ? 900 : 0;
      const kingBonus = target.type === 9 ? 400 : 0;
      const score = 1000 + estDmg * 12 + killBonus + kingBonus + defBonus * 2;
      if (!best || score > best.score) best = { kind: 'attack', x: cx, y: cy, targetId: target.id, score };
    }

    // 2b. Stationary Catapult bombards non-allied intact Towns (c.java:336-340, i.java:2497)
    if (unit.type === 7 && !moved) {
      const towns = getTargetableTowns({
        unit: virtualUnit,
        map,
        terrainAt,
        unitAt,
        teamForPlayer,
        ownerTeamForTile,
      });
      for (const town of towns) {
        const pal = buildingPaletteFromTile(town.rawTile);
        const score = (pal > 0 ? 1150 : 650) + defBonus * 2;
        if (!best || score > best.score) {
          best = { kind: 'destroyTown', x: cx, y: cy, targetX: town.x, targetY: town.y, score };
        }
      }
    }

    // 3. Otherwise advance toward nearest enemy or unowned village/castle
    let minEnemyDist = 999;
    for (const en of enemies) {
      const d = Math.abs(en.x - cx) + Math.abs(en.y - cy);
      if (d < minEnemyDist) minEnemyDist = d;
    }
    const moveScore = 400 - minEnemyDist * 18 + defBonus * 2 + (moved ? 10 : 0);
    if (!best || moveScore > best.score) best = { kind: 'move', x: cx, y: cy, score: moveScore };
  }

  return best || { kind: 'wait', x: unit.x, y: unit.y, score: 0 };
}
