/**
 * The stamp: where it goes, and how it gets into the document.
 *
 * Two halves. stamp.js is arithmetic on a page's box and is pinned here to
 * the numbers a hand calculation gives - the unit square's corners after the
 * matrix, the four rotations worked out from where the corners go. apply.js
 * is the edit to the document, and it is tested the way the page tests it:
 * the example stamped, written by the shared writer, reopened, and every
 * page checked for the name in its resources and the drawing instruction at
 * the end of its last stream. Node has no canvas, so the picture in these
 * tests is a bar of colour with a soft edge rather than words; what render.js
 * does with the words is checked in a browser, and the README says how.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { PdfDocument } from '../../shared/js/pdf-reader.js';
import { decodeStream } from '../../shared/js/pdf-filters.js';
import { writeDocument } from '../../shared/js/pdf-writer.js';
import { readPages } from '../../shared/js/pdf-pages.js';
import { Name, Ref } from '../../shared/js/pdf-objects.js';
import { examplePdfFile } from '../../shared/js/example-pdf.js';
import {
  contentFor, diagonalAngle, placementMatrix, placements, visibleSize, visibleToUser,
} from '../../tools/watermark-pdf/src/stamp.js';
import { carriesStamp, NAMES, stampDocument } from '../../tools/watermark-pdf/src/apply.js';
import { outName } from '../../tools/watermark-pdf/src/format.js';

const latin1 = (bytes) => Buffer.from(bytes).toString('latin1');
const A4 = { width: 595.28, height: 841.89 };

/** A stamp four times wider than it is tall, red, with a transparent border. */
function fakeImage(width = 400, height = 100) {
  const rgb = new Uint8Array(width * height * 3);
  const alpha = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i += 1) {
    rgb[i * 3] = 200;
    rgb[i * 3 + 1] = 30;
    rgb[i * 3 + 2] = 30;
    const x = i % width;
    const y = Math.floor(i / width);
    alpha[i] = x > 10 && x < width - 10 && y > 10 && y < height - 10 ? 255 : 0;
  }
  return { width, height, rgb, alpha };
}

const CENTRED = { size: 'medium', diagonal: true, tiled: false, opacity: 0.3, firstPageOnly: false };

async function plainDocument(pages = 3) {
  const file = examplePdfFile('plain.pdf', { pages });
  return PdfDocument.open(new Uint8Array(await file.arrayBuffer()));
}

/** Stamp, write, reopen. */
async function roundTrip(doc, settings, image = fakeImage()) {
  const done = stampDocument(doc, image, settings);
  const bytes = new Uint8Array(await (await writeDocument(doc)).arrayBuffer());
  const again = await PdfDocument.open(bytes);
  const decode = async (stream) => latin1(
    (await decodeStream(stream, (v) => again.resolve(v))).bytes,
  );
  return { done, bytes, again, pages: readPages(again), decode };
}

/** Where the unit square's corner (u, v) lands under a cm matrix. */
const apply = ([a, b, c, d, e, f], u, v) => [a * u + c * v + e, b * u + d * v + f];
const near = (actual, expected, what) => assert.ok(
  Math.abs(actual - expected) < 1e-6, `${what}: ${actual} is not ${expected}`,
);

/* --------------------------------------------------------------- stamp.js */

test('a centred stamp is centred, and sized against the diagonal or the width', () => {
  const [diag] = placements(A4, 4, { size: 'medium', diagonal: true, tiled: false });
  near(diag.cx, A4.width / 2, 'cx');
  near(diag.cy, A4.height / 2, 'cy');
  near(diag.width, Math.hypot(A4.width, A4.height) * 0.65, 'diagonal width');
  near(diag.height, diag.width / 4, 'height follows the aspect');
  near(diag.angle, diagonalAngle(A4), 'angle');

  const [flat] = placements(A4, 4, { size: 'large', diagonal: false, tiled: false });
  near(flat.width, A4.width * 0.85, 'flat width is a fraction of the page width');
  assert.equal(flat.angle, 0);
});

test('the diagonal of a portrait page is steeper than 45 degrees, and a landscape one shallower', () => {
  assert.ok(diagonalAngle(A4) > 45);
  assert.ok(diagonalAngle({ width: A4.height, height: A4.width }) < 45);
  near(diagonalAngle({ width: 100, height: 100 }), 45, 'square');
});

test('a stamp never grows taller than the page', () => {
  // A nearly square stamp, asked for large along the diagonal.
  const [spot] = placements({ width: 200, height: 200 }, 1.1, {
    size: 'large', diagonal: true, tiled: false,
  });
  assert.ok(spot.height <= 180);
});

