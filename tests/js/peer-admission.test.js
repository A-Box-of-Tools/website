import test from 'node:test';
import assert from 'node:assert/strict';
import { AdmissionGrants, createAdmissionCache, validAdmissionToken } from '../../shared/js/peer-admission.js';

function random() {
  let value = 0;
  return { getRandomValues(bytes) { assert.equal(bytes.length, 32); bytes.fill(++value); return bytes; } };
}
function storage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}

test('host grants survive a normal return but only their original session can honor them', () => {
  const host = new AdmissionGrants({ random: random() }), other = new AdmissionGrants({ random: random() });
  const token = host.issue();
  assert.match(token, /^[a-f0-9]{64}$/);
  assert.equal(host.issue(token), token);
  assert.equal(other.has(token), false);
  assert.equal(host.has('the same device name'), false);
  assert.equal(host.has('cam-abcdefghijkl'), false);
  host.revoke(token);
  assert.equal(host.has(token), false);
  const next = host.issue();
  host.clear();
  assert.equal(host.has(next), false);
});

test('a full grant cache never evicts an admitted device or approves without a grant', () => {
  const grants = new AdmissionGrants({ random: random(), limit: 2 });
  const first = grants.issue(), second = grants.issue();
  assert.equal(grants.issue(), null);
  assert.equal(grants.issue(first), first);
  assert.equal(grants.has(second), true);
  grants.revoke(second);
  assert.ok(grants.issue());
  assert.equal(grants.has(first), true);
  const unavailable = new AdmissionGrants({ random: { getRandomValues() { throw new Error('Unavailable'); } } });
  assert.equal(unavailable.issue(), null);
});

test('a browser receipt is shared across tabs but stays scoped to its tool, room and route', () => {
  const shared = storage(), first = createAdmissionCache({ storage: () => shared });
  const token = new AdmissionGrants({ random: random() }).issue();
  first.save('share-text', 'my-room', 'direct', token);
  const nextTab = createAdmissionCache({ storage: () => shared });
  assert.equal(nextTab.read('share-text', 'my-room', 'direct'), token);
  for (const scope of [['remote-camera', 'my-room', 'direct'], ['share-text', 'other-room', 'direct'], ['share-text', 'my-room', 'relay']]) {
    assert.equal(nextTab.read(...scope), null);
  }
  const otherBrowser = createAdmissionCache({ storage: () => storage() });
  assert.equal(otherBrowser.read('share-text', 'my-room', 'direct'), null);
});

test('blocked browser storage preserves same-page returns without claiming cross-tab persistence', () => {
  const denied = () => { throw new DOMException('Blocked', 'SecurityError'); };
  const cache = createAdmissionCache({ storage: denied });
  const token = new AdmissionGrants({ random: random() }).issue();
  cache.save('share-tab', 'a', 'direct', token);
  assert.equal(cache.read('share-tab', 'a', 'direct'), token);
  assert.equal(createAdmissionCache({ storage: denied }).read('share-tab', 'a', 'direct'), null);
});

test('receipt storage is bounded and ignores corrupt values and non-credentials', () => {
  const shared = storage(), cache = createAdmissionCache({ storage: () => shared, limit: 2 });
  const token = new AdmissionGrants({ random: random() }).issue();
  for (const code of ['old', 'current', 'latest']) cache.save('remote-camera', code, 'direct', token);
  assert.equal(cache.read('remote-camera', 'old', 'direct'), null);
  assert.equal(cache.read('remote-camera', 'current', 'direct'), token);
  cache.save('remote-camera', 'current', 'direct', 'camera name');
  assert.equal(cache.read('remote-camera', 'current', 'direct'), token);
  for (const raw of ['{', '{}', '[["room","password"]]', 'null']) {
    const corrupt = createAdmissionCache({ storage: () => ({ getItem: () => raw }) });
    assert.equal(corrupt.read('remote-camera', 'current', 'direct'), null);
  }
  assert.equal(validAdmissionToken(null), false);
  assert.equal(validAdmissionToken('a'.repeat(65)), false);
  assert.equal(validAdmissionToken('12345678-1234-4123-8123-123456789abc'), true, 'existing ShareText receipts remain compatible');
});
