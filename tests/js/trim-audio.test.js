/**
 * tools/trim-audio/src/{trim,segments,waveform}.js.
 *
 * `trim.js` is where marks in seconds become runs of samples, once, so that the
 * summary on the page and the cut itself cannot disagree about where a part
 * begins. Two things there are worth pinning down:
 *
 *   - The arithmetic is exact. Unlike the video cutter there is no keyframe to
 *     round back to, so a mark at 1.5s in a 48 kHz file is sample 72000 and
 *     nothing else. If that ever stops being true the tool's central claim
 *     stops being true with it.
 *   - The fades go on joins and only on joins. An edge at the very start or end
 *     of the recording had nothing removed beside it, so fading it would be an
 *     edit nobody asked for - and it is the rule that lets `isUntouched` mean
 *     what the page says it means.
 *
 * `segments.js` gets the rest of the attention because it is the one part with
 * an outside contract: a marks file written here has to be readable by the
 * video cutter, and one written there has to load here.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  cutChannels, invertRanges, isUntouched, planSections, sectionFrames,
  totalSeconds, trim,
} from '../../tools/trim-audio/src/trim.js';
import {
  TIMESTAMP_FORMATS, formatClock, formatDuration, openSegment, parseClock,
  readTimestamps, segmentRanges, totalCaptured, writeTimestamps,
} from '../../tools/trim-audio/src/segments.js';
import { formatTime, parseTime } from '../../tools/trim-audio/src/timeline.js';
import { summarise } from '../../tools/trim-audio/src/waveform.js';

/**
 * The stand-in for phrase(). What the tool says lives in body.html now, in
 * fifteen languages; a test can hold it to the key it asked for and the
 * numbers it put in the blanks.
 */
const say = (key, values = {}) => [key, ...Object.values(values)].join(' ');

/* ------------------------------------------------------------- fixtures */

/** A ramp, so every sample is identifiable by its value alone: sample n is n. */
const ramp = (frames) => Float32Array.from({ length: frames }, (_, i) => i);

/** Two channels of it, the second negated, so a channel mix-up is visible. */
const stereoRamp = (frames) => [ramp(frames), ramp(frames).map((v) => -v)];

/* ---------------------------------------------------- seconds to samples */

test('a mark becomes the sample it names, with no rounding to anything else', () => {
  const [section] = planSections([{ start: 1.5, end: 2.5 }], {
    sampleRate: 48000, totalFrames: 480000,
  });
  assert.equal(section.from, 72000);
  assert.equal(section.to, 120000);
  assert.equal(section.frames, 48000);
});

test('a mark between two samples goes to the nearest one', () => {
  // 0.0000104166s is half a sample at 48 kHz; a hair over it rounds up.
  const [up] = planSections([{ start: 0.0000105, end: 1 }], {
    sampleRate: 48000, totalFrames: 48000,
  });
  const [down] = planSections([{ start: 0.0000103, end: 1 }], {
    sampleRate: 48000, totalFrames: 48000,
  });
  assert.equal(up.from, 1);
  assert.equal(down.from, 0);
});

test('marks past either end of the recording are clamped, not refused', () => {
  const [section] = planSections([{ start: -5, end: 999 }], {
    sampleRate: 8000, totalFrames: 8000,
  });
  assert.equal(section.from, 0);
  assert.equal(section.to, 8000);
});

test('a mark that rounds to nothing is dropped rather than left as an empty part', () => {
  const sections = planSections(
    [{ start: 1, end: 1.000001 }, { start: 2, end: 3 }],
    { sampleRate: 8000, totalFrames: 80000 });
  assert.equal(sections.length, 1);
  assert.equal(sections[0].from, 16000);
});

test('sectionFrames adds up what the file will hold', () => {
  const sections = planSections(
    [{ start: 0, end: 1 }, { start: 2, end: 2.5 }],
    { sampleRate: 1000, totalFrames: 10000 });
  assert.equal(sectionFrames(sections), 1500);
});

/* ------------------------------------------------------------- the fades */

