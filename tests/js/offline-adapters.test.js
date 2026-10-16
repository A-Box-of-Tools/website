import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { OfflineVoiceHost, OfflineVoiceClient } from '../../shared/js/voice-offline.js';
import { OfflineTextHost, OfflineTextClient } from '../../tools/share-text/src/offline-room.js';
import { OfflineChannel, OfflineSocket } from '../../shared/js/offline-channel.js';
import { offlineBlock, readOfflineBlock } from '../../shared/js/offline-pairing.js';

if (!globalThis.crypto) Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
const tick = () => new Promise(resolve => setImmediate(resolve));
const flush = async () => { for (let n = 0; n < 4; n++) await tick(); };
const SDP = 'v=0\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\n';
const AUDIO = 'v=0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\na=sendonly\r\n';
const KEY = 'h'.repeat(43), LISTEN = 'l'.repeat(43), PROOF = 'p'.repeat(43);
const identity = { code: 'a'.repeat(64), key: KEY, listenKey: LISTEN, roomName: 'Local voice', passwordProof: PROOF };
const conn = '11111111-1111-4111-8111-111111111111';

function transport() {
  const offers = new Map();
  return class Channel {
    static instances = [];
    constructor(options) { Object.assign(this, options); this.readyState = 0; this.sent = []; this.constructor.instances.push(this); }
    async createOffer() {
      this.pairing = { session: crypto.randomUUID().replaceAll('-', ''), expires: Date.now() + 600000 };
      offers.set(this.pairing.session, this);
      return offlineBlock(this.tool, this.pairing, { type: 'offer', sdp: SDP });
    }
    async createAnswer(text) {
      const offer = readOfflineBlock(this.tool, text, 'offer', { checkExpiry: false });
      this.peer = offers.get(offer.session);
      if (!this.peer || this.peer.readyState === 3) throw new Error('offline.invalid-offer');
      this.peer.peer = this;
      return offlineBlock(this.tool, offer, { type: 'answer', sdp: SDP });
    }
    async acceptAnswer(text) {
      readOfflineBlock(this.tool, text, 'answer', { pairing: this.pairing });
      if (!this.peer || this.readyState === 3) throw new Error('offline.invalid-answer');
      this.readyState = this.peer.readyState = 1;
      this.onOpen?.(); this.peer.onOpen?.();
    }
    send(text) {
      if (this.readyState !== 1 || this.peer?.readyState !== 1) return false;
      this.sent.push(JSON.parse(text));
      queueMicrotask(() => { if (this.peer.readyState === 1) this.peer.onMessage?.(text); });
      return true;
    }
    close() {
      if (this.readyState === 3) return;
      this.readyState = 3;
      this.onClose?.('offline.disconnected');
      this.peer?.close();
    }
  };
}
async function socket(Factory) {
  const value = new Factory(); value.frames = [];
  value.onmessage = event => value.frames.push(event.data === 'pong' ? event.data : JSON.parse(event.data));
  await flush();
  return value;
}
async function voiceHost(t, tool = 'voice-oncall') {
  const Channel = transport();
  const host = new OfflineVoiceHost({ tool, identity, Channel }); t.after(() => host.close());
  const ws = await socket(host.Socket);
  ws.send(JSON.stringify({ type: 'auth', role: 'host', key: KEY })); await flush();
  const client = new OfflineVoiceClient({ tool, Channel }); t.after(() => client.close());
  const offer = await host.createOffer(), reply = await client.createAnswer(offer);
  await host.acceptAnswer(reply); await flush();
  return { host, client, ws, Channel, offer, reply };
}
const authenticate = async (client, key = 's'.repeat(43), proof = PROOF, role = 'sender') => {
  const ws = await socket(client.Socket);
  ws.send(JSON.stringify({ type: 'auth', role, key, passwordProof: proof })); await flush();
  return ws;
};

test('offline voice requires client password and cannot acquire host authority through a remote role', async t => {
  const { host, client, ws, Channel, offer } = await voiceHost(t);
  assert.equal(offer.includes(KEY), false);
  assert.equal(offer.includes(PROOF), false);
  assert.equal(JSON.stringify(Channel.instances[0].sent).includes(PROOF), false);
  const impostor = await authenticate(client, KEY, PROOF, 'host');
  assert.ok(impostor.frames.some(frame => frame.error === 'unauthorized'));
  assert.equal(host.clients.size, 0);
  impostor.close();
  const wrong = await authenticate(client, 's'.repeat(43), 'x'.repeat(43));
  assert.ok(wrong.frames.some(frame => frame.error === 'password'));
  assert.equal(host.clients.size, 0);
  wrong.close();
  const admitted = await authenticate(client);
  assert.ok(admitted.frames.some(frame => frame.type === 'ready'));
  assert.equal(ws.frames.filter(frame => frame.type === 'join').length, 1);
  assert.equal(host.clients.size, 1);
});

