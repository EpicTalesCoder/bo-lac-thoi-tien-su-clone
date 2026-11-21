import { revealFog } from './render-original.js';

export const MALE_NAMES = [
  'Jafar', 'Jumbo', 'Juju', 'Mumbo', 'Freaky', 'Ludo', 'Konan', 'Rumbo', 'Milo', 'Kipp',
  'Errrbo', 'Gumbo', 'Edwood', 'Arnni', 'Erk', 'Daymo', 'Bookah', 'Erbby', 'Ukkko', 'Ukmol',
  'Pard', 'Rayvon', 'Narik', 'Derger', 'Rychi', 'Mylo', 'Rilo', 'Babon', 'Harpo', 'Seppo',
  'Chico', 'Taran', 'Tone', 'Derp', 'Tupik', 'Makka', 'Fred', 'Barney', 'Siggy', 'Smoki',
];

export const FEMALE_NAMES = [
  'Dorris', 'Ethel', 'Tessa', 'Nora', 'Flora', 'Fauna', 'Mila', 'Daisi', 'Myrtle', 'Margo',
  'Audrey', 'Irene', 'Hurdy', 'Gurdy', 'Murli', 'Mousi', 'Irma', 'Urna', 'Purga', 'Grami',
  'Urrki', 'Lavka', 'Manka', 'Banka', 'Bunki', 'Gretel', 'Spiki', 'Arida', 'Ronda', 'Mayka',
  'Vanni', 'Buffi', 'Aromi', 'Mitte', 'Ritte', 'Banne', 'Polka', 'Dolka', 'Korka', 'Zorka',
];

export function getVillagerName(data, uid) {
  const e = data.entityData;
  const isFemale = e[1515 + uid] === 1;
  const list = isFemale ? FEMALE_NAMES : MALE_NAMES;
  const name = list[(uid - 1) % list.length];
  const chiefId = data.resources?.[0]?.[17] ?? 1;
  return uid === chiefId ? `Tộc trưởng ${name}` : name;
}

export const MA_OFFSETS = [0, 2545, 6965, 10649, 15487, 22633, 27261, 31708, 35466, 39214];

export const SCENARIOS = [
  { id: 0, name: 'Bên ngoài', subtitle: 'Thung lũng khởi đầu (40×32)' },
  { id: 1, name: 'Trả thù', subtitle: 'Mở rộng bộ lạc (64×48)' },
  { id: 2, name: 'Chạy trốn', subtitle: 'Hành trình qua rừng (64×80)' },
  { id: 3, name: 'Vùng đất hoang', subtitle: '14 thú hoang & sinh tồn (64×64)' },
  { id: 4, name: 'Ngôi nhà mới', subtitle: 'Vùng đất rộng lớn (64×96)' },
  { id: 5, name: 'Hồ rộng', subtitle: 'Ven hồ cổ đại (64×96)' },
  { id: 6, name: 'Vượt qua sa mạc', subtitle: 'Sa mạc 96×96' },
  { id: 7, name: 'Rừng dây leo', subtitle: 'Rừng rậm 96×64' },
  { id: 8, name: 'Tàn sát', subtitle: 'Giao tranh 80×80' },
  { id: 9, name: 'Mảnh đất', subtitle: 'Màn cuối 96×48' },
];

export const BUILDINGS = [
  {
    type: 2,
    name: 'Lều',
    desc: 'Tăng +4 chỗ ở cho bộ lạc, giúp dân nghỉ ngơi hồi sức.',
    housingBonus: 4,
    vision: 4,
  },
  {
    type: 11,
    name: 'Chòi canh',
    desc: 'Nhìn xa mở rộng sương mù và cảnh giới kẻ thù.',
    housingBonus: 0,
    vision: 7,
  },
  {
    type: 6,
    name: 'Kho',
    desc: 'Điểm tập kết gỗ, đá, thức ăn và vũ khí gần khu khai thác.',
    housingBonus: 0,
    vision: 4,
  },
  {
    type: 4,
    name: 'Bếp',
    desc: 'Nấu thức ăn cho bộ lạc để duy trì sức khỏe và năng lượng.',
    housingBonus: 0,
    vision: 4,
  },
  {
    type: 0,
    name: 'Kho vũ khí',
    desc: 'Chế tạo công cụ và vũ khí săn bắn cho dân làng.',
    housingBonus: 0,
    vision: 4,
  },
  {
    type: 10,
    name: 'Nhà trẻ',
    desc: 'Giữ trẻ em an toàn khỏi thú hoang và quân địch.',
    housingBonus: 0,
    vision: 4,
  },
  {
    type: 9,
    name: 'Trung tâm PIA',
    desc: 'Đào tạo trinh sát có tầm nhìn xa để khám phá bản đồ.',
    housingBonus: 0,
    vision: 6,
  },
  {
    type: 7,
    name: 'Sàn disco',
    desc: 'Giúp bộ lạc thư giãn, nhảy múa và tăng tinh thần.',
    housingBonus: 0,
    vision: 4,
  },
  {
    type: 8,
    name: 'Khu thánh địa',
    desc: 'Nơi pháp sư chữa bệnh và thực hiện phép thuật.',
    housingBonus: 0,
    vision: 5,
  },
  {
    type: 1,
    name: 'Phòng tập',
    desc: 'Huấn luyện kỹ năng chiến đấu cận chiến.',
    housingBonus: 0,
    vision: 4,
  },
  {
    type: 5,
    name: 'Khu tập ném',
    desc: 'Huấn luyện kỹ năng ném giáo săn bắn từ xa.',
    housingBonus: 0,
    vision: 4,
  },
];

export function getBuildingSpec(data, bType) {
  const m = data.mapTableData;
  const base = data.mapTableOffsets[138];
  const chiefMeta =
    bType === 3
      ? {
          type: 3,
          name: 'Lều của Tù trưởng',
          desc: 'Trung tâm bộ lạc, nơi tập kết tài nguyên và họp hội đồng.',
          housingBonus: 0,
          vision: 5,
        }
      : null;
  const meta = chiefMeta || BUILDINGS.find((b) => b.type === bType) || {
    type: bType,
    name: `Công trình #${bType}`,
    desc: '',
    housingBonus: bType === 2 ? 4 : 0,
    vision: 4,
  };
  return {
    ...meta,
    width: m[base + 104 + bType] || 2,
    height: m[base + 130 + bType] || 2,
    woodCost: m[base + 260 + bType] & 0xff,
    stoneCost: m[base + 286 + bType] & 0xff,
    toolsCost: m[base + 312 + bType] & 0xff,
    maxHp: (m[base + 182 + bType] & 0xff) || 80,
  };
}

