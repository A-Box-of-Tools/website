/**
 * tools/trim-video/src/{clips,copy,audio,draw}.js - joining.
 *
 * Trimming asks one question of a file: which samples. Joining asks a second
 * one, and it is the question that can corrupt a result rather than merely
 * mis-time it: *may these samples share a track at all?*
 *
 * A track in an MP4 is described once, at the front, and every sample in it is
 * decoded against that description. Put a clip encoded at one resolution into a
 * track described as another and no player errors - it shows a smear of green
 * blocks partway through. So `clips.js` refuses instead of guessing, and the
 * tests below are mostly about the refusals firing on the right things.
 *
 * The rest is the seam. Two files can count time at 30000 and at 90000 ticks a
 * second, so a join has to rescale one onto the other, and `stts` defines the
 * timeline as a sum of durations - which means the durations and the decode
 * times have to agree or the sound walks away from the picture one clip at a
 * time.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  audioJoinable, joinability, outputFrame, videoJoinable,
} from '../../tools/trim-video/src/clips.js';
import { joinByCopy, estimateJoinCopy } from '../../tools/trim-video/src/copy.js';
import { audioDecoderConfig, mp4aSampleEntry } from '../../tools/trim-video/src/audio.js';
import { fittedBox } from '../../tools/trim-video/src/draw.js';
import { ascii, blobBytes } from './helpers.js';

/* --------------------------------------------------------------- fixtures */

/** A visual sample entry, distinguishable by the byte it is padded with. */
function videoEntry(mark = 0x11) {
  const entry = new Uint8Array(40);
  entry.set(ascii('avc1'), 4);
  entry.fill(mark, 8);
  new DataView(entry.buffer).setUint32(0, entry.length);
  return entry;
}

function audioEntry(mark = 0x22) {
  const entry = new Uint8Array(36);
  entry.set(ascii('mp4a'), 4);
  entry.fill(mark, 8);
  new DataView(entry.buffer).setUint32(0, entry.length);
  return entry;
}

/**
 * One clip: a Blob whose bytes say which clip and which sample they came from,
 * plus the tables that point into it.
 *
 * Every sample is `size` bytes of a single value, so the order the samples
 * reach `mdat` can be read straight out of the finished file.
 */
function clipFixture({
  id = 1, frames = 30, fps = 30, gap = 15, timescale = 90000,
  entry = videoEntry(), sound = null, size = 8, name = `clip ${id}`,
} = {}) {
  const step = timescale / fps;
  const bytes = [];
  const samples = [];

  for (let i = 0; i < frames; i++) {
    const offset = bytes.length;
    for (let b = 0; b < size; b++) bytes.push((id * 100 + i) & 0xff);
    samples.push({ offset, size, dts: i * step, pts: i * step, isKey: i % gap === 0 });
  }

  const audio = sound
    ? (() => {
      const packets = [];
      const span = sound.span ?? 1024;
      const count = sound.packets ?? Math.ceil(frames / fps * sound.rate / span);
      for (let i = 0; i < count; i++) {
        const offset = bytes.length;
        for (let b = 0; b < 4; b++) bytes.push(0xa0 | (i & 0x0f));
        packets.push({ offset, size: 4, dts: i * span, pts: i * span, isKey: true });
      }
      return {
        timescale: sound.rate,
        samples: packets,
        duration: count * span,
        sampleEntry: sound.entry ?? audioEntry(),
        entryType: 'mp4a',
        channels: sound.channels ?? 2,
        sampleRate: sound.rate,
      };
    })()
    : null;

  return {
    name,
    file: new Blob([new Uint8Array(bytes)]),
    media: {
      duration: frames / fps,
      video: {
        timescale,
        samples,
        duration: frames * step,
        sampleEntry: entry,
        entryType: 'avc1',
        codec: 'avc1.42001f',
        matrix: null,
        trackWidth: 640 << 16,
        trackHeight: 480 << 16,
        displayWidth: 640,
        displayHeight: 480,
        codedWidth: 640,
        codedHeight: 480,
        rotation: 0,
      },
      audio,
    },
    source: { width: 640, height: 480 },
    ranges: [{ start: 0, end: frames / fps }],
  };
}

