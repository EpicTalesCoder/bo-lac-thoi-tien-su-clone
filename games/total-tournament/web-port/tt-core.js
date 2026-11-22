/**
 * Total Tournament — core mô phỏng thuần (không DOM), port từ logic J2ME gốc.
 * Tick 120ms như MIDP gốc. Mọi hàm pure để chạy test Node.
 */

export const TILE = 16;
export const MAP_W = 36;
export const MAP_H = 40;
export const WORLD_W = MAP_W * TILE;   // 576
export const WORLD_H = MAP_H * TILE;   // 640
export const TICK_MS = 120;

/** 6 loại súng — phím 1-6. */
export const WEAPONS = [
  { id: 'saw', slot: 1, dmg: 34, rate: 400, kind: 'melee', range: 22, ammoMax: Infinity, name: { vi: 'Cưa điện', en: 'Chainsaw' }, color: '#ff6644' },
  { id: 'mg', slot: 2, dmg: 9, rate: 220, kind: 'bullet', speed: 5, spread: 0.10, ammoMax: 200, name: { vi: 'Súng máy', en: 'Machine gun' }, color: '#ffd84d' },
  { id: 'shot', slot: 3, dmg: 8, rate: 700, kind: 'bullet', speed: 4.4, spread: 0.34, pellets: 5, ammoMax: 60, name: { vi: 'Shotgun', en: 'Shotgun' }, color: '#ff9d4d' },
  { id: 'rock', slot: 4, dmg: 55, rate: 1100, kind: 'rocket', speed: 3.4, aoe: 26, ammoMax: 20, name: { vi: 'Bazooka', en: 'Rocket' }, color: '#ff5544' },
  { id: 'plas', slot: 5, dmg: 16, rate: 380, kind: 'bullet', speed: 5.6, spread: 0.03, ammoMax: 90, name: { vi: 'Plasma', en: 'Plasma' }, color: '#55ccff' },
  { id: 'beam', slot: 6, dmg: 13, rate: 150, kind: 'beam', range: 170, ammoMax: 120, name: { vi: 'Beam', en: 'Beam' }, color: '#88ffcc' },
];

export const MODES = [
  { id: 'dm', fragLimit: 10, teams: false, bots: 6, respawn: true },
  { id: 'team', fragLimit: 15, teams: true, bots: 7, respawn: true },
  { id: 'surv', waves: true, teams: false, bots: 0, respawn: false },
  { id: 'ctf', capLimit: 3, teams: true, bots: 7, respawn: true },
  { id: 'last', teams: false, bots: 7, respawn: false },
];

/** RNG seed được (mulberry32) — bản đồ sinh ngẫu nhiên lặp lại được. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const idx = (tx, ty) => ty * MAP_W + tx;
export const isWall = (grid, tx, ty) =>
  tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H || grid[idx(tx, ty)] === 1;
export const isWallAt = (grid, x, y) => isWall(grid, Math.floor(x / TILE), Math.floor(y / TILE));

/** Sinh bản đồ: viền tường + phòng + hành lang nối + khối đốm. */
export function genArena(seed) {
  const rng = mulberry32(seed);
  const grid = new Uint8Array(MAP_W * MAP_H);
  for (let x = 0; x < MAP_W; x++) { grid[idx(x, 0)] = 1; grid[idx(x, MAP_H - 1)] = 1; }
  for (let y = 0; y < MAP_H; y++) { grid[idx(0, y)] = 1; grid[idx(MAP_W - 1, y)] = 1; }
  // khối tường ngẫu nhiên
  for (let i = 0; i < 46; i++) {
    const bw = 1 + Math.floor(rng() * 3), bh = 1 + Math.floor(rng() * 3);
    const bx = 2 + Math.floor(rng() * (MAP_W - 3 - bw));
    const by = 2 + Math.floor(rng() * (MAP_H - 3 - bh));
    for (let y = by; y < by + bh; y++) for (let x = bx; x < bx + bw; x++) grid[idx(x, y)] = 1;
  }
  // phòng mở
  const rooms = [];
  for (let i = 0; i < 7; i++) {
    const rw = 3 + Math.floor(rng() * 4), rh = 3 + Math.floor(rng() * 4);
    const rx = 2 + Math.floor(rng() * (MAP_W - 4 - rw));
    const ry = 2 + Math.floor(rng() * (MAP_H - 4 - rh));
    for (let y = ry; y < ry + rh; y++) for (let x = rx; x < rx + rw; x++) grid[idx(x, y)] = 0;
    rooms.push([rx + (rw >> 1), ry + (rh >> 1)]);
  }
  // hành lang nối giữa các phòng ( carve hình chữ L )
  for (let i = 1; i < rooms.length; i++) {
    const [x0, y0] = rooms[i - 1], [x1, y1] = rooms[i];
    for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) { grid[idx(x, y0)] = 0; grid[idx(x, y0 + 1)] = 0; }
    for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) { grid[idx(x1, y)] = 0; grid[idx(x1 + 1, y)] = 0; }
  }
  return grid;
}

