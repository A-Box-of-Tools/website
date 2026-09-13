/**
 * The decisions behind "convert to MP4", without the codecs.
 *
 * Everything the page says before the button is pressed is decided in
 * plan.js and is pinned here to numbers worked out by hand: which track is
 * copied and which is encoded again, what an encode is asked for, how a
 * copied picture's frames are placed on the new clock, and what the sound
 * of a file looks like whichever reader found it. The codecs are WebCodecs
 * and are checked in a browser; the README says how.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  MAX_BITRATE, closeGaps, compositionShift, containerOf, describeSound, isH264, outputFrame,
  pictureBitrate, pictureJob, rescale, soundJob,
} from '../../tools/convert-to-mp4/src/plan.js';
import {
  bitrateText, codecText, containerText, frameText, outName,
} from '../../tools/convert-to-mp4/src/format.js';
import { mp4aSampleEntry } from '../../shared/js/aac.js';

/* ------------------------------------------------------------- the jobs */

test('H.264 in any spelling is copied; everything else is encoded again', () => {
  assert.equal(isH264('avc1.640028'), true);
  assert.equal(isH264('avc3.42001e'), true);
  assert.equal(isH264('hvc1.1.6.L93.B0'), false);
  assert.equal(isH264('vp09.00.10.08'), false);
  assert.equal(isH264(null), false);

  assert.equal(pictureJob({ codec: 'avc1.4d401f' }), 'copy');
  assert.equal(pictureJob({ codec: 'vp8' }), 'encode');
  assert.equal(pictureJob({ codec: 'av01.0.08M.08' }), 'encode');
});

test('the sound of a Matroska file is copied only when it is AAC', () => {
  const opus = describeSound({
    codec: 'opus', description: new Uint8Array([1, 2, 3]), aac: false,
    channels: 2, sampleRate: 48000, samples: [{}], sampleEntry: null, codecId: 'A_OPUS',
  });
  assert.equal(opus.copyable, false);
  assert.equal(opus.codec, 'opus');
  assert.deepEqual([...opus.description], [1, 2, 3]);
  assert.equal(opus.sampleEntry, null);
  assert.equal(opus.name, 'A_OPUS');
  assert.equal(soundJob(opus), 'encode');
  assert.equal(soundJob(opus, { decodable: false }), 'unknown');

  const aac = describeSound({
    codec: 'mp4a.40.2', description: new Uint8Array([0x11, 0x90]), aac: true,
    channels: 2, sampleRate: 48000, samples: [{}], sampleEntry: null, codecId: 'A_AAC',
  });
  assert.equal(aac.copyable, true);
  assert.ok(aac.sampleEntry.byteLength > 30, 'an mp4a entry was built for it');
  assert.equal(String.fromCharCode(...aac.sampleEntry.subarray(4, 8)), 'mp4a');
  assert.equal(soundJob(aac), 'copy');

  const pcm = describeSound({
    codec: null, description: null, aac: false,
    channels: 2, sampleRate: 48000, samples: [{}], sampleEntry: null, codecId: 'A_PCM/INT/LIT',
  });
  assert.equal(soundJob(pcm), 'unknown');
  assert.equal(pcm.name, 'A_PCM/INT/LIT');

  assert.equal(describeSound(null), null);
  assert.equal(describeSound({ samples: [] }), null);
  assert.equal(soundJob(null), 'none');
});

test('the sound of an MP4 is opened through its sample entry', () => {
  const entry = mp4aSampleEntry({ channels: 2, sampleRate: 44100, asc: new Uint8Array([0x12, 0x10]) });
  const track = {
    sampleEntry: entry, entryType: 'mp4a', channels: 2, sampleRate: 44100,
    timescale: 44100, duration: 44100, samples: [{}],
  };
  const sound = describeSound(track);
  assert.equal(sound.copyable, true);
  assert.equal(sound.sampleEntry, entry, 'the source entry is written back as it is');
  assert.equal(sound.codec, 'mp4a.40.2');
  assert.equal(sound.sampleRate, 44100);
  assert.equal(sound.channels, 2);
  assert.equal(soundJob(sound), 'copy');

  // An entry the AAC helper cannot open is a sound that can only be left out.
  const alac = describeSound({ ...track, sampleEntry: new Uint8Array(40), entryType: 'alac' });
  assert.equal(alac.copyable, false);
  assert.equal(alac.codec, null);
  assert.equal(alac.name, 'alac');
  assert.equal(soundJob(alac), 'unknown');
});

