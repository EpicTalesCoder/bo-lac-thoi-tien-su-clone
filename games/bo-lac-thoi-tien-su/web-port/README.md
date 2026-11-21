# Prehistoric Tribes — browser prototype

This browser-native prototype runs directly in HTML, CSS, Canvas 2D, and ES modules with no J2ME emulator or Java runtime in the browser.

- **Opening menus & campaign intro (`language` → `music` → `mainMenu` → `mode` → `campaign`)**: replays exact 240×320 captured frames from the original JAR in FreeJ2ME.
- **All 10 campaign maps live-rendered (`game`, or direct URL `/?screen=game&scenario=0..9`)**:
  - **Màn 1 (`Bên ngoài`, 40×32)**: loads the verified settled state (`data-first-map.json`) with 1:1 visual comparison toggle (`V`) against `frame-24.png`.
  - **Màn 2–10 (`Trả thù`, `Chạy trốn`, `Vùng đất hoang`, `Ngôi nhà mới`, `Hồ rộng`, `Vượt qua sa mạc`, `Rừng dây leo`, `Tàn sát`, `Mảnh đất`)**: decoded directly in JavaScript (`scenario-loader.js`) from the untouched 42 KB original `/ma` binary (`assets/ma`) and `/a` tables.
  - **Authentic live render pipeline (`render-original.js`)**: ported from `f.java` (`b()`, `a()`, `d()`, `o()`, `u()`, `p()`, `w()`, `c()`), using original `pi0/00..26.png` & `pi9/00..05.png` sprite sheets for terrain, cliffs/caves, trees, multi-tile buildings, layered villagers, wild animals, fog of war, construction dust (`d(74)`), animated hand cursor, and top/bottom HUD bars.
- **Interactive gameplay (`game.js`)**:
  - **Building construction (`B` or bottom `3~` icon)**: authentic building catalog from `mapTableOffsets[138]` (Lều `+4` chỗ ở, Chòi canh, Kho, Bếp, Kho vũ khí, Nhà trẻ, Trung tâm PIA, Sàn disco, Khu thánh địa, Phòng tập, Khu tập ném) with live green/red placement preview, villager construction dispatch, dust clouds, and progress bars.
  - **Autonomous villager AI & survival (`Q`)**: villagers gather wood/food/stone and automatically haul loads back to the nearest camp building (`Lều Tộc trưởng` / `Kho`), hunt roaming wild animals (`+8` meat), and build queued construction sites.

## Run locally

From the repository root:

```sh
python3 -m http.server 4179 --bind 127.0.0.1 --directory rea/game/web-port
```

Then open:
- `http://127.0.0.1:4179/` (full startup menu & campaign intro flow)
- `http://127.0.0.1:4179/?screen=game` (live Màn 1)
- `http://127.0.0.1:4179/?screen=game&scenario=3` (live Màn 4: Vùng đất hoang — 64×64 with 14 wild animals)

## Controls

- **Click a villager**: select that villager (`Tab` cycles villagers).
- **Click walkable ground / tree / resource / wild animal / unfinished building**: move, gather & haul to camp, hunt, or build.
- **`B`** (or bottom `3~` icon): open building construction catalog.
- **`M`**: open all 10 campaign scenarios switcher (`/ma`).
- **`Q`**: toggle autonomous Tribe AI for idle villagers.
- **`G`**: send selected villager to gather nearest resource & haul back to camp.
- **`WASD` / Arrow keys**: move cursor and pan across maps up to 96×96.
- **`C`**: center camera on selected villager · **`P`** (or green `|||`): pause/resume · **`V`**: compare Màn 1 against original JAR capture · **`Escape`** (or red `≡`): cancel/menu.

## Scope & provenance note

The original `Bolacthoitiensu.jar` is untouched. Sprite sheets (`pi0`/`pi9`), `/ma` map archive, and rendering/scenario lookup tables come from the game archive and decompiled candidate (`FreeJ2meCandidateStateProbe.java`); pathfinding, building construction flow, autonomous gathering/hunting AI, and survival ticks are browser-native reimplementations and do not yet include combat AI, MIDI audio, or RMS save/load parity.
