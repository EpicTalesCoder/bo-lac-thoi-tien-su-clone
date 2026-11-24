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

export function renderCutsceneScreen(ctx, { image, text, scrollPx, width, height }) {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  const imgH = image ? Math.min(image.naturalHeight || 120, 148) : 0;
  if (image && imgH > 0) {
    ctx.imageSmoothingEnabled = false;
    const drawW = Math.min(width, image.naturalWidth || width);
    const drawX = (width - drawW) >> 1;
    ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, drawX, 0, drawW, imgH);
    ctx.fillStyle = '#8b6f47';
    ctx.fillRect(0, imgH, width, 1);
  }

  const textTop = imgH + 8;
  const textBottom = height - 26;
  ctx.save();
  ctx.beginPath();
  ctx.rect(8, textTop, width - 16, Math.max(40, textBottom - textTop));
  ctx.clip();
  ctx.font = '10px Georgia, serif';
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
    ctx.fillStyle = `rgba(223, 223, 202, ${alpha.toFixed(2)})`;
    ctx.fillText(lines[i], width >> 1, y);
  }
  ctx.restore();

  ctx.fillStyle = '#18141c';
  ctx.fillRect(0, height - 24, width, 24);
  ctx.fillStyle = '#caa568';
  ctx.fillRect(0, height - 24, width, 1);
  ctx.font = 'bold 8px monospace';
  ctx.fillStyle = '#ffd84d';
  ctx.textAlign = 'left';
  ctx.fillText('NEXT · ENTER / TAP', 10, height - 9);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#9eb092';
  ctx.fillText('SKIP · ESC', width - 10, height - 9);

  return lines.length * lineH + (textBottom - textTop) + 20;
}

export function renderStoryDialogOverlay(ctx, { portraitsImg, portrait, text, width, height }) {
  const boxH = 98;
  const boxY = height - boxH - 30;
  ctx.fillStyle = 'rgba(18, 16, 26, 0.94)';
  ctx.fillRect(4, boxY, width - 8, boxH);
  ctx.strokeStyle = '#caa568';
  ctx.lineWidth = 2;
  ctx.strokeRect(4, boxY, width - 8, boxH);
  ctx.strokeStyle = '#4b3b24';
  ctx.lineWidth = 1;
  ctx.strokeRect(7, boxY + 3, width - 14, boxH - 6);

  let textX = 14;
  let textW = width - 28;
  if (portraitsImg && portrait >= 0 && portrait < 6) {
    const px = 10;
    const py = boxY + 7;
    const ps = 84;
    ctx.fillStyle = '#0e1118';
    ctx.fillRect(px, py, ps, ps);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(portraitsImg, portrait * 85, 0, 85, 85, px, py, ps, ps);
    ctx.strokeStyle = '#8b6f47';
    ctx.strokeRect(px, py, ps, ps);
    textX = 100;
    textW = width - 110;
  }

  const speaker = SPEAKER_NAMES[String(portrait)] ?? 'STORY';
  ctx.font = 'bold 9px monospace';
  ctx.fillStyle = '#ffd84d';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(speaker, textX, boxY + 8);

  ctx.font = '9px monospace';
  ctx.fillStyle = '#f1e7d2';
  const lines = wrapText(ctx, text, textW);
  for (let i = 0; i < Math.min(lines.length, 6); i++) {
    ctx.fillText(lines[i], textX, boxY + 22 + i * 11);
  }

  ctx.font = 'bold 8px monospace';
  ctx.fillStyle = '#a9d69d';
  ctx.textAlign = 'right';
  ctx.fillText('NEXT ▶  |  SKIP [ESC]', width - 12, boxY + boxH - 13);
}
