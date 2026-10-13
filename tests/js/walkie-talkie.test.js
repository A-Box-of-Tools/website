import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { BroadcastSession } from '../../tools/walkie-talkie/src/session.js';

if (!globalThis.crypto) {
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
}

const CONNECTION_A = '11111111-1111-4111-8111-111111111111';
const CONNECTION_B = '22222222-2222-4222-8222-222222222222';
const LISTENER = '33333333-3333-4333-8333-333333333333';
const SDP = 'v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n' +
  'm=audio 9 UDP/TLS/RTP/SAVPF 111\r\nc=IN IP4 0.0.0.0\r\na=mid:0\r\na=sendonly\r\n';
const offer = (connection = CONNECTION_A, seq = 1) => ({
  seq, payload: { type: 'offer', connection, sdp: SDP },
});
const flush = async () => {
  for (let i = 0; i < 40; i++) await Promise.resolve();
};
const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};

// Advancing the clock exercises requests and peer deadlines without real waiting.
class Clock {
  time = 0;
  nextId = 0;
  tasks = new Map();
  now = () => this.time;
  setTimeout = (callback, delay) => {
    const id = ++this.nextId;
    this.tasks.set(id, { at: this.time + Math.max(0, delay), callback });
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
      assert.ok(++count < 1000, 'Retry scheduling must not produce an immediate loop.');
      this.time = next.task.at;
      this.tasks.delete(next.id);
      next.task.callback();
      await flush();
    }
    this.time = target;
    await flush();
  }
}

function microphone() {
  const track = { kind: 'audio', enabled: true, stops: 0, onended: null,
    stop() { this.stops++; } };
  return { track, stream: { getTracks: () => [track], getAudioTracks: () => [track] } };
}

