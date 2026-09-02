/**
 * Reading the sample rate out of a file before decoding it.
 *
 * GENERATED INTO EACH TOOL. This file lives at shared/js/samplerate.js and the
 * build copies it to <tool>/src/shared/samplerate.js for every tool that asks
 * for it in js_parts - which is every tool that asks for audio-decode.js,
 * because the decoder imports this to know what rate to decode at. See the
 * header of audio-decode.js for how the three audio parts travel.
 *
 * This exists because of a detail in the Web Audio specification that quietly
 * costs quality. `decodeAudioData` does not hand back the samples that are in
 * the file: it hands back those samples resampled to the sample rate of the
 * context you called it on. A 44.1 kHz MP3 decoded on a machine whose audio
 * hardware runs at 48 kHz comes back at 48 kHz, invented in between - and this
 * tool would then have written that out as if it were the recording.
 *
 * The fix is to decode on an OfflineAudioContext created at the file's own
 * rate, which means knowing that rate first. So the header is read here: a
 * dozen fields across five families of format, none of them requiring the file
 * to be decoded, parsed further, or held anywhere but this machine.
 *
 * A format not listed here, or a header that does not make sense, returns null
 * and the caller falls back to 48 kHz - which resamples, and says so on the
 * page rather than hiding it.
 */

/** What an OfflineAudioContext will accept, and what a WAV can name. */
const LOWEST = 8000;
const HIGHEST = 96000;

const MPEG_RATES = [
  [11025, 12000, 8000],   // MPEG 2.5
  null,                   // reserved
  [22050, 24000, 16000],  // MPEG 2
  [44100, 48000, 32000],  // MPEG 1
];

/** The sampling frequencies an ADTS header can name, by index. */
const AAC_RATES = [
  96000, 88200, 64000, 48000, 44100, 32000, 24000,
  22050, 16000, 12000, 11025, 8000, 7350,
];

/**
 * The sample rate of the audio in `bytes`, or null if it cannot be read.
 *
 * @param {Uint8Array} bytes the whole file
 * @returns {number|null}
 */
export function sniffSampleRate(bytes) {
  const rate = read(bytes);
  return rate && rate >= LOWEST && rate <= HIGHEST ? Math.round(rate) : null;
}

function read(bytes) {
  if (bytes.length < 16) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  if (tag(bytes, 0) === 'RIFF' && tag(bytes, 8) === 'WAVE') return riff(bytes, view);
  if (tag(bytes, 0) === 'FORM' && tag(bytes, 8).startsWith('AIF')) return aiff(bytes, view);
  if (tag(bytes, 0) === 'fLaC') return flac(bytes);
  if (tag(bytes, 0) === 'OggS') return ogg(bytes, view);
  if (tag(bytes, 4) === 'ftyp') return iso(bytes, view);
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
    return matroska(bytes, view);
  }
  return mpeg(bytes);
}

/* -------------------------------------------------------------------- WAV */

/** RIFF is a list of chunks; the one called `fmt ` holds the rate. */
function riff(bytes, view) {
  let at = 12;
  while (at + 8 <= bytes.length) {
    const id = tag(bytes, at);
    const size = view.getUint32(at + 4, true);
    if (id === 'fmt ' && at + 12 <= bytes.length) return view.getUint32(at + 12, true);
    at += 8 + size + (size % 2); // chunks are padded to an even length
  }
  return null;
}

/* ------------------------------------------------------------------- AIFF */

/**
 * AIFF is RIFF with the bytes the other way round, and one cruelty: the sample
 * rate is an eighty-bit extended float, a format no JavaScript number type
 * has. Only the sign, the exponent and the top word of the mantissa are needed
 * for any rate a recording could carry, so that is all this reads.
 */
function aiff(bytes, view) {
  let at = 12;
  while (at + 8 <= bytes.length) {
    const id = tag(bytes, at);
    const size = view.getUint32(at + 4, false);
    if (id === 'COMM' && at + 22 <= bytes.length) {
      const exponent = view.getUint16(at + 16, false) - 16383;
      const mantissa = view.getUint32(at + 18, false);
      return Math.round(mantissa * 2 ** (exponent - 31));
    }
    at += 8 + size + (size % 2);
  }
  return null;
}

