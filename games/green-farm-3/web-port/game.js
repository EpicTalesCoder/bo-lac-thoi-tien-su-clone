/**
 * Green Farm 3 web port powered by decoded /5 BSprite, /9 config tables, /10 world map, and EN text packs.
 */
import { mountPhaserRuntime } from './phaser-engine.js';
import { decodeBSpriteBlock, loadSplitPack, moduleToCanvasImage, readPackBlock } from './bsprite-loader.js';
import { drawBSpriteBlockAnim, drawBSpriteBlockFrame, drawBSpriteFrame, drawBSpriteTileMap, withMIDPClip } from './render-original.js';
import { loadOriginalWorldResources } from './gf3-resource-loader.js';
import {
  SCREEN_W, SCREEN_H, KEY, SOURCE_VIEW, advanceEvidenceView, mapKeyCode,
  createFarmSession, stepFarmSession, interactAtFarmTile, buyAnimal, sellGood,
  sellAllGoods, claimQuestReward, serializeFarmSession, restoreFarmSession,
  xpForNextLevel, sourceFrame, sourceText, sourceTileAt,
} from './gf-core.js';

const SAVE_KEY = 'gf3-farm-save-v3';
const canvasEl = typeof document !== 'undefined' ? document.getElementById('game') : null;
const IMG = {};
const SPRITES = { icon: 'assets/icon.png' };
let sourceWorld = null;
let sourcePack5 = null;
let sourceTileSprite = null;
let sourceTileImages = null;
let sourceOpeningFrame = null;
let textData = null;
let app = null;
let audioElement = null;
let previousFrameAt = 0;
const spriteBlockCache = new Map();

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

function loadImage(name, source) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve([name, image]);
    image.onerror = () => resolve([name, null]);
    image.src = source;
  });
}

// Port of a.java:1853-1865, a.java:1979-1985, e.java:2981-2997.
async function loadOriginalResources() {
  sourceWorld = await loadOriginalWorldResources({ textData });
  sourcePack5 = await loadSplitPack(new URL('assets/packs/5/5', import.meta.url).href);
  const pack5 = sourcePack5;
  sourceTileSprite = decodeBSpriteBlock(readPackBlock(pack5, 0));
  sourceTileImages = sourceTileSprite.moduleImages.map(moduleToCanvasImage);

  const openingPackSprite = decodeBSpriteBlock(readPackBlock(pack5, 100));
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
  ctx.fillStyle = 'rgba(15, 24, 14, 0.86)';
  ctx.fillRect(4, 246, SCREEN_W - 8, 68);
  ctx.strokeStyle = '#9cff7b';
  ctx.strokeRect(4.5, 246.5, SCREEN_W - 9, 67);
  // Wrap Vietnamese story lines
  const words = String(copy).split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (test.length > 36) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  lines.slice(0, 4).forEach((ln, i) => {
    drawText(ctx, ln, 10, 260 + i * 13, { size: 9, color: '#f4f8ec' });
  });
  drawText(ctx, 'Chạm hoặc Enter để tiếp tục ▶', SCREEN_W - 8, 309, { align: 'right', size: 8, color: '#ffd84d', bold: true });
}

