/**
 * Voice authority survives hibernation through socket attachments, including
 * listeners parked while their host reconnects. Storage is unavailable here,
 * so a protocol change cannot quietly introduce recorded room state.
 */

import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import worker, { Broadcast } from '../../workers/rendezvous/worker.js';
import { broadcastCode, validBroadcastSignal } from '../../workers/rendezvous/broadcast.js';
import { DISCOVERY_SCOPE_HEADER, discoveryScope } from '../../workers/rendezvous/discovery.js';

const NativeResponse = globalThis.Response;
const NativePair = globalThis.WebSocketPair;
const NativeAutoPair = globalThis.WebSocketRequestResponsePair;
const HOST_KEY = 'A'.repeat(43), LISTEN_KEY = 'B'.repeat(43), WRONG_KEY = 'C'.repeat(43);
const CONNECTION = '00000000-0000-4000-8000-000000000001';
const REPLACEMENT = '00000000-0000-4000-8000-000000000002';
const SDP = 'v=0\r\no=- 1 1 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n'
  + 'm=audio 9 UDP/TLS/RTP/SAVPF 111\r\nc=IN IP4 0.0.0.0\r\na=sendonly\r\n';
const CANDIDATE = { candidate: 'candidate:1 1 udp 2122260223 peer.local 12345 typ host generation 0 ufrag Abcd',
  sdpMid: '0', sdpMLineIndex: 0, usernameFragment: 'Abcd' };

class Socket {
  constructor() { this.readyState = 0; this.messages = []; this.attachment = null; this.tags = []; }
  accept() { this.readyState = 1; }
  close(code, reason) { this.readyState = 3; this.closed = { code, reason }; }
  send(value) {
    if (this.readyState !== 1 || this.failSend) throw new Error('closed');
    this.messages.push(JSON.parse(value));
  }
  serializeAttachment(value) { this.attachment = structuredClone(value); }
  deserializeAttachment() { return structuredClone(this.attachment); }
}

class Context {
  constructor() { this.sockets = []; }
  get storage() { throw new Error('voice must not use durable storage'); }
  setWebSocketAutoResponse(value) { this.autoResponse = value; }
  acceptWebSocket(ws, tags) { ws.accept(); ws.tags = tags; this.sockets.push(ws); }
  getWebSockets(tag) {
    return this.sockets.filter((ws) => ws.readyState === 1 && (tag === undefined || ws.tags.includes(tag)));
  }
}

before(() => {
  globalThis.Response = class extends NativeResponse {
    constructor(body, init) {
      if (init?.status === 101) {
        super(null, { status: 200 });
        Object.defineProperty(this, 'status', { value: 101 });
        this.webSocket = init.webSocket;
      } else super(body, init);
    }
  };
  globalThis.WebSocketPair = class {
    constructor() {
      const client = new Socket(), server = new Socket();
      client.peer = server;
      return { 0: client, 1: server };
    }
  };
  globalThis.WebSocketRequestResponsePair = class {
    constructor(request, response) { this.request = request; this.response = response; }
  };
});

after(() => {
  globalThis.Response = NativeResponse;
  if (NativePair === undefined) delete globalThis.WebSocketPair;
  else globalThis.WebSocketPair = NativePair;
  if (NativeAutoPair === undefined) delete globalThis.WebSocketRequestResponsePair;
  else globalThis.WebSocketRequestResponsePair = NativeAutoPair;
});

async function system({ allow = true } = {}) {
  const code = await broadcastCode(HOST_KEY), rooms = new Map(), calls = [], keys = [];
  const env = {
    LIMIT: { limit: async ({ key }) => { keys.push(key); return { success: allow }; } },
    BROADCASTS: {
      idFromName: (name) => name,
      get: (name) => ({ fetch: async (request) => {
        calls.push(request);
        if (!rooms.has(name)) {
          const ctx = new Context();
          rooms.set(name, { ctx, instance: new Broadcast(ctx, env) });
        }
        return rooms.get(name).instance.fetch(request);
      } }),
    },
    ROOMS: { get() { throw new Error('voice must not use text rooms'); } },
    DISCOVERY: { get() { throw new Error('voice must not use discovery'); } },
  };
  const request = (path = `/broadcast/${code}`, extra = {}) => new Request(`https://rendezvous.abox.tools${path}`, {
    headers: { Upgrade: 'websocket', Origin: 'https://abox.tools', 'CF-Connecting-IP': '1.2.3.4', ...extra },
  });
  const open = async () => {
    const result = await worker.fetch(request(), env);
    assert.equal(result.status, 101);
    return result.webSocket.peer;
  };
  const room = () => rooms.get(code);
  const send = (ws, value) => room().instance.webSocketMessage(ws, typeof value === 'string' ? value : JSON.stringify(value));
  const host = async () => {
    const ws = await open();
    await send(ws, { type: 'auth', role: 'host', key: HOST_KEY, listenKey: LISTEN_KEY });
    return ws;
  };
  const listener = async (key = LISTEN_KEY) => {
    const ws = await open();
    await send(ws, { type: 'auth', role: 'listener', key });
    return ws;
  };
  return { code, env, calls, keys, request, open, room, send, host, listener };
}

