import assert from 'node:assert/strict';
import test from 'node:test';
import { anchorPosition, drawRegionMIDP, MIDP_ANCHOR, withMIDPClip } from '../ancient-empires-midp.js';

const image = { name: 'sprite' };

function recorder() {
  const calls = [];
  const ctx = {
    imageSmoothingEnabled: true,
    save: () => calls.push(['save']), restore: () => calls.push(['restore']),
    beginPath: () => calls.push(['beginPath']), rect: (...args) => calls.push(['rect', ...args]), clip: () => calls.push(['clip']),
    translate: (...args) => calls.push(['translate', ...args]), rotate: (...args) => calls.push(['rotate', ...args]), scale: (...args) => calls.push(['scale', ...args]),
    drawImage: (...args) => calls.push(['drawImage', ...args]),
  };
  return { ctx, calls };
}

test('MIDP anchor bits produce the original top/center/right and bottom coordinates', () => {
  assert.deepEqual(anchorPosition(20, 30, 11, 9, MIDP_ANCHOR.LEFT | MIDP_ANCHOR.TOP), { x: 20, y: 30 });
  assert.deepEqual(anchorPosition(20, 30, 11, 9, MIDP_ANCHOR.HCENTER | MIDP_ANCHOR.VCENTER), { x: 15, y: 26 });
  assert.deepEqual(anchorPosition(20, 30, 11, 9, MIDP_ANCHOR.RIGHT | MIDP_ANCHOR.BOTTOM), { x: 9, y: 21 });
});

test('drawRegionMIDP emits exact rectangle and all eight transforms with smoothing disabled', () => {
  for (let transform = 0; transform < 8; transform++) {
    const { ctx, calls } = recorder();
    drawRegionMIDP(ctx, image, 2, 3, 8, 6, transform, 20, 30, MIDP_ANCHOR.LEFT | MIDP_ANCHOR.TOP);
    assert.equal(ctx.imageSmoothingEnabled, false);
    assert.deepEqual(calls.filter(call => call[0] === 'drawImage')[0].slice(1),
      [image, 2, 3, 8, 6, transform === 0 ? 20 : -4, transform === 0 ? 30 : -3, 8, 6]);
    if (transform !== 0) {
      assert.equal(calls.filter(call => call[0] === 'save').length, 1);
      assert.equal(calls.filter(call => call[0] === 'restore').length, 1);
    }
  }
});

test('drawRegionMIDP rejects transform values outside MIDP range', () => {
  const { ctx } = recorder();
  assert.throws(() => drawRegionMIDP(ctx, image, 0, 0, 1, 1, 8, 0, 0), /invalid MIDP transform/);
});

test('MIDP clip restores Canvas state even if renderer throws', () => {
  const { ctx, calls } = recorder();
  assert.throws(() => withMIDPClip(ctx, 1, 2, 3, 4, () => { throw new Error('render failed'); }), /render failed/);
  assert.deepEqual(calls.map(call => call[0]), ['save', 'beginPath', 'rect', 'clip', 'restore']);
});
