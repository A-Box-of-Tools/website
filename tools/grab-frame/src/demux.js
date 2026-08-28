/**
 * A reader for ISO base media files - MP4, M4V and MOV.
 *
 * It exists so a still can be taken from the frame the file actually holds.
 * Once the frames are laid out as a list - where each one is, when it is shown,
 * and whether it can be decoded without the one before it - grabbing frame
 * number 812 is finding it in that list, decoding from the keyframe in front of
 * it, and drawing what comes out. The alternative - seeking a <video> element
 * and drawing whatever it happens to be showing - accepts more containers but
 * lands on the frame the player chose rather than the one that was asked for,
 * so it is the fallback rather than the first choice.
 *
 * This is the reader from /crop-video/, unchanged. Written by hand, because
 * this project has no dependencies and no build step: what is in this folder is
 * byte for byte what the browser runs.
 *
 * It reads both layouts an MP4 comes in: the plain one, where one table at the
 * front says where every sample is, and the fragmented one, where each fragment
 * carries its own small table. The second is what a browser's own MediaRecorder
 * writes, and what a lot of camera and streaming software writes, so refusing
 * it would have sent a great many ordinary files down the slow path.
 *
 * Scope, and what it deliberately does not do:
 *   - Encrypted tracks are refused: nothing here can decrypt them, and a
 *     garbled result is worse than an honest refusal.
 *   - Edit lists are ignored. They shift a track's start by a fraction of a
 *     second at most in the files people grab a frame out of, and honouring one
 *     properly means honouring all of them.
 *   - Only the video track is read. There is no sound in a still picture, so
 *     the audio track is found and then left alone.
 *
 * Nothing in this file can reach the network. It is handed a File and returns a
 * description of what is in it.
 */

/**
 * Thrown when the file is well-formed but out of this demuxer's scope.
 *
 * `reason` is a phrase key, not a sentence: this module is copied byte for
 * byte into fifteen languages, so the sentence lives in the tool's body.html
 * and main.js resolves the key against it. `values` carries what a sentence
 * cannot know in advance - the four characters naming a codec this reader has
 * never heard of.
 */
export class UnsupportedFile extends Error {
  constructor(reason, values) {
    super(reason);
    this.name = 'UnsupportedFile';
    this.reason = reason;
    this.values = values;
  }
}

/* ------------------------------------------------------------ box plumbing */

function fourcc(view, at) {
  return String.fromCharCode(
    view.getUint8(at), view.getUint8(at + 1), view.getUint8(at + 2), view.getUint8(at + 3),
  );
}

/**
 * Walk the boxes between two offsets. A box that claims to run past the end of
 * its parent stops the walk rather than throwing: a truncated file should give
 * up whatever it holds up to that point rather than nothing at all.
 */
function* boxes(view, start, end) {
  let at = start;
  while (at + 8 <= end) {
    let size = view.getUint32(at);
    const type = fourcc(view, at + 4);
    let header = 8;

    if (size === 1) {
      if (at + 16 > end) return;
      size = Number(view.getBigUint64(at + 8));
      header = 16;
    } else if (size === 0) {
      size = end - at;
    }

    if (size < header || at + size > end) return;
    yield { type, start: at, body: at + header, end: at + size };
    at += size;
  }
}

function findBox(view, start, end, type) {
  for (const box of boxes(view, start, end)) {
    if (box.type === type) return box;
  }
  return null;
}

/** findBox, followed down a chain of types: findPath(view, trak, 'mdia', 'mdhd'). */
function findPath(view, box, ...types) {
  let current = box;
  for (const type of types) {
    if (!current) return null;
    current = findBox(view, current.body, current.end, type);
  }
  return current;
}

/** The version and flags of a full box, and where its payload starts. */
function fullBox(view, box) {
  return {
    version: view.getUint8(box.body),
    flags: view.getUint32(box.body) & 0xffffff,
    at: box.body + 4,
  };
}

/* -------------------------------------------------------- reading the file */

/**
 * A sliding window over a File.
 *
 * Video is the one thing this site handles that will not reliably fit in
 * memory, so sample data is never all read in at once: the demuxer hands back
 * offsets and this reads the few megabytes around the sample being asked for.
 * Samples are read in file order, so one window and a linear walk cover the
 * whole file with as many reads as there are windows.
 */
