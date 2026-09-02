/**
 * tools/extract-audio-from-video/ - the mixdown, and the claim the page makes.
 *
 * The decoder, the sample-rate sniffer and the WAV writer are shared with
 * edit-audio and trim-audio and are tested through those; the duplicate check
 * in tests/python/test_duplicates.py holds all three copies identical, so
 * testing them again here would only prove that a copy is a copy.
 *
 * What is particular to this page is the one piece of arithmetic that makes a
 * choice - how several channels become one - and the promise that the picture
 * is never decoded. Neither is covered anywhere else.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

import { mixToMono } from '../../tools/extract-audio-from-video/src/mono.js';
import { writeWav } from '../../shared/js/wav.js';

const channel = (...values) => Float32Array.from(values);

test('mono averages the channels rather than dropping one', () => {
  // The case that matters: something audible in one channel and silence in the
  // other. Taking the first channel would return silence and lose the speaker
  // entirely, which is what a recording made with two microphones sounds like
  // when a converter picks a side.
  const left = channel(0, 0, 0, 0);
  const right = channel(1, -1, 0.5, -0.5);
  const out = mixToMono([left, right]);
  assert.deepEqual(Array.from(out), [0.5, -0.5, 0.25, -0.25]);
  assert.ok(out.some((sample) => sample !== 0), 'the mixdown lost the only channel with sound in it');
});

test('a mono recording is handed back untouched', () => {
  const only = channel(0.25, -0.25);
  assert.equal(mixToMono([only]), only);
});

test('more than two channels average too', () => {
  const out = mixToMono([channel(1, 0), channel(0, 0), channel(-1, 3)]);
  assert.deepEqual(Array.from(out).map((n) => Number(n.toFixed(6))), [0, 1]);
});

test('channels of different lengths are refused rather than half-mixed', () => {
  assert.throws(() => mixToMono([channel(0, 0, 0), channel(0)]), /wav\.uneven/);
  assert.throws(() => mixToMono([]), /wav\.nochannels/);
});

test('the WAV header says what the page said it would', () => {
  // The page reports the channel count and the sample rate off the decode, and
  // the file has to agree with the page - a reader who is told "stereo at
  // 48 kHz" and opens a mono file has been misinformed by the one tool on the
  // site whose whole job is not changing the sound.
  const bytes = new Uint8Array(4800);
  const wav = writeWav([channel(...bytes), channel(...bytes)], 48000, { bits: 16 });
  return wav.arrayBuffer().then((buffer) => {
    const view = new DataView(buffer);
    const ascii = (at, n) => String.fromCharCode(...new Uint8Array(buffer, at, n));
    assert.equal(ascii(0, 4), 'RIFF');
    assert.equal(ascii(8, 4), 'WAVE');
    assert.equal(view.getUint16(22, true), 2, 'channel count');
    assert.equal(view.getUint32(24, true), 48000, 'sample rate');
    assert.equal(view.getUint16(34, true), 16, 'bit depth');
  });
});

/*
 * The claim in the pledge, the privacy panel, the FAQ and the README: the
 * video's picture is never decoded. It is not a promise about restraint - there
 * is no video decoder in src/ to run - so this asserts exactly that, and is
 * what stops one arriving later for a plausible-sounding reason such as drawing
 * a thumbnail beside the result.
 */
test('there is no video decoder in this tool, and nothing that draws a frame', () => {
  const dir = 'tools/extract-audio-from-video/src';
  const banned = /\b(VideoDecoder|VideoFrame|createImageBitmap|drawImage|getImageData|requestVideoFrameCallback)\b/;
  for (const name of readdirSync(dir).filter((file) => file.endsWith('.js'))) {
    const source = readFileSync(`${dir}/${name}`, 'utf8');
    assert.ok(!banned.test(source),
      `${name} has grown a way to look at the picture, which the page promises it cannot`);
  }
});

test('nothing in this tool reaches the network', () => {
  const dir = 'tools/extract-audio-from-video/src';
  // fetch is allowed nowhere here. main.js does read its own blob: URL back
  // through the shared handoff module, which is a different file and ships
  // with its own reasoning; nothing in src/ may call out on its own.
  const banned = /\b(fetch|XMLHttpRequest|sendBeacon|WebSocket|EventSource)\s*\(/;
  for (const name of readdirSync(dir).filter((file) => file.endsWith('.js'))) {
    const source = readFileSync(`${dir}/${name}`, 'utf8');
    assert.ok(!banned.test(source), `${name} has grown a network call`);
  }
});
