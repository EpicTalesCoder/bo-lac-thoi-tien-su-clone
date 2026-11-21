export let LOGICAL_WIDTH = 240;
export let LOGICAL_HEIGHT = 320;
export const CELL_WIDTH = 22;
export const CELL_HEIGHT = 16;

export function setLogicalViewport(w, h) {
  LOGICAL_WIDTH = Math.max(240, Math.round(w));
  LOGICAL_HEIGHT = Math.max(320, Math.round(h));
}

const HP_BAR_COLORS = ['#ef2b1d', '#f5c724', '#22d422', '#22d422'];

function toSignedByte(v) {
  const b = v & 0xff;
  return b > 127 ? b - 256 : b;
}

export function createImageCache(onLoad) {
  const cache = new Map();
  return {
    get(group, index) {
      const key = `${group}:${index}`;
      let img = cache.get(key);
      if (!img) {
        const folder = group === 1 ? 'pi9' : group === 2 ? 'pi8' : 'pi0';
        img = new Image();
        img.src = `assets/${folder}/${String(index).padStart(2, '0')}.png`;
        if (onLoad) img.onload = onLoad;
        cache.set(key, img);
      }
      return img;
    },
    preloadCoreSheets() {
      for (let i = 0; i < 27; i++) this.get(0, i);
      for (let i = 0; i < 6; i++) this.get(1, i);
    },
  };
}

function buildingOwner(occ) {
  if (occ <= -1 && occ >= -30) return 0;
  if (occ <= -31 && occ >= -60) return 1;
  return 2;
}

function isItemProp(occ) {
  return occ <= -61 && occ >= -110;
}

function resourceGroup(occ) {
  if (occ <= -111 && occ >= -116) return 0;
  if (occ <= -117 && occ >= -122) return 1;
  if (occ === -123) return 3;
  return 2;
}

function isWildAnimal(occ) {
  return occ >= 101 && occ <= 122;
}

function unitOwner(id) {
  return id >= 1 && id <= 50 ? 0 : 1;
}

export function getFogState(data, x, y) {
  const fog = data.fogOfWar;
  if (!fog) return 0;
  const word = x >> 5;
  const bit = x & 31;
  if (word < 0 || word >= fog[0].length || y < 0 || y >= fog[0][word].length) return 2;
  if (((fog[0][word][y] >>> bit) & 1) === 0) return 2;
  if (((fog[1][word][y] >>> bit) & 1) === 0) return 1;
  return 0;
}

export function revealFog(data, cx, cy, radius = 4) {
  const fog = data.fogOfWar;
  if (!fog) return;
  const r2 = radius * radius;
  for (let dy = -radius; dy <= radius; dy++) {
    const y = cy + dy;
    if (y < 0 || y >= data.height) continue;
    for (let dx = -radius; dx <= radius; dx++) {
      const x = cx + dx;
      if (x < 0 || x >= data.width) continue;
      if (dx * dx + dy * dy <= r2) {
        const word = x >> 5;
        const mask = 1 << (x & 31);
        fog[0][word][y] |= mask;
        fog[1][word][y] |= mask;
      }
    }
  }
}

export function drawLeaf(ctx, data, spriteIndex, x, y, imageCache, paletteSwap = -1) {
  if (spriteIndex <= 0) return;
  const bytes = data.byteSpriteTables;
  if (spriteIndex >= bytes[20].length) return;

  let sheetIndex = bytes[20][spriteIndex] & 0x1f;
  const sx = bytes[21][spriteIndex] & 0x7f;
  const sy = bytes[22][spriteIndex] & 0xff;
  const sw = bytes[23][spriteIndex] & 0xff;
  const sh = bytes[24][spriteIndex] & 0xff;

  if (sheetIndex < 27) {
    let useAltGroup = false;
    if (paletteSwap > -1) {
      if (paletteSwap === 0) {
        if (sheetIndex === 5) {
          sheetIndex = 0;
          useAltGroup = true;
        }
      } else if (paletteSwap === 4) {
        if (sheetIndex === 14) {
          sheetIndex = 4;
          useAltGroup = true;
        } else if (sheetIndex === 15) {
          sheetIndex = 5;
          useAltGroup = true;
        }
      } else if (sheetIndex === 9) {
        sheetIndex = paletteSwap;
        useAltGroup = true;
      }
    }
    const img = imageCache.get(useAltGroup ? 1 : 0, sheetIndex);
    if (!img.complete || !img.naturalWidth) return;
    if (sw <= 0 || sh <= 0 || sx >= img.naturalWidth || sy >= img.naturalHeight) return;
    const cw = Math.min(sw, img.naturalWidth - sx);
    const ch = Math.min(sh, img.naturalHeight - sy);
    if (cw > 0 && ch > 0) {
      ctx.drawImage(img, sx, sy, cw, ch, x, y, cw, ch);
    }
    return;
  }

  const colorIdx = ((bytes[20][spriteIndex] & 0xff) >>> 5) | ((bytes[21][spriteIndex] & 0x80) >>> 4);
  const rgb = bytes[17];
  const r = rgb[colorIdx * 3] & 0xff;
  const g = rgb[colorIdx * 3 + 1] & 0xff;
  const b = rgb[colorIdx * 3 + 2] & 0xff;
  const color = `rgb(${r},${g},${b})`;

  if (sheetIndex === 27) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + sx + 0.5, y + sy + 0.5);
    ctx.lineTo(x + sw + 0.5, y + sh + 0.5);
    ctx.stroke();
  } else if (sheetIndex === 28) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + sx + 0.5, y + sy + 0.5, sw, sh);
  } else if (sheetIndex === 29) {
    ctx.fillStyle = color;
    ctx.fillRect(x + sx, y + sy, sw, sh);
  } else if (sheetIndex === 30) {
    ctx.fillStyle = color;
    ctx.fillRect(x + sx * 4, y + sy * 4, sw * 4, sh * 4);
  }
}

export function drawComposite(ctx, data, compositeIndex, x, y, imageCache, paletteSwap = -1, depth = 0) {
  if (compositeIndex < 0 || depth > 8) return;
  const shorts = data.shortSpriteTables;
  const bytes = data.byteSpriteTables;
  if (compositeIndex >= shorts[9].length || compositeIndex >= bytes[16].length) return;

  const packed = shorts[9][compositeIndex] & 0xffff;
  const start = packed & 0x1fff;
  const underlay = (packed >>> 14) & 3;
  const count = bytes[16][compositeIndex] & 0x3f;

  if (underlay !== 0) {
    drawLeaf(ctx, data, (underlay - 1) * 3 + 1, x, y, imageCache, paletteSwap);
  }
  for (let i = start; i < start + count; i++) {
    if (i >= shorts[10].length) break;
    const raw = shorts[10][i] & 0xffff;
    const sprite = raw & 0x1fff;
    const dx = toSignedByte(bytes[18][i]) + (((raw & 0xc000) >>> 14) << 7);
    const dy = toSignedByte(bytes[19][i]);
    if (((raw & 0x2000) >>> 13) === 0) {
      drawLeaf(ctx, data, sprite, x + dx, y + dy, imageCache, paletteSwap);
    } else {
      drawComposite(ctx, data, sprite, x + dx, y + dy, imageCache, paletteSwap, depth + 1);
    }
  }
}

export function drawAnimation(ctx, data, animId, x, y, frame, imageCache, paletteSwap = -1) {
  const shorts = data.shortSpriteTables;
  const bytes = data.byteSpriteTables;
  if (animId < 0 || animId >= bytes[9].length) return;
  const len = bytes[9][animId] & 0xff;
  if (len <= 0) return;
  const f = ((frame % len) + len) % len;
  const slot = shorts[5][animId] + f;
  if (slot < 0 || slot >= shorts[6].length) return;
  drawComposite(
    ctx,
    data,
    shorts[6][slot] & 0xffff,
    x + toSignedByte(bytes[10][slot]),
    y + toSignedByte(bytes[11][slot]),
    imageCache,
    paletteSwap
  );
}

