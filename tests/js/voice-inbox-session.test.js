import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { InboxSession } from '../../shared/js/voice-session.js';

if (!globalThis.crypto) Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
const CODE = 'a'.repeat(64);
const KEY = 'h'.repeat(43);
const SENDER_KEY = 's'.repeat(43);
const PROOF = 'p'.repeat(43);
const ID_A = 'b'.repeat(64);
const ID_B = 'c'.repeat(64);
const GEN_A = '11111111-1111-4111-8111-111111111111';
const GEN_B = '22222222-2222-4222-8222-222222222222';
const CONN_A = '33333333-3333-4333-8333-333333333333';
const CONN_B = '44444444-4444-4444-8444-444444444444';
const BASE_SDP = 'v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n' +
  'm=audio 9 UDP/TLS/RTP/SAVPF 111\r\nc=IN IP4 0.0.0.0\r\na=mid:0\r\n' +
  'a=candidate:1 1 UDP 2122260223 192.168.1.20 50000 typ host\r\n' +
  'a=candidate:2 1 UDP 2122260223 198.51.100.2 50001 typ srflx raddr 192.168.1.20 rport 50000\r\n';
const sdp = direction => BASE_SDP + 'a=' + direction + '\r\n';
const DISCOVERY = { code: CODE, lease: 'lease', name: 'Support desk', locked: true, tool: 'voice-oncall' };
const hostReady = (generation = GEN_A) => ({ type: 'host-ready', generation, discovery: DISCOVERY });
const ready = (generation = GEN_A, muted = false) =>
  ({ type: 'ready', id: ID_A, generation, muted, talking: false });
const join = (id = ID_A, generation = GEN_A, muted = false) =>
  ({ type: 'join', id, generation, name: id === ID_A ? 'Alice' : 'Bob', muted, talking: false });
const offer = (connection = CONN_A, generation = GEN_A) =>
  ({ type: 'offer', from: 'host', to: ID_A, generation, connection, sdp: sdp('recvonly') });
const candidate = port => ({ candidate: 'candidate:1 1 UDP 2122260223 192.168.1.20 ' + port + ' typ host',
  sdpMid: '0', sdpMLineIndex: 0 });
const flush = async (turns = 128) => { for (let i = 0; i < turns; i++) await Promise.resolve(); };
const deferred = () => {
  let resolve;
  const promise = new Promise(yes => { resolve = yes; });
  return { promise, resolve };
};

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
      assert.ok(++count < 1000, 'Recovery must not create an immediate timer loop.');
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

