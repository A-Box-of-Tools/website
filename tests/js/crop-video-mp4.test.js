/**
 * tools/crop-video/src/mp4.js - the second hand-written MP4 writer.
 *
 * This one has to carry the sound that arrived with the file, so it interleaves
 * two tracks into chunks and writes a chunk offset table for each. Two things
 * are worth pinning down:
 *
 *   - Frame durations are worked out from the gap to the next frame rather than
 *     at capture time, which is what keeps a variable frame rate intact: a
 *     phone that dropped from 30 to 24 fps halfway through is written back with
 *     exactly the frame times it had.
 *   - Audio samples and the sample entry describing them are copied verbatim.
 *     Nothing decodes them, which is why "keep the sound" costs no quality, and
 *     the test for it is that the bytes come out the other end unchanged.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { Mp4Writer, VIDEO_TIMESCALE } from '../../tools/crop-video/src/mp4.js';
import { ascii, blobBytes } from './helpers.js';

const AVCC = new Uint8Array([1, 0x64, 0, 0x1f, 0xff, 0xe1, 0, 4, 0x67, 1, 2, 3, 1, 0, 4, 0x68, 1, 2, 3]);
const AUDIO_ENTRY = ascii('mp4a-sample-entry-copied-verbatim');

function boxes(bytes) {
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

function countBoxes(bytes, type) {
  const name = ascii(type);
  let seen = 0;
  outer: for (let i = 0; i + 4 <= bytes.length; i += 1) {
    for (let j = 0; j < 4; j += 1) if (bytes[i + j] !== name[j]) continue outer;
    seen += 1;
  }
  return seen;
}

function indexOfBytes(haystack, needle, from = 0) {
  outer: for (let i = from; i + needle.length <= haystack.length; i += 1) {
    for (let j = 0; j < needle.length; j += 1) {
      if (haystack[i + j] !== needle[j]) continue outer;
    }
    return i;
  }
  return -1;
}

/** A writer with `frames` video samples, one every 1/30 second. */
function videoOnly(frames = 4, step = VIDEO_TIMESCALE / 30) {
  const writer = new Mp4Writer({ width: 320, height: 240 });
  writer.setDecoderConfig(AVCC);
  for (let i = 0; i < frames; i += 1) {
    writer.addVideoSample(ascii(`v${i}`), i === 0, i * step);
  }
  return writer;
}

test('the top-level boxes, in faststart order', async () => {
  const bytes = await blobBytes(videoOnly().finalize());
  assert.deepEqual(boxes(bytes).map((b) => b.type), ['ftyp', 'moov', 'mdat']);
});

test('the box sizes cover the whole file', async () => {
  const bytes = await blobBytes(videoOnly().finalize());
  assert.equal(boxes(bytes).reduce((n, b) => n + b.size, 0), bytes.length);
});

test('video only writes one track', async () => {
  const bytes = await blobBytes(videoOnly().finalize());
  assert.equal(countBoxes(bytes, 'trak'), 1);
});

test('durations come from the gaps between frames', () => {
  const writer = videoOnly(4);
  writer.finalize();
  const step = Math.round(VIDEO_TIMESCALE / 30);
  assert.deepEqual(writer.video.samples.map((s) => s.duration),
    [step, step, step, step]);
});

test('a variable frame rate is written back as it arrived', () => {
  // 30 fps, then 24 fps halfway through.
  const fast = Math.round(VIDEO_TIMESCALE / 30);
  const slow = Math.round(VIDEO_TIMESCALE / 24);
  const writer = new Mp4Writer({ width: 16, height: 16 });
  writer.setDecoderConfig(AVCC);
  let at = 0;
  for (const gap of [fast, fast, slow, slow]) {
    writer.addVideoSample(ascii('f'), at === 0, at);
    at += gap;
  }
  writer.addVideoSample(ascii('f'), false, at);
  writer.finalize();

  const durations = writer.video.samples.map((s) => s.duration);
  assert.deepEqual(durations.slice(0, 4), [fast, fast, slow, slow]);
  // The last frame is held for as long as the one before it.
  assert.equal(durations[4], slow);
});

test('a single frame is held for a thirtieth of a second', () => {
  const writer = videoOnly(1);
  writer.finalize();
  assert.equal(writer.video.samples[0].duration, Math.round(VIDEO_TIMESCALE / 30));
});

test('samples arriving out of order are sorted by time', () => {
  const writer = new Mp4Writer({ width: 16, height: 16 });
  writer.setDecoderConfig(AVCC);
  const step = VIDEO_TIMESCALE / 30;
  writer.addVideoSample(ascii('b'), false, step * 2);
  writer.addVideoSample(ascii('a'), true, 0);
  writer.addVideoSample(ascii('c'), false, step * 4);
  writer.finalize();
  assert.deepEqual(writer.video.samples.map((s) => new TextDecoder().decode(s.data)),
    ['a', 'b', 'c']);
});

test('the frame data reaches mdat in order', async () => {
  const bytes = await blobBytes(videoOnly(4).finalize());
  const mdat = boxes(bytes).find((b) => b.type === 'mdat');
  const body = new TextDecoder('latin1').decode(bytes.subarray(mdat.at + 8));
  assert.equal(body, 'v0v1v2v3');
});

test('mdat declares the size of what follows it', async () => {
  const bytes = await blobBytes(videoOnly(4).finalize());
  const mdat = boxes(bytes).find((b) => b.type === 'mdat');
  assert.equal(mdat.size, 8 + 'v0v1v2v3'.length);
  assert.equal(mdat.at + mdat.size, bytes.length);
});

