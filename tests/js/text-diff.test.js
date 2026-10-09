/**
 * tools/text-diff/src/diff.js - Myers, and what the page draws from it.
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
  compareText, diffSequences, diffWords, alignRows, changeBlocks, formatUnified, splitLines, splitWords,
} from '../../tools/text-diff/src/diff.js';

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
  assert.deepEqual(splitLines(''), { lines: [], trailing: false });
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
  const patch = formatUnified(a, b, { context: 2, aLabel: 'left.txt', bLabel: 'right.txt' });

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
  assert.equal(formatUnified('a\nb\n', 'a\nb\n'), '');
  assert.equal(formatUnified('a', 'a'), '');
  assert.equal(formatUnified('', ''), '');
});

test('diffSequences works on anything comparable, not only lines', () => {
  const ops = diffSequences([1, 2, 3], [1, 3]);
  assert.deepEqual(ops, [
    { type: 'equal', aStart: 0, bStart: 0, count: 1 },
    { type: 'delete', aStart: 1, bStart: 1, count: 1 },
    { type: 'equal', aStart: 2, bStart: 1, count: 1 },
  ]);
});

/**
 * Read the public patch format and apply it against the original text.
 *
 * Verifying context, line counts and the reconstructed text catches a patch
 * that looks plausible but cannot be applied, including one whose omitted
 * blank lines have shifted its hunk headers.
 */
function applyUnified(before, patch) {
  if (!patch) return before;
  const source = before.split('\n');
  const terminated = source.pop();
  for (let i = 0; i < source.length; i += 1) source[i] += '\n';
  if (terminated) source.push(terminated);
  const lines = patch.split('\n');
  assert.equal(lines.pop(), '', 'the patch itself ends with a newline');
  assert.ok(lines.shift().startsWith('--- '));
  assert.ok(lines.shift().startsWith('+++ '));
  const out = [];
  let sourceAt = 0;
  let index = 0;
  while (index < lines.length) {
    const header = /^@@ -(\d+),(\d+) \+(\d+),(\d+) @@$/.exec(lines[index++]);
    assert.ok(header, 'each hunk starts with a valid range');
    const [, aStart, aCount, bStart, bCount] = header.map(Number);
    const start = aCount === 0 ? aStart : aStart - 1;
    assert.ok(start >= sourceAt, 'hunks do not overlap');
    out.push(...source.slice(sourceAt, start));
    sourceAt = start;
    assert.equal(out.length, bCount === 0 ? bStart : bStart - 1);
    let read = 0;
    let written = 0;
    while (index < lines.length && !lines[index].startsWith('@@ ')) {
      const line = lines[index++];
      const sign = line[0];
      assert.ok([' ', '-', '+'].includes(sign));
      const missing = lines[index] === '\\ No newline at end of file';
      if (missing) index += 1;
      const value = line.slice(1) + (missing ? '' : '\n');
      if (sign !== '+') {
        assert.equal(source[sourceAt++], value, 'context and deletions match the file exactly');
        read += 1;
      }
      if (sign !== '-') {
        out.push(value);
        written += 1;
      }
    }
    assert.equal(read, aCount);
    assert.equal(written, bCount);
  }
  out.push(...source.slice(sourceAt));
  return out.join('');
}

test('a patch carries an added or removed final newline as an edit', () => {
  for (const [a, b] of [['a', 'a\n'], ['a\n', 'a']]) {
    const patch = formatUnified(a, b);
    assert.notEqual(patch, '');
    assert.equal(applyUnified(a, patch), b);
    assert.equal(patch.split('\\ No newline at end of file').length - 1, 1);
  }
});

test('missing final newlines are marked on changed and context lines', () => {
  for (const [a, b] of [
    ['before', 'after'],
    ['before\ntail', 'after\ntail'],
    ['first\nlast', 'first\nlast\nextra'],
  ]) {
    assert.equal(applyUnified(a, formatUnified(a, b)), b);
  }
});

test('patches preserve CRLF, mixed line endings and literal carriage returns', () => {
  for (const [a, b] of [
    ['one\r\ntwo\r\n', 'one\r\nTWO\r\n'],
    ['one\r\ntwo\r\n', 'one\ntwo\n'],
    ['one\r\ntwo\nlast', 'one\nTWO\r\nlast\n'],
    ['one\rtwo\r', 'one\rTWO\r'],
  ]) {
    assert.equal(applyUnified(a, formatUnified(a, b)), b);
  }
});

