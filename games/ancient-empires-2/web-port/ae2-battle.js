import { drawRegionMIDP, MIDP_ANCHOR } from './ancient-empires-midp.js';

// Port of g.java:4-7, 56-192 & i.java:6251-6425: split-screen battle scene
const GROUND_BY_PROP = ['road', 'grass', 'grass', 'grass', 'mountain', 'water', 'bridge', 'town', 'town', 'town'];
const BG_BY_PROP = [null, null, 'woods_bg', 'hill_bg', 'mountain_bg', null, 'bridge_bg', 'town_bg', 'town_bg', 'town_bg'];
const FX_BY_TYPE = {
  0: 'slash', 5: 'slash', 10: 'slash',
  1: 'archer_arrow',
  2: 'watermagic',
  3: 'spell',
  4: 'big_circle',
  6: 'crater', 7: 'crater',
  8: 'big_circle',
  9: 'kingslash',
};

function drawBattleSpriteFrame(ctx, assets, family, palette, frameIdx, x, y, reverseSeq = false) {
  const meta = assets.sprites?.[family];
  if (!meta) return false;
  const total = meta.frames?.length ?? 0;
  if (total === 0) return false;
  const resolvedIdx = reverseSeq && frameIdx < (total >> 1) ? frameIdx + (total >> 1) : frameIdx;
  const frame = meta.frames[resolvedIdx] ?? meta.frames[0];
  const paletteImages = assets.coloredPalettes?.[palette]?.[family];
  const sheet = !Array.isArray(paletteImages) && paletteImages?.naturalWidth ? paletteImages : assets.images?.[family];
  const frameList = Array.isArray(paletteImages) ? paletteImages : assets.frameImages?.[family];
  const image = frameList ? frameList[frame.sourceFrame] : sheet;
  if (!image) return false;
  const cols = frameList ? 1 : Math.max(1, Math.floor((image.naturalWidth || meta.frameWidth) / meta.frameWidth));
  const sw = frameList ? (image.naturalWidth || meta.frameWidth) : meta.frameWidth;
  const sh = frameList ? (image.naturalHeight || meta.frameHeight) : meta.frameHeight;
  const sx = frameList ? 0 : (frame.sourceFrame % cols) * meta.frameWidth;
  const sy = frameList ? 0 : Math.floor(frame.sourceFrame / cols) * meta.frameHeight;

  // Port of h.java:56-87: align unpacked PNG frames smaller than (frameWidth, frameHeight) via anchorFlags
  let anchorOx = 0;
  let anchorOy = 0;
  if (frameList && meta.anchorFlags > 0) {
    let hAlign = meta.anchorFlags & 13;
    let vAlign = meta.anchorFlags & 50;
    if (frame.transform === 2) {
      if ((hAlign & 4) !== 0) hAlign = 8;
      else if ((hAlign & 8) !== 0) hAlign = 4;
    } else if (frame.transform === 1) {
      if ((vAlign & 16) !== 0) vAlign = 32;
      else if ((vAlign & 32) !== 0) vAlign = 16;
    }
    if ((hAlign & 8) !== 0) anchorOx = meta.frameWidth - sw;
    else if ((hAlign & 1) !== 0) anchorOx = (meta.frameWidth - sw) >> 1;
    if ((vAlign & 32) !== 0) anchorOy = meta.frameHeight - sh;
    else if ((vAlign & 2) !== 0) anchorOy = (meta.frameHeight - sh) >> 1;
  }

  drawRegionMIDP(
    ctx, image, sx, sy, sw, sh,
    frame.transform ?? 0,
    x + anchorOx + (frame.offsetX ?? 0),
    y + anchorOy + (frame.offsetY ?? 0),
    MIDP_ANCHOR.LEFT | MIDP_ANCHOR.TOP,
  );
  return true;
}

export class BattleScene {
  constructor({ attacker, attackerName, attackerTerrain, defender, defenderName, defenderTerrain, combatResult, assets, width = 240, height = 320, onSound }) {
    this.assets = assets;
    this.width = width;
    this.height = height;
    this.hudH = 28;
    this.arenaH = height - this.hudH;
    this.halfW = width >> 1;
    this.onSound = onSound ?? (() => {});
    this.res = combatResult;
    this.attacker = attacker;
    this.defender = defender;
    this.attackerName = attackerName;
    this.defenderName = defenderName;
    this.attackerTerrain = attackerTerrain ?? 1;
    this.defenderTerrain = defenderTerrain ?? 1;

    this.leftSide = this.buildSide(attacker, 0, combatResult.attackerHpBefore);
    this.rightSide = this.buildSide(defender, 1, combatResult.defenderHpBefore);

    this.elapsed = 0;
    this.hasCounter = combatResult.counterDamage > 0 && combatResult.defenderHpAfter > 0;
    this.strikeDuration = 1200;
    this.pauseDuration = 280;
    this.counterStart = this.hasCounter ? (this.strikeDuration + this.pauseDuration) : Infinity;
    this.totalDuration = this.hasCounter
      ? (this.counterStart + 1150)
      : (this.strikeDuration + 380);

    this.attackerStrikeTriggered = false;
    this.counterStrikeTriggered = false;
    this.finished = false;
  }

