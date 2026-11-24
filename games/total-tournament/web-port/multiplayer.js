/**
 * Real-Time Multiplayer Room & Authoritative Sync Engine for Total Tournament (2-4 Players + Bots).
 * Quad Transport (cross-network & Discord Activity ready):
 *  1) BroadcastChannel (instant <5ms multi-tab play locally / offline)
 *  2) SameOriginHttpRelay (/api/mp on Vercel / Discord Activity "/" root)
 *  3) NtfyHttpsRelay (Port-443 HTTPS/WSS firewall bypass)
 *  4) MqttWssRelay (MQTT-over-WSS cross-instance sync)
 *  + Optional PeerJS WebRTC P2P when window.Peer is present
 */

const PEER_CONFIG = {
  debug: 0,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  },
};

const WSS_BROKERS = [
  'wss://broker.emqx.io:8084/mqtt',
  'wss://broker.hivemq.com:8884/mqtt',
];

function isDiscordActivity() {
  if (typeof window === 'undefined' || !window.location) return false;
  const host = window.location.hostname || '';
  return host.endsWith('.discordsays.com') || (window.location.search || '').includes('frame_id=');
}

function getMqttBrokers() {
  if (isDiscordActivity()) {
    const host = window.location.host;
    return [
      `wss://${host}/emqx/mqtt`,
      `wss://${host}/.proxy/emqx/mqtt`,
      `wss://${host}/hivemq/mqtt`,
    ];
  }
  return WSS_BROKERS;
}

function getNtfyEndpoints() {
  if (isDiscordActivity()) {
    return {
      httpBase: `${window.location.origin}/ntfy`,
      wsBase: `wss://${window.location.host}/ntfy`,
      discordProxy: true,
    };
  }
  return { httpBase: 'https://ntfy.sh', wsBase: 'wss://ntfy.sh', discordProxy: false };
}

function mqttEncodeRemLen(len) {
  const out = [];
  do {
    let b = len % 128;
    len = Math.floor(len / 128);
    if (len > 0) b |= 0x80;
    out.push(b);
  } while (len > 0);
  return out;
}

function mqttEncodeStr(str) {
  const bytes = new TextEncoder().encode(str);
  return [(bytes.length >> 8) & 0xff, bytes.length & 0xff, ...bytes];
}

function mqttConnectPacket(clientId) {
  const vh = [...mqttEncodeStr('MQTT'), 4, 0x02, 0, 45];
  const pl = mqttEncodeStr(clientId);
  return new Uint8Array([0x10, ...mqttEncodeRemLen(vh.length + pl.length), ...vh, ...pl]);
}

function mqttSubscribePacket(pid, topic) {
  const vh = [(pid >> 8) & 0xff, pid & 0xff];
  const pl = [...mqttEncodeStr(topic), 0];
  return new Uint8Array([0x82, ...mqttEncodeRemLen(vh.length + pl.length), ...vh, ...pl]);
}

function mqttPublishPacket(topic, text) {
  const t = mqttEncodeStr(topic);
  const p = Array.from(new TextEncoder().encode(text));
  return new Uint8Array([0x30, ...mqttEncodeRemLen(t.length + p.length), ...t, ...p]);
}

class MqttSingleBroker {
  constructor(url, subTopic, pubTopic, { onReady, onMessage } = {}) {
    this.url = url;
    this.subTopic = subTopic;
    this.pubTopic = pubTopic;
    this.onReady = onReady;
    this.onMessage = onMessage;
    this.ws = null;
    this.ready = false;
    this.closed = false;
    this.pingTimer = null;
    this.retryTimer = null;
    this._decoder = new TextDecoder();
    this._connect();
  }