test('empty files and insertions with no context use empty hunk ranges', () => {
  for (const [a, b] of [
    ['', 'one\n'], ['one\n', ''], ['', '\n'], ['\n', ''],
    ['', 'one'], ['one', ''],
    ['one\n', 'before\none\nafter\n'],
    ['before\none\nafter\n', 'one\n'],
  ]) {
    assert.equal(applyUnified(a, formatUnified(a, b, { context: 0 })), b);
  }
  assert.match(formatUnified('', 'one\n'), /@@ -0,0 \+1,1 @@/);
  assert.match(formatUnified('one\n', ''), /@@ -1,1 \+0,0 @@/);
});

test('ignore settings filter the view but cannot remove changes from the patch', () => {
  const a = 'Title\n\n  first  line\n\nlast\n';
  const b = 'title\nfirst line\nlast\n';
  const options = { ignoreCase: true, ignoreWhitespace: true, ignoreBlankLines: true };
  const { stats } = compareText(a, b, options);
  assert.equal(stats.added + stats.removed, 0, 'the requested view hides these edits');
  assert.equal(applyUnified(a, formatUnified(a, b, options)), b);
});

test('a patch keeps ignored blank lines in context around visible changes', () => {
  const a = 'one\n\ntwo\nthree\nfour\nfive\nsix\nseven\neight\n';
  const b = 'ONE\n\ntwo\nthree\nfour\nfive\nsix\nseven\nEIGHT\n';
  const patch = formatUnified(a, b, { context: 1, ignoreBlankLines: true });
  assert.equal(patch.match(/^@@/gm).length, 2, 'distant changes are separate hunks');
  assert.equal(applyUnified(a, patch), b);
});


test('ending styles are disclosed without changing normalized content matching', () => {
  for (const [a, b, endings] of [
    ['same\r\n', 'same\n', ['\r\n', '\n']],
    ['same\r', 'same\n', ['\r', '\n']],
    ['same', 'same\n', ['', '\n']],
  ]) {
    const { ops, stats } = compareText(a, b);
    assert.equal(stats.added + stats.removed, 0);
    assert.equal(stats.identical, false);
    assert.equal(stats.endingChanges, 1);
    assert.equal(stats.similarity, 1);
    assert.deepEqual([ops[0].aEnding, ops[0].bEnding], endings);
    assert.deepEqual(alignRows(ops).map(row => row.type), ['ending']);
    assert.equal(applyUnified(a, formatUnified(a, b)), b);
  }
});

test('mixed line endings retain only their actual matched-row differences', () => {
  const a = 'one\r\ntwo\nthree\rlast';
  const b = 'one\ntwo\nthree\r\nlast';
  const { ops, stats } = compareText(a, b);
  assert.equal(stats.endingChanges, 2);
  assert.equal(stats.trailingDiffers, false);
  assert.deepEqual(alignRows(ops).map(row => row.type), ['ending', 'equal', 'ending', 'equal']);
  assert.deepEqual(ops.map(op => [op.a, op.b]), [[0, 0], [1, 1], [2, 2], [3, 3]]);
  assert.equal(applyUnified(a, formatUnified(a, b)), b);
  assert.deepEqual(splitLines(a), { lines: ['one', 'two', 'three', 'last'], trailing: false });
});

test('final terminator absence remains distinct from a different ending style', () => {
  for (const [a, b, trailing, matched] of [
    ['one', 'one\r\n', true, 1],
    ['one\r\n', 'one\n', false, 1],
    ['', '\n', true, 0],
    ['\r\n', '\n', false, 1],
    ['', '', false, 0],
    ['one\r\n', 'one\r\n', false, 0],
  ]) {
    const { stats } = compareText(a, b);
    assert.equal(stats.trailingDiffers, trailing, JSON.stringify([a, b]));
    assert.equal(stats.endingChanges, matched);
    assert.equal(stats.identical, a === b);
    assert.equal(applyUnified(a, formatUnified(a, b)), b);
  }
});

