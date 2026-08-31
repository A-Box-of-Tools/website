/**
 * The hand-written MP4 reader, in both the copies that exist.
 *
 * This is the file that turns somebody else's video into the list every video
 * tool works from - where each frame is, how big it is, when it is shown, and
 * whether it can be decoded on its own. Six tools carry a copy, and until now
 * none of them had a test: the reader was loaded by the suite and never once
 * executed, which reads as 21% of its lines covered and 0% of its functions.
 *
 * An error here does not throw. It hands back a list that is the right length
 * and the right shape and points at the wrong bytes, and what a person sees is
 * a still of the wrong moment, or a trim that starts half a second late, or a
 * frame decoded from the middle of the one before it. So the assertions below
 * are mostly about arithmetic that has no visible failure mode.
 *
 * WHY EVERY TEST RUNS TWICE
 *
 * `tests/python/test_duplicates.py` declares two groups for demux.js - one for
 * crop-video, grab-frame, timelapse-video and video-to-gif, another for
 * reverse-video and trim-video - which means the copies inside a group are
 * checked to agree and the two groups are not. They differ: trim-video's copy
 * carries the display matrix and the sample entry out whole, because a trim
 * writes them back untouched. Everything under test here is common to both, so
 * running the suite against one copy from each group is what makes a pass
 * cover all six rather than four.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  demux as grabFrameDemux,
  FileWindow as GrabFrameWindow,
  UnsupportedFile as GrabFrameUnsupported,
} from '../../tools/grab-frame/src/demux.js';
import {
  demux as trimVideoDemux,
  FileWindow as TrimVideoWindow,
  UnsupportedFile as TrimVideoUnsupported,
} from '../../tools/trim-video/src/demux.js';

import {
  AV1C, AVCC, FTYP, HVCC, VPCC_BODY,
  asFile, audioEntry, box, fillBytes, fragmentedFile, full, largeBox, mvhd,
  plainFile, trak, u64be, visualEntry, zeros,
} from './mp4-fixtures.js';
import { ascii, concat, u32be } from './helpers.js';

/** One reader from each declared duplicate group. See the header. */
const READERS = [
  ['grab-frame', grabFrameDemux, GrabFrameWindow, GrabFrameUnsupported],
  ['trim-video', trimVideoDemux, TrimVideoWindow, TrimVideoUnsupported],
];

/** Run one body against both copies, so a divergence between them fails. */
function forEachReader(name, body) {
  for (const [tool, demux, FileWindow, UnsupportedFile] of READERS) {
    test(`${name} [${tool}]`, () => body({ demux, FileWindow, UnsupportedFile }));
  }
}

const avc1 = (options = {}) => visualEntry('avc1', { config: box('avcC', AVCC), ...options });

/** The video track most of these files have: six frames at 30 fps on a 600 clock. */
const VIDEO = {
  id: 1,
  entry: avc1(),
  timescale: 600,
  duration: 120,
  sizes: [100, 40, 10, 10, 40, 10],
  deltas: [[6, 20]],
  chunkRuns: [[1, 4], [2, 2]],
  keyframes: [1, 5],
};

/** Read a fixture, or fail the test with the reason rather than a stack. */
async function read(demux, bytes) {
  return demux(asFile(bytes));
}

/** Assert that reading these bytes is refused, and for the stated reason. */
async function refuses(demux, UnsupportedFile, bytes, reason) {
  const error = await read(demux, bytes).then(
    () => null,
    (thrown) => thrown,
  );
  assert.ok(error, `expected ${reason}, but the file was accepted`);
  assert.ok(error instanceof UnsupportedFile,
    `expected UnsupportedFile, got ${error.name}: ${error.message}`);
  assert.equal(error.reason, reason);
  return error;
}

/* ------------------------------------------------------------ sample table */

forEachReader('the sample table becomes one flat list of frames', async ({ demux }) => {
  const { bytes, layout } = plainFile({ tracks: [VIDEO] });
  const { video } = await read(demux, bytes);

  assert.equal(video.samples.length, 6);
  // Against the arithmetic that laid the file out, not a remembered list.
  assert.deepEqual(video.samples.map((s) => s.offset), layout[0].offsets);
  assert.deepEqual(video.samples.map((s) => s.size), VIDEO.sizes);
  assert.deepEqual(video.samples.map((s) => s.dts), [0, 20, 40, 60, 80, 100]);
});

