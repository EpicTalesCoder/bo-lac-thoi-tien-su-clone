// Lightweight Web Audio retro SFX for Ancient Empires 2 (ported from e.java MIDI/SFX cues).
let audioCtx = null;

function getCtx() {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) audioCtx = new Ctor();
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  return audioCtx;
}

function tone(f0, f1, dur, type = 'square', peak = 0.07) {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(Math.max(40, f0), now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(40, f1), now + dur);
  gain.gain.setValueAtTime(peak, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + dur);
}

export function playAe2Sfx(kind) {
  switch (kind) {
    case 'attack': tone(340, 120, 0.11, 'sawtooth', 0.08); break;
    case 'capture': tone(440, 660, 0.16, 'square', 0.07); break;
    case 'raise': tone(220, 520, 0.2, 'triangle', 0.08); break;
    case 'recruit': tone(520, 780, 0.12, 'square', 0.06); break;
    case 'levelup': tone(580, 1040, 0.22, 'square', 0.08); break;
    case 'turn': tone(360, 480, 0.09, 'triangle', 0.05); break;
    case 'victory': tone(523, 1046, 0.3, 'square', 0.09); break;
    case 'defeat': tone(300, 90, 0.3, 'sawtooth', 0.09); break;
    default: break;
  }
}
