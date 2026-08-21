/**
 * tools/edit-audio/src/samplerate.js - reading the rate out of a header.
 *
 * This one is worth testing carefully for a reason that is easy to miss: it
 * cannot fail loudly. A wrong answer here does not throw and does not corrupt
 * anything - it quietly decodes the file at the wrong rate, which resamples
 * every sample in it on the way in, on a page that says nothing was touched.
 * So each fixture below is written out by hand, field by field, and the
 * refusals are checked as carefully as the successes.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { sniffSampleRate } from '../../tools/edit-audio/src/samplerate.js';
import { concat, ascii, u16be, u32be, u32le } from './helpers.js';

/* -------------------------------------------------------------------- WAV */

/** A RIFF file with the chunks given, in order. */
const riff = (...chunks) => {
  const body = concat(ascii('WAVE'), ...chunks);
  return concat(ascii('RIFF'), u32le(body.length), body);
};

const chunk = (id, data) => {
  const body = concat(ascii(id), u32le(data.length), data);
  return data.length % 2 ? concat(body, [0]) : body;
};

/** A PCM `fmt ` chunk: the sixteen bytes every WAV since 1991 begins with. */
const fmt = (rate, channels = 2, bits = 16) => chunk('fmt ', concat(
  [1, 0],                                  // format tag: PCM
  [channels, 0],
  u32le(rate),
  u32le(rate * channels * (bits / 8)),
  [channels * (bits / 8), 0],
  [bits, 0]));

test('WAV: the rate comes out of the fmt chunk', () => {
  assert.equal(sniffSampleRate(riff(fmt(44100), chunk('data', ascii('samples')))), 44100);
  assert.equal(sniffSampleRate(riff(fmt(8000, 1, 8), chunk('data', ascii('s')))), 8000);
});

test('WAV: a chunk in front of fmt is stepped over, odd length and all', () => {
  const file = riff(
    chunk('LIST', ascii('INFOISFTa tool')), // 14 bytes: padded to 15 with a zero
    fmt(48000),
    chunk('data', ascii('samples')));
  assert.equal(sniffSampleRate(file), 48000);
});

test('WAV: a file with no fmt chunk at all gives up rather than guessing', () => {
  assert.equal(sniffSampleRate(riff(chunk('data', ascii('nothing to describe')))), null);
});

/* ------------------------------------------------------------------- FLAC */

/** "fLaC", a metadata block header, and the first ten bytes of STREAMINFO. */
const flac = (rate, channels = 2) => concat(
  ascii('fLaC'),
  [0x00, 0x00, 0x00, 0x22],                 // STREAMINFO, 34 bytes of it
  u16be(4096), u16be(4096),                 // smallest and largest block
  [0, 0, 0], [0, 0, 0],                     // smallest and largest frame
  // Twenty bits of rate, then three of channels and five of bit depth. The
  // rate ends in the middle of a byte, which is the only awkward part.
  [(rate >> 12) & 0xff, (rate >> 4) & 0xff,
    ((rate & 0x0f) << 4) | (((channels - 1) & 0x07) << 1)],
  new Uint8Array(21));

test('FLAC: the twenty bits in STREAMINFO', () => {
  assert.equal(sniffSampleRate(flac(44100)), 44100);
  assert.equal(sniffSampleRate(flac(96000)), 96000);
  assert.equal(sniffSampleRate(flac(22050, 1)), 22050);
});

/* -------------------------------------------------------------------- Ogg */

/** One Ogg page carrying `payload`, which for page zero is the id header. */
const ogg = (payload) => concat(
  ascii('OggS'), [0],                       // version
  [0x02],                                   // first page of the stream
  new Uint8Array(8),                        // granule position
  u32le(1), u32le(0), u32le(0),             // serial, sequence, checksum
  [1, payload.length],                      // one segment, this long
  payload);

test('Ogg Vorbis: the rate in the identification header', () => {
  const header = concat(
    [1], ascii('vorbis'), u32le(0), [2], u32le(44100), new Uint8Array(16));
  assert.equal(sniffSampleRate(ogg(header)), 44100);
});

