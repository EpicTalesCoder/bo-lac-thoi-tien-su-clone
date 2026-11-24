// Pure ES module simulation engine for Total Tournament (1:1 port of e.java).
// Zero DOM dependencies so it runs identically in browser and Node.js tests.
import { MODE } from './tt-core.js';

export const VIEWPORT_WIDTH = 240;
export const VIEWPORT_HEIGHT = 320;
export const MAX_ACTORS = 10;
export const MAX_PROJECTILES = 20;
export const MAX_EFFECTS = 25;

// Exact constants from e.java:90-92, 256-258, 281-288, 2090-2092.
export const GRAVITY = 2; // e.java:90 ba = 2
export const ACCEL_X = 2; // e.java:92 bc = 2
export const MAX_FALL_SPEED = 16; // e.java:2091 bR = 16
export const JUMP_VELOCITY = -16; // e.java:804 -bR
export const PROJECTILE_SPEED = 8; // e.java:2092 cs = 8
export const RESPAWN_TICKS = 20; // e.java:256 cK = 20
export const SPLASH_DAMAGE = 50; // e.java:25 ag = 50
export const GIB_THRESHOLD = -25; // e.java:287 aj = -25

// e.java:257 cy = {1, 3, 7, 10, 5, 10}
export const WEAPON_COOLDOWN = Object.freeze([1, 3, 7, 10, 5, 10]);
// e.java:282-286 ak=5, ai=10, ah=30, rocket=0(+splash 50), al=35, am=100
export const WEAPON_DAMAGE = Object.freeze([5, 10, 30, 0, 35, 100]);
// e.java:281 cQ = {0, 61, 62, 63, 64, 0}
export const PROJECTILE_SPRITE_BASE = Object.freeze([0, 61, 62, 63, 64, 0]);
// e.java:288 cL = {0, 0, 80, 130, 200, 300}
export const WEAPON_PICKUP_RESPAWN = Object.freeze([0, 0, 80, 130, 200, 300]);
// e.java:258 ap[][] effect frame sequences (played from last index down to 0)
export const EFFECT_FRAMES = Object.freeze([
  [54, 49],
  [48, 46, 47],
  [42, 41, 39],
  [42, 41, 40],
  [38, 37, 36],
  [35, 34, 33],
  [45, 43, 44],
  [111, 110, 109, 108, 107, 107],
  [112, 113, 114, 114],
  [115, 116, 117, 117],
]);

export const DEFAULT_SETTINGS = Object.freeze({
  F: 15, // Frags limit (DM / TDM)
  D: 20, // Deaths limit (Survival)
  E: 10, // Flag captures limit (CTF)
  G: 20, // Rounds limit (Last Hero)
  H: 5,  // Time limit (minutes)
  I: 6,  // Total players (2..10)
  balance: [3, 3], // [soldiers, mutants]
});

function createRng(seed = 1337) {
  let state = (seed >>> 0) || 1;
  return (bound) => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return bound > 0 ? state % bound : 0;
  };
}

function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

// Helper: tile floor height from cc[6][tile] and slope from cc[9][tile] (e.java:399-426, 1508-1521)
export function getTileAt(level, tx, ty) {
  if (!level || tx < 0 || ty < 0 || tx >= level.width || ty >= level.height) return 0;
  return level.tiles[tx]?.[ty] ?? 0;
}

export function getTileFloorOffset(tables, tile) {
  if (!tile || !tables?.cc?.[6]) return 0;
  return tables.cc[6][tile] ?? 0;
}

export function getTileSlope(tables, tile) {
  if (!tile || !tables?.cc?.[9]) return 0;
  return tables.cc[9][tile] ?? 0;
}

export function hasTileFloor(tables, tile) {
  return getTileFloorOffset(tables, tile) !== 0;
}

function tileSurfaceY(tables, tile, tx, ty, worldX) {
  const floorOff = getTileFloorOffset(tables, tile);
  const slope = getTileSlope(tables, tile);
  const localX = clamp(worldX - (tx << 4), 0, 15);
  if (slope === 2) return (ty << 4) + (localX >> 1) + floorOff;
  if (slope === -2) return (ty << 4) + ((16 - localX) >> 1) + floorOff;
  return (ty << 4) + floorOff;
}

// Scan level for valid walkable floor tiles when spawn lists are sparse.
function findFallbackSpawns(level, tables) {
  const spawns = [];
  if (!level) return [{ x: 4, y: 6 }];
  for (let tx = 2; tx < level.width - 2; tx += 3) {
    for (let ty = 2; ty < level.height - 2; ty++) {
      const tileHere = getTileAt(level, tx, ty);
      const tileAbove = getTileAt(level, tx, ty - 1);
      if (hasTileFloor(tables, tileHere) && !hasTileFloor(tables, tileAbove)) {
        spawns.push({ x: tx, y: ty });
        break;
      }
    }
  }
  return spawns.length ? spawns : [{ x: Math.max(2, level.width >> 1), y: Math.max(2, level.height >> 1) }];
}

// Extract spawn points & CTF bases from decoded `ll` level (e.java:3820-3925).
// Note: In `ll`, `-2` spawns and `-5/-7` base are on the LEFT side (Team 0),
// while `-3` spawns and `-4/-6` base are on the RIGHT side (Team 1).
function extractLevelPoints(level, tables) {
  const team0 = [];
  const team1 = [];
  const dm = [];
  const fallback = findFallbackSpawns(level, tables);

  for (const [xRaw, yRaw, marker] of level.teamSpawnAndPlatformRecords || []) {
    const x = xRaw & 0xff;
    const y = (yRaw & 0xff) + 1;
    if (x <= 0 || x >= level.width - 1 || y <= 0 || y >= level.height - 1) continue;
    if (marker === -2) team0.push({ x, y });
    else if (marker === -3) team1.push({ x, y });
    else if (marker === -1) dm.push({ x, y });
  }

  const allDm = dm.length ? dm : [...team0, ...team1];
  const dmSpawns = allDm.length ? allDm : fallback;
  const team0Spawns = team0.length ? team0 : dmSpawns.slice(0, Math.max(1, dmSpawns.length >> 1));
  const team1Spawns = team1.length ? team1 : dmSpawns.slice(Math.max(0, dmSpawns.length >> 1));

  // Match each base & initial flag to its team side (`-5/-7` = Team 0, `-4/-6` = Team 1, e.java:3847-3867).
  let baseLeft = null;
  let baseRight = null;
  for (const [xRaw, yRaw, marker] of level.baseAndFlags || []) {
    const px = (xRaw & 0xff) * 16;
    const py = (yRaw & 0xff) * 16;
    if (marker === -5) baseLeft = { x: px, y: py };
    else if (marker === -4) baseRight = { x: px, y: py };
    else if (marker === -7 && !baseLeft) baseLeft = { x: px, y: py };
    else if (marker === -6 && !baseRight) baseRight = { x: px, y: py };
  }
  const avg0X = team0Spawns.reduce((s, p) => s + p.x, 0) / Math.max(1, team0Spawns.length);
  let base0 = baseLeft;
  let base1 = baseRight;
  if (baseLeft && baseRight) {
    const dLeft0 = Math.abs(baseLeft.x / 16 - avg0X);
    const dRight0 = Math.abs(baseRight.x / 16 - avg0X);
    if (dRight0 < dLeft0) {
      base0 = baseRight;
      base1 = baseLeft;
    }
  }
  if (!base0 || (base0.x === 0 && base0.y === 0)) {
    const s0 = team0Spawns[0] || fallback[0];
    base0 = { x: s0.x * 16, y: s0.y * 16 };
  }
  if (!base1 || (base1.x === 0 && base1.y === 0)) {
    const s1 = team1Spawns[team1Spawns.length - 1] || fallback[fallback.length - 1];
    base1 = { x: s1.x * 16, y: s1.y * 16 };
  }

  return { dmSpawns, team0Spawns, team1Spawns, base0, base1 };
}

// Build `cO[x][y]` bot navigation grid from `wpn` table (e.java:3972-4019).
function buildNavGrid(level, tables, levelIndex) {
  const grid = Array.from({ length: level.width }, () => new Uint8Array(level.height));
  const records = tables?.weaponTable?.[levelIndex] || [];
  for (const rec of records) {
    const tx = rec.x & 0xff;
    const ty = rec.y & 0xff;
    if (tx >= 0 && tx < level.width && ty >= 0 && ty < level.height) {
      grid[tx][ty] = rec.weaponId & 0xff;
    }
  }
  return grid;
}

// Extract collectible pickups (`cd` array from `ll` propPlacements, e.java:821-885, 1645-1653).
// Note: `wpn` is the AI pathfinding/navigation grid (`cO`), not pickups.
function extractPickups(level) {
  const pickups = [];
  for (const prop of level.propPlacements || []) {
    if (prop.effectIndex >= 0 && prop.effectIndex <= 12) {
      pickups.push({
        tx: prop.sourceX,
        ty: prop.sourceY,
        x: prop.x,
        y: prop.y,
        type: prop.effectIndex, // 0=medkit, 1=armor, 2..6=ammo, 7=quad, 9..12=weapons
        frameId: prop.frameId,
        respawnTimer: 0,
      });
    }
  }
  return pickups;
}

// Exact pose lookup from e.java:1717:
// n4 = bX[weapon][0] + bX[weapon][7 + (animState << 1)] + animFrame + charOffset
export function poseIndexForActor(actor, tables) {
  const mua = tables?.effects || tables?.mua;
  const ca = tables?.ca;
  if (!mua || !ca || !ca.length) return 0;
  const weapon = clamp(actor.weapon ?? 1, 0, Math.min(5, mua.length - 1));
  const row = mua[weapon] || mua[0];
  const animState = clamp(actor.animation ?? 0, 0, 8);
  const animBase = row[7 + (animState << 1)] ?? 0;
  const animLen = Math.max(1, row[8 + (animState << 1)] ?? 1);
  const frame = clamp(actor.animationFrame ?? 0, 0, animLen - 1);
  const charOffset = actor.charOffset ?? (actor.character === 0 ? 110 : 0);
  const index = (row[0] ?? 0) + animBase + frame + charOffset;
  return clamp(index, 0, ca.length - 1);
}

