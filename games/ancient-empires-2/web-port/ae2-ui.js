// Authentic Ancient Empires II J2ME UI renderer, bitmap fonts, 9-slice menu windows, & RingMenu engine
// Ported from d.java:162-172, 275-552, 668-726, 1078-1656, a.java:194-222, e.java:25-27, 392-395, & i.java:31-53, 3331-3692.

export const MIDP = Object.freeze({
  HCENTER: 1,
  VCENTER: 2,
  LEFT: 4,
  RIGHT: 8,
  TOP: 16,
  BOTTOM: 32,
});

export const UI_COLORS = Object.freeze({
  bg: '#242a45',          // 2370117 (d.java:1554 main window interior navy)
  titleBg: '#191b3a',     // 1645370 (d.java:1080 active ring/header band)
  borderHilight: '#555d86', // 5594502 (d.java pane border & divider)
  forecastBg: '#212742',  // 2172994 (i.java:3632 target forecast interior)
  bevelDark: '#424a63',   // 4344163 (i.java:3580 terrain box outer/inner)
  bevelLight: '#adbbc5',  // 11384493 (i.java:3582 terrain box & forecast highlight)
  textActive: '#ffffff',
  textMuted: '#a2b0d8',
  textGold: '#ffd84d',
  textGreen: '#9cff7b',
  textRed: '#ff7272',
});

// Port of i.java:44-53: per-player bottom HUD stripe gradients [neutral, P1 Blue, P2 Red, P3 Green, P4 Dark]
export const TEAM_GRADIENT_RGB = Object.freeze([
  [[160, 160, 160], [116, 116, 116], [84, 84, 84], [48, 48, 48]],
  [[150, 217, 244], [65, 149, 233], [0, 100, 198], [12, 53, 112]],
  [[244, 158, 156], [219, 36, 113], [161, 0, 112], [95, 5, 120]],
  [[171, 237, 90], [99, 190, 37], [0, 153, 55], [0, 85, 82]],
  [[0, 118, 150], [0, 65, 114], [0, 43, 75], [0, 22, 48]],
]);

export const TEAM_ACCENT_HEX = Object.freeze(['#a0a0a0', '#0065c6', '#e80052', '#009a31', '#004172']);
export const TEAM_COLOR_NAMES = Object.freeze(['NEUTRAL', 'BLUE', 'RED', 'GREEN', 'BLACK']);

const CHARS_MAP = Object.freeze({ '-': 10, '.': 11 });
const LCHARS_MAP = Object.freeze({ '/': 10, '-': 11, '+': 12 });

// Port of a.java:194-222: fixed-point sin/cos scaled by 1024
export function fixedSin1024(deg) {
  return Math.round(Math.sin((deg * Math.PI) / 180) * 1024);
}

export function fixedCos1024(deg) {
  return Math.round(Math.cos((deg * Math.PI) / 180) * 1024);
}

function anchorOffset(w, h, anchor) {
  const dx = anchor & MIDP.HCENTER ? -(w >> 1) : anchor & MIDP.RIGHT ? -w : 0;
  const dy = anchor & MIDP.VCENTER ? -(h >> 1) : anchor & MIDP.BOTTOM ? -h : 0;
  return [dx, dy];
}

// Draw a sprite frame by index, properly honoring .sprite sourceFrame indirection (i.java:356-378)
export function drawSpriteFrame(ctx, assets, spriteName, frameIndex, x, y, anchor = MIDP.LEFT | MIDP.TOP, overrideSheet = null) {
  const meta = assets?.sprites?.[spriteName];
  const sheet = overrideSheet ?? assets?.images?.[spriteName] ?? null;
  const frameImgs = assets?.frameImages?.[spriteName] ?? null;
  const fw = meta?.frameWidth ?? 0;
  const fh = meta?.frameHeight ?? 0;
  if (!fw || !fh) return false;
  const safeIdx = meta?.frames?.length
    ? ((frameIndex % meta.frames.length) + meta.frames.length) % meta.frames.length
    : Math.max(0, frameIndex);
  const frame = meta?.frames?.[safeIdx];
  const srcIdx = frame ? frame.sourceFrame : safeIdx;
  const ox = frame?.offsetX ?? 0;
  const oy = frame?.offsetY ?? 0;
  const [ax, ay] = anchorOffset(fw, fh, anchor);
  const dx = Math.round(x + ax + ox);
  const dy = Math.round(y + ay + oy);

  if (sheet) {
    const sw = sheet.naturalWidth || sheet.width || (fw * (meta?.frameCount || 1));
    const cols = Math.max(1, Math.floor(sw / fw));
    const sx = (srcIdx % cols) * fw;
    const sy = Math.floor(srcIdx / cols) * fh;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sheet, sx, sy, fw, fh, dx, dy, fw, fh);
    return true;
  }
  const single = frameImgs?.[srcIdx];
  if (single) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(single, 0, 0, fw, fh, dx, dy, fw, fh);
    return true;
  }
  return false;
}

// Port of e.java:25-27, 392-395: bitmap glyph text renderer ('chars' 6x7 and 'lchars' 8x11)
export function measureBitmapText(assets, fontKey, text) {
  const str = String(text ?? '');
  const meta = assets?.sprites?.[fontKey];
  const fw = meta?.frameWidth ?? (fontKey === 'lchars' ? 8 : 6);
  const fh = meta?.frameHeight ?? (fontKey === 'lchars' ? 11 : 7);
  const spaceW = fontKey === 'lchars' ? 4 : 3;
  let totalW = 0;
  for (let i = 0; i < str.length; i++) {
    totalW += str[i] === ' ' ? spaceW : fw;
  }
  return { width: totalW, height: fh, glyphW: fw, spaceW };
}

