# Bo lac thoi tien su (MIDlet) analysis

## Input

- Original archive: `Bolacthoitiensu.jar` (preserved, not modified)
- SHA-256: `56b371ba36750028321933d7fedaabbb20b161cd0d35b9c7497d2631f9a53735`
- Manifest: MIDlet `tribes`, version `0.1.28`, MIDP-2.0 / CLDC-1.0.
- The manifest does not record a device resolution. Decompiled layout/resource-loader code does establish a 240-pixel-wide game layout and 320-pixel screen coordinate range: `e.java:94-98` has 240-wide UI layers and a 320 coordinate, while `f.java:775-776, 801-802, 2829-2858` uses 240/320 drawing bounds. `d.java:41` clears a 240x321 splash area. This supports a 240x320 target profile, but does not establish a physical handset/canvas resolution because both canvases use fullscreen mode and no runtime device was tested.
- Eight class files, all classfile 45.3 (pre-generics Java bytecode), with obfuscated single-letter class names. The archive has 39 files (8 classes, 31 non-class files), 864,902 uncompressed bytes, and SHA-256 recorded above.

## Outputs

- `recovered/`: extracted archive contents, including the original class files and game assets. The archive itself remains unchanged.
- `decompiled-cfr/`: primary CFR 0.152 Java reconstruction.
- `decompiled-procyon/`: independent Procyon 0.6.0 reconstruction for comparison and control-flow gaps.
- `decompiled-cfr-renamed/`: CFR output with duplicate members renamed; names are tool-invented and are not original identifiers.
- `decoded-assets/`: verified PNGs and literal locale string tables; `map-sprites/manifest.json` records a structurally exact parse of resource `a`, but none of its 312 opaque records were identified as images.
- `bytecode-evidence/`: `javap -p -c -s` disassembly of all eight classes.
- `tool-downloads/`: isolated CFR, Procyon, Temurin JDK and static extraction helper files.

CFR produced Java source for all eight classes (13,450 lines); Procyon also produced all eight classes (14,194 lines). These are decompiler reconstructions, not the original source. Comments, variable and member names, some control-flow structure, and build metadata cannot generally be recovered exactly from obfuscated compiled bytecode.

CFR's summary reports two methods it cannot fully structure: `b.Z()` and `f.a(int,int,boolean,boolean)`. Procyon does reconstruct these methods, and a comparison against their raw `javap` disassembly found the represented branches and loop structure consistent. This increases confidence in control flow, not in inferred names or behavior; neither decompiler can establish semantic equivalence without a compatible runtime and controlled comparison.

The JAR uses MIDP/CLDC APIs absent from a standard desktop JDK, so these files are not expected to compile directly as a desktop application. This is static reverse engineering only; the game was not executed.

## Next analysis steps

1. Compare the two decompilers method by method; preserve raw `javap -c -p` output for any ambiguous control-flow region.
2. Map obfuscated classes and resource blobs to game subsystems using call sites, strings, image dimensions, and asset references; label inferred names as hypotheses.
3. Identify and decode proprietary data containers (`a`, `l0`/`l1`/`l2`, `ma`, `pd0`, `pi0`/`pi8`/`pi9`) from their readers in the Java classes, preserving original data alongside decoded copies.
4. Validate the requested 240x320 profile and gameplay behavior in a legally obtained MIDP emulator/runtime, if available, without modifying the original JAR.
5. If reconstructing a buildable project is required, supply compatible MIDP/CLDC API stubs or an authorized SDK, then compare class/resource inventories and controlled behavior; exact original source recovery is not a realistic bytecode-only guarantee.
