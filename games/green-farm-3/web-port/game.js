/**
 * Green Farm 3 1:1 web port powered by decoded /5 world BSprites, /7 UI BSprites,
 * /9 config tables (crops, trees, animals, 19 buildings, 83 recipes, 63 decor,
 * 10 neighbors, 15 collectibles, 20 quests), /10 58x58 world map, and EN text packs.
 */
import { mountPhaserRuntime } from './phaser-engine.js';
import { decodeBSpriteBlock, loadSplitPack, moduleToCanvasImage, readPackBlock } from './bsprite-loader.js';
import { drawBSpriteBlockAnim, drawBSpriteBlockFrame, drawBSpriteFrame, drawBSpriteTileMap, drawOriginalUIScreen, withMIDPClip } from './render-original.js';
import { loadOriginalWorldResources } from './gf3-resource-loader.js';
import {
  SCREEN_W, SCREEN_H, KEY, SOURCE_VIEW, LAND_ZONES, advanceEvidenceView, mapKeyCode,
  createFarmSession, stepFarmSession, buyAnimal, sellGood,
  sellAllGoods, claimQuestReward, serializeFarmSession, restoreFarmSession,
  xpForNextLevel, sourceFrame, sourceText, sourceTileAt,
  setFarmerWalkTarget, moveFarmerByVector,
  buyLandZone, startKitchenRecipe, collectKitchenDish, repairManorRoom,
  upgradeBarn, claimMail, helpNeighbor, sellCollectible, collectOrFeedAnimal,
} from './gf-core.js';

const SAVE_KEY = 'gf3-farm-save-v4';
const canvasEl = typeof document !== 'undefined' ? document.getElementById('game') : null;
const IMG = {};
const SPRITES = { icon: 'assets/icon.png' };
let sourceWorld = null;
let sourcePack5 = null;
let sourcePack7 = null;
let sourceTileSprite = null;
let sourceTileImages = null;
let sourceOpeningFrame = null;
let textData = null;
let app = null;
let audioElement = null;
let previousFrameAt = 0;
const spriteBlockCache = new Map();
const uiSpriteCache = new Map();

function getSpriteBlock(blockId, paletteIndex = 0) {
  if (!sourcePack5 || !Number.isInteger(blockId) || blockId < 0 || blockId >= 160) return null;
  const pal = Math.max(0, paletteIndex | 0);
  const key = `${blockId}:${pal}`;
  if (spriteBlockCache.has(key)) return spriteBlockCache.get(key);
  let entry = null;
  try {
    const raw = readPackBlock(sourcePack5, blockId);
    let sprite;
    try {
      sprite = decodeBSpriteBlock(raw, { paletteIndex: pal });
    } catch {
      sprite = decodeBSpriteBlock(raw, { paletteIndex: 0 });
    }
    const moduleImages = sprite.moduleImages.map(moduleToCanvasImage);
    entry = { sprite, moduleImages };
  } catch {
    entry = null;
  }
  spriteBlockCache.set(key, entry);
  return entry;
}

function getUiSpriteBlock(blockId, paletteIndex = 0) {
  if (!sourcePack7 || !Number.isInteger(blockId) || blockId < 0 || blockId >= 123) return null;
  const pal = Math.max(0, paletteIndex | 0);
  const key = `${blockId}:${pal}`;
  if (uiSpriteCache.has(key)) return uiSpriteCache.get(key);
  let entry = null;
  try {
    const raw = readPackBlock(sourcePack7, blockId);
    let sprite;
    try {
      sprite = decodeBSpriteBlock(raw, { paletteIndex: pal });
    } catch {
      sprite = decodeBSpriteBlock(raw, { paletteIndex: 0 });
    }
    const moduleImages = sprite.moduleImages.map(moduleToCanvasImage);
    entry = { sprite, moduleImages };
  } catch {
    entry = null;
  }
  uiSpriteCache.set(key, entry);
  return entry;
}

// Port of a.java:9894: s < 1000 -> pack /7 (UI), s >= 1000 -> pack /5 (world)
function getAnySpriteBlock(spriteId, paletteIndex = 0) {
  if (spriteId < 1000) return getUiSpriteBlock(spriteId, paletteIndex);
  return getSpriteBlock(spriteId - 1000, paletteIndex);
}

const uiScreenCache = new Map();
function getUIScreen(screenId) {
  if (uiScreenCache.has(screenId)) return uiScreenCache.get(screenId);
  const widgets = sourceWorld?.uiScreen ? sourceWorld.uiScreen(screenId) : [];
  uiScreenCache.set(screenId, widgets);
  return widgets;
}

function loadImage(name, source) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve([name, image]);
    image.onerror = () => resolve([name, null]);
    image.src = source;
  });
}

// Port of a.java:1853-1865, a.java:1979-1985, a.java:2144-2169, e.java:2981-2997.
async function loadOriginalResources() {
  sourceWorld = await loadOriginalWorldResources({ textData });
  sourcePack5 = await loadSplitPack(new URL('assets/packs/5/5', import.meta.url).href);
  try {
    sourcePack7 = await loadSplitPack(new URL('assets/packs/7/7', import.meta.url).href);
  } catch {
    sourcePack7 = null;
  }
  sourceTileSprite = decodeBSpriteBlock(readPackBlock(sourcePack5, 0));
  sourceTileImages = sourceTileSprite.moduleImages.map(moduleToCanvasImage);

  const openingPackSprite = decodeBSpriteBlock(readPackBlock(sourcePack5, 100));
  const openingRecord = JSON.parse(await (await fetch(
    new URL('assets/sprites/source-frames/pack5-b100-f0.json', import.meta.url),
  )).text());
  if (openingRecord.block !== 100 || openingRecord.frame !== 0) {
    throw new Error('Opening frame manifest has an unexpected numeric source ID');
  }
  const frame = openingPackSprite.frames[openingRecord.frame];
  const frameModules = openingPackSprite.fmodules.slice(frame.firstFmodule, frame.firstFmodule + frame.fmoduleCount);
  if (frameModules.length !== openingRecord.frame_module_count) {
    throw new Error('Opening /10-/9-/5 join disagrees with decoded source frame');
  }
  const moduleImages = new Map();
  openingPackSprite.moduleImages.forEach((image, index) => {
    if (image) moduleImages.set(`5_b100_m${String(index).padStart(2, '0')}.png`, moduleToCanvasImage(image));
  });
  sourceOpeningFrame = {
    frame_modules: frameModules.map((part) => ({
      module_png: `5_b100_m${String(part.moduleIndex).padStart(2, '0')}.png`,
      flags: part.flags,
      offset_x: part.offsetX,
      offset_y: part.offsetY,
      module: {
        type: openingPackSprite.modules[part.moduleIndex].type,
        w: openingPackSprite.modules[part.moduleIndex].width,
        h: openingPackSprite.modules[part.moduleIndex].height,
      },
    })),
    frame_bounds: openingPackSprite.bounds[0],
  };
  return moduleImages;
}

async function bootAssets() {
  const images = await Promise.all(Object.entries(SPRITES).map(([name, source]) => loadImage(name, source)));
  for (const [name, image] of images) IMG[name] = image;
  const response = await fetch(new URL('assets/text/en.json', import.meta.url));
  if (!response.ok) throw new Error(`Cannot load recovered EN text (${response.status})`);
  textData = await response.json();
  IMG.openingModules = await loadOriginalResources();
}

function drawText(ctx, value, x, y, { align = 'left', size = 8, color = '#ffffff', bold = false, maxWidth } = {}) {
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.font = `${bold ? 'bold ' : ''}${size}px sans-serif`;
  if (maxWidth) ctx.fillText(String(value ?? ''), x, y, maxWidth);
  else ctx.fillText(String(value ?? ''), x, y);
}

function saveSession() {
  if (!app?.session) return;
  try {
    localStorage.setItem(SAVE_KEY, serializeFarmSession(app.session));
  } catch { /* ignore */ }
}