function drawMapObject(ctx, data, n, layer, ah, ai, camX, camY, originY, animTick, imageCache, uiState) {
  const shorts = data.shortSpriteTables;
  const bytes = data.byteSpriteTables;
  const e = data.entityData;
  const m = data.mapTableData;
  const mo = data.mapTableOffsets;

  let n9 = -n;
  let n8 = 0;
  let n7 = 0;
  let n6 = 0;
  let n5 = 0;
  let drawX = ah * CELL_WIDTH;
  let drawY = originY + ai * CELL_HEIGHT;
  let startIdx = 0;
  let partCount = 0;
  const slots = new Array(8).fill(0);
  const flagI = new Array(8).fill(0);
  const flagH = new Array(8).fill(0);

  if (buildingOwner(n) !== 2) {
    n8 = e[8749 + n9];
    const bWidth = m[mo[138] + 104 + n8];
    n7 = e[9115 + n9];
    n6 = ah + camX - e[8383 + n9];
    n5 = ai + camY - e[8444 + n9];
    drawX -= n6 * CELL_WIDTH;
    drawY -= n5 * CELL_HEIGHT;
    startIdx = shorts[0][n8 + 1];
    partCount = bytes[0][n8 + 1] & 0xff;

    if (layer === 0) {
      let cellCounter = 0;
      const targetCell = bWidth * n5 + n6;
      while (partCount > 0) {
        if (((bytes[3][startIdx] & 0xff) >>> 6) === 0) {
          if (cellCounter === targetCell) break;
          cellCounter++;
        }
        if ((bytes[3][startIdx] & 7) === 0) {
          startIdx++;
          partCount--;
          continue;
        }
        break;
      }
    } else {
      let u = e[8993 + n9];
      let guard = 0;
      while (u > 0 && guard++ < 16) {
        const slotIdx = e[4646 + u];
        if (slotIdx >= 0 && slotIdx < 8) slots[slotIdx] = u;
        u = e[4545 + u];
      }
    }
  } else if (isItemProp(n)) {
    n9 -= 61;
    n8 = e[9833 + n9];
    n7 = e[9933 + n9];
    startIdx = shorts[0][n8 + 26];
    partCount = bytes[0][n8 + 26] & 0xff;
  } else if (resourceGroup(n) !== 2) {
    if (resourceGroup(n) !== 3) {
      const cellVal = data.occupancy[ai + camY][ah + camX];
      slots[0] = cellVal;
      if (resourceGroup(cellVal) !== 2) {
        if (resourceGroup(cellVal) === 1) layer = -1;
        n8 = 20 - (cellVal + 111);
        n7 = 1;
      } else if (cellVal > 0 && resourceGroup(e[4545 + cellVal]) !== 2) {
        n8 = 20 - (e[4545 + cellVal] + 111);
        n7 = 2;
      }
      while (n8 > 22) n8 -= 3;
    } else {
      n8 = 23;
      n7 = 0;
    }
    startIdx = shorts[0][n8 + 1];
    partCount = bytes[0][n8 + 1] & 0xff;
    n9 = 0;
  } else if (n >= 180) {
    n8 = n - 180 + 34;
    if (n8 < 0 || n8 >= shorts[0].length) return;
    startIdx = shorts[0][n8];
    partCount = bytes[0][n8] & 0xff;
    n7 = 0;
    n9 = 0;
  } else {
    return;
  }

  if (layer === 0) {
    let idx = startIdx;
    let safety = 0;
    while (idx < shorts[1].length && safety++ < 64) {
      const stageReq = (bytes[3][idx] & 0xff) >>> 6;
      if (stageReq <= n7) {
        drawComposite(
          ctx,
          data,
          shorts[1][idx] & 0xfff,
          (ah - n6) * CELL_WIDTH + toSignedByte(bytes[1][idx]),
          originY + (ai - n5) * CELL_HEIGHT + toSignedByte(bytes[2][idx]),
          imageCache
        );
      }
      idx++;
      if (idx >= bytes[3].length) break;
      if ((bytes[3][idx] & 7) !== 0 || ((bytes[3][idx] & 0xff) >>> 6) === 0) break;
    }
    return;
  }

  let idx = startIdx;
  let resCounter = 0;
  for (let i = 0; i < partCount && idx < shorts[1].length; i++, idx++) {
    const kind = bytes[3][idx] & 7;
    const slotId = (bytes[3][idx] & 0x3f) >>> 3;
    const stageReq = (bytes[3][idx] & 0xff) >>> 6;
    const unitInSlot = slots[slotId] || 0;
    const xHi = ((shorts[1][idx] & 0xc000) >>> 14) << 7;
    const px = drawX + toSignedByte(bytes[1][idx]) + xHi;
    const py = drawY + toSignedByte(bytes[2][idx]);

    if (kind === 1 && stageReq <= n7) {
      if (n8 === 6 && resCounter < 5) {
        // Exact port of f.java:1063-1072 using mo[142] = [25(weapons), 2(stone), 1(wood), 3(bones), 4(special)]:
        // Only draw each pile when that exact resource > 0, scaling strictly from lvl 0 (small) to lvl 4 (full)!
        const resOwner = n9 > 30 ? 1 : 0;
        const resArr = data.resources?.[resOwner] || [];
        const weaponsAmt =
          (resArr[5] || 0) +
          (resArr[6] || 0) +
          (resArr[7] || 0) +
          (resArr[8] || 0) +
          (resArr[9] || 0) +
          (resArr[10] || 0);
        const resSlotMap = [
          weaponsAmt,       // U=0 (comp 1248..1252): Crafted weapons (res[5..10])
          resArr[2] || 0,   // U=1 (comp 1253..1257): Stone (res[2])
          resArr[1] || 0,   // U=2 (comp 1258..1262): Wood (res[1])
          resArr[3] || 0,   // U=3 (comp 1263..1267): Bones/Tools (res[3])
          resArr[4] || 0,   // U=4 (comp 1268..1272): Special/Extra (res[4])
        ];
        const amt = resSlotMap[resCounter] || 0;
        if (amt > 0) {
          const step = resCounter === 0 ? 3 : 10;
          const lvl = Math.min(4, Math.floor((amt - 1) / step));
          drawComposite(ctx, data, (shorts[1][idx] & 0xfff) + lvl, px, py, imageCache);
        }
        resCounter++;
      } else if (n8 === 4 && resCounter < 1) {
        if (n9 >= 31) {
          drawComposite(ctx, data, (shorts[1][idx] & 0xfff) + 2, px, py, imageCache);
        } else {
          const food = data.resources?.[0]?.[0] || 0;
          if (food >= 5) {
            const lvl = food > 35 ? 2 : Math.floor((food - 5) / 15);
            drawComposite(ctx, data, (shorts[1][idx] & 0xfff) + lvl, px, py, imageCache);
          }
        }
        resCounter++;
      } else {
        drawComposite(ctx, data, shorts[1][idx] & 0xfff, px, py, imageCache);
      }
    } else if ((kind === 2 || kind === 4 || kind === 6) && layer !== 2) {
      if (stageReq === 0 || stageReq <= n7) {
        let animId = shorts[1][idx] & 0xfff;
        let frame = animTick;
        let shouldDraw = false;
        if (kind === 6) {
          frame = (animTick + camY + ai + idx * 2) % 120;
          if (slotId === 1 || (slotId === 2 && (e[8627 + n9] === 1 || e[8627 + n9] === 2))) {
            if (n9 >= 31) animId++;
            shouldDraw = true;
          } else if (slotId !== 2) {
            shouldDraw = true;
          }
        } else if (kind === 2 && (e[1313 + unitInSlot] <= 0 || e[1313 + unitInSlot] >= 50)) {
          shouldDraw = true;
          if (e[1313 + unitInSlot] === 51) flagI[slotId] = 1;
        } else if (
          kind === 4 &&
          flagI[slotId] === 0 &&
          e[1313 + unitInSlot] >= 1 &&
          e[1313 + unitInSlot] !== 50
        ) {
          animId = shorts[1][idx + e[1313 + unitInSlot] - 1] & 0xfff;
          frame = e[3030 + unitInSlot];
          shouldDraw = true;
          flagI[slotId] = 1;
          // Exact port of f.java:1112: sleeping villager inside Lều (bType 2, state 2) emits Zzz animation d(90)
          if (e[8749 + n9] === 2 && e[1313 + unitInSlot] === 2) {
            drawAnimation(ctx, data, 90, px, py, animTick, imageCache);
          }
        }
        if (shouldDraw) {
          drawAnimation(ctx, data, animId, px, py, frame, imageCache);
        }
      }
    } else if ((kind === 3 || kind === 5 || kind === 7) && flagH[slotId] === 0 && unitInSlot > 0 && layer !== 2) {
      let dir = 0;
      let shouldDraw = false;
      if (n9 < 31 || (e[9176 + n9] & 3) >= 2) {
        if (kind === 7 && e[1313 + unitInSlot] === 50) {
          shouldDraw = true;
        } else if (kind === 3 && e[1313 + unitInSlot] >= 1 && e[1313 + unitInSlot] !== 50) {
          dir = m[mo[139] + m[mo[140] + n8] + slotId];
          if (dir === -1) dir = e[606 + unitInSlot];
          shouldDraw = true;
        } else if (kind === 5 && e[1313 + unitInSlot] <= 0) {
          shouldDraw = true;
        }
      }
      if (shouldDraw) {
        drawEntitySprite(ctx, data, unitInSlot, px, py, dir, 29, imageCache, uiState);
        flagH[slotId] = 1;
      }
    }
  }
}