test('offline Oncall moderation follows the retained sender identity across socket replacement', async t => {
  const { host, client, ws, Channel } = await voiceHost(t);
  let sender = await authenticate(client);
  const id = sender.frames.find(frame => frame.type === 'ready').id;
  const control = frame => ws.send(JSON.stringify({ ...frame, to: id, generation: host.generation }));
  control({ type: 'moderate', muted: true }); await flush();
  assert.ok(sender.frames.some(frame => frame.type === 'moderated' && frame.muted));
  sender.close();
  sender = await authenticate(client);
  assert.equal(sender.frames.find(frame => frame.type === 'ready').muted, true);
  control({ type: 'kick' }); await flush();
  assert.ok(sender.frames.some(frame => frame.type === 'kicked'));
  assert.ok(ws.frames.some(frame => frame.type === 'leave' && frame.id === id));
  client.close();
  const retry = new OfflineVoiceClient({ tool: 'voice-oncall', Channel }); t.after(() => retry.close());
  const offer = await host.createOffer(), reply = await retry.createAnswer(offer);
  await host.acceptAnswer(reply); await flush();
  const blocked = await authenticate(retry);
  assert.ok(blocked.frames.some(frame => frame.type === 'kicked'));
  assert.equal(host.clients.size, 0);
});

test('offline voice routes only matching generation and connection and filters nonlocal candidates', async t => {
  const { host, client, ws } = await voiceHost(t, 'walkie-talkie');
  const listener = await authenticate(client, LISTEN, null, 'listener');
  const id = listener.frames.find(frame => frame.type === 'ready').id;
  ws.send(JSON.stringify({ type: 'offer', to: id, generation: host.generation, connection: conn, sdp: AUDIO })); await flush();
  assert.equal(listener.frames.find(frame => frame.type === 'offer').to, id);
  listener.send(JSON.stringify({ type: 'answer', generation: crypto.randomUUID(), connection: conn, sdp: AUDIO }));
  listener.send(JSON.stringify({ type: 'answer', generation: host.generation, connection: crypto.randomUUID(), sdp: AUDIO }));
  listener.send(JSON.stringify({ type: 'candidate', generation: host.generation, connection: conn, candidate: { candidate: 'candidate:r 1 udp 1 1.2.3.4 5000 typ relay' } }));
  await flush();
  assert.equal(ws.frames.filter(frame => ['answer', 'candidate'].includes(frame.type)).length, 0);
  listener.send(JSON.stringify({ type: 'answer', generation: host.generation, connection: conn, sdp: AUDIO })); await flush();
  assert.equal(ws.frames.find(frame => frame.type === 'answer').from, id);
});

test('offline Oncall refuses excess remembered moderation without clearing earlier session blocks', async t => {
  const { host, client: original, ws, Channel } = await voiceHost(t);
  let client = original;
  let firstId;
  for (let n = 0; n < 25; n++) {
    const key = String(n).padStart(43, 's');
    const caller = await authenticate(client, key);
    const id = caller.frames.find(frame => frame.type === 'ready').id;
    firstId ??= id;
    ws.send(JSON.stringify({ type: 'kick', to: id, generation: host.generation })); await flush();
    if (n < 24) assert.ok(caller.frames.some(frame => frame.type === 'kicked'));
    else {
      assert.equal(caller.frames.some(frame => frame.type === 'kicked'), false);
      assert.ok(ws.frames.some(frame => frame.error === 'moderation-full'));
      assert.equal(host.clients.size, 1);
    }
    client.close(); await flush();
    if (n < 24) {
      client = new OfflineVoiceClient({ tool: 'voice-oncall', Channel });
      const offer = await host.createOffer(), reply = await client.createAnswer(offer);
      await host.acceptAnswer(reply); await flush();
    }
  }
  assert.equal(host.policies.size, 24);
  assert.equal(host.policies.get(firstId).kicked, true);
});

