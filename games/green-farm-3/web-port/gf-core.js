/**
 * Source-driven Green Farm 3 game state & /9-/10 farm simulation engine.
 * All crop/animal/quest definitions, unlock levels, costs, and Vietnamese text
 * are decoded directly from original /9, /10, and EN.* packs.
 */
export const SCREEN_W = 240;
export const SCREEN_H = 320;

// Port of f.java:107-127 and f.java:319-333 (MIDP keypad bindings).
export const KEY = Object.freeze({
  UP: -1, DOWN: -2, LEFT: -3, RIGHT: -4,
  FIRE: -5, SK_LEFT: -6, SK_RIGHT: -7,
});

export function mapKeyCode(code, key) {
  switch (code) {
    case 'ArrowUp': case 'KeyW': return KEY.UP;
    case 'ArrowDown': case 'KeyS': return KEY.DOWN;
    case 'ArrowLeft': case 'KeyA': return KEY.LEFT;
    case 'ArrowRight': case 'KeyD': return KEY.RIGHT;
    case 'Enter': case 'Space': return KEY.FIRE;
    case 'KeyQ': return KEY.SK_LEFT;
    case 'KeyE': case 'Escape': case 'Backspace': return KEY.SK_RIGHT;
    default:
      if (/^Digit[0-9]$/.test(code || '')) return Number(code.slice(5));
      if (key === '5') return 5;
      return null;
  }
}

export const SOURCE_VIEW = Object.freeze({
  OPENING_SCRIPT: 'opening-script-evidence',
  WORLD_LAYER: 'world-layer-evidence',
  SHOP: 'farm-shop',
  BARN: 'farm-barn',
  QUESTS: 'farm-quests',
  SEED_PICKER: 'farm-seed-picker',
  KITCHEN: 'farm-kitchen',
  MANOR: 'farm-manor',
  COOP: 'farm-coop',
  MAILBOX: 'farm-mailbox',
  COLLECTIONS: 'farm-collections',
  LAND: 'farm-land',
  NEIGHBORS: 'farm-neighbors',
});

export const LAND_ZONES = Object.freeze([
  { id: 'center', name: 'Khu Trung Tâm (Mặc định)', minX: 820, maxX: 1320, minY: 320, maxY: 640, cost: 0, unlockLevel: 1 },
  { id: 'west', name: 'Đồng Cỏ Phía Tây', minX: 520, maxX: 840, minY: 320, maxY: 660, cost: 250, unlockLevel: 1 },
  { id: 'south', name: 'Bãi Chăn Nuôi Phía Nam', minX: 820, maxX: 1360, minY: 620, maxY: 880, cost: 400, unlockLevel: 2 },
  { id: 'east', name: 'Vườn Cây Ăn Quả Phía Đông', minX: 1300, maxX: 1700, minY: 320, maxY: 680, cost: 650, unlockLevel: 3 },
  { id: 'far_west', name: 'Thung Lũng Tây Nam', minX: 240, maxX: 840, minY: 640, maxY: 960, cost: 1000, unlockLevel: 5 },
  { id: 'far_east', name: 'Đồi Nắng Đông Nam', minX: 1340, maxX: 1960, minY: 640, maxY: 980, cost: 1500, unlockLevel: 7 },
]);

// Port of f.paint(Graphics): elapsed time is clamped to [0,1000] ms.
export function sourceFrame(previousAt, now) {
  const elapsedMs = Math.max(0, Math.min(1000, (now - previousAt) | 0));
  return { now, elapsedMs };
}

// Port of a.java:17322-17548, 17555-17589 (/10 block 15 opening script opcode 110).
export function newEvidenceSession(worldResources) {
  const group = worldResources?.openingScript?.scripts?.[0]?.groups
    ?.find((item) => item.groupType === 0 && item.context === 0);
  const dialogue = group?.records.flatMap((record) => record.commands
    .filter((command) => command.opcode === 110)
    .map((command) => ({ eventKey: record.eventKey, textId: command.args[0] }))) ?? [];
  return {
    view: SOURCE_VIEW.OPENING_SCRIPT,
    dialogue,
    dialogueIndex: 0,
    selectedTile: null,
    frame: 0,
    lastFrameAt: null,
  };
}

// Port of a.java:16078-16088.
export function sourceTileAt(tileMap, screenX, screenY, cameraX = 0, cameraY = 0) {
  if (!tileMap || !Number.isFinite(screenX) || !Number.isFinite(screenY)) return null;
  const column = Math.floor((screenX + cameraX) / tileMap.tileWidth);
  const row = Math.floor((screenY + cameraY) / tileMap.tileHeight);
  if (column < 0 || column >= tileMap.width || row < 0 || row >= tileMap.height) return null;
  const index = row * tileMap.width + column;
  return {
    row,
    column,
    tileId: tileMap.tileIds[index],
    attributes: tileMap.attributes[index],
    sourceCellIndex: index,
  };
}

export function advanceEvidenceView(session, key) {
  if (!session) return session;
  if (session.view === SOURCE_VIEW.OPENING_SCRIPT) {
    if (key !== KEY.FIRE && key !== 5 && key !== KEY.SK_RIGHT) return session;
    if (session.dialogueIndex + 1 < session.dialogue.length) {
      return { ...session, dialogueIndex: session.dialogueIndex + 1 };
    }
    return { ...session, view: SOURCE_VIEW.WORLD_LAYER };
  }
  return session;
}

// Port of f.java:1085-1098 (group = id >> 10, index = id & 0x3ff).
export function sourceText(textData, globalTextId) {
  if (!textData || !Number.isInteger(globalTextId) || globalTextId < 0) return '';
  const page = globalTextId >>> 10;
  const index = globalTextId & 0x3ff;
  return textData[`page_${page}`]?.[String(index)] ?? '';
}

// Port of a.java:16117-16131: exact Green Farm 3 isometric 18x9 diamond lattice around (1044, 108).
export function worldToIso(wx, wy) {
  const n = Math.trunc(((wx - 1044) << 8) / 18);
  const n2 = Math.trunc(((wy - 108) << 8) / 9);
  return { ix: (n + n2) >> 8, iy: (n2 - n) >> 8 };
}

export function isoToWorld(ix, iy) {
  const n = ((ix - iy) << 8) >> 1;
  const n2 = (iy << 8) + n;
  return {
    wx: ((n * 18) >> 8) + 1044,
    wy: ((n2 * 9) >> 8) + 108,
  };
}

export function snapPlotToIso4x4(wx, wy) {
  const iso = worldToIso(wx, wy);
  const ix4 = Math.round(iso.ix / 4) * 4;
  const iy4 = Math.round(iso.iy / 4) * 4;
  return isoToWorld(ix4, iy4);
}

// Port of e.java:1117-1130 + horizontal/vertical fix so pure Left/Right never turns Farmer's back.
export function pickFarmerWalkAnim(dx, dy) {
  if (Math.abs(dy) < 0.001) {
    return dx >= 0 ? { anim: 0, hFlip: true } : { anim: 0, hFlip: false };
  }
  if (Math.abs(dx) < 0.001) {
    return dy > 0 ? { anim: 0, hFlip: false } : { anim: 1, hFlip: false };
  }
  if (dx > 0) {
    return dy > 0 ? { anim: 0, hFlip: true } : { anim: 1, hFlip: false };
  }
  return dy > 0 ? { anim: 0, hFlip: false } : { anim: 1, hFlip: true };
}

// Port of a.java:16133-16150: prevent Farmer from walking into Pond (1044,603), Manor core (1215,382), or water/void
export function isWalkBlocked(wx, wy, tileMap = null) {
  if (wx < 48 || wx > 2040 || wy < 306 || wy > 1012) return true;
  if (Math.hypot(wx - 1044, wy - 603) < 34) return true; // Pond (cat 50 entityId=17)
  if (Math.hypot(wx - 1215, wy - 384) < 38) return true; // Manor core
  if (tileMap) {
    const col = Math.floor(wx / (tileMap.tileWidth || 36));
    const row = Math.floor(wy / (tileMap.tileHeight || 18));
    if (col < 0 || col >= tileMap.width || row < 16 || row >= tileMap.height) return true;
    const tid = tileMap.tileIds[row * tileMap.width + col];
    if (tid === 0xff) return true;
  }
  return false;
}

