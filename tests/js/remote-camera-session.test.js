import test from 'node:test';
import assert from 'node:assert/strict';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { CameraSession } from '../../tools/remote-camera/src/session.js';
import { PROTOCOL } from '../../tools/remote-camera/src/protocol.js';
const CODE = 'cam-abcdefghijkl';
const SDP = 'v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\na=mid:0\r\n';
class Events extends EventTarget {
  emit(type, fields = {}) {
    const event = Object.assign(new Event(type), fields);
    this.dispatchEvent(event);
    this[`on${type}`]?.(event);
  }
}
class Channel extends Events {
  readyState = 'connecting'; sent = []; closed = false;
  open() { this.readyState = 'open'; this.emit('open'); }
  receive(type, fields = {}) { this.emit('message', { data: JSON.stringify({ protocol: PROTOCOL, type, ...fields }) }); }
  send(value) { assert.equal(this.readyState, 'open'); this.sent.push(JSON.parse(value)); }
  close() { this.closed = true; this.readyState = 'closed'; }
}
class Track extends Events {
  readyState = 'live'; stops = 0;
  constructor(kind) { super(); this.kind = kind; }
  stop() { this.readyState = 'ended'; this.stops += 1; }
  end() { this.readyState = 'ended'; this.emit('ended'); }
}
class Stream {
  constructor(tracks = []) { this.tracks = [...tracks]; }
  getTracks() { return [...this.tracks]; }
  getVideoTracks() { return this.tracks.filter((track) => track.kind === 'video'); }
  getAudioTracks() { return this.tracks.filter((track) => track.kind === 'audio'); }
  addTrack(track) { if (!this.tracks.includes(track)) this.tracks.push(track); }
  removeTrack(track) { this.tracks = this.tracks.filter((item) => item !== track); }
}
function sourceStream(audio = false) {
  const video = new Track('video'), other = new Track(audio ? 'audio' : 'other');
  return Object.assign(new Stream([video, other]), { video, other });
}
async function settle() { for (let i = 0; i < 4; i += 1) await nextTurn(); }
function fixture(t) {
  const sockets = [], peers = [], requests = [], streams = [], publications = [], states = [], viewers = [], bandwidth = [];
  class Socket extends Events {
    readyState = 0; sent = []; closed = false;
    constructor(url) { super(); this.url = url; sockets.push(this); queueMicrotask(() => { this.readyState = 1; this.emit('open'); }); }
    send(value) { assert.equal(this.readyState, 1); this.sent.push(value === 'ping' ? value : JSON.parse(value)); }
    receive(value) { this.emit('message', { data: JSON.stringify(value) }); }
    pong() { this.emit('message', { data: 'pong' }); }
    drop(code = 1006) { this.readyState = 3; this.emit('close', { code }); }
    close() { this.closed = true; this.readyState = 3; }
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
    addTransceiver(track, options) {
      let parameters = { encodings: structuredClone(options.sendEncodings ?? [{}]) };
      const sender = {
        track, initial: structuredClone(parameters), changes: [],
        async replaceTrack(next) { this.track = next; },
        getParameters() { return structuredClone(parameters); },
        async setParameters(next) { parameters = structuredClone(next); this.changes.push(structuredClone(next)); },
      };
      const value = { sender, direction: options.direction }; this.transceivers.push(value); return value;
    }
    getTransceivers() { return this.transceivers; }
    getSenders() { return this.transceivers.map((value) => value.sender); }
    async getStats() { return new Map(); }
    close() { this.closed = true; this.connectionState = 'closed'; }
  }
  const session = new CameraSession({ Socket, PeerConnection, MediaStream: Stream, onRequests(value) { requests.push(value); }, onStream(value) { streams.push(value); }, onDiscovery(value) { publications.push(value); }, onState(value) { states.push(value); }, onViewers(value) { viewers.push(value); }, onBandwidth(value) { bandwidth.push(value); } });
  t.after(() => session.stop());
  return { session, sockets, peers, requests, streams, publications, states, viewers, bandwidth };
}

