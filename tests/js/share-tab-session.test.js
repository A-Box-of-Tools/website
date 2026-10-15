import test from 'node:test';
import assert from 'node:assert/strict';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { TabSession } from '../../tools/share-tab/src/session.js';
import { CHANNEL, PROTOCOL } from '../../tools/share-tab/src/protocol.js';

const CODE = 'tab-abcdefghijklmnop';
const SDP = 'v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\na=mid:0\r\n';
const RELAY = { urls: ['turn:relay.example:3478'], username: 'temporary', credential: 'secret' };

class Events extends EventTarget {
  emit(type, fields = {}) {
    const event = Object.assign(new Event(type), fields);
    this.dispatchEvent(event);
    this[`on${type}`]?.(event);
  }
}
class Channel extends Events {
  readyState = 'connecting'; sent = [];
  label = CHANNEL;
  open() { this.readyState = 'open'; this.emit('open'); }
  receive(type, values = {}) { this.emit('message', { data: JSON.stringify({ protocol: PROTOCOL, type, ...values }) }); }
  send(value) { assert.equal(this.readyState, 'open'); this.sent.push(JSON.parse(value)); }
  close() { this.readyState = 'closed'; }
}
class Track extends Events {
  readyState = 'live'; stops = 0;
  constructor(kind = 'video') { super(); this.kind = kind; }
  stop() { this.readyState = 'ended'; this.stops += 1; }
  end() { this.readyState = 'ended'; this.emit('ended'); }
}
class Stream {
  constructor(tracks = []) { this.tracks = [...tracks]; }
  getTracks() { return [...this.tracks]; }
  getVideoTracks() { return this.tracks.filter((track) => track.kind === 'video'); }
}
const source = () => new Stream([new Track(), new Track('audio')]);
async function settle() { for (let i = 0; i < 4; i += 1) await nextTurn(); }

function fixture(t) {
  const sockets = [], peers = [], states = [], requests = [], viewers = [], streams = [];
  class Socket extends Events {
    readyState = 0; sent = [];
    constructor(url) {
      super(); this.url = url; sockets.push(this);
      queueMicrotask(() => {
        if (this.readyState === 3) return;
        this.readyState = 1; this.emit('open');
        if (new URL(url).searchParams.get('role') === 'viewer') this.receive({ type: 'ready' });
      });
    }
    send(text) {
      assert.equal(this.readyState, 1);
      this.sent.push(text === 'ping' ? text : JSON.parse(text));
      if (text === 'ping') queueMicrotask(() => this.emit('message', { data: 'pong' }));
    }
    receive(value) { this.emit('message', { data: JSON.stringify(value) }); }
    close() { this.readyState = 3; }
    drop(code = 1006) { this.readyState = 3; this.emit('close', { code }); }
  }
  class PeerConnection extends Events {
    connectionState = 'new'; localDescription = null; remoteDescription = null;
    transceivers = []; ice = []; closed = false;
    constructor(config) { super(); this.config = config; peers.push(this); }
    createDataChannel(label) { this.channel = new Channel(); this.channel.label = label; return this.channel; }
    async createOffer() { return { type: 'offer', sdp: SDP }; }
    async createAnswer() { return { type: 'answer', sdp: SDP }; }
    async setLocalDescription(value) { this.localDescription = value; }
    async setRemoteDescription(value) { this.remoteDescription = value; }
    async addIceCandidate(value) { this.ice.push(value); }
    addTransceiver(track, options) { const value = { direction: options.direction, sender: { track } }; this.transceivers.push(value); return value; }
    getTransceivers() { return this.transceivers; }
    async getStats() { return new Map(); }
    close() { this.closed = true; this.connectionState = 'closed'; }
  }
  const session = new TabSession({ Socket, PeerConnection, MediaStream: Stream,
    onState(key, role) { states.push({ key, role }); }, onRequests(value) { requests.push(value); },
    onViewers(value) { viewers.push(value); }, onStream(value) { streams.push(value); } });
  t.after(() => session.stop());
  return { session, sockets, peers, states, requests, viewers, streams };
}

function signal(socket, from, data) { socket.receive({ type: 'signal', from, data: { protocol: PROTOCOL, ...data } }); }
async function request(f, id = 'v:1') {
  signal(f.sockets[0], id, { dial: true }); await settle();
  const peer = f.peers.at(-1);
  signal(f.sockets[0], id, { description: { type: 'answer', sdp: SDP } }); await settle();
  peer.channel.open(); peer.channel.receive('hello'); peer.channel.receive('request', { note: id }); await settle();
  return peer;
}
async function viewer(f) {
  await f.session.connect(CODE, 'Viewer');
  const peer = f.peers[0], channel = new Channel();
  peer.emit('datachannel', { channel }); channel.open(); channel.receive('hello'); await settle();
  return { peer, channel };
}

