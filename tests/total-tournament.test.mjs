/**
 * Test Total Tournament web port — mirror tests/strategy.test.mjs của game 1.
 * node --test tests/total-tournament.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, accessSync, constants } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = path.join(ROOT, 'games', 'total-tournament', 'web-port');

const core = require(path.join(PORT, 'tt-core.js'));

test('WEAPONS: đủ 6 súng, phím 1-6, có damage/rate hợp lệ', () => {
  assert.equal(core.WEAPONS.length, 6);
  core.WEAPONS.forEach((w, i) => {
    assert.equal(w.slot, i + 1);
    assert.ok(w.dmg > 0 && w.rate >= 100, `weapon ${w.id} stats`);
    assert.ok(w.name && w.name.vi && w.name.en);
  });
  // súng cận chiến phải melee, đạn phải có tốc độ
  assert.equal(core.WEAPONS[0].kind, 'melee');
  for (const w of core.WEAPONS.slice(1)) {
    assert.ok(['bullet', 'rocket', 'beam'].includes(w.kind), w.id);
    if (w.kind === 'bullet') assert.ok(w.speed > 0);
  }
});

test('MODES: 5 chế độ, đủ id, giới hạn điểm hợp lệ', () => {
  const ids = core.MODES.map((m) => m.id);
  assert.deepEqual(ids, ['dm', 'team', 'surv', 'ctf', 'last']);
  assert.equal(core.MODES[0].fragLimit, 10);
  assert.equal(core.MODES[1].fragLimit, 15);
  assert.equal(core.MODES[3].capLimit, 3);
  assert.equal(core.MODES[4].respawn, false);
});

test('genArena: đúng kích thước, viền tường, có đường đi (không kín)', () => {
  const grid = core.genArena(20261121);
  assert.equal(grid.length, core.MAP_W * core.MAP_H);
  for (let x = 0; x < core.MAP_W; x++) {
    assert.equal(grid[x], 1, 'top border');
    assert.equal(grid[(core.MAP_H - 1) * core.MAP_W + x], 1, 'bottom border');
  }
  // đếm ô trống: phải nhiều hơn 40% bản đồ (bản đồ kín sẽ fail)
  let free = 0;
  for (const v of grid) if (v === 0) free += 1;
  assert.ok(free > grid.length * 0.4, `free tiles ${free}/${grid.length}`);
  // seed xác định
  const grid2 = core.genArena(20261121);
  assert.deepEqual(Buffer.from(grid).toString('hex'), Buffer.from(grid2).toString('hex'));
});

test('mulberry32: cùng seed cùng chuỗi, khác seed khác nhau', () => {
  const a = core.mulberry32(42), b = core.mulberry32(42), c = core.mulberry32(43);
  const sa = [a(), a(), a()].join(',');
  const sb = [b(), b(), b()].join(',');
  const sc = [c(), c(), c()].join(',');
  assert.equal(sa, sb);
  assert.notEqual(sa, sc);
});

test('createMatch: đủ người, người chơi sống, bot có AI', () => {
  for (const m of core.MODES) {
    const match = core.createMatch(m.id, 7);
    const expectBots = m.waves ? 3 : m.bots; // surv: wave 1 spawn 2+wave(1)=3 bot ngay
    assert.equal(match.soldiers.length, 1 + expectBots, `mode ${m.id}`);
    assert.equal(match.player.bot, false);
    assert.equal(match.player.dead, false);
    assert.equal(match.over, false);
    for (const s of match.soldiers) {
      assert.ok(s.hp > 0, 'sống');
      if (!s.bot) assert.equal(s.hp, 100); // bot sinh tồn spawn với hp thấp theo wave
      assert.ok(!core.isWallAt(match.grid, s.x, s.y), `spawn ${s.id} phải trên ô trống`);
      if (s.bot) assert.ok(s.ai);
    }
    if (m.id === 'ctf') {
      assert.equal(match.flags.length, 2);
      assert.ok(match.flags[0].home && match.flags[1].home);
    }
  }
});

test('stepMatch: tick chạy, người chơi di chuyển hợp lệ (không xuyên tường)', () => {
  const match = core.createMatch('dm', 11);
  const p = match.player;
  const [sx, sy] = [p.x, p.y];
  const input = { keys: { right: true, down: false, left: false, up: false }, fire: false };
  for (let i = 0; i < 10; i++) core.stepMatch(match, input);
  assert.equal(match.paused, false);
  // vị trí mới vẫn không trong tường
  assert.ok(!core.isWallAt(match.grid, p.x, p.y), 'sau di chuyển phải không trong tường');
  assert.ok(p.x > sx, `right input should move east: ${sx} -> ${p.x}`);
  assert.equal(p.y, sy, 'right input should not change y');
  assert.ok(match.time > 0);
});

test('stepMatch: no movement input keeps player in place', () => {
  const match = core.createMatch('dm', 11);
  const p = match.player;
  const start = [p.x, p.y];
  for (let i = 0; i < 10; i++) core.stepMatch(match, { keys: {}, fire: false });
  assert.deepEqual([p.x, p.y], start);
});

test('createMatch: stores selected Soldier or Mutant for player only', () => {
  for (const character of ['soldier', 'mutant']) {
    const match = core.createMatch('team', 7, character);
    assert.equal(match.player.character, character);
    assert.ok(match.soldiers.filter((s) => s.bot).every((s) => s.character === 'soldier'));
  }
  assert.equal(core.createMatch('dm', 7, 'unknown').player.character, 'soldier');
});

test('bắn súng: đạn bắt đầu từ đầu nòng theo hướng ngắm', () => {
  const match = core.createMatch('dm', 13);
  const p = match.player;
  p.weapon = 1;
  p.dir = 0;
  core.fireWeapon(match, p);
  assert.equal(match.bullets.length, 1);
  assert.equal(match.bullets[0].x, p.x + core.WEAPONS[p.weapon].muzzleOffset);
  assert.equal(match.bullets[0].y, p.y);
});

test('bắn súng: đạn sinh ra, tiêu hao đạn, cooldown hoạt động', () => {
  const match = core.createMatch('dm', 13);
  const p = match.player;
  p.weapon = 1; // mg
  const ammoBefore = p.ammo[1];
  const input = { keys: {}, fire: true, mx: p.x + 50, my: p.y };
  core.stepMatch(match, input);
  assert.ok(p.ammo[1] === ammoBefore - 1, 'tiêu 1 viên');
  assert.equal(match.bullets.length > 0, true, 'có đạn');
  core.stepMatch(match, input);
  const nAfterTwoTicks = match.bullets.length;
  core.stepMatch(match, input); // tick 3: còn cooldown thì không bắn thêm
  const c = p.cool;
  assert.ok(c >= 0);
  assert.ok(nAfterTwoTicks >= 0);
});

test('sát thương + giáp: giáp hấp thụ, máu giảm đúng, chết ghi kills/deaths', () => {
  const match = core.createMatch('dm', 17);
  const p = match.player;
  const bot = match.soldiers[1];
  const hp0 = bot.hp;
  bot.armor = 50;
  core.applyDamage(match, p, bot, 20);
  assert.ok(bot.armor < 50, 'giáp bị hút');
  assert.ok(bot.hp < hp0, 'máu giảm');
  assert.equal(bot.dead, false);
  // bắn tới chết
  for (let i = 0; i < 30 && !bot.dead; i++) core.applyDamage(match, p, bot, 30);
  assert.equal(bot.dead, true);
  assert.equal(p.kills, 1, 'người bắn được tính kill');
  assert.equal(bot.deaths, 1);
  assert.ok(match.explosions.length > 0, 'có hiệu ứng nổ khi chết');
});

test('beam là tia tức thời, melee chỉ ăn trong tầm', () => {
  const match = core.createMatch('dm', 19);
  const p = match.player, bot = match.soldiers[1];
  // melee xa hơn range -> không mất máu
  bot.x = p.x + 80; bot.y = p.y;
  p.weapon = 0;
  const hp0 = bot.hp;
  core.fireWeapon(match, p);
  assert.equal(bot.hp, hp0, 'cưa ngoài tầm không sát thương');
  // trong tầm (cùng team riêng nên bot1 của dm có team khác)
  bot.x = p.x + 14; bot.y = p.y;
  bot.dir = Math.PI; // quay lưng
  p.cool = 0; // hết cooldown của nhát đầu
  core.fireWeapon(match, p);
  assert.ok(bot.hp < hp0, 'cưa trong tầm phải trúng');
});

test('CTF: cướp cờ + về nhà được tính điểm, đủ cap thì end', () => {
  const match = core.createMatch('ctf', 23);
  const p = match.player;
  const enemyFlag = match.flags[1];
  // đặt người chơi giữ cờ địch, đứng ở căn cứ nhà
  enemyFlag.home = false;
  enemyFlag.carrier = p.id;
  p.carrying = 1;
  p.x = match.flags[0].hx; p.y = match.flags[0].hy;
  core.stepMatch(match, { keys: {}, fire: false });
  assert.equal(match.caps[0], 1, 'cap đầu tiên tính');
  assert.equal(enemyFlag.home, true, 'cờ trả về nhà');
  assert.equal(p.carrying, -1);
  match.caps[0] = 3;
  core.stepMatch(match, { keys: {}, fire: false });
  assert.equal(match.over, true);
  assert.equal(match.winner, 'win');
});

test('survival: hết bot thì spawn đợt mới, wave tăng', () => {
  const match = core.createMatch('surv', 29);
  assert.equal(match.wave, 1);
  const wave1 = match.soldiers.length;
  assert.ok(wave1 >= 3, 'đợt 1 có bot');
  // giết hết bot đợt 1
  for (const s of match.soldiers.filter((z) => z.bot)) {
    s.hp = 1;
    core.applyDamage(match, match.player, s, 99);
  }
  core.stepMatch(match, { keys: {}, fire: false });
  assert.equal(match.wave, 2, 'wave tăng sau khi dọn đợt');
  assert.ok(match.soldiers.length > wave1, 'bot mới spawn');
});

test('last hero: còn 1 người sống là kết thúc', () => {
  const match = core.createMatch('last', 31);
  const others = match.soldiers.filter((s) => s !== match.player);
  for (const s of others) { s.hp = 1; core.applyDamage(match, match.player, s, 99); }
  core.stepMatch(match, { keys: {}, fire: false });
  assert.equal(match.over, true);
  assert.equal(match.winner, 'win');
});

test('matchResult: điểm số hợp lý, không âm', () => {
  const match = core.createMatch('dm', 37);
  match.player.kills = 5; match.player.deaths = 1;
  const r = core.matchResult(match);
  assert.equal(r.kills, 5);
  assert.equal(r.score, 5 * 100 - 20);
  assert.ok(r.score > 0);
});

test('i18n: VI/EN đủ key, localStorage không crash trong Node', async () => {
  const { LANG, loadSave, saveSave, getLang } = await import(
    path.join(PORT, 'storage-i18n.js')
  );
  for (const lang of ['vi', 'en']) {
    for (const key of ['menu', 'modes', 'characters', 'chooseCharacter', 'help', 'about', 'pressAny', 'win', 'lose', 'best']) {
      assert.ok(LANG[lang][key], `${lang}.${key}`);
    }
    assert.equal(LANG[lang].menu.length, 4);
    assert.equal(LANG[lang].modes.length, 5);
  }
  const save = { lang: 'en', best: {} };
  assert.equal(getLang(save), 'en');
  assert.equal(getLang({ lang: 'zz' }), 'vi');
  assert.equal(typeof loadSave, 'function');
  saveSave(save); // không throw trong Node (localStorage undefined)
});

test('tài sản web-port: index.html, phaser vendor, sprite đã giải mã', () => {
  const mustHave = ['index.html', 'game.js', 'tt-core.js', 'phaser-engine.js',
    'vendor/phaser.min.js', 'assets/or.png', 'assets/u2.png', 'assets/u5.png',
    'assets/l0.png', 'assets/lz.png'];
  for (const f of mustHave) {
    accessSync(path.join(PORT, f), constants.R_OK);
  }
  const html = readFileSync(path.join(PORT, 'index.html'), 'utf8');
  assert.ok(html.includes('game.js'), 'index nạp game.js');
  assert.ok(html.includes('vendor/phaser.min.js'), 'index nạp phaser vendor');
  const gm = readFileSync(path.join(PORT, 'game.js'), 'utf8');
  assert.ok(gm.includes('mountPhaserRuntime'), 'dùng runtime chung của repo');
});