forEachReader('chunk offsets are read, not assumed to be contiguous', async ({ demux }) => {
  const { bytes, layout } = plainFile({ tracks: [{ ...VIDEO, chunkGap: 4096 }] });
  const { video } = await read(demux, bytes);

  // The fixture puts 4 KB of filler between the two chunks. A reader that
  // walked `mdat` accumulating sizes would put sample 4 immediately after
  // sample 3 and be exactly one gap out for the rest of the file.
  const [, second] = [layout[0].offsets[3], layout[0].offsets[4]];
  assert.equal(second - (layout[0].offsets[3] + 10), 4096);
  assert.deepEqual(video.samples.map((s) => s.offset), layout[0].offsets);
});

forEachReader('stsc runs are followed from one chunk to the next', async ({ demux }) => {
  // One sample in the first chunk and three in each one after it - the shape a
  // muxer writes when it flushes a keyframe on its own. The earlier fixtures
  // cannot catch a reader that reads the first `stsc` entry and then stops
  // consulting the table, because their last run happens to run out of samples
  // at the same moment. This one does not: staying on the first run gives
  // seven chunks of one where the file declares three.
  const { bytes, layout } = plainFile({
    tracks: [{
      ...VIDEO,
      sizes: [90, 30, 30, 30, 25, 25, 25],
      deltas: [[7, 20]],
      chunkRuns: [[1, 1], [2, 3]],
      keyframes: [1],
    }],
  });
  const { video } = await read(demux, bytes);

  assert.equal(video.samples.length, 7);
  assert.deepEqual(video.samples.map((s) => s.offset), layout[0].offsets);
});

forEachReader('stss names the keyframes, and nothing else is one', async ({ demux }) => {
  const { bytes } = plainFile({ tracks: [VIDEO] });
  const { video } = await read(demux, bytes);

  // stss is 1-based; samples are not. Off by one here is a decode that starts
  // from a frame that cannot be decoded on its own.
  assert.deepEqual(video.samples.map((s) => s.isKey),
    [true, false, false, false, true, false]);
});

forEachReader('a file with no stss is all keyframes', async ({ demux }) => {
  const { bytes } = plainFile({ tracks: [{ ...VIDEO, keyframes: null }] });
  const { video } = await read(demux, bytes);
  assert.deepEqual(video.samples.map((s) => s.isKey), Array(6).fill(true));
});

forEachReader('stts runs give a variable frame rate its real times', async ({ demux }) => {
  // 30 fps for three frames, then 24 - what a phone that got warm writes.
  const { bytes } = plainFile({
    tracks: [{ ...VIDEO, deltas: [[3, 20], [3, 25]] }],
  });
  const { video } = await read(demux, bytes);
  assert.deepEqual(video.samples.map((s) => s.dts), [0, 20, 40, 60, 85, 110]);
});

forEachReader('an stts that runs out early keeps the samples in order', async ({ demux }) => {
  // Four frames described, six stored. The remaining two must not stack up on
  // one instant, or "the next frame" stops meaning anything.
  const { bytes } = plainFile({ tracks: [{ ...VIDEO, deltas: [[4, 20]] }] });
  const { video } = await read(demux, bytes);

  const times = video.samples.map((s) => s.dts);
  assert.deepEqual(times.slice(0, 4), [0, 20, 40, 60]);
  assert.ok(times[4] > times[3] && times[5] > times[4], `not increasing: ${times}`);
});

forEachReader('ctts is what makes pts differ from dts', async ({ demux }) => {
  // Stored I P B B P B, watched I B B P B P: the P frames decode before the B
  // frames that are shown in front of them.
  const { bytes } = plainFile({
    tracks: [{
      ...VIDEO,
      deltas: [[6, 20]],
      compositions: [[1, 0], [1, 40], [2, -20], [1, 40], [1, -20]],
      cttsVersion: 1,
    }],
  });
  const { video } = await read(demux, bytes);

  assert.deepEqual(video.samples.map((s) => s.dts), [0, 20, 40, 60, 80, 100]);
  assert.deepEqual(video.samples.map((s) => s.pts), [0, 60, 20, 40, 120, 80]);
});

