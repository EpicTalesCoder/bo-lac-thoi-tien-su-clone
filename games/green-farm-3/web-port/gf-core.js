/**
 * Green Farm 3 — core mô phỏng thuần (không DOM), Phase B runtime shell.
 * Port từ logic J2ME gốc (a.java/f.java decompiled). Tick 120ms như MIDP.
 * Mọi hàm pure để chạy test Node — game.js chỉ render/input/audio.
 */

export const SCREEN_W = 240;
export const SCREEN_H = 320;
export const TICK_MS = 120;

/* ---------- MIDP keycodes (javax.microedition.lcdui.Canvas) ---------- */
export const KEY = {
  UP: -1, DOWN: -2, LEFT: -3, RIGHT: -4,
  FIRE: -5, SK_LEFT: -6, SK_RIGHT: -7,
};

/** Map phím browser -> keycode MIDP. */
export function mapKeyCode(code, key) {
  switch (code) {
    case 'ArrowUp': case 'KeyW': return KEY.UP;
    case 'ArrowDown': case 'KeyS': return KEY.DOWN;
    case 'ArrowLeft': case 'KeyA': return KEY.LEFT;
    case 'ArrowRight': case 'KeyD': return KEY.RIGHT;
    case 'Enter': case 'Space': return KEY.FIRE;
    case 'KeyQ': return KEY.SK_LEFT;
    case 'KeyE': return KEY.SK_RIGHT;
    case 'Escape': case 'Backspace': return KEY.SK_RIGHT;
    default: {
      if (/^Digit[0-9]$/.test(code || '')) return parseInt(code.slice(5), 10);
      if (key === '5') return 5;
      return null;
    }
  }
}

/* ---------- text ids (games/green-farm-3/web-port/assets/text/en.json) ---------- */
export const TXT = {
  WELCOME: { page: 0, idx: 2 },        // 'Chào mừng!'
  INTRO: { page: 0, idx: [0, 1, 3, 4, 5, 6, 7] }, // lời thoại mở đầu
  CONTINUE: { page: 0, idx: 69 },      // 'CHƠI TIẾP'
  ABOUT: { page: 0, idx: 68 },         // 'GIỚI THIỆU'
  HELP: { page: 0, idx: 80 },          // 'TRỢ GIÚP'
  OPTIONS: { page: 0, idx: 65 },       // 'TÙY CHỌN'
  EXIT: { page: 0, idx: 72 },          // 'THOÁT'
  BACK: { page: 0, idx: 75 },          // 'QUAY VỀ'
  EXIT_CONFIRM: { page: 0, idx: 74 },  // 'Bạn muốn ngừng chơi…'
};

/* ---------- menu chính ---------- */
export const MENU_ITEMS = [
  { id: 'continue', label: TXT.CONTINUE },
  { id: 'about', label: TXT.ABOUT },
  { id: 'help', label: TXT.HELP },
  { id: 'options', label: TXT.OPTIONS },
  { id: 'exit', label: TXT.EXIT },
];

export const STATES = {
  SPLASH: 'splash',
  MENU: 'menu',
  ABOUT: 'about',
  HELP: 'help',
  OPTIONS: 'options',
  EXIT_CONFIRM: 'exitConfirm',
  FARM: 'farm',
  SHOP: 'shop',
};

/** Trạng thái khởi đầu sau boot. */
export function newGame() {
  return { state: STATES.SPLASH, menuIndex: 0, text: null, tick: 0, farm: null };
}

/**
 * Xử lý 1 phím MIDP trong trạng thái hiện tại → trạng thái mới.
 * Pure: trả về object trạng thái mới, không mutate.
 */
export function handleKey(g, midpKey) {
  const s = { ...g, menuIndex: g.menuIndex };

  if (s.state === STATES.SPLASH) {
    // mọi phím (kể cả 5/FIRE) đưa vào menu — như bản gốc bấm để skip intro
    s.state = STATES.MENU;
    s.menuIndex = 0;
    return s;
  }

  if (s.state === STATES.MENU) {
    const n = MENU_ITEMS.length;
    if (midpKey === KEY.UP) { s.menuIndex = (s.menuIndex + n - 1) % n; return s; }
    if (midpKey === KEY.DOWN) { s.menuIndex = (s.menuIndex + 1) % n; return s; }
    if (midpKey === KEY.FIRE || midpKey === 5 || midpKey === KEY.SK_RIGHT) {
      return openMenuItem(s);
    }
    return s;
  }

  // các màn phụ (about/help/options/exitConfirm): FIRE hoặc phím mềm quay lại menu
  if (midpKey === KEY.FIRE || midpKey === 5 || midpKey === KEY.SK_RIGHT || midpKey === KEY.SK_LEFT) {
    s.state = STATES.MENU;
    return s;
  }
  return s;
}

