import { loadOriginalImages, loadOriginalTables } from './tt-loader.js';
import { decodeJ2meText, parseJ2meTextTable, wrapJ2meText } from './text-original.js';
import { decodeFontMetrics, createOriginalFont } from './font-original.js';
import { renderOriginal, drawCu2Frame as renderCu2Frame, drawCtfFlag } from './render-original.js';
import {
  TICK_TARGET_MS,
  createEngineLoop,
  decodeGameplayKey,
  getUiSpriteRect,
  lerpCoordRound,
  MODE,
  KEY_ACTIONS,
  DEFAULT_KEY_BINDINGS,
  formatKeyLabel,
  normalizePhysicalKey,
} from './tt-core.js';
import { playSourceSound } from './tt-audio.js';
import { drawLineMIDP, drawRectMIDP, withMIDPClip } from './midp-graphics.js';
import {
  createSourceMatch,
  tickSourceMatch,
  packMatchSnapshot,
  applyMatchSnapshot,
  poseForActor,
  EFFECT_FRAMES,
  PROJECTILE_SPRITE_BASE,
  DEFAULT_SETTINGS,
} from './tt-match.js';
import { MultiplayerClient, generateRoomCode } from './multiplayer.js';
import { loadSave, saveSave, LANG, getLang } from './storage-i18n.js';

const WIDTH = 240;
const HEIGHT = 320;
const canvas = typeof document !== 'undefined' ? document.querySelector('#game') : null;
const ctx = canvas?.getContext('2d', { alpha: false });
if (canvas) { canvas.width = WIDTH; canvas.height = HEIGHT; }
if (ctx) ctx.imageSmoothingEnabled = false;

const savedState = loadSave();

const app = {
  screen: 'startup',
  J: true,
  K: 0,
  lang: getLang(savedState),
  mode: MODE.DEATHMATCH,
  character: 0, // 0 = Soldier, 1 = Mutant
  levelIndex: 0,
  selection: 0,
  selectionDirection: 1,
  configPage: 0,
  softkeyPressed: null, // 'left' | 'right' | null (ccs[34]/ccs[35])
  typeState: { key: '', sel: -1, lineIdx: 0, charIdx: 0, scrollIdx: 0, timer: 4, showCursor: true },
  loadingTicks: 0,
  cheatAllWeapons: false,
  cheatBuf: [],
  soundEnabled: savedState.soundEnabled ?? true,
  vibroEnabled: savedState.vibroEnabled ?? true,
  detailLevel: savedState.detailLevel ?? 2,
  images: {},
  data: null,
  font: null,
  loop: null,
  match: null,
  input: Object.create(null),
  settings: {
    ...DEFAULT_SETTINGS,
    ...(savedState.settings || {}),
    balance: [...(savedState.settings?.balance || DEFAULT_SETTINGS.balance)],
  },
  keyBindings: {
    ...DEFAULT_KEY_BINDINGS,
    ...(savedState.keyBindings || {}),
  },
  rebindingAction: null,
  mpMode: 'single',
  mpClient: null,
  mpLobby: null,
  mpConfig: null,
  mpWorker: null,
  mpWorkerRunning: false,
  mpLastInputSent: '',
  mpInputTick: 0,
  mpFinishTriggered: false,
};

function t() {
  return LANG[app.lang === 'en' ? 'en' : 'vi'];
}

function syncLangButton() {
  if (typeof document === 'undefined') return;
  const btn = document.getElementById('btn-lang');
  if (btn) btn.textContent = app.lang === 'en' ? '🌐 EN' : '🌐 VI';
  renderMpTexts();
  renderMpLobby();
}

export function toggleLanguage() {
  app.lang = app.lang === 'vi' ? 'en' : 'vi';
  syncLangButton();
  persistSettings();
}

function persistSettings() {
  saveSave({
    ...loadSave(),
    lang: app.lang,
    soundEnabled: app.soundEnabled,
    vibroEnabled: app.vibroEnabled,
    detailLevel: app.detailLevel,
    settings: { ...app.settings, balance: [...app.settings.balance] },
    keyBindings: { ...app.keyBindings },
  });
}

function drawSprite(ctx2d, spriteId, x, y) {
  const rect = getUiSpriteRect(app.data.ccs, spriteId, 6);
  const sheet = app.images[`s${rect.sheetIndex}`];
  if (!sheet || rect.width <= 0 || rect.height <= 0) return;
  const rx = Math.round(x);
  const ry = Math.round(y);
  withMIDPClip(ctx2d, rx, ry, rect.width, rect.height, () => {
    ctx2d.drawImage(sheet, rx - rect.sourceX, ry - rect.sourceY);
  });
}

// Port of e.java:2482-2537 / HUD sprite digits (`ccs[1..10]` white 0..9, `ccs[11]` red 0).
function drawHudNumber(ctx2d, value, x, y) {
  const str = String(value ?? 0);
  if (str === '0' && app.data?.ccs?.[2]?.[11] > 0) {
    drawSprite(ctx2d, 11, x, y);
    return;
  }
  const advance = (app.data?.ccs?.[2]?.[2] || 6) + 1;
  let penX = Math.round(x);
  for (const ch of str) {
    const code = ch.charCodeAt(0);
    if (code >= 48 && code <= 57) {
      drawSprite(ctx2d, code - 47, penX, y);
      penX += advance;
    }
  }
}

function measureHudNumberWidth(value, redCheck = false) {
  const str = String(value ?? 0);
  if (redCheck && str === '0') return app.data?.ccs?.[2]?.[11] || 7;
  const digitW = app.data?.ccs?.[2]?.[2] || 6;
  return str.length * (digitW + 1);
}

function drawCu2Frame(ctx2d, frameId, x, y, facing = 1, applyOffsets = false) {
  const meta = app.data?.cu2?.[frameId];
  renderCu2Frame(ctx2d, app.images, meta, x, y, facing, applyOffsets);
}

const UI_LINE_HEIGHT = 13;

function measureUiText(ctx2d, text) {
  const str = String(text ?? '');
  if (app.font) return app.font.measure(str);
  if (!ctx2d) return str.length * 6;
  return str.length * 6;
}

function wrapUiText(ctx2d, text, maxWidth) {
  if (app.font) {
    const paragraphs = String(text ?? '').split(/[\r\n]+/);
    const lines = [];
    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith('|')) {
        const subLines = wrapJ2meText(trimmed.slice(1), app.font, maxWidth);
        for (const s of subLines) lines.push(`|${s}`);
      } else {
        for (const s of wrapJ2meText(trimmed, app.font, maxWidth)) lines.push(s);
      }
    }
    return lines;
  }
  return String(text ?? '').split(/[\r\n]+/).filter(Boolean);
}

// Render crisp bitmap text using original `fnt.png` + `cf` metrics (`a.java`).
function drawText(ctx2d, text, x, y, anchor = 20) {
  const str = String(text ?? '');
  if (!str) return;
  if (app.font) {
    app.font.draw(ctx2d, str, Math.round(x), Math.round(y), anchor);
    return;
  }
  ctx2d.save();
  ctx2d.font = 'bold 9px monospace';
  ctx2d.textBaseline = 'top';
  ctx2d.textAlign = (anchor & 1) ? 'center' : (anchor & 8) ? 'right' : 'left';
  ctx2d.fillStyle = '#ffffff';
  ctx2d.fillText(str, Math.round(x), Math.round(y));
  ctx2d.restore();
}

function localizedLevelLabels() {
  const tr = t();
  return Array.from({ length: 12 }, (_, index) =>
    index === 11 ? tr.back : `${index + 1}. ${tr.levelPrefix} ${index + 1}`);
}

// Port of c.java:300-310 — Softkeys OK (`32`/`34` left) & Back (`33`/`35` right).
function drawSoftkeys(ctx2d) {
  const hL = app.data.ccs[3][32] || 19;
  const hR = app.data.ccs[3][33] || 19;
  const wR = app.data.ccs[2][33] || 24;
  drawSprite(ctx2d, app.softkeyPressed === 'left' ? 34 : 32, 0, HEIGHT - hL);
  drawSprite(ctx2d, app.softkeyPressed === 'right' ? 35 : 33, WIDTH - wR, HEIGHT - hR);
}

// Port of e.java:2485 / drawHudBox — crisp 1px MIDP rectangles matching J2ME digits.
function drawHudBox(ctx2d, x, y, borderHex, fillHex, digits, alignRight) {
  const digitW = (app.data.ccs[2][12] ? Math.floor(app.data.ccs[2][12] / Math.max(1, Math.abs(digits))) : 8);
  const boxW = Math.abs(digits) === 2
    ? (app.data.ccs[2][13] || 22)
    : (app.data.ccs[2][12] || (digitW * 3 + 6));
  const boxH = app.data.ccs[3][12] || 15;
  let drawX = Math.round(x);
  if (alignRight) {
    drawX -= boxW;
    if (digits < 0) drawX -= boxW;
  }
  const drawY = Math.round(y);
  ctx2d.fillStyle = fillHex;
  ctx2d.fillRect(drawX, drawY, boxW, boxH);
  drawRectMIDP(ctx2d, drawX + 1, drawY + 1, boxW - 2, boxH - 2, borderHex);
  drawRectMIDP(ctx2d, drawX, drawY, boxW, boxH, '#000000');
  return { x: drawX, y: drawY, w: boxW, h: boxH };
}

function drawFittedText(ctx2d, text, centerX, y, maxWidth) {
  const str = String(text ?? '');
  if (!str) return;
  if (app.font) {
    app.font.draw(ctx2d, str, Math.round(centerX), Math.round(y), 17);
    return;
  }
  drawText(ctx2d, str, centerX, y, 17);
}

// Port of c.java:783-802 — horizontal `ld.png` mechanical hazard curtains framing config & hero panes.
function drawCurtains(ctx2d, centerY, halfSpan) {
  const ld = app.images.ld;
  if (!ld) return;
  const cw = Math.max(1, ld.width);
  const ch = Math.max(4, ld.height);
  const qh = ch >> 2; // 9px visible band height
  const cols = Math.ceil(WIDTH / cw) + 1;

  const bottomY = Math.round(centerY + halfSpan);
  withMIDPClip(ctx2d, 0, bottomY, WIDTH, qh, () => {
    const drawY = bottomY - (ch - qh) + 1;
    for (let c = 0; c < cols; c++) ctx2d.drawImage(ld, c * cw, drawY);
  });

  const topY = Math.round(centerY - qh - halfSpan);
  withMIDPClip(ctx2d, 0, topY, WIDTH, qh, () => {
    const drawY = topY - (ch >> 1);
    for (let c = 0; c < cols; c++) ctx2d.drawImage(ld, c * cw, drawY);
  });
}

// Port of c.java:305-315 — top red mode title header bar with `curs.png` caps.
function drawHeaderBar(ctx2d, label) {
  const curs = app.images.curs;
  const cursH = curs?.height ?? 27;
  const cursCap = (curs?.width ?? 32) >> 1;
  const halfH = cursH >> 1;
  const S = 29;
  const R = WIDTH - 29 - cursCap;
  const barX = S + cursCap - 2;
  const barW = R - barX + 2;
  ctx2d.fillStyle = '#ff0000';
  ctx2d.fillRect(barX, 2, barW, cursH - 4);
  if (curs) {
    withMIDPClip(ctx2d, S, 0, cursCap, cursH, () => ctx2d.drawImage(curs, S, 0));
    withMIDPClip(ctx2d, R, 0, cursCap, cursH, () => ctx2d.drawImage(curs, R - cursCap, 0));
  }
  for (const off of [2, 4, cursH - 4, cursH - 2]) {
    drawLineMIDP(ctx2d, barX, off, R, off, '#000000');
  }
  for (const off of [3, cursH - 3]) {
    drawLineMIDP(ctx2d, barX, off, R, off, '#bbb800');
  }
  drawFittedText(ctx2d, label, WIDTH >> 1, halfH - ((app.font?.lineHeight ?? 13) >> 1) - 1, barW - 8);
}

