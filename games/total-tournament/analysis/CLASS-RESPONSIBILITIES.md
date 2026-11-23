# Total Tournament — class responsibilities and source facts

## Evidence and scope

Stage 1 is grounded in the unchanged `original/total-tournament.jar`, its extracted resources, Vineflower/CFR output, and freshly regenerated `javap -c -p -v` dumps. Source-backed mechanics and data layouts below are findings; any game behavior still absent from the web port is explicitly marked **CHƯA XÁC MINH / not ported**, not replaced with invented mechanics.

The pre-existing web-port contained a procedural top-down shooter with invented arena, weapons, timers, AI, movement, and combat. Those were not present in the JAR's source semantics and have been removed from the simulation implementation before continuing. Current gameplay remains incomplete; this file does not claim source parity.

## Class responsibilities

| Class | Observed responsibility | Evidence |
|---|---|---|
| `tr` | MIDlet lifecycle; instantiates engine and attaches display. | `decompiled-vineflower/tr.java`, `bytecode-evidence/tr.javap.txt` |
| `e` | `FullCanvas` and `Runnable`; owns `K` UI state, `t` mode, ten actor rows, level/map, simulation tick, AI, resources, input and painting. | constructor `e.java:212-348`; `paint()` `e.java:2592-2821`; simulation `i()` `e.java:399-1451`; `run()` `e.java:3110-4319` |
| `b` | Reads bundled assets/raw tables, decodes images/text and stores configuration in one RMS record. | `b.java:14-37`, `b.java:39-93`, `b.java:119-146`, `b.java:173-222`, `b.java:289-357`, `b.java:446-475` |
| `a` | Bitmap font metrics, glyph mapping and clipped rendering using `cf` and `fnt.png`. | `a.java:31-52`, `a.java:54-107`, `a.java:109-166` |
| `c` | Localized menu, settings, dialog, level-selection state transitions and rendering. | constructor `c.java:50-217`; confirm `c.java:219-303`; actions `c.java:355-616`; drawing `c.java:804-929`, `c.java:1373-1456` |
| `d` | MIDI/AMR playback coordinator; no such sound bank is bundled. | `d.java`; resource inventory |
| `com.nokia.mid.*`, `com.hellomoto.fullscreen.*` | Platform compatibility APIs and key/fullscreen shims, not game rules. | corresponding source and `javap` files |

## Original screen and mode state

`e.K` is UI/screen state, `e.t` is game mode, and static `e.J` selects menu/gameplay presentation. Keep these separate. Observed transitions include:

| K | Observed role | Evidence |
|---:|---|---|
| 0 | Startup sound-choice dialog. | `c.java:377-391` |
| 1 | Options. | `c.java:392-435` |
| 2 | Options confirmation/subscreen. | `c.java:436-450` |
| 3 | Main menu: new game, options, help, about, exit. | `c.java:451-471`; source text row 3 |
| 4 | Selection/configuration transition with its own source branch. | `c.java:472-498` |
| 5 | Five gameplay modes plus Back; selection 0–4 sets `t` and `K=6..10`. | `c.java:499-531`; source text row 5 |
| 6–10 | Match configuration for modes `t=0..4`, with stat controls and source descriptions. | `c.java:499-531`, renderer `c.java:618-677` and `c.java:804-1456` |
| 19 | Soldier/Mutant/Back character selection after selecting a level. | `e.b(String)` `e.java:4374-4388`; `c.java:552-600`; source text row 4 |
| 11, 12 | Help (`text2`) and About (`text1`). | `e.java:4222-4228`; `c.java:268-273` |
| 13, 14 | Level selection. | `e.java:2281-2290`; `c.java:552-570` |
| 20, 22 | Continuation/pause-related screen transitions. | `c.java:601-613` |
| 15–18, 21, 23–25 | Additional/reused UI paths; exact display semantics depend on source/localization and remain unknown here. | inspect matching `K` branches before porting |

Mode IDs, source labels from `text.png`, and mode configuration values are distinct: `0` Deathmatch, `1` Team Deathmatch, `2` Survival, `3` Capture the Flag, `4` Last Hero. Constructor source sets `F=15`, `H=5`, `I=10`, `D=20`, `E=10`, `G=20` (`e.java:230-235`). These fields are not interchangeable: Deathmatch/team ends at score `F`; Survival ends at a player's death counter `D`; round and CTF completion have their own branches (`e.java:984-1009`). Do not infer undocumented meaning for every field solely from its default.

