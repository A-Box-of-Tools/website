/** Suspension may retry a consented session; an explicit end must stay ended. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { foregroundRecovery } from '../../tools/share-text/src/foreground-recovery.js';

function fixture() {
  let shown = true;
  let next = 0;
  const pending = new Map();
  const callbacks = [];
  const attempts = [];
  let exhausted = 0;
  const recovery = foregroundRecovery(() => attempts.push('same-session'), {
    visible: () => shown,
    later(fn) { const id = ++next; pending.set(id, fn); callbacks.push(fn); return id; },
    cancel(id) { pending.delete(id); },
    exhausted() { exhausted += 1; },
  });
  return { recovery, attempts, callbacks, pending,
    show(value) { shown = value; recovery.foreground(); },
    tick() { const entry = pending.entries().next().value; if (entry) { pending.delete(entry[0]); entry[1](); } },
    get exhausted() { return exhausted; },
  };
}

test('opening or focusing a reader without consent never starts a transport retry', () => {
  const f = fixture();
  f.recovery.pause(); f.recovery.foreground(); f.tick();
  assert.deepEqual(f.attempts, []);
  assert.equal(f.pending.size, 0);
});

test('a healthy connection is left intact when hidden and shown again', () => {
  const f = fixture();
  f.recovery.start(); f.recovery.ready();
  f.show(false); f.show(true); f.tick();
  assert.deepEqual(f.attempts, []);
  assert.equal(f.recovery.active, true);
});

test('a lost session waits for the foreground before its retained-session retry', () => {
  const f = fixture();
  f.recovery.start(); f.show(false); f.recovery.pause(); f.tick();
  assert.deepEqual(f.attempts, []);
  f.show(true); f.tick();
  assert.deepEqual(f.attempts, ['same-session']);
});

test('an explicit end fences queued callbacks even after a new session starts', () => {
  const f = fixture();
  f.recovery.start(); f.recovery.pause();
  const stale = f.callbacks.at(-1);
  f.recovery.stop(); f.show(true); stale();
  assert.deepEqual(f.attempts, []);
  f.recovery.start(); stale();
  assert.deepEqual(f.attempts, []);
});

test('an unavailable or retired share cannot create an endless foreground retry loop', () => {
  const f = fixture();
  f.recovery.start();
  for (let n = 0; n < 4; n += 1) { f.recovery.pause(); f.tick(); }
  assert.equal(f.attempts.length, 3);
  assert.equal(f.exhausted, 1);
  assert.equal(f.recovery.active, false);
  f.show(false); f.show(true); f.recovery.pause(); f.tick();
  assert.equal(f.attempts.length, 3);
});
