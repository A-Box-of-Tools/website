/**
 * tools/stack-images/src/pipeline.js - the part of the run that needs no canvas.
 *
 * The pipeline is written for a worker and touches no DOM at module scope, so
 * it loads here; what it does with a decoder and a surface is exercised in a
 * browser and not in this file. What it works out BEFORE it touches either is
 * pinned here, and there is more of that than the shape of the module
 * suggests: the whole refinement ladder is arithmetic over nine measured
 * shifts, and the crop is arithmetic over the moves it ends with.
 *
 * `compose` earns its place at the top of that list. It is the one step that
 * has to be right for a rotated burst rather than merely for a shifted one,
 * and a negated sine in it does not throw and does not look wrong in review -
 * it turns every frame the wrong way and doubles the blur the refinement was
 * added to remove. So it is checked against the composition it claims to be,
 * by pushing points through the two transforms in turn.
 *
 * `declaredSize`, because every later stage plans from the number it returns
 * and the number has to be the size the decode will actually have. That is
 * the bug this file exists to keep fixed: a portrait JPEG from a phone is
 * stored sideways with an Exif tag saying so, the browser's decoder turns it
 * upright, and a size read off the frame header alone is a quarter turn out
 * from the bitmap. Three such frames used to come back as one squashed
 * landscape.
 *
 * And `openFrame`, which needs a File and nothing else, because the rule it
 * implements for a RAW preview has four arms - the preview's own Exif wins;
 * with none, the RAW's directory is applied here; with the head unable to
 * say, a longer read; and after that, none - and a wrong arm does not fail,
 * it turns one frame twice or not at all.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  EXIF_ID, IHDR, PNG_SIGNATURE, TIFF_LE, TIFF_TYPE, ascii, concat, segment, tiffEntry, tiffOf,
  u16be, u32be,
} from './helpers.js';
import { NO_MOVE } from '../../tools/stack-images/src/align.js';
import { REFINE_GRID, REFINE_INSET, refineWindow } from '../../tools/stack-images/src/plan.js';
import { apply } from '../../tools/stack-images/src/similarity.js';
import {
  REFINED, compose, declaredSize, fellBack, finalCrop, openFrame, refineGrid, refineMove,
} from '../../tools/stack-images/src/pipeline.js';

const sof = (width, height) => concat(
  [0xff, 0xc0], u16be(17), [8], u16be(height), u16be(width),
  [3, 1, 0x22, 0, 2, 0x11, 1, 3, 0x11, 1],
);

const jpegWith = (segments, width, height) => concat(
  [0xff, 0xd8], segments, sof(width, height), [0xff, 0xda], u16be(2050), new Uint8Array(2048),
);

/** An Exif APP1 saying 6, padded out to the length a camera's would have. */
const exifSegment = (tail = 0) => segment(0xe1, concat(EXIF_ID, TIFF_LE, new Uint8Array(tail)));

/** A TIFF-shaped RAW whose IFD0 says `orientation` and points at `preview`. */
function rawWith(preview, orientation, size = null) {
  const entries = [
    tiffEntry(0x0103, TIFF_TYPE.SHORT, 1, 6),
    tiffEntry(0x0111, TIFF_TYPE.LONG, 1, { blob: 0 }),
    tiffEntry(0x0117, TIFF_TYPE.LONG, 1, preview.length),
    tiffEntry(0x0112, TIFF_TYPE.SHORT, 1, orientation),
  ];
  if (size) {
    entries.push(tiffEntry(0x0100, TIFF_TYPE.LONG, 1, size.width));
    entries.push(tiffEntry(0x0101, TIFF_TYPE.LONG, 1, size.height));
  }
  const bytes = tiffOf({ dirs: [{ entries }], blobs: [preview] });
  return new File([bytes], 'shot.cr2');
}

/** A Fujifilm RAF: no directory, the preview's offset and length at 84 and 88. */
function rafWith(preview) {
  const offset = 2048;
  const bytes = new Uint8Array(offset + preview.length);
  bytes.set(ascii('FUJIFILMCCD-RAW '), 0);
  bytes.set(u32be(offset), 84);
  bytes.set(u32be(preview.length), 88);
  bytes.set(preview, offset);
  return new File([bytes], 'shot.raf');
}

test('a JPEG stored sideways declares the upright size the decoder will give', () => {
  // TIFF_LE's orientation is 6: rows run down the right-hand side, and the
  // decode is a quarter turn clockwise from the stored 3000 by 2000.
  const sideways = jpegWith([segment(0xe1, concat(EXIF_ID, TIFF_LE))], 3000, 2000);
  assert.deepEqual(declaredSize(sideways), { width: 2000, height: 3000, orientation: 6 });
});

