import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadOriginalWorldResources } from '../gf3-resource-loader.js';
import {
  SOURCE_VIEW, createFarmSession, stepFarmSession,
  pickFarmerWalkAnim, snapPlotToIso4x4, isWalkBlocked,
  moveFarmerByVector, plowPlot,
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

test('farmer directional animations, 80ms clock, pond/manor collision & 4x4 non-overlapping plots', async () => {
  const world = await loadOriginalWorldResources({ baseUrl, fetcher: localFetcher, textData });
  const s = createFarmSession(world, textData);
  s.view = SOURCE_VIEW.WORLD_LAYER;

  // Pure Left/Right always uses front-walk anim 0 (never turns back)
  assert.deepEqual(pickFarmerWalkAnim(1, 0), { anim: 0, hFlip: true });
  assert.deepEqual(pickFarmerWalkAnim(-1, 0), { anim: 0, hFlip: false });
  assert.deepEqual(pickFarmerWalkAnim(0, -1), { anim: 1, hFlip: false });
  assert.deepEqual(pickFarmerWalkAnim(0, 1), { anim: 0, hFlip: false });

  // Collision blocks Pond (1044, 603) and Manor core (1215, 384)
  assert.equal(isWalkBlocked(1044, 603, world.tileMap), true);
  assert.equal(isWalkBlocked(1215, 384, world.tileMap), true);
  assert.equal(isWalkBlocked(1089, 428, world.tileMap), false);

  // Farmer movement advances position and 80ms animation clock
  const startX = s.farmer.x;
  moveFarmerByVector(s, -1, 0, 100, world.tileMap);
  assert.ok(s.farmer.x < startX);
  stepFarmSession(s, 160, world.tileMap);
  assert.equal(s.animTimeMs, 160);

  // 4x4 plot snapping prevents overlapping plots
  const snapped = snapPlotToIso4x4(900, 520);
  const first = plowPlot(s, 29, 25, snapped.wx, snapped.wy);
  assert.equal(first.ok, true);
  const overlap = plowPlot(s, 29, 26, snapped.wx + 5, snapped.wy + 3);
  assert.equal(overlap.ok, false);
  assert.equal(overlap.reason, 'overlap');
});
