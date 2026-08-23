/**
 * tools/redact-image/src/{regions,redact,files}.js.
 *
 * The risk in this tool is not that it throws. It is that it hands somebody a
 * picture which looks redacted and is not - and the person it fails is the one
 * who has already sent it. So the tests here are about the one property the
 * whole page claims:
 *
 *   - a black fill leaves NOTHING. The strongest statement of that is not "the
 *     pixels are black", it is that two pictures which differed only under the
 *     box come out byte for byte identical. What was there cannot affect what
 *     comes out, so it cannot be in the file.
 *   - a mosaic leaves EXACTLY the averages, and the same test run against
 *     pixelate has to FAIL to be identical - which is why it is written out
 *     here as its own assertion. The page tells people that a mosaic still
 *     carries information; if that ever stopped being true the wording would be
 *     wrong, and if it silently became a fill the wording would be wrong the
 *     other way.
 *   - a blur stays inside its box. Smearing what is being hidden outwards past
 *     the rectangle somebody drew is the one bug in this tool that would be
 *     invisible on screen and fatal in the file.
 *   - the arithmetic that decides how coarse a mosaic is, because it is derived
 *     from the size of the box rather than fixed, and because the number it
 *     produces is printed on the page as a claim about how much survived.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  HANDLES, MIN_SIZE, STRENGTHS, blockCount, blockSize, blurRadius, clampRect,
  contains, fromDrag, isUsable, moveRect, resizeRect, strengthOf, topmostAt,
} from '../../tools/redact-image/src/regions.js';
import {
  FILL, applyRegions, blurRegion, fillRegion, pixelateRegion,
} from '../../tools/redact-image/src/redact.js';
import {
  FORMATS, chooseFormat, countSummary, describeRegion, outName, riskNote,
  sizeText, stemOf, strengthNote,
} from '../../tools/redact-image/src/files.js';

/* ------------------------------------------------------------------ fixtures */

/** A picture whose every pixel is a function of where it is, so nothing is a coincidence. */
function picture(width, height, colour = (x, y) => [x * 7 % 256, y * 11 % 256, (x + y) % 256, 255]) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const at = (y * width + x) * 4;
      const [r, g, b, a] = colour(x, y);
      data[at] = r;
      data[at + 1] = g;
      data[at + 2] = b;
      data[at + 3] = a;
    }
  }
  return { data, width, height };
}

const pixelAt = (image, x, y) => {
  const at = (y * image.width + x) * 4;
  return [image.data[at], image.data[at + 1], image.data[at + 2], image.data[at + 3]];
};

/** The mean of one rectangle, per channel, as the mosaic ought to compute it. */
function meanOf(image, rect) {
  const totals = [0, 0, 0, 0];
  for (let y = rect.y; y < rect.y + rect.height; y += 1) {
    for (let x = rect.x; x < rect.x + rect.width; x += 1) {
      const pixel = pixelAt(image, x, y);
      for (let i = 0; i < 4; i += 1) totals[i] += pixel[i];
    }
  }
  const count = rect.width * rect.height;
  return totals.map((total) => Math.round(total / count));
}

/* ================================================================ the fill */

test('fill: the box is one flat opaque colour and nothing outside it moves', () => {
  const image = picture(20, 12);
  const before = picture(20, 12);
  const rect = { x: 4, y: 3, width: 9, height: 5 };

  fillRegion(image, rect);

  for (let y = 0; y < 12; y += 1) {
    for (let x = 0; x < 20; x += 1) {
      const inside = contains({ ...rect, width: rect.width - 1, height: rect.height - 1 }, { x, y });
      assert.deepEqual(
        pixelAt(image, x, y),
        inside ? [...FILL, 255] : pixelAt(before, x, y),
        `pixel ${x},${y}`,
      );
    }
  }
});

test('fill: what was under the box cannot affect what comes out', () => {
  // The claim on the page, stated as a test: two pictures that differ only
  // inside the box are identical afterwards. If any information survived the
  // redaction, these two would differ by it.
  const rect = { x: 5, y: 5, width: 10, height: 10, style: 'fill' };
  const a = picture(24, 24);
  const b = picture(24, 24, (x, y) => (
    x >= 5 && x < 15 && y >= 5 && y < 15 ? [255, 255, 255, 255] : [x * 7 % 256, y * 11 % 256, (x + y) % 256, 255]
  ));

  applyRegions(a, [rect]);
  applyRegions(b, [rect]);

  assert.deepEqual([...a.data], [...b.data]);
});