const last = (ws) => ws.messages.at(-1);
const generation = (host) => host.deserializeAttachment().generation;
const id = (listener) => listener.deserializeAttachment().id;
const offer = (host, listener, connection = CONNECTION) => ({
  type: 'offer', generation: generation(host), connection, to: id(listener), sdp: SDP,
});

test('broadcast relay mode is authenticated, pinned across host loss and enforced on candidates', async t => {
  const s = await system();
  s.env.TURN_KEY_ID = 'test-key'; s.env.TURN_KEY_TOKEN = 'test-token';
  let mints = 0;
  t.mock.method(globalThis, 'fetch', async () => {
    mints++;
    return new NativeResponse(JSON.stringify({ iceServers: [{ urls: ['turns:turn.example.test:443?transport=tcp'], username: 'temporary', credential: 'test' }] }));
  });
  const host = await s.open();
  await s.send(host, { type: 'auth', role: 'host', key: HOST_KEY, listenKey: LISTEN_KEY, transport: 'relay' });
  assert.equal(last(host).transport, 'relay');
  const direct = await s.listener();
  assert.equal(last(direct).error, 'transport-mismatch');
  const listener = await s.open();
  await s.send(listener, { type: 'auth', role: 'listener', key: LISTEN_KEY, transport: 'relay' });
  assert.equal(last(listener).transport, 'relay');
  await s.send(listener, { type: 'relay-request', id: 'test-1' });
  assert.equal(last(listener).type, 'relay-credentials');
  assert.equal(last(listener).iceServers[0].username, 'temporary');
  assert.equal(mints, 1);
  const relay = { ...CANDIDATE, candidate: 'candidate:1 1 udp 1 198.51.100.5 12345 typ relay' };
  const signal = { type: 'candidate', generation: generation(host), connection: CONNECTION, to: id(listener), candidate: relay };
  await s.send(host, signal);
  assert.deepEqual(last(listener).candidate, relay);
  await s.send(host, { ...signal, candidate: CANDIDATE });
  assert.equal(last(host).error, 'invalid');
  s.room().instance.webSocketClose(host); host.close(1000, 'gone');
  const replacement = await s.host();
  assert.equal(last(replacement).error, 'transport-mismatch');
  await s.send(listener, { type: 'relay-request', id: 'test-2' });
  assert.equal(last(listener).error, 'forbidden');
  assert.equal(mints, 1);
});

test('broadcast Direct rooms never mint relay credentials and service limits preserve admission bounds', async () => {
  const direct = await system(), host = await direct.host();
  await direct.send(host, { type: 'relay-request', id: 'direct' });
  assert.equal(last(host).error, 'forbidden');
  const relay = await system();
  relay.env.RELAY_TOOLS = 'voice-oncall';
  const denied = await relay.open();
  await relay.send(denied, { type: 'auth', role: 'host', key: HOST_KEY, listenKey: LISTEN_KEY, transport: 'relay' });
  assert.equal(last(denied).error, 'relay-unavailable');
  relay.env.RELAY_TOOLS = 'walkie-talkie'; relay.env.RELAY_MAX_PEERS = '1';
  const owner = await relay.open();
  await relay.send(owner, { type: 'auth', role: 'host', key: HOST_KEY, listenKey: LISTEN_KEY, transport: 'relay' });
  for (let i = 0; i < 2; i++) {
    const peer = await relay.open();
    await relay.send(peer, { type: 'auth', role: 'listener', key: LISTEN_KEY, transport: 'relay' });
    assert.equal(last(peer).type, i ? 'error' : 'ready');
    if (i) assert.equal(last(peer).error, 'full');
  }
});