/** Walk every box in a file, so a test can name one without knowing where it is. */
function boxesOf(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const found = [];
  const walk = (start, end) => {
    let at = start;
    while (at + 8 <= end) {
      const size = view.getUint32(at);
      const type = new TextDecoder('latin1').decode(bytes.subarray(at + 4, at + 8));
      if (size < 8 || at + size > end) break;
      found.push({ type, start: at, body: at + 8, end: at + size, view });
      if (['moov', 'trak', 'mdia', 'minf', 'stbl', 'edts'].includes(type)) walk(at + 8, at + size);
      at += size;
    }
  };
  walk(0, bytes.length);
  return found;
}

const findAll = (bytes, type) => boxesOf(bytes).filter((box) => box.type === type);
const find = (bytes, type) => findAll(bytes, type)[0];

function readElst(box) {
  const count = box.view.getUint32(box.body + 4);
  const entries = [];
  for (let i = 0; i < count; i++) {
    const at = box.body + 8 + i * 12;
    entries.push({ duration: box.view.getUint32(at), mediaTime: box.view.getInt32(at + 4) });
  }
  return entries;
}

function readStts(box) {
  const count = box.view.getUint32(box.body + 4);
  const runs = [];
  for (let i = 0; i < count; i++) {
    runs.push({
      count: box.view.getUint32(box.body + 8 + i * 8),
      delta: box.view.getUint32(box.body + 12 + i * 8),
    });
  }
  return runs;
}

function readStsz(box) {
  const count = box.view.getUint32(box.body + 8);
  const sizes = [];
  for (let i = 0; i < count; i++) sizes.push(box.view.getUint32(box.body + 12 + i * 4));
  return sizes;
}

/* ------------------------------------------------------------ videoJoinable */

/**
 * A stand-in for `phrase`, so a test can say which reason was chosen.
 *
 * The real one reads the markup; clips.js is handed whichever it is given.
 * This one writes the key and its blanks, which is what these tests are
 * about - the sentence itself is body.html's, in fifteen languages.
 */
const say = (key, values = {}) => {
  const filled = Object.entries(values).map(([k, v]) => `${k}=${v}`).join(' ');
  return filled ? `${key} ${filled}` : key;
};

test('two clips from the same encoder can share a track', () => {
  const entry = videoEntry();
  const result = videoJoinable(
    [clipFixture({ id: 1, entry }), clipFixture({ id: 2, entry })], say);
  assert.equal(result.ok, true);
  assert.equal(result.reason, null);
});

test('a clip of a different size is refused, and the reason says both sizes', () => {
  const a = clipFixture({ id: 1 });
  const b = clipFixture({ id: 2 });
  b.media.video.displayWidth = 1280;
  b.media.video.displayHeight = 720;

  const result = videoJoinable([a, b], say);
  assert.equal(result.ok, false);
  assert.match(result.reason, /^join\.size /);
  assert.match(result.reason, /1280x720/);
  assert.match(result.reason, /640x480/);
});

test('a clip turned a different way is refused', () => {
  const a = clipFixture({ id: 1 });
  const b = clipFixture({ id: 2 });
  b.media.video.rotation = 90;

  const result = videoJoinable([a, b], say);
  assert.equal(result.ok, false);
  assert.match(result.reason, /^join\.rotated(\.none)? /);
  assert.match(result.reason, /degrees=90/);
});

test('a clip in another codec is refused', () => {
  const a = clipFixture({ id: 1 });
  const b = clipFixture({ id: 2 });
  b.media.video.codec = 'hvc1.1.6.L93.B0';

  const result = videoJoinable([a, b], say);
  assert.equal(result.ok, false);
  assert.match(result.reason, /^join\.codec /);
  assert.match(result.reason, /hvc1/);
});

