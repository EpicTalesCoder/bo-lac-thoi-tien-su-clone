import { drawRectMIDP, drawRegionMIDP, withMIDPClip } from './midp-graphics.js';
import { lerpCoordRound } from './tt-core.js';

// Port of e.java:1933-1954 & 3059-3080 (`a` / `b` sprite blit).
// Actor limb parts use `ca` offsets directly; non-limb sprites (`applyOffsets=true`) apply `cu2` ox/oy.
export function drawCu2Frame(ctx, images, meta, x, y, facing = 1, applyOffsets = false) {
  if (!meta || meta[2] <= 0 || meta[3] <= 0) return;
  const [sourceX, sourceY, width, height, offsetX, offsetY, imageIndex] = meta;
  const bankIndex = imageIndex + (facing < 0 && imageIndex < 5 ? 9 : 0);
  const sheet = images[`u${bankIndex}`] || images[`u${imageIndex}`];
  if (!sheet) return;
  let clipX = facing === -1 ? x - width : x;
  let clipY = y;
  if (applyOffsets) {
    clipX = x;
    if (offsetX !== 0) {
      clipX += facing === 1 ? offsetX : (offsetX * facing - width);
    }
    clipY += offsetY;
  }
  const drawX = facing === -1 && imageIndex < 5
    ? clipX - (sheet.width - width - sourceX)
    : clipX - sourceX;
  const drawY = clipY - sourceY;
  withMIDPClip(ctx, Math.round(clipX), Math.round(clipY), width, height, () => ctx.drawImage(sheet, Math.round(drawX), Math.round(drawY)));
}

// Port of e.java:1761-1783 — align carried/base flag cloth sleeve directly with pole in both facings.
export function drawCtfFlag(ctx, images, cu2, { fx, fy, team = 0, animFrame = 0, facing = 1 }) {
  const ao = 103;
  const anim = ((animFrame || 0) % 3 + 3) % 3;
  const dir = facing < 0 ? -1 : 1;
  const flagSprite = team === 0 ? ao + anim : ao - 4 + anim;
  const flagMeta = cu2?.[flagSprite];
  const poleMeta = cu2?.[98];
  const poleW = poleMeta?.[2] ?? 2;
  const clothOffset = dir === 1 ? (cu2?.[ao + 1]?.[2] ?? flagMeta?.[2] ?? 15) : poleW;
  const clothH = cu2?.[ao]?.[3] ?? flagMeta?.[3] ?? 14;
  if (flagMeta && clothOffset > 0) {
    const clothX = fx - clothOffset + 2;
    drawCu2Frame(ctx, images, flagMeta, clothX, fy - clothH - 2, dir, true);
  }
  drawCu2Frame(ctx, images, poleMeta, fx, fy - 2, dir, true);
}

