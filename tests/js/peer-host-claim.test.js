import test from 'node:test';
import assert from 'node:assert/strict';
import { answerHostProve, createHostClaim, holderUrl } from '../../shared/js/peer-host-claim.js';
import { broadcastCode } from '../../workers/rendezvous/broadcast.js';

test('a claim is a key the rendezvous can check and a digest it can be shown', async () => {
  const claim = await createHostClaim();
  assert.match(claim.key, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(claim.digest, await broadcastCode(claim.key), 'the page and the worker must agree on the digest');
  assert.notEqual((await createHostClaim()).key, claim.key);
});

test('the URL carries the digest and never the key', async () => {
  const claim = await createHostClaim();
  const url = holderUrl('wss://rendezvous.example/ws/room?role=host&transport=direct', claim);
  assert.equal(new URL(url).searchParams.get('holder'), claim.digest);
  assert.equal(new URL(url).searchParams.get('role'), 'host');
  assert.equal(url.includes(claim.key), false);
  assert.equal(holderUrl(url, null), 'wss://rendezvous.example/ws/room?role=host&transport=direct');
  assert.equal(holderUrl(holderUrl(url, claim), claim), url, 'naming it twice is still naming it once');
});

test('the key leaves only in answer to a request for proof', () => {
  const claim = { key: 'K'.repeat(43), digest: 'd'.repeat(64) }, sent = [];
  const send = (frame) => sent.push(frame);
  for (const frame of [{ type: 'host-ready' }, { type: 'signal' }, null, undefined]) {
    assert.equal(answerHostProve(frame, claim, send), false);
  }
  assert.deepEqual(sent, []);
  assert.equal(answerHostProve({ type: 'host-prove' }, claim, send), true);
  assert.deepEqual(sent, [{ type: 'host-proof', key: claim.key }]);
  assert.equal(answerHostProve({ type: 'host-prove' }, null, send), true, 'consumed, with nothing to send');
  assert.equal(sent.length, 1);
});
