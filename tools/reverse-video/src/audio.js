/**
 * Sound, which a reversal cannot carry across the way the other video tools do.
 *
 * /crop-video/ and /trim-video/ move the audio samples without looking at them:
 * neither job changes when a sound happens, so the packets that arrived can be
 * written straight back out and "keep the sound" costs nothing at all.
 *
 * Reversing changes when everything happens, so there is nothing to carry. A
 * compressed audio packet is a few tens of milliseconds of sound with the one
 * before it folded into how it is coded; writing the packets out back to front
 * does not play a track backwards, it plays forty-six-millisecond pieces
 * forwards in the wrong order, which sounds like a fault rather than like a
 * reversal. The only honest way to do it is to decode the whole track, turn the
 * samples round, and encode it again - and that is what this file does.
 *
 * So the sound is re-encoded here, once, and the page says so. Two jobs the
 * other tools never needed come with it:
 *
 *   - **Reading a description.** `mp4a` wraps an `esds`, which wraps a chain of
 *     MPEG-4 descriptors, the innermost of which is the AudioSpecificConfig an
 *     AAC decoder needs. Everywhere else the sample entry is opaque bytes; here
 *     it has to be opened.
 *   - **Writing one.** The encoder hands back a new AudioSpecificConfig, and it
 *     has to go back into the same nest of descriptors for the file to be
 *     readable.
 *
 * Both halves are the ones written for the join in /trim-video/, which faced the
 * same wall from the other side. Nothing here reaches the network: the decoding
 * and the encoding are the browser's own, running on this machine.
 */

import { fourcc, bytes, concat, u16, u32, box } from './shared/mp4-boxes.js';

/** What a reversed track is encoded at. */
const TARGET_BITRATE = 160_000;

/** AAC-LC, which is the only thing in an MP4 that every player reads. */
const AAC_CODEC = 'mp4a.40.2';

