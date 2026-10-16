import test from 'node:test';
import assert from 'node:assert/strict';
import { OfflineExchange, newOfflinePairing, offlineBlock, readOfflineBlock, OFFLINE_LIFETIME } from '../../shared/js/offline-pairing.js';

const NOW = 1800000000000;
const SDP = 'v=0\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\na=candidate:lan 1 udp 1 device.local 5000 typ host\r\na=candidate:external 1 udp 1 198.51.100.1 5001 typ srflx\r\n';
const random = { getRandomValues(bytes) { bytes.fill(2); return bytes; } };

class Peer extends EventTarget {
  iceGatheringState = 'complete'; localDescription = null; remoteDescription = null;
  async createOffer() { return { type: 'offer', sdp: SDP }; }
  async createAnswer() { return { type: 'answer', sdp: SDP }; }
  async setLocalDescription(value) { this.localDescription = value; }
  async setRemoteDescription(value) { this.remoteDescription = value; }
}

function fixture({ tool = 'remote-camera', time = NOW, gathering = false } = {}) {
  const timers = new Map(), expired = [], pc = new Peer();
  let next = 0, current = true;
  if (gathering) pc.iceGatheringState = 'gathering';
  const clock = {
    setTimeout(fn, delay) { const id = ++next; timers.set(id, { fn, deadline: time + delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
  };
  const exchange = new OfflineExchange({ tool, pc, random, clock, now: () => time,
    current: () => current, onExpire: (key) => expired.push(key) });
  return { exchange, pc, timers, expired,
    invalidate() { current = false; },
    advance(ms) {
      time += ms;
      for (const [id, task] of [...timers]) if (task.deadline <= time) { timers.delete(id); task.fn(); }
    },
  };
}

test('shared offline blocks bind each tool and refuse media, oversized and mismatched replies', () => {
  const pairing = newOfflinePairing(random, NOW);
  const offer = offlineBlock('remote-camera', pairing, { type: 'offer', sdp: SDP });
  assert.equal(JSON.parse(offer).format, 'remote-camera-offline-v1');
  assert.equal(readOfflineBlock('remote-camera', offer, 'offer', { now: NOW }).description.sdp.includes('srflx'), false);
  assert.throws(() => readOfflineBlock('share-text', offer, 'offer', { now: NOW }), /offline.invalid-offer/);
  assert.throws(() => readOfflineBlock('remote-camera', 'x'.repeat(65537), 'offer'), /offline.invalid-offer/);
  for (const kind of ['audio', 'video']) {
    const value = JSON.parse(offer); value.description.sdp += `m=${kind} 9 UDP/TLS/RTP/SAVPF 96\r\n`;
    assert.throws(() => readOfflineBlock('remote-camera', JSON.stringify(value), 'offer', { now: NOW }), /offline.invalid-offer/);
  }
  const reply = offlineBlock('remote-camera', pairing, { type: 'answer', sdp: SDP });
  assert.throws(() => readOfflineBlock('remote-camera', reply, 'answer', { now: NOW, pairing: { ...pairing, session: 'ff'.repeat(16) } }), /offline.invalid-answer/);
  assert.throws(() => readOfflineBlock('remote-camera', offer, 'offer', { now: pairing.expires }), /offline.expired/);
});

test('shared offline exchange tolerates clock skew and admits its reply exactly once', async (t) => {
  const host = fixture(), viewer = fixture({ time: NOW + 86400000 });
  t.after(() => { host.exchange.close(); viewer.exchange.close(); });
  const offer = await host.exchange.createOffer();
  const reply = await viewer.exchange.createAnswer(offer);
  assert.equal(host.pc.localDescription.sdp.includes('srflx'), false);
  assert.equal(viewer.pc.remoteDescription.sdp.includes('srflx'), false);
  await host.exchange.acceptAnswer(reply);
  await assert.rejects(host.exchange.acceptAnswer(reply), /offline.invalid-answer/);
  host.exchange.connected(); viewer.exchange.connected();
  assert.equal(host.timers.size, 0); assert.equal(viewer.timers.size, 0);
  host.advance(OFFLINE_LIFETIME); viewer.advance(OFFLINE_LIFETIME);
  assert.deepEqual(host.expired, []); assert.deepEqual(viewer.expired, []);
});

test('an unfinished shared offline exchange expires and cannot later accept a reply', async () => {
  const host = fixture(), viewer = fixture();
  const reply = await viewer.exchange.createAnswer(await host.exchange.createOffer());
  host.advance(OFFLINE_LIFETIME);
  assert.deepEqual(host.expired, ['offline.expired']);
  assert.equal(host.timers.size, 0);
  await assert.rejects(host.exchange.acceptAnswer(reply), /connection.stopped/);
  viewer.exchange.close();
});

test('closing a shared offline exchange cancels gathering without closing its caller-owned peer', async () => {
  const pending = fixture({ gathering: true });
  const result = pending.exchange.createOffer();
  await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
  pending.exchange.close();
  await assert.rejects(result, /connection.stopped/);
  assert.equal(pending.timers.size, 0);
  pending.pc.iceGatheringState = 'complete';
  pending.pc.dispatchEvent(new Event('icegatheringstatechange'));
  assert.deepEqual(pending.expired, []);
});

test('shared gathering is bounded and invalidated operations cannot return a block', async () => {
  const bounded = fixture({ gathering: true });
  const result = bounded.exchange.createOffer();
  await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
  bounded.advance(20000);
  await assert.rejects(result, /connection.direct-failed/);
  bounded.exchange.close();
  assert.equal(bounded.timers.size, 0);
  const stale = fixture();
  stale.pc.setLocalDescription = async () => stale.invalidate();
  await assert.rejects(stale.exchange.createOffer(), /connection.stopped/);
  stale.exchange.close();
  assert.equal(stale.timers.size, 0);
});