export class FileWindow {
  constructor(file, windowSize = 8 << 20) {
    this.file = file;
    this.windowSize = windowSize;
    this.start = 0;
    this.bytes = new Uint8Array(0);
  }

  /**
   * @returns {Promise<Uint8Array>} a view into the window, valid until the next
   * call - copy anything that has to outlive it.
   */
  async read(offset, length) {
    if (offset < this.start || offset + length > this.start + this.bytes.length) {
      const size = Math.max(this.windowSize, length);
      const end = Math.min(this.file.size, offset + size);
      this.start = offset;
      this.bytes = new Uint8Array(await this.file.slice(offset, end).arrayBuffer());
    }
    const at = offset - this.start;
    if (at + length > this.bytes.length) {
      throw new UnsupportedFile('read.midframe');
    }
    return this.bytes.subarray(at, at + length);
  }
}

/** Read the top-level boxes without reading the file they are in. */
async function topLevel(file) {
  const found = [];
  let at = 0;

  while (at + 8 <= file.size) {
    const head = new DataView(await file.slice(at, Math.min(file.size, at + 16)).arrayBuffer());
    if (head.byteLength < 8) break;

    let size = head.getUint32(0);
    const type = fourcc(head, 4);
    let header = 8;

    if (size === 1) {
      if (head.byteLength < 16) break;
      size = Number(head.getBigUint64(8));
      header = 16;
    } else if (size === 0) {
      size = file.size - at;
    }

    if (size < header) break;
    found.push({ type, start: at, body: at + header, end: at + size });
    at += size;
  }

  return found;
}

/* ----------------------------------------------------------- codec strings */

const hex = (n) => n.toString(16).padStart(2, '0');

/** avcC -> "avc1.640028", the string VideoDecoder wants. */
function avcCodec(prefix, config) {
  if (config.length < 4) throw new UnsupportedFile('read.avcshort');
  return `${prefix}.${hex(config[1])}${hex(config[2])}${hex(config[3])}`;
}

/**
 * hvcC -> "hvc1.1.6.L93.B0".
 *
 * The compatibility flags are written in reverse bit order, per RFC 6381, and
 * trailing zero constraint bytes are dropped. Both are easy to get wrong, and
 * getting either wrong produces a string the browser rejects outright - which
 * at least fails loudly rather than decoding something else.
 */
function hevcCodec(prefix, config) {
  if (config.length < 13) throw new UnsupportedFile('read.hevcshort');

  const space = ['', 'A', 'B', 'C'][(config[1] >> 6) & 0x3];
  const tier = ((config[1] >> 5) & 0x1) ? 'H' : 'L';
  const profile = config[1] & 0x1f;

  let compat = 0;
  for (let i = 0; i < 4; i++) compat = (compat << 8) | config[2 + i];
  let reversed = 0;
  for (let i = 0; i < 32; i++) reversed = (reversed << 1) | ((compat >>> i) & 1);

  const constraints = [];
  for (let i = 6; i <= 11; i++) constraints.push(config[i]);
  while (constraints.length && constraints[constraints.length - 1] === 0) constraints.pop();

  return [
    `${prefix}.${space}${profile}`,
    (reversed >>> 0).toString(16),
    `${tier}${config[12]}`,
    ...constraints.map((byte) => byte.toString(16).toUpperCase()),
  ].join('.');
}

/** av1C -> "av01.0.08M.08". */
function av1Codec(config) {
  if (config.length < 3) throw new UnsupportedFile('read.av1short');
  const profile = (config[1] >> 5) & 0x7;
  const level = config[1] & 0x1f;
  const tier = ((config[2] >> 7) & 0x1) ? 'H' : 'M';
  const high = (config[2] >> 6) & 0x1;
  const twelve = (config[2] >> 5) & 0x1;
  const depth = high ? (twelve ? 12 : 10) : 8;
  return `av01.${profile}.${String(level).padStart(2, '0')}${tier}.${String(depth).padStart(2, '0')}`;
}

/** vpcC -> "vp09.00.41.08". */
function vp9Codec(view, box) {
  const { at } = fullBox(view, box);
  const profile = view.getUint8(at);
  const level = view.getUint8(at + 1);
  const depth = (view.getUint8(at + 2) >> 4) & 0xf;
  return `vp09.${String(profile).padStart(2, '0')}.${String(level).padStart(2, '0')}`
    + `.${String(depth).padStart(2, '0')}`;
}

/* ------------------------------------------------------------ sample table */