// Advance typewriter text box state (c.java:635-675).
function drawTypewriterBox(ctx2d, key, desc, boxX, boxY, boxW, boxH) {
  const fontH = app.font?.lineHeight ?? UI_LINE_HEIGHT;
  ctx2d.fillStyle = '#172200';
  ctx2d.fillRect(boxX, boxY, boxW, boxH);
  drawRectMIDP(ctx2d, boxX - 1, boxY - 1, boxW + 1, boxH + 1, '#884800');

  const lines = wrapUiText(ctx2d, desc, boxW - 10);
  if (!lines.length) return;
  const maxLines = Math.max(1, Math.floor((boxH - 8) / fontH));

  if (app.typeState.key !== key) {
    app.typeState = {
      key,
      lineIdx: 0,
      charIdx: Math.min(lines[0].length, 8),
      scrollIdx: 0,
      timer: 1,
      showCursor: true,
    };
  }
  const ts = app.typeState;
  const visEnd = Math.min(ts.lineIdx, lines.length - 1);
  const start = ts.scrollIdx;
  for (let i = start; i < ts.scrollIdx + maxLines && i < visEnd; i++) {
    drawText(ctx2d, lines[i], boxX + 5, boxY + 4 + (i - start) * fontH, 20);
  }
  if (ts.lineIdx < lines.length) {
    const partial = lines[ts.lineIdx].slice(0, ts.charIdx);
    const drawRow = Math.min(maxLines - 1, ts.lineIdx - start);
    const lineY = boxY + 4 + drawRow * fontH;
    drawText(ctx2d, partial, boxX + 5, lineY, 20);
    if (ts.showCursor) {
      drawText(ctx2d, '_', boxX + 5 + measureUiText(ctx2d, partial), lineY, 20);
    }
  } else {
    for (let i = start; i < start + maxLines && i < lines.length; i++) {
      drawText(ctx2d, lines[i], boxX + 5, boxY + 4 + (i - start) * fontH, 20);
    }
  }
}

// Port of c.java:86-152, 1370-1504 using exact curs.png (32x27) & ld.png (20x38) geometry.
function getChoiceGeometry(labels, state) {
  const sourceCursor = app.images.curs;
  const sourceCursorWidth = sourceCursor?.width ?? 32;
  const sourceCursorHeight = sourceCursor?.height ?? 27;
  const capW = sourceCursorWidth >> 1; // 16px per side bracket
  const halfH = sourceCursorHeight >> 1; // 13px
  const modeSelection = state === 5;
  const characterSelection = state === 19 || state === 4;
  const rowHeight = characterSelection ? 28 : (modeSelection ? 28 : 30);
  const rows = labels.length;
  const visibleRows = Math.min(rows, 5);
  const Q = WIDTH >> 1;
  const S = 29; // Left bracket X (c.java:132)
  const R = WIDTH - 29 - capW; // Right bracket X (195, c.java:133)
  let listTop = (HEIGHT >> 1) - ((visibleRows * rowHeight) >> 1);
  if (modeSelection) listTop = 36;
  if (characterSelection) listTop = (HEIGHT >> 1) + (HEIGHT >> 2) - (rowHeight >> 1);
  const firstVisible = Math.max(0, Math.min(app.selection - 4, Math.max(0, rows - 5)));
  return { sourceCursor, sourceCursorWidth, sourceCursorHeight, capW, halfH, modeSelection, characterSelection, rowHeight, rows, visibleRows, Q, S, R, listTop, firstVisible };
}

function drawChoiceBar(ctx2d, g, y, fillStyle, inset, label, dy = 0) {
  const { sourceCursor, sourceCursorHeight, capW, halfH, Q, S, R } = g;
  const leftX = S - inset;
  const rightX = R + inset;
  const barTop = y - halfH;
  const innerLeft = leftX + capW - 2;
  const innerRight = rightX + 2;
  const innerW = Math.max(20, innerRight - innerLeft);
  const fontH = app.font?.lineHeight ?? UI_LINE_HEIGHT;

  ctx2d.fillStyle = fillStyle;
  ctx2d.fillRect(innerLeft, barTop + 3, innerW, sourceCursorHeight - 6);

  if (sourceCursor) {
    withMIDPClip(ctx2d, leftX, barTop, capW, sourceCursorHeight, () =>
      ctx2d.drawImage(sourceCursor, leftX, barTop));
    withMIDPClip(ctx2d, rightX, barTop, capW, sourceCursorHeight, () =>
      ctx2d.drawImage(sourceCursor, rightX - capW, barTop));
  }

  // Top & bottom crisp 1px metallic rails strictly between left & right brackets (c.java:1448-1456)
  for (const offset of [2, 4, sourceCursorHeight - 4, sourceCursorHeight - 2]) {
    drawLineMIDP(ctx2d, innerLeft, barTop + offset, innerRight, barTop + offset, '#000000');
  }
  for (const offset of [3, sourceCursorHeight - 3]) {
    drawLineMIDP(ctx2d, innerLeft, barTop + offset, innerRight, barTop + offset, '#bbb800');
  }

  drawFittedText(ctx2d, label, Q, y - (fontH >> 1) + dy - 1, innerW - 8);
}

function isMapLocked(state, index, totalRows) {
  return (state === 13 || state === 14) && app.mode === MODE.CAPTURE_FLAG && index > 4 && index < totalRows - 1;
}

function drawChoicePage(ctx2d, labels, state) {
  const tr = t();
  const fontH = app.font?.lineHeight ?? UI_LINE_HEIGHT;
  const g = getChoiceGeometry(labels, state);
  const confirmation = state === 0;
  const { modeSelection, characterSelection, rowHeight, Q, listTop, firstVisible } = g;

  if (characterSelection) {
    // Port of c.java:751-781 & 1476-1504: f1/f2 vaults framed by ld.png hazard curtains (no li1/li2 bg).
    app.character = app.selection === 1 ? 1 : 0;
    const f1 = app.images.f1;
    const f2 = app.images.f2;
    const pW = f1?.width ?? 48;
    const pH = f1?.height ?? 68;
    const bandH = pH + (pH >> 2);
    const halfSpan = bandH >> 1;
    const bandCenterY = HEIGHT >> 2;
    const portraitY = bandCenterY - halfSpan + (pH >> 3);
    const leftX = (WIDTH >> 2) - (pW >> 1);
    const rightX = WIDTH - (WIDTH >> 2) - ((f2?.width ?? pW) >> 1);
    const activeX = app.selection === 0 ? leftX : rightX;
    const activeImg = app.selection === 0 ? f1 : f2;

    ctx2d.fillStyle = '#162200';
    ctx2d.fillRect(0, bandCenterY - halfSpan, WIDTH, halfSpan << 1);
    if (activeImg) {
      ctx2d.fillStyle = '#445800';
      ctx2d.fillRect(activeX - 9, portraitY - 4, activeImg.width + 18, activeImg.height + 8);
      ctx2d.fillStyle = '#557000';
      ctx2d.fillRect(activeX - 3, portraitY - 3, activeImg.width + 6, activeImg.height + 6);
    }
    if (f1) {
      drawRectMIDP(ctx2d, leftX - 1, portraitY - 1, f1.width + 1, f1.height + 1, app.selection === 0 ? '#f1fa00' : '#758800');
      ctx2d.drawImage(f1, leftX, portraitY);
    }
    if (f2) {
      drawRectMIDP(ctx2d, rightX - 1, portraitY - 1, f2.width + 1, f2.height + 1, app.selection === 1 ? '#f1fa00' : '#95a500');
      ctx2d.drawImage(f2, rightX, portraitY);
    }
    drawCurtains(ctx2d, bandCenterY, halfSpan);

    const label = labels[app.selection] || labels[0] || '';
    drawChoiceBar(ctx2d, g, listTop, app.selection === 0 ? '#ff0000' : '#0000ff', 0, label, 0);
    drawSoftkeys(ctx2d);
    return;
  }

  // Render visible rows (up to 5)
  labels.slice(firstVisible, firstVisible + 5).forEach((rawLabel, visibleIndex) => {
    const absoluteIndex = firstVisible + visibleIndex;
    const selected = absoluteIndex === app.selection;
    const locked = isMapLocked(state, absoluteIndex, labels.length);
    const y = listTop + visibleIndex * rowHeight + (rowHeight >> 1);
    let label = rawLabel;
    if (state === 1) {
      if (absoluteIndex === 3) label = `${label}${app.soundEnabled ? tr.on : tr.off}`;
      if (absoluteIndex === 4) label = `${label}${app.detailLevel}`;
    } else if (state === 2) {
      if (absoluteIndex === 0) label = `${label}${app.vibroEnabled ? tr.on : tr.off}`;
      if (absoluteIndex === 1) label = `${label}${app.soundEnabled ? tr.on : tr.off}`;
      if (absoluteIndex === 2) label = `${label}${tr.label}`;
    }
    const barFill = locked ? '#6c765b' : (selected ? '#cb0000' : '#2d4700');
    const inset = selected ? 4 : 0;
    const textDy = selected ? 2 : 0;
    drawChoiceBar(ctx2d, g, y, barFill, inset, label, textDy);
  });

  // Scroll arrows if list > 5 (c.java:1458-1469)
  if (app.images.erou) {
    const ew = app.images.erou.width;
    const eh = app.images.erou.height >> 1;
    if (firstVisible > 0) {
      withMIDPClip(ctx2d, Q - (ew >> 1), listTop - eh - 2, ew, eh, () =>
        ctx2d.drawImage(app.images.erou, Q - (ew >> 1), listTop - eh - 2));
    }
    if (firstVisible + 5 < labels.length) {
      const bottomY = listTop + 5 * rowHeight + 2;
      withMIDPClip(ctx2d, Q - (ew >> 1), bottomY, ew, eh, () =>
        ctx2d.drawImage(app.images.erou, Q - (ew >> 1), bottomY - eh));
    }
  }

  // Mode typewriter description box at bottom of K=5 (c.java:625-676)
  if (modeSelection && app.selection < 5) {
    const desc = tr.modeDesc[app.selection] || '';
    const boxX = 16;
    const boxW = WIDTH - 32;
    const boxY = listTop + 5 * rowHeight + 12;
    const boxH = HEIGHT - boxY - 22;
    if (boxH > 20) {
      drawTypewriterBox(ctx2d, `K5-${app.selection}-${app.lang}`, desc, boxX, boxY, boxW, boxH);
    }
  }

  if (confirmation) {
    drawText(ctx2d, tr.soundPrompt, Q, (HEIGHT >> 3) - (fontH >> 1), 17);
  }
  drawSoftkeys(ctx2d);
}

