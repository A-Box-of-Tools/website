/**
 * Admission, discovery and moderation use socket attachments, including while
 * the host reconnects. The harness rejects storage writes and oversized
 * attachments, so tests exercise the same bounded state the platform retains.
 */
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';

test('unnamed callers retain password admission and session moderation across reconnection', async () => {
  const s = await system(), host = await s.host(PASSWORD);
  const connect = async (passwordProof = PASSWORD) => {
    const ws = await s.open();
    await s.send(ws, { type: 'auth', role: 'sender', key: key(0), passwordProof });
    return ws;
  };
  const denied = await connect(WRONG);
  assert.deepEqual(last(denied), { type: 'error', error: 'password' });
  assert.equal(denied.closed.code, 4403);
  assert.equal(host.messages.some(frame => frame.type === 'join'), false);
  const first = await connect(), id = await broadcastCode(key(0));
  assert.equal(state(first).id, id);
  assert.equal(state(first).name, '');
  assert.deepEqual(last(host), { type: 'join', id, generation: state(host).generation,
    name: '', muted: false, talking: false });
  await s.moderate(host, first, true);
  const resumed = await connect();
  assert.equal(state(resumed).id, id);
  assert.equal(last(resumed).muted, true);
  assert.equal(first.closed.code, 4409);
  await s.kick(host, resumed);
  const blocked = await connect();
  assert.equal(last(blocked).type, 'kicked');
  assert.equal(blocked.closed.code, 4403);
});

test('anonymous sender authentication does not relax pager names or extra-field validation', async () => {
  const s = await system();
  for (const frame of [
    { type: 'auth', role: 'host', key: HOST_KEY, passwordProof: null },
    { type: 'auth', role: 'host', key: HOST_KEY, roomName: '', passwordProof: null },
    { type: 'auth', role: 'sender', key: key(0), passwordProof: null, extra: true },
    { type: 'auth', role: 'sender', key: key(0), passwordProof: null, name: '' },
  ]) {
    const ws = await s.open();
    await s.send(ws, frame);
    assert.deepEqual(last(ws), { type: 'error', error: 'invalid' });
    assert.equal(ws.closed.code, 4400);
  }
});
import worker, { Discovery, Inbox } from '../../workers/rendezvous/worker.js';
import { broadcastCode } from '../../workers/rendezvous/broadcast.js';
import { validInboxSignal } from '../../workers/rendezvous/inbox.js';
import { DISCOVERY_SCOPE_HEADER, discoveryScope } from '../../workers/rendezvous/discovery.js';

const NativeResponse = globalThis.Response;
const NativePair = globalThis.WebSocketPair;
const NativeAutoPair = globalThis.WebSocketRequestResponsePair;
const HOST_KEY = 'A'.repeat(43), PASSWORD = 'P'.repeat(43), WRONG = 'W'.repeat(43);
const CONNECTION = '00000000-0000-4000-8000-000000000001';
const REPLACEMENT = '00000000-0000-4000-8000-000000000002';
const SDP = 'v=0\r\no=- 1 1 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n'
  + 'm=audio 9 UDP/TLS/RTP/SAVPF 111\r\nc=IN IP4 0.0.0.0\r\na=recvonly\r\n';
const CANDIDATE = { candidate: 'candidate:1 1 udp 2122260223 peer.local 12345 typ host generation 0 ufrag Abcd',
  sdpMid: '0', sdpMLineIndex: 0, usernameFragment: 'Abcd' };
const key = (i) => 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_-'[i].repeat(43);
const last = (ws) => ws.messages.at(-1);
const state = (ws) => ws.deserializeAttachment();

class Socket {
  constructor() { this.readyState = 0; this.messages = []; this.attachment = null; this.tags = []; }
  accept() { this.readyState = 1; }
  close(code, reason) { this.readyState = 3; this.closed = { code, reason }; }
  send(value) {
    if (this.readyState !== 1 || this.failSend) throw new Error('closed');
    this.messages.push(JSON.parse(value));
  }
  serializeAttachment(value) {
    assert.ok(new TextEncoder().encode(JSON.stringify(value)).length <= 2048, 'platform attachment limit');
    this.attachment = structuredClone(value);
  }
  deserializeAttachment() { return structuredClone(this.attachment); }
}

