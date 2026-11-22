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
};

/** Trạng thái khởi đầu sau boot. */
export function newGame() {
  return { state: STATES.SPLASH, menuIndex: 0, text: null, tick: 0 };
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

/** Tra chuỗi từ dữ liệu en.json (đã fetch) theo chỉ dẫn TXT. */
export function text(textData, ref) {
  if (!textData) return '';
  const page = textData[`page_${ref.page}`] || {};
  if (Array.isArray(ref.idx)) return ref.idx.map((i) => page[i] || '').join('\n');
  return page[ref.idx] || '';
}