// Port of c.java:1766-1819 — Help (K=11) & About (K=12) with green header/footer & scrollbar.
function drawTextPage(ctx2d, text, centerBody = false) {
  const fontH = app.font?.lineHeight ?? UI_LINE_HEIGHT;
  const barH = (app.data?.ccs?.[3]?.[33] || 19) + 2;
  const colW = Math.floor(WIDTH / 13); // 18px right scrollbar gutter
  const bodyH = HEIGHT - (barH << 1);

  ctx2d.fillStyle = '#000000';
  ctx2d.fillRect(0, 0, WIDTH, HEIGHT);
  ctx2d.fillStyle = '#172400';
  ctx2d.fillRect(0, 0, WIDTH, barH);
  ctx2d.fillRect(0, HEIGHT - barH, WIDTH, barH);
  drawRectMIDP(ctx2d, 0, 0, WIDTH - 1, barH, '#2d4700');
  drawRectMIDP(ctx2d, 0, HEIGHT - barH, WIDTH - 1, barH - 1, '#2d4700');
  drawRectMIDP(ctx2d, 0, barH, WIDTH - colW, bodyH, '#bbaf0c');

  const rawLines = String(text ?? '').split(/[\r\n]+/).filter(Boolean);
  const title = rawLines[0] || '';
  const bodySource = rawLines.slice(1).join('\n');
  const wrapped = wrapUiText(ctx2d, bodySource, WIDTH - (colW << 1) - 6);
  const rowCapacity = Math.max(1, Math.floor((bodyH - 8) / fontH));
  const maxScroll = Math.max(0, wrapped.length - rowCapacity);
  const scroll = Math.max(0, Math.min(app.configPage, maxScroll));
  app.configPage = scroll;

  drawText(ctx2d, title, WIDTH >> 1, (barH >> 1) - (fontH >> 1), 17);

  const thumbH = 6;
  if (wrapped.length > rowCapacity && maxScroll > 0) {
    const thumbY = Math.min(HEIGHT - barH - thumbH, Math.round((scroll * (bodyH - thumbH)) / maxScroll) + barH);
    drawRectMIDP(ctx2d, WIDTH - colW, thumbY, colW - 1, thumbH, '#bbaf0c');
    drawRectMIDP(ctx2d, WIDTH - colW, thumbY + 1, colW - 2, thumbH - 2, '#000000');
    drawRectMIDP(ctx2d, WIDTH - colW, thumbY + 2, colW - 3, thumbH - 4, '#2d4700');
  }

  const startY = barH + Math.max(4, (bodyH - Math.min(wrapped.length, rowCapacity) * fontH) >> 1);
  wrapped.slice(scroll, scroll + rowCapacity).forEach((rawLine, index) => {
    const centered = centerBody || rawLine.startsWith('|');
    const clean = rawLine.startsWith('|') ? rawLine.slice(1) : rawLine;
    const y = startY + index * fontH;
    if (centered) {
      drawText(ctx2d, clean, (WIDTH - colW) >> 1, y, 17);
    } else {
      drawText(ctx2d, clean, 6, y, 20);
    }
  });
  drawSoftkeys(ctx2d);
}

// Port of c.java:1007-1115 & 1506-1545 — Match configuration pages K=6..10 with ld curtains & s1 icons.
function drawConfigurationPage(ctx2d, labels, state) {
  const tr = t();
  const parameters = app.settings;
  const mode = state - 6;
  const primary = [parameters.F, parameters.F, parameters.D, parameters.E, parameters.G][mode];
  const values = [primary, parameters.H, parameters.I, `${parameters.balance[0]}:${parameters.balance[1]}`];
  const fontH = app.font?.lineHeight ?? UI_LINE_HEIGHT;
  const rowHeight = 22;
  const rowStart = 40;
  const panelH = rowHeight * 4;
  const selected = Math.max(0, Math.min(app.selection, 3));
  const colX = Math.floor(WIDTH / 13); // 18px left text indent
  const iconX = 180;
  const leftArrowX = 173;
  const rightArrowX = 203;
  const valueCenterX = 222;

  ctx2d.fillStyle = '#000000';
  ctx2d.fillRect(0, 0, WIDTH, HEIGHT);

  drawHeaderBar(ctx2d, tr.modeTitles[mode] || '');

  // Mechanical hazard curtains top (y=31..40) & bottom (y=128..137) framing green panel
  drawCurtains(ctx2d, rowStart + (panelH >> 1), panelH >> 1);
  ctx2d.fillStyle = '#172200';
  ctx2d.fillRect(0, rowStart, WIDTH, panelH);

  for (let index = 0; index < Math.min(4, labels.length); index++) {
    const yCenter = rowStart + index * rowHeight + (rowHeight >> 1);
    const isSel = index === selected;
    if (isSel) {
      ctx2d.fillStyle = '#cc0000';
      ctx2d.fillRect(2, yCenter - 10, WIDTH - 4, 20);
      drawRectMIDP(ctx2d, 1, yCenter - 11, WIDTH - 3, 21, '#f1fa00');
    } else {
      ctx2d.fillStyle = '#2d4700';
      ctx2d.fillRect(2, yCenter - 8, WIDTH - 4, 17);
    }
    const iconTop = yCenter - 10;
    drawRectMIDP(ctx2d, iconX - 1, iconTop - 1, 22, 22, isSel ? '#f1fa00' : '#2d4700');
    const spriteId = index === 3 ? 40 : (index === 0 ? (mode === 2 ? 30 : mode === 3 ? 31 : 27) : 27 + index);
    drawSprite(ctx2d, spriteId, iconX, iconTop);

    drawText(ctx2d, labels[index] || '', colX, yCenter - (fontH >> 1), 20);
    const value = String(values[index] ?? '');
    drawText(ctx2d, value, valueCenterX, yCenter - (fontH >> 1), 17);

    if (isSel) {
      drawSprite(ctx2d, app.selectionDirection < 0 ? 37 : 38, leftArrowX, yCenter - 4);
      drawSprite(ctx2d, app.selectionDirection > 0 ? 39 : 36, rightArrowX, yCenter - 4);
    }
  }

  // Bottom typewriter explanation box (c.java:625-676)
  const descIdx = selected === 0 ? (mode === 2 ? 5 : mode === 3 ? 4 : mode === 4 ? 6 : 0) : selected;
  const explanation = tr.configDesc[descIdx] || '';
  const boxY = rowStart + panelH + 14;
  const boxH = HEIGHT - boxY - 22;
  drawTypewriterBox(ctx2d, `K${state}-${selected}-${app.lang}`, explanation, colX, boxY, WIDTH - (colX << 1), boxH);
  drawSoftkeys(ctx2d);
}

// In-game Key Bindings screen (K=21) rendered with native curs/ld/fnt primitives.
function drawKeyBindingsPage(ctx2d) {
  const tr = t();
  const rows = tr.controlsRows || [];
  const fontH = app.font?.lineHeight ?? UI_LINE_HEIGHT;
  const rowHeight = 22;
  const rowStart = 38;
  const visibleCount = Math.min(6, rows.length);
  const panelH = visibleCount * rowHeight;
  const firstVisible = Math.max(0, Math.min(app.selection - (visibleCount - 1), rows.length - visibleCount));
  const colX = Math.floor(WIDTH / 13);

  ctx2d.fillStyle = '#000000';
  ctx2d.fillRect(0, 0, WIDTH, HEIGHT);
  drawHeaderBar(ctx2d, tr.controlsTitle || 'CÀI ĐẶT PHÍM');
  drawCurtains(ctx2d, rowStart + (panelH >> 1), panelH >> 1);
  ctx2d.fillStyle = '#172200';
  ctx2d.fillRect(0, rowStart, WIDTH, panelH);

  for (let i = 0; i < visibleCount; i++) {
    const absIdx = firstVisible + i;
    const isSel = absIdx === app.selection;
    const yCenter = rowStart + i * rowHeight + (rowHeight >> 1);
    if (isSel) {
      ctx2d.fillStyle = '#cc0000';
      ctx2d.fillRect(2, yCenter - 10, WIDTH - 4, 20);
      drawRectMIDP(ctx2d, 1, yCenter - 11, WIDTH - 3, 21, '#f1fa00');
    } else {
      ctx2d.fillStyle = '#2d4700';
      ctx2d.fillRect(2, yCenter - 8, WIDTH - 4, 17);
    }

    drawText(ctx2d, rows[absIdx] || '', colX, yCenter - (fontH >> 1) - 1, 20);
    if (absIdx < KEY_ACTIONS.length) {
      const action = KEY_ACTIONS[absIdx];
      const listening = app.rebindingAction === action;
      const badgeW = 72;
      const badgeX = WIDTH - colX - badgeW;
      const badgeY = yCenter - 9;
      ctx2d.fillStyle = listening ? '#990000' : '#0d1505';
      ctx2d.fillRect(badgeX, badgeY, badgeW, 18);
      drawRectMIDP(ctx2d, badgeX, badgeY, badgeW - 1, 17, listening ? '#f1fa00' : '#bcb611');
      const valText = listening ? '???' : formatKeyLabel(app.keyBindings[action]);
      drawText(ctx2d, valText, badgeX + (badgeW >> 1), yCenter - (fontH >> 1) - 1, 17);
    }
  }

  const boxY = rowStart + panelH + 22;
  const boxW = WIDTH - (colX << 1);
  const boxH = Math.max(40, HEIGHT - boxY - 24);
  ctx2d.fillStyle = '#172200';
  ctx2d.fillRect(colX, boxY, boxW, boxH);
  drawRectMIDP(ctx2d, colX - 1, boxY - 1, boxW + 1, boxH + 1, app.rebindingAction ? '#f1fa00' : '#884800');
  const hint = app.rebindingAction ? tr.pressKeyPrompt : tr.controlsHint;
  const wrapped = wrapUiText(ctx2d, hint || '', boxW - 10);
  const maxLines = Math.max(1, Math.floor((boxH - 8) / fontH));
  wrapped.slice(0, maxLines).forEach((ln, idx) => {
    drawText(ctx2d, ln, colX + 5, boxY + 5 + idx * fontH, 20);
  });
  drawSoftkeys(ctx2d);
}

// Port of c.java:1661-1764 — Live scoreboard (K=20) & End-of-match results (K=22).
function drawScoreboardPage(ctx2d, isFinal) {
  const tr = t();
  const match = app.match;
  if (!match) return;
  const fontH = app.font?.lineHeight ?? UI_LINE_HEIGHT;
  ctx2d.fillStyle = '#000000';
  ctx2d.fillRect(0, 0, WIDTH, HEIGHT);

  const iconW = app.data?.ccs?.[2]?.[27] || 21;
  const colStep = iconW + 5; // 26px per stat column
  const colX = Math.floor(WIDTH / 13); // 18px outer border margin
  const skullX = WIDTH - colX - (colStep >> 1) - (iconW >> 1) - 1;
  const killsIconX = skullX - colStep;
  const div1X = WIDTH - colX - colStep;
  const div2X = WIDTH - colX - (colStep << 1);

  const header = isFinal
    ? (match.winner === 'player' ? tr.win : match.winner === 'draw' ? tr.draw : tr.lose)
    : tr.statsTitle;
  drawText(ctx2d, header, colX, 4, 20);
  if (match.mode === MODE.TEAM_DEATHMATCH || match.mode === MODE.CAPTURE_FLAG) {
    drawText(ctx2d, `${match.teamScore[0]}:${match.teamScore[1]}`, div2X - 24, 4, 20);
  }
  drawSprite(ctx2d, 27, killsIconX, 0);
  drawSprite(ctx2d, 30, skullX, 0);

  const rawActors = match.rankings?.length
    ? match.rankings
    : [...match.actors].sort((a, b) => (match.mode === MODE.SURVIVAL
      ? a.deaths - b.deaths || b.kills - a.kills
      : b.kills - a.kills || a.deaths - b.deaths));

  const rowH = 22;
  const listTop = 26;
  const maxVisible = Math.min(rawActors.length, Math.floor((HEIGHT - listTop - 24) / rowH));
  const tableH = maxVisible * rowH;

  rawActors.slice(0, maxVisible).forEach((row, i) => {
    const y = listTop + i * rowH;
    const isMutant = row.character === 1;
    const outerCol = isMutant ? '#b40f11' : '#426600';
    const innerCol = isMutant ? '#5e0000' : '#172200';
    const spriteId = isMutant ? 20 : 19;
    const portW = app.data?.ccs?.[2]?.[spriteId] || 21;
    const portH = app.data?.ccs?.[3]?.[spriteId] || 18;
    const portY = y + (rowH >> 1) - (portH >> 1);

    ctx2d.fillStyle = outerCol;
    ctx2d.fillRect(colX, y, WIDTH - (colX << 1), rowH);
    ctx2d.fillStyle = innerCol;
    ctx2d.fillRect(colX + 2, y + (rowH >> 1) - (portH >> 1), WIDTH - (colX << 1) - 4, portH);

    drawLineMIDP(ctx2d, div1X, portY - 1, div1X, portY + portH, outerCol);
    drawLineMIDP(ctx2d, div2X, portY - 1, div2X, portY + portH, outerCol);

    if (row.isPlayer) {
      drawRectMIDP(ctx2d, (colX << 1) - 1, portY - 1, portW + 1, portH + 1, '#f1fa00');
    }
    drawSprite(ctx2d, spriteId, colX << 1, portY);
    drawText(ctx2d, row.isPlayer ? `${row.name}*` : row.name, (colX << 1) + portW + 6, y + (rowH >> 1) - (fontH >> 1), 20);
    drawText(ctx2d, String(row.kills), div2X + (colStep >> 1), y + (rowH >> 1) - (fontH >> 1), 17);
    drawText(ctx2d, String(row.deaths), div1X + (colStep >> 1), y + (rowH >> 1) - (fontH >> 1), 17);
  });

  drawRectMIDP(ctx2d, colX, listTop, WIDTH - (colX << 1), tableH, '#bcb611');
  drawSoftkeys(ctx2d);
}