/**
 * Turn one stbl into a flat list of samples.
 *
 * Every one of these tables is a compression of the same fact - where a sample
 * is, how big it is, and when it is shown - so this is mostly bookkeeping. The
 * part worth naming is `pts`: `stts` gives decode times, and `ctts` the offset
 * to presentation time, which is how a file with B-frames stores frames in an
 * order other than the one they are watched in.
 */
function readSamples(view, stbl) {
  const stts = findBox(view, stbl.body, stbl.end, 'stts');
  const stsc = findBox(view, stbl.body, stbl.end, 'stsc');
  const stsz = findBox(view, stbl.body, stbl.end, 'stsz');
  const stco = findBox(view, stbl.body, stbl.end, 'stco')
    ?? findBox(view, stbl.body, stbl.end, 'co64');
  const ctts = findBox(view, stbl.body, stbl.end, 'ctts');
  const stss = findBox(view, stbl.body, stbl.end, 'stss');

  if (!stsz && findBox(view, stbl.body, stbl.end, 'stz2')) {
    throw new UnsupportedFile('read.compactsizes');
  }
  if (!stts || !stsc || !stsz || !stco) {
    throw new UnsupportedFile('read.sampletables');
  }

  // Sizes. A non-zero uniform size means every sample is that size and there is
  // no table at all.
  const sizesHead = fullBox(view, stsz);
  const uniform = view.getUint32(sizesHead.at);
  const count = view.getUint32(sizesHead.at + 4);
  const sizeAt = (index) => (uniform || view.getUint32(sizesHead.at + 8 + index * 4));

  // Decode times, run-length encoded.
  const times = new Float64Array(count);
  {
    const head = fullBox(view, stts);
    const entries = view.getUint32(head.at);
    let sample = 0;
    let clock = 0;
    for (let e = 0; e < entries && sample < count; e++) {
      const runs = view.getUint32(head.at + 4 + e * 8);
      const delta = view.getUint32(head.at + 8 + e * 8);
      for (let i = 0; i < runs && sample < count; i++) {
        times[sample++] = clock;
        clock += delta;
      }
    }
    // A table that ran out early leaves the remaining samples one tick apart,
    // which keeps them in order rather than stacking them on one instant.
    for (; sample < count; sample++) {
      times[sample] = clock;
      clock += 1;
    }
  }

  // Presentation offsets. Version 1 stores them signed, which is how a file
  // says a frame is shown before one that decodes ahead of it.
  const offsets = new Float64Array(count);
  if (ctts) {
    const head = fullBox(view, ctts);
    const entries = view.getUint32(head.at);
    let sample = 0;
    for (let e = 0; e < entries && sample < count; e++) {
      const runs = view.getUint32(head.at + 4 + e * 8);
      const value = head.version === 1
        ? view.getInt32(head.at + 8 + e * 8)
        : view.getUint32(head.at + 8 + e * 8);
      for (let i = 0; i < runs && sample < count; i++) offsets[sample++] = value;
    }
  }

  // Sync samples. No stss at all means every sample is a keyframe, which is
  // what an all-intra file says.
  let keyframes = null;
  if (stss) {
    const head = fullBox(view, stss);
    const entries = view.getUint32(head.at);
    keyframes = new Set();
    for (let e = 0; e < entries; e++) keyframes.add(view.getUint32(head.at + 4 + e * 4) - 1);
  }

  // Chunk offsets.
  const chunkHead = fullBox(view, stco);
  const chunkCount = view.getUint32(chunkHead.at);
  const wide = stco.type === 'co64';
  const chunkAt = (index) => (wide
    ? Number(view.getBigUint64(chunkHead.at + 4 + index * 8))
    : view.getUint32(chunkHead.at + 4 + index * 4));

  // How many samples sit in each chunk, as runs of "from this chunk onwards".
  const runsHead = fullBox(view, stsc);
  const runCount = view.getUint32(runsHead.at);
  const runs = [];
  for (let r = 0; r < runCount; r++) {
    runs.push({
      first: view.getUint32(runsHead.at + 4 + r * 12) - 1,
      perChunk: view.getUint32(runsHead.at + 8 + r * 12),
    });
  }
  if (!runs.length) throw new UnsupportedFile('read.chunktable');

  const samples = [];
  let index = 0;
  let run = 0;

  for (let chunk = 0; chunk < chunkCount && index < count; chunk++) {
    while (run + 1 < runs.length && runs[run + 1].first <= chunk) run++;
    let offset = chunkAt(chunk);

    for (let i = 0; i < runs[run].perChunk && index < count; i++) {
      const size = sizeAt(index);
      samples.push({
        offset,
        size,
        dts: times[index],
        pts: times[index] + offsets[index],
        isKey: keyframes ? keyframes.has(index) : true,
      });
      offset += size;
      index++;
    }
  }

  if (!samples.length) throw new UnsupportedFile('read.nosamples');
  return samples;
}