export function addPopup(session, wx, wy, text, color = '#ffd84d') {
  if (!session.popups) session.popups = [];
  session.popups.push({ x: wx, y: wy, text, color, lifeMs: 1100, maxLifeMs: 1100 });
}

export function clampWorldCamera(session, tileMap) {
  const tw = tileMap?.tileWidth || 36;
  const th = tileMap?.tileHeight || 18;
  const mapW = (tileMap?.width || 58) * tw;
  const mapH = (tileMap?.height || 58) * th;
  const zoom = session.worldZoom || 1;
  const viewW = SCREEN_W / zoom;
  const viewH = SCREEN_H / zoom;
  session.cameraX = Math.max(0, Math.min(Math.max(0, mapW - viewW), Math.round(session.cameraX)));
  session.cameraY = Math.max(288, Math.min(Math.max(288, mapH - viewH), Math.round(session.cameraY)));
}

export function setFarmerWalkTarget(session, wx, wy, pendingAction = null) {
  const f = session.farmer;
  if (!f) return;
  const clampedX = Math.max(36, Math.min(2052, Math.round(wx)));
  const clampedY = Math.max(306, Math.min(1026, Math.round(wy)));
  f.targetX = clampedX;
  f.targetY = clampedY;
  f.pendingAction = pendingAction;
  const dx = clampedX - f.x;
  const dy = clampedY - f.y;
  if (Math.hypot(dx, dy) <= 4) {
    f.x = clampedX;
    f.y = clampedY;
    if (pendingAction) executePendingFarmerAction(session);
    else {
      f.state = 'idle';
      f.anim = 2;
    }
    return;
  }
  const dir = pickFarmerWalkAnim(dx, dy);
  f.anim = dir.anim;
  f.hFlip = dir.hFlip;
  f.state = 'walk';
}

export function moveFarmerByVector(session, vx, vy, dtMs, tileMap = null) {
  const f = session.farmer;
  if (!f) return false;
  if (vx === 0 && vy === 0) {
    if (f.state === 'walk' && f.directControl) {
      f.directControl = false;
      f.state = 'idle';
      f.anim = 2;
      f.targetX = f.x;
      f.targetY = f.y;
    }
    return false;
  }
  const len = Math.hypot(vx, vy) || 1;
  const step = (f.speed * dtMs) / 1000;
  const dx = (vx / len) * step;
  const dy = (vy / len) * step;
  const nextX = Math.max(48, Math.min(2040, f.x + dx));
  const nextY = Math.max(306, Math.min(1012, f.y + dy));
  if (!isWalkBlocked(nextX, nextY, tileMap)) {
    f.x = nextX;
    f.y = nextY;
  } else if (!isWalkBlocked(nextX, f.y, tileMap)) {
    f.x = nextX;
  } else if (!isWalkBlocked(f.x, nextY, tileMap)) {
    f.y = nextY;
  }
  f.targetX = f.x;
  f.targetY = f.y;
  f.pendingAction = null;
  f.directControl = true;
  const dir = pickFarmerWalkAnim(vx, vy);
  f.anim = dir.anim;
  f.hFlip = dir.hFlip;
  f.state = 'walk';
  const tw = tileMap?.tileWidth || 36;
  const th = tileMap?.tileHeight || 18;
  session.cursorCol = Math.max(0, Math.min((tileMap?.width || 58) - 1, Math.floor(f.x / tw)));
  session.cursorRow = Math.max(16, Math.min((tileMap?.height || 58) - 1, Math.floor(f.y / th)));
  // Port of a.java:1725-1728: camera smoothly tracks Farmer
  const zoom = session.worldZoom || 1;
  const viewW = SCREEN_W / zoom;
  const viewH = SCREEN_H / zoom;
  session.cameraX = f.x - viewW / 2;
  session.cameraY = f.y - viewH / 2;
  clampWorldCamera(session, tileMap);
  return true;
}

function executePendingFarmerAction(session) {
  const f = session.farmer;
  const act = f?.pendingAction;
  if (!f || !act) return;
  f.pendingAction = null;
  let actionAnim = 3;
  if (act.type === 'tile') {
    const plotBefore = session.plots.get(`${act.row},${act.col}`);
    if (plotBefore && plotBefore.stage === 'tilled' && act.openSeedPicker) {
      // Port of a.java:3804-3936: open the on-world bottom Seed Carousel (/6[1] widgets 73..83)
      // right over the live farm world instead of leaving for a modal list!
      const fieldCrops = (session.catalog?.crops || []).filter(c => c.id !== 3000 && !c.isTree);
      const curIdx = Math.max(0, fieldCrops.findIndex(c => c.id === session.selectedCropId));
      session.seedCarousel = {
        row: act.row,
        col: act.col,
        worldX: act.worldX,
        worldY: act.worldY,
        index: curIdx,
      };
      f.state = 'idle';
      f.anim = 2;
      return;
    }
    if (!plotBefore || plotBefore.stage === 'tilled') actionAnim = 4;
    else if (plotBefore.stage === 'growing') actionAnim = 6;
    else actionAnim = 3;
    const res = interactAtFarmTile(session, act.row, act.col, act.worldX, act.worldY);
    if (res?.ok) {
      addPopup(session, f.x, f.y - 24, res.popup || '✓', res.popupColor || '#9cff7b');
    }
  } else if (act.type === 'plant_seed') {
    actionAnim = 4;
    const res = plantCropOnPlot(session, act.row, act.col, act.cropId);
    if (res?.ok) {
      advanceQuests(session, 'plant', 1);
      addPopup(session, f.x, f.y - 24, `🌱 ${res.crop?.name || ''}`, '#9cff7b');
    }
  } else if (act.type === 'building') {
    f.state = 'idle';
    f.anim = 2;
    openBuildingMenu(session, act.entityId);
    return;
  } else if (act.type === 'debris') {
    actionAnim = 4;
    clearDebris(session, act.opaqueKey, act.worldX, act.worldY);
  } else if (act.type === 'place') {
    actionAnim = 4;
    const item = act.item;
    if (item?.kind === 'tree') plantFruitTree(session, item.spec.id, act.worldX, act.worldY);
    else if (item?.kind === 'animal') {
      buyAnimal(session, item.spec.id, act.row, act.col);
      const last = session.animals[session.animals.length - 1];
      if (last) { last.worldX = act.worldX; last.worldY = act.worldY; }
    } else if (item?.kind === 'decor') {
      placeDecoration(session, item.spec.id, act.worldX, act.worldY);
    }
    session.activeTool = 'auto';
    session.placementItem = null;
  } else if (act.type === 'tree') {
    actionAnim = 3;
    const res = harvestFruitTree(session, act.uid);
    if (res?.ok) {
      addPopup(session, f.x, f.y - 24, `🍎 ${res.name}`, '#ffd84d');
    }
  } else if (act.type === 'neighbor_help') {
    actionAnim = 3;
    const res = helpNeighborEntity(session, act.opaqueKey, act.worldX, act.worldY);
    if (res?.ok) {
      addPopup(session, f.x, f.y - 24, '+20 Xu +8 XP', '#9cff7b');
    }
  } else if (act.type === 'animal') {
    actionAnim = 3;
    const res = collectOrFeedAnimal(session, act.uid);
    if (res?.ok) {
      addPopup(session, f.x, f.y - 24, res.action === 'collected' ? `🥚 ${res.prodName || '+XP'}` : '🌿 Đã cho ăn', '#ffd84d');
    }
  }
  f.state = 'action';
  f.anim = actionAnim;
  f.actionMs = 460;
}

export function harvestFruitTree(session, uid) {
  const tree = session.fruitTrees?.find(t => t.uid === uid);
  if (!tree || !tree.ready) return { ok: false };
  const crop = session.catalog?.crops?.find(c => c.id === tree.cropId);
  const name = crop?.name || 'Trái cây';
  const sellPrice = crop?.sellPrice ?? 35;
  const xp = crop?.xp ?? 5;
  const existing = session.inventory.get(tree.cropId) || { id: tree.cropId, name, qty: 0, sellPrice };
  existing.qty += 1;
  session.inventory.set(tree.cropId, existing);
  tree.ready = false;
  tree.progressMs = 0;
  awardFarmXp(session, xp);
  advanceQuests(session, 'harvest', 1);
  session.toast = `🍎 Thu hoạch ${name} (+${xp} XP)`;
  session.toastMs = 2000;
  return { ok: true, name };
}

