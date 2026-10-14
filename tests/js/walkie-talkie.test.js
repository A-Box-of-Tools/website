import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { BroadcastSession } from '../../tools/walkie-talkie/src/session.js';

if (!globalThis.crypto) Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
const CODE = 'a'.repeat(64);
const KEY = 'h'.repeat(43);
const LISTEN_KEY = 'l'.repeat(43);
const GEN_A = '11111111-1111-4111-8111-111111111111';
const GEN_B = '22222222-2222-4222-8222-222222222222';
const ID_A = '33333333-3333-4333-8333-333333333333';
const ID_B = '44444444-4444-4444-8444-444444444444';
const CONN_A = '55555555-5555-4555-8555-555555555555';
const CONN_B = '66666666-6666-4666-8666-666666666666';
const SDP = 'v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n' +
  'm=audio 9 UDP/TLS/RTP/SAVPF 111\r\nc=IN IP4 0.0.0.0\r\na=mid:0\r\na=sendonly\r\n' +
  'a=candidate:1 1 UDP 2122260223 192.168.1.20 50000 typ host\r\n' +
  'a=candidate:2 1 UDP 2122260223 198.51.100.2 50001 typ srflx raddr 192.168.1.20 rport 50000\r\n';
const flush = async (turns = 128) => { for (let i = 0; i < turns; i++) await Promise.resolve(); };
const deferred = () => {
  let resolve;
  const promise = new Promise(yes => { resolve = yes; });
  return { promise, resolve };
};
const ready = (id = ID_A, generation = GEN_A) => ({ type: 'ready', id, generation, talking: false });
const offer = (id = ID_A, connection = CONN_A, generation = GEN_A) =>
  ({ type: 'offer', from: 'host', to: id, generation, connection, sdp: SDP });

class Clock {
  time = 0;
  nextId = 0;
  tasks = new Map();
  now = () => this.time;
  setTimeout = (fn, delay) => {
    const id = ++this.nextId;
    this.tasks.set(id, { at: this.time + Math.max(0, delay), fn });
    return id;
  };
  clearTimeout = id => this.tasks.delete(id);
  async advance(ms) {
    const target = this.time + ms;
    let count = 0;
    for (;;) {
      let next;
      for (const [id, task] of this.tasks) {
        if (task.at <= target && (!next || task.at < next.task.at)) next = { id, task };
      }
      if (!next) break;
      assert.ok(++count < 1000, 'Reconnects must not create an immediate loop.');
      this.time = next.task.at;
      this.tasks.delete(next.id);
      next.task.fn();
      await flush();
    }
    this.time = target;
    await flush();
  }
}

class NativeAudioSession {
  state = 'active';
  listeners = new Set();
  additions = 0;
  addEventListener(type, listener) {
    assert.equal(type, 'statechange');
    this.listeners.add(listener);
    this.additions++;
  }
  removeEventListener(type, listener) {
    assert.equal(type, 'statechange');
    this.listeners.delete(listener);
  }
  transition(state) {
    this.state = state;
    for (const listener of [...this.listeners]) listener();
  }
}

function microphone() {
  const track = { kind: 'audio', enabled: true, onended: null, onmute: null, stops: 0,
    stop() { this.stops++; this.onstop?.(); } };
  return { track, stream: { getTracks: () => [track], getAudioTracks: () => [track] } };
}