function harness(t, { role = 'host', mediaDevices, passwordProof = null, remoteGate, audioSession } = {}) {
  const clock = new Clock();
  const sockets = [];
  const peers = [];
  const states = [];
  const streams = [];
  const rows = [];
  const mic = microphone();
  let captures = 0;
  const captureConstraints = [];
  class Socket {
    constructor(url) {
      assert.equal(sockets.filter(ws => ws.readyState < 2).length, 0,
        'Only one signaling handshake may be alive.');
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
    }
    close(code) { this.closed = true; this.readyState = 3; this.closeCode = code; }
  }
  class Peer {
    constructor(config) {
      this.config = config;
      this.connectionState = 'new';
      this.localDescription = this.remoteDescription = null;
      this.transceivers = [];
      this.candidates = [];
      this.closed = false;
      peers.push(this);
    }
    addTransceiver(kind, { direction }) {
      assert.equal(kind, 'audio');
      const transceiver = { direction, sender: { track: null } };
      this.transceivers.push(transceiver);
      return transceiver;
    }
    addTrack(track, stream) {
      let transceiver = this.transceivers.find(item => !item.sender.track);
      if (!transceiver) transceiver = this.addTransceiver('audio', { direction: 'sendrecv' });
      transceiver.sender = { track, stream };
      return transceiver.sender;
    }
    getSenders() { return this.transceivers.map(item => item.sender); }
    getTransceivers() { return this.transceivers; }
    async createOffer() { return { type: 'offer', sdp: sdp(this.transceivers[0].direction) }; }
    async createAnswer() { return { type: 'answer', sdp: sdp(this.transceivers[0].direction) }; }
    async setLocalDescription(description) { this.localDescription = description; }
    async setRemoteDescription(description) {
      if (remoteGate) await remoteGate.promise;
      this.remoteDescription = description;
      if (!this.transceivers.length) this.addTransceiver('audio', { direction: 'sendrecv' });
    }
    async addIceCandidate(value) { this.candidates.push(value); }
    connect() { this.connectionState = 'connected'; this.onconnectionstatechange?.(); }
    receive(stream) { this.ontrack?.({ track: { kind: 'audio' }, streams: [stream] }); }
    candidate(value) { this.onicecandidate?.({ candidate: value && { toJSON: () => value, ...value } }); }
    fail() { this.connectionState = 'failed'; this.onconnectionstatechange?.(); }
    close() { this.closed = true; this.connectionState = 'closed'; }
  }
  const session = new InboxSession({
    role, code: CODE, key: role === 'host' ? KEY : SENDER_KEY,
    roomName: 'Support desk', name: 'Alice', passwordProof,
    endpoint: 'ws://127.0.0.1:8794', Socket, Peer, clock, audioSession,
    mediaDevices: mediaDevices || { async getUserMedia(options) {
      captures++;
      captureConstraints.push(options);
      return mic.stream;
    } },
    onState: (key, detail) => states.push({ key, detail }),
    onStream: (stream, id) => streams.push({ stream, id }),
    onParticipants: participants => rows.push(participants),
  });
  t.after(async () => {
    session.stop({ notify: false, state: null });
    await flush();
    assert.equal(clock.tasks.size, 0, 'Stop must clear peer, moderation, retry and heartbeat deadlines.');
    assert.equal(sockets.filter(ws => ws.readyState < 2).length, 0);
    if (audioSession) assert.equal(audioSession.listeners.size, 0);
  });
  const begin = async frame => {
    const starting = session.start();
    await flush();
    const ws = sockets.at(-1);
    assert.ok(ws);
    ws.open();
    ws.message(frame || (role === 'host' ? hostReady() : ready()));
    await flush();
    assert.equal(await starting, true);
    return ws;
  };
  const connected = async (ws, id = ID_A) => {
    ws.message(join(id));
    await flush();
    const peer = peers.at(-1);
    const stream = { name: id };
    peer.receive(stream);
    peer.connect();
    return { peer, stream };
  };
  return { session, clock, sockets, peers, states, streams, rows, mic,
    captures: () => captures, captureConstraints, begin, connected,
    participants: () => rows.at(-1) || [], controls: ws => ws.sent.filter(frame =>
      ['moderate', 'kick'].includes(frame.type)) };
}

test('inbox host never captures and creates separate recvonly streams with authenticated discovery', async t => {
  const h = harness(t, { passwordProof: PROOF });
  const ws = await h.begin();
  assert.equal(h.captures(), 0);
  assert.equal(h.session._stream, null);
  assert.equal(ws.url, 'ws://127.0.0.1:8794/inbox/' + CODE);
  assert.ok(!ws.url.includes(KEY) && !ws.url.includes(PROOF));
  assert.deepEqual(ws.sent[0], { type: 'auth', role: 'host', key: KEY,
    passwordProof: PROOF, roomName: 'Support desk' });
  assert.deepEqual(h.states.at(-1).detail.discovery, DISCOVERY);
  const a = await h.connected(ws);
  const b = await h.connected(ws, ID_B);
  assert.equal(h.peers.length, 2);
  assert.deepEqual(h.participants().map(row => [row.name, row.connected, row.muted]),
    [['Alice', true, false], ['Bob', true, false]]);
  assert.deepEqual(h.streams.slice(-2), [{ id: ID_A, stream: a.stream }, { id: ID_B, stream: b.stream }]);
  for (const peer of h.peers) {
    assert.deepEqual(peer.config.iceServers, []);
    assert.equal(peer.getSenders()[0].track, null);
    assert.equal(peer.transceivers[0].direction, 'recvonly');
  }
  const offers = ws.sent.filter(frame => frame.type === 'offer');
  assert.equal(offers.length, 2);
  for (const frame of offers) {
    assert.equal(frame.generation, GEN_A);
    assert.ok(!('from' in frame));
    assert.ok(frame.sdp.includes('a=recvonly') && !frame.sdp.includes('srflx'));
  }
  h.session.setTalking(true);
  assert.ok(!ws.sent.some(frame => frame.type === 'status'));
  h.session.stop();
  assert.deepEqual(ws.sent.at(-1), { type: 'end', generation: GEN_A });
  assert.ok(h.peers.every(peer => peer.closed));
});

