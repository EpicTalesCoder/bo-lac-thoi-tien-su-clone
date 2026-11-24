// Browser-side input and loop boundary for Total Tournament source semantics.
export const TICK_TARGET_MS = 77;
export const MODE = Object.freeze({ DEATHMATCH: 0, TEAM_DEATHMATCH: 1, SURVIVAL: 2, CAPTURE_FLAG: 3, LAST_HERO: 4 });

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
// numeric keypad codes consumed by run(); WASD are only web aliases.
export function normalizeKey(key) {
  if (key === 'ArrowUp' || key === 'w' || key === 'W') return 50;
  if (key === 'ArrowDown' || key === 's' || key === 'S') return 56;
  if (key === 'ArrowLeft' || key === 'a' || key === 'A') return 52;
  if (key === 'ArrowRight' || key === 'd' || key === 'D') return 54;
  if (key === 'Enter' || key === ' ') return 53;
  if (/^[0-9]$/.test(key)) return key.charCodeAt(0);
  if (key === '*') return 42;
  if (key === '#' || key === 'Escape' || key === 'p' || key === 'P') return 35;
  if (key === 'q' || key === 'Q' || key === 'Tab') return 48;
  if (key === 'Backspace') return -7;
  return 0;
}

// Port of e.java:3221-3242. Numeric keypad 2/4/5/6/8/0 have source meanings.
export function decodeGameplayKey(keyCode) {
  if (keyCode === 50) return 'jump';
  if (keyCode === 52) return 'left';
  if (keyCode === 53) return 'fire';
  if (keyCode === 54) return 'right';
  if (keyCode === 56) return 'drop';
  if (keyCode === 48) return 'switchWeapon';
  return null;
}

// Port of e.java:1532-1546 and e.java:3110-3190. Keep input events separate
// from source ticks; an update is scheduled at the source's 77ms render budget.
export function createEngineLoop({ tick, render, now = () => performance.now(), frameBudget = TICK_TARGET_MS }) {
  let alive = false;
  let lastFrame = 0;
  let raf = 0;
  const input = new Set();
  const onDown = (event) => {
    const code = normalizeKey(event.key);
    if (!code || event.repeat) return;
    input.add(code);
    tick({ type: 'key-down', code });
  };
  const onUp = (event) => {
    const code = normalizeKey(event.key);
    if (!code) return;
    input.delete(code);
    tick({ type: 'key-up', code });
  };
  const onFrame = () => {
    if (!alive) return;
    const start = now();
    if (start - lastFrame >= frameBudget) {
      tick({ type: 'source-tick', input: new Set(input) });
      lastFrame = start;
    }
    render();
    raf = requestAnimationFrame(onFrame);
  };
  return {
    start() {
      if (alive) return;
      alive = true;
      lastFrame = now();
      window.addEventListener('keydown', onDown);
      window.addEventListener('keyup', onUp);
      raf = requestAnimationFrame(onFrame);
    },
    stop() {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      input.clear();
    },
  };
}
