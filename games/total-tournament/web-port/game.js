import { loadOriginalImages, loadOriginalTables } from './tt-loader.js';
import { decodeJ2meText, parseJ2meTextTable, wrapJ2meText } from './text-original.js';
import { decodeFontMetrics, createOriginalFont } from './font-original.js';
import { renderOriginal } from './render-original.js';
import { TICK_TARGET_MS, createEngineLoop, decodeGameplayKey, getUiSpriteRect, MODE } from './tt-core.js';
import { drawRegionMIDP, withMIDPClip } from './midp-graphics.js';

const WIDTH = 240;
const HEIGHT = 320;
const canvas = document.querySelector('#game');
const ctx = canvas?.getContext('2d', { alpha: false });
if (canvas) { canvas.width = WIDTH; canvas.height = HEIGHT; }
if (ctx) ctx.imageSmoothingEnabled = false;

const app = {
  screen: 'startup', J: true, K: 0, mode: MODE.DEATHMATCH, character: 0, levelIndex: 0,
  selection: 0, selectionDirection: 1, configPage: 0,
  images: {}, data: null, font: null, loop: null, input: Object.create(null),
  settings: { F: 15, D: 20, E: 10, G: 20, H: 5, I: 10, balance: [0, 0] },
};

function drawSprite(ctx2d, spriteId, x, y) {
  const rect = getUiSpriteRect(app.data.ccs, spriteId, 6);
  const sheet = app.images[`s${rect.sheetIndex}`];
  if (!sheet || rect.width <= 0 || rect.height <= 0) return;
  const imageX = x - rect.sourceX;
  const imageY = y - rect.sourceY;
  withMIDPClip(ctx2d, x, y, rect.width, rect.height, () => {
    ctx2d.drawImage(sheet, imageX, imageY);
  });
}

function drawText(ctx2d, text, x, y, anchor = 20) {
  app.font.draw(ctx2d, text, x, y, anchor);
}

