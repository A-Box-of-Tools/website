/**
 * Getting the frames out of the video, which there are two ways to do.
 *
 * A GIF is a handful of frames a second out of a video that has thirty or
 * sixty, so neither path here converts a video: both of them *sample* one. The
 * question each answers is "what was on screen at 4.25 seconds", and the two
 * differ only in who does the decoding.
 *
 *   - **The reader.** shared/mp4-reader.js walks the MP4 itself, hands the frames to
 *     WebCodecs, and the frames come back with the times the file says they
 *     have. It runs as fast as the machine can go, it is exact about which
 *     frame belongs to which instant, and it works on files this browser has no
 *     licence to play - an iPhone HEVC clip in Chrome, most obviously, which
 *     the hardware will happily decode even though the player refuses it.
 *   - **The player.** Seek the <video> element to each instant and copy what it
 *     shows. That accepts every format the browser plays, WebM and Ogg
 *     included, which no reader in this repository understands. It is slower -
 *     a seek is a decode from the previous keyframe, and doing sixty of them
 *     means decoding some frames several times - and it is at the mercy of the
 *     browser's own idea of which frame a seek lands on, which is usually but
 *     not always the frame in front of the mark.
 *
 * Both fill in the colour histogram as they go, because the palette has to
 * account for the whole animation and the frames are only in memory once.
 */

import { FileWindow } from './shared/mp4-reader.js';
import { drawScaled, frameCanvas } from './draw.js';
import { decoderConfig, settle } from './shared/webcodecs.js';
import { throwIfAborted } from './shared/errors.js';

/**
 * How far past the last wanted instant to keep feeding the decoder.
 *
 * Frames are stored in the order they have to be decoded, which is not the
 * order they are shown in: a file with B-frames stores a frame that is shown
 * later before one that is shown sooner. Stopping at the first stored frame
 * that is past the end would therefore drop frames that are not. Half a second
 * is more reordering than any real encoder does.
 */
const REORDER_SLACK = 0.5;

/** Give up on a seek that never lands rather than hanging the page. */
const SEEK_TIMEOUT = 10_000;

/**
 * Collects one RGBA buffer per wanted instant.
 *
 * The rule both paths follow is that an instant is served by the last frame at
 * or before it - which is what is actually on screen at that moment - so a
 * frame is only handed over once the next one proves nothing better is coming.
 */
class Sampler {
  #times;
  #ctx;
  #width;
  #height;
  #histogram;
  #step;

  frames = [];
  #drawn = false;

  constructor({ times, ctx, width, height, histogram, step }) {
    this.#times = times;
    this.#ctx = ctx;
    this.#width = width;
    this.#height = height;
    this.#histogram = histogram;
    this.#step = step;
  }

  get done() {
    return this.frames.length >= this.#times.length;
  }

