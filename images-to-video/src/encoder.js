/**
 * The primary export path: WebCodecs VideoEncoder -> hand-rolled MP4 muxer.
 *
 * Encodes far faster than real time and gives exact frame timing, so a
 * "3 seconds" image is exactly 3 seconds long in the output.
 */

import { Mp4Muxer } from './mp4.js';
import { drawFrame } from './compose.js';
import { decodeFull } from './images.js';
import { pickH264Codec } from './support.js';

/** Bits per pixel per frame. Slideshows are mostly static, so rate control
 *  lands well under these ceilings in practice. */
const QUALITY_BPP = { low: 0.03, medium: 0.07, high: 0.15 };

const MAX_BITRATE = 50_000_000;
const QUEUE_LIMIT = 8; // frames in flight before we wait for the encoder

class AbortedError extends Error {
  constructor() {
    super('Export cancelled.');
    this.name = 'AbortError';
  }
}

function throwIfAborted(signal) {
  if (signal?.aborted) throw new AbortedError();
}

/** Wait until the encoder has drained below the queue limit. */
async function applyBackpressure(encoder) {
  while (encoder.encodeQueueSize > QUEUE_LIMIT) {
    await new Promise((resolve) => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        encoder.removeEventListener('dequeue', done);
        resolve();
      };
      // `dequeue` is not in every implementation yet, so cap the wait.
      const timer = setTimeout(done, 50);
      encoder.addEventListener('dequeue', done);
    });
  }
}

/** Total frames the timeline will produce. */
export function countFrames(items, fps) {
  return items.reduce((total, item) => total + Math.max(1, Math.round(item.duration * fps)), 0);
}

/**
 * @param {{items: object[], settings: object, onProgress?: Function, signal?: AbortSignal}} args
 * @returns {Promise<{blob: Blob, extension: string, codec: string}>}
 */
export async function encodeToMp4({ items, settings, onProgress, signal }) {
  const { width, height, fps, fit, background, quality } = settings;

  const bitrate = Math.min(
    MAX_BITRATE,
    Math.round(width * height * fps * (QUALITY_BPP[quality] ?? QUALITY_BPP.medium)),
  );

  const codec = await pickH264Codec({ width, height, framerate: fps, bitrate });
  if (!codec) {
    throw new Error(
      `This browser will not encode H.264 at ${width}×${height}. `
      + 'Try a smaller resolution, or switch the output format to WebM.',
    );
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: false });

  const muxer = new Mp4Muxer({ width, height });

  let encoderError = null;
  const encoder = new VideoEncoder({
    output: (chunk, metadata) => {
      try {
        if (metadata?.decoderConfig?.description) {
          muxer.setDecoderConfig(metadata.decoderConfig.description);
        }
        const data = new Uint8Array(chunk.byteLength);
        chunk.copyTo(data);
        muxer.addSample(data, chunk.type === 'key', 1 / fps);
      } catch (err) {
        encoderError ??= err;
      }
    },
    error: (err) => { encoderError ??= err; },
  });

  encoder.configure({
    codec,
    width,
    height,
    bitrate,
    framerate: fps,
    avc: { format: 'avc' },       // length-prefixed NALUs + an avcC record, which is what MP4 wants
    alpha: 'discard',
    latencyMode: 'quality',
  });

  const totalFrames = countFrames(items, fps);
  const frameDurationUs = 1_000_000 / fps;
  let frameIndex = 0;

  try {
    for (const item of items) {
      throwIfAborted(signal);
      if (encoderError) throw encoderError;

      const bitmap = await decodeFull(item);
      try {
        // The image is static for its whole run, so compose once and reuse the canvas.
        drawFrame(ctx, bitmap, { fit, background });
      } finally {
        bitmap.close();
      }

      const frames = Math.max(1, Math.round(item.duration * fps));
      for (let i = 0; i < frames; i++) {
        throwIfAborted(signal);
        if (encoderError) throw encoderError;

        await applyBackpressure(encoder);

        const frame = new VideoFrame(canvas, {
          timestamp: Math.round(frameIndex * frameDurationUs),
          duration: Math.round(frameDurationUs),
        });
        try {
          // Start each image on a keyframe so seeking lands on picture boundaries.
          encoder.encode(frame, { keyFrame: i === 0 });
        } finally {
          frame.close();
        }

        frameIndex++;
        if (frameIndex % 5 === 0 || frameIndex === totalFrames) {
          onProgress?.({ phase: 'encoding', done: frameIndex, total: totalFrames });
        }
      }
    }

    onProgress?.({ phase: 'finishing', done: totalFrames, total: totalFrames });
    await encoder.flush();
    if (encoderError) throw encoderError;

    return { blob: muxer.finalize(), extension: 'mp4', codec };
  } finally {
    if (encoder.state !== 'closed') encoder.close();
  }
}
