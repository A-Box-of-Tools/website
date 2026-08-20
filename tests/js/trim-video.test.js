/**
 * tools/trim-video/src/{ranges,timeline,copy,mp4}.js.
 *
 * `ranges.js` is where seconds become ticks, once, so that the two export
 * paths and the summary on the page cannot disagree about where a cut lands.
 * The part worth testing is why a lossless cut starts earlier than you asked:
 * a frame that is not a keyframe cannot be decoded without the frames around
 * it, so a copy has to begin at a keyframe and play in from partway through.
 *
 * That pre-roll is stated on the page, so it is not a secret - but it is
 * arithmetic over two different clocks, and getting it wrong desynchronises
 * the sound rather than throwing anything.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  keyframeBefore, keyframeTimes, planRange, planRanges, rangesFor,
  sampleDurations, totalSeconds,
} from '../../tools/trim-video/src/ranges.js';
import { formatTime, parseTime } from '../../tools/trim-video/src/timeline.js';
import { estimateCopy } from '../../tools/trim-video/src/copy.js';
import { MOVIE_TIMESCALE, Mp4Writer, avcSampleEntry } from '../../tools/trim-video/src/mp4.js';
import { ascii, blobBytes } from './helpers.js';

/* ------------------------------------------------------------- fixtures */

/**
 * A video track at 30 fps on a 90000-tick clock, with a keyframe every
 * `gap` frames. No B-frames, so pts and dts agree.
 */
function videoTrack({ frames = 60, fps = 30, gap = 15, timescale = 90000 } = {}) {
  const step = timescale / fps;
  const samples = [];
  for (let i = 0; i < frames; i += 1) {
    samples.push({ dts: i * step, pts: i * step, isKey: i % gap === 0, size: 1000 + i });
  }
  return { timescale, samples, duration: frames * step };
}

/** An audio track on its own, different clock: 48 kHz, 1024 samples a packet. */
function audioTrack({ packets = 90, timescale = 48000, span = 1024 } = {}) {
  const samples = [];
  for (let i = 0; i < packets; i += 1) {
    samples.push({ dts: i * span, pts: i * span, isKey: true, size: 400 });
  }
  return { timescale, samples, duration: packets * span };
}

const plan = (args) => {
  const video = args.video ?? videoTrack();
  const audio = args.audio ?? null;
  return planRange({
    video,
    audio,
    videoDurations: sampleDurations(video),
    audioDurations: audio ? sampleDurations(audio) : null,
    start: args.start,
    end: args.end,
    anchor: args.anchor ?? 'keyframe',
  });
};

/* ------------------------------------------------------ sampleDurations */

test('a sample lasts until the next one decodes', () => {
  const track = videoTrack({ frames: 4, fps: 30 });
  const durations = sampleDurations(track);
  assert.equal(durations[0], 3000);
  assert.equal(durations[1], 3000);
  assert.equal(durations[2], 3000);
});

test('the last sample takes the track duration that is left', () => {
  // Decode times are stored; durations are not.
  const track = videoTrack({ frames: 4, fps: 30 });
  assert.equal(sampleDurations(track)[3], track.duration - track.samples[3].dts);
});

test('an absurd declared duration falls back to the sample before it', () => {
  // A fragmented file whose header was written before its fragments existed.
  const track = videoTrack({ frames: 4, fps: 30 });
  track.duration = 9_000_000;
  const durations = sampleDurations(track);
  assert.equal(durations[3], durations[2], 'not the absurd remainder');
});

test('a missing declared duration falls back too', () => {
  const track = videoTrack({ frames: 4, fps: 30 });
  track.duration = 0;
  assert.equal(sampleDurations(track)[3], 3000);
});

test('a single-sample track still gets a duration', () => {
  const track = { timescale: 90000, duration: 0, samples: [{ dts: 0, pts: 0, isKey: true, size: 1 }] };
  assert.equal(sampleDurations(track)[0], 1);
});

test('an empty track produces an empty list', () => {
  assert.equal(sampleDurations({ timescale: 90000, duration: 0, samples: [] }).length, 0);
});