function harness(t, { role = 'listener', mediaDevices, endpoint, audioSession, discover = false, roomName = '' } = {}) {
  const clock = new Clock();
  const sockets = [];
  const peers = [];
  const states = [];
  const streams = [];
  class Socket {
    constructor(url) {
      assert.equal(sockets.filter(ws => ws.readyState < 2).length, 0,
        'Only one connection attempt may be alive.');
      this.url = url;
      this.readyState = 0;
      this.bufferedAmount = 0;
      this.sent = [];
      this.closed = false;
      sockets.push(this);
    }
    open() { this.readyState = 1; this.onopen?.(); }
    message(frame) { this.onmessage?.({ data: typeof frame === 'string' ? frame : JSON.stringify(frame) }); }
    serverClose(code = 1006) { this.readyState = 3; this.onclose?.({ code }); }
    send(text) {
      assert.equal(this.readyState, 1);
      this.sent.push(text === 'ping' || text === 'pong' ? text : JSON.parse(text));
      if (this.pauseAfterSends === this.sent.length) this.bufferedAmount = 70000;
    }
    close(code) { this.closed = true; this.readyState = 3; this.closeCode = code; }
  }
  class Peer {
    constructor(config) {
      this.config = config;
      this.connectionState = 'new';
      this.localDescription = this.remoteDescription = null;
      this.senders = [];
      this.transceivers = [];
      this.candidates = [];
      this.closed = false;
      peers.push(this);
    }
    addTrack(track, stream) {
      this.senders.push({ track, stream });
      this.transceivers.push({ direction: 'sendrecv' });
    }
    getTransceivers() { return this.transceivers; }
    async createOffer() { return { type: 'offer', sdp: SDP }; }
    async createAnswer() { return { type: 'answer', sdp: SDP.replace('sendonly', 'recvonly') }; }
    async setLocalDescription(description) { this.localDescription = description; }
    async setRemoteDescription(description) {
      this.remoteDescription = description;
      if (!this.transceivers.length) this.transceivers.push({ direction: 'sendrecv' });
    }
    async addIceCandidate(candidate) { this.candidates.push(candidate); }
    connect() { this.connectionState = 'connected'; this.onconnectionstatechange?.(); }
    receive(stream) { this.ontrack?.({ track: { kind: 'audio' }, streams: [stream] }); }
    candidate(value) { this.onicecandidate?.({ candidate: value && { toJSON: () => value, ...value } }); }
    fail() { this.connectionState = 'failed'; this.onconnectionstatechange?.(); }
    close() { this.closed = true; this.connectionState = 'closed'; }
  }
  const session = new BroadcastSession({ role, code: CODE, discover, roomName,
    key: role === 'host' ? KEY : LISTEN_KEY,
    ...(role === 'host' ? { listenKey: LISTEN_KEY } : {}), Socket, Peer, mediaDevices, audioSession, clock, endpoint,
    onState: (key, detail) => states.push({ key, detail }), onStream: stream => streams.push(stream) });
  t.after(async () => {
    session.stop({ notify: false, state: null });
    await flush();
    assert.equal(clock.tasks.size, 0, 'Stopping must clear peer, retry and check timers.');
    assert.equal(sockets.filter(ws => ws.readyState < 2).length, 0);
    if (audioSession) assert.equal(audioSession.listeners.size, 0);
  });
  const begin = async frame => {
    const starting = session.start();
    await flush();
    const ws = sockets.at(-1);
    ws.open();
    ws.message(frame || (role === 'host' ? { type: 'host-ready', generation: GEN_A } : { type: 'waiting' }));
    await flush();
    assert.equal(await starting, true);
    return ws;
  };
  return { session, clock, sockets, peers, states, streams, begin };
}

test('nearby host opts in explicitly and forwards a fresh lease after reconnecting', async t => {
  const mic = microphone();
  const h = harness(t, { role: 'host', discover: true, roomName: 'Classroom',
    mediaDevices: { getUserMedia: async () => mic.stream } });
  const discovery = { code: CODE, lease: ID_A, tool: 'walkie-talkie' };
  const ws = await h.begin({ type: 'host-ready', generation: GEN_A, discovery });
  assert.deepEqual(ws.sent[0], { type: 'auth', role: 'host', key: KEY,
    listenKey: LISTEN_KEY, roomName: 'Classroom', discover: true });
  assert.deepEqual(h.states.at(-1).detail.discovery, discovery);
  assert.equal(mic.track.enabled, false);
  ws.serverClose();
  assert.equal(h.states.at(-1).detail.signaling, false);
  await h.clock.advance(1000);
  const fresh = h.sockets.at(-1);
  fresh.open();
  fresh.message({ type: 'host-ready', generation: GEN_B, discovery: { ...discovery, lease: ID_B } });
  await flush();
  assert.equal(h.states.at(-1).detail.discovery.lease, ID_B);
  h.session.stop();
  assert.equal(h.states.at(-1).detail.discovery, null);
});

