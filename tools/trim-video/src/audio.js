/**
 * Sound, for the one case where it cannot simply be carried across.
 *
 * Everywhere else in this tool the audio samples are moved without being
 * looked at: a trim does not change them, and a join between clips that
 * describe their sound the same way does not either. That is why "keep the
 * sound" normally costs nothing at all.
 *
 * Joining clips that describe their sound *differently* is the exception. One
 * track carries one description, so two clips at different sample rates, or
 * with different channel counts, or encoded with different settings, cannot
 * share one. The choice is to re-encode the sound or to drop it, and dropping
 * it silently would be the worst of the three.
 *
 * So this file does the two jobs the rest of the tool never needed:
 *
 *   - **Reading a description.** `mp4a` wraps an `esds`, which wraps a chain of
 *     MPEG-4 descriptors, the innermost of which is the AudioSpecificConfig
 *     that an AAC decoder needs. Everywhere else the sample entry is opaque
 *     bytes; here it has to be opened.
 *   - **Writing one.** The encoder hands back a new AudioSpecificConfig, and it
 *     has to go back into the same nest of descriptors for the file to be
 *     readable.
 *
 * Nothing here reaches the network, and the decoding and encoding are the
 * browser's own, running on this machine.
 */

import { fourcc, bytes, concat, u16, u32, box } from './shared/mp4-boxes.js';

/** What a joined track is encoded at when the clips cannot agree. */
const TARGET_BITRATE = 160_000;

/** AAC-LC, which is the only thing in an MP4 that every player reads. */
const AAC_CODEC = 'mp4a.40.2';

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
 *   `esds`, which is the only shape this tool knows how to decode.
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
 */