test('sound is carried across untouched', async () => {
  const writer = videoOnly(4);
  writer.openAudioTrack({ sampleEntry: AUDIO_ENTRY, timescale: 48000 });
  for (let i = 0; i < 3; i += 1) {
    writer.addAudioSample(ascii(`a${i}`), i * 1024, 1024);
  }
  const bytes = await blobBytes(writer.finalize());

  assert.equal(countBoxes(bytes, 'trak'), 2, 'video and audio');
  // The sample entry is copied verbatim: nothing here parses it.
  assert.ok(indexOfBytes(bytes, AUDIO_ENTRY) > 0);
  for (let i = 0; i < 3; i += 1) {
    assert.ok(indexOfBytes(bytes, ascii(`a${i}`)) > 0, `audio sample ${i}`);
  }
});

test('an audio track with no samples in it is not written', async () => {
  const writer = videoOnly(2);
  writer.openAudioTrack({ sampleEntry: AUDIO_ENTRY, timescale: 48000 });
  const bytes = await blobBytes(writer.finalize());
  assert.equal(countBoxes(bytes, 'trak'), 1);
});

test('every chunk offset lands inside mdat', async () => {
  // stco holds absolute file offsets that depend on how large moov is, which
  // is only known once moov has been built. Two passes have to converge.
  const writer = videoOnly(60);
  writer.openAudioTrack({ sampleEntry: AUDIO_ENTRY, timescale: 48000 });
  for (let i = 0; i < 90; i += 1) writer.addAudioSample(ascii(`aud${i}`), i * 1024, 1024);
  const bytes = await blobBytes(writer.finalize());

  const mdat = boxes(bytes).find((b) => b.type === 'mdat');
  const view = new DataView(bytes.buffer);
  const name = ascii('stco');

  let tables = 0;
  outer: for (let i = 0; i + 4 <= bytes.length; i += 1) {
    for (let j = 0; j < 4; j += 1) if (bytes[i + j] !== name[j]) continue outer;
    const box = i - 4;
    const count = view.getUint32(box + 12);
    assert.ok(count > 0, 'a chunk offset table with nothing in it');
    for (let n = 0; n < count; n += 1) {
      const offset = view.getUint32(box + 16 + n * 4);
      assert.ok(offset >= mdat.at + 8, `offset ${offset} before mdat`);
      assert.ok(offset < bytes.length, `offset ${offset} past the end`);
    }
    tables += 1;
  }
  assert.equal(tables, 2, 'one chunk offset table per track');
});

test('the two tracks are interleaved rather than written end to end', async () => {
  // A player should not have to hold the whole video to reach the first of the
  // sound.
  const writer = new Mp4Writer({ width: 16, height: 16 });
  writer.setDecoderConfig(AVCC);
  writer.openAudioTrack({ sampleEntry: AUDIO_ENTRY, timescale: 48000 });
  for (let i = 0; i < 120; i += 1) {
    writer.addVideoSample(ascii(`V${String(i).padStart(3, '0')}`), i === 0, (i * VIDEO_TIMESCALE) / 30);
    writer.addAudioSample(ascii(`A${String(i).padStart(3, '0')}`), (i * 48000) / 30, 48000 / 30);
  }
  const bytes = await blobBytes(writer.finalize());
  const mdat = boxes(bytes).find((b) => b.type === 'mdat');

  const firstAudio = indexOfBytes(bytes, ascii('A000'), mdat.at);
  const lastVideo = indexOfBytes(bytes, ascii('V119'), mdat.at);
  assert.ok(firstAudio > 0 && lastVideo > 0);
  assert.ok(firstAudio < lastVideo, 'sound arrives before the last frame');
});

test('the decoder configuration is accepted in every shape', () => {
  const asView = new Mp4Writer({ width: 16, height: 16 });
  asView.setDecoderConfig(AVCC);
  assert.deepEqual(asView.avcC, AVCC);

  const asBuffer = new Mp4Writer({ width: 16, height: 16 });
  asBuffer.setDecoderConfig(AVCC.buffer.slice(0));
  assert.deepEqual(asBuffer.avcC, AVCC);

  const backing = new Uint8Array([9, 9, ...AVCC, 9]);
  const asSlice = new Mp4Writer({ width: 16, height: 16 });
  asSlice.setDecoderConfig(backing.subarray(2, 2 + AVCC.length));
  assert.deepEqual(asSlice.avcC, AVCC);
});

test('the first decoder configuration wins', () => {
  const writer = new Mp4Writer({ width: 16, height: 16 });
  writer.setDecoderConfig(AVCC);
  writer.setDecoderConfig(new Uint8Array([9, 9, 9]));
  assert.deepEqual(writer.avcC, AVCC);
});

// The writer ships in fifteen languages, so it refuses with a phrase key and
// the page turns that into a sentence.
test('refusals rather than a broken file', () => {
  assert.throws(() => new Mp4Writer({ width: 16, height: 16 }).setDecoderConfig(null),
    { message: 'mp4.noconfig' });

  const noFrames = new Mp4Writer({ width: 16, height: 16 });
  noFrames.setDecoderConfig(AVCC);
  assert.throws(() => noFrames.finalize(), { message: 'mp4.noframes' });

  const noConfig = new Mp4Writer({ width: 16, height: 16 });
  noConfig.addVideoSample(ascii('v'), true, 0);
  assert.throws(() => noConfig.finalize(), { message: 'mp4.noconfig' });
});

test('the blob is typed as an mp4', () => {
  assert.equal(videoOnly().finalize().type, 'video/mp4');
});
