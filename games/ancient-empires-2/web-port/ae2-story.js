// Campaign story cutscenes, portraits, stage titles, and scripted dialogs
// Ported from i.java:3116-3200, 4649-4668, 4922-6198 & lang-en.json[123..138, 215..288].

export const SPEAKER_NAMES = Object.freeze({
  '-1': 'NARRATOR',
  0: 'KING GALAMAR',
  1: 'VALADORN',
  2: 'HIGH PRIEST',
  3: 'DARK COMMANDER',
  4: 'SAETH',
  5: 'CAPTAIN',
});

export const CAMPAIGN_STAGE_CONFIG = Object.freeze({
  // Port of i.java:4684-4826, 5382-5980: per-stage starting gold, hero portraits, escorts, & victory rules
  m0: { startGold: [0, 0], galamarSurvival: true },
  m1: { startGold: [300, 50], kingHeadP1: 2 },
  m2: { startGold: [0, 0], galamarSurvival: true, turn2Elementals: [[3, 8], [4, 7], [5, 8]] },
  m3: { startGold: [400, 400] },
  m4: { startGold: [0, 0], galamarSurvival: true, crystalSurvival: true },
  m5: { startGold: [600, 600], kingHeadP1: 2 },
  m6: { startGold: [400, 600], galamarSurvival: true, crystalEscort: true },
  m7: { startGold: [800, 200], removeInitialCrystals: true, bossIsVictory: true },
});

export const CAMPAIGN_STAGE_META = Object.freeze({
  m0: {
    stage: 0,
    titleIdx: 121,
    objectiveIdx: 129,
    introCutscenes: [0, 1],
    openingDialogs: [
      { langIdx: 221, portrait: 2, focus: [9, 3] },
      { langIdx: 222, portrait: 2, focus: [9, 3] },
      { langIdx: 223, portrait: 0, focus: [1, 9] },
      { langIdx: 224, portrait: 5, focus: [0, 8] },
    ],
    turnDialogs: {
      2: [
        { langIdx: 225, portrait: 5 },
        { langIdx: 226, portrait: 0 },
      ],
    },
    victoryDialogs: [
      { langIdx: 227, portrait: 2 },
      { langIdx: 228, portrait: 0 },
      { langIdx: 229, portrait: 2 },
      { langIdx: 230, portrait: 0 },
    ],
  },
  m1: {
    stage: 1,
    titleIdx: 122,
    objectiveIdx: 130,
    introCutscenes: [],
    openingDialogs: [
      { langIdx: 231, portrait: 1 },
      { langIdx: 232, portrait: 3 },
      { langIdx: 233, portrait: 5 },
      { langIdx: 234, portrait: 2 },
      { langIdx: 235, portrait: 2 },
      { langIdx: 236, portrait: 5 },
      { langIdx: 237, portrait: 1 },
      { langIdx: 238, portrait: 5 },
    ],
    victoryDialogs: [
      { langIdx: 239, portrait: 1 },
      { langIdx: 240, portrait: 5 },
    ],
  },
  m2: {
    stage: 2,
    titleIdx: 123,
    objectiveIdx: 131,
    introCutscenes: [2],
    openingDialogs: [
      { langIdx: 241, portrait: 5 },
      { langIdx: 242, portrait: 0 },
      { langIdx: 243, portrait: 5 },
    ],
    turnDialogs: {
      2: [
        { langIdx: 244, portrait: 5 },
        { langIdx: 245, portrait: 5 },
        { langIdx: 246, portrait: -1 },
        { langIdx: 247, portrait: 0 },
      ],
    },
    victoryDialogs: [],
  },
  m3: {
    stage: 3,
    titleIdx: 124,
    objectiveIdx: 132,
    introCutscenes: [3],
    openingDialogs: [
      { langIdx: 249, portrait: 2 },
      { langIdx: 250, portrait: 0 },
      { langIdx: 251, portrait: 5 },
      { langIdx: 252, portrait: 5 },
      { langIdx: 253, portrait: 0 },
    ],
    victoryDialogs: [
      { langIdx: 254, portrait: 5 },
      { langIdx: 255, portrait: 0 },
    ],
  },
  m4: {
    stage: 4,
    titleIdx: 125,
    objectiveIdx: 133,
    introCutscenes: [],
    openingDialogs: [
      { langIdx: 256, portrait: 5 },
      { langIdx: 257, portrait: 0 },
      { langIdx: 258, portrait: 5 },
    ],
    victoryDialogs: [
      { langIdx: 259, portrait: 0 },
    ],
  },
  m5: {
    stage: 5,
    titleIdx: 126,
    objectiveIdx: 134,
    introCutscenes: [],
    openingDialogs: [
      { langIdx: 260, portrait: 1 },
      { langIdx: 261, portrait: 0 },
    ],
    victoryDialogs: [],
  },
  m6: {
    stage: 6,
    titleIdx: 127,
    objectiveIdx: 135,
    introCutscenes: [4],
    openingDialogs: [
      { langIdx: 262, portrait: 5 },
      { langIdx: 263, portrait: 0 },
      { langIdx: 264, portrait: 5 },
      { langIdx: 265, portrait: 5 },
      { langIdx: 266, portrait: 0 },
      { langIdx: 267, portrait: 3 },
      { langIdx: 268, portrait: 5 },
      { langIdx: 269, portrait: 0 },
    ],
    victoryDialogs: [
      { langIdx: 270, portrait: 1 },
    ],
  },
  m7: {
    stage: 7,
    titleIdx: 128,
    objectiveIdx: 136,
    introCutscenes: [],
    openingDialogs: [
      { langIdx: 271, portrait: 0 },
      { langIdx: 272, portrait: 4 },
      { langIdx: 273, portrait: 1 },
      { langIdx: 274, portrait: 4 },
      { langIdx: 275, portrait: 0 },
      { langIdx: 276, portrait: 4 },
      { langIdx: 277, portrait: 1 },
      { langIdx: 278, portrait: 5 },
    ],
    victoryDialogs: [
      { langIdx: 281, portrait: 4 },
      { langIdx: 282, portrait: 0 },
      { langIdx: 283, portrait: 4 },
      { langIdx: 284, portrait: 5 },
      { langIdx: 285, portrait: 2 },
      { langIdx: 286, portrait: 1 },
      { langIdx: 287, portrait: 0 },
    ],
    victoryCutscenes: [5],
  },
});

