/**
 * The file behind the "Try an example" button: a WebM with sound, which is
 * the file this page exists to turn into something else.
 *
 * Built in the page rather than fetched, for the reason at the top of
 * shared/js/example-photo.js: the page's own policy forbids a fetch. It is
 * the clip every video tool demonstrates on, drawn by the same painter,
 * with the same soundtrack - but encoded as VP8 and Opus and written by
 * shared/js/mkv-writer.js, because an example that was already an MP4 would
 * demonstrate nothing. Both tracks then have to be encoded again on the way
 * through, which is the whole of what the page does, shown once.
 *
 * VP8 and Opus rather than VP9, because every browser with a VideoEncoder
 * at all can write VP8 in software, and a screen recording made in a
 * browser is VP8 or VP9 with Opus - the file people actually bring here.
 */

import { clipPainter } from './shared/example-video.js';
import { exampleAudio } from './shared/example-audio.js';
import { MkvWriter } from './shared/mkv-writer.js';

/** Opus only speaks 48 kHz; the shared soundtrack is drawn at 44.1. */
const OPUS_RATE = 48000;

/** How deep an encoder's queue may get before we let the page breathe. */
const BREATH = 24;

/** Hand the event loop one turn, without the setTimeout a background tab clamps. */
function turn() {
  return new Promise((settle) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => { channel.port1.close(); settle(); };
    channel.port2.postMessage(0);
  });
}

async function drain(encoder, limit = BREATH) {
  while (encoder.encodeQueueSize > limit) await turn();
}

/** Move PCM onto another sample rate, using the resampler the browser has. */
async function resample(channels, from, to) {
  if (from === to) return channels;
  const length = Math.max(1, Math.round(channels[0].length * to / from));
  const context = new OfflineAudioContext(channels.length, length, to);
  const buffer = context.createBuffer(channels.length, channels[0].length, from);
  for (let c = 0; c < channels.length; c += 1) buffer.copyToChannel(channels[c], c);
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start();
  const rendered = await context.startRendering();
  const out = [];
  for (let c = 0; c < channels.length; c += 1) out.push(rendered.getChannelData(c).slice());
  return out;
}

/** The picture as VP8 chunks. */
async function encodeVideo({ width, height, fps, total }) {
  const config = {
    codec: 'vp8', width, height, bitrate: Math.round(width * height * fps * 0.1), framerate: fps,
    latencyMode: 'quality',
  };
  const { supported } = await VideoEncoder.isConfigSupported(config);
  if (!supported) throw new Error('example.novp8');

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
  const paint = clipPainter(width, height, total, fps);

  const chunks = [];
  let failure = null;
  const encoder = new VideoEncoder({
    output: (chunk) => {
      try {
        const data = new Uint8Array(chunk.byteLength);
        chunk.copyTo(data);
        chunks.push({ data, isKey: chunk.type === 'key', timestamp: chunk.timestamp });
      } catch (error) {
        failure ??= error;
      }
    },
    error: (error) => { failure ??= error; },
  });
  encoder.configure(config);

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
  chunks.sort((a, b) => a.timestamp - b.timestamp);
  return chunks;
}

/** The soundtrack as Opus packets, and the header a track needs for them. */
async function encodeAudio({ seconds }) {
  const drawn = exampleAudio({ bars: Math.max(1, Math.round(seconds / 2)) });
  const channels = await resample(drawn.channels, drawn.sampleRate, OPUS_RATE);
  const count = channels.length;

  const config = { codec: 'opus', sampleRate: OPUS_RATE, numberOfChannels: count, bitrate: 96000 };
  const { supported } = await AudioEncoder.isConfigSupported(config);
  if (!supported) throw new Error('example.noopus');

  const packets = [];
  let head = null;
  let failure = null;
  const encoder = new AudioEncoder({
    output: (chunk, metadata) => {
      try {
        if (!head && metadata?.decoderConfig?.description) {
          head = new Uint8Array(metadata.decoderConfig.description);
        }
        const data = new Uint8Array(chunk.byteLength);
        chunk.copyTo(data);
        packets.push({ data, timestamp: chunk.timestamp });
      } catch (error) {
        failure ??= error;
      }
    },
    error: (error) => { failure ??= error; },
  });
  encoder.configure(config);

  const frames = channels[0].length;
  const step = 960;   // 20 ms at 48 kHz, which is an Opus packet
  try {
    for (let at = 0; at < frames; at += step) {
      if (failure) throw failure;
      const size = Math.min(step, frames - at);
      const interleaved = new Float32Array(size * count);
      for (let c = 0; c < count; c += 1) {
        for (let i = 0; i < size; i += 1) interleaved[i * count + c] = channels[c][at + i];
      }
      const data = new AudioData({
        format: 'f32',
        sampleRate: OPUS_RATE,
        numberOfFrames: size,
        numberOfChannels: count,
        timestamp: Math.round((at / OPUS_RATE) * 1_000_000),
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
  packets.sort((a, b) => a.timestamp - b.timestamp);
  return { packets, head: head ?? opusHead(count), channels: count };
}

/**
 * The identification header an Opus track carries when the encoder did not
 * hand one over: magic, version, channels, a pre-skip of 312 samples (what
 * libopus asks for at 48 kHz), the input rate, no gain, family 0.
 */
function opusHead(channels) {
  const out = new Uint8Array(19);
  out.set(new TextEncoder().encode('OpusHead'), 0);
  out[8] = 1;
  out[9] = channels;
  new DataView(out.buffer).setUint16(10, 312, true);
  new DataView(out.buffer).setUint32(12, OPUS_RATE, true);
  return out;
}

/**
 * @param {string} name the filename the picker will show
 * @returns {Promise<File>}
 */
export async function makeExample(name = 'recording.webm', {
  width = 960, height = 540, fps = 25, seconds = 8,
} = {}) {
  if (typeof VideoEncoder !== 'function' || typeof AudioEncoder !== 'function') {
    throw new Error('example.nowebcodecs');
  }
  const total = Math.max(1, Math.round(fps * seconds));
  const video = await encodeVideo({ width, height, fps, total });
  const audio = await encodeAudio({ seconds });

  const writer = new MkvWriter({ docType: 'webm' });
  const picture = writer.addVideoTrack({
    codecId: 'V_VP8', width, height, defaultDuration: Math.round(1e9 / fps),
  });
  const sound = writer.addAudioTrack({
    codecId: 'A_OPUS', codecPrivate: audio.head, sampleRate: OPUS_RATE, channels: audio.channels,
    codecDelay: 6_500_000, seekPreRoll: 80_000_000,
  });

  // Interleaved by time, the way a recorder writes them, so the reader is
  // shown the layout it will meet in the wild.
  const blocks = [
    ...video.map((chunk) => ({ track: picture, time: chunk.timestamp / 1000, isKey: chunk.isKey, data: chunk.data })),
    ...audio.packets.map((packet) => ({ track: sound, time: packet.timestamp / 1000, isKey: true, data: packet.data })),
  ].sort((a, b) => a.time - b.time || a.track - b.track);
  for (const block of blocks) {
    writer.addBlock(block.track, { time: block.time, isKey: block.isKey, data: block.data });
  }

  const blob = writer.finalize();
  return new File([blob], name, { type: 'video/webm', lastModified: Date.now() });
}
