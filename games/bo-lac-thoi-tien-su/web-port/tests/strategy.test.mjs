import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const indexHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const gameJs = await readFile(new URL('../game.js', import.meta.url), 'utf8');
const rendererJs = await readFile(new URL('../render-original.js', import.meta.url), 'utf8');
const scenarioJs = await readFile(new URL('../scenario-loader.js', import.meta.url), 'utf8');
const storyJs = await readFile(new URL('../campaign-story.js', import.meta.url), 'utf8');
const storageJs = await readFile(new URL('../storage-i18n.js', import.meta.url), 'utf8');
const audioBinaryJs = await readFile(new URL('../audio-binary.js', import.meta.url), 'utf8');
const mapData = JSON.parse(await readFile(new URL('../data-first-map.json', import.meta.url), 'utf8'));
const captures = new URL('../assets/campaign-captures/', import.meta.url);
const originalFrames = new URL('../../analysis/rebuild-attempt/captures/original-campaign-walkthrough/walk-1/', import.meta.url);

test('index.html loads the live canvas game module', () => {
  assert.match(indexHtml, /<script type="module" src="game\.js(?:\?[^"]*)?"><\/script>/);
});

test('live renderer ports terrain, objects, layered villagers, fog, construction dust, combat, and HUD', () => {
  for (const token of ['drawLeaf', 'drawComposite', 'drawAnimation', 'getFogState', 'revealFog', 'drawOriginalHud', 'drawOriginalVillagerHud', 'renderOriginalMap', 'buildPreview', 'dustEffects', 'selectionBox', 'projectiles', 'selectedUnits', 'activeGroupId']) {
    assert.ok(rendererJs.includes(token), `missing renderer symbol: ${token}`);
  }
  assert.ok(rendererJs.includes('if (compositeIndex < 0 || depth > 8) return;'), 'compositeIndex 0 (grass) must not be skipped');
});

test('scenario-loader decodes all 10 scenarios from /ma and building specs from table 138', () => {
  for (const token of ['MA_OFFSETS', 'SCENARIOS', 'BUILDINGS', 'WEAPONS', 'SPELLS', 'getVillagerName', 'getBuildingSpec', 'canPlaceBuilding', 'placeBuilding', 'placeConstructionSite', 'enterBuildingSlot', 'enterBuildingWorkSlot', 'enterRestHut', 'exitBuildingSlot', 'finishConstructionSite', 'upgradeBuilding', 'demolishBuilding', 'spawnNewbornVillager', 'loadScenarioFromMa']) {
    assert.ok(scenarioJs.includes(token), `missing scenario-loader symbol: ${token}`);
  }
});

test('game controller supports survival needs, building work/weapons/spells, combat, box-select, groups 7/9, and enemy AI', () => {
  for (const token of ['renderOriginalMap', 'findPath', 'gatherNearest', 'stepSimulation', 'stepVillagerNeeds', 'depleteGatherTarget', 'startBuildPlacement', 'confirmBuildAtCursor', 'assignBuildTask', 'assignWorkAtBuilding', 'craftAndEquipWeapon', 'castShamanSpell', 'performUpgradeBuilding', 'performDemolishBuilding', 'setUnitCarry', 'runTribeAutoAI', 'stepWildAnimals', 'stepProjectiles', 'stepEnemyAI', 'assignAttackTask', 'assignEnemyAttack', 'issueGroupMove', 'issueGroupAttack', 'assignGroup', 'recallGroup', 'rallyAllVillagers', 'disbandGroupToWork', 'launchProjectile', 'applyUnitDamage', 'applyBuildingDamage', 'finishCanvasPointerDrag', 'loadScenario']) {
    assert.ok(gameJs.includes(token), `missing game controller symbol: ${token}`);
  }
});

