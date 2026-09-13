/**
 * shared/js/mkv-reader.js and shared/js/mkv-writer.js - the Matroska pair.
 *
 * The reader is what lets the MP4 converter take a WebM or an MKV, and it is
 * shown files the writer made: the writer is pinned to the bytes the
 * specification says first, so that a round trip proves the reader and not
 * merely that the two agree with each other. Then the shapes real files come
 * in - a recorder's unknown sizes, a ripper's laced audio and BlockGroups,
 * an encoder's B-frames stored out of order - each become one file and one
 * assertion about the list of samples that comes back.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  decodeTimes, demuxMatroska, isMatroska,
} from '../../shared/js/mkv-reader.js';
import { UnsupportedFile } from '../../shared/js/mp4-reader.js';
import {
  ID, MkvWriter, element, signedVint, uint, vint,
} from '../../shared/js/mkv-writer.js';

const bytesOf = (text) => new TextEncoder().encode(text);
const asFile = (blob) => blob;

/** A frame of a given size whose bytes say which frame it is. */
function frame(tag, size) {
  const out = new Uint8Array(size);
  const label = bytesOf(tag);
  out.set(label.subarray(0, Math.min(size, label.length)));
  for (let i = label.length; i < size; i += 1) out[i] = (i * 7 + tag.length) & 0xff;
  return out;
}

async function sliceOf(file, sample) {
  return new Uint8Array(await file.slice(sample.offset, sample.offset + sample.size).arrayBuffer());
}

/** The clip most tests use: four VP8 frames at 25 fps and five Opus packets at 20 ms. */
function clip(options = {}) {
  const writer = new MkvWriter(options);
  const video = writer.addVideoTrack({
    codecId: 'V_VP8', width: 640, height: 360, defaultDuration: 40_000_000,
  });
  const audio = writer.addAudioTrack({
    codecId: 'A_OPUS', codecPrivate: bytesOf('OpusHead'), sampleRate: 48000, channels: 2,
  });
  const frames = {
    video: [frame('v0', 900), frame('v1', 300), frame('v2', 310), frame('v3', 950)],
    audio: [frame('a0', 100), frame('a1', 101), frame('a2', 102), frame('a3', 103), frame('a4', 104)],
  };
  writer.addBlock(video, { time: 0, isKey: true, data: frames.video[0] });
  writer.addBlock(audio, { time: 0, data: frames.audio[0] });
  writer.addBlock(audio, { time: 20, data: frames.audio[1] });
  writer.addBlock(video, { time: 40, isKey: false, data: frames.video[1] });
  writer.addBlock(audio, { time: 40, data: frames.audio[2] });
  writer.addBlock(audio, { time: 60, data: frames.audio[3] });
  writer.addBlock(video, { time: 80, isKey: false, data: frames.video[2] });
  writer.addBlock(audio, { time: 80, data: frames.audio[4] });
  writer.addBlock(video, { time: 120, isKey: true, data: frames.video[3] });
  return { writer, frames };
}

/* ------------------------------------------------------------------ bytes */

test('sizes are written as the shortest vint, and all-ones is stepped over', () => {
  assert.deepEqual([...vint(0)], [0x80]);
  assert.deepEqual([...vint(126)], [0xfe]);
  // 127 would be 0xff, which means "unknown", so it takes two bytes.
  assert.deepEqual([...vint(127)], [0x40, 0x7f]);
  assert.deepEqual([...vint(300)], [0x41, 0x2c]);
  assert.deepEqual([...vint(2 ** 14 - 2)], [0x7f, 0xfe]);
  assert.deepEqual([...vint(2 ** 14 - 1)], [0x20, 0x3f, 0xff]);

  // EBML lacing's signed form: the value plus 63 in one byte.
  assert.deepEqual([...signedVint(0)], [0xbf]);
  assert.deepEqual([...signedVint(-1)], [0xbe]);
  assert.deepEqual([...signedVint(63)], [0xfe]);
  assert.deepEqual([...signedVint(64)], [0x60, 0x3f]);   // 64 + 8191 in two bytes
});

