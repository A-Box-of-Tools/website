/**
 * tools/compare-text/src/diff.js - Myers, and what the page draws from it.
 *
 * Two things are being checked. The first is that the diff is *correct*:
 * applying the deletions and insertions to the left-hand text produces the
 * right-hand one, which is asserted directly rather than eyeballed. The second
 * is that it is *minimal*, because a correct diff that marks the whole file as
 * changed is useless, and every property that makes a diff readable comes from
 * that one.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  compareText, diffSequences, diffWords, alignRows, formatUnified, splitLines, splitWords,
} from '../../tools/compare-text/src/diff.js';

/** Rebuild both sides from the ops, which is what "correct" means here. */
function rebuild(ops) {
  const left = ops.filter((op) => op.type !== 'insert').map((op) => op.text);
  const right = ops.filter((op) => op.type !== 'delete').map((op) => op.text);
  return { left, right };
}

function check(a, b, options) {
  const { ops, stats } = compareText(a, b, options);
  const { left, right } = rebuild(ops);
  assert.deepEqual(left, splitLines(a).lines, 'the deletions rebuild the left-hand text');
  assert.deepEqual(right, splitLines(b).lines, 'the insertions rebuild the right-hand text');
  return { ops, stats };
}

test('lines are split the way a diff means them', () => {
  assert.deepEqual(splitLines('a\nb\n'), { lines: ['a', 'b'], trailing: true });
  assert.deepEqual(splitLines('a\nb'), { lines: ['a', 'b'], trailing: false });
  assert.deepEqual(splitLines('a\r\nb\r\n'), { lines: ['a', 'b'], trailing: true });
  assert.deepEqual(splitLines(''), { lines: [''], trailing: false });
});

test('the same text has no difference at all', () => {
  const { ops, stats } = check('one\ntwo\nthree\n', 'one\ntwo\nthree\n');
  assert.ok(ops.every((op) => op.type === 'equal'));
  assert.equal(stats.added, 0);
  assert.equal(stats.removed, 0);
  assert.equal(stats.identical, true);
  assert.equal(stats.similarity, 1);
});

test('one changed line is one deletion and one insertion', () => {
  const { ops, stats } = check('one\ntwo\nthree\n', 'one\nTWO\nthree\n');
  assert.equal(stats.added, 1);
  assert.equal(stats.removed, 1);
  assert.deepEqual(ops.map((op) => op.type), ['equal', 'delete', 'insert', 'equal']);
});

test('an inserted line does not drag the rest of the file with it', () => {
  // This is the property that Myers buys and a naive line-by-line comparison
  // does not: everything after the insertion is still recognised as unchanged.
  const a = 'one\ntwo\nthree\nfour\n';
  const b = 'one\ntwo\ninserted\nthree\nfour\n';
  const { ops, stats } = check(a, b);
  assert.equal(stats.added, 1);
  assert.equal(stats.removed, 0);
  assert.equal(ops.filter((op) => op.type === 'equal').length, 4);
});

test('line numbers on both sides survive the change', () => {
  const { ops } = check('a\nb\nc\n', 'a\nx\nb\nc\n');
  const inserted = ops.find((op) => op.type === 'insert');
  assert.equal(inserted.b, 1);
  assert.equal(inserted.a, null);
  const last = ops[ops.length - 1];
  assert.equal(last.a, 2);
  assert.equal(last.b, 3);
});

test('everything different is a rewrite, and is still correct', () => {
  const { ops, stats } = check('a\nb\nc\n', 'x\ny\nz\n');
  assert.equal(stats.added, 3);
  assert.equal(stats.removed, 3);
  assert.equal(stats.similarity, 0);
  assert.equal(ops.filter((op) => op.type === 'equal').length, 0);
});

test('an empty side is all insertions or all deletions', () => {
  assert.equal(check('', 'a\nb\n').stats.added, 2);
  assert.equal(check('a\nb\n', '').stats.removed, 2);
});

test('what the three "ignore" switches do', () => {
  assert.equal(compareText('a  b\n', 'a b\n').stats.added, 1);
  assert.equal(compareText('a  b\n', 'a b\n', { ignoreWhitespace: true }).stats.added, 0);

  assert.equal(compareText('Hello\n', 'hello\n').stats.added, 1);
  assert.equal(compareText('Hello\n', 'hello\n', { ignoreCase: true }).stats.added, 0);

  assert.equal(compareText('a\n\nb\n', 'a\nb\n').stats.removed, 1);
  assert.equal(compareText('a\n\nb\n', 'a\nb\n', { ignoreBlankLines: true }).stats.removed, 0);
});