test('a join is faded and an edge of the recording is not', () => {
  // One part from the middle: both its edges are cuts.
  const [middle] = planSections([{ start: 1, end: 2 }], {
    sampleRate: 1000, totalFrames: 3000, fadeSeconds: 0.005,
  });
  assert.equal(middle.fadeIn, 5);
  assert.equal(middle.fadeOut, 5);

  // One part covering the whole thing: neither edge is a cut.
  const [whole] = planSections([{ start: 0, end: 3 }], {
    sampleRate: 1000, totalFrames: 3000, fadeSeconds: 0.005,
  });
  assert.equal(whole.fadeIn, 0);
  assert.equal(whole.fadeOut, 0);

  // Head and tail: one real edge each.
  const [head] = planSections([{ start: 0, end: 1 }], {
    sampleRate: 1000, totalFrames: 3000, fadeSeconds: 0.005,
  });
  assert.equal(head.fadeIn, 0);
  assert.equal(head.fadeOut, 5);

  const [tail] = planSections([{ start: 2, end: 3 }], {
    sampleRate: 1000, totalFrames: 3000, fadeSeconds: 0.005,
  });
  assert.equal(tail.fadeIn, 5);
  assert.equal(tail.fadeOut, 0);
});

test('the two fades never reach past each other on a short part', () => {
  // A 7-sample part asked for 50-sample fades: capped at half, so 3 each.
  const [section] = planSections([{ start: 0.1, end: 0.107 }], {
    sampleRate: 1000, totalFrames: 3000, fadeSeconds: 0.05,
  });
  assert.equal(section.frames, 7);
  assert.equal(section.fadeIn, 3);
  assert.equal(section.fadeOut, 3);
  assert.ok(section.fadeIn + section.fadeOut <= section.frames);
});

test('no fade asked for means no fade placed anywhere', () => {
  const [section] = planSections([{ start: 1, end: 2 }], {
    sampleRate: 1000, totalFrames: 3000,
  });
  assert.equal(section.fadeIn, 0);
  assert.equal(section.fadeOut, 0);
});

test('isUntouched is true only for the whole recording with no fades', () => {
  const options = { sampleRate: 1000, totalFrames: 3000 };
  assert.equal(isUntouched(planSections([{ start: 0, end: 3 }], options), 3000), true);
  assert.equal(isUntouched(planSections([{ start: 0, end: 2 }], options), 3000), false);
  assert.equal(isUntouched(
    planSections([{ start: 0, end: 3 }], { ...options, fadeSeconds: 0.005 }), 3000), true);
  assert.equal(isUntouched(
    planSections([{ start: 0, end: 1 }, { start: 2, end: 3 }], options), 3000), false);
});

/* --------------------------------------------------------------- the cut */

test('the kept samples come out as they went in, in order', () => {
  const channels = stereoRamp(1000);
  const sections = planSections(
    [{ start: 0.5, end: 0.6 }, { start: 0.2, end: 0.25 }],
    { sampleRate: 1000, totalFrames: 1000 });

  const out = cutChannels(channels, sections);
  assert.equal(out.length, 2);
  assert.equal(out[0].length, 150);

  // The marks were given out of order on purpose: the file follows the order
  // they are listed in, not the order they appear in the recording.
  assert.equal(out[0][0], 500);
  assert.equal(out[0][99], 599);
  assert.equal(out[0][100], 200);
  assert.equal(out[0][149], 249);
  assert.equal(out[1][0], -500);
});

test('a fade ramps from silence and back to it, and leaves the middle alone', () => {
  const channels = [new Float32Array(1000).fill(1)];
  const sections = planSections([{ start: 0.1, end: 0.2 }], {
    sampleRate: 1000, totalFrames: 1000, fadeSeconds: 0.004,
  });
  const [out] = cutChannels(channels, sections);

  assert.equal(out.length, 100);
  assert.equal(out[0], 0);          // first sample of the fade in: silent
  assert.equal(out[1], 0.25);
  assert.equal(out[2], 0.5);
  assert.equal(out[3], 0.75);
  assert.equal(out[4], 1);          // past the ramp
  assert.equal(out[50], 1);         // untouched middle
  assert.equal(out[99], 0);         // last sample of the fade out: silent
  assert.equal(out[98], 0.25);
});