test('camera discovery accepts only its own live room and namespace acknowledgement', async (t) => {
  const f = fixture(t), stream = sourceStream();
  await f.session.startHost(stream, 'kitchen', { discoverable: true });
  const url = new URL(f.sockets[0].url);
  assert.equal(url.pathname, '/ws/kitchen');
  assert.equal(url.searchParams.get('tool'), 'remote-camera');
  assert.equal(url.searchParams.get('discover'), '1');
  const discovery = { code: 'kitchen', lease: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' };
  for (const claim of [discovery, { ...discovery, tool: 'share-text' }, { ...discovery, tool: 'remote-camera', code: 'other' }]) {
    f.sockets[0].receive({ type: 'host-ready', discovery: claim });
  }
  assert.deepEqual(f.publications, []);
  const valid = { ...discovery, tool: 'remote-camera' };
  f.sockets[0].receive({ type: 'host-ready', discovery: valid });
  assert.deepEqual(f.publications, [valid]);
  f.session.stop();
  f.sockets[0].receive({ type: 'host-ready', discovery: valid });
  assert.equal(f.publications.length, 1);
});
function signal(socket, from, data) { socket.receive({ type: 'signal', from, data: { protocol: PROTOCOL, ...data } }); }
async function requestViewer(f, id, note = 'My viewer', hello = {}) {
  signal(f.sockets[0], id, { dial: true }); await settle();
  const peer = f.peers.at(-1);
  signal(f.sockets[0], id, { description: { type: 'answer', sdp: SDP } }); await settle();
  peer.channel.open(); peer.channel.receive('hello', hello); peer.channel.receive('request', { note }); await settle();
  return peer;
}
async function readyViewer(f) {
  await f.session.connect(CODE, 'Viewer');
  f.sockets[0].receive({ type: 'ready' }); await settle();
  const peer = f.peers[0], channel = new Channel(); channel.label = 'camera-control';
  peer.emit('datachannel', { channel }); channel.open(); channel.receive('hello'); await settle();
  return { peer, channel };
}

test('opted-in microphone media waits for approval and acknowledgement beside video', async (t) => {
  const f = fixture(t), stream = sourceStream(true); await f.session.startHost(stream, CODE);
  const peer = await requestViewer(f, 'v:1', 'Audio viewer', { receiveAudio: true });
  assert.equal(peer.transceivers.length, 0);
  f.session.approve('v:1'); await settle();
  assert.equal(peer.transceivers.length, 0); assert.equal(stream.other.readyState, 'live');
  peer.channel.receive('approval-ack'); await settle();
  assert.deepEqual(peer.getSenders().map((sender) => sender.track), [stream.video, stream.other]);
  assert.ok(peer.transceivers.every((transceiver) => transceiver.direction === 'sendonly'));
  peer.channel.receive('approval-ack'); await settle();
  assert.equal(peer.transceivers.length, 2);
  f.session.stop(); assert.equal(stream.other.stops, 1);
});

test('an audio-enabled host sends only video to a legacy viewer', async (t) => {
  const f = fixture(t), stream = sourceStream(true); await f.session.startHost(stream, CODE);
  const peer = await requestViewer(f, 'v:1');
  f.session.approve('v:1'); peer.channel.receive('approval-ack'); await settle();
  assert.deepEqual(peer.getSenders().map((sender) => sender.track), [stream.video]);
  assert.equal(stream.other.readyState, 'live');
});

test('audio capability cannot create a microphone sender when capture is video-only', async (t) => {
  const f = fixture(t), stream = sourceStream(); await f.session.startHost(stream, CODE);
  const peer = await requestViewer(f, 'v:1', 'Viewer', { receiveAudio: true });
  f.session.approve('v:1'); peer.channel.receive('approval-ack'); await settle();
  assert.deepEqual(peer.getSenders().map((sender) => sender.track), [stream.video]);
});

test('viewer advertises audio support and rejects audio before approval', async (t) => {
  const f = fixture(t), { peer, channel } = await readyViewer(f);
  assert.deepEqual(channel.sent.find((message) => message.type === 'hello'), { protocol: PROTOCOL, type: 'hello', receiveAudio: true });
  peer.emit('track', { track: new Track('audio') });
  assert.equal(peer.closed, true); assert.equal(f.session.role, null);
  assert.deepEqual(f.streams, [null]); assert.equal(f.states.at(-1), 'connection.invalid');
});

test('approved audio and video use one stable received stream and losing audio keeps video', async (t) => {
  const f = fixture(t), { peer, channel } = await readyViewer(f);
  channel.receive('approved'); await settle();
  const audio = new Track('audio'), video = new Track('video');
  peer.emit('track', { track: audio });
  const received = f.streams.at(-1); assert.equal(f.session.stream, received);
  assert.deepEqual(received.getTracks(), [audio]);
  peer.emit('track', { track: video });
  assert.equal(f.streams.at(-1), received); assert.deepEqual(received.getTracks(), [audio, video]);
  peer.emit('track', { track: audio }); assert.equal(f.streams.length, 2);
  audio.end();
  assert.equal(f.streams.at(-1), received); assert.equal(f.streams.length, 3);
  assert.deepEqual(received.getTracks(), [video]); assert.equal(video.readyState, 'live');
  assert.equal(f.session.role, 'viewer'); assert.equal(peer.closed, false);
  video.end(); assert.equal(f.session.role, null); assert.equal(f.streams.at(-1), null);
});

test('viewer Stop releases received audio and video and ignores late audio events', async (t) => {
  const f = fixture(t), { peer, channel } = await readyViewer(f);
  channel.receive('approved'); await settle();
  const video = new Track('video'), audio = new Track('audio');
  peer.emit('track', { track: video }); peer.emit('track', { track: audio });
  f.session.stop(); const notifications = f.streams.length;
  assert.equal(video.stops, 1); assert.equal(audio.stops, 1); assert.equal(f.streams.at(-1), null);
  audio.end(); peer.emit('track', { track: new Track('audio') });
  assert.equal(f.streams.length, notifications); assert.equal(f.session.stream, null);
});

test('camera replacement preserves the microphone sender and does not renegotiate audio', async (t) => {
  const f = fixture(t), original = sourceStream(true); await f.session.startHost(original, CODE);
  const peer = await requestViewer(f, 'v:1', 'Audio viewer', { receiveAudio: true });
  f.session.approve('v:1'); peer.channel.receive('approval-ack'); await settle();
  const entry = f.session.peers.get('v:1'), audioSender = entry.audioSender, video = new Track('video');
  const next = new Stream([video, original.other]), offers = t.mock.method(peer, 'createOffer');
  assert.equal(await f.session.prepareCameraChange().commit(next), true); await settle();
  assert.equal(entry.audioSender, audioSender); assert.equal(audioSender.track, original.other);
  assert.equal(entry.sender.track, video); assert.equal(original.other.stops, 0);
  assert.equal(peer.transceivers.length, 2); assert.equal(offers.mock.callCount(), 0);
  assert.equal(f.sockets.length, 1); assert.equal(f.peers.length, 1);
  original.video.stop(); f.session.stop();
  assert.equal(original.other.stops, 1); assert.equal(video.stops, 1);
});

test('Stop during sender replacement closes shared audio and both camera tracks once', async (t) => {
  const f = fixture(t), original = sourceStream(true); await f.session.startHost(original, CODE);
  const peer = await requestViewer(f, 'v:1', 'Audio viewer', { receiveAudio: true });
  f.session.approve('v:1'); peer.channel.receive('approval-ack'); await settle();
  const sender = f.session.peers.get('v:1').sender; let release;
  sender.replaceTrack = (track) => new Promise((resolve) => { release = () => { sender.track = track; resolve(); }; });
  const video = new Track('video'), candidate = new Stream([video, original.other]);
  const changing = f.session.prepareCameraChange().commit(candidate);
  f.session.stop(); release(); assert.equal(await changing, false);
  assert.equal(original.other.stops, 1); assert.equal(original.video.stops, 1); assert.equal(video.stops, 1);
  assert.equal(f.session.stream, null); assert.equal(f.session.role, null);
});

test('host Stop counts viewers throughout negotiation, approval and video until they leave', async (t) => {
  const f = fixture(t), stream = sourceStream();
  assert.equal(f.session.hasViewers, false);
  await f.session.startHost(stream, CODE);
  assert.equal(f.session.hasViewers, false);

  signal(f.sockets[0], 'v:1', { dial: true }); await settle();
  const peer = f.peers[0];
  assert.equal(f.session.peers.get('v:1').pending, false);
  assert.equal(f.session.viewerCount, 0);
  assert.equal(f.session.hasViewers, true);

  peer.channel.open(); peer.channel.receive('hello');
  peer.channel.receive('request', { note: 'Laptop' }); await settle();
  assert.equal(f.session.hasViewers, true);
  f.session.approve('v:1');
  assert.equal(f.session.hasViewers, true);
  peer.channel.receive('approval-ack'); await settle();
  assert.equal(peer.transceivers.length, 1);
  assert.equal(f.session.hasViewers, true);

  f.sockets[0].receive({ type: 'leave', id: 'v:1' });
  assert.equal(f.session.hasViewers, false);
  assert.equal(stream.video.readyState, 'live');
  assert.equal(f.sockets[0].closed, false);
  f.session.stop();
  assert.equal(f.session.hasViewers, false);
});

test('a viewer connection does not count as a host with viewers', async (t) => {
  const f = fixture(t);
  await f.session.connect(CODE, 'Viewer');
  f.sockets[0].receive({ type: 'ready' }); await settle();
  assert.equal(f.session.peers.size, 1);
  assert.equal(f.session.hasViewers, false);
});

test('an introduced viewer receives no video sender before approval', async (t) => {
  const f = fixture(t), stream = sourceStream();
  await f.session.startHost(stream, CODE);
  const peer = await requestViewer(f, 'v:1', 'Laptop');
  assert.deepEqual(peer.config.iceServers, []); assert.equal(peer.transceivers.length, 0);
  assert.deepEqual(f.requests.at(-1), [{ id: 'v:1', note: 'Laptop' }]);
  assert.equal(stream.video.readyState, 'live');
});
test('approval and acknowledgement independently gate each concurrent viewer', async (t) => {
  const f = fixture(t), stream = sourceStream(true); await f.session.startHost(stream, CODE);
  const first = await requestViewer(f, 'v:1', 'First', { receiveAudio: true });
  const second = await requestViewer(f, 'v:2', 'Second', { receiveAudio: true });
  assert.equal(f.session.approve('v:1'), true); first.channel.receive('approval-ack'); await settle();
  assert.deepEqual(first.getSenders().map((sender) => sender.track), [stream.video, stream.other]);
  assert.equal(second.transceivers.length, 0);
  assert.deepEqual(f.requests.at(-1), [{ id: 'v:2', note: 'Second' }]);
  assert.equal(second.channel.sent.some((message) => message.type === 'busy'), false);
  assert.equal(f.session.approve('v:2'), true); await settle();
  assert.equal(second.transceivers.length, 0); assert.equal(f.session.viewerCount, 2);
  second.channel.receive('approval-ack'); await settle();
  assert.deepEqual(second.getSenders().map((sender) => sender.track), [stream.video, stream.other]);
  assert.ok([...first.transceivers, ...second.transceivers].every((item) => item.direction === 'sendonly'));
  assert.equal(f.session.approve('v:2'), false);
  assert.deepEqual(f.viewers.at(-1).map(({ id, note }) => ({ id, note })), [{ id: 'v:1', note: 'First' }, { id: 'v:2', note: 'Second' }]);
});
test('denying a viewer sends no media and retains source preview', async (t) => {
  const f = fixture(t), stream = sourceStream(); await f.session.startHost(stream, CODE);
  const peer = await requestViewer(f, 'v:1'); f.session.deny('v:1'); await settle();
  assert.equal(peer.transceivers.length, 0); assert.ok(peer.channel.sent.some((message) => message.type === 'denied'));
  assert.equal(stream.video.readyState, 'live'); assert.deepEqual(f.requests.at(-1), []);
});

test('a viewer leaving keeps the camera invitation open for a fresh request', async (t) => {
  const f = fixture(t), stream = sourceStream(); await f.session.startHost(stream, CODE);
  const peer = await requestViewer(f, 'v:1');
  f.session.approve('v:1'); peer.channel.receive('approval-ack'); await settle();
  peer.channel.emit('close'); await settle();
  assert.equal(f.session.role, 'camera');
  assert.equal(f.session.viewerCount, 0);
  assert.equal(f.sockets[0].closed, false);
  assert.equal(stream.video.readyState, 'live');
  assert.equal(f.states.at(-1), 'camera.waiting');
  const fresh = await requestViewer(f, 'v:2');
  assert.equal(fresh.transceivers.length, 0);
  assert.deepEqual(f.requests.at(-1), [{ id: 'v:2', note: 'My viewer' }]);
});

test('video waits for the approval acknowledgement across transports', async (t) => {
  const f = fixture(t), stream = sourceStream(); await f.session.startHost(stream, CODE);
  const peer = await requestViewer(f, 'v:1');
  const signals = [...f.sockets[0].sent];
  assert.equal(f.session.approve('v:1'), true); await settle();
  assert.ok(peer.channel.sent.some((message) => message.type === 'approved'));
  assert.equal(peer.transceivers.length, 0);
  assert.deepEqual(f.sockets[0].sent, signals);
  peer.channel.receive('approval-ack'); await settle();
  assert.equal(peer.transceivers.length, 1);
  assert.ok(f.sockets[0].sent.length > signals.length);
  peer.channel.receive('approval-ack'); await settle();
  assert.equal(peer.transceivers.length, 1);
});

test('a late approval acknowledgement cannot restart a stopped session', async (t) => {
  const f = fixture(t), stream = sourceStream(); await f.session.startHost(stream, CODE);
  const peer = await requestViewer(f, 'v:1');
  f.session.approve('v:1'); await settle();
  assert.equal(peer.transceivers.length, 0);
  f.session.stop(); const signals = [...f.sockets[0].sent];
  peer.channel.receive('approval-ack'); await settle();
  assert.equal(peer.transceivers.length, 0);
  assert.deepEqual(f.sockets[0].sent, signals);
  assert.equal(stream.video.readyState, 'ended');
});

test('an unacknowledged approval times out without sending video', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const f = fixture(t), stream = sourceStream(); await f.session.startHost(stream, CODE);
  const peer = await requestViewer(f, 'v:1');
  f.session.approve('v:1'); await settle();
  t.mock.timers.tick(20000); await settle();
  assert.equal(peer.closed, true);
  assert.equal(f.session.viewerCount, 0);
  const signals = [...f.sockets[0].sent];
  peer.channel.receive('approval-ack'); await settle();
  assert.equal(peer.transceivers.length, 0);
  assert.deepEqual(f.sockets[0].sent, signals);
  assert.equal(stream.video.readyState, 'live');
});

