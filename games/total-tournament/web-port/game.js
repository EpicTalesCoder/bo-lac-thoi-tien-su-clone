import { loadOriginalImages, loadOriginalTables } from './tt-loader.js';
import { decodeJ2meText, parseJ2meTextTable, wrapJ2meText } from './text-original.js';
import { decodeFontMetrics, createOriginalFont } from './font-original.js';
import { renderOriginal } from './render-original.js';
import { TICK_TARGET_MS, createEngineLoop, decodeGameplayKey, getUiSpriteRect, MODE } from './tt-core.js';
import { withMIDPClip } from './midp-graphics.js';
import {
  createSourceMatch,
  tickSourceMatch,
  poseForActor,
  EFFECT_FRAMES,
  PROJECTILE_SPRITE_BASE,
  DEFAULT_SETTINGS,
} from './tt-match.js';
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
};

function t() {
  return LANG[app.lang === 'en' ? 'en' : 'vi'];
}

function syncLangButton() {
  if (typeof document === 'undefined') return;
  const btn = document.getElementById('btn-lang');
  if (btn) btn.textContent = app.lang === 'en' ? '🌐 EN' : '🌐 VI';
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
  });
}

function drawSprite(ctx2d, spriteId, x, y) {
  const rect = getUiSpriteRect(app.data.ccs, spriteId, 6);
  const sheet = app.images[`s${rect.sheetIndex}`];
  if (!sheet || rect.width <= 0 || rect.height <= 0) return;
  withMIDPClip(ctx2d, x, y, rect.width, rect.height, () => {
    ctx2d.drawImage(sheet, x - rect.sourceX, y - rect.sourceY);
  });
}

function drawCu2Frame(ctx2d, frameId, x, y, facing = 1) {
  const meta = app.data?.cu2?.[frameId];
  if (!meta || meta[2] <= 0 || meta[3] <= 0) return;
  const [sourceX, sourceY, width, height, , , imageIndex] = meta;
  const bankIndex = imageIndex + (facing < 0 && imageIndex < 5 ? 9 : 0);
  const sheet = app.images[`u${bankIndex}`] || app.images[`u${imageIndex}`];
  if (!sheet) return;
  const drawX = facing < 0 && imageIndex < 5
    ? x - sheet.width + width + sourceX
    : x - sourceX;
  withMIDPClip(ctx2d, x, y, width, height, () => {
    ctx2d.drawImage(sheet, drawX, y - sourceY);
  });
}

const UI_FONT = 'bold 9px "DejaVu Sans", "Liberation Sans", Arial, sans-serif';
const UI_LINE_HEIGHT = 11;

function measureUiText(ctx2d, text) {
  const str = String(text ?? '');
  if (!ctx2d) return str.length * 6;
  ctx2d.save();
  ctx2d.font = UI_FONT;
  const w = Math.ceil(ctx2d.measureText(str).width);
  ctx2d.restore();
  return w;
}

