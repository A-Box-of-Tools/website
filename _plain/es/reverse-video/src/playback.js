/**
 * The playback path: let the browser decode the file, and step through it
 * backwards a seek at a time.
 *
 * This is what a WebM gets, and anything else there is no reader for in this
 * folder. It asks the <video> element for one moment of the clip after another,
 * from the end towards the beginning, draws each of them on a canvas, and hands
 * them to the same encoder the exact path uses. The picture that comes out is
 * the picture the browser would have shown you.
 *
 * What it costs, and the page says all three:
 *
 *   - **A seek a frame.** Seeking is not free - the browser still has to decode
 *     from the keyframe in front of wherever it lands - so this is slower than
 *     the exact path, usually by several times. It is not real time, though:
 *     nothing here plays anything through.
 *   - **A guessed frame rate.** The file's own frame times are not visible from
 *     out here, so the clip is sampled at a fixed rate, measured off a second of
 *     playback where the browser will report it and assumed to be 30 otherwise.
 *     A clip whose rate wandered comes out even.
 *   - **The sound, read whole.** There is no track to walk, so the file is
 *     handed to the browser's own reader in one piece; see src/audio.js.
 *
 * What it does not cost is your attention. A recording path - play it and
 * capture the canvas, which is what /crop-video/ falls back to - has to run
 * with the tab in front, because a browser stops painting a hidden one. Seeking
 * has no such requirement, so this can be left to get on with it.
 */

import { drawFitted } from './draw.js';
import { pickH264Codec } from './support.js';
import { reversedAudioTrack } from './audio.js';
import { writeFile } from './reverse.js';

/** Bits per pixel per frame, as in reverse.js. */
const QUALITY_BPP = { low: 0.05, medium: 0.1, high: 0.2 };
const QUALITY_HEADROOM = { low: 0.8, medium: 1.25, high: 2 };

const MIN_BITRATE = 200_000;
const MAX_BITRATE = 60_000_000;

/** Seconds between keyframes in the output, so seeking stays usable. */
const KEYFRAME_SECONDS = 2;

/** Frames in flight before the loop waits for the encoder to catch up. */
const QUEUE_LIMIT = 8;

/** How long one seek may take before the clip is called unreadable. */
const SEEK_TIMEOUT = 10_000;

/** What the frame rate is assumed to be when the browser will not say. */
const ASSUMED_FPS = 30;

class AbortedError extends Error {
  constructor() {
    super('Reverse cancelled.');
    this.name = 'AbortError';
  }
}

function throwIfAborted(signal) {
  if (signal?.aborted) throw new AbortedError();
}

/**
 * What to spend on the picture, when all that is known about the source is how
 * many bytes it took.
 *
 * The exact path can add up the frames it is going to re-encode; out here the
 * file size is the only measure of what the original spent, and it includes the
 * sound and the container. That makes it a slight over-estimate, which is the
 * safe direction for a ceiling.
 */
export function chooseBitrate({ fileSize, seconds, size, fps, quality }) {
  const pixels = size.width * size.height;
  const byPixels = pixels * fps * (QUALITY_BPP[quality] ?? QUALITY_BPP.medium);

  let ceiling = byPixels;
  if (seconds > 0) {
    const sourceRate = fileSize * 8 / seconds;
    ceiling = Math.min(ceiling, sourceRate * (QUALITY_HEADROOM[quality] ?? 1.25));
  }

  return Math.round(Math.min(MAX_BITRATE, Math.max(MIN_BITRATE, ceiling)));
}

/** The output frame size: what the player shows, rounded to what H.264 stores. */
export function outputSize(width, height) {
  return {
    width: Math.max(2, Math.floor(width / 2) * 2),
    height: Math.max(2, Math.floor(height / 2) * 2),
  };
}

/** Move to a point in the clip and wait until the picture there is ready. */
function seekTo(video, seconds) {
  return new Promise((resolve, reject) => {
    const done = (fail) => {
      clearTimeout(timer);
      video.removeEventListener('seeked', ok);
      video.removeEventListener('error', bad);
      if (fail) reject(fail);
      else resolve();
    };
    const ok = () => done(null);
    const bad = () => done(new Error('The browser stopped being able to read this clip.'));
    const timer = setTimeout(
      () => done(new Error('The browser took too long to seek in this clip.')), SEEK_TIMEOUT);

    video.addEventListener('seeked', ok, { once: true });
    video.addEventListener('error', bad, { once: true });
    video.currentTime = seconds;
  });
}

/**
 * Measure the frame rate off a second of the clip.
 *
 * `requestVideoFrameCallback` fires once a frame with the media time that frame
 * belongs to, so counting them over a known stretch of the clip gives the rate
 * the file actually runs at rather than the rate anybody assumed. Where it does
 * not exist - Firefox, at the time of writing - the assumption stands, and the
 * page says which of the two it is using.
 *
 * @returns {Promise<{fps: number, measured: boolean}>}
 */