test('decode times that go backwards never produce a negative duration', () => {
  const track = {
    timescale: 90000,
    duration: 6000,
    samples: [{ dts: 3000, pts: 3000, isKey: true, size: 1 },
      { dts: 0, pts: 0, isKey: false, size: 1 }],
  };
  for (const value of sampleDurations(track)) assert.ok(value >= 0, `${value}`);
});

/* ---------------------------------------------------------- keyframes */

test('keyframeTimes lists every keyframe in seconds', () => {
  const times = keyframeTimes(videoTrack({ frames: 60, fps: 30, gap: 15 }));
  assert.deepEqual(times, [0, 0.5, 1, 1.5]);
});

test('keyframeTimes comes back sorted', () => {
  const track = videoTrack({ frames: 30, gap: 10 });
  track.samples.reverse();
  assert.deepEqual(keyframeTimes(track), [0, 1 / 3, 2 / 3]);
});

test('keyframeBefore finds where a lossless cut would really begin', () => {
  const video = videoTrack({ frames: 60, fps: 30, gap: 15 }); // keys at 0, .5, 1, 1.5
  assert.equal(keyframeBefore(video, 0.7), 0.5);
  assert.equal(keyframeBefore(video, 1.5), 1.5, 'landing exactly on one');
  assert.equal(keyframeBefore(video, 0), 0);
});

test('keyframeBefore answers zero when there is nothing in front of the cut', () => {
  const video = videoTrack({ frames: 30, gap: 15 });
  video.samples[0].isKey = false;
  assert.equal(keyframeBefore(video, 0.1), 0);
});

/* ---------------------------------------------------------- planRange */

test('a cut on a keyframe has no pre-roll', () => {
  const found = plan({ start: 0.5, end: 1.0 });
  assert.equal(found.keyframeSeconds, 0.5);
  assert.equal(found.preRoll, 0);
  assert.equal(found.video.editStart, 0, 'nothing to skip on the way in');
});

test('a cut between keyframes starts earlier, and says by how much', () => {
  // Keys every half second; asking for 0.7 gets the one at 0.5.
  const found = plan({ start: 0.7, end: 1.2 });
  assert.equal(found.keyframeSeconds, 0.5);
  assert.ok(Math.abs(found.preRoll - 0.2) < 1e-9);
  assert.equal(found.start, 0.7, 'what was asked for is remembered');
});

test('the edit list skips exactly the pre-roll', () => {
  const found = plan({ start: 0.7, end: 1.2 });
  const video = videoTrack();
  // editStart is in the video track's own ticks, measured from the keyframe.
  assert.ok(Math.abs(found.video.editStart / video.timescale - 0.2) < 1e-9);
});

test('the sample run begins at the keyframe, not at the cut', () => {
  const found = plan({ start: 0.7, end: 1.2 });
  const video = videoTrack();
  assert.equal(video.samples[found.video.from].isKey, true);
  assert.ok(video.samples[found.video.from].pts / video.timescale <= 0.7);
});

test('the run covers every frame shown before the end', () => {
  const video = videoTrack({ frames: 60, fps: 30, gap: 15 });
  const found = plan({ video, start: 0.5, end: 1.0 });
  assert.ok(video.samples[found.video.to].pts / video.timescale < 1.0);
  const next = video.samples[found.video.to + 1];
  assert.ok(next.pts / video.timescale >= 1.0, 'and stops there');
});

test('editStart is never negative', () => {
  // For the one file in a thousand that stores a frame shown before it decodes.
  const video = videoTrack({ frames: 30, gap: 15 });
  video.samples[0].pts = 5000;
  const found = plan({ video, start: 0, end: 0.5 });
  assert.ok(found.video.editStart >= 0);
});

test('a cut in front of the first keyframe still starts somewhere', () => {
  const video = videoTrack({ frames: 30, gap: 15 });
  video.samples[0].isKey = false;
  const found = plan({ video, start: 0.05, end: 0.4 });
  assert.ok(found.video.from >= 0);
  assert.ok(found.video.to >= found.video.from);
});

