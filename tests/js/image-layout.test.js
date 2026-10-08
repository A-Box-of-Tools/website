/**
 * A composite must preserve the requested outer width, gaps and image order.
 * The export boundary also matters: removing a thumbnail halfway through must
 * not change the image that was paired with its rectangle when export began.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_PIXELS, MAX_SIDE, MIN_ZOOM, MAX_ZOOM, arrange, imagePlacement, drawImageInCell, renderLayout,
} from '../../tools/image-layout/src/arrange.js';

const landscape = { width: 200, height: 100 };
const square = { width: 100, height: 100 };
const portrait = { width: 50, height: 100 };
const settings = { layout: 'grid', width: 1200, columns: 3, ratio: 'square',
  gap: 12, padding: 24, fit: 'contain' };
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9,
  `${actual} should equal ${expected}`);

function recorder() {
  const calls = [];
  return {
    calls,
    save() { calls.push(['save']); },
    restore() { calls.push(['restore']); },
    beginPath() { calls.push(['beginPath']); },
    rect(...args) { calls.push(['rect', ...args]); },
    clip() { calls.push(['clip']); },
    drawImage(...args) { calls.push(['drawImage', ...args]); },
    fillRect(...args) { calls.push(['fillRect', this.fillStyle, ...args]); },
  };
}

test('an empty input has no canvas geometry', () => {
  assert.equal(arrange([], settings), null);
});

test('grid margins and gaps are part of the requested outer width', () => {
  const result = arrange([landscape, square, portrait, square], { ...settings, ratio: 'landscape' });
  assert.equal(result.width, 1200);
  assert.equal(result.height, 624);
  assert.equal(result.columns, 3);
  assert.equal(result.rows, 2);
  assert.deepEqual(result.cells, [
    { x: 24, y: 24, width: 376, height: 282 },
    { x: 412, y: 24, width: 376, height: 282 },
    { x: 800, y: 24, width: 376, height: 282 },
    { x: 24, y: 318, width: 376, height: 282 },
  ]);
});

test('a portrait grid uses the same cell ratio in every row', () => {
  const result = arrange([landscape, square, portrait], { ...settings,
    width: 1000, columns: 2, ratio: 'portrait', gap: 20, padding: 10 });
  assert.equal(result.height, 1320);
  assert.deepEqual(result.cells[2], { x: 10, y: 670, width: 480, height: 640 });
});

test('a fractional grid reaches both outside margins without stretching a column', () => {
  const result = arrange([square, square, square], { ...settings,
    width: 101, padding: 1, gap: 1 });
  assert.equal(result.height, 35);
  for (const cell of result.cells) near(cell.width, 97 / 3);
  near(result.cells[2].x + result.cells[2].width, 100);
  assert.ok(result.cells[2].y + result.cells[2].height <= result.height - 1);
});

test('horizontal and vertical strips ignore the grid column control', () => {
  const items = [square, square, square];
  const horizontal = arrange(items, { ...settings,
    layout: 'horizontal', width: 900, columns: 7, gap: 0, padding: 0 });
  assert.equal(horizontal.columns, 3);
  assert.equal(horizontal.rows, 1);
  assert.equal(horizontal.height, 300);
  assert.deepEqual(horizontal.cells[2], { x: 600, y: 0, width: 300, height: 300 });
  const vertical = arrange(items, { ...settings,
    layout: 'vertical', width: 600, columns: 7, gap: 0, padding: 0 });
  assert.equal(vertical.columns, 1);
  assert.equal(vertical.rows, 3);
  assert.equal(vertical.height, 1800);
  assert.deepEqual(vertical.cells[2], { x: 0, y: 1200, width: 600, height: 600 });
});

test('an original-shape horizontal strip has proportional widths and a common height', () => {
  const result = arrange([landscape, square, portrait], { ...settings,
    layout: 'horizontal', ratio: 'original', width: 760, padding: 10, gap: 20 });
  assert.equal(result.height, 220);
  assert.deepEqual(result.cells, [
    { x: 10, y: 10, width: 400, height: 200 },
    { x: 430, y: 10, width: 200, height: 200 },
    { x: 650, y: 10, width: 100, height: 200 },
  ]);
});

test('an original-shape vertical strip has a common width and proportional heights', () => {
  const result = arrange([landscape, square, portrait], { ...settings,
    layout: 'vertical', ratio: 'original', width: 620, padding: 10, gap: 15 });
  assert.equal(result.height, 2150);
  assert.deepEqual(result.cells, [
    { x: 10, y: 10, width: 600, height: 300 },
    { x: 10, y: 325, width: 600, height: 600 },
    { x: 10, y: 940, width: 600, height: 1200 },
  ]);
});

test('invalid controls and source dimensions fail without substituting a preset', () => {
  for (const change of [
    { width: NaN }, { width: Infinity }, { width: '1200' }, { width: 0 },
    { width: 1200.5 }, { columns: 0 }, { columns: -1 }, { gap: -1 },
    { gap: 0.5 }, { padding: NaN }, { fit: 'stretch' }, { layout: 'free' },
    { ratio: '16:9' }, { ratio: 'original' },
  ]) {
    assert.throws(() => arrange([square], { ...settings, ...change }), /errorSettings/);
  }
  for (const item of [{ width: 0, height: 1 }, { width: 1, height: NaN },
    { width: -1, height: 1 }, { width: 1, height: Infinity }]) {
    assert.throws(() => arrange([item], settings), /errorSettings/);
  }
});

test('margins and gaps cannot consume the picture area', () => {
  assert.throws(() => arrange([square, square, square], { ...settings,
    width: 60, gap: 10, padding: 20 }), /errorSpace/);
  assert.throws(() => arrange([square, portrait], { ...settings,
    layout: 'horizontal', ratio: 'original', width: 2, gap: 0, padding: 0 }), /errorSpace/);
});

test('both dimensions and the combined canvas area are limited before export', () => {
  const original = { ...settings, layout: 'vertical', ratio: 'original', gap: 0, padding: 0 };
  assert.equal(MAX_SIDE, 8192);
  assert.equal(MAX_PIXELS, 32_000_000);
  assert.throws(() => arrange([square], { ...original, width: MAX_SIDE + 1 }), /errorSize/);
  assert.throws(() => arrange([{ width: 1, height: MAX_SIDE + 1 }],
    { ...original, width: 1 }), /errorSize/);
  assert.throws(() => arrange([{ width: 8000, height: 4001 }],
    { ...original, width: 8000 }), /errorSize/);
  assert.equal(arrange([{ width: 8000, height: 4000 }], { ...original, width: 8000 }).height, 4000);
  assert.equal(arrange([{ width: 1, height: MAX_SIDE }], { ...original, width: 1 }).height, MAX_SIDE);
});

test('contain centers the whole image and clips it to its cell', () => {
  const ctx = recorder();
  const cell = { x: 10, y: 20, width: 100, height: 100 };
  drawImageInCell(ctx, landscape, cell, 'contain');
  assert.deepEqual(ctx.calls, [
    ['save'], ['beginPath'], ['rect', 10, 20, 100, 100], ['clip'],
    ['drawImage', landscape, 10, 45, 100, 50], ['restore'],
  ]);
});

test('cover scales evenly and crops equal amounts from opposite edges', () => {
  const ctx = recorder();
  drawImageInCell(ctx, landscape, { x: 10, y: 20, width: 100, height: 100 }, 'cover');
  assert.deepEqual(ctx.calls.find((call) => call[0] === 'drawImage'),
    ['drawImage', landscape, -40, 20, 200, 100]);
  const tall = recorder();
  drawImageInCell(tall, portrait, { x: 10, y: 20, width: 100, height: 100 }, 'cover');
  assert.deepEqual(tall.calls.find((call) => call[0] === 'drawImage'),
    ['drawImage', portrait, 10, -30, 100, 200]);
});

test('panning reaches either cropped edge without exposing an empty strip', () => {
  const cell = { x: 10, y: 20, width: 100, height: 100 };
  const left = imagePlacement(landscape, cell, 'cover', { panX: 1, panY: 1 });
  assert.deepEqual(left, { x: 10, y: 20, width: 200, height: 100, panRangeX: 50, panRangeY: 0 });
  const right = imagePlacement(landscape, cell, 'cover', { panX: -1, panY: -1 });
  assert.equal(right.x + right.width, cell.x + cell.width);
  assert.equal(right.y, cell.y);
  const top = imagePlacement(portrait, cell, 'cover', { panY: 1 });
  const bottom = imagePlacement(portrait, cell, 'cover', { panY: -1 });
  assert.equal(top.y, cell.y);
  assert.equal(bottom.y + bottom.height, cell.y + cell.height);
});

test('contain can position a whole image in spare space and a crop along overflowing axes', () => {
  const cell = { x: 0, y: 0, width: 100, height: 100 };
  assert.deepEqual(imagePlacement(landscape, cell, 'contain', { panX: 1, panY: -1 }),
    { x: 0, y: 0, width: 100, height: 50, panRangeX: 0, panRangeY: 25 });
  assert.deepEqual(imagePlacement(landscape, cell, 'contain', { zoom: 1.5, panX: -1, panY: 1 }),
    { x: -50, y: 25, width: 150, height: 75, panRangeX: 25, panRangeY: 12.5 });
  assert.deepEqual(imagePlacement(landscape, cell, 'contain', { zoom: 3, panX: 1, panY: -1 }),
    { x: 0, y: -50, width: 300, height: 150, panRangeX: 100, panRangeY: 25 });
});

test('zooming out from contain or cover reveals centred space within the same clipped frame', () => {
  const cell = { x: 10, y: 20, width: 100, height: 100 };
  for (const [fit, expected] of [
    ['contain', { x: 35, y: 57.5, width: 50, height: 25, panRangeX: 25, panRangeY: 37.5 }],
    ['cover', { x: 10, y: 45, width: 100, height: 50, panRangeX: 0, panRangeY: 25 }],
  ]) {
    const transform = { zoom: 0.5 };
    assert.deepEqual(imagePlacement(landscape, cell, fit, transform), expected);
    const ctx = recorder();
    drawImageInCell(ctx, landscape, cell, fit, transform);
    assert.deepEqual(ctx.calls, [
      ['save'], ['beginPath'], ['rect', 10, 20, 100, 100], ['clip'],
      ['drawImage', landscape, expected.x, expected.y, expected.width, expected.height], ['restore'],
    ]);
  }
  assert.deepEqual(imagePlacement(square, cell, 'cover', { zoom: MIN_ZOOM }),
    { x: 47.5, y: 57.5, width: 25, height: 25, panRangeX: 37.5, panRangeY: 37.5 });
});

test('zoomed-out pictures can move to opposite frame edges while staying entirely inside', () => {
  const cell = { x: 10, y: 20, width: 100, height: 100 };
  for (const [image, fit, zoom] of [
    [landscape, 'contain', 0.5], [landscape, 'cover', 0.5], [square, 'cover', MIN_ZOOM],
  ]) {
    const start = imagePlacement(image, cell, fit, { zoom, panX: -1, panY: -1 });
    const end = imagePlacement(image, cell, fit, { zoom, panX: 1, panY: 1 });
    assert.equal(start.x, cell.x);
    assert.equal(start.y, cell.y);
    assert.equal(end.x + end.width, cell.x + cell.width);
    assert.equal(end.y + end.height, cell.y + cell.height);
    assert.ok(start.width <= cell.width && start.height <= cell.height);
  }
});

test('an insignificant difference from the frame does not produce a draggable axis', () => {
  const placement = imagePlacement(square,
    { x: 0, y: 0, width: 100, height: 100 }, 'cover', { zoom: 1 + 1e-9, panX: 1, panY: -1 });
  assert.equal(placement.panRangeX, 0);
  assert.equal(placement.panRangeY, 0);
});

test('zoom preserves aspect ratio and clips an independently adjusted frame', () => {
  const ctx = recorder();
  const cell = { x: 10, y: 20, width: 100, height: 100 };
  drawImageInCell(ctx, landscape, cell, 'cover', { zoom: 2, panX: 0.5, panY: -1 });
  assert.deepEqual(ctx.calls, [
    ['save'], ['beginPath'], ['rect', 10, 20, 100, 100], ['clip'],
    ['drawImage', landscape, -65, -80, 400, 200], ['restore'],
  ]);
});

test('a normalized adjustment selects the same crop at preview and export sizes', () => {
  const transform = { zoom: 2.75, panX: -0.6, panY: 0.35 };
  const small = imagePlacement(landscape,
    { x: 12, y: 18, width: 120, height: 90 }, 'cover', transform);
  const large = imagePlacement(landscape,
    { x: 120, y: 180, width: 1200, height: 900 }, 'cover', transform);
  for (const key of ['x', 'y', 'width', 'height', 'panRangeX', 'panRangeY']) {
    near(large[key], small[key] * 10);
  }
});

test('a rounded preview bitmap uses the original aspect ratio for its placement', () => {
  const bitmap = { width: 1, height: 600 };
  const original = { width: 1, height: 3000 };
  const cell = { x: 0, y: 0, width: 100, height: 100 };
  const ctx = recorder();
  drawImageInCell(ctx, bitmap, cell, 'contain', {}, original);
  const call = ctx.calls.find((entry) => entry[0] === 'drawImage');
  assert.equal(call[1], bitmap);
  near(call[2], (100 - 1 / 30) / 2);
  assert.equal(call[3], 0);
  near(call[4], 1 / 30);
  assert.equal(call[5], 100);
  const cropped = recorder();
  drawImageInCell(cropped, bitmap, cell, 'cover', { zoom: 2, panY: -1 }, original);
  assert.deepEqual(cropped.calls.find((entry) => entry[0] === 'drawImage'),
    ['drawImage', bitmap, -50, -599900, 200, 600000]);
});

test('original-shape strips can zoom and pan without changing their frame geometry', () => {
  const plan = arrange([landscape, portrait], { ...settings,
    layout: 'horizontal', ratio: 'original', width: 250, gap: 0, padding: 0 });
  const cell = plan.cells[0];
  assert.deepEqual(cell, { x: 0, y: 0, width: 200, height: 100 });
  const placement = imagePlacement(landscape, cell, 'contain', { zoom: 2, panX: -1, panY: 1 });
  assert.deepEqual(placement,
    { x: -200, y: 0, width: 400, height: 200, panRangeX: 100, panRangeY: 50 });
  assert.deepEqual(plan.cells[1], { x: 200, y: 0, width: 50, height: 100 });
});

test('invalid adjustments are rejected before a drawing context is changed', () => {
  assert.equal(MIN_ZOOM, 0.25);
  assert.equal(MAX_ZOOM, 4);
  const cell = { x: 0, y: 0, width: 100, height: 100 };
  for (const transform of [null, [], { zoom: 0.24 }, { zoom: 4.01 }, { zoom: NaN },
    { zoom: Infinity }, { zoom: '2' }, { panX: -1.01 }, { panY: 1.01 }, { panX: NaN }]) {
    const ctx = recorder();
    assert.throws(() => drawImageInCell(ctx, square, cell, 'contain', transform), /errorSettings/);
    assert.deepEqual(ctx.calls, []);
  }
});

test('a thumbnail uses its intrinsic size and a drawing failure restores the clip', () => {
  const image = { width: 100, height: 100, naturalWidth: 200, naturalHeight: 100 };
  const ctx = recorder();
  drawImageInCell(ctx, image, { x: 0, y: 0, width: 100, height: 100 });
  assert.deepEqual(ctx.calls.find((call) => call[0] === 'drawImage'),
    ['drawImage', image, 0, 25, 100, 50]);
  const failing = recorder();
  failing.drawImage = () => { throw new Error('decode'); };
  assert.throws(() => drawImageInCell(failing, square,
    { x: 0, y: 0, width: 100, height: 100 }), /decode/);
  assert.deepEqual(failing.calls.at(-1), ['restore']);
});

async function withCanvas(action) {
  const previousDocument = globalThis.document;
  const previousDecode = globalThis.createImageBitmap;
  const ctx = recorder();
  const canvas = { width: 0, height: 0, getContext() { return ctx; } };
  globalThis.document = { createElement() { return canvas; } };
  try { await action({ ctx, canvas }); } finally {
    globalThis.document = previousDocument;
    globalThis.createImageBitmap = previousDecode;
  }
}

const exportSettings = { ...settings, layout: 'horizontal', width: 220,
  ratio: 'square', gap: 0, padding: 10, background: '#123456' };

test('an export snapshots order, settings and individual crops and closes each bitmap before the next decode', async () => {
  await withCanvas(async ({ ctx }) => {
    const items = [
      { ...square, file: 'first', transform: { zoom: 2, panX: 1, panY: -1 } },
      { ...square, file: 'second', transform: { zoom: 3, panX: -1, panY: 1 } },
    ];
    const options = { ...exportSettings };
    const events = [];
    let release;
    globalThis.createImageBitmap = async (file) => {
      events.push(['decode', file]);
      if (file === 'first') await new Promise((resolve) => { release = resolve; });
      return { ...square, file, close() { events.push(['close', file]); } };
    };
    const progress = [];
    const pending = renderLayout(items, options, { onProgress(value) { progress.push(value); } });
    items[0].transform.zoom = 4;
    items[0].transform.panX = -1;
    items[1].transform.panY = -1;
    items.reverse();
    items[0].file = 'changed';
    items.splice(0);
    options.fit = 'cover';
    options.width = 900;
    options.background = '#ffffff';
    release();
    const result = await pending;
    assert.equal(result.width, 220);
    assert.equal(result.height, 120);
    assert.deepEqual(events, [['decode', 'first'], ['close', 'first'],
      ['decode', 'second'], ['close', 'second']]);
    assert.deepEqual(ctx.calls.filter((call) => call[0] === 'drawImage').map((call) => call[1].file),
      ['first', 'second']);
    assert.deepEqual(ctx.calls.filter((call) => call[0] === 'drawImage').map((call) => call.slice(2)),
      [[10, -90, 200, 200], [-90, 10, 300, 300]]);
    assert.deepEqual(ctx.calls.find((call) => call[0] === 'fillRect'),
      ['fillRect', '#123456', 0, 0, 220, 120]);
    assert.deepEqual(progress, [0.5, 1]);
  });
});

test('a transparent export leaves the gaps and margins unpainted', async () => {
  await withCanvas(async ({ ctx }) => {
    globalThis.createImageBitmap = async () => ({ ...square, close() {} });
    await renderLayout([{ ...square, file: null, transform: { zoom: 0.5 } }],
      { ...exportSettings, transparent: true });
    assert.equal(ctx.calls.some((call) => call[0] === 'fillRect'), false);
    assert.deepEqual(ctx.calls.find((call) => call[0] === 'drawImage').slice(2), [60, 60, 100, 100]);
  });
});

test('zooming out exposes the chosen export background around the smaller picture', async () => {
  await withCanvas(async ({ ctx }) => {
    globalThis.createImageBitmap = async () => ({ ...square, close() {} });
    await renderLayout([{ ...square, file: null, transform: { zoom: 0.5 } }], exportSettings);
    assert.deepEqual(ctx.calls.find((call) => call[0] === 'fillRect'),
      ['fillRect', '#123456', 0, 0, 220, 220]);
    assert.deepEqual(ctx.calls.find((call) => call[0] === 'drawImage').slice(2), [60, 60, 100, 100]);
  });
});

test('cancelling during the final decode closes the bitmap and discards the canvas', async () => {
  await withCanvas(async ({ ctx, canvas }) => {
    const controller = new AbortController();
    let closed = false;
    globalThis.createImageBitmap = async () => {
      controller.abort();
      return { ...square, close() { closed = true; } };
    };
    await assert.rejects(renderLayout([{ ...square, file: null }], exportSettings,
      { signal: controller.signal }), { name: 'AbortError' });
    assert.equal(closed, true);
    assert.equal(ctx.calls.some((call) => call[0] === 'drawImage'), false);
    assert.equal(canvas.width, 0);
    assert.equal(canvas.height, 0);
  });
});

test('cancelling after the last progress event publishes no result', async () => {
  await withCanvas(async () => {
    const controller = new AbortController();
    globalThis.createImageBitmap = async () => ({ ...square, close() {} });
    await assert.rejects(renderLayout([{ ...square, file: null }], exportSettings, {
      signal: controller.signal,
      onProgress() { controller.abort(); },
    }), { name: 'AbortError' });
  });
});
