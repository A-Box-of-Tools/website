/**
 * A small Matroska writer: enough to make a WebM or MKV file out of frames
 * that were encoded elsewhere.
 *
 * GENERATED INTO EACH TOOL. This file lives at shared/js/mkv-writer.js and
 * the build copies it to <tool>/src/shared/mkv-writer.js for the tools that
 * ask for it with `js_parts = ["mkv-writer", ...]`. It imports nothing.
 *
 * WHY THE SITE WRITES A FORMAT IT DOES NOT OFFER
 *
 * Nothing here is offered a WebM to download; the roadmap says why under
 * "…or WebM". This exists for the other direction. The MP4 converter reads
 * WebM and MKV, its "Try an example" button has to hand it one, and the
 * page's own policy forbids fetching a file - so the example is built in the
 * page, out of frames a VideoEncoder just produced, by this. The tests use
 * it for the same reason: a reader is only as tested as the files it was
 * shown, and the files it is shown here are written by this and checked
 * against the bytes the specification says.
 *
 * WHAT IT WRITES
 *
 * An EBML header, then one Segment holding Info, Tracks and Clusters. No
 * SeekHead, no Cues: a player can walk the clusters, and the only reader
 * this has to satisfy does. Each cluster is opened on a video keyframe, or
 * when the block clock would otherwise run past the sixteen bits a block
 * has for its offset from the cluster.
 *
 * With `live: true` it writes what a recorder writes: a Segment and
 * Clusters of unknown size, and no Duration in Info, because a recorder does
 * not know how long the recording will be when it writes the header. Files
 * like that are the commonest WebM there is - every screen recording made in
 * a browser is one - and the reader has to be shown one.
 *
 * Lacing - several frames in one block - is written when asked, in each of
 * the three forms the format allows. No encoder here needs it; it is there
 * because files that use it exist and the reader is tested against it.
 */

/* ------------------------------------------------------------------ EBML */

/** The element ids this file writes, marker bits included. */
export const ID = {
  EBML: 0x1a45dfa3,
  EBMLVersion: 0x4286,
  EBMLReadVersion: 0x42f7,
  EBMLMaxIDLength: 0x42f2,
  EBMLMaxSizeLength: 0x42f3,
  DocType: 0x4282,
  DocTypeVersion: 0x4287,
  DocTypeReadVersion: 0x4285,
  Segment: 0x18538067,
  SeekHead: 0x114d9b74,
  Info: 0x1549a966,
  TimestampScale: 0x2ad7b1,
  Duration: 0x4489,
  MuxingApp: 0x4d80,
  WritingApp: 0x5741,
  Tracks: 0x1654ae6b,
  TrackEntry: 0xae,
  TrackNumber: 0xd7,
  TrackUID: 0x73c5,
  TrackType: 0x83,
  FlagLacing: 0x9c,
  DefaultDuration: 0x23e383,
  CodecID: 0x86,
  CodecPrivate: 0x63a2,
  CodecDelay: 0x56aa,
  SeekPreRoll: 0x56bb,
  Video: 0xe0,
  PixelWidth: 0xb0,
  PixelHeight: 0xba,
  DisplayWidth: 0x54b0,
  DisplayHeight: 0x54ba,
  DisplayUnit: 0x54b2,
  Audio: 0xe1,
  SamplingFrequency: 0xb5,
  Channels: 0x9f,
  BitDepth: 0x6264,
  ContentEncodings: 0x6d80,
  Cluster: 0x1f43b675,
  Timestamp: 0xe7,
  SimpleBlock: 0xa3,
  BlockGroup: 0xa0,
  Block: 0xa1,
  BlockDuration: 0x9b,
  ReferenceBlock: 0xfb,
  Cues: 0x1c53bb6b,
  Tags: 0x1254c367,
  Chapters: 0x1043a770,
  Attachments: 0x1941a469,
  Void: 0xec,
  CRC32: 0xbf,
};

/** The one-byte size that means "as long as it turns out to be". */
const UNKNOWN_SIZE = new Uint8Array([0xff]);

