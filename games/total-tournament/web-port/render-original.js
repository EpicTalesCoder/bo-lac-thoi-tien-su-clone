import { drawRegionMIDP, withMIDPClip } from './midp-graphics.js';

// Port of e.java:3059-3079. The mirrored image bank has a different draw origin;
// clip geometry is the frame rectangle after source facing-specific offsets.
function drawFrame(ctx, images, meta, x, y, facing) {
  if (!meta || meta[2] <= 0 || meta[3] <= 0) return;
  const [sourceX, sourceY, width, height, offsetX, offsetY, imageIndex] = meta;
  const bankIndex = imageIndex + (facing < 0 ? 9 : 0);
  const sheet = images[`u${bankIndex}`];
  if (!sheet) return;
  let clipX = x;
  if (offsetX !== 0) clipX += facing === 1 ? offsetX : offsetX * facing - width;
  const clipY = y + offsetY;
  const drawX = facing === -1
    ? clipX - sheet.width + width + sourceX
    : clipX - sourceX;
  const drawY = clipY - sourceY;
  withMIDPClip(ctx, clipX, clipY, width, height, () => ctx.drawImage(sheet, drawX, drawY));
}

// Port of e.java:1890-1967. Character pose arrays are original ca records;
// each `[offsetX, offsetY, frameId]` resolves through original cu2 metadata.
function drawActors(ctx, state, images) {
  const { camera, actors, tables } = state;
  for (const actor of actors) {
    if (actor.status !== 1) continue;
    const screenX = actor.x - camera.x;
    const screenY = actor.y - camera.y;
    const pose = tables.poseForActor(actor);
    for (let part = 0; part + 2 < pose.length; part += 3) {
      const frame = pose[part + 2];
      const meta = tables.cu2[frame];
      if (!meta || meta[2] <= 0 || meta[3] <= 0) continue;
      const facing = actor.facing === 0 ? 1 : actor.facing;
      const partX = screenX + (facing > 0 ? pose[part] : -pose[part]);
      const partY = screenY + pose[part + 1] - meta[3];
      drawFrame(ctx, images, meta, partX, partY, facing);
    }
  }
}

// Port of e.java:1972-2031. `cc` metadata and the original `s0` image bank
// define tile source rectangles and clipping. `l0/l1` are background layers.
function drawMap(ctx, state, images) {
  const { level, camera, tables } = state;
  const startX = Math.max(0, Math.floor(camera.x / 16));
  const startY = Math.max(0, Math.floor(camera.y / 16));
  const endX = Math.min(level.width, startX + Math.ceil(state.viewport.width / 16) + 2);
  const endY = Math.min(level.height, startY + Math.ceil(state.viewport.height / 16) + 2);
  const { cc } = tables;
  for (let tx = startX; tx < endX; tx++) {
    for (let ty = startY; ty < endY; ty++) {
      const tile = level.tiles[tx]?.[ty] ?? 0;
      if (tile === 0) continue;
      const tileIndex = tile;
      const sheet = images.l0;
      const width = cc[2][tileIndex], height = cc[3][tileIndex];
      if (!sheet || width <= 0 || height <= 0) continue;
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
    drawRegionMIDP(ctx, image, 0, 0, image.width, image.height, 0,
      (state.viewport.width - image.width) >> 1, (state.viewport.height - image.height) >> 1, 20);
  } else if (state.screen === 'title' && assets.images.or) {
    const image = assets.images.or;
    drawRegionMIDP(ctx, image, 0, 0, image.width, image.height, 0, 0, 0, 20);
  } else if (state.screen === 'game' && state.level) {
    const background = state.background;
    if (background) {
      drawRegionMIDP(ctx, background, 0, 0, background.width, background.height, 0, 0, 0, 20);
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
    const background = state.backgroundName ? assets.images[state.backgroundName] : null;
    if (background) {
      drawRegionMIDP(ctx, background, 0, 0, background.width, background.height, 0,
        (state.viewport.width - background.width) >> 1,
        (state.viewport.height - background.height) >> 1, 20);
    } else {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, state.viewport.width, state.viewport.height);
    }
    state.drawOriginalUi?.(ctx, assets);
  }
  ctx.restore();
}
