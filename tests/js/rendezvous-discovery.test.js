/**
 * Discovery advertisements belong to a live Room lease, not to a browser's
 * claim that it hosts a code. Runtime-shaped sockets and contexts exercise
 * hibernation, private binding calls, and withdrawals racing an async check.
 * Storage is deliberately unavailable: a future write must fail these cases.
 */

import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import worker, { Broadcast, Discovery, Inbox, Room } from '../../workers/rendezvous/worker.js';
import { DISCOVERY_SCOPE_HEADER } from '../../workers/rendezvous/discovery.js';
import { broadcastCode } from '../../workers/rendezvous/broadcast.js';
import { groupIdentifier } from '../../shared/js/discovery-group.js';

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
  const voiceRooms = new Map();
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
  for (const [binding, Type] of [['BROADCASTS', Broadcast], ['INBOXES', Inbox]]) {
    env[binding] = {
      idFromName: (code) => code,
      get: (code) => ({ fetch: async (input, init) => {
        const request = input instanceof Request ? input : new Request(input, init);
        calls.push({ target: binding, code, request: request.clone() });
        return voice(binding, code, Type).instance.fetch(request);
      } }),
    };
  }
  function voice(binding, code, Type = binding === 'BROADCASTS' ? Broadcast : Inbox) {
    const id = binding + ':' + code;
    if (!voiceRooms.has(id)) { const ctx = new Context(); voiceRooms.set(id, { ctx, instance: new Type(ctx, env) }); }
    return voiceRooms.get(id);
  }
  function room(code) {
    if (!rooms.has(code)) { const ctx = new Context(); rooms.set(code, { ctx, instance: new Room(ctx, env) }); }
    return rooms.get(code);
  }
  function discovery(scope = SCOPE) {
    if (!discoveries.has(scope)) { const ctx = new Context(); discoveries.set(scope, { ctx, instance: new Discovery(ctx, env) }); }
    return discoveries.get(scope);
  }
  return { env, room, voice, discovery, calls };
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

test('camera and text rooms can share a name while their discovery leases stay separate', async () => {
  const s = system(), address = '1.2.3.4';
  const text = await edgeSocket(s, '/ws/kitchen?role=host&local=1&discover=1', address);
  const camera = await edgeSocket(s, '/ws/kitchen?role=host&local=1&discover=1&tool=remote-camera', address);
  const textList = await edgeSocket(s, '/discover', address);
  const cameraList = await edgeSocket(s, '/discover?tool=remote-camera', address);
  const textScope = textList.deserializeAttachment().scope;
  const cameraScope = cameraList.deserializeAttachment().scope;
  assert.notEqual(cameraScope, textScope);
  assert.equal(publication(camera).tool, 'remote-camera');
  await publish(s, textList, publication(text), textScope);
  await publish(s, cameraList, publication(text), cameraScope);
  assert.deepEqual(shares(cameraList).list, []);
  await publish(s, cameraList, publication(camera), cameraScope);
  assert.deepEqual(shares(cameraList), { type: 'shares', tool: 'remote-camera', list: [{ code: 'kitchen', local: true }] });
  assert.deepEqual(shares(textList), { type: 'shares', list: [{ code: 'kitchen', local: true }] });
  assert.equal((await check(s, 'remote-camera:kitchen', { ...publication(camera), scope: cameraScope, tool: 'share-text' })).status, 403);
  await withdraw(s, { ...publication(camera), tool: 'share-text' }, cameraScope);
  assert.equal(shares(cameraList).list.length, 1);
  camera.close(1000, 'done');
  s.room('remote-camera:kitchen').instance.webSocketClose(camera);
  await s.room('remote-camera:kitchen').ctx.flush();
  assert.deepEqual(shares(cameraList).list, []);
  assert.equal(shares(textList).list.length, 1);
});