export function canPlaceBuilding(data, bType, x, y) {
  const spec = getBuildingSpec(data, bType);
  if (x < 1 || y < 1 || x + spec.width >= data.width - 1 || y + spec.height >= data.height - 1) {
    return false;
  }
  for (let dy = 0; dy < spec.height; dy++) {
    for (let dx = 0; dx < spec.width; dx++) {
      const gx = x + dx;
      const gy = y + dy;
      if (data.occupancy[gy][gx] !== 0) return false;
      const tile = data.terrain[gy][gx] & 0xff;
      if (tile >= 175) return false;
      const flag = (data.shortSpriteTables[9][tile] >>> 13) & 1;
      if (flag === 1) return false;
    }
  }
  return true;
}

export function getScaffoldTypeForSize(w, h) {
  if (w === 1 && h === 1) return 19;
  if (w === 2 && h === 2) return 18;
  if (w === 3 && h === 2) return 17;
  if (w === 3 && h === 3) return 16;
  if (w === 4 && h === 3) return 15;
  if (w === 6 && h === 4) return 14;
  if (w === 5 && h === 4) return 13;
  return 12; // 4x4 default scaffold
}

export function getScaffoldSlots(data, scaffoldType) {
  const m = data.mapTableData;
  const mo = data.mapTableOffsets;
  const off = m[mo[174] + scaffoldType] & 0xff;
  const nxt = m[mo[174] + scaffoldType + 1] & 0xff;
  const count = Math.max(1, nxt - off);
  const tasks = [];
  for (let k = 0; k < count; k++) {
    const taskH = m[mo[58] + off + k] & 0xff;
    tasks.push(taskH === 76 ? 54 : 53); // 53 = hammering, 54 = sawing
  }
  return tasks;
}

export function placeConstructionSite(data, targetBType, x, y, owner = 0) {
  const spec = getBuildingSpec(data, targetBType);
  const scaffoldType = getScaffoldTypeForSize(spec.width, spec.height);
  const e = data.entityData;
  const startId = owner === 0 ? 1 : 31;
  let bid = -1;
  for (let i = 0; i < 30; i++) {
    if (e[8505 + startId + i] === 0) {
      bid = startId + i;
      break;
    }
  }
  if (bid === -1) return -1;

  e[8383 + bid] = x;
  e[8444 + bid] = y;
  e[8749 + bid] = scaffoldType;
  e[9237 + bid] = targetBType;
  e[8871 + bid] = 0;
  e[9176 + bid] = owner === 0 ? 5 : 0;
  e[8932 + bid] = 0;
  e[8993 + bid] = 0;
  e[9054 + bid] = 0;
  e[9115 + bid] = 0; // stage 0..3 grows as villagers hammer inside
  e[8810 + bid] = 0;
  e[8688 + bid] = spec.vision;
  e[8627 + bid] = 1; // under construction flag
  e[8566 + bid] = spec.maxHp;
  e[8505 + bid] = Math.max(6, Math.floor(spec.maxHp * 0.1));

  for (let dy = 0; dy < spec.height; dy++) {
    for (let dx = 0; dx < spec.width; dx++) {
      if (y + dy >= 0 && y + dy < data.height && x + dx >= 0 && x + dx < data.width) {
        data.occupancy[y + dy][x + dx] = -bid;
      }
    }
  }

  if (owner === 0) {
    revealFog(data, x + Math.floor(spec.width / 2), y + Math.floor(spec.height / 2), Math.max(4, spec.vision - 1));
  }
  return bid;
}

export function isUnitInsideBuilding(data, unitId) {
  const slot = (data.entityData[4646 + unitId] << 24) >> 24;
  return slot >= 0;
}

export function clearUnitFromOccupancy(data, unitId) {
  for (let y = 0; y < data.height; y++) {
    const row = data.occupancy[y];
    for (let x = 0; x < data.width; x++) {
      if (row[x] === unitId) row[x] = 0;
    }
  }
}

export function enterBuildingSlot(data, bid, unitId) {
  const e = data.entityData;
  const scaffoldType = e[8749 + bid];
  const slotAnims = getScaffoldSlots(data, scaffoldType);
  const usedSlots = new Set();
  let cur = e[8993 + bid];
  let guard = 0;
  while (cur > 0 && guard++ < 16) {
    if (cur === unitId) return { slotIdx: e[4646 + cur], animId: slotAnims[e[4646 + cur]] || 53 };
    usedSlots.add(e[4646 + cur]);
    cur = e[4545 + cur];
  }
  let freeSlot = -1;
  for (let s = 0; s < slotAnims.length; s++) {
    if (!usedSlots.has(s)) {
      freeSlot = s;
      break;
    }
  }
  if (freeSlot === -1) return null;

  // Remove villager from any outside map tile and link into building interior slot
  clearUnitFromOccupancy(data, unitId);

  e[4545 + unitId] = e[8993 + bid];
  e[8993 + bid] = unitId;
  e[4444 + unitId] = bid;
  e[4646 + unitId] = freeSlot;
  e[1313 + unitId] = 1; // active worker inside building (rendered by kind === 3)
  e[202 + unitId] = 0;
  e[303 + unitId] = 0;
  e[3535 + unitId] = 0;
  e[3636 + unitId] = 0;
  return { slotIdx: freeSlot, animId: slotAnims[freeSlot] || 53 };
}

export function exitBuildingSlot(data, unitId) {
  const e = data.entityData;
  if (!isUnitInsideBuilding(data, unitId)) return false;
  const bid = e[4444 + unitId] & 0xff;
  if (!bid || bid <= 0) {
    e[4646 + unitId] = -1;
    return false;
  }

  // Unlink unitId from building's e[8993 + bid] chain
  if (e[8993 + bid] === unitId) {
    e[8993 + bid] = e[4545 + unitId];
  } else {
    let prev = e[8993 + bid];
    let guard = 0;
    while (prev > 0 && guard++ < 16) {
      if (e[4545 + prev] === unitId) {
        e[4545 + prev] = e[4545 + unitId];
        break;
      }
      prev = e[4545 + prev];
    }
  }
  e[4545 + unitId] = 0;
  e[4444 + unitId] = 0;
  e[4646 + unitId] = -1;
  e[1313 + unitId] = 0;
  clearUnitFromOccupancy(data, unitId);

  // If this was a Lều (bType 2), re-check remaining occupants so a solo sleeper reverts to state 1 (glowing light only)
  if (e[8749 + bid] === 2) {
    let hasM = false;
    let hasF = false;
    let rem = e[8993 + bid];
    let g1 = 0;
    while (rem > 0 && g1++ < 16) {
      if ((e[1414 + rem] & 0xff) >= 12) {
        if ((e[1515 + rem] & 0xff) === 0) hasM = true;
        else hasF = true;
      }
      rem = e[4545 + rem];
    }
    const stillPair = hasM && hasF;
    let rem2 = e[8993 + bid];
    let g2 = 0;
    while (rem2 > 0 && g2++ < 16) {
      if (e[1313 + rem2] === 1 || e[1313 + rem2] === 2) {
        e[1313 + rem2] = stillPair ? 2 : 1;
      }
      rem2 = e[4545 + rem2];
    }
  }

  // Place villager on nearest free adjacent tile around building
  const bx = e[8383 + bid] & 0xff;
  const by = e[8444 + bid] & 0xff;
  const bType = e[8749 + bid] >= 12 && e[8749 + bid] <= 19 ? e[9237 + bid] : e[8749 + bid];
  const spec = getBuildingSpec(data, bType);
  let placed = false;
  for (let r = 1; r <= 4 && !placed; r++) {
    for (let dy = -r; dy <= spec.height - 1 + r && !placed; dy++) {
      for (let dx = -r; dx <= spec.width - 1 + r && !placed; dx++) {
        const nx = bx + dx;
        const ny = by + dy;
        if (nx < 1 || ny < 1 || nx >= data.width - 1 || ny >= data.height - 1) continue;
        if (data.occupancy[ny][nx] === 0 && (data.terrain[ny][nx] & 0xff) < 175) {
          e[unitId] = nx;
          e[101 + unitId] = ny;
          e[202 + unitId] = 0;
          e[303 + unitId] = 0;
          data.occupancy[ny][nx] = unitId;
          placed = true;
        }
      }
    }
  }
  return true;
}

