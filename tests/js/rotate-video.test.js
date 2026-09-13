/**
 * The arithmetic behind a turn: nine numbers, and the words around them.
 *
 * The matrix is pinned to its bytes and then proved the long way - written
 * into a track by the shared MP4 writer and read back by the shared reader,
 * which is the pair of parts the page actually goes through. The rest of
 * plan.js is pure and pinned by hand. The codecs are WebCodecs and are
 * checked in a browser; the README says how.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  TURNS, bakeBitrate, bakeFrame, canCopy, rotationMatrix, shownSize, turned,
} from '../../tools/rotate-video/src/plan.js';
import { codecText, frameText, outName, rotationText, turnText } from '../../tools/rotate-video/src/format.js';
import { Mp4Writer, avcSampleEntry } from '../../shared/js/mp4-writer.js';
import { demux } from '../../shared/js/mp4-reader.js';

const AVCC = new Uint8Array([1, 0x64, 0x00, 0x28, 0xff, 0xe1, 0, 0]);

/** A one-frame MP4 whose track wears the matrix given. */
function clipWith(matrix, codedWidth, codedHeight) {
  const writer = new Mp4Writer();
  const track = writer.addTrack({
    kind: 'vide',
    timescale: 90000,
    sampleEntry: avcSampleEntry(codedWidth, codedHeight, AVCC),
    matrix,
    // The header keeps the stored size; the matrix does the turning. A
    // player given the turned size here as well shows a stretched picture.
    width: codedWidth << 16,
    height: codedHeight << 16,
  });
  track.addSample({ data: new Uint8Array([0, 0, 0, 1, 0x65, 1, 2, 3]), isKey: true, dts: 0, pts: 0, duration: 3600 });
  return writer.finalize();
}

test('the four turns are the four matrices the reader knows, translation included', () => {
  const words = (bytes) => {
    const view = new DataView(bytes.buffer);
    return [0, 4, 12, 16, 24, 28].map((at) => view.getInt32(at) / 65536);
  };
  assert.deepEqual(words(rotationMatrix(0, 1920, 1080)), [1, 0, 0, 1, 0, 0]);
  assert.deepEqual(words(rotationMatrix(90, 1920, 1080)), [0, 1, -1, 0, 1080, 0]);
  assert.deepEqual(words(rotationMatrix(180, 1920, 1080)), [-1, 0, 0, -1, 1920, 1080]);
  assert.deepEqual(words(rotationMatrix(270, 1920, 1080)), [0, -1, 1, 0, 0, 1920]);
  // w is 1.0 in 2.30 fixed point, and u, v are 0.
  const view = new DataView(rotationMatrix(90, 4, 4).buffer);
  assert.equal(view.getInt32(32), 0x40000000);
  assert.equal(view.getInt32(8), 0);
  assert.equal(view.getInt32(20), 0);
  assert.throws(() => rotationMatrix(45, 4, 4), /rotate.badturn/);
});

test('a matrix written by the writer reads back as the turn it was, with the size it implies', async () => {
  for (const rotation of [0, 90, 180, 270]) {
    const shown = shownSize({ codedWidth: 1920, codedHeight: 1080 }, rotation);
    const file = clipWith(rotationMatrix(rotation, 1920, 1080), 1920, 1080);
    const media = await demux(file);
    assert.equal(media.video.rotation, rotation, `rotation ${rotation}`);
    assert.equal(media.video.codedWidth, 1920);
    assert.equal(media.video.displayWidth, shown.width, `display width at ${rotation}`);
    assert.equal(media.video.displayHeight, shown.height, `display height at ${rotation}`);
    assert.equal(media.video.trackWidth >> 16, 1920, 'the header keeps the stored width');
  }
});

test('turns compose with what the file already says, and come round', () => {
  assert.deepEqual(TURNS, [90, 180, 270]);
  assert.equal(turned(0, 90), 90);
  assert.equal(turned(90, 90), 180);
  assert.equal(turned(270, 90), 0);
  assert.equal(turned(90, 270), 0);
  assert.equal(turned(180, 180), 0);
  assert.equal(turned(0, 270), 270);
});

test('a quarter turn swaps the shown size; a half turn keeps it', () => {
  const video = { codedWidth: 1920, codedHeight: 1080 };
  assert.deepEqual(shownSize(video, 0), { width: 1920, height: 1080 });
  assert.deepEqual(shownSize(video, 90), { width: 1080, height: 1920 });
  assert.deepEqual(shownSize(video, 180), { width: 1920, height: 1080 });
  assert.deepEqual(shownSize(video, 270), { width: 1080, height: 1920 });
});

test('anything out of an MP4 can be copied; only H.264 out of a Matroska file', () => {
  assert.equal(canCopy({ sampleEntry: new Uint8Array(90), codec: 'hvc1.1.6.L93.B0' }), true);
  assert.equal(canCopy({ sampleEntry: new Uint8Array(90), codec: 'vp09.00.10.08' }), true);
  assert.equal(canCopy({ sampleEntry: null, codec: 'avc1.640028', description: AVCC }), true);
  assert.equal(canCopy({ sampleEntry: null, codec: 'vp8', description: null }), false);
  assert.equal(canCopy({ sampleEntry: null, codec: 'hvc1.1.6.L93.B0', description: new Uint8Array(20) }), false);
});

test('a bake is asked for a fifth over the source, held between the floor and the ceiling', () => {
  const hd = { width: 1080, height: 1920, fps: 30 };
  const pixels = 1080 * 1920 * 30;
  assert.equal(bakeBitrate({ ...hd, sourceBitrate: 5_000_000 }), 6_000_000);
  const floor = Math.round(pixels * 0.06 / 1000) * 1000;
  assert.equal(bakeBitrate({ ...hd, sourceBitrate: 100_000 }), floor);
  const ceiling = Math.round(pixels * 0.25 / 1000) * 1000;
  assert.equal(bakeBitrate({ ...hd, sourceBitrate: 90_000_000 }), ceiling);
  assert.deepEqual(bakeFrame({ width: 1080, height: 1920 }), { width: 1080, height: 1920 });
  assert.deepEqual(bakeFrame({ width: 1081, height: 1921 }), { width: 1080, height: 1920 });
  assert.deepEqual(bakeFrame({ width: 4320, height: 7680 }), { width: 2160, height: 3840 });
});

test('the words', () => {
  assert.deepEqual(rotationText(90), { key: 'rotation.90' });
  assert.deepEqual(turnText(270), { key: 'turn.270' });
  assert.deepEqual(codecText('opus'), { key: 'codec.opus' });
  assert.deepEqual(codecText('mp4a.40.2'), { key: 'codec.aac' });
  assert.deepEqual(codecText(null, 'A_PCM/INT/LIT'), { key: 'codec.other', values: { name: 'A_PCM/INT/LIT' } });
  assert.deepEqual(frameText({ width: 1080, height: 1920 }),
    { key: 'frame.named', values: { name: '1080p', width: 1080, height: 1920 } });
  assert.equal(outName('IMG_0001.MOV'), 'IMG_0001-rotated.mp4');
  assert.equal(outName('clip.webm'), 'clip-rotated.mp4');
  assert.equal(outName('.mp4'), 'video-rotated.mp4');
});