test('broadcast uses a separate binding with the existing origin and address gates', async () => {
  const s = await system();
  assert.equal((await worker.fetch(new Request(`https://rendezvous.abox.tools/broadcast/${s.code}`), s.env)).status, 426);
  assert.equal((await worker.fetch(s.request(undefined, { Origin: 'https://example.com' }), s.env)).status, 403);
  assert.deepEqual(s.keys, []);
  assert.equal((await worker.fetch(s.request(`/broadcast/${s.code}?key=${HOST_KEY}`), s.env)).status, 400);
  for (const path of ['/broadcast/short', `/broadcast/${s.code.toUpperCase()}`, '/_broadcast/check']) {
    assert.equal((await worker.fetch(s.request(path), s.env)).status, 404);
  }
  const blocked = await system({ allow: false });
  assert.equal((await worker.fetch(blocked.request(), blocked.env)).status, 429);
  assert.equal(blocked.calls.length, 0);
  const response = await worker.fetch(s.request(undefined, { [DISCOVERY_SCOPE_HEADER]: 'forged' }), s.env);
  assert.equal(response.status, 101);
  assert.deepEqual(s.keys, ['1.2.3.4']);
  assert.equal(s.calls[0].headers.get(DISCOVERY_SCOPE_HEADER), await discoveryScope(s.request(), 'walkie-talkie'));
  assert.equal(s.calls[0].url.includes(HOST_KEY), false);
  assert.equal(s.calls[0].url.includes(LISTEN_KEY), false);
});

test('room ownership is the host digest and raw capabilities never enter attachments', async () => {
  const s = await system(), host = await s.host(), listener = await s.listener();
  assert.equal(await broadcastCode(HOST_KEY), s.code);
  assert.equal(host.messages[0].type, 'host-ready');
  assert.match(generation(host), /^[a-f0-9-]{36}$/);
  assert.deepEqual(last(host), { type: 'join', id: id(listener), generation: generation(host) });
  assert.deepEqual(last(listener), { type: 'ready', id: id(listener), generation: generation(host), talking: false });
  const attachments = JSON.stringify(s.room().ctx.sockets.map((ws) => ws.deserializeAttachment()));
  assert.equal(attachments.includes(HOST_KEY), false);
  assert.equal(attachments.includes(LISTEN_KEY), false);
  assert.equal(s.room().ctx.autoResponse.request, 'ping');
  assert.equal(s.room().ctx.autoResponse.response, 'pong');
  const impostor = await s.open();
  await s.send(impostor, { type: 'auth', role: 'host', key: WRONG_KEY, listenKey: LISTEN_KEY });
  assert.equal(impostor.closed.code, 4403);
  assert.equal(host.readyState, 1);
  const outsider = await s.listener(WRONG_KEY);
  assert.equal(outsider.closed.code, 4403);
});

test('listeners arriving first wait without claiming room authority', async () => {
  const s = await system(), listener = await s.listener(), uninvited = await s.listener(WRONG_KEY);
  assert.equal(last(listener).type, 'waiting');
  assert.equal(listener.deserializeAttachment().verified, false);
  assert.equal(uninvited.deserializeAttachment().verified, false);
  const host = await s.host();
  assert.equal(last(listener).type, 'ready');
  assert.equal(listener.deserializeAttachment().verified, true);
  assert.equal(uninvited.closed.code, 4403);
  assert.equal(host.messages.filter((message) => message.type === 'join').length, 1);
  await s.send(listener, { type: 'check' });
  assert.equal(last(listener).type, 'ready');
  assert.equal(host.messages.filter((message) => message.type === 'join').length, 1);
});

test('host loss parks authenticated listeners and anchors survive hibernation', async () => {
  const s = await system(), host = await s.host(), first = await s.listener();
  const oldGeneration = generation(host);
  host.close(1000, 'gone');
  s.room().instance.webSocketClose(host);
  assert.equal(first.readyState, 1);
  assert.equal(last(first).type, 'waiting');
  s.room().instance = new Broadcast(s.room().ctx, s.env);
  const second = await s.listener();
  assert.equal(second.deserializeAttachment().verified, true);
  assert.equal(last(second).type, 'waiting');
  assert.equal((await s.listener(WRONG_KEY)).closed.code, 4403);
  const resumed = await s.host();
  assert.notEqual(generation(resumed), oldGeneration);
  for (const ws of [first, second]) assert.equal(last(ws).generation, generation(resumed));
  assert.equal(resumed.messages.filter((message) => message.type === 'join').length, 2);
});