function drawEntitySprite(ctx, data, entityId, screenX, screenY, dir, fieldOffsetIdx, imageCache, uiState) {
  const shorts = data.shortSpriteTables;
  const bytes = data.byteSpriteTables;
  const e = data.entityData;
  const fo = data.entityFieldOffsets;
  const m = data.mapTableData;
  const mo = data.mapTableOffsets;
  if (!fo) return;

  const animId = e[fo[fieldOffsetIdx] + entityId] & 0xff;
  const frameIdx = e[fo[fieldOffsetIdx + 1] + entityId] & 0xff;
  if (animId >= shorts[2].length || animId >= shorts[3].length) return;

  const dirMode = (shorts[3][animId] >>> 14) & 3;
  const mappedDir = dir >= 0 ? m[mo[99] + (dirMode << 3) + (dir & 7)] : 0;
  const frameTableIdx = (shorts[2][animId] & 0xfff) + mappedDir * (bytes[4][animId] & 0xff) + frameIdx;
  if (frameTableIdx < 0 || frameTableIdx >= shorts[4].length) return;

  const poseId = shorts[4][frameTableIdx] & 0xffff;
  let drawX = screenX + toSignedByte(bytes[7][frameTableIdx]);
  let drawY = screenY + toSignedByte(bytes[8][frameTableIdx]);
  if (animId >= 141 && animId <= 144) {
    drawX += 22 * m[mo[1] + e[606 + entityId]];
  }
  const aw = (shorts[2][animId] & 0xf000) >>> 14;
  if (poseId >= shorts[8].length || poseId >= bytes[15].length) return;

  const partStart = shorts[8][poseId];
  const partCount = bytes[15][poseId] & 0xff;
  let headPartIdx = -1;
  let bodyPartIdx = -1;
  const chiefId = data.resources?.[0]?.[17] ?? 1;
  const isSelected = uiState.selectedUnit === entityId || Boolean(uiState.selectedUnits?.has(entityId));
  const isHovered = uiState.hoverUnit === entityId;

  for (let p = 0; p < partCount; p++) {
    const az = partStart + p;
    const baseSprite = shorts[7][az];
    if (baseSprite === 0) continue;

    let spriteOffset = 0;
    let paletteSwap = -1;
    const partKind = bytes[14][az] & 0xf;
    let skip = false;

    if (fieldOffsetIdx === 29) {
      if (partKind === 10 && dir > -1) {
        if (isSelected) {
          drawComposite(
            ctx,
            data,
            599,
            drawX + toSignedByte(bytes[12][az]),
            drawY + toSignedByte(bytes[13][az]),
            imageCache
          );
        } else if (isHovered) {
          spriteOffset = entityId >= 51 ? 3 : 1;
        }
      }

      if (e[1414 + entityId] >= 12) {
        if (entityId >= 51) paletteSwap = 4;

        if (partKind === 0) {
          bodyPartIdx = az;
          let style = (e[5151 + entityId] >>> 2) & 3;
          if (style > 1) {
            style -= 2;
            paletteSwap = 0;
          }
          spriteOffset = style * 72 + (entityId >= 51 ? 36 : 0) + e[1515 + entityId] * 18;
        } else if (partKind === 9) {
          headPartIdx = az;
          const hairStyle = e[5151 + entityId] & 3;
          if (entityId >= 51) paletteSwap = 3; // Enemy tribe only: dark skin + black hair (pi9/03.png)
          else if (hairStyle === 1 || hairStyle === 2) paletteSwap = hairStyle; // Player tribe: strictly 0/1/2, NEVER enemy palette 3!
          const age = e[1414 + entityId];
          const sex = e[1515 + entityId];
          const headGroup = sex === 1 ? 1 : age < 30 ? 3 : age < 50 ? 2 : 0;
          spriteOffset = headGroup * 12;
        } else if (partKind === 7) {
          const hatCode = m[mo[42] + m[mo[41] + (e[6464 + entityId] & 0xff)]];
          if (hatCode > 0) {
            spriteOffset += hatCode - 1;
          } else if (entityId === chiefId) {
            spriteOffset += 2;
          } else {
            skip = true;
          }
        } else if ((e[6565 + entityId] & 0xff) === 9 && (partKind === 5 || partKind === 6 || partKind === 8)) {
          // Unarmed villager (weaponId === 9) must NEVER render any weapon attachment sprite!
          skip = true;
        } else if (aw === 0 && partKind >= 5 && partKind <= 8) {
          const job = e[6565 + entityId];
          if (dir < 0 && job === 1) skip = true;
          else if ((partKind === 5 && job === 4) || (partKind === 6 && job === 5)) spriteOffset = 1;
          else if (m[mo[145] + job] !== partKind) skip = true;
        } else if (aw === 2) {
          const carry = e[3535 + entityId];
          const job = e[6565 + entityId];
          if (carry !== 0) {
            if (partKind === 4 && (e[3636 + entityId] > 0 || (animId >= 113 && animId <= 116))) {
              spriteOffset += carry;
            } else if (partKind === 5) {
              if (job === 9) skip = true;
              else spriteOffset += job;
            } else if (partKind === 8) {
              skip = true;
            }
          } else {
            if (partKind === 4) skip = true;
            else if (partKind === 5) {
              if (job === 1 || job === 9) skip = true;
              else spriteOffset += job;
            } else if (partKind === 8 && job !== 1) skip = true;
          }
        } else if (aw === 1 && partKind === 5) {
          const job = e[6565 + entityId];
          if (job === 9) skip = true;
          else spriteOffset += job;
        }
      } else {
        if (partKind === 7 && e[1515 + entityId] === 0) skip = true;
        else if (partKind === 0) {
          bodyPartIdx = az;
          if (entityId >= 51) spriteOffset++;
        } else if (partKind === 9) {
          headPartIdx = az;
          spriteOffset = e[5151 + entityId] & 1;
        } else if (partKind === 5) {
          skip = true;
        }
      }

      if (!skip && baseSprite === 1) skip = true;
    } else if (partKind === 0) {
      headPartIdx = az;
      bodyPartIdx = az;
    }

    if (skip) continue;

    const px = drawX + toSignedByte(bytes[12][az]);
    const py = drawY + toSignedByte(bytes[13][az]);
    if (((bytes[14][az] & 0xff) >>> 7) === 0) {
      drawLeaf(ctx, data, baseSprite + spriteOffset, px, py, imageCache, paletteSwap);
    } else {
      drawComposite(ctx, data, baseSprite + spriteOffset, px, py, imageCache, paletteSwap);
    }
  }

  // Health bar, thought bubble (d(77+thought)), and job badge (a(577+job)) above villager (f.java:1376-1402)
  if (fieldOffsetIdx === 29 && entityId <= 100 && headPartIdx >= 0 && bodyPartIdx >= 0) {
    const hx = drawX + toSignedByte(bytes[12][headPartIdx]);
    const hy = drawY + toSignedByte(bytes[13][headPartIdx]);

    if (entityId <= 50) {
      const thought = toSignedByte(e[3333 + entityId]);
      if (thought > -1 && thought <= 13) {
        drawAnimation(ctx, data, 77 + thought, hx, hy, (uiState.animTick || 0) + (entityId & 7), imageCache);
      }

      const jobBadge = e[2222 + entityId] & 0xff;
      if (jobBadge > 0 && (isSelected || isHovered)) {
        drawComposite(ctx, data, 577 + Math.min(16, jobBadge), hx, hy, imageCache);
      }
    }

    const hp = e[1919 + entityId] & 0xff;
    const maxHp = Math.max(1, e[6767 + entityId] & 0xff);
    if (hp > 0 && (isSelected || isHovered || hp < maxHp)) {
      const tier = Math.floor(maxHp / 20);
      drawComposite(ctx, data, 607 + tier, hx, hy, imageCache);
      const barMaxW = m[mo[128] + tier] || 12;
      const barW = Math.max(1, Math.floor((barMaxW * hp) / maxHp));
      const colorBucket = entityId > 50 ? 0 : Math.min(2, Math.max(0, Math.floor(((hp - 1) * 3) / maxHp)));
      ctx.fillStyle = HP_BAR_COLORS[colorBucket];
      ctx.fillRect(hx + 2 - tier, hy - 4, barW, 2);
    }
  }
}

function drawOutlinedNumber(ctx, text, x, y) {
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#2d1e07';
  ctx.strokeText(text, x, y);
  ctx.fillStyle = '#fff55a';
  ctx.fillText(text, x, y);
}

function drawPanel4Text(ctx, text, x, y, align = 'center', size = 8, color = '#fff55a') {
  ctx.save();
  ctx.font = `bold ${size}px monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#241605';
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

/**
 * Exact 1:1 port of Panel 4 (Villager Status Bar, slot=3, h=48 at y=22, f.java:2037-2420).
 * Displays avatar portrait (720+avt), name, gender (619/620), age, mood face (675..679),
 * HP/energy/hunger bars (551..553), equipped weapon (659+wpn), cargo (625+cargo),
 * speed, combat skills, civil skills, and current job badge (560+id).
 */
export function drawOriginalVillagerHud(ctx, data, state, imageCache) {
  const uid = state.selectedUnit || 0;
  if (uid < 1 || uid > 50 || !data?.entityData) return;
  const e = data.entityData;
  const hp = e[1919 + uid] & 0xff;
  if (hp <= 0) return;

  const y0 = data.mapTopUi ?? 22; // 22px, directly below top resource bar
  const m = data.mapTableData;
  const mo = data.mapTableOffsets;
  const fo = data.entityFieldOffsets;

  // Panel 4 background + authentic frame tiled across full viewport, content centered in 240px strip
  ctx.fillStyle = '#c5b85a';
  ctx.fillRect(0, y0, LOGICAL_WIDTH, 48);
  for (let tx = 0; tx < LOGICAL_WIDTH; tx += 240) {
    drawComposite(ctx, data, 523, tx, y0 + 32, imageCache);
    drawComposite(ctx, data, 524, tx, y0 + 48, imageCache);
  }
  const ox = Math.floor((LOGICAL_WIDTH - 240) / 2);
  ctx.save();
  ctx.translate(ox, 0);
  drawComposite(ctx, data, 616, 0, y0, imageCache);

  // 1. Avatar portrait (composite 720 + e[2727+uid] at pos (1, 5))
  const avt = e[2727 + uid] & 0xff;
  drawComposite(ctx, data, 720 + avt, 1, y0 + 5, imageCache);

  // 2. Villager name centered at (58, y0+5)
  const chiefId = data.resources?.[0]?.[17] ?? 1;
  const rawName = state.selectedUnitName || `Dân #${uid}`;
  const shortName = rawName.replace(/^Tộc trưởng\s+/i, '').slice(0, 9);
  drawPanel4Text(ctx, uid === chiefId ? `★${shortName}` : shortName, 60, y0 + 5, 'center', 8, uid === chiefId ? '#fff566' : '#fff8d4');

  // 3. Gender icon (composite 619=male, 620=female at (34, 24)) & Age at (58, 25)
  const sex = e[1515 + uid] & 1;
  drawComposite(ctx, data, 619 + sex, 34, y0 + 24, imageCache);
  const age = e[1414 + uid] & 0xff;
  drawPanel4Text(ctx, String(age), 58, y0 + 26, 'center', 8, '#fff55a');

  // 4. Mood face icon (composite 675 + floor(e[505+uid]/21) at (70, 23))
  const moodVal = Math.min(100, e[505 + uid] & 0xff);
  const moodFrame = Math.max(0, Math.min(4, Math.floor(moodVal / 21)));
  drawComposite(ctx, data, 675 + moodFrame, 70, y0 + 23, imageCache);

  // 5. HP, Energy, and Hunger bars (composites 551, 552, 553 + exact f.java:2092-2097 black mask)
  const maxHp = Math.max(1, e[6767 + uid] & 0xff);
  const energy = Math.min(99, e[2020 + uid] & 0xff);
  const satiety = Math.min(99, e[2121 + uid] & 0xff);

  drawComposite(ctx, data, 551, 91, y0 + 3, imageCache);
  const hpW = Math.max(0, Math.min(16, Math.round((16 * hp) / maxHp)));
  if (hpW < 16) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(100 + hpW + 1, y0 + 6, 16 - hpW, 4);
  }
  drawPanel4Text(ctx, String(maxHp), 119, y0 + 10, 'center', 7, '#fff55a');

  drawComposite(ctx, data, 552, 92, y0 + 21, imageCache);
  const enW = Math.max(0, Math.min(16, Math.round((16 * energy) / 99)));
  if (enW < 16) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(100 + enW + 1, y0 + 24, 16 - enW, 4);
  }

  drawComposite(ctx, data, 553, 92, y0 + 31, imageCache);
  const satW = Math.max(0, Math.min(16, Math.round((16 * satiety) / 99)));
  if (satW < 16) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(100 + satW + 1, y0 + 34, 16 - satW, 4);
  }

  // 6. Equipped weapon (slot 555 + weapon 659+wpn at (123, y0-1))
  drawComposite(ctx, data, 555, 127, y0, imageCache);
  const weaponId = e[6565 + uid] & 0xff;
  if (weaponId < 9) {
    drawComposite(ctx, data, 659 + weaponId, 123, y0 - 1, imageCache);
  }

  // 7. Carried cargo (composite 625+carrySprite at (125, y0+25) + count at (140, y0+25))
  const carrySprite = e[3535 + uid] & 0xff;
  const carryAmt = e[3636 + uid] & 0xff;
  if (carrySprite > 0 && carrySprite < 15 && carryAmt > 0) {
    drawComposite(ctx, data, 625 + carrySprite, 125, y0 + 25, imageCache);
    drawPanel4Text(ctx, String(carryAmt), 141, y0 + 27, 'center', 7, '#fff55a');
  }

  // Helper to read authentic skill level via mo[126] & mo[127] (f.java:2242-2243)
  const getSkillVal = (skillId) => {
    if (!m || !mo || !fo || skillId < 0 || skillId > 16) return null;
    const fIdx = toSignedByte(m[mo[126] + skillId]);
    if (fIdx < 0) return null;
    const bias = toSignedByte(m[mo[127] + skillId]);
    return Math.max(0, (e[fo[fIdx] + uid] & 0xff) + bias);
  };

  // 8. Top right row: Best Combat Skill 1 (154), Combat Skill 2 (185), Speed (229)
  const skC1 = e[2525 + uid] & 0xff;
  const skC2 = e[2626 + uid] & 0xff;
  drawComposite(ctx, data, 751, 153, y0, imageCache);
  if (skC1 > 0) {
    drawComposite(ctx, data, 560 + skC1, 154, y0 + 5, imageCache);
    const v = getSkillVal(skC1);
    if (v !== null) drawPanel4Text(ctx, String(v), 172, y0 + 7, 'center', 7, '#fff55a');
  }
  drawComposite(ctx, data, 751, 184, y0, imageCache);
  if (skC2 > 0) {
    drawComposite(ctx, data, 560 + skC2, 185, y0 + 5, imageCache);
    const v = getSkillVal(skC2);
    if (v !== null) drawPanel4Text(ctx, String(v), 203, y0 + 7, 'center', 7, '#fff55a');
  }
  const speedRaw = (e[1010 + uid] & 0xff) || 8;
  const speedDisplay = (9 - speedRaw) * 2 + 1; // exact f.java:2253
  drawPanel4Text(ctx, String(speedDisplay), 230, y0 + 7, 'center', 7, '#fff55a');

  // 9. Bottom right row: Current Job (154), Civil Skill 1 (185), Civil Skill 2 (213)
  const jobBadge = e[2222 + uid] & 0xff;
  drawComposite(ctx, data, 560 + Math.min(16, jobBadge), 154, y0 + 25, imageCache);
  const jobVal = getSkillVal(jobBadge);
  if (jobVal !== null) drawPanel4Text(ctx, String(jobVal), 172, y0 + 27, 'center', 7, '#fff55a');

  const skW1 = e[2323 + uid] & 0xff;
  if (skW1 > 0) {
    drawComposite(ctx, data, 560 + skW1, 185, y0 + 25, imageCache);
    const v = getSkillVal(skW1);
    if (v !== null) drawPanel4Text(ctx, String(v), 203, y0 + 27, 'center', 7, '#fff55a');
  }

  const skW2 = e[2424 + uid] & 0xff;
  if (skW2 > 0) {
    drawComposite(ctx, data, 560 + skW2, 213, y0 + 25, imageCache);
    const v = getSkillVal(skW2);
    if (v !== null) drawPanel4Text(ctx, String(v), 230, y0 + 27, 'center', 7, '#fff55a');
  }

  // Restore centered Panel 4 translation
  ctx.restore();
}

