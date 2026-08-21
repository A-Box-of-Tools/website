/**
 * tools/video-to-gif/src/quantize.js - choosing 256 colours, and using them.
 *
 * Quantization has no right answer to compare against, so what is pinned here
 * is the set of properties the rest of the tool depends on:
 *
 *   - a clip with fewer colours than the palette holds keeps them exactly;
 *   - the palette never comes back larger than it was asked for, because the
 *     255th entry is the last one there is room for once the transparent marker
 *     has its place;
 *   - the mapping picks the nearest entry, and keeps picking the same one, since
 *     it is cached after the first look;
 *   - **the dither is positional** - the same pixel at the same place quantizes
 *     the same way in every frame. That is not a nicety. Frame differencing
 *     compares indices, so a dither that depended on the pixels around it would
 *     make every frame differ everywhere, and the file would be several times
 *     the size for no visible gain.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ColorHistogram, Palette, medianCut, amplitudeFor, quantizeFrame,
} from '../../tools/video-to-gif/src/quantize.js';

/** A frame of solid colour blocks, four bytes a pixel. */
function frameOf(colors) {
  const rgba = new Uint8ClampedArray(colors.length * 4);
  colors.forEach(([r, g, b], i) => {
    rgba[i * 4] = r;
    rgba[i * 4 + 1] = g;
    rgba[i * 4 + 2] = b;
    rgba[i * 4 + 3] = 255;
  });
  return rgba;
}

const triples = (palette) => {
  const out = [];
  for (let i = 0; i < palette.length; i += 3) out.push([palette[i], palette[i + 1], palette[i + 2]]);
  return out.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
};

test('the histogram counts every frame it is given', () => {
  const histogram = new ColorHistogram();
  histogram.add(frameOf([[10, 20, 30], [10, 20, 30]]));
  histogram.add(frameOf([[200, 100, 0]]));
  assert.equal(histogram.pixels, 3);
});

test('stepping counts fewer pixels but still sees the colours', () => {
  const histogram = new ColorHistogram();
  histogram.add(frameOf(Array.from({ length: 100 }, () => [8, 16, 24])), 4);
  assert.equal(histogram.pixels, 25);
});

test('a clip with fewer colours than the palette holds keeps them exactly', () => {
  const colors = [[0, 0, 0], [255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 255, 255]];
  const histogram = new ColorHistogram();
  histogram.add(frameOf(colors));

  const palette = medianCut(histogram, 255);
  assert.equal(palette.length / 3, colors.length);
  assert.deepEqual(triples(palette), colors.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]));
});

test('the palette never comes back larger than it was asked for', () => {
  const histogram = new ColorHistogram();
  // A gradient with far more distinct colours than any palette could hold.
  const colors = [];
  for (let r = 0; r < 256; r += 4) {
    for (let g = 0; g < 256; g += 8) colors.push([r, g, (r + g) & 0xff]);
  }
  histogram.add(frameOf(colors));

  for (const limit of [2, 16, 64, 255]) {
    const palette = medianCut(histogram, limit);
    assert.ok(palette.length / 3 <= limit, `asked for ${limit}, got ${palette.length / 3}`);
    assert.ok(palette.length / 3 >= Math.min(limit, 2));
  }
});

test('a colour the clip never used still maps to the nearest one it did', () => {
  const palette = new Palette(Uint8Array.from([0, 0, 0, 255, 255, 255, 255, 0, 0]));
  assert.equal(palette.indexOf(8, 8, 8), 0);
  assert.equal(palette.indexOf(240, 250, 240), 1);
  assert.equal(palette.indexOf(200, 20, 20), 2);
  // Twice, because the second answer comes from the cache rather than the search.
  assert.equal(palette.indexOf(200, 20, 20), 2);
});

test('the dither amplitude follows how far apart the palette is', () => {
  const dense = new Uint8Array(60);
  for (let i = 0; i < 20; i += 1) dense[i * 3] = i;          // greys two apart
  const sparse = Uint8Array.from([0, 0, 0, 255, 255, 255]);

  assert.ok(amplitudeFor(dense) < amplitudeFor(sparse));
  assert.equal(amplitudeFor(new Uint8Array([1, 2, 3])), 0, 'one colour cannot be dithered towards anything');
});

test('the same pixel in two different frames quantizes the same way', () => {
  const histogram = new ColorHistogram();
  const gradient = Array.from({ length: 64 }, (_, i) => [i * 4, 128, 255 - i * 4]);
  histogram.add(frameOf(gradient));

  const palette = new Palette(medianCut(histogram, 8));
  const amplitude = amplitudeFor(palette.rgb);
  assert.ok(amplitude > 0, 'the fixture is meant to be coarse enough to dither');

  const first = frameOf(gradient);
  const second = frameOf(gradient);
  // One pixel differs, in the corner. Under error diffusion this would change
  // the answer for every pixel after it.
  second[4 * 40] = 0;
  second[4 * 40 + 1] = 0;
  second[4 * 40 + 2] = 0;

  const a = quantizeFrame(first, 8, 8, palette, amplitude);
  const b = quantizeFrame(second, 8, 8, palette, amplitude);

  let differences = 0;
  for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) differences += 1;
  assert.equal(differences, 1, 'one pixel changed, so exactly one index changed');
});

test('dithering off is a straight nearest-colour mapping', () => {
  const palette = new Palette(Uint8Array.from([0, 0, 0, 255, 255, 255]));
  const rgba = frameOf([[10, 10, 10], [250, 250, 250], [130, 130, 130]]);
  assert.deepEqual(Array.from(quantizeFrame(rgba, 3, 1, palette, 0)), [0, 1, 1]);
});

test('a buffer handed in is the one written to', () => {
  const palette = new Palette(Uint8Array.from([0, 0, 0, 255, 255, 255]));
  const into = new Uint8Array(2);
  const out = quantizeFrame(frameOf([[0, 0, 0], [255, 255, 255]]), 2, 1, palette, 0, into);
  assert.equal(out, into);
  assert.deepEqual(Array.from(into), [0, 1]);
});
