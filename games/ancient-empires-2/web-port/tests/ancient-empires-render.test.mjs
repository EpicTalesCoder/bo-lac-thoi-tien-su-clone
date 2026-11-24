import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { decodeMap, decodeSprite, decodeTerrainProperties, decodeUnits } from '../ancient-empires-loader.js';
import { renderOriginalBoard } from '../render-original.js';
import { BattleScene } from '../ae2-battle.js';
import { CAMPAIGN_STAGE_CONFIG, CAMPAIGN_STAGE_META, CAMPAIGN_STAGE_SCRIPTS } from '../ae2-story.js';
import { RingMenu, UI_COLORS, drawBitmapText, drawMenuFrame, drawRecruitDialog } from '../ae2-ui.js';

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

test('renderOriginalBoard animates water/smoke, hides vanished/king corpses, renders floatTexts, and CAMPAIGN_STAGE_CONFIG matches i.java', async () => {
  const [tilesBytes, propertyBytes, smokeBytes] = await Promise.all([
    readFile(asset('tiles0.sprite')),
    readFile(asset('tiles0.prop')),
    readFile(asset('smoke.sprite')),
  ]);
  const tilesSprite = decodeSprite(new Uint8Array(tilesBytes));
  const smokeSprite = decodeSprite(new Uint8Array(smokeBytes));
  const terrain = decodeTerrainProperties(new Uint8Array(propertyBytes));
  const img = (name, w, h) => ({ name, naturalWidth: w, naturalHeight: h });
  const tileImages = tilesSprite.frames.map((_, index) => img(`tile-${index}`, 24, 24));
  const map = {
    width: 2,
    height: 1,
    tiles: [Int8Array.from([1]), Int8Array.from([27])],
  };
  const assets = {
    terrain,
    sprites: { tiles0: tilesSprite, smoke: smokeSprite },
    images: { smoke: img('smoke', 96, 20), tombstone: img('tombstone', 24, 24) },
    frameImages: { tiles0: tileImages },
  };
  const { ctx, calls } = makeContext();
  ctx.strokeText = (...args) => calls.push(['strokeText', ...args]);
  ctx.fillText = (...args) => calls.push(['fillText', ...args]);

  renderOriginalBoard(ctx, {
    map,
    assets,
    viewportWidth: 48,
    viewportHeight: 24,
    waterAnimFrame: 1,
    floatTexts: [{ x: 0, y: 0, text: '+20', offsetY: 2 }],
    units: [
      { type: 10, palette: 2, action: 4, hp: 0, x: 0, y: 0 },
      { type: 9, palette: 1, action: 3, hp: 0, x: -10, y: -10 },
    ],
  });
  const draws = calls.filter(c => c[0] === 'drawImage').map(c => c[1].name);
  assert.deepEqual(draws, ['tile-2', 'tile-27', 'smoke']);
  assert.deepEqual(calls.filter(c => c[0] === 'fillText').map(c => c[1]), ['+20']);

  assert.deepEqual(CAMPAIGN_STAGE_CONFIG.m1.startGold, [300, 50]);
  assert.equal(CAMPAIGN_STAGE_CONFIG.m1.kingHeadP1, 2);
  assert.equal(CAMPAIGN_STAGE_CONFIG.m4.crystalSurvival, true);
  assert.equal(CAMPAIGN_STAGE_CONFIG.m7.removeInitialCrystals, true);
  assert.equal(CAMPAIGN_STAGE_CONFIG.m7.bossIsVictory, true);
});

