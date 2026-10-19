/** Discovery must remain a listing, and must not outlive a stopped share. */

import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanShares, watchDiscovery } from '../../tools/share-text/src/discovery.js';
import { groupIdentifier } from '../../shared/js/discovery-group.js';

function fixture(tool = null, options = {}) {
  const sockets = [];
  const waitingSockets = [];
  const scheduled = new Map();
  const states = [], lists = [], publications = [];
  let clock = 0, next = 0;
  class Socket {
    constructor(url) { this.url = url; this.readyState = 0; this.sent = []; sockets.push(this); waitingSockets.shift()?.(this); }
    open() { this.readyState = 1; this.onopen?.(); }
    send(data) { this.sent.push(data); }
    message(value) { this.onmessage?.({ data: typeof value === 'string' ? value : JSON.stringify(value) }); }
    close() { this.readyState = 3; this.onclose?.(); }
  }
  const later = (fn, delay) => { const id = ++next; scheduled.set(id, { fn, at: clock + delay }); return id; };
  const cancel = (id) => scheduled.delete(id);
  const advance = (delay) => {
    const until = clock + delay;
    for (;;) {
      const due = [...scheduled].filter(([, item]) => item.at <= until).sort((a, b) => a[1].at - b[1].at)[0];
      if (!due) break;
      scheduled.delete(due[0]); clock = due[1].at; due[1].fn();
    }
    clock = until;
  };
  const controller = watchDiscovery('wss://rendezvous.example/discover' + (tool ? `?tool=${tool}` : ''), {
    status: (state) => states.push(state),
    list: (list) => lists.push(list),
    publication: (state) => publications.push(state),
  }, { Socket, later, cancel, every: () => 0, cancelEvery: () => {}, ...options });
  const shares = (codes) => ({ type: 'shares', list: codes.map((code) => ({ code, local: true })) });
  return { sockets, states, lists, publications, controller, advance, shares,
    nextSocket: () => new Promise((resolve) => waitingSockets.push(resolve)) };
}

const lease = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

test('private discovery authenticates before listing or publishing and rejects legacy network acknowledgements', async (t) => {
  const group = 'A'.repeat(26), identifier = await groupIdentifier(group);
  const f = fixture('remote-camera', { group });
  t.after(() => f.controller.close());
  const ws = await f.nextSocket();
  assert.equal(new URL(ws.url).searchParams.get('group'), identifier);
  assert.equal(ws.url.includes(group), false, 'the bearer group code must stay out of request URLs');
  f.controller.publish('camera-room', lease);
  ws.open();
  assert.deepEqual(ws.sent.map(JSON.parse), [{ group }]);
  f.controller.refresh();
  assert.equal(f.sockets.length, 1, 'refresh keeps the socket awaiting its private acknowledgement');
  assert.deepEqual(f.states, ['connecting'], 'refresh cannot start another asynchronous group connection');
  f.controller.unpublish();
  f.controller.publish('camera-room', lease);
  assert.deepEqual(ws.sent.map(JSON.parse), [{ group }], 'authentication must be the only frame before the directory acknowledgement');
  ws.message({ type: 'shares', tool: 'remote-camera', list: [] });
  ws.message({ type: 'shares', tool: 'remote-camera', group: 'b'.repeat(64), list: [] });
  ws.message({ type: 'shares', tool: 'share-tab', group: identifier, list: [] });
  assert.deepEqual(f.lists, []);
  assert.equal(ws.sent.length, 1);
  ws.message({ type: 'shares', tool: 'remote-camera', group: identifier, list: [
    { code: 'direct-camera', local: true, transport: 'direct' },
    { code: 'relay-camera', local: true, transport: 'relay' },
  ] });
  assert.deepEqual(f.lists.at(-1), [
    { code: 'direct-camera', local: true }, { code: 'relay-camera', local: true, transport: 'relay' },
  ]);
  assert.equal(f.states.at(-1), 'ready');
  assert.deepEqual(JSON.parse(ws.sent.at(-1)), { publish: { code: 'camera-room', lease } });
});

