/**
 * tools/images-to-video/src/{mp4,compose}.js.
 *
 * mp4.js is an ISO-BMFF writer built by hand, so nothing has to be fetched to
 * make a video. The part that can go quietly wrong is `stco`: it holds an
 * absolute file offset, and that offset depends on how large `moov` is, which
 * is only known once `moov` has been built. The file builds it twice and
 * asserts the two passes agree - so the test below reads the offset back out
 * of the finished file and checks it really does land on the sample data.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { Mp4Muxer } from '../../tools/images-to-video/src/mp4.js';
import {
  resolveOutputSize, toEvenSize,
} from '../../tools/images-to-video/src/compose.js';
import { ascii, blobBytes } from './helpers.js';

const TIMESCALE = 90000;

/** Walk the top-level boxes of an MP4: size, then a four-letter type. */
function boxes(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const found = [];
  let at = 0;
  while (at + 8 <= bytes.length) {
    const size = view.getUint32(at);
    const type = new TextDecoder('latin1').decode(bytes.subarray(at + 4, at + 8));
    found.push({ type, at, size });
    if (size < 8) break;
    at += size;
  }
  return found;
}

/**
 * Find a nested box by type, from `from` onwards.
 *
 * `from` matters: ftyp lists "avc1" among its compatible brands, so a search
 * from the start of the file would find the brand rather than the sample entry.
 */
function findBox(bytes, type, from = 4) {
  const name = ascii(type);
  outer: for (let i = from; i + 4 <= bytes.length; i += 1) {
    for (let j = 0; j < 4; j += 1) if (bytes[i + j] !== name[j]) continue outer;
    return i - 4; // the start of the box, four bytes before its type
  }
  return -1;
}

/** Where a full box's payload begins: size, type, then version and flags. */
const PAYLOAD = 12;

/** Read the nth 32-bit field of a full box's payload. */
const field = (bytes, box, n) =>
  new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
    .getUint32(box + PAYLOAD + n * 4);

/** The start of the moov box, which is where the sample tables live. */
const afterFtyp = (bytes) => boxes(bytes)[0].size;

const AVCC = new Uint8Array([1, 0x64, 0, 0x1f, 0xff, 0xe1, 0, 4, 0x67, 1, 2, 3, 1, 0, 4, 0x68, 1, 2, 3]);

function muxed({ frames = 3, width = 320, height = 240, allKey = false } = {}) {
  const muxer = new Mp4Muxer({ width, height });
  muxer.setDecoderConfig(AVCC.buffer.slice(0));
  for (let i = 0; i < frames; i += 1) {
    muxer.addSample(ascii(`frame-${i}-data`), allKey || i === 0, 1 / 30);
  }
  return muxer;
}

test('mp4: the top-level boxes, in faststart order', async () => {
  const bytes = await blobBytes(muxed().finalize());
  assert.deepEqual(boxes(bytes).map((b) => b.type), ['ftyp', 'moov', 'mdat']);
});

test('mp4: the box sizes cover the whole file exactly', async () => {
  const bytes = await blobBytes(muxed().finalize());
  const total = boxes(bytes).reduce((n, b) => n + b.size, 0);
  assert.equal(total, bytes.length);
});

test('mp4: the blob is typed as an mp4', () => {
  assert.equal(muxed().finalize().type, 'video/mp4');
});

test('mp4: mdat holds the samples, in order, untouched', async () => {
  const bytes = await blobBytes(muxed({ frames: 3 }).finalize());
  const mdat = boxes(bytes).find((b) => b.type === 'mdat');
  const body = new TextDecoder('latin1').decode(bytes.subarray(mdat.at + 8));
  assert.equal(body, 'frame-0-dataframe-1-dataframe-2-data');
});

test('mp4: stco points at the first byte of the sample data', async () => {
  // The two-pass offset. If it were wrong the file would still parse and no
  // frame would decode.
  const bytes = await blobBytes(muxed().finalize());
  const stco = findBox(bytes, 'stco');
  const offset = field(bytes, stco, 1); // entry_count, then the offset
  const mdat = boxes(bytes).find((b) => b.type === 'mdat');
  assert.equal(offset, mdat.at + 8);
  assert.equal(new TextDecoder('latin1').decode(bytes.subarray(offset, offset + 7)), 'frame-0');
});