test('BattleScene applies h.java anchorFlags alignment to king frames and uses unit.kingHead + king_heads_back', async () => {
  const [unitsBytes, kingBytes, headsBytes, backBytes] = await Promise.all([
    readFile(asset('units.bin')),
    readFile(asset('king.sprite')),
    readFile(asset('king_heads.sprite')),
    readFile(asset('king_heads_back.sprite')),
  ]);
  const unitRecords = decodeUnits(new Uint8Array(unitsBytes));
  const kingMeta = decodeSprite(new Uint8Array(kingBytes));
  const headsMeta = decodeSprite(new Uint8Array(headsBytes));
  const backMeta = decodeSprite(new Uint8Array(backBytes));
  const img = (name, w, h) => ({ name, naturalWidth: w, naturalHeight: h });
  const scene = new BattleScene({
    attacker: { type: 9, palette: 1, kingHead: 2, hp: 100 },
    attackerName: 'COMMANDER',
    attackerTerrain: 1,
    defender: { type: 0, palette: 2, hp: 100 },
    defenderName: 'SOLDIER',
    defenderTerrain: 1,
    combatResult: { attackerHpBefore: 100, defenderHpBefore: 100, attackerHpAfter: 90, defenderHpAfter: 50, damage: 50, counterDamage: 10 },
    assets: {
      unitRecords,
      unitFamilies: ['soldier', 'archer', 'lizard', 'wizard', 'wisp', 'spider', 'golem', 'catapult', 'wyvern', 'king', 'skeleton'],
      sprites: { king: kingMeta, king_heads: headsMeta, king_heads_back: backMeta, soldier: kingMeta },
      images: { king_heads: img('king_heads', 88, 19), king_heads_back: img('king_heads_back', 68, 15) },
      frameImages: {
        king: [img('king_00', 61, 38), img('king_01', 61, 38), img('king_02', 48, 75)],
        soldier: [img('sol_0', 34, 36), img('sol_1', 34, 36), img('sol_2', 34, 36)],
      },
      coloredPalettes: { 1: {}, 2: {} },
    },
  });
  assert.equal(scene.leftSide.kingHead, 2);
  const { ctx, calls } = makeContext();
  ctx.fillStyle = '';
  ctx.fillRect = () => {};
  ctx.ellipse = () => {};
  ctx.fill = () => {};
  ctx.strokeText = () => {};
  ctx.fillText = () => {};
  // Elapsed 300ms -> isAttacking (seqFrame = 2 -> king_02 48x75 + king_heads_back)
  scene.elapsed = 300;
  scene.render(ctx);
  const draws = calls.filter(c => c[0] === 'drawImage').map(c => c[1].name);
  assert.equal(draws.includes('king_02'), true);
  assert.equal(draws.includes('king_heads_back'), true);
  // Reset calls and check idle frame 0 (king_00 61x38 -> y anchored at baseY + 37, head at baseY + 26)
  calls.length = 0;
  scene.elapsed = 0;
  scene.render(ctx);
  const bodyCall = calls.find(c => c[0] === 'drawImage' && c[1].name === 'king_00');
  const headCall = calls.find(c => c[0] === 'drawImage' && c[1].name === 'king_heads');
  assert.ok(bodyCall && headCall);
  assert.equal(headCall[2], 2 * 22); // Valadorn (kingHead 2) source X offset
});

