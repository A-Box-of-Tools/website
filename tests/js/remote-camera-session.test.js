import test from 'node:test';
import assert from 'node:assert/strict';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { CameraSession } from '../../tools/remote-camera/src/session.js';
import { PROTOCOL } from '../../tools/remote-camera/src/protocol.js';
const CODE = 'cam-abcdefghijkl';
const SDP = 'v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\na=mid:0\r\n';
class Events extends EventTarget {
  emit(type, fields = {}) { this.dispatchEvent(Object.assign(new Event(type), fields)); }
}
class Channel extends Events {
  readyState = 'connecting'; sent = []; closed = false;
  open() { this.readyState = 'open'; this.emit('open'); }
  receive(type, fields = {}) { this.emit('message', { data: JSON.stringify({ protocol: PROTOCOL, type, ...fields }) }); }
  send(value) { assert.equal(this.readyState, 'open'); this.sent.push(JSON.parse(value)); }
  close() { this.closed = true; this.readyState = 'closed'; }
}
function sourceStream() {
  const track = (kind) => ({ kind, readyState: 'live', stops: 0, stop() { this.readyState = 'ended'; this.stops += 1; } });
  const video = track('video'), other = track('audio');
  return { video, other, getTracks: () => [video, other], getVideoTracks: () => [video] };
}
async function settle() { for (let i = 0; i < 4; i += 1) await nextTurn(); }
function fixture(t) {
  const sockets = [], peers = [], requests = [], streams = [], publications = [], states = [];
  class Socket extends Events {
    readyState = 0; sent = []; closed = false; replyPing = true;
    constructor(url) { super(); this.url = url; sockets.push(this); queueMicrotask(() => { this.readyState = 1; this.emit('open'); }); }
    send(value) {
      assert.equal(this.readyState, 1);
      if (value === 'ping') {
        this.sent.push(value);
        if (this.replyPing) queueMicrotask(() => { if (this.readyState === 1) this.emit('message', { data: 'pong' }); });
      } else this.sent.push(JSON.parse(value));
    }
    receive(value) { this.emit('message', { data: JSON.stringify(value) }); }
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
      const sender = { track, async replaceTrack(next) { this.track = next; } };
      const value = { sender, direction: options.direction }; this.transceivers.push(value); return value;
    }
    getTransceivers() { return this.transceivers; }
    getSenders() { return this.transceivers.map((value) => value.sender); }
    async getStats() { return new Map(); }
    close() { this.closed = true; this.connectionState = 'closed'; }
  }
  const session = new CameraSession({ Socket, PeerConnection, onRequests(value) { requests.push(value); }, onStream(value) { streams.push(value); }, onDiscovery(value) { publications.push(value); }, onState(value) { states.push(value); } });
  t.after(() => session.stop());
  return { session, sockets, peers, requests, streams, publications, states };
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
async function requestViewer(f, id, note = 'My viewer') {
  signal(f.sockets[0], id, { dial: true }); await settle();
  const peer = f.peers.at(-1);
  signal(f.sockets[0], id, { description: { type: 'answer', sdp: SDP } }); await settle();
  peer.channel.open(); peer.channel.receive('hello'); peer.channel.receive('request', { note }); await settle();
  return peer;
}