export function poseForActor(actor, tables) {
  const ca = tables?.ca;
  if (!ca || !ca.length) return [];
  return ca[poseIndexForActor(actor, tables)] || ca[0] || [];
}

function updateHealthBar(actor) {
  const maxHp = Math.max(1, actor.maxHealth);
  actor.healthBarWidth = Math.max(0, Math.round((actor.health * actor.width) / maxHp));
  const missing = actor.width - actor.healthBarWidth;
  if (missing >= (actor.width >> 2) + (actor.width >> 1)) actor.healthBarColor = '#ff0000';
  else if (missing >= actor.width >> 2) actor.healthBarColor = '#ffff00';
  else actor.healthBarColor = '#00ff00';
}

export function spawnEffect(match, x, y, typeIndex, ownerIndex = -1) {
  if (!match || typeIndex < 0 || typeIndex >= EFFECT_FRAMES.length) return;
  if (match.effects.length >= MAX_EFFECTS) match.effects.shift();
  match.effects.push({
    x,
    y,
    type: typeIndex,
    timer: EFFECT_FRAMES[typeIndex].length + 1,
    owner: ownerIndex,
  });
}

// Port of e.java:2556-2624 `h(int n)` — spawn or respawn actor `n`.
export function respawnActor(match, index, tables) {
  const actor = match.actors[index];
  if (!actor) return;

  actor.respawnTimer = 0;
  actor.aiState = 0;
  actor.aiTimer = 15;
  actor.action = -1;
  actor.jumpPending = -1;
  actor.aiRand = 99;
  actor.aiWaypointPending = 0;
  actor.aiNavFlag = 0;
  actor.vx = 0;
  actor.vy = 0;
  actor.inAir = 1;
  actor.fireCooldown = 0;
  actor.quadTimer = 0;
  actor.burnTimer = 0;
  actor.burnSprite = 43;
  actor.burnFrame = 0;
  actor.bloodyTimer = 0;
  actor.shadowY = actor.y;
  actor.shadowEdgeClip = 0;
  actor.shadowClipSide = 0;
  actor.shadowOverPit = false;
  actor.dropIgnoreTy = -1;
  actor.dropCooldown = 0;

  // Reset weapons & ammo (e.java:2562-2588): chainsaw (0) infinite, machinegun (1) 100 ammo.
  actor.ownedWeapons = [1, 1, 0, 0, 0, 0];
  actor.ammo = [1, 100, 0, 0, 0, 0];
  actor.weapon = 1;
  actor.weaponSlot = 1;

  // Pick spawn point from the actor's own team pool (or DM pool), preferring farthest from enemies (e.java:2589-2612)
  let pool = match.spawns.dmSpawns;
  if (match.mode === MODE.TEAM_DEATHMATCH || match.mode === MODE.CAPTURE_FLAG) {
    pool = actor.team === 0 ? match.spawns.team0Spawns : match.spawns.team1Spawns;
  }
  if (!pool.length) pool = match.spawns.dmSpawns;
  actor.spawnCursor = (actor.spawnCursor + 1) % Math.max(1, pool.length);
  let spawn = pool[actor.spawnCursor] || { x: 4, y: 6 };
  if (pool.length > 1 && match.tickCount > 0) {
    let bestScore = -1;
    for (let sIdx = 0; sIdx < pool.length; sIdx++) {
      const cand = pool[(actor.spawnCursor + sIdx) % pool.length];
      let minEnemyDist = Infinity;
      for (let otherIdx = 0; otherIdx < match.actors.length; otherIdx++) {
        const other = match.actors[otherIdx];
        if (otherIdx === index || other.status !== 1 || other.team === actor.team) continue;
        const d = Math.abs(other.x - (cand.x * 16 + 8)) + Math.abs(other.y - cand.y * 16);
        if (d < minEnemyDist) minEnemyDist = d;
      }
      if (minEnemyDist > bestScore) {
        bestScore = minEnemyDist;
        spawn = cand;
      }
    }
  }

  actor.x = spawn.x * 16 + 8;
  // Snap spawn Y cleanly to the nearest floor tile at or just below spawn.y so actors never spawn in mid-air
  let spawnTy = clamp(spawn.y, 1, match.level.height - 2);
  if (tables) {
    for (let dy = 0; dy <= 3 && spawnTy + dy < match.level.height - 1; dy++) {
      if (hasTileFloor(tables, getTileAt(match.level, spawn.x, spawnTy + dy))) {
        spawnTy = spawnTy + dy;
        break;
      }
    }
  }
  const spawnTile = getTileAt(match.level, spawn.x, spawnTy);
  actor.y = tables && hasTileFloor(tables, spawnTile)
    ? tileSurfaceY(tables, spawnTile, spawn.x, spawnTy, actor.x)
    : spawnTy * 16;
  actor.prevX = actor.x;
  actor.prevY = actor.y;
  actor.inAir = tables && hasTileFloor(tables, spawnTile) ? 0 : 1;
  actor.facing = match.mode === MODE.CAPTURE_FLAG && actor.team === 0 ? 1 : (actor.x < match.level.worldWidth / 2 ? 1 : -1);
  actor.health = actor.maxHealth;
  actor.armor = 0;
  actor.status = 1;
  actor.animation = 1;
  actor.animationFrame = 0;
  updateHealthBar(actor);

  if (index === match.playerIndex) {
    match.camera.x = clamp(actor.x - (VIEWPORT_WIDTH >> 1), 0, Math.max(0, match.level.worldWidth - VIEWPORT_WIDTH));
    match.camera.y = clamp(actor.y - (VIEWPORT_HEIGHT - actor.height - 48), 0, Math.max(0, match.level.worldHeight - VIEWPORT_HEIGHT));
    match.camera.prevX = match.camera.x;
    match.camera.prevY = match.camera.y;
    match.interpValid = false;
  }
  spawnEffect(match, actor.x, actor.y + (actor.height >> 1), actor.charOffset > 0 ? 8 : 9, index);
}

// Port of e.java:2626-2718 `d()` + e.java:3855-3898 — create a complete playable match.
export function createSourceMatch(tables, options = {}) {
  const mode = options.mode ?? MODE.DEATHMATCH;
  const levelIndex = clamp(options.levelIndex ?? 0, 0, Math.max(0, (tables.levels?.length ?? 1) - 1));
  const level = tables.levels[levelIndex];
  const character = options.character === 1 ? 1 : 0; // 0 = Soldier, 1 = Mutant
  const settings = {
    ...DEFAULT_SETTINGS,
    ...(options.settings || {}),
  };
  const humanConfigs = Array.isArray(options.humans) ? options.humans : null;
  let actorCount = clamp(settings.I ?? 6, 2, MAX_ACTORS);
  if (humanConfigs && humanConfigs.length > actorCount) {
    actorCount = clamp(humanConfigs.length, 2, MAX_ACTORS);
  }
  const rng = createRng(options.seed ?? ((levelIndex + 1) * 7919 + mode * 313 + character * 17));
  const spawns = extractLevelPoints(level, tables);
  const pickups = extractPickups(level, tables);

  const mua0 = tables.effects?.[0] || [0, 13, 22, 8, 12, 100, 100];
  const actorWidth = Math.max(10, mua0[1] || 13);
  const actorHeight = Math.max(16, mua0[2] || 22);
  const maxSpeed = clamp(mua0[3] || 8, 4, 12);
  const maxHealth = Math.max(50, mua0[5] || 100);
  const maxArmor = Math.max(50, mua0[6] || 100);

  const humanSoldiers = humanConfigs ? humanConfigs.filter((h) => h.character !== 1) : [];
  const humanMutants = humanConfigs ? humanConfigs.filter((h) => h.character === 1) : [];
  const minSoldiers = humanConfigs ? humanSoldiers.length : (character === 0 ? 1 : 0);
  const maxSoldiers = humanConfigs ? (actorCount - humanMutants.length) : (character === 1 ? actorCount - 1 : actorCount);
  const soldiersCount = clamp(
    settings.balance?.[0] ?? (actorCount >> 1),
    Math.min(minSoldiers, maxSoldiers),
    Math.max(minSoldiers, maxSoldiers),
  );

  // Assign human players to Soldier (0..soldiersCount-1) or Mutant (soldiersCount..actorCount-1) slots
  const humanByActor = new Map();
  if (humanConfigs?.length) {
    let sIdx = 0;
    let mIdx = soldiersCount;
    for (const h of humanSoldiers) {
      if (sIdx < soldiersCount) humanByActor.set(sIdx++, h);
    }
    for (const h of humanMutants) {
      if (mIdx < actorCount) humanByActor.set(mIdx++, h);
    }
  }
  const localClientId = options.localClientId || null;
  let playerIndex = character === 0 ? 0 : actorCount - 1;
  if (humanConfigs?.length) {
    const foundIdx = [...humanByActor.entries()].find(([, h]) => !localClientId || h.clientId === localClientId)?.[0];
    if (typeof foundIdx === 'number') playerIndex = foundIdx;
  }

  const actors = Array.from({ length: actorCount }, (_, index) => {
    const isSoldier = index < soldiersCount;
    const team = (mode === MODE.TEAM_DEATHMATCH || mode === MODE.CAPTURE_FLAG)
      ? (isSoldier ? 0 : 1)
      : index;
    const assignedHuman = humanByActor.get(index) || null;
    const isHuman = humanConfigs ? Boolean(assignedHuman) : index === playerIndex;
    const isPlayer = index === playerIndex;
    return {
      id: index,
      isHuman,
      isPlayer,
      clientId: assignedHuman?.clientId || null,
      name: assignedHuman?.name
        ? String(assignedHuman.name).slice(0, 12)
        : (isPlayer ? 'P1' : `${isSoldier ? 'S' : 'M'}${index + 1}`),
      character: isSoldier ? 0 : 1,
      charOffset: isSoldier ? 110 : 0, // e.java:3889-3893
      team,
      x: 64,
      y: 64,
      vx: 0,
      vy: 0,
      facing: 1,
      width: actorWidth,
      height: actorHeight,
      maxSpeed,
      maxHealth,
      maxArmor,
      health: maxHealth,
      armor: 0,
      healthBarWidth: actorWidth,
      healthBarColor: '#00ff00',
      weapon: 1,
      weaponSlot: 1,
      weaponSet: 0,
      ownedWeapons: [1, 1, 0, 0, 0, 0],
      ammo: [1, 100, 0, 0, 0, 0],
      fireCooldown: 0,
      quadTimer: 0,
      burnTimer: 0,
      burnSprite: 43,
      burnFrame: 0,
      bloodyTimer: 0,
      shadowY: 64,
      shadowEdgeClip: 0,
      shadowClipSide: 0,
      shadowOverPit: false,
      dropIgnoreTy: -1,
      dropCooldown: 0,
      inAir: 1,
      status: 1,
      respawnTimer: 0,
      animation: 1,
      animationFrame: 0,
      action: -1,
      jumpPending: -1,
      spawnCursor: index,
      kills: 0,
      deaths: 0,
      score: 0,
      // AI fields (e.java:525-785, 2066-2197)
      aiState: 0,
      aiTimer: 10 + (index * 3),
      aiTargetId: (index + 1) % actorCount,
      aiGoalX: 0,
      aiGoalY: 0,
      aiWaypointPending: 0,
      aiNavFlag: 0,
      aiRand: 0,
      jumpCooldown: 0,
    };
  });

  const baseW = tables?.cu2?.[102]?.[2] ?? 24;
  const baseH = tables?.cu2?.[102]?.[3] ?? 23;
  const poleH = tables?.cu2?.[98]?.[3] ?? 19;
  const makeFlag = (team, base) => {
    const homeX = base.x + (baseW >> 1) - 3;
    const homeY = base.y - poleH + (baseH >> 1) - 3;
    return { team, baseX: base.x, baseY: base.y, homeX, homeY, x: homeX, y: homeY, carrier: -1 };
  };

  const match = {
    mode,
    levelIndex,
    level,
    navGrid: buildNavGrid(level, tables, levelIndex),
    tilesetName: levelIndex % 2 === 0 ? 'l0' : 'l1',
    backgroundName: levelIndex % 2 === 0 ? 'bg0' : 'bg1',
    settings,
    rng,
    spawns,
    pickups,
    actors,
    playerIndex,
    player: actors[playerIndex],
    remoteInputs: Object.create(null),
    isMultiplayer: Boolean(humanConfigs && humanConfigs.length >= 2),
    projectiles: [],
    effects: [],
    teamScore: [0, 0], // TDM kills or CTF flag captures
    flags: [
      makeFlag(0, spawns.base0),
      makeFlag(1, spawns.base1),
    ],
    camera: { x: 0, y: 0, prevX: 0, prevY: 0 },
    lookDown: false,
    interpValid: false,
    soundEvents: [],
    tickCount: 0,
    aiSlot: 0,
    beOsc: 0,
    beDir: 1,
    timeMs: Math.max(1, settings.H ?? 5) * 60 * 1000,
    minutes: Math.max(1, settings.H ?? 5),
    seconds: 0,
    round: 1,
    roundBannerTimer: mode === MODE.LAST_HERO ? 30 : 0,
    lastHeroOrder: 0,
    finished: false,
    finishReason: null,
    winner: null,
    rankings: [],
    hudFlash: [0, 0, 0, 0],
    flagAnimFrame: 0,
  };

  for (let i = 0; i < actors.length; i++) {
    respawnActor(match, i, tables);
  }
  return match;
}