/* --------------------------------------------------------------- fragments */

/**
 * A fragmented file keeps no sample table in `moov` at all. Instead each `moof`
 * carries the table for the fragment behind it, and `trex` in the `moov` holds
 * the defaults those tables leave out. The result is the same flat list of
 * samples the plain layout produces, so nothing downstream has to know which
 * kind of file it came from.
 */
function fragmentDefaults(view, moov) {
  const defaults = new Map();
  const mvex = findBox(view, moov.body, moov.end, 'mvex');
  if (!mvex) return defaults;

  for (const trex of boxes(view, mvex.body, mvex.end)) {
    if (trex.type !== 'trex') continue;
    const { at } = fullBox(view, trex);
    defaults.set(view.getUint32(at), {
      duration: view.getUint32(at + 8),
      size: view.getUint32(at + 12),
      flags: view.getUint32(at + 16),
    });
  }
  return defaults;
}

/**
 * Walk every `moof` in the file and add its samples to the tracks that asked
 * for them.
 *
 * @param {Map<number, object[]>} wanted  track id -> the list to append to
 * @returns {Promise<Map<number, number>>} track id -> where its clock ended up
 */
async function readFragments(file, top, defaults, wanted) {
  const clocks = new Map();

  for (const fragment of top) {
    if (fragment.type !== 'moof') continue;

    const bytes = new Uint8Array(
      await file.slice(fragment.start, fragment.end).arrayBuffer());
    const view = new DataView(bytes.buffer);
    const moof = { body: fragment.body - fragment.start, end: bytes.length };

    for (const traf of boxes(view, moof.body, moof.end)) {
      if (traf.type !== 'traf') continue;

      const tfhd = findBox(view, traf.body, traf.end, 'tfhd');
      if (!tfhd) continue;

      const head = fullBox(view, tfhd);
      let at = head.at;
      const trackId = view.getUint32(at);
      at += 4;

      // Without an explicit base, offsets are counted from the start of this
      // moof, which is what `default-base-is-moof` asks for and what every
      // writer that omits the flag does anyway.
      let base = fragment.start;
      if (head.flags & 0x1) { base = Number(view.getBigUint64(at)); at += 8; }
      if (head.flags & 0x2) at += 4;    // sample description index, unused: there is only one

      const fallback = defaults.get(trackId) ?? { duration: 0, size: 0, flags: 0 };
      let defaultDuration = fallback.duration;
      let defaultSize = fallback.size;
      let defaultFlags = fallback.flags;
      if (head.flags & 0x8) { defaultDuration = view.getUint32(at); at += 4; }
      if (head.flags & 0x10) { defaultSize = view.getUint32(at); at += 4; }
      if (head.flags & 0x20) { defaultFlags = view.getUint32(at); at += 4; }

      const samples = wanted.get(trackId);
      if (!samples) continue;

      let clock = clocks.get(trackId) ?? 0;
      const tfdt = findBox(view, traf.body, traf.end, 'tfdt');
      if (tfdt) {
        const time = fullBox(view, tfdt);
        clock = time.version === 1
          ? Number(view.getBigUint64(time.at))
          : view.getUint32(time.at);
      }

      let offset = base;
      for (const trun of boxes(view, traf.body, traf.end)) {
        if (trun.type !== 'trun') continue;

        const run = fullBox(view, trun);
        let read = run.at;
        const count = view.getUint32(read);
        read += 4;
        if (run.flags & 0x1) { offset = base + view.getInt32(read); read += 4; }
        let firstFlags = null;
        if (run.flags & 0x4) { firstFlags = view.getUint32(read); read += 4; }

        for (let i = 0; i < count; i++) {
          let duration = defaultDuration;
          let size = defaultSize;
          let flags = i === 0 && firstFlags !== null ? firstFlags : defaultFlags;
          let composition = 0;

          if (run.flags & 0x100) { duration = view.getUint32(read); read += 4; }
          if (run.flags & 0x200) { size = view.getUint32(read); read += 4; }
          if (run.flags & 0x400) { flags = view.getUint32(read); read += 4; }
          if (run.flags & 0x800) {
            composition = run.version === 0 ? view.getUint32(read) : view.getInt32(read);
            read += 4;
          }

          samples.push({
            offset,
            size,
            dts: clock,
            pts: clock + composition,
            // Bit 16 of the sample flags is "this is not a sync sample", so a
            // fragment that says nothing about a sample is saying it is one.
            isKey: (flags & 0x10000) === 0,
          });
          offset += size;
          clock += duration;
        }
      }

      clocks.set(trackId, clock);
    }
  }

  return clocks;
}