test('a range with nothing in it still returns a usable plan', () => {
  const found = plan({ start: 0.5, end: 0.5 });
  assert.ok(found.video.to >= found.video.from);
});

/* --------------------------------------------------- planRange, with sound */

test('both tracks are cut from the same instant', () => {
  // Or they drift apart in any player that ignores the edit list.
  const video = videoTrack();
  const audio = audioTrack();
  const found = plan({ video, audio, start: 0.7, end: 1.2, anchor: 'keyframe' });

  const audioStart = audio.samples[found.audio.from].dts / audio.timescale;
  assert.ok(audioStart <= found.keyframeSeconds + 1e-9,
    `sound starts at ${audioStart}, picture at ${found.keyframeSeconds}`);
});

test('the copy path anchors the sound to the keyframe', () => {
  const video = videoTrack();
  const audio = audioTrack();
  const copy = plan({ video, audio, start: 0.7, end: 1.2, anchor: 'keyframe' });
  const encode = plan({ video, audio, start: 0.7, end: 1.2, anchor: 'start' });
  // The re-encode path's picture really does begin at the cut, so its sound
  // starts later than the copy path's.
  assert.ok(encode.audio.from >= copy.audio.from);
});

test('a file with no sound plans no audio', () => {
  assert.equal(plan({ start: 0.5, end: 1 }).audio, null);
  assert.equal(plan({ audio: { timescale: 48000, duration: 0, samples: [] }, start: 0.5, end: 1 }).audio,
    null);
});

test('the audio edit start is measured on the audio clock', () => {
  const video = videoTrack();
  const audio = audioTrack();
  const found = plan({ video, audio, start: 0.7, end: 1.2 });
  const skipped = found.audio.editStart / audio.timescale;
  const audioStart = found.audio.base / audio.timescale;
  assert.ok(Math.abs((audioStart + skipped) - 0.7) < 0.05, `${audioStart} + ${skipped}`);
});

/* --------------------------------------------------------- planRanges */

test('several sections are laid end to end', () => {
  const video = videoTrack({ frames: 120, fps: 30, gap: 15 });
  const { plans } = planRanges({
    video, audio: null, anchor: 'keyframe',
    ranges: [{ start: 0, end: 0.5 }, { start: 1.0, end: 1.5 }],
  });

  assert.equal(plans.length, 2);
  assert.equal(plans[0].video.offset, 0);
  assert.equal(plans[1].video.offset, plans[0].video.spanTs,
    'the second begins where the first ended');
});

test('the running offsets are cumulative across three sections', () => {
  const video = videoTrack({ frames: 180, fps: 30, gap: 15 });
  const { plans } = planRanges({
    video, audio: null, anchor: 'keyframe',
    ranges: [{ start: 0, end: 0.5 }, { start: 1.0, end: 1.5 }, { start: 2.0, end: 2.5 }],
  });
  let running = 0;
  for (const found of plans) {
    assert.equal(found.video.offset, running);
    running += found.video.spanTs;
  }
});

test('the sound gets its own running offset on its own clock', () => {
  const video = videoTrack({ frames: 120 });
  const audio = audioTrack({ packets: 200 });
  const { plans } = planRanges({
    video, audio, anchor: 'keyframe',
    ranges: [{ start: 0, end: 0.5 }, { start: 1.0, end: 1.5 }],
  });
  assert.equal(plans[0].audio.offset, 0);
  assert.equal(plans[1].audio.offset, plans[0].audio.spanTs);
});

test('planRanges hands back the durations it computed', () => {
  const video = videoTrack();
  const { videoDurations, audioDurations } = planRanges({
    video, audio: null, ranges: [{ start: 0, end: 1 }], anchor: 'keyframe',
  });
  assert.equal(videoDurations.length, video.samples.length);
  assert.equal(audioDurations, null);
});

/* ---------------------------------------------------------- rangesFor */

