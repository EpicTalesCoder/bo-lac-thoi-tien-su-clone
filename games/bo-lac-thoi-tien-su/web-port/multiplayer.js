/**
 * 1v1 Real-Time Multiplayer Room & Sync Engine for Prehistoric Tribes
 * Triple Transport (100% cross-network reliable):
 *  1) Cloud WebSocket Relay (MQTT-over-WSS via TLS port 443: works across ANY 2 networks, 4G/5G CGNAT & firewalls!)
 *  2) PeerJS WebRTC P2P DataChannel (low-latency direct P2P when NAT allows)
 *  3) BroadcastChannel (instant <5ms connection for 2 browser tabs on the same machine / offline)
 */

const PEER_CONFIG = {
  debug: 0,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
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
    const origin = window.location.origin;
    const host = window.location.host;
    return {
      httpBase: `${origin}/ntfy`,
      wsBase: `wss://${host}/ntfy`,
      discordProxy: true,
    };
  }
  return {
    httpBase: 'https://ntfy.sh',
    wsBase: 'wss://ntfy.sh',
    discordProxy: false,
  };
}

const ROOM_PEER_PREFIX = 'bltts-v2-room-';

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
    const clientId = `bltts_${Math.random().toString(36).slice(2, 12)}_${Date.now().toString(36).slice(-4)}`;

    ws.onopen = () => {
      if (this.closed || this.ws !== ws) return;
      try {
        ws.send(mqttConnectPacket(clientId));
      } catch {}
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
          if ((b & 128) === 0) {
            lenDone = true;
            break;
          }
          mult *= 128;
        }
        if (!lenDone || idx + rem > u8.length) break;

        if (pktType === 2) {
          try {
            ws.send(mqttSubscribePacket(1, this.subTopic));
          } catch {}
        } else if (pktType === 9) {
          if (!this.ready) {
            this.ready = true;
            this._startPing();
            this.onReady?.();
          }
        } else if (pktType === 3) {
          const tLen = (u8[idx] << 8) | u8[idx + 1];
          const qos = (header >> 1) & 3;
          const pStart = idx + 2 + tLen + (qos > 0 ? 2 : 0);
          const pEnd = idx + rem;
          if (pStart <= pEnd) {
            const text = this._decoder.decode(u8.subarray(pStart, pEnd));
            try {
              const parsed = JSON.parse(text);
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
      if (!this.closed && this.ws === ws) {
        this._scheduleRetry();
      }
    };
  }

  _startPing() {
    this._stopPing();
    this.pingTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(new Uint8Array([0xc0, 0x00]));
        } catch {}
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
    if (!this.ready || !this.ws || this.ws.readyState !== WebSocket.OPEN) return false;
    try {
      this.ws.send(mqttPublishPacket(this.pubTopic, text));
      return true;
    } catch {
      return false;
    }
  }

  close() {
    this.closed = true;
    this.ready = false;
    this._stopPing();
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    try {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(new Uint8Array([0xe0, 0x00]));
      }
      this.ws?.close();
    } catch {}
    this.ws = null;
  }
}

// Connects to ALL MQTT-WSS brokers simultaneously (or Discord URL Mappings /emqx & /hivemq inside Discord Activity!)
class MqttWssRelay {
  constructor(subTopic, pubTopic, { onReady, onMessage } = {}) {
    this.ready = false;
    this._notifiedReady = false;
    const urls = getMqttBrokers();
    this.brokers = urls.map(
      (url) =>
        new MqttSingleBroker(url, subTopic, pubTopic, {
          onReady: () => {
            this.ready = true;
            if (!this._notifiedReady) {
              this._notifiedReady = true;
              onReady?.();
            }
          },
          onMessage,
        })
    );
  }

  send(packet) {
    const text = JSON.stringify(packet);
    let sent = false;
    for (const b of this.brokers) {
      if (b.send(text)) sent = true;
    }
    return sent;
  }

  close() {
    this.ready = false;
    for (const b of this.brokers) b.close();
    this.brokers = [];
  }
}

// Pure Port-443 HTTPS/WSS Relay (works on 100% of mobile 4G/5G, office/school Wi-Fi, AND Discord Activity via /.proxy/ntfy!)
class NtfyHttpsRelay {
  constructor(subTopic, pubTopic, { onReady, onMessage, onError } = {}) {
    this.subTopic = subTopic;
    this.pubTopic = pubTopic;
    this.onReady = onReady;
    this.onMessage = onMessage;
    this.onError = onError;
    this.ws = null;
    this.ready = false;
    this.everOpened = false;
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
      this.everOpened = true;
      this.onReady?.();
    };
    ws.onmessage = (ev) => {
      if (this.closed || this.ws !== ws) return;
      try {
        const frame = JSON.parse(String(ev.data || ''));
        if (frame?.event === 'message' && typeof frame.message === 'string') {
          const parsed = JSON.parse(frame.message);
          this.onMessage?.(parsed);
        }
      } catch {}
    };
    ws.onerror = () => {};
    ws.onclose = () => {
      this.ready = false;
      if (!this.everOpened && this.endpoints.discordProxy) {
        this.onError?.('⚠ Trong Discord Activity: hãy thêm URL Mapping "/emqx" → "broker.emqx.io:8084" trong Discord Developer Portal (Activities → URL Mappings).');
      }
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
    } catch {
      return false;
    }
  }

  close() {
    this.closed = true;
    this.ready = false;
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    try {
      this.ws?.close();
    } catch {}
    this.ws = null;
  }
}

