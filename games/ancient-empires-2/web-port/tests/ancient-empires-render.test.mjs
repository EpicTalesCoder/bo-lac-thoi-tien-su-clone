import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { decodeMap, decodeSprite, decodeTerrainProperties, decodeUnits } from '../ancient-empires-loader.js';
import { renderOriginalBoard } from '../render-original.js';
import { BattleScene } from '../ae2-battle.js';
import { CAMPAIGN_STAGE_META } from '../ae2-story.js';

const asset = name => new URL(`../assets/${name}`, import.meta.url);

function makeContext() {
  const calls = [];
  const ctx = {
    imageSmoothingEnabled: true,
    save: () => calls.push(['save']), restore: () => calls.push(['restore']), beginPath: () => calls.push(['beginPath']),
    rect: (...args) => calls.push(['rect', ...args]), clip: () => calls.push(['clip']),
    translate: (...args) => calls.push(['translate', ...args]), rotate: (...args) => calls.push(['rotate', ...args]), scale: (...args) => calls.push(['scale', ...args]),
    drawImage: (...args) => calls.push(['drawImage', ...args]),
  };
  return { ctx, calls };
}

test('original renderer uses decoded tiles, map encoding, and frame data without fallback geometry', async () => {
  const [mapBytes, tilesBytes, buildingsBytes, propertyBytes] = await Promise.all([
    readFile(asset('m0')), readFile(asset('tiles0.sprite')), readFile(asset('buildings.sprite')), readFile(asset('tiles0.prop')),
  ]);
  const map = decodeMap(new Uint8Array(mapBytes));
  const tilesSprite = decodeSprite(new Uint8Array(tilesBytes));
  const buildingsSprite = decodeSprite(new Uint8Array(buildingsBytes));
  const terrain = decodeTerrainProperties(new Uint8Array(propertyBytes));
  const tileImages = await Promise.all(Array.from({ length: tilesSprite.frameCount }, (_, index) => readFile(asset(`tiles0_${String(index).padStart(2, '0')}.png`))));
  const image = (name, data, width, height) => ({ name, naturalWidth: width, naturalHeight: height, bytes: data });
  const assets = {
    terrain,
    sprites: { tiles0: tilesSprite, buildings: buildingsSprite },
    images: { buildings: image('buildings', new Uint8Array(await readFile(asset('buildings.png'))), 48, 24) },
    frameImages: { tiles0: tileImages.map((data, index) => image(`tile-${index}`, new Uint8Array(data), 24, 24)) },
    unitRecords: [],
    unitFamilies: [],
  };
  const { ctx, calls } = makeContext();
  renderOriginalBoard(ctx, { map, assets, viewportWidth: 48, viewportHeight: 48, units: [], cursor: null });
  const draws = calls.filter(call => call[0] === 'drawImage');
  assert.equal(ctx.imageSmoothingEnabled, false);
  assert.equal(draws.length, 9);
  assert.deepEqual(draws.slice(0, 4).map(call => call[1].name), ['tile-17', 'tile-15', 'tile-17', 'tile-15']);
  assert.equal(calls.some(call => call[0] === 'fillRect'), false);
});