test('tab video signaling never reaches a same-code text or camera host', async () => {
  const s = system(), address = '1.2.3.4';
  const code = 'tab-same-code';
  const text = await edgeSocket(s, `/ws/${code}?role=host`, address);
  const camera = await edgeSocket(s, `/ws/${code}?role=host&tool=remote-camera`, address);
  const tab = await edgeSocket(s, `/ws/${code}?role=host&tool=share-tab`, address);
  const viewer = await edgeSocket(s, `/ws/${code}?role=viewer&tool=share-tab`, address);
  const room = s.room(`share-tab:${code}`).instance;
  const data = { protocol: 'share-tab-v1', dial: true };
  room.webSocketMessage(viewer, JSON.stringify({ data }));
  assert.deepEqual(tab.messages.at(-1), { type: 'signal', from: viewer.deserializeAttachment().id, data });
  assert.deepEqual(text.messages, []);
  assert.deepEqual(camera.messages, []);
  room.webSocketMessage(tab, JSON.stringify({ to: viewer.deserializeAttachment().id, data: { answer: 'tab-only' } }));
  assert.deepEqual(viewer.messages.at(-1), { type: 'signal', data: { answer: 'tab-only' } });
  const collision = await edgeSocket(s, `/ws/${code}?role=host&tool=share-tab`, address);
  assert.equal(collision.closed.code, 4409);
  assert.equal(text.readyState, 1);
  assert.equal(camera.readyState, 1);
});

test('a tab room has no discoverable lease unless the host explicitly opts in to both local flags', async () => {
  const s = system(), address = '1.2.3.4';
  const listed = await edgeSocket(s, '/discover?tool=share-tab', address);
  const scope = listed.deserializeAttachment().scope;
  const textList = await edgeSocket(s, '/discover', address);
  const cameraList = await edgeSocket(s, '/discover?tool=remote-camera', address);
  for (const [code, flags] of [['tab-ordinary', ''], ['tab-local-only', '&local=1'], ['tab-discover-only', '&discover=1']]) {
    const tab = await edgeSocket(s, `/ws/${code}?role=host&tool=share-tab${flags}`, address);
    assert.deepEqual(tab.messages, [], code);
    const attachment = tab.deserializeAttachment();
    assert.equal(attachment.role, 'host');
    assert.equal(attachment.tool, 'share-tab');
    assert.equal(attachment.transport, 'direct');
    assert.equal(attachment.transportPinned, false);
    assert.equal(attachment.local, flags.includes('local=1'));
    assert.match(attachment.generation, /^[a-f0-9-]{36}$/);
    const claim = { code, lease: 'x'.repeat(36), tool: 'share-tab', scope };
    assert.equal((await check(s, `share-tab:${code}`, claim)).status, 403);
    await publish(s, listed, claim, scope);
    assert.deepEqual(shares(listed).list, []);
  }
  const optedIn = await edgeSocket(s, '/ws/tab-offered?role=host&tool=share-tab&local=1&discover=1', address);
  const claim = publication(optedIn);
  assert.equal(claim.tool, 'share-tab');
  await publish(s, listed, claim, scope);
  assert.deepEqual(shares(listed), { type: 'shares', tool: 'share-tab', list: [{ code: 'tab-offered', local: true }] });
  await publish(s, textList, claim, textList.deserializeAttachment().scope);
  await publish(s, cameraList, claim, cameraList.deserializeAttachment().scope);
  assert.deepEqual(shares(textList).list, []);
  assert.deepEqual(shares(cameraList).list, []);
});

test('only cached non-local text rooms retain the viewer-only once-per-socket relay fallback', async () => {
  for (const tool of ['share-text', 'remote-camera', 'share-tab']) {
    const s = system(), address = '1.2.3.4';
    const code = 'relay-check';
    const host = await edgeSocket(s, `/ws/${code}?role=host&tool=${tool}`, address);
    const viewer = await edgeSocket(s, `/ws/${code}?role=viewer&tool=${tool}`, address);
    const key = tool === 'share-text' ? code : `${tool}:${code}`;
    const room = s.room(key);
    const relayed = [];
    const answer = { type: 'relay', iceServers: null };
    room.instance.relay = async (socket) => { relayed.push(socket); socket.send(JSON.stringify(answer)); };
    await room.instance.webSocketMessage(host, JSON.stringify({ relay: true }));
    assert.equal(relayed.length, 0, tool);
    const hostMessages = host.messages.length;
    await room.instance.webSocketMessage(viewer, JSON.stringify({ relay: true }));
    if (tool !== 'share-text') {
      assert.deepEqual(relayed, [], tool);
      assert.equal(host.messages.length, hostMessages);
      continue;
    }
    assert.deepEqual(relayed, [viewer]);
    assert.deepEqual(viewer.messages.at(-1), answer);
    assert.equal(host.messages.length, hostMessages);
    assert.equal(viewer.deserializeAttachment().relayed, true);
    room.instance = new Room(room.ctx, s.env);
    room.instance.relay = async (socket) => { relayed.push(socket); };
    await room.instance.webSocketMessage(viewer, JSON.stringify({ relay: true }));
    assert.equal(relayed.length, 1, tool);
    const data = { candidate: 'opaque-setup' };
    room.instance.webSocketMessage(viewer, JSON.stringify({ data }));
    assert.deepEqual(host.messages.at(-1), { type: 'signal', from: viewer.deserializeAttachment().id, data });
  }
});