## Simulation and input evidence

- `run()` uses sleep `cv + 7 ms`, invokes `i()` when the menu/control path permits, then repaints through `l()`; normal rendering budget is 77 ms (`e.java:3110-3190`, `e.java:4202-4302`, `e.java:1532-1546`, constructor `e.java:339`). This is not a browser shooter tick model.
- `i()` advances gravity/jump/fall, tile collision, horizontal velocity, AI, pickups, projectiles, damage, scores, flags, timers and camera; see `e.java:399-1451`. It runs over ten rows, with entity and projectile arrays separately allocated in `e.d()` (`e.java:2917-2925`).
- Key normalization: arrows/softkeys map to key codes 50/56/52/54/53 (`e.java:2217-2253`). During run: 2 jump, 4 left, 5 fire/action, 6 right, 8 drop/down (`e.java:3221-3242`, `e.java:3270-3293`). There is no original pointer/mouse handler.
- Actor data is parallel row storage `ab[entity][28]`; `cu` teams and `af`/`az` AI/animation, `cx` ammo, `cw` weapon ownership, `O` scores/deaths and `cr[20][11]` projectile state are separate. Initialization is in `e.java:212-280`, `e.java:2832-2905`, `e.java:2907-3015`, mode columns in `e.java:4128-4185`.
- Horizontal acceleration is source-method `h()` / `k()`: `bc`-scaled increments, capped by entity row 18 (`e.java:376-397`, `e.java:1505-1526`). Vertical motion, tile collision and jumps are in `i()` (`e.java:399-523`, `e.java:653-903`).
- Weapon firing is `m()` (`e.java:1548-1638`): current actor weapon/ammo and cooldown, a 15-projectile cap, source `cy` cadence table and projectile-kind parameters (`e.java:246-319`). Projectile collision and damage use source rectangles/teams and kind-specific damage (`e.java:1037-1200`); do not substitute hand-authored weapon specs.
- AI updates every 20/300/150-tick intervals and select source branches in `e.java:524-783`. AI target/path semantics are not yet ported.
- Actor initialization uses decoded map spawns/teams, assigns table-driven dimensions/health/speed from `mua` (`e.java:4128-4185`), and calls respawn initializer `h(int)` (`e.java:2832-2905`). Reimplement only after porting the mode-specific branch and matching all source fields.

## Original binary resource formats

All web decoder inputs are byte-identical JAR resources copied to `web-port/jar-resources/`; never type in reconstructed tile IDs or coordinates.

