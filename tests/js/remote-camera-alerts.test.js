import test from 'node:test';
import assert from 'node:assert/strict';
import { alertCapabilities, ViewerAlerts } from '../../tools/remote-camera/src/alerts.js';

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
async function flush() { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); }

class Track extends EventTarget {
  constructor(kind) { super(); this.kind = kind; this.readyState = 'live'; this.muted = false; this.stopped = 0; }
  stop() { this.stopped += 1; this.readyState = 'ended'; }
}
class Stream extends EventTarget {
  constructor(audio = true) { super(); this.tracks = [new Track('video'), ...(audio ? [new Track('audio')] : [])]; }
  getTracks() { return this.tracks.slice(); }
  getVideoTracks() { return this.tracks.filter((track) => track.kind === 'video'); }
  getAudioTracks() { return this.tracks.filter((track) => track.kind === 'audio'); }
  add(track) { this.tracks.push(track); this.dispatchEvent(Object.assign(new Event('addtrack'), { track })); }
}

function fixture({ audio = true } = {}) {
  const state = { frame: 20, amplitude: 0 }, order = [], statuses = [], contexts = [];
  const document = new EventTarget();
  document.visibilityState = 'visible';
  document.createElement = () => ({ getContext: () => ({
    drawImage() {}, getImageData() {
      const data = new Uint8ClampedArray(32 * 24 * 4);
      for (let i = 0; i < data.length; i += 4) { data[i] = data[i + 1] = data[i + 2] = state.frame; data[i + 3] = 255; }
      return { data };
    },
  }) });
  const window = { isSecureContext: true, location: { href: 'https://abox.tools/remote-camera/' }, document,
    Notification: { permission: 'granted', requestPermission() { order.push('permission'); return Promise.resolve(this.permission); } } };
  class AudioContext {
    state = 'suspended'; closed = 0; connections = []; destination = {}; sources = [];
    constructor() { contexts.push(this); }
    resume() { order.push('resume'); this.state = 'running'; return Promise.resolve(); }
    close() { this.closed += 1; this.state = 'closed'; return Promise.resolve(); }
    createMediaStreamSource(stream) {
      const source = { stream, disconnected: 0, connect: (target) => this.connections.push(target), disconnect() { this.disconnected += 1; } };
      this.sources.push(source); return source;
    }
    createAnalyser() {
      return { fftSize: 512, getFloatTimeDomainData: (values) => values.fill(state.amplitude), disconnect() {} };
    }
  }
  window.AudioContext = AudioContext;
  window.MediaStream = class { constructor(tracks) { this.tracks = tracks; } getTracks() { return this.tracks; } };
  const registration = { scope: window.location.href, active: { state: 'activated' }, calls: [], notifications: [],
    showNotification(title, options) {
      this.calls.push({ title, options });
      this.notifications.push({ tag: options.tag, closed: 0, close() { this.closed += 1; } });
      return Promise.resolve();
    },
    getNotifications() { return Promise.resolve(this.notifications); },
  };
  window.navigator = { serviceWorker: { getRegistration: async () => registration } };
  Object.defineProperty(window.navigator.serviceWorker, 'ready', { get() { assert.fail('Never wait for serviceWorker.ready'); } });
  const video = { readyState: 2, videoWidth: 640, videoHeight: 480, paused: false, ended: false, currentTime: 0 };
  let time = 0, sequence = 0;
  const timers = new Map();
  const options = { video, registration, window, onStatus: (key) => statuses.push(key), title: 'Localized title',
    motionBody: 'Localized motion', soundBody: 'Localized sound', now: () => time,
    setTimer(callback) { timers.set(++sequence, callback); return sequence; }, clearTimer(id) { timers.delete(id); } };
  const alerts = new ViewerAlerts(options), stream = new Stream(audio);
  alerts.attach(stream);
  function tick(frame = state.frame, gap = 250) {
    state.frame = frame; time += gap; video.currentTime += gap / 1000;
    const pending = [...timers.values()]; timers.clear(); pending.forEach((callback) => callback());
  }
  function warmMotion() { tick(20); tick(20); tick(20); }
  function movement() { tick(100); tick(20); tick(100); }
  return { state, order, statuses, contexts, window, document, registration, video, alerts, stream,
    options, timers, tick, warmMotion, movement };
}