function openMenuItem(s) {
  const id = MENU_ITEMS[s.menuIndex].id;
  switch (id) {
    case 'continue': s.state = STATES.FARM; return s;   // Phase C sẽ dựng farm thật
    case 'about': s.state = STATES.ABOUT; return s;
    case 'help': s.state = STATES.HELP; return s;
    case 'options': s.state = STATES.OPTIONS; return s;
    case 'exit': s.state = STATES.EXIT_CONFIRM; return s;
    default: return s;
  }
}

/** Click canvas (toạ độ CSS đã scale về 240×320) → phím MIDP tương ứng theo state. */
export function pointerToKey(g, x, y) {
  if (g.state === STATES.SPLASH) return KEY.FIRE;
  if (g.state === STATES.MENU) {
    const row = menuRowAt(y);
    if (row === -1) return null;
    if (row === g.menuIndex) return KEY.FIRE;
    return row > g.menuIndex ? KEY.DOWN : KEY.UP;
  }
  return KEY.SK_RIGHT; // màn phụ: bấm để quay lại
}

/** Hàng menu tại toạ độ y canvas (menu vẽ từ y=150, mỗi hàng 20px). */
export function menuRowAt(y) {
  const first = 150, rowH = 20, n = MENU_ITEMS.length;
  if (y < first - 6 || y > first + rowH * n) return -1;
  const row = Math.floor((y - first + 6) / rowH);
  return row >= 0 && row < n ? row : -1;
}

/** Bước mô phỏng 1 tick 120ms (đếm tick cho hiệu ứng nhấp nháy con trỏ). */
export function stepTick(g) {
  return { ...g, tick: g.tick + 1 };
}

/* ================= PHASE C — nông trại ================= */

export const GRID_N = 4;                 // 4×4 = 16 ô đất
export const PLOTS = GRID_N * GRID_N;

/** 4 cây trồng — nhãn lấy từ text gốc (page_1), kinh tế tự cân đối. */
export const CROPS = [
  { id: 'wheat', cost: 10, sell: 18, growMs: 60000, seedCost: 10, nameRef: { page: 1, idx: 116 } },   // Trồng Lúa mì
  { id: 'lettuce', cost: 15, sell: 28, growMs: 90000, seedCost: 15, nameRef: { page: 1, idx: 136 } }, // Xà lách
  { id: 'lemon', cost: 25, sell: 45, growMs: 150000, seedCost: 25, nameRef: { page: 1, idx: 143 } },  // Cây chanh vàng
  { id: 'apple', cost: 40, sell: 75, growMs: 240000, seedCost: 40, nameRef: { page: 1, idx: 108 } },  // Trồng Cây táo
];

export const START_COINS = 50;
export const SAVE_KEY = 'gf3_save_farm1';

export const PLOT_EMPTY = 'empty';
export const PLOT_GROWING = 'growing';
export const PLOT_READY = 'ready';

/** Farm state khởi tạo. */
export function newFarm() {
  return {
    coins: START_COINS,
    inv: { wheat: 0, lettuce: 0, lemon: 0, apple: 0 },
    plots: Array(PLOTS).fill(null),   // null | {crop, plantedAt, wateredAt}
    selectedCrop: 0,
  };
}

/** Trạng thái ô đất tại thời điểm now (derived, không mutate). */
export function plotState(plot, now) {
  if (!plot) return PLOT_EMPTY;
  if (plot.wateredAt != null && now - plot.wateredAt >= CROPS.find((c) => c.id === plot.crop).growMs) {
    return PLOT_READY;
  }
  return PLOT_GROWING;
}

/**
 * Trồng tại ô i. Trả về {farm, error} — error: 'occupied' | 'no_coins'.
 */
export function plantAt(farm, i, now) {
  if (farm.plots[i]) return { farm, error: 'occupied' };
  const crop = CROPS[farm.selectedCrop];
  if (farm.coins < crop.cost) return { farm, error: 'no_coins' };
  const plots = farm.plots.slice();
  plots[i] = { crop: crop.id, plantedAt: now, wateredAt: null };
  return { farm: { ...farm, plots, coins: farm.coins - crop.cost }, error: null };
}

