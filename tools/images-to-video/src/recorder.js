/**
 * Fallback export path: play the slideshow onto a canvas and capture it with
 * MediaRecorder. Works in browsers without WebCodecs.
 *
 * Two costs worth knowing about: it runs in real time (a two-minute slideshow
 * takes two minutes to export) and the frame timing is approximate, because
 * capture is driven by the display refresh rather than an exact frame clock.
 */

import { drawFrame } from './compose.js';
import { decodeFull } from './images.js';
import { pickWebmMimeType } from './support.js';
import { recordingTimeline, recordingIndex } from './recording-timeline.js';

/**
 * @param {{items: object[], settings: object, onProgress?: Function, signal?: AbortSignal}} args
 * @returns {Promise<{blob: Blob, extension: string, codec: string}>}
 */
export async function recordToWebm({ items, settings, onProgress, signal }) {
  const { width, height, fps, fit, background, quality } = settings;

  const mimeType = pickWebmMimeType();
  if (!mimeType) throw new Error('record.nothing');

  const bitsPerPixel = { low: 0.03, medium: 0.07, high: 0.15 }[quality] ?? 0.07;
  const videoBitsPerSecond = Math.min(50_000_000, Math.round(width * height * fps * bitsPerPixel));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false });

  // Paint the first frame before capture starts so the stream never opens on a blank canvas.
  const bitmaps = new Map();
  const decoding = new Map();
  const failed = new Set();
  let wantedIndex = 0;
  let disposed = false;

  const prefetch = (index) => {
    if (disposed || index >= items.length || bitmaps.has(index) || decoding.has(index)
      || failed.has(index) || decoding.size >= 2) return;
    const promise = decodeFull(items[index])
      .then((bitmap) => {
        // The clock can pass an image while its decode is pending. It no
        // longer belongs in the queue, even if export has already returned.
        if (disposed || index < wantedIndex) bitmap.close();
        else bitmaps.set(index, bitmap);
      })
      .catch(() => { failed.add(index); })
      .finally(() => {
        decoding.delete(index);
        prefetch(wantedIndex);
        prefetch(wantedIndex + 1);
      });
    decoding.set(index, promise);
  };

  prefetch(0);
  await decoding.get(0);
  if (bitmaps.has(0)) drawFrame(ctx, bitmaps.get(0), { fit, background });
  prefetch(1);

  const { boundaries, totalSeconds } = recordingTimeline(items);

  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond });
  const parts = [];
  recorder.ondataavailable = (event) => { if (event.data.size) parts.push(event.data); };

  const finished = new Promise((resolve, reject) => {
    recorder.onstop = resolve;
    recorder.onerror = (event) => reject(new Error('record.failed', { cause: event.error }));
  });

  const cleanup = () => {
    disposed = true;
    for (const bitmap of bitmaps.values()) bitmap.close();
    bitmaps.clear();
    for (const track of stream.getTracks()) track.stop();
  };

  // Canvas capture only produces frames while the page is being painted. If the
  // user switches away mid-recording the output will be short or stuttery, so
  // note it and tell them afterwards rather than failing silently.
  let wentHidden = document.hidden;
  const onVisibility = () => { if (document.hidden) wentHidden = true; };
  document.addEventListener('visibilitychange', onVisibility);

  recorder.start();
  const startedAt = performance.now();

  try {
    await new Promise((resolve, reject) => {
      let shownIndex = 0;
      let settled = false;
      const interval = 1000 / fps;

      // Background tabs throttle timers heavily, so allow generous slack — but
      // never wait forever. Without this the export could hang with no feedback.
      const deadline = startedAt + totalSeconds * 3000 + 30000;

      const settle = (fn, value) => {
        if (settled) return;
        settled = true;
        fn(value);
      };

      const tick = () => {
        if (settled) return;

        if (signal?.aborted) {
          const error = new Error('Export cancelled.');
          error.name = 'AbortError';
          settle(reject, error);
          return;
        }

        const now = performance.now();
        if (now > deadline) {
          settle(reject, new Error('record.stalled'));
          return;
        }

        const elapsed = (now - startedAt) / 1000;

        const index = recordingIndex(boundaries, elapsed);
        wantedIndex = index;
        for (const [cachedIndex, bitmap] of bitmaps) {
          if (cachedIndex < index && cachedIndex !== shownIndex) {
            bitmap.close();
            bitmaps.delete(cachedIndex);
          }
        }
        // Ask for the clock's target even when it skipped the prefetched
        // image. Waiting for an advance first would strand every later frame.
        prefetch(index);
        prefetch(index + 1);

        // Hold the current picture until the requested one is decoded rather
        // than painting a blank frame while its pixels are still arriving.
        if (index !== shownIndex && bitmaps.has(index)) {
          const previous = bitmaps.get(shownIndex);
          if (previous) {
            previous.close();
            bitmaps.delete(shownIndex);
          }
          shownIndex = index;
        }

        const bitmap = bitmaps.get(shownIndex);
        // Redraw every tick even though the image is unchanged: captureStream
        // only emits a frame when the canvas is marked dirty.
        if (bitmap) drawFrame(ctx, bitmap, { fit, background });

        onProgress?.({
          phase: 'recording',
          done: Math.min(elapsed, totalSeconds),
          total: totalSeconds,
          realtime: true,
        });

        if (elapsed >= totalSeconds) settle(resolve);
        else setTimeout(tick, interval);
      };

      // Driven by setTimeout rather than requestAnimationFrame: rAF stops
      // entirely in a hidden tab, which would leave this promise pending
      // forever. Timers keep firing (throttled), so the loop always finishes.
      setTimeout(tick, interval);
    });

    recorder.stop();
    await finished;

    const extension = mimeType.includes('webm') ? 'webm' : 'mp4';
    return {
      blob: new Blob(parts, { type: mimeType }),
      extension,
      codec: mimeType,
      // A phrase key, not a sentence: the caller reads it out.
      warning: wentHidden ? 'record.hidden' : null,
    };
  } catch (error) {
    if (recorder.state !== 'inactive') recorder.stop();
    throw error;
  } finally {
    document.removeEventListener('visibilitychange', onVisibility);
    cleanup();
  }
}