// Port of i.java:4922-5395: scripted in-map choreography (unit marches, camera pans, spell/smoke VFX, back-and-forth exchanges)
export const CAMPAIGN_STAGE_SCRIPTS = Object.freeze({
  m0: {
    opening: [
      { kind: 'pan', target: [5, 9], pauseMs: 120 },
      {
        kind: 'moveGroup',
        moves: [
          { from: [0, 8], to: [3, 8] },
          { from: [1, 9], to: [4, 9] },
          { from: [0, 10], to: [3, 10] },
        ],
        pauseMs: 250,
      },
      { kind: 'pan', target: [9, 3], pauseMs: 320 },
      { kind: 'dialog', langIdx: 221, portrait: 2, focus: [9, 3] },
      { kind: 'fx', sprite: 'redspark', target: [9, 3], pauseMs: 420, sfx: 'hit' },
      { kind: 'dialog', langIdx: 222, portrait: 2, focus: [9, 3] },
      { kind: 'fxBurst', target: [9, 3], sprites: ['spark', 'b_smoke'], removeUnitAt: [9, 3], pauseMs: 480, sfx: 'die' },
      { kind: 'pan', target: [4, 9], pauseMs: 260 },
      { kind: 'dialog', langIdx: 223, portrait: 0, focus: [4, 9] },
      { kind: 'dialog', langIdx: 224, portrait: 5, focus: [3, 8] },
    ],
    wave2: [
      { kind: 'pan', target: [1, 1], pauseMs: 200 },
      { kind: 'spawnMove', type: 1, playerSelector: 2, from: [1, 1], to: [1, 2], pauseMs: 240 },
      { kind: 'pan', target: [10, 10], pauseMs: 200 },
      { kind: 'spawnMove', type: 0, playerSelector: 2, from: [10, 10], to: [10, 9], pauseMs: 240 },
      { kind: 'focusHero', pauseMs: 200 },
      { kind: 'dialog', langIdx: 225, portrait: 5 },
      { kind: 'dialog', langIdx: 226, portrait: 0 },
    ],
  },
  m1: {
    opening: [
      { kind: 'pan', target: [12, 3], pauseMs: 280 },
      { kind: 'dialog', langIdx: 231, portrait: 1, focus: [8, 11] },
      { kind: 'dialog', langIdx: 232, portrait: 3, focus: [12, 3] },
      { kind: 'pan', target: [7, 3], pauseMs: 250 },
      { kind: 'dialog', langIdx: 233, portrait: 5, focus: [7, 3] },
      {
        kind: 'escortRetreat',
        units: [
          { type: 0, playerSelector: 2, from: [7, 3], to: [6, 0] },
          { type: 11, playerSelector: 2, from: [7, 3], to: [6, 0] },
          { type: 0, playerSelector: 2, from: [7, 3], to: [6, 2], role: 'sacrifice' },
        ],
        pauseMs: 400,
      },
      { kind: 'dialog', langIdx: 234, portrait: 2, focus: [6, 2] },
      { kind: 'fx', sprite: 'redspark', target: [6, 2], pauseMs: 400, sfx: 'hit' },
      { kind: 'dialog', langIdx: 235, portrait: 2, focus: [6, 2] },
      { kind: 'fxBurst', target: [6, 2], sprites: ['spark', 'b_smoke'], clearTempEscorts: true, pauseMs: 450, sfx: 'die' },
      { kind: 'pan', target: [8, 11], pauseMs: 250 },
      { kind: 'dialog', langIdx: 236, portrait: 5, focus: [8, 11] },
      { kind: 'dialog', langIdx: 237, portrait: 1, focus: [8, 11] },
      { kind: 'pan', target: [3, 5], pauseMs: 250 },
      { kind: 'dialog', langIdx: 238, portrait: 5, focus: [3, 5] },
      { kind: 'pan', target: [8, 11], pauseMs: 200 },
    ],
  },
  m2: {
    turn2: [
      { kind: 'pan', target: [4, 8], pauseMs: 220 },
      { kind: 'fx', sprite: 'spark', target: [3, 8], pauseMs: 120 },
      { kind: 'fx', sprite: 'spark', target: [4, 7], pauseMs: 120 },
      { kind: 'fx', sprite: 'spark', target: [5, 8], pauseMs: 220, sfx: 'raise' },
      { kind: 'dialog', langIdx: 244, portrait: 5, focus: [4, 8] },
      { kind: 'dialog', langIdx: 245, portrait: 5, focus: [4, 8] },
      { kind: 'dialog', langIdx: 246, portrait: -1, focus: [4, 8] },
      { kind: 'dialog', langIdx: 247, portrait: 0, focus: [4, 8] },
    ],
  },
});

