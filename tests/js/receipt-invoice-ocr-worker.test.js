/**
 * An optional second reading may fail after a usable primary reading. Keep
 * that evidence, while a visitor's cancellation still rejects the whole job.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { recognize, terminateOcr } from '../../tools/receipt-invoice-extractor/src/ocr.js';

function environment(t, recoveryFails = true, confidence = 40) {
  const saved = Object.fromEntries(['Worker', 'document', 'ImageData'].map(key => [key, globalThis[key]]));
  const canvases = [];
  const workers = [];
  let recoveryStarted;
  const recoveryReady = new Promise(resolve => { recoveryStarted = resolve; });
  const pixels = new Uint8ClampedArray(400 * 900 * 4).fill(255);
  // This filled header would otherwise launch another merchant request after
  // the failed recovery has already disposed the worker.
  for (let y = 40; y < 150; y += 1) {
    for (let x = 80; x < 320; x += 1) {
      const offset = (y * 400 + x) * 4;
      pixels[offset] = pixels[offset + 1] = pixels[offset + 2] = 20;
    }
  }
  class Canvas {
    constructor() {
      this.width = 400;
      this.height = 900;
      canvases.push(this);
    }
    getContext() {
      return {
        getImageData: () => ({ width: 400, height: 900, data: pixels }),
        fillRect() {}, drawImage() {}, putImageData() {},
      };
    }
    toBlob(callback) { callback(new Blob(['image'], { type: 'image/png' })); }
  }
  globalThis.document = { createElement: () => new Canvas() };
  globalThis.ImageData = class {
    constructor(data, width, height) { Object.assign(this, { data, width, height }); }
  };
  globalThis.Worker = class {
    constructor() {
      this.handlers = new Map();
      this.recognitions = 0;
      this.terminated = false;
      workers.push(this);
    }
    addEventListener(name, callback) { this.handlers.set(name, callback); }
    terminate() { this.terminated = true; }
    postMessage(message) {
      if (message.action === 'recognize') {
        this.recognitions += 1;
        if (this.recognitions === 2) {
          recoveryStarted();
          if (!recoveryFails) return;
          queueMicrotask(() => this.handlers.get('message')({ data: { status: 'reject', jobId: message.jobId } }));
          return;
        }
      }
      const data = message.action === 'recognize' ? {
        text: 'Date: 2026-10-04\nTOTAL CAD 13.56', confidence, blocks: [],
      } : {};
      queueMicrotask(() => this.handlers.get('message')({ data: { status: 'resolve', jobId: message.jobId, data } }));
    }
  };
  t.after(() => {
    terminateOcr();
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete globalThis[key];
      else globalThis[key] = value;
    }
  });
  return { canvas: new Canvas(), canvases, workers, recoveryReady };
}

test('an optional recovery failure keeps the primary reading and does not use the disposed worker for a logo', async (t) => {
  const context = environment(t);
  const result = await recognize(context.canvas);
  assert.equal(result.bodyText, 'Date: 2026-10-04\nTOTAL CAD 13.56');
  assert.equal(result.merchant, '');
  assert.equal(result.recoveryText, undefined);
  assert.equal(context.workers[0].recognitions, 2);
  assert.equal(context.workers[0].terminated, true);
  assert.equal(context.canvases[1].width, 0);
  assert.equal(context.canvases[1].height, 0);
});

test('a visitor cancellation during recovery rejects instead of returning primary evidence', async (t) => {
  const context = environment(t, false);
  const result = recognize(context.canvas);
  await context.recoveryReady;
  terminateOcr();
  await assert.rejects(result, { name: 'AbortError' });
  assert.equal(context.workers[0].terminated, true);
  assert.equal(context.canvases[1].width, 0);
  assert.equal(context.canvases[1].height, 0);
});

test('an optional closer-header failure preserves clear body financial fields and releases its canvas', async (t) => {
  const context = environment(t, true, 95);
  const result = await recognize(context.canvas);
  assert.equal(result.bodyText, 'Date: 2026-10-04\nTOTAL CAD 13.56');
  assert.equal(result.recoveryText, undefined);
  assert.equal(result.headerText, undefined);
  assert.equal(context.workers[0].recognitions, 2);
  assert.equal(context.workers[0].terminated, true);
  assert.equal(context.canvases[1].width, 0);
  assert.equal(context.canvases[1].height, 0);
});