test('trimming nothing returns every sample, unmultiplied', async () => {
  const source = { channels: stereoRamp(500), sampleRate: 1000, frames: 500 };
  const sections = planSections([{ start: 0, end: 0.5 }], {
    sampleRate: 1000, totalFrames: 500, fadeSeconds: 0.05,
  });

  const cut = await trim(source, sections, { t: say });
  assert.equal(cut.frames, 500);
  assert.deepEqual(Array.from(cut.channels[0]), Array.from(source.channels[0]));
  assert.deepEqual(Array.from(cut.channels[1]), Array.from(source.channels[1]));
});

test('trim and cutChannels agree, and trim reports progress', async () => {
  const source = { channels: [ramp(1000)], sampleRate: 1000, frames: 1000 };
  const sections = planSections(
    [{ start: 0.1, end: 0.3 }, { start: 0.6, end: 0.9 }],
    { sampleRate: 1000, totalFrames: 1000, fadeSeconds: 0.003 });

  const seen = [];
  const cut = await trim(source, sections,
    { t: say, onProgress: (done) => seen.push(done) });

  assert.deepEqual(Array.from(cut.channels[0]),
    Array.from(cutChannels(source.channels, sections)[0]));
  assert.equal(seen.length, 2);
  assert.equal(seen.at(-1), 1);
});

test('trimming with nothing marked is an error rather than an empty file', async () => {
  const source = { channels: [ramp(10)], sampleRate: 1000, frames: 10 };
  // The sentence lives in body.html now; the key is what this can hold it to.
  await assert.rejects(() => trim(source, [], { t: say }), /^Error: trim\.nothing$/);
});

test('trim stops when the signal is aborted', async () => {
  const source = { channels: [ramp(1000)], sampleRate: 1000, frames: 1000 };
  const sections = planSections(
    [{ start: 0, end: 0.2 }, { start: 0.4, end: 0.6 }, { start: 0.8, end: 1 }],
    { sampleRate: 1000, totalFrames: 1000 });

  const controller = new AbortController();
  const running = trim(source, sections, {
    t: say,
    signal: controller.signal,
    onProgress: () => controller.abort(),
  });
  await assert.rejects(() => running, { name: 'AbortError' });
});

/*
 * The two below are about the same thing, which is the one part of this file
 * that is not arithmetic: whether the loop really hands the page back between
 * sections.
 *
 * The test above cannot answer that. It aborts from inside onProgress, which
 * is called from *within* the loop, so it would pass just as happily against a
 * version that never yields at all - and that version is what shipped: it
 * awaited a resolved promise, which queues a microtask and returns to the same
 * task. The browser only repaints and only delivers a click between tasks, so
 * the progress bar was frozen and Cancel was unpressable for the whole trim.
 *
 * Aborting from a timer is the same shape as a person clicking Cancel, and it
 * can only work if the loop returns to the event loop. `budgetMs: 0` makes the
 * yield happen every section so the test does not depend on how fast the
 * machine running it is.
 */

test('the loop hands the page back between sections, not just the microtask queue', async () => {
  const source = { channels: [ramp(4000)], sampleRate: 1000, frames: 4000 };
  const sections = planSections(
    Array.from({ length: 8 }, (_, i) => ({ start: i * 0.5, end: i * 0.5 + 0.4 })),
    { sampleRate: 1000, totalFrames: 4000 });

  let timerFired = false;
  let firedDuringLoop = false;
  setTimeout(() => { timerFired = true; }, 0);

  await trim(source, sections, {
    t: say,
    budgetMs: 0,
    onProgress: () => { if (timerFired) firedDuringLoop = true; },
  });

  assert.equal(firedDuringLoop, true,
    'a timer set before the trim has to get its turn while the trim is running');
});

test('a cancel that arrives the way a click does is honoured', async () => {
  const source = { channels: [ramp(4000)], sampleRate: 1000, frames: 4000 };
  const sections = planSections(
    Array.from({ length: 8 }, (_, i) => ({ start: i * 0.5, end: i * 0.5 + 0.4 })),
    { sampleRate: 1000, totalFrames: 4000 });

  const controller = new AbortController();
  setTimeout(() => controller.abort(), 0);

  await assert.rejects(
    () => trim(source, sections, { budgetMs: 0, signal: controller.signal }),
    { name: 'AbortError' });
});

/* --------------------------------------------------------- cutting it out */

