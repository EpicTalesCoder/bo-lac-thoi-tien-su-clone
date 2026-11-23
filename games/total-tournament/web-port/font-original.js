// Source-derived bitmap text renderer: a.java:40-52,54-107,109-166.
import { withMIDPClip } from './midp-graphics.js';
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
  const measure = (text) => [...text].reduce((width, character) => width + glyphAdvance(character), 0);

  // Exact port of a.java:54-107. MIDP uses anchor flags to adjust text bounds,
  // then clips each glyph using cf metrics and paints the untouched fnt sheet.
  function draw(ctx, text, x, y, anchor = 20) {
    const value = String(text);
    const width = measure(value);
    const dx = (anchor & 1) ? -(width >> 1) : (anchor & 8) ? -width : 0;
    const dy = (anchor & 32) ? -lineHeight : (anchor & 2) ? -(lineHeight >> 1) : 0;
    let penX = x + dx;
    let penY = y + dy + lineHeight - 1;
    for (const character of value) {
      const index = sourceGlyphIndex(character.codePointAt(0), metrics.length);
      const [sourceX, sourceY, glyphWidth, glyphH, offsetX, offsetY] = metrics[index];
      if (character !== '\n' && character !== '\r' && glyphWidth > 0 && glyphH > 0) {
        const clipX = penX + offsetX;
        const clipY = penY - offsetY - glyphH;
        withMIDPClip(ctx, clipX, clipY, glyphWidth, glyphH, () => {
          ctx.drawImage(image, penX - sourceX + offsetX, penY - sourceY - offsetY - glyphH);
        });
      }
      penX += glyphAdvance(character);
    }
  }
  return { draw, measure, lineHeight };
}