test('an acknowledgement cannot substitute for source approval', async (t) => {
  const f = fixture(t), stream = sourceStream(); await f.session.startHost(stream, CODE);
  const peer = await requestViewer(f, 'v:1');
  peer.channel.receive('approval-ack'); await settle();
  assert.equal(peer.closed, true);
  assert.equal(peer.transceivers.length, 0);
  assert.equal(stream.video.readyState, 'live');
});
test('Stop closes all source tracks and peers and ignores late signaling', async (t) => {
  const f = fixture(t), stream = sourceStream(); await f.session.startHost(stream, CODE);
  const peer = await requestViewer(f, 'v:1'); f.session.approve('v:1'); await settle(); f.session.stop();
  assert.equal(stream.video.stops, 1); assert.equal(stream.other.stops, 1);
  assert.equal(peer.closed, true); assert.equal(peer.channel.closed, true); assert.equal(f.sockets[0].closed, true);
  signal(f.sockets[0], 'v:late', { dial: true }); await settle(); assert.equal(f.peers.length, 1);
  f.session.stop(); assert.equal(stream.video.stops, 1);
});
test('host ICE waits for a description while relay candidates are discarded', async (t) => {
  const f = fixture(t); await f.session.connect(CODE, 'Viewer');
  f.sockets[0].receive({ type: 'ready' }); await settle(); const peer = f.peers[0];
  const host = { candidate: 'candidate:1 1 udp 123 192.168.1.2 5000 typ host', sdpMid: '0', sdpMLineIndex: 0 };
  const relay = { ...host, candidate: 'candidate:2 1 udp 123 203.0.113.2 5001 typ relay' };
  signal(f.sockets[0], 'host', { candidate: host }); signal(f.sockets[0], 'host', { candidate: relay }); await settle();
  assert.deepEqual(peer.ice, []); assert.deepEqual(peer.config.iceServers, []);
  signal(f.sockets[0], 'host', { description: { type: 'offer', sdp: `${SDP}a=${host.candidate}\r\na=${relay.candidate}\r\n` } }); await settle();
  assert.equal(peer.ice.length, 1); assert.equal(peer.ice[0].candidate, host.candidate);
  assert.ok(peer.remoteDescription.sdp.includes('typ host')); assert.ok(!peer.remoteDescription.sdp.includes('typ relay'));
});

test('changing approval policy applies to new requests and preserves existing manual requests', async t => {
  const f = fixture(t); await f.session.startHost(sourceStream(), CODE);
  const first = await requestViewer(f, 'v:1');
  f.session.setApprovalRequired(false);
  first.channel.receive('request', { note: 'Repeated manual request' }); await settle();
  assert.equal(f.session.viewerCount, 0);
  assert.equal(f.session.peers.get('v:1').approved, false);
  const second = await requestViewer(f, 'v:2');
  assert.equal(f.session.viewerCount, 1);
  assert.equal(f.session.peers.get('v:2').approved, true);
  second.channel.receive('approval-ack'); await settle();
  f.session.setApprovalRequired(true);
  assert.equal(f.session.peers.get('v:2').approved, true);
  assert.equal(second.transceivers.length, 1);
});

test('automatic approval reserves bounded concurrent viewers before acknowledgement', async t => {
  const f = fixture(t), stream = sourceStream();
  await f.session.startHost(stream, CODE, { requireApproval: false });
  const accepted = [];
  for (let index = 0; index < 8; index += 1) accepted.push(await requestViewer(f, `v:${index}`));
  assert.equal(f.session.viewerCount, 8); assert.equal(f.session.maxViewers, 8);
  assert.ok(accepted.every((peer) => peer.transceivers.length === 0));
  signal(f.sockets[0], 'v:overflow', { dial: true }); await settle();
  assert.equal(f.peers.length, 8);
  assert.deepEqual(f.sockets[0].sent.at(-1), { to: 'v:overflow', data: { protocol: PROTOCOL, refused: 'busy' } });
  for (const peer of accepted) peer.channel.receive('approval-ack');
  await settle();
  assert.ok(accepted.every((peer) => peer.getSenders().length === 1 && peer.getSenders()[0].track === stream.video));
  assert.ok(accepted.every((peer) => peer.getSenders()[0].initial.encodings[0].maxBitrate === 750000));
});

test('camera replacement preserves the connection without another offer', async t => {
  const f = fixture(t), original = sourceStream(); await f.session.startHost(original, CODE);
  const peer = await requestViewer(f, 'v:1'); f.session.approve('v:1');
  peer.channel.receive('approval-ack'); await settle();
  const entry = f.session.peers.get('v:1'), sender = entry.sender;
  const offers = t.mock.method(peer, 'createOffer'), next = sourceStream();
  const operation = f.session.prepareCameraChange();
  assert.equal(await operation.commit(next), true); await settle();
  assert.equal(f.session.stream, next); assert.equal(f.session.peers.get('v:1').approved, true);
  assert.equal(f.session.peers.get('v:1'), entry); assert.equal(entry.sender, sender);
  assert.equal(sender.track, next.video); assert.equal(peer.transceivers.length, 1);
  assert.equal(offers.mock.callCount(), 0); assert.equal(f.sockets.length, 1); assert.equal(f.peers.length, 1);
  // Capture owns the old hardware stream and closes it after this commit.
  assert.equal(original.video.readyState, 'live'); original.getTracks().forEach(track => track.stop());
  operation.cancel(); assert.equal(next.video.readyState, 'live');
});

test('failed replacement keeps the original stream and holds the operation for recovery', async t => {
  const f = fixture(t), original = sourceStream(); await f.session.startHost(original, CODE);
  const peer = await requestViewer(f, 'v:1'); f.session.approve('v:1'); peer.channel.receive('approval-ack'); await settle();
  const sender = f.session.peers.get('v:1').sender;
  sender.replaceTrack = async () => { throw new Error('Replacement failed'); };
  const operation = f.session.prepareCameraChange(), held = f.session.cameraChange, candidate = sourceStream();
  await assert.rejects(operation.commit(candidate), /Replacement failed/);
  assert.equal(f.session.stream, original); assert.equal(sender.track, original.video);
  assert.equal(f.session.cameraChange, held); assert.equal(candidate.video.readyState, 'live');
  candidate.getTracks().forEach(track => track.stop()); operation.cancel();
  assert.equal(f.session.cameraChange, null); assert.equal(original.video.readyState, 'live');
});

