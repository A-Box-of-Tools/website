/**
 * shared/js/errors.js - a cancellation the page ignores, a key the page looks up.
 *
 * The contract every page relies on is the name: `error.name === 'AbortError'`
 * is the one test for "the visitor pressed Cancel", so the name is what is
 * pinned here, and so is the promise that a signal nobody aborted throws
 * nothing at all.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { AbortedError, throwIfAborted, said } from '../../shared/js/errors.js';

test('a cancellation is an AbortError, like the platform\'s own', () => {
  const error = new AbortedError();
  assert.equal(error.name, 'AbortError');
  assert.ok(error instanceof Error);
  assert.equal(new DOMException('', 'AbortError').name, error.name);
});

test('throwIfAborted throws only once the signal has fired', () => {
  const controller = new AbortController();
  assert.doesNotThrow(() => throwIfAborted(controller.signal));
  assert.doesNotThrow(() => throwIfAborted(undefined), 'a job run with no signal');
  controller.abort();
  assert.throws(() => throwIfAborted(controller.signal), { name: 'AbortError' });
});

test('said carries the key as the message and the values beside it', () => {
  const error = said('stall.decoder', { seconds: 30 });
  assert.ok(error instanceof Error);
  assert.equal(error.message, 'stall.decoder');
  assert.deepEqual(error.values, { seconds: 30 });
  assert.deepEqual(said('read.short').values, {});
});
