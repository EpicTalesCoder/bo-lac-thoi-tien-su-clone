// Same-origin Serverless Multiplayer Relay for Prehistoric Tribes (works 100% inside Discord Activity & any browser/firewall)
// Deployed automatically by Vercel at /api/mp

const rooms = new Map();
const MAX_ROOM_MSGS = 120;
const ROOM_TTL_MS = 30 * 60 * 1000;

function cleanupRooms(now) {
  for (const [code, r] of rooms.entries()) {
    if (now - r.updatedAt > ROOM_TTL_MS) rooms.delete(code);
  }
}

function getOrCreateRoom(code, now) {
  let r = rooms.get(code);
  if (!r) {
    r = { seq: 0, snapSeq: 0, msgs: [], snap: null, updatedAt: now };
    rooms.set(code, r);
  }
  r.updatedAt = now;
  return r;
}

function readJsonBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') {
      resolve(req.body);
      return;
    }
    if (typeof req.body === 'string') {
      try {
        resolve(JSON.parse(req.body));
      } catch {
        resolve(null);
      }
      return;
    }
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 512 * 1024) raw = raw.slice(0, 512 * 1024);
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : null);
      } catch {
        resolve(null);
      }
    });
    req.on('error', () => resolve(null));
  });
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const now = Date.now();
  if (rooms.size > 60) cleanupRooms(now);

  if (req.method === 'POST') {
    const body = await readJsonBody(req);
    const code = String(body?.room || '').replace(/[^0-9A-Za-z]/g, '').slice(0, 8);
    const dir = body?.dir === 'c2h' ? 'c2h' : 'h2c';
    const from = String(body?.from || '').slice(0, 32);
    const packet = body?.packet;
    if (!code || !packet || typeof packet !== 'object') {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: false, error: 'invalid_payload' }));
      return;
    }
    const r = getOrCreateRoom(code, now);
    if (packet.type === 'snap' && dir === 'h2c') {
      r.snapSeq += 1;
      r.snap = { seq: r.snapSeq, from, packet, ts: now };
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: true, snapSeq: r.snapSeq }));
      return;
    }
    r.seq += 1;
    r.msgs.push({ seq: r.seq, dir, from, packet, ts: now });
    if (r.msgs.length > MAX_ROOM_MSGS) {
      r.msgs.splice(0, r.msgs.length - MAX_ROOM_MSGS);
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true, seq: r.seq }));
    return;
  }

  if (req.method === 'GET') {
    const q = req.query || {};
    const code = String(q.room || '').replace(/[^0-9A-Za-z]/g, '').slice(0, 8);
    const dir = q.dir === 'c2h' ? 'c2h' : 'h2c';
    const after = Math.max(0, parseInt(q.after, 10) || 0);
    const afterSnap = Math.max(0, parseInt(q.afterSnap, 10) || 0);
    const from = String(q.from || '').slice(0, 32);

    if (!code) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: true, ping: true }));
      return;
    }

    const r = getOrCreateRoom(code, now);
    const msgs = [];
    for (let i = 0; i < r.msgs.length; i++) {
      const m = r.msgs[i];
      if (m.seq > after && m.dir === dir && m.from !== from) {
        msgs.push(m);
      }
    }
    const snap =
      dir === 'h2c' && r.snap && r.snap.seq > afterSnap && r.snap.from !== from
        ? r.snap
        : null;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true, seq: r.seq, snapSeq: r.snapSeq, msgs, snap }));
    return;
  }

  res.statusCode = 405;
  res.end('Method Not Allowed');
}
