/**
 * Test Green Farm 3 web port — Phase B runtime shell.
 * node --test tests/green-farm-3.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, accessSync, constants, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = path.join(ROOT, 'games', 'green-farm-3', 'web-port');

const core = await import('file://' + path.join(PORT, 'gf-core.js'));

/* ---------- keymap ---------- */
test('mapKeyCode: mũi tên/WASD -> MIDP, digit -> số, lạ -> null', () => {
  assert.equal(core.mapKeyCode('ArrowUp'), -1);
  assert.equal(core.mapKeyCode('KeyS'), -2);
  assert.equal(core.mapKeyCode('KeyA'), -3);
  assert.equal(core.mapKeyCode('KeyD'), -4);
  assert.equal(core.mapKeyCode('Enter'), -5);
  assert.equal(core.mapKeyCode('Escape'), -7);
  assert.equal(core.mapKeyCode('Digit5'), 5);
  assert.equal(core.mapKeyCode('F1', 'F1'), null);
});

/* ---------- luồng state ---------- */
test('boot: khởi tạo ở SPLASH, phím bất kỳ -> MENU', () => {
  let g = core.newGame();
  assert.equal(g.state, core.STATES.SPLASH);
  g = core.handleKey(g, core.KEY.FIRE);
  assert.equal(g.state, core.STATES.MENU);
  assert.equal(g.menuIndex, 0);
  // trong menu thì FIRE chọn item, không quay về splash
  assert.equal(core.handleKey(g, core.KEY.FIRE).state, core.STATES.FARM); // item đầu = CHƠI TIẾP
});

test('menu: lên/xuống wrap quanh 5 mục, thứ tự đúng nhãn text', () => {
  const n = core.MENU_ITEMS.length;
  assert.equal(n, 5);
  let g = { state: core.STATES.MENU, menuIndex: 0, tick: 0 };
  g = core.handleKey(g, core.KEY.UP);
  assert.equal(g.menuIndex, n - 1); // wrap lên cuối = THOÁT
  g = core.handleKey(g, core.KEY.DOWN);
  assert.equal(g.menuIndex, 0);
  g = core.handleKey(g, core.KEY.DOWN);
  assert.equal(g.menuIndex, 1);
  assert.equal(core.MENU_ITEMS[1].id, 'about');
});

test('mở từng item menu -> đúng màn phụ, phím mềm quay về MENU', () => {
  const expect = { about: 'about', help: 'help', options: 'options', exit: 'exitConfirm' };
  core.MENU_ITEMS.forEach((item, i) => {
    let g = { state: core.STATES.MENU, menuIndex: i, tick: 0 };
    g = core.handleKey(g, core.KEY.FIRE);
    assert.equal(g.state, expect[item.id] || g.state, item.id);
    g = core.handleKey(g, core.KEY.SK_RIGHT);
    assert.equal(g.state, core.STATES.MENU, item.id + ' back');
  });
});

test('handleKey không mutate trạng thái cũ (pure)', () => {
  const g = { state: core.STATES.MENU, menuIndex: 0, tick: 0 };
  const g2 = core.handleKey(g, core.KEY.DOWN);
  assert.equal(g.menuIndex, 0);
  assert.equal(g2.menuIndex, 1);
  assert.notEqual(g, g2);
});

/* ---------- pointer ---------- */
test('menuRowAt: y=150 -> hàng 0, ngoài vùng -> -1, click hàng đang chọn = FIRE', () => {
  assert.equal(core.menuRowAt(150), 0);
  assert.equal(core.menuRowAt(170), 1);
  assert.equal(core.menuRowAt(10), -1);
  const g = { state: core.STATES.MENU, menuIndex: 0, tick: 0 };
  assert.equal(core.pointerToKey(g, 120, 150), core.KEY.FIRE);
  assert.equal(core.pointerToKey(g, 120, 170), core.KEY.DOWN);
  assert.equal(core.pointerToKey(g, 120, 20), null); // ngoài vùng menu: no-op
  assert.equal(core.pointerToKey({ state: core.STATES.SPLASH }, 0, 0), core.KEY.FIRE);
});

/* ---------- tick ---------- */
test('stepTick tăng tick, pure', () => {
  const g = { state: core.STATES.MENU, menuIndex: 0, tick: 7 };
  const g2 = core.stepTick(g);
  assert.equal(g.tick, 7);
  assert.equal(g2.tick, 8);
});

/* ---------- text + assets ---------- */
test('en.json: 12 trang, các nhãn menu tồn tại đúng id', () => {
  const data = JSON.parse(readFileSync(path.join(PORT, 'assets', 'text', 'en.json'), 'utf8'));
  const pages = Object.keys(data).filter((k) => k.startsWith('page_'));
  assert.equal(pages.length, 12);
  const p0 = data.page_0;
  assert.equal(p0[core.TXT.CONTINUE.idx], 'CHƠI TIẾP');
  assert.equal(p0[core.TXT.HELP.idx], 'TRỢ GIÚP');
  assert.equal(p0[core.TXT.OPTIONS.idx], 'TÙY CHỌN');
  assert.equal(p0[core.TXT.EXIT.idx], 'THOÁT');
  assert.equal(p0[core.TXT.WELCOME.idx], 'Chào mừng!');
  // hàm text() tra đúng
  assert.equal(core.text(data, core.TXT.EXIT), 'THOÁT');
  assert.ok(core.text(data, { page: 0, idx: [0, 1] }).includes('\n'));
  assert.equal(core.text(null, core.TXT.EXIT), '');
});

test('sprites khai báo trong game.js tồn tại trên đĩa', () => {
  const src = readFileSync(path.join(PORT, 'game.js'), 'utf8');
  const m = src.match(/const SPRITES = \{([\s\S]*?)\};/);
  assert.ok(m, 'SPRITES block');
  const paths = [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
  assert.ok(paths.length >= 3, 'ít nhất 3 sprite');
  for (const p of paths) {
    accessSync(path.join(PORT, p), constants.R_OK);
  }
});

test('assets audio + sprite packs còn nguyên từ Phase A', () => {
  const audio = readdirSync(path.join(PORT, 'assets', 'audio'));
  assert.ok(audio.length === 55, `55 audio, thấy ${audio.length}`);
  const spritesDir = path.join(PORT, 'assets', 'sprites');
  const packs = readdirSync(spritesDir);
  assert.deepEqual(packs.sort(), ['pack11', 'pack2', 'pack5', 'pack7', 'pack8']);
});
