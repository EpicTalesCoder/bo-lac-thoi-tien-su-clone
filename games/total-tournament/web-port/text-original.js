import { s8 } from './tt-loader.js';

// Port of b.java:289-352 and b.java:173-222. The original bytes map 0xC0..FF
// to Cyrillic codepoints by +848, strip the two-byte `_` header, then split
// `text` on '=' fields and CR/LF rows. Preserve original values verbatim.
export function decodeJ2meText(bytes) {
  let offset = bytes[0] === 95 ? 2 : 0;
  let end = bytes.indexOf(0, offset);
  if (end < 0) end = bytes.length;
  const chars = [];
  for (let i = offset; i < end; i++) {
    let value = bytes[i];
    if (value >= 192 && value <= 255) value += 848;
    else if (value === 32 || value < 10) value = 32;
    chars.push(String.fromCodePoint(value));
  }
  return chars.join('');
}

export function parseJ2meTextTable(bytes) {
  const source = decodeJ2meText(bytes);
  const rows = [];
  let row = [];
  let field = '';
  for (let index = 0; index < source.length; index++) {
    const char = source[index];
    if (char === '=') {
      row.push(field);
      field = '';
    } else if (char === '\r' || char === '\n') {
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
      if (index + 1 < source.length && (source[index + 1] === '\r' || source[index + 1] === '\n') && source[index + 1] !== char) index++;
    } else field += char;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  while (rows.length && rows.at(-1).length === 1 && rows.at(-1)[0] === '') rows.pop();
  return rows;
}

// Port of b.a(String,a,int,boolean): `text3` paragraphs wrap by source glyph
// metrics and split at spaces when the width-limited path is enabled.
export function wrapJ2meText(text, font, maxWidth) {
  const output = [];
  for (const paragraph of String(text).split(/[\r\n]+/)) {
    if (!paragraph) { output.push(''); continue; }
    let line = '';
    let wordStart = 0;
    while (wordStart < paragraph.length) {
      let wordEnd = paragraph.indexOf(' ', wordStart);
      if (wordEnd < 0) wordEnd = paragraph.length;
      const word = paragraph.slice(wordStart, wordEnd);
      const candidate = line ? `${line} ${word}` : word;
      if (line && font.measure(candidate) > maxWidth) {
        output.push(line);
        line = word;
      } else line = candidate;
      wordStart = wordEnd + 1;
    }
    if (line) output.push(line);
  }
  return output;
}