test('sender captures once, answers sendonly, and receives no remote stream', async t => {
  const h = harness(t, { role: 'sender', passwordProof: PROOF });
  const ws = await h.begin();
  assert.equal(h.captures(), 1);
  assert.deepEqual(h.captureConstraints, [{ audio: true, video: false }]);
  assert.deepEqual(ws.sent[0], { type: 'auth', role: 'sender', key: SENDER_KEY,
    passwordProof: PROOF, name: 'Alice' });
  assert.equal(h.mic.track.enabled, false);
  ws.message(offer());
  await flush();
  const peer = h.peers[0];
  assert.equal(peer.getSenders()[0].track, h.mic.track);
  assert.equal(peer.transceivers[0].direction, 'sendonly');
  assert.equal(peer.ontrack, undefined);
  peer.receive({ name: 'forbidden host audio' });
  assert.deepEqual(h.streams, []);
  assert.deepEqual(peer.config.iceServers, []);
  assert.ok(!peer.remoteDescription.sdp.includes('srflx'));
  const answer = ws.sent.find(frame => frame.type === 'answer');
  assert.equal(answer.connection, CONN_A);
  assert.equal(answer.generation, GEN_A);
  assert.ok(!('to' in answer) && !('from' in answer));
  assert.ok(answer.sdp.includes('a=sendonly') && !answer.sdp.includes('srflx'));
  peer.connect();
  h.session.setTalking(true);
  assert.equal(h.mic.track.enabled, true);
  assert.deepEqual(ws.sent.at(-1), { type: 'status', generation: GEN_A, talking: true });
  h.session.setTalking(false);
  assert.equal(h.mic.track.enabled, false);
  h.session.stop();
  assert.equal(ws.sent.at(-1).type, 'leave');
  assert.equal(h.mic.track.stops, 1);
});

test('late permission and Stop during authenticated readiness cannot resurrect sender capture', async t => {
  const permission = deferred();
  const mic = microphone();
  const audioSession = new NativeAudioSession();
  const h = harness(t, { role: 'sender', audioSession, mediaDevices: { getUserMedia: () => permission.promise } });
  const starting = h.session.start();
  h.session.stop({ notify: false, state: null });
  permission.resolve(mic.stream);
  assert.equal(await starting, false);
  assert.equal(mic.track.stops, 1);
  assert.equal(h.sockets.length, 0);
  assert.equal(audioSession.additions, 0);
  const other = harness(t, { role: 'sender' });
  const report = other.session.onState;
  other.session.onState = (key, detail) => {
    report(key, detail);
    if (detail.signaling) other.session.stop({ notify: false, state: null });
  };
  const pending = other.session.start();
  await flush();
  const ws = other.sockets[0];
  ws.open();
  ws.message(ready());
  await flush();
  assert.equal(await pending, false);
  assert.equal(other.mic.track.stops, 1);
  assert.equal(ws.closed, true);
});

test('waiting checks preserve direct sender audio and moderation never automatically resumes capture', async t => {
  const h = harness(t, { role: 'sender' });
  const ws = await h.begin();
  ws.message(offer());
  await flush();
  h.peers[0].connect();
  h.session.setTalking(true);
  ws.message({ type: 'waiting' });
  await flush();
  await h.clock.advance(3000);
  assert.equal(h.sockets.length, 1);
  assert.equal(ws.sent.filter(frame => frame.type === 'check').length, 3);
  assert.equal(h.mic.track.enabled, true);
  assert.equal(h.states.at(-1).key, 'sender-reconnecting');
  assert.equal(h.states.at(-1).detail.waiting, true);
  assert.equal(h.states.at(-1).detail.directReady, true);
  ws.message(ready(GEN_A, true));
  await flush();
  assert.equal(h.mic.track.enabled, false);
  h.session.setTalking(true);
  assert.equal(h.mic.track.enabled, false);
  ws.message({ type: 'moderated', generation: GEN_A, muted: false });
  await flush();
  assert.equal(h.mic.track.enabled, false);
  h.session.setTalking(true);
  assert.equal(h.mic.track.enabled, true);
  ws.message({ type: 'moderated', generation: GEN_A, muted: true });
  ws.message(ready(GEN_B, false));
  await flush();
  assert.equal(h.peers[0].closed, true);
  assert.equal(h.mic.track.enabled, false);
  ws.message({ type: 'moderated', generation: GEN_A, muted: false });
  await flush();
  assert.equal(h.mic.track.enabled, false);
  ws.message(offer(CONN_B, GEN_B));
  await flush();
  assert.equal(h.peers.length, 2);
  assert.equal(h.peers[1].getSenders()[0].track.enabled, false);
});