test('repeated stamps cover the page in staggered rows', () => {
  const spots = placements(A4, 4, { size: 'small', diagonal: true, tiled: true });
  assert.ok(spots.length >= 6, `${spots.length} stamps`);
  const rows = new Set(spots.map((spot) => spot.cy.toFixed(3)));
  assert.ok(rows.size >= 2, 'more than one row');
  // Every other row is shifted by half a step, so two rows do not share an x.
  const [first, second] = [...rows].map((cy) => spots.filter((s) => s.cy.toFixed(3) === cy));
  assert.notEqual(first[0].cx.toFixed(3), second[0].cx.toFixed(3));
  for (const spot of spots) near(spot.angle, diagonalAngle(A4), 'every tile turned the same way');
});

test('the placement matrix puts the unit square where the placement says', () => {
  const spot = { cx: 300, cy: 400, width: 200, height: 50, angle: 0 };
  const m = placementMatrix(spot);
  const [x0, y0] = apply(m, 0, 0);
  const [x1, y1] = apply(m, 1, 1);
  near(x0, 200, 'left');
  near(y0, 375, 'bottom');
  near(x1, 400, 'right');
  near(y1, 425, 'top');

  // Turned by ninety degrees the width stands up: the square's x axis is
  // now vertical, and the centre has not moved.
  const turned = placementMatrix({ ...spot, angle: 90 });
  const [cx, cy] = apply(turned, 0.5, 0.5);
  near(cx, 300, 'centre x');
  near(cy, 400, 'centre y');
  const [ax, ay] = apply(turned, 1, 0.5);
  near(ax, 300, 'the far end of the x axis is straight above the centre');
  near(ay, 500, 'a hundred points up');
});

test('visibleToUser sends the visible corners to where the page has them', () => {
  const box = [0, 0, 595, 842];
  // Unrotated: identity.
  assert.deepEqual(apply(visibleToUser(0, box), 10, 20), [10, 20]);

  // Turned 90 clockwise the visible page is 842 wide; its bottom-left corner
  // is the page's top-left, and its top-right the page's bottom-right.
  const m90 = visibleToUser(90, box);
  assert.deepEqual(apply(m90, 0, 0), [595, 0]);
  assert.deepEqual(apply(m90, 842, 595), [0, 842]);
  assert.deepEqual(visibleSize(90, box), { width: 842, height: 595 });

  const m180 = visibleToUser(180, box);
  assert.deepEqual(apply(m180, 0, 0), [595, 842]);

  const m270 = visibleToUser(270, box);
  assert.deepEqual(apply(m270, 0, 0), [0, 842]);
  assert.deepEqual(apply(m270, 842, 595), [595, 0]);

  // And a box that does not start at the origin carries its offset.
  assert.deepEqual(apply(visibleToUser(0, [20, 30, 615, 872]), 0, 0), [20, 30]);
});

test('the content stream wraps everything in q/Q and draws once per placement', () => {
  const text = contentFor(
    [{ cx: 1, cy: 2, width: 3, height: 4, angle: 0 }, { cx: 5, cy: 6, width: 7, height: 8, angle: 0 }],
    [1, 0, 0, 1, 0, 0], NAMES,
  );
  assert.ok(text.startsWith('q\n/AbxWmGs gs\n1 0 0 1 0 0 cm\n'));
  assert.ok(text.endsWith('Q\n'));
  assert.equal((text.match(/\/AbxWmImg Do/g) ?? []).length, 2);
  assert.equal((text.match(/^q$/gm) ?? []).length, 3);
  assert.equal((text.match(/^Q$/gm) ?? []).length, 3);
  assert.ok(!/e[+-]\d/.test(text), 'no exponents in a content stream');
});

/* --------------------------------------------------------------- apply.js */

test('every page of the example comes back carrying the stamp', async () => {
  const { done, pages, again, decode } = await roundTrip(await plainDocument(3), CENTRED);
  assert.deepEqual(done, { pages: 3, stamps: 3 });
  assert.equal(pages.length, 3);
  for (const page of pages) assert.equal(await carriesStamp(again, page, decode), true);
});

test('the stamp is one picture and one mask, shared by every page', async () => {
  const { again, pages } = await roundTrip(await plainDocument(3), CENTRED);
  const refs = new Set();
  for (const page of pages) {
    const resources = again.resolve(page.dict.get('Resources'));
    const xobjects = again.resolve(resources.get('XObject'));
    const ref = xobjects.get(NAMES.image);
    assert.ok(ref instanceof Ref);
    refs.add(ref.num);
  }
  assert.equal(refs.size, 1, 'one image object for all three pages');
  const image = again.getObject([...refs][0]);
  assert.equal(image.dict.get('Width'), 400);
  assert.equal(image.dict.get('Height'), 100);
  assert.ok(image.dict.get('SMask') instanceof Ref, 'the shape is in a soft mask');
});