forEachReader('a version 0 ctts offset is unsigned', async ({ demux }) => {
  // The same table read as signed would make these negative and reorder the
  // frames; version 0 has no negative offsets to read.
  const { bytes } = plainFile({
    tracks: [{ ...VIDEO, compositions: [[6, 40]], cttsVersion: 0 }],
  });
  const { video } = await read(demux, bytes);
  assert.deepEqual(video.samples.map((s) => s.pts - s.dts), Array(6).fill(40));
});

forEachReader('a uniform stsz means every sample is that size', async ({ demux }) => {
  const { bytes, layout } = plainFile({
    tracks: [{ ...VIDEO, sizes: Array(6).fill(64), uniformSize: 64 }],
  });
  const { video } = await read(demux, bytes);

  assert.deepEqual(video.samples.map((s) => s.size), Array(6).fill(64));
  assert.deepEqual(video.samples.map((s) => s.offset), layout[0].offsets);
});

forEachReader('co64 carries offsets past four gigabytes', async ({ demux }) => {
  const { bytes, layout } = plainFile({ tracks: [{ ...VIDEO, wide: true }] });
  const { video } = await read(demux, bytes);
  assert.deepEqual(video.samples.map((s) => s.offset), layout[0].offsets);
});

forEachReader('an mdat with a 64-bit size does not shift the samples', async ({ demux }) => {
  // The largesize escape puts eight more bytes between the box type and its
  // payload. A reader that missed them would report every offset eight low.
  const { bytes, layout } = plainFile({ tracks: [VIDEO], mdatBox: largeBox });
  const { video } = await read(demux, bytes);

  assert.equal(layout[0].offsets[0], FTYP.length + 16);
  assert.deepEqual(video.samples.map((s) => s.offset), layout[0].offsets);
});

/* ----------------------------------------------------------- codec strings */

forEachReader('avcC becomes the string a decoder is configured with', async ({ demux }) => {
  const { bytes } = plainFile({ tracks: [VIDEO] });
  const { video } = await read(demux, bytes);

  assert.equal(video.codec, 'avc1.64001f');
  assert.equal(video.entryType, 'avc1');
  assert.deepEqual(video.description, AVCC);
});

forEachReader('avc3 keeps its own prefix', async ({ demux }) => {
  const { bytes } = plainFile({
    tracks: [{ ...VIDEO, entry: visualEntry('avc3', { config: box('avcC', AVCC) }) }],
  });
  const { video } = await read(demux, bytes);
  assert.equal(video.codec, 'avc3.64001f');
});

forEachReader('hvcC is assembled per RFC 6381', async ({ demux }) => {
  // The compatibility flags are written in reverse bit order and the trailing
  // zero constraint bytes are dropped. Both are easy to get wrong and produce
  // a string a browser rejects outright.
  const { bytes } = plainFile({
    tracks: [{ ...VIDEO, entry: visualEntry('hvc1', { config: box('hvcC', HVCC) }) }],
  });
  const { video } = await read(demux, bytes);
  assert.equal(video.codec, 'hvc1.1.6.L93.B0');
});

forEachReader('hev1 keeps its own prefix', async ({ demux }) => {
  const { bytes } = plainFile({
    tracks: [{ ...VIDEO, entry: visualEntry('hev1', { config: box('hvcC', HVCC) }) }],
  });
  const { video } = await read(demux, bytes);
  assert.equal(video.codec, 'hev1.1.6.L93.B0');
});

forEachReader('av1C becomes an av01 string', async ({ demux }) => {
  const { bytes } = plainFile({
    tracks: [{ ...VIDEO, entry: visualEntry('av01', { config: box('av1C', AV1C) }) }],
  });
  const { video } = await read(demux, bytes);
  assert.equal(video.codec, 'av01.0.08M.08');
});