  _connect() {
    if (this.closed || typeof WebSocket === 'undefined') return;
    this.ready = false;
    let ws;
    try {
      ws = new WebSocket(this.url, 'mqtt');
      ws.binaryType = 'arraybuffer';
    } catch {
      this._scheduleRetry();
      return;
    }
    this.ws = ws;
    const clientId = `tt_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36).slice(-4)}`;

    ws.onopen = () => {
      if (this.closed || this.ws !== ws) return;
      try { ws.send(mqttConnectPacket(clientId)); } catch {}
    };

    ws.onmessage = (ev) => {
      if (this.closed || this.ws !== ws) return;
      const u8 = ev.data instanceof ArrayBuffer ? new Uint8Array(ev.data) : null;
      if (!u8 || u8.length < 2) return;
      let offset = 0;
      while (offset + 2 <= u8.length) {
        const header = u8[offset];
        const pktType = header >> 4;
        let mult = 1;
        let rem = 0;
        let idx = offset + 1;
        let lenDone = false;
        while (idx < u8.length) {
          const b = u8[idx++];
          rem += (b & 127) * mult;
          if ((b & 128) === 0) { lenDone = true; break; }
          mult *= 128;
        }
        if (!lenDone || idx + rem > u8.length) break;

        if (pktType === 2) {
          try { ws.send(mqttSubscribePacket(1, this.subTopic)); } catch {}
        } else if (pktType === 9 && !this.ready) {
          this.ready = true;
          this._startPing();
          this.onReady?.();
        } else if (pktType === 3) {
          const tLen = (u8[idx] << 8) | u8[idx + 1];
          const qos = (header >> 1) & 3;
          const pStart = idx + 2 + tLen + (qos > 0 ? 2 : 0);
          const pEnd = idx + rem;
          if (pStart <= pEnd) {
            try {
              const parsed = JSON.parse(this._decoder.decode(u8.subarray(pStart, pEnd)));
              this.onMessage?.(parsed);
            } catch {}
          }
        }
        offset = idx + rem;
      }
    };

    ws.onerror = () => {};
    ws.onclose = () => {
      this._stopPing();
      this.ready = false;
      if (!this.closed && this.ws === ws) this._scheduleRetry();
    };
  }

  _startPing() {
    this._stopPing();
    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        try { this.ws.send(new Uint8Array([0xc0, 0x00])); } catch {}
      }
    }, 20000);
  }

  _stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  _scheduleRetry() {
    if (this.closed) return;
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = setTimeout(() => this._connect(), 2500);
  }

  send(text) {
    if (!this.ready || this.ws?.readyState !== WebSocket.OPEN) return false;
    try { this.ws.send(mqttPublishPacket(this.pubTopic, text)); return true; } catch { return false; }
  }

  close() {
    this.closed = true;
    this.ready = false;
    this._stopPing();
    if (this.retryTimer) { clearTimeout(this.retryTimer); this.retryTimer = null; }
    try {
      if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(new Uint8Array([0xe0, 0x00]));
      this.ws?.close();
    } catch {}
    this.ws = null;
  }
}

class MqttWssRelay {
  constructor(subTopic, pubTopic, { onReady, onMessage } = {}) {
    this.ready = false;
    this._notified = false;
    this.brokers = getMqttBrokers().map((url) => new MqttSingleBroker(url, subTopic, pubTopic, {
      onReady: () => {
        this.ready = true;
        if (!this._notified) { this._notified = true; onReady?.(); }
      },
      onMessage,
    }));
  }
  send(packet) {
    const text = JSON.stringify(packet);
    let sent = false;
    for (const b of this.brokers) if (b.send(text)) sent = true;
    return sent;
  }
  close() {
    this.ready = false;
    for (const b of this.brokers) b.close();
    this.brokers = [];
  }
}

class NtfyHttpsRelay {
  constructor(subTopic, pubTopic, { onReady, onMessage } = {}) {
    this.subTopic = subTopic;
    this.pubTopic = pubTopic;
    this.onReady = onReady;
    this.onMessage = onMessage;
    this.ws = null;
    this.ready = false;
    this.closed = false;
    this.retryTimer = null;
    this.endpoints = getNtfyEndpoints();
    this._connect();
  }

  _connect() {
    if (this.closed || typeof WebSocket === 'undefined') return;
    this.ready = false;
    let ws;
    try {
      ws = new WebSocket(`${this.endpoints.wsBase}/${encodeURIComponent(this.subTopic)}/ws`);
    } catch {
      this._scheduleRetry();
      return;
    }
    this.ws = ws;
    ws.onopen = () => {
      if (this.closed || this.ws !== ws) return;
      this.ready = true;
      this.onReady?.();
    };
    ws.onmessage = (ev) => {
      if (this.closed || this.ws !== ws) return;
      try {
        const frame = JSON.parse(String(ev.data || ''));
        if (frame?.event === 'message' && typeof frame.message === 'string') {
          this.onMessage?.(JSON.parse(frame.message));
        }
      } catch {}
    };
    ws.onerror = () => {};
    ws.onclose = () => {
      this.ready = false;
      if (!this.closed && this.ws === ws) this._scheduleRetry();
    };
  }