test('ignoring blank lines does not renumber the lines that are left', () => {
  const { ops } = compareText('a\n\n\nb\n', 'a\nb\n', { ignoreBlankLines: true });
  const last = ops[ops.length - 1];
  assert.equal(last.a, 3, 'b is still the fourth line of the left-hand text');
  assert.equal(last.b, 1);
});

test('a big file with one change stays cheap', () => {
  const lines = Array.from({ length: 20000 }, (_, i) => `line ${i}`);
  const a = `${lines.join('\n')}\n`;
  const changed = [...lines];
  changed[12000] = 'line twelve thousand, changed';
  const started = Date.now();
  const { stats } = check(a, `${changed.join('\n')}\n`);
  assert.equal(stats.added, 1);
  assert.equal(stats.removed, 1);
  // The prefix and suffix are trimmed before the walk, so this is a diff of
  // two one-line files however big the files around it are.
  assert.ok(Date.now() - started < 2000, 'took too long for a one-line change');
});

test('two files with nothing in common give up rather than hang', () => {
  const a = Array.from({ length: 4000 }, (_, i) => `left ${i}`).join('\n');
  const b = Array.from({ length: 4000 }, (_, i) => `right ${i}`).join('\n');
  const started = Date.now();
  const { stats } = check(a, b);
  assert.equal(stats.added, 4000);
  assert.equal(stats.removed, 4000);
  assert.ok(Date.now() - started < 10000, 'the ceiling did not hold');
});

test('rows pair a deletion with the insertion that replaced it', () => {
  const { ops } = compareText('one\ntwo\n', 'one\nTWO\n');
  const rows = alignRows(ops);
  assert.deepEqual(rows.map((row) => row.type), ['equal', 'change']);
  assert.equal(rows[1].a.text, 'two');
  assert.equal(rows[1].b.text, 'TWO');
});

test('rows keep a lopsided change lopsided', () => {
  const { ops } = compareText('a\nb\nc\n', 'a\nX\nY\nZ\nc\n');
  const rows = alignRows(ops);
  assert.deepEqual(rows.map((row) => row.type), ['equal', 'change', 'insert', 'insert', 'equal']);
});

test('words: only the part that changed is marked', () => {
  const { a, b } = diffWords('the quick brown fox', 'the quick red fox');
  assert.deepEqual(a.filter((part) => !part.same).map((part) => part.text), ['brown']);
  assert.deepEqual(b.filter((part) => !part.same).map((part) => part.text), ['red']);
  // Both sides still say what they said.
  assert.equal(a.map((part) => part.text).join(''), 'the quick brown fox');
  assert.equal(b.map((part) => part.text).join(''), 'the quick red fox');
});

test('words: punctuation is its own token, so one argument can change alone', () => {
  assert.deepEqual(splitWords('call(a, b)'), ['call', '(', 'a', ',', ' ', 'b', ')']);
  const { b } = diffWords('call(a, b)', 'call(a, c)');
  assert.deepEqual(b.filter((part) => !part.same).map((part) => part.text), ['c']);
});

test('a unified diff says where the hunk is and what is in it', () => {
  const a = `${Array.from({ length: 10 }, (_, i) => `line ${i + 1}`).join('\n')}\n`;
  const b = a.replace('line 5', 'line five');
  const { ops } = compareText(a, b);
  const patch = formatUnified(ops, { context: 2, aLabel: 'left.txt', bLabel: 'right.txt' });

  assert.equal(patch, [
    '--- left.txt',
    '+++ right.txt',
    '@@ -3,5 +3,5 @@',
    ' line 3',
    ' line 4',
    '-line 5',
    '+line five',
    ' line 6',
    ' line 7',
    '',
  ].join('\n'));
});

test('a unified diff of two identical files is empty', () => {
  const { ops } = compareText('a\nb\n', 'a\nb\n');
  assert.equal(formatUnified(ops), '');
});

test('diffSequences works on anything comparable, not only lines', () => {
  const ops = diffSequences([1, 2, 3], [1, 3]);
  assert.deepEqual(ops, [
    { type: 'equal', aStart: 0, bStart: 0, count: 1 },
    { type: 'delete', aStart: 1, bStart: 1, count: 1 },
    { type: 'equal', aStart: 2, bStart: 1, count: 1 },
  ]);
});
