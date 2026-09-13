/**
 * A Matroska reader: the WebM a browser records and the MKV a ripper writes,
 * turned into the same list of samples the MP4 reader hands back, so that
 * every tool built on that list can take these files too.
 *
 * GENERATED INTO EACH TOOL. This file lives at shared/js/mkv-reader.js and
 * the build copies it to <tool>/src/shared/mkv-reader.js for the tools that
 * ask for it with `js_parts = ["mkv-reader", "mp4-reader", ...]`. It imports
 * mp4-reader for the file window, the error class and the codec strings, so
 * a tool that ships this ships that.
 *
 * WHAT IT RETURNS
 *
 * Exactly what `demux()` in mp4-reader.js returns, field for field, with
 * three differences a caller has to know about:
 *
 *   - there is no `sampleEntry` and no `matrix`, because a Matroska file
 *     has neither. A tool that writes an MP4 from one of these builds the
 *     entry itself, out of `codec`, `description`, and the sizes;
 *   - the audio track carries `codec` and `description` of its own, because
 *     the format names its codecs in words rather than in a box the AAC
 *     helper knows how to open;
 *   - `dts` on a video sample is worked out, not read. A block carries only
 *     the time a frame is shown, and a file with B-frames stores frames in
 *     the order they are decoded, so the decode times are the presentation
 *     times sorted and shifted back by the longest wait - `decodeTimes`
 *     below, which is pure and tested. A sample's `pts` is the block's own
 *     time, and the first `dts` can be negative, which the MP4 writer turns
 *     into a composition offset and an edit.
 *
 * WHAT IT READS, AND HOW MUCH
 *
 * There is no index to read. A Matroska file is a run of clusters, each a
 * run of blocks, and the only way to know where every frame is is to walk
 * every block header - the header, never the frame. So this walks the whole
 * file once through the same eight-megabyte window the MP4 reader uses,
 * reading a dozen bytes at a time and skipping the frames between, and comes
 * back with offsets. A gigabyte takes as long as a gigabyte takes to read
 * from disk, which is the cost of a format with no table of contents.
 *
 * Sizes may be unknown. A recorder writes its Segment and its Clusters
 * before it knows how long they will be, and marks them so; such a cluster
 * ends where the next top-level element begins, and such a segment at the
 * end of the file. Every screen recording made in a browser is written that
 * way, and it is the commonest WebM there is.
 *
 * Lacing - several frames in one block, in any of three encodings - is read,
 * and each frame becomes a sample of its own with a time worked out from the
 * track's default duration, or spread evenly to the next block when there is
 * none. Content encodings (compression, encryption) are refused by name: the
 * frames would not be what the codec expects, and nothing here can undo it.
 */

import {
  FileWindow, UnsupportedFile, avcCodec, hevcCodec, av1Codec,
} from './mp4-reader.js';

/* -------------------------------------------------------------------- ids */

const EBML = 0x1a45dfa3;
const SEGMENT = 0x18538067;
const SEEK_HEAD = 0x114d9b74;
const INFO = 0x1549a966;
const TIMESTAMP_SCALE = 0x2ad7b1;
const DURATION = 0x4489;
const TRACKS = 0x1654ae6b;
const TRACK_ENTRY = 0xae;
const TRACK_NUMBER = 0xd7;
const TRACK_TYPE = 0x83;
const DEFAULT_DURATION = 0x23e383;
const CODEC_ID = 0x86;
const CODEC_PRIVATE = 0x63a2;
const VIDEO = 0xe0;
const PIXEL_WIDTH = 0xb0;
const PIXEL_HEIGHT = 0xba;
const DISPLAY_WIDTH = 0x54b0;
const DISPLAY_HEIGHT = 0x54ba;
const DISPLAY_UNIT = 0x54b2;
const AUDIO = 0xe1;
const SAMPLING_FREQUENCY = 0xb5;
const CHANNELS = 0x9f;
const CONTENT_ENCODINGS = 0x6d80;
const CLUSTER = 0x1f43b675;
const TIMESTAMP = 0xe7;
const SIMPLE_BLOCK = 0xa3;
const BLOCK_GROUP = 0xa0;
const BLOCK = 0xa1;
const REFERENCE_BLOCK = 0xfb;
const CUES = 0x1c53bb6b;
const TAGS = 0x1254c367;
const CHAPTERS = 0x1043a770;
const ATTACHMENTS = 0x1941a469;

