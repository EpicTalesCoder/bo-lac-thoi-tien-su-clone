/**
 * Green Farm 3 1:1 web port powered by decoded /5 world BSprites, /6 UI layouts,
 * /7 UI BSprites, /9 config tables, /10 58x58 world map + 10 neighbor farms, and EN text packs.
 */
import { mountPhaserRuntime } from './phaser-engine.js';
import { decodeBSpriteBlock, loadSplitPack, moduleToCanvasImage, readPackBlock } from './bsprite-loader.js';
import {
  drawBSpriteBlockAnim, drawBSpriteBlockFrame, drawBSpriteBlockFrameScaled,
  drawBSpriteFrame, drawBSpriteTileMap, drawOriginalUIScreen, withMIDPClip,
} from './render-original.js';
import { loadOriginalWorldResources } from './gf3-resource-loader.js';
import {
  SCREEN_W, SCREEN_H, KEY, SOURCE_VIEW, LAND_ZONES, advanceEvidenceView, mapKeyCode,
  createFarmSession, stepFarmSession, sellGood,
  sellAllGoods, claimQuestReward, serializeFarmSession, restoreFarmSession,
  xpForNextLevel, sourceFrame, sourceText, sourceTileAt,
  setFarmerWalkTarget, moveFarmerByVector, clampWorldCamera, snapPlotToIso4x4,
  buyLandZone, startKitchenRecipe, collectKitchenDish, repairManorRoom,
  upgradeBarn, claimMail, sellCollectible, collectOrFeedAnimal,
  visitNeighborFarm, returnHomeFarm,
} from './gf-core.js';

const SAVE_KEY = 'gf3-farm-save-v5';
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
const uiScreenCache = new Map();

function getSpriteBlock(blockId, paletteIndex = 0) {
  if (!sourcePack5 || !Number.isInteger(blockId) || blockId < 0 || blockId >= 160) return null;
  const pal = Math.max(0, paletteIndex | 0);
  const key = `${blockId}:${pal}`;
  if (spriteBlockCache.has(key)) return spriteBlockCache.get(key);
  let entry = null;
  try {
    const raw = readPackBlock(sourcePack5, blockId);
    let sprite;
    try { sprite = decodeBSpriteBlock(raw, { paletteIndex: pal }); }
    catch { sprite = decodeBSpriteBlock(raw, { paletteIndex: 0 }); }
    entry = { sprite, moduleImages: sprite.moduleImages.map(moduleToCanvasImage) };
  } catch { entry = null; }
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
    try { sprite = decodeBSpriteBlock(raw, { paletteIndex: pal }); }
    catch { sprite = decodeBSpriteBlock(raw, { paletteIndex: 0 }); }
    entry = { sprite, moduleImages: sprite.moduleImages.map(moduleToCanvasImage) };
  } catch { entry = null; }
  uiSpriteCache.set(key, entry);
  return entry;
}

// Port of a.java:9894: s < 1000 -> pack /7 (UI), s >= 1000 -> pack /5 (world)
function getAnySpriteBlock(spriteId, paletteIndex = 0) {
  if (spriteId < 1000) return getUiSpriteBlock(spriteId, paletteIndex);
  return getSpriteBlock(spriteId - 1000, paletteIndex);
}

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
  try { sourcePack7 = await loadSplitPack(new URL('assets/packs/7/7', import.meta.url).href); }
  catch { sourcePack7 = null; }
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

