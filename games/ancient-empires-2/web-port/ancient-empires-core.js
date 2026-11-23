import { idiv, s16 } from './format.js';

// Port of i.java:158 and c.java:465-486. This property-indexed movement-cost
// table is taken from the original controller constant.
export const MOVEMENT_COST_BY_PROPERTY = Object.freeze([83, 83, 83, 83, 83, 83, 83, 83, 175, 84, 84, 84, 175, 147, 159, 151, 155, 167, 171]);
export const IMPASSABLE_COST = 1000;
export const OUT_OF_BOUNDS_COST = 10000;

export function movementCost({ x, y, unitType, terrainProperty, occupiedUnit, unit, teamForPlayer }) {
  if (x < 0 || y < 0) return OUT_OF_BOUNDS_COST;
  if (occupiedUnit && teamForPlayer(occupiedUnit.playerId) !== teamForPlayer(unit.playerId)) return IMPASSABLE_COST;
  if (unitType === 11) return terrainProperty === 4 ? IMPASSABLE_COST : MOVEMENT_COST_BY_PROPERTY[0];
  if ((unit.movementMask & 1) !== 0) return MOVEMENT_COST_BY_PROPERTY[0];
  if ((unit.movementMask & 2) !== 0 && terrainProperty === 5) return MOVEMENT_COST_BY_PROPERTY[0];
  if (terrainProperty < 0 || terrainProperty >= MOVEMENT_COST_BY_PROPERTY.length) return OUT_OF_BOUNDS_COST;
  return MOVEMENT_COST_BY_PROPERTY[terrainProperty];
}

// Port of c.java:443-486. Source stores the maximum remaining movement in a
// signed-byte x/y grid. Incoming edge masks prevent immediate backtracking;
// a complete range pass calls the source recursion once from each legal source
// point and preserves its source traversal order.
export function calculateReachability({ unit, width, height, terrainAt, unitAt, teamForPlayer }) {
  const range = Array.from({ length: width }, () => Array(height).fill(0));
  const source = { x: unit.x, y: unit.y };
  const maxRange = Math.max(0, Math.min(unit.movementRange, 127));
  sourceRecursion(range, source.x, source.y, unit.type, maxRange, -1, unit, false, width, height, terrainAt, unitAt, teamForPlayer);
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (range[x][y] <= 0 || range[x][y] === 127) continue;
      sourceRecursion(range, x, y, unit.type, range[x][y], -1, unit, false, width, height, terrainAt, unitAt, teamForPlayer);
    }
  }
  const costs = new Map();
  const previous = new Map();
  for (let x = 0; x < width; x++) for (let y = 0; y < height; y++) {
    if (range[x][y] <= 0 || range[x][y] === 127) continue;
    const key = `${x},${y}`;
    const occupant = unitAt(x, y);
    if (occupant && occupant.id !== unit.id && teamForPlayer(occupant.playerId) === teamForPlayer(unit.playerId)) continue;
    costs.set(key, unit.movementRange - range[x][y]);
    const parent = chooseSourceRouteParent(range, x, y, width, height);
    if (parent) previous.set(key, `${parent.x},${parent.y}`);
  }
  costs.delete(`${unit.x},${unit.y}`);
  return { costs, previous, cells: [...costs.keys()].map(key => key.split(',').map(Number)), range };
}

// Direct source translation of c.a(byte[][],x,y,remaining,blockedDirection,...).
function sourceRecursion(range, x, y, unitType, remaining, blockedDirection, unit, searchOnly, width, height, terrainAt, unitAt, teamForPlayer) {
  if (x < 0 || y < 0 || x >= width || y >= height || remaining <= range[x][y]) return false;
  range[x][y] = s16(remaining) > 127 ? 127 : s16(remaining);
  const occupant = unitAt(x, y);
  if (searchOnly && !occupant) return true;
  const neighbors = [
    { x, y: y - 1, direction: 1, reverse: 2 },
    { x, y: y + 1, direction: 2, reverse: 1 },
    { x: x - 1, y, direction: 4, reverse: 8 },
    { x: x + 1, y, direction: 8, reverse: 4 },
  ];
  for (const next of neighbors) {
    if (blockedDirection === next.direction) continue;
    const target = unitAt(next.x, next.y);
    const stepCost = movementCost({
      x: next.x,
      y: next.y,
      unitType,
      terrainProperty: next.x < 0 || next.y < 0 || next.x >= width || next.y >= height ? null : terrainAt(next.x, next.y),
      occupiedUnit: target,
      unit,
      teamForPlayer,
    });
    const nextRemaining = remaining - stepCost;
    if (nextRemaining < 0) continue;
    const found = sourceRecursion(range, next.x, next.y, unitType, nextRemaining, next.reverse, unit, searchOnly, width, height, terrainAt, unitAt, teamForPlayer);
    if (found && searchOnly) return true;
  }
  return false;
}

function chooseSourceRouteParent(range, targetX, targetY, width, height) {
  // Port of c.java:401-437; ties resolve in north, south, west, east order.
  const candidates = [
    { x: targetX, y: targetY - 1 }, { x: targetX, y: targetY + 1 },
    { x: targetX - 1, y: targetY }, { x: targetX + 1, y: targetY },
  ].filter(cell => cell.x >= 0 && cell.y >= 0 && cell.x < width && cell.y < height);
  let best = null;
  for (const cell of candidates) if (range[cell.x][cell.y] > 0 && (!best || range[cell.x][cell.y] > range[best.x][best.y])) best = cell;
  return best;
}

// Port of c.java:350-399. For a confirmed route, source appends the horizontal
// segment first, then the vertical segment, using Java integer division.
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

// Port of c.java:166-177. Callbacks represent the exact delegated lookups;
// opaque fields remain raw instead of being relabeled as familiar stats.
export function resolveOriginalDamage({ attacker, defender, attackLookup, attackerModifier, defenderModifier }) {
  const attackValue = attackLookup(attacker.rawFieldD, attacker.rawFieldE) + attackerModifier;
  const defenseValue = defender.rawFieldF + defenderModifier;
  const raw = idiv((attackValue - defenseValue) * attacker.rawFieldG, 100);
  const damage = Math.max(0, Math.min(defender.rawFieldG, raw));
  return {
    damage,
    defenderFieldG: defender.rawFieldG - damage,
    attackerFieldA: attacker.rawFieldA + (attacker.rawD + attacker.rawE + attacker.rawF) * damage,
  };
}

// Port of i.java:3533-3589. Preserve the source property predicates and income;
// caller must supply ownership from verified state, not the skipped map section.
export function advancePlayerTurn({ playerIndex, playerCount, turnCount, playerModes, playerPositions, units, propertyOwnerAt, terrainPropertyAt, balances }) {
  const nextTurn = s16(turnCount + 1);
  playerPositions[playerIndex] = playerPositions[playerIndex] ?? [0, 0];
  let nextPlayer = (playerIndex + 1) % playerCount;
  let skipped = 0;
  while (playerModes[nextPlayer] === 2 && skipped < playerCount) { nextPlayer = (nextPlayer + 1) % playerCount; skipped++; }
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
  for (const unit of units) if (unit.rawStatus !== 3) { unit.rawStatus = 0; unit.rawTurnCounter = 0; }
  return { playerIndex: nextPlayer, turnCount: nextTurn, income };
}
