import test from 'node:test';
import assert from 'node:assert/strict';
import { orderedLoads } from '../../shared/js/ordered-loads.js';

const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };

test('selected batches append in order, report individual failures, and stay busy until the last batch settles', async () => {
  const first = deferred(), calls = [], batches = [], statuses = [];
  const queue = orderedLoads({ read: async item => { calls.push(item); if (item === 'first') await first.promise; if (item === 'bad') throw new Error('refused'); return item; }, complete: batch => batches.push(batch), status: n => statuses.push(n) });
  const a = queue.add(['first', 'bad']), b = queue.add(['last']);
  await Promise.resolve();
  assert.deepEqual(calls, ['first']); assert.equal(queue.pending, 3);
  first.resolve(); await Promise.all([a, b]);
  assert.deepEqual(calls, ['first', 'bad', 'last']);
  assert.deepEqual(batches.map(batch => batch.items), [['first'], ['last']]);
  assert.equal(batches[0].errors[0].value, 'bad');
  assert.deepEqual(statuses, [2, 3, 1, 0]);
});

for (const outcome of ['success', 'failure']) test(`reset retires an old ${outcome} and its queued batch without blocking a new read`, async () => {
  const held = deferred(), calls = [], batches = [], statuses = [];
  const queue = orderedLoads({ read: async item => { calls.push(item); return item === 'old' ? held.promise : item; }, complete: batch => batches.push(batch), status: n => statuses.push(n) });
  const old = queue.add(['old']), abandoned = queue.add(['never']);
  await Promise.resolve(); queue.reset();
  await queue.add(['new']);
  assert.deepEqual(calls, ['old', 'new']);
  assert.deepEqual(batches.map(batch => batch.items), [['new']]);
  const lastStatus = statuses.length;
  if (outcome === 'success') held.resolve('retired'); else held.reject(new Error('retired'));
  await Promise.all([old, abandoned]);
  assert.equal(statuses.length, lastStatus); assert.equal(queue.pending, 0);
  assert.equal(batches.length, 1);
});

test('a picker list is captured before it can be cleared or changed', async () => {
  const batches = [], values = ['selected'];
  const queue = orderedLoads({ read: async value => value, complete: batch => batches.push(batch), status() {} });
  const done = queue.add(values); values[0] = 'changed'; values.push('new'); await done;
  assert.deepEqual(batches[0].items, ['selected']);
});
