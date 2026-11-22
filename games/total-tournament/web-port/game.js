/**
 * Total Tournament — web port (Phaser 3 pipeline, canvas 2D render vào framebuffer).
 * Kiến trúc giống game 1 của repo: sim tick 120ms (MIDP) + render mỗi rAF.
 */
import { mountPhaserRuntime } from './phaser-engine.js';
import { LANG, loadSave, saveSave, getLang } from './storage-i18n.js';
import {
  WEAPONS, MODES, TILE, MAP_W, MAP_H, WORLD_W, WORLD_H, TICK_MS,
  createMatch, stepMatch, matchResult,
} from './tt-core.js';

/* ---------- asset loading ---------- */
const ASSETS = ['u2','u3','u5','u0','u6','u1','s0','s1','u7','u8','u4','erou','curs','ld','fnt','f1','f2','l0','l1','li1','li2','lz','or','bg0','bg1'];
const IMG = {};
const canvasEl = typeof document !== 'undefined' ? document.getElementById('game') : null;

function loadImage(name) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve([name, img]);
    img.onerror = () => resolve([name, null]);
    img.src = `assets/${name}.png`;
  });
}

async function loadAll() {
  const pairs = await Promise.all(ASSETS.map(loadImage));
  for (const [n, img] of pairs) IMG[n] = img;
}

/* ---------- sprite kit (crop + team tint) ---------- */
function trimCanvas(src, sx, sy, sw, sh) {
  const c = document.createElement('canvas');
  c.width = sw; c.height = sh;
  const g = c.getContext('2d');
  g.drawImage(src, sx, sy, sw, sh, 0, 0, sw, sh);
  const d = g.getImageData(0, 0, sw, sh).data;
  let minx = sw, miny = sh, maxx = -1, maxy = -1;
  for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) {
    if (d[(y * sw + x) * 4 + 3] > 20) {
      if (x < minx) minx = x; if (x > maxx) maxx = x;
      if (y < miny) miny = y; if (y > maxy) maxy = y;
    }
  }
  if (maxx < 0) return c;
  const w = maxx - minx + 1, h = maxy - miny + 1;
  const c2 = document.createElement('canvas');
  c2.width = w; c2.height = h;
  c2.getContext('2d').drawImage(c, minx, miny, w, h, 0, 0, w, h);
  return c2;
}

function tintCanvas(src, color, alpha) {
  const c = document.createElement('canvas');
  c.width = src.width; c.height = src.height;
  const g = c.getContext('2d');
  g.drawImage(src, 0, 0);
  g.globalCompositeOperation = 'source-atop';
  g.globalAlpha = alpha;
  g.fillStyle = color;
  g.fillRect(0, 0, c.width, c.height);
  return c;
}

/* Bảng frame chính xác giải mã từ file dữ liệu cu2 của JAR gốc
 * (aO[row] = dx,dy,w,h,ofsX,ofsY,imgIdx). Lính = u3(0,0,40x39) quay PHẢI.
 * Muzzle flash = u0 rows 43-48 (vàng loại A / xanh loại B). Nổ lớn = u6 33-42. */
const FR = {
  soldier: [3, 0, 0, 40, 39],
  flashYellow: [[0, 0, 21, 27], [21, 0, 23, 30], [44, 0, 24, 29]],
  flashBlue: [[0, 30, 21, 27], [21, 30, 23, 30], [44, 30, 24, 29]],
  boomBig: [[68, 0, 24, 36], [22, 0, 22, 42], [63, 36, 19, 38], [44, 0, 24, 36], [0, 0, 22, 42], [44, 36, 19, 38], [0, 42, 38, 34], [82, 36, 32, 31], [92, 0, 24, 25], [82, 67, 28, 32]],
  boomSmall: [[0, 76, 12, 12], [24, 76, 12, 12], [12, 76, 12, 12], [36, 76, 12, 13], [0, 88, 12, 12], [12, 88, 12, 12], [24, 88, 12, 12], [52, 76, 14, 14], [66, 76, 16, 16]],
  flagRed: [[0, 0, 15, 14], [0, 14, 15, 14], [0, 28, 15, 14]],
  flagGreen: [[15, 0, 15, 14], [15, 14, 15, 14], [15, 28, 15, 14]],
  base: [7, 0, 0, 24, 23],
  guns: { saw: [5, 0, 0, 37, 14], mg: [5, 37, 17, 37, 8], shot: [5, 0, 0, 37, 14], rock: [5, 37, 0, 42, 17], plas: [5, 0, 14, 37, 16], beam: [5, 0, 14, 37, 16] },
  rocketBall: [6, 68, 0, 24, 36],
};

const KIT = { soldier: null, flash: [], boomBig: [], boomSmall: [], flagRed: [], flagGreen: [], base: null, weapons: [], rocketBall: null, bars: {}, icons: {} };

function cropImg(imgIdx, x, y, w, h) {
  const src = IMG[`u${imgIdx}`];
  if (!src) return null;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  c.getContext('2d').drawImage(src, x, y, w, h, 0, 0, w, h);
  return c;
}

