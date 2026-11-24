import test from 'node:test';
import assert from 'node:assert/strict';
import { TOOL, PROTOCOL, CHANNEL, FILES, LANE_PATTERN, makeCode, makeRunId, parseCode, inviteLink, controlMessage } from '../../tools/folder-sync/src/protocol.js';

test('sync invitations keep their own namespace and an unpredictable code', () => {
  const random = { getRandomValues(bytes) { bytes.fill(31); return bytes; } };
  assert.equal(TOOL, 'folder-sync');
  assert.equal(makeCode(random), 'sync-7777777777777777');
  assert.match(makeRunId(), /^[a-f0-9]{32}$/);
  assert.equal(parseCode(' https://abox.tools/folder-sync/#SYNC-ABCDEFGHIJKLMNOP '), 'sync-abcdefghijklmnop');
  assert.equal(parseCode('#sync-abcdefghijklmnop'), 'sync-abcdefghijklmnop');
  assert.equal(parseCode('tab-abcdefghijklmnop'), null, "another tool's code");
  assert.equal(parseCode('sync-abc234'), null);
  assert.equal(parseCode('x'.repeat(2049)), null);
  assert.equal(parseCode(null), null);
  assert.equal(inviteLink('https://abox.tools/folder-sync/?old=1#old', 'sync-abcdefghijklmnop'), 'https://abox.tools/folder-sync/#sync-abcdefghijklmnop');
  assert.throws(() => inviteLink('https://abox.tools/folder-sync/', 'tab-abcdefghijklmnop'), /code.invalid/);
  assert.match(`${FILES}${'a'.repeat(32)}`, LANE_PATTERN);
  assert.doesNotMatch(CHANNEL, LANE_PATTERN);
  assert.doesNotMatch(`${FILES}${'a'.repeat(31)}`, LANE_PATTERN);
});

test('control frames are refused unless their shape is exactly one this page sends', () => {
  const frame = (type, values = {}) => JSON.stringify({ protocol: PROTOCOL, type, ...values });
  const run = 'a'.repeat(32);
  assert.equal(controlMessage(frame('request', { note: 'My laptop' })).note, 'My laptop');
  assert.equal(controlMessage(frame('request', { note: 'x'.repeat(81) })), null);
  assert.equal(controlMessage(frame('folder', { name: 'Photos', mode: 'both', into: 'folder', files: 3, bytes: 10 })).mode, 'both');
  for (const values of [{ name: 'P', mode: 'mirror', into: 'folder', files: 1, bytes: 1 }, { name: 'P', mode: 'both', into: 'cloud', files: 1, bytes: 1 },
    { name: 'x'.repeat(256), mode: 'both', into: 'zip', files: 1, bytes: 1 }, { name: 'P', mode: 'both', into: 'zip', files: -1, bytes: 1 }]) {
    assert.equal(controlMessage(frame('folder', values)), null, JSON.stringify(values));
  }
  assert.equal(controlMessage(frame('list', { gen: 1, part: [], done: true })).type, 'list');
  assert.equal(controlMessage(frame('list', { gen: 0, part: [], done: true })), null);
  assert.equal(controlMessage(frame('list', { gen: 1, part: {}, done: true })), null);
  assert.equal(controlMessage(frame('hashes', { gens: [1, 2], part: [], done: false })).type, 'hashes');
  assert.equal(controlMessage(frame('hash-request', { gens: [1], part: [], done: true })), null);
  assert.equal(controlMessage(frame('sync', { id: run, gens: [1, 1], part: [], done: true })).id, run);
  assert.equal(controlMessage(frame('sync', { id: [run], gens: [1, 1], part: [], done: true })), null, 'an id must be a string');
  assert.equal(controlMessage(frame('sync-no', { id: run, reason: 'busy' })).reason, 'busy');
  assert.equal(controlMessage(frame('sync-no', { id: run, reason: 'because' })), null);
  assert.equal(controlMessage(frame('sync-done', { id: run, received: 2, failed: 0 })).received, 2);
  for (const type of ['delete', 'execute', 'signal', 'toString', '__proto__']) assert.equal(controlMessage(frame(type)), null, type);
  for (const token of [null, 12, 'same device', 'a'.repeat(65)]) assert.equal(controlMessage(frame('approved', { token })), null);
  assert.equal(controlMessage(frame('approved', { token: 'a'.repeat(64) })).token, 'a'.repeat(64));
  assert.equal(controlMessage(frame('list', { gen: 1, part: [], done: true, token: 'a'.repeat(64) })), null);
  assert.equal(controlMessage(JSON.stringify({ protocol: 'share-tab-v1', type: 'hello' })), null);
  assert.equal(controlMessage('x'.repeat(65537)), null);
  assert.equal(controlMessage('[1,2]'), null);
});