test('Ogg Opus: always 48 kHz, whatever the header says it was recorded at', () => {
  // Opus decoders hand back 48 kHz for every file, so the 16 kHz in this
  // header describes what went in and not what this tool will be given.
  const header = concat(
    ascii('OpusHead'), [1, 2], u16be(312), u32le(16000), u16be(0), [0]);
  assert.equal(sniffSampleRate(ogg(header)), 48000);
});

test('Ogg carrying something else is left alone', () => {
  assert.equal(sniffSampleRate(ogg(concat(ascii('Speex   '), new Uint8Array(60)))), null);
});

/* ------------------------------------------------------------------- AIFF */

/** An AIFF whose COMM chunk carries the rate as an eighty-bit float. */
const aiff = (rate) => {
  // sign and exponent, then the mantissa with its leading one written out.
  const exponent = Math.floor(Math.log2(rate));
  const mantissa = Math.round((rate / 2 ** exponent) * 2 ** 31);
  const comm = concat(
    ascii('COMM'), u32be(18),
    u16be(2), u32be(1000), u16be(16),
    u16be(16383 + exponent), u32be(mantissa), u32be(0));
  const body = concat(ascii('AIFF'), comm, ascii('SSND'), u32be(8), new Uint8Array(8));
  return concat(ascii('FORM'), u32be(body.length), body);
};

test('AIFF: the eighty-bit float in the COMM chunk', () => {
  assert.equal(sniffSampleRate(aiff(44100)), 44100);
  assert.equal(sniffSampleRate(aiff(48000)), 48000);
  assert.equal(sniffSampleRate(aiff(22050)), 22050);
});

/* ------------------------------------------------------- WebM and Matroska */

/** One EBML element: its id as written, a length, and the contents. */
const ebml = (id, ...parts) => {
  const body = concat(...parts);
  const idBytes = [];
  for (let value = id; value > 0; value = Math.floor(value / 256)) idBytes.unshift(value % 256);
  return concat(idBytes, size(body.length), body);
};

/** A length, as the shortest variable-length integer that will hold it. */
const size = (value) => (value < 0x7f
  ? new Uint8Array([0x80 | value])
  : new Uint8Array([0x40 | (value >> 8), value & 0xff]));

const f64 = (value) => {
  const bytes = new Uint8Array(8);
  new DataView(bytes.buffer).setFloat64(0, value, false);
  return bytes;
};

const webm = (...tracks) => concat(
  ebml(0x1a45dfa3, ebml(0x4286, [1])),          // the EBML header
  ebml(0x18538067, ebml(0x1654ae6b, ...tracks)));

const track = (type, codec, rate) => ebml(0xae,
  ebml(0x83, [type]),                           // 1 video, 2 audio
  ebml(0x86, ascii(codec)),
  ebml(0xe1, ebml(0xb5, f64(rate))));

test('WebM: the sampling frequency in the audio track', () => {
  assert.equal(sniffSampleRate(webm(track(2, 'A_VORBIS', 44100))), 44100);
});

test('WebM: Opus is 48 kHz whatever the track says', () => {
  // A recording made in a browser says 48000 here anyway, but a file that says
  // something else is still handed back at 48 kHz by the decoder.
  assert.equal(sniffSampleRate(webm(track(2, 'A_OPUS', 16000))), 48000);
});

test('WebM: a video track is walked past, not read', () => {
  const file = webm(track(1, 'V_VP9', 0), track(2, 'A_VORBIS', 48000));
  assert.equal(sniffSampleRate(file), 48000);
});

test('WebM: a recording still being written has no length on its Segment', () => {
  // MediaRecorder writes 0x01FFFFFFFFFFFFFF - "I do not know yet" - and a
  // reader that treated that as a byte count would step past the whole file.
  const tracks = ebml(0x1654ae6b, track(2, 'A_VORBIS', 44100));
  const unknown = concat(
    [0x18, 0x53, 0x80, 0x67], [0x01, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff], tracks);
  const file = concat(ebml(0x1a45dfa3, ebml(0x4286, [1])), unknown);
  assert.equal(sniffSampleRate(file), 44100);
});

