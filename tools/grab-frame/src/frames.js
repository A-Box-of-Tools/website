/**
 * The frames of a video, as a list you can ask for one of.
 *
 * This is the whole of what makes the tool exact. The reader next door hands
 * back the samples of a track in the order they are *decoded*; what somebody
 * scrubbing a video is moving through is the order they are *watched* in, and
 * in any file with B-frames those are not the same order. So the list is sorted
 * once, by presentation time, and every number on the page - "frame 812 of
 * 3,540", the time under the slider, which frame the arrow keys move to - is an
 * index into that sorted list.
 *
 * Asking for frame 812 then means three things:
 *
 *   1. walk back to the last keyframe at or before it, because a frame that is
 *      not one cannot be decoded without the frames it was predicted from;
 *   2. feed everything from there up to it, in decode order;
 *   3. flush, and keep the frame whose timestamp is the one that was asked for.
 *
 * Step three is not "keep the last frame out". A decoder hands frames back in
 * presentation order, and the last one out of a run that stopped mid-GOP can
 * easily be a frame that is watched *after* the one wanted. Matching on the
 * timestamp is the only version of this that is right on a file with B-frames,
 * and a file with B-frames is most of them.
 *
 * The functions above the class are pure arithmetic over the sample list and
 * are covered by tests/js/grab-frame.test.js. The class below them needs a
 * VideoDecoder and a canvas, so it is checked in a browser instead.
 */

import { FileWindow } from './demux.js';
import { drawUpright } from './draw.js';

/** Presentation time in microseconds, which is what WebCodecs counts in. */
export function micros(ticks, timescale) {
  return Math.round(ticks / timescale * 1_000_000);
}

/**
 * The frames of a track in the order they are watched in.
 *
 * @param {object} video  the video track demux() returned
 * @returns {{decode: number, pts: number, time: number, isKey: boolean}[]}
 *   sorted by presentation time; `decode` is where that frame sits in the
 *   file's own order, which is what has to be fed to the decoder.
 */
export function displayOrder(video) {
  const list = video.samples.map((sample, decode) => ({
    decode,
    pts: sample.pts,
    time: sample.pts / video.timescale,
    isKey: Boolean(sample.isKey),
  }));

  // Ties broken by decode order, so a file that stamps two frames with the same
  // presentation time still comes out in a stable, reproducible order rather
  // than whatever the sort happened to do with it.
  list.sort((a, b) => (a.pts - b.pts) || (a.decode - b.decode));
  return list;
}

/**
 * The frame being watched at `seconds`: the last one whose time is at or before
 * it, which is what a player is showing at that moment.
 *
 * Binary search rather than a scan, because this is called on every drag of the
 * slider and a long clip has tens of thousands of frames in it.
 *
 * @returns {number} an index into `order`, clamped to the list
 */
export function frameNear(order, seconds) {
  if (!order.length) return -1;
  if (seconds <= order[0].time) return 0;

  let low = 0;
  let high = order.length - 1;
  while (low < high) {
    const mid = (low + high + 1) >> 1;
    if (order[mid].time <= seconds) low = mid;
    else high = mid - 1;
  }
  return low;
}

/**
 * The decode index of the last keyframe at or before `decodeIndex`.
 *
 * A file whose first sample is not a keyframe - which happens, usually because
 * it was cut by something careless - is decoded from the start anyway rather
 * than refused. The decoder will drop what it cannot use.
 */
export function keyframeBefore(samples, decodeIndex) {
  for (let i = Math.min(decodeIndex, samples.length - 1); i >= 0; i--) {
    if (samples[i].isKey) return i;
  }
  return 0;
}

/**
 * The frames to take for "one every N seconds", as indexes into `order`.
 *
 * Two things it deliberately does: it takes the frame *at or before* each mark,
 * so the times asked for are the times you get rather than the times rounded up
 * to the next frame; and it never returns the same frame twice, which is what
 * an interval shorter than a frame would otherwise produce - a hundred copies
 * of one picture, each with a different name.
 *
 * @param {number} limit  a ceiling on how many come back, so a two-hour clip
 *   asked for a frame every tenth of a second refuses rather than tries.
 */
export function seriesFrames(order, { every, from = 0, to = Infinity, limit = 500 }) {
  if (!order.length || !(every > 0)) return [];

  // A floor of a millisecond, which is shorter than a frame of any video that
  // exists. Without it the `limit` above is not actually a bound on the work:
  // duplicates are dropped rather than counted, so an interval far below one
  // frame walks the whole clip a step at a time and never reaches the ceiling
  // that was supposed to stop it. The input on the page says min="0.1", and
  // that is a validity hint rather than a clamp - the value is still whatever
  // was typed.
  const step = Math.max(every, 0.001);

  const end = Math.min(to, order[order.length - 1].time);
  const picked = [];
  let last = -1;

  for (let at = Math.max(from, order[0].time); at <= end + 1e-9; at += step) {
    const index = frameNear(order, at);
    if (index !== last) {
      picked.push(index);
      last = index;
    }
    if (picked.length >= limit) break;
  }

  return picked;
}

