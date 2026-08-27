/**
 * tools/share-text/src/names.js - link names and the fold applied to them.
 *
 * A typed name becomes a URL fragment and a room name at the rendezvous, so
 * the fold has to land inside the server's accepted shape every time - a
 * near-miss that reached the wire would be refused with a bare error rather
 * than a sentence.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CODE_PATTERN, formatSize, makeCode, normalize,
} from '../../tools/share-text/src/names.js';

test('a suggestion is speakable and already valid', () => {
  for (let i = 0; i < 200; i += 1) {
    const code = makeCode();
    assert.match(code, /^[a-z]+-[a-z]+-\d\d$/);
    assert.match(code, CODE_PATTERN);
  }
});

test('typed names fold to the accepted shape', () => {
  assert.equal(normalize('  My Secret NOTE!! '), 'my-secret-note');
  assert.equal(normalize('under_scores and  spaces'), 'under-scores-and-spaces');
  assert.equal(normalize('---edges---'), 'edges');
  assert.equal(normalize('émigré café'), 'migr-caf');
  assert.equal(normalize('!!!'), '');
  assert.equal(normalize('a'.repeat(100)).length, 64);
});

test('everything the fold produces, the pattern accepts', () => {
  const inputs = ['Plain', '  x  ', 'a_b c-d', '42', 'ÜBER große Namen!'];
  for (const raw of inputs) {
    const folded = normalize(raw);
    if (folded !== '') assert.match(folded, CODE_PATTERN);
  }
});

test('sizes read in the units the page supplies', () => {
  const units = { b: 'B', kb: 'KB', mb: 'MB' };
  assert.equal(formatSize(0, units), '0 B');
  assert.equal(formatSize(1023, units), '1023 B');
  assert.equal(formatSize(1024, units), '1.0 KB');
  assert.equal(formatSize(2 * 1024 * 1024, units), '2.0 MB');
});