test('acknowledgement during camera acquisition survives the approval deadline', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const f = fixture(t), original = sourceStream(); await f.session.startHost(original, CODE);
  const peer = await requestViewer(f, 'v:1'); f.session.approve('v:1');
  const operation = f.session.prepareCameraChange(); peer.channel.receive('approval-ack'); await settle();
  t.mock.timers.tick(20001); await settle();
  const entry = f.session.peers.get('v:1'); assert.ok(entry); assert.equal(entry.video, undefined);
  assert.equal(entry.acknowledged, true); assert.equal(peer.transceivers.length, 0);
  const next = sourceStream(); await operation.commit(next); await settle();
  assert.equal(entry.video, true); assert.equal(entry.sender.track, next.video);
  original.getTracks().forEach(track => track.stop());
});

test('automatic requests held during acquisition use the committed stream', async t => {
  const f = fixture(t), original = sourceStream();
  await f.session.startHost(original, CODE, { requireApproval: false });
  const operation = f.session.prepareCameraChange(), peer = await requestViewer(f, 'v:1');
  const entry = f.session.peers.get('v:1'); assert.equal(entry.approved, false); assert.equal(f.session.viewerCount, 0);
  const next = sourceStream(); await operation.commit(next);
  assert.equal(entry.approved, true); peer.channel.receive('approval-ack'); await settle();
  assert.equal(entry.sender.track, next.video); original.getTracks().forEach(track => track.stop());
});

test('stale replacement cannot overwrite a restarted host or its newer operation', async t => {
  const f = fixture(t); await f.session.startHost(sourceStream(), CODE);
  const peer = await requestViewer(f, 'v:1'); f.session.approve('v:1'); peer.channel.receive('approval-ack'); await settle();
  const sender = f.session.peers.get('v:1').sender; let release;
  sender.replaceTrack = track => new Promise(resolve => { release = () => { sender.track = track; resolve(); }; });
  const operation = f.session.prepareCameraChange(), candidate = sourceStream(), changing = operation.commit(candidate);
  f.session.stop(); const restarted = sourceStream(); await f.session.startHost(restarted, CODE);
  const newer = f.session.prepareCameraChange(), held = f.session.cameraChange; release();
  assert.equal(await changing, false); assert.equal(f.session.stream, restarted); assert.equal(f.session.cameraChange, held);
  assert.equal(candidate.video.readyState, 'ended'); assert.equal(restarted.video.readyState, 'live'); newer.cancel();
});

test('departed sender failure still lets a later viewer use the new camera', async t => {
  const f = fixture(t), original = sourceStream(); await f.session.startHost(original, CODE, { requireApproval: false });
  const first = await requestViewer(f, 'v:1'); first.channel.receive('approval-ack'); await settle();
  let reject; f.session.peers.get('v:1').sender.replaceTrack = () => new Promise((resolve, fail) => { reject = fail; });
  const operation = f.session.prepareCameraChange(), next = sourceStream(), changing = operation.commit(next);
  f.session.removePeer('v:1'); const second = await requestViewer(f, 'v:2');
  assert.equal(f.session.viewerCount, 0); reject(new Error('Departed peer closed')); await changing;
  assert.equal(f.session.stream, next); assert.equal(f.session.peers.get('v:2').approved, true);
  second.channel.receive('approval-ack'); await settle(); assert.equal(second.getSenders()[0].track, next.video);
  original.getTracks().forEach(track => track.stop());
});

async function streamingHost(f, { discoverable = false } = {}) {
  const stream = sourceStream(true);
  await f.session.startHost(stream, CODE, { discoverable });
  const peer = await requestViewer(f, 'v:live', 'Watching', { receiveAudio: true });
  peer.connectionState = 'connected';
  f.session.approve('v:live'); peer.channel.receive('approval-ack'); await settle();
  signal(f.sockets[0], 'v:live', { description: { type: 'answer', sdp: SDP } }); await settle();
  return { stream, peer, entry: f.session.peers.get('v:live') };
}

async function acceptViewer(f, id, { receiveAudio = true, acknowledge = true } = {}) {
  const peer = await requestViewer(f, id, id, { receiveAudio });
  assert.equal(f.session.approve(id), true);
  if (acknowledge) {
    peer.channel.receive('approval-ack'); await settle();
    peer.connectionState = 'connected'; peer.emit('connectionstatechange');
    signal(f.sockets[0], id, { description: { type: 'answer', sdp: SDP } }); await settle();
  }
  return peer;
}

test('unfinished introductions have a separate bound beside accepted viewers', async (t) => {
  const f = fixture(t), stream = sourceStream(); await f.session.startHost(stream, CODE);
  const watching = await acceptViewer(f, 'v:watching');
  for (let index = 0; index < 4; index += 1) signal(f.sockets[0], `v:pending-${index}`, { dial: true });
  await settle();
  assert.equal(f.session.viewerCount, 1); assert.equal(f.session.peers.size, 5);
  signal(f.sockets[0], 'v:overflow', { dial: true }); await settle();
  assert.equal(f.peers.length, 5);
  assert.deepEqual(f.sockets[0].sent.at(-1), { to: 'v:overflow', data: { protocol: PROTOCOL, refused: 'busy' } });
  assert.equal(watching.closed, false); assert.equal(watching.getSenders()[0].track, stream.video);
  f.session.removePeer('v:pending-0');
  signal(f.sockets[0], 'v:replacement', { dial: true }); await settle();
  assert.ok(f.session.peers.has('v:replacement')); assert.equal(f.session.peers.size, 5);
});

test('manual pending requests can reach the accepted cap without exceeding it', async (t) => {
  const f = fixture(t); await f.session.startHost(sourceStream(), CODE, { videoBudget: 1 });
  const waiting = [];
  for (let index = 0; index < 4; index += 1) waiting.push(await requestViewer(f, `v:${index}`));
  assert.equal(f.session.maxViewers, 4);
  for (let index = 0; index < 4; index += 1) assert.equal(f.session.approve(`v:${index}`), true);
  assert.equal(f.session.viewerCount, 4); assert.ok(waiting.every((peer) => peer.transceivers.length === 0));
  signal(f.sockets[0], 'v:overflow', { dial: true }); await settle();
  assert.equal(f.peers.length, 4);
  assert.deepEqual(f.sockets[0].sent.at(-1), { to: 'v:overflow', data: { protocol: PROTOCOL, refused: 'busy' } });
});

test('lowering the video budget keeps viewers and shares the cap without touching audio', async (t) => {
  const f = fixture(t), stream = sourceStream(true); await f.session.startHost(stream, CODE);
  const watching = [];
  for (let index = 0; index < 6; index += 1) watching.push(await acceptViewer(f, `v:${index}`));
  f.session.setVideoBudget(1); await settle();
  assert.equal(f.session.maxViewers, 4); assert.equal(f.session.viewerCount, 6);
  assert.ok(watching.every((peer) => !peer.closed));
  assert.ok(watching.every((peer) => peer.getSenders()[0].getParameters().encodings[0].maxBitrate === 166666));
  assert.ok(watching.every((peer) => peer.getSenders()[1].changes.length === 0));
  signal(f.sockets[0], 'v:overflow', { dial: true }); await settle(); assert.equal(f.peers.length, 6);
  for (let index = 0; index < 3; index += 1) f.session.disconnectViewer(`v:${index}`);
  const fresh = await acceptViewer(f, 'v:fresh'); await settle();
  assert.equal(f.session.viewerCount, 4); assert.equal(fresh.getSenders()[0].initial.encodings[0].maxBitrate, 250000);
  assert.ok(watching.slice(3).every((peer) => peer.getSenders()[0].getParameters().encodings[0].maxBitrate === 250000));
  assert.equal(stream.video.stops, 0); assert.equal(stream.other.stops, 0);
});

test('a new sender waits for the existing viewers smaller bandwidth shares', async (t) => {
  const f = fixture(t); await f.session.startHost(sourceStream(), CODE);
  for (let index = 0; index < 4; index += 1) await acceptViewer(f, `v:${index}`);
  const sender = f.session.peers.get('v:0').sender, setParameters = sender.setParameters.bind(sender);
  let release;
  sender.setParameters = (parameters) => new Promise((resolve) => {
    release = async () => { await setParameters(parameters); resolve(); };
  });
  const fifth = await requestViewer(f, 'v:fifth');
  assert.equal(f.session.approve('v:fifth'), true); await settle();
  assert.equal(typeof release, 'function');
  fifth.channel.receive('approval-ack'); await settle();
  assert.equal(fifth.transceivers.length, 0); assert.equal(sender.getParameters().encodings[0].maxBitrate, 1500000);
  await release(); await settle();
  assert.equal(fifth.getSenders()[0].initial.encodings[0].maxBitrate, 1200000);
  assert.ok([...f.session.peers.values()].every((entry) => entry.sender.getParameters().encodings[0].maxBitrate === 1200000));
});