/* ------------------------------------------------------------------ tracks */

/** The rotation a track's display matrix asks for, as 0, 90, 180 or 270. */
function rotationOf(view, at) {
  const a = view.getInt32(at) / 65536;
  const b = view.getInt32(at + 4) / 65536;
  const c = view.getInt32(at + 12) / 65536;
  const d = view.getInt32(at + 16) / 65536;

  if (a === 0 && d === 0) {
    if (b === 1 && c === -1) return 90;
    if (b === -1 && c === 1) return 270;
  }
  if (a === -1 && d === -1) return 180;
  return 0;
}

const VIDEO_ENTRIES = new Set(['avc1', 'avc3', 'hvc1', 'hev1', 'av01', 'vp09']);

function readVideoTrack(view, trak, timescale, duration, fragmented) {
  const tkhd = findBox(view, trak.body, trak.end, 'tkhd');
  const stbl = findPath(view, trak, 'mdia', 'minf', 'stbl');
  if (!tkhd || !stbl) throw new UnsupportedFile('read.nostbl');

  const head = fullBox(view, tkhd);
  const trackId = view.getUint32(head.at + (head.version === 1 ? 16 : 8));

  // tkhd v0 and v1 differ only in the width of the times before the matrix, so
  // the matrix is found by counting back from the end of the box rather than
  // forward from its start: it is always the 36 bytes before the 8 that hold
  // the display width and height.
  const rotation = rotationOf(view, tkhd.end - 44);

  const stsd = findBox(view, stbl.body, stbl.end, 'stsd');
  if (!stsd) throw new UnsupportedFile('read.nostsd');
  const [entry] = [...boxes(view, fullBox(view, stsd).at + 4, stsd.end)];
  if (!entry) throw new UnsupportedFile('read.emptystsd');

  if (entry.type === 'encv' || findBox(view, entry.body + 78, entry.end, 'sinf')) {
    throw new UnsupportedFile('read.encrypted');
  }
  if (!VIDEO_ENTRIES.has(entry.type)) {
    throw new UnsupportedFile('read.unknowncodec', { type: entry.type });
  }

  const codedWidth = view.getUint16(entry.body + 24);
  const codedHeight = view.getUint16(entry.body + 26);

  // The codec configuration box sits after the fixed 78-byte visual sample
  // entry header. It is handed to VideoDecoder untouched: this file works out
  // what to call the codec, and never rewrites what describes it.
  let codec = null;
  let description = null;
  for (const box of boxes(view, entry.body + 78, entry.end)) {
    const payload = () => new Uint8Array(
      view.buffer.slice(view.byteOffset + box.body, view.byteOffset + box.end));

    if (box.type === 'avcC') {
      description = payload();
      codec = avcCodec(entry.type === 'avc3' ? 'avc3' : 'avc1', description);
    } else if (box.type === 'hvcC') {
      description = payload();
      codec = hevcCodec(entry.type === 'hev1' ? 'hev1' : 'hvc1', description);
    } else if (box.type === 'av1C') {
      description = payload();
      codec = av1Codec(description);
    } else if (box.type === 'vpcC') {
      codec = vp9Codec(view, box);
    }
    if (codec) break;
  }
  if (!codec) throw new UnsupportedFile('read.noconfig', { type: entry.type });

  const samples = fragmented ? [] : readSamples(view, stbl);
  const turned = rotation === 90 || rotation === 270;

  return {
    trackId,
    codec,
    description,
    entryType: entry.type,
    codedWidth,
    codedHeight,
    displayWidth: turned ? codedHeight : codedWidth,
    displayHeight: turned ? codedWidth : codedHeight,
    rotation,
    timescale,
    duration,
    samples,
  };
}

