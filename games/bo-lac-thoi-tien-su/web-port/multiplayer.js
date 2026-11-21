/**
 * 1v1 Real-Time Multiplayer Room & Sync Engine for Prehistoric Tribes
 * Dual Transport:
 *  1) PeerJS WebRTC P2P DataChannel (works across devices/networks on Vercel & internet!)
 *  2) BroadcastChannel (instant <5ms connection for 2 browser tabs on the same machine / offline)
 */

const PEER_CONFIG = {
  debug: 0,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ],
  },
};

export function generateRoomCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export class MultiplayerClient {
  constructor(callbacks = {}) {
    this.callbacks = callbacks;
    this.role = null; // 'host' | 'guest'
    this.roomCode = '';
    this.peer = null;
    this.conn = null;
    this.bc = null;
    this.connected = false;
    this.transport = '';
    this.countdownTimer = null;
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
      status: 'idle', // 'idle' | 'lobby' | 'countdown' | 'playing'
      countdown: 0,
    };
  }

  emitLobby() {
    this.callbacks.onLobbyUpdate?.({ ...this.lobby, role: this.role, connected: this.connected, transport: this.transport });
  }

  sendRaw(msg) {
    const packet = { ...msg, _from: this.role, _seq: ++this._seqOut };
    let sent = false;
    if (this.conn && this.conn.open) {
      try {
        this.conn.send(packet);
        sent = true;
      } catch {}
    }
    if (this.bc) {
      try {
        this.bc.postMessage(packet);
        sent = true;
      } catch {}
    }
    return sent;
  }

  createRoom(hostName = 'Tù trưởng Xanh', mapIdx = 1) {
    this.leaveRoom();
    const code = generateRoomCode();
    this.role = 'host';
    this.roomCode = code;
    this.lobby = {
      roomCode: code,
      mapIdx,
      hostName: hostName.trim() || 'Tù trưởng Xanh',
      guestName: '',
      hostReady: false,
      guestReady: false,
      guestJoined: false,
      status: 'lobby',
      countdown: 0,
    };

    // 1) BroadcastChannel for instant local 2-tab play
    if (typeof BroadcastChannel !== 'undefined') {
      this.bc = new BroadcastChannel(`pt-mp-room-${code}`);
      this.bc.onmessage = (ev) => {
        const msg = ev.data;
        if (!msg || msg._from === this.role) return;
        if (!this.connected) {
          this.connected = true;
          this.transport = 'Local Tab';
        }
        this.handleMessage(msg);
      };
    }

    // 2) PeerJS WebRTC P2P for internet play across devices
    if (typeof window !== 'undefined' && window.Peer) {
      try {
        this.peer = new window.Peer(`pt-room-${code}`, PEER_CONFIG);
        this.peer.on('open', () => {
          this.transport = this.transport || 'WebRTC P2P';
          this.emitLobby();
        });
        this.peer.on('connection', (conn) => {
          this.conn = conn;
          conn.on('open', () => {
            this.connected = true;
            this.transport = 'WebRTC P2P';
            this.sendRaw({ type: 'lobbySync', lobby: this.lobby });
            this.emitLobby();
          });
          conn.on('data', (msg) => this.handleMessage(msg));
          conn.on('close', () => this.handlePeerDisconnect());
        });
        this.peer.on('error', () => {
          // Keep BroadcastChannel working even if signaling server is unreachable
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
    this.role = 'guest';
    this.roomCode = cleanCode;
    this.lobby = {
      roomCode: cleanCode,
      mapIdx: 1,
      hostName: 'Đang kết nối...',
      guestName: guestName.trim() || 'Tù trưởng Đỏ',
      hostReady: false,
      guestReady: false,
      guestJoined: false,
      status: 'lobby',
      countdown: 0,
    };

    // 1) BroadcastChannel for instant local 2-tab join
    if (typeof BroadcastChannel !== 'undefined') {
      this.bc = new BroadcastChannel(`pt-mp-room-${cleanCode}`);
      this.bc.onmessage = (ev) => {
        const msg = ev.data;
        if (!msg || msg._from === this.role) return;
        if (!this.connected) {
          this.connected = true;
          this.transport = 'Local Tab';
        }
        this.handleMessage(msg);
      };
      // Announce join immediately via BroadcastChannel (and retry briefly in case Host is still initializing)
      setTimeout(() => {
        this.sendRaw({ type: 'guestJoin', guestName: this.lobby.guestName, ready: this.lobby.guestReady });
      }, 60);
    }

    // 2) PeerJS WebRTC P2P join
    if (typeof window !== 'undefined' && window.Peer) {
      try {
        this.peer = new window.Peer(undefined, PEER_CONFIG);
        this.peer.on('open', () => {
          const conn = this.peer.connect(`pt-room-${cleanCode}`, { reliable: true });
          this.conn = conn;
          conn.on('open', () => {
            this.connected = true;
            this.transport = 'WebRTC P2P';
            this.sendRaw({ type: 'guestJoin', guestName: this.lobby.guestName, ready: this.lobby.guestReady });
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

  handlePeerDisconnect() {
    // If local BroadcastChannel is active on the same machine, don't tear down the room on a WebRTC hiccup
    if (this.bc && this.transport === 'Local Tab') return;
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
      this.lobby.hostReady = val;
      if (!val) this.cancelCountdown();
      this.sendRaw({ type: 'lobbySync', lobby: this.lobby });
      this.emitLobby();
      this.checkStartCountdown();
    } else if (this.role === 'guest') {
      this.lobby.guestReady = val;
      this.sendRaw({ type: 'guestReady', ready: val, guestName: this.lobby.guestName });
      this.emitLobby();
    }
  }

  setMap(mapIdx) {
    if (this.role !== 'host') return;
    this.lobby.mapIdx = mapIdx;
    this.lobby.hostReady = false;
    this.lobby.guestReady = false;
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
    if (this.lobby.guestJoined && this.lobby.hostReady && this.lobby.guestReady && this.lobby.status === 'lobby') {
      this.lobby.status = 'countdown';
      this.lobby.countdown = 3;
      this.sendRaw({ type: 'lobbySync', lobby: this.lobby });
      this.emitLobby();
      this.countdownTimer = setInterval(() => {
        if (!this.lobby.hostReady || !this.lobby.guestReady || !this.lobby.guestJoined) {
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
          this.sendRaw({ type: 'startMatch', mapIdx: this.lobby.mapIdx, lobby: this.lobby });
          this.emitLobby();
          this.callbacks.onStartMatch?.(this.lobby.mapIdx, 0);
        } else {
          this.sendRaw({ type: 'lobbySync', lobby: this.lobby });
          this.emitLobby();
        }
      }, 700);
    }
  }

  sendCommand(cmd) {
    this.sendRaw({ type: 'cmd', cmd });
  }

  sendSnapshot(snapshot) {
    if (this.role !== 'host' || !this.connected) return;
    this.sendRaw({ type: 'snap', snap: snapshot });
  }

  returnToLobby() {
    this.cancelCountdown();
    this.lobby.status = 'lobby';
    this.lobby.hostReady = false;
    this.lobby.guestReady = false;
    if (this.role === 'host') {
      this.sendRaw({ type: 'returnLobby', lobby: this.lobby });
    }
    this.emitLobby();
  }

  handleMessage(msg) {
    if (!msg || !msg.type) return;
    // Deduplicate packets received over both WebRTC and BroadcastChannel
    if (msg._seq && msg._from) {
      const key = `${msg._from}:${msg._seq}`;
      if (this._seenSeq.has(key)) return;
      this._seenSeq.add(key);
      if (this._seenSeq.size > 400) this._seenSeq.clear();
    }

    if (this.role === 'host') {
      if (msg.type === 'guestJoin') {
        this.connected = true;
        const alreadyJoined = this.lobby.guestJoined;
        this.lobby.guestJoined = true;
        this.lobby.guestName = msg.guestName || this.lobby.guestName || 'Tù trưởng Đỏ';
        // Never wipe guestReady on a secondary transport reconnect!
        if (!alreadyJoined) {
          this.lobby.guestReady = Boolean(msg.ready);
        } else if (msg.ready) {
          this.lobby.guestReady = true;
        }
        this.sendRaw({ type: 'lobbySync', lobby: this.lobby });
        this.emitLobby();
        this.checkStartCountdown();
      } else if (msg.type === 'guestReady') {
        this.connected = true;
        this.lobby.guestJoined = true;
        if (msg.guestName) this.lobby.guestName = msg.guestName;
        this.lobby.guestReady = Boolean(msg.ready);
        if (!this.lobby.guestReady) this.cancelCountdown();
        this.sendRaw({ type: 'lobbySync', lobby: this.lobby });
        this.emitLobby();
        this.checkStartCountdown();
      } else if (msg.type === 'cmd') {
        this.callbacks.onGuestCommand?.(msg.cmd);
      }
    } else if (this.role === 'guest') {
      if (msg.type === 'lobbySync' && msg.lobby) {
        this.connected = true;
        this.lobby = { ...this.lobby, ...msg.lobby };
        this.emitLobby();
      } else if (msg.type === 'startMatch') {
        if (this.lobby.status === 'playing') return;
        this.lobby = { ...this.lobby, ...(msg.lobby || {}), status: 'playing' };
        this.emitLobby();
        this.callbacks.onStartMatch?.(msg.mapIdx ?? this.lobby.mapIdx, 1);
      } else if (msg.type === 'snap' && msg.snap) {
        this.callbacks.onSnapshot?.(msg.snap);
      } else if (msg.type === 'returnLobby' && msg.lobby) {
        this.lobby = { ...this.lobby, ...msg.lobby, status: 'lobby' };
        this.emitLobby();
        this.callbacks.onReturnLobby?.();
      }
    }
  }

  leaveRoom() {
    this.cancelCountdown();
    try { this.conn?.close(); } catch {}
    try { this.peer?.destroy(); } catch {}
    try { this.bc?.close(); } catch {}
    this.conn = null;
    this.peer = null;
    this.bc = null;
    this.connected = false;
    this.role = null;
    this.roomCode = '';
    this.transport = '';
    this.lobby.status = 'idle';
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

  return {
    tick: state.animTick,
    units,
    buildings,
    res0: (data.resources?.[0] || []).slice(0, 18),
    res1: (data.resources?.[1] || []).slice(0, 18),
    projectiles: (state.projectiles || []).map((p) => ({
      x0: p.x0, y0: p.y0, x1: p.x1, y1: p.y1, age: p.age, duration: p.duration, weaponId: p.weaponId,
    })),
    winner: state.mpWinner ?? null,
  };
}

/**
 * Apply authoritative world snapshot on Guest (Tribe 1)
 */
export function applyWorldSnapshot(data, state, snap, revealFogFn, getBuildingSpecFn) {
  if (!data || !snap) return;
  const e = data.entityData;
  const fo = data.entityFieldOffsets;
  const w = data.width;
  const h = data.height;

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
    if (bid > 30) {
      revealFogFn(data, bx + Math.floor(spec.width / 2), by + Math.floor(spec.height / 2), spec.vision || 5);
    }
  }

  // Restore units & interior links
  for (const u of snap.units || []) {
    const [
      uid, ux, uy, ox, oy, dir, anim, frame, hp, maxHp, energy, satiety, mood, age, sex,
      carry, carryAmt, weapon, hat, jobBadge, thought, bldBid, bldSlot, bldState, bldPropFrame, sprint, nameStyle, avatar,
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

    if (bldBid > 0 && bldSlot >= 0) {
      e[4545 + uid] = e[8993 + bldBid];
      e[8993 + bldBid] = uid;
    } else if (uy < h && ux < w && data.occupancy[uy][ux] === 0) {
      data.occupancy[uy][ux] = uid;
    }
    if (uid > 50) {
      revealFogFn(data, ux, uy, 4);
    }
  }

  // Restore both tribes' resources
  if (!data.resources) data.resources = [[], []];
  if (snap.res0) {
    if (!data.resources[0]) data.resources[0] = new Array(26).fill(0);
    for (let i = 0; i < snap.res0.length; i++) data.resources[0][i] = snap.res0[i];
  }
  if (snap.res1) {
    if (!data.resources[1]) data.resources[1] = new Array(26).fill(0);
    for (let i = 0; i < snap.res1.length; i++) data.resources[1][i] = snap.res1[i];
  }

  state.projectiles = snap.projectiles || [];
  if (snap.winner !== null && snap.winner !== undefined) {
    state.mpWinner = snap.winner;
  }
}