test('RingMenu distributes items on a circular ring, animates rotation, handles hitTest, and draws original menu/action icons', async () => {
  const [bigBytes, iconBytes, sparkBytes, sideArrowBytes] = await Promise.all([
    readFile(asset('big_circle.sprite')),
    readFile(asset('action_icons.sprite')),
    readFile(asset('small_spark.sprite')),
    readFile(asset('side_arrow.sprite')),
  ]);
  const assets = {
    sprites: {
      big_circle: decodeSprite(new Uint8Array(bigBytes)),
      action_icons: decodeSprite(new Uint8Array(iconBytes)),
      small_spark: decodeSprite(new Uint8Array(sparkBytes)),
      side_arrow: decodeSprite(new Uint8Array(sideArrowBytes)),
    },
    images: {
      big_circle: { name: 'big_circle', naturalWidth: 64, naturalHeight: 33 },
      action_icons: { name: 'action_icons', naturalWidth: 112, naturalHeight: 16 },
      small_spark: { name: 'small_spark', naturalWidth: 21, naturalHeight: 7 },
      side_arrow: { name: 'side_arrow', naturalWidth: 16, naturalHeight: 14 },
    },
  };

  const ring = new RingMenu({
    items: [
      { id: 'attack', label: 'ATTACK', icon: 3 },
      { id: 'occupy', label: 'OCCUPY', icon: 1 },
      { id: 'wait', label: 'END MOVE', icon: 6 },
      { id: 'cancel', label: 'CANCEL', icon: 5 },
    ],
    centerX: 120,
    centerY: 160,
    radius: 40,
    iconSprite: 'action_icons',
    immediate: true,
  });

  const nodes = ring.getNodePositions();
  assert.equal(nodes.length, 4);
  assert.deepEqual([nodes[0].x, nodes[0].y, nodes[0].selected], [120, 120, true]);
  assert.deepEqual([nodes[1].x, nodes[1].y], [160, 160]);
  assert.deepEqual([nodes[2].x, nodes[2].y], [120, 200]);
  assert.deepEqual([nodes[3].x, nodes[3].y], [80, 160]);

  assert.deepEqual(ring.hitTest(120, 120), { type: 'confirm', index: 0 });
  assert.deepEqual(ring.hitTest(160, 160), { type: 'select', index: 1 });

  ring.move(1);
  assert.equal(ring.selectedIndex, 1);
  assert.ok(ring.rotOffset > 80);
  for (let i = 0; i < 12; i++) ring.tick();
  assert.equal(ring.rotOffset, 0);

  const { ctx, calls } = makeContext();
  ctx.fillStyle = '';
  ctx.fillRect = (...args) => calls.push(['fillRect', ...args]);
  ctx.strokeRect = (...args) => calls.push(['strokeRect', ...args]);
  ctx.fillText = (...args) => calls.push(['fillText', ...args]);
  ctx.measureText = s => ({ width: String(s).length * 6 });

  ring.render(ctx, assets);
  const fills = calls.filter(c => c[0] === 'fillRect');
  assert.ok(fills.length > 0);
  const draws = calls.filter(c => c[0] === 'drawImage').map(c => [c[1].name, c[2]]);
  assert.equal(draws.filter(d => d[0] === 'big_circle').length, 4);
  assert.ok(draws.some(d => d[0] === 'small_spark'));
  // Icon 1 in action_icons resolves sourceFrame=1 (House) at sx=16
  assert.ok(draws.some(d => d[0] === 'action_icons' && d[1] === 16));
});

test('drawMenuFrame and drawBitmapText render 9-slice menu.png borders and bitmap chars/lchars without monospace fallback', async () => {
  const [menuBytes, charsBytes, lcharsBytes] = await Promise.all([
    readFile(asset('menu.sprite')),
    readFile(asset('chars.sprite')),
    readFile(asset('lchars.sprite')),
  ]);
  const assets = {
    sprites: {
      menu: decodeSprite(new Uint8Array(menuBytes)),
      chars: decodeSprite(new Uint8Array(charsBytes)),
      lchars: decodeSprite(new Uint8Array(lcharsBytes)),
    },
    images: {
      menu: { name: 'menu', naturalWidth: 128, naturalHeight: 16 },
      chars: { name: 'chars', naturalWidth: 72, naturalHeight: 7 },
      lchars: { name: 'lchars', naturalWidth: 104, naturalHeight: 11 },
    },
  };
  const { ctx, calls } = makeContext();
  ctx.fillStyle = '';
  ctx.fillRect = (...args) => calls.push(['fillRect', ctx.fillStyle, ...args]);
  ctx.fillText = (...args) => calls.push(['fillText', ...args]);

  drawMenuFrame(ctx, assets, 10, 20, 120, 80, 0, 18);
  assert.ok(calls.some(c => c[0] === 'fillRect' && c[1] === UI_COLORS.bg));
  assert.ok(calls.some(c => c[0] === 'fillRect' && c[1] === UI_COLORS.titleBg));
  assert.ok(calls.some(c => c[0] === 'drawImage' && c[1].name === 'menu'));

  calls.length = 0;
  drawBitmapText(ctx, assets, 'chars', '.15', 20, 30);
  drawBitmapText(ctx, assets, 'lchars', '+4/8', 50, 30);
  assert.equal(calls.some(c => c[0] === 'fillText'), false);
  const charDraws = calls.filter(c => c[0] === 'drawImage' && c[1].name === 'chars').map(c => c[2]);
  assert.deepEqual(charDraws, [11 * 6, 1 * 6, 5 * 6]);
  const lcharDraws = calls.filter(c => c[0] === 'drawImage' && c[1].name === 'lchars').map(c => c[2]);
  assert.deepEqual(lcharDraws, [12 * 8, 4 * 8, 10 * 8, 8 * 8]);
});

