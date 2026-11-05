/**
 * A text, tab or camera room's own promises: how many frames one socket may
 * spend, who may hold its name, and what its host hears of a reader who has not
 * chosen to connect. Runtime-shaped sockets stand in for hibernation, and a new
 * Room over the same context is what waking up looks like. Storage is unavailable
 * here, so the name a lost host keeps can only ever be in memory.
 */

import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import worker, { Room } from '../../workers/rendezvous/worker.js';
import { broadcastCode } from '../../workers/rendezvous/broadcast.js';
import { DISCOVERY_SCOPE_HEADER } from '../../workers/rendezvous/discovery.js';
import { completeRefusal } from '../../workers/rendezvous/refusal.js';

const NativeResponse = globalThis.Response;
const nativePair = globalThis.WebSocketPair;
const nativeAutoPair = globalThis.WebSocketRequestResponsePair;
const CODE = 'brave-otter-42';
const KEY = 'K'.repeat(43), OTHER_KEY = 'O'.repeat(43);
const SCOPE = 'a'.repeat(64);
const GRACE = 120000, WINDOW = 10000;
const TURN = [{ urls: ['turns:relay.example.test:443?transport=tcp'], username: 'temporary', credential: 'test' }];

class Socket {
  constructor() { this.readyState = 0; this.messages = []; this.attachment = null; this.tags = []; }
  accept() { this.readyState = 1; }
  close(code, reason) { this.readyState = 3; this.closed = { code, reason }; }
  send(message) {
    if (this.readyState !== 1) throw new Error('closed socket');
    this.messages.push(JSON.parse(message));
  }
  serializeAttachment(value) {
    assert.ok(new TextEncoder().encode(JSON.stringify(value)).length <= 2048, 'platform attachment limit');
    this.attachment = structuredClone(value);
  }
  deserializeAttachment() { return structuredClone(this.attachment); }
}

class Context {
  constructor() { this.sockets = []; }
  get storage() { throw new Error('a room must not write storage'); }
  setWebSocketAutoResponse(pair) { this.autoResponse = pair; }
  acceptWebSocket(ws, tags) { ws.accept(); ws.tags = tags; this.sockets.push(ws); }
  getWebSockets(tag) { return this.sockets.filter((ws) => ws.readyState === 1 && (tag === undefined || ws.tags.includes(tag))); }
  waitUntil(promise) { (this.tasks ??= []).push(promise); }
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
  if (nativePair === undefined) delete globalThis.WebSocketPair;
  else globalThis.WebSocketPair = nativePair;
  if (nativeAutoPair === undefined) delete globalThis.WebSocketRequestResponsePair;
  else globalThis.WebSocketRequestResponsePair = nativeAutoPair;
});

async function system(extraEnv = {}) {
  const ctx = new Context(), withdrawals = [];
  const env = { DISCOVERY: {
    idFromName: (scope) => scope,
    get: () => ({ fetch: async (url, init) => { withdrawals.push(JSON.parse(init.body)); return new NativeResponse(null, { status: 204 }); } }),
  }, ...extraEnv };
  const s = { ctx, env, withdrawals, room: new Room(ctx, env), digest: await broadcastCode(KEY), otherDigest: await broadcastCode(OTHER_KEY) };
  s.open = async (query, headers = {}) => {
    const response = completeRefusal(await s.room.fetch(new Request(`https://room.internal/ws/${CODE}?${query}`, { headers: { Upgrade: 'websocket', ...headers } })));
    assert.equal(response.status, 101);
    return response.webSocket.peer;
  };
  s.host = (holder = s.digest, extra = '') => s.open(`role=host${holder ? `&holder=${holder}` : ''}${extra}`);
  s.viewer = (extra = '') => s.open(`role=viewer${extra}`);
  s.send = (ws, value) => s.room.webSocketMessage(ws, typeof value === 'object' && !(value instanceof ArrayBuffer) ? JSON.stringify(value) : value);
  s.lose = (ws) => { ws.readyState = 3; s.room.webSocketClose(ws, 1006, '', false); };
  s.leave = (ws) => { ws.readyState = 3; s.room.webSocketClose(ws, 1001, '', true); };
  s.wake = () => { s.room = new Room(ctx, env); };
  return s;
}

const clock = (t, start = 1000000) => {
  const time = { now: start };
  t.mock.method(Date, 'now', () => time.now);
  return time;
};
const hosting = (ws) => ws.deserializeAttachment()?.role === 'host';
const prove = (s, ws, key = KEY) => s.send(ws, { type: 'host-proof', key });

