/** Discovery must remain a listing, and must not outlive a stopped share. */

import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanShares, watchDiscovery } from '../../tools/share-text/src/discovery.js';

function fixture() {
  const sockets = [];
  const scheduled = new Map();
  const states = [], lists = [], publications = [];
  let clock = 0, next = 0;
  class Socket {
    constructor(url) { this.url = url; this.readyState = 0; this.sent = []; sockets.push(this); }
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
  const controller = watchDiscovery('wss://rendezvous.example/discover', {
    status: (state) => states.push(state),
    list: (list) => lists.push(list),
    publication: (state) => publications.push(state),
  }, { Socket, later, cancel, every: () => 0, cancelEvery: () => {} });
  const shares = (codes) => ({ type: 'shares', list: codes.map((code) => ({ code, local: true })) });
  return { sockets, states, lists, publications, controller, advance, shares };
}

const lease = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

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