test('CAMPAIGN_STAGE_SCRIPTS matches m0 and m1 in-map unit marches, spell FX, and multi-speaker exchanges', () => {
  const m0Open = CAMPAIGN_STAGE_SCRIPTS.m0.opening;
  assert.equal(m0Open.some(s => s.kind === 'moveGroup' && s.moves.length === 3), true);
  assert.equal(m0Open.some(s => s.kind === 'fx' && s.sprite === 'redspark' && s.target[0] === 9 && s.target[1] === 3), true);
  assert.equal(m0Open.some(s => s.kind === 'fxBurst' && s.removeUnitAt?.[0] === 9 && s.removeUnitAt?.[1] === 3), true);
  assert.deepEqual(
    m0Open.filter(s => s.kind === 'dialog').map(s => [s.langIdx, s.portrait]),
    [[221, 2], [222, 2], [223, 0], [224, 5]]
  );
  assert.equal(CAMPAIGN_STAGE_SCRIPTS.m1.opening.some(s => s.kind === 'escortRetreat' && s.units.length === 3), true);
});

test('drawRecruitDialog displays real Soldier ATK/DEF/MOV stats from units.bin record fields', async () => {
  const [unitBytes, charsBytes, lcharsBytes, menuBytes, smallCircleBytes, bigCircleBytes, hudBytes, hud2Bytes] = await Promise.all([
    readFile(asset('units.bin')),
    readFile(asset('chars.sprite')),
    readFile(asset('lchars.sprite')),
    readFile(asset('menu.sprite')),
    readFile(asset('small_circle.sprite')),
    readFile(asset('big_circle.sprite')),
    readFile(asset('hud_icons.sprite')),
    readFile(asset('hud_icons_2.sprite')),
  ]);
  const unitRecords = decodeUnits(new Uint8Array(unitBytes));
  const img = (name, w, h) => ({ name, naturalWidth: w, naturalHeight: h });
  const assets = {
    langStrings: [],
    sprites: {
      chars: decodeSprite(new Uint8Array(charsBytes)),
      lchars: decodeSprite(new Uint8Array(lcharsBytes)),
      menu: decodeSprite(new Uint8Array(menuBytes)),
      small_circle: decodeSprite(new Uint8Array(smallCircleBytes)),
      big_circle: decodeSprite(new Uint8Array(bigCircleBytes)),
      hud_icons: decodeSprite(new Uint8Array(hudBytes)),
      hud_icons_2: decodeSprite(new Uint8Array(hud2Bytes)),
    },
    images: {
      chars: img('chars', 72, 7),
      lchars: img('lchars', 104, 11),
      menu: img('menu', 128, 16),
      small_circle: img('small_circle', 40, 21),
      big_circle: img('big_circle', 64, 33),
      hud_icons: img('hud_icons', 39, 16),
      hud_icons_2: img('hud_icons_2', 22, 11),
    },
  };
  const { ctx, calls } = makeContext();
  ctx.fillStyle = '';
  ctx.fillRect = (...args) => calls.push(['fillRect', ...args]);
  ctx.strokeRect = (...args) => calls.push(['strokeRect', ...args]);
  ctx.fillText = (...args) => calls.push(['fillText', ...args]);
  ctx.measureText = s => ({ width: String(s).length * 6 });

  drawRecruitDialog(ctx, assets, {
    list: [0, 1],
    cursor: 0,
    gold: 350,
    unitRecords,
    unitNameFn: () => 'SOLDIER',
  });

  // Soldier units.bin fields: [mov=5, atkMin=50, atkMax=55, def=5], shortValue=150
  const charFramesDrawn = calls.filter(c => c[0] === 'drawImage' && c[1].name === 'chars').map(c => c[2] / 6);
  // Expect digits for "50-55", "5", "5" => frames [5,0,10,5,5, 5, 5]
  assert.deepEqual(charFramesDrawn, [5, 0, 10, 5, 5, 5, 5]);
});