function descriptor(tag, ...payload) {
  const body = concat(payload);
  if (body.byteLength > 0x7f) {
    throw new Error('audio.toobig');
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

/* --------------------------------------------------------------- re-encoding */

/** Whether this browser will decode and encode AAC at all. */
export async function canReEncodeAudio({ sampleRate, numberOfChannels }) {
  if (typeof window === 'undefined') return false;
  if (typeof window.AudioEncoder !== 'function' || typeof window.AudioDecoder !== 'function') {
    return false;
  }
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
 * The rate and channel count a joined track is encoded at.
 *
 * The highest rate any clip arrived at, so nothing is downsampled that did not
 * have to be, capped at 48 kHz because nothing anybody joins in a browser
 * benefits from more. The widest channel count, so a stereo clip does not
 * collapse to mono because a mono one was in the list.
 */
export function targetAudioFormat(clips) {
  let sampleRate = 0;
  let numberOfChannels = 0;
  for (const clip of clips) {
    const audio = clip.media?.audio;
    if (!audio?.samples.length) continue;
    sampleRate = Math.max(sampleRate, Math.round(audio.sampleRate));
    numberOfChannels = Math.max(numberOfChannels, audio.channels);
  }
  return {
    sampleRate: Math.min(48000, sampleRate || 48000),
    numberOfChannels: Math.min(2, numberOfChannels || 2),
  };
}

/**
 * Decode one clip's chosen sections into flat PCM, one array a channel.
 *
 * @returns {Promise<{channels: Float32Array[], sampleRate: number}>}
 */
async function decodeSections({ file, media, plans, config, signal }) {
  const track = media.audio;
  const chunks = [];
  let failure = null;

  const decoder = new AudioDecoder({
    output: (data) => {
      try {
        const planes = [];
        const count = data.numberOfFrames;
        for (let channel = 0; channel < data.numberOfChannels; channel++) {
          const plane = new Float32Array(count);
          data.copyTo(plane, { planeIndex: channel, format: 'f32-planar' });
          planes.push(plane);
        }
        chunks.push({ planes, timestamp: data.timestamp, count });
      } catch (error) {
        failure ??= error;
      } finally {
        data.close();
      }
    },
    error: (error) => { failure ??= error; },
  });

  decoder.configure(config);

  const wanted = [];

  try {
    for (const plan of plans) {
      if (!plan.audio) continue;
      const first = chunks.length;

      for (let i = plan.audio.from; i <= plan.audio.to; i++) {
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
      }
      await decoder.flush();
      if (failure) throw failure;

      // What came back covers the section and a little in front of it, because
      // a packet that starts before the mark still has to be decoded to reach
      // the part after it. This is where that lead-in is dropped.
      const decoded = chunks.slice(first);
      const startedAt = decoded.length ? decoded[0].timestamp / 1_000_000 : plan.start;
      const skip = Math.max(0, Math.round((plan.start - startedAt) * config.sampleRate));
      const length = Math.max(0, Math.round((plan.end - plan.start) * config.sampleRate));
      wanted.push({ decoded, skip, length });
    }
  } finally {
    if (decoder.state !== 'closed') decoder.close();
  }

  const total = wanted.reduce((sum, section) => sum + section.length, 0);
  const channels = [];
  for (let c = 0; c < config.numberOfChannels; c++) channels.push(new Float32Array(total));

  let at = 0;
  for (const section of wanted) {
    let seen = 0;
    let written = 0;
    for (const chunk of section.decoded) {
      for (let i = 0; i < chunk.count && written < section.length; i++) {
        if (seen + i < section.skip) continue;
        for (let c = 0; c < channels.length; c++) {
          const plane = chunk.planes[Math.min(c, chunk.planes.length - 1)];
          channels[c][at + written] = plane ? plane[i] : 0;
        }
        written++;
      }
      seen += chunk.count;
      if (written >= section.length) break;
    }
    at += section.length;
  }

  return { channels, sampleRate: config.sampleRate };
}

/** Move PCM onto another sample rate, using the resampler the browser has. */
async function resample(channels, from, to) {
  if (from === to || !channels[0]?.length) return channels;

  const length = Math.max(1, Math.round(channels[0].length * to / from));
  const context = new OfflineAudioContext(channels.length, length, to);
  const buffer = context.createBuffer(channels.length, channels[0].length, from);
  for (let c = 0; c < channels.length; c++) buffer.copyToChannel(channels[c], c);

  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start();

  const rendered = await context.startRendering();
  const out = [];
  for (let c = 0; c < channels.length; c++) out.push(rendered.getChannelData(c).slice());
  return out;
}

/**
 * Decode every clip's sound, lay it end to end, and encode it once.
 *
 * A clip with no sound of its own contributes silence for exactly as long as
 * its picture runs, which is what keeps the rest of the join lined up: the
 * alternative is a track that is shorter than the video and drifts further out
 * of step after every gap.
 *
 * @returns {Promise<{sampleEntry: Uint8Array, timescale: number,
 *                    samples: object[]}|null>} null when this browser will not
 *   encode AAC, which the caller reports rather than working around.
 */
export async function encodeJoinedAudio({
  clips, format, onProgress, signal,
}) {
  const { sampleRate, numberOfChannels } = format;
  if (!await canReEncodeAudio(format)) return null;

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

  /** Where the next clip's sound begins, in frames at the target rate. */
  let at = 0;

  try {
    for (let index = 0; index < clips.length; index++) {
      const clip = clips[index];
      if (signal?.aborted) throw Object.assign(new Error('Cancelled.'), { name: 'AbortError' });
      if (failure) throw failure;

      onProgress?.({ phase: 'sound', done: index, total: clips.length });

      const seconds = clip.plans.reduce((sum, plan) => sum + (plan.end - plan.start), 0);
      let channels;

      const config = clip.media.audio && clip.media.audio.samples.length
        ? audioDecoderConfig(clip.media.audio)
        : null;

      if (config) {
        const decoded = await decodeSections({
          file: clip.file, media: clip.media, plans: clip.plans, config, signal,
        });
        channels = await resample(decoded.channels, decoded.sampleRate, sampleRate);
      } else {
        // No sound, or sound in something this cannot open. Either way the
        // picture still runs for this long and the track has to as well.
        const length = Math.max(0, Math.round(seconds * sampleRate));
        channels = [];
        for (let c = 0; c < numberOfChannels; c++) channels.push(new Float32Array(length));
      }

      while (channels.length < numberOfChannels) channels.push(channels[0]);
      const length = channels[0].length;

      // Fed in packet-sized pieces rather than all at once, so a long join does
      // not hand the encoder a single enormous buffer.
      const step = 1024;
      for (let offset = 0; offset < length; offset += step) {
        if (failure) throw failure;
        const count = Math.min(step, length - offset);
        const interleaved = new Float32Array(count * numberOfChannels);
        for (let c = 0; c < numberOfChannels; c++) {
          const plane = channels[c];
          for (let i = 0; i < count; i++) interleaved[i * numberOfChannels + c] = plane[offset + i];
        }
        const data = new AudioData({
          format: 'f32',
          sampleRate,
          numberOfFrames: count,
          numberOfChannels,
          timestamp: Math.round((at + offset) / sampleRate * 1_000_000),
          data: interleaved,
        });
        try {
          encoder.encode(data);
        } finally {
          data.close();
        }
      }

      at += length;
    }

    await encoder.flush();
    if (failure) throw failure;
    // Not `return null`: null means "this browser will not encode AAC", which
    // the caller reports in those words. Getting here means it would have and
    // did not, which is a fault in this file rather than in the browser, and
    // saying otherwise sends somebody to install a different one.
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