/** The eight-byte form of the same, which is what recorders write for a Segment. */
const UNKNOWN_SIZE_WIDE = new Uint8Array([0x01, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);

/**
 * A size or a lace length as a variable-length integer: the number of leading
 * zero bits in the first byte, plus one, is the number of bytes.
 *
 * The all-ones value of any width is reserved for "unknown", so a value that
 * would come out as all ones is written one byte wider. The widths are
 * chosen as short as they can be, which is the form every reader accepts and
 * what a reader test can pin to exact bytes.
 */
export function vint(value) {
  if (!Number.isInteger(value) || value < 0) throw new Error('mkv.badsize');
  for (let width = 1; width <= 8; width += 1) {
    const room = 2 ** (7 * width) - 1;   // all ones is reserved
    if (value < room) {
      const out = new Uint8Array(width);
      let rest = value;
      for (let i = width - 1; i >= 0; i -= 1) {
        out[i] = rest % 256;
        rest = Math.floor(rest / 256);
      }
      out[0] |= 0x80 >> (width - 1);
      return out;
    }
  }
  throw new Error('mkv.badsize');
}

/**
 * The signed form EBML lacing uses for the difference between one frame's
 * size and the last: the value plus half the range of its width, so a
 * negative difference fits in the same bytes.
 */
export function signedVint(value) {
  for (let width = 1; width <= 8; width += 1) {
    const half = 2 ** (7 * width - 1) - 1;
    if (value >= -half && value <= half) return vint(value + half);
  }
  throw new Error('mkv.badsize');
}

/** An element id as the bytes it is written with - the marker bits are part of the id. */
function idBytes(id) {
  const out = [];
  let rest = id;
  while (rest > 0) {
    out.unshift(rest % 256);
    rest = Math.floor(rest / 256);
  }
  return new Uint8Array(out);
}

export function concat(parts) {
  let length = 0;
  for (const part of parts) length += part.byteLength;
  const out = new Uint8Array(length);
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.byteLength;
  }
  return out;
}

/** One element: id, size, payload. `size` may be given as UNKNOWN for a live master. */
export function element(id, payload, { unknown = false, wide = false } = {}) {
  const body = payload instanceof Uint8Array ? payload : concat(payload);
  const size = unknown ? (wide ? UNKNOWN_SIZE_WIDE : UNKNOWN_SIZE) : vint(body.byteLength);
  return concat([idBytes(id), size, body]);
}

/** An unsigned integer in as few bytes as it needs (at least one). */
export function uint(id, value) {
  const out = [];
  let rest = value;
  do {
    out.unshift(rest % 256);
    rest = Math.floor(rest / 256);
  } while (rest > 0);
  return element(id, new Uint8Array(out));
}

/** A float, always as a double: eight bytes is what every reader takes. */
export function float(id, value) {
  const out = new Uint8Array(8);
  new DataView(out.buffer).setFloat64(0, value);
  return element(id, out);
}

export function string(id, text) {
  return element(id, new TextEncoder().encode(text));
}

export function binary(id, bytes) {
  return element(id, bytes);
}

/* ----------------------------------------------------------------- lacing */

/**
 * The block payload for several frames in one block, in the form asked for.
 *
 *   - `xiph`: each size but the last as a run of 255s and a remainder;
 *   - `ebml`: the first size as a vint, each later one as a signed vint
 *     difference from the size before it;
 *   - `fixed`: nothing at all, because every frame is the same size and the
 *     count says how many.
 *
 * The last frame's size is never written: it is whatever is left.
 */
function lace(frames, mode) {
  const count = frames.length;
  if (count > 256) throw new Error('mkv.toomanyframes');
  const head = [new Uint8Array([count - 1])];

  if (mode === 'xiph') {
    for (let i = 0; i < count - 1; i += 1) {
      let size = frames[i].byteLength;
      const run = [];
      while (size >= 255) { run.push(255); size -= 255; }
      run.push(size);
      head.push(new Uint8Array(run));
    }
  } else if (mode === 'ebml') {
    head.push(vint(frames[0].byteLength));
    for (let i = 1; i < count - 1; i += 1) {
      head.push(signedVint(frames[i].byteLength - frames[i - 1].byteLength));
    }
  } else if (mode === 'fixed') {
    const size = frames[0].byteLength;
    if (frames.some((frame) => frame.byteLength !== size)) throw new Error('mkv.unevenframes');
  } else {
    throw new Error('mkv.badlacing');
  }

  return concat([...head, ...frames]);
}