export function drawOriginalHud(ctx, data, state, imageCache) {
  const localTribe = state.localTribe ?? 0;
  const res = data.resources?.[localTribe] || [];
  const pop = state.population ?? res[11] ?? 9;
  const cap = state.housingCap ?? res[16] ?? 1;
  const food = state.food ?? res[0] ?? 0;
  const wood = state.wood ?? res[1] ?? 0;
  const stone = state.stone ?? res[2] ?? 0;
  const tools = state.tools ?? res[3] ?? 0;
  const ox = Math.floor((LOGICAL_WIDTH - 240) / 2);

  // Top HUD bar (panel 0 from mapTableOffsets[195]) — tiled full-width, resource strip centered
  ctx.fillStyle = '#c5b85a';
  ctx.fillRect(0, 0, LOGICAL_WIDTH, 22);
  for (let tx = 0; tx < LOGICAL_WIDTH; tx += 240) {
    drawComposite(ctx, data, 523, tx, 6, imageCache);
    drawComposite(ctx, data, 524, tx, data.mapTopUi, imageCache);
  }
  drawComposite(ctx, data, 669, ox, 0, imageCache);

  drawOutlinedNumber(ctx, `${pop}/${cap}`, ox + 15, 4);
  drawOutlinedNumber(ctx, String(food), ox + 84, 4);
  drawOutlinedNumber(ctx, String(wood), ox + 129, 4);
  drawOutlinedNumber(ctx, String(stone), ox + 172, 4);
  drawOutlinedNumber(ctx, String(tools), ox + 213, 4);

  // Panel 4: Authentic Villager Status Bar directly below top resource bar (y=22..70)
  if (state.selectedUnit > 0 && !state.storyDialog && !state.missionResult) {
    drawOriginalVillagerHud(ctx, data, state, imageCache);
  }

  // Bottom HUD bar (panel 1 + panel 17 softkey buttons from mapTableOffsets[195])
  const bottomTop = LOGICAL_HEIGHT - data.bottomUi;
  const activeMenu = state.canvasMenu;
  if (activeMenu && !state.storyDialog && !state.missionResult && !state.showMinimap) {
    drawAuthenticBottomMenu(ctx, data, state, imageCache);
  } else {
    ctx.fillStyle = '#c5b85a';
    ctx.fillRect(0, bottomTop, LOGICAL_WIDTH, data.bottomUi);
    for (let tx = 0; tx < LOGICAL_WIDTH; tx += 240) {
      drawComposite(ctx, data, 525, tx, bottomTop, imageCache);
      drawComposite(ctx, data, 528, tx, bottomTop, imageCache);
    }
    drawComposite(ctx, data, 541, ox + 172, bottomTop + 12, imageCache);
    drawComposite(ctx, data, 542, ox + 97, bottomTop + 8, imageCache);
    drawComposite(ctx, data, 545, ox + 126, bottomTop + 8, imageCache);
    // Highlight assigned combat groups 7 and 9 on bottom HUD bar
    if (state.groups?.[7]?.size > 0) {
      ctx.fillStyle = state.activeGroupId === 7 ? '#fff36b' : '#7ae665';
      ctx.fillRect(ox + 99, LOGICAL_HEIGHT - 3, 14, 2);
    }
    if (state.groups?.[9]?.size > 0) {
      ctx.fillStyle = state.activeGroupId === 9 ? '#fff36b' : '#7ae665';
      ctx.fillRect(ox + 128, LOGICAL_HEIGHT - 3, 14, 2);
    }
    // Authentic Panel 17 softkey icons pinned to bottom-left and bottom-right corners
    const leftSoftkey = state.buildType !== null ? 529 : 530;
    const rightSoftkey = state.buildType !== null ? 534 : 535;
    drawComposite(ctx, data, leftSoftkey, 0, LOGICAL_HEIGHT - 18, imageCache);
    drawComposite(ctx, data, rightSoftkey, LOGICAL_WIDTH - 20, LOGICAL_HEIGHT - 18, imageCache);
  }
}

/**
 * Authentic J2ME On-Canvas Interactive Menus (exact port of f.java Panels 2, 5, 6, 8 & Pause Q=10/11):
 * - Panel 5 ('actions'): Green button Tribe Command Bar (Build, Rally, Attack, Villagers list, Auto-AI)
 * - Panel 6 ('build'):   Authentic 86px-tall Build Menu with 680+bType building icon, description, cost card (Panel 8)
 * - Panel 2 ('building'): Building Action Bar (Weapons, Spells, Workers, Upgrade, Repair, Demolish)
 * - Panel 5b ('villagers'): Scrollable Villager Picker showing portrait/avatar + live Panel 4 stats
 * - Panel 10 ('pause'):  Authentic In-Game Pause Menu (Tiếp tục, Lưu, Tải, Bản đồ nhỏ, Nhạc, Ngôn ngữ, Màn chơi, Thoát)
 */