test('offline voice replaces only pending invitations and closes all participants on End', async t => {
  const { host, client, Channel, reply } = await voiceHost(t);
  const first = await authenticate(client);
  const nextOffer = await host.createOffer();
  await assert.rejects(host.acceptAnswer(reply), /offline.invalid-answer/);
  assert.equal(first.readyState, 1);
  const second = new OfflineVoiceClient({ tool: 'voice-oncall', Channel }); t.after(() => second.close());
  const nextReply = await second.createAnswer(nextOffer);
  await host.acceptAnswer(nextReply); await flush();
  const secondSocket = await authenticate(second, 't'.repeat(43));
  assert.equal(host.clients.size, 2);
  host.close(); await flush();
  assert.equal(first.readyState, 3);
  assert.equal(secondSocket.readyState, 3);
  assert.throws(() => new client.Socket(), /offline.disconnected/);
});

test('offline clients reject foreign or malformed offers before allocating a channel', async () => {
  const Channel = transport();
  const voice = new OfflineVoiceClient({ tool: 'voice-oncall', Channel });
  const text = new OfflineTextClient({ Channel });
  await assert.rejects(voice.createAnswer('{'), /offline.invalid-offer/);
  const offer = offlineBlock('walkie-talkie', { session: '1'.repeat(32), expires: Date.now() + 600000 }, { type: 'offer', sdp: SDP });
  await assert.rejects(text.createAnswer(offer), /offline.invalid-offer/);
  assert.equal(Channel.instances.length, 0);
});

test('offline text uses assigned routing, explicit reader ready and preserves other readers', async t => {
  const Channel = transport(), host = new OfflineTextHost({ Channel }); t.after(() => host.close());
  const hostSocket = await socket(host.Socket);
  const clients = [];
  for (let i = 0; i < 2; i++) {
    const client = new OfflineTextClient({ Channel }); t.after(() => client.close());
    const offer = await host.createOffer(), answer = await client.createAnswer(offer);
    await host.acceptAnswer(answer); await flush();
    clients.push({ client, ws: await socket(client.Socket) });
  }
  assert.ok(clients.every(({ ws }) => ws.frames.some(frame => frame.type === 'ready')));
  clients[0].ws.send(JSON.stringify({ to: 'spoofed-reader', data: { sdp: { type: 'offer', sdp: SDP }, local: false } })); await flush();
  const request = hostSocket.frames.find(frame => frame.type === 'signal');
  assert.equal(request.data.local, true);
  assert.notEqual(request.from, 'spoofed-reader');
  hostSocket.send(JSON.stringify({ to: request.from, data: { sdp: { type: 'answer', sdp: SDP }, local: false } })); await flush();
  assert.equal(clients[0].ws.frames.filter(frame => frame.type === 'signal').length, 1);
  assert.equal(clients[1].ws.frames.filter(frame => frame.type === 'signal').length, 0);
  const old = clients[0].ws;
  old.close();
  clients[0].ws = await socket(clients[0].client.Socket);
  assert.equal(clients[0].ws.frames.filter(frame => frame.type === 'ready').length, 1);
  assert.equal(clients[1].ws.readyState, 1);
  host.close(); await flush();
  assert.ok(clients.every(({ ws }) => ws.readyState === 3));
});

test('offline text bounds independent exchanges at sixteen without replacing established readers', async t => {
  const Channel = transport(), host = new OfflineTextHost({ Channel }); t.after(() => host.close());
  await socket(host.Socket);
  for (let i = 0; i < 16; i++) {
    const client = new OfflineTextClient({ Channel }); t.after(() => client.close());
    const offer = await host.createOffer(), answer = await client.createAnswer(offer);
    await host.acceptAnswer(answer); await flush();
  }
  await assert.rejects(host.createOffer(), /offline.full/);
  assert.equal(host.links.size, 16);
  assert.ok([...host.links.values()].every(link => link.channel.readyState === 1));
});

test('offline local sockets bound queued frames and never deliver after close', async () => {
  const ws = new OfflineSocket(() => true, () => {});
  let received = 0; ws.onmessage = () => received++;
  await flush();
  for (let i = 0; i < 257; i++) ws.receive('{}');
  await flush();
  assert.equal(ws.readyState, 3);
  assert.equal(received, 0);
});

test('offline channel handles already-open delivery once and rejects extra channels', async () => {
  class Peer {
    constructor(config) { assert.deepEqual(config, { iceServers: [] }); }
    close() { this.closed = true; }
  }
  let opened = 0;
  const owner = new OfflineChannel({ tool: 'share-text', Peer, onOpen: () => opened++ });
  const dc = { label: 'abox-offline-signaling-v1', readyState: 'open', close() { this.closed = true; } };
  owner.attach(dc);
  dc.onopen(); await flush();
  assert.equal(opened, 1);
  const extra = { ...dc, close() { this.closed = true; } };
  owner.attach(extra);
  assert.equal(extra.closed, true);
  assert.equal(owner.readyState, 3);
  assert.equal(owner.pc.closed, true);
});