forEachReader('vpcC is read as the full box it is', async ({ demux }) => {
  // vpcC is the one configuration written with a version and flags in front of
  // it. Reading it as a plain box shifts every field by four bytes.
  const { bytes } = plainFile({
    tracks: [{ ...VIDEO, entry: visualEntry('vp09', { config: full('vpcC', 1, 0, VPCC_BODY) }) }],
  });
  const { video } = await read(demux, bytes);
  assert.equal(video.codec, 'vp09.00.41.08');
});

/* ---------------------------------------------------------------- rotation */

for (const [rotation, width, height] of [[0, 640, 360], [90, 360, 640], [180, 640, 360], [270, 360, 640]]) {
  forEachReader(`a ${rotation} degree matrix gives display ${width}x${height}`, async ({ demux }) => {
    const { bytes } = plainFile({ tracks: [{ ...VIDEO, rotation }] });
    const { video } = await read(demux, bytes);

    assert.equal(video.rotation, rotation);
    // The coded size never changes; only what it is presented as does.
    assert.equal(video.codedWidth, 640);
    assert.equal(video.codedHeight, 360);
    assert.equal(video.displayWidth, width);
    assert.equal(video.displayHeight, height);
  });
}

forEachReader('a version 1 tkhd puts the matrix somewhere else', async ({ demux }) => {
  // v0 and v1 differ only in the width of the times in front of the matrix, so
  // the reader counts back from the end of the box. A reader counting forward
  // reads twelve bytes of a timestamp as a rotation.
  const { bytes } = plainFile({
    tracks: [{ ...VIDEO, tkhdVersion: 1, rotation: 90 }],
  });
  const { video } = await read(demux, bytes);

  assert.equal(video.rotation, 90);
  assert.equal(video.trackId, 1);
});

forEachReader('a version 1 mdhd holds a 64-bit duration', async ({ demux }) => {
  const { bytes } = plainFile({
    tracks: [{ ...VIDEO, mdhdVersion: 1, timescale: 600, duration: 1800 }],
  });
  const { video, duration } = await read(demux, bytes);

  assert.equal(video.timescale, 600);
  assert.equal(video.duration, 1800);
  assert.equal(duration, 3);
});

/* ------------------------------------------------------------------- audio */

forEachReader('the audio track is found and its bytes left alone', async ({ demux }) => {
  const marker = ascii('an-esds-nothing-here-parses');
  const sound = audioEntry('mp4a', { channels: 1, sampleRate: 44100, extra: box('esds', marker) });

  const { bytes } = plainFile({
    tracks: [
      VIDEO,
      {
        id: 2, handler: 'soun', entry: sound, timescale: 44100, duration: 44100,
        sizes: [50, 50, 50], deltas: [[3, 1024]],
      },
    ],
  });
  const { video, audio } = await read(demux, bytes);

  assert.equal(video.trackId, 1);
  assert.equal(audio.trackId, 2);
  assert.equal(audio.channels, 1);
  assert.equal(audio.sampleRate, 44100);
  assert.equal(audio.samples.length, 3);
  // The whole entry is copied out and written back, so what matters is that it
  // arrives unchanged - including the box nothing here understands.
  assert.deepEqual(audio.sampleEntry, sound);
});

forEachReader('a file with no sound reports none', async ({ demux }) => {
  const { bytes } = plainFile({ tracks: [VIDEO] });
  const { audio } = await read(demux, bytes);
  assert.equal(audio, null);
});

/* --------------------------------------------------------------- fragments */

/** A fragmented file's video track: no sample tables, defaults in `trex`. */
const FRAGMENTED_VIDEO = {
  id: 1, entry: avc1(), timescale: 600, duration: 0,
  defaultDuration: 20, defaultSize: 30, defaultFlags: 0x10000,
};