function drawAuthenticBottomMenu(ctx, data, state, imageCache) {
  const menu = state.canvasMenu;
  if (!menu) return;
  const animTick = state.animTick || 0;

  if (menu.kind === 'pause' || menu.kind === 'scenarios') {
    ctx.save();
    // Authentic Prehistoric Tribes Full-Screen Menu Backdrop (f.java G(): sky + clouds + logo 1665 + parchment board 1656)
    ctx.fillStyle = '#8fc7ff';
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    ctx.fillStyle = '#0e5b27';
    ctx.fillRect(0, LOGICAL_HEIGHT - 64, LOGICAL_WIDTH, 64);

    // Drifting clouds (composites 1667..1670) across full viewport
    const cloudSpan = LOGICAL_WIDTH + 120;
    const cloudShift = (animTick * 2) % cloudSpan;
    drawComposite(ctx, data, 1667, ((cloudShift + 10) % cloudSpan) - 60, 12, imageCache);
    drawComposite(ctx, data, 1668, ((cloudShift * 1.3 + 120) % cloudSpan) - 60, 32, imageCache);
    drawComposite(ctx, data, 1669, ((cloudShift * 0.8 + 210) % cloudSpan) - 60, 20, imageCache);

    // Original Game Logo banner at top center (composite 1665)
    drawComposite(ctx, data, 1665, Math.floor(LOGICAL_WIDTH / 2), 0, imageCache);

    // Authentic Panel 10 wooden/stone menu board centered in viewport
    const boardX = Math.floor((LOGICAL_WIDTH - 190) / 2);
    const boardY = Math.max(64, Math.floor((LOGICAL_HEIGHT - 220) / 2));
    drawComposite(ctx, data, 1656, boardX + 5, boardY + 2, imageCache);

    const items = menu.items || [];
    const visibleCount = Math.min(7, items.length);
    const scroll = menu.scroll || 0;
    const rowH = 22;

    // Header title inside Panel 10 board
    ctx.fillStyle = '#4f2808';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(menu.title || 'MENU TẠM DỪNG', LOGICAL_WIDTH / 2, boardY + 18);

    const listTop = boardY + 38;
    const selX = Math.floor(LOGICAL_WIDTH / 2) - 72;
    for (let i = 0; i < visibleCount; i++) {
      const idx = scroll + i;
      const item = items[idx];
      if (!item) continue;
      const ry = listTop + i * rowH;
      const isSel = idx === menu.selected;
      if (isSel) {
        ctx.fillStyle = 'rgba(139, 90, 20, 0.28)';
        ctx.fillRect(selX, ry, 144, rowH - 3);
        // Authentic animated side arrows (f.java:2552-2553 d(2) and d(1))
        drawAnimation(ctx, data, 2, selX - 2, ry + 5, Math.floor(animTick / 2), imageCache);
        drawAnimation(ctx, data, 1, selX + 138, ry + 5, Math.floor(animTick / 2), imageCache);
      }
      ctx.font = isSel ? 'bold 10px monospace' : 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (isSel) {
        ctx.strokeStyle = '#3d2105';
        ctx.lineWidth = 2;
        ctx.strokeText(item.label, LOGICAL_WIDTH / 2, ry + (rowH - 3) / 2);
        ctx.fillStyle = '#fff582';
      } else {
        ctx.fillStyle = '#331d06';
      }
      ctx.fillText(item.label, LOGICAL_WIDTH / 2, ry + (rowH - 3) / 2);
    }

    if (items.length > visibleCount) {
      ctx.fillStyle = '#5a2d0c';
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`▲ ▼ CUỘN (${menu.selected + 1}/${items.length})`, LOGICAL_WIDTH / 2, listTop + visibleCount * rowH + 4);
    }

    // Bottom Panel 17 softkeys: Left green ✓ (529), Right red ✕ (534)
    drawComposite(ctx, data, 529, 0, LOGICAL_HEIGHT - 18, imageCache);
    drawComposite(ctx, data, 534, LOGICAL_WIDTH - 20, LOGICAL_HEIGHT - 18, imageCache);
    ctx.restore();
    return;
  }

  if (menu.kind === 'build') {
    // Authentic Panel 6 (height = 86px, pinned to bottom) + Cost Box (Panel 8) above right
    const panelH = 86;
    const panelY = LOGICAL_HEIGHT - panelH;
    const ox = Math.floor((LOGICAL_WIDTH - 240) / 2);
    const items = menu.items || [];
    const item = items[menu.selected] || items[0];

    // Panel 8 Cost Box on top-right above Panel 6 (wood/stone/bones)
    if (item && item.spec) {
      const sp = item.spec;
      const costW = 68;
      const costH = 44;
      const costX = ox + 240 - costW - 4;
      const costY = panelY - costH - 2;
      ctx.save();
      ctx.fillStyle = '#473010';
      ctx.fillRect(costX - 1, costY - 1, costW + 2, costH + 2);
      ctx.fillStyle = '#d6c678';
      ctx.fillRect(costX, costY, costW, costH);
      ctx.strokeStyle = '#7c5d22';
      ctx.lineWidth = 1;
      ctx.strokeRect(costX + 1.5, costY + 1.5, costW - 3, costH - 3);
      let cy = costY + 5;
      if (sp.woodCost > 0) {
        drawComposite(ctx, data, 627, costX + 5, cy - 2, imageCache);
        drawOutlinedNumber(ctx, String(sp.woodCost), costX + 26, cy, state.wood >= sp.woodCost ? '#ffffff' : '#ff6b6b');
        cy += 12;
      }
      if (sp.stoneCost > 0) {
        drawComposite(ctx, data, 628, costX + 5, cy - 2, imageCache);
        drawOutlinedNumber(ctx, String(sp.stoneCost), costX + 26, cy, state.stone >= sp.stoneCost ? '#ffffff' : '#ff6b6b');
        cy += 12;
      }
      if (sp.toolsCost > 0) {
        drawComposite(ctx, data, 629, costX + 5, cy - 2, imageCache);
        drawOutlinedNumber(ctx, String(sp.toolsCost), costX + 26, cy, state.tools >= sp.toolsCost ? '#ffffff' : '#ff6b6b');
      }
      ctx.restore();
    }

    ctx.save();
    ctx.fillStyle = '#c5b85a';
    ctx.fillRect(0, panelY, LOGICAL_WIDTH, panelH);
    for (let tx = 0; tx < LOGICAL_WIDTH; tx += 240) {
      drawComposite(ctx, data, 526, tx, panelY, imageCache);
      drawComposite(ctx, data, 528, tx, panelY, imageCache);
    }

    // Center the 240px build card content cleanly
    ctx.save();
    ctx.translate(ox, 0);

    // Building portrait frame (composite 617) + crisp 1:1 original building icon (680 + bType), zero fractional scaling!
    drawComposite(ctx, data, 617, 8, panelY + 13, imageCache);
    if (item && item.bType !== undefined) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(10, panelY + 14, 44, 42);
      ctx.clip();
      drawComposite(ctx, data, 680 + item.bType, 16, panelY + 12, imageCache);
      ctx.restore();
    }

    // Left / Right selector arrows below building icon (matching Panel 6 idx 1093 & 1095)
    if (menu.selected > 0) {
      drawAnimation(ctx, data, 1, 14, panelY + 60, Math.floor(animTick / 2), imageCache);
    }
    if (menu.selected < items.length - 1) {
      drawAnimation(ctx, data, 2, 40, panelY + 60, Math.floor(animTick / 2), imageCache);
    }

    // Title & wrapped description in parchment box (x=64..228, y=panelY+22..panelY+76)
    ctx.fillStyle = '#e5d68c';
    ctx.fillRect(64, panelY + 22, 158, 54);
    ctx.strokeStyle = '#7c5d22';
    ctx.lineWidth = 1;
    ctx.strokeRect(64.5, panelY + 22.5, 157, 53);

    if (item) {
      ctx.fillStyle = '#fff582';
      ctx.strokeStyle = '#2d1c06';
      ctx.lineWidth = 2;
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      const titleTxt = `${item.label} (${menu.selected + 1}/${items.length})`;
      ctx.strokeText(titleTxt, 66, panelY + 6);
      ctx.fillText(titleTxt, 66, panelY + 6);

      ctx.fillStyle = '#281805';
      ctx.font = '8px monospace';
      const words = (item.desc || '').split(' ');
      let line = '';
      let ly = panelY + 26;
      for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        if (ctx.measureText(test).width > 148 && line) {
          if (ly <= panelY + 66) ctx.fillText(line, 68, ly);
          ly += 10;
          line = w;
        } else {
          line = test;
        }
      }
      if (line && ly <= panelY + 66) ctx.fillText(line, 68, ly);
    }
    ctx.restore();

    // Bottom softkeys: Left green ✓ (529 = place building), Right red ✕ (534 = back)
    drawComposite(ctx, data, 529, 0, LOGICAL_HEIGHT - 18, imageCache);
    drawComposite(ctx, data, 534, LOGICAL_WIDTH - 20, LOGICAL_HEIGHT - 18, imageCache);
    ctx.restore();
    return;
  }

  // Authentic Panel 2 / Panel 5 Icon Bar (height = 48px, pinned to bottom)
  const panelH = 48;
  const panelY = LOGICAL_HEIGHT - panelH;
  const items = menu.items || [];
  const visible = Math.min(5, items.length);
  const scroll = menu.scroll || 0;
  const slotStep = 34; // authentic f.aV = 34
  const totalW = visible * slotStep;
  const startX = Math.floor((LOGICAL_WIDTH - totalW + 9) / 2);
  const selItem = items[menu.selected];

  // If selected item has a resource cost (weapon / spell / upgrade), show small cost tooltip above bar
  if (selItem && selItem.costText) {
    ctx.save();
    ctx.font = 'bold 8px monospace';
    const tw = Math.min(220, ctx.measureText(selItem.costText).width + 14);
    const tx = Math.floor((LOGICAL_WIDTH - tw) / 2);
    const ty = panelY - 16;
    ctx.fillStyle = 'rgba(34, 23, 8, 0.88)';
    ctx.fillRect(tx, ty, tw, 14);
    ctx.strokeStyle = '#c5a448';
    ctx.lineWidth = 1;
    ctx.strokeRect(tx + 0.5, ty + 0.5, tw - 1, 13);
    ctx.fillStyle = selItem.canAfford === false ? '#ff8070' : '#fff48c';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(selItem.costText, LOGICAL_WIDTH / 2, ty + 7);
    ctx.restore();
  }

  ctx.save();
  ctx.fillStyle = '#c5b85a';
  ctx.fillRect(0, panelY, LOGICAL_WIDTH, panelH);
  for (let tx = 0; tx < LOGICAL_WIDTH; tx += 240) {
    drawComposite(ctx, data, 525, tx, panelY, imageCache);
    drawComposite(ctx, data, 527, tx, panelY, imageCache);
    drawComposite(ctx, data, 528, tx, panelY, imageCache);
  }

  // Selected item label centered at top of Panel 2/5 (y = panelY + 7)
  if (selItem) {
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.strokeStyle = '#2d1c06';
    ctx.lineWidth = 2;
    ctx.strokeText(selItem.label, LOGICAL_WIDTH / 2, panelY + 6);
    ctx.fillStyle = '#fff582';
    ctx.fillText(selItem.label, LOGICAL_WIDTH / 2, panelY + 6);
  }

  // Draw up to 5 icon slots using authentic 548 (selected) / 549 (unselected)
  for (let i = 0; i < visible; i++) {
    const idx = scroll + i;
    const item = items[idx];
    if (!item) continue;
    const sx = startX + i * slotStep;
    const sy = panelY + 21;
    const isSel = idx === menu.selected;
    drawComposite(ctx, data, isSel ? 548 : 549, sx, sy, imageCache);

    if (item.iconAnim !== undefined) {
      drawAnimation(ctx, data, item.iconAnim, sx, sy, isSel ? Math.floor(animTick / 2) : 0, imageCache);
    } else if (item.weaponId !== undefined) {
      drawComposite(ctx, data, 659 + item.weaponId, sx, sy, imageCache);
    } else if (item.unitId !== undefined) {
      const av = (data.entityData[2727 + item.unitId] & 0xff) % 10;
      drawComposite(ctx, data, 720 + av, sx + 1, sy - 2, imageCache);
    } else if (item.glyph) {
      ctx.fillStyle = isSel ? '#fff582' : '#2e1d08';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.glyph, sx + 12, sy + 12);
    }
  }

  // Scroll arrows when more than 5 items
  if (scroll > 0) {
    drawAnimation(ctx, data, 1, startX - 11, panelY + 28, Math.floor(animTick / 2), imageCache);
  }
  if (scroll + visible < items.length) {
    drawAnimation(ctx, data, 2, startX + totalW + 2, panelY + 28, Math.floor(animTick / 2), imageCache);
  }

  // Bottom softkeys: Left green ✓ (529 = execute), Right red ✕ (534 = back/close)
  drawComposite(ctx, data, 529, 0, LOGICAL_HEIGHT - 18, imageCache);
  drawComposite(ctx, data, 534, LOGICAL_WIDTH - 20, LOGICAL_HEIGHT - 18, imageCache);
  ctx.restore();
}