function wrapUiText(ctx2d, text, maxWidth) {
  const paragraphs = String(text ?? '').split(/[\r\n]+/);
  const lines = [];
  for (const para of paragraphs) {
    const words = para.trim().split(/\s+/).filter(Boolean);
    if (!words.length) continue;
    let current = '';
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (current && measureUiText(ctx2d, next) > maxWidth) {
        lines.push(current);
        current = word;
      } else {
        current = next;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

function drawText(ctx2d, text, x, y, anchor = 20, color = '#ffffff') {
  const str = String(text ?? '');
  if (!str) return;
  ctx2d.save();
  ctx2d.font = UI_FONT;
  ctx2d.textBaseline = 'top';
  ctx2d.textAlign = 'left';
  let drawX = Math.round(x);
  const drawY = Math.round(y);
  if (anchor & 1) drawX -= measureUiText(ctx2d, str) >> 1;
  ctx2d.fillStyle = '#000000';
  ctx2d.fillText(str, drawX + 1, drawY + 1);
  ctx2d.fillText(str, drawX - 1, drawY);
  ctx2d.fillText(str, drawX + 1, drawY);
  ctx2d.fillText(str, drawX, drawY - 1);
  ctx2d.fillText(str, drawX, drawY + 1);
  ctx2d.fillStyle = color;
  ctx2d.fillText(str, drawX, drawY);
  ctx2d.restore();
}

function localizedLevelLabels() {
  const tr = t();
  return Array.from({ length: 12 }, (_, index) =>
    index === 11 ? tr.back : `${index + 1}. ${tr.levelPrefix} ${index + 1}`);
}

// Draw softkeys (OK left, Back right) using original ccs sprites 32 & 33 (c.java:300-310).
function drawSoftkeys(ctx2d) {
  const h = app.data.ccs[3][32] || 14;
  const wR = app.data.ccs[2][33] || 14;
  drawSprite(ctx2d, 32, 0, HEIGHT - h);
  drawSprite(ctx2d, 33, WIDTH - wR, HEIGHT - h);
}

function drawHudBox(ctx2d, x, y, borderHex, fillHex, digits, alignRight) {
  const digitW = (app.data.ccs[2][1] || 7) + 1;
  const digitH = app.data.ccs[3][1] || 9;
  const boxW = digitW * Math.abs(digits) + 8;
  let drawX = x;
  if (alignRight) {
    drawX -= boxW;
    if (digits < 0) drawX -= boxW;
  }
  ctx2d.fillStyle = fillHex;
  ctx2d.fillRect(drawX, y, boxW, digitH + 6);
  ctx2d.strokeStyle = borderHex;
  ctx2d.strokeRect(drawX + 1, y + 1, boxW - 2, digitH + 4);
  ctx2d.strokeStyle = '#000000';
  ctx2d.strokeRect(drawX, y, boxW, digitH + 6);
  return { x: drawX, y, w: boxW, h: digitH + 6 };
}

function drawFittedText(ctx2d, text, centerX, y, maxWidth, color = '#ffffff') {
  const str = String(text ?? '');
  if (!str) return;
  let fontSize = 9;
  ctx2d.save();
  ctx2d.font = `bold ${fontSize}px "DejaVu Sans", "Liberation Sans", Arial, sans-serif`;
  while (fontSize > 6.5 && ctx2d.measureText(str).width > maxWidth) {
    fontSize -= 0.5;
    ctx2d.font = `bold ${fontSize}px "DejaVu Sans", "Liberation Sans", Arial, sans-serif`;
  }
  const measured = Math.ceil(ctx2d.measureText(str).width);
  const drawX = Math.round(centerX - (measured >> 1));
  const drawY = Math.round(y + ((9 - fontSize) * 0.5));
  ctx2d.textBaseline = 'top';
  ctx2d.textAlign = 'left';
  ctx2d.fillStyle = '#000000';
  ctx2d.fillText(str, drawX + 1, drawY + 1);
  ctx2d.fillText(str, drawX - 1, drawY);
  ctx2d.fillText(str, drawX + 1, drawY);
  ctx2d.fillText(str, drawX, drawY - 1);
  ctx2d.fillText(str, drawX, drawY + 1);
  ctx2d.fillStyle = color;
  ctx2d.fillText(str, drawX, drawY);
  ctx2d.restore();
}

// Port of c.java:618-677, c.java:1330-1436 using exact curs.png (32x27) geometry.
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
  const S = 22; // Left bracket X
  const R = WIDTH - 22 - capW; // Right bracket X (202)
  let listTop = (HEIGHT >> 1) - ((visibleRows * rowHeight) >> 1);
  if (modeSelection) listTop = 24;
  if (characterSelection) listTop = (HEIGHT >> 1) + (HEIGHT >> 2) - (rowHeight >> 1);
  const firstVisible = Math.max(0, Math.min(app.selection - 4, Math.max(0, rows - 5)));
  return { sourceCursor, sourceCursorWidth, sourceCursorHeight, capW, halfH, modeSelection, characterSelection, rowHeight, rows, visibleRows, Q, S, R, listTop, firstVisible };
}

function drawChoiceBar(ctx2d, g, y, fillStyle, inset, label) {
  const { sourceCursor, sourceCursorHeight, capW, halfH, Q, S, R } = g;
  const leftX = S - inset;
  const rightX = R + inset;
  const barTop = y - halfH;
  const innerLeft = leftX + capW - 2;
  const innerRight = rightX + 2;
  const innerW = Math.max(20, innerRight - innerLeft);

  ctx2d.fillStyle = fillStyle;
  ctx2d.fillRect(innerLeft, barTop + 3, innerW, sourceCursorHeight - 6);

  if (sourceCursor) {
    withMIDPClip(ctx2d, leftX, barTop, capW, sourceCursorHeight, () =>
      ctx2d.drawImage(sourceCursor, leftX, barTop));
    withMIDPClip(ctx2d, rightX, barTop, capW, sourceCursorHeight, () =>
      ctx2d.drawImage(sourceCursor, rightX - capW, barTop));
  }

  // Top & bottom metallic rails aligned strictly between left & right brackets (c.java:1413-1420)
  ctx2d.strokeStyle = '#000000';
  for (const offset of [2, 4, sourceCursorHeight - 4, sourceCursorHeight - 2]) {
    ctx2d.beginPath();
    ctx2d.moveTo(innerLeft, barTop + offset);
    ctx2d.lineTo(innerRight, barTop + offset);
    ctx2d.stroke();
  }
  ctx2d.strokeStyle = '#bbb800';
  for (const offset of [3, sourceCursorHeight - 3]) {
    ctx2d.beginPath();
    ctx2d.moveTo(innerLeft, barTop + offset);
    ctx2d.lineTo(innerRight, barTop + offset);
    ctx2d.stroke();
  }

  drawFittedText(ctx2d, label, Q, y - 5, innerW - 8);
}

function drawChoicePage(ctx2d, labels, state) {
  const tr = t();
  const fontHeight = UI_LINE_HEIGHT;
  const g = getChoiceGeometry(labels, state);
  const confirmation = state === 0;
  const { modeSelection, characterSelection, rowHeight, Q, listTop, firstVisible } = g;

  if (characterSelection) {
    app.character = app.selection === 1 ? 1 : 0;
    const f1 = app.images.f1;
    const f2 = app.images.f2;
    const portraitY = (HEIGHT >> 2) - ((f1?.height ?? 64) >> 1) + 8;
    const leftX = (WIDTH >> 2) - ((f1?.width ?? 48) >> 1);
    const rightX = WIDTH - (WIDTH >> 2) - ((f2?.width ?? 48) >> 1);
    const activeX = app.selection === 0 ? leftX : rightX;
    const activeImg = app.selection === 0 ? f1 : f2;
    ctx2d.fillStyle = '#162400';
    ctx2d.fillRect(0, (HEIGHT >> 2) - 46, WIDTH, 92);
    if (activeImg) {
      ctx2d.fillStyle = '#445800';
      ctx2d.fillRect(activeX - 9, portraitY - 4, activeImg.width + 18, activeImg.height + 8);
      ctx2d.fillStyle = '#557000';
      ctx2d.fillRect(activeX - 3, portraitY - 3, activeImg.width + 6, activeImg.height + 6);
    }
    if (f1) {
      ctx2d.strokeStyle = app.selection === 0 ? '#f1fa00' : '#758800';
      ctx2d.strokeRect(leftX - 1, portraitY - 1, f1.width + 2, f1.height + 2);
      ctx2d.drawImage(f1, leftX, portraitY);
    }
    if (f2) {
      ctx2d.strokeStyle = app.selection === 1 ? '#f1fa00' : '#95a500';
      ctx2d.strokeRect(rightX - 1, portraitY - 1, f2.width + 2, f2.height + 2);
      ctx2d.drawImage(f2, rightX, portraitY);
    }

    const label = labels[app.selection] || labels[0] || '';
    drawChoiceBar(ctx2d, g, listTop, app.selection === 0 ? '#cc0000' : '#0033cc', 0, label);
    drawSoftkeys(ctx2d);
    return;
  }

  // Render visible rows (up to 5)
  labels.slice(firstVisible, firstVisible + 5).forEach((rawLabel, visibleIndex) => {
    const absoluteIndex = firstVisible + visibleIndex;
    const selected = absoluteIndex === app.selection;
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
    drawChoiceBar(ctx2d, g, y, selected ? '#cb0000' : '#2d4700', selected ? 4 : 0, label);
  });

  // Scroll arrows if list > 5 (c.java:1424-1431)
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

  // Mode description box at bottom of K=5 (c.java:621-651)
  if (modeSelection && app.selection < 5) {
    const desc = tr.modeDesc[app.selection] || '';
    const boxX = 16;
    const boxW = WIDTH - 32;
    const boxY = listTop + 5 * rowHeight + 18;
    const boxH = HEIGHT - boxY - 22;
    if (boxH > 20) {
      ctx2d.fillStyle = '#172200';
      ctx2d.fillRect(boxX, boxY, boxW, boxH);
      ctx2d.strokeStyle = '#884800';
      ctx2d.strokeRect(boxX, boxY, boxW, boxH);
      const wrapped = wrapUiText(ctx2d, desc, boxW - 10);
      const maxLines = Math.max(1, Math.floor((boxH - 6) / fontHeight));
      wrapped.slice(0, maxLines).forEach((line, idx) => {
        drawText(ctx2d, line, boxX + 5, boxY + 4 + idx * fontHeight, 20);
      });
    }
  }

  if (confirmation) {
    drawText(ctx2d, tr.soundPrompt, Q, HEIGHT >> 3, 21, '#ffff66');
  }
  drawSoftkeys(ctx2d);
}

// Port of c.java:802-843 — Help & About scrollable text pages.
function drawTextPage(ctx2d, text) {
  const lineHeight = UI_LINE_HEIGHT + 2;
  const maxWidth = WIDTH - 24;
  const visible = wrapUiText(ctx2d, text, maxWidth);
  const rowCapacity = Math.max(1, Math.floor((HEIGHT - 44) / lineHeight));
  const scroll = Math.max(0, Math.min(app.configPage, Math.max(0, visible.length - rowCapacity)));
  visible.slice(scroll, scroll + rowCapacity).forEach((line, index) => {
    const isHeader = index === 0 && scroll === 0;
    drawText(ctx2d, line, isHeader ? (WIDTH >> 1) : 12, 16 + index * lineHeight, isHeader ? 21 : 20, isHeader ? '#ffff66' : '#ffffff');
  });
  drawSoftkeys(ctx2d);
}

// Port of c.java:1090-1325 — Match configuration pages K=6..10.
function drawConfigurationPage(ctx2d, labels, state) {
  const tr = t();
  const parameters = app.settings;
  const mode = state - 6;
  const primary = [parameters.F, parameters.F, parameters.D, parameters.E, parameters.G][mode];
  const values = [primary, parameters.H, parameters.I, `${parameters.balance[0]}:${parameters.balance[1]}`];
  const fontHeight = UI_LINE_HEIGHT;
  const layout = app.data.uiLayout;
  const rowHeight = layout.optionRowHeight;
  const rowStart = layout.optionStartY;
  const selected = Math.max(0, Math.min(app.selection, 3));
  const valueSpriteX = layout.statSpriteX ?? (WIDTH - 56);

  // Mode title header at top
  const title = tr.modeTitles[mode] || '';
  if (title) {
    ctx2d.fillStyle = '#cc0000';
    ctx2d.fillRect(28, 4, WIDTH - 56, fontHeight + 6);
    drawText(ctx2d, title, WIDTH >> 1, 7, 21);
  }

  for (let index = 0; index < Math.min(4, labels.length); index++) {
    const y = rowStart + index * rowHeight;
    const isSel = index === selected;
    ctx2d.fillStyle = isSel ? '#416700' : '#2d4700';
    ctx2d.fillRect(2, y - 3, WIDTH - 4, rowHeight - 4);
    if (isSel) {
      ctx2d.strokeStyle = '#b9b900';
      ctx2d.strokeRect(1, y - 4, WIDTH - 3, rowHeight - 2);
    }
    drawText(ctx2d, labels[index] || '', layout.leftTextX, y + 2, 20);
    const value = String(values[index] ?? '');
    drawText(ctx2d, value, layout.valueX, y + 2, 21);
    const spriteId = index === 3 ? 40 : (index === 0 ? (mode === 2 ? 30 : mode === 3 ? 31 : 27) : 27 + index);
    drawSprite(ctx2d, spriteId, valueSpriteX, y - 2);
    if (isSel) {
      drawSprite(ctx2d, app.selectionDirection < 0 ? 37 : 38, valueSpriteX - 10, y + 3);
      drawSprite(ctx2d, app.selectionDirection > 0 ? 39 : 36, WIDTH - 14, y + 3);
    }
  }

  // Explanation box
  const descIdx = selected === 0 ? (mode === 2 ? 5 : mode === 3 ? 4 : mode === 4 ? 6 : 0) : selected;
  const explanation = tr.configDesc[descIdx] || '';
  const boxY = rowStart + 4 * rowHeight + 12;
  const boxH = HEIGHT - boxY - 24;
  ctx2d.fillStyle = '#172200';
  ctx2d.fillRect(layout.leftTextX, boxY, WIDTH - (layout.leftTextX << 1), boxH);
  ctx2d.strokeStyle = '#884800';
  ctx2d.strokeRect(layout.leftTextX, boxY, WIDTH - (layout.leftTextX << 1), boxH);
  const explanationLines = wrapUiText(ctx2d, explanation, WIDTH - (layout.leftTextX << 1) - 10);
  const maxLines = Math.max(1, Math.floor((boxH - 8) / fontHeight));
  explanationLines.slice(0, maxLines).forEach((line, index) => {
    drawText(ctx2d, line, layout.leftTextX + 5, boxY + 5 + index * fontHeight, 20);
  });
  drawSoftkeys(ctx2d);
}

// Live scoreboard (K=20) & End-of-match results (K=22) (c.java:185-196).
function drawScoreboardPage(ctx2d, isFinal) {
  const tr = t();
  const match = app.match;
  if (!match) return;
  ctx2d.fillStyle = '#111a00';
  ctx2d.fillRect(0, 0, WIDTH, HEIGHT);
  ctx2d.fillStyle = isFinal ? (match.winner === 'player' ? '#006600' : '#880000') : '#2d4700';
  ctx2d.fillRect(0, 0, WIDTH, 22);
  const header = isFinal
    ? (match.winner === 'player' ? tr.win : match.winner === 'draw' ? tr.draw : tr.lose)
    : tr.statsTitle;
  drawText(ctx2d, header, WIDTH >> 1, 6, 21);

  if (match.mode === MODE.TEAM_DEATHMATCH || match.mode === MODE.CAPTURE_FLAG) {
    const scoreStr = `S ${match.teamScore[0]} : ${match.teamScore[1]} M`;
    drawText(ctx2d, scoreStr, WIDTH >> 1, 28, 21);
  }

  const rows = match.rankings?.length
    ? match.rankings
    : [...match.actors]
      .sort((a, b) => b.kills - a.kills || a.deaths - b.deaths)
      .map((a, idx) => ({ rank: idx + 1, name: a.name, isPlayer: a.isPlayer, team: a.team, kills: a.kills, deaths: a.deaths }));

  const startY = 48;
  const rowH = 22;
  drawText(ctx2d, '#', 10, startY - 12, 20, '#ffff66');
  drawText(ctx2d, tr.colPlayer, 32, startY - 12, 20, '#ffff66');
  drawText(ctx2d, tr.colKills, 160, startY - 12, 20, '#ffff66');
  drawText(ctx2d, tr.colDeaths, 202, startY - 12, 20, '#ffff66');

  rows.slice(0, 10).forEach((row, i) => {
    const y = startY + i * rowH;
    ctx2d.fillStyle = row.isPlayer ? '#416700' : (i % 2 === 0 ? '#1b2b00' : '#142000');
    ctx2d.fillRect(6, y, WIDTH - 12, rowH - 2);
    if (row.isPlayer) {
      ctx2d.strokeStyle = '#ffff00';
      ctx2d.strokeRect(6, y, WIDTH - 12, rowH - 2);
    }
    drawText(ctx2d, String(row.rank), 12, y + 5, 20);
    drawText(ctx2d, row.isPlayer ? `${row.name}*` : row.name, 32, y + 5, 20);
    drawText(ctx2d, String(row.kills), 160, y + 5, 20);
    drawText(ctx2d, String(row.deaths), 202, y + 5, 20);
  });
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
    drawTextPage(ctx2d, tr.help);
  } else if (app.K === 12) {
    drawTextPage(ctx2d, tr.about);
  } else if (app.K === 13 || app.K === 14) {
    drawChoicePage(ctx2d, localizedLevelLabels(), app.K);
  } else if (app.K === 20) {
    drawScoreboardPage(ctx2d, false);
  } else if (app.K === 22) {
    drawScoreboardPage(ctx2d, true);
  }
}

// Port of e.java:1614-1654 — CTF bases, animated flags & arena pickups.
function drawMapProps(ctx2d) {
  const match = app.match;
  if (!match) return;
  const cam = match.camera;

  if (match.mode === MODE.CAPTURE_FLAG) {
    const ao = 103;
    const anim = match.flagAnimFrame || 0;
    for (let f = 0; f < 2; f++) {
      const flag = match.flags[f];
      const bx = flag.baseX - cam.x;
      const by = flag.baseY - cam.y;
      drawCu2Frame(ctx2d, f === 0 ? ao + 3 : ao - 1, bx - 2, by - 16);

      const fx = flag.x - cam.x;
      const fy = flag.y - cam.y;
      const flagSprite = f === 0 ? ao + (anim % 3) : ao - 4 + (anim % 3);
      drawCu2Frame(ctx2d, 98, fx, fy - 2);
      drawCu2Frame(ctx2d, flagSprite, fx - 6, fy - 16);
    }
  }

  for (const pickup of match.pickups) {
    if (pickup.respawnTimer > 0) continue;
    const x = pickup.x - cam.x;
    const y = pickup.y - cam.y;
    if (x < -24 || x > WIDTH + 24 || y < -24 || y > HEIGHT + 24) continue;
    const meta = app.data.cu2[pickup.frameId];
    if (!meta || meta[2] <= 0) continue;
    ctx2d.fillStyle = 'rgba(0,0,0,0.45)';
    ctx2d.fillRect(x, y + 1, meta[2], 3);
    drawCu2Frame(ctx2d, pickup.frameId, x, y - meta[3]);
  }
}

// Port of e.java:1656-1677 — Projectiles & Railgun beam.
function drawProjectiles(ctx2d) {
  const match = app.match;
  if (!match) return;
  const cam = match.camera;
  for (const proj of match.projectiles) {
    const sx = Math.round(proj.x - cam.x);
    const sy = Math.round(proj.y - cam.y);
    if (proj.weapon === 5) {
      ctx2d.fillStyle = '#ff0000';
      ctx2d.fillRect(sx - (proj.width >> 1), sy - (proj.height >> 1), proj.width, proj.height);
      ctx2d.fillStyle = '#ffff00';
      ctx2d.fillRect(sx - (proj.width >> 1), sy - (proj.height >> 2), proj.width, Math.max(1, (proj.height >> 1) - 1));
    } else if (proj.weapon > 0) {
      const frameId = (PROJECTILE_SPRITE_BASE[proj.weapon] || 61) + (proj.animToggle || 0);
      drawCu2Frame(ctx2d, frameId, sx - (proj.width >> 1), sy - (proj.height >> 1), proj.facing);
    }
  }
}

// Port of e.java:1679-1694 — Hit sparks, rocket explosions, smoke, spawn flashes.
function drawEffects(ctx2d) {
  const match = app.match;
  if (!match) return;
  const cam = match.camera;
  for (const fx of match.effects) {
    const seq = EFFECT_FRAMES[fx.type];
    if (!seq) continue;
    const frameIdx = Math.max(0, Math.min(seq.length - 1, fx.timer - 1));
    const frameId = seq[frameIdx];
    const meta = app.data.cu2[frameId];
    if (!meta) continue;
    const sx = Math.round(fx.x - cam.x - (meta[2] >> 1));
    const sy = Math.round(fx.y - cam.y - (fx.type === 7 ? meta[3] >> 1 : meta[3]));
    drawCu2Frame(ctx2d, frameId, sx, sy);
  }
}

// Port of e.java:2482-2537 — Original HUD (Armor, Health, Weapon, Ammo, Timer, CTF Score).
function drawOriginalHud(ctx2d) {
  const match = app.match;
  if (!match || !match.player) return;
  const p = match.player;
  const armorW = app.data.ccs[2][18] || 16;
  const heartW = app.data.ccs[2][17] || 16;
  const heartH = app.data.ccs[3][17] || 16;
  const halfW = WIDTH >> 1;

  // Top-left: Armor icon + value
  drawSprite(ctx2d, 18, 0, 0);
  const armorBox = drawHudBox(ctx2d, armorW - 1, 0, '#2d4700', '#172300', 3, false);
  drawText(ctx2d, String(p.armor), armorBox.x + 4, armorBox.y + 3, 20);

  // Top-center: Countdown timer
  const timeStr = `${match.minutes}:${String(match.seconds).padStart(2, '0')}`;
  drawText(ctx2d, timeStr, halfW, 3, 21);

  // Top-right: Mode score (CTF / TDM / DM kills)
  if (match.mode === MODE.CAPTURE_FLAG || match.mode === MODE.TEAM_DEATHMATCH) {
    const redBox = drawHudBox(ctx2d, WIDTH, 0, '#ff0000', '#9e0000', 2, true);
    const blueBox = drawHudBox(ctx2d, WIDTH, 0, '#0084ff', '#000f7f', -2, true);
    drawText(ctx2d, String(match.teamScore[1]), redBox.x + 5, redBox.y + 3, 20);
    drawText(ctx2d, String(match.teamScore[0]), blueBox.x + 5, blueBox.y + 3, 20);
  } else {
    const scoreBox = drawHudBox(ctx2d, WIDTH, 0, '#884800', '#2d1800', 3, true);
    const scoreVal = match.mode === MODE.SURVIVAL ? `D${p.deaths}` : `K${p.kills}`;
    drawText(ctx2d, scoreVal, scoreBox.x + 4, scoreBox.y + 3, 20);
  }

  // Quad damage indicator (e.java:2501-2503)
  if (p.quadTimer > 0) {
    drawCu2Frame(ctx2d, 76, halfW - 8, UI_LINE_HEIGHT + 4);
  }

  // Bottom-center: Health box + Heart icon + Weapon icon + Ammo box
  const hpBox = drawHudBox(ctx2d, halfW - heartW, HEIGHT - heartH, '#2d4700', '#172300', 3, true);
  drawText(ctx2d, String(p.health), hpBox.x + 4, hpBox.y + 3, 20);
  drawSprite(ctx2d, 17, halfW - heartW, HEIGHT - heartH);
  drawSprite(ctx2d, 21 + (p.weapon ?? 0), halfW, HEIGHT - heartH);
  const ammoBox = drawHudBox(ctx2d, halfW + heartW - 1, HEIGHT - heartH, '#2d4700', '#172300', 3, false);
  const ammoText = p.weapon === 0 ? 'INF' : String(p.ammo[p.weapon] ?? 0);
  drawText(ctx2d, ammoText, ammoBox.x + 4, ammoBox.y + 3, 20);

  // Round banner in Last Hero mode (e.java:2532-2536)
  if (match.roundBannerTimer > 0) {
    const banner = `${t().roundPrefix}${match.round}`;
    ctx2d.fillStyle = '#cc0000';
    ctx2d.fillRect(0, 26, WIDTH, UI_LINE_HEIGHT + 4);
    drawText(ctx2d, banner, halfW, 28, 21);
  }
}

function createRenderState() {
  return {
    screen: app.screen === 'startup' ? 'startup' : app.screen === 'title' ? 'title' : app.screen === 'game' ? 'game' : 'menu',
    viewport: { width: WIDTH, height: HEIGHT },
    backgroundName: app.screen === 'game'
      ? (app.match?.backgroundName || 'bg0')
      : (app.K === 4 || app.K === 19 ? (app.character === 1 ? 'li2' : 'li1') : null),
    tilesetName: app.match?.tilesetName || 'l0',
    mode: app.match?.mode ?? app.mode,
    pausedMatch: app.screen === 'menu' && app.K === 1 && !!app.match,
    camera: app.match?.camera || { x: 0, y: 0 },
    level: app.match?.level || null,
    actors: app.match?.actors || [],
    tables: { ...app.data, poseForActor: (actor) => poseForActor(actor, app.data) },
    drawOriginalUi,
    drawOriginalHud,
    drawMapProps,
    drawProjectiles,
    drawEffects,
  };
}

function paint() {
  if (!ctx || !app.data) return;
  ctx.imageSmoothingEnabled = false;
  renderOriginal(ctx, createRenderState(), { images: app.images });
}

function resetMenuSelection(state) {
  app.K = state;
  app.selection = 0;
  app.configPage = 0;
  app.screen = 'menu';
}

function startMatch() {
  app.input = Object.create(null);
  app.match = createSourceMatch(app.data, {
    mode: app.mode,
    levelIndex: app.levelIndex,
    character: app.character,
    settings: app.settings,
  });
  app.K = 1; // Original c.java:569 sets K=1 so Pause opens Pause Menu
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
      startMatch();
    } else if (selected === 3) {
      app.soundEnabled = !app.soundEnabled;
      persistSettings();
    } else if (selected === 4) {
      app.detailLevel = (app.detailLevel + 1) % 3;
      persistSettings();
    } else {
      app.match = null;
      resetMenuSelection(3);
    }
  } else if (app.K === 2) {
    if (selected === 0) { app.vibroEnabled = !app.vibroEnabled; persistSettings(); }
    else if (selected === 1) { app.soundEnabled = !app.soundEnabled; persistSettings(); }
    else if (selected === 2) { toggleLanguage(); }
    else resetMenuSelection(3);
  } else if (app.K === 3) {
    if (selected === 0) resetMenuSelection(5);
    else if (selected === 1) resetMenuSelection(2);
    else if (selected === 2) resetMenuSelection(11);
    else if (selected === 3) resetMenuSelection(12);
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
    startMatch();
  }
}