  buildSide(unit, sideIndex, initialHp) {
    const family = this.assets.unitFamilies?.[unit.type] ?? 'soldier';
    const meta = this.assets.sprites?.[family];
    const rec = this.assets.unitRecords?.[unit.type];
    const offsets = rec?.frameOffsets?.length ? rec.frameOffsets : [[16, 86]];
    const slots = offsets.length;
    const figW = meta?.frameWidth ?? 34;
    const figH = meta?.frameHeight ?? 36;
    const figures = offsets.map(off => {
      const rx = Math.round((off[0] * this.width) / 128);
      const x = sideIndex === 0 ? rx : (this.width - rx - figW);
      const y = Math.max(24, Math.min(this.arenaH - figH - 4, Math.round((off[1] * this.arenaH) / 128) - figH));
      return { baseX: x, baseY: y, alive: true };
    });
    return {
      unit,
      sideIndex,
      family,
      palette: Math.max(1, unit.palette ?? 1),
      kingHead: Number.isInteger(unit.kingHead) ? unit.kingHead : Math.max(0, Math.min(3, (unit.palette ?? 1) - 1)),
      slots,
      figW,
      figH,
      figures,
      initialHp,
      displayHp: initialHp,
      visibleCount: Math.max(1, Math.min(slots, Math.ceil((initialHp * slots) / 100))),
    };
  }

  skip() {
    this.finished = true;
  }

  tick(dtMs) {
    if (this.finished) return;
    this.elapsed += dtMs;

    if (!this.attackerStrikeTriggered && this.elapsed >= 480) {
      this.attackerStrikeTriggered = true;
      this.rightSide.visibleCount = this.res.defenderHpAfter <= 0
        ? 0
        : Math.max(1, Math.min(this.rightSide.slots, Math.ceil((this.res.defenderHpAfter * this.rightSide.slots) / 100)));
      this.onSound('attack');
    }

    if (this.elapsed >= 480) {
      const p = Math.min(1, (this.elapsed - 480) / 420);
      this.rightSide.displayHp = this.res.defenderHpBefore + (this.res.defenderHpAfter - this.res.defenderHpBefore) * p;
    }

    if (this.hasCounter && !this.counterStrikeTriggered && this.elapsed >= this.counterStart + 420) {
      this.counterStrikeTriggered = true;
      this.leftSide.visibleCount = this.res.attackerHpAfter <= 0
        ? 0
        : Math.max(1, Math.min(this.leftSide.slots, Math.ceil((this.res.attackerHpAfter * this.leftSide.slots) / 100)));
      this.onSound('attack');
    }

    if (this.hasCounter && this.elapsed >= this.counterStart + 420) {
      const p = Math.min(1, (this.elapsed - (this.counterStart + 420)) / 420);
      this.leftSide.displayHp = this.res.attackerHpBefore + (this.res.attackerHpAfter - this.res.attackerHpBefore) * p;
    }

    if (this.elapsed >= this.totalDuration) {
      this.finished = true;
    }
  }

  renderHalfTerrain(ctx, prop, x0, panelW, shakeX, shakeY) {
    const bgName = BG_BY_PROP[prop];
    const groundName = GROUND_BY_PROP[prop] ?? 'grass';
    const bgImg = bgName ? this.assets.images?.[bgName] : null;
    const bgFrames = bgName ? this.assets.frameImages?.[bgName] : null;
    const bgMeta = bgName ? this.assets.sprites?.[bgName] : null;
    let skyH = 0;
    if (bgImg) {
      skyH = bgImg.naturalHeight || 48;
      for (let bx = 0; bx < panelW; bx += (bgImg.naturalWidth || 48)) {
        ctx.drawImage(bgImg, x0 + bx + shakeX, shakeY);
      }
    } else if (bgMeta && bgFrames?.[0]) {
      skyH = bgMeta.frameHeight;
      for (let bx = 0; bx < panelW; bx += bgMeta.frameWidth) {
        drawBattleSpriteFrame(ctx, this.assets, bgName, 1, 0, x0 + bx + shakeX, shakeY, false);
      }
    }

    const groundMeta = this.assets.sprites?.[groundName];
    const tw = groundMeta?.frameWidth ?? 24;
    const th = groundMeta?.frameHeight ?? 24;
    const cols = Math.ceil(panelW / tw) + 1;
    const rows = Math.ceil((this.arenaH - skyH) / th) + 1;
    for (let cx = 0; cx < cols; cx++) {
      for (let cy = 0; cy < rows; cy++) {
        const frame = (cx * 3 + cy * 5 + prop) % Math.max(1, groundMeta?.frameCount ?? 1);
        drawBattleSpriteFrame(ctx, this.assets, groundName, 1, frame, x0 + cx * tw + shakeX, skyH + cy * th + shakeY, false);
      }
    }
  }