const sign = (v) => (v < 0 ? -1 : 1);

/** Bresenham theo tile — có thể bắn thấu hay không. */
export function hasLineOfSight(grid, x0, y0, x1, y1) {
  let tx0 = Math.floor(x0 / TILE), ty0 = Math.floor(y0 / TILE);
  const tx1 = Math.floor(x1 / TILE), ty1 = Math.floor(y1 / TILE);
  const dx = Math.abs(tx1 - tx0), dy = Math.abs(ty1 - ty0);
  const sx = sign(tx1 - tx0), sy = sign(ty1 - ty0);
  let err = dx - dy, guard = 0;
  while (guard++ < 96) {
    if (isWall(grid, tx0, ty0)) return false;
    if (tx0 === tx1 && ty0 === ty1) return true;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; tx0 += sx; }
    if (e2 < dx) { err += dx; ty0 += sy; }
  }
  return false;
}

const R_SOLDIER = 5;

/** Di chuyển tròn-vs-lưới, tách trục X/Y để trượt dọc tường. */
export function moveWithCollision(grid, x, y, dx, dy) {
  let nx = x + dx;
  if (isWallAt(grid, nx + R_SOLDIER * sign(dx) * (dx !== 0 ? 1 : 0), y) ||
      isWallAt(grid, nx, y + R_SOLDIER) || isWallAt(grid, nx, y - R_SOLDIER)) {
    if (dx !== 0 && (isWallAt(grid, nx + sign(dx) * R_SOLDIER, y) || isWallAt(grid, nx, y + R_SOLDIER) || isWallAt(grid, nx, y - R_SOLDIER))) nx = x;
  }
  let ny = y + dy;
  if (isWallAt(grid, nx + R_SOLDIER, ny) || isWallAt(grid, nx - R_SOLDIER, ny) ||
      isWallAt(grid, nx, ny + R_SOLDIER * (dy !== 0 ? 1 : 0))) {
    if (dy !== 0 && (isWallAt(grid, nx, ny + sign(dy) * R_SOLDIER) || isWallAt(grid, nx + R_SOLDIER, ny) || isWallAt(grid, nx - R_SOLDIER, ny))) ny = y;
  }
  return [nx, ny];
}

export function freeTileNear(grid, x, y) {
  const tx = Math.floor(x / TILE), ty = Math.floor(y / TILE);
  for (let r = 0; r < 6; r++) {
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (!isWall(grid, tx + dx, ty + dy)) return [(tx + dx) * TILE + TILE / 2, (ty + dy) * TILE + TILE / 2];
    }
  }
  return [TILE * 2, TILE * 2];
}

function teamSpawns(grid, teams) {
  const spots = [];
  if (teams) {
    const base = [
      [4, 4], [3, 8], [6, 5], [5, 9],
      [MAP_W - 5, MAP_H - 5], [MAP_W - 4, MAP_H - 9], [MAP_W - 7, MAP_H - 6], [MAP_W - 6, MAP_H - 10],
    ];
    for (const [tx, ty] of base) {
      const [x, y] = freeTileNear(grid, tx * TILE + 8, ty * TILE + 8);
      spots.push([x, y]);
    }
  } else {
    const ring = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const tx = Math.floor(MAP_W / 2 + Math.cos(a) * (MAP_W / 2 - 4));
      const ty = Math.floor(MAP_H / 2 + Math.sin(a) * (MAP_H / 2 - 4));
      ring.push([Math.max(2, Math.min(MAP_W - 3, tx)), Math.max(2, Math.min(MAP_H - 3, ty))]);
    }
    for (const [tx, ty] of ring) {
      const [x, y] = freeTileNear(grid, tx * TILE + 8, ty * TILE + 8);
      spots.push([x, y]);
    }
  }
  return spots;
}