// How soon a page hears a refusal depends on which side closes it, and only a real
// runtime can show the timing (see refusal.js). What this holds is the shape that
// produces it: the object answers without taking a socket, for every door refusal.
test('a refusal at the door is decided by the object and closed outside it', async () => {
  const s = await system({ RELAY_TOOLS: '' });
  const knock = async (query, code, reason) => {
    const held = s.ctx.sockets.length;
    const answer = await s.room.fetch(new Request(`https://room.internal/ws/${CODE}?${query}`, { headers: { Upgrade: 'websocket' } }));
    assert.equal(answer.webSocket, undefined, query);
    assert.equal(s.ctx.sockets.length, held, query);
    const refused = completeRefusal(answer).webSocket.peer;
    assert.deepEqual(refused.closed, { code, reason }, query);
    assert.deepEqual(refused.tags, [], query);
  };
  await knock('role=viewer', 4404, 'no-host');
  await knock('role=watcher', 4400, 'bad-role');
  await knock('role=host&transport=relay', 4413, 'relay-unavailable');
  const host = await s.host(null);
  await knock('role=host', 4409, 'taken');
  await knock('role=viewer&transport=relay', 4412, 'transport-mismatch');
  for (let i = 0; i < 16; i += 1) await s.viewer();
  await knock('role=viewer', 4429, 'full');
  assert.equal(host.readyState, 1, 'the room goes on');
  assert.deepEqual(host.messages, [], 'having heard nothing of them');
});

test('the front of the Worker completes a refusal, and its private answer stops there', async () => {
  const s = await system();
  const env = {
    ROOMS: { idFromName: (name) => name, get: () => ({ fetch: (request) => s.room.fetch(request) }) },
    LIMIT: { limit: async () => ({ success: true }) },
  };
  const response = await worker.fetch(new Request(`https://rendezvous.example/ws/${CODE}?role=viewer`, {
    headers: { Upgrade: 'websocket', Origin: 'https://abox.tools', 'CF-Connecting-IP': '1.2.3.4' },
  }), env);
  assert.equal(response.status, 101);
  assert.deepEqual([...response.headers.keys()].filter((name) => name.startsWith('x-')), []);
  assert.deepEqual(response.webSocket.peer.closed, { code: 4404, reason: 'no-host' });
  assert.equal(s.ctx.sockets.length, 0);
});

test('a page that closes first is answered, and the answer changes nothing about its name', async () => {
  const s = await system(), host = await s.host(), reader = await s.viewer();
  s.leave(reader);
  assert.deepEqual(reader.closed, { code: undefined, reason: undefined }, 'a Close frame with no code goes back');
  assert.equal(host.readyState, 1);
  s.lose(host);
  assert.equal((await s.host(s.otherDigest)).closed?.code, 4409, 'a lost host keeps its name');
  const clean = await system(), left = await clean.host();
  clean.leave(left);
  assert.equal(hosting(await clean.host(clean.otherDigest)), true, 'a clean close frees it at once');
});

test('a reply to a reader who has just closed goes nowhere and costs the host nothing', async () => {
  const s = await system(), host = await s.host(null), reader = await s.viewer();
  reader.send = () => { throw new TypeError("Can't call WebSocket send() after close()."); };
  await s.send(host, { to: reader.deserializeAttachment().id, data: { sdp: 'answer' } });
  assert.equal(host.readyState, 1);
  assert.equal(hosting(host), true);
});

test('readers hear host-gone in a frame just ahead of the close', async () => {
  const s = await system(), host = await s.host(), reader = await s.viewer(), stuck = await s.viewer();
  stuck.send = () => { throw new TypeError("Can't call WebSocket send() after close()."); };
  s.leave(host);
  assert.deepEqual(reader.messages, [{ type: 'ready' }, { type: 'host-gone' }]);
  assert.deepEqual(reader.closed, { code: 4410, reason: 'host-gone' });
  assert.deepEqual(stuck.closed, { code: 4410, reason: 'host-gone' }, 'a frame that cannot be sent does not cost the close');
});

test('a reader over its frame window is closed, whatever kind of frame it sent', async (t) => {
  const time = clock(t);
  for (const frame of ['{}', 'not json', '[]', 'null', new ArrayBuffer(1), 'x'.repeat(65537)]) {
    const s = await system(), host = await s.host(null), reader = await s.viewer();
    for (let i = 0; i < 120; i += 1) await s.send(reader, frame);
    assert.equal(reader.readyState, 1, String(frame).slice(0, 20));
    await s.send(reader, frame);
    assert.equal(reader.closed?.code, 4429, String(frame).slice(0, 20));
    assert.equal(reader.closed.reason, 'busy');
    assert.equal(reader.deserializeAttachment(), null);
    assert.equal(host.readyState, 1, 'one reader cannot cost the share its host');
    time.now += WINDOW;
  }
});

