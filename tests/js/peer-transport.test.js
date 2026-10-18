import test from 'node:test';
import assert from 'node:assert/strict';
import { transportMode, readTransport, transportUrl, peerConfiguration, transportCandidate,
  transportDescription, selectedTransport, RelayCredentials } from '../../shared/js/peer-transport.js';

const TURN = [{ urls: ['turn:turn.cloudflare.com:3478?transport=udp', 'turns:turn.cloudflare.com:443?transport=tcp'], username: 'user', credential: 'secret' }];
const candidate = (type) => `candidate:1 1 udp 2122260223 192.0.2.1 50000 typ ${type}`;

test('transport is explicit in invitations and malformed choices cannot become Direct', () => {
  assert.equal(transportMode(undefined), 'direct');
  for (const value of [null, true, '', 'auto', 'RELAY']) assert.equal(transportMode(value), null);
  assert.equal(readTransport('https://abox.tools/share-tab/#room'), 'direct');
  assert.equal(readTransport('https://abox.tools/share-tab/?transport=relay#room'), 'relay');
  assert.equal(readTransport('https://abox.tools/share-tab/?transport=direct&transport=relay'), null);
  assert.equal(readTransport('https://abox.tools/share-tab/?transport=typo'), null);
  const url = new URL(transportUrl('https://abox.tools/share-tab/?local=1#room', 'direct'));
  assert.equal(url.searchParams.get('transport'), 'direct');
  assert.equal(url.searchParams.get('local'), '1'); assert.equal(url.hash, '#room');
  assert.throws(() => transportUrl(url.href, null), /transport.invalid/);
});

test('Direct ignores credentials and Cloud relay requires TURN with relay-only ICE', () => {
  assert.deepEqual(peerConfiguration('direct', TURN), { iceServers: [] });
  const config = peerConfiguration('relay', TURN);
  assert.equal(config.iceTransportPolicy, 'relay'); assert.deepEqual(config.iceServers, TURN);
  config.iceServers[0].urls.push('turn:changed.example');
  assert.equal(TURN[0].urls.length, 2);
  for (const servers of [null, [], [{ urls: ['stun:example.com'], username: 'u', credential: 'c' }],
    [{ urls: ['turn:example.com\n'], username: 'u', credential: 'c' }], [{ ...TURN[0], credential: '' }]]) {
    assert.throws(() => peerConfiguration('relay', servers), /transport.unavailable/);
  }
});

test('candidate and SDP policy cannot be widened by an object type or related address', () => {
  for (const type of ['host', 'srflx', 'prflx', 'relay']) {
    assert.equal(transportCandidate({ candidate: candidate(type), type: 'relay' }, 'direct'), type === 'host');
    assert.equal(transportCandidate({ candidate: candidate(type), type: 'host' }, 'relay'), type === 'relay');
  }
  assert.equal(transportCandidate(`${candidate('relay')} typ host`, 'relay'), false);
  assert.equal(transportCandidate(`${candidate('relay')}\r\na=${candidate('host')}`, 'relay'), false);
  const source = `v=0\r\na=${candidate('host')}\r\na=${candidate('relay')} raddr 10.0.0.1 rport 3000 generation 0\r\n`;
  const filtered = transportDescription({ type: 'offer', sdp: source }, 'relay');
  assert.equal(filtered.type, 'offer');
  assert.equal(filtered.sdp, `v=0\r\na=${candidate('relay')} generation 0\r\n`);
  assert.equal(transportDescription(filtered, 'direct').sdp, 'v=0\r\n');
});

test('actual-route inspection uses the selected pair rather than unused relay candidates', () => {
  const stats = new Map([
    ['t', { type: 'transport', selectedCandidatePairId: 'pair' }],
    ['pair', { type: 'candidate-pair', localCandidateId: 'local', remoteCandidateId: 'remote' }],
    ['local', { candidateType: 'host' }], ['remote', { candidateType: 'host' }],
    ['unused', { candidateType: 'relay' }],
  ]);
  assert.equal(selectedTransport(stats), 'direct');
  stats.set('remote', { candidateType: 'relay' }); assert.equal(selectedTransport(stats), 'relay');
  assert.equal(selectedTransport(new Map()), 'unknown');
});