test('unsupported encoding controls keep acknowledged video and report the limitation', async (t) => {
  const f = fixture(t); await f.session.startHost(sourceStream(), CODE);
  const peer = await requestViewer(f, 'v:legacy'), addTransceiver = peer.addTransceiver.bind(peer);
  peer.addTransceiver = (track, options) => {
    if (options.sendEncodings) throw new DOMException('Unsupported encodings', 'NotSupportedError');
    const transceiver = addTransceiver(track, options);
    transceiver.sender.getParameters = () => ({ encodings: [] });
    return transceiver;
  };
  f.session.approve('v:legacy'); peer.channel.receive('approval-ack'); await settle();
  assert.equal(peer.transceivers.length, 1); assert.equal(peer.closed, false);
  assert.equal(f.session.viewerCount, 1); assert.equal(f.bandwidth.at(-1), 'camera.bandwidth-unsupported');
});

test('a stopped bandwidth reservation cannot attach media after an awaited sender update', async (t) => {
  const f = fixture(t), stream = sourceStream(); await f.session.startHost(stream, CODE, { videoBudget: 1 });
  const first = await acceptViewer(f, 'v:first'), sender = first.getSenders()[0];
  let release;
  sender.setParameters = () => new Promise((resolve) => { release = resolve; });
  const second = await requestViewer(f, 'v:second');
  f.session.approve('v:second'); second.channel.receive('approval-ack'); await settle();
  assert.equal(typeof release, 'function'); assert.equal(second.transceivers.length, 0);
  f.session.stop(); const statuses = f.bandwidth.length;
  release(); await settle();
  assert.equal(second.transceivers.length, 0); assert.equal(second.closed, true);
  assert.equal(f.bandwidth.length, statuses); assert.equal(f.session.role, null);
  assert.equal(stream.video.stops, 1); assert.equal(f.session.peers.size, 0);
});

test('host disconnect and a failing viewer leave every other accepted viewer intact', async (t) => {
  const f = fixture(t), stream = sourceStream(true); await f.session.startHost(stream, CODE);
  const first = await acceptViewer(f, 'v:first'), second = await acceptViewer(f, 'v:second'), third = await acceptViewer(f, 'v:third');
  assert.ok(f.viewers.at(-1).every((viewer) => viewer.streaming));
  assert.equal(f.session.disconnectViewer('v:second'), true);
  assert.ok(second.channel.sent.some((message) => message.type === 'ended')); assert.equal(second.closed, true);
  assert.equal(first.closed, false); assert.equal(third.closed, false); assert.equal(f.session.viewerCount, 2);
  second.channel.receive('approval-ack'); await settle(); assert.equal(second.transceivers.length, 2);
  first.connectionState = 'failed'; first.emit('connectionstatechange'); await settle();
  assert.equal(first.closed, true); assert.equal(third.closed, false); assert.equal(f.session.viewerCount, 1);
  assert.deepEqual(f.viewers.at(-1), [{ id: 'v:third', note: 'v:third', streaming: true }]);
  assert.equal(f.states.at(-1), 'camera.streaming'); assert.equal(f.session.disconnectViewer('v:missing'), false);
  assert.equal(stream.video.stops, 0); assert.equal(stream.other.stops, 0);
});

test('denial and approval timeout affect only their viewer beside live media', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const f = fixture(t), stream = sourceStream(true); await f.session.startHost(stream, CODE);
  const watching = await acceptViewer(f, 'v:watching');
  const denied = await requestViewer(f, 'v:denied'), timeout = await requestViewer(f, 'v:timeout');
  assert.equal(f.session.deny('v:denied'), true); assert.equal(f.session.approve('v:timeout'), true);
  t.mock.timers.tick(20000); await settle();
  assert.equal(denied.closed, true); assert.equal(timeout.closed, true); assert.equal(watching.closed, false);
  assert.equal(denied.transceivers.length, 0); assert.equal(timeout.transceivers.length, 0);
  assert.equal(f.session.viewerCount, 1); assert.equal(f.states.at(-1), 'camera.streaming');
  assert.equal(stream.video.stops, 0); assert.equal(stream.other.stops, 0);
});

test('camera switching replaces every viewer video sender while preserving microphone and invitation', async (t) => {
  const f = fixture(t), stream = sourceStream(true); await f.session.startHost(stream, CODE);
  const peers = [await acceptViewer(f, 'v:one'), await acceptViewer(f, 'v:two'), await acceptViewer(f, 'v:legacy', { receiveAudio: false })];
  const entries = [...f.session.peers.values()], microphones = entries.map((entry) => entry.audioSender);
  const offers = peers.map((peer) => t.mock.method(peer, 'createOffer'));
  const next = new Stream([new Track('video'), stream.other]);
  assert.equal(await f.session.prepareCameraChange().commit(next), true); await settle();
  assert.equal(f.session.viewerCount, 3); assert.equal(f.sockets.length, 1); assert.equal(f.session.stream, next);
  for (let index = 0; index < entries.length; index += 1) {
    assert.equal(entries[index].sender.track, next.getVideoTracks()[0]); assert.equal(entries[index].audioSender, microphones[index]);
    if (microphones[index]) assert.equal(microphones[index].track, stream.other);
    assert.equal(offers[index].mock.callCount(), 0); assert.equal(peers[index].closed, false);
  }
  assert.equal(stream.other.stops, 0); stream.video.stop();
});

test('one failed camera replacement rolls all other live viewer senders back', async (t) => {
  const f = fixture(t), stream = sourceStream(true); await f.session.startHost(stream, CODE);
  for (const id of ['v:one', 'v:two', 'v:three']) await acceptViewer(f, id);
  const entries = [...f.session.peers.values()], replacements = [];
  entries[0].sender.replaceTrack = async (track) => { replacements.push(track); entries[0].sender.track = track; };
  entries[1].sender.replaceTrack = async () => { throw new Error('Viewer encoder refused'); };
  const operation = f.session.prepareCameraChange(), held = f.session.cameraChange, candidate = new Stream([new Track('video'), stream.other]);
  await assert.rejects(operation.commit(candidate), /Viewer encoder refused/);
  assert.deepEqual(replacements, [candidate.getVideoTracks()[0], stream.video]);
  assert.equal(f.session.stream, stream); assert.equal(f.session.cameraChange, held);
  assert.ok(entries.every((entry) => entry.sender.track === stream.video && !entry.pc.closed));
  assert.ok(entries.every((entry) => entry.audioSender.track === stream.other));
  candidate.getVideoTracks()[0].stop(); operation.cancel(); assert.equal(f.session.cameraChange, null);
});

test('Stop during concurrent replacement invalidates all senders and closes shared tracks once', async (t) => {
  const f = fixture(t), stream = sourceStream(true); await f.session.startHost(stream, CODE);
  for (const id of ['v:one', 'v:two', 'v:three']) await acceptViewer(f, id);
  const releases = [], entries = [...f.session.peers.values()];
  for (const entry of entries) entry.sender.replaceTrack = (track) => new Promise((resolve) => {
    releases.push(() => { entry.sender.track = track; resolve(); });
  });
  const candidate = new Stream([new Track('video'), stream.other]);
  const changing = f.session.prepareCameraChange().commit(candidate);
  assert.equal(releases.length, 3); f.session.stop(); releases.forEach((release) => release());
  assert.equal(await changing, false); assert.equal(f.session.viewerCount, 0); assert.equal(f.session.peers.size, 0);
  assert.ok(entries.every((entry) => entry.pc.closed && entry.dc.closed));
  assert.equal(stream.video.stops, 1); assert.equal(stream.other.stops, 1); assert.equal(candidate.getVideoTracks()[0].stops, 1);
  assert.deepEqual(f.viewers.at(-1), []); assert.equal(f.session.stream, null);
});

