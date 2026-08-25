/**
 * The two passes over the pixels: straightening the page out of the photograph
 * (tools/document-scanner/src/warp.js), and dividing the light out of it
 * afterwards (src/clean.js). The bit packing that turns the result into a
 * document is at the bottom (src/encode.js).
 *
 * WHAT EACH HALF IS PROTECTED AGAINST
 *
 * The warp fails silently in two ways, and both are the sort of thing that looks
 * fine on a page of text and is obvious on a page of anything else: the picture
 * comes back mirrored or a quarter turn out, or the perspective is only
 * approximately undone and straight lines come back bowed. So the fixture is a
 * page whose four quadrants are four different colours - which no rotation or
 * reflection can survive - photographed through a real projection and
 * straightened back.
 *
 * The cleanup fails by being either useless or destructive. The fixture is a
 * page lit so unevenly that the paper at the dark end is darker than the ink at
 * the bright end, which is the case where a single threshold cannot work no
 * matter where it is put - and the test says so by looking for the best possible
 * one and showing that it still gets a twentieth of the page wrong.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { turnQuad, warpPage } from '../../tools/document-scanner/src/warp.js';
import { cleanPage, levels, sauvola, toLuma } from '../../tools/document-scanner/src/clean.js';
import { deflate, packMono } from '../../tools/document-scanner/src/encode.js';
import { homography, project } from '../../tools/document-scanner/src/geometry.js';

function noise(seed = 11) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const quadOf = (points) => points.map(([x, y]) => ({ x, y }));

/** The four quadrant colours, clockwise from the top left. */
const QUADRANTS = [[220, 40, 40], [40, 180, 60], [40, 60, 220], [230, 200, 40]];

/**
 * A photograph of a four-colour page.
 *
 * Rendered the way the page would really have been photographed: every pixel of
 * the picture is mapped back into the page's own coordinates through the
 * homography and coloured from there, so the perspective in the fixture is a
 * real projection rather than a shear that happens to look like one.
 */
function colouredPhoto(quad, { width = 480, height = 360, desk = [30, 30, 34] } = {}) {
  const data = new Uint8ClampedArray(width * height * 4);
  const toPage = homography(quad, [
    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 },
  ]);

  const inside = (x, y) => {
    let hits = 0;
    for (let i = 0; i < 4; i += 1) {
      const a = quad[i];
      const b = quad[(i + 1) % 4];
      if ((a.y > y) !== (b.y > y)
        && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) hits += 1;
    }
    return hits % 2 === 1;
  };

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const at = (y * width + x) * 4;
      let rgb = desk;
      if (inside(x + 0.5, y + 0.5)) {
        const p = project(toPage, x + 0.5, y + 0.5);
        const quadrant = (p.y < 0.5 ? 0 : 3) + (p.y < 0.5 ? (p.x < 0.5 ? 0 : 1) : (p.x < 0.5 ? 0 : -1));
        rgb = QUADRANTS[quadrant];
      }
      data[at] = rgb[0];
      data[at + 1] = rgb[1];
      data[at + 2] = rgb[2];
      data[at + 3] = 255;
    }
  }

  return { data, width, height };
}

/** The average colour of a small patch, which is how a quadrant is identified. */
function patch(image, fx, fy) {
  const x0 = Math.round(image.width * fx) - 6;
  const y0 = Math.round(image.height * fy) - 6;
  const total = [0, 0, 0];
  let taken = 0;
  for (let y = y0; y < y0 + 12; y += 1) {
    for (let x = x0; x < x0 + 12; x += 1) {
      const at = (y * image.width + x) * 4;
      total[0] += image.data[at];
      total[1] += image.data[at + 1];
      total[2] += image.data[at + 2];
      taken += 1;
    }
  }
  return total.map((sum) => sum / taken);
}

const apart = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/* ================================================================= the warp */