/**
 * How many decoded frames it is reasonable to hold on to.
 *
 * Stepping forward a frame at a time is the common way to use this tool, and
 * re-decoding from the keyframe for every step makes it feel broken. So a run
 * decodes a little past the frame that was asked for and keeps what it saw. The
 * budget is in pixels rather than frames because "sixteen frames" is 130 MB at
 * 1080p and half a gigabyte at 4K, and the second one is not a cache, it is a
 * crash.
 */
export function lookaheadFor(width, height, budgetBytes = 96 << 20) {
  const perFrame = Math.max(1, width * height * 4);
  return Math.max(2, Math.min(16, Math.floor(budgetBytes / perFrame)));
}

class AbortedError extends Error {
  constructor(message = 'Cancelled.') {
    super(message);
    this.name = 'AbortError';
  }
}

function throwIfAborted(signal) {
  if (signal?.aborted) throw new AbortedError();
}

/**
 * One decoder, kept open, that hands back the frame you asked for.
 *
 * Requests are serialised: a decoder is a single pipeline, and two runs
 * overlapping would interleave their samples into nonsense. The page can
 * therefore ask for a frame on every slider move without coordinating anything
 * - the newest request simply waits for the one in front of it.
 */
export class FrameReader {
  /**
   * @param {File} file
   * @param {object} video  the video track demux() returned
   */
  constructor(file, video) {
    this.file = file;
    this.video = video;
    this.order = displayOrder(video);
    // The way back: which watched-in position each stored frame holds. Built
    // once, because the alternative is searching the list inside the decode
    // loop, and that is quadratic on a clip with fifty thousand frames in it.
    this.displayOf = new Int32Array(video.samples.length);
    this.order.forEach((frame, index) => { this.displayOf[frame.decode] = index; });
    this.window = new FileWindow(file, 4 << 20);
    this.lookahead = lookaheadFor(video.codedWidth, video.codedHeight);
    /** @type {Map<number, ImageBitmap>} */
    this.cache = new Map();
    this.maxCached = this.lookahead + 4;
    this.decoder = null;
    this.chain = Promise.resolve();
    this.failure = null;
    /** What the run in flight is for, or null between runs. */
    this.pending = null;
  }

  get count() {
    return this.order.length;
  }

  /** The time each frame is shown at, in seconds. */
  timeOf(index) {
    const frame = this.order[Math.max(0, Math.min(index, this.order.length - 1))];
    return frame ? frame.time : 0;
  }

  /**
   * The frame at display index `index`, as an ImageBitmap in the file's own
   * coordinates - not yet turned. Drawing it upright is draw.js's job, and is
   * done at both the sizes it is wanted at.
   *
   * @returns {Promise<ImageBitmap>}
   */
  frameAt(index) {
    const wanted = Math.max(0, Math.min(index, this.order.length - 1));
    const hit = this.cache.get(wanted);
    if (hit) return Promise.resolve(hit);

    // Queued rather than run: see the note on the class.
    this.chain = this.chain.then(
      () => this.#run(wanted),
      () => this.#run(wanted),
    );
    return this.chain;
  }

  /** Configure a decoder, or hand back the one already open. */
  #open() {
    if (this.decoder && this.decoder.state === 'configured') return this.decoder;

    const config = {
      codec: this.video.codec,
      codedWidth: this.video.codedWidth,
      codedHeight: this.video.codedHeight,
    };
    // VP9 carries everything it needs in the bitstream; the others hand over
    // the configuration record the file was written with, untouched.
    if (this.video.description) config.description = this.video.description;