function drawOriginalUi(ctx2d) {
  const tr = t();
  if (app.K === 0) {
    drawChoicePage(ctx2d, tr.yesNo, 0);
  } else if (app.K === 1) {
    drawChoicePage(ctx2d, tr.pauseMenu, 1);
  } else if (app.K === 2) {
    drawChoicePage(ctx2d, tr.options, 2);
  } else if (app.K === 3) {
    drawChoicePage(ctx2d, tr.mainMenu, 3);
  } else if (app.K === 4 || app.K === 19) {
    drawChoicePage(ctx2d, tr.characters, app.K);
  } else if (app.K === 5) {
    drawChoicePage(ctx2d, tr.modes, 5);
  } else if (app.K >= 6 && app.K <= 10) {
    drawConfigurationPage(ctx2d, tr.configRows[app.K - 6] || tr.configRows[0], app.K);
  } else if (app.K === 11) {
    drawTextPage(ctx2d, tr.help, false);
  } else if (app.K === 12) {
    drawTextPage(ctx2d, tr.about, true);
  } else if (app.K === 13 || app.K === 14) {
    drawChoicePage(ctx2d, localizedLevelLabels(), app.K);
  } else if (app.K === 20) {
    drawScoreboardPage(ctx2d, false);
  } else if (app.K === 21) {
    drawKeyBindingsPage(ctx2d);
  } else if (app.K === 22) {
    drawScoreboardPage(ctx2d, true);
  }
}

function drawLoadingOverlay(ctx2d) {
  const bg = app.character === 1 ? app.images.li2 : app.images.li1;
  ctx2d.fillStyle = '#000000';
  ctx2d.fillRect(0, 0, WIDTH, HEIGHT);
  if (bg) {
    ctx2d.drawImage(bg, (WIDTH - bg.width) >> 1, (HEIGHT - bg.height) >> 1);
  }
  const progress = Math.max(0.15, Math.min(1, (8 - app.loadingTicks) / 8));
  const ld = app.images.ld;
  if (ld) {
    const ch = ld.height;
    const qh = ch >> 2;
    const barY = HEIGHT - 32;
    const barW = Math.round(WIDTH * progress);
    ctx2d.fillStyle = '#cc0000';
    ctx2d.fillRect(0, barY + qh, barW, 8);
    drawCurtains(ctx2d, barY + qh + 4, 4);
  }
}

// Port of e.java:1750-1806 — CTF bases, animated flags & arena pickups with beOsc bobbing.
function drawMapProps(ctx2d, renderCam, alpha = 1) {
  const match = app.match;
  if (!match) return;
  const cam = renderCam || match.camera;
  const useInterp = Boolean(match.interpValid && app.screen === 'game');

  if (match.mode === MODE.CAPTURE_FLAG) {
    const ao = 103;
    const anim = (match.flagAnimFrame || 0) % 3;
    const poleHalfH = (app.data.cu2?.[98]?.[3] ?? 19) >> 1;
    for (let f = 0; f < 2; f++) {
      const flag = match.flags[f];
      const bx = Math.round(flag.baseX - cam.x);
      const by = Math.round(flag.baseY - cam.y);
      drawCu2Frame(ctx2d, f === 0 ? ao + 3 : ao - 1, bx - 2, by - 3, 1, true);

      const carrier = flag.carrier >= 0 ? match.actors[flag.carrier] : null;
      let worldFlagX = flag.x;
      let worldFlagY = flag.y;
      if (carrier) {
        const cx = (useInterp && typeof carrier.prevX === 'number')
          ? lerpCoordRound(carrier.prevX, carrier.x, alpha)
          : carrier.x;
        const cy = (useInterp && typeof carrier.prevY === 'number')
          ? lerpCoordRound(carrier.prevY, carrier.y, alpha)
          : carrier.y;
        worldFlagX = cx;
        worldFlagY = cy - carrier.height - poleHalfH;
      }
      const fx = Math.round(worldFlagX - cam.x);
      const fy = Math.round(worldFlagY - cam.y);
      const flagFacing = carrier ? (carrier.facing < 0 ? -1 : 1) : 1;
      drawCtfFlag(ctx2d, app.images, app.data.cu2, {
        fx,
        fy,
        team: f,
        animFrame: anim,
        facing: flagFacing,
      });
    }
  }

  const beOsc = match.beOsc || 0;
  for (const pickup of match.pickups) {
    if (pickup.respawnTimer > 0) continue;
    const x = Math.round(pickup.x - cam.x);
    const y = Math.round(pickup.y - cam.y);
    if (x < -24 || x > WIDTH + 24 || y < -24 || y > HEIGHT + 24) continue;
    const meta = app.data.cu2[pickup.frameId];
    if (!meta || meta[2] <= 0) continue;
    ctx2d.fillStyle = 'rgba(0,0,0,0.45)';
    ctx2d.beginPath();
    if (ctx2d.roundRect) ctx2d.roundRect(x - (beOsc >> 2), y + 2, meta[2] + (beOsc >> 1), 4, 2);
    else ctx2d.rect(x - (beOsc >> 2), y + 2, meta[2] + (beOsc >> 1), 4);
    ctx2d.fill();
    drawCu2Frame(ctx2d, pickup.frameId, x, y - meta[3] + beOsc, 1, true);
  }
}

// Port of e.java:1656-1677 — Projectiles & Railgun beam (synchronized 60fps lerp).
function drawProjectiles(ctx2d, renderCam, alpha = 1) {
  const match = app.match;
  if (!match) return;
  const cam = renderCam || match.camera;
  const useInterp = Boolean(match.interpValid && app.screen === 'game');
  for (const proj of match.projectiles) {
    const px = (useInterp && typeof proj.prevX === 'number') ? lerpCoordRound(proj.prevX, proj.x, alpha) : proj.x;
    const py = (useInterp && typeof proj.prevY === 'number') ? lerpCoordRound(proj.prevY, proj.y, alpha) : proj.y;
    const sx = Math.round(px - cam.x);
    const sy = Math.round(py - cam.y);
    if (proj.weapon === 5) {
      ctx2d.fillStyle = '#ff0000';
      ctx2d.fillRect(sx - (proj.width >> 1), sy - (proj.height >> 1), proj.width, proj.height);
      ctx2d.fillStyle = '#ffff00';
      ctx2d.fillRect(sx - (proj.width >> 1), sy - (proj.height >> 2), proj.width, Math.max(1, (proj.height >> 1) - 1));
    } else if (proj.weapon > 0) {
      const frameId = (PROJECTILE_SPRITE_BASE[proj.weapon] || 61) + (proj.animToggle || 0);
      drawCu2Frame(ctx2d, frameId, sx - (proj.width >> 1), sy - (proj.height >> 1), proj.facing, true);
    }
  }
}

// Port of e.java:1808-1889 — Hit sparks, rocket explosions, smoke, spawn flashes.
function drawEffects(ctx2d, renderCam) {
  const match = app.match;
  if (!match) return;
  const cam = renderCam || match.camera;
  for (const fx of match.effects) {
    const seq = EFFECT_FRAMES[fx.type];
    if (!seq) continue;
    const frameIdx = Math.max(0, Math.min(seq.length - 1, fx.timer - 1));
    const frameId = seq[frameIdx];
    const meta = app.data.cu2[frameId];
    if (!meta) continue;
    const useOffset = meta[4] !== 0 || meta[5] !== 0;
    const sx = useOffset ? Math.round(fx.x - cam.x) : Math.round(fx.x - cam.x - (meta[2] >> 1));
    const sy = Math.round(fx.y - cam.y - (fx.type === 7 ? meta[3] >> 1 : meta[3]));
    drawCu2Frame(ctx2d, frameId, sx, sy, 1, useOffset);
  }
}

