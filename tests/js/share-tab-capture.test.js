import test from 'node:test';
import assert from 'node:assert/strict';
import { TabCapture } from '../../tools/share-tab/src/capture.js';

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

class Track extends EventTarget {
  constructor(kind = 'video', surface = 'browser') {
    super();
    this.kind = kind;
    this.surface = surface;
    this.readyState = 'live';
    this.stopped = 0;
  }
  getSettings() { return { displaySurface: this.surface }; }
  stop() {
    this.readyState = 'ended';
    this.stopped += 1;
    this.dispatchEvent(new Event('ended'));
  }
  end() {
    this.readyState = 'ended';
    this.dispatchEvent(new Event('ended'));
  }
}

function stream(...tracks) {
  return {
    getTracks: () => [...tracks],
    getVideoTracks: () => tracks.filter((track) => track.kind === 'video'),
    getAudioTracks: () => tracks.filter((track) => track.kind === 'audio'),
    removeTrack(track) { tracks = tracks.filter((value) => value !== track); },
  };
}

function rejected(name) { return Object.assign(new Error(name), { name }); }

test('the click reaches the browser chooser synchronously with video-only tab hints', async () => {
  const pending = deferred(), video = new Track();
  let received;
  const devices = { getDisplayMedia(options) {
    assert.equal(this, devices);
    received = options;
    return pending.promise;
  } };
  const capture = new TabCapture({ devices });
  const starting = capture.start();
  assert.deepEqual(received, {
    video: { displaySurface: 'browser' }, audio: false,
    selfBrowserSurface: 'exclude', monitorTypeSurfaces: 'exclude', surfaceSwitching: 'exclude',
  });
  const selected = stream(video);
  pending.resolve(selected);
  assert.equal(await starting, selected);
  assert.equal(capture.stream, selected);
  capture.stop();
});

test('window, monitor and unidentified captures close every track before rejection', async () => {
  for (const surface of ['window', 'monitor', '', null, undefined]) {
    const video = new Track(), audio = new Track('audio');
    video.surface = surface;
    const capture = new TabCapture({ devices: { getDisplayMedia: async () => stream(video, audio) } });
    await assert.rejects(capture.start(), { code: 'capture.tab-only' });
    assert.equal(capture.stream, null);
    assert.equal(video.stopped, 1);
    assert.equal(audio.stopped, 1);
  }
});

test('a capture without exactly one identified video track cannot be shared', async () => {
  const missing = new Track(); missing.getSettings = undefined;
  for (const tracks of [[], [new Track('audio')], [missing], [new Track(), new Track()]]) {
    const capture = new TabCapture({ devices: { getDisplayMedia: async () => stream(...tracks) } });
    await assert.rejects(capture.start(), { code: 'capture.tab-only' });
    assert.ok(tracks.every((track) => track.stopped === 1));
    assert.equal(capture.stream, null);
  }
});

test('unexpected audio is stopped and removed from the published stream', async () => {
  const video = new Track(), audio = new Track('audio'), selected = stream(video, audio);
  const capture = new TabCapture({ devices: { getDisplayMedia: async () => selected } });
  assert.equal(await capture.start(), selected);
  assert.deepEqual(selected.getTracks(), [video]);
  assert.equal(audio.stopped, 1);
  assert.equal(video.stopped, 0);
  capture.stop(); capture.stop();
  assert.equal(audio.stopped, 1);
  assert.equal(video.stopped, 1);
});

test('stopping during permission retires the request and releases its late stream', async () => {
  const pending = deferred(), video = new Track(), audio = new Track('audio');
  const capture = new TabCapture({ devices: { getDisplayMedia: () => pending.promise } });
  const starting = capture.start();
  capture.stop(); capture.stop();
  pending.resolve(stream(video, audio));
  await assert.rejects(starting, { code: 'capture.cancelled' });
  assert.equal(capture.stream, null);
  assert.equal(video.stopped, 1);
  assert.equal(audio.stopped, 1);
});