test('Action RingMenu uses 4-slot 90-degree quadrant angles, supports 60fps 16ms damping, and renderOriginalBoard honors sub-tile px/py', async () => {
  const [mapBytes, tilesBytes, buildingsBytes, propertyBytes, unitIconsBytes] = await Promise.all([
    readFile(asset('m0')), readFile(asset('tiles0.sprite')), readFile(asset('buildings.sprite')), readFile(asset('tiles0.prop')),
    readFile(asset('unit_icons.sprite')),
  ]);
  const map = decodeMap(new Uint8Array(mapBytes));
  const assets = {
    terrain: decodeTerrainProperties(new Uint8Array(propertyBytes)),
    sprites: {
      tiles0: decodeSprite(new Uint8Array(tilesBytes)),
      buildings: decodeSprite(new Uint8Array(buildingsBytes)),
      unit_icons: decodeSprite(new Uint8Array(unitIconsBytes)),
    },
    images: { buildings: { name: 'b', naturalWidth: 48, naturalHeight: 24 }, unit_icons: { name: 'ui', naturalWidth: 288, naturalHeight: 48 } },
    unitIconPalettes: [null, { name: 'ui1', naturalWidth: 288, naturalHeight: 48 }],
    frameImages: { tiles0: Array.from({ length: 37 }, (_, i) => ({ name: `t${i}`, naturalWidth: 24, naturalHeight: 24 })) },
  };

  // 2-item action menu with minSlots=4 should place items at 0 deg (top) and 90 deg (right), NOT 180 deg opposite
  const actionRing = new RingMenu({
    items: [{ label: 'END MOVE', icon: 6 }, { label: 'CANCEL', icon: 5 }],
    minSlots: 4,
    centerX: 60,
    centerY: 220,
    radius: 36,
    immediate: true,
  });
  const nodes = actionRing.getNodePositions();
  assert.deepEqual([nodes[0].x, nodes[0].y], [60, 184]);
  assert.deepEqual([nodes[1].x, nodes[1].y], [96, 220]);

  // 16ms 60fps tick smoothly decays rotOffset without locking or jumping
  actionRing.move(1);
  const startOff = Math.abs(actionRing.rotOffset);
  assert.ok(startOff > 80);
  actionRing.tick(16);
  const afterOneFrame = Math.abs(actionRing.rotOffset);
  assert.ok(afterOneFrame < startOff && afterOneFrame > startOff * 0.6);
  for (let i = 0; i < 40; i++) actionRing.tick(16);
  assert.equal(actionRing.rotOffset, 0);

  // Smooth pixel unit.px / unit.py rendering
  const { ctx, calls } = makeContext();
  renderOriginalBoard(ctx, {
    map,
    assets,
    viewportWidth: 96,
    viewportHeight: 96,
    units: [{ type: 0, palette: 1, action: 0, hp: 100, x: 1, y: 1, px: 30, py: 36 }],
  });
  const unitCall = calls.find(c => c[0] === 'drawImage' && c[1].name === 'ui1');
  assert.ok(unitCall);
  assert.equal(unitCall[6], 30);
  assert.equal(unitCall[7], 36);
});

