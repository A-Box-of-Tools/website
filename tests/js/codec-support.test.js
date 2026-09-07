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
 *
 * The cases below the first group are about where the question is asked. That
 * build does not leave the promise pending, it blocks the thread that asked,
 * so the deadline above can only be kept by moving the question to a worker -
 * and a worker brings its own ways to fail. Every one of them has to end with
 * the page still able to say something.
 */

import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { askSupported, forgetTheBrowser } from '../../shared/js/codec-support.js';

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

/*
 * Where the question is asked.
 *
 * A real class rather than a double from here on: the module hands the worker
 * a name, not an object, so it only takes that route for something it can find
 * on globalThis under one of the names the worker knows.
 */

/**
 * A page with a Worker of a given temperament and a VideoEncoder to ask about.
 *
 * `starts` is whether the worker ever announces itself, `answers` what it
 * replies to a question (undefined for a worker that never replies at all),
 * and `onThisThread` what the class itself would say if the page asked it
 * directly - which is how each case below proves which of the two answered.
 */
function pageWith({ starts = true, answers = undefined, onThisThread } = {}) {
  const workers = [];

  class FakeWorker {
    constructor(url, options) {
      this.url = String(url);
      this.options = options;
      this.heard = [];
      this.stopped = false;
      this.listeners = { message: [], error: [] };
      workers.push(this);
      if (starts) queueMicrotask(() => this.say({ ready: true }));
    }

    addEventListener(kind, fn) { this.listeners[kind].push(fn); }
    say(data) { this.listeners.message.forEach((fn) => fn({ data })); }
    terminate() { this.stopped = true; }

    postMessage(message) {
      this.heard.push(message);
      if (answers === undefined) return;
      queueMicrotask(() => this.say({ id: message.id, ...answers }));
    }
  }

  globalThis.Worker = FakeWorker;
  globalThis.VideoEncoder = { isConfigSupported: () => onThisThread };
  return workers;
}

afterEach(() => {
  delete globalThis.Worker;
  delete globalThis.VideoEncoder;
  forgetTheBrowser();
});

test('the question goes to the worker, not to this thread', async () => {
  // The class on this thread never answers, so a true here can only have come
  // from the worker.
  const workers = pageWith({
    answers: { supported: true },
    onThisThread: new Promise(() => {}),
  });

  assert.equal(await askSupported(VideoEncoder, { codec: 'avc1.640028' }, 40), true);
  assert.equal(workers.length, 1);
  assert.equal(workers[0].options.type, 'module');
  assert.match(workers[0].url, /codec-probe\.js$/);
  assert.deepEqual(workers[0].heard[0].name, 'VideoEncoder');
});

test('a worker that goes quiet is silence, and is not left running', async () => {
  const workers = pageWith({ onThisThread: new Promise(() => {}) });

  assert.equal(await askSupported(VideoEncoder, {}, 40), null);
  // Terminated rather than abandoned: it is holding a question that will
  // never come back, and the next one would queue behind it for ever.
  assert.equal(workers[0].stopped, true);
});

test('a browser that has wedged once is not asked a second time', async () => {
  const workers = pageWith({ onThisThread: new Promise(() => {}) });

  assert.equal(await askSupported(VideoEncoder, {}, 40), null);
  const started = Date.now();
  assert.equal(await askSupported(VideoEncoder, {}, 40), null);

  // Nine candidate codec strings would otherwise cost nine deadlines and nine
  // workers to learn what the first one established about the browser.
  assert.equal(workers.length, 1);
  assert.ok(Date.now() - started < 30, 'the second question paid the deadline again');
});

test('a worker that never starts sends the question back to this thread', async () => {
  // A policy with no worker-src, a browser with no Worker, a file that did not
  // ship: silence from a worker that never ran says nothing about the encoder,
  // and a page that concluded "cannot encode" from it would refuse to work on
  // a browser that is perfectly able to.
  const workers = pageWith({
    starts: false,
    onThisThread: Promise.resolve({ supported: true }),
  });

  assert.equal(await askSupported(VideoEncoder, {}, 40), true);
  assert.equal(workers[0].stopped, true);
});

test('a page that cannot make a worker at all still asks', async () => {
  pageWith({ onThisThread: Promise.resolve({ supported: true }) });
  globalThis.Worker = undefined;

  assert.equal(await askSupported(VideoEncoder, {}, 40), true);
});

test('a worker without the class asks this thread instead', async () => {
  // Every browser that offers WebCodecs to a window offers it to a worker too,
  // so this is not expected - but where it happens the page still has the
  // class, and an answer beats a guess.
  pageWith({
    answers: { absent: true },
    onThisThread: Promise.resolve({ supported: true }),
  });

  assert.equal(await askSupported(VideoEncoder, {}, 40), true);
});