test('stable sender identity hands host audio over without a stale callback replacing the new stream', async t => {
  const h = harness(t);
  const ws = await h.begin();
  const first = await h.connected(ws);
  const lateTrack = first.peer.ontrack;
  const firstOffer = ws.sent.find(frame => frame.type === 'offer');
  ws.message(join());
  await flush();
  assert.equal(h.participants().length, 1);
  assert.equal(first.peer.closed, false);
  const replacement = h.peers[1];
  const secondOffer = ws.sent.filter(frame => frame.type === 'offer').at(-1);
  assert.notEqual(firstOffer.connection, secondOffer.connection);
  const voice = { name: 'reconnected Alice' };
  replacement.receive(voice);
  assert.equal(h.streams.at(-1).stream, first.stream);
  replacement.connect();
  assert.equal(first.peer.closed, true);
  assert.deepEqual(h.streams.at(-1), { id: ID_A, stream: voice });
  assert.ok(!h.streams.some(value => value.id === ID_A && value.stream === null));
  lateTrack({ track: { kind: 'audio' }, streams: [{ name: 'obsolete Alice' }] });
  assert.equal(h.streams.at(-1).stream, voice);
  ws.message({ type: 'answer', from: ID_A, to: 'host', generation: GEN_A,
    connection: firstOffer.connection, sdp: sdp('sendonly') });
  await flush();
  assert.equal(replacement.remoteDescription, null);
  ws.message({ type: 'answer', from: ID_A, to: 'host', generation: GEN_A,
    connection: secondOffer.connection, sdp: sdp('sendonly') });
  await flush();
  assert.equal(replacement.remoteDescription.type, 'answer');
});

test('sender reconnect keeps its key and capture muted while buffering only matching early ICE', async t => {
  const h = harness(t, { role: 'sender' });
  const ws = await h.begin();
  ws.message(offer());
  await flush();
  const first = h.peers[0];
  first.connect();
  h.session.setTalking(false);
  ws.serverClose();
  await h.clock.advance(1000);
  const next = h.sockets[1];
  next.open();
  assert.equal(next.sent[0].key, SENDER_KEY);
  next.message(ready());
  next.message({ type: 'candidate', from: 'host', to: ID_A,
    generation: GEN_A, connection: CONN_B, candidate: candidate(50001) });
  next.message({ type: 'candidate', from: 'host', to: ID_B,
    generation: GEN_A, connection: CONN_B, candidate: candidate(50002) });
  next.message({ type: 'candidate', from: 'host', to: ID_A,
    generation: GEN_B, connection: CONN_B, candidate: candidate(50003) });
  next.message(offer(CONN_B));
  await flush();
  assert.equal(first.closed, false);
  const replacement = h.peers[1];
  assert.deepEqual(replacement.candidates, [candidate(50001)]);
  assert.equal(replacement.getSenders()[0].track.enabled, false);
  replacement.connect();
  assert.equal(first.closed, true);
  assert.equal(h.captures(), 1);
  assert.equal(h.session._id, ID_A);
});

test('wrong password disposes sender capture and stops all reconnect attempts', async t => {
  const h = harness(t, { role: 'sender', passwordProof: PROOF });
  const starting = h.session.start();
  await flush();
  const ws = h.sockets[0];
  ws.open();
  ws.message({ type: 'error', error: 'password' });
  await flush();
  assert.equal(await starting, false);
  assert.equal(h.mic.track.stops, 1);
  assert.equal(h.mic.track.enabled, false);
  assert.equal(ws.closed, true);
  assert.equal(h.states.at(-1).key, 'error-password');
  assert.equal(h.clock.tasks.size, 0);
  await h.clock.advance(30000);
  assert.equal(h.sockets.length, 1);
});

test('kick is terminal even while an earlier offer is stalled', async t => {
  const gate = deferred();
  const h = harness(t, { role: 'sender', remoteGate: gate });
  const ws = await h.begin();
  ws.message(offer());
  await flush();
  h.session.setTalking(true);
  assert.equal(h.mic.track.enabled, true);
  ws.message({ type: 'kicked' });
  await flush();
  assert.equal(h.states.at(-1).key, 'kicked');
  assert.equal(h.mic.track.stops, 1);
  assert.equal(h.mic.track.enabled, false);
  assert.equal(h.peers[0].closed, true);
  assert.equal(h.clock.tasks.size, 0);
  gate.resolve();
  await flush();
  assert.equal(ws.sent.filter(frame => frame.type === 'answer').length, 0);
  await h.clock.advance(30000);
  assert.equal(h.sockets.length, 1);
});