test('the window rolls, so a reader spending steadily is never cut off', async (t) => {
  const time = clock(t);
  const s = await system(), reader = (await s.host(null), await s.viewer());
  for (let round = 0; round < 5; round += 1) {
    for (let i = 0; i < 120; i += 1) await s.send(reader, '{}');
    time.now += WINDOW;
  }
  assert.equal(reader.readyState, 1);
});

test('a host earns its allowance from the readers it is answering, not from an empty room', async (t) => {
  clock(t);
  const empty = await system(), lonely = await empty.host(null);
  for (let i = 0; i < 120; i += 1) await empty.send(lonely, '{}');
  assert.equal(lonely.readyState, 1);
  await empty.send(lonely, '{}');
  assert.equal(lonely.closed?.code, 4429);

  const s = await system(), host = await s.host(null), readers = [];
  for (let i = 0; i < 16; i += 1) readers.push(await s.viewer());
  // A full room negotiating in the same ten seconds: an answer and a dozen
  // candidates each is 208 frames, which a flat allowance would end mid-share.
  for (const reader of readers) {
    const id = reader.deserializeAttachment().id;
    await s.send(reader, { data: { sdp: 'offer' } });
    for (let i = 0; i < 13; i += 1) await s.send(host, { to: id, data: { candidate: `c${i}` } });
  }
  assert.equal(host.readyState, 1);
  assert.ok(readers.every((reader) => reader.messages.filter((m) => m.type === 'signal').length === 13));
  for (let i = 208; i < 120 * 16; i += 1) await s.send(host, '{}');
  assert.equal(host.readyState, 1);
  await s.send(host, '{}');
  assert.equal(host.closed?.code, 4429);
  assert.ok(readers.every((reader) => reader.closed?.code === 4410), 'readers hear the host has gone');
});

test('keepalives never spend the window, and a socket from before it existed starts one', async (t) => {
  clock(t);
  const s = await system(), host = await s.host(null), reader = await s.viewer();
  for (let i = 0; i < 500; i += 1) await s.send(reader, 'ping');
  assert.equal(reader.deserializeAttachment().updates, 0);
  // Attachments written by the previous deployment have neither field.
  const { window: unusedWindow, updates: unusedUpdates, ...older } = reader.deserializeAttachment();
  reader.serializeAttachment(older);
  await s.send(reader, { data: { sdp: 'offer' } });
  assert.equal(reader.deserializeAttachment().updates, 1);
  assert.equal(host.messages.at(-1).type, 'signal');
});

test('a connected holder keeps the room against another claim, with or without a digest', async () => {
  const s = await system(), host = await s.host();
  assert.equal(host.deserializeAttachment().holder, s.digest);
  for (const other of [await s.host(null), await s.host(s.otherDigest)]) {
    assert.equal(other.closed?.code, 4409);
    assert.deepEqual(other.messages, [], 'another claimant is told nothing about proof');
  }
  assert.ok(hosting(host) && host.readyState === 1);
});

test('naming the digest is not holding it: only the key replaces a stale socket', async () => {
  const s = await system(), stale = await s.host(), reader = await s.viewer();
  const claimant = await s.host();
  assert.deepEqual(claimant.messages, [{ type: 'host-prove' }]);
  assert.equal(hosting(claimant), false);
  assert.ok(hosting(stale), 'still the host until proof arrives');
  await s.send(reader, { data: { sdp: 'offer' } });
  assert.equal(stale.messages.at(-1).type, 'signal', 'a waiting claimant hears nothing meant for the host');
  assert.equal(claimant.messages.length, 1);
  await prove(s, claimant, OTHER_KEY);
  assert.equal(claimant.closed?.code, 4409);
  assert.ok(hosting(stale) && stale.readyState === 1 && reader.readyState === 1);
  for (const malformed of [{ type: 'host-proof', key: 'short' }, { type: 'host-proof', key: 7 }, { type: 'host-proof' }]) {
    const guess = await s.host();
    await s.send(guess, malformed);
    assert.equal(guess.closed?.code, 4409, JSON.stringify(malformed));
  }
  const holder = await s.host();
  const generation = stale.deserializeAttachment().generation;
  await prove(s, holder);
  assert.equal(stale.closed?.code, 4409);
  assert.equal(stale.closed.reason, 'replaced');
  assert.equal(reader.closed?.code, 4410);
  assert.ok(hosting(holder));
  assert.notEqual(holder.deserializeAttachment().generation, generation);
  assert.equal(JSON.stringify(s.ctx.sockets.map((ws) => ws.deserializeAttachment())).includes(KEY), false);
  const next = await s.viewer();
  assert.deepEqual(next.messages, [{ type: 'ready' }]);
  await s.send(next, { data: { sdp: 'offer' } });
  assert.equal(holder.messages.at(-1).type, 'signal');
});