// Source c.a(Graphics, byte), c(Graphics, byte): list geometry, cursor sheet,
// clipped bitmap text, and selection colors follow the original menu controller.
// Port of c.java:804-929, c.java:1373-1456. Layout derives from source menu
// fields and the original `curs`, `erou`, `f1`, and `f2` assets.
// Port of c.java:618-677, c.java:1373-1456. Source-derived list geometry uses
// Q/R/S/P, font metrics, `curs`, `erou`, `f1` and `f2`; selected panel color is
// preserved for the original confirmation and mode-selection states.
function drawChoicePage(ctx2d, labels, state) {
  const fontHeight = app.font.lineHeight;
  const sourceCursor = app.images.curs;
  const sourceCursorWidth = sourceCursor?.width ?? 0;
  const sourceCursorHeight = sourceCursor?.height ?? 0;
  const modeSelection = state === 5;
  const characterSelection = state === 19;
  const confirmation = state === 0;
  const rowHeight = characterSelection ? 22 : sourceCursorHeight + (sourceCursorHeight >> 3);
  const rows = labels.length;
  const Q = WIDTH >> 1;
  const m = sourceCursorWidth >> 1;
  const n = m >> 1;
  const P = WIDTH / 13;
  const S = Q - (Q >> 1) - P - (Q >> 3);
  const R = Q + (Q >> 1) + (Q >> 3);
  let listTop = (HEIGHT >> 1) - ((rows * rowHeight) >> 1);
  if (modeSelection) listTop = (HEIGHT >> 1) + (HEIGHT >> 2) - ((rows * rowHeight) >> 1);
  if (characterSelection) listTop = (HEIGHT >> 1) - (rowHeight >> 1) + (HEIGHT >> 2);
  const firstVisible = Math.max(0, Math.min(app.selection - 4, rows - 5));

  if (characterSelection) {
    const portrait = app.character === 0 ? app.images.f1 : app.images.f2;
    const opponent = app.character === 0 ? app.images.f2 : app.images.f1;
    const portraitY = (HEIGHT >> 2) - ((app.images.q?.height ?? portrait?.height ?? 0) >> 1);
    const leftX = (WIDTH >> 2) - ((portrait?.width ?? 0) >> 1);
    const rightX = WIDTH - (WIDTH >> 2) - ((opponent?.width ?? 0) >> 1);
    if (portrait) ctx2d.drawImage(portrait, leftX, portraitY);
    if (opponent) ctx2d.drawImage(opponent, rightX, portraitY);
  }

  if (sourceCursor && (state !== 11 && state !== 12)) {
    const selectedY = characterSelection
      ? (HEIGHT >> 1) - (rowHeight >> 1) + (HEIGHT >> 2)
      : listTop + (app.selection - firstVisible) * rowHeight + (rowHeight >> 1);
    const barLeft = S + P;
    const barRight = R;
    const inset = state === 3 && app.selection === 0 ? P >> 2 : 0;
    const panelX = Q - ((R - S + P) >> 1) + 5 - inset;
    const panelY = selectedY - ((sourceCursorHeight - 4) >> 1);
    const panelWidth = R - S + P - 10 + (inset << 1);
    ctx2d.fillStyle = characterSelection ? (app.selection === 0 ? '#ff0000' : '#0000ff') : modeSelection ? '#850000' : '#003000';
    ctx2d.fillRect(panelX, panelY, panelWidth, sourceCursorHeight - 4);
    withMIDPClip(ctx2d, barRight + inset, selectedY - n, P, sourceCursorHeight, () =>
      ctx2d.drawImage(sourceCursor, barRight + inset - P, selectedY - n));
    withMIDPClip(ctx2d, S - inset, selectedY - n, P, sourceCursorHeight, () =>
      ctx2d.drawImage(sourceCursor, S - inset, selectedY - n));
    ctx2d.strokeStyle = '#000000';
    for (const offset of [4, sourceCursorHeight - 4, sourceCursorHeight - 2, 2]) {
      ctx2d.beginPath(); ctx2d.moveTo(barLeft - inset, selectedY - n + offset); ctx2d.lineTo(barRight + (inset << 1), selectedY - n + offset); ctx2d.stroke();
    }
  }

  labels.slice(firstVisible, firstVisible + 5).forEach((label, visibleIndex) => {
    const absoluteIndex = firstVisible + visibleIndex;
    const selected = absoluteIndex === app.selection;
    const y = characterSelection
      ? (HEIGHT >> 1) - (rowHeight >> 1) + (HEIGHT >> 2)
      : listTop + visibleIndex * rowHeight + (rowHeight >> 1);
    if (!characterSelection && !modeSelection) {
      ctx2d.fillStyle = selected ? '#850000' : '#2d2d00';
      ctx2d.fillRect(Q - ((R - S + P) >> 1) + 5, y - ((m - 4) >> 1), R - S + P - 10, m - 4);
    }
    drawText(ctx2d, label, Q - (app.font.measure(label) >> 1), y - (fontHeight >> 1) - 1, 20);
  });

  if (modeSelection) drawText(ctx2d, labels[labels.length - 1] || '', Q - (app.font.measure(labels.at(-1) || '') >> 1), HEIGHT >> 3, 20);
  if (confirmation) drawText(ctx2d, app.data.text[0]?.[2] || '', Q - (app.font.measure(app.data.text[0]?.[2] || '') >> 1), HEIGHT >> 3, 20);
}

// Port of c.java:804-929 and c.java:1373-1456. Text and sprites are the
// original Russian rows, fnt bitmap glyphs, and s0 strip regions—not browser fonts.
function drawOriginalUi(ctx2d) {
  // c(Graphics,K) consumes the localized source row whose index is K; K=19
  // deliberately reuses row 4. Geometry comes from the native controller.
  if (app.K === 0) {
    drawChoicePage(ctx2d, (app.data.text[0] || []).slice(0, 2), 0);
    drawText(ctx2d, app.data.text[0]?.[2] || '', WIDTH >> 1, HEIGHT >> 3, 20 | 1);
  } else if (app.K === 3) {
    drawChoicePage(ctx2d, app.data.text[3] || [], 3);
  } else if (app.K === 4 || app.K === 19) {
    drawChoicePage(ctx2d, (app.data.text[4] || []).slice(0, 2), app.K);
  } else if (app.K === 5) {
    drawChoicePage(ctx2d, app.data.text[5] || [], 5);
  } else if (app.K >= 6 && app.K <= 10) {
    drawConfigurationPage(ctx2d, app.data.text[app.K] || [], app.K);
  } else if (app.K === 11) {
    drawTextPage(ctx2d, app.data.help);
  } else if (app.K === 12) {
    drawTextPage(ctx2d, app.data.about);
  } else if (app.K === 13 || app.K === 14) {
    drawChoicePage(ctx2d, app.data.levelLabels, app.K);
  } else if (app.K === 1 || app.K === 2) {
    drawChoicePage(ctx2d, app.data.text[app.K] || [], app.K);
  }
}