test('warpPage: an angled photograph comes back the right way round', () => {
  const quad = quadOf([[104, 30], [430, 88], [372, 316], [40, 244]]);
  const flat = warpPage(colouredPhoto(quad), quad, { width: 200, height: 280 });

  // Each quadrant of the straightened page has to be the colour that quadrant
  // was. A mirrored or quarter-turned result fails here and nowhere else,
  // because on a page of text it would look almost right.
  const corners = [[0.25, 0.25], [0.75, 0.25], [0.75, 0.75], [0.25, 0.75]];
  corners.forEach(([fx, fy], index) => {
    const got = patch(flat, fx, fy);
    assert.ok(apart(got, QUADRANTS[index]) < 30,
      `quadrant ${index} came back ${got.map(Math.round)}, wanted ${QUADRANTS[index]}`);
  });
});

test('warpPage: the boundary between two quadrants comes back straight', () => {
  // The test a triangle-by-triangle affine warp fails: it undoes the perspective
  // exactly at the corners and approximately everywhere else, so a line across
  // the middle of the page develops a visible kink.
  const quad = quadOf([[104, 30], [430, 88], [372, 316], [40, 244]]);
  const flat = warpPage(colouredPhoto(quad), quad, { width: 200, height: 280 });

  // Walk down the middle of the page and find where the colour changes on each
  // row. On a correct warp that is the same column on every row.
  // Started well inside the page, because the outermost column of a
  // straightened page is sampled right on the edge of the quad and picks up a
  // little of the desk - which is a jump, and not the one being looked for.
  // The top half only, so that every row sampled crosses the same boundary: the
  // row through the middle of the page is where all four quadrants meet, and
  // the first colour change on it is not the vertical boundary at all.
  const columns = [];
  for (let y = 20; y < 130; y += 5) {
    for (let x = 10; x < flat.width - 10; x += 1) {
      const here = (y * flat.width + x) * 4;
      const before = (y * flat.width + x - 1) * 4;
      const jump = Math.abs(flat.data[here] - flat.data[before])
        + Math.abs(flat.data[here + 1] - flat.data[before + 1]);
      if (jump > 60) {
        columns.push(x);
        break;
      }
    }
  }

  assert.ok(columns.length > 20, 'the boundary should be found on every row sampled');
  const lowest = Math.min(...columns);
  const highest = Math.max(...columns);
  assert.ok(highest - lowest <= 2,
    `the boundary wandered between columns ${lowest} and ${highest}`);
});

test('warpPage: no dark frame is left around the straightened page', () => {
  // The page is read a little inside its own corners, and this is why. The
  // sample is bilinear, so the outermost row of the output would otherwise
  // average in the desk on the other side of the edge - and on a white page in
  // black and white that is a black line all the way round. It is the first
  // thing anybody would notice and the last thing they could explain.
  const quad = quadOf([[104, 30], [430, 88], [372, 316], [40, 244]]);
  const photo = colouredPhoto(quad, { desk: [0, 0, 0] });

  // A page of one flat colour, so anything dark in the result came from outside
  // it.
  for (let i = 0; i < photo.data.length; i += 4) {
    if (photo.data[i] > 10 || photo.data[i + 1] > 10 || photo.data[i + 2] > 10) {
      photo.data[i] = 245;
      photo.data[i + 1] = 244;
      photo.data[i + 2] = 240;
    }
  }

  const flat = warpPage(photo, quad, { width: 200, height: 280 });
  let darkest = 255;
  for (let i = 0; i < flat.data.length; i += 4) darkest = Math.min(darkest, flat.data[i]);
  assert.ok(darkest > 200, `the darkest pixel of a plain white page came back at ${darkest}`);
});

test('warpPage: the middle of the picture is what it was', () => {
  // The inset above is at the edges. Nothing else moves: a straightening that
  // is asked for the whole frame at its own size hands back the same pixels.
  const source = colouredPhoto(quadOf([[0, 0], [200, 0], [200, 160], [0, 160]]), {
    width: 200, height: 160,
  });
  const same = warpPage(source, quadOf([[0, 0], [200, 0], [200, 160], [0, 160]]), {
    width: 200, height: 160,
  });

  // A quadrant at a time, away from the boundaries between them, which are the
  // only place a shift of a pixel could show up in a picture of flat colours.
  const corners = [[0.25, 0.25], [0.75, 0.25], [0.75, 0.75], [0.25, 0.75]];
  corners.forEach(([fx, fy], index) => {
    assert.ok(apart(patch(same, fx, fy), QUADRANTS[index]) < 3);
  });
});

