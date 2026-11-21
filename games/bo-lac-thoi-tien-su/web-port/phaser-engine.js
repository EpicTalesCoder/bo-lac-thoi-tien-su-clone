/**
 * Phaser 3 (WebGL / Canvas 60 FPS) Hardware-Accelerated Runtime Engine
 * for Prehistoric Tribes (Bộ lạc thời tiền sử) and future J2ME (.jar) web ports.
 *
 * Features:
 * - Drives an authentic fixed-timestep J2ME simulation clock (120ms/tick) inside Phaser.Scene.update(time, delta)
 * - 60 FPS sub-tick unit position interpolation & silky-smooth camera lerp (smoothCamX / smoothCamY)
 * - Uploads the 240×320 logical offscreen framebuffer into a pixel-art Phaser CanvasTexture rendered via WebGL
 * - Automatic graceful fallback if Phaser CDN is offline
 */

export function mountPhaserRuntime({
  canvas,
  width = 240,
  height = 320,
  tickMs = 120,
  onStepSimulation,
  onFrameInterpolate,
  onRenderFrame,
}) {
  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const offCtx = offscreen.getContext('2d');
  offCtx.imageSmoothingEnabled = false;

  const PhaserGlobal = typeof window !== 'undefined' ? window.Phaser : null;

  if (!PhaserGlobal) {
    // Fallback to native 2D canvas + requestAnimationFrame if offline
    const directCtx = canvas.getContext('2d');
    directCtx.imageSmoothingEnabled = false;
    let lastTime = performance.now();
    let acc = 0;
    function fallbackLoop(now) {
      const dt = Math.min(250, Math.max(0, now - lastTime));
      lastTime = now;
      acc += dt;
      while (acc >= tickMs) {
        acc -= tickMs;
        onStepSimulation(now);
      }
      const subTick = Math.max(0, Math.min(0.99, acc / tickMs));
      const needsDraw = onFrameInterpolate(subTick, dt);
      if (needsDraw) {
        onRenderFrame(directCtx);
      }
      window.requestAnimationFrame(fallbackLoop);
    }
    window.requestAnimationFrame(fallbackLoop);
    return {
      mode: 'Canvas2D',
      ctx: directCtx,
      requestRedraw() {
        onRenderFrame(directCtx);
      },
    };
  }

  let phaserTexture = null;
  let dirty = true;
  let acc = 0;

  class J2MEPhaserScene extends PhaserGlobal.Scene {
    constructor() {
      super({ key: 'J2MEPhaserScene' });
    }

    create() {
      phaserTexture = this.textures.createCanvas('j2me_framebuffer', width, height);
      // Force nearest-neighbor pixel art filtering in WebGL
      if (phaserTexture.setFilter && PhaserGlobal.Textures?.FilterMode) {
        phaserTexture.setFilter(PhaserGlobal.Textures.FilterMode.NEAREST);
      }
      const displayImg = this.add.image(0, 0, 'j2me_framebuffer').setOrigin(0, 0);
      displayImg.setDisplaySize(width, height);
      this.flushToGpu();
    }

    flushToGpu() {
      if (!phaserTexture) return;
      onRenderFrame(offCtx);
      const texCtx = phaserTexture.getContext();
      texCtx.imageSmoothingEnabled = false;
      texCtx.clearRect(0, 0, width, height);
      texCtx.drawImage(offscreen, 0, 0);
      phaserTexture.refresh();
      dirty = false;
    }

    update(time, delta) {
      const dt = Math.min(250, Math.max(0, delta));
      acc += dt;
      let stepped = false;
      while (acc >= tickMs) {
        acc -= tickMs;
        onStepSimulation(time);
        stepped = true;
      }
      const subTick = Math.max(0, Math.min(0.99, acc / tickMs));
      const changed = onFrameInterpolate(subTick, dt);
      if (stepped || changed || dirty) {
        this.flushToGpu();
      }
    }
  }

  const game = new PhaserGlobal.Game({
    type: PhaserGlobal.WEBGL,
    canvas,
    width,
    height,
    pixelArt: true,
    antialias: false,
    roundPixels: true,
    transparent: false,
    backgroundColor: '#000000',
    audio: { noAudio: true },
    banner: false,
    scene: [J2MEPhaserScene],
  });

  return {
    mode: 'Phaser 3 WebGL',
    game,
    ctx: offCtx,
    requestRedraw() {
      dirty = true;
      const scene = game.scene?.getScene?.('J2MEPhaserScene');
      if (scene && phaserTexture) {
        scene.flushToGpu();
      }
    },
  };
}