function harness(t, { role = 'listener', routes = {}, getUserMedia } = {}) {
  const clock = new Clock();
  const calls = [];
  const peers = [];
  const states = [];
  const streams = [];
  const state = { generation: role === 'host' ? 0 : 1, online: role !== 'host',
    ended: false, talking: false };
  class Peer {
    constructor(config) {
      this.config = config;
      this.connectionState = 'new';
      this.localDescription = null;
      this.remoteDescription = null;
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
    async setRemoteDescription(description) { this.remoteDescription = description; }
    async addIceCandidate(candidate) { this.candidates.push(candidate); }
    connect() {
      this.connectionState = 'connected';
      this.onconnectionstatechange?.();
    }
    receive(stream) { this.ontrack?.({ track: { kind: 'audio' }, streams: [stream] }); }
    close() { this.closed = true; this.connectionState = 'closed'; }
  }
  const defaults = {
    '/api/config': () => ({ ...state, role }),
    '/api/host/start': () => {
      state.generation++;
      state.online = true;
      state.ended = false;
      return { ...state };
    },
    '/api/host/poll': body => {
      state.talking = body.talking;
      return { ...state, listeners: [], messages: [] };
    },
    '/api/listener/join': body => ({ ...state, id: body.id }),
    '/api/listener/poll': () => ({ ...state, messages: [] }),
    '/api/signal': () => ({ ...state }),
    '/api/listener/leave': () => ({ ...state }),
    '/api/host/end': () => {
      state.online = false;
      state.ended = true;
      return { ...state };
    },
  };
  const fetchImpl = async (path, options) => {
    const body = options.body ? JSON.parse(options.body) : null;
    calls.push({ path, body, options });
    assert.equal(options.headers.Authorization, 'Bearer test-capability');
    assert.equal(options.mode, 'same-origin');
    const route = routes[path] || defaults[path];
    assert.ok(route, `Unexpected route: ${path}`);
    const result = await route(body, options, state);
    const status = result.status || 200;
    return { ok: status >= 200 && status < 300, status,
      json: async () => result.data || result };
  };
  const session = new BroadcastSession({ role, token: 'test-capability', clock,
    fetchImpl, PeerConnection: Peer, getUserMedia,
    onState: (key, detail) => states.push({ key, detail }),
    onStream: stream => streams.push(stream) });
  t.after(async () => {
    session.stop({ notify: false, state: null });
    await flush();
    assert.equal(clock.tasks.size, 0, 'Stopping must retire request and peer timers.');
  });
  return { session, clock, calls, peers, states, streams, state,
    callsTo: path => calls.filter(call => call.path === path) };
}

test('a LAN receiver works without randomUUID and never captures a microphone', async t => {
  const previousCrypto = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  Object.defineProperty(globalThis, 'crypto', { configurable: true,
    value: { getRandomValues: webcrypto.getRandomValues.bind(webcrypto) } });
  t.after(() => Object.defineProperty(globalThis, 'crypto', previousCrypto));
  let microphoneRequests = 0;
  const h = harness(t, {
    getUserMedia: () => { microphoneRequests++; throw new Error('Unexpected capture.'); },
    routes: { '/api/listener/poll': (_body, _options, state) =>
      ({ ...state, messages: [offer()] }) },
  });
  assert.equal(await h.session.start(), true);
  await flush();
  assert.equal(microphoneRequests, 0);
  const id = h.callsTo('/api/listener/join')[0].body.id;
  assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.equal(h.peers.length, 1);
  assert.deepEqual(h.peers[0].senders, []);
  assert.deepEqual(h.peers[0].config.iceServers, []);
  const answer = h.callsTo('/api/signal')[0].body;
  assert.equal(answer.payload.type, 'answer');
  assert.equal(answer.payload.connection, CONNECTION_A);
  assert.equal(answer.generation, 1);
  const incoming = { name: 'remote audio' };
  h.peers[0].receive(incoming);
  h.peers[0].connect();
  assert.equal(h.streams.at(-1), incoming);
  assert.equal(h.states.at(-1).key, 'listener-listening');
  await h.clock.advance(1000);
  assert.equal(h.callsTo('/api/listener/poll')[1].body.ack, 1);
  assert.equal(microphoneRequests, 0);
});

test('stopping while microphone permission is pending retires a late grant', async t => {
  const permission = deferred();
  const mic = microphone();
  const h = harness(t, { role: 'host', getUserMedia: () => permission.promise });
  const starting = h.session.start();
  await flush();
  h.session.stop({ notify: false, state: null });
  permission.resolve(mic.stream);
  assert.equal(await starting, false);
  assert.equal(mic.track.stops, 1);
  assert.equal(h.callsTo('/api/host/start').length, 0);
  assert.equal(h.peers.length, 0);
});

test('a host starts silent, sends audio only, and release mutes immediately', async t => {
  const mic = microphone();
  const constraints = [];
  const h = harness(t, { role: 'host', getUserMedia: options => {
    constraints.push(options);
    return Promise.resolve(mic.stream);
  }, routes: { '/api/host/poll': (body, _options, state) =>
    ({ ...state, talking: body.talking, listeners: [LISTENER], messages: [] }) } });
  assert.equal(await h.session.start(), true);
  await flush();
  assert.deepEqual(constraints, [{ audio: true, video: false }]);
  assert.equal(mic.track.enabled, false);
  assert.equal(h.peers.length, 1);
  assert.equal(h.peers[0].senders[0].track, mic.track);
  assert.equal(h.peers[0].transceivers[0].direction, 'sendonly');
  assert.deepEqual(h.peers[0].config.iceServers, []);
  assert.equal(h.callsTo('/api/signal')[0].body.payload.type, 'offer');
  h.session.setTalking(true);
  assert.equal(mic.track.enabled, true);
  await h.clock.advance(1000);
  assert.equal(h.callsTo('/api/host/poll').at(-1).body.talking, true);
  h.session.setTalking(false);
  assert.equal(mic.track.enabled, false);
  h.session.stop();
  assert.equal(mic.track.stops, 1);
  assert.equal(h.peers[0].closed, true);
  h.session.setTalking(true);
  assert.equal(mic.track.enabled, false);
});

test('a failed heartbeat mutes the host until its local service returns', async t => {
  const mic = microphone();
  let unavailable = false;
  const h = harness(t, { role: 'host', getUserMedia: async () => mic.stream,
    routes: { '/api/host/poll': (_body, _options, state) => {
      if (unavailable) throw new Error('Local service unavailable.');
      return { ...state, listeners: [], messages: [] };
    } } });
  await h.session.start();
  await flush();
  h.session.setTalking(true);
  unavailable = true;
  await h.clock.advance(1000);
  assert.equal(mic.track.enabled, false);
  assert.equal(h.states.at(-1).key, 'host-reconnecting');
  h.session.setTalking(true);
  assert.equal(mic.track.enabled, false);
  unavailable = false;
  await h.clock.advance(1000);
  h.session.setTalking(true);
  assert.equal(mic.track.enabled, true);
});

test('a restarted host gives the receiver a fresh identity and retires stale callbacks', async t => {
  const h = harness(t, { routes: { '/api/listener/poll': (body, _options, state) => {
    const messages = body.generation === state.generation ?
      [offer(state.generation === 1 ? CONNECTION_A : CONNECTION_B, state.generation)] : [];
    return { ...state, messages };
  } } });
  await h.session.start();
  await flush();
  const firstId = h.callsTo('/api/listener/join')[0].body.id;
  const firstPeer = h.peers[0];
  const staleTrackCallback = firstPeer.ontrack;
  firstPeer.receive({ name: 'first host' });
  firstPeer.connect();
  h.state.generation = 2;
  await h.clock.advance(1000);
  assert.equal(firstPeer.closed, true);
  assert.equal(h.streams.at(-1), null);
  const secondId = h.callsTo('/api/listener/join').at(-1).body.id;
  assert.notEqual(secondId, firstId);
  assert.equal(h.callsTo('/api/listener/leave')[0].body.id, firstId);
  staleTrackCallback({ track: { kind: 'audio' }, streams: [{ name: 'stale host' }] });
  assert.equal(h.streams.at(-1), null);
  await h.clock.advance(1000);
  assert.equal(h.peers.length, 2);
  assert.equal(h.callsTo('/api/listener/poll').at(-1).body.id, secondId);
  assert.equal(h.callsTo('/api/listener/poll').at(-1).body.generation, 2);
  assert.equal(h.callsTo('/api/listener/poll').at(-1).body.ack, 0);
  assert.equal(h.callsTo('/api/signal').at(-1).body.payload.connection, CONNECTION_B);
  h.peers[1].receive({ name: 'new host' });
  assert.equal(h.streams.at(-1).name, 'new host');
});

test('a hung signaling request has one bounded attempt before a fresh retry', async t => {
  let active = 0;
  let maximumActive = 0;
  let aborted = 0;
  const h = harness(t, { routes: {
    '/api/listener/poll': (_body, _options, state) => ({ ...state, messages: [offer()] }),
    '/api/signal': (_body, options) => new Promise((_resolve, reject) => {
      active++;
      maximumActive = Math.max(maximumActive, active);
      options.signal.addEventListener('abort', () => {
        active--;
        aborted++;
        reject(new Error('Request aborted.'));
      }, { once: true });
    }),
  } });
  await h.session.start();
  await flush();
  assert.equal(active, 1);
  await h.clock.advance(9999);
  assert.equal(h.callsTo('/api/listener/poll').length, 1);
  assert.equal(h.callsTo('/api/listener/join').length, 1);
  await h.clock.advance(1);
  assert.equal(aborted, 1);
  assert.equal(maximumActive, 1);
  assert.equal(active, 1);
  assert.equal(h.callsTo('/api/listener/poll').length, 2);
  assert.equal(h.callsTo('/api/listener/join').length, 2);
  assert.notEqual(h.callsTo('/api/listener/join')[0].body.id,
    h.callsTo('/api/listener/join')[1].body.id);
  h.session.stop({ notify: false, state: null });
  await flush();
  assert.equal(active, 0);
  assert.equal(maximumActive, 1);
});

test('a lost host retries each second while an explicit end stops retries', async t => {
  const h = harness(t, { routes: { '/api/listener/poll': (_body, _options, state) =>
    ({ ...state, messages: state.online ? [offer()] : [] }) } });
  await h.session.start();
  await flush();
  h.peers[0].connect();
  h.state.online = false;
  await h.clock.advance(2000);
  assert.equal(h.peers[0].closed, true);
  assert.equal(h.callsTo('/api/listener/poll').length, 3);
  assert.equal(h.states.at(-1).key, 'listener-reconnecting');
  h.state.ended = true;
  await h.clock.advance(1000);
  assert.equal(h.states.at(-1).key, 'broadcast-ended');
  const endedAt = h.callsTo('/api/listener/poll').length;
  await h.clock.advance(5000);
  assert.equal(h.callsTo('/api/listener/poll').length, endedAt);
});

test('a full channel keeps retrying until receiver capacity is available', async t => {
  let full = true;
  const h = harness(t, { routes: {
    '/api/listener/join': (body, _options, state) => full ?
      { status: 409, data: { ...state, error: 'full' } } : { ...state, id: body.id },
    '/api/listener/poll': (_body, _options, state) => ({ ...state, messages: [offer()] }),
  } });
  assert.equal(await h.session.start(), true);
  await flush();
  assert.equal(h.states.at(-1).key, 'error-full');
  await h.clock.advance(2999);
  assert.equal(h.callsTo('/api/listener/join').length, 3);
  assert.equal(h.callsTo('/api/listener/poll').length, 0);
  full = false;
  await h.clock.advance(1);
  assert.equal(h.callsTo('/api/listener/join').length, 4);
  assert.equal(h.peers.length, 1);
  h.peers[0].connect();
  assert.equal(h.states.at(-1).key, 'listener-listening');
});

test('a receiver can recover when its initial config request fails', async t => {
  const h = harness(t, { routes: {
    '/api/config': () => { throw new Error('Local service temporarily unavailable.'); },
    '/api/listener/poll': (_body, _options, state) => ({ ...state, messages: [offer()] }),
  } });
  assert.equal(await h.session.start(), true);
  await flush();
  assert.ok(h.states.some(state => state.key === 'listener-reconnecting'));
  assert.equal(h.callsTo('/api/listener/join').length, 1);
  assert.equal(h.callsTo('/api/listener/poll')[0].body.generation, 1);
  assert.equal(h.peers.length, 1);
});

test('an expired receiver registration rejoins with a fresh identity', async t => {
  let expired = true;
  const h = harness(t, { routes: {
    '/api/listener/poll': (_body, _options, state) => {
      if (expired) {
        expired = false;
        return { status: 404, data: { ...state, error: 'unknown' } };
      }
      return { ...state, messages: [offer(CONNECTION_B)] };
    },
  } });
  await h.session.start();
  await flush();
  assert.equal(h.states.at(-1).key, 'listener-reconnecting');
  await h.clock.advance(1000);
  const joined = h.callsTo('/api/listener/join');
  assert.equal(joined.length, 2);
  assert.notEqual(joined[0].body.id, joined[1].body.id);
  assert.equal(h.callsTo('/api/listener/leave')[0].body.id, joined[0].body.id);
  assert.equal(h.peers.length, 1);
  assert.equal(h.callsTo('/api/signal').at(-1).body.payload.connection, CONNECTION_B);
});
