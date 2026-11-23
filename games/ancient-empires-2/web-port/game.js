import { decodeMap, decodeSprite, decodeTerrainProperties, decodeUnits, fetchBytes, transformPalettePixels } from './ancient-empires-loader.js';
import { calculateReachability } from './ancient-empires-core.js';
import { drawRegionMIDP, renderOriginalBoard } from './render-original.js';

const WIDTH = 240;
const HEIGHT = 320;
const MAP_ID = 'm0';
const MIDP = Object.freeze({ HCENTER: 1, VCENTER: 2, LEFT: 4, RIGHT: 8, TOP: 16, BOTTOM: 32 });

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load original image ${url}`));
    image.src = url;
  });
}

async function recolorPalette(image, palette) {
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(image, 0, 0);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  pixels.data.set(transformPalettePixels(pixels.data, palette));
  ctx.putImageData(pixels, 0, 0);
  const recolored = new Image();
  recolored.src = canvas.toDataURL('image/png');
  await recolored.decode();
  return recolored;
}

async function loadAssets() {
  const [mapBytes, unitBytes, propertyBytes, packManifest] = await Promise.all([
    fetchBytes(`assets/${MAP_ID}`), fetchBytes('assets/units.bin'), fetchBytes('assets/tiles0.prop'),
    fetch('assets/manifest.json').then(response => {
      if (!response.ok) throw new Error(`Cannot verify original asset inventory: HTTP ${response.status}`);
      return response.json();
    }),
  ]);
  const originalNames = new Set(packManifest.resources.map(resource => resource.name));
  const hasOriginalAsset = name => originalNames.has(name);
  const map = decodeMap(mapBytes, MAP_ID);
  const unitRecords = decodeUnits(unitBytes);
  const terrain = decodeTerrainProperties(propertyBytes);
  const spriteNames = ['tiles0', 'buildings', 'unit_icons', 'cursor', 'buttons', 'menu', 'hud_icons', 'hud_icons_2', 'action_icons', 'side_arrow', 'arrow', 'mini_icons', 'portraits'];
  const sprites = {};
  const images = {};
  const frameImages = {};
  await Promise.all(spriteNames.map(async name => {
    try {
      const spriteBytes = await fetchBytes(`assets/${name}.sprite`);
      sprites[name] = decodeSprite(spriteBytes, `${name}.sprite`);
      const sheetUrl = `${name}.png`;
      let sheet = null;
      if (hasOriginalAsset(sheetUrl)) sheet = await loadImage(`assets/${sheetUrl}`);
      if (sheet) images[name] = sheet;
      else {
        const framePromises = sprites[name].frames.map(async frame => {
          const frameUrl = `${name}_${String(frame.sourceFrame).padStart(2, '0')}.png`;
          if (!hasOriginalAsset(frameUrl)) return null;
          return loadImage(`assets/${frameUrl}`);
        });
        frameImages[name] = await Promise.all(framePromises);
      }
    } catch {
      // A renderer lookup is omitted only when that original resource is absent.
    }
  }));

  const buildingPaletteImages = [];
  const buildingSheet = images.buildings;
  for (let palette = 0; palette < 5; palette++) {
    const canvas = document.createElement('canvas');
    canvas.width = buildingSheet.naturalWidth;
    canvas.height = buildingSheet.naturalHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(buildingSheet, 0, 0);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    pixels.data.set(transformPalettePixels(pixels.data, palette));
    ctx.putImageData(pixels, 0, 0);
    const recolored = new Image();
    recolored.src = canvas.toDataURL('image/png');
    await recolored.decode();
    buildingPaletteImages.push(recolored);
  }
  const originalUnitFamilies = ['soldier', 'archer', 'lizard', 'wizard', 'wisp', 'spider', 'golem', 'catapult', 'wyvern', 'king', 'skeleton', null];
  const unitFamilies = [...originalUnitFamilies];
  await Promise.all(unitFamilies.filter(Boolean).map(async name => {
    try {
      const spriteBytes = await fetchBytes(`assets/${name}.sprite`);
      sprites[name] = decodeSprite(spriteBytes, `${name}.sprite`);
      if (hasOriginalAsset(`${name}.png`)) images[name] = await loadImage(`assets/${name}.png`);
      else {
        frameImages[name] = await Promise.all(sprites[name].frames.map(async frame => {
          const frameUrl = `${name}_${String(frame.sourceFrame).padStart(2, '0')}.png`;
          if (!hasOriginalAsset(frameUrl)) return null;
          return loadImage(`assets/${frameUrl}`);
        }));
      }
    } catch { /* keep original type, render no substitute */ }
  }));
  const coloredPalettes = [];
  for (let palette = 1; palette <= 4; palette++) {
    const familyImages = {};
    for (const family of originalUnitFamilies) {
      if (!family) continue;
      const original = images[family];
      if (original) familyImages[family] = await recolorPalette(original, palette);
      else if (frameImages[family]) familyImages[family] = await Promise.all(frameImages[family].map(image => image ? recolorPalette(image, palette) : null));
    }
    coloredPalettes[palette] = familyImages;
  }
  return { map, unitRecords, terrain, sprites, images, frameImages, unitFamilies, buildingPaletteImages, coloredPalettes };
}

function centerText(ctx, text, y, options = {}) {
  ctx.save();
  ctx.fillStyle = options.color ?? '#f1e7d2';
  ctx.font = options.font ?? '11px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, WIDTH / 2, y, options.maxWidth ?? 220);
  ctx.restore();
}

function drawImageAt(ctx, image, x, y, width, height, anchor = MIDP.LEFT | MIDP.TOP) {
  if (!image) return;
  const dx = anchor & MIDP.HCENTER ? x - (width >> 1) : anchor & MIDP.RIGHT ? x - width : x;
  const dy = anchor & MIDP.VCENTER ? y - (height >> 1) : anchor & MIDP.BOTTOM ? y - height : y;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, dx, dy, width, height);
}

class AncientEmpiresWeb {
  constructor(canvas, assets, status) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.assets = assets;
    this.status = status;
    this.state = 'splash';
    this.storyIndex = 0;
    this.cursor = { x: 0, y: 0 };
    this.selected = null;
    this.reachable = null;
    this.turn = 0;
    this.playerIndex = 0;
    this.playerPalette = assets.map.units.reduce((table, record) => { table[record.playerSelector] = table[record.playerSelector] ?? Math.max(0, record.playerSelector - 1); return table; }, []);
    this.units = assets.map.units.map((record, id) => ({ ...record, id, frameIndex: 0, action: 0, budget: assets.unitRecords[record.type].fields[0], movementMask: assets.unitRecords[record.type].movementMaskBits.reduce((mask, bit) => mask | (1 << bit), 0), palette: this.playerPalette[record.playerSelector] ?? 0 }));
    this.cameraX = 0;
    this.cameraY = 0;
    this.scenario = 0;
    this.scenarioStep = 0;
    this.dialogText = '';
    this.actionPending = null;
    this.saveKey = 'ae2-local-state-v1';
    this.lastTick = 0;
    this.accumulator = 0;
    this.bindInput();
    requestAnimationFrame(time => this.loop(time));
    this.paint();
  }

  bindInput() {
    this.canvas.addEventListener('pointerdown', event => {
      const rect = this.canvas.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left) * WIDTH / rect.width);
      const y = Math.floor((event.clientY - rect.top) * HEIGHT / rect.height);
      this.pointer(x, y);
    });
    window.addEventListener('keydown', event => {
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter','Space','Escape','2','4','6','8','5'].includes(event.code) || /^[24568]$/.test(event.key)) event.preventDefault();
      this.key(event);
    });
  }

  loop(time) {
    if (this.lastTick === 0) this.lastTick = time;
    this.accumulator += Math.min(time - this.lastTick, 200);
    this.lastTick = time;
    // Port of e.java:429-460: 50ms simulation update cadence, driven by the original Canvas loop.
    while (this.accumulator >= 50) {
      this.tick();
      this.accumulator -= 50;
    }
    this.paint();
    requestAnimationFrame(next => this.loop(next));
  }

  tick() {
    if (this.state === 'dialog' && this.dialogTimer > 0) {
      this.dialogTimer -= 50;
      if (this.dialogTimer <= 0) this.state = 'play';
    }
    if (this.state !== 'play') return;
    if (this.aiPending) this.runAiStep();
  }

  pointer(x, y) {
    if (this.state === 'splash') { this.state = 'prologue'; this.paint(); return; }
    if (this.state === 'prologue') { this.state = 'story'; this.storyIndex = 0; this.paint(); return; }
    if (this.state === 'story') {
      if (this.storyIndex < 5) this.storyIndex++;
      else this.startMission();
      this.paint(); return;
    }
    if (this.state === 'briefing') { this.startMission(); return; }
    if (this.state !== 'play') {
      this.state = 'play'; this.paint(); return;
    }
    if (y < 28 && x > 180) { this.pan(x > 210 ? 0 : x > 195 ? 1 : 2); return; }
    if (y >= HEIGHT - 32 && x >= WIDTH - 70) { this.endTurn(); return; }
    const tileX = Math.floor((x + this.cameraX) / 24);
    const tileY = Math.floor((y - 30 + this.cameraY) / 24);
    this.selectTile(tileX, tileY);
  }

  key(event) {
    const code = event.code;
    if (this.state === 'splash') { this.pointer(0, 0); return; }
    if (this.state === 'prologue') { this.state = 'story'; this.storyIndex = 0; this.paint(); return; }
    if (this.state === 'story') {
      if (this.storyIndex < 5) this.storyIndex++;
      else this.startMission();
      this.paint(); return;
    }
    if (this.state === 'briefing') { this.startMission(); return; }
    if (this.state === 'dialog') { this.state = 'play'; this.paint(); return; }
    const movement = { ArrowUp: [0, -1], KeyW: [0, -1], Digit8: [0, -1], ArrowDown: [0, 1], KeyS: [0, 1], Digit2: [0, 1], ArrowLeft: [-1, 0], KeyA: [-1, 0], Digit4: [-1, 0], ArrowRight: [1, 0], KeyD: [1, 0], Digit6: [1, 0] };
    if (movement[code]) { this.moveCursor(...movement[code]); return; }
    if (code === 'Enter' || code === 'Space' || code === 'Digit5') { this.selectTile(this.cursor.x, this.cursor.y); return; }
    if (code === 'Escape') { this.dialogText = 'ESCAPE · CHƯA XÁC MINH'; this.state = 'dialog'; this.dialogTimer = 0; this.paint(); return; }
    if (code === 'KeyE') this.endTurn();
  }

  startMission() {
    this.state = 'play';
    this.scenario = 0;
    this.scenarioStep = 0;
    this.playerIndex = 0;
    const firstPlayerUnit = this.units.find(unit => unit.playerSelector === 1);
    this.cursor = { x: firstPlayerUnit?.x ?? 0, y: firstPlayerUnit?.y ?? 0 };
    this.status.textContent = 'READY · OFFLINE';
    this.paint();
  }

  tileProperty(x, y) {
    if (x < 0 || y < 0 || x >= this.assets.map.width || y >= this.assets.map.height) return null;
    const tile = this.assets.map.tiles[x][y];
    return this.assets.terrain.properties[tile] ?? null;
  }

  teamFor(playerSelector) {
    // Palette is separate from ownership; using palette equality would invent an alliance rule.
    return playerSelector;
  }

  unitAt(x, y) { return this.units.find(unit => unit.x === x && unit.y === y && unit.action !== 3); }

  showRange(unit) {
    const record = this.assets.unitRecords[unit.type];
    const movementMask = record.movementMaskBits.reduce((mask, bit) => mask | (1 << bit), 0);
    const movementBudget = record.fields[0];
    return calculateReachability({
      origin: unit,
      width: this.assets.map.width,
      height: this.assets.map.height,
      movementBudget,
      movementRadius: movementBudget,
      unitType: unit.type,
      movementMask,
      terrainAt: (x, y) => this.tileProperty(x, y) ?? 0,
      playerAt: (x, y) => this.unitAt(x, y)?.playerSelector ?? unit.playerSelector,
      playerPalette: this.playerPalette,
      units: this.units,
    });
  }

  selectTile(x, y) {
    if (x < 0 || y < 0 || x >= this.assets.map.width || y >= this.assets.map.height) return;
    this.cursor = { x, y };
    const target = this.unitAt(x, y);
    if (this.selected) {
      if (target && target.id !== this.selected.id) {
        if (this.playerPalette[target.playerSelector] !== this.playerPalette[this.selected.playerSelector]) {
          this.openActionDialog(this.selected, target);
          return;
        }
        return;
      }
      if (this.reachable?.costs.has(`${x},${y}`)) {
        // Port of c.java:346-399: selected route uses x-then-y straight ordering.
        this.selected.x = x;
        this.selected.y = y;
        this.selected.action = 1;
        this.selected = null;
        this.reachable = null;
        this.persistState();
      } else {
        this.dialogText = 'MOVEMENT RANGE · CHƯA XÁC MINH';
        this.state = 'dialog';
        this.dialogTimer = 0;
      }
    } else if (target && target.playerSelector === 1 + this.playerIndex) {
      this.selected = target;
      this.reachable = this.showRange(target);
    }
    this.paint();
  }

  moveCursor(dx, dy) {
    this.cursor.x = Math.max(0, Math.min(this.assets.map.width - 1, this.cursor.x + dx));
    this.cursor.y = Math.max(0, Math.min(this.assets.map.height - 1, this.cursor.y + dy));
    this.paint();
  }

  pan(direction) {
    if (direction === 0) this.cameraX = Math.min(Math.max(0, this.assets.map.width * 24 - WIDTH), this.cameraX + 24);
    else if (direction === 1) this.cameraY = Math.min(Math.max(0, this.assets.map.height * 24 - 264), this.cameraY + 24);
    else this.cameraX = Math.max(0, this.cameraX - 24);
    this.paint();
  }

  openActionDialog(attacker, defender) {
    this.lastBattle = { attackerId: attacker.id, defenderId: defender.id };
    this.state = 'dialog';
    this.dialogText = 'SELECT ACTION / ATTACK';
    this.dialogTimer = 250;
    // Java opens an action selection dialog on the source action input path.
    // Battle math is intentionally withheld until unit faction/palette and lookup fields are resolved.
    this.paint();
  }

  runAiStep() {
    // Source AI (`i.q()`/`i.e(c)`) remains deliberately unported until complete
    // scoring decisions and action execution are translated from bytecode.
    this.aiPending = false;
    this.state = 'play';
    this.dialogText = 'AI ACTION PATH CHƯA XÁC MINH';
    this.state = 'dialog';
    this.dialogTimer = 4000;
  }

  endTurn() {
    // CHƯA XÁC MINH: i.o() advances through configured player modes, resets
    // unit states, and computes income from owned properties. The opaque map
    // section and setup team table are not decoded here, so do not fake a turn.
    this.dialogText = 'END TURN · CHƯA XÁC MINH';
    this.state = 'dialog';
    this.dialogTimer = 0;
    this.paint();
  }

  persistState() {
    // Web storage is an adaptation, not the original RecordStore save format.
    const data = { turn: this.turn, playerIndex: this.playerIndex, cursor: this.cursor, units: this.units };
    try { localStorage.setItem(this.saveKey, JSON.stringify(data)); } catch { /* offline play remains in memory */ }
  }

  renderRange(ctx) {
    if (!this.reachable) return;
    ctx.save();
    ctx.fillStyle = 'rgba(80,220,255,.3)';
    for (const [x, y] of this.reachable.cells) {
      ctx.fillRect(x * 24 - this.cameraX, 30 + y * 24 - this.cameraY, 24, 24);
    }
    ctx.restore();
  }

  paint() {
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    if (this.state === 'splash') {
      drawImageAt(ctx, this.assets.images.splash, 0, 0, WIDTH, HEIGHT);
      centerText(ctx, 'PRESS ANY KEY', 300, { color: '#fff0c0' });
      return;
    }
    if (this.state === 'prologue' || this.state === 'story' || this.state === 'briefing') {
      const idx = this.state === 'prologue' ? 0 : Math.min(5, this.storyIndex + 1);
      const intro = this.assets.images[`intro${idx}`];
      drawImageAt(ctx, this.assets.images.logo, 1, 5, 238, 85);
      drawImageAt(ctx, intro, 0, 120, WIDTH, 139);
      centerText(ctx, this.state === 'briefing' ? 'TEMPLE RAIDERS' : this.state === 'prologue' ? 'TAP TO BEGIN' : `CAMPAIGN ${this.storyIndex + 1}`, 285, { color: '#f4d78e' });
      return;
    }
    const rangeCanvas = document.createElement('canvas');
    rangeCanvas.width = WIDTH;
    rangeCanvas.height = HEIGHT;
    const rangeContext = rangeCanvas.getContext('2d');
    renderOriginalBoard(rangeContext, {
      map: this.assets.map,
      assets: this.assets,
      cameraX: this.cameraX,
      cameraY: this.cameraY,
      viewportWidth: WIDTH,
      viewportHeight: HEIGHT,
      units: this.units,
      cursor: this.cursor,
    });
    ctx.drawImage(rangeCanvas, 0, 0);
    this.renderRange(ctx);
    drawRegionMIDP(ctx, this.assets.images.unit_icons, 0, 0, 24, 24, 0, 4, 3, MIDP.LEFT | MIDP.TOP);
    ctx.fillStyle = '#f4dfb3';
    ctx.font = '8px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`TURN ${this.turn + 1} · PLAYER ${this.playerIndex + 1}`, 32, 11);
    ctx.fillText(`UNIT ${this.selected ? this.selected.type : '-'}`, 32, 22);
    ctx.fillText('ENTER/5 SELECT · E END TURN', 4, 315);
    if (this.state === 'dialog') {
      ctx.fillStyle = '#150d18'; ctx.fillRect(12, 132, 216, 56);
      ctx.strokeStyle = '#caa568'; ctx.strokeRect(12, 132, 216, 56);
      centerText(ctx, this.dialogText, 160, { font: '9px monospace', maxWidth: 205 });
    }
  }
}

const status = document.getElementById('system-status');
const canvas = document.createElement('canvas');
canvas.width = WIDTH;
canvas.height = HEIGHT;
canvas.setAttribute('aria-label', 'Ancient Empires II game board');
canvas.setAttribute('role', 'application');
const host = document.getElementById('game');
host.replaceChildren(canvas);

loadAssets().then(assets => {
  window.__ae2 = new AncientEmpiresWeb(canvas, assets, status);
  status.textContent = 'READY · OFFLINE';
}).catch(error => {
  status.textContent = 'LOAD ERROR';
  console.error(error);
});