test('an older permission result cannot replace or close a newer shared tab', async () => {
  const older = deferred(), newer = deferred(), pending = [older, newer];
  const capture = new TabCapture({ devices: { getDisplayMedia: () => pending.shift().promise } });
  const first = capture.start(), second = capture.start();
  const currentVideo = new Track(), current = stream(currentVideo);
  newer.resolve(current);
  assert.equal(await second, current);
  const oldVideo = new Track();
  older.resolve(stream(oldVideo));
  await assert.rejects(first, { code: 'capture.cancelled' });
  assert.equal(capture.stream, current);
  assert.equal(currentVideo.stopped, 0);
  assert.equal(oldVideo.stopped, 1);
  capture.stop();
});

test('a retired permission refusal cannot report failure or stop the current stream', async () => {
  const old = deferred(), currentVideo = new Track(), current = stream(currentVideo);
  let calls = 0;
  const capture = new TabCapture({ devices: { getDisplayMedia: () => ++calls === 1 ? old.promise : Promise.resolve(current) } });
  const first = capture.start();
  await capture.start();
  old.reject(rejected('NotAllowedError'));
  await assert.rejects(first, { code: 'capture.cancelled' });
  assert.equal(capture.stream, current);
  assert.equal(currentVideo.stopped, 0);
  capture.stop();
});

test('browser Stop sharing clears capture and reports the end once', async () => {
  const video = new Track();
  let ended = 0;
  const capture = new TabCapture({
    devices: { getDisplayMedia: async () => stream(video) },
    onEnded() { assert.equal(capture.stream, null); ended += 1; },
  });
  await capture.start();
  video.end(); video.end(); capture.stop();
  assert.equal(ended, 1);
  assert.equal(video.stopped, 1);
  assert.equal(capture.stream, null);
});

test('explicit Stop detaches the ended listener and is idempotent', async () => {
  const video = new Track();
  let ended = 0;
  const capture = new TabCapture({ devices: { getDisplayMedia: async () => stream(video) }, onEnded: () => { ended += 1; } });
  await capture.start();
  capture.stop(); capture.stop(); video.end();
  assert.equal(video.stopped, 1);
  assert.equal(ended, 0);
  assert.equal(capture.stream, null);
});

test('an explicit replacement releases the old tab before reopening the chooser', async () => {
  const previous = new Track(), replacement = new Track();
  let calls = 0;
  const capture = new TabCapture({ devices: { getDisplayMedia() {
    if (++calls === 1) return Promise.resolve(stream(previous));
    assert.equal(previous.stopped, 1);
    assert.equal(capture.stream, null);
    return Promise.resolve(stream(replacement));
  } } });
  await capture.start();
  await capture.start();
  capture.stop();
  assert.equal(previous.stopped, 1);
  assert.equal(replacement.stopped, 1);
});

test('an already ended selection is released without reporting an active session', async () => {
  const video = new Track(); video.readyState = 'ended';
  let ended = 0;
  const capture = new TabCapture({ devices: { getDisplayMedia: async () => stream(video) }, onEnded: () => { ended += 1; } });
  await assert.rejects(capture.start(), { code: 'capture.cancelled' });
  assert.equal(capture.stream, null);
  assert.equal(video.stopped, 1);
  assert.equal(ended, 0);
});

test('unsupported capture, permission refusals and browser failures have phrase keys', async () => {
  await assert.rejects(new TabCapture({ devices: {} }).start(), { code: 'capture.unsupported' });
  for (const [name, code] of [
    ['NotAllowedError', 'capture.denied'], ['PermissionDeniedError', 'capture.denied'],
    ['SecurityError', 'capture.denied'], ['AbortError', 'capture.cancelled'],
    ['NotReadableError', 'capture.failed'], ['InvalidStateError', 'capture.failed'],
  ]) {
    const cause = rejected(name);
    const capture = new TabCapture({ devices: { getDisplayMedia() { throw cause; } } });
    await assert.rejects(capture.start(), (error) => error.code === code && error.cause === cause);
    assert.equal(capture.stream, null);
  }
});
