/** Preview ownership survives refusal and late native work without leaking. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { previewFrame } from '../../tools/timelapse-video/src/decode.js';

const media = {
  video: {
    codec: 'avc1.42001e', codedWidth: 16, codedHeight: 8,
    displayWidth: 16, displayHeight: 8, timescale: 30,
    samples: [{ pts: 0, dts: 0, offset: 0, size: 4, isKey: true }],
  },
};

function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

function fixture(t, { configure, read, flush, output = true } = {}) {
  const previous = new Map(['document', 'VideoDecoder', 'EncodedVideoChunk']
    .map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  t.after(() => {
    for (const [name, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  });
  const owned = { canvases: [], decoders: [], reads: 0, chunks: 0, closedFrames: 0 };
  globalThis.document = {
    createElement() {
      const canvas = { width: 0, height: 0, getContext: () => ({
        setTransform() {}, transform() {}, drawImage() {},
      }) };
      owned.canvases.push(canvas);
      return canvas;
    },
  };
  globalThis.EncodedVideoChunk = class { constructor(options) { Object.assign(this, options); } };
  globalThis.VideoDecoder = class {
    state = 'unconfigured';
    closes = 0;
    constructor(callbacks) { this.callbacks = callbacks; owned.decoders.push(this); }
    configure() { configure?.(); this.state = 'configured'; }
    decode(chunk) {
      owned.chunks += 1;
      if (output) this.callbacks.output({
        timestamp: chunk.timestamp, close: () => { owned.closedFrames += 1; },
      });
    }
    async flush() { await flush?.(); }
    close() { this.closes += 1; this.state = 'closed'; }
  };
  owned.file = {
    size: 4,
    slice() { return { arrayBuffer: async () => {
      owned.reads += 1;
      return read ? await read() : new ArrayBuffer(4);
    } }; },
  };
  return owned;
}

test('a preview configuration refusal closes its decoder and frees its canvas', async (t) => {
  const refusal = new TypeError('invalid configuration');
  const owned = fixture(t, { configure: () => { throw refusal; } });
  await assert.rejects(previewFrame({ file: owned.file, media }), (error) => error === refusal);
  assert.equal(owned.decoders[0].closes, 1);
  assert.equal(owned.reads, 0);
  assert.equal(owned.canvases[0].width, 0);
  assert.equal(owned.canvases[0].height, 0);
});

test('a retired preview closes now and never decodes a late file read', async (t) => {
  const started = deferred(), pending = deferred();
  const owned = fixture(t, { read: () => { started.resolve(); return pending.promise; } });
  const controller = new AbortController();
  const result = previewFrame({ file: owned.file, media, signal: controller.signal });
  const rejected = assert.rejects(result, { name: 'AbortError' });
  await started.promise;
  controller.abort();
  assert.equal(owned.decoders[0].state, 'closed');
  pending.resolve(new ArrayBuffer(4));
  await rejected;
  assert.equal(owned.chunks, 0);
  assert.equal(owned.decoders[0].closes, 1);
  assert.equal(owned.canvases[0].width, 0);
});

test('a late flush and frame after retirement cannot return a stale preview', async (t) => {
  const started = deferred(), pending = deferred();
  const owned = fixture(t, { flush: () => { started.resolve(); return pending.promise; } });
  const controller = new AbortController();
  const result = previewFrame({ file: owned.file, media, signal: controller.signal });
  const rejected = assert.rejects(result, { name: 'AbortError' });
  await started.promise;
  controller.abort();
  owned.decoders[0].callbacks.output({ timestamp: 1, close: () => { owned.closedFrames += 1; } });
  pending.resolve();
  await rejected;
  assert.equal(owned.closedFrames, 2);
  assert.equal(owned.decoders[0].closes, 1);
  assert.equal(owned.canvases[0].width, 0);
});

test('a successful preview transfers only its canvas and closes every frame', async (t) => {
  const owned = fixture(t);
  const canvas = await previewFrame({ file: owned.file, media });
  assert.equal(canvas, owned.canvases[0]);
  assert.equal(canvas.width, 16);
  assert.equal(canvas.height, 8);
  assert.equal(owned.closedFrames, 1);
  assert.equal(owned.decoders[0].closes, 1);
});
