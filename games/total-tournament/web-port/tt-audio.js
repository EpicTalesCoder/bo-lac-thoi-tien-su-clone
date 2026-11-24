// Lightweight Web Audio API retro SFX synthesizer mapped 1:1 to d.java / e.java sound IDs.
// Lazily unlocks on first user gesture; zero external audio files or console warnings.

let audioCtx = null;

function getCtx() {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) audioCtx = new Ctor();
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  return audioCtx;
}

function playTone(freqStart, freqEnd, duration, type = 'square', gainPeak = 0.08) {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(Math.max(40, freqStart), now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(40, freqEnd), now + duration);
  gain.gain.setValueAtTime(gainPeak, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration);
}

// Port of e.a(int id, boolean loop) -> d.a(int) sound triggers.
export function playSourceSound(soundId, enabled = true) {
  if (!enabled) return;
  switch (soundId) {
    case 0: // Explosion / hit (e.java:997)
      playTone(150, 42, 0.22, 'sawtooth', 0.11);
      break;
    case 1: // Rocket launch (e.java:1474)
      playTone(320, 90, 0.16, 'sawtooth', 0.09);
      break;
    case 2: // Enemy flag alert (e.java:1151, 1175)
      playTone(440, 330, 0.14, 'triangle', 0.08);
      break;
    case 3: // Flag capture / steal (e.java:1148, 1178)
      playTone(520, 880, 0.18, 'square', 0.08);
      break;
    case 4: // Player death (e.java:1096, 1340)
      playTone(260, 65, 0.28, 'sawtooth', 0.1);
      break;
    case 5: // Railgun / Beam (e.java:1492)
      playTone(980, 220, 0.15, 'sawtooth', 0.09);
      break;
    case 6: // Pickup collected (e.java:827)
      playTone(580, 920, 0.09, 'square', 0.07);
      break;
    case 8: // Chainsaw (e.java:1455)
      playTone(140, 110, 0.07, 'sawtooth', 0.07);
      break;
    case 10: // Standard gunfire (machinegun / shotgun / plasma)
      playTone(460, 140, 0.06, 'square', 0.05);
      break;
    default:
      break;
  }
}