test('capture loss leaves without End and deliberate End closes the sender permanently', async t => {
  const h = harness(t, { role: 'sender' });
  const ws = await h.begin();
  ws.message(offer());
  await flush();
  h.mic.track.onended();
  assert.equal(h.states.at(-1).key, 'error-microphone');
  assert.equal(h.mic.track.stops, 1);
  assert.equal(h.peers[0].closed, true);
  assert.ok(!ws.sent.some(frame => frame.type === 'end' || frame.type === 'leave'));
  const other = harness(t, { role: 'sender' });
  const second = await other.begin();
  second.message({ type: 'ended' });
  await flush();
  assert.equal(other.states.at(-1).key, 'inbox-ended');
  assert.equal(other.mic.track.stops, 1);
  await other.clock.advance(30000);
  assert.equal(other.sockets.length, 1);
});

test('host stale and invalid signaling errors leave other participants and the room active', async t => {
  const h = harness(t);
  const ws = await h.begin();
  const a = await h.connected(ws);
  const b = await h.connected(ws, ID_B);
  ws.message({ type: 'error', error: 'stale' });
  ws.message({ type: 'error', error: 'invalid' });
  await flush();
  assert.equal(ws.closed, false);
  assert.equal(a.peer.closed, false);
  assert.equal(b.peer.closed, false);
  assert.equal(h.participants().length, 2);
  assert.equal(h.captures(), 0);
  assert.ok(!h.states.some(state => state.key === 'error-access'));
  assert.equal(h.session.moderate(ID_A, true), true);
  assert.deepEqual(h.controls(ws).at(-1), { type: 'moderate', to: ID_A,
    generation: GEN_A, muted: true });
});

test('local mute is applied before acknowledgement and queued intent survives older moderation replies', async t => {
  const h = harness(t);
  const ws = await h.begin();
  const a = await h.connected(ws);
  h.session.moderate(ID_A, true);
  assert.equal(h.participants()[0].muted, true);
  assert.equal(a.peer.closed, false);
  h.session.moderate(ID_A, false);
  assert.equal(h.controls(ws).length, 1);
  ws.message({ type: 'moderated', id: ID_A, generation: GEN_A, muted: true });
  await flush();
  assert.equal(h.controls(ws).length, 2);
  assert.equal(h.controls(ws).at(-1).muted, false);
  assert.equal(h.participants()[0].muted, true);
  ws.message({ type: 'moderated', id: ID_A, generation: GEN_A, muted: false });
  await flush();
  assert.equal(h.participants()[0].muted, false);
  assert.equal(h.session._controlFlight, null);
  ws.message({ type: 'status', id: ID_A, generation: GEN_A, talking: true });
  await flush();
  assert.equal(h.participants()[0].talking, true);
  h.session.moderate(ID_A, true);
  ws.message({ type: 'status', id: ID_A, generation: GEN_A, talking: true });
  await flush();
  assert.equal(h.participants()[0].talking, false);
});

test('a refused kick retains membership and RTC, identifies the action, and permits Unmute', async t => {
  const h = harness(t);
  const ws = await h.begin();
  const a = await h.connected(ws);
  await h.connected(ws, ID_B);
  assert.equal(h.session.kick(ID_A), true);
  assert.equal(h.session.moderate(ID_B, true), true);
  assert.equal(h.controls(ws).length, 1);
  assert.equal(a.peer.closed, false);
  assert.equal(h.participants().find(row => row.id === ID_A).pendingRemoval, true);
  assert.equal(h.participants().find(row => row.id === ID_A).muted, true);
  ws.message({ type: 'error', error: 'moderation-full' });
  await flush();
  const refusal = h.states.findLast(state => state.key === 'error-moderation-full');
  assert.deepEqual(refusal.detail.moderation, { id: ID_A, action: 'kick' });
  const alice = h.participants().find(row => row.id === ID_A);
  assert.ok(alice);
  assert.equal(alice.pendingRemoval, false);
  assert.equal(alice.muted, true);
  assert.equal(alice.connected, true);
  assert.equal(a.peer.closed, false);
  assert.equal(h.controls(ws).length, 2);
  assert.equal(h.controls(ws).at(-1).to, ID_B);
  ws.message({ type: 'moderated', id: ID_B, generation: GEN_A, muted: true });
  await flush();
  assert.equal(h.session.moderate(ID_A, false), true);
  ws.message({ type: 'moderated', id: ID_A, generation: GEN_A, muted: false });
  await flush();
  assert.equal(h.participants().find(row => row.id === ID_A).muted, false);
  assert.equal(a.peer.closed, false);
  assert.equal(h.session.kick(ID_A), true);
  ws.message({ type: 'leave', id: ID_A, generation: GEN_A });
  await flush();
  assert.equal(a.peer.closed, true);
  assert.ok(!h.participants().some(row => row.id === ID_A));
  assert.deepEqual(h.streams.findLast(value => value.id === ID_A), { id: ID_A, stream: null });
  assert.equal(h.session._controlFlight, null);
});