test('the page keeps its own streams, between a q and a Q', async () => {
  const doc = await plainDocument(1);
  const [before] = readPages(doc);
  const original = doc.resolve(before.dict.get('Contents'));
  const originalText = latin1((await decodeStream(original, (v) => doc.resolve(v))).bytes);

  const { again, pages, decode } = await roundTrip(doc, CENTRED);
  const list = again.resolve(pages[0].dict.get('Contents'));
  assert.ok(Array.isArray(list) && list.length === 3, 'q, the page, the stamp');
  assert.equal(await decode(again.resolve(list[0])), 'q\n');
  assert.equal(await decode(again.resolve(list[1])), originalText, 'the page\'s own stream is byte for byte');
  const last = await decode(again.resolve(list[2]));
  assert.ok(last.startsWith('\nQ\nq\n'), 'the stamp stream closes the q first');
});

test('repeated stamps are many placements on each page', async () => {
  const { done } = await roundTrip(await plainDocument(2), { ...CENTRED, tiled: true, size: 'small' });
  assert.equal(done.pages, 2);
  assert.ok(done.stamps / 2 >= 6, `${done.stamps / 2} per page`);
});

test('first page only leaves the others exactly as they were', async () => {
  const { done, again, pages, decode } = await roundTrip(await plainDocument(3),
    { ...CENTRED, firstPageOnly: true });
  assert.deepEqual(done, { pages: 1, stamps: 1 });
  assert.equal(await carriesStamp(again, pages[0], decode), true);
  assert.equal(await carriesStamp(again, pages[1], decode), false);
  assert.equal(await carriesStamp(again, pages[2], decode), false);
  const untouched = again.resolve(pages[1].dict.get('Contents'));
  assert.ok(!Array.isArray(untouched), 'the second page\'s /Contents was not rewritten into a list');
});

test('a page turned by /Rotate 90 gets the matrix that turns it back', async () => {
  const doc = await plainDocument(1);
  readPages(doc)[0].dict.set('Rotate', 90);
  const { again, pages, decode } = await roundTrip(doc, CENTRED);
  assert.equal(await carriesStamp(again, pages[0], decode), true);
  const list = again.resolve(pages[0].dict.get('Contents'));
  const text = await decode(again.resolve(list[list.length - 1]));
  // visibleToUser(90, [0 0 W H]) is [0 1 -1 0 W 0]; the example is A4 wide.
  assert.match(text, /\n0 1 -1 0 595(\.\d+)? 0 cm\n/);
});

test('a page with no /Contents gets only the stamp, and no dangling Q', async () => {
  const doc = await plainDocument(1);
  readPages(doc)[0].dict.delete('Contents');
  const { again, pages, decode } = await roundTrip(doc, CENTRED);
  assert.equal(await carriesStamp(again, pages[0], decode), true);
  const list = again.resolve(pages[0].dict.get('Contents'));
  assert.equal(list.length, 1);
  const text = await decode(again.resolve(list[0]));
  assert.ok(text.startsWith('q\n'), 'no Q before there was a q');
});

test('inherited resources are copied on to the page, not edited where they were', async () => {
  const doc = await plainDocument(2);
  const [first, second] = readPages(doc);
  // Move the first page's resources up to the /Pages node, so both pages
  // inherit them, then stamp only the first.
  const shared = first.dict.get('Resources');
  const parent = doc.resolve(first.dict.get('Parent'));
  parent.set('Resources', shared);
  first.dict.delete('Resources');
  second.dict.delete('Resources');

  const { again, pages, decode } = await roundTrip(doc, { ...CENTRED, firstPageOnly: true });
  assert.equal(await carriesStamp(again, pages[0], decode), true);
  assert.ok(pages[0].dict.has('Resources'), 'the stamped page now owns a copy');
  const parentAgain = again.resolve(pages[1].dict.get('Parent'));
  const inherited = again.resolve(parentAgain.get('Resources'));
  const xobjects = again.resolve(inherited.get('XObject'));
  assert.ok(!(xobjects instanceof Map && xobjects.has(NAMES.image)),
    'the shared dictionary was left alone');
  assert.ok(inherited.has('Font'), 'and still carries what it carried');
});

test('the opacity goes into an ExtGState the page names', async () => {
  const { again, pages } = await roundTrip(await plainDocument(1), { ...CENTRED, opacity: 0.45 });
  const resources = again.resolve(pages[0].dict.get('Resources'));
  const states = again.resolve(resources.get('ExtGState'));
  const state = again.resolve(states.get(NAMES.state));
  assert.equal(state.get('ca'), 0.45);
  assert.equal(state.get('CA'), 0.45);
  assert.ok(state.get('Type') instanceof Name);
});

test('format: the finished file is named for what happened', () => {
  assert.equal(outName('scan.pdf'), 'scan-watermarked.pdf');
  assert.equal(outName('.pdf'), 'document-watermarked.pdf');
});