// Port of a.java:1853-1865, a.java:1881-1991, e.java:1710-1744 & i.java:315-350:
// render 58x58 original BSprite world map + Y-sorted /5 BSprite buildings, props, plots, crops, animals & Farmer.
function renderFarmWorld(ctx) {
  ctx.fillStyle = '#2d4c1e';
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  const s = app.session;
  const tm = sourceWorld?.tileMap;
  const viewY = 26;
  const viewH = SCREEN_H - 54;
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

  withMIDPClip(ctx, 0, viewY, SCREEN_W, viewH, () => {
    // Pass 1: Tilled soil plots drawn from original /5 BSprite block 6 (e.java:1744: this.G = 6)
    const soilEntry = getSpriteBlock(6, 0);
    for (const plot of s.plots.values()) {
      const wx = plot.worldX ?? (plot.col * tw + (tw >> 1));
      const wy = plot.worldY ?? (plot.row * th + (th >> 1));
      const sx = wx + ox;
      const sy = wy + oy;
      if (sx < -64 || sy < viewY - 48 || sx > SCREEN_W + 64 || sy > viewY + viewH + 48) continue;
      if (soilEntry) {
        drawBSpriteBlockFrame(ctx, soilEntry.sprite, soilEntry.moduleImages, 0, sx, sy, 0);
      }
    }

    // Pass 2: Y-sorted painter's order for buildings, fences, trees, Farmer, crops & animals
    const drawList = [];

    // 2a. Original /10[3..4] farm structures, props, trees, bushes & Farmer (exclude cat 49/54 managed live)
    for (const ent of sourceWorld?.farmEntities || []) {
      if (ent.category === 49 || ent.category === 54) continue;
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
        },
      });
    }

    // 2b. Live growing & ready crops from /5[crop.worldBlock] (e.java:1726-1742: F=0 sprout, F=1 growing, F=2 ready)
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
          if (entry) {
            drawBSpriteBlockFrame(ctx, entry.sprite, entry.moduleImages, frameIdx, sx, sy, 0);
          }
          if (plot.stage === 'ready') {
            drawText(ctx, '★', sx + 10, sy - 10, { size: 9, color: '#ffd84d', bold: true });
          } else if (plot.watered) {
            drawText(ctx, '💧', sx + 9, sy - 8, { size: 7, color: '#7dd3fc' });
          }
        },
      });
    }

    // 2c. Live farm animals from /5[animal.worldBlock] with exact paletteIndex (a.java:13457-13508)
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
          if (a.ready) {
            drawText(ctx, '★', sx + 10, sy - 14, { size: 9, color: '#ffd84d', bold: true });
          } else if (!a.fed) {
            drawText(ctx, '!', sx + 10, sy - 14, { size: 9, color: '#ff6b6b', bold: true });
          }
        },
      });
    }

    drawList.sort((a, b) => a.sortY - b.sortY);
    for (const item of drawList) item.draw();

    // Active tile cursor outline (non-obstructive isometric diamond)
    const cx = s.cursorCol * tw + ox + (tw >> 1);
    const cy = s.cursorRow * th + oy + (th >> 1);
    ctx.strokeStyle = '#fff55a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy - (th >> 1));
    ctx.lineTo(cx + (tw >> 1), cy);
    ctx.lineTo(cx, cy + (th >> 1));
    ctx.lineTo(cx - (tw >> 1), cy);
    ctx.closePath();
    ctx.stroke();
    ctx.lineWidth = 1;
  });

  // Top HUD Bar (0..26)
  ctx.fillStyle = '#172414';
  ctx.fillRect(0, 0, SCREEN_W, 26);
  ctx.fillStyle = '#2d4727';
  ctx.fillRect(0, 25, SCREEN_W, 1);
  const seed = s.catalog?.crops?.find(c => c.id === s.selectedCropId);
  drawText(ctx, `Lv.${s.level} (${s.xp}/${xpForNextLevel(s)})`, 6, 11, { size: 9, color: '#9cff7b', bold: true });
  drawText(ctx, `💰 ${s.coins} Xu`, SCREEN_W - 6, 11, { align: 'right', size: 9, color: '#ffd84d', bold: true });
  drawText(ctx, `Giống: ${seed?.name || 'Lúa mì'} (${seed?.buyPrice || 10}G)`, 6, 22, { size: 8, color: '#e6f0de', maxWidth: 165 });
  const doneQ = s.quests?.filter(q => q.completed && !q.claimed).length || 0;
  if (doneQ > 0) drawText(ctx, `🎁 ${doneQ} NV`, SCREEN_W - 6, 22, { align: 'right', size: 8, color: '#ffd84d', bold: true });

  // Toast banner above bottom bar
  if (s.toast) {
    ctx.fillStyle = 'rgba(14, 22, 13, 0.88)';
    ctx.fillRect(4, SCREEN_H - 48, SCREEN_W - 8, 18);
    ctx.strokeStyle = '#ffd84d';
    ctx.strokeRect(4.5, SCREEN_H - 47.5, SCREEN_W - 9, 17);
    drawText(ctx, s.toast, SCREEN_W / 2, SCREEN_H - 36, { align: 'center', size: 8, color: '#fff7c2', maxWidth: SCREEN_W - 14 });
  }

  // Bottom Toolbar (SCREEN_H - 28 .. SCREEN_H)
  ctx.fillStyle = '#172414';
  ctx.fillRect(0, SCREEN_H - 28, SCREEN_W, 28);
  const tabs = ['CHỢ', 'KHO', 'N.VỤ', 'LƯU'];
  const bw = Math.floor(SCREEN_W / tabs.length);
  tabs.forEach((lbl, i) => {
    const bx = i * bw + 3;
    ctx.fillStyle = '#263a21';
    ctx.fillRect(bx, SCREEN_H - 24, bw - 6, 20);
    ctx.strokeStyle = '#6f9e5d';
    ctx.strokeRect(bx + 0.5, SCREEN_H - 23.5, bw - 7, 19);
    drawText(ctx, lbl, bx + (bw - 6) / 2, SCREEN_H - 11, { align: 'center', size: 9, color: '#f2f7ec', bold: true });
  });
}

