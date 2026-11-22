/** i18n + localStorage cho Total Tournament web port (giữ quy ước repo game 1). */
export const LANG_KEY = 'tt_lang';
export const SAVE_KEY = 'tt_save_v1';

export const LANG = {
  vi: {
    pressAny: 'NHẤN PHÍM BẤT KỲ',
    menu: ['CHƠI NGAY', 'NGÔN NGỮ: TIẾNG VIỆT', 'HƯỚNG DẪN', 'GIỚI THIỆU'],
    chooseMode: 'CHỌN CHẾ ĐỘ ĐẤU',
    modes: ['TỬ CHIẾN (DM)', 'ĐỒNG ĐỘI 4v4', 'SINH TỒN', 'CƯỚP CỜ', 'ANH HÙNG CUỐI'],
    modeDesc: [
      'Ai đạt 10 điểm hạ trước thì thắng.',
      'Xanh vs Đỏ — đội đạt 15 điểm hạ thắng.',
      'Sống sót qua các đợt địch càng lâu càng tốt.',
      'Cướp cờ của địch mang về căn cứ của mình 3 lần.',
      '8 chiến binh, không hồi sinh — người sống sót cuối cùng thắng.',
    ],
    start: 'BẮT ĐẦU!',
    back: '← Quay lại',
    paused: 'TẠM DỪNG',
    resume: 'P: tiếp tục · M: âm thanh · Q: thoát về menu',
    result: 'KẾT QUẢ',
    win: 'CHIẾN THẮNG!',
    lose: 'THẤT BẠI!',
    draw: 'HOÀ!',
    wave: 'ĐỢT',
    frags: 'Điểm',
    teamFrags: 'Xanh {g} — {r} Đỏ',
    time: 'Thời gian',
    captures: 'Cờ về',
    kills: 'Hạ gục',
    deaths: 'Bị hạ',
    best: 'Kỷ lục',
    again: 'ENTER: chơi lại · Q: menu',
    help: [
      'DI CHUYỂN: ↑↓←→ hoặc WASD',
      'NGẮM: chuột · BẮN: click hoặc SPACE',
      'ĐỔI SÚNG: phím 1-6',
      'P: tạm dừng · M: bật/tắt âm thanh',
      '',
      '6 loại súng: cưa điện, súng máy, shotgun,',
      'bazooka (nổ lan), plasma, beam (bắn thẳng).',
      'Nhặt thùng += đạn, ❤ += máu, 🛡 += giáp.',
      'Chainsaw chỉ ăn近距离 — xông vào cận chiến!',
    ],
    about: [
      'TOTAL TOURNAMENT (Net Lizard, J2ME)',
      'game action đồng đội: tử chiến, cướp cờ, sinh tồn.',
      '',
      'Bản web port lại bằng Phaser 3 (WebGL) +',
      'canvas 240×320, mô phỏng tick 120ms như MIDP.',
      'Asset giải mã từ JAR gốc trong analysis/.',
    ],
    langName: 'NGÔN NGỮ: TIẾNG VIỆT',
    loading: 'ĐANG TẢI...',
  },
  en: {
    pressAny: 'PRESS ANY KEY',
    menu: ['PLAY', 'LANGUAGE: ENGLISH', 'HOW TO PLAY', 'ABOUT'],
    chooseMode: 'CHOOSE GAME MODE',
    modes: ['DEATHMATCH', 'TEAM 4v4', 'SURVIVAL', 'CAPTURE THE FLAG', 'LAST HERO'],
    modeDesc: [
      'First to 10 frags wins.',
      'Green vs Red — first team to 15 frags wins.',
      'Survive enemy waves as long as you can.',
      'Steal the enemy flag and bring it home 3 times.',
      '8 fighters, no respawn — last one standing wins.',
    ],
    start: 'START!',
    back: '← Back',
    paused: 'PAUSED',
    resume: 'P: resume · M: sound · Q: quit to menu',
    result: 'RESULT',
    win: 'VICTORY!',
    lose: 'DEFEAT!',
    draw: 'DRAW!',
    wave: 'WAVE',
    frags: 'Frags',
    teamFrags: 'Green {g} — {r} Red',
    time: 'Time',
    captures: 'Captures',
    kills: 'Kills',
    deaths: 'Deaths',
    best: 'Best',
    again: 'ENTER: play again · Q: menu',
    help: [
      'MOVE: arrows or WASD',
      'AIM: mouse · FIRE: click or SPACE',
      'SWITCH WEAPON: keys 1-6',
      'P: pause · M: mute',
      '',
      '6 weapons: chainsaw, machine gun, shotgun,',
      'rocket (splash), plasma, beam (instant).',
      'Pick crates for ammo, hearts for HP, shields for armor.',
      'Chainsaw is melee only — get close!',
    ],
    about: [
      'TOTAL TOURNAMENT (Net Lizard, J2ME)',
      'team action: deathmatch, CTF, survival.',
      '',
      'Web port rebuilt with Phaser 3 (WebGL),',
      '240×320 canvas, 120ms simulation tick like MIDP.',
      'Assets decoded from the original JAR (analysis/).',
    ],
    langName: 'LANGUAGE: ENGLISH',
    loading: 'LOADING...',
  },
};

export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* localStorage có thể bị chặn */ }
  return { lang: 'vi', best: {} };
}

export function saveSave(data) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch (e) { /* bỏ qua */ }
}

export function getLang(data = loadSave()) {
  return data.lang === 'en' ? 'en' : 'vi';
}