function scatterPickups(grid, rng, n) {
  const list = [];
  const types = ['crate', 'heart', 'shield'];
  let guard = 0;
  while (list.length < n && guard++ < 400) {
    const tx = 2 + Math.floor(rng() * (MAP_W - 4));
    const ty = 2 + Math.floor(rng() * (MAP_H - 4));
    if (isWall(grid, tx, ty)) continue;
    const x = tx * TILE + 8, y = ty * TILE + 8;
    if (list.some((p) => Math.abs(p.x - x) < TILE * 3 && Math.abs(p.y - y) < TILE * 3)) continue;
    list.push({ x, y, type: types[list.length % 3], active: true, respawnT: 0 });
  }
  return list;
}

let soldierSeq = 1;

export function makeSoldier(x, y, team, bot) {
  return {
    id: soldierSeq++, x, y, px: x, py: y, dir: 0, team, bot,
    hp: 100, armor: 0, weapon: 1, cool: 0, fireT: 0, hitT: 0, dead: false, respawnT: 0,
    ammo: WEAPONS.map((w) => (w.id === 'saw' ? Infinity : Math.floor(w.ammoMax * 0.6))),
    kills: 0, deaths: 0, captures: 0,
    ai: bot ? { state: 'wander', t: 0, wx: x, wy: y, strafe: 1, targetId: 0, reactT: 0 } : null,
    carrying: -1, // index cờ đang cầm (ctf)
  };
}

/** Tạo trận theo chế độ. playerTeam: 0 xanh (hoặc id riêng ở DM). */
export function createMatch(modeId, seed = 20261121) {
  const mode = MODES.find((m) => m.id === modeId) || MODES[0];
  const grid = genArena(seed);
  const rng = mulberry32(seed ^ 0x5f3759df);
  const spawns = teamSpawns(grid, mode.teams || mode.id === 'last');
  const soldiers = [];
  // người chơi luôn đầu tiên
  const pSpawn = spawns[0];
  const playerTeam = mode.teams ? 0 : (mode.id === 'surv' ? 0 : -1); // dm/last: mỗi người 1 team riêng (id dương thay sau)
  const player = makeSoldier(pSpawn[0], pSpawn[1], mode.teams ? 0 : 0, false);
  soldiers.push(player);
  const nBots = mode.waves ? 0 : mode.bots;
  for (let i = 0; i < nBots; i++) {
    const sp = spawns[(i + 1) % spawns.length];
    let team;
    if (mode.teams) team = i < Math.ceil(mode.bots / 2) ? 1 : 0; // half đỏ, phần còn lại xanh đồng đội
    else if (mode.id === 'surv') team = 1;
    else team = 100 + i + 1; // dm/last: mỗi bot 1 phe riêng
    if (mode.teams && team === 1) { /* giữ */ }
    const b = makeSoldier(sp[0], sp[1], team, true);
    soldiers.push(b);
  }
  const match = {
    mode, grid, rng, soldiers, player,
    bullets: [], explosions: [], particles: [], floats: [], announces: [],
    pickups: scatterPickups(grid, rng, 9),
    flags: mode.id === 'ctf' ? [
      { team: 0, hx: 4 * TILE + 8, hy: 4 * TILE + 8, x: 4 * TILE + 8, y: 4 * TILE + 8, home: true, carrier: -1, dropT: 0 },
      { team: 1, hx: (MAP_W - 5) * TILE + 8, hy: (MAP_H - 5) * TILE + 8, x: (MAP_W - 5) * TILE + 8, y: (MAP_H - 5) * TILE + 8, home: true, carrier: -1, dropT: 0 },
    ] : null,
    frags: [0, 0], caps: [0, 0], time: 0, over: false, winner: null,
    wave: 0, waveT: 2000, paused: false,
    graceT: 3500, // thời gian đầu trận bot không nả người chơi (ăn entering dễ hơn)
  };
  if (mode.waves) startWave(match);
  return match;
}