test('a JPEG without Exif declares its stored size, and says it found nothing', () => {
  assert.deepEqual(declaredSize(jpegWith([], 3000, 2000)),
    { width: 3000, height: 2000, orientation: null });
});

test('an orientation that does not turn the picture leaves the size alone', () => {
  const flipped = new Uint8Array(TIFF_LE);
  flipped[0x1e] = 3;
  const upsideDown = jpegWith([segment(0xe1, concat(EXIF_ID, flipped))], 3000, 2000);
  assert.deepEqual(declaredSize(upsideDown), { width: 3000, height: 2000, orientation: 3 });
});

test('a PNG is read off IHDR and carries no orientation', () => {
  // helpers.js's IHDR is 1 by 1; enough bytes follow it for the check that
  // guards the DataView.
  const png = concat(PNG_SIGNATURE, IHDR, new Uint8Array(16));
  assert.deepEqual(declaredSize(png), { width: 1, height: 1 });
});

test('anything else declares nothing, so the decoder is asked instead', () => {
  assert.equal(declaredSize(new Uint8Array(64).fill(0x77)), null);
  assert.equal(declaredSize(new Uint8Array([0xff, 0xd8, 0xff])), null,
    'a JPEG cut off before its frame header has no size to give');
  assert.equal(declaredSize(new Uint8Array(0)), null);
});

/* ---------------------------------------------------------------- openFrame */

test('a JPEG the browser will orient is opened at its upright size, unturned', async () => {
  const frame = await openFrame(new File([jpegWith([exifSegment()], 3000, 2000)], 'a.jpg'));
  assert.equal(frame.kind, 'image');
  assert.equal(frame.turn, 1, 'the decoder reads the file\'s own Exif; nothing is left to do');
  assert.deepEqual([frame.width, frame.height], [2000, 3000]);
  assert.deepEqual(frame.decoded, { width: 2000, height: 3000 });
});

test('a preview with Exif of its own is left to the browser, whatever the RAW says', async () => {
  const frame = await openFrame(rawWith(jpegWith([exifSegment()], 6000, 4000), 8));
  assert.equal(frame.kind, 'raw');
  assert.equal(frame.turn, 1, 'applying the directory\'s 8 as well would turn it twice');
  assert.deepEqual([frame.width, frame.height], [4000, 6000], 'oriented by the preview\'s 6');
  assert.deepEqual(frame.decoded, { width: 4000, height: 6000 });
});

test('a preview with no Exif is turned here, by the RAW directory', async () => {
  const frame = await openFrame(rawWith(jpegWith([], 6000, 4000), 6));
  assert.equal(frame.turn, 6);
  assert.deepEqual([frame.width, frame.height], [4000, 6000]);
  assert.deepEqual(frame.decoded, { width: 6000, height: 4000 },
    'the decoder will hand back the stored, sideways picture');
});

test('a long Exif block is read from the head, with no second read', async () => {
  // Six kilobytes of maker note behind IFD0, so the segment runs past the 4 KB
  // head. The tag was in the first forty bytes, and the head is enough. The
  // size comes from the directory's tags, as it does for a CR2, because the
  // frame header is behind the maker note too.
  const size = { width: 6000, height: 4000 };
  const short = await openFrame(rawWith(jpegWith([exifSegment()], 6000, 4000), 8, size));
  const long = await openFrame(rawWith(jpegWith([exifSegment(6000)], 6000, 4000), 8, size));
  assert.equal(long.turn, 1);
  assert.deepEqual([long.width, long.height], [4000, 6000]);
  assert.equal(long.bytesRead, short.bytesRead, 'nothing beyond the usual head was read');
});

test('a head that ends before the Exif block is followed by one longer read', async () => {
  // An ICC profile ahead of the Exif block pushes it past the 4 KB head. The
  // head cannot say either way, so the pipeline reads more - once, and no
  // more of the preview than an Exif block could be behind - and finds it.
  const icc = segment(0xe2, new Uint8Array(6000));
  const preview = jpegWith([icc, exifSegment()], 6000, 4000);
  const short = await openFrame(rawWith(jpegWith([exifSegment()], 6000, 4000), 8));
  const frame = await openFrame(rawWith(preview, 8, { width: 6000, height: 4000 }));
  assert.equal(frame.turn, 1, 'the preview\'s 6 was found on the second read');
  assert.deepEqual([frame.width, frame.height], [4000, 6000]);
  assert.equal(frame.bytesRead, short.bytesRead + Math.min(preview.length, 65536));
});

