/**
 * What the browser makes of a file it is asked to open: a video's size and
 * length through a <video>, a picture's size through an <img>.
 *
 * GENERATED INTO EACH TOOL. This file lives at shared/js/media.js and the
 * build copies it to <tool>/src/shared/media.js for the tools that ask for it
 * with `js_parts = ["media", ...]`. It imports nothing.
 *
 * Six video tools carried openInPlayer and three image tools carried
 * measureImage, each identical to the others, until the tests could follow a
 * `./shared/` import (tests/js/resolve-shared.mjs).
 *
 * Both resolve rather than reject, with `ok: false` or null for a file the
 * browser would not open: the callers ask this question to decide which path
 * to take - the exact one that reads the file itself, or the fallback that
 * leaves the reading to the browser - and "no" is an answer, not a failure.
 */

/**
 * Hand `url` to a <video> and wait for it to say what it found.
 *
 * Fifteen seconds is the cap because a browser that cannot open a file does
 * not always say so: a container it half understands can sit in `loading`
 * indefinitely, and a page that waited on it would never get to the message.
 *
 * @param {HTMLVideoElement} video
 * @param {string} url  an object URL for the file
 * @returns {Promise<{ok: boolean, width: number, height: number, duration: number}>}
 */
export function openInPlayer(video, url) {
  return new Promise((resolve) => {
    const done = (result) => {
      clearTimeout(timer);
      video.removeEventListener('loadedmetadata', ok);
      video.removeEventListener('error', bad);
      resolve(result);
    };
    const ok = () => done({
      ok: video.videoWidth > 0 && video.videoHeight > 0,
      width: video.videoWidth,
      height: video.videoHeight,
      duration: Number.isFinite(video.duration) ? video.duration : 0,
    });
    const bad = () => done({ ok: false, width: 0, height: 0, duration: 0 });

    const timer = setTimeout(bad, 15000);
    video.addEventListener('loadedmetadata', ok, { once: true });
    video.addEventListener('error', bad, { once: true });
    video.src = url;
    video.load();
  });
}

/**
 * The pixel size of the picture at `url`, or null if the browser will not
 * decode it.
 *
 * @param {string} url
 * @returns {Promise<{width: number, height: number}|null>}
 */
export function measureImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = url;
  });
}