function startWave(match) {
  match.wave += 1;
  const n = 2 + match.wave;
  const spawns = teamSpawns(match.grid, false);
  for (let i = 0; i < n; i++) {
    const sp = spawns[i % spawns.length];
    const b = makeSoldier(sp[0] + (i % 2) * 8, sp[1], 1 + match.wave, true); // phe riêng mỗi đợt
    b.hp = 60 + match.wave * 6;
    b.weapon = 1 + ((i + match.wave) % 5);
    match.soldiers.push(b);
  }
  match.announces.push({ text: { vi: `ĐỢT ${match.wave}`, en: `WAVE ${match.wave}` }, t: 2200, life: 2200 });
  match.waveT = 0;
  match.graceT = Math.max(match.graceT, 2500); // đợt mới cho người chơi 2.5s nạp đạn
}

function aliveEnemiesOf(match, s) {
  return match.soldiers.filter((o) => !o.dead && o !== s && o.team !== s.team);
}

function visibleEnemy(match, s, range) {
  let best = null, bd = range * range;
  for (const o of aliveEnemiesOf(match, s)) {
    const dx = o.x - s.x, dy = o.y - s.y, d = dx * dx + dy * dy;
    if (d < bd && hasLineOfSight(match.grid, s.x, s.y, o.x, o.y)) { best = o; bd = d; }
  }
  return best;
}

function pickWeaponForBot(match, bot) {
  const rng = match.rng;
  const r = rng();
  if (r < 0.30) return 1;      // mg
  if (r < 0.50) return 2;      // shotgun
  if (r < 0.65) return 3;      // rocket
  if (r < 0.82) return 4;      // plasma
  if (r < 0.92) return 5;      // beam
  return 0;                    // cưa (charger)
}

function updateBot(match, bot, dt) {
  const ai = bot.ai;
  ai.t -= dt; ai.reactT -= dt;
  const target = visibleEnemy(match, bot, 175);
  if (target) {
    ai.state = 'attack';
    ai.targetId = target.id;
    if (ai.reactT <= 0) {
      const err = (match.rng() - 0.5) * 0.22;
      bot.dir = Math.atan2(target.y - bot.y, target.x - bot.x) + err;
    }
    bot.weapon = pickWeaponForBot(match, bot);
    if (bot.ammo[bot.weapon] <= 0 && bot.weapon !== 0) bot.weapon = 0;
    // strafe quanh mục tiêu
    const dist = Math.hypot(target.x - bot.x, target.y - bot.y);
    const w = WEAPONS[bot.weapon];
    const want = w.kind === 'melee' ? 14 : (w.id === 'shot' ? 60 : 100);
    const away = dist < want * 0.7 ? -1 : (dist > want * 1.3 ? 1 : 0);
    const ang = Math.atan2(target.y - bot.y, target.x - bot.x);
    const mx = Math.cos(ang) * away + Math.cos(ang + Math.PI / 2) * ai.strafe * 0.8;
    const my = Math.sin(ang) * away + Math.sin(ang + Math.PI / 2) * ai.strafe * 0.8;
    const m = Math.hypot(mx, my) || 1;
    const speed = 0.85;
    const [nx, ny] = moveWithCollision(match.grid, bot.x, bot.y, (mx / m) * speed, (my / m) * speed);
    bot.x = nx; bot.y = ny;
    if (ai.t <= 0) { ai.strafe = -ai.strafe; ai.t = 700 + match.rng() * 900; }
    // grace period: giữ khoảng cách nhưng chưa khai hỏa vào người chơi
    const holdFire = target === match.player && match.graceT > 0;
    if (!holdFire) fireWeapon(match, bot);
  } else {
    ai.state = 'wander';
    bot.weapon = pickWeaponForBot(match, bot);
    if (ai.t <= 0 || Math.hypot(ai.wx - bot.x, ai.wy - bot.y) < 12) {
      ai.wx = (2 + match.rng() * (MAP_W - 4)) * TILE;
      ai.wy = (2 + match.rng() * (MAP_H - 4)) * TILE;
      ai.t = 1500 + match.rng() * 1500;
    }
    const ang = Math.atan2(ai.wy - bot.y, ai.wx - bot.x);
    bot.dir = ang;
    const speed = 0.72;
    const [nx, ny] = moveWithCollision(match.grid, bot.x, bot.y, Math.cos(ang) * speed, Math.sin(ang) * speed);
    bot.x = nx; bot.y = ny;
  }
  // nhặt đồ
  for (const p of match.pickups) {
    if (p.active && Math.abs(p.x - bot.x) < 10 && Math.abs(p.y - bot.y) < 10) applyPickup(match, bot, p);
  }
}

