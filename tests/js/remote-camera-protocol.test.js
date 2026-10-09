import test from 'node:test';
import assert from 'node:assert/strict';
import { PROTOCOL, CODE_PATTERN, makeCode, parseCode, viewerLink, controlMessage } from '../../tools/remote-camera/src/protocol.js';
const code = 'cam-abcdefghijkl';
const message = (type, fields = {}) => JSON.stringify({ protocol: PROTOCOL, type, ...fields });
test('pairing codes consume twelve random bytes in the lowercase base32 alphabet', () => {
  let requested;
  const first = makeCode({ getRandomValues(bytes) { requested = bytes; bytes.fill(0); return bytes; } });
  const second = makeCode({ getRandomValues(bytes) { bytes.fill(31); return bytes; } });
  assert.ok(requested instanceof Uint8Array);
  assert.equal(requested.length, 12);
  assert.equal(first, 'cam-aaaaaaaaaaaa');
  assert.equal(second, 'cam-777777777777');
  assert.match(first, CODE_PATTERN); assert.match(second, CODE_PATTERN);
});
test('a pasted code, fragment or viewer URL resolves to the same code', () => {
  assert.equal(parseCode(`  ${code.toUpperCase()}  `), code);
  assert.equal(parseCode(`#${code}`), code);
  assert.equal(parseCode(viewerLink('https://example.test/remote-camera/', code)), code);
});
test('invalid and oversized pairing input is refused', () => {
  for (const value of ['', 'short', `${code}extra`, '!!!!!!!!!!!!', 'javascript:alert(1)', 'x'.repeat(2049), null]) assert.equal(parseCode(value), null);
});
test('viewer links carry the code in the fragment and discard old queries', () => {
  const url = new URL(viewerLink('https://example.test/remote-camera/?old=value#old', code));
  assert.equal(url.origin, 'https://example.test'); assert.equal(url.pathname, '/remote-camera/');
  assert.equal(url.search, ''); assert.equal(parseCode(url.href), code);
  assert.throws(() => viewerLink(url.href, 'bad'), /code.invalid/);
});
test('control messages require the protocol, a known type and bounded note', () => {
  for (const type of ['hello', 'approved', 'denied', 'busy', 'ended']) assert.deepEqual(controlMessage(message(type)), { protocol: PROTOCOL, type });
  for (const raw of ['{', 'null', '[]', '"hello"', JSON.stringify({ type: 'hello' }), JSON.stringify({ protocol: 'share-text-v1', type: 'hello' }), message('unknown'), message('hello').padEnd(1025, ' ')]) assert.equal(controlMessage(raw), null);
  const note = 'x'.repeat(80);
  assert.deepEqual(controlMessage(message('request', { note })), { protocol: PROTOCOL, type: 'request', note });
  for (const fields of [{}, { note: 42 }, { note: null }, { note: 'x'.repeat(81) }]) assert.equal(controlMessage(message('request', fields)), null);
});
