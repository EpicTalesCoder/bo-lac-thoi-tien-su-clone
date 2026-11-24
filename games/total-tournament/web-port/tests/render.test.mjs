import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderOriginal, drawCu2Frame, drawCtfFlag } from '../render-original.js';
import { createOriginalFont, decodeFontMetrics } from '../font-original.js';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const RES = path.resolve(DIR, '../jar-resources');

function createContext() {
  const calls = [];
  const fills = [];
  return {
    calls, fills, imageSmoothingEnabled: true, fillStyle: '#000',
    save() {}, restore() {}, beginPath() {}, rect() {}, clip() {}, translate() {}, scale() {}, rotate() {},
    drawImage(...args) { calls.push(args); },
    fillRect(...args) { fills.push(args); },
  };
}

test('menu uses its selected original background and image smoothing stays disabled', () => {
  const ctx = createContext();
  const background = { width: 240, height: 320 };
  renderOriginal(ctx, {
    screen: 'menu', viewport: { width: 240, height: 320 }, backgroundName: 'li1',
    drawOriginalUi() {},
  }, { images: { li1: background, li2: { width: 240, height: 320 } } });
  assert.equal(ctx.imageSmoothingEnabled, false);
  assert.equal(ctx.calls.length, 1);
  assert.equal(ctx.calls[0][0], background);
});

test('original bitmap font supports Vietnamese NFD diacritics without extra advance and drawCu2Frame applies cu2 offsets', () => {
  const metrics = decodeFontMetrics(new Uint8Array(fs.readFileSync(path.join(RES, 'cf.png'))));
  const fnt = { width: 124, height: 46 };
  const font = createOriginalFont(fnt, metrics);

  assert.equal(font.measure('CHIẾN BINH'), font.measure('CHIEN BINH'));
  assert.equal(font.measure('ĐẤU ĐỘI'), font.measure('DAU DOI'));

  const ctx = createContext();
  font.draw(ctx, 'ĐẤU ĐỘI', 120, 10, 17);
  assert.ok(ctx.calls.length >= 6, 'base fnt glyphs drawn via MIDP clip');
  assert.ok(ctx.fills.length > 0, 'pixel diacritic marks drawn crisply');

  const sheet = { width: 128, height: 128 };
  const ctx2 = createContext();
  // Burn frame with ox=-25, oy=-15 offsets
  drawCu2Frame(ctx2, { u4: sheet }, [10, 20, 48, 30, -25, -15, 4], 100, 150, 1, true);
  assert.deepEqual(ctx2.calls[0], [sheet, 100 - 25 - 10, 150 - 15 - 20]);
});

test('multiplayer mode draws fighter names above health bars using original bitmap font', () => {
  const ctx = createContext();
  const drawnLabels = [];
  renderOriginal(ctx, {
    screen: 'game',
    viewport: { width: 240, height: 320 },
    level: { width: 1, height: 1, worldWidth: 240, worldHeight: 320, tiles: [[0]] },
    camera: { x: 0, y: 0 },
    showPlayerNames: true,
    fontLineHeight: 13,
    drawBitmapText: (_ctx, text, x, y, anchor) => {
      drawnLabels.push({ text, x, y, anchor });
    },
    actors: [
      { status: 1, x: 100, y: 180, width: 14, height: 22, facing: 1, name: 'Chiến Binh', animation: 1 },
      { status: 0, x: 140, y: 180, width: 14, height: 22, facing: -1, name: 'Đã Ngã', animation: 5 },
    ],
    tables: {
      cu2: [],
      poseForActor: () => [],
    },
  }, { images: {} });

  assert.equal(drawnLabels.length, 1);
  assert.deepEqual(drawnLabels[0], {
    text: 'Chiến Binh',
    x: 100,
    y: (180 - 22 - 10) - 13 - 1,
    anchor: 17,
  });
});

test('drawCtfFlag aligns cloth pole-sleeve flush with flagpole 98 in both right and left facings', () => {
  const clips = [];
  const draws = [];
  const ctx = {
    imageSmoothingEnabled: false,
    save() {},
    restore() {},
    beginPath() {},
    rect(x, y, w, h) { clips.push([x, y, w, h]); },
    clip() {},
    drawImage(...args) { draws.push(args); },
  };
  const u4 = { width: 32, height: 42 };
  const u13 = { width: 32, height: 42 };
  const cu2 = [];
  cu2[98] = [30, 0, 2, 19, 0, 0, 4];
  cu2[103] = [15, 0, 15, 14, 0, 0, 4];
  cu2[104] = [15, 14, 15, 14, 0, 0, 4];

  // Facing right (+1): cloth right pole edge [120..122) aligns directly over pole [120..122)
  drawCtfFlag(ctx, { u4, u13 }, cu2, { fx: 120, fy: 80, team: 0, animFrame: 0, facing: 1 });
  assert.deepEqual(clips[0], [107, 64, 15, 14]);
  assert.deepEqual(clips[1], [120, 78, 2, 19]);
  assert.equal(draws[0][0], u4);
  assert.equal(draws[1][0], u4);

  // Facing left (-1): mirrored cloth left pole sleeve [120..122) aligns flush over mirrored pole [120..122)
  clips.length = 0;
  draws.length = 0;
  drawCtfFlag(ctx, { u4, u13 }, cu2, { fx: 120, fy: 80, team: 0, animFrame: 0, facing: -1 });
  assert.deepEqual(clips[0], [120, 64, 15, 14]);
  assert.deepEqual(clips[1], [120, 78, 2, 19]);
  assert.equal(draws[0][0], u13);
  assert.equal(draws[1][0], u13);
  // Cloth bottom (64 + 14) touches pole top (78), and sleeve origin draws exact u13 index 2..16 aligned to pole u13 0..1
  assert.equal(draws[0][1], 120 - (32 - 15 - 15));
  assert.equal(draws[1][1], 120 - (32 - 2 - 30));
});
