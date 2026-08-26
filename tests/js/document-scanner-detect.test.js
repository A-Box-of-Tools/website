/**
 * tools/document-scanner/src/detect.js - where the four corners start.
 *
 * The risk here is not a crash. It is a photograph whose corners are put
 * somewhere confident and wrong: a page cropped to the last line of writing on
 * it, or a scan of the table in the middle of the page rather than of the page.
 * Both look plausible in the strip, both come out as a straightened rectangle,
 * and neither says anything is amiss.
 *
 * So every fixture below is a synthetic photograph of a page whose corners are
 * known to the pixel, and every assertion is about how far the answer is from
 * them, as a percentage of the frame. Half a per cent of a 480 pixel frame is
 * about two pixels, which is finer than anybody drags a corner by hand.
 *
 * The awkward ones matter more than the easy one, and each of them is a bug that
 * was found this way:
 *
 *   - the page covered in lines of text, which is what a page is. Every line is
 *     a strong straight edge at the same angle as the top of the page, and there
 *     are thirty of them; before the places were shared out by angle they took
 *     every slot, the sides of the page never made the list, and the search
 *     returned nothing at all on the clearest photograph in the set.
 *   - the table drawn on the page, which has four crisp sides of its own;
 *   - the shadow across the picture, which is what a person standing over a page
 *     does to it;
 *   - the page that runs off the side of the frame, where the edge that is not
 *     in the photograph is the edge of the photograph;
 *   - and the pictures where the honest answer is "no idea", which have to come
 *     back as a guess rather than as four confident corners.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { findPageQuad } from '../../tools/document-scanner/src/detect.js';
import { homography, project } from '../../tools/document-scanner/src/geometry.js';

/** A repeatable noise source, so a failure can be looked at twice. */
function noise(seed = 7) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const quadOf = (points) => points.map(([x, y]) => ({ x, y }));

/**
 * A photograph of a page: a desk, a sheet lying on it at some angle, lines of
 * text on the sheet, and as much grain and shadow as asked for.
 *
 * Deliberately crude. What is being tested is whether four long straight edges
 * can be found among a lot of other straight edges, and a fixture whose truth is
 * four pairs of numbers at the top of it is one whose failures can be read.
 *
 * The text is drawn in the page's own coordinates and mapped through the same
 * homography as the page, so on an angled photograph the lines of text converge
 * exactly as they would in a real one - which is the whole difficulty.
 */
function photo({
  width = 480,
  height = 360,
  quad,
  paper = [246, 244, 238],
  desk = [92, 82, 74],
  rows = 26,
  grain = 6,
  shadow = 0,
  seed = 7,
  table = null,
  ragged = false,
} = {}) {
  const random = noise(seed);
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

  // Where each line of text ends. Ragged right is the realistic case and the
  // easier one; every line ending at the same place is the adversarial one,
  // because it gives the block of text two long straight sides of its own.
  const ends = [];
  for (let i = 0; i < rows; i += 1) ends.push(ragged ? 0.5 + (0.38 * ((i * 7) % 11)) / 11 : 0.88);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const at = (y * width + x) * 4;
      let rgb;

      if (inside(x + 0.5, y + 0.5)) {
        const p = project(toPage, x + 0.5, y + 0.5);
        const row = Math.max(0, Math.min(rows - 1, Math.floor(p.y * rows)));
        rgb = [...paper];
        if (p.x > 0.12 && p.x < ends[row] && p.y > 0.08 && p.y < 0.92
          && row % 2 === 0 && (p.y * rows) % 1 < 0.45) {
          rgb = [40, 38, 36];
        }
        if (table && p.x > table[0] && p.x < table[2] && p.y > table[1] && p.y < table[3]) {
          const edge = Math.min(
            Math.abs(p.x - table[0]), Math.abs(p.x - table[2]),
            Math.abs(p.y - table[1]), Math.abs(p.y - table[3]),
          );
          if (edge < 0.004) rgb = [20, 20, 20];
        }
      } else {
        rgb = desk.map((c) => c + (random() - 0.5) * 24);
      }

      const light = 1 - shadow * (x / width);
      for (let c = 0; c < 3; c += 1) data[at + c] = rgb[c] * light + (random() - 0.5) * grain;
      data[at + 3] = 255;
    }
  }

  return { data, width, height };
}

/** A picture with no page in it at all. */
function nothingness(kind, width = 480, height = 360) {
  const random = noise(3);
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const at = (y * width + x) * 4;
      let value;
      if (kind === 'flat') value = 128;
      else if (kind === 'noise') value = random() * 255;
      else if (kind === 'gradient') value = 40 + (200 * x) / width;
      else {
        // A head and shoulders against a wall: round, and nothing straight in it.
        const away = Math.hypot(x - 240, y - 200) / 110;
        value = away < 1 ? 200 - 40 * away : 70 + random() * 20;
      }
      data[at] = value;
      data[at + 1] = value;
      data[at + 2] = value;
      data[at + 3] = 255;
    }
  }
  return { data, width, height };
}

/**
 * Assert the corners landed within `slack` per cent of the frame's long side.
 *
 * Reported in per cent because that is the unit the failure is in: two per cent
 * of a photograph is a corner visibly off the page, and a tenth of a per cent is
 * a corner nobody could have placed better by hand.
 */
