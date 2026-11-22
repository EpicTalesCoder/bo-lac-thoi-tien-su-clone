/**
 * Green Farm 3 — web port Phase B (Phaser 3 pipeline, canvas 2D framebuffer).
 * Kiến trúc repo: sim tick 120ms (MIDP) + render mỗi rAF qua mountPhaserRuntime.
 * Logic thuần nằm ở gf-core.js (test được bằng Node); file này chỉ render/input.
 */
import { mountPhaserRuntime } from './phaser-engine.js';
import {
  SCREEN_W, SCREEN_H, KEY, STATES, MENU_ITEMS, TXT,
  CROPS, GRID_N, PLOTS, SAVE_KEY,
  mapKeyCode, handleKey, pointerToKey, menuRowAt, stepTick, text,
  newFarm, plotState, plotIndexAt, toolbarIndexAt, farmTap, sellAll,
  serializeFarm, deserializeFarm,
  PLOT_EMPTY, PLOT_GROWING, PLOT_READY,
} from './gf-core.js';

const canvasEl = typeof document !== 'undefined' ? document.getElementById('game') : null;

/* ---------- assets ---------- */
const IMG = {};
const SPRITES = {
  icon: 'assets/icon.png',
  tractor: 'assets/sprites/pack5/5_b048_m00.png',
  scarecrow: 'assets/sprites/pack5/5_b078_m01.png',
  signWide: 'assets/sprites/pack5/5_b103_m01.png',
};

function loadImage(name, src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve([name, img]);
    img.onerror = () => resolve([name, null]);
    img.src = src;
  });
}

async function loadAll() {
  const pairs = await Promise.all(Object.entries(SPRITES).map(([n, s]) => loadImage(n, s)));
  for (const [n, img] of pairs) IMG[n] = img;
}

let TEXT_DATA = null;
async function loadText() {
  try {
    const res = await fetch('assets/text/en.json');
    TEXT_DATA = await res.json();
  } catch (e) { TEXT_DATA = null; }
}

/* ---------- game state (pure core) ---------- */
let app = null;

/* ---------- audio (C5): nhạc MP3 gốc + blip WebAudio cho SFX ---------- */
const MUSIC_FILE = 'assets/audio/gf3_b000.mid'; // fallback nếu mp3 lỗi → dùng blip
const MUSIC_MP3 = 'assets/audio/gf3_b063.mp3';
let musicEl = null;
let audioCtx = null;

function blip(freq, dur = 0.08) {
  if (!app || !app.audioOn) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const gn = audioCtx.createGain();
    o.frequency.value = freq;
    o.type = 'square';
    gn.gain.value = 0.05;
    o.connect(gn); gn.connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + dur);
  } catch (e) { /* audio blocked */ }
}

function sfx(kind) {
  if (kind === 'plant') blip(440);
  else if (kind === 'water') blip(660, 0.12);
  else if (kind === 'harvest') { blip(523); setTimeout(() => blip(784), 90); }
  else if (kind === 'error') blip(130, 0.15);
  else if (kind === 'sell') { blip(659); setTimeout(() => blip(880), 80); }
}

function musicToggle(force) {
  if (!app) return app ? app.audioOn : false;
  app.audioOn = force != null ? force : !app.audioOn;
  if (app.audioOn) {
    if (!musicEl) {
      musicEl = new Audio(MUSIC_MP3);
      musicEl.loop = true;
      musicEl.volume = 0.35;
      musicEl.addEventListener('error', () => { musicEl = new Audio(MUSIC_FILE); musicEl.loop = true; });
    }
    musicEl.play().catch(() => {});
  } else if (musicEl) {
    musicEl.pause();
  }
  return app.audioOn;
}

/* ---------- save/load (C4) ---------- */
function persist() {
  if (!app || !app.g || !app.g.farm) return;
  try { localStorage.setItem(SAVE_KEY, serializeFarm(app.g.farm)); } catch (e) { /* private mode */ }
}

function restore() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? deserializeFarm(raw) : null;
  } catch (e) { return null; }
}

if (typeof window !== 'undefined') {
  app = {
    g: null,
    audioOn: true,
    toast: null, toastUntil: 0,
  };
  window.addEventListener('visibilitychange', () => { if (document.hidden) persist(); });
  window.addEventListener('beforeunload', persist);
}

function toast(msg) {
  app.toast = msg;
  app.toastUntil = performance.now() + 1500;
}

/* ---------- render helpers ---------- */
function px(ctx) { return ctx; }

function drawBackground(ctx, tone) {
  ctx.fillStyle = tone;
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
}