// Port of a.java:17555-17589 (opening story dialogue from /10 block 15)
function renderOpeningEvidence(ctx) {
  ctx.fillStyle = '#0e160d';
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  drawBSpriteFrame(ctx, sourceOpeningFrame, IMG.openingModules, 0, 0);
  const event = app.session.dialogue[app.session.dialogueIndex];
  const copy = event ? sourceText(textData, event.textId) : '';
  ctx.fillStyle = 'rgba(15, 24, 14, 0.88)';
  ctx.fillRect(4, 246, SCREEN_W - 8, 68);
  ctx.strokeStyle = '#9cff7b';
  ctx.strokeRect(4.5, 246.5, SCREEN_W - 9, 67);
  const words = String(copy).split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (test.length > 36) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  lines.slice(0, 4).forEach((ln, i) => {
    drawText(ctx, ln, 10, 260 + i * 13, { size: 9, color: '#f4f8ec' });
  });
  drawText(ctx, 'Chạm hoặc Enter để tiếp tục ▶', SCREEN_W - 8, 309, { align: 'right', size: 8, color: '#ffd84d', bold: true });
}

const KEY_BUILDING_LABELS = Object.freeze({
  2: 'Nhà bếp',
  10: 'Kho thóc',
  11: 'Chuồng gà',
  12: 'Chuồng thú',
  13: 'Tháp chứa',
  15: 'Hòm thư',
  17: 'Ao',
});

// Port of a.java:1853-1865, a.java:1881-1991, a.java:9553-9621 (a.M(1)), e.java:1710-1744 & i.java:315-350
function renderFarmWorld(ctx) {
  ctx.fillStyle = '#2d4c1e';
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  const s = app.session;
  const tm = sourceWorld?.tileMap;
  const viewY = 0;
  const viewH = SCREEN_H;
  if (tm && sourceTileSprite && sourceTileImages) {
    drawBSpriteTileMap(ctx, tm, sourceTileSprite, sourceTileImages, {
      x: 0,
      y: viewY,
      width: SCREEN_W,
      height: viewH,
      cameraX: s.cameraX,
      cameraY: s.cameraY,
    });
  }

  const tw = tm?.tileWidth || 36;
  const th = tm?.tileHeight || 18;
  const ox = -s.cameraX;
  const oy = viewY - s.cameraY;
  const tick = s.frame || 0;
  const clearedSet = new Set(s.clearedDebris || []);

  withMIDPClip(ctx, 0, viewY, SCREEN_W, viewH, () => {
    // Pass 1: Original tilled soil plots (/5 block 6 — e.java:1744)
    const soilEntry = getSpriteBlock(6, 0);
    for (const plot of s.plots.values()) {
      const wx = plot.worldX ?? (plot.col * tw + (tw >> 1));
      const wy = plot.worldY ?? (plot.row * th + (th >> 1));
      const sx = wx + ox;
      const sy = wy + oy;
      if (sx < -64 || sy < viewY - 48 || sx > SCREEN_W + 64 || sy > viewY + viewH + 48) continue;
      if (soilEntry) drawBSpriteBlockFrame(ctx, soilEntry.sprite, soilEntry.moduleImages, 0, sx, sy, 0);
    }

    // Pass 2: Y-sorted world entities, buildings, decor, fruit trees, Farmer, crops & animals
    const drawList = [];

    for (const ent of sourceWorld?.farmEntities || []) {
      if (ent.category === 49 || ent.category === 54 || ent.category === 52) continue;
      if (ent.category === 42 && ent.entityId === -1) continue;
      if (ent.category === 48 && clearedSet.has(ent.opaqueKey)) continue;
      const sx = ent.x + ox;
      const sy = ent.y + oy;
      if (sx < -140 || sy < viewY - 140 || sx > SCREEN_W + 140 || sy > viewY + viewH + 140) continue;
      drawList.push({
        sortY: ent.y + (ent.layer >= 14 ? 40 : 0),
        draw: () => {
          const entry = getSpriteBlock(ent.block, ent.paletteIndex);
          if (!entry) return;
          if (ent.useAnim && entry.sprite.animations?.length > 0) {
            drawBSpriteBlockAnim(ctx, entry.sprite, entry.moduleImages, 0, tick, sx, sy, 0);
          } else {
            drawBSpriteBlockFrame(ctx, entry.sprite, entry.moduleImages, ent.frame, sx, sy, 0);
          }
          // Subtle interactive badges on key buildings (Nhà bếp, Kho thóc, Hòm thư...)
          if (ent.category === 50 && KEY_BUILDING_LABELS[ent.entityId]) {
            const label = KEY_BUILDING_LABELS[ent.entityId];
            let badge = label;
            if (ent.entityId === 2 && (s.kitchenQueue || []).some(j => j.ready)) badge = '🍳 Xong!';
            else if (ent.entityId === 15 && (s.neighborMail || []).some(m => !m.claimed)) badge = '✉️ Thư mới';
            ctx.fillStyle = 'rgba(18, 30, 14, 0.72)';
            ctx.fillRect(sx - 24, sy - 32, 48, 11);
            drawText(ctx, badge, sx, sy - 24, { align: 'center', size: 7, color: '#fff7c2', bold: true });
          }
        },
      });
    }

    // Player-placed Decorations (/9[4])
    for (const dec of s.placedDecor || []) {
      const sx = dec.worldX + ox;
      const sy = dec.worldY + oy;
      if (sx < -80 || sy < viewY - 80 || sx > SCREEN_W + 80 || sy > viewY + viewH + 80) continue;
      drawList.push({
        sortY: dec.worldY,
        draw: () => {
          const entry = getSpriteBlock(dec.worldBlock, dec.paletteIndex || 0);
          if (entry) drawBSpriteBlockFrame(ctx, entry.sprite, entry.moduleImages, dec.frame || 0, sx, sy, 0);
        },
      });
    }

    // Live Fruit Trees (cat 52)
    for (const tree of s.fruitTrees || []) {
      const sx = tree.worldX + ox;
      const sy = tree.worldY + oy;
      if (sx < -100 || sy < viewY - 100 || sx > SCREEN_W + 100 || sy > viewY + viewH + 100) continue;
      drawList.push({
        sortY: tree.worldY,
        draw: () => {
          const entry = getSpriteBlock(tree.worldBlock, 0);
          if (entry) drawBSpriteBlockFrame(ctx, entry.sprite, entry.moduleImages, tree.ready ? 1 : 0, sx, sy, 0);
          if (tree.ready) drawText(ctx, '★', sx + 10, sy - 22, { size: 9, color: '#ffd84d', bold: true });
        },
      });
    }

    // Live Player Farmer (/5 block 2 — e.java:1107-1176)
    if (s.farmer) {
      const fx = s.farmer.x + ox;
      const fy = s.farmer.y + oy;
      if (s.farmer.state === 'walk' && !s.farmer.directControl) {
        const tx = s.farmer.targetX + ox;
        const ty = s.farmer.targetY + oy;
        ctx.strokeStyle = 'rgba(255, 245, 90, 0.85)';
        ctx.beginPath();
        ctx.moveTo(tx, ty - 5); ctx.lineTo(tx + 10, ty); ctx.lineTo(tx, ty + 5); ctx.lineTo(tx - 10, ty);
        ctx.closePath(); ctx.stroke();
      }
      drawList.push({
        sortY: s.farmer.y + 3,
        draw: () => {
          const entry = getSpriteBlock(2, 0);
          if (!entry) return;
          const flipFlag = s.farmer.hFlip ? 1 : 0;
          const animTick = s.farmer.state === 'idle' ? Math.floor(tick * 0.4) : tick;
          drawBSpriteBlockAnim(ctx, entry.sprite, entry.moduleImages, s.farmer.anim, animTick, fx, fy, flipFlag);
        },
      });
    }

    // Live Growing & Ready Crops (/5[crop.worldBlock])
    for (const plot of s.plots.values()) {
      if (!plot.cropId || plot.stage === 'tilled') continue;
      const wx = plot.worldX ?? (plot.col * tw + (tw >> 1));
      const wy = plot.worldY ?? (plot.row * th + (th >> 1));
      const sx = wx + ox;
      const sy = wy + oy;
      if (sx < -64 || sy < viewY - 64 || sx > SCREEN_W + 64 || sy > viewY + viewH + 64) continue;
      const crop = s.catalog?.crops?.find(c => c.id === plot.cropId);
      const cropBlock = crop?.worldBlock ?? 76;
      const ratio = plot.growMs > 0 ? (plot.progressMs / plot.growMs) : 1;
      const frameIdx = plot.stage === 'ready' ? 2 : (ratio >= 0.5 ? 1 : 0);
      drawList.push({
        sortY: wy + 1,
        draw: () => {
          const entry = getSpriteBlock(cropBlock, 0);
          if (entry) drawBSpriteBlockFrame(ctx, entry.sprite, entry.moduleImages, frameIdx, sx, sy, 0);
          if (plot.stage === 'ready') drawText(ctx, '★', sx + 10, sy - 10, { size: 9, color: '#ffd84d', bold: true });
          else if (plot.watered) drawText(ctx, '💧', sx + 9, sy - 8, { size: 7, color: '#7dd3fc' });
        },
      });
    }

    // Live Farm Animals (/5[animal.worldBlock] with exact paletteIndex)
    for (const a of s.animals) {
      const wx = a.worldX ?? (a.col * tw + (tw >> 1));
      const wy = a.worldY ?? (a.row * th + (th >> 1));
      const sx = wx + ox;
      const sy = wy + oy;
      if (sx < -80 || sy < viewY - 80 || sx > SCREEN_W + 80 || sy > viewY + viewH + 80) continue;
      const spec = s.catalog?.animals?.find(item => item.id === a.animalId);
      const animalBlock = a.worldBlock ?? spec?.worldBlock ?? 8;
      const animalPal = a.paletteIndex ?? spec?.paletteIndex ?? 0;
      const idleFrame = a.idleFrame ?? spec?.idleFrame ?? 0;
      drawList.push({
        sortY: wy + 2,
        draw: () => {
          const entry = getSpriteBlock(animalBlock, animalPal);
          if (entry) {
            if (entry.sprite.animations?.length > 0) {
              drawBSpriteBlockAnim(ctx, entry.sprite, entry.moduleImages, 0, tick + a.uid * 7, sx, sy, 0);
            } else {
              drawBSpriteBlockFrame(ctx, entry.sprite, entry.moduleImages, idleFrame, sx, sy, 0);
            }
          }
          if (a.ready) drawText(ctx, '★', sx + 10, sy - 14, { size: 9, color: '#ffd84d', bold: true });
          else if (!a.fed) drawText(ctx, '!', sx + 10, sy - 14, { size: 9, color: '#ff6b6b', bold: true });
        },
      });
    }

    drawList.sort((a, b) => a.sortY - b.sortY);
    for (const item of drawList) item.draw();

    // Floating feedback popups
    for (const p of s.popups || []) {
      drawText(ctx, p.text, p.x + ox, p.y + oy, { align: 'center', size: 9, color: p.color || '#ffd84d', bold: true });
    }

    // Isometric diamond cursor
    const cx = s.cursorCol * tw + ox + (tw >> 1);
    const cy = s.cursorRow * th + oy + (th >> 1);
    ctx.strokeStyle = s.activeTool === 'place' ? '#58ff8a' : s.activeTool === 'plow' ? '#ffa94d' : '#fff55a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy - (th >> 1)); ctx.lineTo(cx + (tw >> 1), cy);
    ctx.lineTo(cx, cy + (th >> 1)); ctx.lineTo(cx - (tw >> 1), cy);
    ctx.closePath(); ctx.stroke();
    ctx.lineWidth = 1;
  });

  // 1:1 Original Green Farm 3 In-Game HUD from pack /6[1] + pack /7 (a.java:13154 a.M(1))
  const hudWidgets = getUIScreen(1);
  drawOriginalUIScreen(ctx, hudWidgets, getAnySpriteBlock, {
    filterWidget: (w) => {
      if (w.type !== 205) return false;
      // Top HUD bars (Level star, XP bar, Coins pill, Cash pill, Quest icon) + bottom-left/right softkey buttons
      // Exclude conditional seed-carousel slots (spr 9), vertical progress bar (spr 31), and timer spinner (spr 1)
      if (w.y < 60 && w.spriteId !== 31) return true;
      return w.index === 52 || w.index === 63 || w.index === 67;
    },
  });

  // Live dynamic values aligned to exact /6[1] text widget coordinates (widgets [27],[26],[17],[22],[40])
  const xpNeed = xpForNextLevel(s);
  drawText(ctx, `${s.level}`, 25, 19, { align: 'center', size: 9, color: '#fff8c8', bold: true });
  drawText(ctx, `${s.xp}/${xpNeed} XP`, 103, 17, { align: 'center', size: 8, color: '#ffffff', bold: true });
  drawText(ctx, `${s.coins}`, 57, 44, { align: 'center', size: 8, color: '#fff6b8', bold: true });
  drawText(ctx, `${s.cash}`, 157, 44, { align: 'center', size: 8, color: '#c6ffd0', bold: true });
  drawText(ctx, `⚡${s.energy}/${s.maxEnergy}`, 14, 60, { size: 8, color: '#ffe97d', bold: true });

  // Active tool / placement hint pill
  if (s.activeTool !== 'auto') {
    const toolNames = {
      plow: '⛏️ Cuốc: Chạm cỏ cày đất',
      clear: '🪓 Rìu: Chạm cỏ/đá để dọn',
      place: `📍 Chạm cỏ đặt ${s.placementItem?.spec?.name || ''} (Esc hủy)`,
    };
    ctx.fillStyle = 'rgba(59, 34, 13, 0.86)';
    ctx.fillRect(10, 64, SCREEN_W - 20, 15);
    ctx.strokeStyle = '#e8c47a';
    ctx.strokeRect(10.5, 64.5, SCREEN_W - 21, 14);
    drawText(ctx, toolNames[s.activeTool] || '', SCREEN_W / 2, 74, { align: 'center', size: 8, color: '#fff4c2', bold: true });
  }

  // Toast banner above bottom softkeys
  if (s.toast) {
    ctx.fillStyle = 'rgba(59, 34, 13, 0.9)';
    ctx.fillRect(6, SCREEN_H - 52, SCREEN_W - 12, 17);
    ctx.strokeStyle = '#e8c47a';
    ctx.strokeRect(6.5, SCREEN_H - 51.5, SCREEN_W - 13, 16);
    drawText(ctx, s.toast, SCREEN_W / 2, SCREEN_H - 41, { align: 'center', size: 8, color: '#fff7c2', maxWidth: SCREEN_W - 18 });
  }
}