export const WEAPONS = [
  { id: 0, name: 'Dùi cui', wood: 4, stone: 0, bones: 0, atk: 5 },
  { id: 1, name: 'Đá ném', wood: 0, stone: 5, bones: 0, atk: 6 },
  { id: 2, name: 'Giáo', wood: 6, stone: 2, bones: 0, atk: 9 },
  { id: 3, name: 'Búa đá', wood: 4, stone: 8, bones: 0, atk: 11 },
  { id: 4, name: 'Chùy xương', wood: 2, stone: 0, bones: 4, atk: 12 },
  { id: 5, name: 'Rìu nhỏ', wood: 5, stone: 6, bones: 2, atk: 14 },
];

export const SPELLS = [
  { id: 'heal', name: 'Chữa vết thương', bones: 2, desc: 'Hồi đầy máu cho toàn bộ dân làng.' },
  { id: 'shield', name: 'Phòng thủ', bones: 2, desc: 'Tăng +10 HP tối đa cho các chiến binh.' },
  { id: 'love', name: 'Thuốc tình yêu', bones: 3, desc: 'Tăng 100% vui vẻ & kích thích sinh thêm dân.' },
  { id: 'plague', name: 'Bệnh dịch', bones: 3, desc: 'Làm suy yếu thú hoang & quân địch trên bản đồ.' },
];

export function getBuildingSlotAnims(data, bType, slotIdx) {
  const mb = data?.mapTableData;
  const mo = data?.mapTableOffsets;
  const bytes = data?.byteSpriteTables;
  if (!mb || !mo || !bytes) {
    return { jobId: 0, slotCount: 1, anims: [{ animId: 105, frames: 16 }] };
  }
  const base = mb[mo[174] + bType] & 0xff;
  const nextBase = mb[mo[174] + bType + 1] & 0xff;
  const slotCount = Math.max(1, nextBase - base);
  const clampedSlot = Math.max(0, Math.min(slotCount - 1, slotIdx));
  const jobId = mb[mo[57] + base + clampedSlot] & 0xff;
  const aStart = mb[mo[166] + jobId] & 0xff;
  const aEnd = mb[mo[166] + jobId + 1] & 0xff;
  const anims = [];
  for (let i = aStart; i < aEnd; i++) {
    const animId = mb[mo[164] + i] & 0xff;
    if (animId === 0) continue;
    const frames = Math.max(1, (bytes[4]?.[animId] ?? 1) & 0xff);
    anims.push({ animId, frames });
  }
  if (anims.length === 0) {
    anims.push({ animId: 105, frames: 16 });
  }
  return { jobId, slotCount, anims };
}

export function enterBuildingWorkSlot(data, bid, unitId, preferredSlots = null) {
  const e = data.entityData;
  const rawType = e[8749 + bid] & 0xff;
  const bType = rawType >= 12 && rawType <= 19 ? (e[9237 + bid] & 0xff) : rawType;
  const mb = data.mapTableData;
  const mo = data.mapTableOffsets;
  const base = mb && mo ? (mb[mo[174] + bType] & 0xff) : 0;
  const nextBase = mb && mo ? (mb[mo[174] + bType + 1] & 0xff) : 4;
  const slotCount = Math.max(1, nextBase - base);

  const usedSlots = new Set();
  let cur = e[8993 + bid];
  let guard = 0;
  while (cur > 0 && guard++ < 16) {
    if (cur === unitId) {
      const existingSlot = e[4646 + cur];
      const meta = getBuildingSlotAnims(data, bType, existingSlot);
      return { slotIdx: existingSlot, bType, jobId: meta.jobId, anims: meta.anims };
    }
    usedSlots.add(e[4646 + cur]);
    cur = e[4545 + cur];
  }

  let freeSlot = -1;
  if (Array.isArray(preferredSlots) && preferredSlots.length > 0) {
    for (const s of preferredSlots) {
      if (s >= 0 && s < slotCount && !usedSlots.has(s)) {
        freeSlot = s;
        break;
      }
    }
  }
  if (freeSlot === -1) {
    for (let s = 0; s < slotCount; s++) {
      if (!usedSlots.has(s)) {
        freeSlot = s;
        break;
      }
    }
  }
  if (freeSlot === -1) return null;

  clearUnitFromOccupancy(data, unitId);

  e[4545 + unitId] = e[8993 + bid];
  e[8993 + bid] = unitId;
  e[4444 + unitId] = bid;
  e[4646 + unitId] = freeSlot;
  e[1313 + unitId] = 1; // active worker inside building (kind===3/4)
  e[3030 + unitId] = 0; // building prop animation frame counter
  e[202 + unitId] = 0;
  e[303 + unitId] = 0;
  e[3535 + unitId] = 0;
  e[3636 + unitId] = 0;
  const meta = getBuildingSlotAnims(data, bType, freeSlot);
  return { slotIdx: freeSlot, bType, jobId: meta.jobId, anims: meta.anims };
}

export function upgradeBuilding(data, bid) {
  const e = data.entityData;
  const stage = e[9115 + bid] & 0xff;
  if (stage >= 3) return false;
  e[9115 + bid] = stage + 1;
  const newMax = Math.min(240, (e[8566 + bid] & 0xff) + 25);
  e[8566 + bid] = newMax;
  e[8505 + bid] = newMax;
  return true;
}