function drawArenaBackground(ctx, state, assets) {
  const detailLevel = state.detailLevel ?? 2;
  const background = state.background || (state.backgroundName ? assets.images[state.backgroundName] : null);
  const vw = state.viewport.width;
  const vh = state.viewport.height;
  const worldW = Math.max(vw, state.level?.worldWidth ?? vw);
  const maxCamY = Math.max(0, (state.level?.worldHeight ?? vh) - vh);
  const camX = Math.max(0, state.camera?.x ?? 0);
  const camY = Math.max(0, state.camera?.y ?? 0);

  if (detailLevel === 2 && background) {
    // e.java:1973-1982 exact proportional horizontal parallax + vertical camera bg offset
    const bgW = Math.max(1, background.width);
    const bgH = Math.max(1, background.height);
    const scrollX = Math.floor((bgW * camX) / worldW);
    const firstTile = Math.floor(scrollX / bgW);
    const bgY = maxCamY <= 0 || bgH <= vh ? 0 : -Math.floor((camY * (bgH - vh)) / maxCamY);
    for (let tile = firstTile; tile * bgW - scrollX < vw; tile++) {
      const bx = tile * bgW - scrollX;
      for (let by = bgY; by < vh; by += bgH) {
        drawRegionMIDP(ctx, background, 0, 0, bgW, bgH, 0, bx, by, 20);
      }
    }
  } else if (detailLevel === 1) {
    // e.java:1983-1993 vertical green gradient band
    const grad = ctx.createLinearGradient(0, 0, 0, vh);
    grad.addColorStop(0, '#c6e2c6');
    grad.addColorStop(1, '#008000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, vw, vh);
  } else {
    ctx.fillStyle = 'rgb(0,128,0)';
    ctx.fillRect(0, 0, vw, vh);
  }
}

// Port of e.java:1890-1967. Character pose arrays are original ca records;
// each `[offsetX, offsetY, frameId]` resolves through original cu2 metadata.
function drawActors(ctx, state, images) {
  const { camera, actors, tables } = state;
  const alpha = state.interpValid ? (state.interpAlpha ?? 1) : 1;
  for (const actor of actors) {
    if (actor.status !== 1 && actor.animation !== 5 && actor.animation !== 6) continue;
    const renderX = (state.interpValid && typeof actor.prevX === 'number')
      ? lerpCoordRound(actor.prevX, actor.x, alpha)
      : actor.x;
    const renderY = (state.interpValid && typeof actor.prevY === 'number')
      ? lerpCoordRound(actor.prevY, actor.y, alpha)
      : actor.y;
    const screenX = Math.round(renderX - camera.x);
    const screenY = Math.round(renderY - camera.y);
    if (screenX < -32 || screenX > state.viewport.width + 32 || screenY < -48 || screenY > state.viewport.height + 48) continue;

    // Health bar + cU ground shadow for living actors (e.java:1917-1930)
    if (actor.status === 1) {
      const barW = Math.max(12, actor.width || 34);
      const halfW = barW >> 1;
      const barY = screenY - (actor.height || 36) - 10;
      const fillW = Math.max(0, Math.min(barW - 1, actor.healthBarWidth ?? barW - 1));
      ctx.fillStyle = actor.healthBarColor || '#00ff00';
      if (fillW > 1) ctx.fillRect(screenX - halfW + 1, barY + 1, fillW - 1, 5);
      drawRectMIDP(ctx, screenX - halfW, barY, barW - 1, 5, '#000000');

      if (state.showPlayerNames && actor.name && typeof state.drawBitmapText === 'function') {
        const fontH = state.fontLineHeight || 13;
        state.drawBitmapText(ctx, actor.name, screenX, barY - fontH - 1, 17);
      }

      if (!actor.shadowOverPit && typeof actor.shadowY === 'number' && state.level) {
        const dropDist = Math.max(0, actor.shadowY - renderY);
        const rawW = barW - dropDist;
        const shadowScreenY = Math.round(actor.shadowY - camera.y);
        if (rawW > 2 && shadowScreenY > -8 && shadowScreenY < state.viewport.height + 8) {
          let sx = screenX - halfW + (dropDist >> 1);
          let sw = rawW;
          if (actor.shadowClipSide === 1 && actor.shadowEdgeClip > 0) {
            const tileRight = ((Math.floor(renderX / 16) + 1) << 4) - camera.x;
            sw = Math.min(sw, Math.max(0, Math.round(tileRight - sx)));
          } else if (actor.shadowClipSide === -1 && actor.shadowEdgeClip > 0) {
            const tileLeft = (Math.floor(renderX / 16) << 4) - camera.x;
            const cut = Math.max(0, Math.round(tileLeft - sx));
            sx += cut;
            sw -= cut;
          }
          if (sw > 2) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(Math.round(sx), shadowScreenY - 1, Math.round(sw), 6, 3);
            else ctx.rect(Math.round(sx), shadowScreenY - 1, Math.round(sw), 6);
            ctx.fill();
          }
        }
      }
    }

    const pose = tables.poseForActor(actor);
    const facing = actor.facing === 0 ? 1 : actor.facing;
    let poseLen = pose.length;
    if (actor.weapon === 0 && !actor.bloodyTimer && actor.animation === 2 && actor.animationFrame > 0 && poseLen >= 3) {
      poseLen -= 3; // Clean vs bloody chainsaw (e.java:1912-1915)
    }
    for (let part = 0; part + 2 < poseLen; part += 3) {
      const frame = pose[part + 2];
      const meta = tables.cu2[frame];
      if (!meta || meta[2] <= 0 || meta[3] <= 0) continue;
      const partX = screenX + (facing > 0 ? pose[part] : -pose[part]);
      const partY = screenY + pose[part + 1] - meta[3];
      drawCu2Frame(ctx, images, meta, partX, partY, facing, false);
    }

    // Animated fire / plasma burn overlay on hit fighters (e.java:1956-1967)
    if (actor.status === 1 && actor.burnTimer > 0) {
      const burnFrameId = (actor.burnSprite || 43) + ((actor.burnFrame || 0) % 3);
      const burnMeta = tables.cu2[burnFrameId];
      if (burnMeta && burnMeta[2] > 0 && burnMeta[3] > 0) {
        const burnAnchorH = tables.cu2[46]?.[3] ?? burnMeta[3];
        const burnY = screenY - burnAnchorH - (actor.inAir ? 12 : 0);
        drawCu2Frame(ctx, images, burnMeta, screenX, burnY, facing, true);
      }
    }
  }
}

