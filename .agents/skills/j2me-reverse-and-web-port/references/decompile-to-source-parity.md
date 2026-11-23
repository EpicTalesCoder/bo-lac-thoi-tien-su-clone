# Decompile-to-Source Parity Reference (Java MIDP 2.0 → JS/Canvas)

Use this reference whenever translating decompiled J2ME classes (`decompiled-vineflower/`, `decompiled-cfr/`, `bytecode-evidence/`) into `games/<slug>/web-port/`.

## 1. Mandatory Pre-Code Evidence Audit
Before writing or editing `web-port/*.js` for a J2ME game, verify these 4 artifacts exist and are non-empty:
1. `analysis/decompiled-vineflower/*.java` (primary readable control flow)
2. `analysis/decompiled-cfr/*.java` (cross-check for obfuscated switches/loops)
3. `analysis/bytecode-evidence/*.javap.txt` (each file > 100 bytes; ground truth for casts & bit ops)
4. `analysis/CLASS-RESPONSIBILITIES.md` (maps every obfuscated class + `gameState` enum + binary resource format)

If any of these are missing, generate them FIRST before writing game code.

## 2. Exact Java → JavaScript Translation Helpers

```js
// Signed / unsigned integer conversions matching JVM semantics
export const s8  = (v) => ((v & 0xff) > 127 ? (v & 0xff) - 256 : (v & 0xff));
export const u8  = (v) => v & 0xff;
export const s16 = (v) => ((v & 0xffff) > 32767 ? (v & 0xffff) - 65536 : (v & 0xffff));
export const u16 = (v) => v & 0xffff;
export const s32 = (v) => v | 0;
export const idiv = (a, b) => Math.trunc(a / b); // Java `/` truncates toward 0!

// Exact MIDP 2.0 Graphics.drawImage / drawRegion anchor & 8 Sprite.TRANS_* modes
export function drawRegionMIDP(ctx, img, sx, sy, sw, sh, transform, x, y, anchor = 20) {
  const rotated = (transform & 4) !== 0; // TRANS_ROT90/270/MIRROR_ROT90/270 swap w & h
  const dw = rotated ? sh : sw;
  const dh = rotated ? sw : sh;
  let dx = x;
  let dy = y;
  if (anchor & 1) dx -= dw >> 1;       // HCENTER
  else if (anchor & 8) dx -= dw;       // RIGHT
  if (anchor & 2) dy -= dh >> 1;       // VCENTER
  else if (anchor & 32) dy -= dh;      // BOTTOM

  if (transform === 0) {
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, sw, sh);
    return;
  }
  ctx.save();
  ctx.translate(dx + dw / 2, dy + dh / 2);
  // Apply exact MIDP 2.0 transform matrix
  if (transform === 2) ctx.scale(-1, 1);                             // TRANS_MIRROR
  else if (transform === 3) ctx.rotate(Math.PI);                     // TRANS_ROT180
  else if (transform === 1) ctx.scale(1, -1);                        // TRANS_MIRROR_ROT180
  else if (transform === 5) ctx.rotate(Math.PI / 2);                 // TRANS_ROT90
  else if (transform === 6) ctx.rotate(-Math.PI / 2);                // TRANS_ROT270
  else if (transform === 7) { ctx.rotate(Math.PI / 2); ctx.scale(-1, 1); }  // TRANS_MIRROR_ROT90
  else if (transform === 4) { ctx.rotate(-Math.PI / 2); ctx.scale(-1, 1); } // TRANS_MIRROR_ROT270
  ctx.drawImage(img, sx, sy, sw, sh, -sw / 2, -sh / 2, sw, sh);
  ctx.restore();
}
```

## 3. Common J2ME Binary Format Patterns
- **Gameloft Split Packs (`5`, `5.1`, `5.2`, ...)**: Concatenate chunks in numerical order into a single `Uint8Array`, then parse the pack header offset table (`count`, `offsets[count+1]`).
- **Gameloft BSprite**: Decode `modules` (rect or indexed-color raw pixels + `nPalettes` ARGB/RGB565 palettes), `fmodules` (`moduleIdx, ox, oy, flags`), `frames`, `aframes` (`frameIdx, time, ox, oy, flags`), `anims`. Never replace BSprite decoding with uniform grid slicing.
- **Macrospace / Ancient Empires (`.sprite` + `.m`)**: Parse `.sprite` for frame width/height/count/offsets and `.m` for map dimensions, terrain grid, and initial unit/building spawns. Port exact combat formulas (terrain defense bonus, attack min/max, counter-attack, capture) directly from the decompiled Java class.
- **HandyGames Flat Table Packs (`/a`, `/ma`, `/pi0`, `/pi9`)**: Preserve exact table offsets (`mo[...]`, `fo[...]`) and composite/leaf draw order from `f.java`.

## 4. Citation Discipline in Ported Code
Every core ported function (rendering layer, map loader, damage formula, AI loop, state transition) MUST include a short source comment pointing to the decompiled Java evidence:
```js
// Exact port of b.java:2636-2642 (lured child runs toward enemy lurer using anim 6)
```
This lets any collaborator or future agent immediately diff JS behavior against the original Java bytecode when fixing bugs.
