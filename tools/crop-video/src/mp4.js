/**
 * A minimal ISO-BMFF (MP4) writer for one H.264 video track and, optionally,
 * the audio track that came in with the file.
 *
 * It grew out of the muxer in /images-to-video/, which writes video and nothing
 * else. Cropping does not change how long a clip is or when anything in it
 * happens, so the sound that arrived can be written straight back out: the
 * audio samples are copied across untouched, and so is the sample entry that
 * describes them. Nothing here decodes, re-encodes, or even parses the audio -
 * which is why "keep the sound" costs no quality at all.
 *
 * Scope and assumptions:
 *   - One video track, at most one audio track.
 *   - Video samples arrive in presentation order with no B-frames, so no `ctts`
 *     box is needed. WebCodecs H.264 encoders do not emit B-frames by default
 *     and we never ask for them.
 *   - Samples are interleaved into chunks of about a second, so a player does
 *     not have to hold the whole video to reach the first of the sound.
 *   - `moov` is written before `mdat` (faststart), so the file plays without
 *     seeking to the end.
 *   - 32-bit chunk offsets, which caps the output at 4 GB. Past that the writer
 *     raises a clear error rather than producing a file that opens wrong.
 */

import { ascii, u16, u32, zeros, concat, box, fullBox } from './shared/mp4-boxes.js';

/** Divides evenly by 24, 25, 30, 50 and 60 fps. */
export const VIDEO_TIMESCALE = 90000;

/** How much of each track goes into one chunk before switching to the other. */
const CHUNK_SECONDS = 1;

/* ---------------------------------------------------------------- helpers */

/** The identity transformation matrix every player expects. */
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

const MOVIE_TIMESCALE = 1000;

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