test('receiver auth is outside its URL, waiting checks stay on one socket, and capture is never requested', async t => {
  let captures = 0;
  const h = harness(t, { mediaDevices: { getUserMedia() { captures++; throw new Error('Unexpected capture.'); } } });
  const ws = await h.begin();
  assert.equal(ws.url, `wss://rendezvous.abox.tools/broadcast/${CODE}`);
  assert.ok(!ws.url.includes(LISTEN_KEY));
  assert.deepEqual(ws.sent[0], { type: 'auth', role: 'listener', key: LISTEN_KEY });
  await h.clock.advance(3000);
  assert.equal(h.sockets.length, 1);
  assert.equal(ws.sent.filter(frame => frame.type === 'check').length, 3);
  ws.message(ready());
  ws.message(offer());
  await flush();
  assert.equal(captures, 0);
  assert.equal(h.peers.length, 1);
  assert.deepEqual(h.peers[0].senders, []);
  assert.deepEqual(h.peers[0].config.iceServers, []);
  assert.equal(h.peers[0].transceivers[0].direction, 'recvonly');
  assert.ok(!h.peers[0].remoteDescription.sdp.includes('srflx'));
  const answer = ws.sent.find(frame => frame.type === 'answer');
  assert.equal(answer.connection, CONN_A);
  assert.equal(answer.generation, GEN_A);
  assert.ok(!('to' in answer) && !('from' in answer));
  assert.ok(!answer.sdp.includes('srflx'));
  const stream = { name: 'remote voice' };
  h.peers[0].receive(stream);
  assert.equal(h.streams.length, 0);
  h.peers[0].connect();
  assert.equal(h.streams.at(-1), stream);
  assert.equal(h.states.at(-1).key, 'listener-listening');
});

test('a late microphone permission grant cannot restart a stopped host', async t => {
  const permission = deferred();
  const mic = microphone();
  const h = harness(t, { role: 'host', mediaDevices: { getUserMedia: () => permission.promise } });
  const starting = h.session.start();
  await flush();
  h.session.stop({ notify: false, state: null });
  permission.resolve(mic.stream);
  assert.equal(await starting, false);
  assert.equal(mic.track.stops, 1);
  assert.equal(h.sockets.length, 0);
});

test('Stop during the authenticated readiness callback cannot return a successful start', async t => {
  const mic = microphone();
  const h = harness(t, { role: 'host', mediaDevices: { getUserMedia: async () => mic.stream } });
  const reportState = h.session.onState;
  h.session.onState = (key, detail) => {
    reportState(key, detail);
    if (key === 'host-ready') h.session.stop({ notify: false, state: null });
  };
  const starting = h.session.start();
  await flush();
  const ws = h.sockets[0];
  ws.open();
  ws.message({ type: 'host-ready', generation: GEN_A });
  await flush();
  assert.equal(await starting, false);
  assert.equal(mic.track.stops, 1);
  assert.equal(ws.closed, true);
  assert.equal(ws.sent.filter(frame => frame.type === 'end').length, 0);
});

test('one disabled host track serves sendonly peers and release still mutes during signaling loss', async t => {
  const mic = microphone();
  const constraints = [];
  const h = harness(t, { role: 'host', endpoint: 'ws://127.0.0.1:8794',
    mediaDevices: { async getUserMedia(options) { constraints.push(options); return mic.stream; } } });
  const ws = await h.begin();
  assert.equal(ws.url, `ws://127.0.0.1:8794/broadcast/${CODE}`);
  assert.deepEqual(ws.sent[0], { type: 'auth', role: 'host', key: KEY, listenKey: LISTEN_KEY });
  assert.deepEqual(constraints, [{ audio: true, video: false }]);
  assert.equal(mic.track.enabled, false);
  ws.message({ type: 'join', id: ID_A, generation: GEN_A });
  ws.message({ type: 'join', id: ID_B, generation: GEN_A });
  await flush();
  assert.equal(h.peers.length, 2);
  for (const peer of h.peers) {
    assert.equal(peer.senders[0].track, mic.track);
    assert.equal(peer.transceivers[0].direction, 'sendonly');
    assert.deepEqual(peer.config.iceServers, []);
  }
  for (const frame of ws.sent.filter(frame => frame.type === 'offer')) {
    assert.ok(!('from' in frame));
    assert.ok(!frame.sdp.includes('srflx'));
    assert.equal(frame.generation, GEN_A);
  }
  h.peers[0].connect();
  h.session.setTalking(true);
  assert.equal(mic.track.enabled, true);
  ws.message({ type: 'leave', id: ID_A, generation: GEN_A });
  await flush();
  ws.serverClose();
  assert.equal(h.peers[0].closed, false);
  assert.equal(mic.track.enabled, true);
  assert.equal(h.states.at(-1).detail.signaling, false);
  assert.equal(h.states.at(-1).detail.listeners, 0);
  assert.equal(h.states.at(-1).detail.directReady, true);
  h.session.setTalking(false);
  assert.equal(mic.track.enabled, false);
  h.session.setTalking(true);
  assert.equal(mic.track.enabled, true);
  h.peers[0].fail();
  await h.clock.advance(1000);
  assert.equal(mic.track.enabled, false);
});

