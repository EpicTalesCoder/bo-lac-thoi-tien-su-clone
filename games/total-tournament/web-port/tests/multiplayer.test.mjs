import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  decodeCa, decodeColumnTable, decodeCu2, decodeEffects, decodeLevel, decodeObjectBlocks,
  decodeWeaponSets, decodeWeaponTable,
} from '../tt-loader.js';
import {
  createSourceMatch,
  tickSourceMatch,
  packMatchSnapshot,
  applyMatchSnapshot,
} from '../tt-match.js';
import { MODE } from '../tt-core.js';
import {
  MultiplayerClient,
  normalizeRoomCode,
  generateRoomCode,
} from '../multiplayer.js';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const RES = path.resolve(DIR, '../jar-resources');
const readBin = (name) => new Uint8Array(fs.readFileSync(path.join(RES, `${name}.png`)));

function loadTablesSync() {
  const cu2 = decodeCu2(readBin('cu2'));
  const ca = decodeCa(readBin('ca'));
  const cc = decodeColumnTable(readBin('cc'), 11, 'cc');
  const ccs = decodeColumnTable(readBin('ccs'), 7, 'ccs');
  const objectBlocks = decodeObjectBlocks(readBin('obj0'));
  const weaponTable = decodeWeaponTable(readBin('wpn'));
  const equipmentSets = decodeWeaponSets(readBin('wlg'));
  const effects = decodeEffects(readBin('mua'));
  const ll = readBin('ll');
  const levels = Array.from({ length: 11 }, (_, i) => decodeLevel(ll, i, objectBlocks, cu2));
  return { cu2, ca, cc, ccs, objectBlocks, weaponTable, equipmentSets, effects, levels };
}

function withMockBroadcastChannel(fn) {
  const channels = new Map();
  const prevBc = globalThis.BroadcastChannel;
  globalThis.BroadcastChannel = class MockBroadcastChannel {
    constructor(name) {
      this.name = name;
      this.onmessage = null;
      this.closed = false;
      if (!channels.has(name)) channels.set(name, new Set());
      channels.get(name).add(this);
    }
    postMessage(data) {
      if (this.closed) return;
      const cloned = structuredClone(data);
      for (const peer of channels.get(this.name) || []) {
        if (peer !== this && !peer.closed && peer.onmessage) {
          peer.onmessage({ data: structuredClone(cloned) });
        }
      }
    }
    close() {
      this.closed = true;
      channels.get(this.name)?.delete(this);
    }
  };
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      if (prevBc === undefined) delete globalThis.BroadcastChannel;
      else globalThis.BroadcastChannel = prevBc;
    });
}

test('room code normalization namespaces TT codes without colliding on /api/mp', () => {
  assert.equal(normalizeRoomCode('4829'), 'TT4829');
  assert.equal(normalizeRoomCode('tt9102'), 'TT9102');
  assert.equal(normalizeRoomCode('  tt-77 '), 'TT77');
  assert.match(generateRoomCode(), /^TT\d{4}$/);
});

test('MultiplayerClient Host and Guests sync lobby state, config lock, countdown, and input forwarding', async () => {
  await withMockBroadcastChannel(async () => {
    let hostStartConfig = null;
    let guestStartConfig = null;
    let receivedGuestInput = null;
    let guestReturnCount = 0;

    const host = new MultiplayerClient({
      onStartMatch: (cfg) => { hostStartConfig = cfg; },
      onGuestInput: (cid, input) => { receivedGuestInput = { cid, input }; },
    });
    const guest = new MultiplayerClient({
      onStartMatch: (cfg) => { guestStartConfig = cfg; },
      onReturnLobby: () => { guestReturnCount += 1; },
    });

    try {
      const code = host.createRoom('Alpha', { mode: 0, levelIndex: 7, botCount: 2, targetLimit: 12, character: 0 });
      assert.match(code, /^TT\d{4}$/);

      assert.equal(guest.joinRoom(code.slice(2), 'Bravo', 1), true);
      await new Promise((r) => setTimeout(r, 80));

      assert.equal(host.lobby.players.length, 2);
      assert.equal(guest.lobby.players.length, 2);
      assert.equal(host.lobby.players[1].name, 'Bravo');

      // Switching mode to CTF (3) clamps locked arenas (7 -> 0) and resets ready states
      host.setReady(true);
      guest.setReady(true);
      await new Promise((r) => setTimeout(r, 40));
      host.updateConfig({ mode: MODE.CAPTURE_FLAG, targetLimit: 5 });
      await new Promise((r) => setTimeout(r, 40));
      assert.equal(guest.lobby.mode, MODE.CAPTURE_FLAG);
      assert.equal(guest.lobby.levelIndex, 0);
      assert.equal(host.lobby.players.every((p) => !p.ready), true);

      // Guest switches to Soldier, then both ready up and match launches
      guest.selectCharacter(0);
      await new Promise((r) => setTimeout(r, 30));
      assert.equal(host.lobby.players[1].character, 0);

      host.setReady(true);
      guest.setReady(true);
      await new Promise((r) => setTimeout(r, 2200));

      assert.ok(hostStartConfig, 'Host should start match after countdown');
      assert.ok(guestStartConfig, 'Guest should start match synchronously');
      assert.equal(guestStartConfig.mode, MODE.CAPTURE_FLAG);

      // Guest sends input & Host deduplicates duplicate packets cleanly
      guest.sendInput({ right: true, fire: true });
      await new Promise((r) => setTimeout(r, 30));
      assert.equal(receivedGuestInput?.cid, guest.clientId);
      assert.equal(receivedGuestInput?.input?.right, true);
      assert.equal(receivedGuestInput?.input?.fire, true);

      host.returnToLobby();
      await new Promise((r) => setTimeout(r, 30));
      assert.equal(guestReturnCount, 1);
      assert.equal(guest.lobby.status, 'lobby');
    } finally {
      host.leaveRoom();
      guest.leaveRoom();
    }
  });
});