// Port of e.java:2735-2816 — Original HUD (s0.png sprite digits, blink flash, CTF flags).
function drawOriginalHud(ctx2d) {
  const match = app.match;
  if (!match || !match.player) return;
  const p = match.player;
  const armorW = app.data.ccs[2][18] || 16;
  const heartW = app.data.ccs[2][17] || 16;
  const heartH = app.data.ccs[3][17] || 16;
  const weapW = app.data.ccs[2][21] || 16;
  const boxH = app.data.ccs[3][12] || 15;
  const digitH = app.data.ccs[3][1] || 9;
  const halfW = WIDTH >> 1;
  const anim = match.flagAnimFrame || 0;
  const digitYOffset = (boxH >> 1) - (digitH >> 1);

  // Top-left: Armor icon + box + blinking sprite digits
  drawSprite(ctx2d, 18, 0, 0);
  const armorBox = drawHudBox(ctx2d, armorW - 1, 0, '#2d4700', '#172300', 3, false);
  if ((match.hudFlash?.[3] || 0) === 0 || anim === 1) {
    const aw = measureHudNumberWidth(p.armor, true);
    drawHudNumber(ctx2d, p.armor, armorW + ((armorBox.w - aw) >> 1) - 1, digitYOffset);
  }

  // Top-center: Countdown timer in crisp fnt.png bitmap font
  const timeStr = `${match.minutes}:${String(match.seconds).padStart(2, '0')}`;
  drawText(ctx2d, timeStr, halfW, 1, 17);

  // Top-right: CTF red/blue capture score boxes & waving stolen flag icons (e.java:2776-2810)
  if (match.mode === MODE.CAPTURE_FLAG) {
    const redBox = drawHudBox(ctx2d, WIDTH, 0, '#ff0000', '#9e0000', 2, true);
    const blueBox = drawHudBox(ctx2d, WIDTH, 0, '#0084ff', '#000f7f', -2, true);
    if ((match.hudFlash?.[1] || 0) === 0 || anim === 1) {
      const rw = measureHudNumberWidth(match.teamScore[1], true);
      drawHudNumber(ctx2d, match.teamScore[1], redBox.x + ((redBox.w - rw) >> 1), digitYOffset);
    }
    if ((match.hudFlash?.[0] || 0) === 0 || anim === 1) {
      const bw = measureHudNumberWidth(match.teamScore[0], true);
      drawHudNumber(ctx2d, match.teamScore[0], blueBox.x + ((blueBox.w - bw) >> 1), digitYOffset);
    }
    if (anim > 0) {
      const box2W = app.data.ccs[2][13] || 22;
      const box2H = app.data.ccs[3][13] || 15;
      const flagHalfW = (app.data.cu2?.[100]?.[2] ?? 15) >> 1;
      if (match.flags?.[0]?.carrier >= 0) {
        drawCu2Frame(ctx2d, 103 + anim, WIDTH - (box2W << 1) + (box2W >> 1) - flagHalfW, box2H + 2, 1, true);
      }
      if (match.flags?.[1]?.carrier >= 0) {
        drawCu2Frame(ctx2d, 99 + anim, WIDTH - box2W + (box2W >> 1) - flagHalfW, box2H + 2, 1, true);
      }
    }
  }

  // Quad damage indicator (e.java:2772-2774)
  if (p.quadTimer > 0) {
    drawCu2Frame(ctx2d, 76, halfW - ((app.data.cu2?.[76]?.[2] ?? 16) >> 1), app.font?.lineHeight ?? 13, 1, true);
  }

  // Bottom-center: Health box + Heart icon + Weapon icon + Ammo box (with sprite digits)
  const hpBox = drawHudBox(ctx2d, halfW - heartW, HEIGHT - heartH, '#2d4700', '#172300', 3, true);
  if ((match.hudFlash?.[2] || 0) === 0 || anim === 1) {
    const hw = measureHudNumberWidth(p.health, true);
    drawHudNumber(ctx2d, p.health, hpBox.x + ((hpBox.w - hw) >> 1), HEIGHT - boxH + digitYOffset - 1);
  }
  drawSprite(ctx2d, 17, halfW - heartW, HEIGHT - heartH);
  drawSprite(ctx2d, 21 + (p.weapon ?? 0), halfW, HEIGHT - heartH);
  const ammoBox = drawHudBox(ctx2d, halfW + weapW - 1, HEIGHT - heartH, '#2d4700', '#172300', 3, false);
  const ammoVal = p.weapon === 0 ? 1 : (p.ammo[p.weapon] ?? 0);
  const amW = measureHudNumberWidth(ammoVal, true);
  drawHudNumber(ctx2d, ammoVal, halfW + weapW + ((ammoBox.w - amW) >> 1), HEIGHT - boxH + digitYOffset - 1);

  // Round banner in Last Hero mode (e.java:2812-2815)
  if (match.roundBannerTimer > 0) {
    const fontH = app.font?.lineHeight ?? 13;
    const bannerY = boxH + (fontH >> 1);
    ctx2d.fillStyle = '#ff0000';
    ctx2d.fillRect(0, bannerY, WIDTH, fontH);
    drawText(ctx2d, `${t().roundPrefix}${match.round}`, halfW, bannerY, 17);
  }
}

function getRenderCamera(alpha = 1) {
  const cam = app.match?.camera;
  if (!cam) return { x: 0, y: 0 };
  if (app.match.interpValid && typeof cam.prevX === 'number') {
    return {
      x: lerpCoordRound(cam.prevX, cam.x, alpha),
      y: lerpCoordRound(cam.prevY, cam.y, alpha),
    };
  }
  return { x: cam.x, y: cam.y };
}

function createRenderState(alpha = 1) {
  const renderCam = getRenderCamera(alpha);
  const pausedMatch = app.screen === 'menu' && app.K === 1 && !!app.match;
  return {
    screen: app.screen === 'startup' ? 'startup' : app.screen === 'title' ? 'title' : app.screen === 'game' ? 'game' : 'menu',
    viewport: { width: WIDTH, height: HEIGHT },
    backgroundName: (app.screen === 'game' || pausedMatch) ? (app.match?.backgroundName || 'bg0') : null,
    detailLevel: app.detailLevel,
    loadingScreen: app.loadingTicks > 0,
    tilesetName: app.match?.tilesetName || 'l0',
    mode: app.match?.mode ?? app.mode,
    pausedMatch,
    camera: renderCam,
    interpValid: Boolean(app.match?.interpValid && app.screen === 'game'),
    interpAlpha: alpha,
    level: app.match?.level || null,
    actors: app.match?.actors || [],
    showPlayerNames: app.mpMode !== 'single' || Boolean(app.match?.isMultiplayer),
    fontLineHeight: app.font?.lineHeight ?? UI_LINE_HEIGHT,
    drawBitmapText: drawText,
    tables: { ...app.data, poseForActor: (actor) => poseForActor(actor, app.data) },
    drawOriginalUi,
    drawOriginalHud,
    drawLoadingOverlay,
    drawMapProps: (ctx2d) => drawMapProps(ctx2d, renderCam, alpha),
    drawProjectiles: (ctx2d) => drawProjectiles(ctx2d, renderCam, alpha),
    drawEffects: (ctx2d) => drawEffects(ctx2d, renderCam),
  };
}

function paint(alpha = 1) {
  if (!ctx || !app.data) return;
  ctx.imageSmoothingEnabled = false;
  renderOriginal(ctx, createRenderState(alpha), { images: app.images });
}

function flashSoftkey(side) {
  app.softkeyPressed = side;
  if (typeof window !== 'undefined') {
    window.setTimeout(() => {
      if (app.softkeyPressed === side) app.softkeyPressed = null;
    }, 150);
  }
}

function resetMenuSelection(state) {
  app.K = state;
  app.selection = 0;
  app.configPage = 0;
  app.rebindingAction = null;
  app.cheatBuf = [];
  app.screen = 'menu';
}

function startMatch() {
  stopMpRuntime({ leaveRoom: true });
  app.input = Object.create(null);
  app.match = createSourceMatch(app.data, {
    mode: app.mode,
    levelIndex: app.levelIndex,
    character: app.character,
    settings: app.settings,
  });
  if (app.cheatAllWeapons && app.match?.player) {
    app.match.player.ownedWeapons = [1, 1, 1, 1, 1, 1];
    app.match.player.ammo = [1, 100, 100, 100, 100, 100];
  }
  app.K = 1; // Original c.java:569 sets K=1 so Pause opens Pause Menu
  app.loadingTicks = app.loop ? 8 : 0;
  app.screen = 'game';
  persistSettings();
}

// Adjust settings in K=6..10 on Left (-1) / Right (+1) (e.java:3027-3180).
export function adjustConfigSetting(state, row, delta) {
  const mode = state - 6;
  const s = app.settings;
  if (row === 0) {
    if (mode === 0 || mode === 1) s.F = Math.max(5, Math.min(50, s.F + delta * 5));
    else if (mode === 2) s.D = Math.max(5, Math.min(50, s.D + delta * 5));
    else if (mode === 3) s.E = Math.max(1, Math.min(20, s.E + delta));
    else if (mode === 4) s.G = Math.max(3, Math.min(30, s.G + delta));
  } else if (row === 1) {
    s.H = Math.max(1, Math.min(20, s.H + delta));
  } else if (row === 2) {
    s.I = Math.max(2, Math.min(10, s.I + delta));
    const half = s.I >> 1;
    s.balance = [half, s.I - half];
  } else if (row === 3) {
    const nextSoldiers = Math.max(1, Math.min(s.I - 1, s.balance[0] + delta));
    s.balance = [nextSoldiers, s.I - nextSoldiers];
  }
  app.selectionDirection = delta;
  persistSettings();
}

export function menuLength(state) {
  if (!app.data) return 1;
  const tr = t();
  if (state === 0) return 2;
  if (state === 1) return tr.pauseMenu.length;
  if (state === 2) return tr.options.length;
  if (state === 3) return tr.mainMenu.length;
  if (state === 5) return tr.modes.length;
  if (state >= 6 && state <= 10) return 4;
  if (state === 13 || state === 14) return 12;
  if (state === 19 || state === 4) return 2;
  if (state === 21) return tr.controlsRows?.length || 8;
  return 1;
}

// Port of c.java:202-277 `a(boolean)` — Right softkey / Back.
export function handleMenuBack() {
  if (app.screen === 'game') {
    app.K = 1;
    app.selection = 0;
    app.screen = 'menu';
    return;
  }
  if (app.K === 1) {
    if (app.match) app.screen = 'game';
    else resetMenuSelection(3);
  } else if (app.K === 21) {
    if (app.rebindingAction) app.rebindingAction = null;
    else resetMenuSelection(2);
  } else if (app.K === 2 || app.K === 5 || app.K === 11 || app.K === 12) {
    resetMenuSelection(3);
  } else if (app.K >= 6 && app.K <= 10) {
    resetMenuSelection(5);
  } else if (app.K === 13 || app.K === 14) {
    resetMenuSelection(6 + app.mode);
  } else if (app.K === 19 || app.K === 4) {
    resetMenuSelection(13);
  } else if (app.K === 20) {
    resetMenuSelection(1);
  } else if (app.K === 22) {
    if (app.mpMode !== 'single') stopMpRuntime({ leaveRoom: true });
    app.match = null;
    resetMenuSelection(3);
  } else if (app.K === 0 || app.K === 3) {
    app.screen = 'title';
  }
}

// Port of c.java:330-619 `b(boolean)` — OK / Activate selection.
export function activateCurrentSelection() {
  const selected = app.selection;
  if (app.K === 0) {
    app.soundEnabled = selected === 0;
    persistSettings();
    resetMenuSelection(3);
  } else if (app.K === 1) {
    // Pause menu: Continue / Stats / Restart / Sound / Detail / Main Menu
    if (selected === 0 && app.match) {
      app.screen = 'game';
    } else if (selected === 1) {
      resetMenuSelection(20);
    } else if (selected === 2) {
      if (app.mpMode === 'host' && app.mpConfig) launchMultiplayerMatch('host', app.mpConfig);
      else if (app.mpMode === 'guest') openMpLobby();
      else startMatch();
    } else if (selected === 3) {
      app.soundEnabled = !app.soundEnabled;
      persistSettings();
    } else if (selected === 4) {
      app.detailLevel = (app.detailLevel + 1) % 3;
      persistSettings();
    } else {
      if (app.mpMode !== 'single') stopMpRuntime({ leaveRoom: true });
      app.match = null;
      resetMenuSelection(3);
    }
  } else if (app.K === 2) {
    if (selected === 0) { app.vibroEnabled = !app.vibroEnabled; persistSettings(); }
    else if (selected === 1) { app.soundEnabled = !app.soundEnabled; persistSettings(); }
    else if (selected === 2) { toggleLanguage(); }
    else if (selected === 3) { resetMenuSelection(21); }
    else resetMenuSelection(3);
  } else if (app.K === 21) {
    if (selected < KEY_ACTIONS.length) {
      app.rebindingAction = KEY_ACTIONS[selected];
    } else if (selected === KEY_ACTIONS.length) {
      app.keyBindings = { ...DEFAULT_KEY_BINDINGS };
      persistSettings();
    } else {
      resetMenuSelection(2);
    }
  } else if (app.K === 3) {
    if (selected === 0) resetMenuSelection(5);
    else if (selected === 1) openMpLobby();
    else if (selected === 2) resetMenuSelection(2);
    else if (selected === 3) resetMenuSelection(11);
    else if (selected === 4) resetMenuSelection(12);
    else app.screen = 'title';
  } else if (app.K === 5) {
    if (selected <= 4) {
      app.mode = selected;
      const half = app.settings.I >> 1;
      app.settings.balance = [half, app.settings.I - half];
      resetMenuSelection(6 + selected);
    } else {
      resetMenuSelection(3);
    }
  } else if (app.K >= 6 && app.K <= 10) {
    resetMenuSelection(13);
  } else if (app.K === 13 || app.K === 14) {
    if (isMapLocked(app.K, selected, app.data.levelLabels.length)) return;
    if (selected === app.data.levelLabels.length - 1) {
      resetMenuSelection(6 + app.mode);
    } else {
      app.levelIndex = selected;
      app.character = 0;
      resetMenuSelection(19);
    }
  } else if (app.K === 19 || app.K === 4) {
    app.character = selected === 1 ? 1 : 0;
    startMatch();
  } else if (app.K === 11 || app.K === 12) {
    resetMenuSelection(3);
  } else if (app.K === 20) {
    resetMenuSelection(1);
  } else if (app.K === 22) {
    if (app.mpMode !== 'single') returnToMpLobbyAfterMatch();
    else startMatch();
  }
}

