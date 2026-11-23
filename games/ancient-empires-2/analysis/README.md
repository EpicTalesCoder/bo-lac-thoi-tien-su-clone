# Ancient Empires II (J2ME) — static analysis

## Input identity

- Original input: `original/ancient-empires-2.jar` (271,319 bytes)
- SHA-256: `98f6af1dd266dec081fe744f0f4298e0125e7ff3beb5b0970ff09f48350ba7f4`
- Manifest: Ancient Empires II 1.0.2, Macrospace, MIDlet entry `b`, CLDC 1.0 / MIDP 1.0.
- Network-related manifest properties advertise legacy Macrospace score upload and content services. Static analysis found HTTP POST code. The web port must not contact these endpoints; no request was made during analysis.
- Nine obfuscated default-package classes (`a`–`i`), classfile version 46.0, plus `lang.dat`, `1.pak` and a 24×24 indexed `gameicon.png`.

## Analysis outputs

- `recovered/`: hash-preserved JAR entries, extracted without running game code.
- `recovered/pack1/`: 237 resources indexed from `1.pak`, including 149 PNGs, 57 `.sprite` records, 9 MIDI files, maps (`m0`–`m7`), skirmish maps (`s0`–`s11`), `units.bin`, and `tiles0.prop`.
- `recovered/pack1/manifest.json`: source and per-resource hashes.
- `ASSETS-SHA256.txt`: SHA-256 of the unchanged original JAR.
- `decompiled-cfr/`: CFR 0.152 output for all nine classes; `summary.txt` notes CFR could not fully structure `i.run()`.
- `bytecode-evidence/all-classes.javap.txt`: JDK 17 `javap -p -c -s` for all nine classes.
- `CLASS-RESPONSIBILITIES.md`: provisional subsystem map with source line references.
- `data/campaign-maps.json`: decoded map/placement facts for all 8 campaign and 12 skirmish maps, retaining raw tile IDs and encoded unit records.
- `data/units.json`: 12 `units.bin` records decoded by `tools/decode_units.py` in the exact byte-read order of `c.a(i)`; fields remain raw-signed and no semantic labels are assigned here.
- `data/terrain-properties.json`: 47 signed per-tile terrain-property bytes from `tiles0.prop`; also preserves its uninterpreted final trailer byte.
- `data/lang-en.json`: all 289 strings in the shipped English language table; `data/campaign-text.json` selects verbatim first-run campaign strings.
- `tools/extract_resource_pack.py`: bounded, path-safe static extractor for the custom indexed resource table. It requires a new, absent output directory and never executes extracted code.
- `tools/decode_maps.py`, `tools/decode_units.py`, `tools/decode_terrain_properties.py`, and `tools/decode_language.py`: deterministic conversions from original binary resources to inspectable JSON. Map grids are emitted in the renderer's row-major view; original x-major source ordering is preserved by the transform.

Procyon 0.6.0 independently decompiled all nine classes during analysis to a temporary directory outside the repository. Its output was compared for control-flow ambiguities; it is not committed as a second 11K-line source tree. CFR and Procyon are reconstructions from obfuscated bytecode, not original source. Class and member names remain obfuscated; `i.run()` was structurally ambiguous in CFR, so inspect bytecode or alternate output before relying on that method.

## REA capability boundary

REA in this checkout has no dedicated Java ME JAR decompiler. Its JADX/JEB integrations do not establish support for this MIDP archive. This analysis used REA’s repository context and existing local static-analysis tools (CFR, Procyon, and `javap`); it did not call a decompiler “through REA.” No game bytecode was executed.

## Static class-role map (provisional)

| Class | Evidence-based role |
|---|---|
| `a` | Shared screen/component base and language/text helpers. |
| `b` | MIDlet lifecycle entry. |
| `c` | Unit model, movement, combat calculations, and unit-data loader. |
| `d` | Menus, dialogs, selection/list controls, and map widgets. |
| `e` | Full-screen Canvas, input dispatch, fixed update/repaint loop, RMS, MIDI, resource index. |
| `f` | Sprite animation, drawing and effects from `.sprite` metadata. |
| `g` | Tactical battle presentation and battle animations. |
| `h` | PNG image/sprite-sheet crop, transform and draw helper. |
| `i` | Main strategic game state, map/unit loading, board input/rendering, turn logic, AI and legacy network services. |

These labels summarize observed call sites and bodies; obfuscation and duplicate member names leave some field semantics uncertain.

## Gameplay facts supported by source

- The original board uses 24×24-pixel tiles; map loading reads grid width and height and then tile bytes (`decompiled-cfr/i.java`, `b(int)`).
- The game is turn-based, with player/CPU configuration, unit movement/action phases, income, and an end-turn flow. Units include the king and multiple tactical units; inspect `g.java`, `c.java`, and `i.java` alongside bytecode for ambiguous rules.
- The archive contains named intro illustrations (`intro0.png`–`intro5.png`), title/splash art, terrain/unit art, sprite metadata and original MIDIs.
- Save/settings use Java ME RecordStore. Online news, downloadable levels, and score-related HTTP code are present in the original. The browser reconstruction will omit remote calls and preserve offline behavior only.

A browser reconstruction is not behaviorally equivalent merely because it renders the original art. Track static source evidence, inferred mappings, reconstructed behavior, and unimplemented areas separately in future notes and in the web port.