test('inverting the marks keeps everything they did not cover', () => {
  const gaps = invertRanges([{ start: 2, end: 4 }], 10);
  assert.deepEqual(gaps, [{ start: 0, end: 2 }, { start: 4, end: 10 }]);
});

test('a mark against an end leaves one section, not an empty one', () => {
  assert.deepEqual(invertRanges([{ start: 0, end: 3 }], 10), [{ start: 3, end: 10 }]);
  assert.deepEqual(invertRanges([{ start: 7, end: 10 }], 10), [{ start: 0, end: 7 }]);
});

test('overlapping marks are merged rather than producing a negative gap', () => {
  const gaps = invertRanges([{ start: 2, end: 6 }, { start: 4, end: 8 }], 10);
  assert.deepEqual(gaps, [{ start: 0, end: 2 }, { start: 8, end: 10 }]);
});

test('marks covering the whole recording leave nothing to keep', () => {
  assert.deepEqual(invertRanges([{ start: 0, end: 10 }], 10), []);
});

test('totalSeconds adds the sections up', () => {
  assert.equal(totalSeconds([{ start: 0, end: 2 }, { start: 5, end: 6.5 }]), 3.5);
});

/* ------------------------------------------------------------- the clock */

test('formatClock always writes hours, minutes, seconds and thousandths', () => {
  assert.equal(formatClock(0), '00:00:00.000');
  assert.equal(formatClock(207.687), '00:03:27.687');
  assert.equal(formatClock(3661.5), '01:01:01.500');
});

test('a fraction that rounds up carries into the seconds instead of writing four digits', () => {
  // The instant has to be rounded before it is taken apart. Flooring the
  // seconds and rounding the fraction separately writes 3.9996 as
  // "00:00:03.1000", which is not a time: it reads back as 3.1, nine tenths of
  // a second from where the mark was put.
  assert.equal(formatClock(3.9996), '00:00:04.000');
  assert.equal(formatClock(59.9999), '00:01:00.000');
  assert.equal(formatClock(3599.9999), '01:00:00.000');
  assert.equal(formatClock(0.9995), '00:00:01.000');

  for (const seconds of [3.9996, 59.9999, 0.9995, 3599.9999]) {
    assert.ok(Math.abs(parseClock(formatClock(seconds)) - seconds) < 0.001,
      `${seconds} has to read back as itself`);
  }
});

test('the same carry, in the label a row and the playhead are written with', () => {
  assert.equal(formatTime(3.9996), '0:04.000');
  assert.equal(formatTime(59.9999), '1:00.000');
  assert.equal(formatTime(3599.9999), '1:00:00.000');
  assert.equal(parseTime(formatTime(59.9999)), 60);
});

test('a length is written the way a person reads it, and carries too', () => {
  assert.equal(formatDuration(0), '0:00.0');
  assert.equal(formatDuration(3), '0:03.0');
  assert.equal(formatDuration(83.5), '1:23.5');
  assert.equal(formatDuration(59.96), '1:00.0');
  assert.equal(formatDuration(3599.96), '1:00:00.0');
  assert.equal(formatDuration(Number.NaN), '-');
});

test('parseClock reads what the two formats write and what people type', () => {
  assert.equal(parseClock('00:03:27.687'), 207.687);
  assert.equal(parseClock('3:27.687'), 207.687);
  assert.equal(parseClock('207.687'), 207.687);
  assert.equal(parseClock(''), null);
  assert.equal(parseClock('half past two'), null);
  assert.equal(parseClock('1:2:3:4'), null);
});

test('formatTime and parseTime round-trip a mark', () => {
  for (const seconds of [0, 1.25, 83.5, 3661.007]) {
    assert.ok(Math.abs(parseTime(formatTime(seconds)) - seconds) < 0.0005);
  }
});

/* ------------------------------------------------------------ the marks */

test('an unclosed part is open, counts for nothing, and is always the last', () => {
  const segments = [
    { id: 1, start: 0, end: 2 },
    { id: 2, start: 5, end: null },
  ];
  assert.equal(openSegment(segments).id, 2);
  assert.equal(segmentRanges(segments).length, 1);
  assert.equal(totalCaptured(segments), 2);
  assert.equal(openSegment([{ id: 1, start: 0, end: 2 }]), null);
});

