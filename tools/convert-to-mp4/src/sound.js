/**
 * The sound, for the files whose sound is not AAC: Opus out of a WebM,
 * Vorbis or MP3 or FLAC out of an MKV, decoded and encoded again as AAC so
 * that the MP4 carries the one sound every player expects.
 *
 * It streams. The trimmer's re-encode, which this began as, decodes a whole
 * clip's sound into memory and then encodes it, and for a join of a few
 * clips that is fine; a converter is handed an hour of screen recording, and
 * an hour of stereo as floats is more than a laptop tab should hold. So
 * here every packet the decoder hands back goes straight into the encoder
 * inside the decoder's own callback and is closed, and the feed loop waits
 * on both queues the way the video loop does. Nothing is held but the
 * encoded output, which is a tenth of the input.
 *
 * Two things a caller has to know:
 *
 *   - the encoder is configured for the rate and channels the *track* says
 *     before the first packet arrives, because asking whether that is
 *     supported is asynchronous and the callback is not. A decoder that
 *     hands back something else - it happens - reconfigures the encoder on
 *     the spot, and the browser's own error says so if it will not have it;
 *   - more than two channels are folded to two, because an MP4 that will
 *     upload is stereo and because the AAC encoder in most browsers takes
 *     nothing wider.
 */

import { FileWindow } from './shared/mp4-reader.js';
import { mp4aSampleEntry } from './shared/aac.js';
import { askSupported } from './shared/codec-support.js';
import { micros, settle } from './shared/webcodecs.js';
import { throwIfAborted } from './shared/errors.js';
import { closeGaps } from './plan.js';

/** AAC-LC, which is the only thing in an MP4 that every player reads. */
const AAC_CODEC = 'mp4a.40.2';

/** What the sound is written at. More than a phone microphone ever gave. */
const AAC_BITRATE = 160_000;

/** An AAC frame is 1024 samples, always. */
const AAC_FRAME = 1024;

/** How long a codec may go without draining before the run is called stuck. */
const STALL_MS = 30_000;

/** The channel count the file is written with, whatever it arrived with. */
const MAX_CHANNELS = 2;

/** Whether this browser will decode the sound a reader described. */
export async function canDecodeSound(sound) {
  if (typeof AudioDecoder !== 'function' || !sound?.codec) return false;
  const config = { codec: sound.codec, sampleRate: sound.sampleRate, numberOfChannels: sound.channels };
  if (sound.description) config.description = sound.description;
  return await askSupported(AudioDecoder, config) === true;
}

/** Whether this browser will encode AAC at this rate for this many channels. */
export async function canEncodeAac({ sampleRate, channels }) {
  if (typeof AudioEncoder !== 'function') return false;
  return await askSupported(AudioEncoder, {
    codec: AAC_CODEC, sampleRate, numberOfChannels: channels, bitrate: AAC_BITRATE,
  }) === true;
}

/**
 * Fold any number of channels down to two, a plane at a time.
 *
 * Front left and right stay where they are; the centre goes to both at
 * -3 dB; anything behind goes to its side at the same. It is the mix every
 * player does silently when it is handed 5.1 and has two speakers.
 */
function downmix(planes) {
  const count = planes.length;
  if (count <= MAX_CHANNELS) return planes;
  const frames = planes[0].length;
  const left = new Float32Array(frames);
  const right = new Float32Array(frames);
  const side = 0.7071;
  for (let i = 0; i < frames; i += 1) {
    let l = planes[0][i];
    let r = planes[1][i];
    if (count > 2) { l += planes[2][i] * side; r += planes[2][i] * side; }
    // Channel 3 in a 5.1 layout is the low-frequency one, left out.
    if (count > 4) { l += planes[4][i] * side; }
    if (count > 5) { r += planes[5][i] * side; }
    for (let c = 6; c < count; c += 1) {
      if (c % 2 === 0) l += planes[c][i] * side; else r += planes[c][i] * side;
    }
    left[i] = l;
    right[i] = r;
  }
  return [left, right];
}

/**
 * @param {object} args
 * @param {File} args.file
 * @param {object} args.audio  the track the reader found
 * @param {object} args.sound  describeSound() of it
 * @param {(progress: {phase: string, done: number, total: number}) => void} [args.onProgress]
 * @param {AbortSignal} [args.signal]
 * @returns {Promise<{sampleEntry: Uint8Array, timescale: number, samples: object[],
 *   start: number}>} a track for the writer, and where its sound begins on
 *   the file's clock, in seconds
 */
