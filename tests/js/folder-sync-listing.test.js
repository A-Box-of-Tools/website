import test from 'node:test';
import assert from 'node:assert/strict';
import { splitParts, listRows, readListRows, readKeyRows, readHashRows, readActionRows, PART_BYTES, MAX_FILES } from '../../tools/folder-sync/src/listing.js';

const name = String.fromCharCode(0x540d, 0x524d);
const acute = String.fromCharCode(0x301);

test('listing parts stay inside the frame budget whatever script the names are in', () => {
  const rows = [];
  for (let i = 0; i < 3000; i += 1) rows.push([`folder ${i}/${name.repeat(20)} ${i}.txt`, i, 1700000000000 + i]);
  const parts = splitParts(rows);
  assert.ok(parts.length > 1);
  assert.deepEqual(parts.flat(), rows);
  for (const part of parts) assert.ok(new TextEncoder().encode(JSON.stringify(part)).length <= PART_BYTES);
  // An empty folder still sends one part, so the other side hears that it is done.
  assert.deepEqual(splitParts([]), [[]]);
  const entries = new Map([['a.txt', { key: 'a.txt', size: 3, mtime: 9 }]]);
  assert.deepEqual(listRows(entries), [['a.txt', 3, 9]]);
});

test('a peer listing keeps only well-formed, unrepeated rows and refuses the part otherwise', () => {
  const into = new Map();
  assert.equal(readListRows([['docs/a.txt', 10, 1700000000000], ['b.txt', 0, 0]], into), true);
  assert.deepEqual(into.get('docs/a.txt'), { key: 'docs/a.txt', path: 'docs/a.txt', size: 10, mtime: 1700000000000 });
  for (const row of [['../up.txt', 1, 1], ['/root.txt', 1, 1], ['a//b', 1, 1], ['C:\\x', 1, 1], [`cafe${acute}`, 1, 1],
    ['ok.txt', -1, 1], ['ok.txt', 1.5, 1], ['ok.txt', '1', 1], ['ok.txt', 1, -1], ['ok.txt', 1, 9e15], ['ok.txt', 1],
    ['ok.txt', 1, 1, 'extra'], 'ok.txt', null]) {
    assert.equal(readListRows([row], new Map()), false, JSON.stringify(row));
  }
  assert.equal(readListRows([['b.txt', 1, 1]], into), false, 'a repeated path');
  assert.equal(readListRows('not a part', new Map()), false);
  const full = new Map([['x.txt', {}]]);
  assert.equal(readListRows([['y.txt', 1, 1]], full, 1), false, 'past the file limit');
  assert.equal(MAX_FILES, 50000);
});

test('keys, fingerprints and actions are each held to their own shape', () => {
  const keys = new Set();
  assert.equal(readKeyRows(['a.txt', 'docs/b.txt'], keys), true);
  assert.equal(readKeyRows(['a.txt'], keys), false, 'repeated key');
  assert.equal(readKeyRows(['../x'], new Set()), false);

  const hashes = new Map();
  assert.equal(readHashRows([['a.txt', 'f'.repeat(64)], ['b.txt', null]], hashes), true);
  assert.equal(hashes.get('b.txt'), null);
  for (const row of [['a.txt', 'F'.repeat(64)], ['a.txt', 'f'.repeat(63)], ['a.txt', 12], ['../a', null], ['a.txt']]) {
    assert.equal(readHashRows([row], new Map()), false, JSON.stringify(row));
  }

  const actions = new Map();
  assert.equal(readActionRows([['a.txt', 'host'], ['b.txt', 'guest']], actions), true);
  assert.equal(actions.get('b.txt'), 'guest');
  for (const row of [['a.txt', 'viewer'], ['a.txt', 'both'], ['../a', 'host'], ['a.txt']]) {
    assert.equal(readActionRows([row], new Map()), false, JSON.stringify(row));
  }
  assert.equal(readActionRows([['a.txt', 'guest']], actions), false, 'one action per path');
});
