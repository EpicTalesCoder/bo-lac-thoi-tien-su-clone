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