function near(found, truth, slack, what) {
  const long = 480;
  truth.forEach((corner, index) => {
    const off = Math.hypot(found.quad[index].x - corner.x, found.quad[index].y - corner.y);
    assert.ok(
      (off / long) * 100 <= slack,
      `${what}: the ${['top left', 'top right', 'bottom right', 'bottom left'][index]} corner `
      + `is ${((off / long) * 100).toFixed(2)}% of the frame out, more than the ${slack}% allowed`,
    );
  });
}

/** The page, clipped to the frame, which is what a corner can be dragged to. */
const clipped = (quad, width = 480, height = 360) => quad.map((point) => ({
  x: Math.min(width, Math.max(0, point.x)),
  y: Math.min(height, Math.max(0, point.y)),
}));

/* ============================================================== the easy one */

test('findPageQuad: a page square-on on a dark desk', () => {
  const quad = quadOf([[70, 40], [410, 42], [408, 320], [72, 318]]);
  const found = findPageQuad(photo({ quad }));

  assert.equal(found.found, true);
  assert.equal(found.reason, 'detect.found');
  near(found, quad, 1, 'a page square-on');
});

/* ============================================================ the awkward ones */

test('findPageQuad: thirty lines of text do not crowd out the sides of the page', () => {
  // The failure this is here for returned NOTHING, not a wrong answer: every
  // line kept was a line of text, so there was no pair of lines at right angles
  // to anything and no rectangle could be built at all.
  const quad = quadOf([[52, 30], [430, 88], [392, 330], [30, 250]]);
  const found = findPageQuad(photo({ quad, rows: 30 }));

  assert.equal(found.found, true);
  near(found, quad, 1.5, 'a tilted page of text');
});

test('findPageQuad: a strongly angled photograph', () => {
  const quad = quadOf([[120, 26], [452, 96], [360, 340], [24, 210]]);
  const found = findPageQuad(photo({ quad }));

  assert.equal(found.found, true);
  near(found, quad, 1.5, 'a strongly angled page');
});

test('findPageQuad: the page beats a table drawn on the page', () => {
  // A table has four crisp sides of its own and is entirely inside the thing
  // being looked for. What settles it is the area term in the score.
  const quad = quadOf([[70, 40], [410, 42], [408, 320], [72, 318]]);
  const found = findPageQuad(photo({ quad, table: [0.2, 0.2, 0.8, 0.7] }));

  assert.equal(found.found, true);
  near(found, quad, 1, 'a page with a table on it');
});

test('findPageQuad: a shadow across the picture does not move the corners', () => {
  const quad = quadOf([[64, 36], [418, 50], [404, 322], [58, 310]]);
  const found = findPageQuad(photo({ quad, shadow: 0.45 }));

  assert.equal(found.found, true);
  near(found, quad, 1.5, 'a page in shadow');
});

test('findPageQuad: a grainy phone photograph', () => {
  const quad = quadOf([[64, 36], [418, 50], [404, 322], [58, 310]]);
  const found = findPageQuad(photo({ quad, grain: 26 }));

  assert.equal(found.found, true);
  near(found, quad, 1.5, 'a grainy photograph');
});

test('findPageQuad: ragged right text, which is what text usually is', () => {
  const quad = quadOf([[64, 36], [418, 50], [404, 322], [58, 310]]);
  const found = findPageQuad(photo({ quad, ragged: true }));

  assert.equal(found.found, true);
  near(found, quad, 1.5, 'ragged text');
});

test('findPageQuad: a page running off the side uses the edge of the frame', () => {
  // There is no edge to find on the right, because it was never photographed.
  // The four edges of the picture are candidate lines for exactly this.
  const quad = quadOf([[40, 30], [560, 40], [556, 330], [36, 322]]);
  const found = findPageQuad(photo({ quad }));

  assert.equal(found.found, true);
  near(found, clipped(quad), 1.5, 'a page off the edge');
  assert.ok(found.quad[1].x > 470, 'the right hand corners belong at the frame');
});

test('findPageQuad: a small page on a big desk is still found', () => {
  const quad = quadOf([[170, 120], [320, 122], [318, 250], [168, 248]]);
  const found = findPageQuad(photo({ quad }));

  assert.equal(found.found, true);
  near(found, quad, 1, 'a small page');
});

/* ====================================================== when it does not know */

test('findPageQuad: pictures with no page in them come back as guesses', () => {
  for (const kind of ['flat', 'gradient', 'face', 'noise']) {
    const found = findPageQuad(nothingness(kind));
    assert.equal(found.found, false, `${kind}: claimed to have found a page`);
  }
});

test('findPageQuad: an unsure answer still hands back a usable quad', () => {
  // Whatever happens, four corners come back inside the picture, in order, so
  // the handles are somewhere they can be dragged from rather than nowhere.
  const found = findPageQuad(nothingness('flat'));
  assert.equal(found.quad.length, 4);
  for (const corner of found.quad) {
    assert.ok(corner.x >= 0 && corner.x <= 480 && corner.y >= 0 && corner.y <= 360);
  }
});

test('findPageQuad: a picture too small to hold a page says so', () => {
  const found = findPageQuad({ data: new Uint8ClampedArray(4 * 100), width: 10, height: 10 });
  assert.equal(found.found, false);
  assert.equal(found.reason, 'detect.tiny');
});