  /** Everything on the canvas now, as its own buffer. */
  #take() {
    const { data } = this.#ctx.getImageData(0, 0, this.#width, this.#height);
    this.#histogram?.add(data, this.#step);
    this.frames.push(data);
  }

  /**
   * A frame has arrived, shown from `time` onwards. Serve every instant that
   * the frame already on the canvas is the right answer for, then keep this one
   * for the instants after it.
   */
  offer(time, paint) {
    // Only once something is on the canvas can an instant be served from it.
    // Until then this frame is the best answer for everything before it as
    // well: the section can begin before the first frame the decoder produces,
    // and an early frame beats a blank one.
    if (this.#drawn) {
      while (!this.done && this.#times[this.frames.length] < time - 1e-9) this.#take();
    }
    if (this.done) return;

    paint();
    this.#drawn = true;
  }

  /** No more frames are coming: the last one serves whatever is left. */
  finish() {
    if (!this.#drawn) return;
    while (!this.done) this.#take();
  }
}

/**
 * The reader path: demux the file, decode it, sample it.
 *
 * Only the part of the file the section needs is read. Decoding starts at the
 * last keyframe at or before the section - not at the section, which would
 * decode a frame with no reference to build it from - and stops once the frames
 * are past the end.
 */
export async function framesByDecoding({
  file, media, times, width, height, histogram, step = 1, onProgress, signal,
}) {
  const { video } = media;
  const { canvas, ctx } = frameCanvas(width, height);
  const sampler = new Sampler({ times, ctx, width, height, histogram, step });

  const startTicks = times[0] * video.timescale;
  const endTicks = times[times.length - 1] * video.timescale;

  let first = 0;
  for (let i = 0; i < video.samples.length; i += 1) {
    if (video.samples[i].isKey && video.samples[i].pts <= startTicks) first = i;
    if (video.samples[i].pts > startTicks) break;
  }

  let failure = null;

  const decoder = new VideoDecoder({
    output: (frame) => {
      try {
        if (failure || sampler.done) return;
        sampler.offer(frame.timestamp / 1_000_000, () => drawScaled(ctx, frame, {
          rotation: video.rotation,
          displayWidth: video.displayWidth,
          displayHeight: video.displayHeight,
          width,
          height,
        }));
        onProgress?.({ phase: 'reading', done: sampler.frames.length, total: times.length });
      } catch (error) {
        failure ??= error;
      } finally {
        frame.close();
      }
    },
    error: (error) => { failure ??= error; },
  });

  decoder.configure(decoderConfig(video));

  const window = new FileWindow(file);

  try {
    for (let i = first; i < video.samples.length; i += 1) {
      throwIfAborted(signal);
      if (failure) throw failure;
      if (sampler.done) break;

      const sample = video.samples[i];
      const bytes = await window.read(sample.offset, sample.size);

      decoder.decode(new EncodedVideoChunk({
        type: sample.isKey ? 'key' : 'delta',
        timestamp: Math.round(sample.pts / video.timescale * 1_000_000),
        data: bytes,   // EncodedVideoChunk copies, so the window may move on
      }));

      if (sample.pts > endTicks + REORDER_SLACK * video.timescale) break;

      await settle([decoder]);
    }

    await decoder.flush();
    if (failure) throw failure;

    sampler.finish();
    if (!sampler.frames.length) throw new Error('read.noframes');
    return sampler.frames;
  } finally {
    if (decoder.state !== 'closed') decoder.close();
    canvas.width = 0;   // let the browser drop the backing store now
  }
}

/**
 * The player path: seek, wait, copy what is on screen.
 *
 * Waiting is the whole difficulty. `seeked` fires when the element's clock has
 * moved, which is not quite the same as the new frame having been painted, and
 * a copy taken a moment early is the previous frame - which on a sampled
 * animation shows up as a stutter rather than as an obvious error.
 * requestVideoFrameCallback is the one API that says "a frame is now on
 * screen", so it is used where it exists, with a short wait after `seeked`
 * everywhere else.
 */
export async function framesByPlaying({
  video, times, width, height, histogram, step = 1, onProgress, signal,
}) {
  const { canvas, ctx } = frameCanvas(width, height);
  const frames = [];

  video.pause();

  try {
    for (let i = 0; i < times.length; i += 1) {
      throwIfAborted(signal);

      await seek(video, times[i]);
      drawScaled(ctx, video, {
        displayWidth: video.videoWidth,
        displayHeight: video.videoHeight,
        width,
        height,
      });

      const { data } = ctx.getImageData(0, 0, width, height);
      histogram?.add(data, step);
      frames.push(data);

      onProgress?.({ phase: 'reading', done: frames.length, total: times.length });
    }

    return frames;
  } finally {
    canvas.width = 0;
  }
}

function seek(video, seconds) {
  return new Promise((resolve, reject) => {
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      resolve();
    };

    const onSeeked = () => {
      // The clock has moved. Give the element one presented frame - or a few
      // milliseconds where it cannot report one - before reading the pixels.
      if (typeof video.requestVideoFrameCallback === 'function') {
        video.requestVideoFrameCallback(() => finish());
        setTimeout(finish, 120);
      } else {
        setTimeout(finish, 40);
      }
    };

    const onError = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      video.removeEventListener('seeked', onSeeked);
      reject(new Error('play.stopped'));
    };

    const timer = setTimeout(finish, SEEK_TIMEOUT);
    video.addEventListener('seeked', onSeeked, { once: true });
    video.addEventListener('error', onError, { once: true });

    // Seeking to exactly where the element already is fires nothing at all, so
    // that case resolves itself.
    if (Math.abs(video.currentTime - seconds) < 1e-4) finish();
    else video.currentTime = seconds;
  });
}
