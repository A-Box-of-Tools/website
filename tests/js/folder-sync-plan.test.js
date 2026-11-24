import test from 'node:test';
import assert from 'node:assert/strict';
import { permissions, needsCheck, caseClashes, comparePlan, chosen, summarize, planActions, acceptActions } from '../../tools/folder-sync/src/plan.js';

const files = (rows) => new Map(rows.map(([key, size, mtime]) => [key, { key, path: key, size, mtime }]));
const byKey = (plan) => Object.fromEntries(plan.rows.map((row) => [row.key, row]));

test('each side may only move what both modes allow', () => {
  assert.deepEqual(permissions('both', 'both'), { send: true, receive: true });
  assert.deepEqual(permissions('send', 'both'), { send: true, receive: false });
  assert.deepEqual(permissions('receive', 'both'), { send: false, receive: true });
  assert.deepEqual(permissions('both', 'send'), { send: false, receive: true });
  assert.deepEqual(permissions('both', 'receive'), { send: true, receive: false });
  assert.deepEqual(permissions('send', 'send'), { send: false, receive: false });
});

test('two listings become kinds, with the newer copy winning and ties left alone', () => {
  const local = files([['a.txt', 1, 10], ['c.txt', 5, 10], ['d.txt', 7, 30], ['e.txt', 5, 10], ['f.txt', 5, 10], ['g.txt', 5, 10]]);
  const remote = files([['b.txt', 2, 10], ['c.txt', 6, 20], ['d.txt', 5, 20], ['e.txt', 5, 10], ['f.txt', 5, 20], ['g.txt', 6, 10]]);
  const plan = comparePlan({ local, remote, localMode: 'both', remoteMode: 'both' });
  const rows = byKey(plan);
  assert.equal(rows['a.txt'].kind, 'only-here');
  assert.equal(rows['a.txt'].action, 'send');
  assert.deepEqual(rows['a.txt'].allowed, ['send', 'skip']);
  assert.equal(rows['b.txt'].kind, 'only-there');
  assert.equal(rows['b.txt'].action, 'receive');
  assert.deepEqual(rows['b.txt'].allowed, ['receive', 'skip']);
  assert.equal(rows['c.txt'].kind, 'newer-there');
  assert.equal(rows['c.txt'].action, 'receive');
  assert.equal(rows['d.txt'].kind, 'newer-here');
  assert.equal(rows['d.txt'].action, 'send');
  assert.deepEqual(rows['d.txt'].allowed, ['send', 'receive', 'skip']);
  assert.equal(rows['g.txt'].kind, 'conflict', 'different bytes under one date');
  assert.equal(rows['g.txt'].action, 'skip');
  assert.equal(rows['e.txt'], undefined, 'equal size and date');
  assert.equal(plan.identical, 1);
  // Same size, different date: only the bytes can say, so it waits for fingerprints.
  assert.deepEqual(plan.pending, ['f.txt']);
  assert.deepEqual(needsCheck(local, remote), ['f.txt']);
  assert.deepEqual(plan.rows.map((row) => row.key), ['a.txt', 'b.txt', 'c.txt', 'd.txt', 'g.txt']);
});

test('fingerprints settle files that share a size, and remembered pairs need none', () => {
  const local = files([['same.txt', 4, 10], ['edited.txt', 4, 30], ['unread.txt', 4, 10]]);
  const remote = files([['same.txt', 4, 20], ['edited.txt', 4, 20], ['unread.txt', 4, 20]]);
  const hashes = new Map([
    ['same.txt', { local: 'a'.repeat(64), remote: 'a'.repeat(64) }],
    ['edited.txt', { local: 'a'.repeat(64), remote: 'b'.repeat(64) }],
    ['unread.txt', { local: null, remote: null }],
  ]);
  const plan = comparePlan({ local, remote, localMode: 'both', remoteMode: 'both', hashes });
  assert.deepEqual(plan.pending, []);
  assert.equal(plan.identical, 1);
  assert.equal(byKey(plan)['edited.txt'].kind, 'newer-here');
  // A file neither side could read is not called equal on the strength of two nulls.
  assert.equal(byKey(plan)['unread.txt'].kind, 'newer-there');

  const same = (key) => key === 'same.txt';
  assert.deepEqual(needsCheck(local, remote, same), ['edited.txt', 'unread.txt']);
  const remembered = comparePlan({ local, remote, localMode: 'both', remoteMode: 'both', same });
  assert.equal(remembered.identical, 1);
  assert.deepEqual(remembered.pending, ['edited.txt', 'unread.txt']);
});

