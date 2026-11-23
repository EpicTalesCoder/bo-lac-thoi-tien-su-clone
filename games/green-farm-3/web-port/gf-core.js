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
});

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

// Port of a.java:18088-18129 & e.java:2732-3046: create full playable farm state from /9 & /10
export function createFarmSession(worldResources, textData = {}) {
  const base = newEvidenceSession(worldResources);
  const catalog = worldResources?.catalog || { crops: [], goods: [], animals: [], quests: [], levelXp: [60, 120, 200] };
  const wheat = catalog.crops.find(c => c.id === 3004) || catalog.crops[1] || catalog.crops[0];
  const tomato = catalog.crops.find(c => c.id === 3001) || catalog.crops[1] || wheat;

  // Starting farm plots near camera center matching Cindy Lou's tutorial (page_0[4]: Wheat ready to harvest!)
  const plots = new Map();
  const seedPlots = [
    { row: 6, col: 2, crop: wheat, stage: 'ready', progressMs: (wheat?.growSec || 9) * 1000 },
    { row: 6, col: 3, crop: wheat, stage: 'ready', progressMs: (wheat?.growSec || 9) * 1000 },
    { row: 7, col: 2, crop: tomato, stage: 'growing', progressMs: Math.floor(((tomato?.growSec || 15) * 1000) / 2) },
    { row: 7, col: 3, crop: null, stage: 'tilled', progressMs: 0 },
  ];
  for (const sp of seedPlots) {
    plots.set(`${sp.row},${sp.col}`, {
      row: sp.row,
      col: sp.col,
      cropId: sp.crop?.id ?? null,
      cropName: sp.crop?.name ?? '',
      stage: sp.stage, // 'tilled' | 'growing' | 'ready'
      watered: sp.stage === 'growing',
      progressMs: sp.progressMs,
      growMs: (sp.crop?.growSec || 10) * 1000,
    });
  }

  const starterAnimal = catalog.animals[0] || { id: 2004, name: 'Gà con Delaware', buyPrice: 200, prodSec: 15, sellPrice: 36, xp: 5 };
  const farmAnimals = [
    {
      uid: 1,
      animalId: starterAnimal.id,
      name: starterAnimal.name,
      row: 9,
      col: 3,
      fed: true,
      ready: false,
      progressMs: 0,
      prodMs: (starterAnimal.prodSec || 15) * 1000,
      sellPrice: starterAnimal.sellPrice,
      xp: starterAnimal.xp,
    },
  ];

  const quests = (catalog.quests || []).slice(0, 8).map((q, i) => ({
    ...q,
    progress: 0,
    completed: false,
    claimed: false,
    trackKind: i % 2 === 0 ? 'harvest' : 'sell',
  }));

  return {
    ...base,
    view: base.dialogue.length > 0 ? SOURCE_VIEW.OPENING_SCRIPT : SOURCE_VIEW.WORLD_LAYER,
    coins: 250,
    cash: 15,
    xp: 0,
    level: 1,
    energy: 30,
    maxEnergy: 30,
    cameraX: 0,
    cameraY: 0,
    cursorRow: 6,
    cursorCol: 2,
    selectedCropId: wheat?.id ?? 3004,
    activeTool: 'auto', // 'auto' | 'plow' | 'plant' | 'water' | 'harvest'
    shopTab: 'crops', // 'crops' | 'animals'
    shopCursor: 0,
    questCursor: 0,
    barnCursor: 0,
    plots,
    animals: farmAnimals,
    nextAnimalUid: 2,
    inventory: new Map(), // itemId -> { id, name, qty, sellPrice }
    quests,
    toast: sourceText(textData, 4) || 'Bấm vào Lúa mì chín để thu hoạch!',
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

export function stepFarmSession(session, dtMs) {
  if (!session || session.view === SOURCE_VIEW.OPENING_SCRIPT) return false;
  let changed = false;
  if (session.toastMs > 0) {
    session.toastMs = Math.max(0, session.toastMs - dtMs);
    if (session.toastMs === 0) session.toast = '';
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
  for (const animal of session.animals) {
    if (animal.fed && !animal.ready) {
      animal.progressMs += dtMs;
      if (animal.progressMs >= animal.prodMs) {
        animal.progressMs = animal.prodMs;
        animal.ready = true;
        changed = true;
      }
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

export function plowPlot(session, row, col) {
  const key = `${row},${col}`;
  if (session.plots.has(key)) return { ok: false, reason: 'occupied' };
  const plotCost = session.catalog?.crops?.find(c => c.id === 3000)?.buyPrice ?? 10;
  if (session.coins < plotCost) {
    session.toast = `Cần ${plotCost} Xu để cày ô đất mới!`;
    session.toastMs = 2000;
    return { ok: false, reason: 'no_coins' };
  }
  session.coins -= plotCost;
  session.plots.set(key, {
    row,
    col,
    cropId: null,
    cropName: '',
    stage: 'tilled',
    watered: false,
    progressMs: 0,
    growMs: 0,
  });
  awardFarmXp(session, 2);
  session.toast = `Đã cày ô (${row},${col}) -${plotCost} Xu`;
  session.toastMs = 1800;
  return { ok: true };
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
  const itemId = plot.cropId;
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
  session.toast = `🌾 Thu hoạch ${itemName} (+${xp} XP)`;
  session.toastMs = 2000;
  return { ok: true, itemId, itemName };
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
    const prodId = animal.animalId + 2000;
    const prodName = `Sản phẩm ${animal.name}`;
    const existing = session.inventory.get(prodId) || { id: prodId, name: prodName, qty: 0, sellPrice: animal.sellPrice };
    existing.qty += 1;
    session.inventory.set(prodId, existing);
    animal.ready = false;
    animal.fed = false;
    animal.progressMs = 0;
    awardFarmXp(session, animal.xp);
    advanceQuests(session, 'harvest', 1);
    session.toast = `🥚 Thu hoạch từ ${animal.name} (+${animal.xp} XP)`;
    session.toastMs = 2000;
    return { ok: true, action: 'collected' };
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

export function interactAtFarmTile(session, row, col) {
  const animal = session.animals.find(a => a.row === row && a.col === col);
  if (animal) return collectOrFeedAnimal(session, animal.uid);

  const plot = session.plots.get(`${row},${col}`);
  if (!plot) return plowPlot(session, row, col);
  if (plot.stage === 'ready') return harvestPlot(session, row, col);
  if (plot.stage === 'growing') return waterPlot(session, row, col);
  if (plot.stage === 'tilled') return plantCropOnPlot(session, row, col, session.selectedCropId);
  return { ok: false };
}

export function serializeFarmSession(session) {
  return JSON.stringify({
    coins: session.coins,
    cash: session.cash,
    xp: session.xp,
    level: session.level,
    energy: session.energy,
    maxEnergy: session.maxEnergy,
    selectedCropId: session.selectedCropId,
    plots: [...session.plots.values()],
    animals: session.animals,
    nextAnimalUid: session.nextAnimalUid,
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
    if (data.selectedCropId) session.selectedCropId = data.selectedCropId;
    if (Array.isArray(data.plots)) {
      session.plots = new Map(data.plots.map(p => [`${p.row},${p.col}`, p]));
    }
    if (Array.isArray(data.animals)) session.animals = data.animals;
    if (typeof data.nextAnimalUid === 'number') session.nextAnimalUid = data.nextAnimalUid;
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