export function handleSourceInput(event) {
  if (!app.data || event.type === 'source-tick' || !event.code) return;
  const code = event.code;

  // Startup / Title advance on any key press
  if (event.type === 'key-down' && (app.screen === 'startup' || app.screen === 'title')) {
    if (app.screen === 'startup') app.screen = 'title';
    else resetMenuSelection(0);
    return;
  }

  if (app.screen === 'game') {
    if (event.type === 'key-down') {
      if (code === 35 || code === -7) {
        app.K = 1;
        app.selection = 0;
        app.screen = 'menu';
        app.input = Object.create(null);
        return;
      }
      if (code >= 49 && code <= 54) {
        // Direct weapon slot 1..6 when using number row while also supporting keypad
        const key = decodeGameplayKey(code);
        if (key) app.input[key] = true;
      } else {
        const key = decodeGameplayKey(code);
        if (key) app.input[key] = true;
      }
    } else if (event.type === 'key-up') {
      const key = decodeGameplayKey(code);
      if (key && key !== 'switchWeapon') app.input[key] = false;
    }
    return;
  }

  // Menu navigation
  if (event.type === 'key-down') {
    const count = Math.max(1, menuLength(app.K));
    if (code === -7 || code === 35) {
      handleMenuBack();
      return;
    }
    if (app.K === 11 || app.K === 12) {
      if (code === 50) app.configPage = Math.max(0, app.configPage - 1);
      else if (code === 56) app.configPage += 1;
      else if (code === 53) activateCurrentSelection();
      return;
    }
    if (app.K === 19 || app.K === 4) {
      if (code === 52 || code === 54 || code === 50 || code === 56) {
        app.selection = app.selection === 0 ? 1 : 0;
        app.character = app.selection;
      } else if (code === 53) {
        activateCurrentSelection();
      }
      return;
    }
    if (app.K >= 6 && app.K <= 10) {
      if (code === 50) app.selection = (app.selection + count - 1) % count;
      else if (code === 56) app.selection = (app.selection + 1) % count;
      else if (code === 52) adjustConfigSetting(app.K, app.selection, -1);
      else if (code === 54) adjustConfigSetting(app.K, app.selection, 1);
      else if (code === 53) activateCurrentSelection();
      return;
    }
    if (code === 50) app.selection = (app.selection + count - 1) % count;
    else if (code === 56) app.selection = (app.selection + 1) % count;
    else if (code === 53) activateCurrentSelection();
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
    // Click on top-right corner pauses, otherwise fires toward click side
    if (x > WIDTH - 36 && y < 24) {
      handleMenuBack();
    } else if (app.match?.player) {
      const playerScreenX = app.match.player.x - app.match.camera.x;
      app.match.player.facing = x >= playerScreenX ? 1 : -1;
      app.input.fire = true;
      setTimeout(() => { app.input.fire = false; }, 120);
    }
    return;
  }

  // Softkey corners (bottom-left OK, bottom-right Back)
  if (y >= HEIGHT - 24) {
    if (x <= 48) { activateCurrentSelection(); return; }
    if (x >= WIDTH - 48) { handleMenuBack(); return; }
  }

  if (app.K === 19 || app.K === 4) {
    if (y < HEIGHT >> 1) {
      app.selection = x < WIDTH >> 1 ? 0 : 1;
      app.character = app.selection;
    } else {
      activateCurrentSelection();
    }
    return;
  }

  if (app.K >= 6 && app.K <= 10) {
    const layout = app.data.uiLayout;
    const row = Math.floor((y - layout.optionStartY) / layout.optionRowHeight);
    if (row >= 0 && row < 4) {
      app.selection = row;
      if (x >= WIDTH - 64 && x < WIDTH - 30) adjustConfigSetting(app.K, row, -1);
      else if (x >= WIDTH - 30) adjustConfigSetting(app.K, row, 1);
      else activateCurrentSelection();
    } else if (y > layout.optionStartY + 4 * layout.optionRowHeight) {
      activateCurrentSelection();
    }
    return;
  }

  if (app.K === 20 || app.K === 22 || app.K === 11 || app.K === 12) {
    activateCurrentSelection();
    return;
  }

  // Choice pages (K=0, 1, 2, 3, 5, 13)
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
    if (targetIdx >= 0 && targetIdx < labels.length) {
      app.selection = targetIdx;
      activateCurrentSelection();
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
    document.getElementById('btn-lang')?.addEventListener('click', () => {
      toggleLanguage();
    });

    app.loop = createEngineLoop({
      tick(event) {
        handleSourceInput(event);
        if (event.type === 'source-tick' && app.screen === 'game' && app.match) {
          tickSourceMatch(app.match, app.input, app.data);
          if (app.match.finished) {
            app.K = 22;
            app.selection = 0;
            app.screen = 'menu';
          }
        }
      },
      render: paint,
      frameBudget: TICK_TARGET_MS,
    });
    app.loop.start();
    if (typeof window !== 'undefined') {
      window.__TT_APP__ = app;
      window.setTimeout(() => { if (app.screen === 'startup') app.screen = 'title'; }, 1200);
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