export function handleSourceInput(event) {
  if (!app.data || event.type === 'source-tick') return;
  if (typeof document !== 'undefined') {
    const lobbyEl = document.getElementById('mp-lobby');
    if (lobbyEl && !lobbyEl.hidden) {
      if (event.type === 'key-down' && event.code === 35) closeMpLobby();
      return;
    }
  }
  if (event.type === 'focus-lost') {
    app.input = Object.create(null);
    if (app.mpMode === 'guest') sendGuestInputState(true);
    return;
  }
  if (!event.code && !event.rawKey && !event.rawCode) return;
  const code = event.code;

  if (app.screen === 'menu' && app.K === 21 && app.rebindingAction) {
    if (event.type === 'key-down') {
      if (event.rawKey === 'Escape' || event.rawCode === 'Escape' || code === 35 || code === -7) {
        app.rebindingAction = null;
        return;
      }
      const nextToken = normalizePhysicalKey(event.rawKey, event.rawCode);
      if (nextToken) {
        const prevToken = app.keyBindings[app.rebindingAction];
        for (const action of KEY_ACTIONS) {
          if (action !== app.rebindingAction && app.keyBindings[action] === nextToken) {
            app.keyBindings[action] = prevToken;
          }
        }
        app.keyBindings[app.rebindingAction] = nextToken;
        app.rebindingAction = null;
        persistSettings();
      }
    }
    return;
  }

  // Startup / Title advance on any key press
  if (event.type === 'key-down' && (app.screen === 'startup' || app.screen === 'title')) {
    if (app.screen === 'startup') app.screen = 'title';
    else resetMenuSelection(0);
    return;
  }

  if (app.screen === 'game') {
    if (event.type === 'key-down') {
      if (code === 35 || code === -7) {
        flashSoftkey('right');
        app.K = 1;
        app.selection = 0;
        app.screen = 'menu';
        app.input = Object.create(null);
        if (app.mpMode === 'guest') sendGuestInputState(true);
        return;
      }
      const key = decodeGameplayKey(event, app.keyBindings);
      if (key) {
        app.input[key] = true;
        if (app.mpMode === 'guest') sendGuestInputState(true);
      }
    } else if (event.type === 'key-up') {
      const key = decodeGameplayKey(event, app.keyBindings);
      if (key && key !== 'switchWeapon') {
        app.input[key] = false;
        if (app.mpMode === 'guest') sendGuestInputState(true);
      }
    }
    return;
  }

  // Menu navigation (c.java:679-749)
  if (event.type === 'key-down') {
    const count = Math.max(1, menuLength(app.K));
    if (code === -7 || code === 35) {
      flashSoftkey('right');
      handleMenuBack();
      return;
    }
    if (app.K === 12) {
      app.cheatBuf.push(code);
      if (app.cheatBuf.length > 3) app.cheatBuf.shift();
      if (app.cheatBuf.join(',') === '42,56,53') {
        app.cheatAllWeapons = true;
      }
    }
    if (app.K === 11 || app.K === 12) {
      if (code === 50) app.configPage = Math.max(0, app.configPage - 1);
      else if (code === 56) app.configPage += 1;
      else if (code === 53) { flashSoftkey('left'); activateCurrentSelection(); }
      return;
    }
    if (app.K === 19 || app.K === 4) {
      if (code === 52 || code === 54 || code === 50 || code === 56) {
        app.selection = app.selection === 0 ? 1 : 0;
        app.character = app.selection;
      } else if (code === 53) {
        flashSoftkey('left');
        activateCurrentSelection();
      }
      return;
    }
    if (app.K >= 6 && app.K <= 10) {
      if (code === 50) app.selection = (app.selection + count - 1) % count;
      else if (code === 56) app.selection = (app.selection + 1) % count;
      else if (code === 52) adjustConfigSetting(app.K, app.selection, -1);
      else if (code === 54) adjustConfigSetting(app.K, app.selection, 1);
      else if (code === 53) { flashSoftkey('left'); activateCurrentSelection(); }
      return;
    }
    if (code === 50) {
      app.selection = (app.selection + count - 1) % count;
      while (isMapLocked(app.K, app.selection, count)) {
        app.selection = (app.selection + count - 1) % count;
      }
    } else if (code === 56) {
      app.selection = (app.selection + 1) % count;
      while (isMapLocked(app.K, app.selection, count)) {
        app.selection = (app.selection + 1) % count;
      }
    } else if (code === 53) {
      flashSoftkey('left');
      activateCurrentSelection();
    }
  }
}

function handleCanvasPointer(clientX, clientY) {
  if (!canvas || !app.data) return;
  const rect = canvas.getBoundingClientRect();
  const x = ((clientX - rect.left) / Math.max(1, rect.width)) * WIDTH;
  const y = ((clientY - rect.top) / Math.max(1, rect.height)) * HEIGHT;

  if (app.screen === 'startup') { app.screen = 'title'; return; }
  if (app.screen === 'title') { resetMenuSelection(0); return; }

  if (app.screen === 'game') {
    if (x > WIDTH - 36 && y < 24) {
      handleMenuBack();
    } else if (app.match?.player) {
      const playerScreenX = app.match.player.x - app.match.camera.x;
      const aimDir = x >= playerScreenX ? 1 : -1;
      app.match.player.facing = aimDir;
      app.input.facingOverride = aimDir;
      app.input.fire = true;
      if (app.mpMode === 'guest') sendGuestInputState(true);
      setTimeout(() => {
        app.input.fire = false;
        app.input.facingOverride = null;
        if (app.mpMode === 'guest') sendGuestInputState(true);
      }, 120);
    }
    return;
  }

  // Softkey corners (bottom-left OK, bottom-right Back)
  if (y >= HEIGHT - 24) {
    if (x <= 48) { flashSoftkey('left'); activateCurrentSelection(); return; }
    if (x >= WIDTH - 48) { flashSoftkey('right'); handleMenuBack(); return; }
  }

  if (app.K === 19 || app.K === 4) {
    if (y < HEIGHT >> 1) {
      app.selection = x < WIDTH >> 1 ? 0 : 1;
      app.character = app.selection;
    } else {
      flashSoftkey('left');
      activateCurrentSelection();
    }
    return;
  }

  if (app.K >= 6 && app.K <= 10) {
    const rowStart = 40;
    const rowHeight = 22;
    const row = Math.floor((y - rowStart) / rowHeight);
    if (row >= 0 && row < 4) {
      app.selection = row;
      if (x >= 166 && x < 192) adjustConfigSetting(app.K, row, -1);
      else if (x >= 192) adjustConfigSetting(app.K, row, 1);
      else activateCurrentSelection();
    } else if (y > rowStart + 4 * rowHeight) {
      activateCurrentSelection();
    }
    return;
  }

  if (app.K === 11 || app.K === 12) {
    if (y < HEIGHT >> 1) app.configPage = Math.max(0, app.configPage - 1);
    else app.configPage += 1;
    return;
  }

  if (app.K === 20 || app.K === 22) {
    activateCurrentSelection();
    return;
  }

  if (app.K === 21) {
    const rows = t().controlsRows || [];
    const rowStart = 38;
    const rowHeight = 22;
    const visibleCount = Math.min(6, rows.length);
    const firstVisible = Math.max(0, Math.min(app.selection - (visibleCount - 1), rows.length - visibleCount));
    const clickedRow = Math.floor((y - rowStart) / rowHeight);
    if (clickedRow >= 0 && clickedRow < visibleCount) {
      app.selection = firstVisible + clickedRow;
      flashSoftkey('left');
      activateCurrentSelection();
    }
    return;
  }

  // Choice pages (K=0, 1, 2, 3, 5, 13, 14)
  const tr = t();
  let labels = [];
  if (app.K === 0) labels = tr.yesNo;
  else if (app.K === 1) labels = tr.pauseMenu;
  else if (app.K === 2) labels = tr.options;
  else if (app.K === 3) labels = tr.mainMenu;
  else if (app.K === 5) labels = tr.modes;
  else if (app.K === 13 || app.K === 14) labels = localizedLevelLabels();

  const g = getChoiceGeometry(labels, app.K);
  const clickedVisible = Math.floor((y - g.listTop) / g.rowHeight);
  if (clickedVisible >= 0 && clickedVisible < g.visibleRows) {
    const targetIdx = g.firstVisible + clickedVisible;
    if (targetIdx >= 0 && targetIdx < labels.length && !isMapLocked(app.K, targetIdx, labels.length)) {
      app.selection = targetIdx;
      flashSoftkey('left');
      activateCurrentSelection();
    }
  }
}

function advanceTypewriterTick() {
  if (app.screen !== 'menu' || (app.K !== 5 && (app.K < 6 || app.K > 10))) return;
  const tr = t();
  let desc = '';
  let boxW = WIDTH - 32;
  let boxH = 110;
  if (app.K === 5 && app.selection < 5) {
    desc = tr.modeDesc[app.selection] || '';
  } else if (app.K >= 6 && app.K <= 10) {
    const mode = app.K - 6;
    const selected = Math.max(0, Math.min(app.selection, 3));
    const descIdx = selected === 0 ? (mode === 2 ? 5 : mode === 3 ? 4 : mode === 4 ? 6 : 0) : selected;
    desc = tr.configDesc[descIdx] || '';
    const colX = Math.floor(WIDTH / 13);
    boxW = WIDTH - (colX << 1);
    boxH = HEIGHT - (40 + 88 + 14) - 22;
  }
  if (!desc) return;
  const lines = wrapUiText(ctx, desc, boxW - 10);
  if (!lines.length) return;
  const fontH = app.font?.lineHeight ?? UI_LINE_HEIGHT;
  const maxLines = Math.max(1, Math.floor((boxH - 8) / fontH));
  const ts = app.typeState;
  ts.timer -= 1;
  ts.showCursor = !ts.showCursor;
  if (ts.timer > 0) return;
  if (ts.lineIdx >= lines.length) {
    ts.lineIdx = 0;
    ts.charIdx = 0;
    ts.scrollIdx = 0;
    ts.timer = 1;
    return;
  }
  ts.charIdx += 2;
  if (ts.charIdx >= lines[ts.lineIdx].length) {
    ts.charIdx = 0;
    ts.lineIdx += 1;
    ts.timer = ts.lineIdx >= lines.length ? 32 : 6;
    if (ts.lineIdx - ts.scrollIdx >= maxLines && ts.lineIdx < lines.length) {
      ts.scrollIdx += 1;
    }
  } else {
    ts.timer = 1;
  }
}