export function drawBitmapText(ctx, assets, fontKey, text, x, y, anchor = MIDP.LEFT | MIDP.TOP) {
  const str = String(text ?? '');
  const { width, height, glyphW, spaceW } = measureBitmapText(assets, fontKey, str);
  const [ax, ay] = anchorOffset(width, height, anchor);
  let cx = Math.round(x + ax);
  const cy = Math.round(y + ay);
  const table = fontKey === 'lchars' ? LCHARS_MAP : CHARS_MAP;
  let drew = false;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === ' ') {
      cx += spaceW;
      continue;
    }
    const code = ch.charCodeAt(0);
    const frameIdx = (code >= 48 && code <= 57) ? (code - 48) : (table[ch] ?? -1);
    if (frameIdx >= 0 && drawSpriteFrame(ctx, assets, fontKey, frameIdx, cx, cy, MIDP.LEFT | MIDP.TOP)) {
      drew = true;
    }
    cx += glyphW;
  }
  if (!drew && str.length > 0 && typeof ctx.fillText === 'function') {
    ctx.save();
    ctx.font = fontKey === 'lchars' ? 'bold 10px sans-serif' : 'bold 8px sans-serif';
    ctx.fillStyle = fontKey === 'lchars' ? UI_COLORS.textGold : UI_COLORS.textActive;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(str, Math.round(x + ax), Math.round(y + ay));
    ctx.restore();
  }
  return width;
}

// Port of i.java:3331-3339: crisp 4-way black-outlined small label text
export function drawOutlinedText(ctx, text, x, y, options = {}) {
  const {
    font = 'bold 10px Arial, sans-serif',
    color = '#ffffff',
    outline = '#000000',
    align = 'center',
    baseline = 'middle',
    maxWidth,
  } = options;
  ctx.save();
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillStyle = outline;
  const offsets = [[-1, -1], [-1, 1], [1, 1], [1, -1]];
  for (const [ox, oy] of offsets) {
    if (maxWidth != null) ctx.fillText(text, x + ox, y + oy, maxWidth);
    else ctx.fillText(text, x + ox, y + oy);
  }
  ctx.fillStyle = color;
  if (maxWidth != null) ctx.fillText(text, x, y, maxWidth);
  else ctx.fillText(text, x, y);
  ctx.restore();
}

export function drawUiText(ctx, text, x, y, options = {}) {
  const {
    font = 'bold 10px Arial, sans-serif',
    color = UI_COLORS.textActive,
    align = 'left',
    baseline = 'middle',
    shadow = true,
    maxWidth,
  } = options;
  ctx.save();
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  if (shadow) {
    ctx.fillStyle = '#0d1022';
    if (maxWidth != null) ctx.fillText(text, x + 1, y + 1, maxWidth);
    else ctx.fillText(text, x + 1, y + 1);
  }
  ctx.fillStyle = color;
  if (maxWidth != null) ctx.fillText(text, x, y, maxWidth);
  else ctx.fillText(text, x, y);
  ctx.restore();
}

// Port of d.java:1554-1656: AE2 9-slice menu.png window frame & interior fill
export function drawMenuFrame(ctx, assets, x, y, w, h, flags = 0, headerHeight = 0) {
  const noTop = (flags & 1) !== 0;
  const noBot = (flags & 2) !== 0;
  const noLeft = (flags & 4) !== 0;
  const noRight = (flags & 8) !== 0;

  const padL = noLeft ? 1 : 8;
  const padR = noRight ? 1 : 8;
  const padT = noTop ? 1 : 5;
  const padB = noBot ? 1 : 5;
  const ix = x + padL;
  const iy = y + padT;
  const iw = Math.max(0, w - padL - padR);
  const ih = Math.max(0, h - padT - padB);

  ctx.fillStyle = UI_COLORS.bg;
  ctx.fillRect(ix, iy, iw, ih);

  if (headerHeight > 0) {
    const hh = Math.min(ih, headerHeight);
    ctx.fillStyle = UI_COLORS.titleBg;
    ctx.fillRect(ix, iy, iw, hh);
    if (hh < ih) {
      ctx.fillStyle = UI_COLORS.borderHilight;
      ctx.fillRect(ix, iy + hh, iw, 1);
    }
  }

  const menuImg = assets?.images?.menu;
  const menuMeta = assets?.sprites?.menu;
  const tileSize = menuMeta?.frameWidth ?? 16;

  if (menuImg && menuMeta) {
    ctx.save();
    // Horizontal top & bottom tiled borders
    const hStart = noLeft ? x : x + tileSize;
    const hEnd = noRight ? x + w : x + w - tileSize;
    if (hEnd > hStart && (!noTop || !noBot)) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(hStart, y, hEnd - hStart, h);
      ctx.clip();
      for (let tx = hStart; tx < hEnd; tx += tileSize) {
        if (!noTop) drawSpriteFrame(ctx, assets, 'menu', 1, tx, y, MIDP.LEFT | MIDP.TOP);
        if (!noBot) drawSpriteFrame(ctx, assets, 'menu', 6, tx, y + h - tileSize, MIDP.LEFT | MIDP.TOP);
      }
      ctx.restore();
    }

    // Vertical left & right tiled borders
    const vStart = noTop ? y : y + tileSize;
    const vEnd = noBot ? y + h : y + h - tileSize;
    if (vEnd > vStart && (!noLeft || !noRight)) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, vStart, w, vEnd - vStart);
      ctx.clip();
      for (let ty = vStart; ty < vEnd; ty += tileSize) {
        if (!noLeft) drawSpriteFrame(ctx, assets, 'menu', 3, x, ty, MIDP.LEFT | MIDP.TOP);
        if (!noRight) drawSpriteFrame(ctx, assets, 'menu', 4, x + w - tileSize, ty, MIDP.LEFT | MIDP.TOP);
      }
      ctx.restore();
    }

    // Corner pieces
    if (!noTop && !noLeft) drawSpriteFrame(ctx, assets, 'menu', 0, x, y, MIDP.LEFT | MIDP.TOP);
    if (!noTop && !noRight) drawSpriteFrame(ctx, assets, 'menu', 2, x + w - tileSize, y, MIDP.LEFT | MIDP.TOP);
    if (!noBot && !noLeft) drawSpriteFrame(ctx, assets, 'menu', 5, x, y + h - tileSize, MIDP.LEFT | MIDP.TOP);
    if (!noBot && !noRight) drawSpriteFrame(ctx, assets, 'menu', 7, x + w - tileSize, y + h - tileSize, MIDP.LEFT | MIDP.TOP);
    ctx.restore();
  } else {
    ctx.fillStyle = UI_COLORS.borderHilight;
    ctx.fillRect(x, y, w, 2);
    ctx.fillRect(x, y + h - 2, w, 2);
    ctx.fillRect(x, y, 2, h);
    ctx.fillRect(x + w - 2, y, 2, h);
  }

  return { ix, iy, iw, ih };
}