test('WebM: a file whose audio track says nothing about its rate gives up', () => {
  const file = webm(ebml(0xae, ebml(0x83, [2]), ebml(0x86, ascii('A_VORBIS'))));
  assert.equal(sniffSampleRate(file), null);
});

/* ------------------------------------------------------- MP4, M4A and MOV */

const box = (type, ...parts) => {
  const body = concat(...parts);
  return concat(u32be(body.length + 8), ascii(type), body);
};

const hdlr = (kind) => box('hdlr', new Uint8Array(8), ascii(kind), new Uint8Array(12));

const mdhd = (timescale) => box('mdhd',
  [0, 0, 0, 0],                             // version 0, no flags
  u32be(0), u32be(0),                       // created, modified
  u32be(timescale), u32be(1000));

/** A `stsd` with one sound sample entry, whose rate is a 16.16 fixed number. */
const stsd = (rate, codec = 'mp4a') => box('stsd',
  [0, 0, 0, 0], u32be(1),
  box(codec,
    new Uint8Array(6), u16be(1),            // reserved, data reference index
    u16be(0), u16be(0), u32be(0),           // version, revision, vendor
    u16be(2), u16be(16),                    // channels, bits per sample
    u16be(0), u16be(0),                     // pre_defined, reserved
    u16be(rate), u16be(0)));                // the rate, and its fraction

const trak = (kind, timescale, rate) => box('trak', box('mdia',
  hdlr(kind),
  mdhd(timescale),
  box('minf', box('stbl', stsd(rate)))));

const mp4 = (...traks) => concat(
  box('ftyp', ascii('isom'), u32be(512), ascii('isomiso2')),
  box('moov', box('mvhd', new Uint8Array(100)), ...traks));

test('MP4: the rate in the audio track\'s sample description', () => {
  assert.equal(sniffSampleRate(mp4(trak('soun', 44100, 44100))), 44100);
});

test('MP4: a video track cannot be mistaken for the audio', () => {
  // 90000 is the timescale nearly every video track carries, and it is not a
  // sample rate. Reading the handler type is what keeps it out.
  const file = mp4(trak('vide', 90000, 0), trak('soun', 48000, 48000));
  assert.equal(sniffSampleRate(file), 48000);
});

test('MP4: a video with no sound at all gives up', () => {
  assert.equal(sniffSampleRate(mp4(trak('vide', 90000, 0))), null);
});

test('MP4: a timescale that is not a rate is thrown out by the range check', () => {
  // Fragmented files often use 1000 for everything. It is a plausible-looking
  // number and an implausible sample rate, so the entry wins.
  assert.equal(sniffSampleRate(mp4(trak('soun', 1000, 44100))), 44100);
});

test('MP4: the larger of the two is taken, for the halved rate SBR writes', () => {
  assert.equal(sniffSampleRate(mp4(trak('soun', 48000, 24000))), 48000);
});

test('MP4: a box that runs past the end of the file stops the walk', () => {
  const file = mp4(trak('soun', 44100, 44100));
  // Claim the moov box is a megabyte long. A reader that trusted it would walk
  // off the end of the array; this one stops and reports nothing.
  const view = new DataView(file.buffer);
  const moovAt = 8 + 24; // past the ftyp box written above
  view.setUint32(moovAt, 1 << 20, false);
  assert.equal(sniffSampleRate(file), null);
});

/* ------------------------------------------------------------ MP3 and AAC */

/** Four bytes of MPEG frame header: sync, version, layer, and the rate index. */
const mp3Frame = (version, rateIndex) => new Uint8Array([
  0xff,
  0xe0 | (version << 3) | (1 << 1),          // sync, version, layer III
  0x90 | (rateIndex << 2),                   // a bitrate index, then the rate
  0x00,
]);