function fixture() {
  let time = 1000000, serial = 0, active = true;
  const timers = new Map(), requests = [], renewals = [], errors = [];
  const clock = {
    setTimeout(fn, delay) { const id = ++serial; timers.set(id, { fn, at: time + delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
  };
  const credentials = new RelayCredentials({ clock, now: () => time, current: () => active,
    send(frame) { requests.push(frame); return true; },
    onRenew(servers) { renewals.push(servers); }, onError(error) { errors.push(error.message); } });
  return { credentials, requests, renewals, errors, timers,
    reply(fields = {}) { return credentials.receive({ type: 'relay-credentials', id: requests.at(-1).id,
      iceServers: TURN, expiresAt: time + 3600000, ...fields }); },
    retire() { active = false; },
    async tick(ms) {
      time += ms;
      for (const [id, timer] of [...timers]) if (timer.at <= time) { timers.delete(id); void timer.fn(); }
      await Promise.resolve();
    },
  };
}

test('concurrent preparations share one request and a valid response is privately cached', async (t) => {
  const f = fixture(); t.after(() => f.credentials.close());
  const first = f.credentials.prepare(), second = f.credentials.prepare();
  assert.equal(first, second); assert.equal(f.requests.length, 1);
  assert.equal(f.credentials.receive({ type: 'ready' }), false);
  assert.equal(f.reply({ id: 'stale' }), true); assert.equal(f.requests.length, 1);
  f.reply(); assert.deepEqual(await first, TURN); assert.deepEqual(await second, TURN);
  const cached = await f.credentials.prepare(); cached[0].credential = 'changed';
  assert.deepEqual(await f.credentials.prepare(), TURN); assert.equal(f.requests.length, 1);
});

test('server timestamps tolerate clock skew without adding response latency to the credential life', async (t) => {
  for (const issuedAt of [100, 9000000000000]) {
    const f = fixture(); t.after(() => f.credentials.close());
    const pending = f.credentials.prepare();
    await f.tick(4000);
    f.reply({ issuedAt, expiresAt: issuedAt + 3600000 });
    assert.deepEqual(await pending, TURN);
    assert.equal(f.credentials.cached.expiresAt, 4600000);
  }
});

test('server timestamp pairs cannot smuggle an excessive or exhausted lifetime', async () => {
  for (const fields of [{ issuedAt: '100', expiresAt: 3600100 },
    { issuedAt: 100, expiresAt: 3600101 }, { issuedAt: 100, expiresAt: 60100 },
    { issuedAt: 100, expiresAt: 99 }]) {
    const f = fixture(), pending = f.credentials.prepare();
    const rejected = assert.rejects(pending, /transport.invalid/);
    f.reply(fields); await rejected; f.credentials.close();
  }
});

test('credentials renew before expiry and a failed renewal is surfaced without fallback', async (t) => {
  const f = fixture(); t.after(() => f.credentials.close());
  const initial = f.credentials.prepare(); f.reply(); await initial;
  await f.tick(3300000); assert.equal(f.requests.length, 2);
  f.reply(); await Promise.resolve(); assert.deepEqual(f.renewals, [TURN]);
  await f.tick(3300000); f.reply({ error: 'limited' }); await Promise.resolve();
  assert.deepEqual(f.errors, ['transport.limited']); assert.equal(f.credentials.cached, null);
});

test('Stop rejects pending credentials and a late response cannot rearm renewal', async () => {
  const f = fixture();
  const pending = f.credentials.prepare();
  const rejected = assert.rejects(pending, /transport.stopped/);
  f.credentials.close(); f.reply(); await rejected;
  assert.equal(f.timers.size, 0); assert.equal(f.credentials.cached, null);
  await assert.rejects(f.credentials.prepare(), /transport.stopped/);
});

test('a browser configuration exception during renewal becomes a localized transport failure', async (t) => {
  const f = fixture(); t.after(() => f.credentials.close());
  f.credentials.onRenew = () => { throw new Error('private browser detail'); };
  const pending = f.credentials.prepare(); f.reply(); await pending;
  await f.tick(3300000); f.reply(); await Promise.resolve();
  assert.deepEqual(f.errors, ['transport.failed']);
});

test('invalid expiries, unavailable credentials and request timeout fail closed', async () => {
  for (const fields of [{ expiresAt: 0 }, { expiresAt: 9999999999999 }, { iceServers: [] }, { error: 'forbidden' }]) {
    const f = fixture(), pending = f.credentials.prepare();
    const rejected = assert.rejects(pending, /transport\.(invalid|forbidden)/);
    f.reply(fields); await rejected; f.credentials.close();
  }
  const f = fixture(), pending = f.credentials.prepare();
  const rejected = assert.rejects(pending, /transport.timeout/);
  await f.tick(10000); await rejected; f.credentials.close();
});