test('same-generation socket recovery keeps healthy audio until its replacement connects', async t => {
  const h = harness(t);
  const first = await h.begin(ready());
  first.message(offer());
  await flush();
  const oldPeer = h.peers[0];
  const staleTrack = oldPeer.ontrack;
  const oldStream = { name: 'old voice' };
  oldPeer.receive(oldStream);
  oldPeer.connect();
  first.serverClose();
  assert.equal(oldPeer.closed, false);
  assert.equal(h.streams.at(-1), oldStream);
  await h.clock.advance(999);
  assert.equal(h.sockets.length, 1);
  await h.clock.advance(1);
  const next = h.sockets[1];
  next.open();
  next.message(ready(ID_B));
  next.message(offer(ID_B, CONN_B));
  await flush();
  assert.equal(oldPeer.closed, false);
  const newStream = { name: 'new voice' };
  h.peers[1].receive(newStream);
  assert.equal(h.streams.at(-1), oldStream);
  h.peers[1].connect();
  assert.equal(oldPeer.closed, true);
  assert.equal(h.streams.at(-1), newStream);
  staleTrack({ track: { kind: 'audio' }, streams: [{ name: 'stale voice' }] });
  assert.equal(h.streams.at(-1), newStream);
  next.message(ready(ID_B, GEN_B));
  await flush();
  assert.equal(h.peers[1].closed, true);
  assert.equal(h.streams.at(-1), null);
  next.message(offer(ID_B, CONN_A, GEN_A));
  await flush();
  assert.equal(h.peers.length, 2);
});

test('waiting preserves healthy audio, while deliberate End stops all retries', async t => {
  const h = harness(t);
  const ws = await h.begin(ready());
  ws.message(offer());
  await flush();
  h.peers[0].receive({ name: 'direct voice' });
  h.peers[0].connect();
  ws.message({ type: 'waiting' });
  await flush();
  await h.clock.advance(3000);
  assert.equal(h.peers[0].closed, false);
  assert.equal(h.sockets.length, 1);
  assert.equal(ws.sent.filter(frame => frame.type === 'check').length, 3);
  assert.equal(h.states.at(-1).key, 'listener-reconnecting');
  assert.equal(h.states.at(-1).detail.directReady, true);
  assert.equal(h.streams.at(-1).name, 'direct voice');
  ws.message({ type: 'ended' });
  await flush();
  assert.equal(h.peers[0].closed, true);
  assert.equal(h.states.at(-1).key, 'broadcast-ended');
  await h.clock.advance(5000);
  assert.equal(h.sockets.length, 1);
});

