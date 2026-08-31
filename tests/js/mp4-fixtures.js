/**
 * Building real MP4s to read back.
 *
 * The demuxer under test opens files somebody else wrote, so its tests need
 * files somebody else wrote - or the nearest honest substitute, which is one
 * assembled here with the tables worked out rather than asserted. A fixture
 * whose chunk offsets were copied from the reader's own arithmetic would agree
 * with a broken reader and never touch the case that matters.
 *
 * So the offsets here are computed forward from the sample sizes: samples are
 * laid down in `mdat` back to back in sample order, and a chunk's offset is the
 * sum of the sizes in front of it. The reader has to arrive at the same numbers
 * from `stsc`, `stsz` and `stco`, which are three different shapes of the same
 * fact. Nothing in this file imports the reader.
 *
 * The boxes are written the way a muxer writes them rather than the smallest
 * arrangement the reader would accept: the fixed 78-byte visual sample entry
 * header, a real display matrix, `mdhd` and `hdlr` where a track keeps them.
 * A reader that only passes against a stripped-down fixture has not been tested
 * against anything anybody will actually open.
 */

import { ascii, concat, u16be, u32be } from './helpers.js';

/* ------------------------------------------------------------ box plumbing */

const u24be = (n) => new Uint8Array([(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]);

/** Two's complement, so a negative matrix entry can be written as one. */
export const s32be = (n) => u32be(n >>> 0);

export const u64be = (n) => concat(u32be(Math.floor(n / 2 ** 32)), u32be(n >>> 0));

export const zeros = (n) => new Uint8Array(n);

/** size, type, payload - the shape every box in the file has. */
export function box(type, ...payload) {
  const body = concat(...payload);
  return concat(u32be(8 + body.length), ascii(type), body);
}

/** A box whose first four payload bytes are a version and three flag bytes. */
export function full(type, version, flags, ...payload) {
  return box(type, new Uint8Array([version]), u24be(flags), ...payload);
}

/**
 * A box written with the 64-bit `largesize` escape: size 1, then the real size
 * as eight bytes after the type. Files over 4 GB use it for `mdat`, and a
 * reader that skips the extra eight bytes lands mid-box on everything after it.
 */
export function largeBox(type, ...payload) {
  const body = concat(...payload);
  return concat(u32be(1), ascii(type), u64be(16 + body.length), body);
}

/* ------------------------------------------------------------------ matrix */

/**
 * The 3x3 display matrix, as the nine 16.16 fixed-point values `tkhd` carries.
 * Only a, b, c and d say anything about rotation; the reader ignores the rest.
 */
export function matrix(rotation = 0) {
  const ONE = 0x00010000;
  const NEG = -0x00010000;
  const abcd = {
    0: [ONE, 0, 0, ONE],
    90: [0, ONE, NEG, 0],
    180: [NEG, 0, 0, NEG],
    270: [0, NEG, ONE, 0],
  }[rotation];
  if (!abcd) throw new Error(`no matrix for ${rotation} degrees`);

  const [a, b, c, d] = abcd;
  // a b u / c d v / x y w, with the bottom right in 2.30 rather than 16.16.
  return concat(
    s32be(a), s32be(b), s32be(0),
    s32be(c), s32be(d), s32be(0),
    s32be(0), s32be(0), s32be(0x40000000),
  );
}

/* ---------------------------------------------------------- configurations */

/**
 * An avcC naming High profile, level 3.1 - "avc1.64001f". The three bytes after
 * the configuration version are the whole of what the codec string is made of,
 * which is why they are the three that are not zero here.
 */
export const AVCC = new Uint8Array([
  1, 0x64, 0x00, 0x1f, 0xff, 0xe1, 0, 4, 0x67, 1, 2, 3, 1, 0, 4, 0x68, 1, 2, 3,
]);

/**
 * An hvcC for Main profile, level 3.1 - "hvc1.1.6.L93.B0".
 *
 * Byte 1 packs the profile space (0), the tier (0) and the profile (1). Bytes
 * 2-5 are the compatibility flags, which RFC 6381 writes in reverse bit order:
 * the 0x60000000 here has to come back as "6". Byte 12 is the level, 93. Bytes
 * 6-11 are the constraint flags, and only the first is non-zero, so the string
 * keeps one "B0" and drops the five zeroes behind it.
 */
export const HVCC = new Uint8Array([
  1, 0x01, 0x60, 0x00, 0x00, 0x00, 0xb0, 0, 0, 0, 0, 0, 93,
]);

/** An av1C for Main profile, level 8, main tier, 8-bit - "av01.0.08M.08". */
export const AV1C = new Uint8Array([0x81, 0x08, 0x00, 0x00]);

/** A vpcC payload for profile 0, level 41, 8-bit - "vp09.00.41.08". */
export const VPCC_BODY = new Uint8Array([0, 41, 0x80, 0]);

/* ---------------------------------------------------------- sample entries */

/**
 * A visual sample entry: six reserved bytes, the data reference index, then the
 * fixed 78-byte header every one of them carries, then the codec's own box.
 * The reader looks for the configuration from `entry.body + 78` onwards, so the
 * header has to be exactly that long.
 *
 * `config` is a whole box - `box('avcC', AVCC)`, or `full('vpcC', 1, 0, ...)`
 * for the one configuration that is written as a full box. Passing the payload
 * on its own would leave the reader walking the codec's own bytes as though
 * they were a box header, which is a fixture bug that looks like a reader bug.
 */
export function visualEntry(type, { width = 640, height = 360, config = null } = {}) {
  const header = concat(
    zeros(6), u16be(1),                       // reserved, data_reference_index
    u16be(0), u16be(0), zeros(12),            // pre_defined, reserved, pre_defined
    u16be(width), u16be(height),              // byte 24 and byte 26
    u32be(0x00480000), u32be(0x00480000),     // 72 dpi, horizontal and vertical
    u32be(0), u16be(1),                       // reserved, frame_count
    zeros(32),                                // compressorname
    u16be(0x0018), u16be(0xffff),             // depth, pre_defined
  );
  return box(type, header, ...(config ? [config] : []));
}

/**
 * An audio sample entry. The reader reads the channel count and the sample rate
 * out of it and copies the rest through untouched, so what is inside `extra` is
 * deliberately not a real esds - the point of the test is that whatever is here
 * comes back byte for byte.
 */
export function audioEntry(type, { channels = 2, sampleRate = 48000, extra = null } = {}) {
  const header = concat(
    zeros(6), u16be(1),                       // reserved, data_reference_index
    zeros(8),                                 // version, revision, vendor
    u16be(channels), u16be(16),               // byte 16, then the sample size
    u16be(0), u16be(0),                       // pre_defined, reserved
    u32be(sampleRate * 65536),                // 16.16, at byte 24
  );
  return box(type, header, ...(extra ? [extra] : []));
}

/* ------------------------------------------------------------ sample table */

/**
 * The tables that say where the samples are, built from one list of sizes.
 *
 * `chunkRuns` is `stsc` as it is actually written - "from this chunk onwards,
 * this many samples each" - so a file whose last chunk is short is expressed
 * the way a muxer expresses it rather than by listing every chunk.
 *
 * @param {object} spec
 * @param {number[]} spec.sizes             one entry per sample, in file order
 * @param {number[][]} spec.deltas          stts runs, as [count, delta] pairs
 * @param {number[][]} spec.chunkRuns       [firstChunk (1-based), samplesPerChunk]
 * @param {number[]|null} spec.keyframes    1-based sample numbers, null for no stss
 * @param {number[][]|null} spec.compositions  ctts runs, as [count, offset] pairs
 * @param {number} spec.dataStart           where sample 0 sits in the file
 * @param {number} spec.chunkGap            filler in front of every chunk but the first
 * @returns {{boxes: Uint8Array, offsets: number[], end: number}}
 */
export function sampleTables({
  sizes,
  deltas,
  chunkRuns = [[1, sizes.length]],
  keyframes = null,
  compositions = null,
  cttsVersion = 0,
  uniformSize = 0,
  wide = false,
  chunkGap = 7,
  dataStart,
}) {
  // Which samples fall in which chunk, from the runs. A chunk exists for as
  // long as there are samples left to put in one.
  const chunks = [];
  let sample = 0;
  let run = 0;
  while (sample < sizes.length) {
    while (run + 1 < chunkRuns.length && chunkRuns[run + 1][0] - 1 <= chunks.length) run += 1;
    const take = [];
    for (let i = 0; i < chunkRuns[run][1] && sample < sizes.length; i += 1) {
      take.push(sample);
      sample += 1;
    }
    chunks.push(take);
  }

  // Lay the chunks down with filler in front of all but the first, so that the
  // chunk offsets are load-bearing. Samples packed end to end across the whole
  // file would let a reader that never consulted `stsc` or `stco` at all - one
  // that just accumulated sizes from the start of `mdat` - agree with every
  // offset this suite asserts.
  const starts = new Array(sizes.length);
  const chunkStarts = [];
  let at = dataStart;
  for (const [index, take] of chunks.entries()) {
    if (index > 0) at += chunkGap;
    chunkStarts.push(at);
    for (const which of take) {
      starts[which] = at;
      at += sizes[which];
    }
  }

  const stts = full('stts', 0, 0, u32be(deltas.length),
    ...deltas.map(([count, delta]) => concat(u32be(count), u32be(delta))));

  const stsc = full('stsc', 0, 0, u32be(chunkRuns.length),
    ...chunkRuns.map(([first, per]) => concat(u32be(first), u32be(per), u32be(1))));

  const stsz = uniformSize
    ? full('stsz', 0, 0, u32be(uniformSize), u32be(sizes.length))
    : full('stsz', 0, 0, u32be(0), u32be(sizes.length), ...sizes.map(u32be));

  const stco = wide
    ? full('co64', 0, 0, u32be(chunkStarts.length), ...chunkStarts.map(u64be))
    : full('stco', 0, 0, u32be(chunkStarts.length), ...chunkStarts.map(u32be));

  const extra = [];
  if (keyframes) {
    extra.push(full('stss', 0, 0, u32be(keyframes.length), ...keyframes.map(u32be)));
  }
  if (compositions) {
    extra.push(full('ctts', cttsVersion, 0, u32be(compositions.length),
      ...compositions.map(([count, offset]) => concat(u32be(count), s32be(offset)))));
  }

  return { boxes: concat(stts, stsc, stsz, stco, ...extra), offsets: starts, end: at };
}

/* ------------------------------------------------------------------ tracks */

/**
 * One `trak`. `tableBoxes` is what `sampleTables` returned, or nothing at all
 * for a fragmented file, where the tables live in each fragment instead and
 * `stbl` still has to exist and still has to hold the sample description.
 */
export function trak({
  id = 1,
  handler = 'vide',
  timescale = 600,
  duration = 0,
  rotation = 0,
  width = 640,
  height = 360,
  entry,
  tableBoxes = null,
  mdhdVersion = 0,
  tkhdVersion = 0,
}) {
  const tkhd = tkhdVersion === 1
    ? full('tkhd', 1, 7,
      u64be(0), u64be(0), u32be(id), u32be(0), u64be(duration),
      zeros(8), u16be(0), u16be(0), u16be(0), u16be(0),
      matrix(rotation), u32be(width * 65536), u32be(height * 65536))
    : full('tkhd', 0, 7,
      u32be(0), u32be(0), u32be(id), u32be(0), u32be(duration),
      zeros(8), u16be(0), u16be(0), u16be(0), u16be(0),
      matrix(rotation), u32be(width * 65536), u32be(height * 65536));

  const mdhd = mdhdVersion === 1
    ? full('mdhd', 1, 0, u64be(0), u64be(0), u32be(timescale), u64be(duration),
      u16be(0x55c4), u16be(0))
    : full('mdhd', 0, 0, u32be(0), u32be(0), u32be(timescale), u32be(duration),
      u16be(0x55c4), u16be(0));

  const hdlr = full('hdlr', 0, 0, u32be(0), ascii(handler), zeros(12), ascii('t\0'));

  const stbl = box('stbl',
    full('stsd', 0, 0, u32be(1), entry),
    ...(tableBoxes ? [tableBoxes] : []));

  const minf = box('minf',
    handler === 'vide' ? box('vmhd', zeros(12)) : box('smhd', zeros(8)),
    box('dinf', full('dref', 0, 0, u32be(1), full('url ', 0, 1))),
    stbl);

  return box('trak', tkhd, box('mdia', mdhd, hdlr, minf));
}

/** The movie header. Nothing in the reader looks at it; real files have one. */
export function mvhd(timescale = 1000, duration = 0, nextTrack = 3) {
  return full('mvhd', 0, 0,
    u32be(0), u32be(0), u32be(timescale), u32be(duration),
    u32be(0x00010000), u16be(0x0100), u16be(0), zeros(8),
    matrix(0), zeros(24), u32be(nextTrack));
}

/* ------------------------------------------------------------------- files */

export const FTYP = box('ftyp', ascii('isom'), u32be(512),
  ascii('isom'), ascii('iso2'), ascii('avc1'), ascii('mp41'));

/** Recognisable filler: byte n of the payload is n, so a slice names itself. */
export function fillBytes(length) {
  const out = new Uint8Array(length);
  for (let i = 0; i < length; i += 1) out[i] = i & 0xff;
  return out;
}

/**
 * A plain file: `ftyp`, then `mdat`, then `moov`.
 *
 * `mdat` goes in front so the sample offsets are known before the tables that
 * name them are built - which is also how a muxer that streams its output has
 * to write one, and the layout that catches a reader assuming `moov` comes
 * first. Each track's samples follow the previous track's, in the order given.
 *
 * Returns the bytes and, beside them, where each track's samples were actually
 * put. A test asserting against `layout` is comparing the reader's answer with
 * the arithmetic that laid the file out, rather than with a list of numbers
 * somebody copied out of a passing run.
 *
 * @returns {{bytes: Uint8Array, layout: {offsets: number[]}[]}}
 */
export function plainFile({ tracks, movieDuration = 0, mdatBox = box }) {
  const dataStart = FTYP.length + (mdatBox === largeBox ? 16 : 8);

  const layout = [];
  let at = dataStart;
  const built = tracks.map((spec) => {
    const table = spec.sizes ? sampleTables({ ...spec, dataStart: at }) : null;
    layout.push({ offsets: table?.offsets ?? [] });
    if (table) at = table.end;
    return trak({ ...spec, tableBoxes: table?.boxes ?? null });
  });

  return {
    bytes: concat(
      FTYP,
      mdatBox('mdat', fillBytes(at - dataStart)),
      box('moov', mvhd(1000, movieDuration), ...built),
    ),
    layout,
  };
}

/** The fixture as the demuxer takes it: something with `size` and `slice`. */
export const asFile = (bytes) => new Blob([bytes]);

/**
 * One `traf`: which track, where its clock is, and the samples themselves.
 *
 * Only the flags a real writer sets are set. `tfhd` says nothing about the
 * defaults unless the fixture asks it to, so the values in `trex` are what a
 * reader has to fall back to - which is the case worth testing, because a
 * reader that ignores `trex` still produces a plausible-looking list.
 */
function traf({
  trackId,
  baseDecodeTime = null,
  tfhdFlags = 0,
  tfhdExtras = [],
  samples,
  sampleFlags = null,
  firstSampleFlags = null,
  // A version 0 trun stores composition offsets unsigned, a version 1 trun
  // signed. Only the second can say a frame is shown before one that decodes
  // ahead of it, which is why a fixture with B-frames has to ask for it.
  trunVersion = 0,
}, dataOffset) {
  let runFlags = 0x1;                                   // data offset present
  if (firstSampleFlags !== null) runFlags |= 0x4;
  if (samples.some((s) => s.duration !== undefined)) runFlags |= 0x100;
  if (samples.some((s) => s.size !== undefined)) runFlags |= 0x200;
  if (sampleFlags) runFlags |= 0x400;
  if (samples.some((s) => s.composition !== undefined)) runFlags |= 0x800;

  const rows = samples.map((sample, index) => concat(
    ...(runFlags & 0x100 ? [u32be(sample.duration ?? 0)] : []),
    ...(runFlags & 0x200 ? [u32be(sample.size ?? 0)] : []),
    ...(runFlags & 0x400 ? [u32be(sampleFlags[index])] : []),
    ...(runFlags & 0x800 ? [s32be(sample.composition ?? 0)] : []),
  ));

  return box('traf',
    full('tfhd', 0, tfhdFlags, u32be(trackId), ...tfhdExtras),
    ...(baseDecodeTime === null ? [] : [full('tfdt', 1, 0, u64be(baseDecodeTime))]),
    full('trun', trunVersion, runFlags,
      u32be(samples.length),
      s32be(dataOffset),
      ...(firstSampleFlags !== null ? [u32be(firstSampleFlags)] : []),
      ...rows));
}

/** How many bytes of `mdat` a run owns, whether or not its sizes are explicit. */
function runBytes(run) {
  if (run.payloadLength !== undefined) return run.payloadLength;
  return run.samples.reduce((n, sample) => n + (sample.size ?? 0), 0);
}

/**
 * A fragmented file: `ftyp`, a `moov` carrying `mvex` and no sample tables at
 * all, then one `moof` and `mdat` per fragment.
 *
 * This is what a browser's own MediaRecorder writes. A `trun`'s sample offsets
 * are counted from the start of the `moof` that holds it, so each fragment is
 * assembled once to be measured and again with the offsets that measurement
 * produced.
 */
export function fragmentedFile({ tracks, fragments, movieDuration = 0 }) {
  const traks = tracks.map((spec) => trak({ ...spec, tableBoxes: null }));

  const trex = tracks.map((spec) => full('trex', 0, 0,
    u32be(spec.id), u32be(1),
    u32be(spec.defaultDuration ?? 0),
    u32be(spec.defaultSize ?? 0),
    u32be(spec.defaultFlags ?? 0)));

  const moov = box('moov', mvhd(1000, movieDuration), ...traks, box('mvex', ...trex));

  const parts = [FTYP, moov];
  let sequence = 1;

  for (const fragment of fragments) {
    const build = (base) => {
      let cursor = base;
      return box('moof',
        full('mfhd', 0, 0, u32be(sequence)),
        ...fragment.runs.map((run) => {
          const at = cursor;
          cursor += runBytes(run);
          return traf(run, at);
        }));
    };

    let moof = build(0);
    const dataStart = moof.length + 8;
    moof = build(dataStart);
    // Every field written above is fixed width, so measuring the moof cannot
    // have changed its size. If that ever stops being true, say so here rather
    // than shipping a fixture whose offsets are quietly eight bytes out.
    if (moof.length + 8 !== dataStart) throw new Error('moof changed size when filled in');

    parts.push(moof, box('mdat', fillBytes(
      fragment.runs.reduce((n, run) => n + runBytes(run), 0))));
    sequence += 1;
  }

  return concat(...parts);
}