test('introduction recovery retains all established viewers and discards unfinished peers', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });
  const f = fixture(t), stream = sourceStream(true); await f.session.startHost(stream, CODE);
  const watching = [];
  for (const id of ['v:one', 'v:two', 'v:three']) watching.push(await acceptViewer(f, id));
  const waiting = await requestViewer(f, 'v:waiting'), unacknowledged = await acceptViewer(f, 'v:unacknowledged', { acknowledge: false });
  const entries = watching.map((peer) => [...f.session.peers.values()].find((entry) => entry.pc === peer));
  f.sockets[0].drop(); await settle();
  assert.equal(f.session.viewerCount, 3); assert.equal(waiting.closed, true); assert.equal(unacknowledged.closed, true);
  assert.ok(entries.every((entry) => entry.signalingDetached && !entry.pc.closed));
  t.mock.timers.tick(2000); await settle(); f.sockets[1].pong(); await settle();
  assert.equal(f.states.at(-1), 'camera.streaming'); assert.equal(f.session.viewerCount, 3);
  assert.ok(entries.every((entry) => f.session.peers.get(entry.id) === entry));
  assert.equal(f.peers.length, 5); assert.equal(stream.video.stops, 0); assert.equal(stream.other.stops, 0);
  for (const peer of watching) assert.equal(peer.channel.sent.filter((message) => message.type === 'approved').length, 1);
});

test('retry exhaustion keeps every live viewer until each independently disconnects', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });
  const f = fixture(t), stream = sourceStream(true); await f.session.startHost(stream, CODE);
  const first = await acceptViewer(f, 'v:first'), second = await acceptViewer(f, 'v:second');
  f.sockets[0].drop(); await settle();
  for (const delay of [2000, 4000, 8000, 15000, 30000]) {
    t.mock.timers.tick(delay); await settle(); f.sockets.at(-1).drop(4409); await settle();
  }
  assert.equal(f.session.role, 'camera'); assert.equal(f.session.viewerCount, 2);
  first.channel.emit('close'); await settle();
  assert.equal(f.session.role, 'camera'); assert.equal(f.session.viewerCount, 1); assert.equal(second.closed, false);
  assert.equal(stream.video.stops, 0); assert.equal(stream.other.stops, 0); assert.equal(f.states.at(-1), 'camera.reconnect-failed');
  second.channel.emit('close'); await settle();
  assert.equal(f.session.role, null); assert.equal(stream.video.stops, 1); assert.equal(stream.other.stops, 1);
});

test('introduction loss retains acknowledged media and restores the host with a fresh lease', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });
  const f = fixture(t), { stream, peer, entry } = await streamingHost(f, { discoverable: true });
  const first = f.sockets[0], messages = [...peer.channel.sent], sender = entry.sender, audio = entry.audioSender;
  first.drop(); await settle();
  assert.equal(f.session.role, 'camera'); assert.equal(f.session.stream, stream);
  assert.equal(f.session.peers.get('v:live'), entry); assert.equal(peer.closed, false);
  assert.equal(stream.video.stops, 0); assert.equal(stream.other.stops, 0);
  assert.equal(f.publications.at(-1), null); assert.equal(f.states.at(-1), 'camera.reconnecting');
  t.mock.timers.tick(1999); await settle(); assert.equal(f.sockets.length, 1);
  t.mock.timers.tick(1); await settle();
  const recovered = f.sockets[1];
  assert.equal(recovered.url, first.url); assert.deepEqual(recovered.sent, ['ping']);
  assert.equal(f.session.reconnecting, true);
  const publication = { tool: 'remote-camera', code: CODE, lease: 'new-lease-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' };
  recovered.receive({ type: 'host-ready', discovery: publication }); recovered.pong(); await settle();
  assert.equal(f.session.reconnecting, false); assert.deepEqual(f.publications.at(-1), publication);
  assert.equal(f.states.at(-1), 'camera.streaming');
  assert.equal(entry.sender, sender); assert.equal(entry.audioSender, audio);
  assert.deepEqual(peer.channel.sent, messages); assert.equal(f.peers.length, 1);
  first.receive({ type: 'leave', id: 'v:live' }); first.emit('error');
  recovered.receive({ type: 'leave', id: 'v:live' }); await settle();
  assert.equal(f.session.peers.get('v:live'), entry);
  peer.emit('icecandidate', { candidate: { candidate: 'candidate:1 1 udp 123 192.168.1.2 5000 typ host', toJSON() { return { candidate: this.candidate }; } } });
  assert.deepEqual(recovered.sent, ['ping']);
  const replacement = new Stream([new Track('video'), stream.other]);
  assert.equal(await f.session.prepareCameraChange().commit(replacement), true);
  assert.equal(sender.track, replacement.getVideoTracks()[0]); assert.equal(audio.track, stream.other);
  stream.video.stop(); f.session.stop();
  assert.equal(stream.other.stops, 1); assert.equal(replacement.getVideoTracks()[0].stops, 1);
});

test('a lost viewer socket and worker host-gone close preserve only established approved video', async (t) => {
  const f = fixture(t), { peer, channel } = await readyViewer(f);
  peer.connectionState = 'connected'; channel.receive('approved'); await settle();
  const video = new Track('video'), audio = new Track('audio');
  peer.emit('track', { track: video }); peer.emit('track', { track: audio });
  const stream = f.session.stream, notifications = f.streams.length;
  f.sockets[0].drop(4410); await settle();
  assert.equal(f.session.role, 'viewer'); assert.equal(f.session.stream, stream);
  assert.equal(f.states.at(-1), 'viewer.signaling-lost'); assert.equal(peer.closed, false);
  assert.equal(video.stops, 0); assert.equal(audio.stops, 0); assert.equal(f.streams.length, notifications);
  assert.equal(f.sockets.length, 1);
  channel.emit('close'); await settle();
  assert.equal(f.session.role, null); assert.equal(f.streams.at(-1), null);
  assert.equal(video.stops, 1); assert.equal(audio.stops, 1);
});

test('a viewer losing only its introduction socket does not let worker leave close its healthy peer', async (t) => {
  const f = fixture(t), { stream, peer, entry } = await streamingHost(f);
  const socket = f.sockets[0];
  socket.receive({ type: 'leave', id: 'v:live' }); await settle();
  assert.equal(f.session.peers.get('v:live'), entry); assert.equal(entry.signalingDetached, true);
  assert.equal(peer.closed, false); assert.equal(stream.video.stops, 0);
  assert.equal(socket.closed, false); assert.equal(f.session.retryTimer, null);
  signal(socket, 'v:new', { dial: true }); await settle();
  assert.equal(f.peers.length, 2); assert.ok(f.session.peers.has('v:new'));
  assert.equal(peer.closed, false); assert.equal(stream.video.stops, 0);
  peer.channel.emit('close'); await settle();
  assert.equal(f.session.viewerCount, 0); assert.equal(f.session.role, 'camera');
  assert.equal(f.states.at(-1), 'camera.waiting'); assert.equal(stream.video.stops, 0);
});

test('viewer introduction loss before received video remains fail-closed', async (t) => {
  const f = fixture(t), { peer, channel } = await readyViewer(f);
  peer.connectionState = 'connected'; channel.receive('approved'); await settle();
  f.sockets[0].drop(4410); await settle();
  assert.equal(f.session.role, null); assert.equal(peer.closed, true);
  assert.equal(f.states.at(-1), 'connection.ended');
  peer.emit('track', { track: new Track('video') });
  assert.equal(f.session.stream, null); assert.equal(f.streams.at(-1), null);
});

test('host recovery discards pending peers and never replays an unacknowledged approval', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const f = fixture(t), stream = sourceStream(); await f.session.startHost(stream, CODE);
  const peer = await requestViewer(f, 'v:pending'); f.session.approve('v:pending');
  f.sockets[0].drop(); await settle();
  assert.equal(peer.closed, true); assert.equal(f.session.viewerCount, 0);
  assert.equal(f.session.peers.size, 0); assert.equal(peer.transceivers.length, 0);
  peer.channel.receive('approval-ack'); t.mock.timers.tick(2000); await settle();
  f.sockets[1].pong(); await settle();
  assert.equal(f.session.role, 'camera'); assert.equal(f.states.at(-1), 'camera.waiting');
  assert.equal(peer.transceivers.length, 0); assert.equal(stream.video.stops, 0);
  assert.equal(f.sockets[1].sent.length, 1);
});

test('five refused host recoveries cannot reset the retry budget or end healthy media', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });
  const f = fixture(t), { stream, peer } = await streamingHost(f);
  f.sockets[0].drop(); await settle();
  for (const delay of [2000, 4000, 8000, 15000, 30000]) {
    t.mock.timers.tick(delay); await settle();
    const socket = f.sockets.at(-1);
    assert.deepEqual(socket.sent, ['ping']); socket.drop(4409); await settle();
  }
  assert.equal(f.sockets.length, 6); assert.equal(f.session.retryTimer, null);
  assert.equal(f.states.at(-1), 'camera.reconnect-failed'); assert.equal(f.session.role, 'camera');
  assert.equal(peer.closed, false); assert.equal(stream.video.stops, 0); assert.equal(stream.other.stops, 0);
  t.mock.timers.tick(60000); await settle(); assert.equal(f.sockets.length, 6);
  peer.channel.emit('close'); await settle();
  assert.equal(f.session.role, null); assert.equal(stream.video.stops, 1); assert.equal(stream.other.stops, 1);
});