test('tickSourceMatch executes Host local input and Guest remoteInputs while preserving bots', () => {
  const tables = loadTablesSync();
  const humans = [
    { clientId: 'host_1', name: 'P1', character: 0, slot: 0 },
    { clientId: 'guest_2', name: 'P2', character: 1, slot: 1 },
  ];
  const hostMatch = createSourceMatch(tables, {
    mode: MODE.DEATHMATCH,
    levelIndex: 0,
    settings: { I: 4, F: 10 },
    humans,
    localClientId: 'host_1',
  });

  assert.equal(hostMatch.playerIndex, 0);
  const hostActor = hostMatch.actors.find((a) => a.clientId === 'host_1');
  const gActor = hostMatch.actors.find((a) => a.clientId === 'guest_2');
  const bots = hostMatch.actors.filter((a) => !a.isHuman);
  assert.ok(hostActor && hostActor.isHuman && hostActor.isPlayer);
  assert.ok(gActor && gActor.isHuman && !gActor.isPlayer && gActor.character === 1);
  assert.equal(bots.length, 2, '2 AI bots should fill remaining slots');

  gActor.ownedWeapons = [1, 1, 1, 0, 0, 0];
  gActor.ammo = [1, 40, 20, 0, 0, 0];
  const startX = gActor.x;

  // Feed remote Guest movement + switchWeapon edge + fire
  hostMatch.remoteInputs.guest_2 = {
    right: true,
    fire: true,
    switchWeapon: true,
  };
  tickSourceMatch(hostMatch, {}, tables);

  assert.equal(hostMatch.remoteInputs.guest_2.switchWeapon, false, 'edge trigger switchWeapon must reset after tick');
  assert.equal(gActor.weapon, 2, 'Guest switched to Shotgun');
  assert.ok(gActor.x > startX, 'Guest moved right on Host simulation');
  assert.ok(hostMatch.projectiles.some((p) => p.owner === gActor.id), 'Guest spawned weapon projectile');
});

test('packMatchSnapshot and applyMatchSnapshot synchronize actors, CTF score, and Guest personal winner', () => {
  const tables = loadTablesSync();
  const humans = [
    { clientId: 'host_1', name: 'BlueHost', character: 0, slot: 0 },
    { clientId: 'guest_2', name: 'RedGuest', character: 1, slot: 1 },
  ];
  const hostMatch = createSourceMatch(tables, {
    mode: MODE.CAPTURE_FLAG,
    levelIndex: 0,
    settings: { I: 2, E: 1 },
    humans,
    localClientId: 'host_1',
  });
  const guestMatch = createSourceMatch(tables, {
    mode: MODE.CAPTURE_FLAG,
    levelIndex: 0,
    settings: { I: 2, E: 1 },
    humans,
    localClientId: 'guest_2',
  });

  // Simulate Red team scoring winning CTF point on Host
  const hostActor = hostMatch.actors[0];
  const guestActor = hostMatch.actors[1];
  guestActor.kills = 2;
  guestActor.health = 70;
  guestActor.armor = 50;
  guestActor.ownedWeapons = [1, 1, 0, 1, 0, 0];
  hostMatch.teamScore = [0, 1];
  hostMatch.finished = true;
  hostMatch.finishReason = 'flags';
  hostMatch.winner = 'enemy'; // Host (team 0 Blue) lost
  hostMatch.rankings = [
    { rank: 1, id: 1, name: 'RedGuest', isPlayer: false, team: 1, character: 1, kills: 2, deaths: 0 },
    { rank: 2, id: 0, name: 'BlueHost', isPlayer: true, team: 0, character: 0, kills: 0, deaths: 1 },
  ];
  hostActor.x += 12;

  const snap = packMatchSnapshot(hostMatch);
  applyMatchSnapshot(guestMatch, snap, false);

  assert.equal(guestMatch.playerIndex, 1);
  assert.equal(guestMatch.actors[0].x, hostActor.x);
  assert.equal(guestMatch.player.health, 70);
  assert.equal(guestMatch.player.armor, 50);
  assert.deepEqual(guestMatch.player.ownedWeapons, [1, 1, 0, 1, 0, 0]);
  assert.deepEqual(guestMatch.teamScore, [0, 1]);
  assert.equal(guestMatch.finished, true);
  assert.equal(guestMatch.winner, 'player', 'Guest team won CTF so Guest winner must resolve to player');
  assert.equal(guestMatch.rankings[0].isPlayer, true);
});

test('sendRaw delivers snapshots to network relays even when local BroadcastChannel is active (WiFi-4G parity)', () => {
  const client = new MultiplayerClient();
  client.role = 'host';
  client.connected = true;
  let bcSent = 0;
  let apiSent = 0;
  let mqttSent = 0;
  let ntfySent = 0;
  client.bc = { postMessage: () => { bcSent += 1; } };
  client.apiRelay = { ready: true, send: () => { apiSent += 1; return true; } };
  client.relay = { ready: true, send: () => { mqttSent += 1; return true; } };
  client.ntfyRelay = { closed: false, send: () => { ntfySent += 1; return true; } };

  client.sendSnapshot({ t: 1 });
  assert.equal(bcSent, 1);
  assert.equal(apiSent, 1);
  assert.equal(mqttSent, 1);
  assert.equal(ntfySent, 1);
});
