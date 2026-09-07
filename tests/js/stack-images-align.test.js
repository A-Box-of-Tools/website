/**
 * tools/stack-images/src/align.js - finding how far a frame moved.
 *
 * THE SIGN IS THE POINT OF THIS FILE
 *
 * Phase correlation reports an offset, and there are two opposite things that
 * offset can mean: how far the frame moved, or how far it has to be moved back.
 * Both read perfectly well in a comment, the arithmetic to get from one to the
 * other is a minus sign, and getting it backwards does not throw, does not warn
 * and does not look wrong in code review - it produces a stack that is blurred
 * by exactly twice the camera shake instead of by none of it, which looks like
 * the alignment simply not working very well.
 *
 * So the convention is pinned here, against a shift this file created and
 * therefore knows: `estimate` returns what has to be applied to the frame to
 * land it on the reference. The first test is exact, over a circular shift with
 * no windowing, so it can be asserted to within a rounding error rather than
 * within a tolerance that would hide a sign error of half a pixel.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ALIGN_MODES, MAX_ROTATION, NO_MOVE, N_MAX, P_MAX,
  estimate, isMeasured, logPolar, logSpectrum, phaseCorrelate, rotateScale, window2d,
} from '../../tools/stack-images/src/align.js';

const close = (actual, expected, tolerance, what) => assert.ok(
  Math.abs(actual - expected) <= tolerance,
  `${what}: ${actual} is not within ${tolerance} of ${expected}`,
);

/**
 * A picture with enough structure at enough orientations to correlate,
 * sampled `dx`, `dy` pixels over when asked - a shift by any real amount,
 * exact because the scene is defined at every coordinate.
 */
function field(size, fn, dx = 0, dy = 0) {
  const centre = (size - 1) / 2;
  const out = new Float64Array(size * size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      out[y * size + x] = fn(x - centre - dx, y - centre - dy);
    }
  }
  return out;
}

/**
 * A photograph is broadband: it has detail at every size and in every
 * direction. A fixture made of a few sinusoids is not, and it is the wrong test
 * subject here - phase correlation divides by the magnitude of each frequency,
 * so a picture that put nothing into most of them is all rounding error by the
 * time it reaches the peak search. So the scene below is value noise over three
 * octaves: smooth, defined at any real coordinate so it can be rotated and
 * scaled exactly rather than resampled, and full of structure at every scale.
 */