  renderSideFigures(ctx, side, lungeRatio, isAttackPose, isHit) {
    const isLeft = side.sideIndex === 0;
    const lunge = Math.round((isLeft ? 16 : -16) * lungeRatio);
    const seqFrame = isAttackPose ? 2 : ((Math.floor(this.elapsed / 220)) % 2);
    for (let i = 0; i < side.slots; i++) {
      const fig = side.figures[i];
      if (i >= side.visibleCount) {
        // Puff out dying figure shortly after hit lands
        if (isHit && this.assets.sprites?.b_smoke) {
          const sf = Math.min(3, Math.floor(((this.elapsed % 450) / 110)));
          drawBattleSpriteFrame(ctx, this.assets, 'b_smoke', 1, sf, fig.baseX + (side.figW >> 1) - 6, fig.baseY + (side.figH >> 1) - 5, false);
        }
        continue;
      }
      const jitterX = isHit ? Math.round(Math.sin(this.elapsed * 0.14) * 3) : 0;
      const fx = fig.baseX + lunge + jitterX;
      const fy = fig.baseY;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
      ctx.beginPath();
      ctx.ellipse(fx + (side.figW >> 1), fy + Math.round(side.figH * 0.88), side.figW >> 1, Math.max(4, side.figH >> 3), 0, 0, Math.PI * 2);
      ctx.fill();

      drawBattleSpriteFrame(ctx, this.assets, side.family, side.palette, seqFrame, fx, fy, isLeft);
      if (side.unit.type === 9) {
        if (seqFrame === 2 && this.assets.sprites?.king_heads_back) {
          const backIdx = (isLeft ? 4 : 0) + side.kingHead;
          drawBattleSpriteFrame(ctx, this.assets, 'king_heads_back', 1, backIdx, fx, fy, false);
        } else if (this.assets.sprites?.king_heads) {
          const headIdx = (isLeft ? 8 : 0) + side.kingHead * 2 + (seqFrame % 2);
          drawBattleSpriteFrame(ctx, this.assets, 'king_heads', 1, headIdx, fx, fy, false);
        }
      }
    }
  }

  renderImpactEffect(ctx, targetSide, damageText, localElapsed) {
    const first = targetSide.figures[0];
    const cx = first ? (first.baseX + (targetSide.figW >> 1)) : (targetSide.sideIndex === 1 ? 180 : 60);
    const cy = first ? (first.baseY + (targetSide.figH >> 1)) : 140;
    const attackerType = targetSide.sideIndex === 1 ? this.attacker.type : this.defender.type;
    const fxFamily = FX_BY_TYPE[attackerType] ?? 'slash';
    if (localElapsed >= 460 && localElapsed <= 880) {
      const fxMeta = this.assets.sprites?.[fxFamily];
      const fxFrame = fxMeta ? Math.floor(((localElapsed - 460) / 120)) % Math.max(1, (fxMeta.frameCount >> 1) || fxMeta.frameCount) : 0;
      drawBattleSpriteFrame(ctx, this.assets, fxFamily, 1, fxFrame, cx - 18, cy - 16, targetSide.sideIndex === 1);
      if (this.assets.sprites?.b_smoke) {
        const bFrame = Math.floor(((localElapsed - 460) / 100)) % 4;
        drawBattleSpriteFrame(ctx, this.assets, 'b_smoke', 1, bFrame, cx - 6, cy - 6, false);
      }
    }
    if (localElapsed >= 480) {
      const floatY = cy - 12 - Math.min(20, (localElapsed - 480) * 0.04);
      ctx.save();
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000000';
      ctx.strokeText(`-${damageText}`, cx, floatY);
      ctx.fillStyle = '#ffd84d';
      ctx.fillText(`-${damageText}`, cx, floatY);
      ctx.restore();
    }
  }