/* ------------------------------------------------------------------- FLAC */

/**
 * STREAMINFO is always the first metadata block, and the rate is twenty bits
 * eighty bits into it - which is to say it starts at a byte boundary and ends
 * in the middle of one.
 */
function flac(bytes) {
  const at = 4 + 4 + 10; // "fLaC", the block header, then ten bytes of sizes
  if (at + 3 > bytes.length) return null;
  return (bytes[at] << 12) | (bytes[at + 1] << 4) | (bytes[at + 2] >> 4);
}

/* -------------------------------------------------------------------- Ogg */

/** The first page of an Ogg stream carries the codec's identification header. */
function ogg(bytes, view) {
  const segments = bytes[26];
  const at = 27 + segments;
  if (at + 16 > bytes.length) return null;

  // Opus is decoded at 48 kHz whatever it was recorded at; the rate in its
  // header describes what went in, not what comes out of any decoder.
  if (tag(bytes, at) === 'Opus') return 48000;

  const vorbis = bytes[at] === 1 && String.fromCharCode(...bytes.subarray(at + 1, at + 7)) === 'vorbis';
  return vorbis ? view.getUint32(at + 12, true) : null;
}

/* ------------------------------------------------- MP4, M4A, MOV and friends */

/**
 * Walk the box tree to the audio track and read its rate.
 *
 * A file whose video track is the reason it exists still has its audio
 * described the same way, which is what makes "the sound out of a video" the
 * same job as "the sound out of an audio file" here. The handler type is
 * checked so a video track's timescale - 90000, usually - cannot be mistaken
 * for a sample rate.
 */
function iso(bytes, view) {
  let best = null;

  /** @param {?{audio: boolean, rate: ?number}} track the trak being walked */
  const walk = (start, end, track) => {
    let at = start;
    while (at + 8 <= end) {
      let size = view.getUint32(at, false);
      const type = tag(bytes, at + 4);
      let header = 8;
      if (size === 1) {
        if (at + 16 > end) return;
        // 64-bit sizes. The high word is beyond anything this can address,
        // and a box that large is not one this is looking for anyway.
        size = view.getUint32(at + 8, false) * 2 ** 32 + view.getUint32(at + 12, false);
        header = 16;
      } else if (size === 0) {
        size = end - at; // the last box may say "to the end of the file"
      }
      if (size < header || at + size > end) return;

      const body = at + header;
      const stop = at + size;

      if (type === 'trak') {
        const found = { audio: false, rate: null };
        walk(body, stop, found);
        if (found.audio && found.rate) best = Math.max(best ?? 0, found.rate);
      } else if (type === 'hdlr' && track) {
        if (body + 12 <= stop && tag(bytes, body + 8) === 'soun') track.audio = true;
      } else if (type === 'mdhd' && track) {
        const version = bytes[body];
        const timescale = version === 1
          ? (body + 28 <= stop ? view.getUint32(body + 20, false) : null)
          : (body + 16 <= stop ? view.getUint32(body + 12, false) : null);
        // A timescale is only a candidate: most muxers make it the sample rate,
        // and the ones that do not usually pick something implausible as a
        // rate, which the range check at the top throws out.
        if (timescale) track.rate = Math.max(track.rate ?? 0, timescale);
      } else if (type === 'stsd' && track) {
        // The larger of the two rather than the later one: spectral band
        // replication writes the halved rate into the sample entry, and the
        // decoder hands back the doubled one.
        const rate = soundEntry(view, body + 8, stop);
        if (rate) track.rate = Math.max(track.rate ?? 0, rate);
      } else if (CONTAINERS.has(type)) {
        walk(body, stop, track);
      }
      at = stop;
    }
  };

  walk(0, bytes.length, null);
  return best;
}

