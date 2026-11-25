/**
 * Phase 6: Direct binary parsers for original `/a` (18,842 bytes), `/pd0` (96,990 bytes),
 * and `/sa` (26,616 bytes — 5 embedded Standard MIDI tracks) + Web Audio API MIDI Synth.
 * Exact port of e.java:35-239 & a.java.
 */

export const PD0_TABLE_SIZES = [
  119, 1291, 162, 162, 2782, 144, 1069, 6903, 823, 1721, 5492,
  119, 1291, 1291, 1291, 162, 162, 162, 2782, 2782, 144, 1069,
  1069, 6903, 6903, 6903, 823, 1721, 42, 5492, 5492, 1810, 1810,
  1810, 1810, 1810,
];

export const SA_TRACK_OFFSETS = [0, 8014, 14329, 19977, 23382];
export const SA_TRACK_LENGTHS = [8014, 6315, 5648, 3405, 3234];
export const SA_TRACK_NAMES = [
  'Track 1: Menu & Khởi nguyên',
  'Track 2: Bình minh Avnotaklu',
  'Track 3: Xây dựng & Khai thác',
  'Track 4: Giao tranh Bộ lạc',
  'Track 5: Khúc Khải hoàn',
];

function toSignedByte(v) {
  const b = v & 0xff;
  return b > 127 ? b - 256 : b;
}

function toSignedShortBE(hi, lo) {
  const u = ((hi & 0xff) << 8) | (lo & 0xff);
  return u > 32767 ? u - 65536 : u;
}

function toSignedShortLE(lo, hi) {
  const u = ((hi & 0xff) << 8) | (lo & 0xff);
  return u > 32767 ? u - 65536 : u;
}

/**
 * Direct binary parser for `/pd0` (exact port of e.java:54-76 b()).
 * Produces `shortSpriteTables[0..10]` and `byteSpriteTables[0..24]`.
 */
export function parseOriginalPd0(pd0Bytes) {
  if (!pd0Bytes || pd0Bytes.length < 96990) return null;
  let pos = 1; // skip leading version/header byte (dataInputStream.readByte())
  let n2 = 0;
  const shortSpriteTables = [];
  const byteSpriteTables = [];

  for (let i = 0; i <= 10; i++) {
    const len = PD0_TABLE_SIZES[n2++];
    const arr = new Array(len);
    for (let k = 0; k < len; k++) {
      arr[k] = toSignedShortBE(pd0Bytes[pos], pd0Bytes[pos + 1]);
      pos += 2;
    }
    shortSpriteTables.push(arr);
  }

  for (let i = 0; i <= 24; i++) {
    const len = PD0_TABLE_SIZES[n2++];
    const arr = new Array(len);
    for (let k = 0; k < len; k++) {
      arr[k] = toSignedByte(pd0Bytes[pos++]);
    }
    byteSpriteTables.push(arr);
  }

  return { shortSpriteTables, byteSpriteTables };
}

/**
 * Direct binary parser for `/a` (exact port of e.java:175-215 f()).
 * Produces `mapTableData` (17,638 bytes), `mapTableOffsets` (312 shorts),
 * and `entityFieldOffsets` (570 shorts).
 */
