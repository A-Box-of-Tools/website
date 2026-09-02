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

import { audioDecoderConfig, mp4aSampleEntry } from './shared/aac.js';

export { audioDecoderConfig, mp4aSampleEntry };

/** What a joined track is encoded at when the clips cannot agree. */
const TARGET_BITRATE = 160_000;

/** AAC-LC, which is the only thing in an MP4 that every player reads. */
const AAC_CODEC = 'mp4a.40.2';

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