// Port of e.java:314-343 & 1369-1389 — actor controls.
function applyJump(actor) {
  if (actor.inAir === 0 && actor.jumpPending !== 1) {
    actor.action = 1;
    actor.jumpPending = 1;
    actor.animationFrame = -1;
    actor.animation = 4;
  }
}

function applyLeft(actor) {
  actor.facing = -1;
  actor.vx -= ACCEL_X << 1;
  if (actor.vx < -actor.maxSpeed) actor.vx = -actor.maxSpeed;
  if (actor.inAir === 0) actor.action = 0;
}

function applyRight(actor) {
  actor.facing = 1;
  actor.vx += ACCEL_X << 1;
  if (actor.vx > actor.maxSpeed) actor.vx = actor.maxSpeed;
  if (actor.inAir === 0) actor.action = 0;
}

// Drop through upper/catwalk one-way platforms whenever another solid floor exists below.
function applyDrop(actor, level, tables) {
  if (actor.inAir !== 0) return false;
  const tx = clamp(actor.x >> 4, 0, level.width - 1);
  const rawTy = clamp(actor.y >> 4, 0, level.height - 1);
  let standTy = rawTy;
  if (!hasTileFloor(tables, getTileAt(level, tx, standTy))) {
    if (standTy + 1 < level.height && hasTileFloor(tables, getTileAt(level, tx, standTy + 1))) {
      standTy += 1;
    } else {
      return false;
    }
  }
  if (standTy >= level.height - 2) return false;
  let hasSafeFloorBelow = false;
  for (let scanTy = standTy + 1; scanTy < level.height - 1; scanTy++) {
    if (hasTileFloor(tables, getTileAt(level, tx, scanTy))) {
      hasSafeFloorBelow = true;
      break;
    }
  }
  if (!hasSafeFloorBelow) return false;
  actor.dropIgnoreTy = standTy;
  actor.y += 6;
  actor.inAir = 1;
  actor.vy = 4;
  actor.action = 2;
  return true;
}

// Port of e.java `t()` — cycle to next owned weapon with ammo.
export function switchWeapon(actor, direction = 1) {
  for (let step = 1; step <= 6; step++) {
    const candidate = (actor.weapon + direction * step + 6) % 6;
    if (actor.ownedWeapons[candidate] && actor.ammo[candidate] > 0) {
      actor.weapon = candidate;
      actor.weaponSlot = candidate;
      return candidate;
    }
  }
  actor.weapon = 0;
  actor.weaponSlot = 0;
  return 0;
}

export function selectWeapon(actor, slot) {
  if (slot < 0 || slot > 5) return false;
  if (actor.ownedWeapons[slot] && actor.ammo[slot] > 0) {
    actor.weapon = slot;
    actor.weaponSlot = slot;
    return true;
  }
  return false;
}

// Port of e.java:1412-1506 `m()` — fire current weapon.
export function fireWeapon(match, actorIndex, tables) {
  const actor = match.actors[actorIndex];
  if (!actor || actor.status !== 1) return false;
  const weapon = actor.weapon;
  if ((weapon === 0 && actor.inAir === 1) || match.projectiles.length >= MAX_PROJECTILES) return false;
  if (actor.fireCooldown > 0 || actor.ammo[weapon] <= 0) return false;

  actor.fireCooldown = WEAPON_COOLDOWN[weapon] ?? 4;
  if (weapon > 0) actor.ammo[weapon] = Math.max(0, actor.ammo[weapon] - 1);

  const dir = actor.facing >= 0 ? 1 : -1;
  const halfH = actor.height >> 1;
  const spriteId = PROJECTILE_SPRITE_BASE[weapon] || 61;
  const meta = tables?.cu2?.[spriteId] || [0, 0, 8, 6];
  const baseDamage = WEAPON_DAMAGE[weapon] ?? 10;
  const damage = actor.quadTimer > 0 ? baseDamage * 3 : baseDamage;

  // Exact gun-barrel muzzle spawn from ca[n2] last triple (e.java:1428-1440)
  let projX = actor.x + dir * ((actor.width >> 1) + 4);
  let projY = actor.y - halfH - 2;
  if (weapon !== 0 && tables?.effects && tables?.ca) {
    const muaRow = tables.effects[weapon] || tables.effects[0];
    let poseIdx = (muaRow?.[0] ?? 0) + (muaRow?.[11] ?? 0) + (actor.charOffset ?? 0);
    if (actor.inAir === 1) poseIdx += 11;
    const pose = tables.ca[clamp(poseIdx, 0, tables.ca.length - 1)];
    if (pose && pose.length >= 3) {
      projX = actor.x + pose[pose.length - 3] * dir;
      projY = actor.y + pose[pose.length - 2] - (weapon !== 5 ? ((meta[3] >> 1) + 1) : 3);
    }
  }
  let vx = PROJECTILE_SPEED * dir;
  let life = 20;
  let width = Math.max(4, meta[2] || 8);
  let height = Math.max(4, meta[3] || 6);

  if (weapon === 0) {
    // Chainsaw melee hitbox
    projX = actor.x + dir * 10;
    projY = actor.y - halfH;
    life = 2;
    width = 20;
    height = 10;
  } else if (weapon === 3) {
    // Rocket recoil (e.java:1471)
    actor.vx = dir > 0 ? -(MAX_FALL_SPEED >> 1) : (MAX_FALL_SPEED >> 1);
  } else if (weapon === 5) {
    // Railgun / Beam instant horizontal ray (e.java:1482-1489)
    vx = 0;
    life = 2;
    width = VIEWPORT_WIDTH;
    height = 5;
    projX = actor.x + (dir > 0 ? (VIEWPORT_WIDTH >> 1) : -(VIEWPORT_WIDTH >> 1));
  }

  match.projectiles.push({
    x: projX,
    y: projY,
    prevX: projX,
    prevY: projY,
    vx,
    damage,
    owner: actorIndex,
    life,
    width,
    height,
    weapon,
    animToggle: 0,
    facing: dir,
    hitOnce: false,
  });

  if (actor.isPlayer && match.soundEvents) {
    const sfxId = weapon === 0 ? 8 : weapon === 3 ? 1 : weapon === 5 ? 5 : 10;
    match.soundEvents.push(sfxId);
  }

  if (actor.ammo[weapon] === 0 && weapon > 0) {
    switchWeapon(actor, -1);
  }
  return true;
}

