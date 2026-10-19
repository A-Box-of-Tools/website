import test from 'node:test';
import assert from 'node:assert/strict';
import { createGroupCode, groupIdentifier, groupUrl, normalizeGroupCode } from '../../shared/js/discovery-group.js';

test('private discovery codes keep 26 random base32 symbols and accept only display separators', () => {
  const codes = new Set();
  for (let i = 0; i < 50; i++) {
    const formatted = createGroupCode(), canonical = normalizeGroupCode(formatted);
    assert.match(formatted, /^[0-9A-HJKMNP-TV-Z]{5}(?:-[0-9A-HJKMNP-TV-Z]{5}){3}-[0-9A-HJKMNP-TV-Z]{6}$/);
    assert.equal(canonical.length, 26);
    assert.equal(normalizeGroupCode(' ' + formatted.toLowerCase().replaceAll('-', ' ') + ' '), canonical);
    codes.add(canonical);
  }
  assert.equal(codes.size, 50);
  for (const invalid of [null, 1, {}, '', 'A'.repeat(25), 'A'.repeat(27), 'I'.repeat(26),
    'O'.repeat(26), 'U'.repeat(26), 'A'.repeat(25) + '\n', 'A'.repeat(25) + '\t', 'А'.repeat(26)]) {
    assert.equal(normalizeGroupCode(invalid), null);
  }
});

test('private directory identifiers are domain-separated and do not encode the code as a URL credential', async () => {
  const code = 'A'.repeat(26);
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256',
    new TextEncoder().encode('abox.tools/private-discovery/v1\n' + code)));
  const expected = [...digest].map(value => value.toString(16).padStart(2, '0')).join('');
  assert.equal(await groupIdentifier(code), expected);
  assert.equal(await groupIdentifier('AAAAA-AAAAA-AAAAA-AAAAA-AAAAAA'), expected);
  assert.notEqual(await groupIdentifier('B'.repeat(26)), expected);
  assert.equal(await groupIdentifier('short'), null);
  const address = groupUrl('wss://rendezvous.example/discover?tool=share-tab&group=old&group=old2', expected);
  assert.equal(new URL(address).searchParams.getAll('group').length, 1);
  assert.equal(new URL(address).searchParams.get('group'), expected);
  assert.equal(address.includes(code), false);
  assert.equal(new URL(groupUrl(address)).searchParams.has('group'), false);
  assert.throws(() => groupUrl(address, code), /invalid-group-identifier/);
});