// Port of a.java:9553-9621: draw real original Gameloft /6[screenId] wooden/parchment UI frame & header
function renderPanelList(ctx, title, subtitle, rows, cursorIdx, footer, tabBar = null, screenId = 2) {
  ctx.fillStyle = '#3c2512';
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

  // Draw the authentic original Gameloft /6[screenId] parchment frame (/7[22]), header ribbon (/7[33]),
  // and bottom wooden softkey buttons (/7[12])
  const screenWidgets = getUIScreen(screenId);
  drawOriginalUIScreen(ctx, screenWidgets, getAnySpriteBlock, {
    filterWidget: (w) => {
      if (w.type !== 205) return false;
      return w.spriteId === 22 || w.spriteId === 33 || w.spriteId === 12;
    },
  });

  // Crisp wooden header plate over top banner for guaranteed contrast on all /6 screens
  ctx.fillStyle = 'rgba(74, 42, 16, 0.9)';
  ctx.fillRect(10, 4, SCREEN_W - 20, 30);
  ctx.strokeStyle = '#d4a259';
  ctx.strokeRect(10.5, 4.5, SCREEN_W - 21, 29);
  drawText(ctx, title, SCREEN_W / 2, 16, { align: 'center', size: 9, color: '#fff7d1', bold: true });
  drawText(ctx, subtitle, SCREEN_W / 2, 29, { align: 'center', size: 7, color: '#ffe8a3', bold: true, maxWidth: SCREEN_W - 26 });

  let listTop = 44;
  if (tabBar && tabBar.length > 0) {
    const tw = Math.floor((SCREEN_W - 20) / tabBar.length);
    tabBar.forEach((t, i) => {
      const tx = 10 + i * tw;
      ctx.fillStyle = t.active ? 'rgba(139, 78, 28, 0.92)' : 'rgba(232, 206, 152, 0.85)';
      ctx.fillRect(tx + 1, 36, tw - 2, 16);
      ctx.strokeStyle = t.active ? '#ffd84d' : '#7a4b1f';
      ctx.strokeRect(tx + 1.5, 36.5, tw - 3, 15);
      drawText(ctx, t.label, tx + tw / 2, 47, { align: 'center', size: 8, color: t.active ? '#fff8d4' : '#4a290c', bold: true });
    });
    listTop = 58;
  }

  const maxVisible = tabBar ? 8 : 9;
  const rowH = 26;
  const start = Math.max(0, Math.min(Math.max(0, rows.length - maxVisible), cursorIdx - Math.floor(maxVisible / 2)));
  for (let i = 0; i < maxVisible && start + i < rows.length; i += 1) {
    const idx = start + i;
    const item = rows[idx];
    const y = listTop + i * rowH;
    // Warm Gameloft parchment row card over the original /7[22] parchment background
    ctx.fillStyle = idx === cursorIdx ? 'rgba(255, 240, 178, 0.92)' : 'rgba(247, 232, 194, 0.78)';
    ctx.fillRect(10, y, SCREEN_W - 20, rowH - 3);
    ctx.strokeStyle = idx === cursorIdx ? '#c46c17' : '#9c6e3b';
    ctx.strokeRect(10.5, y + 0.5, SCREEN_W - 21, rowH - 4);
    let textX = 15;
    if (item.spriteBlock != null) {
      const entry = getSpriteBlock(item.spriteBlock, item.paletteIndex || 0);
      if (entry) {
        withMIDPClip(ctx, 12, y + 2, 22, 19, () => {
          drawBSpriteBlockFrame(ctx, entry.sprite, entry.moduleImages, item.spriteFrame ?? 0, 23, y + 17, 0);
        });
        textX = 37;
      }
    }
    drawText(ctx, item.left, textX, y + 14, { size: 8, color: item.locked ? '#8a7356' : '#3a1f08', bold: idx === cursorIdx, maxWidth: 162 - textX });
    const priceCol = item.rightColor === '#ff7b70' ? '#b3281d' : item.rightColor === '#9cff7b' ? '#1c6b1c' : '#7a3f06';
    drawText(ctx, item.right, SCREEN_W - 14, y + 14, { align: 'right', size: 8, color: priceCol, bold: true });
  }

  // Footer text over the original /7[12] wooden softkey strip
  ctx.fillStyle = 'rgba(59, 34, 13, 0.85)';
  ctx.fillRect(28, SCREEN_H - 22, SCREEN_W - 56, 17);
  drawText(ctx, footer, SCREEN_W / 2, SCREEN_H - 10, { align: 'center', size: 7, color: '#fff7d1', bold: true });
}