test('mp4: stsz lists every sample size', async () => {
  const bytes = await blobBytes(muxed({ frames: 3 }).finalize());
  const stsz = findBox(bytes, 'stsz');
  assert.equal(field(bytes, stsz, 0), 0, 'sample_size 0: the sizes vary');
  assert.equal(field(bytes, stsz, 1), 3, 'sample count');
  for (let i = 0; i < 3; i += 1) {
    assert.equal(field(bytes, stsz, 2 + i), `frame-${i}-data`.length);
  }
});

test('mp4: the durations are in the declared timescale', async () => {
  const bytes = await blobBytes(muxed({ frames: 3 }).finalize());
  const stts = findBox(bytes, 'stts');
  // Equal durations are run-length encoded into one entry.
  assert.equal(field(bytes, stts, 0), 1, 'one run');
  assert.equal(field(bytes, stts, 1), 3, 'covering three samples');
  assert.equal(field(bytes, stts, 2), Math.round(TIMESCALE / 30));
});

test('mp4: a sync sample table appears only when some frames are not keyframes', async () => {
  const mixed = await blobBytes(muxed({ frames: 3, allKey: false }).finalize());
  assert.notEqual(findBox(mixed, 'stss'), -1);

  const all = await blobBytes(muxed({ frames: 3, allKey: true }).finalize());
  assert.equal(findBox(all, 'stss'), -1, 'every frame is a sync sample');
});

test('mp4: stss lists keyframes one-based', async () => {
  const bytes = await blobBytes(muxed({ frames: 3 }).finalize());
  const stss = findBox(bytes, 'stss');
  assert.equal(field(bytes, stss, 0), 1, 'one keyframe');
  assert.equal(field(bytes, stss, 1), 1, 'sample number 1, not index 0');
});

test('mp4: the decoder configuration is written into avcC', async () => {
  const bytes = await blobBytes(muxed().finalize());
  const avcC = findBox(bytes, 'avcC');
  assert.notEqual(avcC, -1);
  assert.deepEqual(bytes.subarray(avcC + 8, avcC + 8 + AVCC.length), AVCC);
});

test('mp4: the frame size reaches the sample entry', async () => {
  const bytes = await blobBytes(muxed({ width: 1920, height: 1080 }).finalize());
  const view = new DataView(bytes.buffer);
  // Searched from past ftyp, which lists "avc1" among its compatible brands.
  const avc1 = findBox(bytes, 'avc1', afterFtyp(bytes));
  // 6 reserved, data_reference_index, 2 pre_defined/reserved, 12 pre_defined.
  assert.equal(view.getUint16(avc1 + 8 + 24), 1920);
  assert.equal(view.getUint16(avc1 + 8 + 26), 1080);
});

test('mp4: the first decoder configuration wins', () => {
  // VideoEncoder supplies it on the first chunk and occasionally repeats it.
  const muxer = new Mp4Muxer({ width: 16, height: 16 });
  muxer.setDecoderConfig(AVCC.buffer.slice(0));
  muxer.setDecoderConfig(new Uint8Array([9, 9, 9]).buffer);
  assert.deepEqual(muxer.avcC, AVCC);
});

test('mp4: a decoder configuration given as a view is copied out of it', () => {
  const backing = new Uint8Array([0, 0, ...AVCC, 0, 0]);
  const muxer = new Mp4Muxer({ width: 16, height: 16 });
  muxer.setDecoderConfig(backing.subarray(2, 2 + AVCC.length));
  assert.deepEqual(muxer.avcC, AVCC);
});