// Port of e.java:1972-2031. `cc` metadata and level-specific `l0`/`l1` sheets
// define tile source rectangles and clipping. `bg0/bg1` are background layers.
function drawMap(ctx, state, images) {
  const { level, camera, tables } = state;
  const startX = Math.max(0, Math.floor(camera.x / 16));
  const startY = Math.max(0, Math.floor(camera.y / 16));
  const endX = Math.min(level.width, startX + Math.ceil(state.viewport.width / 16) + 2);
  const endY = Math.min(level.height, startY + Math.ceil(state.viewport.height / 16) + 2);
  const { cc } = tables;
  const sheet = images[state.tilesetName || 'l0'] || images.l0;
  if (!sheet) return;
  for (let tx = startX; tx < endX; tx++) {
    for (let ty = startY; ty < endY; ty++) {
      const tile = level.tiles[tx]?.[ty] ?? 0;
      if (tile === 0) continue;
      const tileIndex = tile;
      const width = cc[2][tileIndex], height = cc[3][tileIndex];
      if (width <= 0 || height <= 0) continue;
      const tileX = tx * 16 - camera.x;
      const tileY = ty * 16 - camera.y;
      const clipX = tileX + cc[4][tileIndex];
      const clipY = tileY + cc[5][tileIndex];
      withMIDPClip(ctx, clipX, clipY, width, height, () => {
        ctx.drawImage(sheet, clipX - cc[0][tileIndex], clipY - cc[1][tileIndex]);
      });
    }
  }
}

// Port of e.java:2592-2728. Uses the actual asset/background branch, MIDP
// TOP|LEFT anchors, setClip masks, and the source paint ordering.
export function renderOriginal(ctx, state, assets) {
  ctx.imageSmoothingEnabled = false;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, state.viewport.width, state.viewport.height);
  ctx.clip();
  if (state.screen === 'startup' && assets.images.lz) {
    const image = assets.images.lz;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, state.viewport.width, state.viewport.height);
    drawRegionMIDP(ctx, image, 0, 0, image.width, image.height, 0,
      (state.viewport.width - image.width) >> 1, (state.viewport.height - image.height) >> 1, 20);
  } else if (state.screen === 'title' && assets.images.or) {
    const image = assets.images.or;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, state.viewport.width, state.viewport.height);
    drawRegionMIDP(ctx, image, 0, 0, image.width, image.height, 0,
      (state.viewport.width - image.width) >> 1, (state.viewport.height - image.height) >> 1, 20);
    state.drawTitleOverlay?.(ctx, assets);
  } else if (state.screen === 'game' && state.level) {
    if (state.loadingScreen) {
      state.drawLoadingOverlay?.(ctx, assets);
    } else {
      drawArenaBackground(ctx, state, assets);
      drawMap(ctx, state, assets.images);
      state.drawMapProps?.(ctx, assets);
      drawActors(ctx, state, assets.images);
      state.drawProjectiles?.(ctx, assets);
      state.drawEffects?.(ctx, assets);
      state.drawOriginalHud?.(ctx, assets);
    }
  } else {
    if (state.pausedMatch && state.level) {
      // Pause screen draws frozen arena dimmed with alpha=100/255 behind K=1 menu (e.java:2462-2473)
      drawArenaBackground(ctx, state, assets);
      drawMap(ctx, state, assets.images);
      state.drawMapProps?.(ctx, assets);
      drawActors(ctx, state, assets.images);
      state.drawProjectiles?.(ctx, assets);
      state.drawEffects?.(ctx, assets);
      ctx.fillStyle = 'rgba(0,0,0,0.392)';
      ctx.fillRect(0, 0, state.viewport.width, state.viewport.height);
    } else {
      const background = state.backgroundName ? assets.images[state.backgroundName] : null;
      if (background) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, state.viewport.width, state.viewport.height);
        drawRegionMIDP(ctx, background, 0, 0, background.width, background.height, 0,
          (state.viewport.width - background.width) >> 1,
          (state.viewport.height - background.height) >> 1, 20);
      } else {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, state.viewport.width, state.viewport.height);
      }
    }
    state.drawOriginalUi?.(ctx, assets);
  }
  ctx.restore();
}