/** What can follow a cluster at the top of a segment, and so what ends one of unknown size. */
const TOP_LEVEL = new Set([CLUSTER, CUES, TAGS, CHAPTERS, ATTACHMENTS, INFO, TRACKS, SEEK_HEAD]);

/** The first four bytes of every Matroska and WebM file. */
export const EBML_MAGIC = [0x1a, 0x45, 0xdf, 0xa3];

/** Whether a file starts the way a Matroska file does. Reads four bytes. */
export async function isMatroska(file) {
  if (file.size < 4) return false;
  const head = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  return EBML_MAGIC.every((byte, i) => head[i] === byte);
}

/* ------------------------------------------------------------- vints */

/** How many bytes a vint takes, from its first byte; 0 for the invalid 0x00. */
function vintWidth(first) {
  if (!first) return 0;
  let width = 1;
  let mask = 0x80;
  while (!(first & mask)) {
    width += 1;
    mask >>= 1;
  }
  return width;
}

/**
 * The size vint at `at` in `bytes`: its value, or null when it is the
 * reserved all-ones that means "unknown".
 */
function readSize(bytes, at) {
  const width = vintWidth(bytes[at]);
  if (!width || at + width > bytes.length) return null;
  let value = bytes[at] & (0xff >> width);
  let allOnes = value === (0xff >> width);
  for (let i = 1; i < width; i += 1) {
    value = value * 256 + bytes[at + i];
    if (bytes[at + i] !== 0xff) allOnes = false;
  }
  return { value: allOnes ? null : value, width };
}

/** An element id keeps its marker bits; that is how the ids above are spelled. */
function readId(bytes, at) {
  const width = vintWidth(bytes[at]);
  if (!width || width > 4 || at + width > bytes.length) return null;
  let value = 0;
  for (let i = 0; i < width; i += 1) value = value * 256 + bytes[at + i];
  return { value, width };
}

/* ------------------------------------------------- in-memory elements */

/** Walk the children of a master element already in memory. */
function* children(bytes, start, end) {
  let at = start;
  while (at < end) {
    const id = readId(bytes, at);
    if (!id) return;
    const size = readSize(bytes, at + id.width);
    if (!size) return;
    const body = at + id.width + size.width;
    const stop = size.value === null ? end : Math.min(end, body + size.value);
    yield { id: id.value, body, end: stop };
    at = stop;
  }
}

function uintOf(bytes, { body, end }) {
  let value = 0;
  for (let i = body; i < end; i += 1) value = value * 256 + bytes[i];
  return value;
}

function floatOf(bytes, { body, end }) {
  const view = new DataView(bytes.buffer, bytes.byteOffset + body, end - body);
  if (end - body === 4) return view.getFloat32(0);
  if (end - body === 8) return view.getFloat64(0);
  return 0;
}

function stringOf(bytes, { body, end }) {
  return new TextDecoder().decode(bytes.subarray(body, end)).replace(/\0+$/, '');
}

function copyOf(bytes, { body, end }) {
  return bytes.slice(body, end);
}

/* ----------------------------------------------------------------- tracks */

/**
 * "vp09.PP.LL.DD" from the CodecPrivate a VP9 track may carry: a list of
 * (id, length, value) features, of which profile, level and bit depth are
 * the three the string names. Without one, profile 0 at 8 bits, which is
 * nearly every VP9 file a browser has ever written.
 */
function vp9Codec(priv) {
  let profile = 0;
  let level = 10;
  let depth = 8;
  if (priv) {
    let at = 0;
    while (at + 2 <= priv.length) {
      const id = priv[at];
      const length = priv[at + 1];
      const value = length === 1 ? priv[at + 2] : 0;
      if (id === 1) profile = value;
      else if (id === 2) level = value;
      else if (id === 3) depth = value;
      at += 2 + length;
    }
  }
  const two = (n) => String(n).padStart(2, '0');
  return `vp09.${two(profile)}.${two(level)}.${two(depth)}`;
}

