import test from 'node:test';
import assert from 'node:assert/strict';
import { createEngineLoop, decodeGameplayKey, getUiSpriteRect, MODE, normalizeKey } from '../tt-core.js';

test('browser keyboard aliases map to the J2ME numeric keypad contract', () => {
  for (const [key, code] of [
    ['ArrowUp', 50], ['ArrowDown', 56], ['ArrowLeft', 52], ['ArrowRight', 54],
    ['Enter', 53], [' ', 53], ['2', 50], ['4', 52], ['5', 53], ['6', 54], ['8', 56],
    ['*', 42], ['#', 35],
  ]) assert.equal(normalizeKey(key), code);
  assert.deepEqual([50, 52, 53, 54, 56].map(decodeGameplayKey), ['jump', 'left', 'fire', 'right', 'drop']);
  assert.equal(MODE.CAPTURE_FLAG, 3);
});

test('ccs indices select original image bank and clip metadata', () => {
  const columns = Array.from({ length: 7 }, (_, column) => [column * 10]);
  assert.deepEqual(getUiSpriteRect(columns, 0), {
    sourceX: 0, sourceY: 10, width: 20, height: 30, offsetX: 40, offsetY: 50, sheetIndex: 60,
  });
  assert.equal(getUiSpriteRect(columns, 0, 4).sheetIndex, 40);
});

test('engine loop emits one source tick per budget and releases mapped key state', () => {
  const originalWindow = globalThis.window;
  const originalRAF = globalThis.requestAnimationFrame;
  const originalCancelRAF = globalThis.cancelAnimationFrame;
  const listeners = new Map();
  let frameCallback;
  globalThis.window = {
    addEventListener(name, callback) { listeners.set(name, callback); },
    removeEventListener(name) { listeners.delete(name); },
  };
  globalThis.requestAnimationFrame = (callback) => { frameCallback = callback; return 1; };
  globalThis.cancelAnimationFrame = () => {};
  try {
    let time = 0;
    const events = [];
    let paints = 0;
    const loop = createEngineLoop({ tick: (event) => events.push(event), render: () => paints++, now: () => time, frameBudget: 77 });
    loop.start();
    listeners.get('keydown')({ key: 'ArrowLeft', repeat: false });
    time = 76; frameCallback();
    assert.equal(events.filter((event) => event.type === 'source-tick').length, 0);
    time = 77; frameCallback();
    assert.equal(events.filter((event) => event.type === 'source-tick').length, 1);
    assert.ok(events.find((event) => event.type === 'source-tick').input.has(52));
    listeners.get('keyup')({ key: 'ArrowLeft' });
    time = 154; frameCallback();
    assert.equal(events.at(-1).type, 'source-tick');
    assert.equal(events.at(-1).input.has(52), false);
    assert.ok(paints >= 3);
    loop.stop();
    assert.equal(listeners.size, 0);
  } finally {
    globalThis.window = originalWindow;
    globalThis.requestAnimationFrame = originalRAF;
    globalThis.cancelAnimationFrame = originalCancelRAF;
  }
});