test('private discovery retries authenticate again and cannot republish after Stop', async (t) => {
  const group = 'B'.repeat(26), identifier = await groupIdentifier(group);
  const f = fixture(null, { group });
  t.after(() => f.controller.close());
  const first = await f.nextSocket();
  first.open();
  f.controller.publish('tea-room', lease);
  first.message({ ...f.shares(['wrong-tool']), tool: 'remote-camera', group: identifier });
  first.message({ ...f.shares(['legacy-network']), group: identifier });
  assert.deepEqual(f.lists, [], 'private Share Text needs its explicit namespace, unlike the legacy network directory');
  first.message({ ...f.shares(['tea-room']), tool: 'share-text', group: identifier });
  assert.equal(f.publications.at(-1), 'published');
  first.close();
  f.controller.unpublish();
  const next = f.nextSocket();
  f.advance(30000);
  const restored = await next;
  restored.open();
  assert.deepEqual(restored.sent.map(JSON.parse), [{ group }]);
  first.message({ ...f.shares(['stale-room']), tool: 'share-text', group: identifier });
  assert.deepEqual(f.lists.at(-1), []);
  restored.message({ ...f.shares(['other-room']), tool: 'share-text', group: identifier });
  assert.equal(f.lists.at(-1)[0].code, 'other-room');
  assert.deepEqual(restored.sent.map(JSON.parse), [{ group }]);
});

test('invalid private codes fail closed without opening a network directory', () => {
  for (const group of ['', 'chosen-word', 'A'.repeat(200)]) {
    const f = fixture(null, { group });
    assert.equal(f.sockets.length, 0);
    assert.equal(f.states.at(-1), 'unavailable');
    assert.deepEqual(f.lists.at(-1), []);
    f.controller.refresh();
    assert.equal(f.sockets.length, 0);
    f.controller.close();
  }
});

test('closing during group derivation cancels the socket and all late callbacks', async (t) => {
  let finish;
  t.mock.method(globalThis.crypto.subtle, 'digest', () => new Promise((resolve) => { finish = resolve; }));
  const f = fixture(null, { group: 'C'.repeat(26) });
  assert.equal(f.sockets.length, 0);
  f.controller.close();
  finish(new Uint8Array(32).buffer);
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  f.advance(60000);
  assert.equal(f.sockets.length, 0);
  assert.deepEqual(f.states, ['connecting']);
  assert.deepEqual(f.lists, []);
});

test('walkie discovery publishes only its listener capability after namespace acknowledgement', () => {
  const f = fixture('walkie-talkie'), ws = f.sockets[0];
  const code = 'a'.repeat(64), listenKey = 'b'.repeat(43);
  ws.open();
  assert.equal(f.controller.publish(code, lease), false);
  assert.equal(f.controller.publish(code, lease, { listenKey, key: 'private' }), true);
  ws.message({ type: 'shares', tool: 'voice-oncall', list: [] });
  assert.deepEqual(ws.sent, []);
  ws.message({ type: 'shares', tool: 'walkie-talkie', list: [] });
  assert.deepEqual(JSON.parse(ws.sent.at(-1)), { publish: { code, lease, listenKey } });
  ws.message({ type: 'shares', tool: 'walkie-talkie', list: [{ code, local: true, name: 'Room', listenKey }] });
  assert.equal(f.publications.at(-1), 'published');
  f.controller.unpublish();
  assert.deepEqual(JSON.parse(ws.sent.at(-1)), { publish: null });
  ws.close();
  f.advance(30000);
  f.sockets[1].open();
  f.sockets[1].message({ type: 'shares', tool: 'walkie-talkie', list: [] });
  assert.deepEqual(f.sockets[1].sent, []);
  f.controller.close();
});

test('camera discovery waits for a matching namespace before listing or publishing', () => {
  const f = fixture('remote-camera');
  f.sockets[0].open();
  f.controller.publish('kitchen', lease);
  f.sockets[0].message(f.shares(['text-room']));
  f.sockets[0].message({ ...f.shares(['text-room']), tool: 'share-text' });
  assert.deepEqual(f.lists, []);
  assert.deepEqual(f.sockets[0].sent, []);
  f.sockets[0].message({ ...f.shares([]), tool: 'remote-camera' });
  assert.equal(JSON.parse(f.sockets[0].sent.at(-1)).publish.code, 'kitchen');
  f.sockets[0].message({ ...f.shares(['kitchen']), tool: 'remote-camera' });
  assert.equal(f.publications.at(-1), 'published');
  f.controller.close();
});