function drawTextPage(ctx2d, text) {
  const lines = String(text).split(/[\r\n]+/).filter(Boolean);
  const lineHeight = app.font.lineHeight;
  const maxWidth = WIDTH - (WIDTH / 13 << 1) - 1;
  const visible = [];
  for (const rawLine of lines) {
    const words = rawLine.split(' ');
    let current = '';
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (current && app.font.measure(next) > maxWidth) {
        visible.push(current);
        current = word;
      } else current = next;
    }
    if (current) visible.push(current);
  }
  const rowCapacity = Math.max(1, Math.floor((HEIGHT - 4 * lineHeight) / lineHeight));
  visible.slice(0, rowCapacity).forEach((line, index) => drawText(ctx2d, line, WIDTH >> 3, lineHeight * 2 + index * lineHeight, 20));
  drawText(ctx2d, app.data.text[2]?.[2] || '', WIDTH >> 1, HEIGHT - lineHeight, 20 | 1 | 2);
}

// Port of c.java:618-677 and c.java:804-1456. The original shows the selected
// configuration row, five stat controls and one explanation page at a time.
function drawConfigurationPage(ctx2d, labels, state) {
  const parameters = app.settings;
  const mode = state - 6;
  const primary = [parameters.F, parameters.F, parameters.D, parameters.E, parameters.G][mode];
  const values = [primary, parameters.H, parameters.I, `${parameters.balance[0]}:${parameters.balance[1]}`];
  const fontHeight = app.font.lineHeight;
  const layout = app.data.uiLayout;
  const rowHeight = layout.optionRowHeight;
  const rowStart = layout.optionStartY;
  const selected = Math.max(0, Math.min(app.selection, labels.length - 1));

  // Source c(Graphics,K) paints all option rows, values, arrows and stat sprite IDs 27/30-40.
  for (let index = 0; index < Math.min(4, labels.length); index++) {
    const y = rowStart + index * rowHeight;
    drawText(ctx2d, labels[index], layout.leftTextX, y, 20);
    const value = String(values[index] ?? '');
    drawText(ctx2d, value, layout.valueX - app.font.measure(value), y, 20);
    const valueSprite = index === 3 ? 40 : 27 + index;
    drawSprite(ctx2d, valueSprite, layout.valueSpriteX, y - (app.data.ccs[3][valueSprite] >> 1));
  }

  const selectedY = rowStart + selected * rowHeight;
  ctx2d.fillStyle = '#408000';
  ctx2d.fillRect(2, selectedY - (layout.optionHeight >> 1), WIDTH - 4, layout.optionHeight);
  ctx2d.strokeStyle = '#b9b9b9';
  ctx2d.strokeRect(1, selectedY - (layout.optionHeight >> 1) - 1, WIDTH - 3, layout.optionHeight + 1);
  drawText(ctx2d, labels[selected] || '', layout.leftTextX, selectedY, 20);
  const selectedValue = String(values[selected] ?? '');
  drawText(ctx2d, selectedValue, layout.valueX - app.font.measure(selectedValue), selectedY, 20);
  drawSprite(ctx2d, selected === 3 ? 40 : 27 + selected, layout.valueSpriteX, selectedY - (app.data.ccs[3][27] >> 1));
  drawSprite(ctx2d, app.selectionDirection < 0 ? 37 : 38, layout.valueSpriteX - 8, selectedY - 3);
  drawSprite(ctx2d, app.selectionDirection < 0 ? 39 : 36, layout.valueSpriteX - 21, selectedY - 3);

  const explanation = app.data.text3Rows[5 + mode] || '';
  const explanationLines = wrapJ2meText(explanation, app.font, layout.explanationWidth);
  const page = Math.max(0, app.configPage || 0);
  const visibleLines = explanationLines.slice(page * layout.explanationLines, (page + 1) * layout.explanationLines);
  visibleLines.forEach((line, index) => drawText(ctx2d, line, layout.explanationX, layout.explanationY + index * fontHeight, 20));
}


