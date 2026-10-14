import test from 'node:test';
import assert from 'node:assert/strict';
import { createDiagnostics } from '../../tools/share-text/src/connection-diagnostics.js';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/153.0.0.0 Safari/537.36';
const SECRET = 'PRIVATE_DIAGNOSTIC_SENTINEL';
const STUN = ['requestsSent', 'responsesReceived', 'requestsReceived', 'responsesSent', 'consentRequestsSent'];
function setup(options = {}) {
  const clock = { value: 0 };
  return { clock, diagnostics: createDiagnostics({ version: '0123456789', userAgent: UA, now: () => clock.value, ...options }) };
}
const stats = (...rows) => new Map(rows.map((row, index) => [row.id ?? `row-${index}`, row]));
class FakePeer extends EventTarget {
  constructor({ ice = 'new', connection = 'new', readStats = () => new Map() } = {}) {
    super();
    this.iceGatheringState = 'new'; this.iceConnectionState = ice;
    this.connectionState = connection; this.signalingState = 'stable'; this.readStats = readStats;
    this.sctp = new EventTarget(); this.sctp.state = 'connecting';
    this.sctp.transport = new EventTarget(); this.sctp.transport.state = 'new';
  }
  getStats() { return this.readStats(); }
}
class FakeChannel extends EventTarget {
  constructor(readyState = 'connecting') {
    super(); this.readyState = readyState;
    this.label = 'diagnostic-test-channel'; this.protocol = '';
  }
}
function begin(t, diagnostics, role = 'host', mode = 'local') {
  const trace = diagnostics.begin(role, mode);
  t.after(() => trace.finish('stopped'));
  return trace;
}
const latest = diagnostics => diagnostics.report().attempts.at(-1);
const emit = (target, type) => target.dispatchEvent(new Event(type));

test('connection diagnostics never serialize private signaling or untrusted strings', async t => {
  const { diagnostics } = setup({ version: SECRET, userAgent: `${UA} ${SECRET}` });
  const trace = begin(t, diagnostics);
  const peer = new FakePeer({ readStats: () => stats(
    { id: SECRET, type: 'local-candidate', candidateType: 'host', protocol: 'udp', address: '192.168.89.67', port: 54455, url: `turn:${SECRET}`, credential: SECRET },
    { id: `${SECRET}-remote`, type: 'remote-candidate', candidateType: SECRET, protocol: SECRET, address: `${SECRET}.local` },
    { type: 'candidate-pair', state: SECRET, localCandidateId: SECRET, remoteCandidateId: `${SECRET}-remote`, requestsSent: 0 },
    { type: 'transport', dtlsState: SECRET },
    { type: 'data-channel', state: SECRET, label: SECRET, protocol: SECRET, messagesSent: 0 },
    { type: SECRET, address: SECRET },
  ) });
  peer.localDescription = { type: 'offer', sdp: SECRET };
  peer.remoteDescription = { type: 'answer', sdp: SECRET };
  const channel = new FakeChannel('open'); channel.label = SECRET; channel.protocol = SECRET;
  trace.attach(peer); trace.channel(channel);
  trace.candidate('local', { candidate: `candidate:4242 1 udp 123 ${SECRET}.local 54455 typ host`, type: 'host', address: `${SECRET}.local`, relatedAddress: '192.168.89.67', usernameFragment: SECRET, sdpMid: SECRET, protocol: 'udp' }, 'sent');
  trace.candidate('remote', { candidate: SECRET, type: SECRET, address: SECRET, protocol: SECRET }, SECRET);
  assert.doesNotThrow(() => trace.candidate('local', { get candidate() { throw new Error(SECRET); } }, 'received'));
  trace.mark(SECRET); trace.count(SECRET); trace.socket(SECRET);
  trace.error('offer', { name: 'OperationError', message: SECRET, stack: SECRET, cause: SECRET });
  trace.error(SECRET, { name: SECRET, message: SECRET });
  await trace.sample();
  const report = diagnostics.report();
  for (const value of [SECRET, '192.168.89.67', '54455', 'candidate:4242']) assert.equal(JSON.stringify(report).includes(value), false, value);
  assert.equal(report.toolVersion, 'unknown');
  assert.deepEqual(report.browser, { family: 'Chrome', version: '153.0.0.0', platform: 'Windows' });
  assert.deepEqual(latest(diagnostics).errors.map(({ operation, code }) => ({ operation, code })), [
    { operation: 'offer', code: 'OperationError' }, { operation: 'unknown', code: 'unknown' },
  ]);
});

