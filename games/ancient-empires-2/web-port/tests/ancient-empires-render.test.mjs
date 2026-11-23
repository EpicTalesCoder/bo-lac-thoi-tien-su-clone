import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { decodeMap, decodeSprite, decodeTerrainProperties } from '../ancient-empires-loader.js';
import { renderOriginalBoard } from '../render-original.js';

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
