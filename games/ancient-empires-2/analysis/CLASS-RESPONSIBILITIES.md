# Ancient Empires II — class responsibilities and evidence map

## Evidence and confidence

- **Observed** means directly present in CFR 0.152 output or a recovered resource.
- **Cross-checked** means the relevant control flow or arithmetic was checked against `bytecode-evidence/<Class>.javap.txt`.
- Decompiled names are obfuscated and CFR reports duplicate member names. Field meanings below are not promoted to semantic names unless the read/write behavior establishes them.
- Vineflower output is unavailable in this checkout. `analysis/README.md` records a Procyon cross-check performed outside the repository, but that output is not available for local line-by-line review. `i.run()` in CFR is marked structurally ambiguous and is not used as a gameplay loop.
- No FreeJ2ME reference captures are present. Source-derived rendering order does not by itself prove pixel parity.

## Class roles

| Class | Evidence-based responsibility | Evidence |
|---|---|---|
| `a` | Base screen/component hooks, viewport dimensions, language string loading/substitution and text wrapping. | `decompiled-cfr/a.java:17-39,41-78,103-162` |
| `b` | MIDlet lifecycle; constructs the Canvas once and stops it on destroy. | `decompiled-cfr/b.java:12-33` |
| `c` | Unit entity and unit-data reader; holds per-unit fields, movement/path/range routines, terrain-adjusted values, damage/experience arithmetic and unit drawing. | `decompiled-cfr/c.java:63-115,127-199,228-288,294-343,443-486,553-618,628-653` |
| `d` | Screen controls, list/dialog/panel construction, map widget and UI drawing/input behavior. | `decompiled-cfr/d.java:129-250,424-454,523-825,901-1365` |
| `e` | Full-screen Canvas, key mask translation, 50 ms-ish game-thread cadence, paint routing, RecordStore wrappers, MIDI and `/1.pak` indexed-resource reader. | `decompiled-cfr/e.java:38-95,109-153,252-312,360-408,429-475,574-610` |
| `f` | Sprite metadata reader, image-sheet slicing, animation frame lists, per-frame offsets, sprite draw/tick and transient effects. | `decompiled-cfr/f.java:48-141,162-205,208-286,339-438` |
| `g` | Battle presentation and effects; terrain/unit display-name arrays and battle animation/draw phases. Not the strategic rules authority. | `decompiled-cfr/g.java:12-16,65-204,219-522,524-800,802-840` |
| `h` | Image and image-region wrapper; applies frame offsets/anchors, MIDP transform flags, `drawRegion`, image loading, and optional PNG palette conversion. | `decompiled-cfr/h.java:25-62,64-121,123-217` |
| `i` | Strategic controller: resource initialization, map/unit loading, strategic render/input, turn/update and AI logic, save data, campaign scripts, combat orchestration, and legacy network service code. | `decompiled-cfr/i.java:370-522,1826-1986,2123-2728,2907-2948,3180-3410,3533-3589,3774-4260,4379-6088,6128-6288,6413-6511` |

## Lifecycle and update/state dispatch

1. `b.startApp()` creates `e`; `e` installs itself as the current Canvas, starts a thread, constructs `i`, calls `i.b()` for initialization, and then repeatedly calls `i.c()` while shown. `e` sleeps to maintain a nominal 65 ms loop budget; `i.c()` advances its own clock by 50 units per invocation. **Observed:** `b.java:17-30`, `e.java:79-95,429-475`, `i.java:2123-2155`.
2. In `i.c()`, the byte field used for the high-level display mode dispatches value `2` to battle update `w()`, `3` to intro/text update `m()`, `0` to startup update `k()`, and otherwise runs strategic logic (`s()` and further state/input processing). **Cross-checked control flow:** `i.java:2123-2155` and `bytecode-evidence/i.javap.txt` method body for `c()`.
3. Within the strategic controller, another byte state branches on values including map cursor/select/move/action, battle, capture, defeat/victory, and menu/progression transitions. Distinct switch and state branches are present, but the obfuscated fields are not globally assigned semantic labels. Specific input branches are cited below; do not infer a single clean enum from numeric values used in different fields.
4. `i.s()` runs scenario-script branches using a progress field and large numeric switch sequences. They include dialogue, scripted unit placements/movement, and condition waits. **Observed, field identity not fully resolved:** `i.java:4554-6088` (especially `4643-4868`, `4869-5034`). Do not claim full campaign/unlock equivalence based only on the current browser story screens.
5. `i.run()` is a separate legacy HTTP POST/network-response routine, not the main update loop. CFR reports it could not fully structure this method. The browser build must remain offline and must not reproduce the score/content requests. **Observed:** `i.java:6413-6511`; `decompiled-cfr/summary.txt`.