test('renderOriginalBoard draws full 26x26 4-corner red cursor centered at (+12,+12), selectedCursor, and walking b_smoke pixels', async () => {
  const [mapBytes, tilesBytes, buildingsBytes, propertyBytes, cursorBytes, smokeBytes] = await Promise.all([
    readFile(asset('m0')), readFile(asset('tiles0.sprite')), readFile(asset('buildings.sprite')), readFile(asset('tiles0.prop')),
    readFile(asset('cursor.sprite')), readFile(asset('b_smoke.sprite')),
  ]);
  const map = decodeMap(new Uint8Array(mapBytes));
  const assets = {
    terrain: decodeTerrainProperties(new Uint8Array(propertyBytes)),
    sprites: {
      tiles0: decodeSprite(new Uint8Array(tilesBytes)),
      buildings: decodeSprite(new Uint8Array(buildingsBytes)),
      cursor: decodeSprite(new Uint8Array(cursorBytes)),
      b_smoke: decodeSprite(new Uint8Array(smokeBytes)),
    },
    images: {
      buildings: { name: 'b', naturalWidth: 48, naturalHeight: 24 },
      b_smoke: { name: 'b_smoke', naturalWidth: 52, naturalHeight: 10 },
    },
    frameImages: {
      tiles0: Array.from({ length: 37 }, (_, i) => ({ name: `t${i}`, naturalWidth: 24, naturalHeight: 24 })),
      cursor: [
        { name: 'cursor_00', naturalWidth: 26, naturalHeight: 26 },
        { name: 'cursor_01', naturalWidth: 26, naturalHeight: 26 },
        { name: 'cursor_02', naturalWidth: 40, naturalHeight: 41 },
      ],
    },
  };
  const { ctx, calls } = makeContext();
  renderOriginalBoard(ctx, {
    map,
    assets,
    viewportWidth: 96,
    viewportHeight: 96,
    units: [],
    selectedCursor: { x: 1, y: 1, frameIndex: 0 },
    cursor: { x: 2, y: 1, frameIndex: 1 },
    mapEffects: [{ sprite: 'b_smoke', x: 1, y: 1, px: 42, py: 40, frame: 0 }],
  });
  const selCall = calls.find(c => c[0] === 'drawImage' && c[1].name === 'cursor_00');
  const curCall = calls.find(c => c[0] === 'drawImage' && c[1].name === 'cursor_01');
  const smokeCall = calls.find(c => c[0] === 'drawImage' && c[1].name === 'b_smoke');
  assert.ok(selCall && curCall && smokeCall);
  // Full 26x26 sprite centered at tile (1,1) -> 36 - 13 = 23
  assert.deepEqual([selCall[4], selCall[5], selCall[6], selCall[7]], [26, 26, 23, 23]);
  // Full 26x26 sprite centered at tile (2,1) -> 60 - 13 = 47, 36 - 13 = 23
  assert.deepEqual([curCall[4], curCall[5], curCall[6], curCall[7]], [26, 26, 47, 23]);
  // b_smoke pixel centered at (42, 40) with 13x10 -> (36, 35)
  assert.deepEqual([smokeCall[6], smokeCall[7]], [36, 35]);
});

