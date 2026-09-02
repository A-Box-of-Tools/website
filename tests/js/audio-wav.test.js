/**
 * shared/js/wav.js - the file the audio editor writes.
 *
 * A WAV is the one output format on this site that involves no encoder at all,
 * which is the whole reason it was chosen: what comes out is meant to be the
 * samples that went in, in the order they went in. So these are round trips -
 * write the file, read the header and the samples back out of it, and check
 * they are what was handed over.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { writeWav, wavSize } from '../../shared/js/wav.js';
import { blobBytes } from './helpers.js';

/** Read a WAV back: the fields this writer sets, and the samples. */
async function readWav(blob) {
  const bytes = await blobBytes(blob);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const tag = (at) => String.fromCharCode(bytes[at], bytes[at + 1], bytes[at + 2], bytes[at + 3]);

  assert.equal(tag(0), 'RIFF');
  assert.equal(tag(8), 'WAVE');
  assert.equal(view.getUint32(4, true), bytes.length - 8, 'the RIFF size counts everything after it');

  const chunks = {};
  let at = 12;
  while (at + 8 <= bytes.length) {
    const id = tag(at);
    const size = view.getUint32(at + 4, true);
    chunks[id] = { at: at + 8, size };
    at += 8 + size + (size % 2);
  }
  assert.ok(chunks['fmt '], 'there is a fmt chunk');
  assert.ok(chunks.data, 'there is a data chunk');

  const fmt = chunks['fmt '].at;
  const format = {
    tag: view.getUint16(fmt, true),
    channels: view.getUint16(fmt + 2, true),
    sampleRate: view.getUint32(fmt + 4, true),
    bytesPerSecond: view.getUint32(fmt + 8, true),
    bytesPerFrame: view.getUint16(fmt + 12, true),
    bits: view.getUint16(fmt + 14, true),
    fmtSize: chunks['fmt '].size,
  };

  const bytesPerSample = format.bits / 8;
  const frames = chunks.data.size / (format.channels * bytesPerSample);
  const channels = [];
  for (let channel = 0; channel < format.channels; channel += 1) {
    const samples = new Float64Array(frames);
    for (let i = 0; i < frames; i += 1) {
      const offset = chunks.data.at + (i * format.channels + channel) * bytesPerSample;
      samples[i] = format.bits === 32
        ? view.getFloat32(offset, true)
        : view.getInt16(offset, true);
    }
    channels.push(samples);
  }

  return { format, frames, channels, chunks, bytes };
}

const ramp = (n, scale = 1) => Float32Array.from(
  { length: n }, (_, i) => (scale * (2 * (i / (n - 1)) - 1)));

test('16-bit: the header describes what was written', async () => {
  const wav = await readWav(writeWav([ramp(8), ramp(8)], 44100));
  assert.deepEqual(wav.format, {
    tag: 1, channels: 2, sampleRate: 44100, bytesPerSecond: 44100 * 4,
    bytesPerFrame: 4, bits: 16, fmtSize: 16,
  });
  assert.equal(wav.frames, 8);
  assert.equal(wav.bytes.length, wavSize(8, 2, 16));
});

test('16-bit: the samples come back where they were put', async () => {
  const left = Float32Array.from([0, 0.5, -0.5, 1, -1]);
  const right = Float32Array.from([1, -1, 0.25, -0.25, 0]);
  const wav = await readWav(writeWav([left, right], 48000));

  // Full scale is one step further from zero downwards than upwards, which is
  // what the two limits in toPcm16 are about.
  assert.deepEqual([...wav.channels[0]], [0, 16384, -16384, 32767, -32768]);
  assert.deepEqual([...wav.channels[1]], [32767, -32768, 8192, -8192, 0]);
});

test('16-bit: anything past full scale is clamped, not wrapped', async () => {
  // Wrapping is the failure that matters: a sample 1% over full scale that
  // wraps comes back as full scale in the other direction, which is a click.
  const wav = await readWav(writeWav([Float32Array.from([1.5, -1.5, 4, -9])], 44100));
  assert.deepEqual([...wav.channels[0]], [32767, -32768, 32767, -32768]);
});

test('a mono file is written without interleaving anything', async () => {
  const wav = await readWav(writeWav([Float32Array.from([0.25, -0.25])], 22050));
  assert.equal(wav.format.channels, 1);
  assert.equal(wav.format.bytesPerFrame, 2);
  assert.deepEqual([...wav.channels[0]], [8192, -8192]);
});

test('32-bit float: the samples are the ones that went in, exactly', async () => {
  const samples = Float32Array.from([0, 0.1, -0.3333, 0.9999, -1]);
  const wav = await readWav(writeWav([samples], 44100, { bits: 32 }));
  assert.equal(wav.format.tag, 3, 'IEEE float rather than PCM');
  assert.equal(wav.format.bits, 32);
  assert.deepEqual([...wav.channels[0]], [...samples]);
});

test('32-bit float: nothing is clamped, which is the point of it', async () => {
  const wav = await readWav(writeWav([Float32Array.from([1.5, -2])], 44100, { bits: 32 }));
  assert.deepEqual([...wav.channels[0]], [1.5, -2]);
});

test('32-bit float carries the extra header fields the format asks for', async () => {
  const wav = await readWav(writeWav([ramp(4)], 44100, { bits: 32 }));
  assert.equal(wav.format.fmtSize, 18, 'a non-PCM fmt chunk names its cbSize');
  assert.ok(wav.chunks.fact, 'and is followed by a fact chunk');
  const view = new DataView(wav.bytes.buffer, wav.bytes.byteOffset, wav.bytes.byteLength);
  assert.equal(view.getUint32(wav.chunks.fact.at, true), 4, 'which counts the frames');
});

test('channels of different lengths are refused', () => {
  // The sentences live in body.html now, in fifteen languages; the keys are
  // what these can be held to.
  assert.throws(() => writeWav([ramp(4), ramp(5)], 44100), /^Error: wav\.uneven$/);
  assert.throws(() => writeWav([], 44100), /^Error: wav\.nochannels$/);
});

test('a file too large for the format to describe is refused', () => {
  // Nothing is allocated: the size is worked out from the lengths, and the
  // refusal happens before a byte is written. A RIFF size field is 32 bits, so
  // a WAV simply cannot say how long a five-gigabyte one is.
  const huge = [{ length: 2 ** 31 }, { length: 2 ** 31 }];
  assert.throws(() => writeWav(huge, 44100), /^Error: wav\.toobig$/);
});

test('wavSize agrees with the file that gets written', async () => {
  for (const [frames, channels, bits] of [[1, 1, 16], [100, 2, 16], [64, 2, 32]]) {
    const made = writeWav(
      Array.from({ length: channels }, () => ramp(frames)), 44100, { bits });
    const bytes = await blobBytes(made);
    // The float header is larger by the cbSize field and the fact chunk, so the
    // estimate is the floor rather than the exact figure there.
    assert.ok(bytes.length >= wavSize(frames, channels, bits));
    assert.ok(bytes.length - wavSize(frames, channels, bits) <= 14);
  }
});