// Port of d.java:500-552, 668-726, 1078-1135: AE2 circular rotating Ring Menu (continuous 60/120fps easing + optional 4-slot action ring)
export class RingMenu {
  constructor(opts = {}) {
    this.items = opts.items ?? [];
    this.minSlots = opts.minSlots ?? 0;
    this.slotCount = Math.max(this.minSlots, this.items.length, 1);
    this.centerX = opts.centerX ?? 120;
    this.centerY = opts.centerY ?? 200;
    this.radius = opts.radius ?? 58;
    this.circleSprite = opts.circleSprite ?? 'big_circle';
    this.iconSprite = opts.iconSprite ?? 'menu_icons';
    this.maxW = opts.maxW ?? 240;
    this.maxH = opts.maxH ?? 320;
    this.titleY = opts.titleY ?? null;
    this.titleX = opts.titleX ?? null;
    this.titleW = opts.titleW ?? 240;
    this.showTitleArrows = opts.showTitleArrows ?? false;
    this.selectedIndex = Math.max(0, Math.min(Math.max(0, this.items.length - 1), opts.selectedIndex ?? 0));
    this.rotOffset = 0;
    this.openRadius = opts.immediate ? this.radius : Math.max(4, Math.round(this.radius * 0.12));
    this.sparkTick = 0;
    this.sparkTimerMs = 0;
    this.sparks = [
      { dx: -10, dy: -9, phase: 0 },
      { dx: 11, dy: -4, phase: 2 },
      { dx: -4, dy: 10, phase: 4 },
    ];
  }

  snap() {
    this.openRadius = this.radius;
    this.rotOffset = 0;
  }

  move(delta) {
    const n = this.items.length;
    if (n <= 1) return;
    const step = 360 / this.slotCount;
    const oldIdx = this.selectedIndex;
    const newIdx = (oldIdx + delta + n * 4) % n;
    this.selectedIndex = newIdx;
    if (this.slotCount === n) {
      this.rotOffset += delta * step;
    } else {
      // Action ring (`d.java:509-514` 4-slot layout): smoothly rotate across actual angular delta
      let diff = ((newIdx * step - oldIdx * step + 540) % 360) - 180;
      if (diff === -180) diff = delta > 0 ? 180 : -180;
      this.rotOffset += diff;
    }
  }

  selectIndex(targetIdx) {
    const n = this.items.length;
    if (n === 0 || targetIdx < 0 || targetIdx >= n) return;
    const step = 360 / this.slotCount;
    if (this.slotCount === n) {
      let delta = targetIdx - this.selectedIndex;
      if (delta > n / 2) delta -= n;
      if (delta < -n / 2) delta += n;
      this.selectedIndex = targetIdx;
      this.rotOffset += delta * step;
    } else {
      const oldDeg = this.selectedIndex * step;
      const newDeg = targetIdx * step;
      const diff = ((newDeg - oldDeg + 540) % 360) - 180;
      this.selectedIndex = targetIdx;
      this.rotOffset += diff;
    }
  }

  tick(dtMs = 50) {
    const dt = Math.max(1, Math.min(100, dtMs));
    if (this.openRadius < this.radius) {
      this.openRadius = Math.min(this.radius, this.openRadius + (this.radius * dt) / 145);
    }
    if (Math.abs(this.rotOffset) > 0.35) {
      // Smooth exponential damping matching J2ME `-T/2` per ~42ms across any frame rate (60Hz/120Hz+)
      this.rotOffset *= Math.pow(0.5, dt / 42);
      if (Math.abs(this.rotOffset) <= 0.35) this.rotOffset = 0;
    } else {
      this.rotOffset = 0;
    }
    this.sparkTimerMs += dt;
    while (this.sparkTimerMs >= 75) {
      this.sparkTimerMs -= 75;
      this.sparkTick++;
      const s = this.sparks[this.sparkTick % this.sparks.length];
      if (s) s.phase = (s.phase + 1) % 5;
    }
  }

  getNodePositions() {
    const n = this.items.length;
    if (n === 0) return [];
    const step = 360 / this.slotCount;
    const baseRot = -this.selectedIndex * step + this.rotOffset;
    const m = this.openRadius;
    return this.items.map((item, index) => {
      const deg = ((index * step + baseRot) % 360 + 360) % 360;
      const cx = Math.round(this.centerX + ((fixedSin1024(deg) * m) >> 10));
      const cy = Math.round(this.centerY - ((fixedCos1024(deg) * m) >> 10));
      return { index, item, x: cx, y: cy, deg, selected: index === this.selectedIndex };
    });
  }

