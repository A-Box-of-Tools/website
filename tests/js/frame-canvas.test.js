/**
 * shared/js/frame-canvas.js - a frame on the canvas an output is built from.
 *
 * The drawing is a transform and one drawImage, so the context here records
 * what it was told and the assertions are about the matrix: a portrait phone
 * clip that decodes sideways has to land the right way up, at the output size.
 * The canvas hint is checked because it is the one thing the two tools that
 * share this file disagree on.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { drawScaled, frameCanvas } from '../../shared/js/frame-canvas.js';

/** A context that remembers every call, in order. */
function recorder() {
  const calls = [];
  return {
    calls,
    setTransform: (...m) => calls.push(['setTransform', ...m]),
    transform: (...m) => calls.push(['transform', ...m]),
    drawImage: (source, x, y) => calls.push(['drawImage', source, x, y]),
  };
}

test('an unrotated frame is scaled to the output and drawn at the origin', () => {
  const ctx = recorder();
  drawScaled(ctx, 'frame', { displayWidth: 1920, displayHeight: 1080, width: 480, height: 270 });
  assert.deepEqual(ctx.calls, [
    ['setTransform', 0.25, 0, 0, 0.25, 0, 0],
    ['drawImage', 'frame', 0, 0],
    ['setTransform', 1, 0, 0, 1, 0, 0],
  ]);
});

test('a rotation turns the stored frame into the picture people watch', () => {
  // A phone clip: stored 1920 x 1080, watched as 1080 x 1920, output at half size.
  const ctx = recorder();
  drawScaled(ctx, 'frame', {
    rotation: 90, displayWidth: 1080, displayHeight: 1920, width: 540, height: 960,
  });
  assert.deepEqual(ctx.calls[0], ['setTransform', 0.5, 0, 0, 0.5, 0, 0]);
  assert.deepEqual(ctx.calls[1], ['transform', 0, 1, -1, 0, 1080, 0]);

  const flipped = recorder();
  drawScaled(flipped, 'frame', {
    rotation: 180, displayWidth: 100, displayHeight: 50, width: 100, height: 50,
  });
  assert.deepEqual(flipped.calls[1], ['transform', -1, 0, 0, -1, 100, 50]);

  const other = recorder();
  drawScaled(other, 'frame', {
    rotation: 270, displayWidth: 1080, displayHeight: 1920, width: 1080, height: 1920,
  });
  assert.deepEqual(other.calls[1], ['transform', 0, -1, 1, 0, 0, 1920]);
});

test('the canvas asks to be read back only for the tool that will', () => {
  const made = [];
  globalThis.document = {
    createElement: () => ({
      getContext(kind, options) {
        made.push({ kind, options, width: this.width, height: this.height });
        return {};
      },
    }),
  };

  const plain = frameCanvas(320, 180);
  assert.equal(plain.canvas.width, 320);
  assert.equal(plain.ctx.imageSmoothingQuality, 'high');
  assert.deepEqual(made[0], { kind: '2d', options: { alpha: false }, width: 320, height: 180 });

  frameCanvas(320, 180, { readBack: true });
  assert.deepEqual(made[1].options, { alpha: false, willReadFrequently: true });
});
