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

function videoStream(deviceId) {
  const result = stream(), track = result.tracks[0];
  track.kind = 'video';
  track.getSettings = () => ({ deviceId });
  result.getVideoTracks = () => [track];
  return result;
}
function queuedCapture(...results) {
  const calls = [];
  const capture = new CameraCapture({ async getUserMedia(constraints) {
    calls.push(constraints);
    const next = results.shift();
    if (next instanceof Error) throw next;
    return typeof next === 'function' ? next(constraints) : next;
  } });
  return { capture, calls };
}
function captureFailure(name) { return Object.assign(new Error(name), { name }); }
function assertStopped(value, count) { assert.deepEqual(value.tracks.map((track) => track.stopped), value.tracks.map(() => count)); }

test('switch commits only after the new camera is installed', async () => {
  const previous = videoStream('previous'), candidate = videoStream('chosen');
  const installation = deferred(), entered = deferred();
  const { capture, calls } = queuedCapture(previous, candidate);
  await capture.start();
  const changing = capture.switchDevice('chosen', (value) => {
    assert.equal(value, candidate); entered.resolve(); return installation.promise;
  });
  await entered.promise;
  assert.equal(capture.stream, previous);
  assert.equal(capture.switching, true);
  assertStopped(previous, 0);
  installation.resolve(true);
  assert.equal(await changing, candidate);
  assert.equal(capture.stream, candidate);
  assert.equal(capture.switching, false);
  assertStopped(previous, 1); assertStopped(candidate, 0);
  assert.deepEqual(calls, [{ video: true, audio: false }, { video: { deviceId: { exact: 'chosen' } }, audio: false }]);
  capture.stop();
});

test('failed camera acquisition preserves the existing stream', async () => {
  const previous = videoStream('previous'), error = captureFailure('OverconstrainedError');
  const { capture } = queuedCapture(previous, error);
  await capture.start();
  await assert.rejects(capture.switchDevice('missing', () => assert.fail('no candidate')), (value) => value === error);
  assert.equal(capture.stream, previous); assert.equal(capture.switching, false); assertStopped(previous, 0);
  capture.stop();
});

test('a rejected camera installation stops only its candidate', async () => {
  const previous = videoStream('previous'), candidate = videoStream('chosen');
  const { capture } = queuedCapture(previous, candidate);
  await capture.start();
  assert.equal(await capture.switchDevice('chosen', () => false), null);
  assert.equal(capture.stream, previous); assertStopped(previous, 0); assertStopped(candidate, 1);
  capture.stop();
});

test('Stop closes a candidate while installation is pending', async () => {
  const previous = videoStream('previous'), candidate = videoStream('chosen');
  const installation = deferred(), entered = deferred();
  const { capture } = queuedCapture(previous, candidate);
  await capture.start();
  const changing = capture.switchDevice('chosen', () => { entered.resolve(); return installation.promise; });
  await entered.promise; capture.stop();
  assert.equal(capture.stream, null); assertStopped(previous, 1); assertStopped(candidate, 1);
  installation.resolve(true);
  assert.equal(await changing, null); assertStopped(candidate, 1);
});

test('a late old camera switch cannot replace or clear a newer switch', async () => {
  const previous = videoStream('previous'), stale = videoStream('stale');
  const restarted = videoStream('restarted'), chosen = videoStream('chosen');
  const oldAcquisition = deferred(), newAcquisition = deferred();
  const { capture } = queuedCapture(previous, oldAcquisition.promise, restarted, newAcquisition.promise);
  await capture.start();
  const oldSwitch = capture.switchDevice('stale', () => assert.fail('stale installation'));
  capture.stop(); await capture.start();
  const newSwitch = capture.switchDevice('chosen', () => true);
  oldAcquisition.resolve(stale);
  assert.equal(await oldSwitch, null); assertStopped(stale, 1);
  assert.equal(capture.stream, restarted); assert.equal(capture.switching, true);
  newAcquisition.resolve(chosen);
  assert.equal(await newSwitch, chosen); assert.equal(capture.switching, false);
  assertStopped(restarted, 1); assertStopped(chosen, 0);
  capture.stop();
});

test('exclusive camera hardware is released before one retry', async () => {
  const previous = videoStream('previous'), chosen = videoStream('chosen');
  const { capture, calls } = queuedCapture(previous, captureFailure('NotReadableError'), () => { assertStopped(previous, 1); return chosen; });
  await capture.start();
  assert.equal(await capture.switchDevice('chosen', () => true), chosen);
  assertStopped(previous, 1); assertStopped(chosen, 0);
  assert.deepEqual(calls.slice(1), Array.from({ length: 2 }, () => ({ video: { deviceId: { exact: 'chosen' } }, audio: false })));
  capture.stop();
});

test('a failed exclusive camera retry restores the old device', async () => {
  const previous = videoStream('previous'), restored = videoStream('previous'), failure = captureFailure('NotFoundError');
  const { capture, calls } = queuedCapture(previous, captureFailure('AbortError'), failure, restored);
  await capture.start();
  await assert.rejects(capture.switchDevice('chosen', () => true), (error) => error === failure);
  assert.equal(capture.stream, restored); assert.equal(capture.switching, false);
  assertStopped(previous, 1); assertStopped(restored, 0);
  assert.deepEqual(calls.at(-1), { video: { deviceId: { exact: 'previous' } }, audio: false });
  capture.stop();
});

test('failed camera restoration releases its candidate and leaves no capture', async () => {
  const previous = videoStream('previous'), restored = videoStream('previous'), failure = captureFailure('NotFoundError');
  const { capture } = queuedCapture(previous, captureFailure('NotReadableError'), failure, restored);
  await capture.start();
  await assert.rejects(capture.switchDevice('chosen', () => { throw captureFailure('InvalidStateError'); }), (error) => error === failure);
  assert.equal(capture.stream, null); assert.equal(capture.switching, false);
  assertStopped(previous, 1); assertStopped(restored, 1);
});
