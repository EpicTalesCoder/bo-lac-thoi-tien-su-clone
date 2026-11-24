// Browser-side input and loop boundary for Total Tournament source semantics.
export const TICK_TARGET_MS = 77;
export const MODE = Object.freeze({ DEATHMATCH: 0, TEAM_DEATHMATCH: 1, SURVIVAL: 2, CAPTURE_FLAG: 3, LAST_HERO: 4 });

export const KEY_ACTIONS = Object.freeze(['left', 'right', 'jump', 'drop', 'fire', 'switchWeapon']);
export const DEFAULT_KEY_BINDINGS = Object.freeze({
  left: 'KeyA',
  right: 'KeyD',
  jump: 'KeyW',
  drop: 'KeyS',
  fire: 'Space',
  switchWeapon: 'KeyQ',
});

export function formatKeyLabel(keyToken) {
  const code = String(keyToken || '').trim();
  if (!code) return '-';
  if (code.startsWith('Key') && code.length === 4) return code.slice(3).toUpperCase();
  if (code.startsWith('Digit') && code.length === 6) return code.slice(5);
  if (code.startsWith('Numpad')) return `NUM${code.slice(6).toUpperCase()}`;
  if (code === 'Space' || code === ' ') return 'SPACE';
  if (code === 'Enter') return 'ENTER';
  if (code === 'Tab') return 'TAB';
  if (code === 'ArrowLeft') return 'LEFT';
  if (code === 'ArrowRight') return 'RIGHT';
  if (code === 'ArrowUp') return 'UP';
  if (code === 'ArrowDown') return 'DOWN';
  if (code === 'ShiftLeft' || code === 'ShiftRight') return 'SHIFT';
  if (code === 'ControlLeft' || code === 'ControlRight') return 'CTRL';
  if (code === 'AltLeft' || code === 'AltRight') return 'ALT';
  return code.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 6) || '?';
}

export function normalizePhysicalKey(key = '', eventCode = '') {
  if (eventCode) return String(eventCode);
  const k = String(key || '');
  if (!k) return '';
  if (k === ' ') return 'Space';
  if (k === 'Enter' || k === 'Tab' || k === 'Escape' || k === 'Backspace') return k;
  if (k.startsWith('Arrow')) return k;
  if (/^[a-zA-Z]$/.test(k)) return `Key${k.toUpperCase()}`;
  if (/^[0-9]$/.test(k)) return `Digit${k}`;
  return k;
}

// Port of e.java:3053-3057. ccs rows are loaded from the original table in tt-loader.js.
export function getUiSpriteRect(ccs, spriteId, bankColumn = 6) {
  return {
    sourceX: ccs[0][spriteId], sourceY: ccs[1][spriteId],
    width: ccs[2][spriteId], height: ccs[3][spriteId],
    offsetX: ccs[4][spriteId], offsetY: ccs[5][spriteId],
    sheetIndex: ccs[bankColumn][spriteId],
  };
}

// Port of e.java:2217-2253. Device arrows/softkeys are normalized to the
// numeric keypad codes consumed by run(); physical eventCode handles WASD/Q regardless of IME.
export function normalizeKey(key, eventCode = '') {
  if (eventCode === 'KeyW') return 50;
  if (eventCode === 'KeyS') return 56;
  if (eventCode === 'KeyA') return 52;
  if (eventCode === 'KeyD') return 54;
  if (eventCode === 'KeyQ') return 81;
  if (eventCode === 'Space') return 53;
  if (key === 'ArrowUp' || key === 'w' || key === 'W') return 50;
  if (key === 'ArrowDown' || key === 's' || key === 'S') return 56;
  if (key === 'ArrowLeft' || key === 'a' || key === 'A') return 52;
  if (key === 'ArrowRight' || key === 'd' || key === 'D') return 54;
  if (key === 'Enter' || key === ' ') return 53;
  if (/^[0-9]$/.test(key)) return key.charCodeAt(0);
  if (key === '*') return 42;
  if (key === '#' || key === 'Escape' || key === 'p' || key === 'P') return 35;
  if (key === 'q' || key === 'Q' || key === 'Tab') return 81;
  if (key === 'Backspace') return -7;
  return 0;
}