test('capacity and unknown network failures back off without overlapping handshakes', async t => {
  const h = harness(t);
  const ws = await h.begin();
  ws.message({ type: 'error', error: 'full' });
  await flush();
  assert.equal(h.states.at(-1).key, 'error-full');
  await h.clock.advance(2999);
  assert.equal(h.sockets.length, 1);
  await h.clock.advance(1);
  assert.equal(h.sockets.length, 2);
  await h.clock.advance(10000);
  assert.equal(h.sockets[1].closed, true);
  assert.equal(h.sockets.length, 2);
  await h.clock.advance(1999);
  assert.equal(h.sockets.length, 2);
  await h.clock.advance(1);
  assert.equal(h.sockets.length, 3);
  h.sockets[2].open();
  h.sockets[2].message({ type: 'waiting' });
  await flush();
  await h.clock.advance(3000);
  assert.equal(h.sockets.length, 3);
  h.session.stop();
  assert.equal(h.sockets[2].sent.at(-1).type, 'leave');
});

test('early ICE is bounded, non-host candidates are rejected, and authority fields are checked', async t => {
  const h = harness(t);
  const ws = await h.begin(ready());
  const candidates = Array.from({ length: 140 }, (_unused, index) => ({
    candidate: `candidate:1 1 UDP 2122260223 192.168.1.20 ${50000 + index} typ host`,
    sdpMid: '0', sdpMLineIndex: 0,
  }));
  for (const candidate of candidates) ws.message({ type: 'candidate', from: 'host', to: ID_A,
    generation: GEN_A, connection: CONN_A, candidate });
  ws.message({ ...offer(), from: ID_B });
  ws.message({ ...offer(), to: ID_B });
  ws.message(offer());
  await flush(2000);
  assert.equal(h.peers.length, 1);
  assert.ok(h.peers[0].candidates.length > 0 && h.peers[0].candidates.length <= 128);
  assert.deepEqual(h.peers[0].candidates[0], candidates[0]);
  h.peers[0].candidate(candidates[0]);
  h.peers[0].candidate({ candidate: 'candidate:2 1 UDP 2122260223 198.51.100.2 50000 typ srflx',
    sdpMid: '0', sdpMLineIndex: 0 });
  const sent = ws.sent.filter(frame => frame.type === 'candidate');
  assert.equal(sent.length, 1);
  assert.equal(sent[0].connection, CONN_A);
  assert.ok(!('from' in sent[0]) && !('to' in sent[0]));
  for (let i = 0; i < 5; i++) ws.message(ready());
  await flush();
  assert.equal(h.peers.length, 1);
  assert.equal(h.peers[0].closed, false);
});

test('microphone loss stops capture without End, while explicit host stop sends End', async t => {
  const mic = microphone();
  const h = harness(t, { role: 'host', mediaDevices: { getUserMedia: async () => mic.stream } });
  const ws = await h.begin();
  ws.message({ type: 'join', id: ID_A, generation: GEN_A });
  await flush();
  mic.track.onended();
  assert.equal(mic.track.stops, 1);
  assert.equal(h.peers[0].closed, true);
  assert.equal(h.states.at(-1).key, 'error-microphone');
  assert.equal(ws.sent.filter(frame => frame.type === 'end').length, 0);
  const secondMic = microphone();
  const other = harness(t, { role: 'host', mediaDevices: { getUserMedia: async () => secondMic.stream } });
  const second = await other.begin();
  other.session.stop();
  assert.deepEqual(second.sent.at(-1), { type: 'end', generation: GEN_A });
  assert.equal(secondMic.track.stops, 1);
});

test('host grace preserves departing audio briefly and evicts it before exceeding ten peers', async t => {
  const mic = microphone();
  const h = harness(t, { role: 'host', mediaDevices: { getUserMedia: async () => mic.stream } });
  const ws = await h.begin();
  const ids = Array.from({ length: 11 }, (_unused, index) =>
    `77777777-7777-4777-8777-${String(index).padStart(12, '0')}`);
  for (const id of ids.slice(0, 10)) ws.message({ type: 'join', id, generation: GEN_A });
  await flush(512);
  for (const peer of h.peers) peer.connect();
  assert.equal(h.session._peers.size, 10);
  ws.message({ type: 'leave', id: ids[0], generation: GEN_A });
  await flush();
  assert.equal(h.peers[0].closed, false);
  ws.message({ type: 'join', id: ids[10], generation: GEN_A });
  await flush();
  assert.equal(h.peers[0].closed, true);
  assert.equal(h.session._peers.size, 10);
  ws.message({ type: 'leave', id: ids[1], generation: GEN_A });
  await flush();
  await h.clock.advance(9999);
  assert.equal(h.peers[1].closed, false);
  await h.clock.advance(1);
  assert.equal(h.peers[1].closed, true);
  assert.ok(h.session._peers.size <= 10);
});