## Original binary data formats

### Map resources (`m0`–`m7`, `s0`–`s11`)

`i.b(int)` reads big-endian signed 32-bit width and height, then `width × height` signed bytes with x outermost and y innermost. It next reads a count and skips that many 32-bit values, then reads a unit count followed by records of unsigned encoded-type byte plus signed-short pixel x/y. It divides pixel positions by 24 using Java integer division; unit type is encoded type `% 12` and a player lookup uses `1 + encodedType / 12`. **Observed and checked against raw map decoder:** `i.java:1826-1942`; `analysis/tools/decode_maps.py:11-67`.

The skipped 32-bit section is opaque in this evidence. It is **not verified as an owner map**. Keep it as raw skipped metadata. The source tile arrays are x-major; the inspectable JSON conversion may choose a view orientation only if the transform is explicit and tested. `i.a(x,y)` retrieves the property byte from the loaded table using the map tile ID (`i.java:3521-3523`); the property names remain presentation labels, not Java-authenticated symbols.

### Unit table (`units.bin`)

`c.a(i)` reads 12 records, each in this order: six signed bytes, one signed short, a byte count followed by signed-byte pairs, then a byte count followed by bit indices accumulated into a short bitmask. `analysis/tools/decode_units.py` preserves raw record fields and mask bits. **Observed/read-order cross-check:** `c.java:628-652` and `bytecode-evidence/c.javap.txt`. The raw field names are not independently authenticated meanings; only use derived meanings where class operations and call sites establish them.

### Terrain properties (`tiles0.prop`)

The controller reads a signed-short count, consumes another signed short, then reads `count` signed bytes (`i.java:418-425`). The analysis decoder retains the table and trailer bytes. `i.a(int,int)` maps a raw tile ID through this property table (`i.java:3666-3668` in the related lookup path; verify the exact overload at use). A readable terrain name is a presentation label, not a recovered Java symbol.

### Sprite metadata (`<name>.sprite`) and image frames

`f` reads a one-byte frame count, one-byte width and height, then one (source-frame index, transform-flag) byte pair per frame. Source sheet frames are generated row-major using the frame dimensions if the sheet loads; if not, separate numbered images are attempted. An optional byte adjusts frame anchors. A following optional sequence table reads a sequence count, a duration byte multiplied by 50, and length-prefixed frame-index sequences. Remaining per-frame x/y offsets are signed bytes and are applied through `h`. **Observed:** `f.java:66-141`; transform mapping and anchor offset handling are in `h.java:34-62,72-120`.

The existence and consumption of optional sections are observed; their full format semantics are not independently named. Do not invent missing metadata. Individual original resource `.sprite` files are binary, not text. Use the recovered bytes directly and test exact parsing/trailing data.

### Pack and language resources

`e.b(String)` reads `/1.pak`: a signed-short base offset and resource count, followed by modified-UTF names, 32-bit relative offsets, and signed-short sizes; it then loads each payload (`e.java:574-597`). The static extractor validates boundaries and paths but decodes names as UTF-8; the observed archive names are ASCII. The language reader loads an int count and `readUTF()` strings (`a.java:103-113`).

## Source-derived mechanics and formulas

