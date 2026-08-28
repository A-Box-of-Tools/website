/**
 * tools/merge-pdf/src/{plan,pages,format}.js.
 *
 * The range box is the part of this tool a person types into, and the part
 * where being wrong is expensive: "1-3, 8" that quietly parses as "1" deletes
 * pages somebody meant to keep. So the parser is checked for what it accepts,
 * what it refuses, and - the case that matters most - that it reports the
 * piece it could not read rather than dropping it.
 *
 * The page-size naming is here too, because "A4 portrait" against 595.28 x
 * 841.89 points is arithmetic with a tolerance in it, and a tolerance is
 * exactly the kind of number that gets nudged and never re-checked.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  archiveName, describeRanges, outputNames, parseRanges, splitInto,
} from '../../tools/merge-pdf/src/plan.js';
import {
  normalizeBox, normalizeRotation, sizeLabel, decodeText,
} from '../../tools/merge-pdf/src/pages.js';
import { bytes as sizeText, count, shortName } from '../../tools/merge-pdf/src/format.js';
import { PdfString } from '../../tools/merge-pdf/src/objects.js';

/* ============================================================ parseRanges */

/**
 * A stand-in for `phrase`, so a test can say which sentence was chosen.
 *
 * The real one reads the markup; these modules take whichever they are given.
 * This one writes the key and its blanks, which is what these tests are about -
 * the English is body.html's, in fifteen languages.
 */
const say = (key, values = {}) => {
  const filled = Object.entries(values).map(([k, v]) => `${k}=${v}`).join(' ');
  return filled ? `${key} ${filled}` : key;
};

test('a list of numbers and ranges', () => {
  const { pages, error } = parseRanges('1-3, 8, 12-14', 20, say);
  assert.equal(error, '');
  assert.deepEqual(pages, [1, 2, 3, 8, 12, 13, 14]);
});

test('either end of a range may be missing', () => {
  assert.deepEqual(parseRanges('-3', 10, say).pages, [1, 2, 3]);
  assert.deepEqual(parseRanges('8-', 10, say).pages, [8, 9, 10]);
});

test('a backwards range is read as the range it names', () => {
  assert.deepEqual(parseRanges('7-5', 10, say).pages, [5, 6, 7]);
});

test('overlapping pieces are one set, in order', () => {
  assert.deepEqual(parseRanges('5, 1-3, 2', 10, say).pages, [1, 2, 3, 5]);
});

test('odd, even, all and last', () => {
  assert.deepEqual(parseRanges('odd', 7, say).pages, [1, 3, 5, 7]);
  assert.deepEqual(parseRanges('even', 7, say).pages, [2, 4, 6]);
  assert.deepEqual(parseRanges('all', 3, say).pages, [1, 2, 3]);
  assert.deepEqual(parseRanges('last', 9, say).pages, [9]);
});

test('nothing typed is not an error, and selects nothing', () => {
  const { pages, error } = parseRanges('   ', 10, say);
  assert.deepEqual(pages, []);
  assert.equal(error, '');
});

test('a page past the end is reported rather than clamped', () => {
  const { pages, error } = parseRanges('2, 40', 10, say);
  assert.deepEqual(pages, [2]);
  // The range error names the whole list and how many pages there are;
  // both go into the sentence as blanks rather than being spliced.
  assert.match(error, /^range\.bad\.one /);
  assert.match(error, /total=range\.total\.many n=10/);
});

test('what could not be read is named in the error', () => {
  const { error } = parseRanges('1-3, chapter two', 10, say);
  assert.match(error, /^range\.bad\.one /);
  assert.match(error, /list=chapter two/);
});

/* ========================================================= describeRanges */

test('a set is written back the way a person would write it', () => {
  assert.equal(describeRanges([1, 2, 3, 8, 12, 13, 14], say),
    'range.run from=1 to=3, 8, range.run from=12 to=14');
  assert.equal(describeRanges([4], say), '4');
  assert.equal(describeRanges([], say), 'range.none');
});

test('two in a row are listed rather than hyphenated', () => {
  // "3-4" is more characters than "3, 4" is clearer, and a two-page run reads
  // as a pair rather than a range.
  // A run of two is listed rather than hyphenated, and the phrase that
  // joins the pair is the language's, not this file's.
  assert.equal(describeRanges([3, 4, 9], say), 'range.pair from=3 to=4, 9');
});

/* =============================================================== splitInto */

const pageEntries = (howMany, source = { label: 'a.pdf' }) =>
  Array.from({ length: howMany }, (_, index) => ({ source, index, rotate: 0 }));

test('one document is one part covering every page', () => {
  const parts = splitInto(pageEntries(5), { mode: 'single' });
  assert.equal(parts.length, 1);
  assert.deepEqual([parts[0].from, parts[0].to], [1, 5]);
});

test('every so many pages, with the last part short', () => {
  const parts = splitInto(pageEntries(7), { mode: 'every', size: 3 });
  assert.deepEqual(parts.map((part) => part.entries.length), [3, 3, 1]);
  assert.deepEqual(parts.map((part) => [part.from, part.to]), [[1, 3], [4, 6], [7, 7]]);
});

test('a size of zero does not divide by zero', () => {
  const parts = splitInto(pageEntries(3), { mode: 'every', size: 0 });
  assert.equal(parts.length, 3);
});

test('cutting at named pages, which start the new files', () => {
  const parts = splitInto(pageEntries(9), { mode: 'at', at: [4, 7] });
  assert.deepEqual(parts.map((part) => [part.from, part.to]), [[1, 3], [4, 6], [7, 9]]);
});