// Port of e.java:1143-1185, 1346-1385, 2263-2279 — actor death, Last Hero placement & flag drop.
function handleActorDeath(match, victimIndex, killerIndex, damageSourceWeapon, knockDir, tables = null) {
  const victim = match.actors[victimIndex];
  if (!victim || victim.status === 0) return;

  const knock = damageSourceWeapon === 0 ? 0 : damageSourceWeapon === 5 ? 12 : damageSourceWeapon === 3 ? 16 : 8;
  if (victim.health > GIB_THRESHOLD && knock > 0) {
    victim.action = 4;
    victim.vx = knockDir >= 0 ? knock : -knock;
    victim.facing = knockDir >= 0 ? -1 : 1;
  } else {
    victim.action = 5;
  }
  victim.burnTimer = 0;
  victim.jumpPending = -1;
  victim.health = 0;
  victim.status = 0;
  victim.animation = victim.action === 5 ? 6 : 5;
  victim.animationFrame = 0;
  victim.respawnTimer = RESPAWN_TICKS;
  victim.deaths += 1;
  if (victim.isPlayer && match.soundEvents) match.soundEvents.push(4);
  updateHealthBar(victim);

  // Self-kill penalty (e.java:1365-1367): O[self] -= 2 before +1 (net -1 in standard modes).
  if (killerIndex === victimIndex) {
    victim.kills -= match.mode === MODE.LAST_HERO ? 2 : 1;
    victim.score = victim.kills;
  } else if (killerIndex >= 0 && match.actors[killerIndex]) {
    const killer = match.actors[killerIndex];
    if (match.mode !== MODE.LAST_HERO) {
      killer.kills += 1;
      killer.score += 1;
      if (match.mode === MODE.TEAM_DEATHMATCH) {
        match.teamScore[killer.team] = (match.teamScore[killer.team] || 0) + 1;
      }
    }
  }

  // Drop carried flag in CTF (e.java:1376-1382)
  for (const flag of match.flags) {
    if (flag.carrier === victimIndex) {
      flag.carrier = -1;
    }
  }

  // Last Hero graduated placement scoring (e.java:2263-2279)
  if (match.mode === MODE.LAST_HERO) {
    if (match.lastHeroOrder < match.actors.length - 1) {
      victim.kills += match.lastHeroOrder;
      victim.score = victim.kills;
      match.lastHeroOrder += 1;
    }
    const alive = match.actors.filter((a) => a.status === 1);
    if (alive.length <= 1) {
      if (alive.length === 1) {
        alive[0].kills += match.lastHeroOrder;
        alive[0].score = alive[0].kills;
      }
      match.lastHeroOrder = 0;
      advanceLastHeroRound(match, tables);
    }
  }
}

function applyDamage(match, victimIndex, killerIndex, rawDamage, weapon, knockDir, tables = null) {
  const victim = match.actors[victimIndex];
  if (!victim || victim.status !== 1 || rawDamage <= 0) return;

  // Fire / plasma burn status overlay on hit (e.java:1098-1117)
  if ((weapon === 3 || weapon === 5) && match.rng(2) === 0) {
    victim.burnTimer = Math.min(200, (victim.burnTimer || 0) + 50);
    victim.burnSprite = 43;
  } else if (weapon === 4 && match.rng(2) === 0) {
    victim.burnTimer = Math.min(100, (victim.burnTimer || 0) + 50);
    victim.burnSprite = 46;
  }
  if (weapon === 0 && killerIndex >= 0 && match.actors[killerIndex]) {
    match.actors[killerIndex].bloodyTimer = 25;
  }

  // Exact armor/HP split from e.java:1130-1136
  victim.armor -= rawDamage >> 2;
  if (victim.armor < 0) {
    victim.health += victim.armor << 2;
    victim.armor = 0;
  } else {
    victim.health -= rawDamage >> 1;
  }
  updateHealthBar(victim);

  if (victim.health <= 0) {
    handleActorDeath(match, victimIndex, killerIndex, weapon, knockDir, tables);
  }
}

// Port of e.java:1315-1385 — splash radius ar = cu2[39][2] + cu2[39][3] (72).
function triggerSplashExplosion(match, x, y, ownerIndex, tables = null) {
  spawnEffect(match, x, y, 3, ownerIndex);
  if (match.soundEvents) match.soundEvents.push(0);
  const radius = (tables?.cu2?.[39]?.[2] ?? 38) + (tables?.cu2?.[39]?.[3] ?? 34);
  for (let i = 0; i < match.actors.length; i++) {
    const target = match.actors[i];
    if (target.status !== 1) continue;
    const dist = Math.abs(target.x - x) + Math.abs(target.y - (target.height >> 1) - y);
    if (dist < radius) {
      const dmg = Math.max(0, SPLASH_DAMAGE - dist);
      const knockDir = target.x - x > 0 ? 1 : -1;
      target.vx = knockDir * MAX_FALL_SPEED;
      applyDamage(match, i, ownerIndex, dmg, 3, knockDir, tables);
    }
  }
}

// Port of e.java:2545-2574 `s()` — advance to next Last Hero round cleanly with tables.
function advanceLastHeroRound(match, tables = null) {
  if (match.round >= (match.settings.G ?? 20)) {
    finishMatch(match, 'rounds');
    return;
  }
  match.round += 1;
  match.lastHeroOrder = 0;
  match.roundBannerTimer = 30;
  match.timeMs = Math.max(1, match.settings.H ?? 5) * 60 * 1000;
  match.projectiles.length = 0;
  match.effects.length = 0;
  for (const pickup of match.pickups) pickup.respawnTimer = 0;
  const spawnCount = Math.max(1, match.spawns.dmSpawns.length);
  const offset = match.rng(spawnCount);
  for (let i = 0; i < match.actors.length; i++) {
    match.actors[i].spawnCursor = (i + offset) % spawnCount;
    respawnActor(match, i, tables);
  }
}

function finishMatch(match, reason) {
  if (match.finished) return;
  match.finished = true;
  match.finishReason = reason;

  const sorted = [...match.actors].sort((a, b) => {
    if (match.mode === MODE.SURVIVAL) {
      return a.deaths - b.deaths || b.kills - a.kills;
    }
    return b.kills - a.kills || a.deaths - b.deaths;
  });
  match.rankings = sorted.map((a, idx) => ({
    rank: idx + 1,
    id: a.id,
    name: a.name,
    isPlayer: a.isPlayer,
    team: a.team,
    character: a.character,
    kills: a.kills,
    deaths: a.deaths,
  }));

  if (match.mode === MODE.TEAM_DEATHMATCH || match.mode === MODE.CAPTURE_FLAG) {
    const playerTeam = match.player.team;
    const enemyTeam = playerTeam === 0 ? 1 : 0;
    if (match.teamScore[playerTeam] > match.teamScore[enemyTeam]) match.winner = 'player';
    else if (match.teamScore[playerTeam] < match.teamScore[enemyTeam]) match.winner = 'enemy';
    else match.winner = 'draw';
  } else {
    match.winner = sorted[0]?.isPlayer ? 'player' : 'enemy';
  }
}

// Port of e.java:2066-2197 `a(int[] targetRect)` — find nearest `wpn` jump-pad (5) or drop-ledge (3).
function findNavWaypoint(match, actor, goalX, goalY, goalW, goalH, tables) {
  const nav = match.navGrid;
  const level = match.level;
  if (!nav || !level) {
    actor.aiGoalX = goalX;
    actor.aiNavFlag = 4;
    return;
  }
  if (actor.y - actor.height < goalY && actor.y > goalY - goalH) {
    actor.aiGoalX = goalX;
    actor.aiNavFlag = 4;
    actor.aiWaypointPending = 1;
    return;
  }
  if (actor.aiNavFlag === 4) actor.aiWaypointPending = 0;
  if (actor.aiWaypointPending !== 0 || actor.inAir !== 0) return;

  const needUp = actor.y > goalY;
  actor.aiWaypointPending = 1;
  let lx = clamp(actor.x >> 4, 0, level.width - 1);
  let ly = clamp(actor.y >> 4, 0, level.height - 1);
  let rx = lx;
  let ry = ly;
  let leftPad = -1;
  let rightPad = -1;
  const leftEdge = goalX - (goalW >> 1);
  const rightEdge = goalX + (goalW >> 1);
  const topEdge = goalY - goalH;

  let stopLeft = false;
  let steps = 0;
  while (!stopLeft && steps++ < level.width) {
    if ((lx << 4) < rightEdge && (lx << 4) + 16 > leftEdge && (ly << 4) - 16 < goalY && (ly << 4) > topEdge) {
      actor.aiNavFlag = 4;
      actor.aiGoalX = goalX;
      return;
    }
    if (lx > level.width - 2) { lx = -1; break; }
    const slopeRight = getTileSlope(tables, getTileAt(level, lx + 1, clamp(ly, 0, level.height - 1)));
    if (slopeRight === -2 && ly + 1 < level.height) ly += 1;
    else if (slopeRight === 2 && ly > 0) ly -= 1;
    lx -= 1;
    if (lx < 0 || !nav[lx] || nav[lx][ly] === 0) { lx = -1; break; }
    if (nav[lx][ly] === 3) stopLeft = true;
    if (needUp && nav[lx][ly] === 5 && leftPad === -1) leftPad = lx;
  }

  let stopRight = false;
  steps = 0;
  while (!stopRight && steps++ < level.width) {
    if ((rx << 4) < rightEdge && (rx << 4) + 16 > leftEdge && (ry << 4) - 16 < goalY && (ry << 4) > topEdge) {
      actor.aiNavFlag = 4;
      return;
    }
    if (rx < 1) { rx = -1; break; }
    const slopeLeft = getTileSlope(tables, getTileAt(level, rx - 1, clamp(ry, 0, level.height - 1)));
    if (slopeLeft === 2 && ry + 1 < level.height) ry += 1;
    else if (slopeLeft === -2 && ry > 0) ry -= 1;
    rx += 1;
    if (rx > level.width - 1 || !nav[rx] || nav[rx][ry] === 0) { rx = -1; break; }
    if (nav[rx][ry] === 3) { stopRight = true; rx = Math.min(level.width - 1, rx + 1); }
    if (needUp && nav[rx]?.[ry] === 5 && rightPad === -1) rightPad = rx;
  }

  if (needUp) {
    if (leftPad === -1 && rightPad === -1) {
      actor.aiNavFlag = 4;
      actor.aiGoalX = goalX;
      return;
    }
    actor.aiNavFlag = 5;
    if (leftPad >= 0 && rightPad >= 0) {
      const lxPx = leftPad << 4;
      const rxPx = rightPad << 4;
      actor.aiGoalX = Math.abs(goalX - lxPx) <= Math.abs(goalX - rxPx) ? lxPx : rxPx;
    } else {
      actor.aiGoalX = (leftPad >= 0 ? leftPad : rightPad) << 4;
    }
    return;
  }

  actor.aiNavFlag = 3;
  const leftDist = lx > 0 ? Math.abs(goalX - (lx << 4)) + Math.abs(goalY - (ly << 4)) : Infinity;
  const rightDist = rx > 0 ? Math.abs(goalX - (rx << 4)) + Math.abs(goalY - (ry << 4)) : Infinity;
  if (leftDist < rightDist) {
    actor.aiGoalX = lx << 4;
    actor.aiGoalY = ly << 4;
  } else if (rightDist < Infinity) {
    actor.aiGoalX = rx << 4;
    actor.aiGoalY = ry << 4;
  } else {
    actor.aiGoalX = goalX;
  }
}

