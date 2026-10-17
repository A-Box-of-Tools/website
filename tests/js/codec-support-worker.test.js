/** The actual worker protocol, without relying on a machine's codec support. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../../shared/js/codec-support-worker.js', import.meta.url), 'utf8');

function worker(apis = {}) {
  const replies = [];
  const scope = { ...apis, postMessage: (value) => replies.push(structuredClone(value)) };
  scope.self = scope;
  runInNewContext(source, scope, { filename: 'codec-support-worker.js' });
  return {
    scope, replies,
    async ask(data) {
      const handler = scope.onmessage;
      assert.equal(typeof handler, 'function');
      await handler({ data });
      assert.equal(replies.length, 1, 'one request must have exactly one final answer');
      return replies[0];
    },
  };
}

test('codec worker tries configurations in order and stops at the first supported one', async () => {
  const visited = [];
  const configs = [{ codec: 'first' }, { codec: 'second' }, { codec: 'unused' }];
  const f = worker({ VideoEncoder: {
    async isConfigSupported(config) {
      visited.push(config.codec);
      return { supported: config.codec === 'second' };
    },
  } });
  assert.deepEqual(await f.ask({ codec: 'VideoEncoder', configs }), { index: 1 });
  assert.deepEqual(visited, ['first', 'second']);
});

test('codec worker continues after a thrown, rejected or malformed codec answer', async () => {
  const visited = [];
  const configs = ['throws', 'rejects', 'empty', 'truthy', 'yes', 'unused'].map(codec => ({ codec }));
  const f = worker({ VideoEncoder: {
    isConfigSupported(config) {
      visited.push(config.codec);
      if (config.codec === 'throws') throw new TypeError('invalid codec');
      if (config.codec === 'rejects') return Promise.reject(new TypeError('invalid profile'));
      if (config.codec === 'empty') return Promise.resolve(null);
      if (config.codec === 'truthy') return { supported: 'true' };
      return { supported: true };
    },
  } });
  assert.deepEqual(await f.ask({ codec: 'VideoEncoder', configs }), { index: 4 });
  assert.deepEqual(visited, ['throws', 'rejects', 'empty', 'truthy', 'yes']);
});

test('codec worker distinguishes unavailable codecs and unsupported batches from invalid requests', async (t) => {
  for (const api of [undefined, {}, { isConfigSupported: async () => ({ supported: false }) }]) {
    await t.test(String(api?.isConfigSupported), async () => {
      const f = worker({ VideoEncoder: api });
      assert.deepEqual(await f.ask({ codec: 'VideoEncoder', configs: [{ codec: 'unsupported' }] }), { index: -1 });
    });
  }
  assert.deepEqual(await worker().ask({ codec: 'VideoEncoder', configs: [] }), { index: -1 });
});

test('codec worker rejects malformed requests and never probes an arbitrary global', async (t) => {
  for (const data of [
    undefined, null, {}, { codec: 'VideoEncoder' },
    { codec: 'VideoEncoder', configs: {} }, { codec: 'UntrustedCodec', configs: [{}] },
  ]) {
    await t.test(JSON.stringify(data) ?? 'undefined', async () => {
      const unexpected = { isConfigSupported() { assert.fail('invalid request reached a codec'); } };
      const f = worker({ VideoEncoder: unexpected, UntrustedCodec: unexpected });
      assert.deepEqual(await f.ask(data), { index: null });
    });
  }
});

test('a worker accepts only one batch while a native answer is still pending', async () => {
  let resolve;
  let calls = 0;
  const f = worker({ VideoEncoder: {
    isConfigSupported() {
      calls++;
      return new Promise(done => { resolve = done; });
    },
  } });
  const pending = f.ask({ codec: 'VideoEncoder', configs: [{}] });
  assert.equal(f.scope.onmessage, null, 'a second message cannot start another native probe');
  assert.equal(calls, 1);
  resolve({ supported: true });
  assert.deepEqual(await pending, { index: 0 });
});
