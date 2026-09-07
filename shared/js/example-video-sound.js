/**
 * The same clip as example-video.js, with a soundtrack.
 *
 * Three tools need this rather than the silent one, and each for a reason that
 * would make a silent example actively misleading: the audio extractor's whole
 * job is pulling the sound out, and handed a clip with none it would correctly
 * report that there is nothing there; the trimmer and the reverser both cut and
 * re-lay the two tracks together, and their claim is that the sound stays with
 * the picture, which no silent file can demonstrate.
 *
 * WHY IT IS A SEPARATE MODULE
 *
 * Imports here are static and a tool ships every module it imports, so putting
 * the audio path into example-video.js would make the four tools that want a
 * silent clip carry an AAC encoder and a second MP4 writer they never call.
 * The picture is drawn by example-video.js all the same - `clipPainter` is
 * exported for exactly this - so there is one scene, not two.
 *
 * WHY A DIFFERENT WRITER
 *
 * shared/js/mp4-muxer.js, which the silent path uses, writes one H.264 track
 * and says so in its own header. Two tracks that have to be interleaved is
 * what shared/js/mp4-writer.js is for; it is told about a track rather than
 * deciding it, so the two sample entries are built here - `avcSampleEntry`
 * from the video encoder's own configuration record, `mp4aSampleEntry` from
 * the audio encoder's.
 */

import { clipPainter } from './example-video.js';
import { exampleAudio } from './example-audio.js';
import { Mp4Writer, avcSampleEntry } from './mp4-writer.js';
import { mp4aSampleEntry } from './aac.js';
import { pickH264Codec } from './video-support.js';

/** 90 kHz: the conventional video timescale, and divisible by every usual fps. */
const VIDEO_TIMESCALE = 90000;

/** An AAC frame is 1024 samples, always. */
const AAC_FRAME = 1024;

/** How deep an encoder's queue may get before we let the page breathe. */
const BREATH = 24;

/**
 * Hand the event loop one turn, without setTimeout.
 *
 * setTimeout(0) is clamped to a full second in a background tab, and encoding
 * yields dozens of times - which turned a clip that takes about a second into
 * one that took twenty-two whenever the tab was not in front. A visitor who
 * presses the button and then goes to read something else is the normal case,
 * not an edge one. A MessageChannel message is not clamped.
 */
function turn() {
  return new Promise((settle) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => { channel.port1.close(); settle(); };
    channel.port2.postMessage(0);
  });
}

/** Let the event loop turn while an encoder's queue drains. */
async function drain(encoder, limit = BREATH) {
  while (encoder.encodeQueueSize > limit) await turn();
}

/**
 * Encode the picture. Returns the samples in decode order plus the avcC record
 * the sample entry is built from.
 */
async function encodeVideo({ width, height, fps, total }) {
  const bitrate = Math.round(width * height * fps * 0.12);
  const codec = await pickH264Codec({ width, height, framerate: fps, bitrate });
  if (!codec) throw new Error('example.noh264');

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });

  const paint = clipPainter(width, height, total, fps);
  const samples = [];
  let description = null;
  let failure = null;

  const encoder = new VideoEncoder({
    output: (chunk, metadata) => {
      try {
        if (metadata?.decoderConfig?.description) {
          description ??= new Uint8Array(metadata.decoderConfig.description);
        }
        const data = new Uint8Array(chunk.byteLength);
        chunk.copyTo(data);
        samples.push({ data, isKey: chunk.type === 'key', timestamp: chunk.timestamp });
      } catch (error) {
        failure ??= error;
      }
    },
    error: (error) => { failure ??= error; },
  });

  encoder.configure({
    codec,
    width,
    height,
    bitrate,
    framerate: fps,
    avc: { format: 'avc' },
    alpha: 'discard',
    latencyMode: 'quality',
  });

  const frameDurationUs = 1_000_000 / fps;
  try {
    for (let i = 0; i < total; i += 1) {
      if (failure) throw failure;
      paint(ctx, i);
      const frame = new VideoFrame(canvas, {
        timestamp: Math.round(i * frameDurationUs),
        duration: Math.round(frameDurationUs),
      });
      try {
        encoder.encode(frame, { keyFrame: i % fps === 0 });
      } finally {
        frame.close();
      }
      await drain(encoder);
    }
    await encoder.flush();
    if (failure) throw failure;
  } finally {
    if (encoder.state !== 'closed') encoder.close();
  }

  if (!description) throw new Error('example.noavcc');
  // The encoder is configured without B-frames, so decode order is
  // presentation order and the timestamps arrive already sorted. Sorting
  // anyway costs nothing and means the writer is never handed a surprise.
  samples.sort((a, b) => a.timestamp - b.timestamp);
  return { samples, description };
}