test('an idle host releases capture after bounded introduction recovery fails', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });
  const f = fixture(t), stream = sourceStream(); await f.session.startHost(stream, CODE);
  f.sockets[0].drop(); await settle();
  for (const delay of [2000, 4000, 8000, 15000, 30000]) {
    t.mock.timers.tick(delay); await settle(); f.sockets.at(-1).drop(); await settle();
  }
  assert.equal(f.session.role, null); assert.equal(stream.video.stops, 1);
  assert.equal(f.states.at(-1), 'connection.server-failed'); assert.equal(f.sockets.length, 6);
});

test('recovery handshakes stop after twenty seconds without an admission pong', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });
  const f = fixture(t), { stream, peer } = await streamingHost(f);
  f.sockets[0].drop(); await settle(); t.mock.timers.tick(2000); await settle();
  const opening = f.sockets[1];
  t.mock.timers.tick(19999); await settle(); assert.equal(opening.closed, false);
  t.mock.timers.tick(1); await settle();
  assert.equal(opening.closed, true); assert.equal(f.session.socketDeadline, null);
  assert.equal(f.session.retryAttempts, 1); assert.equal(f.session.socket, null);
  opening.pong(); await settle(); assert.equal(f.session.reconnecting, true);
  assert.equal(peer.closed, false); assert.equal(stream.video.stops, 0);
  f.session.stop(); t.mock.timers.tick(60000); await settle(); assert.equal(f.sockets.length, 2);
});

test('a refused introduction retry preserves the disconnected grace of an already retained peer', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });
  const f = fixture(t), { stream, peer, entry } = await streamingHost(f);
  f.sockets[0].drop(); await settle();
  peer.connectionState = 'disconnected'; peer.emit('connectionstatechange');
  t.mock.timers.tick(2000); await settle(); f.sockets[1].drop(4409); await settle();
  assert.equal(f.session.peers.get('v:live'), entry); assert.equal(peer.closed, false);
  assert.equal(stream.video.stops, 0); assert.equal(stream.other.stops, 0);
  peer.connectionState = 'connected'; peer.emit('connectionstatechange');
  t.mock.timers.tick(4000); await settle(); f.sockets[2].pong(); await settle();
  assert.equal(f.session.peers.get('v:live'), entry); assert.equal(f.session.peers.get('v:live').approved, true);
  assert.equal(peer.closed, false); assert.equal(f.states.at(-1), 'camera.streaming');
});

test('a retained peer still ends at the ordinary five-second disconnected deadline during retries', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });
  const f = fixture(t), { peer, entry } = await streamingHost(f);
  f.sockets[0].drop(); await settle();
  peer.connectionState = 'disconnected'; peer.emit('connectionstatechange');
  t.mock.timers.tick(2000); await settle(); f.sockets[1].drop(4409); await settle();
  t.mock.timers.tick(2999); await settle();
  assert.equal(f.session.peers.get('v:live'), entry); assert.equal(peer.closed, false);
  t.mock.timers.tick(1); await settle();
  assert.equal(peer.closed, true); assert.equal(f.session.peers.size, 0); assert.equal(f.session.viewerCount, 0);
});

test('the disconnected grace does not newly retain a peer that was not healthy when signaling was lost', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });
  const f = fixture(t), { peer, entry } = await streamingHost(f);
  peer.connectionState = 'disconnected'; peer.emit('connectionstatechange');
  assert.equal(entry.signalingDetached, undefined);
  f.sockets[0].drop(); await settle();
  assert.equal(peer.closed, true); assert.equal(f.session.peers.size, 0); assert.equal(f.session.viewerCount, 0);
});

test('retry exhaustion leaves a retained disconnected peer its remaining direct-link grace', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });
  const f = fixture(t), { stream, peer, entry } = await streamingHost(f);
  f.sockets[0].drop(); await settle();
  for (const delay of [2000, 4000, 8000, 15000]) {
    t.mock.timers.tick(delay); await settle(); f.sockets.at(-1).drop(4409); await settle();
  }
  t.mock.timers.tick(30000); await settle();
  peer.connectionState = 'disconnected'; peer.emit('connectionstatechange');
  f.sockets.at(-1).drop(4409); await settle();
  assert.equal(f.states.at(-1), 'camera.reconnect-failed'); assert.equal(f.session.peers.get('v:live'), entry);
  assert.equal(peer.closed, false); assert.equal(stream.video.stops, 0);
  t.mock.timers.tick(4999); await settle(); assert.equal(peer.closed, false);
  t.mock.timers.tick(1); await settle();
  assert.equal(peer.closed, true); assert.equal(f.session.role, null);
  assert.equal(stream.video.stops, 1); assert.equal(stream.other.stops, 1);
});

test('Stop cancels scheduled and opening recovery and stale callbacks cannot restart capture', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });
  const f = fixture(t), { stream } = await streamingHost(f);
  f.sockets[0].drop(); await settle(); f.session.stop();
  t.mock.timers.tick(120000); await settle(); assert.equal(f.sockets.length, 1);
  const next = sourceStream(); await f.session.startHost(next, CODE);
  f.sockets[1].drop(); await settle(); t.mock.timers.tick(2000); await settle();
  const opening = f.sockets[2]; f.session.stop();
  opening.pong(); opening.emit('error'); opening.receive({ type: 'host-ready', discovery: { tool: 'remote-camera', code: CODE, lease: 'late-lease-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' } });
  t.mock.timers.tick(120000); await settle();
  assert.equal(f.session.role, null); assert.equal(f.sockets.length, 3);
  assert.equal(stream.video.stops, 1); assert.equal(next.video.stops, 1);
  assert.equal(f.session.retryTimer, null); assert.equal(f.session.socketDeadline, null);
});

test('malformed signaling still closes approved media instead of attempting recovery', async (t) => {
  const f = fixture(t), { stream, peer } = await streamingHost(f);
  f.sockets[0].emit('message', { data: '{broken' }); await settle();
  assert.equal(f.session.role, null); assert.equal(peer.closed, true);
  assert.equal(stream.video.stops, 1); assert.equal(f.states.at(-1), 'connection.invalid');
  assert.equal(f.session.retryTimer, null);
});

test('failed capture recovery keeps every accepted viewer and later replaces ended video and audio', async (t) => {
  const f = fixture(t), original = sourceStream(true); await f.session.startHost(original, CODE);
  const peers = [await acceptViewer(f, 'v:one'), await acceptViewer(f, 'v:two'), await acceptViewer(f, 'v:legacy', { receiveAudio: false })];
  const entries = [...f.session.peers.values()], offers = peers.map((peer) => t.mock.method(peer, 'createOffer'));
  original.video.stop(); original.other.stop();
  const failed = f.session.prepareCameraChange({ preserveOnFailure: true }); failed.cancel();
  assert.equal(f.session.role, 'camera'); assert.equal(f.session.code, CODE);
  assert.equal(f.session.viewerCount, 3); assert.equal(f.sockets[0].closed, false);
  assert.equal(f.states.at(-1), 'camera.paused'); assert.ok(peers.every((peer) => !peer.closed));
  const restored = sourceStream(true); restored.other.enabled = false;
  assert.equal(await f.session.prepareCameraChange({ preserveOnFailure: true }).commit(restored), true); await settle();
  assert.equal(f.session.stream, restored); assert.equal(f.session.viewerCount, 3);
  for (let index = 0; index < entries.length; index += 1) {
    assert.equal(f.session.peers.get(entries[index].id), entries[index]);
    assert.equal(entries[index].sender.track, restored.video);
    if (index < 2) assert.equal(entries[index].audioSender.track, restored.other);
    else { assert.equal(entries[index].audioSender, undefined); assert.equal(peers[index].transceivers.length, 1); }
    assert.equal(offers[index].mock.callCount(), 0);
    assert.equal(peers[index].channel.sent.filter((frame) => frame.type === 'approved').length, 1);
  }
  assert.equal(restored.other.enabled, false); assert.equal(f.sockets.length, 1); assert.equal(f.peers.length, 3);
});