class Context {
  constructor() { this.sockets = []; this.tasks = []; }
  get storage() { throw new Error('incoming voice must not use durable storage'); }
  setWebSocketAutoResponse(value) { this.autoResponse = value; }
  acceptWebSocket(ws, tags) { ws.accept(); ws.tags = tags; this.sockets.push(ws); }
  getWebSockets(tag) {
    return this.sockets.filter((ws) => ws.readyState === 1 && (tag === undefined || ws.tags.includes(tag)));
  }
  waitUntil(task) { this.tasks.push(task); }
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
  const code = await broadcastCode(HOST_KEY), rooms = new Map(), discoveries = new Map(), calls = [], limits = [];
  const binding = (store, Class) => ({
    idFromName: (name) => name,
    get: (name) => ({ fetch: async (input, init) => {
      const request = input instanceof Request ? input : new Request(input, init);
      calls.push({ name, Class, request });
      if (!store.has(name)) {
        const ctx = new Context();
        store.set(name, { ctx, instance: new Class(ctx, env) });
      }
      return store.get(name).instance.fetch(request);
    } }),
  });
  const env = {
    LIMIT: { limit: async ({ key: address }) => { limits.push(address); return { success: allow }; } },
    INBOXES: binding(rooms, Inbox), DISCOVERY: binding(discoveries, Discovery),
    ROOMS: { get() { throw new Error('inbox must not use text rooms'); } },
    BROADCASTS: { get() { throw new Error('inbox must not use broadcasts'); } },
  };
  const request = (path = `/inbox/${code}`, extra = {}) => new Request(`https://rendezvous.abox.tools${path}`, {
    headers: { Upgrade: 'websocket', Origin: 'https://abox.tools', 'CF-Connecting-IP': '1.2.3.4', ...extra },
  });
  const open = async () => {
    const response = await worker.fetch(request(), env);
    assert.equal(response.status, 101);
    return response.webSocket.peer;
  };
  const room = () => rooms.get(code);
  const send = (ws, value) => room().instance.webSocketMessage(ws, typeof value === 'string' ? value : JSON.stringify(value));
  const host = async (passwordProof = null, roomName = 'Desk') => {
    const ws = await open();
    await send(ws, { type: 'auth', role: 'host', key: HOST_KEY, roomName, passwordProof });
    return ws;
  };
  const sender = async (i = 0, passwordProof = null, name = `Guest ${i}`) => {
    const ws = await open();
    await send(ws, { type: 'auth', role: 'sender', key: key(i), name, passwordProof });
    return ws;
  };
  const discover = async () => {
    const response = await worker.fetch(request('/discover?tool=voice-oncall'), env);
    assert.equal(response.status, 101);
    return response.webSocket.peer;
  };
  const directory = () => [...discoveries.values()][0];
  const publish = async (observer, publication) => directory().instance.webSocketMessage(observer, JSON.stringify({ publish: publication }));
  const moderate = (hostSocket, senderSocket, muted) => send(hostSocket, {
    type: 'moderate', to: state(senderSocket).id, generation: state(hostSocket).generation, muted,
  });
  const kick = (hostSocket, senderSocket) => send(hostSocket, {
    type: 'kick', to: state(senderSocket).id, generation: state(hostSocket).generation,
  });
  return { code, env, calls, limits, request, open, room, send, host, sender, discover, directory, publish, moderate, kick };
}

const offer = (host, sender, connection = CONNECTION) => ({
  type: 'offer', generation: state(host).generation, connection, to: state(sender).id, sdp: SDP,
});

