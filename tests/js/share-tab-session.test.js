import test from 'node:test';
import assert from 'node:assert/strict';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { TabSession } from '../../tools/share-tab/src/session.js';
import { CHANNEL, PROTOCOL } from '../../tools/share-tab/src/protocol.js';

const CODE = 'tab-abcdefghijklmnop';
const PUBLICATION = { code: CODE, lease: '01234567-89ab-4cde-8f01-23456789abcd', tool: 'share-tab' };
const SDP = 'v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\na=mid:0\r\n';
const HOST_CANDIDATE = 'candidate:lan1 1 udp 2122260223 device.local 5000 typ host';
const OTHER_CANDIDATES = [
  'candidate:map1 1 udp 1686052607 198.51.100.1 5001 typ srflx raddr 192.168.1.2 rport 5000',
  'candidate:relay1 1 udp 1686052607 198.51.100.2 5002 typ relay raddr 192.168.1.2 rport 5000',
  'candidate:peer1 1 udp 1686052607 198.51.100.3 5003 typ prflx',
];
const MIXED_SDP = `${SDP}a=${HOST_CANDIDATE} raddr 198.51.100.1 rport 5001\r\n${OTHER_CANDIDATES.map((candidate) => `a=${candidate}\r\n`).join('')}`;
const LOCAL_SDP = `${SDP}a=${HOST_CANDIDATE}\r\n`;

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

function fixture(t, overrides = {}) {
  const sockets = [], peers = [], states = [], requests = [], viewers = [], streams = [], discoveries = [];
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
    async createOffer(options) { (this.offerOptions ??= []).push(options); return { type: 'offer', sdp: SDP }; }
    setConfiguration(config) { this.config = config; }
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
    onViewers(value) { viewers.push(value); }, onStream(value) { streams.push(value); },
    onDiscovery(value) { discoveries.push(value); }, ...overrides });
  t.after(() => session.stop());
  return { session, sockets, peers, states, requests, viewers, streams, discoveries };
}

function signal(socket, from, data) { socket.receive({ type: 'signal', from, data: { protocol: PROTOCOL, ...data } }); }
const RELAY_SERVERS = [{ urls: ['turns:relay.example.test:443?transport=tcp'], username: 'temporary', credential: 'temporary-secret' }];
function relayReply(socket, values = {}) {
  const request = socket.sent.findLast((frame) => frame.type === 'relay-request');
  assert.ok(request, 'relay credentials requested through the live room');
  socket.receive({ type: 'relay-credentials', id: request.id, iceServers: RELAY_SERVERS, expiresAt: Date.now() + 3600000, ...values });
}

test('tab relay waits for credentials and retains approval before media', async (t) => {
  const f = fixture(t), stream = source();
  const opening = f.session.startHost(stream, CODE, { transport: 'relay' });
  await settle();
  assert.equal(new URL(f.sockets[0].url).searchParams.get('transport'), 'relay');
  signal(f.sockets[0], 'v:1', { dial: true });
  assert.equal(f.peers.length, 0);
  relayReply(f.sockets[0]); await opening; await settle();
  const peer = f.peers[0];
  assert.equal(peer.config.iceTransportPolicy, 'relay');
  assert.deepEqual(peer.config.iceServers, RELAY_SERVERS);
  assert.equal(peer.transceivers.length, 0);
  signal(f.sockets[0], 'v:1', { description: { type: 'answer', sdp: SDP } }); await settle();
  signal(f.sockets[0], 'v:1', { candidate: { candidate: HOST_CANDIDATE } });
  const relay = { candidate: OTHER_CANDIDATES[1] };
  signal(f.sockets[0], 'v:1', { candidate: relay }); await settle();
  assert.deepEqual(peer.ice, [relay]);
  peer.channel.open(); peer.channel.receive('hello'); peer.channel.receive('request', { note: 'Viewer' });
  assert.equal(f.session.approve('v:1'), true); await settle();
  assert.equal(peer.transceivers.length, 0);
  peer.channel.receive('approval-ack'); await settle();
  assert.equal(peer.transceivers.length, 1);
  const offers = peer.offerOptions.length;
  f.session.renewRelay(RELAY_SERVERS); await settle();
  assert.equal(peer.offerOptions.length, offers);
  signal(f.sockets[0], 'v:1', { description: { type: 'answer', sdp: SDP } }); await settle();
  assert.deepEqual(peer.offerOptions.at(-1), { iceRestart: true });
  f.session.stop();
  assert.ok(stream.getTracks().every((track) => track.readyState === 'ended'));
  assert.equal(f.session.relay, null);
});

