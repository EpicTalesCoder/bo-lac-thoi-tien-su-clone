/** i18n + localStorage for Total Tournament web port (VI default + EN toggle). */
export const LANG_KEY = 'tt_lang';
export const SAVE_KEY = 'tt_save_v1';

export const LANG = {
  vi: {
    code: 'vi',
    label: 'TIẾNG VIỆT',
    on: 'BẬT',
    off: 'TẮT',
    soundPrompt: 'BẬT ÂM THANH?',
    yesNo: ['CÓ', 'KHÔNG'],
    mainMenu: ['CHƠI MỚI', 'CÀI ĐẶT', 'HƯỚNG DẪN', 'GIỚI THIỆU', 'THOÁT'],
    options: ['RUNG: ', 'ÂM THANH: ', 'NGÔN NGỮ: ', 'QUAY LẠI'],
    pauseMenu: ['TIẾP TỤC', 'THỐNG KÊ', 'CHƠI LẠI', 'ÂM THANH: ', 'ĐỒ HỌA: ', 'VỀ MENU'],
    modes: ['TỬ CHIẾN', 'ĐẤU ĐỘI', 'SINH TỒN', 'CƯỚP CỜ', 'ANH HÙNG CUỐI', 'QUAY LẠI'],
    modeTitles: ['TỬ CHIẾN', 'ĐẤU ĐỘI', 'SINH TỒN', 'CƯỚP CỜ', 'ANH HÙNG CUỐI'],
    modeDesc: [
      'Đấu tự do! Hạ gục nhiều đối thủ nhất để chiến thắng.',
      'Chiến binh đấu Đột biến. Phối hợp cùng đồng đội giành điểm hạ!',
      'Đấu sinh tồn! Ai chết ít nhất khi hết trận sẽ thắng.',
      'Cướp cờ của đội địch và mang về căn cứ nhà để ghi điểm!',
      'Mỗi hiệp chỉ có 1 mạng — người sống sót cuối cùng thắng!',
    ],
    configRows: [
      ['MẠNG HẠ', 'THỜI GIAN', 'ĐẤU SĨ', 'CÂN BẰNG'],
      ['MẠNG HẠ', 'THỜI GIAN', 'ĐẤU SĨ', 'CÂN BẰNG'],
      ['LƯỢT CHẾT', 'THỜI GIAN', 'ĐẤU SĨ', 'CÂN BẰNG'],
      ['SỐ CỜ', 'THỜI GIAN', 'ĐẤU SĨ', 'CÂN BẰNG'],
      ['SỐ HIỆP', 'THỜI GIAN', 'ĐẤU SĨ', 'CÂN BẰNG'],
    ],
    configDesc: [
      'Số mạng hạ gục cần đạt để giành chiến thắng.',
      'Thời gian tối đa của trận đấu (tính bằng phút).',
      'Tổng số đấu sĩ tham gia trên bản đồ (2 - 10).',
      'Tỷ lệ phân chia Chiến binh : Đột biến.',
      'Số lần cướp cờ cần đạt để thắng trận.',
      'Giới hạn lượt chết — khi có đấu sĩ đạt mốc này trận đấu kết thúc.',
      'Số hiệp đấu. Mỗi hiệp mỗi đấu sĩ chỉ có 1 mạng!',
    ],
    levelPrefix: 'ĐẤU TRƯỜNG',
    back: 'QUAY LẠI',
    characters: ['CHIẾN BINH', 'ĐỘT BIẾN'],
    statsTitle: 'THỐNG KÊ',
    win: 'CHIẾN THẮNG!',
    lose: 'THẤT BẠI!',
    draw: 'HÒA!',
    colPlayer: 'ĐẤU SĨ',
    colKills: 'HẠ',
    colDeaths: 'CHẾT',
    roundPrefix: 'HIỆP ',
    pressAny: 'NHẤN PHÍM HOẶC CLICK ĐỂ BẮT ĐẦU',
    help: [
      'HƯỚNG DẪN CHƠI',
      'Di chuyển: Mũi tên / WASD',
      'Nhảy: Lên / W · Tụt sàn: Xuống / S',
      'Bắn súng: Space / Enter / Click',
      'Đổi súng: Q / Tab / Phím 0',
      'Tạm dừng: Esc / P',
      '6 vũ khí: Cưa điện, Súng máy,',
      'Shotgun, Tên lửa, Plasma, Laser.',
      'Nhặt hộp máu, giáp, đạn & súng',
      'rơi trên bản đồ để áp đảo đối thủ!',
    ].join('\n'),
    about: [
      'TOTAL TOURNAMENT',
      '(c) NET Lizard 2008',
      'Phiên bản Web Port 1:1',
      '2 phe: Chiến binh vs Đột biến',
      '5 chế độ · 11 đấu trường gốc',
      'Chuyển thể từ mã nguồn J2ME gốc.',
    ].join('\n'),
  },
  en: {
    code: 'en',
    label: 'ENGLISH',
    on: 'ON',
    off: 'OFF',
    soundPrompt: 'ENABLE SOUND?',
    yesNo: ['YES', 'NO'],
    mainMenu: ['NEW GAME', 'OPTIONS', 'HELP', 'ABOUT', 'EXIT'],
    options: ['VIBRO: ', 'SOUND: ', 'LANG: ', 'BACK'],
    pauseMenu: ['RESUME', 'STATS', 'RESTART', 'SOUND: ', 'DETAIL: ', 'MAIN MENU'],
    modes: ['DEATHMATCH', 'TEAM DM', 'SURVIVAL', 'CAPTURE FLAG', 'LAST HERO', 'BACK'],
    modeTitles: ['DEATHMATCH', 'TEAM DM', 'SURVIVAL', 'CAPTURE FLAG', 'LAST HERO'],
    modeDesc: [
      'Free for all! Eliminate as many opponents as possible.',
      'Soldiers vs Mutants. Work with your team to dominate!',
      'Free for all! Fewest deaths wins the match.',
      'Capture the enemy flag and bring it back to your base!',
      'One life per round — be the last hero standing!',
    ],
    configRows: [
      ['FRAGS', 'TIME', 'PLAYERS', 'BALANCE'],
      ['FRAGS', 'TIME', 'PLAYERS', 'BALANCE'],
      ['DEATHS', 'TIME', 'PLAYERS', 'BALANCE'],
      ['FLAGS', 'TIME', 'PLAYERS', 'BALANCE'],
      ['ROUNDS', 'TIME', 'PLAYERS', 'BALANCE'],
    ],
    configDesc: [
      'Target kills required to win the match.',
      'Match duration limit in minutes.',
      'Total fighters on the arena (2 - 10).',
      'Soldier to Mutant team ratio.',
      'Flag captures required to win.',
      'Death limit before the survival match ends.',
      'Number of rounds. One life per round!',
    ],
    levelPrefix: 'ARENA',
    back: 'BACK',
    characters: ['SOLDIER', 'MUTANT'],
    statsTitle: 'STATISTICS',
    win: 'VICTORY!',
    lose: 'DEFEAT!',
    draw: 'DRAW!',
    colPlayer: 'PLAYER',
    colKills: 'K',
    colDeaths: 'D',
    roundPrefix: 'ROUND ',
    pressAny: 'PRESS ANY KEY OR CLICK',
    help: [
      'HOW TO PLAY',
      'Move: Arrow Keys / WASD',
      'Jump: Up / W · Drop: Down / S',
      'Fire: Space / Enter / Click',
      'Switch Weapon: Q / Tab / 0',
      'Pause: Esc / P',
      '6 Weapons: Chainsaw, Machinegun,',
      'Shotgun, Rocket, Plasma, Railgun.',
      'Collect medkits, armor, ammo &',
      'weapons across all 11 arenas!',
    ].join('\n'),
    about: [
      'TOTAL TOURNAMENT',
      '(c) NET Lizard 2008',
      '1:1 J2ME-to-Web Port',
      '2 Factions: Soldier vs Mutant',
      '5 Modes · 11 Original Arenas',
      'Rebuilt from original J2ME assets.',
    ].join('\n'),
  },
};

export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* localStorage unavailable */ }
  return { lang: 'vi', best: {} };
}

export function saveSave(data) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
}

export function getLang(data = loadSave()) {
  return data.lang === 'en' ? 'en' : 'vi';
}