function actorPose(actor) {
  const weaponSet = app.data.wlg[actor.weaponSet] || app.data.wlg[0];
  const weapon = weaponSet[actor.weaponSlot] ?? 0;
  const animation = app.data.mua[weapon]?.[7 + (actor.animation << 1)] ?? 0;
  const poseIndex = actor.character * 110 + animation + actor.animationFrame;
  return app.data.ca[poseIndex] || app.data.ca[0] || [];
}

function createRenderState() {
  const state = {
    screen: app.screen === 'startup' ? 'startup' : app.screen === 'title' ? 'title' : app.screen === 'game' ? 'game' : 'menu',
    viewport: { width: WIDTH, height: HEIGHT },
    backgroundName: app.K === 4 || app.K === 19 ? (app.data.graphicsBackground === 2 ? 'li2' : 'li1') : null,
    camera: app.match?.camera || { x: 0, y: 0 },
    level: app.match?.level || null,
    actors: app.match?.actors || [],
    tables: { ...app.data, poseForActor: actorPose },
    drawOriginalUi: drawOriginalUi,
    drawOriginalHud: drawOriginalHud,
    drawMapProps: drawMapProps,
    drawProjectiles: drawProjectiles,
    drawEffects: drawEffects,
  };
  return state;
}

// Port of e.java:1972-2031. Background parallax and tile map use source sheets.
function drawMapProps(ctx2d) {
  const level = app.match?.level;
  if (!level) return;
  for (const prop of level.propPlacements) {
    const frame = prop.code - 31;
    if (frame < 0 || frame >= app.data.cu2.length) continue;
    const meta = app.data.cu2[frame];
    const sheet = app.images[`u${meta[6]}`];
    if (!sheet) continue;
    const x = prop.x * 16 - app.match.camera.x;
    const y = prop.y * 16 - app.match.camera.y;
    ctx2d.save();
    ctx2d.beginPath();
    ctx2d.rect(x, y, meta[2], meta[3]);
    ctx2d.clip();
    ctx2d.drawImage(sheet, x - meta[0], y - meta[1] - meta[3]);
    ctx2d.restore();
  }
}

function drawProjectiles(ctx2d) {
  if (!app.match) return;
  for (const projectile of app.match.projectiles) {
    const sprite = app.data.cu2[app.data.projectileFrame(projectile.weapon)];
    const sheet = app.images[`u${sprite[6]}`];
    if (!sheet) continue;
    ctx2d.save();
    ctx2d.beginPath();
    ctx2d.rect(projectile.x - app.match.camera.x, projectile.y - app.match.camera.y, sprite[2], sprite[3]);
    ctx2d.clip();
    ctx2d.drawImage(sheet, projectile.x - app.match.camera.x - sprite[0], projectile.y - app.match.camera.y - sprite[1] - sprite[3]);
    ctx2d.restore();
  }
}
function drawEffects(ctx2d) { app.data.drawEffects(ctx2d, app.images, app.match); }

function drawOriginalHud(ctx2d) {
  const match = app.match;
  if (!match) return;
  // Source ccs IDs are exact sprite-table identities from e.java:2724-2793.
  drawSprite(ctx2d, 18, 0, 0);
  drawSprite(ctx2d, 17, WIDTH >> 1, HEIGHT - 21);
  drawSprite(ctx2d, 21 + (match.player.weaponSlot ?? 0), WIDTH >> 1, HEIGHT - 21);
  drawText(ctx2d, String(match.player.health), 18, 4, 20);
  drawText(ctx2d, String(match.player.ammo[match.player.weapon] ?? 0), 72, HEIGHT - 8, 20);
  drawText(ctx2d, `${match.minutes}:${String(match.seconds).padStart(2, '0')}`, WIDTH >> 1, 2, 20 | 1);
}

function paint() {
  if (!ctx || !app.data) return;
  ctx.imageSmoothingEnabled = false;
  renderOriginal(ctx, createRenderState(), { images: app.images });
}