test('connection stats classify candidateType and distinguish missing counters from zero', async t => {
  const { diagnostics } = setup();
  const trace = begin(t, diagnostics);
  const peer = new FakePeer({ readStats: () => stats(
    { type: 'local-candidate', candidateType: 'host', address: '192.168.1.7', protocol: 'udp' },
    { type: 'remote-candidate', candidateType: 'host', address: 'remote-test.local', protocol: 'tcp' },
    { type: 'candidate-pair', state: 'succeeded', nominated: true, requestsSent: 0, responsesReceived: 0, responsesSent: null, consentRequestsSent: NaN },
    { type: 'data-channel', state: 'open', messagesSent: 0 },
  ) });
  trace.attach(peer); await trace.sample();
  const summary = latest(diagnostics).stats;
  assert.equal(summary.available, true);
  assert.deepEqual(summary.localCandidates, { count: 1, types: { host: 1 }, addressForms: { ipv4: 1 }, protocols: { udp: 1 } });
  assert.deepEqual(summary.remoteCandidates, { count: 1, types: { host: 1 }, addressForms: { mdns: 1 }, protocols: { tcp: 1 } });
  assert.equal(summary.pairCount, 1); assert.equal(summary.nominatedPairs, 1);
  assert.deepEqual(summary.pairStates, { succeeded: 1 });
  assert.deepEqual(summary.stun, { requestsSent: 0, responsesReceived: 0, requestsReceived: null, responsesSent: null, consentRequestsSent: null });
  assert.equal(summary.dataChannels.messagesSent, 0); assert.equal(summary.dataChannels.messagesReceived, null);
  peer.readStats = () => new Map(); await trace.sample();
  assert.equal(latest(diagnostics).stats.available, true);
  assert.equal(latest(diagnostics).stats.pairCount, 0);
  for (const key of STUN) assert.equal(latest(diagnostics).stats.stun[key], null);
  assert.equal(latest(diagnostics).stats.dataChannels.messagesSent, null);
});

test('unavailable stats do not fabricate zero counters or expose exception messages', async t => {
  const { diagnostics } = setup(); const trace = begin(t, diagnostics);
  trace.attach(new FakePeer({ readStats: () => { const error = new Error(SECRET); error.name = 'OperationError'; throw error; } }));
  await trace.sample();
  const attempt = latest(diagnostics);
  assert.equal(attempt.stats.available, false); assert.equal(attempt.stats.elapsedMs, null);
  for (const key of STUN) assert.equal(attempt.stats.stun[key], null);
  assert.equal(attempt.stats.dataChannels.messagesSent, null); assert.equal(attempt.stats.dataChannels.messagesReceived, null);
  assert.ok(attempt.errors.some(error => error.operation === 'get-stats' && error.code === 'OperationError'));
  assert.equal(JSON.stringify(attempt).includes(SECRET), false);
});

test('simultaneous sharer peers and returned report copies remain independent', async t => {
  const { diagnostics } = setup();
  const first = begin(t, diagnostics); const second = begin(t, diagnostics);
  first.attach(new FakePeer({ ice: 'connected', connection: 'connected' })); first.channel(new FakeChannel('open'));
  second.attach(new FakePeer({ ice: 'failed', connection: 'failed' })); second.channel(new FakeChannel('connecting'));
  first.count('offerSent'); second.count('offerSent'); second.count('offerSent');
  await Promise.all([first.sample(), second.sample()]); second.finish('timeout');
  const original = diagnostics.report();
  assert.equal(original.attempts.length, 2);
  assert.notEqual(original.attempts[0].attempt, original.attempts[1].attempt);
  assert.equal(original.attempts[0].states.connection, 'connected'); assert.equal(original.attempts[0].states.channel, 'open');
  assert.equal(original.attempts[0].signaling.offerSent, 1); assert.equal(original.attempts[0].finished, false);
  assert.equal(original.attempts[1].states.connection, 'failed'); assert.equal(original.attempts[1].signaling.offerSent, 2);
  assert.equal(original.attempts[1].finished, true);
  const copy = diagnostics.report(); copy.browser.family = SECRET; copy.attempts[0].states.connection = SECRET;
  copy.attempts[0].timeline.length = 0; copy.attempts[1].signaling.offerSent = 999; copy.attempts.pop();
  assert.deepEqual(diagnostics.report(), original);
});