function buildKit() {
  if (!IMG.u3) return;
  const body = cropImg(...FR.soldier);
  KIT.soldier = {
    green: body,
    red: tintCanvas(body, '#ff3b2d', 0.38),
    yellow: tintCanvas(body, '#ffd84d', 0.32),
  };
  KIT.flash = FR.flashYellow.map(([x, y, w, h]) => cropImg(0, x, y, w, h));
  KIT.flashBlue = FR.flashBlue.map(([x, y, w, h]) => cropImg(0, x, y, w, h));
  KIT.boomBig = FR.boomBig.map(([x, y, w, h]) => cropImg(6, x, y, w, h)).filter(Boolean);
  KIT.boomSmall = FR.boomSmall.map(([x, y, w, h]) => cropImg(6, x, y, w, h)).filter(Boolean);
  KIT.flagRed = FR.flagRed.map(([x, y, w, h]) => cropImg(4, x, y, w, h));
  KIT.flagGreen = FR.flagGreen.map(([x, y, w, h]) => cropImg(4, x, y, w, h));
  KIT.base = cropImg(...FR.base);
  KIT.rocketBall = cropImg(...FR.rocketBall);
  // icon vũ khí theo thứ tự slot 1-6
  const order = ['saw', 'mg', 'shot', 'rock', 'plas', 'beam'];
  for (const k of order) {
    const g = FR.guns[k];
    KIT.weapons.push(g ? cropImg(...g) : null);
  }
  // thanh máu HUD từ u8
  if (IMG.u8) {
    KIT.bars.frame = trimCanvas(IMG.u8, 0, 15, 72, 11);
  }
  if (IMG.s0) {
    KIT.icons.radar = trimCanvas(IMG.s0, 0, 0, 58, 88);
    KIT.icons.dot1 = trimCanvas(IMG.s0, 0, 90, 22, 17);
    KIT.icons.dot2 = trimCanvas(IMG.s0, 26, 90, 22, 17);
  }
}

