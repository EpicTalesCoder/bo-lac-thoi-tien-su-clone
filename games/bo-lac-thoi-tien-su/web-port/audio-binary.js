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
        });
      } else if (type === 0xa0 || type === 0xb0 || type === 0xe0) {
        p += 2;
      } else if (type === 0xc0 || type === 0xd0) {
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
      if (!active.has(key)) active.set(key, { tSec, vel: ev.vel, ch: ev.ch, note: ev.note });
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
    this.currentTrackIndex = 0;
    this.playing = false;
    this.audioCtx = null;
    this.timerId = null;
    this.noteCursor = 0;
    this.trackStartWallSec = 0;
  }

  loadTracks(saBytes) {
    this.tracks = extractMidiTracksFromSa(saBytes);
    return this.tracks.length;
  }

  ensureContext() {
    if (!this.audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) this.audioCtx = new Ctx();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  playTrack(index = 0) {
    if (!this.tracks.length) return;
    this.currentTrackIndex = Math.max(0, Math.min(this.tracks.length - 1, index));
    if (!this.enabled) {
      this.stop();
      return;
    }
    const ctx = this.ensureContext();
    if (!ctx) return;

    this.stop();
    this.playing = true;
    this.noteCursor = 0;
    this.trackStartWallSec = ctx.currentTime + 0.05;
    this.timerId = window.setInterval(() => this.scheduleLookahead(), 90);
  }

  scheduleLookahead() {
    if (!this.playing || !this.enabled || !this.audioCtx) return;
    const track = this.tracks[this.currentTrackIndex];
    if (!track || track.notes.length === 0) return;

    const now = this.audioCtx.currentTime;
    const elapsed = now - this.trackStartWallSec;
    const lookahead = elapsed + 0.24;

    while (this.noteCursor < track.notes.length) {
      const n = track.notes[this.noteCursor];
      if (n.timeSec > lookahead) break;
      if (n.timeSec >= elapsed - 0.05) {
        this.triggerNote(n, this.trackStartWallSec + n.timeSec);
      }
      this.noteCursor++;
    }

    if (elapsed >= track.durationSec + 0.3) {
      this.noteCursor = 0;
      this.trackStartWallSec = now + 0.1;
    }
  }

  triggerNote(n, startTime) {
    const ctx = this.audioCtx;
    if (!ctx || ctx.state !== 'running') return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      // Percussion channel 9 gets a short low thump; melody/harmony channels get triangle/square
      if (n.channel === 9) {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(95, startTime);
        osc.frequency.exponentialRampToValueAtTime(38, startTime + 0.08);
      } else {
        osc.type = n.channel % 2 === 0 ? 'triangle' : 'square';
        const freq = 440 * Math.pow(2, (n.midiNote - 69) / 12);
        osc.frequency.setValueAtTime(freq, startTime);
      }
      const peak = Math.min(0.065, ((n.velocity || 80) / 127) * (n.channel % 2 === 0 ? 0.055 : 0.03));
      const dur = n.channel === 9 ? 0.09 : Math.min(1.2, n.durationSec);
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(peak, startTime + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + dur + 0.02);
    } catch {}
  }

  stop() {
    this.playing = false;
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
