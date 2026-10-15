import test from 'node:test';
import assert from 'node:assert/strict';
import { TOOL, PROTOCOL, makeCode, parseCode, viewerLink, controlMessage, relayServer } from '../../tools/share-tab/src/protocol.js';

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
  assert.equal(viewerLink('https://abox.tools/share-tab/?old=1#old', 'tab-abcdefghijklmnop'), 'https://abox.tools/share-tab/#tab-abcdefghijklmnop');
  assert.throws(() => viewerLink('https://abox.tools/share-tab/', undefined), /code.invalid/);
});

test('tab control accepts only bounded admission and ending messages', () => {
  const frame = (type, values = {}) => JSON.stringify({ protocol: PROTOCOL, type, ...values });
  assert.equal(controlMessage(frame('request', { note: 'My screen' })).note, 'My screen');
  assert.equal(controlMessage(frame('approval-ack')).type, 'approval-ack');
  for (const type of ['click', 'keypress', 'navigate', 'execute']) assert.equal(controlMessage(frame(type)), null);
  assert.equal(controlMessage(frame('request', { note: 'x'.repeat(81) })), null);
  assert.equal(controlMessage(frame('request')), null);
  assert.equal(controlMessage(JSON.stringify({ protocol: 'share-text', type: 'approved' })), null);
  assert.equal(controlMessage('x'.repeat(1025)), null);
});

test('relay credentials must name a bounded TURN service', () => {
  const relay = { urls: ['turn:relay.example:3478?transport=udp'], username: 'temporary', credential: 'secret' };
  assert.deepEqual(relayServer([relay]), relay);
  assert.equal(relayServer([{ ...relay, urls: ['https://example.test/'] }]), null);
  assert.equal(relayServer([{ ...relay, credential: '' }]), null);
  assert.equal(relayServer(null), null);
});
