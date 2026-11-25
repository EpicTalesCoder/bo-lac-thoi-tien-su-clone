import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DIFFICULTIES, parseStoryD0 } from '../campaign-story.js';

const DIR = path.dirname(fileURLToPath(import.meta.url));

test('DIFFICULTIES exposes balanced easy and hard campaign presets', () => {
  assert.equal(DIFFICULTIES.length, 2);
  const [easy, hard] = DIFFICULTIES;
  assert.equal(easy.id, 'easy');
  assert.equal(hard.id, 'hard');
  assert.ok(easy.enemyHpScale < 1 && hard.enemyHpScale > 1);
  assert.ok(easy.bonusWood > 0);
});

test('parseStoryD0 decodes recovered /0/d0 pipe-delimited dialogue cleanly', () => {
  const d0Path = path.resolve(DIR, '../../analysis/recovered/0/d0');
  if (!fs.existsSync(d0Path)) return;
  const bytes = new Uint8Array(fs.readFileSync(d0Path));
  const entries = parseStoryD0(bytes);
  assert.ok(entries.length >= 200, `expected >= 200 dialogue entries, got ${entries.length}`);
  assert.ok(entries[0].length > 0);
});
