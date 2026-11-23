---
name: j2me-reverse-and-web-port
description: >-
  End-to-end playbook and hard-won lessons for reverse-engineering J2ME (.jar MIDP 2.0) games
  and porting them to native HTML5 Canvas/WebGL + ES Modules + Multiplayer + Discord Activity
  in this monorepo. Use whenever analyzing a new .jar game, decoding binary tables/sprites,
  fixing parity bugs, adding multiplayer/AI, or deploying to Vercel & Discord Activity.
---

# J2ME Reverse Engineering & Native Web Port Playbook

This skill distills practical lessons learned from reverse-engineering and porting J2ME `.jar` games (Prehistoric Tribes, Total Tournament, Green Farm 3) into zero-JVM HTML5 Canvas/WebGL web ports with multiplayer and Discord Activity support.

---

## Golden Rules

1. **Never modify original binaries**: Keep `games/<slug>/original/*.jar` byte-for-byte intact and record SHA-256 hashes in `analysis/ASSETS-SHA256.txt`.
2. **Decode, never guess**: Read maps, sprite tables, animation lengths, building specs, skill offsets, and strings directly from the original binary packs (`/a`, `/ma`, `/pd0`, `/sa`, `EN.*`, etc.).
3. **Verify every claim with bytecode or live tests**: Decompilers drop casts, misread signed bytes, or flatten switches — always cross-check subtle logic against `javap -c -p -v`.
4. **Preserve test invariants**: Keep source `web-port/index.html` clean (e.g. `<script type="module" src="game.js"></script>`) and apply cache-busting `?v=<ts>` only during build in `tools/build-portal.py`.

---

## Step-by-Step Workflow

### Phase 1: Scaffold & Extract Evidence
1. Initialize a new game directory with:
   ```bash
   python3 tools/new-game-port.py <slug> <path/to/game.jar> "<Display Name>"
   ```
2. Decompile with **at least two decompilers** (Vineflower + CFR/Procyon) AND dump bytecode (`javap -c -p -v`) into `analysis/bytecode-evidence/`.
   - **Check non-empty outputs immediately**: verify `.javap.txt` files are not 1-line `'command not found'` errors.
3. Write `analysis/CLASS-RESPONSIBILITIES.md` mapping every obfuscated class (`a`, `b`, `c`, ...) to its subsystem (MIDlet, GameLoop, Renderer, PackReader, Sound, AI).

### Phase 2: Decode Binary Tables & Assets
1. Identify the game's custom pack format (split chunks `5`, `5.1`, `5.2`... or indexed tables `mo[idx]`).
2. **Java Signed Byte Trap**: J2ME `byte` is signed (`-128..127`). Always distinguish:
   - Unsigned index/value: `b & 0xff`
   - Signed delta/offset/bias: `b > 127 ? b - 256 : b` (critical for sprite `dx`/`dy`, negative occupancy codes, and skill biases like `mo[127] = -1`).
3. Dump decoded tables into inspectable JSON (`data-*.json` or `tables.json`) and verify counts/dimensions with a quick Node or Python assertion script before writing gameplay code.
4. Keep sprite sheets crisp:
   - `ctx.imageSmoothingEnabled = false` and `Phaser.Textures.FilterMode.NEAREST`.
   - When generating extra multiplayer faction palettes in software, **skip dark outline pixels (`r+g+b < 75`) and skin-tone pixels** so faces/limbs stay natural, and never override original `pi9` dark-skin palettes with flat tints.

### Phase 3: Simulation Loop & Responsive Input
1. **Fixed-timestep simulation + Background Tab resilience**:
   - Drive the J2ME tick clock (~100–120ms) with an **inline `Blob` Web Worker** + `pauseOnBlur: false` so multiplayer hosts never freeze when switching tabs.
   - Always provide a **native Canvas 2D fallback** if Phaser 3 CDN is blocked (such as inside Discord Activity CSP).
2. **Smooth mouse/pointer performance**:
   - Never call synchronous `draw()` directly inside `pointermove`. Set a dirty flag (`markDirty()`) and render on `requestAnimationFrame`.
3. **Hitboxes & Cursor Parity**:
   - Align tall/overhanging map objects (trees, buildings) so clickable tile hitboxes match the rendered hover cursor 1:1.