test('keeping a section is that section', () => {
  assert.deepEqual(rangesFor({ mode: 'keep', start: 1, end: 3, duration: 10 }),
    [{ start: 1, end: 3 }]);
});

test('cutting a section out leaves the two either side', () => {
  assert.deepEqual(rangesFor({ mode: 'cut', start: 1, end: 3, duration: 10 }),
    [{ start: 0, end: 1 }, { start: 3, end: 10 }]);
});

test('cutting from an end leaves one section, not an empty one', () => {
  assert.deepEqual(rangesFor({ mode: 'cut', start: 0, end: 3, duration: 10 }),
    [{ start: 3, end: 10 }]);
  assert.deepEqual(rangesFor({ mode: 'cut', start: 7, end: 10, duration: 10 }),
    [{ start: 0, end: 7 }]);
});

test('a section shorter than a frame is not a section', () => {
  assert.deepEqual(rangesFor({ mode: 'keep', start: 1, end: 1.01, duration: 10 }), []);
  assert.deepEqual(rangesFor({ mode: 'keep', start: 1, end: 1, duration: 10 }), []);
});

test('cutting the whole clip leaves nothing', () => {
  assert.deepEqual(rangesFor({ mode: 'cut', start: 0, end: 10, duration: 10 }), []);
});

test('totalSeconds adds the sections up', () => {
  assert.equal(totalSeconds([{ start: 0, end: 1 }, { start: 5, end: 7 }]), 3);
  assert.equal(totalSeconds([]), 0);
});

/* ------------------------------------------------------------- timeline */

test('formatTime is short enough to read and exact enough to type back', () => {
  assert.equal(formatTime(0), '0:00.000');
  assert.equal(formatTime(1.5), '0:01.500');
  assert.equal(formatTime(83.25), '1:23.250');
  assert.equal(formatTime(3600), '1:00:00.000');
  assert.equal(formatTime(3723.5), '1:02:03.500');
});

test('formatTime never shows a negative time', () => {
  assert.equal(formatTime(-5), '0:00.000');
  assert.equal(formatTime(undefined), '0:00.000');
  assert.equal(formatTime(NaN), '0:00.000');
});

test('parseTime accepts the spellings a person would type', () => {
  assert.equal(parseTime('1:23.5'), 83.5);
  assert.equal(parseTime('83.5'), 83.5);
  assert.equal(parseTime('0:01:23.500'), 83.5);
  assert.equal(parseTime('  1:23.5  '), 83.5);
  assert.equal(parseTime('0'), 0);
});

test('parseTime refuses what is not a time', () => {
  assert.equal(parseTime(''), null);
  assert.equal(parseTime('abc'), null);
  assert.equal(parseTime('1:2:3:4'), null);
  assert.equal(parseTime('1::2'), null);
  assert.equal(parseTime('1:.'), null);
  assert.equal(parseTime(null), null);
  assert.equal(parseTime(undefined), null);
});

test('formatTime and parseTime round-trip', () => {
  for (const seconds of [0, 0.001, 1.5, 59.999, 83.25, 3600, 3723.5, 7199.999]) {
    const back = parseTime(formatTime(seconds));
    assert.ok(Math.abs(back - seconds) < 0.001, `${seconds} -> ${formatTime(seconds)} -> ${back}`);
  }
});

/* --------------------------------------------------------- estimateCopy */

test('estimateCopy adds up the samples a copy would write', () => {
  const video = videoTrack({ frames: 60, fps: 30, gap: 15 });
  const found = estimateCopy({ media: { video, audio: null }, ranges: [{ start: 0, end: 0.5 }] });
  assert.equal(found.frames, 15);
  assert.ok(found.bytes > 0);
  assert.equal(found.preRoll, 0);
});

test('estimateCopy reports the pre-roll a cut between keyframes costs', () => {
  const video = videoTrack({ frames: 60, fps: 30, gap: 15 });
  const found = estimateCopy({ media: { video, audio: null }, ranges: [{ start: 0.7, end: 1.2 }] });
  assert.ok(Math.abs(found.preRoll - 0.2) < 1e-9);
  assert.ok(found.frames > 15, 'the hidden frames are in the file');
});