function getShopItems(s) {
  if (s.shopTab === 'crops') return s.catalog.crops.filter(c => c.id !== 3000 && !c.isTree);
  if (s.shopTab === 'trees') return s.catalog.crops.filter(c => c.isTree);
  if (s.shopTab === 'animals') return s.catalog.animals;
  if (s.shopTab === 'land') return LAND_ZONES;
  return s.catalog.decorations || [];
}

function renderShop(ctx) {
  const s = app.session;
  const tabDefs = [
    { id: 'crops', label: 'HẠT' },
    { id: 'trees', label: 'CÂY' },
    { id: 'animals', label: 'THÚ' },
    { id: 'land', label: 'ĐẤT' },
    { id: 'decor', label: 'ĐỒ' },
  ].map(t => ({ ...t, active: s.shopTab === t.id }));

  const list = getShopItems(s);
  const rows = list.map((it) => {
    if (s.shopTab === 'land') {
      const owned = (s.unlockedZones || []).includes(it.id);
      return {
        left: `${it.name} (Lv.${it.unlockLevel})`,
        right: owned ? 'ĐÃ MUA' : `${it.cost} Xu`,
        locked: !owned && s.level < it.unlockLevel,
        rightColor: owned ? '#9cff7b' : (s.coins >= it.cost ? '#ffd84d' : '#ff7b70'),
      };
    }
    const locked = (it.unlockLevel || 1) > s.level;
    return {
      left: `${it.name}${it.unlockLevel > 1 ? ` (Lv.${it.unlockLevel})` : ''}`,
      right: `${it.buyPrice} Xu`,
      locked,
      rightColor: s.coins >= it.buyPrice ? '#ffd84d' : '#ff7b70',
      spriteBlock: it.worldBlock,
      spriteFrame: s.shopTab === 'crops' ? 2 : s.shopTab === 'trees' ? 1 : (it.idleFrame ?? it.frame ?? 0),
      paletteIndex: it.paletteIndex ?? 0,
    };
  });
  renderPanelList(ctx, 'CỬA HÀNG NÔNG TRẠI', `Xu: ${s.coins} · Cấp: ${s.level}`, rows, s.shopCursor, 'Chạm mua · Q: Đổi tab · Esc: Đóng', tabDefs, 2);
}

function renderSeedPicker(ctx) {
  const s = app.session;
  const crops = s.catalog.crops.filter(c => c.id !== 3000 && !c.isTree);
  const rows = crops.map((c) => ({
    left: `${c.name} (${c.growSec}s · Lv.${c.unlockLevel})`,
    right: `${c.buyPrice} Xu`,
    locked: s.level < c.unlockLevel,
    rightColor: s.coins >= c.buyPrice ? '#9cff7b' : '#ff7b70',
    spriteBlock: c.worldBlock,
    spriteFrame: 2,
  }));
  renderPanelList(ctx, 'CHỌN HẠT GIỐNG', `Xu: ${s.coins} · Cấp: ${s.level}`, rows, s.panelCursor, 'Chạm hạt giống để trồng · Esc: Đóng', null, 22);
}

function renderBarn(ctx) {
  const s = app.session;
  const items = [...s.inventory.values()];
  const totalQty = items.reduce((a, b) => a + b.qty, 0);
  const upCost = 150 + Math.floor((s.barnCapacity - 40) * 10);
  const rows = [
    { left: `⬆ Nâng cấp Kho thóc (+20 chỗ)`, right: `${upCost} Xu`, rightColor: s.coins >= upCost ? '#9cff7b' : '#ff7b70' },
    ...(items.length > 0
      ? items.map(it => ({ left: `${it.name} ×${it.qty}`, right: `Bán +${it.sellPrice * it.qty}G` }))
      : [{ left: 'Kho đang trống — hãy thu hoạch cây/thú!', right: '0G' }]),
  ];
  renderPanelList(ctx, `KHO THÓC (${totalQty}/${s.barnCapacity})`, `Xu: ${s.coins} · Nông sản & thành phẩm`, rows, s.barnCursor, 'Chạm bán · Q: Bán hết · Esc: Đóng', null, 8);
}

function renderKitchen(ctx) {
  const s = app.session;
  const queueRows = (s.kitchenQueue || []).map(j => ({
    left: j.ready ? `✅ ${j.name} (XONG!)` : `⏳ ${j.name} (${Math.ceil((j.cookMs - j.progressMs) / 1000)}s)`,
    right: j.ready ? 'NHẬN' : 'ĐANG NẤU',
    rightColor: j.ready ? '#9cff7b' : '#ffd84d',
  }));
  const recipeRows = (s.catalog.recipes || []).slice(0, 40).map((r) => {
    const canCook = s.level >= r.unlockLevel && r.ingredients.every(ing => (s.inventory.get(ing.goodId)?.qty || 0) >= ing.qty);
    const ingStr = r.ingredients.map(i => `${i.name}×${i.qty}`).join('+');
    return {
      left: `${r.name} (${ingStr || 'Miễn phí'})`,
      right: s.level < r.unlockLevel ? `Lv.${r.unlockLevel}` : canCook ? 'NẤU' : 'Thiếu NL',
      locked: !canCook,
      rightColor: canCook ? '#9cff7b' : '#ff9f70',
    };
  });
  renderPanelList(ctx, 'NHÀ BẾP — CHẾ BIẾN', `Đang nấu: ${s.kitchenQueue?.length || 0}/4 · Cấp: ${s.level}`, [...queueRows, ...recipeRows], s.panelCursor, 'Chạm món để nấu · Esc: Đóng', null, 3);
}