function stopHostWorker() {
  if (app.mpWorker) {
    try { app.mpWorker.terminate(); } catch {}
    if (app.mpWorker.__blobUrl && typeof URL?.revokeObjectURL === 'function') {
      try { URL.revokeObjectURL(app.mpWorker.__blobUrl); } catch {}
    }
    app.mpWorker = null;
  }
  app.mpWorkerRunning = false;
}

function tickHostMatchStep() {
  if (app.mpMode !== 'host' || !app.match) return;
  if (app.loadingTicks > 0) {
    app.loadingTicks -= 1;
    return;
  }
  const localCtrl = app.screen === 'game' ? app.input : Object.create(null);
  tickSourceMatch(app.match, localCtrl, app.data);
  if (app.soundEnabled && app.screen === 'game' && app.match.soundEvents?.length) {
    for (const sfxId of app.match.soundEvents) playSourceSound(sfxId, true);
  }
  app.mpClient?.sendSnapshot(packMatchSnapshot(app.match));
  if (app.match.finished && !app.mpFinishTriggered) {
    app.mpFinishTriggered = true;
    stopHostWorker();
    app.K = 22;
    app.selection = 0;
    app.screen = 'menu';
  }
}

function startHostWorker() {
  stopHostWorker();
  if (typeof Worker === 'undefined' || typeof Blob === 'undefined' || typeof URL?.createObjectURL !== 'function') {
    return;
  }
  try {
    const workerSrc = `setInterval(() => postMessage(1), ${TICK_TARGET_MS});`;
    const blobUrl = URL.createObjectURL(new Blob([workerSrc], { type: 'application/javascript' }));
    const worker = new Worker(blobUrl);
    worker.__blobUrl = blobUrl;
    worker.onmessage = () => tickHostMatchStep();
    worker.onerror = () => stopHostWorker();
    app.mpWorker = worker;
    app.mpWorkerRunning = true;
  } catch {
    stopHostWorker();
  }
}

function sendGuestInputState(immediate = false) {
  if (app.mpMode !== 'guest' || !app.mpClient) return;
  const payload = {
    left: Boolean(app.input.left),
    right: Boolean(app.input.right),
    jump: Boolean(app.input.jump),
    drop: Boolean(app.input.drop),
    fire: Boolean(app.input.fire),
    switchWeapon: Boolean(app.input.switchWeapon),
    facingOverride: typeof app.input.facingOverride === 'number' ? app.input.facingOverride : null,
  };
  if (app.input.switchWeapon) app.input.switchWeapon = false;
  const json = JSON.stringify(payload);
  app.mpInputTick += 1;
  const anyHeld = payload.left || payload.right || payload.jump || payload.drop || payload.fire;
  if (immediate || json !== app.mpLastInputSent || (anyHeld && app.mpInputTick % 2 === 0)) {
    app.mpClient.sendInput(payload);
    app.mpLastInputSent = json;
  }
}

function stopMpRuntime({ leaveRoom = false } = {}) {
  stopHostWorker();
  app.mpMode = 'single';
  app.mpFinishTriggered = false;
  app.mpLastInputSent = '';
  app.mpInputTick = 0;
  if (leaveRoom && app.mpClient) {
    app.mpClient.leaveRoom();
    app.mpLobby = null;
    app.mpConfig = null;
    renderMpLobby();
  }
}

function buildMatchSettingsFromMp(config) {
  const playersCount = config?.players?.length || 1;
  const totalActors = Math.max(2, Math.min(10, playersCount + (config?.botCount ?? 2)));
  const soldiers = Math.max(1, Math.min(totalActors - 1, totalActors >> 1));
  const limit = Math.max(1, Math.min(50, config?.targetLimit ?? 15));
  return {
    ...app.settings,
    I: totalActors,
    balance: [soldiers, totalActors - soldiers],
    F: limit,
    D: limit,
    E: limit,
    G: limit,
  };
}

function launchMultiplayerMatch(role, config) {
  stopHostWorker();
  app.mpMode = role;
  app.mpConfig = config;
  app.mpFinishTriggered = false;
  app.mpLastInputSent = '';
  app.mpInputTick = 0;
  app.input = Object.create(null);
  closeMpLobby();

  const humans = (config?.players || []).map((p, idx) => ({
    clientId: p.clientId,
    name: p.name,
    character: p.character === 1 ? 1 : 0,
    slot: idx,
  }));
  app.mode = config?.mode ?? MODE.DEATHMATCH;
  app.levelIndex = app.mode === MODE.CAPTURE_FLAG ? Math.min(4, config?.levelIndex ?? 0) : (config?.levelIndex ?? 0);
  app.match = createSourceMatch(app.data, {
    mode: app.mode,
    levelIndex: app.levelIndex,
    character: app.character,
    settings: buildMatchSettingsFromMp(config),
    humans,
    localClientId: app.mpClient?.clientId || null,
  });
  if (app.cheatAllWeapons && app.match?.player) {
    app.match.player.ownedWeapons = [1, 1, 1, 1, 1, 1];
    app.match.player.ammo = [1, 100, 100, 100, 100, 100];
  }
  app.K = 1;
  app.loadingTicks = 0;
  app.screen = 'game';
  if (role === 'host') {
    app.mpClient?.sendSnapshot(packMatchSnapshot(app.match));
    startHostWorker();
  }
}

function openMpLobby() {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('mp-lobby');
  if (!el) return;
  el.hidden = false;
  app.input = Object.create(null);
  renderMpTexts();
  renderMpLobby();
}

function closeMpLobby() {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('mp-lobby');
  if (el) el.hidden = true;
}

function returnToMpLobbyAfterMatch() {
  stopHostWorker();
  app.input = Object.create(null);
  if (app.mpMode === 'host' && app.mpClient) {
    app.mpClient.returnToLobby();
  }
  openMpLobby();
}

function ensureMpClient() {
  if (app.mpClient) return app.mpClient;
  app.mpClient = new MultiplayerClient({
    onLobbyUpdate: (lobby) => {
      app.mpLobby = lobby;
      renderMpLobby();
    },
    onStartMatch: (config) => {
      launchMultiplayerMatch(app.mpClient?.role === 'host' ? 'host' : 'guest', config);
    },
    onGuestInput: (clientId, input) => {
      if (!app.match?.remoteInputs || !input) return;
      const prev = app.match.remoteInputs[clientId] || {};
      app.match.remoteInputs[clientId] = {
        ...prev,
        ...input,
        switchWeapon: Boolean(input.switchWeapon || prev.switchWeapon),
      };
    },
    onGuestLeave: (clientId) => {
      if (app.match?.remoteInputs) delete app.match.remoteInputs[clientId];
    },
    onSnapshot: (snap) => {
      if (app.mpMode !== 'guest' || !app.match) return;
      applyMatchSnapshot(app.match, snap, Boolean(app.input.drop));
      if (app.soundEnabled && app.match.soundEvents?.length) {
        for (const sfxId of app.match.soundEvents) playSourceSound(sfxId, true);
      }
      if (app.match.finished && !app.mpFinishTriggered) {
        app.mpFinishTriggered = true;
        app.K = 22;
        app.selection = 0;
        app.screen = 'menu';
      }
    },
    onReturnLobby: () => {
      stopHostWorker();
      openMpLobby();
    },
    onDisconnect: (reason) => {
      stopMpRuntime({ leaveRoom: false });
      app.mpLobby = null;
      const err = typeof document !== 'undefined' ? document.getElementById('mp-home-error') : null;
      if (err) {
        err.textContent = reason || '';
        err.hidden = !reason;
      }
      renderMpLobby();
    },
  });
  return app.mpClient;
}

function renderMpTexts() {
  if (typeof document === 'undefined') return;
  const mp = t().mp;
  if (!mp) return;
  const setText = (id, txt) => {
    const node = document.getElementById(id);
    if (node && txt != null) node.textContent = txt;
  };
  setText('btn-mp-lobby', mp.toolbarBtn);
  setText('mp-title', mp.title);
  setText('mp-subtitle', mp.subtitle);
  setText('mp-name-label', mp.nameLabel);
  setText('btn-mp-create', mp.createBtn);
  setText('mp-or-label', mp.orLabel);
  setText('btn-mp-join', mp.joinBtn);
  setText('mp-code-label', mp.codeLabel);
  setText('btn-mp-copy', mp.copyBtn);
  setText('btn-mp-tab2', mp.tab2Btn);
  setText('mp-mode-label', mp.modeLabel);
  setText('mp-level-label', mp.levelLabel);
  setText('mp-bots-label', mp.botsLabel);
  setText('mp-limit-label', mp.limitLabel);
  setText('mp-char0-name', t().characters[0]);
  setText('mp-char0-team', mp.soldierSub);
  setText('mp-char1-name', t().characters[1]);
  setText('mp-char1-team', mp.mutantSub);
  setText('btn-mp-leave', mp.leaveBtn);

  const codeInput = document.getElementById('mp-code-input');
  if (codeInput) codeInput.placeholder = mp.codePlaceholder;

  const modeSelect = document.getElementById('mp-mode-select');
  if (modeSelect) {
    const prev = modeSelect.value || String(app.mode);
    modeSelect.innerHTML = '';
    t().modeTitles.forEach((label, idx) => {
      const opt = document.createElement('option');
      opt.value = String(idx);
      opt.textContent = label;
      modeSelect.appendChild(opt);
    });
    modeSelect.value = prev;
  }

  const levelSelect = document.getElementById('mp-level-select');
  if (levelSelect) {
    const curMode = app.mpLobby?.mode ?? Number(modeSelect?.value ?? app.mode);
    const prev = levelSelect.value || String(app.levelIndex);
    levelSelect.innerHTML = '';
    for (let i = 0; i < 11; i++) {
      const opt = document.createElement('option');
      opt.value = String(i);
      const locked = curMode === MODE.CAPTURE_FLAG && i >= 5;
      opt.disabled = locked;
      opt.textContent = `${t().levelPrefix} ${i + 1}${locked ? ' (CTF✕)' : ''}`;
      levelSelect.appendChild(opt);
    }
    levelSelect.value = curMode === MODE.CAPTURE_FLAG && Number(prev) >= 5 ? '0' : prev;
  }
}