test('estimateCopy on nothing is zero, not a crash', () => {
  const video = videoTrack();
  assert.deepEqual(estimateCopy({ media: { video, audio: null }, ranges: [] }),
    { bytes: 0, preRoll: 0, frames: 0 });
});

test('estimateCopy counts the sound only when it is being kept', () => {
  const media = { video: videoTrack({ frames: 60 }), audio: audioTrack() };
  const ranges = [{ start: 0, end: 0.5 }];
  const withSound = estimateCopy({ media, ranges, keepAudio: true });
  const without = estimateCopy({ media, ranges, keepAudio: false });
  assert.ok(withSound.bytes > without.bytes);
  assert.equal(withSound.frames, without.frames, 'the picture is the same either way');
});

test('estimateCopy takes the largest pre-roll across sections', () => {
  // The largest deliberately comes first, so that taking the maximum is
  // distinguishable from simply keeping the last one.
  const video = videoTrack({ frames: 120, fps: 30, gap: 15 }); // keys every 0.5s
  const found = estimateCopy({
    media: { video, audio: null },
    ranges: [{ start: 0.7, end: 0.9 }, { start: 1.5, end: 1.9 }],
  });
  assert.ok(Math.abs(found.preRoll - 0.2) < 1e-9, `got ${found.preRoll}`);
});

test('estimateCopy reports no pre-roll when every section is on a keyframe', () => {
  const video = videoTrack({ frames: 120, fps: 30, gap: 15 });
  const found = estimateCopy({
    media: { video, audio: null },
    ranges: [{ start: 0.5, end: 0.9 }, { start: 1.5, end: 1.9 }],
  });
  assert.equal(found.preRoll, 0);
});

/* -------------------------------------------------------------- mp4.js */

const AVCC = new Uint8Array([1, 0x64, 0, 0x1f, 0xff, 0xe1, 0, 4, 0x67, 1, 2, 3, 1, 0, 4, 0x68, 1, 2, 3]);

function topBoxes(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const found = [];
  let at = 0;
  while (at + 8 <= bytes.length) {
    const size = view.getUint32(at);
    found.push({ type: new TextDecoder('latin1').decode(bytes.subarray(at + 4, at + 8)), at, size });
    if (size < 8) break;
    at += size;
  }
  return found;
}

const has = (bytes, type) => {
  const name = ascii(type);
  outer: for (let i = 0; i + 4 <= bytes.length; i += 1) {
    for (let j = 0; j < 4; j += 1) if (bytes[i + j] !== name[j]) continue outer;
    return true;
  }
  return false;
};

test('avcSampleEntry carries the size and the decoder configuration', () => {
  const entry = avcSampleEntry(1920, 1080, AVCC);
  const view = new DataView(entry.buffer, entry.byteOffset, entry.byteLength);
  assert.equal(new TextDecoder('latin1').decode(entry.subarray(4, 8)), 'avc1');
  assert.equal(view.getUint16(8 + 24), 1920);
  assert.equal(view.getUint16(8 + 26), 1080);
  assert.ok(has(entry, 'avcC'));
});

test('a written file has the three top-level boxes in faststart order', async () => {
  const writer = new Mp4Writer();
  const track = writer.addTrack({
    kind: 'vide', timescale: 90000, sampleEntry: avcSampleEntry(320, 240, AVCC),
  });
  for (let i = 0; i < 4; i += 1) {
    track.addSample({ data: ascii(`f${i}`), isKey: i === 0, dts: i * 3000, pts: i * 3000, duration: 3000 });
  }
  const bytes = await blobBytes(writer.finalize());
  assert.deepEqual(topBoxes(bytes).map((b) => b.type), ['ftyp', 'moov', 'mdat']);
  assert.equal(topBoxes(bytes).reduce((n, b) => n + b.size, 0), bytes.length);
});