test('an Exif block the longer read cannot reach is treated as none', async () => {
  // Two maximal segments before the Exif block put it past 64 KB. That is not
  // a file a camera writes, so the pipeline stops reading and applies the
  // directory, which for a real preview is the right answer.
  const far = [segment(0xe2, new Uint8Array(40000)), segment(0xe2, new Uint8Array(40000))];
  const frame = await openFrame(rawWith(jpegWith([...far, exifSegment()], 6000, 4000), 6));
  assert.equal(frame.turn, 6);
});

test('a preview whose frame header lay past the head declares no size, not a size of nulls', async () => {
  // A RAF arrives without size tags, and its frame header sits behind the
  // camera's Exif block, past what the 4 KB head reached. The survey decode
  // then fills the size in from the bitmap - but only if what it finds is
  // null. A pair of nulls is an object, survives every `??`, and reaches the
  // stack as a 1 by 1 working size that asks for a full decode on every band.
  const frame = await openFrame(rafWith(jpegWith([exifSegment(6000)], 6000, 4000)));
  assert.equal(frame.kind, 'raw');
  assert.equal(frame.width, null);
  assert.equal(frame.height, null);
  assert.equal(frame.decoded, null);
  assert.equal(frame.turn, 1, 'the RAF preview\'s own Exif, read off the head, does the turning');
});

/* ------------------------------------------------------- the refinement */

const OUTPUT = { width: 3000, height: 2000 };
const CENTRE = { x: 1500, y: 1000 };
const BOX = { x: 0, y: 0, width: OUTPUT.width, height: OUTPUT.height };
/** Two coarse pixels of a 256 square laid over a 3000-pixel output. */
const LIMIT = 2 / (256 / 3000);

/** The nine window centres of a 3x3 grid, near enough for the arithmetic. */
const GRID = [];
for (const y of [500, 1000, 1500]) for (const x of [750, 1500, 2250]) GRID.push({ x, y });

/**
 * The shifts nine windows would measure of a frame that arrived transformed.
 *
 * Forwards, as in the similarity tests: the transform is what happened to the
 * frame and the shift is what it takes to undo it, so nothing here assumes the
 * sign the module uses.
 */
function fieldFrom({ angle = 0, scale = 1, dx = 0, dy = 0 }) {
  const radians = (angle * Math.PI) / 180;
  const cos = Math.cos(radians) * scale;
  const sin = Math.sin(radians) * scale;
  return GRID.map(({ x, y }) => {
    const at = {
      x: CENTRE.x + (x - CENTRE.x) * cos - (y - CENTRE.y) * sin + dx,
      y: CENTRE.y + (x - CENTRE.x) * sin + (y - CENTRE.y) * cos + dy,
    };
    return { x, y, dx: x - at.x, dy: y - at.y };
  });
}

const coarse = (over = {}) => ({ ...NO_MOVE, measured: true, clamped: false, ...over });

test('a refinement laid on a coarse move is the two of them in order', () => {
  // The composition rule written out, checked against doing it the long way.
  // A negated sine here is a stack blurred by twice the shake, and nothing
  // else in the repository would notice.
  const move = { ...NO_MOVE, angle: 1.7, scale: 1.02, dx: -14, dy: 9 };
  const fit = { angle: -0.31, scale: 0.9985, dx: 2.4, dy: -1.1 };
  const both = compose(move, fit, true);

  for (const point of [{ x: 0, y: 0 }, { x: 3000, y: 0 }, { x: 2250, y: 1500 }, CENTRE]) {
    const first = apply(move, point.x, point.y, CENTRE);
    const long = apply(fit, first.x, first.y, CENTRE);
    const short = apply(both, point.x, point.y, CENTRE);
    assert.ok(
      Math.hypot(long.x - short.x, long.y - short.y) < 1e-9,
      `at ${point.x},${point.y}: ${JSON.stringify(long)} against ${JSON.stringify(short)}`,
    );
  }
});

test('in translate mode a refinement contributes its shift and nothing else', () => {
  const move = { ...NO_MOVE, angle: 1.7, scale: 1.02, dx: -14, dy: 9 };
  const both = compose(move, { angle: -0.31, scale: 0.9985, dx: 2.4, dy: -1.1 }, false);
  assert.equal(both.angle, 1.7);
  assert.equal(both.scale, 1.02);
  assert.ok(Math.abs(both.dx - (-14 + 2.4)) < 1e-12);
  assert.ok(Math.abs(both.dy - (9 - 1.1)) < 1e-12);
});

