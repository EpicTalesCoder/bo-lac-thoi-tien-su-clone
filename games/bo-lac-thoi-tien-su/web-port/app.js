const WIDTH = 240;
const HEIGHT = 320;
const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const titleNode = document.querySelector('#screen-title');
const copyNode = document.querySelector('#screen-copy');
const choicesNode = document.querySelector('#choices');
const helpCard = document.querySelector('#help-card');
const scopeNote = document.querySelector('#scope-note');
const controlHint = document.querySelector('#control-hint');
const languageOptions = ['TIẾNG VIỆT', 'FRANÇAIS', 'ITALIANO', 'DEUTSCH', 'ESPAÑOL'];
const screens = {
  language: { title: 'Chọn ngôn ngữ', copy: 'Chọn ngôn ngữ hiển thị. Bản dựng này mô phỏng luồng mở đầu bằng thao tác chuột hoặc bàn phím.', options: languageOptions, next: 'music' },
  music: { title: 'Bật âm nhạc?', copy: 'Chọn bật hoặc tắt nhạc để tiếp tục. Âm thanh đang là mô phỏng giao diện; chưa có nhạc gốc được giải mã.', options: ['BẬT ÂM NHẠC', 'TẮT ÂM NHẠC'], next: 'mainMenu' },
  mainMenu: { title: 'Trò chơi', copy: 'Menu mở đầu được dựng theo ảnh chụp từ bản gốc. Hãy chọn mục để tiếp tục.', options: ['BẮT ĐẦU TRÒ CHƠI', 'TRỢ GIÚP', 'TUỲ CHỌN', 'VỀ TRÒ CHƠI', 'THOÁT'], next: 'mode' },
  mode: { title: 'Chọn chế độ', copy: 'Chọn chiến dịch để mở luồng mở đầu của màn đầu tiên.', options: ['CHIẾN DỊCH', 'TRÒ CHƠI TUỲ CHỈNH', 'QUAY LẠI'], next: 'campaignIntro' },
  story: { title: 'Bản dựng web', copy: 'Phần chiến thuật đang được dựng lại từng bước.', options: ['VÀO THUNG LŨNG', 'XEM LẠI MÀN ĐẦU'], next: 'strategy' },
  campaignIntro: { title: 'Bắt đầu chiến dịch', copy: 'Trang truyện và khung gameplay đầu tiên được chụp từ JAR gốc trong FreeJ2ME. Dùng Enter hoặc click để đi qua đúng luồng mở đầu.', options: ['TIẾP TỤC'], next: 'campaignIntro' },
  strategy: { title: 'Màn chiến dịch đầu tiên — thử nghiệm live render', copy: 'Tile, sprite và dữ liệu map lấy từ state của build tái dựng chạy trong FreeJ2ME; trước khi coi là khớp JAR gốc cần xác minh lại bảng resource.', options: ['CHỌN / LỆNH', 'CHỌN DÂN', 'ĐẶT LỀU', 'LƯỢT KẾ', 'VÀO SANDBOX THỬ'], next: 'strategy' },
  strategyPrototype: { title: 'Bản dựng chiến thuật thử nghiệm', copy: 'Đây là bản dựng mới, không phải màn chơi gốc. Luật và bản đồ đơn giản được tự tạo để thử tương tác.', options: ['BẮT ĐẦU THỬ NGHIỆM'], next: 'sandbox' },
  sandbox: { title: 'Bản đồ thử nghiệm', copy: 'Mô phỏng đơn giản riêng biệt, không đại diện cho map hoặc luật chiến dịch gốc.', options: ['CHƠI THỬ'], next: 'sandbox' },
};
const requestedStart = new URLSearchParams(window.location.search).get('screen');
const state = { screen: requestedStart === 'strategy' ? 'strategy' : 'language', selected: 0, langIndex: 0, music: true };
let campaignFrame = 4;
const campaignFrames = Array.from({ length: 25 }, (_, index) => index);
const refs = { language: 'assets/campaign-captures/frame-00.png', music: 'assets/campaign-captures/frame-01.png', mainMenu: 'assets/campaign-captures/frame-02.png', mode: 'assets/campaign-captures/frame-03.png', strategy: 'assets/campaign-captures/frame-24.png' };
const capturedFlow = { campaignMenu: 4, newGame: 5, overwriteConfirm: 6, difficulty: 7, tutorial: 8, introFirst: 9, village: 19, gameplay: 24 };
const referenceImages = {};
for (const [key, url] of Object.entries(refs)) { const image = new Image(); image.src = url; image.onload = () => render(); referenceImages[key] = image; }
const campaignImages = campaignFrames.map((frame) => { const image = new Image(); image.src = `assets/campaign-captures/frame-${String(frame).padStart(2, '0')}.png`; image.onload = () => { if (state.screen === 'campaignIntro' && campaignFrame === frame) render(); }; return image; });