// Port of a.java:18088-18129, a.java:1725-1728, a.java:1881-1991 & e.java:2732-3046:
// create full playable farm state directly from decoded /9 & /10 starting farm world.
export function createFarmSession(worldResources, textData = {}) {
  const base = newEvidenceSession(worldResources);
  const catalog = worldResources?.catalog || { crops: [], goods: [], animals: [], quests: [], levelXp: [60, 120, 200] };
  const tm = worldResources?.tileMap;
  const tw = tm?.tileWidth || 36;
  const th = tm?.tileHeight || 18;
  const wheat = catalog.crops.find(c => c.id === 3004) || catalog.crops[1] || catalog.crops[0];
  const tomato = catalog.crops.find(c => c.id === 3001) || catalog.crops[1] || wheat;

  const farmEntities = worldResources?.farmEntities || [];
  const rawPlots = farmEntities.filter(e => e.category === 49);
  const rawAnimals = farmEntities.filter(e => e.category === 54);
  const rawTrees = farmEntities.filter(e => e.category === 52);
  const farmerEnt = farmEntities.find(e => e.category === 42 && e.entityId === -1);

  const plots = new Map();
  let firstReadyPlot = null;
  if (rawPlots.length > 0) {
    for (const rp of rawPlots) {
      const col = Math.floor(rp.x / tw);
      const row = Math.floor(rp.y / th);
      const crop = rp.cropId ? (catalog.crops.find(c => c.id === rp.cropId) || wheat) : null;
      const plotObj = {
        row,
        col,
        worldX: rp.x,
        worldY: rp.y,
        cropId: crop?.id ?? null,
        cropName: crop?.name ?? '',
        stage: crop ? 'ready' : 'tilled',
        watered: false,
        progressMs: crop ? (crop.growSec || 9) * 1000 : 0,
        growMs: (crop?.growSec || 10) * 1000,
      };
      plots.set(`${row},${col}`, plotObj);
      if (plotObj.stage === 'ready' && !firstReadyPlot) firstReadyPlot = plotObj;
    }
  } else {
    const seedPlots = [
      { row: 24, col: 28, crop: wheat, stage: 'ready', progressMs: (wheat?.growSec || 9) * 1000 },
      { row: 24, col: 29, crop: wheat, stage: 'ready', progressMs: (wheat?.growSec || 9) * 1000 },
      { row: 25, col: 28, crop: tomato, stage: 'growing', progressMs: Math.floor(((tomato?.growSec || 15) * 1000) / 2) },
      { row: 25, col: 29, crop: null, stage: 'tilled', progressMs: 0 },
    ];
    for (const sp of seedPlots) {
      const plotObj = {
        row: sp.row,
        col: sp.col,
        worldX: sp.col * tw + (tw >> 1),
        worldY: sp.row * th + (th >> 1),
        cropId: sp.crop?.id ?? null,
        cropName: sp.crop?.name ?? '',
        stage: sp.stage,
        watered: sp.stage === 'growing',
        progressMs: sp.progressMs,
        growMs: (sp.crop?.growSec || 10) * 1000,
      };
      plots.set(`${sp.row},${sp.col}`, plotObj);
      if (plotObj.stage === 'ready' && !firstReadyPlot) firstReadyPlot = plotObj;
    }
  }

  let nextAnimalUid = 1;
  const farmAnimals = [];
  if (rawAnimals.length > 0) {
    for (const ra of rawAnimals) {
      const spec = catalog.animals.find(a => a.id === ra.animalId) || catalog.animals[0];
      farmAnimals.push({
        uid: nextAnimalUid++,
        animalId: ra.animalId || spec?.id || 2004,
        name: spec?.name || 'Vật nuôi',
        row: Math.floor(ra.y / th),
        col: Math.floor(ra.x / tw),
        worldX: ra.x,
        worldY: ra.y,
        worldBlock: ra.block,
        paletteIndex: ra.paletteIndex || 0,
        idleFrame: ra.frame || 0,
        fed: true,
        ready: false,
        progressMs: 0,
        prodMs: (spec?.prodSec || 15) * 1000,
        sellPrice: spec?.sellPrice || 36,
        xp: spec?.xp || 5,
      });
    }
  } else {
    const starterAnimal = catalog.animals[0] || { id: 2004, name: 'Gà con Delaware', buyPrice: 200, prodSec: 15, sellPrice: 36, xp: 5, worldBlock: 8, paletteIndex: 0, idleFrame: 24 };
    farmAnimals.push({
      uid: nextAnimalUid++,
      animalId: starterAnimal.id,
      name: starterAnimal.name,
      row: 26,
      col: 29,
      worldX: 29 * tw + (tw >> 1),
      worldY: 26 * th + (th >> 1),
      worldBlock: starterAnimal.worldBlock ?? 8,
      paletteIndex: starterAnimal.paletteIndex ?? 0,
      idleFrame: starterAnimal.idleFrame ?? 0,
      fed: true,
      ready: false,
      progressMs: 0,
      prodMs: (starterAnimal.prodSec || 15) * 1000,
      sellPrice: starterAnimal.sellPrice,
      xp: starterAnimal.xp,
    });
  }

  const quests = (catalog.quests || []).slice(0, 12).map((q, i) => ({
    ...q,
    progress: 0,
    completed: false,
    claimed: false,
    trackKind: ['harvest', 'sell', 'cook', 'plant', 'clear', 'help'][i % 6],
  }));

  const neighborMail = (catalog.neighbors || []).slice(0, 5).map((nb, idx) => ({
    id: `mail-${nb.id}`,
    from: nb.name,
    subject: idx === 0
      ? 'Chào mừng cháu tiếp quản trang trại! Nhận quà khởi nghiệp nhé!'
      : `Đơn đặt hàng của ${nb.name}: giao 2 nông sản nhận thưởng!`,
    giftCoins: idx === 0 ? 100 : (80 + idx * 45),
    giftXp: 15 + idx * 8,
    claimed: false,
    kind: idx === 0 ? 'gift' : 'order',
    needQty: idx === 0 ? 0 : 2,
  }));

  const fruitTrees = rawTrees.map((rt, idx) => {
    const spec = catalog.crops.find(c => c.worldBlock === rt.block) || catalog.crops[12] || wheat;
    return {
      uid: idx + 1,
      cropId: spec?.id || 3012,
      name: spec?.name || 'Cây ăn quả',
      worldX: rt.x,
      worldY: rt.y,
      worldBlock: rt.block,
      ready: true,
      progressMs: (spec?.growSec || 18) * 1000,
      growMs: (spec?.growSec || 18) * 1000,
    };
  });

  // Port of a.java:1725-1728 & e.java:2897-2910: live controllable Farmer (speed ak = 150 px/s)
  const startFarmerX = farmerEnt ? farmerEnt.x : (firstReadyPlot ? firstReadyPlot.worldX + 24 : 1089);
  const startFarmerY = farmerEnt ? farmerEnt.y : (firstReadyPlot ? firstReadyPlot.worldY + 6 : 428);
  const farmerState = {
    x: startFarmerX,
    y: startFarmerY,
    targetX: startFarmerX,
    targetY: startFarmerY,
    speed: 150,
    state: 'idle',
    anim: 2,
    hFlip: false,
    actionMs: 0,
    directControl: false,
    pendingAction: null,
  };

  const mapW = (tm?.width || 58) * tw;
  const mapH = (tm?.height || 58) * th;
  const viewH = SCREEN_H - 54;
  const cameraX = Math.max(0, Math.min(mapW - SCREEN_W, Math.round(startFarmerX - SCREEN_W / 2)));
  const cameraY = Math.max(288, Math.min(mapH - viewH, Math.round(startFarmerY - viewH / 2)));

  return {
    ...base,
    view: base.dialogue.length > 0 ? SOURCE_VIEW.OPENING_SCRIPT : SOURCE_VIEW.WORLD_LAYER,
    coins: 350,
    cash: 15,
    xp: 0,
    level: 1,
    energy: 30,
    maxEnergy: 30,
    energyRegenMs: 0,
    animTimeMs: 0,
    worldZoom: 1.0, // Exact 1:1 integer pixel rendering (zero tile seams); user can toggle 75% <-> 100%
    visitingNeighbor: null, // null = own farm (N=0), or { index, id, name, entities, helpedKeys, helpsToday, maxHelps }
    homeFarmerPos: null,
    barnCapacity: 40,
    siloLevel: 1,
    coopCapacity: 6,
    shedCapacity: 6,
    cameraX,
    cameraY,
    cursorRow: firstReadyPlot ? firstReadyPlot.row : 24,
    cursorCol: firstReadyPlot ? firstReadyPlot.col : 28,
    selectedCropId: wheat?.id ?? 3004,
    activeTool: 'auto', // 'auto' | 'plow' | 'clear' | 'place'
    placementItem: null, // { kind: 'tree'|'animal'|'decor', spec }
    seedPickerTarget: null,
    seedCarousel: null, // Port of a.java:3804-3936: { row, col, worldX, worldY, index } on-world bottom carousel!
    shopTab: 'crops', // 'crops' | 'trees' | 'animals' | 'buildings' | 'decor'
    shopCursor: 0,
    panelCursor: 0,
    coopFilter: 'chicken',
    questCursor: 0,
    barnCursor: 0,
    farmer: farmerState,
    fruitTrees,
    placedDecor: [],
    clearedDebris: [],
    unlockedZones: ['center'],
    unlockedRooms: { 2: true }, // Nhà bếp sẵn sàng nấu ăn; 8 phòng Dinh thự còn lại sửa chữa dần
    kitchenQueue: [],
    nextCookUid: 1,
    nextTreeUid: fruitTrees.length + 1,
    nextDecorUid: 1,
    collections: {},
    neighborMail,
    helpedNeighbors: {},
    popups: [],
    plots,
    animals: farmAnimals,
    nextAnimalUid,
    inventory: new Map(),
    quests,
    toast: sourceText(textData, 4) || 'Chạm đất, Kho thóc, Nhà bếp, Chuồng trại hoặc mở Chợ 5 mục!',
    toastMs: 3500,
    catalog,
  };
}