forEachReader('a fragmented file has its tables in the fragments', async ({ demux }) => {
  const bytes = fragmentedFile({
    tracks: [FRAGMENTED_VIDEO],
    fragments: [
      {
        runs: [{
          trackId: 1,
          baseDecodeTime: 0,
          firstSampleFlags: 0,
          samples: [{ size: 100 }, { size: 40 }, { size: 10 }],
        }],
      },
      {
        runs: [{
          trackId: 1,
          baseDecodeTime: 60,
          firstSampleFlags: 0,
          samples: [{ size: 80 }, { size: 20 }],
        }],
      },
    ],
  });
  const { video, duration } = await read(demux, bytes);

  assert.equal(video.samples.length, 5);
  assert.deepEqual(video.samples.map((s) => s.size), [100, 40, 10, 80, 20]);
  // Durations come from trex, which the trun says nothing about.
  assert.deepEqual(video.samples.map((s) => s.dts), [0, 20, 40, 60, 80]);
  // The header declared zero; the clock the fragments ended on is the truth.
  assert.equal(video.duration, 100);
  assert.equal(duration, 100 / 600);
});

forEachReader('sample offsets in a fragment are counted from its moof', async ({ demux }) => {
  const bytes = fragmentedFile({
    tracks: [FRAGMENTED_VIDEO],
    fragments: [
      { runs: [{ trackId: 1, baseDecodeTime: 0, samples: [{ size: 100 }, { size: 40 }] }] },
      { runs: [{ trackId: 1, baseDecodeTime: 40, samples: [{ size: 70 }] }] },
    ],
  });
  const { video } = await read(demux, bytes);

  const [first, second, third] = video.samples;
  // Inside a fragment the samples are contiguous...
  assert.equal(second.offset, first.offset + 100);
  // ...and the next fragment starts over from its own moof, which is further
  // along the file than the last sample of the one before it.
  assert.ok(third.offset > second.offset + 40,
    `second fragment at ${third.offset} did not clear the first`);

  // What the offsets point at is checked below by reading the bytes back.
  assert.equal(video.samples.length, 3);
});

forEachReader('a fragment says which of its samples is a keyframe', async ({ demux }) => {
  // Bit 16 of the sample flags is "not a sync sample", so first_sample_flags of
  // 0 makes the opening frame a keyframe and the trex default makes the rest
  // ordinary. A reader that read the bit the other way up would mark every
  // frame decodable on its own and seek to the wrong one every time.
  const bytes = fragmentedFile({
    tracks: [FRAGMENTED_VIDEO],
    fragments: [{
      runs: [{
        trackId: 1,
        baseDecodeTime: 0,
        firstSampleFlags: 0,
        samples: [{ size: 100 }, { size: 40 }, { size: 10 }, { size: 10 }],
      }],
    }],
  });
  const { video } = await read(demux, bytes);
  assert.deepEqual(video.samples.map((s) => s.isKey), [true, false, false, false]);
});

forEachReader('tfdt moves the clock, and the trun does not have to', async ({ demux }) => {
  // A fragment that starts at 6000 rather than where the last one stopped is
  // what a file with a gap in it looks like, and what an appended recording
  // looks like. The clock has to follow the tfdt, not the running total.
  const bytes = fragmentedFile({
    tracks: [FRAGMENTED_VIDEO],
    fragments: [
      { runs: [{ trackId: 1, baseDecodeTime: 0, samples: [{ size: 100 }, { size: 40 }] }] },
      { runs: [{ trackId: 1, baseDecodeTime: 6000, samples: [{ size: 70 }] }] },
    ],
  });
  const { video } = await read(demux, bytes);
  assert.deepEqual(video.samples.map((s) => s.dts), [0, 20, 6000]);
});

forEachReader('a trun that states its own durations overrides trex', async ({ demux }) => {
  const bytes = fragmentedFile({
    tracks: [FRAGMENTED_VIDEO],
    fragments: [{
      runs: [{
        trackId: 1,
        baseDecodeTime: 0,
        samples: [
          { size: 100, duration: 33, composition: 0 },
          { size: 40, duration: 33, composition: 66 },
          { size: 10, duration: 33, composition: 33 },
        ],
      }],
    }],
  });
  const { video } = await read(demux, bytes);

  // trex said every sample lasts 20 and is 30 bytes; the trun says otherwise
  // about both, and the trun is the one that was written last.
  assert.deepEqual(video.samples.map((s) => s.size), [100, 40, 10]);
  assert.deepEqual(video.samples.map((s) => s.dts), [0, 33, 66]);
  assert.deepEqual(video.samples.map((s) => s.pts), [0, 99, 99]);
});