  getTitleBox() {
    const h = 19;
    const w = Math.min(this.maxW, this.titleW);
    const x = this.titleX != null ? Math.max(0, Math.min(this.maxW - w, this.titleX)) : ((this.maxW - w) >> 1);
    const rawY = this.titleY != null ? this.titleY : (this.centerY - this.radius - 38);
    const y = Math.max(2, Math.min(this.maxH - h - 2, rawY));
    return { x, y, w, h };
  }

  hitTest(px, py) {
    const nodes = this.getNodePositions();
    for (const node of nodes) {
      if (Math.hypot(px - node.x, py - node.y) <= 19) {
        return { type: node.selected ? 'confirm' : 'select', index: node.index };
      }
    }
    const tb = this.getTitleBox();
    if (py >= tb.y - 2 && py <= tb.y + tb.h + 2 && px >= tb.x && px <= tb.x + tb.w) {
      if (this.showTitleArrows && this.items.length > 1) {
        if (px <= tb.x + 26) return { type: 'prev' };
        if (px >= tb.x + tb.w - 26) return { type: 'next' };
      }
      return { type: 'confirm', index: this.selectedIndex };
    }
    return null;
  }

  render(ctx, assets) {
    const nodes = this.getNodePositions();
    // Draw unselected circles first, selected circle on top
    const ordered = [...nodes.filter(n => !n.selected), ...nodes.filter(n => n.selected)];
    const settled = Math.abs(this.rotOffset) < 2.5 && this.openRadius >= this.radius - 1;
    for (const node of ordered) {
      drawSpriteFrame(ctx, assets, this.circleSprite, node.selected ? 1 : 0, node.x, node.y, MIDP.HCENTER | MIDP.VCENTER);
      if (node.item?.icon != null) {
        drawSpriteFrame(ctx, assets, this.iconSprite, node.item.icon, node.x, node.y, MIDP.HCENTER | MIDP.VCENTER);
      }
      if (node.selected && settled) {
        for (let s = 0; s < this.sparks.length; s++) {
          const sp = this.sparks[s];
          const frame = (sp.phase + (this.sparkTick >> 1) + s) % 5;
          drawSpriteFrame(ctx, assets, 'small_spark', frame, node.x + sp.dx, node.y + sp.dy, MIDP.HCENTER | MIDP.VCENTER);
        }
      }
    }

    const activeItem = this.items[this.selectedIndex];
    if (activeItem) {
      const tb = this.getTitleBox();
      ctx.fillStyle = UI_COLORS.titleBg;
      ctx.fillRect(tb.x, tb.y, tb.w, tb.h);
      ctx.fillStyle = UI_COLORS.borderHilight;
      ctx.fillRect(tb.x, tb.y, tb.w, 1);
      ctx.fillRect(tb.x, tb.y + tb.h - 1, tb.w, 1);
      if (tb.w < this.maxW) {
        ctx.fillRect(tb.x, tb.y, 1, tb.h);
        ctx.fillRect(tb.x + tb.w - 1, tb.y, 1, tb.h);
      }
      if (this.showTitleArrows && this.items.length > 1) {
        drawSpriteFrame(ctx, assets, 'side_arrow', 0, tb.x + 8, tb.y + (tb.h >> 1), MIDP.HCENTER | MIDP.VCENTER);
        drawSpriteFrame(ctx, assets, 'side_arrow', 1, tb.x + tb.w - 8, tb.y + (tb.h >> 1), MIDP.HCENTER | MIDP.VCENTER);
      }
      drawUiText(ctx, activeItem.label || '', tb.x + (tb.w >> 1), tb.y + (tb.h >> 1) + 1, {
        font: 'bold 10px Arial, sans-serif',
        color: UI_COLORS.textActive,
        align: 'center',
        maxWidth: tb.w - 12,
      });
    }
  }
}

// Draw corner softkey pill using buttons.png (`0=Check/Select`, `1=Back/End`, `2=Skip`, `3=Next`)
export function drawSoftkeyButton(ctx, assets, { x, y, w = 64, h = 16, iconIdx = 0, label = '', alignRight = false }) {
  ctx.fillStyle = 'rgba(25, 27, 58, 0.9)';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = UI_COLORS.borderHilight;
  ctx.fillRect(x, y, w, 1);
  ctx.fillRect(x, y + h - 1, w, 1);
  ctx.fillRect(x, y, 1, h);
  ctx.fillRect(x + w - 1, y, 1, h);
  if (alignRight) {
    drawSpriteFrame(ctx, assets, 'buttons', iconIdx, x + w - 16, y + 2, MIDP.LEFT | MIDP.TOP);
    if (label) {
      drawUiText(ctx, label, x + w - 19, y + (h >> 1) + 1, {
        font: 'bold 8px Arial, sans-serif',
        color: UI_COLORS.textActive,
        align: 'right',
        shadow: false,
      });
    }
  } else {
    drawSpriteFrame(ctx, assets, 'buttons', iconIdx, x + 2, y + 2, MIDP.LEFT | MIDP.TOP);
    if (label) {
      drawUiText(ctx, label, x + 19, y + (h >> 1) + 1, {
        font: 'bold 8px Arial, sans-serif',
        color: UI_COLORS.textActive,
        align: 'left',
        shadow: false,
      });
    }
  }
}