  render(ctx) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.textBaseline = 'alphabetic';
    const inAttackerImpact = this.elapsed >= 480 && this.elapsed < 860;
    const inCounterImpact = this.hasCounter && this.elapsed >= this.counterStart + 420 && this.elapsed < this.counterStart + 800;
    const shake = inAttackerImpact || inCounterImpact;
    const shakeX = shake ? Math.round(Math.sin(this.elapsed * 0.16) * 3) : 0;
    const shakeY = shake ? Math.round(Math.cos(this.elapsed * 0.11) * 1.5) : 0;

    const smoothStep = t => {
      const c = Math.max(0, Math.min(1, t));
      return c * c * (3 - 2 * c);
    };
    const lungeCurve = localMs => {
      if (localMs < 140 || localMs > 900) return 0;
      if (localMs < 380) return smoothStep((localMs - 140) / 240);
      if (localMs <= 640) return 1;
      return 1 - smoothStep((localMs - 640) / 260);
    };
    const leftLunge = lungeCurve(this.elapsed);
    const rightLunge = this.hasCounter ? lungeCurve(this.elapsed - this.counterStart) : 0;

    // Left arena panel (Attacker)
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, this.halfW - 1, this.arenaH);
    ctx.clip();
    this.renderHalfTerrain(ctx, this.attackerTerrain, 0, this.halfW, shakeX, shakeY);
    this.renderSideFigures(ctx, this.leftSide, leftLunge, this.elapsed >= 220 && this.elapsed < 760, inCounterImpact);
    if (this.hasCounter && this.elapsed >= this.counterStart) {
      this.renderImpactEffect(ctx, this.leftSide, this.res.counterDamage, this.elapsed - this.counterStart);
    }
    ctx.restore();

    // Right arena panel (Defender)
    ctx.save();
    ctx.beginPath();
    ctx.rect(this.halfW + 1, 0, this.halfW - 1, this.arenaH);
    ctx.clip();
    this.renderHalfTerrain(ctx, this.defenderTerrain, this.halfW, this.halfW, shakeX, shakeY);
    this.renderSideFigures(ctx, this.rightSide, rightLunge, this.hasCounter && this.elapsed >= this.counterStart + 160 && this.elapsed < this.counterStart + 700, inAttackerImpact);
    if (this.elapsed < this.counterStart) {
      this.renderImpactEffect(ctx, this.rightSide, this.res.damage, this.elapsed);
    }
    ctx.restore();

    // 2px vertical center split bar (i.java:6362)
    ctx.fillStyle = '#000000';
    ctx.fillRect(this.halfW - 1, 0, 2, this.arenaH);

    // Bottom Battle HUD Strip matching AE2 navy #242a45 & team gradient stripes
    const hudY = this.arenaH;
    ctx.fillStyle = '#242a45';
    ctx.fillRect(0, hudY, this.width, this.hudH);
    ctx.fillStyle = '#555d86';
    ctx.fillRect(0, hudY, this.width, 1);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, hudY + 1, this.width, 1);

    this.renderSideHud(ctx, this.leftSide, this.attackerName, 4, hudY + 4, this.halfW - 8);
    ctx.fillStyle = '#000000';
    ctx.fillRect(this.halfW - 1, hudY + 2, 2, this.hudH - 2);
    this.renderSideHud(ctx, this.rightSide, this.defenderName, this.halfW + 4, hudY + 4, this.halfW - 8);

    // Quick fade-in overlay (i.java:6422-6424)
    if (this.elapsed < 160) {
      ctx.fillStyle = `rgba(0, 0, 0, ${(1 - this.elapsed / 160).toFixed(2)})`;
      ctx.fillRect(0, 0, this.width, this.height);
    }
    ctx.restore();
  }

  renderSideHud(ctx, side, label, x, y, w) {
    const teamColors = ['#888888', '#3c96ee', '#e03c68', '#52c444', '#6d7a94'];
    const barColor = teamColors[side.palette] ?? '#3c96ee';
    ctx.fillStyle = barColor;
    ctx.fillRect(x, y, 4, 20);
    ctx.font = 'bold 8px Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(label.slice(0, 11), x + 7, y + 7);
    const hp = Math.max(0, Math.round(side.displayHp));
    ctx.fillStyle = '#191b3a';
    ctx.fillRect(x + 7, y + 11, w - 42, 6);
    ctx.fillStyle = hp > 50 ? '#68d468' : hp > 25 ? '#f5b841' : '#e84a4a';
    ctx.fillRect(x + 7, y + 11, Math.round(((w - 42) * hp) / 100), 6);
    ctx.font = 'bold 8px Arial, sans-serif';
    ctx.fillStyle = '#ffd84d';
    ctx.textAlign = 'right';
    ctx.fillText(`${hp}/100`, x + w, y + 16);
  }
}
