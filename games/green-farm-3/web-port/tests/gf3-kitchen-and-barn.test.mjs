import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadOriginalWorldResources } from '../gf3-resource-loader.js';
import {
  SOURCE_VIEW, createFarmSession, stepFarmSession,
  startKitchenRecipe, collectKitchenDish, upgradeBarn, sellGood,
} from '../gf-core.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webPortDir = path.resolve(__dirname, '..');
const textData = JSON.parse(fs.readFileSync(path.join(webPortDir, 'assets/text/en.json'), 'utf8'));
const baseUrl = new URL('../assets/packs/', import.meta.url).href;

function localFetcher(url) {
  const filePath = fileURLToPath(url);
  if (!fs.existsSync(filePath)) return Promise.resolve({ ok: false, status: 404 });
  const buf = fs.readFileSync(filePath);
  return Promise.resolve({
    ok: true,
    arrayBuffer: async () => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
    json: async () => JSON.parse(buf.toString('utf8')),
  });
}

test('kitchen 4-stove cap, ingredient validation, cooking completion, barn sell & upgrade', async () => {
  const world = await loadOriginalWorldResources({ baseUrl, fetcher: localFetcher, textData });
  const s = createFarmSession(world, textData);
  s.view = SOURCE_VIEW.WORLD_LAYER;
  s.level = 10;
  s.coins = 1000;

  const flour = world.catalog.recipes.find(r => r.id === 6001);
  assert.ok(flour);

  // Missing ingredient rejected cleanly
  assert.equal(startKitchenRecipe(s, flour.id).reason, 'missing_ingredient');

  // Stock ingredients for 5 batches -> 4 stoves succeed, 5th hits 'full'
  for (const ing of flour.ingredients) {
    s.inventory.set(ing.goodId, { id: ing.goodId, name: ing.name, qty: ing.qty * 5, sellPrice: 20 });
  }
  for (let i = 0; i < 4; i += 1) {
    assert.equal(startKitchenRecipe(s, flour.id).ok, true);
  }
  assert.equal(startKitchenRecipe(s, flour.id).reason, 'full');

  // Step timer -> collect all 4 dishes -> sell from Barn -> upgrade Barn capacity
  stepFarmSession(s, flour.cookSec * 1000 + 200);
  while (s.kitchenQueue.length > 0) {
    assert.equal(collectKitchenDish(s, s.kitchenQueue[0].uid).ok, true);
  }
  assert.equal(s.inventory.get(flour.outputGoodId).qty, 4);

  const coinsBefore = s.coins;
  assert.equal(sellGood(s, flour.outputGoodId, 4).ok, true);
  assert.ok(s.coins > coinsBefore);

  const capBefore = s.barnCapacity;
  assert.equal(upgradeBarn(s).ok, true);
  assert.equal(s.barnCapacity, capBefore + 20);
});