export function demolishBuilding(data, bid) {
  const e = data.entityData;
  const rawType = e[8749 + bid];
  const isScaffold = rawType >= 12 && rawType <= 19;
  const targetType = isScaffold ? e[9237 + bid] : rawType;
  const spec = getBuildingSpec(data, targetType);
  const bx = e[8383 + bid] & 0xff;
  const by = e[8444 + bid] & 0xff;

  const workers = [];
  let cur = e[8993 + bid];
  let guard = 0;
  while (cur > 0 && guard++ < 16) {
    workers.push(cur);
    cur = e[4545 + cur];
  }
  for (const uid of workers) exitBuildingSlot(data, uid);

  e[8505 + bid] = 0;
  e[8566 + bid] = 0;
  e[8627 + bid] = 3;
  e[8749 + bid] = 0;
  e[9237 + bid] = 0;
  e[9115 + bid] = 0;
  for (let dy = 0; dy < spec.height; dy++) {
    for (let dx = 0; dx < spec.width; dx++) {
      if (data.occupancy[by + dy]?.[bx + dx] === -bid) {
        data.occupancy[by + dy][bx + dx] = 0;
      }
    }
  }
  return { x: bx, y: by, w: spec.width, h: spec.height, spec, isScaffold, workers };
}

export function enterRestHut(data, bid, unitId) {
  const e = data.entityData;
  const usedSlots = new Set();
  let cur = e[8993 + bid];
  let guard = 0;
  while (cur > 0 && guard++ < 16) {
    if (cur === unitId) return { slotIdx: e[4646 + cur] };
    usedSlots.add(e[4646 + cur]);
    cur = e[4545 + cur];
  }
  let freeSlot = -1;
  for (let s = 0; s < 4; s++) {
    if (!usedSlots.has(s)) {
      freeSlot = s;
      break;
    }
  }
  if (freeSlot === -1) return null;

  clearUnitFromOccupancy(data, unitId);

  e[4545 + unitId] = e[8993 + bid];
  e[8993 + bid] = unitId;
  e[4444 + unitId] = bid;
  e[4646 + unitId] = freeSlot;
  // Check if 1 adult male + 1 adult female are sharing this Lều for breeding (state 2: bouncing tent + anim 90)
  // Otherwise normal sleeping inside Lều uses state 1 (warm glowing window anim 115 only, b.java:2150 / f.java:1108-1114)
  let hasAdultMale = false;
  let hasAdultFemale = false;
  let occupant = e[8993 + bid];
  let chk = 0;
  while (occupant > 0 && chk++ < 16) {
    if ((e[1414 + occupant] & 0xff) >= 12) {
      if ((e[1515 + occupant] & 0xff) === 0) hasAdultMale = true;
      else hasAdultFemale = true;
    }
    occupant = e[4545 + occupant];
  }
  const canBreed = hasAdultMale && hasAdultFemale;
  e[1313 + unitId] = canBreed ? 2 : 1;
  e[3030 + unitId] = 0;
  if (canBreed) {
    let u = e[8993 + bid];
    let g2 = 0;
    while (u > 0 && g2++ < 16) {
      e[1313 + u] = 2;
      u = e[4545 + u];
    }
  }
  e[202 + unitId] = 0;
  e[303 + unitId] = 0;
  e[3535 + unitId] = 0;
  e[3636 + unitId] = 0;
  e[3333 + unitId] = -1;
  return { slotIdx: freeSlot, breeding: canBreed };
}

export function spawnNewbornVillager(data, x, y, owner = 0) {
  const e = data.entityData;
  const fo = data.entityFieldOffsets;
  const startId = owner === 0 ? 1 : 51;
  const endId = owner === 0 ? 50 : 100;
  let uid = -1;
  for (let i = startId; i <= endId; i++) {
    if ((e[1919 + i] & 0xff) === 0) {
      uid = i;
      break;
    }
  }
  if (uid === -1) return -1;
  const spawned = spawnUnit(data, owner, x, y, uid + 7);
  if (spawned > 0) {
    // Authentic newborn / child (age < 12 uses toddler/child sprite in render-original.js)
    e[1414 + spawned] = 1;
    e[6767 + spawned] = 20;
    e[1919 + spawned] = 20;
    e[2020 + spawned] = 100;
    e[2121 + spawned] = 100;
    e[505 + spawned] = 100;
    e[6464 + spawned] = 69;
    e[6565 + spawned] = 9;
    if (fo) {
      e[fo[29] + spawned] = 14; // child idle pose (pose 489)
      e[fo[30] + spawned] = 0;
    }
  }
  return spawned;
}

export function finishConstructionSite(data, bid) {
  const e = data.entityData;
  const targetBType = e[9237 + bid];
  const spec = getBuildingSpec(data, targetBType);
  const bx = e[8383 + bid] & 0xff;
  const by = e[8444 + bid] & 0xff;

  // Eject all builders working inside the scaffold onto adjacent tiles
  const workers = [];
  let cur = e[8993 + bid];
  let guard = 0;
  while (cur > 0 && guard++ < 16) {
    workers.push(cur);
    cur = e[4545 + cur];
  }
  for (const uid of workers) {
    exitBuildingSlot(data, uid);
  }

  // Transform scaffold into the finished building!
  e[8749 + bid] = targetBType;
  e[9237 + bid] = 0;
  e[9115 + bid] = 1;
  e[8627 + bid] = 0;
  e[8505 + bid] = spec.maxHp;
  e[8566 + bid] = spec.maxHp;
  revealFog(data, bx + Math.floor(spec.width / 2), by + Math.floor(spec.height / 2), spec.vision);

  return { targetBType, spec, workers };
}

export function placeBuilding(data, bType, x, y, owner = 0, stage = 1) {
  const spec = getBuildingSpec(data, bType);
  const e = data.entityData;
  const startId = owner === 0 ? 1 : 31;
  let bid = -1;
  for (let i = 0; i < 30; i++) {
    if (e[8505 + startId + i] === 0) {
      bid = startId + i;
      break;
    }
  }
  if (bid === -1) return -1;

  e[8383 + bid] = x;
  e[8444 + bid] = y;
  e[8749 + bid] = bType;
  e[8871 + bid] = 0;
  e[9176 + bid] = owner === 0 ? 5 : 0;
  e[8932 + bid] = 0;
  e[8993 + bid] = 0;
  e[9054 + bid] = 0;
  e[9115 + bid] = stage;
  e[8810 + bid] = 0;
  e[8688 + bid] = spec.vision;
  e[8627 + bid] = stage === 0 ? 1 : 0;
  e[8566 + bid] = spec.maxHp;
  e[8505 + bid] = stage === 0 ? Math.max(10, Math.floor(spec.maxHp / 4)) : spec.maxHp;

  for (let dy = 0; dy < spec.height; dy++) {
    for (let dx = 0; dx < spec.width; dx++) {
      if (y + dy >= 0 && y + dy < data.height && x + dx >= 0 && x + dx < data.width) {
        data.occupancy[y + dy][x + dx] = -bid;
      }
    }
  }

  if (owner === 0) {
    revealFog(data, x + Math.floor(spec.width / 2), y + Math.floor(spec.height / 2), spec.vision);
    if (bType === 2 && stage > 0 && data.resources?.[0]) {
      data.resources[0][16] = Math.min(50, (data.resources[0][16] || 1) + 4);
    }
  }
  return bid;
}