test('an element is its id, its size and its payload, and an integer is as short as it can be', () => {
  assert.deepEqual([...uint(ID.TrackNumber, 1)], [0xd7, 0x81, 0x01]);
  assert.deepEqual([...uint(ID.TimestampScale, 1_000_000)], [0x2a, 0xd7, 0xb1, 0x83, 0x0f, 0x42, 0x40]);
  assert.deepEqual([...element(ID.Cluster, new Uint8Array(0), { unknown: true })],
    [0x1f, 0x43, 0xb6, 0x75, 0xff]);
  assert.deepEqual([...element(ID.Segment, new Uint8Array(0), { unknown: true, wide: true })],
    [0x18, 0x53, 0x80, 0x67, 0x01, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
});

test('a file starts with the EBML magic, and only such a file is taken for one', async () => {
  const { writer } = clip();
  const file = asFile(writer.finalize());
  assert.equal(await isMatroska(file), true);
  const bytes = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  assert.deepEqual([...bytes], [0x1a, 0x45, 0xdf, 0xa3]);

  assert.equal(await isMatroska(new Blob([bytesOf('RIFF....WEBP')])), false);
  await assert.rejects(demuxMatroska(new Blob([bytesOf('\0\0\0\x18ftypisom')])),
    (error) => error instanceof UnsupportedFile && error.message === 'read.notmkv');
});

/* -------------------------------------------------------------- round trip */

test('every frame comes back where it is, when it is, and whether it is a keyframe', async () => {
  const { writer, frames } = clip();
  const file = asFile(writer.finalize());
  const media = await demuxMatroska(file);

  assert.equal(media.video.codec, 'vp8');
  assert.equal(media.video.description, null);
  assert.equal(media.video.codedWidth, 640);
  assert.equal(media.video.codedHeight, 360);
  assert.equal(media.video.displayWidth, 640);
  assert.equal(media.video.rotation, 0);
  assert.equal(media.video.timescale, 1000);

  const video = media.video.samples;
  assert.equal(video.length, 4);
  assert.deepEqual(video.map((s) => s.pts), [0, 40, 80, 120]);
  assert.deepEqual(video.map((s) => s.dts), [0, 40, 80, 120]);
  assert.deepEqual(video.map((s) => s.isKey), [true, false, false, true]);
  assert.deepEqual(video.map((s) => s.size), [900, 300, 310, 950]);
  for (let i = 0; i < 4; i += 1) {
    assert.deepEqual(await sliceOf(file, video[i]), frames.video[i], `video frame ${i}`);
  }

  assert.equal(media.audio.codec, 'opus');
  assert.deepEqual(media.audio.description, bytesOf('OpusHead'));
  assert.equal(media.audio.sampleRate, 48000);
  assert.equal(media.audio.channels, 2);
  assert.equal(media.audio.aac, false);
  const audio = media.audio.samples;
  assert.deepEqual(audio.map((s) => s.pts), [0, 20, 40, 60, 80]);
  assert.ok(audio.every((s) => s.isKey), 'sound is all keyframes');
  for (let i = 0; i < 5; i += 1) {
    assert.deepEqual(await sliceOf(file, audio[i]), frames.audio[i], `audio packet ${i}`);
  }

  // The last video frame lasts a default duration, and the file says so.
  assert.equal(media.video.duration, 160);
  assert.equal(media.duration, 0.16);
});

test('a recording with unknown sizes and no declared duration reads the same', async () => {
  const { writer, frames } = clip({ live: true });
  const bytes = writer.bytes();

  // The Segment's size is the eight-byte unknown, and each Cluster's the one-byte.
  const segmentAt = [...bytes].findIndex((b, i) => b === 0x18 && bytes[i + 1] === 0x53 && bytes[i + 2] === 0x80 && bytes[i + 3] === 0x67);
  assert.deepEqual([...bytes.subarray(segmentAt + 4, segmentAt + 12)], [0x01, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
  const clusterAt = [...bytes].findIndex((b, i) => b === 0x1f && bytes[i + 1] === 0x43 && bytes[i + 2] === 0xb6 && bytes[i + 3] === 0x75);
  assert.equal(bytes[clusterAt + 4], 0xff);

  const file = new Blob([bytes]);
  const media = await demuxMatroska(file);
  assert.deepEqual(media.video.samples.map((s) => s.pts), [0, 40, 80, 120]);
  assert.deepEqual(media.audio.samples.map((s) => s.pts), [0, 20, 40, 60, 80]);
  assert.deepEqual(await sliceOf(file, media.video.samples[3]), frames.video[3]);
  // Two clusters (the last frame is a keyframe), both of unknown size, the
  // second ending the first. The duration comes from the frames.
  assert.equal(media.duration, 0.16);
});

test('elements it has no use for are stepped over, wherever they sit', async () => {
  const { writer } = clip();
  writer.leading = [
    element(ID.SeekHead, new Uint8Array(12)),
    element(ID.Void, new Uint8Array(40)),
  ];
  writer.trailing = [
    element(ID.Cues, new Uint8Array(9)),
    element(ID.Tags, new Uint8Array(3)),
  ];
  const media = await demuxMatroska(asFile(writer.finalize()));
  assert.equal(media.video.samples.length, 4);
  assert.equal(media.audio.samples.length, 5);
});

/* ------------------------------------------------------------------ lacing */

for (const lacing of ['xiph', 'ebml', 'fixed']) {
  test(`${lacing}-laced blocks come apart into one sample a frame`, async () => {
    const writer = new MkvWriter();
    const video = writer.addVideoTrack({ codecId: 'V_VP8', width: 64, height: 48, defaultDuration: 40_000_000 });
    const audio = writer.addAudioTrack({
      codecId: 'A_VORBIS', codecPrivate: bytesOf('xiph'), sampleRate: 44100, channels: 2,
      defaultDuration: 20_000_000,
    });
    const sizes = lacing === 'fixed' ? [90, 90, 90] : [300, 40, 261];
    const packets = sizes.map((size, i) => frame(`p${i}`, size));
    writer.addBlock(video, { time: 0, isKey: true, data: frame('v', 50) });
    writer.addBlock(audio, { time: 0, frames: packets, lacing });
    writer.addBlock(audio, { time: 60, frames: packets.map((p) => p.slice()), lacing });
    const file = asFile(writer.finalize());

    const media = await demuxMatroska(file);
    const samples = media.audio.samples;
    assert.equal(samples.length, 6);
    assert.deepEqual(samples.map((s) => s.pts), [0, 20, 40, 60, 80, 100]);
    assert.deepEqual(samples.map((s) => s.size), [...sizes, ...sizes]);
    for (let i = 0; i < 6; i += 1) {
      assert.deepEqual(await sliceOf(file, samples[i]), packets[i % 3], `packet ${i}`);
    }
    assert.equal(media.audio.codec, 'vorbis');
  });
}

test('laced frames on a track with no default duration share the gap to the next block evenly', async () => {
  const writer = new MkvWriter();
  const video = writer.addVideoTrack({ codecId: 'V_VP8', width: 64, height: 48 });
  const audio = writer.addAudioTrack({ codecId: 'A_OPUS', sampleRate: 48000, channels: 1 });
  writer.addBlock(video, { time: 0, isKey: true, data: frame('v', 50) });
  writer.addBlock(audio, { time: 0, frames: [frame('a', 10), frame('b', 11), frame('c', 12), frame('d', 13)], lacing: 'ebml' });
  writer.addBlock(audio, { time: 80, data: frame('e', 14) });
  const media = await demuxMatroska(asFile(writer.finalize()));
  assert.deepEqual(media.audio.samples.map((s) => s.pts), [0, 20, 40, 60, 80]);
});

/* ------------------------------------------------------------- BlockGroup */

test('a Block in a group is a keyframe when nothing refers back, and not otherwise', async () => {
  const writer = new MkvWriter();
  const video = writer.addVideoTrack({ codecId: 'V_VP9', width: 64, height: 48, defaultDuration: 40_000_000 });
  writer.addBlock(video, { time: 0, isKey: true, data: frame('k', 60), group: { duration: 40 } });
  writer.addBlock(video, { time: 40, isKey: false, data: frame('d', 20), group: { duration: 40 } });
  writer.addBlock(video, { time: 80, isKey: false, data: frame('e', 21), group: {} });
  writer.addBlock(video, { time: 120, isKey: true, data: frame('K', 61), group: {} });
  const file = asFile(writer.finalize());
  const media = await demuxMatroska(file);
  assert.deepEqual(media.video.samples.map((s) => s.isKey), [true, false, false, true]);
  assert.deepEqual(media.video.samples.map((s) => s.size), [60, 20, 21, 61]);
  assert.deepEqual(await sliceOf(file, media.video.samples[1]), frame('d', 20));
  assert.equal(media.video.codec, 'vp09.00.10.08');
  assert.equal(media.audio, null);
});

/* ---------------------------------------------------------------- codecs */

test('H.264 keeps its avcC as the description and takes its codec string from it', async () => {
  const avcC = new Uint8Array([1, 0x64, 0x00, 0x28, 0xff, 0xe1, 0, 0]);
  const writer = new MkvWriter({ docType: 'matroska' });
  const video = writer.addVideoTrack({
    codecId: 'V_MPEG4/ISO/AVC', codecPrivate: avcC, width: 1920, height: 1080, defaultDuration: 40_000_000,
  });
  // B-frames: stored in decode order, timed in presentation order.
  const order = [[0, true], [120, false], [40, false], [80, false], [240, false], [160, false], [200, false]];
  for (const [time, isKey] of order) writer.addBlock(video, { time, isKey, data: frame(`f${time}`, 30) });
  const media = await demuxMatroska(asFile(writer.finalize()));

  assert.equal(media.video.codec, 'avc1.640028');
  assert.deepEqual(media.video.description, avcC);
  assert.deepEqual(media.video.samples.map((s) => s.pts), [0, 120, 40, 80, 240, 160, 200]);
  assert.deepEqual(media.video.samples.map((s) => s.dts), [-40, 0, 40, 80, 120, 160, 200]);
  for (const sample of media.video.samples) assert.ok(sample.dts <= sample.pts);
  assert.equal(media.video.duration, 280);
});

test('decode times never run ahead of a frame, and are the presentation times when nothing is reordered', () => {
  assert.deepEqual(decodeTimes([0, 3, 1, 2, 6, 4, 5]), [-1, 0, 1, 2, 3, 4, 5]);
  assert.deepEqual(decodeTimes([0, 1, 2, 3]), [0, 1, 2, 3]);
  assert.deepEqual(decodeTimes([]), []);
  const pts = [0, 4, 2, 1, 3, 8, 6, 5, 7];
  const dts = decodeTimes(pts);
  dts.forEach((d, i) => assert.ok(d <= pts[i], `frame ${i}`));
  for (let i = 1; i < dts.length; i += 1) assert.ok(dts[i] > dts[i - 1], 'monotonic');
});

test('HEVC, AV1 and a VP9 with a configuration each get the string the browser wants', async () => {
  const make = async (codecId, codecPrivate) => {
    const writer = new MkvWriter();
    const video = writer.addVideoTrack({ codecId, codecPrivate, width: 64, height: 48 });
    writer.addBlock(video, { time: 0, isKey: true, data: frame('f', 10) });
    return (await demuxMatroska(asFile(writer.finalize()))).video;
  };
  const hvcC = new Uint8Array([1, 0x01, 0x60, 0, 0, 0, 0x90, 0, 0, 0, 0, 0, 93, 0]);
  assert.equal((await make('V_MPEGH/ISO/HEVC', hvcC)).codec, 'hvc1.1.6.L93.90');
  const av1C = new Uint8Array([0x81, 0x08, 0x0c, 0x00]);
  assert.equal((await make('V_AV1', av1C)).codec, 'av01.0.08M.08');
  assert.equal((await make('V_AV1', null)).codec, 'av01.0.08M.08');
  assert.equal((await make('V_VP9', new Uint8Array([1, 1, 2, 2, 1, 31, 3, 1, 10]))).codec, 'vp09.02.31.10');
  assert.equal((await make('V_VP9', null)).codec, 'vp09.00.10.08');
});

test('AAC without a configuration gets one made from the rate and channels', async () => {
  const make = async (codecId, codecPrivate, sampleRate = 48000, channels = 2) => {
    const writer = new MkvWriter();
    const video = writer.addVideoTrack({ codecId: 'V_VP8', width: 64, height: 48 });
    const audio = writer.addAudioTrack({ codecId, codecPrivate, sampleRate, channels });
    writer.addBlock(video, { time: 0, isKey: true, data: frame('f', 10) });
    writer.addBlock(audio, { time: 0, data: frame('a', 10) });
    return (await demuxMatroska(asFile(writer.finalize()))).audio;
  };
  const bare = await make('A_AAC', null);
  assert.equal(bare.codec, 'mp4a.40.2');
  assert.deepEqual([...bare.description], [0x11, 0x90]);   // LC, 48 kHz, stereo
  assert.equal(bare.aac, true);

  const given = await make('A_AAC/MPEG4/LC', new Uint8Array([0x12, 0x10]), 44100, 2);
  assert.equal(given.codec, 'mp4a.40.2');
  assert.deepEqual([...given.description], [0x12, 0x10]);

  const he = await make('A_AAC', new Uint8Array([0x2b, 0x92, 0x08, 0x00]), 44100, 2);
  assert.equal(he.codec, 'mp4a.40.5');

  const mp3 = await make('A_MPEG/L3', null, 44100, 2);
  assert.equal(mp3.codec, 'mp3');
  assert.equal(mp3.aac, false);

  const pcm = await make('A_PCM/INT/LIT', null, 44100, 2);
  assert.equal(pcm.codec, null);
  assert.equal(pcm.codecId, 'A_PCM/INT/LIT');
});

test('a display size in pixels is honoured; a coded size stands otherwise', async () => {
  const writer = new MkvWriter();
  const video = writer.addVideoTrack({
    codecId: 'V_VP8', width: 720, height: 576, displayWidth: 1024, displayHeight: 576,
  });
  writer.addBlock(video, { time: 0, isKey: true, data: frame('f', 10) });
  const media = await demuxMatroska(asFile(writer.finalize()));
  assert.equal(media.video.codedWidth, 720);
  assert.equal(media.video.displayWidth, 1024);
  assert.equal(media.video.displayHeight, 576);
});

/* -------------------------------------------------------------- refusals */

test('what it cannot read is refused by name', async () => {
  const refused = async (build, key) => {
    const writer = new MkvWriter();
    build(writer);
    await assert.rejects(demuxMatroska(asFile(writer.finalize())),
      (error) => error instanceof UnsupportedFile && error.message === key, key);
  };

  await refused((w) => {
    const v = w.addVideoTrack({ codecId: 'V_MS/VFW/FOURCC', width: 64, height: 48 });
    w.addBlock(v, { time: 0, data: frame('f', 4) });
  }, 'read.mkvcodec');

  await refused((w) => {
    const v = w.addVideoTrack({ codecId: 'V_MPEG4/ISO/AVC', width: 64, height: 48 });
    w.addBlock(v, { time: 0, data: frame('f', 4) });
  }, 'read.noconfig');

  await refused((w) => {
    const v = w.addVideoTrack({
      codecId: 'V_VP8', width: 64, height: 48, extra: [element(ID.ContentEncodings, new Uint8Array(4))],
    });
    w.addBlock(v, { time: 0, data: frame('f', 4) });
  }, 'read.mkvencoded');

  await refused((w) => {
    w.addAudioTrack({ codecId: 'A_OPUS', sampleRate: 48000, channels: 1 });
    w.addBlock(1, { time: 0, data: frame('a', 4) });
  }, 'read.novideo');

  await refused((w) => {
    w.addVideoTrack({ codecId: 'V_VP8', width: 64, height: 48 });
  }, 'read.nosamples');
});