function drawTextCenter(ctx, str, y, color, font = 'bold 12px monospace') {
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = 'center';
  const lines = String(str).split('\n');
  lines.forEach((ln, i) => ctx.fillText(ln, SCREEN_W / 2, y + i * 14));
}

function drawIconCentered(ctx, img, cx, cy, scale = 1) {
  if (!img) return;
  const w = img.width * scale, h = img.height * scale;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
}

/* ---------- screens ---------- */
function renderSplash(ctx, g) {
  drawBackground(ctx, '#18241b');
  drawIconCentered(ctx, IMG.icon, SCREEN_W / 2, 96, 2);
  drawTextCenter(ctx, 'GREEN FARM 3', 190, '#9cff7b', 'bold 20px monospace');
  drawTextCenter(ctx, text(TEXT_DATA, TXT.WELCOME) || 'Chào mừng!', 214, '#cfe8c6', '10px monospace');
  if (Math.floor(g.tick / 5) % 2 === 0) {
    drawTextCenter(ctx, 'Bấm phím bất kỳ', 260, '#ffd84d', '10px monospace');
  }
  drawTextCenter(ctx, text(TEXT_DATA, TXT.ABOUT) ? 'Gameloft · port VI' : '', 300, '#666', '8px monospace');
}

function renderMenu(ctx, g) {
  drawBackground(ctx, '#1d2b1f');
  // banner trên cùng — sprite sign nếu có
  if (IMG.signWide) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(IMG.signWide, (SCREEN_W - 160) / 2, 22, 160, 69);
  }
  drawIconCentered(ctx, IMG.icon, 40, 52, 1);
  drawTextCenter(ctx, 'GREEN FARM 3', 110, '#9cff7b', 'bold 16px monospace');

  const first = 150, rowH = 20;
  MENU_ITEMS.forEach((item, i) => {
    const y = first + i * rowH;
    if (i === g.menuIndex) {
      ctx.fillStyle = '#2e4632';
      ctx.fillRect(40, y - 12, SCREEN_W - 80, rowH - 2);
      ctx.fillStyle = '#ffd84d';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('>', 44, y);
    }
    ctx.fillStyle = i === g.menuIndex ? '#ffd84d' : '#cfe8c6';
    ctx.font = i === g.menuIndex ? 'bold 12px monospace' : '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(text(TEXT_DATA, item.label) || item.id, 58, y);
  });

  // trang trí: máy kéo dưới menu
  drawIconCentered(ctx, IMG.tractor, SCREEN_W / 2, 292, 1);

  // softkeys
  ctx.font = '9px monospace';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#8fa88f';
  ctx.fillText('Chọn', 8, 314);
  ctx.textAlign = 'right';
  ctx.fillText(text(TEXT_DATA, TXT.BACK) || 'Quay về', SCREEN_W - 8, 314);
}

function renderSubPage(ctx, g, titleRef, bodyText) {
  drawBackground(ctx, '#16221a');
  drawTextCenter(ctx, text(TEXT_DATA, titleRef) || '', 40, '#9cff7b', 'bold 14px monospace');
  drawTextCenter(ctx, bodyText || '…', 80, '#cfe8c6', '10px monospace');
  drawIconCentered(ctx, IMG.scarecrow || IMG.tractor, SCREEN_W / 2, 210, 1.5);
  ctx.font = '9px monospace';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#8fa88f';
  ctx.fillText(text(TEXT_DATA, TXT.BACK) || 'Quay về', SCREEN_W - 8, 314);
}