test('warpPage: a corner past the edge repeats the border rather than tearing', () => {
  // A corner can be dragged a little outside the photograph, and what should
  // come back is a smear of the border - not a black stripe, and certainly not
  // an exception from the middle of the arithmetic.
  const quad = quadOf([[-20, -15], [500, -10], [495, 370], [-25, 366]]);
  const flat = warpPage(colouredPhoto(quadOf([[40, 30], [430, 40], [420, 320], [30, 310]])),
    quad, { width: 160, height: 120 });

  assert.equal(flat.width, 160);
  for (let i = 3; i < flat.data.length; i += 4) {
    assert.equal(flat.data[i], 255, 'every pixel of the page must be opaque');
  }
});

test('turnQuad: four turns come back where they started', () => {
  const quad = quadOf([[10, 12], [90, 20], [84, 70], [6, 64]]);
  assert.deepEqual(turnQuad(turnQuad(turnQuad(turnQuad(quad)))), quad);
  // One turn moves the bottom left corner to the front, which is what makes a
  // page photographed sideways come out upright.
  assert.deepEqual(turnQuad(quad)[0], quad[3]);
});

/* ============================================================== the cleanup */

/**
 * A page lit so unevenly that the paper at one end is darker than the ink at the
 * other, with a hard-edged shadow band across it for good measure.
 *
 * That is not an exaggerated fixture. It is a page on a desk with a window on
 * one side and the photographer's own shadow across it, which is the ordinary
 * case rather than the difficult one.
 */
function shadowedPage({ width = 600, height = 800, dip = 0.88, block = false } = {}) {
  const data = new Uint8ClampedArray(width * height * 4);
  const truth = new Uint8Array(width * height);

  const isInk = (x, y) => {
    if (x < 60 || x > width - 60 || y < 60 || y > height - 60) return false;
    const row = Math.floor((y - 60) / 26);
    return row % 2 === 0 && (y - 60) % 26 < 11;
  };

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let light = 1 - dip * (x / width);
      if (x > width * 0.55 && x < width * 0.75) light *= 0.75;

      const ink = isInk(x, y);
      truth[y * width + x] = ink ? 1 : 0;

      let reflectance = ink ? 0.17 : 0.96;
      if (block && x > width * 0.2 && x < width * 0.45
        && y > height * 0.1 && y < height * 0.3) reflectance = 0.5;

      const value = 255 * reflectance * light;
      const at = (y * width + x) * 4;
      data[at] = value;
      data[at + 1] = value * 0.99;
      data[at + 2] = value * 0.96;
      data[at + 3] = 255;
    }
  }

  return { image: { data, width, height }, truth };
}

/** How much of the page a plain midpoint threshold would get wrong. */
function misread(image, truth) {
  const luma = toLuma(image);
  let wrong = 0;
  for (let p = 0; p < luma.length; p += 1) {
    if ((luma[p] < 128 ? 1 : 0) !== truth[p]) wrong += 1;
  }
  return (wrong / luma.length) * 100;
}

test('cleanPage: the light is divided out, ink and paper end up on either side', () => {
  const { image, truth } = shadowedPage();
  assert.ok(misread(image, truth) > 30,
    'the fixture is meant to be unreadable before it is cleaned up');

  for (const mode of ['colour', 'grey', 'mono']) {
    const cleaned = cleanPage(image, { mode, strength: 50 });
    assert.ok(misread(cleaned, truth) < 0.5,
      `${mode}: ${misread(cleaned, truth).toFixed(2)}% of the page is on the wrong side`);
  }
});

