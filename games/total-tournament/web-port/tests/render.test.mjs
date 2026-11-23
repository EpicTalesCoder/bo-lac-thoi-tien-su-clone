import test from 'node:test';
import assert from 'node:assert/strict';
import { renderOriginal } from '../render-original.js';

function createContext() {
  const calls = [];
  return {
    calls, imageSmoothingEnabled: true,
    save() {}, restore() {}, beginPath() {}, rect() {}, clip() {}, translate() {}, scale() {}, rotate() {},
    drawImage(...args) { calls.push(args); },
    fillRect() {},
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
