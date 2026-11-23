---
description: Enforce 1:1 source-faithful J2ME decompilation and web porting for all games under games/*/web-port/
---

# J2ME Faithful Porting Rule

When creating, fixing, or extending any J2ME web port under `games/<slug>/web-port/`:

1. **No "from-memory" rewrites or placeholder clones**:
   - Do NOT invent game mechanics, unit stats, map layouts, or draw placeholder `fillRect` geometry when the original `.jar` contains real sprites, maps, and formulas.
   - Always read the game's decompiled Java sources (`analysis/decompiled-vineflower/` and/or `analysis/decompiled-cfr/`) and `analysis/bytecode-evidence/*.javap.txt` first.
   - If decompiled sources or `javap` dumps are missing or empty, generate them from `games/<slug>/original/*.jar` before coding.
2. **Decode original binary formats faithfully**:
   - Parse the game's real sprite/animation/map/string tables (e.g. BSprite, `.sprite`, `.m`, `/a`, `/ma`, split packs `0..11`) instead of hardcoding approximations.
   - Respect Java signed integer/byte semantics (`s8`, `s16`, `Math.trunc` integer division) and MIDP 2.0 `Graphics` anchors, clipping, and 8 `Sprite.TRANS_*` transforms.
3. **Cite decompiled Java evidence**:
   - Add concise comments (`// Port of <Class>.java:<lines>`) on ported rendering passes, map/table decoders, state transitions, and combat/economy formulas.
4. **Follow the full guide & skill**:
   - Read `docs/J2ME_DECOMPILE_FIDELITY_GUIDE.md` and `.agents/skills/j2me-reverse-and-web-port/SKILL.md` before starting a new game port or major parity fix.
5. **Never modify `games/<slug>/original/*.jar`** and always verify with `node --check`, `node --test`, and `python3 tools/build-portal.py` before pushing.