test('capabilities require a secure context and an active exact tool scope without waiting for ready', async () => {
  const f = fixture();
  const capabilities = await alertCapabilities({ window: f.window });
  assert.deepEqual(capabilities, { supported: true, motion: true, sound: true, registration: f.registration });
  f.registration.scope = 'https://abox.tools/';
  assert.equal((await alertCapabilities({ window: f.window })).supported, false);
  f.registration.scope = f.window.location.href; f.registration.active.state = 'activating';
  assert.equal((await alertCapabilities({ window: f.window })).supported, false);
  f.registration.active.state = 'activated'; f.window.isSecureContext = false;
  assert.equal((await alertCapabilities({ window: f.window })).supported, false);
  f.alerts.disconnect();
});

test('sound capability is absent without Web Audio while motion remains available', async () => {
  const f = fixture(); delete f.window.AudioContext;
  const capabilities = await alertCapabilities({ window: f.window });
  assert.equal(capabilities.supported, true); assert.equal(capabilities.motion, true); assert.equal(capabilities.sound, false);
  f.alerts.disconnect();
});

test('permission and audio resume begin in the gesture and a late permission cannot revive disconnection', async () => {
  const f = fixture(), permission = deferred(), resume = deferred();
  f.window.Notification.permission = 'default';
  f.window.Notification.requestPermission = () => { f.order.push('permission'); return permission.promise; };
  f.window.AudioContext.prototype.resume = function () { f.order.push('resume'); return resume.promise; };
  const enabled = f.alerts.enable({ motion: true, sound: true });
  assert.deepEqual(f.order, ['permission', 'resume']);
  f.alerts.disconnect();
  assert.equal(f.contexts[0].closed, 1);
  f.window.Notification.permission = 'granted'; permission.resolve('granted'); resume.resolve();
  assert.equal(await enabled, false);
  assert.deepEqual(f.alerts.choices, { motion: false, sound: false });
  assert.equal(f.timers.size, 0); assert.equal(f.statuses.includes('alerts.enabled'), false);
  assert.equal(f.stream.getTracks().every((track) => track.stopped === 0), true);
});

test('denied notifications leave incoming media and viewing untouched', async () => {
  const f = fixture(); f.window.Notification.permission = 'denied';
  assert.equal(await f.alerts.enable({ motion: true }), false);
  assert.equal(f.statuses.at(-1), 'alerts.denied');
  assert.deepEqual(f.alerts.choices, { motion: false, sound: false });
  assert.equal(f.stream.getTracks().every((track) => track.readyState === 'live'), true);
  assert.equal(f.timers.size, 0); assert.equal(f.registration.calls.length, 0);
  f.alerts.disconnect();
});

test('a queued stale sample cannot erase cleanup of a newer alert timer', async () => {
  const f = fixture(); await f.alerts.enable({ motion: true });
  const stale = [...f.timers.values()][0];
  f.alerts.disable(); await f.alerts.enable({ motion: true });
  stale(); assert.equal(f.timers.size, 1);
  f.alerts.disable(); assert.equal(f.timers.size, 0);
  f.alerts.disconnect();
});

test('motion ignores a transient frame and alerts on sustained movement with hysteresis', async () => {
  const f = fixture(); await f.alerts.enable({ motion: true }); f.warmMotion();
  f.tick(100); f.tick(100); f.tick(100);
  assert.equal(f.registration.calls.length, 0);
  f.tick(20); f.tick(100); f.tick(20);
  await flush();
  assert.equal(f.registration.calls.length, 1);
  assert.equal(f.registration.calls[0].title, 'Localized title');
  assert.equal(f.registration.calls[0].options.body, 'Localized motion');
  assert.equal(f.registration.calls[0].options.renotify, false);
  for (let i = 0; i < 60; i++) f.tick(i % 2 ? 20 : 100);
  assert.equal(f.registration.calls.length, 1);
  assert.equal(f.statuses.includes('alerts.motion'), true);
  f.alerts.disconnect();
});

test('separate motion bursts share a ten-second cooldown and disable clears sampling', async () => {
  const f = fixture(); await f.alerts.enable({ motion: true }); f.warmMotion(); f.movement();
  f.tick(100); f.tick(100); f.tick(100);
  f.tick(20); f.tick(100); f.tick(20);
  assert.equal(f.registration.calls.length, 1);
  f.tick(20, 11000); f.tick(20); f.tick(20); f.movement();
  assert.equal(f.registration.calls.length, 2);
  f.alerts.disable(); await flush();
  assert.equal(f.timers.size, 0);
  assert.equal(f.registration.notifications.every((notification) => notification.closed > 0), true);
  assert.deepEqual(f.alerts.choices, { motion: false, sound: false });
  f.alerts.disconnect();
});