// Port of i.java:3496-3586: original 32px bottom HUD bar with team stripe, lchars counters, and beveled 24x24 DEF terrain box
export function drawMapHudBar(ctx, assets, {
  width = 240,
  height = 320,
  hudHeight = 32,
  playerPalette = 1,
  gold = 0,
  unitCount = 0,
  maxUnits = null,
  tileDef = 0,
  hoverUnit = null,
  unitName = '',
  drawCursorTile,
  isTargetSelect = false,
}) {
  const hudY = height - hudHeight;
  const tileBoxSize = hudHeight; // 32
  const innerPad = (hudHeight - 24) >> 1; // 4
  const mainW = width - tileBoxSize; // 208
  const rgbRows = TEAM_GRADIENT_RGB[playerPalette] ?? TEAM_GRADIENT_RGB[0];

  // Top 4px stepped team-color stripe (`i.java:44-50, 3508`)
  for (let row = 0; row < 4; row++) {
    const [r, g, b] = rgbRows[row] || [84, 84, 84];
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, hudY + row, mainW, 1);
  }
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, hudY + 4, mainW, 1);
  ctx.fillStyle = UI_COLORS.bg;
  ctx.fillRect(0, hudY + 5, mainW, hudHeight - 5);

  // Gold & Unit count in authentic yellow bitmap font `lchars` (`i.java:3510-3527`)
  const rowCy = hudY + 18;
  drawSpriteFrame(ctx, assets, 'hud_icons_2', 1, 7, rowCy, MIDP.LEFT | MIDP.VCENTER);
  drawBitmapText(ctx, assets, 'lchars', String(gold), 20, rowCy, MIDP.LEFT | MIDP.VCENTER);

  const unitStr = maxUnits != null ? `${unitCount}/${maxUnits}` : String(unitCount);
  drawSpriteFrame(ctx, assets, 'hud_icons_2', 0, 74, rowCy, MIDP.LEFT | MIDP.VCENTER);
  drawBitmapText(ctx, assets, 'lchars', unitStr, 88, rowCy, MIDP.LEFT | MIDP.VCENTER);

  // Hover unit concise status badge or player indicator inside right half of bar
  if (hoverUnit) {
    drawUiText(ctx, unitName.slice(0, 9), 130, hudY + 13, {
      font: 'bold 8px Arial, sans-serif',
      color: UI_COLORS.textActive,
      align: 'left',
      maxWidth: 74,
    });
    drawBitmapText(ctx, assets, 'chars', `${hoverUnit.hp}`, 130, hudY + 21, MIDP.LEFT | MIDP.TOP);
  } else {
    const palColor = TEAM_ACCENT_HEX[playerPalette] ?? '#ffffff';
    ctx.fillStyle = '#000000';
    ctx.fillRect(131, hudY + 12, 8, 12);
    ctx.fillStyle = palColor;
    ctx.fillRect(132, hudY + 13, 6, 10);
    drawUiText(ctx, TEAM_COLOR_NAMES[playerPalette] ?? `P${playerPalette}`, 142, hudY + 19, {
      font: 'bold 8px Arial, sans-serif',
      color: UI_COLORS.textMuted,
      align: 'left',
    });
  }

  // Rightmost 32x32 beveled terrain box (`i.java:3534-3586`)
  ctx.fillStyle = UI_COLORS.bevelDark;
  ctx.fillRect(mainW, hudY, tileBoxSize, tileBoxSize);
  ctx.fillStyle = UI_COLORS.bevelLight;
  ctx.fillRect(mainW + 1, hudY + 1, tileBoxSize - 2, tileBoxSize - 2);
  ctx.fillStyle = UI_COLORS.bevelDark;
  ctx.fillRect(mainW + 3, hudY + 3, tileBoxSize - 6, tileBoxSize - 6);

  const tileX = mainW + innerPad;
  const tileY = hudY + innerPad;
  drawCursorTile?.(ctx, tileX, tileY);
  drawBitmapText(ctx, assets, 'chars', `.${tileDef}`, tileX + 24, tileY + 24, MIDP.RIGHT | MIDP.BOTTOM);

  // Softkey pills just above the 32px bar on map bottom edges (`i.java:3559-3571`)
  drawSoftkeyButton(ctx, assets, {
    x: 2,
    y: hudY - 17,
    w: 52,
    h: 15,
    iconIdx: isTargetSelect ? 1 : 0,
    label: isTargetSelect ? 'BACK' : 'MENU',
  });
  drawSoftkeyButton(ctx, assets, {
    x: width - 66,
    y: hudY - 17,
    w: 64,
    h: 15,
    iconIdx: isTargetSelect ? 0 : 2,
    label: isTargetSelect ? 'OK' : 'END TURN',
    alignRight: true,
  });
}