test('relay pager keeps password admission, individual moderation and a pinned route after host loss', async () => {
  const s = await system(), host = await s.open();
  const hostAuth = { type: 'auth', role: 'host', key: HOST_KEY, roomName: 'Desk', passwordProof: PASSWORD, transport: 'relay' };
  await s.send(host, hostAuth);
  assert.equal(last(host).transport, 'relay');
  const connect = async (passwordProof, transport = 'relay') => {
    const ws = await s.open();
    await s.send(ws, { type: 'auth', role: 'sender', key: key(0), passwordProof, transport });
    return ws;
  };
  assert.equal(last(await connect(WRONG)).error, 'password');
  assert.equal(last(await connect(PASSWORD, 'direct')).error, 'transport-mismatch');
  const sender = await connect(PASSWORD);
  assert.equal(last(sender).transport, 'relay');
  const relay = { ...CANDIDATE, candidate: 'candidate:1 1 udp 1 198.51.100.5 12345 typ relay' };
  const signal = { type: 'candidate', generation: state(host).generation, connection: CONNECTION, to: state(sender).id, candidate: relay };
  await s.send(host, signal);
  assert.deepEqual(last(sender).candidate, relay);
  await s.send(host, { ...signal, candidate: CANDIDATE });
  assert.equal(last(host).error, 'invalid');
  await s.moderate(host, sender, true);
  assert.equal(last(sender).muted, true);
  s.room().instance.webSocketClose(host); host.close(1000, 'gone');
  const wrongMode = await s.host(PASSWORD);
  assert.equal(last(wrongMode).error, 'transport-mismatch');
  const resumedHost = await s.open();
  await s.send(resumedHost, hostAuth);
  assert.equal(last(sender).muted, true);
  await s.kick(resumedHost, sender);
  assert.equal(last(sender).type, 'kicked');
  assert.equal(last(await connect(PASSWORD)).type, 'kicked');
});

test('relay pager issuance requires a live verified relay participant and respects the service switch', async t => {
  const s = await system();
  s.env.TURN_KEY_ID = 'test-key'; s.env.TURN_KEY_TOKEN = 'test-token';
  let mints = 0;
  t.mock.method(globalThis, 'fetch', async () => {
    mints++;
    return new NativeResponse(JSON.stringify({ iceServers: [{ urls: ['turns:turn.example.test:443?transport=tcp'], username: 'temporary', credential: 'test' }] }));
  });
  const parked = await s.open();
  await s.send(parked, { type: 'auth', role: 'sender', key: key(0), passwordProof: PASSWORD, transport: 'relay' });
  await s.send(parked, { type: 'relay-request', id: 'parked' });
  assert.equal(last(parked).error, 'forbidden');
  assert.equal(mints, 0);
  s.env.RELAY_TOOLS = 'walkie-talkie';
  const disabled = await s.open();
  const auth = { type: 'auth', role: 'host', key: HOST_KEY, roomName: 'Desk', passwordProof: PASSWORD, transport: 'relay' };
  await s.send(disabled, auth);
  assert.equal(last(disabled).error, 'relay-unavailable');
  s.env.RELAY_TOOLS = 'voice-oncall';
  const host = await s.open(); await s.send(host, auth);
  await s.send(parked, { type: 'relay-request', id: 'admitted' });
  assert.equal(last(parked).type, 'relay-credentials');
  assert.equal(last(parked).iceServers[0].username, 'temporary');
  assert.equal(mints, 1);
  await s.send(host, { type: 'end', generation: state(host).generation });
  await s.send(parked, { type: 'relay-request', id: 'ended' });
  assert.equal(last(parked).error, 'forbidden');
  assert.equal(mints, 1);
});

test('inbox uses separate routing, trusted scope, existing origin gates and no capability URL', async () => {
  const s = await system();
  assert.equal((await worker.fetch(new Request(`https://rendezvous.abox.tools/inbox/${s.code}`), s.env)).status, 426);
  assert.equal((await worker.fetch(s.request(undefined, { Origin: 'https://example.com' }), s.env)).status, 403);
  assert.equal((await worker.fetch(s.request(`/inbox/${s.code}?key=${HOST_KEY}`), s.env)).status, 400);
  for (const path of ['/inbox/short', `/_discovery/check`, '/ws/desk?tool=voice-oncall']) {
    assert.equal((await worker.fetch(s.request(path), s.env)).status, 404);
  }
  const blocked = await system({ allow: false });
  assert.equal((await worker.fetch(blocked.request(), blocked.env)).status, 429);
  assert.equal(blocked.calls.length, 0);
  const response = await worker.fetch(s.request(undefined, { [DISCOVERY_SCOPE_HEADER]: 'forged' }), s.env);
  assert.equal(response.status, 101);
  const forwarded = s.calls.at(-1).request;
  assert.equal(forwarded.headers.get(DISCOVERY_SCOPE_HEADER), await discoveryScope(s.request(), 'voice-oncall'));
  assert.notEqual(forwarded.headers.get(DISCOVERY_SCOPE_HEADER), await discoveryScope(s.request(), 'share-text'));
  assert.equal(forwarded.url.includes(HOST_KEY), false);
  assert.deepEqual(s.limits, ['1.2.3.4']);
});