test('a claimant has a deadline, and a retrying page keeps only its newest attempt', async (t) => {
  const time = clock(t);
  const s = await system(), host = await s.host();
  const first = await s.host();
  const second = await s.host();
  assert.equal(first.closed?.code, 4408, 'the retry replaces the attempt before it');
  assert.equal(second.readyState, 1);
  const reader = await s.viewer();
  assert.equal(second.readyState, 1, 'a reader arriving does not disturb a claimant');
  assert.equal(reader.messages.at(-1).type, 'ready');
  time.now += 8001;
  await prove(s, second);
  assert.equal(second.closed?.code, 4408, 'a late proof is refused');
  assert.ok(hosting(host));
  const silent = await s.host();
  time.now += 8001;
  await s.viewer();
  assert.equal(silent.closed?.code, 4408, 'expired by the next request, with no alarm');
});

test('the host survives a claimant who hashes its way past a retirement', async (t) => {
  const s = await system(), host = await s.host(), digest = crypto.subtle.digest.bind(crypto.subtle);
  let release, reached;
  const wait = new Promise((resolve) => { release = resolve; });
  const started = new Promise((resolve) => { reached = resolve; });
  const claimant = await s.host();
  t.mock.method(crypto.subtle, 'digest', async (algorithm, input) => {
    reached(); await wait;
    return digest(algorithm, input);
  });
  const proving = prove(s, claimant);
  await started;
  await s.send(claimant, { type: 'host-proof', key: KEY });
  const retry = await s.host();
  assert.equal(claimant.closed?.code, 4408);
  release();
  await proving;
  assert.ok(hosting(host) && host.readyState === 1, 'a retired claimant installs nothing');
  assert.equal(hosting(retry), false);
});

test('a connection lost without closing keeps the name for its holder', async (t) => {
  const time = clock(t);
  const s = await system(), host = await s.host();
  s.lose(host);
  assert.equal(host.deserializeAttachment(), null);
  for (let elapsed = 0; elapsed < GRACE - 10000; elapsed += 5000) {
    for (const other of [await s.host(null), await s.host(s.otherDigest)]) assert.equal(other.closed?.code, 4409);
    time.now += 5000;
  }
  assert.equal((await s.viewer()).closed?.code, 4404, 'nobody is hosting, and readers are told so');
  const back = await s.host();
  assert.deepEqual(back.messages, [{ type: 'host-prove' }], 'the name is not held for a digest alone');
  await s.send(back, 'not json');
  await s.send(back, {});
  assert.equal(back.readyState, 1);
  await prove(s, back);
  assert.ok(hosting(back));
  assert.deepEqual((await s.viewer()).messages, [{ type: 'ready' }]);
});

test('every way of losing a socket holds the name, and only a clean close releases it', async () => {
  const errored = await system(), first = await errored.host();
  errored.room.webSocketError(first);
  assert.equal((await errored.host(null)).closed?.code, 4409);

  const left = await system(), second = await left.host();
  left.leave(second);
  const nextUser = await left.host(null);
  assert.ok(hosting(nextUser), 'Stop, navigation and a closed tab free the name at once');

  // A cached page named no digest, so there is nothing to hold it for.
  const cached = await system(), legacy = await cached.host(null);
  cached.lose(legacy);
  assert.ok(hosting(await cached.host(null)));
});

test('the hold lapses on its own', async (t) => {
  const time = clock(t);
  const s = await system(), host = await s.host();
  s.lose(host);
  time.now += GRACE;
  const next = await s.host(s.otherDigest);
  assert.ok(hosting(next));
  // Their name is now as protected as anybody's, including from the first holder.
  const late = await s.host();
  assert.equal(late.closed?.code, 4409);
});

test('waking up keeps a live host through its attachment, and the hold never reaches storage', async () => {
  const s = await system(), host = await s.host();
  s.wake();
  assert.equal((await s.host(null)).closed?.code, 4409, 'the attachment survives hibernation');
  assert.deepEqual((await s.host()).messages, [{ type: 'host-prove' }]);
  s.lose(host);
  assert.equal((await s.host(null)).closed?.code, 4409);
  s.wake();
  assert.ok(hosting(await s.host(null)), 'storage is never used');
});

