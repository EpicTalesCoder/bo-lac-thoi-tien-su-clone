/**
 * Phase 4: Authentic `/0/d0` story dialogue parser, 10-mission Victory/Defeat
 * objectives, scoreboard calculation, and Difficulty / Custom Game presets.
 */

export const DIFFICULTIES = [
  {
    id: 'easy',
    label: 'DỄ',
    enemyHpScale: 0.8,
    enemyAtkScale: 0.75,
    enemyScanRange: 6,
    bonusWood: 15,
    bonusStone: 10,
    bonusFood: 10,
    bonusBones: 5,
    desc: 'Quân địch yếu hơn 20%, khởi đầu thêm tài nguyên dự trữ.',
  },
  {
    id: 'hard',
    label: 'KHÓ',
    enemyHpScale: 1.35,
    enemyAtkScale: 1.3,
    enemyScanRange: 9,
    bonusWood: 0,
    bonusStone: 0,
    bonusFood: 0,
    bonusBones: 0,
    desc: 'Quân địch mạnh hơn (+35% HP, +30% ATK) và phát hiện tầm xa hơn.',
  },
];

// Authentic dialogue line indices inside recovered/0/d0 (pipe-delimited, 0..235)
const MISSION_STORY_INDICES = [
  { intro: [0, 1, 2, 4, 6, 13, 15, 17], outro: [34] }, // Màn 1: Bên ngoài
  { intro: [35, 36, 40, 46, 51, 55], outro: [84] }, // Màn 2: Trả thù
  { intro: [85, 87, 89, 96], outro: [107] }, // Màn 3: Pháo đài
  { intro: [112, 115, 116, 129, 134], outro: [148] }, // Màn 4: Vùng đất hoang
  { intro: [148, 152, 153, 165], outro: [166] }, // Màn 5: Vua của những ngọn đồi
  { intro: [166, 167, 171, 174], outro: [181] }, // Màn 6: Khô khan
  { intro: [181, 184, 186, 188, 189], outro: [190] }, // Màn 7: Phục kích
  { intro: [190, 192, 196, 202], outro: [203] }, // Màn 8: Cuộc tẩu thoát
  { intro: [203, 204, 205, 208], outro: [209] }, // Màn 9: Lịch sử
  { intro: [209, 210], outro: [211] }, // Màn 10: Trận chiến cuối cùng
];

/**
 * Parse raw `/0/d0` binary directly (port of c.java:117-135 pipe-delimited reader).
 */