  _scheduleRetry() {
    if (this.closed) return;
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = setTimeout(() => this._connect(), 2500);
  }

  send(packet) {
    if (this.closed || typeof fetch === 'undefined') return false;
    try {
      fetch(`${this.endpoints.httpBase}/${encodeURIComponent(this.pubTopic)}`, {
        method: 'POST',
        body: JSON.stringify(packet),
      }).catch(() => {});
      return true;
    } catch { return false; }
  }

  close() {
    this.closed = true;
    this.ready = false;
    if (this.retryTimer) { clearTimeout(this.retryTimer); this.retryTimer = null; }
    try { this.ws?.close(); } catch {}
    this.ws = null;
  }
}

class SameOriginHttpRelay {
  constructor(roomCode, subDir, pubDir, clientId, { onReady, onMessage } = {}) {
    this.roomCode = roomCode;
    this.subDir = subDir;
    this.pubDir = pubDir;
    this.clientId = clientId;
    this.onReady = onReady;
    this.onMessage = onMessage;
    this.ready = false;
    this.closed = false;
    this.afterSeq = 0;
    this.afterSnapSeq = 0;
    this.pollTimer = null;
    this.endpoints = typeof window !== 'undefined' && window.location?.origin?.startsWith('http')
      ? (isDiscordActivity()
        ? [`${window.location.origin}/api/mp`, `${window.location.origin}/.proxy/api/mp`]
        : [`${window.location.origin}/api/mp`])
      : [];
    this.endpointIdx = 0;
    this.endpoint = this.endpoints[0] || '';
    if (this.endpoint && typeof fetch !== 'undefined') this._poll();
  }

