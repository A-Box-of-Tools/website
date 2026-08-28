/**
 * Minimal ISO-BMFF (MP4) writer for a single H.264 video track.
 *
 * The same muxer /images-to-video/ uses, and for the same reason: a time-lapse
 * is a slideshow that happens to have been cut out of a video. Every frame is
 * held for exactly as long as the next one, there is no sound, and the frames
 * were all encoded a moment ago rather than copied out of a file - so none of
 * the machinery the cropping and trimming writers carry, the audio track and
 * the chunk interleaving and the edit lists, has anything to do here.
 *
 * Written by hand so this project has no dependencies and no build step: the
 * source in this folder is byte-for-byte what the browser runs.
 *
 * Scope and assumptions:
 *   - Exactly one video track, and no audio. A time-lapse has none to keep:
 *     sound played sixty times too fast is not sound. See README.md.
 *   - Samples arrive in presentation order with no B-frames, so no `ctts`
 *     box is needed. WebCodecs H.264 encoders do not emit B-frames by
 *     default, and we never ask for them.
 *   - All samples live in a single `mdat` chunk.
 *   - `moov` is written before `mdat` (faststart), so the file is playable
 *     without seeking to the end.
 */

const TIMESCALE = 90000; // divides evenly by 24, 25, 30, 50 and 60 fps

/* ---------------------------------------------------------------- helpers */

