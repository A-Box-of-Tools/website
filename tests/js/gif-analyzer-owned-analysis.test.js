/** Bounded drawing must preserve literal analysis and synchronous pixel contracts. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { GifWriter } from '../../tools/gif-maker/src/gif.js';
import { lzwEncode } from '../../tools/gif-maker/src/lzw.js';
import { parseGif } from '../../tools/gif-analyzer/src/gif.js';
import { lzwDecode, lzwSteps } from '../../tools/gif-analyzer/src/lzw.js';
import { Compositor, paintFrame, paintFrameSteps } from '../../tools/gif-analyzer/src/frames.js';
import { finishSteps, readSteps } from '../../tools/gif-analyzer/src/analysis-steps.js';
import { analysisMemory, thumbnailBytes, WORKING_LIMIT } from '../../tools/gif-analyzer/src/analysis-memory.js';
import { drawAnalysis, releaseDrawn } from '../../tools/gif-analyzer/src/draw-analysis.js';
import { findings } from '../../tools/gif-analyzer/src/findings.js';
import { budget } from '../../tools/gif-analyzer/src/budget.js';
import { report } from '../../tools/gif-analyzer/src/report.js';

const colors = Uint8Array.of(255, 0, 0, 0, 0, 255);
function file({ width = 2, height = 2, frames = 3, identical = false } = {}) {
  const writer = new GifWriter({ width, height, palette: colors });
  for (let index = 0; index < frames; index += 1) writer.addFrame({
    indices: new Uint8Array(width * height).fill(identical ? 0 : index % 2), delay: 8,
  });
  return writer.finalize();
}

function canvases(t, { failAt, abortAt, controller } = {}) {
  const original = { document: globalThis.document, ImageData: globalThis.ImageData };
  const created = [];
  globalThis.ImageData = class { constructor(data, width, height) { Object.assign(this, { data, width, height }); } };
  globalThis.document = { createElement(tag) {
    assert.equal(tag, 'canvas');
    const canvas = { width: 0, height: 0, style: {}, removed: false,
      setAttribute() {}, remove() { this.removed = true; },
      getContext() { return { putImageData() {}, drawImage() {} }; },
    };
    created.push(canvas);
    if (created.length === failAt) canvas.getContext = () => { throw new Error('native "quoted" [canvas]'); };
    if (created.length === abortAt) controller.abort();
    return canvas;
  } };
  t.after(() => {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete globalThis[key]; else globalThis[key] = value;
    }
  });
  return created;
}
const label = (key, index) => `${key}:${index}`;

for (const kind of ['ordinary', 'truncated', 'invalid']) test(`stepped LZW preserves ${kind} indices and diagnostics`, async () => {
  const pixels = Uint8Array.from({ length: 40_000 }, (_, index) => index % 2);
  const valid = lzwEncode(pixels, 2);
  const data = kind === 'truncated' ? valid.subarray(0, valid.length - 3)
    : kind === 'invalid' ? Uint8Array.of(0xff) : valid;
  let checkpoints = 0;
  const actual = await readSteps(lzwSteps(data, 2, pixels.length), async () => { checkpoints += 1; });
  assert.deepEqual(actual, lzwDecode(data, 2, pixels.length));
  if (kind === 'ordinary') { assert.deepEqual(actual.indices, pixels); assert.ok(checkpoints >= 4); }
});

test('transparent interlaced paint checkpoints without changing palette use or pixels', async () => {
  const frame = { width: 200, height: 100, interlaced: true, transparentIndex: 1 };
  const indices = Uint8Array.from({ length: 20_000 }, (_, index) => index % 3);
  const palette = { count: 2, colors };
  let checkpoints = 0;
  const actual = await readSteps(paintFrameSteps(frame, indices, palette), async () => { checkpoints += 1; });
  assert.deepEqual(actual, paintFrame(frame, indices, palette));
  assert.ok(checkpoints >= 2);
  assert.ok(actual.missing > 0);
  assert.equal(actual.used[1], 1);
});

test('stepped composition preserves clipped pixels, background and previous disposal', async () => {
  const synchronous = new Compositor(160, 100), stepped = new Compositor(160, 100);
  let checkpoints = 0;
  for (const disposal of [1, 3, 2, 1]) {
    const frame = { left: 10, top: 5, width: 160, height: 100, disposal };
    const rgba = new Uint8ClampedArray(160 * 100 * 4);
    for (let at = 0; at < rgba.length; at += 4) { rgba[at] = disposal; rgba[at + 3] = at % 12 ? 255 : 0; }
    assert.deepEqual(await readSteps(stepped.drawSteps(frame, rgba), async () => { checkpoints += 1; }), synchronous.draw(frame, rgba));
    assert.deepEqual(stepped.pixels, synchronous.pixels);
    assert.equal(stepped.saved, null);
  }
  assert.ok(checkpoints >= 4);
});

test('checkpoint rejection retires the generator before further pixel work', async () => {
  let completed = false, closed = false;
  function* steps() { try { yield; completed = true; return 1; } finally { closed = true; } }
  const failure = new Error('cancelled');
  await assert.rejects(readSteps(steps(), async () => { throw failure; }), error => error === failure);
  assert.equal(completed, false); assert.equal(closed, true);
  assert.equal(finishSteps((function* () { yield; return 7; })()), 7);
});

test('known buffer planning includes disposal replacement, patch scratch and retained thumbnails', () => {
  const gif = { width: 3, height: 2 }, frame = { width: 2, height: 3, payloadBytes: 5 };
  const base = 5 * 3 * 2 * 4 + 10 + 20 + 32768;
  assert.equal(analysisMemory(gif, 10, { retainedBytes: 20 }).bytes, base);
  const extra = 2 * 2 * 3 * 4 + 6 + 5 + 3 * 4 + 2 * 3 * 4 + 3 * 2 * 4 + 256;
  assert.equal(analysisMemory(gif, 10, { frame, retainedBytes: 20 }).bytes, base + extra);
  assert.equal(analysisMemory(gif, 10, { frame, retainedBytes: 20, limitBytes: base + extra }).fits, true);
  assert.equal(analysisMemory(gif, 10, { frame, retainedBytes: 20, limitBytes: base + extra - 1 }).fits, false);
  assert.equal(thumbnailBytes(600, 300), 120 * 60 * 4);
  assert.equal(thumbnailBytes(2, 1), 2 * 1 * 4);
});

test('huge or invalid logical screens refuse before compositor allocation', async t => {
  const created = canvases(t), bytes = file(), gif = parseGif(bytes);
  gif.width = gif.height = 65535;
  const result = await drawAnalysis(gif, bytes, { label });
  assert.equal(result.reason.key, 'drawing.memory');
  assert.deepEqual(result.drawn, [null, null, null]);
  assert.equal(created.length, 0);
  assert.equal(analysisMemory({ width: Number.MAX_SAFE_INTEGER, height: 2 }, 0).fits, false);
  assert.equal(analysisMemory({ width: 1, height: 1 }, -1).reason, 'invalid');
  assert.equal(analysisMemory({ width: 1, height: 1 }, 0, { retainedBytes: Number.MAX_SAFE_INTEGER }).fits, false);
  assert.equal(analysisMemory({ width: 1, height: 1 }, 0, { limitBytes: NaN }).fits, false);
  assert.equal(analysisMemory({ width: 1, height: 1 }, WORKING_LIMIT).fits, false);
});

test('one refused dependency never resumes a smaller later patch', async t => {
  const created = canvases(t), bytes = file(), gif = parseGif(bytes);
  gif.frames[0].width = gif.frames[0].height = 1;
  gif.frames[2].width = gif.frames[2].height = 1;
  const result = await drawAnalysis(gif, bytes, { label, pixelBudget: 2 });
  assert.equal(result.reason.key, 'drawing.pixels');
  assert.deepEqual(result.drawn.map(Boolean), [true, false, false]);
  assert.equal(created.length, 2);
  assert.equal(gif.frames.length, 3);
  releaseDrawn(result.drawn);
  assert.ok(created.every(canvas => !canvas.width && !canvas.height && canvas.removed));
});

test('a patch is refused before its indices and temporary canvases allocate', async t => {
  const created = canvases(t), bytes = file({ width: 128, height: 128, frames: 1 }), gif = parseGif(bytes);
  const limitBytes = analysisMemory(gif, bytes.length).bytes;
  assert.equal(analysisMemory(gif, bytes.length, { frame: gif.frames[0], limitBytes }).fits, false);
  const result = await drawAnalysis(gif, bytes, { label, limitBytes });
  assert.equal(result.reason.key, 'drawing.memory');
  assert.deepEqual(result.drawn, [null]);
  assert.equal(created.length, 0);
});

test('Cancel preserves committed prefix and closes an uncommitted matching frame', async t => {
  const controller = new AbortController(), created = canvases(t, { controller, abortAt: 3 });
  const bytes = file({ identical: true }), gif = parseGif(bytes);
  const result = await drawAnalysis(gif, bytes, { label, signal: controller.signal });
  assert.equal(result.reason.key, 'drawing.cancelled');
  assert.deepEqual(result.drawn.map(Boolean), [true, false, false]);
  assert.equal(result.identical, 0);
  assert.equal(created[2].width, 0); assert.equal(created[2].height, 0);
  assert.ok(created[0].width > 0);
  releaseDrawn(result.drawn);
  assert.ok(created.every(canvas => !canvas.width && !canvas.height));
});

test('Cancel after the last committed frame does not label complete metrics as partial', async t => {
  const created = canvases(t), controller = new AbortController();
  const bytes = file(), gif = parseGif(bytes);
  const result = await drawAnalysis(gif, bytes, { label, signal: controller.signal,
    onProgress({ done, total }) { if (done === total) controller.abort(); },
  });
  assert.equal(result.reason, null);
  assert.ok(result.drawn.every(Boolean));
  releaseDrawn(result.drawn);
  assert.ok(created.every(canvas => !canvas.width && !canvas.height));
});

test('native thumbnail failure closes pending scratch and prior result backing stores', async t => {
  const created = canvases(t, { failAt: 5 });
  const bytes = file({ width: 160, height: 160 }), gif = parseGif(bytes);
  await assert.rejects(drawAnalysis(gif, bytes, { label }), /native "quoted"/);
  assert.ok(created.length >= 5);
  assert.ok(created.every(canvas => !canvas.width && !canvas.height));
});

test('incomplete drawing does not invent complete-file pixel totals or aggregate findings', () => {
  const gif = parseGif(file()), decoded = [ { clears: 100 }, null, null ];
  const partial = findings(gif, { decoded, complete: false, identical: 1 });
  assert.equal(partial.some(finding => /find\.(clears|identical|colors|waste)\./.test(finding.title)), false);
  assert.ok(partial.some(finding => finding.title === 'find.allfull.title'));
  const view = { name: 'source.gif', budget: budget(gif), findings: [], colors: 2 };
  const t = (key, values = {}) => `${key} ${Object.entries(values).map(([name, value]) => `${name}=${value}`).join(' ')}`;
  assert.equal(report(gif, { ...view, drawing: { reason: null, drawn: 3, total: 3 } }, t), report(gif, view, t));
  const text = report(gif, { ...view, colors: undefined,
    drawing: { reason: { key: 'drawing.cancelled', values: {} }, drawn: 1, total: 3 } }, t);
  assert.match(text, /report\.drawing/); assert.match(text, /drawn=1 total=3/);
  assert.match(text, /drawing\.cancelled/); assert.match(text, /report\.frametable/);
  assert.doesNotMatch(text, /report\.drawn/);
});