/** The AAC object type an AudioSpecificConfig starts with; 2 (LC) when there is none. */
function aacObjectType(asc) {
  if (!asc || !asc.length) return 2;
  const top = asc[0] >> 3;
  if (top !== 31) return top;
  if (asc.length < 2) return 2;
  return 32 + (((asc[0] & 0x7) << 3) | (asc[1] >> 5));
}

/** The sampling frequencies an AudioSpecificConfig can name by index. */
const AAC_RATES = [96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350];

/**
 * An AudioSpecificConfig for an AAC-LC track that arrived without one, which
 * old muxers wrote. Five bits of object type, four of rate index, four of
 * channel configuration, and three of zero.
 */
function syntheticAsc(sampleRate, channels) {
  const index = AAC_RATES.indexOf(Math.round(sampleRate));
  if (index < 0) throw new UnsupportedFile('read.mkvaudio', { type: 'A_AAC' });
  const bits = (2 << 11) | (index << 7) | ((Math.min(channels, 7)) << 3);
  return new Uint8Array([bits >> 8, bits & 0xff]);
}

/** The codec ids this reader turns into a WebCodecs string. */
function videoCodecOf(codecId, priv) {
  switch (codecId) {
    case 'V_MPEG4/ISO/AVC':
      if (!priv) throw new UnsupportedFile('read.noconfig', { type: codecId });
      return { codec: avcCodec('avc1', priv), description: priv };
    case 'V_MPEGH/ISO/HEVC':
      if (!priv) throw new UnsupportedFile('read.noconfig', { type: codecId });
      return { codec: hevcCodec('hvc1', priv), description: priv };
    case 'V_VP8':
      return { codec: 'vp8', description: null };
    case 'V_VP9':
      return { codec: vp9Codec(priv), description: null };
    case 'V_AV1':
      return { codec: priv && priv.length >= 3 ? av1Codec(priv) : 'av01.0.08M.08', description: null };
    default:
      throw new UnsupportedFile('read.mkvcodec', { type: codecId });
  }
}

function audioCodecOf(codecId, priv, sampleRate, channels) {
  if (codecId.startsWith('A_AAC')) {
    const asc = priv && priv.length ? priv : syntheticAsc(sampleRate, channels);
    return { codec: `mp4a.40.${aacObjectType(asc)}`, description: asc, aac: true };
  }
  switch (codecId) {
    case 'A_OPUS': return { codec: 'opus', description: priv, aac: false };
    case 'A_VORBIS': return { codec: 'vorbis', description: priv, aac: false };
    case 'A_MPEG/L3': return { codec: 'mp3', description: null, aac: false };
    case 'A_FLAC': return { codec: 'flac', description: priv, aac: false };
    case 'A_AC3': return { codec: 'ac-3', description: null, aac: false };
    case 'A_EAC3': return { codec: 'ec-3', description: null, aac: false };
    default:
      // Named rather than refused: the sound of a file can be left out, and
      // the caller decides whether that is an answer.
      return { codec: null, description: null, aac: false, codecId };
  }
}

function readTrackEntry(bytes, entry) {
  const track = {
    number: 0, type: 0, codecId: '', codecPrivate: null, defaultDuration: 0,
    width: 0, height: 0, displayWidth: 0, displayHeight: 0, displayUnit: 0,
    sampleRate: 0, channels: 0, encoded: false,
  };
  for (const child of children(bytes, entry.body, entry.end)) {
    switch (child.id) {
      case TRACK_NUMBER: track.number = uintOf(bytes, child); break;
      case TRACK_TYPE: track.type = uintOf(bytes, child); break;
      case CODEC_ID: track.codecId = stringOf(bytes, child); break;
      case CODEC_PRIVATE: track.codecPrivate = copyOf(bytes, child); break;
      case DEFAULT_DURATION: track.defaultDuration = uintOf(bytes, child); break;
      case CONTENT_ENCODINGS: track.encoded = true; break;
      case VIDEO:
        for (const v of children(bytes, child.body, child.end)) {
          if (v.id === PIXEL_WIDTH) track.width = uintOf(bytes, v);
          else if (v.id === PIXEL_HEIGHT) track.height = uintOf(bytes, v);
          else if (v.id === DISPLAY_WIDTH) track.displayWidth = uintOf(bytes, v);
          else if (v.id === DISPLAY_HEIGHT) track.displayHeight = uintOf(bytes, v);
          else if (v.id === DISPLAY_UNIT) track.displayUnit = uintOf(bytes, v);
        }
        break;
      case AUDIO:
        for (const a of children(bytes, child.body, child.end)) {
          if (a.id === SAMPLING_FREQUENCY) track.sampleRate = floatOf(bytes, a);
          else if (a.id === CHANNELS) track.channels = uintOf(bytes, a);
        }
        break;
      default: break;
    }
  }
  return track;
}