export function parseOriginalA(aBytes) {
  if (!aBytes || aBytes.length < 18842) return null;
  let pos = 0;
  const mapTableData = new Array(17638).fill(0);
  const mapTableOffsets = new Array(312).fill(0);
  const entityFieldOffsets = new Array(570).fill(0);
  const sectionOffsets = new Array(5).fill(0);

  for (let n4 = 0; n4 < 312; n4++) {
    const n3 = aBytes[pos++] & 0xff;
    const n2 = aBytes[pos++] & 0xff;
    const n = (n2 << 8) + n3;
    if (n4 < 311) {
      mapTableOffsets[n4 + 1] = mapTableOffsets[n4] + n;
    }
    const base = mapTableOffsets[n4];
    for (let k = 0; k < n; k++) {
      mapTableData[base + k] = toSignedByte(aBytes[pos++]);
    }
  }
  mapTableData[17180] = 27; // settled runtime constant from f.java init

  for (let n4 = 0; n4 < 5; n4++) {
    const n3 = aBytes[pos++] & 0xff;
    const n2 = aBytes[pos++] & 0xff;
    const n = (n2 << 8) + n3;
    if (n4 < 4) {
      sectionOffsets[n4 + 1] = sectionOffsets[n4] + n;
    }
    const base = sectionOffsets[n4];
    for (let k = 0; k < n; k++) {
      const lo = aBytes[pos++] & 0xff;
      const hi = aBytes[pos++] & 0xff;
      entityFieldOffsets[base + k] = toSignedShortLE(lo, hi);
    }
  }

  return { mapTableData, mapTableOffsets, entityFieldOffsets };
}

/**
 * Parse a Standard MIDI File (SMF Format 0/1) slice from `/sa` into a flat list
 * of timed note events `{ timeSec, durationSec, midiNote, velocity, channel }`.
 */
export function parseSmfMidiEvents(midiBytes) {
  if (!midiBytes || midiBytes.length < 14) return { durationSec: 0, notes: [] };
  if (
    midiBytes[0] !== 0x4d ||
    midiBytes[1] !== 0x54 ||
    midiBytes[2] !== 0x68 ||
    midiBytes[3] !== 0x64
  ) {
    return { durationSec: 0, notes: [] };
  }

  const nTracks = (midiBytes[10] << 8) | midiBytes[11];
  const division = (midiBytes[12] << 8) | midiBytes[13] || 480;
  let pos = 14;

  const rawEvents = [];
  const tempoChanges = [{ tick: 0, usPerBeat: 500000 }];
  const channelPrograms = new Array(16).fill(0);

  for (let t = 0; t < nTracks && pos + 8 <= midiBytes.length; t++) {
    const chunkLen =
      ((midiBytes[pos + 4] & 0xff) << 24) |
      ((midiBytes[pos + 5] & 0xff) << 16) |
      ((midiBytes[pos + 6] & 0xff) << 8) |
      (midiBytes[pos + 7] & 0xff);
    pos += 8;
    const end = Math.min(midiBytes.length, pos + chunkLen);
    let p = pos;
    let tick = 0;
    let runningStatus = 0;

    const readVarLen = () => {
      let val = 0;
      let count = 0;
      while (p < end && count < 4) {
        const b = midiBytes[p++] & 0xff;
        val = (val << 7) | (b & 0x7f);
        count++;
        if ((b & 0x80) === 0) break;
      }
      return val;
    };

    while (p < end) {
      tick += readVarLen();
      if (p >= end) break;
      let status = midiBytes[p] & 0xff;
      if (status < 0x80) {
        status = runningStatus;
      } else {
        p++;
        if (status < 0xf0) runningStatus = status;
      }

      const type = status & 0xf0;
      const ch = status & 0x0f;

      if (type === 0x90 || type === 0x80) {
        const note = midiBytes[p++] & 0x7f;
        const vel = midiBytes[p++] & 0x7f;
        rawEvents.push({
          tick,
          on: type === 0x90 && vel > 0,
          note,
          vel,
          ch,
          prog: channelPrograms[ch] || 0,
        });
      } else if (type === 0xa0 || type === 0xb0 || type === 0xe0) {
        p += 2;
      } else if (type === 0xc0) {
        channelPrograms[ch] = midiBytes[p++] & 0x7f;
      } else if (type === 0xd0) {
        p += 1;
      } else if (status === 0xff) {
        const metaType = midiBytes[p++] & 0xff;
        const len = readVarLen();
        if (metaType === 0x51 && len === 3 && p + 3 <= end) {
          const usPerBeat =
            ((midiBytes[p] & 0xff) << 16) |
            ((midiBytes[p + 1] & 0xff) << 8) |
            (midiBytes[p + 2] & 0xff);
          if (usPerBeat > 0) tempoChanges.push({ tick, usPerBeat });
        }
        p += len;
      } else if (status === 0xf0 || status === 0xf7) {
        const len = readVarLen();
        p += len;
      } else {
        break;
      }
    }
    pos = end;
  }

  tempoChanges.sort((a, b) => a.tick - b.tick);
  const tickToSec = (targetTick) => {
    let sec = 0;
    let prevTick = 0;
    let curUs = 500000;
    for (const tc of tempoChanges) {
      if (tc.tick >= targetTick) break;
      sec += ((tc.tick - prevTick) * (curUs / 1e6)) / division;
      prevTick = tc.tick;
      curUs = tc.usPerBeat;
    }
    sec += ((targetTick - prevTick) * (curUs / 1e6)) / division;
    return sec;
  };

  rawEvents.sort((a, b) => a.tick - b.tick);
  const active = new Map();
  const notes = [];
  let maxSec = 0;

  for (const ev of rawEvents) {
    const key = `${ev.ch}:${ev.note}`;
    const tSec = tickToSec(ev.tick);
    if (ev.on) {
      if (!active.has(key)) active.set(key, { tSec, vel: ev.vel, ch: ev.ch, note: ev.note, prog: ev.prog || 0 });
    } else if (active.has(key)) {
      const start = active.get(key);
      active.delete(key);
      const dur = Math.max(0.05, Math.min(2.5, tSec - start.tSec));
      notes.push({
        timeSec: start.tSec,
        durationSec: dur,
        midiNote: start.note,
        velocity: start.vel,
        channel: start.ch,
        program: start.prog,
      });
      maxSec = Math.max(maxSec, start.tSec + dur);
    }
  }

  return { durationSec: Math.max(2, maxSec), notes };
}