export function xpForNextLevel(session) {
  const table = session.catalog?.levelXp || [];
  return table[Math.min(table.length - 1, Math.max(0, (session.level || 1) - 1))] || (session.level * 50);
}

export function awardFarmXp(session, amount) {
  if (!amount || amount <= 0) return false;
  session.xp += amount;
  let leveled = false;
  while (session.xp >= xpForNextLevel(session)) {
    session.xp -= xpForNextLevel(session);
    session.level += 1;
    session.maxEnergy += 2;
    session.energy = session.maxEnergy;
    session.coins += 50;
    leveled = true;
    session.toast = `🎉 Lên Cấp ${session.level}! (+50 Xu & đầy Năng lượng)`;
    session.toastMs = 3000;
  }
  return leveled;
}

export function stepFarmSession(session, dtMs, tileMap = null) {
  if (!session || session.view === SOURCE_VIEW.OPENING_SCRIPT) return false;
  let changed = false;
  session.animTimeMs = (session.animTimeMs || 0) + dtMs;
  if (session.toastMs > 0) {
    session.toastMs = Math.max(0, session.toastMs - dtMs);
    if (session.toastMs === 0) session.toast = '';
  }

  // Port of e.java:132-160 & e.java:3106-3122 (N()): Farmer autonomous walk to target & action completion
  const f = session.farmer;
  if (f) {
    if (f.state === 'action') {
      f.actionMs -= dtMs;
      if (f.actionMs <= 0) {
        f.actionMs = 0;
        f.state = 'idle';
        f.anim = 2;
      }
      changed = true;
    } else if (f.state === 'walk' && !f.directControl) {
      const dx = f.targetX - f.x;
      const dy = f.targetY - f.y;
      const dist = Math.hypot(dx, dy);
      const step = (f.speed * dtMs) / 1000;
      if (dist <= step || dist <= 2) {
        f.x = f.targetX;
        f.y = f.targetY;
        if (f.pendingAction) {
          executePendingFarmerAction(session);
        } else {
          f.state = 'idle';
          f.anim = 2;
        }
      } else {
        f.x += (dx / dist) * step;
        f.y += (dy / dist) * step;
        const dir = pickFarmerWalkAnim(dx, dy);
        f.anim = dir.anim;
        f.hFlip = dir.hFlip;
      }
      // Smoothly follow Farmer while walking
      if (tileMap) {
        const viewH = SCREEN_H - 54;
        session.cameraX += (f.x - SCREEN_W / 2 - session.cameraX) * 0.25;
        session.cameraY += (f.y - viewH / 2 - session.cameraY) * 0.25;
        clampWorldCamera(session, tileMap);
      }
      changed = true;
    }
  }

  // Step floating popups
  if (session.popups?.length) {
    for (let i = session.popups.length - 1; i >= 0; i -= 1) {
      const p = session.popups[i];
      p.lifeMs -= dtMs;
      p.y -= (dtMs * 18) / 1000;
      if (p.lifeMs <= 0) session.popups.splice(i, 1);
    }
    changed = true;
  }

  for (const plot of session.plots.values()) {
    if (plot.stage === 'growing') {
      const rate = plot.watered ? 1.6 : 1.0;
      plot.progressMs += dtMs * rate;
      if (plot.progressMs >= plot.growMs) {
        plot.progressMs = plot.growMs;
        plot.stage = 'ready';
        changed = true;
      }
    }
  }
  for (const tree of session.fruitTrees || []) {
    if (!tree.ready) {
      tree.progressMs += dtMs;
      if (tree.progressMs >= tree.growMs) {
        tree.progressMs = tree.growMs;
        tree.ready = true;
        changed = true;
      }
    }
  }
  for (const animal of session.animals) {
    if (animal.fed && !animal.ready) {
      animal.progressMs += dtMs;
      if (animal.progressMs >= animal.prodMs) {
        animal.progressMs = animal.prodMs;
        animal.ready = true;
        changed = true;
      }
    }
    // Port of e.java:2330-2365: gentle pasture roaming around home coordinates
    if (animal.worldX != null && animal.worldY != null) {
      if (animal.homeX == null) { animal.homeX = animal.worldX; animal.homeY = animal.worldY; animal.roamWaitMs = 1500 + (animal.uid * 733) % 2500; }
      if (animal.roamWaitMs > 0) {
        animal.roamWaitMs -= dtMs;
        animal.walking = false;
        if (animal.roamWaitMs <= 0) {
          const angle = ((session.animTimeMs + animal.uid * 137) % 360) * (Math.PI / 180);
          const dist = 16 + ((animal.uid * 19 + Math.floor(session.animTimeMs / 100)) % 22);
          animal.targetX = Math.max(80, Math.min(1980, animal.homeX + Math.cos(angle) * dist));
          animal.targetY = Math.max(330, Math.min(980, animal.homeY + Math.sin(angle) * (dist * 0.5)));
          animal.walking = true;
        }
      } else if (animal.walking && animal.targetX != null) {
        const dx = animal.targetX - animal.worldX;
        const dy = animal.targetY - animal.worldY;
        const d = Math.hypot(dx, dy);
        const step = (24 * dtMs) / 1000;
        if (d <= step || d <= 2) {
          animal.worldX = animal.targetX;
          animal.worldY = animal.targetY;
          animal.walking = false;
          animal.roamWaitMs = 2200 + ((animal.uid * 571 + session.animTimeMs) % 2600);
        } else {
          animal.worldX += (dx / d) * step;
          animal.worldY += (dy / d) * step;
          animal.hFlip = dx > 0;
        }
        changed = true;
      }
    }
  }
  // Tick Kitchen cooking queue (table9[7])
  for (const job of session.kitchenQueue || []) {
    if (!job.ready) {
      job.progressMs += dtMs;
      if (job.progressMs >= job.cookMs) {
        job.progressMs = job.cookMs;
        job.ready = true;
        session.toast = `🍳 Món ${job.name} đã nấu xong trong Nhà bếp!`;
        session.toastMs = 2600;
        changed = true;
      }
    }
  }
  // Energy regeneration (+1 every 20s)
  if (session.energy < session.maxEnergy) {
    session.energyRegenMs = (session.energyRegenMs || 0) + dtMs;
    if (session.energyRegenMs >= 20000) {
      session.energyRegenMs -= 20000;
      session.energy = Math.min(session.maxEnergy, session.energy + 1);
      changed = true;
    }
  }
  return changed;
}

