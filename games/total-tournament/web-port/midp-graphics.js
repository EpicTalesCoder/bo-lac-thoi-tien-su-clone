// MIDP 2.0 Graphics/Sprite semantics for source-derived render passes.
// `drawRegion` transforms follow Sprite.TRANS_* codes; normal JAR paint calls
// use drawImage with TOP|LEFT (20), while clips implement the atlas masks.
export const MIDP_ANCHOR = Object.freeze({ HCENTER: 1, VCENTER: 2, LEFT: 4, RIGHT: 8, TOP: 16, BOTTOM: 32, BASELINE: 64 });

export function drawRegionMIDP(ctx, image, sx, sy, sw, sh, transform, x, y, anchor = 20) {
  const rotated = (transform & 4) !== 0;
  const dw = rotated ? sh : sw;
  const dh = rotated ? sw : sh;
  let dx = x;
  let dy = y;
  if (anchor & MIDP_ANCHOR.HCENTER) dx -= dw >> 1;
  else if (anchor & MIDP_ANCHOR.RIGHT) dx -= dw;
  if (anchor & MIDP_ANCHOR.VCENTER) dy -= dh >> 1;
  else if (anchor & MIDP_ANCHOR.BOTTOM) dy -= dh;

  if (transform === 0) {
    ctx.drawImage(image, sx, sy, sw, sh, dx, dy, sw, sh);
    return;
  }
  ctx.save();
  ctx.translate(dx + dw / 2, dy + dh / 2);
  if (transform === 2) ctx.scale(-1, 1);
  else if (transform === 3) ctx.rotate(Math.PI);
  else if (transform === 1) ctx.scale(1, -1);
  else if (transform === 5) ctx.rotate(Math.PI / 2);
  else if (transform === 6) ctx.rotate(-Math.PI / 2);
  else if (transform === 7) { ctx.rotate(Math.PI / 2); ctx.scale(-1, 1); }
  else if (transform === 4) { ctx.rotate(-Math.PI / 2); ctx.scale(-1, 1); }
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