function renderMpLobby() {
  if (typeof document === 'undefined') return;
  const homeView = document.getElementById('mp-home-view');
  const roomView = document.getElementById('mp-room-view');
  if (!homeView || !roomView) return;

  const lobby = app.mpLobby;
  const mp = t().mp;
  if (!lobby || !lobby.roomCode || lobby.status === 'idle') {
    homeView.hidden = false;
    roomView.hidden = true;
    return;
  }

  homeView.hidden = true;
  roomView.hidden = false;
  const errEl = document.getElementById('mp-home-error');
  if (errEl) errEl.hidden = true;

  const codeBadge = document.getElementById('mp-room-code');
  if (codeBadge) codeBadge.textContent = lobby.roomCode;
  const txBadge = document.getElementById('mp-transport-badge');
  if (txBadge) txBadge.textContent = lobby.transport || lobby.statusNote || 'Local';

  const isHost = lobby.role === 'host';
  const curMode = lobby.mode ?? 0;
  const modeSel = document.getElementById('mp-mode-select');
  const lvlSel = document.getElementById('mp-level-select');
  const botsSel = document.getElementById('mp-bots-select');
  const limitInp = document.getElementById('mp-limit-input');
  if (modeSel) {
    modeSel.value = String(curMode);
    modeSel.disabled = !isHost;
  }
  if (lvlSel) {
    for (const opt of lvlSel.options) {
      const idx = Number(opt.value);
      const locked = curMode === MODE.CAPTURE_FLAG && idx >= 5;
      opt.disabled = locked;
      opt.textContent = `${t().levelPrefix} ${idx + 1}${locked ? ' (CTF✕)' : ''}`;
    }
    lvlSel.value = String(lobby.levelIndex ?? 0);
    lvlSel.disabled = !isHost;
  }
  if (botsSel) {
    botsSel.value = String(lobby.botCount ?? 2);
    botsSel.disabled = !isHost;
  }
  if (limitInp) {
    limitInp.value = String(lobby.targetLimit ?? 15);
    limitInp.disabled = !isHost;
  }

  const me = lobby.players.find((p) => p.clientId === app.mpClient?.clientId);
  const myChar = me?.character ?? lobby.myCharacter ?? 0;
  document.getElementById('mp-char-0')?.classList.toggle('active', myChar === 0);
  document.getElementById('mp-char-1')?.classList.toggle('active', myChar === 1);

  const list = document.getElementById('mp-players-list');
  if (list) {
    list.innerHTML = '';
    for (let i = 0; i < 4; i++) {
      const p = lobby.players[i];
      const slot = document.createElement('div');
      slot.className = p ? 'mp-slot' : 'mp-slot is-empty';
      if (p) {
        const left = document.createElement('div');
        left.className = 'mp-slot-left';
        const nameEl = document.createElement('strong');
        const isMe = p.clientId === app.mpClient?.clientId;
        nameEl.textContent = `${p.name}${p.isHost ? ` [${mp.hostTag}]` : ''}${isMe ? ` ${mp.youTag}` : ''}`;
        const charEl = document.createElement('span');
        charEl.className = `mp-char-tag ${p.character === 1 ? 'mutant' : 'soldier'}`;
        charEl.textContent = t().characters[p.character === 1 ? 1 : 0];
        left.append(nameEl, charEl);

        const readyEl = document.createElement('span');
        readyEl.className = `mp-ready-pill ${p.ready ? 'ready' : ''}`;
        readyEl.textContent = p.ready ? mp.readyTag : mp.waitTag;
        slot.append(left, readyEl);
      } else {
        const empty = document.createElement('span');
        empty.textContent = `${i + 1}. ${mp.emptySlot}`;
        slot.appendChild(empty);
      }
      list.appendChild(slot);
    }
  }

  const countdownEl = document.getElementById('mp-countdown');
  if (countdownEl) {
    if (lobby.status === 'countdown' && lobby.countdown > 0) {
      countdownEl.hidden = false;
      countdownEl.textContent = `${mp.countdownPrefix}${lobby.countdown}s...`;
    } else if (lobby.players.length < 2) {
      countdownEl.hidden = false;
      countdownEl.textContent = `${mp.waitTag} (${lobby.players.length}/2)`;
    } else {
      countdownEl.hidden = true;
    }
  }

  const readyBtn = document.getElementById('btn-mp-ready');
  if (readyBtn) {
    const amReady = Boolean(me?.ready);
    readyBtn.classList.toggle('is-ready', amReady);
    readyBtn.textContent = amReady ? mp.unreadyBtn : mp.readyBtn;
  }
}

function getMpPlayerName(fallbackSuffix = '') {
  const raw = document.getElementById('mp-name-input')?.value?.trim();
  if (raw) return raw;
  return `${t().mp.defaultName}${fallbackSuffix}`;
}

async function joinMpRoomByCode(rawCode) {
  const errEl = document.getElementById('mp-home-error');
  if (errEl) errEl.hidden = true;
  const client = ensureMpClient();
  const code = String(rawCode || '').trim();
  if (!code) {
    if (errEl) {
      errEl.textContent = t().mp.joinErrorEmpty;
      errEl.hidden = false;
    }
    return false;
  }
  const ok = await client.joinRoom(code, getMpPlayerName(' 2'), 1);
  if (!ok && errEl) {
    errEl.textContent = t().mp.joinErrorFail;
    errEl.hidden = false;
  }
  return ok;
}

function initMultiplayerUi() {
  if (typeof document === 'undefined') return;
  renderMpTexts();

  document.getElementById('btn-mp-lobby')?.addEventListener('click', (e) => {
    e.currentTarget?.blur?.();
    openMpLobby();
  });
  document.getElementById('btn-mp-close')?.addEventListener('click', closeMpLobby);

  document.getElementById('btn-mp-create')?.addEventListener('click', () => {
    const client = ensureMpClient();
    client.createRoom(getMpPlayerName(' 1'), {
      mode: app.mode,
      levelIndex: app.levelIndex,
      botCount: 2,
      targetLimit: app.settings.F || 15,
      character: 0,
      code: generateRoomCode(),
    });
  });

  document.getElementById('btn-mp-join')?.addEventListener('click', () => {
    joinMpRoomByCode(document.getElementById('mp-code-input')?.value);
  });

  document.getElementById('mp-code-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') joinMpRoomByCode(e.target.value);
  });

  document.getElementById('btn-mp-copy')?.addEventListener('click', async () => {
    const code = app.mpLobby?.roomCode;
    if (!code || typeof window === 'undefined') return;
    const shareUrl = new URL(window.location.href);
    shareUrl.searchParams.set('mp', code);
    try { await navigator.clipboard?.writeText(shareUrl.toString()); } catch {}
    const btn = document.getElementById('btn-mp-copy');
    if (btn) {
      btn.textContent = t().mp.copiedBtn;
      window.setTimeout(() => { btn.textContent = t().mp.copyBtn; }, 1400);
    }
  });

  document.getElementById('btn-mp-tab2')?.addEventListener('click', () => {
    const code = app.mpLobby?.roomCode;
    if (!code || typeof window === 'undefined') return;
    const shareUrl = new URL(window.location.href);
    shareUrl.searchParams.set('mp', code);
    window.open(shareUrl.toString(), '_blank');
  });

  document.getElementById('mp-mode-select')?.addEventListener('change', (e) => {
    const mode = Number(e.target.value) || 0;
    const lvl = mode === MODE.CAPTURE_FLAG ? Math.min(4, app.mpLobby?.levelIndex || 0) : (app.mpLobby?.levelIndex || 0);
    app.mpClient?.updateConfig({ mode, levelIndex: lvl });
  });
  document.getElementById('mp-level-select')?.addEventListener('change', (e) => {
    app.mpClient?.updateConfig({ levelIndex: Number(e.target.value) || 0 });
  });
  document.getElementById('mp-bots-select')?.addEventListener('change', (e) => {
    app.mpClient?.updateConfig({ botCount: Number(e.target.value) || 0 });
  });
  document.getElementById('mp-limit-input')?.addEventListener('change', (e) => {
    app.mpClient?.updateConfig({ targetLimit: Math.max(1, Math.min(50, Number(e.target.value) || 15)) });
  });

  document.getElementById('mp-char-0')?.addEventListener('click', () => app.mpClient?.selectCharacter(0));
  document.getElementById('mp-char-1')?.addEventListener('click', () => app.mpClient?.selectCharacter(1));
  document.getElementById('btn-mp-ready')?.addEventListener('click', () => {
    const me = app.mpLobby?.players?.find((p) => p.clientId === app.mpClient?.clientId);
    app.mpClient?.setReady(!me?.ready);
  });
  document.getElementById('btn-mp-leave')?.addEventListener('click', () => {
    stopMpRuntime({ leaveRoom: true });
    if (app.match) {
      app.match = null;
      resetMenuSelection(3);
    }
  });

  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const mpCode = params.get('mp');
    if (mpCode) {
      const codeInput = document.getElementById('mp-code-input');
      const nameInput = document.getElementById('mp-name-input');
      if (codeInput) codeInput.value = mpCode.toUpperCase();
      if (nameInput && (nameInput.value === 'Chiến Binh' || nameInput.value === 'Soldier')) {
        nameInput.value = `${t().mp.defaultName} 2`;
      }
      openMpLobby();
      joinMpRoomByCode(mpCode);
    }
  }
}

async function boot() {
  if (!canvas || !ctx) return;
  try {
    const [images, tables] = await Promise.all([loadOriginalImages(), loadOriginalTables()]);
    app.images = images;
    app.data = tables;
    app.data.text = parseJ2meTextTable(tables.raw.text);
    app.data.about = decodeJ2meText(tables.raw.text1);
    app.data.help = decodeJ2meText(tables.raw.text2);
    app.data.settings = decodeJ2meText(tables.raw.text3);
    app.data.status = decodeJ2meText(tables.raw.text4);
    app.data.text3Rows = app.data.settings.split(/[\r\n]+/).filter(Boolean);
    app.data.statusRows = app.data.status.split(/[\r\n]+/).filter(Boolean);
    app.data.levelLabels = Array.from({ length: 12 }, (_, index) =>
      index === 11 ? (app.data.text[5]?.[5] || 'Назад') : `${index + 1}. Уровень`);
    app.font = createOriginalFont(images.fnt, decodeFontMetrics(tables.raw.cf));
    app.data.tickSourceMatch = (match, input) => tickSourceMatch(match, input, app.data);
    app.data.createSourceMatch = (opts) => createSourceMatch(app.data, opts);
    app.screen = 'startup';
    app.K = 0;

    canvas.addEventListener('pointerdown', (e) => {
      handleCanvasPointer(e.clientX, e.clientY);
    });
    syncLangButton();
    document.getElementById('btn-lang')?.addEventListener('click', (e) => {
      e.currentTarget?.blur?.();
      toggleLanguage();
    });
    document.getElementById('btn-fullscreen')?.addEventListener('click', (e) => {
      e.currentTarget?.blur?.();
      const stage = document.getElementById('viewport-stage');
      if (!document.fullscreenElement) stage?.requestFullscreen?.().catch(() => {});
      else document.exitFullscreen?.().catch(() => {});
    });
    initMultiplayerUi();

    app.loop = createEngineLoop({
      tick(event) {
        handleSourceInput(event);
        if (event.type === 'source-tick') {
          if (app.mpMode === 'host') {
            if (!app.mpWorkerRunning) tickHostMatchStep();
            else advanceTypewriterTick();
            return;
          }
          if (app.mpMode === 'guest') {
            advanceTypewriterTick();
            if (app.screen === 'game' && app.match && !app.match.finished) {
              sendGuestInputState(false);
            }
            return;
          }
          if (app.loadingTicks > 0) {
            app.loadingTicks -= 1;
            return;
          }
          advanceTypewriterTick();
          if (app.screen === 'game' && app.match) {
            tickSourceMatch(app.match, app.input, app.data);
            if (app.soundEnabled && app.match.soundEvents?.length) {
              for (const sfxId of app.match.soundEvents) playSourceSound(sfxId, true);
            }
            if (app.match.finished) {
              app.K = 22;
              app.selection = 0;
              app.screen = 'menu';
            }
          }
        }
      },
      render: paint,
      frameBudget: TICK_TARGET_MS,
    });
    app.loop.start();
    if (typeof window !== 'undefined') {
      window.__TT_APP__ = app;
      window.setTimeout(() => { if (app.screen === 'startup') app.screen = 'title'; }, 1800);
      window.setTimeout(() => { if (app.screen === 'title') resetMenuSelection(0); }, 4200);
    }
  } catch (error) {
    console.error('Original JAR loading failed:', error);
    app.screen = 'error';
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = '#fff';
    ctx.font = '10px monospace';
    ctx.fillText(String(error.message || error).slice(0, 32), 8, 20);
  }
}

export { app, resetMenuSelection, startMatch };
if (canvas && ctx) boot();