export function fireWeapon(match, s) {
  if (s.dead || s.cool > 0) return;
  const w = WEAPONS[s.weapon];
  if (s.ammo[s.weapon] <= 0 && w.id !== 'saw') return;
  s.cool = w.rate * (s.bot ? 1.3 : 1); // bot bắn chậm hơn người 30%
  s.fireT = 260;
  if (w.id !== 'saw') s.ammo[s.weapon] -= 1;
  const dmgScale = s.bot ? 0.75 : 1; // đạn bot yếu hơn 25%
  if (w.kind === 'melee') {
    // cận chiến: quét cung trước mặt
    for (const o of aliveEnemiesOf(match, s)) {
      const dx = o.x - s.x, dy = o.y - s.y;
      const d = Math.hypot(dx, dy);
      if (d < w.range) {
        const ang = Math.atan2(dy, dx);
        let diff = Math.abs(ang - s.dir); if (diff > Math.PI) diff = Math.PI * 2 - diff;
        if (diff < 1.1) { applyDamage(match, s, o, Math.round(w.dmg * dmgScale)); sfx(match, 'hit', o.x, o.y); }
      }
    }
    sfx(match, 'saw', s.x, s.y);
    return;
  }
  if (w.kind === 'beam') {
    // tia tức thời: dựng ray dài range, trúng mục tiêu đầu tiên
    const ex = s.x + Math.cos(s.dir) * w.range, ey = s.y + Math.sin(s.dir) * w.range;
    let hit = null, hd = w.range;
    for (const o of aliveEnemiesOf(match, s)) {
      const t = projPointOnRay(s.x, s.y, s.dir, o.x, o.y);
      if (t !== null && t >= 0 && t < hd && t < w.range) {
        const hx = s.x + Math.cos(s.dir) * t, hy = s.y + Math.sin(s.dir) * t;
        if (Math.hypot(o.x - hx, o.y - hy) < 7 && !isWallAt(match.grid, hx, hy)) { hit = o; hd = t; }
      }
    }
    match.bullets.push({ beam: true, x0: s.x, y0: s.y, x1: hit ? s.x + Math.cos(s.dir) * hd : ex, y1: hit ? s.y + Math.sin(s.dir) * hd : ey, color: w.color, life: 90, owner: s.id });
    if (hit) { applyDamage(match, s, hit, Math.round(w.dmg * dmgScale)); sfx(match, 'hit', hit.x, hit.y); }
    sfx(match, 'beam', s.x, s.y);
    return;
  }
  const n = w.pellets || 1;
  for (let i = 0; i < n; i++) {
    const spread = (match.rng() - 0.5) * 2 * (w.spread || 0);
    const a = s.dir + spread;
    match.bullets.push({
      x: s.x + Math.cos(a) * 6, y: s.y + Math.sin(a) * 6,
      dx: Math.cos(a) * w.speed, dy: Math.sin(a) * w.speed,
      owner: s.id, team: s.team, dmg: Math.max(1, Math.round(w.dmg * dmgScale)), kind: w.kind, aoe: w.aoe || 0,
      color: w.color, life: 260, trail: w.id === 'rock',
    });
  }
  sfx(match, w.id === 'rock' ? 'rocket' : 'shot', s.x, s.y);
}

function projPointOnRay(x0, y0, ang, px, py) {
  const dx = Math.cos(ang), dy = Math.sin(ang);
  const t = (px - x0) * dx + (py - y0) * dy;
  if (t <= 0) return null;
  const cx = x0 + dx * t, cy = y0 + dy * t;
  const off = Math.hypot(px - cx, py - cy);
  return off <= 10 ? t : null;
}