function renderPanelList(ctx, title, subtitle, rows, cursorIdx, footer) {
  ctx.fillStyle = '#121c11';
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  ctx.fillStyle = '#1e2f1c';
  ctx.fillRect(0, 0, SCREEN_W, 38);
  drawText(ctx, title, 10, 15, { size: 11, color: '#ffd84d', bold: true });
  drawText(ctx, subtitle, 10, 30, { size: 8, color: '#9cff7b' });

  const start = Math.max(0, Math.min(Math.max(0, rows.length - 8), cursorIdx - 4));
  for (let i = 0; i < 8 && start + i < rows.length; i++) {
    const idx = start + i;
    const item = rows[idx];
    const y = 44 + i * 28;
    ctx.fillStyle = idx === cursorIdx ? '#2e4728' : '#192617';
    ctx.fillRect(6, y, SCREEN_W - 12, 24);
    ctx.strokeStyle = idx === cursorIdx ? '#ffd84d' : '#334d2d';
    ctx.strokeRect(6.5, y + 0.5, SCREEN_W - 13, 23);
    let textX = 12;
    if (item.spriteBlock != null) {
      const entry = getSpriteBlock(item.spriteBlock, item.paletteIndex || 0);
      if (entry) {
        withMIDPClip(ctx, 8, y + 2, 22, 20, () => {
          drawBSpriteBlockFrame(ctx, entry.sprite, entry.moduleImages, item.spriteFrame ?? 0, 19, y + 17, 0);
        });
        textX = 33;
      }
    }
    drawText(ctx, item.left, textX, y + 15, { size: 9, color: item.locked ? '#889483' : '#f2f7ec', maxWidth: 162 - textX });
    drawText(ctx, item.right, SCREEN_W - 12, y + 15, { align: 'right', size: 9, color: item.rightColor || '#ffd84d', bold: true });
  }

  ctx.fillStyle = '#1e2f1c';
  ctx.fillRect(0, SCREEN_H - 28, SCREEN_W, 28);
  drawText(ctx, footer, SCREEN_W / 2, SCREEN_H - 11, { align: 'center', size: 8, color: '#e6f0de' });
}

function renderShop(ctx) {
  const s = app.session;
  const list = s.shopTab === 'crops'
    ? s.catalog.crops.filter(c => c.id !== 3000)
    : s.catalog.animals;
  const rows = list.map((it) => ({
    left: s.shopTab === 'crops' ? `${it.name} (Lv.${it.unlockLevel})` : it.name,
    right: `${it.buyPrice} Xu`,
    locked: s.shopTab === 'crops' && s.level < it.unlockLevel,
    rightColor: s.coins >= it.buyPrice ? '#ffd84d' : '#ff7b70',
    spriteBlock: it.worldBlock,
    spriteFrame: s.shopTab === 'crops' ? 2 : (it.idleFrame ?? 0),
    paletteIndex: it.paletteIndex ?? 0,
  }));
  const tabName = s.shopTab === 'crops' ? 'CHỢ HẠT GIỐNG (/9[2])' : 'CHỢ VẬT NUÔI (/9[0])';
  renderPanelList(ctx, tabName, `Xu: ${s.coins} · Cấp: ${s.level} · Tab: Q đổi mục`, rows, s.shopCursor, 'Chạm chọn · Q: Đổi Giống/Thú · E/Esc: Đóng');
}