// The writer is copied into two tools and shipped in fifteen languages, so it
// refuses with a phrase key and the page turns that into a sentence.
test('mp4: refusals rather than a broken file', () => {
  assert.throws(() => new Mp4Muxer({ width: 16, height: 16 }).setDecoderConfig(null),
    { message: 'mp4.noconfig' });

  const noFrames = new Mp4Muxer({ width: 16, height: 16 });
  noFrames.setDecoderConfig(AVCC.buffer.slice(0));
  assert.throws(() => noFrames.finalize(), { message: 'mp4.noframes' });

  const noConfig = new Mp4Muxer({ width: 16, height: 16 });
  noConfig.addSample(ascii('x'), true, 1 / 30);
  assert.throws(() => noConfig.finalize(), { message: 'mp4.noconfig' });
});

test('mp4: a duration of zero still advances the clock by one tick', () => {
  const muxer = new Mp4Muxer({ width: 16, height: 16 });
  muxer.addSample(ascii('x'), true, 0);
  assert.equal(muxer.samples[0].durationTs, 1);
});

test('mp4: totalBytes tracks what was added', () => {
  const muxer = muxed({ frames: 3 });
  assert.equal(muxer.totalBytes, 'frame-0-data'.length * 3);
});

/* ============================================================== compose */

test('toEvenSize: H.264 needs even dimensions in both axes', () => {
  assert.deepEqual(toEvenSize(1920, 1080), { width: 1920, height: 1080 });
  assert.deepEqual(toEvenSize(1921, 1081), { width: 1920, height: 1080 });
  assert.deepEqual(toEvenSize(1919.9, 1079.9), { width: 1918, height: 1078 });
});

test('toEvenSize: never smaller than two', () => {
  assert.deepEqual(toEvenSize(1, 1), { width: 2, height: 2 });
  assert.deepEqual(toEvenSize(0, 0), { width: 2, height: 2 });
  assert.deepEqual(toEvenSize(-10, -10), { width: 2, height: 2 });
});

test('resolveOutputSize: a WIDTHxHEIGHT preset is taken as written', () => {
  assert.deepEqual(resolveOutputSize('1280x720', []), { width: 1280, height: 720 });
  assert.deepEqual(resolveOutputSize('1281x721', []), { width: 1280, height: 720 });
});

test('resolveOutputSize: "auto" takes each axis independently', () => {
  // A set holding both a landscape and a portrait photo resolves to a box
  // large enough for both, so neither is scaled down.
  const items = [{ width: 4000, height: 3000 }, { width: 3000, height: 4000 }];
  assert.deepEqual(resolveOutputSize('auto', items), { width: 4000, height: 4000 });
});

test('resolveOutputSize: "auto" with nothing to go on', () => {
  assert.deepEqual(resolveOutputSize('auto', []), { width: 1920, height: 1080 });
});

test('resolveOutputSize: "auto" is capped and stays proportional', () => {
  const size = resolveOutputSize('auto', [{ width: 16000, height: 8000 }]);
  assert.equal(size.width, 7680);
  assert.equal(size.height, 3840);
});

test('resolveOutputSize: "custom" is used, and capped', () => {
  assert.deepEqual(resolveOutputSize('custom', [], { width: 800, height: 600 }),
    { width: 800, height: 600 });
  assert.deepEqual(resolveOutputSize('custom', [], { width: 16000, height: 16000 }),
    { width: 7680, height: 7680 });
});

test('resolveOutputSize: "custom" with nothing usable falls back', () => {
  assert.deepEqual(resolveOutputSize('custom', []), { width: 1920, height: 1080 });
  assert.deepEqual(resolveOutputSize('custom', [], { width: 0, height: -1 }),
    { width: 1920, height: 1080 });
  assert.deepEqual(resolveOutputSize('custom', [], { width: 'x', height: 'y' }),
    { width: 1920, height: 1080 });
});

test('resolveOutputSize: every answer is even', () => {
  const cases = [
    ['auto', [{ width: 1921, height: 1081 }], undefined],
    ['auto', [{ width: 15999, height: 8001 }], undefined],
    ['custom', [], { width: 801, height: 601 }],
    ['1281x721', [], undefined],
  ];
  for (const [preset, items, custom] of cases) {
    const { width, height } = resolveOutputSize(preset, items, custom);
    assert.equal(width % 2, 0, `${preset}: width ${width}`);
    assert.equal(height % 2, 0, `${preset}: height ${height}`);
  }
});