function renderManor(ctx) {
  const s = app.session;
  const rooms = (s.catalog.buildings || []).filter(b => b.isManorRoom);
  const quickLinks = [
    { left: '⛏️ Cuốc cày ô đất mới (10G)', right: s.activeTool === 'plow' ? 'ĐANG BẬT' : 'CHỌN', rightColor: '#9cff7b' },
    { left: '🪓 Rìu dọn cỏ & đá (2⚡)', right: s.activeTool === 'clear' ? 'ĐANG BẬT' : 'CHỌN', rightColor: '#9cff7b' },
    { left: '🏚️ Kho thóc (Bán & Nâng cấp)', right: 'MỞ', rightColor: '#9cff7b' },
    { left: '🍳 Nhà bếp (83 công thức)', right: 'MỞ', rightColor: '#9cff7b' },
    { left: '🏺 Phòng sưu tập (15 cổ vật)', right: 'MỞ', rightColor: '#9cff7b' },
    { left: '✉️ Hòm thư & Đơn hàng', right: 'MỞ', rightColor: '#9cff7b' },
    { left: '🗺️ Mua đất mở rộng trang trại', right: `${s.unlockedZones?.length || 1}/6`, rightColor: '#ffd84d' },
  ];
  const roomRows = rooms.map((r) => {
    const done = !!s.unlockedRooms?.[r.entityId];
    const cost = Math.max(150, Math.min(5000, r.repairCost || 300));
    return {
      left: `🏛️ ${r.name}`,
      right: done ? 'ĐÃ SỬA' : `Sửa ${cost}G`,
      rightColor: done ? '#9cff7b' : (s.coins >= cost ? '#ffd84d' : '#ff7b70'),
      spriteBlock: r.worldBlock,
      spriteFrame: r.frame || 0,
    };
  });
  renderPanelList(ctx, 'MENU TRANG TRẠI & DINH THỰ', `Xu: ${s.coins} · Công cụ, Nhà & 9 Phòng`, [...quickLinks, ...roomRows], s.panelCursor, 'Chạm chọn · Esc: Đóng', null, 14);
}

function renderCoop(ctx) {
  const s = app.session;
  const isChicken = s.coopFilter === 'chicken';
  const animals = s.animals.filter(a => {
    const spec = s.catalog.animals.find(sp => sp.id === a.animalId);
    return isChicken ? (spec?.kind === 'chicken' || a.worldBlock === 8) : (spec?.kind !== 'chicken' && a.worldBlock !== 8);
  });
  const rows = [
    { left: `➕ Mua thêm ${isChicken ? 'Gà' : 'Vật nuôi'} tại Chợ`, right: 'MỞ CHỢ', rightColor: '#9cff7b' },
    ...animals.map(a => ({
      left: a.name,
      right: a.ready ? 'THU HOẠCH' : a.fed ? 'ĐANG LỚN' : 'CHO ĂN',
      rightColor: a.ready ? '#9cff7b' : !a.fed ? '#ff7b70' : '#ffd84d',
      spriteBlock: a.worldBlock,
      paletteIndex: a.paletteIndex,
      spriteFrame: a.idleFrame || 0,
    })),
  ];
  renderPanelList(ctx, isChicken ? 'CHUỒNG GÀ' : 'CHUỒNG THÚ', `Số lượng: ${animals.length}/${isChicken ? s.coopCapacity : s.shedCapacity}`, rows, s.panelCursor, 'Chạm thú để thu/cho ăn · Esc: Đóng', null, 22);
}

function renderMailbox(ctx) {
  const s = app.session;
  const rows = (s.neighborMail || []).map(m => ({
    left: `${m.from}: ${m.subject}`,
    right: m.claimed ? 'ĐÃ NHẬN' : m.kind === 'gift' ? `NHẬN +${m.giftCoins}G` : `GIAO +${m.giftCoins}G`,
    rightColor: m.claimed ? '#889483' : '#9cff7b',
  }));
  renderPanelList(ctx, 'HÒM THƯ & ĐƠN HÀNG', `Xu: ${s.coins} · Quà & đơn hàng`, rows, s.panelCursor, 'Chạm thư để nhận/giao · Esc: Đóng', null, 15);
}

function renderCollections(ctx) {
  const s = app.session;
  const rows = (s.catalog.collectibles || []).map(c => {
    const qty = s.collections?.[c.id] || 0;
    return {
      left: `🏺 ${c.name} (Có: ${qty})`,
      right: qty > 0 ? `Bán +${c.sellPrice}G` : `Lv.${c.minLevel}`,
      locked: qty === 0,
      rightColor: qty > 0 ? '#9cff7b' : '#889483',
    };
  });
  renderPanelList(ctx, 'PHÒNG SƯU TẬP CỔ VẬT', 'Tìm 15 cổ vật khi thu hoạch & dọn đất!', rows, s.panelCursor, 'Chạm cổ vật để bán · Esc: Đóng', null, 9);
}

function renderQuestsOrNeighbors(ctx) {
  const s = app.session;
  const isNb = s.view === SOURCE_VIEW.NEIGHBORS;
  const tabDefs = [
    { id: 'quests', label: 'NHIỆM VỤ', active: !isNb },
    { id: 'neighbors', label: '10 HÀNG XÓM', active: isNb },
  ];
  if (isNb) {
    const rows = (s.catalog.neighbors || []).map(nb => {
      const done = !!s.helpedNeighbors?.[nb.id];
      return {
        left: `🏡 Trang trại ${nb.name}`,
        right: done ? 'ĐÃ GIÚP' : 'GIÚP (+45G)',
        rightColor: done ? '#889483' : '#9cff7b',
        spriteBlock: nb.worldBlock,
        spriteFrame: 0,
      };
    });
    renderPanelList(ctx, '10 HÀNG XÓM', `Năng lượng: ⚡${s.energy}/${s.maxEnergy}`, rows, s.panelCursor, 'Chạm để ghé giúp · Esc: Đóng', tabDefs, 15);
  } else {
    const rows = (s.quests || []).map(q => ({
      left: q.title,
      right: q.claimed ? 'ĐÃ NHẬN' : q.completed ? `NHẬN +${q.rewardCoins}G` : `${q.progress}/${q.targetCount}`,
      rightColor: q.completed && !q.claimed ? '#9cff7b' : '#ffd84d',
    }));
    renderPanelList(ctx, 'NHIỆM VỤ', `Xu: ${s.coins} · Cấp: ${s.level}`, rows, s.questCursor, 'Chạm NV xong để nhận · Esc: Đóng', tabDefs, 9);
  }
}

function renderFrame(ctx, now) {
  const timing = sourceFrame(previousFrameAt, now);
  previousFrameAt = timing.now;
  app.session.frame += 1;
  app.session.lastFrameAt = timing.now;
  const v = app.session.view;
  if (v === SOURCE_VIEW.OPENING_SCRIPT) renderOpeningEvidence(ctx);
  else if (v === SOURCE_VIEW.SHOP) renderShop(ctx);
  else if (v === SOURCE_VIEW.SEED_PICKER) renderSeedPicker(ctx);
  else if (v === SOURCE_VIEW.BARN) renderBarn(ctx);
  else if (v === SOURCE_VIEW.KITCHEN) renderKitchen(ctx);
  else if (v === SOURCE_VIEW.MANOR) renderManor(ctx);
  else if (v === SOURCE_VIEW.COOP) renderCoop(ctx);
  else if (v === SOURCE_VIEW.MAILBOX) renderMailbox(ctx);
  else if (v === SOURCE_VIEW.COLLECTIONS) renderCollections(ctx);
  else if (v === SOURCE_VIEW.QUESTS || v === SOURCE_VIEW.NEIGHBORS) renderQuestsOrNeighbors(ctx);
  else renderFarmWorld(ctx);
}

let dragState = null;

function clampCamera(s) {
  const tm = sourceWorld?.tileMap;
  const tw = tm?.tileWidth || 36;
  const th = tm?.tileHeight || 18;
  const mapW = (tm?.width || 58) * tw;
  const mapH = (tm?.height || 58) * th;
  const viewH = SCREEN_H - 56;
  s.cameraX = Math.max(0, Math.min(mapW - SCREEN_W, Math.round(s.cameraX)));
  s.cameraY = Math.max(288, Math.min(mapH - viewH, Math.round(s.cameraY)));
}

function onPointerDown(event) {
  if (!app?.session) return;
  const rect = canvasEl.getBoundingClientRect();
  const x = (event.clientX - rect.left) * (SCREEN_W / rect.width);
  const y = (event.clientY - rect.top) * (SCREEN_H / rect.height);
  const s = app.session;
  if (s.view === SOURCE_VIEW.WORLD_LAYER) {
    const onTopQuestBtn = x >= 198 && y <= 40;
    const onBottomLeftBtn = x <= 68 && y >= 274;
    const onBottomRightBtn = x >= 192 && y >= 274;
    if (!onTopQuestBtn && !onBottomLeftBtn && !onBottomRightBtn && y >= 48) {
      dragState = { pointerId: event.pointerId, startX: x, startY: y, camX: s.cameraX, camY: s.cameraY, dragged: false };
      try { canvasEl.setPointerCapture(event.pointerId); } catch { /* ignore */ }
      event.preventDefault();
      return;
    }
  }
  handleTap(x, y, event);
}