/** Boxes that hold other boxes on the way down to the ones that hold fields.
 *  `trak` is handled before this is consulted, because entering one starts a
 *  new track rather than continuing the one above it. */
const CONTAINERS = new Set(['moov', 'mdia', 'minf', 'stbl']);

/** The first entry in `stsd`: a sample description, whose rate is 16.16 fixed. */
function soundEntry(view, at, end) {
  if (at + 8 > end) return null;
  const size = view.getUint32(at, false);
  if (size < 36 || at + size > end || at + 36 > end) return null;
  return view.getUint16(at + 32, false);
}

/* ------------------------------------------------------- WebM and Matroska */

/**
 * EBML, which is what a WebM file is made of.
 *
 * Every element is an id, a length, and either a value or more elements - the
 * same shape as an MP4 box, written as variable-length integers whose first
 * byte says how long they are. Only one path down the tree is followed here:
 * Segment, Tracks, the first TrackEntry whose type is audio, and the sampling
 * frequency inside it.
 *
 * This is not decoration. A WebM is what a browser records and what half the
 * video on the web is, and without this the file falls through to the raw-MP3
 * scanner below, which will eventually find something that looks like a frame
 * header inside compressed audio and report a rate that is not in the file at
 * all.
 */
function matroska(bytes, view) {
  const SEGMENT = 0x18538067;
  const TRACKS = 0x1654ae6b;
  const TRACK_ENTRY = 0xae;
  const TRACK_TYPE = 0x83;
  const CODEC_ID = 0x86;
  const AUDIO = 0xe1;
  const SAMPLING = 0xb5;
  const OUTPUT_SAMPLING = 0x78b5;

  let found = null;

  /** Call `visit` with every element between `start` and `end`. */
  const each = (start, end, visit) => {
    let at = start;
    while (at < end) {
      const id = vint(bytes, at, end, true);
      if (!id) return;
      const size = vint(bytes, id.next, end, false);
      if (!size) return;
      // An element may say it does not know its own length, which the Segment
      // in a recording being written live usually does. It runs to the end.
      const stop = size.unknown ? end : Math.min(end, size.next + size.value);
      if (stop < size.next) return;
      visit(id.value, size.next, stop);
      at = stop;
    }
  };

  each(0, bytes.length, (id, from, to) => {
    if (id !== SEGMENT) return;
    each(from, to, (segmentId, tracksFrom, tracksTo) => {
      if (segmentId !== TRACKS) return;
      each(tracksFrom, tracksTo, (tracksId, entryFrom, entryTo) => {
        if (tracksId !== TRACK_ENTRY) return;
        let isAudio = false;
        let codec = '';
        let rate = null;
        each(entryFrom, entryTo, (field, valueFrom, valueTo) => {
          if (field === TRACK_TYPE) isAudio = unsigned(bytes, valueFrom, valueTo) === 2;
          else if (field === CODEC_ID) codec = text(bytes, valueFrom, valueTo);
          else if (field === AUDIO) {
            each(valueFrom, valueTo, (inner, numberFrom, numberTo) => {
              // The output rate wins where a codec doubles the rate it stores.
              if (inner === SAMPLING && rate === null) rate = float(view, numberFrom, numberTo);
              else if (inner === OUTPUT_SAMPLING) rate = float(view, numberFrom, numberTo);
            });
          }
        });
        // Opus is handed back at 48 kHz by every decoder, whatever a container
        // claims it was recorded at - the same rule as in an Ogg file.
        if (isAudio && codec.includes('OPUS')) found = found ?? 48000;
        else if (isAudio && rate) found = found ?? rate;
      });
    });
  });

  return found;
}

/**
 * One variable-length integer.
 *
 * The number of leading zeros in the first byte says how many bytes it takes.
 * An id keeps that marker bit - it is part of what names the element - and a
 * length throws it away, which is the only difference between the two.
 */