function renderBarn(ctx) {
  const s = app.session;
  const items = [...s.inventory.values()];
  const rows = items.length > 0
    ? items.map(it => ({ left: `${it.name} ×${it.qty}`, right: `Bán +${it.sellPrice * it.qty}G` }))
    : [{ left: 'Kho đang trống — hãy thu hoạch cây/thú!', right: '0G' }];
  renderPanelList(ctx, 'KHO NÔNG SẢN (/9[1])', `Xu hiện có: ${s.coins} · Tổng món: ${items.reduce((a, b) => a + b.qty, 0)}`, rows, s.barnCursor, 'Chạm để bán · Q: Bán tất cả · E/Esc: Đóng');
}

function renderQuests(ctx) {
  const s = app.session;
  const rows = (s.quests || []).map(q => ({
    left: q.title,
    right: q.claimed ? 'ĐÃ NHẬN' : q.completed ? `NHẬN +${q.rewardCoins}G` : `${q.progress}/${q.targetCount}`,
    rightColor: q.completed && !q.claimed ? '#9cff7b' : '#ffd84d',
  }));
  renderPanelList(ctx, 'NHIỆM VỤ (/9[25])', `Xu: ${s.coins} · Cấp: ${s.level}`, rows, s.questCursor, 'Chạm NV hoàn thành để nhận thưởng · E/Esc: Đóng');
}

function renderFrame(ctx, now) {
  const timing = sourceFrame(previousFrameAt, now);
  previousFrameAt = timing.now;
  app.session.frame += 1;
  app.session.lastFrameAt = timing.now;
  if (app.session.view === SOURCE_VIEW.OPENING_SCRIPT) renderOpeningEvidence(ctx);
  else if (app.session.view === SOURCE_VIEW.SHOP) renderShop(ctx);
  else if (app.session.view === SOURCE_VIEW.BARN) renderBarn(ctx);
  else if (app.session.view === SOURCE_VIEW.QUESTS) renderQuests(ctx);
  else renderFarmWorld(ctx);
}

let dragState = null;

function clampCamera(s) {
  const tm = sourceWorld?.tileMap;
  const tw = tm?.tileWidth || 36;
  const th = tm?.tileHeight || 18;
  const mapW = (tm?.width || 58) * tw;
  const mapH = (tm?.height || 58) * th;
  const viewH = SCREEN_H - 54;
  s.cameraX = Math.max(0, Math.min(mapW - SCREEN_W, Math.round(s.cameraX)));
  // Real non-empty tile map starts at row 16 (y = 288)
  s.cameraY = Math.max(288, Math.min(mapH - viewH, Math.round(s.cameraY)));
}

