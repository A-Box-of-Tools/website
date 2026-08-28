/**
 * tools/trim-video/src/segments.js, and `invertRanges` from ranges.js.
 *
 * The marks are the tool. Everything downstream - which samples get copied,
 * where the edit list points, how long the result runs - is derived from this
 * list of times, so an error here is an error in the output that nothing later
 * can catch.
 *
 * The timestamps file gets the most attention because it is the one part with
 * an outside contract. Marking an hour of footage is careful work; a file
 * written here has to be readable by other tools that use this layout, and a
 * file written by one of those has to load here. A parser that is a shade too
 * strict costs somebody that hour.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  TIMESTAMP_FORMATS, formatClock, openSegment, parseClock, readTimestamps,
  segmentRanges, totalCaptured, writeTimestamps,
} from '../../tools/trim-video/src/segments.js';
import { invertRanges } from '../../tools/trim-video/src/ranges.js';

/* ------------------------------------------------------------- the clock */

test('formatClock always writes hours, minutes, seconds and thousandths', () => {
  assert.equal(formatClock(0), '00:00:00.000');
  assert.equal(formatClock(1.5), '00:00:01.500');
  assert.equal(formatClock(207.687), '00:03:27.687');
  assert.equal(formatClock(3661.5), '01:01:01.500');
  assert.equal(formatClock(36000), '10:00:00.000');
});

test('a fraction that rounds up carries into the seconds', () => {
  // Rounding the fraction on its own writes 3.9996 as "00:00:03.1000" - four
  // digits in a three-digit field, which reads back as 3.1. The marks file is
  // shared with the audio trimmer, so both sides round the instant once,
  // before taking it apart.
  assert.equal(formatClock(3.9996), '00:00:04.000');
  assert.equal(formatClock(59.9999), '00:01:00.000');
  assert.equal(formatClock(3599.9999), '01:00:00.000');
  assert.equal(parseClock(formatClock(59.9999)), 60);
});

test('formatClock never writes a negative time', () => {
  assert.equal(formatClock(-5), '00:00:00.000');
  assert.equal(formatClock(null), '00:00:00.000');
});

test('parseClock reads the format back', () => {
  assert.equal(parseClock('00:03:27.687'), 207.687);
  assert.equal(parseClock('01:01:01.500'), 3661.5);
  assert.equal(parseClock('00:00:00.000'), 0);
});

test('parseClock accepts the shorter spellings a person types', () => {
  assert.equal(parseClock('1:07.5'), 67.5);
  assert.equal(parseClock('123.4'), 123.4);
  assert.equal(parseClock('  90  '), 90);
});

test('parseClock refuses what is not a time', () => {
  for (const bad of ['', '   ', 'abc', '1:2:3:4', '1:aa', '.', '--']) {
    assert.equal(parseClock(bad), null, bad);
  }
  assert.equal(parseClock(null), null);
});

test('the clock round-trips', () => {
  for (const seconds of [0, 0.001, 7.25, 207.687, 3599.999, 3661.5]) {
    assert.equal(parseClock(formatClock(seconds)), seconds);
  }
});

/* ------------------------------------------------------------ the segments */

const closed = (start, end, id = 1) => ({ id, start, end });

test('segmentRanges keeps only the finished ones', () => {
  const segments = [closed(1, 3, 1), { id: 2, start: 5, end: null }, closed(7, 9, 3)];
  assert.deepEqual(segmentRanges(segments), [{ start: 1, end: 3 }, { start: 7, end: 9 }]);
});

test('a segment shorter than a frame is not a segment', () => {
  assert.deepEqual(segmentRanges([closed(1, 1.01)]), []);
  assert.deepEqual(segmentRanges([closed(1, 1)]), []);
});

test('segmentRanges keeps the order it was given, not time order', () => {
  // The table can be reordered, and the finished video follows the table.
  assert.deepEqual(segmentRanges([closed(7, 9, 1), closed(1, 3, 2)]),
    [{ start: 7, end: 9 }, { start: 1, end: 3 }]);
});

test('totalCaptured adds up what will actually be kept', () => {
  assert.equal(totalCaptured([closed(1, 3, 1), { id: 2, start: 5, end: null }]), 2);
  assert.equal(totalCaptured([closed(0, 1.5, 1), closed(10, 12.5, 2)]), 4);
  assert.equal(totalCaptured([]), 0);
});

test('openSegment finds the one still being marked, and only at the end', () => {
  const open = { id: 2, start: 5, end: null };
  assert.equal(openSegment([closed(1, 3, 1), open]), open);
  assert.equal(openSegment([closed(1, 3, 1)]), null);
  assert.equal(openSegment([]), null);
  // An unfinished row that is not last is not the one `o` would close.
  assert.equal(openSegment([{ id: 1, start: 5, end: null }, closed(7, 9, 2)]), null);
});

/* ------------------------------------------------------------- the file */

test('the two format names are the ones the file format uses', () => {
  assert.deepEqual(TIMESTAMP_FORMATS, ['seconds', 'HHMMSSmmm']);
});

test('a seconds file is a header and one line a segment', () => {
  const text = writeTimestamps([closed(207.687, 347.737, 1), closed(630.284, 668.796, 2)],
    { format: 'seconds', name: 'lecture.mp4' });
  assert.equal(text, 'seconds,lecture.mp4\n207.687,347.737\n630.284,668.796\n');
});

