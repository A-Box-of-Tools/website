/**
 * shared/js/codec-support.js - a question about the browser, with a deadline.
 *
 * A promise deadline handles a browser that never answers, but cannot interrupt
 * a native capability call blocking the page's thread. Video encoder questions
 * therefore need a disposable worker; these tests keep its failures bounded
 * without depending on a particular machine's installed codecs.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { askSupported, firstSupported } from '../../shared/js/codec-support.js';

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

function replaceGlobal(t, key, value) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, key);
  Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, key, previous);
    else delete globalThis[key];
  });
}

function workerHarness(t, { constructThrows = false, postThrows = false } = {}) {
  const workers = [];
  const timers = new Map();
  let nextTimer = 0;
  let now = 0;
  replaceGlobal(t, 'performance', { now: () => now });
  t.mock.method(globalThis, 'setTimeout', (callback, ms) => {
    timers.set(++nextTimer, { callback, ms });
    return nextTimer;
  });
  t.mock.method(globalThis, 'clearTimeout', (id) => timers.delete(id));
  replaceGlobal(t, 'Worker', class {
    constructor(url, options) {
      if (constructThrows) throw new Error('worker blocked');
      this.url = url;
      this.options = options;
      this.messages = [];
      this.terminated = 0;
      this.onmessage = null;
      this.onerror = null;
      this.onmessageerror = null;
      workers.push(this);
    }
    postMessage(message, transfer) {
      if (postThrows) throw new Error('could not clone configuration');
      this.messages.push(structuredClone(message, Array.isArray(transfer) ? { transfer } : transfer));
    }
    terminate() { this.terminated++; }
  });
  return {
    workers, timers,
    get timersScheduled() { return nextTimer; },
    elapse(ms) { now += ms; },
    expire() {
      assert.equal(timers.size, 1, 'one deadline must cover the whole batch');
      const [id, { callback }] = timers.entries().next().value;
      timers.delete(id);
      callback();
    },
    disposed(worker) {
      assert.equal(worker.terminated, 1);
      assert.equal(worker.onmessage, null);
      assert.equal(worker.onerror, null);
      assert.equal(worker.onmessageerror, null);
      assert.equal(timers.size, 0, 'settled probes must not retain a deadline');
    },
  };
}

const candidates = [
  { codec: 'avc1.42001e', width: 320, height: 240 },
  { codec: 'avc1.4d001e', width: 320, height: 240 },
];

const desktopSafariUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Safari/605.1.15';
const mobileSafariUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1';
const linuxWebKit = {
  platform: 'Linux x86_64',
  vendor: 'Apple Computer, Inc.',
  userAgent: desktopSafariUA,
};

test('reported Linux WebKit initializes media before asking the worker about encoders', async (t) => {
  for (const [name, identity] of [
    ['default browser', linuxWebKit],
    ['desktop Safari emulation', { ...linuxWebKit, userAgent: desktopSafariUA }],
    ['iPhone emulation', { ...linuxWebKit, userAgent: mobileSafariUA }],
    ['Linux user agent', { ...linuxWebKit, userAgent: desktopSafariUA.replace('Macintosh; Intel Mac OS X 10_15_7', 'X11; Linux x86_64') }],
    ['case-insensitive Linux platform', { ...linuxWebKit, platform: 'linux aarch64' }],
  ]) {
    await t.test(name, async (t) => {
      const f = workerHarness(t);
      replaceGlobal(t, 'navigator', identity);
      replaceGlobal(t, 'VideoEncoder', {
        isConfigSupported() { assert.fail('native encoder queries must not reach the page'); },
      });
      let initialized = 0;
      replaceGlobal(t, 'document', {
        createElement(tag) {
          assert.equal(tag, 'video');
          return {
            set src(value) { assert.fail('media initialization must not load a source'); },
            canPlayType(type) {
              assert.equal(type, 'video/mp4; codecs="avc1.640034"');
              assert.equal(f.workers.length, 0, 'media must initialize before a worker can query it');
              initialized++;
              return '';
            },
          };
        },
      });
      const pending = firstSupported('VideoEncoder', candidates);
      assert.equal(initialized, 1);
      assert.equal(f.workers.length, 1, 'an empty playback answer must still allow an encoder query');
      const worker = f.workers[0];
      assert.deepEqual(worker.messages, [{ codec: 'VideoEncoder', configs: candidates }]);
      worker.onmessage({ data: { index: 1 } });
      assert.equal(await pending, 1);
      f.disposed(worker);
    });
  }
});

test('Linux WebKit initialization leaves Apple devices, other engines and unknown identities alone', async (t) => {
  for (const [name, identity] of [
    ['Mac Safari', { ...linuxWebKit, platform: 'MacIntel', userAgent: desktopSafariUA }],
    ['iPhone Safari', { ...linuxWebKit, platform: 'iPhone', userAgent: mobileSafariUA }],
    ['iPad Safari', { ...linuxWebKit, platform: 'iPad', userAgent: mobileSafariUA.replaceAll('iPhone', 'iPad') }],
    ['iPad desktop mode', { ...linuxWebKit, platform: 'MacIntel', userAgent: desktopSafariUA, maxTouchPoints: 5 }],
    ['Linux Chrome', { ...linuxWebKit, vendor: 'Google Inc.', userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36' }],
    ['Linux Chrome with a Safari user agent', { ...linuxWebKit, vendor: 'Google Inc.', userAgent: desktopSafariUA }],
    ['Linux Firefox', { ...linuxWebKit, vendor: '', userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:156.0) Gecko/20100101 Firefox/156.0' }],
    ['unknown platform', { ...linuxWebKit, platform: '' }],
    ['unknown vendor', { ...linuxWebKit, vendor: '' }],
    ['unknown user agent', { ...linuxWebKit, userAgent: '' }],
    ['missing identity fields', {}],
    ['missing navigator', undefined],
    ...['Chromium', 'Chrome', 'CriOS', 'Edg', 'EdgA', 'EdgiOS', 'OPR', 'Firefox', 'FxiOS'].map(token => [
      `${token} token takes precedence over WebKit compatibility tokens`,
      { ...linuxWebKit, userAgent: `${desktopSafariUA} ${token}/156.0` },
    ]),
  ]) {
    await t.test(name, async (t) => {
      const f = workerHarness(t);
      replaceGlobal(t, 'navigator', identity);
      replaceGlobal(t, 'document', {
        createElement() { assert.fail('other engines must not need media initialization'); },
      });
      const pending = firstSupported('VideoEncoder', candidates);
      assert.equal(f.workers.length, 1, 'other identities must retain their direct worker query');
      const worker = f.workers[0];
      worker.onmessage({ data: { index: 0 } });
      assert.equal(await pending, 0);
      f.disposed(worker);
    });
  }
});

test('Linux WebKit decoder and audio queries do not need video initialization', async (t) => {
  for (const [name, configs] of [
    ['VideoDecoder', [{ codec: 'avc1.64001f' }]],
    ['AudioEncoder', [{ codec: 'opus', sampleRate: 48000, numberOfChannels: 2 }]],
    ['AudioDecoder', [{ codec: 'opus', sampleRate: 48000, numberOfChannels: 2 }]],
  ]) {
    await t.test(name, async (t) => {
      const f = workerHarness(t);
      replaceGlobal(t, 'navigator', linuxWebKit);
      replaceGlobal(t, 'document', {
        createElement() { assert.fail('decoder and audio checks must not initialize video'); },
      });
      const pending = firstSupported(name, configs);
      assert.equal(f.workers.length, 1);
      const worker = f.workers[0];
      assert.deepEqual(worker.messages, [{ codec: name, configs }]);
      worker.onmessage({ data: { index: 0 } });
      assert.equal(await pending, 0);
      f.disposed(worker);
    });
  }
});

test('playback support never substitutes for the worker encoder answer', async (t) => {
  const f = workerHarness(t);
  replaceGlobal(t, 'navigator', linuxWebKit);
  replaceGlobal(t, 'document', {
    createElement: () => ({ canPlayType: () => 'probably' }),
  });
  const pending = firstSupported('VideoEncoder', candidates);
  const worker = f.workers[0];
  worker.onmessage({ data: { index: -1 } });
  assert.equal(await pending, -1);
  f.disposed(worker);
});

test('missing or throwing media initialization refuses before a native encoder query', async (t) => {
  for (const [name, document] of [
    ['no document', undefined],
    ['no createElement', {}],
    ['createElement throws', { createElement() { throw new Error('unavailable'); } }],
    ['no video element', { createElement: () => null }],
    ['no canPlayType', { createElement: () => ({}) }],
    ['canPlayType throws', { createElement: () => ({ canPlayType() { throw new Error('unavailable'); } }) }],
  ]) {
    await t.test(name, async (t) => {
      const f = workerHarness(t);
      replaceGlobal(t, 'navigator', linuxWebKit);
      replaceGlobal(t, 'document', document);
      assert.equal(await firstSupported('VideoEncoder', candidates), null);
      assert.equal(f.workers.length, 0);
      assert.equal(f.timersScheduled, 0);
    });
  }
});

test('media initialization failure remains retryable', async (t) => {
  const f = workerHarness(t);
  replaceGlobal(t, 'navigator', linuxWebKit);
  let attempts = 0;
  replaceGlobal(t, 'document', {
    createElement: () => ({
      canPlayType() {
        if (++attempts === 1) throw new Error('not ready');
        return '';
      },
    }),
  });
  assert.equal(await firstSupported('VideoEncoder', candidates), null);
  const pending = firstSupported('VideoEncoder', candidates);
  assert.equal(attempts, 2);
  assert.equal(f.workers.length, 1);
  const worker = f.workers[0];
  worker.onmessage({ data: { index: 0 } });
  assert.equal(await pending, 0);
  f.disposed(worker);
});

test('media initialization shares the worker deadline rather than extending it', async (t) => {
  const f = workerHarness(t);
  replaceGlobal(t, 'navigator', linuxWebKit);
  replaceGlobal(t, 'document', {
    createElement: () => ({ canPlayType() { f.elapse(12); return ''; } }),
  });
  const pending = firstSupported('VideoEncoder', candidates, 37);
  assert.equal([...f.timers.values()][0].ms, 25);
  const worker = f.workers[0];
  f.elapse(26);
  worker.onmessage({ data: { index: 0 } });
  assert.equal(await pending, null);
  f.disposed(worker);
});

test('media initialization that exhausts the deadline cannot start a worker', async (t) => {
  const f = workerHarness(t);
  replaceGlobal(t, 'navigator', linuxWebKit);
  replaceGlobal(t, 'document', {
    createElement: () => ({ canPlayType() { f.elapse(37); return ''; } }),
  });
  assert.equal(await firstSupported('VideoEncoder', candidates, 37), null);
  assert.equal(f.workers.length, 0);
  assert.equal(f.timersScheduled, 0);
});

test('encoder candidates travel together to a module worker without probing the page', async (t) => {
  const f = workerHarness(t);
  replaceGlobal(t, 'VideoEncoder', {
    isConfigSupported() { assert.fail('a blocking codec probe must never run on the page'); },
  });
  const pending = firstSupported('VideoEncoder', candidates);
  assert.equal(f.workers.length, 1);
  const worker = f.workers[0];
  assert.equal(worker.url.href, new URL('../../shared/js/codec-support-worker.js', import.meta.url).href);
  assert.equal(worker.options.type, 'module');
  assert.deepEqual(worker.messages, [{ codec: 'VideoEncoder', configs: candidates }]);
  worker.onmessage({ data: { index: 1 } });
  assert.equal(await pending, 1);
  f.disposed(worker);
});

test('worker answers distinguish no supported configuration from a broken reply', async (t) => {
  for (const [data, expected] of [
    [{ index: 0 }, 0], [{ index: -1 }, -1],
    [{ index: 2 }, null], [{ index: -2 }, null], [{ index: 0.5 }, null],
    [{ index: '0' }, null], [{ index: NaN }, null], [{ index: true }, null],
    [{}, null], [null, null], [undefined, null],
  ]) {
    await t.test(`reply ${JSON.stringify(data)}`, async (t) => {
      const f = workerHarness(t);
      const pending = firstSupported('VideoEncoder', candidates);
      const worker = f.workers[0];
      worker.onmessage({ data });
      assert.equal(await pending, expected);
      f.disposed(worker);
    });
  }
});

test('probing a decoder preserves the caller\'s configuration bytes', async (t) => {
  const f = workerHarness(t);
  const description = new Uint8Array([1, 100, 0, 31]);
  const pending = firstSupported('VideoDecoder', [{ codec: 'avc1.64001f', description }]);
  const worker = f.workers[0];
  assert.equal(description.byteLength, 4, 'a capability query must not detach caller data');
  worker.messages[0].configs[0].description[0] = 9;
  assert.deepEqual([...description], [1, 100, 0, 31]);
  worker.onmessage({ data: { index: 0 } });
  assert.equal(await pending, 0);
  f.disposed(worker);
});

test('worker failures settle and dispose the probe', async (t) => {
  for (const event of ['onerror', 'onmessageerror']) {
    await t.test(event, async (t) => {
      const f = workerHarness(t);
      const pending = firstSupported('VideoEncoder', candidates);
      const worker = f.workers[0];
      worker[event]({ preventDefault() {} });
      assert.equal(await pending, null);
      f.disposed(worker);
    });
  }
});

test('worker creation and message cloning failures remain retryable infrastructure failures', async (t) => {
  for (const options of [{ constructThrows: true }, { postThrows: true }]) {
    await t.test(JSON.stringify(options), async (t) => {
      const f = workerHarness(t, options);
      assert.equal(await firstSupported('VideoEncoder', candidates), null);
      assert.equal(f.timers.size, 0);
      if (f.workers.length) f.disposed(f.workers[0]);
    });
  }
});

test('an unresponsive worker expires once and cannot answer a fresh attempt', async (t) => {
  const f = workerHarness(t);
  const pending = firstSupported('VideoEncoder', candidates, 37);
  const expired = f.workers[0];
  const lateMessage = expired.onmessage;
  assert.equal([...f.timers.values()][0].ms, 37);
  f.expire();
  assert.equal(await pending, null);
  f.disposed(expired);

  const retry = firstSupported('VideoEncoder', candidates, 37);
  assert.equal(f.workers.length, 2, 'a timeout must not permanently disable probing');
  const fresh = f.workers[1];
  lateMessage({ data: { index: 0 } });
  assert.equal(fresh.terminated, 0);
  assert.equal(f.timers.size, 1);
  fresh.onmessage({ data: { index: 1 } });
  assert.equal(await retry, 1);
  f.disposed(fresh);
  assert.equal(expired.terminated, 1);
});

test('missing workers never fall back to a potentially blocking page probe', async (t) => {
  replaceGlobal(t, 'Worker', undefined);
  replaceGlobal(t, 'navigator', linuxWebKit);
  replaceGlobal(t, 'document', {
    createElement() { assert.fail('missing workers must refuse before native initialization'); },
  });
  replaceGlobal(t, 'VideoEncoder', {
    isConfigSupported() { assert.fail('unavailable worker must not run a page probe'); },
  });
  assert.equal(await firstSupported('VideoEncoder', candidates), null);
});

test('a reply queued after the deadline is not mistaken for a timely success', async (t) => {
  const f = workerHarness(t);
  const pending = firstSupported('VideoEncoder', candidates, 37);
  const worker = f.workers[0];
  // A busy page can deliver queued messages before its delayed timeout task.
  f.elapse(38);
  worker.onmessage({ data: { index: 0 } });
  assert.equal(await pending, null);
  f.disposed(worker);
});

test('invalid probe requests do not launch a worker and an empty batch means no match', async (t) => {
  const f = workerHarness(t);
  replaceGlobal(t, 'navigator', linuxWebKit);
  replaceGlobal(t, 'document', {
    createElement() { assert.fail('invalid requests must not initialize media'); },
  });
  assert.equal(await firstSupported('VideoEncoder', []), -1);
  for (const [name, configs, deadline] of [
    ['Worker', candidates, 100], ['VideoEncoder', {}, 100],
    ['VideoEncoder', candidates, 0], ['VideoEncoder', candidates, -1],
    ['VideoEncoder', candidates, Infinity], ['VideoEncoder', candidates, NaN],
  ]) assert.equal(await firstSupported(name, configs, deadline), null);
  assert.equal(f.workers.length, 0);
  assert.equal(f.timers.size, 0);
});