test('the same codec with different settings is still refused', () => {
  const a = clipFixture({ id: 1, entry: videoEntry(0x11) });
  const b = clipFixture({ id: 2, entry: videoEntry(0x99) });

  const result = videoJoinable([a, b], say);
  assert.equal(result.ok, false);
  assert.match(result.reason, /^join\.settings /);
});

test('a sample entry differing by one byte is a different description', () => {
  const a = clipFixture({ id: 1 });
  const b = clipFixture({ id: 2 });
  b.media.video.sampleEntry = videoEntry();
  b.media.video.sampleEntry[20] ^= 0x01;

  assert.equal(videoJoinable([a, b], say).ok, false);
});

test('a clip that could not be read is named', () => {
  const a = clipFixture({ id: 1 });
  const b = { name: 'holiday.mkv', media: null };

  const result = videoJoinable([a, b], say);
  assert.equal(result.ok, false);
  assert.match(result.reason, /^join\.unread /);
  assert.match(result.reason, /holiday\.mkv/);
});

test('nothing to join is not joinable', () => {
  assert.equal(videoJoinable([], say).ok, false);
});

/* ------------------------------------------------------------ audioJoinable */

test('clips with no sound at all are joinable, and say there is none', () => {
  const result = audioJoinable(
    [clipFixture({ id: 1 }), clipFixture({ id: 2 })], say);
  assert.equal(result.ok, true);
  assert.equal(result.present, false);
});

test('matching sound is joinable', () => {
  const entry = audioEntry();
  const sound = { rate: 48000, entry };
  const result = audioJoinable([
    clipFixture({ id: 1, sound }), clipFixture({ id: 2, sound }),
  ], say);
  assert.equal(result.ok, true);
  assert.equal(result.present, true);
});

test('one silent clip among sounding ones is refused', () => {
  const sound = { rate: 48000 };
  const result = audioJoinable([
    clipFixture({ id: 1, sound }),
    clipFixture({ id: 2, name: 'silent.mp4' }),
  ], say);
  assert.equal(result.ok, false);
  assert.match(result.reason, /^join\.silent /);
  assert.match(result.reason, /silent\.mp4/);
});

test('different sample rates are refused, and both are named', () => {
  const result = audioJoinable([
    clipFixture({ id: 1, sound: { rate: 48000 } }),
    clipFixture({ id: 2, sound: { rate: 44100 } }),
  ], say);
  assert.equal(result.ok, false);
  assert.match(result.reason, /^join\.sound /);
  assert.match(result.reason, /rate=44100/);
  assert.match(result.reason, /firstrate=48000/);
});

test('different channel counts are refused', () => {
  const entry = audioEntry();
  const result = audioJoinable([
    clipFixture({ id: 1, sound: { rate: 48000, entry, channels: 2 } }),
    clipFixture({ id: 2, sound: { rate: 48000, entry, channels: 1 } }),
  ], say);
  assert.equal(result.ok, false);
  assert.match(result.reason, /channels=1 /);
});

/* -------------------------------------------------------------- joinability */

test('joinability ignores a sound mismatch when the sound is being dropped', () => {
  const clips = [
    clipFixture({ id: 1, sound: { rate: 48000 } }),
    clipFixture({ id: 2, sound: { rate: 44100 } }),
  ];
  assert.equal(joinability(clips, { keepAudio: true, t: say }).copy, false);
  assert.equal(joinability(clips, { keepAudio: false, t: say }).copy, true);
});

test('joinability says the sound would have to be encoded when clips disagree', () => {
  const clips = [
    clipFixture({ id: 1, sound: { rate: 48000 } }),
    clipFixture({ id: 2, sound: { rate: 44100 } }),
  ];
  assert.equal(joinability(clips, { keepAudio: true, t: say }).sound, 'encode');
});