function sfx(match, name, x, y) {
  match.sounds = match.sounds || [];
  if (match.sounds.length < 64) match.sounds.push({ name, x, y });
}

export function applyDamage(match, src, target, dmg) {
  if (target.dead) return;
  let d = dmg;
  if (target.armor > 0) {
    const absorb = Math.min(target.armor, d * 0.5);
    target.armor -= absorb; d -= absorb;
  }
  target.hp -= d;
  target.hitT = 200;
  for (let i = 0; i < 4; i++) {
    match.particles.push({ x: target.x, y: target.y, vx: (match.rng() - 0.5) * 3, vy: (match.rng() - 0.5) * 3, life: 300 + match.rng() * 200, color: '#c22', size: 2 });
  }
  if (target.hp <= 0) killSoldier(match, src, target);
}

function killSoldier(match, src, target) {
  target.dead = true; target.hp = 0; target.deaths += 1;
  if (src && src !== target) src.kills += 1;
  // đội điểm
  if (src && src !== target && src.team !== target.team) {
    if (match.mode.teams) match.frags[src.team === 1 ? 1 : 0] += 1;
    else if (match.mode.id === 'dm') match.frags[0] += src === match.player ? 1 : 0;
  }
  if (target.carrying >= 0) {
    const f = match.flags[target.carrying];
    f.x = target.x; f.y = target.y; f.home = false; f.carrier = -1; f.dropT = 12000;
    target.carrying = -1;
  }
  match.explosions.push({ x: target.x, y: target.y, t: 0, small: true });
  for (let i = 0; i < 10; i++) {
    match.particles.push({ x: target.x, y: target.y, vx: (match.rng() - 0.5) * 4, vy: (match.rng() - 0.5) * 4, life: 400 + match.rng() * 300, color: '#a11', size: 2 });
  }
  if (match.mode.respawn) target.respawnT = 3000;
  else if (target === match.player && (match.mode.id === 'surv' || match.mode.id === 'last')) endMatch(match, 'lose');
  else if (match.mode.id === 'last') checkLastHero(match);
}

function checkLastHero(match) {
  const alive = match.soldiers.filter((s) => !s.dead);
  if (alive.length === 1) endMatch(match, alive[0] === match.player ? 'win' : 'lose');
}

function endMatch(match, winner) {
  match.over = true;
  match.winner = winner;
}

export function applyPickup(match, s, p) {
  if (!p.active) return;
  if (p.type === 'crate') {
    for (let i = 0; i < WEAPONS.length; i++) {
      const w = WEAPONS[i];
      if (w.id !== 'saw' && s.ammo[i] < w.ammoMax) {
        s.ammo[i] = Math.min(w.ammoMax, s.ammo[i] + Math.ceil(w.ammoMax * 0.3));
      }
    }
  } else if (p.type === 'heart') s.hp = Math.min(100, s.hp + 50);
  else if (p.type === 'shield') s.armor = Math.min(100, s.armor + 50);
  p.active = false; p.respawnT = 20000;
  sfx(match, 'pickup', s.x, s.y);
}

function respawnSoldier(match, s) {
  const spawns = teamSpawns(match.grid, match.mode.teams);
  const pool = match.mode.teams
    ? spawns.filter((_, i) => (i < 4 ? 0 : 1) === s.team)
    : spawns;
  const sp = pool[Math.floor(match.rng() * pool.length)] || spawns[0];
  const [x, y] = freeTileNear(match.grid, sp[0], sp[1]);
  s.x = x; s.y = y; s.px = x; s.py = y;
  s.hp = 100; s.armor = 0; s.dead = false; s.respawnT = 0;
  s.ammo = WEAPONS.map((w) => (w.id === 'saw' ? Infinity : Math.floor(w.ammoMax * 0.6)));
}

