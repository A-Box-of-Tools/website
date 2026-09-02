/**
 * The description of an AAC track: reading one out of an `mp4a` sample entry,
 * and writing one round the configuration an encoder just produced.
 *
 * GENERATED INTO EACH TOOL. This file lives at shared/js/aac.js and the build
 * copies it to <tool>/src/shared/aac.js for the tools that ask for it with
 * `js_parts = ["aac", "mp4-boxes", ...]`: the video cutter, for the join
 * whose clips describe their sound differently, and the reverser, whose
 * sound cannot be carried across at all. Both re-encode the sound in their
 * own way; what they share is the two jobs the rest of the video tools never
 * needed, because everywhere else the sample entry is opaque bytes that are
 * copied as they are:
 *
 *   - **Reading a description.** `mp4a` wraps an `esds`, which wraps a chain
 *     of MPEG-4 descriptors, the innermost of which is the AudioSpecificConfig
 *     that an AAC decoder needs. Here it has to be opened.
 *   - **Writing one.** The encoder hands back a new AudioSpecificConfig, and
 *     it has to go back into the same nest of descriptors for the file to be
 *     readable.
 *
 * It imports `mp4-boxes` for the bytes.
 */

import { fourcc, bytes, concat, u16, u32, box } from './mp4-boxes.js';

/** What a re-encoded track is written as when the caller does not say. */
const DEFAULT_BITRATE = 160_000;

/* ------------------------------------------------------- reading a description */

/**
 * MPEG-4 descriptors carry their length as up to four bytes, seven bits at a
 * time, with the top bit meaning "another byte follows".
 */
function descriptorLength(view, at) {
  let value = 0;
  let next = at;
  for (let i = 0; i < 4; i++) {
    const byte = view.getUint8(next);
    next++;
    value = (value << 7) | (byte & 0x7f);
    if (!(byte & 0x80)) break;
  }
  return { value, next };
}

/** The AAC object type, which is the last number in the codec string. */
function objectType(asc) {
  if (!asc.length) return 2;
  const top = asc[0] >> 3;
  if (top !== 31) return top;
  // 31 is the escape: the real number is five bits further in, plus 32.
  if (asc.length < 2) return 2;
  return 32 + (((asc[0] & 0x7) << 3) | (asc[1] >> 5));
}

/**
 * Open an `mp4a` sample entry far enough to decode what it describes.
 *
 * @param {object} track  the demuxed audio track
 * @returns {{codec: string, description: Uint8Array, sampleRate: number,
 *            numberOfChannels: number}|null} null when this is not AAC in an
 *   `esds`, which is the only shape these tools know how to decode.
 */
export function audioDecoderConfig(track) {
  if (!track?.sampleEntry || track.entryType !== 'mp4a') return null;

  const entry = track.sampleEntry;
  const view = new DataView(entry.buffer, entry.byteOffset, entry.byteLength);

  // The box header, then the 28-byte audio sample entry, then child boxes.
  let at = 8 + 28;
  let esds = null;
  while (at + 8 <= entry.byteLength) {
    const size = view.getUint32(at);
    if (size < 8 || at + size > entry.byteLength) break;
    if (fourcc(view, at + 4) === 'esds') {
      esds = { body: at + 8, end: at + size };
      break;
    }
    at += size;
  }
  if (!esds) return null;

  try {
    let read = esds.body + 4;                       // version and flags
    if (view.getUint8(read) !== 0x03) return null;  // ES_Descriptor
    read = descriptorLength(view, read + 1).next;

    read += 2;                                      // ES_ID
    const flags = view.getUint8(read);
    read += 1;
    if (flags & 0x80) read += 2;                    // depends on another stream
    if (flags & 0x40) read += 1 + view.getUint8(read); // carries a URL
    if (flags & 0x20) read += 2;                    // has its own clock reference

    if (view.getUint8(read) !== 0x04) return null;  // DecoderConfigDescriptor
    read = descriptorLength(view, read + 1).next;

    const indication = view.getUint8(read);
    if (indication !== 0x40) return null;           // not MPEG-4 audio
    read += 1 + 1 + 3 + 4 + 4;                      // stream type, buffer, bitrates

    if (view.getUint8(read) !== 0x05) return null;  // DecoderSpecificInfo
    const length = descriptorLength(view, read + 1);
    const asc = new Uint8Array(
      entry.buffer.slice(
        entry.byteOffset + length.next, entry.byteOffset + length.next + length.value));
    if (!asc.length) return null;

    return {
      codec: `mp4a.40.${objectType(asc)}`,
      description: asc,
      sampleRate: Math.round(track.sampleRate),
      numberOfChannels: track.channels,
    };
  } catch {
    // A descriptor chain that runs off the end of the box. Not decodable here,
    // which is the same answer as "not AAC" as far as the caller is concerned.
    return null;
  }
}

/* ------------------------------------------------------- writing a description */

/**
 * One descriptor. The length is written as a single byte, which is legal and is
 * enough: the longest thing written here is an AudioSpecificConfig of five
 * bytes inside two wrappers, nowhere near the 127 a second byte would need.
 * The refusal is a phrase key, `audio.descriptor`, which both tools carry.
 */
function descriptor(tag, ...payload) {
  const body = concat(payload);
  if (body.byteLength > 0x7f) {
    throw new Error('audio.descriptor');
  }
  return concat([bytes(tag, body.byteLength), body]);
}

/**
 * An `mp4a` sample entry around an AudioSpecificConfig the encoder just gave us.
 *
 * The mirror of `audioDecoderConfig` above: same nest of descriptors, built
 * rather than read.
 */
export function mp4aSampleEntry({ channels, sampleRate, asc, bitrate = DEFAULT_BITRATE }) {
  const esds = box('esds', u32(0),
    descriptor(0x03,
      u16(1),           // ES_ID
      bytes(0x00),      // no dependency, no URL, no clock reference
      descriptor(0x04,
        bytes(0x40),    // MPEG-4 audio
        bytes(0x15),    // stream type 5 (audio), not upstream
        bytes(0, 0, 0), // buffer size, which no player checks
        u32(bitrate),   // max bitrate
        u32(bitrate),   // average bitrate
        descriptor(0x05, asc),
      ),
      descriptor(0x06, bytes(0x02)),   // SLConfig: predefined, "MP4 file"
    ),
  );

  return box('mp4a',
    new Uint8Array(6),  // reserved
    u16(1),             // data_reference_index
    new Uint8Array(8),  // version, revision, vendor
    u16(channels),
    u16(16),            // bits a sample, before the codec had its say
    u16(0),             // pre_defined
    u16(0),             // reserved
    u32(sampleRate << 16),
    esds,
  );
}