test('every ignore combination retains matched ending differences including blank lines', () => {
  const a = 'Title\r\n \r\n  value  \r\n';
  const b = 'title\n \nvalue\n';
  for (const ignoreWhitespace of [false, true]) for (const ignoreCase of [false, true]) {
    for (const ignoreBlankLines of [false, true]) {
      const options = { ignoreWhitespace, ignoreCase, ignoreBlankLines };
      const { ops, stats } = compareText(a, b, options);
      const expected = 1 + Number(ignoreWhitespace) + Number(ignoreCase);
      assert.equal(stats.endingChanges, expected, JSON.stringify(options));
      const endings = alignRows(ops).filter(row => row.type === 'ending');
      assert.equal(endings.length, expected);
      assert.ok(endings.some(row => row.a.a === 1 && row.b.b === 1), 'blank content cannot hide its terminator');
      assert.equal(applyUnified(a, formatUnified(a, b, options)), b);
    }
  }
  const { stats } = compareText('\r\n', '\n', { ignoreBlankLines: true });
  assert.equal(stats.endingChanges, 1);
  assert.equal(stats.added + stats.removed, 0);
});

test('ignored blank ending pairs keep original numbering between nonblank anchors', () => {
  const a = 'head\nold\n\r\nold tail\nfoot\n';
  const b = 'head\nnew\n\nnew tail\nextra\nfoot\n';
  const { ops, stats } = compareText(a, b, { ignoreBlankLines: true });
  assert.equal(stats.endingChanges, 1);
  assert.equal(stats.added, 3);
  assert.equal(stats.removed, 2);
  const blank = alignRows(ops).find(row => row.type === 'ending');
  assert.deepEqual([blank.a.a, blank.b.b], [2, 2]);
  for (const key of ['a', 'b']) {
    const positions = ops.map(op => op[key]).filter(value => value !== null);
    assert.ok(positions.every((value, i) => i === 0 || value > positions[i - 1]), key + ' stays in source order');
  }
  assert.equal(applyUnified(a, formatUnified(a, b)), b);
});

test('ending rows retain each actual side when content matches under ignore rules', () => {
  const { ops, stats } = compareText('Title\r\n', 'title\n', { ignoreCase: true });
  const [row] = alignRows(ops);
  assert.equal(row.type, 'ending');
  assert.equal(row.a.text, 'Title');
  assert.equal(row.b.text, 'title');
  assert.equal(stats.added + stats.removed, 0);
});

test('changed line content retains its two endings for a visible paired-row label', () => {
  const a = 'one\r\ntwo\n', b = 'ONE\ntwo\n';
  const [row] = alignRows(compareText(a, b).ops);
  assert.equal(row.type, 'change');
  assert.deepEqual([row.a.ending, row.b.ending], ['\r\n', '\n']);
  assert.equal(applyUnified(a, formatUnified(a, b)), b);
});

test('navigation groups adjacent edits and ending edits into contiguous destinations', () => {
  const rows = ['equal', 'change', 'insert', 'ending', 'equal', 'delete', 'equal', 'ending'].map(type => ({ type }));
  assert.deepEqual(changeBlocks(rows), [{ start: 1, end: 4 }, { start: 5, end: 6 }, { start: 7, end: 8 }]);
  assert.deepEqual(changeBlocks([]), []);
  assert.deepEqual(changeBlocks([{ type: 'equal' }]), []);
  const allChanged = alignRows(compareText('old\nold2\n', 'new\nnew2\n').ops);
  assert.equal(changeBlocks(allChanged).length, 1, 'paired replacement rows belong to one change');
});

test('a rendered prefix contains only reachable change blocks even when it cuts a block', () => {
  const rows = Array.from({ length: 4010 }, (_, i) => ({ type: i < 2 || i >= 4005 ? 'change' : 'equal' }));
  assert.equal(changeBlocks(rows).length, 2);
  assert.deepEqual(changeBlocks(rows.slice(0, 4000)), [{ start: 0, end: 2 }]);
  const late = Array.from({ length: 4010 }, (_, i) => ({ type: i >= 4005 ? 'change' : 'equal' }));
  assert.equal(changeBlocks(late).length, 1);
  assert.equal(changeBlocks(late.slice(0, 4000)).length, 0, 'an undrawn first change has no destination');
  const continuous = Array.from({ length: 4010 }, () => ({ type: 'ending' }));
  assert.deepEqual(changeBlocks(continuous.slice(0, 4000)), [{ start: 0, end: 4000 }]);
});
