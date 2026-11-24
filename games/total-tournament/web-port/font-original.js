// Source-derived bitmap text renderer: a.java:40-52,54-107,109-166.
import { withMIDPClip } from './midp-graphics.js';

const COMBINING_MARK_RE = /^[\u0300-\u036f]$/;

// Crisp 1px-outlined white pixel masks matching fnt.png's 1px #000 border + #fff glyph fill.
const DIACRITIC_PIXELS = {
  // Circumflex ^ (\u0302)
  '\u0302': [[0, 1], [-1, 2], [1, 2]],
  // Breve u (\u0306)
  '\u0306': [[-1, 1], [1, 1], [0, 2]],
  // Acute ' (\u0301)
  '\u0301': [[1, 0], [0, 1]],
  // Grave ` (\u0300)
  '\u0300': [[-1, 0], [0, 1]],
  // Tilde ~ (\u0303)
  '\u0303': [[-2, 1], [-1, 0], [0, 1], [1, 0]],
  // Hook above ? (\u0309)
  '\u0309': [[0, 0], [1, 0], [1, 1], [0, 2]],
  // Horn , (\u031b) placed on upper-right edge of O/U
  '\u031b': [[0, 0], [1, 0], [0, 1]],
  // Dot below . (\u0323)
  '\u0323': [[0, 0]],
};

function tokenizeClusters(text) {
  const clusters = [];
  for (const ch of String(text).normalize('NFD')) {
    if (COMBINING_MARK_RE.test(ch) && clusters.length > 0) {
      clusters[clusters.length - 1].marks.push(ch);
      continue;
    }
    if (ch === 'Đ' || ch === 'đ') {
      clusters.push({ base: 'D', marks: ['dbar'] });
    } else if (ch === '·' || ch === '•' || ch === '–' || ch === '—') {
      clusters.push({ base: '-', marks: [] });
    } else {
      clusters.push({ base: ch, marks: [] });
    }
  }
  return clusters;
}

function drawOutlinedPixels(ctx, originX, originY, pixels) {
  if (!ctx.fillRect || pixels.length === 0) return;
  const outlineSet = new Set();
  const whiteSet = new Set();
  for (const [px, py] of pixels) {
    whiteSet.add(`${px},${py}`);
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (dx !== 0 || dy !== 0) outlineSet.add(`${px + dx},${py + dy}`);
      }
    }
  }
  ctx.fillStyle = '#000000';
  for (const key of outlineSet) {
    if (whiteSet.has(key)) continue;
    const [dx, dy] = key.split(',').map(Number);
    ctx.fillRect(originX + dx, originY + dy, 1, 1);
  }
  ctx.fillStyle = '#ffffff';
  for (const [dx, dy] of pixels) {
    ctx.fillRect(originX + dx, originY + dy, 1, 1);
  }
}

export function decodeFontMetrics(bytes) {
  if (bytes.length % 6 !== 0) throw new Error(`cf: ${bytes.length} bytes is not divisible by six`);
  const signed = (value) => ((value & 0xff) > 127 ? (value & 0xff) - 256 : (value & 0xff));
  const glyphs = bytes.length / 6;
  return Array.from({ length: glyphs }, (_, glyph) => Array.from(bytes.subarray(glyph * 6, glyph * 6 + 6), signed));
}

export function sourceGlyphIndex(codePoint, glyphCount) {
  let value = codePoint;
  if (value >= 65408) value -= 65280;
  if (value > 848) value -= 848;
  if (value === 168) value = 197;
  if (value === 184) value = 229;
  if (value >= 97 && value <= 122) value -= 32;
  else if (value >= 192 && value <= 223) value -= 96;
  else if (value >= 224 && value <= 255) value -= 128;
  else if (value >= 154 && value <= 191) value -= 26;
  value -= 32;
  return value < 0 || value >= glyphCount ? 0 : value;
}

export function createOriginalFont(image, metrics) {
  const glyphHeight = metrics[sourceGlyphIndex(1062, metrics.length)]?.[3] ?? 0;
  const lineHeight = glyphHeight + 1;
  const glyphAdvance = (character) => character === '\n' || character === '\r'
    ? 0 : 1 + (metrics[sourceGlyphIndex(character.codePointAt(0), metrics.length)]?.[2] ?? 0);
  const measure = (text) => tokenizeClusters(text).reduce((width, cluster) => width + glyphAdvance(cluster.base), 0);

  // Exact port of a.java:54-107, with pixel-matched NFD diacritic overlays for VI support.
  function draw(ctx, text, x, y, anchor = 20) {
    const clusters = tokenizeClusters(text);
    const width = clusters.reduce((acc, cluster) => acc + glyphAdvance(cluster.base), 0);
    const dx = (anchor & 1) ? -(width >> 1) : (anchor & 8) ? -width : 0;
    const dy = (anchor & 32) ? -lineHeight : (anchor & 2) ? -(lineHeight >> 1) : 0;
    let penX = Math.round(x + dx);
    const penY = Math.round(y + dy + lineHeight - 1);
    for (const cluster of clusters) {
      const character = cluster.base;
      const index = sourceGlyphIndex(character.codePointAt(0), metrics.length);
      const [sourceX, sourceY, glyphWidth, glyphH, offsetX, offsetY] = metrics[index];
      if (character !== '\n' && character !== '\r' && glyphWidth > 0 && glyphH > 0) {
        const clipX = penX + offsetX;
        const clipY = penY - offsetY - glyphH;
        withMIDPClip(ctx, clipX, clipY, glyphWidth, glyphH, () => {
          ctx.drawImage(image, penX - sourceX + offsetX, penY - sourceY - offsetY - glyphH);
        });
        if (cluster.marks.length > 0) {
          const cx = clipX + (glyphWidth >> 1);
          const hasShapeTop = cluster.marks.includes('\u0302') || cluster.marks.includes('\u0306');
          for (const mark of cluster.marks) {
            if (mark === 'dbar') {
              drawOutlinedPixels(ctx, clipX, penY - 6, [[0, 0], [1, 0], [2, 0]]);
            } else if (mark === '\u0323') {
              drawOutlinedPixels(ctx, cx, penY, DIACRITIC_PIXELS[mark]);
            } else if (mark === '\u031b') {
              drawOutlinedPixels(ctx, clipX + glyphWidth - 1, clipY, DIACRITIC_PIXELS[mark]);
            } else if (DIACRITIC_PIXELS[mark]) {
              let shiftX = 0;
              let baseY = clipY - 2;
              if (hasShapeTop && mark !== '\u0302' && mark !== '\u0306') {
                shiftX = mark === '\u0300' ? -3 : 3;
                baseY = clipY - 3;
              }
              drawOutlinedPixels(ctx, cx + shiftX, baseY, DIACRITIC_PIXELS[mark]);
            }
          }
        }
      }
      penX += glyphAdvance(character);
    }
  }
  return { draw, measure, lineHeight };
}