test('joinability says the sound can be copied when they agree', () => {
  const entry = audioEntry();
  const sound = { rate: 48000, entry };
  const clips = [clipFixture({ id: 1, sound }), clipFixture({ id: 2, sound })];
  assert.equal(joinability(clips, { keepAudio: true }).sound, 'copy');
});

test('a video mismatch is reported even when the sound matches', () => {
  const entry = audioEntry();
  const sound = { rate: 48000, entry };
  const clips = [clipFixture({ id: 1, sound }), clipFixture({ id: 2, sound })];
  clips[1].media.video.displayWidth = 1920;

  const result = joinability(clips, { keepAudio: true, t: say });
  assert.equal(result.copy, false);
  assert.match(result.reason, /1920/);
});

/* ------------------------------------------------------------- outputFrame */

test('the joined frame follows the first clip by default', () => {
  const a = clipFixture({ id: 1 });
  const b = clipFixture({ id: 2 });
  b.source = { width: 1920, height: 1080 };
  assert.deepEqual(outputFrame([a, b]), { width: 640, height: 480 });
});

test('the largest clip can be asked for instead', () => {
  const a = clipFixture({ id: 1 });
  const b = clipFixture({ id: 2 });
  b.source = { width: 1920, height: 1080 };
  assert.deepEqual(outputFrame([a, b], 'largest'), { width: 1920, height: 1080 });
});

test('the joined frame is always even, because H.264 has no odd sides', () => {
  const a = clipFixture({ id: 1 });
  a.source = { width: 641, height: 481 };
  assert.deepEqual(outputFrame([a]), { width: 640, height: 480 });
});

/* ---------------------------------------------------------------- fittedBox */

test('a clip of the output shape fills it exactly', () => {
  const box = fittedBox({ displayWidth: 640, displayHeight: 480, frame: { width: 1280, height: 960 } });
  assert.deepEqual(box, { width: 1280, height: 960, left: 0, top: 0, fits: true });
});

test('a portrait clip in a landscape frame gets bars, not a stretch', () => {
  const box = fittedBox({
    displayWidth: 1080, displayHeight: 1920, frame: { width: 1920, height: 1080 },
  });
  assert.equal(box.height, 1080);
  assert.equal(box.width, 608);
  assert.equal(box.top, 0);
  assert.ok(box.left > 0);
  assert.equal(box.fits, false);
  // The shape survives: 1080/1920 and 608/1080 are the same ratio to a pixel.
  assert.ok(Math.abs(box.width / box.height - 1080 / 1920) < 0.005);
});

/* ---------------------------------------------------------------- joinByCopy */

test('joining two clips writes every sample of both', async () => {
  const entry = videoEntry();
  const clips = [clipFixture({ id: 1, entry }), clipFixture({ id: 2, entry })];
  const result = await joinByCopy({ clips, keepAudio: false });

  assert.equal(result.frames, 60);
  assert.equal(result.clips, 2);
  assert.equal(result.extension, 'mp4');

  const bytes = await blobBytes(result.blob);
  assert.equal(readStsz(find(bytes, 'stsz')).length, 60);
});

test('the second clip follows the first with no gap and no overlap', async () => {
  const entry = videoEntry();
  const clips = [clipFixture({ id: 1, entry }), clipFixture({ id: 2, entry })];
  const bytes = await blobBytes((await joinByCopy({ clips, keepAudio: false })).blob);

  // Thirty frames at 30 fps on a 90000 clock is one second, twice: one run of
  // sixty identical durations, with nothing special happening at the seam.
  assert.deepEqual(readStts(find(bytes, 'stts')), [{ count: 60, delta: 3000 }]);
});