/* ---------- âm thanh WebAudio tổng hợp ---------- */
const SFX = { ac: null, muted: false };
function audioInit() {
  if (SFX.ac || SFX.muted) return;
  try { SFX.ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { SFX.muted = true; }
}
function noiseBuf(ac, dur) {
  const b = ac.createBuffer(1, Math.max(1, ac.sampleRate * dur | 0), ac.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}
function sfxPlay(name) {
  if (SFX.muted || !SFX.ac) return;
  const ac = SFX.ac, t = ac.currentTime;
  const g = ac.createGain(); g.connect(ac.destination);
  if (name === 'shot' || name === 'rocket') {
    const src = ac.createBufferSource(); src.buffer = noiseBuf(ac, 0.12);
    const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = name === 'shot' ? 900 : 300;
    src.connect(f); f.connect(g);
    g.gain.setValueAtTime(name === 'shot' ? 0.06 : 0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    src.start(t); src.stop(t + 0.13);
  } else if (name === 'boom') {
    const src = ac.createBufferSource(); src.buffer = noiseBuf(ac, 0.45);
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(900, t);
    f.frequency.exponentialRampToValueAtTime(90, t + 0.4);
    src.connect(f); f.connect(g);
    g.gain.setValueAtTime(0.28, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    src.start(t); src.stop(t + 0.46);
    const o = ac.createOscillator(); o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(35, t + 0.4);
    const g2 = ac.createGain(); g2.connect(ac.destination);
    g2.gain.setValueAtTime(0.22, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
    o.connect(g2); o.start(t); o.stop(t + 0.43);
  } else if (name === 'hit') {
    const o = ac.createOscillator(); o.type = 'square'; o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(90, t + 0.08);
    o.connect(g); g.gain.setValueAtTime(0.07, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    o.start(t); o.stop(t + 0.1);
  } else if (name === 'pickup' || name === 'flag') {
    const notes = name === 'pickup' ? [520, 780] : [420, 560, 700, 880];
    notes.forEach((fr, i) => {
      const o = ac.createOscillator(); o.frequency.value = fr;
      const gg = ac.createGain(); gg.connect(ac.destination);
      const tt = t + i * 0.07;
      gg.gain.setValueAtTime(0.001, tt);
      gg.gain.linearRampToValueAtTime(0.08, tt + 0.02);
      gg.gain.exponentialRampToValueAtTime(0.001, tt + 0.1);
      o.connect(gg); o.start(tt); o.stop(tt + 0.11);
    });
  } else if (name === 'saw') {
    const o = ac.createOscillator(); o.type = 'sawtooth';
    o.frequency.setValueAtTime(90, t); o.frequency.linearRampToValueAtTime(60, t + 0.15);
    o.connect(g); g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    o.start(t); o.stop(t + 0.17);
  } else if (name === 'beam') {
    const o = ac.createOscillator(); o.frequency.setValueAtTime(1400, t);
    o.frequency.exponentialRampToValueAtTime(400, t + 0.1);
    o.connect(g); g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
    o.start(t); o.stop(t + 0.12);
  }
}

/* ---------- app state ---------- */
const app = {
  screen: 'boot', menuIdx: 0, modeIdx: 0, lang: 'vi', save: { best: {} },
  match: null, paused: false, lastTick: 0, result: null, splashT: 0, helpFrom: 'menu',
  input: { mx: null, my: null, fire: false, keys: {} },
  mouseSeen: false,
};

function T() { return LANG[app.lang]; }
function fmt(text, vars) {
  let out = text;
  for (const [k, v] of Object.entries(vars || {})) out = out.replace(`{${k}}`, v);
  return out;
}

function startMatch() {
  app.match = createMatch(MODES[app.modeIdx].id, (Date.now() & 0x7fffffff));
  app.screen = 'game';
  app.paused = false;
  app.result = null;
  app.resultPending = false;
}
function soldierSeqReset() { /* id mới mỗi trận không quan trọng — giữ nguyên */ }

function finishMatch() {
  const res = matchResult(app.match);
  const modeId = MODES[app.modeIdx].id;
  const prev = app.save.best[modeId] || 0;
  res.bestPrev = prev;
  const scoreKey = modeId === 'surv' ? res.wave : res.kills;
  res.bestNew = scoreKey > prev;
  if (res.bestNew) { app.save.best[modeId] = scoreKey; saveSave(app.save); }
  app.result = res;
  app.screen = 'result';
}

/* ---------- input ---------- */
function bindInput() {
  const cv = canvasEl;
  window.addEventListener('keydown', (e) => {
    audioInit();
    const k = e.key;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(k)) e.preventDefault();
    handleKey(k);
  });
  window.addEventListener('keyup', (e) => setMove(e.key, false));
  cv.addEventListener('mousemove', (e) => {
    const r = cv.getBoundingClientRect();
    const wx = (e.clientX - r.left) * (240 / r.width);
    const wy = (e.clientY - r.top) * (320 / r.height);
    const m = app.match;
    if (m && app.screen === 'game') {
      app.input.mx = wx + m.cam.x; app.input.my = wy + m.cam.y;
    } else { app.input.mx = wx; app.input.my = wy; }
    app.mouseSeen = true;
    app.cursorScreen = { x: wx, y: wy };
  });
  cv.addEventListener('mousedown', (e) => { audioInit(); app.input.fire = true; clickScreen(); });
  window.addEventListener('mouseup', () => { app.input.fire = false; });
  cv.addEventListener('contextmenu', (e) => e.preventDefault());
}

function setMove(k, down) {
  const K = app.input.keys;
  if (k === 'ArrowUp' || k === 'w' || k === 'W') K.up = down;
  if (k === 'ArrowDown' || k === 's' || k === 'S') K.down = down;
  if (k === 'ArrowLeft' || k === 'a' || k === 'A') K.left = down;
  if (k === 'ArrowRight' || k === 'd' || k === 'D') K.right = down;
}

function handleKey(k) {
  const down = true;
  setMove(k, down);
  const S = app.screen;
  if (S === 'splash') { app.screen = 'title'; return; }
  if (S === 'title') { app.screen = 'menu'; return; }
  if (S === 'menu') {
    if (k === 'ArrowUp' || k === 'w') app.menuIdx = (app.menuIdx + T().menu.length - 1) % T().menu.length;
    if (k === 'ArrowDown' || k === 's') app.menuIdx = (app.menuIdx + 1) % T().menu.length;
    if (k === 'Enter' || k === ' ') activateMenu();
    return;
  }
  if (S === 'mode') {
    if (k === 'ArrowUp' || k === 'w') app.modeIdx = (app.modeIdx + MODES.length - 1) % MODES.length;
    if (k === 'ArrowDown' || k === 's') app.modeIdx = (app.modeIdx + 1) % MODES.length;
    if (k === 'Enter' || k === ' ') startMatch();
    if (k === 'q' || k === 'Q' || k === 'Escape') app.screen = 'menu';
    return;
  }
  if (S === 'help' || S === 'about') { app.screen = app.helpFrom; return; }
  if (S === 'game') {
    if (k === 'p' || k === 'P') app.paused = !app.paused;
    if (k === 'm' || k === 'M') { SFX.muted = !SFX.muted; }
    if (/^[1-6]$/.test(k) && app.match) app.match.player.weapon = Number(k) - 1;
    if ((k === 'q' || k === 'Q') && app.match) { app.screen = 'menu'; app.match = null; }
    if (k === 'Enter' && app.match && app.match.over) finishMatch();
    return;
  }
  if (S === 'result') {
    if (k === 'Enter') startMatch();
    if (k === 'q' || k === 'Q') { app.screen = 'menu'; app.match = null; }
  }
}

function activateMenu() {
  const i = app.menuIdx;
  if (i === 0) app.screen = 'mode';
  else if (i === 1) {
    app.lang = app.lang === 'vi' ? 'en' : 'vi';
    app.save.lang = app.lang; saveSave(app.save);
  } else if (i === 2) { app.helpFrom = 'menu'; app.screen = 'help'; }
  else app.screen = 'about';
}

function clickScreen() {
  const S = app.screen;
  const cx = app.cursorScreen ? app.cursorScreen.x : -1, cy = app.cursorScreen ? app.cursorScreen.y : -1;
  if (S === 'splash' || S === 'title') { handleKey('Enter'); return; }
  if (S === 'menu') {
    const items = T().menu;
    const y0 = 120, lh = 22;
    for (let i = 0; i < items.length; i++) {
      if (cy >= y0 + i * lh - 8 && cy < y0 + (i + 1) * lh - 8) { app.menuIdx = i; activateMenu(); return; }
    }
    return;
  }
  if (S === 'mode') {
    const y0 = 78, lh = 20;
    for (let i = 0; i < MODES.length; i++) {
      if (cy >= y0 + i * lh - 6 && cy < y0 + (i + 1) * lh - 6) { app.modeIdx = i; startMatch(); return; }
    }
    return;
  }
  if (S === 'help' || S === 'about') { handleKey('Enter'); return; }
  if (S === 'result') handleKey('Enter');
}

/* ---------- camera ---------- */
function updateCam(m) {
  const p = m.player;
  let cx = p.x - 120, cy = p.y - 160;
  cx = Math.max(0, Math.min(WORLD_W - 240, cx));
  cy = Math.max(0, Math.min(WORLD_H - 320, cy));
  if (!m.cam) m.cam = { x: cx, y: cy };
  m.cam.x += (cx - m.cam.x) * 0.25;
  m.cam.y += (cy - m.cam.y) * 0.25;
}

/* ---------- render ---------- */
function drawPatternFloor(g, cam) {
  const im = IMG.l0 || IMG.bg0;
  if (im) {
    const pat = g.createPattern(patternOf(im, 64), 'repeat');
    g.save();
    g.fillStyle = '#20281f';
    g.fillRect(0, 0, 240, 320);
    g.translate(-cam.x, -cam.y);
    g.fillStyle = pat; g.globalAlpha = 0.5;
    g.fillRect(0, 0, WORLD_W, WORLD_H);
    g.restore();
  } else {
    g.fillStyle = '#20281f'; g.fillRect(0, 0, 240, 320);
  }
}
const _patCache = new Map();
function patternOf(im, size) {
  const key = (im.src || im) + size;
  if (_patCache.has(key)) return _patCache.get(key);
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.drawImage(im, 0, 0, size, size);
  _patCache.set(key, c);
  return c;
}

function drawWorldTileWalls(g, m, cam) {
  const im = IMG.l1;
  const x0 = Math.max(0, Math.floor(cam.x / TILE)), x1 = Math.min(MAP_W - 1, Math.ceil((cam.x + 240) / TILE));
  const y0 = Math.max(0, Math.floor(cam.y / TILE)), y1 = Math.min(MAP_H - 1, Math.ceil((cam.y + 320) / TILE));
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    if (!m.grid[ty * MAP_W + tx]) continue;
    const x = tx * TILE - cam.x, y = ty * TILE - cam.y;
    if (im) { g.drawImage(im, 0, 0, 64, 64, x, y, TILE, TILE); }
    g.fillStyle = 'rgba(8,12,10,0.45)'; g.fillRect(x, y, TILE, TILE);
    g.strokeStyle = '#141a14'; g.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
  }
}

function soldierColor(team) { return team === 1 ? '#ff5544' : '#66cc55'; }

function drawSoldier(g, m, s, ix, iy, cam) {
  if (s.dead) return;
  const moving = Math.abs(s.x - s.px) + Math.abs(s.y - s.py) > 0.4;
  const bob = moving && Math.floor(m.time / 120) % 2 === 0 ? 1 : 0;
  const flip = Math.cos(s.dir) < 0;
  const teamKey = s.team === 1 ? 'red' : (s.team > 1 ? (s.id % 2 ? 'yellow' : 'red') : 'green');
  const spr = (KIT.soldier && KIT.soldier[teamKey]) || KIT.soldier;
  if (!spr) return;
  const dw = spr.width, dh = spr.height;
  g.save();
  g.translate(ix, iy + bob);
  if (flip) g.scale(-1, 1);
  // chân trúng vị trí entity: vẽ thân lệch lên
  g.drawImage(spr, -dw / 2, -dh / 2 - 6);
  g.restore();
  if (s.hitT > 0) {
    g.globalAlpha = Math.min(0.6, s.hitT / 300);
    g.fillStyle = '#fff';
    g.fillRect(ix - dw / 2, iy - dh / 2 - 6, dw, dh);
    g.globalAlpha = 1;
  }
  // vòng người chơi
  if (!s.bot) {
    g.strokeStyle = '#fff'; g.globalAlpha = 0.7;
    g.beginPath(); g.arc(ix, iy, 13, 0, Math.PI * 2); g.stroke();
    g.globalAlpha = 1;
  }
  // muzzle flash 3 frame trỏ theo hướng bắn
  if (s.fireT > 40 && KIT.flash.length) {
    const fi = Math.floor(s.fireT / 90) % KIT.flash.length;
    const fl = KIT.flash[fi];
    const gx = ix + Math.cos(s.dir) * 14, gy = iy - 12 + Math.sin(s.dir) * 14;
    g.save();
    g.translate(gx, gy);
    g.rotate(s.dir);
    const fs = 0.6;
    g.globalAlpha = Math.min(1, s.fireT / 200);
    g.drawImage(fl, -fl.width * fs / 2, -fl.height * fs / 2, fl.width * fs, fl.height * fs);
    g.restore();
    g.globalAlpha = 1;
  }
  // súng trên tay
  const w = WEAPONS[s.weapon];
  const icon = KIT.weapons[s.weapon];
  const hx = ix + Math.cos(s.dir) * 12, hy = iy - 10 + Math.sin(s.dir) * 12;
  if (icon) {
    g.save();
    g.translate(hx, hy);
    g.rotate(s.dir + (flip ? Math.PI : 0));
    g.drawImage(icon, -icon.width / 4, -icon.height / 2);
    g.restore();
  } else {
    g.strokeStyle = w.color; g.lineWidth = 2;
    g.beginPath(); g.moveTo(ix + Math.cos(s.dir) * 6, iy + Math.sin(s.dir) * 6); g.lineTo(hx, hy); g.stroke();
    g.lineWidth = 1;
  }
  // cầm cờ
  if (s.carrying >= 0 && m.flags) {
    const f = m.flags[s.carrying];
    const flags = f.team === 1 ? KIT.flagRed : KIT.flagGreen;
    if (flags.length) {
      const ff = flags[Math.floor(m.time / 150) % flags.length];
      g.drawImage(ff, ix - 8, iy - dh / 2 - 16);
    }
  }
  // thanh máu nhỏ trên đầu địch
  if (s.bot && s.hp < 100) {
    g.fillStyle = '#300'; g.fillRect(ix - 10, iy - dh / 2 - 10, 20, 2);
    g.fillStyle = soldierColor(s.team); g.fillRect(ix - 10, iy - dh / 2 - 10, 20 * Math.max(0, s.hp) / 100, 2);
  }
}

function drawWorld(g, m, cam, lerpT) {
  drawPatternFloor(g, cam);
  drawWorldTileWalls(g, m, cam);
  // pickups
  for (const p of m.pickups) {
    if (!p.active) continue;
    const x = p.x - cam.x, y = p.y - cam.y;
    if (x < -16 || y < -16 || x > 256 || y > 336) continue;
    if (p.type === 'crate') {
      g.fillStyle = '#7a5a2a'; g.fillRect(x - 7, y - 7, 14, 14);
      g.strokeStyle = '#c9a04d'; g.strokeRect(x - 6.5, y - 6.5, 13, 13);
      const wi = ((p.x + p.y) / 8 | 0) % 6;
      if (KIT.weapons[wi]) g.drawImage(KIT.weapons[wi], x - 5, y - 9, 10, 18);
    } else {
      g.fillStyle = p.type === 'heart' ? '#ff4466' : '#55ccff';
      g.fillRect(x - 6, y - 6, 12, 12);
      g.fillStyle = '#111';
      g.font = '9px monospace'; g.textAlign = 'center';
      g.fillText(p.type === 'heart' ? '+' : 'S', x, y + 3);
    }
  }
  // cờ + căn cứ (sprite gốc: cờ u4 3 frame, căn cứ u7)
  if (m.flags) {
    const tf = Math.floor(Date.now() / 150) % 3;
    for (const f of m.flags) {
      const x = f.x - cam.x, y = f.y - cam.y;
      if (KIT.base) g.drawImage(KIT.base, x - 12, y - 4);
      const flags = f.team === 1 ? KIT.flagRed : KIT.flagGreen;
      if (flags.length) {
        g.drawImage(flags[tf], x - 8, y - 16);
      } else {
        g.fillStyle = f.team === 1 ? '#ff5544' : '#66cc55';
        g.fillRect(x + 1, y - 16, 9, 6);
      }
    }
  }
  // lính
  for (const s of m.soldiers) {
    const ix = (s.px + (s.x - s.px) * lerpT) - cam.x;
    const iy = (s.py + (s.y - s.py) * lerpT) - cam.y;
    if (ix < -24 || iy < -24 || ix > 264 || iy > 344) continue;
    drawSoldier(g, m, s, ix, iy, cam);
  }
  // đạn
  for (const b of m.bullets) {
    if (b.beam) {
      g.strokeStyle = b.color; g.globalAlpha = Math.min(1, b.life / 90); g.lineWidth = 2;
      g.beginPath(); g.moveTo(b.x0 - cam.x, b.y0 - cam.y); g.lineTo(b.x1 - cam.x, b.y1 - cam.y); g.stroke();
      g.globalAlpha = 1; g.lineWidth = 1;
      continue;
    }
    const x = b.x - cam.x, y = b.y - cam.y;
    if (b.aoe && KIT.rocketBall) {
      // đạn rocket = cầu lửa
      const rb = KIT.rocketBall;
      g.save();
      g.translate(x, y);
      g.rotate(Math.atan2(b.dy, b.dx));
      g.drawImage(rb, -6, -6, 14, 14);
      g.restore();
      g.globalAlpha = 0.35; g.fillStyle = '#ffb84d';
      g.fillRect(x - b.dx * 4 - 1, y - b.dy * 4 - 1, 3, 3);
      g.globalAlpha = 1;
      continue;
    }
    g.fillStyle = b.color;
    const sz = b.aoe ? 4 : 2;
    g.fillRect(x - sz / 2, y - sz / 2, sz, sz);
    if (b.trail) { g.globalAlpha = 0.4; g.fillRect(x - b.dx * 2, y - b.dy * 2, 2, 2); g.globalAlpha = 1; }
  }
  // nổ: chuỗi frame cầu lửa u6 (lớn 10 frame, nhỏ 9 frame)
  for (const e of m.explosions) {
    const set = e.small ? KIT.boomSmall : KIT.boomBig;
    if (!set || !set.length) continue;
    const fi = Math.min(set.length - 1, Math.floor(e.t / 110));
    const spr = set[fi];
    const scale = e.small ? 0.8 : 1.25;
    g.drawImage(spr, e.x - cam.x - spr.width * scale / 2, e.y - cam.y - spr.height * scale / 2, spr.width * scale, spr.height * scale);
  }
  // hạt
  for (const p of m.particles) {
    g.fillStyle = p.color; g.globalAlpha = Math.min(1, p.life / 300);
    g.fillRect(p.x - cam.x, p.y - cam.y, p.size, p.size);
  }
  g.globalAlpha = 1;
  // con trỏ ngắm
  if (IMG.curs && app.mouseSeen && typeof app.input.mx === 'number') {
    g.drawImage(IMG.curs, app.input.mx - cam.x - 16, app.input.my - cam.y - 13);
  }
}

function drawHud(g, m) {
  const T2 = T();
  g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(0, 0, 240, 34);
  g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(0, 34, 240, 1);
  const p = m.player;
  // máu
  if (KIT.bars.frame) g.drawImage(KIT.bars.frame, 4, 3, 50, 8);
  else { g.strokeStyle = '#888'; g.strokeRect(4.5, 3.5, 50, 8); }
  g.fillStyle = p.hp > 40 ? '#66cc55' : '#ff5544';
  g.fillRect(6, 5, 46 * Math.max(0, p.hp) / 100, 4);
  if (p.armor > 0) {
    g.fillStyle = '#55ccff';
    g.fillRect(6, 9, 46 * p.armor / 100, 2);
  }
  // vũ khí + đạn
  const wi = KIT.weapons[p.weapon];
  if (wi) g.drawImage(wi, 60, 2, 10, 24);
  const w = WEAPONS[p.weapon];
  g.fillStyle = '#eee'; g.font = '9px monospace'; g.textAlign = 'left';
  const ammoTxt = w.ammoMax === Infinity ? '∞' : String(p.ammo[p.weapon]);
  g.fillText(ammoTxt, 73, 14);
  g.fillStyle = '#9cf'; g.font = '7px monospace';
  g.fillText(`${p.weapon + 1}.${app.lang === 'vi' ? w.name.vi : w.name.en}`, 73, 25);
  // điểm/timer phải
  g.textAlign = 'right';
  g.fillStyle = '#ffd84d'; g.font = '9px monospace';
  const modeId = m.mode.id;
  let scoreLine;
  if (m.mode.teams) scoreLine = fmt(T2.teamFrags, { g: m.frags[0], r: m.frags[1] });
  else if (modeId === 'ctf') scoreLine = `${T2.captures} ${m.caps[0]}/${m.mode.capLimit}`;
  else if (modeId === 'surv') scoreLine = `${T2.wave} ${m.wave}`;
  else scoreLine = `${T2.frags} ${p.kills}/${m.mode.fragLimit}`;
  g.fillText(scoreLine, 236, 14);
  const sec = Math.floor(m.time / 1000);
  g.fillStyle = '#9cff7b'; g.font = '8px monospace';
  g.fillText(`${T2.kills} ${p.kills} · ${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`, 236, 25);
  // radar góc phải dưới
  drawRadar(g, m);
  // announce
  g.textAlign = 'center';
  for (const a of m.announces) {
    g.globalAlpha = Math.min(1, a.t / 700);
    g.fillStyle = '#ffd84d'; g.font = 'bold 14px monospace';
    g.fillText(typeof a.text === 'string' ? a.text : (app.lang === 'vi' ? a.text.vi : a.text.en), 120, 120);
    g.globalAlpha = 1;
  }
  // paused
  if (app.paused) {
    g.fillStyle = 'rgba(0,0,0,0.7)'; g.fillRect(0, 0, 240, 320);
    g.fillStyle = '#ffd84d'; g.font = 'bold 18px monospace'; g.textAlign = 'center';
    g.fillText(T2.paused, 120, 140);
    g.fillStyle = '#aaa'; g.font = '8px monospace';
    g.fillText(T2.resume, 120, 165);
  }
  if (m.over) {
    g.fillStyle = 'rgba(0,0,0,0.75)'; g.fillRect(0, 0, 240, 320);
    g.fillStyle = m.winner === 'win' ? '#9cff7b' : '#ff5544';
    g.font = 'bold 20px monospace'; g.textAlign = 'center';
    g.fillText(m.winner === 'win' ? T2.win : T2.lose, 120, 130);
    g.fillStyle = '#ccc'; g.font = '9px monospace';
    g.fillText(`${T2.kills}: ${p.kills}   ${T2.deaths}: ${p.deaths}`, 120, 160);
    g.fillText(T2.again, 120, 200);
  }
}

function drawRadar(g, m) {
  const R = 26, cx = 240 - R - 6, cy = 320 - R - 6;
  g.save();
  g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2);
  g.fillStyle = 'rgba(10,16,10,0.65)'; g.fill();
  g.clip();
  const sx = R * 2 / WORLD_W, sy = R * 2 / WORLD_H;
  g.fillStyle = 'rgba(140,150,140,0.5)';
  for (let ty = 0; ty < MAP_H; ty += 2) for (let tx = 0; tx < MAP_W; tx += 2) {
    if (m.grid[ty * MAP_W + tx]) g.fillRect(cx - R + tx * TILE * sx, cy - R + ty * TILE * sy, 1.6, 1.6);
  }
  if (m.flags) for (const f of m.flags) {
    g.fillStyle = '#ffd84d';
    g.fillRect(cx - R + f.x * sx - 1.5, cy - R + f.y * sy - 1.5, 3, 3);
  }
  for (const s of m.soldiers) {
    if (s.dead) continue;
    g.fillStyle = s === m.player ? '#fff' : soldierColor(s.team);
    g.fillRect(cx - R + s.x * sx - 1, cy - R + s.y * sy - 1, 2.5, 2.5);
  }
  g.restore();
  g.strokeStyle = 'rgba(200,220,200,0.5)';
  g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
}

/* ---------- màn hình menu ---------- */
function drawBg(g, key) {
  const im = IMG[key] || IMG.bg0;
  if (im) {
    const sc = Math.max(240 / im.width, 320 / im.height);
    const dw = im.width * sc, dh = im.height * sc;
    g.drawImage(im, (240 - dw) / 2, (320 - dh) / 2, dw, dh);
    g.fillStyle = 'rgba(5,10,5,0.62)'; g.fillRect(0, 0, 240, 320);
  } else { g.fillStyle = '#0c120c'; g.fillRect(0, 0, 240, 320); }
}

function drawMenuList(g, items, sel, y0, lh, color) {
  g.textAlign = 'center';
  for (let i = 0; i < items.length; i++) {
    const on = i === sel;
    g.fillStyle = on ? (color || '#ffd84d') : '#cfcfcf';
    g.font = (on ? 'bold ' : '') + '11px monospace';
    g.fillText((on ? '▶ ' : '  ') + items[i], 120, y0 + i * lh);
  }
}

function renderFrame(g) {
  const T2 = T();
  const S = app.screen;
  if (S === 'boot') {
    g.fillStyle = '#000'; g.fillRect(0, 0, 240, 320);
    g.fillStyle = '#9cff7b'; g.font = '10px monospace'; g.textAlign = 'center';
    g.fillText(T2.loading, 120, 160);
    return;
  }
  if (S === 'splash') {
    g.fillStyle = '#000'; g.fillRect(0, 0, 240, 320);
    if (IMG.lz) {
      const a = Math.sin(Math.min(1, app.splashT / 1600) * Math.PI);
      g.globalAlpha = Math.max(0.15, a);
      g.drawImage(IMG.lz, (240 - IMG.lz.width) / 2, (320 - IMG.lz.height) / 2);
      g.globalAlpha = 1;
    }
    return;
  }
  if (S === 'title') {
    if (IMG.or) { g.drawImage(IMG.or, 0, 0, 240, 320); }
    else drawBg(g, 'bg0');
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, 280, 240, 40);
    if (Math.floor(Date.now() / 450) % 2 === 0) {
      g.fillStyle = '#ffd84d'; g.font = 'bold 11px monospace'; g.textAlign = 'center';
      g.fillText(T2.pressAny, 120, 300);
    }
    g.fillStyle = '#8f8'; g.font = '7px monospace';
    g.fillText('Phaser 3 · J2ME port', 120, 313);
    return;
  }
  if (S === 'menu') {
    drawBg(g, 'li1');
    g.fillStyle = '#ffd84d'; g.font = 'bold 16px monospace'; g.textAlign = 'center';
    g.fillText('TOTAL', 120, 70);
    g.fillText('TOURNAMENT', 120, 90);
    drawMenuList(g, T2.menu, app.menuIdx, 130, 22);
    g.fillStyle = '#777'; g.font = '7px monospace';
    g.fillText('Net Lizard · web port', 120, 310);
    return;
  }
  if (S === 'mode') {
    drawBg(g, 'li2');
    g.fillStyle = '#ffd84d'; g.font = 'bold 12px monospace'; g.textAlign = 'center';
    g.fillText(T2.chooseMode, 120, 50);
    drawMenuList(g, T2.modes, app.modeIdx, 84, 20);
    g.fillStyle = '#bbb'; g.font = '8px monospace';
    wrapText(g, T2.modeDesc[app.modeIdx], 120, 200, 216, 12);
    g.fillStyle = '#9cff7b'; g.font = '9px monospace';
    g.fillText(T2.start, 120, 285);
    g.fillStyle = '#777'; g.font = '7px monospace';
    g.fillText(T2.back, 120, 308);
    return;
  }
  if (S === 'help' || S === 'about') {
    drawBg(g, S === 'help' ? 'bg1' : 'bg0');
    const lines = S === 'help' ? T2.help : T2.about;
    g.textAlign = 'center';
    let y = 60;
    for (const ln of lines) {
      if (ln === '') { y += 10; continue; }
      g.fillStyle = '#ddd'; g.font = '9px monospace';
      g.fillText(ln, 120, y);
      y += 15;
    }
    g.fillStyle = '#777'; g.font = '7px monospace';
    g.fillText(T2.back, 120, 306);
    return;
  }
  if (S === 'game') {
    const m = app.match;
    if (!m) { app.screen = 'menu'; return; }
    const now = performance.now();
    const lerpT = app.paused || m.over ? 1 : Math.max(0, Math.min(1, (now - app.lastTick) / TICK_MS));
    updateCam(m);
    drawWorld(g, m, m.cam, lerpT);
    drawHud(g, m);
    return;
  }
  if (S === 'result') {
    drawBg(g, 'li1');
    const r = app.result, m = app.match, T3 = T2;
    g.textAlign = 'center';
    g.fillStyle = '#ffd84d'; g.font = 'bold 14px monospace';
    g.fillText(T3.result, 120, 60);
    const win = r.winner;
    g.fillStyle = win === 'win' ? '#9cff7b' : '#ff5544';
    g.font = 'bold 20px monospace';
    g.fillText(win === 'win' ? T3.win : (win === 'draw' ? T3.draw : T3.lose), 120, 95);
    g.fillStyle = '#ddd'; g.font = '10px monospace';
    const modeId = m.mode.id;
    const rows = [
      `${T3.kills}: ${r.kills}`,
      `${T3.deaths}: ${r.deaths}`,
    ];
    if (modeId === 'surv') rows.push(`${T3.wave}: ${r.wave}`, `Score: ${r.score}`);
    if (modeId === 'ctf') rows.push(`${T3.captures}: ${r.captures}`, `${m.frags[0]} - ${m.frags[1]}`);
    if (modeId === 'team') rows.push(`${m.frags[0]} - ${m.frags[1]}`);
    if (modeId === 'dm') rows.push(`Score: ${r.score}`);
    let y = 130;
    for (const row of rows) { g.fillText(row, 120, y); y += 18; }
    if (r.bestNew) {
      g.fillStyle = '#ffd84d'; g.font = 'bold 10px monospace';
      g.fillText(`★ ${T3.best}: ${app.save.best[modeId]}`, 120, y + 6);
    } else {
      g.fillStyle = '#999'; g.font = '9px monospace';
      g.fillText(`${T3.best}: ${r.bestPrev}`, 120, y + 6);
    }
    g.fillStyle = '#9cff7b'; g.font = '8px monospace';
    g.fillText(T3.again, 120, 285);
    return;
  }
}

function wrapText(g, text, cx, y0, maxW, lh) {
  const words = text.split(' ');
  let line = '', y = y0;
  for (const w of words) {
    const t2 = line + (line ? ' ' : '') + w;
    if (g.measureText(t2).width > maxW && line) { g.fillText(line, cx, y); line = w; y += lh; }
    else line = t2;
  }
  if (line) g.fillText(line, cx, y);
}

/* ---------- boot ---------- */
async function boot() {
  app.save = loadSave();
  app.lang = getLang(app.save);
  bindInput();
  await loadAll();
  buildKit();
  app.screen = 'splash';
  const splashStart = performance.now();
  // splash tự chuyển sau 1.9s
  const iv = setInterval(() => {
    app.splashT = performance.now() - splashStart;
    if (app.splashT > 1900 && app.screen === 'splash') { app.screen = 'title'; clearInterval(iv); }
    if (app.screen !== 'splash') clearInterval(iv);
  }, 100);
  mountPhaserRuntime({
    canvas: canvasEl,
    width: 240,
    height: 320,
    tickMs: TICK_MS,
    onStepSimulation() {
      app.lastTick = performance.now();
      const m = app.match;
      if (m && app.screen === 'game' && !app.paused) {
        stepMatch(m, app.input);
        // phát âm thanh từ queue của sim
        if (m.sounds && m.sounds.length) { for (const s of m.sounds) sfxPlay(s.name); m.sounds.length = 0; }
        if (m.over && !app.resultPending) { app.resultPending = true; setTimeout(() => { if (app.screen === 'game') finishMatch(); }, 1400); }
      }
    },
    onFrameInterpolate() { return false; },
    onRenderFrame(ctx) { renderFrame(ctx); },
  });
}

if (canvasEl) boot();
