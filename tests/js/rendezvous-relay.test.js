import test from 'node:test';
import assert from 'node:assert/strict';
import { answerRelayRequest, relayPolicy, relayEnabled, relayServers } from '../../workers/rendezvous/relay.js';

const TURN = [{ urls: ['turn:turn.cloudflare.com:3478?transport=udp'], username: 'user', credential: 'secret' }];
const KEYED = { TURN_KEY_ID: 'key', TURN_KEY_TOKEN: 'token' };
function fixture(extra = {}) {
  let time = 1000000, live = true;
  const sent = [], calls = [];
  const ws = { readyState: 1, attachment: { role: 'viewer', generation: 'generation', preserved: true },
    send(text) { sent.push(JSON.parse(text)); },
    serializeAttachment(value) { this.attachment = structuredClone(value); },
    deserializeAttachment() { return structuredClone(this.attachment); } };
  const options = { env: { ...KEYED, ...extra }, tool: 'share-tab', authorized: () => live, current: () => live, now: () => time,
    fetchImpl: async (url, init) => { calls.push({ url, init }); return Response.json({ iceServers: TURN }); } };
  return { ws, sent, calls, options,
    request(id = 'relay-1') { return answerRelayRequest(ws, { type: 'relay-request', id }, options); },
    advance(ms) { time += ms; }, stop() { live = false; } };
}

test('disabled services and invalid budgets fail closed without minting', async () => {
  assert.equal(relayEnabled({}, 'unknown'), false);
  for (const env of [{ RELAY_TOOLS: '' }, { RELAY_TOOLS: 'share-text' }, { RELAY_MAX_PEERS: 'garbage' },
    { RELAY_MAX_SESSION_SECONDS: '0' }, { RELAY_MAX_CREDENTIALS: '-1' }]) {
    const f = fixture(env); await f.request();
    assert.deepEqual(f.calls, []); assert.equal(f.sent.at(-1).error, 'unavailable');
  }
  assert.deepEqual(relayPolicy({}), { maxPeers: 10, maxSessionSeconds: 28800, maxCredentials: 12 });
});

test('an unadmitted socket or malformed request cannot mint a relay credential', async () => {
  const f = fixture(); f.options.authorized = false;
  await f.request(); assert.equal(f.sent.at(-1).error, 'forbidden'); assert.equal(f.calls.length, 0);
  assert.equal(await answerRelayRequest(f.ws, { type: 'other' }, f.options), false);
  for (const frame of [{ type: 'relay-request', id: 'x', tool: 'share-tab' }, { type: 'relay-request', id: 'x'.repeat(65) }]) {
    await answerRelayRequest(f.ws, frame, { ...f.options, authorized: true });
  }
  assert.equal(f.calls.length, 0);
});

test('credential limits survive helper recreation and preserve the room attachment', async () => {
  const f = fixture({ RELAY_MAX_CREDENTIALS: '2' });
  await f.request(); assert.deepEqual(f.sent.at(-1).iceServers, TURN);
  assert.equal(f.ws.attachment.preserved, true);
  await f.request('relay-2'); assert.equal(f.sent.at(-1).error, 'limited'); assert.equal(f.calls.length, 1);
  f.advance(60000); await f.request('relay-3'); assert.equal(f.calls.length, 2);
  f.advance(60000); await f.request('relay-4'); assert.equal(f.sent.at(-1).error, 'limited'); assert.equal(f.calls.length, 2);
});

test('renewed credentials cannot outlive the bounded session deadline', async () => {
  const f = fixture({ RELAY_MAX_SESSION_SECONDS: '4000' });
  await f.request(); assert.equal(JSON.parse(f.calls[0].init.body).ttl, 3600);
  assert.equal(f.sent.at(-1).issuedAt, 1000000);
  assert.equal(f.sent.at(-1).expiresAt - f.sent.at(-1).issuedAt, 3600000);
  f.advance(3300000); await f.request('relay-2');
  assert.equal(JSON.parse(f.calls[1].init.body).ttl, 700);
  assert.equal(f.sent.at(-1).expiresAt, 5000000);
  f.advance(600000); await f.request('relay-3'); assert.equal(f.sent.at(-1).error, 'limited');
});

test('ending or replacing the session while minting suppresses late credentials', async () => {
  const f = fixture(); let complete;
  f.options.fetchImpl = () => new Promise(resolve => { complete = resolve; });
  const pending = f.request(); f.stop(); complete(Response.json({ iceServers: TURN })); await pending;
  assert.deepEqual(f.sent, []);
});

test('full or rejected socket attachments refuse before minting and preserve moderation', async () => {
  for (const overflow of [true, false]) {
    const f = fixture();
    if (overflow) f.ws.attachment.moderation = 'x'.repeat(2000);
    else f.ws.serializeAttachment = () => { throw new Error('attachment too large'); };
    const before = structuredClone(f.ws.attachment);
    await f.request();
    assert.equal(f.sent.at(-1).error, 'limited');
    assert.deepEqual(f.calls, []);
    assert.deepEqual(f.ws.attachment, before);
  }
});

test('the mint accepts only bounded TURN entries and never exposes an upstream response', async () => {
  for (const body of [{ iceServers: [{ urls: ['stun:server'], username: 'x', credential: 'x' }] },
    { iceServers: [{ ...TURN[0], urls: ['https://example.com/private'] }] },
    { iceServers: [{ ...TURN[0], credential: 'x'.repeat(2049) }] }]) {
    assert.equal(await relayServers(KEYED, async () => Response.json(body)), null);
  }
  const f = fixture(); f.options.fetchImpl = async () => new Response('private upstream error', { status: 403 });
  await f.request(); assert.deepEqual(f.sent, [{ type: 'relay-credentials', id: 'relay-1', error: 'unavailable' }]);
});
