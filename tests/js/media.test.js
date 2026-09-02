/**
 * shared/js/media.js - what the browser makes of a file it is asked to open.
 *
 * The <video> is an EventTarget with the four properties the module reads,
 * and `load()` is what decides how the browser answers - metadata, an error,
 * or nothing at all, which is the case the timeout exists for.
 */

import test, { mock } from 'node:test';
import assert from 'node:assert/strict';

import { openInPlayer, measureImage } from '../../shared/js/media.js';

/** A <video> whose load() answers as told. */
function player(answer, { width = 0, height = 0, duration = NaN } = {}) {
  const video = new EventTarget();
  Object.assign(video, { videoWidth: width, videoHeight: height, duration });
  video.load = () => {
    if (answer) queueMicrotask(() => video.dispatchEvent(new Event(answer)));
  };
  return video;
}

test('a file the browser opens comes back with its size and length', async () => {
  const video = player('loadedmetadata', { width: 640, height: 360, duration: 12.5 });
  const found = await openInPlayer(video, 'blob:1');
  assert.deepEqual(found, { ok: true, width: 640, height: 360, duration: 12.5 });
  assert.equal(video.src, 'blob:1');
});

test('metadata without a picture in it is not ok, and an unknown length is zero', async () => {
  // An audio-only file opens, reports a duration and has no frame to show.
  const video = player('loadedmetadata', { duration: Infinity });
  assert.deepEqual(await openInPlayer(video, 'blob:1'),
    { ok: false, width: 0, height: 0, duration: 0 });
});

test('a file the browser refuses is an answer, not a rejection', async () => {
  assert.deepEqual(await openInPlayer(player('error'), 'blob:1'),
    { ok: false, width: 0, height: 0, duration: 0 });
});

test('a browser that never answers is given fifteen seconds', async () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  const pending = openInPlayer(player(null), 'blob:1');
  mock.timers.tick(15000);
  assert.deepEqual(await pending, { ok: false, width: 0, height: 0, duration: 0 });
  mock.timers.reset();
});

test('a picture is measured, and one that will not decode is null', async () => {
  globalThis.Image = class {
    set src(url) {
      queueMicrotask(() => {
        if (url === 'blob:good') {
          this.naturalWidth = 4032;
          this.naturalHeight = 3024;
          this.onload();
        } else {
          this.onerror();
        }
      });
    }
  };
  assert.deepEqual(await measureImage('blob:good'), { width: 4032, height: 3024 });
  assert.equal(await measureImage('blob:bad'), null);
});
