/**
 * Every frame of the GIF, composited the way a browser shows it, drawn on
 * to a canvas and handed to a VideoEncoder with the delay the GIF gave it;
 * the chunks written into an MP4 with those same delays.
 *
 * A GIF has no frame rate. Each frame says how long it stays, and the
 * delays vary - a slideshow holds a frame for two seconds and then flicks
 * through ten - so the video keeps every delay rather than resampling on
 * to a fixed rate: each frame is one sample whose duration is its delay,
 * which the MP4 writer records exactly. Nothing is duplicated and nothing
 * is dropped, and the video is the length the GIF plays for.
 *
 * The compositing is shared/js/gif-compose.js, the same replay the splitter
 * uses, over a solid colour: a video has no transparency, so what the GIF
 * let show through has to be something, and the page asks what.
 */

import { GifCanvas, flatten } from './shared/gif-compose.js';
import { Mp4Muxer } from './shared/mp4-muxer.js';
import { pickH264Codec } from './shared/video-support.js';
import { settle } from './shared/webcodecs.js';
import { throwIfAborted } from './shared/errors.js';
import { KEYFRAME_SECONDS, frameTimes } from './plan.js';
import { ENCODE_QUEUE_LIMIT, gifWorkingPlan, requireWorking, retainedGifBytes, sourceCopies } from './working.js';

/** How long a codec may go without draining before the run is called stuck. */
const STALL_MS = 30_000;

/**
 * @param {object} args
 * @param {object} args.gif  what decodeGif() returned
 * @param {{width: number, height: number, scale: number}} args.size  outputSize()
 * @param {number} args.fps  the nominal rate, for the encoder's hint
 * @param {number} args.bitrate
 * @param {{r: number, g: number, b: number}} args.background
 * @param {(progress: {phase: string, done: number, total: number}) => void} [args.onProgress]
 * @param {AbortSignal} [args.signal]
 * @returns {Promise<{blob: Blob, frames: number, seconds: number, codec: string}>}
 */
export async function gifToMp4({
  gif, size, fps, bitrate, background, onProgress, signal,
}) {
  throwIfAborted(signal);
  // The immutable source is scanned once, rather than once per encoded chunk.
  const working = { retainedBytes: retainedGifBytes(gif), copies: sourceCopies(gif) };
  requireWorking(gifWorkingPlan(gif, size, working));
  const { width, height, scale } = size;
  const codec = await pickH264Codec({ width, height, framerate: fps, bitrate });
  throwIfAborted(signal);
  if (!codec) {
    throw Object.assign(new Error('encode.noh264'), { values: { size: width + 'x' + height } });
  }

  onProgress?.({ phase: 'preparing', done: 0, total: 1 });
  const { times, total } = frameTimes(gif.frames);
  const durationOf = new Map();
  const muxer = new Mp4Muxer({ width, height });
  let stage, canvas, replay, encoder;
  let failure = null;
  let retired = false;
  const closeEncoder = () => {
    if (encoder && encoder.state !== 'closed') encoder.close();
  };
  // Blob finalization can retain a second copy of collected sample buffers.
  // Native codec private storage is not an exact part of this estimate.
  const checkStorage = (incoming = 0, config = muxer.avcC?.byteLength ?? 0) => requireWorking(gifWorkingPlan(gif, size,
    { ...working, chunkBytes: 2 * muxer.totalBytes + 3 * incoming + 2 * config }));
  const count = gif.frames.length;
  let lastKeyframe = -Infinity;

  try {
    throwIfAborted(signal);
    stage = document.createElement('canvas');
    stage.width = gif.width;
    stage.height = gif.height;
    const stageCtx = stage.getContext('2d', { willReadFrequently: false });
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: false });
    ctx.fillStyle = `rgb(${background.r}, ${background.g}, ${background.b})`;
    ctx.fillRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = scale !== 1;
    ctx.imageSmoothingQuality = 'high';
    replay = new GifCanvas(gif);
    encoder = new VideoEncoder({
      output: (chunk, metadata) => {
        if (retired || signal?.aborted || failure) return;
        try {
          const description = metadata?.decoderConfig?.description;
          checkStorage(chunk.byteLength, muxer.avcC?.byteLength ?? description?.byteLength ?? 0);
          if (description) muxer.setDecoderConfig(description);
          const data = new Uint8Array(chunk.byteLength);
          chunk.copyTo(data);
          const seconds = durationOf.get(chunk.timestamp) ?? (chunk.duration ?? 100_000) / 1_000_000;
          muxer.addSample(data, chunk.type === 'key', seconds);
        } catch (error) {
          failure ??= error;
          closeEncoder();
        }
      },
      error: (error) => { if (!retired && !signal?.aborted) failure ??= error; },
    });
    signal?.addEventListener('abort', closeEncoder, { once: true });
    encoder.configure({ codec, width, height, bitrate, framerate: fps,
      avc: { format: 'avc' }, alpha: 'discard', latencyMode: 'quality' });
    for (let i = 0; i < count; i += 1) {
      throwIfAborted(signal);
      if (failure) throw failure;
      await settle([encoder], { limit: ENCODE_QUEUE_LIMIT, stallAfter: STALL_MS, stallKey: 'stall.encoder' });
      throwIfAborted(signal);
      if (failure) throw failure;

      const shown = replay.next();
      if (!shown) break;

      // The compositor's buffer is reused for every frame, so the copy is
      // what gets flattened, not the canvas the disposal rules act on.
      const rgba = shown.pixels.slice();
      flatten(rgba, background);
      stageCtx.putImageData(new ImageData(rgba, gif.width, gif.height), 0, 0);
      ctx.drawImage(stage, 0, 0, gif.width, gif.height, 0, 0,
        Math.round(gif.width * scale), Math.round(gif.height * scale));

      const { start, duration } = times[i];
      const timestamp = Math.round(start * 1_000_000);
      durationOf.set(timestamp, duration);

      const keyFrame = start - lastKeyframe >= KEYFRAME_SECONDS;
      if (keyFrame) lastKeyframe = start;

      const frame = new VideoFrame(canvas, {
        timestamp,
        duration: Math.round(duration * 1_000_000),
      });
      try {
        encoder.encode(frame, { keyFrame });
      } finally {
        frame.close();
      }

      if (i % 5 === 0 || i === count - 1) {
        onProgress?.({ phase: 'encoding', done: i + 1, total: count });
      }
    }

    onProgress?.({ phase: 'finishing', done: count, total: count });
    await encoder.flush();
    throwIfAborted(signal);
    if (failure) throw failure;
    checkStorage();
    return { blob: muxer.finalize(), frames: count, seconds: total, codec };
  } catch (error) {
    throwIfAborted(signal);
    throw failure ?? error;
  } finally {
    retired = true;
    signal?.removeEventListener('abort', closeEncoder);
    closeEncoder();
    if (stage) stage.width = stage.height = 0;
    if (canvas) canvas.width = canvas.height = 0;
    if (replay) { replay.saved = null; replay.pixels = null; }
    muxer.samples.length = 0;
    muxer.avcC = null;
  }
}
