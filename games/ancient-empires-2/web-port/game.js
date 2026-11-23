import { decodeMap, decodeSprite, decodeTerrainProperties, decodeUnits, fetchBytes, transformPalettePixels } from './ancient-empires-loader.js';
import {
  advancePlayerTurn,
  buildingPaletteFromTile,
  calculateReachability,
  chooseAiUnitAction,
  computeUnitStats,
  encodeBuildingTile,
  executeCombat,
  getAttackableTargets,
  getTileActionForUnit,
} from './ancient-empires-core.js';
import { drawRegionMIDP, renderOriginalBoard } from './render-original.js';

const WIDTH = 240;
const HEIGHT = 320;
const MIDP = Object.freeze({ HCENTER: 1, VCENTER: 2, LEFT: 4, RIGHT: 8, TOP: 16, BOTTOM: 32 });
const CAMPAIGN_MAPS = ['m0', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7'];
const SKIRMISH_MAPS = ['s0', 's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11'];
const UNIT_LANG_BASE = [139, 143, 147, 151, 155, 159, 163, 167, 171, 175, 179];

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
  const [unitBytes, propertyBytes, packManifest, langStrings] = await Promise.all([
    fetchBytes('assets/units.bin'),
    fetchBytes('assets/tiles0.prop'),
    fetch('assets/manifest.json').then(r => {
      if (!r.ok) throw new Error(`Cannot verify original asset inventory: HTTP ${r.status}`);
      return r.json();
    }),
    fetch('data/lang-en.json').then(r => (r.ok ? r.json() : [])).catch(() => []),
  ]);
  const originalNames = new Set(packManifest.resources.map(resource => resource.name));
  const hasOriginalAsset = name => originalNames.has(name);
  const map = decodeMap(await fetchBytes('assets/m0'), 'm0');
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
        frameImages[name] = await Promise.all(sprites[name].frames.map(async frame => {
          const frameUrl = `${name}_${String(frame.sourceFrame).padStart(2, '0')}.png`;
          return hasOriginalAsset(frameUrl) ? loadImage(`assets/${frameUrl}`) : null;
        }));
      }
    } catch {
      // Omit optional sprite only if absent from original pack.
    }
  }));

  const buildingPaletteImages = [];
  const buildingSheet = images.buildings;
  for (let palette = 0; palette < 5; palette++) {
    buildingPaletteImages.push(palette === 0 ? buildingSheet : await recolorPalette(buildingSheet, palette));
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
          return hasOriginalAsset(frameUrl) ? loadImage(`assets/${frameUrl}`) : null;
        }));
      }
    } catch { /* keep original type */ }
  }));

  const coloredPalettes = [];
  for (let palette = 1; palette <= 4; palette++) {
    const familyImages = {};
    for (const family of originalUnitFamilies) {
      if (!family) continue;
      const original = images[family];
      if (original) familyImages[family] = await recolorPalette(original, palette);
      else if (frameImages[family]) familyImages[family] = await Promise.all(frameImages[family].map(img => (img ? recolorPalette(img, palette) : null)));
    }
    coloredPalettes[palette] = familyImages;
  }

  return { map, unitRecords, terrain, sprites, images, frameImages, unitFamilies, buildingPaletteImages, coloredPalettes, langStrings };
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
    this.state = 'splash'; // splash | menu | levelSelect | play | actionMenu | recruitMenu | dialog | victory | defeat
    this.menuCursor = 0;
    this.mapList = [...CAMPAIGN_MAPS, ...SKIRMISH_MAPS];
    this.mapIndex = 0;
    this.currentMapId = 'm0';
    this.cursor = { x: 0, y: 0 };
    this.selected = null;
    this.moveOrigin = null;
    this.reachable = null;
    this.attackTargets = [];
    this.turn = 0;
    this.playerIndex = 0;
    this.playerCount = 2;
    this.playerModes = [1, 0]; // 1 = Human (Player 1), 0 = AI (Player 2+)
    this.balances = [300, 300, 300, 300];
    this.playerPositions = [];
    this.playerPalette = [0, 1, 2, 3, 4];
    this.units = [];
    this.nextUnitId = 1;
    this.cameraX = 0;
    this.cameraY = 0;
    this.dialogText = '';
    this.dialogTimer = 0;
    this.actionOptions = [];
    this.actionCursor = 0;
    this.recruitCastle = null;
    this.recruitCursor = 0;
    this.aiPending = false;
    this.aiTimer = 0;
    this.animTick = 0;
    this.saveKey = 'ae2-local-state-v2';
    this.lastTick = 0;
    this.accumulator = 0;
    this.initMapState(assets.map, 'm0');
    this.bindInput();
    requestAnimationFrame(time => this.loop(time));
    this.paint();
  }

  unitName(type) {
    const idx = UNIT_LANG_BASE[type];
    const str = idx != null ? this.assets.langStrings?.[idx] : null;
    return str || `UNIT ${type}`;
  }

  initMapState(mapData, mapId) {
    this.currentMapId = mapId;
    this.assets.map = {
      ...mapData,
      tiles: mapData.tiles.map(col => Int8Array.from(col)),
    };
    const players = new Set(mapData.units.map(u => u.playerSelector));
    this.playerCount = Math.max(2, ...players);
    this.playerModes = Array.from({ length: this.playerCount }, (_, i) => (i === 0 ? 1 : 0));
    this.balances = Array.from({ length: this.playerCount }, () => 350);
    this.playerPositions = Array.from({ length: this.playerCount }, () => [0, 0]);
    this.playerPalette = [0, 1, 2, 3, 4];
    this.turn = 0;
    this.playerIndex = 0;
    this.nextUnitId = 1;
    this.units = mapData.units.map(record => {
      const stats = computeUnitStats(this.assets.unitRecords[record.type], 0);
      return {
        ...record,
        ...stats,
        id: this.nextUnitId++,
        hp: 100,
        xp: 0,
        level: 0,
        status: 0,
        frameIndex: 0,
        action: 0,
        movedThisTurn: false,
        palette: this.playerPalette[record.playerSelector] ?? record.playerSelector,
      };
    });
    const first = this.units.find(u => u.playerSelector === 1);
    this.cursor = { x: first?.x ?? 0, y: first?.y ?? 0 };
    this.centerCameraOn(this.cursor.x, this.cursor.y);
    this.selected = null;
    this.reachable = null;
    this.attackTargets = [];
  }

  async loadAndStartMap(mapId) {
    try {
      this.status.textContent = `LOADING ${mapId.toUpperCase()}...`;
      const decoded = decodeMap(await fetchBytes(`assets/${mapId}`), mapId);
      this.initMapState(decoded, mapId);
      this.state = 'play';
      this.status.textContent = `${mapId.toUpperCase()} · READY`;
      this.paint();
    } catch (err) {
      this.dialogText = `CANNOT LOAD ${mapId}`;
      this.state = 'dialog';
      this.dialogTimer = 2000;
      console.error(err);
    }
  }

  bindInput() {
    this.canvas.addEventListener('pointerdown', event => {
      const rect = this.canvas.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left) * WIDTH / rect.width);
      const y = Math.floor((event.clientY - rect.top) * HEIGHT / rect.height);
      this.pointer(x, y);
    });
    window.addEventListener('keydown', event => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Space', 'Escape', '2', '4', '6', '8', '5'].includes(event.code) || /^[24568]$/.test(event.key)) {
        event.preventDefault();
      }
      this.key(event);
    });
  }

  loop(time) {
    if (this.lastTick === 0) this.lastTick = time;
    this.accumulator += Math.min(time - this.lastTick, 200);
    this.lastTick = time;
    // Port of e.java:429-460: 50ms simulation cadence
    while (this.accumulator >= 50) {
      this.tick();
      this.accumulator -= 50;
    }
    this.paint();
    requestAnimationFrame(next => this.loop(next));
  }

  tick() {
    this.animTick++;
    if (this.animTick % 6 === 0) {
      for (const u of this.units) {
        if (u.action !== 3) u.frameIndex = (u.frameIndex + 1) % 2;
      }
    }
    if (this.state === 'dialog' && this.dialogTimer > 0) {
      this.dialogTimer -= 50;
      if (this.dialogTimer <= 0) this.state = 'play';
    }
    if (this.state === 'play' && this.aiPending) {
      this.aiTimer -= 50;
      if (this.aiTimer <= 0) this.runAiStep();
    }
  }

  pointer(x, y) {
    if (this.state === 'splash') { this.state = 'menu'; this.paint(); return; }
    if (this.state === 'menu') {
      if (y >= 150 && y <= 176) this.startCampaign();
      else if (y >= 180 && y <= 206) { this.state = 'levelSelect'; this.paint(); }
      else if (y >= 210 && y <= 236) this.loadSavedGame();
      else this.startCampaign();
      return;
    }
    if (this.state === 'levelSelect') {
      if (y >= 280) { this.state = 'menu'; this.paint(); return; }
      const idx = Math.floor((y - 54) / 18);
      if (idx >= 0 && idx < this.mapList.length) {
        this.mapIndex = idx;
        this.loadAndStartMap(this.mapList[idx]);
      }
      return;
    }
    if (this.state === 'victory' || this.state === 'defeat') {
      if (this.state === 'victory') {
        const nextIdx = CAMPAIGN_MAPS.indexOf(this.currentMapId) + 1;
        if (nextIdx > 0 && nextIdx < CAMPAIGN_MAPS.length) {
          this.loadAndStartMap(CAMPAIGN_MAPS[nextIdx]);
          return;
        }
      }
      this.state = 'menu';
      this.paint();
      return;
    }
    if (this.state === 'dialog') { this.state = 'play'; this.paint(); return; }
    if (this.state === 'actionMenu') {
      const boxTop = 108;
      const idx = Math.floor((y - boxTop - 8) / 20);
      if (idx >= 0 && idx < this.actionOptions.length && x >= 44 && x <= 196) {
        this.confirmActionOption(idx);
      } else {
        this.cancelSelection();
      }
      return;
    }
    if (this.state === 'recruitMenu') {
      const boxTop = 52;
      const idx = Math.floor((y - boxTop - 22) / 22);
      if (x >= 20 && x <= 220 && idx >= 0 && idx < 9) {
        this.confirmRecruit(idx);
      } else {
        this.state = 'play';
        this.recruitCastle = null;
        this.paint();
      }
      return;
    }
    if (this.state !== 'play') return;

    // Bottom HUD bar buttons: END TURN (right) & MENU (left)
    if (y >= HEIGHT - 28) {
      if (x >= WIDTH - 84) this.endTurn();
      else if (x <= 66) { this.state = 'menu'; this.paint(); }
      return;
    }
    // Top bar pan / camera nudges
    if (y < 28) {
      if (x > 180) this.pan(x > 210 ? 0 : x > 195 ? 1 : 2);
      return;
    }
    const tileX = Math.floor((x + this.cameraX) / 24);
    const tileY = Math.floor((y - 28 + this.cameraY) / 24);
    this.selectTile(tileX, tileY);
  }

  key(event) {
    const code = event.code;
    if (this.state === 'splash') { this.state = 'menu'; this.paint(); return; }
    if (this.state === 'menu') {
      if (code === 'ArrowUp' || code === 'KeyW') this.menuCursor = (this.menuCursor + 2) % 3;
      else if (code === 'ArrowDown' || code === 'KeyS') this.menuCursor = (this.menuCursor + 1) % 3;
      else if (code === 'Enter' || code === 'Space' || code === 'Digit5') {
        if (this.menuCursor === 0) this.startCampaign();
        else if (this.menuCursor === 1) { this.state = 'levelSelect'; this.paint(); }
        else this.loadSavedGame();
      }
      this.paint();
      return;
    }
    if (this.state === 'levelSelect') {
      if (code === 'ArrowUp' || code === 'KeyW') this.mapIndex = (this.mapIndex + this.mapList.length - 1) % this.mapList.length;
      else if (code === 'ArrowDown' || code === 'KeyS') this.mapIndex = (this.mapIndex + 1) % this.mapList.length;
      else if (code === 'Enter' || code === 'Space' || code === 'Digit5') this.loadAndStartMap(this.mapList[this.mapIndex]);
      else if (code === 'Escape') this.state = 'menu';
      this.paint();
      return;
    }
    if (this.state === 'victory' || this.state === 'defeat') { this.pointer(0, 0); return; }
    if (this.state === 'dialog') { this.state = 'play'; this.paint(); return; }
    if (this.state === 'actionMenu') {
      if (code === 'ArrowUp' || code === 'KeyW') this.actionCursor = (this.actionCursor + this.actionOptions.length - 1) % this.actionOptions.length;
      else if (code === 'ArrowDown' || code === 'KeyS') this.actionCursor = (this.actionCursor + 1) % this.actionOptions.length;
      else if (code === 'Enter' || code === 'Space' || code === 'Digit5') this.confirmActionOption(this.actionCursor);
      else if (code === 'Escape') this.cancelSelection();
      this.paint();
      return;
    }
    if (this.state === 'recruitMenu') {
      if (code === 'ArrowUp' || code === 'KeyW') this.recruitCursor = (this.recruitCursor + 8) % 9;
      else if (code === 'ArrowDown' || code === 'KeyS') this.recruitCursor = (this.recruitCursor + 1) % 9;
      else if (code === 'Enter' || code === 'Space' || code === 'Digit5') this.confirmRecruit(this.recruitCursor);
      else if (code === 'Escape') { this.state = 'play'; this.recruitCastle = null; }
      this.paint();
      return;
    }

    const movement = {
      ArrowUp: [0, -1], KeyW: [0, -1], Digit8: [0, -1],
      ArrowDown: [0, 1], KeyS: [0, 1], Digit2: [0, 1],
      ArrowLeft: [-1, 0], KeyA: [-1, 0], Digit4: [-1, 0],
      ArrowRight: [1, 0], KeyD: [1, 0], Digit6: [1, 0],
    };
    if (movement[code]) { this.moveCursor(...movement[code]); return; }
    if (code === 'Enter' || code === 'Space' || code === 'Digit5') { this.selectTile(this.cursor.x, this.cursor.y); return; }
    if (code === 'Escape') { this.cancelSelection(); return; }
    if (code === 'KeyE') this.endTurn();
  }

  startCampaign() {
    this.loadAndStartMap('m0');
  }

  tileProperty(x, y) {
    if (x < 0 || y < 0 || x >= this.assets.map.width || y >= this.assets.map.height) return null;
    return this.assets.terrain.properties[this.assets.map.tiles[x][y]] ?? 0;
  }

  rawTile(x, y) {
    if (x < 0 || y < 0 || x >= this.assets.map.width || y >= this.assets.map.height) return 0;
    return this.assets.map.tiles[x][y];
  }

  teamFor(playerSelector) {
    return playerSelector;
  }

  unitAt(x, y) {
    return this.units.find(u => u.x === x && u.y === y && u.action !== 3);
  }

  tombstoneAt(x, y) {
    return this.units.find(u => u.x === x && u.y === y && u.action === 3);
  }

  isPropertyOwnedBy(x, y, playerIdx) {
    const pal = this.playerPalette[playerIdx + 1] ?? (playerIdx + 1);
    return buildingPaletteFromTile(this.rawTile(x, y)) === pal;
  }

  showRange(unit) {
    return calculateReachability({
      unit,
      width: this.assets.map.width,
      height: this.assets.map.height,
      terrainAt: (x, y) => this.tileProperty(x, y) ?? 0,
      unitAt: (x, y) => this.unitAt(x, y),
      teamForPlayer: p => this.teamFor(p),
    });
  }

  centerCameraOn(tx, ty) {
    const maxCamX = Math.max(0, this.assets.map.width * 24 - WIDTH);
    const maxCamY = Math.max(0, this.assets.map.height * 24 - (HEIGHT - 56));
    this.cameraX = Math.max(0, Math.min(maxCamX, tx * 24 - (WIDTH >> 1) + 12));
    this.cameraY = Math.max(0, Math.min(maxCamY, ty * 24 - ((HEIGHT - 56) >> 1) + 12));
  }

  cancelSelection() {
    if (this.selected && this.moveOrigin) {
      this.selected.x = this.moveOrigin.x;
      this.selected.y = this.moveOrigin.y;
      this.selected.movedThisTurn = false;
    }
    this.selected = null;
    this.moveOrigin = null;
    this.reachable = null;
    this.attackTargets = [];
    this.actionOptions = [];
    this.state = 'play';
    this.paint();
  }

  selectTile(x, y) {
    if (this.playerModes[this.playerIndex] !== 1) return;
    if (x < 0 || y < 0 || x >= this.assets.map.width || y >= this.assets.map.height) return;
    this.cursor = { x, y };
    const mySelector = 1 + this.playerIndex;
    const target = this.unitAt(x, y);

    if (this.selected) {
      // Attack an enemy directly if highlighted
      if (target && target.playerSelector !== mySelector) {
        const valid = getAttackableTargets(this.selected, this.units, p => this.teamFor(p));
        if (valid.some(t => t.id === target.id)) {
          this.performAttack(this.selected, target);
          return;
        }
      }
      // Confirm move to current tile or reachable tile -> open Action Menu
      if ((x === this.selected.x && y === this.selected.y) || this.reachable?.costs.has(`${x},${y}`)) {
        const moved = x !== this.moveOrigin.x || y !== this.moveOrigin.y;
        this.selected.x = x;
        this.selected.y = y;
        this.selected.movedThisTurn = moved;
        this.openActionMenu(this.selected);
        return;
      }
      this.cancelSelection();
      return;
    }

    // Select own idle unit
    if (target && target.playerSelector === mySelector && target.action === 0) {
      this.selected = target;
      this.moveOrigin = { x: target.x, y: target.y };
      this.reachable = this.showRange(target);
      this.attackTargets = getAttackableTargets(target, this.units, p => this.teamFor(p));
      this.paint();
      return;
    }

    // Click own Castle (property 9) when empty -> open Recruit Menu!
    if (!target && this.tileProperty(x, y) === 9 && this.isPropertyOwnedBy(x, y, this.playerIndex)) {
      this.recruitCastle = { x, y };
      this.recruitCursor = 0;
      this.state = 'recruitMenu';
      this.paint();
    }
  }

  openActionMenu(unit) {
    const opts = [];
    const targets = getAttackableTargets(unit, this.units, p => this.teamFor(p));
    if (targets.length > 0) {
      opts.push({ kind: 'attack', label: `ATTACK (${targets.length})`, targets });
    }
    const myPal = this.playerPalette[unit.playerSelector] ?? unit.playerSelector;
    const tileAct = getTileActionForUnit(unit, this.rawTile(unit.x, unit.y), this.tileProperty(unit.x, unit.y), myPal);
    if (tileAct === 'capture') opts.push({ kind: 'capture', label: 'CAPTURE' });
    else if (tileAct === 'repair') opts.push({ kind: 'repair', label: 'REPAIR' });

    // Sorceress (type 3) can raise Skeleton from adjacent tombstone (i.java:2515-2530)
    if (unit.type === 3) {
      const tomb = this.units.find(
        u => u.action === 3 && Math.abs(u.x - unit.x) + Math.abs(u.y - unit.y) === 1 && !this.unitAt(u.x, u.y)
      );
      if (tomb) opts.push({ kind: 'raise', label: 'RAISE SKELETON', tomb });
    }

    opts.push({ kind: 'wait', label: 'WAIT' });
    this.actionOptions = opts;
    this.actionCursor = 0;
    this.attackTargets = targets;
    this.state = 'actionMenu';
    this.paint();
  }

  confirmActionOption(idx) {
    const opt = this.actionOptions[idx];
    const unit = this.selected;
    if (!opt || !unit) { this.cancelSelection(); return; }

    if (opt.kind === 'attack') {
      const bestTarget = opt.targets[0];
      this.performAttack(unit, bestTarget);
      return;
    }
    if (opt.kind === 'capture' || opt.kind === 'repair') {
      const myPal = this.playerPalette[unit.playerSelector] ?? unit.playerSelector;
      this.assets.map.tiles[unit.x][unit.y] = encodeBuildingTile(this.rawTile(unit.x, unit.y), myPal);
      unit.action = 1;
      this.showToast(opt.kind === 'capture' ? 'CAPTURED!' : 'REPAIRED!', 900);
    } else if (opt.kind === 'raise' && opt.tomb) {
      const stats = computeUnitStats(this.assets.unitRecords[10], 0);
      Object.assign(opt.tomb, {
        ...stats,
        type: 10,
        playerSelector: unit.playerSelector,
        palette: unit.palette,
        hp: 100,
        xp: 0,
        level: 0,
        status: 0,
        action: 1,
        tombTimer: 0,
      });
      unit.action = 1;
      this.showToast('RAISED SKELETON!', 900);
    } else {
      unit.action = 1;
    }

    this.selected = null;
    this.moveOrigin = null;
    this.reachable = null;
    this.attackTargets = [];
    this.state = this.state === 'dialog' ? 'dialog' : 'play';
    this.persistState();
    this.checkMatchOutcome();
    this.paint();
  }

  performAttack(attacker, defender) {
    const res = executeCombat({
      attacker,
      defender,
      terrainAt: (x, y) => this.tileProperty(x, y) ?? 0,
      rawTileAt: (x, y) => this.rawTile(x, y),
    });
    attacker.action = 1;
    this.selected = null;
    this.moveOrigin = null;
    this.reachable = null;
    this.attackTargets = [];
    const msg = res.counterDamage > 0
      ? `HIT -${res.damage} · COUNTER -${res.counterDamage}${res.attackerLeveled ? ' · LV UP!' : ''}`
      : `HIT -${res.damage}${res.attackerLeveled ? ' · LV UP!' : ''}`;
    this.showToast(msg, 1200);
    this.persistState();
    this.checkMatchOutcome();
  }

  confirmRecruit(unitType) {
    if (!this.recruitCastle) return;
    const rec = this.assets.unitRecords[unitType];
    const cost = rec?.shortValue ?? 9999;
    const gold = this.balances[this.playerIndex] ?? 0;
    if (gold < cost || this.unitAt(this.recruitCastle.x, this.recruitCastle.y)) {
      this.showToast(gold < cost ? 'NOT ENOUGH GOLD!' : 'TILE OCCUPIED!', 900);
      return;
    }
    this.balances[this.playerIndex] = gold - cost;
    const stats = computeUnitStats(rec, 0);
    this.units.push({
      id: this.nextUnitId++,
      type: unitType,
      playerSelector: 1 + this.playerIndex,
      palette: this.playerPalette[1 + this.playerIndex] ?? (1 + this.playerIndex),
      x: this.recruitCastle.x,
      y: this.recruitCastle.y,
      ...stats,
      hp: 100,
      xp: 0,
      level: 0,
      status: 0,
      frameIndex: 0,
      action: 1,
      movedThisTurn: false,
    });
    this.recruitCastle = null;
    this.state = 'play';
    this.persistState();
    this.paint();
  }

  showToast(text, ms = 1000) {
    this.dialogText = text;
    this.dialogTimer = ms;
    this.state = 'dialog';
  }

  moveCursor(dx, dy) {
    this.cursor.x = Math.max(0, Math.min(this.assets.map.width - 1, this.cursor.x + dx));
    this.cursor.y = Math.max(0, Math.min(this.assets.map.height - 1, this.cursor.y + dy));
    this.centerCameraOn(this.cursor.x, this.cursor.y);
    this.paint();
  }

  pan(direction) {
    if (direction === 0) this.cameraX = Math.min(Math.max(0, this.assets.map.width * 24 - WIDTH), this.cameraX + 24);
    else if (direction === 1) this.cameraY = Math.min(Math.max(0, this.assets.map.height * 24 - 264), this.cameraY + 24);
    else this.cameraX = Math.max(0, this.cameraX - 24);
    this.paint();
  }

  endTurn() {
    this.selected = null;
    this.moveOrigin = null;
    this.reachable = null;
    this.attackTargets = [];
    const res = advancePlayerTurn({
      playerIndex: this.playerIndex,
      playerCount: this.playerCount,
      turnCount: this.turn,
      playerModes: this.playerModes,
      playerPositions: this.playerPositions,
      units: this.units,
      propertyOwnerAt: Object.assign(
        (x, y, player) => this.isPropertyOwnedBy(x, y, player),
        { width: this.assets.map.width, height: this.assets.map.height }
      ),
      terrainPropertyAt: (x, y) => this.tileProperty(x, y) ?? 0,
      balances: this.balances,
    });
    this.playerIndex = res.playerIndex;
    this.turn = res.turnCount;
    this.persistState();
    this.checkMatchOutcome();
    if (this.state === 'victory' || this.state === 'defeat') return;

    if (this.playerModes[this.playerIndex] === 0) {
      this.aiPending = true;
      this.aiTimer = 350;
      this.status.textContent = `CPU TURN · +${res.income}G`;
    } else {
      this.aiPending = false;
      this.status.textContent = `TURN ${this.turn + 1} · +${res.income}G`;
      this.showToast(`PLAYER ${this.playerIndex + 1} TURN (+${res.income}G)`, 900);
    }
    this.paint();
  }

  runAiStep() {
    const mySelector = 1 + this.playerIndex;
    const myPal = this.playerPalette[mySelector] ?? mySelector;
    const idleUnit = this.units.find(u => u.playerSelector === mySelector && u.action === 0 && u.hp > 0);
    if (idleUnit) {
      const act = chooseAiUnitAction({
        unit: idleUnit,
        units: this.units,
        map: this.assets.map,
        terrainAt: (x, y) => this.tileProperty(x, y) ?? 0,
        unitAt: (x, y) => this.unitAt(x, y),
        teamForPlayer: p => this.teamFor(p),
        myPalette: myPal,
      });
      idleUnit.x = act.x;
      idleUnit.y = act.y;
      if (act.kind === 'capture' || act.kind === 'repair') {
        this.assets.map.tiles[act.x][act.y] = encodeBuildingTile(this.rawTile(act.x, act.y), myPal);
      } else if (act.kind === 'attack') {
        const target = this.units.find(u => u.id === act.targetId);
        if (target && target.hp > 0) {
          executeCombat({
            attacker: idleUnit,
            defender: target,
            terrainAt: (x, y) => this.tileProperty(x, y) ?? 0,
            rawTileAt: (x, y) => this.rawTile(x, y),
          });
        }
      }
      idleUnit.action = 1;
      this.centerCameraOn(idleUnit.x, idleUnit.y);
      this.aiTimer = 260;
      this.checkMatchOutcome();
      this.paint();
      return;
    }

    // AI Castle Recruitment (i.java:3774-3850)
    const gold = this.balances[this.playerIndex] ?? 0;
    if (gold >= 150) {
      for (let x = 0; x < this.assets.map.width; x++) {
        for (let y = 0; y < this.assets.map.height; y++) {
          if (this.tileProperty(x, y) === 9 && this.isPropertyOwnedBy(x, y, this.playerIndex) && !this.unitAt(x, y)) {
            const pickType = gold >= 450 ? 3 : gold >= 250 ? 1 : 0;
            const rec = this.assets.unitRecords[pickType];
            if (rec && (this.balances[this.playerIndex] ?? 0) >= rec.shortValue) {
              this.balances[this.playerIndex] -= rec.shortValue;
              const stats = computeUnitStats(rec, 0);
              this.units.push({
                id: this.nextUnitId++,
                type: pickType,
                playerSelector: mySelector,
                palette: myPal,
                x,
                y,
                ...stats,
                hp: 100,
                xp: 0,
                level: 0,
                status: 0,
                frameIndex: 0,
                action: 1,
                movedThisTurn: false,
              });
              break;
            }
          }
        }
      }
    }

    this.aiPending = false;
    this.endTurn();
  }

  checkMatchOutcome() {
    const aliveHuman = this.units.some(u => u.playerSelector === 1 && u.action !== 3 && u.hp > 0);
    const aliveCpu = this.units.some(u => u.playerSelector !== 1 && u.action !== 3 && u.hp > 0);
    if (!aliveCpu) {
      this.aiPending = false;
      this.state = 'victory';
      this.status.textContent = 'VICTORY!';
    } else if (!aliveHuman) {
      this.aiPending = false;
      this.state = 'defeat';
      this.status.textContent = 'DEFEAT!';
    }
  }

  persistState() {
    const data = {
      mapId: this.currentMapId,
      turn: this.turn,
      playerIndex: this.playerIndex,
      balances: this.balances,
      cursor: this.cursor,
      units: this.units,
      tiles: Array.from(this.assets.map.tiles, col => Array.from(col)),
    };
    try { localStorage.setItem(this.saveKey, JSON.stringify(data)); } catch { /* ignore */ }
  }

  async loadSavedGame() {
    try {
      const raw = localStorage.getItem(this.saveKey);
      if (!raw) { this.startCampaign(); return; }
      const saved = JSON.parse(raw);
      const mapData = decodeMap(await fetchBytes(`assets/${saved.mapId || 'm0'}`), saved.mapId || 'm0');
      this.initMapState(mapData, saved.mapId || 'm0');
      if (Array.isArray(saved.tiles)) {
        this.assets.map.tiles = saved.tiles.map(col => Int8Array.from(col));
      }
      if (Array.isArray(saved.units)) this.units = saved.units;
      if (Array.isArray(saved.balances)) this.balances = saved.balances;
      this.turn = saved.turn || 0;
      this.playerIndex = saved.playerIndex || 0;
      this.cursor = saved.cursor || this.cursor;
      this.state = 'play';
      this.paint();
    } catch {
      this.startCampaign();
    }
  }

  renderRange(ctx) {
    if (this.reachable) {
      ctx.save();
      ctx.fillStyle = 'rgba(80,220,255,.32)';
      for (const [x, y] of this.reachable.cells) {
        ctx.fillRect(x * 24 - this.cameraX, 28 + y * 24 - this.cameraY, 24, 24);
      }
      ctx.restore();
    }
    if (this.attackTargets.length > 0) {
      ctx.save();
      ctx.strokeStyle = '#ff4b4b';
      ctx.lineWidth = 2;
      for (const t of this.attackTargets) {
        ctx.strokeRect(t.x * 24 - this.cameraX + 1, 28 + t.y * 24 - this.cameraY + 1, 22, 22);
      }
      ctx.restore();
    }
  }

  paint() {
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#0e131a';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    if (this.state === 'splash') {
      drawImageAt(ctx, this.assets.images.splash, 0, 0, WIDTH, HEIGHT);
      centerText(ctx, 'PRESS ANY KEY / TAP', 298, { color: '#fff0c0' });
      return;
    }

    if (this.state === 'menu') {
      drawImageAt(ctx, this.assets.images.logo, 1, 10, 238, 85);
      const labels = [
        this.assets.langStrings?.[1] || 'PLAY CAMPAIGN',
        this.assets.langStrings?.[3] || 'SELECT LEVEL',
        'CONTINUE SAVED',
      ];
      labels.forEach((lbl, i) => {
        const y = 152 + i * 30;
        ctx.fillStyle = i === this.menuCursor ? '#3c2a18' : '#1b1410';
        ctx.fillRect(34, y, 172, 24);
        ctx.strokeStyle = i === this.menuCursor ? '#ffd84d' : '#7b6344';
        ctx.strokeRect(34, y, 172, 24);
        centerText(ctx, lbl, y + 12, { font: 'bold 10px monospace', color: i === this.menuCursor ? '#ffd84d' : '#f1e7d2' });
      });
      return;
    }

    if (this.state === 'levelSelect') {
      centerText(ctx, 'SELECT MAP (M0-M7 / S0-S11)', 24, { font: 'bold 10px monospace', color: '#ffd84d' });
      const start = Math.max(0, Math.min(this.mapList.length - 11, this.mapIndex - 5));
      for (let row = 0; row < 11 && start + row < this.mapList.length; row++) {
        const idx = start + row;
        const y = 54 + row * 18;
        ctx.fillStyle = idx === this.mapIndex ? '#3b2e1b' : '#181c24';
        ctx.fillRect(28, y, 184, 16);
        centerText(ctx, this.mapList[idx].toUpperCase(), y + 8, { font: '9px monospace', color: idx === this.mapIndex ? '#ffd84d' : '#e6decb' });
      }
      centerText(ctx, 'CLICK OR ENTER · ESC BACK', 298, { font: '9px monospace', color: '#9eb092' });
      return;
    }

    // Strategic map board (y = 28..292)
    const boardCanvas = document.createElement('canvas');
    boardCanvas.width = WIDTH;
    boardCanvas.height = HEIGHT - 56;
    const boardCtx = boardCanvas.getContext('2d');
    renderOriginalBoard(boardCtx, {
      map: this.assets.map,
      assets: this.assets,
      cameraX: this.cameraX,
      cameraY: this.cameraY,
      viewportWidth: WIDTH,
      viewportHeight: HEIGHT - 56,
      units: this.units,
      cursor: this.cursor,
    });
    ctx.drawImage(boardCanvas, 0, 28);
    this.renderRange(ctx);

    // Top HUD bar (0..28)
    ctx.fillStyle = '#18141c';
    ctx.fillRect(0, 0, WIDTH, 28);
    drawRegionMIDP(ctx, this.assets.images.unit_icons, 0, 0, 24, 24, 0, 2, 2, MIDP.LEFT | MIDP.TOP);
    ctx.fillStyle = '#f4dfb3';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`T${this.turn + 1} P${this.playerIndex + 1} · ${this.balances[this.playerIndex] ?? 0}G`, 30, 11);
    const hoverUnit = this.unitAt(this.cursor.x, this.cursor.y);
    ctx.fillStyle = '#a9d69d';
    ctx.font = '8px monospace';
    ctx.fillText(hoverUnit ? `${this.unitName(hoverUnit.type)} HP:${hoverUnit.hp} LV:${hoverUnit.level}` : `${this.currentMapId.toUpperCase()} (${this.cursor.x},${this.cursor.y})`, 30, 23);

    // Bottom HUD bar (292..320)
    ctx.fillStyle = '#18141c';
    ctx.fillRect(0, HEIGHT - 28, WIDTH, 28);
    ctx.fillStyle = '#2c2218';
    ctx.fillRect(4, HEIGHT - 24, 58, 20);
    ctx.strokeStyle = '#8b6f47';
    ctx.strokeRect(4, HEIGHT - 24, 58, 20);
    ctx.fillRect(WIDTH - 82, HEIGHT - 24, 78, 20);
    ctx.strokeRect(WIDTH - 82, HEIGHT - 24, 78, 20);
    ctx.fillStyle = '#ffd84d';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MENU', 33, HEIGHT - 11);
    ctx.fillText('END TURN', WIDTH - 43, HEIGHT - 11);

    if (this.state === 'actionMenu') {
      const h = this.actionOptions.length * 20 + 16;
      ctx.fillStyle = '#14101a';
      ctx.fillRect(44, 108, 152, h);
      ctx.strokeStyle = '#ffd84d';
      ctx.strokeRect(44, 108, 152, h);
      this.actionOptions.forEach((opt, i) => {
        const y = 116 + i * 20;
        if (i === this.actionCursor) {
          ctx.fillStyle = '#3b2e1b';
          ctx.fillRect(50, y, 140, 18);
        }
        centerText(ctx, opt.label, y + 9, { font: 'bold 9px monospace', color: i === this.actionCursor ? '#ffd84d' : '#f1e7d2' });
      });
    } else if (this.state === 'recruitMenu') {
      ctx.fillStyle = '#14101a';
      ctx.fillRect(20, 52, 200, 224);
      ctx.strokeStyle = '#ffd84d';
      ctx.strokeRect(20, 52, 200, 224);
      centerText(ctx, `RECRUIT · GOLD: ${this.balances[this.playerIndex] ?? 0}`, 64, { font: 'bold 9px monospace', color: '#ffd84d' });
      for (let i = 0; i < 9; i++) {
        const y = 74 + i * 22;
        const cost = this.assets.unitRecords[i]?.shortValue ?? 999;
        const canAfford = (this.balances[this.playerIndex] ?? 0) >= cost;
        if (i === this.recruitCursor) {
          ctx.fillStyle = '#3b2e1b';
          ctx.fillRect(26, y, 188, 20);
        }
        ctx.fillStyle = canAfford ? '#f1e7d2' : '#777';
        ctx.font = '8px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${this.unitName(i)}`, 32, y + 13);
        ctx.textAlign = 'right';
        ctx.fillText(`${cost}G`, 208, y + 13);
      }
    } else if (this.state === 'dialog' || this.state === 'victory' || this.state === 'defeat') {
      ctx.fillStyle = '#150d18';
      ctx.fillRect(14, 130, 212, 58);
      ctx.strokeStyle = this.state === 'victory' ? '#9cff7b' : this.state === 'defeat' ? '#ff6b6b' : '#caa568';
      ctx.strokeRect(14, 130, 212, 58);
      const txt = this.state === 'victory' ? 'VICTORY! TAP FOR NEXT MAP' : this.state === 'defeat' ? 'DEFEAT! TAP FOR MENU' : this.dialogText;
      centerText(ctx, txt, 159, { font: 'bold 9px monospace', maxWidth: 200 });
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
