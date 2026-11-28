/**
 * tools/id-card-copy - where the two sides go, and what the file says about them.
 *
 * The failure this tool exists to avoid is a copy that looks right and is the
 * wrong size: a card printed three per cent small because a picture of a sheet
 * was scaled, a card squashed because a tilted crop was stretched into a box, a
 * turned card that flips back over when a corner is nudged. None of those
 * crashes and none of them is visible in a screenshot of the page. So most of
 * what is asserted here is a number in millimetres or points, checked against
 * the size of the card itself.
 *
 * The drawing - the grey, the words, the rounded corners - needs a canvas and
 * is checked in a browser; everything that decides a size or writes a byte is
 * here.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CARDS, CARD_BORDER, GAP, MIN_MARGIN, PAPERS, TOP_MARGIN,
  captureDpi, cardSize, layoutSheet, looksUpright, sheetDpi, toPixels,
} from '../../tools/id-card-copy/src/layout.js';
import { setJpegDensity, withPngDensity } from '../../tools/id-card-copy/src/density.js';
import { buildPdf, contentStream } from '../../tools/id-card-copy/src/document.js';
import { orderCorners, reorderCorners } from '../../shared/js/document-geometry.js';
import { turnQuad } from '../../shared/js/document-warp.js';
import { crc32 } from '../../shared/js/crc32.js';

const close = (actual, expected, tolerance, message) => assert.ok(
  Math.abs(actual - expected) <= tolerance, `${message}: ${actual} is not within ${tolerance} of ${expected}`,
);

const id1 = cardSize('id1');

/* ---------------------------------------------------------------- the sheet */

test('layoutSheet: two ID-1 sides on A4 are centred, one above the other', () => {
  const plan = layoutSheet([id1, id1], { paper: 'a4', arrange: 'stack', place: 'middle' });
  assert.equal(plan.width, 210);
  assert.equal(plan.height, 297);
  assert.equal(plan.landscape, false);
  const [front, back] = plan.rects;
  assert.deepEqual([front.width, front.height], [85.6, 53.98]);
  assert.deepEqual([back.width, back.height], [85.6, 53.98]);
  close(front.x, (210 - 85.6) / 2, 1e-9, 'centred across');
  close(back.y - (front.y + front.height), GAP, 1e-9, 'the gap between them');
  const block = 53.98 * 2 + GAP;
  close(front.y, (297 - block) / 2, 1e-9, 'centred down');
});

test('layoutSheet: "at the top" puts the pair near the top edge, not in the middle', () => {
  const plan = layoutSheet([id1, id1], { paper: 'letter', arrange: 'stack', place: 'top' });
  assert.equal(plan.width, PAPERS.letter.width);
  assert.equal(plan.rects[0].y, TOP_MARGIN);
});

test('layoutSheet: side by side fits A4 upright for ID-1, and turns the sheet for ID-2', () => {
  const small = layoutSheet([id1, id1], { paper: 'a4', arrange: 'side' });
  assert.equal(small.landscape, false);
  close(small.rects[1].x - (small.rects[0].x + 85.6), GAP, 1e-9, 'the gap between them');

  const id2 = cardSize('id2');
  const large = layoutSheet([id2, id2], { paper: 'a4', arrange: 'side' });
  assert.equal(large.landscape, true, 'two ID-2 cards side by side are wider than A4');
  assert.deepEqual([large.width, large.height], [297, 210]);
  for (const rect of large.rects) {
    assert.ok(rect.x >= MIN_MARGIN && rect.x + rect.width <= large.width - MIN_MARGIN, 'inside the sheet');
  }
});

test('layoutSheet: no sheet is the two sides and a narrow border, nothing else', () => {
  const plan = layoutSheet([id1, id1], { paper: 'cards', arrange: 'stack' });
  close(plan.width, 85.6 + CARD_BORDER * 2, 1e-9, 'width');
  close(plan.height, 53.98 * 2 + GAP + CARD_BORDER * 2, 1e-9, 'height');
  assert.deepEqual([plan.rects[0].x, plan.rects[0].y], [CARD_BORDER, CARD_BORDER]);
});

test('layoutSheet: an upright side is centred on the landscape one above it', () => {
  const upright = cardSize('id1', true);
  assert.deepEqual([upright.width, upright.height], [53.98, 85.6]);
  const plan = layoutSheet([id1, upright], { paper: 'a4', arrange: 'stack' });
  const centre = (rect) => rect.x + rect.width / 2;
  close(centre(plan.rects[0]), centre(plan.rects[1]), 1e-9, 'one centre line');
});

test('layoutSheet: one side alone, or none', () => {
  const one = layoutSheet([id1], { paper: 'a4' });
  assert.equal(one.rects.length, 1);
  close(one.rects[0].y, (297 - 53.98) / 2, 1e-9, 'centred down');
  assert.deepEqual(layoutSheet([], { paper: 'a4' }).rects, []);
});