test('nine windows that agree are applied, and land the frame where they say', () => {
  // The coarse pass left the frame a third of a degree out and two pixels
  // adrift; the grid sees exactly that and the composed move has to undo it.
  const move = coarse({ dx: 5, dy: -3, angle: 0.4 });
  const refined = refineMove(move, fieldFrom({ angle: 0.3, dx: 2, dy: -1 }), true, CENTRE, LIMIT);
  assert.equal(refined.refine, REFINED.fit);

  const wrong = { angle: 0.3, scale: 1, dx: 2, dy: -1 };
  for (const { x, y } of GRID) {
    const arrived = apply(wrong, x, y, CENTRE);
    const put = apply(refined, arrived.x, arrived.y, CENTRE);
    // The coarse move is in the fixture too: what is checked is that the
    // refinement finished it, not that it threw it away.
    const meant = apply(move, x, y, CENTRE);
    assert.ok(Math.hypot(put.x - meant.x, put.y - meant.y) < 0.05, `at ${x},${y}`);
  }
});

test('nine windows that disagree leave the coarse move alone', () => {
  // The moving-subject frame with every window surviving the gate. Two of them
  // agree exactly, which is what the mean-of-the-agreeing rung would seize on;
  // with four windows in hand the consensus has already reported that the
  // frame cannot be described, and the coarse answer is the honest one.
  const move = coarse({ dx: 5, dy: -3 });
  const scattered = GRID.map(({ x, y }, index) => ({
    x,
    y,
    dx: [9, 9, -23, 14, -31, 26, -12, 33, -18][index],
    dy: [-7, -7, 18, -25, 11, -34, 29, 6, -21][index],
  }));

  const refined = refineMove(move, scattered, true, CENTRE, LIMIT);
  assert.equal(refined.refine, REFINED.coarse);
  assert.equal(refined.dx, 5);
  assert.equal(refined.dy, -3);
  assert.equal(refined.partial, undefined);
});

test('below the floor, two windows agreeing are a shift and nothing more', () => {
  const move = coarse({ dx: 5, dy: -3, angle: 0.4 });
  const points = [
    { x: 750, y: 500, dx: 3, dy: -2 },
    { x: 2250, y: 1500, dx: 3.4, dy: -1.7 },
    { x: 1500, y: 1000, dx: -20, dy: 15 },
  ];
  const refined = refineMove(move, points, true, CENTRE, LIMIT);
  assert.equal(refined.refine, REFINED.partial);
  assert.equal(refined.partial, true);
  assert.equal(refined.angle, 0.4, 'a pair of windows says nothing about rotation');
  assert.ok(Math.abs(refined.dx - (5 + 3.2)) < 1e-9);
  assert.ok(Math.abs(refined.dy - (-3 - 1.85)) < 1e-9);
});

test('below the floor with nothing agreeing, the coarse move stands', () => {
  const move = coarse({ dx: 5, dy: -3 });
  const points = [
    { x: 750, y: 500, dx: 3, dy: -2 },
    { x: 2250, y: 1500, dx: -19, dy: 24 },
  ];
  assert.equal(refineMove(move, points, true, CENTRE, LIMIT).refine, REFINED.coarse);
  assert.equal(refineMove(move, [], true, CENTRE, LIMIT).refine, REFINED.coarse);
});

test('a shift too large to be a residual is refused however many windows agree', () => {
  // A globally periodic texture: every window's argmax lands on the same wrong
  // lattice period, the consensus is unanimous, and the answer is a hundred
  // pixels of nonsense. Nothing about the fit itself can see that.
  const move = coarse({ dx: 5, dy: -3 });
  const unanimous = fieldFrom({ dx: -100 });
  assert.equal(refineMove(move, unanimous, true, CENTRE, LIMIT).refine, REFINED.coarse);
  assert.equal(
    refineMove(move, unanimous, true, CENTRE, 200).refine, REFINED.fit,
    'the same field inside a wider bound is applied, so it is the bound refusing it',
  );

  const pair = [
    { x: 750, y: 500, dx: 60, dy: 0 },
    { x: 2250, y: 1500, dx: 60, dy: 0 },
  ];
  assert.equal(refineMove(move, pair, true, CENTRE, LIMIT).refine, REFINED.coarse);
});