function spawnItemProp(data, kind, x, y, amount) {
  const e = data.entityData;
  let slot = -1;
  for (let i = 0; i < 50; i++) {
    if (e[9833 + i] === 0) {
      slot = i;
      break;
    }
  }
  if (slot === -1) return;
  e[9833 + slot] = kind;
  e[9733 + slot] = x;
  e[9783 + slot] = y;
  e[9883 + slot] = amount;
  e[9933 + slot] = 3;
  data.occupancy[y][x] = -61 - slot;
}

function spawnUnit(data, owner, x, y, indexSeed) {
  const e = data.entityData;
  const startId = owner === 0 ? 1 : 51;
  let uid = -1;
  for (let i = 0; i < 50; i++) {
    if ((e[1919 + startId + i] & 0xff) === 0) {
      uid = startId + i;
      break;
    }
  }
  if (uid === -1) return -1;

  // Find nearby free cell if target is occupied
  let px = Math.max(1, Math.min(data.width - 2, x));
  let py = Math.max(1, Math.min(data.height - 2, y));
  if (data.occupancy[py][px] !== 0) {
    let found = false;
    for (let r = 1; r <= 6 && !found; r++) {
      for (let dy = -r; dy <= r && !found; dy++) {
        for (let dx = -r; dx <= r && !found; dx++) {
          const nx = px + dx;
          const ny = py + dy;
          if (nx >= 1 && ny >= 1 && nx < data.width - 1 && ny < data.height - 1) {
            if (data.occupancy[ny][nx] === 0 && (data.terrain[ny][nx] & 0xff) < 175) {
              px = nx;
              py = ny;
              found = true;
            }
          }
        }
      }
    }
  }

  const maxHp = owner === 0 ? 48 + ((indexSeed * 7) % 16) : 55;
  e[uid] = px;
  e[101 + uid] = py;
  e[202 + uid] = 0;
  e[303 + uid] = 0;
  e[606 + uid] = indexSeed % 8;
  e[1010 + uid] = 8; // authentic base movement speed (mo[15][8] = 8 ticks/tile cardinal, 11 diagonal)
  e[3737 + uid] = uid <= 5 ? 3 : 2; // authentic carry capacity per trip
  e[1414 + uid] = 18 + ((indexSeed * 5) % 20);
  e[1515 + uid] = uid === 1 ? 0 : indexSeed % 2;
  e[1919 + uid] = maxHp;
  e[6767 + uid] = maxHp;
  e[2020 + uid] = 82 + ((indexSeed * 3) % 15); // energy/rest (0..100)
  e[2121 + uid] = 80 + ((indexSeed * 5) % 16); // satiety/food (0..100)
  e[2222 + uid] = 0; // job badge (0=idle)
  e[3333 + uid] = -1; // thought bubble (-1=none)
  e[4444 + uid] = 0;
  e[4545 + uid] = 0;
  e[4646 + uid] = -1; // -1 = outside any building slot!
  e[2828 + uid] = 69;
  e[6464 + uid] = 69; // 69 = idle / no job hat equipped
  e[2929 + uid] = 8;
  e[3030 + uid] = 0;
  // Exact port of f.java:5368-5370: hair = 0..2 (NEVER 3, which is enemy pi9/03.png!), bodyStyle = 0..3
  const hairStyle = indexSeed % 3;
  const bodyStyle = Math.floor(indexSeed / 2) & 3;
  e[5151 + uid] = ((bodyStyle << 2) | hairStyle) & 0xff;
  e[6565 + uid] = owner === 1 ? indexSeed % 3 : 9; // enemy warriors spawn armed (club/stone/spear)
  e[7979 + uid] = 0;

  // Authentic Panel 4 fields: avatar portrait (f.java:5542 mo[189]), mood, skills & speed
  const m = data.mapTableData;
  const mo = data.mapTableOffsets;
  const fo = data.entityFieldOffsets;
  const sex = e[1515 + uid] & 1;
  const age = e[1414 + uid] & 0xff;
  const ageGroup = age < 12 ? 0 : age < 35 ? 1 : 2;
  const avBase = m?.[mo?.[189] + sex * 10 + ageGroup * 2] & 0xff;
  const avSpan = Math.max(1, m?.[mo?.[189] + sex * 10 + ageGroup * 2 + 1] & 0xff);
  e[2727 + uid] = (avBase + (indexSeed % avSpan)) & 0xff;
  e[505 + uid] = 85 + ((indexSeed * 3) % 12); // mood 0..100
  e[2525 + uid] = indexSeed % 2 === 0 ? 14 : 13; // combat skill 1 (melee/scout)
  e[2626 + uid] = indexSeed % 2 === 0 ? 13 : 14; // combat skill 2
  e[2323 + uid] = 8 + (indexSeed % 5); // civil skill 1
  e[2424 + uid] = 8 + ((indexSeed + 2) % 5); // civil skill 2
  if (fo) {
    e[fo[16] + uid] = 1 + (indexSeed % 3); // ranged skill
    e[fo[17] + uid] = 1 + ((indexSeed + 1) % 3); // melee skill
    for (let f = 69; f <= 75; f++) {
      e[fo[f] + uid] = 1 + ((indexSeed + f) % 3); // civil skills
    }
  }
  data.occupancy[py][px] = uid;

  if (owner === 0) {
    revealFog(data, px, py, 4);
  }
  return uid;
}

function spawnWildAnimal(data, kind, x, y, group) {
  const e = data.entityData;
  const m = data.mapTableData;
  const mo = data.mapTableOffsets;
  let aid = -1;
  for (let i = 0; i < 22; i++) {
    if ((e[9513 + i] & 0xff) === 0) {
      aid = i;
      break;
    }
  }
  if (aid === -1) return -1;

  const px = Math.max(1, Math.min(data.width - 2, x));
  const py = Math.max(1, Math.min(data.height - 2, y));
  e[9513 + aid] = (m[mo[180] + kind] & 0xff) || 20;
  e[9535 + aid] = kind;
  e[9645 + aid] = px;
  e[9359 + aid] = px;
  e[9667 + aid] = py;
  e[9381 + aid] = py;
  e[9403 + aid] = 0;
  e[9425 + aid] = 0;
  e[9491 + aid] = (aid * 3) % 8;
  e[9469 + aid] = group;
  e[9557 + aid] = m[mo[184] + kind] & 0xff;
  e[9579 + aid] = 0;
  if (data.occupancy[py][px] === 0) {
    data.occupancy[py][px] = 101 + aid;
  }
  return aid;
}