forEachReader('only a version 1 trun can put a frame before its decode time', async ({ demux }) => {
  // The same four bytes read as unsigned make a small negative offset into
  // roughly 4.29 billion, which sorts the frame to the end of the file instead
  // of one place earlier. Version 0 has no negative offsets to read, so the
  // reader has to take the version into account rather than the bytes alone.
  const withVersion = (trunVersion) => fragmentedFile({
    tracks: [FRAGMENTED_VIDEO],
    fragments: [{
      runs: [{
        trackId: 1,
        baseDecodeTime: 0,
        trunVersion,
        samples: [
          { size: 100, duration: 33, composition: 0 },
          { size: 40, duration: 33, composition: 66 },
          { size: 10, duration: 33, composition: -33 },
        ],
      }],
    }],
  });

  const signed = await read(demux, withVersion(1));
  assert.deepEqual(signed.video.samples.map((s) => s.pts), [0, 99, 33]);

  const unsigned = await read(demux, withVersion(0));
  assert.equal(unsigned.video.samples[2].pts, 66 + 0xffffffff - 32);
});

forEachReader('an audio track in a fragmented file is picked up too', async ({ demux }) => {
  const bytes = fragmentedFile({
    tracks: [
      FRAGMENTED_VIDEO,
      {
        id: 2, handler: 'soun', entry: audioEntry('mp4a'), timescale: 48000, duration: 0,
        defaultDuration: 1024, defaultSize: 50, defaultFlags: 0,
      },
    ],
    fragments: [{
      runs: [
        { trackId: 1, baseDecodeTime: 0, samples: [{ size: 100 }, { size: 40 }] },
        { trackId: 2, baseDecodeTime: 0, samples: [{ size: 50 }, { size: 50 }] },
      ],
    }],
  });
  const { video, audio } = await read(demux, bytes);

  assert.equal(video.samples.length, 2);
  assert.equal(audio.samples.length, 2);
  assert.deepEqual(audio.samples.map((s) => s.dts), [0, 1024]);
});

forEachReader('a fragmented file whose audio never appears reports none', async ({ demux }) => {
  // The moov declares a sound track and no fragment ever carries one, which is
  // what a recording stopped before the microphone started looks like. An
  // audio track with an empty sample list would be carried forward as though
  // there were sound to keep.
  const bytes = fragmentedFile({
    tracks: [
      FRAGMENTED_VIDEO,
      {
        id: 2, handler: 'soun', entry: audioEntry('mp4a'), timescale: 48000, duration: 0,
        defaultDuration: 1024, defaultSize: 50, defaultFlags: 0,
      },
    ],
    fragments: [{ runs: [{ trackId: 1, baseDecodeTime: 0, samples: [{ size: 100 }] }] }],
  });
  const { audio, video } = await read(demux, bytes);

  assert.equal(audio, null);
  assert.equal(video.samples.length, 1);
});

/* -------------------------------------------------------------- what it is */

forEachReader('the offsets point at the bytes they claim to', async ({ demux, FileWindow }) => {
  // The whole point of the list. `fillBytes` makes byte n of mdat equal to
  // n & 0xff, so a sample read back at its own offset names where it came from.
  const { bytes, layout } = plainFile({ tracks: [VIDEO] });
  const file = asFile(bytes);
  const { video } = await read(demux, bytes);

  const window = new FileWindow(file, 1 << 12);
  const dataStart = layout[0].offsets[0];

  for (const [index, sample] of video.samples.entries()) {
    const got = await window.read(sample.offset, sample.size);
    const expected = fillBytes(sample.offset - dataStart + sample.size)
      .subarray(sample.offset - dataStart);
    assert.deepEqual(new Uint8Array(got), expected, `sample ${index} read the wrong bytes`);
  }
});

/* -------------------------------------------------------------- FileWindow */