test('offline removal stays pending and a new generation reapplies protection only to rejoined identities', async t => {
  const h = harness(t);
  const ws = await h.begin();
  const a = await h.connected(ws);
  await h.connected(ws, ID_B);
  ws.serverClose();
  assert.equal(h.session.kick(ID_A), true);
  h.session.moderate(ID_B, true);
  assert.equal(a.peer.closed, false);
  assert.equal(h.participants().find(row => row.id === ID_A).pendingRemoval, true);
  await h.clock.advance(1000);
  const next = h.sockets[1];
  next.open();
  next.message(hostReady(GEN_B));
  await flush();
  assert.equal(a.peer.closed, true);
  assert.equal(h.controls(next).length, 0);
  next.message(join(ID_A, GEN_B));
  await flush();
  assert.equal(h.controls(next).length, 1);
  assert.deepEqual(h.controls(next)[0], { type: 'kick', to: ID_A, generation: GEN_B });
  assert.equal(h.participants()[0].pendingRemoval, true);
  assert.equal(h.peers.length, 2, 'Pending removal must not start a fresh audio offer.');
  next.message({ type: 'moderated', id: ID_A, generation: GEN_A, muted: false });
  await flush();
  assert.equal(h.participants()[0].muted, true);
  assert.equal(h.session._controlFlight.generation, GEN_B);
  next.message({ type: 'leave', id: ID_A, generation: GEN_B });
  await flush();
  assert.equal(h.peers.length, 2);
  assert.equal(h.session._controlFlight, null);
  assert.equal(h.controls(next).length, 1);
  next.message(join(ID_B, GEN_B));
  await flush();
  assert.equal(h.controls(next).length, 2);
  assert.deepEqual(h.controls(next).at(-1), { type: 'moderate', to: ID_B, generation: GEN_B, muted: true });
});

test('moderation timeout reconnects once without cutting healthy audio, and departed targets do not block others', async t => {
  const h = harness(t);
  const ws = await h.begin();
  const a = await h.connected(ws);
  const b = await h.connected(ws, ID_B);
  h.session.moderate(ID_A, true);
  h.session.moderate(ID_B, true);
  await h.clock.advance(9999);
  assert.equal(ws.closed, false);
  await h.clock.advance(1);
  assert.equal(ws.closed, true);
  assert.equal(a.peer.closed, false);
  assert.equal(b.peer.closed, false);
  await h.clock.advance(1000);
  const next = h.sockets[1];
  next.open();
  next.message(hostReady());
  await flush();
  assert.equal(h.controls(next).length, 1);
  assert.equal(h.controls(next)[0].to, ID_A);
  next.message({ type: 'leave', id: ID_A, generation: GEN_A });
  await flush();
  assert.equal(h.controls(next).length, 2);
  assert.equal(h.controls(next).at(-1).to, ID_B);
  next.message({ type: 'moderated', id: ID_B, generation: GEN_A, muted: true });
  await flush();
  assert.equal(h.session._controlFlight, null);
  assert.equal(b.peer.closed, false);
  h.session.stop({ notify: false, state: null });
  assert.equal(h.clock.tasks.size, 0);
  await h.clock.advance(30000);
  assert.equal(h.sockets.length, 2);
});

test('failed sender RTC gets a fresh registration instead of idempotent checks forever', async t => {
  const h = harness(t, { role: 'sender' });
  const ws = await h.begin();
  ws.message(offer());
  await flush();
  h.peers[0].connect();
  h.session.setTalking(true);
  h.peers[0].fail();
  assert.equal(ws.closed, true);
  assert.equal(h.mic.track.enabled, false);
  await h.clock.advance(1000);
  const next = h.sockets[1];
  next.open();
  next.message(ready());
  next.message(offer(CONN_B));
  await flush();
  assert.equal(h.peers.length, 2);
  assert.equal(h.captures(), 1);
  assert.equal(h.peers[1].getSenders()[0].track.enabled, false);
  assert.equal(next.sent[0].key, SENDER_KEY);
});

