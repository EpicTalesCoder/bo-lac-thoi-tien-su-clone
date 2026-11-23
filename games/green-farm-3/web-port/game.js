/**
 * Green Farm 3 evidence-driven web view.
 * Original world/sprite records are decoded from copied JAR pack bytes. The
 * browser exposes inspectable source layers; unsupported source mechanics are
 * deliberately not replaced by an invented farming simulation.
 */
import { mountPhaserRuntime } from './phaser-engine.js';
import { decodeBSpriteBlock, loadSplitPack, moduleToCanvasImage, readPackBlock } from './bsprite-loader.js';
import { drawBSpriteFrame, drawBSpriteTileMap } from './render-original.js';
import { loadOriginalWorldResources } from './gf3-resource-loader.js';
import {
  SCREEN_W, SCREEN_H, KEY, SOURCE_VIEW, advanceEvidenceView, mapKeyCode,
  newEvidenceSession, sourceFrame, sourceText, sourceTileAt,
} from './gf-core.js';

const canvasEl = typeof document !== 'undefined' ? document.getElementById('game') : null;
const IMG = {};
const SPRITES = { icon: 'assets/icon.png' };
let sourceWorld = null;
let sourceTileSprite = null;
let sourceTileImages = null;
let sourceOpeningFrame = null;
let sourceTextResources = null;
let textData = null;
let app = null;
let menuIndex = 0;
let audioElement = null;
let previousFrameAt = 0;

function loadImage(name, source) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve([name, image]);
    image.onerror = () => resolve([name, null]);
    image.src = source;
  });
}