test('renderOriginalBoard draws attackRangeCells from alpha frame 1 and BattleScene runs unit-specific animations', async () => {
  const [mapBytes, tilesBytes, propertyBytes, unitsBytes, archerBytes, arrowBytes, skelBytes, slashBytes, golemBytes, craterBytes, smokeBytes, bSmokeBytes, kingBytes, waveBytes, kingSlashBytes, wyvernBytes] = await Promise.all([
    readFile(asset('m0')), readFile(asset('tiles0.sprite')), readFile(asset('tiles0.prop')), readFile(asset('units.bin')),
    readFile(asset('archer.sprite')), readFile(asset('archer_arrow.sprite')), readFile(asset('skeleton.sprite')), readFile(asset('slash.sprite')),
    readFile(asset('golem.sprite')), readFile(asset('crater.sprite')), readFile(asset('smoke.sprite')), readFile(asset('b_smoke.sprite')),
    readFile(asset('king.sprite')), readFile(asset('kingwave.sprite')), readFile(asset('kingslash.sprite')), readFile(asset('wyvern.sprite')),
  ]);
  const map = decodeMap(new Uint8Array(mapBytes));
  const tilesSprite = decodeSprite(new Uint8Array(tilesBytes));
  const terrain = decodeTerrainProperties(new Uint8Array(propertyBytes));
  const unitRecords = decodeUnits(new Uint8Array(unitsBytes));
  const img = (name, w, h) => ({ name, naturalWidth: w, naturalHeight: h });

  // 1. Verify attackRangeCells uses second 24x24 cell in alpha.png (sx = 24)
  {
    const { ctx, calls } = makeContext();
    renderOriginalBoard(ctx, {
      map,
      assets: {
        terrain,
        sprites: { tiles0: tilesSprite },
        images: { alpha: img('alpha', 48, 24) },
        frameImages: { tiles0: Array.from({ length: 37 }, (_, i) => img(`t${i}`, 24, 24)) },
      },
      viewportWidth: 48,
      viewportHeight: 48,
      units: [],
      rangeCells: [[0, 0]],
      attackRangeCells: [[1, 0]],
    });
    const alphaDraws = calls.filter(c => c[0] === 'drawImage' && c[1].name === 'alpha');
    assert.equal(alphaDraws.length, 2);
    assert.equal(alphaDraws[0][2], 0);
    assert.equal(alphaDraws[1][2], 24);
  }

  // 2. Verify Archer fires flying & stuck arrows while staying horizontally planted at launch
  const unitFamilies = ['soldier', 'archer', 'lizard', 'wizard', 'wisp', 'spider', 'golem', 'catapult', 'wyvern', 'king', 'skeleton', 'crystal'];
  const commonSprites = {
    archer: decodeSprite(new Uint8Array(archerBytes)),
    archer_arrow: decodeSprite(new Uint8Array(arrowBytes)),
    skeleton: decodeSprite(new Uint8Array(skelBytes)),
    slash: decodeSprite(new Uint8Array(slashBytes)),
    golem: decodeSprite(new Uint8Array(golemBytes)),
    crater: decodeSprite(new Uint8Array(craterBytes)),
    smoke: decodeSprite(new Uint8Array(smokeBytes)),
    b_smoke: decodeSprite(new Uint8Array(bSmokeBytes)),
    king: decodeSprite(new Uint8Array(kingBytes)),
    kingwave: decodeSprite(new Uint8Array(waveBytes)),
    kingslash: decodeSprite(new Uint8Array(kingSlashBytes)),
    wyvern: decodeSprite(new Uint8Array(wyvernBytes)),
  };
  const makeBattleCtx = () => {
    const { ctx, calls } = makeContext();
    ctx.fillStyle = ''; ctx.strokeStyle = ''; ctx.lineWidth = 1; ctx.globalAlpha = 1;
    ctx.fillRect = () => {}; ctx.ellipse = () => {}; ctx.arc = () => {};
    ctx.moveTo = (...a) => calls.push(['moveTo', ...a]);
    ctx.lineTo = (...a) => calls.push(['lineTo', ...a]);
    ctx.closePath = () => {}; ctx.fill = () => calls.push(['fill']); ctx.stroke = () => calls.push(['stroke']);
    ctx.strokeText = () => {}; ctx.fillText = () => {};
    return { ctx, calls };
  };

  const archerScene = new BattleScene({
    attacker: { type: 1, palette: 1, hp: 100 },
    attackerName: 'ARCHER',
    attackerTerrain: 1,
    defender: { type: 10, palette: 2, hp: 100 },
    defenderName: 'SKELETON',
    defenderTerrain: 1,
    combatResult: { attackerHpBefore: 100, defenderHpBefore: 100, attackerHpAfter: 100, defenderHpAfter: 60, damage: 40, counterDamage: 0 },
    assets: {
      unitRecords,
      unitFamilies,
      sprites: commonSprites,
      images: {
        archer: img('archer', 124, 37),
        skeleton: img('skeleton', 40, 44),
        b_smoke: img('b_smoke', 52, 10),
        slash: img('slash', 21, 27),
      },
      frameImages: {
        archer_arrow: [img('archer_arrow_00', 24, 13), img('archer_arrow_01', 24, 13)],
      },
      coloredPalettes: { 1: {}, 2: {} },
    },
  });
  const idleCtx = makeBattleCtx();
  archerScene.elapsed = 0;
  archerScene.render(idleCtx.ctx);
  const archerIdleX = idleCtx.calls.find(c => c[0] === 'drawImage' && c[1].name === 'archer')[6];

  const flightCtx = makeBattleCtx();
  archerScene.elapsed = 400;
  archerScene.render(flightCtx.ctx);
  const archerShotDraws = flightCtx.calls.filter(c => c[0] === 'drawImage');
  assert.equal(archerShotDraws.some(c => c[1].name === 'archer_arrow_00'), true, 'archer launches flying arrow');
  assert.equal(archerShotDraws.find(c => c[1].name === 'archer')[6], archerIdleX, 'archer does not slide forward on shoot');

  const stuckCtx = makeBattleCtx();
  archerScene.elapsed = 600;
  archerScene.render(stuckCtx.ctx);
  assert.equal(stuckCtx.calls.some(c => c[0] === 'drawImage' && c[1].name === 'archer_arrow_01'), true, 'archer arrow sticks on target impact');

  // 3. Verify Skeleton runs through frame sequence [2..5] + slashes; Golem summons crater + smoke; King summons kingslash + kingwave
  const skelScene = new BattleScene({
    attacker: { type: 10, palette: 1, hp: 100 },
    attackerName: 'SKELETON',
    attackerTerrain: 1,
    defender: { type: 6, palette: 2, hp: 100 },
    defenderName: 'GOLEM',
    defenderTerrain: 4,
    combatResult: { attackerHpBefore: 100, defenderHpBefore: 100, attackerHpAfter: 60, defenderHpAfter: 70, damage: 30, counterDamage: 40 },
    assets: {
      unitRecords,
      unitFamilies,
      sprites: commonSprites,
      images: {
        golem: img('golem', 188, 47),
        slash: img('slash', 21, 27),
        crater: img('crater', 53, 19),
        smoke: img('smoke', 96, 20),
        b_smoke: img('b_smoke', 52, 10),
      },
      frameImages: {
        skeleton: Array.from({ length: 7 }, (_, i) => img(`skeleton_0${i}`, 40, 44)),
      },
      coloredPalettes: { 1: {}, 2: {} },
    },
  });
  const skelRunCtx = makeBattleCtx();
  skelScene.elapsed = 300;
  skelScene.render(skelRunCtx.ctx);
  assert.equal(skelRunCtx.calls.some(c => c[0] === 'drawImage' && /^skeleton_0[2-5]$/.test(c[1].name)), true, 'skeleton uses sprint frames');
  const golemCounterCtx = makeBattleCtx();
  skelScene.elapsed = skelScene.counterStart + 500;
  skelScene.render(golemCounterCtx.ctx);
  assert.equal(golemCounterCtx.calls.some(c => c[0] === 'drawImage' && c[1].name === 'crater'), true, 'golem impact spawns crater');
  assert.equal(golemCounterCtx.calls.some(c => c[0] === 'drawImage' && c[1].name === 'smoke'), true, 'golem impact spawns smoke');

  const kingScene = new BattleScene({
    attacker: { type: 9, palette: 1, kingHead: 0, hp: 100 },
    attackerName: 'COMMANDER',
    attackerTerrain: 1,
    defender: { type: 8, palette: 2, hp: 100 },
    defenderName: 'DRAGON',
    defenderTerrain: 4,
    combatResult: { attackerHpBefore: 100, defenderHpBefore: 100, attackerHpAfter: 80, defenderHpAfter: 60, damage: 40, counterDamage: 20 },
    assets: {
      unitRecords,
      unitFamilies,
      sprites: commonSprites,
      images: { kingslash: img('kingslash', 41, 72), kingwave: img('kingwave', 96, 34), b_smoke: img('b_smoke', 52, 10) },
      frameImages: {
        king: [img('king_00', 61, 38), img('king_01', 61, 38), img('king_02', 48, 75)],
        wyvern: [img('wyvern_00', 85, 56), img('wyvern_01', 85, 56), img('wyvern_02', 85, 56)],
      },
      coloredPalettes: { 1: {}, 2: {} },
    },
  });
  const kingWaveCtx = makeBattleCtx();
  kingScene.elapsed = 420;
  kingScene.render(kingWaveCtx.ctx);
  const waveDraws = kingWaveCtx.calls.filter(c => c[0] === 'drawImage' && c[1].name === 'kingwave');
  assert.equal(kingWaveCtx.calls.some(c => c[0] === 'drawImage' && c[1].name === 'kingslash'), true, 'king draws kingslash aura');
  assert.equal(waveDraws.length, 2, 'king launches dual kingwaves');
  const dragonBreathCtx = makeBattleCtx();
  kingScene.elapsed = kingScene.counterStart + 420;
  kingScene.render(dragonBreathCtx.ctx);
  assert.equal(dragonBreathCtx.calls.some(c => c[0] === 'drawImage' && c[1].name === 'wyvern_02'), true, 'dragon uses roaring frame 2');
  assert.equal(dragonBreathCtx.calls.filter(c => c[0] === 'fill').length >= 2, true, 'dragon breathes fire beam polygon');
});