function wrapLines(text, maxChars) {
  const words = String(text || '').split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (test.length > maxChars && line) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function saveSession() {
  if (!app?.session) return;
  try { localStorage.setItem(SAVE_KEY, serializeFarmSession(app.session)); }
  catch { /* ignore */ }
}

// Port of a.java:17555-17589 (opening story dialogue from /10 block 15)
function renderOpeningEvidence(ctx) {
  ctx.fillStyle = '#0e160d';
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  drawBSpriteFrame(ctx, sourceOpeningFrame, IMG.openingModules, 0, 0);
  const event = app.session.dialogue[app.session.dialogueIndex];
  const copy = event ? sourceText(textData, event.textId) : '';
  ctx.fillStyle = 'rgba(46, 26, 9, 0.9)';
  ctx.fillRect(6, 246, SCREEN_W - 12, 68);
  ctx.strokeStyle = '#e8c47a';
  ctx.strokeRect(6.5, 246.5, SCREEN_W - 13, 67);
  wrapLines(copy, 36).slice(0, 4).forEach((ln, i) => {
    drawText(ctx, ln, 12, 260 + i * 13, { size: 9, color: '#fff7e0' });
  });
  drawText(ctx, 'Chạm hoặc Enter để tiếp tục ▶', SCREEN_W - 12, 309, { align: 'right', size: 8, color: '#ffd84d', bold: true });
}

// Port of a.java:1853-1865, a.java:1881-1991, a.java:9553-9621 (a.M(1)), e.java:468-595
function renderFarmWorld(ctx) {
  ctx.fillStyle = '#70e038';
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  const s = app.session;
  const tm = sourceWorld?.tileMap;
  const zoom = s.worldZoom || 1;
  const viewW = Math.ceil(SCREEN_W / zoom);
  const viewH = Math.ceil(SCREEN_H / zoom);
  const animTick = Math.floor((s.animTimeMs || 0) / 80); // Exact 12.5 FPS J2ME animation cadence!
  const vn = s.visitingNeighbor;

  ctx.save();
  ctx.scale(zoom, zoom);

  if (tm && sourceTileSprite && sourceTileImages) {
    drawBSpriteTileMap(ctx, tm, sourceTileSprite, sourceTileImages, {
      x: 0,
      y: 0,
      width: viewW,
      height: viewH,
      cameraX: s.cameraX,
      cameraY: s.cameraY,
    });
  }

  const tw = tm?.tileWidth || 36;
  const th = tm?.tileHeight || 18;
  const ox = -s.cameraX;
  const oy = -s.cameraY;

  withMIDPClip(ctx, 0, 0, viewW, viewH, () => {
    const soilEntry = getSpriteBlock(6, 0);
    const drawList = [];

    if (vn) {
      // --- VISITING NEIGHBOR'S REAL FARM (pack10[5..14]) ---
      const helpedSet = new Set(vn.helpedKeys || []);
      for (const ent of vn.entities || []) {
        // Hide interior cutaway rooms (0..8) overlapping exterior Manor roof (18/19)
        if (ent.category === 50 && ent.entityId >= 0 && ent.entityId <= 8) continue;
        // Skip static player-spawn marker (cat 42, entityId === -1) so we don't draw a duplicate clone of our Farmer!
        if (ent.category === 42 && ent.entityId === -1) continue;
        const sx = ent.x + ox;
        const sy = ent.y + oy;
        if (sx < -140 || sy < -140 || sx > viewW + 140 || sy > viewH + 140) continue;

        if (ent.category === 49) {
          if (soilEntry) drawBSpriteBlockFrame(ctx, soilEntry.sprite, soilEntry.moduleImages, 0, sx, sy, 0);
          if (ent.cropBlock >= 0) {
            const helped = helpedSet.has(ent.opaqueKey);
            drawList.push({
              sortY: ent.y + 1,
              draw: () => {
                const ce = getSpriteBlock(ent.cropBlock, 0);
                if (ce) drawBSpriteBlockFrame(ctx, ce.sprite, ce.moduleImages, helped ? 1 : 2, sx, sy, 0);
                if (!helped && vn.helpsToday < vn.maxHelps) {
                  drawText(ctx, '★', sx + 10, sy - 10, { size: 9, color: '#9cff7b', bold: true });
                }
              },
            });
          }
          continue;
        }
        drawList.push({
          sortY: ent.y + (ent.layer >= 14 ? 40 : 0),
          draw: () => {
            const entry = getSpriteBlock(ent.block, ent.paletteIndex);
            if (!entry) return;
            if (ent.category === 42 && ent.entityId >= 0) {
              // Neighbor host character stands calmly in idle animation (anim 2 — e.java:1113), never wobbling!
              const idleAnim = entry.sprite.animations?.length > 2 ? 2 : 0;
              if (entry.sprite.animations?.length > 0) {
                drawBSpriteBlockAnim(ctx, entry.sprite, entry.moduleImages, idleAnim, Math.floor(animTick * 0.35), sx, sy, 0);
              } else {
                drawBSpriteBlockFrame(ctx, entry.sprite, entry.moduleImages, 0, sx, sy, 0);
              }
            } else if (ent.useAnim && entry.sprite.animations?.length > 0) {
              drawBSpriteBlockAnim(ctx, entry.sprite, entry.moduleImages, 0, animTick, sx, sy, 0);
            } else {
              drawBSpriteBlockFrame(ctx, entry.sprite, entry.moduleImages, ent.frame, sx, sy, 0);
            }
            if ((ent.category === 52 || ent.category === 54) && !helpedSet.has(ent.opaqueKey) && vn.helpsToday < vn.maxHelps) {
              drawText(ctx, '★', sx + 10, sy - 16, { size: 9, color: '#9cff7b', bold: true });
            }
          },
        });
      }
    } else {
      // --- PLAYER'S OWN FARM (pack10[4]) ---
      const clearedSet = new Set(s.clearedDebris || []);
      // Pass 1: Original tilled soil plots (/5 block 6)
      for (const plot of s.plots.values()) {
        const wx = plot.worldX ?? (plot.col * tw + (tw >> 1));
        const wy = plot.worldY ?? (plot.row * th + (th >> 1));
        const sx = wx + ox;
        const sy = wy + oy;
        if (sx < -80 || sy < -60 || sx > viewW + 80 || sy > viewH + 60) continue;
        if (soilEntry) drawBSpriteBlockFrame(ctx, soilEntry.sprite, soilEntry.moduleImages, 0, sx, sy, 0);
      }

      // Pass 2a: World structures, props, fences, bushes (skip interior Manor cutaways 0..8 overlapping exterior Manor!)
      for (const ent of sourceWorld?.farmEntities || []) {
        if (ent.category === 49 || ent.category === 54 || ent.category === 52) continue;
        if (ent.category === 42 && ent.entityId === -1) continue;
        if (ent.category === 48 && clearedSet.has(ent.opaqueKey)) continue;
        if (ent.category === 50 && ent.entityId >= 0 && ent.entityId <= 8) continue;
        const sx = ent.x + ox;
        const sy = ent.y + oy;
        if (sx < -140 || sy < -140 || sx > viewW + 140 || sy > viewH + 140) continue;
        drawList.push({
          sortY: ent.y + (ent.layer >= 14 ? 40 : 0),
          draw: () => {
            const entry = getSpriteBlock(ent.block, ent.paletteIndex);
            if (!entry) return;
            if (ent.useAnim && entry.sprite.animations?.length > 0) {
              drawBSpriteBlockAnim(ctx, entry.sprite, entry.moduleImages, 0, animTick, sx, sy, 0);
            } else {
              drawBSpriteBlockFrame(ctx, entry.sprite, entry.moduleImages, ent.frame, sx, sy, 0);
            }
            // Only show clean Gameloft alert bubbles when Kitchen dish is ready or Mailbox has unread mail
            if (ent.category === 50 && ent.entityId === 18 && (s.kitchenQueue || []).some(j => j.ready)) {
              const ui1 = getUiSpriteBlock(1);
              if (ui1) drawBSpriteBlockFrame(ctx, ui1.sprite, ui1.moduleImages, 34, sx, sy - 42, 0);
            } else if (ent.category === 50 && ent.entityId === 15 && (s.neighborMail || []).some(m => !m.claimed)) {
              const ui1 = getUiSpriteBlock(1);
              if (ui1) drawBSpriteBlockFrame(ctx, ui1.sprite, ui1.moduleImages, 8, sx, sy - 24, 0);
            }
          },
        });
      }

      // Pass 2b: Player-placed Decorations (/9[4])
      for (const dec of s.placedDecor || []) {
        const sx = dec.worldX + ox;
        const sy = dec.worldY + oy;
        if (sx < -80 || sy < -80 || sx > viewW + 80 || sy > viewH + 80) continue;
        drawList.push({
          sortY: dec.worldY,
          draw: () => {
            const entry = getSpriteBlock(dec.worldBlock, dec.paletteIndex || 0);
            if (entry) drawBSpriteBlockFrame(ctx, entry.sprite, entry.moduleImages, dec.frame || 0, sx, sy, 0);
          },
        });
      }

      // Pass 2c: Live Fruit Trees (cat 52)
      for (const tree of s.fruitTrees || []) {
        const sx = tree.worldX + ox;
        const sy = tree.worldY + oy;
        if (sx < -100 || sy < -100 || sx > viewW + 100 || sy > viewH + 100) continue;
        drawList.push({
          sortY: tree.worldY,
          draw: () => {
            const entry = getSpriteBlock(tree.worldBlock, 0);
            if (entry) drawBSpriteBlockFrame(ctx, entry.sprite, entry.moduleImages, tree.ready ? 1 : 0, sx, sy, 0);
            if (tree.ready) drawText(ctx, '★', sx + 10, sy - 22, { size: 9, color: '#ffd84d', bold: true });
          },
        });
      }

      // Pass 2d: Live Growing & Ready Crops (/5[crop.worldBlock])
      for (const plot of s.plots.values()) {
        if (!plot.cropId || plot.stage === 'tilled') continue;
        const wx = plot.worldX ?? (plot.col * tw + (tw >> 1));
        const wy = plot.worldY ?? (plot.row * th + (th >> 1));
        const sx = wx + ox;
        const sy = wy + oy;
        if (sx < -80 || sy < -80 || sx > viewW + 80 || sy > viewH + 80) continue;
        const crop = s.catalog?.crops?.find(c => c.id === plot.cropId);
        const cropBlock = crop?.worldBlock ?? 76;
        const ratio = plot.growMs > 0 ? (plot.progressMs / plot.growMs) : 1;
        const frameIdx = plot.stage === 'ready' ? 2 : (ratio >= 0.5 ? 1 : 0);
        drawList.push({
          sortY: wy + 1,
          draw: () => {
            const entry = getSpriteBlock(cropBlock, 0);
            if (entry) drawBSpriteBlockFrame(ctx, entry.sprite, entry.moduleImages, frameIdx, sx, sy, 0);
            if (plot.stage === 'ready') drawText(ctx, '★', sx + 14, sy - 12, { size: 9, color: '#ffd84d', bold: true });
          },
        });
      }

      // Pass 2e: Live Roaming Farm Animals (/5[animal.worldBlock] with exact paletteIndex & walking anim!)
      for (const a of s.animals) {
        const wx = a.worldX ?? (a.col * tw + (tw >> 1));
        const wy = a.worldY ?? (a.row * th + (th >> 1));
        const sx = wx + ox;
        const sy = wy + oy;
        if (sx < -80 || sy < -80 || sx > viewW + 80 || sy > viewH + 80) continue;
        const spec = s.catalog?.animals?.find(item => item.id === a.animalId);
        const animalBlock = a.worldBlock ?? spec?.worldBlock ?? 8;
        const animalPal = a.paletteIndex ?? spec?.paletteIndex ?? 0;
        const idleFrame = a.idleFrame ?? spec?.idleFrame ?? 0;
        drawList.push({
          sortY: wy + 2,
          draw: () => {
            const entry = getSpriteBlock(animalBlock, animalPal);
            if (entry) {
              const flip = a.hFlip ? 1 : 0;
              if (entry.sprite.animations?.length > 0) {
                const animId = a.walking && entry.sprite.animations.length > 3 ? 3 : 0;
                drawBSpriteBlockAnim(ctx, entry.sprite, entry.moduleImages, animId, animTick + a.uid * 5, sx, sy, flip);
              } else {
                drawBSpriteBlockFrame(ctx, entry.sprite, entry.moduleImages, idleFrame, sx, sy, flip);
              }
            }
            if (a.ready) drawText(ctx, '★', sx + 12, sy - 18, { size: 9, color: '#ffd84d', bold: true });
            else if (!a.fed) drawText(ctx, '!', sx + 12, sy - 18, { size: 9, color: '#ff6b6b', bold: true });
          },
        });
      }
    }

    // Live Player Farmer (/5 block 2 — 80ms/tick authentic animation cadence & centered hFlip!)
    if (s.farmer) {
      const fx = s.farmer.x + ox;
      const fy = s.farmer.y + oy;
      drawList.push({
        sortY: s.farmer.y + 3,
        draw: () => {
          const entry = getSpriteBlock(2, 0);
          if (!entry) return;
          const flipFlag = s.farmer.hFlip ? 1 : 0;
          const pivotAdjust = flipFlag ? 5 : 0; // Compensate asymmetric bounds.x=-11,w=27 so flip stays centered
          const fTick = s.farmer.state === 'idle' ? Math.floor(animTick * 0.45) : animTick;
          drawBSpriteBlockAnim(ctx, entry.sprite, entry.moduleImages, s.farmer.anim, fTick, fx + pivotAdjust, fy, flipFlag);
        },
      });
    }

    drawList.sort((a, b) => a.sortY - b.sortY);
    for (const item of drawList) item.draw();

    // Floating feedback popups
    for (const p of s.popups || []) {
      drawText(ctx, p.text, p.x + ox, p.y + oy, { align: 'center', size: 9, color: p.color || '#ffd84d', bold: true });
    }

    // Authentic /5[14] frame 16 (72x36 4x4 plot cursor — e.java:573) when plowing or placing
    if (!vn && (s.activeTool === 'plow' || s.activeTool === 'place')) {
      const curSnapped = snapPlotToIso4x4(s.cursorCol * tw + (tw >> 1), s.cursorRow * th + (th >> 1));
      const cursorSpr = getSpriteBlock(14, 0);
      if (cursorSpr) {
        drawBSpriteBlockFrame(ctx, cursorSpr.sprite, cursorSpr.moduleImages, 16, curSnapped.wx + ox, curSnapped.wy + oy, 0);
      }
    }
  });

  ctx.restore();

  // --- 1:1 ORIGINAL GAMELOFT /6[1] HUD (NO IAP '+' TOP-UP BUTTONS) ---
  const hudWidgets = getUIScreen(1);
  drawOriginalUIScreen(ctx, hudWidgets, getAnySpriteBlock, {
    filterWidget: (w) => {
      if (w.type !== 205) return false;
      // Remove green IAP '+' buttons (spr 41 frm 3) and their star badges (spr 20 frm 183)
      if (w.spriteId === 41 && w.frameIndex === 3) return false;
      if (w.spriteId === 20 && w.frameIndex === 183) return false;
      if (w.y < 60 && w.spriteId !== 31) return true;
      if (vn && w.index === 67) return false; // Hide Market Stand under VỀ NHÀ when visiting a neighbor
      return w.index === 52 || w.index === 63 || w.index === 67;
    },
  });

  const xpNeed = xpForNextLevel(s);
  const drawHudNum = (val, x, y, color, shadow = '#2b1505') => {
    drawText(ctx, val, x + 1, y + 1, { align: 'center', size: 8, color: shadow, bold: true });
    drawText(ctx, val, x, y, { align: 'center', size: 8, color, bold: true });
  };
  drawHudNum(`${s.level}`, 25, 19, '#fff8c8');
  drawHudNum(`${s.xp}/${xpNeed} XP`, 103, 17, '#ffffff');
  // Crisp dark-brown numbers on the bright white Coins pill & green Cash bar
  drawText(ctx, `${s.coins}`, 57, 44, { align: 'center', size: 8, color: '#4a2508', bold: true });
  drawHudNum(`${s.cash}`, 157, 44, '#eaffed');
  drawText(ctx, `⚡${s.energy}/${s.maxEnergy}`, 15, 61, { size: 8, color: '#2b1505', bold: true });
  drawText(ctx, `⚡${s.energy}/${s.maxEnergy}`, 14, 60, { size: 8, color: '#ffe97d', bold: true });

  // Compact zoom badge at top-right below Pause icon
  ctx.fillStyle = 'rgba(46, 26, 9, 0.72)';
  ctx.fillRect(202, 42, 34, 14);
  ctx.strokeStyle = '#d4a259';
  ctx.strokeRect(202.5, 42.5, 33, 13);
  drawText(ctx, `${Math.round(zoom * 100)}%`, 219, 52, { align: 'center', size: 7, color: '#fff4cc', bold: true });

  // Visiting Neighbor top banner + Return Home button
  if (vn) {
    ctx.fillStyle = 'rgba(46, 26, 9, 0.9)';
    ctx.fillRect(24, 64, SCREEN_W - 48, 18);
    ctx.strokeStyle = '#e8c47a';
    ctx.strokeRect(24.5, 64.5, SCREEN_W - 49, 17);
    drawText(ctx, `Trang trại ${vn.name} · Giúp ${vn.helpsToday}/${vn.maxHelps}`, SCREEN_W / 2, 76, { align: 'center', size: 8, color: '#fff7c2', bold: true });

    ctx.fillStyle = 'rgba(139, 68, 22, 0.94)';
    ctx.fillRect(156, SCREEN_H - 36, 78, 22);
    ctx.strokeStyle = '#ffd84d';
    ctx.strokeRect(156.5, SCREEN_H - 35.5, 77, 21);
    drawText(ctx, 'VỀ NHÀ', 195, SCREEN_H - 22, { align: 'center', size: 9, color: '#fff7d1', bold: true });
  } else if (s.activeTool !== 'auto') {
    const toolNames = {
      plow: 'Cuốc đất: Chạm bãi cỏ để cày (Esc hủy)',
      clear: 'Dọn cỏ/đá: Chạm bụi cây/đá (Esc hủy)',
      place: `Đặt ${s.placementItem?.spec?.name || ''}: Chạm bãi cỏ (Esc hủy)`,
    };
    ctx.fillStyle = 'rgba(59, 34, 13, 0.88)';
    ctx.fillRect(12, 64, SCREEN_W - 24, 16);
    ctx.strokeStyle = '#e8c47a';
    ctx.strokeRect(12.5, 64.5, SCREEN_W - 25, 15);
    drawText(ctx, toolNames[s.activeTool] || '', SCREEN_W / 2, 75, { align: 'center', size: 8, color: '#fff4c2', bold: true });
  }

  if (s.toast) {
    ctx.fillStyle = 'rgba(59, 34, 13, 0.9)';
    ctx.fillRect(8, SCREEN_H - 56, SCREEN_W - 16, 16);
    ctx.strokeStyle = '#e8c47a';
    ctx.strokeRect(8.5, SCREEN_H - 55.5, SCREEN_W - 17, 15);
    drawText(ctx, s.toast, SCREEN_W / 2, SCREEN_H - 45, { align: 'center', size: 8, color: '#fff7c2', maxWidth: SCREEN_W - 22 });
  }
}

// --- SHARED ORIGINAL /6 + /7 WOOD & PARCHMENT WINDOW SHELL ---
function drawOriginalWindowShell(ctx, screenId, title, subtitle, { showConfirm = true } = {}) {
  ctx.fillStyle = '#3c2512';
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  // Draw /7[22] parchment window frame & /7[33] header ribbon
  const screenWidgets = getUIScreen(screenId);
  drawOriginalUIScreen(ctx, screenWidgets, getAnySpriteBlock, {
    filterWidget: (w) => w.type === 205 && (w.spriteId === 22 || w.spriteId === 33),
  });
  // Top wooden title bar strictly inside x=16..224
  ctx.fillStyle = '#5c3314';
  ctx.fillRect(16, 6, 208, 28);
  ctx.strokeStyle = '#d4a259';
  ctx.strokeRect(16.5, 6.5, 207, 27);
  drawText(ctx, title, SCREEN_W / 2, 18, { align: 'center', size: 9, color: '#fff7d1', bold: true });
  drawText(ctx, subtitle, SCREEN_W / 2, 30, { align: 'center', size: 7, color: '#ffe49e', maxWidth: 200 });

  // Authentic /7[12] softkey buttons: Confirm (✔) at bottom-left, Back (⬅) at bottom-right
  const softkeys = getUiSpriteBlock(12);
  if (softkeys) {
    if (showConfirm) drawBSpriteBlockFrame(ctx, softkeys.sprite, softkeys.moduleImages, 2, 4, 289, 0);
    drawBSpriteBlockFrame(ctx, softkeys.sprite, softkeys.moduleImages, 0, 208, 289, 0);
  }
}

function getShopItems(s) {
  if (s.shopTab === 'crops') return s.catalog.crops.filter(c => c.id !== 3000 && !c.isTree);
  if (s.shopTab === 'trees') return s.catalog.crops.filter(c => c.isTree);
  if (s.shopTab === 'animals') return s.catalog.animals;
  if (s.shopTab === 'land') return LAND_ZONES;
  return s.catalog.decorations || [];
}

// --- SCREEN A: AUTHENTIC 2x3 CARD-GRID SHOP (/6[2]) WITH /7[9] ICONS ---
function renderShop(ctx) {
  const s = app.session;
  drawOriginalWindowShell(ctx, 2, 'CỬA HÀNG NÔNG TRẠI', `Xu: ${s.coins}  ·  Cấp: ${s.level}`);

  const tabDefs = [
    { id: 'crops', label: 'HẠT' },
    { id: 'trees', label: 'CÂY' },
    { id: 'animals', label: 'THÚ' },
    { id: 'land', label: 'ĐẤT' },
    { id: 'decor', label: 'ĐỒ' },
  ];
  const tw = Math.floor(208 / 5);
  tabDefs.forEach((t, i) => {
    const tx = 16 + i * tw;
    const active = s.shopTab === t.id;
    ctx.fillStyle = active ? '#8c4b18' : '#e6ca94';
    ctx.fillRect(tx + 1, 38, tw - 2, 16);
    ctx.strokeStyle = active ? '#ffd84d' : '#8b5a2b';
    ctx.strokeRect(tx + 1.5, 38.5, tw - 3, 15);
    drawText(ctx, t.label, tx + tw / 2, 49, { align: 'center', size: 8, color: active ? '#fff8d4' : '#4a290c', bold: true });
  });

  const list = getShopItems(s);
  const perPage = 6;
  const page = Math.floor(s.shopCursor / perPage);
  const totalPages = Math.max(1, Math.ceil(list.length / perPage));
  const start = page * perPage;

  for (let i = 0; i < perPage && start + i < list.length; i += 1) {
    const idx = start + i;
    const item = list[idx];
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = 18 + col * 104;
    const cy = 58 + row * 71;
    const selected = idx === s.shopCursor;
    const owned = s.shopTab === 'land' && (s.unlockedZones || []).includes(item.id);
    const locked = !owned && ((item.unlockLevel || 1) > s.level);
    const price = s.shopTab === 'land' ? item.cost : item.buyPrice;

    // Warm parchment card strictly inside 2x3 grid
    ctx.fillStyle = selected ? '#fff1b8' : '#f7e6c0';
    ctx.fillRect(cx, cy, 100, 67);
    ctx.strokeStyle = selected ? '#c46210' : '#9c6e3b';
    ctx.lineWidth = selected ? 2 : 1;
    ctx.strokeRect(cx + 0.5, cy + 0.5, 99, 66);
    ctx.lineWidth = 1;

    // Draw crisp scaled original icon (/7[9] for crops/trees, /5 for animals/decor)
    if (s.shopTab === 'crops' || s.shopTab === 'trees') {
      const ui9 = getUiSpriteBlock(item.iconBlock ?? 9);
      if (ui9 && item.iconFrame >= 0 && item.iconFrame < ui9.sprite.frames.length) {
        drawBSpriteBlockFrameScaled(ctx, ui9.sprite, ui9.moduleImages, item.iconFrame, cx + 50, cy + 25, 38, 34);
      } else {
        const sp = getSpriteBlock(item.worldBlock, 0);
        if (sp) drawBSpriteBlockFrameScaled(ctx, sp.sprite, sp.moduleImages, s.shopTab === 'trees' ? 1 : 2, cx + 50, cy + 25, 38, 34);
      }
    } else if (s.shopTab === 'animals' || s.shopTab === 'decor') {
      const sp = getSpriteBlock(item.worldBlock, item.paletteIndex || 0);
      if (sp) drawBSpriteBlockFrameScaled(ctx, sp.sprite, sp.moduleImages, item.idleFrame ?? item.frame ?? 0, cx + 50, cy + 25, 42, 34);
    } else {
      const sp6 = getSpriteBlock(6, 0);
      if (sp6) drawBSpriteBlockFrameScaled(ctx, sp6.sprite, sp6.moduleImages, 0, cx + 50, cy + 25, 48, 32);
    }

    drawText(ctx, item.name, cx + 50, cy + 50, { align: 'center', size: 8, color: locked ? '#8a7356' : '#3a1f08', bold: true, maxWidth: 94 });
    const rightTxt = owned ? 'ĐÃ MUA' : locked ? `Cấp ${item.unlockLevel}` : `${price} Xu`;
    const rightCol = owned ? '#1c6b1c' : locked ? '#8a7356' : (s.coins >= price ? '#8c4b18' : '#b3281d');
    drawText(ctx, rightTxt, cx + 50, cy + 62, { align: 'center', size: 8, color: rightCol, bold: true });
  }

  // Page indicator centered between ✔ and ⬅ buttons (never overlapping them!)
  drawText(ctx, `Trang ${page + 1}/${totalPages} (◀ ▶)`, SCREEN_W / 2, 306, { align: 'center', size: 8, color: '#fff7d1', bold: true });
}

// --- SCREEN B: AUTHENTIC KITCHEN WORKBENCH (/6[3]) ---
function renderKitchen(ctx) {
  const s = app.session;
  drawOriginalWindowShell(ctx, 3, 'NHÀ BẾP — CHẾ BIẾN', `Bếp đang nấu: ${s.kitchenQueue?.length || 0}/4  ·  Cấp ${s.level}`);
  const recipes = s.catalog.recipes || [];
  const selIdx = Math.max(0, Math.min(recipes.length - 1, s.panelCursor));
  const sel = recipes[selIdx];

  // Top Workbench Card (y = 40..124)
  ctx.fillStyle = '#faebc8';
  ctx.fillRect(18, 40, 204, 84);
  ctx.strokeStyle = '#9c6e3b';
  ctx.strokeRect(18.5, 40.5, 203, 83);
  if (sel) {
    const canCook = s.level >= sel.unlockLevel && sel.ingredients.every(ing => (s.inventory.get(ing.goodId)?.qty || 0) >= ing.qty);
    drawText(ctx, `${sel.name} (${sel.cookSec}s · +${sel.xp} XP)`, 24, 54, { size: 9, color: '#3a1f08', bold: true, maxWidth: 192 });
    sel.ingredients.slice(0, 2).forEach((ing, i) => {
      const have = s.inventory.get(ing.goodId)?.qty || 0;
      const ok = have >= ing.qty;
      const bx = 24 + i * 96;
      ctx.fillStyle = ok ? '#dff5d8' : '#f5ddd8';
      ctx.fillRect(bx, 62, 92, 26);
      ctx.strokeStyle = ok ? '#3d8b3d' : '#b35440';
      ctx.strokeRect(bx + 0.5, 62.5, 91, 25);
      drawText(ctx, ing.name, bx + 46, 73, { align: 'center', size: 7, color: '#3a1f08', bold: true, maxWidth: 86 });
      drawText(ctx, `Có ${have}/${ing.qty}`, bx + 46, 84, { align: 'center', size: 8, color: ok ? '#1c6b1c' : '#b3281d', bold: true });
    });
    // Prominent NẤU NGAY button inside workbench
    ctx.fillStyle = canCook ? '#2e7d32' : '#9e8b70';
    ctx.fillRect(58, 94, 124, 24);
    ctx.strokeStyle = canCook ? '#ffd84d' : '#6e5c45';
    ctx.strokeRect(58.5, 94.5, 123, 23);
    const btnTxt = s.level < sel.unlockLevel ? `Mở khóa Cấp ${sel.unlockLevel}` : canCook ? 'NẤU MÓN NÀY' : 'THIẾU NGUYÊN LIỆU';
    drawText(ctx, btnTxt, 120, 109, { align: 'center', size: 8, color: '#ffffff', bold: true });
  }

  // Middle 4 Stove Slots (y = 130..168)
  for (let i = 0; i < 4; i += 1) {
    const sx = 18 + i * 52;
    const job = s.kitchenQueue?.[i];
    ctx.fillStyle = job?.ready ? '#d7f7c8' : '#edd5a4';
    ctx.fillRect(sx, 130, 48, 36);
    ctx.strokeStyle = job?.ready ? '#2e7d32' : '#9c6e3b';
    ctx.strokeRect(sx + 0.5, 130.5, 47, 35);
    if (job) {
      drawText(ctx, job.name, sx + 24, 144, { align: 'center', size: 7, color: '#3a1f08', bold: true, maxWidth: 44 });
      drawText(ctx, job.ready ? 'NHẬN!' : `${Math.ceil((job.cookMs - job.progressMs) / 1000)}s`, sx + 24, 158, {
        align: 'center', size: 8, color: job.ready ? '#1c6b1c' : '#8c4b18', bold: true,
      });
    } else {
      drawText(ctx, `Lò ${i + 1}`, sx + 24, 151, { align: 'center', size: 7, color: '#8a7356' });
    }
  }

  // Bottom Recipe Picker List (4 visible rows cleanly inside y = 172..276)
  const visible = 4;
  const start = Math.max(0, Math.min(Math.max(0, recipes.length - visible), selIdx - 1));
  for (let i = 0; i < visible && start + i < recipes.length; i += 1) {
    const idx = start + i;
    const r = recipes[idx];
    const y = 172 + i * 25;
    const isSel = idx === selIdx;
    const canCook = s.level >= r.unlockLevel && r.ingredients.every(ing => (s.inventory.get(ing.goodId)?.qty || 0) >= ing.qty);
    ctx.fillStyle = isSel ? '#fff1b8' : '#f7e6c0';
    ctx.fillRect(18, y, 204, 22);
    ctx.strokeStyle = isSel ? '#c46210' : '#9c6e3b';
    ctx.strokeRect(18.5, y + 0.5, 203, 21);
    drawText(ctx, r.name, 24, y + 14, { size: 8, color: '#3a1f08', bold: isSel, maxWidth: 132 });
    drawText(ctx, canCook ? 'Đủ NL' : `Lv.${r.unlockLevel}`, 216, y + 14, { align: 'right', size: 8, color: canCook ? '#1c6b1c' : '#8a7356', bold: true });
  }
  drawText(ctx, 'Chạm lò chín để nhận', SCREEN_W / 2, 306, { align: 'center', size: 8, color: '#fff7d1', bold: true });
}

// --- SCREEN C: AUTHENTIC QUESTS WITH CINDY LOU PORTRAIT (/6[9] + /7[7]) & 10 NEIGHBORS ---
function renderQuestsOrNeighbors(ctx) {
  const s = app.session;
  const isNb = s.view === SOURCE_VIEW.NEIGHBORS;
  drawOriginalWindowShell(ctx, isNb ? 15 : 9, isNb ? 'THĂM 10 HÀNG XÓM' : 'NHIỆM VỤ TRANG TRẠI', isNb ? 'Chạm hàng xóm để sang thăm trang trại!' : `Xu: ${s.coins}  ·  Cấp: ${s.level}`);

  // Top 2 Tabs inside x=18..222
  const tabs = [{ id: 'quests', label: 'NHIỆM VỤ', active: !isNb }, { id: 'neighbors', label: '10 HÀNG XÓM', active: isNb }];
  tabs.forEach((t, i) => {
    const tx = 18 + i * 102;
    ctx.fillStyle = t.active ? '#8c4b18' : '#e6ca94';
    ctx.fillRect(tx, 38, 100, 16);
    ctx.strokeStyle = t.active ? '#ffd84d' : '#8b5a2b';
    ctx.strokeRect(tx + 0.5, 38.5, 99, 15);
    drawText(ctx, t.label, tx + 50, 49, { align: 'center', size: 8, color: t.active ? '#fff8d4' : '#4a290c', bold: true });
  });

  if (isNb) {
    const list = s.catalog.neighbors || [];
    const maxV = 8;
    const start = Math.max(0, Math.min(Math.max(0, list.length - maxV), s.panelCursor - 3));
    for (let i = 0; i < maxV && start + i < list.length; i += 1) {
      const idx = start + i;
      const nb = list[idx];
      const y = 58 + i * 27;
      const sel = idx === s.panelCursor;
      const done = !!s.helpedNeighbors?.[nb.id];
      ctx.fillStyle = sel ? '#fff1b8' : '#f7e6c0';
      ctx.fillRect(18, y, 204, 24);
      ctx.strokeStyle = sel ? '#c46210' : '#9c6e3b';
      ctx.strokeRect(18.5, y + 0.5, 203, 23);
      const sp = getSpriteBlock(nb.worldBlock, 0);
      if (sp) drawBSpriteBlockFrameScaled(ctx, sp.sprite, sp.moduleImages, 0, 32, y + 12, 22, 20);
      drawText(ctx, `Trang trại ${nb.name}`, 48, y + 15, { size: 8, color: '#3a1f08', bold: sel, maxWidth: 112 });
      drawText(ctx, done ? 'ĐÃ GIÚP' : 'SANG THĂM ▶', 216, y + 15, { align: 'right', size: 8, color: done ? '#8a7356' : '#1c6b1c', bold: true });
    }
    drawText(ctx, 'Chạm để qua trại bạn', SCREEN_W / 2, 306, { align: 'center', size: 8, color: '#fff7d1', bold: true });
    return;
  }

  // Quest Detail Card with REAL Cindy Lou / Character Portrait from /7[7]!
  const quests = s.quests || [];
  const qSel = quests[Math.max(0, Math.min(quests.length - 1, s.questCursor))];
  ctx.fillStyle = '#faebc8';
  ctx.fillRect(18, 58, 204, 78);
  ctx.strokeStyle = '#9c6e3b';
  ctx.strokeRect(18.5, 58.5, 203, 77);

  const portrait = getUiSpriteBlock(7);
  if (portrait) {
    drawBSpriteBlockFrameScaled(ctx, portrait.sprite, portrait.moduleImages, 0, 46, 97, 50, 70);
  }
  if (qSel) {
    drawText(ctx, qSel.title, 76, 72, { size: 8, color: '#5c3314', bold: true, maxWidth: 140 });
    wrapLines(qSel.description || 'Hoàn thành công việc trang trại để nhận thưởng!', 24).slice(0, 2).forEach((ln, i) => {
      drawText(ctx, ln, 76, 85 + i * 11, { size: 7, color: '#3a1f08', maxWidth: 140 });
    });
    drawText(ctx, `Tiến độ: ${qSel.progress}/${qSel.targetCount}`, 76, 112, { size: 8, color: '#8c4b18', bold: true });
    drawText(ctx, `Thưởng: +${qSel.rewardCoins} Xu, +${qSel.rewardXp} XP`, 76, 125, { size: 8, color: '#1c6b1c', bold: true });
  }

  // Scrollable Quest List (5 rows cleanly inside y = 142..276)
  const visible = 5;
  const start = Math.max(0, Math.min(Math.max(0, quests.length - visible), s.questCursor - 2));
  for (let i = 0; i < visible && start + i < quests.length; i += 1) {
    const idx = start + i;
    const q = quests[idx];
    const y = 142 + i * 26;
    const sel = idx === s.questCursor;
    ctx.fillStyle = sel ? '#fff1b8' : '#f7e6c0';
    ctx.fillRect(18, y, 204, 23);
    ctx.strokeStyle = sel ? '#c46210' : '#9c6e3b';
    ctx.strokeRect(18.5, y + 0.5, 203, 22);
    drawText(ctx, q.title, 24, y + 14, { size: 8, color: '#3a1f08', bold: sel, maxWidth: 132 });
    const statusTxt = q.claimed ? 'XONG' : q.completed ? `NHẬN +${q.rewardCoins}G` : `${q.progress}/${q.targetCount}`;
    drawText(ctx, statusTxt, 216, y + 14, { align: 'right', size: 8, color: q.completed && !q.claimed ? '#1c6b1c' : '#8c4b18', bold: true });
  }
  drawText(ctx, 'Chạm NV xong để nhận', SCREEN_W / 2, 306, { align: 'center', size: 8, color: '#fff7d1', bold: true });
}

// --- SCREEN D: CLEAN PARCHMENT LIST INSIDE /7[22] SAFE BOUNDS (x=18..222, y=42..276) ---
function renderCleanParchmentList(ctx, screenId, title, subtitle, rows, cursorIdx, footer) {
  drawOriginalWindowShell(ctx, screenId, title, subtitle);
  const maxVisible = 9;
  const rowH = 26;
  const start = Math.max(0, Math.min(Math.max(0, rows.length - maxVisible), cursorIdx - 4));
  for (let i = 0; i < maxVisible && start + i < rows.length; i += 1) {
    const idx = start + i;
    const item = rows[idx];
    const y = 40 + i * rowH;
    const sel = idx === cursorIdx;
    ctx.fillStyle = sel ? '#fff1b8' : '#f7e6c0';
    ctx.fillRect(18, y, 204, rowH - 3);
    ctx.strokeStyle = sel ? '#c46210' : '#9c6e3b';
    ctx.strokeRect(18.5, y + 0.5, 203, rowH - 4);
    let textX = 24;
    if (item.uiBlock != null) {
      const ui = getUiSpriteBlock(item.uiBlock);
      if (ui) {
        drawBSpriteBlockFrameScaled(ctx, ui.sprite, ui.moduleImages, item.uiFrame ?? 0, 31, y + 11, 20, 19);
        textX = 45;
      }
    } else if (item.spriteBlock != null) {
      const sp = getSpriteBlock(item.spriteBlock, item.paletteIndex || 0);
      if (sp) {
        drawBSpriteBlockFrameScaled(ctx, sp.sprite, sp.moduleImages, item.spriteFrame ?? 0, 31, y + 11, 20, 19);
        textX = 45;
      }
    }
    drawText(ctx, item.left, textX, y + 14, { size: 8, color: item.locked ? '#8a7356' : '#3a1f08', bold: sel, maxWidth: 160 - textX });
    const col = item.rightColor === 'red' ? '#b3281d' : item.rightColor === 'green' ? '#1c6b1c' : '#8c4b18';
    drawText(ctx, item.right, 216, y + 14, { align: 'right', size: 8, color: col, bold: true });
  }
  drawText(ctx, footer, SCREEN_W / 2, 306, { align: 'center', size: 8, color: '#fff7d1', bold: true });
}

function renderSeedPicker(ctx) {
  const s = app.session;
  const crops = s.catalog.crops.filter(c => c.id !== 3000 && !c.isTree);
  const rows = crops.map((c) => ({
    left: `${c.name} (${c.growSec}s · Lv.${c.unlockLevel})`,
    right: `${c.buyPrice} Xu`,
    locked: s.level < c.unlockLevel,
    rightColor: s.coins >= c.buyPrice ? 'green' : 'red',
    uiBlock: c.iconBlock ?? 9,
    uiFrame: c.iconFrame ?? 12,
  }));
  renderCleanParchmentList(ctx, 22, 'CHỌN HẠT GIỐNG', `Xu: ${s.coins}  ·  Cấp: ${s.level}`, rows, s.panelCursor, 'Chạm hạt giống để gieo');
}

function renderBarn(ctx) {
  const s = app.session;
  const items = [...s.inventory.values()];
  const totalQty = items.reduce((a, b) => a + b.qty, 0);
  const upCost = 150 + Math.floor((s.barnCapacity - 40) * 10);
  const rows = [
    { left: 'Nâng cấp Kho thóc (+20 chỗ)', right: `${upCost} Xu`, rightColor: s.coins >= upCost ? 'green' : 'red', spriteBlock: 82, spriteFrame: 0 },
    ...(items.length > 0
      ? items.map(it => ({ left: `${it.name} x${it.qty}`, right: `+${it.sellPrice * it.qty}G`, uiBlock: 2, uiFrame: 0 }))
      : [{ left: 'Kho trống — thu hoạch cây/thú nhé!', right: '0G' }]),
  ];
  renderCleanParchmentList(ctx, 8, `KHO THÓC (${totalQty}/${s.barnCapacity})`, `Xu: ${s.coins}  ·  Nông sản & thành phẩm`, rows, s.barnCursor, 'Q: Bán hết · Chạm bán lẻ');
}

function renderManor(ctx) {
  const s = app.session;
  const rooms = (s.catalog.buildings || []).filter(b => b.isManorRoom);
  const quickLinks = [
    { left: 'Cuốc cày ô đất mới (10 Xu)', right: s.activeTool === 'plow' ? 'ĐANG BẬT' : 'CHỌN', rightColor: 'green', spriteBlock: 6, spriteFrame: 0 },
    { left: 'Dọn cỏ & đá (2 Năng lượng)', right: s.activeTool === 'clear' ? 'ĐANG BẬT' : 'CHỌN', rightColor: 'green', spriteBlock: 14, spriteFrame: 16 },
    { left: 'Kho thóc (Bán & Nâng cấp)', right: 'MỞ', rightColor: 'green', spriteBlock: 82, spriteFrame: 0 },
    { left: 'Nhà bếp (83 công thức nấu)', right: 'MỞ', rightColor: 'green', spriteBlock: 132, spriteFrame: 0 },
    { left: 'Phòng sưu tập (15 cổ vật)', right: 'MỞ', rightColor: 'green', spriteBlock: 129, spriteFrame: 0 },
    { left: 'Hòm thư & Đơn hàng', right: 'MỞ', rightColor: 'green', spriteBlock: 83, spriteFrame: 0 },
    { left: 'Thăm 10 trang trại Hàng xóm', right: 'ĐI THĂM', rightColor: 'green', spriteBlock: 86, spriteFrame: 0 },
    { left: 'Mua đất mở rộng trang trại', right: `${s.unlockedZones?.length || 1}/6`, spriteBlock: 6, spriteFrame: 0 },
  ];
  const roomRows = rooms.map((r) => {
    const done = !!s.unlockedRooms?.[r.entityId];
    const cost = Math.max(150, Math.min(5000, r.repairCost || 300));
    return {
      left: `Phòng: ${r.name}`,
      right: done ? 'ĐÃ SỬA' : `Sửa ${cost}G`,
      rightColor: done ? 'green' : (s.coins >= cost ? 'gold' : 'red'),
      spriteBlock: r.worldBlock,
      spriteFrame: r.frame || 0,
    };
  });
  renderCleanParchmentList(ctx, 14, 'MENU TRANG TRẠI & DINH THỰ', `Xu: ${s.coins}  ·  Công cụ, Nhà & 9 Phòng`, [...quickLinks, ...roomRows], s.panelCursor, 'Chạm mục để mở hoặc sửa');
}

function renderCoop(ctx) {
  const s = app.session;
  const isChicken = s.coopFilter === 'chicken';
  const animals = s.animals.filter(a => {
    const spec = s.catalog.animals.find(sp => sp.id === a.animalId);
    return isChicken ? (spec?.kind === 'chicken' || a.worldBlock === 8) : (spec?.kind !== 'chicken' && a.worldBlock !== 8);
  });
  const rows = [
    { left: `Mua thêm ${isChicken ? 'Gà' : 'Vật nuôi'} tại Chợ`, right: 'MỞ CHỢ', rightColor: 'green', spriteBlock: isChicken ? 8 : 17, spriteFrame: 0 },
    ...animals.map(a => ({
      left: a.name,
      right: a.ready ? 'THU HOẠCH' : a.fed ? 'ĐANG LỚN' : 'CHO ĂN',
      rightColor: a.ready ? 'green' : !a.fed ? 'red' : 'gold',
      spriteBlock: a.worldBlock,
      paletteIndex: a.paletteIndex,
      spriteFrame: a.idleFrame || 0,
    })),
  ];
  renderCleanParchmentList(ctx, 22, isChicken ? 'CHUỒNG GÀ' : 'CHUỒNG THÚ', `Số lượng: ${animals.length}/${isChicken ? s.coopCapacity : s.shedCapacity}`, rows, s.panelCursor, 'Chạm thú để thu / cho ăn');
}

function renderMailbox(ctx) {
  const s = app.session;
  const rows = (s.neighborMail || []).map(m => ({
    left: `${m.from}: ${m.subject}`,
    right: m.claimed ? 'ĐÃ NHẬN' : m.kind === 'gift' ? `+${m.giftCoins}G` : `GIAO +${m.giftCoins}G`,
    rightColor: m.claimed ? 'gold' : 'green',
    spriteBlock: 83,
    spriteFrame: 0,
  }));
  renderCleanParchmentList(ctx, 15, 'HÒM THƯ & ĐƠN HÀNG', `Xu: ${s.coins}  ·  Quà & đơn đặt hàng`, rows, s.panelCursor, 'Chạm thư để nhận / giao');
}

function renderCollections(ctx) {
  const s = app.session;
  const rows = (s.catalog.collectibles || []).map(c => {
    const qty = s.collections?.[c.id] || 0;
    return {
      left: `${c.name} (Có: ${qty})`,
      right: qty > 0 ? `Bán +${c.sellPrice}G` : `Lv.${c.minLevel}`,
      locked: qty === 0,
      rightColor: qty > 0 ? 'green' : 'gold',
    };
  });
  renderCleanParchmentList(ctx, 9, 'PHÒNG SƯU TẬP CỔ VẬT', 'Tìm 15 cổ vật khi thu hoạch & dọn đất', rows, s.panelCursor, 'Chạm cổ vật để bán');
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

function screenToWorld(s, sx, sy) {
  const zoom = s.worldZoom || 1;
  return { wx: sx / zoom + s.cameraX, wy: sy / zoom + s.cameraY };
}

function onPointerDown(event) {
  if (!app?.session) return;
  const rect = canvasEl.getBoundingClientRect();
  const x = (event.clientX - rect.left) * (SCREEN_W / rect.width);
  const y = (event.clientY - rect.top) * (SCREEN_H / rect.height);
  const s = app.session;
  if (s.view === SOURCE_VIEW.WORLD_LAYER) {
    const onHudTop = (x >= 198 && y <= 58);
    const onBottomLeft = (x <= 68 && y >= 274);
    const onBottomRight = (x >= 152 && y >= 274);
    if (!onHudTop && !onBottomLeft && !onBottomRight && y >= 48) {
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
    const zoom = app.session.worldZoom || 1;
    app.session.cameraX = dragState.camX - dx / zoom;
    app.session.cameraY = dragState.camY - dy / zoom;
    clampWorldCamera(app.session, sourceWorld?.tileMap);
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
    if (idx === 0) { upgradeBarn(s); saveSession(); }
    else {
      const item = [...s.inventory.values()][idx - 1];
      if (item) { sellGood(s, item.id, item.qty); saveSession(); }
    }
  } else if (v === SOURCE_VIEW.KITCHEN) {
    const recipe = (s.catalog.recipes || [])[idx];
    if (recipe) { startKitchenRecipe(s, recipe.id); saveSession(); }
  } else if (v === SOURCE_VIEW.MANOR) {
    if (idx === 0) {
      s.activeTool = s.activeTool === 'plow' ? 'auto' : 'plow';
      s.placementItem = null;
      s.view = SOURCE_VIEW.WORLD_LAYER;
    } else if (idx === 1) {
      s.activeTool = s.activeTool === 'clear' ? 'auto' : 'clear';
      s.placementItem = null;
      s.view = SOURCE_VIEW.WORLD_LAYER;
    } else if (idx === 2) { s.barnCursor = 0; s.view = SOURCE_VIEW.BARN; }
    else if (idx === 3) { s.panelCursor = 0; s.view = SOURCE_VIEW.KITCHEN; }
    else if (idx === 4) { s.panelCursor = 0; s.view = SOURCE_VIEW.COLLECTIONS; }
    else if (idx === 5) { s.panelCursor = 0; s.view = SOURCE_VIEW.MAILBOX; }
    else if (idx === 6) { s.panelCursor = 0; s.view = SOURCE_VIEW.NEIGHBORS; }
    else if (idx === 7) { s.shopTab = 'land'; s.shopCursor = 0; s.view = SOURCE_VIEW.SHOP; }
    else {
      const rooms = (s.catalog.buildings || []).filter(b => b.isManorRoom);
      const room = rooms[idx - 8];
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
    // ACTUALLY TRAVEL TO THE NEIGHBOR'S REAL FARM (pack10[5..14])!
    visitNeighborFarm(s, idx, sourceWorld);
    saveSession();
  }
}

function handleTap(x, y, event) {
  const s = app.session;
  if (s.view === SOURCE_VIEW.OPENING_SCRIPT) {
    app.session = advanceEvidenceView(s, KEY.FIRE);
    event.preventDefault();
    return;
  }

  // --- MODAL UI SCREENS ---
  if (s.view !== SOURCE_VIEW.WORLD_LAYER) {
    // Bottom-right original ⬅ Back button (x >= 196, y >= 282)
    if (x >= 196 && y >= 282) {
      s.view = SOURCE_VIEW.WORLD_LAYER;
      event.preventDefault();
      return;
    }
    // Bottom-left original ✔ Confirm button (x <= 44, y >= 282)
    if (x <= 44 && y >= 282) {
      const idx = s.view === SOURCE_VIEW.SHOP ? s.shopCursor
        : s.view === SOURCE_VIEW.BARN ? s.barnCursor
        : s.view === SOURCE_VIEW.QUESTS ? s.questCursor
        : s.panelCursor;
      handlePanelAction(s, idx);
      event.preventDefault();
      return;
    }

    if (s.view === SOURCE_VIEW.SHOP) {
      if (y >= 36 && y <= 55) {
        const tabIds = ['crops', 'trees', 'animals', 'land', 'decor'];
        const tIdx = Math.max(0, Math.min(4, Math.floor((x - 16) / (208 / 5))));
        s.shopTab = tabIds[tIdx];
        s.shopCursor = 0;
        event.preventDefault();
        return;
      }
      // Page arrows in footer center
      if (y >= 284 && x > 44 && x < 196) {
        const list = getShopItems(s);
        const pages = Math.max(1, Math.ceil(list.length / 6));
        const curPage = Math.floor(s.shopCursor / 6);
        const nextPage = x < SCREEN_W / 2 ? (curPage - 1 + pages) % pages : (curPage + 1) % pages;
        s.shopCursor = nextPage * 6;
        event.preventDefault();
        return;
      }
      // 2x3 Card Grid click
      if (y >= 58 && y <= 270 && x >= 18 && x <= 222) {
        const col = x < 120 ? 0 : 1;
        const row = Math.floor((y - 58) / 71);
        const page = Math.floor(s.shopCursor / 6);
        const targetIdx = page * 6 + row * 2 + col;
        if (targetIdx < getShopItems(s).length) {
          if (s.shopCursor === targetIdx) handlePanelAction(s, targetIdx);
          else { s.shopCursor = targetIdx; handlePanelAction(s, targetIdx); }
        }
      }
      event.preventDefault();
      return;
    }

    if (s.view === SOURCE_VIEW.KITCHEN) {
      // NẤU NGAY button inside top workbench
      if (y >= 92 && y <= 120 && x >= 56 && x <= 184) {
        handlePanelAction(s, s.panelCursor);
        event.preventDefault();
        return;
      }
      // 4 Stove slots (y = 130..168) -> collect ready dish!
      if (y >= 130 && y <= 168 && x >= 18 && x <= 224) {
        const slot = Math.floor((x - 18) / 52);
        const job = s.kitchenQueue?.[slot];
        if (job?.ready) { collectKitchenDish(s, job.uid); saveSession(); }
        event.preventDefault();
        return;
      }
      // Bottom 4 recipe rows (y = 172..276)
      if (y >= 172 && y <= 276) {
        const recipes = s.catalog.recipes || [];
        const start = Math.max(0, Math.min(Math.max(0, recipes.length - 4), s.panelCursor - 1));
        const rIdx = start + Math.floor((y - 172) / 25);
        if (rIdx >= 0 && rIdx < recipes.length) s.panelCursor = rIdx;
      }
      event.preventDefault();
      return;
    }

    if (s.view === SOURCE_VIEW.QUESTS || s.view === SOURCE_VIEW.NEIGHBORS) {
      if (y >= 36 && y <= 55) {
        s.view = x < SCREEN_W / 2 ? SOURCE_VIEW.QUESTS : SOURCE_VIEW.NEIGHBORS;
        s.panelCursor = 0;
        event.preventDefault();
        return;
      }
      if (s.view === SOURCE_VIEW.NEIGHBORS && y >= 58 && y <= 276) {
        const list = s.catalog.neighbors || [];
        const start = Math.max(0, Math.min(Math.max(0, list.length - 8), s.panelCursor - 3));
        const idx = start + Math.floor((y - 58) / 27);
        if (idx >= 0 && idx < list.length) { s.panelCursor = idx; handlePanelAction(s, idx); }
      } else if (s.view === SOURCE_VIEW.QUESTS && y >= 142 && y <= 276) {
        const list = s.quests || [];
        const start = Math.max(0, Math.min(Math.max(0, list.length - 5), s.questCursor - 2));
        const idx = start + Math.floor((y - 142) / 26);
        if (idx >= 0 && idx < list.length) {
          s.questCursor = idx;
          if (list[idx].completed && !list[idx].claimed) handlePanelAction(s, idx);
        }
      }
      event.preventDefault();
      return;
    }

    // Standard Parchment Lists (Barn, Manor, Coop, Mailbox, Collections, Seed Picker)
    if (y >= 40 && y <= 276) {
      const cur = s.view === SOURCE_VIEW.BARN ? s.barnCursor : s.panelCursor;
      const start = Math.max(0, cur - 4);
      const idx = start + Math.floor((y - 40) / 26);
      if (s.view === SOURCE_VIEW.BARN) s.barnCursor = idx;
      else s.panelCursor = idx;
      handlePanelAction(s, idx);
    }
    event.preventDefault();
    return;
  }

  // --- WORLD HUD BUTTONS ---
  // Zoom toggle badge (202..236, 42..56)
  if (x >= 200 && y >= 40 && y <= 58) {
    const levels = [0.75, 0.85, 1.0];
    const nextIdx = (levels.findIndex(z => Math.abs(z - (s.worldZoom || 1)) < 0.05) + 1) % levels.length;
    s.worldZoom = levels[nextIdx];
    clampWorldCamera(s, sourceWorld?.tileMap);
    event.preventDefault();
    return;
  }
  // Top-right Pause/Menu icon [41]
  if (x >= 198 && y <= 40) {
    s.panelCursor = 0;
    s.view = SOURCE_VIEW.MANOR;
    event.preventDefault();
    return;
  }
  // Return Home button when visiting a neighbor
  if (s.visitingNeighbor && x >= 152 && y >= SCREEN_H - 40) {
    returnHomeFarm(s, sourceWorld?.tileMap);
    event.preventDefault();
    return;
  }
  // Bottom-left Clipboard/Quest icon [52]+[63]
  if (x <= 68 && y >= 274) {
    s.view = SOURCE_VIEW.QUESTS;
    event.preventDefault();
    return;
  }
  // Bottom-right Market Stand icon [67]
  if (!s.visitingNeighbor && x >= 192 && y >= 274) {
    s.view = SOURCE_VIEW.SHOP;
    event.preventDefault();
    return;
  }

  // --- WORLD INTERACTION ---
  const { wx, wy } = screenToWorld(s, x, y);

  // Visiting Neighbor Farm interaction: tap any crop / tree / animal to walk & help!
  if (s.visitingNeighbor) {
    const vn = s.visitingNeighbor;
    const targetEnt = (vn.entities || []).find(
      e => (e.category === 49 || e.category === 52 || e.category === 54) && Math.hypot(e.x - wx, e.y - wy) <= 30,
    );
    if (targetEnt) {
      setFarmerWalkTarget(s, targetEnt.x, targetEnt.y + 10, {
        type: 'neighbor_help', opaqueKey: targetEnt.opaqueKey, worldX: targetEnt.x, worldY: targetEnt.y,
      });
      saveSession();
    } else {
      setFarmerWalkTarget(s, wx, wy, null);
    }
    event.preventDefault();
    return;
  }

  const hit = sourceTileAt(sourceWorld.tileMap, wx - s.cameraX, wy - s.cameraY, s.cameraX, s.cameraY);

  if (s.activeTool === 'place' && s.placementItem && hit) {
    setFarmerWalkTarget(s, wx, wy, { type: 'place', item: s.placementItem, row: hit.row, col: hit.column, worldX: wx, worldY: wy });
    saveSession();
    event.preventDefault();
    return;
  }

  if (s.activeTool === 'plow' && hit) {
    s.cursorRow = hit.row;
    s.cursorCol = hit.column;
    setFarmerWalkTarget(s, wx, wy, { type: 'tile', row: hit.row, col: hit.column, worldX: wx, worldY: wy });
    saveSession();
    event.preventDefault();
    return;
  }

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

  // Buildings (cat 50)
  const hitBuilding = (sourceWorld?.farmEntities || []).find(
    e => e.category === 50 && !(e.entityId >= 0 && e.entityId <= 8) && Math.hypot(e.x - wx, (e.y - 14) - wy) <= 34,
  );
  if (hitBuilding) {
    setFarmerWalkTarget(s, hitBuilding.x, hitBuilding.y + 22, { type: 'building', entityId: hitBuilding.entityId });
    event.preventDefault();
    return;
  }

  // Fruit Trees (cat 52)
  const hitTree = (s.fruitTrees || []).find(t => Math.hypot(t.worldX - wx, (t.worldY - 12) - wy) <= 24);
  if (hitTree && hitTree.ready) {
    setFarmerWalkTarget(s, hitTree.worldX, hitTree.worldY + 10, { type: 'tree', uid: hitTree.uid });
    event.preventDefault();
    return;
  }

  // Farm Animals (cat 54)
  const hitAnimal = (s.animals || []).find(a => Math.hypot((a.worldX ?? a.col * 36 + 18) - wx, (a.worldY ?? a.row * 18 + 9) - wy) <= 24);
  if (hitAnimal) {
    const ax = hitAnimal.worldX ?? (hitAnimal.col * 36 + 18);
    const ay = hitAnimal.worldY ?? (hitAnimal.row * 18 + 9);
    setFarmerWalkTarget(s, ax, ay + 8, { type: 'animal', uid: hitAnimal.uid });
    event.preventDefault();
    return;
  }

  // Plots (cat 49)
  let hitPlot = null;
  let bestDist = 28;
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
    setFarmerWalkTarget(s, px, py + 8, {
      type: 'tile', row: hitPlot.row, col: hitPlot.col, worldX: px, worldY: py,
      openSeedPicker: hitPlot.stage === 'tilled',
    });
    saveSession();
    event.preventDefault();
    return;
  }

  if (hitDebris) {
    setFarmerWalkTarget(s, hitDebris.x, hitDebris.y + 8, {
      type: 'debris', opaqueKey: hitDebris.opaqueKey, worldX: hitDebris.x, worldY: hitDebris.y,
    });
    saveSession();
    event.preventDefault();
    return;
  }

  if (hit) {
    s.cursorRow = hit.row;
    s.cursorCol = hit.column;
    setFarmerWalkTarget(s, wx, wy, null);
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
    } else if (code === KEY.UP || code === KEY.DOWN || code === KEY.LEFT || code === KEY.RIGHT) {
      const delta = (code === KEY.UP || code === KEY.LEFT) ? -1 : 1;
      if (s.view === SOURCE_VIEW.SHOP) {
        const len = Math.max(1, getShopItems(s).length);
        const step = (code === KEY.UP || code === KEY.DOWN) ? delta * 2 : delta;
        s.shopCursor = (s.shopCursor + step + len) % len;
      } else if (s.view === SOURCE_VIEW.BARN) {
        const len = Math.max(1, s.inventory.size + 1);
        s.barnCursor = (s.barnCursor + delta + len) % len;
      } else if (s.view === SOURCE_VIEW.QUESTS) {
        const len = Math.max(1, s.quests?.length || 1);
        s.questCursor = (s.questCursor + delta + len) % len;
      } else {
        const len = s.view === SOURCE_VIEW.KITCHEN ? (s.catalog.recipes?.length || 1)
          : s.view === SOURCE_VIEW.NEIGHBORS ? (s.catalog.neighbors?.length || 1) : 16;
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
  if (code === KEY.SK_RIGHT && s.activeTool !== 'auto') {
    s.activeTool = 'auto';
    s.placementItem = null;
    event.preventDefault();
    return;
  }
  if (code === KEY.FIRE || code === 5) {
    const fx = s.farmer ? s.farmer.x : (s.cursorCol * 36 + 18);
    const fy = s.farmer ? s.farmer.y : (s.cursorRow * 18 + 9);
    if (s.visitingNeighbor) {
      const targetEnt = (s.visitingNeighbor.entities || []).find(
        e => (e.category === 49 || e.category === 52 || e.category === 54) && Math.hypot(e.x - fx, e.y - fy) <= 44,
      );
      if (targetEnt) {
        setFarmerWalkTarget(s, targetEnt.x, targetEnt.y + 8, {
          type: 'neighbor_help', opaqueKey: targetEnt.opaqueKey, worldX: targetEnt.x, worldY: targetEnt.y,
        });
        saveSession();
      }
      event.preventDefault();
      return;
    }
    const nearBuilding = (sourceWorld?.farmEntities || []).find(
      e => e.category === 50 && !(e.entityId >= 0 && e.entityId <= 8) && Math.hypot(e.x - fx, e.y - fy) <= 44,
    );
    const nearTree = (s.fruitTrees || []).find(t => t.ready && Math.hypot(t.worldX - fx, t.worldY - fy) <= 34);
    const nearAnimal = (s.animals || []).find(a => Math.hypot((a.worldX ?? a.col * 36 + 18) - fx, (a.worldY ?? a.row * 18 + 9) - fy) <= 32);
    let nearPlot = null; let bestD = 36;
    for (const p of s.plots.values()) {
      const d = Math.hypot((p.worldX ?? p.col * 36 + 18) - fx, (p.worldY ?? p.row * 18 + 9) - fy);
      if (d < bestD) { bestD = d; nearPlot = p; }
    }
    if (nearPlot) {
      setFarmerWalkTarget(s, nearPlot.worldX ?? fx, (nearPlot.worldY ?? fy) + 6, {
        type: 'tile', row: nearPlot.row, col: nearPlot.col, worldX: nearPlot.worldX, worldY: nearPlot.worldY,
        openSeedPicker: nearPlot.stage === 'tilled',
      });
    } else if (nearTree) {
      setFarmerWalkTarget(s, nearTree.worldX, nearTree.worldY + 8, { type: 'tree', uid: nearTree.uid });
    } else if (nearAnimal) {
      setFarmerWalkTarget(s, nearAnimal.worldX ?? fx, (nearAnimal.worldY ?? fy) + 6, { type: 'animal', uid: nearAnimal.uid });
    } else if (nearBuilding) {
      setFarmerWalkTarget(s, nearBuilding.x, nearBuilding.y + 20, { type: 'building', entityId: nearBuilding.entityId });
    } else {
      setFarmerWalkTarget(s, fx, fy, { type: 'tile', row: s.cursorRow, col: s.cursorCol, worldX: fx, worldY: fy });
    }
    saveSession();
  } else if (code === KEY.SK_LEFT) {
    s.view = SOURCE_VIEW.QUESTS;
  } else if (code === KEY.SK_RIGHT) {
    s.view = SOURCE_VIEW.SHOP;
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
    canvasEl.addEventListener('wheel', (e) => {
      if (app.session?.view !== SOURCE_VIEW.WORLD_LAYER) return;
      app.session.worldZoom = e.deltaY > 0 ? Math.max(0.75, (app.session.worldZoom || 0.85) - 0.1) : Math.min(1.0, (app.session.worldZoom || 0.85) + 0.1);
      clampWorldCamera(app.session, sourceWorld?.tileMap);
      e.preventDefault();
    }, { passive: false });
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
