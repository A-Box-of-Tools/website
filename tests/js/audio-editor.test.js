import test from 'node:test';
import assert from 'node:assert/strict';
import { parseEditNumber, previewSource } from '../../tools/edit-audio/src/controls.js';
import { render } from '../../tools/edit-audio/src/edit.js';
import { reverse, applyGain, peak } from '../../tools/edit-audio/src/effects.js';
import { writeWav } from '../../shared/js/wav.js';
import { writeWavAsync } from '../../shared/js/wav-async.js';

const source = (values, sampleRate = 8000) => ({ channels: [Float32Array.from(values)],
  sampleRate, frames: values.length, duration: values.length / sampleRate });
const settings = (extra = {}) => ({ reverse: false, speed: 1, keepPitch: true,
  volume: { mode: 'gain', db: 0 }, ...extra });

test('edit entries accept dot or comma decimals and the expected suffix without changing magnitude', () => {
  for (const [text, kind, expected] of [['1,5', 'speed', 1.5], ['1.5x', 'speed', 1.5],
    [' 0,25 × ', 'speed', 0.25], ['4', 'speed', 4], ['+1,5 dB', 'volume', 1.5],
    ['−24', 'volume', -24], ['.75', 'speed', 0.75], ['1.25', 'volume', 1.25],
    ['-0,5dB', 'volume', -0.5], ['+24', 'volume', 24]]) {
    assert.equal(parseEditNumber(text, kind), expected, text);
  }
});

test('edit entries refuse grouping mixed separators stray characters excessive precision and limits', () => {
  for (const text of ['', ' ', '1,234', '1.000', '1,5.0', '1 5', '1e2', 'abc1.5',
    '1xjunk', '1..5', '++1', 'Infinity', 'NaN', '1/2', '1\n5']) {
    assert.equal(parseEditNumber(text, 'speed'), null, text);
    assert.equal(parseEditNumber(text, 'volume'), null, text);
  }
  for (const text of ['0', '-1', '0.24', '4.01', '15', '1dB']) assert.equal(parseEditNumber(text, 'speed'), null);
  for (const text of ['-24.01', '24.01', '1x']) assert.equal(parseEditNumber(text, 'volume'), null);
});

test('preview picks at most five source seconds from the original playhead and refuses EOF', () => {
  const input = source(Array.from({ length: 80 }, (_, i) => i / 100), 4);
  const excerpt = previewSource(input, 12.125);
  assert.equal(excerpt.from, 48); assert.equal(excerpt.to, 68);
  assert.equal(excerpt.source.frames, 20); assert.equal(excerpt.source.duration, 5);
  assert.deepEqual([...excerpt.source.channels[0]], [...input.channels[0].slice(48, 68)]);
  assert.equal(previewSource(input, 19.75).source.frames, 1);
  assert.equal(previewSource(input, 20), null); assert.equal(previewSource(input, 100), null);
  assert.equal(previewSource(input, -1).from, 0); assert.equal(previewSource(input, NaN).from, 0);
});

test('rendering a reversed preview leaves the complete source and other excerpts unchanged', async () => {
  const input = source(Array.from({ length: 800 }, (_, i) => Math.sin(i) / 2), 80);
  const original = input.channels[0].slice();
  const excerpt = previewSource(input, 2.125);
  const edited = await render(excerpt.source, settings({ reverse: true }));
  assert.deepEqual(edited.channels[0], original.slice(excerpt.from, excerpt.to).reverse());
  assert.deepEqual(input.channels[0], original);
  assert.equal(edited.channels[0].length, 400);
});

test('cooperative render preserves untouched float samples peak clipping and synchronous WAV bytes', async () => {
  const input = source([0, -0, 0.2, -0.5, 1, -1, 1.5, -1.25]);
  const edited = await render(input, settings());
  assert.notEqual(edited.channels[0], input.channels[0]);
  assert.deepEqual(edited.channels[0], input.channels[0]);
  assert.equal(edited.peak, 1.5); assert.equal(edited.clipped, 2); assert.equal(edited.gain, 1);
  for (const bits of [16, 32]) {
    assert.deepEqual(new Uint8Array(await (await writeWavAsync(edited.channels, 8000, { bits })).arrayBuffer()),
      new Uint8Array(await writeWav(input.channels, 8000, { bits }).arrayBuffer()));
  }
});

test('cooperative reverse and gain retain Float32 stores and pre-store product measurements', async () => {
  const input = source([0.25, -0.5, 0.75, -1]);
  const gain = 1.00000003;
  const expected = input.channels[0].slice().reverse();
  const db = 20 * Math.log10(gain);
  const applied = 10 ** (db / 20);
  const result = await render(input, settings({ reverse: true, volume: { mode: 'gain', db } }));
  for (let i = 0; i < expected.length; i += 1) expected[i] *= applied;
  assert.deepEqual(result.channels[0], expected);
  assert.equal(result.peak, applied); assert.equal(result.clipped, 1);
  assert.equal(Math.abs(result.channels[0][0]), 1, 'the reported overshoot predates the Float32 rounding');
  assert.deepEqual([...input.channels[0]], [0.25, -0.5, 0.75, -1]);
});

test('normalization measures the edited samples before applying the target gain', async () => {
  const input = source([0.125, -0.5, 0.25]);
  const result = await render(input, settings({ reverse: true, volume: { mode: 'normalize', db: -1 } }));
  const gain = 10 ** (-1 / 20) / 0.5;
  assert.equal(result.gain, gain); assert.equal(result.peak, 10 ** (-1 / 20));
  assert.equal(result.clipped, 0);
  assert.deepEqual(result.channels[0], Float32Array.from([0.25 * gain, -0.5 * gain, 0.125 * gain]));
});

test('synchronous effects retain the same products and order after range factoring', () => {
  const input = Float32Array.from([0.2, -0.8, 1.125, -0.25, 0]);
  const original = input.slice();
  reverse([input]);
  const gain = 1.4;
  const expected = Float32Array.from([...original].reverse().map((x) => x * gain));
  const products = [...original].map((x) => x * gain);
  const stats = applyGain([input], gain);
  assert.deepEqual(input, expected);
  assert.equal(stats.peak, Math.max(...products.map(Math.abs)));
  assert.equal(stats.clipped, products.filter((x) => Math.abs(x) > 1).length);
  assert.equal(peak([input]), Math.max(...expected.map(Math.abs)));
});

for (const [label, minimum] of [['step.copying', 0], ['step.reversing', 0], ['step.level', 0.97], ['step.writing', 1]]) {
  test(`cooperative rendering cancels at ${label} before offering samples`, async () => {
    const input = source(Array.from({ length: 32768 }, (_, i) => Math.sin(i)));
    const original = input.channels[0].slice();
    const controller = new AbortController();
    await assert.rejects(render(input, settings({ reverse: true, volume: { mode: 'gain', db: 6 } }), {
      signal: controller.signal, budgetMs: 0,
      onProgress(done, step) { if (step === label && done >= minimum) controller.abort(); },
    }), { name: 'AbortError' });
    assert.deepEqual(input.channels[0], original);
  });
}