// Port of e.java:525-785 — Bot AI using cO (wpn) nav grid + cP (wlg) rules.
function stepBotAI(match, actorIndex, tables) {
  const bot = match.actors[actorIndex];
  if (!bot || bot.status !== 1 || bot.isPlayer) return;

  // Select strongest owned weapon with ammo (e.java:663-671)
  for (let w = 5; w >= 0; w--) {
    if (bot.ownedWeapons[w] && bot.ammo[w] > 0) {
      bot.weapon = w;
      bot.weaponSlot = w;
      break;
    }
  }

  if (bot.jumpCooldown > 0) bot.jumpCooldown -= 1;

  // State timer transitions (e.java:528-578)
  bot.aiTimer -= 1;
  if (bot.aiTimer <= 0) {
    bot.aiTimer = 20;
    bot.aiRand = match.rng(100);

    const carryingEnemyFlag = match.mode === MODE.CAPTURE_FLAG
      && match.flags[bot.team === 0 ? 1 : 0]?.carrier === actorIndex;

    if (carryingEnemyFlag) {
      bot.aiState = 3;
      bot.aiTimer = 40;
    } else if (bot.health <= (bot.maxHealth >> 1) && match.pickups.some((p) => p.type === 0 && p.respawnTimer === 0)) {
      bot.aiState = 4; // Seek medkit
      bot.aiTimer = 150;
    } else if (match.mode === MODE.CAPTURE_FLAG && bot.aiRand < 45) {
      bot.aiState = 5; // Go capture enemy flag
      bot.aiTimer = 150;
    } else if (bot.aiState === 2) {
      bot.aiState = 4;
      bot.aiTimer = 150;
    } else {
      let nearest = -1;
      let bestDist = Infinity;
      for (let i = 0; i < match.actors.length; i++) {
        const other = match.actors[i];
        if (i === actorIndex || other.status !== 1 || other.team === bot.team) continue;
        const d = Math.abs(other.x - bot.x) + Math.abs(other.y - bot.y);
        if (d < bestDist) {
          bestDist = d;
          nearest = i;
        }
      }
      if (nearest >= 0) {
        bot.aiTargetId = nearest;
        bot.aiState = 1;
        bot.aiTimer = bot.aiRand > 80 ? 300 : 20;
      } else {
        bot.aiState = 0;
      }
    }
  }

  // Resolve waypoint/goal coordinates via wpn pathfinder (e.java:580-651)
  let rawGoalX = bot.x + bot.facing * 80;
  let rawGoalY = bot.y;
  let targetGrounded = true;
  if (bot.aiState === 1) {
    const target = match.actors[bot.aiTargetId];
    if (target && target.status === 1) {
      rawGoalX = target.x;
      rawGoalY = target.y;
      targetGrounded = target.inAir === 0;
      findNavWaypoint(match, bot, target.x, target.y, target.width, target.height, tables);
    } else {
      bot.aiState = 0;
    }
  } else if (bot.aiState === 3) {
    const home = match.flags[bot.team];
    if (home) {
      rawGoalX = home.baseX;
      rawGoalY = home.baseY;
      findNavWaypoint(match, bot, home.baseX, home.baseY, 16, 16, tables);
    }
  } else if (bot.aiState === 4 || bot.aiState === 2) {
    const med = match.pickups.find((p) => (bot.aiState === 4 ? p.type === 0 : p.type > 1) && p.respawnTimer === 0)
      || match.pickups.find((p) => p.respawnTimer === 0);
    if (med) {
      rawGoalX = med.x;
      rawGoalY = med.y;
      findNavWaypoint(match, bot, med.x, med.y, 16, 16, tables);
    } else {
      bot.aiState = 1;
    }
  } else if (bot.aiState === 5) {
    const enemyFlag = match.flags[bot.team === 0 ? 1 : 0];
    if (enemyFlag) {
      rawGoalX = enemyFlag.x;
      rawGoalY = enemyFlag.y;
      findNavWaypoint(match, bot, enemyFlag.x, enemyFlag.y, 16, 16, tables);
    }
  } else {
    if (bot.x < 40) bot.facing = 1;
    if (bot.x > match.level.worldWidth - 40) bot.facing = -1;
    rawGoalX = bot.facing > 0 ? match.level.worldWidth - 32 : 32;
    bot.aiGoalX = rawGoalX;
    bot.aiWaypointPending = 1;
  }

  // Line-of-sight combat check (e.java:657-714).
  // Keep ranged weapon when airborne so jumping bots never deadlock with chainsaw.
  const attackRange = bot.weapon === 0 ? 22 : VIEWPORT_WIDTH - 60;
  for (let i = 0; i < match.actors.length; i++) {
    const enemy = match.actors[i];
    if (i === actorIndex || enemy.status !== 1 || enemy.team === bot.team) continue;
    const dx = enemy.x - bot.x;
    const absDx = Math.abs(dx);
    const midY = bot.y - (bot.height >> 1);
    if (absDx < attackRange && midY < enemy.y - 4 && midY > enemy.y - enemy.height - 10) {
      bot.facing = dx >= 0 ? 1 : -1;
      if (absDx < bot.width && bot.inAir === 0 && enemy.inAir === 0) {
        bot.weapon = 0;
      }
      fireWeapon(match, actorIndex, tables);
      if (bot.inAir === 0 && bot.jumpCooldown <= 0 && bot.aiState === 1 && match.rng(20) === 1) {
        applyJump(bot);
        bot.jumpCooldown = 14 + match.rng(8);
      }
      break;
    }
  }

  // Movement & wlg (cP[navCode]) steering (e.java:716-785)
  const goalX = bot.aiGoalX || rawGoalX;
  if (bot.x < 32) {
    applyRight(bot);
  } else if (bot.x > match.level.worldWidth - 32) {
    applyLeft(bot);
  } else {
    const actions = [0, 0, 0];
    if (bot.aiState === 1 && Math.abs(rawGoalX - bot.x) < 18 && bot.weapon > 0) {
      if (rawGoalX >= bot.x) actions[0] = 1;
      else actions[1] = 1;
    } else if (goalX - 32 > bot.x || goalX > bot.x + 16) {
      actions[1] = 1;
    } else if (goalX + 32 < bot.x || goalX < bot.x - 16) {
      actions[0] = 1;
    }

    const tx = clamp(bot.x >> 4, 0, match.level.width - 1);
    const ty = clamp(bot.y >> 4, 0, match.level.height - 1);
    const navCode = match.navGrid?.[tx]?.[ty] ?? 0;
    const wlgRow = tables?.equipmentSets?.[navCode];
    let forceMove = false;
    if (wlgRow) {
      const baseOff = bot.inAir === 0 ? 0 : 3;
      for (let col = 0; col < 3; col++) {
        const rule = wlgRow[baseOff + col];
        if (rule === -1) {
          actions[col] = 0;
        } else if (rule === 2) {
          actions[bot.facing > 0 ? 1 : 0] = 1;
          actions[2] = 1;
          forceMove = true;
        } else if (rule === 3) {
          actions[col] = 0;
        } else if (rule === 4 && bot.aiNavFlag === 4) {
          actions[col] = 1;
        } else if (rule === 5 && bot.aiNavFlag === 5) {
          actions[col] = 1;
        }
      }
    }
    if (actions[0] === 0 && actions[1] === 0) {
      actions[bot.facing > 0 ? 1 : 0] = 1;
    }

    const aheadX = clamp(tx + bot.facing, 1, match.level.width - 2);
    const wallAhead = getTileFloorOffset(tables, getTileAt(match.level, aheadX, Math.max(0, ty - 1))) === 2;
    const floorAhead = hasTileFloor(tables, getTileAt(match.level, aheadX, ty))
      || hasTileFloor(tables, getTileAt(match.level, aheadX, Math.min(match.level.height - 1, ty + 1)));
    const wantHigherPlatform = targetGrounded && rawGoalY < bot.y - 28;
    const wantJump = (actions[2] === 1 && (bot.aiWaypointPending === 1 || forceMove))
      || wantHigherPlatform || wallAhead || !floorAhead;
    if (bot.inAir === 0 && bot.jumpCooldown <= 0 && wantJump) {
      applyJump(bot);
      bot.jumpCooldown = 14 + match.rng(10);
    } else if (bot.inAir === 0 && rawGoalY > bot.y + 32 && bot.aiNavFlag === 3 && match.rng(10) === 0) {
      applyDrop(bot, match.level, tables);
    }

    if (actions[0] === 1) applyLeft(bot);
    else if (actions[1] === 1) applyRight(bot);
  }
}