test('password rooms authenticate capabilities without storing reusable secrets', async () => {
  const s = await system(), host = await s.host(PASSWORD), sender = await s.sender(0, PASSWORD);
  assert.equal(host.messages[0].type, 'host-ready');
  assert.equal(host.messages[0].discovery.locked, true);
  assert.equal(state(sender).id, await broadcastCode(key(0)));
  assert.deepEqual(last(host), { type: 'join', id: state(sender).id, generation: state(host).generation,
    name: 'Guest 0', muted: false, talking: false });
  assert.equal(last(sender).type, 'ready');
  const stored = JSON.stringify(s.room().ctx.sockets.map(state));
  for (const raw of [HOST_KEY, PASSWORD, key(0)]) assert.equal(stored.includes(raw), false);
  const refused = await s.sender(1, WRONG);
  assert.deepEqual(last(refused), { type: 'error', error: 'password' });
  assert.equal(refused.closed.code, 4403);
  const impostor = await s.open();
  await s.send(impostor, { type: 'auth', role: 'host', key: WRONG, roomName: 'Other', passwordProof: PASSWORD });
  assert.equal(impostor.closed.code, 4403);
  assert.equal(host.readyState, 1);
  assert.equal(s.room().ctx.autoResponse.request, 'ping');
  assert.equal(s.room().ctx.autoResponse.response, 'pong');
});

test('unverified senders wait without choosing room password or blocking the genuine host', async () => {
  const s = await system(), intended = await s.sender(0, PASSWORD), outsider = await s.sender(1, WRONG);
  assert.equal(last(intended).type, 'waiting');
  assert.equal(state(intended).verified, false);
  await s.sender(2, PASSWORD);
  await s.sender(3, PASSWORD);
  assert.equal((await s.sender(4, PASSWORD)).closed.code, 4429);
  const host = await s.host(PASSWORD);
  assert.equal(host.readyState, 1);
  assert.equal(last(intended).type, 'ready');
  assert.equal(outsider.closed.code, 4403);
  assert.equal(host.messages.filter((value) => value.type === 'join').length, 3);
  await s.send(intended, { type: 'check' });
  assert.equal(host.messages.filter((value) => value.type === 'join').length, 3);
});

test('inbox SDP direction follows the audio scope without relaxing one-way media', () => {
  const scoped = (session, media) => SDP.replace('a=recvonly\r\n', media.map(value => `a=${value}\r\n`).join(''))
    .replace('m=audio', `${session.map(value => `a=${value}\r\n`).join('')}m=audio`);
  for (const transport of ['direct', 'relay']) {
    for (const role of ['host', 'sender']) {
      const expected = role === 'host' ? 'recvonly' : 'sendonly';
      const wrong = role === 'host' ? 'sendonly' : 'recvonly';
      const signal = { type: role === 'host' ? 'offer' : 'answer', generation: CONNECTION, connection: REPLACEMENT,
        ...(role === 'host' ? { to: '1'.repeat(64) } : {}) };
      const accepted = [
        [[], [expected]], [[expected], []], [['sendrecv'], [expected]],
        [['inactive'], [expected]], [[wrong], [expected]], [[expected], [expected]],
      ];
      for (const [session, media] of accepted) {
        const sdp = scoped(session, media);
        assert.equal(validInboxSignal({ ...signal, sdp }, role, transport)?.sdp, sdp,
          `${transport} ${role} accepts session=${session} audio=${media}`);
      }
      const rejected = [
        [[], []], [[], [wrong]], [['sendrecv'], []], [[wrong], []],
        [[expected], ['sendrecv']], [[expected], ['inactive']], [[expected], [wrong]],
        [[expected, expected], []], [[], [expected, expected]],
        [['sendrecv', expected], [expected]], [[expected], [expected, 'sendrecv']],
      ];
      for (const [session, media] of rejected) {
        assert.equal(validInboxSignal({ ...signal, sdp: scoped(session, media) }, role, transport), null,
          `${transport} ${role} rejects session=${session} audio=${media}`);
      }
      for (const sdp of [
        scoped(['sendrecv'], [expected]) + 'm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n',
        scoped(['sendrecv'], [expected]).replace('m=audio', 'm=video'),
        scoped(['sendrecv'], [expected]).replace('UDP/TLS/RTP/SAVPF', 'RTP/AVP'),
      ]) assert.equal(validInboxSignal({ ...signal, sdp }, role, transport), null);
    }
  }
});