function cloneFirstMapSnapshot(baseData) {
  const cloned = {
    ...baseData,
    terrain: baseData.terrain.map((row) => row.slice()),
    occupancy: baseData.occupancy.map((row) => row.slice()),
    entityData: baseData.entityData.slice(),
    fogOfWar: baseData.fogOfWar.map((layer) => layer.map((word) => word.slice())),
    resources: baseData.resources.map((row) => row.slice()),
    entities: baseData.entities.map((ent) => ({ ...ent })),
  };
  // Normalize initial idle villagers: no stale thought bubbles, outside all building slots
  const e = cloned.entityData;
  for (let uid = 1; uid <= 50; uid++) {
    if ((e[1919 + uid] & 0xff) > 0) {
      e[2222 + uid] = 0;
      e[3333 + uid] = -1;
      e[4646 + uid] = -1;
      e[6464 + uid] = 69;
    }
  }
  return cloned;
}

export function captureTribeCarryover(data, res) {
  if (!data) return null;
  const e = data.entityData;
  const chiefId = data.resources?.[0]?.[17] ?? 1;
  const villagers = [];
  for (let id = 1; id <= 50; id++) {
    const hp = e[1919 + id] & 0xff;
    if (hp <= 0) continue;
    villagers.push({
      nameStyle: e[5151 + id] & 0xff,
      avatar: e[2727 + id] & 0xff,
      mood: e[505 + id] & 0xff,
      sex: e[1515 + id] & 0xff,
      age: Math.min(55, (e[1414 + id] & 0xff) + 1),
      maxHp: Math.max(40, e[6767 + id] & 0xff),
      weaponId: e[6565 + id] & 0xff,
      speed: (e[1010 + id] & 0xff) || 8,
      carryCap: (e[3737 + id] & 0xff) || 2,
      isChief: id === chiefId,
    });
  }
  return {
    villagers,
    bonusFood: Math.min(35, res?.food || 0),
    bonusWood: Math.min(50, res?.wood || 0),
    bonusStone: Math.min(40, res?.stone || 0),
    bonusBones: Math.min(25, res?.tools || 0),
  };
}

/**
 * Decode any of the 10 campaign scenarios directly from the original `/ma` binary
 * and `/a` lookup tables (port of f.java aN() & aP()).
 * Scenario 0 uses the verified FreeJ2ME settled snapshot by default.
 */