test('a part too short to be worth keeping is not a part', () => {
  assert.equal(segmentRanges([{ id: 1, start: 1, end: 1.0005 }]).length, 0);
  assert.equal(segmentRanges([{ id: 1, start: 1, end: 1.002 }]).length, 1);
});

/* ------------------------------------------------------- the marks file */

test('the file names its format and lists a part a line', () => {
  const segments = [
    { id: 1, start: 207.687, end: 347.737 },
    { id: 2, start: 630.284, end: 668.796 },
  ];

  assert.equal(writeTimestamps(segments, { format: 'seconds', name: 'talk.mp3' }),
    'seconds,talk.mp3\n207.687,347.737\n630.284,668.796\n');
  assert.equal(writeTimestamps(segments, { format: 'HHMMSSmmm', name: 'talk.mp3' }),
    'HHMMSSmmm,talk.mp3\n00:03:27.687,00:05:47.737\n00:10:30.284,00:11:08.796\n');
});

test('a comma in the name would give the header three fields, so it goes', () => {
  const written = writeTimestamps([{ id: 1, start: 0, end: 1 }], { name: 'a,b.mp3' });
  assert.equal(written.split('\n')[0], 'seconds,a b.mp3');
});

test('an unknown format name falls back to seconds rather than writing it out', () => {
  const written = writeTimestamps([{ id: 1, start: 0, end: 1 }], { format: 'nonsense' });
  assert.ok(TIMESTAMP_FORMATS.includes(written.split(',')[0]));
  assert.equal(written.split(',')[0], 'seconds');
});

test('what was written reads back, both ways round', () => {
  const segments = [
    { id: 1, start: 207.687, end: 347.737 },
    { id: 2, start: 630.284, end: 668.796 },
  ];
  for (const format of TIMESTAMP_FORMATS) {
    const read = readTimestamps(writeTimestamps(segments, { format, name: 'talk.mp3' }));
    assert.equal(read.format, format);
    assert.equal(read.name, 'talk.mp3');
    assert.deepEqual(read.segments, [
      { start: 207.687, end: 347.737 },
      { start: 630.284, end: 668.796 },
    ]);
  }
});

test('a file with no header at all is still a list of times', () => {
  const read = readTimestamps('12.5,20\n30,41.25\n');
  assert.equal(read.format, 'seconds');
  assert.equal(read.segments.length, 2);
  assert.equal(read.skipped, 0);
});

test('a line that cannot be read is counted, not fatal', () => {
  const read = readTimestamps('seconds,talk\n1,2\nrubbish\n9,4\n\n5,6\n');
  assert.deepEqual(read.segments, [{ start: 1, end: 2 }, { start: 5, end: 6 }]);
  assert.equal(read.skipped, 2);   // "rubbish", and the end-before-start pair
});

test('a file with nothing readable in it says so', () => {
  assert.throws(() => readTimestamps('seconds,talk\nnothing\nhere\n'),
    /^Error: marks\.unreadable$/);
  assert.throws(() => readTimestamps(''), /^Error: marks\.unreadable$/);
});

/* ---------------------------------------------------------- the waveform */

test('the summary keeps peaks rather than averaging them away', () => {
  // A wave that spends most of its time near zero and spikes once per column.
  const frames = 1000;
  const samples = new Float32Array(frames);
  for (let i = 0; i < frames; i += 1) samples[i] = i % 100 === 0 ? 0.9 : 0.01;

  const summary = summarise([samples], 10);
  assert.equal(summary.columns, 10);
  for (let column = 0; column < 10; column += 1) {
    // Float32 rounding: 0.9 does not survive the round trip exactly.
    assert.ok(Math.abs(summary.high[column] - 0.9) < 1e-6,
      `column ${column} lost its peak`);
  }
});

test('the summary sees every channel, and both directions', () => {
  const left = Float32Array.from([0.5, 0.5, 0.5, 0.5]);
  const right = Float32Array.from([-0.8, 0, 0, 0]);
  const summary = summarise([left, right], 1);
  assert.equal(summary.high[0], 0.5);
  assert.ok(Math.abs(summary.low[0] + 0.8) < 1e-6);
});

test('a summary is never wider than the recording has samples', () => {
  const summary = summarise([Float32Array.from([1, -1, 1])], 4096);
  assert.equal(summary.columns, 3);
});