test('a tab host opens only its own ordinary STUN room and no media before consent', async (t) => {
  const f = fixture(t), stream = source(); await f.session.startHost(stream, CODE);
  const url = new URL(f.sockets[0].url);
  assert.equal(url.searchParams.get('tool'), 'share-tab');
  assert.equal(url.searchParams.has('local'), false);
  const peer = await request(f);
  assert.ok(peer.config.iceServers.some((server) => server.urls.some((url) => url.startsWith('stun:'))));
  assert.equal(peer.transceivers.length, 0);
  assert.deepEqual(f.requests.at(-1), [{ id: 'v:1', note: 'v:1' }]);
  assert.equal(f.session.approve('v:1'), true); await settle();
  assert.equal(peer.transceivers.length, 0);
  peer.channel.receive('approval-ack'); await settle();
  assert.equal(peer.transceivers.length, 1);
  assert.equal(peer.transceivers[0].direction, 'sendonly');
  assert.equal(peer.transceivers[0].sender.track, stream.getVideoTracks()[0]);
  peer.channel.receive('approval-ack'); await settle();
  assert.equal(peer.transceivers.length, 1);
});

test('a forged acknowledgement never substitutes for the host approval', async (t) => {
  const f = fixture(t), stream = source(); await f.session.startHost(stream, CODE);
  const peer = await request(f);
  peer.channel.receive('approval-ack'); await settle();
  assert.equal(peer.closed, true);
  assert.equal(peer.transceivers.length, 0);
  assert.equal(stream.getVideoTracks()[0].readyState, 'live');
});

test('the host permits one approved viewer and keeps other pending viewers private', async (t) => {
  const f = fixture(t); await f.session.startHost(source(), CODE);
  const first = await request(f, 'v:1'), second = await request(f, 'v:2');
  assert.equal(f.session.approve('v:1'), true);
  assert.equal(f.session.approve('v:2'), false);
  first.channel.receive('approval-ack'); await settle();
  assert.equal(first.transceivers.length, 1); assert.equal(second.transceivers.length, 0);
  assert.equal(f.session.disconnectViewer('v:1'), true);
  assert.equal(first.closed, true); assert.equal(second.closed, false);
  assert.equal(f.session.approve('v:2'), true);
});

test('denial cannot be undone by another request on the same peer', async (t) => {
  const f = fixture(t); await f.session.startHost(source(), CODE);
  const peer = await request(f); assert.equal(f.session.deny('v:1'), true);
  peer.channel.receive('request', { note: 'Again' }); await settle();
  assert.equal(f.session.approve('v:1'), false); assert.equal(peer.transceivers.length, 0);
});

test('pending connection limits reject excess peers without making encoders', async (t) => {
  const f = fixture(t); await f.session.startHost(source(), CODE);
  for (let i = 0; i < 5; i += 1) signal(f.sockets[0], `v:${i}`, { dial: true });
  await settle();
  assert.equal(f.peers.length, 4);
  assert.ok(f.sockets[0].sent.some((message) => message.to === 'v:4' && message.data?.refused === 'busy'));
  assert.ok(f.peers.every((peer) => peer.transceivers.length === 0));
});

test('a hello without an admission request cannot occupy a pending slot indefinitely', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const f = fixture(t); await f.session.startHost(source(), CODE);
  signal(f.sockets[0], 'v:1', { dial: true }); await settle();
  const peer = f.peers[0];
  signal(f.sockets[0], 'v:1', { description: { type: 'answer', sdp: SDP } }); await settle();
  peer.channel.open(); peer.channel.receive('hello');
  t.mock.timers.tick(20001); await settle();
  assert.equal(peer.closed, true); assert.equal(f.session.hasViewers, false);
});

test('a complete request can wait for the human beyond the transport deadline', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const f = fixture(t); await f.session.startHost(source(), CODE);
  const peer = await request(f);
  t.mock.timers.tick(20001); await settle();
  assert.equal(peer.closed, false); assert.equal(f.session.approve('v:1'), true);
});

test('early ICE candidates wait for the remote description', async (t) => {
  const f = fixture(t); await f.session.startHost(source(), CODE);
  signal(f.sockets[0], 'v:1', { dial: true }); await settle();
  const candidate = { candidate: 'candidate:one 1 udp 1 192.0.2.1 1234 typ srflx' };
  signal(f.sockets[0], 'v:1', { candidate }); await settle();
  assert.deepEqual(f.peers[0].ice, []);
  signal(f.sockets[0], 'v:1', { description: { type: 'answer', sdp: SDP } }); await settle();
  assert.deepEqual(f.peers[0].ice, [candidate]);
});