forEachReader('FileWindow slides rather than reading the file in', async ({ FileWindow }) => {
  const data = fillBytes(40_000);
  const window = new FileWindow(new Blob([data]), 4096);

  assert.deepEqual(new Uint8Array(await window.read(0, 10)), data.subarray(0, 10));
  // Forward past the end of the window: it moves rather than failing.
  assert.deepEqual(new Uint8Array(await window.read(30_000, 10)), data.subarray(30_000, 30_010));
  // Backwards, which a linear walk never does but a seek does.
  assert.deepEqual(new Uint8Array(await window.read(100, 10)), data.subarray(100, 110));
  // Bigger than the window itself: the window grows to fit one sample.
  assert.deepEqual(new Uint8Array(await window.read(0, 9000)), data.subarray(0, 9000));
});

forEachReader('FileWindow refuses a read that runs off the end', async ({ FileWindow, UnsupportedFile }) => {
  // A file truncated mid-frame. Returning the short read would hand a decoder
  // half a frame, which is worse than saying so.
  const window = new FileWindow(new Blob([fillBytes(1000)]), 4096);
  await assert.rejects(
    () => window.read(900, 200),
    (error) => error instanceof UnsupportedFile && error.reason === 'read.midframe',
  );
});

/* ----------------------------------------------------------- what it won't */

forEachReader('something that is not an MP4 at all', async ({ demux, UnsupportedFile }) => {
  await refuses(demux, UnsupportedFile,
    concat(ascii('this is not a video, it is a sentence about one')), 'read.notmp4');
});

forEachReader('an MP4 with no moov', async ({ demux, UnsupportedFile }) => {
  await refuses(demux, UnsupportedFile,
    concat(FTYP, box('mdat', fillBytes(64))), 'read.nomoov');
});

forEachReader('a file whose only track is sound', async ({ demux, UnsupportedFile }) => {
  const { bytes } = plainFile({
    tracks: [{
      id: 1, handler: 'soun', entry: audioEntry('mp4a'), timescale: 48000, duration: 48000,
      sizes: [50, 50], deltas: [[2, 1024]],
    }],
  });
  await refuses(demux, UnsupportedFile, bytes, 'read.novideo');
});

forEachReader('an encrypted track, declared as encv', async ({ demux, UnsupportedFile }) => {
  const { bytes } = plainFile({
    tracks: [{ ...VIDEO, entry: visualEntry('encv', { config: box('avcC', AVCC) }) }],
  });
  await refuses(demux, UnsupportedFile, bytes, 'read.encrypted');
});

forEachReader('an encrypted track hiding a sinf inside avc1', async ({ demux, UnsupportedFile }) => {
  // Common encryption leaves the four characters saying avc1 in place and adds
  // a protection scheme box beside the configuration. Decoding it anyway
  // produces noise, so a refusal is the honest answer.
  const { bytes } = plainFile({
    tracks: [{
      ...VIDEO,
      entry: visualEntry('avc1', {
        config: concat(box('avcC', AVCC), box('sinf', box('frma', ascii('avc1')))),
      }),
    }],
  });
  await refuses(demux, UnsupportedFile, bytes, 'read.encrypted');
});

forEachReader('a codec this reader has never heard of', async ({ demux, UnsupportedFile }) => {
  const { bytes } = plainFile({
    tracks: [{ ...VIDEO, entry: visualEntry('mjpg', { config: box('jpeC', zeros(8)) }) }],
  });
  const error = await refuses(demux, UnsupportedFile, bytes, 'read.unknowncodec');
  // The four characters travel with the refusal, because the sentence on the
  // page names the codec and cannot know it in advance.
  assert.deepEqual(error.values, { type: 'mjpg' });
});

forEachReader('a known codec with no configuration box', async ({ demux, UnsupportedFile }) => {
  const { bytes } = plainFile({
    tracks: [{ ...VIDEO, entry: visualEntry('avc1', { config: null }) }],
  });
  const error = await refuses(demux, UnsupportedFile, bytes, 'read.noconfig');
  assert.deepEqual(error.values, { type: 'avc1' });
});

