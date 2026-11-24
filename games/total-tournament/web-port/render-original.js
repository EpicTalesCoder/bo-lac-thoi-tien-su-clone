import { drawRegionMIDP, withMIDPClip } from './midp-graphics.js';
import { lerpCoordRound } from './tt-core.js';

// Port of e.java:1738-1753 (`d(Graphics)`). Actor limb positions use `ca` offsets
// directly (`n8 = by * aH[n4][n6] + n2; if (by == -1) n8 -= width; n7 = aH[n4][n6+1] + n3 - height`).
function drawFrame(ctx, images, meta, x, y, facing) {
  if (!meta || meta[2] <= 0 || meta[3] <= 0) return;
  const [sourceX, sourceY, width, height, , , imageIndex] = meta;
  const bankIndex = imageIndex + (facing < 0 && imageIndex < 5 ? 9 : 0);
  const sheet = images[`u${bankIndex}`] || images[`u${imageIndex}`];
  if (!sheet) return;
  const clipX = facing === -1 ? x - width : x;
  const clipY = y;
  const drawX = facing === -1 && imageIndex < 5
    ? clipX - (sheet.width - width - sourceX)
    : clipX - sourceX;
  const drawY = clipY - sourceY;
  withMIDPClip(ctx, clipX, clipY, width, height, () => ctx.drawImage(sheet, drawX, drawY));
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

    // Health bar + dynamic ground shadow for living actors (e.java:1723-1734)
    if (actor.status === 1) {
      const barW = Math.max(12, actor.width || 13);
      const halfW = barW >> 1;
      const barY = screenY - (actor.height || 22) - 10;
      const fillW = Math.max(0, Math.min(barW - 1, actor.healthBarWidth ?? barW - 1));
      const isTeamMode = state.mode === 1 || state.mode === 3;
      ctx.fillStyle = isTeamMode ? (actor.team === 0 ? '#0066ff' : '#ff2222') : (actor.healthBarColor || '#00ff00');
      ctx.fillRect(screenX - halfW + 1, barY + 1, fillW, 4);
      ctx.strokeStyle = actor.isPlayer ? '#ffffff' : '#000000';
      ctx.strokeRect(screenX - halfW, barY, barW, 5);

      if (typeof actor.shadowY === 'number' && state.level) {
        const dropDist = Math.max(0, actor.shadowY - actor.y);
        const shadowW = Math.max(6, (actor.width || 14) - (dropDist >> 2));
        const shadowScreenY = Math.round(actor.shadowY - camera.y);
        if (shadowScreenY > -8 && shadowScreenY < state.viewport.height + 8 && dropDist < 96) {
          ctx.fillStyle = 'rgba(0,0,0,0.45)';
          ctx.fillRect(screenX - (shadowW >> 1), shadowScreenY - 1, shadowW, 3);
        }
      }
    }

    const pose = tables.poseForActor(actor);
    const facing = actor.facing === 0 ? 1 : actor.facing;
    let poseLen = pose.length;
    if (actor.weapon === 0 && !actor.bloodyTimer && actor.animation === 2 && actor.animationFrame > 0 && poseLen >= 3) {
      poseLen -= 3; // Clean vs bloody chainsaw (e.java:1720-1722)
    }
    for (let part = 0; part + 2 < poseLen; part += 3) {
      const frame = pose[part + 2];
      const meta = tables.cu2[frame];
      if (!meta || meta[2] <= 0 || meta[3] <= 0) continue;
      const partX = screenX + (facing > 0 ? pose[part] : -pose[part]);
      const partY = screenY + pose[part + 1] - meta[3];
      drawFrame(ctx, images, meta, partX, partY, facing);
    }

    // Animated fire / plasma burn overlay on hit fighters (e.java:1755-1766)
    if (actor.status === 1 && actor.burnTimer > 0) {
      const burnFrameId = (actor.burnSprite || 43) + ((actor.burnFrame || 0) % 3);
      const burnMeta = tables.cu2[burnFrameId];
      if (burnMeta && burnMeta[2] > 0 && burnMeta[3] > 0) {
        const burnY = screenY - burnMeta[3] - (actor.inAir ? 10 : 0);
        drawFrame(ctx, images, burnMeta, screenX - (facing > 0 ? (burnMeta[2] >> 1) : -(burnMeta[2] >> 1)), burnY, facing);
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
    ctx.fillStyle = '#000';
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
    const background = state.background || (state.backgroundName ? assets.images[state.backgroundName] : null);
    if (background) {
      const bgW = Math.max(1, background.width);
      const bgH = Math.max(1, background.height);
      const parallaxX = -((state.camera.x >> 2) % bgW);
      for (let bx = parallaxX; bx < state.viewport.width; bx += bgW) {
        for (let by = 0; by < state.viewport.height; by += bgH) {
          drawRegionMIDP(ctx, background, 0, 0, bgW, bgH, 0, bx, by, 20);
        }
      }
    } else {
      ctx.fillStyle = 'rgb(0,128,0)';
      ctx.fillRect(0, 0, state.viewport.width, state.viewport.height);
    }
    drawMap(ctx, state, assets.images);
    state.drawMapProps?.(ctx, assets);
    drawActors(ctx, state, assets.images);
    state.drawProjectiles?.(ctx, assets);
    state.drawEffects?.(ctx, assets);
    state.drawOriginalHud?.(ctx, assets);
  } else {
    if (state.pausedMatch && state.level) {
      // Pause screen draws frozen arena dimmed behind K=1 menu (e.java:2462-2473)
      const bg = state.background || (state.backgroundName ? assets.images[state.backgroundName] : null);
      if (bg) drawRegionMIDP(ctx, bg, 0, 0, bg.width, bg.height, 0, 0, 0, 20);
      drawMap(ctx, state, assets.images);
      state.drawMapProps?.(ctx, assets);
      drawActors(ctx, state, assets.images);
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
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