function onPointerMove(event) {
  if (!dragState || !app?.session || event.pointerId !== dragState.pointerId) return;
  const rect = canvasEl.getBoundingClientRect();
  const x = (event.clientX - rect.left) * (SCREEN_W / rect.width);
  const y = (event.clientY - rect.top) * (SCREEN_H / rect.height);
  const dx = x - dragState.startX;
  const dy = y - dragState.startY;
  if (Math.abs(dx) > 5 || Math.abs(dy) > 5) dragState.dragged = true;
  if (dragState.dragged) {
    app.session.cameraX = dragState.camX - dx;
    app.session.cameraY = dragState.camY - dy;
    clampCamera(app.session);
  }
}

function onPointerUp(event) {
  if (!dragState || event.pointerId !== dragState.pointerId) return;
  const wasDragged = dragState.dragged;
  const sx = dragState.startX;
  const sy = dragState.startY;
  dragState = null;
  if (!wasDragged) handleTap(sx, sy, event);
}

function handlePanelAction(s, idx) {
  const v = s.view;
  if (v === SOURCE_VIEW.SHOP) {
    const list = getShopItems(s);
    const item = list[idx];
    if (!item) return;
    if (s.shopTab === 'land') {
      buyLandZone(s, item.id);
      saveSession();
    } else if (s.shopTab === 'crops') {
      if (s.level >= item.unlockLevel) {
        s.selectedCropId = item.id;
        s.toast = `Đã chọn giống ${item.name} — chạm ô đất để gieo!`;
        s.toastMs = 2200;
        s.view = SOURCE_VIEW.WORLD_LAYER;
      } else {
        s.toast = `${item.name} mở khóa ở Cấp ${item.unlockLevel}!`;
        s.toastMs = 2000;
      }
    } else {
      // Enter Placement Mode right on the farm map for Trees, Animals & Decor!
      if ((item.unlockLevel || 1) > s.level) {
        s.toast = `${item.name} mở khóa ở Cấp ${item.unlockLevel}!`;
        s.toastMs = 2000;
        return;
      }
      if (s.coins < item.buyPrice) {
        s.toast = `Cần ${item.buyPrice} Xu để mua ${item.name}!`;
        s.toastMs = 2000;
        return;
      }
      const kind = s.shopTab === 'trees' ? 'tree' : s.shopTab === 'animals' ? 'animal' : 'decor';
      s.activeTool = 'place';
      s.placementItem = { kind, spec: item };
      s.view = SOURCE_VIEW.WORLD_LAYER;
      s.toast = `Chạm bãi cỏ để đặt ${item.name}!`;
      s.toastMs = 2600;
    }
  } else if (v === SOURCE_VIEW.SEED_PICKER) {
    const crops = s.catalog.crops.filter(c => c.id !== 3000 && !c.isTree);
    const crop = crops[idx];
    const target = s.seedPickerTarget;
    if (crop && target) {
      s.selectedCropId = crop.id;
      s.seedPickerTarget = null;
      s.view = SOURCE_VIEW.WORLD_LAYER;
      setFarmerWalkTarget(s, target.worldX, target.worldY + 4, {
        type: 'plant_seed', row: target.row, col: target.col, cropId: crop.id,
      });
      saveSession();
    }
  } else if (v === SOURCE_VIEW.BARN) {
    if (idx === 0) {
      upgradeBarn(s);
      saveSession();
    } else {
      const items = [...s.inventory.values()];
      const item = items[idx - 1];
      if (item) { sellGood(s, item.id, item.qty); saveSession(); }
    }
  } else if (v === SOURCE_VIEW.KITCHEN) {
    const qLen = s.kitchenQueue?.length || 0;
    if (idx < qLen) {
      const job = s.kitchenQueue[idx];
      if (job?.ready) { collectKitchenDish(s, job.uid); saveSession(); }
    } else {
      const recipe = (s.catalog.recipes || [])[idx - qLen];
      if (recipe) { startKitchenRecipe(s, recipe.id); saveSession(); }
    }
  } else if (v === SOURCE_VIEW.MANOR) {
    if (idx === 0) {
      s.activeTool = s.activeTool === 'plow' ? 'auto' : 'plow';
      s.placementItem = null;
      s.view = SOURCE_VIEW.WORLD_LAYER;
      s.toast = s.activeTool === 'plow' ? '⛏️ Đã bật Cuốc: chạm bãi cỏ để cày ô đất!' : '✋ Đã chuyển về chế độ Tay';
      s.toastMs = 2000;
    } else if (idx === 1) {
      s.activeTool = s.activeTool === 'clear' ? 'auto' : 'clear';
      s.placementItem = null;
      s.view = SOURCE_VIEW.WORLD_LAYER;
      s.toast = s.activeTool === 'clear' ? '🪓 Đã bật Rìu: chạm bụi cây/đá để dọn!' : '✋ Đã chuyển về chế độ Tay';
      s.toastMs = 2000;
    } else if (idx === 2) { s.barnCursor = 0; s.view = SOURCE_VIEW.BARN; }
    else if (idx === 3) { s.panelCursor = 0; s.view = SOURCE_VIEW.KITCHEN; }
    else if (idx === 4) { s.panelCursor = 0; s.view = SOURCE_VIEW.COLLECTIONS; }
    else if (idx === 5) { s.panelCursor = 0; s.view = SOURCE_VIEW.MAILBOX; }
    else if (idx === 6) { s.shopTab = 'land'; s.shopCursor = 0; s.view = SOURCE_VIEW.SHOP; }
    else {
      const rooms = (s.catalog.buildings || []).filter(b => b.isManorRoom);
      const room = rooms[idx - 7];
      if (room) { repairManorRoom(s, room.entityId); saveSession(); }
    }
  } else if (v === SOURCE_VIEW.COOP) {
    if (idx === 0) { s.shopTab = 'animals'; s.shopCursor = 0; s.view = SOURCE_VIEW.SHOP; }
    else {
      const isChicken = s.coopFilter === 'chicken';
      const list = s.animals.filter(a => {
        const spec = s.catalog.animals.find(sp => sp.id === a.animalId);
        return isChicken ? (spec?.kind === 'chicken' || a.worldBlock === 8) : (spec?.kind !== 'chicken' && a.worldBlock !== 8);
      });
      const animal = list[idx - 1];
      if (animal) { collectOrFeedAnimal(s, animal.uid); saveSession(); }
    }
  } else if (v === SOURCE_VIEW.MAILBOX) {
    const m = s.neighborMail?.[idx];
    if (m) { claimMail(s, m.id); saveSession(); }
  } else if (v === SOURCE_VIEW.COLLECTIONS) {
    const c = s.catalog.collectibles?.[idx];
    if (c) { sellCollectible(s, c.id); saveSession(); }
  } else if (v === SOURCE_VIEW.QUESTS) {
    const q = s.quests?.[idx];
    if (q) { claimQuestReward(s, q.id); saveSession(); }
  } else if (v === SOURCE_VIEW.NEIGHBORS) {
    const nb = s.catalog.neighbors?.[idx];
    if (nb) { helpNeighbor(s, nb.id); saveSession(); }
  }
}

