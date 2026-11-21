import {
  LOGICAL_WIDTH,
  LOGICAL_HEIGHT,
  setLogicalViewport,
  CELL_WIDTH,
  CELL_HEIGHT,
  createImageCache,
  getFogState,
  revealFog,
  getMinimapRect,
  renderOriginalMap,
} from './render-original.js';
import {
  SCENARIOS,
  BUILDINGS,
  WEAPONS,
  SPELLS,
  getVillagerName,
  getBuildingSpec,
  getScaffoldSlots,
  canPlaceBuilding,
  placeConstructionSite,
  enterBuildingSlot,
  enterBuildingWorkSlot,
  enterRestHut,
  exitBuildingSlot,
  isUnitInsideBuilding,
  clearUnitFromOccupancy,
  finishConstructionSite,
  getBuildingMaxLevel,
  upgradeBuilding,
  demolishBuilding,
  syncUnitAvatar,
  spawnBonePile,
  spawnMeatCarcass,
  populateForestWildlife,
  spawnNewbornVillager,
  captureTribeCarryover,
  loadScenarioFromMa,
  MP_MAPS,
  prepareMultiplayerMatch,
} from './scenario-loader.js';
import { MultiplayerClient, packWorldSnapshot, applyWorldSnapshot } from './multiplayer.js';
import {
  DIFFICULTIES,
  parseStoryD0,
  getMissionDialogue,
  evaluateMissionObjectives,
  computeMissionScore,
} from './campaign-story.js';
import {
  LANGUAGES,
  loadLanguagePack,
  getUiStrings,
  getLocalizedScenarioName,
  saveGameToStorage,
  loadSaveMetadata,
  loadGameFromStorage,
  exportSaveJson,
} from './storage-i18n.js';
import {
  SA_TRACK_NAMES,
  parseOriginalPd0,
  parseOriginalA,
  PrehistoricMidiSynth,
} from './audio-binary.js';
import { mountPhaserRuntime } from './phaser-engine.js';

const midiSynth = new PrehistoricMidiSynth();

const canvas = document.querySelector('#game');
let ctx = null;
let phaserRuntime = null;
let mpClient = null;

function showMpLobby(visible) {
  const el = document.getElementById('mp-lobby');
  if (!el) return;
  if (visible) el.classList.remove('hidden');
  else el.classList.add('hidden');
}

const panelTitle = document.querySelector('#screen-title');
const panelCopy = document.querySelector('#screen-copy');
const choicesNode = document.querySelector('#choices');
const helpNode = document.querySelector('#help-card');
const noteNode = document.querySelector('#scope-note');
const hintNode = document.querySelector('#control-hint');

const DIRS = [
  { dx: 1, dy: 0, dir: 0 },
  { dx: 1, dy: 1, dir: 1 },
  { dx: 0, dy: 1, dir: 2 },
  { dx: -1, dy: 1, dir: 3 },
  { dx: -1, dy: 0, dir: 4 },
  { dx: -1, dy: -1, dir: 5 },
  { dx: 0, dy: -1, dir: 6 },
  { dx: 1, dy: -1, dir: 7 },
];

const PHASES = {
  language: {
    title: 'Chọn ngôn ngữ',
    copy: 'Chọn ngôn ngữ hiển thị bằng chuột hoặc bàn phím. Luồng mở đầu dùng ảnh chụp đúng 240×320 từ bản gốc.',
    options: ['TIẾNG VIỆT', 'FRANÇAIS', 'ITALIANO', 'DEUTSCH', 'ESPAÑOL'],
    capture: 0,
  },
  music: {
    title: 'Bật âm nhạc?',
    copy: 'Chọn Bật hoặc Tắt 5 bản nhạc nền MIDI gốc giải mã trực tiếp từ file nhị phân /sa qua Web Audio API.',
    options: ['BẬT ÂM NHẠC', 'TẮT ÂM NHẠC'],
    capture: 1,
  },
  mainMenu: {
    title: 'Trò chơi',
    copy: 'Menu mở đầu dựng theo ảnh chụp từ JAR gốc. Chọn Bắt đầu trò chơi để vào chiến dịch.',
    options: ['BẮT ĐẦU TRÒ CHƠI', 'TRỢ GIÚP', 'TUỲ CHỌN', 'VỀ TRÒ CHƠI', 'THOÁT'],
    capture: 2,
  },
  mode: {
    title: 'Chọn chế độ',
    copy: 'Chọn Chiến dịch (10 màn có cốt truyện /0/d0 & mang bộ lạc), Trò chơi tuỳ chỉnh (chọn map & độ khó), hoặc chọn nhanh màn 1–10.',
    options: ['CHIẾN DỊCH (10 MÀN)', 'TRÒ CHƠI TUỲ CHỈNH', 'CHỌN MÀN CHIẾN DỊCH (1–10)', 'QUAY LẠI'],
    capture: 3,
  },
  campaignMenu: {
    title: 'Chiến dịch',
    copy: 'Chọn Độ khó và bắt đầu Chiến dịch Avnotaklu với đầy đủ cốt truyện gốc từ /0/d0.',
    options: ['TIẾP TỤC', 'TRÒ CHƠI MỚI (MÀN 1)', 'ĐỘ KHÓ: DỄ', 'QUAY LẠI'],
    capture: 4,
  },
};

const CAPTURED_FLOW = {
  campaignMenu: 4,
  newGame: 5,
  firstStory: 8,
  gameplay: 24,
};

const captureCache = new Map();
function getCaptureImage(frameIndex) {
  const key = String(frameIndex).padStart(2, '0');
  let img = captureCache.get(key);
  if (!img) {
    img = new Image();
    img.src = `assets/campaign-captures/frame-${key}.png`;
    img.onload = () => render();
    captureCache.set(key, img);
  }
  return img;
}

const spriteCache = createImageCache(() => render());

const state = {
  phase: 'language',
  selected: 0,
  language: 0,
  music: true,
  campaignFrame: CAPTURED_FLOW.newGame,
  baseData: null,
  maBytes: null,
  langPack: null,
  showMinimap: false,
  storyLines: [],
  storyDialog: null,
  missionResult: null,
  victoryDismissed: false,
  difficultyIndex: 0, // 0 = DỄ, 1 = KHÓ
  isCustomGame: false,
  customConfig: { scenarioIndex: 1, difficultyIndex: 0, abundantResources: false },
  carryoverTribe: null,
  missionStats: { buildingsBuilt: 0, enemiesKilled: 0, enemyBuildingsDestroyed: 0, initialEnemies: 0, initialEnemyBuildings: 0 },
  scenarioIndex: 0,
  data: null,
  cameraX: 0,
  cameraY: 0,
  smoothCamX: 0,
  smoothCamY: 0,
  cursor: { x: 5, y: 9 },
  selectedUnit: 0,
  selectedUnits: new Set(),
  groups: { 7: new Set(), 9: new Set() },
  activeGroupId: 0,
  selectionBox: null,
  paused: false,
  compareOriginal: false,
  autoAI: false,
  panelMode: 'main', // 'main' | 'build' | 'scenarios' | 'building'
  canvasMenu: null, // Authentic on-canvas J2ME menus: { kind: 'actions'|'build'|'building'|'villagers'|'pause'|'scenarios', items, selected, scroll, title }
  selectedBuildingBid: 0,
  buildType: null,
  buildPreview: null,
  flagMode: null, // null | 'rally' | 'attack'
  activeFlag: null, // { kind, x, y, until }
  animTick: 0,
  lastAlertTick: -999,
  mpMode: true,
  aiMode: false,
  aiDifficulty: 'normal', // 'easy' | 'normal' | 'hard'
  localTribe: 0, // 0 = Host (Blue Tribe 1..50), 1 = Guest (Red Tribe 51..100)
  mpWinner: null,
  tribeUseRawWeapon: [true, true], // Per-tribe toggle: allow taking 1 Stone/Wood from Storage when no crafted weapons exist
  pointerPos: { x: 0, y: 0, visible: false },
  warningBanner: null,
  food: 0,
  wood: 0,
  stone: 0,
  tools: 0,
  population: 9,
  housingCap: 1,
  message: 'Click hoặc kéo khung chọn dân làng, click đất/cây/địch để đi, thu thập hoặc chiến đấu.',
  // Active tasks per villager: { kind: 'move'|'gather'|'return'|'build'|'hunt'|'rest'|'eat'|'workBuilding'|'attackUnit'|'attackBuilding', ... }
  tasks: new Map(),
  savedJobs: new Map(), // unitId -> previous primary job to resume automatically after eating/sleeping/dancing
  enemyTasks: new Map(),
  weaponQueues: new Map(), // bid -> [q0..q5] weapon forge orders (starts at 0)
  shrineRituals: new Map(), // bid -> { spell, ticks, duration } active Shaman spell rituals
  animalMoves: new Map(), // aid -> { fromX, fromY, toX, toY, progress, total, walkAnim } smooth sub-tile animal movement
  siteMaterials: new Map(), // bid -> { wood, stone, tools, owner } pending material deliveries from Storage
  upgradingBuildings: new Map(), // bid -> { targetLevel, targetType } active builder-driven building upgrades
  treeWood: new Map(), // remaining wood per tree cell "x,y" (12 wood/tree; clears to grass when depleted)
  activePath: [],
  dustEffects: [],
  deathEffects: [],
  projectiles: [],
  popups: [],
};

function addPopup() {
  // Original J2ME game has no floating text popups on the map (+2 gỗ, Ăn no, etc.)
}

function addDust(x, y, w, h) {
  state.dustEffects.push({ x, y, w, h, frame: 0, maxFrames: 20 });
}

function showWarning(text, iconComp = null) {
  // Exact port of f.java:2396 & mo[304]:
  // 675 = sad/dead/bad news (mo[304] offset -4), 676 = warning/alert (offset -3), 679 = happy/birth/good news (offset 0)
  let resolvedIcon = iconComp;
  if (!resolvedIcon) {
    const s = String(text || '');
    if (s.includes('đã chết') || s.includes('sang phe địch') || s.includes('bị phá hủy')) {
      resolvedIcon = 675;
    } else if (s.includes('⚠') || s.includes('Cần') || s.includes('Chưa có') || s.includes('thiếu')) {
      resolvedIcon = 676;
    } else {
      resolvedIcon = 679;
    }
  }
  state.warningBanner = { text, iconComp: resolvedIcon, until: performance.now() + 3400 };
  state.message = text;
  render();
}

function syncResourcesToData(owner = state.localTribe ?? 0) {
  if (!state.data?.resources) return;
  if (!state.data.resources[owner]) state.data.resources[owner] = new Array(26).fill(0);
  if (owner === (state.localTribe ?? 0)) {
    const r = state.data.resources[owner];
    r[0] = state.food;
    r[1] = state.wood;
    r[2] = state.stone;
    r[3] = state.tools;
    r[11] = state.population;
    r[16] = state.housingCap;
  }
}

function pullLocalResourcesFromData() {
  const owner = state.localTribe ?? 0;
  const r = state.data?.resources?.[owner];
  if (!r) return;
  state.food = r[0] || 0;
  state.wood = r[1] || 0;
  state.stone = r[2] || 0;
  state.tools = r[3] || 0;
  state.population = getVillagerIds(owner).length;
  const huts = getPlayerBuildings(owner).filter((b) => !b.underConstruction && b.targetType === 2).length;
  state.housingCap = Math.max(6, 6 + huts * 6);
}

function getVillagerIds(owner = state.localTribe ?? 0) {
  if (!state.data) return [];
  const e = state.data.entityData;
  const start = owner === 1 ? 51 : 1;
  const end = owner === 1 ? 100 : 50;
  const ids = [];
  for (let id = start; id <= end; id++) {
    if ((e[1919 + id] & 0xff) > 0) ids.push(id);
  }
  return ids;
}

function getEnemyIds(owner = state.localTribe ?? 0) {
  return getVillagerIds(owner === 1 ? 0 : 1);
}

function getEnemyBuildings(owner = state.localTribe ?? 0) {
  return getPlayerBuildings(owner === 1 ? 0 : 1);
}

function getActiveSelectionIds() {
  const living = new Set(getVillagerIds());
  const out = [];
  for (const id of state.selectedUnits) {
    if (living.has(id)) out.push(id);
  }
  if (out.length === 0 && state.selectedUnit && living.has(state.selectedUnit)) {
    out.push(state.selectedUnit);
  }
  return out;
}

function getCurrentDifficulty() {
  return DIFFICULTIES[state.difficultyIndex] || DIFFICULTIES[0];
}

function getUnitDamage(unitId) {
  const wId = state.data.entityData[6565 + unitId] & 0xff;
  const w = WEAPONS.find((item) => item.id === wId);
  const base = 5 + (w ? w.atk : 0);
  if (unitId > 50) {
    return Math.max(2, Math.round(base * getCurrentDifficulty().enemyAtkScale));
  }
  return base;
}

function getWeaponAttackAnim(wId, swingIdx = 0) {
  // Exact per-weapon combat animations from /a (mo[77]/mo[158]/mo[18]):
  // 1=Đá ném  -> anim 35 (6f stone throw, partKind 8 = baseSprite 1184)
  // 2=Giáo    -> anim 36 (5f spear throw, partKind 8 = baseSprite 319)
  // 5=Rìu nhỏ -> anim 36 (5f axe throw, partKind 6 + offset 1 = baseSprite 426)
  // 0=Dùi cui, 3=Búa đá, 4=Chùy xương, 9=Tay không -> authentic melee combos
  if (wId === 1) return { animId: 35, frames: 6, hitFrame: 3 };
  if (wId === 2 || wId === 5) return { animId: 36, frames: 5, hitFrame: 2 };
  if (wId === 3) {
    const a = swingIdx % 2 === 0 ? 29 : 31;
    return { animId: a, frames: a === 31 ? 9 : 6, hitFrame: 3 };
  }
  if (wId === 4) {
    const a = swingIdx % 2 === 0 ? 27 : 33;
    return { animId: a, frames: a === 27 ? 4 : 6, hitFrame: 2 };
  }
  if (wId === 0) {
    const a = swingIdx % 2 === 0 ? 25 : 29;
    return { animId: a, frames: 6, hitFrame: 3 };
  }
  // Unarmed (9): fast punches
  const a = swingIdx % 2 === 0 ? 24 : 25;
  return { animId: a, frames: a === 24 ? 4 : 6, hitFrame: 2 };
}

function getUnitRange(unitId) {
  const wId = state.data.entityData[6565 + unitId] & 0xff;
  if (wId === 2 || wId === 5) return 4; // Giáo (spear throw) & Rìu nhỏ (throwing axe — mo[18][5]=5)
  if (wId === 1) return 3; // Đá ném (thrown stone — mo[18][1]=5)
  return 1; // Melee
}

function alertCombat(msg, color = '#ff7b6b') {
  if (state.animTick - state.lastAlertTick < 50) return;
  state.lastAlertTick = state.animTick;
  state.message = msg;
  addPopup(state.cameraX + 5, state.cameraY + 4, msg, color);
}

function stepChildLuring(lurerId, childId, lurerTask, newOwner) {
  const d = state.data;
  if (!d) return 'cancel';
  const e = d.entityData;
  if ((e[1919 + childId] & 0xff) <= 0 || isUnitInsideBuilding(d, childId)) {
    return 'cancel';
  }
  const lx = e[lurerId] & 0xff;
  const ly = e[101 + lurerId] & 0xff;
  const cx = e[childId] & 0xff;
  const cy = e[101 + childId] & 0xff;

  // Lurer stands still at range <= 3 and waves the balloon/toy (anim 159, 2 frames) facing the child
  e[202 + lurerId] = 0;
  e[303 + lurerId] = 0;
  lurerTask.path = [];
  lurerTask.stepProgress = 0;
  e[606 + lurerId] = directionFromDelta(cx - lx, cy - ly);
  setUnitAnim(lurerId, 159, Math.floor((lurerTask.workTicks || 0) / 3) % 2);
  lurerTask.workTicks = (lurerTask.workTicks || 0) + 1;

  // Exact port of b.java:2636-2642 & 3101-3105:
  // While child is > 1 tile away from the lurer, the lured child runs toward the lurer (anim 6)!
  const distNow = Math.max(Math.abs(cx - lx), Math.abs(cy - ly));
  if (distNow > 1) {
    let childTask = state.tasks.get(childId);
    if (!childTask || childTask.kind !== 'luredByEnemy' || childTask.lurerId !== lurerId || childTask.path.length === 0) {
      const toLurer = findPath(cx, cy, lx, ly, childId, true);
      if (!toLurer || toLurer.length === 0) {
        return 'cancel';
      }
      childTask = {
        kind: 'luredByEnemy',
        lurerId,
        path: toLurer,
        stepProgress: 0,
        workTicks: 0,
      };
      state.tasks.set(childId, childTask);
    }
    return 'luring';
  }

  // Child has physically run up to the lurer (distNow <= 1)!
  if (state.tasks.get(childId)?.kind === 'luredByEnemy') {
    state.tasks.delete(childId);
  }
  e[202 + childId] = 0;
  e[303 + childId] = 0;
  e[606 + childId] = (e[606 + lurerId] + 4) & 7;
  setUnitAnim(childId, 45, Math.floor((lurerTask.lureTicks || 0) / 2) % 5);
  lurerTask.lureTicks = (lurerTask.lureTicks || 0) + 1;
  if (lurerTask.lureTicks >= 16) {
    convertChildToTribe(childId, newOwner);
    return 'converted';
  }
  return 'luring';
}

function convertChildToTribe(childId, newOwner) {
  const d = state.data;
  if (!d) return 0;
  const e = d.entityData;
  const fo = d.entityFieldOffsets;
  if ((e[1919 + childId] & 0xff) <= 0 || (e[1414 + childId] & 0xff) >= 12) return 0;
  const oldOwner = childId > 50 ? 1 : 0;
  if (oldOwner === newOwner) return childId;

  // Exact port of b.java:2838-2876 void_c(byte by): find free slot in newOwner's tribe (1..50 or 51..100)
  const startId = newOwner === 0 ? 1 : 51;
  const endId = newOwner === 0 ? 50 : 100;
  let newId = 0;
  for (let id = startId; id <= endId; id++) {
    if ((e[1919 + id] & 0xff) <= 0) {
      newId = id;
      break;
    }
  }
  if (!newId) return 0;

  const cx = e[childId] & 0xff;
  const cy = e[101 + childId] & 0xff;
  const childName = getVillagerName(d, childId);

  if (fo) {
    for (let s = 0; s < Math.min(83, fo.length); s++) {
      e[fo[s] + newId] = e[fo[s] + childId];
    }
  } else {
    for (let base = 0; base <= 7979; base += 101) {
      e[base + newId] = e[base + childId];
    }
  }
  e[202 + newId] = 0;
  e[303 + newId] = 0;
  e[3838 + newId] = newId;
  e[4747 + newId] = newId;
  e[4444 + newId] = 0;
  e[4545 + newId] = 0;
  e[4646 + newId] = -1;
  e[1313 + newId] = 0;

  // Clear old child slot
  e[1919 + childId] = 0;
  state.tasks.delete(childId);
  state.savedJobs.delete(childId);
  state.enemyTasks.delete(childId);
  state.selectedUnits.delete(childId);
  state.groups[7].delete(childId);
  state.groups[9].delete(childId);
  if (state.selectedUnit === childId) {
    state.selectedUnit = getVillagerIds()[0] || 0;
    state.activePath = [];
  }

  if (d.occupancy[cy]?.[cx] === childId || d.occupancy[cy]?.[cx] === 0) {
    d.occupancy[cy][cx] = newId;
  }
  setUnitAnim(newId, 14, 0);
  state.population = getVillagerIds().length;
  syncResourcesToData(0);
  syncResourcesToData(1);

  const localWon = newOwner === (state.localTribe ?? 0);
  const msg = localWon
    ? `${childName} đã bị dụ dỗ gia nhập bộ lạc của ta!`
    : `${childName} đã bị đối phương dụ dỗ sang phe địch!`;
  addPopup(cx, cy, localWon ? 'Dụ dỗ thành công!' : 'Bị dụ dỗ!', localWon ? '#9cff7b' : '#ffd84d');
  showWarning(msg);
  state.message = msg;
  return newId;
}

function applyUnitDamage(attackerId, targetId, dmg) {
  const d = state.data;
  const e = d.entityData;
  const curHp = e[1919 + targetId] & 0xff;
  if (curHp <= 0) return true;
  // In the original game (b.java:827), children (age < 12) are NEVER attacked or damaged — only lured (job 107, anim 159)!
  if ((e[1414 + targetId] & 0xff) < 12) return false;
  const nextHp = Math.max(0, curHp - dmg);
  e[1919 + targetId] = nextHp;

  const tx = e[targetId] & 0xff;
  const ty = e[101 + targetId] & 0xff;
  addPopup(tx, ty, `-${dmg}`, targetId <= 50 ? '#ff6f61' : '#ffd84d');

  if (nextHp > 0 && (e[1414 + targetId] & 0xff) >= 12) {
    if (targetId <= 50 && attackerId > 50) {
      if ((state.localTribe ?? 0) === 0) alertCombat('Chúng ta đang bị tấn công!');
      const curT = state.tasks.get(targetId);
      if (curT?.kind !== 'attackUnit' && curT?.kind !== 'armForBattle') {
        assignAttackTask(targetId, 'unit', attackerId);
      }
    } else if (attackerId > 0 && targetId > 50 && attackerId <= 50) {
      if (state.mpMode || state.aiMode) {
        const curT = state.tasks.get(targetId);
        if (curT?.kind !== 'attackUnit' && curT?.kind !== 'armForBattle') {
          assignAttackTask(targetId, 'unit', attackerId);
        }
      } else if (!state.enemyTasks.has(targetId)) {
        assignEnemyAttack(targetId, 'unit', attackerId);
      }
    }
  }

  if (nextHp <= 0) {
    // Authentic 2-stage villager death (b.java:1484 & 3753):
    // Stage 1: anim 108 (18f — knocked flying up and slamming down),
    // Stage 2: anim 43 (adult, 9f) / anim 44 (child, 10f) — transforms into the authentic human skeleton on the ground!
    state.deathEffects.push({
      uid: targetId,
      x: tx,
      y: ty,
      dir: e[606 + targetId] & 7,
      isChild: (e[1414 + targetId] & 0xff) < 12,
      phase: 'fall',
      animId: 108,
      frame: 0,
      maxFrames: 18,
      holdTicks: 0,
    });
    exitBuildingSlot(d, targetId);
    clearUnitFromOccupancy(d, targetId);
    state.tasks.delete(targetId);
    state.savedJobs.delete(targetId);
    state.enemyTasks.delete(targetId);
    state.selectedUnits.delete(targetId);
    state.groups[7].delete(targetId);
    state.groups[9].delete(targetId);
    if (state.selectedUnit === targetId) {
      state.selectedUnit = getVillagerIds()[0] || 0;
      state.activePath = [];
    }

    const deadName = getVillagerName(d, targetId);
    const deadOwner = targetId > 50 ? 1 : 0;
    const localTribe = state.localTribe ?? 0;
    if (deadOwner !== localTribe) {
      // Enemy died: award +1 bone & kill stat, but NEVER show the Panel 9 "... đã chết!" notification (exact b.java:3727)!
      state.tools += 1;
      state.missionStats.enemiesKilled++;
      syncResourcesToData();
    } else {
      state.population = getVillagerIds().length;
      syncResourcesToData();
      addPopup(tx, ty, `${deadName} đã chết!`, '#ff5252');
      showWarning(`💀 ${deadName} đã chết!`);
      state.message = `💀 ${deadName} đã chết!`;
      // Elect new Chief if Chief died!
      if (d.resources?.[localTribe]?.[17] === targetId) {
        const survivors = getVillagerIds();
        if (survivors.length > 0) {
          d.resources[localTribe][17] = survivors[0];
          const newChief = getVillagerName(d, survivors[0]);
          state.message = `💀 ${deadName} đã chết! ${newChief} trở thành Tộc trưởng mới!`;
        } else {
          state.message = 'Toàn bộ bộ lạc đã tử trận!';
        }
      }
    }
    return true;
  }
  return false;
}

function applyBuildingDamage(attackerId, bid, dmg) {
  const d = state.data;
  const e = d.entityData;
  const curHp = e[8505 + bid] & 0xff;
  if (curHp <= 0) return true;
  const maxHp = Math.max(1, e[8566 + bid] & 0xff);
  const nextHp = Math.max(0, curHp - dmg);
  e[8505 + bid] = nextHp;

  const bx = e[8383 + bid] & 0xff;
  const by = e[8444 + bid] & 0xff;
  const rawType = e[8749 + bid] & 0xff;
  const targetType = rawType >= 12 && rawType <= 19 ? (e[9237 + bid] & 0xff) : rawType;
  const spec = getBuildingSpec(d, targetType);
  const bcx = bx + Math.floor((spec.width || 2) / 2);
  const bcy = by + Math.floor((spec.height || 2) / 2);
  addPopup(bx + 1, by, `-${dmg}`, '#ff944d');
  if (nextHp > 0 && nextHp * 2 < maxHp) {
    e[8627 + bid] = 2; // damaged burning state -> renders authentic fire flames d(110)!
  }
  const bldOwner = bid > 30 ? 1 : 0;
  if (bid <= 30 && attackerId > 50) {
    alertCombat('Nhà của chúng ta đang bị tấn công!');
  }

  // Exact port of b.java:3624-3626: when a building is attacked, all adult villagers of that tribe
  // inside the attacked building OR within 9 tiles around it immediately rush out to defend & counter-attack!
  if (nextHp > 0 && attackerId >= 1 && attackerId <= 100 && (e[1919 + attackerId] & 0xff) > 0) {
    for (const uid of getVillagerIds(bldOwner)) {
      if ((e[1414 + uid] & 0xff) < 12) continue; // children don't fight
      const curTask = state.tasks.get(uid);
      if (
        curTask &&
        (curTask.kind === 'attackUnit' ||
          curTask.kind === 'attackBuilding' ||
          curTask.kind === 'armForBattle')
      ) {
        continue;
      }
      const insideThisBld = isUnitInsideBuilding(d, uid) && (e[4444 + uid] & 0xff) === bid;
      const info = getVillagerInfo(uid);
      const distToBld = Math.hypot(info.x - bcx, info.y - bcy);
      const ax = e[attackerId] & 0xff;
      const ay = e[101 + attackerId] & 0xff;
      const distToAttacker = Math.hypot(info.x - ax, info.y - ay);
      if (insideThisBld || distToBld <= 9 || distToAttacker <= 8) {
        assignAttackTask(uid, 'unit', attackerId);
      }
    }
  }

  if (nextHp <= 0) {
    const res = demolishBuilding(d, bid);
    addDust(res.x, res.y, res.w, res.h);
    addPopup(res.x + Math.floor(res.w / 2), res.y, 'Nhà đã bị phá hủy!', '#ff5252');
    if (bid > 30) state.missionStats.enemyBuildingsDestroyed++;
    state.message = bid > 30 ? `Đã phá hủy ${res.spec.name} của địch!` : `${res.spec.name} của ta đã bị phá hủy!`;
    if (bid <= 30 && !res.isScaffold && res.spec.housingBonus > 0) {
      state.housingCap = Math.max(1, state.housingCap - res.spec.housingBonus);
      syncResourcesToData();
    }
    return true;
  }
  return false;
}

function launchProjectile(attackerId, targetType, targetId, x0, y0, x1, y1, weaponId, dmg) {
  const dist = Math.max(1, Math.hypot(x1 - x0, y1 - y0));
  state.projectiles.push({
    attackerId,
    targetType,
    targetId,
    x0,
    y0,
    x1,
    y1,
    dir: directionFromDelta(x1 - x0, y1 - y0),
    weaponId,
    dmg,
    age: 0,
    duration: Math.max(4, Math.round(dist * 2.5)),
  });
}

function assignGroup(groupNum) {
  const ids = getActiveSelectionIds();
  if (ids.length === 0) {
    state.message = 'Hãy chọn ít nhất 1 dân làng (hoặc kéo khung chọn nhóm) rồi gán nhóm.';
    render();
    return;
  }
  state.groups[groupNum] = new Set(ids);
  state.activeGroupId = groupNum;
  state.message = `Đã gán ${ids.length} chiến binh vào Nhóm ${groupNum}! Nhấn phím ${groupNum} hoặc nút ${groupNum} ở thanh đáy để gọi nhanh.`;
  render();
}

function recallGroup(groupNum) {
  const living = new Set(getVillagerIds());
  const members = [...state.groups[groupNum]].filter((id) => living.has(id));
  if (members.length === 0) {
    assignGroup(groupNum);
    return;
  }
  state.groups[groupNum] = new Set(members);
  state.selectedUnits = new Set(members);
  state.selectedUnit = members[0];
  state.activeGroupId = groupNum;
  centerOnUnit(members[0]);
  state.message = `Đã gọi Nhóm ${groupNum} (${members.length} chiến binh). Click ô đất để hành quân hoặc click địch để tấn công!`;
  render();
}

function startFlagPlacement(kind) {
  cancelBuildPlacement();
  state.showMinimap = false;
  state.canvasMenu = null;
  state.flagMode = kind;
  state.message =
    kind === 'attack'
      ? '⚔ Di chuyển chuột và click để CẮM CỜ TẤN CÔNG (chuột phải / Esc để hủy).'
      : '⚑ Di chuyển chuột và click để CẮM CỜ TẬP HỢP quân (chuột phải / Esc để hủy).';
  render();
}

function cancelFlagPlacement() {
  state.flagMode = null;
}

function findBestStorageWeaponForUnit(unitId, owner) {
  const d = state.data;
  if (!d) return null;
  const e = d.entityData;
  const r = d.resources?.[owner] || [];
  const curW = e[6565 + unitId] & 0xff;
  const curAtk = curW < WEAPONS.length ? WEAPONS[curW].atk : 0;
  const meleeLv = e[1717 + unitId] & 0xff; // Authentic mo[126][14]=17 -> 1717 = Melee (Phòng tập đánh)
  const throwLv = e[1616 + unitId] & 0xff; // Authentic mo[126][15]=16 -> 1616 = Throwing (Trung tâm bia)
  const preferThrowing = throwLv > meleeLv;

  // Priority order matching the villager's highest combat skill!
  // Throwing weapons: 2=Giáo (+9), 1=Đá ném (+6)
  // Melee weapons: 5=Rìu nhỏ (+14), 4=Chùy xương (+12), 3=Búa đá (+11), 0=Dùi cui (+5)
  const order = preferThrowing ? [2, 1, 5, 4, 3, 0] : [5, 4, 3, 0, 2, 1];
  for (const wid of order) {
    const stock = r[5 + wid] || 0;
    const wAtk = WEAPONS[wid].atk;
    const isPref = preferThrowing ? (wid === 1 || wid === 2) : (wid !== 1 && wid !== 2);
    const curIsPref = curW < 6 ? (preferThrowing ? (curW === 1 || curW === 2) : (curW !== 1 && curW !== 2)) : false;
    if (stock > 0 && (wAtk > curAtk || (isPref && !curIsPref && wAtk >= curAtk - 2))) {
      return { weaponId: wid, fromStock: true };
    }
  }
  // If unarmed and no crafted weapon in stock, ALWAYS take Stone as default weapon (Đá ném, wId=1)!
  if (curW === 9) {
    return { weaponId: 1, fromStock: false, resType: 'stone' };
  }
  return null;
}

function dispatchUnitToBattleFlag(unitId, fx, fy, owner) {
  const e = state.data.entityData;
  const enemies = getEnemyIds(owner);
  let bestEnemy = 0;
  let bestDist = 12;
  for (const eid of enemies) {
    const dist = Math.hypot((e[eid] & 0xff) - fx, (e[101 + eid] & 0xff) - fy);
    if (dist < bestDist) {
      bestDist = dist;
      bestEnemy = eid;
    }
  }
  if (bestEnemy > 0) {
    assignAttackTask(unitId, 'unit', bestEnemy);
    return;
  }
  const eblds = getEnemyBuildings(owner);
  let bestBld = null;
  let bestBDist = 12;
  for (const b of eblds) {
    const dist = Math.hypot(b.x - fx, b.y - fy);
    if (dist < bestBDist) {
      bestBDist = dist;
      bestBld = b;
    }
  }
  if (bestBld) assignAttackTask(unitId, 'building', bestBld.bid);
  else issueGroupMove([unitId], fx, fy);
}

function confirmFlagAtCursor(owner = state.localTribe ?? 0, overridePos = null) {
  const kind = overridePos?.flagKind || state.flagMode;
  if (!kind || !state.data) return;
  const fx = overridePos ? overridePos.x : state.cursor.x;
  const fy = overridePos ? overridePos.y : state.cursor.y;

  if (!overridePos) {
    state.activeFlag = { kind, x: fx, y: fy, until: performance.now() + 6000 };
    state.flagMode = null;
  }

  // If Guest in 1v1 Multiplayer, forward flag command to Host
  if (state.mpMode && state.localTribe === 1 && !overridePos) {
    mpClient?.sendCommand({ kind: 'flagCommand', flagKind: kind, x: fx, y: fy });
    state.message = kind === 'attack' ? `⚔ Đã cắm cờ chiến đấu tại (${fx}, ${fy})!` : `⚑ Đã cắm cờ tập hợp chiến binh tại (${fx}, ${fy})!`;
    render();
    return;
  }

  const e = state.data.entityData;
  const adults = getVillagerIds(owner).filter((id) => (e[1414 + id] & 0xff) >= 12);
  if (adults.length === 0) {
    if (!overridePos) render();
    return;
  }

  if (kind === 'rally') {
    // Authentic Rally Command: gathers ONLY ranked/trained warriors (with ^ rank chevrons: melee/throw skill >= 5)!
    const ranked = adults.filter(
      (id) => (e[1616 + id] & 0xff) >= 5 || (e[1717 + id] & 0xff) >= 5 || (e[7575 + id] & 0xff) > 5
    );
    if (ranked.length === 0) {
      if (!overridePos) {
        state.activeFlag = null;
        showWarning('⚠ Chưa có chiến binh có cấp bậc (^) để tập hợp! Hãy huấn luyện ở Phòng tập / Khu tập ném trước.');
      }
      return;
    }
    if (!overridePos) {
      state.selectedUnits = new Set(ranked);
      state.selectedUnit = ranked[0];
    }
    issueGroupMove(ranked, fx, fy);
    if (!overridePos) {
      state.message = `⚑ Đã cắm cờ tập hợp ${ranked.length} chiến binh có cấp bậc (^) tại (${fx}, ${fy})!`;
      render();
    }
  } else if (kind === 'attack') {
    // Authentic Battle Command: rallies ALL adult villagers; anyone who can grab a stronger matching weapon from Storage runs there first!
    if (!overridePos) {
      state.selectedUnits = new Set(adults);
      state.selectedUnit = adults[0];
    }
    let armingCount = 0;
    for (const uid of adults) {
      const upgrade = findBestStorageWeaponForUnit(uid, owner);
      const storage = upgrade ? findNearestDropoff(e[uid] & 0xff, e[101 + uid] & 0xff, owner) : null;
      if (upgrade && storage) {
        ensureUnitOutside(uid);
        setUnitCarry(uid, 0, 0);
        const planned = planUnitPath(uid, storage.x, storage.y, false, storage);
        if (planned !== null) {
          e[7777 + uid] = 1; // Sprint to Storage to grab weapon!
          state.tasks.set(uid, {
            kind: 'armForBattle',
            path: planned.path,
            stepProgress: planned.stepProgress,
            target: storage,
            battleX: fx,
            battleY: fy,
            owner,
            workTicks: 0,
          });
          armingCount++;
          continue;
        }
      }
      dispatchUnitToBattleFlag(uid, fx, fy, owner);
    }
    if (!overridePos) {
      state.message =
        armingCount > 0
          ? `⚔ Lệnh chiến đấu! ${armingCount} dân đang chạy vào kho lấy vũ khí mạnh nhất, toàn bộ ${adults.length} người tiến tới (${fx}, ${fy})!`
          : `⚔ Lệnh chiến đấu! Toàn bộ ${adults.length} dân làng đang xung phong tới (${fx}, ${fy})!`;
      render();
    }
  }
}

function rallyAllVillagers() {
  const ids = getVillagerIds();
  if (ids.length === 0) return;
  state.selectedUnits = new Set(ids);
  state.selectedUnit = ids[0];
  state.activeGroupId = 0;
  const cx = state.cursor.x;
  const cy = state.cursor.y;
  issueGroupMove(ids, cx, cy);
  state.message = `Tập hợp! Toàn bộ ${ids.length} dân làng đang tập trung về (${cx}, ${cy}).`;
  render();
}

function disbandGroupToWork() {
  const ids = getActiveSelectionIds();
  for (const id of ids) {
    const task = state.tasks.get(id);
    if (task && (task.kind === 'attackUnit' || task.kind === 'attackBuilding' || task.kind === 'move')) {
      state.tasks.delete(id);
      setUnitAnim(id, 8, 0);
    }
  }
  state.activeGroupId = 0;
  state.selectedUnits.clear();
  if (state.selectedUnit) state.selectedUnits.add(state.selectedUnit);
  state.message = 'Đã giải tán đội hình chiến đấu — dân làng trở lại trạng thái rảnh/làm việc.';
  render();
}

function distanceToRect(x, y, rect) {
  const dx = x < rect.x ? rect.x - x : x >= rect.x + rect.w ? x - (rect.x + rect.w - 1) : 0;
  const dy = y < rect.y ? rect.y - y : y >= rect.y + rect.h ? y - (rect.y + rect.h - 1) : 0;
  return Math.max(dx, dy);
}

function assignAttackTask(unitId, targetType, targetId, skipArmFetch = false) {
  const d = state.data;
  if (!d) return false;
  const e = d.entityData;
  if ((e[1919 + unitId] & 0xff) <= 0) return false;
  ensureUnitOutside(unitId);
  setUnitCarry(unitId, 0, 0);
  const info = getVillagerInfo(unitId);
  const owner = unitId > 50 ? 1 : 0;
  const isChildTarget = targetType === 'unit' && (e[1414 + targetId] & 0xff) < 12;

  // Authentic original behavior (b.java:2340-2370): if unarmed (wId===9) and not luring a child,
  // automatically SPRINT (e[7777] = 3) to Kho chứa to grab a weapon (defaulting to Stone / Đá ném) before attacking!
  if (!isChildTarget && !skipArmFetch && (e[6565 + unitId] & 0xff) === 9 && (e[1414 + unitId] & 0xff) >= 12) {
    let tx = info.x;
    let ty = info.y;
    if (targetType === 'unit') {
      tx = e[targetId] & 0xff;
      ty = e[101 + targetId] & 0xff;
    } else if (targetType === 'building') {
      const bld = getEnemyBuildings(owner).find((b) => b.bid === targetId);
      if (bld) {
        tx = bld.x;
        ty = bld.y;
      }
    }
    const pick = findBestStorageWeaponForUnit(unitId, owner);
    const storage = pick ? findNearestDropoff(info.x, info.y, owner) : null;
    if (pick && storage) {
      const toStorage = planUnitPath(unitId, storage.x, storage.y, false, storage);
      if (toStorage !== null) {
        e[7777 + unitId] = 3; // Sprint to Storage to grab weapon!
        state.tasks.set(unitId, {
          kind: 'armForBattle',
          path: toStorage.path,
          stepProgress: toStorage.stepProgress,
          target: storage,
          attackTargetType: targetType,
          attackTargetId: targetId,
          battleX: tx,
          battleY: ty,
          owner,
          workTicks: 0,
        });
        if (state.selectedUnit === unitId) state.activePath = toStorage.path;
        return true;
      }
    }
  }

  const range = isChildTarget ? 3 : getUnitRange(unitId);

  if (targetType === 'unit') {
    if ((e[1919 + targetId] & 0xff) <= 0) return false;
    const ex = e[targetId] & 0xff;
    const ey = e[101 + targetId] & 0xff;
    const dist = Math.max(Math.abs(ex - info.x), Math.abs(ey - info.y));
    const planned = dist <= range ? { path: [], stepProgress: 0 } : planUnitPath(unitId, ex, ey, true);
    if (planned === null) return false;
    e[7777 + unitId] = 3; // Sprint when charging to attack!
    state.tasks.set(unitId, {
      kind: 'attackUnit',
      path: planned.path,
      stepProgress: planned.stepProgress,
      targetId,
      target: null,
      workTicks: 0,
      cooldown: 0,
      lureTicks: 0,
    });
    if (state.selectedUnit === unitId) state.activePath = planned.path;
    return true;
  }

  if (targetType === 'building') {
    const bld = getEnemyBuildings(owner).find((b) => b.bid === targetId);
    if (!bld || bld.hp <= 0) return false;
    const dist = distanceToRect(info.x, info.y, bld);
    const planned = dist <= range ? { path: [], stepProgress: 0 } : planUnitPath(unitId, bld.x, bld.y, false, bld);
    if (planned === null) return false;
    e[7777 + unitId] = 3; // Sprint when charging to attack enemy building!
    state.tasks.set(unitId, {
      kind: 'attackBuilding',
      path: planned.path,
      stepProgress: planned.stepProgress,
      targetId,
      target: bld,
      workTicks: 0,
      cooldown: 0,
    });
    if (state.selectedUnit === unitId) state.activePath = planned.path;
    return true;
  }
  return false;
}

function assignEnemyAttack(enemyId, targetType, targetId) {
  const d = state.data;
  if (!d) return false;
  const e = d.entityData;
  if ((e[1919 + enemyId] & 0xff) <= 0) return false;
  const ex = e[enemyId] & 0xff;
  const ey = e[101 + enemyId] & 0xff;
  const isChildTarget = targetType === 'unit' && (e[1414 + targetId] & 0xff) < 12;
  const range = isChildTarget ? 3 : getUnitRange(enemyId);

  if (targetType === 'unit') {
    if ((e[1919 + targetId] & 0xff) <= 0) return false;
    if (isUnitInsideBuilding(d, targetId)) {
      if (isChildTarget) return false; // Children inside Nhà trẻ / buildings cannot be lured!
      const bid = e[4444 + targetId] & 0xff;
      if (bid >= 1 && bid <= 30) return assignEnemyAttack(enemyId, 'building', bid);
      return false;
    }
    const tx = e[targetId] & 0xff;
    const ty = e[101 + targetId] & 0xff;
    const dist = Math.max(Math.abs(tx - ex), Math.abs(ty - ey));
    const path = dist <= range ? [] : findPath(ex, ey, tx, ty, enemyId, true);
    if (path === null) return false;
    state.enemyTasks.set(enemyId, {
      kind: 'attackUnit',
      path,
      stepProgress: 0,
      targetId,
      target: null,
      workTicks: 0,
      cooldown: 0,
      lureTicks: 0,
    });
    return true;
  }

  if (targetType === 'building') {
    const bld = getPlayerBuildings().find((b) => b.bid === targetId);
    if (!bld || bld.hp <= 0) return false;
    const dist = distanceToRect(ex, ey, bld);
    const path = dist <= range ? [] : findPath(ex, ey, bld.x, bld.y, enemyId, false, bld);
    if (path === null) return false;
    state.enemyTasks.set(enemyId, {
      kind: 'attackBuilding',
      path,
      stepProgress: 0,
      targetId,
      target: bld,
      workTicks: 0,
      cooldown: 0,
    });
    return true;
  }
  return false;
}

function issueGroupMove(unitIds, tx, ty) {
  const d = state.data;
  if (!d || unitIds.length === 0) return 0;
  const offsets = [{ dx: 0, dy: 0 }];
  for (let r = 1; r <= 3; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) === r) offsets.push({ dx, dy });
      }
    }
  }
  const reserved = new Set();
  let dispatched = 0;
  for (const uid of unitIds) {
    ensureUnitOutside(uid);
    setUnitCarry(uid, 0, 0);
    const info = getVillagerInfo(uid);
    let assigned = false;
    for (const off of offsets) {
      const gx = tx + off.dx;
      const gy = ty + off.dy;
      const key = `${gx},${gy}`;
      if (reserved.has(key)) continue;
      if (!isWalkable(gx, gy, uid)) continue;
      const planned = planUnitPath(uid, gx, gy, false);
      if (planned !== null) {
        reserved.add(key);
        if (planned.path.length > 0) {
          state.tasks.set(uid, {
            kind: 'move',
            path: planned.path,
            stepProgress: planned.stepProgress,
            target: { x: gx, y: gy },
            workTicks: 0,
          });
        } else {
          state.tasks.delete(uid);
          setUnitAnim(uid, 8, 0);
        }
        if (state.selectedUnit === uid) state.activePath = planned.path;
        dispatched++;
        assigned = true;
        break;
      }
    }
    if (!assigned && state.selectedUnit === uid) state.activePath = [];
  }
  return dispatched;
}

function issueGroupAttack(unitIds, targetType, targetId) {
  let dispatched = 0;
  for (const uid of unitIds) {
    if (assignAttackTask(uid, targetType, targetId)) dispatched++;
  }
  return dispatched;
}

function attackNearestEnemy() {
  const d = state.data;
  const activeIds = getActiveSelectionIds();
  if (!d || activeIds.length === 0) return;
  const e = d.entityData;
  const lead = getVillagerInfo(activeIds[0]);
  const enemies = getEnemyIds();
  if (enemies.length > 0) {
    let bestEid = enemies[0];
    let bestDist = Infinity;
    for (const eid of enemies) {
      const dist = Math.abs((e[eid] & 0xff) - lead.x) + Math.abs((e[101 + eid] & 0xff) - lead.y);
      if (dist < bestDist) {
        bestDist = dist;
        bestEid = eid;
      }
    }
    const ex = e[bestEid] & 0xff;
    const ey = e[101 + bestEid] & 0xff;
    const dispatched = issueGroupAttack(activeIds, 'unit', bestEid);
    if (dispatched > 0) {
      state.cursor = { x: ex, y: ey };
      centerOnUnit(activeIds[0]);
      state.message = `${dispatched} chiến binh đang tiến quân tấn công địch gần nhất tại (${ex}, ${ey})!`;
      render();
      return;
    }
    // If enemy is beyond BFS limit (>1400 tiles), march step-by-step toward enemy direction
    const stepX = Math.max(1, Math.min(d.width - 2, lead.x + Math.sign(ex - lead.x) * Math.min(10, Math.abs(ex - lead.x))));
    const stepY = Math.max(1, Math.min(d.height - 2, lead.y + Math.sign(ey - lead.y) * Math.min(10, Math.abs(ey - lead.y))));
    const moved = issueGroupMove(activeIds, stepX, stepY);
    state.message = moved > 0 ? `${moved} chiến binh đang trinh sát tiến về phía địch (${ex}, ${ey})!` : `Địch đang ở (${ex}, ${ey}) — hãy dò đường quanh sông/rừng!`;
    render();
    return;
  }
  const eblds = getEnemyBuildings();
  if (eblds.length > 0) {
    const bld = eblds[0];
    const dispatched = issueGroupAttack(activeIds, 'building', bld.bid);
    state.message = dispatched > 0 ? `${dispatched} chiến binh đang tiến công ${bld.spec.name} của địch!` : `Nhà địch tại (${bld.x}, ${bld.y}).`;
    render();
    return;
  }
  state.message = 'Không còn quân địch hay nhà địch nào trên bản đồ!';
  render();
}

function getPlayerBuildings(owner = state.localTribe ?? 0) {
  if (!state.data) return [];
  const e = state.data.entityData;
  const start = owner === 1 ? 31 : 1;
  const end = owner === 1 ? 60 : 30;
  const list = [];
  for (let bid = start; bid <= end; bid++) {
    const hp = e[8505 + bid] & 0xff;
    if (hp <= 0) continue;
    const rawType = e[8749 + bid];
    const isScaffold = rawType >= 12 && rawType <= 19;
    const targetType = isScaffold ? e[9237 + bid] : rawType;
    const spec = getBuildingSpec(state.data, targetType);
    list.push({
      bid,
      bType: rawType,
      targetType,
      x: e[8383 + bid] & 0xff,
      y: e[8444 + bid] & 0xff,
      w: spec.width,
      h: spec.height,
      hp,
      maxHp: e[8566 + bid] & 0xff,
      underConstruction: isScaffold || e[8627 + bid] === 1,
      spec,
    });
  }
  return list;
}

function getWildAnimals() {
  if (!state.data) return [];
  const e = state.data.entityData;
  const list = [];
  for (let aid = 0; aid < 22; aid++) {
    const hp = e[9513 + aid] & 0xff;
    if (hp <= 0) continue;
    list.push({
      aid,
      occ: 101 + aid,
      x: e[9359 + aid] & 0xff,
      y: e[9381 + aid] & 0xff,
      hp,
    });
  }
  return list;
}

function getVillagerInfo(id) {
  const e = state.data.entityData;
  const insideBid = isUnitInsideBuilding(state.data, id) ? e[4444 + id] & 0xff : 0;
  const x = insideBid > 0 ? e[8383 + insideBid] & 0xff : e[id] & 0xff;
  const y = insideBid > 0 ? e[8444 + insideBid] & 0xff : e[101 + id] & 0xff;
  const hp = e[1919 + id] & 0xff;
  const maxHp = Math.max(1, e[6767 + id] & 0xff);
  const energy = Math.min(100, e[2020 + id] & 0xff);
  const satiety = Math.min(100, e[2121 + id] & 0xff);
  const minNeed = Math.min(satiety, energy);
  const moodIdx = minNeed >= 55 ? 0 : minNeed >= 35 ? 1 : minNeed >= 18 ? 2 : 3;
  const age = e[1414 + id] & 0xff;
  const sex = e[1515 + id] === 1 ? 'Nữ' : 'Nam';
  const weaponId = e[6565 + id] & 0xff;
  const weaponObj = WEAPONS.find((w) => w.id === weaponId) || null;
  const role = getVillagerName(state.data, id);
  return { id, role, x, y, hp, maxHp, energy, satiety, moodIdx, age, sex, weaponId, weaponName: weaponObj ? weaponObj.name : 'Tay không', insideBid };
}

function syncUnitJobBadge(unitId) {
  if (!state.data) return;
  const e = state.data.entityData;
  const task = state.tasks.get(unitId);
  let badge = 0; // 0 = Idle/None (mo[41][69] = 0)
  if (task) {
    if (task.kind === 'gather' || task.kind === 'return') {
      const t = task.kind === 'gather' ? task.target?.type : task.carrying?.type;
      const cs = task.kind === 'gather' ? task.target?.carrySprite : task.carrying?.carrySprite;
      if (t === 'wood') badge = 2;
      else if (t === 'stone') badge = 5;
      else if (t === 'fish') badge = 4;
      else if (t === 'bones') badge = 7;
      else if (t === 'food') badge = cs === 1 ? 3 : cs === 6 ? 6 : 1;
    } else if (task.kind === 'build') {
      badge = 12; // authentic builder badge (mo[41][56] = 12)
    } else if (task.kind === 'hunt') {
      badge = 3; // authentic meat/hunt badge (mo[41][12] = 3)
    } else if (task.kind === 'eat') {
      badge = 0; // Diners at Nhà ăn / Lều Tù trưởng have NO hunting/meat overhead badge (mo[41][70/71] = 0)
    } else if (task.kind === 'attackUnit' || task.kind === 'attackBuilding' || task.kind === 'armForBattle') {
      // Keep the villager's current overhead job badge intact while temporarily running to arm & fight!
      badge = e[2222 + unitId] & 0xff;
    } else if (task.kind === 'buildFetch') {
      badge = 12; // Builder fetching materials from Storage
    } else if (task.kind === 'blacksmithFetch' || task.kind === 'blacksmithDeliver') {
      badge = 8; // Blacksmith fetching materials or delivering forged weapon
    } else if (task.kind === 'chefFetch') {
      badge = 9; // Chef fetching fuel from Storage
    } else if (task.kind === 'workBuilding') {
      const bt = task.target?.targetType;
      const slotIdx = task.insideSlot?.slotIdx ?? (Array.isArray(task.preferredSlots) && !task.preferredSlots.includes(0) ? 1 : 0);
      if (bt === 4) badge = slotIdx === 0 ? 9 : 0; // Bếp: Chef=9, Diner=0
      else if (bt === 7) badge = slotIdx === 0 ? 10 : 0; // Sàn disco: DJ=10, Dancer=0
      else if (bt === 8) badge = 11; // Khu thánh địa: Shaman=11
      else if (bt === 5) badge = 15; // Khu tập ném: Throwing=15 (exact mo[41][72])
      else if (bt === 1) badge = 14; // Phòng tập: Melee=14 (exact mo[41][61])
      else if (bt === 0) badge = 8; // Kho vũ khí: Weaponsmith=8
      else if (bt === 9) badge = 13; // Trung tâm PIA=13
      else if (bt === 11) badge = 16; // Chòi canh=16
      else badge = 0;
    } else if (task.kind === 'fetchWeaponAndTrain') {
      badge = task.trainBld?.targetType === 5 ? 15 : 14;
    }
  }
  e[2222 + unitId] = badge;
}

function setUnitCarry(unitId, carrySpriteId, amount) {
  const e = state.data.entityData;
  e[3535 + unitId] = carrySpriteId;
  e[3636 + unitId] = amount;
}

function ensureUnitOutside(unitId) {
  if (isUnitInsideBuilding(state.data, unitId)) {
    exitBuildingSlot(state.data, unitId);
  }
}

function isWalkable(x, y, movingUnitId) {
  const d = state.data;
  if (!d || x < 0 || y < 0 || x >= d.width || y >= d.height) return false;
  const occ = d.occupancy[y][x];
  const isFriend =
    movingUnitId >= 1 && movingUnitId <= 50
      ? occ >= 1 && occ <= 50
      : movingUnitId >= 51 && movingUnitId <= 100
        ? occ >= 51 && occ <= 100
        : false;
  if (occ === 0 || occ === movingUnitId || isFriend) {
    const tile = d.terrain[y][x] & 0xff;
    return tile < 175;
  }
  return false;
}

function setUnitOnTile(d, unitId, x, y) {
  if (y < 0 || y >= d.height || x < 0 || x >= d.width) return;
  const curOcc = d.occupancy[y][x];
  // Never overwrite a building (-1..-60) or resource prop (-61..-127)
  if (curOcc >= 0) {
    d.occupancy[y][x] = unitId;
  }
}

function clearUnitTile(d, unitId, x, y) {
  clearUnitFromOccupancy(d, unitId);
  // If another living villager/warrior is still standing on (x, y), restore their occupancy so they never turn invisible!
  const e = d.entityData;
  for (let id = 1; id <= 100; id++) {
    if (id === unitId) continue;
    if ((e[1919 + id] & 0xff) <= 0) continue;
    if (isUnitInsideBuilding(d, id)) continue;
    if ((e[id] & 0xff) === x && (e[101 + id] & 0xff) === y) {
      if (d.occupancy[y]?.[x] === 0) d.occupancy[y][x] = id;
      break;
    }
  }
}

function findPath(sx, sy, tx, ty, movingUnitId, allowAdjacent = false, targetRect = null) {
  const d = state.data;
  if (!allowAdjacent && !targetRect && sx === tx && sy === ty) return [];
  const maxX = d.width;
  const maxY = d.height;
  const visited = new Uint8Array(maxX * maxY);
  const parent = new Int32Array(maxX * maxY).fill(-1);
  const queue = [];
  const startKey = sy * maxX + sx;
  visited[startKey] = 1;
  queue.push(startKey);

  function isGoal(cx, cy) {
    if (targetRect) {
      const dx = cx < targetRect.x ? targetRect.x - cx : cx >= targetRect.x + targetRect.w ? cx - (targetRect.x + targetRect.w - 1) : 0;
      const dy = cy < targetRect.y ? targetRect.y - cy : cy >= targetRect.y + targetRect.h ? cy - (targetRect.y + targetRect.h - 1) : 0;
      return Math.max(dx, dy) <= 1;
    }
    if (cx === tx && cy === ty) return true;
    if (allowAdjacent && Math.max(Math.abs(cx - tx), Math.abs(cy - ty)) === 1) return true;
    return false;
  }

  let goalKey = -1;
  let head = 0;

  while (head < queue.length && head < 4000) {
    const cur = queue[head++];
    const cx = cur % maxX;
    const cy = (cur - cx) / maxX;

    if (isGoal(cx, cy)) {
      goalKey = cur;
      break;
    }

    for (const step of DIRS) {
      const nx = cx + step.dx;
      const ny = cy + step.dy;
      if (nx < 0 || ny < 0 || nx >= maxX || ny >= maxY) continue;
      const nKey = ny * maxX + nx;
      if (visited[nKey]) continue;
      if (!isWalkable(nx, ny, movingUnitId)) continue;
      // Prevent diagonal corner-cutting across building corners, trees, cliffs, or water!
      if (step.dx !== 0 && step.dy !== 0) {
        if (!isWalkable(cx + step.dx, cy, movingUnitId) || !isWalkable(cx, cy + step.dy, movingUnitId)) {
          continue;
        }
      }
      visited[nKey] = 1;
      parent[nKey] = cur;
      queue.push(nKey);
    }
  }

  if (goalKey === -1) return null;
  const path = [];
  let k = goalKey;
  while (k !== startKey && k !== -1) {
    const x = k % maxX;
    const y = (k - x) / maxX;
    path.push({ x, y });
    k = parent[k];
  }
  path.reverse();
  return path;
}

/**
 * Smooth mid-step path planner (port of b.java:1320):
 * If the villager is currently mid-step toward `inFlight = curTask.path[0]` (`stepProgress > 0`),
 * finish that current step seamlessly and route from `inFlight` to the new destination so the
 * villager never snaps backward or stutters when the player clicks rapidly across the map!
 */
function getBuildingDoorTile(rect) {
  const d = state.data;
  if (!d || !rect) return null;
  const bw = rect.w ?? rect.width ?? 2;
  const bh = rect.h ?? rect.height ?? 2;
  const doorMidX = rect.x + Math.floor(bw / 2);
  const doorY = rect.y + bh;
  for (const off of [0, 1, -1, 2, -2]) {
    const nx = doorMidX + off;
    if (nx >= 1 && doorY >= 1 && nx < d.width - 1 && doorY < d.height - 1) {
      const occ = d.occupancy[doorY]?.[nx] ?? 0;
      const terr = d.terrain[doorY]?.[nx] & 0xff;
      if (terr < 175 && (occ === 0 || (occ >= 1 && occ <= 100))) {
        return { x: nx, y: doorY };
      }
    }
  }
  return null;
}

function getWeaponQueue(bid) {
  if (!state.weaponQueues.has(bid)) {
    state.weaponQueues.set(bid, [0, 0, 0, 0, 0, 0]);
  }
  return state.weaponQueues.get(bid);
}

function adjustWeaponQueue(bid, weaponId, delta, fromRemote = false) {
  const q = getWeaponQueue(bid);
  q[weaponId] = Math.max(0, Math.min(20, (q[weaponId] || 0) + delta));
  if (state.mpMode && state.localTribe === 1 && !fromRemote) {
    mpClient?.sendCommand({ kind: 'setWeaponQueue', bid, weaponId, delta });
  }
  if (!fromRemote && state.canvasMenu?.kind === 'building' && state.selectedBuildingBid === bid) {
    const bld = getPlayerBuildings().find((b) => b.bid === bid);
    const prevSel = state.canvasMenu.selected;
    const prevScroll = state.canvasMenu.scroll;
    if (bld) {
      openCanvasBuildingMenu(bld);
      if (state.canvasMenu) {
        state.canvasMenu.selected = Math.min(prevSel, state.canvasMenu.items.length - 1);
        state.canvasMenu.scroll = prevScroll;
        render();
      }
    }
  }
}

function planUnitPath(unitId, tx, ty, allowAdjacent = false, targetRect = null) {
  // Always take the shortest BFS path to the nearest walkable perimeter tile of targetRect (no forced detour to bottom edge!)
  const curTask = state.tasks.get(unitId);
  if (curTask && curTask.path?.length > 0 && curTask.stepProgress > 0) {
    const inFlight = curTask.path[0];
    const tail = findPath(inFlight.x, inFlight.y, tx, ty, unitId, allowAdjacent, targetRect);
    if (tail !== null) {
      return {
        path: [inFlight, ...tail],
        stepProgress: curTask.stepProgress,
      };
    }
  }
  const e = state.data.entityData;
  e[202 + unitId] = 0;
  e[303 + unitId] = 0;
  const info = getVillagerInfo(unitId);
  const path = findPath(info.x, info.y, tx, ty, unitId, allowAdjacent, targetRect);
  if (path === null) return null;
  return { path, stepProgress: 0 };
}

function directionFromDelta(dx, dy) {
  const found = DIRS.find((d) => d.dx === Math.sign(dx) && d.dy === Math.sign(dy));
  return found ? found.dir : 2;
}

function getViewportCols() {
  return Math.max(1, Math.floor(LOGICAL_WIDTH / CELL_WIDTH));
}

function getViewportRows() {
  const d = state.data;
  const topUi = d?.mapTopUi ?? 22;
  const botUi = d?.bottomUi ?? 22;
  return Math.max(1, Math.floor((LOGICAL_HEIGHT - topUi - botUi) / CELL_HEIGHT));
}

function clampCamera() {
  const d = state.data;
  if (!d) return;
  const maxCamX = Math.max(0, d.width - getViewportCols());
  const maxCamY = Math.max(0, d.height - getViewportRows());
  state.cameraX = Math.max(0, Math.min(maxCamX, state.cameraX));
  state.cameraY = Math.max(0, Math.min(maxCamY, state.cameraY));
}

function ensureCursorInView() {
  const d = state.data;
  if (!d) return;
  const cols = getViewportCols();
  const rows = getViewportRows();
  const marginX = 2;
  const marginY = 3;
  if (state.cursor.x < state.cameraX + marginX) state.cameraX = state.cursor.x - marginX;
  if (state.cursor.x >= state.cameraX + cols - marginX) state.cameraX = state.cursor.x - cols + marginX + 1;
  if (state.cursor.y < state.cameraY + marginY) state.cameraY = state.cursor.y - marginY;
  if (state.cursor.y >= state.cameraY + rows - marginY) state.cameraY = state.cursor.y - rows + marginY + 1;
  clampCamera();
}

function centerOnUnit(unitId) {
  const d = state.data;
  if (!d || !unitId) return;
  const info = getVillagerInfo(unitId);
  state.cursor = { x: info.x, y: info.y };
  state.cameraX = Math.round(info.x - getViewportCols() / 2);
  state.cameraY = Math.round(info.y - getViewportRows() / 2);
  clampCamera();
}

function setUnitAnim(unitId, animId, frame = 0) {
  const d = state.data;
  const fo = d?.entityFieldOffsets;
  if (!fo) return;
  const e = d.entityData;
  // Exact port of b.java:1749 & 3535:
  // - When carrying a resource (e[3535] !== 0), walking (0 or 7) uses anim 1 (carry walk) and standing (8) uses anim 9.
  // - When holding Đá ném (wId === 1) without sprinting, walking (0) uses anim 1 (stone walk) and standing (8) uses anim 9.
  // - When sprinting in combat (animId === 7), use anim 1 when holding Đá ném (wId === 1) so the stone in hand (partKind 8 = 1184) renders at 2x sprint speed!
  const isChild = (e[1414 + unitId] & 0xff) < 12;
  let resolvedAnim = animId;
  if (isChild) {
    // Children (age < 12) ONLY use child animations (6=walk, 14=idle, 44=death skeleton, 46=play, 100/101=kindergarten, 108=knockback fall)
    // so they can NEVER flash as an adult sprite!
    if (animId === 0 || animId === 1 || animId === 7) resolvedAnim = 6;
    else if (animId !== 6 && animId !== 14 && animId !== 44 && animId !== 46 && animId !== 100 && animId !== 101 && animId !== 108) {
      resolvedAnim = 14;
    }
  } else if ((e[3535 + unitId] & 0xff) !== 0 || (e[6565 + unitId] & 0xff) === 1) {
    if (animId === 0 || animId === 7) resolvedAnim = 1;
    else if (animId === 8) resolvedAnim = 9;
  }
  const maxFrames = Math.max(1, (d.byteSpriteTables?.[4]?.[resolvedAnim] ?? 1) & 0xff);
  e[fo[29] + unitId] = resolvedAnim;
  e[fo[30] + unitId] = ((frame % maxFrames) + maxFrames) % maxFrames;
}

function updateBuildPreview() {
  if (state.buildType === null || !state.data) {
    state.buildPreview = null;
    return;
  }
  const spec = getBuildingSpec(state.data, state.buildType);
  const bx = Math.max(1, Math.min(state.data.width - spec.width - 1, state.cursor.x));
  const by = Math.max(1, Math.min(state.data.height - spec.height - 1, state.cursor.y));
  state.buildPreview = {
    bType: state.buildType,
    x: bx,
    y: by,
    width: spec.width,
    height: spec.height,
    valid: canPlaceBuilding(state.data, state.buildType, bx, by),
    spec,
  };
}

function startBuildPlacement(bType) {
  const spec = getBuildingSpec(state.data, bType);
  state.buildType = bType;
  state.panelMode = 'main';
  updateBuildPreview();
  state.message = `Đặt ${spec.name} (${spec.width}×${spec.height}): click vùng ô màu xanh để đặt khung công trình, hoặc nhấn Esc để hủy.`;
  render();
}

function cancelBuildPlacement() {
  state.buildType = null;
  state.buildPreview = null;
}

function findNearestVillager(x, y, preferIdle = true) {
  const ids = getVillagerIds();
  let best = 0;
  let bestScore = Infinity;
  for (const id of ids) {
    const info = getVillagerInfo(id);
    const busyPenalty = preferIdle && state.tasks.has(id) ? 40 : 0;
    const score = Math.abs(info.x - x) + Math.abs(info.y - y) + busyPenalty;
    if (score < bestScore) {
      bestScore = score;
      best = id;
    }
  }
  return best;
}

function isWearingJobHat(unitId) {
  const job = state.data?.entityData?.[6464 + unitId] & 0xff;
  return job === 38 || job === 54 || job === 57 || job === 86;
}

function getMaxBuildersForSite(bid) {
  const d = state.data;
  if (!d) return 1;
  const scafType = d.entityData[8749 + bid] & 0xff;
  return Math.max(1, getScaffoldSlots(d, scafType).length);
}

function getAssignedBuilderCount(bid, excludeUnitId = 0) {
  const d = state.data;
  if (!d) return 0;
  const e = d.entityData;
  const seen = new Set();
  let cur = e[8993 + bid];
  let guard = 0;
  while (cur > 0 && guard++ < 16) {
    if (cur !== excludeUnitId) seen.add(cur);
    cur = e[4545 + cur];
  }
  for (const [uid, t] of state.tasks.entries()) {
    if (uid === excludeUnitId) continue;
    if ((t.kind === 'build' && t.target?.bid === bid) || (t.kind === 'buildFetch' && t.buildBld?.bid === bid)) {
      seen.add(uid);
      continue;
    }
    // Keep counting builders who temporarily stepped away to grab a weapon / defend / eat / rest
    // so the construction site does NOT falsely display "!" (abandoned)!
    if (
      t.kind === 'armForBattle' ||
      t.kind === 'attackUnit' ||
      t.kind === 'attackBuilding' ||
      t.kind === 'eat' ||
      t.kind === 'rest'
    ) {
      const saved = state.savedJobs.get(uid);
      if (saved?.kind === 'build' && saved.bid === bid && (e[1919 + uid] & 0xff) > 0) {
        seen.add(uid);
      }
    }
  }
  return seen.size;
}

function assignBuildTask(unitId, bld, carryWood = false) {
  const e = state.data.entityData;
  const owner = unitId > 50 ? 1 : 0;
  // Enforce authentic original builder capacity per building (e.g. Lều=1, Kho=2, Bếp=3, Phòng tập=4)
  const maxBuilders = getMaxBuildersForSite(bld.bid);
  const curBuilders = getAssignedBuilderCount(bld.bid, unitId);
  if (curBuilders >= maxBuilders) {
    if (owner === (state.localTribe ?? 0)) {
      state.message = `⚠️ ${bld.spec.name} chỉ cho phép tối đa ${maxBuilders} người xây cùng lúc!`;
    }
    return false;
  }
  state.savedJobs.set(unitId, { kind: 'build', bid: bld.bid });
  ensureUnitOutside(unitId);

  // Authentic original flow: builder walks to the construction scaffold frame first (puts on builder hard hat),
  // enters the scaffold, and THEN runs to Storage to fetch materials (or holds the missing-resource protest sign inside/outside)!
  const planned = planUnitPath(unitId, bld.x, bld.y, false, bld);
  if (planned === null) return false;
  const needHatAnim = (e[6464 + unitId] & 0xff) !== 38;
  setUnitCarry(unitId, 0, 0);
  state.tasks.set(unitId, {
    kind: 'build',
    path: planned.path,
    stepProgress: planned.stepProgress,
    target: bld,
    insideSlot: null,
    workTicks: 0,
    hatJob: 38, // 38 -> badge 12 -> hatCode 2 (builder hard hat)
    hatPutFrame: needHatAnim ? 0 : 14,
    carryWoodAfterHat: false,
  });
  if (state.selectedUnit === unitId) state.activePath = planned.path;
  return true;
}

function confirmBuildAtCursor(owner = state.localTribe ?? 0, overridePayload = null) {
  if (!overridePayload) {
    updateBuildPreview();
  }
  const bp = overridePayload
    ? {
        bType: overridePayload.bType,
        x: overridePayload.x,
        y: overridePayload.y,
        spec: getBuildingSpec(state.data, overridePayload.bType),
        width: getBuildingSpec(state.data, overridePayload.bType).width,
        height: getBuildingSpec(state.data, overridePayload.bType).height,
        valid: canPlaceBuilding(state.data, overridePayload.bType, overridePayload.x, overridePayload.y),
      }
    : state.buildPreview;
  if (!bp || !bp.valid) {
    if (!overridePayload) {
      state.message = 'Vị trí này bị vướng vật cản. Hãy di chuyển tới bãi đất/cỏ trống (màu xanh).';
      render();
    }
    return;
  }
  // If Guest in 1v1 Multiplayer, forward build command to Host
  if (state.mpMode && state.localTribe === 1 && !overridePayload) {
    mpClient?.sendCommand({
      kind: 'placeBuild',
      bType: bp.bType,
      x: bp.x,
      y: bp.y,
      unitIds: getActiveSelectionIds(),
    });
    cancelBuildPlacement();
    state.message = `Đã gửi lệnh dựng công trường ${bp.spec.name}!`;
    render();
    return;
  }

  const spec = bp.spec;
  // Authentic original game behavior: always allow placing the construction scaffold frame first!
  // Resources are NOT deducted or blocked upfront; builders walk to the scaffold, then go to Storage to fetch materials,
  // or hold up the missing-resource protest sign (anim 115/40 with carrySprite 2/3/4) if Storage is short!
  const bid = placeConstructionSite(state.data, bp.bType, bp.x, bp.y, owner);
  if (bid < 0) {
    if (!overridePayload) {
      state.message = 'Đã đạt giới hạn công trình trên bản đồ.';
      cancelBuildPlacement();
      render();
    }
    return;
  }
  const startHp = state.data.entityData[8505 + bid] & 0xff;
  const totalCost = Math.max(1, (spec.woodCost || 0) + (spec.stoneCost || 0) + (spec.toolsCost || 0));
  state.siteMaterials.set(bid, {
    wood: spec.woodCost || 0,
    stone: spec.stoneCost || 0,
    tools: spec.toolsCost || 0,
    deliveredWood: 0,
    deliveredStone: 0,
    deliveredTools: 0,
    totalCost,
    baseHp: startHp,
    owner,
  });

  // Dispatch selected or nearest ADULT villager of that tribe carrying wood to enter the scaffold and build
  const e = state.data.entityData;
  const selBuilder = overridePayload?.unitIds?.[0] || (owner === (state.localTribe ?? 0) ? state.selectedUnit : 0);
  const adultIds = getVillagerIds(owner).filter((id) => (e[1414 + id] & 0xff) >= 12);
  if (!overridePayload && selBuilder > 0 && (e[1414 + selBuilder] & 0xff) < 12 && adultIds.length === 0) {
    showWarning('⚠ Trẻ em (dưới 12 tuổi) chưa thể xây dựng công trình!');
    cancelBuildPlacement();
    return;
  }
  const builderId =
    (selBuilder > 0 && (e[1414 + selBuilder] & 0xff) >= 12 ? selBuilder : 0) || adultIds[0] || 0;
  const bldObj = { bid, x: bp.x, y: bp.y, w: bp.width, h: bp.height, spec };
  if (builderId && assignBuildTask(builderId, bldObj, true)) {
    if (!overridePayload) {
      const info = getVillagerInfo(builderId);
      state.message = `Đã dựng công trường ${spec.name}! ${info.role} đang vác gỗ vào công trường thi công.`;
    }
  } else if (!overridePayload) {
    state.message = `Đã dựng công trường ${spec.name} tại (${bp.x}, ${bp.y}). Click dân lớn rồi click công trường để xây.`;
  }
  if (!overridePayload) {
    cancelBuildPlacement();
    render();
  }
}

function selectUnit(unitId) {
  state.selectedUnit = unitId;
  state.selectedUnits = new Set([unitId]);
  state.activeGroupId = 0;
  const info = getVillagerInfo(unitId);
  state.cursor = { x: info.x, y: info.y };
  const task = state.tasks.get(unitId);
  state.activePath = task ? task.path : [];
  const taskNote = task ? ` · Nhiệm vụ: ${describeTask(task)}` : '';
  state.message = `Đã chọn ${info.role} (${info.sex}, ${info.age}t, HP ${info.hp}/${info.maxHp})${taskNote}.`;
  ensureCursorInView();
  render();
}

function describeTask(task) {
  if (!task) return 'Rảnh';
  if (task.kind === 'gather') return task.target.type === 'fish' ? 'Đánh cá' : `Thu thập ${task.target.label}`;
  if (task.kind === 'return') return `Vác ${task.carrying?.label || 'tài nguyên'} về trại`;
  if (task.kind === 'build') return `Xây ${task.target.spec.name}`;
  if (task.kind === 'hunt') return 'Săn thú hoang';
  if (task.kind === 'attackUnit') return 'Chiến đấu với địch';
  if (task.kind === 'attackBuilding') return `Phá hủy ${task.target?.spec?.name || 'nhà địch'}`;
  if (task.kind === 'rest') return 'Nghỉ ngủ trong Lều';
  if (task.kind === 'eat') return 'Đi ăn';
  if (task.kind === 'workBuilding') return `Làm việc tại ${task.target.spec.name}`;
  if (task.kind === 'courtship') {
    const st = task.pair?.stage;
    if (st === 'pickFlower') return 'Hái hoa tặng người thương';
    if (st === 'giveFlower') return 'Tặng hoa trước Lều';
    if (st === 'enterHut' || st === 'inHut') return 'Vào Lều sinh con';
    return 'Hẹn hò trước Lều';
  }
  return 'Di chuyển';
}

function cycleUnit() {
  const ids = getVillagerIds();
  if (ids.length === 0) return;
  const idx = ids.indexOf(state.selectedUnit);
  const nextId = ids[(idx + 1) % ids.length];
  selectUnit(nextId);
}

function classifyGatherable(x, y) {
  const d = state.data;
  if (!d || x < 0 || y < 0 || x >= d.width || y >= d.height) return null;
  const occ = d.occupancy[y][x];
  const tile = d.terrain[y][x] & 0xff;
  // Resource props (-61..-110) mapped strictly by mo[16][22+kind], mo[40], mo[41] from /a
  if (occ <= -61 && occ >= -110) {
    const idx = -occ - 61;
    const kind = d.entityData[9833 + idx];
    if (kind === 0) return null;
    const rem = d.entityData[9883 + idx] & 0xff;
    // Empty berry bushes / mushrooms (stage 0, rem === 0) cannot be picked until berries regrow (b.java:4660-4675)
    if (kind !== 5 && rem <= 0) return null;
    if (kind === 5) {
      return { x, y, type: 'fish', label: 'cá', carrySprite: 7, occ, propIdx: idx }; // job 13: fish school
    }
    if (kind === 4) {
      return { x, y, type: 'food', label: 'nấm', carrySprite: 6, occ, propIdx: idx }; // job 15: mushrooms/food
    }
    if (kind === 6) {
      return { x, y, type: 'food', label: 'thịt', carrySprite: 1, occ, propIdx: idx }; // job 12: meat carcass
    }
    if (kind === 7) {
      return { x, y, type: 'bones', label: 'xương', carrySprite: 4, occ, propIdx: idx }; // job 16: bones
    }
    // kind 1, 2, 3 -> job 10: berries/fruit bushes (mo[40][10]=5, mo[41][10]=1)
    return { x, y, type: 'food', label: 'hoa quả', carrySprite: 5, occ, propIdx: idx };
  }
  // Fallback if a mushroom/berry terrain tile (175..178) lost its occupancy prop link
  if (tile >= 175 && tile <= 178) {
    const e = d.entityData;
    for (let i = 0; i < 50; i++) {
      if ((e[9833 + i] & 0xff) > 0 && (e[9733 + i] & 0xff) === x && (e[9783 + i] & 0xff) === y) {
        const k = e[9833 + i] & 0xff;
        const rem = e[9883 + i] & 0xff;
        if (rem <= 0) return null;
        d.occupancy[y][x] = -61 - i;
        if (k === 4) return { x, y, type: 'food', label: 'nấm', carrySprite: 6, occ: -61 - i, propIdx: i };
        return { x, y, type: 'food', label: 'hoa quả', carrySprite: 5, occ: -61 - i, propIdx: i };
      }
    }
    if (tile === 178) return { x, y, type: 'food', label: 'nấm', carrySprite: 6, occ, tile };
    return { x, y, type: 'food', label: 'hoa quả', carrySprite: 5, occ, tile };
  }
  // occ === -125 is stone cliff/quarry (f.java:6229, mo[16][31]=14 -> carrySprite 3, badge 5)
  if (occ === -125) {
    return { x, y, type: 'stone', label: 'đá', carrySprite: 3, occ };
  }
  // occ === -127 is fishing shoreline adjacent to fish school kind===5 (f.java:6247-6250)
  if (occ === -127) {
    return { x, y, type: 'fish', label: 'cá', carrySprite: 7, occ };
  }
  // occ === -124 / tiles 180..231 are trees (f.java:6233, mo[16][30]=11 -> carrySprite 2, badge 2)
  if (occ === -124 || (tile >= 180 && tile <= 231)) {
    return { x, y, type: 'wood', label: 'gỗ', carrySprite: 2, tile };
  }
  return null;
}

function depleteGatherTarget(gt, amount) {
  const d = state.data;
  if (!d || !gt) return false;
  if (gt.type === 'wood') {
    const key = `${gt.x},${gt.y}`;
    const cur = state.treeWood.has(key) ? state.treeWood.get(key) : 20;
    const next = cur - amount;
    if (next <= 0) {
      state.treeWood.delete(key);
      d.terrain[gt.y][gt.x] = 0; // felled tree clears into grass tile!
      d.occupancy[gt.y][gt.x] = 0;
      addPopup(gt.x, gt.y, 'Đốn xong cây!', '#c5f285');
      return true;
    }
    state.treeWood.set(key, next);
    return false;
  }
  if (gt.propIdx !== undefined) {
    const e = d.entityData;
    const idx = gt.propIdx;
    const kind = e[9833 + idx] & 0xff;
    if (kind === 5) return false; // fish school in water is renewable
    const maxCap = (d.mapTableData?.[d.mapTableOffsets?.[110] + kind] & 0xff) || 20;
    const cur = e[9883 + idx] & 0xff;
    const next = Math.max(0, cur - amount);
    e[9883 + idx] = next;
    // Update visual stage e[9933+idx] (3=full fruit, 2=medium, 1=sparse, 0=bare green bush; b.java:4669)
    const ratio = next / Math.max(1, maxCap);
    e[9933 + idx] = next <= 0 ? 0 : ratio <= 0.35 ? 1 : ratio <= 0.7 ? 2 : 3;

    if (next <= 0) {
      if (kind === 6) {
        // Fresh meat carcass turns into skeleton bones (kind 7, b.java:4707-4709)
        e[9833 + idx] = 7;
        e[9883 + idx] = 15;
        e[9933 + idx] = 3;
      } else if (kind === 7) {
        // Skeleton bones disappear completely into grass (b.java:4702-4705)
        e[9833 + idx] = 0;
        d.occupancy[gt.y][gt.x] = 0;
        if ((d.terrain[gt.y][gt.x] & 0xff) >= 175) d.terrain[gt.y][gt.x] = 0;
      } else {
        // Berry bushes & mushrooms (kind 1..4) stay as bare patches (stage 0) on grass and regrow over time!
        addPopup(gt.x, gt.y, kind === 4 ? '🍄 Đám nấm đã hái hết!' : 'Bụi cây đã hết quả!', '#ffd84d');
      }
      return true;
    }
    return false;
  }
  return false; // water/stone cliff is renewable
}

function assignRestTask(unitId, hut) {
  ensureUnitOutside(unitId);
  setUnitCarry(unitId, 0, 0);
  const planned = planUnitPath(unitId, hut.x, hut.y, false, hut);
  if (planned === null) return false;
  state.tasks.set(unitId, {
    kind: 'rest',
    path: planned.path,
    stepProgress: planned.stepProgress,
    target: hut,
    insideSlot: null,
    workTicks: 0,
  });
  if (state.selectedUnit === unitId) state.activePath = planned.path;
  return true;
}

function findCourtshipMeetSpot(hut) {
  const d = state.data;
  if (!d || !hut) return null;
  const candidates = [
    [hut.x, hut.y + hut.h],
    [hut.x + 1, hut.y + hut.h],
    [hut.x - 1, hut.y + hut.h],
    [hut.x, hut.y + hut.h + 1],
    [hut.x + 1, hut.y + hut.h + 1],
    [hut.x, hut.y - 1],
    [hut.x - 2, hut.y + 1],
    [hut.x + hut.w, hut.y + 1],
  ];
  const isTileOpen = (tx, ty) => {
    if (tx < 1 || ty < 1 || tx >= d.width - 1 || ty >= d.height - 1) return false;
    const occ = d.occupancy[ty][tx];
    const terr = d.terrain[ty][tx] & 0xff;
    return terr < 175 && (occ === 0 || (occ >= 1 && occ <= 50));
  };
  for (const [mx, my] of candidates) {
    if (isTileOpen(mx, my) && isTileOpen(mx + 1, my)) {
      return { x1: mx, y1: my, x2: mx + 1, y2: my };
    }
  }
  return null;
}

function startCourtshipPair(force = false, preferredHut = null) {
  const d = state.data;
  if (!d) return false;
  if (state.population >= state.housingCap) return false;

  // Allow 1 active courtship pair at a time unless forced
  for (const t of state.tasks.values()) {
    if (t.kind === 'courtship') return false;
  }

  const e = d.entityData;
  const huts = preferredHut
    ? [preferredHut]
    : getPlayerBuildings().filter((b) => !b.underConstruction && b.targetType === 2);
  if (huts.length === 0) return false;

  // Pick a Lều with < 2 occupants and a clear meeting spot in front
  let chosenHut = null;
  let meetSpot = null;
  for (const hut of huts) {
    let occCount = 0;
    let cur = e[8993 + hut.bid];
    let g = 0;
    while (cur > 0 && g++ < 16) {
      occCount++;
      cur = e[4545 + cur];
    }
    if (occCount > 1) continue;
    const spot = findCourtshipMeetSpot(hut);
    if (spot) {
      chosenHut = hut;
      meetSpot = spot;
      break;
    }
  }
  if (!chosenHut || !meetSpot) return false;

  // Find eligible adult male (sex 0, age >= 12) and adult female (sex 1, age >= 12)
  const isEligible = (id) => {
    if ((e[1414 + id] & 0xff) < 12) return false;
    if ((e[1919 + id] & 0xff) <= 0) return false;
    const mood = e[505 + id] & 0xff;
    if (!force && mood < 50) return false;
    const task = state.tasks.get(id);
    if (!task) return true;
    // Allow interrupting passive gathering/move when forced, or idle/move naturally
    if (force && (task.kind === 'gather' || task.kind === 'move' || task.kind === 'workBuilding')) return true;
    return task.kind === 'move';
  };

  const ids = getVillagerIds();
  const males = ids.filter((id) => (e[1515 + id] & 0xff) === 0 && isEligible(id));
  const females = ids.filter((id) => (e[1515 + id] & 0xff) === 1 && isEligible(id));
  if (males.length === 0 || females.length === 0) return false;

  const maleId = males[Math.floor(Math.random() * males.length)];
  const femaleId = females[Math.floor(Math.random() * females.length)];

  ensureUnitOutside(maleId);
  ensureUnitOutside(femaleId);
  setUnitCarry(maleId, 0, 0);
  setUnitCarry(femaleId, 0, 0);

  const femalePlanned =
    planUnitPath(femaleId, meetSpot.x2, meetSpot.y2, false) ??
    planUnitPath(femaleId, meetSpot.x2, meetSpot.y2, true);
  if (femalePlanned === null) return false;

  const pair = {
    maleId,
    femaleId,
    hut: chosenHut,
    meetX1: meetSpot.x1,
    meetY1: meetSpot.y1,
    meetX2: meetSpot.x2,
    meetY2: meetSpot.y2,
    stage: 'pickFlower',
    pickTicks: 0,
    giftTicks: 0,
    hutTicks: 0,
    waitTicks: 0,
    maleReady: false,
    femaleReady: false,
    maleInHut: false,
    femaleInHut: false,
    born: false,
  };

  // Male bends down to pick a flower first (anim 155/156), then carries flower (carry=15) to meetX1, meetY1
  state.tasks.set(maleId, {
    kind: 'courtship',
    role: 'male',
    pair,
    path: [],
    stepProgress: 0,
    target: chosenHut,
    workTicks: 0,
  });

  // Female walks straight to meetX2, meetY2 right in front of the Lều and waits for him
  state.tasks.set(femaleId, {
    kind: 'courtship',
    role: 'female',
    pair,
    path: femalePlanned.path,
    stepProgress: femalePlanned.stepProgress,
    target: chosenHut,
    workTicks: 0,
  });

  const mName = getVillagerName(d, maleId);
  const fName = getVillagerName(d, femaleId);
  state.message = `🌸 ${mName} đang hái hoa để hẹn gặp ${fName} trước Lều!`;
  return true;
}

function assignEatTask(unitId, foodBuilding) {
  ensureUnitOutside(unitId);
  setUnitCarry(unitId, 0, 0);
  const planned = planUnitPath(unitId, foodBuilding.x, foodBuilding.y, false, foodBuilding);
  if (planned === null) return false;
  state.tasks.set(unitId, {
    kind: 'eat',
    path: planned.path,
    stepProgress: planned.stepProgress,
    target: foodBuilding,
    workTicks: 0,
  });
  if (state.selectedUnit === unitId) state.activePath = planned.path;
  return true;
}

function canKitchenServeFood(bid) {
  if (!state.data) return false;
  // Villagers can eat at Nhà ăn whenever cooked food is already on the table (e[8871+bid] > 0)
  // OR a Chef is actively cooking in slot 0!
  return (state.data.entityData[8871 + bid] & 0xff) > 0 || isBuildingSlot0ActiveInside(bid);
}

function isBuildingSlot0ActiveInside(bid) {
  if (!state.data) return false;
  const e = state.data.entityData;
  let u = e[8993 + bid];
  let g = 0;
  while (u > 0 && g++ < 16) {
    if (e[4646 + u] === 0 && (e[1919 + u] & 0xff) > 0) return true;
    u = e[4545 + u];
  }
  // Allow Chef briefly fetching fuel/ingredients from Storage for this Kitchen
  for (const t of state.tasks.values()) {
    if (t.kind === 'chefFetch' && t.kitchen?.bid === bid) return true;
  }
  return false;
}

function isBuildingSlot0Occupied(bid) {
  if (!state.data) return false;
  const e = state.data.entityData;
  let u = e[8993 + bid];
  let g = 0;
  while (u > 0 && g++ < 16) {
    if (e[4646 + u] === 0 && (e[1919 + u] & 0xff) > 0) return true;
    u = e[4545 + u];
  }
  // Also count slot-0 workers who are walking to slot 0, fetching materials/ingredients, or temporarily on break/defending!
  for (const [uid, t] of state.tasks.entries()) {
    if ((e[1919 + uid] & 0xff) <= 0) continue;
    if (t.kind === 'workBuilding' && t.target?.bid === bid && !t.insideSlot) {
      if (!Array.isArray(t.preferredSlots) || t.preferredSlots.includes(0)) return true;
    }
    if (t.kind === 'chefFetch' && t.kitchen?.bid === bid) return true;
    if ((t.kind === 'blacksmithFetch' || t.kind === 'blacksmithDeliver') && t.workshop?.bid === bid) return true;
    if (
      t.kind === 'armForBattle' ||
      t.kind === 'attackUnit' ||
      t.kind === 'attackBuilding' ||
      t.kind === 'eat' ||
      t.kind === 'rest'
    ) {
      const saved = state.savedJobs.get(uid);
      if (saved?.kind === 'workBuilding' && saved.bid === bid) {
        if (!Array.isArray(saved.preferredSlots) || saved.preferredSlots.includes(0)) return true;
      }
    }
  }
  return false;
}

function assignTrainOrFetchWeapon(unitId, bld, owner = state.localTribe ?? 0, silent = false) {
  const d = state.data;
  if (!d) return false;
  const e = d.entityData;
  const curWeapon = e[6565 + unitId] & 0xff;
  const isThrowing = bld.targetType === 5;
  // Strongest -> weakest weapon IDs per combat style:
  // Throwing: 5=Rìu nhỏ (+14), 2=Giáo (+9), 1=Đá ném (+6)
  // Melee:    4=Chùy xương (+12), 3=Búa đá (+11), 0=Dùi cui (+5)
  const matchingOrder = isThrowing ? [5, 2, 1] : [4, 3, 0];
  const hasMatchingWeapon = matchingOrder.includes(curWeapon);
  const holdingWrongType = curWeapon !== 9 && !hasMatchingWeapon;

  // Already holding a matching weapon for this training hall -> go directly into training!
  if (hasMatchingWeapon) {
    return assignWorkAtBuilding(unitId, bld);
  }
  const r = d.resources?.[owner];
  const storage = findNearestDropoff(e[unitId] & 0xff, e[101 + unitId] & 0xff, owner);

  // Check if Storage has any matching weapon (picking the STRONGEST available in stock!)
  let craftedWId = -1;
  if (r) {
    for (const wid of matchingOrder) {
      if ((r[5 + wid] || 0) > 0) {
        craftedWId = wid;
        break;
      }
    }
  }
  if (craftedWId >= 0) {
    if (!storage) {
      if (holdingWrongType && curWeapon < 6) {
        r[5 + curWeapon] = Math.min(35, (r[5 + curWeapon] || 0) + 1);
      }
      r[5 + craftedWId] = Math.max(0, (r[5 + craftedWId] || 0) - 1);
      e[6565 + unitId] = craftedWId;
      return assignWorkAtBuilding(unitId, bld);
    }
    ensureUnitOutside(unitId);
    setUnitCarry(unitId, 0, 0);
    const planned = planUnitPath(unitId, storage.x, storage.y, false, storage);
    if (planned === null) return false;
    state.tasks.set(unitId, {
      kind: 'fetchWeaponAndTrain',
      path: planned.path,
      stepProgress: planned.stepProgress,
      target: storage,
      trainBld: bld,
      weaponId: craftedWId,
      fromStock: true,
      swapOldWeapon: holdingWrongType,
      owner,
      workTicks: 0,
    });
    if (state.selectedUnit === unitId) state.activePath = planned.path;
    if (!silent) {
      const info = getVillagerInfo(unitId);
      const wName = WEAPONS[craftedWId]?.name || 'Vũ khí';
      state.message = holdingWrongType
        ? `${info.role} đang vào kho đổi sang ${wName} mạnh nhất rồi vào ${bld.spec.name}!`
        : `${info.role} đang vào kho lấy ${wName} trước khi vào ${bld.spec.name}!`;
    }
    return true;
  }

  // If currently holding a weapon of the WRONG combat style (e.g. holding throwing weapon when entering
  // Phòng tập đánh) and Storage has NO matching weapon -> do NOTHING!
  if (holdingWrongType) {
    if (!silent) {
      const info = getVillagerInfo(unitId);
      showWarning(
        isThrowing
          ? `⚠ Kho chưa có vũ khí ném (Đá ném / Giáo / Rìu nhỏ) để đổi cho ${info.role}!`
          : `⚠ Kho chưa có vũ khí đánh (Dùi cui / Búa đá / Chùy xương) để đổi cho ${info.role}!`
      );
    }
    return false;
  }

  // Unarmed: if tribe disabled raw Stone/Wood weapons, enter training unarmed; otherwise take 1 Stone/Wood from Storage
  if (state.tribeUseRawWeapon[owner] === false) {
    return assignWorkAtBuilding(unitId, bld);
  }
  const needResIdx = isThrowing ? 2 : 1; // 2=Stone, 1=Wood
  const curRes = owner === (state.localTribe ?? 0) ? (isThrowing ? state.stone : state.wood) : (r?.[needResIdx] || 0);
  if (curRes < 1) {
    if (!silent) {
      showWarning(
        isThrowing
          ? '⚠ Cần ít nhất 1 Đá trong kho để lấy Đá ném vào Khu tập ném!'
          : '⚠ Cần ít nhất 1 Gỗ trong kho để lấy Dùi cui vào Phòng tập!'
      );
    }
    return false;
  }
  if (!storage) {
    // Fallback equip directly if no storage building exists
    if (owner === (state.localTribe ?? 0)) {
      if (isThrowing) state.stone -= 1;
      else state.wood -= 1;
      syncResourcesToData(owner);
    } else if (r) {
      r[needResIdx] = Math.max(0, (r[needResIdx] || 0) - 1);
    }
    e[6565 + unitId] = isThrowing ? 1 : 0;
    return assignWorkAtBuilding(unitId, bld);
  }
  ensureUnitOutside(unitId);
  setUnitCarry(unitId, 0, 0);
  const planned = planUnitPath(unitId, storage.x, storage.y, false, storage);
  if (planned === null) return false;
  state.tasks.set(unitId, {
    kind: 'fetchWeaponAndTrain',
    path: planned.path,
    stepProgress: planned.stepProgress,
    target: storage,
    trainBld: bld,
    weaponId: isThrowing ? 1 : 0,
    resType: isThrowing ? 'stone' : 'wood',
    owner,
    workTicks: 0,
  });
  if (state.selectedUnit === unitId) state.activePath = planned.path;
  if (!silent) {
    const info = getVillagerInfo(unitId);
    state.message = isThrowing
      ? `${info.role} đang vào kho lấy 1 Đá làm Đá ném trước khi vào Khu tập ném!`
      : `${info.role} đang vào kho lấy 1 Gỗ làm Dùi cui trước khi vào Phòng tập!`;
  }
  return true;
}

function assignWorkAtBuilding(unitId, bld, preferredSlots = null) {
  ensureUnitOutside(unitId);
  setUnitCarry(unitId, 0, 0);
  const planned = planUnitPath(unitId, bld.x, bld.y, false, bld);
  if (planned === null) return false;
  const bt = bld.targetType;
  const isGuestOnly = Array.isArray(preferredSlots) && !preferredSlots.includes(0);
  // Check if slot 0 is already occupied (so 2nd+ visitor to Bếp/Disco doesn't wear the Chef/DJ hat)
  let slot0Taken = false;
  if (state.data) {
    const e = state.data.entityData;
    let cur = e[8993 + bld.bid];
    let g = 0;
    while (cur > 0 && g++ < 16) {
      if (e[4646 + cur] === 0 && cur !== unitId) {
        slot0Taken = true;
        break;
      }
      cur = e[4545 + cur];
    }
  }
  // Authentic job hats: 4=Bếp (54 Chef hat), 7=Sàn Disco (86 DJ hat), 8=Khu thánh địa (57 Shaman hat)
  const hatJob = !isGuestOnly && !slot0Taken ? (bt === 4 ? 54 : bt === 7 ? 86 : bt === 8 ? 57 : 69) : 69;
  const isBreakVisit = (bt === 4 || bt === 7) && (isGuestOnly || slot0Taken);
  if (!isBreakVisit) {
    state.savedJobs.set(unitId, { kind: 'workBuilding', bid: bld.bid, preferredSlots });
  }
  const curHat = state.data.entityData[6464 + unitId] & 0xff;
  const needPutHat = hatJob !== 69 && curHat !== hatJob;
  const needRemoveHat = hatJob === 69 && isWearingJobHat(unitId);
  state.tasks.set(unitId, {
    kind: 'workBuilding',
    path: planned.path,
    stepProgress: planned.stepProgress,
    target: bld,
    insideSlot: null,
    preferredSlots,
    workTicks: 0,
    hatJob,
    hatPutFrame: needPutHat ? 0 : 14,
    hatRemoveFrame: needRemoveHat ? 0 : 7,
  });
  if (state.selectedUnit === unitId) state.activePath = planned.path;
  return true;
}

function craftAndEquipWeapon(weapon) {
  if (!state.selectedUnit) {
    state.message = 'Hãy chọn một dân làng trước để trang bị vũ khí!';
    render();
    return;
  }
  if (state.wood < weapon.wood || state.stone < weapon.stone || state.tools < weapon.bones) {
    state.message = `Cần 🪵${weapon.wood} 🪨${weapon.stone} 🦴${weapon.bones} để chế tạo ${weapon.name}.`;
    render();
    return;
  }
  state.wood -= weapon.wood;
  state.stone -= weapon.stone;
  state.tools -= weapon.bones;
  if (state.data?.resources?.[0]) {
    const slot = 5 + (weapon.id % 6);
    state.data.resources[0][slot] = Math.min(35, (state.data.resources[0][slot] || 0) + 1);
  }
  state.data.entityData[6565 + state.selectedUnit] = weapon.id;
  syncResourcesToData();
  const info = getVillagerInfo(state.selectedUnit);
  addPopup(info.x, info.y, `Trang bị ${weapon.name}!`, '#ffd84d');
  state.message = `${info.role} đã nhận vũ khí mới: ${weapon.name} (sức đánh +${weapon.atk})!`;
  render();
}

function applyShamanSpellEffect(spell, bld) {
  const e = state.data.entityData;
  const ids = getVillagerIds();
  if (spell.id === 'heal') {
    for (const id of ids) {
      e[1919 + id] = e[6767 + id];
      e[2222 + id] = 0;
    }
    state.message = '✨ Pháp sư hoàn tất Chữa vết thương / Giải độc: toàn bộ bộ lạc đã hồi đầy máu!';
  } else if (spell.id === 'shield') {
    for (const id of ids) {
      const nextMax = Math.min(120, (e[6767 + id] & 0xff) + 10);
      e[6767 + id] = nextMax;
      e[1919 + id] = Math.min(nextMax, (e[1919 + id] & 0xff) + 10);
    }
    state.message = '✨ Pháp sư hoàn tất Phòng thủ: +10 HP tối đa cho toàn bộ bộ lạc!';
  } else if (spell.id === 'love') {
    for (const id of ids) {
      e[2222 + id] = 0;
      e[2020 + id] = 100;
      e[505 + id] = 100;
      e[3333 + id] = -1;
    }
    const started = startCourtshipPair(true);
    state.message = started
      ? '✨ Pháp sư hoàn tất Thuốc tình yêu: một cặp đôi đang hái hoa hẹn hò trước Lều!'
      : '✨ Pháp sư hoàn tất Thuốc tình yêu: tinh thần bộ lạc dâng cao 100%!';
  } else if (spell.id === 'plague') {
    let hit = 0;
    for (const eid of getEnemyIds()) {
      const curHp = e[1919 + eid] & 0xff;
      e[1919 + eid] = Math.max(1, Math.floor(curHp / 2));
      addPopup(e[eid] & 0xff, e[101 + eid] & 0xff, 'Bệnh dịch!', '#b79eff');
      hit++;
    }
    for (const a of getWildAnimals()) {
      e[9513 + a.aid] = Math.max(1, Math.floor(a.hp / 2));
      hit++;
    }
    state.message = `✨ Pháp sư hoàn tất Bệnh dịch: làm suy yếu ${hit} chiến binh địch & thú hoang trên bản đồ!`;
  }
  syncResourcesToData();
  if (bld) addPopup(bld.x + 1, bld.y, `✨ ${spell.name}!`, '#b79eff');
}

function castShamanSpell(spell, bldArg = null) {
  const bld = bldArg || getPlayerBuildings().find((b) => b.bid === state.selectedBuildingBid);
  if (!bld || bld.targetType !== 8) {
    showWarning('⚠ Hãy chọn Khu thánh địa để thi triển phép!');
    return;
  }
  if (!isBuildingSlot0Occupied(bld.bid)) {
    showWarning('⚠ Khu thánh địa chưa có Pháp sư! Hãy cử dân làng vào hành lễ trước.');
    return;
  }
  const activeRitual = state.shrineRituals.get(bld.bid);
  if (activeRitual) {
    state.message = `🥁 Pháp sư đang múa trống thi triển phép ${activeRitual.spell.name}, vui lòng chờ xong!`;
    render();
    return;
  }
  if (state.tools < spell.bones) {
    showWarning(`⚠ Cần ${spell.bones} xương trong kho để thi triển phép ${spell.name}!`);
    return;
  }
  state.tools -= spell.bones;
  syncResourcesToData();
  // Queue active ritual so the Shaman wakes up from napping (anim 39) and performs the drum dance!
  state.shrineRituals.set(bld.bid, { spell, ticks: 0, duration: 45 });
  state.message = `🥁 Pháp sư bắt đầu múa trống thi triển phép ${spell.name}...`;
  render();
}

function performUpgradeBuilding(bld) {
  const d = state.data;
  const e = d.entityData;
  const maxLevel = getBuildingMaxLevel(d, bld.targetType);
  const level = e[9115 + bld.bid] & 0xff;
  if (maxLevel <= 1) {
    state.message = `${bld.spec.name} không có cấp nâng cấp trong game gốc.`;
    render();
    return;
  }
  if (level >= maxLevel) {
    state.message = `${bld.spec.name} đã đạt cấp tối đa (Cấp ${maxLevel}).`;
    render();
    return;
  }
  if (e[8627 + bld.bid] === 1 || state.upgradingBuildings.has(bld.bid)) {
    state.message = `${bld.spec.name} đang được nâng cấp — hãy cử thợ xây vào thi công!`;
    render();
    return;
  }
  const woodNeed = 15;
  const stoneNeed = 10;
  const owner = state.localTribe ?? 0;

  // Eject any non-builder occupants currently inside before upgrading begins
  const occupants = [];
  let cur = e[8993 + bld.bid];
  let g = 0;
  while (cur > 0 && g++ < 16) {
    occupants.push(cur);
    cur = e[4545 + cur];
  }
  for (const uid of occupants) {
    exitBuildingSlot(d, uid);
    state.tasks.delete(uid);
    setUnitAnim(uid, 8, 0);
  }

  // Authentic builder-driven upgrade: mark building as upgrading (e[8627]=1), DO NOT deduct resources upfront!
  // Builders will fetch wood & stone from Storage (up to 10/trip) and hammer until upgrade completes.
  const newMax = Math.min(240, (e[8566 + bld.bid] & 0xff) + 25);
  const startHp = Math.min(e[8505 + bld.bid] & 0xff, Math.max(10, newMax - 25));
  e[8566 + bld.bid] = newMax;
  e[8505 + bld.bid] = startHp;
  e[8627 + bld.bid] = 1;
  state.upgradingBuildings.set(bld.bid, { targetLevel: level + 1, targetType: bld.targetType });
  state.siteMaterials.set(bld.bid, {
    wood: woodNeed,
    stone: stoneNeed,
    tools: 0,
    deliveredWood: 0,
    deliveredStone: 0,
    deliveredTools: 0,
    totalCost: Math.max(1, woodNeed + stoneNeed),
    baseHp: startHp,
    owner,
  });

  // Automatically dispatch selected adult villager or nearest idle adult villager to start upgrading!
  const refreshed = getPlayerBuildings(owner).find((b) => b.bid === bld.bid) || bld;
  const selAdult =
    state.selectedUnit && (e[1414 + state.selectedUnit] & 0xff) >= 12 ? state.selectedUnit : 0;
  const builderId = selAdult || findNearestVillager(bld.x, bld.y, true);
  if (builderId) {
    assignBuildTask(builderId, refreshed, false);
  }

  state.message = `🔨 Đã đặt lệnh nâng cấp ${bld.spec.name} lên Cấp ${level + 1} (cần 🪵${woodNeed} 🪨${stoneNeed}) — thợ xây đang lấy nguyên liệu để thi công!`;
  render();
}

function performDemolishBuilding(bld) {
  if (bld.targetType === 3) {
    state.message = 'Không thể phá hủy Lều của Tù trưởng!';
    render();
    return;
  }
  const res = demolishBuilding(state.data, bld.bid);
  addDust(res.x, res.y, res.w, res.h);
  if (!res.isScaffold && res.spec.housingBonus > 0) {
    state.housingCap = Math.max(1, state.housingCap - res.spec.housingBonus);
  }
  const refundWood = Math.floor(res.spec.woodCost * 0.3);
  const refundStone = Math.floor(res.spec.stoneCost * 0.3);
  state.wood += refundWood;
  state.stone += refundStone;
  syncResourcesToData();
  for (const wid of res.workers) {
    setUnitAnim(wid, 8, 0);
    state.tasks.delete(wid);
  }
  state.selectedBuildingBid = 0;
  state.panelMode = 'main';
  state.message = `Đã phá hủy ${res.spec.name} (thu hồi 🪵${refundWood} 🪨${refundStone}).`;
  render();
}

function findNearestDropoff(x, y, owner = state.localTribe ?? 0) {
  const finished = getPlayerBuildings(owner).filter((b) => !b.underConstruction);
  // Once the tribe has built a Kho chứa (targetType === 6), ALL material fetches & resource dropoffs
  // MUST use Kho chứa instead of Lều của Tù trưởng (targetType === 3)!
  const dedicatedStorage = finished.filter((b) => b.targetType === 6);
  const chiefHut = finished.filter((b) => b.targetType === 3);
  const candidates = dedicatedStorage.length > 0 ? dedicatedStorage : chiefHut.length > 0 ? chiefHut : finished;
  if (candidates.length === 0) return null;
  let best = candidates[0];
  let bestDist = Infinity;
  for (const b of candidates) {
    const cx = b.x + Math.floor(b.w / 2);
    const cy = b.y + Math.floor(b.h / 2);
    const dist = Math.abs(cx - x) + Math.abs(cy - y);
    if (dist < bestDist) {
      bestDist = dist;
      best = b;
    }
  }
  return best;
}

function assignGatherTask(unitId, gatherTarget) {
  ensureUnitOutside(unitId);
  setUnitCarry(unitId, 0, 0);
  const planned = planUnitPath(unitId, gatherTarget.x, gatherTarget.y, true);
  if (planned === null) return false;
  state.savedJobs.set(unitId, {
    kind: 'gather',
    resourceType: gatherTarget.type,
    x: gatherTarget.x,
    y: gatherTarget.y,
  });
  state.tasks.set(unitId, {
    kind: 'gather',
    path: planned.path,
    stepProgress: planned.stepProgress,
    target: gatherTarget,
    workTicks: 0,
    carrying: null,
  });
  if (state.selectedUnit === unitId) state.activePath = planned.path;
  return true;
}

function resumeSavedJob(unitId) {
  const d = state.data;
  if (!d) return false;
  const saved = state.savedJobs.get(unitId);
  if (!saved) return false;
  const e = d.entityData;
  const owner = unitId > 50 ? 1 : 0;
  const ux = e[unitId] & 0xff;
  const uy = e[101 + unitId] & 0xff;

  if (saved.kind === 'gather') {
    const isRed = owner === 1;
    const node =
      classifyGatherable(saved.x, saved.y) ||
      findNearestGatherable(saved.x, saved.y, 18, saved.resourceType, isRed) ||
      findNearestGatherable(ux, uy, 22, saved.resourceType, isRed);
    if (node && assignGatherTask(unitId, node)) return true;
    state.savedJobs.delete(unitId);
    return false;
  }

  if (saved.kind === 'build') {
    const sites = getPlayerBuildings(owner).filter((b) => b.underConstruction);
    sites.sort((a, b) => {
      if (a.bid === saved.bid) return -1;
      if (b.bid === saved.bid) return 1;
      return Math.hypot(a.x - ux, a.y - uy) - Math.hypot(b.x - ux, b.y - uy);
    });
    for (const site of sites) {
      if (getAssignedBuilderCount(site.bid, unitId) < getMaxBuildersForSite(site.bid)) {
        if (assignBuildTask(unitId, site)) return true;
      }
    }
    state.savedJobs.delete(unitId);
    return false;
  }

  if (saved.kind === 'workBuilding') {
    const bld = getPlayerBuildings(owner).find((b) => !b.underConstruction && b.bid === saved.bid);
    if (bld) {
      // For training buildings (Phòng tập=1 -> e[1717], Khu tập ném=5 -> e[1616]), stop auto-resuming at max rank (9)
      if (bld.targetType === 1 && (e[1717 + unitId] & 0xff) >= 9) {
        state.savedJobs.delete(unitId);
        return false;
      }
      if (bld.targetType === 5 && (e[1616 + unitId] & 0xff) >= 9) {
        state.savedJobs.delete(unitId);
        return false;
      }
      if (assignWorkAtBuilding(unitId, bld, saved.preferredSlots)) return true;
    }
    state.savedJobs.delete(unitId);
    return false;
  }
  return false;
}

function syncTopCombatSkills(uid) {
  const e = state.data?.entityData;
  if (!e || !uid) return;
  // Authentic /a mo[126] & mo[127] combat skill IDs:
  // 14 = Melee (e[1717], bias 0), 15 = Throwing (e[1616], bias 0), 13 = Magic (e[7575], bias -1)
  const candidates = [
    { id: 14, val: e[1717 + uid] & 0xff },
    { id: 15, val: e[1616 + uid] & 0xff },
    { id: 13, val: Math.max(0, (e[7575 + uid] & 0xff) - 1) },
  ].sort((a, b) => b.val - a.val || a.id - b.id);
  e[2525 + uid] = candidates[0].id;
  e[2626 + uid] = candidates[1].id;
}

function assignHuntTask(unitId, animalOcc) {
  ensureUnitOutside(unitId);
  setUnitCarry(unitId, 0, 0);
  const aid = animalOcc - 101;
  const e = state.data.entityData;
  const ax = e[9359 + aid] & 0xff;
  const ay = e[9381 + aid] & 0xff;
  const planned = planUnitPath(unitId, ax, ay, true);
  if (planned === null) return false;
  state.tasks.set(unitId, {
    kind: 'hunt',
    path: planned.path,
    stepProgress: planned.stepProgress,
    target: { aid, occ: animalOcc, x: ax, y: ay },
    phase: 'attack',
    workTicks: 0,
  });
  if (state.selectedUnit === unitId) state.activePath = planned.path;
  return true;
}

function commandUnitTo(tx, ty, overrideIds = null, owner = state.localTribe ?? 0) {
  const d = state.data;
  const activeIds = overrideIds ? overrideIds.filter((id) => (d?.entityData?.[1919 + id] & 0xff) > 0) : getActiveSelectionIds();
  if (!d || activeIds.length === 0) return;

  // If Guest in 1v1 Multiplayer, forward command to Host!
  if (state.mpMode && state.localTribe === 1 && !overrideIds) {
    mpClient?.sendCommand({ kind: 'commandTo', tx, ty, unitIds: activeIds });
    return;
  }

  const unitId = activeIds[0];
  const occ = d.occupancy[ty]?.[tx] ?? 0;
  const isEnemyUnitOcc = owner === 1 ? occ >= 1 && occ <= 50 : occ >= 51 && occ <= 100;
  const isEnemyBldOcc = owner === 1 ? occ <= -1 && occ >= -30 : occ <= -31 && occ >= -60;
  const isOwnBldOcc = owner === 1 ? occ <= -31 && occ >= -60 : occ <= -1 && occ >= -30;
  const adultIds = activeIds.filter((id) => (d.entityData[1414 + id] & 0xff) >= 12);
  const childIds = activeIds.filter((id) => (d.entityData[1414 + id] & 0xff) < 12);

  // If player clicks a finished Nhà trẻ (bType 10) with any unit(s) selected, send child(ren) inside Nhà trẻ for safety!
  if (isOwnBldOcc) {
    const bid = -occ;
    const bld = getPlayerBuildings(owner).find((b) => b.bid === bid);
    if (bld && !bld.underConstruction && bld.targetType === 10) {
      const targets =
        childIds.length > 0
          ? childIds
          : getVillagerIds(owner).filter(
              (id) => (d.entityData[1414 + id] & 0xff) < 12 && !isUnitInsideBuilding(d, id)
            );
      let sent = 0;
      for (const cid of targets) {
        if (assignWorkAtBuilding(cid, bld)) sent++;
      }
      if (sent > 0 && !overrideIds) {
        state.message = `${sent > 1 ? `${sent} trẻ em` : getVillagerInfo(targets[0]).role} đang đi vào Nhà trẻ để được bảo vệ an toàn!`;
        render();
        return;
      }
      if (!overrideIds) {
        openCanvasBuildingMenu(bld);
      }
      return;
    }
  }

  // Children (age < 12) cannot build, work, gather, hunt, or fight — warn the player clearly!
  const isWorkOrCombatTarget =
    isEnemyUnitOcc ||
    isEnemyBldOcc ||
    isOwnBldOcc ||
    (occ >= 101 && occ <= 122) ||
    Boolean(classifyGatherable(tx, ty));
  if (isWorkOrCombatTarget && adultIds.length === 0) {
    if (!overrideIds) {
      showWarning('⚠ Trẻ em (dưới 12 tuổi) chưa thể xây nhà, lao động hay chiến đấu!');
    }
    return;
  }

  // Click an enemy warrior to attack with selected adult unit(s)
  if (isEnemyUnitOcc) {
    const dispatched = issueGroupAttack(adultIds, 'unit', occ);
    if (dispatched > 0) {
      if (!overrideIds) {
        state.message =
          dispatched > 1
            ? `${dispatched} chiến binh đang xung phong tấn công quân địch!`
            : `${getVillagerInfo(unitId).role} đang tấn công chiến binh địch!`;
        render();
      }
      return;
    }
    if (!overrideIds) {
      state.message = 'Không tìm được đường tiếp cận chiến binh địch.';
      render();
    }
    return;
  }

  // Click an enemy building to attack/raze with selected unit(s)
  if (isEnemyBldOcc) {
    const bid = -occ;
    const ebld = getEnemyBuildings(owner).find((b) => b.bid === bid);
    if (ebld) {
      const dispatched = issueGroupAttack(activeIds, 'building', bid);
      if (dispatched > 0) {
        if (!overrideIds) {
          state.message =
            dispatched > 1
              ? `${dispatched} chiến binh đang tấn công ${ebld.spec.name} của địch!`
              : `${getVillagerInfo(unitId).role} đang phá hủy ${ebld.spec.name} của địch!`;
          render();
        }
        return;
      }
      if (!overrideIds) {
        state.message = `Không tìm được đường tiếp cận ${ebld.spec.name} của địch.`;
        render();
      }
      return;
    }
  }

  // Click an own unfinished building to build, or a finished Lều to rest / Bếp to eat
  if (isOwnBldOcc) {
    const bid = -occ;
    const bld = getPlayerBuildings(owner).find((b) => b.bid === bid);
    if (bld && bld.underConstruction) {
      let builders = 0;
      for (const uid of activeIds) {
        if (assignBuildTask(uid, bld, true)) builders++;
      }
      if (builders > 0) {
        const info = getVillagerInfo(unitId);
        state.message =
          builders > 1
            ? `${builders} dân làng đang mang gỗ vào công trường xây ${bld.spec.name}.`
            : `${info.role} đang mang gỗ vào công trường xây ${bld.spec.name}.`;
        render();
        return;
      }
    } else if (bld && bld.targetType === 2) {
      let rested = 0;
      for (const uid of adultIds) {
        if (assignRestTask(uid, bld)) rested++;
      }
      if (rested > 0) {
        if (!overrideIds) {
          state.message =
            rested > 1
              ? `${rested} dân làng đang đi vào Lều nghỉ ngủ hồi sức.`
              : `${getVillagerInfo(adultIds[0]).role} đang đi vào Lều nghỉ ngủ hồi sức.`;
          render();
        }
        return;
      }
    } else if (bld && bld.targetType === 4) {
      // Bếp: 1st villager (only when slot 0 has NO Chef assigned) -> Chef cooking; 2nd+ villager -> Diner eating ONLY!
      let hasChef = isBuildingSlot0Occupied(bld.bid);
      let chefSent = 0;
      let dinersSent = 0;
      for (const uid of adultIds) {
        if (!hasChef) {
          if (assignWorkAtBuilding(uid, bld, [0])) {
            hasChef = true;
            chefSent++;
          }
        } else if (assignEatTask(uid, bld)) {
          dinersSent++;
        }
      }
      if (chefSent > 0 || dinersSent > 0) {
        if (!overrideIds) {
          state.message =
            chefSent > 0 && dinersSent > 0
              ? `🍳 Đã cử Đầu bếp vào nấu và ${dinersSent} dân làng vào Bếp dùng bữa!`
              : chefSent > 0
                ? `🍳 ${getVillagerInfo(adultIds[0]).role} đang vào Bếp làm Đầu bếp nấu ăn!`
                : `🍖 ${dinersSent > 1 ? dinersSent + ' dân làng' : getVillagerInfo(adultIds[0]).role} đang vào Bếp dùng bữa!`;
          render();
        }
        return;
      }
    } else if (bld && bld.targetType === 7) {
      // Sàn disco: 1st villager (if slot 0 empty) -> DJ playing music; 2nd+ villager -> Dancer relaxing!
      let slot0Busy = isBuildingSlot0Occupied(bld.bid);
      let djSent = 0;
      let dancersSent = 0;
      for (const uid of adultIds) {
        if (!slot0Busy) {
          if (assignWorkAtBuilding(uid, bld, [0])) {
            slot0Busy = true;
            djSent++;
          }
        } else {
          if (assignWorkAtBuilding(uid, bld, [1, 2, 3, 4, 5, 6])) {
            dancersSent++;
          }
        }
      }
      if (djSent > 0 || dancersSent > 0) {
        if (!overrideIds) {
          state.message =
            djSent > 0 && dancersSent > 0
              ? `🎵 Đã cử DJ lên bàn nhạc và ${dancersSent} dân làng vào Sàn disco giải trí!`
              : djSent > 0
                ? `🎵 ${getVillagerInfo(adultIds[0]).role} đang lên bàn DJ chơi nhạc!`
                : `💃 ${dancersSent > 1 ? dancersSent + ' dân làng' : getVillagerInfo(adultIds[0]).role} đang vào Sàn disco nhảy múa giải trí!`;
          render();
        }
        return;
      }
    } else if (bld && (bld.targetType === 1 || bld.targetType === 5)) {
      // Phòng tập (1) / Khu tập ném (5): check weapon compatibility, swap to strongest matching weapon in Storage, or do nothing if missing!
      let sent = 0;
      let outsideTried = 0;
      for (const uid of adultIds) {
        if ((d.entityData[4444 + uid] & 0xff) === bld.bid) continue;
        outsideTried++;
        if (assignTrainOrFetchWeapon(uid, bld, owner, Boolean(overrideIds))) sent++;
      }
      if (sent > 0 && !overrideIds) {
        render();
      } else if (outsideTried === 0 && !overrideIds) {
        openCanvasBuildingMenu(bld);
      }
      return;
    } else if (bld && [0, 8, 9, 11].includes(bld.targetType)) {
      // Kho vũ khí (bType 0) and Khu thánh địa (bType 8) only have 1 staff slot (slot 0) —
      // if already staffed, open the weapon forge / Shaman spell menu directly!
      if ((bld.targetType === 0 || bld.targetType === 8) && isBuildingSlot0Occupied(bld.bid)) {
        if (!overrideIds) {
          openCanvasBuildingMenu(bld);
        }
        return;
      }
      let sent = 0;
      for (const uid of adultIds) {
        if ((bld.targetType === 0 || bld.targetType === 8) && sent >= 1) break;
        if (assignWorkAtBuilding(uid, bld)) sent++;
      }
      if (sent > 0) {
        if (!overrideIds) {
          state.message =
            sent > 1
              ? `${sent} dân làng đang đi tới làm việc tại ${bld.spec.name}.`
              : `${getVillagerInfo(adultIds[0]).role} đang đi tới làm việc tại ${bld.spec.name}.`;
          render();
        }
        return;
      }
    } else if (bld) {
      // Walk to the nearest walkable tile adjacent to the building without entering an interior slot
      const planned = planUnitPath(unitId, bld.x, bld.y, false, bld);
      if (planned && planned.path.length > 0) {
        ensureUnitOutside(unitId);
        setUnitCarry(unitId, 0, 0);
        state.tasks.set(unitId, {
          kind: 'move',
          path: planned.path,
          stepProgress: planned.stepProgress,
          target: { x: bld.x, y: bld.y },
          workTicks: 0,
        });
        state.activePath = planned.path;
        state.message = `${getVillagerInfo(unitId).role} đang đi tới cạnh ${bld.spec.name}.`;
        render();
        return;
      }
    }
  }

  // Click a wild animal to hunt
  if (occ >= 101 && occ <= 122) {
    let hunters = 0;
    for (const uid of activeIds) {
      if (assignHuntTask(uid, occ)) hunters++;
    }
    if (hunters > 0) {
      const info = getVillagerInfo(unitId);
      state.message = hunters > 1 ? `${hunters} thợ săn đang đi săn thú hoang!` : `${info.role} đang đi săn thú hoang!`;
      render();
      return;
    }
  }

  // Click a depleted berry bush / mushroom patch -> inform the player it is regrowing
  if (occ <= -61 && occ >= -110) {
    const pIdx = -occ - 61;
    const pKind = d.entityData[9833 + pIdx] & 0xff;
    const pRem = d.entityData[9883 + pIdx] & 0xff;
    if (pKind >= 1 && pKind <= 4 && pRem <= 0) {
      if (!overrideIds) {
        state.message =
          pKind === 4
            ? '🍄 Đám nấm này đã hái hết, đang chờ mọc lại!'
            : '🫐 Bụi cây này đã hái hết quả, đang chờ mọc lại!';
        render();
      }
      return;
    }
  }

  // Click a tree or resource item to gather & haul back to camp
  const gatherTarget = classifyGatherable(tx, ty);
  if (gatherTarget) {
    let gatherers = 0;
    for (const uid of activeIds) {
      if (assignGatherTask(uid, gatherTarget)) gatherers++;
    }
    if (gatherers === 0) {
      state.message = `Không tìm được đường tới nguồn ${gatherTarget.label} tại (${tx}, ${ty}).`;
      render();
      return;
    }
    const info = getVillagerInfo(unitId);
    const verb =
      gatherTarget.label === 'nấm'
        ? 'hái nấm'
        : gatherTarget.label === 'hoa quả'
          ? 'hái quả'
          : gatherTarget.label === 'cá'
            ? 'câu cá'
            : gatherTarget.label === 'đá'
              ? 'đập đá'
              : `chặt/thu thập ${gatherTarget.label}`;
    state.message =
      gatherers > 1
        ? `${gatherers} dân làng đang đi ${verb} và vác về trại.`
        : `${info.role} đang đi ${verb} và vác về trại.`;
    render();
    return;
  }

  // Multi-unit group formation move
  if (activeIds.length > 1) {
    const moved = issueGroupMove(activeIds, tx, ty);
    if (moved > 0) {
      state.message = `Đội hình ${moved} chiến binh đang hành quân tới (${tx}, ${ty}).`;
      render();
      return;
    }
    state.message = `Không có đường hành quân tới (${tx}, ${ty}).`;
    render();
    return;
  }

  state.savedJobs.delete(unitId);
  ensureUnitOutside(unitId);
  setUnitCarry(unitId, 0, 0);
  const info = getVillagerInfo(unitId);
  let destX = tx;
  let destY = ty;
  if (!isWalkable(destX, destY, unitId)) {
    // If clicked tile is blocked by a cliff edge, water bank, or obstacle, snap to the nearest walkable neighbor tile!
    let foundWalkable = false;
    for (let r = 1; r <= 2 && !foundWalkable; r++) {
      for (let dy = -r; dy <= r && !foundWalkable; dy++) {
        for (let dx = -r; dx <= r && !foundWalkable; dx++) {
          if (isWalkable(tx + dx, ty + dy, unitId)) {
            destX = tx + dx;
            destY = ty + dy;
            foundWalkable = true;
          }
        }
      }
    }
    if (!foundWalkable) {
      state.message = `Ô (${tx}, ${ty}) bị chặn. Hãy chọn bãi đất trống, cây, thú hoang, quân địch hoặc công trình.`;
      render();
      return;
    }
  }

  const planned = planUnitPath(unitId, destX, destY, false);
  if (!planned || planned.path.length === 0) {
    state.message = planned ? `${info.role} đã ở vị trí (${destX}, ${destY}).` : `Không có đường đi tới (${destX}, ${destY}).`;
    render();
    return;
  }

  state.tasks.set(unitId, {
    kind: 'move',
    path: planned.path,
    stepProgress: planned.stepProgress,
    target: { x: destX, y: destY },
    workTicks: 0,
  });
  state.activePath = planned.path;
  state.message = `${info.role} đang di chuyển tới (${destX}, ${destY}) (${planned.path.length} bước).`;
  render();
}

function findNearestGatherable(x, y, radius = 9, preferType = null, ignoreFog = false) {
  let best = null;
  let bestScore = Infinity;
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const gx = x + dx;
      const gy = y + dy;
      if (gx < 0 || gy < 0 || gx >= state.data.width || gy >= state.data.height) continue;
      if (!ignoreFog && getFogState(state.data, gx, gy) === 2) continue;
      const target = classifyGatherable(gx, gy);
      if (!target) continue;
      const bonus = preferType && target.type === preferType ? -5 : 0;
      const score = Math.abs(dx) + Math.abs(dy) + bonus;
      if (score < bestScore) {
        bestScore = score;
        best = target;
      }
    }
  }
  return best;
}

function gatherNearest() {
  if (!state.data) return;
  if (!state.selectedUnit) {
    const ids = getVillagerIds();
    if (ids.length) state.selectedUnit = ids[0];
    else return;
  }
  const info = getVillagerInfo(state.selectedUnit);
  const best = findNearestGatherable(info.x, info.y, 10);
  if (!best) {
    state.message = 'Không thấy cây hoặc tài nguyên gần đây. Hãy dẫn dân làng khám phá thêm bản đồ.';
    render();
    return;
  }
  state.cursor = { x: best.x, y: best.y };
  commandUnitTo(best.x, best.y);
}

function stepProjectiles() {
  if (state.projectiles.length === 0) return false;
  let changed = false;
  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    const p = state.projectiles[i];
    p.age++;
    if (p.age >= p.duration) {
      state.projectiles.splice(i, 1);
      if (p.targetType === 'unit') {
        applyUnitDamage(p.attackerId, p.targetId, p.dmg);
      } else if (p.targetType === 'building') {
        applyBuildingDamage(p.attackerId, p.targetId, p.dmg);
      }
      changed = true;
    }
  }
  return changed;
}

function stepAiCommander() {
  const d = state.data;
  if (!d || !state.aiMode) return false;
  const e = d.entityData;
  const redUnits = getVillagerIds(1);
  if (redUnits.length === 0) return false;
  const redBlds = getPlayerBuildings(1);
  const blueUnits = getVillagerIds(0);
  const blueBlds = getPlayerBuildings(0);
  if (blueUnits.length === 0 && blueBlds.length === 0) return false;

  const diff = state.aiDifficulty || 'normal';
  const r1 = d.resources?.[1];
  // Gentle difficulty-based economy assist on Hard
  if (diff === 'hard' && r1 && state.animTick % 110 === 0) {
    r1[0] = Math.min(99, (r1[0] || 0) + 2);
    r1[1] = Math.min(99, (r1[1] || 0) + 2);
    r1[2] = Math.min(99, (r1[2] || 0) + 2);
  }

  // Locate Red home center (Chief's Hut / Storage / first building)
  const home = redBlds.find((b) => b.targetType === 3) || redBlds.find((b) => b.targetType === 6) || redBlds[0];
  const homeX = home ? home.x + Math.floor(home.w / 2) : (e[redUnits[0]] & 0xff);
  const homeY = home ? home.y + Math.floor(home.h / 2) : (e[101 + redUnits[0]] & 0xff);
  const adults = redUnits.filter((id) => (e[1414 + id] & 0xff) >= 12);
  let changed = false;

  // 1. Base Defense: if any Blue unit is near a Red building, intercept with idle/gathering Red adults!
  let intruder = null;
  for (const bu of blueUnits) {
    if (isUnitInsideBuilding(d, bu)) continue;
    const bx = e[bu] & 0xff;
    const by = e[101 + bu] & 0xff;
    if (redBlds.some((rb) => Math.hypot(rb.x - bx, rb.y - by) <= 10)) {
      intruder = bu;
      break;
    }
  }
  if (intruder) {
    let defenders = 0;
    for (const id of adults) {
      const t = state.tasks.get(id);
      if (t && (t.kind === 'attackUnit' || t.kind === 'attackBuilding' || t.kind === 'armForBattle')) {
        defenders++;
        continue;
      }
      if (!t || t.kind === 'gather' || t.kind === 'return') {
        if (defenders < 4) {
          if (assignAttackTask(id, 'unit', intruder)) {
            defenders++;
            changed = true;
          }
        }
      }
    }
    if (defenders > 0) return changed;
  }

  // 2. Finish any under-construction Red buildings first
  const unfinished = redBlds.find((b) => b.underConstruction);
  if (unfinished) {
    const builders = adults.filter((id) => state.tasks.get(id)?.kind === 'build' || state.tasks.get(id)?.kind === 'buildFetch');
    if (builders.length === 0) {
      const idle = adults.find((id) => !state.tasks.has(id) && !isUnitInsideBuilding(d, id));
      if (idle && assignBuildTask(idle, unfinished)) changed = true;
    }
  } else if (r1 && (r1[1] || 0) >= 14 && (r1[2] || 0) >= 6 && state.animTick % 88 === 0) {
    // 3. Build key buildings in authentic order: Lều(2) -> Bếp(4) -> Kho vũ khí(0) -> Phòng tập(1) -> Khu tập ném(5)
    const wantOrder = [2, 4, 0, 1, 5];
    const desiredType = wantOrder.find((bt) => !redBlds.some((b) => b.targetType === bt));
    if (desiredType !== undefined) {
      const spec = getBuildingSpec(d, desiredType);
      if ((r1[1] || 0) >= spec.wood && (r1[2] || 0) >= spec.stone && (r1[3] || 0) >= spec.bones) {
        const idle = adults.find((id) => !state.tasks.has(id) && !isUnitInsideBuilding(d, id));
        if (idle) {
          // Search a valid build spot near Red home
          let placedBid = 0;
          for (let r = 3; r <= 11 && !placedBid; r++) {
            for (let dy = -r; dy <= r && !placedBid; dy += 2) {
              for (let dx = -r; dx <= r && !placedBid; dx += 2) {
                const bx = homeX + dx;
                const by = homeY + dy;
                if (canPlaceBuilding(d, desiredType, bx, by)) {
                  placedBid = placeConstructionSite(d, desiredType, bx, by, 1);
                  if (placedBid > 0) {
                    const aiTotalCost = Math.max(1, (spec.wood || 0) + (spec.stone || 0) + (spec.bones || 0));
                    state.siteMaterials.set(placedBid, {
                      wood: spec.wood,
                      stone: spec.stone,
                      tools: spec.bones,
                      deliveredWood: 0,
                      deliveredStone: 0,
                      deliveredTools: 0,
                      totalCost: aiTotalCost,
                      baseHp: e[8505 + placedBid] & 0xff,
                      owner: 1,
                    });
                    const newBld = getPlayerBuildings(1).find((b) => b.bid === placedBid);
                    if (newBld) assignBuildTask(idle, newBld);
                    changed = true;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // 4. Staff Kho vũ khí (blacksmith) & queue weapons if Red has one
  const workshop = redBlds.find((b) => !b.underConstruction && b.targetType === 0);
  if (workshop) {
    const q = getWeaponQueue(workshop.bid);
    const totalQueued = q.reduce((s, n) => s + n, 0);
    if (totalQueued === 0 && r1 && (r1[1] || 0) >= 6) {
      q[0] = 2; // Queue 2 Dùi cui
      if ((r1[2] || 0) >= 5) q[1] = 2; // Queue 2 Đá ném
    }
    const hasSmith = adults.some((id) => state.tasks.get(id)?.target?.bid === workshop.bid || state.tasks.get(id)?.workshop?.bid === workshop.bid);
    if (!hasSmith) {
      const idle = adults.find((id) => !state.tasks.has(id) && !isUnitInsideBuilding(d, id));
      if (idle && assignWorkAtBuilding(idle, workshop, [0])) changed = true;
    }
  }

  // 5. Assign idle adult Red villagers to gather resources continuously (food, wood, stone)
  const idleAdults = adults.filter((id) => !state.tasks.has(id) && !isUnitInsideBuilding(d, id));
  for (const id of idleAdults) {
    const ux = e[id] & 0xff;
    const uy = e[101 + id] & 0xff;
    const preferType = (r1?.[0] || 0) < 15 ? 'food' : (r1?.[1] || 0) <= (r1?.[2] || 0) ? 'wood' : 'stone';
    const bestNode =
      findNearestGatherable(ux, uy, 14, preferType, true) ||
      findNearestGatherable(ux, uy, 14, null, true);
    if (bestNode && assignGatherTask(id, bestNode)) {
      changed = true;
    }
  }

  // 6. Coordinated Attack Waves against Blue Tribe (scaled by difficulty)
  const waveInterval = diff === 'easy' ? 820 : diff === 'hard' ? 340 : 520;
  const waveSize = diff === 'easy' ? 2 : diff === 'hard' ? 5 : 3;
  if (state.animTick >= 360 && state.animTick % waveInterval < 22) {
    const attackers = adults.filter((id) => {
      const t = state.tasks.get(id);
      return t && (t.kind === 'attackUnit' || t.kind === 'attackBuilding' || t.kind === 'armForBattle');
    });
    if (attackers.length < waveSize) {
      const candidates = adults.filter((id) => {
        if (isUnitInsideBuilding(d, id)) return false;
        const t = state.tasks.get(id);
        return !t || t.kind === 'gather' || t.kind === 'return';
      });
      const targetBld = blueBlds[0];
      const targetUnit = blueUnits.find((u) => !isUnitInsideBuilding(d, u));
      const tx = targetUnit ? (e[targetUnit] & 0xff) : targetBld ? targetBld.x : 0;
      const ty = targetUnit ? (e[101 + targetUnit] & 0xff) : targetBld ? targetBld.y : 0;
      const needCount = Math.min(waveSize - attackers.length, Math.max(1, candidates.length - 2));
      for (let i = 0; i < needCount; i++) {
        const id = candidates[i];
        if (!id) break;
        const storage = findNearestDropoff(e[id] & 0xff, e[101 + id] & 0xff, 1);
        const curW = e[6565 + id] & 0xff;
        if (curW === 9 && storage) {
          const p = planUnitPath(id, storage.x, storage.y, false, storage);
          if (p !== null) {
            state.tasks.set(id, {
              kind: 'armForBattle',
              path: p.path,
              stepProgress: p.stepProgress,
              target: storage,
              battleX: tx,
              battleY: ty,
              owner: 1,
              workTicks: 0,
            });
            changed = true;
            continue;
          }
        }
        if (targetUnit && assignAttackTask(id, 'unit', targetUnit)) changed = true;
        else if (targetBld && assignAttackTask(id, 'building', targetBld.bid)) changed = true;
      }
    }
  }
  return changed;
}

function stepEnemyAI() {
  const d = state.data;
  if (!d) return false;
  const e = d.entityData;
  const fo = d.entityFieldOffsets;
  const enemies = getEnemyIds();
  if (enemies.length === 0) return false;
  let changed = false;

  for (const eid of enemies) {
    const ex = e[eid] & 0xff;
    const ey = e[101 + eid] & 0xff;
    const task = state.enemyTasks.get(eid);

    if (task) {
      if (task.kind === 'attackUnit') {
        const tid = task.targetId;
        if ((e[1919 + tid] & 0xff) <= 0) {
          state.enemyTasks.delete(eid);
          setUnitAnim(eid, 8, 0);
          continue;
        }
        if (isUnitInsideBuilding(d, tid)) {
          const bid = e[4444 + tid] & 0xff;
          state.enemyTasks.delete(eid);
          // Children inside Nhà trẻ / buildings are protected and cannot be lured!
          if ((e[1414 + tid] & 0xff) >= 12 && bid >= 1 && bid <= 30) assignEnemyAttack(eid, 'building', bid);
          continue;
        }
        const tx = e[tid] & 0xff;
        const ty = e[101 + tid] & 0xff;
        const isChildTarget = (e[1414 + tid] & 0xff) < 12;
        const range = isChildTarget ? 3 : getUnitRange(eid);
        const dist = Math.max(Math.abs(tx - ex), Math.abs(ty - ey));
        if (dist > range) {
          if (task.path.length === 0 || (task.stepProgress === 0 && task.workTicks % 5 === 0)) {
            const p = findPath(ex, ey, tx, ty, eid, true);
            if (p && p.length > 0) task.path = p;
            else if (!p) {
              state.enemyTasks.delete(eid);
              setUnitAnim(eid, 8, 0);
              continue;
            }
          }
          task.workTicks++;
          if (task.path.length > 0) stepUnitMovement(eid, task, true);
          continue;
        }
        // In range: if target is a child (< 12), wave balloon (anim 159) at range <= 3 so child runs over to the lurer before converting!
        e[202 + eid] = 0;
        e[303 + eid] = 0;
        task.path = [];
        task.stepProgress = 0;
        e[606 + eid] = directionFromDelta(tx - ex, ty - ey);
        if (isChildTarget) {
          const lureStatus = stepChildLuring(eid, tid, task, 1);
          if (lureStatus === 'converted' || lureStatus === 'cancel') {
            state.enemyTasks.delete(eid);
            setUnitAnim(eid, 8, 0);
            changed = true;
          }
          continue;
        }
        const dmg = getUnitDamage(eid);
        const wId = e[6565 + eid] & 0xff;
        const swingIdx = Math.floor((task.workTicks || 0) / 6);
        const atkAnim = getWeaponAttackAnim(wId, swingIdx);
        setUnitAnim(eid, atkAnim.animId, task.cooldown % atkAnim.frames);
        if (task.cooldown === atkAnim.hitFrame) {
          if (range > 1) {
            launchProjectile(eid, 'unit', tid, ex, ey, tx, ty, wId, dmg);
          } else {
            applyUnitDamage(eid, tid, dmg);
          }
          changed = true;
        }
        task.workTicks = (task.workTicks || 0) + 1;
        task.cooldown = (task.cooldown + 1) % (atkAnim.frames + (range > 1 ? 1 : 0));
        continue;
      }

      if (task.kind === 'attackBuilding') {
        const bld = getPlayerBuildings().find((b) => b.bid === task.targetId);
        if (!bld || bld.hp <= 0) {
          state.enemyTasks.delete(eid);
          setUnitAnim(eid, 8, 0);
          continue;
        }
        const range = getUnitRange(eid);
        const dist = distanceToRect(ex, ey, bld);
        if (dist > range) {
          if (task.path.length === 0) {
            const p = findPath(ex, ey, bld.x, bld.y, eid, false, bld);
            if (p && p.length > 0) task.path = p;
            else {
              state.enemyTasks.delete(eid);
              setUnitAnim(eid, 8, 0);
              continue;
            }
          }
          if (task.path.length > 0) stepUnitMovement(eid, task, true);
          continue;
        }
        e[202 + eid] = 0;
        e[303 + eid] = 0;
        task.path = [];
        task.stepProgress = 0;
        const cx = bld.x + Math.floor(bld.w / 2);
        const cy = bld.y + Math.floor(bld.h / 2);
        e[606 + eid] = directionFromDelta(cx - ex, cy - ey);
        const dmg = getUnitDamage(eid);
        const wId = e[6565 + eid] & 0xff;
        const swingIdx = Math.floor((task.workTicks || 0) / 6);
        const atkAnim = getWeaponAttackAnim(wId, swingIdx);
        setUnitAnim(eid, atkAnim.animId, task.cooldown % atkAnim.frames);
        if (task.cooldown === atkAnim.hitFrame) {
          if (range > 1) {
            launchProjectile(eid, 'building', bld.bid, ex, ey, cx, cy, wId, dmg);
          } else {
            applyBuildingDamage(eid, bld.bid, dmg);
          }
          changed = true;
        }
        task.workTicks = (task.workTicks || 0) + 1;
        task.cooldown = (task.cooldown + 1) % (atkAnim.frames + (range > 1 ? 1 : 0));
        continue;
      }

      if (task.kind === 'patrol') {
        if (task.path.length > 0) {
          stepUnitMovement(eid, task, true);
          continue;
        }
        state.enemyTasks.delete(eid);
        setUnitAnim(eid, 8, 0);
      }
    }

    // Idle or patrolling enemy scans for player units/buildings within difficulty scan range
    if ((state.animTick + eid) % 12 === 0) {
      const scanRange = getCurrentDifficulty().enemyScanRange || 7;
      let bestUnit = 0;
      let bestDist = scanRange + 1;
      for (const pid of getVillagerIds()) {
        if (isUnitInsideBuilding(d, pid)) continue;
        const px = e[pid] & 0xff;
        const py = e[101 + pid] & 0xff;
        const dist = Math.max(Math.abs(px - ex), Math.abs(py - ey));
        if (dist < bestDist) {
          bestDist = dist;
          bestUnit = pid;
        }
      }
      if (bestUnit > 0 && assignEnemyAttack(eid, 'unit', bestUnit)) {
        if (getFogState(d, ex, ey) === 0) alertCombat('Đã phát hiện kẻ thù!', '#ffd84d');
        continue;
      }
      let bestBld = null;
      let bestBldDist = scanRange + 1;
      for (const bld of getPlayerBuildings()) {
        const dist = distanceToRect(ex, ey, bld);
        if (dist < bestBldDist) {
          bestBldDist = dist;
          bestBld = bld;
        }
      }
      if (bestBld && assignEnemyAttack(eid, 'building', bestBld.bid)) {
        if (getFogState(d, ex, ey) === 0) alertCombat('Kẻ thù đang tiến công trại!', '#ff7b6b');
        continue;
      }
    }

    // Gentle camp patrol when idle
    if (!state.enemyTasks.has(eid) && (state.animTick + eid * 7) % 42 === 0) {
      const dirObj = DIRS[(state.animTick + eid * 3) % DIRS.length];
      const nx = ex + dirObj.dx * 2;
      const ny = ey + dirObj.dy * 2;
      if (isWalkable(nx, ny, eid)) {
        const p = findPath(ex, ey, nx, ny, eid, false);
        if (p && p.length > 0 && p.length <= 4) {
          state.enemyTasks.set(eid, { kind: 'patrol', path: p, stepProgress: 0, workTicks: 0 });
        }
      }
    }

    // Gentle idle animation for stationary enemy warriors
    if (!state.enemyTasks.has(eid) && state.animTick % 5 === 0 && fo) {
      const animId = e[fo[29] + eid] & 0xff;
      const frameCount = d.byteSpriteTables[4][animId] & 0xff;
      if (frameCount > 1) {
        e[fo[30] + eid] = (e[fo[30] + eid] + 1) % frameCount;
      }
    }
  }
  return changed;
}

function runTribeAutoAI() {
  if (!state.autoAI || !state.data) return;
  const pendingBuildings = getPlayerBuildings().filter((b) => b.underConstruction);
  const ids = getVillagerIds();
  let assignedCount = 0;
  for (const id of ids) {
    if (state.tasks.has(id)) continue;
    if (assignedCount >= 2) break;
    const info = getVillagerInfo(id);
    if (info.age < 12) continue; // Children play until age 12!
    if (pendingBuildings.length > 0) {
      const bld = pendingBuildings[0];
      if (assignBuildTask(id, bld, true)) {
        assignedCount++;
        continue;
      }
    }
    const want = state.wood <= state.stone ? 'wood' : state.food < 10 ? 'food' : 'stone';
    const res = findNearestGatherable(info.x, info.y, 12, want);
    if (res && assignGatherTask(id, res)) {
      assignedCount++;
    }
  }
}

function isUnitSprinting(unitId) {
  const d = state.data;
  if (!d || unitId <= 0 || unitId > 100) return false;
  const e = d.entityData;
  const task = state.tasks.get(unitId) || state.enemyTasks.get(unitId);
  const isCombatSprint =
    task && (task.kind === 'armForBattle' || task.kind === 'attackUnit' || task.kind === 'attackBuilding');
  return (
    ((e[7777 + unitId] & 0xff) > 0 || isCombatSprint) &&
    (e[1414 + unitId] & 0xff) >= 12 &&
    (e[3535 + unitId] & 0xff) === 0 &&
    (isCombatSprint || (e[2020 + unitId] & 0xff) > 10)
  );
}

function getUnitStepTicks(unitId, dx, dy) {
  const d = state.data;
  let speedIdx = Math.max(2, Math.min(8, (d.entityData[1010 + unitId] & 0xff) || 8));
  if (isUnitSprinting(unitId)) {
    // Authentic J2ME sprint speed (b.java:2092 / mo[15]): ~2x faster (4 ticks/tile cardinal, 6 diagonal)
    speedIdx = Math.max(4, speedIdx - 4);
  }
  const isDiagonal = dx !== 0 && dy !== 0;
  const tableVal = d.mapTableData[d.mapTableOffsets[15] + (isDiagonal ? 9 : 0) + speedIdx] & 0xff;
  return tableVal || (isDiagonal ? 11 : 8);
}

function getUnitCarryCap(unitId) {
  const raw = state.data.entityData[3737 + unitId] & 0xff;
  const cap = raw >= 10 ? raw : 10;
  state.data.entityData[3737 + unitId] = cap;
  return cap;
}

function stepUnitMovement(unitId, task, isEnemy = false) {
  const d = state.data;
  const e = d.entityData;
  const ux = e[unitId] & 0xff;
  const uy = e[101 + unitId] & 0xff;
  const next = task.path[0];

  // Allow villagers to walk past other units on intermediate path tiles without stalling or replanning;
  // only replan if blocked by impassable terrain or a newly placed building/resource (occ < 0)!
  const canPassThroughIntermediateUnit =
    task.path.length > 1 &&
    next.x >= 0 &&
    next.y >= 0 &&
    next.x < d.width &&
    next.y < d.height &&
    (d.terrain[next.y][next.x] & 0xff) < 175 &&
    ((d.shortSpriteTables[9][d.terrain[next.y][next.x] & 0xff] >>> 13) & 1) === 0 &&
    d.occupancy[next.y][next.x] >= 0;

  if (task.stepProgress === 0 && !canPassThroughIntermediateUnit && !isWalkable(next.x, next.y, unitId)) {
    const dest = task.path[task.path.length - 1];
    const replanned = findPath(
      ux,
      uy,
      dest.x,
      dest.y,
      unitId,
      task.kind === 'gather' || task.kind === 'hunt' || task.kind === 'attackUnit',
      task.kind === 'build' || task.kind === 'return' || task.kind === 'attackBuilding' ? task.target : null
    );
    if (replanned && replanned.length > 0) {
      task.path = replanned;
      if (!isEnemy && state.selectedUnit === unitId) state.activePath = replanned;
    } else {
      e[202 + unitId] = 0;
      e[303 + unitId] = 0;
      const isCarrying = !isEnemy && e[3535 + unitId] > 0 && e[3636 + unitId] > 0;
      setUnitAnim(unitId, isCarrying ? 9 : 8, 0);
      if (isEnemy) state.enemyTasks.delete(unitId);
      else state.tasks.delete(unitId);
      if (!isEnemy && state.selectedUnit === unitId) state.activePath = [];
      return false;
    }
  }

  const target = task.path[0];
  const dx = target.x - ux;
  const dy = target.y - uy;
  e[606 + unitId] = directionFromDelta(dx, dy);

  // Authentic original pace from mo[15] + e[1010+uid]: 8 ticks/tile cardinal, 11 ticks/tile diagonal at 120ms/tick
  const stepsPerTile = getUnitStepTicks(unitId, dx, dy);
  // If speed changed mid-tile (e.g. sprint <-> walk), proportionally rescale stepProgress so the unit never jerks backward!
  if (task.stepProgress > 0 && task.lastStepsPerTile && task.lastStepsPerTile !== stepsPerTile) {
    task.stepProgress = Math.max(1, Math.min(stepsPerTile - 1, Math.round((task.stepProgress / task.lastStepsPerTile) * stepsPerTile)));
  }
  task.lastStepsPerTile = stepsPerTile;
  const isChild = (e[1414 + unitId] & 0xff) < 12;
  const isCarrying = !isEnemy && e[3535 + unitId] > 0 && e[3636 + unitId] > 0;
  const sprinting = isUnitSprinting(unitId);
  // Exact port of b.java:3529-3546: child=6, carrying=1, sprinting=7 (4f run), normal walk=0
  const walkAnim = isChild ? 6 : isCarrying ? 1 : sprinting ? 7 : 0;
  const walkFrame = Math.floor(((task.stepProgress + 1) * 4) / stepsPerTile) % 4;
  setUnitAnim(unitId, walkAnim, walkFrame);
  task.stepProgress++;

  if (task.stepProgress >= stepsPerTile) {
    // If this is the final tile in the path and another unit is already standing on it, try an empty adjacent tile
    let destX = target.x;
    let destY = target.y;
    if (task.path.length === 1 && d.occupancy[destY]?.[destX] > 0 && d.occupancy[destY][destX] !== unitId) {
      for (const s of DIRS) {
        const ax = destX + s.dx;
        const ay = destY + s.dy;
        if (ax >= 0 && ay >= 0 && ax < d.width && ay < d.height && d.occupancy[ay][ax] === 0 && (d.terrain[ay][ax] & 0xff) < 175) {
          destX = ax;
          destY = ay;
          break;
        }
      }
    }
    clearUnitTile(d, unitId, ux, uy);
    e[unitId] = destX;
    e[101 + unitId] = destY;
    e[202 + unitId] = 0;
    e[303 + unitId] = 0;
    setUnitOnTile(d, unitId, destX, destY);
    if (!isEnemy && (unitId > 50 ? 1 : 0) === (state.localTribe ?? 0)) {
      revealFog(d, destX, destY, 4);
    }
    task.path.shift();
    task.stepProgress = 0;
    if (!isEnemy && isUnitSprinting(unitId)) {
      // Gentle energy drain while sprinting, and stop sprinting upon arrival or exhaustion
      if (task.path.length % 2 === 0) {
        e[2020 + unitId] = Math.max(0, (e[2020 + unitId] & 0xff) - 1);
      }
      if (task.path.length === 0 || (e[2020 + unitId] & 0xff) <= 10) {
        e[7777 + unitId] = 0;
      }
    } else if (!isEnemy && task.path.length === 0) {
      e[7777 + unitId] = 0;
    }
    if (!isEnemy && state.selectedUnit === unitId) state.activePath = task.path;
    return true;
  } else {
    // Ensure moving unit stays registered in occupancy at its current tile if nothing else holds it
    if (d.occupancy[uy]?.[ux] === 0) {
      d.occupancy[uy][ux] = unitId;
    }
    const frac = task.stepProgress / stepsPerTile;
    e[202 + unitId] = Math.round(dx * CELL_WIDTH * frac);
    e[303 + unitId] = Math.round(dy * CELL_HEIGHT * frac);
    return false;
  }
}

function stepSimulation() {
  if (!state.data || state.phase !== 'game' || state.paused || state.storyDialog || state.missionResult) return;
  // In 1v1 Multiplayer, Guest (Tribe 1) receives authoritative world snapshots from Host!
  if (state.mpMode && state.localTribe === 1) return;
  state.lastSimTime = performance.now();
  state.animTick++;
  const d = state.data;
  const e = d.entityData;
  const fo = d.entityFieldOffsets;
  let uiChanged = false;

  // Step building completion dust effects (f.java s() d(74)), villager death anims (anim 108), and popups
  for (let i = state.dustEffects.length - 1; i >= 0; i--) {
    state.dustEffects[i].frame++;
    if (state.dustEffects[i].frame >= state.dustEffects[i].maxFrames) state.dustEffects.splice(i, 1);
  }
  for (let i = state.deathEffects.length - 1; i >= 0; i--) {
    const fx = state.deathEffects[i];
    fx.frame++;
    if (fx.phase === 'fall' && fx.frame >= fx.maxFrames) {
      // Exact b.java:3753: upon landing, play authentic human skeleton transformation (anim 43 adult / anim 44 child)!
      fx.phase = 'skeleton';
      fx.animId = fx.isChild ? 44 : 43;
      fx.frame = 0;
      fx.maxFrames = fx.isChild ? 10 : 9;
      fx.holdTicks = 24;
      uiChanged = true;
    } else if (fx.phase === 'skeleton' && fx.frame >= fx.maxFrames + (fx.holdTicks || 0)) {
      state.deathEffects.splice(i, 1);
      uiChanged = true;
    } else if (!fx.phase && fx.frame >= fx.maxFrames) {
      state.deathEffects.splice(i, 1);
    }
  }
  for (let i = state.popups.length - 1; i >= 0; i--) {
    state.popups[i].age++;
    if (state.popups[i].age >= state.popups[i].maxAge) state.popups.splice(i, 1);
  }

  // Step villager tasks
  for (const [unitId, task] of state.tasks.entries()) {
    const ux = e[unitId] & 0xff;
    const uy = e[101 + unitId] & 0xff;

    // Authentic Hat-Putting (anim 147 / -109, 14 frames) and Hat-Removing (anim 148 / -108, 7 frames) from b.java:1455-1460:
    // Builders keep their hard hat (38) while fetching materials (buildFetch), Chefs keep their hat (54) while fetching meat (chefFetch),
    // and villagers taking a short break to eat/rest keep their current job hat until they are assigned a different primary task!
    const taskHatJob =
      task.kind === 'build' || task.kind === 'buildFetch'
        ? 38
        : task.kind === 'chefFetch'
          ? 54
          : task.kind === 'eat' ||
              task.kind === 'rest' ||
              task.kind === 'armForBattle' ||
              task.kind === 'attackUnit' ||
              task.kind === 'attackBuilding'
            ? (e[6464 + unitId] & 0xff) || 69
            : task.kind === 'workBuilding'
              ? task.hatJob !== undefined
                ? task.hatJob
                : task.target?.targetType === 4
                  ? 54
                  : task.target?.targetType === 7
                    ? 86
                    : task.target?.targetType === 8
                      ? 57
                      : 69
              : 69;

    // Only play hat-putting / hat-removing when aligned on a tile center (stepProgress === 0)
    // so the villager never snaps/wobbles mid-step!
    const alignedForHat = !(task.path?.length > 0 && task.stepProgress > 0);
    if (alignedForHat && taskHatJob === 69 && (isWearingJobHat(unitId) || (task.hatRemoveFrame !== undefined && task.hatRemoveFrame < 7))) {
      if (task.hatRemoveFrame === undefined) task.hatRemoveFrame = 0;
      if (task.hatRemoveFrame < 7) {
        e[202 + unitId] = 0;
        e[303 + unitId] = 0;
        setUnitAnim(unitId, 148, task.hatRemoveFrame);
        if (task.hatRemoveFrame === 6) {
          e[6464 + unitId] = 69; // b.java:1458 removes job hat at frame 6
        }
        task.hatRemoveFrame++;
        if (task.hatRemoveFrame >= 7 && task.kind === 'removeHat') {
          setUnitAnim(unitId, 8, 0);
          state.tasks.delete(unitId);
          uiChanged = true;
        }
        continue;
      }
    } else if (alignedForHat && taskHatJob !== 69) {
      if ((e[6464 + unitId] & 0xff) !== taskHatJob && task.hatPutFrame === undefined) {
        task.hatPutFrame = 0;
      }
      // Play ONLY frames 0..6 of anim 147 (clean hat-putting motion, symmetric with 7-frame anim 148),
      // skipping frames 7..13 (p752<->p753 extra shaking/waving hand)!
      if (task.hatPutFrame !== undefined && task.hatPutFrame < 7) {
        e[202 + unitId] = 0;
        e[303 + unitId] = 0;
        setUnitAnim(unitId, 147, task.hatPutFrame);
        if (task.hatPutFrame === 1) {
          e[6464 + unitId] = taskHatJob; // b.java:1461 equips job hat at frame 1
        }
        task.hatPutFrame++;
        if (task.hatPutFrame >= 7 && task.carryWoodAfterHat) {
          setUnitCarry(unitId, 2, 1);
        }
        continue;
      }
    }

    // Combat tasks handle chase + fast, dramatic ranged/melee engagement dynamically
    if (task.kind === 'attackUnit') {
      const unitOwner = unitId > 50 ? 1 : 0;
      const tid = task.targetId;
      if ((e[1919 + tid] & 0xff) <= 0) {
        // Target dead -> auto-acquire another nearby enemy within 6 tiles, or resume previous job!
        e[7777 + unitId] = 0;
        state.tasks.delete(unitId);
        if (state.selectedUnit === unitId) state.activePath = [];
        const nextEnemy = getEnemyIds(unitOwner).find((eid) => Math.max(Math.abs((e[eid] & 0xff) - ux), Math.abs((e[101 + eid] & 0xff) - uy)) <= 6);
        if (nextEnemy && assignAttackTask(unitId, 'unit', nextEnemy)) {
          uiChanged = true;
          continue;
        }
        if (!resumeSavedJob(unitId)) {
          setUnitAnim(unitId, 8, 0);
        }
        uiChanged = true;
        continue;
      }
      const tx = e[tid] & 0xff;
      const ty = e[101 + tid] & 0xff;
      const isChildTarget = (e[1414 + tid] & 0xff) < 12;
      if (isChildTarget && isUnitInsideBuilding(d, tid)) {
        // Children inside Nhà trẻ / buildings are safe from being lured!
        e[7777 + unitId] = 0;
        state.tasks.delete(unitId);
        setUnitAnim(unitId, 8, 0);
        if (state.selectedUnit === unitId) state.activePath = [];
        uiChanged = true;
        continue;
      }
      const range = isChildTarget ? 3 : getUnitRange(unitId);
      const dist = Math.max(Math.abs(tx - ux), Math.abs(ty - uy));
      if (dist > range) {
        if (task.path.length === 0 || (task.stepProgress === 0 && task.workTicks % 4 === 0)) {
          const chase = findPath(ux, uy, tx, ty, unitId, true);
          if (chase && chase.length > 0) {
            task.path = chase;
            if (state.selectedUnit === unitId) state.activePath = chase;
          } else if (!chase) {
            state.tasks.delete(unitId);
            setUnitAnim(unitId, 8, 0);
            if (state.selectedUnit === unitId) state.activePath = [];
            continue;
          }
        }
        task.workTicks++;
        if (task.path.length > 0 && stepUnitMovement(unitId, task)) uiChanged = true;
        continue;
      }
      e[202 + unitId] = 0;
      e[303 + unitId] = 0;
      task.path = [];
      task.stepProgress = 0;
      if (state.selectedUnit === unitId) state.activePath = [];
      e[606 + unitId] = directionFromDelta(tx - ux, ty - uy);
      // If target is an enemy child (age < 12), wave balloon (anim 159) at range <= 3 so child runs over to the lurer before converting!
      if (isChildTarget) {
        const lureStatus = stepChildLuring(unitId, tid, task, unitOwner);
        if (lureStatus === 'converted' || lureStatus === 'cancel') {
          e[7777 + unitId] = 0;
          state.tasks.delete(unitId);
          setUnitAnim(unitId, 8, 0);
          uiChanged = true;
        }
        continue;
      }
      const dmg = getUnitDamage(unitId);
      const wId = e[6565 + unitId] & 0xff;
      const swingIdx = Math.floor((task.workTicks || 0) / 6);
      const atkAnim = getWeaponAttackAnim(wId, swingIdx);
      setUnitAnim(unitId, atkAnim.animId, task.cooldown % atkAnim.frames);
      if (task.cooldown === atkAnim.hitFrame) {
        if (range > 1) {
          launchProjectile(unitId, 'unit', tid, ux, uy, tx, ty, wId, dmg);
        } else {
          applyUnitDamage(unitId, tid, dmg);
        }
        uiChanged = true;
      }
      task.workTicks = (task.workTicks || 0) + 1;
      task.cooldown = (task.cooldown + 1) % (atkAnim.frames + (range > 1 ? 1 : 0));
      continue;
    }

    if (task.kind === 'attackBuilding') {
      const unitOwner = unitId > 50 ? 1 : 0;
      const bld = getEnemyBuildings(unitOwner).find((b) => b.bid === task.targetId);
      if (!bld || bld.hp <= 0) {
        state.tasks.delete(unitId);
        setUnitAnim(unitId, 8, 0);
        if (state.selectedUnit === unitId) state.activePath = [];
        uiChanged = true;
        continue;
      }
      const range = getUnitRange(unitId);
      const dist = distanceToRect(ux, uy, bld);
      if (dist > range) {
        if (task.path.length === 0) {
          const chase = findPath(ux, uy, bld.x, bld.y, unitId, false, bld);
          if (chase && chase.length > 0) {
            task.path = chase;
            if (state.selectedUnit === unitId) state.activePath = chase;
          } else {
            state.tasks.delete(unitId);
            setUnitAnim(unitId, 8, 0);
            if (state.selectedUnit === unitId) state.activePath = [];
            continue;
          }
        }
        if (task.path.length > 0 && stepUnitMovement(unitId, task)) uiChanged = true;
        continue;
      }
      e[202 + unitId] = 0;
      e[303 + unitId] = 0;
      task.path = [];
      task.stepProgress = 0;
      if (state.selectedUnit === unitId) state.activePath = [];
      const cx = bld.x + Math.floor(bld.w / 2);
      const cy = bld.y + Math.floor(bld.h / 2);
      e[606 + unitId] = directionFromDelta(cx - ux, cy - uy);
      const dmg = getUnitDamage(unitId);
      const wId = e[6565 + unitId] & 0xff;
      const swingIdx = Math.floor((task.workTicks || 0) / 6);
      const atkAnim = getWeaponAttackAnim(wId, swingIdx);
      setUnitAnim(unitId, atkAnim.animId, task.cooldown % atkAnim.frames);
      if (task.cooldown === atkAnim.hitFrame) {
        if (range > 1) {
          launchProjectile(unitId, 'building', bld.bid, ux, uy, cx, cy, wId, dmg);
        } else {
          applyBuildingDamage(unitId, bld.bid, dmg);
        }
        uiChanged = true;
      }
      task.workTicks = (task.workTicks || 0) + 1;
      task.cooldown = (task.cooldown + 1) % (atkAnim.frames + (range > 1 ? 1 : 0));
      continue;
    }

    if (task.path.length > 0) {
      if (stepUnitMovement(unitId, task)) uiChanged = true;
      continue;
    }

    // Arrived at destination!
    e[202 + unitId] = 0;
    e[303 + unitId] = 0;

    if (task.kind === 'move') {
      setUnitAnim(unitId, 8, 0);
      state.tasks.delete(unitId);
      if (state.selectedUnit === unitId) state.activePath = [];
      uiChanged = true;
    } else if (task.kind === 'luredByEnemy') {
      const lurerId = task.lurerId;
      const lurerTask = state.tasks.get(lurerId) || state.enemyTasks.get(lurerId);
      if (!lurerTask || lurerTask.kind !== 'attackUnit' || lurerTask.targetId !== unitId || (e[1919 + lurerId] & 0xff) <= 0) {
        setUnitAnim(unitId, 14, 0);
        state.tasks.delete(unitId);
        uiChanged = true;
      }
      continue;
    } else if (task.kind === 'gather') {
      const gt = task.target;
      const maxCap = getUnitCarryCap(unitId); // up to 10 resources per trip
      let available = maxCap;
      if (gt.type === 'wood') {
        const key = `${gt.x},${gt.y}`;
        available = state.treeWood.has(key) ? state.treeWood.get(key) : 20;
      } else if (gt.propIdx !== undefined) {
        const pKind = e[9833 + gt.propIdx] & 0xff;
        if (pKind !== 5) available = Math.max(1, e[9883 + gt.propIdx] & 0xff);
      }
      const cap = Math.max(1, Math.min(maxCap, available));
      const ticksPerUnit = 8; // ~0.96s per unit (~9.6s for full load of 10)
      const harvestTicks = cap * ticksPerUnit;
      e[606 + unitId] = directionFromDelta(gt.x - ux, gt.y - uy);

      if (task.workTicks < harvestTicks) {
        // Authentic work animation: fishing uses anim 142 (10-frame cast/reel); wood/stone/berries/mushrooms use anim 21 — NO dust cloud
        if (gt.type === 'fish') {
          setUnitAnim(unitId, 142, Math.floor(task.workTicks / 2) % 10);
        } else {
          setUnitAnim(unitId, 21, Math.floor(task.workTicks / 2) % 2);
        }
        // Show live gathering progress (1..10) in Panel 4 cargo counter as each unit is collected
        const collectedSoFar = Math.min(cap, Math.floor((task.workTicks + 1) / ticksPerUnit));
        if (collectedSoFar > 0 && (e[3636 + unitId] & 0xff) !== collectedSoFar) {
          setUnitCarry(unitId, gt.carrySprite || 2, collectedSoFar);
          uiChanged = true;
        }
        task.workTicks++;
        continue;
      }

      // Authentic b.java:2582-2744 & mo[164]: Gathering jobs (10..16) ONLY use anim 21 (or fishing 141..146).
      // Anim 22 (14 frames) belongs EXCLUSIVELY to delivery/unloading jobs (19..26) at Chief's Tent / Storage!
      const depleted = depleteGatherTarget(gt, cap);
      task.targetDepleted = depleted;
      setUnitCarry(unitId, gt.carrySprite || 2, cap);
      addPopup(ux, uy, `+${cap} ${gt.label}`, '#c5f285');

      // Immediately carry bundle back to nearest finished Chief's Tent or Storage (anim 1)
      const unitOwner = unitId > 50 ? 1 : 0;
      const dropoff = findNearestDropoff(ux, uy, unitOwner);
      if (dropoff) {
        const retPath = findPath(ux, uy, dropoff.x, dropoff.y, unitId, false, dropoff);
        if (retPath !== null) {
          state.tasks.set(unitId, {
            kind: 'return',
            path: retPath,
            stepProgress: 0,
            target: dropoff,
            returnToGather: task.targetDepleted ? null : gt,
            carrying: { type: gt.type, label: gt.label, amount: cap, carrySprite: gt.carrySprite || 2 },
            workTicks: 0,
          });
          if (state.selectedUnit === unitId) state.activePath = retPath;
          uiChanged = true;
          continue;
        }
      }
      // Fallback direct deposit if no dropoff reachable
      if (unitOwner === (state.localTribe ?? 0)) {
        if (gt.type === 'wood') state.wood += cap;
        else if (gt.type === 'stone') state.stone += cap;
        else if (gt.type === 'bones') state.tools += cap;
        else state.food += cap;
        syncResourcesToData(unitOwner);
      } else if (d.resources?.[unitOwner]) {
        const r = d.resources[unitOwner];
        if (gt.type === 'wood') r[1] = (r[1] || 0) + cap;
        else if (gt.type === 'stone') r[2] = (r[2] || 0) + cap;
        else if (gt.type === 'bones') r[3] = (r[3] || 0) + cap;
        else r[0] = (r[0] || 0) + cap;
      }
      setUnitCarry(unitId, 0, 0);
      setUnitAnim(unitId, 8, 0);
      state.tasks.delete(unitId);
      uiChanged = true;
    } else if (task.kind === 'return') {
      const carry = task.carrying;
      const dropoff = task.target;
      const unitOwner = unitId > 50 ? 1 : 0;
      e[606 + unitId] = directionFromDelta(dropoff.x + Math.floor(dropoff.w / 2) - ux, dropoff.y + Math.floor(dropoff.h / 2) - uy);
      // Authentic unloading animation: anim 22 (14 frames), sets bundle down at frame 10
      const frame = task.workTicks;
      if (frame < 14) {
        setUnitAnim(unitId, 22, frame);
        if (frame === 10 && carry) {
          setUnitCarry(unitId, 0, 0);
          if (unitOwner === (state.localTribe ?? 0)) {
            if (carry.type === 'wood') state.wood += carry.amount;
            else if (carry.type === 'stone') state.stone += carry.amount;
            else if (carry.type === 'bones') state.tools += carry.amount;
            else state.food += carry.amount;
            syncResourcesToData(unitOwner);
          } else if (d.resources?.[unitOwner]) {
            const r = d.resources[unitOwner];
            if (carry.type === 'wood') r[1] = (r[1] || 0) + carry.amount;
            else if (carry.type === 'stone') r[2] = (r[2] || 0) + carry.amount;
            else if (carry.type === 'bones') r[3] = (r[3] || 0) + carry.amount;
            else r[0] = (r[0] || 0) + carry.amount;
          }
          else state.food += carry.amount;
          syncResourcesToData();
          addPopup(ux, uy, `Nộp +${carry.amount} ${carry.label}`, '#fff37b');
          const info = getVillagerInfo(unitId);
          state.message = `${info.role} đã vác và nộp ${carry.amount} ${carry.label} tại ${dropoff.spec.name}!`;
          uiChanged = true;
        }
        task.workTicks++;
        continue;
      }
      // Loop back to gather again automatically (or find next nearby tree/resource if depleted)!
      // Ignore Host's fog when searching for Tribe 1 (Red, unitId > 50) resources so Red never cancels gathering!
      const isRedUnit = unitId > 50;
      const searchX = task.returnToGather?.x ?? ux;
      const searchY = task.returnToGather?.y ?? uy;
      const nextTarget =
        task.returnToGather && classifyGatherable(task.returnToGather.x, task.returnToGather.y)
          ? task.returnToGather
          : task.carrying?.type
            ? findNearestGatherable(searchX, searchY, 18, task.carrying.type, isRedUnit) ||
              findNearestGatherable(ux, uy, 22, task.carrying.type, isRedUnit)
            : null;
      if (nextTarget && assignGatherTask(unitId, nextTarget)) {
        uiChanged = true;
      } else {
        setUnitCarry(unitId, 0, 0);
        setUnitAnim(unitId, 8, 0);
        state.tasks.delete(unitId);
        if (state.selectedUnit === unitId) state.activePath = [];
        uiChanged = true;
      }
    } else if (task.kind === 'build') {
      const bld = task.target;
      const bid = bld.bid;
      const maxHp = Math.max(20, e[8566 + bid] & 0xff);
      const stillScaffold = (e[8749 + bid] >= 12 && e[8749 + bid] <= 19) || e[8627 + bid] === 1;
      if (!stillScaffold) {
        ensureUnitOutside(unitId);
        setUnitCarry(unitId, 0, 0);
        setUnitAnim(unitId, 8, 0);
        state.tasks.delete(unitId);
        uiChanged = true;
        continue;
      }

      // Step INSIDE the construction scaffold slot (rendered by drawMapObject kind===3!)
      if (!task.insideSlot) {
        const slot = enterBuildingSlot(d, bid, unitId);
        if (slot) {
          task.insideSlot = slot;
          const info = getVillagerInfo(unitId);
          state.message = `${info.role} đã vào công trường xây ${bld.spec.name}!`;
          uiChanged = true;
        } else {
          task.insideSlot = { slotIdx: -1, animId: 53 };
          setUnitCarry(unitId, 0, 0);
          e[606 + unitId] = directionFromDelta(bld.x - ux, bld.y - uy);
        }
      }

      // Check if construction site still needs materials from Storage (authentic b.java:3013 & 4277-4309)
      const bldOwner = bid > 30 ? 1 : 0;
      const need = state.siteMaterials.get(bid);
      const upgradeMeta = state.upgradingBuildings.get(bid);
      const stillMissingMaterials = Boolean(need && (need.wood > 0 || need.stone > 0 || need.tools > 0));
      const deliveredTotal = need
        ? (need.deliveredWood || 0) + (need.deliveredStone || 0) + (need.deliveredTools || 0)
        : 0;
      const remCost = need ? (need.wood || 0) + (need.stone || 0) + (need.tools || 0) : 0;
      const totalCost = Math.max(
        1,
        need?.totalCost ||
          (deliveredTotal + remCost) ||
          (bld.spec.woodCost || 0) + (bld.spec.stoneCost || 0) + (bld.spec.toolsCost || 0)
      );
      const baseHp =
        need?.baseHp ??
        (upgradeMeta ? Math.max(10, maxHp - 25) : Math.max(6, Math.floor(maxHp * 0.1)));
      const curHp = e[8505 + bid] & 0xff;
      const allowedMaxHp = stillMissingMaterials
        ? deliveredTotal > 0
          ? Math.min(maxHp - 1, baseHp + Math.ceil((maxHp - baseHp) * (deliveredTotal / totalCost)))
          : baseHp
        : maxHp;
      // Fetch-some -> build-some -> fetch-next/remaining -> raise protest sign ONLY after building everything brought!
      const hasWorkFromDelivered = deliveredTotal > 0 && curHp < allowedMaxHp;

      if (!hasWorkFromDelivered && stillMissingMaterials) {
        const r = d.resources?.[bldOwner];
        const curWood = bldOwner === (state.localTribe ?? 0) ? state.wood : (r?.[1] || 0);
        const curStone = bldOwner === (state.localTribe ?? 0) ? state.stone : (r?.[2] || 0);
        const curTools = bldOwner === (state.localTribe ?? 0) ? state.tools : (r?.[3] || 0);
        const canFetchNow =
          (need.wood > 0 && curWood > 0) ||
          (need.stone > 0 && curStone > 0) ||
          (need.tools > 0 && curTools > 0);
        const otherFetching = [...state.tasks.entries()].some(
          ([uid, t]) => uid !== unitId && t.kind === 'buildFetch' && t.buildBld?.bid === bid
        );

        if (canFetchNow && !otherFetching) {
          const storage = findNearestDropoff(e[unitId] & 0xff, e[101 + unitId] & 0xff, bldOwner);
          if (storage) {
            exitBuildingSlot(d, unitId);
            const toStorage = planUnitPath(unitId, storage.x, storage.y, false, storage);
            if (toStorage !== null) {
              setUnitCarry(unitId, 0, 0);
              state.tasks.set(unitId, {
                kind: 'buildFetch',
                path: toStorage.path,
                stepProgress: toStorage.stepProgress,
                target: storage,
                buildBld: bld,
                owner: bldOwner,
                workTicks: 0,
              });
              if (state.selectedUnit === unitId) state.activePath = toStorage.path;
              uiChanged = true;
              continue;
            }
          }
        }

        // Authentic b.java:4264: When required construction materials are missing from Storage (and nobody is fetching them),
        // STOP hammering completely until new materials arrive! ONLY 1 builder inside the site (slotIdx === 0, or the
        // lowest-slot builder inside) raises the missing-resource sign ONCE (anim 115, 13f) and holds it continuously (anim 113, 12f).
        if (!canFetchNow && !otherFetching) {
          let leadBuilderId = unitId;
          let minSlot = task.insideSlot?.slotIdx ?? 99;
          let curInside = e[8993 + bid];
          let gLead = 0;
          while (curInside > 0 && gLead++ < 16) {
            const sIdx = e[4646 + curInside];
            if (sIdx >= 0 && (sIdx < minSlot || (sIdx === minSlot && curInside < leadBuilderId))) {
              minSlot = sIdx;
              leadBuilderId = curInside;
            }
            curInside = e[4545 + curInside];
          }
          const isLeadSignHolder = unitId === leadBuilderId;
          const missingSprite = need.wood > 0 ? 2 : need.stone > 0 ? 3 : 4;
          const missingLabel = need.wood > 0 ? 'Gỗ' : need.stone > 0 ? 'Đá' : 'Xương';
          if (isLeadSignHolder) {
            task.signTicks = (task.signTicks || 0) + 1;
            setUnitCarry(unitId, missingSprite, 0);
            if (task.insideSlot && task.insideSlot.slotIdx >= 0) {
              const st = task.signTicks - 1;
              if (st < 13) {
                setUnitAnim(unitId, 115, st);
              } else {
                setUnitAnim(unitId, 113, (st - 13) % 12);
              }
            } else {
              setUnitAnim(unitId, 40, Math.floor(task.signTicks / 4) % 2);
            }
            if ((task.signTicks - 1) % 60 === 0 && bldOwner === (state.localTribe ?? 0)) {
              state.message = `🪧 Thợ xây tại ${bld.spec.name} đang giơ bảng báo thiếu ${missingLabel} trong kho!`;
            }
          } else {
            // Secondary builders at the same unfinished site wait quietly without hammering or holding a second protest sign!
            task.signTicks = 0;
            setUnitCarry(unitId, 0, 0);
            setUnitAnim(unitId, 8, 0);
          }
          task.workTicks++;
          uiChanged = true;
          continue;
        }
        task.signTicks = 0;
      } else {
        task.signTicks = 0;
      }

      // Clear any protest sign when actively hammering/sawing
      if ((e[3535 + unitId] & 0xff) > 0 && (e[3636 + unitId] & 0xff) === 0) {
        setUnitCarry(unitId, 0, 0);
      }

      // Play authentic hammering (anim 53, 3 frames) or sawing (anim 54, 3 frames) INSIDE the scaffold
      const buildAnim = task.insideSlot.animId || 53;
      setUnitAnim(unitId, buildAnim, Math.floor(task.workTicks / 2) % 3);
      task.workTicks++;

      // Authentic steady construction / upgrade rate: +1 HP every 3 ticks per builder, capped by delivered materials!
      if (task.workTicks % 3 === 0) {
        if (curHp >= allowedMaxHp && stillMissingMaterials) {
          continue;
        }
        const nextHp = Math.min(allowedMaxHp, curHp + 1);
        e[8505 + bid] = nextHp;
        if (!upgradeMeta) {
          const ratio = nextHp / maxHp;
          e[9115 + bid] = ratio >= 0.78 ? 3 : ratio >= 0.48 ? 2 : ratio >= 0.22 ? 1 : 0;
        }

        if (nextHp >= maxHp && !stillMissingMaterials) {
          const bldOwner = bid > 30 ? 1 : 0;
          let spec = bld.spec;
          let workers = [];
          if (upgradeMeta) {
            let wCur = e[8993 + bid];
            let wGuard = 0;
            while (wCur > 0 && wGuard++ < 16) {
              workers.push(wCur);
              wCur = e[4545 + wCur];
            }
            for (const wid of workers) exitBuildingSlot(d, wid);
            e[9115 + bid] = upgradeMeta.targetLevel;
            e[8627 + bid] = 0;
            e[8505 + bid] = maxHp;
            if (upgradeMeta.targetType === 2 && bldOwner === (state.localTribe ?? 0)) {
              state.housingCap = Math.min(50, state.housingCap + 2);
              syncResourcesToData(bldOwner);
            }
            state.upgradingBuildings.delete(bid);
            state.siteMaterials.delete(bid);
            if (bldOwner === (state.localTribe ?? 0)) {
              addPopup(bld.x + Math.floor(bld.w / 2), bld.y, `Nâng cấp Cấp ${upgradeMeta.targetLevel}!`, '#9cff7b');
              state.message = `✨ Đã nâng cấp xong ${spec.name} lên Cấp ${upgradeMeta.targetLevel}!`;
            }
          } else {
            const fin = finishConstructionSite(d, bid);
            spec = fin.spec;
            workers = fin.workers;
            state.siteMaterials.delete(bid);
            if (bldOwner === (state.localTribe ?? 0)) {
              state.missionStats.buildingsBuilt++;
              if (spec.housingBonus > 0) {
                state.housingCap = Math.min(50, state.housingCap + spec.housingBonus);
                syncResourcesToData(bldOwner);
              }
              addPopup(bld.x + Math.floor(bld.w / 2), bld.y, `${spec.name} hoàn thành!`, '#9cff7b');
              state.message = `Nhà đã xây xong: ${spec.name}!${spec.housingBonus ? ` (+${spec.housingBonus} chỗ ở)` : ''}`;
            }
          }
          // Dust cloud d(74) plays ONLY when the building finishes construction/upgrade (f.java:1517)!
          addDust(bld.x, bld.y, bld.w, bld.h);

          // If this finished building is a Nhà trẻ (bType 10), immediately call all outside children (< 12) of the tribe to run inside for safety!
          if ((e[8749 + bid] & 0xff) === 10) {
            const finishedKg = getPlayerBuildings(bldOwner).find((b) => b.bid === bid);
            if (finishedKg) {
              for (const cid of getVillagerIds(bldOwner)) {
                if ((e[1414 + cid] & 0xff) < 12 && !isUnitInsideBuilding(d, cid)) {
                  assignWorkAtBuilding(cid, finishedKg);
                }
              }
            }
          }

          // Collect all builders who were working on OR heading to this completed site
          const allFinishedBuilders = new Set([unitId, ...workers]);
          for (const [uid, t] of state.tasks.entries()) {
            if ((t.kind === 'build' && t.target?.bid === bid) || (t.kind === 'buildFetch' && t.buildBld?.bid === bid)) {
              allFinishedBuilders.add(uid);
            }
          }
          for (const wid of allFinishedBuilders) {
            state.tasks.delete(wid);
            setUnitCarry(wid, 0, 0);
          }

          // Auto-chain builders to the nearest remaining unfinished construction site with free slots!
          const remainingSites = getPlayerBuildings(bldOwner).filter((b) => b.underConstruction && b.bid !== bid);
          for (const wid of allFinishedBuilders) {
            const wx = e[wid] & 0xff;
            const wy = e[101 + wid] & 0xff;
            remainingSites.sort((a, b) => Math.hypot(a.x - wx, a.y - wy) - Math.hypot(b.x - wx, b.y - wy));
            let chained = false;
            for (const nextSite of remainingSites) {
              if (getAssignedBuilderCount(nextSite.bid, wid) < getMaxBuildersForSite(nextSite.bid)) {
                if (assignBuildTask(wid, nextSite)) {
                  chained = true;
                  break;
                }
              }
            }
            if (!chained) {
              setUnitAnim(wid, 8, 0);
              if (state.selectedUnit === wid) state.activePath = [];
            }
          }
          uiChanged = true;
        }
      }
    } else if (task.kind === 'hunt') {
      const aid = task.target.aid;
      const ahp = e[9513 + aid] & 0xff;
      if (task.phase === 'pickup') {
        const meatAmount = Math.max(3, getUnitCarryCap(unitId) + 2);
        // Authentic job 12 (butchering meat): uses anim 21 (2 frames), NOT unloading anim 22!
        if (task.workTicks < 16) {
          setUnitAnim(unitId, 21, Math.floor(task.workTicks / 4) % 2);
          task.workTicks++;
          continue;
        }
        setUnitCarry(unitId, 1, meatAmount); // 1 = meat sprite
        addPopup(ux, uy, `+${meatAmount} Thịt săn!`, '#ffaa5e');
        const dropoff = findNearestDropoff(ux, uy);
        if (dropoff) {
          const retPath = findPath(ux, uy, dropoff.x, dropoff.y, unitId, false, dropoff);
          if (retPath !== null) {
            state.tasks.set(unitId, {
              kind: 'return',
              path: retPath,
              stepProgress: 0,
              target: dropoff,
              returnToGather: null,
              carrying: { type: 'food', label: 'thịt săn', amount: meatAmount, carrySprite: 1 },
              workTicks: 0,
            });
            if (state.selectedUnit === unitId) state.activePath = retPath;
            uiChanged = true;
            continue;
          }
        }
        state.food += meatAmount;
        setUnitCarry(unitId, 0, 0);
        syncResourcesToData();
        setUnitAnim(unitId, 8, 0);
        state.tasks.delete(unitId);
        uiChanged = true;
        continue;
      }

      if (ahp <= 0) {
        setUnitAnim(unitId, 8, 0);
        state.tasks.delete(unitId);
        uiChanged = true;
        continue;
      }
      const ax = e[9359 + aid] & 0xff;
      const ay = e[9381 + aid] & 0xff;
      if (Math.max(Math.abs(ax - ux), Math.abs(ay - uy)) > 1) {
        const chase = findPath(ux, uy, ax, ay, unitId, true);
        if (chase && chase.length > 0) {
          task.path = chase;
          if (state.selectedUnit === unitId) state.activePath = chase;
          continue;
        }
      }
      e[606 + unitId] = directionFromDelta(ax - ux, ay - uy);
      // Authentic melee attack animation (anim 25, 6 frames at 2 ticks/frame) — NO dust cloud
      setUnitAnim(unitId, 25, Math.floor(task.workTicks / 2) % 6);
      task.workTicks++;
      if (task.workTicks >= 36) {
        const aKind = e[9535 + aid] & 0xff;
        const meatAmt = (d.mapTableData?.[d.mapTableOffsets?.[183] + aKind] & 0xff) || 20;
        e[9513 + aid] = 0;
        if (d.occupancy[ay][ax] === 101 + aid) d.occupancy[ay][ax] = 0;
        const carcassSlot = spawnMeatCarcass(d, ax, ay, meatAmt);
        const info = getVillagerInfo(unitId);
        const animalLabel = aKind === 1 ? 'Cọp' : aKind === 0 ? 'Lợn rừng' : 'Hươu';
        state.tasks.delete(unitId);
        const carcassTarget = carcassSlot >= 0 ? classifyGatherable(ax, ay) : null;
        if (carcassTarget && assignGatherTask(unitId, carcassTarget)) {
          state.message = `🥩 ${info.role} đã săn được ${animalLabel} (${meatAmt} thịt) và đang xẻ thịt vác về kho!`;
        } else {
          state.food += Math.min(10, meatAmt);
          syncResourcesToData();
          setUnitAnim(unitId, 8, 0);
          state.message = `🥩 ${info.role} đã săn được ${animalLabel}!`;
        }
        uiChanged = true;
      }
    } else if (task.kind === 'rest') {
      const hut = task.target;
      if (!task.insideSlot) {
        const slot = enterRestHut(d, hut.bid, unitId);
        if (slot) {
          task.insideSlot = slot;
          const info = getVillagerInfo(unitId);
          state.message = slot.breeding
            ? `${info.role} đã vào chung Lều (1 nam 1 nữ) — đang sinh thêm dân làng mới!`
            : `${info.role} đã vào Lều ngủ hồi sức...`;
          uiChanged = true;
        } else {
          setUnitAnim(unitId, 8, 0);
          state.tasks.delete(unitId);
          uiChanged = true;
          continue;
        }
      }
      task.workTicks++;
      // Advance building interior animation frame e[3030 + unitId] (13 frames for anim 115 glowing light / anim 116 breeding tent)
      e[3030 + unitId] = Math.floor(task.workTicks / 2) % 13;

      // If 1 adult male + 1 adult female are inside this Lều (state 2: e[1313] === 2) and housingCap has room, spawn newborn villager!
      if (
        e[1313 + unitId] === 2 &&
        task.workTicks === 36 &&
        state.population < state.housingCap
      ) {
        const newId = spawnNewbornVillager(d, hut.x + 1, hut.y + hut.h);
        if (newId > 0) {
          state.population = getVillagerIds().length;
          syncResourcesToData();
          const newName = getVillagerName(d, newId);
          addPopup(hut.x + 1, hut.y, `${newName} được sinh ra!`, '#9cff7b');
          showWarning(`👶 ${newName} được sinh ra!`);
          state.message = `👶 ${newName} được sinh ra! (Dân số: ${state.population}/${state.housingCap})`;
          // Switch couple back to normal sleeping state 1 (glowing light only) after birth
          let u = e[8993 + hut.bid];
          let g = 0;
          while (u > 0 && g++ < 16) {
            if (e[1313 + u] === 2) e[1313 + u] = 1;
            u = e[4545 + u];
          }
          uiChanged = true;
        }
      }

      if (task.workTicks % 2 === 0) {
        const nextEnergy = Math.min(100, (e[2020 + unitId] & 0xff) + 3);
        const maxHp = e[6767 + unitId] & 0xff;
        const nextHp = Math.min(maxHp, (e[1919 + unitId] & 0xff) + 1);
        e[2020 + unitId] = nextEnergy;
        e[1919 + unitId] = nextHp;
        if (nextEnergy >= 96 && (e[1313 + unitId] !== 2 || task.workTicks > 38)) {
          exitBuildingSlot(d, unitId);
          e[2222 + unitId] = 0;
          e[3333 + unitId] = -1;
          state.tasks.delete(unitId);
          if (!resumeSavedJob(unitId)) {
            setUnitAnim(unitId, 8, 0);
          }
          const info = getVillagerInfo(unitId);
          state.message = `${info.role} đã ngủ dậy đầy năng lượng và tiếp tục công việc!`;
          uiChanged = true;
        }
      }
    } else if (task.kind === 'eat') {
      const bld = task.target;
      // Villagers can eat inside Nhà ăn whenever cooked food is already on the table (e[8871+bid] > 0) OR a Chef is cooking!
      if (bld.targetType === 4 && !canKitchenServeFood(bld.bid)) {
        if (task.insideSlot) exitBuildingSlot(d, unitId);
        // If a Chef is currently walking to slot 0, wait quietly outside the door until the Chef arrives; otherwise cancel!
        if (isBuildingSlot0Occupied(bld.bid)) {
          setUnitAnim(unitId, 8, 0);
          continue;
        }
        state.tasks.delete(unitId);
        setUnitAnim(unitId, 8, 0);
        uiChanged = true;
        continue;
      }
      // Enter Bếp (bType 4) dining slots 1..6 (strictPreferred=true so diners NEVER fall back into Chef slot 0!)
      // Diners MUST enter inside Nhà ăn to eat — NEVER eat from outside!
      if (bld.targetType === 4 && !task.insideSlot) {
        const slot = enterBuildingWorkSlot(d, bld.bid, unitId, [1, 2, 3, 4, 5, 6], true);
        if (slot) {
          task.insideSlot = slot;
        } else {
          // All dining seats are currently full -> wait quietly outside the door until a seat opens!
          setUnitAnim(unitId, 8, 0);
          continue;
        }
      }
      task.workTicks++;
      if (bld.targetType === 4 && task.insideSlot) {
        const isLeftSide = [1, 3, 6].includes(task.insideSlot.slotIdx);
        const cooked = e[8871 + bld.bid] & 0xff;
        if (cooked <= 0) {
          // No cooked food on the Kitchen table yet -> sit & wait (banging table anim 83/84) until Chef finishes cooking!
          setUnitAnim(unitId, isLeftSide ? 83 : 84, Math.floor(task.workTicks / 2) % 12);
          continue;
        }
        // Cooked food is on the table -> play authentic eating animation WITH food bowl s1138 (anim 85/86, 19 frames)
        // for a realistic unhurried meal (~95 ticks / ~11.4s = 2.5 full eating loops)!
        task.eatTicks = (task.eatTicks || 0) + 1;
        setUnitAnim(unitId, isLeftSide ? 85 : 86, Math.floor((task.eatTicks - 1) / 2) % 19);
        if (task.eatTicks % 3 === 0) {
          e[2121 + unitId] = Math.min(100, (e[2121 + unitId] & 0xff) + 3);
          if ((e[3333 + unitId] & 0xff) === 0 && (e[2121 + unitId] & 0xff) > 30) e[3333 + unitId] = -1;
          uiChanged = true;
        }
        if (task.eatTicks >= 95) {
          e[8871 + bld.bid] = Math.max(0, cooked - 2);
          const unitOwner = unitId > 50 ? 1 : 0;
          const r = d.resources?.[unitOwner];
          const curFood = unitOwner === (state.localTribe ?? 0) ? state.food : (r?.[0] || 0);
          if (curFood > 0) {
            if (unitOwner === (state.localTribe ?? 0)) {
              state.food = Math.max(0, state.food - 1);
              syncResourcesToData(unitOwner);
            } else if (r) {
              r[0] = Math.max(0, (r[0] || 0) - 1);
            }
          }
          e[2121 + unitId] = 100;
          const maxHp = e[6767 + unitId] & 0xff;
          e[1919 + unitId] = Math.min(maxHp, (e[1919 + unitId] & 0xff) + 6);
          e[2222 + unitId] = 0;
          e[3333 + unitId] = -1;
          exitBuildingSlot(d, unitId);
          state.tasks.delete(unitId);
          if (!resumeSavedJob(unitId)) {
            setUnitAnim(unitId, 8, 0);
          }
          uiChanged = true;
        }
        continue;
      }
      // Non-Kitchen target (e.g. if Kitchen was demolished) -> cancel cleanly without eating outside
      state.tasks.delete(unitId);
      setUnitAnim(unitId, 8, 0);
      uiChanged = true;
    } else if (task.kind === 'armForBattle') {
      // Arrived at Storage during Battle Command / Enemy Engagement: grab the strongest weapon matching this villager's skill (or default to Stone / Đá ném), then SPRINT to charge!
      const owner = task.owner ?? (unitId > 50 ? 1 : 0);
      const r = d.resources?.[owner];
      const pick = findBestStorageWeaponForUnit(unitId, owner);
      if (pick) {
        if (pick.fromStock && r) {
          const oldW = e[6565 + unitId] & 0xff;
          if (oldW < 6 && oldW !== pick.weaponId) {
            r[5 + oldW] = (r[5 + oldW] || 0) + 1;
          }
          r[5 + pick.weaponId] = Math.max(0, (r[5 + pick.weaponId] || 0) - 1);
          e[6565 + unitId] = pick.weaponId;
        } else if (!pick.fromStock) {
          const curStone = owner === (state.localTribe ?? 0) ? state.stone : (r?.[2] || 0);
          if (curStone >= 1) {
            if (owner === (state.localTribe ?? 0)) {
              state.stone -= 1;
              syncResourcesToData(owner);
            } else if (r) {
              r[2] = Math.max(0, (r[2] || 0) - 1);
            }
          }
          // Default to Stone weapon (Đá ném, wId=1) so villager never charges empty-handed!
          e[6565 + unitId] = 1;
        }
      } else if ((e[6565 + unitId] & 0xff) === 9) {
        e[6565 + unitId] = 1;
      }
      e[7777 + unitId] = 3; // Keep sprinting into combat!
      state.tasks.delete(unitId);
      if (task.attackTargetType && task.attackTargetId) {
        if (!assignAttackTask(unitId, task.attackTargetType, task.attackTargetId, true)) {
          dispatchUnitToBattleFlag(unitId, task.battleX ?? task.flagX, task.battleY ?? task.flagY, owner);
        }
      } else {
        dispatchUnitToBattleFlag(unitId, task.battleX ?? task.flagX, task.battleY ?? task.flagY, owner);
      }
      uiChanged = true;
    } else if (task.kind === 'fetchWeaponAndTrain') {
      // Arrived at Storage: swap/take strongest matching weapon (or 1 Wood / 1 Stone if unarmed), then head to training!
      const owner = task.owner ?? (unitId > 50 ? 1 : 0);
      const r = d.resources?.[owner];
      if (task.fromStock && r) {
        const isThrowTrain = task.trainBld?.targetType === 5;
        const matchOrder = isThrowTrain ? [5, 2, 1] : [4, 3, 0];
        let pickedWId = (r[5 + task.weaponId] || 0) >= 1 ? task.weaponId : -1;
        if (pickedWId < 0) {
          for (const wid of matchOrder) {
            if ((r[5 + wid] || 0) >= 1) {
              pickedWId = wid;
              break;
            }
          }
        }
        if (pickedWId >= 0) {
          const oldW = e[6565 + unitId] & 0xff;
          if (oldW < 6 && oldW !== pickedWId) {
            r[5 + oldW] = Math.min(35, (r[5 + oldW] || 0) + 1);
          }
          r[5 + pickedWId] = Math.max(0, (r[5 + pickedWId] || 0) - 1);
          e[6565 + unitId] = pickedWId;
          state.tasks.delete(unitId);
          assignWorkAtBuilding(unitId, task.trainBld);
          if (owner === (state.localTribe ?? 0)) {
            const wName = WEAPONS[pickedWId]?.name || 'Vũ khí';
            state.message = task.swapOldWeapon
              ? `${getVillagerInfo(unitId).role} đã đổi sang ${wName} và đang tiến vào ${task.trainBld.spec.name}!`
              : `${getVillagerInfo(unitId).role} đã lấy ${wName} và đang tiến vào ${task.trainBld.spec.name}!`;
          }
          uiChanged = true;
          continue;
        }
        if (task.swapOldWeapon) {
          setUnitAnim(unitId, 8, 0);
          state.tasks.delete(unitId);
          uiChanged = true;
          continue;
        }
      }
      const isStone = task.resType === 'stone';
      const curAmt = owner === (state.localTribe ?? 0) ? (isStone ? state.stone : state.wood) : (r?.[isStone ? 2 : 1] || 0);
      if (curAmt >= 1) {
        if (owner === (state.localTribe ?? 0)) {
          if (isStone) state.stone -= 1;
          else state.wood -= 1;
          syncResourcesToData(owner);
        } else if (r) {
          r[isStone ? 2 : 1] = Math.max(0, (r[isStone ? 2 : 1] || 0) - 1);
        }
        e[6565 + unitId] = task.weaponId;
        state.tasks.delete(unitId);
        assignWorkAtBuilding(unitId, task.trainBld);
        if (owner === (state.localTribe ?? 0)) {
          const wName = task.weaponId === 1 ? 'Đá ném' : 'Dùi cui';
          state.message = `${getVillagerInfo(unitId).role} đã lấy ${wName} và đang tiến vào ${task.trainBld.spec.name}!`;
        }
        uiChanged = true;
      } else {
        setUnitAnim(unitId, 8, 0);
        state.tasks.delete(unitId);
        uiChanged = true;
      }
    } else if (task.kind === 'buildFetch') {
      // Builder arrived at Storage: physically deduct & pick up up to 10 materials per trip, then carry them to the construction site!
      const owner = task.owner ?? (unitId > 50 ? 1 : 0);
      const r = d.resources?.[owner];
      const need = state.siteMaterials.get(task.buildBld.bid);
      let carrySprite = 2;
      let totalTaken = 0;
      if (need) {
        const curWood = owner === (state.localTribe ?? 0) ? state.wood : (r?.[1] || 0);
        const curStone = owner === (state.localTribe ?? 0) ? state.stone : (r?.[2] || 0);
        const curTools = owner === (state.localTribe ?? 0) ? state.tools : (r?.[3] || 0);
        let remCarry = getUnitCarryCap(unitId); // max 10 materials per trip
        const takeW = Math.min(need.wood, curWood, remCarry);
        remCarry -= takeW;
        const takeS = Math.min(need.stone, curStone, remCarry);
        remCarry -= takeS;
        const takeT = Math.min(need.tools, curTools, remCarry);
        totalTaken = takeW + takeS + takeT;
        if (totalTaken > 0) {
          if (owner === (state.localTribe ?? 0)) {
            state.wood -= takeW;
            state.stone -= takeS;
            state.tools -= takeT;
            syncResourcesToData(owner);
          } else if (r) {
            r[1] = Math.max(0, (r[1] || 0) - takeW);
            r[2] = Math.max(0, (r[2] || 0) - takeS);
            r[3] = Math.max(0, (r[3] || 0) - takeT);
          }
          need.wood -= takeW;
          need.stone -= takeS;
          need.tools -= takeT;
          need.deliveredWood = (need.deliveredWood || 0) + takeW;
          need.deliveredStone = (need.deliveredStone || 0) + takeS;
          need.deliveredTools = (need.deliveredTools || 0) + takeT;
          carrySprite = takeW > 0 ? 2 : takeS > 0 ? 3 : 4;
        }
        if (need.wood <= 0 && need.stone <= 0 && need.tools <= 0) {
          state.siteMaterials.delete(task.buildBld.bid);
        }
      }
      state.tasks.delete(unitId);
      const planned = planUnitPath(unitId, task.buildBld.x, task.buildBld.y, false, task.buildBld);
      if (planned !== null) {
        if (totalTaken > 0) setUnitCarry(unitId, carrySprite, totalTaken);
        else setUnitCarry(unitId, 0, 0);
        state.tasks.set(unitId, {
          kind: 'build',
          path: planned.path,
          stepProgress: planned.stepProgress,
          target: task.buildBld,
          insideSlot: null,
          workTicks: 0,
          hatJob: 38,
          hatPutFrame: 14,
          carryWoodAfterHat: totalTaken > 0,
        });
        if (state.selectedUnit === unitId) state.activePath = planned.path;
      }
      uiChanged = true;
    } else if (task.kind === 'blacksmithFetch') {
      // Blacksmith arrived at Storage: deduct weapon materials & carry them back to Kho vũ khí!
      const owner = task.owner ?? (unitId > 50 ? 1 : 0);
      const r = d.resources?.[owner];
      const w = WEAPONS[task.weaponId];
      const curWood = owner === (state.localTribe ?? 0) ? state.wood : (r?.[1] || 0);
      const curStone = owner === (state.localTribe ?? 0) ? state.stone : (r?.[2] || 0);
      const curTools = owner === (state.localTribe ?? 0) ? state.tools : (r?.[3] || 0);
      if (w && curWood >= w.wood && curStone >= w.stone && curTools >= w.bones) {
        if (owner === (state.localTribe ?? 0)) {
          state.wood -= w.wood;
          state.stone -= w.stone;
          state.tools -= w.bones;
          syncResourcesToData(owner);
        } else if (r) {
          r[1] = Math.max(0, (r[1] || 0) - w.wood);
          r[2] = Math.max(0, (r[2] || 0) - w.stone);
          r[3] = Math.max(0, (r[3] || 0) - w.bones);
        }
        const planned = planUnitPath(unitId, task.workshop.x, task.workshop.y, false, task.workshop);
        if (planned !== null) {
          setUnitCarry(unitId, w.wood > 0 ? 2 : 3, 1);
          state.tasks.set(unitId, {
            kind: 'workBuilding',
            path: planned.path,
            stepProgress: planned.stepProgress,
            target: task.workshop,
            insideSlot: null,
            preferredSlots: [0],
            workTicks: 0,
            hasMaterials: true,
            forgingWeaponId: w.id,
            forgeTicks: 0,
            hatJob: 69,
            hatPutFrame: 14,
            hatRemoveFrame: 7,
          });
          if (state.selectedUnit === unitId) state.activePath = planned.path;
          uiChanged = true;
          continue;
        }
      }
      // If not enough materials anymore, return to workshop and nap
      state.tasks.delete(unitId);
      assignWorkAtBuilding(unitId, task.workshop, [0]);
      uiChanged = true;
    } else if (task.kind === 'blacksmithDeliver') {
      // Blacksmith arrived at Storage with newly forged weapon: drop off (anim 22) into Storage rack!
      const owner = task.owner ?? (unitId > 50 ? 1 : 0);
      const frame = task.workTicks;
      if (frame < 14) {
        setUnitAnim(unitId, 22, frame);
        if (frame === 10) {
          setUnitCarry(unitId, 0, 0);
          if (d.resources?.[owner]) {
            const slot = 5 + (task.weaponId % 6);
            d.resources[owner][slot] = Math.min(35, (d.resources[owner][slot] || 0) + 1);
          }
          const q = getWeaponQueue(task.workshop.bid);
          if (q[task.weaponId] > 0) q[task.weaponId]--;
          if (owner === (state.localTribe ?? 0)) {
            const wName = WEAPONS[task.weaponId]?.name || 'Vũ khí';
            state.message = `🔨 Thợ rèn đã giao ${wName} vào Kho chứa!`;
          }
          uiChanged = true;
        }
        task.workTicks++;
      } else {
        state.tasks.delete(unitId);
        assignWorkAtBuilding(unitId, task.workshop, [0]);
        uiChanged = true;
      }
    } else if (task.kind === 'chefFetch') {
      // Chef arrived at Storage to fetch raw Meat (carrySprite = 1) to bring back to Bếp and cook!
      const owner = task.owner ?? (unitId > 50 ? 1 : 0);
      const r = d.resources?.[owner];
      const curFood = owner === (state.localTribe ?? 0) ? state.food : (r?.[0] || 0);
      if (curFood >= 1) {
        if (owner === (state.localTribe ?? 0)) {
          state.food -= 1;
          syncResourcesToData(owner);
        } else if (r) {
          r[0] = Math.max(0, (r[0] || 0) - 1);
        }
        const planned = planUnitPath(unitId, task.kitchen.x, task.kitchen.y, false, task.kitchen);
        if (planned !== null) {
          setUnitCarry(unitId, 1, 1); // 1 = Meat sprite (authentic raw meat carried from Storage to Bếp!)
          state.tasks.set(unitId, {
            kind: 'workBuilding',
            path: planned.path,
            stepProgress: planned.stepProgress,
            target: task.kitchen,
            insideSlot: null,
            preferredSlots: [0],
            workTicks: 0,
            chefFuel: true,
            hatJob: 54,
            hatPutFrame: 14,
            hatRemoveFrame: 7,
          });
          if (state.selectedUnit === unitId) state.activePath = planned.path;
          uiChanged = true;
          continue;
        }
      }
      state.tasks.delete(unitId);
      assignWorkAtBuilding(unitId, task.kitchen, [0]);
      uiChanged = true;
    } else if (task.kind === 'workBuilding') {
      const bld = task.target;
      const isGuestSlotOnly =
        (bld.targetType === 4 || bld.targetType === 7) &&
        ((task.insideSlot && task.insideSlot.slotIdx > 0) ||
          (!task.insideSlot && Array.isArray(task.preferredSlots) && task.preferredSlots.length > 0 && !task.preferredSlots.includes(0)));
      // Dancers cannot dance in Sàn disco without a DJ; diners cannot eat in Bếp if BOTH no cooked food AND no Chef!
      const guestBlocked =
        isGuestSlotOnly &&
        (bld.targetType === 4 ? !canKitchenServeFood(bld.bid) : !isBuildingSlot0ActiveInside(bld.bid));
      if (guestBlocked) {
        if (task.insideSlot) exitBuildingSlot(d, unitId);
        if (isBuildingSlot0Occupied(bld.bid)) {
          setUnitAnim(unitId, 8, 0);
          continue;
        }
        state.tasks.delete(unitId);
        setUnitAnim(unitId, 8, 0);
        uiChanged = true;
        continue;
      }
      if (!task.insideSlot) {
        const strictPref = Array.isArray(task.preferredSlots) && task.preferredSlots.length > 0 && !task.preferredSlots.includes(0);
        const slot = enterBuildingWorkSlot(d, bld.bid, unitId, task.preferredSlots || null, strictPref);
        if (slot) {
          task.insideSlot = slot;
          const info = getVillagerInfo(unitId);
          const bt = bld.targetType;
          const roleVerb =
            bt === 4
              ? slot.slotIdx === 0
                ? 'đã vào Bếp nấu ăn'
                : 'đã vào Bếp dùng bữa'
              : bt === 7
                ? slot.slotIdx === 0
                  ? 'đã lên bàn DJ chơi nhạc'
                  : 'đã vào Sàn disco nhảy múa'
                : bt === 8
                  ? 'đã vào Khu thánh địa hành lễ'
                  : bt === 0
                    ? 'đã vào Kho vũ khí rèn đồ'
                    : bt === 10
                      ? 'đã vào Nhà trẻ vui chơi an toàn'
                      : `đã vào làm việc tại ${bld.spec.name}`;
          state.message = `${info.role} ${roleVerb}!`;
          uiChanged = true;
        } else {
          setUnitAnim(unitId, 8, 0);
          state.tasks.delete(unitId);
          uiChanged = true;
          continue;
        }
      }
      task.workTicks++;
      const bType = bld.targetType;
      const slotIdx = task.insideSlot.slotIdx;
      const unitOwner = unitId > 50 ? 1 : 0;

      // === Authentic Blacksmith (Kho vũ khí, bType 0): nap (anim 85) if queue empty; fetch -> hammer (anim 53) -> deliver weapon to Storage! ===
      if (bType === 0) {
        const q = getWeaponQueue(bld.bid);
        if (task.hasMaterials && task.forgingWeaponId !== undefined) {
          // Forging with hammer (anim 53, 3f)!
          task.forgeTicks = (task.forgeTicks || 0) + 1;
          setUnitAnim(unitId, 53, Math.floor(task.forgeTicks / 2) % 3);
          if (task.forgeTicks >= 36) {
            const wId = task.forgingWeaponId;
            exitBuildingSlot(d, unitId);
            const storage = findNearestDropoff(e[unitId] & 0xff, e[101 + unitId] & 0xff, unitOwner);
            if (storage) {
              const toStorage = planUnitPath(unitId, storage.x, storage.y, false, storage);
              if (toStorage !== null) {
                setUnitCarry(unitId, 2, 1); // carrying freshly forged weapon to Storage
                state.tasks.set(unitId, {
                  kind: 'blacksmithDeliver',
                  path: toStorage.path,
                  stepProgress: toStorage.stepProgress,
                  target: storage,
                  workshop: bld,
                  weaponId: wId,
                  owner: unitOwner,
                  workTicks: 0,
                });
                if (state.selectedUnit === unitId) state.activePath = toStorage.path;
                uiChanged = true;
                continue;
              }
            }
            // Fallback direct deposit if no storage
            if (d.resources?.[unitOwner]) {
              d.resources[unitOwner][5 + (wId % 6)] = Math.min(35, (d.resources[unitOwner][5 + (wId % 6)] || 0) + 1);
            }
            if (q[wId] > 0) q[wId]--;
            task.hasMaterials = false;
            task.forgingWeaponId = undefined;
            task.forgeTicks = 0;
            uiChanged = true;
          }
          continue;
        }
        // Check if any weapon is queued AND tribe has materials in Storage
        const r = d.resources?.[unitOwner];
        const curWood = unitOwner === (state.localTribe ?? 0) ? state.wood : (r?.[1] || 0);
        const curStone = unitOwner === (state.localTribe ?? 0) ? state.stone : (r?.[2] || 0);
        const curTools = unitOwner === (state.localTribe ?? 0) ? state.tools : (r?.[3] || 0);
        let nextWId = -1;
        let missingQueuedSprite = 0;
        for (let wid = 0; wid < WEAPONS.length; wid++) {
          const w = WEAPONS[wid];
          if ((q[wid] || 0) > 0) {
            if (curWood >= w.wood && curStone >= w.stone && curTools >= w.bones) {
              nextWId = wid;
              break;
            } else if (!missingQueuedSprite) {
              missingQueuedSprite = curWood < w.wood ? 2 : curStone < w.stone ? 3 : 4;
            }
          }
        }
        if (nextWId >= 0) {
          exitBuildingSlot(d, unitId);
          const storage = findNearestDropoff(e[unitId] & 0xff, e[101 + unitId] & 0xff, unitOwner);
          if (storage) {
            const toStorage = planUnitPath(unitId, storage.x, storage.y, false, storage);
            if (toStorage !== null) {
              setUnitCarry(unitId, 0, 0);
              state.tasks.set(unitId, {
                kind: 'blacksmithFetch',
                path: toStorage.path,
                stepProgress: toStorage.stepProgress,
                target: storage,
                workshop: bld,
                weaponId: nextWId,
                owner: unitOwner,
                workTicks: 0,
              });
              if (state.selectedUnit === unitId) state.activePath = toStorage.path;
              uiChanged = true;
              continue;
            }
          }
        }
        if (missingQueuedSprite > 0) {
          // Weapon queued in Kho vũ khí, but Storage lacks Wood/Stone/Bones -> hold up protest sign (anim 115 -> 113)!
          setUnitCarry(unitId, missingQueuedSprite, 0);
          const signFrame = task.workTicks % 25;
          if (signFrame < 13) setUnitAnim(unitId, 115, signFrame);
          else setUnitAnim(unitId, 113, (signFrame - 13) % 12);
          continue;
        }
        // No weapons queued: Blacksmith lies down and naps (authentic anim 39, 8f — b.java:1652) until a weapon is ordered!
        setUnitCarry(unitId, 0, 0);
        setUnitAnim(unitId, 39, Math.floor(task.workTicks / 3) % 8);
        continue;
      }

      // Authentic Khu thánh địa (bType 8):
      // - Slot 0 (Shaman): lies down & naps (anim 39, 8f) when NO spell ritual is ordered; only beats drum (anim 140) while casting!
      // - Slot 1+ (Patient): stands calmly (anim 8, frame 0) — NEVER alternates 8/9 or wobbles!
      if (bType === 8) {
        if (slotIdx > 0) {
          setUnitCarry(unitId, 0, 0);
          setUnitAnim(unitId, 8, 0);
          continue;
        }
        const ritual = state.shrineRituals.get(bld.bid);
        if (!ritual) {
          setUnitCarry(unitId, 0, 0);
          setUnitAnim(unitId, 39, Math.floor(task.workTicks / 3) % 8);
          continue;
        }
      }

      // Play authentic per-building, per-slot animation decoded from /a (mo[174]/mo[58]/mo[166]/mo[164]):
      const slotAnims = task.insideSlot.anims || [{ animId: 81, frames: 6 }];
      let totalFrames = 0;
      for (let ai = 0; ai < slotAnims.length; ai++) totalFrames += slotAnims[ai].frames;
      let cursor = totalFrames > 0 ? task.workTicks % totalFrames : 0;
      let chosenAnim = slotAnims[0];
      for (let ai = 0; ai < slotAnims.length; ai++) {
        if (cursor < slotAnims[ai].frames) {
          chosenAnim = slotAnims[ai];
          break;
        }
        cursor -= slotAnims[ai].frames;
      }
      setUnitAnim(unitId, chosenAnim.animId, cursor % chosenAnim.frames);

      // Authentic per-building production & training effects!
      if (bType === 4) {
        if (slotIdx === 0) {
          // Chef also eats from their own cooking to stay well-fed and healthy!
          if (task.workTicks % 20 === 0) {
            e[2121 + unitId] = 100;
            const maxHp = e[6767 + unitId] & 0xff;
            e[1919 + unitId] = Math.min(maxHp, (e[1919 + unitId] & 0xff) + 4);
            if ((e[3333 + unitId] & 0xff) === 0) e[3333 + unitId] = -1;
            uiChanged = true;
          }
          if (task.workTicks % 40 === 0) {
            // Bếp slot 0: Chef finishes cooking a batch -> serves cooked food onto THIS Kitchen's table (e[8871+bid]) & +4 food,
            // then goes to Storage to fetch raw Meat (carrySprite=1) for the next pot!
            e[8871 + bld.bid] = Math.min(40, (e[8871 + bld.bid] & 0xff) + 6);
            if (unitOwner === (state.localTribe ?? 0)) {
              state.food += 4;
              syncResourcesToData(unitOwner);
            } else if (d.resources?.[unitOwner]) {
              d.resources[unitOwner][0] = (d.resources[unitOwner][0] || 0) + 4;
            }
            const r = d.resources?.[unitOwner];
            const curFood = unitOwner === (state.localTribe ?? 0) ? state.food : (r?.[0] || 0);
            if (curFood >= 1) {
              exitBuildingSlot(d, unitId);
              const storage = findNearestDropoff(e[unitId] & 0xff, e[101 + unitId] & 0xff, unitOwner);
              if (storage) {
                const toStorage = planUnitPath(unitId, storage.x, storage.y, false, storage);
                if (toStorage !== null) {
                  state.tasks.set(unitId, {
                    kind: 'chefFetch',
                    path: toStorage.path,
                    stepProgress: toStorage.stepProgress,
                    target: storage,
                    kitchen: bld,
                    owner: unitOwner,
                    workTicks: 0,
                  });
                  if (state.selectedUnit === unitId) state.activePath = toStorage.path;
                  uiChanged = true;
                  continue;
                }
              }
            }
            uiChanged = true;
          }
        } else if (slotIdx > 0 && task.workTicks >= 24) {
          // Bếp slots 1..6: Diner finishes meal, exits & resumes previous task!
          if (state.food > 0) {
            state.food = Math.max(0, state.food - 1);
            syncResourcesToData();
            e[2121 + unitId] = 100;
            const maxHp = e[6767 + unitId] & 0xff;
            e[1919 + unitId] = Math.min(maxHp, (e[1919 + unitId] & 0xff) + 6);
            e[2222 + unitId] = 0;
            e[3333 + unitId] = -1;
          }
          exitBuildingSlot(d, unitId);
          state.tasks.delete(unitId);
          if (!resumeSavedJob(unitId)) {
            setUnitAnim(unitId, 8, 0);
          }
          uiChanged = true;
        }
      } else if (bType === 1 || bType === 5) {
        // Authentic /a mo[126]: bType 1 (Phòng tập đánh) -> skillId 14 -> e[1717];
        // bType 5 (Trung tâm bia / Khu tập ném) -> skillId 15 -> e[1616]!
        const curLvRaw = (bType === 1 ? e[1717 + unitId] : e[1616 + unitId]) & 0xff;
        const trainTarget = 220 + curLvRaw * 35;
        if (task.workTicks >= trainTarget) {
          const nextMax = Math.min(120, (e[6767 + unitId] & 0xff) + 8);
          e[6767 + unitId] = nextMax;
          e[1919 + unitId] = nextMax;
          const nextLv = Math.min(9, curLvRaw + 1);
          if (bType === 1) {
            e[1717 + unitId] = nextLv; // Melee skill (skillId 14)
          } else {
            e[1616 + unitId] = nextLv; // Throwing skill (skillId 15)
          }
          syncTopCombatSkills(unitId);
          if ((unitId > 50 ? 1 : 0) === (state.localTribe ?? 0)) {
            const info = getVillagerInfo(unitId);
            const skName = bType === 1 ? 'Cận chiến' : 'Ném';
            addPopup(bld.x + Math.floor(bld.w / 2), bld.y, `${skName} Lv.${nextLv}!`, '#fff37b');
            state.message = `${info.role} đã lên kỹ năng ${skName} cấp ${nextLv} (HP ${nextMax})!`;
          }
          if (nextLv >= 9) {
            exitBuildingSlot(d, unitId);
            state.tasks.delete(unitId);
            state.savedJobs.delete(unitId);
            setUnitAnim(unitId, 8, 0);
          } else {
            // Continue training inside until max Lv 9, hungry/sleepy, or evicted by player
            task.workTicks = 0;
          }
          uiChanged = true;
        }
      } else if (bType === 7) {
        if (slotIdx === 0 && task.workTicks % 45 === 0) {
          // Sàn Disco slot 0: DJ boosts tribe mood & energy!
          for (const id of getVillagerIds(unitOwner)) {
            e[505 + id] = Math.min(100, (e[505 + id] & 0xff) + 12);
            e[2020 + id] = Math.min(100, (e[2020 + id] & 0xff) + 8);
            if ((e[3333 + id] & 0xff) === 1) e[3333 + id] = -1;
          }
          uiChanged = true;
        } else if (slotIdx > 0 && task.workTicks % 16 === 0) {
          // Sàn Disco slots 1..6: Dancers enjoy music & recover mood/energy, then resume previous task!
          e[505 + unitId] = Math.min(100, (e[505 + unitId] & 0xff) + 18);
          e[2020 + unitId] = Math.min(100, (e[2020 + unitId] & 0xff) + 10);
          e[3333 + unitId] = -1;
          if (task.workTicks >= 96) {
            e[505 + unitId] = 100;
            exitBuildingSlot(d, unitId);
            state.tasks.delete(unitId);
            if (!resumeSavedJob(unitId)) {
              setUnitAnim(unitId, 8, 0);
            }
            uiChanged = true;
          }
        }
      } else if (bType === 8) {
        // Khu thánh địa: Shaman beats the drum while casting an ordered spell, then triggers its effect & returns to napping!
        const ritual = state.shrineRituals.get(bld.bid);
        if (ritual) {
          ritual.ticks = (ritual.ticks || 0) + 1;
          if (ritual.ticks >= (ritual.duration || 45)) {
            state.shrineRituals.delete(bld.bid);
            applyShamanSpellEffect(ritual.spell, bld);
            uiChanged = true;
          }
        }
      } else if ((bType === 9 || bType === 11) && task.workTicks === 10) {
        // Trung tâm PIA / Chòi canh: expands fog of war radius!
        revealFog(d, bld.x + Math.floor(bld.w / 2), bld.y + Math.floor(bld.h / 2), bType === 11 ? 8 : 7);
      }
    } else if (task.kind === 'courtship') {
      // Authentic Prehistoric Tribes courtship & reproduction (b.java:3357-3473, 4142-4210):
      // 1) Male picks a flower (anim 155/156 -> carry=15) while Female walks to Lều meeting spot
      // 2) Both stand side-by-side facing each other (dir 0 vs dir 4); waiting male holds flower (anim 9)
      // 3) Flower gifting (anim 157 male / anim 158 female; at frame 6 flower transfers carry=15 to female)
      // 4) Both enter the Lều -> e[1313]=2 (rocking tent anim 116 + d(90)) -> newborn baby (age=1) is born!
      const pair = task.pair;
      const partnerId = task.role === 'male' ? pair.femaleId : pair.maleId;
      const partnerTask = state.tasks.get(partnerId);
      const cancelPair = () => {
        for (const uid of [pair.maleId, pair.femaleId]) {
          if (isUnitInsideBuilding(d, uid)) exitBuildingSlot(d, uid);
          setUnitCarry(uid, 0, 0);
          e[3333 + uid] = -1;
          setUnitAnim(uid, 8, 0);
          state.tasks.delete(uid);
        }
        uiChanged = true;
      };

      // Abort cleanly if either partner was reassigned or died
      if (!partnerTask || partnerTask.kind !== 'courtship' || partnerTask.pair !== pair) {
        cancelPair();
        continue;
      }

      // Authentic Love/Hearts thought bubble (thought 1 = anim 78, b.java:1990) on BOTH lovers while courting in front of the Hut!
      if (pair.stage !== 'inHut') {
        e[3333 + pair.maleId] = 1;
        e[3333 + pair.femaleId] = 1;
      }

      task.workTicks++;
      if (pair.stage === 'pickFlower') {
        if (task.role === 'male') {
          pair.pickTicks++;
          // Bend down & pick flower: anim 155 (10f) then anim 156 (10f)
          if (pair.pickTicks <= 10) {
            setUnitAnim(unitId, 155, (pair.pickTicks - 1) % 10);
          } else if (pair.pickTicks <= 18) {
            setUnitCarry(unitId, 15, 1); // flower bouquet in hand!
            setUnitAnim(unitId, 156, (pair.pickTicks - 11) % 10);
          } else {
            setUnitCarry(unitId, 15, 1);
            const planned =
              planUnitPath(unitId, pair.meetX1, pair.meetY1, false) ??
              planUnitPath(unitId, pair.meetX1, pair.meetY1, true);
            if (planned === null) {
              cancelPair();
              continue;
            }
            task.path = planned.path;
            task.stepProgress = planned.stepProgress;
            pair.stage = 'walkToMeet';
          }
        } else {
          // Female arrived early in front of the Hut -> wait empty-handed facing West (dir 4) with Love bubble!
          setUnitCarry(unitId, 0, 0);
          e[606 + unitId] = 4;
          setUnitAnim(unitId, 8, 0);
          pair.femaleReady = true;
        }
      } else if (pair.stage === 'walkToMeet') {
        if (task.role === 'male') {
          pair.maleReady = true;
          e[606 + unitId] = 0; // face East toward partner in front of Lều
          setUnitAnim(unitId, 9, 0); // standing idle holding flower bouquet (aw=2)
        } else {
          pair.femaleReady = true;
          setUnitCarry(unitId, 0, 0);
          e[606 + unitId] = 4; // face West toward partner in front of Lều
          setUnitAnim(unitId, 8, 0);
        }
        pair.waitTicks++;
        if (pair.maleReady && pair.femaleReady) {
          pair.stage = 'giveFlower';
          pair.giftTicks = 0;
          const mName = getVillagerName(d, pair.maleId);
          const fName = getVillagerName(d, pair.femaleId);
          state.message = `💐 ${mName} đang tặng hoa cho ${fName} trước Lều!`;
          uiChanged = true;
        } else if (pair.waitTicks > 220) {
          cancelPair();
          continue;
        }
      } else if (pair.stage === 'giveFlower') {
        // Advance shared gift timer once per tick (driven by male)
        if (task.role === 'male') pair.giftTicks++;
        const giftFrame = Math.min(8, Math.floor(pair.giftTicks / 2));
        e[606 + pair.maleId] = 0;
        e[606 + pair.femaleId] = 4;
        if (giftFrame >= 6 && (e[3535 + pair.maleId] & 0xff) === 15) {
          // Exact port of b.java:3444: flower bouquet transfers from male to female at frame 6!
          setUnitCarry(pair.maleId, 0, 0);
          setUnitCarry(pair.femaleId, 15, 1);
        }
        setUnitAnim(pair.maleId, 157, giftFrame);
        setUnitAnim(pair.femaleId, 158, giftFrame);
        if (pair.giftTicks >= 24) {
          pair.stage = 'enterHut';
          const mHutPath = planUnitPath(pair.maleId, pair.hut.x, pair.hut.y, false, pair.hut);
          const fHutPath = planUnitPath(pair.femaleId, pair.hut.x, pair.hut.y, false, pair.hut);
          const mTask = state.tasks.get(pair.maleId);
          const fTask = state.tasks.get(pair.femaleId);
          if (mTask && mHutPath) {
            mTask.path = mHutPath.path;
            mTask.stepProgress = mHutPath.stepProgress;
          }
          if (fTask && fHutPath) {
            fTask.path = fHutPath.path;
            fTask.stepProgress = fHutPath.stepProgress;
          }
        }
      } else if (pair.stage === 'enterHut' || pair.stage === 'inHut') {
        if (!isUnitInsideBuilding(d, unitId)) {
          setUnitCarry(unitId, 0, 0);
          const slot = enterRestHut(d, pair.hut.bid, unitId);
          if (!slot) {
            cancelPair();
            continue;
          }
          if (task.role === 'male') pair.maleInHut = true;
          else pair.femaleInHut = true;
          if (pair.maleInHut && pair.femaleInHut) {
            pair.stage = 'inHut';
            pair.hutTicks = 0;
          }
        }
        e[3030 + unitId] = task.workTicks & 0xff;
        if (pair.maleInHut && pair.femaleInHut) {
          if (task.role === 'male') pair.hutTicks++;
          if (pair.hutTicks >= 80 && !pair.born) {
            pair.born = true;
            const pairOwner = pair.maleId > 50 ? 1 : 0;
            const pairPop = getVillagerIds(pairOwner).length;
            const pairHuts = getPlayerBuildings(pairOwner).filter((b) => !b.underConstruction && b.targetType === 2).length;
            const pairCap = Math.max(6, 6 + pairHuts * 6);
            if (pairPop < pairCap) {
              const newId = spawnNewbornVillager(d, pair.hut.x + 1, pair.hut.y + pair.hut.h, pairOwner);
              if (newId > 0) {
                if (pairOwner === (state.localTribe ?? 0)) {
                  state.population = getVillagerIds(pairOwner).length;
                  const babyName = getVillagerName(d, newId);
                  state.message = `🎉 Em bé sơ sinh ${babyName} đã chào đời tại Lều!`;
                }
              }
            }
            for (const uid of [pair.maleId, pair.femaleId]) {
              exitBuildingSlot(d, uid);
              setUnitCarry(uid, 0, 0);
              e[2020 + uid] = 100;
              e[505 + uid] = 100;
              e[2222 + uid] = 0;
              e[3333 + uid] = -1;
              setUnitAnim(uid, 8, 0);
              state.tasks.delete(uid);
            }
            uiChanged = true;
          }
        }
      }
    }
  }

  // Flying projectiles and Enemy AI
  if (stepProjectiles()) uiChanged = true;
  if (state.aiMode && state.animTick % 22 === 0) {
    if (stepAiCommander()) uiChanged = true;
  } else if (!state.mpMode && !state.aiMode && stepEnemyAI()) {
    uiChanged = true;
  }

  // Per-unit aggro scan radius: adult villagers seeing a nearby enemy (or enemy near a tribe building) immediately run to grab a weapon (default Stone) and fight back!
  if (state.animTick % 6 === 0) {
    const tribesToScan = state.mpMode || state.aiMode ? [0, 1] : [0];
    for (const owner of tribesToScan) {
      const allies = getVillagerIds(owner);
      const enemies = getEnemyIds(owner);
      if (enemies.length === 0) continue;
      const ownBlds = getPlayerBuildings(owner);
      for (const uid of allies) {
        if ((e[1414 + uid] & 0xff) < 12) continue; // children don't fight
        const curTask = state.tasks.get(uid);
        // Never interrupt existing combat, weapon fetching, or courtship
        if (
          curTask &&
          (curTask.kind === 'attackUnit' ||
            curTask.kind === 'attackBuilding' ||
            curTask.kind === 'armForBattle' ||
            curTask.kind === 'courtship')
        ) {
          continue;
        }
        const info = getVillagerInfo(uid);
        const ux = info.x;
        const uy = info.y;
        const insideBuilding = isUnitInsideBuilding(d, uid);
        const hasWeapon = (e[6565 + uid] & 0xff) < 9;
        // Idle/walking villagers scan 6 tiles; busy workers/builders defend when enemy is within 6 tiles (or 4 tiles if inside a building)
        const isBusyWorker = Boolean(curTask && curTask.kind !== 'move');
        const scanRadius = insideBuilding ? 4 : isBusyWorker ? 6 : getUnitRange(uid) > 1 ? 7 : hasWeapon ? 6 : 6;
        let nearestEnemy = 0;
        let bestDist = scanRadius + 0.01;
        for (const eid of enemies) {
          if (isUnitInsideBuilding(d, eid)) continue;
          const ex = e[eid] & 0xff;
          const ey = e[101 + eid] & 0xff;
          const dist = Math.hypot(ex - ux, ey - uy);
          if (dist <= bestDist) {
            bestDist = dist;
            nearestEnemy = eid;
            continue;
          }
          // Also react if an enemy is attacking/threatening a nearby tribe building within 4 tiles of the enemy and 9 tiles of this villager!
          if (!insideBuilding && dist <= 9) {
            const threateningBase = ownBlds.some((b) => distanceToRect(ex, ey, b) <= 3);
            if (threateningBase && dist < bestDist + 3) {
              bestDist = dist;
              nearestEnemy = eid;
            }
          }
        }
        if (nearestEnemy > 0) {
          assignAttackTask(uid, 'unit', nearestEnemy);
          uiChanged = true;
        }
      }
    }
  }

  // Every-tick wild animal smooth movement & AI: Deer (kind 2) flee from people;
  // Boars (kind 0) & Tigers (kind 1) attack BOTH player & enemy adults and glide smoothly with authentic walk/idle animations!
  if (stepWildAnimals()) uiChanged = true;

  // Periodic villager survival needs, thought bubbles, auto self-care & tribe births
  if (state.animTick % 28 === 0) {
    if (stepVillagerNeeds()) uiChanged = true;
  }

  // Periodic Tribe Auto-AI assignment (disabled in 1v1 PvP & Vs AI so player has full control)
  if (!state.mpMode && !state.aiMode && state.animTick % 18 === 0) {
    runTribeAutoAI();
  }

  // Keep overhead job badges (e[2222]) strictly synced with each villager's actual current task
  for (const id of getVillagerIds(0)) {
    syncUnitJobBadge(id);
  }
  if (state.mpMode || state.aiMode) {
    for (const id of getVillagerIds(1)) {
      syncUnitJobBadge(id);
    }
  }

  // Evaluate 1v1 Multiplayer / Vs AI Victory OR Campaign Mission Victory
  if ((state.mpMode || state.aiMode) && state.localTribe === 0 && state.mpWinner === null && state.animTick % 10 === 0) {
    const t0Alive = getVillagerIds(0).length;
    const t1Alive = getVillagerIds(1).length;
    if (t1Alive === 0 || t0Alive === 0) {
      state.mpWinner = t1Alive === 0 ? 0 : 1;
      const hostWon = state.mpWinner === 0;
      const redLabel = state.aiMode ? 'Máy AI (Bộ lạc Đỏ)' : 'Bộ lạc Đỏ';
      state.missionResult = {
        status: hostWon ? 'victory' : 'defeat',
        reason: hostWon ? `Bộ lạc Xanh đã đánh bại ${redLabel}!` : `${redLabel} đã chiến thắng trận đấu!`,
        epilogue: '',
        score: {
          population: t0Alive,
          buildingsBuilt: state.missionStats.buildingsBuilt,
          enemiesKilled: state.missionStats.enemiesKilled,
          enemyBuildingsDestroyed: state.missionStats.enemyBuildingsDestroyed,
          resourcesTotal: state.food + state.wood + state.stone + state.tools,
          totalScore: (t0Alive * 100) + (state.missionStats.enemiesKilled * 50),
        },
      };
      state.message = hostWon ? '🏆 CHIẾN THẮNG! Bộ lạc Xanh đã giành thắng lợi!' : `💀 THẤT BẠI! ${redLabel} đã chiến thắng!`;
      uiChanged = true;
    }
  } else if (!state.mpMode && !state.aiMode && !state.victoryDismissed && state.animTick % 12 === 0) {
    const evalRes = getCurrentMissionEvaluation();
    if (evalRes.status === 'victory' || evalRes.status === 'defeat') {
      const score = computeMissionScore({
        population: state.population,
        buildingsBuilt: state.missionStats.buildingsBuilt,
        enemyBuildingsDestroyed: state.missionStats.enemyBuildingsDestroyed,
        enemiesKilled: state.missionStats.enemiesKilled,
        food: state.food,
        wood: state.wood,
        stone: state.stone,
        tools: state.tools,
      });
      const epilogue =
        evalRes.status === 'victory' ? getMissionDialogue(state.storyLines, state.scenarioIndex, 'outro')?.[0]?.text || '' : '';
      state.missionResult = { status: evalRes.status, reason: evalRes.reason, epilogue, score };
      if (evalRes.status === 'victory' && state.music) midiSynth.playTrack(4);
      state.message = evalRes.status === 'victory' ? `HURRAH! CHIẾN THẮNG! ${evalRes.reason}` : `THẤT BẠI! ${evalRes.reason}`;
      uiChanged = true;
    }
  }

  // Gentle idle animation tick for stationary villagers
  if (state.animTick % 5 === 0 && fo) {
    for (const id of getVillagerIds()) {
      if (state.tasks.has(id)) continue;
      const animId = e[fo[29] + id] & 0xff;
      const frameCount = d.byteSpriteTables[4][animId] & 0xff;
      if (frameCount > 1) {
        e[fo[30] + id] = (e[fo[30] + id] + 1) % frameCount;
      }
    }
  }

  // Broadcast authoritative world snapshot from Host -> Guest in 1v1 Multiplayer
  if (state.mpMode && state.localTribe === 0 && mpClient?.connected) {
    mpClient.sendSnapshot(packWorldSnapshot(d, state));
  }

  draw();
  if (uiChanged) updatePanel();
}

function stepWildAnimals() {
  const d = state.data;
  if (!d) return false;
  const e = d.entityData;
  const w = d.width;
  const h = d.height;
  let changed = false;

  // Collect living outside people of BOTH tribes (player 1..50 AND enemy 51..100)
  const people = [];
  for (let uid = 1; uid <= 100; uid++) {
    if ((e[1919 + uid] & 0xff) <= 0) continue;
    if (isUnitInsideBuilding(d, uid)) continue;
    people.push({ uid, x: e[uid] & 0xff, y: e[101 + uid] & 0xff, age: e[1414 + uid] & 0xff });
  }

  // Collect player buildings (bid 1..30) separately so wandering predators stay far away from the player's home
  const playerBlds = [];
  const allBlds = [];
  for (let bid = 1; bid <= 60; bid++) {
    if ((e[8505 + bid] & 0xff) > 0) {
      const b = { x: e[8383 + bid] & 0xff, y: e[8444 + bid] & 0xff };
      allBlds.push(b);
      if (bid <= 30) playerBlds.push(b);
    }
  }
  const nearPlayerBld = (x, y, radius) => playerBlds.some((b) => Math.hypot(b.x - x, b.y - y) < radius);
  const nearAnyBld = (x, y, radius) => allBlds.some((b) => Math.hypot(b.x - x, b.y - y) < radius);

  const canStepAnimal = (nx, ny) =>
    nx >= 1 && ny >= 1 && nx < w - 1 && ny < h - 1 && d.occupancy[ny][nx] === 0 && (d.terrain[ny][nx] & 0xff) < 175;

  const startAnimalStep = (aid, ax, ay, nx, ny, walkAnim, totalTicks) => {
    if (d.occupancy[ay][ax] === 101 + aid) d.occupancy[ay][ax] = 0;
    const dx = nx - ax;
    const dy = ny - ay;
    e[9359 + aid] = nx;
    e[9381 + aid] = ny;
    e[9645 + aid] = nx;
    e[9667 + aid] = ny;
    e[9403 + aid] = (-dx * CELL_WIDTH) & 0xff;
    e[9425 + aid] = (-dy * CELL_HEIGHT) & 0xff;
    e[9491 + aid] = directionFromDelta(dx, dy);
    e[9557 + aid] = walkAnim;
    const frames = Math.max(1, d.byteSpriteTables[4][walkAnim] & 0xff);
    e[9579 + aid] = ((e[9579 + aid] & 0xff) + 1) % frames;
    d.occupancy[ny][nx] = 101 + aid;
    state.animalMoves.set(aid, { dx, dy, progress: 0, total: totalTicks, walkAnim });
    changed = true;
  };

  for (let aid = 0; aid < 22; aid++) {
    const hp = e[9513 + aid] & 0xff;
    if (hp <= 0) {
      state.animalMoves.delete(aid);
      continue;
    }
    const kind = e[9535 + aid] & 0xff; // 0 = Boar, 1 = Tiger, 2 = Deer
    const idleAnim = kind === 0 ? 48 : kind === 1 ? 50 : 52;
    const walkAnim = kind === 0 ? 47 : kind === 1 ? 49 : 51;

    // 1. Continue smooth sub-tile glide if currently stepping between tiles
    const mv = state.animalMoves.get(aid);
    if (mv) {
      mv.progress++;
      const fracLeft = Math.max(0, 1 - mv.progress / mv.total);
      e[9403 + aid] = Math.round(-mv.dx * CELL_WIDTH * fracLeft) & 0xff;
      e[9425 + aid] = Math.round(-mv.dy * CELL_HEIGHT * fracLeft) & 0xff;
      e[9557 + aid] = mv.walkAnim;
      const frames = Math.max(1, d.byteSpriteTables[4][mv.walkAnim] & 0xff);
      e[9579 + aid] = ((e[9579 + aid] & 0xff) + 1) % frames;
      if (mv.progress >= mv.total) {
        e[9403 + aid] = 0;
        e[9425 + aid] = 0;
        state.animalMoves.delete(aid);
      }
      changed = true;
      continue;
    }

    const ax = e[9359 + aid] & 0xff;
    const ay = e[9381 + aid] & 0xff;

    // Find nearest living person (Deer flees from anyone; Boars/Tigers aggro adults of BOTH player & enemy tribes!)
    let nearest = null;
    let bestDist = Infinity;
    for (const p of people) {
      if (kind !== 2 && p.age < 12) continue; // Predators only attack adults (children are invulnerable)
      const dist = Math.max(Math.abs(p.x - ax), Math.abs(p.y - ay));
      if (dist < bestDist) {
        bestDist = dist;
        nearest = p;
      }
    }

    if (kind === 2) {
      // === DEER (Hươu): flees smoothly when any person comes within 4 tiles ===
      if (nearest && bestDist <= 4) {
        let bestMove = null;
        let bestScore = bestDist;
        for (const s of DIRS) {
          const nx = ax + s.dx;
          const ny = ay + s.dy;
          if (!canStepAnimal(nx, ny)) continue;
          const nd = Math.hypot(nx - nearest.x, ny - nearest.y);
          if (nd > bestScore) {
            bestScore = nd;
            bestMove = { nx, ny };
          }
        }
        if (bestMove) {
          startAnimalStep(aid, ax, ay, bestMove.nx, bestMove.ny, walkAnim, 4);
          continue;
        }
      }
    } else {
      // === BOAR (Lợn rừng, kind 0) & TIGER (Cọp, kind 1): chase & attack BOTH player & enemy adults! ===
      const aggroRange = kind === 1 ? 5 : 4;
      if (nearest && bestDist <= aggroRange) {
        if (bestDist <= 1) {
          // Adjacent -> attack adult (player OR enemy) with fluid attack/run animation!
          e[9491 + aid] = directionFromDelta(nearest.x - ax, nearest.y - ay);
          e[9557 + aid] = walkAnim;
          const frames = Math.max(1, d.byteSpriteTables[4][walkAnim] & 0xff);
          e[9579 + aid] = ((e[9579 + aid] & 0xff) + 1) % frames;
          if ((state.animTick + aid) % 8 === 0) {
            const dmg = kind === 1 ? 7 : 4;
            applyUnitDamage(0, nearest.uid, dmg);
            // Attacked adult (player OR enemy tribe) automatically retaliates!
            if ((e[1919 + nearest.uid] & 0xff) > 0 && nearest.age >= 12) {
              const curT = state.tasks.get(nearest.uid);
              if (!curT || (curT.kind !== 'hunt' && curT.kind !== 'attackUnit' && curT.kind !== 'armForBattle')) {
                assignHuntTask(nearest.uid, 101 + aid);
              }
            }
            changed = true;
          }
          continue;
        } else {
          // Chase closer toward the target (avoiding chasing deep inside the player's town center)
          let bestMove = null;
          let bestStepDist = Infinity;
          for (const s of DIRS) {
            const nx = ax + s.dx;
            const ny = ay + s.dy;
            if (!canStepAnimal(nx, ny)) continue;
            if (nearest.uid <= 50 && nearPlayerBld(nx, ny, 8) && !nearPlayerBld(ax, ay, 8)) continue;
            const nd = Math.hypot(nx - nearest.x, ny - nearest.y);
            if (nd < bestStepDist) {
              bestStepDist = nd;
              bestMove = { nx, ny };
            }
          }
          if (bestMove) {
            startAnimalStep(aid, ax, ay, bestMove.nx, bestMove.ny, walkAnim, kind === 1 ? 4 : 5);
            // If an adult sees a boar/tiger charging right next to them (<= 2 tiles), fight back!
            if (bestStepDist <= 2 && nearest.age >= 12) {
              const curT = state.tasks.get(nearest.uid);
              if (!curT || (curT.kind !== 'hunt' && curT.kind !== 'attackUnit' && curT.kind !== 'armForBattle')) {
                assignHuntTask(nearest.uid, 101 + aid);
              }
            }
            continue;
          }
        }
      }
    }

    // Relaxed forest wandering (keeps Boars/Tigers >= 14 tiles from player's buildings and Deer >= 10 tiles)
    if ((state.animTick + aid * 13) % 36 === 0) {
      const s = DIRS[(Math.floor(state.animTick / 7) + aid * 3) % DIRS.length];
      const nx = ax + s.dx;
      const ny = ay + s.dy;
      const safeFromPlayer = kind === 2 ? !nearPlayerBld(nx, ny, 10) : !nearPlayerBld(nx, ny, 14);
      if (canStepAnimal(nx, ny) && safeFromPlayer && !nearAnyBld(nx, ny, 6)) {
        startAnimalStep(aid, ax, ay, nx, ny, walkAnim, 7);
        continue;
      }
    }
    e[9557 + aid] = idleAnim;
    if (state.animTick % 2 === 0) {
      const idleFrames = Math.max(1, d.byteSpriteTables[4][idleAnim] & 0xff);
      e[9579 + aid] = ((e[9579 + aid] & 0xff) + 1) % idleFrames;
    }
  }
  return changed;
}

function stepVillagerNeeds() {
  const d = state.data;
  if (!d) return false;
  const e = d.entityData;
  const tribes = state.mpMode || state.aiMode ? [0, 1] : [state.localTribe ?? 0];
  let changed = false;

  const getHutOccupantCount = (bid) => {
    let cnt = 0;
    let cur = e[8993 + bid];
    let guard = 0;
    while (cur > 0 && guard++ < 16) {
      cnt++;
      cur = e[4545 + cur];
    }
    for (const t of state.tasks.values()) {
      if (t.kind === 'rest' && t.target?.bid === bid && !t.insideSlot) cnt++;
    }
    return cnt;
  };

  const pickNearestBld = (list, ux, uy, checkHutCapacity = false) => {
    let best = null;
    let bestDist = Infinity;
    for (const b of list) {
      if (checkHutCapacity && getHutOccupantCount(b.bid) >= 4) continue;
      const dist = Math.hypot(b.x + b.w / 2 - ux, b.y + b.h / 2 - uy);
      if (dist < bestDist) {
        bestDist = dist;
        best = b;
      }
    }
    return best;
  };

  for (const tribe of tribes) {
    const ids = getVillagerIds(tribe);
    const tribeBlds = getPlayerBuildings(tribe);
    const finishedHuts = tribeBlds.filter((b) => !b.underConstruction && b.targetType === 2);
    const finishedKitchens = tribeBlds.filter((b) => !b.underConstruction && b.targetType === 4);
    const finishedDiscos = tribeBlds.filter((b) => !b.underConstruction && b.targetType === 7);
    const finishedKindergartens = tribeBlds.filter((b) => !b.underConstruction && b.targetType === 10);
    const tribeFood = tribe === (state.localTribe ?? 0) ? state.food : (d.resources?.[tribe]?.[0] || 0);

    for (const id of ids) {
      const task = state.tasks.get(id);
      const age = e[1414 + id] & 0xff;

      // Children (age < 12) grow up gradually, play around the village, or enter Nhà trẻ (bType 10, b.java:2716) for safety!
      if (age < 12) {
        e[2121 + id] = 100;
        e[2020 + id] = 100;
        e[505 + id] = 100;
        e[3333 + id] = -1;
        if (state.animTick % 140 === 0) {
          const nextAge = age + 1;
          e[1414 + id] = nextAge;
          if (nextAge >= 12) {
            if (isUnitInsideBuilding(d, id)) {
              exitBuildingSlot(d, id);
              state.tasks.delete(id);
            }
            e[6767 + id] = 42;
            e[1919 + id] = 42;
            syncUnitAvatar(d, id, id);
            setUnitAnim(id, 8, 0);
            if (tribe === (state.localTribe ?? 0)) {
              state.message = `🎂 ${getVillagerName(d, id)} đã trưởng thành và sẵn sàng lao động!`;
            }
            changed = true;
          }
        } else if (!task && !isUnitInsideBuilding(d, id)) {
          if (finishedKindergartens.length > 0 && age < 12) {
            const kg = pickNearestBld(finishedKindergartens, e[id] & 0xff, e[101 + id] & 0xff);
            if (kg && assignWorkAtBuilding(id, kg)) {
              changed = true;
              continue;
            }
          }
          setUnitAnim(id, Math.random() < 0.45 ? 46 : 14, 0);
        }
        continue;
      }

      if (task?.kind === 'rest' || task?.kind === 'eat' || task?.kind === 'courtship') continue;
      if (task?.kind === 'workBuilding' && task.target?.targetType === 7 && (task.insideSlot?.slotIdx ?? 0) > 0) continue;

      const working = Boolean(task);
      const satiety = Math.max(0, (e[2121 + id] & 0xff) - (working ? 2 : 1));
      const energy = Math.max(0, (e[2020 + id] & 0xff) - (working ? 2 : 1));
      const mood = Math.max(0, (e[505 + id] & 0xff) - 1);
      e[2121 + id] = satiety;
      e[2020 + id] = energy;
      e[505 + id] = mood;

      // Authentic thought bubbles decoded directly from mo[56] (b.java:1994-2006):
      // 0 = hungry/food (anim 77), 1 = love/courtship ONLY (anim 78), 2 = sleepy/Zzz (anim 79),
      // 3 = low HP (anim 80), 4 = very sad/bored (mood 0..19, anim 81), 5 = sad/unhappy (mood 20..39, anim 82)
      if (satiety <= 20) e[3333 + id] = 0;
      else if (energy <= 20) e[3333 + id] = 2;
      else if ((e[1919 + id] & 0xff) <= 15) e[3333 + id] = 3;
      else if (mood <= 19) e[3333 + id] = 4;
      else if (mood <= 30) e[3333 + id] = 5;
      else e[3333 + id] = -1;

      // Autonomous self-care (after eating/sleeping/dancing, resumeSavedJob() returns them to their previous job!):
      // - Hungry -> seek Bếp (if Bếp exists & food > 0); otherwise just keep showing thought bubble!
      // - Sleepy -> seek Lều (if Lều exists); otherwise just keep showing thought bubble!
      // - Bored  -> seek Sàn disco (if Sàn disco exists); otherwise just keep showing thought bubble!
      const isCombatTask =
        task &&
        (task.kind === 'attackUnit' ||
          task.kind === 'attackBuilding' ||
          task.kind === 'armForBattle' ||
          task.kind === 'hunt');
      const thresh = task ? 20 : 38;
      const canBreak = !isCombatTask && (!task || satiety <= thresh || energy <= thresh || mood <= thresh);
      if (canBreak) {
        const info = getVillagerInfo(id);
        const ux = info.x;
        const uy = info.y;
        const isChefInKitchen =
          task?.kind === 'workBuilding' && task.target?.targetType === 4 && (task.insideSlot?.slotIdx ?? 0) === 0;
        const isDjInDisco =
          task?.kind === 'workBuilding' && task.target?.targetType === 7 && (task.insideSlot?.slotIdx ?? 0) === 0;
        const kitchensReady = finishedKitchens.filter((b) => canKitchenServeFood(b.bid));
        const discosWithDj = finishedDiscos.filter((b) => isBuildingSlot0ActiveInside(b.bid));
        if (satiety <= thresh && !isChefInKitchen && kitchensReady.length > 0) {
          const kitchen = pickNearestBld(kitchensReady, ux, uy);
          if (kitchen && assignEatTask(id, kitchen)) changed = true;
        } else if (energy <= thresh && finishedHuts.length > 0) {
          const hut = pickNearestBld(finishedHuts, ux, uy, true);
          if (hut && assignRestTask(id, hut)) changed = true;
        } else if (mood <= thresh && !isDjInDisco && discosWithDj.length > 0) {
          const disco = pickNearestBld(discosWithDj, ux, uy);
          if (disco && assignWorkAtBuilding(id, disco, [1, 2, 3, 4, 5, 6])) changed = true;
        }
      }
      if (id === state.selectedUnit) changed = true;
    }
  }
  const finishedHuts = getPlayerBuildings().filter((b) => !b.underConstruction && b.targetType === 2);

  // Authentic berry bush & mushroom gradual regrowth (b.java:4660-4675) + gentle forest wildlife respawn
  if (state.animTick % 600 === 0 && getWildAnimals().length < 6) {
    populateForestWildlife(d, 8);
  }
  if (state.animTick % 112 === 0) {
    for (let idx = 0; idx < 50; idx++) {
      const kind = e[9833 + idx] & 0xff;
      if (kind >= 1 && kind <= 4) {
        const maxCap = (d.mapTableData?.[d.mapTableOffsets?.[110] + kind] & 0xff) || 20;
        const cur = e[9883 + idx] & 0xff;
        if (cur < maxCap) {
          const next = Math.min(maxCap, cur + 2);
          e[9883 + idx] = next;
          const ratio = next / Math.max(1, maxCap);
          e[9933 + idx] = next <= 0 ? 0 : ratio <= 0.35 ? 1 : ratio <= 0.7 ? 2 : 3;
        }
      }
    }
  }

  // Authentic automatic courtship & tribe reproduction (balanced RTS pace: first ~72s, then every ~90s):
  if (
    state.population < state.housingCap &&
    finishedHuts.length > 0 &&
    state.animTick >= 600 &&
    state.animTick % 750 === 0
  ) {
    if (startCourtshipPair(false)) changed = true;
  }

  return changed;
}

function getCurrentMissionEvaluation() {
  return evaluateMissionObjectives(state.scenarioIndex, {
    population: state.population,
    food: state.food,
    playerBuildings: getPlayerBuildings(),
    enemyCount: getEnemyIds().length,
    enemyBuildingCount: getEnemyBuildings().length,
    isCustomGame: state.isCustomGame,
    initialEnemies: state.missionStats.initialEnemies,
    initialEnemyBuildings: state.missionStats.initialEnemyBuildings,
  });
}

function openMissionStory(scenarioIdx, kind = 'intro') {
  const pages = getMissionDialogue(state.storyLines, scenarioIdx, kind);
  if (pages.length === 0) return false;
  const sc = SCENARIOS[scenarioIdx] || SCENARIOS[0];
  state.storyDialog = {
    title: kind === 'outro' ? `KẾT THÚC MÀN ${scenarioIdx + 1}` : `MÀN ${scenarioIdx + 1}: ${sc.name.toUpperCase()}`,
    pages,
    index: 0,
  };
  return true;
}

function advanceStoryDialog() {
  if (!state.storyDialog) return;
  if (state.storyDialog.index + 1 < state.storyDialog.pages.length) {
    state.storyDialog.index++;
  } else {
    state.storyDialog = null;
  }
  render();
}

function proceedToNextMission() {
  if (!state.data) return;
  const nextIdx = state.scenarioIndex + 1;
  if (nextIdx >= SCENARIOS.length) {
    state.carryoverTribe = null;
    loadScenario(0, { useCarryover: false, isCustomGame: false, showStory: true });
    return;
  }
  state.carryoverTribe = captureTribeCarryover(state.data, state);
  loadScenario(nextIdx, { useCarryover: true, isCustomGame: false, showStory: true });
}

async function applyLanguage(langIdx) {
  const id = Math.max(0, Math.min(4, langIdx | 0));
  state.language = id;
  const pack = await loadLanguagePack(id);
  state.langPack = pack;
  if (pack.d0?.length > 0) state.storyLines = pack.d0;
  if (state.storyDialog) {
    openMissionStory(state.scenarioIndex, 'intro');
  }
  state.message = `${pack.meta.label} (${pack.s.length} UI / ${pack.d0.length} /d0)`;
  render();
}

function saveCurrentGame() {
  const ui = getUiStrings(state.language);
  const ok = saveGameToStorage(state);
  if (ok) {
    state.message = ui.savedOk;
    addPopup(state.cursor.x, state.cursor.y, '💾 Saved!', '#9cff7b');
  } else {
    state.message = 'Không thể lưu vào localStorage.';
  }
  render();
}

function resumeSavedGame() {
  const ui = getUiStrings(state.language);
  const saved = loadGameFromStorage(state.baseData);
  if (!saved) {
    state.message = ui.noSave;
    render();
    return false;
  }
  state.scenarioIndex = saved.scenarioIndex ?? 0;
  state.difficultyIndex = saved.difficultyIndex ?? 0;
  state.isCustomGame = Boolean(saved.isCustomGame);
  state.data = saved.hydratedData;
  state.cameraX = saved.cameraX ?? 0;
  state.cameraY = saved.cameraY ?? 0;
  state.cursor = saved.cursor || { x: 5, y: 5 };
  state.selectedUnit = saved.selectedUnit || getVillagerIds()[0] || 0;
  state.selectedUnits = new Set(state.selectedUnit ? [state.selectedUnit] : []);
  state.groups = { 7: new Set(), 9: new Set() };
  state.activeGroupId = 0;
  state.selectionBox = null;
  state.canvasMenu = null;
  state.showMinimap = false;
  state.storyDialog = null;
  state.missionResult = null;
  state.victoryDismissed = false;
  state.paused = false;
  state.panelMode = 'main';
  state.tasks.clear();
  state.enemyTasks.clear();
  state.projectiles = [];
  state.activePath = [];
  state.dustEffects = [];
  state.popups = [];
  cancelBuildPlacement();

  state.food = saved.food ?? 0;
  state.wood = saved.wood ?? 0;
  state.stone = saved.stone ?? 0;
  state.tools = saved.tools ?? 0;
  state.population = getVillagerIds().length || saved.population || 1;
  state.housingCap = saved.housingCap ?? 1;
  state.missionStats = saved.missionStats || {
    buildingsBuilt: 0,
    enemiesKilled: 0,
    enemyBuildingsDestroyed: 0,
    initialEnemies: getEnemyIds().length,
    initialEnemyBuildings: getEnemyBuildings().length,
  };
  state.carryoverTribe = saved.carryoverTribe || null;
  syncResourcesToData();
  if (saved.language !== undefined && saved.language !== state.language) {
    applyLanguage(saved.language);
  }
  state.message = `${ui.loadedOk} (Màn ${state.scenarioIndex + 1} · ${state.population} dân)`;
  setPhase('game');
  return true;
}

function toggleMinimap() {
  if (!state.data || state.phase !== 'game') return;
  cancelBuildPlacement();
  state.showMinimap = !state.showMinimap;
  if (state.showMinimap) {
    state.message = getUiStrings(state.language).minimapLegend;
  }
  render();
}

function jumpCameraFromMinimap(sx, sy) {
  const d = state.data;
  if (!d) return false;
  const mm = getMinimapRect(d);
  if (sx < mm.boxX || sx > mm.boxX + mm.boxW || sy < mm.boxY || sy > mm.boxY + mm.boxH) {
    state.showMinimap = false;
    render();
    return false;
  }
  if (sx >= mm.mapX && sx <= mm.mapX + mm.mapW && sy >= mm.mapY && sy <= mm.mapY + mm.mapH) {
    const wx = Math.max(0, Math.min(d.width - 1, Math.floor((sx - mm.mapX) / mm.scale)));
    const wy = Math.max(0, Math.min(d.height - 1, Math.floor((sy - mm.mapY) / mm.scale)));
    state.cursor = { x: wx, y: wy };
    state.cameraX = Math.round(wx - getViewportCols() / 2);
    state.cameraY = Math.round(wy - getViewportRows() / 2);
    clampCamera();
    state.message = `Camera nhảy tới (${wx}, ${wy}) trên bản đồ.`;
    render();
    return true;
  }
  return true;
}

function toggleMusic() {
  state.music = !state.music;
  const trackIdx = state.phase === 'game' ? (state.scenarioIndex % 3) + 1 : 0;
  midiSynth.setEnabled(state.music, trackIdx);
  const trackName = SA_TRACK_NAMES[midiSynth.currentTrackIndex] || 'MIDI';
  state.message = state.music ? `🎵 Đã bật nhạc nền MIDI (/sa): ${trackName}` : '🔇 Đã tắt nhạc nền MIDI.';
  render();
}

function cycleMidiTrack() {
  state.music = true;
  const next = midiSynth.cycleTrack();
  const track = midiSynth.tracks[next];
  state.message = `🎼 Đang phát /sa ${SA_TRACK_NAMES[next]} (${track ? track.notes.length : 0} nốt MIDI)!`;
  render();
}

function closeCanvasMenu() {
  const wasPause = state.canvasMenu?.kind === 'pause' || state.canvasMenu?.kind === 'scenarios';
  state.canvasMenu = null;
  if (wasPause) {
    state.paused = false;
    if (state.panelMode === 'pause') state.panelMode = 'main';
  }
  render();
}

function openCanvasActionsMenu() {
  if (state.phase !== 'game' || !state.data) return;
  cancelBuildPlacement();
  state.showMinimap = false;
  const items = [
    {
      label: 'XÂY DỰNG',
      iconAnim: 10,
      action: () => openCanvasBuildMenu(),
    },
    {
      label: 'TẬP HỢP BỘ LẠC!',
      iconAnim: 11,
      action: () => startFlagPlacement('rally'),
    },
    {
      label: 'LỆNH CHIẾN ĐẤU!',
      iconAnim: 12,
      action: () => startFlagPlacement('attack'),
    },
    {
      label: 'DANH SÁCH DÂN LÀNG',
      iconAnim: 13,
      action: () => openCanvasVillagersMenu(),
    },
    {
      label: state.tribeUseRawWeapon[state.localTribe ?? 0] !== false ? 'VŨ KHÍ THÔ (ĐÁ/GỖ): BẬT' : 'VŨ KHÍ THÔ (ĐÁ/GỖ): TẮT',
      iconAnim: state.tribeUseRawWeapon[state.localTribe ?? 0] !== false ? 25 : 23,
      action: () => {
        const myTribe = state.localTribe ?? 0;
        const nextVal = state.tribeUseRawWeapon[myTribe] === false;
        state.tribeUseRawWeapon[myTribe] = nextVal;
        if (state.mpMode && myTribe === 1) {
          mpClient?.sendCommand({ kind: 'setUseRawWeapon', value: nextVal });
        }
        state.message = nextVal
          ? '🪨 Đã BẬT: khi kho hết vũ khí, dân sẽ lấy Đá/Gỗ làm vũ khí chiến đấu.'
          : '🚫 Đã TẮT: dân sẽ không lấy Đá/Gỗ làm vũ khí (giữ nguyên liệu để xây nhà).';
        openCanvasActionsMenu();
      },
    },
    {
      label: 'BẢN ĐỒ NHỎ (3)',
      iconAnim: 24,
      action: () => {
        state.canvasMenu = null;
        toggleMinimap();
      },
    },
  ];
  state.canvasMenu = { kind: 'actions', items, selected: 0, scroll: 0 };
  render();
}

function openCanvasBuildMenu() {
  if (state.phase !== 'game' || !state.data) return;
  cancelBuildPlacement();
  state.showMinimap = false;
  const items = BUILDINGS.map((b) => {
    const bType = b.type;
    const spec = getBuildingSpec(state.data, bType);
    const canAfford = state.wood >= spec.woodCost && state.stone >= spec.stoneCost && state.tools >= spec.toolsCost;
    return {
      label: spec.name.toUpperCase(),
      bType,
      spec,
      canAfford,
      desc: spec.desc,
      action: () => {
        state.canvasMenu = null;
        startBuildPlacement(bType);
      },
    };
  });
  state.canvasMenu = { kind: 'build', items, selected: 0, scroll: 0 };
  render();
}

function openCanvasVillagersMenu() {
  if (state.phase !== 'game' || !state.data) return;
  const ids = getVillagerIds();
  if (ids.length === 0) return;
  const items = ids.map((id) => {
    const u = getVillagerInfo(id);
    return {
      label: `${u.role} (${u.sex}, ${u.age}t)`,
      unitId: id,
      action: () => {
        state.canvasMenu = null;
        selectUnit(id);
        centerOnUnit(id);
        render();
      },
    };
  });
  state.selectedUnit = ids[0];
  state.canvasMenu = { kind: 'villagers', items, selected: 0, scroll: 0 };
  render();
}

function getBuildingOccupants(bid) {
  const e = state.data?.entityData;
  if (!e || !bid) return [];
  const list = [];
  let cur = e[8993 + bid];
  let guard = 0;
  while (cur > 0 && guard++ < 16) {
    list.push(cur);
    cur = e[4545 + cur];
  }
  return list;
}

function evictUnitFromBuilding(uid, bld) {
  if (!state.data || !uid) return false;
  const e = state.data.entityData;
  const leavingSlot = e[4646 + uid];
  const ok = exitBuildingSlot(state.data, uid);
  state.tasks.delete(uid);
  state.savedJobs.delete(uid);
  if (bld?.targetType === 8 && leavingSlot === 0) {
    state.shrineRituals.delete(bld.bid);
  }
  e[2222 + uid] = 0;
  setUnitCarry(uid, 0, 0);
  setUnitAnim(uid, 8, 0);
  state.selectedUnit = uid;
  state.selectedUnits.clear();
  state.selectedUnits.add(uid);
  state.activePath = [];
  const info = getVillagerInfo(uid);
  if (bld) {
    state.message = `🚪 ${info.role} đã rời khỏi ${bld.spec.name} và hủy công việc tại đây!`;
  }
  return ok;
}

function getOccupantRoleTag(bld, uid) {
  const e = state.data?.entityData;
  if (!e || !bld) return '';
  const slotIdx = e[4646 + uid];
  if (bld.underConstruction) return 'THỢ XÂY';
  if (bld.targetType === 0 && slotIdx === 0) return 'THỢ RÈN';
  if (bld.targetType === 1) return `CẤP ${e[1717 + uid] & 0xff}`;
  if (bld.targetType === 4) return slotIdx === 0 ? 'ĐẦU BẾP' : 'ĐANG ĂN';
  if (bld.targetType === 5) return `CẤP ${e[1616 + uid] & 0xff}`;
  if (bld.targetType === 7) return slotIdx === 0 ? 'DJ' : 'NHẢY';
  if (bld.targetType === 8) return slotIdx === 0 ? 'PHÁP SƯ' : 'CHỮA TRỊ';
  if (bld.targetType === 9) return 'TRINH SÁT';
  if (bld.targetType === 10) return 'TRẺ EM';
  if (bld.targetType === 11) return 'LÍNH GÁC';
  if (bld.targetType === 2) return 'ĐANG NGỦ';
  return '';
}

function buildOccupantMenuItems(bld) {
  const e = state.data?.entityData;
  if (!e || !bld) return [];
  const occupants = getBuildingOccupants(bld.bid);
  if (occupants.length === 0) return [];
  const out = [];
  const isTrainingHall = !bld.underConstruction && (bld.targetType === 1 || bld.targetType === 5);
  for (const uid of occupants) {
    const info = getVillagerInfo(uid);
    const tag = getOccupantRoleTag(bld, uid);
    const hp = e[1919 + uid] & 0xff;
    const maxHp = Math.max(1, e[6767 + uid] & 0xff);
    const item = {
      label: `RỜI NHÀ: ${info.role.toUpperCase()}${tag ? ` (${tag})` : ''}`,
      unitId: uid,
      costText: `Click/Enter: Cho rời ${bld.spec.name} & bỏ việc · HP ${hp}/${maxHp}`,
      canAfford: true,
      action: () => {
        evictUnitFromBuilding(uid, bld);
        if (getBuildingOccupants(bld.bid).length > 0) {
          openCanvasBuildingMenu(bld);
        } else {
          state.canvasMenu = null;
          render();
        }
      },
    };
    if (isTrainingHall) {
      item.rankBadge = bld.targetType === 5 ? e[1616 + uid] & 0xff : e[1717 + uid] & 0xff;
    }
    out.push(item);
  }
  if (occupants.length >= 2) {
    out.push({
      label: `CHO TẤT CẢ RỜI NHÀ (${occupants.length})`,
      glyph: '🚪',
      costText: `Đưa cả ${occupants.length} người rời khỏi ${bld.spec.name} & hủy việc`,
      canAfford: true,
      action: () => {
        const list = getBuildingOccupants(bld.bid);
        state.selectedUnits.clear();
        for (const uid of list) evictUnitFromBuilding(uid, bld);
        for (const uid of list) state.selectedUnits.add(uid);
        state.selectedUnit = list[0] || 0;
        state.message = `🚪 Đã cho ${list.length} người rời khỏi ${bld.spec.name}!`;
        state.canvasMenu = null;
        render();
      },
    });
  }
  return out;
}

function openCanvasBuildingMenu(bld) {
  if (!bld || !state.data) return;
  cancelBuildPlacement();
  state.showMinimap = false;
  state.selectedBuildingBid = bld.bid;
  const level = state.data.entityData[9115 + bld.bid] & 0xff;
  const items = [];
  const occupantItems = buildOccupantMenuItems(bld);
  const putOccupantsAfterMain = !bld.underConstruction && (bld.targetType === 0 || bld.targetType === 8);

  // For every building (except finished Kho vũ khí / Khu thánh địa which keep craft/spell icons first),
  // list all people currently inside right at the front so 1 click ejects them and abandons their task!
  if (!putOccupantsAfterMain && occupantItems.length > 0) {
    items.push(...occupantItems);
  }

  if (bld.underConstruction) {
    // Unfinished construction/upgrade site: show occupants (builders inside) + Demolish below
  } else if (bld.targetType === 0) {
    // Kho vũ khí: Authentic weapon production queue (starts at 0; ↑/Click = +1, ↓/Right-click = -1)!
    const q = getWeaponQueue(bld.bid);
    for (const w of WEAPONS) {
      const parts = [];
      if (w.wood) parts.push(`Gỗ:${w.wood}`);
      if (w.stone) parts.push(`Đá:${w.stone}`);
      if (w.bones) parts.push(`Xương:${w.bones}`);
      items.push({
        label: `RÈN ${w.name.toUpperCase()} (ĐẶT: ${q[w.id]})`,
        weaponId: w.id,
        queueCount: q[w.id],
        bid: bld.bid,
        costText: `↑/Click: +1 · ↓/Chuột phải: -1 · ${parts.join(' ')}`,
        canAfford: state.wood >= w.wood && state.stone >= w.stone && state.tools >= w.bones,
        action: () => adjustWeaponQueue(bld.bid, w.id, +1),
        decreaseAction: () => adjustWeaponQueue(bld.bid, w.id, -1),
      });
    }
    if (occupantItems.length > 0) {
      items.push(...occupantItems);
    } else {
      items.push({
        label: 'CỬ THỢ RÈN VÀO XƯỞNG',
        iconAnim: 13,
        action: () => {
          const uid = state.selectedUnit || findNearestVillager(bld.x, bld.y, true);
          if (uid) assignWorkAtBuilding(uid, bld, [0]);
          state.canvasMenu = null;
          render();
        },
      });
    }
  } else if (bld.targetType === 8) {
    // Khu thánh địa: 4 spells with authentic animations 19..22 + Shaman/Patient leave or assign slot
    const hasShaman = isBuildingSlot0Occupied(bld.bid);
    SPELLS.forEach((sp, idx) => {
      items.push({
        label: sp.name.toUpperCase(),
        iconAnim: 19 + idx,
        costText: hasShaman ? `Cần ${sp.bones} Xương · ${sp.desc}` : `Cần Pháp sư trong thánh địa · ${sp.bones} Xương`,
        canAfford: hasShaman && state.tools >= sp.bones,
        action: () => {
          castShamanSpell(sp, bld);
          state.canvasMenu = null;
          render();
        },
      });
    });
    if (occupantItems.length > 0) {
      items.push(...occupantItems);
    }
    if (!hasShaman) {
      items.push({
        label: 'CỬ PHÁP SƯ HÀNH LỄ',
        iconAnim: 13,
        action: () => {
          const uid = state.selectedUnit || findNearestVillager(bld.x, bld.y, true);
          if (uid) assignWorkAtBuilding(uid, bld, [0]);
          state.canvasMenu = null;
          render();
        },
      });
    }
  } else if (bld.targetType === 6) {
    // Kho chứa: allow swapping to any weapon stored in stock (resources[owner][5..10])
    const owner = state.localTribe ?? 0;
    const resArr = state.data?.resources?.[owner] || [];
    for (const w of WEAPONS) {
      const stock = resArr[5 + w.id] || 0;
      if (stock > 0) {
        items.push({
          label: `ĐỔI ${w.name.toUpperCase()} (KHO: ${stock})`,
          weaponId: w.id,
          costText: `Sức đánh +${w.atk} · Miễn phí đổi từ kho`,
          canAfford: true,
          action: () => {
            const uid = state.selectedUnit || getVillagerIds(owner).find((id) => (state.data.entityData[1414 + id] & 0xff) >= 12);
            if (!uid) return;
            const e = state.data.entityData;
            if ((e[1414 + uid] & 0xff) < 12) {
              showWarning('⚠ Trẻ em (dưới 12 tuổi) chưa thể trang bị vũ khí!');
              return;
            }
            const oldW = e[6565 + uid] & 0xff;
            if (oldW < 6 && oldW !== w.id) {
              resArr[5 + oldW] = (resArr[5 + oldW] || 0) + 1;
            }
            resArr[5 + w.id] = Math.max(0, (resArr[5 + w.id] || 0) - 1);
            e[6565 + uid] = w.id;
            state.message = `${getVillagerInfo(uid).role} đã đổi vũ khí sang ${w.name} từ Kho chứa!`;
            state.canvasMenu = null;
            render();
          },
        });
      }
    }
  } else if (bld.targetType === 2) {
    // Lều: rest/sleep + courtship & reproduction
    items.push({
      label: 'VÀO LỀU NGỦ HỒI SỨC',
      iconAnim: 13,
      action: () => {
        const uid = state.selectedUnit || findNearestVillager(bld.x, bld.y, true);
        if (uid) assignRestTask(uid, bld);
        state.canvasMenu = null;
        render();
      },
    });
    items.push({
      label: 'HẸN HÒ SINH CON',
      iconAnim: 21,
      action: () => {
        const ok = startCourtshipPair(true, bld);
        if (!ok) {
          state.message =
            state.population >= state.housingCap
              ? 'Bộ lạc đã đủ dân số tối đa, hãy xây thêm Lều!'
              : 'Cần ít nhất 1 nam & 1 nữ trưởng thành rảnh để hẹn hò sinh con.';
        }
        state.canvasMenu = null;
        render();
      },
    });
  } else if (bld.targetType === 4) {
    // Bếp / Nhà ăn: Chef (slot 0, anim 105) + Diner (slots 1..6, anim 83/84)
    items.push({
      label: 'CỬ ĐẦU BẾP NẤU ĂN',
      iconAnim: 13,
      action: () => {
        const uid = state.selectedUnit || findNearestVillager(bld.x, bld.y, true);
        if (uid) assignWorkAtBuilding(uid, bld, [0]);
        state.canvasMenu = null;
        render();
      },
    });
    items.push({
      label: 'VÀO NHÀ ĂN DÙNG BỮA',
      iconAnim: 13,
      action: () => {
        if (!canKitchenServeFood(bld.bid)) {
          showWarning('⚠ Nhà ăn chưa có đồ ăn chín và chưa có Đầu bếp! Hãy cử Đầu bếp vào nấu trước.');
          state.canvasMenu = null;
          render();
          return;
        }
        const uid = state.selectedUnit || findNearestVillager(bld.x, bld.y, true);
        if (uid) assignEatTask(uid, bld);
        state.canvasMenu = null;
        render();
      },
    });
  } else if (bld.targetType === 7) {
    // Sàn disco: DJ (slot 0, anim 117) + Dancers (slots 1..6, anim 126..136)
    items.push({
      label: 'CỬ DJ CHƠI NHẠC',
      iconAnim: 13,
      action: () => {
        const uid = state.selectedUnit || findNearestVillager(bld.x, bld.y, true);
        if (uid) assignWorkAtBuilding(uid, bld, [0]);
        state.canvasMenu = null;
        render();
      },
    });
    items.push({
      label: 'VÀO SÀN NHẢY DISCO',
      iconAnim: 13,
      action: () => {
        if (!isBuildingSlot0ActiveInside(bld.bid)) {
          showWarning('⚠ Sàn disco chưa có DJ chơi nhạc! Hãy cử DJ lên bàn nhạc trước.');
          state.canvasMenu = null;
          render();
          return;
        }
        const uid = state.selectedUnit || findNearestVillager(bld.x, bld.y, true);
        if (uid) assignWorkAtBuilding(uid, bld, [1, 2, 3, 4, 5, 6]);
        state.canvasMenu = null;
        render();
      },
    });
  } else if (bld.targetType === 10) {
    // Nhà trẻ: call all outside children (< 12) into the kindergarten for protection!
    items.push({
      label: 'ĐƯA TRẺ EM VÀO NHÀ TRẺ',
      iconAnim: 13,
      action: () => {
        const owner = state.localTribe ?? 0;
        const e = state.data.entityData;
        const kids = getVillagerIds(owner).filter((id) => (e[1414 + id] & 0xff) < 12 && !isUnitInsideBuilding(state.data, id));
        let sent = 0;
        for (const cid of kids) {
          if (assignWorkAtBuilding(cid, bld)) sent++;
        }
        state.message = sent > 0 ? `👶 Đã gọi ${sent} trẻ em vào Nhà trẻ để bảo vệ an toàn!` : 'Hiện tất cả trẻ em đã ở trong Nhà trẻ (hoặc chưa có trẻ em mới).';
        state.canvasMenu = null;
        render();
      },
    });
  } else if ([1, 5, 9, 11].includes(bld.targetType)) {
    const isTrainingHall = bld.targetType === 1 || bld.targetType === 5;
    const workLabels = {
      1: 'LUYỆN CẬN CHIẾN (+8 HP)',
      5: 'LUYỆN NÉM (+8 HP)',
      9: 'CỬ TRINH SÁT (R=7)',
      11: 'LÍNH GÁC CHÒI CANH',
    };
    items.push({
      label: workLabels[bld.targetType] || 'VÀO LÀM VIỆC',
      iconAnim: 13,
      action: () => {
        const uid = state.selectedUnit || findNearestVillager(bld.x, bld.y, true);
        if (uid) {
          if (isTrainingHall) assignTrainOrFetchWeapon(uid, bld);
          else assignWorkAtBuilding(uid, bld);
        }
        state.canvasMenu = null;
        render();
      },
    });
  }

  // Upgrade building (anim 16) — ONLY when this building has upgrade stage textures in the original game!
  const maxLevel = getBuildingMaxLevel(state.data, bld.targetType);
  if (level < maxLevel) {
    items.push({
      label: `NÂNG CẤP CẤP ${level + 1}`,
      iconAnim: 16,
      costText: 'Gỗ:15 · Đá:10',
      canAfford: state.wood >= 15 && state.stone >= 10,
      action: () => {
        performUpgradeBuilding(bld);
        state.canvasMenu = null;
        render();
      },
    });
  }

  // Repair building (anim 26)
  if (bld.hp < bld.maxHp) {
    items.push({
      label: 'SỬA CHỮA CÔNG TRÌNH',
      iconAnim: 26,
      costText: 'Gỗ:5',
      canAfford: state.wood >= 5,
      action: () => {
        if (state.wood >= 5) {
          state.wood -= 5;
          state.data.entityData[8505 + bld.bid] = bld.maxHp;
          syncResourcesToData();
          state.message = `Đã sửa đầy máu cho ${bld.spec.name}!`;
        } else {
          state.message = 'Cần 5 gỗ để sửa công trình!';
        }
        state.canvasMenu = null;
        render();
      },
    });
  }

  // Demolish building (anim 17)
  if (bld.targetType !== 3) {
    items.push({
      label: 'PHÁ HỦY CÔNG TRÌNH',
      iconAnim: 17,
      action: () => {
        state.canvasMenu = null;
        performDemolishBuilding(bld);
      },
    });
  }

  state.canvasMenu = { kind: 'building', buildingBid: bld.bid, items, selected: 0, scroll: 0 };
  render();
}

function openCanvasScenariosMenu() {
  const items = SCENARIOS.map((sc, idx) => ({
    label: `MÀN ${idx + 1}: ${sc.name.toUpperCase()}`,
    action: () => {
      state.canvasMenu = null;
      state.paused = false;
      loadScenario(idx, { showStory: false });
    },
  }));
  state.canvasMenu = {
    kind: 'scenarios',
    title: 'CHỌN MÀN CHIẾN DỊCH',
    items,
    selected: state.scenarioIndex || 0,
    scroll: Math.max(0, (state.scenarioIndex || 0) - 3),
  };
  render();
}

function openPauseMenu() {
  if (state.phase !== 'game') return;
  cancelBuildPlacement();
  state.showMinimap = false;
  state.paused = !state.mpMode; // Never pause live 1v1 multiplayer simulation while viewing menu
  state.panelMode = 'pause';
  const items = [
    { label: 'TIẾP TỤC TRẬN ĐẤU', action: () => closePauseMenu() },
    {
      label: 'BẢN ĐỒ NHỎ (PHÍM 3)',
      action: () => {
        state.canvasMenu = null;
        state.paused = false;
        toggleMinimap();
      },
    },
    {
      label: `ÂM NHẠC MIDI: ${state.music ? 'BẬT' : 'TẮT'}`,
      action: () => {
        toggleMusic();
        openPauseMenu();
      },
    },
    {
      label: 'QUAY VỀ PHÒNG CHỜ 1v1',
      action: () => {
        state.canvasMenu = null;
        state.paused = false;
        mpClient?.returnToLobby();
        showMpLobby(true);
        render();
      },
    },
  ];
  state.canvasMenu = { kind: 'pause', title: 'MENU TRẬN ĐẤU 1v1', items, selected: 0, scroll: 0 };
  render();
}

function closePauseMenu() {
  if (state.phase !== 'game') return;
  state.paused = false;
  state.canvasMenu = null;
  if (state.panelMode === 'pause') state.panelMode = 'main';
  render();
}

function moveCanvasMenuSelection(delta) {
  const m = state.canvasMenu;
  if (!m || !m.items?.length) return;
  const len = m.items.length;
  m.selected = (m.selected + delta + len) % len;
  const pageSize = m.kind === 'pause' || m.kind === 'scenarios' ? 7 : m.kind === 'build' ? 1 : 5;
  if (m.selected < (m.scroll || 0)) m.scroll = m.selected;
  if (m.selected >= (m.scroll || 0) + pageSize) m.scroll = Math.max(0, m.selected - pageSize + 1);
  if (m.kind === 'villagers' && m.items[m.selected]?.unitId) {
    state.selectedUnit = m.items[m.selected].unitId;
  }
  render();
}

function handleCanvasMenuClick(x, y) {
  const m = state.canvasMenu;
  if (!m) return false;

  // Bottom softkey bar (y >= 298): Left green ✓ (x <= 34) confirms, Right red ✕ (x >= 206) goes back/closes
  // IMPORTANT: On Panel 2/5 (y=272..320), icons occupy x=39..201 and y=293..317, so ONLY handle left/right corner softkeys here!
  if (y >= LOGICAL_HEIGHT - 22) {
    if (x <= 34) {
      const item = m.items?.[m.selected];
      if (item?.action) item.action();
      return true;
    }
    if (x >= LOGICAL_WIDTH - 34) {
      if (m.kind === 'build' || m.kind === 'villagers') openCanvasActionsMenu();
      else if (m.kind === 'scenarios') openPauseMenu();
      else closeCanvasMenu();
      return true;
    }
  }

  if (m.kind === 'pause' || m.kind === 'scenarios') {
    const items = m.items || [];
    const visibleCount = Math.min(7, items.length);
    const scroll = m.scroll || 0;
    const rowH = 22;
    const boardY = Math.max(64, Math.floor((LOGICAL_HEIGHT - 220) / 2));
    const listTop = boardY + 38;
    const selLeft = Math.floor(LOGICAL_WIDTH / 2) - 84;
    const selRight = Math.floor(LOGICAL_WIDTH / 2) + 84;
    if (x >= selLeft && x <= selRight && y >= listTop && y <= listTop + visibleCount * rowH) {
      const row = Math.floor((y - listTop) / rowH);
      const idx = scroll + row;
      if (idx >= 0 && idx < items.length) {
        m.selected = idx;
        items[idx].action?.();
        return true;
      }
    }
    // Click scroll footer or above list to scroll
    if (items.length > visibleCount) {
      if (y < listTop && y >= boardY) {
        moveCanvasMenuSelection(-1);
        return true;
      }
      if (y > listTop + visibleCount * rowH && y < LOGICAL_HEIGHT - 22) {
        moveCanvasMenuSelection(1);
        return true;
      }
    }
    return true;
  }

  if (m.kind === 'build') {
    const panelY = LOGICAL_HEIGHT - 86;
    const ox = Math.floor((LOGICAL_WIDTH - 240) / 2);
    const lx = x - ox;
    const inPreviewBox = lx >= -20 && lx <= 60 && y >= panelY - 10 && y < panelY + 58;
    if (y < panelY && !inPreviewBox) {
      closeCanvasMenu();
      return true;
    }
    // Left arrow area below preview box
    if (lx >= -20 && lx < 20 && y >= panelY + 56 && y < LOGICAL_HEIGHT - 22) {
      moveCanvasMenuSelection(-1);
      return true;
    }
    // Right arrow area below preview box
    if (lx >= 20 && lx <= 60 && y >= panelY + 56 && y < LOGICAL_HEIGHT - 22) {
      moveCanvasMenuSelection(1);
      return true;
    }
    // Click on building icon or description box directly starts placing that building!
    if (y >= panelY && y < LOGICAL_HEIGHT - 22) {
      m.items?.[m.selected]?.action?.();
      return true;
    }
    return true;
  }

  // Panel 2 / Panel 5 horizontal 5-icon bar (height = 48px, pinned to bottom)
  const panelY = LOGICAL_HEIGHT - 48;
  if (y < panelY) {
    closeCanvasMenu();
    return true;
  }
  const items = m.items || [];
  const visible = Math.min(5, items.length);
  const scroll = m.scroll || 0;
  const slotStep = 34;
  const totalW = visible * slotStep;
  const startX = Math.floor((LOGICAL_WIDTH - totalW + 9) / 2);

  if (scroll > 0 && x < startX) {
    moveCanvasMenuSelection(-1);
    return true;
  }
  if (scroll + visible < items.length && x > startX + totalW) {
    moveCanvasMenuSelection(1);
    return true;
  }
  // Clicking the top title bar (y < panelY + 19) executes the currently highlighted item
  if (y < panelY + 19) {
    items[m.selected]?.action?.();
    return true;
  }
  const slotIdx = Math.floor((x - startX) / slotStep);
  if (slotIdx >= 0 && slotIdx < visible) {
    const idx = scroll + slotIdx;
    const wasSelected = m.selected === idx;
    m.selected = idx;
    if (m.kind === 'villagers' && items[idx]?.unitId) {
      state.selectedUnit = items[idx].unitId;
    }
    if (items[idx]?.decreaseAction) {
      // Weapon forge queue slot: first click selects it, clicking top half (+1) or bottom half (-1) adjusts quantity!
      if (!wasSelected) {
        render();
      } else if (y >= panelY + 34) {
        items[idx].decreaseAction();
      } else {
        items[idx].action?.();
      }
      return true;
    }
    items[idx]?.action?.();
    return true;
  }
  return true;
}

function startCustomGame() {
  state.difficultyIndex = state.customConfig.difficultyIndex;
  state.carryoverTribe = null;
  loadScenario(state.customConfig.scenarioIndex, {
    useCarryover: false,
    isCustomGame: true,
    abundantResources: state.customConfig.abundantResources,
    showStory: false,
  });
}

function loadScenario(index, opts = {}) {
  if (!state.baseData) return;
  const {
    useCarryover = false,
    isCustomGame = false,
    abundantResources = false,
    showStory = false,
  } = opts;
  const clamped = Math.max(0, Math.min(SCENARIOS.length - 1, index));
  state.scenarioIndex = clamped;
  state.isCustomGame = isCustomGame;
  const diff = getCurrentDifficulty();
  state.data = loadScenarioFromMa(state.baseData, state.maBytes, clamped, {
    carryoverTribe: useCarryover ? state.carryoverTribe : null,
    difficulty: diff,
    abundantResources,
  });
  state.cameraX = state.data.cameraX ?? 0;
  state.cameraY = state.data.cameraY ?? 0;
  state.smoothCamX = state.cameraX;
  state.smoothCamY = state.cameraY;
  state.cursor = { x: state.data.cursorX ?? 5, y: state.data.cursorY ?? 9 };
  state.selectedUnit = state.data.hoverUnit || getVillagerIds()[0] || 0;
  state.selectedUnits = new Set(state.selectedUnit ? [state.selectedUnit] : []);
  state.groups = { 7: new Set(), 9: new Set() };
  state.activeGroupId = 0;
  state.selectionBox = null;
  state.canvasMenu = null;
  state.showMinimap = false;
  state.storyDialog = null;
  state.missionResult = null;
  state.victoryDismissed = false;
  state.lastAlertTick = -999;
  state.tasks.clear();
  state.enemyTasks.clear();
  state.projectiles = [];
  state.treeWood.clear();
  state.activePath = [];
  state.dustEffects = [];
  state.popups = [];
  cancelBuildPlacement();
  state.panelMode = 'main';
  state.compareOriginal = false;

  const res = state.data.resources?.[0] || [];
  state.food = res[0] ?? 0;
  state.wood = res[1] ?? 0;
  state.stone = res[2] ?? 0;
  state.tools = res[3] ?? 0;
  state.population = getVillagerIds().length || res[11] || 9;
  state.housingCap = res[16] ?? 1;

  const sc = SCENARIOS[clamped];
  const enemyCount = getEnemyIds().length;
  const enemyBldCount = getEnemyBuildings().length;
  state.missionStats = {
    buildingsBuilt: 0,
    enemiesKilled: 0,
    enemyBuildingsDestroyed: 0,
    initialEnemies: enemyCount,
    initialEnemyBuildings: enemyBldCount,
  };
  const carryNote = useCarryover && state.carryoverTribe?.villagers?.length
    ? ` · Mang theo ${state.carryoverTribe.villagers.length} chiến binh từ màn trước!`
    : '';
  const modeTag = isCustomGame ? `Trận tuỳ chỉnh (${diff.label})` : `Chiến dịch (${diff.label})`;
  const enemyNote =
    enemyCount > 0 || enemyBldCount > 0 ? `, ${enemyCount} địch & ${enemyBldCount} nhà địch` : '';
  state.message = `${modeTag} · Màn ${clamped + 1}: ${sc.name} — ${state.population} dân, ${getPlayerBuildings().length} nhà${enemyNote}.${carryNote}`;
  if (showStory && !isCustomGame) {
    openMissionStory(clamped, 'intro');
  }
  if (state.music && midiSynth.tracks.length > 0) {
    midiSynth.playTrack((clamped % 3) + 1);
  }
  setPhase('game');
}

function drawOpeningScreen() {
  const phaseDef = PHASES[state.phase];
  const img = getCaptureImage(phaseDef.capture);
  if (img.complete && img.naturalWidth) {
    ctx.drawImage(img, 0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  } else {
    ctx.fillStyle = '#75b7dc';
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  }
  if (state.phase !== 'music') {
    const top = state.phase === 'language' ? 92 : state.phase === 'campaignMenu' ? 124 : 144;
    ctx.save();
    ctx.fillStyle = '#fff16b';
    ctx.strokeStyle = '#33250c';
    ctx.lineWidth = 2.5;
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const y = top + state.selected * 20;
    ctx.strokeText('▶', 28, y);
    ctx.fillText('▶', 28, y);
    ctx.strokeText('◀', 212, y);
    ctx.fillText('◀', 212, y);
    ctx.restore();
  }
}

function drawCampaignWalkthrough() {
  const img = getCaptureImage(state.campaignFrame);
  if (img.complete && img.naturalWidth) {
    ctx.drawImage(img, 0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  } else {
    ctx.fillStyle = '#c4b856';
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  }
}

function drawFrameToCtx(targetCtx) {
  if (!targetCtx) return;
  const prevCtx = ctx;
  ctx = targetCtx;
  ctx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  if (state.phase === 'lobby') {
    ctx.fillStyle = '#0d140f';
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    ctx = prevCtx;
    return;
  }
  if (state.phase === 'game') {
    if (state.compareOriginal && state.scenarioIndex === 0) {
      const refImg = getCaptureImage(CAPTURED_FLOW.gameplay);
      if (refImg.complete && refImg.naturalWidth) {
        ctx.drawImage(refImg, 0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
        ctx = prevCtx;
        return;
      }
    }
    if (state.data) {
      state.selectedUnitName = state.selectedUnit ? getVillagerName(state.data, state.selectedUnit) : '';
      const bMap = new Map();
      const chefSet = new Set();
      for (const b of getPlayerBuildings(state.localTribe ?? 0)) {
        if (b.underConstruction) bMap.set(b.bid, getAssignedBuilderCount(b.bid));
        else if (b.targetType === 4 && isBuildingSlot0Occupied(b.bid)) chefSet.add(b.bid);
      }
      for (const [uid, t] of state.tasks.entries()) {
        if (t.kind === 'chefFetch' && t.kitchen?.bid) chefSet.add(t.kitchen.bid);
        else if (t.kind === 'workBuilding' && t.target?.targetType === 4 && t.preferredSlots?.[0] === 0) chefSet.add(t.target.bid);
        else if (t.kind === 'armForBattle' || t.kind === 'attackUnit' || t.kind === 'attackBuilding') {
          const saved = state.savedJobs.get(uid);
          if (saved?.kind === 'workBuilding' && saved.preferredSlots?.[0] === 0 && saved.bid) chefSet.add(saved.bid);
        }
      }
      state.buildingBuilders = bMap;
      state.kitchenHasChef = chefSet;
      renderOriginalMap(ctx, state.data, state, spriteCache);
    } else {
      ctx.fillStyle = '#18241b';
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
      ctx.fillStyle = '#e8df8a';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Đang tải bản đồ gốc...', 120, 160);
    }
    ctx = prevCtx;
    return;
  }
  if (state.phase === 'campaign') {
    drawCampaignWalkthrough();
    ctx = prevCtx;
    return;
  }
  if (state.phase === 'customSetup') {
    const img = getCaptureImage(3);
    if (img.complete && img.naturalWidth) ctx.drawImage(img, 0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    ctx.save();
    ctx.fillStyle = 'rgba(18, 16, 8, 0.72)';
    ctx.fillRect(14, 90, 212, 140);
    ctx.strokeStyle = '#d2c268';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 92, 208, 136);
    ctx.fillStyle = '#fff16b';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TRÒ CHƠI TUỲ CHỈNH', 120, 112);
    const sc = SCENARIOS[state.customConfig.scenarioIndex] || SCENARIOS[0];
    const diff = DIFFICULTIES[state.customConfig.difficultyIndex] || DIFFICULTIES[0];
    ctx.fillStyle = '#eef1df';
    ctx.font = '10px monospace';
    ctx.fillText(`Bản đồ: Màn ${state.customConfig.scenarioIndex + 1} (${sc.name})`, 120, 140);
    ctx.fillText(`Độ khó: ${diff.label}`, 120, 162);
    ctx.fillText(`Tài nguyên: ${state.customConfig.abundantResources ? 'DỒI DÀO (+60)' : 'TIÊU CHUẨN'}`, 120, 184);
    ctx.fillStyle = '#9cff7b';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('CHỌN BẮT ĐẦU Ở BẢNG BÊN PHẢI', 120, 212);
    ctx.restore();
    ctx = prevCtx;
    return;
  }
  drawOpeningScreen();
  ctx = prevCtx;
}

function draw() {
  if (phaserRuntime) {
    phaserRuntime.requestRedraw();
  } else if (ctx) {
    drawFrameToCtx(ctx);
  }
}

function addChoiceButton(label, index, selected, onClick, metaText = '', disabled = false) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `choice${selected ? ' selected' : ''}${disabled ? ' disabled' : ''}`;
  btn.setAttribute('aria-pressed', String(selected));
  btn.innerHTML =
    `<span class="index">${String(index + 1).padStart(2, '0')}</span>` +
    `<span class="label"></span>` +
    (metaText ? `<span class="meta"></span>` : '') +
    `<span class="arrow">${selected ? '▶' : ''}</span>`;
  btn.querySelector('.label').textContent = label;
  if (metaText) btn.querySelector('.meta').textContent = metaText;
  btn.addEventListener('click', onClick);
  choicesNode.append(btn);
}

function updatePanel() {
  choicesNode.replaceChildren();
  choicesNode.classList.remove('scrollable');

  if (state.phase === 'game') {
    const sc = SCENARIOS[state.scenarioIndex] || SCENARIOS[0];
    const diff = getCurrentDifficulty();

    // Story dialogue modal (/0/d0)
    if (state.storyDialog) {
      const dlg = state.storyDialog;
      const page = dlg.pages[dlg.index] || dlg.pages[0];
      panelTitle.textContent = `📖 ${dlg.title} (${dlg.index + 1}/${dlg.pages.length})`;
      panelCopy.textContent = page?.text || '';
      addChoiceButton(
        dlg.index + 1 < dlg.pages.length ? 'TRANG TIẾP THEO (ENTER)' : 'BẮT ĐẦU MÀN CHƠI (ENTER)',
        0,
        true,
        () => advanceStoryDialog()
      );
      if (dlg.index > 0) {
        addChoiceButton('TRANG TRƯỚC', 1, false, () => {
          state.storyDialog.index = Math.max(0, state.storyDialog.index - 1);
          render();
        });
      }
      addChoiceButton('BỎ QUA CỐT TRUYỆN (ESC)', dlg.index > 0 ? 2 : 1, false, () => {
        state.storyDialog = null;
        render();
      });
      helpNode.innerHTML =
        '<strong>Cốt truyện nguyên bản (/0/d0)</strong>' +
        '<span>Giải mã trực tiếp từ file nhị phân /0/d0 trong bản gốc tiếng Việt</span>' +
        '<span>Click màn hình hoặc nhấn Enter để sang đoạn thoại tiếp theo</span>';
      hintNode.textContent = 'ENTER / CLICK: TIẾP TỤC CỐT TRUYỆN · ESC: BỎ QUA';
      return;
    }

    // Victory / Defeat result modal & scoreboard
    if (state.missionResult) {
      const res = state.missionResult;
      const isWin = res.status === 'victory';
      const s = res.score;
      panelTitle.textContent = isWin ? `🏆 CHIẾN THẮNG — Màn ${state.scenarioIndex + 1}` : `💀 THẤT BẠI — Màn ${state.scenarioIndex + 1}`;
      panelCopy.textContent = res.epilogue ? `${res.reason} — "${res.epilogue}"` : res.reason;

      const board = document.createElement('div');
      board.className = 'villager-card';
      board.innerHTML =
        `<div class="villager-head"><strong>📊 Bảng tổng kết (Chuẩn /0/d0)</strong><span>Độ khó: ${diff.label}</span></div>` +
        `<div class="strategy-stats" style="margin:6px 0 0">` +
        `<span>👥 Dân số <b>${s.population}</b></span>` +
        `<span>🏠 Nhà đã xây <b>${s.buildingsBuilt}</b></span>` +
        `<span>⚔ Địch tiêu diệt <b>${s.enemiesKilled}</b></span>` +
        `<span>🔥 Nhà địch phá <b>${s.enemyBuildingsDestroyed}</b></span>` +
        `<span>📦 Tài nguyên <b>${s.resourcesTotal}</b></span>` +
        `<span>⭐ Tổng điểm <b style="color:#9cff7b">${s.totalScore}</b></span>` +
        `</div>`;
      choicesNode.append(board);

      let bi = 0;
      if (isWin && !state.isCustomGame && state.scenarioIndex < SCENARIOS.length - 1) {
        addChoiceButton(`SANG MÀN ${state.scenarioIndex + 2} (MANG THEO BỘ LẠC)`, bi++, true, () => proceedToNextMission());
      } else if (isWin && !state.isCustomGame && state.scenarioIndex === SCENARIOS.length - 1) {
        addChoiceButton('🏆 HOÀN THÀNH CHIẾN DỊCH — CHƠI LẠI MÀN 1', bi++, true, () => proceedToNextMission());
      }
      if (isWin) {
        addChoiceButton('CHƠI TIẾP MÀN NÀY', bi++, false, () => {
          state.missionResult = null;
          state.victoryDismissed = true;
          render();
        });
      }
      addChoiceButton('CHƠI LẠI MÀN NÀY', bi++, !isWin, () => {
        loadScenario(state.scenarioIndex, { useCarryover: false, isCustomGame: state.isCustomGame, showStory: false });
      });
      addChoiceButton('QUAY VỀ MENU CHẾ ĐỘ', bi++, false, () => {
        state.missionResult = null;
        setPhase('mode');
      });
      helpNode.innerHTML =
        '<strong>Chuyển màn chiến dịch (void_b)</strong>' +
        '<span>Khi sang màn tiếp theo, toàn bộ dân sống sót cùng vũ khí &amp; HP đã rèn sẽ đi cùng bộ lạc!</span>';
      hintNode.textContent = isWin ? 'CHIẾN THẮNG! SANG MÀN TIẾP THEO' : 'THẤT BẠI! CHỌN CHƠI LẠI';
      return;
    }

    if (state.panelMode === 'pause') {
      const ui = getUiStrings(state.language);
      const saveMeta = loadSaveMetadata();
      const langMeta = LANGUAGES[state.language] || LANGUAGES[0];
      panelTitle.textContent = ui.pauseTitle;
      panelCopy.textContent = state.message || `Màn ${state.scenarioIndex + 1}: ${getLocalizedScenarioName(state.langPack, state.scenarioIndex, sc.name)} [${diff.label}]`;
      choicesNode.classList.add('scrollable');
      let bi = 0;
      addChoiceButton(ui.resume, bi++, true, () => closePauseMenu());
      addChoiceButton(ui.saveGame, bi++, false, () => saveCurrentGame());
      addChoiceButton(
        saveMeta ? `${ui.loadGame} (M${saveMeta.scenarioIndex + 1} · ${saveMeta.population})` : ui.loadGame,
        bi++,
        false,
        () => resumeSavedGame(),
        saveMeta ? 'OK' : 'Trống',
        !saveMeta
      );
      addChoiceButton(ui.toggleMinimap, bi++, false, () => {
        state.panelMode = 'main';
        state.paused = false;
        toggleMinimap();
      });
      addChoiceButton(
        `${ui.switchLang}: ${langMeta.label}`,
        bi++,
        false,
        () => applyLanguage((state.language + 1) % LANGUAGES.length),
        `${state.language + 1}/5`
      );
      addChoiceButton(
        state.music ? '🎵 NHẠC MIDI (/SA): ĐANG BẬT (N)' : '🔇 NHẠC MIDI (/SA): ĐANG TẮT (N)',
        bi++,
        false,
        () => toggleMusic(),
        `${midiSynth.tracks.length || 5} bài`
      );
      if (midiSynth.tracks.length > 0) {
        addChoiceButton(
          `🎼 ${SA_TRACK_NAMES[midiSynth.currentTrackIndex]}`,
          bi++,
          false,
          () => cycleMidiTrack(),
          'Đổi bài'
        );
      }
      if (state.storyLines.length > 0) {
        addChoiceButton(ui.viewStory, bi++, false, () => {
          state.panelMode = 'main';
          state.paused = false;
          openMissionStory(state.scenarioIndex, 'intro');
          render();
        });
      }
      addChoiceButton(ui.exportSave, bi++, false, () => {
        if (exportSaveJson(state)) {
          state.message = 'Đã tải xuống file backup save (.json)!';
          render();
        }
      });
      addChoiceButton(ui.exitToMenu, bi++, false, () => {
        state.paused = false;
        state.panelMode = 'main';
        setPhase('mode');
      });
      helpNode.innerHTML =
        '<strong>Menu Tạm dừng &amp; Lưu tiến độ</strong>' +
        '<span>Tiến độ lưu trực tiếp vào trình duyệt (localStorage) để nút TIẾP TỤC mở lại ngay</span>' +
        '<span>Hỗ trợ đủ 5 gói ngôn ngữ gốc: VI / FR / IT / DE / ES (/0..4/{s,t,d0})</span>';
      hintNode.textContent = 'MENU TẠM DỪNG · P HOẶC ESC ĐỂ TIẾP TỤC';
      return;
    }

    if (state.panelMode === 'build') {
      panelTitle.textContent = 'Xây dựng công trình';
      panelCopy.textContent = `Tài nguyên hiện có: 🪵 ${state.wood} gỗ · 🪨 ${state.stone} đá · ⚒ ${state.tools} công cụ. Chọn công trình để đặt lên bản đồ.`;
      choicesNode.classList.add('scrollable');
      BUILDINGS.forEach((b, idx) => {
        const spec = getBuildingSpec(state.data, b.type);
        const costStr = `${spec.width}×${spec.height} · 🪵${spec.woodCost} 🪨${spec.stoneCost}${spec.toolsCost ? ` ⚒${spec.toolsCost}` : ''}`;
        addChoiceButton(
          spec.name,
          idx,
          state.buildType === b.type,
          () => startBuildPlacement(b.type),
          costStr,
          false
        );
      });
      addChoiceButton('+25 GỖ & +20 ĐÁ (THỬ XÂY NHANH)', BUILDINGS.length, false, () => {
        state.wood += 25;
        state.stone += 20;
        syncResourcesToData();
        state.message = 'Đã tiếp thêm +25 gỗ và +20 đá để thử nghiệm xây dựng!';
        render();
      });
      addChoiceButton('QUAY LẠI ĐIỀU KHIỂN (ESC)', BUILDINGS.length + 1, false, () => {
        state.panelMode = 'main';
        render();
      });
      helpNode.innerHTML =
        '<strong>Hướng dẫn xây dựng</strong>' +
        '<span>Chọn công trình → di chuột tới vùng đất xanh → Click để đặt móng</span>' +
        '<span>Dân làng sẽ tự chạy tới xây và tăng giới hạn dân (+4 cho mỗi Lều)</span>';
      hintNode.textContent = 'CHỌN CÔNG TRÌNH · CLICK ĐẤT TRỐNG ĐỂ XÂY';
      return;
    }

    if (state.panelMode === 'scenarios') {
      panelTitle.textContent = '10 Màn chiến dịch (/ma)';
      panelCopy.textContent = 'Giải mã trực tiếp toàn bộ 10 bản đồ chiến dịch từ file /ma và bảng /a gốc ngay trên trình duyệt.';
      choicesNode.classList.add('scrollable');
      SCENARIOS.forEach((item, idx) => {
        addChoiceButton(
          `Màn ${idx + 1}: ${item.name}`,
          idx,
          state.scenarioIndex === idx,
          () => loadScenario(idx),
          item.subtitle
        );
      });
      addChoiceButton('QUAY LẠI (ESC)', SCENARIOS.length, false, () => {
        state.panelMode = 'main';
        render();
      });
      helpNode.innerHTML =
        '<strong>Chuyển màn trực tiếp</strong>' +
        '<span>Màn 1 dùng snapshot đã đối chiếu 1:1; Màn 2–10 giải mã RLE trực tiếp từ /ma</span>' +
        '<span>Dùng WASD / mũi tên để cuộn khắp bản đồ 64×48 đến 96×96</span>';
      hintNode.textContent = 'CHỌN MÀN CHIẾN DỊCH TỪ /MA GỐC';
      return;
    }

    if (state.panelMode === 'building') {
      const bld = getPlayerBuildings().find((b) => b.bid === state.selectedBuildingBid);
      if (!bld) {
        state.panelMode = 'main';
      } else {
        const level = state.data.entityData[9115 + bld.bid] & 0xff;
        panelTitle.textContent = `${bld.spec.name} (Cấp ${Math.max(1, level)})`;
        panelCopy.textContent = `${bld.spec.desc} · HP ${bld.hp}/${bld.maxHp} · 🪵${state.wood} 🪨${state.stone} 🦴${state.tools}`;
        choicesNode.classList.add('scrollable');
        let btnIdx = 0;

        // Universal occupant leave buttons for EVERY building (including scaffolds/upgrades!)
        const panelOccupants = getBuildingOccupants(bld.bid);
        if (panelOccupants.length > 0) {
          const e = state.data.entityData;
          for (const uid of panelOccupants) {
            const info = getVillagerInfo(uid);
            const tag = getOccupantRoleTag(bld, uid);
            const hp = e[1919 + uid] & 0xff;
            const maxHp = Math.max(1, e[6767 + uid] & 0xff);
            addChoiceButton(
              `RỜI NHÀ: ${info.role}${tag ? ` (${tag})` : ''}`,
              btnIdx++,
              false,
              () => {
                evictUnitFromBuilding(uid, bld);
                if (state.canvasMenu?.kind === 'building') {
                  if (getBuildingOccupants(bld.bid).length > 0) openCanvasBuildingMenu(bld);
                  else state.canvasMenu = null;
                }
                render();
              },
              `HP ${hp}/${maxHp}`
            );
          }
          if (panelOccupants.length >= 2) {
            addChoiceButton(`CHO TẤT CẢ RỜI NHÀ (${panelOccupants.length})`, btnIdx++, false, () => {
              const list = getBuildingOccupants(bld.bid);
              state.selectedUnits.clear();
              for (const uid of list) evictUnitFromBuilding(uid, bld);
              for (const uid of list) state.selectedUnits.add(uid);
              state.selectedUnit = list[0] || 0;
              state.message = `🚪 Đã cho ${list.length} người rời khỏi ${bld.spec.name}!`;
              state.canvasMenu = null;
              render();
            });
          }
        }

        if (bld.targetType === 0) {
          // Kho vũ khí: craft & equip all 6 authentic weapons!
          for (const w of WEAPONS) {
            const ok = state.wood >= w.wood && state.stone >= w.stone && state.tools >= w.bones;
            const cost = `🪵${w.wood} 🪨${w.stone}${w.bones ? ` 🦴${w.bones}` : ''} · +${w.atk}`;
            addChoiceButton(`Chế & đeo: ${w.name}`, btnIdx++, false, () => craftAndEquipWeapon(w), cost, !ok);
          }
        } else if (bld.targetType === 8) {
          // Khu thánh địa: cast all 4 authentic Shaman spells!
          for (const sp of SPELLS) {
            const ok = state.tools >= sp.bones;
            addChoiceButton(`Phép: ${sp.name}`, btnIdx++, false, () => castShamanSpell(sp), `🦴${sp.bones}`, !ok);
          }
        }

        if (bld.targetType === 2) {
          addChoiceButton('CỬ DÂN VÀO NGỦ HỒI SỨC (Zzz)', btnIdx++, false, () => {
            const uid = state.selectedUnit || findNearestVillager(bld.x, bld.y, true);
            if (uid && assignRestTask(uid, bld)) {
              state.panelMode = 'main';
              state.message = `${getVillagerInfo(uid).role} đang vào Lều nghỉ ngủ!`;
              render();
            }
          });
        } else if ([1, 4, 5, 7, 8, 9, 11].includes(bld.targetType)) {
          const jobLabels = {
            1: 'CỬ DÂN VÀO LUYỆN CẬN CHIẾN (+8 HP)',
            4: 'CỬ ĐẦU BẾP VÀO NẤU ĂN (+2 ĂN)',
            5: 'CỬ DÂN VÀO LUYỆN NÉM (+8 HP)',
            7: 'CỬ DJ MỞ TIỆC DISCO (+VUI VẺ)',
            8: 'CỬ PHÁP SƯ TÍCH TỤ PHÉP (+XƯƠNG)',
            9: 'CỬ TRINH SÁT MỞ SƯƠNG MÙ (R=7)',
            11: 'CỬ LÍNH GÁC LÊN CHÒI (R=8)',
          };
          addChoiceButton(jobLabels[bld.targetType], btnIdx++, false, () => {
            const uid = state.selectedUnit || findNearestVillager(bld.x, bld.y, true);
            if (uid && assignWorkAtBuilding(uid, bld)) {
              state.panelMode = 'main';
              state.message = `${getVillagerInfo(uid).role} đang vào làm việc tại ${bld.spec.name}!`;
              render();
            }
          });
        }

        const maxLevel = getBuildingMaxLevel(state.data, bld.targetType);
        if (level < maxLevel) {
          const canUp = state.wood >= 15 && state.stone >= 10;
          addChoiceButton(`NÂNG CẤP LÊN CẤP ${level + 1}`, btnIdx++, false, () => performUpgradeBuilding(bld), '🪵15 🪨10', !canUp);
        }
        if (bld.hp < bld.maxHp) {
          addChoiceButton('SỬA CHỮA CÔNG TRÌNH', btnIdx++, false, () => {
            state.data.entityData[8505 + bld.bid] = bld.maxHp;
            addPopup(bld.x + 1, bld.y, 'Đã sửa đầy HP!', '#9cff7b');
            state.message = `Đã sửa chữa ${bld.spec.name} đầy HP!`;
            render();
          });
        }
        if (bld.targetType !== 3) {
          addChoiceButton('PHÁ HỦY CÔNG TRÌNH (HOÀN 30%)', btnIdx++, false, () => performDemolishBuilding(bld));
        }
        addChoiceButton('QUAY LẠI (ESC)', btnIdx++, false, () => {
          state.panelMode = 'main';
          render();
        });
        helpNode.innerHTML =
          '<strong>Quản lý công trình</strong>' +
          '<span>Cử dân vào làm việc / luyện tập / nấu ăn / mở tiệc / chế vũ khí</span>' +
          '<span>Nâng cấp tăng HP &amp; sức chứa; Phá hủy hoàn lại 30% gỗ đá</span>';
        hintNode.textContent = 'QUẢN LÝ CÔNG TRÌNH · ESC QUAY LẠI';
        return;
      }
    }

    const ui = getUiStrings(state.language);
    const localScName = getLocalizedScenarioName(state.langPack, state.scenarioIndex, sc.name);
    panelTitle.textContent = state.compareOriginal
      ? 'Ảnh chụp JAR gốc (đối chiếu)'
      : `${state.isCustomGame ? 'Tuỳ chỉnh' : `Màn ${state.scenarioIndex + 1}`}: ${localScName} [${diff.label}]`;
    panelCopy.textContent = state.message;

    const enemyCount = getEnemyIds().length;
    const enemyBldCount = getEnemyBuildings().length;
    const stats = document.createElement('div');
    stats.className = 'strategy-stats';
    stats.innerHTML =
      `<span>👥 Dân <b>${state.population}/${state.housingCap}</b></span>` +
      (enemyCount > 0 || enemyBldCount > 0
        ? `<span>⚔ Địch <b style="color:#ff8a80">${enemyCount} (${enemyBldCount} nhà)</b></span>`
        : `<span>🧭 Con trỏ <b>${state.cursor.x},${state.cursor.y}</b></span>`) +
      `<span>🍖 Ăn <b>${state.food}</b></span>` +
      `<span>🪵 Gỗ <b>${state.wood}</b></span>` +
      `<span>🪨 Đá <b>${state.stone}</b></span>` +
      `<span>🦴 Xương <b>${state.tools}</b></span>`;
    choicesNode.append(stats);

    // Compact live Mission Objectives card
    const evalObj = getCurrentMissionEvaluation();
    if (evalObj.items?.length > 0) {
      const objCard = document.createElement('div');
      objCard.className = 'villager-card';
      objCard.style.padding = '7px 10px';
      objCard.innerHTML =
        `<div class="villager-head" style="margin-bottom:4px"><strong>🎯 Mục tiêu ${state.isCustomGame ? 'Trận tuỳ chỉnh' : `Màn ${state.scenarioIndex + 1}`}</strong><span>Độ khó: ${diff.label}</span></div>` +
        evalObj.items
          .map(
            (it) =>
              `<div style="font-size:10px;line-height:1.45;color:${it.done ? '#9cff7b' : '#d3dcc9'}">${it.done ? '☑' : '☐'} ${it.label}</div>`
          )
          .join('');
      choicesNode.append(objCard);
    }

    const activeIds = getActiveSelectionIds();
    if (activeIds.length > 1) {
      const infos = activeIds.map((id) => getVillagerInfo(id));
      const totalAtk = activeIds.reduce((sum, id) => sum + getUnitDamage(id), 0);
      const avgHpPct = Math.round(
        (infos.reduce((sum, u) => sum + u.hp / u.maxHp, 0) / Math.max(1, infos.length)) * 100
      );
      const armedCount = infos.filter((u) => u.weaponId !== 9).length;
      const names = infos.slice(0, 4).map((u) => u.role).join(', ') + (infos.length > 4 ? ` +${infos.length - 4}` : '');
      const grpBadge = state.activeGroupId ? ` · NHÓM ${state.activeGroupId}` : '';
      const card = document.createElement('div');
      card.className = 'villager-card';
      card.innerHTML =
        `<div class="villager-head"><strong>⚔ Đội hình (${activeIds.length} người${grpBadge})</strong><span>Tổng ATK ${totalAtk} · ${armedCount} có vũ khí</span></div>` +
        `<div class="need-bars">` +
        `<div class="need-bar"><span>❤️ Máu TB ${avgHpPct}%</span><div class="need-track"><div class="need-fill" style="width:${avgHpPct}%;background:#63d957"></div></div></div>` +
        `</div>` +
        `<div style="margin-top:5px;font-size:10px;color:#9eb092">Thành viên: <b style="color:#e6eadf">${names}</b></div>`;
      choicesNode.append(card);
    } else if (state.selectedUnit) {
      const u = getVillagerInfo(state.selectedUnit);
      const taskLabel = describeTask(state.tasks.get(state.selectedUnit));
      const moodLabels = ['Vui vẻ', 'Bình thường', 'Buồn', 'Kiệt sức'];
      const card = document.createElement('div');
      card.className = 'villager-card';
      const hpPct = Math.round((u.hp / u.maxHp) * 100);
      card.innerHTML =
        `<div class="villager-head"><strong>${u.role}</strong><span>${u.sex} · ${u.age}t · ${moodLabels[u.moodIdx]} · ${u.weaponName} (ATK ${getUnitDamage(state.selectedUnit)})</span></div>` +
        `<div class="need-bars">` +
        `<div class="need-bar"><span>❤️ Máu ${u.hp}/${u.maxHp}</span><div class="need-track"><div class="need-fill" style="width:${hpPct}%;background:#63d957"></div></div></div>` +
        `<div class="need-bar"><span>🍖 No ${u.satiety}%</span><div class="need-track"><div class="need-fill" style="width:${u.satiety}%;background:#f0b84b"></div></div></div>` +
        `<div class="need-bar"><span>⚡ Sức ${u.energy}%</span><div class="need-track"><div class="need-fill" style="width:${u.energy}%;background:#6cc6f0"></div></div></div>` +
        `</div>` +
        `<div style="margin-top:5px;font-size:10px;color:#9eb092">Nhiệm vụ: <b style="color:#e6eadf">${taskLabel}</b></div>`;
      choicesNode.append(card);
    }

    choicesNode.classList.add('scrollable');
    const g7Count = state.groups[7].size;
    const g9Count = state.groups[9].size;
    const actions = [
      { label: ui.buildBtn, fn: () => { cancelBuildPlacement(); state.panelMode = 'build'; render(); } },
      { label: `${ui.scenariosBtn} (${state.scenarioIndex + 1}/10) (M)`, fn: () => { cancelBuildPlacement(); state.panelMode = 'scenarios'; render(); } },
      { label: state.showMinimap ? '🗺 ĐÓNG BẢN ĐỒ NHỎ (3)' : ui.toggleMinimap, fn: () => toggleMinimap() },
      { label: ui.pauseBtn, fn: () => openPauseMenu() },
      ...(state.storyLines.length > 0 ? [{ label: ui.viewStory, fn: () => { openMissionStory(state.scenarioIndex, 'intro'); render(); } }] : []),
      ...(!state.isCustomGame && state.scenarioIndex < SCENARIOS.length - 1
        ? [{ label: `⏭ CHUYỂN SANG MÀN ${state.scenarioIndex + 2} (MANG BỘ LẠC)`, fn: () => proceedToNextMission() }]
        : []),
      { label: activeIds.length > 1 ? `GÁN NHÓM 7 (${activeIds.length} NGƯỜI)` : g7Count > 0 ? `GỌI NHÓM 7 (${g7Count} CHIẾN BINH)` : 'GÁN NHÓM 7 (SHIFT+7)', fn: () => (activeIds.length > 1 ? assignGroup(7) : recallGroup(7)) },
      { label: activeIds.length > 1 ? `GÁN NHÓM 9 (${activeIds.length} NGƯỜI)` : g9Count > 0 ? `GỌI NHÓM 9 (${g9Count} CHIẾN BINH)` : 'GÁN NHÓM 9 (SHIFT+9)', fn: () => (activeIds.length > 1 ? assignGroup(9) : recallGroup(9)) },
      ...(enemyCount > 0 || enemyBldCount > 0 ? [{ label: '⚔ TIẾN CÔNG ĐỊCH GẦN NHẤT (F)', fn: () => attackNearestEnemy() }] : []),
      { label: 'TẬP HỢP TOÀN BỘ LẠC! (R)', fn: () => rallyAllVillagers() },
      ...(activeIds.length > 1 ? [{ label: 'GIẢI TÁN ĐỘI HÌNH / LÀM VIỆC', fn: () => disbandGroupToWork() }] : []),
      { label: state.autoAI ? 'AI BỘ LẠC TỰ ĐỘNG: ĐANG BẬT (Q)' : 'AI BỘ LẠC TỰ ĐỘNG: TẮT (Q)', fn: () => { state.autoAI = !state.autoAI; if (state.autoAI) runTribeAutoAI(); state.message = state.autoAI ? 'Đã bật AI tự động: dân rảnh sẽ tự đi thu thập và xây nhà.' : 'Đã tắt AI tự động.'; render(); } },
      { label: 'THU THẬP & MANG VỀ TRẠI (G)', fn: () => gatherNearest() },
      { label: 'CHUYỂN DÂN LÀNG (TAB)', fn: () => cycleUnit() },
      { label: state.music ? '🎵 NHẠC MIDI (/SA): BẬT (N)' : '🔇 NHẠC MIDI (/SA): TẮT (N)', fn: () => toggleMusic() },
      { label: ui.saveGame, fn: () => saveCurrentGame() },
    ];
    if (state.scenarioIndex === 0) {
      actions.push({
        label: state.compareOriginal ? 'QUAY LẠI LIVE RENDER (V)' : 'SO SÁNH ẢNH JAR GỐC (V)',
        fn: () => { state.compareOriginal = !state.compareOriginal; render(); },
      });
    }
    actions.forEach((act, idx) => addChoiceButton(act.label, idx, false, act.fn));

    helpNode.innerHTML =
      '<strong>Điều khiển chiến đấu &amp; đội hình</strong>' +
      '<span>Kéo chuột trên map: khoanh khung chọn nhiều chiến binh (Box-select)</span>' +
      '<span>Click quân/nhà địch: tấn công · Shift+7/9: lưu nhóm · 7/9: gọi nhóm · R: tập hợp</span>' +
      '<span>B: xây nhà · M: đổi màn 1–10 (/ma) · Q: AI tự động · Tab: đổi dân · Esc: hủy</span>';
    noteNode.innerHTML =
      '<span>ⓘ</span> Render live bằng sprite sheets gốc (pi0/pi9), giải mã trực tiếp 10 bản đồ từ /ma, kèm hệ thống chiến đấu cận chiến/tầm xa (ném đá/giáo), nhóm 7 &amp; 9 và AI bộ lạc địch.';
    hintNode.textContent =
      state.buildType !== null
        ? 'CLICK VÙNG XANH ĐỂ ĐẶT NHÀ · ESC HỦY'
        : 'KÉO KHUNG CHỌN NHÓM · CLICK ĐỊCH ĐỂ ĐÁNH · 7/9: NHÓM · R: TẬP HỢP';
    return;
  }

  if (state.phase === 'campaign') {
    const progress = state.campaignFrame - CAPTURED_FLOW.newGame + 1;
    const total = CAPTURED_FLOW.gameplay - CAPTURED_FLOW.newGame + 1;
    panelTitle.textContent = `Intro chiến dịch (${progress}/${total})`;
    panelCopy.textContent =
      'Khung hình gốc 240×320 từ chiến dịch mở đầu. Nhấn Tiếp tục để qua các trang truyện hoặc vào thẳng màn chơi render trực tiếp.';
    addChoiceButton('TIẾP TỤC', 0, true, () => confirm());
    addChoiceButton('VÀO THẲNG MÀN CHƠI LIVE', 1, false, () => loadScenario(0));
    addChoiceButton('QUAY LẠI', 2, false, () => back());
    helpNode.innerHTML =
      '<strong>Điều khiển</strong>' +
      '<span>Click màn hình / Enter: khung kế tiếp</span>' +
      '<span>Esc: quay lại menu chiến dịch</span>';
    noteNode.innerHTML =
      '<span>ⓘ</span> Chuỗi intro là ảnh chụp nguyên bản từ JAR gốc; kết thúc intro sẽ chuyển sang màn đồ hoạ live trên canvas.';
    hintNode.textContent = 'CLICK / ENTER ĐỂ TIẾP TỤC INTRO';
    return;
  }

  if (state.phase === 'customSetup') {
    const cfg = state.customConfig;
    const sc = SCENARIOS[cfg.scenarioIndex] || SCENARIOS[0];
    const diff = DIFFICULTIES[cfg.difficultyIndex] || DIFFICULTIES[0];
    panelTitle.textContent = 'Trò chơi tuỳ chỉnh';
    panelCopy.textContent = `Tuỳ chọn bản đồ chiến dịch từ /ma, độ khó (${diff.label}: ${diff.desc}) và tài nguyên khởi đầu.`;
    addChoiceButton(
      `BẢN ĐỒ: MÀN ${cfg.scenarioIndex + 1} — ${sc.name}`,
      0,
      false,
      () => {
        cfg.scenarioIndex = (cfg.scenarioIndex + 1) % SCENARIOS.length;
        render();
      },
      'Đổi map'
    );
    addChoiceButton(
      `ĐỘ KHÓ: ${diff.label}`,
      1,
      false,
      () => {
        cfg.difficultyIndex = (cfg.difficultyIndex + 1) % DIFFICULTIES.length;
        render();
      },
      cfg.difficultyIndex === 0 ? 'Địch 80%' : 'Địch 135%'
    );
    addChoiceButton(
      `TÀI NGUYÊN: ${cfg.abundantResources ? 'DỒI DÀO (+60)' : 'TIÊU CHUẨN'}`,
      2,
      false,
      () => {
        cfg.abundantResources = !cfg.abundantResources;
        render();
      }
    );
    addChoiceButton('▶ BẮT ĐẦU TRẬN TUỲ CHỈNH', 3, true, () => startCustomGame());
    addChoiceButton('QUAY LẠI (ESC)', 4, false, () => setPhase('mode'));
    helpNode.innerHTML =
      '<strong>Trò chơi tuỳ chỉnh</strong>' +
      '<span>Chọn bất kỳ bản đồ nào từ 1–10 (/ma) và độ khó Dễ / Khó</span>' +
      '<span>Chiến thắng bằng cách tiêu diệt toàn bộ quân &amp; công trình địch</span>';
    hintNode.textContent = 'CHỌN CẤU HÌNH · BẮT ĐẦU TRẬN TUỲ CHỈNH';
    return;
  }

  const phaseDef = PHASES[state.phase];
  if (state.phase === 'campaignMenu') {
    const ui = getUiStrings(state.language);
    const meta = loadSaveMetadata();
    phaseDef.options[0] = meta
      ? `${ui.continueSaved} (Màn ${meta.scenarioIndex + 1} · ${meta.population} dân)`
      : `${ui.continueSaved} (chưa có save)`;
    phaseDef.options[1] = ui.newCampaign;
    phaseDef.options[2] = `${ui.difficulty}: ${getCurrentDifficulty().label}`;
  }
  panelTitle.textContent = phaseDef.title;
  panelCopy.textContent = state.message || phaseDef.copy;
  phaseDef.options.forEach((label, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `choice${i === state.selected ? ' selected' : ''}`;
    btn.setAttribute('aria-pressed', String(i === state.selected));
    btn.innerHTML = `<span class="index">${String(i + 1).padStart(2, '0')}</span><span class="label"></span><span class="arrow">${i === state.selected ? '▶' : ''}</span>`;
    btn.querySelector('.label').textContent = label;
    btn.addEventListener('mouseenter', () => {
      state.selected = i;
      choicesNode.querySelectorAll('.choice').forEach((el, idx) => {
        const isSel = idx === i;
        el.classList.toggle('selected', isSel);
        el.setAttribute('aria-pressed', String(isSel));
        const arrow = el.querySelector('.arrow');
        if (arrow) arrow.textContent = isSel ? '▶' : '';
      });
      draw();
    });
    btn.addEventListener('click', () => {
      state.selected = i;
      confirm();
    });
    choicesNode.append(btn);
  });
  helpNode.innerHTML =
    '<strong>Điều khiển</strong>' +
    '<span>↑ ↓ hoặc W S: chọn mục</span>' +
    '<span>Enter / Space: xác nhận</span>' +
    '<span>Click trực tiếp vào màn hình hoặc danh sách bên cạnh</span>';
  noteNode.innerHTML =
    '<span>ⓘ</span> Menu mở đầu dùng ảnh chụp 240×320 của JAR gốc; 10 màn chiến dịch chạy live bằng tile/sprite (pi0/pi9) và /ma giải mã trực tiếp.';
  hintNode.textContent = 'CLICK / CHẠM · ENTER XÁC NHẬN';
}

function render() {
  draw();
  updatePanel();
}

function setPhase(phase) {
  state.phase = phase;
  state.selected = 0;
  state.compareOriginal = false;
  if (phase === 'game') {
    if (state.data && !state.selectedUnit) {
      state.selectedUnit = state.data.hoverUnit || getVillagerIds()[0] || 0;
    }
  } else if (PHASES[phase]) {
    state.message = PHASES[phase].copy;
  }
  render();
}

function confirm() {
  if (state.phase === 'language') {
    applyLanguage(state.selected);
    setPhase('music');
    return;
  }
  if (state.phase === 'music') {
    state.music = state.selected === 0;
    midiSynth.setEnabled(state.music, 0);
    setPhase('mainMenu');
    return;
  }
  if (state.phase === 'mainMenu') {
    if (state.selected === 0) {
      setPhase('mode');
      return;
    }
    state.message = `${PHASES.mainMenu.options[state.selected]} — mục này chưa được dựng trong bản web.`;
    render();
    return;
  }
  if (state.phase === 'mode') {
    if (state.selected === 0) {
      setPhase('campaignMenu');
      return;
    }
    if (state.selected === 1) {
      setPhase('customSetup');
      return;
    }
    if (state.selected === 2) {
      if (!state.data) loadScenario(0);
      state.panelMode = 'scenarios';
      setPhase('game');
      return;
    }
    setPhase('mainMenu');
    return;
  }
  if (state.phase === 'campaignMenu') {
    if (state.selected === 0) {
      resumeSavedGame();
      return;
    }
    if (state.selected === 1) {
      state.carryoverTribe = null;
      loadScenario(0, { useCarryover: false, isCustomGame: false, showStory: true });
      return;
    }
    if (state.selected === 2) {
      state.difficultyIndex = (state.difficultyIndex + 1) % DIFFICULTIES.length;
      const diff = getCurrentDifficulty();
      state.message = `Đã chọn Độ khó: ${diff.label} — ${diff.desc}`;
      render();
      return;
    }
    setPhase('mode');
    return;
  }
  if (state.phase === 'campaign') {
    if (state.campaignFrame < CAPTURED_FLOW.gameplay) {
      state.campaignFrame++;
      render();
      return;
    }
    loadScenario(0, { showStory: true });
    return;
  }
  if (state.phase === 'game' && state.data) {
    if (state.storyDialog) {
      advanceStoryDialog();
      return;
    }
    if (state.missionResult) {
      if (state.mpMode) {
        state.missionResult = null;
        state.mpWinner = null;
        mpClient?.returnToLobby();
        showMpLobby(true);
        render();
        return;
      }
      if (state.missionResult.status === 'victory' && !state.isCustomGame && state.scenarioIndex < SCENARIOS.length - 1) {
        proceedToNextMission();
      } else {
        loadScenario(state.scenarioIndex, { isCustomGame: state.isCustomGame, showStory: false });
      }
      return;
    }
    if (state.canvasMenu) {
      const item = state.canvasMenu.items?.[state.canvasMenu.selected];
      if (item?.action) item.action();
      return;
    }
    if (state.flagMode) {
      confirmFlagAtCursor();
      return;
    }
    if (state.buildType !== null) {
      confirmBuildAtCursor();
      return;
    }
    const { x, y } = state.cursor;
    const occ = state.data.occupancy[y]?.[x] ?? 0;
    const myTribe = state.localTribe ?? 0;
    const isOwnUnitOcc = myTribe === 1 ? occ >= 51 && occ <= 100 : occ >= 1 && occ <= 50;
    const isEnemyUnitOcc = myTribe === 1 ? occ >= 1 && occ <= 50 : occ >= 51 && occ <= 100;
    const isOwnBldOcc = myTribe === 1 ? occ <= -31 && occ >= -60 : occ <= -1 && occ >= -30;
    const isEnemyBldOcc = myTribe === 1 ? occ <= -1 && occ >= -30 : occ <= -31 && occ >= -60;

    if (isOwnUnitOcc) {
      selectUnit(occ);
      return;
    }
    if (isOwnBldOcc) {
      const bld = getPlayerBuildings(myTribe).find((b) => b.bid === -occ);
      const selIds = getActiveSelectionIds();
      const hasSel = selIds.length > 0;
      const allSelAlreadyInside =
        bld && hasSel && selIds.every((uid) => (state.data.entityData[4444 + uid] & 0xff) === bld.bid);
      // Direct 1-click entry when a villager is already selected (no forced menu popup!)
      // Exception: Kho chứa (bType 6) opens weapon swap menu if it has weapons in stock
      const storageHasWeapons =
        bld?.targetType === 6 &&
        WEAPONS.some((w) => (state.data.resources?.[myTribe]?.[5 + w.id] || 0) > 0);
      const workshopAlreadyStaffed = bld?.targetType === 0 && !bld.underConstruction && isBuildingSlot0Occupied(bld.bid);
      const shrineAlreadyStaffed = bld?.targetType === 8 && !bld.underConstruction && isBuildingSlot0Occupied(bld.bid);
      if (
        bld &&
        hasSel &&
        !allSelAlreadyInside &&
        !workshopAlreadyStaffed &&
        !shrineAlreadyStaffed &&
        (bld.underConstruction || (bld.targetType !== 6 && bld.targetType !== 3) || (!storageHasWeapons && bld.targetType === 3))
      ) {
        commandUnitTo(x, y);
        return;
      }
      if (bld) {
        state.selectedBuildingBid = bld.bid;
        state.panelMode = 'building';
        state.message = `${bld.spec.name} (HP ${bld.hp}/${bld.maxHp}). ${bld.spec.desc}`;
        openCanvasBuildingMenu(bld);
        return;
      }
    }
    if (getActiveSelectionIds().length > 0) {
      commandUnitTo(x, y);
    } else if (isEnemyUnitOcc) {
      const ehp = state.data.entityData[1919 + occ] & 0xff;
      const emax = state.data.entityData[6767 + occ] & 0xff;
      state.message = `Chiến binh địch (HP ${ehp}/${emax}) — hãy chọn chiến binh của bạn trước để tấn công!`;
      render();
    } else if (isEnemyBldOcc) {
      const ebld = getEnemyBuildings().find((b) => b.bid === -occ);
      state.message = ebld
        ? `${ebld.spec.name} của địch (HP ${ebld.hp}/${ebld.maxHp}) — hãy chọn chiến binh để phá hủy!`
        : 'Công trình của địch — hãy chọn chiến binh để tấn công!';
      render();
    } else {
      state.message = 'Hãy chọn một dân làng trước (click vào dân, kéo khung chọn nhóm, hoặc nhấn Tab).';
      render();
    }
  }
}

function back() {
  if (state.phase === 'game') {
    if (state.storyDialog) {
      state.storyDialog = null;
      render();
      return;
    }
    if (state.missionResult) {
      state.missionResult = null;
      state.mpWinner = null;
      mpClient?.returnToLobby();
      showMpLobby(true);
      render();
      return;
    }
    if (state.showMinimap) {
      state.showMinimap = false;
      render();
      return;
    }
    if (state.canvasMenu) {
      if (state.canvasMenu.kind === 'build' || state.canvasMenu.kind === 'villagers') openCanvasActionsMenu();
      else closeCanvasMenu();
      return;
    }
    if (state.panelMode === 'pause') {
      closePauseMenu();
      return;
    }
    if (state.flagMode) {
      cancelFlagPlacement();
      state.message = 'Đã hủy cắm cờ.';
      render();
      return;
    }
    if (state.buildType !== null) {
      cancelBuildPlacement();
      state.message = 'Đã hủy chế độ đặt công trình.';
      render();
      return;
    }
    if (state.panelMode !== 'main') {
      state.panelMode = 'main';
      render();
      return;
    }
    if (state.selectedUnit || state.selectedUnits.size > 0) {
      state.selectedUnit = 0;
      state.selectedUnits.clear();
      state.activeGroupId = 0;
      state.activePath = [];
      state.message = 'Đã bỏ chọn dân làng.';
      render();
      return;
    }
    // Never fall back to old campaign menus — open clean 1v1 Pause Menu instead!
    openPauseMenu();
  } else if (state.phase === 'campaign') {
    setPhase('campaignMenu');
  } else if (state.phase === 'campaignMenu' || state.phase === 'customSetup') {
    setPhase('mode');
  } else if (state.phase === 'mode') {
    setPhase('mainMenu');
  } else if (state.phase === 'mainMenu') {
    setPhase('music');
  } else if (state.phase === 'music') {
    setPhase('language');
  }
}

function moveCursor(dx, dy) {
  if (!state.data) return;
  state.cursor.x = Math.max(0, Math.min(state.data.width - 1, state.cursor.x + dx));
  state.cursor.y = Math.max(0, Math.min(state.data.height - 1, state.cursor.y + dy));
  ensureCursorInView();
  if (state.buildType !== null) updateBuildPreview();
  render();
}

function canvasCoords(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) * LOGICAL_WIDTH) / rect.width,
    y: ((event.clientY - rect.top) * LOGICAL_HEIGHT) / rect.height,
  };
}

function screenToMapCell(sx, sy) {
  const d = state.data;
  const originY = (d.mapTopUi ?? 22) - (d.verticalOffset ?? 6);
  const camXFull = state.smoothCamX ?? state.cameraX ?? 0;
  const camYFull = state.smoothCamY ?? state.cameraY ?? 0;
  const col = Math.floor(sx / CELL_WIDTH + camXFull);
  const row = Math.floor((sy - originY) / CELL_HEIGHT + camYFull);
  return {
    x: Math.max(0, Math.min(d.width - 1, col)),
    y: Math.max(0, Math.min(d.height - 1, row)),
  };
}

function toSignedByteLocal(v) {
  const b = v & 0xff;
  return b > 127 ? b - 256 : b;
}

window.addEventListener('keydown', (event) => {
  // Never steal keystrokes while typing in lobby inputs or while Multiplayer Lobby is open!
  const tag = event.target?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  const lobbyEl = document.getElementById('mp-lobby');
  if (lobbyEl && !lobbyEl.classList.contains('hidden')) return;

  const key = event.key.toLowerCase();
  if (state.phase === 'game') {
    if (state.canvasMenu) {
      const vertical = state.canvasMenu.kind === 'pause' || state.canvasMenu.kind === 'scenarios';
      if (vertical && (event.key === 'ArrowUp' || key === 'w')) { event.preventDefault(); moveCanvasMenuSelection(-1); return; }
      if (vertical && (event.key === 'ArrowDown' || key === 's')) { event.preventDefault(); moveCanvasMenuSelection(1); return; }
      if (!vertical && (event.key === 'ArrowUp' || key === 'w')) {
        const curItem = state.canvasMenu.items?.[state.canvasMenu.selected];
        if (curItem?.queueCount !== undefined) { event.preventDefault(); curItem.action?.(); return; }
      }
      if (!vertical && (event.key === 'ArrowDown' || key === 's')) {
        const curItem = state.canvasMenu.items?.[state.canvasMenu.selected];
        if (curItem?.decreaseAction) { event.preventDefault(); curItem.decreaseAction(); return; }
      }
      if (!vertical && (event.key === 'ArrowLeft' || key === 'a')) { event.preventDefault(); moveCanvasMenuSelection(-1); return; }
      if (!vertical && (event.key === 'ArrowRight' || key === 'd')) { event.preventDefault(); moveCanvasMenuSelection(1); return; }
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); confirm(); return; }
      if (event.key === 'Escape' || event.key === 'Backspace' || key === 'p') { event.preventDefault(); back(); return; }
      return;
    }
    if (event.key === 'ArrowLeft' || key === 'a') { event.preventDefault(); moveCursor(-1, 0); }
    else if (event.key === 'ArrowRight' || key === 'd') { event.preventDefault(); moveCursor(1, 0); }
    else if (event.key === 'ArrowUp' || key === 'w') { event.preventDefault(); moveCursor(0, -1); }
    else if (event.key === 'ArrowDown' || key === 's') { event.preventDefault(); moveCursor(0, 1); }
    else if (event.key === 'Tab') { event.preventDefault(); cycleUnit(); }
    else if (event.key === '7' || event.key === '&') { event.preventDefault(); if (event.shiftKey) assignGroup(7); else recallGroup(7); }
    else if (event.key === '9' || event.key === '(') { event.preventDefault(); if (event.shiftKey) assignGroup(9); else recallGroup(9); }
    else if (key === 'r') { event.preventDefault(); rallyAllVillagers(); }
    else if (key === 'f') { event.preventDefault(); attackNearestEnemy(); }
    else if (key === 'b') { event.preventDefault(); openCanvasBuildMenu(); }
    else if (key === 'm') { event.preventDefault(); toggleMinimap(); }
    else if (key === 'q') { event.preventDefault(); state.autoAI = !state.autoAI; if (state.autoAI) runTribeAutoAI(); state.message = state.autoAI ? 'Đã bật AI bộ lạc tự động.' : 'Đã tắt AI bộ lạc tự động.'; render(); }
    else if (key === 'g') { event.preventDefault(); gatherNearest(); }
    else if (key === 'c') { event.preventDefault(); if (state.selectedUnit) { centerOnUnit(state.selectedUnit); render(); } }
    else if (event.key === '3') { event.preventDefault(); toggleMinimap(); }
    else if (key === 'n') { event.preventDefault(); toggleMusic(); }
    else if (key === 'p') { event.preventDefault(); if (state.panelMode === 'pause') closePauseMenu(); else openPauseMenu(); }
    else if (key === 'v' && state.scenarioIndex === 0) { event.preventDefault(); state.compareOriginal = !state.compareOriginal; render(); }
    else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); confirm(); }
    else if (event.key === 'Escape' || event.key === 'Backspace') { event.preventDefault(); back(); }
    return;
  }

  if (state.phase === 'campaign') {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowRight') { event.preventDefault(); confirm(); }
    else if (event.key === 'ArrowLeft' && state.campaignFrame > CAPTURED_FLOW.newGame) { event.preventDefault(); state.campaignFrame--; render(); }
    else if (event.key === 'Escape' || event.key === 'Backspace') { event.preventDefault(); back(); }
    return;
  }

  const options = PHASES[state.phase]?.options || [];
  if (event.key === 'ArrowDown' || event.key === 'ArrowRight' || key === 's' || key === 'd') {
    event.preventDefault();
    state.selected = (state.selected + 1) % options.length;
    render();
  } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft' || key === 'w' || key === 'a') {
    event.preventDefault();
    state.selected = (state.selected + options.length - 1) % options.length;
    render();
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    confirm();
  } else if (event.key === 'Escape' || event.key === 'Backspace') {
    event.preventDefault();
    back();
  }
});

let dragStart = null;

canvas.addEventListener('pointermove', (event) => {
  if (state.phase !== 'game' || !state.data) return;
  const { x, y } = canvasCoords(event);
  state.pointerPos = { x, y, visible: true };
  if (dragStart && state.selectionBox) {
    const topUi = state.data.mapTopUi ?? 22;
    const bottomTop = LOGICAL_HEIGHT - (state.data.bottomUi ?? 22);
    state.selectionBox.x1 = Math.max(0, Math.min(LOGICAL_WIDTH, x));
    state.selectionBox.y1 = Math.max(topUi, Math.min(bottomTop, y));
    state.cursor = screenToMapCell(state.selectionBox.x1, state.selectionBox.y1);
    draw();
    return;
  }
  const topHudHeight = state.selectedUnit > 0 && !state.storyDialog && !state.missionResult ? (state.data.mapTopUi ?? 22) + 48 : (state.data.mapTopUi ?? 22);
  if (y >= topHudHeight && y < LOGICAL_HEIGHT - (state.data.bottomUi ?? 22)) {
    const cell = screenToMapCell(x, y);
    if (cell.x !== state.cursor.x || cell.y !== state.cursor.y) {
      state.cursor = cell;
      if (state.buildType !== null) updateBuildPreview();
    }
  }
  draw();
});

canvas.addEventListener('pointerleave', () => {
  state.pointerPos.visible = false;
  draw();
});

canvas.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  if (state.phase !== 'game' || !state.data) return;
  if (state.flagMode) {
    cancelFlagPlacement();
    state.message = 'Đã hủy cắm cờ.';
    render();
    return;
  }
  if (state.buildType !== null) {
    cancelBuildPlacement();
    state.message = 'Đã hủy đặt công trình.';
    render();
    return;
  }
  if (state.canvasMenu) {
    const curItem = state.canvasMenu.items?.[state.canvasMenu.selected];
    if (curItem?.decreaseAction) {
      curItem.decreaseAction();
      return;
    }
    closeCanvasMenu();
    return;
  }
  if (state.showMinimap) {
    state.showMinimap = false;
    render();
    return;
  }
  if (state.selectedUnit > 0 || state.selectedUnits.size > 0) {
    state.selectedUnit = 0;
    state.selectedUnits.clear();
    state.activeGroupId = 0;
    state.activePath = [];
    state.message = 'Đã bỏ chọn dân làng.';
    render();
  }
});

let lastMapClick = { time: 0, x: -99, y: -99 };

canvas.addEventListener('pointerdown', (event) => {
  if (event.button === 2) return; // Right-click handled by contextmenu (deselect / cancel)
  const { x, y } = canvasCoords(event);
  if (state.phase === 'game' && state.data) {
    if (state.storyDialog) {
      advanceStoryDialog();
      return;
    }
    if (state.missionResult) {
      confirm();
      return;
    }
    if (state.canvasMenu) {
      handleCanvasMenuClick(x, y);
      return;
    }
    const bottomTop = LOGICAL_HEIGHT - (state.data.bottomUi ?? 22);
    const ox = Math.floor((LOGICAL_WIDTH - 240) / 2);
    const lx = x - ox;
    if (y >= bottomTop) {
      if (x <= 34) {
        // Authentic Left Green Softkey (f.java:3531): Confirm build placement if placing, otherwise open Panel 5 Tribe Actions Menu!
        if (state.buildType !== null) {
          confirmBuildAtCursor();
        } else {
          openCanvasActionsMenu();
        }
      } else if (lx >= 92 && lx <= 118) {
        if (event.shiftKey) assignGroup(7);
        else recallGroup(7);
      } else if (lx >= 122 && lx <= 148) {
        if (event.shiftKey) assignGroup(9);
        else recallGroup(9);
      } else if (lx >= 165 && lx <= 205) {
        // Map/Compass icon on bottom bar -> toggle Minimap (key 3)
        toggleMinimap();
      } else if (x >= LOGICAL_WIDTH - 34) {
        // Authentic Right Red Softkey (f.java:3538): Cancel build placement if active, otherwise ALWAYS open On-Canvas Pause Menu!
        if (state.buildType !== null) {
          cancelBuildPlacement();
          state.message = 'Đã hủy đặt công trình.';
          render();
        } else {
          openPauseMenu();
        }
      }
      return;
    }
    if (state.showMinimap) {
      jumpCameraFromMinimap(x, y);
      return;
    }
    const topBase = state.data.mapTopUi ?? 22;
    const panel4Open = state.selectedUnit > 0 && !state.storyDialog && !state.missionResult;
    if (y < topBase) return;
    if (panel4Open && y < topBase + 48) {
      // Clicking Panel 4 avatar centers on the villager; clicking Panel 4 does not click map underneath
      if (lx >= 0 && lx <= 38) {
        centerOnUnit(state.selectedUnit);
        render();
      }
      return;
    }
    if (state.flagMode) {
      state.cursor = screenToMapCell(x, y);
      confirmFlagAtCursor();
      return;
    }
    if (state.buildType !== null) {
      state.cursor = screenToMapCell(x, y);
      updateBuildPreview();
      confirm();
      return;
    }
    dragStart = { x, y };
    state.selectionBox = { x0: x, y0: y, x1: x, y1: y };
    try { canvas.setPointerCapture(event.pointerId); } catch {}
    return;
  }

  if (state.phase === 'campaign') {
    confirm();
    return;
  }

  if (state.phase === 'music') {
    state.selected = x < LOGICAL_WIDTH / 2 ? 0 : 1;
    confirm();
    return;
  }

  if (state.phase === 'customSetup') return;

  const phaseDef = PHASES[state.phase];
  if (!phaseDef) return;
  const top = state.phase === 'language' ? 92 : state.phase === 'campaignMenu' ? 124 : 144;
  const row = Math.round((y - top) / 20);
  if (row >= 0 && row < phaseDef.options.length && Math.abs(y - (top + row * 20)) <= 12) {
    state.selected = row;
    confirm();
  }
});

function finishCanvasPointerDrag(event, cancelled = false) {
  if (!dragStart) return;
  const start = dragStart;
  dragStart = null;
  state.selectionBox = null;
  if (cancelled || state.phase !== 'game' || !state.data) {
    draw();
    return;
  }
  const { x, y } = canvasCoords(event);
  const w = Math.abs(x - start.x);
  const h = Math.abs(y - start.y);
  if (w > 8 || h > 8) {
    const d = state.data;
    const e = d.entityData;
    const originY = (d.mapTopUi ?? 22) - (d.verticalOffset ?? 6);
    const x0 = Math.min(start.x, x) - 6;
    const x1 = Math.max(start.x, x) + 6;
    const y0 = Math.min(start.y, y) - 6;
    const y1 = Math.max(start.y, y) + 6;
    const picked = [];
    for (const id of getVillagerIds()) {
      if (isUnitInsideBuilding(d, id)) continue;
      const sx = ((e[id] & 0xff) - state.cameraX) * CELL_WIDTH + toSignedByteLocal(e[202 + id]) + 11;
      const sy = originY + ((e[101 + id] & 0xff) - state.cameraY) * CELL_HEIGHT + toSignedByteLocal(e[303 + id]) + 7;
      if (sx >= x0 && sx <= x1 && sy >= y0 && sy <= y1) picked.push(id);
    }
    if (picked.length > 0) {
      state.selectedUnits = new Set(picked);
      state.selectedUnit = picked[0];
      state.activeGroupId = 0;
      state.activePath = [];
      state.message =
        picked.length > 1
          ? `Đã khoanh khung chọn ${picked.length} chiến binh! Click ô đất để hành quân, click địch để tấn công, hoặc nhấn Shift+7 / Shift+9 để lưu nhóm.`
          : `Đã chọn ${getVillagerInfo(picked[0]).role}.`;
      render();
    } else {
      draw();
    }
    return;
  }
  const cell = screenToMapCell(x, y);
  const now = performance.now();
  const hasSelection = state.selectedUnit > 0 || state.selectedUnits.size > 0;
  const isDoubleClick =
    hasSelection &&
    now - lastMapClick.time <= 400 &&
    Math.abs(cell.x - lastMapClick.x) <= 1 &&
    Math.abs(cell.y - lastMapClick.y) <= 1;

  state.cursor = cell;
  const e = state.data.entityData;
  const activeIds =
    state.selectedUnits.size > 0
      ? [...state.selectedUnits].filter((id) => (e[1919 + id] & 0xff) > 0)
      : state.selectedUnit > 0
        ? [state.selectedUnit]
        : [];

  if (isDoubleClick && activeIds.length > 0) {
    // Double left-click with villager(s) already selected -> SPRINT (e[7777]=1, authentic anim 7, ~2x speed)!
    if (state.mpMode && state.localTribe === 1) {
      mpClient?.sendCommand({ kind: 'sprint', tx: cell.x, ty: cell.y, unitIds: activeIds });
      state.message =
        activeIds.length > 1
          ? `🏃 ${activeIds.length} dân làng đang chạy nhanh!`
          : `🏃 ${getVillagerInfo(activeIds[0]).role} đang chạy nhanh!`;
      render();
      lastMapClick = { time: 0, x: -99, y: -99 };
      return;
    }
    // Ensure a movement task exists if not already moving
    const anyMoving = activeIds.some((id) => state.tasks.get(id)?.path?.length > 0);
    if (!anyMoving) {
      confirm();
    }
    let sprinters = 0;
    for (const id of activeIds) {
      const t = state.tasks.get(id);
      if (t?.path?.length > 0 && (e[1414 + id] & 0xff) >= 12 && (e[3535 + id] & 0xff) === 0) {
        e[7777 + id] = 1;
        sprinters++;
      }
    }
    if (sprinters > 0) {
      state.message =
        sprinters > 1
          ? `🏃 ${sprinters} dân làng đang chạy nhanh!`
          : `🏃 ${getVillagerInfo(activeIds[0]).role} đang chạy nhanh!`;
      render();
    }
    lastMapClick = { time: 0, x: -99, y: -99 };
    return;
  }

  // Single left-click: if a villager is ALREADY running along a path, keep them running smoothly
  // instead of dropping back to walk speed (which would also cause a backward sub-tile jerk)!
  for (const id of activeIds) {
    const t = state.tasks.get(id);
    const alreadyRunning = Boolean(t?.path?.length > 0 && (e[7777 + id] & 0xff) > 0);
    if (!alreadyRunning) {
      e[7777 + id] = 0;
    }
  }
  lastMapClick = { time: now, x: cell.x, y: cell.y };
  confirm();
}

canvas.addEventListener('pointerup', (event) => finishCanvasPointerDrag(event, false));
canvas.addEventListener('pointercancel', (event) => finishCanvasPointerDrag(event, true));

document.querySelector('[data-action="confirm"]').addEventListener('click', confirm);
document.querySelector('[data-action="back"]').addEventListener('click', back);

spriteCache.preloadCoreSheets();
for (let i = 0; i <= 4; i++) getCaptureImage(i);

const initParams = new URLSearchParams(window.location.search);
const startLangParam = Number.parseInt(initParams.get('lang') ?? '0', 10);
const startLang = Number.isFinite(startLangParam) ? Math.max(0, Math.min(4, startLangParam)) : 0;

Promise.all([
  fetch('data-first-map.json').then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }),
  fetch('assets/ma')
    .then((r) => (r.ok ? r.arrayBuffer() : null))
    .then((buf) => (buf ? new Uint8Array(buf) : null))
    .catch(() => null),
  fetch('assets/a')
    .then((r) => (r.ok ? r.arrayBuffer() : null))
    .then((buf) => (buf ? new Uint8Array(buf) : null))
    .catch(() => null),
  fetch('assets/pd0')
    .then((r) => (r.ok ? r.arrayBuffer() : null))
    .then((buf) => (buf ? new Uint8Array(buf) : null))
    .catch(() => null),
  fetch('assets/sa')
    .then((r) => (r.ok ? r.arrayBuffer() : null))
    .then((buf) => (buf ? new Uint8Array(buf) : null))
    .catch(() => null),
  loadLanguagePack(startLang),
])
  .then(([baseData, maBytes, aBytes, pd0Bytes, saBytes, langPack]) => {
    // Phase 6: Hydrate sprite & lookup tables directly from original /pd0 and /a binaries!
    const parsedPd0 = parseOriginalPd0(pd0Bytes);
    if (parsedPd0) {
      baseData.shortSpriteTables = parsedPd0.shortSpriteTables;
      baseData.byteSpriteTables = parsedPd0.byteSpriteTables;
    }
    const parsedA = parseOriginalA(aBytes);
    if (parsedA) {
      baseData.mapTableData = parsedA.mapTableData;
      baseData.mapTableOffsets = parsedA.mapTableOffsets;
      baseData.entityFieldOffsets = parsedA.entityFieldOffsets;
    }
    if (saBytes) {
      midiSynth.loadTracks(saBytes);
    }

    state.baseData = baseData;
    state.maBytes = maBytes;
    state.language = startLang;
    state.langPack = langPack;
    state.storyLines = langPack?.d0 || [];

    const params = initParams;
    const requested = params.get('screen');
    const scenarioParam = Number.parseInt(params.get('scenario') ?? '0', 10);
    const startScenario = Number.isFinite(scenarioParam) ? Math.max(0, Math.min(9, scenarioParam)) : 0;
    const wantStory = params.get('story') === '1';

    // Dynamic full-window logical viewport (scales cleanly to any browser window size, no 240x320 lock!)
    let pixelScale = 2;
    const viewportBadgeEl = document.getElementById('viewport-badge');
    const zoomBtnEl = document.getElementById('btn-zoom');
    const fullscreenBtnEl = document.getElementById('btn-fullscreen');
    const drawerEl = document.getElementById('side-drawer');
    const toggleDrawerBtnEl = document.getElementById('btn-toggle-drawer');
    const closeDrawerBtnEl = document.getElementById('btn-close-drawer');

    const computeWindowViewport = () => {
      const vw = Math.max(240, window.innerWidth || 640);
      const vh = Math.max(320, window.innerHeight || 360);
      const effScale = vw < 480 ? 1 : pixelScale;
      const w = Math.max(240, Math.floor(vw / effScale));
      const h = Math.max(320, Math.floor(vh / effScale));
      return { w, h, effScale };
    };

    const syncViewportToWindow = () => {
      const { w, h, effScale } = computeWindowViewport();
      setLogicalViewport(w, h);
      if (phaserRuntime?.resize) {
        phaserRuntime.resize(w, h);
        ctx = phaserRuntime.ctx;
      } else {
        canvas.width = w;
        canvas.height = h;
      }
      if (state.data) {
        clampCamera();
        state.smoothCamX = state.cameraX;
        state.smoothCamY = state.cameraY;
      }
      if (viewportBadgeEl) {
        viewportBadgeEl.innerHTML = `<span></span> ${w}×${h} · ${effScale}x WebGL`;
      }
      if (zoomBtnEl) {
        zoomBtnEl.textContent = `🔍 ${effScale}x`;
      }
      draw();
    };

    const initVp = computeWindowViewport();
    setLogicalViewport(initVp.w, initVp.h);

    // Classic RTS 60 FPS Edge-Scrolling (move mouse to screen edges to pan camera smoothly!)
    const pointerScreen = { x: -1, y: -1, inside: false };
    window.addEventListener('pointermove', (ev) => {
      if (ev.pointerType === 'touch') return;
      pointerScreen.x = ev.clientX;
      pointerScreen.y = ev.clientY;
      pointerScreen.inside = true;
    });
    document.addEventListener('mouseleave', () => {
      pointerScreen.inside = false;
    });
    window.addEventListener('blur', () => {
      pointerScreen.inside = false;
    });

    phaserRuntime = mountPhaserRuntime({
      canvas,
      width: LOGICAL_WIDTH,
      height: LOGICAL_HEIGHT,
      tickMs: 120,
      onStepSimulation() {
        try {
          stepSimulation();
        } catch (err) {
          console.error('[sim]', err);
        }
      },
      onFrameInterpolate(subTick, dt) {
        if (state.phase !== 'game' || !state.data) return false;
        let changed = false;

        // 0. RTS Mouse Edge-Scrolling (60 FPS smooth camera pan when cursor touches window edges)
        const mpLobbyEl = document.getElementById('mp-lobby');
        const lobbyVisible = mpLobbyEl && !mpLobbyEl.classList.contains('hidden');
        const drawerOpen = drawerEl?.classList.contains('open');
        if (
          pointerScreen.inside &&
          !lobbyVisible &&
          !drawerOpen &&
          !state.paused &&
          !state.storyDialog &&
          !state.missionResult &&
          !state.showMinimap &&
          !state.canvasMenu
        ) {
          const winW = window.innerWidth || 1;
          const winH = window.innerHeight || 1;
          const EDGE_X = 42;
          const EDGE_Y = 44;
          const px = pointerScreen.x;
          const py = pointerScreen.y;
          // Dead-zones over clickable UI buttons so hovering green/red softkeys or top-right toolbar NEVER scrolls the map!
          const onSoftkeyButtons = py > winH - 52 && (px < 88 || px > winW - 88);
          const onTopToolbar = py < 42 && px > winW - 240;
          let vx = 0;
          let vy = 0;
          if (!onSoftkeyButtons && !onTopToolbar) {
            if (px >= 0 && px < EDGE_X) vx = -1;
            else if (px > winW - EDGE_X && px <= winW) vx = 1;
            if (py >= 0 && py < EDGE_Y) vy = -1;
            else if (py > winH - EDGE_Y && py <= winH) vy = 1;
          }

          if (vx !== 0 || vy !== 0) {
            const d = state.data;
            const maxCamX = Math.max(0, d.width - getViewportCols());
            const maxCamY = Math.max(0, d.height - getViewportRows());
            const dtSec = (dt || 16.6) / 1000;
            const stepX = dtSec * 34; // 34 tiles/sec horizontal pan
            const stepY = dtSec * 44; // 44 tiles/sec fast vertical pan (matches 22x16 tile aspect ratio!)
            const curX = state.smoothCamX ?? state.cameraX ?? 0;
            const curY = state.smoothCamY ?? state.cameraY ?? 0;
            const nextX = Math.max(0, Math.min(maxCamX, curX + vx * stepX));
            const nextY = Math.max(0, Math.min(maxCamY, curY + vy * stepY));
            if (Math.abs(nextX - curX) > 0.0005 || Math.abs(nextY - curY) > 0.0005) {
              state.cameraX = nextX;
              state.cameraY = nextY;
              state.smoothCamX = nextX;
              state.smoothCamY = nextY;
              if (state.buildType !== null) {
                const rect = canvas.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                  const lx = ((px - rect.left) * LOGICAL_WIDTH) / rect.width;
                  const ly = ((py - rect.top) * LOGICAL_HEIGHT) / rect.height;
                  state.cursor = screenToMapCell(lx, ly);
                  updateBuildPreview();
                }
              }
              changed = true;
            }
          }
        }

        // 1. Smooth 60 FPS Camera Interpolation (smoothCamX / smoothCamY)
        const targetCamX = state.cameraX ?? 0;
        const targetCamY = state.cameraY ?? 0;
        if (state.smoothCamX === undefined) state.smoothCamX = targetCamX;
        if (state.smoothCamY === undefined) state.smoothCamY = targetCamY;
        const camLerp = Math.min(1, (dt || 16.6) * 0.018);
        const dxCam = targetCamX - state.smoothCamX;
        const dyCam = targetCamY - state.smoothCamY;
        if (Math.abs(dxCam) > 0.002 || Math.abs(dyCam) > 0.002) {
          state.smoothCamX = Math.abs(dxCam) < 0.01 ? targetCamX : state.smoothCamX + dxCam * camLerp;
          state.smoothCamY = Math.abs(dyCam) < 0.01 ? targetCamY : state.smoothCamY + dyCam * camLerp;
          changed = true;
        }

        // 2. Smooth 60 FPS Sub-Tick Unit Movement Interpolation (no pause at stepProgress===0!)
        if (!state.paused && !state.storyDialog && !state.missionResult) {
          const e = state.data.entityData;
          const fo29 = state.data.entityFieldOffsets?.[29];
          const interpUnit = (uid, task) => {
            if (!task?.path || task.path.length === 0) return;
            // Never sub-tick interpolate while the unit is standing still putting on / removing a hat (anim 147/148)
            // or performing a stationary courtship animation (155..158) — otherwise 60fps slides +3px and snaps back to 0!
            const curAnim = fo29 !== undefined ? (e[fo29 + uid] & 0xff) : 0;
            const pendingHat =
              (task.stepProgress || 0) === 0 &&
              ((task.hatPutFrame !== undefined && task.hatPutFrame < 7) ||
                (task.hatRemoveFrame !== undefined && task.hatRemoveFrame < 7));
            if (pendingHat || curAnim === 147 || curAnim === 148 || (curAnim >= 155 && curAnim <= 158)) {
              e[202 + uid] = 0;
              e[303 + uid] = 0;
              return;
            }
            const ux = e[uid] & 0xff;
            const uy = e[101 + uid] & 0xff;
            const target = task.path[0];
            const dx = target.x - ux;
            const dy = target.y - uy;
            const stepsPerTile = getUnitStepTicks(uid, dx, dy);
            const smoothStep = Math.min(stepsPerTile, (task.stepProgress || 0) + subTick);
            const frac = smoothStep / stepsPerTile;
            e[202 + uid] = Math.round(dx * CELL_WIDTH * frac);
            e[303 + uid] = Math.round(dy * CELL_HEIGHT * frac);
            changed = true;
          };
          for (const [uid, task] of state.tasks.entries()) interpUnit(uid, task);
          for (const [eid, task] of state.enemyTasks.entries()) interpUnit(eid, task);
        }
        return changed;
      },
      onRenderFrame(targetCtx) {
        drawFrameToCtx(targetCtx);
      },
    });
    ctx = phaserRuntime.ctx;

    window.addEventListener('resize', () => syncViewportToWindow());
    zoomBtnEl?.addEventListener('click', () => {
      pixelScale = pixelScale === 2 ? 1 : pixelScale === 1 ? 3 : 2;
      syncViewportToWindow();
    });
    fullscreenBtnEl?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
    });
    toggleDrawerBtnEl?.addEventListener('click', () => {
      const open = drawerEl?.classList.toggle('open');
      drawerEl?.setAttribute('aria-hidden', open ? 'false' : 'true');
    });
    closeDrawerBtnEl?.addEventListener('click', () => {
      drawerEl?.classList.remove('open');
      drawerEl?.setAttribute('aria-hidden', 'true');
    });
    syncViewportToWindow();

    // === 1v1 Multiplayer & Vs AI Lobby Setup ===
    const mpHomeView = document.getElementById('mp-home-view');
    const mpAiView = document.getElementById('mp-ai-view');
    const mpRoomView = document.getElementById('mp-room-view');
    const mpAiOpenBtn = document.getElementById('mp-ai-open-btn');
    const mpAiBackBtn = document.getElementById('mp-ai-back-btn');
    const mpAiStartBtn = document.getElementById('mp-ai-start-btn');
    const mpAiMapSelect = document.getElementById('mp-ai-map-select');
    const mpAiDiffSelect = document.getElementById('mp-ai-diff-select');
    const mpAiPlayerNameEl = document.getElementById('mp-ai-player-name');
    const mpNameInput = document.getElementById('mp-name-input');
    const mpCodeInput = document.getElementById('mp-code-input');
    const mpCreateBtn = document.getElementById('mp-create-btn');
    const mpJoinBtn = document.getElementById('mp-join-btn');
    const mpCopyBtn = document.getElementById('mp-copy-btn');
    const mpOpenTab2Btn = document.getElementById('mp-open-tab2-btn');
    const mpLeaveBtn = document.getElementById('mp-leave-btn');
    const mpReadyBtn = document.getElementById('mp-ready-btn');
    const mpMapSelect = document.getElementById('mp-map-select');
    const mpRoomCodeDisplay = document.getElementById('mp-room-code-display');
    const mpHostNameEl = document.getElementById('mp-host-name');
    const mpHostStatusEl = document.getElementById('mp-host-status');
    const mpGuestNameEl = document.getElementById('mp-guest-name');
    const mpGuestStatusEl = document.getElementById('mp-guest-status');
    const mpCountdownEl = document.getElementById('mp-countdown-banner');
    const mpHomeMsgEl = document.getElementById('mp-home-msg');
    const mpRoomMsgEl = document.getElementById('mp-room-msg');
    const openLobbyToolbarBtn = document.getElementById('btn-mp-lobby');

    for (const sel of [mpMapSelect, mpAiMapSelect]) {
      if (!sel) continue;
      sel.innerHTML = '';
      for (const m of MP_MAPS) {
        const opt = document.createElement('option');
        opt.value = String(m.scenarioIndex);
        opt.textContent = m.name;
        sel.appendChild(opt);
      }
    }

    const executeGuestCommand = (cmd) => {
      if (!cmd || !state.data || state.localTribe !== 0) return;
      const e = state.data.entityData;
      if (cmd.kind === 'commandTo') {
        const ids = (cmd.unitIds || []).filter((id) => id >= 51 && id <= 100 && (e[1919 + id] & 0xff) > 0);
        for (const id of ids) {
          const t = state.tasks.get(id);
          if (!(t?.path?.length > 0 && (e[7777 + id] & 0xff) > 0)) e[7777 + id] = 0;
        }
        if (ids.length > 0) commandUnitTo(cmd.tx, cmd.ty, ids, 1);
      } else if (cmd.kind === 'sprint') {
        const ids = (cmd.unitIds || []).filter((id) => id >= 51 && id <= 100 && (e[1919 + id] & 0xff) > 0);
        if (ids.length > 0) {
          const anyMoving = ids.some((id) => state.tasks.get(id)?.path?.length > 0);
          if (!anyMoving) commandUnitTo(cmd.tx, cmd.ty, ids, 1);
          for (const id of ids) {
            if (state.tasks.get(id)?.path?.length > 0 && (e[1414 + id] & 0xff) >= 12 && (e[3535 + id] & 0xff) === 0) {
              e[7777 + id] = 1;
            }
          }
        }
      } else if (cmd.kind === 'placeBuild') {
        confirmBuildAtCursor(1, cmd);
      } else if (cmd.kind === 'flagCommand') {
        confirmFlagAtCursor(1, cmd);
      } else if (cmd.kind === 'setUseRawWeapon') {
        state.tribeUseRawWeapon[1] = Boolean(cmd.value);
      } else if (cmd.kind === 'setWeaponQueue') {
        adjustWeaponQueue(cmd.bid, cmd.weaponId, cmd.delta, true);
      }
    };

    const startMatchCommon = (mapIdx, myTribe, { isMp, isAi, difficulty = 'normal' }) => {
      state.mpMode = isMp;
      state.aiMode = isAi;
      state.aiDifficulty = difficulty;
      state.localTribe = myTribe;
      state.mpWinner = null;
      state.missionResult = null;
      state.storyDialog = null;
      state.canvasMenu = null;
      state.buildType = null;
      state.buildPreview = null;
      state.showMinimap = false;
      state.tasks.clear();
      state.savedJobs.clear();
      state.enemyTasks.clear();
      state.weaponQueues.clear();
      state.siteMaterials.clear();
      state.shrineRituals.clear();
      state.animalMoves.clear();
      state.projectiles = [];
      state.dustEffects = [];
      state.selectedUnits.clear();
      state.scenarioIndex = mapIdx;

      state.data = prepareMultiplayerMatch(baseData, maBytes, mapIdx, myTribe);
      pullLocalResourcesFromData();
      const myUnits = getVillagerIds(myTribe);
      state.selectedUnit = myUnits[0] || 0;
      if (state.selectedUnit) state.selectedUnits = new Set([state.selectedUnit]);
      state.cameraX = state.data.cameraX;
      state.cameraY = state.data.cameraY;
      state.smoothCamX = state.cameraX;
      state.smoothCamY = state.cameraY;
      state.cursor = { x: state.data.cursorX, y: state.data.cursorY };
      state.phase = 'game';
      state.paused = false;
      const diffLabel = difficulty === 'easy' ? 'Dễ' : difficulty === 'hard' ? 'Khó' : 'Thường';
      state.message = isAi
        ? `🤖 Chơi với Máy (${diffLabel})! Bạn điều khiển BỘ LẠC XANH đối đầu MÁY AI (BỘ LẠC ĐỎ).`
        : myTribe === 0
          ? '🟢 Trận đấu 1v1 bắt đầu! Bạn điều khiển BỘ LẠC XANH (Chủ phòng).'
          : '🔴 Trận đấu 1v1 bắt đầu! Bạn điều khiển BỘ LẠC ĐỎ (Khách).';
      clampCamera();
      showMpLobby(false);
      render();
    };

    const startMultiplayerMatch = (mapIdx, myTribe) => startMatchCommon(mapIdx, myTribe, { isMp: true, isAi: false });
    const startAiMatch = (mapIdx, difficulty) => startMatchCommon(mapIdx, 0, { isMp: false, isAi: true, difficulty });

    mpAiOpenBtn?.addEventListener('click', () => {
      if (mpAiPlayerNameEl) mpAiPlayerNameEl.textContent = (mpNameInput?.value || 'Tù trưởng').trim() || 'Tù trưởng';
      mpHomeView?.classList.add('hidden');
      mpRoomView?.classList.add('hidden');
      mpAiView?.classList.remove('hidden');
    });
    mpAiBackBtn?.addEventListener('click', () => {
      mpAiView?.classList.add('hidden');
      mpHomeView?.classList.remove('hidden');
    });
    mpAiStartBtn?.addEventListener('click', () => {
      const mapIdx = Number(mpAiMapSelect?.value ?? MP_MAPS[0].scenarioIndex);
      const diff = mpAiDiffSelect?.value || 'normal';
      startAiMatch(mapIdx, diff);
    });

    const updateLobbyUI = (lob) => {
      if (!lob) return;
      const inRoom = lob.status !== 'idle';
      if (inRoom) mpAiView?.classList.add('hidden');
      mpHomeView?.classList.toggle('hidden', inRoom || !mpAiView?.classList.contains('hidden'));
      mpRoomView?.classList.toggle('hidden', !inRoom);
      if (!inRoom) return;

      if (mpRoomCodeDisplay) mpRoomCodeDisplay.textContent = lob.roomCode || '----';
      if (mpHostNameEl) mpHostNameEl.textContent = lob.hostName || 'Tù trưởng Xanh';
      if (mpHostStatusEl) {
        mpHostStatusEl.textContent = lob.hostReady ? '✓ ĐÃ SẴN SÀNG' : 'Chưa sẵn sàng';
        mpHostStatusEl.classList.toggle('ready', Boolean(lob.hostReady));
      }
      if (mpGuestNameEl) mpGuestNameEl.textContent = lob.guestJoined ? lob.guestName || 'Tù trưởng Đỏ' : 'Đang chờ đối thủ...';
      if (mpGuestStatusEl) {
        mpGuestStatusEl.textContent = !lob.guestJoined ? 'Trống' : lob.guestReady ? '✓ ĐÃ SẴN SÀNG' : 'Chưa sẵn sàng';
        mpGuestStatusEl.classList.toggle('ready', Boolean(lob.guestJoined && lob.guestReady));
      }
      if (mpMapSelect) {
        mpMapSelect.value = String(lob.mapIdx ?? 1);
        mpMapSelect.disabled = lob.role !== 'host' || lob.status === 'countdown';
      }
      const myReady = lob.role === 'host' ? lob.hostReady : lob.guestReady;
      if (mpReadyBtn) {
        mpReadyBtn.disabled = !lob.guestJoined && lob.role === 'host';
        mpReadyBtn.classList.toggle('is-ready', Boolean(myReady));
        mpReadyBtn.textContent = myReady ? '✕ HỦY SẴN SÀNG' : '✓ SẴN SÀNG CHIẾN ĐẤU';
      }
      if (mpCountdownEl) {
        if (lob.status === 'countdown' && lob.countdown > 0) {
          mpCountdownEl.classList.remove('hidden');
          mpCountdownEl.textContent = `⚔️ CẢ 2 ĐÃ SẴN SÀNG! BẮT ĐẦU SAU ${lob.countdown}...`;
        } else {
          mpCountdownEl.classList.add('hidden');
        }
      }
      if (mpRoomMsgEl) {
        mpRoomMsgEl.textContent = !lob.guestJoined
          ? `Gửi mã phòng ${lob.roomCode} hoặc bấm "Mở Tab 2" để đối thủ vào phòng (${lob.transport || 'Đang mở kết nối...'}).`
          : `Đã kết nối (${lob.transport || 'P2P'})! Cả 2 hãy bấm Sẵn sàng để bắt đầu trận đấu.`;
      }
    };

    mpClient = new MultiplayerClient({
      onLobbyUpdate(lob) {
        updateLobbyUI(lob);
      },
      onStartMatch(mapIdx, myTribe) {
        startMultiplayerMatch(mapIdx, myTribe);
      },
      onGuestCommand(cmd) {
        executeGuestCommand(cmd);
      },
      onSnapshot(snap) {
        if (!state.data || state.localTribe !== 1) return;
        applyWorldSnapshot(state.data, state, snap, revealFog, getBuildingSpec);
        pullLocalResourcesFromData();
        if (snap.winner !== null && snap.winner !== undefined && !state.missionResult) {
          const guestWon = snap.winner === 1;
          state.missionResult = {
            status: guestWon ? 'victory' : 'defeat',
            reason: guestWon ? 'Bộ lạc Đỏ đã đánh bại Bộ lạc Xanh!' : 'Bộ lạc Xanh đã chiến thắng trận đấu!',
            epilogue: '',
            score: {
              population: state.population,
              buildingsBuilt: 0,
              enemiesKilled: 0,
              enemyBuildingsDestroyed: 0,
              resourcesTotal: state.food + state.wood + state.stone + state.tools,
              totalScore: state.population * 100,
            },
          };
        }
        draw();
      },
      onReturnLobby() {
        state.missionResult = null;
        showMpLobby(true);
      },
      onDisconnect(reason) {
        if (mpRoomMsgEl) mpRoomMsgEl.textContent = reason;
        state.message = reason;
      },
    });

    mpCreateBtn?.addEventListener('click', () => {
      const name = mpNameInput?.value?.trim() || 'Tù trưởng Xanh';
      const mapIdx = Number.parseInt(mpMapSelect?.value || '1', 10) || 1;
      mpClient.createRoom(name, mapIdx);
    });
    mpJoinBtn?.addEventListener('click', () => {
      const code = mpCodeInput?.value?.trim();
      if (!code) {
        if (mpHomeMsgEl) mpHomeMsgEl.textContent = 'Vui lòng nhập mã phòng 4 số từ Chủ phòng!';
        return;
      }
      const name = mpNameInput?.value?.trim() || 'Tù trưởng Đỏ';
      mpClient.joinRoom(code, name);
    });
    mpMapSelect?.addEventListener('change', () => {
      const idx = Number.parseInt(mpMapSelect.value, 10) || 1;
      mpClient.setMap(idx);
    });
    mpReadyBtn?.addEventListener('click', () => {
      const myReady = mpClient.role === 'host' ? mpClient.lobby.hostReady : mpClient.lobby.guestReady;
      mpClient.setReady(!myReady);
    });
    mpCopyBtn?.addEventListener('click', () => {
      const url = `${window.location.origin}${window.location.pathname}?room=${mpClient.roomCode}`;
      navigator.clipboard?.writeText(url).catch(() => {});
      if (mpRoomMsgEl) mpRoomMsgEl.textContent = `📋 Đã copy link mời: ${url}`;
    });
    mpOpenTab2Btn?.addEventListener('click', () => {
      const url = `${window.location.origin}${window.location.pathname}?room=${mpClient.roomCode}&autojoin=1`;
      window.open(url, '_blank');
    });
    mpCodeInput?.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        mpJoinBtn?.click();
      }
    });
    mpLeaveBtn?.addEventListener('click', () => {
      mpClient.leaveRoom();
      state.phase = 'lobby';
      state.paused = true;
      updateLobbyUI({ ...mpClient.lobby, role: null, connected: false });
    });
    openLobbyToolbarBtn?.addEventListener('click', () => {
      const el = document.getElementById('mp-lobby');
      showMpLobby(el?.classList.contains('hidden'));
    });

    // Stay cleanly in 'lobby' phase (no game/HUD/shortcuts active) until both players are Ready!
    state.phase = 'lobby';
    state.paused = true;
    state.data = null;

    const roomParam = params.get('room');
    if (roomParam) {
      if (mpCodeInput) mpCodeInput.value = roomParam;
      if (mpNameInput) mpNameInput.value = 'Tù trưởng Đỏ';
      showMpLobby(true);
      if (params.get('autojoin') === '1') {
        mpClient.joinRoom(roomParam, 'Tù trưởng Đỏ');
      }
    } else if (requested === 'game' || requested === 'strategy') {
      state.mpMode = false;
      state.paused = false;
      showMpLobby(false);
      loadScenario(startScenario, { showStory: wantStory });
    } else {
      showMpLobby(true);
    }
  })
  .catch((err) => {
    panelCopy.textContent = `Không tải được dữ liệu bản đồ: ${err.message}`;
  });
