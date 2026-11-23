// MIDP Sprite.TRANS_* and Graphics anchor helpers shared by the renderer/tests.
export const MIDP_ANCHOR = Object.freeze({ HCENTER: 1, VCENTER: 2, LEFT: 4, RIGHT: 8, TOP: 16, BOTTOM: 32, BASELINE: 64 });

export function anchorPosition(x, y, width, height, anchor = MIDP_ANCHOR.LEFT | MIDP_ANCHOR.TOP) {
  let dx = x;
  let dy = y;
  if (anchor & MIDP_ANCHOR.HCENTER) dx -= width >> 1;
  else if (anchor & MIDP_ANCHOR.RIGHT) dx -= width;
  if (anchor & MIDP_ANCHOR.VCENTER) dy -= height >> 1;
  else if (anchor & MIDP_ANCHOR.BOTTOM) dy -= height;
  return { x: dx, y: dy };
}

// Port of h.java:115-120. Transform numbers follow MIDP Sprite.TRANS_* values.
export function drawRegionMIDP(ctx, image, sx, sy, sw, sh, transform, x, y, anchor = MIDP_ANCHOR.LEFT | MIDP_ANCHOR.TOP) {
  if (!image || sw <= 0 || sh <= 0) return;
  if (!Number.isInteger(transform) || transform < 0 || transform > 7) throw new RangeError(`invalid MIDP transform ${transform}`);
  const rotated = (transform & 4) !== 0;
  const dw = rotated ? sh : sw;
  const dh = rotated ? sw : sh;
  const destination = anchorPosition(x, y, dw, dh, anchor);
  ctx.imageSmoothingEnabled = false;
  if (transform === 0) {
    ctx.drawImage(image, sx, sy, sw, sh, destination.x, destination.y, sw, sh);
    return;
  }
  ctx.save();
  ctx.translate(destination.x + dw / 2, destination.y + dh / 2);
  switch (transform) {
    case 1: ctx.scale(1, -1); break;
    case 2: ctx.scale(-1, 1); break;
    case 3: ctx.rotate(Math.PI); break;
    case 4: ctx.rotate(-Math.PI / 2); ctx.scale(-1, 1); break;
    case 5: ctx.rotate(Math.PI / 2); break;
    case 6: ctx.rotate(-Math.PI / 2); break;
    case 7: ctx.rotate(Math.PI / 2); ctx.scale(-1, 1); break;
    default: ctx.restore(); throw new RangeError(`invalid MIDP transform ${transform}`);
  }
  ctx.drawImage(image, sx, sy, sw, sh, -sw / 2, -sh / 2, sw, sh);
  ctx.restore();
}

export function withMIDPClip(ctx, x, y, width, height, draw) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();
  try { draw(); } finally { ctx.restore(); }
}