function handleTap(x, y, event) {
  const s = app.session;
  if (s.view === SOURCE_VIEW.OPENING_SCRIPT) {
    app.session = advanceEvidenceView(s, KEY.FIRE);
    event.preventDefault();
    return;
  }

  // Any modal panel screen
  if (s.view !== SOURCE_VIEW.WORLD_LAYER) {
    // Tab bar click for SHOP or QUESTS/NEIGHBORS
    if (y >= 34 && y <= 52) {
      if (s.view === SOURCE_VIEW.SHOP) {
        const tabIds = ['crops', 'trees', 'animals', 'land', 'decor'];
        const tIdx = Math.max(0, Math.min(4, Math.floor((x - 4) / ((SCREEN_W - 8) / 5))));
        s.shopTab = tabIds[tIdx];
        s.shopCursor = 0;
        event.preventDefault();
        return;
      }
      if (s.view === SOURCE_VIEW.QUESTS || s.view === SOURCE_VIEW.NEIGHBORS) {
        s.view = x < SCREEN_W / 2 ? SOURCE_VIEW.QUESTS : SOURCE_VIEW.NEIGHBORS;
        s.panelCursor = 0;
        event.preventDefault();
        return;
      }
    }
    // Footer close / quick action
    if (y >= SCREEN_H - 26) {
      if (s.view === SOURCE_VIEW.BARN && x < SCREEN_W / 2) {
        sellAllGoods(s);
        saveSession();
      } else {
        s.view = SOURCE_VIEW.WORLD_LAYER;
      }
      event.preventDefault();
      return;
    }
    const hasTabs = s.view === SOURCE_VIEW.SHOP || s.view === SOURCE_VIEW.QUESTS || s.view === SOURCE_VIEW.NEIGHBORS;
    const listTop = hasTabs ? 58 : 42;
    const maxVisible = hasTabs ? 8 : 9;
    const rowIdx = Math.floor((y - listTop) / 26);
    if (rowIdx >= 0 && rowIdx < maxVisible) {
      const cur = s.view === SOURCE_VIEW.SHOP ? s.shopCursor
        : s.view === SOURCE_VIEW.BARN ? s.barnCursor
        : s.view === SOURCE_VIEW.QUESTS ? s.questCursor
        : s.panelCursor;
      const totalLen = s.view === SOURCE_VIEW.SHOP ? getShopItems(s).length
        : s.view === SOURCE_VIEW.KITCHEN ? ((s.kitchenQueue?.length || 0) + (s.catalog.recipes?.length || 0))
        : 30;
      const start = Math.max(0, Math.min(Math.max(0, totalLen - maxVisible), cur - Math.floor(maxVisible / 2)));
      handlePanelAction(s, start + rowIdx);
    }
    event.preventDefault();
    return;
  }

  // 1:1 Original /6[1] HUD button hit-zones matching exact Gameloft icon art (a.java:24523-24556):
  // Top-right Pause/Menu icon [41] (x=207, y=8) -> Menu Trang trại, Công cụ & Dinh thự
  if (x >= 198 && y <= 40) {
    s.panelCursor = 0;
    s.view = SOURCE_VIEW.MANOR;
    event.preventDefault();
    return;
  }
  // Bottom-left Clipboard/Quest icon [52]+[63] (x=5..68, y>=274) -> Nhiệm vụ & 10 Hàng xóm
  if (x <= 68 && y >= 274) {
    s.view = SOURCE_VIEW.QUESTS;
    event.preventDefault();
    return;
  }
  // Bottom-right Market Stand icon [67] (x>=192, y>=274) -> Cửa hàng 5 danh mục
  if (x >= 192 && y >= 274) {
    s.view = SOURCE_VIEW.SHOP;
    event.preventDefault();
    return;
  }

  // World interaction tap (full-bleed 240x320 viewport!)
  const wx = x + s.cameraX;
  const wy = y + s.cameraY;
  const hit = sourceTileAt(sourceWorld.tileMap, x, y, s.cameraX, s.cameraY);

  // Mode 1: Placement Mode (Fruit Tree / Animal / Decor)
  if (s.activeTool === 'place' && s.placementItem && hit) {
    setFarmerWalkTarget(s, wx, wy, { type: 'place', item: s.placementItem, row: hit.row, col: hit.column, worldX: wx, worldY: wy });
    saveSession();
    event.preventDefault();
    return;
  }

  // Mode 2: Plow Mode -> walk & plow new soil plot immediately
  if (s.activeTool === 'plow' && hit) {
    s.cursorRow = hit.row;
    s.cursorCol = hit.column;
    setFarmerWalkTarget(s, wx, wy, { type: 'tile', row: hit.row, col: hit.column, worldX: wx, worldY: wy });
    saveSession();
    event.preventDefault();
    return;
  }

  // Mode 3: Clear Debris Mode (cat 48)
  const clearedSet = new Set(s.clearedDebris || []);
  const hitDebris = (sourceWorld?.farmEntities || []).find(
    e => e.category === 48 && !clearedSet.has(e.opaqueKey) && Math.hypot(e.x - wx, e.y - wy) <= 22,
  );
  if (s.activeTool === 'clear' && hitDebris) {
    setFarmerWalkTarget(s, hitDebris.x, hitDebris.y + 8, {
      type: 'debris', opaqueKey: hitDebris.opaqueKey, worldX: hitDebris.x, worldY: hitDebris.y,
    });
    saveSession();
    event.preventDefault();
    return;
  }

  // Mode 4: Auto Interaction (Buildings -> Fruit Trees -> Animals -> Plots -> Debris -> Walk)
  // 4a. Check 19 Buildings (cat 50)
  const hitBuilding = (sourceWorld?.farmEntities || []).find(
    e => e.category === 50 && Math.hypot(e.x - wx, (e.y - 14) - wy) <= 32,
  );
  if (hitBuilding) {
    setFarmerWalkTarget(s, hitBuilding.x, hitBuilding.y + 18, { type: 'building', entityId: hitBuilding.entityId });
    event.preventDefault();
    return;
  }

  // 4b. Check Fruit Trees (cat 52)
  const hitTree = (s.fruitTrees || []).find(t => Math.hypot(t.worldX - wx, (t.worldY - 12) - wy) <= 22);
  if (hitTree && hitTree.ready) {
    setFarmerWalkTarget(s, hitTree.worldX, hitTree.worldY + 10, { type: 'tree', uid: hitTree.uid });
    event.preventDefault();
    return;
  }

  // 4c. Check Animals (cat 54)
  const hitAnimal = (s.animals || []).find(a => Math.hypot((a.worldX ?? a.col * 36 + 18) - wx, (a.worldY ?? a.row * 18 + 9) - wy) <= 22);
  if (hitAnimal) {
    const ax = hitAnimal.worldX ?? (hitAnimal.col * 36 + 18);
    const ay = hitAnimal.worldY ?? (hitAnimal.row * 18 + 9);
    setFarmerWalkTarget(s, ax, ay + 8, { type: 'animal', uid: hitAnimal.uid });
    event.preventDefault();
    return;
  }

  // 4d. Check Plots (cat 49) — empty tilled plots open Seed Picker!
  let hitPlot = null;
  let bestDist = 22;
  for (const plot of s.plots.values()) {
    const px = plot.worldX ?? (plot.col * 36 + 18);
    const py = plot.worldY ?? (plot.row * 18 + 9);
    const d = Math.hypot(px - wx, py - wy);
    if (d < bestDist) { bestDist = d; hitPlot = plot; }
  }
  if (hitPlot) {
    s.cursorRow = hitPlot.row;
    s.cursorCol = hitPlot.col;
    const px = hitPlot.worldX ?? (hitPlot.col * 36 + 18);
    const py = hitPlot.worldY ?? (hitPlot.row * 18 + 9);
    setFarmerWalkTarget(s, px, py + 6, {
      type: 'tile',
      row: hitPlot.row,
      col: hitPlot.col,
      worldX: px,
      worldY: py,
      openSeedPicker: hitPlot.stage === 'tilled',
    });
    saveSession();
    event.preventDefault();
    return;
  }

  // 4e. Debris tap
  if (hitDebris) {
    setFarmerWalkTarget(s, hitDebris.x, hitDebris.y + 8, {
      type: 'debris', opaqueKey: hitDebris.opaqueKey, worldX: hitDebris.x, worldY: hitDebris.y,
    });
    saveSession();
    event.preventDefault();
    return;
  }

  // 4f. Open grass tap -> walk Farmer there (double-tap plows new plot)
  if (hit) {
    const sameTile = (s.cursorRow === hit.row && s.cursorCol === hit.column);
    s.cursorRow = hit.row;
    s.cursorCol = hit.column;
    if (sameTile) {
      setFarmerWalkTarget(s, wx, wy, { type: 'tile', row: hit.row, col: hit.column, worldX: wx, worldY: wy });
    } else {
      setFarmerWalkTarget(s, wx, wy, null);
    }
  }
  event.preventDefault();
}

const heldKeys = new Set();
function onKeyUp(event) { heldKeys.delete(event.code); }