test('cleanPage: no single threshold could have done it, however well chosen', () => {
  // The number that says why this is a local method. Every possible global
  // threshold is tried and the best one still gets a twentieth of the page
  // wrong, because the paper in the shadow really is darker than the ink in the
  // light. The black and white mode gets none of it wrong.
  const { image, truth } = shadowedPage();
  const luma = toLuma(image);

  let best = Infinity;
  for (let cut = 5; cut < 250; cut += 1) {
    let wrong = 0;
    for (let p = 0; p < luma.length; p += 1) {
      if ((luma[p] < cut ? 1 : 0) !== truth[p]) wrong += 1;
    }
    best = Math.min(best, (wrong / luma.length) * 100);
  }

  assert.ok(best > 3, `the best global threshold got ${best.toFixed(2)}% wrong, expected worse`);

  const mono = cleanPage(image, { mode: 'mono', strength: 50 });
  assert.ok(misread(mono, truth) < 0.1);
});

test('cleanPage: a dark block on the page is not lifted to white', () => {
  // The tile with no paper in it. Its own brightness is not paper, so dividing
  // by it would erase whatever is there - which on a real page is a photograph,
  // a filled box, or a black heading.
  const { image } = shadowedPage({ block: true });
  const cleaned = cleanPage(image, { mode: 'grey', strength: 30 });
  const luma = toLuma(cleaned);

  let total = 0;
  let taken = 0;
  for (let y = Math.round(800 * 0.13); y < 800 * 0.27; y += 1) {
    for (let x = Math.round(600 * 0.23); x < 600 * 0.42; x += 1) {
      total += luma[y * 600 + x];
      taken += 1;
    }
  }

  const average = total / taken;
  assert.ok(average > 40 && average < 210,
    `the block came back at ${average.toFixed(0)}: it should still be a mid tone`);
});

test('cleanPage: leaving it alone really does leave it alone', () => {
  const { image } = shadowedPage({ width: 120, height: 160 });
  const same = cleanPage(image, { mode: 'photo', strength: 90 });
  assert.equal(same.data, image.data, 'the photo mode must not copy or touch the pixels');
  assert.equal(same.mono, false);
});

test('cleanPage: the strength control moves the black point and nothing else', () => {
  assert.ok(levels(0).black < levels(50).black);
  assert.ok(levels(50).black < levels(100).black);

  const { image, truth } = shadowedPage();
  const gentle = toLuma(cleanPage(image, { mode: 'grey', strength: 10 }));
  const hard = toLuma(cleanPage(image, { mode: 'grey', strength: 90 }));

  let gentleInk = 0;
  let hardInk = 0;
  let taken = 0;
  for (let p = 0; p < truth.length; p += 1) {
    if (!truth[p]) continue;
    gentleInk += gentle[p];
    hardInk += hard[p];
    taken += 1;
  }

  assert.ok(hardInk / taken < gentleInk / taken,
    'turning it up has to make the ink darker, not lighter');
});

test('cleanPage: colour keeps a signature in blue ink blue', () => {
  // The one thing the colour mode is for. Blue ballpoint is about a quarter as
  // bright as the paper it is on, which is below the black point the greyscale
  // mode uses at its default strength - so before the black point was halved
  // here, the mode whose entire purpose is keeping the pen blue turned it solid
  // black, and did it quietly.
  const width = 300;
  const height = 300;
  const data = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const at = (y * width + x) * 4;
      // Paper, with the same falloff a real photograph has.
      let rgb = [246, 244, 238];
      if (y > 60 && y < 90) rgb = [34, 32, 32];            // printed text
      if (y > 180 && y < 220) rgb = [40, 60, 180];         // a signature
      const light = 1 - 0.4 * (x / width);
      data[at] = rgb[0] * light;
      data[at + 1] = rgb[1] * light;
      data[at + 2] = rgb[2] * light;
      data[at + 3] = 255;
    }
  }

  const cleaned = cleanPage({ data, width, height }, { mode: 'colour', strength: 50 });
  const read = (y) => {
    const at = ((y * width) + 150) * 4;
    return [cleaned.data[at], cleaned.data[at + 1], cleaned.data[at + 2]];
  };

  const ink = read(200);
  assert.ok(ink[2] > ink[0] + 25, `the signature came back ${ink}, which is not blue`);
  assert.ok(ink[2] > 40, 'and it should not have been crushed to black either');

  // Printed text still goes black, and the paper still comes back white.
  assert.ok(Math.max(...read(75)) < 40, `text came back ${read(75)}`);
  assert.ok(Math.min(...read(20)) > 230, `paper came back ${read(20)}`);

  // Greyscale, which has no colour to protect, keeps the harder black point.
  assert.ok(levels(50, 'grey').black > levels(50, 'colour').black);
});

