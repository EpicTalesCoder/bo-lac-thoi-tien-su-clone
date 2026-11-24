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

  // Match each base to its own team side (`-5/-7` = LEFT Team 0, `-4/-6` = RIGHT Team 1).
  let baseLeft = null;
  let baseRight = null;
  for (const [xRaw, yRaw, marker] of level.baseAndFlags || []) {
    const px = (xRaw & 0xff) * 16;
    const py = ((yRaw & 0xff) + 1) * 16;
    if (marker === -5 || marker === -7) baseLeft = { x: px, y: py };
    else if (marker === -4 || marker === -6) baseRight = { x: px, y: py };
  }
  const avg0X = team0Spawns.reduce((s, p) => s + p.x, 0) / Math.max(1, team0Spawns.length);
  const avg1X = team1Spawns.reduce((s, p) => s + p.x, 0) / Math.max(1, team1Spawns.length);
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
  if (!base0) {
    const s0 = team0Spawns[0] || fallback[0];
    base0 = { x: s0.x * 16, y: s0.y * 16 };
  }
  if (!base1) {
    const s1 = team1Spawns[team1Spawns.length - 1] || fallback[fallback.length - 1];
    base1 = { x: s1.x * 16, y: s1.y * 16 };
  }

  return { dmSpawns, team0Spawns, team1Spawns, base0, base1 };
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
  const actorCount = clamp(settings.I ?? 6, 2, MAX_ACTORS);
  const rng = createRng(options.seed ?? ((levelIndex + 1) * 7919 + mode * 313 + character * 17));
  const spawns = extractLevelPoints(level, tables);
  const pickups = extractPickups(level, tables);

  const mua0 = tables.effects?.[0] || [0, 13, 22, 8, 12, 100, 100];
  const actorWidth = Math.max(10, mua0[1] || 13);
  const actorHeight = Math.max(16, mua0[2] || 22);
  const maxSpeed = clamp(mua0[3] || 8, 4, 12);
  const maxHealth = Math.max(50, mua0[5] || 100);
  const maxArmor = Math.max(50, mua0[6] || 100);

  const soldiersCount = clamp(
    settings.balance?.[0] ?? (actorCount >> 1),
    character === 0 ? 1 : 0,
    character === 1 ? actorCount - 1 : actorCount,
  );
  const playerIndex = character === 0 ? 0 : actorCount - 1;

  const actors = Array.from({ length: actorCount }, (_, index) => {
    const isSoldier = index < soldiersCount;
    const team = (mode === MODE.TEAM_DEATHMATCH || mode === MODE.CAPTURE_FLAG)
      ? (isSoldier ? 0 : 1)
      : index;
    return {
      id: index,
      isPlayer: index === playerIndex,
      name: index === playerIndex
        ? (isSoldier ? 'P1' : 'P1')
        : `${isSoldier ? 'S' : 'M'}${index + 1}`,
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
      // AI fields (e.java:466-709)
      aiState: 0,
      aiTimer: 10 + (index * 3),
      aiTargetId: (index + 1) % actorCount,
      aiGoalX: 0,
      aiGoalY: 0,
      aiRand: 0,
      jumpCooldown: 0,
    };
  });

  const match = {
    mode,
    levelIndex,
    level,
    tilesetName: levelIndex % 2 === 0 ? 'l0' : 'l1',
    backgroundName: levelIndex % 2 === 0 ? 'bg0' : 'bg1',
    settings,
    rng,
    spawns,
    pickups,
    actors,
    playerIndex,
    player: actors[playerIndex],
    projectiles: [],
    effects: [],
    teamScore: [0, 0], // TDM kills or CTF flag captures
    flags: [
      { team: 0, baseX: spawns.base0.x, baseY: spawns.base0.y, x: spawns.base0.x, y: spawns.base0.y - 16, carrier: -1 },
      { team: 1, baseX: spawns.base1.x, baseY: spawns.base1.y, x: spawns.base1.x, y: spawns.base1.y - 16, carrier: -1 },
    ],
    camera: { x: 0, y: 0, prevX: 0, prevY: 0 },
    interpValid: false,
    soundEvents: [],
    tickCount: 0,
    aiSlot: 0,
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

function applyDrop(actor, level, tables) {
  if (actor.inAir !== 0) return;
  const tx = clamp(actor.x >> 4, 0, level.width - 1);
  const ty = clamp(actor.y >> 4, 0, level.height - 1);
  // Allow dropping through one-way platforms (not solid bottom floor)
  if (ty < level.height - 2) {
    const below = getTileAt(level, tx, ty + 1);
    if (getTileFloorOffset(tables, below) === 0) {
      actor.y += 4;
      actor.inAir = 1;
      actor.vy = 2;
      actor.action = 2;
    }
  }
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

function handleActorDeath(match, victimIndex, killerIndex, damageSourceWeapon, knockDir) {
  const victim = match.actors[victimIndex];
  if (!victim || victim.status === 0) return;

  const knock = damageSourceWeapon === 5 ? 12 : 8;
  if (victim.health > GIB_THRESHOLD) {
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

  if (killerIndex >= 0 && killerIndex !== victimIndex && match.actors[killerIndex]) {
    const killer = match.actors[killerIndex];
    if (match.mode !== MODE.LAST_HERO) {
      killer.kills += 1;
      killer.score += 1;
      if (match.mode === MODE.TEAM_DEATHMATCH) {
        match.teamScore[killer.team] = (match.teamScore[killer.team] || 0) + 1;
      }
    }
  }

  // Drop carried flag in CTF (e.java:1088-1093)
  for (const flag of match.flags) {
    if (flag.carrier === victimIndex) {
      flag.carrier = -1;
    }
  }

  // Check Last Hero round end (e.java:1080-1082)
  if (match.mode === MODE.LAST_HERO) {
    const alive = match.actors.filter((a) => a.status === 1);
    if (alive.length <= 1) {
      if (alive.length === 1) {
        alive[0].kills += 1;
        alive[0].score += 1;
      }
      advanceLastHeroRound(match);
    }
  }
}

function applyDamage(match, victimIndex, killerIndex, rawDamage, weapon, knockDir) {
  const victim = match.actors[victimIndex];
  if (!victim || victim.status !== 1 || rawDamage <= 0) return;

  // Fire / plasma burn status overlay on hit (e.java:1000-1019, 1215-1222)
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

  // Exact armor/HP split from e.java:1030-1039
  victim.armor -= rawDamage >> 2;
  if (victim.armor < 0) {
    victim.health += victim.armor << 2;
    victim.armor = 0;
  } else {
    victim.health -= rawDamage >> 1;
  }
  updateHealthBar(victim);

  if (victim.health <= 0) {
    handleActorDeath(match, victimIndex, killerIndex, weapon, knockDir);
  }
}

function triggerSplashExplosion(match, x, y, ownerIndex) {
  spawnEffect(match, x, y, 3, ownerIndex);
  if (match.soundEvents) match.soundEvents.push(0);
  const radius = 48;
  for (let i = 0; i < match.actors.length; i++) {
    const target = match.actors[i];
    if (target.status !== 1) continue;
    const dist = Math.abs(target.x - x) + Math.abs(target.y - (target.height >> 1) - y);
    if (dist < radius) {
      const dmg = Math.max(0, SPLASH_DAMAGE - dist);
      const knockDir = target.x >= x ? 1 : -1;
      target.vx = knockDir * 12;
      applyDamage(match, i, ownerIndex, dmg, 3, knockDir);
    }
  }
}

function advanceLastHeroRound(match) {
  if (match.round >= (match.settings.G ?? 20)) {
    finishMatch(match, 'rounds');
    return;
  }
  match.round += 1;
  match.roundBannerTimer = 30;
  match.timeMs = Math.max(1, match.settings.H ?? 5) * 60 * 1000;
  match.projectiles.length = 0;
  match.effects.length = 0;
  for (const pickup of match.pickups) pickup.respawnTimer = 0;
  for (let i = 0; i < match.actors.length; i++) {
    respawnActor(match, i);
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

// Port of e.java:466-709 — Bot AI (20/150/300-tick state machine).
function stepBotAI(match, actorIndex, tables) {
  const bot = match.actors[actorIndex];
  if (!bot || bot.status !== 1 || bot.isPlayer) return;

  // Select strongest owned weapon with ammo (e.java:598-603)
  for (let w = 5; w >= 0; w--) {
    if (bot.ownedWeapons[w] && bot.ammo[w] > 0) {
      bot.weapon = w;
      bot.weaponSlot = w;
      break;
    }
  }

  if (bot.jumpCooldown > 0) bot.jumpCooldown -= 1;

  // State timer transitions (e.java:467-516)
  bot.aiTimer -= 1;
  if (bot.aiTimer <= 0) {
    bot.aiTimer = 20;
    bot.aiRand = match.rng(100);

    // Check if carrying flag in CTF -> run home (state 5/3)
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
    } else {
      // Find nearest living enemy
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

  // Resolve goal coordinates based on AI state
  let goalX = bot.x + bot.facing * 80;
  let goalY = bot.y;
  let targetGrounded = true;
  if (bot.aiState === 1) {
    const target = match.actors[bot.aiTargetId];
    if (target && target.status === 1) {
      goalX = target.x;
      goalY = target.y;
      targetGrounded = target.inAir === 0;
    } else {
      bot.aiState = 0;
    }
  } else if (bot.aiState === 3) {
    const home = match.flags[bot.team];
    if (home) { goalX = home.baseX; goalY = home.baseY; }
  } else if (bot.aiState === 4) {
    const med = match.pickups.find((p) => p.type === 0 && p.respawnTimer === 0);
    if (med) { goalX = med.x; goalY = med.y; }
    else bot.aiState = 1;
  } else if (bot.aiState === 5) {
    const enemyFlag = match.flags[bot.team === 0 ? 1 : 0];
    if (enemyFlag) { goalX = enemyFlag.x; goalY = enemyFlag.y; }
  } else {
    if (bot.x < 40) bot.facing = 1;
    if (bot.x > match.level.worldWidth - 40) bot.facing = -1;
    goalX = bot.facing > 0 ? match.level.worldWidth - 32 : 32;
  }

  // Line-of-sight combat check (e.java:605-638).
  // Keep ranged weapon when airborne so two jumping bots never deadlock with chainsaw!
  const attackRange = bot.weapon === 0 ? 22 : VIEWPORT_WIDTH - 48;
  for (let i = 0; i < match.actors.length; i++) {
    const enemy = match.actors[i];
    if (i === actorIndex || enemy.status !== 1 || enemy.team === bot.team) continue;
    const dx = enemy.x - bot.x;
    const absDx = Math.abs(dx);
    const dy = Math.abs(enemy.y - bot.y);
    if (absDx < attackRange && dy < bot.height + 14) {
      bot.facing = dx >= 0 ? 1 : -1;
      if (absDx < bot.width && bot.inAir === 0 && enemy.inAir === 0) {
        bot.weapon = 0;
      }
      fireWeapon(match, actorIndex, tables);
      break;
    }
  }

  // Movement & obstacle/pit navigation
  if (bot.x < 32) {
    applyRight(bot);
  } else if (bot.x > match.level.worldWidth - 32) {
    applyLeft(bot);
  } else {
    // If very close horizontally to target, create spacing instead of bouncing on the same tile
    if (bot.aiState === 1 && Math.abs(goalX - bot.x) < 18 && bot.weapon > 0) {
      if (goalX >= bot.x) applyLeft(bot);
      else applyRight(bot);
    } else if (goalX > bot.x + 20) {
      applyRight(bot);
    } else if (goalX < bot.x - 20) {
      applyLeft(bot);
    }

    // Jump only when cooldown elapsed and target is actually on a higher platform (not mid-air!)
    const tx = clamp(bot.x >> 4, 1, match.level.width - 2);
    const ty = clamp(bot.y >> 4, 1, match.level.height - 2);
    const aheadX = clamp(tx + bot.facing, 1, match.level.width - 2);
    const wallAhead = getTileFloorOffset(tables, getTileAt(match.level, aheadX, Math.max(0, ty - 1))) === 2;
    const floorAhead = hasTileFloor(tables, getTileAt(match.level, aheadX, ty))
      || hasTileFloor(tables, getTileAt(match.level, aheadX, Math.min(match.level.height - 1, ty + 1)));
    const wantHigherPlatform = targetGrounded && goalY < bot.y - 28;
    if (bot.inAir === 0 && bot.jumpCooldown <= 0 && (wantHigherPlatform || wallAhead || !floorAhead)) {
      applyJump(bot);
      bot.jumpCooldown = 14 + match.rng(10);
    } else if (bot.inAir === 0 && goalY > bot.y + 32 && match.rng(10) === 0) {
      applyDrop(bot, match.level, tables);
    }
  }
}

// Port of e.java:348-1367 `i()` — 1 complete 77ms simulation tick.
export function tickSourceMatch(match, input = {}, tables = null) {
  if (!match || match.finished) return match;

  const level = match.level;
  match.tickCount += 1;
  match.flagAnimFrame = (match.tickCount >> 1) & 3;
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

  // Player controls (e.java:2958-2981)
  const player = match.actors[match.playerIndex];
  if (player && player.status === 1) {
    if (input.left) applyLeft(player);
    if (input.right) applyRight(player);
    if (input.jump) applyJump(player);
    if (input.drop) applyDrop(player, level, tables);
    if (input.fire) fireWeapon(match, match.playerIndex, tables);
    if (input.switchWeapon) {
      switchWeapon(player, 1);
      input.switchWeapon = false;
    }
    if (typeof input.selectWeapon === 'number') {
      selectWeapon(player, input.selectWeapon);
      input.selectWeapon = null;
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

      if (actor.vy > 0 && actor.status === 1) {
        const tx = clamp(actor.x >> 4, 0, level.width - 1);
        const startTy = clamp(Math.floor(prevY / 16), 0, level.height - 1);
        const endTy = clamp(Math.floor(nextY / 16), 0, level.height - 1);
        for (let ty = startTy; ty <= endTy; ty++) {
          const tile = getTileAt(level, tx, ty);
          if (!hasTileFloor(tables, tile)) continue;
          const surfaceY = tileSurfaceY(tables, tile, tx, ty, actor.x);
          if (prevY <= surfaceY + 6 && nextY >= surfaceY - 2) {
            actor.action = 3;
            actor.y = surfaceY;
            actor.inAir = 0;
            actor.vy = 0;
            landed = true;
            break;
          }
        }
      }
      if (!landed) {
        actor.y = nextY;
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
        handleActorDeath(match, idx, -1, 0, 1);
        actor.inAir = 1;
        actor.vy = 8;
      }
      if (actor.y > level.worldHeight + 48) {
        actor.y = level.worldHeight + 48;
        actor.vy = 0;
      }
    }

    // Bot AI (e.java:466-709)
    if (!actor.isPlayer && actor.status === 1) {
      stepBotAI(match, idx, tables);
    }

    // Compute ground shadow Y directly below actor (e.java:712-716)
    {
      const stx = clamp(actor.x >> 4, 0, level.width - 1);
      let sty = clamp(actor.y >> 4, 0, level.height - 1);
      while (sty < level.height - 1 && !hasTileFloor(tables, getTileAt(level, stx, sty))) {
        sty += 1;
      }
      const sTile = getTileAt(level, stx, sty);
      actor.shadowY = hasTileFloor(tables, sTile) ? tileSurfaceY(tables, sTile, stx, sty, actor.x) : (level.height - 1) << 4;
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
    if (proj.weapon === 3) spawnEffect(match, proj.x - proj.vx, proj.y, 7, proj.owner);
    proj.x += proj.vx;

    // Wall hit check for non-beam projectiles
    if (proj.weapon !== 0 && proj.weapon !== 5) {
      const ptx = clamp(proj.x >> 4, 0, level.width - 1);
      const pty = clamp(proj.y >> 4, 0, level.height - 1);
      if (proj.x <= 8 || proj.x >= level.worldWidth - 8 || getTileFloorOffset(tables, getTileAt(level, ptx, pty)) === 2) {
        if (proj.weapon === 3) triggerSplashExplosion(match, proj.x, proj.y, proj.owner);
        else spawnEffect(match, proj.x, proj.y, 0, proj.owner);
        match.projectiles.splice(i, 1);
        continue;
      }
    }

    // Actor hit check (e.java:977-1100)
    const owner = match.actors[proj.owner];
    const left = proj.x - (proj.width >> 1);
    const right = proj.x + (proj.width >> 1);
    const top = proj.y - (proj.height >> 1);
    const bottom = proj.y + (proj.height >> 1);
    let hitIndex = -1;
    for (let a = 0; a < match.actors.length; a++) {
      const target = match.actors[a];
      if (target.status !== 1 || a === proj.owner) continue;
      if (owner && target.team === owner.team) continue;
      const halfW = target.width >> 1;
      if (left < target.x + halfW && right > target.x - halfW && top < target.y && bottom > target.y - target.height) {
        hitIndex = a;
        break;
      }
    }
    if (hitIndex >= 0) {
      const target = match.actors[hitIndex];
      if (proj.weapon === 3) {
        triggerSplashExplosion(match, target.x, target.y - (target.height >> 1), proj.owner);
      } else {
        spawnEffect(match, target.x, target.y - (target.height >> 1), proj.weapon < 3 ? 0 : proj.weapon, proj.owner);
        applyDamage(match, hitIndex, proj.owner, proj.damage, proj.weapon, proj.facing);
      }
      if (proj.weapon !== 5) {
        match.projectiles.splice(i, 1);
      }
    }
  }

  // Update pickup respawn timers (e.java:1108-1114)
  for (const pickup of match.pickups) {
    if (pickup.respawnTimer > 0) pickup.respawnTimer -= 1;
  }

  // CTF flag logic (e.java:1115-1196)
  if (match.mode === MODE.CAPTURE_FLAG) {
    for (let f = 0; f < 2; f++) {
      const flag = match.flags[f];
      const otherFlag = match.flags[1 - f];
      if (flag.carrier >= 0) {
        const carrier = match.actors[flag.carrier];
        if (!carrier || carrier.status !== 1) {
          flag.carrier = -1;
        } else {
          flag.x = carrier.x;
          flag.y = carrier.y - carrier.height - 8;
        }
      } else {
        // Check actors touching flag
        for (let a = 0; a < match.actors.length; a++) {
          const actor = match.actors[a];
          if (actor.status !== 1) continue;
          if (Math.abs(actor.x - flag.x) < 18 && Math.abs(actor.y - flag.y) < 28) {
            if (actor.team === flag.team) {
              // Own flag: if away from base, return it; if at base and carrying enemy flag, SCORE!
              const atBase = Math.abs(flag.x - flag.baseX) < 16 && Math.abs(flag.y - (flag.baseY - 16)) < 24;
              if (!atBase) {
                flag.x = flag.baseX;
                flag.y = flag.baseY - 16;
              } else if (otherFlag.carrier === a) {
                match.teamScore[actor.team] += 1;
                match.hudFlash[actor.team] = 10;
                otherFlag.carrier = -1;
                otherFlag.x = otherFlag.baseX;
                otherFlag.y = otherFlag.baseY - 16;
                if (match.teamScore[actor.team] >= (match.settings.E ?? 10)) {
                  finishMatch(match, 'flags');
                }
              }
            } else if (flag.carrier === -1) {
              // Steal enemy flag!
              flag.carrier = a;
            }
          }
        }
      }
    }
  }

  // Update visual effects (e.java:1197-1210)
  for (let i = match.effects.length - 1; i >= 0; i--) {
    match.effects[i].timer -= 1;
    if (match.effects[i].timer <= 0) match.effects.splice(i, 1);
  }

  // Match timer expiry (e.java:910-916)
  if (match.timeMs <= 0 && !match.finished) {
    if (match.mode === MODE.LAST_HERO) advanceLastHeroRound(match);
    else finishMatch(match, 'time');
  }

  // Smooth camera tracking on player (e.java:2619-2622)
  if (player) {
    const targetX = clamp(player.x - (VIEWPORT_WIDTH >> 1), 0, Math.max(0, level.worldWidth - VIEWPORT_WIDTH));
    const targetY = clamp(player.y - (VIEWPORT_HEIGHT >> 1) - 16, 0, Math.max(0, level.worldHeight - VIEWPORT_HEIGHT));
    match.camera.x += Math.round((targetX - match.camera.x) * 0.35);
    match.camera.y += Math.round((targetY - match.camera.y) * 0.35);
    match.camera.x = clamp(match.camera.x, 0, Math.max(0, level.worldWidth - VIEWPORT_WIDTH));
    match.camera.y = clamp(match.camera.y, 0, Math.max(0, level.worldHeight - VIEWPORT_HEIGHT));
  }

  return match;
}