test('untrusted listings accept only bounded unique local link names', () => {
  assert.deepEqual(cleanShares(null), []);
  assert.deepEqual(cleanShares([
    { code: 'tea-room', local: true, body: 'private text' },
    { code: 'tea-room', local: true },
    { code: 'remote-room', local: false },
    { code: '<script>', local: true }, null, { code: 17, local: true },
  ]), [{ code: 'tea-room', local: true }]);
  assert.equal(cleanShares(Array.from({ length: 100 }, (_, n) => ({ code: `room-${n}`, local: true }))).length, 64);
});

test('opening the page watches names without announcing a share or requesting content', () => {
  const f = fixture();
  assert.equal(f.sockets.length, 1);
  f.sockets[0].open();
  assert.deepEqual(f.sockets[0].sent, []);
  f.sockets[0].message('not json');
  f.sockets[0].message({ type: 'text', body: 'unrequested content' });
  assert.deepEqual(f.lists, []);
  f.sockets[0].message(f.shares(['tea-room']));
  assert.deepEqual(f.lists.at(-1), [{ code: 'tea-room', local: true }]);
  assert.equal(f.states.at(-1), 'ready');
  f.controller.refresh();
  assert.deepEqual(f.sockets[0].sent, ['{"refresh":true}']);
  f.controller.close();
});

test('publication needs a host lease and a server listing before reporting success', () => {
  const f = fixture();
  f.sockets[0].open();
  f.sockets[0].message(f.shares([]));
  assert.equal(f.controller.publish('tea-room', ''), false);
  assert.equal(f.controller.publish('tea-room', lease), true);
  assert.deepEqual(JSON.parse(f.sockets[0].sent.at(-1)), { publish: { code: 'tea-room', lease } });
  assert.equal(f.publications.at(-1), 'publishing');
  f.advance(8000);
  assert.equal(f.publications.at(-1), 'not-published');
  f.sockets[0].message(f.shares(['tea-room']));
  assert.equal(f.publications.at(-1), 'published');
  f.sockets[0].message(f.shares([]));
  assert.equal(f.publications.at(-1), 'not-published');
  f.controller.close();
});

test('stopping during an outage prevents a stale announcement on reconnect', () => {
  const f = fixture();
  const old = f.sockets[0];
  old.open(); old.message(f.shares([]));
  f.controller.publish('tea-room', lease);
  old.close();
  f.controller.unpublish();
  f.advance(30000);
  const fresh = f.sockets[1];
  fresh.open();
  assert.deepEqual(fresh.sent, []);
  old.message(f.shares(['tea-room']));
  assert.deepEqual(f.lists.at(-1), []);
  fresh.message(f.shares(['another-room']));
  assert.equal(f.lists.at(-1)[0].code, 'another-room');
  assert.equal(f.publications.at(-1), null);
  f.controller.close();
  f.advance(60000);
  assert.equal(f.sockets.length, 2);
  assert.equal(f.controller.publish('tea-room', lease), false);
});

test('an unanswered connection becomes unavailable and can be retried manually', () => {
  const f = fixture();
  f.advance(8000);
  assert.equal(f.states.at(-1), 'unavailable');
  f.controller.refresh();
  assert.equal(f.sockets.length, 2);
  f.sockets[1].open();
  f.sockets[1].message(f.shares([]));
  f.advance(30000);
  assert.equal(f.sockets.length, 2);
  assert.equal(f.states.at(-1), 'ready');
  f.controller.close();
});

test('a browser refusing the discovery socket leaves a recoverable listing failure', () => {
  const states = [];
  let attempts = 0;
  const controller = watchDiscovery('wss://rendezvous.example/discover', {
    status: (state) => states.push(state), list: () => {},
  }, { Socket: class { constructor() { attempts += 1; throw new Error('blocked'); } },
    later: () => 0, cancel: () => {}, cancelEvery: () => {} });
  assert.equal(states.at(-1), 'unavailable');
  controller.refresh();
  assert.equal(attempts, 2);
  controller.close();
});