test('inbox SDP direction overrides forward unchanged only between admitted participants', async () => {
  for (const transport of ['direct', 'relay']) {
    const s = await system(), host = await s.open(), sender = await s.open(), other = await s.open();
    await s.send(host, { type: 'auth', role: 'host', key: HOST_KEY, roomName: 'Desk', passwordProof: PASSWORD, transport });
    await s.send(sender, { type: 'auth', role: 'sender', key: key(0), passwordProof: PASSWORD, transport });
    await s.send(other, { type: 'auth', role: 'sender', key: key(1), passwordProof: PASSWORD, transport });
    const valid = { ...offer(host, sender), sdp: SDP.replace('m=audio', 'a=sendrecv\r\nm=audio') };
    await s.send(host, valid);
    assert.deepEqual(last(sender), { ...valid, from: 'host' });
    assert.equal(other.messages.some(value => value.type === 'offer'), false);
    const answer = { type: 'answer', generation: state(host).generation, connection: CONNECTION,
      sdp: valid.sdp.replace('a=recvonly', 'a=sendonly') };
    await s.send(sender, answer);
    assert.deepEqual(last(host), { ...answer, from: state(sender).id, to: 'host' });
    const hostCount = host.messages.length;
    await s.send(other, answer);
    assert.deepEqual(last(other), { type: 'error', error: 'stale' });
    assert.equal(host.messages.length, hostCount);
    await s.send(sender, { ...answer, from: state(other).id });
    assert.deepEqual(last(sender), { type: 'error', error: 'invalid' });
    assert.equal(host.messages.length, hostCount);
  }
});

test('signals admit only inbound audio and cannot claim another participant identity', async () => {
  const s = await system(), host = await s.host(), sender = await s.sender(), other = await s.sender(1);
  const valid = offer(host, sender), epoch = state(host).generation;
  assert.ok(validInboxSignal(valid, 'host'));
  await s.send(host, { type: 'candidate', to: state(sender).id, generation: epoch, connection: CONNECTION, candidate: CANDIDATE });
  await s.send(host, valid);
  assert.deepEqual(last(sender), { ...valid, from: 'host' });
  assert.equal(other.messages.filter((value) => value.type === 'offer').length, 0);
  const answer = { type: 'answer', generation: epoch, connection: CONNECTION, sdp: SDP.replace('recvonly', 'sendonly') };
  await s.send(sender, answer);
  assert.deepEqual(last(host), { ...answer, from: state(sender).id, to: 'host' });
  const count = host.messages.length;
  for (const invalid of [{ ...answer, from: state(other).id }, { ...answer, to: 'host' },
    { ...answer, sdp: SDP }, { ...answer, type: 'offer' }]) await s.send(sender, invalid);
  assert.equal(host.messages.length, count);
  for (const invalid of [
    { ...valid, sdp: SDP.replace('recvonly', 'sendrecv') },
    { ...valid, sdp: SDP.replace('m=audio', 'm=application') },
    { ...valid, sdp: SDP + 'a=candidate:1 1 udp 1 8.8.8.8 12345 typ srflx\r\n' },
    { ...valid, from: 'host' },
    { type: 'candidate', to: state(sender).id, generation: epoch, connection: CONNECTION,
      candidate: { ...CANDIDATE, candidate: CANDIDATE.candidate.replace('typ host', 'typ relay') } },
  ]) assert.equal(validInboxSignal(invalid, 'host'), null);
  await s.send(host, offer(host, sender, REPLACEMENT));
  await s.send(sender, answer);
  assert.deepEqual(last(sender), { type: 'error', error: 'stale' });
  await s.send(sender, { ...answer, connection: REPLACEMENT });
  assert.equal(last(host).connection, REPLACEMENT);
  const stored = JSON.stringify(s.room().ctx.sockets.map(state));
  assert.equal(stored.includes('m=audio'), false);
  assert.equal(stored.includes('candidate:'), false);
});