test('a stale offer for a departed listener preserves the host and its other listeners', async t => {
  const mic = microphone();
  const h = harness(t, { role: 'host', mediaDevices: { getUserMedia: async () => mic.stream } });
  const ws = await h.begin();
  ws.message({ type: 'join', id: ID_A, generation: GEN_A });
  await flush();
  h.peers[0].connect();
  ws.message({ type: 'join', id: ID_B, generation: GEN_A });
  await flush();
  assert.ok(ws.sent.some(frame => frame.type === 'offer' && frame.to === ID_B));

  // The listener's departure can reach the service before the offer above.
  // Its leave notification is followed by rejection of that in-flight offer.
  ws.message({ type: 'leave', id: ID_B, generation: GEN_A });
  ws.message({ type: 'error', error: 'stale' });
  await flush();
  assert.equal(h.peers[1].closed, true);
  assert.equal(h.peers[0].closed, false);
  assert.equal(ws.closed, false);
  assert.equal(mic.track.stops, 0);
  assert.equal(h.states.at(-1).detail.listeners, 1);
  h.session.setTalking(true);
  assert.equal(mic.track.enabled, true);
  assert.equal(h.states.at(-1).key, 'host-talking');

  ws.message({ type: 'error', error: 'unauthorized' });
  await flush();
  assert.equal(h.peers[0].closed, true);
  assert.equal(ws.closed, true);
  assert.equal(mic.track.enabled, false);
  assert.equal(mic.track.stops, 1);
  assert.equal(h.states.at(-1).key, 'error-access');
});

test('unauthorized or replaced hosts stop capture and cannot reconnect automatically', async t => {
  const mic = microphone();
  const h = harness(t, { role: 'host', mediaDevices: { getUserMedia: async () => mic.stream } });
  const ws = await h.begin();
  ws.serverClose(4403);
  assert.equal(mic.track.stops, 1);
  assert.equal(h.states.at(-1).key, 'error-access');
  await h.clock.advance(30000);
  assert.equal(h.sockets.length, 1);
});

test('temporary socket backpressure retains the unsent tail and flushes it in order', async t => {
  const h = harness(t);
  const ws = await h.begin(ready());
  ws.bufferedAmount = 70000;
  ws.message(offer());
  await flush();
  const candidates = [50000, 50001].map(port => ({
    candidate: `candidate:1 1 UDP 2122260223 192.168.1.20 ${port} typ host`,
    sdpMid: '0', sdpMLineIndex: 0,
  }));
  for (const candidate of candidates) h.peers[0].candidate(candidate);
  await h.clock.advance(1000);
  assert.equal(ws.sent.filter(frame => frame.type === 'answer').length, 0);
  assert.equal(ws.sent.filter(frame => frame.type === 'candidate').length, 0);
  ws.pauseAfterSends = ws.sent.length + 1;
  ws.bufferedAmount = 0;
  await h.clock.advance(1000);
  assert.equal(ws.sent.filter(frame => frame.type === 'answer').length, 1);
  assert.equal(ws.sent.filter(frame => frame.type === 'candidate').length, 0);
  ws.pauseAfterSends = null;
  ws.bufferedAmount = 0;
  await h.clock.advance(1000);
  const delivered = ws.sent.filter(frame => ['answer', 'candidate'].includes(frame.type));
  assert.deepEqual(delivered.map(frame => frame.type), ['answer', 'candidate', 'candidate']);
  assert.deepEqual(delivered.slice(1).map(frame => frame.candidate), candidates);
});