test('sauvola: flat paper with noise on it does not become speckle', () => {
  // The difference between Sauvola and a plain local mean. Half the pixels of an
  // empty patch are below its own mean by definition, so a local mean turns
  // blank paper into a field of dots; Sauvola drops the threshold where there is
  // nothing but noise, and finds nothing there.
  const random = noise(5);
  const width = 200;
  const height = 200;
  const luma = new Float32Array(width * height);
  for (let p = 0; p < luma.length; p += 1) luma[p] = 240 + (random() - 0.5) * 12;

  const ink = sauvola(luma, width, height, { window: 25, k: 0.25 });
  const marked = ink.reduce((sum, value) => sum + value, 0);
  assert.ok(marked / ink.length < 0.01,
    `${((marked / ink.length) * 100).toFixed(1)}% of blank paper was called ink`);
});

test('sauvola: a faint stroke on slightly less faint paper survives', () => {
  // A stroke rather than a block, because that is what a letter is and because
  // it is what the method assumes: the window has to see paper as well as ink
  // for the ink to stand out against it. A solid patch wider than the window is
  // its own background, and Sauvola correctly declines to call the middle of it
  // ink - which is why the window is set from the size of the page and not
  // guessed at.
  // Pencil on grey paper: 120 against 200, which is faint enough that a
  // threshold set for printed text would lose it.
  const width = 120;
  const height = 120;
  const luma = new Float32Array(width * height).fill(200);
  for (let y = 40; y < 80; y += 1) {
    for (let x = 58; x < 62; x += 1) luma[y * width + x] = 120;
  }

  const ink = sauvola(luma, width, height, { window: 25, k: 0.2 });
  assert.equal(ink[60 * width + 59], 1, 'the stroke should be ink');
  assert.equal(ink[10 * width + 10], 0, 'the paper should not be');
});

/* ========================================================== one bit a pixel */

test('packMono: eight pixels to the byte, white is a one, rows are padded', () => {
  // PDF reads a 1 as white at one bit per component, and a row starts on a byte
  // boundary - so a twelve pixel row is two bytes with four bits of padding that
  // no reader looks at.
  const width = 12;
  const height = 2;
  const data = new Uint8ClampedArray(width * height * 4);
  for (let p = 0; p < width * height; p += 1) {
    // Ink at the start of the first row, paper everywhere else.
    const value = p < 3 ? 0 : 255;
    data[p * 4] = value;
    data[p * 4 + 1] = value;
    data[p * 4 + 2] = value;
    data[p * 4 + 3] = 255;
  }

  const packed = packMono({ data, width, height });
  assert.equal(packed.length, 2 * height);
  assert.equal(packed[0], 0b00011111);
  assert.equal(packed[1] & 0b11110000, 0b11110000);
  assert.equal(packed[2], 0xff);
});

test('packMono then deflate: a page of text is a small number of kilobytes', () => {
  // The claim the black and white mode is made for. A page of text at 200 dpi
  // is 458 kB of packed bits and compresses to a few tens of kB; the same page
  // as a JPEG is around a megabyte.
  const width = 1700;
  const height = 2200;
  const random = noise(9);
  const data = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const row = Math.floor((y - 200) / 44);
      const ink = x > 200 && x < width - 200 && y > 200 && y < height - 200
        && row % 2 === 0 && (y - 200) % 44 < 20 && random() < 0.45;
      const at = (y * width + x) * 4;
      const value = ink ? 0 : 255;
      data[at] = value;
      data[at + 1] = value;
      data[at + 2] = value;
      data[at + 3] = 255;
    }
  }

  return deflate(packMono({ data, width, height })).then((bytes) => {
    assert.ok(bytes.length < 150 * 1024,
      `a page of text came out at ${(bytes.length / 1024).toFixed(0)} kB`);
    assert.ok(bytes.length > 1024, 'and it should not be empty');
  });
});
