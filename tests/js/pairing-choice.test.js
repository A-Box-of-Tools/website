import test from 'node:test';
import assert from 'node:assert/strict';
import { pairingChoice } from '../../shared/js/pairing-choice.js';

test('shared Automatic uses only an explicit offline hint and makes no reachability claim', () => {
  for (const online of [undefined, true, null]) assert.deepEqual(pairingChoice({ online }), { method: 'online', notice: '' });
  assert.deepEqual(pairingChoice({ online: false }), { method: 'offline', notice: 'pairing.detected-offline' });
});

test('shared explicit preference wins over invitations, manual drafts and failed introductions', () => {
  for (const preference of ['online', 'offline']) {
    assert.deepEqual(pairingChoice({ preference, online: preference === 'offline', invitation: true,
      invitationLink: true, manualDraft: true, introductionFailed: true }), { method: preference, notice: '' });
  }
});

test('shared Automatic preserves invitation and manual draft intent in the intended order', () => {
  assert.deepEqual(pairingChoice({ online: false, invitationLink: true, manualDraft: true }), { method: 'online', notice: 'pairing.invitation-offline' });
  assert.deepEqual(pairingChoice({ online: true, invitation: true, manualDraft: true }), { method: 'offline', notice: 'pairing.manual-draft' });
  assert.deepEqual(pairingChoice({ online: false, invitation: true }), { method: 'online', notice: 'pairing.invitation-offline' });
  assert.deepEqual(pairingChoice({ online: true, introductionFailed: true, invitationLink: true }), { method: 'offline', notice: 'pairing.unavailable' });
});