export function loadScenarioFromMa(baseData, maBytes, scenarioIndex, options = {}) {
  const { carryoverTribe = null, difficulty = null, abundantResources = false } = options;
  if (scenarioIndex === 0 || !maBytes) {
    const snap = cloneFirstMapSnapshot(baseData);
    if (difficulty) {
      snap.resources[0][0] = (snap.resources[0][0] || 0) + (difficulty.bonusFood || 0);
      snap.resources[0][1] = (snap.resources[0][1] || 0) + (difficulty.bonusWood || 0);
      snap.resources[0][2] = (snap.resources[0][2] || 0) + (difficulty.bonusStone || 0);
      snap.resources[0][3] = (snap.resources[0][3] || 0) + (difficulty.bonusBones || 0);
    }
    if (abundantResources) {
      snap.resources[0][0] += 60;
      snap.resources[0][1] += 60;
      snap.resources[0][2] += 60;
      snap.resources[0][3] += 40;
    }
    return snap;
  }

  const m = baseData.mapTableData;
  const mo = baseData.mapTableOffsets;
  const s9 = baseData.shortSpriteTables[9];
  const b16 = baseData.byteSpriteTables[16];

  const rawW = m[mo[149] + scenarioIndex * 2] & 0xff;
  const rawH = m[mo[149] + scenarioIndex * 2 + 1] & 0xff;
  const width = scenarioIndex === 5 ? rawW - 32 : rawW;
  const height = rawH;

  const terrain = Array.from({ length: height }, () => new Array(width).fill(0));
  const occupancy = Array.from({ length: height }, () => new Array(width).fill(0));
  const entityData = new Array(9983).fill(0);
  const fogOfWar = [
    Array.from({ length: 3 }, () => new Array(96).fill(0)),
    Array.from({ length: 3 }, () => new Array(96).fill(0)),
  ];
  const resources = [new Array(26).fill(0), new Array(26).fill(0)];
  resources[0][16] = 1;
  resources[0][17] = scenarioIndex === 3 ? 0 : 1;

  const data = {
    ...baseData,
    scenario: scenarioIndex,
    width,
    height,
    terrain,
    occupancy,
    entityData,
    fogOfWar,
    resources,
    entities: [],
  };

  // Decode RLE terrain from /ma (exact port of f.java:6202-6252 aN())
  const maIdx = m[mo[248] + scenarioIndex] & 0xff;
  const baseOffset = MA_OFFSETS[maIdx] || 0;
  let pos = 0;
  let runCode = 0;
  let runCount = 10;
  let curTile = 0;
  let rng = (scenarioIndex + 1) * 1337;

  for (let y = 0; y < rawH; y++) {
    for (let x = 0; x < rawW; x++) {
      if (runCount >= (m[mo[197] + runCode] & 0xff)) {
        curTile = maBytes[baseOffset + pos] & 0xff;
        pos++;
        if (curTile >= 250) {
          runCount = 0;
          runCode = curTile - 250;
          curTile = m[mo[197] + 6 + runCode] & 0xff;
        }
      }
      runCount++;
      let tile = curTile;
      if (tile <= 8) {
        rng = (rng * 1103515245 + 12345) & 0x7fffffff;
        tile += rng % 3;
      }

      if (y >= height || x >= width) continue;
      terrain[y][x] = tile;

      const blockedFlag = ((s9[tile] & 0xffff) >>> 13) & 1;
      if ((tile >= 175 || blockedFlag === 1) && occupancy[y][x] !== -127) {
        occupancy[y][x] = -126;
      } else if (occupancy[y][x] === -126) {
        occupancy[y][x] = 0;
      }

      if (scenarioIndex !== 3) {
        const subKind = ((b16[tile] & 0xffff) >>> 6) & 3;
        if (subKind === 2) {
          occupancy[y][x] = -125;
        }
        if (tile >= 180 && tile <= 231) {
          occupancy[y][x] = -124;
        } else if (tile >= 175 && tile <= 179) {
          const itemKind = tile - 175 + 1;
          spawnItemProp(data, itemKind, x, y, m[mo[110] + itemKind] & 0xff);
        }
      }
      if (y === 0 || y === height - 1 || x === width - 1) {
        occupancy[y][x] = -126;
      }
    }
  }

  // Mark fishing shoreline tiles (-127) adjacent to fish schools kind===5 (f.java:6242-6251)
  for (let y = 0; y < height; y++) {
    for (let x = 1; x < width - 1; x++) {
      const o = occupancy[y][x];
      if (o <= -61 && o >= -110 && entityData[9833 + (-o - 61)] === 5) {
        const leftT = terrain[y][x - 1] & 0xff;
        if (leftT === 33 || leftT === 34 || leftT === 37 || leftT === 38) occupancy[y][x - 1] = -127;
        const rightT = terrain[y][x + 1] & 0xff;
        if (rightT === 33 || rightT === 34 || rightT === 37 || rightT === 38) occupancy[y][x + 1] = -127;
      }
    }
  }

  // Spawn buildings, units, wild animals & resources (exact port of f.java:6275-6302 aP())
  const s = mo[250 + scenarioIndex];
  const count = m[mo[262] + scenarioIndex] & 0xff;
  let playerCount = 0;
  let firstPlayerUnit = 0;

  for (let i = 0; i < count; i++) {
    const c0 = m[s + i];
    if (c0 === -1) continue;
    const c1 = m[s + count + i];
    const c2 = m[s + 2 * count + i] & 0xff;
    const c3 = m[s + 3 * count + i] & 0xff;
    const c4 = m[s + 4 * count + i];

    if (c1 >= 0) {
      const owner = c0 === 0 ? 0 : 1;
      const stage = c4 > 0 ? c4 : 1;
      placeBuilding(data, c1, c2, c3, owner, stage);
    } else if (c1 === -1) {
      const owner = c0 & 1;
      const uid = spawnUnit(data, owner, c2, c3, i + 1);
      if (owner === 0 && uid > 0) {
        playerCount++;
        if (!firstPlayerUnit) firstPlayerUnit = uid;
      } else if (owner === 1 && uid > 0 && difficulty?.enemyHpScale && difficulty.enemyHpScale !== 1) {
        const scaledHp = Math.max(20, Math.min(200, Math.round((entityData[6767 + uid] & 0xff) * difficulty.enemyHpScale)));
        entityData[6767 + uid] = scaledHp;
        entityData[1919 + uid] = scaledHp;
      }
    } else if (c1 === -2) {
      spawnWildAnimal(data, 1, c2, c3, c0 & 0xff);
    }
  }

  // Starting resources (from mapTableOffsets[263])
  for (let r = 0; r < 11; r++) {
    const val = m[mo[263] + 11 * scenarioIndex * 2 + r] & 0xff;
    resources[0][r] = val;
  }
  if (resources[0][1] === 0 && scenarioIndex > 0) resources[0][1] = 20;
  if (resources[0][2] === 0 && scenarioIndex > 0) resources[0][2] = 10;
  if (carryoverTribe) {
    resources[0][0] += carryoverTribe.bonusFood || 0;
    resources[0][1] += carryoverTribe.bonusWood || 0;
    resources[0][2] += carryoverTribe.bonusStone || 0;
    resources[0][3] += carryoverTribe.bonusBones || 0;
  }
  if (difficulty) {
    resources[0][0] += difficulty.bonusFood || 0;
    resources[0][1] += difficulty.bonusWood || 0;
    resources[0][2] += difficulty.bonusStone || 0;
    resources[0][3] += difficulty.bonusBones || 0;
  }
  if (abundantResources) {
    resources[0][0] += 60;
    resources[0][1] += 60;
    resources[0][2] += 60;
    resources[0][3] += 40;
  }

  // Starting camera centered on scenario focus point (mapTableOffsets[150])
  const focusX = m[mo[150] + scenarioIndex * 2] & 0xff;
  const focusY = m[mo[150] + scenarioIndex * 2 + 1] & 0xff;

  // In missions 2..10, carry over the player's surviving tribe via void_b(), or deploy a starting tribe if jumping directly.
  if (playerCount === 0) {
    let campPlaced = false;
    for (let r = 0; r <= 6 && !campPlaced; r++) {
      for (let dy = -r; dy <= r && !campPlaced; dy++) {
        for (let dx = -r; dx <= r && !campPlaced; dx++) {
          if (canPlaceBuilding(data, 3, focusX + dx, focusY + dy)) {
            placeBuilding(data, 3, focusX + dx, focusY + dy, 0, 1);
            campPlaced = true;
          }
        }
      }
    }
    const carryList = carryoverTribe?.villagers?.length ? carryoverTribe.villagers.slice(0, 16) : null;
    const countToSpawn = carryList ? carryList.length : 6;
    for (let k = 0; k < countToSpawn; k++) {
      const uid = spawnUnit(data, 0, focusX + ((k % 4) - 1), focusY + Math.floor(k / 4) - 1, k + 1);
      if (uid > 0) {
        if (carryList) {
          const vet = carryList[k];
          entityData[5151 + uid] = vet.nameStyle;
          if (vet.avatar !== undefined) entityData[2727 + uid] = vet.avatar;
          if (vet.mood !== undefined) entityData[505 + uid] = vet.mood;
          entityData[1515 + uid] = vet.sex;
          entityData[1414 + uid] = vet.age;
          entityData[6767 + uid] = vet.maxHp;
          entityData[1919 + uid] = vet.maxHp;
          entityData[6565 + uid] = vet.weaponId;
          entityData[1010 + uid] = vet.speed;
          entityData[3737 + uid] = vet.carryCap;
          if (vet.isChief) resources[0][17] = uid;
        }
        playerCount++;
        if (!firstPlayerUnit) firstPlayerUnit = uid;
      }
    }
  } else if (carryoverTribe?.villagers?.length) {
    // Even if map pre-spawned a few player units (like Màn 4), upgrade them with carried-over weapons & HP
    let idx = 0;
    for (let uid = 1; uid <= 50 && idx < carryoverTribe.villagers.length; uid++) {
      if ((entityData[1919 + uid] & 0xff) <= 0) continue;
      const vet = carryoverTribe.villagers[idx++];
      entityData[5151 + uid] = vet.nameStyle;
      entityData[1515 + uid] = vet.sex;
      entityData[1414 + uid] = vet.age;
      entityData[6767 + uid] = vet.maxHp;
      entityData[1919 + uid] = vet.maxHp;
      entityData[6565 + uid] = vet.weaponId;
    }
  }
  resources[0][11] = playerCount;

  const cols = data.viewportColumns || 11;
  const rows = data.viewportRows || 18;
  data.cameraX = Math.max(0, Math.min(width - cols, focusX - Math.floor(cols / 2)));
  data.cameraY = Math.max(0, Math.min(height - rows, focusY - Math.floor(rows / 2)));
  data.cursorX = Math.max(0, Math.min(width - 1, focusX));
  data.cursorY = Math.max(0, Math.min(height - 1, focusY));
  data.hoverUnit = firstPlayerUnit || 1;
  revealFog(data, data.cursorX, data.cursorY, 5);

  return data;
}

export const MP_MAPS = [
  { scenarioIndex: 1, name: 'Trả thù (64×48 · Nhanh)' },
  { scenarioIndex: 2, name: 'Chạy trốn (64×80 · Vừa)' },
  { scenarioIndex: 5, name: 'Hồ rộng (64×96 · Đối đầu)' },
  { scenarioIndex: 7, name: 'Rừng dây leo (96×64 · Rộng)' },
  { scenarioIndex: 8, name: 'Tàn sát (80×80 · Chiến trường)' },
  { scenarioIndex: 9, name: 'Mảnh đất (96×48 · Hai bờ)' },
];

