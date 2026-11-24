import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createEngineLoop,
  decodeGameplayKey,
  DEFAULT_KEY_BINDINGS,
  formatKeyLabel,
  getUiSpriteRect,
  lerpCoordRound,
  MODE,
  normalizeKey,
} from '../tt-core.js';

test('browser keyboard aliases map to the J2ME numeric keypad contract and IME-safe physical WASD/Q', () => {
  for (const [key, code] of [
    ['ArrowUp', 50], ['ArrowDown', 56], ['ArrowLeft', 52], ['ArrowRight', 54],
    ['Enter', 53], [' ', 53], ['2', 50], ['4', 52], ['5', 53], ['6', 54], ['8', 56],
    ['q', 81], ['Q', 81], ['*', 42], ['#', 35],
  ]) assert.equal(normalizeKey(key), code);
  // Vietnamese Telex/Unikey IME letters still map via physical event.code
  assert.equal(normalizeKey('ư', 'KeyW'), 50);
  assert.equal(normalizeKey('ă', 'KeyA'), 52);
  assert.equal(normalizeKey('đ', 'KeyD'), 54);
  assert.equal(normalizeKey('á', 'KeyS'), 56);
  assert.equal(normalizeKey('q', 'KeyQ'), 81);

  assert.deepEqual([50, 52, 53, 54, 56, 81].map((c) => decodeGameplayKey(c)), ['jump', 'left', 'fire', 'right', 'drop', 'switchWeapon']);
  assert.equal(decodeGameplayKey(48), null, 'numeric 0 should no longer switch weapons by default');
  assert.equal(DEFAULT_KEY_BINDINGS.switchWeapon, 'KeyQ');
  assert.equal(formatKeyLabel('KeyQ'), 'Q');
  assert.equal(formatKeyLabel('Space'), 'SPACE');
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

test('lerpCoordRound and window blur focus-lost reset prevent ghosting and stuck keys', () => {
  assert.equal(lerpCoordRound(100, 116, 0), 100);
  assert.equal(lerpCoordRound(100, 116, 0.5), 108);
  assert.equal(lerpCoordRound(100, 116, 1), 116);

  const originalWindow = globalThis.window;
  const originalRAF = globalThis.requestAnimationFrame;
  const originalCancelRAF = globalThis.cancelAnimationFrame;
  const listeners = new Map();
  globalThis.window = {
    addEventListener(name, cb) { listeners.set(name, cb); },
    removeEventListener(name) { listeners.delete(name); },
  };
  globalThis.requestAnimationFrame = () => 1;
  globalThis.cancelAnimationFrame = () => {};
  try {
    const events = [];
    const loop = createEngineLoop({ tick: (e) => events.push(e), render: () => {}, now: () => 0 });
    loop.start();
    listeners.get('keydown')({ key: '*', code: 'Digit8', repeat: false });
    listeners.get('keyup')({ key: '8', code: 'Digit8' }); // Shift released early
    assert.equal(events.at(-1).code, 42, 'scancode ownership must release * even if Shift released first');
    listeners.get('keydown')({ key: 'ArrowRight', code: 'ArrowRight', repeat: false });
    listeners.get('blur')();
    assert.equal(events.at(-1).type, 'focus-lost', 'window blur must clear held keys via focus-lost');
    loop.stop();
  } finally {
    globalThis.window = originalWindow;
    globalThis.requestAnimationFrame = originalRAF;
    globalThis.cancelAnimationFrame = originalCancelRAF;
  }
});
