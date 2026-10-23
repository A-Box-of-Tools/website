import test from 'node:test';
import assert from 'node:assert/strict';
import { TOOL, PROTOCOL, makeCode, parseCode, viewerLink, controlMessage } from '../../tools/share-tab/src/protocol.js';

test('tab invitations keep their tool namespace and unpredictable code', () => {
  const random = { getRandomValues(bytes) { bytes.fill(31); return bytes; } };
  assert.equal(TOOL, 'share-tab');
  assert.equal(makeCode(random), 'tab-7777777777777777');
  assert.equal(parseCode(' https://abox.tools/share-tab/#TAB-ABCDEFGHIJKLMNOP '), 'tab-abcdefghijklmnop');
  assert.equal(parseCode('#tab-abcdefghijklmnop'), 'tab-abcdefghijklmnop');
  assert.equal(parseCode('tab-abc234'), null);
  assert.equal(parseCode('tab-abc234/other'), null);
  assert.equal(parseCode('x'.repeat(2049)), null);
  assert.equal(parseCode(null), null);
  assert.equal(viewerLink('https://abox.tools/share-tab/?old=1#old', 'tab-abcdefghijklmnop'), 'https://abox.tools/share-tab/?transport=direct#tab-abcdefghijklmnop');
  assert.equal(viewerLink('https://abox.tools/share-tab/?old=1#old', 'tab-abcdefghijklmnop', 'relay'), 'https://abox.tools/share-tab/?transport=relay#tab-abcdefghijklmnop');
  assert.throws(() => viewerLink('https://abox.tools/share-tab/', 'tab-abcdefghijklmnop', 'automatic'), /transport.invalid/);
  assert.throws(() => viewerLink('https://abox.tools/share-tab/', undefined), /code.invalid/);
});

test('tab control accepts only bounded admission and ending messages', () => {
  const frame = (type, values = {}) => JSON.stringify({ protocol: PROTOCOL, type, ...values });
  assert.equal(controlMessage(frame('request', { note: 'My screen' })).note, 'My screen');
  assert.equal(controlMessage(frame('approval-ack')).type, 'approval-ack');
  for (const type of ['click', 'keypress', 'navigate', 'execute', 'relay', 'signal']) assert.equal(controlMessage(frame(type)), null);
  assert.equal(controlMessage(frame('request', { note: 'x'.repeat(81) })), null);
  assert.equal(controlMessage(frame('request')), null);
  for (const token of [null, 12, 'same device', 'a'.repeat(65)]) {
    assert.equal(controlMessage(frame('request', { note: '', token })), null);
    assert.equal(controlMessage(frame('approved', { token })), null);
  }
  assert.equal(controlMessage(frame('request', { note: '', token: 'a'.repeat(64) })).token, 'a'.repeat(64));
  assert.equal(controlMessage(JSON.stringify({ protocol: 'share-text', type: 'approved' })), null);
  assert.equal(controlMessage('x'.repeat(1025)), null);
});
