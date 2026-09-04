/**
 * workers/rendezvous/worker.js - the door, not the room.
 *
 * The top-level handler decides who reaches a room at all: it wants a
 * websocket, from one of the site's own pages, from an address that has not
 * been knocking all minute. Those three decisions run here in Node, with a
 * fake environment standing in for the Durable Object and the rate limiter,
 * so a test can say which of them turned a request away and that the room
 * was never asked. The room itself needs the Workers runtime - WebSocketPair,
 * hibernation - and is exercised in a browser, not here.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import worker, { relayServers } from '../../workers/rendezvous/worker.js';

const HOST = 'https://rendezvous.example';
const OURS = 'https://abox.tools';

function env({ allow = true } = {}) {
  const asked = { rooms: [], keys: [] };
  return {
    asked,
    ROOMS: {
      idFromName: (name) => `id:${name}`,
      get: (id) => ({
        fetch: async () => {
          asked.rooms.push(id);
          return new Response('room', { status: 200 });
        },
      }),
    },
    LIMIT: {
      limit: async ({ key }) => {
        asked.keys.push(key);
        return { success: allow };
      },
    },
  };
}

function upgrade(path, headers = {}) {
  return new Request(HOST + path, {
    headers: { Upgrade: 'websocket', 'CF-Connecting-IP': '203.0.113.7', ...headers },
  });
}

test('the root describes itself in plain text', async () => {
  const res = await worker.fetch(new Request(HOST + '/'), env());
  assert.equal(res.status, 200);
  assert.match(await res.text(), /abox\.tools\/share-text/);
});

test('a room path without an upgrade is told what it should have sent', async () => {
  const e = env();
  const plain = new Request(HOST + '/ws/brave-otter-42', { headers: { Origin: OURS } });
  const res = await worker.fetch(plain, e);
  assert.equal(res.status, 426);
  assert.deepEqual(e.asked.rooms, []);
});

test("the site's own page reaches the room named in the path", async () => {
  const e = env();
  const res = await worker.fetch(upgrade('/ws/brave-otter-42', { Origin: OURS }), e);
  assert.equal(res.status, 200);
  assert.deepEqual(e.asked.rooms, ['id:brave-otter-42']);
});

test('a localhost page reaches the room too, on any port', async () => {
  const e = env();
  for (const origin of ['http://localhost:8080', 'http://localhost:3000', 'http://127.0.0.1:8123']) {
    const res = await worker.fetch(upgrade('/ws/brave-otter-42', { Origin: origin }), e);
    assert.equal(res.status, 200, origin);
  }
});

test('any other origin, or none, is refused before a room is touched', async () => {
  const e = env();
  const cases = [
    { Origin: 'https://example.com' },
    { Origin: 'https://abox.tools.example.com' },
    { Origin: 'https://notabox.tools' },
    { Origin: 'http://abox.tools' },
    { Origin: 'null' },
    {},
  ];
  for (const headers of cases) {
    const res = await worker.fetch(upgrade('/ws/brave-otter-42', headers), e);
    assert.equal(res.status, 403, JSON.stringify(headers));
  }
  assert.deepEqual(e.asked.rooms, []);
  assert.deepEqual(e.asked.keys, []);
});

test('an address over its limit is refused, and the room is not asked', async () => {
  const e = env({ allow: false });
  const res = await worker.fetch(upgrade('/ws/brave-otter-42', { Origin: OURS }), e);
  assert.equal(res.status, 429);
  assert.deepEqual(e.asked.keys, ['203.0.113.7']);
  assert.deepEqual(e.asked.rooms, []);
});

test('the limit is counted per address, not per room', async () => {
  const e = env();
  await worker.fetch(upgrade('/ws/one', { Origin: OURS }), e);
  await worker.fetch(upgrade('/ws/two', { Origin: OURS }), e);
  assert.deepEqual(e.asked.keys, ['203.0.113.7', '203.0.113.7']);
  assert.deepEqual(e.asked.rooms, ['id:one', 'id:two']);
});

/*
 * The relay credential. The room's half - one ask per socket, the answer on
 * the same socket - needs the runtime; the minting itself is a plain
 * function of the environment and a fetch, and that half runs here with a
 * fetch that records what it was asked.
 */

const TURN = {
  urls: ['turn:turn.cloudflare.com:3478?transport=udp', 'turns:turn.cloudflare.com:443?transport=tcp'],
  username: 'u',
  credential: 'c',
};

function minting(status = 201, body = { iceServers: [{ urls: ['stun:stun.cloudflare.com:3478'] }, TURN] }) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    return new Response(JSON.stringify(body), { status });
  };
  return { calls, fetchImpl };
}

const KEYED = { TURN_KEY_ID: 'key-1', TURN_KEY_TOKEN: 'tok-1' };

test('with no key configured there is no relay, and nothing is asked', async () => {
  for (const env of [{}, { TURN_KEY_ID: 'key-1' }, { TURN_KEY_TOKEN: 'tok-1' }]) {
    const { calls, fetchImpl } = minting();
    assert.equal(await relayServers(env, fetchImpl), null);
    assert.deepEqual(calls, []);
  }
});

test('a key mints a credential from Cloudflare and hands back the TURN entry alone', async () => {
  const { calls, fetchImpl } = minting();
  const servers = await relayServers(KEYED, fetchImpl);
  assert.deepEqual(servers, [TURN]);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://rtc.live.cloudflare.com/v1/turn/keys/key-1/credentials/generate-ice-servers');
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer tok-1');
  const { ttl } = JSON.parse(calls[0].init.body);
  assert.ok(ttl > 0 && ttl <= 24 * 60 * 60, `a bounded ttl, got ${ttl}`);
});

test('a refusal from Cloudflare, or an answer with no credential in it, is no relay', async () => {
  assert.equal(await relayServers(KEYED, minting(401).fetchImpl), null);
  assert.equal(await relayServers(KEYED, minting(201, { iceServers: [{ urls: ['stun:x'] }] }).fetchImpl), null);
  assert.equal(await relayServers(KEYED, minting(201, {}).fetchImpl), null);
  assert.equal(await relayServers(KEYED, async () => { throw new Error('down'); }), null);
});

test('a name outside the accepted shape is not a room', async () => {
  const e = env();
  const paths = ['/ws/Brave', '/ws/', '/ws/a b', '/ws/-leading', `/ws/${'x'.repeat(65)}`, '/elsewhere'];
  for (const path of paths) {
    const res = await worker.fetch(upgrade(path, { Origin: OURS }), e);
    assert.equal(res.status, 404, path);
  }
  assert.deepEqual(e.asked.rooms, []);
});
