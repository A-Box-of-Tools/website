/**
 * The direct path: open the file, decode only what is needed, encode the rest.
 *
 * A time-lapse asks a question no other video tool here asks - "what was on
 * screen at 0 seconds, at 2 seconds, at 4 seconds" - and the answer is not the
 * whole file. `decodeRuns` in plan.js works out which short runs of samples
 * have to go through the decoder to produce those instants, and this feeds it
 * exactly those and nothing else. An hour of 30 fps footage at sixty times is
 * about 1,800 instants out of 108,000 frames, and on a file with a keyframe
 * every two seconds that is a few thousand frames decoded rather than all of
 * them.
 *
 * Feeding a decoder a file with holes in it looks alarming and is not: each run
 * begins at a keyframe, and a keyframe is by definition a picture that depends
 * on nothing before it. The decoder is never reset between runs, which is what
 * keeps the pipeline full across a run that is only two frames long.
 */

import { FileWindow } from './demux.js';
import { decodeRuns } from './plan.js';
import { drawScaled, frameCanvas } from './draw.js';

/** Frames in flight before the feed loop waits for the pipeline to catch up. */
const QUEUE_LIMIT = 8;

class AbortedError extends Error {
  constructor() {
    super('Cancelled.');
    this.name = 'AbortError';
  }
}

function throwIfAborted(signal) {
  if (signal?.aborted) throw new AbortedError();
}

/** The configuration VideoDecoder needs to open a track demux() found. */
export function decoderConfig(video) {
  const config = {
    codec: video.codec,
    codedWidth: video.codedWidth,
    codedHeight: video.codedHeight,
  };
  // VP9 carries everything it needs in the bitstream; the others hand over the
  // configuration record the file was written with, untouched.
  if (video.description) config.description = video.description;
  return config;
}

/** Frames per second, averaged over the whole track. */
export function averageFps(video) {
  const seconds = video.duration / video.timescale;
  if (!seconds) return 30;
  return Math.min(240, Math.max(1, video.samples.length / seconds));
}

/**
 * Serves each wanted instant from the last frame at or before it.
 *
 * Which is what is actually on screen at that moment: a frame shown from 3.9
 * seconds is still the picture at 4.0. So a frame is only *used* once the next
 * one proves nothing better is coming, and the canvas holds the answer to every
 * instant until then.
 */
class Sampler {
  #times;
  #canvas;
  #write;
  #served = 0;
  #drawn = false;

  constructor({ times, canvas, write }) {
    this.#times = times;
    this.#canvas = canvas;
    this.#write = write;
  }

  get served() {
    return this.#served;
  }

  get done() {
    return this.#served >= this.#times.length;
  }

  /**
   * A frame has arrived, on screen from `time` onwards. Answer every instant
   * the picture already on the canvas is the right frame for, then paint this
   * one for the instants after it.
   */
  offer(time, paint) {
    // Only once something is on the canvas can an instant be answered from it.
    // Until then this frame is the best answer for everything before it too:
    // a file whose first frame is not at zero should not start with a blank.
    if (this.#drawn) {
      while (!this.done && this.#times[this.#served] < time - 1e-9) {
        this.#write(this.#canvas);
        this.#served += 1;
      }
    }
    if (this.done) return;

    paint();
    this.#drawn = true;
  }