test('only the host moderates, muted speaking reports are suppressed, and unmute frees remembered state', async () => {
  const s = await system(), host = await s.host(), sender = await s.sender(), epoch = state(host).generation;
  await s.send(sender, { type: 'moderate', to: state(sender).id, generation: epoch, muted: true });
  assert.equal(state(sender).muted, false);
  await s.send(sender, { type: 'status', generation: epoch, talking: true });
  assert.deepEqual(last(host), { type: 'status', id: state(sender).id, generation: epoch, talking: true });
  await s.moderate(host, sender, true);
  assert.deepEqual(last(sender), { type: 'moderated', generation: epoch, muted: true });
  assert.deepEqual(last(host), { type: 'moderated', id: state(sender).id, generation: epoch, muted: true });
  await s.send(sender, { type: 'status', generation: epoch, talking: true });
  assert.equal(last(host).talking, false);
  assert.equal(state(sender).talking, false);
  assert.equal(state(host).moderation.length, 1);
  await s.moderate(host, sender, false);
  assert.equal(state(host).moderation.length, 0);
  assert.equal(state(sender).muted, false);
});

test('stable identities replace signaling sockets without a late leave and receive a new offer authority', async () => {
  const s = await system(), host = await s.host(), first = await s.sender();
  const id = state(first).id;
  await s.send(host, offer(host, first));
  const next = await s.sender(0, null, 'Renamed');
  assert.equal(state(next).id, id);
  assert.equal(state(next).connection, null);
  assert.equal(first.closed.code, 4409);
  assert.equal(last(host).name, 'Renamed');
  const count = host.messages.length;
  s.room().instance.webSocketClose(first);
  s.room().instance.webSocketError(first);
  assert.equal(host.messages.length, count);
  await s.send(next, { type: 'answer', generation: state(host).generation, connection: CONNECTION,
    sdp: SDP.replace('recvonly', 'sendonly') });
  assert.deepEqual(last(next), { type: 'error', error: 'stale' });
});

test('password, mute and kick anchors survive host loss and hibernation without host configuration drift', async () => {
  const s = await system(), host = await s.host(PASSWORD, 'Original'), muted = await s.sender(0, PASSWORD);
  const removed = await s.sender(1, PASSWORD), keeper = await s.sender(2, PASSWORD), previous = state(host).generation;
  await s.moderate(host, muted, true);
  await s.kick(host, removed);
  assert.equal(last(removed).type, 'kicked');
  assert.equal(removed.closed.code, 4403);
  host.close(1000, 'gone');
  s.room().instance.webSocketClose(host);
  assert.equal(last(keeper).type, 'waiting');
  s.room().instance = new Inbox(s.room().ctx, s.env);
  assert.equal((await s.sender(3, WRONG)).closed.code, 4403);
  assert.equal((await s.sender(1, PASSWORD)).messages.at(-1).type, 'kicked');
  const resumed = await s.host(null, 'Attempted change');
  assert.notEqual(state(resumed).generation, previous);
  assert.equal(state(resumed).name, 'Original');
  assert.equal(state(resumed).passwordHash, await broadcastCode(PASSWORD));
  assert.equal(last(muted).muted, true);
  assert.equal(last(muted).generation, state(resumed).generation);
  assert.equal(resumed.messages.filter((value) => value.type === 'join').length, 2);
  await s.send(muted, { type: 'status', generation: previous, talking: true });
  assert.deepEqual(last(muted), { type: 'error', error: 'stale' });
});

test('live host replacement retires the old lease before its eventual close callback', async () => {
  const s = await system(), old = await s.host(PASSWORD, 'Original'), sender = await s.sender(0, PASSWORD);
  const oldGeneration = state(old).generation, replacement = await s.host(null, 'Changed');
  assert.equal(old.closed.code, 4409);
  assert.equal(state(old), null);
  assert.notEqual(state(replacement).generation, oldGeneration);
  assert.equal(state(replacement).name, 'Original');
  assert.equal(last(sender).generation, state(replacement).generation);
  const count = sender.messages.length, tasks = s.room().ctx.tasks.length;
  s.room().instance.webSocketClose(old);
  assert.equal(sender.messages.length, count);
  assert.equal(s.room().ctx.tasks.length, tasks);
});