test('the sample data reaches mdat in order', async () => {
  const writer = new Mp4Writer();
  const track = writer.addTrack({
    kind: 'vide', timescale: 90000, sampleEntry: avcSampleEntry(320, 240, AVCC),
  });
  for (let i = 0; i < 4; i += 1) {
    track.addSample({ data: ascii(`f${i}`), isKey: i === 0, dts: i * 3000, pts: i * 3000, duration: 3000 });
  }
  const bytes = await blobBytes(writer.finalize());
  const mdat = topBoxes(bytes).find((b) => b.type === 'mdat');
  assert.equal(new TextDecoder('latin1').decode(bytes.subarray(mdat.at + 8)), 'f0f1f2f3');
});

test('a composition offset table appears only when the frames need one', async () => {
  const build = async (withOffsets) => {
    const writer = new Mp4Writer();
    const track = writer.addTrack({
      kind: 'vide', timescale: 90000, sampleEntry: avcSampleEntry(16, 16, AVCC),
    });
    for (let i = 0; i < 3; i += 1) {
      track.addSample({
        data: ascii('x'), isKey: i === 0, dts: i * 3000,
        pts: i * 3000 + (withOffsets ? 1500 : 0), duration: 3000,
      });
    }
    return blobBytes(await writer.finalize());
  };
  assert.equal(has(await build(false), 'ctts'), false, 'no B-frames, no ctts');
  assert.equal(has(await build(true), 'ctts'), true);
});

test('a sync sample table appears only when some frames are not keyframes', async () => {
  const build = async (allKey) => {
    const writer = new Mp4Writer();
    const track = writer.addTrack({
      kind: 'vide', timescale: 90000, sampleEntry: avcSampleEntry(16, 16, AVCC),
    });
    for (let i = 0; i < 3; i += 1) {
      track.addSample({ data: ascii('x'), isKey: allKey || i === 0, dts: i * 3000, pts: i * 3000, duration: 3000 });
    }
    return blobBytes(await writer.finalize());
  };
  assert.equal(has(await build(true), 'stss'), false);
  assert.equal(has(await build(false), 'stss'), true);
});

test('a track with no sample entry is refused', () => {
  const writer = new Mp4Writer();
  assert.throws(() => writer.addTrack({ kind: 'vide', timescale: 90000, sampleEntry: null }),
    /no sample entry/);
  assert.throws(() => writer.addTrack({ kind: 'soun', timescale: 48000, sampleEntry: new Uint8Array(0) }),
    /audio track has no sample entry/);
});

test('a file with no video frames is refused rather than written', () => {
  const writer = new Mp4Writer();
  writer.addTrack({ kind: 'vide', timescale: 90000, sampleEntry: avcSampleEntry(16, 16, AVCC) });
  assert.throws(() => writer.finalize(), /holds no video frames/);
});

test('sound is interleaved with the picture rather than written after it', async () => {
  const writer = new Mp4Writer();
  const video = writer.addTrack({
    kind: 'vide', timescale: 90000, sampleEntry: avcSampleEntry(16, 16, AVCC),
  });
  const audio = writer.addTrack({
    kind: 'soun', timescale: 48000, sampleEntry: ascii('mp4a-entry'),
  });
  for (let i = 0; i < 120; i += 1) {
    video.addSample({
      data: ascii(`V${String(i).padStart(3, '0')}`), isKey: i % 30 === 0,
      dts: i * 3000, pts: i * 3000, duration: 3000,
    });
    audio.addSample({
      data: ascii(`A${String(i).padStart(3, '0')}`), isKey: true,
      dts: i * 1600, pts: i * 1600, duration: 1600,
    });
  }
  const bytes = await blobBytes(writer.finalize());
  const mdat = topBoxes(bytes).find((b) => b.type === 'mdat');
  const body = new TextDecoder('latin1').decode(bytes.subarray(mdat.at + 8));
  assert.ok(body.indexOf('A000') < body.lastIndexOf('V119'),
    'the sound does not all sit behind the picture');
});

test('the movie timescale is the one the edit lists are written in', () => {
  assert.equal(MOVIE_TIMESCALE, 1000);
});