function stepBullets(match, dt) {
  const sub = 3;
  for (let bi = match.bullets.length - 1; bi >= 0; bi--) {
    const b = match.bullets[bi];
    if (b.beam) { b.life -= dt; if (b.life <= 0) match.bullets.splice(bi, 1); continue; }
    let removed = false;
    for (let s2 = 0; s2 < sub && !removed; s2++) {
      b.x += b.dx * (dt / 120); b.y += b.dy * (dt / 120);
      if (isWallAt(match.grid, b.x, b.y)) {
        if (b.aoe) explode(match, b.x - b.dx, b.y - b.dy, b.dmg, b.aoe, b.owner);
        else for (let i = 0; i < 3; i++) match.particles.push({ x: b.x, y: b.y, vx: (match.rng() - 0.5) * 2, vy: (match.rng() - 0.5) * 2, life: 150, color: '#999', size: 1 });
        match.bullets.splice(bi, 1); removed = true; break;
      }
      for (const o of match.soldiers) {
        if (o.dead || o.id === b.owner) continue;
        const owner = match.soldiers.find((z) => z.id === b.owner);
        if (owner && o.team === owner.team) continue;
        if (Math.abs(o.x - b.x) < 7 && Math.abs(o.y - b.y) < 7) {
          if (b.aoe) explode(match, b.x, b.y, b.dmg, b.aoe, b.owner);
          else { applyDamage(match, owner, o, b.dmg); sfx(match, 'hit', o.x, o.y); }
          match.bullets.splice(bi, 1); removed = true; break;
        }
      }
    }
    if (!removed) { b.life -= dt; if (b.life <= 0) match.bullets.splice(bi, 1); }
  }
}

function explode(match, x, y, dmg, aoe, owner) {
  match.explosions.push({ x, y, t: 0, small: false });
  sfx(match, 'boom', x, y);
  const src = match.soldiers.find((s) => s.id === owner);
  for (const o of match.soldiers) {
    if (o.dead) continue;
    const d = Math.hypot(o.x - x, o.y - y);
    if (d < aoe) {
      const falloff = 1 - d / aoe;
      if (src && o.team !== src.team) applyDamage(match, src, o, Math.round(dmg * falloff));
    }
  }
  for (let i = 0; i < 14; i++) {
    match.particles.push({ x, y, vx: (match.rng() - 0.5) * 5, vy: (match.rng() - 0.5) * 5, life: 350 + match.rng() * 350, color: match.rng() < 0.5 ? '#f80' : '#fc4', size: 2 });
  }
}

function stepFlags(match, dt) {
  if (!match.flags) return;
  for (const f of match.flags) {
    if (f.carrier >= 0) {
      const c = match.soldiers.find((s) => s.id === f.carrier);
      if (!c || c.dead) { f.carrier = -1; f.home = false; f.x = c ? c.x : f.x; f.y = c ? c.y : f.y; f.dropT = 12000; continue; }
      f.x = c.x; f.y = c.y;
      // mang cờ địch về cờ nhà (đang ở nhà) để tính điểm
      const carrierTeam = 1 - f.team;          // đội của người đang cầm cờ
      const own = match.flags[carrierTeam];    // cờ của đội người mang
      if (own.home && Math.hypot(c.x - own.hx, c.y - own.hy) < 16) {
        match.caps[carrierTeam] += 1;
        if (c === match.player) c.captures += 1;
        f.x = f.hx; f.y = f.hy; f.home = true; f.carrier = -1;
        c.carrying = -1;
        match.announces.push({ text: { vi: 'CỜ VỀ ĐÍCH!', en: 'FLAG CAPTURED!' }, t: 2000, life: 2000 });
        sfx(match, 'flag', c.x, c.y);
        if (match.caps[carrierTeam] >= match.mode.capLimit) endMatch(match, carrierTeam === 0 ? 'win' : 'lose');
      }
    } else if (!f.home) {
      f.dropT -= dt;
      if (f.dropT <= 0) { f.x = f.hx; f.y = f.hy; f.home = true; }
      // ai đó chạm cờ rơi
      for (const s of match.soldiers) {
        if (s.dead) continue;
        if (Math.hypot(s.x - f.x, s.y - f.y) < 10) {
          if (s.team !== f.team) { f.carrier = s.id; s.carrying = match.flags.indexOf(f); break; }
          else if (!f.home) { f.x = f.hx; f.y = f.hy; f.home = true; break; } // đồng đội chạm trả về
        }
      }
    } else {
      // cờ ở nhà: địch tới cướp
      for (const s of match.soldiers) {
        if (s.dead || s.team === f.team) continue;
        if (Math.hypot(s.x - f.x, s.y - f.y) < 10) { f.home = false; f.carrier = s.id; s.carrying = match.flags.indexOf(f); sfx(match, 'flag', s.x, s.y); break; }
      }
    }
  }
}