| Resource | Source interpretation | Evidence |
|---|---|---|
| `cu2` | 7-byte records, `short[][] aO`; row 0 intentionally remains zero; signed frame rectangle/offset/image-bank metadata. | `e.java:3734-3748`; renderer `e.java:3059-3087` |
| `ca` | 24-byte per-composite records (`bw=24`), variable row length via first zero triple, except listed rows initialize full-width then still apply the terminator scan; signed bytes; exceptional rows normalize selected third values. | `e.java:4023-4073`, verified against `e.javap.txt` bytecode offsets 5984–6334 |
| `u0`–`u8` | XOR-100 image bytes. Loader creates mirrored second-bank images for `u0`–`u4`. | `b.java:14-37`, `b.java:83-93`; `e.java:2389-2484` |
| `s0`, `s1` | XOR-100 image bytes; UI tables select bank `ccs[6][id]`. | `e.java:1721-1730`, `e.java:2335-2363`, `e.java:3053-3057` |
| `obj0` | 5×5 byte records; loaded bytes normalized unsigned. | `e.java:3749-3766` |
| `ll` | Per-level 9-byte header, an initial set of 3-byte object records terminated by zero triple, fixed 15-byte marker block, spawn records terminated by zero triple, then 3-byte tile-block placements. A placement applies an entire exact 5×5 `obj0` block at `(x,y)`. Grid is `cR[width][height]`. | `e.java:3768-3955`; bytecode scan/loops `e.javap.txt` around 4330–5597 |
| `cc` | 11-byte records copied column-major to `[11][count]`; columns 0–3 become unsigned; fields provide tile clipping, offsets, image index and collision flags. | `e.java:4093-4122`; tile draw `e.java:2013-2024` |
| `ccs` | 7-byte records copied column-major to `[7][count]`; columns 0–3 unsigned; fields 0–3 define clip size, 4–5 are source-image draw offsets, column 6 chooses `s0`/`s1`. | `e.java:2335-2363`; UI rendering `e.java:3053-3057` |
| `wlg` | 16×6 signed Java byte weapon loadout table. | `e.java:3957-3970` |
| `wpn` | 3-byte records per level, zero-triplet separators, signed weapon code with source switch values 242/243/245/246/247. | `e.java:3972-4019`; corroborate via `e.javap.txt` |
| `mua` | 25-byte records; first field unsigned, remainder retain signed byte values. | `e.java:4076-4091` |
| `cf` / `fnt.png` | Six signed metrics per glyph; glyph mapping and clipping are in `a.java`. | `a.java:40-52`, `a.java:54-107`, `a.java:113-166` |
| `text`, `text1`–`text4` | `text` is localized rows/fields split on `=`/CR/LF; other text uses separate source paths and encoding. | `b.java:173-222`, `b.java:289-357`; source rows also indexed in `analysis/data/strings-ru.txt` |
| `lz` | 3-byte prefix and length `3 + 256*u8(b0) + u8(b1)`; XOR key is `(signed(b2)-3)&255` incremented per byte; decoded image begins at offset 3. | `e.java:3118-3127`; `e.javap.txt` around 20931–20972 |

Source `ll` layout positions are **bytes**, not tile-block coordinates: each three-byte placement is directly an `(x,y,blockId)` location, and all 25 cells of the selected `obj0` block are copied at that same coordinate (`e.java:3927-3955`). Do not expand placement records into a synthetic 5×5 grid of separate blocks.

## Rendering ownership and semantics

- `paint()` order: map/background `a(Graphics,camX,camY)`, props/effects `a(Graphics)`, entities/assembled poses `d(Graphics)`, projectiles `b(Graphics)`, particles `c(Graphics)`, then original HUD/menu (`e.java:2715-2817`).
- `drawImage(...,20)` uses MIDP `TOP|LEFT`; source maps/fonts/UI use `setClip` and restore clip. Canvas clip operations intersect current clipping, so use save/clip/restore per region.
- Map tiles use `cc` and the selected loaded `l0/l1` map image (`e.java:1972-2031`, `e.java:2389-2534`); actor assemblies resolve pose triples through `ca` and frame rectangles through `cu2` (`e.java:1890-1967`). UI uses `ccs` and `s0/s1` (`e.java:3053-3057`). Source does not call `drawRegion`; mirrored actors use pre-mirrored image banks.
- The source does use `fillRect` for backgrounds, bars, menu panels, effects and loading screens. It must not stand in for source tile, actor or UI sprite data.
- Some project specification asks for all eight `drawRegionMIDP` transforms, but this game’s observed `paint()` uses `drawImage`, clips and pre-mirrored banks instead. Do not introduce transforms into this game’s source rendering when they are absent in the Java.

## Current port completion / unresolved work

- Stage 1 class mapping, UI/mode state IDs, key mapping, and binary layout facts are recorded above.
- Stage 2 has browser decoders for source resources, Java text/font handling, MIDP clip/anchor helpers, a canvas paint path, and original asset packaging. Menu iteration, exact platform drawing and map/object layers still need continued validation. Browser smoke currently displays original startup/title/menu assets, not gameplay.
- Stage 3 is **incomplete**: actor/mode initialization, original simulation tick, AI/pathfinding, movement/jumps, weapon/projectile damage, pickups, timers/round/CTF, outcomes, and faithful settings/RMS save are not yet ported. Current `UNVERIFIED` gameplay marker must remain until implementation is directly established from Java+bytecode; the parity gate intentionally fails.
- Live visual reference screenshots from FreeJ2ME have not been captured. Browser success is not a source-vs-emulator visual parity claim.
- Menu/config values, localization paths, remaining `K` state meanings, and every mode outcome require further line-by-line source and bytecode comparison before declaring parity.
