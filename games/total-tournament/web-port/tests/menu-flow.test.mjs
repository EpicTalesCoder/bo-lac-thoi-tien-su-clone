import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  decodeCa, decodeColumnTable, decodeCu2, decodeEffects, decodeLevel, decodeObjectBlocks,
  decodeWeaponSets, decodeWeaponTable,
} from '../tt-loader.js';
import { parseJ2meTextTable } from '../text-original.js';
import {
  app, handleSourceInput, adjustConfigSetting, menuLength, handleMenuBack, toggleLanguage,
} from '../game.js';
import { LANG } from '../storage-i18n.js';
import { MODE } from '../tt-core.js';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const RES = path.resolve(DIR, '../jar-resources');
const readBin = (name) => new Uint8Array(fs.readFileSync(path.join(RES, `${name}.png`)));

function loadTablesSync() {
  const cu2 = decodeCu2(readBin('cu2'));
  const ca = decodeCa(readBin('ca'));
  const cc = decodeColumnTable(readBin('cc'), 11, 'cc');
  const ccs = decodeColumnTable(readBin('ccs'), 7, 'ccs');
  const objectBlocks = decodeObjectBlocks(readBin('obj0'));
  const weaponTable = decodeWeaponTable(readBin('wpn'));
  const equipmentSets = decodeWeaponSets(readBin('wlg'));
  const effects = decodeEffects(readBin('mua'));
  const ll = readBin('ll');
  const levels = Array.from({ length: 11 }, (_, i) => decodeLevel(ll, i, objectBlocks, cu2));
  const text = parseJ2meTextTable(readBin('text'));
  const levelLabels = Array.from({ length: 12 }, (_, i) => (i === 11 ? 'Назад' : `${i + 1}. Уровень`));
  return { cu2, ca, cc, ccs, objectBlocks, weaponTable, equipmentSets, effects, levels, text, levelLabels };
}

test('full menu flow advances Startup -> Title -> K=0 -> K=3 -> K=5 -> K=6 -> K=13 -> K=19 -> Game', () => {
  app.data = loadTablesSync();
  app.screen = 'startup';
  app.K = 0;
  app.selection = 0;
  app.match = null;

  handleSourceInput({ type: 'key-down', code: 53 });
  assert.equal(app.screen, 'title');

  handleSourceInput({ type: 'key-down', code: 53 });
  assert.equal(app.screen, 'menu');
  assert.equal(app.K, 0);

  // Sound Yes -> Main Menu (K=3)
  handleSourceInput({ type: 'key-down', code: 53 });
  assert.equal(app.K, 3);

  // Up (50) wraps to last item; Down (56) moves back to 0
  handleSourceInput({ type: 'key-down', code: 50 });
  assert.equal(app.selection, menuLength(3) - 1);
  handleSourceInput({ type: 'key-down', code: 56 });
  assert.equal(app.selection, 0);

  // New Game -> Mode Select (K=5)
  handleSourceInput({ type: 'key-down', code: 53 });
  assert.equal(app.K, 5);

  // Select CTF (index 3) -> Config (K=9)
  app.selection = 3;
  handleSourceInput({ type: 'key-down', code: 53 });
  assert.equal(app.mode, MODE.CAPTURE_FLAG);
  assert.equal(app.K, 9);

  // Adjust E (flag limit) with Left/Right
  const beforeE = app.settings.E;
  adjustConfigSetting(9, 0, 1);
  assert.equal(app.settings.E, beforeE + 1);
  adjustConfigSetting(9, 0, -1);
  assert.equal(app.settings.E, beforeE);

  // Config -> Map Select (K=13)
  handleSourceInput({ type: 'key-down', code: 53 });
  assert.equal(app.K, 13);

  // Map 2 -> Character Select (K=19)
  app.selection = 1;
  handleSourceInput({ type: 'key-down', code: 53 });
  assert.equal(app.levelIndex, 1);
  assert.equal(app.K, 19);

  // Toggle Mutant (Right) and start match
  handleSourceInput({ type: 'key-down', code: 54 });
  assert.equal(app.character, 1);
  handleSourceInput({ type: 'key-down', code: 53 });
  assert.equal(app.screen, 'game');
  assert.ok(app.match);
  assert.equal(app.match.mode, MODE.CAPTURE_FLAG);
  assert.equal(app.match.levelIndex, 1);
  assert.equal(app.match.player.character, 1);

  // Pause & resume via Back/Esc
  handleMenuBack();
  assert.equal(app.screen, 'menu');
  assert.equal(app.K, 1);
  handleMenuBack();
  assert.equal(app.screen, 'game');

  // Language toggle switches VI <-> EN cleanly with complete dictionaries
  const startLang = app.lang;
  toggleLanguage();
  assert.notEqual(app.lang, startLang);
  toggleLanguage();
  assert.equal(app.lang, startLang);
  for (const code of ['vi', 'en']) {
    assert.equal(LANG[code].mainMenu.length, 5);
    assert.equal(LANG[code].modes.length, 6);
    assert.equal(LANG[code].configRows.length, 5);
    assert.equal(LANG[code].characters.length, 2);
  }
});
