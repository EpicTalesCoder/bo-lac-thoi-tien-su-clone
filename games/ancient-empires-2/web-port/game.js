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
import { CAMPAIGN_STAGE_CONFIG, CAMPAIGN_STAGE_META, CAMPAIGN_STAGE_SCRIPTS, SPEAKER_NAMES, renderCutsceneScreen, wrapText } from './ae2-story.js';
import {
  RingMenu,
  UI_COLORS,
  drawBitmapText,
  drawFramedListMenu,
  drawMapHudBar,
  drawMenuFrame,
  drawOutlinedText,
  drawRecruitDialog,
  drawSoftkeyButton,
  drawSpriteFrame,
  drawStoryDialogBox,
  drawTargetForecastBar,
  drawUiText,
  drawWrappedLines,
} from './ae2-ui.js';

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
    'chars', 'lchars', 'small_spark',
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
    'splash', 'logo', 'glow', 'ms_logo', 'tombstone', 'gameover',
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
    this.state = 'splash'; // splash | menu | about | levelSelect | skirmishSetup | settings | instructions | cutscene | stageBanner | script | storyDialog | pauseMenu | play | moveAnim | targetSelect | actionMenu | recruitMenu | battle | dialog | victory | defeat
    this.menuCursor = 0;
    this.mainRing = null;
    this.actionRing = null;
    this.glowX = -67;
    this.aboutScroll = 0;
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
    this.aiTask = null;
    this.animTick = 0;
    this.animTickAcc = 0;
    this.spriteAnimAcc = 0;
    this.waterAnimFrame = 0;
    this.floatTexts = [];
    this.mapEffects = [];
    this.scriptState = null;
    this.saveKey = 'ae2-local-state-v2';
    this.settingsKey = 'ae2-settings-v1';
    this.lastTick = 0;
    this.accumulator = 0;
    this.boardCanvas = document.createElement('canvas');
    this.boardCanvas.width = WIDTH;
    this.boardCanvas.height = HEIGHT - 32;
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
    const boardH = HEIGHT - 32;
    const mapW = (this.assets.map?.width ?? 0) * 24;
    const mapH = (this.assets.map?.height ?? 0) * 24;
    const offsetX = mapW > 0 && mapW < WIDTH ? ((WIDTH - mapW) >> 1) : 0;
    const offsetY = mapH > 0 && mapH < boardH ? ((boardH - mapH) >> 1) : 0;
    return { boardH, mapW, mapH, offsetX, offsetY };
  }

  getLevelSelectStart() {
    return Math.max(0, Math.min(this.mapList.length - 9, this.mapIndex - 4));
  }

  getRecruitPanelLayout() {
    const list = this.getRecruitList();
    return { list, slotSpacing: 38, baseCx: 120, baseCy: 258, visibleSlots: Math.min(5, list.length) };
  }

  initMainRing() {
    // Port of i.java:2197 & d.java:538-545, 1128: full ring below logo at y=87..320 with subtle wide radius
    const items = this.getMainMenuItems();
    this.mainRing = new RingMenu({
      items,
      selectedIndex: Math.min(items.length - 1, Math.max(0, this.menuCursor)),
      centerX: 120,
      centerY: 205,
      radius: 70,
      circleSprite: 'big_circle',
      iconSprite: 'menu_icons',
      maxW: WIDTH,
      maxH: HEIGHT,
      titleX: 2,
      titleW: WIDTH - 4,
      titleY: 87,
      showTitleArrows: false,
    });
  }

  openMenu(state = 'menu', returnState = 'menu') {
    this.subMenuReturnState = returnState;
    this.state = state;
    this.aiPending = false;
    this.aiTask = null;
    this.moveAnim = null;
    this.battleScene = null;
    this.scriptState = null;
    this.mapEffects = [];
    for (const u of this.units) { u.px = null; u.py = null; }
    this.selected = null;
    this.moveOrigin = null;
    this.reachable = null;
    this.previewPath = null;
    this.attackTargets = [];
    this.targetCandidates = [];
    this.recruitCastle = null;
    this.actionRing = null;
    if (state === 'menu') this.initMainRing();
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
    this.mapEffects = [];
    this.scriptState = null;
    this.aiTask = null;
    this.aiPending = false;
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

  playStageScript(steps, onDone) {
    if (!steps || steps.length === 0) {
      onDone?.();
      return;
    }
    this.scriptState = {
      steps: steps.map(s => ({ ...s })),
      index: -1,
      active: null,
      waitMs: 0,
      dialog: null,
      onDone,
    };
    this.state = 'script';
    this.advanceScriptStep();
    this.paint();
  }

  spawnMapEffect(sprite, x, y, durationMs = 450, stepMs = 75) {
    const meta = this.assets.sprites?.[sprite];
    const maxFrames = Math.max(1, meta?.frames?.length ?? 4);
    this.mapEffects.push({ sprite, x, y, frame: 0, timer: 0, stepMs, remainingMs: durationMs, maxFrames });
  }

  // Port of c.java:547-572: spawn trailing b_smoke dust puff behind walking unit along (dx, dy)
  spawnStepSmoke(unit, dx, dy) {
    if (!unit) return;
    const ux = unit.px ?? (unit.x * 24);
    const uy = unit.py ?? (unit.y * 24);
    let px = ux + 12;
    let py = uy + 18;
    if (dx < 0) { px = ux + 23; py = uy + 18; }
    else if (dx > 0) { px = ux + 1; py = uy + 18; }
    else if (dy < 0) { px = ux + 12; py = uy + 23; }
    else if (dy > 0) { px = ux + 12; py = uy + 3; }
    const meta = this.assets.sprites?.b_smoke;
    const maxFrames = Math.max(1, meta?.frames?.length ?? 4);
    this.mapEffects.push({
      sprite: 'b_smoke',
      x: unit.x,
      y: unit.y,
      px,
      py,
      vx: -Math.sign(dx) * 0.008,
      vy: -0.014,
      frame: 0,
      timer: 0,
      stepMs: 60,
      remainingMs: 240,
      maxFrames,
    });
  }

  targetCameraFor(tx, ty) {
    const boardH = HEIGHT - 32;
    const maxCamX = Math.max(0, this.assets.map.width * 24 - WIDTH);
    const maxCamY = Math.max(0, this.assets.map.height * 24 - boardH);
    return {
      cx: Math.max(0, Math.min(maxCamX, tx * 24 - (WIDTH >> 1) + 12)),
      cy: Math.max(0, Math.min(maxCamY, ty * 24 - (boardH >> 1) + 12)),
    };
  }

  // Port of i.java:4922-5395: executes in-map pans, unit marches, spell effects, & multi-speaker exchanges
  advanceScriptStep() {
    const st = this.scriptState;
    if (!st) return;
    st.index++;
    if (st.index >= st.steps.length) {
      this.units = this.units.filter(u => !u.tempEscort);
      const fn = st.onDone;
      this.scriptState = null;
      this.state = 'play';
      fn?.();
      return;
    }
    const step = st.steps[st.index];
    st.active = step;
    st.waitMs = 0;
    st.dialog = null;

    if (step.kind === 'pan' || step.kind === 'focusHero') {
      const targetPos = step.kind === 'focusHero'
        ? (() => {
            const hero = this.units.find(u => u.playerSelector === 1 && u.type === 9 && u.action !== 3 && u.action !== 4 && u.hp > 0)
              || this.units.find(u => u.playerSelector === 1 && u.action !== 3 && u.action !== 4 && u.hp > 0);
            return [hero?.x ?? 0, hero?.y ?? 0];
          })()
        : step.target;
      this.cursor = { x: targetPos[0], y: targetPos[1] };
      const { cx, cy } = this.targetCameraFor(targetPos[0], targetPos[1]);
      step._targetCam = { cx, cy };
      step._pauseLeft = step.pauseMs ?? 200;
      return;
    }

    if (step.kind === 'moveGroup') {
      step._movers = (step.moves || []).map(m => {
        const u = this.unitAt(m.from[0], m.from[1]);
        const path = [[m.from[0], m.from[1]]];
        let cx = m.from[0];
        let cy = m.from[1];
        while (cx !== m.to[0]) {
          cx += Math.sign(m.to[0] - cx);
          path.push([cx, cy]);
        }
        while (cy !== m.to[1]) {
          cy += Math.sign(m.to[1] - cy);
          path.push([cx, cy]);
        }
        if (u) { u.px = m.from[0] * 24; u.py = m.from[1] * 24; }
        return { unit: u, path, segIdx: 0, segMs: 0, stepMs: 135 };
      }).filter(item => item.unit);
      step._pauseLeft = step.pauseMs ?? 200;
      return;
    }

    if (step.kind === 'spawnMove') {
      let u = this.unitAt(step.from[0], step.from[1]);
      if (!u) u = this.spawnStageUnit(step.type, step.playerSelector, step.from[0], step.from[1]);
      const path = [[step.from[0], step.from[1]]];
      let cx = step.from[0];
      let cy = step.from[1];
      while (cx !== step.to[0]) { cx += Math.sign(step.to[0] - cx); path.push([cx, cy]); }
      while (cy !== step.to[1]) { cy += Math.sign(step.to[1] - cy); path.push([cx, cy]); }
      if (u) { u.px = step.from[0] * 24; u.py = step.from[1] * 24; }
      step._movers = u ? [{ unit: u, path, segIdx: 0, segMs: 0, stepMs: 135 }] : [];
      step._pauseLeft = step.pauseMs ?? 200;
      return;
    }

    if (step.kind === 'escortRetreat') {
      step._movers = (step.units || []).map(spec => {
        const u = this.spawnStageUnit(spec.type, spec.playerSelector, spec.from[0], spec.from[1], { tempEscort: true, role: spec.role });
        const path = [[spec.from[0], spec.from[1]]];
        let cx = spec.from[0];
        let cy = spec.from[1];
        while (cy !== spec.to[1]) { cy += Math.sign(spec.to[1] - cy); path.push([cx, cy]); }
        while (cx !== spec.to[0]) { cx += Math.sign(spec.to[0] - cx); path.push([cx, cy]); }
        if (u) { u.px = spec.from[0] * 24; u.py = spec.from[1] * 24; }
        return { unit: u, path, segIdx: 0, segMs: 0, stepMs: 135, removeOnArrive: spec.to[1] <= 0 };
      }).filter(item => item.unit);
      step._pauseLeft = step.pauseMs ?? 300;
      return;
    }

    if (step.kind === 'fx') {
      if (step.sfx) this.sfx(step.sfx);
      this.cursor = { x: step.target[0], y: step.target[1] };
      this.spawnMapEffect(step.sprite, step.target[0], step.target[1], step.pauseMs ?? 450, 70);
      step._pauseLeft = step.pauseMs ?? 450;
      return;
    }

    if (step.kind === 'fxBurst') {
      if (step.sfx) this.sfx(step.sfx);
      this.cursor = { x: step.target[0], y: step.target[1] };
      for (const sp of (step.sprites || [])) {
        this.spawnMapEffect(sp, step.target[0], step.target[1], step.pauseMs ?? 500, 75);
      }
      if (step.removeUnitAt) {
        const target = this.unitAt(step.removeUnitAt[0], step.removeUnitAt[1]);
        if (target) target.action = 4;
      }
      if (step.clearTempEscorts) {
        this.units = this.units.filter(u => !u.tempEscort);
      }
      step._pauseLeft = step.pauseMs ?? 500;
      return;
    }

    if (step.kind === 'dialog') {
      if (step.focus) {
        this.cursor = { x: step.focus[0], y: step.focus[1] };
        this.centerCameraOn(step.focus[0], step.focus[1]);
      }
      st.dialog = {
        portrait: step.portrait ?? -1,
        speaker: SPEAKER_NAMES[String(step.portrait)] ?? 'STORY',
        text: this.assets.langStrings?.[step.langIdx] || '',
      };
      return;
    }

    this.advanceScriptStep();
  }

  tickScript(dtMs = 50) {
    const st = this.scriptState;
    if (!st || !st.active) return;
    const step = st.active;
    if (st.dialog) return;

    if (step.kind === 'pan' || step.kind === 'focusHero') {
      const { cx, cy } = step._targetCam;
      const dx = cx - this.cameraX;
      const dy = cy - this.cameraY;
      if (Math.abs(dx) > 1.2 || Math.abs(dy) > 1.2) {
        const blend = 1 - Math.exp((-10 * dtMs) / 1000);
        this.cameraX += dx * blend;
        this.cameraY += dy * blend;
      } else {
        this.cameraX = cx;
        this.cameraY = cy;
        step._pauseLeft -= dtMs;
        if (step._pauseLeft <= 0) this.advanceScriptStep();
      }
      return;
    }

    if (step.kind === 'moveGroup' || step.kind === 'spawnMove' || step.kind === 'escortRetreat') {
      let allDone = true;
      for (const m of step._movers) {
        if (m.segIdx < m.path.length - 1) {
          allDone = false;
          m.segMs += dtMs;
          while (m.segMs >= m.stepMs && m.segIdx < m.path.length - 1) {
            m.segMs -= m.stepMs;
            m.segIdx++;
            const cur = m.path[m.segIdx];
            m.unit.x = cur[0];
            m.unit.y = cur[1];
            this.cursor = { x: cur[0], y: cur[1] };
            this.sfx('select');
          }
          if (m.segIdx >= m.path.length - 1) {
            const last = m.path[m.path.length - 1];
            m.unit.x = last[0];
            m.unit.y = last[1];
            m.unit.px = null;
            m.unit.py = null;
            if (m.removeOnArrive) m.unit.action = 4;
          } else {
            const a = m.path[m.segIdx];
            const b = m.path[m.segIdx + 1];
            const t = m.segMs / m.stepMs;
            m.unit.px = (a[0] + (b[0] - a[0]) * t) * 24;
            m.unit.py = (a[1] + (b[1] - a[1]) * t) * 24;
            const sKey = `${m.segIdx}:${t >= 0.45 ? 1 : 0}`;
            if (m._smokeKey !== sKey) {
              m._smokeKey = sKey;
              this.spawnStepSmoke(m.unit, b[0] - a[0], b[1] - a[1]);
            }
          }
        }
      }
      if (!allDone) {
        const lead = step._movers.find(m => m.unit.px != null);
        if (lead) this.smoothCameraToPixel(lead.unit.px + 12, lead.unit.py + 12, dtMs);
        return;
      }
      step._pauseLeft -= dtMs;
      if (step._pauseLeft <= 0) this.advanceScriptStep();
      return;
    }

    if (step.kind === 'fx' || step.kind === 'fxBurst') {
      step._pauseLeft -= dtMs;
      if (step._pauseLeft <= 0) this.advanceScriptStep();
    }
  }

  advanceScriptDialog(skipAll = false) {
    const st = this.scriptState;
    if (!st) return;
    if (skipAll) {
      this.fastFinishScript();
      return;
    }
    if (st.dialog) {
      st.dialog = null;
      this.advanceScriptStep();
      this.paint();
    } else {
      // Allow clicking/Enter during a walk/pan to snap immediately to next dialog or step
      const step = st.active;
      if (step?._movers) {
        for (const m of step._movers) {
          const last = m.path[m.path.length - 1];
          if (last) { m.unit.x = last[0]; m.unit.y = last[1]; }
          m.unit.px = null;
          m.unit.py = null;
          if (m.removeOnArrive) m.unit.action = 4;
        }
      }
      if (step?._targetCam) {
        this.cameraX = step._targetCam.cx;
        this.cameraY = step._targetCam.cy;
      }
      this.advanceScriptStep();
      this.paint();
    }
  }

  fastFinishScript() {
    const st = this.scriptState;
    if (!st) return;
    for (let i = Math.max(0, st.index); i < st.steps.length; i++) {
      const s = st.steps[i];
      if (s.kind === 'moveGroup') {
        for (const m of (s.moves || [])) {
          const u = this.unitAt(m.from[0], m.from[1]);
          if (u) { u.x = m.to[0]; u.y = m.to[1]; u.px = null; u.py = null; }
        }
      } else if (s.kind === 'spawnMove') {
        const existing = this.unitAt(s.to[0], s.to[1]) || this.unitAt(s.from[0], s.from[1]);
        if (existing) { existing.x = s.to[0]; existing.y = s.to[1]; existing.px = null; existing.py = null; }
        else this.spawnStageUnit(s.type, s.playerSelector, s.to[0], s.to[1]);
      } else if (s.kind === 'fxBurst') {
        if (s.removeUnitAt) {
          const target = this.unitAt(s.removeUnitAt[0], s.removeUnitAt[1]);
          if (target) target.action = 4;
        }
      }
    }
    this.units = this.units.filter(u => !u.tempEscort);
    for (const u of this.units) { u.px = null; u.py = null; }
    this.mapEffects = [];
    const fn = st.onDone;
    this.scriptState = null;
    this.state = 'play';
    fn?.();
    this.paint();
  }

  async loadAndStartMap(mapId, options = {}) {
    try {
      this.status.textContent = `LOADING ${mapId.toUpperCase()}...`;
      const decoded = decodeMap(await fetchBytes(`assets/${mapId}`), mapId);
      this.initMapState(decoded, mapId, options);
      this.status.textContent = `${mapId.toUpperCase()} · READY`;

      const meta = CAMPAIGN_STAGE_META[mapId];
      const stageScript = CAMPAIGN_STAGE_SCRIPTS[mapId]?.opening;
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
        if (meta && this.settings.showStory && (stageScript?.length || meta.openingDialogs?.length)) {
          this.stageBannerTitle = this.assets.langStrings?.[meta.titleIdx] || mapId.toUpperCase();
          this.stageBannerObjective = this.assets.langStrings?.[meta.objectiveIdx] || '';
          this.stageBannerPrompt = 'TAP OR ENTER TO BEGIN';
          this.stageBannerNext = () => {
            if (stageScript?.length) this.playStageScript(stageScript, startPlay);
            else this.playStoryDialogs(meta.openingDialogs, startPlay);
          };
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
    // Continuous native display refresh rate (60Hz / 120Hz+) delta-time simulation
    const dtMs = Math.min(40, Math.max(1, time - this.lastTick));
    this.lastTick = time;
    this.update(dtMs);
    this.paint();
    requestAnimationFrame(next => this.loop(next));
  }

  tick() {
    this.update(50);
  }

  update(dtMs) {
    this.animTickAcc += dtMs;
    while (this.animTickAcc >= 50) {
      this.animTick++;
      this.animTickAcc -= 50;
    }
    this.spriteAnimAcc += dtMs;
    while (this.spriteAnimAcc >= 300) {
      this.spriteAnimAcc -= 300;
      this.waterAnimFrame = (this.waterAnimFrame + 1) % 4;
      for (const u of this.units) {
        if (u.action !== 3 && u.action !== 4) u.frameIndex = (u.frameIndex + 1) % 2;
      }
    }
    if (this.state === 'splash' || this.state === 'menu') {
      const logoW = this.assets.images.logo?.naturalWidth || 238;
      this.glowX += (logoW * dtMs) / 420;
      if (this.glowX >= WIDTH * 2.8) this.glowX = -(this.assets.images.glow?.naturalWidth || 67);
      if (this.state === 'menu') this.mainRing?.tick(dtMs);
      return;
    }
    if (this.state === 'actionMenu') {
      this.actionRing?.tick(dtMs);
      return;
    }
    if (this.mapEffects.length > 0) {
      for (let i = this.mapEffects.length - 1; i >= 0; i--) {
        const fx = this.mapEffects[i];
        fx.remainingMs -= dtMs;
        fx.timer += dtMs;
        if (fx.px != null && fx.vx) fx.px += fx.vx * dtMs;
        if (fx.py != null && fx.vy) fx.py += fx.vy * dtMs;
        while (fx.timer >= fx.stepMs) {
          fx.timer -= fx.stepMs;
          fx.frame = Math.min(fx.maxFrames - 1, fx.frame + 1);
        }
        if (fx.remainingMs <= 0) this.mapEffects.splice(i, 1);
      }
    }
    if (this.floatTexts.length > 0) {
      for (let i = this.floatTexts.length - 1; i >= 0; i--) {
        const ft = this.floatTexts[i];
        ft.offsetY = (ft.offsetY ?? 0) + (9 * dtMs) / 1000;
        ft.timer -= dtMs;
        if (ft.timer <= 0) this.floatTexts.splice(i, 1);
      }
    }
    if (this.state === 'script') {
      this.tickScript(dtMs);
      return;
    }
    if (this.state === 'cutscene') {
      if (this.cutsceneScroll < this.cutsceneMaxScroll) {
        this.cutsceneScroll += (18 * dtMs) / 1000;
      }
      return;
    }
    if (this.state === 'stageBanner') {
      return;
    }
    if (this.state === 'battle' && this.battleScene) {
      this.battleScene.tick(dtMs);
      if (this.battleScene.finished) {
        this.finishBattleScene();
      }
      return;
    }
    if (this.state === 'moveAnim' && this.moveAnim) {
      const anim = this.moveAnim;
      anim.segProgressMs += dtMs;
      while (anim.segProgressMs >= anim.stepDurationMs && anim.segIndex < anim.path.length - 1) {
        anim.segProgressMs -= anim.stepDurationMs;
        anim.segIndex++;
        const stepped = anim.path[anim.segIndex];
        anim.unit.x = stepped[0];
        anim.unit.y = stepped[1];
        this.cursor = { x: stepped[0], y: stepped[1] };
        this.sfx('select');
      }
      if (anim.segIndex >= anim.path.length - 1) {
        const dest = anim.path[anim.path.length - 1];
        if (dest) {
          anim.unit.x = dest[0];
          anim.unit.y = dest[1];
          this.cursor = { x: dest[0], y: dest[1] };
        }
        anim.unit.px = null;
        anim.unit.py = null;
        this.moveAnim = null;
        this.state = 'play';
        anim.onDone?.();
        return;
      }
      const a = anim.path[anim.segIndex];
      const b = anim.path[anim.segIndex + 1];
      const frac = anim.segProgressMs / anim.stepDurationMs;
      anim.unit.px = (a[0] + (b[0] - a[0]) * frac) * 24;
      anim.unit.py = (a[1] + (b[1] - a[1]) * frac) * 24;
      const smokeKey = `${anim.segIndex}:${frac >= 0.45 ? 1 : 0}`;
      if (anim.lastSmokeKey !== smokeKey) {
        anim.lastSmokeKey = smokeKey;
        this.spawnStepSmoke(anim.unit, b[0] - a[0], b[1] - a[1]);
      }
      this.smoothCameraToPixel(anim.unit.px + 12, anim.unit.py + 12, dtMs);
      return;
    }
    if (this.state === 'dialog' && this.dialogTimer > 0) {
      this.dialogTimer -= dtMs;
      if (this.dialogTimer <= 0) this.state = 'play';
    }
    if (this.state === 'play' && this.aiPending) {
      if (this.aiTask) {
        this.tickAiTask(dtMs);
      } else {
        this.aiTimer -= dtMs;
        if (this.aiTimer <= 0) this.startNextAiUnit();
      }
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
    // Port of i.java:33, 946-952, 1589-1680: authentic menu_icons indices on circular wheel
    return [
      { id: 'newGame', label: this.assets.langStrings?.[2] || 'NEW GAME', icon: 1 },
      { id: 'load', label: this.assets.langStrings?.[5] || 'LOAD GAME', icon: 2 },
      { id: 'selectLevel', label: this.assets.langStrings?.[3] || 'SELECT LEVEL', icon: 3 },
      { id: 'skirmish', label: this.assets.langStrings?.[6] || 'SKIRMISH', icon: 4 },
      { id: 'settings', label: this.assets.langStrings?.[8] || 'SETTINGS', icon: 5 },
      { id: 'instructions', label: this.assets.langStrings?.[9] || 'INSTRUCTIONS', icon: 7 },
      { id: 'about', label: this.assets.langStrings?.[10] || 'ABOUT', icon: 8 },
    ];
  }

  confirmMainMenuOption(idx) {
    this.menuCursor = idx;
    if (idx === 0) this.startCampaign();
    else if (idx === 1) this.loadSavedGame();
    else if (idx === 2) this.openMenu('levelSelect', 'menu');
    else if (idx === 3) this.openMenu('skirmishSetup', 'menu');
    else if (idx === 4) { this.settingsCursor = 0; this.openMenu('settings', 'menu'); }
    else if (idx === 5) { this.helpScroll = 0; this.openMenu('instructions', 'menu'); }
    else { this.aboutScroll = 0; this.openMenu('about', 'menu'); }
  }

  pointer(x, y) {
    if (this.state === 'splash') { this.sfx('select'); this.openMenu('menu'); return; }
    if (this.state === 'menu') {
      if (!this.mainRing) this.initMainRing();
      const hit = this.mainRing.hitTest(x, y);
      if (hit?.type === 'confirm') {
        this.sfx('select');
        this.confirmMainMenuOption(hit.index);
      } else if (hit?.type === 'select') {
        this.sfx('select');
        this.mainRing.selectIndex(hit.index);
        this.menuCursor = this.mainRing.selectedIndex;
        this.paint();
      } else if (hit?.type === 'prev') {
        this.sfx('select');
        this.mainRing.move(-1);
        this.menuCursor = this.mainRing.selectedIndex;
        this.paint();
      } else if (hit?.type === 'next') {
        this.sfx('select');
        this.mainRing.move(1);
        this.menuCursor = this.mainRing.selectedIndex;
        this.paint();
      } else if (y >= HEIGHT - 28 && x <= 74) {
        this.sfx('select');
        this.confirmMainMenuOption(this.mainRing.selectedIndex);
      }
      return;
    }
    if (this.state === 'about') {
      this.openMenu('menu');
      return;
    }
    if (this.state === 'cutscene') {
      if (y >= HEIGHT - 26 && x >= WIDTH - 88) this.advanceCutscene(true);
      else this.advanceCutscene(false);
      return;
    }
    if (this.state === 'script') {
      if (this.scriptState?.dialog && x >= WIDTH - 90 && y >= HEIGHT - 84 && y <= HEIGHT - 50) {
        this.advanceScriptDialog(true);
      } else {
        this.advanceScriptDialog(false);
      }
      return;
    }
    if (this.state === 'stageBanner') {
      const fn = this.stageBannerNext;
      this.stageBannerNext = null;
      fn?.();
      return;
    }
    if (this.state === 'storyDialog') {
      if (x >= WIDTH - 90 && y >= HEIGHT - 84 && y <= HEIGHT - 50) this.advanceStoryDialog(true);
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
      if (y >= HEIGHT - 28) {
        if (x < WIDTH / 2) this.startConfiguredSkirmish();
        else this.openMenu('menu');
        return;
      }
      const maxRows = 2 + this.getSkirmishPlayerCount();
      const row = Math.floor((y - 59) / 26);
      if (row >= 0 && row < maxRows) {
        this.skirmishCursor = row;
        this.adjustSkirmishOption(row, x >= WIDTH / 2 ? 1 : -1);
      } else if (row === maxRows) {
        this.startConfiguredSkirmish();
      }
      return;
    }
    if (this.state === 'settings') {
      if (y >= HEIGHT - 28) {
        this.saveSettings();
        this.state = this.subMenuReturnState;
        this.paint();
        return;
      }
      const row = Math.floor((y - 59) / 28);
      if (row >= 0 && row < 3) {
        this.settingsCursor = row;
        this.toggleSettingOption(row);
      }
      return;
    }
    if (this.state === 'instructions') {
      if (y >= HEIGHT - 28) {
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
      if (y >= HEIGHT - 28) {
        if (x < WIDTH / 2) this.loadAndStartMap(this.mapList[this.mapIndex], { includeIntro: false });
        else this.openMenu('menu');
        return;
      }
      const start = this.getLevelSelectStart();
      if (y >= 40 && y <= 56) {
        this.mapIndex = Math.max(0, this.mapIndex - 1);
        this.paint();
        return;
      }
      if (y >= 237 && y < HEIGHT - 28) {
        this.mapIndex = Math.min(this.mapList.length - 1, this.mapIndex + 1);
        this.paint();
        return;
      }
      const row = Math.floor((y - 57) / 20);
      if (row >= 0 && row < 9 && start + row < this.mapList.length) {
        const idx = start + row;
        if (idx === this.mapIndex) this.loadAndStartMap(this.mapList[idx], { includeIntro: false });
        else { this.mapIndex = idx; this.paint(); }
      }
      return;
    }
    if (this.state === 'pauseMenu') {
      if (y >= HEIGHT - 28) {
        if (x < WIDTH / 2) this.confirmPauseOption(this.pauseCursor);
        else { this.state = 'play'; this.paint(); }
        return;
      }
      const opts = this.getPauseOptions();
      const idx = Math.floor((y - 68) / 22);
      if (x >= 20 && x <= 220 && idx >= 0 && idx < opts.length) {
        this.pauseCursor = idx;
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
      if (y >= HEIGHT - 49 && x >= WIDTH - 68) { this.confirmTargetSelection(); return; }
      if (y >= HEIGHT - 49 && x <= 58) { this.backFromTargetSelect(); return; }
      if (y < HEIGHT - 32) {
        const { offsetX, offsetY } = this.getBoardGeometry();
        const tileX = Math.floor((x - offsetX + this.cameraX) / 24);
        const tileY = Math.floor((y - offsetY + this.cameraY) / 24);
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
      if (this.actionRing) {
        const hit = this.actionRing.hitTest(x, y);
        if (hit?.type === 'confirm') {
          this.actionCursor = hit.index;
          this.confirmActionOption(hit.index);
          return;
        }
        if (hit?.type === 'select') {
          this.sfx('select');
          this.actionRing.selectIndex(hit.index);
          this.actionCursor = this.actionRing.selectedIndex;
          this.paint();
          return;
        }
        if (hit?.type === 'prev' || hit?.type === 'next') {
          this.sfx('select');
          this.actionRing.move(hit.type === 'prev' ? -1 : 1);
          this.actionCursor = this.actionRing.selectedIndex;
          this.paint();
          return;
        }
      }
      this.cancelSelection();
      return;
    }
    if (this.state === 'recruitMenu') {
      const { list, slotSpacing, baseCx, baseCy, visibleSlots } = this.getRecruitPanelLayout();
      if (y >= HEIGHT - 28) {
        if (x < WIDTH / 2) this.confirmRecruit(this.recruitCursor);
        else { this.state = 'play'; this.recruitCastle = null; this.paint(); }
        return;
      }
      if (y >= 228 && y <= 288) {
        if (x <= 32) {
          this.recruitCursor = (this.recruitCursor + list.length - 1) % list.length;
          this.paint();
          return;
        }
        if (x >= WIDTH - 32) {
          this.recruitCursor = (this.recruitCursor + 1) % list.length;
          this.paint();
          return;
        }
        const half = Math.floor(visibleSlots / 2);
        const slotOff = Math.round((x - baseCx) / slotSpacing);
        if (Math.abs(y - baseCy) <= 24 && Math.abs(slotOff) <= half) {
          const idx = (this.recruitCursor + slotOff + list.length) % list.length;
          if (slotOff === 0) this.confirmRecruit(idx);
          else { this.recruitCursor = idx; this.paint(); }
          return;
        }
      }
      if (y < 228 && x >= 170) {
        this.confirmRecruit(this.recruitCursor);
        return;
      }
      this.state = 'play';
      this.recruitCastle = null;
      this.paint();
      return;
    }
    if (this.state !== 'play') return;

    // Corner softkeys above 32px bottom HUD (`END TURN` right & `MENU` left)
    if (y >= HEIGHT - 49 && y <= HEIGHT - 32) {
      if (x >= WIDTH - 68) { this.endTurn(); return; }
      if (x <= 56) {
        this.persistState();
        this.pauseCursor = 0;
        this.state = 'pauseMenu';
        this.paint();
        return;
      }
    }
    if (y >= HEIGHT - 32) {
      if (x <= 56) {
        this.persistState();
        this.pauseCursor = 0;
        this.state = 'pauseMenu';
        this.paint();
      }
      return;
    }
    const { offsetX, offsetY } = this.getBoardGeometry();
    const tileX = Math.floor((x - offsetX + this.cameraX) / 24);
    const tileY = Math.floor((y - offsetY + this.cameraY) / 24);
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
    if (this.state === 'splash') { this.sfx('select'); this.openMenu('menu'); return; }
    if (this.state === 'about') {
      if (code === 'Escape' || code === 'Enter' || code === 'Space') this.openMenu('menu');
      return;
    }
    if (this.state === 'cutscene') {
      if (code === 'Escape') this.advanceCutscene(true);
      else if (code === 'Enter' || code === 'Space' || code === 'Digit5') this.advanceCutscene(false);
      return;
    }
    if (this.state === 'script') {
      if (code === 'Escape') this.advanceScriptDialog(true);
      else if (code === 'Enter' || code === 'Space' || code === 'Digit5') this.advanceScriptDialog(false);
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
      if (!this.mainRing) this.initMainRing();
      const total = this.mainRing.items.length;
      if (code === 'ArrowUp' || code === 'KeyW' || code === 'ArrowLeft' || code === 'KeyA' || code === 'Digit4' || code === 'Digit8') {
        this.sfx('select');
        this.mainRing.move(-1);
        this.menuCursor = this.mainRing.selectedIndex;
      } else if (code === 'ArrowDown' || code === 'KeyS' || code === 'ArrowRight' || code === 'KeyD' || code === 'Digit6' || code === 'Digit2') {
        this.sfx('select');
        this.mainRing.move(1);
        this.menuCursor = this.mainRing.selectedIndex;
      } else if (code === 'Enter' || code === 'Space' || code === 'Digit5') {
        this.sfx('select');
        this.confirmMainMenuOption(this.mainRing.selectedIndex);
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
      if (!this.actionRing) return;
      if (code === 'ArrowUp' || code === 'KeyW' || code === 'ArrowLeft' || code === 'KeyA' || code === 'Digit4' || code === 'Digit8') {
        this.sfx('select');
        this.actionRing.move(-1);
        this.actionCursor = this.actionRing.selectedIndex;
      } else if (code === 'ArrowDown' || code === 'KeyS' || code === 'ArrowRight' || code === 'KeyD' || code === 'Digit6' || code === 'Digit2') {
        this.sfx('select');
        this.actionRing.move(1);
        this.actionCursor = this.actionRing.selectedIndex;
      } else if (code === 'Enter' || code === 'Space' || code === 'Digit5') {
        this.confirmActionOption(this.actionRing.selectedIndex);
        return;
      } else if (code === 'Escape' || code === 'KeyQ') {
        this.cancelSelection();
        return;
      }
      this.paint();
      return;
    }
    if (this.state === 'recruitMenu') {
      const len = this.getRecruitList().length;
      if (code === 'ArrowLeft' || code === 'KeyA' || code === 'ArrowUp' || code === 'KeyW') this.recruitCursor = (this.recruitCursor + len - 1) % len;
      else if (code === 'ArrowRight' || code === 'KeyD' || code === 'ArrowDown' || code === 'KeyS') this.recruitCursor = (this.recruitCursor + 1) % len;
      else if (code === 'Enter' || code === 'Space' || code === 'Digit5') this.confirmRecruit(this.recruitCursor);
      else if (code === 'Escape' || code === 'KeyQ') { this.state = 'play'; this.recruitCastle = null; }
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
    const boardH = HEIGHT - 32;
    const maxCamX = Math.max(0, this.assets.map.width * 24 - WIDTH);
    const maxCamY = Math.max(0, this.assets.map.height * 24 - boardH);
    this.cameraX = Math.max(0, Math.min(maxCamX, tx * 24 - (WIDTH >> 1) + 12));
    this.cameraY = Math.max(0, Math.min(maxCamY, ty * 24 - (boardH >> 1) + 12));
  }

  smoothCameraToPixel(px, py, dtMs) {
    const boardH = HEIGHT - 32;
    const maxCamX = Math.max(0, this.assets.map.width * 24 - WIDTH);
    const maxCamY = Math.max(0, this.assets.map.height * 24 - boardH);
    const targetX = Math.max(0, Math.min(maxCamX, px - (WIDTH >> 1)));
    const targetY = Math.max(0, Math.min(maxCamY, py - (boardH >> 1)));
    const blend = 1 - Math.exp((-12 * dtMs) / 1000);
    this.cameraX += (targetX - this.cameraX) * blend;
    this.cameraY += (targetY - this.cameraY) * blend;
  }

  startUnitMoveAnim(unit, path, onDone, stepDurationMs = 95) {
    if (!unit || !path || path.length <= 1) {
      if (path?.length === 1 && unit) { unit.x = path[0][0]; unit.y = path[0][1]; }
      if (unit) { unit.px = null; unit.py = null; }
      onDone?.();
      return;
    }
    this.moveAnim = {
      unit,
      path,
      segIndex: 0,
      segProgressMs: 0,
      stepDurationMs,
      onDone,
    };
    unit.px = path[0][0] * 24;
    unit.py = path[0][1] * 24;
    this.state = 'moveAnim';
    this.paint();
  }

  cancelSelection() {
    if (this.selected && this.moveOrigin) {
      this.selected.x = this.moveOrigin.x;
      this.selected.y = this.moveOrigin.y;
      this.selected.px = null;
      this.selected.py = null;
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
      // Smooth pixel step-by-step walk along traceRoute to reachable destination
      if (this.reachable?.costs.has(`${x},${y}`)) {
        const path = traceRoute(this.reachable, this.selected.x, this.selected.y, x, y);
        const unit = this.selected;
        unit.movedThisTurn = true;
        this.previewPath = null;
        this.startUnitMoveAnim(unit, path, () => this.openActionMenu(unit), 95);
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
      opts.push({ kind: 'attack', icon: 3, label: this.assets.langStrings?.[62] || 'ATTACK', targets });
    }
    const townTargets = this.targetableTownsFor(unit);
    if (townTargets.length > 0) {
      opts.push({ kind: 'destroyTown', icon: 7, label: 'BOMBARD', targets: townTargets });
    }
    const myPal = this.playerPalette[unit.playerSelector] ?? unit.playerSelector;
    const tileAct = getTileActionForUnit(unit, this.rawTile(unit.x, unit.y), this.tileProperty(unit.x, unit.y), myPal);
    if (tileAct === 'capture') opts.push({ kind: 'capture', icon: 1, label: this.assets.langStrings?.[67] || 'OCCUPY' });
    else if (tileAct === 'repair') opts.push({ kind: 'repair', icon: 2, label: this.assets.langStrings?.[68] || 'REPAIR' });

    // Sorceress (type 3) can raise Skeleton from adjacent tombstone (`action_icons[4]` Raise)
    if (unit.type === 3) {
      const tombs = this.units.filter(
        u => u.action === 3 && u.type !== 9 && u.x >= 0 && u.y >= 0 && Math.abs(u.x - unit.x) + Math.abs(u.y - unit.y) === 1 && !this.unitAt(u.x, u.y)
      );
      if (tombs.length > 0) opts.push({ kind: 'raise', icon: 4, label: this.assets.langStrings?.[69] || 'RAISE', tombs });
    }

    opts.push({ kind: 'wait', icon: 6, label: this.assets.langStrings?.[64] || 'END MOVE' });
    opts.push({ kind: 'cancel', icon: 5, label: this.assets.langStrings?.[65] || 'CANCEL' });
    this.actionOptions = opts;
    this.actionCursor = 0;
    this.attackTargets = [...targets, ...townTargets];

    // Port of i.java:974-978 & d.java:509-514: 4-slot 90deg corner quadrant ring anchored away from unit
    const boardH = HEIGHT - 32;
    const upperHalf = this.cursor.y * 24 <= (boardH >> 1) - 24;
    this.actionRing = new RingMenu({
      items: opts,
      minSlots: 4,
      selectedIndex: 0,
      centerX: upperHalf ? 56 : 184,
      centerY: upperHalf ? 230 : 78,
      radius: 36,
      circleSprite: 'big_circle',
      iconSprite: 'action_icons',
      maxW: WIDTH,
      maxH: boardH,
      titleX: upperHalf ? 4 : 118,
      titleW: 118,
      titleY: upperHalf ? 156 : 4,
      showTitleArrows: false,
    });
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
    const boardH = HEIGHT - 32;
    if (direction === 0) this.cameraX = Math.min(Math.max(0, this.assets.map.width * 24 - WIDTH), this.cameraX + 24);
    else if (direction === 1) this.cameraY = Math.min(Math.max(0, this.assets.map.height * 24 - boardH), this.cameraY + 24);
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
      if (this.settings.showStory && CAMPAIGN_STAGE_SCRIPTS.m2?.turn2) {
        this.triggeredTurnDialogs.add(roundNum);
        this.playStageScript(CAMPAIGN_STAGE_SCRIPTS.m2.turn2, () => {
          this.showToast(`PLAYER ${this.playerIndex + 1} TURN (+${res.income}G)`, 900);
          this.paint();
        });
        return;
      }
    }

    if (this.playerModes[this.playerIndex] === 0) {
      this.aiPending = true;
      this.aiTask = null;
      this.aiTimer = 280;
      this.status.textContent = `P${this.playerIndex + 1} CPU · +${res.income}G`;
    } else {
      this.aiPending = false;
      this.aiTask = null;
      const hero = this.units.find(u => u.playerSelector === 1 + this.playerIndex && u.type === 9 && u.action !== 3 && u.action !== 4 && u.hp > 0)
        || this.units.find(u => u.playerSelector === 1 + this.playerIndex && u.action !== 3 && u.action !== 4 && u.hp > 0);
      if (hero) {
        this.cursor = { x: hero.x, y: hero.y };
        this.centerCameraOn(hero.x, hero.y);
      }
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
      if (this.state !== 'storyDialog' && this.state !== 'script') {
        this.showToast(`PLAYER ${this.playerIndex + 1} TURN (+${res.income}G)`, 900);
      }
    }
    this.paint();
  }

  runAiStep() {
    this.startNextAiUnit();
  }

  tickAiTask(dtMs) {
    const task = this.aiTask;
    if (!task) return;
    if (task.phase === 'focus' && task.unit) {
      this.smoothCameraToPixel(task.unit.x * 24 + 12, task.unit.y * 24 + 12, dtMs);
      task.timerMs -= dtMs;
      if (task.timerMs <= 0) {
        this.aiTask = null;
        this.startUnitMoveAnim(task.unit, task.path, () => this.finishAiUnitMove(task.unit, task.act), 100);
      }
    } else if (task.phase === 'aiming' && task.target) {
      this.smoothCameraToPixel(task.target.x * 24 + 12, task.target.y * 24 + 12, dtMs);
      task.timerMs -= dtMs;
      if (task.timerMs <= 0) {
        this.aiTask = null;
        this.performAttack(task.unit, task.target, () => this.afterAiCombat(task.unit));
      }
    } else if (task.phase === 'postAction') {
      task.timerMs -= dtMs;
      if (task.timerMs <= 0) {
        this.aiTask = null;
        this.startNextAiUnit();
      }
    } else if (task.phase === 'endTurn') {
      task.timerMs -= dtMs;
      if (task.timerMs <= 0) {
        this.aiTask = null;
        this.aiPending = false;
        this.endTurn();
      }
    }
  }

  startNextAiUnit() {
    if (this.state !== 'play' || !this.aiPending) return;
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
      const reach = this.showRange(idleUnit);
      const path = (act.x === idleUnit.x && act.y === idleUnit.y)
        ? [[idleUnit.x, idleUnit.y]]
        : (traceRoute(reach, idleUnit.x, idleUnit.y, act.x, act.y) || [[idleUnit.x, idleUnit.y], [act.x, act.y]]);
      this.cursor = { x: idleUnit.x, y: idleUnit.y };
      this.aiTask = { phase: 'focus', unit: idleUnit, act, path, timerMs: 220 };
      this.paint();
      return;
    }

    // AI Castle Recruitment (i.java:3774-3850) — visible camera focus & spark feedback
    const gold = this.balances[this.playerIndex] ?? 0;
    const fallenKing = this.getFallenKingFor(mySelector);
    let recruitedAt = null;
    if (gold >= 150) {
      for (let x = 0; x < this.assets.map.width; x++) {
        for (let y = 0; y < this.assets.map.height; y++) {
          if (this.tileProperty(x, y) === 9 && this.isPropertyOwnedBy(x, y, this.playerIndex) && !this.unitAt(x, y)) {
            if (fallenKing && gold >= (fallenKing.reviveCost ?? 200)) {
              this.balances[this.playerIndex] -= (fallenKing.reviveCost ?? 200);
              fallenKing.x = x;
              fallenKing.y = y;
              fallenKing.px = null;
              fallenKing.py = null;
              fallenKing.hp = 100;
              fallenKing.action = 1;
              fallenKing.status = 0;
              fallenKing.movedThisTurn = false;
              fallenKing.palette = myPal;
              recruitedAt = [x, y];
              break;
            }
            const pickType = gold >= 450 ? 3 : gold >= 250 ? 1 : 0;
            const rec = this.assets.unitRecords[pickType];
            if (rec && (this.balances[this.playerIndex] ?? 0) >= rec.shortValue) {
              this.balances[this.playerIndex] -= rec.shortValue;
              this.spawnStageUnit(pickType, mySelector, x, y, { action: 1 });
              recruitedAt = [x, y];
              break;
            }
          }
        }
        if (recruitedAt) break;
      }
    }

    if (recruitedAt) {
      this.cursor = { x: recruitedAt[0], y: recruitedAt[1] };
      this.centerCameraOn(recruitedAt[0], recruitedAt[1]);
      this.spawnMapEffect('spark', recruitedAt[0], recruitedAt[1], 360, 70);
      this.sfx('recruit');
      this.aiTask = { phase: 'endTurn', timerMs: 320 };
      this.paint();
      return;
    }

    this.aiTask = null;
    this.aiPending = false;
    this.endTurn();
  }

  finishAiUnitMove(unit, act) {
    const mySelector = 1 + this.playerIndex;
    const myPal = this.playerPalette[mySelector] ?? mySelector;
    unit.x = act.x;
    unit.y = act.y;
    unit.px = null;
    unit.py = null;
    this.cursor = { x: act.x, y: act.y };

    if (act.kind === 'attack') {
      const target = this.units.find(u => u.id === act.targetId);
      if (target && target.hp > 0) {
        this.cursor = { x: target.x, y: target.y };
        this.aiTask = { phase: 'aiming', unit, act, target, timerMs: 220 };
        this.paint();
        return;
      }
    }

    if (act.kind === 'capture' || act.kind === 'repair') {
      this.assets.map.tiles[act.x][act.y] = encodeBuildingTile(this.rawTile(act.x, act.y), myPal);
      this.sfx('capture');
      this.floatTexts.push({ x: act.x, y: act.y, text: act.kind === 'capture' ? 'OCCUPIED!' : 'REPAIRED!', color: '#ff8a8a', offsetY: 0, timer: 900 });
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
        this.spawnMapEffect('spark', tomb.x, tomb.y, 400, 70);
        this.sfx('raise');
      }
    }

    unit.action = 1;
    this.centerCameraOn(unit.x, unit.y);
    this.checkMatchOutcome();
    if (this.state === 'victory' || this.state === 'defeat' || this.state === 'script' || this.state === 'storyDialog') {
      this.aiTask = null;
      return;
    }
    this.aiTask = { phase: 'postAction', timerMs: 220 };
    this.paint();
  }

  afterAiCombat(unit) {
    if (this.state === 'dialog') this.state = 'play';
    this.centerCameraOn(unit.x, unit.y);
    if (this.state === 'victory' || this.state === 'defeat' || this.state === 'script' || this.state === 'storyDialog') {
      this.aiTask = null;
      return;
    }
    this.aiTask = { phase: 'postAction', timerMs: 240 };
    this.paint();
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
      this.aiTask = null;
      this.sfx('defeat');
      this.state = 'defeat';
      this.status.textContent = 'DEFEAT!';
      return;
    }

    // Port of i.java:5044-5085: M0 Temple Raiders Wave 2 reinforcement ambush once initial raiders fall.
    if (this.currentMapId === 'm0' && this.settings.showStory && !this.m0Reinforced && !this.hasLivingUnit(2)) {
      this.m0Reinforced = true;
      this.aiPending = false;
      this.aiTask = null;
      this.playStageScript(CAMPAIGN_STAGE_SCRIPTS.m0.wave2, () => {
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
      this.aiTask = null;
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

  drawCursorTile(ctx, dx = 2, dy = 2) {
    const rawTile = this.rawTile(this.cursor.x, this.cursor.y);
    if (rawTile >= 37) {
      const enc = rawTile - 37;
      const pal = Math.floor(enc / 2);
      const bImg = this.assets.buildingPaletteImages?.[pal] ?? this.assets.images.buildings;
      if (bImg) drawRegionMIDP(ctx, bImg, (enc % 2) * 24, 0, 24, 24, 0, dx, dy, MIDP.LEFT | MIDP.TOP);
    } else {
      const meta = this.assets.sprites.tiles0;
      const frame = meta?.frames?.[rawTile];
      const tileImg = frame ? this.assets.frameImages.tiles0?.[frame.sourceFrame] : null;
      if (tileImg) {
        drawRegionMIDP(ctx, tileImg, 0, 0, meta.frameWidth, meta.frameHeight, frame.transform ?? 0, dx, dy, MIDP.LEFT | MIDP.TOP);
      }
    }
  }

  renderTargetForecast(ctx) {
    const attacker = this.selected;
    const target = this.targetCandidates[this.targetCursor];
    if (!attacker || !target) return;
    const isAttack = this.targetKind === 'attack';
    const boardH = HEIGHT - 32;
    const barY = (this.cursor.y * 24 - this.cameraY <= (boardH >> 1) - 24) ? boardH - 26 : 0;

    if (!isAttack) {
      drawTargetForecastBar(ctx, this.assets, {
        width: WIDTH,
        barY,
        kind: this.targetKind,
        attackerName: this.unitName(attacker.type, attacker.level),
        targetName: `${target.x},${target.y}`,
      });
      return;
    }

    const aProp = this.tileProperty(attacker.x, attacker.y) ?? 0;
    const dProp = this.tileProperty(target.x, target.y) ?? 0;
    const aMod = attackModifierFor(attacker, target, attacker.x, attacker.y, aProp, this.rawTile(attacker.x, attacker.y));
    const aDef = defenseModifierFor(attacker, attacker.x, attacker.y, aProp, this.rawTile(attacker.x, attacker.y));
    const dDef = defenseModifierFor(target, target.x, target.y, dProp, this.rawTile(target.x, target.y));
    const dist = Math.abs(attacker.x - target.x) + Math.abs(attacker.y - target.y);
    const canCounter = dist >= (target.attackRangeMin ?? 1) && dist <= (target.attackRangeMax ?? 1);
    const cMod = canCounter
      ? attackModifierFor(target, attacker, target.x, target.y, dProp, this.rawTile(target.x, target.y))
      : 0;

    drawTargetForecastBar(ctx, this.assets, {
      width: WIDTH,
      barY,
      kind: 'attack',
      attackerName: this.unitName(attacker.type, attacker.level),
      targetName: this.unitName(target.type, target.level),
      attackerPalette: attacker.palette ?? 1,
      targetPalette: target.palette ?? 2,
      atkRangeText: `${attacker.atkMin + aMod}-${attacker.atkMax + aMod}`,
      defCounterText: canCounter ? `${target.atkMin + cMod}-${target.atkMax + cMod}` : '0-0',
      atkMod: aMod,
      defCounterMod: canCounter ? cMod : 0,
      attackerDef: attacker.defense + aDef,
      targetDef: target.defense + dDef,
      atkDefMod: aDef,
      defDefMod: dDef,
      attackerHp: attacker.hp,
      targetHp: target.hp,
    });
  }

  paintTitleBackdrop(ctx) {
    // Port of i.java:3296-3303: draw logo -> sweeping glow -> splash cutout mask on top
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    const logo = this.assets.images.logo;
    if (logo) {
      const lx = (WIDTH - (logo.naturalWidth || 238)) >> 1;
      const lw = logo.naturalWidth || 238;
      const lh = logo.naturalHeight || 85;
      ctx.save();
      ctx.beginPath();
      ctx.rect(lx, 0, lw, lh);
      ctx.clip();
      ctx.drawImage(logo, lx, 0);
      const glow = this.assets.images.glow;
      if (glow && this.glowX < lw) {
        ctx.drawImage(glow, lx + Math.round(this.glowX), 4);
      }
      ctx.restore();
    }
    drawImageAt(ctx, this.assets.images.splash, 0, 0, WIDTH, HEIGHT);
  }

  paint() {
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = UI_COLORS.titleBg;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    if (this.state === 'splash') {
      this.paintTitleBackdrop(ctx);
      if (Math.floor(this.animTick / 8) % 2 === 0) {
        drawOutlinedText(ctx, this.assets.langStrings?.[60] || 'PRESS ANY KEY', WIDTH >> 1, 240, {
          font: 'bold 11px Arial, sans-serif',
          color: '#ffffff',
        });
      }
      drawOutlinedText(ctx, this.assets.langStrings?.[22] || '©MACROSPACE LTD.', WIDTH >> 1, HEIGHT - 12, {
        font: 'bold 8px Arial, sans-serif',
        color: UI_COLORS.textMuted,
      });
      return;
    }

    if (this.state === 'cutscene') {
      const cur = this.cutsceneQueue[0] ?? { image: null, text: '' };
      this.cutsceneMaxScroll = renderCutsceneScreen(ctx, {
        assets: this.assets,
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
      this.paintTitleBackdrop(ctx);
      if (!this.mainRing) this.initMainRing();
      this.mainRing.render(ctx, this.assets);
      drawSoftkeyButton(ctx, this.assets, { x: 4, y: HEIGHT - 20, w: 68, h: 16, iconIdx: 0, label: 'SELECT' });
      return;
    }

    if (this.state === 'about') {
      this.paintTitleBackdrop(ctx);
      const box = drawMenuFrame(ctx, this.assets, 10, 22, WIDTH - 20, HEIGHT - 54, 0, 22);
      drawUiText(ctx, this.assets.langStrings?.[10] || 'ABOUT', box.ix + (box.iw >> 1), box.iy + 11, {
        font: 'bold 10px Arial, sans-serif',
        color: UI_COLORS.textActive,
        align: 'center',
      });
      if (this.assets.images.ms_logo) {
        drawImageAt(ctx, this.assets.images.ms_logo, WIDTH >> 1, box.iy + 72, 89, 88, MIDP.HCENTER | MIDP.VCENTER);
      }
      const aboutTxt = (this.assets.langStrings?.[16] || 'Ancient Empires II by Macrospace Ltd.').replace(/%U/g, '1.0');
      drawWrappedLines(ctx, aboutTxt, box.ix + 8, box.iy + 124, box.iw - 16, 13, 8, {
        font: '9px Arial, sans-serif',
        color: UI_COLORS.textActive,
      });
      drawSoftkeyButton(ctx, this.assets, { x: WIDTH - 74, y: HEIGHT - 24, w: 66, h: 16, iconIdx: 1, label: 'BACK', alignRight: true });
      return;
    }

    if (this.state === 'skirmishSetup') {
      this.paintTitleBackdrop(ctx);
      const mapId = SKIRMISH_MAPS[this.skirmishConfig.mapIdx] || 's0';
      const pCount = this.getSkirmishPlayerCount(mapId);
      const colors = ['BLUE', 'RED', 'GREEN', 'BLACK'];
      const items = [
        { label: 'MAP', value: `< ${this.mapLabel(mapId).slice(0, 14)} >` },
        { label: 'STARTING GOLD', value: `< ${this.skirmishConfig.gold} >` },
        ...Array.from({ length: pCount }, (_, i) => ({
          label: `P${i + 1} (${colors[i]})`,
          value: `< ${this.skirmishConfig.players[i] === 1 ? 'HUMAN' : 'CPU'} >`,
        })),
        { label: 'START BATTLE', value: '▶' },
      ];
      drawFramedListMenu(ctx, this.assets, {
        title: this.assets.langStrings?.[35] || 'SKIRMISH SETUP',
        items,
        selectedIndex: this.skirmishCursor,
        rowHeight: 26,
        maxVisible: 7,
        x: 10,
        y: 26,
        w: WIDTH - 20,
        h: HEIGHT - 58,
        leftButton: 'START',
        rightButton: 'BACK',
        width: WIDTH,
        height: HEIGHT,
      });
      return;
    }

    if (this.state === 'settings') {
      this.paintTitleBackdrop(ctx);
      const items = [
        { label: this.assets.langStrings?.[25] || 'Fight Animation', value: this.settings.fightAnimation ? 'ON' : 'OFF' },
        { label: this.assets.langStrings?.[28] || 'Sound', value: this.settings.sound ? 'ON' : 'OFF' },
        { label: 'Campaign Story', value: this.settings.showStory ? 'ON' : 'OFF' },
      ];
      drawFramedListMenu(ctx, this.assets, {
        title: this.assets.langStrings?.[8] || 'SETTINGS',
        items,
        selectedIndex: this.settingsCursor,
        rowHeight: 28,
        maxVisible: 5,
        x: 10,
        y: 26,
        w: WIDTH - 20,
        h: HEIGHT - 58,
        leftButton: 'CHANGE',
        rightButton: 'BACK',
        width: WIDTH,
        height: HEIGHT,
      });
      return;
    }

    if (this.state === 'instructions') {
      this.paintTitleBackdrop(ctx);
      const frame = drawMenuFrame(ctx, this.assets, 8, 16, WIDTH - 16, HEIGHT - 46, 0, 22);
      drawUiText(ctx, this.assets.langStrings?.[9] || 'INSTRUCTIONS', frame.ix + (frame.iw >> 1), frame.iy + 11, {
        font: 'bold 10px Arial, sans-serif',
        color: UI_COLORS.textActive,
        align: 'center',
      });
      const tips = [];
      for (let idx = 198; idx <= 214; idx++) {
        if (this.assets.langStrings?.[idx]) {
          const clean = this.assets.langStrings[idx].replace(/%KM/g, 'ARROWS').replace(/%K\d/g, 'ENTER');
          tips.push(`• ${clean}`);
        }
      }
      ctx.save();
      ctx.beginPath();
      ctx.rect(frame.ix + 4, frame.iy + 26, frame.iw - 8, frame.ih - 34);
      ctx.clip();
      const lines = wrapText(ctx, tips.join('\n'), frame.iw - 14);
      ctx.font = '9px Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = UI_COLORS.textActive;
      for (let i = 0; i < 16 && this.helpScroll + i < lines.length; i++) {
        ctx.fillText(lines[this.helpScroll + i], frame.ix + 6, frame.iy + 28 + i * 13);
      }
      ctx.restore();
      if (this.helpScroll > 0) drawSpriteFrame(ctx, this.assets, 'arrow', 0, frame.ix + (frame.iw >> 1), frame.iy + 26, MIDP.HCENTER | MIDP.VCENTER);
      if (this.helpScroll < Math.max(0, 80)) drawSpriteFrame(ctx, this.assets, 'arrow', 1, frame.ix + (frame.iw >> 1), frame.iy + frame.ih - 4, MIDP.HCENTER | MIDP.VCENTER);
      drawSoftkeyButton(ctx, this.assets, { x: WIDTH - 74, y: HEIGHT - 24, w: 66, h: 16, iconIdx: 1, label: 'BACK', alignRight: true });
      return;
    }

    if (this.state === 'levelSelect') {
      this.paintTitleBackdrop(ctx);
      const start = this.getLevelSelectStart();
      const items = this.mapList.map(id => this.mapLabel(id));
      drawFramedListMenu(ctx, this.assets, {
        title: `${this.assets.langStrings?.[3] || 'SELECT LEVEL'} (${this.mapIndex + 1}/${this.mapList.length})`,
        items,
        selectedIndex: this.mapIndex,
        scrollStart: start,
        maxVisible: 9,
        rowHeight: 20,
        x: 10,
        y: 24,
        w: WIDTH - 20,
        h: HEIGHT - 54,
        leftButton: 'PLAY',
        rightButton: 'BACK',
        width: WIDTH,
        height: HEIGHT,
      });
      return;
    }

    // Strategic map board (y = 0..288) matching original AE2 full viewport
    const { boardH, offsetX, offsetY } = this.getBoardGeometry();
    this.boardCtx.fillStyle = '#0e131a';
    this.boardCtx.fillRect(0, 0, WIDTH, boardH);
    this.boardCtx.save();
    this.boardCtx.translate(offsetX, offsetY);
    const cursorFrame = this.state === 'targetSelect'
      ? (2 + (Math.floor(this.animTick / 3) % 3))
      : (Math.floor(this.animTick / 4) % 2);
    const selBracket = (this.state === 'play' && this.selected)
      ? { x: this.selected.x, y: this.selected.y, frameIndex: 0 }
      : null;

    renderOriginalBoard(this.boardCtx, {
      map: this.assets.map,
      assets: this.assets,
      cameraX: this.cameraX,
      cameraY: this.cameraY,
      viewportWidth: WIDTH - offsetX * 2,
      viewportHeight: boardH - offsetY * 2,
      units: this.units,
      cursor: this.state === 'script'
        ? null
        : { ...this.cursor, frameIndex: cursorFrame },
      selectedCursor: selBracket,
      rangeCells: (this.state === 'play' || this.state === 'moveAnim') ? this.reachable?.cells : null,
      targetCells: (this.state === 'play' || this.state === 'targetSelect')
        ? (this.state === 'targetSelect' ? this.targetCandidates.map(t => [t.x, t.y]) : this.attackTargets.map(t => [t.x, t.y]))
        : null,
      path: this.state === 'play' ? this.previewPath : null,
      waterAnimFrame: this.waterAnimFrame,
      floatTexts: this.floatTexts,
      mapEffects: this.mapEffects,
    });
    this.boardCtx.restore();
    ctx.drawImage(this.boardCanvas, 0, 0);

    // Authentic 32px bottom HUD bar (y = 288..320, i.java:3496-3586)
    const hoverUnit = this.unitAt(this.cursor.x, this.cursor.y);
    const myUnitsCount = this.units.filter(
      u => u.playerSelector === 1 + this.playerIndex && u.action !== 3 && u.action !== 4 && u.hp > 0
    ).length;
    const curPal = this.playerPalette[1 + this.playerIndex] ?? (1 + this.playerIndex);
    const tileProp = this.tileProperty(this.cursor.x, this.cursor.y);
    const tileDef = [0, 5, 10, 10, 15, 0, 5, 15, 15, 15][tileProp ?? 0] ?? 0;

    drawMapHudBar(ctx, this.assets, {
      width: WIDTH,
      height: HEIGHT,
      hudHeight: 32,
      playerPalette: curPal,
      gold: this.balances[this.playerIndex] ?? 0,
      unitCount: myUnitsCount,
      tileDef,
      hoverUnit,
      unitName: hoverUnit ? this.unitName(hoverUnit.type, hoverUnit.level) : '',
      drawCursorTile: (c, dx, dy) => this.drawCursorTile(c, dx, dy),
      isTargetSelect: this.state === 'targetSelect',
    });

    if (this.state === 'targetSelect') {
      this.renderTargetForecast(ctx);
      return;
    }

    if (this.state === 'script' && this.scriptState?.dialog) {
      const dlg = this.scriptState.dialog;
      drawStoryDialogBox(ctx, this.assets, {
        portrait: dlg.portrait,
        speaker: dlg.speaker,
        text: dlg.text,
        width: WIDTH,
        height: HEIGHT,
        animTick: this.animTick,
      });
      return;
    }

    if (this.state === 'storyDialog') {
      const cur = this.storyQueue[0];
      if (cur) {
        drawStoryDialogBox(ctx, this.assets, {
          portrait: cur.portrait,
          speaker: SPEAKER_NAMES[String(cur.portrait)] ?? 'STORY',
          text: cur.text,
          width: WIDTH,
          height: HEIGHT,
          animTick: this.animTick,
        });
      }
      return;
    }

    if (this.state === 'stageBanner') {
      const box = drawMenuFrame(ctx, this.assets, 12, 92, WIDTH - 24, 114, 0, 22);
      drawUiText(ctx, this.stageBannerTitle, box.ix + (box.iw >> 1), box.iy + 11, {
        font: 'bold 10px Arial, sans-serif',
        color: UI_COLORS.textGold,
        align: 'center',
        maxWidth: box.iw - 12,
      });
      drawWrappedLines(ctx, this.stageBannerObjective, box.ix + 8, box.iy + 30, box.iw - 16, 13, 3, {
        font: '9px Arial, sans-serif',
        color: UI_COLORS.textActive,
      });
      drawUiText(ctx, this.stageBannerPrompt || 'TAP OR ENTER TO BEGIN', box.ix + (box.iw >> 1), box.iy + box.ih - 12, {
        font: 'bold 8px Arial, sans-serif',
        color: UI_COLORS.textGreen,
        align: 'center',
      });
      return;
    }

    if (this.state === 'actionMenu') {
      this.actionRing?.render(ctx, this.assets);
      return;
    }

    if (this.state === 'recruitMenu') {
      const myPal = this.playerPalette[1 + this.playerIndex] ?? (1 + this.playerIndex);
      drawRecruitDialog(ctx, this.assets, {
        width: WIDTH,
        height: HEIGHT,
        list: this.getRecruitList(),
        cursor: this.recruitCursor,
        gold: this.balances[this.playerIndex] ?? 0,
        playerPalette: myPal,
        unitRecords: this.assets.unitRecords,
        statsFn: t => computeUnitStats(this.assets.unitRecords[t], 0),
        unitNameFn: t => this.unitName(t),
        costFn: t => this.getRecruitCost(t),
        animTick: this.animTick,
      });
      return;
    }

    if (this.state === 'pauseMenu') {
      const opts = this.getPauseOptions();
      drawFramedListMenu(ctx, this.assets, {
        title: this.assets.langStrings?.[61] || 'GAME MENU',
        items: opts,
        selectedIndex: this.pauseCursor,
        maxVisible: 8,
        rowHeight: 22,
        x: 20,
        y: 36,
        w: WIDTH - 40,
        h: 44 + opts.length * 22,
        leftButton: 'OK',
        rightButton: 'BACK',
        width: WIDTH,
        height: HEIGHT,
      });
      return;
    }

    if (this.state === 'dialog' || this.state === 'victory' || this.state === 'defeat') {
      if (this.state === 'defeat' && this.assets.images.gameover) {
        drawImageAt(ctx, this.assets.images.gameover, 0, 0, WIDTH, HEIGHT);
      }
      const box = drawMenuFrame(ctx, this.assets, 14, 120, WIDTH - 28, 66, 0, 18);
      const hdr = this.state === 'victory' ? 'VICTORY!' : this.state === 'defeat' ? 'GAME OVER' : 'INFO';
      drawUiText(ctx, hdr, box.ix + (box.iw >> 1), box.iy + 9, {
        font: 'bold 9px Arial, sans-serif',
        color: this.state === 'victory' ? UI_COLORS.textGreen : this.state === 'defeat' ? UI_COLORS.textRed : UI_COLORS.textGold,
        align: 'center',
      });
      const txt = this.state === 'victory' ? 'MISSION COMPLETE · TAP TO CONTINUE' : this.state === 'defeat' ? 'DEFEAT · TAP FOR MENU' : this.dialogText;
      drawUiText(ctx, txt, box.ix + (box.iw >> 1), box.iy + 36, {
        font: 'bold 9px Arial, sans-serif',
        color: UI_COLORS.textActive,
        align: 'center',
        maxWidth: box.iw - 14,
      });
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
