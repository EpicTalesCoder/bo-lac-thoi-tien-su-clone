import { drawRegionMIDP, MIDP_ANCHOR } from './ancient-empires-midp.js';

// Port of g.java:4-7, 56-192 & i.java:6251-6425: split-screen battle scene
const GROUND_BY_PROP = ['road', 'grass', 'grass', 'grass', 'mountain', 'water', 'bridge', 'town', 'town', 'town'];
const BG_BY_PROP = [null, null, 'woods_bg', 'hill_bg', 'mountain_bg', null, 'bridge_bg', 'town_bg', 'town_bg', 'town_bg'];

// Port of f.java:196-214 & h.java:56-87: draw battle sprite or unpacked frame with anchorFlags/offset alignment
function drawBattleSpriteFrame(ctx, assets, family, palette, frameIdx, x, y, reverseSeq = false) {
  const meta = assets.sprites?.[family];
  const frameList = assets.coloredPalettes?.[palette]?.[family]
    ?? (palette <= 1 || !assets.images?.[family] ? assets.frameImages?.[family] : null);
  const sheet = assets.coloredPalettes?.[palette]?.[family]
    ?? assets.images?.[family];
  if (!meta) return false;
  const frames = meta.frames || [];
  const total = frames.length;
  const resolvedIdx = reverseSeq && frameIdx < (total >> 1) ? frameIdx + (total >> 1) : frameIdx;
  const frame = frames[Math.max(0, Math.min(total - 1, resolvedIdx))];
  if (!frame) return false;

  const unpacked = Array.isArray(frameList) ? frameList[frame.sourceFrame] : null;
  const image = unpacked ?? (Array.isArray(sheet) ? sheet[frame.sourceFrame] : sheet);
  if (!image) return false;

  const sw = unpacked ? (unpacked.naturalWidth || meta.frameWidth) : meta.frameWidth;
  const sh = unpacked ? (unpacked.naturalHeight || meta.frameHeight) : meta.frameHeight;
  const cols = unpacked ? 1 : Math.max(1, Math.floor((image.naturalWidth || sw) / meta.frameWidth));
  const sx = unpacked ? 0 : (frame.sourceFrame % cols) * meta.frameWidth;
  const sy = unpacked ? 0 : Math.floor(frame.sourceFrame / cols) * meta.frameHeight;

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
    Math.round(x) + anchorOx + (frame.offsetX ?? 0),
    Math.round(y) + anchorOy + (frame.offsetY ?? 0),
    MIDP_ANCHOR.LEFT | MIDP_ANCHOR.TOP,
  );
  return true;
}

// Resolve a frame from meta.sequences[seqIdx] at elapsed ms (Port of f.java:215-248)
function resolveSequenceFrame(meta, seqIdx, elapsedMs, delayOverrideMs = null, loop = true) {
  const seq = meta?.sequences?.[seqIdx];
  if (!seq || seq.length === 0) return Math.min(2, seqIdx);
  const stepMs = Math.max(40, delayOverrideMs ?? (meta.sequenceDelayMs || 200));
  const rawStep = Math.floor(Math.max(0, elapsedMs) / stepMs);
  const idx = loop ? (rawStep % seq.length) : Math.min(seq.length - 1, rawStep);
  return seq[idx] ?? 0;
}

