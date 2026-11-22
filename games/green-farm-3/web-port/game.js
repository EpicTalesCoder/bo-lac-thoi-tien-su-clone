/**
 * Green Farm 3 — web port Phase B (Phaser 3 pipeline, canvas 2D framebuffer).
 * Kiến trúc repo: sim tick 120ms (MIDP) + render mỗi rAF qua mountPhaserRuntime.
 * Logic thuần nằm ở gf-core.js (test được bằng Node); file này chỉ render/input.
 */
import { mountPhaserRuntime } from './phaser-engine.js';
import {
  SCREEN_W, SCREEN_H, KEY, STATES, MENU_ITEMS, TXT,
  mapKeyCode, handleKey, pointerToKey, menuRowAt, stepTick, text,
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
if (typeof window !== 'undefined') {
  app = {
    g: null,
    audioOn: true,
    bgMusic: null,
  };
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

function renderFarmPlaceholder(ctx, g) {
  drawBackground(ctx, '#274d2c');
  // ô đất lưới 4×4 phía trên — placeholder cho Phase C
  const cell = 36, gx = (SCREEN_W - 4 * cell) / 2, gy = 70;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      ctx.fillStyle = (r + c) % 2 ? '#6b4a2b' : '#7d5633';
      ctx.fillRect(gx + c * cell, gy + r * cell, cell - 4, cell - 4);
    }
  }
  drawIconCentered(ctx, IMG.tractor, 60, 250, 1.2);
  drawTextCenter(ctx, 'Nông trại — đang dựng (Phase C)', 285, '#ffd84d', '10px monospace');
  ctx.font = '9px monospace';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#8fa88f';
  ctx.fillText(text(TEXT_DATA, TXT.BACK) || 'Quay về', SCREEN_W - 8, 314);
}

function renderFrame(ctx, g) {
  switch (g.state) {
    case STATES.SPLASH: return renderSplash(ctx, g);
    case STATES.MENU: return renderMenu(ctx, g);
    case STATES.ABOUT: return renderSubPage(ctx, g, TXT.ABOUT, text(TEXT_DATA, { page: 0, idx: [0, 1, 3] }));
    case STATES.HELP: return renderSubPage(ctx, g, TXT.HELP, text(TEXT_DATA, { page: 0, idx: [4, 5, 6, 7] }));
    case STATES.OPTIONS: return renderSubPage(ctx, g, TXT.OPTIONS, 'NHẠC: BẬT\nHIỆU ỨNG: BẬT');
    case STATES.EXIT_CONFIRM: return renderSubPage(ctx, g, TXT.EXIT, text(TEXT_DATA, TXT.EXIT_CONFIRM));
    case STATES.FARM: return renderFarmPlaceholder(ctx, g);
    default: return drawBackground(ctx, '#111');
  }
}

/* ---------- input ---------- */
function onKeyDown(e) {
  if (!app) return;
  const midp = mapKeyCode(e.code, e.key);
  if (midp === null) return;
  e.preventDefault();
  app.g = handleKey(app.g, midp);
}

function onPointer(e) {
  if (!app) return;
  const rect = canvasEl.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (SCREEN_W / rect.width);
  const y = (e.clientY - rect.top) * (SCREEN_H / rect.height);
  const midp = pointerToKey(app.g, x, y);
  if (midp === null) return;
  e.preventDefault();
  app.g = handleKey(app.g, midp);
}

/* ---------- boot ---------- */
async function boot() {
  await Promise.all([loadAll(), loadText()]);
  app.g = { state: STATES.SPLASH, menuIndex: 0, tick: 0 };

  canvasEl.addEventListener('keydown', onKeyDown);
  canvasEl.tabIndex = 0;
  canvasEl.addEventListener('pointerdown', onPointer);

  // debug hook cho E2E/test
  window.__gf3 = { app, STATES, KEY, handleKey: (k) => { app.g = handleKey(app.g, k); } };

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
