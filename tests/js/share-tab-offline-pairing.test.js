import test from 'node:test';
import assert from 'node:assert/strict';
import { newOfflinePairing, offlineBlock, readOfflineBlock, OFFLINE_LIFETIME } from '../../tools/share-tab/src/offline-pairing.js';

const NOW = 1800000000000;
const SDP = 'v=0\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\na=candidate:lan1 1 udp 1 device.local 5000 typ host\r\na=candidate:map1 1 udp 1 198.51.100.1 5001 typ srflx\r\n';
const random = { getRandomValues(bytes) { bytes.fill(1); return bytes; } };

test('offline blocks carry a random binding, version and ten minute expiry without mapped routes', () => {
  const pairing = newOfflinePairing(random, NOW);
  assert.equal(pairing.session, '01'.repeat(16)); assert.equal(pairing.expires, NOW + OFFLINE_LIFETIME);
  const text = offlineBlock(pairing, { type: 'offer', sdp: SDP });
  const parsed = readOfflineBlock(text, 'offer', { now: NOW });
  assert.equal(parsed.session, pairing.session); assert.equal(parsed.description.sdp.includes('srflx'), false);
  assert.equal(readOfflineBlock(text, 'offer', { now: NOW + 86400000, checkExpiry: false }).session, pairing.session);
});

test('offline blocks reject expired, foreign, malformed and preattached media descriptions', () => {
  const pairing = newOfflinePairing(random, NOW), text = offlineBlock(pairing, { type: 'offer', sdp: SDP });
  assert.throws(() => readOfflineBlock(text, 'offer', { now: pairing.expires }), /offline.expired/);
  assert.throws(() => readOfflineBlock(text, 'answer', { now: NOW }), /offline.invalid-answer/);
  assert.throws(() => readOfflineBlock('x'.repeat(65537), 'offer', { now: NOW }), /offline.invalid-offer/);
  assert.throws(() => readOfflineBlock('{', 'offer', { now: NOW }), /offline.invalid-offer/);
  for (const type of ['audio', 'video']) {
    const value = JSON.parse(text); value.description.sdp += `m=${type} 9 UDP/TLS/RTP/SAVPF 96\r\n`;
    assert.throws(() => readOfflineBlock(JSON.stringify(value), 'offer', { now: NOW }), /offline.invalid-offer/);
  }
  const answer = offlineBlock(pairing, { type: 'answer', sdp: SDP });
  assert.throws(() => readOfflineBlock(answer, 'answer', { now: NOW, pairing: { ...pairing, session: 'ff'.repeat(16) } }), /offline.invalid-answer/);
});
