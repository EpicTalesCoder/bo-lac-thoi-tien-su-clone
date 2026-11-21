/**
 * Phase 5: 5-Language authentic asset pack loader (/0..4/{s,t,d0})
 * and localStorage / JSON Save-Load persistence (port of f.java RMS RecordStore).
 */

import { parseStoryD0 } from './campaign-story.js';

export const SAVE_STORAGE_KEY = 'prehistoric_tribes_web_save_v1';

export const LANGUAGES = [
  { id: 0, code: 'vi', label: 'TIẾNG VIỆT' },
  { id: 1, code: 'fr', label: 'FRANÇAIS' },
  { id: 2, code: 'it', label: 'ITALIANO' },
  { id: 3, code: 'de', label: 'DEUTSCH' },
  { id: 4, code: 'es', label: 'ESPAÑOL' },
];

const UI_TEXT_BY_LANG = [
  // 0: Vietnamese
  {
    pauseTitle: 'Menu Tạm dừng',
    resume: '▶ TIẾP TỤC CHƠI',
    saveGame: '💾 LƯU TRÒ CHƠI',
    loadGame: '📂 TẢI BẢN LƯU',
    exportSave: '⬇ XUẤT FILE SAVE (.JSON)',
    toggleMinimap: '🗺 BẢN ĐỒ NHỎ (PHÍM 3)',
    switchLang: '🌐 NGÔN NGỮ',
    viewStory: '📖 XEM CỐT TRUYỆN (/D0)',
    exitToMenu: '🚪 THOÁT VỀ MENU CHẾ ĐỘ',
    buildBtn: 'XÂY CÔNG TRÌNH (B)',
    scenariosBtn: 'CHỌN MÀN CHIẾN DỊCH',
    pauseBtn: 'MENU TẠM DỪNG (P)',
    continueSaved: 'TIẾP TỤC',
    newCampaign: 'TRÒ CHƠI MỚI (MÀN 1)',
    customGame: 'TRÒ CHƠI TUỲ CHỈNH',
    difficulty: 'ĐỘ KHÓ',
    savedOk: 'Đã lưu tiến độ bộ lạc vào trình duyệt!',
    loadedOk: 'Đã tải lại bản lưu thành công!',
    noSave: 'Chưa có bản lưu nào. Hãy bấm Lưu trò chơi trong Menu Tạm dừng!',
    minimapLegend: 'Xanh: Ta · Đỏ: Địch · Vàng: Nhà · Click để nhảy camera',
  },
  // 1: Français
  {
    pauseTitle: 'Menu Pause',
    resume: '▶ REPRENDRE LA PARTIE',
    saveGame: '💾 SAUVEGARDER',
    loadGame: '📂 CHARGER SAUVEGARDE',
    exportSave: '⬇ EXPORTER SAVE (.JSON)',
    toggleMinimap: '🗺 MINI-CARTE (TOUCHE 3)',
    switchLang: '🌐 LANGUE',
    viewStory: '📖 HISTOIRE (/1/D0)',
    exitToMenu: '🚪 QUITTER AU MENU',
    buildBtn: 'CONSTRUIRE (B)',
    scenariosBtn: 'CHOISIR MISSION',
    pauseBtn: 'MENU PAUSE (P)',
    continueSaved: 'CONTINUER',
    newCampaign: 'NOUVELLE PARTIE (M1)',
    customGame: 'PARTIE PERSONNALISÉE',
    difficulty: 'DIFFICULTÉ',
    savedOk: 'Partie sauvegardée dans le navigateur !',
    loadedOk: 'Sauvegarde chargée avec succès !',
    noSave: 'Aucune sauvegarde trouvée. Utilisez Sauvegarder dans le menu Pause.',
    minimapLegend: 'Vert: Tribu · Rouge: Ennemi · Jaune: Camp · Clic: Caméra',
  },
  // 2: Italiano
  {
    pauseTitle: 'Menu Pausa',
    resume: '▶ RIPRENDI PARTITA',
    saveGame: '💾 SALVA PARTITA',
    loadGame: '📂 CARICA SALVATAGGIO',
    exportSave: '⬇ ESPORTA SAVE (.JSON)',
    toggleMinimap: '🗺 MINIMAPPA (TASTO 3)',
    switchLang: '🌐 LINGUA',
    viewStory: '📖 STORIA (/2/D0)',
    exitToMenu: '🚪 TORNA AL MENU',
    buildBtn: 'COSTRUISCI (B)',
    scenariosBtn: 'SELEZIONA MISSIONE',
    pauseBtn: 'MENU PAUSA (P)',
    continueSaved: 'CONTINUA',
    newCampaign: 'NUOVA PARTITA (M1)',
    customGame: 'PARTITA PERSONALIZZATA',
    difficulty: 'DIFFICOLTÀ',
    savedOk: 'Partita salvata nel browser!',
    loadedOk: 'Salvataggio caricato con successo!',
    noSave: 'Nessun salvataggio trovato. Salva prima dal Menu Pausa.',
    minimapLegend: 'Verde: Tribù · Rosso: Nemici · Giallo: Case · Clic: Camera',
  },
  // 3: Deutsch
  {
    pauseTitle: 'Pausenmenü',
    resume: '▶ WEITERSPIELEN',
    saveGame: '💾 SPIEL SPEICHERN',
    loadGame: '📂 SPIELSTAND LADEN',
    exportSave: '⬇ SAVE EXPORTIEREN (.JSON)',
    toggleMinimap: '🗺 MINIKARTE (TASTE 3)',
    switchLang: '🌐 SPRACHE',
    viewStory: '📖 GESCHICHTE (/3/D0)',
    exitToMenu: '🚪 ZUM HAUPTMENÜ',
    buildBtn: 'BAUEN (B)',
    scenariosBtn: 'MISSION WÄHLEN',
    pauseBtn: 'PAUSENMENÜ (P)',
    continueSaved: 'FORTSETZEN',
    newCampaign: 'NEUES SPIEL (M1)',
    customGame: 'EIGENES SPIEL',
    difficulty: 'SCHWIERIGKEIT',
    savedOk: 'Spielstand im Browser gespeichert!',
    loadedOk: 'Spielstand erfolgreich geladen!',
    noSave: 'Kein Spielstand vorhanden. Speichere zuerst im Pausenmenü.',
    minimapLegend: 'Grün: Stamm · Rot: Feind · Gelb: Haus · Klick: Kamera',
  },
  // 4: Español
  {
    pauseTitle: 'Menú de Pausa',
    resume: '▶ REANUDAR PARTIDA',
    saveGame: '💾 GUARDAR PARTIDA',
    loadGame: '📂 CARGAR PARTIDA',
    exportSave: '⬇ EXPORTAR SAVE (.JSON)',
    toggleMinimap: '🗺 MINIMAPA (TECLA 3)',
    switchLang: '🌐 IDIOMA',
    viewStory: '📖 HISTORIA (/4/D0)',
    exitToMenu: '🚪 SALIR AL MENÚ',
    buildBtn: 'CONSTRUIR (B)',
    scenariosBtn: 'ELEGIR MISIÓN',
    pauseBtn: 'MENÚ PAUSA (P)',
    continueSaved: 'CONTINUAR',
    newCampaign: 'NUEVA PARTIDA (M1)',
    customGame: 'PARTIDA PERSONALIZADA',
    difficulty: 'DIFICULTAD',
    savedOk: '¡Partida guardada en el navegador!',
    loadedOk: '¡Partida cargada con éxito!',
    noSave: 'No hay partida guardada. Guarda primero en el Menú de Pausa.',
    minimapLegend: 'Verde: Tribu · Rojo: Enemigo · Amarillo: Casas · Clic: Cámara',
  },
];