/* ---------------------------------------------------------- the picture */

test('a re-encode is asked for what the source spent, scaled by how the codecs compare', () => {
  const hd = { width: 1920, height: 1080, fps: 30 };
  const pixels = 1920 * 1080 * 30;

  // VP9 at 4 Mbit/s wants about 6.4 in H.264 - between the floor and the ceiling.
  const vp9 = pictureBitrate({ ...hd, codec: 'vp09.00.10.08', sourceBitrate: 4_000_000 });
  assert.equal(vp9, 6_400_000);
  // VP8 packs no tighter than H.264, so it is asked for the same.
  assert.equal(pictureBitrate({ ...hd, codec: 'vp8', sourceBitrate: 4_000_000 }), 4_000_000);
  // HEVC and AV1 are scaled like VP9.
  assert.equal(pictureBitrate({ ...hd, codec: 'hvc1.1.6.L93.B0', sourceBitrate: 4_000_000 }), 6_400_000);
  assert.equal(pictureBitrate({ ...hd, codec: 'av01.0.08M.08', sourceBitrate: 4_000_000 }), 6_400_000);

  // A starved source is lifted to the floor ...
  const floor = Math.round(pixels * 0.06 / 1000) * 1000;
  assert.equal(pictureBitrate({ ...hd, codec: 'vp8', sourceBitrate: 200_000 }), floor);
  assert.equal(pictureBitrate({ ...hd, codec: 'vp8', sourceBitrate: 0 }), floor);
  // ... and a lavish one held to the ceiling.
  const ceiling = Math.round(pixels * 0.25 / 1000) * 1000;
  assert.equal(pictureBitrate({ ...hd, codec: 'vp8', sourceBitrate: 80_000_000 }), ceiling);

  // 4K at 60 has a ceiling past the cap, and the cap wins.
  const uhd = { width: 3840, height: 2160, fps: 60, codec: 'hvc1.1.6.L153.B0', sourceBitrate: 60_000_000 };
  assert.equal(pictureBitrate(uhd), MAX_BITRATE);
});

test('the output frame is the display size, even, and no wider than an encoder takes', () => {
  assert.deepEqual(outputFrame({ displayWidth: 1920, displayHeight: 1080 }), { width: 1920, height: 1080 });
  assert.deepEqual(outputFrame({ displayWidth: 1919, displayHeight: 1081 }), { width: 1918, height: 1080 });
  assert.deepEqual(outputFrame({ displayWidth: 1080, displayHeight: 1920 }), { width: 1080, height: 1920 });
  // 8K is drawn down to 4K on the long edge, keeping its shape.
  assert.deepEqual(outputFrame({ displayWidth: 7680, displayHeight: 4320 }), { width: 3840, height: 2160 });
  assert.deepEqual(outputFrame({ displayWidth: 4320, displayHeight: 7680 }), { width: 2160, height: 3840 });
  assert.deepEqual(outputFrame({ displayWidth: 1, displayHeight: 1 }), { width: 2, height: 2 });
});

/* ------------------------------------------------------------ the clocks */

test('a copied picture with B-frames starts its edit where its first frame is shown', () => {
  // Decode order, on a 1000-tick clock, as the Matroska reader hands them
  // back: the frame shown first is decoded first, the frame shown fourth
  // is decoded second, and the decode clock starts a frame early.
  const samples = [
    { dts: -40, pts: 0 }, { dts: 0, pts: 120 }, { dts: 40, pts: 40 }, { dts: 80, pts: 80 },
  ];
  assert.equal(compositionShift(samples), 40);
  // No B-frames: no shift.
  assert.equal(compositionShift([{ dts: 0, pts: 0 }, { dts: 40, pts: 40 }]), 0);
  assert.equal(compositionShift([]), 0);
  // A track that simply starts late has no shift either; that is a delay.
  assert.equal(compositionShift([{ dts: 500, pts: 500 }, { dts: 540, pts: 540 }]), 0);
});