// Shared human input applicator for local player & remote multiplayer peers (e.java:3269-3298).
function applyHumanControls(match, actor, ctrl, level, tables, isLocalPlayer) {
  if (!actor || !ctrl) return false;
  if (!ctrl.drop) actor.dropCooldown = 0;
  else if (actor.dropCooldown > 0) actor.dropCooldown -= 1;

  if (actor.status === 1) {
    if (ctrl.left) applyLeft(actor);
    if (ctrl.right) applyRight(actor);
    if (typeof ctrl.facingOverride === 'number' && !ctrl.left && !ctrl.right) {
      actor.facing = ctrl.facingOverride >= 0 ? 1 : -1;
    }
    if (ctrl.jump) applyJump(actor);
    if (ctrl.drop) {
      if (isLocalPlayer) match.lookDown = true;
      if (actor.inAir === 0 && actor.dropCooldown === 0 && applyDrop(actor, level, tables)) {
        actor.dropCooldown = 5;
      } else if (actor.inAir === 0) {
        actor.action = 3;
      }
    }
    if (ctrl.fire) fireWeapon(match, actor.id, tables);
    if (ctrl.switchWeapon) {
      switchWeapon(actor, 1);
      ctrl.switchWeapon = false;
    }
    if (typeof ctrl.selectWeapon === 'number') {
      selectWeapon(actor, ctrl.selectWeapon);
      ctrl.selectWeapon = null;
    }
  } else if (actor.status === 0 && match.mode === MODE.LAST_HERO && ctrl.fire) {
    for (const a of match.actors) {
      if (a.status === 1) {
        a.kills += match.lastHeroOrder;
        a.score = a.kills;
        match.lastHeroOrder += 1;
      }
    }
    match.lastHeroOrder = 0;
    advanceLastHeroRound(match, tables);
    return true;
  }
  return false;
}