function renderFarm(ctx, g, now) {
  const farm = g.farm;
  drawBackground(ctx, '#274d2c');
  drawTextCenter(ctx, `🪙 ${farm.coins}`, 24, '#ffd84d', 'bold 13px monospace');

  // lưới ô đất
  const cell = 36, gx = (SCREEN_W - GRID_N * cell) / 2, gy = 70;
  for (let i = 0; i < PLOTS; i++) {
    const r = Math.floor(i / GRID_N), c = i % GRID_N;
    const x = gx + c * cell, y = gy + r * cell;
    const st = plotState(farm.plots[i], now);
    ctx.fillStyle = '#6b4a2b';
    ctx.fillRect(x, y, cell - 4, cell - 4);
    if (st === PLOT_EMPTY) {
      ctx.strokeStyle = '#7d5633'; ctx.strokeRect(x + 0.5, y + 0.5, cell - 5, cell - 5);
    } else if (st === PLOT_GROWING) {
      ctx.fillStyle = farm.plots[i].wateredAt == null ? '#8a9948' : '#3f9d3f';
      ctx.fillRect(x + 8, y + 14, cell - 20, cell - 22);
    } else { // READY — nhấp nháy vàng
      ctx.fillStyle = Math.floor(now / 400) % 2 ? '#ffd84d' : '#e0a91d';
      ctx.fillRect(x + 4, y + 4, cell - 12, cell - 12);
    }
  }

  // toolbar chọn hạt giống (phím 1-4)
  CROPS.forEach((crop, i) => {
    const x = 12 + i * 52, y = 262;
    ctx.fillStyle = i === farm.selectedCrop ? '#2e4632' : '#1a221c';
    ctx.fillRect(x, y, 48, 30);
    if (i === farm.selectedCrop) { ctx.strokeStyle = '#ffd84d'; ctx.strokeRect(x + 0.5, y + 0.5, 47, 29); }
    ctx.fillStyle = i === farm.selectedCrop ? '#ffd84d' : '#cfe8c6';
    ctx.font = '9px monospace'; ctx.textAlign = 'left';
    ctx.fillText(`${i + 1} ${crop.cost}🪙`, x + 4, y + 13);
    ctx.fillText(crop.id.slice(0, 7), x + 4, y + 25);
  });

  // toast lỗi/thông báo
  if (app.toast && performance.now() < app.toastUntil) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(20, 38, SCREEN_W - 40, 22);
    ctx.fillStyle = '#ffd84d';
    ctx.font = '10px monospace'; ctx.textAlign = 'center';
    ctx.fillText(app.toast, SCREEN_W / 2, 53);
  }

  // softkeys
  ctx.font = '9px monospace';
  ctx.fillStyle = '#8fa88f';
  ctx.textAlign = 'left'; ctx.fillText('Menu', 8, 314);
  ctx.textAlign = 'right'; ctx.fillText('Quầy hàng', SCREEN_W - 8, 314);
}

function renderShop(ctx, g) {
  const farm = g.farm;
  drawBackground(ctx, '#22301f');
  drawTextCenter(ctx, 'QUẦY HÀNG', 36, '#9cff7b', 'bold 14px monospace');
  drawTextCenter(ctx, `🪙 ${farm.coins}`, 56, '#ffd84d', '12px monospace');
  let y = 86;
  let total = 0;
  CROPS.forEach((crop) => {
    const n = farm.inv[crop.id] || 0;
    total += n * crop.sell;
    ctx.font = '11px monospace'; ctx.textAlign = 'left';
    ctx.fillStyle = n ? '#cfe8c6' : '#5a6b5a';
    ctx.fillText(`${crop.id.padEnd(8)} ×${n}  →  ${n * crop.sell}🪙`, 34, y);
    y += 20;
  });
  drawTextCenter(ctx, `Tổng bán: ${total}🪙 — bấm Enter để bán hết`, y + 16, '#ffd84d', '10px monospace');
  ctx.font = '9px monospace';
  ctx.fillStyle = '#8fa88f';
  ctx.textAlign = 'right'; ctx.fillText('Quay về', SCREEN_W - 8, 314);
}

function renderFrame(ctx, g, now) {
  switch (g.state) {
    case STATES.SPLASH: return renderSplash(ctx, g);
    case STATES.MENU: return renderMenu(ctx, g);
    case STATES.ABOUT: return renderSubPage(ctx, g, TXT.ABOUT, text(TEXT_DATA, { page: 0, idx: [0, 1, 3] }));
    case STATES.HELP: return renderSubPage(ctx, g, TXT.HELP, text(TEXT_DATA, { page: 0, idx: [4, 5, 6, 7] }));
    case STATES.OPTIONS: return renderSubPage(ctx, g, TXT.OPTIONS, `NHẠC: ${app.audioOn ? 'BẬT' : 'TẮT'}\nHIỆU ỨNG: BẬT\n(phím M bật/tắt nhạc)`);
    case STATES.EXIT_CONFIRM: return renderSubPage(ctx, g, TXT.EXIT, text(TEXT_DATA, TXT.EXIT_CONFIRM));
    case STATES.FARM: return renderFarm(ctx, g, Date.now());
    case STATES.SHOP: return renderShop(ctx, g);
    default: return drawBackground(ctx, '#111');
  }
}