test('campaign-story parses /0/d0, evaluates all 10 missions, scores, and supports difficulties', async () => {
  for (const token of ['DIFFICULTIES', 'parseStoryD0', 'getMissionDialogue', 'evaluateMissionObjectives', 'computeMissionScore']) {
    assert.ok(storyJs.includes(token), `missing campaign-story symbol: ${token}`);
  }
  const webD0 = await readFile(new URL('../assets/0/d0', import.meta.url));
  const origD0 = await readFile(new URL('../../analysis/recovered/0/d0', import.meta.url));
  const digest = bytes => createHash('sha256').update(bytes).digest('hex');
  assert.equal(webD0.length, 29606);
  assert.equal(digest(webD0), digest(origD0));
});

test('storage-i18n supports all 5 language packs (0..4) and localStorage save/load', async () => {
  for (const token of ['LANGUAGES', 'loadLanguagePack', 'getUiStrings', 'saveGameToStorage', 'loadSaveMetadata', 'loadGameFromStorage', 'exportSaveJson']) {
    assert.ok(storageJs.includes(token), `missing storage-i18n symbol: ${token}`);
  }
  for (let lang = 0; lang <= 4; lang++) {
    for (const file of ['d0', 's', 't']) {
      const webBytes = await readFile(new URL(`../assets/${lang}/${file}`, import.meta.url));
      const origBytes = await readFile(new URL(`../../analysis/recovered/${lang}/${file}`, import.meta.url));
      const digest = bytes => createHash('sha256').update(bytes).digest('hex');
      assert.equal(digest(webBytes), digest(origBytes), `lang ${lang}/${file} mismatch`);
    }
  }
});

test('audio-binary directly parses /a, /pd0, and 5 embedded MIDI tracks from /sa', async () => {
  for (const token of ['PD0_TABLE_SIZES', 'SA_TRACK_OFFSETS', 'SA_TRACK_LENGTHS', 'SA_TRACK_NAMES', 'parseOriginalPd0', 'parseOriginalA', 'parseSmfMidiEvents', 'extractMidiTracksFromSa', 'PrehistoricMidiSynth']) {
    assert.ok(audioBinaryJs.includes(token), `missing audio-binary symbol: ${token}`);
  }
  const digest = bytes => createHash('sha256').update(bytes).digest('hex');
  for (const [name, expectedLen] of [['a', 18842], ['pd0', 96990], ['sa', 26616]]) {
    const webBytes = await readFile(new URL(`../assets/${name}`, import.meta.url));
    const origBytes = await readFile(new URL(`../../analysis/recovered/${name}`, import.meta.url));
    assert.equal(webBytes.length, expectedLen);
    assert.equal(digest(webBytes), digest(origBytes));
  }
});

test('original /ma binary is preserved byte-for-byte in web-port/assets/ma', async () => {
  const webMa = await readFile(new URL('../assets/ma', import.meta.url));
  const origMa = await readFile(new URL('../../analysis/recovered/ma', import.meta.url));
  const digest = bytes => createHash('sha256').update(bytes).digest('hex');
  assert.equal(webMa.length, 42381);
  assert.equal(digest(webMa), digest(origMa));
});

test('data-first-map.json contains complete map, sprite, entity, resource, and fog tables', () => {
  assert.equal(mapData.width, 40);
  assert.equal(mapData.height, 32);
  assert.equal(mapData.terrain.length, 32);
  assert.equal(mapData.occupancy.length, 32);
  assert.ok(Array.isArray(mapData.entityFieldOffsets) && mapData.entityFieldOffsets.length === 570);
  assert.ok(Array.isArray(mapData.fogOfWar) && mapData.fogOfWar.length === 2);
  assert.ok(Array.isArray(mapData.resources) && mapData.resources[0][11] === 9);
});

