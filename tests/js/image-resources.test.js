/** Error paths release the same owned surfaces as successful native operations. */

import test from 'node:test';
import assert from 'node:assert/strict';
import { canEncode, encode, hasAlpha, JPEG, PNG, WEBP } from '../../shared/js/image-convert.js';

async function withCanvas(make, work) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const canvases = [];
  Object.defineProperty(globalThis, 'document', { configurable: true, value: {
    createElement: () => { const canvas = make(); canvases.push(canvas); return canvas; },
  } });
  try {
    await work();
  } finally {
    if (previous) Object.defineProperty(globalThis, 'document', previous);
    else delete globalThis.document;
  }
  assert.ok(canvases.length);
  for (const canvas of canvases) {
    assert.equal(canvas.width, 0);
    assert.equal(canvas.height, 0);
  }
}

test('native encoding clears its canvas on context, draw, encoder, null and wrong-type failures', async () => {
  for (const failure of ['none', 'context', 'draw', 'encode', 'null', 'wrong']) {
    const expected = new Error(failure);
    await withCanvas(() => ({
      width: 0, height: 0,
      getContext: () => {
        if (failure === 'context') throw expected;
        return { fillRect() {}, drawImage() { if (failure === 'draw') throw expected; } };
      },
      toBlob(callback) {
        if (failure === 'encode') throw expected;
        callback(failure === 'null' ? null : new Blob(['written'], { type: failure === 'wrong' ? PNG : JPEG }));
      },
    }), async () => {
      const pending = encode({}, { width: 12, height: 8, mime: JPEG, quality: 0.92 });
      if (failure === 'none') assert.equal((await pending).type, JPEG);
      else if (failure === 'null') await assert.rejects(pending, /error.encode/);
      else if (failure === 'wrong') await assert.rejects(pending, /error.wrongtype/);
      else await assert.rejects(pending, error => error === expected);
    });
  }
});

test('alpha inspection clears its band canvas after a finding, no finding or pixel-read failure', async () => {
  for (const failure of ['none', 'alpha', 'context', 'draw', 'read']) {
    const expected = new Error(failure);
    await withCanvas(() => ({
      width: 0, height: 0,
      getContext: () => {
        if (failure === 'context') throw expected;
        return {
          clearRect() {}, drawImage() { if (failure === 'draw') throw expected; },
          getImageData() {
            if (failure === 'read') throw expected;
            return { data: new Uint8ClampedArray([255, 0, 0, failure === 'alpha' ? 128 : 255]) };
          },
        };
      },
    }), async () => {
      if (['none', 'alpha'].includes(failure)) assert.equal(hasAlpha({}, 1, 1), failure === 'alpha');
      else assert.throws(() => hasAlpha({}, 1, 1), error => error === expected);
    });
  }
});

test('a format probe clears its one-pixel surface for success, refusal and thrown encoder', async () => {
  for (const failure of ['none', 'null', 'wrong', 'throw']) {
    const expected = new Error(failure);
    await withCanvas(() => ({
      width: 0, height: 0,
      toBlob(callback) {
        if (failure === 'throw') throw expected;
        callback(failure === 'null' ? null : new Blob(['written'], { type: failure === 'wrong' ? PNG : WEBP }));
      },
    }), async () => {
      const pending = canEncode(WEBP);
      if (failure === 'throw') await assert.rejects(pending, error => error === expected);
      else assert.equal(await pending, failure === 'none');
    });
  }
});
