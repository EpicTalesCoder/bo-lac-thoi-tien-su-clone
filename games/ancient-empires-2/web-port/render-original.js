import { s8 } from './format.js';
import { drawRegionMIDP, MIDP_ANCHOR, withMIDPClip } from './ancient-empires-midp.js';

export { drawRegionMIDP, MIDP_ANCHOR };
const MIDP = MIDP_ANCHOR;
export const midpAnchorPosition = (x, y, width, height, anchor = MIDP_ANCHOR.LEFT | MIDP_ANCHOR.TOP) => ({
  x: (anchor & MIDP_ANCHOR.HCENTER) ? x - (width >> 1) : (anchor & MIDP_ANCHOR.RIGHT) ? x - width : x,
  y: (anchor & MIDP_ANCHOR.VCENTER) ? y - (height >> 1) : (anchor & MIDP_ANCHOR.BOTTOM) ? y - height : y,
});

function drawAssetFrame(ctx, assets, family, frameIndex, x, y, anchor) {
  const meta = assets.sprites[family];
  const frame = meta?.frames?.[frameIndex];
  if (!frame) return false;
  const sheet = assets.images[family];
  let image = sheet;
  let sx = 0;
  let sy = 0;
  if (sheet) {
    const sheetColumns = Math.floor(sheet.naturalWidth / meta.frameWidth);
    if (sheetColumns < 1) return false;
    sx = (frame.sourceFrame % sheetColumns) * meta.frameWidth;
    sy = Math.floor(frame.sourceFrame / sheetColumns) * meta.frameHeight;
  } else {
    image = assets.frameImages?.[family]?.[frame.sourceFrame];
    if (!image) return false;
  }
  const anchorX = x + frame.offsetX + (frame.anchorOffset?.[0] ?? 0);
  const anchorY = y + frame.offsetY + (frame.anchorOffset?.[1] ?? 0);
  drawRegionMIDP(ctx, image, sx, sy, meta.frameWidth, meta.frameHeight,
    frame.transform, anchorX, anchorY, anchor);
  return true;
}

function drawFrame(ctx, assets, family, frameIndex, x, y, anchor) {
  return drawAssetFrame(ctx, assets, family, frameIndex, x, y, anchor);
}

function drawSheetFrame(ctx, image, meta, frame, drawX, drawY) {
  if (!image || !meta || !frame) return false;
  const cols = Math.floor(image.naturalWidth / meta.frameWidth);
  if (cols < 1) return false;
  const sx = (frame.sourceFrame % cols) * meta.frameWidth;
  const sy = Math.floor(frame.sourceFrame / cols) * meta.frameHeight;
  drawRegionMIDP(ctx, image, sx, sy, meta.frameWidth, meta.frameHeight,
    frame.transform ?? 0, drawX + (frame.offsetX ?? 0), drawY + (frame.offsetY ?? 0), MIDP.LEFT | MIDP.TOP);
  return true;
}

function drawMapTile(ctx, assets, rawTile, x, y) {
  if (rawTile < 37) return drawFrame(ctx, assets, 'tiles0', rawTile, x, y, MIDP_ANCHOR.LEFT | MIDP_ANCHOR.TOP);
  const encodedBuilding = rawTile - 37;
  if (encodedBuilding < 0 || encodedBuilding >= 10) return false;
  const palette = Math.floor(encodedBuilding / 2);
  const frameIndex = encodedBuilding % 2;
  const image = assets.buildingPaletteImages?.[palette] ?? assets.images.buildings;
  const view = { ...assets, images: { ...assets.images, buildings: image } };
  return drawFrame(ctx, view, 'buildings', frameIndex, x, y, MIDP_ANCHOR.LEFT | MIDP_ANCHOR.TOP);
}