/** Tưới tại ô i (chỉ ô đã trồng chưa tưới). */
export function waterAt(farm, i, now) {
  const plot = farm.plots[i];
  if (!plot || plot.wateredAt != null) return { farm, error: 'not_plantable' };
  const plots = farm.plots.slice();
  plots[i] = { ...plot, wateredAt: now };
  return { farm: { ...farm, plots }, error: null };
}

/** Gặt tại ô i → cộng kho. error: 'empty' | 'not_ready'. */
export function harvestAt(farm, i, now) {
  const plot = farm.plots[i];
  if (!plot) return { farm, error: 'empty' };
  if (plotState(plot, now) !== PLOT_READY) return { farm, error: 'not_ready' };
  const inv = { ...farm.inv, [plot.crop]: (farm.inv[plot.crop] || 0) + 1 };
  const plots = farm.plots.slice();
  plots[i] = null;
  return { farm: { ...farm, plots, inv }, error: null, crop: plot.crop };
}

/** Bán toàn bộ kho ở Quầy hàng → coins. */
export function sellAll(farm) {
  let coins = farm.coins;
  for (const crop of CROPS) coins += (farm.inv[crop.id] || 0) * crop.sell;
  return { ...farm, coins, inv: { wheat: 0, lettuce: 0, lemon: 0, apple: 0 } };
}

/** Toạ độ canvas 240×320 → index ô đất (grid bắt đầu x=36,y=70, cell 36, gap 4). */
export function plotIndexAt(x, y) {
  const gx = (SCREEN_W - GRID_N * 36) / 2, gy = 70, cell = 36;
  const c = Math.floor((x - gx) / cell), r = Math.floor((y - gy) / cell);
  if (c < 0 || r < 0 || c >= GRID_N || r >= GRID_N) return -1;
  // loại điểm rơi vào khoảng gap
  if ((x - gx) % cell > cell - 4 || (y - gy) % cell > cell - 4) return -1;
  return r * GRID_N + c;
}

/** Toolbar hạt giống: hàng y≈272, mỗi ô 52px từ x=12 → index crop. */
export function toolbarIndexAt(x, y) {
  if (y < 260 || y > 292) return -1;
  const c = Math.floor((x - 12) / 52);
  return c >= 0 && c < CROPS.length ? c : -1;
}

/** Hành động ngữ cảnh khi chạm ô i: trồng → tưới → gặt. */
export function farmTap(farm, i, now) {
  const st = plotState(farm.plots[i], now);
  if (st === PLOT_EMPTY) return plantAt(farm, i, now);
  if (st === PLOT_READY) return harvestAt(farm, i, now);
  if (farm.plots[i].wateredAt == null) return waterAt(farm, i, now);
  return { farm, error: null }; // đang lớn, không làm gì
}

/* ---------- save/load (serializer pure; localStorage ở game.js) ---------- */
export function serializeFarm(farm) {
  return JSON.stringify({ v: 1, coins: farm.coins, inv: farm.inv, plots: farm.plots, selectedCrop: farm.selectedCrop });
}

export function deserializeFarm(json) {
  try {
    const d = JSON.parse(json);
    if (d && d.v === 1 && Array.isArray(d.plots) && d.plots.length === PLOTS
        && typeof d.coins === 'number' && d.coins >= 0 && d.inv) {
      return {
        coins: d.coins,
        inv: { wheat: d.inv.wheat || 0, lettuce: d.inv.lettuce || 0, lemon: d.inv.lemon || 0, apple: d.inv.apple || 0 },
        plots: d.plots.map((p) => (p && CROPS.some((c) => c.id === p.crop))
          ? { crop: p.crop, plantedAt: Number(p.plantedAt) || 0, wateredAt: p.wateredAt != null ? Number(p.wateredAt) : null }
          : null),
        selectedCrop: (d.selectedCrop >= 0 && d.selectedCrop < CROPS.length) ? d.selectedCrop : 0,
      };
    }
  } catch (e) { /* corrupt → fresh */ }
  return null;
}

/** Tra chuỗi từ dữ liệu en.json (đã fetch) theo chỉ dẫn TXT. */
export function text(textData, ref) {
  if (!textData) return '';
  const page = textData[`page_${ref.page}`] || {};
  if (Array.isArray(ref.idx)) return ref.idx.map((i) => page[i] || '').join('\n');
  return page[ref.idx] || '';
}