export function prepareMultiplayerMatch(baseData, maBytes, scenarioIndex = 1, localTribe = 0) {
  const data = loadScenarioFromMa(baseData, maBytes, scenarioIndex);
  const e = data.entityData;
  const w = data.width;
  const h = data.height;

  // 1. Discover opposite base anchors for Tribe 0 and Tribe 1 from the map's natural spawn areas
  let a0 = null;
  let a1 = null;
  for (let bid = 1; bid <= 30; bid++) {
    if ((e[8505 + bid] & 0xff) > 0) {
      a0 = { x: e[8383 + bid] & 0xff, y: e[8444 + bid] & 0xff };
      break;
    }
  }
  for (let bid = 31; bid <= 60; bid++) {
    if ((e[8505 + bid] & 0xff) > 0) {
      a1 = { x: e[8383 + bid] & 0xff, y: e[8444 + bid] & 0xff };
      break;
    }
  }
  if (!a0) a0 = { x: Math.max(5, Math.min(w - 10, data.cursorX || 8)), y: Math.max(5, Math.min(h - 10, data.cursorY || 8)) };
  if (!a1) a1 = { x: Math.max(5, Math.min(w - 10, w - 10)), y: Math.max(5, Math.min(h - 10, h - 10)) };

  // 2. Clear asymmetric campaign buildings & units so both sides start 100% fair and balanced
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const occ = data.occupancy[y][x];
      if ((occ >= 1 && occ <= 100) || (occ <= -1 && occ >= -60)) {
        data.occupancy[y][x] = 0;
      }
      data.fog[y][x] = 2; // reset fog of war
    }
  }
  for (let uid = 1; uid <= 100; uid++) {
    e[1919 + uid] = 0;
    e[4444 + uid] = 0;
    e[4545 + uid] = 0;
    e[4646 + uid] = -1;
    e[1313 + uid] = 0;
    e[3535 + uid] = 0;
    e[3636 + uid] = 0;
    e[7777 + uid] = 0;
  }
  for (let bid = 1; bid <= 60; bid++) {
    e[8505 + bid] = 0;
    e[8566 + bid] = 0;
    e[8627 + bid] = 0;
    e[8749 + bid] = 0;
    e[8993 + bid] = 0;
    e[9115 + bid] = 0;
    e[9237 + bid] = 0;
  }

  // Helper to clear a small building pad if trees/rocks obstruct starter placement
  const forcePlaceStarterBuilding = (bType, cx, cy, owner) => {
    const spec = getBuildingSpec(data, bType);
    for (let r = 0; r <= 7; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const bx = cx + dx;
          const by = cy + dy;
          if (bx < 2 || by < 2 || bx + spec.width >= w - 2 || by + spec.height >= h - 2) continue;
          let ok = true;
          for (let py = 0; py < spec.height && ok; py++) {
            for (let px = 0; px < spec.width && ok; px++) {
              const occ = data.occupancy[by + py][bx + px];
              const terr = data.terrain[by + py][bx + px] & 0xff;
              // Never overwrite another building or water/cliff
              if (occ < 0 && occ >= -60) ok = false;
              if (terr >= 232 && terr !== 243) ok = false;
              if (r < 4 && (occ !== 0 || terr >= 175)) ok = false;
            }
          }
          if (ok) {
            for (let py = 0; py < spec.height; py++) {
              for (let px = 0; px < spec.width; px++) {
                if (data.occupancy[by + py][bx + px] !== 0) data.occupancy[by + py][bx + px] = 0;
                if ((data.terrain[by + py][bx + px] & 0xff) >= 175) data.terrain[by + py][bx + px] = 0;
              }
            }
            return placeBuilding(data, bType, bx, by, owner, 1);
          }
        }
      }
    }
    return -1;
  };

  const setupTribe = (owner, anchor) => {
    const chiefBid = forcePlaceStarterBuilding(3, anchor.x, anchor.y, owner);
    const hutBid = forcePlaceStarterBuilding(2, anchor.x + 4, anchor.y + 1, owner);
    forcePlaceStarterBuilding(6, anchor.x - 4, anchor.y + 1, owner);

    const baseX = chiefBid > 0 ? (e[8383 + chiefBid] & 0xff) : anchor.x;
    const baseY = chiefBid > 0 ? (e[8444 + chiefBid] & 0xff) : anchor.y;

    let firstUid = 0;
    let count = 0;
    for (let k = 0; k < 8; k++) {
      const uid = spawnUnit(data, owner, baseX + (k % 4), baseY + 3 + Math.floor(k / 4), k + 1 + owner * 10);
      if (uid > 0) {
        e[1515 + uid] = k % 2; // balanced 4 males + 4 females
        e[1414 + uid] = 20 + (k % 8);
        e[6767 + uid] = 42;
        e[1919 + uid] = 42;
        e[2020 + uid] = 100;
        e[2121 + uid] = 100;
        e[505 + uid] = 95;
        if (!firstUid) firstUid = uid;
        count++;
      }
    }
    if (!data.resources[owner]) data.resources[owner] = new Array(26).fill(0);
    data.resources[owner].fill(0);
    data.resources[owner][0] = 20; // Food
    data.resources[owner][1] = 30; // Wood
    data.resources[owner][2] = 20; // Stone
    data.resources[owner][3] = 5;  // Bones
    data.resources[owner][11] = count;
    data.resources[owner][16] = hutBid > 0 ? 12 : 6;
    data.resources[owner][17] = firstUid || (owner === 0 ? 1 : 51);
    return { baseX, baseY, firstUid };
  };

  const t0 = setupTribe(0, a0);
  const t1 = setupTribe(1, a1);
  data.mpBases = [t0, t1];

  // Reveal fog of war ONLY for localTribe's own base & units
  const myBase = localTribe === 1 ? t1 : t0;
  revealFog(data, myBase.baseX + 1, myBase.baseY + 1, 8);
  const startU = localTribe === 1 ? 51 : 1;
  const endU = localTribe === 1 ? 100 : 50;
  for (let uid = startU; uid <= endU; uid++) {
    if ((e[1919 + uid] & 0xff) > 0) {
      revealFog(data, e[uid] & 0xff, e[101 + uid] & 0xff, 5);
    }
  }

  const cols = data.viewportColumns || 16;
  const rows = data.viewportRows || 18;
  data.cameraX = Math.max(0, Math.min(w - cols, myBase.baseX - Math.floor(cols / 2)));
  data.cameraY = Math.max(0, Math.min(h - rows, myBase.baseY - Math.floor(rows / 2)));
  data.cursorX = Math.max(0, Math.min(w - 1, myBase.baseX));
  data.cursorY = Math.max(0, Math.min(h - 1, myBase.baseY));
  data.hoverUnit = myBase.firstUid;
  return data;
}