test('end authority leaves terminal anchors while unauthorized senders cannot end the room', async () => {
  const s = await system(), host = await s.host(), sender = await s.sender(), epoch = state(host).generation;
  await s.send(sender, { type: 'end', generation: epoch });
  assert.equal(state(host).ended, false);
  await s.send(host, { type: 'end', generation: epoch });
  assert.equal(last(sender).type, 'ended');
  host.close(1000, 'ended');
  s.room().instance.webSocketClose(host);
  s.room().instance = new Inbox(s.room().ctx, s.env);
  await s.send(sender, { type: 'check' });
  assert.equal(last(sender).type, 'ended');
  assert.equal((await s.sender(1)).messages.at(-1).type, 'ended');
  assert.equal((await s.host()).messages.at(-1).type, 'ended');
});

test('moderation history and worst-case Unicode attachments stay bounded and unmute releases capacity', async () => {
  const s = await system(), host = await s.host(PASSWORD, '界'.repeat(80));
  const keeper = await s.sender(40, PASSWORD, '界'.repeat(64));
  for (let i = 0; i < 24; i += 1) {
    const participant = await s.sender(i, PASSWORD, '界'.repeat(64));
    await s.moderate(host, participant, true);
    assert.equal(last(host).type, 'moderated');
    await s.send(participant, { type: 'leave' });
  }
  assert.equal(state(host).moderation.length, 24);
  const next = await s.sender(25, PASSWORD);
  await s.moderate(host, next, true);
  assert.deepEqual(last(host), { type: 'error', error: 'moderation-full' });
  assert.equal(host.readyState, 1);
  assert.equal(state(next).muted, false);
  const previous = await s.sender(0, PASSWORD);
  assert.equal(last(previous).muted, true);
  await s.moderate(host, previous, false);
  await s.moderate(host, next, true);
  assert.equal(last(host).type, 'moderated');
  assert.equal(state(host).moderation.length, 24);
  assert.equal(state(keeper).anchor.moderation.length, 24);
});

test('full kick history refuses removal without changing authoritative membership', async () => {
  const s = await system(), host = await s.host(PASSWORD), keeper = await s.sender(40, PASSWORD);
  for (let i = 0; i < 24; i += 1) {
    const participant = await s.sender(i, PASSWORD);
    await s.kick(host, participant);
    assert.equal(last(participant).type, 'kicked');
    assert.equal(participant.closed.code, 4403);
  }
  assert.equal(state(host).moderation.length, 24);
  const next = await s.sender(25, PASSWORD), participantId = state(next).id;
  const messages = next.messages.length;
  await s.kick(host, next);
  assert.deepEqual(last(host), { type: 'error', error: 'moderation-full' });
  assert.equal(next.readyState, 1);
  assert.equal(next.messages.length, messages);
  assert.equal(state(next).verified, true);
  assert.equal(state(next).muted, false);
  assert.equal(state(host).moderation.length, 24);
  assert.deepEqual(s.room().instance.sockets('sender').map((ws) => state(ws).id).sort(),
    [state(keeper).id, participantId].sort());
  // A UI's immediate local silence is separate from server admission. No
  // acknowledgement may pretend that this refused kick released a room slot.
  await s.send(next, { type: 'status', generation: state(host).generation, talking: true });
  assert.deepEqual(last(host), { type: 'status', id: participantId,
    generation: state(host).generation, talking: true });
  const rememberedId = await broadcastCode(key(0));
  await s.send(host, { type: 'moderate', to: rememberedId,
    generation: state(host).generation, muted: false });
  assert.deepEqual(last(host), { type: 'error', error: 'stale' });
  assert.equal(state(host).moderation.length, 24);
  assert.equal((await s.sender(0, PASSWORD)).messages.at(-1).type, 'kicked');
});

test('voice discovery publishes only verified host metadata and refresh removes stale advertisements', async () => {
  const s = await system(), host = await s.host(PASSWORD, 'Actual room'), observer = await s.discover();
  const publication = host.messages[0].discovery;
  await s.publish(observer, { ...publication, name: 'Spoofed', locked: false });
  assert.deepEqual(last(observer), { type: 'shares', tool: 'voice-oncall', list: [
    { code: s.code, local: true, name: 'Actual room', locked: true },
  ] });
  const listed = JSON.stringify(last(observer));
  assert.equal(listed.includes(PASSWORD), false);
  assert.equal(listed.includes('passwordHash'), false);
  const invalid = await s.discover();
  await s.publish(invalid, { code: s.code, lease: 'x'.repeat(36), name: 'Forged', locked: false });
  assert.equal(state(invalid).publication, null);
  host.serializeAttachment(null);
  host.close(1000, 'missed-withdrawal');
  await s.directory().instance.webSocketMessage(observer, JSON.stringify({ refresh: true }));
  assert.deepEqual(last(observer).list, []);
});