export function renderOriginalMap(ctx, data, state, imageCache) {
  const camXFull = state.smoothCamX ?? state.cameraX ?? data.cameraX ?? 0;
  const camYFull = state.smoothCamY ?? state.cameraY ?? data.cameraY ?? 0;
  const camX = Math.floor(camXFull);
  const camY = Math.floor(camYFull);
  const fracX = Math.round((camXFull - camX) * CELL_WIDTH);
  const fracY = Math.round((camYFull - camY) * CELL_HEIGHT);
  const mapViewH = Math.max(120, LOGICAL_HEIGHT - (data.mapTopUi ?? 22) - (data.bottomUi ?? 22));
  const cols = Math.ceil(LOGICAL_WIDTH / CELL_WIDTH) + 1 + (fracX > 0 ? 1 : 0);
  const rows = Math.ceil(mapViewH / CELL_HEIGHT) + 2 + (fracY > 0 ? 1 : 0);
  const originY = (data.mapTopUi ?? 22) - (data.verticalOffset ?? 6);
  const animTick = state.animTick || 0;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, data.mapTopUi ?? 22, LOGICAL_WIDTH, LOGICAL_HEIGHT - (data.mapTopUi ?? 22) - (data.bottomUi ?? 22));
  ctx.clip();
  ctx.translate(-fracX, -fracY);

  // Pass 1: Ground terrain & base footprints (f.java o())
  for (let sy = 0; sy < rows; sy++) {
    const wy = camY + sy;
    if (wy < 0 || wy >= data.height) continue;
    for (let sx = 0; sx < cols; sx++) {
      const wx = camX + sx;
      if (wx < 0 || wx >= data.width) continue;
      const tileId = data.terrain[wy][wx] & 0xff;
      if (tileId < 175) {
        drawComposite(ctx, data, tileId, sx * CELL_WIDTH, originY + sy * CELL_HEIGHT, imageCache);
      } else if (tileId >= 175 && tileId <= 178) {
        // Berry bushes & mushrooms sit on plain grass (tile 0); their bush graphic is drawn via occ (-61..-110)
        drawComposite(ctx, data, 0, sx * CELL_WIDTH, originY + sy * CELL_HEIGHT, imageCache);
      } else {
        drawMapObject(ctx, data, tileId, 0, sx, sy, camX, camY, originY, animTick, imageCache, state);
      }
      const occ = data.occupancy[wy][wx];
      if (occ < 0 && occ >= -123) {
        drawMapObject(ctx, data, occ, 0, sx, sy, camX, camY, originY, animTick, imageCache, state);
      }
    }
  }

  // Pass 2: Building selection corners when cursor hovers a building (f.java w())
  const curWX = state.cursor?.x ?? data.cursorX;
  const curWY = state.cursor?.y ?? data.cursorY;
  if (curWY >= 0 && curWY < data.height && curWX >= 0 && curWX < data.width) {
    const curOcc = data.occupancy[curWY][curWX];
    if (buildingOwner(curOcc) === (state.localTribe ?? 0)) {
      const bid = -curOcc;
      const e = data.entityData;
      const m = data.mapTableData;
      const mo = data.mapTableOffsets;
      const bx = (e[8383 + bid] - camX) * CELL_WIDTH;
      const by = originY + (e[8444 + bid] - camY) * CELL_HEIGHT;
      const bw = m[mo[138] + 104 + e[8749 + bid]] * CELL_WIDTH;
      const bh = m[mo[138] + 130 + e[8749 + bid]] * CELL_HEIGHT;
      drawAnimation(ctx, data, 6, bx, by, animTick, imageCache);
      drawAnimation(ctx, data, 7, bx + bw, by, animTick, imageCache);
      drawAnimation(ctx, data, 8, bx, by + bh, animTick, imageCache);
      drawAnimation(ctx, data, 9, bx + bw, by + bh, animTick, imageCache);
    }
  }

  // Pass 3: Foreground objects, trees, buildings, villagers, animals, fog of war (f.java u())
  const drawnBuildings = new Set();
  const drawnUnits = new Set();
  const hoverCellOcc =
    curWY >= 0 && curWY < data.height && curWX >= 0 && curWX < data.width ? data.occupancy[curWY][curWX] : 0;
  const uiState = {
    selectedUnit: state.selectedUnit || 0,
    selectedUnits: state.selectedUnits || null,
    hoverUnit: hoverCellOcc >= 1 && hoverCellOcc <= 100 ? hoverCellOcc : 0,
    animTick,
  };

  for (let ai = -1; ai < rows + 3; ai++) {
    const wy = camY + ai;
    if (wy >= data.height) continue;
    for (let ah = cols; ah >= -1; ah--) {
      const wx = camX + ah;
      if (wy < 0 || wx < 0 || wx >= data.width) continue;

      const px = ah * CELL_WIDTH;
      const py = originY + ai * CELL_HEIGHT;
      const fog = getFogState(data, wx, wy);
      const occ = data.occupancy[wy][wx];
      const tileId = data.terrain[wy][wx] & 0xff;

      if (occ !== 0) {
        if (fog < 2 && ((tileId >= 180 && tileId <= 231) || tileId === 243)) {
          drawMapObject(ctx, data, tileId, 1, ah, ai, camX, camY, originY, animTick, imageCache, uiState);
        } else if (occ <= -1 && occ >= -60 && (fog < 2 || data.entityData[9176 + -occ] > 0)) {
          if (!drawnBuildings.has(occ)) {
            drawnBuildings.add(occ);
            drawMapObject(ctx, data, occ, 1, ah, ai, camX, camY, originY, animTick, imageCache, uiState);
            const bid = -occ;
            const e = data.entityData;
            const hp = e[8505 + bid] & 0xff;
            const maxHp = Math.max(1, e[8566 + bid] & 0xff);
            if (e[8627 + bid] === 1 || hp * 2 < maxHp || (bid > 30 && hp < maxHp)) {
              const bType = e[8749 + bid];
              const bw = data.mapTableData[data.mapTableOffsets[138] + 104 + bType] || 2;
              const bx = (e[8383 + bid] - camX) * CELL_WIDTH + Math.floor((bw * CELL_WIDTH - 24) / 2);
              const by = originY + (e[8444 + bid] - camY) * CELL_HEIGHT - 6;
              ctx.fillStyle = '#1b1409';
              ctx.fillRect(bx - 1, by - 1, 26, 5);
              ctx.fillStyle = e[8627 + bid] === 1 ? '#ffd84d' : bid > 30 ? '#ef4444' : '#22d422';
              ctx.fillRect(bx, by, Math.max(2, Math.floor((24 * hp) / maxHp)), 3);
            }
            // Authentic "!" worker-needed indicator above an empty finished Sàn disco (bType 7, no DJ in slot 0)
            const bTypeCur = e[8749 + bid] & 0xff;
            const myTribe = state.localTribe ?? 0;
            const isMine = myTribe === 1 ? bid > 30 : bid <= 30;
            if (isMine && bTypeCur === 7 && e[8627 + bid] === 0) {
              let hasDj = false;
              let u = e[8993 + bid];
              let g = 0;
              while (u > 0 && g++ < 16) {
                if (e[4646 + u] === 0) { hasDj = true; break; }
                u = e[4545 + u];
              }
              if (!hasDj) {
                const bw = data.mapTableData[data.mapTableOffsets[138] + 104 + bTypeCur] || 5;
                const ax = (e[8383 + bid] - camX) * CELL_WIDTH + Math.floor((bw * CELL_WIDTH) / 2);
                const bounce = Math.round(Math.sin(animTick * 0.45) * 2);
                const ay = originY + (e[8444 + bid] - camY) * CELL_HEIGHT - 8 + bounce;
                ctx.save();
                ctx.fillStyle = '#3d1c05';
                ctx.fillRect(ax - 6, ay - 9, 12, 13);
                ctx.fillStyle = '#ffe44d';
                ctx.fillRect(ax - 5, ay - 8, 10, 11);
                ctx.fillStyle = '#b3190c';
                ctx.font = 'bold 10px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('!', ax, ay - 2);
                ctx.restore();
              }
            }
          }
        } else if (fog < 1 && isWildAnimal(occ)) {
          const aid = occ - 101;
          const e = data.entityData;
          drawEntitySprite(
            ctx,
            data,
            aid,
            px + toSignedByte(e[9403 + aid]),
            py + toSignedByte(e[9425 + aid]),
            e[9491 + aid],
            108,
            imageCache,
            uiState
          );
        } else if (fog < 2 && (isItemProp(occ) || resourceGroup(occ) === 3)) {
          drawMapObject(ctx, data, occ, 1, ah, ai, camX, camY, originY, animTick, imageCache, uiState);
        }
      }

      // Draw all living ground units (1..100) located on tile (wx, wy) directly from entityData coordinates (e[uid], e[101+uid])
      // so a villager never vanishes if occupancy[wy][wx] is shared or touched by another entity or building!
      if (fog < 1) {
        const e = data.entityData;
        for (let uid = 1; uid <= 100; uid++) {
          if (drawnUnits.has(uid)) continue;
          if ((e[1919 + uid] & 0xff) <= 0) continue;
          if (toSignedByte(e[4646 + uid]) >= 0) continue; // inside a building slot
          if ((e[uid] & 0xff) !== wx || (e[101 + uid] & 0xff) !== wy) continue;
          if (unitOwner(uid) !== 0 && (e[7979 + uid] & 2) !== 0) continue;
          if (data.occupancy[wy]?.[wx] === 0) {
            data.occupancy[wy][wx] = uid;
          }
          drawnUnits.add(uid);
          drawEntitySprite(
            ctx,
            data,
            uid,
            px + toSignedByte(e[202 + uid]),
            py + toSignedByte(e[303 + uid]),
            e[606 + uid],
            29,
            imageCache,
            uiState
          );
        }
      }

      if (fog === 1) {
        drawLeaf(ctx, data, 12, px - 2, py - 4, imageCache);
      } else if (fog === 2) {
        const edge =
          wx === 0 ||
          wx === data.width - 1 ||
          wy === 0 ||
          wy === data.height - 1 ||
          getFogState(data, wx - 1, wy) !== 2 ||
          getFogState(data, wx + 1, wy) !== 2 ||
          getFogState(data, wx, wy - 1) !== 2 ||
          getFogState(data, wx, wy + 1) !== 2;
        if (edge) {
          drawLeaf(ctx, data, 11, px - 3, py - 2, imageCache);
        } else {
          ctx.fillStyle = '#000000';
          ctx.fillRect(px, py, CELL_WIDTH, CELL_HEIGHT);
        }
      }
    }
  }

  // Fallback pass for any living ground units (1..100) whose tile was shared or overlapped by another entity/building footprint
  // Guarantees no villager or warrior ever vanishes mid-air when passing near a building or another unit!
  {
    const e = data.entityData;
    for (let uid = 1; uid <= 100; uid++) {
      if (drawnUnits.has(uid)) continue;
      if ((e[1919 + uid] & 0xff) <= 0) continue;
      if (toSignedByte(e[4646 + uid]) >= 0) continue; // inside a building slot
      if (unitOwner(uid) !== 0 && (e[7979 + uid] & 2) !== 0) continue;
      const ux = e[uid] & 0xff;
      const uy = e[101 + uid] & 0xff;
      if (ux < camX - 1 || ux > camX + cols || uy < camY - 1 || uy > camY + rows + 2) continue;
      if (getFogState(data, ux, uy) >= 1) continue;
      // Repair occupancy if tile became 0
      if (data.occupancy[uy]?.[ux] === 0) {
        data.occupancy[uy][ux] = uid;
      }
      const px = (ux - camX) * CELL_WIDTH;
      const py = originY + (uy - camY) * CELL_HEIGHT;
      drawnUnits.add(uid);
      drawEntitySprite(
        ctx,
        data,
        uid,
        px + toSignedByte(e[202 + uid]),
        py + toSignedByte(e[303 + uid]),
        e[606 + uid],
        29,
        imageCache,
        uiState
      );
    }
  }

  // Pass 4: Construction dust effects (f.java s() d(74))
  if (state.dustEffects && state.dustEffects.length > 0) {
    for (const fx of state.dustEffects) {
      for (let j = 0; j < fx.h + 1; j += 2) {
        for (let k = 0; k < fx.w; k += 2) {
          const sx = (fx.x + k - camX) * CELL_WIDTH;
          const sy = originY + (fx.y - 1 + j - camY) * CELL_HEIGHT;
          drawAnimation(ctx, data, 74, sx, sy, (k * 2 + j) * 2 + fx.frame, imageCache);
        }
      }
    }
  }

  // Pass 4a2: Authentic villager death animations (anim 108, 18 frames)
  if (state.deathEffects && state.deathEffects.length > 0 && data.entityFieldOffsets) {
    const e = data.entityData;
    const fo = data.entityFieldOffsets;
    for (const fx of state.deathEffects) {
      if (getFogState(data, fx.x, fx.y) >= 2) continue;
      const sx = (fx.x - camX) * CELL_WIDTH;
      const sy = originY + (fx.y - camY) * CELL_HEIGHT;
      const prevAnim = e[fo[29] + fx.uid];
      const prevFrame = e[fo[30] + fx.uid];
      e[fo[29] + fx.uid] = fx.animId;
      e[fo[30] + fx.uid] = Math.min(fx.maxFrames - 1, fx.frame);
      ctx.save();
      if (fx.frame > fx.maxFrames - 5) {
        ctx.globalAlpha = Math.max(0.15, (fx.maxFrames - fx.frame) / 5);
      }
      drawEntitySprite(ctx, data, fx.uid, sx, sy, fx.dir, 29, imageCache, { selectedUnit: 0, hoverUnit: 0, animTick });
      ctx.restore();
      e[fo[29] + fx.uid] = prevAnim;
      e[fo[30] + fx.uid] = prevFrame;
    }
  }

  // Pass 4c: Authentic building placement ghost/frame preview + per-tile green/red footprint
  if (state.buildPreview) {
    const bp = state.buildPreview;
    const bx = (bp.x - camX) * CELL_WIDTH;
    const by = originY + (bp.y - camY) * CELL_HEIGHT;
    const bw = bp.width * CELL_WIDTH;
    const bh = bp.height * CELL_HEIGHT;
    ctx.save();
    // 1. Per-tile green (open) / red (blocked) footprint grid underneath the building frame
    for (let dy = 0; dy < bp.height; dy++) {
      for (let dx = 0; dx < bp.width; dx++) {
        const tx = bp.x + dx;
        const ty = bp.y + dy;
        const tileFree =
          tx >= 1 &&
          ty >= 1 &&
          tx < data.width - 1 &&
          ty < data.height - 1 &&
          data.occupancy[ty]?.[tx] === 0 &&
          (data.terrain[ty]?.[tx] & 0xff) < 175 &&
          getFogState(data, tx, ty) < 2;
        const cellOk = bp.valid || tileFree;
        ctx.fillStyle = cellOk ? 'rgba(98, 224, 78, 0.34)' : 'rgba(235, 58, 44, 0.48)';
        ctx.fillRect(bx + dx * CELL_WIDTH, by + dy * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);
        ctx.strokeStyle = cellOk ? 'rgba(205, 255, 165, 0.55)' : 'rgba(255, 150, 140, 0.65)';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + dx * CELL_WIDTH + 0.5, by + dy * CELL_HEIGHT + 0.5, CELL_WIDTH - 1, CELL_HEIGHT - 1);
      }
    }

    // 2. Authentic INTACT building structure ghost sprite (skip kind 0 ground tiles which sit on the green/red grid)
    if (bp.bType !== undefined && bp.bType >= 0 && bp.bType <= 11) {
      const shorts = data.shortSpriteTables;
      const bytes = data.byteSpriteTables;
      let idx = shorts[0][bp.bType + 1];
      let remaining = bytes[0][bp.bType + 1] & 0xff;
      // Advance past all leading kind===0 ground footprint entries exactly like drawMapObject Layer 1
      while (remaining > 0 && idx < bytes[3].length && (bytes[3][idx] & 7) === 0) {
        idx++;
        remaining--;
      }
      let resSkip = 0;
      ctx.globalAlpha = bp.valid ? 0.85 : 0.55;
      for (let i = 0; i < remaining && idx < shorts[1].length; i++, idx++) {
        const kind = bytes[3][idx] & 7;
        const stageReq = (bytes[3][idx] & 0xff) >>> 6;
        if (kind === 0 || stageReq > 1) continue;
        const xHi = ((shorts[1][idx] & 0xc000) >>> 14) << 7;
        const px = bx + toSignedByte(bytes[1][idx]) + xHi;
        const py = by + toSignedByte(bytes[2][idx]);
        if (kind === 1) {
          if (bp.bType === 6 && resSkip < 5) {
            resSkip++;
            continue;
          }
          if (bp.bType === 4 && resSkip < 1) {
            resSkip++;
            continue;
          }
          drawComposite(ctx, data, shorts[1][idx] & 0xfff, px, py, imageCache);
        } else if (kind === 2 || kind === 6) {
          drawAnimation(ctx, data, shorts[1][idx] & 0xfff, px, py, animTick, imageCache);
        }
      }
      ctx.globalAlpha = 1;
    }

    // 3. Authentic animated corner brackets (d(6)..d(9)) + outer frame border
    ctx.strokeStyle = bp.valid ? '#b7ff8f' : '#ff7b70';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
    if (bp.valid) {
      drawAnimation(ctx, data, 6, bx, by, animTick, imageCache);
      drawAnimation(ctx, data, 7, bx + bw, by, animTick, imageCache);
      drawAnimation(ctx, data, 8, bx, by + bh, animTick, imageCache);
      drawAnimation(ctx, data, 9, bx + bw, by + bh, animTick, imageCache);
    }
    ctx.restore();
  }

  // Pass 4c2: Box-selection rectangle (exact port of f.java:1906-1909 w() -> color 1105252)
  if (state.selectionBox) {
    const sb = state.selectionBox;
    const x1 = Math.min(sb.x0, sb.x1) + fracX;
    const y1 = Math.min(sb.y0, sb.y1) + fracY;
    const w = Math.abs(sb.x1 - sb.x0);
    const h = Math.abs(sb.y1 - sb.y0);
    if (w > 4 && h > 4) {
      ctx.save();
      ctx.fillStyle = 'rgba(16, 221, 36, 0.14)';
      ctx.fillRect(x1, y1, w, h);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeRect(x1 + 1.5, y1 + 1.5, w, h);
      ctx.strokeStyle = '#10dd24';
      ctx.strokeRect(x1 + 0.5, y1 + 0.5, w, h);
      ctx.restore();
    }
  }

  // Pass 4c3: Flying combat projectiles (spears & thrown stones with parabolic arc, f.java:1667 i())
  if (state.projectiles && state.projectiles.length > 0) {
    ctx.save();
    for (const p of state.projectiles) {
      const t = p.age / Math.max(1, p.duration);
      const wx = p.x0 + (p.x1 - p.x0) * t;
      const wy = p.y0 + (p.y1 - p.y0) * t;
      const arc = Math.sin(t * Math.PI) * 14;
      const px = (wx - camX) * CELL_WIDTH + 11;
      const py = originY + (wy - camY) * CELL_HEIGHT + 4 - arc;
      if (p.weaponId === 2) {
        // Thrown spear
        const ang = Math.atan2((p.y1 - p.y0) * CELL_HEIGHT, (p.x1 - p.x0) * CELL_WIDTH);
        ctx.strokeStyle = '#4e2f12';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px - Math.cos(ang) * 6, py - Math.sin(ang) * 6);
        ctx.lineTo(px + Math.cos(ang) * 5, py + Math.sin(ang) * 5);
        ctx.stroke();
        ctx.fillStyle = '#e5eef5';
        ctx.fillRect(px + Math.cos(ang) * 5 - 1, py + Math.sin(ang) * 5 - 1, 3, 3);
      } else {
        // Thrown stone
        ctx.fillStyle = '#262420';
        ctx.fillRect(px - 2, py - 2, 5, 5);
        ctx.fillStyle = '#a8a59c';
        ctx.fillRect(px - 1, py - 1, 3, 3);
      }
    }
    ctx.restore();
  }

  ctx.restore();

  // Pass 6: Authentic Top & Bottom HUD
  drawOriginalHud(ctx, data, state, imageCache);

  // Pass 6b: On-canvas warning banner (e.g. child cannot build/work/fight)
  if (state.warningBanner && state.warningBanner.text && performance.now() < state.warningBanner.until) {
    ctx.save();
    ctx.font = 'bold 8px monospace';
    const txt = state.warningBanner.text;
    const tw = Math.min(LOGICAL_WIDTH - 16, ctx.measureText(txt).width + 18);
    const bx = Math.floor((LOGICAL_WIDTH - tw) / 2);
    const by = (state.selectedUnit > 0 ? 74 : 26);
    ctx.fillStyle = 'rgba(120, 22, 14, 0.92)';
    ctx.fillRect(bx, by, tw, 18);
    ctx.strokeStyle = '#ffd25a';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx + 0.5, by + 0.5, tw - 1, 17);
    ctx.fillStyle = '#fff59c';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(txt, LOGICAL_WIDTH / 2, by + 9);
    ctx.restore();
  }

  // Pass 7: Authentic /0/d0 Story Dialogue Scroll or Victory/Defeat Result Banner
  if (state.storyDialog && state.storyDialog.pages?.length > 0) {
    const dlg = state.storyDialog;
    const page = dlg.pages[dlg.index] || dlg.pages[0];
    ctx.save();
    ctx.fillStyle = 'rgba(18, 12, 5, 0.52)';
    ctx.fillRect(0, 22, LOGICAL_WIDTH, LOGICAL_HEIGHT - 44);
    const bw = Math.min(340, LOGICAL_WIDTH - 20);
    const bh = 144;
    const bx = Math.floor((LOGICAL_WIDTH - bw) / 2);
    const by = Math.max(76, LOGICAL_HEIGHT - bh - 34);
    ctx.fillStyle = '#473010';
    ctx.fillRect(bx - 2, by - 2, bw + 4, bh + 4);
    ctx.fillStyle = '#e5d58e';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = '#8b6629';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx + 2.5, by + 2.5, bw - 5, bh - 5);

    ctx.fillStyle = '#5a2d0c';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`${dlg.title} (${dlg.index + 1}/${dlg.pages.length})`, bx + 8, by + 7);

    // Word-wrap authentic /0/d0 dialogue text inside 204px
    ctx.fillStyle = '#241706';
    ctx.font = '9px monospace';
    const words = (page.text || '').split(' ');
    let line = '';
    let ly = by + 23;
    const maxW = bw - 16;
    const maxY = by + bh - 22;
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width > maxW && line) {
        if (ly <= maxY) ctx.fillText(line, bx + 8, ly);
        ly += 11;
        line = w;
      } else {
        line = test;
      }
    }
    if (line && ly <= maxY) ctx.fillText(line, bx + 8, ly);

    ctx.fillStyle = '#6c4916';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CLICK / ENTER: TIẾP TỤC · ESC: BỎ QUA', LOGICAL_WIDTH / 2, by + bh - 13);
    ctx.restore();
  } else if (state.missionResult) {
    const res = state.missionResult;
    const isWin = res.status === 'victory';
    ctx.save();
    ctx.fillStyle = 'rgba(12, 10, 6, 0.68)';
    ctx.fillRect(0, 22, LOGICAL_WIDTH, LOGICAL_HEIGHT - 44);
    const bw = 212;
    const bh = 180;
    const bx = Math.floor((LOGICAL_WIDTH - bw) / 2);
    const by = Math.max(40, Math.floor((LOGICAL_HEIGHT - bh) / 2));
    ctx.fillStyle = isWin ? '#2d4a1e' : '#571b16';
    ctx.fillRect(bx - 2, by - 2, bw + 4, bh + 4);
    ctx.fillStyle = '#efe2a2';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = isWin ? '#5a8e36' : '#a93226';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx + 2, by + 2, bw - 4, bh - 4);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = isWin ? '#246619' : '#9c1c12';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(isWin ? 'HURRAH! CHIẾN THẮNG!' : 'BẠN ĐÃ THẤT BẠI!', LOGICAL_WIDTH / 2, by + 10);

    ctx.fillStyle = '#33220a';
    ctx.font = '9px monospace';
    const sc = res.score;
    const rows = [
      `Dân số còn lại: ${sc.population}`,
      `Công trình đã xây: ${sc.buildingsBuilt}`,
      `Kẻ thù đã tiêu diệt: ${sc.enemiesKilled}`,
      `Nhà địch bị phá hủy: ${sc.enemyBuildingsDestroyed}`,
      `Tổng tài nguyên: ${sc.resourcesTotal}`,
    ];
    rows.forEach((txt, i) => {
      ctx.fillText(txt, LOGICAL_WIDTH / 2, by + 34 + i * 16);
    });

    ctx.fillStyle = '#5a2d0c';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`TỔNG ĐIỂM: ${sc.totalScore}`, LOGICAL_WIDTH / 2, by + 124);

    ctx.fillStyle = '#473010';
    ctx.font = 'bold 8px monospace';
    ctx.fillText(isWin ? 'CLICK MÀN HÌNH / ENTER: SANG MÀN TIẾP' : 'CLICK MÀN HÌNH / ENTER: CHƠI LẠI', LOGICAL_WIDTH / 2, by + 154);
    ctx.restore();
  } else if (state.showMinimap) {
    drawMinimapOverlay(ctx, data, state);
  }

  // Pass 8: Authentic in-game hand cursor synced 1:1 with the player's web mouse (replaces OS cursor!)
  if (state.pointerPos?.visible) {
    const myTribe = state.localTribe ?? 0;
    let cursorAnim = 32;
    if (!state.canvasMenu && !state.showMinimap && !state.missionResult && (state.selectedUnit > 0 || state.selectedUnits?.size > 0)) {
      const targetOcc = hoverCellOcc;
      const targetTile = curWY >= 0 && curWY < data.height && curWX >= 0 && curWX < data.width ? data.terrain[curWY][curWX] & 0xff : 0;
      const isEnemyUnit = myTribe === 1 ? (targetOcc >= 1 && targetOcc <= 50) : (targetOcc >= 51 && targetOcc <= 100);
      const isEnemyBld = buildingOwner(targetOcc) === (myTribe === 1 ? 0 : 1);
      const isHostileOrGatherable =
        isItemProp(targetOcc) ||
        targetOcc === -124 ||
        targetOcc === -125 ||
        targetOcc === -127 ||
        (targetTile >= 180 && targetTile <= 231) ||
        isEnemyBld ||
        isEnemyUnit ||
        isWildAnimal(targetOcc);
      cursorAnim = isHostileOrGatherable ? 34 : 33;
    }
    drawAnimation(ctx, data, cursorAnim, Math.round(state.pointerPos.x), Math.round(state.pointerPos.y), Math.floor(animTick / 2), imageCache);
  }
}