- **Terrain movement cost:** `c` uses movement-mask bits and terrain properties, special-cases unit type 11 for property 4, otherwise returns a lookup cost; out-of-bounds costs 10000. **Observed:** `c.java:443-486`. The lookup table is `i.g` at `i.java:158`; its numeric entries are preserved as loaded source constants. Do not replace with generic costs or infer names for mask bits.
- **Damage and experience:** the attacker-side value is a source lookup `e.a(attacker.d, attacker.e)` plus `attacker.a(defender)`; the comparison value is defender `f + defender.b(attacker)`. The difference is multiplied by an attacker integer field and Java-divided by 100, clamped to `[0, defender.g]`, subtracted from the defender field `g`, and `attacker.a()` multiplied by damage is added to attacker integer field `a`. **Observed and bytecode-cross-checked:** `c.java:166-177`, `bytecode-evidence/c.javap.txt` method `c(c)` (division opcode `idiv`). Do not label these fields HP/strength/experience without further descriptor/call-site proof.
- **Turn advance/income:** `i.o()` saves current cursor position, increments the turn counter, advances player index modulo player count, recursively skips entries with mode value 2, resets selected action flags, and totals owned cells using property 8 at 30 and property 9 at 50 before adding the total to a player-indexed value. **Observed:** `i.java:3533-3589`; specific scan and amounts at `3559-3574`.
- **Strategic AI:** `i.q()` chooses queued units/targets and creates actions; `i.e(c)` builds candidate rows and scores unit/property actions with distance, tactical counts, terrain and objective bonuses. The source is extensive and contains obfuscated duplicate fields. **Observed algorithm, not reimplemented merely by naming its result “CPU”:** `i.java:3774-4260` (AI target/action selection and score helper continues through `4342`). Exact field semantics remain partial.
- **Battle:** `i.b(c,c)` prepares the two battle presentation instances, checks a source-defined adjacency/attack condition, and sets strategic state 2. `i.c()` state 13 sequences first strike, delay, a conditional counter-strike, and finalization. **Observed:** `i.java:6128-6152`, `i.java:2358-2407`; battle presentation logic is in `g.java`.
- **Capture/property actions:** predicates test unit capability bits, terrain properties 8/9 and encoded team. The confirmation branch updates a tile byte or encoded property data and clears the unit's action state. **Observed behavior, some CFR member identities ambiguous:** `i.java:3591-3600,3783-3824`. Keep raw names/values until bytecode maps them.

## Rendering and input

- `i.b(Graphics)` derives visible tile bounds from camera offsets, draws tile sprites on a 24-pixel grid, applies a clipped cached overlay, and draws tile 28 when the tile below has property 9. **Observed:** `i.java:2907-2948`.
- `i.a(Graphics)` routes splash/loading/scenario/map states. The strategic map path draws terrain first, then transient/dead/unit layers, health/status values, movement route/cursor and HUD overlays with clipping. **Observed:** `i.java:3180-3410`.
- `h.a(Graphics,...)` sends original source-region rectangle, transform, destination, and anchor directly to MIDP `drawRegion`; untransformed whole images use `drawImage`. `h` maps stored metadata flags to transform values at `h.java:34-62`. Anchor corrections and frame offsets are at `h.java:72-120`. The JS adapter must implement MIDP anchor and transform rules rather than relying on Phaser defaults.
- `e.getGameAction()` maps numeric keys and softkeys to masks; cursor input masks 1/2/4/8 adjust map coordinates at intervals, movement confirmation mask 16 uses the computed movement field, mask 32 toggles the current-unit marker, and masks 16/softkey dispatch action menus. **Observed:** `e.java:252-311,360-408`; `i.java:2584-2728`.
- No `pointerPressed` override was found in `e` or `i`; pointer/touch use in the web version is an adaptation to the browser, not an original input behavior claim.

## Current web-port scope and unresolved items

The existing `web-port/game.js` and `strategy-core.js` contain a reconstruction: hardcoded display labels, selected frame/display sizes, movement/attack ranges, HP/damage, CPU actions, and simplified story/HUD paths. Those choices are **not Java evidence** and must not be reused as source truth without independent verification. The existing port loads a subset of the original artwork and does not yet parse `.sprite` metadata in the browser or port the original strategic paint/update pipeline.

Unresolved before claiming a complete 1:1 port:

1. Complete semantic mapping for obfuscated controller/unit fields, particularly campaign progression, team/player metadata, unit status bits, and all action branches.
2. Full source-faithful AI translation and unit recruitment/capture interactions; numeric selection behavior in `i.q()` and `i.e(c)` must be retained, not replaced with a heuristic.
3. The complete intended semantics of optional `.sprite` bytes and visual effects; the read order is known, but no Java ME visual oracle is present.
4. Pixel-level match against FreeJ2ME or original-device screenshots. No reference screenshots were located in this checkout.
5. Browser persistence should not pretend to reproduce Java ME RMS save-record compatibility until the save format is implemented from `i.java:655-780` and its ambiguous fields have been resolved.

When bytecode does not resolve a required behavior, label it `CHƯA XÁC MINH` in analysis and stop before implementing a guessed replacement. A passing structural parity gate is not proof of 1:1 visual or behavioral parity.