export async function measureFps(video, seconds = 1) {
  if (typeof video.requestVideoFrameCallback !== 'function') {
    return { fps: ASSUMED_FPS, measured: false };
  }

  try {
    await seekTo(video, 0);
    video.muted = true;

    const counted = await new Promise((resolve) => {
      let frames = 0;
      let first = null;
      const stop = setTimeout(() => resolve({ frames, span: 0 }), (seconds + 2) * 1000);

      const tick = (now, metadata) => {
        const at = metadata.mediaTime;
        if (first === null) first = at;
        frames++;
        if (at - first >= seconds || video.ended) {
          clearTimeout(stop);
          resolve({ frames: frames - 1, span: at - first });
          return;
        }
        video.requestVideoFrameCallback(tick);
      };

      video.requestVideoFrameCallback(tick);
      video.play().catch(() => resolve({ frames: 0, span: 0 }));
    });

    video.pause();
    if (counted.span <= 0 || counted.frames < 2) return { fps: ASSUMED_FPS, measured: false };
    const rate = counted.frames / counted.span;
    if (!Number.isFinite(rate) || rate < 5 || rate > 120) {
      return { fps: ASSUMED_FPS, measured: false };
    }
    // Rounded to a whole number: 29.97 measures as 29.94 on a short sample, and
    // a frame rate that is nearly 30 is 30.
    return { fps: Math.round(rate), measured: true };
  } catch {
    return { fps: ASSUMED_FPS, measured: false };
  }
}

/** Wait until the encoder has caught up. */
async function settle(encoder) {
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
      const timer = setTimeout(done, 20);
      encoder.addEventListener('dequeue', done);
    });
  }
}

/**
 * @param {object} args
 * @param {File} args.file  for the sound; the picture comes from `video`
 * @param {HTMLVideoElement} args.video  already loaded with the file
 * @param {number} args.duration  seconds, as the player reports them
 * @param {number} args.fps  frames a second to sample at
 * @returns {Promise<{blob: Blob, extension: string, codec: string, frames: number,
 *                    exact: boolean, warning: string|null}>}
 */
export async function reverseByPlayback({
  file, video, duration, fps, quality = 'medium', keepAudio = true, onProgress, signal,
}) {
  const frame = outputSize(video.videoWidth, video.videoHeight);
  const total = Math.max(1, Math.floor(duration * fps));
  const bitrate = chooseBitrate({
    fileSize: file.size, seconds: duration, size: frame, fps, quality,
  });

  const codec = await pickH264Codec({
    width: frame.width, height: frame.height, framerate: Math.round(fps), bitrate,
  });
  if (!codec) {
    throw new Error(`This browser will not encode H.264 at ${frame.width}x${frame.height}. `
      + 'A smaller clip will work; this one will not.');
  }

  onProgress?.({ phase: 'preparing', done: 0, total });

  const canvas = document.createElement('canvas');
  canvas.width = frame.width;
  canvas.height = frame.height;
  const ctx = canvas.getContext('2d', { alpha: false });

  const encoded = [];
  let avcC = null;
  let failure = null;
  let lastKeyframeUs = -Infinity;

  const encoder = new VideoEncoder({
    output: (chunk, metadata) => {
      try {
        if (!avcC && metadata?.decoderConfig?.description) {
          const description = metadata.decoderConfig.description;
          avcC = description instanceof Uint8Array
            ? description
            : new Uint8Array(description instanceof ArrayBuffer
              ? description
              : description.buffer.slice(
                description.byteOffset, description.byteOffset + description.byteLength));
        }
        const data = new Uint8Array(chunk.byteLength);
        chunk.copyTo(data);
        encoded.push({
          data,
          isKey: chunk.type === 'key',
          time: Math.round(chunk.timestamp / 1_000_000 * 90000),
        });
      } catch (error) {
        failure ??= error;
      }
    },
    error: (error) => { failure ??= error; },
  });

  encoder.configure({
    codec,
    width: frame.width,
    height: frame.height,
    bitrate,
    framerate: Math.round(fps),
    avc: { format: 'avc' },
    alpha: 'discard',
    latencyMode: 'quality',
  });

  video.pause();

  try {
    for (let k = 0; k < total; k++) {
      throwIfAborted(signal);
      if (failure) throw failure;

      // The frame this one shows: counted from the end, and asked for half a
      // frame in, so a seek that rounds to the nearest picture lands on the one
      // meant rather than on its neighbour.
      const at = Math.min(
        Math.max(0, duration - 0.0005),
        (total - 1 - k) / fps + 0.5 / fps);

      await seekTo(video, at);
      await settle(encoder);

      // The player has already turned the picture whichever way the file asked
      // for, so there is nothing left here to rotate.
      drawFitted(ctx, video, {
        rotation: 0,
        displayWidth: video.videoWidth,
        displayHeight: video.videoHeight,
        frame,
      });

      const timestamp = Math.round(k / fps * 1_000_000);
      const keyFrame = timestamp - lastKeyframeUs >= KEYFRAME_SECONDS * 1_000_000;
      if (keyFrame) lastKeyframeUs = timestamp;

      const picture = new VideoFrame(canvas, {
        timestamp,
        duration: Math.round(1_000_000 / fps),
      });
      try {
        encoder.encode(picture, { keyFrame });
      } finally {
        picture.close();
      }

      if (k % 5 === 0 || k === total - 1) {
        onProgress?.({ phase: 'reversing', done: k + 1, total });
      }
    }

    onProgress?.({ phase: 'finishing', done: total, total });
    await encoder.flush();
    if (failure) throw failure;
    if (!encoded.length) throw new Error('No frames could be read out of this file.');
    if (!avcC) throw new Error('The encoder never reported a decoder configuration.');
  } finally {
    if (encoder.state !== 'closed') encoder.close();
  }

  let sound = null;
  let warning = null;

  if (keepAudio) {
    const result = await reversedAudioTrack({ file, audio: null, onProgress, signal });
    sound = result.track;
    warning = result.note;
  }

  return {
    blob: writeFile({ frame, avcC, encoded, fps, sound }),
    extension: 'mp4',
    codec,
    frames: encoded.length,
    exact: false,
    warning,
  };
}