/** Encode the soundtrack to AAC. Returns its samples and its AudioSpecificConfig. */
async function encodeAudio({ seconds }) {
  const { channels, sampleRate } = exampleAudio({ bars: Math.max(1, Math.round(seconds / 2)) });
  const count = channels.length;

  const samples = [];
  let description = null;
  let failure = null;

  const encoder = new AudioEncoder({
    output: (chunk, metadata) => {
      try {
        if (metadata?.decoderConfig?.description) {
          description ??= new Uint8Array(metadata.decoderConfig.description);
        }
        const data = new Uint8Array(chunk.byteLength);
        chunk.copyTo(data);
        samples.push({ data, timestamp: chunk.timestamp });
      } catch (error) {
        failure ??= error;
      }
    },
    error: (error) => { failure ??= error; },
  });

  const config = {
    codec: 'mp4a.40.2',
    sampleRate,
    numberOfChannels: count,
    bitrate: 128000,
  };
  const { supported } = await AudioEncoder.isConfigSupported(config);
  if (!supported) throw new Error('example.noaac');
  encoder.configure(config);

  // AudioData wants one interleaved run of f32 for 'f32' format.
  const frames = channels[0].length;
  try {
    for (let at = 0; at < frames; at += AAC_FRAME) {
      if (failure) throw failure;
      const size = Math.min(AAC_FRAME, frames - at);
      const interleaved = new Float32Array(size * count);
      for (let c = 0; c < count; c += 1) {
        const channel = channels[c];
        for (let i = 0; i < size; i += 1) interleaved[i * count + c] = channel[at + i];
      }
      const data = new AudioData({
        format: 'f32',
        sampleRate,
        numberOfFrames: size,
        numberOfChannels: count,
        timestamp: Math.round((at / sampleRate) * 1_000_000),
        data: interleaved,
      });
      try {
        encoder.encode(data);
      } finally {
        data.close();
      }
      await drain(encoder);
    }
    await encoder.flush();
    if (failure) throw failure;
  } finally {
    if (encoder.state !== 'closed') encoder.close();
  }

  if (!description) throw new Error('example.noasc');
  samples.sort((a, b) => a.timestamp - b.timestamp);
  return { samples, description, sampleRate, channels: count };
}

/**
 * A clip with a soundtrack, as a File.
 *
 * @param {string} name
 * @param {object} [options]
 * @returns {Promise<File>}
 */
export async function exampleVideoWithSound(name, {
  width = 960, height = 540, fps = 25, seconds = 8,
} = {}) {
  if (typeof VideoEncoder !== 'function' || typeof AudioEncoder !== 'function') {
    throw new Error('example.nowebcodecs');
  }

  const total = Math.max(1, Math.round(fps * seconds));
  const video = await encodeVideo({ width, height, fps, total });
  const audio = await encodeAudio({ seconds });

  const writer = new Mp4Writer();

  const videoTrack = writer.addTrack({
    kind: 'vide',
    timescale: VIDEO_TIMESCALE,
    sampleEntry: avcSampleEntry(width, height, video.description),
    width: width * 65536,
    height: height * 65536,
  });
  const tick = VIDEO_TIMESCALE / fps;
  video.samples.forEach((sample, i) => {
    videoTrack.addSample({
      data: sample.data,
      isKey: sample.isKey,
      dts: i * tick,
      pts: i * tick,
      duration: tick,
    });
  });

  const audioTrack = writer.addTrack({
    kind: 'soun',
    timescale: audio.sampleRate,
    sampleEntry: mp4aSampleEntry({
      channels: audio.channels,
      sampleRate: audio.sampleRate,
      asc: audio.description,
    }),
  });
  audio.samples.forEach((sample, i) => {
    audioTrack.addSample({
      data: sample.data,
      isKey: true,
      dts: i * AAC_FRAME,
      pts: i * AAC_FRAME,
      duration: AAC_FRAME,
    });
  });

  const blob = writer.finalize();
  return new File([blob], name, { type: 'video/mp4', lastModified: Date.now() });
}