test('tab relay viewer buffers ready until credentials and mismatch cannot create a peer', async (t) => {
  for (const outcome of ['ready', 'mismatch']) {
    const f = fixture(t);
    const opening = f.session.connect(CODE, 'Viewer', { transport: 'relay' });
    const rejected = outcome === 'mismatch' ? assert.rejects(opening, /transport.mismatch/) : null;
    await settle();
    assert.equal(f.peers.length, 0);
    if (outcome === 'mismatch') { f.sockets[0].drop(4412); await rejected; }
    else { relayReply(f.sockets[0]); await opening; assert.equal(f.peers[0].config.iceTransportPolicy, 'relay'); }
  }
});

test('tab unavailable relay and Stop release capture without a direct retry', async (t) => {
  for (const outcome of ['unavailable', 'stopped']) {
    const f = fixture(t), stream = source();
    const opening = f.session.startHost(stream, CODE, { transport: 'relay' });
    const rejected = assert.rejects(opening, new RegExp(outcome === 'stopped' ? 'connection.stopped' : 'transport.unavailable'));
    await settle();
    if (outcome === 'stopped') f.session.stop();
    relayReply(f.sockets[0], outcome === 'unavailable' ? { error: 'unavailable' } : {});
    await rejected; await settle();
    assert.equal(f.peers.length, 0);
    assert.equal(f.sockets.length, 1);
    assert.ok(stream.getTracks().every((track) => track.readyState === 'ended'));
    assert.equal(f.session.role, null);
  }
});
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

test('a remote hello before the local open callback still receives hello before the request', async (t) => {
  const f = fixture(t); await f.session.connect(CODE, 'Viewer');
  const peer = f.peers[0], channel = new Channel();
  peer.emit('datachannel', { channel });
  // The transport is writable even though delivery of its open event is pending.
  channel.readyState = 'open';
  channel.receive('hello');
  assert.deepEqual(channel.sent, [
    { protocol: PROTOCOL, type: 'hello' },
    { protocol: PROTOCOL, type: 'request', note: 'Viewer' },
  ]);
  channel.emit('open'); channel.receive('hello'); await settle();
  assert.deepEqual(channel.sent.map((message) => message.type), ['hello', 'request']);
  assert.equal(peer.closed, false);
  assert.equal(peer.transceivers.length, 0);
  assert.equal(f.streams.length, 0);
  assert.equal(f.states.at(-1).key, 'viewer.waiting');
});

test('a failed local hello retires the peer before processing the received frame', async (t) => {
  const f = fixture(t); await f.session.connect(CODE, 'Viewer');
  const peer = f.peers[0], channel = new Channel(), entry = f.session.peers.get('viewer');
  peer.emit('datachannel', { channel }); channel.readyState = 'open';
  channel.send = () => { throw new Error('Channel closed before hello'); };
  channel.receive('hello'); await settle();
  assert.equal(peer.closed, true);
  assert.equal(entry.hello, undefined);
  assert.equal(f.session.role, null);
  assert.equal(f.states.at(-1).key, 'connection.direct-failed');
  assert.deepEqual(channel.sent, []);
});

test('sending the local hello does not accept approval before the remote hello', async (t) => {
  const f = fixture(t); await f.session.connect(CODE, 'Viewer');
  const peer = f.peers[0], channel = new Channel();
  peer.emit('datachannel', { channel }); channel.readyState = 'open';
  channel.receive('approved'); await settle();
  assert.deepEqual(channel.sent.map((message) => message.type), ['hello']);
  assert.equal(peer.closed, true);
  assert.equal(f.states.at(-1).key, 'connection.invalid');
  assert.equal(peer.transceivers.length, 0);
  assert.equal(f.streams.some((stream) => stream !== null), false);
});

