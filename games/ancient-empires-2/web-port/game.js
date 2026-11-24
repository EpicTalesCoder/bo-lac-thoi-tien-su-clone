import { decodeMap, decodeSprite, decodeTerrainProperties, decodeUnits, fetchBytes, transformPalettePixels } from './ancient-empires-loader.js';
import {
  advancePlayerTurn,
  attackModifierFor,
  buildingPaletteFromTile,
  calculateReachability,
  chooseAiUnitAction,
  computeUnitStats,
  defenseModifierFor,
  encodeBuildingTile,
  executeCombat,
  getAttackableTargets,
  getTargetableTowns,
  getTileActionForUnit,
  traceRoute,
} from './ancient-empires-core.js';
import { drawRegionMIDP, renderOriginalBoard } from './render-original.js';
import { playAe2Sfx } from './ae2-audio.js';
import { BattleScene } from './ae2-battle.js';
import { CAMPAIGN_STAGE_CONFIG, CAMPAIGN_STAGE_META, renderCutsceneScreen, renderStoryDialogOverlay, wrapText } from './ae2-story.js';

const WIDTH = 240;
const HEIGHT = 320;
const MIDP = Object.freeze({ HCENTER: 1, VCENTER: 2, LEFT: 4, RIGHT: 8, TOP: 16, BOTTOM: 32 });
const CAMPAIGN_MAPS = ['m0', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7'];
const SKIRMISH_MAPS = ['s0', 's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11'];
const SKIRMISH_PLAYER_COUNTS = Object.freeze({ s2: 3, s3: 4, s4: 4, s6: 4, s8: 4, s10: 4, s11: 4 });
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
  const spriteNames = [
    'tiles0', 'buildings', 'unit_icons', 'king_head_icons', 'cursor', 'buttons', 'menu', 'menu_icons',
    'hud_icons', 'hud_icons_2', 'action_icons', 'side_arrow', 'arrow', 'arrow_icons', 'mini_icons',
    'portraits', 'alpha', 'status', 'levelup', 'king_heads', 'king_heads_back',
    'road', 'grass', 'mountain', 'water', 'bridge', 'town', 'mountain_bg',
    'slash', 'archer_arrow', 'kingwave', 'kingslash', 'spell', 'watermagic', 'fish', 'crater',
    'b_smoke', 'big_circle', 'small_circle', 'smoke', 'spark', 'redspark',
  ];
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

  await Promise.all([
    'splash', 'logo', 'tombstone', 'gameover',
    'intro0', 'intro1', 'intro2', 'intro3', 'intro4', 'intro5',
    'town_bg', 'woods_bg', 'hill_bg', 'bridge_bg',
  ].map(async name => {
    const pngName = `${name}.png`;
    if (hasOriginalAsset(pngName)) {
      try { images[name] = await loadImage(`assets/${pngName}`); } catch { /* optional standalone PNG */ }
    }
  }));

  const buildingPaletteImages = [];
  const buildingSheet = images.buildings;
  for (let palette = 0; palette < 5; palette++) {
    buildingPaletteImages.push(palette === 0 ? buildingSheet : await recolorPalette(buildingSheet, palette));
  }

  const unitIconPalettes = [];
  if (images.unit_icons) {
    for (let palette = 0; palette < 5; palette++) {
      unitIconPalettes.push(palette === 1 ? images.unit_icons : await recolorPalette(images.unit_icons, palette));
    }
  }

  const kingHeadPalettes = [];
  if (images.king_head_icons) {
    kingHeadPalettes[0] = await recolorPalette(images.king_head_icons, 0);
    kingHeadPalettes[1] = images.king_head_icons;
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
  for (let palette = 0; palette <= 4; palette++) {
    const familyImages = {};
    for (const family of originalUnitFamilies) {
      if (!family) continue;
      const original = images[family];
      if (original) familyImages[family] = palette === 1 ? original : await recolorPalette(original, palette);
      else if (frameImages[family]) {
        familyImages[family] = await Promise.all(frameImages[family].map(img => (img ? (palette === 1 ? img : recolorPalette(img, palette)) : null)));
      }
    }
    coloredPalettes[palette] = familyImages;
  }

  return { map, unitRecords, terrain, sprites, images, frameImages, unitFamilies, buildingPaletteImages, unitIconPalettes, kingHeadPalettes, coloredPalettes, langStrings };
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
    this.state = 'splash'; // splash | menu | levelSelect | skirmishSetup | settings | instructions | cutscene | stageBanner | storyDialog | pauseMenu | play | moveAnim | targetSelect | actionMenu | recruitMenu | battle | dialog | victory | defeat
    this.menuCursor = 0;
    this.pauseCursor = 0;
    this.subMenuReturnState = 'menu';
    this.settings = this.loadSettings();
    this.skirmishConfig = { mapIdx: 0, gold: 350, players: [1, 0, 0, 0] };
    this.skirmishCursor = 0;
    this.settingsCursor = 0;
    this.helpScroll = 0;
    this.mapList = [...CAMPAIGN_MAPS, ...SKIRMISH_MAPS];
    this.mapIndex = 0;
    this.currentMapId = 'm0';
    this.cursor = { x: 0, y: 0 };
    this.selected = null;
    this.moveOrigin = null;
    this.reachable = null;
    this.previewPath = null;
    this.attackTargets = [];
    this.targetCandidates = [];
    this.targetCursor = 0;
    this.targetKind = 'attack';
    this.moveAnim = null;
    this.battleScene = null;
    this.battleOnDone = null;
    this.cutsceneQueue = [];
    this.cutsceneScroll = 0;
    this.cutsceneMaxScroll = 360;
    this.cutsceneOnDone = null;
    this.storyQueue = [];
    this.storyOnDone = null;
    this.triggeredTurnDialogs = new Set();
    this.stageBannerTitle = '';
    this.stageBannerObjective = '';
    this.stageBannerNext = null;
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
    this.waterAnimFrame = 0;
    this.floatTexts = [];
    this.saveKey = 'ae2-local-state-v2';
    this.settingsKey = 'ae2-settings-v1';
    this.lastTick = 0;
    this.accumulator = 0;
    this.boardCanvas = document.createElement('canvas');
    this.boardCanvas.width = WIDTH;
    this.boardCanvas.height = HEIGHT - 56;
    this.boardCtx = this.boardCanvas.getContext('2d', { alpha: false });
    this.initMapState(assets.map, 'm0');
    this.bindInput();
    requestAnimationFrame(time => this.loop(time));
    this.paint();
  }

  loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem('ae2-settings-v1') || '{}');
      return {
        fightAnimation: saved.fightAnimation !== false,
        sound: saved.sound !== false,
        showStory: saved.showStory !== false,
      };
    } catch {
      return { fightAnimation: true, sound: true, showStory: true };
    }
  }

  saveSettings() {
    try { localStorage.setItem(this.settingsKey, JSON.stringify(this.settings)); } catch { /* ignore */ }
  }

  sfx(kind) {
    if (this.settings.sound) playAe2Sfx(kind);
  }

  getBoardGeometry() {
    const boardH = HEIGHT - 56;
    const mapW = (this.assets.map?.width ?? 0) * 24;
    const mapH = (this.assets.map?.height ?? 0) * 24;
    const offsetX = mapW > 0 && mapW < WIDTH ? ((WIDTH - mapW) >> 1) : 0;
    const offsetY = mapH > 0 && mapH < boardH ? ((boardH - mapH) >> 1) : 0;
    return { boardH, mapW, mapH, offsetX, offsetY };
  }

  getLevelSelectStart() {
    return Math.max(0, Math.min(this.mapList.length - 11, this.mapIndex - 5));
  }

  getRecruitPanelLayout() {
    const list = this.getRecruitList();
    const rowHeight = 20;
    const headerHeight = 22;
    const cancelHeight = 20;
    const panelH = headerHeight + list.length * rowHeight + cancelHeight + 6;
    const panelY = Math.max(14, (HEIGHT - panelH) >> 1);
    return { list, rowHeight, headerHeight, cancelHeight, panelH, panelY };
  }

  openMenu(state = 'menu', returnState = 'menu') {
    this.subMenuReturnState = returnState;
    this.state = state;
    this.aiPending = false;
    this.moveAnim = null;
    this.battleScene = null;
    this.selected = null;
    this.moveOrigin = null;
    this.reachable = null;
    this.previewPath = null;
    this.attackTargets = [];
    this.targetCandidates = [];
    this.recruitCastle = null;
    if (state === 'menu' || state === 'levelSelect' || state === 'skirmishSetup') {
      this.status.textContent = 'READY · OFFLINE';
    }
    this.paint();
  }

  getPauseOptions() {
    return ['RESUME GAME', 'OBJECTIVE', 'SETTINGS', 'INSTRUCTIONS', 'RESTART MAP', 'SELECT LEVEL', 'MAIN MENU'];
  }

  confirmPauseOption(idx) {
    if (idx === 0) {
      this.state = 'play';
      this.paint();
    } else if (idx === 1) {
      this.showObjective();
    } else if (idx === 2) {
      this.settingsCursor = 0;
      this.subMenuReturnState = 'pauseMenu';
      this.state = 'settings';
      this.paint();
    } else if (idx === 3) {
      this.helpScroll = 0;
      this.subMenuReturnState = 'pauseMenu';
      this.state = 'instructions';
      this.paint();
    } else if (idx === 4) {
      this.loadAndStartMap(this.currentMapId, { includeIntro: false });
    } else if (idx === 5) {
      this.openMenu('levelSelect', 'menu');
    } else {
      this.openMenu('menu', 'menu');
    }
  }

  showObjective() {
    const meta = CAMPAIGN_STAGE_META[this.currentMapId];
    this.stageBannerTitle = meta
      ? (this.assets.langStrings?.[meta.titleIdx] || this.currentMapId.toUpperCase())
      : `SKIRMISH · ${this.currentMapId.toUpperCase()}`;
    this.stageBannerObjective = meta
      ? (this.assets.langStrings?.[meta.objectiveIdx] || 'Defeat all enemy troops!')
      : 'Defeat all enemy forces and capture enemy castles!';
    this.stageBannerPrompt = 'TAP OR ESC · BACK';
    this.stageBannerNext = () => {
      this.state = 'pauseMenu';
      this.paint();
    };
    this.state = 'stageBanner';
    this.paint();
  }

  unitName(type, level = 0) {
    if (type === 11) return this.assets.langStrings?.[183] || 'CRYSTAL';
    const base = UNIT_LANG_BASE[type];
    if (base == null) return `UNIT ${type}`;
    // Port of c.java:72-80: regular units promote names at Lv 2/4/6
    const tier = type === 9 ? 0 : Math.min(3, Math.max(0, level >> 1));
    return this.assets.langStrings?.[base + tier] || this.assets.langStrings?.[base] || `UNIT ${type}`;
  }

  getSkirmishPlayerCount(mapId = SKIRMISH_MAPS[this.skirmishConfig?.mapIdx ?? 0]) {
    return SKIRMISH_PLAYER_COUNTS[mapId] ?? 2;
  }

  spawnStageUnit(type, playerSelector, x, y, extra = {}) {
    const rec = this.assets.unitRecords[type];
    if (!rec) return null;
    const stats = computeUnitStats(rec, 0);
    const unit = {
      id: this.nextUnitId++,
      type,
      playerSelector,
      palette: this.playerPalette[playerSelector] ?? playerSelector,
      x,
      y,
      ...stats,
      hp: 100,
      xp: 0,
      level: 0,
      status: 0,
      frameIndex: 0,
      action: 0,
      movedThisTurn: false,
      ...(type === 9 ? { reviveCost: rec?.shortValue ?? 200 } : {}),
      ...extra,
    };
    this.units.push(unit);
    return unit;
  }

  initMapState(mapData, mapId, options = {}) {
    this.currentMapId = mapId;
    this.assets.map = {
      ...mapData,
      tiles: mapData.tiles.map(col => Int8Array.from(col)),
    };
    const players = new Set(mapData.units.map(u => u.playerSelector));
    for (let x = 0; x < mapData.width; x++) {
      for (let y = 0; y < mapData.height; y++) {
        const pal = buildingPaletteFromTile(mapData.tiles[x][y]);
        if (pal >= 1 && pal <= 4) players.add(pal);
      }
    }
    this.playerCount = Math.max(2, ...players);
    this.playerModes = options.playerModes
      ? Array.from({ length: this.playerCount }, (_, i) => options.playerModes[i] ?? 0)
      : Array.from({ length: this.playerCount }, (_, i) => (i === 0 ? 1 : 0));
    const stageCfg = CAMPAIGN_STAGE_CONFIG[mapId];
    this.balances = Array.from({ length: this.playerCount }, (_, i) => {
      if (options.startingGold != null) return options.startingGold;
      if (stageCfg?.startGold?.[i] != null) return stageCfg.startGold[i];
      return 350;
    });
    this.playerPositions = Array.from({ length: this.playerCount }, () => [0, 0]);
    this.playerPalette = [0, 1, 2, 3, 4];
    this.turn = 0;
    this.playerIndex = 0;
    this.nextUnitId = 1;
    this.triggeredTurnDialogs = new Set();
    this.m0Reinforced = false;
    this.m4Stage = 0;
    this.m6Stage = 0;
    this.waterAnimFrame = 0;
    this.floatTexts = [];
    this.stageBannerPrompt = 'TAP OR ENTER TO BEGIN';
    const rawUnits = stageCfg?.removeInitialCrystals
      ? mapData.units.filter(u => u.type !== 11)
      : mapData.units;
    this.units = rawUnits.map(record => {
      const stats = computeUnitStats(this.assets.unitRecords[record.type], 0);
      let kingHead;
      let isSaethBoss = false;
      if (record.type === 9) {
        if (record.playerSelector === 1 && stageCfg?.kingHeadP1 != null) kingHead = stageCfg.kingHeadP1;
        else if (mapId === 'm7') {
          if (record.playerSelector === 1) kingHead = record.x === 6 ? 2 : 0;
          else if (record.x === 7 && record.y === 4) { kingHead = 3; isSaethBoss = true; }
          else kingHead = 1;
        }
      }
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
        ...(record.type === 9 ? { reviveCost: this.assets.unitRecords[9]?.shortValue ?? 200 } : {}),
        ...(kingHead != null ? { kingHead } : {}),
        ...(isSaethBoss ? { isSaethBoss: true } : {}),
      };
    });

    // Port of i.java:4789-4798: M6 begins with King Galamar escorting the Spirit Crystal convoy
    if (mapId === 'm6') {
      const galamar = this.units.find(u => u.type === 9 && u.playerSelector === 1);
      if (galamar) {
        galamar.x = 14;
        galamar.y = 3;
        galamar.kingHead = 0;
      }
      if (!this.unitAt(14, 2)) this.spawnStageUnit(0, 1, 14, 2);
      if (!this.unitAt(13, 2)) this.spawnStageUnit(11, 1, 13, 2);
      if (!this.unitAt(13, 3)) this.spawnStageUnit(1, 1, 13, 3);
      if (!this.unitAt(13, 4)) this.spawnStageUnit(3, 1, 13, 4);
    }

    const first = this.units.find(u => u.playerSelector === 1 && u.action !== 3 && u.action !== 4);
    this.cursor = { x: first?.x ?? 0, y: first?.y ?? 0 };
    this.centerCameraOn(this.cursor.x, this.cursor.y);
    this.selected = null;
    this.moveOrigin = null;
    this.reachable = null;
    this.previewPath = null;
    this.attackTargets = [];
    this.targetCandidates = [];
    this.moveAnim = null;
    this.battleScene = null;
  }

  playCutsceneSequence(cutsceneSpecs, onDone) {
    if (!cutsceneSpecs || cutsceneSpecs.length === 0) {
      onDone?.();
      return;
    }
    this.cutsceneQueue = cutsceneSpecs.map(spec => (
      typeof spec === 'number'
        ? {
            image: this.assets.images[`intro${spec}`] ?? null,
            text: this.assets.langStrings?.[215 + spec] || '',
          }
        : spec
    ));
    this.cutsceneScroll = 0;
    this.cutsceneOnDone = onDone;
    this.state = 'cutscene';
    this.paint();
  }

  advanceCutscene(skipAll = false) {
    if (skipAll || this.cutsceneQueue.length <= 1) {
      this.cutsceneQueue = [];
      const fn = this.cutsceneOnDone;
      this.cutsceneOnDone = null;
      fn?.();
      return;
    }
    this.cutsceneQueue.shift();
    this.cutsceneScroll = 0;
    this.paint();
  }

  playStoryDialogs(entries, onDone) {
    if (!entries || entries.length === 0) {
      onDone?.();
      return;
    }
    this.storyQueue = entries.map(item => ({
      portrait: item.portrait ?? -1,
      focus: item.focus ?? null,
      text: this.assets.langStrings?.[item.langIdx] || '',
    }));
    const first = this.storyQueue[0];
    if (first?.focus) {
      this.cursor = { x: first.focus[0], y: first.focus[1] };
      this.centerCameraOn(this.cursor.x, this.cursor.y);
    }
    this.storyOnDone = onDone;
    this.state = 'storyDialog';
    this.paint();
  }

  advanceStoryDialog(skipAll = false) {
    if (skipAll || this.storyQueue.length <= 1) {
      this.storyQueue = [];
      const fn = this.storyOnDone;
      this.storyOnDone = null;
      fn?.();
      return;
    }
    this.storyQueue.shift();
    const cur = this.storyQueue[0];
    if (cur?.focus) {
      this.cursor = { x: cur.focus[0], y: cur.focus[1] };
      this.centerCameraOn(this.cursor.x, this.cursor.y);
    }
    this.paint();
  }

  async loadAndStartMap(mapId, options = {}) {
    try {
      this.status.textContent = `LOADING ${mapId.toUpperCase()}...`;
      const decoded = decodeMap(await fetchBytes(`assets/${mapId}`), mapId);
      this.initMapState(decoded, mapId, options);
      this.status.textContent = `${mapId.toUpperCase()} · READY`;

      const meta = CAMPAIGN_STAGE_META[mapId];
      const runStageIntroDialogs = () => {
        const startPlay = () => {
          const hero = this.units.find(u => u.playerSelector === 1 && u.action !== 3 && u.action !== 4 && u.hp > 0);
          if (hero) {
            this.cursor = { x: hero.x, y: hero.y };
            this.centerCameraOn(hero.x, hero.y);
          }
          this.state = 'play';
          this.paint();
        };
        if (meta && this.settings.showStory && meta.openingDialogs?.length > 0) {
          this.stageBannerTitle = this.assets.langStrings?.[meta.titleIdx] || mapId.toUpperCase();
          this.stageBannerObjective = this.assets.langStrings?.[meta.objectiveIdx] || '';
          this.stageBannerPrompt = 'TAP OR ENTER TO BEGIN';
          this.stageBannerNext = () => this.playStoryDialogs(meta.openingDialogs, startPlay);
          this.state = 'stageBanner';
          this.paint();
        } else {
          startPlay();
        }
      };

      const cutscenes = options.includeIntro && this.settings.showStory && meta?.introCutscenes?.length
        ? meta.introCutscenes
        : [];
      if (cutscenes.length > 0) {
        this.playCutsceneSequence(cutscenes, runStageIntroDialogs);
      } else {
        runStageIntroDialogs();
      }
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
    this.canvas.addEventListener('wheel', event => {
      event.preventDefault();
      const step = event.deltaY > 0 ? 1 : -1;
      if (this.state === 'levelSelect') {
        this.mapIndex = Math.max(0, Math.min(this.mapList.length - 1, this.mapIndex + step));
        this.paint();
      } else if (this.state === 'instructions') {
        this.helpScroll = Math.max(0, Math.min(28, this.helpScroll + step));
        this.paint();
      }
    }, { passive: false });
    window.addEventListener('blur', () => {
      this.lastTick = 0;
      this.accumulator = 0;
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.lastTick = 0;
        this.accumulator = 0;
      }
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
      this.waterAnimFrame = (this.waterAnimFrame + 1) % 4;
      for (const u of this.units) {
        if (u.action !== 3 && u.action !== 4) u.frameIndex = (u.frameIndex + 1) % 2;
      }
    }
    if (this.floatTexts.length > 0) {
      for (let i = this.floatTexts.length - 1; i >= 0; i--) {
        const ft = this.floatTexts[i];
        ft.offsetY = (ft.offsetY ?? 0) + 0.45;
        ft.timer -= 50;
        if (ft.timer <= 0) this.floatTexts.splice(i, 1);
      }
    }
    if (this.state === 'cutscene') {
      if (this.cutsceneScroll < this.cutsceneMaxScroll) {
        this.cutsceneScroll += 0.9;
      }
      return;
    }
    if (this.state === 'stageBanner') {
      return;
    }
    if (this.state === 'battle' && this.battleScene) {
      this.battleScene.tick(50);
      if (this.battleScene.finished) {
        this.finishBattleScene();
      }
      return;
    }
    if (this.state === 'moveAnim' && this.moveAnim) {
      const anim = this.moveAnim;
      const nextTile = anim.path[anim.stepIndex];
      if (!nextTile) {
        this.moveAnim = null;
        this.state = 'play';
        anim.onDone?.();
        return;
      }
      anim.unit.x = nextTile[0];
      anim.unit.y = nextTile[1];
      this.cursor = { x: nextTile[0], y: nextTile[1] };
      this.centerCameraOn(nextTile[0], nextTile[1]);
      anim.stepIndex++;
      if (anim.stepIndex >= anim.path.length) {
        this.moveAnim = null;
        this.state = 'play';
        anim.onDone?.();
      }
      return;
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

  finishBattleScene() {
    this.battleScene = null;
    const fn = this.battleOnDone;
    this.battleOnDone = null;
    this.state = 'play';
    fn?.();
    this.paint();
  }

  getMainMenuItems() {
    return [
      { label: this.assets.langStrings?.[2] || 'NEW GAME', icon: 0 },
      { label: 'CONTINUE SAVED', icon: 8 },
      { label: this.assets.langStrings?.[3] || 'SELECT LEVEL', icon: 1 },
      { label: this.assets.langStrings?.[6] || 'SKIRMISH', icon: 3 },
      { label: this.assets.langStrings?.[8] || 'SETTINGS', icon: 4 },
      { label: this.assets.langStrings?.[9] || 'INSTRUCTIONS', icon: 6 },
    ];
  }

  confirmMainMenuOption(idx) {
    if (idx === 0) this.startCampaign();
    else if (idx === 1) this.loadSavedGame();
    else if (idx === 2) this.openMenu('levelSelect', 'menu');
    else if (idx === 3) this.openMenu('skirmishSetup', 'menu');
    else if (idx === 4) { this.settingsCursor = 0; this.openMenu('settings', 'menu'); }
    else { this.helpScroll = 0; this.openMenu('instructions', 'menu'); }
  }

  pointer(x, y) {
    if (this.state === 'splash') { this.openMenu('menu'); return; }
    if (this.state === 'menu') {
      const idx = Math.floor((y - 114) / 26);
      if (x >= 26 && x <= 214 && idx >= 0 && idx < 6) {
        this.menuCursor = idx;
        this.confirmMainMenuOption(idx);
      }
      return;
    }
    if (this.state === 'cutscene') {
      if (y >= HEIGHT - 26 && x >= WIDTH - 88) this.advanceCutscene(true);
      else this.advanceCutscene(false);
      return;
    }
    if (this.state === 'stageBanner') {
      const fn = this.stageBannerNext;
      this.stageBannerNext = null;
      fn?.();
      return;
    }
    if (this.state === 'storyDialog') {
      if (x >= WIDTH - 90 && y >= HEIGHT - 50) this.advanceStoryDialog(true);
      else this.advanceStoryDialog(false);
      return;
    }
    if (this.state === 'battle' && this.battleScene) {
      if (this.battleScene.elapsed >= 450) {
        this.battleScene.skip();
        this.finishBattleScene();
      }
      return;
    }
    if (this.state === 'skirmishSetup') {
      if (y >= 280) {
        if (x < WIDTH / 2) this.startConfiguredSkirmish();
        else this.openMenu('menu');
        return;
      }
      const maxRows = 2 + this.getSkirmishPlayerCount();
      const row = Math.floor((y - 44) / 33);
      if (row >= 0 && row < maxRows) {
        this.skirmishCursor = row;
        this.adjustSkirmishOption(row, x >= WIDTH / 2 ? 1 : -1);
      }
      return;
    }
    if (this.state === 'settings') {
      if (y >= 280) {
        this.saveSettings();
        this.state = this.subMenuReturnState;
        this.paint();
        return;
      }
      const row = Math.floor((y - 76) / 36);
      if (row >= 0 && row < 3) {
        this.settingsCursor = row;
        this.toggleSettingOption(row);
      }
      return;
    }
    if (this.state === 'instructions') {
      if (y >= 280) {
        this.state = this.subMenuReturnState;
        this.paint();
      } else if (y < 160) {
        this.helpScroll = Math.max(0, this.helpScroll - 3);
        this.paint();
      } else {
        this.helpScroll = Math.min(28, this.helpScroll + 3);
        this.paint();
      }
      return;
    }
    if (this.state === 'levelSelect') {
      if (y >= 280) { this.openMenu('menu'); return; }
      if (y >= 34 && y <= 52) {
        this.mapIndex = Math.max(0, this.mapIndex - 1);
        this.paint();
        return;
      }
      if (y >= 254 && y < 280) {
        this.mapIndex = Math.min(this.mapList.length - 1, this.mapIndex + 1);
        this.paint();
        return;
      }
      const start = this.getLevelSelectStart();
      const row = Math.floor((y - 54) / 18);
      if (row >= 0 && row < 11 && start + row < this.mapList.length) {
        const idx = start + row;
        this.mapIndex = idx;
        this.loadAndStartMap(this.mapList[idx], { includeIntro: false });
      }
      return;
    }
    if (this.state === 'pauseMenu') {
      const opts = this.getPauseOptions();
      const panelH = 28 + opts.length * 22 + 8;
      const panelY = (HEIGHT - panelH) >> 1;
      const idx = Math.floor((y - panelY - 26) / 22);
      if (x >= 32 && x <= 208 && idx >= 0 && idx < opts.length) {
        this.confirmPauseOption(idx);
      } else {
        this.state = 'play';
        this.paint();
      }
      return;
    }
    if (this.state === 'victory' || this.state === 'defeat') {
      if (this.state === 'victory') {
        const nextIdx = CAMPAIGN_MAPS.indexOf(this.currentMapId) + 1;
        if (nextIdx > 0 && nextIdx < CAMPAIGN_MAPS.length) {
          this.loadAndStartMap(CAMPAIGN_MAPS[nextIdx], { includeIntro: true });
          return;
        }
      }
      this.openMenu('menu');
      return;
    }
    if (this.state === 'dialog') { this.state = 'play'; this.paint(); return; }
    if (this.state === 'targetSelect') {
      if (y >= HEIGHT - 28) {
        if (x >= WIDTH - 84) this.confirmTargetSelection();
        else this.backFromTargetSelect();
        return;
      }
      if (y >= 28) {
        const { offsetX, offsetY } = this.getBoardGeometry();
        const tileX = Math.floor((x - offsetX + this.cameraX) / 24);
        const tileY = Math.floor((y - 28 - offsetY + this.cameraY) / 24);
        const hitIdx = this.targetCandidates.findIndex(t => t.x === tileX && t.y === tileY);
        if (hitIdx >= 0) {
          if (hitIdx === this.targetCursor) this.confirmTargetSelection();
          else {
            this.targetCursor = hitIdx;
            const t = this.targetCandidates[hitIdx];
            this.cursor = { x: t.x, y: t.y };
            this.paint();
          }
          return;
        }
      }
      this.backFromTargetSelect();
      return;
    }
    if (this.state === 'actionMenu') {
      const boxTop = 98;
      const idx = Math.floor((y - boxTop - 8) / 22);
      if (idx >= 0 && idx < this.actionOptions.length && x >= 44 && x <= 196) {
        this.confirmActionOption(idx);
      } else {
        this.cancelSelection();
      }
      return;
    }
    if (this.state === 'recruitMenu') {
      const { list, rowHeight, headerHeight, panelY } = this.getRecruitPanelLayout();
      const idx = Math.floor((y - panelY - headerHeight) / rowHeight);
      if (x >= 20 && x <= 220 && idx >= 0 && idx < list.length) {
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
      else if (x <= 66) {
        this.persistState();
        this.pauseCursor = 0;
        this.state = 'pauseMenu';
        this.paint();
      }
      return;
    }
    // Top bar pan / camera nudges
    if (y < 28) {
      if (x > 180) this.pan(x > 210 ? 0 : x > 195 ? 1 : 2);
      return;
    }
    const { offsetX, offsetY } = this.getBoardGeometry();
    const tileX = Math.floor((x - offsetX + this.cameraX) / 24);
    const tileY = Math.floor((y - 28 - offsetY + this.cameraY) / 24);
    if (tileX >= 0 && tileY >= 0 && tileX < this.assets.map.width && tileY < this.assets.map.height) {
      this.selectTile(tileX, tileY);
    }
  }

  adjustSkirmishOption(row, dir) {
    if (row === 0) {
      this.skirmishConfig.mapIdx = (this.skirmishConfig.mapIdx + dir + SKIRMISH_MAPS.length) % SKIRMISH_MAPS.length;
      const totalRows = 2 + this.getSkirmishPlayerCount();
      if (this.skirmishCursor > totalRows) this.skirmishCursor = totalRows;
    } else if (row === 1) {
      const presets = [200, 350, 500, 750, 1000];
      const cur = Math.max(0, presets.indexOf(this.skirmishConfig.gold));
      this.skirmishConfig.gold = presets[(cur + dir + presets.length) % presets.length];
    } else {
      const pIdx = row - 2;
      if (pIdx >= 0 && pIdx < this.getSkirmishPlayerCount()) {
        this.skirmishConfig.players[pIdx] = this.skirmishConfig.players[pIdx] === 1 ? 0 : 1;
      }
    }
    this.paint();
  }

  startConfiguredSkirmish() {
    const mapId = SKIRMISH_MAPS[this.skirmishConfig.mapIdx] || 's0';
    const count = this.getSkirmishPlayerCount(mapId);
    this.loadAndStartMap(mapId, {
      includeIntro: false,
      startingGold: this.skirmishConfig.gold,
      playerModes: this.skirmishConfig.players.slice(0, count),
    });
  }

  toggleSettingOption(row) {
    if (row === 0) this.settings.fightAnimation = !this.settings.fightAnimation;
    else if (row === 1) this.settings.sound = !this.settings.sound;
    else if (row === 2) this.settings.showStory = !this.settings.showStory;
    this.saveSettings();
    this.paint();
  }

  key(event) {
    const code = event.code;
    if (this.state === 'splash') { this.openMenu('menu'); return; }
    if (this.state === 'cutscene') {
      if (code === 'Escape') this.advanceCutscene(true);
      else if (code === 'Enter' || code === 'Space' || code === 'Digit5') this.advanceCutscene(false);
      return;
    }
    if (this.state === 'stageBanner') {
      if (code === 'Enter' || code === 'Space' || code === 'Digit5' || code === 'Escape') {
        const fn = this.stageBannerNext;
        this.stageBannerNext = null;
        fn?.();
      }
      return;
    }
    if (this.state === 'storyDialog') {
      if (code === 'Escape') this.advanceStoryDialog(true);
      else if (code === 'Enter' || code === 'Space' || code === 'Digit5') this.advanceStoryDialog(false);
      return;
    }
    if (this.state === 'battle' && this.battleScene) {
      if ((code === 'Enter' || code === 'Space' || code === 'Escape') && this.battleScene.elapsed >= 450) {
        this.battleScene.skip();
        this.finishBattleScene();
      }
      return;
    }
    if (this.state === 'moveAnim') return;
    if (this.state === 'menu') {
      if (code === 'ArrowUp' || code === 'KeyW') this.menuCursor = (this.menuCursor + 5) % 6;
      else if (code === 'ArrowDown' || code === 'KeyS') this.menuCursor = (this.menuCursor + 1) % 6;
      else if (code === 'Enter' || code === 'Space' || code === 'Digit5') {
        this.confirmMainMenuOption(this.menuCursor);
        return;
      }
      this.paint();
      return;
    }
    if (this.state === 'skirmishSetup') {
      const startRow = 2 + this.getSkirmishPlayerCount();
      const total = startRow + 1;
      if (code === 'ArrowUp' || code === 'KeyW') this.skirmishCursor = (this.skirmishCursor + total - 1) % total;
      else if (code === 'ArrowDown' || code === 'KeyS') this.skirmishCursor = (this.skirmishCursor + 1) % total;
      else if (code === 'ArrowLeft' || code === 'KeyA') this.adjustSkirmishOption(this.skirmishCursor, -1);
      else if (code === 'ArrowRight' || code === 'KeyD') this.adjustSkirmishOption(this.skirmishCursor, 1);
      else if (code === 'Enter' || code === 'Space' || code === 'Digit5') {
        if (this.skirmishCursor >= startRow) this.startConfiguredSkirmish();
        else this.adjustSkirmishOption(this.skirmishCursor, 1);
        return;
      } else if (code === 'Escape') { this.openMenu('menu'); return; }
      this.paint();
      return;
    }
    if (this.state === 'settings') {
      if (code === 'ArrowUp' || code === 'KeyW') this.settingsCursor = (this.settingsCursor + 2) % 3;
      else if (code === 'ArrowDown' || code === 'KeyS') this.settingsCursor = (this.settingsCursor + 1) % 3;
      else if (code === 'Enter' || code === 'Space' || code === 'ArrowLeft' || code === 'ArrowRight') {
        this.toggleSettingOption(this.settingsCursor);
        return;
      } else if (code === 'Escape') {
        this.saveSettings();
        this.state = this.subMenuReturnState;
      }
      this.paint();
      return;
    }
    if (this.state === 'instructions') {
      if (code === 'ArrowUp' || code === 'KeyW') this.helpScroll = Math.max(0, this.helpScroll - 1);
      else if (code === 'ArrowDown' || code === 'KeyS') this.helpScroll = Math.min(28, this.helpScroll + 1);
      else if (code === 'Escape' || code === 'Enter') this.state = this.subMenuReturnState;
      this.paint();
      return;
    }
    if (this.state === 'levelSelect') {
      if (code === 'ArrowUp' || code === 'KeyW') this.mapIndex = (this.mapIndex + this.mapList.length - 1) % this.mapList.length;
      else if (code === 'ArrowDown' || code === 'KeyS') this.mapIndex = (this.mapIndex + 1) % this.mapList.length;
      else if (code === 'Enter' || code === 'Space' || code === 'Digit5') this.loadAndStartMap(this.mapList[this.mapIndex], { includeIntro: false });
      else if (code === 'Escape') { this.openMenu('menu'); return; }
      this.paint();
      return;
    }
    if (this.state === 'pauseMenu') {
      const len = this.getPauseOptions().length;
      if (code === 'ArrowUp' || code === 'KeyW') this.pauseCursor = (this.pauseCursor + len - 1) % len;
      else if (code === 'ArrowDown' || code === 'KeyS') this.pauseCursor = (this.pauseCursor + 1) % len;
      else if (code === 'Enter' || code === 'Space' || code === 'Digit5') { this.confirmPauseOption(this.pauseCursor); return; }
      else if (code === 'Escape') this.state = 'play';
      this.paint();
      return;
    }
    if (this.state === 'victory' || this.state === 'defeat') { this.pointer(0, 0); return; }
    if (this.state === 'dialog') { this.state = 'play'; this.paint(); return; }
    if (this.state === 'targetSelect') {
      const n = this.targetCandidates.length;
      if (n === 0) { this.backFromTargetSelect(); return; }
      if (code === 'ArrowUp' || code === 'ArrowLeft' || code === 'KeyW' || code === 'KeyA') {
        this.targetCursor = (this.targetCursor + n - 1) % n;
        const t = this.targetCandidates[this.targetCursor];
        this.cursor = { x: t.x, y: t.y };
        this.centerCameraOn(t.x, t.y);
      } else if (code === 'ArrowDown' || code === 'ArrowRight' || code === 'KeyS' || code === 'KeyD') {
        this.targetCursor = (this.targetCursor + 1) % n;
        const t = this.targetCandidates[this.targetCursor];
        this.cursor = { x: t.x, y: t.y };
        this.centerCameraOn(t.x, t.y);
      } else if (code === 'Enter' || code === 'Space' || code === 'Digit5') {
        this.confirmTargetSelection();
        return;
      } else if (code === 'Escape') {
        this.backFromTargetSelect();
        return;
      }
      this.paint();
      return;
    }
    if (this.state === 'actionMenu') {
      if (code === 'ArrowUp' || code === 'KeyW') this.actionCursor = (this.actionCursor + this.actionOptions.length - 1) % this.actionOptions.length;
      else if (code === 'ArrowDown' || code === 'KeyS') this.actionCursor = (this.actionCursor + 1) % this.actionOptions.length;
      else if (code === 'Enter' || code === 'Space' || code === 'Digit5') this.confirmActionOption(this.actionCursor);
      else if (code === 'Escape') this.cancelSelection();
      this.paint();
      return;
    }
    if (this.state === 'recruitMenu') {
      const len = this.getRecruitList().length;
      if (code === 'ArrowUp' || code === 'KeyW') this.recruitCursor = (this.recruitCursor + len - 1) % len;
      else if (code === 'ArrowDown' || code === 'KeyS') this.recruitCursor = (this.recruitCursor + 1) % len;
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
    if (code === 'KeyK' || code === 'Digit9') { this.focusCommander(); return; }
    if (code === 'Escape' || code === 'KeyQ' || code === 'Tab') {
      if (this.selected || this.reachable || this.attackTargets.length > 0) this.cancelSelection();
      else { this.persistState(); this.pauseCursor = 0; this.state = 'pauseMenu'; this.paint(); }
      return;
    }
    if (code === 'KeyE' || code === 'Backspace') this.endTurn();
  }

  focusCommander() {
    const mySelector = 1 + this.playerIndex;
    const cmd = this.units.find(u => u.type === 9 && u.playerSelector === mySelector && u.action !== 3 && u.action !== 4 && u.hp > 0);
    if (cmd) {
      this.cursor = { x: cmd.x, y: cmd.y };
      this.centerCameraOn(cmd.x, cmd.y);
      this.paint();
    }
  }

  startCampaign() {
    this.loadAndStartMap('m0', { includeIntro: true });
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

  ownerTeamForTile(rawTile) {
    const pal = buildingPaletteFromTile(rawTile);
    if (pal <= 0) return -1;
    const ownerPlayer = this.playerPalette.indexOf(pal);
    return ownerPlayer > 0 ? this.teamFor(ownerPlayer) : this.teamFor(pal);
  }

  unitAt(x, y) {
    return this.units.find(u => u.x === x && u.y === y && u.action !== 3 && u.action !== 4 && u.hp > 0);
  }

  tombstoneAt(x, y) {
    return this.units.find(u => u.x === x && u.y === y && u.action === 3 && u.type !== 9 && u.x >= 0 && u.y >= 0);
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
      this.cursor = { x: this.moveOrigin.x, y: this.moveOrigin.y };
      this.centerCameraOn(this.cursor.x, this.cursor.y);
    }
    this.selected = null;
    this.moveOrigin = null;
    this.reachable = null;
    this.previewPath = null;
    this.attackTargets = [];
    this.targetCandidates = [];
    this.actionOptions = [];
    this.moveAnim = null;
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
      // Attack an enemy directly when already in range (opens forecast target confirmation)
      if (target && target.playerSelector !== mySelector) {
        const valid = getAttackableTargets(this.selected, this.units, p => this.teamFor(p));
        const idx = valid.findIndex(t => t.id === target.id);
        if (idx >= 0) {
          this.openTargetSelect('attack', valid, idx);
          return;
        }
      }
      // Stationary Catapult can directly select a non-allied intact Town to bombard
      if (!target && this.selected.type === 7 && !this.selected.movedThisTurn) {
        const towns = this.targetableTownsFor(this.selected);
        const tIdx = towns.findIndex(t => t.x === x && t.y === y);
        if (tIdx >= 0) {
          this.openTargetSelect('destroyTown', towns, tIdx);
          return;
        }
      }
      // Stay on current tile -> open Action Menu directly
      if (x === this.selected.x && y === this.selected.y) {
        this.previewPath = null;
        this.openActionMenu(this.selected);
        return;
      }
      // Step-by-step walk along traceRoute to reachable destination
      if (this.reachable?.costs.has(`${x},${y}`)) {
        const path = traceRoute(this.reachable, this.selected.x, this.selected.y, x, y);
        const unit = this.selected;
        unit.movedThisTurn = true;
        this.previewPath = null;
        if (path.length <= 2) {
          unit.x = x;
          unit.y = y;
          this.openActionMenu(unit);
        } else {
          this.moveAnim = {
            unit,
            path,
            stepIndex: 1,
            onDone: () => this.openActionMenu(unit),
          };
          this.state = 'moveAnim';
          this.paint();
        }
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
      this.previewPath = null;
      this.attackTargets = [
        ...getAttackableTargets(target, this.units, p => this.teamFor(p)),
        ...this.targetableTownsFor(target),
      ];
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

  targetableTownsFor(unit) {
    return getTargetableTowns({
      unit,
      map: this.assets.map,
      terrainAt: (x, y) => this.tileProperty(x, y) ?? 0,
      unitAt: (x, y) => this.unitAt(x, y),
      teamForPlayer: p => this.teamFor(p),
      ownerTeamForTile: raw => this.ownerTeamForTile(raw),
    });
  }

  openActionMenu(unit) {
    const opts = [];
    const targets = getAttackableTargets(unit, this.units, p => this.teamFor(p));
    if (targets.length > 0) {
      opts.push({ kind: 'attack', icon: 2, label: this.assets.langStrings?.[62] || 'ATTACK', targets });
    }
    const townTargets = this.targetableTownsFor(unit);
    if (townTargets.length > 0) {
      opts.push({ kind: 'destroyTown', icon: 2, label: 'BOMBARD TOWN', targets: townTargets });
    }
    const myPal = this.playerPalette[unit.playerSelector] ?? unit.playerSelector;
    const tileAct = getTileActionForUnit(unit, this.rawTile(unit.x, unit.y), this.tileProperty(unit.x, unit.y), myPal);
    if (tileAct === 'capture') opts.push({ kind: 'capture', icon: 1, label: this.assets.langStrings?.[67] || 'OCCUPY' });
    else if (tileAct === 'repair') opts.push({ kind: 'repair', icon: 1, label: this.assets.langStrings?.[68] || 'REPAIR' });

    // Sorceress (type 3) can raise Skeleton from adjacent tombstone (i.java:2515-2530)
    if (unit.type === 3) {
      const tombs = this.units.filter(
        u => u.action === 3 && u.type !== 9 && u.x >= 0 && u.y >= 0 && Math.abs(u.x - unit.x) + Math.abs(u.y - unit.y) === 1 && !this.unitAt(u.x, u.y)
      );
      if (tombs.length > 0) opts.push({ kind: 'raise', icon: 3, label: this.assets.langStrings?.[69] || 'RAISE', tombs });
    }

    opts.push({ kind: 'wait', icon: 5, label: this.assets.langStrings?.[64] || 'END MOVE' });
    opts.push({ kind: 'cancel', icon: 6, label: this.assets.langStrings?.[65] || 'CANCEL' });
    this.actionOptions = opts;
    this.actionCursor = 0;
    this.attackTargets = [...targets, ...townTargets];
    this.state = 'actionMenu';
    this.paint();
  }

  openTargetSelect(kind, candidates, startIdx = 0) {
    this.targetKind = kind;
    this.targetCandidates = candidates;
    this.targetCursor = Math.max(0, Math.min(candidates.length - 1, startIdx));
    const focused = candidates[this.targetCursor];
    if (focused) {
      this.cursor = { x: focused.x, y: focused.y };
      this.centerCameraOn(focused.x, focused.y);
    }
    this.state = 'targetSelect';
    this.paint();
  }

  backFromTargetSelect() {
    if (this.selected) {
      this.cursor = { x: this.selected.x, y: this.selected.y };
      this.centerCameraOn(this.cursor.x, this.cursor.y);
      this.targetCandidates = [];
      this.openActionMenu(this.selected);
    } else {
      this.cancelSelection();
    }
  }

  confirmTargetSelection() {
    const unit = this.selected;
    const chosen = this.targetCandidates[this.targetCursor];
    if (!unit || !chosen) { this.cancelSelection(); return; }
    if (this.targetKind === 'attack') {
      this.performAttack(unit, chosen);
    } else if (this.targetKind === 'destroyTown') {
      this.destroyTownAt(unit, chosen);
    } else if (this.targetKind === 'raise') {
      this.raiseSkeletonOn(unit, chosen);
    }
  }

  // Port of i.java:2493-2499: Catapult bombards Town into ruined tile 27
  destroyTownAt(unit, town) {
    this.assets.map.tiles[town.x][town.y] = 27;
    unit.action = 1;
    this.sfx('hit');
    this.floatTexts.push({ x: town.x, y: town.y, text: 'RUINED!', color: '#ff9248', offsetY: 0, timer: 1100 });
    this.selected = null;
    this.moveOrigin = null;
    this.reachable = null;
    this.previewPath = null;
    this.attackTargets = [];
    this.targetCandidates = [];
    this.state = 'play';
    this.persistState();
    this.checkMatchOutcome();
    this.paint();
  }

  raiseSkeletonOn(unit, tomb) {
    const stats = computeUnitStats(this.assets.unitRecords[10], 0);
    Object.assign(tomb, {
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
    this.sfx('raise');
    this.selected = null;
    this.moveOrigin = null;
    this.reachable = null;
    this.previewPath = null;
    this.attackTargets = [];
    this.targetCandidates = [];
    this.showToast('RAISED SKELETON!', 900);
    this.persistState();
    this.checkMatchOutcome();
    this.paint();
  }

  confirmActionOption(idx) {
    const opt = this.actionOptions[idx];
    const unit = this.selected;
    if (!opt || !unit) { this.cancelSelection(); return; }

    if (opt.kind === 'cancel') {
      this.cancelSelection();
      return;
    }
    if (opt.kind === 'attack' && opt.targets?.length) {
      this.openTargetSelect('attack', opt.targets, 0);
      return;
    }
    if (opt.kind === 'destroyTown' && opt.targets?.length) {
      this.openTargetSelect('destroyTown', opt.targets, 0);
      return;
    }
    if (opt.kind === 'capture' || opt.kind === 'repair') {
      const myPal = this.playerPalette[unit.playerSelector] ?? unit.playerSelector;
      this.assets.map.tiles[unit.x][unit.y] = encodeBuildingTile(this.rawTile(unit.x, unit.y), myPal);
      unit.action = 1;
      this.sfx('capture');
      this.showToast(opt.kind === 'capture' ? (this.assets.langStrings?.[73] || 'OCCUPIED!') : (this.assets.langStrings?.[74] || 'REPAIRED!'), 900);
    } else if (opt.kind === 'raise' && opt.tombs?.length) {
      if (opt.tombs.length === 1) {
        this.raiseSkeletonOn(unit, opt.tombs[0]);
      } else {
        this.openTargetSelect('raise', opt.tombs, 0);
      }
      return;
    } else {
      unit.action = 1;
    }

    this.selected = null;
    this.moveOrigin = null;
    this.reachable = null;
    this.previewPath = null;
    this.attackTargets = [];
    this.targetCandidates = [];
    this.state = this.state === 'dialog' ? 'dialog' : 'play';
    this.persistState();
    this.checkMatchOutcome();
    this.paint();
  }

  performAttack(attacker, defender, onDone = null) {
    const aTerrain = this.tileProperty(attacker.x, attacker.y) ?? 0;
    const dTerrain = this.tileProperty(defender.x, defender.y) ?? 0;
    const res = executeCombat({
      attacker,
      defender,
      terrainAt: (x, y) => this.tileProperty(x, y) ?? 0,
      rawTileAt: (x, y) => this.rawTile(x, y),
      tombTurns: this.playerCount,
    });
    attacker.action = 1;
    this.selected = null;
    this.moveOrigin = null;
    this.reachable = null;
    this.previewPath = null;
    this.attackTargets = [];
    this.targetCandidates = [];

    const finalize = () => {
      const msg = res.attackerLeveled
        ? `PROMOTED: ${this.unitName(attacker.type, attacker.level)}!`
        : (!this.settings.fightAnimation
            ? (res.counterDamage > 0 ? `HIT -${res.damage} · COUNTER -${res.counterDamage}` : `HIT -${res.damage}`)
            : null);
      if (res.attackerLeveled) this.sfx('levelup');
      else if (!this.settings.fightAnimation) this.sfx('attack');
      this.persistState();
      if (msg) this.showToast(msg, 1000);
      this.checkMatchOutcome();
      onDone?.();
      this.paint();
    };

    if (this.settings.fightAnimation) {
      this.battleScene = new BattleScene({
        attacker,
        attackerName: this.unitName(attacker.type, attacker.level),
        attackerTerrain: aTerrain,
        defender,
        defenderName: this.unitName(defender.type, defender.level),
        defenderTerrain: dTerrain,
        combatResult: res,
        assets: this.assets,
        width: WIDTH,
        height: HEIGHT,
        onSound: kind => this.sfx(kind),
      });
      this.battleOnDone = finalize;
      this.state = 'battle';
      this.paint();
    } else {
      finalize();
    }
  }

  getFallenKingFor(playerSelector) {
    return this.units.find(u => u.type === 9 && u.playerSelector === playerSelector && u.action === 3);
  }

  getRecruitCost(unitType, playerSelector = 1 + this.playerIndex) {
    if (unitType === 9) {
      const fallen = this.getFallenKingFor(playerSelector);
      if (fallen?.reviveCost != null) return fallen.reviveCost;
    }
    return this.assets.unitRecords[unitType]?.shortValue ?? 9999;
  }

  getRecruitList() {
    const mySelector = 1 + this.playerIndex;
    const hasKing = this.units.some(
      u => u.type === 9 && u.playerSelector === mySelector && u.action !== 3 && u.action !== 4 && u.hp > 0
    );
    return hasKing ? [0, 1, 2, 3, 4, 5, 6, 7, 8] : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  }

  confirmRecruit(unitType) {
    if (!this.recruitCastle) return;
    const list = this.getRecruitList();
    const actualType = list[unitType] ?? unitType;
    const mySelector = 1 + this.playerIndex;
    const cost = this.getRecruitCost(actualType, mySelector);
    const gold = this.balances[this.playerIndex] ?? 0;
    if (gold < cost || this.unitAt(this.recruitCastle.x, this.recruitCastle.y)) {
      this.showToast(gold < cost ? 'NOT ENOUGH GOLD!' : 'TILE OCCUPIED!', 900);
      return;
    }
    this.balances[this.playerIndex] = gold - cost;
    const fallenKing = actualType === 9 ? this.getFallenKingFor(mySelector) : null;
    if (fallenKing) {
      fallenKing.x = this.recruitCastle.x;
      fallenKing.y = this.recruitCastle.y;
      fallenKing.hp = 100;
      fallenKing.status = 0;
      fallenKing.frameIndex = 0;
      fallenKing.action = 1;
      fallenKing.movedThisTurn = false;
      fallenKing.palette = this.playerPalette[mySelector] ?? mySelector;
    } else {
      this.spawnStageUnit(actualType, mySelector, this.recruitCastle.x, this.recruitCastle.y, { action: 1 });
    }
    this.sfx('recruit');
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
    if (this.selected && this.reachable) {
      if (this.reachable.costs.has(`${this.cursor.x},${this.cursor.y}`)) {
        this.previewPath = traceRoute(this.reachable, this.selected.x, this.selected.y, this.cursor.x, this.cursor.y);
      } else {
        this.previewPath = null;
      }
    }
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
    this.previewPath = null;
    this.attackTargets = [];
    this.targetCandidates = [];
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
    for (const h of res.healed) {
      this.floatTexts.push({ x: h.x, y: h.y, text: `+${h.amount}`, color: '#7dff7d', offsetY: 0, timer: 1100 });
    }
    this.persistState();
    this.checkMatchOutcome();
    if (this.state === 'victory' || this.state === 'defeat') return;

    const roundNum = Math.floor(this.turn / Math.max(1, this.playerCount)) + 1;
    if (this.currentMapId === 'm2' && roundNum === 2 && !this.triggeredTurnDialogs.has('m2_elem')) {
      this.triggeredTurnDialogs.add('m2_elem');
      for (const [ex, ey] of CAMPAIGN_STAGE_CONFIG.m2.turn2Elementals) {
        if (!this.unitAt(ex, ey)) this.spawnStageUnit(2, 1, ex, ey);
      }
    }

    if (this.playerModes[this.playerIndex] === 0) {
      this.aiPending = true;
      this.aiTimer = 350;
      this.status.textContent = `P${this.playerIndex + 1} CPU · +${res.income}G`;
    } else {
      this.aiPending = false;
      this.status.textContent = `ROUND ${roundNum} · P${this.playerIndex + 1} +${res.income}G`;
      const meta = CAMPAIGN_STAGE_META[this.currentMapId];
      const turnScripts = meta?.turnDialogs?.[roundNum];
      if (turnScripts && this.settings.showStory && !this.triggeredTurnDialogs.has(roundNum)) {
        this.triggeredTurnDialogs.add(roundNum);
        this.playStoryDialogs(turnScripts, () => {
          this.showToast(`PLAYER ${this.playerIndex + 1} TURN (+${res.income}G)`, 900);
          this.paint();
        });
        return;
      }
      if (this.state !== 'storyDialog') {
        this.showToast(`PLAYER ${this.playerIndex + 1} TURN (+${res.income}G)`, 900);
      }
    }
    this.paint();
  }

  runAiStep() {
    if (this.state !== 'play') return;
    const mySelector = 1 + this.playerIndex;
    const myPal = this.playerPalette[mySelector] ?? mySelector;
    const idleUnit = this.units.find(
      u => u.playerSelector === mySelector && u.action === 0 && u.hp > 0 && u.type !== 11
    );
    if (idleUnit) {
      const act = chooseAiUnitAction({
        unit: idleUnit,
        units: this.units,
        map: this.assets.map,
        terrainAt: (x, y) => this.tileProperty(x, y) ?? 0,
        unitAt: (x, y) => this.unitAt(x, y),
        teamForPlayer: p => this.teamFor(p),
        myPalette: myPal,
        ownerTeamForTile: raw => this.ownerTeamForTile(raw),
      });
      idleUnit.x = act.x;
      idleUnit.y = act.y;
      if (act.kind === 'capture' || act.kind === 'repair') {
        this.assets.map.tiles[act.x][act.y] = encodeBuildingTile(this.rawTile(act.x, act.y), myPal);
        this.sfx('capture');
      } else if (act.kind === 'destroyTown') {
        this.assets.map.tiles[act.targetX][act.targetY] = 27;
        this.floatTexts.push({ x: act.targetX, y: act.targetY, text: 'RUINED!', color: '#ff9248', offsetY: 0, timer: 1100 });
        this.sfx('hit');
      } else if (act.kind === 'raise') {
        const tomb = this.units.find(u => u.id === act.tombId && u.action === 3 && u.type !== 9);
        if (tomb) {
          const stats = computeUnitStats(this.assets.unitRecords[10], 0);
          Object.assign(tomb, {
            ...stats, type: 10, playerSelector: mySelector, palette: myPal,
            hp: 100, xp: 0, level: 0, status: 0, action: 1, tombTimer: 0,
          });
          this.sfx('raise');
        }
      } else if (act.kind === 'attack') {
        const target = this.units.find(u => u.id === act.targetId);
        if (target && target.hp > 0) {
          this.aiTimer = 260;
          this.performAttack(idleUnit, target, () => {
            if (this.state === 'dialog') this.state = 'play';
            this.centerCameraOn(idleUnit.x, idleUnit.y);
          });
          return;
        }
      }
      idleUnit.action = 1;
      this.centerCameraOn(idleUnit.x, idleUnit.y);
      this.aiTimer = 260;
      this.checkMatchOutcome();
      this.paint();
      return;
    }

    // AI Castle Recruitment (i.java:3774-3850) — including Commander revival
    const gold = this.balances[this.playerIndex] ?? 0;
    const fallenKing = this.getFallenKingFor(mySelector);
    if (gold >= 150) {
      for (let x = 0; x < this.assets.map.width; x++) {
        for (let y = 0; y < this.assets.map.height; y++) {
          if (this.tileProperty(x, y) === 9 && this.isPropertyOwnedBy(x, y, this.playerIndex) && !this.unitAt(x, y)) {
            if (fallenKing && gold >= (fallenKing.reviveCost ?? 200)) {
              this.balances[this.playerIndex] -= (fallenKing.reviveCost ?? 200);
              fallenKing.x = x;
              fallenKing.y = y;
              fallenKing.hp = 100;
              fallenKing.action = 1;
              fallenKing.status = 0;
              fallenKing.movedThisTurn = false;
              fallenKing.palette = myPal;
              break;
            }
            const pickType = gold >= 450 ? 3 : gold >= 250 ? 1 : 0;
            const rec = this.assets.unitRecords[pickType];
            if (rec && (this.balances[this.playerIndex] ?? 0) >= rec.shortValue) {
              this.balances[this.playerIndex] -= rec.shortValue;
              this.spawnStageUnit(pickType, mySelector, x, y, { action: 1 });
              break;
            }
          }
        }
      }
    }

    this.aiPending = false;
    this.endTurn();
  }

  hasLivingUnit(playerSelector) {
    return this.units.some(u => u.playerSelector === playerSelector && u.action !== 3 && u.action !== 4 && u.hp > 0);
  }

  countOwnedCastles(playerIdx) {
    let castles = 0;
    for (let x = 0; x < this.assets.map.width; x++) {
      for (let y = 0; y < this.assets.map.height; y++) {
        if (this.tileProperty(x, y) === 9 && this.isPropertyOwnedBy(x, y, playerIdx)) castles++;
      }
    }
    return castles;
  }

  isSideEliminated(playerIdx) {
    return !this.hasLivingUnit(playerIdx + 1) && this.countOwnedCastles(playerIdx) === 0;
  }

  spawnReinforcements(specs, playerSelector) {
    for (const [type, tx, ty, extra] of specs) {
      let px = tx;
      let py = ty;
      if (this.unitAt(px, py)) {
        const alt = [[px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]]
          .find(([ax, ay]) => ax >= 0 && ay >= 0 && ax < this.assets.map.width && ay < this.assets.map.height && !this.unitAt(ax, ay));
        if (!alt) continue;
        [px, py] = alt;
      }
      this.spawnStageUnit(type, playerSelector, px, py, extra);
    }
  }

  checkCampaignTriggers() {
    const p1Units = this.units.filter(u => u.playerSelector === 1 && u.action !== 3 && u.action !== 4 && u.hp > 0);
    const p2Units = this.units.filter(u => u.playerSelector === 2 && u.action !== 3 && u.action !== 4 && u.hp > 0);
    const queuedDialogs = [];

    // Port of i.java:5570-5709: M4 Cave Ambushes 1-4 triggered as Player 1 advances
    if (this.currentMapId === 'm4') {
      if (this.m4Stage === 0 && p1Units.some(u => u.x <= 8)) {
        this.m4Stage = 1;
        this.spawnReinforcements([[10, 4, 1], [1, 5, 2], [10, 4, 3]], 2);
        queuedDialogs.push({ langIdx: 258, portrait: 5, focus: [4, 2] });
      }
      if (this.m4Stage === 1 && p1Units.some(u => u.y >= 7)) {
        this.m4Stage = 2;
        this.spawnReinforcements([[1, 5, 10], [5, 7, 8], [5, 7, 9]], 2);
      }
      if (this.m4Stage === 2 && p1Units.some(u => u.x >= 8 && u.y >= 6)) {
        this.m4Stage = 3;
        this.spawnReinforcements([[5, 12, 7], [6, 12, 6], [5, 12, 5]], 2);
      }
      if (this.m4Stage === 3 && p1Units.some(u => u.x >= 15 && u.y >= 8)) {
        this.m4Stage = 4;
        this.spawnReinforcements([[5, 16, 10], [6, 17, 10], [5, 18, 10], [1, 18, 9]], 2);
        queuedDialogs.push({ langIdx: 259, portrait: 0, focus: [17, 9] });
      }
    }

    // Port of i.java:5790-5976: M6 Rendezvous Bridge Ambush, Crystal evacuation, Saeth & Valadorn arrival
    if (this.currentMapId === 'm6') {
      const roundNum = Math.floor(this.turn / Math.max(1, this.playerCount)) + 1;
      if (this.m6Stage === 0 && roundNum >= 2) {
        this.m6Stage = 1;
        this.spawnReinforcements([[5, 14, 7], [0, 13, 7], [3, 12, 7], [1, 13, 8]], 2);
        queuedDialogs.push({ langIdx: 264, portrait: 5, focus: [13, 7] });
      } else if (this.m6Stage === 1 && (p2Units.some(u => u.x <= 9 || u.y >= 10) || p2Units.length === 0)) {
        this.m6Stage = 2;
        this.units = this.units.filter(u => u.type !== 11);
        this.spawnReinforcements([
          [9, 0, 8, { kingHead: 3 }], [0, 3, 8], [0, 1, 10], [8, 4, 8], [8, 2, 10], [4, 2, 9], [6, 4, 9], [6, 5, 10],
          [0, 12, 14], [6, 14, 14], [2, 13, 12], [3, 13, 15],
        ], 2);
        this.spawnReinforcements([
          [9, 13, 16, { kingHead: 2 }], [6, 12, 16], [8, 14, 16], [4, 13, 17], [1, 12, 17],
        ], 1);
        queuedDialogs.push(
          { langIdx: 265, portrait: 5, focus: [13, 4] },
          { langIdx: 266, portrait: 0 },
          { langIdx: 267, portrait: 3, focus: [0, 8] },
          { langIdx: 268, portrait: 5, focus: [13, 14] },
          { langIdx: 269, portrait: 0 },
          { langIdx: 270, portrait: 1, focus: [13, 16] }
        );
      }
    }

    if (queuedDialogs.length > 0 && this.settings.showStory) {
      const resumeAi = this.aiPending;
      this.aiPending = false;
      this.playStoryDialogs(queuedDialogs, () => {
        this.state = 'play';
        this.aiPending = resumeAi;
        this.persistState();
        this.paint();
      });
    }
  }

  checkMatchOutcome() {
    this.checkCampaignTriggers();

    const cfg = CAMPAIGN_STAGE_CONFIG[this.currentMapId];
    const galamarAlive = this.units.some(
      u => u.playerSelector === 1 && u.type === 9 && u.kingHead !== 2 && u.action !== 3 && u.action !== 4 && u.hp > 0
    );
    const crystalMissing = (this.currentMapId === 'm4' || (this.currentMapId === 'm6' && this.m6Stage < 2))
      && !this.units.some(u => u.type === 11 && u.playerSelector === 1 && u.action !== 3 && u.action !== 4 && u.hp > 0);

    for (let p = 0; p < this.playerCount; p++) {
      if (this.playerModes[p] === 2) continue;
      if (this.currentMapId === 'm4' && p === 1 && this.m4Stage < 4) continue;
      if (this.currentMapId === 'm6' && p === 1 && this.m6Stage < 2) continue;
      if (this.currentMapId === 'm0' && p === 1 && !this.m0Reinforced && this.settings.showStory) continue;
      if (this.isSideEliminated(p)) this.playerModes[p] = 2;
    }

    const humanSurvivors = this.playerModes.filter(m => m === 1).length;
    const galamarDefeat = !!cfg?.galamarSurvival && !galamarAlive;
    if (galamarDefeat || crystalMissing || humanSurvivors === 0) {
      this.aiPending = false;
      this.sfx('defeat');
      this.state = 'defeat';
      this.status.textContent = 'DEFEAT!';
      return;
    }

    // Port of i.java:5044-5085: M0 Temple Raiders Wave 2 reinforcement ambush once initial raiders fall.
    if (this.currentMapId === 'm0' && this.settings.showStory && !this.m0Reinforced && !this.hasLivingUnit(2)) {
      this.m0Reinforced = true;
      this.aiPending = false;
      const p1 = !this.unitAt(1, 2) ? [1, 2] : [1, 1];
      const p2 = !this.unitAt(10, 9) ? [10, 9] : [10, 10];
      if (!this.unitAt(p1[0], p1[1])) this.spawnStageUnit(1, 2, p1[0], p1[1]);
      if (!this.unitAt(p2[0], p2[1])) this.spawnStageUnit(0, 2, p2[0], p2[1]);
      this.playStoryDialogs([
        { langIdx: 225, portrait: 5, focus: p1 },
        { langIdx: 226, portrait: 0, focus: p2 },
      ], () => {
        this.state = 'play';
        this.persistState();
        this.paint();
      });
      return;
    }

    const saethKilled = !!cfg?.bossIsVictory
      && this.units.some(u => u.isSaethBoss && (u.action === 3 || u.action === 4 || u.hp <= 0));
    const activeSides = this.playerModes.filter(m => m !== 2).length;
    const cpuStillStanding = Array.from({ length: this.playerCount }, (_, p) => p)
      .some(p => this.playerModes[p] === 0 && (
        !this.isSideEliminated(p)
        || (this.currentMapId === 'm4' && p === 1 && this.m4Stage < 4)
        || (this.currentMapId === 'm6' && p === 1 && this.m6Stage < 2)
      ));

    if (saethKilled || (!cpuStillStanding && activeSides <= 1) || (this.currentMapId.startsWith('m') && !cpuStillStanding)) {
      this.aiPending = false;
      this.sfx('victory');
      const meta = CAMPAIGN_STAGE_META[this.currentMapId];
      const showVic = () => {
        this.state = 'victory';
        this.status.textContent = 'VICTORY!';
        this.paint();
      };
      const playEndCutscene = () => {
        if (this.settings.showStory && meta?.victoryCutscenes?.length) {
          const specs = meta.victoryCutscenes.map(idx => ({
            image: this.assets.images[`intro${idx}`] ?? null,
            text: `${this.assets.langStrings?.[215 + idx] || ''}\n\n${this.assets.langStrings?.[288] || ''}`,
          }));
          this.playCutsceneSequence(specs, showVic);
        } else {
          showVic();
        }
      };
      if (this.settings.showStory && meta?.victoryDialogs?.length && this.state !== 'victory') {
        this.playStoryDialogs(meta.victoryDialogs, playEndCutscene);
      } else {
        playEndCutscene();
      }
    }
  }

  persistState() {
    const data = {
      mapId: this.currentMapId,
      turn: this.turn,
      playerIndex: this.playerIndex,
      playerCount: this.playerCount,
      playerModes: this.playerModes,
      balances: this.balances,
      cursor: this.cursor,
      units: this.units,
      m0Reinforced: this.m0Reinforced,
      m4Stage: this.m4Stage,
      m6Stage: this.m6Stage,
      triggeredTurnDialogs: [...this.triggeredTurnDialogs],
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
      if (Array.isArray(saved.playerModes)) this.playerModes = saved.playerModes;
      if (Number.isInteger(saved.playerCount)) this.playerCount = saved.playerCount;
      if (Array.isArray(saved.balances)) this.balances = saved.balances;
      this.turn = saved.turn || 0;
      this.playerIndex = saved.playerIndex || 0;
      this.cursor = saved.cursor || this.cursor;
      this.m0Reinforced = !!saved.m0Reinforced;
      this.m4Stage = saved.m4Stage || 0;
      this.m6Stage = saved.m6Stage || 0;
      this.triggeredTurnDialogs = new Set(Array.isArray(saved.triggeredTurnDialogs) ? saved.triggeredTurnDialogs : []);
      this.state = 'play';
      this.status.textContent = `${this.currentMapId.toUpperCase()} · RESUMED`;
      this.paint();
    } catch {
      this.startCampaign();
    }
  }

  mapLabel(id) {
    if (id.startsWith('m')) {
      const idx = CAMPAIGN_MAPS.indexOf(id);
      const name = this.assets.langStrings?.[121 + idx];
      return name ? `${id.toUpperCase()} · ${name}` : id.toUpperCase();
    }
    const sIdx = SKIRMISH_MAPS.indexOf(id);
    const name = this.assets.langStrings?.[101 + sIdx];
    return name ? `${id.toUpperCase()} ${name}` : id.toUpperCase();
  }

  drawHudIcon(ctx, hoverUnit) {
    if (hoverUnit) {
      const acted = hoverUnit.action === 1 || hoverUnit.action === 2;
      const teamPal = Math.max(1, hoverUnit.palette ?? 1);
      const pal = acted ? 0 : teamPal;
      const sheet = this.assets.unitIconPalettes?.[pal] ?? this.assets.images.unit_icons;
      const frame = ((hoverUnit.frameIndex ?? 0) & 1) * 12 + (hoverUnit.type ?? 0);
      const sx = (frame % 12) * 24;
      const sy = Math.floor(frame / 12) * 24;
      if (sheet) drawRegionMIDP(ctx, sheet, sx, sy, 24, 24, 0, 2, 2, MIDP.LEFT | MIDP.TOP);
      if (hoverUnit.type === 9 && this.assets.sprites.king_head_icons) {
        const headMeta = this.assets.sprites.king_head_icons;
        const headImg = acted ? (this.assets.kingHeadPalettes?.[0] ?? this.assets.images.king_head_icons) : this.assets.images.king_head_icons;
        const headTeam = Number.isInteger(hoverUnit.kingHead)
          ? hoverUnit.kingHead
          : Math.max(0, Math.min(3, teamPal - 1));
        const headFrame = headMeta.frames?.[headTeam * 2 + ((hoverUnit.frameIndex ?? 0) & 1)];
        if (headImg && headFrame) {
          drawRegionMIDP(ctx, headImg, headFrame.sourceFrame * headMeta.frameWidth, 0, headMeta.frameWidth, headMeta.frameHeight,
            headFrame.transform ?? 0, 2 + (headFrame.offsetX ?? 0), 2 + (headFrame.offsetY ?? 0), MIDP.LEFT | MIDP.TOP);
        }
      }
      return;
    }
    const tomb = this.tombstoneAt(this.cursor.x, this.cursor.y);
    if (tomb && this.assets.images.tombstone) {
      drawRegionMIDP(ctx, this.assets.images.tombstone, 0, 0, 24, 24, 0, 2, 2, MIDP.LEFT | MIDP.TOP);
      return;
    }
    const rawTile = this.rawTile(this.cursor.x, this.cursor.y);
    if (rawTile >= 37) {
      const enc = rawTile - 37;
      const pal = Math.floor(enc / 2);
      const bImg = this.assets.buildingPaletteImages?.[pal] ?? this.assets.images.buildings;
      if (bImg) drawRegionMIDP(ctx, bImg, (enc % 2) * 24, 0, 24, 24, 0, 2, 2, MIDP.LEFT | MIDP.TOP);
    } else {
      const meta = this.assets.sprites.tiles0;
      const frame = meta?.frames?.[rawTile];
      const tileImg = frame ? this.assets.frameImages.tiles0?.[frame.sourceFrame] : null;
      if (tileImg) {
        drawRegionMIDP(ctx, tileImg, 0, 0, meta.frameWidth, meta.frameHeight, frame.transform ?? 0, 2, 2, MIDP.LEFT | MIDP.TOP);
      }
    }
  }

  renderTargetForecast(ctx) {
    const attacker = this.selected;
    const target = this.targetCandidates[this.targetCursor];
    if (!attacker || !target) return;
    const isAttack = this.targetKind === 'attack';
    const isTown = this.targetKind === 'destroyTown';
    const boxY = 30;
    ctx.fillStyle = 'rgba(20, 16, 26, 0.94)';
    ctx.fillRect(6, boxY, WIDTH - 12, 36);
    ctx.strokeStyle = isAttack ? '#ff4b4b' : isTown ? '#ffa640' : '#9cff7b';
    ctx.lineWidth = 1;
    ctx.strokeRect(6, boxY, WIDTH - 12, 36);

    if (isTown) {
      centerText(ctx, `BOMBARD TOWN (${target.x},${target.y}) · DESTROYS TOWN`, boxY + 12, { font: 'bold 8px monospace', color: '#ffa640' });
      centerText(ctx, 'ENTER / TAP TARGET · ESC BACK', boxY + 26, { font: '8px monospace', color: '#e6decb' });
      return;
    }
    if (!isAttack) {
      centerText(ctx, 'SELECT TOMBSTONE TO RAISE SKELETON', boxY + 12, { font: 'bold 8px monospace', color: '#9cff7b' });
      centerText(ctx, 'ENTER / TAP TARGET · ESC BACK', boxY + 26, { font: '8px monospace', color: '#e6decb' });
      return;
    }

    const aProp = this.tileProperty(attacker.x, attacker.y) ?? 0;
    const dProp = this.tileProperty(target.x, target.y) ?? 0;
    const aMod = attackModifierFor(attacker, target, attacker.x, attacker.y, aProp, this.rawTile(attacker.x, attacker.y));
    const aDef = defenseModifierFor(attacker, attacker.x, attacker.y, aProp, this.rawTile(attacker.x, attacker.y));
    const dDef = defenseModifierFor(target, target.x, target.y, dProp, this.rawTile(target.x, target.y));

    const hudImg = this.assets.images.hud_icons;
    if (hudImg) {
      drawRegionMIDP(ctx, hudImg, 0, 0, 13, 16, 0, 12, boxY + 3, MIDP.LEFT | MIDP.TOP);
      drawRegionMIDP(ctx, hudImg, 13, 0, 13, 16, 0, 12, boxY + 19, MIDP.LEFT | MIDP.TOP);
    }
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#5bb8ff';
    ctx.fillText(`${this.unitName(attacker.type, attacker.level).slice(0, 10)} (${attacker.hp})`, 28, boxY + 10);
    ctx.fillStyle = '#f4dfb3';
    ctx.fillText(`ATK:${attacker.atkMin + aMod}-${attacker.atkMax + aMod} DEF:${attacker.defense + aDef}`, 28, boxY + 26);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#ff7272';
    ctx.fillText(`${this.unitName(target.type, target.level).slice(0, 10)} (${target.hp})`, WIDTH - 12, boxY + 10);
    ctx.fillStyle = '#e6decb';
    ctx.fillText(`DEF:${target.defense + dDef} LV:${target.level}`, WIDTH - 12, boxY + 26);
  }

  paint() {
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#0e131a';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    if (this.state === 'splash') {
      drawImageAt(ctx, this.assets.images.splash, 0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = 'rgba(14, 16, 24, 0.86)';
      ctx.fillRect(42, 224, 156, 20);
      ctx.strokeStyle = '#caa568';
      ctx.strokeRect(42, 224, 156, 20);
      centerText(ctx, 'PRESS ANY KEY / TAP', 234, { font: 'bold 9px monospace', color: '#ffd84d' });
      return;
    }

    if (this.state === 'cutscene') {
      const cur = this.cutsceneQueue[0] ?? { image: null, text: '' };
      this.cutsceneMaxScroll = renderCutsceneScreen(ctx, {
        image: cur.image,
        text: cur.text,
        scrollPx: this.cutsceneScroll,
        width: WIDTH,
        height: HEIGHT,
      });
      return;
    }

    if (this.state === 'battle' && this.battleScene) {
      this.battleScene.render(ctx);
      return;
    }

    if (this.state === 'menu') {
      const grad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      grad.addColorStop(0, '#1d1624');
      grad.addColorStop(0.45, '#12151f');
      grad.addColorStop(1, '#0b0e15');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      drawImageAt(ctx, this.assets.images.logo, 1, 14, 238, 85);
      const items = this.getMainMenuItems();
      const menuSheet = this.assets.images.menu_icons;
      items.forEach((item, i) => {
        const y = 114 + i * 26;
        ctx.fillStyle = i === this.menuCursor ? '#3c2a18' : '#1b1410';
        ctx.fillRect(26, y, 188, 22);
        ctx.strokeStyle = i === this.menuCursor ? '#ffd84d' : '#7b6344';
        ctx.strokeRect(26, y, 188, 22);
        if (menuSheet) {
          const mMeta = this.assets.sprites.menu_icons;
          const fw = mMeta?.frameWidth ?? 25;
          const fh = mMeta?.frameHeight ?? 25;
          ctx.drawImage(menuSheet, item.icon * fw, 0, fw, fh, 30, y + 1, 20, 20);
        }
        ctx.fillStyle = i === this.menuCursor ? '#ffd84d' : '#f1e7d2';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.label, 54, y + 11, 152);
      });
      centerText(ctx, 'TAP OR ARROWS · ENTER', 292, { font: '8px monospace', color: '#9eb092' });
      return;
    }

    if (this.state === 'skirmishSetup') {
      centerText(ctx, 'SKIRMISH SETUP', 18, { font: 'bold 11px monospace', color: '#ffd84d' });
      const mapId = SKIRMISH_MAPS[this.skirmishConfig.mapIdx] || 's0';
      const pCount = this.getSkirmishPlayerCount(mapId);
      const colors = ['BLUE', 'RED', 'GREEN', 'YELLOW'];
      const rows = [
        ['MAP', this.mapLabel(mapId)],
        ['STARTING GOLD', `${this.skirmishConfig.gold}G`],
        ...Array.from({ length: pCount }, (_, i) => [
          `PLAYER ${i + 1} (${colors[i]})`,
          this.skirmishConfig.players[i] === 1 ? 'HUMAN' : 'CPU',
        ]),
      ];
      rows.forEach(([k, v], i) => {
        const y = 44 + i * 33;
        ctx.fillStyle = i === this.skirmishCursor ? '#3b2e1b' : '#181c24';
        ctx.fillRect(18, y, WIDTH - 36, 28);
        ctx.strokeStyle = i === this.skirmishCursor ? '#ffd84d' : '#524433';
        ctx.strokeRect(18, y, WIDTH - 36, 28);
        ctx.font = '8px monospace';
        ctx.fillStyle = '#a9d69d';
        ctx.textAlign = 'left';
        ctx.fillText(k, 26, y + 11);
        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = '#ffd84d';
        ctx.fillText(`◀  ${v}  ▶`, 26, y + 23, WIDTH - 52);
      });
      const startSel = this.skirmishCursor >= rows.length;
      ctx.fillStyle = startSel ? '#3c2a18' : '#241a14';
      ctx.fillRect(16, 280, 102, 24);
      ctx.strokeStyle = startSel ? '#ffd84d' : '#8b6f47';
      ctx.strokeRect(16, 280, 102, 24);
      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = '#ffd84d';
      ctx.textAlign = 'center';
      ctx.fillText('START BATTLE', 67, 295);

      ctx.fillStyle = '#1b1410';
      ctx.fillRect(126, 280, 98, 24);
      ctx.strokeStyle = '#8b6f47';
      ctx.strokeRect(126, 280, 98, 24);
      ctx.fillStyle = '#e6decb';
      ctx.fillText('BACK · ESC', 175, 295);
      return;
    }

    if (this.state === 'settings') {
      centerText(ctx, 'SETTINGS', 24, { font: 'bold 11px monospace', color: '#ffd84d' });
      const rows = [
        ['FIGHT ANIMATION', this.settings.fightAnimation ? 'ON' : 'OFF'],
        ['SOUND FX', this.settings.sound ? 'ON' : 'OFF'],
        ['CAMPAIGN STORY', this.settings.showStory ? 'ON' : 'OFF'],
      ];
      rows.forEach(([label, val], i) => {
        const y = 76 + i * 36;
        ctx.fillStyle = i === this.settingsCursor ? '#3b2e1b' : '#181c24';
        ctx.fillRect(24, y, WIDTH - 48, 28);
        ctx.strokeStyle = i === this.settingsCursor ? '#ffd84d' : '#524433';
        ctx.strokeRect(24, y, WIDTH - 48, 28);
        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = '#f1e7d2';
        ctx.textAlign = 'left';
        ctx.fillText(label, 34, y + 17);
        ctx.textAlign = 'right';
        ctx.fillStyle = val === 'ON' ? '#9cff7b' : '#ff7b7b';
        ctx.fillText(val, WIDTH - 34, y + 17);
      });
      ctx.fillStyle = '#241a14';
      ctx.fillRect(48, 282, 144, 22);
      ctx.strokeStyle = '#8b6f47';
      ctx.strokeRect(48, 282, 144, 22);
      centerText(ctx, 'BACK · ESC', 293, { font: 'bold 8px monospace', color: '#e6decb' });
      return;
    }

    if (this.state === 'instructions') {
      centerText(ctx, 'HOW TO PLAY & UNITS', 18, { font: 'bold 10px monospace', color: '#ffd84d' });
      centerText(ctx, '▲ SCROLL UP', 36, { font: '8px monospace', color: this.helpScroll > 0 ? '#ffd84d' : '#4a5262' });
      const tips = [];
      for (let idx = 198; idx <= 214; idx++) {
        if (this.assets.langStrings?.[idx]) {
          const clean = this.assets.langStrings[idx].replace(/%KM/g, 'ARROWS').replace(/%K\d/g, 'ENTER');
          tips.push(...wrapText(ctx, `• ${clean}`, WIDTH - 24));
        }
      }
      ctx.save();
      ctx.beginPath();
      ctx.rect(8, 46, WIDTH - 16, 226);
      ctx.clip();
      ctx.font = '8px monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#e6decb';
      for (let i = 0; i < 18 && this.helpScroll + i < tips.length; i++) {
        ctx.fillText(tips[this.helpScroll + i], 12, 56 + i * 12);
      }
      ctx.restore();
      centerText(ctx, '▼ SCROLL DOWN', 274, { font: '8px monospace', color: this.helpScroll < Math.max(0, tips.length - 18) ? '#ffd84d' : '#4a5262' });
      ctx.fillStyle = '#241a14';
      ctx.fillRect(48, 282, 144, 22);
      ctx.strokeStyle = '#8b6f47';
      ctx.strokeRect(48, 282, 144, 22);
      centerText(ctx, 'TAP PAGE / ESC BACK', 293, { font: 'bold 8px monospace', color: '#e6decb' });
      return;
    }

    if (this.state === 'levelSelect') {
      const start = this.getLevelSelectStart();
      centerText(ctx, `SELECT MAP (${this.mapIndex + 1}/${this.mapList.length})`, 20, { font: 'bold 10px monospace', color: '#ffd84d' });
      centerText(ctx, '▲ SCROLL UP', 43, { font: '8px monospace', color: start > 0 ? '#ffd84d' : '#4a5262' });
      for (let row = 0; row < 11 && start + row < this.mapList.length; row++) {
        const idx = start + row;
        const y = 54 + row * 18;
        ctx.fillStyle = idx === this.mapIndex ? '#3b2e1b' : '#181c24';
        ctx.fillRect(18, y, 188, 16);
        if (idx === this.mapIndex) {
          ctx.strokeStyle = '#ffd84d';
          ctx.strokeRect(18, y, 188, 16);
        }
        centerText(ctx, this.mapLabel(this.mapList[idx]), y + 8, { font: '8px monospace', maxWidth: 180, color: idx === this.mapIndex ? '#ffd84d' : '#e6decb' });
      }
      // Visible scrollbar track & thumb
      ctx.fillStyle = '#181c24';
      ctx.fillRect(212, 54, 6, 196);
      const maxStart = Math.max(1, this.mapList.length - 11);
      const thumbH = Math.max(24, Math.floor(196 * 11 / this.mapList.length));
      const thumbY = 54 + Math.floor((196 - thumbH) * (start / maxStart));
      ctx.fillStyle = '#caa568';
      ctx.fillRect(212, thumbY, 6, thumbH);
      centerText(ctx, '▼ SCROLL DOWN', 266, { font: '8px monospace', color: start < maxStart ? '#ffd84d' : '#4a5262' });
      ctx.fillStyle = '#241a14';
      ctx.fillRect(48, 282, 144, 22);
      ctx.strokeStyle = '#8b6f47';
      ctx.strokeRect(48, 282, 144, 22);
      centerText(ctx, 'BACK TO MENU · ESC', 293, { font: 'bold 8px monospace', color: '#e6decb' });
      return;
    }

    // Strategic map board (y = 28..292)
    const { boardH, offsetX, offsetY } = this.getBoardGeometry();
    this.boardCtx.fillStyle = '#0e131a';
    this.boardCtx.fillRect(0, 0, WIDTH, boardH);
    this.boardCtx.save();
    this.boardCtx.translate(offsetX, offsetY);
    renderOriginalBoard(this.boardCtx, {
      map: this.assets.map,
      assets: this.assets,
      cameraX: this.cameraX,
      cameraY: this.cameraY,
      viewportWidth: WIDTH - offsetX * 2,
      viewportHeight: boardH - offsetY * 2,
      units: this.units,
      cursor: { ...this.cursor, frameIndex: this.state === 'targetSelect' ? (this.animTick % 4 < 2 ? 1 : 0) : 0 },
      rangeCells: (this.state === 'play' || this.state === 'moveAnim') ? this.reachable?.cells : null,
      targetCells: (this.state === 'play' || this.state === 'targetSelect')
        ? (this.state === 'targetSelect' ? this.targetCandidates.map(t => [t.x, t.y]) : this.attackTargets.map(t => [t.x, t.y]))
        : null,
      path: this.state === 'play' ? this.previewPath : null,
      waterAnimFrame: this.waterAnimFrame,
      floatTexts: this.floatTexts,
    });
    this.boardCtx.restore();
    ctx.drawImage(this.boardCanvas, 0, 28);

    // Top HUD bar (0..28) using hud_icons_2 gold & unit count
    ctx.fillStyle = '#18141c';
    ctx.fillRect(0, 0, WIDTH, 28);
    const hoverUnit = this.unitAt(this.cursor.x, this.cursor.y);
    this.drawHudIcon(ctx, hoverUnit);
    const myUnitsCount = this.units.filter(
      u => u.playerSelector === 1 + this.playerIndex && u.action !== 3 && u.action !== 4 && u.hp > 0
    ).length;
    const roundHud = Math.floor(this.turn / Math.max(1, this.playerCount)) + 1;
    const hud2 = this.assets.images.hud_icons_2;
    if (hud2) {
      ctx.drawImage(hud2, 11, 0, 11, 11, 30, 2, 11, 11);
      ctx.drawImage(hud2, 0, 0, 11, 11, 108, 2, 11, 11);
    }
    ctx.fillStyle = '#f4dfb3';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${this.balances[this.playerIndex] ?? 0}G`, 44, 11);
    ctx.fillText(`${myUnitsCount} · R${roundHud} P${this.playerIndex + 1}`, 122, 11);

    ctx.fillStyle = '#a9d69d';
    ctx.font = '8px monospace';
    const tileProp = this.tileProperty(this.cursor.x, this.cursor.y);
    const tombHover = this.tombstoneAt(this.cursor.x, this.cursor.y);
    const subLabel = hoverUnit
      ? `${this.unitName(hoverUnit.type, hoverUnit.level)} HP:${hoverUnit.hp} LV:${hoverUnit.level}`
      : tombHover
        ? `TOMBSTONE (${this.cursor.x},${this.cursor.y})`
        : `${this.currentMapId.toUpperCase()} (${this.cursor.x},${this.cursor.y}) DEF:${[0, 5, 10, 10, 15, 0, 5, 15, 15, 15][tileProp ?? 0] ?? 0}`;
    ctx.fillText(subLabel, 30, 23);

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
    ctx.fillText(this.state === 'targetSelect' ? 'BACK' : 'MENU', 33, HEIGHT - 11);
    ctx.fillText(this.state === 'targetSelect' ? 'CONFIRM' : 'END TURN', WIDTH - 43, HEIGHT - 11);

    if (this.state === 'targetSelect') {
      this.renderTargetForecast(ctx);
      return;
    }

    if (this.state === 'storyDialog') {
      const cur = this.storyQueue[0];
      if (cur) {
        renderStoryDialogOverlay(ctx, {
          portraitsImg: this.assets.images.portraits,
          portrait: cur.portrait,
          text: cur.text,
          width: WIDTH,
          height: HEIGHT,
        });
      }
      return;
    }

    if (this.state === 'stageBanner') {
      ctx.fillStyle = 'rgba(14, 16, 24, 0.94)';
      ctx.fillRect(14, 106, WIDTH - 28, 104);
      ctx.strokeStyle = '#ffd84d';
      ctx.lineWidth = 2;
      ctx.strokeRect(14, 106, WIDTH - 28, 104);
      centerText(ctx, this.stageBannerTitle, 124, { font: 'bold 11px monospace', color: '#ffd84d' });
      const lines = wrapText(ctx, this.stageBannerObjective, WIDTH - 48);
      ctx.font = '9px monospace';
      ctx.fillStyle = '#f1e7d2';
      ctx.textAlign = 'center';
      for (let i = 0; i < Math.min(lines.length, 3); i++) {
        ctx.fillText(lines[i], WIDTH >> 1, 148 + i * 13);
      }
      centerText(ctx, this.stageBannerPrompt || 'TAP OR ENTER TO BEGIN', 194, { font: 'bold 8px monospace', color: '#a9d69d' });
      return;
    }

    if (this.state === 'actionMenu') {
      const h = this.actionOptions.length * 22 + 14;
      ctx.fillStyle = '#14101a';
      ctx.fillRect(44, 98, 152, h);
      ctx.strokeStyle = '#ffd84d';
      ctx.strokeRect(44, 98, 152, h);
      const actIcons = this.assets.images.action_icons;
      this.actionOptions.forEach((opt, i) => {
        const y = 105 + i * 22;
        if (i === this.actionCursor) {
          ctx.fillStyle = '#3b2e1b';
          ctx.fillRect(50, y, 140, 20);
        }
        if (actIcons && opt.icon != null) {
          ctx.drawImage(actIcons, opt.icon * 16, 0, 16, 16, 56, y + 2, 16, 16);
        }
        ctx.fillStyle = i === this.actionCursor ? '#ffd84d' : '#f1e7d2';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(opt.label, 78, y + 13, 106);
      });
    } else if (this.state === 'recruitMenu') {
      const { list, rowHeight, headerHeight, panelH, panelY } = this.getRecruitPanelLayout();
      const myPal = this.playerPalette[1 + this.playerIndex] ?? (1 + this.playerIndex);
      const sheet = this.assets.unitIconPalettes?.[myPal] ?? this.assets.images.unit_icons;
      ctx.fillStyle = '#14101a';
      ctx.fillRect(20, panelY, 200, panelH);
      ctx.strokeStyle = '#ffd84d';
      ctx.strokeRect(20, panelY, 200, panelH);
      centerText(ctx, `RECRUIT · GOLD: ${this.balances[this.playerIndex] ?? 0}`, panelY + 12, { font: 'bold 9px monospace', color: '#ffd84d' });
      for (let i = 0; i < list.length; i++) {
        const uType = list[i];
        const y = panelY + headerHeight + i * rowHeight;
        const cost = this.getRecruitCost(uType);
        const canAfford = (this.balances[this.playerIndex] ?? 0) >= cost;
        if (i === this.recruitCursor) {
          ctx.fillStyle = '#3b2e1b';
          ctx.fillRect(26, y, 188, 18);
        }
        if (sheet) ctx.drawImage(sheet, uType * 24, 0, 24, 24, 28, y + 1, 16, 16);
        ctx.fillStyle = canAfford ? (uType === 9 ? '#ffd84d' : '#f1e7d2') : '#777';
        ctx.font = '8px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(uType === 9 ? `★ ${this.unitName(uType)}` : `${this.unitName(uType)}`, 48, y + 12);
        ctx.textAlign = 'right';
        ctx.fillText(`${cost}G`, 208, y + 12);
      }
      const cancelY = panelY + headerHeight + list.length * rowHeight + 2;
      ctx.fillStyle = '#241a14';
      ctx.fillRect(46, cancelY, 148, 16);
      ctx.strokeStyle = '#8b6f47';
      ctx.strokeRect(46, cancelY, 148, 16);
      centerText(ctx, 'CANCEL · ESC', cancelY + 8, { font: '8px monospace', color: '#e6decb' });
    } else if (this.state === 'pauseMenu') {
      const opts = this.getPauseOptions();
      const panelH = 28 + opts.length * 22 + 8;
      const panelY = (HEIGHT - panelH) >> 1;
      ctx.fillStyle = '#14101a';
      ctx.fillRect(32, panelY, 176, panelH);
      ctx.strokeStyle = '#ffd84d';
      ctx.strokeRect(32, panelY, 176, panelH);
      centerText(ctx, 'GAME MENU', panelY + 13, { font: 'bold 10px monospace', color: '#ffd84d' });
      opts.forEach((label, i) => {
        const y = panelY + 26 + i * 22;
        if (i === this.pauseCursor) {
          ctx.fillStyle = '#3b2e1b';
          ctx.fillRect(40, y, 160, 19);
        }
        centerText(ctx, label, y + 9, { font: 'bold 9px monospace', color: i === this.pauseCursor ? '#ffd84d' : '#f1e7d2' });
      });
    } else if (this.state === 'dialog' || this.state === 'victory' || this.state === 'defeat') {
      if (this.state === 'defeat' && this.assets.images.gameover) {
        drawImageAt(ctx, this.assets.images.gameover, 0, 28, WIDTH, HEIGHT - 56);
      }
      ctx.fillStyle = 'rgba(21, 13, 24, 0.92)';
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