export function getMinimapRect(data) {
  const w = data?.width || 40;
  const h = data?.height || 32;
  const boxW = Math.min(280, LOGICAL_WIDTH - 32);
  const boxH = Math.min(240, LOGICAL_HEIGHT - 108);
  const maxW = boxW - 16;
  const maxH = boxH - 42;
  const scale = Math.min(maxW / w, maxH / h);
  const mapW = Math.max(40, Math.floor(w * scale));
  const mapH = Math.max(40, Math.floor(h * scale));
  const boxX = Math.floor((LOGICAL_WIDTH - boxW) / 2);
  const boxY = Math.max(74, Math.floor((LOGICAL_HEIGHT - boxH) / 2));
  const mapX = boxX + Math.floor((boxW - mapW) / 2);
  const mapY = boxY + 20 + Math.floor((maxH - mapH) / 2);
  return { boxX, boxY, boxW, boxH, mapX, mapY, mapW, mapH, scale, w, h };
}

function drawMinimapOverlay(ctx, data, state) {
  const mm = getMinimapRect(data);
  const e = data.entityData;
  const chiefId = data.resources?.[0]?.[17] ?? 1;

  ctx.save();
  ctx.fillStyle = 'rgba(10, 14, 10, 0.52)';
  ctx.fillRect(0, 70, LOGICAL_WIDTH, LOGICAL_HEIGHT - 92);

  // Authentic wooden/parchment minimap frame
  ctx.fillStyle = '#3e2a0f';
  ctx.fillRect(mm.boxX - 2, mm.boxY - 2, mm.boxW + 4, mm.boxH + 4);
  ctx.fillStyle = '#d4c37b';
  ctx.fillRect(mm.boxX, mm.boxY, mm.boxW, mm.boxH);
  ctx.strokeStyle = '#6c4d1f';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(mm.boxX + 2.5, mm.boxY + 2.5, mm.boxW - 5, mm.boxH - 5);

  ctx.fillStyle = '#472a0b';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(`BẢN ĐỒ NHỎ (${mm.w}×${mm.h}) · PHÍM 3 ĐÓNG`, LOGICAL_WIDTH / 2, mm.boxY + 6);

  // Map canvas backdrop
  ctx.fillStyle = '#080b08';
  ctx.fillRect(mm.mapX - 1, mm.mapY - 1, mm.mapW + 2, mm.mapH + 2);

  const cellW = Math.max(1, Math.ceil(mm.scale));
  const cellH = Math.max(1, Math.ceil(mm.scale));

  for (let y = 0; y < mm.h; y++) {
    const py = mm.mapY + Math.floor(y * mm.scale);
    for (let x = 0; x < mm.w; x++) {
      const fog = getFogState(data, x, y);
      if (fog === 2) continue;
      const tile = data.terrain[y][x] & 0xff;
      const occ = data.occupancy[y][x];
      let color = '#49942c'; // grass
      if (occ === -127 || (tile >= 29 && tile <= 40)) color = '#2d68bf'; // water
      else if (occ === -125) color = '#83878c'; // stone cliff
      else if (occ === -124 || (tile >= 180 && tile <= 231)) color = '#1e6322'; // forest
      else if (tile >= 10 && tile < 29) color = '#a3843e'; // dirt/path

      if (occ <= -1 && occ >= -30) color = '#f4d35e'; // player building
      else if (occ <= -31 && occ >= -60) color = '#df4528'; // enemy building
      else if (fog === 0 && occ >= 1 && occ <= 50) color = occ === chiefId ? '#ffff66' : '#5eff5a'; // player villager
      else if (fog === 0 && occ >= 51 && occ <= 100) color = '#ff362e'; // enemy warrior
      else if (fog === 0 && occ >= 101 && occ <= 122) color = '#f09c3e'; // wild animal

      ctx.fillStyle = color;
      ctx.fillRect(mm.mapX + Math.floor(x * mm.scale), py, cellW, cellH);
      if (fog === 1 && occ >= 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.36)';
        ctx.fillRect(mm.mapX + Math.floor(x * mm.scale), py, cellW, cellH);
      }
    }
  }

  // Highlight player villagers & visible enemies cleanly on top so dots stay crisp on large 96x96 maps
  for (let id = 1; id <= 100; id++) {
    if ((e[1919 + id] & 0xff) <= 0) continue;
    const ux = e[id] & 0xff;
    const uy = e[101 + id] & 0xff;
    if (id > 50 && getFogState(data, ux, uy) !== 0) continue;
    ctx.fillStyle = id > 50 ? '#ff332b' : id === chiefId ? '#ffff66' : '#63ff5c';
    ctx.fillRect(mm.mapX + Math.floor(ux * mm.scale), mm.mapY + Math.floor(uy * mm.scale), Math.max(2, cellW), Math.max(2, cellH));
  }

  // Live camera viewport rectangle
  const camX = state.cameraX ?? 0;
  const camY = state.cameraY ?? 0;
  const cols = Math.max(1, Math.floor(LOGICAL_WIDTH / CELL_WIDTH));
  const rows = Math.max(1, Math.floor((LOGICAL_HEIGHT - (data.mapTopUi ?? 22) - (data.bottomUi ?? 22)) / CELL_HEIGHT));
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.strokeRect(
    mm.mapX + Math.floor(camX * mm.scale) + 0.5,
    mm.mapY + Math.floor(camY * mm.scale) + 0.5,
    Math.max(4, Math.floor(cols * mm.scale)),
    Math.max(4, Math.floor(rows * mm.scale))
  );

  // Legend footer
  ctx.fillStyle = '#3b2408';
  ctx.font = 'bold 7px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CLICK BẢN ĐỒ ĐỂ NHẢY CAMERA · XANH: TA · ĐỎ: ĐỊCH', LOGICAL_WIDTH / 2, mm.boxY + mm.boxH - 13);
  ctx.restore();
}