// Compute per-unit battle pose (sequence frame, offsetX, offsetY) matching g.java:230-865
function computeFigurePose({ unitType, meta, localT, phaseStart, phaseEnd, impactAt, isLeft, globalElapsed }) {
  const dir = isLeft ? 1 : -1;
  const active = localT >= 0 && localT < phaseEnd;

  if (!active) {
    return {
      seqFrame: resolveSequenceFrame(meta, 0, globalElapsed, null, true),
      dx: 0,
      dy: unitType === 6 ? Math.round(Math.sin(globalElapsed * 0.008) * 1.5) : 0,
      phase: 'idle',
      p: 0,
    };
  }

  // Unit 0 (Soldier) & Unit 5 (Dire Wolf): crouch [1] -> parabolic overhead leap strike [2] -> cleave [0] -> return [1]
  if (unitType === 0 || unitType === 5) {
    const crouchStart = 120;
    const leapStart = 210;
    const apexAt = impactAt;
    const landEnd = 800;
    if (localT < crouchStart) {
      return { seqFrame: resolveSequenceFrame(meta, 0, globalElapsed, null, true), dx: 0, dy: 0, phase: 'idle', p: 0 };
    }
    if (localT < leapStart) {
      return { seqFrame: resolveSequenceFrame(meta, 3, localT - crouchStart, 90, false), dx: 0, dy: 2, phase: 'prep', p: (localT - crouchStart) / (leapStart - crouchStart) };
    }
    if (localT < apexAt) {
      const p = (localT - leapStart) / (apexAt - leapStart);
      return {
        seqFrame: resolveSequenceFrame(meta, 1, localT - leapStart, 100, false),
        dx: Math.round(dir * 26 * Math.sin(p * (Math.PI / 2))),
        dy: Math.round(-Math.sin(p * Math.PI) * 15),
        phase: 'leap',
        p,
      };
    }
    if (localT < landEnd) {
      const p = (localT - apexAt) / (landEnd - apexAt);
      const seqId = localT < apexAt + 130 ? 2 : 3;
      return {
        seqFrame: resolveSequenceFrame(meta, seqId, localT - apexAt, 110, false),
        dx: Math.round(dir * 26 * (1 - p)),
        dy: Math.round(-Math.sin((1 - p) * Math.PI) * 8),
        phase: 'return',
        p,
      };
    }
    return { seqFrame: resolveSequenceFrame(meta, 0, globalElapsed, null, true), dx: 0, dy: 0, phase: 'recover', p: 1 };
  }

  // Unit 10 (Skeleton): 4-frame sprint [2,3,4,5] -> slash [6,6] -> 4-frame retreat [7,8,9,10] (g.java & skeleton.sprite)
  if (unitType === 10) {
    const runStart = 140;
    const strikeAt = 440;
    const strikeEnd = 620;
    const retreatEnd = 900;
    if (localT < runStart) {
      return { seqFrame: resolveSequenceFrame(meta, 0, globalElapsed, 100, true), dx: 0, dy: 0, phase: 'prep', p: localT / runStart };
    }
    if (localT < strikeAt) {
      const p = (localT - runStart) / (strikeAt - runStart);
      return {
        seqFrame: resolveSequenceFrame(meta, 1, localT - runStart, 70, true),
        dx: Math.round(dir * 28 * p),
        dy: 0,
        phase: 'run',
        p,
      };
    }
    if (localT < strikeEnd) {
      return {
        seqFrame: resolveSequenceFrame(meta, 2, localT - strikeAt, 90, false),
        dx: Math.round(dir * 28),
        dy: 0,
        phase: 'strike',
        p: (localT - strikeAt) / (strikeEnd - strikeAt),
      };
    }
    if (localT < retreatEnd) {
      const p = (localT - strikeEnd) / (retreatEnd - strikeEnd);
      return {
        seqFrame: resolveSequenceFrame(meta, 3, localT - strikeEnd, 70, true),
        dx: Math.round(dir * 28 * (1 - p)),
        dy: 0,
        phase: 'retreat',
        p,
      };
    }
    return { seqFrame: resolveSequenceFrame(meta, 0, globalElapsed, 100, true), dx: 0, dy: 0, phase: 'recover', p: 1 };
  }

  // Unit 1 (Archer): brace [1] -> draw & loose [2,3,3] planted -> recover [0] (no forward slide)
  if (unitType === 1) {
    if (localT < 160) return { seqFrame: resolveSequenceFrame(meta, 0, globalElapsed, null, true), dx: 0, dy: 0, phase: 'idle', p: 0 };
    if (localT < 260) return { seqFrame: resolveSequenceFrame(meta, 1, localT - 160, 100, false), dx: 0, dy: 0, phase: 'aim', p: (localT - 160) / 100 };
    if (localT < 760) {
      const recoil = (localT >= 340 && localT < 430) ? -dir * 2 : 0;
      return { seqFrame: resolveSequenceFrame(meta, 2, localT - 260, 120, false), dx: recoil, dy: 0, phase: 'shoot', p: (localT - 260) / 500 };
    }
    return { seqFrame: resolveSequenceFrame(meta, 3, localT - 760, 140, false), dx: 0, dy: 0, phase: 'recover', p: 1 };
  }

  // Unit 2 (Elemental) & Unit 3 (Sorceress): focus [1] -> cast pose [2,2,2] planted -> settle [1]
  if (unitType === 2 || unitType === 3) {
    if (localT < 150) return { seqFrame: resolveSequenceFrame(meta, 0, globalElapsed, null, true), dx: 0, dy: 0, phase: 'idle', p: 0 };
    if (localT < 260) return { seqFrame: resolveSequenceFrame(meta, 1, localT - 150, 110, false), dx: 0, dy: 0, phase: 'prep', p: 0 };
    if (localT < 780) return { seqFrame: resolveSequenceFrame(meta, 2, localT - 260, 160, false), dx: 0, dy: 0, phase: 'cast', p: (localT - 260) / 520 };
    return { seqFrame: resolveSequenceFrame(meta, 3, localT - 780, 140, false), dx: 0, dy: 0, phase: 'recover', p: 1 };
  }

  // Unit 4 (Wisp): accelerating circular light orbit before flash strike (g.java:530-560)
  if (unitType === 4) {
    const seqFrame = resolveSequenceFrame(meta, 0, globalElapsed, localT < 540 ? 95 : 150, true);
    if (localT >= 150 && localT < 560) {
      const p = (localT - 150) / 410;
      const angle = p * Math.PI * 4.5;
      const radius = Math.sin(p * Math.PI) * 14;
      return {
        seqFrame,
        dx: Math.round(Math.cos(angle) * radius * dir),
        dy: Math.round(Math.sin(angle) * radius * 0.65),
        phase: 'orbit',
        p,
      };
    }
    return { seqFrame, dx: 0, dy: 0, phase: localT >= 560 ? 'recover' : 'idle', p: 0 };
  }

  // Unit 6 (Golem): hover -> coiled rise [2] -> heavy vertical slam [3,3,3,3] -> bounce back [2,1]
  if (unitType === 6) {
    if (localT < 180) {
      return { seqFrame: resolveSequenceFrame(meta, 0, globalElapsed, 100, true), dx: 0, dy: Math.round(Math.sin(globalElapsed * 0.01) * 2), phase: 'idle', p: 0 };
    }
    if (localT < 340) {
      const p = (localT - 180) / 160;
      return {
        seqFrame: resolveSequenceFrame(meta, 1, localT - 180, 90, false),
        dx: 0,
        dy: Math.round(-12 * p),
        phase: 'rise',
        p,
      };
    }
    if (localT < 740) {
      const dropP = Math.min(1, (localT - 340) / 120);
      const dy = dropP < 1 ? Math.round(-12 * (1 - dropP)) : 2;
      return {
        seqFrame: resolveSequenceFrame(meta, 2, localT - 340, 80, false),
        dx: 0,
        dy,
        phase: 'slam',
        p: (localT - 340) / 400,
      };
    }
    return { seqFrame: resolveSequenceFrame(meta, 3, localT - 740, 110, false), dx: 0, dy: 0, phase: 'recover', p: 1 };
  }

  // Unit 7 (Catapult): windup [1] -> snap upright launch [2,2] with heavy chassis recoil
  if (unitType === 7) {
    if (localT < 180) return { seqFrame: resolveSequenceFrame(meta, 0, globalElapsed, null, true), dx: 0, dy: 0, phase: 'idle', p: 0 };
    if (localT < 280) return { seqFrame: resolveSequenceFrame(meta, 1, localT - 180, 100, false), dx: 0, dy: 0, phase: 'prep', p: 0 };
    if (localT < 720) {
      const jerk = localT < 370 ? 2 : (localT < 450 ? -1 : 0);
      return { seqFrame: resolveSequenceFrame(meta, 2, localT - 280, 140, false), dx: -dir * Math.abs(jerk), dy: jerk, phase: 'fire', p: (localT - 280) / 440 };
    }
    return { seqFrame: resolveSequenceFrame(meta, 3, localT - 720, 160, false), dx: 0, dy: 0, phase: 'recover', p: 1 };
  }

  // Unit 8 (Dragon / Wyvern): rear neck [1] -> roaring breath [2,2,2] planted -> settle [2,1]
  if (unitType === 8) {
    if (localT < 160) return { seqFrame: resolveSequenceFrame(meta, 0, globalElapsed, null, true), dx: 0, dy: 0, phase: 'idle', p: 0 };
    if (localT < 260) return { seqFrame: resolveSequenceFrame(meta, 1, localT - 160, 100, false), dx: -dir * 2, dy: -1, phase: 'prep', p: 0 };
    if (localT < 780) {
      const rumbleY = localT >= 280 && localT < 680 ? ((Math.floor(localT / 50) % 2) === 0 ? -1 : 0) : 0;
      return { seqFrame: resolveSequenceFrame(meta, 2, localT - 260, 150, false), dx: 0, dy: rumbleY, phase: 'breath', p: (localT - 260) / 520 };
    }
    return { seqFrame: resolveSequenceFrame(meta, 3, localT - 780, 140, false), dx: 0, dy: 0, phase: 'recover', p: 1 };
  }

  // Unit 9 (Commander / King): brace [1] -> raise sword [2,2] (covers t=300ms test anchor!) -> settle [1]
  if (unitType === 9) {
    if (localT < 160) return { seqFrame: resolveSequenceFrame(meta, 0, globalElapsed, null, true), dx: 0, dy: 0, phase: 'idle', p: 0 };
    if (localT < 240) return { seqFrame: resolveSequenceFrame(meta, 1, localT - 160, 80, false), dx: 0, dy: 0, phase: 'prep', p: 0 };
    if (localT < 760) {
      return { seqFrame: resolveSequenceFrame(meta, 2, localT - 240, 160, false), dx: dir * 6, dy: 0, phase: 'slash', p: (localT - 240) / 520 };
    }
    return { seqFrame: resolveSequenceFrame(meta, 3, localT - 760, 140, false), dx: 0, dy: 0, phase: 'recover', p: 1 };
  }

  return { seqFrame: resolveSequenceFrame(meta, 0, globalElapsed, null, true), dx: 0, dy: 0, phase: 'idle', p: 0 };
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
    this.strikeDuration = 1220;
    this.pauseDuration = 280;
    this.counterStart = this.hasCounter ? (this.strikeDuration + this.pauseDuration) : Infinity;
    this.totalDuration = this.hasCounter
      ? (this.counterStart + 1220)
      : (this.strikeDuration + 360);

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
      meta,
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

    if (this.hasCounter && !this.counterStrikeTriggered && this.elapsed >= this.counterStart + 480) {
      this.counterStrikeTriggered = true;
      this.leftSide.visibleCount = this.res.attackerHpAfter <= 0
        ? 0
        : Math.max(1, Math.min(this.leftSide.slots, Math.ceil((this.res.attackerHpAfter * this.leftSide.slots) / 100)));
      this.onSound('attack');
    }

    if (this.hasCounter && this.elapsed >= this.counterStart + 480) {
      const p = Math.min(1, (this.elapsed - (this.counterStart + 480)) / 420);
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

  renderSideFigures(ctx, side, turnStartMs, isHit) {
    const isLeft = side.sideIndex === 0;
    const dir = isLeft ? 1 : -1;
    const localT = turnStartMs >= 0 ? (this.elapsed - turnStartMs) : -1;
    const count = Math.max(0, side.visibleCount);
    const hitShake = isHit ? Math.round(Math.sin(this.elapsed * 0.08) * 3) : 0;

    for (let i = 0; i < count; i++) {
      const fig = side.figures[i];
      if (!fig) continue;
      // Stagger multi-unit groups subtly (like g.java) while keeping unit 0 pinned for deterministic poses
      const unitDelay = i * 16;
      const figT = localT >= 0 ? localT - unitDelay : -1;
      const pose = computeFigurePose({
        unitType: side.unit.type,
        meta: side.meta,
        localT: figT,
        phaseStart: 0,
        phaseEnd: 980,
        impactAt: 460,
        isLeft,
        globalElapsed: this.elapsed + i * 70,
      });

      const fx = fig.baseX + pose.dx + hitShake;
      const fy = fig.baseY + pose.dy;

      // Trailing foot dust puffs when Skeleton runs or Dire Wolf leaps (g.java & c.java)
      if ((pose.phase === 'run' || pose.phase === 'leap' || pose.phase === 'retreat') && this.assets.sprites?.b_smoke) {
        const sf = Math.floor(this.elapsed / 75 + i) % 4;
        drawBattleSpriteFrame(ctx, this.assets, 'b_smoke', 1, sf, fx - dir * 6 + (side.figW >> 1) - 6, fig.baseY + side.figH - 10, false);
      }

      if (side.unit.type === 6 && pose.phase === 'slam' && figT >= 380 && figT < 620 && this.assets.sprites?.smoke) {
        const sf = Math.min(3, Math.floor((figT - 380) / 60));
        drawBattleSpriteFrame(ctx, this.assets, 'smoke', 1, sf, fx + (side.figW >> 1) - 12, fig.baseY + side.figH - 14, false);
      }

      if (isHit && this.assets.sprites?.b_smoke) {
        const sf = Math.floor((this.elapsed / 80 + i)) % Math.max(1, this.assets.sprites.b_smoke.frames?.length ?? 4);
        drawBattleSpriteFrame(ctx, this.assets, 'b_smoke', 1, sf, fig.baseX + (side.figW >> 1) - 6, fig.baseY + (side.figH >> 1) - 5, false);
      }

      // Ground shadow ellipse
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(fx + (side.figW >> 1), fig.baseY + side.figH - 4, Math.max(8, (side.figW >> 1) - 4), 4, 0, 0, Math.PI * 2);
      ctx.fill();

      if (isHit && (Math.floor(this.elapsed / 55) % 2) === 0) {
        ctx.save();
        ctx.globalAlpha = 0.72;
      }
      drawBattleSpriteFrame(ctx, this.assets, side.family, side.palette, pose.seqFrame, fx, fy, isLeft);
      if (side.unit.type === 9) {
        if (pose.seqFrame === 2 && this.assets.sprites?.king_heads_back) {
          drawBattleSpriteFrame(ctx, this.assets, 'king_heads_back', 1, side.kingHead, fx, fy, isLeft);
        } else if (this.assets.sprites?.king_heads) {
          const headIdx = side.kingHead * 2 + (pose.seqFrame % 2);
          drawBattleSpriteFrame(ctx, this.assets, 'king_heads', 1, headIdx, fx, fy, isLeft);
        }
        // King's crescent sword arc aura (kingslash) when swinging (g.java:151)
        if (pose.phase === 'slash' && this.assets.sprites?.kingslash && figT >= 240 && figT < 540) {
          drawBattleSpriteFrame(ctx, this.assets, 'kingslash', 1, 0, fx, fy, isLeft);
        }
      }
      if (isHit && (Math.floor(this.elapsed / 55) % 2) === 0) {
        ctx.restore();
      }
    }
  }

  // Render unit-specific cross-arena attacks (arrows, kingwaves, dragon flame beam, catapult boulders, watermagic/spell)
  renderTurnEffects(ctx, attackerSide, targetSide, damage, turnLocalT) {
    if (turnLocalT < 0) return;
    const isAttackerLeft = attackerSide.sideIndex === 0;
    const dir = isAttackerLeft ? 1 : -1;
    const uType = attackerSide.unit.type;
    const aCount = Math.max(1, attackerSide.visibleCount);
    const tCount = Math.max(1, targetSide.visibleCount);

    // 1. Unit 1 (Archer): arrows fly from bows (320..520ms) & stick in enemy side (520..980ms)
    if (uType === 1 && this.assets.sprites?.archer_arrow) {
      for (let i = 0; i < Math.max(aCount, tCount); i++) {
        const src = attackerSide.figures[i % aCount] ?? attackerSide.figures[0];
        const dst = targetSide.figures[i % tCount] ?? targetSide.figures[0];
        const fireT = turnLocalT - i * 18;
        if (fireT >= 320 && fireT < 500) {
          const p = (fireT - 320) / 180;
          const sx = src.baseX + (attackerSide.figW >> 1) + dir * 12;
          const sy = src.baseY + Math.round(attackerSide.figH * 0.42);
          const ex = dst.baseX + (targetSide.figW >> 1);
          const ey = dst.baseY + Math.round(targetSide.figH * 0.55);
          const ax = sx + (ex - sx) * p - 12;
          const ay = sy + (ey - sy) * p - Math.sin(p * Math.PI) * 14 - 6;
          drawBattleSpriteFrame(ctx, this.assets, 'archer_arrow', 1, 0, ax, ay, isAttackerLeft);
        } else if (fireT >= 500 && fireT < 980) {
          const ex = dst.baseX + (targetSide.figW >> 1) - 10 + (i % 2) * 5;
          const ey = dst.baseY + Math.round(targetSide.figH * 0.58) + ((i % 3) - 1) * 3;
          drawBattleSpriteFrame(ctx, this.assets, 'archer_arrow', 1, 1, ex, ey, isAttackerLeft);
        }
      }
    }

    // 2. Unit 2 (Elemental): watermagic cast orb -> fish splash & watermagic ring on target
    if (uType === 2) {
      const castT = turnLocalT - 260;
      if (castT >= 0 && castT < 240 && this.assets.sprites?.watermagic) {
        const wf = Math.floor(castT / 50) % 4;
        for (let i = 0; i < aCount; i++) {
          const src = attackerSide.figures[i];
          drawBattleSpriteFrame(ctx, this.assets, 'watermagic', 1, wf, src.baseX + (attackerSide.figW >> 1) + dir * 12 - 15, src.baseY - 4, false);
        }
      }
      if (turnLocalT >= 420 && turnLocalT < 880) {
        const hitT = turnLocalT - 420;
        for (let i = 0; i < tCount; i++) {
          const dst = targetSide.figures[i];
          const cx = dst.baseX + (targetSide.figW >> 1);
          const cy = dst.baseY + (targetSide.figH >> 1);
          if (this.assets.sprites?.fish && hitT < 360) {
            const fp = hitT / 360;
            const ff = Math.floor(hitT / 140) % 2;
            const fishY = cy - 18 - Math.sin(fp * Math.PI) * 18;
            drawBattleSpriteFrame(ctx, this.assets, 'fish', 1, ff, cx - 22, fishY, isAttackerLeft);
          }
          if (this.assets.sprites?.watermagic) {
            const wf = Math.floor(hitT / 60) % 4;
            drawBattleSpriteFrame(ctx, this.assets, 'watermagic', 1, wf, cx - 15, cy - 15, false);
          }
        }
      }
    }

    // 3. Unit 3 (Sorceress): crimson spell glyphs on hands -> spell explosions on enemy squad
    if (uType === 3 && this.assets.sprites?.spell) {
      if (turnLocalT >= 260 && turnLocalT < 500) {
        const sf = Math.floor((turnLocalT - 260) / 50) % 7;
        for (let i = 0; i < aCount; i++) {
          const src = attackerSide.figures[i];
          drawBattleSpriteFrame(ctx, this.assets, 'spell', 1, sf, src.baseX + (attackerSide.figW >> 1) + dir * 10 - 15, src.baseY + 2, false);
        }
      }
      if (turnLocalT >= 430 && turnLocalT < 880) {
        const sf = Math.floor((turnLocalT - 430) / 55) % 7;
        for (let i = 0; i < tCount; i++) {
          const dst = targetSide.figures[i];
          drawBattleSpriteFrame(ctx, this.assets, 'spell', 1, sf, dst.baseX + (targetSide.figW >> 1) - 15, dst.baseY + (targetSide.figH >> 1) - 15, false);
        }
      }
    }

    // 4. Unit 4 (Wisp): orbiting light sparks & redspark burst
    if (uType === 4) {
      if (turnLocalT >= 200 && turnLocalT < 520 && this.assets.sprites?.small_spark) {
        for (let i = 0; i < aCount; i++) {
          const src = attackerSide.figures[i];
          const cx = src.baseX + (attackerSide.figW >> 1);
          const cy = src.baseY + (attackerSide.figH >> 1);
          for (let s = 0; s < 3; s++) {
            const ang = turnLocalT * 0.025 + s * ((Math.PI * 2) / 3);
            const sx = cx + Math.cos(ang) * 18 - 3;
            const sy = cy + Math.sin(ang) * 12 - 3;
            drawBattleSpriteFrame(ctx, this.assets, 'small_spark', 1, (Math.floor(turnLocalT / 60) + s) % 5, sx, sy, false);
          }
        }
      }
      if (turnLocalT >= 440 && turnLocalT < 760) {
        const src = attackerSide.figures[0];
        const dst = targetSide.figures[0];
        const p = Math.min(1, (turnLocalT - 440) / 140);
        const sx = src.baseX + (attackerSide.figW >> 1);
        const sy = src.baseY + (attackerSide.figH >> 1);
        const ex = dst.baseX + (targetSide.figW >> 1);
        const ey = dst.baseY + (targetSide.figH >> 1);
        ctx.save();
        ctx.strokeStyle = p < 0.5 ? '#fff8c4' : '#ffe066';
        ctx.lineWidth = Math.max(1, 5 - p * 4);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + (ex - sx) * Math.min(1, p * 1.4), sy + (ey - sy) * Math.min(1, p * 1.4));
        ctx.stroke();
        ctx.restore();
      }
    }

    // 5. Unit 6 (Golem): earthquake crater beneath enemy squad & flying rock chunks
    if (uType === 6 && turnLocalT >= 460 && turnLocalT < 940) {
      const dst = targetSide.figures[0];
      const cx = dst.baseX + (targetSide.figW >> 1);
      const cy = dst.baseY + targetSide.figH - 14;
      if (this.assets.sprites?.crater) {
        drawBattleSpriteFrame(ctx, this.assets, 'crater', 1, 0, cx - 26, cy, false);
      }
      const p = (turnLocalT - 460) / 480;
      ctx.save();
      ctx.fillStyle = '#a0988c';
      for (let r = 0; r < 6; r++) {
        const vx = ((r % 3) - 1) * 18;
        const rx = cx + vx * p * 1.4;
        const ry = cy - Math.sin(p * Math.PI) * (20 + (r % 2) * 12);
        ctx.fillRect(Math.round(rx), Math.round(ry), 4, 4);
      }
      ctx.restore();
    }

    // 6. Unit 7 (Catapult): catapult launch b_smoke + ballistic stone arc -> crater + smoke plume
    if (uType === 7) {
      const src = attackerSide.figures[0];
      const dst = targetSide.figures[0];
      if (turnLocalT >= 280 && turnLocalT < 440 && this.assets.sprites?.b_smoke) {
        const bf = Math.min(3, Math.floor((turnLocalT - 280) / 40));
        drawBattleSpriteFrame(ctx, this.assets, 'b_smoke', 1, bf, src.baseX + (attackerSide.figW >> 1) - 6, src.baseY + 4, false);
      }
      if (turnLocalT >= 300 && turnLocalT < 520) {
        const p = (turnLocalT - 300) / 220;
        const sx = src.baseX + (attackerSide.figW >> 1);
        const sy = src.baseY + 8;
        const ex = dst.baseX + (targetSide.figW >> 1);
        const ey = dst.baseY + (targetSide.figH >> 1);
        const bx = sx + (ex - sx) * p;
        const by = sy + (ey - sy) * p - Math.sin(p * Math.PI) * 56;
        ctx.save();
        ctx.fillStyle = '#5c6678';
        ctx.beginPath();
        ctx.arc(Math.round(bx), Math.round(by), 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#9ea8b8';
        ctx.beginPath();
        ctx.arc(Math.round(bx) - 2, Math.round(by) - 2, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      if (turnLocalT >= 500 && turnLocalT < 980) {
        const cx = dst.baseX + (targetSide.figW >> 1);
        const cy = dst.baseY + targetSide.figH - 12;
        if (this.assets.sprites?.crater) {
          drawBattleSpriteFrame(ctx, this.assets, 'crater', 1, 0, cx - 26, cy, false);
        }
        if (this.assets.sprites?.smoke && turnLocalT < 820) {
          const sf = Math.min(3, Math.floor((turnLocalT - 500) / 80));
          drawBattleSpriteFrame(ctx, this.assets, 'smoke', 1, sf, cx - 16, cy - 18, false);
          drawBattleSpriteFrame(ctx, this.assets, 'smoke', 1, (sf + 1) % 4, cx + 2, cy - 12, false);
        }
      }
    }

    // 7. Unit 8 (Dragon / Wyvern): roaring fire breath cone + billowing flames (g.java & f.java:400 k==6)
    if (uType === 8 && turnLocalT >= 280 && turnLocalT < 780) {
      const src = attackerSide.figures[0];
      const dst = targetSide.figures[0];
      const mouthX = isAttackerLeft ? src.baseX + attackerSide.figW - 14 : src.baseX + 14;
      const mouthY = src.baseY + 18;
      const endX = dst.baseX + (targetSide.figW >> 1);
      const endY = dst.baseY + (targetSide.figH >> 1) + 4;
      const p = Math.min(1, (turnLocalT - 280) / 200);
      const bx = mouthX + (endX - mouthX) * p;
      const by = mouthY + (endY - mouthY) * p;
      const coreR = turnLocalT < 620 ? 12 + Math.sin(turnLocalT * 0.04) * 3 : Math.max(2, 12 * (1 - (turnLocalT - 620) / 160));
      ctx.save();
      ctx.fillStyle = 'rgba(255, 110, 24, 0.85)';
      ctx.beginPath();
      ctx.moveTo(mouthX, mouthY - 3);
      ctx.lineTo(bx, by - coreR);
      ctx.lineTo(bx, by + coreR);
      ctx.lineTo(mouthX, mouthY + 3);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff5a6';
      ctx.beginPath();
      ctx.moveTo(mouthX, mouthY - 1);
      ctx.lineTo(bx, by - coreR * 0.45);
      ctx.lineTo(bx, by + coreR * 0.45);
      ctx.lineTo(mouthX, mouthY + 1);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      if (this.assets.sprites?.b_smoke && p >= 0.6) {
        const sf = Math.floor(turnLocalT / 60) % 4;
        drawBattleSpriteFrame(ctx, this.assets, 'b_smoke', 1, sf, endX - 10, endY - 10, false);
        drawBattleSpriteFrame(ctx, this.assets, 'b_smoke', 1, (sf + 2) % 4, endX + 4, endY - 4, false);
      }
    }

    // 8. Unit 9 (Commander / King): dual diverging kingwave blades flying across arena (g.java:150, 725-755)
    if (uType === 9 && this.assets.sprites?.kingwave && turnLocalT >= 320 && turnLocalT < 720) {
      const src = attackerSide.figures[0];
      const dst = targetSide.figures[0];
      const p = Math.min(1, (turnLocalT - 320) / 360);
      const sx = src.baseX + (attackerSide.figW >> 1);
      const sy = src.baseY + (attackerSide.figH >> 1) - 14;
      const ex = dst.baseX + (targetSide.figW >> 1);
      const kf = Math.floor(turnLocalT / 90) % 2;
      const wx = sx + (ex - sx) * p - 24;
      drawBattleSpriteFrame(ctx, this.assets, 'kingwave', 1, kf, wx, sy - Math.round(p * 18), isAttackerLeft);
      drawBattleSpriteFrame(ctx, this.assets, 'kingwave', 1, kf, wx, sy + Math.round(p * 14), isAttackerLeft);
    }

    // Standard melee/spark burst on enemy impact (460..980ms)
    this.renderImpactEffect(ctx, attackerSide, targetSide, damage, turnLocalT);
  }

  renderImpactEffect(ctx, attackerSide, targetSide, damage, turnLocalT) {
    if (turnLocalT < 450 || turnLocalT > 1100) return;
    const isAttackerLeft = attackerSide.sideIndex === 0;
    const uType = attackerSide.unit.type;
    const fig = targetSide.figures[0];
    if (!fig) return;
    const cx = fig.baseX + (targetSide.figW >> 1);
    const cy = fig.baseY + (targetSide.figH >> 1);

    // Melee slash FX for close-quarters strikers (Soldier, Wolf, Skeleton)
    if ((uType === 0 || uType === 5 || uType === 10) && this.assets.sprites?.slash && turnLocalT < 680) {
      drawBattleSpriteFrame(ctx, this.assets, 'slash', 1, 0, cx - 10, cy - 14, isAttackerLeft);
    }

    // Impact sparks during hit peak
    if (turnLocalT < 740) {
      const sparkFamily = this.assets.sprites?.redspark ? 'redspark' : (this.assets.sprites?.spark ? 'spark' : null);
      if (sparkFamily) {
        const sf = Math.floor((turnLocalT - 450) / 45) % Math.max(1, this.assets.sprites[sparkFamily].frames?.length ?? 6);
        drawBattleSpriteFrame(ctx, this.assets, sparkFamily, 1, sf, cx - 10, cy - 10, false);
      }
      if (this.assets.sprites?.b_smoke) {
        const bFrame = Math.floor((turnLocalT - 450) / 60) % Math.max(1, this.assets.sprites.b_smoke.frames?.length ?? 4);
        drawBattleSpriteFrame(ctx, this.assets, 'b_smoke', 1, bFrame, cx - 6, cy - 6, false);
      }
    }

    // Port of f.java:380 (k == 5): bouncing white/gold damage number
    if (turnLocalT >= 470 && turnLocalT < 1050) {
      const bounceT = (turnLocalT - 470) / 140;
      const bounceY = Math.round(Math.abs(Math.cos(bounceT * Math.PI)) * 11 * Math.max(0, 1 - bounceT * 0.22));
      ctx.save();
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000000';
      const label = `-${damage}`;
      ctx.strokeText(label, cx, fig.baseY - 4 - bounceY);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, cx, fig.baseY - 4 - bounceY);
      ctx.restore();
    }
  }

  render(ctx) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.width, this.height);

    const activeStrike = this.elapsed < this.counterStart;
    const leftTurnStart = activeStrike ? 0 : -1;
    const rightTurnStart = (!activeStrike && this.hasCounter) ? this.counterStart : -1;
    const inAttackerImpact = this.elapsed >= 450 && this.elapsed < 720;
    const inCounterImpact = this.hasCounter && this.elapsed >= this.counterStart + 450 && this.elapsed < this.counterStart + 720;

    // Heavier screen shake on Golem/Catapult/Dragon impacts (g.java)
    const heavyA = (this.attacker.type === 6 || this.attacker.type === 7 || this.attacker.type === 8) ? 5 : 3;
    const heavyD = (this.defender.type === 6 || this.defender.type === 7 || this.defender.type === 8) ? 5 : 3;
    const shakeMag = inAttackerImpact ? heavyA : (inCounterImpact ? heavyD : 0);
    const shakeX = shakeMag ? Math.round(Math.sin(this.elapsed * 0.14) * shakeMag) : 0;
    const shakeY = shakeMag ? Math.round(Math.cos(this.elapsed * 0.18) * (shakeMag - 1)) : 0;

    // Left arena panel (Attacker)
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, this.halfW - 1, this.arenaH);
    ctx.clip();
    this.renderHalfTerrain(ctx, this.attackerTerrain, 0, this.halfW, shakeX, shakeY);
    this.renderSideFigures(ctx, this.leftSide, leftTurnStart, inCounterImpact);
    ctx.restore();

    // Right arena panel (Defender)
    ctx.save();
    ctx.beginPath();
    ctx.rect(this.halfW + 1, 0, this.halfW - 1, this.arenaH);
    ctx.clip();
    this.renderHalfTerrain(ctx, this.defenderTerrain, this.halfW, this.halfW, shakeX, shakeY);
    this.renderSideFigures(ctx, this.rightSide, rightTurnStart, inAttackerImpact);
    ctx.restore();

    // 2px vertical center split bar (i.java:6362)
    ctx.fillStyle = '#000000';
    ctx.fillRect(this.halfW - 1, 0, 2, this.arenaH);

    // Cross-arena projectiles, spells, dragon breath, shockwaves & hit impacts over full arena
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, this.width, this.arenaH);
    ctx.clip();
    if (activeStrike) {
      this.renderTurnEffects(ctx, this.leftSide, this.rightSide, this.res.damage, this.elapsed);
    } else if (this.hasCounter) {
      this.renderTurnEffects(ctx, this.rightSide, this.leftSide, this.res.counterDamage, this.elapsed - this.counterStart);
    }
    ctx.restore();

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