/** Một tick mô phỏng 120ms. input: {mx,my (tọa độ world), fire, keys:{up,down,left,right}} */
export function stepMatch(match, input, dt = TICK_MS) {
  if (match.over || match.paused) return;
  match.time += dt;
  const grid = match.grid;
  const player = match.player;
  if (match.graceT > 0) match.graceT -= dt;

  for (const s of match.soldiers) {
    s.px = s.x; s.py = s.y;
    if (s.cool > 0) s.cool -= dt;
    if (s.fireT > 0) s.fireT -= dt;
    if (s.hitT > 0) s.hitT -= dt;
    if (s.dead) {
      if (s.respawnT > 0) { s.respawnT -= dt; if (s.respawnT <= 0 && match.mode.respawn) respawnSoldier(match, s); }
      continue;
    }
    if (s.bot) { updateBot(match, s, dt); continue; }
    // người chơi
    let dx = (input.keys.right ? 1 : 0) - (input.keys.left ? 1 : 0);
    let dy = (input.keys.down ? 1 : 0) - (input.keys.up ? 1 : 0);
    if (dx || dy) {
      const m = Math.hypot(dx, dy);
      const speed = 1.1;
      const [nx, ny] = moveWithCollision(grid, s.x, s.y, (dx / m) * speed, (dy / m) * speed);
      s.x = nx; s.y = ny;
    }
    if (typeof input.mx === 'number') s.dir = Math.atan2(input.my - s.y, input.mx - s.x);
    if (input.fire) fireWeapon(match, s);
    for (const p of match.pickups) {
      if (p.active && Math.abs(p.x - s.x) < 10 && Math.abs(p.y - s.y) < 10) applyPickup(match, s, p);
    }
  }

  stepBullets(match, dt);
  stepFlags(match, dt);

  for (const e of match.explosions) e.t += dt;
  for (let i = match.explosions.length - 1; i >= 0; i--) if (match.explosions[i].t > 500) match.explosions.splice(i, 1);
  for (const p of match.particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life -= dt; }
  for (let i = match.particles.length - 1; i >= 0; i--) if (match.particles[i].life <= 0) match.particles.splice(i, 1);
  for (const a of match.announces) a.t -= dt;
  for (let i = match.announces.length - 1; i >= 0; i--) if (match.announces[i].t <= 0) match.announces.splice(i, 1);
  for (const p of match.pickups) { if (!p.active) { p.respawnT -= dt; if (p.respawnT <= 0) p.active = true; } }

  if (match.mode.waves) {
    const enemies = match.soldiers.filter((s) => s.bot && !s.dead).length;
    if (enemies === 0) startWave(match);
  }
  if (match.mode.id === 'dm' && match.frags[0] >= match.mode.fragLimit) endMatch(match, 'win');
  if (match.mode.id === 'ctf' && (match.caps[0] >= match.mode.capLimit || match.caps[1] >= match.mode.capLimit)) {
    endMatch(match, match.caps[0] >= match.mode.capLimit ? 'win' : 'lose');
  }
  if (match.mode.teams && (match.frags[0] >= match.mode.fragLimit || match.frags[1] >= match.mode.fragLimit)) {
    endMatch(match, match.frags[0] >= match.mode.fragLimit ? 'win' : 'lose');
  }
  if (match.mode.id === 'last') checkLastHero(match);
}

/** Kết quả trận — dùng ở màn hình kết quả + lưu kỷ lục. */
export function matchResult(match) {
  const p = match.player;
  const res = {
    over: match.over, winner: match.winner,
    kills: p.kills, deaths: p.deaths, captures: p.captures,
    wave: match.wave, frags: [...match.frags], caps: [...match.caps], time: match.time,
  };
  if (match.mode.waves) res.score = match.wave * 100 + p.kills * 10;
  else res.score = p.kills * 100 - p.deaths * 20;
  return res;
}