test('original renderer draws 24x24 unit_icons, grayscale acted units, king heads, tombstones, and HP without battle sprite overflow', async () => {
  const [mapBytes, tilesBytes, buildingsBytes, propertyBytes, unitIconsBytes, kingHeadBytes] = await Promise.all([
    readFile(asset('m0')), readFile(asset('tiles0.sprite')), readFile(asset('buildings.sprite')), readFile(asset('tiles0.prop')),
    readFile(asset('unit_icons.sprite')), readFile(asset('king_head_icons.sprite')),
  ]);
  const map = decodeMap(new Uint8Array(mapBytes));
  const tilesSprite = decodeSprite(new Uint8Array(tilesBytes));
  const buildingsSprite = decodeSprite(new Uint8Array(buildingsBytes));
  const unitIconsSprite = decodeSprite(new Uint8Array(unitIconsBytes));
  const kingHeadSprite = decodeSprite(new Uint8Array(kingHeadBytes));
  const terrain = decodeTerrainProperties(new Uint8Array(propertyBytes));
  const tileImages = await Promise.all(Array.from({ length: tilesSprite.frameCount }, (_, index) => readFile(asset(`tiles0_${String(index).padStart(2, '0')}.png`))));
  const image = (name, width, height) => ({ name, naturalWidth: width, naturalHeight: height });
  const assets = {
    terrain,
    sprites: { tiles0: tilesSprite, buildings: buildingsSprite, unit_icons: unitIconsSprite, king_head_icons: kingHeadSprite },
    images: {
      buildings: image('buildings', 48, 24),
      unit_icons: image('unit_icons_p1', 288, 48),
      king_head_icons: image('king_heads_color', 52, 12),
      tombstone: image('tombstone', 24, 24),
    },
    unitIconPalettes: [image('unit_icons_gray', 288, 48), image('unit_icons_p1', 288, 48), image('unit_icons_p2', 288, 48)],
    kingHeadPalettes: [image('king_heads_gray', 52, 12), image('king_heads_color', 52, 12)],
    frameImages: { tiles0: tileImages.map((_, index) => image(`tile-${index}`, 24, 24)) },
    unitRecords: [],
    unitFamilies: [],
  };

  const { ctx, calls } = makeContext();
  ctx.strokeText = (...args) => calls.push(['strokeText', ...args]);
  ctx.fillText = (...args) => calls.push(['fillText', ...args]);

  renderOriginalBoard(ctx, {
    map,
    assets,
    viewportWidth: 96,
    viewportHeight: 48,
    units: [
      { type: 0, palette: 1, frameIndex: 1, action: 0, hp: 100, x: 0, y: 0 },
      { type: 9, palette: 2, frameIndex: 0, action: 1, hp: 75, x: 1, y: 0 },
      { type: 2, palette: 2, frameIndex: 0, action: 3, hp: 0, x: 2, y: 0 },
    ],
    cursor: null,
  });

  const draws = calls.filter(c => c[0] === 'drawImage');
  const unitDraws = draws.filter(c => !c[1].name.startsWith('tile-') && c[1].name !== 'buildings');
  assert.deepEqual(unitDraws.map(d => [d[1].name, d[2], d[3], d[4], d[5], d[6], d[7]]), [
    ['unit_icons_p1', 0, 24, 24, 24, 0, 0],
    ['unit_icons_gray', 216, 0, 24, 24, 24, 0],
    ['king_heads_gray', 13, 0, 13, 12, 31, 0],
    ['tombstone', 0, 0, 24, 24, 48, 0],
  ]);
  assert.deepEqual(calls.filter(c => c[0] === 'fillText').map(c => c[1]), ['75']);
  assert.equal(calls.some(call => call[0] === 'fillRect'), false);
});

test('BattleScene formation, mirrored attacker facing, HP drain, and campaign story mappings match AE2 data', async () => {
  const [unitsBytes, soldierSpriteBytes, soldierLangRaw] = await Promise.all([
    readFile(asset('units.bin')),
    readFile(asset('soldier.sprite')),
    readFile(new URL('../data/lang-en.json', import.meta.url), 'utf8'),
  ]);
  const unitRecords = decodeUnits(new Uint8Array(unitsBytes));
  const soldierMeta = decodeSprite(new Uint8Array(soldierSpriteBytes));
  const lang = JSON.parse(soldierLangRaw);
  assert.equal(lang[CAMPAIGN_STAGE_META.m0.titleIdx], 'TEMPLE RAIDERS');
  assert.equal(lang[215], 'With the passing of the war against the forces of darkness, the brothers Galamar and Valadorn are reunited in their rule of the kingdom of Thorin. The kingdom is slowly returning to its peace time ways, protected by three ancient crystals safely guarded in the temples of Courage, Wisdom and Life, when rumours of skirmishes in the North reach the palace...');

  const img = (name, w, h) => ({ name, naturalWidth: w, naturalHeight: h });
  const scene = new BattleScene({
    attacker: { type: 0, palette: 1, hp: 100 },
    attackerName: 'SOLDIER',
    attackerTerrain: 1,
    defender: { type: 10, palette: 2, hp: 60 },
    defenderName: 'SKELETON',
    defenderTerrain: 3,
    combatResult: {
      attackerHpBefore: 100, defenderHpBefore: 60,
      attackerHpAfter: 82, defenderHpAfter: 15,
      damage: 45, counterDamage: 18,
    },
    assets: {
      unitRecords,
      unitFamilies: ['soldier', 'archer', 'lizard', 'wizard', 'wisp', 'spider', 'golem', 'catapult', 'wyvern', 'king', 'skeleton'],
      sprites: { soldier: soldierMeta, skeleton: soldierMeta },
      images: { soldier: img('soldier', 34, 36), skeleton: img('skeleton', 34, 36) },
      frameImages: { soldier: [img('s0', 34, 36), img('s1', 34, 36), img('s2', 34, 36)] },
      coloredPalettes: { 1: {}, 2: {} },
    },
  });
  assert.equal(scene.leftSide.slots, 5);
  assert.equal(scene.rightSide.visibleCount, 3);
  for (let t = 0; t < 60 && !scene.finished; t++) scene.tick(50);
  assert.equal(scene.finished, true);
  assert.equal(Math.round(scene.leftSide.displayHp), 82);
  assert.equal(Math.round(scene.rightSide.displayHp), 15);
});