test('ticks are moved between clocks exactly when they can be, and rounded when they cannot', () => {
  assert.equal(rescale(40, 1000, 90000), 3600);
  assert.equal(rescale(3600, 90000, 1000), 40);
  assert.equal(rescale(21, 1000, 48000), 1008);
  assert.equal(rescale(7, 7, 7), 7);
  assert.equal(rescale(1, 3, 1000), 333);
});

test('each sample lasts until the next; the last as long as told', () => {
  const closed = closeGaps([{ dts: 0 }, { dts: 40 }, { dts: 85 }], 40);
  assert.deepEqual(closed.map((s) => s.duration), [40, 45, 40]);
  // Never zero, even for two samples on the same tick.
  assert.deepEqual(closeGaps([{ dts: 5 }, { dts: 5 }], 0).map((s) => s.duration), [1, 1]);
});

/* -------------------------------------------------------------- the words */

test('a container is named from the file and from what the reader said', () => {
  assert.equal(containerOf('clip.webm', true), 'webm');
  assert.equal(containerOf('film.mkv', true), 'mkv');
  assert.equal(containerOf('renamed.mp4', true), 'mkv');
  assert.equal(containerOf('IMG_0001.MOV', false), 'mov');
  assert.equal(containerOf('show.m4v', false), 'm4v');
  assert.equal(containerOf('clip.mp4', false), 'mp4');
  assert.equal(containerOf('noext', false), 'mp4');
  assert.deepEqual(containerText('webm'), { key: 'container.webm' });
});

test('codecs are named by key where a person has a word for them', () => {
  assert.deepEqual(codecText('avc1.640028'), { key: 'codec.h264' });
  assert.deepEqual(codecText('hev1.1.6.L93.B0'), { key: 'codec.hevc' });
  assert.deepEqual(codecText('vp8'), { key: 'codec.vp8' });
  assert.deepEqual(codecText('vp09.02.31.10'), { key: 'codec.vp9' });
  assert.deepEqual(codecText('av01.0.08M.08'), { key: 'codec.av1' });
  assert.deepEqual(codecText('mp4a.40.5'), { key: 'codec.aac' });
  assert.deepEqual(codecText('opus'), { key: 'codec.opus' });
  assert.deepEqual(codecText('mp3'), { key: 'codec.mp3' });
  assert.deepEqual(codecText('ec-3'), { key: 'codec.eac3' });
  assert.deepEqual(codecText(null, 'A_PCM/INT/LIT'), { key: 'codec.other', values: { name: 'A_PCM/INT/LIT' } });
  assert.deepEqual(codecText('', ''), { key: 'codec.other', values: { name: '?' } });
});

test('bitrates and frames are words with the unit people read', () => {
  assert.deepEqual(bitrateText(6_400_000), { key: 'rate.mbit', values: { n: '6.4' } });
  assert.deepEqual(bitrateText(160_000), { key: 'rate.kbit', values: { n: 160 } });
  assert.deepEqual(frameText({ width: 1920, height: 1080 }),
    { key: 'frame.named', values: { name: '1080p', width: 1920, height: 1080 } });
  assert.deepEqual(frameText({ width: 1000, height: 500 }),
    { key: 'frame.plain', values: { width: 1000, height: 500 } });
});

test('the finished file is called .mp4, and never lands on the original', () => {
  assert.equal(outName('recording.webm'), 'recording.mp4');
  assert.equal(outName('film.mkv'), 'film.mp4');
  assert.equal(outName('IMG_0001.MOV'), 'IMG_0001.mp4');
  assert.equal(outName('clip.mp4'), 'clip-converted.mp4');
  assert.equal(outName('CLIP.MP4'), 'CLIP-converted.mp4');
  assert.equal(outName('.webm'), 'video.mp4');
});