forEachReader('an avcC too short to name a codec', async ({ demux, UnsupportedFile }) => {
  const { bytes } = plainFile({
    tracks: [{ ...VIDEO, entry: visualEntry('avc1', { config: box('avcC', new Uint8Array([1, 0x64])) }) }],
  });
  await refuses(demux, UnsupportedFile, bytes, 'read.avcshort');
});

forEachReader('an hvcC too short to name a codec', async ({ demux, UnsupportedFile }) => {
  const { bytes } = plainFile({
    tracks: [{ ...VIDEO, entry: visualEntry('hvc1', { config: box('hvcC', HVCC.subarray(0, 8)) }) }],
  });
  await refuses(demux, UnsupportedFile, bytes, 'read.hevcshort');
});

forEachReader('the compact sample size table, which is not read', async ({ demux, UnsupportedFile }) => {
  // stz2 is legal and rare. Saying so beats reading it as an stsz and handing
  // back sizes that are plausible and wrong.
  const { bytes } = plainFile({ tracks: [VIDEO] });
  const patched = renameBox(bytes, 'stsz', 'stz2');
  await refuses(demux, UnsupportedFile, patched, 'read.compactsizes');
});

forEachReader('a track with no sample tables', async ({ demux, UnsupportedFile }) => {
  const { bytes } = plainFile({ tracks: [VIDEO] });
  await refuses(demux, UnsupportedFile, renameBox(bytes, 'stts', 'free'), 'read.sampletables');
});

/* ------------------------------------------------------------- broken maps */

forEachReader('a box claiming to run past its parent stops the walk', async ({ demux, UnsupportedFile }) => {
  // A truncated download. Giving up whatever was read beats throwing, but a
  // moov whose first box swallows the rest has no tracks left to find.
  const { bytes } = plainFile({ tracks: [VIDEO] });
  const patched = bytes.slice();
  const view = new DataView(patched.buffer);
  const at = findBoxOffset(patched, 'trak');
  view.setUint32(at, 0x0fffffff);

  await refuses(demux, UnsupportedFile, patched, 'read.novideo');
});

forEachReader('a track whose timescale is zero', async ({ demux, UnsupportedFile }) => {
  // Dividing by it would make every time in the file Infinity, and a timeline
  // of Infinity draws as an empty strip rather than as an error.
  const { bytes } = plainFile({ tracks: [{ ...VIDEO, timescale: 0 }] });
  await refuses(demux, UnsupportedFile, bytes, 'read.notimescale');
});

/* --------------------------------------------- what only trim-video keeps */

test('trim-video carries the matrix and sample entry out whole', async () => {
  // Its copy of the reader has one addition: a trim writes the original frames
  // back untouched, so the boxes describing them have to survive the trip
  // byte for byte rather than be rebuilt from what was parsed out of them.
  const entry = avc1();
  const { bytes } = plainFile({ tracks: [{ ...VIDEO, entry, rotation: 90 }] });
  const { video } = await trimVideoDemux(asFile(bytes));

  assert.deepEqual(video.sampleEntry, entry);
  assert.equal(video.matrix.length, 36);
  assert.equal(video.trackWidth, 640 * 65536);
  assert.equal(video.trackHeight, 360 * 65536);

  // And the copied matrix is the one that produced the rotation beside it.
  const view = new DataView(video.matrix.buffer, video.matrix.byteOffset, 36);
  assert.equal(view.getInt32(0), 0);
  assert.equal(view.getInt32(4), 0x00010000);
  assert.equal(video.rotation, 90);
});

/* ----------------------------------------------------------------- helpers */

/** Where a four-character box type sits in the file, by its first appearance. */
function findBoxOffset(bytes, type) {
  const needle = ascii(type);
  for (let at = 0; at + 4 <= bytes.length; at += 1) {
    if (needle.every((byte, i) => bytes[at + i] === byte)) return at - 4;
  }
  throw new Error(`no ${type} in the fixture`);
}

/**
 * Rename a box in place, which is how a fixture asks for a table the reader
 * does not handle without a second builder for every one of them.
 */
function renameBox(bytes, from, to) {
  const out = bytes.slice();
  out.set(ascii(to), findBoxOffset(out, from) + 4);
  return out;
}