// Source-backed joins: a.java:1853-1865, a.java:1979-1985, e.java:2981-2997.
async function loadOriginalResources() {
  sourceWorld = await loadOriginalWorldResources();
  const pack5 = await loadSplitPack(new URL('assets/packs/5/5', import.meta.url).href);
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

function setFont(ctx, size = 8, bold = false) {
  ctx.font = `${bold ? 'bold ' : ''}${size}px monospace`;
}

// Port of MIDP Graphics text/anchor wrapper f.java:637-644.
function drawSourceText(ctx, value, x, y, { align = 'left', size = 8, color = '#ffffff', bold = false } = {}) {
  ctx.fillStyle = color;
  ctx.textAlign = align;
  setFont(ctx, size, bold);
  ctx.fillText(String(value ?? ''), x, y);
}

function drawBackground(ctx) {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
}

// Shows only the source script text records from /10 block 15, not an invented
// title/menu sequence. The trigger schedule is explicitly unknown.
function renderOpeningEvidence(ctx) {
  drawBackground(ctx);
  drawBSpriteFrame(ctx, sourceOpeningFrame, IMG.openingModules, 0, 0);
  const event = app.session.dialogue[app.session.dialogueIndex];
  const copy = event ? sourceText(textData, event.textId) : '';
  drawSourceText(ctx, copy, 4, 304, { size: 7, color: '#ffffff' });
}

// Original tile layer: /10 block 2 dimensions, block 0 tile IDs, block 1 attrs;
// source `a.x()` supplies b[0] (/5 block 0) as the BSprite tileset. Ported from
// a.java:1853-1865 and i.java:315-350, 661-785; cell graphics remain numeric.
function renderOriginalTileLayer(ctx) {
  drawBackground(ctx);
  if (!sourceWorld?.tileMap || !sourceTileSprite || !sourceTileImages) return;
  drawBSpriteTileMap(ctx, sourceWorld.tileMap, sourceTileSprite, sourceTileImages, {
    x: 0, y: 0, width: SCREEN_W, height: SCREEN_H, cameraX: 0, cameraY: 0,
  });
  const selected = app.session.selectedTile;
  if (selected) {
    drawSourceText(ctx, `tile=${selected.tileId} attr=${selected.attributes} cell=${selected.row},${selected.column}`,
      3, SCREEN_H - 5, { size: 7, color: '#ffffff' });
  }
}

function renderMenu(ctx) {
  drawBackground(ctx);
  drawSourceText(ctx, 'Green Farm 3', SCREEN_W / 2, 28, { align: 'center', size: 14, bold: true });
  drawSourceText(ctx, 'Source evidence views', SCREEN_W / 2, 48, { align: 'center', size: 8 });
  const labels = ['Opening script evidence', 'Original tile layer', 'Back'];
  labels.forEach((label, index) => {
    const y = 100 + index * 28;
    drawSourceText(ctx, index === menuIndex ? '> ' + label : label, SCREEN_W / 2, y,
      { align: 'center', size: 9, color: index === menuIndex ? '#ffdf4f' : '#ffffff' });
  });
}

function renderFrame(ctx, now) {
  const timing = sourceFrame(previousFrameAt, now);
  previousFrameAt = timing.now;
  app.session.frame += 1;
  app.session.lastFrameAt = timing.now;
  if (app.session.view === SOURCE_VIEW.OPENING_SCRIPT) renderOpeningEvidence(ctx);
  else if (app.session.view === SOURCE_VIEW.WORLD_LAYER) renderOriginalTileLayer(ctx);
  else renderMenu(ctx);
}

function selectView(view) {
  app.session = newEvidenceSession(sourceWorld);
  app.session.view = view;
}

// Port of a.java's numeric tile interaction is not claimed as farm-action parity.
// Mouse/tap reports original tile IDs only; no plow/plant/harvest behavior is invented.
function onPointer(event) {
  if (!app) return;
  const rect = canvasEl.getBoundingClientRect();
  const x = (event.clientX - rect.left) * (SCREEN_W / rect.width);
  const y = (event.clientY - rect.top) * (SCREEN_H / rect.height);
  if (app.session.view === SOURCE_VIEW.WORLD_LAYER) {
    app.session.selectedTile = sourceTileAt(sourceWorld.tileMap, x, y);
    event.preventDefault();
    return;
  }
  menuIndex = Math.max(0, Math.min(2, Math.floor((y - 90) / 28)));
  activateSelection();
  event.preventDefault();
}

function activateSelection() {
  if (menuIndex === 0) selectView(SOURCE_VIEW.OPENING_SCRIPT);
  else if (menuIndex === 1) selectView(SOURCE_VIEW.WORLD_LAYER);
  else selectView(SOURCE_VIEW.OPENING_SCRIPT);
}

function onKeyDown(event) {
  if (!app) return;
  const code = mapKeyCode(event.code, event.key);
  if (app.session.view === SOURCE_VIEW.OPENING_SCRIPT) {
    const previous = app.session;
    app.session = advanceEvidenceView(app.session, code);
    if (previous === app.session) return;
    event.preventDefault();
    return;
  }
  if (app.session.view === SOURCE_VIEW.WORLD_LAYER) {
    if (code === KEY.SK_RIGHT || code === KEY.SK_LEFT || code === KEY.FIRE || code === 5) {
      selectView(SOURCE_VIEW.OPENING_SCRIPT);
      event.preventDefault();
    }
    return;
  }
  if (code === KEY.UP) menuIndex = Math.max(0, menuIndex - 1);
  else if (code === KEY.DOWN) menuIndex = Math.min(2, menuIndex + 1);
  else if (code === KEY.FIRE || code === 5 || code === KEY.SK_RIGHT) activateSelection();
  else return;
  event.preventDefault();
}

function setAudioEnabled(enabled) {
  if (!audioElement) {
    // Original resource IDs are loaded by gK()/X(id) from `/3`; exact mapping
    // of a given audio ID to a named scene is not asserted by extracted filenames.
    audioElement = new Audio(new URL('assets/audio/gf3_b000.mid', import.meta.url));
    audioElement.loop = true;
  }
  if (enabled) audioElement.play().catch(() => {});
  else audioElement.pause();
}

if (typeof window !== 'undefined') {
  app = { session: null, audioEnabled: true };
  bootAssets().then(() => {
    app.session = newEvidenceSession(sourceWorld);
    canvasEl.tabIndex = 0;
    canvasEl.addEventListener('keydown', onKeyDown);
    canvasEl.addEventListener('pointerdown', onPointer);
    window.addEventListener('keydown', (event) => {
      if (event.code === 'KeyM') {
        app.audioEnabled = !app.audioEnabled;
        setAudioEnabled(app.audioEnabled);
      }
    });
    window.__gf3 = {
      app,
      sourceWorld,
      selectView,
      setAudioEnabled,
    };
    mountPhaserRuntime({
      canvas: canvasEl,
      width: SCREEN_W,
      height: SCREEN_H,
      tickMs: 120,
      onStepSimulation() {},
      onFrameInterpolate() { return false; },
      onRenderFrame(ctx) { renderFrame(ctx, performance.now()); },
    });
  }).catch((error) => {
    console.error('Green Farm source resource load failed:', error);
    const status = document.getElementById('status');
    if (status) status.textContent = `Không thể đọc dữ liệu nguồn: ${error.message}`;
  });
}