function readAudioTrack(view, trak, timescale, duration, fragmented) {
  const tkhd = findBox(view, trak.body, trak.end, 'tkhd');
  const stbl = findPath(view, trak, 'mdia', 'minf', 'stbl');
  const stsd = stbl && findBox(view, stbl.body, stbl.end, 'stsd');
  if (!stsd || !tkhd) return null;

  const [entry] = [...boxes(view, fullBox(view, stsd).at + 4, stsd.end)];
  if (!entry) return null;
  if (entry.type === 'enca' || findBox(view, entry.body + 28, entry.end, 'sinf')) return null;

  const head = fullBox(view, tkhd);

  return {
    trackId: view.getUint32(head.at + (head.version === 1 ? 16 : 8)),
    // The sample entry is copied out whole and written back whole. Nothing in
    // this app has to understand what is inside it, and a description that is
    // never parsed is a description that cannot be got wrong - which is the
    // whole reason the audio can be carried across untouched.
    sampleEntry: new Uint8Array(
      view.buffer.slice(view.byteOffset + entry.start, view.byteOffset + entry.end)),
    entryType: entry.type,
    channels: view.getUint16(entry.body + 16),
    sampleRate: view.getUint32(entry.body + 24) / 65536,
    timescale,
    duration,
    samples: fragmented ? [] : readSamples(view, stbl),
  };
}

/* -------------------------------------------------------------------- read */

/**
 * @param {File} file
 * @returns {Promise<{video: object, audio: object|null, duration: number}>}
 * @throws {UnsupportedFile} when the file is out of scope. The caller is
 *   expected to fall back to the recording path and say why it did.
 */
export async function demux(file) {
  const top = await topLevel(file);
  if (!top.some((box) => box.type === 'ftyp' || box.type === 'moov')) {
    throw new UnsupportedFile('read.notmp4');
  }

  const outer = top.find((box) => box.type === 'moov');
  if (!outer) throw new UnsupportedFile('read.nomoov');

  const bytes = new Uint8Array(await file.slice(outer.start, outer.end).arrayBuffer());
  const view = new DataView(bytes.buffer);
  const moov = { body: outer.body - outer.start, end: bytes.length };

  // Either layout is fine; which one this is decides where the samples are
  // read from, and nothing else.
  const fragmented = Boolean(findBox(view, moov.body, moov.end, 'mvex'))
    || top.some((box) => box.type === 'moof');

  let video = null;
  let audio = null;

  for (const trak of boxes(view, moov.body, moov.end)) {
    if (trak.type !== 'trak') continue;

    const mdhd = findPath(view, trak, 'mdia', 'mdhd');
    const hdlr = findPath(view, trak, 'mdia', 'hdlr');
    if (!mdhd || !hdlr) continue;

    const head = fullBox(view, mdhd);
    const timescale = head.version === 1
      ? view.getUint32(head.at + 16)
      : view.getUint32(head.at + 8);
    const duration = head.version === 1
      ? Number(view.getBigUint64(head.at + 20))
      : view.getUint32(head.at + 12);

    const kind = fourcc(view, hdlr.body + 8);
    if (kind === 'vide' && !video) {
      video = readVideoTrack(view, trak, timescale, duration, fragmented);
    } else if (kind === 'soun' && !audio) {
      audio = readAudioTrack(view, trak, timescale, duration, fragmented);
    }
  }

  if (!video) throw new UnsupportedFile('read.novideo');
  if (!video.timescale) throw new UnsupportedFile('read.notimescale');

  if (fragmented) {
    const wanted = new Map([[video.trackId, video.samples]]);
    if (audio) wanted.set(audio.trackId, audio.samples);

    const clocks = await readFragments(file, top, fragmentDefaults(view, moov), wanted);
    if (!video.samples.length) {
      throw new UnsupportedFile('read.nofragments');
    }

    // A fragmented file usually declares a duration of zero in the header,
    // because the header is written before the fragments exist. Where it does,
    // the clock the fragments ended on is the real length.
    for (const track of [video, audio]) {
      const clock = track && clocks.get(track.trackId);
      if (track && clock && clock > track.duration) track.duration = clock;
    }
    if (audio && !audio.samples.length) audio = null;
  }

  return { video, audio, duration: video.duration / video.timescale };
}