// 100% Same-Origin HTTPS Relay via /api/mp on our own Vercel deployment!
// Works inside Discord Activity (through the "/" root mapping — ZERO extra URL Mappings, ZERO CSP issues!)
// AND across any web/mobile browser on any 4G/5G firewall!
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
    this.endpoints =
      typeof window !== 'undefined' && window.location?.origin?.startsWith('http')
        ? isDiscordActivity()
          ? [`${window.location.origin}/api/mp`, `${window.location.origin}/.proxy/api/mp`]
          : [`${window.location.origin}/api/mp`]
        : [];
    this.endpointIdx = 0;
    this.endpoint = this.endpoints[0] || '';
    if (this.endpoint && typeof fetch !== 'undefined') {
      this._poll();
    }
  }

  async _poll() {
    if (this.closed || !this.endpoint) return;
    let nextDelay = 240;
    try {
      const url = `${this.endpoint}?room=${encodeURIComponent(this.roomCode)}&dir=${this.subDir}&after=${this.afterSeq}&afterSnap=${this.afterSnapSeq}&from=${encodeURIComponent(this.clientId)}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (this.closed) return;
      if (res.ok) {
        const data = await res.json();
        if (data?.ok) {
          if (!this.ready) {
            this.ready = true;
            this.onReady?.();
          }
          if (typeof data.seq === 'number' && data.seq > this.afterSeq) {
            this.afterSeq = data.seq;
          }
          if (typeof data.snapSeq === 'number' && data.snapSeq > this.afterSnapSeq) {
            this.afterSnapSeq = data.snapSeq;
          }
          if (Array.isArray(data.msgs)) {
            for (const m of data.msgs) {
              if (m?.packet) this.onMessage?.(m.packet);
            }
          }
          if (data.snap?.packet) {
            this.onMessage?.(data.snap.packet);
          }
          nextDelay = data.snap ? 150 : 210;
        }
      } else {
        if (!this.ready && (res.status === 404 || res.status === 405 || res.status === 501)) {
          this._deadEndpoints = (this._deadEndpoints || 0) + 1;
          if (this._deadEndpoints >= this.endpoints.length) {
            this.close();
            return;
          }
        }
        if (!this.ready && this.endpoints.length > 1) {
          this.endpointIdx = (this.endpointIdx + 1) % this.endpoints.length;
          this.endpoint = this.endpoints[this.endpointIdx];
          nextDelay = 400;
        } else {
          nextDelay = 5000;
        }
      }
    } catch {
      nextDelay = 1200;
    }
    if (!this.closed) {
      this.pollTimer = setTimeout(() => this._poll(), nextDelay);
    }
  }

  send(packet) {
    if (this.closed || !this.endpoint || !this.ready || typeof fetch === 'undefined') return false;
    try {
      fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room: this.roomCode,
          dir: this.pubDir,
          from: this.clientId,
          packet,
        }),
      }).catch(() => {});
      return true;
    } catch {
      return false;
    }
  }

  close() {
    this.closed = true;
    this.ready = false;
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
  }
}

export function generateRoomCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export class MultiplayerClient {
  constructor(callbacks = {}) {
    this.callbacks = callbacks;
    this.clientId = `p_${Math.random().toString(36).slice(2, 10)}`;
    this.role = null; // 'host' | 'guest'
    this.roomCode = '';
    this.peer = null;
    this.conn = null;
    this.conns = new Map(); // host: peerId -> DataConnection (supports up to 3 guests!)
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
    this._lastNtfySnapAt = 0;
    this._lastApiSnapAt = 0;
    this._seqOut = 0;
    this._seenSeq = new Set();

    this.lobby = {
      roomCode: '',
      mapIdx: 1,
      hostName: 'Tù trưởng Xanh',
      guestName: '',
      hostReady: false,
      guestReady: false,
      guestJoined: false,
      players: [], // up to 4: [{ clientId, name, tribe: 0..3, ready: boolean, isHost: boolean }]
      status: 'idle', // 'idle' | 'lobby' | 'countdown' | 'playing'
      countdown: 0,
    };
  }

  getMyPlayer() {
    return (this.lobby.players || []).find((p) => p.clientId === this.clientId) || null;
  }

  getMyTribe() {
    const me = this.getMyPlayer();
    if (me) return me.tribe;
    return this.role === 'host' ? 0 : 1;
  }

  _syncLegacyLobbyFields() {
    const list = this.lobby.players || [];
    const hostP = list.find((p) => p.isHost) || list[0];
    const guestP = list.find((p) => !p.isHost);
    this.lobby.hostName = hostP?.name || this.lobby.hostName || 'Tù trưởng Xanh';
    this.lobby.hostReady = Boolean(hostP?.ready);
    this.lobby.guestJoined = list.length >= 2;
    this.lobby.guestName = guestP?.name || '';
    this.lobby.guestReady = Boolean(guestP?.ready);
  }

  emitLobby() {
    this._syncLegacyLobbyFields();
    this.callbacks.onLobbyUpdate?.({
      ...this.lobby,
      players: (this.lobby.players || []).map((p) => ({ ...p })),
      role: this.role,
      clientId: this.clientId,
      myTribe: this.getMyTribe(),
      connected: this.connected,
      transport: this.transport,
      statusNote: this.statusNote,
    });
  }

  sendRaw(msg) {
    const packet = { ...msg, _from: this.clientId, _role: this.role, _seq: ++this._seqOut };
    let sent = false;
    let fastTransportSent = false;
    if (this.role === 'host' && this.conns.size > 0) {
      for (const c of this.conns.values()) {
        if (c && c.open) {
          try {
            c.send(packet);
            sent = true;
            fastTransportSent = true;
          } catch {}
        }
      }
    } else if (this.conn && this.conn.open) {
      try {
        this.conn.send(packet);
        sent = true;
        fastTransportSent = true;
      } catch {}
    }
    if (this.relay && this.relay.ready) {
      if (msg.type === 'snap') {
        const now = Date.now();
        if (now - this._lastRelaySnapAt >= 95) {
          this._lastRelaySnapAt = now;
          if (this.relay.send(packet)) {
            sent = true;
            fastTransportSent = true;
          }
        } else {
          fastTransportSent = true;
        }
      } else if (this.relay.send(packet)) {
        sent = true;
      }
    }
    if (this.apiRelay && this.apiRelay.ready) {
      if (msg.type === 'snap') {
        if (!fastTransportSent) {
          const now = Date.now();
          if (now - this._lastApiSnapAt >= 165) {
            this._lastApiSnapAt = now;
            if (this.apiRelay.send(packet)) sent = true;
          }
        }
      } else if (this.apiRelay.send(packet)) {
        sent = true;
      }
    }
    if (this.ntfyRelay && !this.ntfyRelay.closed) {
      if (msg.type === 'snap') {
        // Use Port-443 HTTPS relay (or Discord /.proxy/ntfy) for game snapshots whenever MQTT/WebRTC are unavailable!
        if (!fastTransportSent) {
          const now = Date.now();
          const minGap = this.ntfyRelay.endpoints?.discordProxy ? 150 : 240;
          if (now - this._lastNtfySnapAt >= minGap) {
            this._lastNtfySnapAt = now;
            if (this.ntfyRelay.send(packet)) sent = true;
          }
        }
      } else if (this.ntfyRelay.send(packet)) {
        sent = true;
      }
    }
    if (this.bc) {
      try {
        this.bc.postMessage(packet);
        sent = true;
      } catch {}
    }
    return sent;
  }

  _clearJoinRetry() {
    if (this._joinRetryTimer) {
      clearInterval(this._joinRetryTimer);
      this._joinRetryTimer = null;
    }
  }

  _clearHostBeacon() {
    if (this._hostBeaconTimer) {
      clearInterval(this._hostBeaconTimer);
      this._hostBeaconTimer = null;
    }
  }

  createRoom(hostName = 'Tù trưởng Xanh', mapIdx = 1) {
    this.leaveRoom();
    const code = generateRoomCode();
    const cleanName = hostName.trim() || 'Tù trưởng Xanh';
    this.role = 'host';
    this.roomCode = code;
    this.statusNote = 'Đang mở phòng trên máy chủ đám mây...';
    this.lobby = {
      roomCode: code,
      mapIdx,
      hostName: cleanName,
      guestName: '',
      hostReady: false,
      guestReady: false,
      guestJoined: false,
      players: [{ clientId: this.clientId, name: cleanName, tribe: 0, ready: false, isHost: true }],
      status: 'lobby',
      countdown: 0,
    };

    // 1) BroadcastChannel for instant local multi-tab play (up to 4 tabs!)
    if (typeof BroadcastChannel !== 'undefined') {
      this.bc = new BroadcastChannel(`pt-mp-room-${code}`);
      this.statusNote = `Phòng #${code} đã mở! Nhấn "🪟 Mở Tab 2" hoặc gửi mã phòng cho người chơi khác.`;
      this.bc.onmessage = (ev) => {
        const msg = ev.data;
        if (!msg || msg._from === this.clientId) return;
        if (!this.connected) {
          this.connected = true;
          this.transport = 'Local Tab';
        }
        this.handleMessage(msg);
      };
    }

    const inDiscord = isDiscordActivity();
    const apiLabel = inDiscord ? 'Discord API v2.6' : 'Cloud API v2.6';
    const ntfyLabel = inDiscord ? 'Discord Proxy' : 'Cloud HTTPS';

    // 1b) Same-Origin /api/mp Serverless Relay (100% same-origin: works inside Discord Activity with ZERO extra URL Mappings!)
    this.apiRelay = new SameOriginHttpRelay(code, 'c2h', 'h2c', this.clientId, {
      onReady: () => {
        this.transport = this.transport || apiLabel;
        this.statusNote = '';
        this.sendRaw({ type: 'hostBeacon', roomCode: code });
        if (this.connected) {
          this.sendRaw({ type: 'lobbySync', lobby: this.lobby });
        }
        this.emitLobby();
      },
      onMessage: (msg) => {
        if (!msg || msg._from === this.clientId) return;
        if (!this.connected) {
          this.connected = true;
          this.transport = this.transport === 'Local Tab' ? 'Local Tab' : apiLabel;
        }
        this.handleMessage(msg);
      },
    });

    // 2) Port-443 HTTPS/WSS Relay (passes 100% of mobile 4G/5G CGNAT, firewalls, AND Discord Activity via /.proxy/ntfy!)
    this.ntfyRelay = new NtfyHttpsRelay(
      `bltts_v2_${code}_c2h`,
      `bltts_v2_${code}_h2c`,
      {
        onReady: () => {
          this.transport = this.transport || ntfyLabel;
          this.statusNote = '';
          this.sendRaw({ type: 'hostBeacon', roomCode: code });
          if (this.connected) {
            this.sendRaw({ type: 'lobbySync', lobby: this.lobby });
          }
          this.emitLobby();
        },
        onMessage: (msg) => {
          if (!msg || msg._from === this.clientId) return;
          if (!this.connected) {
            this.connected = true;
            this.transport = this.transport === 'Local Tab' ? 'Local Tab' : ntfyLabel;
          }
          this.handleMessage(msg);
        },
        onError: (txt) => {
          if (!this.connected && !this.relay?.ready && !this.apiRelay?.ready) {
            this.statusNote = txt;
            this.emitLobby();
          }
        },
      }
    );

    // 3) Dual MQTT-WSS Relay (uses /emqx & /hivemq Discord URL Mappings when inside Discord Activity!)
    const mqttLabel = inDiscord ? 'Discord WSS' : 'Cloud WSS';
    this.relay = new MqttWssRelay(
      `bltts/mp/v2/${code}/c2h`,
      `bltts/mp/v2/${code}/h2c`,
      {
        onReady: () => {
          this.transport = this.transport && this.transport !== ntfyLabel ? this.transport : mqttLabel;
          this.statusNote = '';
          this.sendRaw({ type: 'hostBeacon', roomCode: code });
          if (this.connected) {
            this.sendRaw({ type: 'lobbySync', lobby: this.lobby });
          }
          this.emitLobby();
        },
        onMessage: (msg) => {
          if (!msg || msg._from === this.clientId) return;
          if (!this.connected) {
            this.connected = true;
            this.transport = this.transport === 'Local Tab' ? 'Local Tab' : mqttLabel;
          }
          this.handleMessage(msg);
        },
      }
    );

    // Periodic host beacon while waiting in lobby so joining guests discover the room immediately
    this._clearHostBeacon();
    this._hostBeaconTimer = setInterval(() => {
      if (this.role !== 'host' || this.lobby.status !== 'lobby') return;
      this.sendRaw({ type: 'hostBeacon', roomCode: code });
    }, 2200);

    // 4) PeerJS WebRTC P2P (optional direct acceleration outside Discord Activity)
    if (!inDiscord && typeof window !== 'undefined' && window.Peer) {
      try {
        this.peer = new window.Peer(`${ROOM_PEER_PREFIX}${code}`, PEER_CONFIG);
        this.peer.on('open', () => {
          this.transport = this.transport || 'WebRTC P2P';
          this.emitLobby();
        });
        this.peer.on('connection', (conn) => {
          this.conns.set(conn.peer, conn);
          this.conn = conn;
          conn.on('open', () => {
            this.connected = true;
            this.transport = 'WebRTC P2P';
            this.sendRaw({ type: 'lobbySync', lobby: this.lobby });
            this.emitLobby();
          });
          conn.on('data', (msg) => this.handleMessage(msg));
          conn.on('close', () => {
            this.conns.delete(conn.peer);
            this.handlePeerDisconnect();
          });
        });
        this.peer.on('error', () => {
          this.emitLobby();
        });
      } catch {}
    }

    this.emitLobby();
    return code;
  }

  joinRoom(code, guestName = 'Tù trưởng Đỏ') {
    this.leaveRoom();
    const cleanCode = String(code || '').replace(/[^0-9A-Za-z]/g, '').slice(0, 6);
    if (!cleanCode) return false;
    const cleanName = guestName.trim() || 'Tù trưởng Đỏ';
    this.role = 'guest';
    this.roomCode = cleanCode;
    this.statusNote = `Đang tìm phòng #${cleanCode} qua mạng...`;
    this._joinAttempts = 0;
    this.lobby = {
      roomCode: cleanCode,
      mapIdx: 1,
      hostName: 'Đang kết nối...',
      guestName: cleanName,
      hostReady: false,
      guestReady: false,
      guestJoined: false,
      players: [],
      status: 'lobby',
      countdown: 0,
    };

    const announceJoin = () => {
      if (this.role !== 'guest' || this.connected) return;
      this.sendRaw({
        type: 'guestJoin',
        clientId: this.clientId,
        guestName: cleanName,
        ready: false,
      });
    };

    // 1) BroadcastChannel for instant local multi-tab join
    if (typeof BroadcastChannel !== 'undefined') {
      this.bc = new BroadcastChannel(`pt-mp-room-${cleanCode}`);
      this.bc.onmessage = (ev) => {
        const msg = ev.data;
        if (!msg || msg._from === this.clientId) return;
        if (msg._role !== 'host') return;
        if (!this.connected) {
          this.connected = true;
          this.transport = 'Local Tab';
          this.statusNote = '';
          this._clearJoinRetry();
        }
        this.handleMessage(msg);
      };
      setTimeout(announceJoin, 60);
    }

    const inDiscord = isDiscordActivity();
    const apiLabel = inDiscord ? 'Discord API v2.6' : 'Cloud API v2.6';
    const ntfyLabel = inDiscord ? 'Discord Proxy' : 'Cloud HTTPS';

    // 1b) Same-Origin /api/mp Serverless Relay join (100% same-origin: works inside Discord Activity with ZERO extra URL Mappings!)
    this.apiRelay = new SameOriginHttpRelay(cleanCode, 'h2c', 'c2h', this.clientId, {
      onReady: () => {
        this.transport = this.transport || apiLabel;
        announceJoin();
        this.emitLobby();
      },
      onMessage: (msg) => {
        if (!msg || msg._from === this.clientId) return;
        if (msg.type === 'hostBeacon') {
          if (!this.connected) announceJoin();
          return;
        }
        if (!this.connected) {
          this.connected = true;
          this.transport = this.transport === 'Local Tab' ? 'Local Tab' : apiLabel;
          this.statusNote = '';
          this._clearJoinRetry();
        }
        this.handleMessage(msg);
      },
    });

    // 2) Port-443 HTTPS/WSS Relay join (passes 100% of mobile 4G/5G CGNAT, firewalls, AND Discord Activity via /.proxy/ntfy!)
    this.ntfyRelay = new NtfyHttpsRelay(
      `bltts_v2_${cleanCode}_h2c`,
      `bltts_v2_${cleanCode}_c2h`,
      {
        onReady: () => {
          this.transport = this.transport || ntfyLabel;
          announceJoin();
          this.emitLobby();
        },
        onMessage: (msg) => {
          if (!msg || msg._from === this.clientId) return;
          if (msg.type === 'hostBeacon') {
            if (!this.connected) announceJoin();
            return;
          }
          if (!this.connected) {
            this.connected = true;
            this.transport = this.transport === 'Local Tab' ? 'Local Tab' : ntfyLabel;
            this.statusNote = '';
            this._clearJoinRetry();
          }
          this.handleMessage(msg);
        },
        onError: (txt) => {
          if (!this.connected && !this.relay?.ready && !this.apiRelay?.ready) {
            this.statusNote = txt;
            this.emitLobby();
          }
        },
      }
    );

    // 3) Dual MQTT-WSS Relay join (uses /emqx & /hivemq Discord URL Mappings when inside Discord Activity!)
    const mqttLabel = inDiscord ? 'Discord WSS' : 'Cloud WSS';
    this.relay = new MqttWssRelay(
      `bltts/mp/v2/${cleanCode}/h2c`,
      `bltts/mp/v2/${cleanCode}/c2h`,
      {
        onReady: () => {
          this.transport = this.transport && this.transport !== ntfyLabel ? this.transport : mqttLabel;
          this.statusNote = '';
          announceJoin();
          this.emitLobby();
        },
        onMessage: (msg) => {
          if (!msg || msg._from === this.clientId) return;
          if (msg.type === 'hostBeacon') {
            if (!this.connected) announceJoin();
            return;
          }
          if (!this.connected) {
            this.connected = true;
            this.transport = this.transport === 'Local Tab' ? 'Local Tab' : mqttLabel;
            this.statusNote = '';
            this._clearJoinRetry();
          }
          this.handleMessage(msg);
        },
      }
    );

    // Start immediate multi-transport join retry timer (don't wait only for MQTT!)
    this._clearJoinRetry();
    this._joinRetryTimer = setInterval(() => {
      if (this.connected || this.role !== 'guest') {
        this._clearJoinRetry();
        return;
      }
      this._joinAttempts++;
      announceJoin();
      if (this._joinAttempts >= 10) {
        this.statusNote = `Chưa thấy Chủ phòng #${cleanCode} phản hồi — hãy kiểm tra đúng mã 4 số hoặc bảo Chủ phòng tạo lại phòng.`;
        this.emitLobby();
      }
    }, 1200);

    // 4) PeerJS WebRTC P2P join (optional direct acceleration outside Discord Activity)
    if (!inDiscord && typeof window !== 'undefined' && window.Peer) {
      try {
        this.peer = new window.Peer(undefined, PEER_CONFIG);
        this.peer.on('open', () => {
          const conn = this.peer.connect(`${ROOM_PEER_PREFIX}${cleanCode}`, {
            reliable: true,
            serialization: 'json',
          });
          this.conn = conn;
          conn.on('open', () => {
            this.connected = true;
            this.transport = 'WebRTC P2P';
            this.statusNote = '';
            this._clearJoinRetry();
            this.sendRaw({
              type: 'guestJoin',
              clientId: this.clientId,
              guestName: cleanName,
              ready: false,
            });
            this.emitLobby();
          });
          conn.on('data', (msg) => this.handleMessage(msg));
          conn.on('close', () => this.handlePeerDisconnect());
        });
        this.peer.on('error', () => {
          this.emitLobby();
        });
      } catch {}
    }

    this.emitLobby();
    return true;
  }

  handlePeerDisconnect(force = false) {
    // If another transport (Local Tab, Same-Origin API, Cloud WSS, or Port-443 HTTPS) is still live, don't tear down the room!
    if (!force && ((this.bc && this.transport === 'Local Tab') || this.apiRelay?.ready || this.relay?.ready || this.ntfyRelay?.ready)) return;
    if (this.role === 'host') {
      this.connected = false;
      this.lobby.guestJoined = false;
      this.lobby.guestName = '';
      this.lobby.guestReady = false;
      this.cancelCountdown();
      this.emitLobby();
      this.callbacks.onDisconnect?.('Đối thủ đã rời phòng.');
    } else {
      this.connected = false;
      this.emitLobby();
      this.callbacks.onDisconnect?.('Mất kết nối với Chủ phòng.');
    }
  }

  setReady(ready) {
    const val = Boolean(ready);
    if (this.role === 'host') {
      const me = this.getMyPlayer();
      if (me) me.ready = val;
      if (!val) this.cancelCountdown();
      this.sendRaw({ type: 'lobbySync', lobby: this.lobby });
      this.emitLobby();
      this.checkStartCountdown();
    } else if (this.role === 'guest') {
      const me = this.getMyPlayer();
      if (me) me.ready = val;
      this.sendRaw({
        type: 'guestReady',
        clientId: this.clientId,
        ready: val,
        guestName: this.lobby.guestName,
      });
      this.emitLobby();
    }
  }

  selectFaction(tribeId) {
    const t = Math.max(0, Math.min(3, tribeId | 0));
    if (this.lobby.status === 'playing' || this.lobby.status === 'countdown') return false;
    if (this.role === 'host') {
      const taken = (this.lobby.players || []).some((p) => p.tribe === t && p.clientId !== this.clientId);
      if (taken) return false;
      const me = this.getMyPlayer();
      if (!me || me.tribe === t) return false;
      me.tribe = t;
      me.ready = false;
      this.cancelCountdown();
      this.sendRaw({ type: 'lobbySync', lobby: this.lobby });
      this.emitLobby();
      return true;
    } else if (this.role === 'guest') {
      const taken = (this.lobby.players || []).some((p) => p.tribe === t && p.clientId !== this.clientId);
      if (taken) return false;
      this.sendRaw({ type: 'selectFaction', clientId: this.clientId, tribe: t });
      return true;
    }
    return false;
  }

  setMap(mapIdx) {
    if (this.role !== 'host') return;
    this.lobby.mapIdx = mapIdx;
    for (const p of this.lobby.players || []) p.ready = false;
    this.cancelCountdown();
    this.sendRaw({ type: 'lobbySync', lobby: this.lobby });
    this.emitLobby();
  }

  cancelCountdown() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    if (this.lobby.status === 'countdown') {
      this.lobby.status = 'lobby';
      this.lobby.countdown = 0;
    }
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
        this.lobby.countdown--;
        if (this.lobby.countdown <= 0) {
          clearInterval(this.countdownTimer);
          this.countdownTimer = null;
          this.lobby.status = 'playing';
          const activeTribes = curList.map((p) => p.tribe).sort((a, b) => a - b);
          this.sendRaw({ type: 'startMatch', mapIdx: this.lobby.mapIdx, activeTribes, lobby: this.lobby });
          this.emitLobby();
          this.callbacks.onStartMatch?.(this.lobby.mapIdx, this.getMyTribe(), activeTribes);
        } else {
          this.sendRaw({ type: 'lobbySync', lobby: this.lobby });
          this.emitLobby();
        }
      }, 700);
    }
  }

  sendCommand(cmd) {
    this.sendRaw({ type: 'cmd', cmd: { ...cmd, tribe: this.getMyTribe(), clientId: this.clientId } });
  }

  sendSnapshot(snapshot) {
    if (this.role !== 'host' || !this.connected) return;
    this.sendRaw({ type: 'snap', snap: snapshot });
  }

  returnToLobby() {
    this.cancelCountdown();
    this.lobby.status = 'lobby';
    for (const p of this.lobby.players || []) p.ready = false;
    if (this.role === 'host') {
      this.sendRaw({ type: 'returnLobby', lobby: this.lobby });
    }
    this.emitLobby();
  }

  handleMessage(msg) {
    if (!msg || !msg.type) return;
    // Deduplicate packets received over multiple transports (Cloud WSS / WebRTC / BroadcastChannel)
    if (msg._seq && msg._from) {
      const key = `${msg._from}:${msg._seq}`;
      if (this._seenSeq.has(key)) return;
      this._seenSeq.add(key);
      if (this._seenSeq.size > 600) this._seenSeq.clear();
    }

    if (this.role === 'host') {
      const cid = msg.clientId || msg._from || 'guest';
      if (msg.type === 'guestJoin') {
        this.connected = true;
        const list = this.lobby.players || [];
        let player = list.find((p) => p.clientId === cid);
        if (!player) {
          if (list.length >= 4) {
            // Room full (max 4 players)
            this.sendRaw({ type: 'roomFull', targetClientId: cid });
            return;
          }
          const used = new Set(list.map((p) => p.tribe));
          const freeTribe = [0, 1, 2, 3].find((t) => !used.has(t)) ?? 1;
          player = {
            clientId: cid,
            name: (msg.guestName || `Tù trưởng #${list.length + 1}`).slice(0, 18),
            tribe: freeTribe,
            ready: Boolean(msg.ready),
            isHost: false,
          };
          list.push(player);
        } else {
          if (msg.guestName) player.name = msg.guestName.slice(0, 18);
          if (msg.ready) player.ready = true;
        }
        this.sendRaw({ type: 'lobbySync', lobby: this.lobby });
        this.emitLobby();
        this.checkStartCountdown();
      } else if (msg.type === 'selectFaction') {
        const list = this.lobby.players || [];
        const player = list.find((p) => p.clientId === cid);
        const want = Math.max(0, Math.min(3, msg.tribe | 0));
        if (player && !list.some((p) => p.tribe === want && p.clientId !== cid)) {
          player.tribe = want;
          player.ready = false;
          this.cancelCountdown();
          this.sendRaw({ type: 'lobbySync', lobby: this.lobby });
          this.emitLobby();
        }
      } else if (msg.type === 'guestReady') {
        this.connected = true;
        const list = this.lobby.players || [];
        const player = list.find((p) => p.clientId === cid);
        if (player) {
          if (msg.guestName) player.name = msg.guestName.slice(0, 18);
          player.ready = Boolean(msg.ready);
          if (!player.ready) this.cancelCountdown();
          this.sendRaw({ type: 'lobbySync', lobby: this.lobby });
          this.emitLobby();
          this.checkStartCountdown();
        }
      } else if (msg.type === 'cmd') {
        this.callbacks.onGuestCommand?.(msg.cmd);
      } else if (msg.type === 'peerLeave') {
        const list = this.lobby.players || [];
        const idx = list.findIndex((p) => p.clientId === cid && !p.isHost);
        if (idx >= 0) {
          const left = list.splice(idx, 1)[0];
          this.cancelCountdown();
          if (list.length <= 1) this.connected = false;
          this.sendRaw({ type: 'lobbySync', lobby: this.lobby });
          this.emitLobby();
          this.callbacks.onDisconnect?.(`${left.name} đã rời phòng.`);
        }
      }
    } else if (this.role === 'guest') {
      if (msg.type === 'roomFull' && msg.targetClientId === this.clientId) {
        this.statusNote = '⚠ Phòng đã đủ 4/4 người chơi!';
        this._clearJoinRetry();
        this.emitLobby();
      } else if (msg.type === 'lobbySync' && msg.lobby) {
        this.connected = true;
        this.statusNote = '';
        this._clearJoinRetry();
        this.lobby = { ...this.lobby, ...msg.lobby };
        this.emitLobby();
      } else if (msg.type === 'startMatch') {
        if (this.lobby.status === 'playing') return;
        this.lobby = { ...this.lobby, ...(msg.lobby || {}), status: 'playing' };
        this.emitLobby();
        const activeTribes = msg.activeTribes || (this.lobby.players || []).map((p) => p.tribe);
        this.callbacks.onStartMatch?.(msg.mapIdx ?? this.lobby.mapIdx, this.getMyTribe(), activeTribes);
      } else if (msg.type === 'snap' && msg.snap) {
        this.callbacks.onSnapshot?.(msg.snap);
      } else if (msg.type === 'tribeEvent') {
        this.callbacks.onTribeEvent?.(msg);
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
    for (const c of this.conns.values()) {
      try { c?.close(); } catch {}
    }
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
    this.lobby.guestJoined = false;
    this.lobby.hostReady = false;
    this.lobby.guestReady = false;
  }
}

/**
 * Pack compact authoritative world snapshot from Host -> Guest
 */
export function packWorldSnapshot(data, state) {
  const e = data.entityData;
  const fo = data.entityFieldOffsets;
  const units = [];
  for (let uid = 1; uid <= 100; uid++) {
    const hp = e[1919 + uid] & 0xff;
    if (hp <= 0) continue;
    units.push([
      uid,
      e[uid] & 0xff,
      e[101 + uid] & 0xff,
      e[202 + uid] | 0,
      e[303 + uid] | 0,
      e[606 + uid] & 7,
      fo ? (e[fo[29] + uid] & 0xff) : 8,
      fo ? (e[fo[30] + uid] & 0xff) : 0,
      hp,
      e[6767 + uid] & 0xff,
      e[2020 + uid] & 0xff,
      e[2121 + uid] & 0xff,
      e[505 + uid] & 0xff,
      e[1414 + uid] & 0xff,
      e[1515 + uid] & 1,
      e[3535 + uid] & 0xff,
      e[3636 + uid] & 0xff,
      e[6565 + uid] & 0xff,
      e[6464 + uid] & 0xff,
      e[2222 + uid] & 0xff,
      e[3333 + uid] | 0,
      e[4444 + uid] & 0xff,
      e[4646 + uid] | 0,
      e[1313 + uid] | 0,
      e[3030 + uid] & 0xff,
      e[7777 + uid] & 0xff,
      e[5151 + uid] & 0xff,
      e[2727 + uid] & 0xff,
      e[1616 + uid] & 0xff,
      e[1717 + uid] & 0xff,
    ]);
  }

  const buildings = [];
  for (let bid = 1; bid <= 60; bid++) {
    const hp = e[8505 + bid] & 0xff;
    if (hp <= 0) continue;
    buildings.push([
      bid,
      e[8383 + bid] & 0xff,
      e[8444 + bid] & 0xff,
      hp,
      e[8566 + bid] & 0xff,
      e[8749 + bid] & 0xff,
      e[9237 + bid] & 0xff,
      e[9115 + bid] & 0xff,
      e[8627 + bid] & 0xff,
    ]);
  }

  // Compute authoritative staffed slot-0 buildings & assigned builder counts for ALL tribes (so Guests
  // never see false "!" / "chưa có người chủ trì" while their Chef/Blacksmith/DJ/Builder fetches materials or eats!)
  const staffedBidsSet = new Set();
  const builderMap = new Map();
  for (let bid = 1; bid <= 60; bid++) {
    if ((e[8505 + bid] & 0xff) <= 0) continue;
    let cur = e[8993 + bid];
    let g = 0;
    let bCnt = 0;
    while (cur > 0 && g++ < 16) {
      if ((e[1919 + cur] & 0xff) > 0) {
        bCnt++;
        if (e[4646 + cur] === 0) staffedBidsSet.add(bid);
      }
      cur = e[4545 + cur];
    }
    if (e[8627 + bid] === 1 && bCnt > 0) builderMap.set(bid, bCnt);
  }
  if (state.tasks) {
    for (const [uid, t] of state.tasks.entries()) {
      if ((e[1919 + uid] & 0xff) <= 0) continue;
      if (t.kind === 'chefFetch' && t.kitchen?.bid) staffedBidsSet.add(t.kitchen.bid);
      else if ((t.kind === 'blacksmithFetch' || t.kind === 'blacksmithDeliver') && t.workshop?.bid) staffedBidsSet.add(t.workshop.bid);
      else if (t.kind === 'workBuilding' && t.target?.bid && (!Array.isArray(t.preferredSlots) || t.preferredSlots.includes(0))) {
        staffedBidsSet.add(t.target.bid);
      } else if (t.kind === 'build' && t.target?.bid) {
        builderMap.set(t.target.bid, (builderMap.get(t.target.bid) || 0) + 1);
      } else if (t.kind === 'buildFetch' && t.buildBld?.bid) {
        builderMap.set(t.buildBld.bid, (builderMap.get(t.buildBld.bid) || 0) + 1);
      }
    }
  }
  if (state.savedJobs) {
    for (const [uid, saved] of state.savedJobs.entries()) {
      if ((e[1919 + uid] & 0xff) <= 0) continue;
      if (saved?.kind === 'workBuilding' && saved.bid && (!Array.isArray(saved.preferredSlots) || saved.preferredSlots.includes(0))) {
        staffedBidsSet.add(saved.bid);
      } else if (saved?.kind === 'build' && saved.bid) {
        builderMap.set(saved.bid, (builderMap.get(saved.bid) || 0) + 1);
      }
    }
  }

  return {
    tick: state.animTick,
    tribeCount: data.tribeCount || 2,
    units,
    buildings,
    staffedBids: [...staffedBidsSet],
    builderCounts: [...builderMap.entries()],
    res0: (data.resources?.[0] || []).slice(0, 18),
    res1: (data.resources?.[1] || []).slice(0, 18),
    resAll: [0, 1, 2, 3].map((t) => (data.resources?.[t] || []).slice(0, 18)),
    projectiles: (state.projectiles || []).map((p) => ({
      x0: p.x0, y0: p.y0, x1: p.x1, y1: p.y1, age: p.age, duration: p.duration, weaponId: p.weaponId,
    })),
    hitEffects: (state.hitEffects || []).map((fx) => ({
      x: fx.x, y: fx.y, kind: fx.kind, age: fx.age, duration: fx.duration,
    })),
    deathEffects: (state.deathEffects || []).map((fx) => ({
      uid: fx.uid, x: fx.x, y: fx.y, dir: fx.dir, animId: fx.animId, frame: fx.frame, maxFrames: fx.maxFrames,
    })),
    winner: state.mpWinner ?? null,
  };
}

/**
 * Apply authoritative world snapshot on Guest (any tribe 0..3)
 */
export function applyWorldSnapshot(data, state, snap, revealFogFn, getBuildingSpecFn) {
  if (!data || !snap) return;
  const e = data.entityData;
  const fo = data.entityFieldOffsets;
  const w = data.width;
  const h = data.height;
  if (snap.tribeCount) data.tribeCount = snap.tribeCount;
  const myTribe = state.localTribe ?? 1;
  const isMyBld = (bid) => (data.tribeCount === 4 ? Math.floor((bid - 1) / 15) === myTribe : (myTribe === 1 ? bid > 30 : bid <= 30));
  const isMyUnit = (uid) => (data.tribeCount === 4 ? Math.floor((uid - 1) / 25) === myTribe : (myTribe === 1 ? uid > 50 : uid <= 50));

  state.animTick = snap.tick || state.animTick;

  // Clear previous unit & building occupancy before rebuilding cleanly from snapshot
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const occ = data.occupancy[y][x];
      if ((occ >= 1 && occ <= 100) || (occ <= -1 && occ >= -60)) {
        data.occupancy[y][x] = 0;
      }
    }
  }
  for (let uid = 1; uid <= 100; uid++) {
    e[1919 + uid] = 0;
    e[4545 + uid] = 0;
  }
  for (let bid = 1; bid <= 60; bid++) {
    e[8505 + bid] = 0;
    e[8993 + bid] = 0;
  }

  // Restore buildings & occupancy
  for (const b of snap.buildings || []) {
    const [bid, bx, by, hp, maxHp, bType, targetType, level, stateFlag] = b;
    e[8383 + bid] = bx;
    e[8444 + bid] = by;
    e[8505 + bid] = hp;
    e[8566 + bid] = maxHp;
    e[8749 + bid] = bType;
    e[9237 + bid] = targetType;
    e[9115 + bid] = level;
    e[8627 + bid] = stateFlag;
    const realType = bType >= 12 && bType <= 19 ? targetType : bType;
    const spec = getBuildingSpecFn(data, realType);
    for (let dy = 0; dy < spec.height; dy++) {
      for (let dx = 0; dx < spec.width; dx++) {
        if (by + dy < h && bx + dx < w) {
          data.occupancy[by + dy][bx + dx] = -bid;
        }
      }
    }
    if (isMyBld(bid)) {
      revealFogFn(data, bx + Math.floor(spec.width / 2), by + Math.floor(spec.height / 2), spec.vision || 5);
    }
  }

  // Restore units & interior links
  for (const u of snap.units || []) {
    const [
      uid, ux, uy, ox, oy, dir, anim, frame, hp, maxHp, energy, satiety, mood, age, sex,
      carry, carryAmt, weapon, hat, jobBadge, thought, bldBid, bldSlot, bldState, bldPropFrame, sprint, nameStyle, avatar, meleeLv, throwLv,
    ] = u;
    e[uid] = ux;
    e[101 + uid] = uy;
    e[202 + uid] = ox;
    e[303 + uid] = oy;
    e[606 + uid] = dir;
    if (fo) {
      e[fo[29] + uid] = anim;
      e[fo[30] + uid] = frame;
    }
    e[1919 + uid] = hp;
    e[6767 + uid] = maxHp;
    e[2020 + uid] = energy;
    e[2121 + uid] = satiety;
    e[505 + uid] = mood;
    e[1414 + uid] = age;
    e[1515 + uid] = sex;
    e[3535 + uid] = carry;
    e[3636 + uid] = carryAmt;
    e[6565 + uid] = weapon;
    e[6464 + uid] = hat;
    e[2222 + uid] = jobBadge;
    e[3333 + uid] = thought;
    e[4444 + uid] = bldBid;
    e[4646 + uid] = bldSlot;
    e[1313 + uid] = bldState;
    e[3030 + uid] = bldPropFrame;
    e[7777 + uid] = sprint;
    e[5151 + uid] = nameStyle;
    e[2727 + uid] = avatar;
    if (meleeLv !== undefined) e[1616 + uid] = meleeLv;
    if (throwLv !== undefined) e[1717 + uid] = throwLv;

    if (bldBid > 0 && bldSlot >= 0) {
      e[4545 + uid] = e[8993 + bldBid];
      e[8993 + bldBid] = uid;
    } else if (uy < h && ux < w && data.occupancy[uy][ux] === 0) {
      data.occupancy[uy][ux] = uid;
    }
    if (isMyUnit(uid)) {
      revealFogFn(data, ux, uy, 4);
    }
  }

  // Restore all tribes' resources (0..3)
  if (!data.resources) data.resources = [[], [], [], []];
  if (Array.isArray(snap.resAll)) {
    for (let t = 0; t < snap.resAll.length; t++) {
      const arr = snap.resAll[t];
      if (!arr) continue;
      if (!data.resources[t]) data.resources[t] = new Array(26).fill(0);
      for (let i = 0; i < arr.length; i++) data.resources[t][i] = arr[i];
    }
  } else {
    if (snap.res0) {
      if (!data.resources[0]) data.resources[0] = new Array(26).fill(0);
      for (let i = 0; i < snap.res0.length; i++) data.resources[0][i] = snap.res0[i];
    }
    if (snap.res1) {
      if (!data.resources[1]) data.resources[1] = new Array(26).fill(0);
      for (let i = 0; i < snap.res1.length; i++) data.resources[1][i] = snap.res1[i];
    }
  }

  state.projectiles = snap.projectiles || [];
  state.hitEffects = snap.hitEffects || [];
  state.deathEffects = snap.deathEffects || [];
  state.remoteStaffedBids = new Set(snap.staffedBids || []);
  state.remoteBuilderCounts = new Map(snap.builderCounts || []);
  if (snap.winner !== null && snap.winner !== undefined) {
    state.mpWinner = snap.winner;
  }
}