test('a cut before page one, or past the end, is ignored', () => {
  const parts = splitInto(pageEntries(4), { mode: 'at', at: [1, 3, 99] });
  assert.deepEqual(parts.map((part) => [part.from, part.to]), [[1, 2], [3, 4]]);
});

test('one file per page', () => {
  const parts = splitInto(pageEntries(3), { mode: 'each' });
  assert.deepEqual(parts.map((part) => part.entries.length), [1, 1, 1]);
});

test('back into the files the pages came from', () => {
  const one = { label: 'one.pdf' };
  const two = { label: 'two.pdf' };
  const entries = [
    { source: one, index: 0 }, { source: two, index: 0 },
    { source: one, index: 1 }, { source: two, index: 1 },
  ];
  const parts = splitInto(entries, { mode: 'file' });
  assert.equal(parts.length, 2);
  // Interleaved pages still come out as two documents, not four: "the files
  // they came from" is the question being answered.
  assert.deepEqual(parts.map((part) => part.entries.length), [2, 2]);
});

test('no pages is no files at all', () => {
  assert.deepEqual(splitInto([], { mode: 'each' }), []);
});

/* ============================================================ outputNames */

test('one document is named after the first file it came from', () => {
  const parts = splitInto(pageEntries(3), { mode: 'single' });
  assert.deepEqual(outputNames(parts, { stem: 'Report.pdf', mode: 'single', suffix: 'merged' }),
    ['Report-merged.pdf']);
});

test('a split says which pages are in each file', () => {
  const parts = splitInto(pageEntries(4), { mode: 'every', size: 2 });
  assert.deepEqual(outputNames(parts, { stem: 'scan.pdf', mode: 'every' }),
    ['scan-pages-1-2.pdf', 'scan-pages-3-4.pdf']);
});

test('a one-page file is called a page, not a range', () => {
  const parts = splitInto(pageEntries(2), { mode: 'each' });
  assert.deepEqual(outputNames(parts, { stem: 'scan.pdf', mode: 'each' }),
    ['scan-page-1.pdf', 'scan-page-2.pdf']);
});

test('two outputs cannot share a name inside one archive', () => {
  const source = { label: 'same.pdf' };
  const parts = [
    { entries: [{ source }], from: 1, to: 1 },
    { entries: [{ source }], from: 2, to: 2 },
  ];
  const names = outputNames(parts, { stem: 'same.pdf', mode: 'file' });
  assert.equal(new Set(names).size, 2);
});

test('a name that would be a bad archive entry is cleaned up', () => {
  const parts = splitInto(pageEntries(1), { mode: 'single' });
  const [name] = outputNames(parts, { stem: 'my:report*.pdf', mode: 'single', suffix: 'edited' });
  assert.ok(!/[\\/:*?"<>|]/.test(name), name);
  assert.match(name, /\.pdf$/);
});

test('the archive is named after the document too', () => {
  assert.equal(archiveName('Book.pdf'), 'Book-split.zip');
  assert.equal(archiveName(''), 'document-split.zip');
});

/* ================================================================== pages */

test('a box written corner-first is put in order', () => {
  assert.deepEqual(normalizeBox([0, 792, 612, 0]), [0, 0, 612, 792]);
});

test('a missing or degenerate box falls back to Letter', () => {
  assert.deepEqual(normalizeBox(null), [0, 0, 612, 792]);
  assert.deepEqual(normalizeBox([10, 10, 10, 10]), [0, 0, 612, 792]);
});

test('rotation is a quarter turn between 0 and 270', () => {
  assert.equal(normalizeRotation(-90), 270);
  assert.equal(normalizeRotation(450), 90);
  assert.equal(normalizeRotation(undefined), 0);
  assert.equal(normalizeRotation(180), 180);
});

test('the named paper sizes, and what to say when there is no name', () => {
  assert.equal(sizeLabel(595.28, 841.89), 'A4 portrait');
  assert.equal(sizeLabel(841.89, 595.28), 'A4 landscape');
  assert.equal(sizeLabel(612, 792), 'Letter portrait');
  assert.equal(sizeLabel(612, 1008), 'Legal portrait');
  // 8.5 x 13 inches is nothing with a name, and was designed in inches.
  assert.equal(sizeLabel(612, 936), '8.5 × 13 in');
});

/* =============================================================== the text */

test('a UTF-16 title comes back as itself', () => {
  const bytes = Uint8Array.from([0xfe, 0xff, 0x00, 0x48, 0x00, 0x69]);
  assert.equal(decodeText(new PdfString(bytes)), 'Hi');
});

test('a plain title comes back as itself too', () => {
  assert.equal(decodeText(new PdfString(Uint8Array.from([0x48, 0x69]))), 'Hi');
  assert.equal(decodeText(null), '');
});

/* ============================================================== the words */

test('sizes and counts', () => {
  assert.equal(sizeText(0, say), 'size.bytes n=0');
  assert.equal(sizeText(2048, say), 'size.kb n=2.0');
  assert.equal(count(1, 'page', say), 'count.page.one n=1');
  assert.equal(count(4, 'page', say), 'count.page.many n=4');
});

test('a long file name keeps its end, where the useful part is', () => {
  const long = 'scan-of-the-lease-agreement-final-v3.pdf';
  const short = shortName(long, 24);
  assert.ok(short.length <= 24, short);
  assert.ok(short.endsWith('-v3.pdf'), short);
});