const LACING_FLAG = { xiph: 0x02, fixed: 0x04, ebml: 0x06 };

/* ----------------------------------------------------------------- writer */

/** Sixteen bits, signed, is how far a block may sit from its cluster's clock. */
const BLOCK_REACH = 32767;

export class MkvWriter {
  /**
   * @param {object} [options]
   * @param {number} [options.timestampScale]  nanoseconds per tick; a
   *   millisecond, which is what nearly every file uses, unless told otherwise
   * @param {boolean} [options.live]  write unknown sizes and no duration,
   *   the way a recorder does
   * @param {string} [options.docType]  "webm" or "matroska"
   */
  constructor({ timestampScale = 1_000_000, live = false, docType = 'webm' } = {}) {
    this.timestampScale = timestampScale;
    this.live = live;
    this.docType = docType;
    this.tracks = [];
    /** Blocks in the order they were added: {track, time, isKey, payload, group} */
    this.blocks = [];
    this.leading = [];   // elements to put before the first cluster, for tests
    this.trailing = [];  // and after the last one
  }

  /**
   * @returns {number} the track number, which is what a block names
   */
  addVideoTrack({
    codecId, codecPrivate = null, width, height,
    displayWidth = 0, displayHeight = 0, defaultDuration = 0, extra = [],
  }) {
    const number = this.tracks.length + 1;
    this.tracks.push({
      number, type: 1, codecId, codecPrivate, defaultDuration, extra,
      video: { width, height, displayWidth, displayHeight },
    });
    return number;
  }

  addAudioTrack({
    codecId, codecPrivate = null, sampleRate, channels, bitDepth = 0,
    defaultDuration = 0, codecDelay = 0, seekPreRoll = 0, extra = [],
  }) {
    const number = this.tracks.length + 1;
    this.tracks.push({
      number, type: 2, codecId, codecPrivate, defaultDuration, extra, codecDelay, seekPreRoll,
      audio: { sampleRate, channels, bitDepth },
    });
    return number;
  }

  /**
   * One block. A SimpleBlock unless `group` is given, in which case it is a
   * Block inside a BlockGroup carrying that duration and, unless the frame is
   * a keyframe, a reference to the block before it.
   *
   * @param {number} track  the number addVideoTrack/addAudioTrack returned
   * @param {object} block
   * @param {number} block.time  in ticks of timestampScale
   * @param {boolean} [block.isKey]
   * @param {Uint8Array} [block.data]  one frame, or
   * @param {Uint8Array[]} [block.frames]  several, laced as `lacing` says
   * @param {'xiph'|'ebml'|'fixed'} [block.lacing]
   * @param {{duration?: number}} [block.group]
   */
  addBlock(track, { time, isKey = true, data, frames, lacing = 'ebml', group = null }) {
    let payload;
    let flags = 0;
    if (frames) {
      payload = lace(frames, lacing);
      flags |= LACING_FLAG[lacing];
    } else {
      payload = data;
    }
    this.blocks.push({ track, time: Math.round(time), isKey, payload, flags, group });
  }

