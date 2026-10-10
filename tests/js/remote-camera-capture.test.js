import test from 'node:test';
import assert from 'node:assert/strict';
import { CameraCapture } from '../../tools/remote-camera/src/capture.js';

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function stream() {
  const tracks = Array.from({ length: 2 }, () => ({ stopped: 0, stop() { this.stopped += 1; } }));
  return { tracks, getTracks: () => tracks };
}

test('default capture leaves camera selection to the browser without microphone access', async () => {
  let received;
  const capture = new CameraCapture({ getUserMedia: async (constraints) => { received = constraints; return stream(); } });
  await capture.start();
  assert.deepEqual(received, { video: true, audio: false });
  capture.stop();
});
test('stopping during camera permission closes every late track', async () => {
  const pending = deferred();
  const capture = new CameraCapture({ getUserMedia: () => pending.promise });
  const request = capture.start({ video: true });
  capture.stop();
  const late = stream();
  pending.resolve(late);
  assert.equal(await request, null);
  assert.equal(capture.active, false);
  assert.deepEqual(late.tracks.map((track) => track.stopped), [1, 1]);
});
test('only the newest overlapping camera request can become active', async () => {
  const older = deferred(), newer = deferred(), requests = [older, newer];
  const capture = new CameraCapture({ getUserMedia: () => requests.shift().promise });
  const first = capture.start({ video: true }), second = capture.start({ video: true });
  const current = stream();
  newer.resolve(current);
  assert.equal(await second, current);
  const stale = stream();
  older.resolve(stale);
  assert.equal(await first, null);
  assert.equal(capture.active, true);
  assert.deepEqual(stale.tracks.map((track) => track.stopped), [1, 1]);
  assert.deepEqual(current.tracks.map((track) => track.stopped), [0, 0]);
  capture.stop(); capture.stop();
  assert.deepEqual(current.tracks.map((track) => track.stopped), [1, 1]);
});
test('replacing a running camera closes it before requesting another', async () => {
  const firstStream = stream(); let calls = 0;
  const capture = new CameraCapture({ getUserMedia: async () => {
    if (++calls === 1) return firstStream;
    assert.deepEqual(firstStream.tracks.map((track) => track.stopped), [1, 1]);
    assert.equal(capture.active, false);
    return stream();
  } });
  await capture.start({ video: true });
  await capture.start({ video: true });
  capture.stop();
});
test('capture never requests a microphone even if a caller supplies audio', async () => {
  let received;
  const capture = new CameraCapture({ getUserMedia: async (constraints) => { received = constraints; return stream(); } });
  await capture.start({ video: { width: { ideal: 1280 } }, audio: true });
  assert.deepEqual(received, { video: { width: { ideal: 1280 } }, audio: false });
  capture.stop();
});
test('current permission failure is reported while a cancelled failure is ignored', async () => {
  const pending = deferred(), denied = new Error('permission denied');
  const capture = new CameraCapture({ getUserMedia: () => pending.promise });
  const request = capture.start({ video: true });
  pending.reject(denied);
  await assert.rejects(request, (error) => error === denied);
  assert.equal(capture.active, false);
  const obsolete = deferred();
  const cancelled = new CameraCapture({ getUserMedia: () => obsolete.promise });
  const result = cancelled.start({ video: true });
  cancelled.stop(); obsolete.reject(denied);
  assert.equal(await result, null);
});
