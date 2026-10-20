import test from 'node:test';
import assert from 'node:assert/strict';
import { approved, approvalMatches, rememberApproval } from '../../workers/rendezvous/voice-approval.js';

const person = n => ({ id: n.toString(16).padStart(64, '0'), verified: true, admitted: true });

test('voice approvals retain ten identities and evict only disconnected admissions', () => {
  const active = Array.from({ length: 10 }, (_, i) => person(i + 1));
  let owner = { approval: true, approved: [] };
  // Distinct digest prefixes represent independent caller capabilities.
  for (const [index, peer] of active.entries()) peer.id = (index + 1).toString(16).repeat(64).slice(0, 64);
  for (const peer of active) owner = rememberApproval(owner, peer, active);
  assert.equal(owner.approved.length, 10);
  const newcomer = { ...person(11), id: 'b'.repeat(64), admitted: false };
  assert.equal(rememberApproval(owner, newcomer, active), null);
  const updated = rememberApproval(owner, newcomer, active.slice(1));
  assert.equal(updated.approved.length, 10);
  assert.equal(approved(updated, active[0]), false);
  assert.equal(approved(updated, newcomer), true);
  for (const peer of active.slice(1)) assert.equal(approved(updated, peer), true);
});

test('an invitation capability never substitutes for a listener admission identity', () => {
  const first = { id: '1'.repeat(32), clientHash: 'a'.repeat(64), listenHash: 'f'.repeat(64) };
  const owner = rememberApproval({ approval: true }, first, []);
  assert.equal(approved(owner, { ...first, id: '2'.repeat(32) }), true);
  assert.equal(approved(owner, { ...first, clientHash: 'b'.repeat(64) }), false);
  assert.equal(approvalMatches(owner, undefined), false);
  assert.equal(approvalMatches(owner, false), false);
  assert.equal(approvalMatches(owner, true), true);
});