export function parseStoryD0(bytes) {
  if (!bytes || bytes.length === 0) return [];
  let text = '';
  for (let i = 0; i < bytes.length; i++) {
    text += String.fromCharCode(bytes[i]);
  }
  // Strip UTF-8 BOM if present (\xEF\xBB\xBF)
  if (text.startsWith('\xef\xbb\xbf')) text = text.slice(3);
  return text.split('|').map((entry) =>
    entry
      .replace(/\x1f/g, '1.0')
      .replace(/&&/g, '\n')
      .replace(/&/g, ' ')
      .replace(/[\x00-\x09\x0b-\x1e]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Get the authentic intro or outro dialogue pages for a mission from `/0/d0`.
 */
export function getMissionDialogue(storyLines, scenarioIndex, kind = 'intro') {
  const cfg = MISSION_STORY_INDICES[scenarioIndex] || MISSION_STORY_INDICES[0];
  const indices = cfg[kind] || [];
  const pages = [];
  for (const idx of indices) {
    const line = storyLines?.[idx];
    if (line && line.length > 0) {
      pages.push({ idx, text: line });
    }
  }
  return pages;
}

/**
 * Evaluate live Victory / Defeat status & progress checklist for each of the 10 missions.
 */
export function evaluateMissionObjectives(scenarioIndex, ctx) {
  const {
    population,
    food,
    playerBuildings,
    enemyCount,
    enemyBuildingCount,
    isCustomGame,
  } = ctx;

  // Defeat condition across all scenarios: tribe wiped out
  if (population <= 0) {
    return {
      status: 'defeat',
      reason: 'Toàn bộ dân làng của bộ lạc Avnotaklu đã tử trận!',
      items: [{ done: false, label: 'Giữ sống sót bộ lạc Avnotaklu' }],
    };
  }

  const finishedTypes = new Set(
    playerBuildings.filter((b) => !b.underConstruction).map((b) => b.targetType)
  );

  // Custom Game victory: clear all enemies if map has enemies, else reach 12 pop + 3 buildings
  if (isCustomGame) {
    if (ctx.initialEnemies > 0 || ctx.initialEnemyBuildings > 0) {
      const items = [
        { done: enemyCount === 0, label: `Tiêu diệt chiến binh địch (còn ${enemyCount})` },
        { done: enemyBuildingCount === 0, label: `Phá hủy công trình địch (còn ${enemyBuildingCount})` },
      ];
      return {
        status: items.every((i) => i.done) ? 'victory' : 'playing',
        reason: 'Bạn đã quét sạch bộ lạc đối thủ trong Trận tuỳ chỉnh!',
        items,
      };
    }
    const items = [
      { done: finishedTypes.has(2), label: 'Xây hoàn chỉnh ít nhất 1 Lều' },
      { done: finishedTypes.has(4), label: 'Xây hoàn chỉnh ít nhất 1 Bếp' },
      { done: food >= 20, label: `Tích trữ thức ăn (${food}/20)` },
    ];
    return {
      status: items.every((i) => i.done) ? 'victory' : 'playing',
      reason: 'Bộ lạc của bạn đã phát triển thịnh vượng!',
      items,
    };
  }

  // Campaign Missions 0..9 (matching original /0/d0 plotlines)
  if (scenarioIndex === 0) {
    // Màn 1: Bên ngoài — dựng Lều, Kho, Bếp và tích trữ 15 thức ăn (d0[17])
    const items = [
      { done: finishedTypes.has(2), label: 'Xây hoàn chỉnh 1 Lều' },
      { done: finishedTypes.has(6), label: 'Xây hoàn chỉnh 1 Kho chứa' },
      { done: finishedTypes.has(4), label: 'Xây hoàn chỉnh 1 Bếp' },
      { done: food >= 15, label: `Tích trữ 15 thức ăn (${food}/15)` },
    ];
    return {
      status: items.every((i) => i.done) ? 'victory' : 'playing',
      reason: 'Ngôi làng đầu tiên của Avnotaklu đã ổn định lương thực & chỗ ở!',
      items,
    };
  }

  if (scenarioIndex === 1) {
    // Màn 2: Trả thù — dựng Kho vũ khí/Phòng tập và đánh bại bộ lạc ăn thịt người
    const items = [
      { done: finishedTypes.has(0) || finishedTypes.has(1), label: 'Xây Kho vũ khí hoặc Phòng tập' },
      { done: enemyCount === 0, label: `Đánh bại chiến binh địch (còn ${enemyCount})` },
      { done: enemyBuildingCount === 0, label: `Phá hủy trại địch (còn ${enemyBuildingCount} nhà)` },
    ];
    return {
      status: items.every((i) => i.done) ? 'victory' : 'playing',
      reason: 'Bộ lạc ăn thịt người đã bị đánh bại hoàn toàn!',
      items,
    };
  }

  if (scenarioIndex === 2) {
    // Màn 3: Pháo đài — dựng Khu thánh địa & Chòi canh/PIA và đánh tan quân địch (d0[96])
    const items = [
      { done: finishedTypes.has(8), label: 'Xây hoàn chỉnh Khu thánh địa' },
      { done: finishedTypes.has(11) || finishedTypes.has(9), label: 'Xây Chòi canh hoặc Trung tâm PIA' },
      { done: enemyCount === 0 && enemyBuildingCount === 0, label: `Quét sạch địch (còn ${enemyCount} quân, ${enemyBuildingCount} nhà)` },
    ];
    return {
      status: items.every((i) => i.done) ? 'victory' : 'playing',
      reason: 'Pháo đài Avnotaklu đã đứng vững và đẩy lùi toàn bộ kẻ thù!',
      items,
    };
  }

  // Màn 4..10: Tiêu diệt toàn bộ lực lượng & căn cứ địch (d0[116..211])
  const missionFlavor = [
    '', '', '',
    'Đã giải cứu thành công toàn bộ phụ nữ & trẻ em Avnotaklu!',
    'Đã làm chủ những ngọn đồi và mở đường tới miền đất hứa!',
    'Đã vượt qua sa mạc khô khan và bảo vệ an toàn Tộc trưởng!',
    'Đã phá tan ổ phục kích và bảo toàn lực lượng bộ lạc!',
    'Bộ lạc Avnotaklu đã thoát khỏi hang động và giành lại tự do!',
    'Thung lũng hoa nay thuộc về bộ lạc Avnotaklu!',
    'CHIẾN THẮNG CUỐI CÙNG! Bộ lạc Avnotaklu đã tìm thấy quê hương vĩnh viễn!',
  ][scenarioIndex] || 'Đã đánh bại toàn bộ bộ lạc địch!';

  const items = [
    { done: enemyCount === 0, label: `Tiêu diệt quân địch (còn ${enemyCount})` },
    { done: enemyBuildingCount === 0, label: `Phá hủy công trình địch (còn ${enemyBuildingCount})` },
  ];
  return {
    status: items.every((i) => i.done) ? 'victory' : 'playing',
    reason: missionFlavor,
    items,
  };
}

/**
 * Compute authentic end-of-mission scoreboard (port of /0/d0[234]).
 */
export function computeMissionScore(stats) {
  const resourcesTotal = (stats.food || 0) + (stats.wood || 0) + (stats.stone || 0) + (stats.tools || 0);
  const score =
    (stats.population || 0) * 100 +
    (stats.buildingsBuilt || 0) * 150 +
    (stats.enemyBuildingsDestroyed || 0) * 200 +
    (stats.enemiesKilled || 0) * 120 +
    resourcesTotal * 5;
  return {
    population: stats.population || 0,
    buildingsBuilt: stats.buildingsBuilt || 0,
    enemyBuildingsDestroyed: stats.enemyBuildingsDestroyed || 0,
    enemiesKilled: stats.enemiesKilled || 0,
    resourcesTotal,
    totalScore: score,
  };
}
