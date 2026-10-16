import test from 'node:test';
import assert from 'node:assert/strict';
import { pairingChoice } from '../../tools/share-tab/src/pairing-choice.js';

test('automatic pairing treats only an explicit offline hint as offline', () => {
  for (const online of [true, undefined]) assert.equal(pairingChoice({ online }).method, 'online');
  assert.deepEqual(pairingChoice({ online: false }), { method: 'offline', notice: 'pairing.detected-offline' });
});

test('explicit choices override network hints and a prior introduction failure', () => {
  assert.deepEqual(pairingChoice({ preference: 'offline', online: true, invitation: true }), { method: 'offline', notice: '' });
  assert.deepEqual(pairingChoice({ preference: 'online', online: false, introductionFailed: true }), { method: 'online', notice: '' });
});

test('an online invitation retains its meaning when the browser reports offline', () => {
  assert.deepEqual(pairingChoice({ online: false, invitation: true }), { method: 'online', notice: 'pairing.invitation-offline' });
});

test('an actual failed introduction offers a fresh manual attempt even for an online invitation', () => {
  assert.deepEqual(pairingChoice({ introductionFailed: true, invitation: true }), { method: 'offline', notice: 'pairing.unavailable' });
});

test('a manual draft remains visible when the browser reports internet again', () => {
  assert.deepEqual(pairingChoice({ online: true, manualDraft: true }), { method: 'offline', notice: 'pairing.manual-draft' });
});

test('opening an online invitation takes precedence over an older manual draft', () => {
  assert.deepEqual(pairingChoice({ online: false, invitationLink: true, manualDraft: true }),
    { method: 'online', notice: 'pairing.invitation-offline' });
  assert.equal(pairingChoice({ preference: 'offline', invitationLink: true, manualDraft: true }).method, 'offline');
});