test('a previously removed identity admitted again stays visible until removal succeeds or is refused', async t => {
  const h = harness(t);
  const ws = await h.begin();
  const a = await h.connected(ws);
  h.session.kick(ID_A);
  ws.message({ type: 'leave', id: ID_A, generation: GEN_A });
  await flush();
  assert.equal(a.peer.closed, true);
  assert.equal(h.participants().length, 0);
  ws.serverClose();
  await h.clock.advance(1000);
  const next = h.sockets[1];
  next.open();
  next.message(hostReady(GEN_B));
  next.message(join(ID_A, GEN_B));
  await flush();
  assert.equal(h.participants().length, 1);
  assert.equal(h.participants()[0].pendingRemoval, true);
  assert.equal(h.participants()[0].muted, true);
  assert.equal(h.peers.length, 1);
  assert.deepEqual(h.controls(next), [{ type: 'kick', to: ID_A, generation: GEN_B }]);
  next.message({ type: 'error', error: 'moderation-full' });
  await flush();
  assert.equal(h.participants()[0].pendingRemoval, false);
  assert.equal(h.participants()[0].muted, true);
  assert.deepEqual(h.states.at(-1).detail.moderation, { id: ID_A, action: 'kick' });
  assert.equal(h.session.moderate(ID_A, false), true);
  next.message({ type: 'moderated', id: ID_A, generation: GEN_B, muted: false });
  await flush();
  await h.clock.advance(1000);
  assert.equal(h.participants()[0].muted, false);
  assert.equal(h.peers.length, 2);
  assert.equal(h.peers[1].closed, false);
  assert.equal(h.peers[1].transceivers[0].direction, 'recvonly');
});

test('late events from retiring host audio cannot cancel the replacement or silence retained audio', async t => {
  const h = harness(t);
  const ws = await h.begin();
  const first = await h.connected(ws);
  ws.message(join());
  await flush();
  const replacement = h.peers[1];
  await h.clock.advance(2000);
  first.peer.receive({ name: 'late old track' });
  first.peer.connectionState = 'disconnected';
  first.peer.onconnectionstatechange();
  first.peer.connect();
  assert.equal(first.peer.closed, false);
  assert.equal(replacement.closed, false);
  assert.deepEqual(h.streams.at(-1), { id: ID_A, stream: first.stream });
  assert.equal(h.streams.filter(value => value.stream === null).length, 0);
  const voice = { name: 'new direct audio' };
  replacement.receive(voice);
  replacement.connect();
  assert.equal(first.peer.closed, true);
  assert.deepEqual(h.streams.at(-1), { id: ID_A, stream: voice });
  assert.equal(h.streams.filter(value => value.stream === null).length, 0);
});

test('a retiring sender reconnect event cannot drop itself or extend its bounded grace', async t => {
  const h = harness(t, { role: 'sender' });
  const ws = await h.begin();
  ws.message(offer());
  await flush();
  const first = h.peers[0];
  first.connect();
  ws.message(offer(CONN_B));
  await flush();
  assert.equal(first.closed, false);
  await h.clock.advance(5000);
  first.connectionState = 'disconnected';
  first.onconnectionstatechange();
  first.connect();
  assert.equal(first.closed, false);
  assert.equal(h.mic.track.enabled, false);
  await h.clock.advance(4999);
  assert.equal(first.closed, false);
  await h.clock.advance(1);
  assert.equal(first.closed, true);
  assert.equal(h.mic.track.enabled, false);
});

test('source track mute releases latched sender capture and unregisters native interruption before stopping tracks', async t => {
  const audioSession = new NativeAudioSession();
  const h = harness(t, { role: 'sender', audioSession });
  const ws = await h.begin();
  ws.message(offer());
  await flush();
  h.peers[0].connect();
  h.session.setTalking(true);
  const lateMute = h.mic.track.onmute;
  assert.equal(h.mic.track.enabled, true);
  assert.equal(audioSession.listeners.size, 1);
  h.mic.track.onstop = () => {
    assert.equal(audioSession.listeners.size, 0);
    assert.equal(h.mic.track.onmute, null);
    assert.equal(h.mic.track.onended, null);
  };
  h.mic.track.onmute();
  assert.equal(h.mic.track.enabled, false);
  assert.equal(h.mic.track.stops, 1);
  assert.equal(h.peers[0].closed, true);
  assert.equal(ws.closed, true);
  assert.equal(h.states.at(-1).key, 'error-microphone');
  assert.ok(!ws.sent.some(frame => frame.type === 'end' || frame.type === 'leave'));
  assert.equal(h.clock.tasks.size, 0);
  audioSession.transition('active');
  lateMute();
  h.session.setTalking(true);
  await h.clock.advance(30000);
  assert.equal(h.mic.track.enabled, false);
  assert.equal(h.mic.track.stops, 1);
  assert.equal(h.captures(), 1);
  assert.equal(h.sockets.length, 1);
});