function tkhd(id, durationMs, width, height, isAudio) {
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
    UNITY_MATRIX,      // the crop is drawn in, so the output needs no rotation of its own
    u32(width << 16),  // 16.16 fixed point
    u32(height << 16),
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

/** The video sample entry, built around the decoder configuration the encoder gave us. */
function avc1(width, height, avcC) {
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

/**
 * An edit list that holds a track back for a moment before it starts.
 *
 * Tracks do not always begin together: a file can have its sound starting a
 * fraction of a second after its picture, and the sample tables have no way to
 * say so - they describe one sample after another from the beginning. Writing
 * that gap as an empty edit is how the format expresses it, and leaving it out
 * is how a crop ends up very slightly out of sync with itself.
 */
function elst(delayMs, durationMs) {
  return fullBox('elst', 0, 0,
    u32(2),
    u32(delayMs), u32(0xffffffff), u32(0x00010000),   // media_time -1: play nothing
    u32(durationMs), u32(0), u32(0x00010000),
  );
}

function stco(offsets) {
  const payload = [u32(offsets.length)];
  for (const offset of offsets) payload.push(u32(offset));
  return fullBox('stco', 0, 0, ...payload);
}

/* ------------------------------------------------------------------ writer */

class Track {
  constructor(kind, timescale) {
    this.kind = kind;                 // 'vide' or 'soun'
    this.timescale = timescale;
    this.samples = [];                // { data, isKey, time, duration }
    this.chunks = [];                 // filled in by the writer at finalize time
  }

  get bytes() {
    return this.samples.reduce((total, sample) => total + sample.data.byteLength, 0);
  }

  get durationTs() {
    return this.samples.reduce((total, sample) => total + sample.duration, 0);
  }
}

export class Mp4Writer {
  /**
   * @param {{width: number, height: number}} options the cropped frame size.
   */
  constructor({ width, height }) {
    this.width = width;
    this.height = height;
    this.avcC = null;
    this.video = new Track('vide', VIDEO_TIMESCALE);
    this.audio = null;
  }

  /**
   * Store the decoder configuration record (`avcC`). VideoEncoder supplies it
   * with the first chunk and occasionally repeats it; the first one wins.
   */
  setDecoderConfig(description) {
    if (this.avcC) return;
    if (!description) throw new Error('mp4.noconfig');
    this.avcC = description instanceof Uint8Array
      ? description
      : new Uint8Array(description instanceof ArrayBuffer
        ? description
        : description.buffer.slice(
          description.byteOffset, description.byteOffset + description.byteLength));
  }

  /**
   * @param {Uint8Array} data  a length-prefixed AVC sample (encoder `avc.format: 'avc'`).
   * @param {boolean} isKey
   * @param {number} timeTs    presentation time, in VIDEO_TIMESCALE units.
   */
  addVideoSample(data, isKey, timeTs) {
    this.video.samples.push({ data, isKey, time: timeTs, duration: 0 });
  }

  /**
   * Open an audio track described by a sample entry copied verbatim out of the
   * source file. Nothing here interprets it.
   */
  openAudioTrack({ sampleEntry, timescale }) {
    this.audio = new Track('soun', timescale);
    this.audio.entry = sampleEntry;
  }

  /** @param {Uint8Array} data  one audio sample, exactly as it was in the source. */
  addAudioSample(data, timeTs, durationTs) {
    this.audio.samples.push({ data, isKey: true, time: timeTs, duration: durationTs });
  }

  /**
   * Fill in each video sample's duration from the gap to the next one. Doing it
   * here rather than at capture time is what keeps variable frame rates intact:
   * a phone that dropped from 30 to 24 fps halfway through a clip is written
   * back with exactly the frame times it had.
   */
  #closeVideoDurations() {
    const samples = this.video.samples;
    if (!samples.length) return;

    samples.sort((a, b) => a.time - b.time);
    for (let i = 0; i < samples.length - 1; i++) {
      samples[i].duration = Math.max(1, Math.round(samples[i + 1].time - samples[i].time));
    }
    // The last frame is held for as long as the one before it, there being
    // nothing after it to measure against.
    const last = samples[samples.length - 1];
    last.duration = samples.length > 1
      ? samples[samples.length - 2].duration
      : Math.round(VIDEO_TIMESCALE / 30);
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
        const start = track.samples[at].time / track.timescale;
        let count = 1;
        while (at + count < track.samples.length
          && track.samples[at + count].time / track.timescale - start < CHUNK_SECONDS) count++;
        chunks.push({ track, first: at, count, start });
        at += count;
      }
    }

    chunks.sort((a, b) => (a.start - b.start) || (tracks.indexOf(a.track) - tracks.indexOf(b.track)));

    let offset = mdatDataOffset;
    for (const chunk of chunks) {
      chunk.offset = offset;
      for (let i = 0; i < chunk.count; i++) {
        offset += chunk.track.samples[chunk.first + i].data.byteLength;
      }
      chunk.track.chunks.push(chunk);
    }

    return chunks;
  }

  #trak(track, id, origin) {
    const sizes = track.samples.map((sample) => sample.data.byteLength);
    const keyframes = [];
    track.samples.forEach((sample, index) => { if (sample.isKey) keyframes.push(index); });
    const allKeyframes = keyframes.length === track.samples.length;

    const isAudio = track.kind === 'soun';
    const entry = isAudio ? track.entry : avc1(this.width, this.height, this.avcC);

    const stbl = box('stbl',
      fullBox('stsd', 0, 0, u32(1), entry),
      stts(track.samples.map((sample) => sample.duration)),
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

    const durationTs = track.durationTs;
    const durationMs = Math.round(durationTs / track.timescale * MOVIE_TIMESCALE);
    const delayMs = Math.round(
      Math.max(0, track.samples[0].time / track.timescale - origin) * MOVIE_TIMESCALE);

    return box('trak',
      tkhd(id, durationMs + delayMs, isAudio ? 0 : this.width, isAudio ? 0 : this.height, isAudio),
      ...(delayMs > 0 ? [box('edts', elst(delayMs, durationMs))] : []),
      box('mdia',
        mdhd(track.timescale, durationTs),
        hdlr(track.kind, isAudio ? 'SoundHandler' : 'VideoHandler'),
        minf,
      ),
    );
  }

  /** @returns {Blob} a complete, faststart MP4 file. */
  finalize() {
    if (!this.video.samples.length) throw new Error('mp4.noframes');
    if (!this.avcC) throw new Error('mp4.noconfig');

    this.#closeVideoDurations();

    const tracks = this.audio && this.audio.samples.length ? [this.video, this.audio] : [this.video];
    const totalBytes = tracks.reduce((total, track) => total + track.bytes, 0);

    // 32-bit chunk offsets and a 32-bit `mdat` size cap this at 4 GB. Anything
    // near it is a mistake rather than a case worth supporting.
    if (totalBytes > 0xfffffff0) {
      throw new Error('mp4.toobig');
    }

    // Where the earliest track begins. Everything is written relative to it, so
    // the file starts when its first sample does and the gap in front of any
    // later track is kept rather than quietly closed up.
    const origin = Math.min(...tracks.map((track) => track.samples[0].time / track.timescale));

    const durationMs = Math.max(...tracks.map((track) => Math.round(
      (track.durationTs / track.timescale
        + track.samples[0].time / track.timescale - origin) * MOVIE_TIMESCALE)));

    // `stco` holds absolute file offsets, and those depend on how large `moov`
    // is - which is only known once it is built. The layout is fixed-width, so
    // building it twice converges: pass one measures, pass two writes the real
    // offsets into an identically sized box.
    const build = (mdatDataOffset) => {
      const chunks = this.#interleave(tracks, mdatDataOffset);
      const moov = box('moov',
        mvhd(durationMs, tracks.length),
        ...tracks.map((track, index) => this.#trak(track, index + 1, origin)),
      );
      return { moov, chunks };
    };

    const header = ftyp();
    const probe = build(0);
    const mdatDataOffset = header.byteLength + probe.moov.byteLength + 8;
    const { moov, chunks } = build(mdatDataOffset);

    if (moov.byteLength !== probe.moov.byteLength) {
      throw new Error('mp4.unstable');
    }

    const mdatHeader = concat([u32(totalBytes + 8), ascii('mdat')]);

    // The sample buffers are handed to Blob() untouched, so no large copy
    // happens here - the browser assembles the file as it is written out.
    const parts = [header, moov, mdatHeader];
    for (const chunk of chunks) {
      for (let i = 0; i < chunk.count; i++) {
        parts.push(chunk.track.samples[chunk.first + i].data);
      }
    }

    return new Blob(parts, { type: 'video/mp4' });
  }
}