test('an ended source retains pending approval and attaches no replacement media before its own acknowledgement', async (t) => {
  const f = fixture(t), original = sourceStream(true); await f.session.startHost(original, CODE);
  const peer = await requestViewer(f, 'v:pending', 'Expected viewer', { receiveAudio: true });
  original.video.stop(); original.other.stop();
  assert.equal(f.session.approve('v:pending'), false);
  assert.equal(f.session.role, 'camera'); assert.equal(f.session.peers.get('v:pending').pending, true);
  assert.equal(f.session.viewerCount, 0); assert.equal(peer.transceivers.length, 0);
  assert.equal(peer.channel.sent.some((frame) => frame.type === 'approved'), false);
  const restored = sourceStream(true), recovery = f.session.prepareCameraChange({ preserveOnFailure: true });
  assert.equal(await recovery.commit(restored), true); await settle(); assert.equal(peer.transceivers.length, 0);
  assert.equal(f.session.approve('v:pending'), true); await settle(); assert.equal(peer.transceivers.length, 0);
  peer.channel.receive('approval-ack'); await settle();
  assert.deepEqual(peer.getSenders().map((sender) => sender.track), [restored.video, restored.other]);
});

test('one failed microphone replacement rolls all surviving audio and video senders back', async (t) => {
  const f = fixture(t), original = sourceStream(true); await f.session.startHost(original, CODE);
  for (const id of ['v:one', 'v:two', 'v:legacy']) await acceptViewer(f, id, { receiveAudio: id !== 'v:legacy' });
  const entries = [...f.session.peers.values()];
  entries[1].audioSender.replaceTrack = async () => { throw new Error('Microphone encoder refused'); };
  const candidate = sourceStream(true), operation = f.session.prepareCameraChange({ preserveOnFailure: true });
  await assert.rejects(operation.commit(candidate), /Microphone encoder refused/);
  assert.equal(f.session.stream, original); assert.equal(f.session.viewerCount, 3);
  for (const entry of entries) {
    assert.equal(entry.sender.track, original.video);
    if (entry.audioSender) assert.equal(entry.audioSender.track, original.other);
    assert.equal(entry.pc.closed, false);
  }
  candidate.getTracks().forEach((track) => track.stop()); operation.cancel();
});

test('Stop during ended capture recovery closes every candidate track and fences late sender completion', async (t) => {
  const f = fixture(t), original = sourceStream(true); await f.session.startHost(original, CODE);
  for (const id of ['v:one', 'v:two']) await acceptViewer(f, id);
  const entries = [...f.session.peers.values()], releases = [];
  original.video.stop(); original.other.stop();
  for (const entry of entries) for (const sender of [entry.sender, entry.audioSender]) {
    sender.replaceTrack = (track) => new Promise((resolve) => { releases.push(() => { sender.track = track; resolve(); }); });
  }
  const candidate = sourceStream(true), recovery = f.session.prepareCameraChange({ preserveOnFailure: true });
  const pending = recovery.commit(candidate); assert.equal(releases.length, 4);
  f.session.stop();
  assert.ok(entries.every((entry) => entry.dc.sent.at(-1).type === 'ended' && entry.pc.closed));
  assert.equal(candidate.video.stops, 1); assert.equal(candidate.other.stops, 1);
  releases.forEach((release) => release()); assert.equal(await pending, false); recovery.cancel();
  assert.equal(f.session.role, null); assert.equal(f.session.stream, null);
  assert.equal(f.session.peers.size, 0); assert.equal(f.sockets[0].closed, true);
});

test('foreground signaling restore coalesces with bounded retries and never opens while hidden', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });
  const f = fixture(t), { peer, stream, entry } = await streamingHost(f);
  let visible = false; f.session.visible = () => visible;
  f.sockets[0].drop(); await settle();
  assert.equal(f.session.signalingLost, true); assert.equal(f.session.retryTimer, null);
  assert.equal(await f.session.restoreSignaling(), false); t.mock.timers.tick(120000); await settle();
  assert.equal(f.sockets.length, 1); assert.equal(peer.closed, false);
  visible = true;
  const restoring = f.session.restoreSignaling(); assert.equal(f.session.restoreSignaling(), restoring);
  await settle(); assert.equal(f.sockets.length, 2); assert.ok(f.session.signalingRetry);
  f.sockets[1].pong(); assert.equal(await restoring, true);
  assert.equal(f.session.signalingLost, false); assert.equal(f.session.signalingRetry, null);
  assert.equal(f.session.peers.get(entry.id), entry); assert.equal(f.session.stream, stream);
  f.session.stop(); assert.equal(peer.channel.sent.at(-1).type, 'ended');
  assert.equal(await f.session.restoreSignaling({ manual: true }), false);
});

test('manual signaling restore resets an exhausted budget without replacing direct viewers', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });
  const f = fixture(t), { peer, stream, entry } = await streamingHost(f);
  f.sockets[0].drop(); await settle();
  for (let index = 0; index < 5; index += 1) {
    const restoring = f.session.restoreSignaling(); await settle(); f.sockets.at(-1).drop(4409);
    assert.equal(await restoring, false); assert.equal(f.session.retryAttempts, index + 1);
  }
  assert.equal(await f.session.restoreSignaling(), false); assert.equal(f.sockets.length, 6);
  const manual = f.session.restoreSignaling({ manual: true }); await settle(); f.sockets[6].pong();
  assert.equal(await manual, true); assert.equal(f.session.signalingLost, false);
  assert.equal(f.session.peers.get(entry.id), entry); assert.equal(peer.closed, false); assert.equal(f.session.stream, stream);
});

test('Stop fences a coalesced opening signaling restore and its late admission pong', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });
  const f = fixture(t), { peer } = await streamingHost(f); f.sockets[0].drop(); await settle();
  const restoring = f.session.restoreSignaling(); await settle(); const socket = f.sockets[1];
  f.session.stop(); socket.pong(); socket.emit('error');
  assert.equal(await restoring, false); assert.equal(f.session.role, null); assert.equal(f.session.socket, null);
  assert.equal(f.session.signalingRetry, null); assert.equal(peer.closed, true);
  t.mock.timers.tick(120000); await settle(); assert.equal(f.sockets.length, 2);
});

test('encrypted End remains terminal for received video and audio after the introduction socket is lost', async (t) => {
  const f = fixture(t), { peer, channel } = await readyViewer(f);
  peer.connectionState = 'connected'; channel.receive('approved'); await settle();
  const video = new Track('video'), audio = new Track('audio');
  peer.emit('track', { track: video }); peer.emit('track', { track: audio });
  f.sockets[0].drop(4410); await settle(); assert.equal(f.session.signalingLost, true);
  channel.receive('ended'); await settle();
  assert.equal(f.session.role, null); assert.equal(peer.closed, true);
  assert.equal(video.stops, 1); assert.equal(audio.stops, 1); assert.equal(f.streams.at(-1), null);
});

test('the shared socket fences replaced callbacks and owns camera heartbeat cleanup', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });
  const f = fixture(t), original = sourceStream(); await f.session.startHost(original, CODE);
  const first = f.sockets[0], old = { open: first.onopen, message: first.onmessage, close: first.onclose, error: first.onerror };
  const next = sourceStream(); await f.session.startHost(next, CODE);
  const publication = { tool: 'remote-camera', code: CODE, lease: 'new-lease-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' };
  old.open(new Event('open'));
  old.message(Object.assign(new Event('message'), { data: JSON.stringify({ type: 'host-ready', discovery: publication }) }));
  old.close(Object.assign(new Event('close'), { code: 4409 })); old.error(new Event('error'));
  assert.equal(f.session.socket, f.sockets[1]); assert.equal(f.session.stream, next);
  assert.deepEqual(f.publications, []); assert.equal(next.video.stops, 0);
  t.mock.timers.tick(25000); await settle();
  assert.deepEqual(first.sent, []); assert.deepEqual(f.sockets[1].sent, ['ping']);
  const callbacks = { message: f.sockets[1].onmessage, close: f.sockets[1].onclose };
  f.session.stop();
  callbacks.message(Object.assign(new Event('message'), { data: 'pong' }));
  callbacks.close(Object.assign(new Event('close'), { code: 1006 }));
  t.mock.timers.tick(120000); await settle();
  assert.equal(f.sockets.length, 2); assert.deepEqual(f.sockets[1].sent, ['ping']);
  assert.equal(f.session.role, null); assert.equal(f.session.keepalive, null); assert.equal(f.session.socketDeadline, null);
  assert.equal(original.video.stops, 1); assert.equal(next.video.stops, 1);
});