test('finish freezes useful states and ignores late events and pending stats', async t => {
  const { diagnostics, clock } = setup(); const trace = begin(t, diagnostics);
  const peer = new FakePeer({ ice: 'connected', connection: 'connected', readStats: () => stats({ type: 'candidate-pair', state: 'succeeded', requestsSent: 2 }) });
  const channel = new FakeChannel('open'); trace.attach(peer); trace.channel(channel); await trace.sample();
  let resolveLate;
  const delayed = new Promise(resolve => { resolveLate = resolve; });
  peer.readStats = () => delayed; const pending = trace.sample(); await Promise.resolve();
  clock.value = 25; assert.equal(trace.finish('timeout'), true);
  const frozen = diagnostics.report(); assert.equal(frozen.attempts[0].stats.stun.requestsSent, 2);
  clock.value = 10000; peer.connectionState = 'closed'; peer.iceConnectionState = 'closed'; channel.readyState = 'closed';
  emit(peer, 'connectionstatechange'); emit(peer, 'iceconnectionstatechange'); emit(channel, 'close');
  trace.mark('transfer-complete'); trace.count('answerAccepted'); trace.socket('closed', 4404);
  trace.candidate('local', 'candidate:1 1 udp 1 late.local 9 typ host', 'sent'); trace.error('channel', { name: 'OperationError' });
  resolveLate(stats({ type: 'candidate-pair', state: 'failed', requestsSent: 999 })); await pending;
  assert.equal(trace.finish('stopped'), false); assert.deepEqual(diagnostics.report(), frozen);
});

test('a trace cannot accidentally rebind to another peer', async t => {
  const { diagnostics } = setup(); const trace = begin(t, diagnostics);
  trace.attach(new FakePeer({ ice: 'connected', connection: 'connected', readStats: () => stats({ type: 'candidate-pair', state: 'succeeded', requestsSent: 11 }) }));
  await trace.sample();
  const replacement = new FakePeer({ ice: 'failed', connection: 'failed', readStats: () => stats({ type: 'candidate-pair', state: 'failed', requestsSent: 99 }) });
  assert.equal(trace.attach(replacement), false); emit(replacement, 'connectionstatechange'); await trace.sample();
  assert.equal(latest(diagnostics).states.connection, 'connected'); assert.equal(latest(diagnostics).stats.stun.requestsSent, 11);
});

test('attempts, timelines, errors, and candidate-error codes have bounded safe retention', async t => {
  const { diagnostics } = setup(); const traces = [];
  for (let index = 0; index < 13; index += 1) traces.push(diagnostics.begin('host', 'local'));
  t.after(() => traces.forEach(trace => trace.finish('stopped')));
  const trace = traces.at(-1); const peer = new FakePeer(); trace.attach(peer); await trace.sample();
  for (let index = 0; index < 200; index += 1) { peer.iceConnectionState = index % 2 ? 'checking' : 'disconnected'; emit(peer, 'iceconnectionstatechange'); }
  for (let index = 0; index < 20; index += 1) trace.error('offer', { name: 'OperationError' });
  const event = new Event('icecandidateerror'); Object.assign(event, { errorCode: 701, errorText: SECRET, url: SECRET, address: SECRET }); peer.dispatchEvent(event);
  const report = diagnostics.report(); const attempt = report.attempts.at(-1);
  assert.equal(report.attempts.length, 12); assert.equal(report.attemptsDropped, 1);
  assert.equal(attempt.timeline.length, 64); assert.ok(attempt.omittedEvents > 0);
  assert.equal(attempt.errors.length, 16); assert.equal(attempt.omittedErrors, 4);
  assert.deepEqual(attempt.candidateErrors, { 701: 1 }); assert.equal(JSON.stringify(report).includes(SECRET), false);
});
