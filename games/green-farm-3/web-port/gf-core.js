/**
 * Source-evidence view state for Green Farm 3.
 * The former editable farm/economy prototype has been removed: no crop prices,
 * growing timers, shop rewards, or local farm rules are inferred here.
 */
export const SCREEN_W = 240;
export const SCREEN_H = 320;

// Port of f.java:107-127 and f.java:319-333 (MIDP keypad bindings).
export const KEY = Object.freeze({
  UP: -1, DOWN: -2, LEFT: -3, RIGHT: -4,
  FIRE: -5, SK_LEFT: -6, SK_RIGHT: -7,
});

export function mapKeyCode(code, key) {
  switch (code) {
    case 'ArrowUp': case 'KeyW': return KEY.UP;
    case 'ArrowDown': case 'KeyS': return KEY.DOWN;
    case 'ArrowLeft': case 'KeyA': return KEY.LEFT;
    case 'ArrowRight': case 'KeyD': return KEY.RIGHT;
    case 'Enter': case 'Space': return KEY.FIRE;
    case 'KeyQ': return KEY.SK_LEFT;
    case 'KeyE': case 'Escape': case 'Backspace': return KEY.SK_RIGHT;
    default:
      if (/^Digit[0-9]$/.test(code || '')) return Number(code.slice(5));
      if (key === '5') return 5;
      return null;
  }
}

export const SOURCE_VIEW = Object.freeze({
  OPENING_SCRIPT: 'opening-script-evidence',
  WORLD_LAYER: 'world-layer-evidence',
});

// Port of f.paint(Graphics): elapsed time is clamped to [0,1000] ms.
export function sourceFrame(previousAt, now) {
  const elapsedMs = Math.max(0, Math.min(1000, (now - previousAt) | 0));
  return { now, elapsedMs };
}

// The source script records opcode-110 text IDs on event keys 5 and 7. Their
// trigger schedule is not proven; this is an evidence inspection sequence only.
// Port of a.java:17322-17548, 17555-17589.
export function newEvidenceSession(worldResources) {
  const group = worldResources?.openingScript?.scripts?.[0]?.groups
    ?.find((item) => item.groupType === 0 && item.context === 0);
  const dialogue = group?.records.flatMap((record) => record.commands
    .filter((command) => command.opcode === 110)
    .map((command) => ({ eventKey: record.eventKey, textId: command.args[0] }))) ?? [];
  return {
    view: SOURCE_VIEW.OPENING_SCRIPT,
    dialogue,
    dialogueIndex: 0,
    selectedTile: null,
    frame: 0,
    lastFrameAt: null,
  };
}

// Browser clicks only inspect the source numeric layer. The original MIDlet's
// pointer callbacks track press/drag duration and do not prove direct tile actions.
// Port of a.java:16078-16088.
export function sourceTileAt(tileMap, screenX, screenY, cameraX = 0, cameraY = 0) {
  if (!tileMap || !Number.isFinite(screenX) || !Number.isFinite(screenY)) return null;
  const column = Math.floor((screenX + cameraX) / tileMap.tileWidth);
  const row = Math.floor((screenY + cameraY) / tileMap.tileHeight);
  if (column < 0 || column >= tileMap.width || row < 0 || row >= tileMap.height) return null;
  const index = row * tileMap.width + column;
  return {
    row,
    column,
    tileId: tileMap.tileIds[index],
    attributes: tileMap.attributes[index],
    sourceCellIndex: index,
  };
}

// Advances only the evidence-view UI. It does not claim to simulate original
// farm mechanics or the game event scheduler.
export function advanceEvidenceView(session, key) {
  if (!session) return session;
  if (session.view === SOURCE_VIEW.OPENING_SCRIPT) {
    if (key !== KEY.FIRE && key !== 5 && key !== KEY.SK_RIGHT) return session;
    if (session.dialogueIndex + 1 < session.dialogue.length) {
      return { ...session, dialogueIndex: session.dialogueIndex + 1 };
    }
    return { ...session, view: SOURCE_VIEW.WORLD_LAYER };
  }
  return session;
}

export function sourceText(textData, globalTextId) {
  if (!textData || !Number.isInteger(globalTextId) || globalTextId < 0) return '';
  const page = globalTextId >>> 10;
  const index = globalTextId & 0x3ff;
  return textData[`page_${page}`]?.[String(index)] ?? '';
}
