import test from 'node:test';
import assert from 'node:assert/strict';
import { CameraCapture } from '../../tools/remote-camera/src/capture.js';

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function stream() {
  const tracks = Array.from({ length: 2 }, () => ({ readyState: 'live', stopped: 0, stop() { this.readyState = 'ended'; this.stopped += 1; } }));
  return {
    tracks, getTracks: () => tracks, getAudioTracks: () => tracks.filter((track) => track.kind === 'audio'),
    addTrack(track) { if (!tracks.includes(track)) tracks.push(track); },
  };
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
test('capture requests a microphone only when the owner explicitly opts in', async () => {
  let received;
  const capture = new CameraCapture({ getUserMedia: async (constraints) => { received = constraints; return stream(); } });
  await capture.start({ video: { width: { ideal: 1280 } }, audio: true });
  assert.deepEqual(received, { video: { width: { ideal: 1280 } }, audio: true });
  capture.stop();
});

test('audio alone keeps the browser camera default and truthy non-booleans do not enable a microphone', async () => {
  const calls = [];
  const capture = new CameraCapture({ getUserMedia: async (constraints) => { calls.push(constraints); return stream(); } });
  await capture.start({ audio: true });
  await capture.start({ audio: 'true' });
  assert.deepEqual(calls, [{ video: true, audio: true }, { video: true, audio: false }]);
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
function audioVideoStream(deviceId) {
  const result = videoStream(deviceId);
  result.tracks[1].kind = 'audio';
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

test('camera switching keeps the same microphone without requesting audio again', async () => {
  const previous = audioVideoStream('previous'), chosen = videoStream('chosen'), microphone = previous.getAudioTracks()[0];
  const { capture, calls } = queuedCapture(previous, chosen);
  await capture.start({ audio: true });
  const adopted = await capture.switchDevice('chosen', (candidate) => {
    assert.deepEqual(candidate.getAudioTracks(), [microphone]);
    assert.equal(microphone.readyState, 'live');
    return true;
  });
  assert.equal(adopted, chosen); assert.equal(capture.stream, chosen);
  assert.equal(previous.tracks[0].readyState, 'ended'); assert.equal(microphone.stopped, 0);
  assert.deepEqual(calls, [{ video: true, audio: true }, { video: { deviceId: { exact: 'chosen' } }, audio: false }]);
  capture.stop(); capture.stop();
  assert.equal(microphone.stopped, 1); assertStopped(chosen, 1);
});

test('rejected camera installation leaves its shared microphone on the original camera', async () => {
  const previous = audioVideoStream('previous'), candidate = videoStream('chosen'), microphone = previous.getAudioTracks()[0];
  const { capture } = queuedCapture(previous, candidate);
  await capture.start({ audio: true });
  await assert.rejects(capture.switchDevice('chosen', () => { throw captureFailure('InvalidStateError'); }), { name: 'InvalidStateError' });
  assert.equal(capture.stream, previous); assertStopped(previous, 0);
  assert.equal(candidate.tracks[0].readyState, 'ended'); assert.equal(microphone.stopped, 0);
  capture.stop(); assert.equal(microphone.stopped, 1);
});

test('exclusive camera fallback and restoration preserve the same live microphone', async () => {
  const previous = audioVideoStream('previous'), restored = videoStream('previous'), microphone = previous.getAudioTracks()[0];
  const failure = captureFailure('NotFoundError');
  const { capture, calls } = queuedCapture(previous, captureFailure('NotReadableError'), () => {
    assert.equal(previous.tracks[0].readyState, 'ended'); assert.equal(microphone.stopped, 0);
    throw failure;
  }, restored);
  await capture.start({ audio: true });
  await assert.rejects(capture.switchDevice('chosen', (candidate) => {
    assert.deepEqual(candidate.getAudioTracks(), [microphone]); return true;
  }), (error) => error === failure);
  assert.equal(capture.stream, restored); assert.equal(microphone.readyState, 'live');
  assert.ok(calls.slice(1).every((constraints) => constraints.audio === false));
  capture.stop(); assert.equal(microphone.stopped, 1); assertStopped(restored, 1);
});

test('an exclusive camera retry commits with the original microphone still live', async () => {
  const previous = audioVideoStream('previous'), chosen = videoStream('chosen'), microphone = previous.getAudioTracks()[0];
  const { capture } = queuedCapture(previous, captureFailure('AbortError'), () => {
    assert.equal(previous.tracks[0].readyState, 'ended'); assert.equal(microphone.stopped, 0);
    return chosen;
  });
  await capture.start({ audio: true });
  assert.equal(await capture.switchDevice('chosen', () => true), chosen);
  assert.deepEqual(chosen.getAudioTracks(), [microphone]); assert.equal(microphone.readyState, 'live');
  capture.stop(); assert.equal(microphone.stopped, 1); assertStopped(chosen, 1);
});

test('Stop during an exclusive camera retry closes its held microphone and every late camera', async () => {
  const previous = audioVideoStream('previous'), late = videoStream('chosen'), microphone = previous.getAudioTracks()[0], pending = deferred(), entered = deferred();
  const { capture } = queuedCapture(previous, captureFailure('NotReadableError'), () => { entered.resolve(); return pending.promise; });
  await capture.start({ audio: true });
  const changing = capture.switchDevice('chosen', () => assert.fail('late camera cannot be installed'));
  await entered.promise; assert.equal(capture.stream, null);
  capture.stop(); pending.resolve(late);
  assert.equal(await changing, null); assertStopped(late, 1); assert.equal(microphone.stopped, 1);
  assert.equal(capture.active, false);
});

test('a failed camera restoration releases the microphone when no video remains', async () => {
  const previous = audioVideoStream('previous'), restored = videoStream('previous'), microphone = previous.getAudioTracks()[0];
  const failure = captureFailure('NotFoundError');
  const { capture } = queuedCapture(previous, captureFailure('AbortError'), failure, restored);
  await capture.start({ audio: true });
  await assert.rejects(capture.switchDevice('chosen', () => { throw captureFailure('InvalidStateError'); }), (error) => error === failure);
  assert.equal(capture.stream, null); assert.equal(microphone.stopped, 1); assertStopped(restored, 1);
  capture.stop(); assert.equal(microphone.stopped, 1);
});

test('Stop while audio permission is pending closes both late media tracks', async () => {
  const pending = deferred(), late = audioVideoStream('late');
  const { capture } = queuedCapture(pending.promise);
  const starting = capture.start({ audio: true }); capture.stop(); pending.resolve(late);
  assert.equal(await starting, null); assertStopped(late, 1); assert.equal(capture.active, false);
});

test('Stop during camera installation closes a shared microphone only once', async () => {
  const previous = audioVideoStream('previous'), candidate = videoStream('chosen'), installation = deferred(), entered = deferred();
  const microphone = previous.getAudioTracks()[0], { capture } = queuedCapture(previous, candidate);
  await capture.start({ audio: true });
  const changing = capture.switchDevice('chosen', () => { entered.resolve(); return installation.promise; });
  await entered.promise; capture.stop(); installation.resolve(true);
  assert.equal(await changing, null); assert.equal(microphone.stopped, 1);
  assertStopped(previous, 1); assertStopped(candidate, 1);
});

function audioOnlyStream() {
  const result = audioVideoStream('unused');
  result.tracks.shift();
  result.getVideoTracks = () => result.tracks.filter((track) => track.kind === 'video');
  result.getAudioTracks()[0].enabled = true;
  return result;
}

test('ended microphone recovery preserves healthy video and adopts replacement audio silently', async () => {
  const previous = audioVideoStream('camera'), candidate = audioOnlyStream();
  const video = previous.getVideoTracks()[0], oldAudio = previous.getAudioTracks()[0], audio = candidate.getAudioTracks()[0];
  const entered = deferred(), installation = deferred();
  const { capture, calls } = queuedCapture(previous, candidate);
  await capture.start({ audio: true });
  oldAudio.stop();
  const recovering = capture.switchDevice('camera', (stream) => {
    assert.deepEqual(stream.getVideoTracks(), [video]);
    assert.deepEqual(stream.getAudioTracks(), [audio]);
    assert.equal(audio.enabled, false);
    entered.resolve();
    return installation.promise;
  }, { audio: true });
  await entered.promise;
  assert.equal(capture.stream, previous);
  assert.equal(video.stopped, 0);
  installation.resolve(true);
  assert.equal(await recovering, candidate);
  assert.equal(capture.stream, candidate);
  assert.deepEqual(calls, [{ video: true, audio: true }, { video: false, audio: true }]);
  assert.equal(video.stopped, 0);
  assert.equal(audio.enabled, false);
  capture.stop();
  assert.equal(video.stopped, 1); assert.equal(audio.stopped, 1); assert.equal(oldAudio.stopped, 1);
});

test('microphone recovery failure never releases the healthy camera for an exclusive retry', async () => {
  const previous = audioVideoStream('camera'), failure = captureFailure('NotReadableError');
  const { capture, calls } = queuedCapture(previous, failure);
  await capture.start({ audio: true });
  previous.getAudioTracks()[0].stop();
  await assert.rejects(capture.switchDevice('camera', () => assert.fail('no replacement'), { audio: true }), (error) => error === failure);
  assert.equal(capture.stream, previous);
  assert.equal(previous.getVideoTracks()[0].stopped, 0);
  assert.equal(calls.length, 2);
  capture.stop();
});

test('rejected microphone adoption closes only new audio and leaves the original video running', async () => {
  const previous = audioVideoStream('camera'), candidate = audioOnlyStream(), audio = candidate.getAudioTracks()[0];
  const { capture } = queuedCapture(previous, candidate);
  await capture.start({ audio: true });
  previous.getAudioTracks()[0].stop();
  assert.equal(await capture.switchDevice('camera', () => false, { audio: true }), null);
  assert.equal(capture.stream, previous);
  assert.equal(previous.getVideoTracks()[0].stopped, 0);
  assert.equal(audio.stopped, 1);
  capture.stop();
});

test('ended camera and microphone are replaced together without reviving audio transmission', async () => {
  const previous = audioVideoStream('camera'), candidate = audioVideoStream('camera');
  const { capture, calls } = queuedCapture(previous, candidate);
  await capture.start({ audio: true });
  previous.getTracks().forEach((track) => track.stop());
  assert.equal(await capture.switchDevice('camera', (stream) => {
    assert.equal(stream.getAudioTracks()[0].enabled, false);
    return true;
  }, { audio: true }), candidate);
  assert.deepEqual(calls.at(-1), { video: { deviceId: { exact: 'camera' } }, audio: true });
  assertStopped(candidate, 0);
  capture.stop();
});

test('recovery keeps a live microphone even when audio was requested for an ended camera', async () => {
  const previous = audioVideoStream('camera'), candidate = videoStream('camera'), audio = previous.getAudioTracks()[0];
  audio.enabled = true;
  const { capture, calls } = queuedCapture(previous, candidate);
  await capture.start({ audio: true });
  previous.getVideoTracks()[0].stop();
  assert.equal(await capture.switchDevice('camera', () => true, { audio: true }), candidate);
  assert.equal(calls.at(-1).audio, false);
  assert.deepEqual(candidate.getAudioTracks(), [audio]);
  assert.equal(audio.enabled, true);
  assert.equal(audio.stopped, 0);
  capture.stop();
});

test('unusable recovered microphone grants are released without interrupting live video', async () => {
  for (const unavailable of ['missing', 'muted', 'ended']) {
    const previous = audioVideoStream('camera'), candidate = audioOnlyStream();
    const audio = candidate.getAudioTracks()[0];
    if (unavailable === 'missing') candidate.tracks.length = 0;
    else if (unavailable === 'muted') audio.muted = true;
    else audio.stop();
    const { capture } = queuedCapture(previous, candidate);
    await capture.start({ audio: true });
    previous.getAudioTracks()[0].stop();
    await assert.rejects(capture.switchDevice('camera', () => assert.fail('unusable microphone'), { audio: true }), { message: 'camera.audio-ended' });
    assert.equal(capture.stream, previous);
    assert.equal(previous.getVideoTracks()[0].stopped, 0);
    if (unavailable !== 'missing') assert.equal(audio.stopped, 1);
    capture.stop();
  }
});

test('a late microphone recovery cannot revive Stop or replace a newer camera', async () => {
  const previous = audioVideoStream('camera'), newer = videoStream('new-camera'), late = audioOnlyStream(), pending = deferred();
  const { capture } = queuedCapture(previous, pending.promise, newer);
  await capture.start({ audio: true });
  previous.getAudioTracks()[0].stop();
  const recovering = capture.switchDevice('camera', () => assert.fail('obsolete microphone'), { audio: true });
  capture.stop();
  await capture.start();
  pending.resolve(late);
  assert.equal(await recovering, null);
  assertStopped(late, 1);
  assert.equal(capture.stream, newer);
  assertStopped(newer, 0);
  capture.stop();
});

test('Stop during microphone adoption releases new audio and retained video once', async () => {
  const previous = audioVideoStream('camera'), candidate = audioOnlyStream(), entered = deferred(), installation = deferred();
  const { capture } = queuedCapture(previous, candidate);
  await capture.start({ audio: true });
  previous.getAudioTracks()[0].stop();
  const recovering = capture.switchDevice('camera', () => { entered.resolve(); return installation.promise; }, { audio: true });
  await entered.promise;
  capture.stop();
  installation.resolve(true);
  assert.equal(await recovering, null);
  assert.equal(capture.stream, null);
  assertStopped(previous, 1); assertStopped(candidate, 1);
});