test('fill: a transparent area comes back opaque', () => {
  // A box left transparent shows whatever the reader puts behind it, which is
  // not a redaction at all.
  const image = picture(8, 8, () => [10, 20, 30, 0]);
  fillRegion(image, { x: 1, y: 1, width: 4, height: 4 });
  assert.deepEqual(pixelAt(image, 2, 2), [0, 0, 0, 255]);
  assert.equal(pixelAt(image, 6, 6)[3], 0, 'outside the box the transparency is left alone');
});

/* ============================================================= the mosaic */

test('pixelate: every block is the average of the block it replaced', () => {
  const image = picture(16, 16);
  const source = picture(16, 16);
  const rect = { x: 2, y: 2, width: 8, height: 8 };

  pixelateRegion(image, rect, 4);

  for (const [bx, by] of [[2, 2], [6, 2], [2, 6], [6, 6]]) {
    const expected = meanOf(source, { x: bx, y: by, width: 4, height: 4 });
    for (let y = by; y < by + 4; y += 1) {
      for (let x = bx; x < bx + 4; x += 1) {
        assert.deepEqual(pixelAt(image, x, y), expected, `block at ${bx},${by}`);
      }
    }
  }
});

test('pixelate: a block cut short at the edge is averaged over its real size', () => {
  // Padding the last block would drag it towards the colour of pixels that are
  // not in it - visible as a stripe of the wrong shade down the right-hand edge.
  const image = picture(10, 6);
  const source = picture(10, 6);
  const rect = { x: 0, y: 0, width: 10, height: 6 };

  pixelateRegion(image, rect, 4);

  assert.deepEqual(
    pixelAt(image, 8, 0),
    meanOf(source, { x: 8, y: 0, width: 2, height: 4 }),
  );
});

test('pixelate: the grid follows the box rather than the picture', () => {
  // Moving a box by a pixel should move its mosaic, not re-cut it.
  const rect = { x: 3, y: 0, width: 8, height: 4 };
  const image = picture(16, 4);
  const source = picture(16, 4);

  pixelateRegion(image, rect, 4);

  assert.deepEqual(
    pixelAt(image, 3, 0),
    meanOf(source, { x: 3, y: 0, width: 4, height: 4 }),
  );
});

test('pixelate: what was under the box still shows in the averages', () => {
  // The other half of the honesty claim. The page tells people a mosaic carries
  // information about what it replaced; this is that sentence as an assertion,
  // and it is meant to keep failing to be equal.
  const rect = { x: 4, y: 4, width: 8, height: 8, style: 'pixelate' };
  const a = picture(16, 16, () => [0, 0, 0, 255]);
  const b = picture(16, 16, (x, y) => (
    x >= 4 && x < 12 && y >= 4 && y < 12 ? [255, 255, 255, 255] : [0, 0, 0, 255]
  ));

  applyRegions(a, [rect], 'heavy');
  applyRegions(b, [rect], 'heavy');

  assert.notDeepEqual([...a.data], [...b.data]);
});

test('pixelate: nothing outside the box changes', () => {
  const image = picture(20, 20);
  const before = picture(20, 20);
  pixelateRegion(image, { x: 6, y: 6, width: 8, height: 8 }, 3);

  for (let y = 0; y < 20; y += 1) {
    for (let x = 0; x < 20; x += 1) {
      if (x >= 6 && x < 14 && y >= 6 && y < 14) continue;
      assert.deepEqual(pixelAt(image, x, y), pixelAt(before, x, y), `pixel ${x},${y}`);
    }
  }
});

/* =============================================================== the blur */

test('blur: nothing outside the box changes, however bright the box is', () => {
  // The dangerous direction: a blur that read or wrote past its rectangle would
  // smear what is being hidden into the part of the picture nobody covered.
  const image = picture(30, 30, (x, y) => (
    x >= 10 && x < 20 && y >= 10 && y < 20 ? [255, 255, 255, 255] : [0, 0, 0, 255]
  ));
  const before = picture(30, 30, (x, y) => (
    x >= 10 && x < 20 && y >= 10 && y < 20 ? [255, 255, 255, 255] : [0, 0, 0, 255]
  ));

  blurRegion(image, { x: 8, y: 8, width: 14, height: 14 }, 5);

  for (let y = 0; y < 30; y += 1) {
    for (let x = 0; x < 30; x += 1) {
      if (x >= 8 && x < 22 && y >= 8 && y < 22) continue;
      assert.deepEqual(pixelAt(image, x, y), pixelAt(before, x, y), `pixel ${x},${y}`);
    }
  }
});