/** Frames handed to the encoder in one go. One AAC packet is 1024. */
const ENCODE_STEP = 1024;

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
 *   `esds`, which is the only shape this file knows how to open. The caller
 *   falls back to the browser's own reader rather than giving up.
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
 * enough: the longest thing written here is an AudioSpecificConfig of five bytes
 * inside two wrappers, nowhere near the 127 a second byte would need.
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
export function mp4aSampleEntry({ channels, sampleRate, asc, bitrate = TARGET_BITRATE }) {
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

/* ---------------------------------------------------------------- the samples */

/**
 * Turn each channel back to front, in place.
 *
 * This is the whole of what "reverse the sound" means once the samples are in
 * hand, and it is exact: the numbers that went in come out in the other order,
 * none of them changed. Everything else in this file exists to get the samples
 * here and to put them back in a file afterwards.
 */
export function reverseChannels(channels) {
  for (const samples of channels) {
    for (let i = 0, j = samples.length - 1; i < j; i++, j--) {
      const held = samples[i];
      samples[i] = samples[j];
      samples[j] = held;
    }
  }
  return channels;
}

/** Whether this browser will encode AAC at all. */
export async function canEncodeAudio({ sampleRate, numberOfChannels }) {
  if (typeof window === 'undefined' || typeof window.AudioEncoder !== 'function') return false;
  try {
    const { supported } = await AudioEncoder.isConfigSupported({
      codec: AAC_CODEC,
      sampleRate,
      numberOfChannels,
      bitrate: TARGET_BITRATE,
    });
    return Boolean(supported);
  } catch {
    return false;
  }
}

/**
 * Decode the whole audio track, packet by packet, into flat PCM.
 *
 * The video is read a window at a time because it will not fit in memory; the
 * sound is a percent or two of the same file and does fit, which is fortunate,
 * because reversing needs the last sample before it can write the first one.
 *
 * @returns {Promise<{channels: Float32Array[], sampleRate: number}>}
 */
export async function decodeTrack({ file, track, config, onProgress, signal }) {
  const pieces = [];
  let frames = 0;
  let failure = null;

  const decoder = new AudioDecoder({
    output: (data) => {
      try {
        const planes = [];
        for (let channel = 0; channel < data.numberOfChannels; channel++) {
          const plane = new Float32Array(data.numberOfFrames);
          data.copyTo(plane, { planeIndex: channel, format: 'f32-planar' });
          planes.push(plane);
        }
        pieces.push(planes);
        frames += data.numberOfFrames;
      } catch (error) {
        failure ??= error;
      } finally {
        data.close();
      }
    },
    error: (error) => { failure ??= error; },
  });

  decoder.configure(config);

  try {
    for (let i = 0; i < track.samples.length; i++) {
      if (signal?.aborted) throw Object.assign(new Error('Cancelled.'), { name: 'AbortError' });
      if (failure) throw failure;

      const sample = track.samples[i];
      const data = new Uint8Array(
        await file.slice(sample.offset, sample.offset + sample.size).arrayBuffer());
      decoder.decode(new EncodedAudioChunk({
        type: 'key',
        timestamp: Math.round(sample.dts / track.timescale * 1_000_000),
        data,
      }));

      if (i % 200 === 0) onProgress?.({ done: i, total: track.samples.length });
    }

    await decoder.flush();
    if (failure) throw failure;
  } finally {
    if (decoder.state !== 'closed') decoder.close();
  }

  const count = Math.max(1, pieces[0]?.length ?? config.numberOfChannels);
  const channels = [];
  for (let c = 0; c < count; c++) channels.push(new Float32Array(frames));

  let at = 0;
  for (const planes of pieces) {
    const length = planes[0]?.length ?? 0;
    for (let c = 0; c < count; c++) channels[c].set(planes[Math.min(c, planes.length - 1)], at);
    at += length;
  }

  return { channels, sampleRate: config.sampleRate };
}

/**
 * The same thing, done by the browser's own reader.
 *
 * This is what the playback path uses, and what the exact path falls back to
 * for a video whose sound is something other than AAC. `decodeAudioData` reads
 * whatever the browser can play - MP3, Opus, Vorbis, FLAC, plain PCM - and
 * ignores the video track beside it entirely.
 *
 * It has one trap, which is why the rate is a parameter: the context decides
 * what rate the samples come back at, and anything that is not the file's own
 * rate means a resample nobody asked for. The exact path knows the real rate,
 * because the demuxer read it; the playback path has to assume one, and 48 kHz
 * is both what browsers record at and what Opus - the sound in almost every
 * WebM - is always coded at.
 *
 * @returns {Promise<{channels: Float32Array[], sampleRate: number}>}
 */
export async function decodeWholeFile(file, sampleRate = 48000) {
  const bytes = await file.arrayBuffer();
  const context = new OfflineAudioContext(1, 1, sampleRate);
  const audio = await context.decodeAudioData(bytes);

  const channels = [];
  for (let c = 0; c < audio.numberOfChannels; c++) channels.push(audio.getChannelData(c));
  if (!channels.length || !channels[0].length) {
    throw new Error('audio.nosound');
  }
  return { channels, sampleRate: audio.sampleRate };
}

/**
 * Encode PCM into AAC packets and describe them, ready for the muxer.
 *
 * @returns {Promise<{sampleEntry: Uint8Array, timescale: number,
 *                    samples: {data: Uint8Array, dts: number, duration: number}[]}>}
 */
export async function encodeAudioTrack({ channels, sampleRate, onProgress, signal }) {
  const numberOfChannels = Math.min(2, Math.max(1, channels.length));
  const length = channels[0]?.length ?? 0;

  const encoded = [];
  let asc = null;
  let failure = null;

  const encoder = new AudioEncoder({
    output: (chunk, metadata) => {
      try {
        if (!asc && metadata?.decoderConfig?.description) {
          const description = metadata.decoderConfig.description;
          asc = description instanceof Uint8Array
            ? new Uint8Array(description)
            : new Uint8Array(description instanceof ArrayBuffer
              ? description
              : description.buffer.slice(
                description.byteOffset, description.byteOffset + description.byteLength));
        }
        const data = new Uint8Array(chunk.byteLength);
        chunk.copyTo(data);
        encoded.push({ data, timestamp: chunk.timestamp, duration: chunk.duration });
      } catch (error) {
        failure ??= error;
      }
    },
    error: (error) => { failure ??= error; },
  });

  encoder.configure({
    codec: AAC_CODEC, sampleRate, numberOfChannels, bitrate: TARGET_BITRATE,
  });

  try {
    // Fed a packet at a time rather than all at once, so a long track does not
    // hand the encoder a single enormous buffer.
    for (let offset = 0; offset < length; offset += ENCODE_STEP) {
      if (signal?.aborted) throw Object.assign(new Error('Cancelled.'), { name: 'AbortError' });
      if (failure) throw failure;

      const count = Math.min(ENCODE_STEP, length - offset);
      const interleaved = new Float32Array(count * numberOfChannels);
      for (let c = 0; c < numberOfChannels; c++) {
        const plane = channels[Math.min(c, channels.length - 1)];
        for (let i = 0; i < count; i++) interleaved[i * numberOfChannels + c] = plane[offset + i];
      }

      const data = new AudioData({
        format: 'f32',
        sampleRate,
        numberOfFrames: count,
        numberOfChannels,
        timestamp: Math.round(offset / sampleRate * 1_000_000),
        data: interleaved,
      });
      try {
        encoder.encode(data);
      } finally {
        data.close();
      }

      if ((offset / ENCODE_STEP) % 200 === 0) onProgress?.({ done: offset, total: length });
    }

    await encoder.flush();
    if (failure) throw failure;
    if (!encoded.length || !asc) {
      throw new Error('audio.noencode');
    }
  } finally {
    if (encoder.state !== 'closed') encoder.close();
  }

  // The encoder counts in microseconds; the track counts in samples. One
  // conversion, here, so the caller never sees two clocks.
  const samples = encoded.map((chunk, index) => {
    const next = encoded[index + 1];
    const start = Math.round(chunk.timestamp / 1_000_000 * sampleRate);
    const end = next
      ? Math.round(next.timestamp / 1_000_000 * sampleRate)
      : start + Math.round((chunk.duration ?? 21_333) / 1_000_000 * sampleRate);
    return { data: chunk.data, dts: start, duration: Math.max(1, end - start) };
  });

  return {
    sampleEntry: mp4aSampleEntry({ channels: numberOfChannels, sampleRate, asc }),
    timescale: sampleRate,
    samples,
  };
}

/**
 * Everything between a file and a finished, reversed audio track.
 *
 * Handed to both export paths, because what happens to the sound does not
 * depend on how the picture was read.
 *
 * @returns {Promise<{track: object, note: string|null}>} `track` is null when
 *   the sound could not be reversed, and `note` says why in words the page
 *   prints as it stands.
 */
export async function reversedAudioTrack({
  file, audio, maxDecodeBytes = 800 << 20, onProgress, signal,
}) {
  const config = audio ? audioDecoderConfig(audio) : null;
  const canDecodeTrack = Boolean(config) && typeof window.AudioDecoder === 'function';

  // The rate the samples will come back at, which is the rate they will be
  // encoded at: whatever the file says where the file was read here, and the
  // assumption in decodeWholeFile where it was not.
  const sampleRate = config ? config.sampleRate : 48000;

  let decoded;
  if (canDecodeTrack) {
    onProgress?.({ phase: 'sound-reading', done: 0, total: 1 });
    decoded = await decodeTrack({ file, track: audio, config, signal });
  } else {
    if (file.size > maxDecodeBytes) {
      return {
        track: null,
        // A key rather than a sentence: this file is copied byte for byte into
        // fifteen languages, and main.js is where the words live.
        note: 'audio.toolarge',
      };
    }
    onProgress?.({ phase: 'sound-reading', done: 0, total: 1 });
    try {
      decoded = await decodeWholeFile(file, sampleRate);
    } catch {
      // Either there is no audio track in the file or this browser will not
      // decode the one there is. Nothing out here can tell those apart, so the
      // note says both rather than picking one and being wrong half the time.
      return {
        track: null,
        note: 'audio.unreadable',
      };
    }
  }

  if (!decoded.channels.length || !decoded.channels[0].length) {
    return { track: null, note: null };
  }

  if (!await canEncodeAudio({
    sampleRate: decoded.sampleRate,
    numberOfChannels: Math.min(2, decoded.channels.length),
  })) {
    return {
      track: null,
      note: 'audio.noaac',
    };
  }

  reverseChannels(decoded.channels);

  onProgress?.({ phase: 'sound-writing', done: 0, total: 1 });
  const track = await encodeAudioTrack({
    channels: decoded.channels,
    sampleRate: decoded.sampleRate,
    onProgress: (progress) => onProgress?.({ phase: 'sound-writing', ...progress }),
    signal,
  });

  return { track, note: null };
}