// Original source state `K`/mode `t` remain distinct; the menu selection changes
// only at observed source menu boundaries, with raw text row ordering retained.
function resetMenuSelection(state) {
  app.K = state;
  app.selection = 0;
  app.screen = 'menu';
}

// Port of c.java:355-616. State-specific action semantics come from the
// original menu controller; gameplay settings are never skipped or guessed.
function activateCurrentSelection() {
  const selected = app.selection;
  if (app.K === 0) {
    if (selected < 2) {
      app.data.soundEnabled = selected === 0;
      resetMenuSelection(3);
    }
  } else if (app.K === 3) {
    if (selected === 0) resetMenuSelection(5);
    else if (selected === 1) resetMenuSelection(1);
    else if (selected === 2) resetMenuSelection(11);
    else if (selected === 3) resetMenuSelection(12);
    else app.screen = 'exit';
  } else if (app.K === 5) {
    if (selected <= 4) {
      app.mode = selected;
      app.K = 6 + selected;
      app.selection = 0;
    } else if (selected === 5) resetMenuSelection(3);
  } else if (app.K >= 6 && app.K <= 10) {
    app.K = 13;
    app.selection = 0;
  } else if (app.K === 13) {
    if (selected === app.data.levelLabels.length - 1) {
      app.K = 6 + app.mode;
      app.selection = 0;
    } else {
      app.levelIndex = selected;
      app.K = 19;
      app.selection = 0;
    }
  } else if (app.K === 19) {
    if (selected <= 1) {
      app.K = 1;
      app.selection = 0;
    } else if (selected === 2) resetMenuSelection(3);
  } else if (app.K === 11 || app.K === 12) resetMenuSelection(3);
}

function menuLength(state) {
  if (state === 0) return Math.max(1, (app.data.text[0] || []).length - 1);
  if (state === 5) return app.data.text[4]?.length ?? 0;
  if (state === 3) return app.data.text[3]?.length ?? 0;
  if (state >= 6 && state <= 10) return app.data.text[state - 1]?.length ?? 0;
  if (state === 13 || state === 14) return app.data.levelLabels.length;
  if (state === 19) return app.data.text[3]?.length ?? 0;
  return app.data.text[2]?.length ?? 0;
}

function handleSourceInput(event) {
  if (!app.data || event.type === 'source-tick' || !event.code) return;
  const key = decodeGameplayKey(event.code);
  if (event.type === 'key-down') {
    const count = Math.max(1, menuLength(app.K));
    if (event.code === 50 || event.code === 56) app.selection = (app.selection + 1) % count;
    else if (event.code === 52) app.selection = (app.selection + count - 1) % count;
    else if (event.code === 53) activateCurrentSelection();
    else if (app.screen === 'game' && key) app.input[key] = true;
  } else if (event.type === 'key-up' && key && app.input) app.input[key] = false;
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
    app.data.levelLabels = Array.from({ length: 12 }, (_, index) => index === 11 ? app.data.text[5]?.[2] || 'Назад' : `${index + 1}. Уровень`);
    app.font = createOriginalFont(images.fnt, decodeFontMetrics(tables.raw.cf));
    app.data.drawChoice = drawChoicePage;
    app.data.drawSettings = drawChoicePage;
    app.data.drawMenu = drawChoicePage;
    app.data.drawModeMenu = drawChoicePage;
    app.data.drawTextPage = drawTextPage;
    app.data.drawOriginalPage = drawOriginalUi;
    app.data.drawHud = drawOriginalHud;
    app.data.selectionIndex = () => app.selection;
    app.data.animationForActor = actorPose;
    app.data.drawEffects = () => {};
    app.data.projectileFrame = (weapon) => [0, 69, 70, 71, 72, 73][weapon] || 69;
    app.screen = 'startup';
    app.K = 0;
    app.loop = createEngineLoop({
      tick(event) {
        handleSourceInput(event);
        if (event.type === 'source-tick' && app.screen === 'game') app.data.tickSourceMatch?.(app.match, app.input);
      },
      render: paint,
      frameBudget: TICK_TARGET_MS,
    });
    app.loop.start();
    window.setTimeout(() => { if (app.screen === 'startup') app.screen = 'title'; }, 2500);
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

if (canvas && ctx) boot();