    const decoder = new VideoDecoder({
      output: (frame) => this.#collect(frame),
      error: (error) => { this.failure ??= error; },
    });
    decoder.configure(config);
    this.decoder = decoder;
    return decoder;
  }

  /**
   * What to do with one frame the decoder handed back.
   *
   * Anything before the frame that was asked for is a stepping stone to it and
   * is closed at once - holding those open is how a decoder ends up stalled
   * waiting for its own output buffers back. Anything from the target onwards
   * is worth keeping, so it is copied into an ImageBitmap and the frame handed
   * straight back.
   *
   * The frame that was asked for is kept whatever the budget says. Everything
   * after it is a bonus, and a full budget is a reason to skip a bonus - never
   * a reason to fail, which is what an earlier version of this did on the first
   * run after the cache filled up.
   */
  #collect(frame) {
    const pending = this.pending;
    const index = pending?.byTime.get(frame.timestamp);
    const isTarget = index !== undefined && index === pending.target;
    const room = pending && pending.copies.length <= this.lookahead;

    if (!pending || index === undefined || index < pending.target || (!isTarget && !room)) {
      frame.close();
      return;
    }

    pending.copies.push(
      createImageBitmap(frame)
        .then((bitmap) => this.#store(index, bitmap))
        .catch((error) => { this.failure ??= error; })
        .finally(() => frame.close()),
    );
  }

  #store(index, bitmap) {
    const existing = this.cache.get(index);
    if (existing) {
      existing.close();
      this.cache.delete(index);
    }
    this.cache.set(index, bitmap);

    // A Map iterates in insertion order, so the first key is the oldest.
    while (this.cache.size > this.maxCached) {
      const [oldest, value] = this.cache.entries().next().value;
      value.close();
      this.cache.delete(oldest);
    }
  }

  async #run(target) {
    const cached = this.cache.get(target);
    if (cached) return cached;

    const { samples } = this.video;
    const from = keyframeBefore(samples, this.order[target].decode);
    const to = Math.min(samples.length - 1, this.order[target].decode + this.lookahead);

    // Which frame each timestamp belongs to, so the output can be matched back
    // to a display index without assuming anything about the order it arrives
    // in. Built for the run rather than once for the file: it is a few dozen
    // entries here and one per frame there.
    const byTime = new Map();
    for (let i = from; i <= to; i++) {
      byTime.set(micros(samples[i].pts, this.video.timescale), this.displayOf[i]);
    }

    this.pending = { target, byTime, copies: [] };
    this.failure = null;

    const decoder = this.#open();

    try {
      for (let i = from; i <= to; i++) {
        if (this.failure) throw this.failure;
        const sample = samples[i];
        const bytes = await this.window.read(sample.offset, sample.size);
        decoder.decode(new EncodedVideoChunk({
          type: sample.isKey ? 'key' : 'delta',
          timestamp: micros(sample.pts, this.video.timescale),
          data: bytes,   // EncodedVideoChunk copies, so the window may move on
        }));
      }

      await decoder.flush();
      await Promise.all(this.pending.copies);
      if (this.failure) throw this.failure;

      const frame = this.cache.get(target);
      if (!frame) throw new Error('decode.noframe');
      return frame;
    } catch (error) {
      // A decoder that threw is not trustworthy afterwards, so the next request
      // gets a fresh one rather than an inherited mess.
      this.#discard();
      throw error;
    } finally {
      this.pending = null;
    }
  }

  #discard() {
    if (this.decoder && this.decoder.state !== 'closed') {
      try {
        this.decoder.close();
      } catch {
        // Already gone; nothing to do.
      }
    }
    this.decoder = null;
  }

  release() {
    this.#discard();
    for (const bitmap of this.cache.values()) bitmap.close();
    this.cache.clear();
  }
}

/**
 * Decode a whole list of frames in one forward walk.
 *
 * This is what "every N seconds" uses, and it is why that is fast rather than
 * being a hundred seeks. Frames are handed over as full-size canvases, in the
 * order they were asked for, and the caller does what it likes with each one
 * before the next is decoded.
 *
 * @param {object} args
 * @param {File} args.file
 * @param {object} args.video  the video track demux() returned
 * @param {number[]} args.indexes  display indexes, ascending
 * @param {(index: number, canvas: HTMLCanvasElement) => Promise<void>} args.onFrame
 */
export async function decodeSeries({ file, video, indexes, onFrame, onProgress, signal }) {
  if (!indexes.length) return;

  const order = displayOrder(video);
  const wanted = new Map();   // timestamp -> display index
  for (const index of indexes) {
    wanted.set(micros(order[index].pts, video.timescale), index);
  }

  const first = Math.min(...indexes.map((index) => order[index].decode));
  const last = Math.max(...indexes.map((index) => order[index].decode));
  const from = keyframeBefore(video.samples, first);

  const ready = [];   // frames drawn and waiting to be handed over
  let failure = null;
  let done = 0;

  const decoder = new VideoDecoder({
    output: (frame) => {
      try {
        const index = wanted.get(frame.timestamp);
        if (index === undefined) return;
        // Drawn here, synchronously, because the frame has to be closed before
        // the decoder needs its buffer back - and a canvas is what the encoder
        // downstream wants anyway.
        const canvas = document.createElement('canvas');
        canvas.width = video.displayWidth;
        canvas.height = video.displayHeight;
        drawUpright(canvas.getContext('2d', { alpha: false }), frame, {
          rotation: video.rotation,
          displayWidth: video.displayWidth,
          displayHeight: video.displayHeight,
        });
        ready.push({ index, canvas });
      } catch (error) {
        failure ??= error;
      } finally {
        frame.close();
      }
    },
    error: (error) => { failure ??= error; },
  });

  const config = {
    codec: video.codec,
    codedWidth: video.codedWidth,
    codedHeight: video.codedHeight,
  };
  if (video.description) config.description = video.description;
  decoder.configure(config);

  const window = new FileWindow(file, 4 << 20);

  const drain = async () => {
    while (ready.length) {
      const next = ready.shift();
      await onFrame(next.index, next.canvas);
      done++;
      onProgress?.({ done, total: indexes.length });
    }
  };

  try {
    for (let i = from; i <= last; i++) {
      throwIfAborted(signal);
      if (failure) throw failure;

      const sample = video.samples[i];
      const bytes = await window.read(sample.offset, sample.size);
      decoder.decode(new EncodedVideoChunk({
        type: sample.isKey ? 'key' : 'delta',
        timestamp: micros(sample.pts, video.timescale),
        data: bytes,
      }));

      await drain();
    }

    await decoder.flush();
    if (failure) throw failure;
    await drain();
  } finally {
    if (decoder.state !== 'closed') decoder.close();
  }
}