export function wrapText(ctx, text, maxWidth) {
  const paragraphs = String(text || '').split('\n');
  const lines = [];
  for (const para of paragraphs) {
    const words = para.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push('');
      continue;
    }
    let current = words[0];
    for (let i = 1; i < words.length; i++) {
      const candidate = `${current} ${words[i]}`;
      if (ctx.measureText(candidate).width <= maxWidth) current = candidate;
      else {
        lines.push(current);
        current = words[i];
      }
    }
    lines.push(current);
  }
  return lines;
}

import { UI_COLORS, drawMenuFrame, drawSoftkeyButton, drawUiText } from './ae2-ui.js';

export function renderCutsceneScreen(ctx, { assets = null, image, text, scrollPx, width, height }) {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  const imgH = image ? Math.min(image.naturalHeight || 120, 148) : 0;
  if (image && imgH > 0) {
    ctx.imageSmoothingEnabled = false;
    const drawW = Math.min(width, image.naturalWidth || width);
    const drawX = (width - drawW) >> 1;
    ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, drawX, 0, drawW, imgH);
    ctx.fillStyle = UI_COLORS.borderHilight;
    ctx.fillRect(0, imgH, width, 1);
  }

  const textTop = imgH + 8;
  const textBottom = height - 30;
  ctx.save();
  ctx.beginPath();
  ctx.rect(8, textTop, width - 16, Math.max(40, textBottom - textTop));
  ctx.clip();
  ctx.font = '10px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const lines = wrapText(ctx, text, width - 22);
  const lineH = 14;
  const startY = textBottom - scrollPx;
  for (let i = 0; i < lines.length; i++) {
    const y = startY + i * lineH;
    if (y < textTop - lineH || y > textBottom) continue;
    let alpha = 1;
    if (y < textTop + 14) alpha = Math.max(0.15, (y - textTop) / 14);
    else if (y > textBottom - 16) alpha = Math.max(0.15, (textBottom - y) / 16);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(2)})`;
    ctx.fillText(lines[i], width >> 1, y);
  }
  ctx.restore();

  ctx.fillStyle = UI_COLORS.titleBg;
  ctx.fillRect(0, height - 24, width, 24);
  ctx.fillStyle = UI_COLORS.borderHilight;
  ctx.fillRect(0, height - 24, width, 1);
  drawSoftkeyButton(ctx, assets, { x: 6, y: height - 20, w: 72, h: 16, iconIdx: 3, label: 'NEXT' });
  drawSoftkeyButton(ctx, assets, { x: width - 78, y: height - 20, w: 72, h: 16, iconIdx: 2, label: 'SKIP', alignRight: true });

  return lines.length * lineH + (textBottom - textTop) + 20;
}

export function renderStoryDialogOverlay(ctx, opts) {
  return drawMenuFrame(ctx, opts.assets, 4, opts.height - 78, opts.width - 8, 74, 0, 14);
}