  async _poll() {
    if (this.closed || !this.endpoint) return;
    let nextDelay = 120;
    try {
      const url = `${this.endpoint}?room=${encodeURIComponent(this.roomCode)}&dir=${this.subDir}&after=${this.afterSeq}&afterSnap=${this.afterSnapSeq}&from=${encodeURIComponent(this.clientId)}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (this.closed) return;
      if (res.ok) {
        const data = await res.json();
        if (data?.ok) {
          if (!this.ready) { this.ready = true; this.onReady?.(); }
          if (typeof data.seq === 'number' && data.seq > this.afterSeq) this.afterSeq = data.seq;
          if (typeof data.snapSeq === 'number' && data.snapSeq > this.afterSnapSeq) this.afterSnapSeq = data.snapSeq;
          if (Array.isArray(data.msgs)) {
            for (const m of data.msgs) if (m?.packet) this.onMessage?.(m.packet);
          }
          if (data.snap?.packet) this.onMessage?.(data.snap.packet);
          nextDelay = data.snap ? 90 : 120;
        }
      } else if (!this.ready && this.endpoints.length > 1) {
        this.endpointIdx = (this.endpointIdx + 1) % this.endpoints.length;
        this.endpoint = this.endpoints[this.endpointIdx];
        nextDelay = 400;
      } else if (res.status === 404 && !this.ready) {
        this.close();
        return;
      } else {
        // Non-404 transient error backs off silently
        nextDelay = 8000;
      }
    } catch {
      nextDelay = 2000;
    }
    if (!this.closed) this.pollTimer = setTimeout(() => this._poll(), nextDelay);
  }

  send(packet) {
    if (this.closed || !this.endpoint || !this.ready || typeof fetch === 'undefined') return false;
    try {
      fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: this.roomCode, dir: this.pubDir, from: this.clientId, packet }),
      }).catch(() => {});
      return true;
    } catch { return false; }
  }

  close() {
    this.closed = true;
    this.ready = false;
    if (this.pollTimer) { clearTimeout(this.pollTimer); this.pollTimer = null; }
  }
}

export function normalizeRoomCode(raw) {
  const clean = String(raw || '').trim().toUpperCase().replace(/[^0-9A-Z]/g, '');
  if (!clean) return '';
  if (/^[0-9]{4}$/.test(clean)) return `TT${clean}`;
  return clean.slice(0, 6);
}

export function generateRoomCode() {
  return `TT${Math.floor(1000 + Math.random() * 9000)}`;
}

export class MultiplayerClient {
  constructor(callbacks = {}) {
    this.callbacks = callbacks;
    this.clientId = `tt_${Math.random().toString(36).slice(2, 10)}`;
    this.role = null; // 'host' | 'guest'
    this.roomCode = '';
    this.peer = null;
    this.conn = null;
    this.conns = new Map();
    this.bc = null;
    this.relay = null;
    this.ntfyRelay = null;
    this.apiRelay = null;
    this.connected = false;
    this.transport = '';
    this.statusNote = '';
    this.countdownTimer = null;
    this._joinRetryTimer = null;
    this._hostBeaconTimer = null;
    this._joinAttempts = 0;
    this._lastRelaySnapAt = 0;
    this._lastApiSnapAt = 0;
    this._lastNtfySnapAt = 0;
    this._seqOut = 0;
    this._seenSeq = new Set();

    this.lobby = {
      roomCode: '',
      mode: 0,
      levelIndex: 0,
      botCount: 2,
      targetLimit: 10,
      players: [], // up to 4: [{ clientId, name, character: 0|1, slot: 0..3, ready: bool, isHost: bool }]
      status: 'idle', // 'idle' | 'lobby' | 'countdown' | 'playing'
      countdown: 0,
    };
  }

  getMyPlayer() {
    return (this.lobby.players || []).find((p) => p.clientId === this.clientId) || null;
  }

  emitLobby() {
    this.callbacks.onLobbyUpdate?.({
      ...this.lobby,
      players: (this.lobby.players || []).map((p) => ({ ...p })),
      role: this.role,
      clientId: this.clientId,
      myCharacter: this.getMyPlayer()?.character ?? 0,
      connected: this.connected,
      transport: this.transport,
      statusNote: this.statusNote,
    });
  }

  sendRaw(msg) {
    const packet = { ...msg, _from: this.clientId, _role: this.role, _seq: ++this._seqOut };
    let sent = false;

    if (this.role === 'host' && this.conns.size > 0) {
      for (const c of this.conns.values()) {
        if (c?.open) {
          try { c.send(packet); sent = true; } catch {}
        }
      }
    } else if (this.conn?.open) {
      try { this.conn.send(packet); sent = true; } catch {}
    }

    // Local BroadcastChannel must never suppress network relays for cross-network WiFi/4G peers.
    if (this.bc) {
      try { this.bc.postMessage(packet); sent = true; } catch {}
    }

    if (this.relay?.ready) {
      if (msg.type === 'snap') {
        const now = Date.now();
        if (now - this._lastRelaySnapAt >= 75) {
          this._lastRelaySnapAt = now;
          if (this.relay.send(packet)) sent = true;
        }
      } else if (this.relay.send(packet)) {
        sent = true;
      }
    }

    if (this.apiRelay?.ready) {
      if (msg.type === 'snap') {
        const now = Date.now();
        if (now - this._lastApiSnapAt >= 90) {
          this._lastApiSnapAt = now;
          if (this.apiRelay.send(packet)) sent = true;
        }
      } else if (this.apiRelay.send(packet)) {
        sent = true;
      }
    }

    if (this.ntfyRelay && !this.ntfyRelay.closed) {
      if (msg.type === 'snap') {
        const now = Date.now();
        const minGap = (this.relay?.ready || this.apiRelay?.ready) ? 240 : 140;
        if (now - this._lastNtfySnapAt >= minGap) {
          this._lastNtfySnapAt = now;
          if (this.ntfyRelay.send(packet)) sent = true;
        }
      } else if (this.ntfyRelay.send(packet)) {
        sent = true;
      }
    }
    return sent;
  }

  _wireRelays(code, isHost, onPacketReady, onJoinBeacon) {
    const subDir = isHost ? 'c2h' : 'h2c';
    const pubDir = isHost ? 'h2c' : 'c2h';
    const inDiscord = isDiscordActivity();

    const acceptMsg = (msg, transportLabel) => {
      if (!msg || msg._from === this.clientId) return;
      if (!isHost && msg._role !== 'host') return;
      if (!isHost && msg.type === 'hostBeacon') {
        if (!this.connected) onJoinBeacon?.();
        return;
      }
      if (!this.connected) {
        this.connected = true;
        this.transport = this.transport === 'Local Tab' ? 'Local Tab' : transportLabel;
        this.statusNote = '';
        this._clearJoinRetry();
      }
      this.handleMessage(msg);
    };

    if (typeof BroadcastChannel !== 'undefined') {
      this.bc = new BroadcastChannel(`tt-mp-room-${code}`);
      this.bc.onmessage = (ev) => acceptMsg(ev.data, 'Local Tab');
    }

    const apiLabel = inDiscord ? 'Discord API' : 'Cloud API';
    this.apiRelay = new SameOriginHttpRelay(code, subDir, pubDir, this.clientId, {
      onReady: () => { this.transport = this.transport || apiLabel; onPacketReady?.(); },
      onMessage: (msg) => acceptMsg(msg, apiLabel),
    });

    const ntfyLabel = inDiscord ? 'Discord Proxy' : 'Cloud HTTPS';
    this.ntfyRelay = new NtfyHttpsRelay(`tt_v1_${code}_${subDir}`, `tt_v1_${code}_${pubDir}`, {
      onReady: () => { this.transport = this.transport || ntfyLabel; onPacketReady?.(); },
      onMessage: (msg) => acceptMsg(msg, ntfyLabel),
    });

    const mqttLabel = inDiscord ? 'Discord WSS' : 'Cloud WSS';
    this.relay = new MqttWssRelay(`bltts/mp/v2/${code}/${subDir}`, `bltts/mp/v2/${code}/${pubDir}`, {
      onReady: () => {
        if (!this.transport || this.transport === ntfyLabel) this.transport = mqttLabel;
        onPacketReady?.();
      },
      onMessage: (msg) => acceptMsg(msg, mqttLabel),
    });

    if (!inDiscord && typeof window !== 'undefined' && window.Peer) {
      try {
        if (isHost) {
          this.peer = new window.Peer(`tt-v1-room-${code}`, PEER_CONFIG);
          this.peer.on('open', () => { this.transport = this.transport || 'WebRTC P2P'; this.emitLobby(); });
          this.peer.on('connection', (conn) => {
            this.conns.set(conn.peer, conn);
            conn.on('open', () => {
              this.connected = true;
              this.transport = 'WebRTC P2P';
              this.sendRaw({ type: 'lobbySync', lobby: this.lobby });
              this.emitLobby();
            });
            conn.on('data', (msg) => this.handleMessage(msg));
            conn.on('close', () => { this.conns.delete(conn.peer); this.handlePeerDisconnect(); });
          });
        } else {
          this.peer = new window.Peer(undefined, PEER_CONFIG);
          this.peer.on('open', () => {
            const conn = this.peer.connect(`tt-v1-room-${code}`, { reliable: true, serialization: 'json' });
            this.conn = conn;
            conn.on('open', () => {
              this.connected = true;
              this.transport = 'WebRTC P2P';
              this.statusNote = '';
              this._clearJoinRetry();
              onJoinBeacon?.();
              this.emitLobby();
            });
            conn.on('data', (msg) => this.handleMessage(msg));
            conn.on('close', () => this.handlePeerDisconnect());
          });
        }
      } catch {}
    }
  }

  _clearJoinRetry() {
    if (this._joinRetryTimer) { clearInterval(this._joinRetryTimer); this._joinRetryTimer = null; }
  }

  _clearHostBeacon() {
    if (this._hostBeaconTimer) { clearInterval(this._hostBeaconTimer); this._hostBeaconTimer = null; }
  }

  createRoom(hostName = 'Player 1', config = {}) {
    this.leaveRoom();
    const code = generateRoomCode();
    const cleanName = String(hostName || '').trim().slice(0, 12) || 'Player 1';
    const mode = Math.max(0, Math.min(4, config.mode ?? 0));
    let levelIndex = Math.max(0, Math.min(10, config.levelIndex ?? 0));
    if (mode === 3 && levelIndex > 4) levelIndex = 0;

    this.role = 'host';
    this.roomCode = code;
    this.statusNote = '';
    this.lobby = {
      roomCode: code,
      mode,
      levelIndex,
      botCount: Math.max(0, Math.min(6, config.botCount ?? 2)),
      targetLimit: Math.max(1, Math.min(50, config.targetLimit ?? (mode === 3 ? 5 : 10))),
      players: [{ clientId: this.clientId, name: cleanName, character: config.character === 1 ? 1 : 0, slot: 0, ready: false, isHost: true }],
      status: 'lobby',
      countdown: 0,
    };

    this._wireRelays(code, true, () => {
      this.sendRaw({ type: 'hostBeacon', roomCode: code });
      if (this.connected) this.sendRaw({ type: 'lobbySync', lobby: this.lobby });
      this.emitLobby();
    });

    this._clearHostBeacon();
    this._hostBeaconTimer = setInterval(() => {
      if (this.role !== 'host' || this.lobby.status !== 'lobby') return;
      this.sendRaw({ type: 'hostBeacon', roomCode: code });
    }, 1800);

    this.emitLobby();
    return code;
  }

  joinRoom(codeInput, guestName = 'Player 2', character = 1) {
    this.leaveRoom();
    const cleanCode = normalizeRoomCode(codeInput);
    if (!cleanCode) return false;
    const cleanName = String(guestName || '').trim().slice(0, 12) || 'Player 2';

    this.role = 'guest';
    this.roomCode = cleanCode;
    this.statusNote = `#${cleanCode}...`;
    this._joinAttempts = 0;
    this.lobby = {
      roomCode: cleanCode,
      mode: 0,
      levelIndex: 0,
      botCount: 2,
      targetLimit: 10,
      players: [],
      status: 'lobby',
      countdown: 0,
    };

    const announceJoin = () => {
      if (this.role !== 'guest' || this.connected) return;
      this.sendRaw({ type: 'guestJoin', clientId: this.clientId, guestName: cleanName, character, ready: false });
    };

    this._wireRelays(cleanCode, false, announceJoin, announceJoin);
    setTimeout(announceJoin, 50);

    this._clearJoinRetry();
    this._joinRetryTimer = setInterval(() => {
      if (this.connected || this.role !== 'guest') { this._clearJoinRetry(); return; }
      this._joinAttempts += 1;
      announceJoin();
      if (this._joinAttempts >= 12) {
        this.statusNote = `#${cleanCode} timeout`;
        this.emitLobby();
      }
    }, 900);

    this.emitLobby();
    return true;
  }

  handlePeerDisconnect(force = false) {
    if (!force && ((this.bc && this.transport === 'Local Tab') || this.apiRelay?.ready || this.relay?.ready || this.ntfyRelay?.ready)) return;
    if (this.role === 'host') {
      this.connected = false;
      this.cancelCountdown();
      this.emitLobby();
      this.callbacks.onDisconnect?.('peer_left');
    } else {
      this.connected = false;
      this.emitLobby();
      this.callbacks.onDisconnect?.('host_lost');
    }
  }

  setReady(ready) {
    const val = Boolean(ready);
    const me = this.getMyPlayer();
    if (me) me.ready = val;
    if (this.role === 'host') {
      if (!val) this.cancelCountdown();
      this.sendRaw({ type: 'lobbySync', lobby: this.lobby });
      this.emitLobby();
      this.checkStartCountdown();
    } else if (this.role === 'guest') {
      this.sendRaw({ type: 'guestReady', clientId: this.clientId, ready: val });
      this.emitLobby();
    }
  }

  selectCharacter(charId) {
    const want = charId === 1 ? 1 : 0;
    if (this.lobby.status === 'playing' || this.lobby.status === 'countdown') return false;
    if (this.role === 'host') {
      const me = this.getMyPlayer();
      if (!me) return false;
      me.character = want;
      me.ready = false;
      this.cancelCountdown();
      this.sendRaw({ type: 'lobbySync', lobby: this.lobby });
      this.emitLobby();
      return true;
    }
    if (this.role === 'guest') {
      const me = this.getMyPlayer();
      if (me) { me.character = want; me.ready = false; }
      this.sendRaw({ type: 'selectCharacter', clientId: this.clientId, character: want });
      this.emitLobby();
      return true;
    }
    return false;
  }

  updateConfig(patch = {}) {
    if (this.role !== 'host' || this.lobby.status === 'playing') return;
    if (typeof patch.mode === 'number') {
      this.lobby.mode = Math.max(0, Math.min(4, patch.mode | 0));
      if (this.lobby.mode === 3 && this.lobby.levelIndex > 4) this.lobby.levelIndex = 0;
    }
    if (typeof patch.levelIndex === 'number') {
      const maxLvl = this.lobby.mode === 3 ? 4 : 10;
      this.lobby.levelIndex = Math.max(0, Math.min(maxLvl, patch.levelIndex | 0));
    }
    if (typeof patch.botCount === 'number') {
      this.lobby.botCount = Math.max(0, Math.min(6, patch.botCount | 0));
    }
    if (typeof patch.targetLimit === 'number') {
      this.lobby.targetLimit = Math.max(1, Math.min(50, patch.targetLimit | 0));
    }
    for (const p of this.lobby.players || []) p.ready = false;
    this.cancelCountdown();
    this.sendRaw({ type: 'lobbySync', lobby: this.lobby });
    this.emitLobby();
  }

  cancelCountdown() {
    if (this.countdownTimer) { clearInterval(this.countdownTimer); this.countdownTimer = null; }
    if (this.lobby.status === 'countdown') { this.lobby.status = 'lobby'; this.lobby.countdown = 0; }
  }

  checkStartCountdown() {
    if (this.role !== 'host') return;
    const list = this.lobby.players || [];
    const allReady = list.length >= 2 && list.every((p) => p.ready);
    if (allReady && this.lobby.status === 'lobby') {
      this.lobby.status = 'countdown';
      this.lobby.countdown = 3;
      this.sendRaw({ type: 'lobbySync', lobby: this.lobby });
      this.emitLobby();
      this.countdownTimer = setInterval(() => {
        const curList = this.lobby.players || [];
        if (curList.length < 2 || !curList.every((p) => p.ready)) {
          this.cancelCountdown();
          this.sendRaw({ type: 'lobbySync', lobby: this.lobby });
          this.emitLobby();
          return;
        }
        this.lobby.countdown -= 1;
        if (this.lobby.countdown <= 0) {
          clearInterval(this.countdownTimer);
          this.countdownTimer = null;
          this.lobby.status = 'playing';
          const launchConfig = {
            mode: this.lobby.mode,
            levelIndex: this.lobby.levelIndex,
            botCount: this.lobby.botCount,
            targetLimit: this.lobby.targetLimit,
            players: curList.map((p) => ({ ...p })),
          };
          this.sendRaw({ type: 'startMatch', config: launchConfig, lobby: this.lobby });
          this.emitLobby();
          this.callbacks.onStartMatch?.(launchConfig);
        } else {
          this.sendRaw({ type: 'lobbySync', lobby: this.lobby });
          this.emitLobby();
        }
      }, 650);
    }
  }

  sendInput(inputState) {
    if (this.role !== 'guest') return;
    this.sendRaw({ type: 'input', clientId: this.clientId, input: inputState });
  }

  sendSnapshot(snapshot) {
    if (this.role !== 'host' || !this.connected) return;
    this.sendRaw({ type: 'snap', snap: snapshot });
  }

  returnToLobby() {
    this.cancelCountdown();
    this.lobby.status = 'lobby';
    for (const p of this.lobby.players || []) p.ready = false;
    if (this.role === 'host') this.sendRaw({ type: 'returnLobby', lobby: this.lobby });
    this.emitLobby();
  }

  handleMessage(msg) {
    if (!msg?.type) return;
    if (msg._seq && msg._from) {
      const key = `${msg._from}:${msg._seq}`;
      if (this._seenSeq.has(key)) return;
      this._seenSeq.add(key);
      if (this._seenSeq.size > 600) this._seenSeq.clear();
    }

    if (this.role === 'host') {
      const cid = msg.clientId || msg._from || 'guest';
      const list = this.lobby.players || [];
      if (msg.type === 'guestJoin') {
        this.connected = true;
        let player = list.find((p) => p.clientId === cid);
        if (!player) {
          if (list.length >= 4) {
            this.sendRaw({ type: 'roomFull', targetClientId: cid });
            return;
          }
          const usedSlots = new Set(list.map((p) => p.slot));
          const slot = [0, 1, 2, 3].find((s) => !usedSlots.has(s)) ?? list.length;
          player = {
            clientId: cid,
            name: String(msg.guestName || `P${slot + 1}`).slice(0, 12),
            character: msg.character === 1 ? 1 : (slot % 2),
            slot,
            ready: Boolean(msg.ready),
            isHost: false,
          };
          list.push(player);
        } else {
          if (msg.guestName) player.name = String(msg.guestName).slice(0, 12);
          if (msg.ready) player.ready = true;
        }
        this.sendRaw({ type: 'lobbySync', lobby: this.lobby });
        this.emitLobby();
        this.checkStartCountdown();
      } else if (msg.type === 'selectCharacter') {
        const player = list.find((p) => p.clientId === cid);
        if (player) {
          player.character = msg.character === 1 ? 1 : 0;
          player.ready = false;
          this.cancelCountdown();
          this.sendRaw({ type: 'lobbySync', lobby: this.lobby });
          this.emitLobby();
        }
      } else if (msg.type === 'guestReady') {
        const player = list.find((p) => p.clientId === cid);
        if (player) {
          player.ready = Boolean(msg.ready);
          if (!player.ready) this.cancelCountdown();
          this.sendRaw({ type: 'lobbySync', lobby: this.lobby });
          this.emitLobby();
          this.checkStartCountdown();
        }
      } else if (msg.type === 'input' && msg.input) {
        this.callbacks.onGuestInput?.(cid, msg.input);
      } else if (msg.type === 'peerLeave') {
        const idx = list.findIndex((p) => p.clientId === cid && !p.isHost);
        if (idx >= 0) {
          const left = list.splice(idx, 1)[0];
          this.cancelCountdown();
          if (list.length <= 1) this.connected = false;
          this.sendRaw({ type: 'lobbySync', lobby: this.lobby });
          this.emitLobby();
          this.callbacks.onGuestLeave?.(cid, left.name);
        }
      }
      return;
    }

    if (this.role === 'guest') {
      if (msg.type === 'roomFull' && msg.targetClientId === this.clientId) {
        this.statusNote = 'FULL (4/4)';
        this._clearJoinRetry();
        this.emitLobby();
      } else if (msg.type === 'lobbySync' && msg.lobby) {
        this.connected = true;
        this.statusNote = '';
        this._clearJoinRetry();
        this.lobby = { ...this.lobby, ...msg.lobby };
        this.emitLobby();
      } else if (msg.type === 'startMatch' && msg.config) {
        if (this.lobby.status === 'playing') return;
        this.lobby = { ...this.lobby, ...(msg.lobby || {}), status: 'playing' };
        this.emitLobby();
        this.callbacks.onStartMatch?.(msg.config);
      } else if (msg.type === 'snap' && msg.snap) {
        this.callbacks.onSnapshot?.(msg.snap);
      } else if (msg.type === 'returnLobby' && msg.lobby) {
        this.lobby = { ...this.lobby, ...msg.lobby, status: 'lobby' };
        this.emitLobby();
        this.callbacks.onReturnLobby?.();
      } else if (msg.type === 'peerLeave' && msg._role === 'host') {
        this.handlePeerDisconnect(true);
      }
    }
  }

  leaveRoom() {
    if (this.role && this.connected) {
      try { this.sendRaw({ type: 'peerLeave', clientId: this.clientId }); } catch {}
    }
    this.cancelCountdown();
    this._clearJoinRetry();
    this._clearHostBeacon();
    for (const c of this.conns.values()) { try { c?.close(); } catch {} }
    this.conns.clear();
    try { this.conn?.close(); } catch {}
    try { this.peer?.destroy(); } catch {}
    try { this.relay?.close(); } catch {}
    try { this.ntfyRelay?.close(); } catch {}
    try { this.apiRelay?.close(); } catch {}
    try { this.bc?.close(); } catch {}
    this.conn = null;
    this.peer = null;
    this.relay = null;
    this.ntfyRelay = null;
    this.apiRelay = null;
    this.bc = null;
    this.connected = false;
    this.role = null;
    this.roomCode = '';
    this.transport = '';
    this.statusNote = '';
    this.lobby.status = 'idle';
    this.lobby.players = [];
  }
}