test('blur: a flat colour survives a blur unchanged', () => {
  // Three passes of a sliding-window average over one value have to give that
  // value back. A rounding or window-size mistake shows up here as a shift.
  const image = picture(12, 12, () => [120, 60, 200, 255]);
  blurRegion(image, { x: 0, y: 0, width: 12, height: 12 }, 3);
  for (let y = 0; y < 12; y += 1) {
    for (let x = 0; x < 12; x += 1) {
      assert.deepEqual(pixelAt(image, x, y), [120, 60, 200, 255], `pixel ${x},${y}`);
    }
  }
});

test('blur: an edge is softened rather than kept', () => {
  const image = picture(16, 4, (x) => (x < 8 ? [0, 0, 0, 255] : [255, 255, 255, 255]));
  blurRegion(image, { x: 0, y: 0, width: 16, height: 4 }, 3);

  const left = pixelAt(image, 7, 1)[0];
  const right = pixelAt(image, 8, 1)[0];
  assert.ok(left > 0 && left < 255, `the dark side of the edge moved: ${left}`);
  assert.ok(right > 0 && right < 255, `the light side of the edge moved: ${right}`);
  assert.ok(right > left, 'the edge still runs the same way');
});

/* ========================================================= applying them all */

test('applyRegions: later boxes are drawn over earlier ones', () => {
  const image = picture(20, 20);
  applyRegions(image, [
    { x: 0, y: 0, width: 20, height: 20, style: 'pixelate' },
    { x: 5, y: 5, width: 5, height: 5, style: 'fill' },
  ]);
  assert.deepEqual(pixelAt(image, 7, 7), [0, 0, 0, 255]);
});

test('applyRegions: a box hanging off the picture is clamped, not skipped', () => {
  const image = picture(10, 10);
  applyRegions(image, [{ x: -5, y: -5, width: 8, height: 8, style: 'fill' }]);
  assert.deepEqual(pixelAt(image, 0, 0), [0, 0, 0, 255]);
  assert.notDeepEqual(pixelAt(image, 9, 9), [0, 0, 0, 255]);
});

test('applyRegions: an unknown style is treated as a fill', () => {
  // Failing open here would mean a box that covers nothing, which is the one
  // failure mode this tool must not have.
  const image = picture(8, 8);
  applyRegions(image, [{ x: 0, y: 0, width: 8, height: 8, style: 'nonsense' }]);
  assert.deepEqual(pixelAt(image, 4, 4), [0, 0, 0, 255]);
});

/* ============================================================== the geometry */

test('fromDrag: the corners come out in order whichever way the pointer went', () => {
  const forwards = fromDrag({ x: 3, y: 4 }, { x: 13, y: 24 });
  const backwards = fromDrag({ x: 13, y: 24 }, { x: 3, y: 4 });
  assert.deepEqual(forwards, { x: 3, y: 4, width: 10, height: 20 });
  assert.deepEqual(forwards, backwards);
});

test('isUsable: a click that wobbled is not a box', () => {
  assert.equal(isUsable({ width: MIN_SIZE, height: MIN_SIZE }), true);
  assert.equal(isUsable({ width: MIN_SIZE - 1, height: 40 }), false);
});

test('clampRect: a box is pushed inside the picture rather than rejected', () => {
  const source = { width: 100, height: 50 };
  assert.deepEqual(
    clampRect({ x: -10, y: -10, width: 30, height: 20 }, source),
    { x: 0, y: 0, width: 30, height: 20 },
  );
  assert.deepEqual(
    clampRect({ x: 90, y: 40, width: 30, height: 30 }, source),
    { x: 70, y: 20, width: 30, height: 30 },
  );
  assert.deepEqual(
    clampRect({ x: 0, y: 0, width: 500, height: 500 }, source),
    { x: 0, y: 0, width: 100, height: 50 },
  );
});