// Port of e.java:3221-3242 with customizable key bindings (default switchWeapon = Q).
export function decodeGameplayKey(keyOrEvent, bindings = DEFAULT_KEY_BINDINGS) {
  if (typeof keyOrEvent === 'object' && keyOrEvent !== null) {
    const phys = normalizePhysicalKey(keyOrEvent.rawKey, keyOrEvent.rawCode);
    const activeBindings = { ...DEFAULT_KEY_BINDINGS, ...(bindings || {}) };
    for (const action of KEY_ACTIONS) {
      if (phys && activeBindings[action] === phys) return action;
    }
    if (phys === 'ArrowLeft' || phys === 'Numpad4') return 'left';
    if (phys === 'ArrowRight' || phys === 'Numpad6') return 'right';
    if (phys === 'ArrowUp' || phys === 'Numpad2') return 'jump';
    if (phys === 'ArrowDown' || phys === 'Numpad8') return 'drop';
    if (phys === 'Enter' || phys === 'Numpad5') return 'fire';
    if (phys === 'Tab') return 'switchWeapon';
    if (keyOrEvent.code && !phys) return decodeGameplayKey(keyOrEvent.code, bindings);
    return null;
  }
  const keyCode = keyOrEvent;
  if (keyCode === 50) return 'jump';
  if (keyCode === 52) return 'left';
  if (keyCode === 53) return 'fire';
  if (keyCode === 54) return 'right';
  if (keyCode === 56) return 'drop';
  if (keyCode === 81) return 'switchWeapon';
  return null;
}

// Port of e.java:1532-1546 and e.java:3110-3190. Keep input events separate
// from source ticks; an update is scheduled at the source's 77ms render budget
// with scancode-safe key release, window blur reset, and 60fps interpolation alpha.
export function lerpCoordRound(prev, curr, alpha) {
  return Math.round(prev + (curr - prev) * alpha);
}

export function createEngineLoop({ tick, render, now = () => performance.now(), frameBudget = TICK_TARGET_MS }) {
  let alive = false;
  let lastFrame = 0;
  let raf = 0;
  const input = new Set();
  const scancodeOwner = new Map();

  const shouldPreventDefault = (key) => (
    key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight'
    || key === ' ' || key === 'Tab'
  );

  const isEditableTarget = (target) => {
    if (!target) return false;
    const tag = target.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || Boolean(target.isContentEditable);
  };

  const onDown = (event) => {
    if (isEditableTarget(event.target)) return;
    const rawKey = event.key || '';
    const rawCode = event.code || '';
    const code = normalizeKey(rawKey, rawCode);
    if (!code && !rawKey && !rawCode) return;
    if (shouldPreventDefault(rawKey)) event.preventDefault?.();
    if (event.repeat) return;
    const ownerKey = rawCode || rawKey;
    if (ownerKey) scancodeOwner.set(ownerKey, { code, rawKey, rawCode });
    if (code) input.add(code);
    tick({ type: 'key-down', code, rawKey, rawCode });
  };
  const onUp = (event) => {
    if (isEditableTarget(event.target)) return;
    const ownerKey = event.code || event.key || '';
    const owned = ownerKey ? scancodeOwner.get(ownerKey) : null;
    if (ownerKey) scancodeOwner.delete(ownerKey);
    const rawKey = owned?.rawKey ?? (event.key || '');
    const rawCode = owned?.rawCode ?? (event.code || '');
    const code = owned?.code ?? normalizeKey(rawKey, rawCode);
    if (!code && !rawKey && !rawCode) return;
    if (code) input.delete(code);
    tick({ type: 'key-up', code, rawKey, rawCode });
  };
  const onBlur = () => {
    if (input.size === 0 && scancodeOwner.size === 0) return;
    input.clear();
    scancodeOwner.clear();
    tick({ type: 'focus-lost' });
  };
  const onFrame = () => {
    if (!alive) return;
    const start = now();
    let ticks = 0;
    while (start - lastFrame >= frameBudget && ticks < 6) {
      tick({ type: 'source-tick', input: new Set(input) });
      lastFrame += frameBudget;
      ticks += 1;
    }
    if (ticks === 6) lastFrame = start;
    const alpha = Math.max(0, Math.min(1, (start - lastFrame) / frameBudget));
    render(alpha);
    raf = requestAnimationFrame(onFrame);
  };
  return {
    start() {
      if (alive) return;
      alive = true;
      lastFrame = now();
      window.addEventListener('keydown', onDown);
      window.addEventListener('keyup', onUp);
      window.addEventListener('blur', onBlur);
      raf = requestAnimationFrame(onFrame);
    },
    stop() {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      window.removeEventListener('blur', onBlur);
      input.clear();
      scancodeOwner.clear();
    },
  };
}