function onPointerDown(event) {
  if (!app?.session) return;
  const rect = canvasEl.getBoundingClientRect();
  const x = (event.clientX - rect.left) * (SCREEN_W / rect.width);
  const y = (event.clientY - rect.top) * (SCREEN_H / rect.height);
  const s = app.session;
  if (s.view === SOURCE_VIEW.WORLD_LAYER && y >= 26 && y < SCREEN_H - 28) {
    dragState = {
      pointerId: event.pointerId,
      startX: x,
      startY: y,
      camX: s.cameraX,
      camY: s.cameraY,
      dragged: false,
    };
    try { canvasEl.setPointerCapture(event.pointerId); } catch { /* ignore */ }
    event.preventDefault();
    return;
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

function handleTap(x, y, event) {
  const s = app.session;

  if (s.view === SOURCE_VIEW.OPENING_SCRIPT) {
    app.session = advanceEvidenceView(s, KEY.FIRE);
    event.preventDefault();
    return;
  }

  if (s.view === SOURCE_VIEW.SHOP || s.view === SOURCE_VIEW.BARN || s.view === SOURCE_VIEW.QUESTS) {
    if (y >= SCREEN_H - 28) {
      if (s.view === SOURCE_VIEW.SHOP && x < SCREEN_W / 2) {
        s.shopTab = s.shopTab === 'crops' ? 'animals' : 'crops';
        s.shopCursor = 0;
      } else if (s.view === SOURCE_VIEW.BARN && x < SCREEN_W / 2) {
        sellAllGoods(s);
        saveSession();
      } else {
        s.view = SOURCE_VIEW.WORLD_LAYER;
      }
      event.preventDefault();
      return;
    }
    const rowIdx = Math.floor((y - 44) / 28);
    if (rowIdx >= 0 && rowIdx < 8) {
      if (s.view === SOURCE_VIEW.SHOP) {
        const list = s.shopTab === 'crops' ? s.catalog.crops.filter(c => c.id !== 3000) : s.catalog.animals;
        const start = Math.max(0, Math.min(Math.max(0, list.length - 8), s.shopCursor - 4));
        const item = list[start + rowIdx];
        if (item) {
          if (s.shopTab === 'crops') {
            if (s.level >= item.unlockLevel) {
              s.selectedCropId = item.id;
              s.toast = `Đã chọn giống ${item.name} (${item.buyPrice} Xu)`;
              s.toastMs = 2000;
              s.view = SOURCE_VIEW.WORLD_LAYER;
            } else {
              s.toast = `${item.name} mở khóa ở Cấp ${item.unlockLevel}!`;
              s.toastMs = 2000;
            }
          } else {
            const spotCol = s.cursorCol;
            const spotRow = s.cursorRow;
            buyAnimal(s, item.id, spotRow, spotCol);
            saveSession();
            s.view = SOURCE_VIEW.WORLD_LAYER;
          }
        }
      } else if (s.view === SOURCE_VIEW.BARN) {
        const items = [...s.inventory.values()];
        const item = items[rowIdx];
        if (item) {
          sellGood(s, item.id, item.qty);
          saveSession();
        }
      } else if (s.view === SOURCE_VIEW.QUESTS) {
        const q = s.quests?.[rowIdx];
        if (q) {
          claimQuestReward(s, q.id);
          saveSession();
        }
      }
    }
    event.preventDefault();
    return;
  }

  // Bottom Toolbar clicks
  if (y >= SCREEN_H - 28) {
    const tabIdx = Math.floor(x / (SCREEN_W / 4));
    if (tabIdx === 0) s.view = SOURCE_VIEW.SHOP;
    else if (tabIdx === 1) s.view = SOURCE_VIEW.BARN;
    else if (tabIdx === 2) s.view = SOURCE_VIEW.QUESTS;
    else {
      saveSession();
      s.toast = '💾 Đã lưu trang trại!';
      s.toastMs = 1800;
    }
    event.preventDefault();
    return;
  }

  // World tile tap -> select & interact (harvest / water / plant / plow / animal)
  const hit = sourceTileAt(sourceWorld.tileMap, x, y - 26, s.cameraX, s.cameraY);
  if (hit) {
    s.cursorRow = hit.row;
    s.cursorCol = hit.column;
    interactAtFarmTile(s, hit.row, hit.column);
    saveSession();
  }
  event.preventDefault();
}

function onKeyDown(event) {
  if (!app?.session) return;
  const code = mapKeyCode(event.code, event.key);
  const s = app.session;
  if (s.view === SOURCE_VIEW.OPENING_SCRIPT) {
    const previous = app.session;
    app.session = advanceEvidenceView(s, code);
    if (previous !== app.session) event.preventDefault();
    return;
  }
  if (s.view === SOURCE_VIEW.SHOP || s.view === SOURCE_VIEW.BARN || s.view === SOURCE_VIEW.QUESTS) {
    if (code === KEY.SK_RIGHT) {
      s.view = SOURCE_VIEW.WORLD_LAYER;
      event.preventDefault();
    } else if (code === KEY.SK_LEFT) {
      if (s.view === SOURCE_VIEW.SHOP) { s.shopTab = s.shopTab === 'crops' ? 'animals' : 'crops'; s.shopCursor = 0; }
      else if (s.view === SOURCE_VIEW.BARN) { sellAllGoods(s); saveSession(); }
      event.preventDefault();
    } else if (code === KEY.UP || code === KEY.DOWN) {
      const delta = code === KEY.UP ? -1 : 1;
      if (s.view === SOURCE_VIEW.SHOP) {
        const len = (s.shopTab === 'crops' ? s.catalog.crops.filter(c => c.id !== 3000) : s.catalog.animals).length;
        s.shopCursor = (s.shopCursor + delta + len) % Math.max(1, len);
      } else if (s.view === SOURCE_VIEW.BARN) {
        const len = Math.max(1, s.inventory.size);
        s.barnCursor = (s.barnCursor + delta + len) % len;
      } else if (s.view === SOURCE_VIEW.QUESTS) {
        const len = Math.max(1, s.quests?.length || 1);
        s.questCursor = (s.questCursor + delta + len) % len;
      }
      event.preventDefault();
    } else if (code === KEY.FIRE || code === 5) {
      if (s.view === SOURCE_VIEW.SHOP) {
        const list = s.shopTab === 'crops' ? s.catalog.crops.filter(c => c.id !== 3000) : s.catalog.animals;
        const item = list[s.shopCursor];
        if (item) {
          if (s.shopTab === 'crops' && s.level >= item.unlockLevel) {
            s.selectedCropId = item.id;
            s.view = SOURCE_VIEW.WORLD_LAYER;
          } else if (s.shopTab === 'animals') {
            buyAnimal(s, item.id, s.cursorRow, s.cursorCol);
            saveSession();
            s.view = SOURCE_VIEW.WORLD_LAYER;
          }
        }
      } else if (s.view === SOURCE_VIEW.BARN) {
        const item = [...s.inventory.values()][s.barnCursor];
        if (item) { sellGood(s, item.id, item.qty); saveSession(); }
      } else if (s.view === SOURCE_VIEW.QUESTS) {
        const q = s.quests?.[s.questCursor];
        if (q) { claimQuestReward(s, q.id); saveSession(); }
      }
      event.preventDefault();
    }
    return;
  }

  const tm = sourceWorld?.tileMap;
  const maxR = (tm?.height || 58) - 1;
  const maxC = (tm?.width || 58) - 1;
  if (code === KEY.UP) s.cursorRow = Math.max(16, s.cursorRow - 1);
  else if (code === KEY.DOWN) s.cursorRow = Math.min(maxR, s.cursorRow + 1);
  else if (code === KEY.LEFT) s.cursorCol = Math.max(0, s.cursorCol - 1);
  else if (code === KEY.RIGHT) s.cursorCol = Math.min(maxC, s.cursorCol + 1);
  else if (code === KEY.FIRE || code === 5) {
    interactAtFarmTile(s, s.cursorRow, s.cursorCol);
    saveSession();
  } else if (code === KEY.SK_LEFT) {
    s.view = SOURCE_VIEW.SHOP;
  } else if (code === KEY.SK_RIGHT) {
    s.view = SOURCE_VIEW.BARN;
  } else return;

  // Keep camera centered around active cursor
  const tw = tm?.tileWidth || 36;
  const th = tm?.tileHeight || 18;
  s.cameraX = s.cursorCol * tw - SCREEN_W / 2 + tw / 2;
  s.cameraY = s.cursorRow * th - (SCREEN_H - 54) / 2 + th / 2;
  clampCamera(s);
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
    canvasEl.addEventListener('keydown', onKeyDown);
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
      tickMs: 120,
      onStepSimulation() {
        stepFarmSession(app.session, 120);
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