function ascii(s) {
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

function u16(n) {
  return new Uint8Array([(n >> 8) & 0xff, n & 0xff]);
}

function u32(n) {
  return new Uint8Array([(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff]);
}

function zeros(n) {
  return new Uint8Array(n);
}

function concat(parts) {
  let length = 0;
  for (const p of parts) length += p.byteLength;
  const out = new Uint8Array(length);
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.byteLength;
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
  const header = new Uint8Array([version, (flags >> 16) & 0xff, (flags >> 8) & 0xff, flags & 0xff]);
  return box(type, header, ...payload);
}

/** The identity transformation matrix every player expects. */
const UNITY_MATRIX = concat([
  u32(0x00010000), u32(0), u32(0),
  u32(0), u32(0x00010000), u32(0),
  u32(0), u32(0), u32(0x40000000),
]);

/* ------------------------------------------------------------------ boxes */

function ftyp() {
  return box('ftyp', ascii('isom'), u32(0x200), ascii('isom'), ascii('iso2'), ascii('avc1'), ascii('mp41'));
}

function mvhd(durationTs) {
  return fullBox('mvhd', 0, 0,
    u32(0),            // creation_time — left at 0, we have no reason to date the file
    u32(0),            // modification_time
    u32(TIMESCALE),
    u32(durationTs),
    u32(0x00010000),   // rate 1.0
    u16(0x0100),       // volume 1.0
    zeros(2),          // reserved
    zeros(8),          // reserved
    UNITY_MATRIX,
    zeros(24),         // pre_defined
    u32(2),            // next_track_ID
  );
}

function tkhd(durationTs, width, height) {
  return fullBox('tkhd', 0, 0x000007, // enabled | in movie | in preview
    u32(0),            // creation_time
    u32(0),            // modification_time
    u32(1),            // track_ID
    zeros(4),          // reserved
    u32(durationTs),
    zeros(8),          // reserved
    u16(0),            // layer
    u16(0),            // alternate_group
    u16(0),            // volume — 0 for video
    zeros(2),          // reserved
    UNITY_MATRIX,
    u32(width << 16),  // 16.16 fixed point
    u32(height << 16),
  );
}

function mdhd(durationTs) {
  return fullBox('mdhd', 0, 0,
    u32(0),
    u32(0),
    u32(TIMESCALE),
    u32(durationTs),
    u16(0x55c4),       // language: 'und'
    u16(0),            // pre_defined
  );
}

function hdlr() {
  return fullBox('hdlr', 0, 0,
    u32(0),            // pre_defined
    ascii('vide'),
    zeros(12),         // reserved
    ascii('VideoHandler\0'),
  );
}

function dinf() {
  // A `url ` entry with flag 1 means "media data is in this same file".
  return box('dinf', fullBox('dref', 0, 0, u32(1), fullBox('url ', 0, 1)));
}

function avc1(width, height, avcC) {
  const compressorName = new Uint8Array(32); // 1 length byte + 31 bytes of name, all zero is valid

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
    box('avcC', avcC), // the decoder config handed to us by VideoEncoder
  );
}

/** Run-length encode per-sample durations into a time-to-sample table. */
function stts(durations) {
  const entries = [];
  for (const d of durations) {
    const last = entries[entries.length - 1];
    if (last && last.delta === d) last.count++;
    else entries.push({ count: 1, delta: d });
  }

  const payload = [u32(entries.length)];
  for (const e of entries) payload.push(u32(e.count), u32(e.delta));
  return fullBox('stts', 0, 0, ...payload);
}

/** Sync sample table — sample numbers are 1-based. Omitted when every sample is a keyframe. */
function stss(keyframeIndices) {
  const payload = [u32(keyframeIndices.length)];
  for (const i of keyframeIndices) payload.push(u32(i + 1));
  return fullBox('stss', 0, 0, ...payload);
}

function stsc(sampleCount) {
  // Every sample sits in one chunk, so a single mapping entry covers the file.
  return fullBox('stsc', 0, 0, u32(1), u32(1), u32(sampleCount), u32(1));
}

function stsz(sizes) {
  const payload = [u32(0), u32(sizes.length)]; // sample_size 0 = sizes vary, table follows
  for (const s of sizes) payload.push(u32(s));
  return fullBox('stsz', 0, 0, ...payload);
}

function stco(mdatDataOffset) {
  return fullBox('stco', 0, 0, u32(1), u32(mdatDataOffset));
}

/* ------------------------------------------------------------------ muxer */

export class Mp4Muxer {
  /**
   * @param {{width: number, height: number}} options
   */
  constructor({ width, height }) {
    this.width = width;
    this.height = height;
    this.avcC = null;
    this.samples = [];   // { data: Uint8Array, isKey: boolean, durationTs: number }
    this.totalBytes = 0;
  }

  /**
   * Store the decoder configuration record (`avcC`). VideoEncoder supplies it
   * on the first chunk, and occasionally repeats it; the first one wins.
   */
  setDecoderConfig(description) {
    if (this.avcC) return;
    if (!description) throw new Error('mp4.noconfig');
    this.avcC = new Uint8Array(
      description instanceof ArrayBuffer ? description : description.buffer.slice(
        description.byteOffset, description.byteOffset + description.byteLength,
      ),
    );
  }

  /**
   * @param {Uint8Array} data   Length-prefixed AVC sample (encoder `avc.format: 'avc'`).
   * @param {boolean} isKey
   * @param {number} durationSeconds
   */
  addSample(data, isKey, durationSeconds) {
    this.samples.push({
      data,
      isKey,
      durationTs: Math.max(1, Math.round(durationSeconds * TIMESCALE)),
    });
    this.totalBytes += data.byteLength;
  }

  /** @returns {Blob} a complete, faststart MP4 file. */
  finalize() {
    if (!this.samples.length) throw new Error('mp4.noframes');
    if (!this.avcC) throw new Error('mp4.noconfig');

    // A 32-bit `stco` and 32-bit `mdat` size cap us at 4 GiB. Anything near
    // that is a mistake on the user's part rather than a case worth supporting.
    if (this.totalBytes > 0xfffffff0) {
      throw new Error('mp4.toobig');
    }

    const durations = this.samples.map((s) => s.durationTs);
    const sizes = this.samples.map((s) => s.data.byteLength);
    const keyframes = [];
    this.samples.forEach((s, i) => { if (s.isKey) keyframes.push(i); });

    const totalDuration = durations.reduce((a, b) => a + b, 0);
    const allKeyframes = keyframes.length === this.samples.length;

    const buildMoov = (mdatDataOffset) => {
      const stbl = box('stbl',
        fullBox('stsd', 0, 0, u32(1), avc1(this.width, this.height, this.avcC)),
        stts(durations),
        ...(allKeyframes ? [] : [stss(keyframes)]),
        stsc(this.samples.length),
        stsz(sizes),
        stco(mdatDataOffset),
      );

      const minf = box('minf',
        fullBox('vmhd', 0, 1, u16(0), zeros(6)),
        dinf(),
        stbl,
      );

      const mdia = box('mdia', mdhd(totalDuration), hdlr(), minf);
      const trak = box('trak', tkhd(totalDuration, this.width, this.height), mdia);
      return box('moov', mvhd(totalDuration), trak);
    };

    // `stco` holds an absolute file offset, but that offset depends on how
    // large `moov` is — which we only know once it is built. The box layout is
    // fixed-width, so building it twice converges: pass 1 measures, pass 2
    // writes the real offset into an identically-sized box.
    const header = ftyp();
    const probe = buildMoov(0);
    const mdatDataOffset = header.byteLength + probe.byteLength + 8;
    const moov = buildMoov(mdatDataOffset);

    if (moov.byteLength !== probe.byteLength) {
      throw new Error('mp4.unstable');
    }

    const mdatHeader = concat([u32(this.totalBytes + 8), ascii('mdat')]);

    // Hand the sample buffers to Blob() untouched — no large copy happens here.
    return new Blob(
      [header, moov, mdatHeader, ...this.samples.map((s) => s.data)],
      { type: 'video/mp4' },
    );
  }
}