function advanceQuests(session, kind, delta = 1) {
  for (const q of session.quests || []) {
    if (q.completed) continue;
    if (q.trackKind === kind) {
      q.progress = Math.min(q.targetCount, q.progress + delta);
      if (q.progress >= q.targetCount) {
        q.completed = true;
        session.toast = `✅ Hoàn thành nhiệm vụ: ${q.title}!`;
        session.toastMs = 2800;
      }
    }
  }
}

export function plowPlot(session, row, col, worldX = null, worldY = null) {
  const key = `${row},${col}`;
  if (session.plots.has(key)) return { ok: false, reason: 'occupied' };
  const plotCost = session.catalog?.crops?.find(c => c.id === 3000)?.buyPrice ?? 10;
  if (session.coins < plotCost) {
    session.toast = `Cần ${plotCost} Xu để cày ô đất mới!`;
    session.toastMs = 2000;
    return { ok: false, reason: 'no_coins' };
  }
  let wx = worldX ?? (col * 36 + 18);
  let wy = worldY ?? (row * 18 + 9);
  if (worldX != null && worldY != null) {
    const snapped = snapPlotToIso4x4(worldX, worldY);
    wx = snapped.wx;
    wy = snapped.wy;
    // Prevent overlapping an existing 4x4 (72x36) soil plot!
    for (const p of session.plots.values()) {
      if (Math.hypot((p.worldX ?? p.col * 36 + 18) - wx, (p.worldY ?? p.row * 18 + 9) - wy) < 34) {
        session.toast = 'Ô đất đã có sẵn ở đây!';
        session.toastMs = 1600;
        return { ok: false, reason: 'overlap' };
      }
    }
  }
  session.coins -= plotCost;
  session.plots.set(key, {
    row,
    col,
    worldX: wx,
    worldY: wy,
    cropId: null,
    cropName: '',
    stage: 'tilled',
    watered: false,
    progressMs: 0,
    growMs: 0,
  });
  awardFarmXp(session, 2);
  session.toast = `Đã cày ô đất mới (-${plotCost} Xu)`;
  session.toastMs = 1800;
  return { ok: true, popup: `-${plotCost} Xu`, popupColor: '#ffd84d' };
}

export function plantCropOnPlot(session, row, col, cropId = session.selectedCropId) {
  const plot = session.plots.get(`${row},${col}`);
  if (!plot || plot.stage !== 'tilled') return { ok: false, reason: 'not_tilled' };
  const crop = session.catalog?.crops?.find(c => c.id === cropId && c.id !== 3000) || session.catalog?.crops?.[1];
  if (!crop) return { ok: false, reason: 'no_crop' };
  if (session.level < crop.unlockLevel) {
    session.toast = `${crop.name} mở khóa ở Cấp ${crop.unlockLevel}!`;
    session.toastMs = 2200;
    return { ok: false, reason: 'locked' };
  }
  if (session.coins < crop.buyPrice) {
    session.toast = `Không đủ ${crop.buyPrice} Xu mua giống ${crop.name}!`;
    session.toastMs = 2200;
    return { ok: false, reason: 'no_coins' };
  }
  session.coins -= crop.buyPrice;
  plot.cropId = crop.id;
  plot.cropName = crop.name;
  plot.stage = 'growing';
  plot.watered = false;
  plot.progressMs = 0;
  plot.growMs = crop.growSec * 1000;
  session.toast = `🌱 Đã trồng ${crop.name} (-${crop.buyPrice} Xu)`;
  session.toastMs = 1800;
  return { ok: true, crop };
}

export function waterPlot(session, row, col) {
  const plot = session.plots.get(`${row},${col}`);
  if (!plot || plot.stage !== 'growing' || plot.watered) return { ok: false };
  plot.watered = true;
  awardFarmXp(session, 1);
  session.toast = `💧 Đã tưới ${plot.cropName} (lớn nhanh 1.6×)`;
  session.toastMs = 1600;
  return { ok: true };
}

export function harvestPlot(session, row, col) {
  const plot = session.plots.get(`${row},${col}`);
  if (!plot || plot.stage !== 'ready') return { ok: false };
  const crop = session.catalog?.crops?.find(c => c.id === plot.cropId);
  const itemId = crop?.harvestGoodId ?? plot.cropId;
  const itemName = plot.cropName || crop?.name || 'Nông sản';
  const sellPrice = crop?.sellPrice ?? 20;
  const xp = crop?.xp ?? 3;

  const existing = session.inventory.get(itemId) || { id: itemId, name: itemName, qty: 0, sellPrice };
  existing.qty += 1;
  session.inventory.set(itemId, existing);

  plot.cropId = null;
  plot.cropName = '';
  plot.stage = 'tilled';
  plot.watered = false;
  plot.progressMs = 0;
  plot.growMs = 0;

  awardFarmXp(session, xp);
  advanceQuests(session, 'harvest', 1);
  // 15% chance to discover a rare collectible (table9[16]) for Phòng sưu tập!
  const coll = session.catalog?.collectibles || [];
  if (coll.length > 0 && ((session.xp + row + col) % 7 === 0)) {
    const found = coll[(session.xp + row) % Math.min(coll.length, Math.max(3, session.level + 2))];
    session.collections[found.id] = (session.collections[found.id] || 0) + 1;
    session.toast = `🌾 Thu ${itemName} (+${xp} XP) & nhặt được cổ vật ${found.name}!`;
  } else {
    session.toast = `🌾 Thu hoạch ${itemName} (+${xp} XP)`;
  }
  session.toastMs = 2200;
  return { ok: true, itemId, itemName, popup: `🌾 +${xp} XP`, popupColor: '#ffd84d' };
}

export function buyAnimal(session, animalId, row, col) {
  const spec = session.catalog?.animals?.find(a => a.id === animalId) || session.catalog?.animals?.[0];
  if (!spec) return { ok: false };
  if (session.coins < spec.buyPrice) {
    session.toast = `Cần ${spec.buyPrice} Xu để mua ${spec.name}!`;
    session.toastMs = 2200;
    return { ok: false, reason: 'no_coins' };
  }
  session.coins -= spec.buyPrice;
  const animal = {
    uid: session.nextAnimalUid++,
    animalId: spec.id,
    name: spec.name,
    row,
    col,
    worldX: col * 36 + 18,
    worldY: row * 18 + 9,
    worldBlock: spec.worldBlock ?? 8,
    paletteIndex: spec.paletteIndex ?? 0,
    idleFrame: spec.idleFrame ?? 0,
    fed: true,
    ready: false,
    progressMs: 0,
    prodMs: spec.prodSec * 1000,
    sellPrice: spec.sellPrice,
    xp: spec.xp,
  };
  session.animals.push(animal);
  session.toast = `🐄 Đã mua ${spec.name} (-${spec.buyPrice} Xu)`;
  session.toastMs = 2200;
  return { ok: true, animal };
}

export function collectOrFeedAnimal(session, animalUid) {
  const animal = session.animals.find(a => a.uid === animalUid);
  if (!animal) return { ok: false };
  if (animal.ready) {
    const spec = session.catalog?.animals?.find(s => s.id === animal.animalId);
    const prodId = spec?.productGoodId ?? (animal.animalId + 2000);
    const fallbackProd = /bò|cow/i.test(animal.name) ? 'Sữa tươi'
      : /gà|chicken|hen/i.test(animal.name) ? 'Trứng gà'
      : /cừu|sheep/i.test(animal.name) ? 'Len cừu'
      : /lợn|heo|pig/i.test(animal.name) ? 'Nấm cục'
      : /ngỗng|vịt|duck|goose/i.test(animal.name) ? 'Trứng vịt'
      : `Nông sản ${animal.name}`;
    const prodName = spec?.productName ?? fallbackProd;
    const existing = session.inventory.get(prodId) || { id: prodId, name: prodName, qty: 0, sellPrice: animal.sellPrice };
    existing.qty += 1;
    session.inventory.set(prodId, existing);
    animal.ready = false;
    animal.fed = false;
    animal.progressMs = 0;
    awardFarmXp(session, animal.xp);
    advanceQuests(session, 'harvest', 1);
    session.toast = `🥚 Thu ${prodName} từ ${animal.name} (+${animal.xp} XP)`;
    session.toastMs = 2000;
    return { ok: true, action: 'collected', prodId, prodName };
  }
  if (!animal.fed) {
    animal.fed = true;
    animal.progressMs = 0;
    session.toast = `🌿 Đã cho ${animal.name} ăn`;
    session.toastMs = 1600;
    return { ok: true, action: 'fed' };
  }
  return { ok: false };
}

