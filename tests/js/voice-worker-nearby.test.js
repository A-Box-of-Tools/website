import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import worker, { Broadcast, Discovery } from '../../workers/rendezvous/worker.js';
import { broadcastCode } from '../../workers/rendezvous/broadcast.js';
import { DISCOVERY_SCOPE_HEADER, discoveryScope } from '../../workers/rendezvous/discovery.js';

const HOST_KEY = 'A'.repeat(43), LISTEN_KEY = 'B'.repeat(43), WRONG_KEY = 'C'.repeat(43);
const SCOPE = 'a'.repeat(64), OTHER_SCOPE = 'b'.repeat(64);
const NativeAutoPair = globalThis.WebSocketRequestResponsePair;

class Socket {
  constructor() { this.readyState = 1; this.messages = []; this.attachment = null; }
  send(message) {
    if (this.failSend || this.readyState !== 1) throw new Error('send failed');
    this.messages.push(JSON.parse(message));
  }
  close(code, reason) { this.readyState = 3; this.closed = { code, reason }; }
  serializeAttachment(value) { this.attachment = structuredClone(value); }
  deserializeAttachment() { return structuredClone(this.attachment); }
}

class Context {
  constructor() { this.sockets = []; this.tasks = []; }
  get storage() { throw new Error('nearby voice must not write durable storage'); }
  setWebSocketAutoResponse() {}
  getWebSockets(tag) { return this.sockets.filter((ws) => ws.readyState === 1 && ws.tag === tag); }
  waitUntil(task) { this.tasks.push(task); }
  async flush() { await Promise.all(this.tasks.splice(0)); }
}

before(() => { globalThis.WebSocketRequestResponsePair = class {}; });
after(() => {
  if (NativeAutoPair === undefined) delete globalThis.WebSocketRequestResponsePair;
  else globalThis.WebSocketRequestResponsePair = NativeAutoPair;
});

async function system() {
  const code = await broadcastCode(HOST_KEY), ctx = new Context(), groups = new Map(), checks = [];
  let room;
  const env = {
    BROADCASTS: { idFromName: (name) => name, get: (name) => ({ fetch: (input, init) => {
      assert.equal(name, code);
      const request = new Request(input, init);
      checks.push(request.clone());
      return room.fetch(request);
    } }) },
    DISCOVERY: { idFromName: (name) => name, get: (scope) => ({ fetch: (input, init) =>
      directory(scope).instance.fetch(new Request(input, init)) }) },
    ROOMS: { get() { throw new Error('broadcast discovery must not use text rooms'); } },
    INBOXES: { get() { throw new Error('broadcast discovery must not use inboxes'); } },
  };
  room = new Broadcast(ctx, env);
  function directory(scope = SCOPE) {
    if (!groups.has(scope)) {
      const context = new Context();
      groups.set(scope, { ctx: context, instance: new Discovery(context, env) });
    }
    return groups.get(scope);
  }
  async function host(extra = { roomName: '  Workshop  ', discover: true }, scope = SCOPE) {
    const ws = new Socket();
    ws.tag = 'broadcast';
    ws.serializeAttachment({ role: 'pending', code, scope, deadline: Date.now() + 8000,
      window: Date.now(), updates: 0 });
    ctx.sockets.push(ws);
    await send(ws, { type: 'auth', role: 'host', key: HOST_KEY, listenKey: LISTEN_KEY, ...extra });
    return ws;
  }
  function observer(scope = SCOPE) {
    const ws = new Socket();
    ws.tag = 'observer';
    ws.serializeAttachment({ scope, tool: 'walkie-talkie', generation: 0, updates: 0, publication: null });
    directory(scope).ctx.sockets.push(ws);
    return ws;
  }
  const send = (ws, value) => room.webSocketMessage(ws, JSON.stringify(value));
  const publish = (ws, value) => directory(ws.deserializeAttachment().scope).instance
    .webSocketMessage(ws, JSON.stringify({ publish: value }));
  const list = (scope = SCOPE) => JSON.parse(directory(scope).instance.snapshot()).list;
  const claim = (owner, extra = {}) => ({ ...owner.messages[0].discovery, scope: SCOPE,
    listenKey: LISTEN_KEY, ...extra });
  const check = (value) => room.fetch(new Request('https://room.internal/_discovery/check', {
    method: 'POST', body: JSON.stringify(value),
  }));
  return { code, ctx, env, room, checks, directory, host, observer, send, publish, list, claim, check };
}

const publication = (host, extra = {}) => ({ code: host.messages[0].discovery.code,
  lease: host.messages[0].discovery.lease, listenKey: LISTEN_KEY, ...extra });

test('legacy broadcast auth stays link-only and nearby auth requires an exact safe opt-in', async () => {
  const s = await system(), legacy = await s.host({});
  assert.deepEqual(Object.keys(legacy.messages[0]).sort(), ['generation', 'type']);
  assert.equal(legacy.deserializeAttachment().lease, undefined);
  for (const extra of [
    { roomName: '', discover: true }, { roomName: 'x'.repeat(81), discover: true },
    { roomName: 'bad\nname', discover: true }, { roomName: '\ud800', discover: true },
    { roomName: 'Room', discover: false }, { roomName: 'Room' },
    { roomName: 'Room', discover: true, unexpected: true },
    { roomName: 'Room', discover: true, listenKey: HOST_KEY },
  ]) {
    const invalid = await s.host(extra);
    assert.equal(invalid.closed.code, 4400);
    assert.equal(legacy.readyState, 1);
  }
  const unsupported = await s.host({ roomName: 'Room', discover: true }, null);
  assert.equal(unsupported.deserializeAttachment().role, 'host');
  assert.equal(unsupported.messages[0].discovery, null);
});