test('modes narrow the choices and the defaults on both sides', () => {
  const local = files([['mine.txt', 1, 10], ['both.txt', 2, 30]]);
  const remote = files([['theirs.txt', 1, 10], ['both.txt', 3, 20]]);
  const sendOnly = byKey(comparePlan({ local, remote, localMode: 'send', remoteMode: 'both' }));
  assert.deepEqual(sendOnly['theirs.txt'].allowed, ['skip']);
  assert.equal(sendOnly['theirs.txt'].action, 'skip');
  assert.deepEqual(sendOnly['both.txt'].allowed, ['send', 'skip']);
  const peerSendsOnly = byKey(comparePlan({ local, remote, localMode: 'both', remoteMode: 'send' }));
  assert.deepEqual(peerSendsOnly['mine.txt'].allowed, ['skip']);
  assert.deepEqual(peerSendsOnly['both.txt'].allowed, ['receive', 'skip']);
  assert.equal(peerSendsOnly['both.txt'].action, 'skip', 'the newer copy here cannot go there');
});

test('names that differ only in case are never copied over each other', () => {
  const local = files([['README.md', 1, 10], ['docs/A.txt', 1, 10]]);
  const remote = files([['Readme.md', 1, 10], ['notes.txt', 1, 10], ['NOTES.txt', 2, 10]]);
  const clash = caseClashes(local, remote);
  assert.deepEqual([...clash].sort(), ['NOTES.txt', 'README.md', 'Readme.md', 'notes.txt']);
  const rows = byKey(comparePlan({ local, remote, localMode: 'both', remoteMode: 'both' }));
  for (const key of ['README.md', 'Readme.md', 'notes.txt', 'NOTES.txt']) {
    assert.equal(rows[key].kind, 'case', key);
    assert.deepEqual(rows[key].allowed, ['skip'], key);
  }
  assert.equal(rows['docs/A.txt'].kind, 'only-here');
});

test('choices change the totals and the actions, and an impossible choice is ignored', () => {
  const local = files([['a.txt', 10, 30], ['b.txt', 20, 10]]);
  const remote = files([['a.txt', 11, 20], ['c.txt', 40, 10]]);
  const plan = comparePlan({ local, remote, localMode: 'both', remoteMode: 'both' });
  assert.deepEqual(summarize(plan), { send: 2, sendBytes: 30, receive: 1, receiveBytes: 40, skip: 0, identical: 0 });
  const overrides = new Map([['a.txt', 'receive'], ['c.txt', 'skip'], ['b.txt', 'receive']]);
  assert.equal(chosen(byKey(plan)['b.txt'], overrides), 'send', 'b.txt is not there to receive');
  assert.deepEqual(summarize(plan, overrides), { send: 1, sendBytes: 20, receive: 1, receiveBytes: 11, skip: 1, identical: 0 });
  assert.deepEqual(planActions(plan, overrides, 'host'), [['a.txt', 'host'], ['b.txt', 'guest']]);
  assert.deepEqual(planActions(plan, overrides, 'guest'), [['a.txt', 'guest'], ['b.txt', 'host']]);
});

test('the side asked to sync checks every action against its own listing and mode', () => {
  const local = files([['mine.txt', 1, 10], ['README.md', 1, 10]]);
  const remote = files([['theirs.txt', 2, 10], ['Readme.md', 1, 10]]);
  const ask = (rows, localMode = 'both', remoteMode = 'both') =>
    acceptActions({ actions: new Map(rows), local, remote, role: 'guest', localMode, remoteMode });
  const accepted = ask([['theirs.txt', 'guest'], ['mine.txt', 'host']]);
  assert.deepEqual(accepted.receive.map((entry) => entry.key), ['theirs.txt']);
  assert.deepEqual([...accepted.send], ['mine.txt']);
  // A device set to Send only refuses any write, whatever the other side planned.
  assert.equal(ask([['theirs.txt', 'guest']], 'send'), null);
  assert.equal(ask([['mine.txt', 'host']], 'receive'), null);
  assert.equal(ask([['mine.txt', 'host']], 'both', 'send'), null);
  assert.equal(ask([['missing.txt', 'guest']]), null, 'not in the other listing');
  assert.equal(ask([['missing.txt', 'host']]), null, 'not in this listing');
  assert.equal(ask([['Readme.md', 'guest']]), null, 'a case clash');
  assert.deepEqual(ask([]), { receive: [], send: new Set() });
});
