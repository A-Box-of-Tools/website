/**
 * An ISO-BMFF (MP4) writer for tracks that are being copied rather than made.
 *
 * GENERATED INTO EACH TOOL. This file lives at shared/js/mp4-writer.js and the
 * build copies it to <tool>/src/shared/mp4-writer.js for the tools that ask
 * for it with `js_parts = ["mp4-writer", ...]`: the trimmer, which wrote it,
 * and the reverser, which uses it unchanged for the pair of sample entries and
 * the interleaving that puts a second of picture beside a second of sound. The
 * two carried identical copies until the tests could follow a `./shared/`
 * import; see tests/js/resolve-shared.mjs. It is not the only MP4 writer here:
 * shared/js/mp4-muxer.js writes the one H.264 track an encoder just produced,
 * and /crop-video/ keeps a writer of its own with a different timescale.
 *
 * The muxer in /crop-video/ writes one H.264 track out of an encoder it just
 * ran, which lets it assume a great deal: one codec, no B-frames, no rotation,
 * and a sample entry it builds itself. A trim can assume none of that. The
 * frames it writes are the frames that arrived - whatever codec they are in,
 * in whatever order they decode, turned whichever way the file says - and the
 * whole point is that they come out the other side untouched.
 *
 * So this writer is told about a track rather than deciding it:
 *
 *   - The sample entry is handed over as bytes and written back as bytes. On
 *     the copy path those bytes came out of the source file; on the re-encode
 *     path they are built from the encoder's own configuration record by
 *     `avcSampleEntry` at the foot of this file. Either way nothing here reads
 *     what is inside one.
 *   - The display matrix is copied too, so a clip filmed on a phone comes out
 *     the way up it went in.
 *   - Every sample carries a decode time and a presentation time. Where those
 *     differ - which is what a file with B-frames looks like - the gap is
 *     written into a `ctts` box, so the frames are shown in the order they
 *     were meant to be rather than the order they decode in.
 *   - Each track carries an edit list, which is how the file says "start
 *     playing here" without deleting anything. That is the box the lossless cut
 *     turns on: the frames in front of the cut stay in the file, because the
 *     ones after them cannot be decoded without them, and the edit list says
 *     not to show them.
 *
 * Assumptions that remain:
 *   - `moov` is written before `mdat` (faststart), so the file plays without
 *     seeking to the end.
 *   - 32-bit chunk offsets, which caps the output at 4 GB. Past that the writer
 *     raises a clear error rather than producing a file that opens wrong.
 */

/** The timescale the movie header and every edit list is counted in. */
export const MOVIE_TIMESCALE = 1000;

/** How much of each track goes into one chunk before switching to the other. */
const CHUNK_SECONDS = 1;

/* ---------------------------------------------------------------- helpers */

function ascii(text) {
  const out = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) out[i] = text.charCodeAt(i);
  return out;
}

function u16(n) {
  return new Uint8Array([(n >> 8) & 0xff, n & 0xff]);
}