test('old withdrawals cannot erase a new host lease and private checks reject forged scope', async () => {
  const s = await system(), old = await s.host(), observer = await s.discover();
  const publication = old.messages[0].discovery;
  await s.publish(observer, publication);
  const replacement = await s.host(), next = replacement.messages[0].discovery;
  await s.publish(observer, next);
  await Promise.all(s.room().ctx.tasks);
  assert.equal(last(observer).list.length, 1);
  const scope = state(replacement).scope;
  const request = (claim) => new Request('https://room.internal/_discovery/check', {
    method: 'POST', body: JSON.stringify(claim),
  });
  const good = { code: s.code, lease: next.lease, scope, tool: 'voice-oncall' };
  const result = await s.room().instance.fetch(request(good));
  assert.equal(result.status, 200);
  assert.deepEqual(await result.json(), { name: 'Desk', locked: false });
  assert.equal((await s.room().instance.fetch(request({ ...good, scope: '0'.repeat(64) }))).status, 403);
  assert.equal((await s.room().instance.fetch(request({ ...good, name: 'Spoofed' }))).status, 400);
  assert.equal((await s.room().instance.fetch(request({ ...good, lease: publication.lease }))).status, 403);
});

test('admitted and pending limits, auth deadlines, malformed frames and update bursts are bounded', async (t) => {
  let now = 1000;
  t.mock.method(Date, 'now', () => now);
  const s = await system(), pending = [];
  for (let i = 0; i < 4; i += 1) pending.push(await s.open());
  assert.equal((await s.open()).closed.code, 4429);
  now += 8001;
  const available = await s.open();
  for (const ws of pending) assert.equal(ws.closed.code, 4408);
  await s.send(available, 'null');
  assert.equal(available.closed.code, 4400);
  const host = await s.host();
  for (let i = 0; i < 10; i += 1) await s.sender(i);
  assert.equal((await s.sender(11)).closed.code, 4429);
  assert.equal(host.readyState, 1);
  const sender = s.room().instance.sockets('sender')[0];
  await s.send(sender, { type: 'leave' });
  const admitted = await s.sender(12);
  assert.equal(last(admitted).type, 'ready');
  for (let i = 0; i < 120; i += 1) await s.send(admitted, { type: 'check' });
  assert.equal(admitted.readyState, 1);
  await s.send(admitted, { type: 'check' });
  assert.equal(admitted.closed.code, 4429);
  assert.equal(last(admitted).error, 'busy');
  for (const value of ['{', '[]', 'x'.repeat(65537), new ArrayBuffer(1)]) {
    const ws = await s.open();
    await s.room().instance.webSocketMessage(ws, value);
    assert.equal(ws.closed.code, 4400);
  }
});

test('asynchronous auth cannot revive a retired socket and failed delivery releases admitted capacity', async (t) => {
  const s = await system(), ws = await s.open(), digest = crypto.subtle.digest.bind(crypto.subtle);
  let release, reached;
  const wait = new Promise((resolve) => { release = resolve; });
  const started = new Promise((resolve) => { reached = resolve; });
  t.mock.method(crypto.subtle, 'digest', async (algorithm, input) => {
    if (new TextDecoder().decode(input) === HOST_KEY) { reached(); await wait; }
    return digest(algorithm, input);
  });
  const authenticating = s.send(ws, { type: 'auth', role: 'host', key: HOST_KEY, roomName: 'Desk', passwordProof: null });
  await started;
  await s.send(ws, { type: 'auth', role: 'host', key: HOST_KEY, roomName: 'Desk', passwordProof: null });
  assert.equal(ws.closed.code, 4400);
  release();
  await authenticating;
  assert.equal(state(ws), null);
  const host = await s.host(), sender = await s.sender();
  sender.failSend = true;
  await s.moderate(host, sender, true);
  assert.equal(state(sender), null);
  assert.equal(host.messages.some((value) => value.type === 'leave'), true);
});