  /** No more frames are coming: the last one answers whatever is left. */
  finish() {
    if (!this.#drawn) return;
    while (!this.done) {
      this.#write(this.#canvas);
      this.#served += 1;
    }
  }
}

/**
 * @param {object} args
 * @param {File} args.file
 * @param {object} args.media  what demux() returned
 * @param {number[]} args.times  the instants to take, in seconds, ascending
 * @param {number} args.width  the output frame, even
 * @param {number} args.height
 * @param {import('./encode.js').TimelapseWriter} args.writer
 * @returns {Promise<{blob: Blob, frames: number}>}
 */
export async function timelapseByDecoding({
  file, media, times, width, height, writer, onProgress, signal,
}) {
  const { video } = media;
  const { canvas, ctx } = frameCanvas(width, height);
  const runs = decodeRuns({ samples: video.samples, timescale: video.timescale, times });

  const sampler = new Sampler({
    times,
    canvas,
    write: (source) => writer.write(source),
  });

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
    // Progress is reported inside the feed rather than once per run, because a
    // run is not a unit of work: at 2x the whole file is one run, and a bar
    // that only moves when a run ends would sit at zero until it finished.
    let fed = 0;

    for (const run of runs) {
      if (sampler.done) break;

      for (let i = run.first; i <= run.last; i += 1) {
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

        while (decoder.decodeQueueSize > QUEUE_LIMIT) await tick(decoder);
        while (writer.busy) await writer.settle();

        fed += 1;
        if (fed % 10 === 0) {
          onProgress?.({ phase: 'working', done: sampler.served, total: times.length });
        }
      }
    }

    await decoder.flush();
    if (failure) throw failure;

    sampler.finish();
    onProgress?.({ phase: 'finishing', done: times.length, total: times.length });
    return await writer.finish();
  } finally {
    if (decoder.state !== 'closed') decoder.close();
    canvas.width = 0;   // let the browser drop the backing store now
  }
}

/** Wait for the decoder to hand something back, with a cap in case it does not. */
function tick(decoder) {
  return new Promise((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      decoder.removeEventListener('dequeue', done);
      resolve();
    };
    // `dequeue` is not in every implementation yet, so cap the wait.
    const timer = setTimeout(done, 20);
    decoder.addEventListener('dequeue', done);
  });
}

/**
 * Decode one frame near a point in time and draw it, whole and upright.
 *
 * This is what the page shows as a preview when the browser will not play the
 * file itself - an iPhone HEVC clip in a browser with no licence for it, say,
 * which WebCodecs will still decode happily through the machine's own hardware.
 */
export async function previewFrame({ file, media, atSeconds = 0, maxWidth = 640, signal }) {
  const { video } = media;
  const times = [Math.max(0, atSeconds)];
  const [run] = decodeRuns({ samples: video.samples, timescale: video.timescale, times });
  if (!run) throw new Error('decode.noframes');

  const scale = Math.min(1, maxWidth / video.displayWidth);
  const width = Math.max(2, Math.round(video.displayWidth * scale));
  const height = Math.max(2, Math.round(video.displayHeight * scale));
  const { canvas, ctx } = frameCanvas(width, height);

  let failure = null;
  let drawn = false;

  const sampler = new Sampler({ times, canvas, write: () => { drawn = true; } });

  const decoder = new VideoDecoder({
    output: (frame) => {
      try {
        if (failure) return;
        sampler.offer(frame.timestamp / 1_000_000, () => drawScaled(ctx, frame, {
          rotation: video.rotation,
          displayWidth: video.displayWidth,
          displayHeight: video.displayHeight,
          width,
          height,
        }));
      } catch (error) {
        failure ??= error;
      } finally {
        frame.close();
      }
    },
    error: (error) => { failure ??= error; },
  });

  decoder.configure(decoderConfig(video));

  const window = new FileWindow(file, 4 << 20);

  try {
    for (let i = run.first; i <= run.last; i += 1) {
      throwIfAborted(signal);
      if (failure) throw failure;

      const sample = video.samples[i];
      const bytes = await window.read(sample.offset, sample.size);
      decoder.decode(new EncodedVideoChunk({
        type: sample.isKey ? 'key' : 'delta',
        timestamp: Math.round(sample.pts / video.timescale * 1_000_000),
        data: bytes,
      }));
    }

    await decoder.flush();
    if (failure) throw failure;

    sampler.finish();
    if (!drawn) throw new Error('decode.nodraw');
    return canvas;
  } finally {
    if (decoder.state !== 'closed') decoder.close();
  }
}