test('every card size is the one ISO/IEC 7810 gives it', () => {
  assert.deepEqual(CARDS.id1, { width: 85.6, height: 53.98 });
  assert.deepEqual(CARDS.id2, { width: 105, height: 74 });
  assert.deepEqual(CARDS.id3, { width: 125, height: 88 });
});

/* ------------------------------------------------------------ the resolution */

test('toPixels: an ID-1 card at 300 DPI is 1011 by 638 pixels', () => {
  assert.equal(toPixels(85.6, 300), 1011);
  assert.equal(toPixels(53.98, 300), 638);
});

test('sheetDpi: an A4 picture stays under the canvas ceiling a phone will draw', () => {
  const a4 = { width: 210, height: 297 };
  assert.equal(sheetDpi(a4, 300), 300, 'A4 at 300 DPI is under the ceiling');
  const capped = sheetDpi(a4, 600);
  assert.ok(capped < 600);
  const pixels = toPixels(210, capped) * toPixels(297, capped);
  assert.ok(pixels <= 16_000_000, `${pixels} pixels`);
  assert.equal(sheetDpi({ width: 93.6, height: 127.96 }, 600), 600, 'the cards alone are small');
});

test('captureDpi: measured off the nearer, longer edges, at the card\'s real size', () => {
  // A card photographed square-on, 1011 pixels across: exactly 300 DPI.
  const flat = [{ x: 0, y: 0 }, { x: 1011, y: 0 }, { x: 1011, y: 638 }, { x: 0, y: 638 }];
  assert.deepEqual(captureDpi(flat, id1), { dpi: 300, key: 'quality.good' });
  // Foreshortened: the far edge is shorter, the near one still 1011.
  const tilted = [{ x: 100, y: 0 }, { x: 911, y: 0 }, { x: 1011, y: 638 }, { x: 0, y: 638 }];
  assert.equal(captureDpi(tilted, id1).dpi, 300);
  const small = flat.map((point) => ({ x: point.x / 3, y: point.y / 3 }));
  assert.equal(captureDpi(small, id1).key, 'quality.low');
});

/* ------------------------------------------------------------- which way up */

test('looksUpright: a card standing on its end, and the same card turned', () => {
  const lying = [{ x: 0, y: 0 }, { x: 856, y: 0 }, { x: 856, y: 540 }, { x: 0, y: 540 }];
  assert.equal(looksUpright(lying), false);
  assert.equal(looksUpright(turnQuad(lying)), true);
  assert.equal(looksUpright(turnQuad(turnQuad(lying))), false);
});

test('reorderCorners: a turned card stays turned when one corner is nudged', () => {
  const found = orderCorners([{ x: 10, y: 10 }, { x: 860, y: 20 }, { x: 850, y: 560 }, { x: 0, y: 550 }]);
  const turned = turnQuad(found);
  const nudged = turned.map((point) => ({ ...point }));
  nudged[2] = { x: nudged[2].x + 4, y: nudged[2].y - 3 };

  const kept = reorderCorners(nudged);
  assert.equal(kept[0], nudged[0], 'the same corner still leads');
  assert.notEqual(orderCorners(nudged)[0], nudged[0],
    'orderCorners alone starts from the top left again, which is what undid the turn');
  assert.deepEqual(kept.map(({ x, y }) => [x, y]), nudged.map(({ x, y }) => [x, y]));
});

test('reorderCorners: a corner dragged past its neighbour still leaves a proper quad', () => {
  const quad = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 60 }, { x: 0, y: 60 }];
  const dragged = quad.map((point) => ({ ...point }));
  dragged[1] = { x: -20, y: 30 };
  const kept = reorderCorners(dragged);
  assert.equal(kept[0], dragged[0]);
  assert.equal(new Set(kept).size, 4);
});

/* ------------------------------------------------------------ the image files */

/** The start of a JPEG as every browser's canvas writes it: SOI, then JFIF with no unit. */
function canvasJpeg() {
  return new Uint8Array([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01,
    0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xdb, 0xff, 0xd9,
  ]);
}

test('setJpegDensity: the JFIF header says dots per inch, and nothing else moves', () => {
  const bytes = canvasJpeg();
  const before = [...bytes];
  assert.equal(setJpegDensity(bytes, 300), true);
  assert.equal(bytes[13], 1, 'units: dots per inch');
  assert.equal((bytes[14] << 8) | bytes[15], 300);
  assert.equal((bytes[16] << 8) | bytes[17], 300);
  bytes.forEach((byte, index) => {
    if (index < 13 || index > 17) assert.equal(byte, before[index], `byte ${index}`);
  });
});