function getHeldMoveVector() {
  let vx = 0; let vy = 0;
  if (heldKeys.has('ArrowLeft') || heldKeys.has('KeyA')) vx -= 1;
  if (heldKeys.has('ArrowRight') || heldKeys.has('KeyD')) vx += 1;
  if (heldKeys.has('ArrowUp') || heldKeys.has('KeyW')) vy -= 1;
  if (heldKeys.has('ArrowDown') || heldKeys.has('KeyS')) vy += 1;
  return { vx, vy };
}

function onKeyDown(event) {
  if (!app?.session) return;
  const code = mapKeyCode(event.code, event.key);
  const s = app.session;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) {
    heldKeys.add(event.code);
  }
  if (s.view === SOURCE_VIEW.OPENING_SCRIPT) {
    const previous = app.session;
    app.session = advanceEvidenceView(s, code);
    if (previous !== app.session) event.preventDefault();
    return;
  }
  if (s.view !== SOURCE_VIEW.WORLD_LAYER) {
    if (code === KEY.SK_RIGHT) {
      s.view = SOURCE_VIEW.WORLD_LAYER;
      event.preventDefault();
    } else if (code === KEY.SK_LEFT) {
      if (s.view === SOURCE_VIEW.SHOP) {
        const order = ['crops', 'trees', 'animals', 'land', 'decor'];
        s.shopTab = order[(order.indexOf(s.shopTab) + 1) % order.length];
        s.shopCursor = 0;
      } else if (s.view === SOURCE_VIEW.BARN) {
        sellAllGoods(s); saveSession();
      } else if (s.view === SOURCE_VIEW.QUESTS) {
        s.view = SOURCE_VIEW.NEIGHBORS; s.panelCursor = 0;
      } else if (s.view === SOURCE_VIEW.NEIGHBORS) {
        s.view = SOURCE_VIEW.QUESTS;
      }
      event.preventDefault();
    } else if (code === KEY.UP || code === KEY.DOWN) {
      const delta = code === KEY.UP ? -1 : 1;
      if (s.view === SOURCE_VIEW.SHOP) {
        const len = Math.max(1, getShopItems(s).length);
        s.shopCursor = (s.shopCursor + delta + len) % len;
      } else if (s.view === SOURCE_VIEW.BARN) {
        const len = Math.max(1, s.inventory.size + 1);
        s.barnCursor = (s.barnCursor + delta + len) % len;
      } else if (s.view === SOURCE_VIEW.QUESTS) {
        const len = Math.max(1, s.quests?.length || 1);
        s.questCursor = (s.questCursor + delta + len) % len;
      } else {
        const len = s.view === SOURCE_VIEW.KITCHEN ? Math.max(1, (s.kitchenQueue?.length || 0) + 40) : 14;
        s.panelCursor = (s.panelCursor + delta + len) % len;
      }
      event.preventDefault();
    } else if (code === KEY.FIRE || code === 5) {
      const idx = s.view === SOURCE_VIEW.SHOP ? s.shopCursor
        : s.view === SOURCE_VIEW.BARN ? s.barnCursor
        : s.view === SOURCE_VIEW.QUESTS ? s.questCursor
        : s.panelCursor;
      handlePanelAction(s, idx);
      event.preventDefault();
    }
    return;
  }

  const tm = sourceWorld?.tileMap;
  if (code === KEY.UP || code === KEY.DOWN || code === KEY.LEFT || code === KEY.RIGHT) {
    const { vx, vy } = getHeldMoveVector();
    moveFarmerByVector(s, vx, vy, 55, tm);
    event.preventDefault();
    return;
  }
  if (code === KEY.SK_RIGHT && s.activeTool === 'place') {
    s.activeTool = 'auto';
    s.placementItem = null;
    event.preventDefault();
    return;
  }
  if (code === KEY.FIRE || code === 5) {
    const fx = s.farmer ? s.farmer.x : (s.cursorCol * 36 + 18);
    const fy = s.farmer ? s.farmer.y : (s.cursorRow * 18 + 9);
    const nearBuilding = (sourceWorld?.farmEntities || []).find(e => e.category === 50 && Math.hypot(e.x - fx, e.y - fy) <= 44);
    const nearTree = (s.fruitTrees || []).find(t => t.ready && Math.hypot(t.worldX - fx, t.worldY - fy) <= 34);
    const nearAnimal = (s.animals || []).find(a => Math.hypot((a.worldX ?? a.col * 36 + 18) - fx, (a.worldY ?? a.row * 18 + 9) - fy) <= 32);
    let nearPlot = null; let bestD = 32;
    for (const p of s.plots.values()) {
      const d = Math.hypot((p.worldX ?? p.col * 36 + 18) - fx, (p.worldY ?? p.row * 18 + 9) - fy);
      if (d < bestD) { bestD = d; nearPlot = p; }
    }
    if (nearPlot) {
      setFarmerWalkTarget(s, nearPlot.worldX ?? fx, (nearPlot.worldY ?? fy) + 4, {
        type: 'tile', row: nearPlot.row, col: nearPlot.col, worldX: nearPlot.worldX, worldY: nearPlot.worldY,
        openSeedPicker: nearPlot.stage === 'tilled',
      });
    } else if (nearTree) {
      setFarmerWalkTarget(s, nearTree.worldX, nearTree.worldY + 8, { type: 'tree', uid: nearTree.uid });
    } else if (nearAnimal) {
      setFarmerWalkTarget(s, nearAnimal.worldX ?? fx, (nearAnimal.worldY ?? fy) + 6, { type: 'animal', uid: nearAnimal.uid });
    } else if (nearBuilding) {
      setFarmerWalkTarget(s, nearBuilding.x, nearBuilding.y + 18, { type: 'building', entityId: nearBuilding.entityId });
    } else {
      setFarmerWalkTarget(s, fx, fy, { type: 'tile', row: s.cursorRow, col: s.cursorCol, worldX: fx, worldY: fy });
    }
    saveSession();
  } else if (code === KEY.SK_LEFT) {
    s.view = SOURCE_VIEW.SHOP;
  } else if (code === KEY.SK_RIGHT) {
    s.barnCursor = 0;
    s.view = SOURCE_VIEW.BARN;
  } else return;
  event.preventDefault();
}

function setAudioEnabled(enabled) {
  if (!audioElement) {
    audioElement = new Audio(new URL('assets/audio/gf3_b000.mid', import.meta.url));
    audioElement.loop = true;
  }
  if (enabled) audioElement.play().catch(() => {});
  else audioElement.pause();
}

if (typeof window !== 'undefined') {
  app = { session: null, audioEnabled: true };
  bootAssets().then(() => {
    let savedRaw = null;
    try { savedRaw = localStorage.getItem(SAVE_KEY); } catch { /* ignore */ }
    app.session = savedRaw
      ? restoreFarmSession(savedRaw, sourceWorld, textData)
      : createFarmSession(sourceWorld, textData);
    canvasEl.tabIndex = 0;
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', () => heldKeys.clear());
    canvasEl.addEventListener('pointerdown', onPointerDown);
    canvasEl.addEventListener('pointermove', onPointerMove);
    canvasEl.addEventListener('pointerup', onPointerUp);
    canvasEl.addEventListener('pointercancel', onPointerUp);
    window.addEventListener('keydown', (event) => {
      if (event.code === 'KeyM') {
        app.audioEnabled = !app.audioEnabled;
        setAudioEnabled(app.audioEnabled);
      }
    });
    window.__gf3 = { app, sourceWorld, saveSession };
    mountPhaserRuntime({
      canvas: canvasEl,
      width: SCREEN_W,
      height: SCREEN_H,
      tickMs: 50,
      onStepSimulation() {
        if (app.session?.view === SOURCE_VIEW.WORLD_LAYER) {
          const { vx, vy } = getHeldMoveVector();
          moveFarmerByVector(app.session, vx, vy, 50, sourceWorld?.tileMap);
        }
        stepFarmSession(app.session, 50, sourceWorld?.tileMap);
      },
      onFrameInterpolate() { return false; },
      onRenderFrame(ctx) { renderFrame(ctx, performance.now()); },
    });
  }).catch((error) => {
    console.error('Green Farm source resource load failed:', error);
    const status = document.getElementById('status');
    if (status) status.textContent = `Không thể đọc dữ liệu nguồn: ${error.message}`;
  });
}