test('a replacement host retires the old socket before its late close callback', async () => {
  const s = await system(), old = await s.host(), listener = await s.listener();
  const previous = generation(old), replacement = await s.host();
  assert.equal(old.closed.code, 4409);
  assert.equal(last(old).type, 'replaced');
  assert.equal(old.deserializeAttachment(), null);
  assert.notEqual(generation(replacement), previous);
  const count = listener.messages.length;
  s.room().instance.webSocketClose(old);
  s.room().instance.webSocketError(old);
  assert.equal(listener.messages.length, count);
  assert.equal(last(listener).generation, generation(replacement));
  await s.send(listener, { type: 'answer', generation: previous, connection: CONNECTION, sdp: SDP });
  assert.deepEqual(last(listener), { type: 'error', error: 'stale' });
});

test('signals have authoritative addresses and only the host offer selects the connection', async () => {
  const s = await system(), host = await s.host(), listener = await s.listener(), other = await s.listener();
  const epoch = generation(host);
  await s.send(host, { type: 'candidate', to: id(listener), generation: epoch, connection: CONNECTION, candidate: CANDIDATE });
  assert.equal(last(listener).type, 'candidate');
  await s.send(host, offer(host, listener));
  assert.deepEqual(last(listener), { ...offer(host, listener), from: 'host' });
  assert.equal(other.messages.filter((message) => message.type === 'offer').length, 0);
  const answer = { type: 'answer', generation: epoch, connection: CONNECTION, sdp: SDP.replace('sendonly', 'recvonly') };
  await s.send(listener, answer);
  assert.deepEqual(last(host), { ...answer, from: id(listener), to: 'host' });
  const before = host.messages.length;
  await s.send(listener, { ...answer, from: id(other) });
  await s.send(listener, { ...answer, to: id(other) });
  await s.send(listener, { ...answer, type: 'offer' });
  assert.equal(host.messages.length, before);
  await s.send(host, offer(host, listener, REPLACEMENT));
  await s.send(host, { type: 'candidate', to: id(listener), generation: epoch, connection: CONNECTION, candidate: CANDIDATE });
  assert.equal(listener.deserializeAttachment().connection, REPLACEMENT);
  await s.send(listener, { ...answer, connection: REPLACEMENT });
  assert.equal(last(host).connection, REPLACEMENT);
  const stored = JSON.stringify(s.room().ctx.sockets.map((ws) => ws.deserializeAttachment()));
  assert.equal(stored.includes('m=audio'), false);
  assert.equal(stored.includes('candidate:'), false);
});

test('voice metadata excludes data channels, non-host candidates, relay requests and sender claims', async () => {
  const s = await system(), host = await s.host(), listener = await s.listener();
  const valid = offer(host, listener);
  assert.ok(validBroadcastSignal(valid, 'host'));
  for (const value of [
    { ...valid, sdp: SDP.replace('m=audio', 'm=application') },
    { ...valid, sdp: SDP + 'a=candidate:1 1 udp 1 8.8.8.8 12345 typ srflx\r\n' },
    { ...valid, sdp: SDP + 'a=candidate:1 1 udp 1 192.168.1.2 12345 typ relay\r\n' },
    { ...valid, sdp: 'x'.repeat(32769) },
    { ...valid, from: 'listener' },
    { ...valid, to: 'host' },
    { type: 'candidate', to: id(listener), generation: generation(host), connection: CONNECTION,
      candidate: { ...CANDIDATE, candidate: CANDIDATE.candidate.replace('typ host', 'typ prflx') } },
    { type: 'relay', generation: generation(host), connection: CONNECTION, to: id(listener) },
  ]) {
    assert.equal(validBroadcastSignal(value, 'host'), null);
    const before = listener.messages.length;
    await s.send(host, value);
    assert.equal(listener.messages.length, before);
  }
  for (const address of ['192.168.1.2', '10.0.0.2', '127.0.0.1', '169.254.1.2', 'fd00::2', 'fe80::2', '::1', 'peer.local', '8.8.8.8', '2606:4700::1111']) {
    assert.ok(validBroadcastSignal({ type: 'candidate', to: id(listener), generation: generation(host), connection: CONNECTION,
      candidate: { ...CANDIDATE, candidate: CANDIDATE.candidate.replace('peer.local', address) } }, 'host'), address);
  }
  assert.ok(validBroadcastSignal({ ...valid, sdp: SDP + 'a=candidate:1 1 udp 1 2606:4700::1111 12345 typ host\r\n' }, 'host'));
  for (const address of ['1.2.3.999', '001.2.3.4', 'peer..local', '-peer.local', 'not-an-address', '2001:::1']) {
    assert.equal(validBroadcastSignal({ type: 'candidate', to: id(listener), generation: generation(host), connection: CONNECTION,
      candidate: { ...CANDIDATE, candidate: CANDIDATE.candidate.replace('peer.local', address) } }, 'host'), null, address);
  }
});