test('resume absorbs the new motion baseline and waits for sustained sound after warmup', async () => {
  const f = fixture(); await f.alerts.enable({ motion: true, sound: true }); f.warmMotion();
  f.state.amplitude = 0.2; f.tick(200, 5000);
  assert.equal(f.registration.calls.length, 0);
  f.tick(200); assert.equal(f.registration.calls.length, 0);
  f.tick(200); f.tick(200); f.tick(200);
  assert.equal(f.registration.calls.length, 1);
  assert.equal(f.registration.calls[0].options.body, 'Localized sound');
  f.alerts.disconnect();
});

test('enabling during steady audible sound reports it once after warmup until quiet rearms detection', async () => {
  const f = fixture(); f.state.amplitude = 0.2;
  await f.alerts.enable({ sound: true });
  f.tick(); f.tick(); assert.equal(f.registration.calls.length, 0);
  f.tick(); f.tick(); f.tick(); assert.equal(f.registration.calls.length, 1);
  for (let i = 0; i < 60; i++) f.tick();
  assert.equal(f.registration.calls.length, 1);
  f.state.amplitude = 0; f.tick(); f.tick(); f.tick();
  f.state.amplitude = 0.2; f.tick(); f.tick(); f.tick();
  assert.equal(f.registration.calls.length, 2);
  f.alerts.disconnect();
});

test('received sound uses RMS without a speaker connection and does not repeat during sustained noise', async () => {
  const f = fixture(); await f.alerts.enable({ sound: true });
  f.tick(); f.tick(); f.state.amplitude = 0.1; f.tick(); f.tick(); f.tick();
  await flush();
  assert.equal(f.registration.calls.length, 1);
  assert.equal(f.registration.calls[0].options.body, 'Localized sound');
  const context = f.contexts[0];
  assert.equal(context.connections.length, 1);
  assert.notEqual(context.connections[0], context.destination);
  assert.deepEqual(context.sources[0].stream.getTracks(), f.stream.getAudioTracks());
  for (let i = 0; i < 60; i++) f.tick();
  assert.equal(f.registration.calls.length, 1);
  f.alerts.disable();
  assert.equal(context.closed, 1); assert.equal(context.sources[0].disconnected, 1);
  assert.equal(f.stream.getTracks().every((track) => track.stopped === 0), true);
  f.alerts.disconnect();
});

test('audio added to an attached stream preserves choices and the gesture-activated context', async () => {
  const f = fixture({ audio: false });
  await f.alerts.enable({ motion: true, sound: true });
  assert.equal(f.statuses.at(-1), 'alerts.no-audio');
  f.stream.add(new Track('audio')); f.alerts.attach(f.stream);
  assert.deepEqual(f.alerts.choices, { motion: true, sound: true });
  assert.equal(f.contexts.length, 1); assert.equal(f.contexts[0].sources.length, 1);
  assert.equal(f.order.filter((value) => value === 'resume').length, 1);
  f.tick(); f.tick(); f.state.amplitude = 0.1; f.tick(); f.tick(); f.tick();
  assert.equal(f.registration.calls.length, 1);
  f.alerts.disconnect();
});

test('cleanup closes only this alert cycle even if the browser returns other notifications', async () => {
  const f = fixture(), other = { tag: 'another-tool', closed: 0, close() { this.closed += 1; } };
  f.registration.notifications.push(other);
  await f.alerts.enable({ motion: true }); f.warmMotion(); f.movement();
  await flush();
  f.alerts.disable(); await flush();
  assert.equal(other.closed, 0); assert.equal(f.registration.notifications[1].closed, 1);
  f.alerts.disconnect();
});

test('a notification completed after disconnect is closed without changing a newer alert cycle', async () => {
  const f = fixture(), displayed = deferred();
  const ordinaryShow = f.registration.showNotification;
  let oldNotification;
  f.registration.showNotification = function (title, options) {
    this.calls.push({ title, options });
    oldNotification = { tag: options.tag, closed: 0, close() { this.closed += 1; } };
    return displayed.promise.then(() => this.notifications.push(oldNotification));
  };
  await f.alerts.enable({ motion: true }); f.warmMotion(); f.movement();
  f.alerts.disconnect(); await flush();
  f.registration.showNotification = ordinaryShow;
  f.alerts.attach(f.stream); await f.alerts.enable({ motion: true }); f.warmMotion(); f.movement();
  await flush();
  const currentNotification = f.registration.notifications[0], statuses = f.statuses.length;
  assert.notEqual(currentNotification.tag, oldNotification.tag);
  displayed.resolve(); await flush();
  assert.equal(oldNotification.closed, 1); assert.equal(currentNotification.closed, 0);
  assert.equal(f.statuses.length, statuses); assert.equal(f.timers.size, 1);
  f.alerts.disconnect();
});