  #trackEntry(track) {
    const parts = [
      uint(ID.TrackNumber, track.number),
      uint(ID.TrackUID, track.number),
      uint(ID.TrackType, track.type),
      uint(ID.FlagLacing, 1),
      string(ID.CodecID, track.codecId),
    ];
    if (track.defaultDuration) parts.push(uint(ID.DefaultDuration, track.defaultDuration));
    if (track.codecDelay) parts.push(uint(ID.CodecDelay, track.codecDelay));
    if (track.seekPreRoll) parts.push(uint(ID.SeekPreRoll, track.seekPreRoll));
    if (track.codecPrivate) parts.push(binary(ID.CodecPrivate, track.codecPrivate));
    if (track.video) {
      const v = track.video;
      const video = [uint(ID.PixelWidth, v.width), uint(ID.PixelHeight, v.height)];
      if (v.displayWidth) video.push(uint(ID.DisplayWidth, v.displayWidth));
      if (v.displayHeight) video.push(uint(ID.DisplayHeight, v.displayHeight));
      parts.push(element(ID.Video, video));
    }
    if (track.audio) {
      const a = track.audio;
      const audio = [float(ID.SamplingFrequency, a.sampleRate), uint(ID.Channels, a.channels)];
      if (a.bitDepth) audio.push(uint(ID.BitDepth, a.bitDepth));
      parts.push(element(ID.Audio, audio));
    }
    parts.push(...track.extra);
    return element(ID.TrackEntry, parts);
  }

  #block(block, clusterTime) {
    const offset = block.time - clusterTime;
    const head = new Uint8Array(4);
    head[0] = 0x80 | block.track;   // track numbers here are always under 127
    head[1] = (offset >> 8) & 0xff;
    head[2] = offset & 0xff;
    head[3] = block.flags | (block.group ? 0 : (block.isKey ? 0x80 : 0));
    const body = concat([head, block.payload]);

    if (!block.group) return element(ID.SimpleBlock, body);

    const parts = [element(ID.Block, body)];
    if (block.group.duration) parts.push(uint(ID.BlockDuration, block.group.duration));
    // A reference to the block before it is how a BlockGroup says "not a
    // keyframe"; there is no flag for it.
    if (!block.isKey) parts.push(element(ID.ReferenceBlock, signedVintBytes(-1)));
    return element(ID.BlockGroup, parts);
  }

  /** @returns {Uint8Array} the whole file */
  bytes() {
    const header = element(ID.EBML, [
      uint(ID.EBMLVersion, 1),
      uint(ID.EBMLReadVersion, 1),
      uint(ID.EBMLMaxIDLength, 4),
      uint(ID.EBMLMaxSizeLength, 8),
      string(ID.DocType, this.docType),
      uint(ID.DocTypeVersion, 4),
      uint(ID.DocTypeReadVersion, 2),
    ]);

    // The file lasts until its latest block has played for as long as a
    // block on that track lasts, which is only known for a track that
    // declares a default duration.
    let ticks = 0;
    for (const block of this.blocks) {
      const track = this.tracks[block.track - 1];
      const tail = track?.defaultDuration ? track.defaultDuration / this.timestampScale : 0;
      ticks = Math.max(ticks, block.time + tail);
    }

    const info = [
      uint(ID.TimestampScale, this.timestampScale),
      string(ID.MuxingApp, 'abox.tools'),
      string(ID.WritingApp, 'abox.tools'),
    ];
    if (!this.live) info.push(float(ID.Duration, ticks));

    const clusters = [];
    let open = null;
    for (const block of this.blocks) {
      const track = this.tracks[block.track - 1];
      const keyVideo = track?.type === 1 && block.isKey;
      if (!open || keyVideo || block.time - open.time > BLOCK_REACH || block.time < open.time) {
        open = { time: block.time, parts: [uint(ID.Timestamp, block.time)] };
        clusters.push(open);
      }
      open.parts.push(this.#block(block, open.time));
    }

    const segment = [
      element(ID.Info, info),
      element(ID.Tracks, this.tracks.map((track) => this.#trackEntry(track))),
      ...this.leading,
      ...clusters.map((cluster) => element(ID.Cluster, cluster.parts, { unknown: this.live })),
      ...this.trailing,
    ];

    return concat([header, element(ID.Segment, segment, { unknown: this.live, wide: true })]);
  }

  /** @returns {Blob} */
  finalize() {
    const type = this.docType === 'webm' ? 'video/webm' : 'video/x-matroska';
    return new Blob([this.bytes()], { type });
  }
}

/** A signed integer element payload, as few bytes as it needs. */
function signedVintBytes(value) {
  const out = [];
  let rest = value;
  do {
    out.unshift(rest & 0xff);
    rest >>= 8;
  } while (rest !== 0 && rest !== -1);
  // Sign-extend if the top bit does not already say what the sign is.
  if ((value < 0) !== Boolean(out[0] & 0x80)) out.unshift(value < 0 ? 0xff : 0x00);
  return new Uint8Array(out);
}