// Port of e.java:348-1367 `i()` — 1 complete 77ms simulation tick (multiplayer-capable).
export function tickSourceMatch(match, input = {}, tables = null, remoteInputs = null) {
  if (!match || match.finished) return match;

  const level = match.level;
  match.tickCount += 1;
  match.flagAnimFrame = (match.flagAnimFrame + 1) % 3; // e.java:1436-1439 cycles 0..2
  if (match.beOsc > 1 || match.beOsc < -1) match.beDir = -match.beDir;
  match.beOsc += match.beDir;
  match.soundEvents.length = 0;

  // Snapshot previous positions for zero-ghosting 60fps synchronized interpolation
  match.camera.prevX = match.camera.x;
  match.camera.prevY = match.camera.y;
  for (const a of match.actors) {
    a.prevX = a.x;
    a.prevY = a.y;
  }
  for (const p of match.projectiles) {
    p.prevX = p.x;
    p.prevY = p.y;
  }
  match.interpValid = true;
  if (match.roundBannerTimer > 0) match.roundBannerTimer -= 1;
  for (let i = 0; i < 4; i++) {
    if (match.hudFlash[i] > 0) match.hudFlash[i] -= 1;
  }

  // Match countdown clock (77ms per tick)
  match.timeMs = Math.max(0, match.timeMs - 77);
  match.minutes = Math.floor(match.timeMs / 60000);
  match.seconds = Math.floor((match.timeMs % 60000) / 1000);

  // Local + remote human player controls
  const player = match.actors[match.playerIndex];
  if (applyHumanControls(match, player, input, level, tables, true)) {
    return match;
  }
  const remMap = remoteInputs || match.remoteInputs;
  if (remMap) {
    for (let idx = 0; idx < match.actors.length; idx++) {
      if (idx === match.playerIndex) continue;
      const actor = match.actors[idx];
      if (!actor.isHuman) continue;
      const rInput = remMap[actor.id] || remMap[actor.clientId];
      if (rInput && applyHumanControls(match, actor, rInput, level, tables, false)) {
        return match;
      }
    }
  }

  // Update each actor (physics, collision, AI, animation, pickups)
  for (let idx = 0; idx < match.actors.length; idx++) {
    const actor = match.actors[idx];

    if (actor.status === 0) {
      if (match.mode !== MODE.LAST_HERO) {
        actor.respawnTimer -= 1;
        if (actor.respawnTimer <= 0) {
          respawnActor(match, idx, tables);
          continue;
        }
      }
    }

    // Vertical physics & swept ground/slope collision (e.java:375-426, cc[6] !== 0 includes -1 ramps!)
    if (actor.inAir === 1) {
      if (actor.vy < MAX_FALL_SPEED) actor.vy += GRAVITY;
      else actor.vy = MAX_FALL_SPEED;

      const prevY = actor.y;
      const nextY = prevY + actor.vy;
      let landed = false;

      if (actor.vy > 0) {
        const tx = clamp(actor.x >> 4, 0, level.width - 1);
        const startTy = clamp(Math.floor(prevY / 16), 0, level.height - 1);
        const endTy = clamp(Math.floor(nextY / 16), 0, level.height - 1);
        for (let ty = startTy; ty <= endTy; ty++) {
          if (ty === actor.dropIgnoreTy) continue;
          const tile = getTileAt(level, tx, ty);
          if (!hasTileFloor(tables, tile)) continue;
          const surfaceY = tileSurfaceY(tables, tile, tx, ty, actor.x);
          if (prevY <= surfaceY + 6 && nextY >= surfaceY - 2) {
            if (actor.status === 1) actor.action = 3;
            actor.y = surfaceY;
            actor.inAir = 0;
            actor.vy = 0;
            actor.dropIgnoreTy = -1;
            landed = true;
            break;
          }
        }
      }
      if (!landed) {
        actor.y = nextY;
        if (actor.dropIgnoreTy >= 0 && Math.floor(nextY / 16) > actor.dropIgnoreTy) {
          actor.dropIgnoreTy = -1;
        }
      }
    } else {
      const tx = clamp(actor.x >> 4, 0, level.width - 1);
      const ty = clamp(actor.y >> 4, 0, level.height - 1);
      const tileHere = getTileAt(level, tx, ty);
      if (hasTileFloor(tables, tileHere)) {
        actor.y = tileSurfaceY(tables, tileHere, tx, ty, actor.x);
      } else if (ty + 1 < level.height && hasTileFloor(tables, getTileAt(level, tx, ty + 1))
        && Math.abs(tileSurfaceY(tables, getTileAt(level, tx, ty + 1), tx, ty + 1, actor.x) - actor.y) <= 12) {
        // Smoothly step down onto adjacent slope/stair tile
        actor.y = tileSurfaceY(tables, getTileAt(level, tx, ty + 1), tx, ty + 1, actor.x);
      } else if (ty > 0 && hasTileFloor(tables, getTileAt(level, tx, ty - 1))
        && Math.abs(tileSurfaceY(tables, getTileAt(level, tx, ty - 1), tx, ty - 1, actor.x) - actor.y) <= 12) {
        // Smoothly step up onto adjacent slope/stair tile
        actor.y = tileSurfaceY(tables, getTileAt(level, tx, ty - 1), tx, ty - 1, actor.x);
      } else {
        actor.inAir = 1;
        actor.vy = 0;
      }
    }

    // Horizontal movement, wall collision & friction (e.java:429-463)
    actor.x += actor.vx;
    const halfW = actor.width >> 1;
    if (actor.vx > 0) {
      const tx = clamp(actor.x >> 4, 0, level.width - 1);
      const ty = clamp(actor.y >> 4, 0, level.height - 1);
      if (actor.x - (tx << 4) + halfW >= 16 && tx + 1 < level.width && ty > 0) {
        const wall = getTileFloorOffset(tables, getTileAt(level, tx + 1, ty - 1));
        if (wall === 2) actor.x = (tx << 4) + 16 - halfW;
      }
      actor.vx = Math.max(0, actor.vx - ACCEL_X);
    } else if (actor.vx < 0) {
      const tx = clamp(actor.x >> 4, 0, level.width - 1);
      const ty = clamp(actor.y >> 4, 0, level.height - 1);
      if (actor.x - (tx << 4) - halfW <= 0 && tx > 0 && ty > 0) {
        const wall = getTileFloorOffset(tables, getTileAt(level, tx - 1, ty - 1));
        if (wall === 2) actor.x = (tx << 4) + halfW;
      }
      actor.vx = Math.min(0, actor.vx + ACCEL_X);
    }

    // World bounds & pit death (e.java:1326-1364): fall off-screen instead of hovering at bottom edge!
    actor.x = clamp(actor.x, 16, Math.max(16, level.worldWidth - 16));
    if ((actor.y >> 4) >= level.height - 1) {
      if (actor.status === 1) {
        handleActorDeath(match, idx, -1, 0, 1, tables);
        actor.inAir = 1;
        actor.vy = 8;
      }
      if (actor.y > level.worldHeight + 48) {
        actor.y = level.worldHeight + 48;
        actor.vy = 0;
      }
    }

    // Bot AI (e.java:525-785) — skip all human slots in singleplayer & multiplayer
    if (!actor.isHuman && actor.status === 1) {
      stepBotAI(match, idx, tables);
    }

    // Compute ground shadow Y & ledge overhang clip cU (e.java:788-803)
    {
      const stx = clamp(actor.x >> 4, 0, level.width - 1);
      let sty = clamp(actor.y >> 4, 0, level.height - 1);
      while (sty < level.height - 1 && !hasTileFloor(tables, getTileAt(level, stx, sty))) {
        sty += 1;
      }
      const sTile = getTileAt(level, stx, sty);
      const hasFloor = hasTileFloor(tables, sTile);
      actor.shadowOverPit = !hasFloor;
      actor.shadowY = hasFloor ? tileSurfaceY(tables, sTile, stx, sty, actor.x) : (level.height - 1) << 4;
      actor.shadowEdgeClip = 0;
      actor.shadowClipSide = 0;
      if (hasFloor) {
        const rightTile = stx + 1 < level.width ? getTileAt(level, stx + 1, sty) : 0;
        const leftTile = stx > 0 ? getTileAt(level, stx - 1, sty) : 0;
        if (!hasTileFloor(tables, rightTile) || getTileSlope(tables, rightTile) !== 0) {
          actor.shadowEdgeClip = actor.x - (stx << 4) + (actor.width >> 1);
          actor.shadowClipSide = 1;
        } else if (!hasTileFloor(tables, leftTile) || getTileSlope(tables, leftTile) !== 0) {
          actor.shadowEdgeClip = -actor.x + (stx << 4) + 16 + (actor.width >> 1);
          actor.shadowClipSide = -1;
        }
      }
    }

    // Pending jump impulse & animation state machine (e.java:731-819)
    if (actor.jumpPending === 1) {
      actor.jumpPending = -1;
      actor.action = 1;
      actor.inAir = 1;
      actor.vy = JUMP_VELOCITY;
      actor.animation = 4;
      actor.animationFrame = 0;
    } else {
      switch (actor.action) {
        case -1: actor.animation = 1; break; // idle
        case 0: actor.animation = 0; actor.action = -1; break; // run
        case 1: actor.animation = 4; actor.animationFrame = 1; break; // jump up
        case 2: actor.animation = 4; actor.animationFrame = 2; break; // fall
        case 3: actor.animation = 4; actor.animationFrame = 3; actor.action = -1; break; // land
        case 4: actor.animation = 5; break; // dying
        case 5: actor.animation = 6; break; // gibbed
        default: break;
      }
      if (actor.fireCooldown === WEAPON_COOLDOWN[actor.weapon]) {
        actor.animation = actor.inAir ? (actor.vy < 0 ? 7 : 8) : 2;
      }
    }

    // Advance animation frame within mua bounds.
    // Death/gib animations (5 & 6) hold frame 0 while sliding/falling, then clamp on final fallen frame (e.java:765-787).
    const muaRow = tables?.effects?.[actor.weapon] || tables?.mua?.[actor.weapon];
    const animLen = Math.max(1, muaRow?.[8 + (actor.animation << 1)] ?? 1);
    if (actor.status === 0 || actor.animation === 5 || actor.animation === 6) {
      if (actor.animation === 5 && (actor.vx !== 0 || actor.inAir !== 0)) {
        actor.animationFrame = 0;
      } else if (actor.animationFrame < animLen - 1) {
        actor.animationFrame += 1;
      } else {
        actor.animationFrame = animLen - 1;
      }
    } else if (actor.animation !== 4) {
      actor.animationFrame = (actor.animationFrame + 1) % animLen;
    }

    // Pickups collection (e.java:821-885)
    if (actor.status === 1) {
      const tx = actor.x >> 4;
      const ty = actor.y >> 4;
      for (const pickup of match.pickups) {
        if (pickup.respawnTimer > 0) continue;
        if (Math.abs(pickup.tx - tx) <= 1 && Math.abs(pickup.ty - ty) <= 1) {
          pickup.respawnTimer = 80;
          if (actor.isPlayer && match.soundEvents) match.soundEvents.push(6);
          const pType = pickup.type;
          if (pType > 1 && pType < 7) {
            const wSlot = pType - 1;
            actor.ammo[wSlot] = Math.min(100, (actor.ammo[wSlot] || 0) + 30);
          } else if (pType > 8) {
            const wSlot = clamp(pType - 7, 2, 5);
            pickup.respawnTimer = WEAPON_PICKUP_RESPAWN[wSlot] || 130;
            actor.ownedWeapons[wSlot] = 1;
            actor.ammo[wSlot] = Math.min(100, (actor.ammo[wSlot] || 0) + 30);
            if (actor.weapon < wSlot) {
              actor.weapon = wSlot;
              actor.weaponSlot = wSlot;
            }
          } else if (pType === 0) {
            actor.health = Math.min(actor.maxHealth, actor.health + 30);
            updateHealthBar(actor);
            if (actor.isPlayer) match.hudFlash[2] = 10;
          } else if (pType === 1) {
            actor.armor = Math.min(actor.maxArmor, actor.armor + 30);
            if (actor.isPlayer) match.hudFlash[3] = 10;
          } else if (pType === 7) {
            actor.quadTimer = 200;
            pickup.respawnTimer = 200;
          }
        }
      }
    }

    if (actor.fireCooldown > 0) actor.fireCooldown -= 1;
    if (actor.quadTimer > 0) actor.quadTimer -= 1;
    if (actor.bloodyTimer > 0) actor.bloodyTimer -= 1;
    if (actor.burnTimer > 0) {
      actor.burnTimer -= 1;
      actor.burnFrame = ((actor.burnFrame || 0) + 1) % 3;
    }

    // Mode win checks (e.java:902-907)
    if (match.mode === MODE.DEATHMATCH && actor.kills >= (match.settings.F ?? 15)) {
      finishMatch(match, 'frags');
    } else if (match.mode === MODE.TEAM_DEATHMATCH && match.teamScore[actor.team] >= (match.settings.F ?? 15)) {
      finishMatch(match, 'team-frags');
    } else if (match.mode === MODE.SURVIVAL && actor.deaths >= (match.settings.D ?? 20)) {
      finishMatch(match, 'deaths');
    }
  }

  // Update projectiles (e.java:950-1104)
  for (let i = match.projectiles.length - 1; i >= 0; i--) {
    const proj = match.projectiles[i];
    proj.life -= 1;
    if (proj.life <= 0) {
      match.projectiles.splice(i, 1);
      continue;
    }
    if (proj.weapon === 4) proj.animToggle = proj.animToggle ? 0 : 1;
    if (proj.weapon === 3) spawnEffect(match, proj.x - proj.vx, proj.y + match.beOsc, 7, proj.owner);
    proj.x += proj.vx;

    // Wall hit check for non-beam projectiles
    if (proj.weapon !== 0 && proj.weapon !== 5) {
      const ptx = clamp(proj.x >> 4, 0, level.width - 1);
      const pty = clamp(proj.y >> 4, 0, level.height - 1);
      if (proj.x <= 8 || proj.x >= level.worldWidth - 8 || getTileFloorOffset(tables, getTileAt(level, ptx, pty)) === 2) {
        if (proj.weapon === 3) triggerSplashExplosion(match, proj.x, proj.y, proj.owner, tables);
        else spawnEffect(match, proj.x, proj.y, 0, proj.owner);
        match.projectiles.splice(i, 1);
        continue;
      }
    }

    // Actor hit check (e.java:1060-1185)
    if (proj.hitOnce) continue;
    const owner = match.actors[proj.owner];
    const left = proj.x - (proj.width >> 1);
    const right = proj.x + (proj.width >> 1);
    const top = proj.y - (proj.height >> 1);
    const bottom = proj.y + (proj.height >> 1);
    let hitIndex = -1;
    let bestHitDist = Infinity;
    for (let a = 0; a < match.actors.length; a++) {
      const target = match.actors[a];
      if (target.status !== 1 || a === proj.owner) continue;
      if (owner && target.team === owner.team) continue;
      const halfW = target.width >> 1;
      if (left < target.x + halfW && right > target.x - halfW && top < target.y && bottom > target.y - target.height) {
        const d = owner ? Math.abs(target.x - owner.x) : a;
        if (d < bestHitDist) {
          bestHitDist = d;
          hitIndex = a;
        }
      }
    }
    if (hitIndex >= 0) {
      const target = match.actors[hitIndex];
      if ((proj.weapon === 3 || proj.weapon === 5) && proj.owner === match.playerIndex && match.soundEvents) {
        match.soundEvents.push(0);
      }
      if (proj.weapon === 3) {
        triggerSplashExplosion(match, target.x, target.y - (target.height >> 1), proj.owner, tables);
      } else {
        const fxX = proj.weapon < 3 ? proj.x : target.x;
        const fxY = proj.weapon < 3 ? proj.y : target.y;
        spawnEffect(match, fxX, fxY, proj.weapon < 3 ? 0 : proj.weapon, proj.owner);
        applyDamage(match, hitIndex, proj.owner, proj.damage, proj.weapon, proj.facing, tables);
      }
      if (proj.weapon !== 5) {
        match.projectiles.splice(i, 1);
      } else {
        // e.java:1122-1128: truncate Railgun beam to struck target and mark hitOnce
        proj.hitOnce = true;
        if (proj.facing > 0) {
          proj.width = Math.max(4, Math.abs((proj.x - (proj.width >> 1)) - target.x));
          proj.x = target.x - (proj.width >> 1);
        } else {
          proj.width = Math.max(4, Math.abs((proj.x + (proj.width >> 1)) - target.x));
          proj.x = target.x + (proj.width >> 1);
        }
      }
    }
  }

  // Update pickup respawn timers (e.java:1209-1212)
  for (const pickup of match.pickups) {
    if (pickup.respawnTimer > 0) pickup.respawnTimer -= 1;
  }

  // CTF flag logic (e.java:1214-1301)
  if (match.mode === MODE.CAPTURE_FLAG) {
    const poleHalfH = (tables?.cu2?.[98]?.[3] ?? 19) >> 1;
    const poleH = tables?.cu2?.[98]?.[3] ?? 19;
    const playerTeam = match.player?.team ?? 0;
    for (let f = 0; f < 2; f++) {
      const flag = match.flags[f];
      const otherFlag = match.flags[1 - f];
      if (flag.carrier >= 0) {
        const carrier = match.actors[flag.carrier];
        if (!carrier || carrier.status !== 1) {
          flag.carrier = -1;
        } else {
          flag.x = carrier.x;
          flag.y = carrier.y - carrier.height - poleHalfH;
        }
      } else {
        // Check actors touching flag
        for (let a = 0; a < match.actors.length; a++) {
          const actor = match.actors[a];
          if (actor.status !== 1) continue;
          if (Math.abs(actor.x - flag.x) < 18 && Math.abs(actor.y - flag.y) < 28) {
            if (actor.team === flag.team) {
              const atBase = Math.abs(flag.x - flag.homeX) <= 6 && Math.abs(flag.y - flag.homeY) <= 6;
              if (!atBase) {
                flag.x = flag.homeX;
                flag.y = flag.homeY;
              } else if (otherFlag.carrier === a) {
                match.teamScore[actor.team] += 1;
                match.hudFlash[actor.team] = 10;
                otherFlag.carrier = -1;
                otherFlag.x = otherFlag.homeX;
                otherFlag.y = otherFlag.homeY;
                actor.aiState = 0;
                if (match.teamScore[actor.team] >= (match.settings.E ?? 10)) {
                  finishMatch(match, 'flags');
                }
              }
            } else if (flag.carrier === -1) {
              // Steal enemy flag! (e.java:1244-1285)
              flag.carrier = a;
              actor.aiState = 3;
              if (match.soundEvents) {
                match.soundEvents.push(actor.team === playerTeam ? 3 : 2);
              }
            }
          }
        }
        if (flag.carrier === -1) {
          if (((flag.y + poleH) >> 4) > level.height - 3) {
            flag.x = flag.homeX;
            flag.y = flag.homeY;
          } else {
            const ftx = clamp(flag.x >> 4, 0, level.width - 1);
            const fty = clamp((flag.y + poleH) >> 4, 0, level.height - 1);
            if (!hasTileFloor(tables, getTileAt(level, ftx, fty))) {
              flag.y += 2;
            }
          }
        }
      }
    }
  }

  // Update visual effects (e.java:1303-1315)
  for (let i = match.effects.length - 1; i >= 0; i--) {
    match.effects[i].timer -= 1;
    if (match.effects[i].timer <= 0) match.effects.splice(i, 1);
  }

  // Match timer expiry (e.java:910-916)
  if (match.timeMs <= 0 && !match.finished) {
    if (match.mode === MODE.LAST_HERO) advanceLastHeroRound(match, tables);
    else finishMatch(match, 'time');
  }

  // Smooth look-ahead & look-down camera tracking (e.java:1395-1431)
  updateCameraForActor(match, player);

  return match;
}