/* ---------- input ---------- */
function onKeyDown(e) {
  if (!app || !app.g) return;
  if (e.code === 'KeyM') { musicToggle(); return; }
  const midp = mapKeyCode(e.code, e.key);
  const g = app.g;

  // FARM: phím riêng (1-4 chọn hạt, S/softkey-phải quầy hàng, ESC về menu)
  if (g.state === STATES.FARM) {
    if (/^Digit[1-4]$/.test(e.code)) {
      g.farm.selectedCrop = parseInt(e.code.slice(5), 10) - 1;
      e.preventDefault(); return;
    }
    if (e.code === 'Escape' || e.code === 'Backspace' || midp === KEY.SK_LEFT) { goMenu(); e.preventDefault(); return; }
    if (e.code === 'KeyS' || midp === KEY.SK_RIGHT) { g.state = STATES.SHOP; e.preventDefault(); return; }
    return;
  }

  // SHOP: Enter bán hết, phím khác về farm
  if (g.state === STATES.SHOP) {
    e.preventDefault();
    if (midp === KEY.FIRE || midp === 5) {
      const before = g.farm.coins;
      app.g.farm = sellAll(g.farm);
      persist();
      sfx(g.farm.coins > before ? 'sell' : 'error');
      toast(g.farm.coins > before ? `Bán xong +${g.farm.coins - before}🪙` : 'Kho trống!');
    } else {
      g.state = STATES.FARM;
    }
    return;
  }

  if (midp === null) return;
  e.preventDefault();
  const before = g.state;
  app.g = handleKey(g, midp);
  if (app.g.state === STATES.FARM && before !== STATES.FARM && !app.g.farm) {
    app.g.farm = restore() || newFarm();
  }
  if (app.g.state === STATES.EXIT_CONFIRM && before === STATES.MENU) {
    // chọn THOÁT: persist rồi hiện confirm (không thật sự thoát trang)
    persist();
  }
}

function goMenu() {
  persist();
  app.g.state = STATES.MENU;
}

function onPointer(e) {
  if (!app || !app.g) return;
  const rect = canvasEl.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (SCREEN_W / rect.width);
  const y = (e.clientY - rect.top) * (SCREEN_H / rect.height);
  const g = app.g;

  if (g.state === STATES.FARM) {
    e.preventDefault();
    const ti = toolbarIndexAt(x, y);
    if (ti >= 0) { g.farm.selectedCrop = ti; return; }
    const pi = plotIndexAt(x, y);
    if (pi >= 0) {
      const res = farmTap(g.farm, pi, Date.now());
      app.g.farm = res.farm;
      if (res.error === 'no_coins') { sfx('error'); toast('Không đủ xu!'); }
      else if (res.error === 'occupied') { sfx('error'); toast('Ô đã có cây!'); }
      else if (res.error === 'empty') { sfx('error'); toast('Ô trống!'); }
      else if (res.error === 'not_ready') { sfx('error'); toast('Chưa chín — tưới nước đã!'); }
      else if (res.crop) { sfx('harvest'); persist(); }
      else if (res.error == null) { sfx(res.farm.plots[pi] && res.farm.plots[pi].wateredAt ? 'water' : 'plant'); persist(); }
    }
    return;
  }

  if (g.state === STATES.SHOP) {
    e.preventDefault();
    if (y > 100) { // vùng dưới = nút bán
      const before = g.farm.coins;
      app.g.farm = sellAll(g.farm);
      persist();
      sfx(g.farm.coins > before ? 'sell' : 'error');
      toast(g.farm.coins > before ? `Bán xong +${g.farm.coins - before}🪙` : 'Kho trống!');
    } else { g.state = STATES.FARM; }
    return;
  }

  const midp = pointerToKey(g, x, y);
  if (midp === null) return;
  e.preventDefault();
  const before = g.state;
  app.g = handleKey(g, midp);
  if (app.g.state === STATES.FARM && before !== STATES.FARM && !app.g.farm) {
    app.g.farm = restore() || newFarm();
    musicToggle(true);
  }
}

/* ---------- boot ---------- */
async function boot() {
  await Promise.all([loadAll(), loadText()]);
  app.g = { state: STATES.SPLASH, menuIndex: 0, tick: 0 };

  canvasEl.addEventListener('keydown', onKeyDown);
  canvasEl.tabIndex = 0;
  canvasEl.addEventListener('pointerdown', onPointer);

  // debug hook cho E2E/test
  window.__gf3 = {
    app, STATES, KEY,
    handleKey: (k) => { app.g = handleKey(app.g, k); },
    enterFarm: () => {
      let guard = 5;
      while (app.g.state !== STATES.FARM && guard--) app.g = handleKey(app.g, KEY.FIRE);
      if (app.g.state === STATES.FARM && !app.g.farm) app.g.farm = restore() || newFarm();
    },
    forceReady: (i) => { const p = app.g.farm.plots[i]; if (p) p.wateredAt = Date.now() - 999999; },
    localStorage,
  };

  mountPhaserRuntime({
    canvas: canvasEl,
    width: SCREEN_W,
    height: SCREEN_H,
    tickMs: 120,
    onStepSimulation() {
      app.g = stepTick(app.g);
    },
    onFrameInterpolate() { return false; },
    onRenderFrame(ctx) {
      renderFrame(ctx, app.g);
    },
  });
}

if (typeof window !== 'undefined') {
  boot();
}
