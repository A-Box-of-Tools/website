import test from 'node:test';
import assert from 'node:assert/strict';
import { createVoiceIdentityCache } from '../../shared/js/voice-identity.js';

const code = 'a'.repeat(64), first = 'A'.repeat(43), second = 'B'.repeat(43);
const stored = () => {
  const rows = new Map();
  return { getItem: key => rows.get(key) ?? null, setItem: (key, value) => rows.set(key, value) };
};

test('personal voice identity survives a new tab without sharing invitations or active connection state', () => {
  const storage = stored(), options = { storage: () => storage };
  const original = createVoiceIdentityCache(options);
  assert.equal(original.get('walkie-talkie', code, 'direct', first, () => second), first, 'migrates the existing personal key');
  const newTab = createVoiceIdentityCache(options);
  assert.equal(newTab.get('walkie-talkie', code, 'direct', null, () => second), first);
  assert.equal(newTab.get('voice-oncall', code, 'direct', null, () => second), second);
  assert.equal(newTab.get('walkie-talkie', code, 'relay', null, () => second), second);
  assert.equal(newTab.get('walkie-talkie', 'b'.repeat(64), 'direct', null, () => second), second);
  const rows = JSON.parse(storage.getItem('abox.voice-identities.v1'));
  assert.ok(rows.every(row => row.length === 2 && typeof row[1] === 'string'));
});

test('blocked storage retains identity for explicit rejoin in the same page', () => {
  const cache = createVoiceIdentityCache({ storage: () => { throw new Error('blocked'); } });
  assert.equal(cache.get('voice-oncall', code, 'direct', null, () => first), first);
  assert.equal(cache.get('voice-oncall', code, 'direct', null, () => second), first);
});

test('invalid stored capabilities cannot become participant identities and the cache stays bounded', () => {
  const storage = stored();
  const scope = JSON.stringify(['walkie-talkie', code, 'direct']);
  storage.setItem('abox.voice-identities.v1', JSON.stringify([[scope, 'not-a-secret']]));
  const cache = createVoiceIdentityCache({ storage: () => storage, limit: 2 });
  assert.equal(cache.get('walkie-talkie', code, 'direct', 'bad', () => first), first);
  assert.equal(cache.get('walkie-talkie', 'bad-code', 'direct', null, () => second), null);
  cache.get('voice-oncall', code, 'direct', null, () => second);
  cache.get('walkie-talkie', code, 'relay', null, () => second);
  assert.equal(JSON.parse(storage.getItem('abox.voice-identities.v1')).length, 2);
});
