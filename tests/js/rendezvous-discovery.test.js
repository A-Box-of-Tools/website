/**
 * Discovery advertisements belong to a live Room lease, not to a browser's
 * claim that it hosts a code. Runtime-shaped sockets and contexts exercise
 * hibernation, private binding calls, and withdrawals racing an async check.
 * Storage is deliberately unavailable: a future write must fail these cases.
 */

import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import worker, { Discovery, Room } from '../../workers/rendezvous/worker.js';
import { DISCOVERY_SCOPE_HEADER } from '../../workers/rendezvous/discovery.js';

const NativeResponse = globalThis.Response;
const nativePair = globalThis.WebSocketPair;
const nativeAutoPair = globalThis.WebSocketRequestResponsePair;
const SCOPE = 'a'.repeat(64);
const OTHER_SCOPE = 'b'.repeat(64);

class Socket {
  constructor() { this.readyState = 0; this.messages = []; this.attachment = null; this.tags = []; }
  accept() { this.readyState = 1; }
  close(code, reason) { this.readyState = 3; this.closed = { code, reason }; }
  send(message) {
    if (this.readyState !== 1 || this.failSend) throw new Error('closed socket');
    this.messages.push(JSON.parse(message));
  }
  serializeAttachment(value) { this.attachment = structuredClone(value); }
  deserializeAttachment() { return structuredClone(this.attachment); }
}

class Context {
  constructor() { this.sockets = []; this.tasks = []; }
  get storage() { throw new Error('discovery must not write storage'); }
  setWebSocketAutoResponse(pair) { this.autoResponse = pair; }
  acceptWebSocket(ws, tags) { ws.accept(); ws.tags = tags; this.sockets.push(ws); }
  getWebSockets(tag) { return this.sockets.filter((ws) => ws.readyState === 1 && (tag === undefined || ws.tags.includes(tag))); }
  waitUntil(promise) { this.tasks.push(promise); }
  async flush() { await Promise.all(this.tasks); this.tasks = []; }
}