test('unknown tool namespaces never reach a room or discovery object', async () => {
  const s = system();
  for (const tool of ['', 'unknown', 'REMOTE-CAMERA', 'SHARE-TAB']) {
    for (const path of ['/discover', '/ws/kitchen?role=host']) {
      const separator = path.includes('?') ? '&' : '?';
      assert.equal((await worker.fetch(edgeRequest(`${path}${separator}tool=${tool}`, '1.2.3.4'), s.env)).status, 400);
    }
  }
  assert.equal(s.calls.length, 0);
});

test('Room pins the host transport and rejects incompatible or malformed invitations', async () => {
  const s = system(), address = '1.2.3.4';
  for (const tool of ['share-text', 'share-tab', 'remote-camera']) {
    const suffix = `&tool=${tool}`;
    const owner = await edgeSocket(s, `/ws/policy?role=host&transport=relay${suffix}`, address);
    assert.equal(owner.messages[0].transport, 'relay');
    for (const mode of ['', '&transport=direct']) {
      const refused = await edgeSocket(s, `/ws/policy?role=viewer${mode}${suffix}`, address);
      assert.equal(refused.closed.code, 4412);
    }
    const accepted = await edgeSocket(s, `/ws/policy?role=viewer&transport=relay${suffix}`, address);
    assert.equal(accepted.messages.at(-1).transport, 'relay');
    const key = tool === 'share-text' ? 'policy' : `${tool}:policy`;
    const room = s.room(key);
    room.instance = new Room(room.ctx, s.env);
    for (const socket of [owner, accepted]) {
      await room.instance.webSocketMessage(socket, JSON.stringify({ type: 'relay-request', id: 'test-1' }));
      assert.deepEqual(socket.messages.at(-1), { type: 'relay-credentials', id: 'test-1', error: 'unavailable' });
    }
  }
  for (const query of ['transport=RELAY', 'transport=', 'transport=relay&transport=direct']) {
    assert.equal((await worker.fetch(edgeRequest(`/ws/invalid?role=host&${query}`, address), s.env)).status, 400);
  }
});

test('explicit Direct never grants modern or legacy relay credentials', async () => {
  const s = system(), address = '1.2.3.4';
  for (const flags of ['&transport=direct', '&local=1']) {
    const code = flags.includes('local') ? 'local-policy' : 'direct-policy';
    const owner = await edgeSocket(s, `/ws/${code}?role=host${flags}`, address);
    const viewer = await edgeSocket(s, `/ws/${code}?role=viewer`, address);
    const room = s.room(code).instance;
    room.relay = () => { throw new Error('Direct must not request credentials'); };
    for (const socket of [owner, viewer]) {
      await room.webSocketMessage(socket, JSON.stringify({ type: 'relay-request', id: 'denied' }));
      assert.equal(socket.messages.at(-1).error, 'forbidden');
    }
    await room.webSocketMessage(viewer, JSON.stringify({ relay: true }));
    assert.equal(viewer.deserializeAttachment().relayed, undefined);
  }
});

test('relay admission honors per-service enablement and the concurrent viewer cap', async () => {
  const s = system(), address = '1.2.3.4';
  s.env.RELAY_TOOLS = 'share-text';
  const disabled = await edgeSocket(s, '/ws/no-relay?role=host&tool=share-tab&transport=relay', address);
  assert.equal(disabled.closed.code, 4413);
  s.env.RELAY_MAX_PEERS = '1';
  await edgeSocket(s, '/ws/capped?role=host&transport=relay', address);
  const first = await edgeSocket(s, '/ws/capped?role=viewer&transport=relay', address);
  assert.equal(first.readyState, 1);
  const second = await edgeSocket(s, '/ws/capped?role=viewer&transport=relay', address);
  assert.equal(second.closed.code, 4429);
});