function u32(n) {
  return new Uint8Array([(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff]);
}

/** Two's complement, which is what u32 already produces for a negative number. */
function i32(n) {
  return u32(n | 0);
}

function zeros(n) {
  return new Uint8Array(n);
}

function concat(parts) {
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

/** A plain box: size + type + payload. */
function box(type, ...payload) {
  const body = concat(payload);
  return concat([u32(body.byteLength + 8), ascii(type), body]);
}

/** A full box: adds the version + 24-bit flags header. */
function fullBox(type, version, flags, ...payload) {
  const header = new Uint8Array([
    version, (flags >> 16) & 0xff, (flags >> 8) & 0xff, flags & 0xff,
  ]);
  return box(type, header, ...payload);
}

const UNITY_MATRIX = concat([
  u32(0x00010000), u32(0), u32(0),
  u32(0), u32(0x00010000), u32(0),
  u32(0), u32(0), u32(0x40000000),
]);

/* -------------------------------------------------------------------- boxes */

function ftyp() {
  return box('ftyp', ascii('isom'), u32(0x200),
    ascii('isom'), ascii('iso2'), ascii('avc1'), ascii('mp41'));
}

function mvhd(durationMs, trackCount) {
  return fullBox('mvhd', 0, 0,
    u32(0),            // creation_time - left at 0; there is no reason to date the file
    u32(0),            // modification_time
    u32(MOVIE_TIMESCALE),
    u32(durationMs),
    u32(0x00010000),   // rate 1.0
    u16(0x0100),       // volume 1.0
    zeros(2),          // reserved
    zeros(8),          // reserved
    UNITY_MATRIX,
    zeros(24),         // pre_defined
    u32(trackCount + 1),
  );
}

function tkhd(id, durationMs, track) {
  const isAudio = track.kind === 'soun';
  return fullBox('tkhd', 0, 0x000007, // enabled | in movie | in preview
    u32(0),            // creation_time
    u32(0),            // modification_time
    u32(id),
    zeros(4),          // reserved
    u32(durationMs),
    zeros(8),          // reserved
    u16(0),            // layer
    u16(0),            // alternate_group
    u16(isAudio ? 0x0100 : 0),
    zeros(2),          // reserved
    track.matrix ?? UNITY_MATRIX,
    u32(isAudio ? 0 : track.width),   // already 16.16 fixed point
    u32(isAudio ? 0 : track.height),
  );
}

function mdhd(timescale, duration) {
  return fullBox('mdhd', 0, 0,
    u32(0),
    u32(0),
    u32(timescale),
    u32(duration),
    u16(0x55c4),       // language: 'und'
    u16(0),            // pre_defined
  );
}

function hdlr(kind, name) {
  return fullBox('hdlr', 0, 0,
    u32(0),            // pre_defined
    ascii(kind),
    zeros(12),         // reserved
    ascii(`${name}\0`),
  );
}

function dinf() {
  // A `url ` entry with flag 1 means "the media data is in this same file".
  return box('dinf', fullBox('dref', 0, 0, u32(1), fullBox('url ', 0, 1)));
}

/** Run-length encode per-sample durations into a time-to-sample table. */
function stts(durations) {
  const entries = [];
  for (const duration of durations) {
    const last = entries[entries.length - 1];
    if (last && last.delta === duration) last.count++;
    else entries.push({ count: 1, delta: duration });
  }

  const payload = [u32(entries.length)];
  for (const entry of entries) payload.push(u32(entry.count), u32(entry.delta));
  return fullBox('stts', 0, 0, ...payload);
}

/**
 * Composition offsets: how far after its decode time each frame is shown.
 *
 * Version 1 stores them signed, and is used only when one of them really is
 * negative. Files written that way exist and have to be carried across, but a
 * version 0 table is what every player has read for twenty years, so it stays
 * the default for the files that can be expressed in it.
 */
function ctts(offsets) {
  const entries = [];
  for (const offset of offsets) {
    const last = entries[entries.length - 1];
    if (last && last.offset === offset) last.count++;
    else entries.push({ count: 1, offset });
  }

  const signed = offsets.some((offset) => offset < 0);
  const payload = [u32(entries.length)];
  for (const entry of entries) {
    payload.push(u32(entry.count), signed ? i32(entry.offset) : u32(entry.offset));
  }
  return fullBox('ctts', signed ? 1 : 0, 0, ...payload);
}

/** Sync sample table - sample numbers are 1-based. Omitted when all are keyframes. */
function stss(indices) {
  const payload = [u32(indices.length)];
  for (const index of indices) payload.push(u32(index + 1));
  return fullBox('stss', 0, 0, ...payload);
}

/** Sample-to-chunk, run-length encoded over chunks that hold the same count. */
function stsc(perChunk) {
  const entries = [];
  perChunk.forEach((count, index) => {
    const last = entries[entries.length - 1];
    if (last && last.count === count) return;
    entries.push({ first: index + 1, count });
  });

  const payload = [u32(entries.length)];
  for (const entry of entries) payload.push(u32(entry.first), u32(entry.count), u32(1));
  return fullBox('stsc', 0, 0, ...payload);
}

function stsz(sizes) {
  const payload = [u32(0), u32(sizes.length)]; // 0 = sizes vary, table follows
  for (const size of sizes) payload.push(u32(size));
  return fullBox('stsz', 0, 0, ...payload);
}

function stco(offsets) {
  const payload = [u32(offsets.length)];
  for (const offset of offsets) payload.push(u32(offset));
  return fullBox('stco', 0, 0, ...payload);
}

/**
 * The edit list, which is the box the whole lossless path turns on.
 *
 * A cut that keeps the picture untouched can only begin at a keyframe, because
 * the frames after one cannot be decoded without it. The frames between that
 * keyframe and where you actually asked to start are therefore still in the
 * file - and this is where the file says not to show them. Each entry names a
 * point in the media and how long to play from it, so one entry is a trim and
 * two entries are a trim with a piece taken out of the middle.
 *
 * A `media_time` of -1 is an empty edit: play nothing for that long. It is used
 * where a track has nothing at the start of a section, which is what an audio
 * track that begins a moment after the picture looks like.
 */
function elst(edits) {
  const payload = [u32(edits.length)];
  for (const edit of edits) {
    payload.push(u32(edit.duration), i32(edit.mediaTime), u32(0x00010000));
  }
  return fullBox('elst', 0, 0, ...payload);
}

/* ------------------------------------------------------------------ writer */

class Track {
  constructor({ kind, timescale, sampleEntry, matrix = null, width = 0, height = 0 }) {
    if (!sampleEntry || !sampleEntry.byteLength) {
      throw new Error(kind === 'soun' ? 'write.noaudioentry' : 'write.novideoentry');
    }
    this.kind = kind;                 // 'vide' or 'soun'
    this.timescale = timescale;
    this.entry = sampleEntry;
    this.matrix = matrix;
    this.width = width;               // 16.16 fixed point, straight from the source tkhd
    this.height = height;
    this.samples = [];                // { data, isKey, dts, pts, duration }
    this.edits = [];                  // { mediaTime, duration } in MOVIE_TIMESCALE
    this.chunks = [];                 // filled in by the writer at finalize time
  }

  /**
   * @param {object} sample
   * @param {Uint8Array|Blob} sample.data  the encoded sample, exactly as it will
   *   be stored. The copy path passes a slice of the source File rather than its
   *   bytes: a Blob is a promise to read a byte range later, so a lossless trim
   *   of a four-gigabyte file never reads four gigabytes, and the browser does
   *   the copying as it writes the finished file out.
   * @param {boolean} sample.isKey
   * @param {number} sample.dts        decode time, in this track's timescale
   * @param {number} sample.pts        presentation time, same units
   * @param {number} sample.duration   decode duration, same units
   */
  addSample({ data, isKey, dts, pts, duration }) {
    this.samples.push({
      data,
      size: data.byteLength ?? data.size,
      isKey,
      dts: Math.round(dts),
      pts: Math.round(pts),
      duration: Math.max(0, Math.round(duration)),
    });
  }

  /**
   * @param {number} mediaTime  where in this track to start, or -1 to play nothing.
   * @param {number} durationMs how long to play from there, in MOVIE_TIMESCALE.
   */
  addEdit(mediaTime, durationMs) {
    if (durationMs <= 0) return;
    this.edits.push({ mediaTime: Math.round(mediaTime), duration: Math.round(durationMs) });
  }

  get bytes() {
    return this.samples.reduce((total, sample) => total + sample.size, 0);
  }

  /** The length of the media itself, before any edit list has its say. */
  get durationTs() {
    return this.samples.reduce((total, sample) => total + sample.duration, 0);
  }

  /** What a player is actually asked to play, which is what the header reports. */
  get playedMs() {
    if (!this.edits.length) {
      return Math.round(this.durationTs / this.timescale * MOVIE_TIMESCALE);
    }
    return this.edits.reduce((total, edit) => total + edit.duration, 0);
  }
}

export class Mp4Writer {
  constructor() {
    /** @type {Track[]} */
    this.tracks = [];
  }

  /** @returns {Track} */
  addTrack(spec) {
    const track = new Track(spec);
    this.tracks.push(track);
    return track;
  }

  /**
   * Group each track's samples into chunks of about a second and lay the chunks
   * out in time order, so video and audio are interleaved in the file the way
   * they are played.
   */
  #interleave(tracks, mdatDataOffset) {
    const chunks = [];

    for (const track of tracks) {
      track.chunks = [];
      let at = 0;
      while (at < track.samples.length) {
        const start = track.samples[at].dts / track.timescale;
        let count = 1;
        while (at + count < track.samples.length
          && track.samples[at + count].dts / track.timescale - start < CHUNK_SECONDS) count++;
        chunks.push({ track, first: at, count, start });
        at += count;
      }
    }

    chunks.sort((a, b) => (a.start - b.start)
      || (tracks.indexOf(a.track) - tracks.indexOf(b.track)));

    let offset = mdatDataOffset;
    for (const chunk of chunks) {
      chunk.offset = offset;
      for (let i = 0; i < chunk.count; i++) {
        offset += chunk.track.samples[chunk.first + i].size;
      }
      chunk.track.chunks.push(chunk);
    }

    return chunks;
  }

  #trak(track, id) {
    const sizes = track.samples.map((sample) => sample.size);
    const offsets = track.samples.map((sample) => sample.pts - sample.dts);
    const keyframes = [];
    track.samples.forEach((sample, index) => { if (sample.isKey) keyframes.push(index); });

    const allKeyframes = keyframes.length === track.samples.length;
    const inOrder = offsets.every((offset) => offset === 0);
    const isAudio = track.kind === 'soun';

    const stbl = box('stbl',
      fullBox('stsd', 0, 0, u32(1), track.entry),
      stts(track.samples.map((sample) => sample.duration)),
      ...(inOrder ? [] : [ctts(offsets)]),
      ...(allKeyframes ? [] : [stss(keyframes)]),
      stsc(track.chunks.map((chunk) => chunk.count)),
      stsz(sizes),
      stco(track.chunks.map((chunk) => chunk.offset)),
    );

    const minf = box('minf',
      isAudio
        ? fullBox('smhd', 0, 0, u16(0), u16(0))
        : fullBox('vmhd', 0, 1, u16(0), zeros(6)),
      dinf(),
      stbl,
    );

    return box('trak',
      tkhd(id, track.playedMs, track),
      ...(track.edits.length ? [box('edts', elst(track.edits))] : []),
      box('mdia',
        mdhd(track.timescale, track.durationTs),
        hdlr(track.kind, isAudio ? 'SoundHandler' : 'VideoHandler'),
        minf,
      ),
    );
  }

  /** @returns {Blob} a complete, faststart MP4 file. */
  finalize() {
    const tracks = this.tracks.filter((track) => track.samples.length);
    if (!tracks.some((track) => track.kind === 'vide')) {
      throw new Error('write.noframes');
    }

    const totalBytes = tracks.reduce((total, track) => total + track.bytes, 0);

    // 32-bit chunk offsets and a 32-bit `mdat` size cap this at 4 GB. Anything
    // near it is a mistake rather than a case worth supporting.
    if (totalBytes > 0xfffffff0) {
      throw new Error('write.toobig');
    }

    const durationMs = Math.max(...tracks.map((track) => track.playedMs));

    // `stco` holds absolute file offsets, and those depend on how large `moov`
    // is - which is only known once it is built. The layout is fixed-width, so
    // building it twice converges: pass one measures, pass two writes the real
    // offsets into an identically sized box.
    const build = (mdatDataOffset) => {
      const chunks = this.#interleave(tracks, mdatDataOffset);
      const moov = box('moov',
        mvhd(durationMs, tracks.length),
        ...tracks.map((track, index) => this.#trak(track, index + 1)),
      );
      return { moov, chunks };
    };

    const header = ftyp();
    const probe = build(0);
    const mdatDataOffset = header.byteLength + probe.moov.byteLength + 8;
    const { moov, chunks } = build(mdatDataOffset);

    if (moov.byteLength !== probe.moov.byteLength) {
      throw new Error('write.moovunstable');
    }

    const mdatHeader = concat([u32(totalBytes + 8), ascii('mdat')]);

    // The sample data is handed to Blob() untouched, whether it is bytes this
    // page encoded or a slice of the file on disk that has never been read. No
    // large copy happens here either way: the browser assembles the file as it
    // is written out.
    const parts = [header, moov, mdatHeader];
    for (const chunk of chunks) {
      for (let i = 0; i < chunk.count; i++) {
        parts.push(chunk.track.samples[chunk.first + i].data);
      }
    }

    return new Blob(parts, { type: 'video/mp4' });
  }
}

/* --------------------------------------------------- entries built by hand */

/**
 * A video sample entry for the re-encode path, built around the decoder
 * configuration record the encoder handed back.
 *
 * The copy path never calls this: it has the real entry out of the source file
 * and writes that instead. This one exists for the frames the tool encoded
 * itself, which have no entry anywhere until one is written for them.
 */
export function avcSampleEntry(width, height, avcC) {
  const compressorName = zeros(32); // 1 length byte + 31 of name; all zero is valid

  return box('avc1',
    zeros(6),          // reserved
    u16(1),            // data_reference_index
    u16(0),            // pre_defined
    u16(0),            // reserved
    zeros(12),         // pre_defined
    u16(width),
    u16(height),
    u32(0x00480000),   // horizresolution 72 dpi
    u32(0x00480000),   // vertresolution 72 dpi
    u32(0),            // reserved
    u16(1),            // frame_count
    compressorName,
    u16(0x0018),       // depth: colour with no alpha
    u16(0xffff),       // pre_defined
    box('avcC', avcC),
  );
}
