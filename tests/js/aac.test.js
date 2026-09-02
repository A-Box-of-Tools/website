/**
 * shared/js/aac.js - the description of an AAC track, read and written.
 *
 * The two halves are mirrors, so the test is mostly a round trip: an
 * AudioSpecificConfig goes into a sample entry through the writer and comes
 * back out through the reader as the decoder configuration WebCodecs wants.
 * The two tools that share this file were tested through their own copies
 * before (trim-video-join.test.js); this pins the shared one directly.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { audioDecoderConfig, mp4aSampleEntry } from '../../shared/js/aac.js';

/** A track as the demuxer hands it over, round a sample entry. */
const track = (sampleEntry, extra = {}) => ({
  entryType: 'mp4a', sampleEntry, sampleRate: 44100, channels: 2, ...extra,
});

test('a sample entry written here is read back as the decoder configuration', () => {
  // AAC-LC, 44.1 kHz, stereo: the commonest AudioSpecificConfig there is.
  const asc = new Uint8Array([0x12, 0x10]);
  const entry = mp4aSampleEntry({ channels: 2, sampleRate: 44100, asc });

  assert.equal(String.fromCharCode(...entry.subarray(4, 8)), 'mp4a');
  assert.equal(new DataView(entry.buffer).getUint32(0), entry.byteLength, 'the box says its own size');

  const config = audioDecoderConfig(track(entry));
  assert.deepEqual(config, {
    codec: 'mp4a.40.2', description: asc, sampleRate: 44100, numberOfChannels: 2,
  });
});

test('the object type comes off the configuration, escape included', () => {
  // Object type 5 (SBR) sits in the top five bits; 31 escapes to a longer field.
  const sbr = mp4aSampleEntry({ channels: 2, sampleRate: 44100, asc: new Uint8Array([0x2b, 0x92, 0x08, 0x00]) });
  assert.equal(audioDecoderConfig(track(sbr)).codec, 'mp4a.40.5');
  const escaped = mp4aSampleEntry({ channels: 1, sampleRate: 48000, asc: new Uint8Array([0xf8, 0x40, 0x00]) });
  assert.equal(audioDecoderConfig(track(escaped)).codec, 'mp4a.40.34');
});

test('a track that is not AAC in an esds is null, not an error', () => {
  const entry = mp4aSampleEntry({ channels: 2, sampleRate: 44100, asc: new Uint8Array([0x12, 0x10]) });
  assert.equal(audioDecoderConfig(track(entry, { entryType: 'Opus' })), null);
  assert.equal(audioDecoderConfig(track(entry.subarray(0, 36))), null, 'no esds inside');
  assert.equal(audioDecoderConfig(null), null);
  const torn = entry.slice(0, entry.byteLength - 6);
  assert.equal(audioDecoderConfig(track(torn)), null, 'a chain that runs off the end');
});

test('the bitrate written is the one given, or the default', () => {
  const asc = new Uint8Array([0x12, 0x10]);
  const given = mp4aSampleEntry({ channels: 2, sampleRate: 44100, asc, bitrate: 96_000 });
  const fallback = mp4aSampleEntry({ channels: 2, sampleRate: 44100, asc });
  assert.notDeepEqual([...given], [...fallback]);
  assert.equal(given.byteLength, fallback.byteLength);
  // Counted from the end: the three-byte SLConfig descriptor, then the ASC in
  // its two-byte descriptor, then the average and the maximum bitrate.
  const rates = (entry) => {
    const view = new DataView(entry.buffer, entry.byteOffset);
    const at = entry.byteLength - 3 - (2 + asc.length) - 8;
    return [view.getUint32(at), view.getUint32(at + 4)];
  };
  assert.deepEqual(rates(given), [96_000, 96_000]);
  assert.deepEqual(rates(fallback), [160_000, 160_000]);
});

test('a description too long for a one-byte length is refused with its phrase key', () => {
  assert.throws(
    () => mp4aSampleEntry({ channels: 2, sampleRate: 44100, asc: new Uint8Array(200) }),
    { message: 'audio.descriptor' });
});