// Port of i.java:3588-3679: original 2-row attacker/defender forecast strip
export function drawTargetForecastBar(ctx, assets, {
  width = 240,
  barY = 0,
  kind = 'attack',
  attackerName,
  targetName,
  attackerPalette = 1,
  targetPalette = 2,
  atkRangeText = '',
  defCounterText = '0-0',
  atkMod = 0,
  defCounterMod = 0,
  attackerDef = 0,
  targetDef = 0,
  atkDefMod = 0,
  defDefMod = 0,
  attackerHp = 100,
  targetHp = 100,
}) {
  if (kind === 'destroyTown' || kind === 'raise') {
    ctx.fillStyle = UI_COLORS.bevelLight;
    ctx.fillRect(0, barY, width, 24);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, barY + 24, width, 2);
    ctx.fillStyle = UI_COLORS.forecastBg;
    ctx.fillRect(2, barY + 2, width - 4, 20);
    const label = kind === 'destroyTown'
      ? `BOMBARD TOWN (${targetName}) · OK TO FIRE`
      : 'SELECT TOMBSTONE TO RAISE SKELETON';
    drawUiText(ctx, label, width >> 1, barY + 13, {
      font: 'bold 9px Arial, sans-serif',
      color: UI_COLORS.textGold,
      align: 'center',
    });
    return;
  }

  const totalH = 26;
  ctx.fillStyle = UI_COLORS.bevelLight;
  ctx.fillRect(0, barY, width, totalH - 2);
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, barY + totalH - 2, width, 2);

  const rowH = 11;
  const colWidths = [84, 62, 0];
  let cx = 0;

  const cols = [
    { icon: 0, vals: [atkRangeText, defCounterText], mods: [atkMod, defCounterMod] },
    { icon: 1, vals: [String(attackerDef), String(targetDef)], mods: [atkDefMod, defDefMod] },
    { icon: 2, vals: [String(attackerHp), String(targetHp)], mods: [0, 0] },
  ];
  const pals = [attackerPalette, targetPalette];

  for (let c = 0; c < 3; c++) {
    drawSpriteFrame(ctx, assets, 'hud_icons', cols[c].icon, cx + 1, barY + 12, MIDP.LEFT | MIDP.VCENTER);
    cx += 15;
    const cellW = c < 2 ? colWidths[c] : (width - cx);
    let ry = barY + 1;
    for (let r = 0; r < 2; r++) {
      ctx.fillStyle = UI_COLORS.forecastBg;
      ctx.fillRect(cx, ry, cellW - 2, rowH - 1);
      ctx.fillStyle = TEAM_ACCENT_HEX[pals[r]] ?? '#888888';
      ctx.fillRect(cx + 1, ry + 1, 3, rowH - 3);
      const tx = cx + 6;
      const valStr = cols[c].vals[r];
      const drawnW = drawBitmapText(ctx, assets, 'chars', valStr, tx, ry + 1, MIDP.LEFT | MIDP.TOP);
      const mod = cols[c].mods[r];
      if (mod > 0) drawSpriteFrame(ctx, assets, 'arrow_icons', 1, tx + drawnW + 2, ry + 5, MIDP.LEFT | MIDP.VCENTER);
      else if (mod < 0) drawSpriteFrame(ctx, assets, 'arrow_icons', 2, tx + drawnW + 2, ry + 5, MIDP.LEFT | MIDP.VCENTER);
      ry += rowH;
    }
    cx += cellW;
  }

  // Brief unit name strip directly beneath forecast so matchup is unmistakable
  ctx.fillStyle = 'rgba(25, 27, 58, 0.88)';
  const tagY = barY > 0 ? barY - 14 : barY + totalH;
  ctx.fillRect(0, tagY, width, 14);
  drawUiText(ctx, `${attackerName} vs ${targetName}`, width >> 1, tagY + 8, {
    font: 'bold 8px Arial, sans-serif',
    color: UI_COLORS.textActive,
    align: 'center',
    maxWidth: width - 12,
  });
}