test('a clip on another clock is rescaled onto the output clock', async () => {
  const entry = videoEntry();
  const clips = [
    clipFixture({ id: 1, entry, timescale: 90000 }),
    clipFixture({ id: 2, entry, timescale: 30000 }),
  ];
  const bytes = await blobBytes((await joinByCopy({ clips, keepAudio: false })).blob);

  // 1/30 s is 3000 ticks at 90000 and 1000 at 30000. Rescaled, both are 3000,
  // so the run-length table collapses to one entry.
  assert.deepEqual(readStts(find(bytes, 'stts')), [{ count: 60, delta: 3000 }]);
});

test('the samples reach mdat in the order the clips were given', async () => {
  const entry = videoEntry();
  const clips = [clipFixture({ id: 1, entry }), clipFixture({ id: 2, entry })];
  const bytes = await blobBytes((await joinByCopy({ clips, keepAudio: false })).blob);

  const mdat = find(bytes, 'mdat');
  const data = bytes.subarray(mdat.body, mdat.end);
  // Clip 1 wrote (100 + i) & 0xff; clip 2 wrote (200 + i) & 0xff.
  assert.equal(data[0], 100);
  assert.equal(data[30 * 8], (200) & 0xff);
});

test('reordering the clips reorders the file', async () => {
  const entry = videoEntry();
  const a = clipFixture({ id: 1, entry });
  const b = clipFixture({ id: 2, entry });
  const bytes = await blobBytes((await joinByCopy({ clips: [b, a], keepAudio: false })).blob);

  const mdat = find(bytes, 'mdat');
  assert.equal(bytes.subarray(mdat.body, mdat.end)[0], 200 & 0xff);
});

test('each clip contributes its own edit, so the joined file plays what was marked', async () => {
  const entry = videoEntry();
  const clips = [clipFixture({ id: 1, entry }), clipFixture({ id: 2, entry })];
  clips[0].ranges = [{ start: 0.2, end: 0.7 }];
  clips[1].ranges = [{ start: 0.1, end: 0.6 }];

  const bytes = await blobBytes((await joinByCopy({ clips, keepAudio: false })).blob);
  const edits = readElst(find(bytes, 'elst'));

  assert.equal(edits.length, 2);
  assert.equal(edits[0].duration, 500);
  assert.equal(edits[1].duration, 500);
  // The first section starts 0.2 s in, from the keyframe at 0: 0.2 * 90000.
  assert.equal(edits[0].mediaTime, 18000);
  // The second starts after the first clip's kept run, plus its own 0.1 s.
  assert.ok(edits[1].mediaTime > edits[0].mediaTime);
});

test('taking a piece out of one clip of a join gives that clip two edits', async () => {
  const entry = videoEntry();
  const clips = [clipFixture({ id: 1, entry }), clipFixture({ id: 2, entry })];
  clips[0].ranges = [{ start: 0, end: 0.3 }, { start: 0.6, end: 1 }];

  const bytes = await blobBytes((await joinByCopy({ clips, keepAudio: false })).blob);
  assert.equal(readElst(find(bytes, 'elst')).length, 3);
});

test('the sound of both clips is carried across too', async () => {
  const entry = videoEntry();
  const soundEntry = audioEntry();
  const sound = { rate: 48000, entry: soundEntry };
  const clips = [
    clipFixture({ id: 1, entry, sound }),
    clipFixture({ id: 2, entry, sound }),
  ];

  const result = await joinByCopy({ clips, keepAudio: true });
  const bytes = await blobBytes(result.blob);

  // Two tracks now, so two of every table.
  assert.equal(findAll(bytes, 'stsz').length, 2);
  const [videoSizes, audioSizes] = findAll(bytes, 'stsz').map(readStsz);
  assert.equal(videoSizes.length, 60);
  assert.ok(audioSizes.length > 0);
  assert.ok(audioSizes.every((size) => size === 4));
});

test('a join drops the sound when one clip has none, rather than going quiet partway', async () => {
  const entry = videoEntry();
  const clips = [
    clipFixture({ id: 1, entry, sound: { rate: 48000 } }),
    clipFixture({ id: 2, entry }),
  ];

  const bytes = await blobBytes((await joinByCopy({ clips, keepAudio: true })).blob);
  assert.equal(findAll(bytes, 'stsz').length, 1);
});