test('only the host changes talking or ends the broadcast and ended anchors stop retries', async () => {
  const s = await system(), host = await s.host(), listener = await s.listener(), epoch = generation(host);
  await s.send(listener, { type: 'status', generation: epoch, talking: true });
  assert.equal(host.deserializeAttachment().talking, false);
  await s.send(host, { type: 'status', generation: epoch, talking: true });
  assert.deepEqual(last(listener), { type: 'status', generation: epoch, talking: true });
  await s.send(listener, { type: 'end', generation: epoch });
  assert.equal(host.deserializeAttachment().ended, false);
  await s.send(host, { type: 'end', generation: epoch });
  assert.equal(last(listener).type, 'ended');
  host.close(1000, 'ended');
  s.room().instance.webSocketClose(host);
  await s.send(listener, { type: 'check' });
  assert.equal(last(listener).type, 'ended');
  assert.equal((await s.listener()).messages.at(-1).type, 'ended');
});

test('manual leave and failed sends release capacity and notify the current host once', async () => {
  const s = await system(), host = await s.host(), listener = await s.listener();
  const listenerId = id(listener);
  await s.send(listener, { type: 'leave' });
  assert.equal(listener.closed.code, 1000);
  assert.deepEqual(last(host), { type: 'leave', id: listenerId, generation: generation(host) });
  const count = host.messages.length;
  s.room().instance.webSocketError(listener);
  assert.equal(host.messages.length, count);
  const broken = await s.listener();
  broken.failSend = true;
  await s.send(host, { type: 'status', generation: generation(host), talking: true });
  assert.equal(broken.deserializeAttachment(), null);
  assert.equal(last(host).type, 'leave');
});

test('listener and pending limits reserve room for a genuine host and expire silent handshakes', async (t) => {
  let now = 1000;
  t.mock.method(Date, 'now', () => now);
  const s = await system();
  const pending = [];
  for (let i = 0; i < 4; i += 1) pending.push(await s.open());
  assert.equal((await s.open()).closed.code, 4429);
  now += 8001;
  const available = await s.open();
  assert.equal(available.readyState, 1);
  for (const ws of pending) assert.equal(ws.closed.code, 4408);
  available.close(1000, 'not used');
  s.room().instance.webSocketClose(available);
  for (let i = 0; i < 10; i += 1) await s.listener(WRONG_KEY);
  assert.equal((await s.listener()).closed.code, 4429);
  const host = await s.host();
  assert.equal(host.readyState, 1);
  assert.equal(s.room().instance.sockets('listener').length, 0);
  assert.equal((await s.listener()).messages.at(-1).type, 'ready');
});

test('auth cannot revive a retired socket after its asynchronous digest finishes', async (t) => {
  const s = await system(), ws = await s.open();
  const digest = crypto.subtle.digest.bind(crypto.subtle);
  let release, reached;
  const waiting = new Promise((resolve) => { release = resolve; });
  const started = new Promise((resolve) => { reached = resolve; });
  t.mock.method(crypto.subtle, 'digest', async (algorithm, bytes) => {
    if (new TextDecoder().decode(bytes) === HOST_KEY) { reached(); await waiting; }
    return digest(algorithm, bytes);
  });
  const auth = s.send(ws, { type: 'auth', role: 'host', key: HOST_KEY, listenKey: LISTEN_KEY });
  await started;
  await s.send(ws, { type: 'auth', role: 'host', key: HOST_KEY, listenKey: LISTEN_KEY });
  assert.equal(ws.closed.code, 4400);
  release();
  await auth;
  assert.equal(ws.deserializeAttachment(), null);
  assert.equal(s.room().instance.host(), null);
});

test('invalid frames and update bursts are bounded without payload logs or storage', async () => {
  for (const value of ['{', 'null', '[]', 'x'.repeat(65537), new ArrayBuffer(1)]) {
    const s = await system(), ws = await s.open();
    await s.room().instance.webSocketMessage(ws, value);
    assert.equal(ws.closed.code, 4400);
    assert.equal(ws.deserializeAttachment(), null);
  }
  const s = await system(), listener = await s.listener();
  for (let i = 0; i < 120; i += 1) await s.send(listener, { type: 'check' });
  await s.send(listener, { type: 'check' });
  assert.equal(listener.closed.code, 4429);
  assert.equal(last(listener).error, 'busy');
});