function parsePipePack(bytes) {
  if (!bytes || bytes.length === 0) return [];
  let text = '';
  for (let i = 0; i < bytes.length; i++) text += String.fromCharCode(bytes[i]);
  if (text.startsWith('\xef\xbb\xbf')) text = text.slice(3);
  return text.split('|').map((entry) =>
    entry
      .replace(/\[/g, 'ç')
      .replace(/_/g, 'ñ')
      .replace(/\x1f/g, '1.0')
      .replace(/&&/g, ' ')
      .replace(/&/g, ' ')
      .replace(/[\x00-\x1f]/g, '')
      .trim()
  );
}

const langPackCache = new Map();

export async function loadLanguagePack(langIdx) {
  const id = Math.max(0, Math.min(4, langIdx | 0));
  if (langPackCache.has(id)) return langPackCache.get(id);

  const [sBuf, tBuf, d0Buf] = await Promise.all([
    fetch(`assets/${id}/s`).then((r) => (r.ok ? r.arrayBuffer() : null)).catch(() => null),
    fetch(`assets/${id}/t`).then((r) => (r.ok ? r.arrayBuffer() : null)).catch(() => null),
    fetch(`assets/${id}/d0`).then((r) => (r.ok ? r.arrayBuffer() : null)).catch(() => null),
  ]);

  const pack = {
    id,
    meta: LANGUAGES[id],
    s: sBuf ? parsePipePack(new Uint8Array(sBuf)) : [],
    t: tBuf ? parsePipePack(new Uint8Array(tBuf)) : [],
    d0: d0Buf ? parseStoryD0(new Uint8Array(d0Buf)) : [],
    ui: UI_TEXT_BY_LANG[id] || UI_TEXT_BY_LANG[0],
  };
  langPackCache.set(id, pack);
  return pack;
}

export function getUiStrings(langIdx) {
  return UI_TEXT_BY_LANG[Math.max(0, Math.min(4, langIdx | 0))] || UI_TEXT_BY_LANG[0];
}

export function getLocalizedScenarioName(pack, scenarioIndex, fallbackName) {
  if (pack?.id === 0) return fallbackName; // Keep accented Vietnamese titles for lang 0
  const raw = pack?.s?.[82 + scenarioIndex];
  if (!raw) return fallbackName;
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function saveGameToStorage(state) {
  if (!state?.data) return false;
  try {
    const payload = {
      version: 1,
      savedAt: new Date().toISOString(),
      scenarioIndex: state.scenarioIndex,
      difficultyIndex: state.difficultyIndex,
      isCustomGame: state.isCustomGame,
      language: state.language,
      music: state.music,
      cameraX: state.cameraX,
      cameraY: state.cameraY,
      cursor: state.cursor,
      selectedUnit: state.selectedUnit,
      food: state.food,
      wood: state.wood,
      stone: state.stone,
      tools: state.tools,
      population: state.population,
      housingCap: state.housingCap,
      missionStats: state.missionStats,
      carryoverTribe: state.carryoverTribe,
      mapState: {
        width: state.data.width,
        height: state.data.height,
        terrain: state.data.terrain,
        occupancy: state.data.occupancy,
        entityData: state.data.entityData,
        fogOfWar: state.data.fogOfWar,
        resources: state.data.resources,
      },
    };
    window.localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function loadSaveMetadata() {
  try {
    const raw = window.localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.mapState) return null;
    return {
      scenarioIndex: parsed.scenarioIndex ?? 0,
      difficultyIndex: parsed.difficultyIndex ?? 0,
      isCustomGame: Boolean(parsed.isCustomGame),
      population: parsed.population ?? 0,
      savedAt: parsed.savedAt || '',
    };
  } catch {
    return null;
  }
}

export function loadGameFromStorage(baseData) {
  try {
    const raw = window.localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw || !baseData) return null;
    const parsed = JSON.parse(raw);
    const ms = parsed?.mapState;
    if (!ms || !Array.isArray(ms.terrain) || !Array.isArray(ms.entityData)) return null;
    const hydratedData = {
      ...baseData,
      scenario: parsed.scenarioIndex ?? 0,
      width: ms.width,
      height: ms.height,
      terrain: ms.terrain,
      occupancy: ms.occupancy,
      entityData: ms.entityData,
      fogOfWar: ms.fogOfWar,
      resources: ms.resources,
      cameraX: parsed.cameraX ?? 0,
      cameraY: parsed.cameraY ?? 0,
      cursorX: parsed.cursor?.x ?? 5,
      cursorY: parsed.cursor?.y ?? 5,
      hoverUnit: parsed.selectedUnit ?? 1,
    };
    return { ...parsed, hydratedData };
  } catch {
    return null;
  }
}

export function exportSaveJson(state) {
  if (!saveGameToStorage(state)) return false;
  try {
    const raw = window.localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) return false;
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prehistoric-tribes-man${(state.scenarioIndex || 0) + 1}.json`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch {
    return false;
  }
}