/**
 * Extract and parse all 5 embedded MIDI tracks from `/sa` (e.java:227-233).
 */
export function extractMidiTracksFromSa(saBytes) {
  if (!saBytes || saBytes.length < 26616) return [];
  const tracks = [];
  for (let i = 0; i < SA_TRACK_OFFSETS.length; i++) {
    const off = SA_TRACK_OFFSETS[i];
    const len = SA_TRACK_LENGTHS[i];
    const slice = saBytes.subarray(off, off + len);
    const parsed = parseSmfMidiEvents(slice);
    tracks.push({
      index: i,
      name: SA_TRACK_NAMES[i],
      byteLength: len,
      durationSec: parsed.durationSec,
      notes: parsed.notes,
    });
  }
  return tracks;
}

/**
 * Web Audio API polyphonic MIDI synthesizer for the 5 `/sa` tracks.
 */
export class PrehistoricMidiSynth {
  constructor() {
    this.tracks = [];
    this.enabled = true;
    this.sfxEnabled = true;
    this.currentTrackIndex = 0;
    this.playing = false;
    this.audioCtx = null;
    this.masterGain = null;
    this.noiseBuffer = null;
    this.timerId = null;
    this.noteCursor = 0;
    this.trackStartWallSec = 0;
    this.onTrackEnded = null;
    this._lastSfxAt = new Map();
  }

  loadTracks(saBytes) {
    this.tracks = extractMidiTracksFromSa(saBytes);
    return this.tracks.length;
  }

