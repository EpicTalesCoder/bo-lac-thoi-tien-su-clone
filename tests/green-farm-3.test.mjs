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

/* ================= Phase C: nông trại ================= */

const NOW = 1_000_000_000;

test('CROPS: 4 cây, nhãn trỏ vào text gốc tồn tại, kinh tế có lãi', () => {
  const data = JSON.parse(readFileSync(path.join(PORT, 'assets', 'text', 'en.json'), 'utf8'));
  assert.equal(core.CROPS.length, 4);
  const ids = core.CROPS.map((c) => c.id);
  assert.deepEqual(ids, ['wheat', 'lettuce', 'lemon', 'apple']);
  for (const c of core.CROPS) {
    assert.ok(core.text(data, c.nameRef).length > 0, `label ${c.id}`);
    assert.ok(c.growMs >= 60000, 'grow ít nhất 60s');
    assert.ok(c.sell > c.cost, `${c.id} phải có lãi`);
  }
});

test('farm: trồng trừ xu, tưới, chờ đủ growMs thì chín, gặt cộng kho', () => {
  let farm = core.newFarm();
  assert.equal(farm.coins, core.START_COINS);
  // trồng lúa mì ở ô 0
  let res = core.plantAt(farm, 0, NOW);
  assert.equal(res.error, null);
  assert.equal(res.farm.coins, core.START_COINS - 10);
  assert.equal(res.farm.plots[0].crop, 'wheat');
  // trồng đè ô đã có -> lỗi
  res = core.plantAt(res.farm, 0, NOW);
  assert.equal(res.error, 'occupied');
  // chưa tưới: chưa chín
  assert.equal(core.plotState(res.farm.plots[0], NOW + 999999), core.PLOT_GROWING);
  // tưới
  res = core.waterAt(res.farm, 0, NOW);
  assert.equal(res.error, null);
  assert.equal(res.farm.plots[0].wateredAt, NOW);
  // chưa đủ thời gian -> growing
  assert.equal(core.plotState(res.farm.plots[0], NOW + 59999), core.PLOT_GROWING);
  // gặt non -> lỗi
  res = core.harvestAt(res.farm, 0, NOW + 59999);
  assert.equal(res.error, 'not_ready');
  // đủ 60s -> ready -> gặt
  assert.equal(core.plotState(res.farm.plots[0], NOW + 60000), core.PLOT_READY);
  res = core.harvestAt(res.farm, 0, NOW + 60000);
  assert.equal(res.error, null);
  assert.equal(res.farm.inv.wheat, 1);
  assert.equal(res.farm.plots[0], null);
});

test('farm: không đủ xu -> no_coins; farmTap context đúng thứ tự', () => {
  let farm = { ...core.newFarm(), coins: 5 };
  const res = core.plantAt(farm, 3, NOW);
  assert.equal(res.error, 'no_coins');
  // farmTap: trống -> trồng
  farm = core.newFarm();
  let r = core.farmTap(farm, 5, NOW);
  assert.equal(r.error, null);
  assert.equal(r.farm.plots[5].crop, 'wheat');
  // farmTap: trồng rồi -> tưới
  r = core.farmTap(r.farm, 5, NOW);
  assert.equal(r.farm.plots[5].wateredAt, NOW);
  // farmTap: đang lớn -> không làm gì
  const r2 = core.farmTap(r.farm, 5, NOW + 1000);
  assert.equal(r2.farm, r.farm);
});

test('sellAll: bán hết kho -> coins, kho về 0', () => {
  let farm = core.newFarm();
  farm = { ...farm, inv: { wheat: 3, lettuce: 2, lemon: 1, apple: 0 } };
  const before = farm.coins;
  const out = core.sellAll(farm);
  assert.equal(out.coins, before + 3 * 18 + 2 * 28 + 1 * 45);
  assert.deepEqual([out.inv.wheat, out.inv.lettuce, out.inv.lemon, out.inv.apple], [0, 0, 0, 0]);
});

test('save/load: round-trip khít, corrupt -> fallback null, plot lạ -> null', () => {
  let farm = core.newFarm();
  const r = core.plantAt(farm, 2, NOW);
  farm = core.waterAt(r.farm, 2, NOW).farm;
  farm = { ...farm, selectedCrop: 2 };
  const json = core.serializeFarm(farm);
  const back = core.deserializeFarm(json);
  assert.equal(back.coins, farm.coins);
  assert.equal(back.selectedCrop, 2);
  assert.equal(back.plots[2].crop, 'wheat');
  assert.equal(back.plots[2].wateredAt, NOW);
  assert.equal(back.plots[0], null);
  assert.equal(core.deserializeFarm('{corrupt!!'), null);
  assert.equal(core.deserializeFarm('{"v":9}'), null);
  // plot với crop lạ bị neutralise
  const weird = core.deserializeFarm(JSON.stringify({ v: 1, coins: 10, inv: {}, plots: [{ crop: 'bomb' }, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null] }));
  assert.equal(weird.plots[0], null);
});

test('plotIndexAt/toolbarIndexAt: toạ độ canvas -> ô đúng', () => {
  const gx = (240 - 4 * 36) / 2; // 48
  assert.equal(core.plotIndexAt(gx + 10, 70 + 10), 0);
  assert.equal(core.plotIndexAt(gx + 36 + 10, 70 + 46 + 10), 5); // hàng 1, cột 1
  assert.equal(core.plotIndexAt(5, 5), -1);
  assert.equal(core.plotIndexAt(gx + 33, 75), -1); // rơi vào gap
  assert.equal(core.toolbarIndexAt(20, 270), 0);
  assert.equal(core.toolbarIndexAt(60, 270), 0); // gap 52..64 vẫn ô 0? không: 60-12=48 -> ô 0
  assert.equal(core.toolbarIndexAt(70, 270), 1);
  assert.equal(core.toolbarIndexAt(70, 100), -1); // ngoài hàng toolbar
});