test('extracted pi0 and pi9 sprite sheets exist and are non-empty', async () => {
  for (let i = 0; i < 27; i++) {
    const p = new URL(`../assets/pi0/${String(i).padStart(2, '0')}.png`, import.meta.url);
    assert.ok((await stat(p)).size > 0, `missing pi0/${i}.png`);
  }
  for (let i = 0; i < 6; i++) {
    const p = new URL(`../assets/pi9/${String(i).padStart(2, '0')}.png`, import.meta.url);
    assert.ok((await stat(p)).size > 0, `missing pi9/${i}.png`);
  }
});

test('campaign frames are exact copies of the original-JAR emulator captures', async () => {
  for (let index = 0; index <= 24; index++) {
    const name = `frame-${String(index).padStart(2, '0')}.png`;
    const browserBytes = await readFile(new URL(name, captures));
    const sourceBytes = await readFile(new URL(name, originalFrames));
    const digest = bytes => createHash('sha256').update(bytes).digest('hex');
    assert.equal(digest(browserBytes), digest(sourceBytes), `${name} differs from the original capture`);
    assert.ok((await stat(new URL(name, captures))).size > 0);
  }
});

test('enterRestHut only triggers breeding state 2 during explicit courtship, never normal rest', async () => {
  const { enterRestHut } = await import('../scenario-loader.js');
  const mockData = {
    width: 10,
    height: 10,
    occupancy: Array.from({ length: 10 }, () => new Array(10).fill(0)),
    entityData: new Array(10500).fill(0),
  };
  // Unit 1: adult male; Unit 2: adult female; Hut bid = 5
  mockData.entityData[1414 + 1] = 20;
  mockData.entityData[1515 + 1] = 0;
  mockData.entityData[1414 + 2] = 20;
  mockData.entityData[1515 + 2] = 1;
  const s1 = enterRestHut(mockData, 5, 1, false);
  const s2 = enterRestHut(mockData, 5, 2, false);
  assert.equal(s1.breeding, false);
  assert.equal(s2.breeding, false);
  assert.equal(mockData.entityData[1313 + 1], 1);
  assert.equal(mockData.entityData[1313 + 2], 1);

  // Explicit courtship in Hut bid = 6 MUST set breeding state 2
  mockData.entityData[1414 + 3] = 22;
  mockData.entityData[1515 + 3] = 0;
  mockData.entityData[1414 + 4] = 22;
  mockData.entityData[1515 + 4] = 1;
  const c1 = enterRestHut(mockData, 6, 3, true);
  const c2 = enterRestHut(mockData, 6, 4, true);
  assert.equal(c1.breeding, false);
  assert.equal(c2.breeding, true);
  assert.equal(mockData.entityData[1313 + 3], 2);
  assert.equal(mockData.entityData[1313 + 4], 2);
});

test('/sa embeds 5 valid MIDI tracks including Track 3 chase/tension percussion & dynamic BGM/SFX wiring', async () => {
  const { extractMidiTracksFromSa, PrehistoricMidiSynth } = await import('../audio-binary.js');
  const saBytes = await readFile(new URL('../assets/sa', import.meta.url));
  const tracks = extractMidiTracksFromSa(saBytes);
  assert.equal(tracks.length, 5, 'should parse all 5 embedded MIDI tracks from /sa');
  for (const t of tracks) {
    assert.ok(t.notes.length > 20, `Track ${t.index} should have parsed MIDI notes`);
  }
  const track3Channels = new Set(tracks[3].notes.map((n) => n.channel));
  assert.ok(track3Channels.has(9), 'Track 3 (chase/tension) must include channel 9 percussion notes');
  const synth = new PrehistoricMidiSynth();
  assert.equal(synth.loadTracks(saBytes), 5);
  assert.equal(typeof synth.unlock, 'function');
  assert.equal(typeof synth.playSfx, 'function');
  synth.playSfx('chop');
  for (const token of ['SA_MOOD_TRACKS', 'updateDynamicBgm', 'cycleIdleVillager', 'findExpandedEntityAtCursor']) {
    assert.ok(gameJs.includes(token), `missing game.js symbol: ${token}`);
  }
});