test('moveRect: a box cannot be dragged off the picture', () => {
  const source = { width: 60, height: 60 };
  const rect = { x: 10, y: 10, width: 20, height: 20 };
  assert.deepEqual(moveRect(rect, -50, 0, source).x, 0);
  assert.deepEqual(moveRect(rect, 100, 0, source).x, 40);
});

test('resizeRect: each handle moves the edges it touches, and only those', () => {
  const source = { width: 100, height: 100 };
  const rect = { x: 20, y: 20, width: 40, height: 40 };

  assert.deepEqual(resizeRect(rect, 'e', 10, 0, source), { x: 20, y: 20, width: 50, height: 40 });
  assert.deepEqual(resizeRect(rect, 'w', 10, 0, source), { x: 30, y: 20, width: 30, height: 40 });
  assert.deepEqual(resizeRect(rect, 'n', 0, 10, source), { x: 20, y: 30, width: 40, height: 30 });
  assert.deepEqual(resizeRect(rect, 'se', 5, 7, source), { x: 20, y: 20, width: 45, height: 47 });
});

test('resizeRect: dragging an edge past its opposite flips the box', () => {
  const source = { width: 100, height: 100 };
  const flipped = resizeRect({ x: 20, y: 20, width: 40, height: 40 }, 'e', -60, 0, source);
  assert.deepEqual(flipped, { x: 0, y: 20, width: 20, height: 40 });
});

test('resizeRect: every handle is one this understands', () => {
  const source = { width: 100, height: 100 };
  for (const handle of HANDLES) {
    const rect = resizeRect({ x: 20, y: 20, width: 40, height: 40 }, handle, 6, 6, source);
    assert.notDeepEqual(rect, { x: 20, y: 20, width: 40, height: 40 }, `handle ${handle} did nothing`);
  }
});

test('topmostAt: the box on top is the one the pointer is on', () => {
  const under = { id: 'a', x: 0, y: 0, width: 50, height: 50 };
  const over = { id: 'b', x: 10, y: 10, width: 10, height: 10 };
  assert.equal(topmostAt([under, over], { x: 15, y: 15 }).id, 'b');
  assert.equal(topmostAt([under, over], { x: 40, y: 40 }).id, 'a');
  assert.equal(topmostAt([under, over], { x: 80, y: 80 }), null);
});

/* ============================================================== the strength */

test('blockSize: measured against the box, so one setting behaves the same at any size', () => {
  // The same picture at ten times the resolution has to come out as the same
  // mosaic, or "medium" would mean something different per camera.
  const small = blockCount({ width: 400, height: 200 }, 'medium');
  const large = blockCount({ width: 4000, height: 2000 }, 'medium');
  assert.equal(large.across, small.across);
  assert.equal(large.down, small.down);
  assert.ok(Math.abs(large.size / small.size - 10) < 0.5, `${large.size} vs ${small.size}`);
});

test('blockSize: never smaller than three pixels', () => {
  // Below that the "blocks" are noise at any normal viewing size, and the
  // mosaic stops being a redaction at all.
  assert.ok(blockSize({ width: 100, height: 8 }, 'heavy') >= 3);
  assert.ok(blockSize({ width: 4, height: 4 }, 'heavy') >= 3);
});

test('blockSize: heavier means fewer, larger blocks', () => {
  const rect = { width: 600, height: 300 };
  assert.ok(blockSize(rect, 'heavy') > blockSize(rect, 'medium'));
  assert.ok(blockSize(rect, 'medium') > blockSize(rect, 'light'));
  assert.ok(blockCount(rect, 'heavy').across < blockCount(rect, 'light').across);
});

test('blockCount: counts the short block at the edge as a block', () => {
  const blocks = blockCount({ width: 100, height: 100 }, 'medium');
  assert.equal(blocks.size, blockSize({ width: 100, height: 100 }, 'medium'));
  assert.equal(blocks.across, Math.ceil(100 / blocks.size));
});

test('blurRadius: scales with the box and never falls below two', () => {
  assert.equal(blurRadius({ width: 2800, height: 1400 }, 'medium'), 100);
  assert.ok(blurRadius({ width: 10, height: 10 }, 'light') >= 2);
});