test('a clip with nothing selected is left out of the join', async () => {
  const entry = videoEntry();
  const clips = [clipFixture({ id: 1, entry }), clipFixture({ id: 2, entry })];
  clips[1].ranges = [];

  const result = await joinByCopy({ clips, keepAudio: false });
  assert.equal(result.clips, 1);
  assert.equal(result.frames, 30);
});

test('joining nothing is an error, not an empty file', async () => {
  await assert.rejects(
    () => joinByCopy({ clips: [{ ...clipFixture({ id: 1 }), ranges: [] }], keepAudio: false }),
    /^Error: nothing\.selected$/,
  );
});

test('one clip through the join is still a plain trim', async () => {
  const clips = [clipFixture({ id: 1 })];
  clips[0].ranges = [{ start: 0.2, end: 0.8 }];

  const bytes = await blobBytes((await joinByCopy({ clips, keepAudio: false })).blob);
  const edits = readElst(find(bytes, 'elst'));
  assert.equal(edits.length, 1);
  assert.equal(edits[0].duration, 600);
});

/* -------------------------------------------------------- estimateJoinCopy */

test('the estimate adds every clip up', () => {
  const entry = videoEntry();
  const clips = [clipFixture({ id: 1, entry }), clipFixture({ id: 2, entry })];
  const estimate = estimateJoinCopy(clips, false);
  assert.equal(estimate.frames, 60);
  assert.ok(estimate.bytes > 0);
});

test('the estimate skips a clip with nothing selected', () => {
  const entry = videoEntry();
  const clips = [clipFixture({ id: 1, entry }), clipFixture({ id: 2, entry })];
  clips[1].ranges = [];
  assert.equal(estimateJoinCopy(clips, false).frames, 30);
});

/* ---------------------------------------------------- the audio description */

test('an mp4a entry written here reads back as what went into it', () => {
  const asc = new Uint8Array([0x11, 0x90]);   // AAC-LC, 48 kHz, stereo
  const entry = mp4aSampleEntry({ channels: 2, sampleRate: 48000, asc });

  const config = audioDecoderConfig({
    sampleEntry: entry, entryType: 'mp4a', sampleRate: 48000, channels: 2,
  });

  assert.ok(config);
  assert.equal(config.codec, 'mp4a.40.2');
  assert.deepEqual([...config.description], [...asc]);
  assert.equal(config.sampleRate, 48000);
  assert.equal(config.numberOfChannels, 2);
});

test('a longer configuration survives the round trip too', () => {
  const asc = new Uint8Array([0x12, 0x10, 0x56, 0xe5, 0x00]);
  const entry = mp4aSampleEntry({ channels: 1, sampleRate: 44100, asc });
  const config = audioDecoderConfig({
    sampleEntry: entry, entryType: 'mp4a', sampleRate: 44100, channels: 1,
  });
  assert.deepEqual([...config.description], [...asc]);
});

test('the written entry says mp4a and carries an esds', () => {
  const entry = mp4aSampleEntry({
    channels: 2, sampleRate: 48000, asc: new Uint8Array([0x11, 0x90]),
  });
  const types = boxesOf(entry).map((box) => box.type);
  assert.deepEqual(types.slice(0, 1), ['mp4a']);
  assert.ok(entry.length > 36);
});

test('sound that is not AAC is refused rather than guessed at', () => {
  assert.equal(audioDecoderConfig({
    sampleEntry: audioEntry(), entryType: 'mp4a', sampleRate: 48000, channels: 2,
  }), null);
  assert.equal(audioDecoderConfig({
    sampleEntry: audioEntry(), entryType: 'Opus', sampleRate: 48000, channels: 2,
  }), null);
  assert.equal(audioDecoderConfig(null), null);
});
