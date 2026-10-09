import test from 'node:test';
import assert from 'node:assert/strict';
import { traceUpdates } from '../../tools/image-to-svg/src/trace-updates.js';

function build(t) {
  const jobs = [], seen = [];
  t.mock.method(globalThis, 'setTimeout', (callback, delay) => {
    const job = { callback, delay, cancelled: false };
    jobs.push(job);
    return job;
  });
  t.mock.method(globalThis, 'clearTimeout', (job) => { if (job) job.cancelled = true; });
  const updates = traceUpdates({ remask: () => seen.push('mask'), trace: () => seen.push('trace'),
    queued: () => seen.push('unavailable'), settled: () => seen.push('settled'), failed: assert.fail });
  return { updates, jobs, seen };
}

test('a slider burst retires older callbacks and settles once after 120 ms', (t) => {
  const { updates, jobs, seen } = build(t);
  for (let i = 0; i < 4; i++) updates.queue('trace');
  assert.equal(updates.pending, true);
  assert.deepEqual(jobs.map(j => j.delay), [120, 120, 120, 120]);
  for (const job of jobs.slice(0, 3)) { assert.equal(job.cancelled, true); job.callback(); }
  assert.deepEqual(seen, ['unavailable', 'unavailable', 'unavailable', 'unavailable']);
  jobs[3].callback();
  assert.deepEqual(seen.slice(-2), ['trace', 'settled']);
  assert.equal(updates.pending, false);
});

test('a later fit-only input cannot drop a pending remask and correction flush retires its timer', (t) => {
  const { updates, jobs, seen } = build(t);
  updates.queue('mask');
  updates.queue('trace');
  assert.equal(updates.flush(), true);
  assert.deepEqual(seen.slice(-2), ['mask', 'settled']);
  jobs[1].callback();
  assert.equal(seen.filter(v => v === 'mask').length, 1);
  assert.equal(updates.pending, false);
});

test('Clear or replacement retires queued work and a late cancelled callback', (t) => {
  const { updates, jobs, seen } = build(t);
  updates.queue('mask');
  updates.cancel();
  jobs[0].callback();
  assert.deepEqual(seen, ['unavailable', 'settled']);
  updates.queue('trace');
  jobs[1].callback();
  assert.deepEqual(seen.slice(-2), ['trace', 'settled']);
});