// Port of d.java:162-172, 1143-1297: 3-pane Castle Buy screen with small_circle stats, unit lore, & big_circle carousel
export function drawRecruitDialog(ctx, assets, {
  width = 240,
  height = 320,
  list = [],
  cursor = 0,
  gold = 0,
  playerPalette = 1,
  unitRecords = [],
  statsFn,
  unitNameFn,
  costFn,
  animTick = 0,
}) {
  const safeCursor = Math.max(0, Math.min(Math.max(0, list.length - 1), cursor));
  const uType = list[safeCursor] ?? 0;
  const rec = unitRecords?.[uType] ?? {};
  const computed = statsFn ? statsFn(uType) : null;
  const atkMin = computed?.atkMin ?? rec.atkMin ?? rec.fields?.[1] ?? 0;
  const atkMax = computed?.atkMax ?? rec.atkMax ?? rec.fields?.[2] ?? 0;
  const defense = computed?.defense ?? rec.defense ?? rec.fields?.[3] ?? 0;
  const moveRange = computed?.movementRange ?? rec.movementRange ?? rec.moveRange ?? rec.fields?.[0] ?? 0;
  const cost = costFn ? costFn(uType) : (rec.shortValue ?? 0);
  const canAfford = gold >= cost;
  const uName = unitNameFn ? unitNameFn(uType) : `UNIT ${uType}`;
  const loreIdx = uType === 10 ? 194 : uType === 11 ? 195 : 184 + uType;
  const lore = assets?.langStrings?.[loreIdx] || '';

  // Dim backdrop
  ctx.fillStyle = 'rgba(12, 14, 28, 0.65)';
  ctx.fillRect(0, 0, width, height);

  // Top stats card (`x=6, y=10, w=228, h=96`)
  const card = drawMenuFrame(ctx, assets, 6, 10, width - 12, 96, 0, 20);
  drawUiText(ctx, uName, card.ix + 4, card.iy + 10, { font: 'bold 10px Arial, sans-serif', color: UI_COLORS.textActive });
  drawSpriteFrame(ctx, assets, 'hud_icons_2', 1, card.ix + card.iw - 58, card.iy + 10, MIDP.LEFT | MIDP.VCENTER);
  drawBitmapText(ctx, assets, 'lchars', String(gold), card.ix + card.iw - 44, card.iy + 10, MIDP.LEFT | MIDP.VCENTER);

  // Stat small_circles: ATK, DEF, MOVE, COST
  const statY = card.iy + 36;
  const atkStr = `${atkMin}-${atkMax}`;
  const defStr = `${defense}`;
  const movStr = `${moveRange}`;
  const stats = [
    { icon: 0, label: 'ATK', val: atkStr, x: card.ix + 16, y: statY },
    { icon: 1, label: 'DEF', val: defStr, x: card.ix + 100, y: statY },
    { icon: 2, label: 'MOV', val: movStr, x: card.ix + 16, y: statY + 26 },
  ];
  for (const st of stats) {
    drawSpriteFrame(ctx, assets, 'small_circle', 0, st.x, st.y, MIDP.HCENTER | MIDP.VCENTER);
    drawSpriteFrame(ctx, assets, 'hud_icons', st.icon, st.x, st.y, MIDP.HCENTER | MIDP.VCENTER);
    drawBitmapText(ctx, assets, 'chars', st.val, st.x + 14, st.y, MIDP.LEFT | MIDP.VCENTER);
  }
  // Cost badge bottom-right of stats card
  drawSpriteFrame(ctx, assets, 'hud_icons_2', 1, card.ix + 94, statY + 26, MIDP.HCENTER | MIDP.VCENTER);
  drawBitmapText(ctx, assets, canAfford ? 'lchars' : 'chars', String(cost), card.ix + 104, statY + 26, MIDP.LEFT | MIDP.VCENTER);
  if (!canAfford) {
    drawUiText(ctx, 'NO GOLD', card.ix + 148, statY + 27, { font: 'bold 8px Arial, sans-serif', color: UI_COLORS.textRed });
  }

  // Animated unit preview portrait on right side of top card
  const unitPal = canAfford ? playerPalette : 0;
  const unitSheet = assets?.unitIconPalettes?.[unitPal] ?? assets?.images?.unit_icons;
  if (unitSheet) {
    const px = card.ix + card.iw - 34;
    const py = statY + 8;
    drawSpriteFrame(ctx, assets, 'big_circle', canAfford ? 1 : 0, px, py, MIDP.HCENTER | MIDP.VCENTER);
    const frameOff = ((Math.floor(animTick / 6) & 1) * 12 + uType) * 24;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(unitSheet, frameOff % (12 * 24), Math.floor(frameOff / (12 * 24)) * 24, 24, 24, px - 12, py - 12, 24, 24);
  }

  // Middle lore box (`y=112, h=110`)
  const mid = drawMenuFrame(ctx, assets, 6, 112, width - 12, 110, 0, 0);
  drawWrappedLines(ctx, lore, mid.ix + 6, mid.iy + 6, mid.iw - 12, 13, 6, {
    font: '9px Arial, sans-serif',
    color: UI_COLORS.textActive,
  });

  // Bottom horizontal unit carousel (`y=228, h=60`)
  const strip = drawMenuFrame(ctx, assets, 6, 228, width - 12, 60, 0, 0);
  drawSpriteFrame(ctx, assets, 'side_arrow', 0, strip.ix + 8, strip.iy + (strip.ih >> 1), MIDP.HCENTER | MIDP.VCENTER);
  drawSpriteFrame(ctx, assets, 'side_arrow', 1, strip.ix + strip.iw - 8, strip.iy + (strip.ih >> 1), MIDP.HCENTER | MIDP.VCENTER);

  const visibleSlots = Math.min(5, list.length);
  const half = Math.floor(visibleSlots / 2);
  const slotSpacing = 38;
  const baseCy = strip.iy + (strip.ih >> 1);
  const baseCx = strip.ix + (strip.iw >> 1);

  for (let offset = -half; offset <= half; offset++) {
    const itemIdx = (safeCursor + offset + list.length) % list.length;
    const typeId = list[itemIdx];
    const itemCost = costFn ? costFn(typeId) : 0;
    const itemAfford = gold >= itemCost;
    const sx = baseCx + offset * slotSpacing;
    const isSel = offset === 0;
    drawSpriteFrame(ctx, assets, 'big_circle', isSel ? 1 : 0, sx, baseCy, MIDP.HCENTER | MIDP.VCENTER);
    const palSheet = assets?.unitIconPalettes?.[itemAfford ? playerPalette : 0] ?? assets?.images?.unit_icons;
    if (palSheet) {
      const fCol = (isSel && ((Math.floor(animTick / 6) & 1) === 1)) ? 12 + typeId : typeId;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(palSheet, (fCol % 12) * 24, Math.floor(fCol / 12) * 24, 24, 24, sx - 12, baseCy - 12, 24, 24);
    }
    if (isSel) {
      drawSpriteFrame(ctx, assets, 'small_spark', Math.floor(animTick / 3) % 5, sx - 10, baseCy - 10, MIDP.HCENTER | MIDP.VCENTER);
      drawSpriteFrame(ctx, assets, 'small_spark', (Math.floor(animTick / 3) + 2) % 5, sx + 11, baseCy + 9, MIDP.HCENTER | MIDP.VCENTER);
    }
  }

  // Softkeys: Left Buy / Right Back
  drawSoftkeyButton(ctx, assets, { x: 8, y: height - 24, w: 66, h: 16, iconIdx: 0, label: uType === 9 ? 'REVIVE' : 'BUY' });
  drawSoftkeyButton(ctx, assets, { x: width - 74, y: height - 24, w: 66, h: 16, iconIdx: 1, label: 'BACK', alignRight: true });

  return { width, slotSpacing, baseCx, baseCy, visibleSlots };
}

export function drawWrappedLines(ctx, text, x, y, maxWidth, lineHeight, maxLines, options = {}) {
  const { font = '9px Arial, sans-serif', color = UI_COLORS.textActive, align = 'left' } = options;
  ctx.save();
  ctx.font = font;
  const paragraphs = String(text ?? '').split('\n');
  const lines = [];
  for (const para of paragraphs) {
    const words = para.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push('');
      continue;
    }
    let cur = words[0];
    for (let i = 1; i < words.length; i++) {
      const next = `${cur} ${words[i]}`;
      if (ctx.measureText(next).width <= maxWidth) cur = next;
      else {
        lines.push(cur);
        cur = words[i];
      }
    }
    lines.push(cur);
  }
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  const count = maxLines != null ? Math.min(lines.length, maxLines) : lines.length;
  for (let i = 0; i < count; i++) {
    ctx.fillText(lines[i], x, y + i * lineHeight);
  }
  ctx.restore();
  return lines;
}