/* ---------------------------------------------------------------- blocks */

/**
 * The frames inside one block: where each starts within the block and how
 * long it is, from the block header and whatever lacing it declares.
 *
 * @param {Uint8Array} head  the first bytes of the block payload
 * @param {number} size  the whole block payload's length
 */
function parseBlock(head, size) {
  const track = readSize(head, 0);   // the track number is a plain vint
  if (!track || track.value === null) throw new UnsupportedFile('read.lacing');
  let at = track.width;
  if (at + 3 > head.length) throw new UnsupportedFile('read.lacing');
  const offset = (head[at] << 8 | head[at + 1]) << 16 >> 16;   // signed sixteen bits
  const flags = head[at + 2];
  at += 3;

  const lacing = (flags >> 1) & 0x3;
  const isKey = Boolean(flags & 0x80);

  if (lacing === 0) {
    return { track: track.value, offset, isKey, frames: [{ at, size: size - at }] };
  }

  if (at >= head.length) throw new UnsupportedFile('read.lacing');
  const count = head[at] + 1;
  at += 1;
  const sizes = [];

  if (lacing === 1) {
    // Xiph: each size but the last as a run of 255s and a remainder.
    for (let i = 0; i < count - 1; i += 1) {
      let frame = 0;
      for (;;) {
        if (at >= head.length) throw new UnsupportedFile('read.lacing');
        const byte = head[at];
        at += 1;
        frame += byte;
        if (byte !== 255) break;
      }
      sizes.push(frame);
    }
  } else if (lacing === 3) {
    // EBML: the first size as a vint, each later one as a signed difference.
    const first = readSize(head, at);
    if (!first || first.value === null) throw new UnsupportedFile('read.lacing');
    sizes.push(first.value);
    at += first.width;
    for (let i = 1; i < count - 1; i += 1) {
      const raw = readSize(head, at);
      if (!raw || raw.value === null) throw new UnsupportedFile('read.lacing');
      const half = 2 ** (7 * raw.width - 1) - 1;
      sizes.push(sizes[sizes.length - 1] + raw.value - half);
      at += raw.width;
    }
  } else {
    // Fixed: every frame the same size, and the count says how many.
    const each = (size - at) / count;
    if (!Number.isInteger(each)) throw new UnsupportedFile('read.lacing');
    for (let i = 0; i < count - 1; i += 1) sizes.push(each);
  }

  const used = sizes.reduce((sum, frame) => sum + frame, 0);
  const last = size - at - used;
  if (last < 0 || sizes.some((frame) => frame < 0)) throw new UnsupportedFile('read.lacing');
  sizes.push(last);

  const frames = [];
  let start = at;
  for (const frame of sizes) {
    frames.push({ at: start, size: frame });
    start += frame;
  }
  return { track: track.value, offset, isKey, frames };
}

/* -------------------------------------------------------------- timing */

/**
 * Decode times for frames stored in decode order with only their
 * presentation times known.
 *
 * Sorted, the presentation times are the order the frames are watched in;
 * the i-th frame decoded must be shown no earlier than the i-th frame shown,
 * so the sorted list, shifted back by the largest gap between a frame's
 * decode rank and its own time, is a decode clock that never runs ahead of
 * any frame. For a file without B-frames the shift is zero and the two
 * clocks are the same.
 *
 * @param {number[]} pts  in decode order
 * @returns {number[]} dts, same order, each no later than its pts
 */
export function decodeTimes(pts) {
  const sorted = [...pts].sort((a, b) => a - b);
  let shift = 0;
  for (let i = 0; i < pts.length; i += 1) shift = Math.max(shift, sorted[i] - pts[i]);
  return sorted.map((time) => time - shift);
}

