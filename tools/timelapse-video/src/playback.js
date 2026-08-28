/**
 * The playback path: seek the browser's own player to each instant.
 *
 * The fallback, for a file the reader beside this one does not understand - a
 * WebM, an Ogg, a fragmented oddity - or a codec this browser will play but not
 * hand to WebCodecs. It accepts everything the <video> element accepts, which
 * is the point of having it.
 *
 * It is the slower of the two and by less than you would expect, which is worth
 * saying because in every other video tool here the seeking path is the one you
 * put up with. A seek costs a decode from the keyframe in front of it, and a
 * time-lapse only wants one frame every couple of seconds anyway - so the work
 * a seek repeats is work the direct path also does. What this path really gives
 * up is exactness: the browser decides which frame a seek lands on, and it is
 * usually, not always, the frame in front of the mark.
 */

import { drawScaled, frameCanvas } from './draw.js';

/** Give up on a seek that never lands rather than hanging the page. */
const SEEK_TIMEOUT = 10_000;

class AbortedError extends Error {
  constructor() {
    super('Cancelled.');
    this.name = 'AbortError';
  }
}

/** An error whose message is a phrase key; the caller resolves it. */
const said = (key, values = {}) => Object.assign(new Error(key), { values });

/**
 * What the four MediaError codes mean, in words somebody can act on.
 *
 * Phrase keys rather than words: this file is copied byte for byte into
 * fifteen languages, and the caller resolves what it picks.
 */
const MEDIA_ERRORS = {
  1: 'media.aborted',
  2: 'media.notread',
  3: 'media.nodecode',
  4: 'media.unsupported',
};

/**
 * The element gave up. Say how far it got, because on a long clip that is the
 * difference between "this file is not supported" and "it died two thirds of
 * the way through", and the two have different answers.
 */
function playerDied(video, done, total) {
  // The reason is a phrase inside a phrase; main.js resolves the inner one
  // on the way in - see `fill` there.
  return said('play.died', {
    done,
    total,
    why: { key: MEDIA_ERRORS[video.error?.code] ?? 'media.stopped', values: {} },
  });
}

/**
 * @param {object} args
 * @param {HTMLVideoElement} args.video  already loaded with the file
 * @param {number[]} args.times  the instants to take, in seconds
 * @param {number} args.width  the output frame, even
 * @param {number} args.height
 * @param {import('./encode.js').TimelapseWriter} args.writer
 * @returns {Promise<{blob: Blob, frames: number}>}
 */
export async function timelapseByPlaying({
  video, times, width, height, writer, onProgress, signal,
}) {
  const { canvas, ctx } = frameCanvas(width, height);

  video.pause();

  try {
    for (let i = 0; i < times.length; i += 1) {
      if (signal?.aborted) throw new AbortedError();

      // A media element's error is sticky, and it can be set between two seeks
      // rather than during one - where no listener of ours is attached to hear
      // it. Without this check a dead element is seeked to the end of the list
      // anyway, each seek waiting out its own timeout, and the failure is
      // reported minutes later from wherever it happened to be noticed.
      if (video.error) throw playerDied(video, i, times.length);

      try {
        await seek(video, times[i]);
      } catch (error) {
        if (error?.name === 'PlayerError') throw playerDied(video, i, times.length);
        throw error;
      }
      drawScaled(ctx, video, {
        // The element has already applied whatever rotation the file asks for,
        // so there is nothing left here to turn.
        displayWidth: video.videoWidth,
        displayHeight: video.videoHeight,
        width,
        height,
      });

      writer.write(canvas);
      while (writer.busy) await writer.settle();

      onProgress?.({ phase: 'working', done: i + 1, total: times.length });
    }

    onProgress?.({ phase: 'finishing', done: times.length, total: times.length });
    return await writer.finish();
  } finally {
    canvas.width = 0;
  }
}

/**
 * Seek, and wait for the new frame to actually be on screen.
 *
 * Waiting is the whole difficulty. `seeked` fires when the element's clock has
 * moved, which is not the same as the new frame having been painted, and a copy
 * taken a moment early is the previous frame - which in a time-lapse shows up
 * as a stutter rather than as an obvious error.
 * requestVideoFrameCallback is the one API that says "a frame is now on
 * screen", so it is used where it exists, with a short wait after `seeked`
 * everywhere else.
 */
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
      if (typeof video.requestVideoFrameCallback === 'function') {
        video.requestVideoFrameCallback(() => finish());
        setTimeout(finish, 120);
      } else {
        setTimeout(finish, 40);
      }
    };

    // Named rather than described: only the caller knows how far through the
    // list this happened, and that is half of what the message has to say.
    const onError = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      video.removeEventListener('seeked', onSeeked);
      const failure = new Error('play.seekfailed');
      failure.name = 'PlayerError';
      reject(failure);
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