function hash(i, j) {
  let h = Math.imul(i | 0, 374761393) + Math.imul(j | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function octave(u, v, cell) {
  const x = u / cell;
  const y = v / cell;
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const top = hash(i, j) * (1 - sx) + hash(i + 1, j) * sx;
  const bottom = hash(i, j + 1) * (1 - sx) + hash(i + 1, j + 1) * sx;
  return top * (1 - sy) + bottom * sy;
}

const scene = (u, v) => (
  90 * octave(u, v, 13)
  + 60 * octave(u + 100, v - 60, 5)
  + 35 * octave(u - 40, v + 25, 2.2)
);

/**
 * The same scene without its two finer octaves: a wall in soft light, a sky
 * with some cloud in it. Everything the correlation has to hold onto is
 * thirteen pixels across or larger, so the peak is broad and the noise is not.
 */
const lowScene = (u, v) => 90 * octave(u, v, 13);

/**
 * A different picture, on lattices that share no pitch with the first. Two
 * value-noise scenes on the same lattice are not unrelated - the whitened
 * correlation finds the lattice - and that was the first version of this.
 */
const otherScene = (u, v) => (
  90 * octave(u + 1000, v + 777, 11.3)
  + 60 * octave(u - 300, v + 60, 4.7)
  + 35 * octave(u + 40, v - 25, 1.9)
);

/** A featureless frame: nothing in it but a slope. */
const gradient = (u, v) => 100 + 0.3 * u + 0.15 * v;

/** A different wall: the low-texture octave of otherScene, on its own. */
const otherLow = (u, v) => 90 * octave(u + 1000, v + 777, 11.3);

/**
 * A clear sky as the survey square sees it: a slope of about sixty levels
 * across the whole square, which is what a 3000-pixel gradient with twelve
 * per cent noise comes down to after the JPEG and the resize, with one per
 * cent of noise left on it. Rounded to 8 bits below, because that is what
 * getImageData does and the banding it leaves is what correlates.
 */
const diagonal = (u, v) => 150 + 0.15 * u + 0.09 * v;
const horizontal = (u, v) => 150 + 0.235 * u;

/** A night sky: small bright spots on a dark ground, a few hundred unless asked. */
function starField(size, count = 300) {
  let state = 99;
  const next = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const stars = [];
  for (let i = 0; i < count; i += 1) {
    stars.push({
      x: (next() - 0.5) * size, y: (next() - 0.5) * size,
      brightness: 60 + 190 * next(), spread: 0.8 + 1.2 * next(),
    });
  }
  return (u, v) => {
    let out = 8;
    for (const star of stars) {
      const d2 = (u - star.x) ** 2 + (v - star.y) ** 2;
      if (d2 < 30) out += star.brightness * Math.exp(-d2 / (2 * star.spread ** 2));
    }
    return Math.min(255, out);
  };
}

/**
 * Gaussian noise of a given deviation, from a seeded generator so that the
 * numbers recorded beside the assertions below are the numbers a run sees.
 * Each frame gets its own seed: the noise on one frame must not correlate with
 * the noise on the other, or the noise itself is a feature at zero shift.
 */
function noisy(values, sigma, seed) {
  let state = seed >>> 0;
  const next = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  for (let i = 0; i < values.length; i += 1) {
    values[i] += sigma * Math.sqrt(-2 * Math.log(1 - next())) * Math.cos(2 * Math.PI * next());
  }
  return values;
}

/**
 * What a JPEG does to a square: the 8x8 DCT of every block quantised with
 * the standard luminance table at quality `q` and transformed back. The
 * block grid it leaves is the feature every JPEG frame of a burst shares.
 */
const LUMA_TABLE = [
  16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55,
  14, 13, 16, 24, 40, 57, 69, 56, 14, 17, 22, 29, 51, 87, 80, 62,
  18, 22, 37, 56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113, 92,
  49, 64, 78, 87, 103, 121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99,
];
function jpeg(values, size, q) {
  const scale = q < 50 ? 5000 / q : 200 - 2 * q;
  const table = LUMA_TABLE.map((t) => Math.max(1, Math.floor((t * scale + 50) / 100)));
  const c = (k) => (k === 0 ? Math.SQRT1_2 : 1);
  const cosine = [];
  for (let x = 0; x < 8; x += 1) {
    cosine[x] = [];
    for (let k = 0; k < 8; k += 1) cosine[x][k] = Math.cos(((2 * x + 1) * k * Math.PI) / 16);
  }
  const out = new Float64Array(size * size);
  const coefficient = new Float64Array(64);
  for (let by = 0; by < size; by += 8) {
    for (let bx = 0; bx < size; bx += 8) {
      for (let v = 0; v < 8; v += 1) {
        for (let u = 0; u < 8; u += 1) {
          let sum = 0;
          for (let y = 0; y < 8; y += 1) {
            for (let x = 0; x < 8; x += 1) {
              sum += (values[(by + y) * size + bx + x] - 128) * cosine[x][u] * cosine[y][v];
            }
          }
          const step = table[v * 8 + u];
          coefficient[v * 8 + u] = Math.round((0.25 * c(u) * c(v) * sum) / step) * step;
        }
      }
      for (let y = 0; y < 8; y += 1) {
        for (let x = 0; x < 8; x += 1) {
          let sum = 0;
          for (let v = 0; v < 8; v += 1) {
            for (let u = 0; u < 8; u += 1) {
              sum += c(u) * c(v) * coefficient[v * 8 + u] * cosine[x][u] * cosine[y][v];
            }
          }
          out[(by + y) * size + bx + x] = 0.25 * sum + 128;
        }
      }
    }
  }
  return out;
}

/** Move a square by whole pixels, wrapping - an exact shift, with no resampling. */
function circularShift(values, size, dx, dy) {
  const out = new Float64Array(size * size);
  for (let y = 0; y < size; y += 1) {
    const from = ((y - dy) % size + size) % size;
    for (let x = 0; x < size; x += 1) {
      out[y * size + x] = values[from * size + (((x - dx) % size + size) % size)];
    }
  }
  return out;
}

test('the shift reported is the one that puts the frame back', () => {
  const size = 64;
  const reference = field(size, scene);
  // The frame is the reference moved seven to the right and five up. Putting it
  // back therefore means seven left and five down.
  const frame = circularShift(reference, size, 7, -5);

  const found = phaseCorrelate(reference, frame, size);

  close(found.dx, -7, 1e-6, 'horizontal correction');
  close(found.dy, 5, 1e-6, 'vertical correction');
  // Every weighted bin agrees on an exact shift, so the whole spectrum lands
  // on one point. Measured 1.0000; and the rest of the surface is nothing,
  // so the tallest point outside the peak's box is 0.040 of it.
  close(found.coherence, 1, 1e-6, 'the coherence of an exact match');
  assert.ok(found.next < 0.1, `the uniqueness of an exact match: ${found.next}`);
  assert.ok(isMeasured(found), 'an exact shift is measured');
});

test('two identical frames need no correction at all', () => {
  const size = 64;
  const reference = field(size, scene);
  const found = phaseCorrelate(reference, Float64Array.from(reference), size);

  close(found.dx, 0, 1e-6, 'horizontal');
  close(found.dy, 0, 1e-6, 'vertical');
});

test('a shift is found to better than a whole pixel', () => {
  // The interpolation is what stops every frame snapping to an integer offset,
  // which would leave a drifting burst stacking slightly soft - the exact
  // softness the alignment exists to prevent. A half-pixel shift is built by
  // sampling the scene half a pixel over, so the answer is known exactly.
  const size = 64;
  const reference = field(size, scene);
  const frame = field(size, scene, 2.5, 0);

  const found = phaseCorrelate(window2d(reference, size), window2d(frame, size), size);

  // The frame samples the scene two and a half pixels over, so it is the
  // reference moved right by that much and the correction is to move it back.
  // Measured -2.466. The tolerance is a bound on the estimator at this size,
  // not on this one fixture: over fractions from 2.0 to 3.0 the regularised
  // peak's error ran 0.003 (at 2.6) to 0.059 (at 2.3), biased towards a
  // smaller shift, so 2.5 is not its worst case; the fully whitened peak
  // needed 0.35 here.
  close(found.dx, -2.5, 0.1, 'a half-pixel shift');
  assert.notEqual(found.dx, Math.round(found.dx), 'the answer snapped to an integer');
});

test('a windowed shift survives the taper', () => {
  const size = 128;
  const reference = window2d(field(size, scene), size);
  const frame = window2d(circularShift(field(size, scene), size, -11, 6), size);

  const found = phaseCorrelate(reference, frame, size);

  close(found.dx, 11, 0.5, 'horizontal correction');
  close(found.dy, -6, 0.5, 'vertical correction');
});

/**
 * THE GATE, PINNED FROM BOTH SIDES
 *
 * These fixtures are the ones the constants in align.js were calibrated on,
 * at the 256 square the coarse pass uses and then at the windows the
 * refinement uses, windowed as the pipeline windows them. The noise is fifteen
 * per cent of each scene's own range (six for the stars), on each frame
 * independently. The number beside each assertion is what this seed measured;
 * the constants were chosen over ten seeds, and the ranges are in the
 * comments on P_MAX and N_MAX. Coherence is written beside them because it
 * travels with the move and the page may one day show it; nothing here pins
 * it to a floor, and the comment on L_MIN says why it stopped being one.
 */
const GATE_SIZE = 256;

function gateFixture(a, b, size = GATE_SIZE) {
  return phaseCorrelate(window2d(a, size), window2d(b, size), size);
}

/** What getImageData does to every square the pipeline builds. */
function eightBit(values) {
  for (let i = 0; i < values.length; i += 1) {
    values[i] = Math.max(0, Math.min(255, Math.round(values[i])));
  }
  return values;
}

/**
 * What lumaSquare does to every 3:2 frame: the picture fills 256 by 171 of
 * the square and the rest is the canvas's transparent black. The hard edge
 * along row 171 is shared by both frames wherever the camera moved, and it
 * is the difference between a gradient that measures 0.08 coherence and one
 * that measures 0.56 - the edge pins the vertical, and the slope, which
 * matches itself at any offset, leaves a ridge along the other axis.
 */
function letterbox(values, size, rows = 171) {
  for (let y = rows; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) values[y * size + x] = 0;
  }
  return values;
}

test('identical textured frames pass the gate', () => {
  const found = gateFixture(field(GATE_SIZE, scene), field(GATE_SIZE, scene));
  // live 0.133, coherence 1.000, plateau 0.002, next 0.020
  assert.ok(isMeasured(found), `live ${found.live}, plateau ${found.plateau}, next ${found.next}`);
  close(found.dx, 0, 1e-6, 'horizontal');
  close(found.dy, 0, 1e-6, 'vertical');
});

test('a noisy textured frame passes the gate and lands where it should', () => {
  const found = gateFixture(
    noisy(field(GATE_SIZE, scene), 28, 1),
    noisy(field(GATE_SIZE, scene, 3.3, -2.6), 28, 2),
  );
  // live 0.014, coherence 0.369, plateau 0.221, next 0.140; found
  // (-3.268, 2.663), 0.07 px off
  assert.ok(isMeasured(found), `live ${found.live}, plateau ${found.plateau}, next ${found.next}`);
  close(found.dx, -3.3, 0.15, 'horizontal correction');
  close(found.dy, 2.6, 0.15, 'vertical correction');
});

test('a noisy low-texture frame passes the gate and lands within a pixel', () => {
  // The fixture the whitening constant was chosen on. With the spectrum fully
  // whitened this was 1.3 to 2.8 pixels off, because the thousands of bins
  // holding nothing but noise voted with the same weight as the few holding
  // the picture.
  const found = gateFixture(
    noisy(field(GATE_SIZE, lowScene), 13.5, 3),
    noisy(field(GATE_SIZE, lowScene, 2.4, -1.7), 13.5, 4),
  );
  // live 0.015, coherence 0.384, plateau 0.417, next 0.137; found
  // (-2.683, 1.692), 0.28 px off
  assert.ok(isMeasured(found), `live ${found.live}, plateau ${found.plateau}, next ${found.next}`);
  close(found.dx, -2.4, 1, 'horizontal correction');
  close(found.dy, 1.7, 1, 'vertical correction');
});

test('the noisiest real scenes keep their peaks under the plateau floor', () => {
  // The plateau floor is pinned from the real side by the scenes whose peaks
  // are broadest: little texture and a lot of noise. Over ten seeds the
  // low-texture scene at thirty per cent noise reached 0.58 on the full
  // square and 0.68 letterboxed, against P_MAX of 0.7; the comment on P_MAX
  // has every range.
  const low = gateFixture(
    noisy(field(GATE_SIZE, lowScene), 27, 3),
    noisy(field(GATE_SIZE, lowScene, 2.4, -1.7), 27, 4),
  );
  // live 0.012, coherence 0.247, plateau 0.515, next 0.270; found
  // (-2.754, 1.710)
  assert.ok(isMeasured(low), `plateau ${low.plateau}, next ${low.next}`);
  close(low.dx, -2.4, 1, 'horizontal correction');
  close(low.dy, 1.7, 1, 'vertical correction');

  const texture = gateFixture(
    noisy(field(GATE_SIZE, scene), 56, 1),
    noisy(field(GATE_SIZE, scene, 3.3, -2.6), 56, 2),
  );
  // live 0.011, coherence 0.166, plateau 0.368, next 0.291; found
  // (-3.070, 2.754)
  assert.ok(isMeasured(texture), `plateau ${texture.plateau}, next ${texture.next}`);
  close(texture.dx, -3.3, 0.5, 'horizontal correction');
  close(texture.dy, 2.6, 0.5, 'vertical correction');

  // The same two with the survey square's letterbox under them, since its
  // edge lifts every plateau: the textured pair to 0.488 and the low-texture
  // pair to 0.589, both still measured. The letterbox is not free on the
  // low-texture pair - the ridge pulls its vertical towards zero, to 0.41
  // against 1.7 - which is a cost of the survey square, not of the gate, and
  // is recorded here rather than asserted away. It lifts the uniqueness
  // reading too, to 0.46 and 0.37 from 0.29 and 0.27, because the ridge is
  // a second place the surface stands high.
  const boxedTexture = gateFixture(
    letterbox(noisy(field(GATE_SIZE, scene), 56, 1), GATE_SIZE),
    letterbox(noisy(field(GATE_SIZE, scene, 3.3, -2.6), 56, 2), GATE_SIZE),
  );
  // live 0.012, coherence 0.184, plateau 0.488, next 0.460; found
  // (-2.949, 2.531)
  assert.ok(isMeasured(boxedTexture), `plateau ${boxedTexture.plateau}, next ${boxedTexture.next}`);
  const boxedLow = gateFixture(
    letterbox(noisy(field(GATE_SIZE, lowScene), 27, 3), GATE_SIZE),
    letterbox(noisy(field(GATE_SIZE, lowScene, 2.4, -1.7), 27, 4), GATE_SIZE),
  );
  // live 0.013, coherence 0.267, plateau 0.589, next 0.371; found
  // (-2.809, 0.414)
  assert.ok(isMeasured(boxedLow), `plateau ${boxedLow.plateau}, next ${boxedLow.next}`);
  assert.ok(boxedLow.plateau < P_MAX, 'the nearest real fixture to the plateau floor');
});

test('a featureless frame fails the gate', () => {
  // A gradient with independent noise on each frame. There is nothing here to
  // align on, and what the peak reports is where the noise happened to pile
  // up: this seed says (5.2, -6.9). The old z-score gave it 27 and the
  // pipeline moved it. What refuses it is uniqueness: the surface is noise
  // peaks of much the same height, and the next tallest is 0.944 of the one
  // the argmax chose - 0.87-1.00 over ten seeds.
  const found = gateFixture(
    noisy(field(GATE_SIZE, gradient), 17, 5),
    noisy(field(GATE_SIZE, gradient), 17, 6),
  );
  // live 0.010, coherence 0.052, plateau 0.517, next 0.944
  assert.ok(found.next > N_MAX, `next ${found.next}`);
  assert.ok(!isMeasured(found), `live ${found.live}, plateau ${found.plateau}, next ${found.next}`);

  // And without the noise, a bare slope: the window takes the mean out and
  // what is left is numerically nothing, so every bin above rounding error
  // "agrees" and the coherence is a perfect 1. That is what the live floor
  // is for; the plateau, 0.832, would refuse it too, and the next reading
  // of 0.712 would not.
  const bare = gateFixture(field(GATE_SIZE, gradient), field(GATE_SIZE, gradient, 3, 0));
  // live 0.0014, coherence 1.000, plateau 0.832, next 0.712
  assert.ok(!isMeasured(bare), `live ${bare.live}, plateau ${bare.plateau}, next ${bare.next}`);
  assert.ok(!isMeasured({ live: bare.live }), 'refused by live alone');

  // And the one the coarse square actually sees of a clear sky: the slope
  // rounded to 8 bits, with one per cent of noise. The contour lines of a
  // quantised slope are a lattice, and a lattice correlates with itself at
  // every offset it repeats at, which is what a uniqueness reading of 0.965
  // is: 0.82-1.00 over ten seeds, against a floor of 0.8.
  const sky = gateFixture(
    eightBit(noisy(field(GATE_SIZE, gradient), 1.15, 5)),
    eightBit(noisy(field(GATE_SIZE, gradient), 1.15, 6)),
  );
  // live 0.010, coherence 0.093, plateau 0.671, next 0.965, at (-0.9, 5.1)
  assert.ok(sky.next > N_MAX, `next ${sky.next}`);
  assert.ok(!isMeasured(sky), `live ${sky.live}, plateau ${sky.plateau}, next ${sky.next}`);
});

test('a smooth gradient is refused although it correlates with itself', () => {
  // The case coherence cannot see. In the browser, four frames of one
  // gradient came back measured at coherence 0.47-0.51 and were moved by
  // -12.9, +35.6 and -0.4 output pixels from an identity that was the
  // truth. What the survey square holds of a clear sky is the slope's 8-bit
  // banding over a letterbox, and the letterbox's edge is shared by both
  // frames, so the two do correlate - at 0.56 here, nearly four times what
  // was then the coherence floor, and the assertion on it below is there to
  // say the fixture still reproduces the browser. But the surface is a
  // ridge along the slope: the peak is still at 0.98 of its height eight
  // pixels away, and where its argmax lands on the ridge is the noise's
  // choice. Both modes must refuse it, and neither may call it clamped,
  // because no rotation was read. The ridge is also a place the surface
  // stands high outside the peak's box, so uniqueness refuses it as well,
  // at 0.96-0.99.
  const boxed = (fn, seed, dx = 0) => window2d(
    letterbox(eightBit(noisy(field(GATE_SIZE, fn, dx), 1.3, seed)), GATE_SIZE), GATE_SIZE,
  );
  const cases = [
    // coherence 0.563, plateau 0.976, next 0.959, at (-0.10, 0.00) in both modes
    ['identical', boxed(diagonal, 11), boxed(diagonal, 21)],
    // translate: coherence 0.568, plateau 0.976, next 0.978, at (4.19, 0.00)
    // for a true shift of -3. similarity: the log-polar peak passed and was
    // applied as a scale of 0.944, and the translation peak then measured
    // 0.492, 0.998 and 0.972 - refused, which discards the scale with it.
    ['shifted three pixels', boxed(diagonal, 12), boxed(diagonal, 22, 3)],
    // translate: coherence 0.573, plateau 0.994, next 0.988, at (-2.61, 0.00);
    // similarity: 0.572, 0.987 and 0.956, with a scale of 0.974 discarded
    // the same way
    ['horizontal', boxed(horizontal, 13), boxed(horizontal, 23)],
  ];
  for (const [name, reference, frame] of cases) {
    for (const mode of ['translate', 'similarity']) {
      const found = estimate(reference, frame, GATE_SIZE, mode);
      assert.ok(
        found.coherence >= 0.4,
        `${name}, ${mode}: coherence ${found.coherence} - this fixture no longer reproduces the browser`,
      );
      assert.ok(found.plateau > P_MAX, `${name}, ${mode}: plateau ${found.plateau}`);
      assert.ok(found.next > N_MAX, `${name}, ${mode}: next ${found.next}`);
      assert.equal(found.measured, false, `${name}, ${mode}: measured`);
      assert.equal(found.clamped, false, `${name}, ${mode}: clamped`);
    }
  }

  // The same slope over the whole square, without the letterbox, has no
  // ridge - the plateau is 0.676, under the floor - and is refused by
  // uniqueness alone, at 0.940: its contour lattice repeats. The letterbox
  // is what the browser case is made of, not a detail of it.
  const plain = gateFixture(
    eightBit(noisy(field(GATE_SIZE, diagonal), 1.3, 11)),
    eightBit(noisy(field(GATE_SIZE, diagonal), 1.3, 21)),
  );
  // live 0.010, coherence 0.075, plateau 0.676, next 0.940
  assert.ok(plain.plateau < P_MAX, `plateau ${plain.plateau}`);
  assert.ok(plain.next > N_MAX, `next ${plain.next}`);
  assert.ok(!isMeasured(plain));
});

test('two unrelated pictures fail the gate', () => {
  const found = gateFixture(field(GATE_SIZE, scene), field(GATE_SIZE, otherScene));
  // live 0.099, coherence 0.060, plateau 0.640, next 0.863; the peak is at
  // (37.9, -7.9), which is nothing, and the next tallest noise peak is
  // within a seventh of it
  assert.ok(found.next > N_MAX, `next ${found.next}`);
  assert.ok(!isMeasured(found), `live ${found.live}, plateau ${found.plateau}, next ${found.next}`);

  // Two unrelated low-texture pictures sharing a letterbox: the browser read
  // the pair at coherence 0.28 and plateau 0.81 and refused it. The fixture
  // sits on both floors at once - at fifteen per cent noise plateau
  // 0.64-0.78 against 0.7 and next 0.72-0.82 against 0.8, so four seeds in
  // ten pass and are moved by one to four pixels; at five per cent 0.72-0.80
  // and 0.79-0.83, refused every time. The comments on P_MAX and N_MAX record
  // the pass-through and the taper that would remove it. What is pinned is
  // a seed both floors refuse, and the browser's own readings - the survey
  // square's, and the refinement window's next of 0.98.
  const boxedLow = gateFixture(
    letterbox(noisy(field(GATE_SIZE, lowScene), 13.5, 3), GATE_SIZE),
    letterbox(noisy(field(GATE_SIZE, otherLow), 13.5, 4), GATE_SIZE),
  );
  // live 0.016, coherence 0.153, plateau 0.776, next 0.823, at (-2.81, -0.03)
  assert.ok(boxedLow.plateau > P_MAX, `plateau ${boxedLow.plateau}`);
  assert.ok(boxedLow.next > N_MAX, `next ${boxedLow.next}`);
  assert.ok(!isMeasured(boxedLow));
  assert.ok(!isMeasured({ live: 0.01, coherence: 0.28, plateau: 0.81 }), 'the browser reading, survey');
  assert.ok(!isMeasured({ live: 0.01, coherence: 0.03, plateau: 0.21, next: 0.98 }), 'the browser reading, refinement');
});

test('a star field passes the gate', () => {
  // Almost all dark, so almost all of the spectrum is noise - the case a gate
  // on how much spectrum there is would refuse, and the case that matters
  // most to a tool that stacks night skies.
  const sky = starField(GATE_SIZE);
  const found = gateFixture(
    noisy(field(GATE_SIZE, sky), 15, 7),
    noisy(field(GATE_SIZE, sky, 5.4, -3.2), 15, 8),
  );
  // live 0.029, coherence 0.737, plateau 0.035, next 0.076 - the sharpest
  // and the most alone peak of any fixture, a star being a point; found
  // (-5.388, 3.179), 0.02 px off
  assert.ok(isMeasured(found), `live ${found.live}, plateau ${found.plateau}, next ${found.next}`);
  close(found.dx, -5.4, 0.1, 'horizontal correction');
  close(found.dy, 3.2, 0.1, 'vertical correction');

  // At fifteen per cent noise the coherence has halved and the answer has
  // not moved: live 0.014, coherence 0.401, plateau 0.067, next 0.144, at
  // (-5.504, 3.179).
  const noisier = gateFixture(
    noisy(field(GATE_SIZE, sky), 38, 7),
    noisy(field(GATE_SIZE, sky, 5.4, -3.2), 38, 8),
  );
  assert.ok(isMeasured(noisier), `plateau ${noisier.plateau}, next ${noisier.next}`);
  close(noisier.dx, -5.4, 0.15, 'horizontal correction');
  close(noisier.dy, 3.2, 0.15, 'vertical correction');
});

test('the gate holds at the refinement windows', () => {
  // Both floors are ratios of the surface to its own peak, so neither
  // scales with the side of the square; the tables on P_MAX and N_MAX show
  // them holding from 128 to 512. At 128 a noisy textured pair is measured
  // and the junk is not.
  const texture = gateFixture(
    noisy(field(128, scene), 28, 3),
    noisy(field(128, scene, 3.3, -2.6), 28, 4),
    128,
  );
  // live 0.013, coherence 0.376, plateau 0.202, next 0.190
  assert.ok(isMeasured(texture), `plateau ${texture.plateau}, next ${texture.next}`);
  // The plateau is read eight pixels out at every size, and at 128 that
  // keeps the low-texture pair: its thirteen-pixel features have fallen to
  // 0.33-0.47 of the peak by then, over ten seeds. The first version read
  // the plateau at a thirty-second of the side, four pixels here, where the
  // same pair stood at 0.76-0.91 and was refused with its peak in the right
  // place; plateauRadius in align.js says why the radius is fixed.
  const low = gateFixture(
    noisy(field(128, lowScene), 13.5, 3),
    noisy(field(128, lowScene, 2.4, -1.7), 13.5, 4),
    128,
  );
  // live 0.015, coherence 0.394, plateau 0.327, next 0.156; found
  // (-2.006, 1.917)
  assert.ok(isMeasured(low), `plateau ${low.plateau}, next ${low.next}`);
  close(low.dx, -2.4, 1, 'horizontal correction');
  close(low.dy, 1.7, 1, 'vertical correction');
  const junk = gateFixture(
    noisy(field(128, gradient), 17, 5), noisy(field(128, gradient), 17, 6), 128,
  );
  // live 0.010, coherence 0.089, plateau 0.902, next 0.916 - both floors
  assert.ok(!isMeasured(junk), `plateau ${junk.plateau}, next ${junk.next}`);
  const unrelated = gateFixture(
    noisy(field(128, scene), 9, 5), noisy(field(128, otherScene), 9, 6), 128,
  );
  // live 0.025, coherence 0.140, plateau 0.216, next 0.948 - uniqueness
  // alone, the peak being sharp and one of many
  assert.ok(unrelated.plateau < P_MAX && unrelated.next > N_MAX, `plateau ${unrelated.plateau}, next ${unrelated.next}`);
  assert.ok(!isMeasured(unrelated));

  // At 64 the low-texture pair is measured too, 0.76 pixels off - the old
  // floor refused it there. But the window is too small for the junk to
  // read as junk: this unrelated pair is refused at 0.896, and the same
  // pair on seeds 11 and 12 reads 0.788 and passes. The comment on N_MAX
  // says why that is accepted - the refinement measures nine windows and
  // applies nothing four of them do not agree on, so one small square
  // passing this floor is a window dropped rather than a frame moved. What
  // is pinned is the pair the fixture table has.
  const small64 = gateFixture(
    noisy(field(64, lowScene), 13.5, 3), noisy(field(64, lowScene, 2.4, -1.7), 13.5, 4), 64,
  );
  // live 0.017, coherence 0.458, plateau 0.283, next 0.135; found (-1.903, 1.119)
  assert.ok(isMeasured(small64), `plateau ${small64.plateau}, next ${small64.next}`);
  const small = gateFixture(
    noisy(field(64, scene), 9, 5), noisy(field(64, otherScene), 9, 6), 64,
  );
  // live 0.027, coherence 0.243, plateau 0.393, next 0.896
  assert.ok(!isMeasured(small), `plateau ${small.plateau}, next ${small.next}`);

  // Without a plateau the peak is taken to be a point, and without a next
  // to be alone - that is the reference move. Either given is read, and
  // coherence is not.
  assert.ok(isMeasured({ live: 1 }), 'a statistics object built by hand');
  assert.ok(!isMeasured({ live: 1, plateau: 0.9 }), 'a ridge built by hand');
  assert.ok(!isMeasured({ live: 1, next: 0.9 }), 'a crowd built by hand');
  assert.ok(isMeasured({ live: 1, coherence: 0.01 }), 'coherence is reported, not read');
});

test('a sparse sky is refined at the refinement window', () => {
  // Twenty stars in a 512 window with six per cent noise is the tool's own
  // subject at full-resolution noise, and the case the coherence floor
  // could not keep: it read 0.041 there, level with junk, because a sparse
  // spectrum's weight belongs to the noise bins - the comment on L_MIN. The
  // peak was right all along, and the two readings that decide now say so:
  // it is alone (next 0.488 against 0.8, 0.40-0.53 over ten seeds) and it
  // is a point (plateau 0.114). In the browser the 400-star field's window
  // reads 0.25 at six per cent noise and 0.69 at fifteen, and both are
  // refined to under 0.3 pixels; the old floor admitted the first (coherence
  // 0.139 against 0.075) and refused the second at 0.042, leaving its frames
  // 1-2.7 pixels off. The coarse square is unchanged.
  const sky = starField(GATE_SIZE, 20);
  const coarse = gateFixture(
    noisy(field(GATE_SIZE, sky), 15, 7),
    noisy(field(GATE_SIZE, sky, 5.4, -3.2), 15, 8),
  );
  // live 0.010, coherence 0.154, plateau 0.115, next 0.233; found (-5.630, 3.181)
  assert.ok(isMeasured(coarse), `plateau ${coarse.plateau}, next ${coarse.next}`);
  close(coarse.dx, -5.4, 0.35, 'horizontal correction');
  close(coarse.dy, 3.2, 0.35, 'vertical correction');

  const bigger = starField(512, 20);
  const fine = gateFixture(
    noisy(field(512, bigger), 15, 7),
    noisy(field(512, bigger, 5.4, -3.2), 15, 8),
    512,
  );
  // live 0.010, coherence 0.041, plateau 0.114, next 0.488; found
  // (-5.233, 3.123), 0.19 px off
  assert.ok(isMeasured(fine), `live ${fine.live}, plateau ${fine.plateau}, next ${fine.next}`);
  close(fine.dx, -5.4, 0.3, 'horizontal correction');
  close(fine.dy, 3.2, 0.3, 'vertical correction');

  // And where the same sky stops being measurable, the gate follows the
  // answer: at fifteen per cent noise these twenty stars are wrong by 10 to
  // 105 pixels over ten seeds - this one lands at (29.9, 12.1) - and
  // uniqueness refuses every seed at 0.80-0.99, where the plateau
  // (0.18-0.64) would not have. A different draw of twenty-two stars, the
  // browser's own field, is right at fifteen per cent on every seed at
  // 0.36-0.57: at this density the window is at the edge of what can be
  // measured, and what is pinned is that the wrong answer is refused.
  const drowned = gateFixture(
    noisy(field(512, bigger), 38, 7),
    noisy(field(512, bigger, 5.4, -3.2), 38, 8),
    512,
  );
  // live 0.010, coherence 0.019, plateau 0.370, next 0.950
  assert.ok(drowned.next > N_MAX, `next ${drowned.next}`);
  assert.ok(!isMeasured(drowned));
});

test('two unrelated pictures locked on a JPEG lattice are refused by uniqueness', () => {
  // Every JPEG carries the same 8-pixel block grid, so two frames that
  // share nothing else still share that, and on smooth content the whitened
  // correlation finds it: a row of equal peaks eight pixels apart. In the
  // browser two unrelated smooth pictures both compressed read coherence
  // 0.088 at 512, over what was then the floor, and next 1.00 - a lattice
  // has no single peak, which is what uniqueness measures. Over eighty seed
  // pairs - two unrelated scenes at qualities 95, 75, 50 and 20 - the fixture
  // reads 0.72-1.00 and eight of the eighty are admitted, about one in ten,
  // worst on the smooth pair at quality 50 where three of ten pass. The
  // comment on N_MAX says why the leak is there and why it is harmless as
  // the pipeline stands. This pair is pinned at 0.962.
  const size = 512;
  const smoothA = (u, v) => 128 + 60 * octave(u, v, 120);
  const smoothB = (u, v) => 128 + 60 * octave(u + 5000, v + 3000, 133);
  const found = gateFixture(
    jpeg(eightBit(noisy(field(size, smoothA), 1.2, 2002)), size, 75),
    jpeg(eightBit(noisy(field(size, smoothB), 1.2, 2003)), size, 75),
    size,
  );
  // coherence 0.064, plateau 0.532, next 0.962, at (48.3, 43.6)
  assert.ok(found.plateau < P_MAX, `plateau ${found.plateau}`);
  assert.ok(found.next > N_MAX, `next ${found.next}`);
  assert.ok(!isMeasured(found));

  // The refinement's own scenario: both frames of *one* smooth scene
  // compressed, the frame taken 3.3 pixels over and the coarse pass having
  // moved it back by three, so the truth is -0.3 and the lattice's alias is
  // +3. Uniqueness cannot see this one. The lattice's peaks are eight pixels
  // apart, inside the ten-pixel box, so what next reads is the noise beyond
  // them (0.46-0.93 at quality 75, 0.27-0.40 at 20) and not the lattice.
  // What refuses it at most qualities is the plateau, by a coincidence
  // rather than by design: its radius is eight because that is where a peak
  // has stopped placing anything, and eight is also the block pitch, so the
  // shoulder is read on the lattice's first alias and spikes there. At quality 75
  // that reads 0.71-0.98 over ten seed pairs and the lock is refused on
  // every one; the same at 95 and 50. plateauRadius in align.js records the
  // coincidence, and this is the assertion that would fail if the radius
  // moved off eight.
  const refused = gateFixture(
    jpeg(eightBit(noisy(field(size, smoothA), 1.2, 2002)), size, 75),
    circularShift(jpeg(eightBit(noisy(field(size, smoothA, 3.3, 0), 1.2, 2003)), size, 75), size, -3, 0),
    size,
  );
  // plateau 0.861, next 0.677, at (3.02, 0.00); the thinnest of the ten
  // seed pairs is 0.711, on 2000/2001
  assert.ok(refused.plateau > P_MAX, `plateau ${refused.plateau}`);
  assert.ok(refused.next < N_MAX, `next ${refused.next}`);
  assert.ok(!isMeasured(refused));

  // And the quality where the coincidence runs out: at 20 the blocking
  // buries the alias, the shoulder falls back under the floor, and the
  // residual lands on the alias and is applied - eight of ten seed pairs.
  // Pinned so that whatever catches this - the consensus check - has to say
  // so here.
  const lock = gateFixture(
    jpeg(eightBit(noisy(field(size, smoothA), 1.2, 2000)), size, 20),
    circularShift(jpeg(eightBit(noisy(field(size, smoothA, 3.3, 0), 1.2, 2001)), size, 20), size, -3, 0),
    size,
  );
  // coherence 0.447, plateau 0.453, next 0.382, at (2.98, 0.00) for a
  // truth of -0.30
  assert.ok(isMeasured(lock), `plateau ${lock.plateau}, next ${lock.next}`);
  close(lock.dx, 3, 0.3, 'the alias, applied');
});

test('a wall at output resolution is a plateau the refinement refuses', () => {
  // The refinement's own version of the sky: a low-texture window at 512
  // whose features are sixty pixels across, which is what a wall in soft
  // light is at output resolution. Its peak is sixty pixels wide too, so
  // eight pixels out the surface is still at three quarters of the peak or
  // more, and the argmax is one to seven pixels off a shift of (2.4, -1.7)
  // - small enough that nothing else would have refused it, and consistent
  // enough across the grid that the consensus would not have either.
  // Over ten seeds the plateau ran 0.77-0.96 at fifteen per cent noise and
  // 0.82-0.90 at five, every seed refused; at the sixteen-pixel radius the
  // first version read at 512, the five per cent wall stood at 0.59-0.71 and
  // passed nine seeds in ten.
  const wall = (u, v) => 90 * octave(u, v, 60);
  const found = gateFixture(
    noisy(field(512, wall), 13.5, 5),
    noisy(field(512, wall, 2.4, -1.7), 13.5, 6),
    512,
  );
  // live 0.010, coherence 0.077, plateau 0.832, next 0.923; found (4.981, 0.972)
  assert.ok(found.plateau > P_MAX, `plateau ${found.plateau}`);
  assert.ok(!isMeasured(found));

  // The realistic one: the same wall at five per cent noise. This seed is
  // the plateau's alone: a broad peak's skirt is not a second peak, so
  // uniqueness reads 0.790 and would have kept it (0.78-0.90 over ten
  // seeds, on either side of the floor), and its coherence would have
  // passed the old floor too.
  const quiet = gateFixture(
    noisy(field(512, wall), 4.5, 5),
    noisy(field(512, wall, 2.4, -1.7), 4.5, 6),
    512,
  );
  // live 0.011, coherence 0.103, plateau 0.853, next 0.790; found (-2.167, -0.027)
  assert.ok(quiet.next < N_MAX, `next ${quiet.next} - this seed no longer pins the plateau alone`);
  assert.ok(quiet.plateau > P_MAX, `plateau ${quiet.plateau}`);
  assert.ok(!isMeasured(quiet));
});

test('estimate reports a frame the gate refused, and does not clamp it', () => {
  // The pipeline reads `measured` and puts the frame at the identity; the page
  // then counts it. `clamped` is a different report - a rotation too large to
  // be a burst - and a frame that could not be measured at all is not that.
  const a = window2d(noisy(field(GATE_SIZE, gradient), 17, 5), GATE_SIZE);
  const b = window2d(noisy(field(GATE_SIZE, gradient), 17, 6), GATE_SIZE);

  const translate = estimate(a, b, GATE_SIZE, 'translate');
  assert.equal(translate.measured, false);
  assert.equal(translate.clamped, false);

  // In similarity mode the log-polar peak fails the same gate, which falls
  // back to translation as an implausible angle does - but without saying the
  // angle was implausible, because no angle was read at all.
  const similarity = estimate(a, b, GATE_SIZE, 'similarity');
  assert.equal(similarity.measured, false);
  assert.equal(similarity.clamped, false);
  assert.equal(similarity.angle, 0);
  assert.equal(similarity.scale, 1);

  // That has to hold whatever the junk argmax happened to read, and it only
  // does because estimate asks the gate before the bounds. On these seeds
  // the log-polar surface read an angle of 14.6 degrees and a scale of 0.69
  // - outside the scale bounds - at a next of 0.994 (coherence 0.073,
  // plateau 0.310), and the first version, which checked the bounds first,
  // reported the frame clamped. Over ten seed pairs two of ten landed out
  // of bounds that way.
  const wild = estimate(
    window2d(noisy(field(GATE_SIZE, gradient), 17, 1), GATE_SIZE),
    window2d(noisy(field(GATE_SIZE, gradient), 17, 101), GATE_SIZE),
    GATE_SIZE, 'similarity',
  );
  // translation: live 0.010, coherence 0.046, plateau 0.649, next 0.958
  assert.equal(wild.measured, false);
  assert.equal(wild.clamped, false);
  assert.equal(wild.angle, 0);
  assert.equal(wild.scale, 1);

  const real = estimate(
    window2d(field(GATE_SIZE, scene), GATE_SIZE),
    window2d(field(GATE_SIZE, scene, 3.3, -2.6), GATE_SIZE),
    GATE_SIZE, 'translate',
  );
  assert.equal(real.measured, true);
  assert.ok(real.live > 0 && real.coherence > 0, 'the statistics travel with the move');
  assert.ok(real.plateau >= 0 && real.plateau <= P_MAX, 'and so does the plateau');
  assert.ok(real.next >= 0 && real.next <= N_MAX, 'and the uniqueness');
});

test('a real turn the log-polar surface could not measure is not reported as too large', () => {
  // The log-polar surface runs at about half the coherence of the translation
  // surface, so a real scene can pass the translation gate and fail the
  // rotation one. That frame is aligned by translation and the page hears
  // nothing: "too large to be a burst" would be untrue of it, and that is
  // the same untruth this gate exists to remove.
  const turn = (fn, degrees) => {
    const radians = (degrees * Math.PI) / 180;
    return (u, v) => fn(
      u * Math.cos(radians) + v * Math.sin(radians),
      -u * Math.sin(radians) + v * Math.cos(radians),
    );
  };

  // Twenty per cent noise, three degrees: the log-polar peak is a plateau,
  // 0.722 against 0.7 (next 0.510, coherence 0.140), and its argmax would
  // have read -5.9 degrees for a turn of three, so refusing it was right;
  // the translation peak then reads next 0.236 and is kept.
  const refused = estimate(
    window2d(noisy(field(GATE_SIZE, lowScene), 18, 2010), GATE_SIZE),
    window2d(noisy(field(GATE_SIZE, turn(lowScene, 3)), 18, 2011), GATE_SIZE),
    GATE_SIZE, 'similarity',
  );
  assert.equal(refused.measured, true);
  assert.equal(refused.clamped, false);
  assert.equal(refused.angle, 0);
  assert.equal(refused.scale, 1);

  // Fifteen per cent noise, four degrees: the log-polar peak reads plateau
  // 0.387 and next 0.433 (coherence 0.182), and the turn is read, as -4.11.
  const measured = estimate(
    window2d(noisy(field(GATE_SIZE, lowScene), 13.5, 3), GATE_SIZE),
    window2d(noisy(field(GATE_SIZE, turn(lowScene, 4)), 13.5, 4), GATE_SIZE),
    GATE_SIZE, 'similarity',
  );
  assert.equal(measured.measured, true);
  assert.equal(measured.clamped, false);
  close(measured.angle, -4, 1.5, 'the angle, as the correction it is');

  // The seeds this test used to pin the refusal on, now admitted, and
  // admitted wrongly: the log-polar peak reads plateau 0.565 and next
  // 0.447, and the angle comes out as -0.15 for a turn of three. That is
  // the log-polar surface's own junk peak, at zero - the structure every
  // spectrum shares, its axes and its window, correlates at no shift - and
  // for a turn under seven degrees the true peak sits inside the box of it,
  // where neither floor can tell the two apart. The old floor refused this
  // seed at a coherence of 0.147 against 0.15, and that was luck rather
  // than discrimination: over twenty seeds of each turn in the N_MAX
  // comment the wrong angles read 0.12-0.18 and the right ones 0.11-0.21,
  // and at thirty per cent noise the old floor refused eleven right turns
  // in fifteen to catch four wrong ones in five, where this gate refuses
  // none. Pinned as what happens, not as what should: whatever fixes the
  // zero peak has to change this.
  const zero = estimate(
    window2d(noisy(field(GATE_SIZE, lowScene), 18, 1006), GATE_SIZE),
    window2d(noisy(field(GATE_SIZE, turn(lowScene, 3)), 18, 1007), GATE_SIZE),
    GATE_SIZE, 'similarity',
  );
  assert.equal(zero.measured, true);
  assert.equal(zero.clamped, false);
  assert.ok(Math.abs(zero.angle + 3) > 1.5, `the zero peak, read as ${zero.angle}`);
  assert.ok(Math.abs(zero.angle) < 1, `the zero peak, read as ${zero.angle}`);
});

test('the window removes the mean and fades the edges to nothing', () => {
  const size = 16;
  const flat = new Float64Array(size * size).fill(200);
  window2d(flat, size);
  for (const value of flat) close(value, 0, 1e-9, 'a flat field is nothing but its mean');

  const values = window2d(field(size, scene), size);
  for (let x = 0; x < size; x += 1) {
    close(values[x], 0, 1e-9, `top edge at ${x}`);
    close(values[(size - 1) * size + x], 0, 1e-9, `bottom edge at ${x}`);
    close(values[x * size], 0, 1e-9, `left edge at ${x}`);
  }
});

test('the log-polar map turns a rotation into a shift down its rows', () => {
  // The claim the "rotation too" setting rests on, checked on its own rather
  // than through the whole estimator: rotate the picture, and its log-polar
  // spectrum comes out the same picture moved down.
  const size = 128;
  const degrees = 12;
  const radians = (degrees * Math.PI) / 180;
  const reference = field(size, scene);
  const turned = field(size, (u, v) => scene(
    u * Math.cos(radians) + v * Math.sin(radians),
    -u * Math.sin(radians) + v * Math.cos(radians),
  ));

  const a = logPolar(logSpectrum(reference, size), size);
  const b = logPolar(logSpectrum(turned, size), size);
  const found = phaseCorrelate(window2d(a.values, size), window2d(b.values, size), size);

  // Rows span half a turn over the whole square, so a degree is size/180 rows -
  // and what comes off them is the turn that puts the frame back, so a picture
  // rotated twelve degrees reads as minus twelve.
  close((found.dy * 180) / size, -degrees, 2, 'the angle read off the rows');
});

test('a rotated frame is measured and undone', () => {
  const size = 128;
  const degrees = 9;
  const radians = (degrees * Math.PI) / 180;
  const reference = field(size, scene);
  const turned = field(size, (u, v) => scene(
    u * Math.cos(radians) + v * Math.sin(radians),
    -u * Math.sin(radians) + v * Math.cos(radians),
  ));

  const found = estimate(window2d(reference, size), window2d(turned, size), size, 'similarity');

  assert.equal(found.clamped, false, 'a nine degree turn is a plausible one');
  close(found.angle, -degrees, 2.5, 'the angle, as the correction it is');
  close(found.scale, 1, 0.06, 'a rotation is not a scale');

  // And the angle it reports is the one that undoes the turn, applied exactly
  // as the pipeline applies it. This is the half that matters: an angle of the
  // right size and the wrong sign is worse than no alignment at all.
  const back = rotateScale(turned, size, found.angle, found.scale);
  const straight = phaseCorrelate(window2d(reference, size), window2d(back, size), size);
  close(straight.dx, 0, 1.5, 'what is left over horizontally');
  close(straight.dy, 0, 1.5, 'what is left over vertically');
});

test('a scaled frame is measured', () => {
  const size = 128;
  const factor = 1.12;
  const reference = field(size, scene);
  const bigger = field(size, (u, v) => scene(u / factor, v / factor));

  const found = estimate(window2d(reference, size), window2d(bigger, size), size, 'similarity');

  assert.equal(found.clamped, false, 'a twelve per cent change is a plausible one');
  // A frame twelve per cent larger is corrected by being shrunk back.
  close(found.scale, 1 / factor, 0.04, 'the scale, as the correction it is');
  close(found.angle, 0, 2.5, 'a scale is not a rotation');
});

test('an implausible transform is refused rather than applied', () => {
  // Two unrelated pictures will still produce a peak somewhere. What must not
  // happen is that peak being turned into a ninety degree rotation and applied.
  const size = 64;
  const reference = field(size, scene);
  const noise = new Float64Array(size * size);
  let seed = 7;
  for (let i = 0; i < noise.length; i += 1) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    noise[i] = seed % 256;
  }

  const found = estimate(window2d(reference, size), window2d(noise, size), size, 'similarity');

  assert.ok(
    found.clamped || (Math.abs(found.angle) <= MAX_ROTATION),
    'an unrelated frame produced a rotation that was applied anyway',
  );
});

test('doing nothing is one of the three answers', () => {
  const size = 32;
  const reference = field(size, scene);
  const frame = circularShift(reference, size, 9, 9);

  assert.deepEqual(
    estimate(reference, frame, size, 'none'),
    { ...NO_MOVE, measured: true, clamped: false },
  );
  assert.deepEqual(ALIGN_MODES, ['none', 'translate', 'similarity']);

  // Translation-only leaves the angle and the scale alone rather than guessing
  // at them, which is what makes it the safe setting for a locked-off camera.
  const moved = estimate(reference, frame, size, 'translate');
  assert.equal(moved.angle, 0);
  assert.equal(moved.scale, 1);
  close(moved.dx, -9, 1e-6, 'horizontal correction');
});
