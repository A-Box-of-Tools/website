/**
 * tools/gif-maker/src/quantize.js and src/compose.js - the two decisions made
 * before a single byte of the file is written: how big the frame is, and which
 * 256 colours are in it.
 *
 * The palette tests pin properties rather than exact tables. Which colours a
 * median cut arrives at is an implementation detail that a better split rule
 * would be entitled to change, and a test asserting the current answer would
 * fail on an improvement while catching nothing that matters. What matters is
 * this:
 *
 *   - a picture that already fits in the palette comes back exactly
 *   - the table never has more colours in it than were asked for
 *   - no pixel is ever mapped to an index outside it, or to a reserved one
 *   - the average error over a gradient stays small, which a broken split
 *     rule blows through immediately
 *
 * Nothing here needs a canvas: the quantizer takes RGBA in and gives indices
 * back, and the size maths is arithmetic over the dimensions the images
 * reported.
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
  createHistogram, addToHistogram, buildPalette, mapFrame, ALPHA_CUTOFF,
} from '../../tools/gif-maker/src/quantize.js';
import { resolveOutputSize, naturalBox, MAX_SIDE } from '../../tools/gif-maker/src/compose.js';

/* ---------------------------------------------------------------- fixtures */

/** RGBA from a function of x and y. */
function image(width, height, at) {
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const [r, g, b, a = 255] = at(x, y);
      const to = (y * width + x) * 4;
      data[to] = r;
      data[to + 1] = g;
      data[to + 2] = b;
      data[to + 3] = a;
    }
  }
  return data;
}

/** The colour a mapped pixel ends up being, back out of the table. */
const colourAt = (palette, index) => [
  palette[index * 3], palette[index * 3 + 1], palette[index * 3 + 2],
];

const paletteFor = (rgba, colours, keepTransparent = false) =>
  buildPalette(addToHistogram(createHistogram(), rgba, keepTransparent), colours);

/**
 * Colours that are far enough apart to land in different 15-bit histogram bins
 * whatever rounding happens, so "eight distinct colours" really is eight.
 */
const EIGHT = [
  [0, 0, 0], [255, 255, 255], [232, 16, 16], [16, 232, 16],
  [16, 16, 232], [232, 232, 16], [232, 16, 232], [16, 232, 232],
];

/* ------------------------------------------------------------- the palette */

test('a picture with fewer colours than the palette comes back exactly', () => {
  const rgba = image(16, 16, (x, y) => EIGHT[(x + y * 3) % EIGHT.length]);
  const palette = paletteFor(rgba, 256);

  assert.equal(palette.length / 3, EIGHT.length);

  const indices = mapFrame(rgba, 16, 16, palette, { dither: false });
  for (let p = 0; p < indices.length; p += 1) {
    assert.deepEqual(
      colourAt(palette, indices[p]),
      [rgba[p * 4], rgba[p * 4 + 1], rgba[p * 4 + 2]],
    );
  }
});

test('the same holds with dithering on, because there is no error to spread', () => {
  const rgba = image(16, 16, (x, y) => EIGHT[(x * 5 + y) % EIGHT.length]);
  const palette = paletteFor(rgba, 256);
  const indices = mapFrame(rgba, 16, 16, palette, { dither: true });

  for (let p = 0; p < indices.length; p += 1) {
    assert.deepEqual(
      colourAt(palette, indices[p]),
      [rgba[p * 4], rgba[p * 4 + 1], rgba[p * 4 + 2]],
    );
  }
});

test('a table never holds more colours than were asked for', () => {
  // A gradient over far more distinct colours than any of these limits.
  const rgba = image(64, 64, (x, y) => [x * 4, y * 4, (x + y) * 2]);

  for (const limit of [2, 8, 32, 64, 128, 256]) {
    const palette = paletteFor(rgba, limit);
    assert.ok(palette.length / 3 <= limit, `${palette.length / 3} colours for a limit of ${limit}`);
    assert.ok(palette.length / 3 >= Math.min(limit, 2), 'and is not empty');
  }
});

test('every index is inside the table', () => {
  const rgba = image(48, 48, (x, y) => [x * 5, 255 - y * 5, (x * y) % 256]);
  const palette = paletteFor(rgba, 64);
  const entries = palette.length / 3;

  for (const dither of [false, true]) {
    const indices = mapFrame(rgba, 48, 48, palette, { dither });
    for (const index of indices) assert.ok(index < entries, `index ${index} of ${entries}`);
  }
});

test('a frame of nothing but transparency still gets a table', () => {
  // The format has no way to say "no colours", so this has to be a table rather
  // than an empty one - and a writer handed an empty one would produce a file
  // no decoder accepts.
  const rgba = image(4, 4, () => [0, 0, 0, 0]);
  const palette = paletteFor(rgba, 256, true);
  assert.equal(palette.length, 3);
});

test('transparent pixels do not get a vote in the palette', () => {
  // Nine tenths of this picture is transparent black. If those pixels counted,
  // a two-colour palette would spend an entry on black; they do not, so both
  // entries go to the red the picture is actually made of.
  const rgba = image(10, 10, (x) => (x === 0 ? [255, 32, 32, 255] : [0, 0, 0, 0]));

  const withAlpha = paletteFor(rgba, 2, true);
  assert.equal(withAlpha.length / 3, 1, 'one colour, because only one is drawn');
  assert.deepEqual(colourAt(withAlpha, 0), [255, 32, 32]);

  const ignoringAlpha = paletteFor(rgba, 2, false);
  assert.equal(ignoringAlpha.length / 3, 2, 'and both, when alpha is being flattened away');
});