export function sellGood(session, itemId, qty = 1) {
  const entry = session.inventory.get(itemId);
  if (!entry || entry.qty <= 0) return { ok: false };
  const count = Math.min(entry.qty, qty);
  const earned = count * entry.sellPrice;
  entry.qty -= count;
  if (entry.qty <= 0) session.inventory.delete(itemId);
  session.coins += earned;
  advanceQuests(session, 'sell', count);
  session.toast = `💰 Đã bán ${count}× ${entry.name} (+${earned} Xu)`;
  session.toastMs = 2000;
  return { ok: true, earned };
}

export function sellAllGoods(session) {
  let total = 0;
  let count = 0;
  for (const entry of session.inventory.values()) {
    total += entry.qty * entry.sellPrice;
    count += entry.qty;
  }
  if (count === 0) return { ok: false, earned: 0 };
  session.inventory.clear();
  session.coins += total;
  advanceQuests(session, 'sell', count);
  session.toast = `💰 Đã bán toàn bộ kho (${count} món) +${total} Xu!`;
  session.toastMs = 2200;
  return { ok: true, earned: total };
}

export function claimQuestReward(session, questId) {
  const q = session.quests?.find(item => item.id === questId);
  if (!q || !q.completed || q.claimed) return { ok: false };
  q.claimed = true;
  session.coins += q.rewardCoins;
  awardFarmXp(session, q.rewardXp);
  session.toast = `🏆 Nhận thưởng ${q.title}: +${q.rewardCoins} Xu, +${q.rewardXp} XP!`;
  session.toastMs = 2400;
  return { ok: true };
}

export function interactAtFarmTile(session, row, col, worldX = null, worldY = null) {
  const animal = session.animals.find(a => a.row === row && a.col === col);
  if (animal) return collectOrFeedAnimal(session, animal.uid);

  const plot = session.plots.get(`${row},${col}`);
  if (!plot) return plowPlot(session, row, col, worldX, worldY);
  if (plot.stage === 'ready') return harvestPlot(session, row, col);
  if (plot.stage === 'growing') return waterPlot(session, row, col);
  if (plot.stage === 'tilled') return plantCropOnPlot(session, row, col, session.selectedCropId);
  return { ok: false };
}

export function isPointInUnlockedLand(session, wx, wy) {
  const unlocked = session.unlockedZones || ['center'];
  return LAND_ZONES.some(z => unlocked.includes(z.id) && wx >= z.minX && wx <= z.maxX && wy >= z.minY && wy <= z.maxY);
}

export function buyLandZone(session, zoneId) {
  const zone = LAND_ZONES.find(z => z.id === zoneId);
  if (!zone) return { ok: false };
  if (session.unlockedZones.includes(zoneId)) return { ok: false, reason: 'owned' };
  if (session.level < zone.unlockLevel) {
    session.toast = `${zone.name} mở khóa ở Cấp ${zone.unlockLevel}!`;
    session.toastMs = 2200;
    return { ok: false, reason: 'locked' };
  }
  if (session.coins < zone.cost) {
    session.toast = `Cần ${zone.cost} Xu để mua ${zone.name}!`;
    session.toastMs = 2200;
    return { ok: false, reason: 'no_coins' };
  }
  session.coins -= zone.cost;
  session.unlockedZones.push(zoneId);
  awardFarmXp(session, 25);
  session.toast = `🗺️ Đã mở rộng ${zone.name}! (+25 XP)`;
  session.toastMs = 2600;
  return { ok: true, zone };
}

export function plantFruitTree(session, cropId, wx, wy) {
  const spec = session.catalog?.crops?.find(c => c.id === cropId && c.isTree);
  if (!spec) return { ok: false, reason: 'not_tree' };
  if (session.level < spec.unlockLevel) {
    session.toast = `${spec.name} mở khóa ở Cấp ${spec.unlockLevel}!`;
    session.toastMs = 2200;
    return { ok: false, reason: 'locked' };
  }
  if (session.coins < spec.buyPrice) {
    session.toast = `Cần ${spec.buyPrice} Xu để trồng ${spec.name}!`;
    session.toastMs = 2200;
    return { ok: false, reason: 'no_coins' };
  }
  const iso = worldToIso(wx, wy);
  const snapped = isoToWorld(iso.ix, iso.iy);
  session.coins -= spec.buyPrice;
  const tree = {
    uid: session.nextTreeUid++,
    cropId: spec.id,
    name: spec.name,
    worldX: snapped.wx,
    worldY: snapped.wy,
    worldBlock: spec.worldBlock,
    ready: false,
    progressMs: 0,
    growMs: spec.growSec * 1000,
  };
  session.fruitTrees.push(tree);
  awardFarmXp(session, 6);
  advanceQuests(session, 'plant', 1);
  session.toast = `🌳 Đã trồng ${spec.name} (-${spec.buyPrice} Xu)`;
  session.toastMs = 2200;
  return { ok: true, tree };
}

export function placeDecoration(session, decorId, wx, wy) {
  const spec = session.catalog?.decorations?.find(d => d.id === decorId);
  if (!spec) return { ok: false };
  if (session.level < spec.unlockLevel) {
    session.toast = `${spec.name} mở khóa ở Cấp ${spec.unlockLevel}!`;
    session.toastMs = 2000;
    return { ok: false, reason: 'locked' };
  }
  if (session.coins < spec.buyPrice) {
    session.toast = `Cần ${spec.buyPrice} Xu để đặt ${spec.name}!`;
    session.toastMs = 2000;
    return { ok: false, reason: 'no_coins' };
  }
  const iso = worldToIso(wx, wy);
  const snapped = isoToWorld(iso.ix, iso.iy);
  session.coins -= spec.buyPrice;
  const item = {
    uid: session.nextDecorUid++,
    decorId: spec.id,
    name: spec.name,
    worldX: snapped.wx,
    worldY: snapped.wy,
    worldBlock: spec.worldBlock,
    paletteIndex: spec.paletteIndex,
    frame: spec.frame,
  };
  session.placedDecor.push(item);
  awardFarmXp(session, 5);
  session.toast = `🏡 Đã đặt ${spec.name} (-${spec.buyPrice} Xu)`;
  session.toastMs = 2000;
  return { ok: true, item };
}

export function clearDebris(session, opaqueKey, wx, wy) {
  if (session.clearedDebris.includes(opaqueKey)) return { ok: false };
  if (session.energy < 2) {
    session.toast = 'Hết năng lượng (cần 2 ⚡ để dọn dẹp)!';
    session.toastMs = 2000;
    return { ok: false, reason: 'no_energy' };
  }
  session.energy -= 2;
  session.clearedDebris.push(opaqueKey);
  session.coins += 15;
  awardFarmXp(session, 5);
  advanceQuests(session, 'clear', 1);
  // Chance to find a collectible when clearing bushes/rocks
  const coll = session.catalog?.collectibles || [];
  if (coll.length > 0) {
    const found = coll[opaqueKey % Math.min(coll.length, Math.max(4, session.level + 2))];
    session.collections[found.id] = (session.collections[found.id] || 0) + 1;
    addPopup(session, wx, wy - 20, `+15G & ${found.name}!`, '#9cff7b');
    session.toast = `🪓 Đã dọn đất (+15 Xu, +5 XP, nhặt ${found.name})!`;
  } else {
    addPopup(session, wx, wy - 20, '+15 Xu +5 XP', '#9cff7b');
    session.toast = '🪓 Đã dọn chướng ngại (+15 Xu, +5 XP)!';
  }
  session.toastMs = 2200;
  return { ok: true };
}