test('setJpegDensity: a JPEG that does not start with JFIF is left alone', () => {
  const exif = canvasJpeg();
  exif[3] = 0xe1;
  const copy = [...exif];
  assert.equal(setJpegDensity(exif, 300), false);
  assert.deepEqual([...exif], copy);
});

function chunk(type, data) {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  out.set([...type].map((c) => c.charCodeAt(0)), 4);
  out.set(data, 8);
  view.setUint32(8 + data.length, crc32([out.subarray(4, 8 + data.length)]));
  return out;
}

function png(...chunks) {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  const parts = [new Uint8Array(signature), ...chunks];
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
}

function chunksOf(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const list = [];
  for (let at = 8; at < bytes.length;) {
    const length = view.getUint32(at);
    const type = String.fromCharCode(...bytes.subarray(at + 4, at + 8));
    const crc = view.getUint32(at + 8 + length);
    list.push({ type, data: bytes.subarray(at + 8, at + 8 + length), crc, body: bytes.subarray(at + 4, at + 8 + length) });
    at += 12 + length;
  }
  return list;
}

test('withPngDensity: a pHYs chunk straight after IHDR, in pixels per metre, with a good CRC', () => {
  const source = png(chunk('IHDR', new Uint8Array(13)), chunk('IDAT', new Uint8Array([1, 2, 3])), chunk('IEND', new Uint8Array()));
  const out = withPngDensity(source, 300);
  const chunks = chunksOf(out);
  assert.deepEqual(chunks.map((entry) => entry.type), ['IHDR', 'pHYs', 'IDAT', 'IEND']);
  const phys = chunks[1];
  const view = new DataView(phys.data.buffer, phys.data.byteOffset, 9);
  assert.equal(view.getUint32(0), 11811, '300 DPI in pixels per metre');
  assert.equal(view.getUint32(4), 11811);
  assert.equal(phys.data[8], 1, 'unit: metre');
  for (const entry of chunks) assert.equal(entry.crc, crc32([entry.body]), `${entry.type} CRC`);
});

test('withPngDensity: an existing pHYs is replaced, never joined by a second', () => {
  const old = new Uint8Array(9);
  const source = png(chunk('IHDR', new Uint8Array(13)), chunk('pHYs', old), chunk('IEND', new Uint8Array()));
  const types = chunksOf(withPngDensity(source, 600)).map((entry) => entry.type);
  assert.deepEqual(types, ['IHDR', 'pHYs', 'IEND']);
});

test('withPngDensity: anything that is not a PNG comes back as it was', () => {
  const jpeg = canvasJpeg();
  assert.equal(withPngDensity(jpeg, 300), jpeg);
});

/* ----------------------------------------------------------------- the PDF */

test('buildPdf: an A4 page, with each side placed at exactly its size in points', async () => {
  const plan = layoutSheet([id1, id1], { paper: 'a4', arrange: 'stack' });
  const image = { data: canvasJpeg(), width: 1011, height: 638 };
  const blob = buildPdf(plan, [image, image]);
  const text = new TextDecoder('latin1').decode(new Uint8Array(await blob.arrayBuffer()));

  assert.match(text, /^%PDF-1\.7/);
  assert.match(text, /\/MediaBox \[0 0 595\.2756 841\.8898\]/);
  const placed = [...text.matchAll(/([\d.]+) 0 0 ([\d.]+) ([\d.]+) ([\d.]+) cm/g)].map((m) => m.slice(1).map(Number));
  assert.equal(placed.length, 2);
  const mm = 72 / 25.4;
  for (const [width, height] of placed) {
    close(width / mm, 85.6, 0.001, 'width in millimetres');
    close(height / mm, 53.98, 0.001, 'height in millimetres');
  }
  // The front is the upper one, and PDF counts y from the bottom of the page.
  assert.ok(placed[0][3] > placed[1][3]);
  assert.equal((text.match(/\/DCTDecode/g) ?? []).length, 2);
  assert.doesNotMatch(text, /CreationDate|ModDate|\/Author/);
});

test('contentStream: the y axis is turned over exactly once', () => {
  const plan = { width: 100, height: 200, rects: [{ x: 10, y: 20, width: 30, height: 40 }] };
  const mm = 72 / 25.4;
  const text = new TextDecoder().decode(contentStream(plan, 100 * mm, 200 * mm));
  const [, , , x, y] = text.match(/([\d.]+) 0 0 ([\d.]+) ([\d.]+) ([\d.]+) cm/).map(Number);
  close(x / mm, 10, 0.001, 'x');
  close(y / mm, 200 - 20 - 40, 0.001, 'y from the bottom');
});

test('buildPdf: refuses a plan and a set of images that disagree', () => {
  const plan = layoutSheet([id1, id1], { paper: 'a4' });
  assert.throws(() => buildPdf(plan, [{ data: canvasJpeg(), width: 1, height: 1 }]), /build\.nocards/);
});