test('nearby listing exposes only verified listener authority and trusted room metadata', async () => {
  const s = await system(), host = await s.host(), observer = s.observer();
  await s.publish(observer, publication(host));
  assert.deepEqual(s.list(), [{ code: s.code, local: true, name: 'Workshop', listenKey: LISTEN_KEY }]);
  assert.equal(s.checks.length, 1);
  assert.equal(JSON.stringify(host.deserializeAttachment()).includes(LISTEN_KEY), false);
  assert.equal(JSON.stringify(host.deserializeAttachment()).includes(HOST_KEY), false);
  assert.deepEqual(await (await s.check(s.claim(host))).json(), { name: 'Workshop', listenKey: LISTEN_KEY });
  for (const extra of [{ listenKey: WRONG_KEY }, { scope: OTHER_SCOPE }, { lease: crypto.randomUUID() }]) {
    assert.equal((await s.check(s.claim(host, extra))).status, 403);
  }
  const forged = s.observer();
  await s.publish(forged, publication(host, { name: 'Forged metadata' }));
  assert.equal(forged.deserializeAttachment().publication, null);
});

test('a caller in another nearby scope cannot publish a valid broadcast invitation', async () => {
  const s = await system(), host = await s.host(), observer = s.observer(OTHER_SCOPE);
  await s.publish(observer, publication(host));
  assert.deepEqual(s.list(OTHER_SCOPE), []);
});

test('End, disconnect, replacement and failed sends withdraw the current broadcast lease', async () => {
  for (const action of ['end', 'disconnect', 'replacement', 'failed-send']) {
    const s = await system(), host = await s.host(), observer = s.observer();
    const oldPublication = publication(host);
    await s.publish(observer, oldPublication);
    assert.equal(s.list().length, 1);
    if (action === 'end') await s.send(host, { type: 'end', generation: host.deserializeAttachment().generation });
    if (action === 'disconnect') { host.close(1000, 'gone'); s.room.webSocketClose(host); }
    if (action === 'replacement') await s.host();
    if (action === 'failed-send') { host.failSend = true; s.room.send(host, { type: 'status' }); }
    await s.ctx.flush();
    assert.deepEqual(s.list(), [], action);
    await s.publish(observer, oldPublication);
    assert.deepEqual(s.list(), [], `${action} cannot revive its retired lease`);
  }
});

test('a host ending during the asynchronous listener hash cannot pass a private discovery check', async (t) => {
  const s = await system(), host = await s.host();
  const digest = crypto.subtle.digest.bind(crypto.subtle);
  let release, reached;
  const waiting = new Promise((resolve) => { release = resolve; });
  const started = new Promise((resolve) => { reached = resolve; });
  t.mock.method(crypto.subtle, 'digest', async (algorithm, bytes) => {
    if (new TextDecoder().decode(bytes) === LISTEN_KEY) { reached(); await waiting; }
    return digest(algorithm, bytes);
  });
  const pending = s.check(s.claim(host));
  await started;
  await s.send(host, { type: 'end', generation: host.deserializeAttachment().generation });
  release();
  assert.equal((await pending).status, 403);
  await s.ctx.flush();
});

test('refresh rechecks each listener capability and merges only newly verified metadata', async () => {
  const s = await system(), host = await s.host(), good = s.observer(), stale = s.observer();
  await s.publish(good, publication(host));
  const who = good.deserializeAttachment();
  stale.serializeAttachment({ ...who, publication: { ...who.publication, listenKey: WRONG_KEY } });
  host.serializeAttachment({ ...host.deserializeAttachment(), name: 'Verified new name' });
  s.checks.length = 0;
  await s.directory().instance.refresh();
  assert.equal(s.checks.length, 2);
  assert.equal(stale.deserializeAttachment().publication, null);
  assert.deepEqual(s.list(), [{ code: s.code, local: true, name: 'Verified new name', listenKey: LISTEN_KEY }]);
});

test('private metadata with extra fields or a substituted listener capability is refused', async () => {
  const s = await system(), host = await s.host();
  for (const metadata of [
    { name: 'Room', listenKey: LISTEN_KEY, key: HOST_KEY },
    { name: 'Room', listenKey: WRONG_KEY }, { name: '\n', listenKey: LISTEN_KEY },
  ]) {
    s.env.BROADCASTS.get = () => ({ fetch: async () => new Response(JSON.stringify(metadata)) });
    assert.equal(await s.directory().instance.verify(publication(host), SCOPE, 'walkie-talkie'), false);
  }
});

test('the public Worker derives the Walkie scope and rejects generic room routing', async () => {
  let forwarded;
  const env = {
    LIMIT: { limit: async () => ({ success: true }) },
    BROADCASTS: { idFromName: (name) => name, get: () => ({ fetch: async (request) => {
      forwarded = request;
      return new Response(null);
    } }) },
  };
  const request = new Request(`https://rendezvous.abox.tools/broadcast/${'a'.repeat(64)}`, {
    headers: { Upgrade: 'websocket', Origin: 'https://abox.tools', 'CF-Connecting-IP': '1.2.3.4',
      [DISCOVERY_SCOPE_HEADER]: OTHER_SCOPE },
  });
  await worker.fetch(request, env);
  assert.equal(forwarded.headers.get(DISCOVERY_SCOPE_HEADER), await discoveryScope(request, 'walkie-talkie'));
  assert.notEqual(forwarded.headers.get(DISCOVERY_SCOPE_HEADER), OTHER_SCOPE);
  assert.equal((await worker.fetch(new Request('https://rendezvous.abox.tools/ws/room?tool=walkie-talkie'), env)).status, 404);
  assert.equal((await worker.fetch(new Request('https://rendezvous.abox.tools/_discovery/check'), env)).status, 404);
});
