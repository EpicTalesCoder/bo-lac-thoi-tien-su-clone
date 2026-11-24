---
description: Enforce 1:1 source-faithful J2ME decompilation and web porting for all games under games/*/web-port/
---

# J2ME Faithful Porting Rule

## Auto-Trigger Playbook ("decompile game X" / "port game X" / "import game X")

Whenever the user asks to decompile, port, fix parity, or import a J2ME game (even with a short prompt like `"decompile game total tournament"`), automatically follow this exact sequence without waiting to be told where files are:

1. **Locate or scaffold the game**:
   - Check `games/` and `games/games-manifest.json` to resolve `<slug>`. If the user provides a new `.jar` path, run `python3 tools/new-game-port.py <slug> <jar-path> "<Display Name>"`.
2. **Load project standards first**:
   - Read `docs/J2ME_DECOMPILE_FIDELITY_GUIDE.md`, `.agents/skills/j2me-reverse-and-web-port/SKILL.md`, and `.agents/skills/j2me-reverse-and-web-port/references/decompile-to-source-parity.md`.
3. **Prepare evidence before coding**:
   - Run `python3 tools/prepare-j2me-evidence.py <slug>` so `analysis/CLASS-INDEX.md`, `analysis/bytecode-evidence/*.javap.txt` (>100B each), and `analysis/decompiled-*/*.java` are up to date.
4. **Plan & execute in 4 gated stages**:
   - **Stage 1**: Write/update `games/<slug>/analysis/CLASS-RESPONSIBILITIES.md` (classes, state machine, binary formats, formulas with `Class.java:line`).
   - **Stage 2**: Build 100% real binary decoders + `render-original.js` (exact MIDP anchors, `drawRegionMIDP`, `setClip`, original sprites/maps/HUD — zero `fillRect` placeholders).
   - **Stage 3**: Port core gameplay (`game.js`: input/mouse+keys, movement, combat/economy formulas, AI, campaign/save) citing `// Port of Class.java:line`.
   - **Stage 4**: Run `python3 tools/verify-port-parity.py <slug>` (MUST exit 0 / PASS!), `python3 tools/build-portal.py`, and visually verify on localhost.

## Zero-Invention Evidence Contract (Hard Locks)

When creating, fixing, or extending any J2ME web port under `games/<slug>/web-port/`:

1. **No "from-memory" rewrites or placeholder clones**:
   - Do NOT invent game mechanics, unit stats, map layouts, or draw placeholder `fillRect` geometry when the original `.jar` contains real sprites, maps, and formulas.
   - Always read the game's decompiled Java sources (`analysis/decompiled-vineflower/` and/or `analysis/decompiled-cfr/`) and `analysis/bytecode-evidence/*.javap.txt` first.
   - If decompiled sources or `javap` dumps are missing or empty, run `python3 tools/prepare-j2me-evidence.py <slug>` before coding.
2. **Unknown = STOP & VERIFY (Never Guess)**:
   - If any obfuscated method, formula, or binary table layout is unclear in the decompiled Java, inspect `analysis/bytecode-evidence/<Class>.javap.txt` directly.
   - If still uncertain, mark `// UNVERIFIED` and ask the user explicitly — **NEVER** silently invent a fallback formula or approximate table!
3. **100% Data-Driven Decoding (No Hand-Typed Game Data)**:
   - Decode maps, sprite/BSprite/animation frames, palettes, unit stats, and text directly from the original binary files in `assets/` (or generate verified JSON via a deterministic script reading `analysis/recovered/`).
   - Respect Java signed integer/byte semantics (`s8`, `s16`, `Math.trunc` integer division) and MIDP 2.0 `Graphics` anchors, clipping, and 8 `Sprite.TRANS_*` transforms.
4. **Mandatory Source Citations & Automated Gate**:
   - Add concise comments (`// Port of <Class>.java:<lines>`) on ported rendering passes, map/table decoders, state transitions, and combat/economy formulas.
   - **NEVER report a port complete** until `python3 tools/verify-port-parity.py <slug>` exits `0` (`RESULT: PASS`) and `python3 tools/build-portal.py` succeeds.
5. **Never modify `games/<slug>/original/*.jar`**.

## Deep Decompilation, Binary Integrity, UI & Runtime Parity Rules

