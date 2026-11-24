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

// MIDP Graphics.drawRect fills a crisp 1px border spanning (width+1)x(height+1) pixels.
export function drawRectMIDP(ctx, x, y, width, height, color) {
  const rx = Math.round(x);
  const ry = Math.round(y);
  const rw = Math.round(width);
  const rh = Math.round(height);
  if (rw < 0 || rh < 0) return;
  if (color) ctx.fillStyle = color;
  if (rw === 0 || rh === 0) {
    ctx.fillRect(rx, ry, rw + 1, rh + 1);
    return;
  }
  ctx.fillRect(rx, ry, rw + 1, 1);
  ctx.fillRect(rx, ry + rh, rw + 1, 1);
  ctx.fillRect(rx, ry + 1, 1, Math.max(0, rh - 1));
  ctx.fillRect(rx + rw, ry + 1, 1, Math.max(0, rh - 1));
}

// MIDP Graphics.drawLine draws crisp integer 1px pixels without Canvas stroke blur.
export function drawLineMIDP(ctx, x1, y1, x2, y2, color) {
  let px = Math.round(x1);
  let py = Math.round(y1);
  const tx = Math.round(x2);
  const ty = Math.round(y2);
  if (color) ctx.fillStyle = color;
  if (px === tx) {
    ctx.fillRect(px, Math.min(py, ty), 1, Math.abs(ty - py) + 1);
    return;
  }
  if (py === ty) {
    ctx.fillRect(Math.min(px, tx), py, Math.abs(tx - px) + 1, 1);
    return;
  }
  const dx = Math.abs(tx - px);
  const dy = Math.abs(ty - py);
  const sx = px < tx ? 1 : -1;
  const sy = py < ty ? 1 : -1;
  let err = dx - dy;
  while (true) {
    ctx.fillRect(px, py, 1, 1);
    if (px === tx && py === ty) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; px += sx; }
    if (e2 < dx) { err += dx; py += sy; }
  }
}