/* ----------------------------------------------------------------- demux */

/**
 * @param {File} file
 * @returns {Promise<{video: object, audio: object|null, duration: number}>}
 * @throws {UnsupportedFile}
 */
export async function demuxMatroska(file) {
  if (!(await isMatroska(file))) throw new UnsupportedFile('read.notmkv');
  const window = new FileWindow(file);

  /** An element header at `at`, or null at the end of the file. */
  const header = async (at) => {
    const length = Math.min(12, file.size - at);
    if (length < 2) return null;
    const bytes = await window.read(at, length);
    const id = readId(bytes, 0);
    if (!id) throw new UnsupportedFile('read.layout');
    const size = readSize(bytes, id.width);
    if (!size) throw new UnsupportedFile('read.layout');
    const body = at + id.width + size.width;
    return {
      id: id.value,
      body,
      size: size.value,
      end: size.value === null ? null : Math.min(file.size, body + size.value),
    };
  };

  const first = await header(0);
  if (!first || first.id !== EBML) throw new UnsupportedFile('read.notmkv');
  if (first.end === null) throw new UnsupportedFile('read.layout');

  const segment = await header(first.end);
  if (!segment || segment.id !== SEGMENT) throw new UnsupportedFile('read.nosegment');
  const segmentEnd = segment.end ?? file.size;

  let timestampScale = 1_000_000;
  let declaredDuration = 0;
  let tracks = null;
  /** Blocks by track number: {time, isKey, offset, frames: [{at, size}]} */
  const blocks = new Map();

  const takeBlock = (blockHead, blockSize, blockAt, clusterTime, isKeyOverride) => {
    const parsed = parseBlock(blockHead, blockSize);
    const list = blocks.get(parsed.track) ?? [];
    if (!list.length) blocks.set(parsed.track, list);
    list.push({
      time: clusterTime + parsed.offset,
      isKey: isKeyOverride ?? parsed.isKey,
      frames: parsed.frames.map((frame) => ({ offset: blockAt + frame.at, size: frame.size })),
    });
  };

  const readBlockHead = async (at, size) => window.read(at, Math.min(size, 4096));

  /** Walk one cluster; returns where the next top-level element starts. */
  const cluster = async (open) => {
    let time = 0;
    let at = open.body;
    const end = open.end ?? segmentEnd;
    while (at < end) {
      const child = await header(at);
      if (!child) break;
      if (open.end === null && TOP_LEVEL.has(child.id)) return at;
      if (child.end === null) throw new UnsupportedFile('read.layout');

      if (child.id === TIMESTAMP) {
        time = uintOf(await window.read(child.body, child.end - child.body), { body: 0, end: child.end - child.body });
      } else if (child.id === SIMPLE_BLOCK) {
        takeBlock(await readBlockHead(child.body, child.size), child.size, child.body, time, undefined);
      } else if (child.id === BLOCK_GROUP) {
        let block = null;
        let referenced = false;
        for (let inner = child.body; inner < child.end;) {
          const part = await header(inner);
          if (!part || part.end === null) break;
          if (part.id === BLOCK) block = part;
          else if (part.id === REFERENCE_BLOCK) referenced = true;
          inner = part.end;
        }
        if (block) {
          takeBlock(await readBlockHead(block.body, block.size), block.size, block.body, time, !referenced);
        }
      }
      at = child.end;
    }
    return end;
  };

  let at = segment.body;
  while (at < segmentEnd) {
    const found = await header(at);
    if (!found) break;

    if (found.id === INFO) {
      if (found.end === null) throw new UnsupportedFile('read.layout');
      const bytes = await window.read(found.body, found.end - found.body);
      for (const child of children(bytes, 0, bytes.length)) {
        if (child.id === TIMESTAMP_SCALE) timestampScale = uintOf(bytes, child) || timestampScale;
        else if (child.id === DURATION) declaredDuration = floatOf(bytes, child);
      }
      at = found.end;
    } else if (found.id === TRACKS) {
      if (found.end === null) throw new UnsupportedFile('read.layout');
      const bytes = await window.read(found.body, found.end - found.body);
      tracks = [];
      for (const child of children(bytes, 0, bytes.length)) {
        if (child.id === TRACK_ENTRY) tracks.push(readTrackEntry(bytes, child));
      }
      at = found.end;
    } else if (found.id === CLUSTER) {
      at = await cluster(found);
    } else {
      if (found.end === null) throw new UnsupportedFile('read.layout');
      at = found.end;
    }
  }

  if (!tracks) throw new UnsupportedFile('read.mkvtracks');
  const videoEntry = tracks.find((track) => track.type === 1);
  const audioEntry = tracks.find((track) => track.type === 2);
  if (!videoEntry) throw new UnsupportedFile('read.novideo');
  if (videoEntry.encoded || audioEntry?.encoded) throw new UnsupportedFile('read.mkvencoded');

  // Ticks per second on the file's own clock. A millisecond, nearly always.
  const timescale = Math.max(1, Math.round(1_000_000_000 / timestampScale));

  const expand = (entry, keyed) => {
    const list = blocks.get(entry.number) ?? [];
    const step = entry.defaultDuration ? entry.defaultDuration / timestampScale : 0;
    const samples = [];
    list.forEach((block, index) => {
      const count = block.frames.length;
      // Laced frames share a block time; each after the first is a default
      // duration on, or an even share of the gap to the next block.
      const next = list[index + 1];
      const gap = next ? (next.time - block.time) / count : step;
      block.frames.forEach((frame, i) => {
        const pts = block.time + i * (step || gap);
        samples.push({ offset: frame.offset, size: frame.size, dts: pts, pts, isKey: keyed || block.isKey });
      });
    });
    // The track runs until its last frame has been shown for as long as a
    // frame lasts: the default duration when there is one, else the gap the
    // last two frames left. Frames are in decode order, so the last shown is
    // found by looking rather than assumed.
    let duration = 0;
    if (samples.length) {
      let latest = 0;
      for (const sample of samples) latest = Math.max(latest, sample.pts);
      const last = samples[samples.length - 1];
      const before = samples[samples.length - 2];
      duration = latest + (step || (before ? Math.abs(last.pts - before.pts) : 0));
    }
    return { samples, duration, step };
  };

  const picture = expand(videoEntry, false);
  if (!picture.samples.length) throw new UnsupportedFile('read.nosamples');
  const dts = decodeTimes(picture.samples.map((s) => s.pts));
  picture.samples.forEach((sample, i) => { sample.dts = dts[i]; });

  const { codec, description } = videoCodecOf(videoEntry.codecId, videoEntry.codecPrivate);
  const pixels = videoEntry.displayUnit === 0 && videoEntry.displayWidth && videoEntry.displayHeight;
  const video = {
    trackId: videoEntry.number,
    codecId: videoEntry.codecId,
    codec,
    description,
    sampleEntry: null,
    matrix: null,
    entryType: null,
    codedWidth: videoEntry.width,
    codedHeight: videoEntry.height,
    displayWidth: pixels ? videoEntry.displayWidth : videoEntry.width,
    displayHeight: pixels ? videoEntry.displayHeight : videoEntry.height,
    rotation: 0,
    timescale,
    duration: Math.round(declaredDuration || picture.duration),
    defaultDuration: videoEntry.defaultDuration,
    samples: picture.samples,
  };

  let audio = null;
  if (audioEntry) {
    const sound = expand(audioEntry, true);
    if (sound.samples.length) {
      const named = audioCodecOf(
        audioEntry.codecId, audioEntry.codecPrivate, audioEntry.sampleRate, audioEntry.channels,
      );
      audio = {
        trackId: audioEntry.number,
        codecId: audioEntry.codecId,
        codec: named.codec,
        description: named.description,
        aac: named.aac,
        sampleEntry: null,
        entryType: null,
        channels: audioEntry.channels,
        sampleRate: audioEntry.sampleRate,
        timescale,
        duration: Math.round(declaredDuration || sound.duration),
        defaultDuration: audioEntry.defaultDuration,
        samples: sound.samples,
      };
    }
  }

  const seconds = (declaredDuration || Math.max(picture.duration, audio ? audio.duration : 0)) / timescale;
  return { video, audio, duration: seconds };
}