test('pong keeps signaling alive and a missing pong reconnects without cutting healthy audio', async t => {
  const h = harness(t);
  const ws = await h.begin(ready());
  ws.message(offer());
  await flush();
  const voice = { name: 'direct voice' };
  h.peers[0].receive(voice);
  h.peers[0].connect();
  await h.clock.advance(29999);
  assert.equal(ws.sent.filter(frame => frame === 'ping').length, 0);
  await h.clock.advance(1);
  assert.equal(ws.sent.filter(frame => frame === 'ping').length, 1);
  ws.message('pong');
  await h.clock.advance(10000);
  assert.equal(ws.closed, false);
  assert.equal(h.sockets.length, 1);
  await h.clock.advance(20000);
  assert.equal(ws.sent.filter(frame => frame === 'ping').length, 2);
  await h.clock.advance(9999);
  assert.equal(ws.closed, false);
  await h.clock.advance(1);
  assert.equal(ws.closed, true);
  assert.equal(h.peers[0].closed, false);
  assert.equal(h.streams.at(-1), voice);
  assert.equal(h.states.at(-1).key, 'listener-reconnecting');
  assert.equal(h.states.at(-1).detail.directReady, true);
  await h.clock.advance(1000);
  assert.equal(h.sockets.length, 2);
});

test('Stop clears an outstanding pong deadline and parked replies do not delay keepalive', async t => {
  const h = harness(t);
  const ws = await h.begin();
  for (let i = 0; i < 30; i++) {
    await h.clock.advance(1000);
    ws.message({ type: 'waiting' });
    await flush();
  }
  assert.equal(ws.sent.filter(frame => frame === 'ping').length, 1);
  h.session.stop();
  assert.equal(ws.closed, true);
  assert.equal(h.clock.tasks.size, 0);
  await h.clock.advance(30000);
  assert.equal(h.sockets.length, 1);
});

test('host source mute releases broadcast capture without End or automatic recovery', async t => {
  const mic = microphone();
  const audioSession = new NativeAudioSession();
  const h = harness(t, { role: 'host', audioSession,
    mediaDevices: { getUserMedia: async () => mic.stream } });
  const ws = await h.begin();
  ws.message({ type: 'join', id: ID_A, generation: GEN_A });
  await flush();
  h.peers[0].connect();
  h.session.setTalking(true);
  const staleMute = mic.track.onmute;
  mic.track.onstop = () => {
    assert.equal(audioSession.listeners.size, 0);
    assert.equal(mic.track.onmute, null);
    assert.equal(mic.track.onended, null);
  };
  mic.track.onmute();
  assert.equal(mic.track.enabled, false);
  assert.equal(mic.track.stops, 1);
  assert.equal(h.peers[0].closed, true);
  assert.equal(ws.closed, true);
  assert.equal(h.states.at(-1).key, 'error-microphone');
  assert.ok(!ws.sent.some(frame => frame.type === 'end'));
  audioSession.transition('active');
  staleMute();
  h.session.setTalking(true);
  await h.clock.advance(30000);
  assert.equal(mic.track.enabled, false);
  assert.equal(mic.track.stops, 1);
  assert.equal(h.sockets.length, 1);
});

test('native interruption stops a broadcast source but does not interrupt its receive-only session', async t => {
  const audioSession = new NativeAudioSession();
  const mic = microphone();
  const host = harness(t, { role: 'host', audioSession,
    mediaDevices: { getUserMedia: async () => mic.stream } });
  const receiver = harness(t, { audioSession,
    mediaDevices: { getUserMedia() { throw new Error('A receiver must not capture.'); } } });
  const hostSocket = await host.begin();
  const listenerSocket = await receiver.begin(ready());
  listenerSocket.message(offer());
  await flush();
  const voice = { name: 'direct voice' };
  receiver.peers[0].receive(voice);
  receiver.peers[0].connect();
  host.session.setTalking(true);
  assert.equal(audioSession.additions, 1);
  audioSession.transition('interrupted');
  assert.equal(mic.track.enabled, false);
  assert.equal(mic.track.stops, 1);
  assert.equal(host.states.at(-1).key, 'error-microphone');
  assert.equal(hostSocket.closed, true);
  assert.ok(!hostSocket.sent.some(frame => frame.type === 'end'));
  assert.equal(audioSession.listeners.size, 0);
  assert.equal(listenerSocket.closed, false);
  assert.equal(receiver.peers[0].closed, false);
  assert.equal(receiver.streams.at(-1), voice);
  assert.equal(receiver.states.at(-1).key, 'listener-listening');
});