export function startKitchenRecipe(session, recipeId) {
  const recipe = session.catalog?.recipes?.find(r => r.id === recipeId);
  if (!recipe) return { ok: false };
  if (session.level < recipe.unlockLevel) {
    session.toast = `${recipe.name} mở khóa ở Cấp ${recipe.unlockLevel}!`;
    session.toastMs = 2200;
    return { ok: false, reason: 'locked' };
  }
  if ((session.kitchenQueue?.length || 0) >= 4) {
    session.toast = 'Bếp đang đầy (tối đa 4 món cùng lúc)!';
    session.toastMs = 2000;
    return { ok: false, reason: 'full' };
  }
  for (const ing of recipe.ingredients) {
    const have = session.inventory.get(ing.goodId)?.qty || 0;
    if (have < ing.qty) {
      session.toast = `Thiếu nguyên liệu: cần ${ing.qty}× ${ing.name} (có ${have})!`;
      session.toastMs = 2400;
      return { ok: false, reason: 'missing_ingredient' };
    }
  }
  for (const ing of recipe.ingredients) {
    const entry = session.inventory.get(ing.goodId);
    entry.qty -= ing.qty;
    if (entry.qty <= 0) session.inventory.delete(ing.goodId);
  }
  const job = {
    uid: session.nextCookUid++,
    recipeId: recipe.id,
    name: recipe.name,
    outputGoodId: recipe.outputGoodId,
    sellPrice: recipe.sellPrice,
    xp: recipe.xp,
    progressMs: 0,
    cookMs: recipe.cookSec * 1000,
    ready: false,
  };
  session.kitchenQueue.push(job);
  session.toast = `🍳 Đang nấu ${recipe.name} (${recipe.cookSec}s)...`;
  session.toastMs = 2000;
  return { ok: true, job };
}

export function collectKitchenDish(session, jobUid) {
  const idx = (session.kitchenQueue || []).findIndex(j => j.uid === jobUid && j.ready);
  if (idx < 0) return { ok: false };
  const [job] = session.kitchenQueue.splice(idx, 1);
  const existing = session.inventory.get(job.outputGoodId) || {
    id: job.outputGoodId, name: job.name, qty: 0, sellPrice: job.sellPrice,
  };
  existing.qty += 1;
  session.inventory.set(job.outputGoodId, existing);
  awardFarmXp(session, job.xp);
  advanceQuests(session, 'cook', 1);
  session.toast = `🍽️ Đã nhận ${job.name} vào Kho (+${job.xp} XP)!`;
  session.toastMs = 2200;
  return { ok: true, job };
}

export function repairManorRoom(session, entityId) {
  const room = session.catalog?.buildings?.find(b => b.entityId === entityId && b.isManorRoom);
  if (!room) return { ok: false };
  if (session.unlockedRooms[entityId]) return { ok: false, reason: 'repaired' };
  const cost = Math.max(150, Math.min(5000, room.repairCost || 300));
  if (session.coins < cost) {
    session.toast = `Cần ${cost} Xu để sửa ${room.name}!`;
    session.toastMs = 2200;
    return { ok: false, reason: 'no_coins' };
  }
  session.coins -= cost;
  session.unlockedRooms[entityId] = true;
  awardFarmXp(session, 30);
  session.toast = `🏛️ Đã sửa xong ${room.name}! (+30 XP)`;
  session.toastMs = 2600;
  return { ok: true, room };
}

export function upgradeBarn(session) {
  const cost = 150 + Math.floor((session.barnCapacity - 40) * 10);
  if (session.coins < cost) {
    session.toast = `Cần ${cost} Xu để nâng cấp Kho thóc (+20 sức chứa)!`;
    session.toastMs = 2200;
    return { ok: false, reason: 'no_coins' };
  }
  session.coins -= cost;
  session.barnCapacity += 20;
  awardFarmXp(session, 15);
  session.toast = `🏚️ Đã nâng cấp Kho thóc lên ${session.barnCapacity} chỗ!`;
  session.toastMs = 2200;
  return { ok: true };
}

export function claimMail(session, mailId) {
  const m = (session.neighborMail || []).find(item => item.id === mailId && !item.claimed);
  if (!m) return { ok: false };
  if (m.kind === 'order') {
    let totalItems = 0;
    for (const it of session.inventory.values()) totalItems += it.qty;
    if (totalItems < m.needQty) {
      session.toast = `Cần có ít nhất ${m.needQty} nông sản trong Kho để giao đơn cho ${m.from}!`;
      session.toastMs = 2400;
      return { ok: false, reason: 'need_goods' };
    }
    let remain = m.needQty;
    for (const [id, it] of session.inventory.entries()) {
      const take = Math.min(it.qty, remain);
      it.qty -= take;
      remain -= take;
      if (it.qty <= 0) session.inventory.delete(id);
      if (remain <= 0) break;
    }
  }
  m.claimed = true;
  session.coins += m.giftCoins;
  awardFarmXp(session, m.giftXp);
  advanceQuests(session, 'sell', 1);
  session.toast = `✉️ Nhận thưởng từ ${m.from}: +${m.giftCoins} Xu, +${m.giftXp} XP!`;
  session.toastMs = 2400;
  return { ok: true };
}

export function helpNeighbor(session, neighborId) {
  const nb = session.catalog?.neighbors?.find(n => n.id === neighborId);
  if (!nb) return { ok: false };
  if (session.helpedNeighbors[neighborId]) {
    session.toast = `Bạn đã giúp trang trại ${nb.name} hôm nay rồi!`;
    session.toastMs = 1800;
    return { ok: false, reason: 'already_helped' };
  }
  if (session.energy < 2) {
    session.toast = 'Cần 2 ⚡ Năng lượng để giúp hàng xóm!';
    session.toastMs = 2000;
    return { ok: false, reason: 'no_energy' };
  }
  session.energy -= 2;
  session.helpedNeighbors[neighborId] = true;
  session.coins += 45;
  awardFarmXp(session, 12);
  advanceQuests(session, 'help', 1);
  session.toast = `🤝 Đã giúp ${nb.name} tưới vườn! (+45 Xu, +12 XP)`;
  session.toastMs = 2400;
  return { ok: true };
}

/**
 * Port of a.java:1710-1728 (case 47: a.u(4 + N)):
 * Actually travel to any of the 10 real neighbor farms stored in pack10[5..14]!
 */
export function visitNeighborFarm(session, neighborIndex, worldResources) {
  const nb = session.catalog?.neighbors?.[neighborIndex];
  if (!nb || !worldResources?.neighborFarmEntities) return { ok: false };
  const entities = worldResources.neighborFarmEntities(neighborIndex);
  if (!session.visitingNeighbor && session.farmer) {
    session.homeFarmerPos = { x: session.farmer.x, y: session.farmer.y, cameraX: session.cameraX, cameraY: session.cameraY };
  }
  const hostChar = entities.find(e => e.category === 42) || entities.find(e => e.category === 49) || entities[0];
  const startX = hostChar ? Math.max(120, Math.min(1900, hostChar.x - 36)) : 1044;
  const startY = hostChar ? Math.max(340, Math.min(920, hostChar.y + 24)) : 460;
  session.visitingNeighbor = {
    index: neighborIndex,
    id: nb.id,
    name: nb.name,
    pack10Block: 5 + neighborIndex,
    entities,
    helpedKeys: [],
    helpsToday: session.helpedNeighbors[nb.id] ? 5 : 0,
    maxHelps: 5,
  };
  if (session.farmer) {
    session.farmer.x = startX;
    session.farmer.y = startY;
    session.farmer.targetX = startX;
    session.farmer.targetY = startY;
    session.farmer.state = 'idle';
    session.farmer.anim = 2;
    session.farmer.pendingAction = null;
  }
  const zoom = session.worldZoom || 1;
  session.cameraX = startX - (SCREEN_W / zoom) / 2;
  session.cameraY = startY - (SCREEN_H / zoom) / 2;
  clampWorldCamera(session, worldResources.tileMap);
  session.view = SOURCE_VIEW.WORLD_LAYER;
  session.toast = `🏡 Đang thăm trang trại ${nb.name}! Chạm cây/thú để giúp (0/5)`;
  session.toastMs = 3000;
  return { ok: true, neighbor: nb, entityCount: entities.length };
}