/** An ID3v2 tag of `size` bytes of payload, with `filling` inside it. */
const id3 = (filling) => concat(
  ascii('ID3'), [3, 0, 0],
  [(filling.length >> 21) & 0x7f, (filling.length >> 14) & 0x7f,
    (filling.length >> 7) & 0x7f, filling.length & 0x7f],
  filling);

test('MP3: the rate index, on each of the three MPEG versions', () => {
  assert.equal(sniffSampleRate(concat(mp3Frame(3, 0), new Uint8Array(400))), 44100);
  assert.equal(sniffSampleRate(concat(mp3Frame(3, 1), new Uint8Array(400))), 48000);
  assert.equal(sniffSampleRate(concat(mp3Frame(2, 0), new Uint8Array(400))), 22050);
  assert.equal(sniffSampleRate(concat(mp3Frame(0, 2), new Uint8Array(400))), 8000);
});

test('MP3: an ID3 tag is stepped over rather than searched through', () => {
  // The bytes inside the tag are a frame header for a different rate - which is
  // exactly what album art can contain by accident. Skipping the tag by the
  // length it declares is what stops a picture deciding the sample rate.
  const decoy = concat(mp3Frame(3, 1), new Uint8Array(60));
  const file = concat(id3(decoy), mp3Frame(3, 0), new Uint8Array(400));
  assert.equal(sniffSampleRate(file), 44100);
});

test('MP3: a reserved rate index is not a rate', () => {
  assert.equal(sniffSampleRate(concat(mp3Frame(3, 3), new Uint8Array(400))), null);
});

test('AAC in an ADTS stream, which looks like MP3 until the layer bits', () => {
  // 0xfff1: sync, MPEG-4, layer 00 - which is reserved in MPEG audio and is
  // how an .aac file gives itself away.
  const header = new Uint8Array([0xff, 0xf1, (4 << 2) | 0x40, 0x80, 0, 0x1f, 0xfc]);
  assert.equal(sniffSampleRate(concat(header, new Uint8Array(64))), 44100);
});

/* ----------------------------------------------------------- and refusals */

test('a format this does not read returns null rather than a wrong answer', () => {
  assert.equal(sniffSampleRate(ascii('Not a media file at all, just some text.')), null);
  assert.equal(sniffSampleRate(new Uint8Array(64)), null);
  assert.equal(sniffSampleRate(new Uint8Array(4)), null, 'too short to hold a header');
});

test('a rate no audio context would accept is refused', () => {
  // 1 kHz and 192 kHz are both real numbers a corrupt or exotic header can
  // carry, and neither is a rate an OfflineAudioContext can be created at.
  assert.equal(sniffSampleRate(riff(fmt(1000), chunk('data', ascii('x')))), null);
  assert.equal(sniffSampleRate(riff(fmt(192000), chunk('data', ascii('x')))), null);
  assert.equal(sniffSampleRate(riff(fmt(0), chunk('data', ascii('x')))), null);
});

test('a container this cannot read is not scanned for frame headers', () => {
  // The bug this pins down: a WebM full of Opus fell through to the raw-stream
  // scanner, which found something shaped like an AAC header inside compressed
  // audio and reported 64 kHz for a file that is 48. Anything a browser can
  // actually decode is recognised by its own header now, and what is left
  // returns null rather than a number nobody wrote down.
  const opusish = concat(
    [0x1a, 0x45, 0xdf, 0xa3], new Uint8Array(8).fill(0x9c),
    new Uint8Array(200).fill(0xff));
  assert.equal(sniffSampleRate(opusish), null);
});

test('sync bytes inside something that is not a frame are not believed', () => {
  // A run of 0xff has the eleven sync bits in it. Every other field of that
  // "header" is nonsense - a free-format bitrate and a reserved rate index -
  // which is what the validity checks are for.
  assert.equal(sniffSampleRate(new Uint8Array(200).fill(0xff)), null);
  assert.equal(sniffSampleRate(concat(ascii('CAFF'), new Uint8Array(200).fill(0xff))), null);
});