test('a clock file writes the same segments the other way', () => {
  const text = writeTimestamps([closed(207.687, 347.737, 1)],
    { format: 'HHMMSSmmm', name: 'lecture.mp4' });
  assert.equal(text, 'HHMMSSmmm,lecture.mp4\n00:03:27.687,00:05:47.737\n');
});

test('a comma in the name would give the header three fields, so it does not', () => {
  const text = writeTimestamps([closed(1, 2, 1)], { format: 'seconds', name: 'a,b,c.mp4' });
  assert.equal(text.split('\n')[0], 'seconds,a b c.mp4');
});

test('unfinished segments are left out of the file', () => {
  const text = writeTimestamps([closed(1, 2, 1), { id: 2, start: 5, end: null }],
    { format: 'seconds', name: 'x' });
  assert.equal(text.trim().split('\n').length, 2);
});

test('a file written here reads back as the same times', () => {
  const segments = [closed(207.687, 347.737, 1), closed(630.284, 668.796, 2)];
  for (const format of TIMESTAMP_FORMATS) {
    const read = readTimestamps(writeTimestamps(segments, { format, name: 'lecture.mp4' }));
    assert.equal(read.format, format);
    assert.equal(read.name, 'lecture.mp4');
    assert.deepEqual(read.segments, segmentRanges(segments));
  }
});

test('a file in the layout other tools write is read as it stands', () => {
  const text = [
    'seconds,fOmz2fPlyfo',
    '207.687,347.737',
    '630.284,668.796',
    '922.463,978.838',
  ].join('\n');

  const read = readTimestamps(text);
  assert.equal(read.format, 'seconds');
  assert.equal(read.name, 'fOmz2fPlyfo');
  assert.equal(read.segments.length, 3);
  assert.deepEqual(read.segments[0], { start: 207.687, end: 347.737 });
  assert.equal(read.skipped, 0);
});

test('the clock layout is read too', () => {
  const read = readTimestamps('HHMMSSmmm,clip\n00:03:27.687,00:05:47.737\n');
  assert.equal(read.segments.length, 1);
  assert.equal(read.segments[0].start, 207.687);
  assert.equal(read.segments[0].end, 347.737);
});

test('a file with no header at all is still a list of times', () => {
  const read = readTimestamps('1.5,3\n10,12\n');
  assert.equal(read.segments.length, 2);
  assert.deepEqual(read.segments[0], { start: 1.5, end: 3 });
});

test('blank lines and trailing newlines are not segments', () => {
  const read = readTimestamps('seconds,x\n1,2\n\n\n3,4\n\n');
  assert.equal(read.segments.length, 2);
  assert.equal(read.skipped, 0);
});

test('lines that are not a pair of times are counted, not fatal', () => {
  const read = readTimestamps('seconds,x\n1,2\nrubbish\n5,notatime\n9,7\n3,4\n');
  assert.equal(read.segments.length, 2);
  // "rubbish" has no comma, "5,notatime" does not parse, "9,7" ends before it
  // starts. Three lines skipped, and the two good ones still load.
  assert.equal(read.skipped, 3);
});

test('a file with nothing usable in it is an error, not an empty list', () => {
  const unreadable = /^Error: marks\.unreadable$/;
  assert.throws(() => readTimestamps('seconds,x\n'), unreadable);
  assert.throws(() => readTimestamps(''), unreadable);
  assert.throws(() => readTimestamps('this is not a timestamps file'), unreadable);
});

test('carriage returns from a file written on Windows do not break it', () => {
  const read = readTimestamps('seconds,x\r\n1,2\r\n3,4\r\n');
  assert.equal(read.segments.length, 2);
});

/* ------------------------------------------------------------ invertRanges */

test('inverting marks leaves the gaps between them', () => {
  assert.deepEqual(invertRanges([{ start: 2, end: 4 }, { start: 6, end: 8 }], 10),
    [{ start: 0, end: 2 }, { start: 4, end: 6 }, { start: 8, end: 10 }]);
});

test('a mark on the front leaves no gap in front of it', () => {
  assert.deepEqual(invertRanges([{ start: 0, end: 4 }], 10), [{ start: 4, end: 10 }]);
});

test('a mark on the end leaves no gap after it', () => {
  assert.deepEqual(invertRanges([{ start: 6, end: 10 }], 10), [{ start: 0, end: 6 }]);
});

test('marking everything leaves nothing', () => {
  assert.deepEqual(invertRanges([{ start: 0, end: 10 }], 10), []);
});

test('marking nothing leaves the whole thing', () => {
  assert.deepEqual(invertRanges([], 10), [{ start: 0, end: 10 }]);
});

test('marks given out of order still invert correctly', () => {
  assert.deepEqual(invertRanges([{ start: 6, end: 8 }, { start: 2, end: 4 }], 10),
    [{ start: 0, end: 2 }, { start: 4, end: 6 }, { start: 8, end: 10 }]);
});

test('overlapping marks collapse into one gap rather than a negative one', () => {
  assert.deepEqual(invertRanges([{ start: 2, end: 6 }, { start: 4, end: 8 }], 10),
    [{ start: 0, end: 2 }, { start: 8, end: 10 }]);
});

test('a mark swallowed by another one changes nothing', () => {
  assert.deepEqual(invertRanges([{ start: 2, end: 8 }, { start: 4, end: 5 }], 10),
    [{ start: 0, end: 2 }, { start: 8, end: 10 }]);
});

test('a gap too short to be a section is not one', () => {
  assert.deepEqual(invertRanges([{ start: 0, end: 5 }, { start: 5.01, end: 10 }], 10), []);
});