test('a frame reported as shifted alone stops being one when a turn is applied to it', () => {
  // The page says of a clamped frame that it was corrected by shifting alone.
  // In similarity mode the fit's angle reaches it, so the flag has to come off
  // with the movement that makes it untrue - and stay on in translate mode,
  // where nothing turned.
  const move = coarse({ clamped: true });
  const field = fieldFrom({ angle: 0.3 });
  assert.equal(refineMove(move, field, true, CENTRE, LIMIT).clamped, false);
  assert.equal(refineMove(move, field, false, CENTRE, LIMIT).clamped, true);
  assert.equal(refineMove(move, [], true, CENTRE, LIMIT).clamped, true);
});

test('the grid is nine windows and every one of them is inside the crop', () => {
  for (const crop of [
    { x: 100, y: 50, width: 4000, height: 3000 },
    { x: 0, y: 0, width: REFINE_GRID * 64 + REFINE_INSET * 2, height: 900 },
    { x: 7, y: 11, width: 1575, height: 1179 },
  ]) {
    const windows = refineWindow(crop);
    const grid = refineGrid(crop, windows);
    assert.equal(grid.length, REFINE_GRID * REFINE_GRID);
    for (const at of grid) {
      assert.ok(at.x >= crop.x, `${at.x} left of ${crop.x}`);
      assert.ok(at.y >= crop.y, `${at.y} above ${crop.y}`);
      assert.ok(at.x + windows.cover <= crop.x + crop.width, `${at.x} plus cover past the crop`);
      assert.ok(at.y + windows.cover <= crop.y + crop.height, `${at.y} plus cover past the crop`);
      assert.equal(at.centre.x, at.x + windows.cover / 2);
      assert.equal(at.centre.y, at.y + windows.cover / 2);
    }
  }
});

/* ------------------------------------------------------------- the crop */

test('a whole box that nobody covered is told apart from one everybody did', () => {
  const still = [{ ...NO_MOVE, spot: BOX }, { ...NO_MOVE, spot: BOX }];
  assert.equal(fellBack(BOX, still, OUTPUT), false);
  const apart = [{ ...NO_MOVE, spot: BOX }, { ...NO_MOVE, dx: 2400, spot: BOX }];
  assert.equal(fellBack(BOX, apart, OUTPUT), true);
  assert.equal(
    fellBack({ x: 0, y: 0, width: 2000, height: 2000 }, apart, OUTPUT), false,
    'an answer smaller than the box is an answer, not a fallback',
  );
});

test('the crop never leaves the box the accumulator holds', () => {
  const covered = { x: 20, y: 10, width: 2900, height: 1900 };
  const crop = finalCrop([{ ...NO_MOVE, spot: BOX }], OUTPUT, covered, false, 'mean');
  assert.deepEqual(crop, covered);
});

test('focus stacking gives up the radius, and only beside an edge that has ground', () => {
  const covered = { ...BOX };
  const moves = [{ ...NO_MOVE, spot: BOX }, { ...NO_MOVE, dy: 8, spot: BOX }];
  const inset = 3 + 2;

  assert.deepEqual(
    finalCrop(moves, OUTPUT, covered, false, 'focus', 3),
    { x: 0, y: 8 + inset, width: 3000, height: 1992 - inset * 2 },
    'a burst that drifted downwards keeps its full width',
  );
  assert.deepEqual(
    finalCrop(moves, OUTPUT, covered, false, 'mean', 3),
    { x: 0, y: 8, width: 3000, height: 1992 },
    'no other mode measures a pixel from its neighbours, so none of them pays for this',
  );

  const sideways = [{ ...NO_MOVE, spot: BOX }, { ...NO_MOVE, dx: 8, dy: 8, spot: BOX }];
  const both = finalCrop(sideways, OUTPUT, covered, false, 'focus', 3);
  assert.equal(both.x, 8 + inset);
  assert.equal(both.y, 8 + inset);
});

test('a set that never moved is not inset, and a set nobody covered is inset on both sides', () => {
  const still = [{ ...NO_MOVE, spot: BOX }, { ...NO_MOVE, spot: BOX }];
  assert.deepEqual(finalCrop(still, OUTPUT, { ...BOX }, false, 'focus', 3), BOX);
  // The sliver fallback: the box came back whole and the frames overlap in
  // almost none of it, which is the case with the most transparent ground of
  // all and the one a width test alone would wave through.
  const apart = [{ ...NO_MOVE, spot: BOX }, { ...NO_MOVE, dx: 2400, spot: BOX }];
  assert.deepEqual(finalCrop(apart, OUTPUT, { ...BOX }, true, 'focus', 3), {
    x: 5, y: 5, width: 2990, height: 1990,
  });
});