// Port of i.java:2907-2948 and i.java:3180-3410. Renders decoded terrain,
// range highlights (alpha.png), movement path (i.java:3434), units, and cursor.
export function renderOriginalBoard(ctx, {
  map, assets, cameraX = 0, cameraY = 0, viewportWidth = 240, viewportHeight = 288,
  units = map.units, cursor = null, overlays = [],
  rangeCells = null, targetCells = null, path = null,
  waterAnimFrame = 0, floatTexts = null, mapEffects = null,
}) {
  if (!ctx || !map || !assets) throw new TypeError('renderOriginalBoard requires context, map and decoded assets');
  ctx.imageSmoothingEnabled = false;
  withMIDPClip(ctx, 0, 0, viewportWidth, viewportHeight, () => {
    const visibleColumns = Math.ceil(viewportWidth / 24) + 1;
    const visibleRows = Math.ceil(viewportHeight / 24) + 1;
    const startX = Math.max(0, Math.floor(cameraX / 24));
    const startY = Math.max(0, Math.floor(cameraY / 24));
    const endX = Math.min(map.width, startX + visibleColumns);
    const endY = Math.min(map.height, startY + visibleRows);
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const rawTile = s8(map.tiles[x][y]);
        const animTile = (rawTile === 1 || rawTile === 2) && (waterAnimFrame & 1) !== 0
          ? (rawTile === 1 ? 2 : 1)
          : rawTile;
        const drawX = x * 24 - cameraX;
        const drawY = y * 24 - cameraY;
        drawMapTile(ctx, assets, animTile, drawX, drawY);
        if (rawTile === 27 && assets.sprites?.smoke && (assets.images?.smoke || assets.frameImages?.smoke)) {
          // Port of i.java:2497: ruined village emits rising smoke until repaired
          const smokeLen = Math.max(1, assets.sprites.smoke.frames?.length ?? 4);
          drawFrame(ctx, assets, 'smoke', waterAnimFrame % smokeLen, drawX, drawY - 4, MIDP.LEFT | MIDP.TOP);
        }
        if (y + 1 < map.height && assets.terrain.properties[s8(map.tiles[x][y + 1])] === 9) {
          // Port of i.java:2941-2943: original overhang/town overlay frame.
          drawFrame(ctx, assets, 'tiles0', 28, drawX, drawY, MIDP.LEFT | MIDP.TOP);
        }
        for (const overlay of overlays) {
          if (overlay.x === x && overlay.y === y && Number.isInteger(overlay.frameIndex)) {
            drawFrame(ctx, assets, overlay.sprite ?? 'tiles0', overlay.frameIndex, drawX, drawY, MIDP.LEFT | MIDP.TOP);
          }
        }
      }
    }

    // Port of i.java:3060-3069 & lang[199]: red alpha movement range squares under units.
    if (rangeCells && rangeCells.length > 0) {
      const alphaImg = assets.images?.alpha;
      for (const [rx, ry] of rangeCells) {
        const dx = rx * 24 - cameraX;
        const dy = ry * 24 - cameraY;
        if (alphaImg) {
          drawRegionMIDP(ctx, alphaImg, 0, 0, 24, 24, 0, dx, dy, MIDP.LEFT | MIDP.TOP);
        } else {
          ctx.fillStyle = 'rgba(225, 48, 86, 0.36)';
          ctx.fillRect(dx, dy, 24, 24);
        }
      }
    }

    if (targetCells && targetCells.length > 0) {
      ctx.save();
      ctx.strokeStyle = '#ff3838';
      ctx.lineWidth = 2;
      for (const [tx, ty] of targetCells) {
        const dx = tx * 24 - cameraX;
        const dy = ty * 24 - cameraY;
        ctx.strokeRect(dx + 1, dy + 1, 22, 22);
      }
      ctx.restore();
    }

    // Port of i.java:3434-3477: red movement route ribbon and arrow cap.
    if (path && path.length > 1) {
      ctx.save();
      ctx.fillStyle = '#e10012';
      for (let i = 0; i < path.length; i++) {
        const [px, py] = path[i];
        const tileX = px * 24 - cameraX;
        const tileY = py * 24 - cameraY;
        const cx = tileX + 12;
        const cy = tileY + 12;
        if (i > 0) {
          const [prevX, prevY] = path[i - 1];
          if (prevX === px + 1) ctx.fillRect(cx - 4, cy - 4, 16, 8);
          else if (prevX === px - 1) ctx.fillRect(tileX, cy - 4, 16, 8);
          else if (prevY === py + 1) ctx.fillRect(cx - 4, cy - 4, 8, 16);
          else if (prevY === py - 1) ctx.fillRect(cx - 4, tileY, 8, 16);
        }
        if (i < path.length - 1) {
          const [nextX, nextY] = path[i + 1];
          if (nextX === px + 1) ctx.fillRect(cx - 4, cy - 4, 16, 8);
          else if (nextX === px - 1) ctx.fillRect(tileX, cy - 4, 16, 8);
          else if (nextY === py + 1) ctx.fillRect(cx - 4, cy - 4, 8, 16);
          else if (nextY === py - 1) ctx.fillRect(cx - 4, tileY, 8, 16);
        } else {
          const [prevX, prevY] = path[i - 1];
          const dx = Math.sign(px - prevX);
          const dy = Math.sign(py - prevY);
          ctx.fillStyle = '#e10012';
          ctx.beginPath();
          ctx.moveTo(cx + dx * 7, cy + dy * 7);
          ctx.lineTo(cx - dx * 5 - dy * 6, cy - dy * 5 + dx * 6);
          ctx.lineTo(cx - dx * 5 + dy * 6, cy - dy * 5 - dx * 6);
          ctx.closePath();
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // Port of i.java:548-608, 3421-3425 and c.java:657-682: strategic map units
    // render from 24x24 unit_icons (palette 0 grayscale when acted, else team
    // palette 1..4), tombstone when killed (action === 3), king_head_icons
    // overlay for King (type === 9), and HP text when hp < 100.
    for (const unit of units) {
      if (unit.action === 4) continue;
      const drawX = unit.x * 24 - cameraX;
      const drawY = unit.y * 24 - cameraY;
      if (unit.action === 3 || unit.hp <= 0) {
        if (unit.type !== 9 && unit.type !== 10 && unit.type !== 11 && unit.x >= 0 && unit.y >= 0) {
          const tomb = assets.images?.tombstone;
          if (tomb) drawRegionMIDP(ctx, tomb, 0, 0, 24, 24, 0, drawX, drawY, MIDP.LEFT | MIDP.TOP);
        }
        continue;
      }

      const acted = unit.action === 1 || unit.action === 2;
      const teamPalette = Math.max(1, unit.palette ?? 1);
      const renderPalette = acted ? 0 : teamPalette;
      const animFrame = (unit.frameIndex ?? 0) & 1;

      const iconMeta = assets.sprites?.unit_icons;
      const unitIconsImg = assets.unitIconPalettes?.[renderPalette]
        ?? assets.coloredPalettes?.[renderPalette]?.unit_icons
        ?? (renderPalette === 1 ? assets.images?.unit_icons : null)
        ?? assets.images?.unit_icons;

      if (iconMeta && unitIconsImg) {
        drawSheetFrame(ctx, unitIconsImg, iconMeta, iconMeta.frames?.[animFrame * 12 + (unit.type ?? 0)], drawX, drawY);

        if (unit.type === 9) {
          const headMeta = assets.sprites?.king_head_icons;
          const headImg = acted
            ? (assets.kingHeadPalettes?.[0] ?? assets.images?.king_head_icons)
            : (assets.images?.king_head_icons ?? assets.kingHeadPalettes?.[1]);
          const headTeam = Number.isInteger(unit.kingHead)
            ? unit.kingHead
            : Math.max(0, Math.min(3, teamPalette - 1));
          drawSheetFrame(ctx, headImg, headMeta, headMeta?.frames?.[headTeam * 2 + animFrame], drawX, drawY);
        }

        const statusMeta = assets.sprites?.status;
        const statusImg = assets.images?.status;
        if (statusMeta && statusImg && (unit.status ?? 0) !== 0) {
          let sxOff = 0;
          if ((unit.status & 1) !== 0) {
            drawSheetFrame(ctx, statusImg, statusMeta, statusMeta.frames?.[0], drawX + 16, drawY + 1);
            sxOff += 7;
          }
          if ((unit.status & 2) !== 0) {
            drawSheetFrame(ctx, statusImg, statusMeta, statusMeta.frames?.[1], drawX + 16 - sxOff, drawY + 1);
          }
        }

        if (typeof unit.hp === 'number' && unit.hp < 100 && typeof ctx.fillText === 'function') {
          ctx.save();
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'bottom';
          ctx.lineWidth = 2;
          ctx.lineJoin = 'round';
          ctx.strokeStyle = '#120d16';
          ctx.strokeText(String(unit.hp), drawX + 1, drawY + 23);
          ctx.fillStyle = '#fff5cf';
          ctx.fillText(String(unit.hp), drawX + 1, drawY + 23);
          ctx.restore();
        }
        continue;
      }

      // Fallback only when unit_icons sheet is unavailable (isolated test fixtures).
      const record = assets.unitRecords?.[unit.type];
      const family = assets.unitFamilies?.[unit.type];
      if (!family || !record) continue;
      const frameIndex = unit.frameIndex ?? 0;
      const [offsetX = 0, offsetY = 0] = record.frameOffsets[frameIndex] ?? [];
      const familyMeta = assets.sprites[family];
      const mapped = familyMeta?.frames?.[frameIndex];
      if (!mapped) continue;
      const palette = unit.palette ?? 0;
      const paletteSheet = assets.coloredPalettes?.[palette]?.[family];
      const original = assets.images[family];
      const image = paletteSheet?.naturalWidth ? paletteSheet : original;
      const imageFrames = Array.isArray(paletteSheet) ? paletteSheet : assets.frameImages?.[family];
      const selectedImage = imageFrames?.[mapped.sourceFrame] ?? image;
      if (!selectedImage) continue;
      const columns = imageFrames ? 1 : Math.floor(selectedImage.naturalWidth / familyMeta.frameWidth);
      if (columns < 1) continue;
      const sx = imageFrames ? 0 : (mapped.sourceFrame % columns) * familyMeta.frameWidth;
      const sy = imageFrames ? 0 : Math.floor(mapped.sourceFrame / columns) * familyMeta.frameHeight;
      drawRegionMIDP(ctx, selectedImage, sx, sy, familyMeta.frameWidth, familyMeta.frameHeight,
        mapped.transform, drawX + offsetX, drawY + offsetY, MIDP.LEFT | MIDP.TOP);
    }

    if (cursor) {
      drawFrame(ctx, assets, 'cursor', cursor.frameIndex ?? 0,
        cursor.x * 24 - cameraX, cursor.y * 24 - cameraY, MIDP.LEFT | MIDP.TOP);
    }

    // Port of i.java:4958-4970, 5163-5176, 5350-5388: scripted/map spell & smoke effects (redspark, spark, b_smoke)
    if (mapEffects && mapEffects.length > 0) {
      for (const fx of mapEffects) {
        const meta = assets.sprites?.[fx.sprite];
        if (!meta) continue;
        const fxFrame = Math.min(Math.max(0, fx.frame ?? 0), Math.max(0, (meta.frames?.length ?? 1) - 1));
        const px = fx.x * 24 + 12 - cameraX + (fx.offsetX ?? 0);
        const py = fx.y * 24 + 12 - cameraY + (fx.offsetY ?? 0);
        drawFrame(ctx, assets, fx.sprite, fxFrame, px, py, MIDP.HCENTER | MIDP.VCENTER);
      }
    }

    // Port of i.java:2382: floating +20 heal / combat popups on strategic map
    if (floatTexts && floatTexts.length > 0 && typeof ctx.fillText === 'function') {
      ctx.save();
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      for (const ft of floatTexts) {
        const fx = ft.x * 24 - cameraX + 12;
        const fy = ft.y * 24 - cameraY + 6 - (ft.offsetY ?? 0);
        ctx.strokeStyle = '#120d16';
        ctx.strokeText(ft.text, fx, fy);
        ctx.fillStyle = ft.color || '#7dff7d';
        ctx.fillText(ft.text, fx, fy);
      }
      ctx.restore();
    }
  });
}

export function drawOriginalMapCell(ctx, assets, x, y, tileId) {
  const meta = assets.sprites.tiles0;
  const frame = meta.frames[tileId];
  if (!frame) return false;
  const columns = Math.floor(assets.images.tiles0.naturalWidth / meta.frameWidth);
  const sx = (frame.sourceFrame % columns) * meta.frameWidth;
  const sy = Math.floor(frame.sourceFrame / columns) * meta.frameHeight;
  drawRegionMIDP(ctx, assets.images.tiles0, sx, sy, meta.frameWidth, meta.frameHeight, frame.transform, x, y, MIDP.LEFT | MIDP.TOP);
  return true;
}