const COLS = 10, ROWS = 12, TILE = 22, MAP_TOP = 32;
const strategy = { turn: 1, wood: 2, food: 6, message: 'Chọn một dân làng để bắt đầu.', cursor: { x: 2, y: 4 }, activeUnit: 0, units: [], huts: [], trees: [], acted: new Set(), won: false, buildMode: false };
function resetStrategy() {
  strategy.turn = 1; strategy.wood = 3; strategy.food = 6; strategy.message = 'Chọn một dân làng để bắt đầu.'; strategy.cursor = { x: 2, y: 4 }; strategy.activeUnit = 0; strategy.huts = []; strategy.acted = new Set(); strategy.won = false; strategy.buildMode = false;
  strategy.units = [{ id: 0, x: 2, y: 4, moved: false, color: '#d49c4c' }, { id: 1, x: 3, y: 5, moved: false, color: '#bd6c45' }, { id: 2, x: 1, y: 6, moved: false, color: '#e0b85a' }];
  strategy.trees = [{ x: 3, y: 4, wood: 3 }, { x: 7, y: 5, wood: 3 }, { x: 5, y: 8, wood: 3 }, { x: 2, y: 2, wood: 2 }, { x: 8, y: 9, wood: 2 }];
}
resetStrategy();
function screenData() { return screens[state.screen]; }
function clampSelection() { state.selected = Math.max(0, Math.min(screenData().options.length - 1, state.selected)); }
function setScreen(name) { state.screen = name; state.selected = 0; if (name === 'sandbox') resetStrategy(); if (name === 'campaignIntro' && campaignFrame < capturedFlow.campaignMenu) campaignFrame = capturedFlow.campaignMenu; render(); }
function updatePanel() {
  const screen = screenData(); titleNode.textContent = screen.title; copyNode.textContent = screen.copy; choicesNode.replaceChildren();
  if (state.screen !== 'strategy') {
    helpCard.innerHTML = '<strong>Điều khiển</strong><span>↑ ↓ hoặc W S để chọn</span><span>Enter / Space để xác nhận</span><span>Click vào màn hình để chọn</span>';
    scopeNote.innerHTML = '<span>ⓘ</span> Luồng chiến thuật đầu tiên là bản mô phỏng web thử nghiệm, chưa phải logic game gốc đã xác minh.';
  }
  screen.options.forEach((label, index) => {
    const button = document.createElement('button'); button.type = 'button'; button.className = `choice${index === state.selected ? ' selected' : ''}`; button.setAttribute('aria-pressed', String(index === state.selected));
    button.innerHTML = `<span class="index">${String(index + 1).padStart(2, '0')}</span><span class="label"></span><span class="arrow">${index === state.selected ? '▶' : ''}</span>`;
    button.querySelector('.label').textContent = label;
    button.addEventListener('mouseenter', () => { state.selected = index; render(); });
    button.addEventListener('click', () => { state.selected = index; confirm(); }); choicesNode.append(button);
  });
  if (state.screen === 'strategy') {
    helpCard.innerHTML = '<strong>Điều khiển màn chiến thuật</strong><span>Click ô để chọn · Enter: lệnh đang chọn</span><span>↑↓←→ hoặc WASD: di chuyển con trỏ</span><span>F: chọn dân · B: xây lều · E: lượt mới</span>';
    scopeNote.innerHTML = '<span>ⓘ</span> Live render dùng tile/sprite gốc + map dump từ candidate. ID tile bị chuyển qua table; dữ liệu này chưa xác nhận khớp original JAR.';
    controlHint.textContent = 'CLICK / ENTER: CHỌN · WASD: DI CHUYỂN';
  } else if (state.screen === 'campaignIntro') {
    controlHint.textContent = 'ENTER / CLICK ĐỂ TIẾP TỤC';
  } else {
    controlHint.textContent = 'CLICK / CHẠM · ENTER XÁC NHẬN';
  }
  if (state.screen === 'sandbox') {
    helpCard.innerHTML = '<strong>Bản thử nghiệm riêng</strong><span>Click ô cạnh dân để đi</span><span>G: thu gỗ · B: chọn vị trí lều</span><span>E: lượt mới · Esc: menu</span>';
    scopeNote.innerHTML = '<span>ⓘ</span> Bản đồ và luật do prototype tạo mới, không phải nội dung game gốc.';
    const stats = document.createElement('div'); stats.className = 'strategy-stats';
    stats.innerHTML = `<span>🪵 Gỗ <b>${strategy.wood}</b></span><span>🍎 Thức ăn <b>${strategy.food}</b></span><span>👥 Dân <b>${strategy.units.length}</b></span><span>🏕 Lều <b>${strategy.huts.length}/1</b></span><span>⌛ Lượt <b>${strategy.turn}</b></span>`;
    choicesNode.prepend(stats);
    copyNode.textContent = strategy.won ? 'Bạn đã dựng được lều đầu tiên! Màn thử nghiệm hoàn thành. Có thể tiếp tục tự do.' : strategy.message;
  }
}
function drawBackground() {
  ctx.fillStyle = '#7ec7eb'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  const image = referenceImages[state.screen];
  if (image?.complete && image.naturalWidth) { ctx.drawImage(image, 0, 0, WIDTH, HEIGHT); return; }
  ctx.fillStyle = '#c9be59'; ctx.strokeStyle = '#433d20'; ctx.lineWidth = 3; ctx.fillRect(31, 65, 178, 145); ctx.strokeRect(31, 65, 178, 145); ctx.fillStyle = '#284c36'; ctx.fillRect(0, 225, WIDTH, HEIGHT - 225); ctx.fillStyle = '#f7ed95'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center'; ctx.fillText('PREHISTORIC TRIBES', 120, 43);
}
function drawPickerOverlay() {
  const options = screenData().options; const top = state.screen === 'language' ? 89 : 119;
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = 'bold 12px monospace';
  options.forEach((label, index) => { const y = top + index * 20; ctx.lineWidth = 2.5; ctx.strokeStyle = '#372c12'; ctx.strokeText(label, 120, y); ctx.fillStyle = '#fff27a'; ctx.fillText(label, 120, y); if (index === state.selected) { ctx.beginPath(); ctx.moveTo(44, y - 6); ctx.lineTo(51, y); ctx.lineTo(44, y + 6); ctx.closePath(); ctx.fill(); } }); ctx.restore();
}
function tileAt(x, y) { return (x * 7 + y * 11 + x * y) % 17; }
function drawTile(x, y) {
  const px = x * TILE; const py = MAP_TOP + y * TILE; const kind = tileAt(x, y);
  ctx.fillStyle = kind === 0 || kind === 1 ? '#5eaa55' : kind === 2 ? '#83be61' : '#72b858'; ctx.fillRect(px, py, TILE, TILE);
  ctx.fillStyle = kind === 0 ? '#41964b' : '#91c76b';
  ctx.fillRect(px + 3 + ((x * 3 + y) % 9), py + 4 + ((x + y * 5) % 7), 3, 2);
  if ((x + 2 * y) % 7 === 0) { ctx.fillStyle = '#dfdc6e'; ctx.fillRect(px + 15, py + 12, 2, 2); }
  ctx.strokeStyle = '#3a7d4866'; ctx.strokeRect(px + .5, py + .5, TILE, TILE);
}
function drawTree(tree) {
  if (tree.wood <= 0) return; const x = tree.x * TILE, y = MAP_TOP + tree.y * TILE;
  ctx.fillStyle = '#65452d'; ctx.fillRect(x + 9, y + 10, 5, 10);
  ctx.fillStyle = '#246c3c'; ctx.beginPath(); ctx.arc(x + 11, y + 8, 8, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#378d43'; ctx.beginPath(); ctx.arc(x + 7, y + 6, 5, 0, Math.PI * 2); ctx.arc(x + 15, y + 6, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f4e7a7'; ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center'; ctx.fillText(String(tree.wood), x + 11, y + 20);
}
function drawUnit(unit) {
  const x = unit.x * TILE, y = MAP_TOP + unit.y * TILE;
  ctx.fillStyle = '#344733'; ctx.fillRect(x + 7, y + 13, 9, 3);
  ctx.fillStyle = unit.color; ctx.fillRect(x + 7, y + 6, 9, 8); ctx.fillStyle = '#e8ba82'; ctx.fillRect(x + 8, y + 2, 7, 6); ctx.fillStyle = '#392b20'; ctx.fillRect(x + 12, y + 4, 2, 2); ctx.fillStyle = '#5c3b28'; ctx.fillRect(x + 6, y + 1, 10, 3);
  ctx.fillStyle = '#45372c'; ctx.fillRect(x + 8, y + 14, 3, 4); ctx.fillRect(x + 13, y + 14, 3, 4);
  if (strategy.activeUnit === unit.id) { ctx.strokeStyle = '#fff06f'; ctx.lineWidth = 2; ctx.strokeRect(x + 2, y + 1, 18, 19); }
}
function drawHut(hut) {
  const x = hut.x * TILE, y = MAP_TOP + hut.y * TILE;
  ctx.fillStyle = '#986238'; ctx.fillRect(x + 4, y + 9, 15, 10); ctx.fillStyle = '#623f29'; ctx.beginPath(); ctx.moveTo(x + 2, y + 10); ctx.lineTo(x + 11, y + 3); ctx.lineTo(x + 21, y + 10); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#34281d'; ctx.fillRect(x + 10, y + 13, 4, 6);
}
function drawSandbox() {
  ctx.fillStyle = '#233d2b'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = '#d4c768'; ctx.fillRect(0, 0, WIDTH, 29); ctx.fillStyle = '#352f1d'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center'; ctx.fillText('THUNG LŨNG ĐẦU TIÊN', 120, 12); ctx.font = '8px monospace'; ctx.fillText(`LƯỢT ${strategy.turn}  ·  GỖ ${strategy.wood}  ·  DÂN ${strategy.units.length}`, 120, 23);
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) drawTile(x, y);
  strategy.huts.forEach(drawHut); strategy.trees.forEach(drawTree); strategy.units.forEach(drawUnit);
  const cursorX = strategy.cursor.x * TILE, cursorY = MAP_TOP + strategy.cursor.y * TILE; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.setLineDash([2, 2]); ctx.strokeRect(cursorX + 1, cursorY + 1, TILE - 2, TILE - 2); ctx.setLineDash([]);
  ctx.fillStyle = '#bd9f52'; ctx.fillRect(0, 296, WIDTH, 24); ctx.fillStyle = '#302b1c'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'left'; ctx.fillText(strategy.won ? 'MỤC TIÊU HOÀN THÀNH!' : strategy.message.toLocaleUpperCase('vi'), 6, 307); ctx.font = '7px monospace'; ctx.fillText('CLICK Ô / PHÍM MŨI TÊN DI CHUYỂN', 6, 316);
}
function drawCampaignIntro() {
  const image = campaignImages[campaignFrame];
  if (image?.complete && image.naturalWidth) ctx.drawImage(image, 0, 0, WIDTH, HEIGHT);
  else { ctx.fillStyle = '#c2b552'; ctx.fillRect(0, 0, WIDTH, HEIGHT); }
}
function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  if (state.screen === 'sandbox') drawSandbox();
  else if (state.screen === 'strategy') drawBackground();
  else if (state.screen === 'campaignIntro') drawCampaignIntro();
  else { drawBackground(); if (!referenceImages[state.screen]?.complete && state.screen !== 'story') drawPickerOverlay(); }
}
function render() { draw(); updatePanel(); }
function adjacent(a, b) { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) <= 1; }
function unitAt(x, y) { return strategy.units.find(unit => unit.x === x && unit.y === y); }
function treeAt(x, y) { return strategy.trees.find(tree => tree.x === x && tree.y === y && tree.wood > 0); }
function chooseUnit(unit) { strategy.activeUnit = unit.id; strategy.cursor = { x: unit.x, y: unit.y }; strategy.message = `Đã chọn dân làng ${unit.id + 1}. Chọn ô để di chuyển hoặc thao tác.`; render(); }
function selectWorker() { const unit = strategy.units.find(item => item.id === strategy.activeUnit) || strategy.units[0]; if (unit) chooseUnit(unit); }
function gatherWood() {
  const unit = strategy.units.find(item => item.id === strategy.activeUnit); if (!unit) return;
  const tree = strategy.trees.find(item => item.wood > 0 && adjacent(item, unit));
  if (!tree) { strategy.message = 'Cần đứng cạnh cây để thu thập gỗ.'; render(); return; }
  if (strategy.acted.has(unit.id)) { strategy.message = 'Dân làng này đã hành động lượt này.'; render(); return; }
  if (strategy.food <= 0) { strategy.message = 'Bộ tộc hết thức ăn; kết thúc lượt không còn khả dụng.'; render(); return; }
  tree.wood--; strategy.wood++; strategy.acted.add(unit.id); strategy.message = `Thu thập được 1 gỗ. Còn ${tree.wood} ở cây này.`; render();
}
function buildHut() {
  const unit = strategy.units.find(item => item.id === strategy.activeUnit); if (!unit) return;
  if (!strategy.buildMode) { strategy.buildMode = true; strategy.message = 'Chọn ô cỏ trống cạnh dân làng để đặt lều.'; render(); return; }
  if (strategy.food <= 0) { strategy.message = 'Bộ tộc hết thức ăn; kết thúc lượt không còn khả dụng.'; render(); return; }
  if (strategy.wood < 3) { strategy.buildMode = false; strategy.message = 'Cần 3 gỗ để dựng lều. Hãy thu thập thêm.'; render(); return; }
  const x = strategy.cursor.x, y = strategy.cursor.y;
  if (!adjacent(unit, { x, y }) || unitAt(x, y) || treeAt(x, y) || strategy.huts.some(hut => hut.x === x && hut.y === y)) { strategy.message = 'Chọn bãi cỏ trống cạnh dân làng để dựng lều.'; render(); return; }
  if (strategy.acted.has(unit.id)) { strategy.buildMode = false; strategy.message = 'Dân làng này đã hành động lượt này.'; render(); return; }
  strategy.buildMode = false; strategy.wood -= 3; strategy.huts.push({ x, y }); strategy.acted.add(unit.id); strategy.message = 'Đã dựng lều mới! Mỗi lều cần 3 gỗ.'; if (strategy.huts.length >= 1) strategy.won = true; render();
}
function moveToCursor() {
  const unit = strategy.units.find(item => item.id === strategy.activeUnit); if (!unit) return;
  if (strategy.buildMode) { buildHut(); return; }
  const target = { x: strategy.cursor.x, y: strategy.cursor.y };
  if (unitAt(target.x, target.y)) { chooseUnit(unitAt(target.x, target.y)); return; }
  if (strategy.acted.has(unit.id)) { strategy.message = 'Dân làng này đã hành động lượt này.'; render(); return; }
  if (!adjacent(unit, target) || treeAt(target.x, target.y) || strategy.huts.some(hut => hut.x === target.x && hut.y === target.y)) { strategy.message = 'Chỉ có thể đi một ô tới bãi cỏ trống.'; render(); return; }
  unit.x = target.x; unit.y = target.y; unit.moved = true; strategy.acted.add(unit.id); strategy.message = 'Dân làng đã di chuyển. Mỗi người có một hành động mỗi lượt.'; render();
}
function endTurn() { strategy.turn++; strategy.acted.clear(); strategy.units.forEach(unit => { unit.moved = false; }); strategy.food = Math.max(0, strategy.food - 1); strategy.message = strategy.food ? 'Lượt mới bắt đầu. Hãy mở rộng bộ tộc.' : 'Bộ tộc hết thức ăn! Hãy tìm nguồn lương thực trong lượt tiếp theo.'; render(); }
function strategyAction(index) { if (index === 0) selectWorker(); else if (index === 1) gatherWood(); else if (index === 2) buildHut(); else if (index === 3) endTurn(); }
function confirm() {
  if (state.screen === 'sandbox') return strategyAction(state.selected);
  if (state.screen === 'campaignIntro') {
    if (campaignFrame === capturedFlow.campaignMenu) { campaignFrame = capturedFlow.newGameConfirm; render(); return; }
    if (campaignFrame === capturedFlow.newGameConfirm) { campaignFrame = capturedFlow.newGame; render(); return; }
    if (campaignFrame >= capturedFlow.gameplay) { setScreen('strategy'); return; }
    campaignFrame = Math.min(capturedFlow.gameplay, campaignFrame + 1);
    render();
    return;
  }
  if (state.screen === 'strategy') { setScreen('strategyPrototype'); return; }
  if (state.screen === 'strategyPrototype') { setScreen('sandbox'); return; }
  const screen = screenData(); if (state.screen === 'language') state.langIndex = state.selected; if (state.screen === 'music') state.music = state.selected === 0;
  if (state.screen === 'mainMenu' && state.selected === 1) { setScreen('mode'); return; }
  if (state.screen === 'mode' && state.selected === 2) return setScreen('mainMenu');
  if (state.screen === 'mode' && state.selected === 0) { setScreen('campaignIntro'); return; }
  if (state.screen === 'mode' && state.selected === 1) { setScreen('strategyPrototype'); return; }
  if (state.screen === 'mainMenu' && state.selected !== 0) { copyNode.textContent = `${screen.options[state.selected]} — mục này chưa được dựng trong prototype.`; return; }
  if (state.screen === 'story') { if (state.selected === 0) return setScreen('campaignIntro'); return setScreen('language'); }
  setScreen(screen.next);
}
function move(delta) { if (state.screen === 'sandbox') { strategy.cursor.y = Math.max(0, Math.min(ROWS - 1, strategy.cursor.y + delta)); render(); return; } state.selected += delta; clampSelection(); render(); }
function back() { if (state.screen === 'sandbox') return setScreen('strategy'); if (state.screen === 'strategy') return setScreen('campaignIntro'); if (state.screen === 'strategyPrototype') return setScreen('strategy'); if (state.screen === 'campaignIntro') return setScreen('mode'); const parents = { music: 'language', mainMenu: 'music', mode: 'mainMenu', story: 'mode' }; if (parents[state.screen]) setScreen(parents[state.screen]); }
function cursorStep(dx, dy) { strategy.cursor.x = Math.max(0, Math.min(COLS - 1, strategy.cursor.x + dx)); strategy.cursor.y = Math.max(0, Math.min(ROWS - 1, strategy.cursor.y + dy)); render(); }
window.addEventListener('keydown', event => {
  if (state.screen === 'sandbox') {
    if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') { event.preventDefault(); cursorStep(0, -1); }
    else if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') { event.preventDefault(); cursorStep(0, 1); }
    else if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') { event.preventDefault(); cursorStep(-1, 0); }
    else if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') { event.preventDefault(); cursorStep(1, 0); }
    else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); moveToCursor(); }
    else if (event.key.toLowerCase() === 'g') { event.preventDefault(); gatherWood(); }
    else if (event.key.toLowerCase() === 'b') { event.preventDefault(); buildHut(); }
    else if (event.key.toLowerCase() === 'e') { event.preventDefault(); endTurn(); }
    else if (event.key === 'Escape' || event.key === 'Backspace') { event.preventDefault(); back(); }
    return;
  }
  if (['ArrowDown', 'ArrowRight', 's', 'S', 'd', 'D'].includes(event.key)) { event.preventDefault(); move(1); }
  else if (['ArrowUp', 'ArrowLeft', 'w', 'W', 'a', 'A'].includes(event.key)) { event.preventDefault(); move(-1); }
  else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); confirm(); }
  else if (event.key === 'Escape' || event.key === 'Backspace') { event.preventDefault(); back(); }
});
canvas.addEventListener('pointerdown', event => {
  const bounds = canvas.getBoundingClientRect(); const x = (event.clientX - bounds.left) * WIDTH / bounds.width; const y = (event.clientY - bounds.top) * HEIGHT / bounds.height;
  if (state.screen === 'campaignIntro') { confirm(); return; }
  if (state.screen === 'strategy') {
    confirm(); return;
  }
  if (state.screen === 'strategyPrototype') { confirm(); return; }
  if (state.screen === 'sandbox') {
    if (y >= MAP_TOP && y < MAP_TOP + ROWS * TILE && x >= 0 && x < COLS * TILE) {
      const tx = Math.floor(x / TILE), ty = Math.floor((y - MAP_TOP) / TILE); strategy.cursor = { x: tx, y: ty }; const unit = unitAt(tx, ty); if (unit) chooseUnit(unit); else moveToCursor();
    } else if (y > 296) endTurn(); return;
  }
  if (state.screen === 'music') { state.selected = x < WIDTH / 2 ? 0 : 1; confirm(); return; }
  const firstY = state.screen === 'language' ? 89 : 119; const row = Math.round((y - firstY) / 20);
  if (row >= 0 && row < screenData().options.length && y >= firstY - 10 && y <= firstY + (screenData().options.length - 1) * 20 + 10) { state.selected = row; confirm(); } else if (y > HEIGHT - 42 && x < 28) back();
});
document.querySelector('[data-action="confirm"]').addEventListener('click', confirm);
document.querySelector('[data-action="back"]').addEventListener('click', back);
render();