test('nearby transport comes from the live host, never a publisher claim', async () => {
  const s = system();
  const direct = await host(s, 'direct');
  const relay = await host(s, 'relay', SCOPE, '&local=1&discover=1&transport=relay');
  const publisher = await observer(s);
  await publish(s, publisher, { ...publication(direct), transport: 'relay' });
  assert.deepEqual(shares(publisher).list, [{ code: 'direct', local: true }]);
  await publish(s, publisher, { ...publication(relay), transport: 'direct' });
  assert.deepEqual(shares(publisher).list, [{ code: 'relay', local: true, transport: 'relay' }]);
  s.discovery().instance = new Discovery(s.discovery().ctx, s.env);
  await s.discovery().instance.webSocketMessage(publisher, JSON.stringify({ refresh: true }));
  assert.deepEqual(shares(publisher).list, [{ code: 'relay', local: true, transport: 'relay' }]);
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
    const attachment = plain.deserializeAttachment();
    assert.equal(attachment.role, 'host');
    assert.equal(attachment.transport, 'direct');
    assert.equal(attachment.local, flags.includes('local=1'));
    assert.equal(attachment.lease, undefined);
    assert.equal((await check(s, code, { code, lease: claim.lease, scope: SCOPE })).status, 403);
  }
  const unscoped = await s.room('unscoped').instance.fetch(new Request('https://room.internal/ws/unscoped?role=host&local=1&discover=1'));
  assert.equal(unscoped.status, 101);
  assert.deepEqual(unscoped.webSocket.peer.messages, []);
  assert.equal(unscoped.webSocket.peer.deserializeAttachment().role, 'host');
  assert.equal(unscoped.webSocket.peer.deserializeAttachment().lease, undefined);
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

const GROUP_CODE = 'A'.repeat(26);
const OTHER_GROUP_CODE = 'B'.repeat(26);
const PRIVATE_TOOLS = ['share-text', 'share-tab', 'remote-camera', 'walkie-talkie', 'voice-oncall'];

async function privateObserver(s, group, { tool = 'share-text', address = '8.8.8.8', extra, authenticate = true } = {}) {
  const id = await groupIdentifier(group);
  const ws = await edgeSocket(s, `/discover?tool=${tool}&group=${id}`, address, extra);
  const scope = ws.deserializeAttachment().scope;
  assert.deepEqual(ws.messages, []);
  if (authenticate) await s.discovery(scope).instance.webSocketMessage(ws, JSON.stringify({ group }));
  return { ws, scope, id };
}

async function privateHost(s, tool, id, { transport = 'direct', suffix = 'a' } = {}) {
  if (!['walkie-talkie', 'voice-oncall'].includes(tool)) {
    const code = `private-${tool}-${suffix}`;
    const ws = await edgeSocket(s,
      `/ws/${code}?role=host&local=1&discover=1&tool=${tool}&transport=${transport}&group=${id}`, '1.2.3.4');
    return { ws, claim: publication(ws), state: s.room(tool === 'share-text' ? code : tool + ':' + code) };
  }
  const key = suffix.toUpperCase().repeat(43), listenKey = 'L'.repeat(43), code = await broadcastCode(key);
  const binding = tool === 'walkie-talkie' ? 'BROADCASTS' : 'INBOXES';
  const path = tool === 'walkie-talkie' ? 'broadcast' : 'inbox';
  const ws = await edgeSocket(s, `/${path}/${code}?group=${id}`, '1.2.3.4');
  const state = s.voice(binding, code);
  await state.instance.webSocketMessage(ws, JSON.stringify({ type: 'auth', role: 'host', key, transport,
    roomName: 'Private room', ...(tool === 'walkie-talkie' ? { listenKey, discover: true } : { passwordProof: 'P'.repeat(43) }) }));
  const lease = publication(ws);
  return { ws, state, claim: { code, lease: lease.lease, ...(tool === 'walkie-talkie' ? { listenKey } : {}) } };
}

test('all five tools discover private live hosts across addresses without publishing to the network directory', async () => {
  const id = await groupIdentifier(GROUP_CODE);
  for (const tool of PRIVATE_TOOLS) {
    const s = system();
    const host = await privateHost(s, tool, id);
    const publisher = await privateObserver(s, GROUP_CODE, { tool, address: '1.2.3.4' });
    const watching = await privateObserver(s, GROUP_CODE, { tool, address: '2606:4700::1234' });
    const network = await edgeSocket(s, `/discover?tool=${tool}`, '1.2.3.4');
    assert.equal(publisher.scope, watching.scope, tool);
    assert.equal(host.ws.deserializeAttachment().scope, publisher.scope, tool);
    await publish(s, publisher.ws, host.claim, publisher.scope);
    assert.equal(shares(watching.ws).group, id);
    assert.equal(shares(watching.ws).list.length, 1, tool);
    assert.equal(shares(watching.ws).list[0].code, host.claim.code);
    if (tool === 'voice-oncall') assert.equal(shares(watching.ws).list[0].locked, true);
    assert.deepEqual(shares(network).list, []);
    const networkScope = network.deserializeAttachment().scope;
    await publish(s, network, host.claim, networkScope);
    assert.deepEqual(shares(network).list, []);
    const serialized = JSON.stringify([publisher.ws.deserializeAttachment(), host.ws.deserializeAttachment(), shares(watching.ws)]);
    assert.equal(serialized.includes(GROUP_CODE), false, tool);
    assert.equal(s.calls.some(call => call.request.url.includes(GROUP_CODE)), false);
    host.ws.close(1000, 'done');
    host.state.instance.webSocketClose(host.ws);
    await host.state.ctx.flush();
    assert.deepEqual(shares(watching.ws).list, [], tool);
  }
});

test('private groups list Direct and Cloud relay together with trusted access metadata', async () => {
  const id = await groupIdentifier(GROUP_CODE);
  for (const tool of PRIVATE_TOOLS) {
    const s = system();
    s.env.TURN_KEY_ID = 'test-key'; s.env.TURN_KEY_TOKEN = 'test-token';
    const direct = await privateHost(s, tool, id);
    const relay = await privateHost(s, tool, id, { transport: 'relay', suffix: 'b' });
    const first = await privateObserver(s, GROUP_CODE, { tool });
    const second = await privateObserver(s, GROUP_CODE, { tool, address: '9.9.9.9' });
    await publish(s, first.ws, direct.claim, first.scope);
    await publish(s, second.ws, relay.claim, second.scope);
    const entries = shares(first.ws).list;
    assert.equal(entries.length, 2, tool);
    assert.equal(entries.find(entry => entry.code === direct.claim.code).transport, undefined);
    assert.equal(entries.find(entry => entry.code === relay.claim.code).transport, 'relay');
    if (tool === 'voice-oncall') assert.ok(entries.every(entry => entry.locked === true));
  }
});

test('private Share Text may advertise ordinary Direct without broadening its network discovery policy', async () => {
  const s = system(), id = await groupIdentifier(GROUP_CODE);
  const host = await edgeSocket(s, `/ws/ordinary-private?role=host&discover=1&transport=direct&group=${id}`, '1.2.3.4');
  assert.equal(host.deserializeAttachment().local, false);
  const owner = await privateObserver(s, GROUP_CODE);
  await publish(s, owner.ws, publication(host), owner.scope);
  assert.deepEqual(shares(owner.ws).list, [{ code: 'ordinary-private', local: false }]);
  await s.discovery(owner.scope).instance.webSocketMessage(owner.ws, JSON.stringify({ refresh: true }));
  assert.deepEqual(shares(owner.ws).list, [{ code: 'ordinary-private', local: false }]);
  const network = await edgeSocket(s, '/discover', '1.2.3.4');
  await publish(s, network, publication(host), network.deserializeAttachment().scope);
  assert.deepEqual(shares(network).list, []);
  const networkHost = await edgeSocket(s, '/ws/ordinary-network?role=host&discover=1&transport=direct', '1.2.3.4');
  assert.deepEqual(networkHost.messages, []);
  for (const tool of ['share-tab', 'remote-camera']) {
    const unoffered = await edgeSocket(s, `/ws/unoffered?role=host&discover=1&tool=${tool}&group=${id}`, '1.2.3.4');
    assert.deepEqual(unoffered.messages, []);
  }
  host.close(1000, 'done');
  s.room('ordinary-private').instance.webSocketClose(host);
  await s.room('ordinary-private').ctx.flush();
  assert.deepEqual(shares(owner.ws).list, []);
});

test('a private directory never sends entries to an unauthenticated observer or accepts its publish and refresh', async () => {
  const s = system(), id = await groupIdentifier(GROUP_CODE);
  const host = await privateHost(s, 'share-text', id);
  const publisher = await privateObserver(s, GROUP_CODE);
  const silent = await privateObserver(s, GROUP_CODE, { authenticate: false });
  await publish(s, publisher.ws, host.claim, publisher.scope);
  assert.deepEqual(silent.ws.messages, []);
  const before = s.calls.length;
  for (const frame of [{ publish: host.claim }, { refresh: true }]) {
    const pending = await privateObserver(s, GROUP_CODE, { authenticate: false });
    const prior = s.calls.length;
    await s.discovery(pending.scope).instance.webSocketMessage(pending.ws, JSON.stringify(frame));
    assert.equal(pending.ws.closed.code, 4403);
    assert.equal(pending.ws.deserializeAttachment(), null);
    assert.deepEqual(pending.ws.messages, []);
    assert.equal(s.calls.length, prior);
  }
  assert.ok(s.calls.length > before); // Only the two public observer handshakes were forwarded.
  assert.equal(shares(publisher.ws).list.length, 1);
});

test('wrong, malformed, duplicate, and expired private group proofs fail closed', async t => {
  const s = system();
  for (const frame of ['{', 'null', '[]', new ArrayBuffer(1), 'x'.repeat(513),
    JSON.stringify({ group: OTHER_GROUP_CODE }), JSON.stringify({ group: GROUP_CODE.toLowerCase() }),
    JSON.stringify({ group: GROUP_CODE, refresh: true }), JSON.stringify({ group: 'short' })]) {
    const pending = await privateObserver(s, GROUP_CODE, { authenticate: false });
    await s.discovery(pending.scope).instance.webSocketMessage(pending.ws, frame);
    assert.equal(pending.ws.closed.code, 4403);
    assert.equal(pending.ws.deserializeAttachment(), null);
    assert.deepEqual(pending.ws.messages, []);
  }
  const accepted = await privateObserver(s, GROUP_CODE);
  await s.discovery(accepted.scope).instance.webSocketMessage(accepted.ws, JSON.stringify({ group: GROUP_CODE }));
  assert.equal(accepted.ws.closed.code, 4403);
  const pending = await privateObserver(s, GROUP_CODE, { authenticate: false });
  const deadline = pending.ws.deserializeAttachment().deadline;
  t.mock.method(Date, 'now', () => deadline + 1);
  await s.discovery(pending.scope).instance.webSocketMessage(pending.ws, JSON.stringify({ group: GROUP_CODE }));
  assert.equal(pending.ws.closed.code, 4408);
  assert.deepEqual(pending.ws.messages, []);
});

test('private scope separates codes, origins and tools even when the caller knows a valid live lease', async () => {
  const s = system(), id = await groupIdentifier(GROUP_CODE);
  const host = await privateHost(s, 'share-text', id);
  const owner = await privateObserver(s, GROUP_CODE);
  await publish(s, owner.ws, host.claim, owner.scope);
  for (const [code, options] of [[OTHER_GROUP_CODE, {}],
    [GROUP_CODE, { extra: { Origin: 'https://pr-1.abox-preview.pages.dev' } }],
    [GROUP_CODE, { tool: 'remote-camera' }]]) {
    const stranger = await privateObserver(s, code, options);
    assert.notEqual(stranger.scope, owner.scope);
    await publish(s, stranger.ws, host.claim, stranger.scope);
    assert.deepEqual(shares(stranger.ws).list, []);
  }
  const spoof = await privateObserver(s, OTHER_GROUP_CODE, { extra: { [DISCOVERY_SCOPE_HEADER]: owner.scope } });
  assert.notEqual(spoof.scope, owner.scope);
  assert.deepEqual(shares(spoof.ws).list, []);
  assert.equal(shares(owner.ws).list.length, 1);
});

test('private discovery needs an allowed origin and group proof but does not require a public address match', async () => {
  const s = system(), id = await groupIdentifier(GROUP_CODE);
  const first = await privateObserver(s, GROUP_CODE);
  const withoutAddress = await privateObserver(s, GROUP_CODE, { address: null });
  const proxyAddress = await privateObserver(s, GROUP_CODE, { address: '10.0.0.1' });
  assert.equal(withoutAddress.scope, first.scope);
  assert.equal(proxyAddress.scope, first.scope);
  assert.equal((await worker.fetch(edgeRequest('/discover', null), s.env)).status, 403);
  for (const extra of [{ Origin: 'https://example.com' }, { 'CF-Worker': 'example.com' }]) {
    assert.equal((await worker.fetch(edgeRequest('/discover?group=' + id, '1.2.3.4', extra), s.env)).status, 403);
  }
});

test('malformed and duplicate group URL parameters are rejected on every public pairing route', async () => {
  const s = system(), id = await groupIdentifier(GROUP_CODE);
  for (const path of ['/discover', '/ws/test?role=host&local=1&discover=1',
    '/broadcast/' + 'a'.repeat(64), '/inbox/' + 'b'.repeat(64)]) {
    for (const query of ['group=', 'group=short', 'group=' + GROUP_CODE, `group=${id}&group=${id}`]) {
      const result = await worker.fetch(edgeRequest(path + (path.includes('?') ? '&' : '?') + query, '1.2.3.4'), s.env);
      assert.equal(result.status, 400, path + ':' + query);
    }
  }
  assert.deepEqual(s.calls, []);
});

test('private group authorization survives hibernation without persisting the code or accepting late publications', async () => {
  const s = system(), id = await groupIdentifier(GROUP_CODE);
  const host = await privateHost(s, 'share-text', id);
  const owner = await privateObserver(s, GROUP_CODE);
  const state = s.discovery(owner.scope);
  state.instance = new Discovery(state.ctx, s.env);
  const watching = await privateObserver(s, GROUP_CODE, { address: '9.9.9.9' });
  const held = holdRoomCheck(s);
  const pending = publish(s, owner.ws, host.claim, owner.scope);
  await held.checked;
  host.ws.close(1000, 'gone');
  host.state.instance.webSocketClose(host.ws);
  await host.state.ctx.flush();
  held.release(); await pending;
  assert.deepEqual(shares(watching.ws).list, []);
  assert.equal(owner.ws.deserializeAttachment().authenticated, true);
  assert.equal(owner.ws.deserializeAttachment().publication, null);
  assert.equal(JSON.stringify(owner.ws.deserializeAttachment()).includes(GROUP_CODE), false);
});

test('private directories bound pending proofs and expire them before admitting more observers', async t => {
  const s = system(), id = await groupIdentifier(GROUP_CODE);
  let deadline;
  for (let i = 0; i < 8; i++) {
    const pending = await privateObserver(s, GROUP_CODE, { authenticate: false });
    deadline = pending.ws.deserializeAttachment().deadline;
  }
  const full = await edgeSocket(s, '/discover?group=' + id, '8.8.8.8');
  assert.equal(full.closed.code, 4429);
  t.mock.method(Date, 'now', () => deadline + 1);
  const fresh = await privateObserver(s, GROUP_CODE);
  assert.equal(fresh.ws.deserializeAttachment().authenticated, true);
  assert.deepEqual(shares(fresh.ws).list, []);
});

test('closing a private observer or repeating its proof cancels an in-flight authentication', async t => {
  const s = system();
  const first = await privateObserver(s, GROUP_CODE, { authenticate: false });
  const second = await privateObserver(s, GROUP_CODE, { authenticate: false });
  const original = crypto.subtle.digest.bind(crypto.subtle), releases = [];
  t.mock.method(crypto.subtle, 'digest', async (...args) => {
    const result = await original(...args);
    await new Promise(resolve => releases.push(resolve));
    return result;
  });
  const one = s.discovery(first.scope).instance.webSocketMessage(first.ws, JSON.stringify({ group: GROUP_CODE }));
  const two = s.discovery(second.scope).instance.webSocketMessage(second.ws, JSON.stringify({ group: GROUP_CODE }));
  first.ws.close(1000, 'left');
  s.discovery(first.scope).instance.webSocketClose(first.ws);
  await s.discovery(second.scope).instance.webSocketMessage(second.ws, JSON.stringify({ group: GROUP_CODE }));
  assert.equal(second.ws.closed.code, 4403);
  // Both digest results remain pending while the socket attachments retire.
  while (releases.length < 2) await new Promise(resolve => setImmediate(resolve));
  for (const release of releases) release();
  await Promise.all([one, two]);
  assert.equal(first.ws.deserializeAttachment(), null);
  assert.equal(second.ws.deserializeAttachment(), null);
  assert.deepEqual(first.ws.messages, []);
  assert.deepEqual(second.ws.messages, []);
});