### Phase 4: Authentic Gameplay, AI & Polish
1. **Worker Job Persistence (`savedJobs`)**:
   - When a staffed worker (Chef, Blacksmith, DJ, Shaman, Builder) temporarily steps out to fetch materials, eat, sleep, heal, or defend, keep their building marked as staffed (no false `!` alerts) and auto-resume their saved job afterward.
2. **Skill Progression**:
   - Hook **all** work loops (gathering, hunting, building, forging, cooking, DJ, shaman, childcare, real combat) into the original skill table offsets and re-sort the top-skill HUD slots on level-up.
3. **Combat & Training Feedback**:
   - Drive interior building animations (`e[1313]` / `e[3030]`) when training dummies are hit, launch flying projectiles for ranged training/combat, and render crisp pixel-art impact bursts on hit.
4. **Living-Village AI Opponents**:
   - Never let AI suicide-rush its entire population. Reserve a core home workforce (`minHomeReserve = Math.max(4, Math.ceil(adults.length * 0.55))`) for gathering, building, cooking, crafting, training, and reproduction; send only small, capped raid squads (`2–4` armed/trained soldiers).
5. **Natural Lifespan & Survival**:
   - Use gradual age/HP curves (e.g. healthy through 60s, natural old-age mortality rising smoothly across 75–100+ modified by food/mood) instead of abrupt cutoffs.

### Phase 5: Multiplayer & Discord Activity
1. **Multi-Transport + Same-Origin Serverless Relay**:
   - Public non-standard MQTT ports (`8084`/`8884`) are blocked by Discord CSP and strict 4G/5G firewalls; public HTTP relays like `ntfy.sh` can rate-limit or timeout; Vercel Serverless spins up multiple instances concurrently.
   - **Solution**: Run a same-origin `/api/mp` (`api/mp.mjs`, pinned to `regions: ["sin1"]`) that **bridges all Vercel instances server-side via EMQX MQTT**, combined with client-side Dual MQTT-WSS + WebRTC + BroadcastChannel. This works inside Discord Activity through the single `/` root mapping with **zero extra URL Mappings**.
2. **Authoritative Host → Guest Parity**:
   - Pack and sync not only units/buildings/resources, but also `staffedBids`, `builderCounts`, `projectiles`, `hitEffects`, `deathEffects`, and per-tribe notifications (`tribeEvent`: births, deaths, adulthood, chief succession) for **every** active tribe (`0..3`).
   - Always pass explicit `owner` / `tribe` parameters to spawning, breeding, courtship, and preview flag rendering — never hardcode `owner = 0` or `uid > 50`.

### Phase 6: Zero-Cache Build, Verification & Git Hygiene
1. In `vercel.json`:
   - Set `"installCommand": "true"` when the repo contains heavy non-web dev dependencies (`package.json`) so static+API deploys stay ~15s fast.
   - Set `Cache-Control: no-store, no-cache, must-revalidate, max-age=0` + `CDN-Cache-Control: no-store` on `/`, `/games/*/`, and `*.html|js|mjs|css|json` (keep `assets/` immutable).
2. In `tools/build-portal.py`:
   - Stamp `?v=<timestamp>` onto `index.html` script/CSS tags, `games-manifest.json` entry URLs, and all relative ES module imports in `dist/`.
3. **Pre-push checklist**:
   - `node --check` on all modified `.js` / `.mjs` files
   - `node --test games/<slug>/web-port/tests/*.test.mjs`
   - `python3 tools/build-portal.py`
   - Verify no oversized files (>25MB / JDK downloads / emulator capture dumps) are staged.

For detailed bug case studies and concrete code patterns, read:
- [references/decompile-to-source-parity.md](./references/decompile-to-source-parity.md) — exact Java MIDP 2.0 → JS translation helpers (`drawRegionMIDP`, signed byte/short, BSprite/Macrospace/HandyGames pack patterns, citation discipline).
- [references/pitfalls-and-patterns.md](./references/pitfalls-and-patterns.md) — real bugs encountered in this monorepo and their verified fixes.
- [docs/J2ME_DECOMPILE_FIDELITY_GUIDE.md](../../../docs/J2ME_DECOMPILE_FIDELITY_GUIDE.md) — full Vietnamese guide for humans & AI agents.