// Port of d.java:1301-1409: AE2 story dialog with menu.png border & protruding bottom-left 85x85 character portrait
export function drawStoryDialogBox(ctx, assets, { portrait = -1, speaker = 'STORY', text = '', width = 240, height = 320, animTick = 0 }) {
  const boxH = 74;
  const boxY = height - boxH - 4;
  const box = drawMenuFrame(ctx, assets, 4, boxY, width - 8, boxH, 0, 14);

  const hasPortrait = portrait >= 0 && portrait < 6 && assets?.images?.portraits;
  let textLeft = box.ix + 8;
  let textWidth = box.iw - 16;

  if (hasPortrait) {
    // Portrait sits at bottom-left flush with screen edge, overlapping top border (`d.java:1302-1350`)
    const px = 8;
    const py = height - 85;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(assets.images.portraits, portrait * 85, 0, 85, 85, px, py, 85, 85);
    textLeft = 96;
    textWidth = width - 110;
  }

  drawUiText(ctx, speaker, textLeft, box.iy + 7, {
    font: 'bold 8px Arial, sans-serif',
    color: UI_COLORS.textGold,
    align: 'left',
  });
  drawWrappedLines(ctx, text, textLeft, box.iy + 17, textWidth, 11, 4, {
    font: '9px Arial, sans-serif',
    color: UI_COLORS.textActive,
  });

  // Blinking down-arrow next indicator & softkey skip hint
  const bounce = (Math.floor(animTick / 4) & 1) ? 1 : 0;
  drawSpriteFrame(ctx, assets, 'arrow', 1, width - 22, height - 18 + bounce, MIDP.HCENTER | MIDP.VCENTER);
  drawUiText(ctx, 'SKIP [ESC]', width - 34, box.iy + 7, {
    font: 'bold 7px Arial, sans-serif',
    color: UI_COLORS.textMuted,
    align: 'right',
    shadow: false,
  });
}

// AE2 framed modal list/popup using menu.png + #242a45 + #191b3a header + active #555d86 bar
export function drawFramedListMenu(ctx, assets, {
  title = '',
  items = [],
  selectedIndex = 0,
  scrollStart = 0,
  maxVisible = 8,
  rowHeight = 20,
  x = 12,
  y = 26,
  w = 216,
  h = 258,
  leftButton = 'OK',
  rightButton = 'BACK',
  width = 240,
  height = 320,
}) {
  const frame = drawMenuFrame(ctx, assets, x, y, w, h, 0, 22);
  drawUiText(ctx, title, frame.ix + (frame.iw >> 1), frame.iy + 11, {
    font: 'bold 10px Arial, sans-serif',
    color: UI_COLORS.textActive,
    align: 'center',
    maxWidth: frame.iw - 12,
  });

  const listTop = frame.iy + 28;
  const visible = Math.min(maxVisible, items.length);
  for (let i = 0; i < visible; i++) {
    const idx = scrollStart + i;
    if (idx >= items.length) break;
    const item = items[idx];
    const ry = listTop + i * rowHeight;
    const isSel = idx === selectedIndex;
    if (isSel) {
      ctx.fillStyle = UI_COLORS.borderHilight;
      ctx.fillRect(frame.ix + 2, ry, frame.iw - 4, rowHeight - 2);
      ctx.fillStyle = UI_COLORS.titleBg;
      ctx.fillRect(frame.ix + 3, ry + 1, frame.iw - 6, rowHeight - 4);
    }
    const labelText = typeof item === 'string' ? item : item.label;
    const valText = typeof item === 'object' && item.value != null ? item.value : null;
    drawUiText(ctx, labelText, frame.ix + 8, ry + (rowHeight >> 1), {
      font: isSel ? 'bold 9px Arial, sans-serif' : '9px Arial, sans-serif',
      color: isSel ? UI_COLORS.textActive : UI_COLORS.textMuted,
      align: 'left',
      maxWidth: valText ? frame.iw - 70 : frame.iw - 18,
    });
    if (valText != null) {
      drawUiText(ctx, valText, frame.ix + frame.iw - 8, ry + (rowHeight >> 1), {
        font: 'bold 9px Arial, sans-serif',
        color: isSel ? UI_COLORS.textGold : UI_COLORS.textActive,
        align: 'right',
      });
    }
  }

  if (scrollStart > 0) {
    drawSpriteFrame(ctx, assets, 'arrow', 0, frame.ix + frame.iw - 10, listTop - 4, MIDP.HCENTER | MIDP.VCENTER);
  }
  if (scrollStart + maxVisible < items.length) {
    drawSpriteFrame(ctx, assets, 'arrow', 1, frame.ix + frame.iw - 10, listTop + visible * rowHeight + 2, MIDP.HCENTER | MIDP.VCENTER);
  }

  if (leftButton) {
    drawSoftkeyButton(ctx, assets, { x: 8, y: height - 24, w: 66, h: 16, iconIdx: 0, label: leftButton });
  }
  if (rightButton) {
    drawSoftkeyButton(ctx, assets, { x: width - 74, y: height - 24, w: 66, h: 16, iconIdx: 1, label: rightButton, alignRight: true });
  }
  return { frame, listTop, visible, rowHeight };
}
