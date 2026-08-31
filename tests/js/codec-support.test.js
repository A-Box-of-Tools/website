/**
 * shared/js/codec-support.js - a question about the browser, with a deadline.
 *
 * The test that matters here is the third one. A promise that never settles is
 * not a hypothetical: it is what `VideoEncoder.isConfigSupported` returns on
 * the WebKit build this site's QA suite runs against, and awaiting it is what
 * made Create video a button that could be pressed once and then never
 * answered again, on all five tools that encode.
 *
 * It is also the one behaviour no browser will demonstrate on demand, so it is
 * tested with a promise that simply never resolves - which is exactly what the
 * code has to survive, and can be written down in one line here.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { askSupported } from '../../shared/js/codec-support.js';

/** A stand-in for VideoEncoder and friends, answering however the test says. */
const codec = (answer) => ({ isConfigSupported: () => answer });

test('a yes is true', async () => {
  assert.equal(await askSupported(codec(Promise.resolve({ supported: true })), {}), true);
});

test('a no is false', async () => {
  assert.equal(await askSupported(codec(Promise.resolve({ supported: false })), {}), false);
});

test('silence is null, and does not take the page with it', async () => {
  const started = Date.now();
  const answer = await askSupported(codec(new Promise(() => {})), {}, 40);

  // null rather than false, because a caller walking nine codec strings has
  // to be able to stop at the first silence instead of waiting nine times.
  assert.equal(answer, null);
  assert.ok(Date.now() - started < 2000, 'the deadline did not fire');
});

test('a rejection is a plain no, not silence', async () => {
  // The browser did answer - by refusing to parse the codec string - so the
  // next candidate is worth trying.
  const answer = await askSupported(codec(Promise.reject(new TypeError('bad codec'))), {});
  assert.equal(answer, false);
});

test('a class that throws rather than rejecting is a no as well', async () => {
  const answer = await askSupported({
    isConfigSupported() { throw new TypeError('nope'); },
  }, {});
  assert.equal(answer, false);
});

test('a browser without the class at all is a no', async () => {
  assert.equal(await askSupported(undefined, {}), false);
  assert.equal(await askSupported({}, {}), false);
});

test('an answer without a supported field is a no', async () => {
  assert.equal(await askSupported(codec(Promise.resolve({})), {}), false);
  assert.equal(await askSupported(codec(Promise.resolve(null)), {}), false);
});
