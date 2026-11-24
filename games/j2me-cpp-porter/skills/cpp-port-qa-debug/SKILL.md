---
name: cpp-port-qa-debug
description: >-
  Troubleshooting, QA testing, ASan/UBSan verification, CrashLogger instrumentation, 60fps zero-ghosting tuning,
  1920x1080 vs 8x original display scaling, phone keypad (0-9, *, #) input debugging, and Vietnamese UI optimization
  for pure Desktop C++17 SDL2 J2ME ports (no Nintendo Switch target).
---

# Desktop C++17 (`SDL2`) J2ME Port QA & Debugging Guide

Use this skill whenever diagnosing crashes, softlocks, 60 FPS motion ghosting, scaling issues (`1920x1080` vs `x8` original), phone keypad input bugs, Vietnamese text clipping, or ASan hangs in a pure Desktop C++17 SDL2 port.

## Core References
- Full catalog of Desktop C++ / J2ME porting fixes: [desktop-pitfalls-and-qa.md](../jar-to-cpp-port/references/desktop-pitfalls-and-qa.md)
- Vietnamese UI text wrapping & layout guide: [vietnamese-ui-layout.md](../jar-to-cpp-port/references/vietnamese-ui-layout.md)
- Pre-release Desktop QA checklist: [release-checklist.md](./references/release-checklist.md)
- Clean Desktop build & ASan runner: [build_and_verify.sh](../jar-to-cpp-port/scripts/build_and_verify.sh)

---

## Diagnostic Playbook by Symptom

### 1. Crash on Launch / Shutdown / New Game
1. Inspect `$HOME/.<app_slug>_desktop_save/{boot.log,crash.log,last_crash_boot.log}` written by `CrashLogger` (includes POSIX `backtrace_symbols_fd` stack frames).
2. Run under **`ASan + UBSan`** (`-fsanitize=address,undefined -fno-sanitize-recover=all`), checking teardown order: always clean screens holding raw `Pet*`/`Entity*` pointers **before** resetting owners.

### 2. macOS Standalone ASan Test Binary Hangs Before `main()` (`malloc: nano zone abandoned...`)
- **Cause:** Homebrew's `sdl2-compat` calls `dlopen("libSDL3.0.dylib")` inside `dllinit()`. Under ASan without `/opt/homebrew/lib` rpath, it blocks forever in a hidden Cocoa `-[NSAlert runModal]`.
- **Fix:** Link **both** CMake ASan builds (`CMAKE_EXE_LINKER_FLAGS`) and standalone test binaries with **`-Wl,-rpath,/opt/homebrew/lib`**, and run headless wrapped in a timeout:
  ```bash
  ASAN_OPTIONS=detect_leaks=0 SDL_VIDEODRIVER=dummy SDL_AUDIODRIVER=dummy perl -e 'alarm 45; exec @ARGV' ./test_bin
  ```

### 3. Screen Size / Scaling / Blurry Pixels (`1920x1080` vs `x8` Original)
- Verify `RenderSystem::setOriginalResolution(origW, origH)` is called **before** `RenderSystem::init()`.
- Verify `F4` / Pause Overlay updates `settings.scaleMode` (`FHD_1920x1080`, `FHD_ASPECT_FIT`, `NATIVE_8X`) and invokes `RenderSystem::applyDisplaySettings(settings)` + resizes the game framebuffer cleanly (`gameCanvasWidth` / `gameCanvasHeight`).
- Keep `SDL_HINT_RENDER_SCALE_QUALITY` at `"0"` so `8x` pixel scaling remains razor sharp, and ensure `windowToGameCoords` accounts for HiDPI drawable vs window ratio on macOS Retina.

### 4. Phone Keypad (`0..9, *, #`) or Menu Overlay Input Bugs
- **Digits / `*` / `#` Stuck or Unrecognized:** Confirm `InputSystem` handles top-row digits (`SDLK_0..9`), Numpad (`SDLK_KP_0..9`), `Shift+8`/`KP_*` (`*` = `42`), and `Shift+3`/`KP_+` (`#` = `35`) using per-scancode ownership (`g_scancodeNumSlot`) so releasing `Shift` early never leaves `*`/`#` stuck.
- **Ghost Clicks on Menu Toggle vs Focus Reset:** Use `clearQueues() + clearHeldInputs()` when toggling Pause (`Esc`/`F1`) or Cheat (`F3`) overlays; call `resetAllState()` **only** on `SDL_WINDOWEVENT_FOCUS_LOST`/`MINIMIZED`/`HIDDEN` or Log Viewer exit.
- **Cheat Cursor Frozen / Tab Gap:** Populate both `OverlayMenuView::selectedRow` and `scrollTop`; verify `drawOverlayView` collapses unused tab space when `tabs.empty()`.

### 5. 60 FPS Motion Ghosting ("Bóng Mờ"), Camera Stall, UBSan, or Vietnamese Clipping
- **Motion Ghosting:** Drive fixed ticks with microsecond `SDL_GetPerformanceCounter()`, interpolate **both camera (`renderCamX/Y`) AND every world entity, companion, boss segment, snow particle, projectile, and floating text** identically with symmetric `lerpCoordRound` (`std::lround`), snap (`interp.valid = false`) on warp/map load, and enable only when `smooth60Fps && speedMultiplier == 1`.
- **Negative Scroll Stall / Layer Order / VM:** Use `engine::floorDiv16`/`floorDivPow2` instead of `/ 16` when paired with `&= 15`; verify inverted quality booleans (`!lowQuality` vs `highQuality`), foreground/background pass order, cutscene `O()` return values (`true` only on map change), `!vec.empty()` + loop bounds (`-Warray-bounds`), and `saveGame(true)` autosave dirty-flag ownership.
- **UI Text & Sprites:** Replace `dir << k` with `* (1 << k)`, guard optional sprites with `romfsFileExists()`, remove `maxW - spaceRefWidth`, add bitmap uppercase accent fallbacks (`À->A`, `Đ->D`), and keep in-game help text accurate for Desktop keypad (`Mũi tên/WASD, 0-9, *, #, Enter, Q, E`).