export function updateCameraForActor(match, actor) {
  if (!match || !actor || !match.level) return;
  const level = match.level;
  const lookAhead = 60; // av = 60
  const step = MAX_FALL_SPEED; // bR = 16
  const targetX = actor.facing === 1
    ? actor.x - lookAhead
    : actor.x - VIEWPORT_WIDTH + lookAhead;
  if (actor.facing === 1) {
    match.camera.x = match.camera.x + step < targetX ? match.camera.x + step : targetX;
  } else {
    match.camera.x = match.camera.x - step > targetX ? match.camera.x - step : targetX;
  }

  if (match.lookDown) {
    if (match.camera.y + step < actor.y - actor.height) {
      match.camera.y += step;
    }
  } else {
    const targetY = actor.y - (VIEWPORT_HEIGHT - actor.height);
    if (match.camera.y - step > targetY) {
      match.camera.y -= step;
    } else {
      match.camera.y = targetY;
    }
  }
  match.lookDown = false;
  match.camera.x = clamp(match.camera.x, 0, Math.max(0, level.worldWidth - VIEWPORT_WIDTH));
  match.camera.y = clamp(match.camera.y, 0, Math.max(0, level.worldHeight - VIEWPORT_HEIGHT));
}

// Compact authoritative world snapshot for Host -> Guest synchronization.
export function packMatchSnapshot(match) {
  if (!match) return null;
  return {
    t: match.tickCount,
    tm: match.timeMs,
    m: match.minutes,
    s: match.seconds,
    r: match.round,
    rb: match.roundBannerTimer,
    fa: match.flagAnimFrame,
    bo: match.beOsc,
    ts: [...match.teamScore],
    hf: [...match.hudFlash],
    fin: match.finished ? 1 : 0,
    fr: match.finishReason || null,
    win: match.winner || null,
    rk: match.finished ? match.rankings : null,
    ac: match.actors.map((a) => [
      a.id,
      Math.round(a.x),
      Math.round(a.y),
      a.vx,
      a.vy,
      a.facing,
      a.health,
      a.armor,
      a.weapon,
      a.ammo[a.weapon] ?? 0,
      a.status,
      a.animation,
      a.animationFrame,
      a.kills,
      a.deaths,
      a.inAir,
      a.quadTimer,
      a.burnTimer,
      a.burnSprite,
      a.burnFrame,
      a.bloodyTimer,
      Math.round(a.shadowY),
      a.shadowEdgeClip,
      a.shadowClipSide,
      a.shadowOverPit ? 1 : 0,
      a.character,
      a.team,
      a.isHuman ? 1 : 0,
      a.name,
      a.ownedWeapons.join(''),
    ]),
    pr: match.projectiles.map((p) => [
      Math.round(p.x),
      Math.round(p.y),
      p.vx,
      p.width,
      p.height,
      p.weapon,
      p.animToggle ? 1 : 0,
      p.facing,
    ]),
    fx: match.effects.map((f) => [Math.round(f.x), Math.round(f.y), f.type, f.timer]),
    pk: match.pickups.map((p) => (p.respawnTimer > 0 ? p.respawnTimer : 0)),
    fl: match.flags.map((fl) => [Math.round(fl.x), Math.round(fl.y), fl.carrier]),
  };
}

// Apply Host authoritative snapshot on Guest client with crisp prevX/prevY 60fps lerp.
export function applyMatchSnapshot(match, snap, lookDown = false) {
  if (!match || !snap) return;
  match.camera.prevX = match.camera.x;
  match.camera.prevY = match.camera.y;

  const prevActorProjCount = match.projectiles.length;
  match.tickCount = snap.t ?? match.tickCount;
  match.timeMs = snap.tm ?? match.timeMs;
  match.minutes = snap.m ?? match.minutes;
  match.seconds = snap.s ?? match.seconds;
  match.round = snap.r ?? match.round;
  match.roundBannerTimer = snap.rb ?? 0;
  match.flagAnimFrame = snap.fa ?? 0;
  match.beOsc = snap.bo ?? 0;
  if (Array.isArray(snap.ts)) match.teamScore = [snap.ts[0] ?? 0, snap.ts[1] ?? 0];
  if (Array.isArray(snap.hf)) match.hudFlash = [...snap.hf];
  match.finished = Boolean(snap.fin);
  match.finishReason = snap.fr ?? null;
  match.winner = snap.win ?? null;
  if (Array.isArray(snap.rk)) {
    match.rankings = snap.rk.map((row) => ({ ...row, isPlayer: row.id === match.playerIndex }));
  }

  const sfx = [];
  for (const row of snap.ac || []) {
    const [
      id, x, y, vx, vy, facing, health, armor, weapon, ammoVal, status, anim, animFrame,
      kills, deaths, inAir, quadTimer, burnTimer, burnSprite, burnFrame, bloodyTimer,
      shadowY, shadowEdgeClip, shadowClipSide, shadowOverPit, character, team, isHuman, name, ownedStr,
    ] = row;
    const actor = match.actors[id];
    if (!actor) continue;
    const isMe = id === match.playerIndex;
    if (isMe) {
      if (actor.status === 1 && status === 0) sfx.push(4);
      if (health > actor.health || armor > actor.armor) sfx.push(6);
      if (weapon === actor.weapon && ammoVal < (actor.ammo[weapon] ?? 0)) {
        sfx.push(weapon === 0 ? 8 : weapon === 3 ? 1 : weapon === 5 ? 5 : 10);
      }
    }
    const teleported = Math.abs(x - actor.x) > 48 || Math.abs(y - actor.y) > 48 || actor.status === 0;
    actor.prevX = teleported ? x : actor.x;
    actor.prevY = teleported ? y : actor.y;
    actor.x = x;
    actor.y = y;
    actor.vx = vx;
    actor.vy = vy;
    actor.facing = facing;
    actor.health = health;
    actor.armor = armor;
    actor.weapon = weapon;
    actor.weaponSlot = weapon;
    actor.ammo[weapon] = ammoVal;
    actor.status = status;
    actor.animation = anim;
    actor.animationFrame = animFrame;
    actor.kills = kills;
    actor.deaths = deaths;
    actor.score = kills;
    actor.inAir = inAir;
    actor.quadTimer = quadTimer;
    actor.burnTimer = burnTimer;
    actor.burnSprite = burnSprite;
    actor.burnFrame = burnFrame;
    actor.bloodyTimer = bloodyTimer;
    actor.shadowY = shadowY;
    actor.shadowEdgeClip = shadowEdgeClip;
    actor.shadowClipSide = shadowClipSide;
    actor.shadowOverPit = Boolean(shadowOverPit);
    actor.character = character;
    actor.charOffset = character === 0 ? 110 : 0;
    actor.team = team;
    actor.isHuman = Boolean(isHuman);
    actor.isPlayer = isMe;
    if (name) actor.name = name;
    if (typeof ownedStr === 'string' && ownedStr.length === 6) {
      actor.ownedWeapons = ownedStr.split('').map((c) => (c === '1' ? 1 : 0));
    }
    updateHealthBar(actor);
  }

  match.projectiles = (snap.pr || []).map(([x, y, vx, width, height, weapon, animToggle, facing]) => ({
    x,
    y,
    prevX: weapon === 5 || weapon === 0 ? x : x - vx,
    prevY: y,
    vx,
    width,
    height,
    weapon,
    animToggle,
    facing,
  }));
  if ((snap.fx?.length || 0) > match.effects.length && snap.fx.some((f) => f[2] === 3)) {
    sfx.push(0);
  } else if (prevActorProjCount > match.projectiles.length && sfx.length === 0 && snap.fx?.length) {
    // quiet visual hit spark
  }
  match.effects = (snap.fx || []).map(([x, y, type, timer]) => ({ x, y, type, timer }));
  if (Array.isArray(snap.pk)) {
    for (let i = 0; i < match.pickups.length && i < snap.pk.length; i++) {
      match.pickups[i].respawnTimer = snap.pk[i] || 0;
    }
  }
  if (Array.isArray(snap.fl)) {
    for (let i = 0; i < 2 && i < snap.fl.length; i++) {
      const [fx, fy, carrier] = snap.fl[i];
      if (match.flags[i].carrier === -1 && carrier >= 0) {
        const myTeam = match.player?.team ?? 0;
        sfx.push(match.actors[carrier]?.team === myTeam ? 3 : 2);
      }
      match.flags[i].x = fx;
      match.flags[i].y = fy;
      match.flags[i].carrier = carrier;
    }
  }
  match.soundEvents = sfx;
  if (match.finished) {
    if (match.mode === MODE.TEAM_DEATHMATCH || match.mode === MODE.CAPTURE_FLAG) {
      const myTeam = match.player?.team ?? 0;
      const enemyTeam = myTeam === 0 ? 1 : 0;
      if (match.teamScore[myTeam] > match.teamScore[enemyTeam]) match.winner = 'player';
      else if (match.teamScore[myTeam] < match.teamScore[enemyTeam]) match.winner = 'enemy';
      else match.winner = 'draw';
    } else if (match.rankings?.length) {
      match.winner = match.rankings[0]?.id === match.playerIndex ? 'player' : 'enemy';
    }
  }
  match.interpValid = true;
  match.lookDown = Boolean(lookDown);
  updateCameraForActor(match, match.player);
}