test('a microphone grant arriving during a native interruption is refused before signaling starts', async t => {
  const permission = deferred();
  const mic = microphone();
  const audioSession = new NativeAudioSession();
  const h = harness(t, { role: 'sender', audioSession,
    mediaDevices: { getUserMedia: () => permission.promise } });
  const starting = h.session.start();
  await flush();
  assert.equal(audioSession.listeners.size, 0);
  audioSession.transition('interrupted');
  permission.resolve(mic.stream);
  assert.equal(await starting, false);
  assert.equal(mic.track.stops, 1);
  assert.equal(mic.track.enabled, false);
  assert.equal(mic.track.onmute, null);
  assert.equal(audioSession.additions, 1);
  assert.equal(audioSession.listeners.size, 0);
  assert.equal(h.states.at(-1).key, 'error-microphone');
  assert.equal(h.sockets.length, 0);
  assert.equal(h.clock.tasks.size, 0);
});

test('native sender interruption requires a new muted capture and old epoch handlers cannot stop its replacement', async t => {
  const audioSession = new NativeAudioSession();
  const firstMic = microphone();
  const secondMic = microphone();
  const captures = [firstMic.stream, secondMic.stream];
  const h = harness(t, { role: 'sender', audioSession,
    mediaDevices: { getUserMedia: async () => captures.shift() } });
  const first = await h.begin();
  const staleMute = firstMic.track.onmute;
  const staleNative = [...audioSession.listeners][0];
  h.session.setTalking(true);
  assert.equal(firstMic.track.enabled, true);
  audioSession.transition('interrupted');
  assert.equal(firstMic.track.stops, 1);
  assert.equal(firstMic.track.enabled, false);
  assert.equal(first.closed, true);
  assert.equal(audioSession.listeners.size, 0);
  audioSession.transition('active');
  await h.clock.advance(1000);
  assert.equal(h.sockets.length, 1);
  const next = await h.begin();
  assert.equal(secondMic.track.enabled, false);
  assert.equal(audioSession.listeners.size, 1);
  staleMute();
  audioSession.state = 'interrupted';
  staleNative();
  audioSession.state = 'active';
  assert.equal(secondMic.track.stops, 0);
  assert.equal(next.closed, false);
  h.session.setTalking(true);
  audioSession.transition('interrupted');
  assert.equal(secondMic.track.enabled, false);
  assert.equal(secondMic.track.stops, 1);
  assert.equal(audioSession.listeners.size, 0);
  assert.equal(h.states.at(-1).key, 'error-microphone');
});

test('receive-only inbox host ignores native capture interruptions and never subscribes for microphone recovery', async t => {
  const audioSession = new NativeAudioSession();
  audioSession.state = 'interrupted';
  const h = harness(t, { audioSession });
  const ws = await h.begin();
  const voice = await h.connected(ws);
  audioSession.transition('active');
  audioSession.transition('interrupted');
  assert.equal(audioSession.additions, 0);
  assert.equal(h.captures(), 0);
  assert.equal(ws.closed, false);
  assert.equal(voice.peer.closed, false);
  assert.equal(h.streams.at(-1).stream, voice.stream);
  assert.equal(h.participants()[0].connected, true);
});
test('already-muted and ended microphone grants are refused and later hardware recovery cannot enable capture', async t => {
  for (const initial of [{ muted: true, readyState: 'live' }, { muted: false, readyState: 'ended' }]) {
    const permission = deferred();
    const mic = microphone();
    Object.assign(mic.track, initial);
    const audioSession = new NativeAudioSession();
    const h = harness(t, { role: 'sender', audioSession,
      mediaDevices: { getUserMedia: () => permission.promise } });
    const starting = h.session.start();
    await flush();
    permission.resolve(mic.stream);
    assert.equal(await starting, false);
    assert.equal(mic.track.stops, 1);
    assert.equal(mic.track.enabled, false);
    assert.equal(mic.track.onmute, null);
    assert.equal(mic.track.onended, null);
    assert.equal(audioSession.additions, 0);
    assert.equal(h.sockets.length, 0);
    assert.equal(h.clock.tasks.size, 0);
    assert.equal(h.states.at(-1).key, 'error-microphone');
    mic.track.muted = false;
    mic.track.readyState = 'live';
    audioSession.transition('active');
    h.session.setTalking(true);
    await h.clock.advance(1000);
    assert.equal(mic.track.enabled, false);
    assert.equal(mic.track.stops, 1);
    assert.equal(h.sockets.length, 0);
  }
});