test('a host replaced mid-share withdraws its listing and gets a new lease', async () => {
  const s = await system(), headers = { [DISCOVERY_SCOPE_HEADER]: SCOPE };
  const offered = await s.open(`role=host&local=1&discover=1&holder=${s.digest}`, headers);
  const lease = offered.messages[0].discovery.lease;
  const claimant = await s.open(`role=host&local=1&discover=1&holder=${s.digest}`, headers);
  assert.deepEqual(claimant.messages, [{ type: 'host-prove' }]);
  await prove(s, claimant);
  await Promise.all(s.ctx.tasks);
  assert.deepEqual(s.withdrawals, [{ code: CODE, lease, tool: 'share-text' }]);
  const ready = claimant.messages.at(-1);
  assert.equal(ready.type, 'host-ready');
  assert.equal(ready.discovery.code, CODE);
  assert.notEqual(ready.discovery.lease, lease);
  assert.equal(claimant.deserializeAttachment().scope, SCOPE);
});

test('a relay host asking for credentials before it has proved itself is answered once seated', async (t) => {
  const s = await system({ TURN_KEY_ID: 'key', TURN_KEY_TOKEN: 'token', RELAY_TOOLS: 'share-text' });
  let mints = 0;
  t.mock.method(globalThis, 'fetch', async () => { mints += 1; return new NativeResponse(JSON.stringify({ iceServers: TURN })); });
  const stale = await s.host(s.digest, '&transport=relay');
  const claimant = await s.host(s.digest, '&transport=relay');
  await s.send(claimant, { type: 'relay-request', id: 'early' });
  assert.equal(mints, 0, 'a socket that has proved nothing mints nothing');
  assert.deepEqual(claimant.messages, [{ type: 'host-prove' }]);
  await prove(s, claimant);
  assert.equal(stale.closed?.code, 4409);
  assert.equal(mints, 1);
  assert.deepEqual(claimant.messages.map((m) => m.type), ['host-prove', 'host-ready', 'relay-credentials']);
  assert.equal(claimant.messages.at(-1).id, 'early');
  assert.deepEqual(claimant.messages.at(-1).iceServers, TURN);
  const refused = await s.host(s.digest, '&transport=relay');
  await s.send(refused, { type: 'relay-request', id: 'guessing' });
  await prove(s, refused, OTHER_KEY);
  assert.equal(refused.closed?.code, 4409);
  assert.equal(mints, 1);
});

test('the host hears nothing of a reader until that reader chooses to connect', async () => {
  const s = await system(), host = await s.host(null);
  const undecided = await s.viewer();
  assert.deepEqual(undecided.messages, [{ type: 'ready' }]);
  assert.deepEqual(host.messages, [], 'no join: opening a link must not announce the reader');
  s.leave(undecided);
  assert.deepEqual(host.messages, [], 'and no leave for somebody it never heard of');

  const decided = await s.viewer(), id = decided.deserializeAttachment().id;
  await s.send(decided, { data: { sdp: 'offer' } });
  assert.deepEqual(host.messages, [{ type: 'signal', from: id, data: { sdp: 'offer' } }]);
  s.leave(decided);
  assert.deepEqual(host.messages.at(-1), { type: 'leave', id });

  // The relay fallback and credentials answer the reader alone, before it connects.
  const asking = await s.viewer();
  await s.send(asking, { type: 'relay-request', id: 'quiet' });
  s.lose(asking);
  assert.equal(host.messages.length, 2);
});

test('the public door refuses a malformed digest rather than hosting without one', async () => {
  const asked = [], rooms = { idFromName: (name) => name, get: () => ({ fetch: async (request) => { asked.push(request.url); return new NativeResponse(null, { status: 204 }); } }) };
  const env = { ROOMS: rooms, LIMIT: { limit: async () => ({ success: true }) } };
  const door = (query) => worker.fetch(new Request(`https://rendezvous.example/ws/${CODE}?${query}`, {
    headers: { Upgrade: 'websocket', Origin: 'https://abox.tools', 'CF-Connecting-IP': '1.2.3.4' },
  }), env);
  const digest = 'a'.repeat(64);
  for (const query of [`role=host&holder=${digest.toUpperCase()}`, 'role=host&holder=short', 'role=host&holder=',
    `role=host&holder=${digest}&holder=${digest}`]) {
    assert.equal((await door(query)).status, 400, query);
  }
  assert.deepEqual(asked, []);
  assert.equal((await door(`role=host&holder=${digest}`)).status, 204);
  assert.equal((await door('role=host')).status, 204, 'a cached page sends none and is not turned away');
  assert.equal(asked.length, 2);
});
