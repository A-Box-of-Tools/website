/**
 * The far end of both paths: canvas in, MP4 out.
 *
 * Whichever way the instants were read - the file opened directly, or the
 * browser's own player seeked to each one - they arrive here as a canvas that
 * already holds the right picture at the right size. What is left is the same
 * either way, so it is written once: encode the canvas, hand the chunk to the
 * muxer, and give the frame a timestamp on the *output* clock rather than the
 * one it came from.
 *
 * That last part is the whole trick of a time-lapse. Nothing is dropped, sped
 * up or resampled at this end; the frames were simply taken two seconds apart
 * and are written a thirtieth of a second apart, and the sixty-times speed-up
 * is that and nothing else.
 */

import { Mp4Muxer } from './shared/mp4-muxer.js';

/** Frames in flight before the caller is asked to wait. */
const QUEUE_LIMIT = 8;

/**
 * Seconds of *output* between keyframes, so the finished clip scrubs.
 *
 * Two, as everywhere else here. It is a short clip by definition, so this
 * costs a handful of frames and buys a scrub bar that works.
 */
const KEYFRAME_SECONDS = 2;

export class TimelapseWriter {
  #encoder = null;
  #muxer;
  #failure = null;
  #written = 0;
  #index = 0;

  /**
   * @param {object} options
   * @param {number} options.width  even, as H.264 requires
   * @param {number} options.height
   * @param {number} options.fps  the rate the finished clip plays at
   * @param {number} options.bitrate
   * @param {string} options.codec  an avc1 string this browser has agreed to
   */
  constructor({ width, height, fps, bitrate, codec }) {
    this.width = width;
    this.height = height;
    this.fps = fps;
    this.bitrate = bitrate;
    this.codec = codec;
    this.#muxer = new Mp4Muxer({ width, height });
  }

  /** How many chunks the encoder has actually produced so far. */
  get written() {
    return this.#written;
  }

  /** True while the encoder is far enough behind to be worth waiting for. */
  get busy() {
    return (this.#encoder?.encodeQueueSize ?? 0) > QUEUE_LIMIT;
  }

  open() {
    this.#encoder = new VideoEncoder({
      output: (chunk, metadata) => {
        try {
          if (metadata?.decoderConfig?.description) {
            this.#muxer.setDecoderConfig(metadata.decoderConfig.description);
          }
          const data = new Uint8Array(chunk.byteLength);
          chunk.copyTo(data);
          this.#muxer.addSample(data, chunk.type === 'key', 1 / this.fps);
          this.#written += 1;
        } catch (error) {
          this.#failure ??= error;
        }
      },
      error: (error) => { this.#failure ??= error; },
    });

    this.#encoder.configure({
      codec: this.codec,
      width: this.width,
      height: this.height,
      bitrate: this.bitrate,
      framerate: this.fps,
      // Length-prefixed NALUs and an avcC record, which is what MP4 wants.
      avc: { format: 'avc' },
      alpha: 'discard',
      latencyMode: 'quality',
    });
  }

  /**
   * Encode whatever is on the canvas as the next frame of the output.
   *
   * Synchronous on purpose: it is called from inside a VideoDecoder's output
   * callback, where there is nothing to await on. Back pressure is the caller's
   * job through `busy` and `settle`.
   */
  write(canvas) {
    if (this.#failure) throw this.#failure;

    const period = 1 / this.fps;
    const timestamp = Math.round(this.#index * period * 1_000_000);
    // The first frame and one every couple of seconds after it. Asking for the
    // key by output time rather than by count keeps this right at any rate.
    const keyFrame = this.#index === 0
      || Math.floor(this.#index * period / KEYFRAME_SECONDS)
        > Math.floor((this.#index - 1) * period / KEYFRAME_SECONDS);

    const frame = new VideoFrame(canvas, {
      timestamp,
      duration: Math.round(period * 1_000_000),
    });
    try {
      this.#encoder.encode(frame, { keyFrame });
    } finally {
      frame.close();
    }

    this.#index += 1;
  }

  /** Wait for the encoder to hand something back, with a cap in case it does not. */
  settle() {
    const encoder = this.#encoder;
    return new Promise((resolve) => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        encoder.removeEventListener('dequeue', done);
        resolve();
      };
      // `dequeue` is not in every implementation yet, so cap the wait.
      const timer = setTimeout(done, 20);
      encoder.addEventListener('dequeue', done);
    });
  }

  /** @returns {Promise<{blob: Blob, frames: number}>} */
  async finish() {
    await this.#encoder.flush();
    if (this.#failure) throw this.#failure;
    if (!this.#written) throw new Error('encode.nothing');
    return { blob: this.#muxer.finalize(), frames: this.#written };
  }

  close() {
    if (this.#encoder && this.#encoder.state !== 'closed') this.#encoder.close();
  }
}