export async function reencodeSound({ file, audio, sound, onProgress, signal }) {
  const wanted = {
    sampleRate: Math.round(sound.sampleRate),
    numberOfChannels: Math.min(MAX_CHANNELS, sound.channels),
  };
  if (!await canEncodeAac({ sampleRate: wanted.sampleRate, channels: wanted.numberOfChannels })) {
    throw new Error('sound.noaac');
  }

  const encoded = [];
  let asc = null;
  let failure = null;
  let configured = { ...wanted };

  const encoder = new AudioEncoder({
    output: (chunk, metadata) => {
      try {
        if (!asc && metadata?.decoderConfig?.description) {
          asc = new Uint8Array(metadata.decoderConfig.description instanceof ArrayBuffer
            ? metadata.decoderConfig.description
            : metadata.decoderConfig.description.buffer.slice(
              metadata.decoderConfig.description.byteOffset,
              metadata.decoderConfig.description.byteOffset + metadata.decoderConfig.description.byteLength));
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
  encoder.configure({ codec: AAC_CODEC, ...configured, bitrate: AAC_BITRATE });

  const decoder = new AudioDecoder({
    output: (data) => {
      try {
        if (failure) return;
        const channels = data.numberOfChannels;
        const rate = data.sampleRate;
        const fold = channels > MAX_CHANNELS;

        if (rate !== configured.sampleRate || Math.min(channels, MAX_CHANNELS) !== configured.numberOfChannels) {
          configured = { sampleRate: rate, numberOfChannels: Math.min(channels, MAX_CHANNELS) };
          encoder.configure({ codec: AAC_CODEC, ...configured, bitrate: AAC_BITRATE });
        }

        if (!fold) {
          encoder.encode(data);
          return;
        }

        const planes = [];
        for (let c = 0; c < channels; c += 1) {
          const plane = new Float32Array(data.numberOfFrames);
          data.copyTo(plane, { planeIndex: c, format: 'f32-planar' });
          planes.push(plane);
        }
        const [left, right] = downmix(planes);
        const stereo = new Float32Array(left.length * 2);
        stereo.set(left, 0);
        stereo.set(right, left.length);
        const folded = new AudioData({
          format: 'f32-planar',
          sampleRate: rate,
          numberOfFrames: left.length,
          numberOfChannels: 2,
          timestamp: data.timestamp,
          data: stereo,
        });
        try {
          encoder.encode(folded);
        } finally {
          folded.close();
        }
      } catch (error) {
        failure ??= error;
      } finally {
        data.close();
      }
    },
    error: (error) => { failure ??= error; },
  });

  const config = { codec: sound.codec, sampleRate: sound.sampleRate, numberOfChannels: sound.channels };
  if (sound.description) config.description = sound.description;
  decoder.configure(config);

  const window = new FileWindow(file);
  const total = audio.samples.length;

  try {
    for (let i = 0; i < total; i += 1) {
      throwIfAborted(signal);
      if (failure) throw failure;
      await settle([decoder, encoder], { stallAfter: STALL_MS, stallKey: 'stall.sound' });

      const sample = audio.samples[i];
      const data = await window.read(sample.offset, sample.size);
      decoder.decode(new EncodedAudioChunk({
        type: 'key',
        timestamp: micros(sample.pts, audio.timescale),
        data,
      }));

      if (i % 50 === 0 || i === total - 1) {
        onProgress?.({ phase: 'sound', done: i + 1, total });
      }
    }

    await decoder.flush();
    if (failure) throw failure;
    await encoder.flush();
    if (failure) throw failure;
    if (!encoded.length || !asc) throw new Error('sound.noencode');
  } finally {
    if (decoder.state !== 'closed') decoder.close();
    if (encoder.state !== 'closed') encoder.close();
  }

  // The encoder counts in microseconds; the track counts in samples. One
  // conversion, here, so the caller never sees two clocks.
  const { sampleRate, numberOfChannels } = configured;
  encoded.sort((a, b) => a.timestamp - b.timestamp);
  const samples = closeGaps(encoded.map((chunk) => {
    const at = Math.round(chunk.timestamp / 1_000_000 * sampleRate);
    return { data: chunk.data, isKey: true, dts: at, pts: at };
  }), AAC_FRAME);

  return {
    sampleEntry: mp4aSampleEntry({ channels: numberOfChannels, sampleRate, asc }),
    timescale: sampleRate,
    samples,
    start: samples[0].dts / sampleRate,
  };
}