  ensureContext() {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) {
        this.audioCtx = new Ctx();
        const comp = this.audioCtx.createDynamicsCompressor();
        comp.threshold.setValueAtTime(-16, this.audioCtx.currentTime);
        comp.ratio.setValueAtTime(6, this.audioCtx.currentTime);
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.setValueAtTime(0.85, this.audioCtx.currentTime);
        this.masterGain.connect(comp);
        comp.connect(this.audioCtx.destination);
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  unlock() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => {
        if (this.enabled && this.playing && this.noteCursor === 0) {
          this.trackStartWallSec = ctx.currentTime + 0.04;
        }
        if (this.enabled && this.playing) {
          this.scheduleLookahead();
        }
      }).catch(() => {});
    } else if (this.enabled && !this.playing && this.tracks.length > 0 && this._wantPlay) {
      this.playTrack(this.currentTrackIndex);
    }
  }

  getNoiseBuffer() {
    const ctx = this.audioCtx;
    if (!ctx) return null;
    if (!this.noiseBuffer) {
      const len = Math.floor(ctx.sampleRate * 0.3);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const ch = buf.getChannelData(0);
      for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
      this.noiseBuffer = buf;
    }
    return this.noiseBuffer;
  }

  playTrack(index = 0) {
    this.currentTrackIndex = Math.max(0, Math.min(Math.max(0, this.tracks.length - 1), index));
    this._wantPlay = Boolean(this.enabled);
    if (!this.tracks.length) return;
    if (!this.enabled) {
      this.stop();
      return;
    }
    const ctx = this.ensureContext();
    if (!ctx) return;

    this.stop();
    this._wantPlay = true;
    this.playing = true;
    this.noteCursor = 0;
    this.trackStartWallSec = ctx.currentTime + 0.05;
    this.timerId = window.setInterval(() => this.scheduleLookahead(), 85);
  }

  scheduleLookahead() {
    if (!this.playing || !this.enabled || !this.audioCtx) return;
    const track = this.tracks[this.currentTrackIndex];
    if (!track || track.notes.length === 0) return;

    const now = this.audioCtx.currentTime;
    // Wait without dropping notes while browser autoplay policy holds AudioContext suspended
    if (this.audioCtx.state !== 'running') {
      this.trackStartWallSec = now + 0.05;
      this.noteCursor = 0;
      return;
    }

    const elapsed = now - this.trackStartWallSec;
    const lookahead = elapsed + 0.24;

    while (this.noteCursor < track.notes.length) {
      const n = track.notes[this.noteCursor];
      if (n.timeSec > lookahead) break;
      if (n.timeSec >= elapsed - 0.06) {
        this.triggerNote(n, this.trackStartWallSec + n.timeSec);
      }
      this.noteCursor++;
    }

    if (elapsed >= track.durationSec + 0.25) {
      if (typeof this.onTrackEnded === 'function') {
        const nextIdx = this.onTrackEnded(this.currentTrackIndex);
        if (typeof nextIdx === 'number' && nextIdx !== this.currentTrackIndex) {
          this.playTrack(nextIdx);
          return;
        }
      }
      this.noteCursor = 0;
      this.trackStartWallSec = now + 0.1;
    }
  }

  triggerPercussion(note, vel, startTime) {
    const ctx = this.audioCtx;
    const dest = this.masterGain || ctx.destination;
    const vScale = Math.max(0.25, (vel || 90) / 127);
    if (note === 35 || note === 36) {
      // Bass kick drum
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(130, startTime);
      osc.frequency.exponentialRampToValueAtTime(38, startTime + 0.11);
      gain.gain.setValueAtTime(0.14 * vScale, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.13);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(startTime);
      osc.stop(startTime + 0.14);
    } else if (note === 38 || note === 40 || note === 37) {
      // Snare / rimshot
      const nb = this.getNoiseBuffer();
      if (nb) {
        const src = ctx.createBufferSource();
        src.buffer = nb;
        const filt = ctx.createBiquadFilter();
        filt.type = 'highpass';
        filt.frequency.setValueAtTime(1100, startTime);
        const ng = ctx.createGain();
        ng.gain.setValueAtTime(0.08 * vScale, startTime);
        ng.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.09);
        src.connect(filt);
        filt.connect(ng);
        ng.connect(dest);
        src.start(startTime);
        src.stop(startTime + 0.1);
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(190, startTime);
      osc.frequency.exponentialRampToValueAtTime(95, startTime + 0.06);
      gain.gain.setValueAtTime(0.07 * vScale, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.07);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(startTime);
      osc.stop(startTime + 0.08);
    } else if (note === 42 || note === 44 || note === 46 || note === 49 || note === 51 || note === 57) {
      // Hi-hat / Crash cymbal
      const nb = this.getNoiseBuffer();
      if (nb) {
        const src = ctx.createBufferSource();
        src.buffer = nb;
        const filt = ctx.createBiquadFilter();
        filt.type = 'highpass';
        filt.frequency.setValueAtTime(note >= 49 ? 3500 : 5200, startTime);
        const dur = note === 46 || note >= 49 ? 0.16 : 0.045;
        const ng = ctx.createGain();
        ng.gain.setValueAtTime((note >= 49 ? 0.075 : 0.05) * vScale, startTime);
        ng.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);
        src.connect(filt);
        filt.connect(ng);
        ng.connect(dest);
        src.start(startTime);
        src.stop(startTime + dur + 0.01);
      }
    } else {
      // Tribal tom / bongo / conga / woodblock
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const baseF = 110 + ((note - 41) * 14);
      osc.frequency.setValueAtTime(Math.max(85, Math.min(520, baseF)), startTime);
      osc.frequency.exponentialRampToValueAtTime(Math.max(55, baseF * 0.65), startTime + 0.09);
      gain.gain.setValueAtTime(0.1 * vScale, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.1);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(startTime);
      osc.stop(startTime + 0.11);
    }
  }

  triggerNote(n, startTime) {
    const ctx = this.audioCtx;
    if (!ctx || ctx.state !== 'running') return;
    try {
      if (n.channel === 9) {
        this.triggerPercussion(n.midiNote, n.velocity, startTime);
        return;
      }
      const dest = this.masterGain || ctx.destination;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const prog = n.program || 0;
      const isBass = prog >= 32 && prog <= 39;
      const isLead = prog >= 72 && prog <= 87;
      osc.type = isBass ? 'triangle' : isLead ? 'sawtooth' : n.channel % 2 === 0 ? 'triangle' : 'square';
      const freq = 440 * Math.pow(2, (n.midiNote - 69) / 12);
      osc.frequency.setValueAtTime(freq, startTime);

      const basePeak = osc.type === 'triangle' ? 0.085 : osc.type === 'sawtooth' ? 0.045 : 0.042;
      const peak = Math.min(0.11, ((n.velocity || 85) / 127) * basePeak);
      const dur = Math.min(1.25, Math.max(0.06, n.durationSec));
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(peak, startTime + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

      if (osc.type === 'sawtooth' || osc.type === 'square') {
        const filt = ctx.createBiquadFilter();
        filt.type = 'lowpass';
        filt.frequency.setValueAtTime(isBass ? 800 : 2400, startTime);
        osc.connect(filt);
        filt.connect(gain);
      } else {
        osc.connect(gain);
      }
      gain.connect(dest);
      osc.start(startTime);
      osc.stop(startTime + dur + 0.02);
    } catch {}
  }

  playSfx(kind) {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => {
        if (this.sfxEnabled && ctx.state === 'running') this.playSfx(kind);
      }).catch(() => {});
      return;
    }
    if (ctx.state !== 'running') return;
    const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const cooldownMs =
      kind === 'chop' || kind === 'mine' || kind === 'build' ? 220 :
      kind === 'hit' || kind === 'throw' ? 140 :
      kind === 'alert' ? 900 : 50;
    const prev = this._lastSfxAt.get(kind) || 0;
    if (nowMs - prev < cooldownMs) return;
    this._lastSfxAt.set(kind, nowMs);

    const t = ctx.currentTime;
    const dest = this.masterGain || ctx.destination;
    const tone = (type, f0, f1, dur, vol = 0.09, delay = 0) => {
      try {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(f0, t + delay);
        if (f1 !== f0) osc.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + delay + dur);
        g.gain.setValueAtTime(0.0001, t + delay);
        g.gain.linearRampToValueAtTime(vol, t + delay + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, t + delay + dur);
        osc.connect(g);
        g.connect(dest);
        osc.start(t + delay);
        osc.stop(t + delay + dur + 0.015);
      } catch {}
    };
    const noiseHit = (freq, dur, vol = 0.08, delay = 0) => {
      try {
        const nb = this.getNoiseBuffer();
        if (!nb) return;
        const src = ctx.createBufferSource();
        src.buffer = nb;
        const filt = ctx.createBiquadFilter();
        filt.type = 'bandpass';
        filt.frequency.setValueAtTime(freq, t + delay);
        const g = ctx.createGain();
        g.gain.setValueAtTime(vol, t + delay);
        g.gain.exponentialRampToValueAtTime(0.0001, t + delay + dur);
        src.connect(filt);
        filt.connect(g);
        g.connect(dest);
        src.start(t + delay);
        src.stop(t + delay + dur + 0.015);
      } catch {}
    };

    switch (kind) {
      case 'ui_move': tone('triangle', 520, 580, 0.035, 0.055); break;
      case 'ui_confirm': tone('triangle', 480, 720, 0.07, 0.08); tone('triangle', 720, 960, 0.08, 0.06, 0.04); break;
      case 'ui_cancel': tone('triangle', 420, 260, 0.09, 0.07); break;
      case 'select': tone('sine', 620, 780, 0.055, 0.065); break;
      case 'order': tone('triangle', 420, 560, 0.065, 0.075); break;
      case 'chop': noiseHit(950, 0.06, 0.07); tone('triangle', 210, 110, 0.05, 0.075); break;
      case 'mine': tone('square', 920, 540, 0.05, 0.045); noiseHit(2600, 0.045, 0.06); break;
      case 'build': tone('triangle', 240, 140, 0.055, 0.085); noiseHit(1200, 0.04, 0.05); break;
      case 'build_done': tone('triangle', 392, 392, 0.09, 0.08, 0); tone('triangle', 494, 494, 0.09, 0.08, 0.08); tone('triangle', 587, 587, 0.16, 0.09, 0.16); break;
      case 'throw': noiseHit(2200, 0.07, 0.06); tone('sine', 640, 290, 0.07, 0.05); break;
      case 'hit': noiseHit(700, 0.075, 0.09); tone('sawtooth', 170, 72, 0.08, 0.06); break;
      case 'death': tone('sawtooth', 260, 85, 0.22, 0.075); break;
      case 'birth': tone('triangle', 523, 659, 0.1, 0.08, 0); tone('triangle', 659, 784, 0.12, 0.08, 0.1); tone('triangle', 1046, 1046, 0.18, 0.08, 0.21); break;
      case 'alert': tone('square', 440, 587, 0.12, 0.06, 0); tone('square', 587, 440, 0.12, 0.06, 0.13); break;
      case 'victory': tone('triangle', 523, 523, 0.11, 0.09, 0); tone('triangle', 659, 659, 0.11, 0.09, 0.11); tone('triangle', 784, 784, 0.11, 0.09, 0.22); tone('triangle', 1046, 1046, 0.28, 0.1, 0.33); break;
      default: break;
    }
  }

  stop() {
    this.playing = false;
    this._wantPlay = false;
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  setEnabled(flag, autoTrackIndex = this.currentTrackIndex) {
    this.enabled = Boolean(flag);
    if (this.enabled) {
      this.playTrack(autoTrackIndex);
    } else {
      this.stop();
    }
  }

  cycleTrack() {
    if (!this.tracks.length) return 0;
    const next = (this.currentTrackIndex + 1) % this.tracks.length;
    this.enabled = true;
    this.playTrack(next);
    return next;
  }
}