function vint(bytes, at, end, keepMarker) {
  if (at >= end) return null;
  const first = bytes[at];
  if (first === 0) return null; // longer than eight bytes: not something here
  let length = 1;
  let mask = 0x80;
  while (!(first & mask)) { mask >>= 1; length += 1; }
  if (at + length > end || length > 8) return null;

  let value = keepMarker ? first : first & (mask - 1);
  let unknown = (first & (mask - 1)) === mask - 1;
  for (let i = 1; i < length; i += 1) {
    value = value * 256 + bytes[at + i];
    unknown = unknown && bytes[at + i] === 0xff;
  }
  return { value, next: at + length, unknown: !keepMarker && unknown };
}

const unsigned = (bytes, from, to) => {
  let value = 0;
  for (let at = from; at < to; at += 1) value = value * 256 + bytes[at];
  return value;
};

const text = (bytes, from, to) => {
  let out = '';
  for (let at = from; at < to && bytes[at]; at += 1) out += String.fromCharCode(bytes[at]);
  return out;
};

/** EBML floats are four or eight bytes, big-endian, and nothing else. */
function float(view, from, to) {
  if (to - from === 4) return view.getFloat32(from, false);
  if (to - from === 8) return view.getFloat64(from, false);
  return null;
}

/* ------------------------------------------------------------ MP3 and AAC */

/**
 * A file with no container at all: find the first frame header and read the
 * two bits that name the rate.
 *
 * ID3 tags are skipped rather than searched through, because a tag can hold a
 * picture, and a picture can hold any byte sequence at all - including one
 * that looks exactly like a frame header.
 *
 * This is the last thing tried, and it is the one that can be wrong, because
 * eleven bits of sync will eventually turn up inside anything. Two things keep
 * it honest: it only looks at the start of the file, where a raw stream keeps
 * its first frame, and every field of the candidate header has to make sense
 * before it is believed. Every container this browser can actually decode is
 * recognised above rather than left to this.
 */
function mpeg(bytes) {
  let at = 0;
  // "ID3" is three bytes, not four, so this is spelt out rather than going
  // through tag() - which would compare it against the version byte as well.
  const tagged = bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33;
  if (tagged && bytes.length > 10) {
    // A synchsafe integer: seven bits per byte, so no byte can look like sync.
    const size = ((bytes[6] & 0x7f) << 21) | ((bytes[7] & 0x7f) << 14)
      | ((bytes[8] & 0x7f) << 7) | (bytes[9] & 0x7f);
    at = 10 + size;
    if (bytes[5] & 0x10) at += 10; // a footer, if the flags say there is one
  }

  // A raw stream begins with its first frame, give or take a few bytes of
  // rubbish. Scanning further would be scanning the audio itself.
  const limit = Math.min(bytes.length - 4, at + 2048);
  for (; at <= limit; at += 1) {
    if (bytes[at] !== 0xff || (bytes[at + 1] & 0xe0) !== 0xe0) continue;
    const version = (bytes[at + 1] >> 3) & 0x03;
    const layer = (bytes[at + 1] >> 1) & 0x03;

    if (layer === 0) {
      // Not MPEG audio: layer 0 is reserved, and this is what ADTS AAC - an
      // .aac file straight out of a stream ripper - looks like instead. Its
      // rate is four bits, one byte earlier than the MPEG one.
      const profile = (bytes[at + 2] >> 6) & 0x03;
      const index = (bytes[at + 2] >> 2) & 0x0f;
      if (profile !== 3 && index < AAC_RATES.length) return AAC_RATES[index];
      continue;
    }

    const rates = MPEG_RATES[version];
    const bitrate = (bytes[at + 2] >> 4) & 0x0f;
    const index = (bytes[at + 2] >> 2) & 0x03;
    // Bitrate 0 is "free format" and 15 is reserved; neither appears in a file
    // anything will play, so either one means this was not a frame header.
    if (rates && index < 3 && bitrate > 0 && bitrate < 15) return rates[index];
  }
  return null;
}

/* ------------------------------------------------------------------ shared */

function tag(bytes, at) {
  if (at + 4 > bytes.length) return '';
  return String.fromCharCode(bytes[at], bytes[at + 1], bytes[at + 2], bytes[at + 3]);
}