test('host Stop counts viewers throughout negotiation, approval and video until they leave', async (t) => {
  const f = fixture(t), stream = sourceStream();
  assert.equal(f.session.hasViewers, false);
  await f.session.startHost(stream, CODE);
  assert.equal(f.session.hasViewers, false);

  signal(f.sockets[0], 'v:1', { dial: true }); await settle();
  const peer = f.peers[0];
  assert.equal(f.session.peers.get('v:1').pending, false);
  assert.equal(f.session.active, null);
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
test('approval sends one video track and excludes a second viewer', async (t) => {
  const f = fixture(t), stream = sourceStream(); await f.session.startHost(stream, CODE);
  const first = await requestViewer(f, 'v:1'), second = await requestViewer(f, 'v:2');
  assert.equal(f.session.approve('v:1'), true); first.channel.receive('approval-ack'); await settle();
  assert.equal(first.transceivers.length, 1); assert.equal(first.transceivers[0].direction, 'sendonly');
  assert.equal(first.transceivers[0].sender.track, stream.video);
  assert.ok(first.channel.sent.some((message) => message.type === 'approved'));
  assert.equal(second.transceivers.length, 0); assert.ok(second.channel.sent.some((message) => message.type === 'busy'));
  assert.equal(f.session.approve('v:2'), false); assert.equal(first.transceivers.length, 1);
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
  assert.equal(f.session.active, null);
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
  assert.equal(f.session.active, null);
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
  assert.equal(f.session.active, null);
  assert.equal(f.session.peers.get('v:1').approved, false);
  const second = await requestViewer(f, 'v:2');
  assert.equal(f.session.active, 'v:2');
  assert.equal(f.session.peers.get('v:2').approved, true);
  second.channel.receive('approval-ack'); await settle();
  f.session.setApprovalRequired(true);
  assert.equal(f.session.active, 'v:2');
  assert.equal(second.transceivers.length, 1);
});

test('automatic approval reserves the only viewer slot before acknowledgement', async t => {
  const f = fixture(t), stream = sourceStream();
  await f.session.startHost(stream, CODE, { requireApproval: false });
  const peer = await requestViewer(f, 'v:1');
  assert.equal(f.session.active, 'v:1'); assert.equal(peer.transceivers.length, 0);
  signal(f.sockets[0], 'v:2', { dial: true }); await settle();
  assert.equal(f.peers.length, 1);
  assert.deepEqual(f.sockets[0].sent.at(-1), { to: 'v:2', data: { protocol: PROTOCOL, refused: 'busy' } });
  peer.channel.receive('approval-ack'); await settle();
  assert.deepEqual(peer.getSenders().map(sender => sender.track), [stream.video]);
});

test('camera replacement preserves the connection without another offer', async t => {
  const f = fixture(t), original = sourceStream(); await f.session.startHost(original, CODE);
  const peer = await requestViewer(f, 'v:1'); f.session.approve('v:1');
  peer.channel.receive('approval-ack'); await settle();
  const entry = f.session.peers.get('v:1'), sender = entry.sender;
  const offers = t.mock.method(peer, 'createOffer'), next = sourceStream();
  const operation = f.session.prepareCameraChange();
  assert.equal(await operation.commit(next), true); await settle();
  assert.equal(f.session.stream, next); assert.equal(f.session.active, 'v:1');
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
  const entry = f.session.peers.get('v:1'); assert.equal(entry.approved, false); assert.equal(f.session.active, null);
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
  assert.equal(f.session.active, null); reject(new Error('Departed peer closed')); await changing;
  assert.equal(f.session.stream, next); assert.equal(f.session.active, 'v:2');
  second.channel.receive('approval-ack'); await settle(); assert.equal(second.getSenders()[0].track, next.video);
  original.getTracks().forEach(track => track.stop());
});

test('failed capture recovery retains the accepted viewer and room for another attempt', async t => {
  const f = fixture(t), original = sourceStream();
  await f.session.startHost(original, CODE);
  const peer = await requestViewer(f, 'v:1');
  f.session.approve('v:1'); peer.channel.receive('approval-ack'); await settle();
  const entry = f.session.peers.get('v:1'), sender = entry.sender;
  original.video.stop();
  const failed = f.session.prepareCameraChange({ preserveOnFailure: true });
  failed.cancel();
  assert.equal(f.session.role, 'camera');
  assert.equal(f.session.code, CODE);
  assert.equal(f.session.active, 'v:1');
  assert.equal(f.session.peers.get('v:1'), entry);
  assert.equal(peer.closed, false);
  assert.equal(f.sockets[0].closed, false);
  assert.equal(f.states.at(-1), 'camera.paused');

  const restored = sourceStream(), offers = t.mock.method(peer, 'createOffer');
  const retry = f.session.prepareCameraChange({ preserveOnFailure: true });
  assert.equal(await retry.commit(restored), true); await settle();
  assert.equal(f.session.peers.get('v:1'), entry);
  assert.equal(entry.sender, sender);
  assert.equal(sender.track, restored.video);
  assert.equal(offers.mock.callCount(), 0);
  assert.equal(f.sockets.length, 1);
  assert.equal(f.peers.length, 1);
  original.getTracks().forEach(track => track.stop());
});

test('an ended source keeps pending approval without admitting or sending video', async t => {
  const f = fixture(t), original = sourceStream();
  await f.session.startHost(original, CODE);
  const peer = await requestViewer(f, 'v:1');
  original.video.stop();
  assert.equal(f.session.approve('v:1'), false);
  assert.equal(f.session.role, 'camera');
  assert.equal(f.session.peers.get('v:1').pending, true);
  assert.equal(f.session.active, null);
  assert.equal(peer.transceivers.length, 0);
  assert.equal(peer.channel.sent.some(message => message.type === 'approved'), false);
  const restored = sourceStream(), recovery = f.session.prepareCameraChange({ preserveOnFailure: true });
  assert.equal(await recovery.commit(restored), true);
  assert.equal(peer.transceivers.length, 0);
  assert.equal(f.session.approve('v:1'), true);
  peer.channel.receive('approval-ack'); await settle();
  assert.equal(peer.getSenders()[0].track, restored.video);
  original.getTracks().forEach(track => track.stop());
});

test('Stop closes a late capture recovery and cannot reinstall it', async t => {
  const f = fixture(t), original = sourceStream();
  await f.session.startHost(original, CODE);
  const peer = await requestViewer(f, 'v:1');
  f.session.approve('v:1'); peer.channel.receive('approval-ack'); await settle();
  original.video.stop();
  let release;
  const sender = f.session.peers.get('v:1').sender;
  sender.replaceTrack = track => new Promise(resolve => { release = () => { sender.track = track; resolve(); }; });
  const recovery = f.session.prepareCameraChange({ preserveOnFailure: true }), candidate = sourceStream();
  const pending = recovery.commit(candidate);
  f.session.stop();
  assert.equal(candidate.video.readyState, 'ended');
  release();
  assert.equal(await pending, false);
  recovery.cancel();
  assert.equal(f.session.role, null);
  assert.equal(f.session.stream, null);
  assert.equal(peer.closed, true);
  assert.equal(f.sockets[0].closed, true);
});

async function streamingCamera(f) {
  const stream = sourceStream();
  await f.session.startHost(stream, CODE);
  const peer = await requestViewer(f, 'v:1');
  f.session.approve('v:1'); peer.channel.receive('approval-ack'); await settle();
  signal(f.sockets[0], 'v:1', { description: { type: 'answer', sdp: SDP } }); await settle();
  peer.connectionState = 'connected';
  return { stream, peer, entry: f.session.peers.get('v:1') };
}

test('signaling loss and viewer leave retain approved video, and foreground restores only the socket', async t => {
  const f = fixture(t), { stream, peer, entry } = await streamingCamera(f);
  const original = f.sockets[0], sender = entry.sender;
  original.receive({ type: 'leave', id: 'v:1' });
  assert.equal(f.session.peers.get('v:1'), entry);
  original.close(); original.emit('close', { code: 1006 });
  assert.equal(f.session.signalingLost, true);
  assert.equal(f.session.role, 'camera');
  assert.equal(stream.video.readyState, 'live');
  assert.equal(peer.closed, false);
  peer.emit('icecandidate', { candidate: { candidate: 'candidate:1 1 udp 1 192.168.1.2 1234 typ host', toJSON() { return { candidate: this.candidate }; } } });
  assert.equal(peer.closed, false);
  f.session.visible = () => false;
  assert.equal(await f.session.restoreSignaling(), false);
  assert.equal(f.sockets.length, 1);
  f.session.visible = () => true;
  const restoring = f.session.restoreSignaling();
  assert.equal(f.session.restoreSignaling(), restoring);
  assert.equal(await restoring, true);
  assert.equal(f.sockets.length, 2);
  assert.equal(new URL(f.sockets[1].url).pathname, `/ws/${CODE}`);
  assert.equal(f.session.peers.get('v:1'), entry);
  assert.equal(entry.sender, sender);
  assert.equal(f.session.stream, stream);
  assert.equal(f.session.signalingLost, false);
  original.emit('close', { code: 4410 });
  assert.equal(peer.closed, false);
  f.session.stop();
  assert.equal(peer.channel.sent.at(-1).type, 'ended');
  assert.equal(await f.session.restoreSignaling(), false);
  assert.equal(stream.video.readyState, 'ended');
});

test('refused host recovery is bounded without retiring healthy video or changing the invitation', async t => {
  const f = fixture(t), { stream, peer } = await streamingCamera(f);
  f.sockets[0].close(); f.sockets[0].emit('close', { code: 1006 });
  for (let i = 0; i < 3; i++) {
    const restoring = f.session.restoreSignaling();
    await Promise.resolve();
    const socket = f.sockets.at(-1); socket.replyPing = false;
    await settle(); socket.close(); socket.emit('close', { code: 4409 });
    assert.equal(await restoring, false);
    assert.equal(f.session.signalAttempts, i + 1);
  }
  assert.equal(await f.session.restoreSignaling(), false);
  assert.equal(f.sockets.length, 4);
  assert.equal(f.session.code, CODE);
  assert.equal(peer.closed, false);
  assert.equal(stream.video.readyState, 'live');
  assert.equal(await f.session.restoreSignaling({ manual: true }), true);
  assert.equal(f.sockets.length, 5);
});

test('Stop fences a pending signaling recovery and its late pong', async t => {
  const f = fixture(t), { peer } = await streamingCamera(f);
  f.sockets[0].close(); f.sockets[0].emit('close', { code: 1006 });
  const restoring = f.session.restoreSignaling();
  await Promise.resolve();
  const socket = f.sockets.at(-1); socket.replyPing = false;
  await settle();
  f.session.stop();
  socket.emit('message', { data: 'pong' }); socket.emit('close', { code: 1000 });
  assert.equal(await restoring, false);
  assert.equal(f.session.role, null);
  assert.equal(f.session.socket, null);
  assert.equal(peer.closed, true);
  assert.equal(await f.session.restoreSignaling(), false);
});

test('a receiving peer survives host-socket loss but explicit ended stays terminal', async t => {
  const f = fixture(t);
  await f.session.connect(CODE, 'Viewer');
  f.sockets[0].receive({ type: 'ready' }); await settle();
  const entry = f.session.peers.get('viewer'), channel = new Channel();
  channel.label = 'camera-control';
  entry.pc.emit('datachannel', { channel }); channel.open(); channel.receive('hello');
  channel.receive('approved');
  entry.mediaReady = true; entry.pc.connectionState = 'connected';
  f.sockets[0].close(); f.sockets[0].emit('close', { code: 4410 });
  assert.equal(f.session.role, 'viewer');
  assert.equal(entry.pc.closed, false);
  assert.equal(await f.session.restoreSignaling(), false);
  assert.equal(f.sockets.length, 1);
  channel.receive('ended');
  assert.equal(f.session.role, null);
  assert.equal(entry.pc.closed, true);
});