export function helpNeighborEntity(session, opaqueKey, wx, wy) {
  const vn = session.visitingNeighbor;
  if (!vn) return { ok: false };
  if (vn.helpsToday >= vn.maxHelps) {
    session.toast = `Bạn đã giúp đủ 5 việc cho ${vn.name} hôm nay!`;
    session.toastMs = 2000;
    return { ok: false, reason: 'max_helps' };
  }
  if (vn.helpedKeys.includes(opaqueKey)) {
    session.toast = 'Chỗ này bạn đã giúp rồi!';
    session.toastMs = 1500;
    return { ok: false, reason: 'already_done' };
  }
  if (session.energy < 1) {
    session.toast = 'Cần 1 ⚡ Năng lượng để giúp hàng xóm!';
    session.toastMs = 2000;
    return { ok: false, reason: 'no_energy' };
  }
  session.energy -= 1;
  vn.helpedKeys.push(opaqueKey);
  vn.helpsToday += 1;
  if (vn.helpsToday >= vn.maxHelps) session.helpedNeighbors[vn.id] = true;
  session.coins += 20;
  awardFarmXp(session, 8);
  advanceQuests(session, 'help', 1);
  session.toast = `❤️ Đã giúp ${vn.name} (${vn.helpsToday}/${vn.maxHelps}) +20 Xu, +8 XP!`;
  session.toastMs = 2200;
  return { ok: true, helpsToday: vn.helpsToday };
}

export function returnHomeFarm(session, tileMap = null) {
  if (!session.visitingNeighbor) return { ok: false };
  session.visitingNeighbor = null;
  if (session.homeFarmerPos && session.farmer) {
    session.farmer.x = session.homeFarmerPos.x;
    session.farmer.y = session.homeFarmerPos.y;
    session.farmer.targetX = session.homeFarmerPos.x;
    session.farmer.targetY = session.homeFarmerPos.y;
    session.farmer.state = 'idle';
    session.farmer.anim = 2;
    session.farmer.pendingAction = null;
    session.cameraX = session.homeFarmerPos.cameraX;
    session.cameraY = session.homeFarmerPos.cameraY;
    clampWorldCamera(session, tileMap);
  }
  session.view = SOURCE_VIEW.WORLD_LAYER;
  session.toast = '🏠 Đã quay về trang trại của bạn!';
  session.toastMs = 2000;
  return { ok: true };
}

export function sellCollectible(session, collectibleId) {
  const count = session.collections?.[collectibleId] || 0;
  if (count <= 0) return { ok: false };
  const spec = session.catalog?.collectibles?.find(c => c.id === collectibleId);
  const reward = spec?.sellPrice || 50;
  session.collections[collectibleId] = count - 1;
  session.coins += reward;
  awardFarmXp(session, 8);
  session.toast = `🏺 Đã bán cổ vật ${spec?.name || ''} (+${reward} Xu)!`;
  session.toastMs = 2000;
  return { ok: true };
}

// Port of a.java:22482-22650: dispatch building click to its authentic Green Farm 3 UI screen
export function openBuildingMenu(session, entityId) {
  session.panelCursor = 0;
  if (entityId === 2 || entityId === 14) {
    session.view = SOURCE_VIEW.KITCHEN;
    return 'kitchen';
  }
  if (entityId === 0) {
    session.view = SOURCE_VIEW.COLLECTIONS;
    return 'collections';
  }
  if (entityId >= 1 && entityId <= 8) {
    session.view = SOURCE_VIEW.MANOR;
    return 'manor';
  }
  if (entityId === 10 || entityId === 13 || entityId === 9) {
    session.view = SOURCE_VIEW.BARN;
    return 'barn';
  }
  if (entityId === 11) {
    session.coopFilter = 'chicken';
    session.view = SOURCE_VIEW.COOP;
    return 'coop';
  }
  if (entityId === 12) {
    session.coopFilter = 'livestock';
    session.view = SOURCE_VIEW.COOP;
    return 'coop';
  }
  if (entityId === 15) {
    session.view = SOURCE_VIEW.MAILBOX;
    return 'mailbox';
  }
  if (entityId === 17) {
    // Pond: restore +5 energy
    session.energy = Math.min(session.maxEnergy, session.energy + 5);
    session.toast = '💧 Lấy nước mát ở Ao (+5 ⚡ Năng lượng)!';
    session.toastMs = 2000;
    return 'pond';
  }
  session.view = SOURCE_VIEW.MANOR;
  return 'manor';
}

export function serializeFarmSession(session) {
  return JSON.stringify({
    coins: session.coins,
    cash: session.cash,
    xp: session.xp,
    level: session.level,
    energy: session.energy,
    maxEnergy: session.maxEnergy,
    barnCapacity: session.barnCapacity,
    siloLevel: session.siloLevel,
    selectedCropId: session.selectedCropId,
    plots: [...session.plots.values()],
    fruitTrees: session.fruitTrees,
    placedDecor: session.placedDecor,
    clearedDebris: session.clearedDebris,
    unlockedZones: session.unlockedZones,
    unlockedRooms: session.unlockedRooms,
    kitchenQueue: session.kitchenQueue,
    collections: session.collections,
    neighborMail: session.neighborMail,
    helpedNeighbors: session.helpedNeighbors,
    animals: session.animals,
    nextAnimalUid: session.nextAnimalUid,
    nextTreeUid: session.nextTreeUid,
    nextDecorUid: session.nextDecorUid,
    nextCookUid: session.nextCookUid,
    inventory: [...session.inventory.values()],
    quests: session.quests,
  });
}

export function restoreFarmSession(raw, worldResources, textData = {}) {
  const session = createFarmSession(worldResources, textData);
  try {
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return session;
    if (typeof data.coins === 'number') session.coins = data.coins;
    if (typeof data.cash === 'number') session.cash = data.cash;
    if (typeof data.xp === 'number') session.xp = data.xp;
    if (typeof data.level === 'number') session.level = data.level;
    if (typeof data.energy === 'number') session.energy = data.energy;
    if (typeof data.maxEnergy === 'number') session.maxEnergy = data.maxEnergy;
    if (typeof data.barnCapacity === 'number') session.barnCapacity = data.barnCapacity;
    if (typeof data.siloLevel === 'number') session.siloLevel = data.siloLevel;
    if (data.selectedCropId) session.selectedCropId = data.selectedCropId;
    if (Array.isArray(data.plots)) {
      session.plots = new Map(data.plots.map(p => [`${p.row},${p.col}`, p]));
    }
    if (Array.isArray(data.fruitTrees)) session.fruitTrees = data.fruitTrees;
    if (Array.isArray(data.placedDecor)) session.placedDecor = data.placedDecor;
    if (Array.isArray(data.clearedDebris)) session.clearedDebris = data.clearedDebris;
    if (Array.isArray(data.unlockedZones)) session.unlockedZones = data.unlockedZones;
    if (data.unlockedRooms && typeof data.unlockedRooms === 'object') session.unlockedRooms = data.unlockedRooms;
    if (Array.isArray(data.kitchenQueue)) session.kitchenQueue = data.kitchenQueue;
    if (data.collections && typeof data.collections === 'object') session.collections = data.collections;
    if (Array.isArray(data.neighborMail)) session.neighborMail = data.neighborMail;
    if (data.helpedNeighbors && typeof data.helpedNeighbors === 'object') session.helpedNeighbors = data.helpedNeighbors;
    if (Array.isArray(data.animals)) session.animals = data.animals;
    if (typeof data.nextAnimalUid === 'number') session.nextAnimalUid = data.nextAnimalUid;
    if (typeof data.nextTreeUid === 'number') session.nextTreeUid = data.nextTreeUid;
    if (typeof data.nextDecorUid === 'number') session.nextDecorUid = data.nextDecorUid;
    if (typeof data.nextCookUid === 'number') session.nextCookUid = data.nextCookUid;
    if (Array.isArray(data.inventory)) {
      session.inventory = new Map(data.inventory.map(it => [it.id, it]));
    }
    if (Array.isArray(data.quests)) session.quests = data.quests;
    session.view = SOURCE_VIEW.WORLD_LAYER;
    return session;
  } catch {
    return session;
  }
}