test('a tab host uses its own pairing room and no ICE servers or media before consent', async (t) => {
  const f = fixture(t), stream = source(); await f.session.startHost(stream, CODE);
  const url = new URL(f.sockets[0].url);
  assert.equal(url.searchParams.get('tool'), 'share-tab');
  assert.equal(url.searchParams.has('local'), false);
  assert.equal(url.searchParams.has('discover'), false);
  assert.equal(url.searchParams.get('transport'), 'direct');
  assert.equal(f.sockets[0].sent.some((frame) => frame.type === 'relay-request'), false);
  const peer = await request(f);
  assert.deepEqual(peer.config, { iceServers: [] });
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

test('only an opted-in online host accepts its current namespaced discovery lease', async (t) => {
  const f = fixture(t); await f.session.startHost(source(), CODE, { discoverable: true });
  const url = new URL(f.sockets[0].url);
  assert.equal(url.searchParams.get('tool'), 'share-tab');
  assert.equal(url.searchParams.get('local'), '1');
  assert.equal(url.searchParams.get('discover'), '1');
  assert.deepEqual(f.discoveries, []);
  for (const discovery of [
    null, {}, { ...PUBLICATION, tool: 'remote-camera' }, { ...PUBLICATION, tool: undefined },
    { ...PUBLICATION, code: 'tab-bbcdefghijklmnop' }, { ...PUBLICATION, lease: null },
    { ...PUBLICATION, lease: 'short' }, { ...PUBLICATION, lease: 'a'.repeat(129) },
    { ...PUBLICATION, lease: 'bad/lease/with/slashes' },
  ]) f.sockets[0].receive({ type: 'host-ready', discovery });
  assert.deepEqual(f.discoveries, []);
  f.sockets[0].receive({ type: 'host-ready', discovery: { ...PUBLICATION, note: 'Not listing metadata' } });
  assert.deepEqual(f.discoveries, [PUBLICATION]);
  assert.equal(f.peers.length, 0);
  assert.equal(f.session.viewerCount, 0);
  const peer = await request(f);
  assert.deepEqual(peer.config, { iceServers: [] });
  assert.equal(peer.transceivers.length, 0);
  assert.equal(f.session.approve('v:1'), true); await settle();
  assert.equal(peer.transceivers.length, 0);
  peer.channel.receive('approval-ack'); await settle();
  assert.equal(peer.transceivers.length, 1);
});

test('private hosts and viewers cannot publish even when a service sends a discovery lease', async (t) => {
  for (const options of [undefined, { discoverable: false }, { discoverable: 'true' }]) {
    const f = fixture(t); await f.session.startHost(source(), CODE, options);
    const url = new URL(f.sockets[0].url);
    assert.equal(url.searchParams.has('local'), false);
    assert.equal(url.searchParams.has('discover'), false);
    f.sockets[0].receive({ type: 'host-ready', discovery: PUBLICATION });
    assert.deepEqual(f.discoveries, []);
  }
  const watching = fixture(t); await watching.session.connect(CODE, 'Viewer', { discoverable: true });
  assert.equal(new URL(watching.sockets[0].url).searchParams.has('discover'), false);
  watching.sockets[0].receive({ type: 'host-ready', discovery: PUBLICATION });
  assert.deepEqual(watching.discoveries, []);
});

test('Stop and an ended capture withdraw discovery before stale host callbacks can return', async (t) => {
  for (const endCapture of [false, true]) {
    const f = fixture(t), stream = source();
    await f.session.startHost(stream, CODE, { discoverable: true });
    const socket = f.sockets[0], lateMessage = socket.onmessage;
    socket.receive({ type: 'host-ready', discovery: PUBLICATION });
    if (endCapture) stream.getVideoTracks()[0].end();
    else f.session.stop();
    assert.deepEqual(f.discoveries, [PUBLICATION, null]);
    assert.equal(socket.readyState, 3);
    assert.equal(f.session.discoverable, false);
    lateMessage({ data: JSON.stringify({ type: 'host-ready', discovery: PUBLICATION }) });
    await settle();
    assert.deepEqual(f.discoveries, [PUBLICATION, null]);
    assert.equal(f.session.role, null);
  }
});

test('signaling failure withdraws the listing and old callbacks cannot replace a new lease', async (t) => {
  const f = fixture(t); await f.session.startHost(source(), CODE, { discoverable: true });
  const oldSocket = f.sockets[0], lateMessage = oldSocket.onmessage, lateClose = oldSocket.onclose;
  oldSocket.receive({ type: 'host-ready', discovery: PUBLICATION });
  oldSocket.drop();
  assert.deepEqual(f.discoveries, [PUBLICATION, null]);
  assert.equal(f.states.at(-1).key, 'connection.server-failed');
  await f.session.startHost(source(), CODE, { discoverable: true });
  const fresh = { ...PUBLICATION, lease: '12345678-9abc-4def-8012-3456789abcde' };
  f.sockets[1].receive({ type: 'host-ready', discovery: fresh });
  lateMessage({ data: JSON.stringify({ type: 'host-ready', discovery: PUBLICATION }) });
  lateClose({ code: 1006 }); await settle();
  assert.deepEqual(f.discoveries, [PUBLICATION, null, fresh]);
  assert.equal(f.session.role, 'host');
  assert.equal(f.sockets[1].readyState, 1);
});

test('stopping an opening host cannot accept a late publication or revive capture', async (t) => {
  const f = fixture(t), stream = source();
  const opening = f.session.startHost(stream, CODE, { discoverable: true });
  const lateMessage = f.sockets[0].onmessage;
  f.session.stop();
  await assert.rejects(opening, /connection.stopped/);
  lateMessage({ data: JSON.stringify({ type: 'host-ready', discovery: PUBLICATION }) });
  await settle();
  assert.deepEqual(f.discoveries, [null]);
  assert.equal(f.sockets[0].readyState, 3);
  assert.ok(stream.getTracks().every((track) => track.readyState === 'ended'));
});

test('replacing a discoverable host with a private invitation retires its old lease', async (t) => {
  const f = fixture(t); await f.session.startHost(source(), CODE, { discoverable: true });
  const lateMessage = f.sockets[0].onmessage;
  f.sockets[0].receive({ type: 'host-ready', discovery: PUBLICATION });
  await f.session.startHost(source(), CODE);
  assert.equal(f.session.discoverable, false);
  assert.equal(f.sockets.length, 2);
  assert.equal(f.sockets[0].readyState, 3);
  lateMessage({ data: JSON.stringify({ type: 'host-ready', discovery: PUBLICATION }) });
  f.session.message({ type: 'host-ready', discovery: PUBLICATION });
  assert.deepEqual(f.discoveries, [PUBLICATION, null]);
  assert.equal(f.peers.length, 0);
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
  const candidate = { candidate: HOST_CANDIDATE };
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

test('obsolete relay options and unsolicited credentials cannot widen a viewer connection', async (t) => {
  const f = fixture(t);
  const credentials = { urls: ['turn:relay.example:3478'], username: 'temporary', credential: 'secret' };
  await f.session.connect(CODE, 'Viewer', { relay: true, iceServers: [credentials] });
  assert.equal(f.sockets[0].sent.some((message) => message?.relay === true), false);
  assert.deepEqual(f.peers[0].config, { iceServers: [] });
  f.sockets[0].receive({ type: 'relay', iceServers: [credentials] });
  signal(f.sockets[0], undefined, { relay: true, iceServers: [credentials], local: false });
  await settle();
  assert.equal(f.peers.length, 1);
  assert.deepEqual(f.peers[0].config, { iceServers: [] });
  f.peers[0].connectionState = 'failed'; f.peers[0].emit('connectionstatechange'); await settle();
  assert.equal(f.session.role, null);
  assert.equal(f.states.at(-1).key, 'connection.direct-failed');
  assert.equal(f.sockets.length, 1);
});

test('a forged dial cannot configure ICE servers on the host', async (t) => {
  const f = fixture(t); await f.session.startHost(source(), CODE);
  signal(f.sockets[0], 'v:1', { dial: true, local: false, relay: true, iceServers: [{ urls: 'stun:example.test:3478' }] });
  await settle();
  assert.equal(f.peers.length, 1);
  assert.deepEqual(f.peers[0].config, { iceServers: [] });
});

test('host and viewer send only host trickle candidates even when candidate metadata claims otherwise', async (t) => {
  const host = fixture(t), watching = fixture(t);
  await host.session.startHost(source(), CODE);
  signal(host.sockets[0], 'v:1', { dial: true }); await settle();
  await watching.session.connect(CODE, 'Viewer');
  for (const f of [host, watching]) {
    const peer = f.peers[0];
    for (const wire of [...OTHER_CANDIDATES, HOST_CANDIDATE]) {
      peer.emit('icecandidate', { candidate: { type: 'host', toJSON() { return { candidate: wire, type: 'host' }; } } });
    }
    await settle();
    assert.deepEqual(f.sockets[0].sent.filter((message) => message?.data?.candidate).map((message) => message.data.candidate.candidate), [HOST_CANDIDATE]);
    assert.equal(peer.closed, false);
  }
});

test('host and viewer reject mapped and relayed trickle routes before buffering or adding ICE', async (t) => {
  const host = fixture(t), watching = fixture(t);
  await host.session.startHost(source(), CODE);
  signal(host.sockets[0], 'v:1', { dial: true }); await settle();
  await watching.session.connect(CODE, 'Viewer');
  for (const [f, id, type] of [[host, 'v:1', 'answer'], [watching, undefined, 'offer']]) {
    for (const wire of [...OTHER_CANDIDATES, HOST_CANDIDATE]) {
      signal(f.sockets[0], id, { candidate: { candidate: wire, type: 'host' } });
    }
    await settle();
    assert.deepEqual(f.peers[0].ice, []);
    signal(f.sockets[0], id, { description: { type, sdp: SDP } }); await settle();
    assert.deepEqual(f.peers[0].ice.map((candidate) => candidate.candidate), [HOST_CANDIDATE]);
    assert.equal(f.peers[0].closed, false);
    for (const wire of OTHER_CANDIDATES) signal(f.sockets[0], id, { candidate: { candidate: wire } });
    await settle();
    assert.deepEqual(f.peers[0].ice.map((candidate) => candidate.candidate), [HOST_CANDIDATE]);
  }
});

test('the host strips nonlocal embedded SDP candidates from both its offer and the answer', async (t) => {
  const f = fixture(t); await f.session.startHost(source(), CODE);
  signal(f.sockets[0], 'v:1', { dial: true });
  const peer = f.peers[0];
  peer.createOffer = async () => ({ type: 'offer', sdp: MIXED_SDP });
  await settle();
  assert.equal(peer.localDescription.sdp, LOCAL_SDP);
  assert.equal(f.sockets[0].sent.find((message) => message?.data?.description)?.data.description.sdp, LOCAL_SDP);
  signal(f.sockets[0], 'v:1', { description: { type: 'answer', sdp: MIXED_SDP } }); await settle();
  assert.equal(peer.remoteDescription.sdp, LOCAL_SDP);
});

test('the viewer strips nonlocal embedded SDP candidates from the offer and its answer', async (t) => {
  const f = fixture(t); await f.session.connect(CODE, 'Viewer');
  const peer = f.peers[0];
  peer.createAnswer = async () => ({ type: 'answer', sdp: MIXED_SDP });
  signal(f.sockets[0], undefined, { description: { type: 'offer', sdp: MIXED_SDP } }); await settle();
  assert.equal(peer.remoteDescription.sdp, LOCAL_SDP);
  assert.equal(peer.localDescription.sdp, LOCAL_SDP);
  assert.equal(f.sockets[0].sent.find((message) => message?.data?.description)?.data.description.sdp, LOCAL_SDP);
});

test('candidates gathered after setLocalDescription are filtered again before either role signals SDP', async (t) => {
  for (const role of ['host', 'viewer']) {
    const f = fixture(t);
    if (role === 'host') {
      await f.session.startHost(source(), CODE);
      signal(f.sockets[0], 'v:1', { dial: true });
    } else await f.session.connect(CODE, 'Viewer');
    const peer = f.peers[0];
    peer.setLocalDescription = async (description) => { peer.localDescription = { ...description, sdp: MIXED_SDP }; };
    if (role === 'viewer') signal(f.sockets[0], undefined, { description: { type: 'offer', sdp: SDP } });
    await settle();
    assert.equal(peer.localDescription.sdp, MIXED_SDP);
    assert.equal(f.sockets[0].sent.find((message) => message?.data?.description)?.data.description.sdp, LOCAL_SDP);
  }
});

test('invalid names are rejected without opening a room', async (t) => {
  const f = fixture(t), stream = source();
  await assert.rejects(f.session.startHost(stream, undefined), /code.invalid/);
  assert.equal(f.sockets.length, 0);
  assert.ok(stream.getTracks().every((track) => track.readyState === 'ended'));
});