before(() => {
  // Node reserves 101 for its transport; Workers adds the webSocket member.
  // Keeping every ordinary Response native still tests the actual HTTP gates.
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
      const client = new Socket();
      const server = new Socket();
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

function system() {
  const rooms = new Map();
  const discoveries = new Map();
  const calls = [];
  const env = {
    LIMIT: { limit: async () => ({ success: true }) },
    ROOMS: {
      idFromName: (code) => code,
      get: (code) => ({ fetch: async (input, init) => {
        const request = input instanceof Request ? input : new Request(input, init);
        calls.push({ target: 'room', code, request: request.clone() });
        return room(code).instance.fetch(request);
      } }),
    },
    DISCOVERY: {
      idFromName: (scope) => scope,
      get: (scope) => ({ fetch: async (input, init) => {
        const request = input instanceof Request ? input : new Request(input, init);
        calls.push({ target: 'discovery', scope, request: request.clone() });
        return discovery(scope).instance.fetch(request);
      } }),
    },
  };
  function room(code) {
    if (!rooms.has(code)) { const ctx = new Context(); rooms.set(code, { ctx, instance: new Room(ctx, env) }); }
    return rooms.get(code);
  }
  function discovery(scope = SCOPE) {
    if (!discoveries.has(scope)) { const ctx = new Context(); discoveries.set(scope, { ctx, instance: new Discovery(ctx, env) }); }
    return discoveries.get(scope);
  }
  return { env, room, discovery, calls };
}

async function host(s, code = 'brave-otter-42', scope = SCOPE, flags = '&local=1&discover=1') {
  const response = await s.room(code).instance.fetch(new Request(`https://room.internal/ws/${code}?role=host${flags}`, {
    headers: { Upgrade: 'websocket', [DISCOVERY_SCOPE_HEADER]: scope },
  }));
  assert.equal(response.status, 101);
  return response.webSocket.peer;
}

async function observer(s, scope = SCOPE) {
  const response = await s.discovery(scope).instance.fetch(new Request('https://discovery.internal/discover', {
    headers: { Upgrade: 'websocket', [DISCOVERY_SCOPE_HEADER]: scope },
  }));
  assert.equal(response.status, 101);
  return response.webSocket.peer;
}

const publication = (host) => host.messages.find((message) => message.type === 'host-ready').discovery;
const shares = (ws) => ws.messages.at(-1);
const publish = (s, ws, value, scope = SCOPE) => s.discovery(scope).instance.webSocketMessage(ws, JSON.stringify({ publish: value }));
const check = (s, code, claim) => s.room(code).instance.fetch(new Request('https://room.internal/_discovery/check', {
  method: 'POST', body: JSON.stringify(claim),
}));
const withdraw = (s, claim, scope = SCOPE) => s.discovery(scope).instance.fetch(new Request('https://discovery.internal/_discovery/withdraw', {
  method: 'POST', body: JSON.stringify(claim),
}));

function edgeRequest(path, address, extra = {}) {
  const headers = new Headers({ Upgrade: 'websocket', Origin: 'https://abox.tools', ...extra });
  if (address !== null) headers.set('CF-Connecting-IP', address);
  return new Request(`https://rendezvous.abox.tools${path}`, { headers });
}

async function edgeSocket(s, path, address, extra) {
  const response = await worker.fetch(edgeRequest(path, address, extra), s.env);
  assert.equal(response.status, 101);
  return response.webSocket.peer;
}

test('different IPv6 devices on one /64 find a live lease through the public Worker', async () => {
  const s = system();
  const address = '2606:4700:4700:ab::1111';
  const offered = await edgeSocket(s, '/ws/ipv6-room?role=host&local=1&discover=1', address);
  const publisher = await edgeSocket(s, '/discover', address);
  const scope = publisher.deserializeAttachment().scope;
  assert.equal(offered.deserializeAttachment().scope, scope);
  await publish(s, publisher, publication(offered), scope);
  const nearby = await edgeSocket(s, '/discover', '2606:4700:4700:AB:9876:5432:abcd:ef01', {
    Origin: 'https://ABOX.tools:443',
  });
  assert.equal(nearby.deserializeAttachment().scope, scope);
  assert.deepEqual(shares(nearby).list, [{ code: 'ipv6-room', local: true }]);
  const adjacent = await edgeSocket(s, '/discover', '2606:4700:4700:ac::1111');
  assert.notEqual(adjacent.deserializeAttachment().scope, scope);
  assert.deepEqual(shares(adjacent).list, []);
  const expanded = await edgeSocket(s, '/discover', '2606:4700:4700:00ab:0000:0000:0000:2222');
  assert.equal(expanded.deserializeAttachment().scope, scope);
  assert.deepEqual(shares(expanded).list, [{ code: 'ipv6-room', local: true }]);
  // Prefix matching changes only the list. A live Room still authorizes
  // the publication, and host closure still removes it from every observer.
  offered.close(1000, 'done');
  s.room('ipv6-room').instance.webSocketClose(offered);
  await s.room('ipv6-room').ctx.flush();
  assert.deepEqual(shares(nearby).list, []);
  assert.deepEqual(shares(expanded).list, []);
});

test('IPv6 prefix matching retains the page-origin and Room lease boundaries', async () => {
  const s = system();
  const offered = await edgeSocket(s, '/ws/origin-room?role=host&local=1&discover=1', '2606:4700::1234');
  const publisher = await edgeSocket(s, '/discover', '2606:4700:0:0:0:0:0:5678');
  const scope = publisher.deserializeAttachment().scope;
  await publish(s, publisher, publication(offered), scope);
  const preview = await edgeSocket(s, '/discover', '2606:4700::9abc', {
    Origin: 'https://pr-1.abox-preview.pages.dev',
  });
  const previewScope = preview.deserializeAttachment().scope;
  assert.notEqual(previewScope, scope);
  assert.deepEqual(shares(preview).list, []);
  await publish(s, preview, publication(offered), previewScope);
  assert.deepEqual(shares(preview).list, []);
  assert.deepEqual(shares(publisher).list, [{ code: 'origin-room', local: true }]);
  assert.equal((await worker.fetch(edgeRequest('/discover', '2606:4700::1111', {
    Origin: 'https://example.com',
  }), s.env)).status, 403);
});

test('IPv4 discovery keeps its exact address and original hash input', async () => {
  const s = system();
  const observer = await edgeSocket(s, '/discover', '1.2.3.4', {
    'CF-Connecting-IPv6': '2606:4700::1111',
  });
  const bytes = new TextEncoder().encode('https://abox.tools\n1.2.3.4');
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
  const expected = [...digest].map((n) => n.toString(16).padStart(2, '0')).join('');
  assert.equal(observer.deserializeAttachment().scope, expected);
  const adjacent = await edgeSocket(s, '/discover', '1.2.3.5');
  const ipv6 = await edgeSocket(s, '/discover', '2606:4700::1111');
  assert.notEqual(adjacent.deserializeAttachment().scope, expected);
  assert.notEqual(ipv6.deserializeAttachment().scope, expected);
});

test('Cloudflare Pseudo IPv4 overwrite mode joins the preserved public IPv6 /64', async () => {
  const s = system();
  const offered = await edgeSocket(s, '/ws/pseudo-room?role=host&local=1&discover=1', '240.16.0.1', {
    'CF-Connecting-IPv6': '2606:4700:4700:ab::1111',
  });
  const publisher = await edgeSocket(s, '/discover', '250.32.0.2', {
    'CF-Connecting-IPv6': '2606:4700:4700:00ab:9876:5432:abcd:ef01',
  });
  const scope = publisher.deserializeAttachment().scope;
  assert.equal(offered.deserializeAttachment().scope, scope);
  await publish(s, publisher, publication(offered), scope);
  const nearby = await edgeSocket(s, '/discover', '2606:4700:4700:ab::2222');
  assert.equal(nearby.deserializeAttachment().scope, scope);
  assert.deepEqual(shares(nearby).list, [{ code: 'pseudo-room', local: true }]);
});

test('an alternate IPv6 header cannot repair an absent or invalid edge address', async () => {
  const s = system();
  for (const address of [null, '', 'not-an-ip', '1.2.3.999', '001.2.3.4',
    '10.1.2.3', '224.0.0.1', '239.1.2.3', '240.999.0.1']) {
    const response = await worker.fetch(edgeRequest('/discover', address, {
      'CF-Connecting-IPv6': '2606:4700::1111',
    }), s.env);
    assert.equal(response.status, 403, String(address));
  }
  for (const alternate of ['', '1.2.3.4', 'fc00::1', 'fe80::1', '2001:db8::1',
    '2a06:98c0:3600::103', 'not-an-ip', '2606:4700::1111,2606:4700::2222']) {
    const response = await worker.fetch(edgeRequest('/discover', '240.16.0.1', {
      'CF-Connecting-IPv6': alternate,
    }), s.env);
    assert.equal(response.status, 403, alternate);
  }
  assert.equal((await worker.fetch(edgeRequest('/discover', '240.16.0.1'), s.env)).status, 403);
  for (const address of ['2606:4700::1111', '2a06:98c0:3600::103', '240.16.0.1']) {
    assert.equal((await worker.fetch(edgeRequest('/discover', address, {
      'CF-Connecting-IPv6': '2606:4700::1111', 'CF-Worker': 'example.com',
    }), s.env)).status, 403, address);
  }
  assert.equal(s.calls.length, 0);
});

test('only an explicitly discoverable local host receives a server-issued lease', async () => {
  const s = system();
  const offered = await host(s);
  const claim = publication(offered);
  assert.equal(claim.code, 'brave-otter-42');
  assert.match(claim.lease, /^[a-f0-9-]{36}$/);
  assert.deepEqual(Object.keys(claim).sort(), ['code', 'lease']);
  assert.equal(offered.deserializeAttachment().scope, SCOPE);
  for (const [code, flags] of [['ordinary', ''], ['local-only', '&local=1'], ['direct-discover', '&discover=1']]) {
    const plain = await host(s, code, SCOPE, flags);
    assert.deepEqual(plain.messages, []);
    assert.deepEqual(plain.deserializeAttachment(), { role: 'host' });
    assert.equal((await check(s, code, { code, lease: claim.lease, scope: SCOPE })).status, 403);
  }
  const unscoped = await s.room('unscoped').instance.fetch(new Request('https://room.internal/ws/unscoped?role=host&local=1&discover=1'));
  assert.equal(unscoped.status, 101);
  assert.deepEqual(unscoped.webSocket.peer.messages, []);
  assert.deepEqual(unscoped.webSocket.peer.deserializeAttachment(), { role: 'host' });
  const collision = await s.room(claim.code).instance.fetch(new Request(`https://room.internal/ws/${claim.code}?role=host&local=1&discover=1`, {
    headers: { [DISCOVERY_SCOPE_HEADER]: SCOPE },
  }));
  assert.equal(collision.webSocket.peer.closed.code, 4409);
});

test('Room authenticates the live lease, exact code, exact scope, and host flags', async () => {
  const s = system();
  const live = await host(s);
  const claim = { ...publication(live), scope: SCOPE };
  assert.equal((await check(s, claim.code, claim)).status, 204);
  assert.equal((await check(s, claim.code, { ...claim, code: 'another' })).status, 403);
  assert.equal((await check(s, claim.code, { ...claim, lease: 'x'.repeat(36) })).status, 403);
  assert.equal((await check(s, claim.code, { ...claim, scope: OTHER_SCOPE })).status, 403);
  assert.equal((await check(s, claim.code, { ...claim, lease: '' })).status, 400);
  live.close(1000, 'gone');
  assert.equal((await check(s, claim.code, claim)).status, 403);
  assert.equal((await s.room(claim.code).instance.fetch(new Request('https://room.internal/_discovery/check'))).status, 404);
  assert.equal((await s.room(claim.code).instance.fetch(new Request('https://room.internal/_discovery/check', { method: 'POST', body: '{' }))).status, 400);
});

test('an observer publishes only a real lease and snapshots contain only the room code and local flag', async () => {
  const s = system();
  const live = await host(s);
  const sender = await observer(s);
  const viewer = await observer(s);
  assert.deepEqual(shares(viewer), { type: 'shares', list: [] });
  await publish(s, sender, { code: 'phantom', lease: 'x'.repeat(36) });
  assert.deepEqual(shares(viewer).list, []);
  await publish(s, sender, { ...publication(live), lease: 'x'.repeat(36) });
  assert.deepEqual(shares(viewer).list, []);
  await publish(s, sender, { ...publication(live), scope: OTHER_SCOPE, name: 'not advertised', size: 100 });
  assert.deepEqual(shares(viewer), { type: 'shares', list: [{ code: 'brave-otter-42', local: true }] });
  assert.deepEqual(Object.keys(sender.deserializeAttachment().publication).sort(), ['code', 'lease', 'verified']);
  const checks = s.calls.filter((call) => call.target === 'room' && new URL(call.request.url).pathname === '/_discovery/check');
  assert.ok(checks.length >= 3);
  for (const call of checks) {
    assert.equal(new URL(call.request.url).search, '');
    assert.equal(call.request.url.includes(publication(live).lease), false);
  }
  assert.equal((await checks.at(-1).request.json()).scope, SCOPE);
  const stranger = await observer(s, OTHER_SCOPE);
  await publish(s, stranger, publication(live), OTHER_SCOPE);
  assert.deepEqual(shares(stranger).list, []);
});

test('duplicate publications list one code and unpublishing removes only that observer lease', async () => {
  const s = system();
  const live = await host(s);
  const first = await observer(s);
  const second = await observer(s);
  await publish(s, first, publication(live));
  await publish(s, second, publication(live));
  assert.equal(shares(second).list.length, 1);
  await publish(s, first, null);
  assert.equal(shares(second).list.length, 1);
  await publish(s, second, null);
  assert.deepEqual(shares(second).list, []);
});

test('hibernation retains verified lists and keepalives entirely through attachments', async () => {
  const s = system();
  const live = await host(s);
  const publisher = await observer(s);
  const watching = await observer(s);
  await publish(s, publisher, publication(live));
  const state = s.discovery();
  state.instance = new Discovery(state.ctx, s.env);
  const room = s.room('brave-otter-42');
  room.instance = new Room(room.ctx, s.env);
  const joined = await observer(s);
  assert.deepEqual(shares(joined).list, [{ code: 'brave-otter-42', local: true }]);
  assert.equal(state.ctx.autoResponse.request, 'ping');
  assert.equal(state.ctx.autoResponse.response, 'pong');
  assert.equal(room.ctx.autoResponse.request, 'ping');
  assert.equal(room.ctx.autoResponse.response, 'pong');
  const messages = watching.messages.length;
  await state.instance.webSocketMessage(watching, 'ping');
  assert.equal(watching.messages.length, messages);
  await publish(s, publisher, null);
  assert.deepEqual(shares(watching).list, []);
});

test('closing the live host authoritatively removes advertisements without a browser unpublish', async () => {
  const s = system();
  const live = await host(s);
  const publisher = await observer(s);
  const watching = await observer(s);
  await publish(s, publisher, publication(live));
  live.close(1000, 'gone');
  const room = s.room('brave-otter-42');
  room.instance.webSocketClose(live);
  await room.ctx.flush();
  assert.deepEqual(shares(watching).list, []);
  assert.equal(publisher.deserializeAttachment().publication, null);
  const withdrawals = s.calls.filter((call) => call.target === 'discovery');
  assert.equal(withdrawals.length, 1);
  assert.equal(new URL(withdrawals[0].request.url).search, '');
  room.instance.webSocketError(live);
  await room.ctx.flush();
  assert.equal(s.calls.filter((call) => call.target === 'discovery').length, 1);
  const fresh = await host(s);
  assert.notEqual(publication(fresh).lease, publication(live).lease);
  await publish(s, publisher, publication(live));
  assert.deepEqual(shares(watching).list, []);
});

function holdRoomCheck(s) {
  const get = s.env.ROOMS.get;
  let release;
  let reached;
  const checked = new Promise((resolve) => { reached = resolve; });
  const held = new Promise((resolve) => { release = resolve; });
  s.env.ROOMS.get = (code) => ({ fetch: async (input, init) => {
    const response = await get(code).fetch(input, init);
    reached();
    await held;
    return response;
  } });
  return { checked, release };
}

test('a host withdrawal cancels a pending verified result before it can advertise', async () => {
  const s = system();
  const live = await host(s);
  const publisher = await observer(s);
  const watching = await observer(s);
  const held = holdRoomCheck(s);
  const pending = publish(s, publisher, publication(live));
  await held.checked;
  assert.equal(publisher.deserializeAttachment().publication.verified, false);
  assert.deepEqual(shares(watching).list, []);
  live.close(1000, 'gone');
  const room = s.room('brave-otter-42');
  room.instance.webSocketClose(live);
  await room.ctx.flush();
  assert.equal(publisher.deserializeAttachment().publication, null);
  held.release();
  await pending;
  assert.deepEqual(shares(watching).list, []);
});

test('unpublish, socket close, and socket error cancel an in-flight lease check', async () => {
  for (const action of ['unpublish', 'close', 'error']) {
    const s = system();
    const live = await host(s);
    const publisher = await observer(s);
    const watching = await observer(s);
    const held = holdRoomCheck(s);
    const pending = publish(s, publisher, publication(live));
    await held.checked;
    if (action === 'unpublish') await publish(s, publisher, null);
    else {
      publisher.close(1000, action);
      s.discovery().instance[action === 'close' ? 'webSocketClose' : 'webSocketError'](publisher);
    }
    held.release();
    await pending;
    assert.deepEqual(shares(watching).list, [], action);
    assert.equal(publisher.deserializeAttachment()?.publication ?? null, null);
  }
});

test('a later publish wins over a stale check even when both leases remain valid', async () => {
  const s = system();
  const first = await host(s, 'first');
  const second = await host(s, 'second');
  const publisher = await observer(s);
  const watching = await observer(s);
  const originalGet = s.env.ROOMS.get;
  const held = holdRoomCheck(s);
  const pending = publish(s, publisher, publication(first));
  await held.checked;
  s.env.ROOMS.get = originalGet;
  await publish(s, publisher, publication(second));
  held.release();
  await pending;
  assert.deepEqual(shares(watching).list, [{ code: 'second', local: true }]);
});

test('observer closure and failed sends remove verified publications for other observers', async () => {
  for (const action of ['close', 'error', 'send']) {
    const s = system();
    const live = await host(s);
    const publisher = await observer(s);
    const watching = await observer(s);
    await publish(s, publisher, publication(live));
    if (action === 'send') { publisher.failSend = true; s.discovery().instance.broadcast(); }
    else {
      publisher.close(1000, action);
      s.discovery().instance[action === 'close' ? 'webSocketClose' : 'webSocketError'](publisher);
    }
    assert.equal(publisher.deserializeAttachment(), null);
    assert.deepEqual(shares(watching).list, [], action);
  }
});

test('withdrawal of an old lease cannot remove a newly hosted instance of the same code', async () => {
  const s = system();
  const old = await host(s);
  const oldClaim = publication(old);
  old.close(1000, 'gone');
  s.room(oldClaim.code).instance.webSocketClose(old);
  await s.room(oldClaim.code).ctx.flush();
  const fresh = await host(s);
  const publisher = await observer(s);
  await publish(s, publisher, publication(fresh));
  await withdraw(s, oldClaim);
  assert.deepEqual(shares(publisher).list, [{ code: oldClaim.code, local: true }]);
});

test('manual refresh revalidates unique leases and repairs a missed host withdrawal', async () => {
  const s = system();
  const live = await host(s);
  const publisher = await observer(s);
  const duplicate = await observer(s);
  const watching = await observer(s);
  await publish(s, publisher, publication(live));
  await publish(s, duplicate, publication(live));
  const before = s.calls.length;
  await s.discovery().instance.webSocketMessage(watching, JSON.stringify({ refresh: true }));
  assert.equal(s.calls.length - before, 1);
  assert.equal(shares(watching).list.length, 1);
  // A binding failure could lose Room's withdrawal; refresh must consult
  // the live socket again rather than trusting its old verified attachment.
  live.close(1000, 'gone');
  await s.discovery().instance.webSocketMessage(watching, JSON.stringify({ refresh: true }));
  assert.deepEqual(shares(watching).list, []);
  assert.equal(publisher.deserializeAttachment().publication, null);
  assert.equal(duplicate.deserializeAttachment().publication, null);
});

test('a stale refresh result cannot remove a newly verified lease', async () => {
  const s = system();
  const old = await host(s);
  const publisher = await observer(s);
  const watching = await observer(s);
  await publish(s, publisher, publication(old));
  old.close(1000, 'gone');
  const originalGet = s.env.ROOMS.get;
  const held = holdRoomCheck(s);
  const pending = s.discovery().instance.webSocketMessage(watching, JSON.stringify({ refresh: true }));
  await held.checked;
  const fresh = await host(s);
  s.env.ROOMS.get = originalGet;
  await publish(s, publisher, publication(fresh));
  held.release();
  await pending;
  assert.equal(publisher.deserializeAttachment().publication.lease, publication(fresh).lease);
  assert.deepEqual(shares(watching).list, [{ code: 'brave-otter-42', local: true }]);
});

test('discovery bounds observers, listed shares, messages, and updates per socket', async () => {
  const s = system();
  for (let i = 0; i < 64; i += 1) await observer(s);
  const excess = await observer(s);
  assert.equal(excess.closed.code, 4429);
  const listSystem = system();
  const watching = await observer(listSystem);
  for (let i = 0; i < 33; i += 1) {
    const live = await host(listSystem, `room-${i}`);
    const publisher = await observer(listSystem);
    await publish(listSystem, publisher, publication(live));
  }
  assert.equal(shares(watching).list.length, 32);
  const before = listSystem.calls.length;
  const instance = listSystem.discovery().instance;
  for (const message of [new ArrayBuffer(1), 'x'.repeat(513), '{', 'null', '[]',
    JSON.stringify({ publish: { code: '', lease: 'x'.repeat(36) } }),
    JSON.stringify({ publish: { code: 'room-0', lease: '' } })]) await instance.webSocketMessage(watching, message);
  assert.equal(listSystem.calls.length, before);
  assert.equal(watching.deserializeAttachment().updates, 0);
  for (let i = 0; i < 120; i += 1) await publish(listSystem, watching, null);
  await publish(listSystem, watching, null);
  assert.equal(watching.closed.code, 4429);
  assert.equal(watching.deserializeAttachment(), null);
});

test('public requests cannot forge a Room lease or reach binding-only control paths', async () => {
  const s = system();
  for (const path of ['/_discovery/check', '/_discovery/withdraw']) {
    assert.equal((await worker.fetch(new Request(`https://rendezvous.example${path}`, {
      method: 'POST', headers: { Origin: 'https://abox.tools', 'CF-Connecting-IP': '1.2.3.4' },
      body: JSON.stringify({ code: 'brave-otter-42', lease: 'x'.repeat(36), scope: SCOPE }),
    }), s.env)).status, 404);
  }
  assert.deepEqual(s.calls, []);
});
