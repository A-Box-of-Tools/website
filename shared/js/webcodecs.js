/**
 * The arithmetic around a VideoDecoder and a VideoEncoder that every tool
 * driving one had written for itself.
 *
 * GENERATED INTO EACH TOOL. This file lives at shared/js/webcodecs.js and the
 * build copies it to <tool>/src/shared/webcodecs.js for the tools that ask
 * for it with `js_parts = ["webcodecs", ...]`. It imports nothing.
 *
 * Four of these are pure functions over a track that mp4-reader's demux()
 * found - the decoder's configuration, the average frame rate, a time on the
 * file's clock in WebCodecs' microseconds - and were byte-identical wherever
 * they appeared. The fifth, `settle`, is the wait that keeps a feed loop from
 * running ahead of the codecs, and it existed in four shapes: a decoder and an
 * encoder watched together, an encoder alone, a decoder alone, and the
 * reverser's version that gives up after thirty seconds without progress.
 * One function takes the codecs as a list and the stall ceiling as an option.
 */

/**
 * Frames in flight before a feed loop waits for the pipeline to catch up.
 *
 * A decoder or encoder holds the frames it has been given until it has dealt
 * with them, and each is a full picture. Eight is enough to keep either busy
 * and small enough that the frames waiting are not what fills the memory.
 */
export const QUEUE_LIMIT = 8;

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

/**
 * Frames per second, averaged over the whole track.
 *
 * Clamped to what a real clip can be: a track whose duration is missing or
 * nonsense would otherwise ask an encoder for thousands of frames a second.
 */
export function averageFps(video) {
  const seconds = video.duration / video.timescale;
  if (!seconds) return 30;
  return Math.min(240, Math.max(1, video.samples.length / seconds));
}

/** Presentation time in microseconds, which is what WebCodecs counts in. */
export function micros(ticks, timescale) {
  return Math.round(ticks / timescale * 1_000_000);
}

/** How much a codec is holding, whichever kind it is. */
const queued = (codec) => codec.decodeQueueSize ?? codec.encodeQueueSize ?? 0;

/**
 * Wait until every codec given has drained below the queue limit.
 *
 * A stalled codec does not reliably report anything: it stops draining and the
 * `dequeue` event this waits on simply never comes again. A caller that names
 * `stallAfter` gets an error whose message is `stallKey` once the queues have
 * gone that long without ever getting shorter, which is far longer than a
 * queue of eight frames takes anywhere that is really working, software 4K
 * included; the page can then say so instead of sitting at "Preparing..."
 * forever, which is the one failure a visitor cannot tell from slow progress.
 *
 * @param {(VideoDecoder|VideoEncoder)[]} codecs
 * @param {object} [options]
 * @param {number} [options.limit]  frames in flight allowed before waiting
 * @param {number} [options.stallAfter]  milliseconds without progress before
 *   giving up; leave it out to wait indefinitely
 * @param {string} [options.stallKey]  the phrase key the error then carries
 */
export async function settle(codecs, { limit = QUEUE_LIMIT, stallAfter = 0, stallKey = 'stall.both' } = {}) {
  let bestSeen = Infinity;
  let progressAt = Date.now();

  while (codecs.some((codec) => queued(codec) > limit)) {
    if (stallAfter) {
      const size = codecs.reduce((total, codec) => total + queued(codec), 0);
      if (size < bestSeen) {
        bestSeen = size;
        progressAt = Date.now();
      } else if (Date.now() - progressAt > stallAfter) {
        throw new Error(stallKey);
      }
    }

    await new Promise((resolve) => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        for (const codec of codecs) codec.removeEventListener('dequeue', done);
        resolve();
      };
      // `dequeue` is not in every implementation yet, so cap the wait.
      const timer = setTimeout(done, 20);
      for (const codec of codecs) codec.addEventListener('dequeue', done);
    });
  }
}