test('strengthOf: an unknown strength falls back to the middle one', () => {
  assert.equal(strengthOf('nonsense'), STRENGTHS.medium);
  assert.equal(strengthOf('heavy'), STRENGTHS.heavy);
});

/* ================================================================== the words */

test('stemOf: the extension goes and nothing else does', () => {
  assert.equal(stemOf('bank statement.final.png'), 'bank statement.final');
  assert.equal(stemOf('noextension'), 'noextension');
  assert.equal(stemOf(''), 'image');
  assert.equal(stemOf(undefined), 'image');
});

test('outName: says it is the redacted one, in every name it can produce', () => {
  assert.equal(outName('scan', FORMATS.png), 'scan-redacted.png');
  assert.equal(outName('my passport (2)', FORMATS.jpeg), 'my-passport-2-redacted.jpg');
  assert.equal(outName('...', FORMATS.webp), 'image-redacted.webp');
});

test('chooseFormat: auto keeps a photograph a photograph', () => {
  assert.equal(chooseFormat('auto', 'image/jpeg'), FORMATS.jpeg);
  assert.equal(chooseFormat('auto', 'image/png'), FORMATS.png);
  assert.equal(chooseFormat('auto', ''), FORMATS.png);
  assert.equal(chooseFormat('webp', 'image/jpeg'), FORMATS.webp);
  assert.equal(chooseFormat('nonsense', 'image/jpeg'), FORMATS.png);
});

test('sizeText: bytes, KB and MB, in the units people read', () => {
  assert.equal(sizeText(900), '900 B');
  assert.equal(sizeText(2048), '2.0 KB');
  assert.equal(sizeText(5 * 1024 * 1024), '5.00 MB');
});

test('describeRegion: a mosaic row says how many blocks it is made of', () => {
  const row = describeRegion({ x: 10, y: 20, width: 200, height: 100, style: 'pixelate' }, 'medium');
  assert.match(row, /200 x 100 at 10, 20/);
  assert.match(row, /11 px blocks \(19 x 10\)/);

  assert.match(
    describeRegion({ x: 0, y: 0, width: 60, height: 60, style: 'fill' }, 'medium'),
    /blacked out$/,
  );
  assert.match(
    describeRegion({ x: 0, y: 0, width: 60, height: 60, style: 'blur' }, 'medium'),
    /blurred, 4 px radius$/,
  );
});

test('countSummary: says nothing at all until there is something to say', () => {
  assert.equal(countSummary([]), '');
  assert.equal(countSummary([{ style: 'fill' }]), '1 area: 1 blacked out.');
  assert.equal(
    countSummary([{ style: 'fill' }, { style: 'fill' }, { style: 'blur' }]),
    '3 areas: 2 blacked out, 1 blurred.',
  );
});

test('riskNote: silent when every box is a fill, and counted when one is not', () => {
  assert.equal(riskNote([{ style: 'fill', width: 100, height: 100 }], 'medium'), null);
  assert.equal(riskNote([], 'medium'), null);

  const note = riskNote([{ style: 'pixelate', x: 0, y: 0, width: 300, height: 60 }], 'medium');
  const blocks = blockCount({ width: 300, height: 60 }, 'medium');
  assert.match(note, new RegExp(`${blocks.across} x ${blocks.down} blocks`));
  assert.match(note, new RegExp(`${blocks.across * blocks.down} averages`));
  assert.match(note, /Black out anything that reads as text\./);
});

test('riskNote: reports the finest mosaic, because that is the one worth worrying about', () => {
  const coarse = { style: 'pixelate', x: 0, y: 0, width: 40, height: 40 };
  const fine = { style: 'pixelate', x: 0, y: 0, width: 600, height: 200 };
  const note = riskNote([coarse, fine], 'medium');
  const blocks = blockCount(fine, 'medium');
  assert.match(note, new RegExp(`${blocks.across} x ${blocks.down} blocks`));
});

test('riskNote: a blur is reported by its radius', () => {
  const note = riskNote([{ style: 'blur', x: 0, y: 0, width: 280, height: 140 }], 'medium');
  assert.match(note, /radius of 10 px/);
});

test('strengthNote: names the setting and the number behind it', () => {
  assert.match(strengthNote('heavy'), /^Heavy/);
  assert.match(strengthNote('heavy'), new RegExp(`${STRENGTHS.heavy.blocks} blocks`));
});
