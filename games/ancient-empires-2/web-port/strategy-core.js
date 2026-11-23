export const BLOCKED_MOVEMENT_COST = 1000;
export const TERRAIN_MOVEMENT_COST = [83, 83, 83, 83, 83, 83, 83, 83, 175, 84, 84, 84, 175, 147, 159, 151, 155, 167, 171];
const UNIT_TERRAIN_MASK_BITS = [3, 6, 1, 5, 8, 7, null, 9, 0, 2, null, null];

export function movementMaskFromRecord(record) {
  return (record.movementMaskBits ?? []).reduce((mask, bitIndex) => mask | (1 << bitIndex), 0);
}

export function unitStatsFromRecord(record) {
  const [movement, attackMin, attackMax, defense, rangeMax, rangeMin] = record.fields;
  const terrainMaskBit = UNIT_TERRAIN_MASK_BITS[record.recordId];
  return {
    movement,
    attackMin,
    attackMax,
    defense,
    attackRangeMin: rangeMin,
    attackRangeMax: rangeMax,
    cost: record.shortValue,
    frameOffsets: record.frameOffsets,
    movementMaskBits: record.movementMaskBits,
    movementMask: movementMaskFromRecord(record),
    terrainMaskBit,
    // The special-case terrain field is a boolean mask, separate from unit movement capabilities.
    terrainMask: terrainMaskBit == null ? 0 : 1 << terrainMaskBit,
  };
}

export function movementCostForTile({ unit, tileId, tileProperties, occupant }) {
  if (occupant && occupant.team !== unit.team) return BLOCKED_MOVEMENT_COST;
  const property = tileProperties[tileId] ?? 0;
  const movementMask = unit.movementMask ?? 0;
  if (unit.typeId === 11) return property === 4 ? BLOCKED_MOVEMENT_COST : 1;
  if ((movementMask & (1 << 1)) !== 0) return 1;
  if ((movementMask & (1 << 2)) !== 0 && property === 5) return 1;
  if (property < 0 || property >= TERRAIN_MOVEMENT_COST.length) return TERRAIN_MOVEMENT_COST[0];
  return TERRAIN_MOVEMENT_COST[property];
}

export function findReachableTiles({ unit, width, height, tiles, tileProperties, units }) {
  const key = (x, y) => `${x},${y}`;
  const occupied = new Map(units
    .filter((other) => other.id !== unit.id && other.hp > 0)
    .map((other) => [key(other.x, other.y), other]));
  const costs = new Map([[key(unit.x, unit.y), 0]]);
  const previous = new Map();
  const pending = new Set([key(unit.x, unit.y)]);

  while (pending.size > 0) {
    let currentKey;
    let best = Number.POSITIVE_INFINITY;
    for (const candidate of pending) {
      const cost = costs.get(candidate);
      if (cost < best) {
        currentKey = candidate;
        best = cost;
      }
    }
    pending.delete(currentKey);
    const [x, y] = currentKey.split(',').map(Number);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nextX = x + dx;
      const nextY = y + dy;
      if (nextX < 0 || nextY < 0 || nextX >= width || nextY >= height) continue;
      const nextKey = key(nextX, nextY);
      const stepCost = movementCostForTile({
        unit,
        tileId: tiles[nextY][nextX],
        tileProperties,
        occupant: occupied.get(nextKey),
      });
      if (stepCost >= BLOCKED_MOVEMENT_COST) continue;
      const nextCost = best + stepCost;
      if (nextCost > unit.movement || (costs.has(nextKey) && costs.get(nextKey) <= nextCost)) continue;
      costs.set(nextKey, nextCost);
      previous.set(nextKey, currentKey);
      pending.add(nextKey);
    }
  }

  costs.delete(key(unit.x, unit.y));
  for (const [cell, occupant] of occupied) {
    if (occupant.team === unit.team) costs.delete(cell);
  }
  return {
    cells: [...costs.keys()].map((cell) => cell.split(',').map(Number)),
    costs,
    previous,
  };
}

export function buildMovementPath(previous, start, destination) {
  const startKey = `${start.x},${start.y}`;
  const destinationKey = `${destination.x},${destination.y}`;
  if (startKey === destinationKey || !previous.has(destinationKey)) return [];
  const path = [];
  let cursor = destinationKey;
  while (cursor !== startKey) {
    if (!previous.has(cursor)) return [];
    const [x, y] = cursor.split(',').map(Number);
    path.unshift([x, y]);
    cursor = previous.get(cursor);
  }
  return path;
}

export function resolveSingleStrike({ attacker, defender, attackerStats, defenderStats, terrainBonus = 0, defenseBonus = 0, attackRoll }) {
  const attack = attackRoll ?? attackerStats.attackMin + Math.floor(Math.random() * Math.max(1, attackerStats.attackMax - attackerStats.attackMin));
  let damage = (attack + terrainBonus - (defenderStats.defense + defenseBonus)) * attacker.hp / 100;
  damage = Math.max(0, Math.min(defender.hp, Math.floor(damage)));
  return { damage, remainingHp: defender.hp - damage, experience: damage * attacker.level };
}