Extracted from `games/j2me-cpp-porter` & `games/port_java_to_switch_nro_plan.md` to prevent recurring J2ME porting bugs across Web (HTML5) and Native (Desktop C++17 SDL2 / Switch `.nro`) targets:

1. **Dual-Decompiler + Bytecode Cross-Check (Offline Jars Available)**:
   - Always decompile every `.jar` with **both** Vineflower and CFR (`games/j2me-cpp-porter/skills/jar-to-cpp-port/scripts/vineflower-1.12.0.jar` & `cfr-0.152.jar`, plus `javap -c -p -v`), read `META-INF/MANIFEST.MF`, and record `origW x origH`, fixed tick `frameDelayMs`, font format, binary `.ui`/map schemas, event opcodes, and `RecordStore` layout before coding.
2. **Magic-Byte Asset Verification & Stripped-PNG Reconstruction**:
   - **Never trust file extensions inside a `.jar`** (e.g. PNGs disguised as `.mid`/`.bin` or XOR-100 / length-prefixed XOR streams). Inspect magic bytes first.
   - For stripped-header PNG blobs (`[w, h, bitDepth, colorType, PLTE, optional "tRNS", IDAT]`), reconstruct full `IHDR`/`PLTE`/`tRNS`/`IDAT`/`IEND` chunks with valid CRC32 and verify every extracted PNG with `zlib.decompress(IDAT)` (see `games/j2me-cpp-porter/skills/jar-to-cpp-port/resources/prepare_assets.py`).
3. **Exact Java Arithmetic, Signed Tables & State Lifecycle**:
   - **Signed byte/short & collision checks**: distinguish `s8` vs `u8`; never assume non-empty collision flags are `> 0` when source checks `!== 0` (e.g. negative slope/ramp offsets like `-1`).
   - **Negative scroll shifts**: Java `x >> k` paired with `x & ((1 << k) - 1)` floors toward `-∞` — use floor division (`Math.floor(x / 16)` / `floorDivPow2`), **never** truncating `/` which stalls negative camera scrolling.
   - **String indexing**: decode Modified UTF-8 into UTF-16 code units matching Java `charAt`/`substring` (never raw UTF-8 byte offsets).
   - **Safe teardown & VM completeness**: clear child views holding references before resetting owning world state; verify 100% of state `switch` cases, cutscene opcode return values (`true` only on map change), inverted quality flags (`!lowQuality`), and autosave dirty-flag ownership.
   - **Strip commercial locks**: remove SMS activation gates, trial caps (`Midlet.a`), IAP `+` prompts, and `"vnđ"` strings cleanly.
4. **Vietnamese / Localized UI Layout Discipline**:
   - Use **Lookahead Word-Boundary Wrapping** (strip color tags `#0..#7`/`#RRGGBB` from width math; never subtract `spaceRefWidth` early; only break mid-word if one word exceeds the full box width).
   - **Separate `textBounds` from icon/background rects**: never shift button/icon frames when widening Vietnamese labels; fit or auto-scroll overflowing labels and resolve adjacent label overlaps by midpoint split (`textOverlaps === 0`).
   - Include uppercase accented fallback glyphs (`À->A`, `Đ->D`) when using original bitmap fonts that lack Vietnamese diacritics, and verify with automated UI/menu tests.
5. **Input Focus Hygiene & Zero-Ghosting Timing**:
   - Drive fixed simulation ticks with a high-resolution accumulator (cap catch-up ticks `< 6`). If interpolating to 60 FPS, interpolate **both camera AND every world entity/projectile/particle/floating text** symmetrically with rounded lerp and snap (`valid = false`) on warp/map load.
   - Clear input queues (`clearQueues + clearHeldInputs`) on menu/pause toggle without wiping physical key state; call full `resetAllState()` **only** on window blur / focus lost. Account for HiDPI scaling on pointer/mouse coordinates and track scancode ownership for shifted keys (`*`, `#`).
   - Support full J2ME phone keypad (`0..9`, Numpad, `*` = `42`, `#` = `35`, Arrows/`WASD`, `Enter`/`Space` = FIRE, `Q`/`Tab` = LSK, `E`/`Backspace` = RSK) alongside mouse/touch.
