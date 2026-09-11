/**
 * The scenes, the squares and the noise every stack-images alignment test
 * draws - shared by stack-images-align.test.js and the two
 * stack-images-survey-*.test.js files, and by nothing else.
 *
 * They were one file until the survey-square tests were measured: the four
 * of them take fifty seconds in series, and `node --test` runs FILES in
 * parallel and the tests inside a file one after another, so that one file
 * was the whole suite's critical path - everything else finished in a
 * quarter of the time and waited. Three files put the survey square on
 * cores of its own. The fixtures had to move out to make that possible,
 * because a test file that exported them would register its tests again in
 * whichever file imported it.
 *
 * Nothing here asserts anything. The numbers in the comments are what these
 * scenes measured on the seeds beside them, and the tests that pin those
 * readings have to be able to reproduce them, which is why a fixture that
 * later turned out to overstate something (`letterbox`) is kept and marked
 * rather than fixed.
 */

import { phaseCorrelate, window2d } from '../../tools/stack-images/src/align.js';
import { placement } from '../../tools/stack-images/src/plan.js';

/**
 * A picture with enough structure at enough orientations to correlate,
 * sampled `dx`, `dy` pixels over when asked - a shift by any real amount,
 * exact because the scene is defined at every coordinate.
 */
export function field(size, fn, dx = 0, dy = 0) {
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
export function hash(i, j) {
  let h = Math.imul(i | 0, 374761393) + Math.imul(j | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function octave(u, v, cell) {
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

export const scene = (u, v) => (
  90 * octave(u, v, 13)
  + 60 * octave(u + 100, v - 60, 5)
  + 35 * octave(u - 40, v + 25, 2.2)
);

/**
 * The same scene without its two finer octaves: a wall in soft light, a sky
 * with some cloud in it. Everything the correlation has to hold onto is
 * thirteen pixels across or larger, so the peak is broad and the noise is not.
 */
export const lowScene = (u, v) => 90 * octave(u, v, 13);

/**
 * A different picture, on lattices that share no pitch with the first. Two
 * value-noise scenes on the same lattice are not unrelated - the whitened
 * correlation finds the lattice - and that was the first version of this.
 */
export const otherScene = (u, v) => (
  90 * octave(u + 1000, v + 777, 11.3)
  + 60 * octave(u - 300, v + 60, 4.7)
  + 35 * octave(u + 40, v - 25, 1.9)
);

/** A featureless frame: nothing in it but a slope. */
export const gradient = (u, v) => 100 + 0.3 * u + 0.15 * v;

/** A different wall: the low-texture octave of otherScene, on its own. */
export const otherLow = (u, v) => 90 * octave(u + 1000, v + 777, 11.3);

/**
 * A clear sky as the survey square sees it: a slope of about sixty levels
 * across the whole square, which is what a 3000-pixel gradient with twelve
 * per cent noise comes down to after the JPEG and the resize, with one per
 * cent of noise left on it. Rounded to 8 bits below, because that is what
 * getImageData does and the banding it leaves is what correlates.
 */
export const diagonal = (u, v) => 150 + 0.15 * u + 0.09 * v;
export const horizontal = (u, v) => 150 + 0.235 * u;

/**
 * The stars themselves, so that a fixture too large to ask every star about
 * every pixel can walk them instead. `surveyStars` below is the one that does.
 */
export function starList(size, count = 300) {
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
  return stars;
}

/** A night sky: small bright spots on a dark ground, a few hundred unless asked. */
export function starField(size, count = 300) {
  const stars = starList(size, count);
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
export function noisy(values, sigma, seed) {
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
export const LUMA_TABLE = [
  16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55,
  14, 13, 16, 24, 40, 57, 69, 56, 14, 17, 22, 29, 51, 87, 80, 62,
  18, 22, 37, 56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113, 92,
  49, 64, 78, 87, 103, 121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99,
];
export function jpeg(values, size, q) {
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
export function circularShift(values, size, dx, dy) {
  const out = new Float64Array(size * size);
  for (let y = 0; y < size; y += 1) {
    const from = ((y - dy) % size + size) % size;
    for (let x = 0; x < size; x += 1) {
      out[y * size + x] = values[from * size + (((x - dx) % size + size) % size)];
    }
  }
  return out;
}

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
export const GATE_SIZE = 256;

export function gateFixture(a, b, size = GATE_SIZE) {
  return phaseCorrelate(window2d(a, size), window2d(b, size), size);
}

/** What getImageData does to every square the pipeline builds. */
export function eightBit(values) {
  for (let i = 0; i < values.length; i += 1) {
    values[i] = Math.max(0, Math.min(255, Math.round(values[i])));
  }
  return values;
}

/**
 * A 3:2 picture over 256 by 171 of the square with the rest left transparent
 * black, ANCHORED AT THE TOP - which is not where the pipeline puts it.
 * `placement` centres the box, so a real 3:2 picture's two horizontal edges
 * land at row 43 and row 212, where the square's own Hann has already faded to
 * about a quarter; this one's single edge lands at row 171, at three-quarters
 * weight. Its letterbox step is therefore about three times the pipeline's,
 * and every fixture built on it overstates what the letterbox does.
 *
 * It is kept because the tables on P_MAX and N_MAX were calibrated on it and
 * the tests that pin those readings have to be able to reproduce them. Nothing
 * new should be measured here: `surveyBox` below is the box the pipeline
 * builds, and the tests that measure the change to `window2d` use that.
 *
 * Windowed whole, the edge is left standing, shared by both frames wherever
 * the camera moved, and is the difference between a gradient that measures
 * 0.08 coherence and one that measures 0.56: it pins the vertical, and the
 * slope, which matches itself at any offset, leaves a ridge along the other
 * axis.
 */
export function letterbox(values, size, rows = 171) {
  for (let y = rows; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) values[y * size + x] = 0;
  }
  return values;
}

/**
 * The rectangle `lumaSquare` draws an output of this shape into, and now
 * windows over: `placement`'s own answer, imported rather than restated so
 * that a fixture cannot describe a square the pipeline does not build. A 3:2
 * output is 256 by 170.67 centred at y 42.67; a 2:3 output is the same turned
 * on its side; a square output fills the square and has no letterbox at all,
 * which is the control every one of these measurements is read against.
 */
export const surveyBox = (width, height) => placement(
  { width, height }, { width: GATE_SIZE, height: GATE_SIZE },
);
export const WHOLE_SQUARE = { x: 0, y: 0, width: GATE_SIZE, height: GATE_SIZE };

/** Transparent black everywhere the picture is not, which is what the canvas leaves. */
export function clip(values, size, box) {
  const left = Math.round(box.x);
  const top = Math.round(box.y);
  const right = Math.round(box.x + box.width);
  const bottom = Math.round(box.y + box.height);
  for (let y = 0; y < size; y += 1) {
    const inside = y >= top && y < bottom;
    for (let x = 0; x < size; x += 1) {
      if (!inside || x < left || x >= right) values[y * size + x] = 0;
    }
  }
  return values;
}

/**
 * A photographic black level, added to a scene before it is letterboxed.
 *
 * The letterbox step is as tall as the picture's own mean above black, and
 * these scenes start at zero where a photograph starts at whatever its shadows
 * are. Without this the fixture has a third of a real ridge and does not
 * reproduce the browser at all: the low-texture 3:2 pair below reads 0.10-1.42
 * alignment pixels off with the whole square tapered against 0.08-1.37 with
 * its box, which is no difference. Lifted, it reads 1.36-1.96 against
 * 0.08-1.37 and `next` falls from 0.20-0.31 to 0.12-0.20, which is the
 * direction and roughly the size of what the browser measured on the real
 * path. It is the same trap as the letterbox's own geometry: a fixture that
 * gets the surface's proportions wrong measures a different question.
 */
export const BLACK_LEVEL = 75;
export const lit = (values) => {
  for (let i = 0; i < values.length; i += 1) values[i] += BLACK_LEVEL;
  return values;
};

/**
 * The survey square as the pipeline really builds it, the resize included.
 *
 * Every fixture above is drawn straight into the 256 square, and that is a
 * different subject from the one the coarse pass sees. The pipeline shrinks a
 * whole frame into a 256 long edge first, and the resize averages a
 * photograph's noise down about twelvefold before anything is correlated: what
 * reaches the correlation is a scene whose peak is far sharper than the same
 * scene rendered at 256 with its noise still on it. Reading the coarse gate on
 * a 256-native fixture therefore reads a real answer much nearer the junk than
 * the browser ever puts it, which is how this file once concluded that no
 * floor could sit between the two.
 *
 * So these scenes are rendered at SURVEY_SCALE times the picture's rectangle,
 * given their noise and their 8 bits there, box-averaged down into the
 * rectangle and drawn into the centred box - the order the pipeline does it
 * in, with the resize standing in for createImageBitmap's.
 *
 * THE RATIO IS DERIVED AND NOT CHOSEN. The rectangle's long edge is GATE_SIZE
 * whatever shape the output is, so rendering it at SURVEY_SOURCE / GATE_SIZE
 * puts a SURVEY_SOURCE-pixel frame in front of the same resize the pipeline
 * performs, and 3072 is a phone's frame to a rounding: the browser's own
 * measurements were made at 3000 into 256, which is 11.7. Getting this wrong
 * is not a detail, and the first version of these fixtures got it wrong. At a
 * scale of 6 the low-texture scene at fifteen per cent reads 0.035-0.037 where
 * the browser reads 0.07-0.11, a sparse field reads about half what it reads
 * here, and a floor calibrated on that sits too high to be safe by that much.
 * The comment on N_MAX_SURVEY has the sweep at 4, 6, 8, 10 and 12 against the
 * browser column, and the family-by-family comparison at 12.
 */
export const SURVEY_SOURCE = 3072;
export const SURVEY_SCALE = SURVEY_SOURCE / GATE_SIZE;
export const SURVEY_SEEDS = [1, 3, 5, 7];

/** The picture's rectangle in whole pixels, beside the box `lumaSquare` windows over. */
export function surveyRect(width, height) {
  const box = surveyBox(width, height);
  const left = Math.round(box.x);
  const top = Math.round(box.y);
  return {
    box,
    left,
    top,
    width: Math.round(box.x + box.width) - left,
    height: Math.round(box.y + box.height) - top,
  };
}

/** The scene at that size, before the camera has seen it. */
export function surveyScene(rect, fn, { dx = 0, dy = 0, level = 0 } = {}) {
  const width = rect.width * SURVEY_SCALE;
  const height = rect.height * SURVEY_SCALE;
  const out = new Float64Array(width * height);
  const cx = (width - 1) / 2;
  const cy = (height - 1) / 2;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) out[y * width + x] = fn(x - cx - dx, y - cy - dy);
  }
  return out;
}

/**
 * A star field at the survey scale, drawn star by star rather than pixel by
 * pixel. `starField` asks every star about every pixel, which is fine over a
 * 256 square and is six billion questions over a 3072 one; a star reaches
 * about five pixels, so walking the stars and touching only what each covers
 * is the same picture for a thousandth of the work. The same picture exactly:
 * the base and then each star in list order is the order `starField` adds them
 * in, so the sums are bit for bit identical, measured at a worst difference of
 * zero over a window of the two.
 */
export function surveyStars(rect, stars, { dx = 0, dy = 0, level = 0 } = {}) {
  const width = rect.width * SURVEY_SCALE;
  const height = rect.height * SURVEY_SCALE;
  const out = new Float64Array(width * height).fill(8 + level);
  const cx = (width - 1) / 2;
  const cy = (height - 1) / 2;
  const reach = Math.ceil(Math.sqrt(30));
  for (const star of stars) {
    const px = star.x + cx + dx;
    const py = star.y + cy + dy;
    const x0 = Math.max(0, Math.floor(px - reach));
    const x1 = Math.min(width - 1, Math.ceil(px + reach));
    const y0 = Math.max(0, Math.floor(py - reach));
    const y1 = Math.min(height - 1, Math.ceil(py + reach));
    const spread = 2 * star.spread ** 2;
    for (let y = y0; y <= y1; y += 1) {
      const down = (y - py) ** 2;
      for (let x = x0; x <= x1; x += 1) {
        const d2 = (x - px) ** 2 + down;
        if (d2 < 30) out[y * width + x] += star.brightness * Math.exp(-d2 / spread);
      }
    }
  }
  for (let i = 0; i < out.length; i += 1) if (out[i] > 255) out[i] = 255;
  return out;
}

/** One frame of it: noise and 8 bits at full size, averaged down, drawn into the square. */
export function surveyFrame(scene, rect, sigma, seed) {
  const width = rect.width * SURVEY_SCALE;
  const shot = eightBit(noisy(Float64Array.from(scene), sigma, seed));
  const out = new Float64Array(GATE_SIZE * GATE_SIZE);
  for (let y = 0; y < rect.height; y += 1) {
    for (let x = 0; x < rect.width; x += 1) {
      let sum = 0;
      for (let j = 0; j < SURVEY_SCALE; j += 1) {
        const row = (y * SURVEY_SCALE + j) * width + x * SURVEY_SCALE;
        for (let i = 0; i < SURVEY_SCALE; i += 1) sum += shot[row + i];
      }
      out[(rect.top + y) * GATE_SIZE + rect.left + x] = sum / (SURVEY_SCALE * SURVEY_SCALE);
    }
  }
  return eightBit(out);
}

/** The pair of them, windowed over the picture's box the way `lumaSquare` does. */
export function surveySquares(rect, first, second, sigma, seed) {
  return [
    window2d(surveyFrame(first, rect, sigma, seed), GATE_SIZE, rect.box),
    window2d(surveyFrame(second, rect, sigma, seed + 500), GATE_SIZE, rect.box),
  ];
}

export function surveyPair(rect, first, second, sigma, seed) {
  const [a, b] = surveySquares(rect, first, second, sigma, seed);
  return phaseCorrelate(a, b, GATE_SIZE);
}

/** The same pair over SURVEY_SEEDS, which is what every reading below is a range of. */
export function surveySeeds(rect, first, second, sigma) {
  return SURVEY_SEEDS.map((seed) => surveyPair(rect, first, second, sigma, seed));
}