test('stopping capture retires every peer and prevents a late acknowledgement from sending', async (t) => {
  const f = fixture(t), stream = source(); await f.session.startHost(stream, CODE);
  const peer = await request(f); f.session.approve('v:1');
  stream.getVideoTracks()[0].end(); const count = f.sockets[0].sent.length;
  peer.channel.receive('approval-ack'); await settle();
  assert.equal(f.session.role, null); assert.equal(peer.closed, true);
  assert.equal(f.sockets[0].readyState, 3); assert.equal(peer.transceivers.length, 0);
  assert.equal(f.sockets[0].sent.length, count);
  assert.ok(stream.getTracks().every((track) => track.readyState === 'ended'));
});

test('a late offer cannot revive a stopped session', async (t) => {
  const f = fixture(t); await f.session.startHost(source(), CODE);
  signal(f.sockets[0], 'v:1', { dial: true });
  const peer = f.peers[0]; let release;
  peer.createOffer = () => new Promise((resolve) => { release = () => resolve({ type: 'offer', sdp: SDP }); });
  await settle(); f.session.stop(); const count = f.sockets[0].sent.length;
  release(); await settle();
  assert.equal(peer.localDescription, null); assert.equal(f.sockets[0].sent.length, count);
});

test('a viewer asks approval over the encrypted channel and can receive only video', async (t) => {
  const f = fixture(t), { peer, channel } = await viewer(f);
  assert.ok(channel.sent.some((message) => message.type === 'request' && message.note === 'Viewer'));
  assert.equal(f.sockets[0].sent.some((message) => message?.data?.note), false);
  channel.receive('approved'); await settle();
  assert.ok(channel.sent.some((message) => message.type === 'approval-ack'));
  peer.transceivers.push({ direction: 'sendrecv' });
  signal(f.sockets[0], undefined, { description: { type: 'offer', sdp: `${SDP}m=video 9 UDP/TLS/RTP/SAVPF 96\r\n` } }); await settle();
  assert.equal(peer.transceivers[0].direction, 'recvonly');
  const track = new Track(); peer.emit('track', { track });
  assert.equal(f.streams.at(-1).getVideoTracks()[0], track);
  peer.emit('track', { track: new Track('audio') });
  assert.equal(peer.closed, true); assert.equal(f.streams.at(-1), null);
});

test('a viewer rejects media before the approved control message', async (t) => {
  const f = fixture(t), { peer } = await viewer(f), track = new Track();
  peer.emit('track', { track });
  assert.equal(peer.closed, true); assert.equal(track.readyState, 'ended');
  assert.equal(f.streams.some((stream) => stream !== null), false);
});

test('the viewer has no control path for clicks or navigation', async (t) => {
  const f = fixture(t); await f.session.startHost(source(), CODE);
  const peer = await request(f);
  peer.channel.receive('click', { x: 1, y: 1 }); await settle();
  assert.equal(peer.closed, true); assert.equal(peer.transceivers.length, 0);
});

test('a mismatched peer protocol reports an invalid connection immediately', async (t) => {
  const f = fixture(t); await f.session.connect(CODE, 'Viewer');
  f.sockets[0].receive({ type: 'signal', data: { protocol: 'share-text', description: { type: 'offer', sdp: SDP } } });
  assert.equal(f.peers[0].closed, true); assert.equal(f.states.at(-1).key, 'connection.invalid');
});

test('relay is requested only by an explicit fresh viewer connection', async (t) => {
  const f = fixture(t); await f.session.connect(CODE, 'Viewer');
  assert.equal(f.sockets[0].sent.some((message) => message?.relay === true), false);
  await f.session.connect(CODE, 'Viewer', { relay: true });
  assert.equal(f.sockets[0].readyState, 3); assert.equal(f.peers[0].closed, true);
  assert.ok(f.sockets[1].sent.some((message) => message?.relay === true));
  assert.equal(f.peers.length, 1);
  f.sockets[1].receive({ type: 'relay', iceServers: [RELAY] }); await settle();
  assert.equal(f.peers[1].config.iceTransportPolicy, 'relay');
  assert.deepEqual(f.peers[1].config.iceServers.at(-1), RELAY);
});

test('unavailable relay credentials stop cleanly without dialing', async (t) => {
  const f = fixture(t); await f.session.connect(CODE, 'Viewer', { relay: true });
  f.sockets[0].receive({ type: 'relay', iceServers: null }); await settle();
  assert.equal(f.peers.length, 0); assert.equal(f.session.role, null);
  assert.equal(f.states.at(-1).key, 'connection.relay-unavailable');
});

test('invalid names are rejected without opening a room', async (t) => {
  const f = fixture(t), stream = source();
  await assert.rejects(f.session.startHost(stream, undefined), /code.invalid/);
  assert.equal(f.sockets.length, 0);
  assert.ok(stream.getTracks().every((track) => track.readyState === 'ended'));
});
