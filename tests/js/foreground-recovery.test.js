import test from 'node:test';
import assert from 'node:assert/strict';
import { observeForeground } from '../../shared/js/foreground-recovery.js';

class Surface {
  listeners = new Map();
  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(listener);
  }
  removeEventListener(type, listener) { this.listeners.get(type)?.delete(listener); }
  emit(type, fields = {}) {
    const event = { type, ...fields };
    for (const listener of [...(this.listeners.get(type) ?? [])]) listener(event);
    return event;
  }
}

function fixture() {
  const document = new Surface(), window = new Surface(), queued = [], calls = [];
  document.visibilityState = 'visible'; document.hidden = false;
  const dispose = observeForeground({
    document, window, queue: callback => queued.push(callback),
    foreground: event => calls.push(['foreground', event]),
    hidden: event => calls.push(['hidden', event]),
    suspend: event => calls.push(['suspend', event]),
    restore: event => calls.push(['restore', event]),
    blur: event => calls.push(['blur', event]),
  });
  return {
    document, window, queued, calls, dispose,
    visible(value) {
      document.visibilityState = value ? 'visible' : 'hidden';
      document.hidden = !value;
      return document.emit('visibilitychange');
    },
    flush() { while (queued.length) queued.shift()(); },
  };
}

test('registration grants no foreground action and a burst of wake events coalesces', () => {
  const f = fixture();
  f.flush(); assert.deepEqual(f.calls, []);
  const shown = f.visible(true);
  f.window.emit('online'); f.window.emit('online');
  assert.equal(f.queued.length, 1);
  f.flush();
  assert.deepEqual(f.calls, [['foreground', shown]]);
  f.dispose();
});

test('hiding runs synchronously and invalidates queued work without stealing a later wake', () => {
  const f = fixture();
  f.visible(true);
  const hidden = f.visible(false);
  assert.deepEqual(f.calls, [['hidden', hidden]]);
  const shown = f.visible(true);
  assert.equal(f.queued.length, 2);
  f.flush();
  assert.deepEqual(f.calls, [['hidden', hidden], ['foreground', shown]]);
  f.dispose();
});

test('queued foreground work rechecks visibility and does not rely on a delivered hide event', () => {
  const f = fixture();
  f.window.emit('online');
  f.document.hidden = true;
  f.flush();
  assert.deepEqual(f.calls, []);
  f.document.hidden = false; f.document.visibilityState = 'hidden';
  f.window.emit('online'); f.flush();
  assert.deepEqual(f.calls, []);
  f.dispose();
});

test('page suspension is synchronous and only pageshow restores foreground eligibility', () => {
  const f = fixture();
  f.visible(true);
  const hidden = f.window.emit('pagehide', { persisted: true });
  assert.deepEqual(f.calls, [['suspend', hidden]]);
  f.window.emit('online'); f.visible(true); f.flush();
  assert.deepEqual(f.calls, [['suspend', hidden]]);
  const shown = f.window.emit('pageshow', { persisted: true });
  assert.deepEqual(f.calls, [['suspend', hidden], ['restore', shown]]);
  f.window.emit('online'); f.flush();
  assert.deepEqual(f.calls, [['suspend', hidden], ['restore', shown], ['foreground', shown]]);
  f.dispose();
});

test('pageshow restores synchronously while a still-hidden page cannot run foreground work', () => {
  const f = fixture();
  f.visible(false);
  const shown = f.window.emit('pageshow', { persisted: false });
  assert.equal(f.calls.at(-1)[0], 'restore');
  assert.equal(f.calls.at(-1)[1], shown);
  f.flush();
  assert.deepEqual(f.calls.map(([name]) => name), ['hidden', 'restore']);
  f.visible(true); f.flush();
  assert.equal(f.calls.at(-1)[0], 'foreground');
  f.dispose();
});

test('blur remains immediate and does not turn queued foreground work into a new session', () => {
  const f = fixture();
  f.window.emit('online');
  const event = f.window.emit('blur');
  assert.deepEqual(f.calls, [['blur', event]]);
  f.flush();
  assert.deepEqual(f.calls.map(([name]) => name), ['blur', 'foreground']);
  f.dispose();
});

test('disposing removes all listeners and fences queued or already captured callbacks', () => {
  const f = fixture();
  f.window.emit('online');
  const callbacks = [...f.document.listeners.values(), ...f.window.listeners.values()]
    .flatMap(listeners => [...listeners]);
  f.dispose(); f.dispose();
  f.flush();
  for (const callback of callbacks) callback({ type: 'late' });
  f.visible(false); f.window.emit('pageshow'); f.window.emit('blur');
  assert.deepEqual(f.calls, []);
  assert.ok([...f.document.listeners.values(), ...f.window.listeners.values()]
    .every(listeners => listeners.size === 0));
});

test('foreground work can dispose itself without leaving another listener wake', () => {
  const document = new Surface(), window = new Surface(), queued = [];
  let calls = 0, dispose;
  dispose = observeForeground({
    document, window, queue: callback => queued.push(callback),
    foreground() { calls += 1; dispose(); },
  });
  window.emit('online'); queued.shift()();
  window.emit('online');
  assert.equal(calls, 1); assert.deepEqual(queued, []);
});
