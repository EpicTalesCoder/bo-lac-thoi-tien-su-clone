---
name: jar-to-cpp-port
description: >-
  Complete workflow, scripts, and pure Desktop C++17 + SDL2 starter kit for porting J2ME / Java .jar games
  directly to native macOS/Linux/Desktop C++ (no Nintendo Switch / .nro target). Uses mobile phone keypad input
  (0-9, *, #, Arrows/WASD, Enter/FIRE, Q/LSK, E/RSK) and 1920x1080 or 8x original scaling at smooth 60fps.
---

# Porting J2ME / Java `.JAR` Games to Native Desktop C++17 (`SDL2`)

Use this skill when porting a Java/J2ME game (`.jar`) cleanly to native Desktop C++17 (`-fno-rtti -fno-exceptions`) with `SDL2`, without Nintendo Switch (`libnx` / `.nro` / Joy-Con) targets or dependencies.

## Bundled Kit Contents

- **Decompilers & Build Script** (`./scripts/`):
  - [decompile_jar.sh](./scripts/decompile_jar.sh) + [vineflower-1.12.0.jar](./scripts/vineflower-1.12.0.jar) + [cfr-0.152.jar](./scripts/cfr-0.152.jar)
  - [build_and_verify.sh](./scripts/build_and_verify.sh) (Desktop `-O2` clean build, `ASan+UBSan` + `-Wl,-rpath,/opt/homebrew/lib` + `perl alarm 45`, and 2.2s live headless smoke check)
- **Templates & Desktop Platform/Engine Code** (`./resources/`):
  - [CMakeLists.desktop.tmpl](./resources/CMakeLists.desktop.tmpl), [prepare_assets.py](./resources/prepare_assets.py) (asset normalizer + PNG header/CRC reconstructor), and [ui.ttf](./resources/ui.ttf)
  - Platform layer (`./resources/platform/`): pure Desktop SDL2 `Platform.*`, `CrashLogger.*`, `RenderSystem.*` (`1920x1080` + `8x` original integer scaling), `InputSystem.*` (Mobile Phone Keypad + softkeys + mouse pointer), `AudioSystem.*`, `SaveSystem.*`
  - Engine wrappers (`./resources/engine/`): `Types.hpp` (`ByteReader`, `floorDivPow2`/`floorDiv16`, `lerpCoordRound`), `GraphicsContext.*`, `Image.*`, `BitmapFont.*`, `ScreenBase.*`, `UIEngine.*`
  - Headless QA templates (`./resources/qa/`): `test_smoke_template.cpp`, `test_ui_scroll_template.cpp`, `test_all_maps_qa_template.cpp`

---

## Step-by-Step Porting Workflow

### Phase 1: Decompile & Audit the Original `.JAR`
1. Run `./scripts/decompile_jar.sh <game.jar> <project_dir>` to extract `raw_assets/` and decompile with **both** Vineflower and CFR.
2. Read `META-INF/MANIFEST.MF` and the main `MIDlet`/`Canvas` class: record logical resolution (`origW x origH`), fixed tick delay (`frameDelayMs`), bitmap/TTF font format, `.ui` schema, event opcodes, and `RecordStore` schema.
3. Read [architecture-mapping.md](./references/architecture-mapping.md) before authoring C++ files.

### Phase 2: Normalize Assets into `assets/`
1. Adapt [prepare_assets.py](./resources/prepare_assets.py) for the game's folders:
   - Check actual magic bytes before trusting extensions — copy/recover disguised `.mid` PNGs and stripped-header PNG blobs with valid `IHDR`/`IDAT`/CRCs.
   - Convert MIDI BGM offline into `.ogg` under `assets/bgm/` for `SDL2_mixer`.
   - Copy `./resources/ui.ttf` into `assets/fonts/ui.ttf`.

### Phase 3: Bootstrap Pure Desktop C++17 Project
1. Copy [CMakeLists.desktop.tmpl](./resources/CMakeLists.desktop.tmpl) -> `CMakeLists.txt`, replacing `j2me_game` target with `<app_slug>`.
2. Copy `./resources/platform/*` -> `src/platform/` and `./resources/engine/*` -> `src/engine/`, calling `platform::init("<app_slug>")` and `platform::RenderSystem::setOriginalResolution(origW, origH)` before `RenderSystem::init(settings)`.
3. **Display Modes (`1920x1080` vs `x8 Original`)**:
   - Keep `DisplayScaleMode` wired cleanly (`F4` cycles, Pause Menu configures):
     - `FHD_1920x1080`: fills `1920x1080` edge-to-edge with 16:9 canvas (`426x240` for 240p, `568x320` for 320p, or proportional width).
     - `FHD_ASPECT_FIT`: centers exact `origW x origH` crisp pixel-art inside `1920x1080`.
     - `NATIVE_8X`: sets target resolution to `origW * 8 x origH * 8` crisp integer pixels (`F11` toggles Fullscreen).
4. **Phone Keypad Controls (Focus on Desktop Keyboard & Numpad)**:
   - Route authentic J2ME keypad codes directly into `game.handleJ2meKey`:
     - `0..9` (top row & Numpad `KP_0..9`) -> `'0'..'9'` (`48..57`), `*` (`*`, `KP_*`, `Shift+8`, `KP_-`) -> `42`, `#` (`#`, `Shift+3`, `KP_+`) -> `35`.
     - Arrows / `WASD` -> `-1..-4`, `Enter`/`Space`/`J` -> `FIRE (-5)`, `Q`/`[`/`Tab` -> `LSK (-6)`, `E`/`]`/`Backspace` -> `RSK (-7)`.
     - System hotkeys: `Esc`/`F1` Pause, `F2` Speed (`1x..8x`), `F3` Cheat, `F4` Display `1920x1080 <-> x8`, `F11` Fullscreen, `F12` FPS.
   - Use `InputSystem::clearQueues() + clearHeldInputs()` on Pause/Cheat menu open/close; call `InputSystem::resetAllState()` **only** on `SDL_WINDOWEVENT_FOCUS_LOST`/`MINIMIZED`/`HIDDEN` or log-viewer exit.
5. **Microsecond Loop & Zero-Ghosting 60 FPS**:
   - Drive fixed game ticks via `SDL_GetPerformanceCounter()` microsecond accumulator (`kFixedStepUs = stepMs * 1000`, cap catch-up `ranTicks < 6`), draining `clearQueues()` after feeding game ticks.
   - Interpolate **BOTH camera (`renderCamX/Y`) AND every world entity, companion, boss segment, snow particle, projectile, and floating text** using `engine::lerpCoordRound` (`std::lround`) when `smooth60Fps && speedMultiplier == 1`, resetting `interp.valid = false` on warp/map-load.

### Phase 4: Port Logic 1:1 & Optimize Vietnamese UI
1. Use `ByteReader`, `std::u16string` (`modifiedUtf8ToU16`), `floorDivPow2`/`floorDiv16` for negative-scroll `>> shift` + bitmask accumulators, explicit `* (1 << k)` instead of negative left-shifts, `!vec.empty()` checks, and bounded `for` loops (`-Warray-bounds` clean).
2. Guard optional sprite variants with `platform::romfsFileExists()`, verify binary hitbox order, quality flags (`!lowQuality`), render pass ordering, cutscene `O()` return values, and autosave dirty-flag ownership (`saveGame(true)`).
3. Strip all SMS activation gates, trial caps (`Midlet.a`), and `"vnđ"` strings (instant free 1-press grants). Keep in-game mobile keypad instructions (`phím 0-9, *, #, Enter, Mũi tên`) accurate and apply [vietnamese-ui-layout.md](./references/vietnamese-ui-layout.md) + uppercase accent bitmap fallbacks.
4. Ensure `OverlayMenuView` builders set both `view.selectedRow` and `view.scrollTop`.

### Phase 5: Automated QA & Verification
1. Customize the 3 test harnesses in `./resources/qa/` (walking rooms/triggers, phone keypad `0..9/*/#/Arrows/Enter/Q/E`, `1920x1080` & `x8` scale math, `floorDiv16`, `lerpCoordRound`, and focus reset) — check [desktop-pitfalls-and-qa.md](./references/desktop-pitfalls-and-qa.md).
2. Run `./scripts/build_and_verify.sh <project_dir> <target> [test1.cpp ...]` and confirm **0 project warnings**, all ASan+UBSan assertions passing, and clean 2.2s live launch.