test('the histogram counts the pixels it kept', () => {
  const rgba = image(10, 10, (x) => (x < 4 ? [10, 20, 30, 255] : [10, 20, 30, 0]));

  assert.equal(addToHistogram(createHistogram(), rgba, true).pixels, 40);
  assert.equal(addToHistogram(createHistogram(), rgba, false).pixels, 100);
});

test('alpha exactly at the cutoff is opaque', () => {
  const at = (alpha) => addToHistogram(
    createHistogram(),
    image(1, 1, () => [10, 20, 30, alpha]),
    true,
  ).pixels;

  assert.equal(at(ALPHA_CUTOFF), 1);
  assert.equal(at(ALPHA_CUTOFF - 1), 0);
});

/* ------------------------------------------------------- reserved entries */

test('a reserved entry is never chosen for a pixel that is drawn', () => {
  // This is how transparency is written: index 0 is the transparent one, and
  // `from: 1` is what keeps an opaque pixel out of it. A mapper that ignored
  // `from` would produce a GIF with holes punched through the picture wherever
  // black happened to be the nearest colour.
  const rgba = image(24, 24, (x, y) => [x * 10, y * 10, 0, x === 0 ? 0 : 255]);

  const colours = paletteFor(rgba, 16, true);
  const palette = new Uint8Array(colours.length + 3);
  palette.set(colours, 3); // entry 0 stays black, and is the transparent one

  for (const dither of [false, true]) {
    const indices = mapFrame(rgba, 24, 24, palette, {
      dither, from: 1, transparentIndex: 0,
    });

    for (let p = 0; p < indices.length; p += 1) {
      const transparent = rgba[p * 4 + 3] < ALPHA_CUTOFF;
      if (transparent) assert.equal(indices[p], 0);
      else assert.ok(indices[p] >= 1, 'an opaque pixel took the reserved index');
    }
  }
});

/* --------------------------------------------------------------- the error */

/** Mean absolute error per channel between a picture and its quantized self. */
function meanError(rgba, width, height, palette, dither) {
  const indices = mapFrame(rgba, width, height, palette, { dither });
  let total = 0;
  for (let p = 0; p < indices.length; p += 1) {
    const [r, g, b] = colourAt(palette, indices[p]);
    total += Math.abs(r - rgba[p * 4]) + Math.abs(g - rgba[p * 4 + 1]) + Math.abs(b - rgba[p * 4 + 2]);
  }
  return total / (indices.length * 3);
}

test('256 colours over a photograph-like gradient stay close to the original', () => {
  const width = 96;
  const height = 96;
  const rgba = image(width, height, (x, y) => [
    Math.round(x * 255 / width),
    Math.round(y * 255 / height),
    Math.round(((x + y) * 255) / (width + height)),
  ]);

  const palette = paletteFor(rgba, 256);
  const error = meanError(rgba, width, height, palette, false);

  // A working median cut lands well under two levels out of 255 here. A split
  // rule that had stopped dividing the busy boxes - the failure that leaves a
  // palette technically full and practically useless - is an order of magnitude
  // worse than this, so the threshold does not have to be tight to catch it.
  assert.ok(error < 4, `mean error ${error.toFixed(2)} is too high for 256 colours`);
});

test('dithering trades a little error for the banding it removes', () => {
  // Eight colours over a smooth ramp is the case dithering exists for. It does
  // not reduce the per-pixel error - it is not meant to - so what is asserted
  // is that it stays in the same range rather than falling apart, and that the
  // two paths really are doing different things.
  const width = 64;
  const height = 32;
  const rgba = image(width, height, (x) => {
    const value = Math.round(x * 255 / (width - 1));
    return [value, value, value];
  });

  const palette = paletteFor(rgba, 8);
  const flat = meanError(rgba, width, height, palette, false);
  const dithered = meanError(rgba, width, height, palette, true);

  assert.ok(dithered < flat * 2.5, `dithering made it ${(dithered / flat).toFixed(2)}x worse`);

  const a = mapFrame(rgba, width, height, palette, { dither: false });
  const b = mapFrame(rgba, width, height, palette, { dither: true });
  assert.notDeepEqual(a, b, 'the dithered path produced the same thing as the flat one');
});

/* ------------------------------------------------------------ the frame size */

const sized = (...pairs) => pairs.map(([width, height]) => ({ width, height }));

test('the frame box takes the widest width and the tallest height', () => {
  // Independently, so a set holding one landscape and one portrait resolves to
  // a square and neither is cropped harder than the other.
  assert.deepEqual(naturalBox(sized([4000, 3000], [3000, 4000])), { width: 4000, height: 4000 });
  assert.deepEqual(naturalBox([]), { width: 480, height: 270 });
});

test('a preset is a long edge, and the shape comes from the images', () => {
  const items = sized([1600, 900]);
  assert.deepEqual(resolveOutputSize('480', items), { width: 480, height: 270 });
  assert.deepEqual(resolveOutputSize('320', items), { width: 320, height: 180 });

  const portrait = sized([900, 1600]);
  assert.deepEqual(resolveOutputSize('480', portrait), { width: 270, height: 480 });
});

test('a preset never scales a small picture up', () => {
  assert.deepEqual(resolveOutputSize('640', sized([200, 100])), { width: 200, height: 100 });
});

test('"match the images" is still capped', () => {
  const { width, height } = resolveOutputSize('original', sized([6000, 3000]));
  assert.equal(width, MAX_SIDE);
  assert.equal(height, MAX_SIDE / 2);
});

test('a custom size is clamped rather than refused', () => {
  assert.deepEqual(
    resolveOutputSize('custom', [], { width: 9000, height: 1 }),
    { width: MAX_SIDE, height: 16 },
  );
  assert.deepEqual(
    resolveOutputSize('custom', [], { width: 0, height: 0 }),
    { width: 480, height: 270 },
  );
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
