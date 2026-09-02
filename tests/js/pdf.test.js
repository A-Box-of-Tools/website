/**
 * shared/js/pdf-page-writer.js and tools/images-to-pdf/src/{layout,jpeg}.js.
 *
 * The page writer writes the three things a PDF is as far as this tool is concerned: a
 * list of numbered objects, a cross-reference table saying what byte each one
 * starts at, and a trailer. The byte offsets are the part worth testing,
 * because getting one wrong produces a file that opens in one reader and not
 * another.
 *
 * layout.js is arithmetic, and jpeg.js decides whether a photograph can be
 * copied into the document untouched - the interesting part of the tool, and
 * the reason a JPEG that goes in comes out with its pixels bit for bit.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PT_PER_INCH, PT_PER_MM, PdfWriter, num, textString,
} from '../../shared/js/pdf-page-writer.js';
import {
  PAGE_SIZES, displaySize, fitRect, layoutPage, pageSizePt, placement, seenSize,
  swapsAxes,
} from '../../tools/images-to-pdf/src/layout.js';
import { inspectJpeg } from '../../tools/images-to-pdf/src/jpeg.js';
import { ascii, blobBytes, concat, segment, u16be } from './helpers.js';

/* ============================================================== pdf.js */

test('num: small numbers do not come out in exponent notation', () => {
  // String(1e-7) would write "1e-7" and the file would be corrupt at exactly
  // the point it looked fine.
  assert.equal(num(1e-7), '0');
  assert.equal(num(0.00001), '0');
  // A tiny negative rounds to "-0", which is a real number PDF accepts.
  assert.equal(num(-1e-9), '-0');
});

test('num: nothing this tool can produce comes out in exponent notation', () => {
  // toFixed switches to exponent notation at 1e21, so that is the ceiling of
  // the guarantee. Page boxes are points, image sizes are pixels, and the
  // matrix entries are products of the two, so everything here is many orders
  // of magnitude below it.
  const values = [0, 1, 72, 595.2756, 841.8898, 1e6, 1e12, 1e20, -1e20];
  for (const value of values) {
    assert.ok(!num(value).includes('e'), `${value} -> ${num(value)}`);
  }
});

test('num: trailing zeros are trimmed', () => {
  assert.equal(num(595.2756), '595.2756');
  assert.equal(num(10), '10');
  assert.equal(num(10.5), '10.5');
  assert.equal(num(0), '0');
  assert.equal(num(-3.25), '-3.25');
});

test('num: anything that is not a number becomes zero', () => {
  assert.equal(num(NaN), '0');
  assert.equal(num(Infinity), '0');
  assert.equal(num(-Infinity), '0');
});

test('num: four decimal places, which is finer than a printer resolves', () => {
  assert.equal(num(1 / 3), '0.3333');
});

test('textString: UTF-16BE hex with a byte-order mark', () => {
  assert.equal(textString('AB'), '<FEFF00410042>');
  assert.equal(textString(''), '<FEFF>');
});

test('textString: brackets and backslashes need no escaping', () => {
  // Which is the whole reason hex is used rather than a literal (string).
  const out = textString('a (b) \\ c');
  assert.match(out, /^<FEFF[0-9A-F]+>$/);
});

test('textString: characters outside Latin-1 survive', () => {
  assert.equal(textString('—'), '<FEFF2014>');
  assert.equal(textString('😀'), '<FEFFD83DDE00>', 'a surrogate pair');
});

test('pdf: the file starts with the version and the binary comment', async () => {
  const writer = new PdfWriter();
  const id = writer.reserve();
  writer.object(id, '<< /Type /Catalog >>');
  const bytes = await blobBytes(writer.finish({ root: id }));

  assert.equal(new TextDecoder('latin1').decode(bytes.subarray(0, 9)), '%PDF-1.7\n');
  // Four bytes above 127, so nothing "helpfully" translates the line endings.
  assert.deepEqual(bytes.subarray(9, 15), new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));
});

test('pdf: the blob is typed as a pdf and ends with the marker', async () => {
  const writer = new PdfWriter();
  const id = writer.reserve();
  writer.object(id, '<< /Type /Catalog >>');
  const blob = writer.finish({ root: id });
  assert.equal(blob.type, 'application/pdf');
  const text = new TextDecoder('latin1').decode(await blobBytes(blob));
  assert.ok(text.endsWith('%%EOF\n'));
});

test('pdf: every xref entry points at its own object', async () => {
  const writer = new PdfWriter();
  const catalog = writer.reserve();
  const pages = writer.reserve();
  writer.object(catalog, '<< /Type /Catalog /Pages 2 0 R >>');
  writer.object(pages, '<< /Type /Pages /Count 0 >>');
  const bytes = await blobBytes(writer.finish({ root: catalog }));
  const text = new TextDecoder('latin1').decode(bytes);

  const start = Number(text.slice(text.lastIndexOf('startxref')).split('\n')[1]);
  assert.equal(text.slice(start, start + 4), 'xref');

  // Entries are exactly twenty bytes, so a reader may seek to first + 20 * n.
  const first = start + `xref\n0 3\n`.length;
  for (const id of [catalog, pages]) {
    const entry = text.slice(first + 20 * id, first + 20 * (id + 1));
    assert.equal(entry.length, 20);
    assert.equal(text.slice(Number(entry.slice(0, 10))).startsWith(`${id} 0 obj`), true);
  }
});

test('pdf: the free entry is the one the format requires', async () => {
  const writer = new PdfWriter();
  const id = writer.reserve();
  writer.object(id, '<< >>');
  const text = new TextDecoder('latin1').decode(await blobBytes(writer.finish({ root: id })));
  assert.ok(text.includes('xref\n0 2\n0000000000 65535 f\r\n'));
});

test('pdf: a stream carries its own length', async () => {
  const writer = new PdfWriter();
  const id = writer.reserve();
  const data = ascii('some image bytes');
  writer.stream(id, ' /Type /XObject', data);
  const text = new TextDecoder('latin1').decode(await blobBytes(writer.finish({ root: id })));
  assert.ok(text.includes(`/Length ${data.length}>>`));
  assert.ok(text.includes('stream\nsome image bytes\nendstream'));
});

test('pdf: stream data is copied through unchanged', async () => {
  const writer = new PdfWriter();
  const id = writer.reserve();
  const data = new Uint8Array([0, 1, 255, 254, 10, 13, 37]);
  writer.stream(id, ' /Type /XObject', data);
  const bytes = await blobBytes(writer.finish({ root: id }));
  const text = new TextDecoder('latin1').decode(bytes);
  const at = text.indexOf('stream\n') + 'stream\n'.length;
  assert.deepEqual(bytes.subarray(at, at + data.length), data);
});

test('pdf: the trailer names the catalogue, and /Info only when there is one', async () => {
  const withInfo = new PdfWriter();
  const root = withInfo.reserve();
  const info = withInfo.reserve();
  withInfo.object(root, '<< >>');
  withInfo.object(info, '<< >>');
  const a = new TextDecoder('latin1').decode(await blobBytes(withInfo.finish({ root, info })));
  assert.ok(a.includes(`/Root ${root} 0 R /Info ${info} 0 R`));

  const without = new PdfWriter();
  const only = without.reserve();
  without.object(only, '<< >>');
  const b = new TextDecoder('latin1').decode(await blobBytes(without.finish({ root: only })));
  assert.ok(b.includes(`/Root ${only} 0 R >>`));
  assert.ok(!b.includes('/Info'));
});

test('pdf: no /ID is written', async () => {
  // The usual way to fill it is a hash of the time and the file name, which
  // would put something in the document this tool spends its existence
  // keeping out.
  const writer = new PdfWriter();
  const id = writer.reserve();
  writer.object(id, '<< >>');
  const text = new TextDecoder('latin1').decode(await blobBytes(writer.finish({ root: id })));
  assert.ok(!text.includes('/ID'));
});

test('pdf: reserve hands out numbers in order', () => {
  const writer = new PdfWriter();
  assert.equal(writer.reserve(), 1);
  assert.equal(writer.reserve(), 2);
  assert.equal(writer.reserve(), 3);
});

/* =========================================================== layout.js */

test('units', () => {
  assert.equal(PT_PER_INCH, 72);
  assert.ok(Math.abs(PT_PER_MM - 2.8346) < 1e-3);
});

test('swapsAxes: a quarter turn from either source', () => {
  assert.equal(swapsAxes(1, 0), false);
  assert.equal(swapsAxes(6, 0), true, 'the EXIF tag alone');
  assert.equal(swapsAxes(1, 90), true, 'the buttons alone');
  assert.equal(swapsAxes(6, 90), false, 'both, which cancel out');
  assert.equal(swapsAxes(6, 270), false);
  assert.equal(swapsAxes(3, 180), false);
  assert.equal(swapsAxes(), false);
});

test('swapsAxes: tags 5 to 8 are the ones that turn, and only those', () => {
  // 8 is the far end of the range and the easiest to lose off it.
  for (const tag of [1, 2, 3, 4]) {
    assert.equal(swapsAxes(tag, 0), false, `tag ${tag}`);
  }
  for (const tag of [5, 6, 7, 8]) {
    assert.equal(swapsAxes(tag, 0), true, `tag ${tag}`);
  }
});

test('swapsAxes: only 90 and 270 count as a turn from the buttons', () => {
  assert.equal(swapsAxes(1, 0), false);
  assert.equal(swapsAxes(1, 90), true);
  assert.equal(swapsAxes(1, 180), false);
  assert.equal(swapsAxes(1, 270), true);
});

test('displaySize: every quarter-turn tag swaps the sides', () => {
  for (const tag of [5, 6, 7, 8]) {
    assert.deepEqual(displaySize(400, 300, tag), { width: 300, height: 400 }, `tag ${tag}`);
  }
  for (const tag of [1, 2, 3, 4]) {
    assert.deepEqual(displaySize(400, 300, tag), { width: 400, height: 300 }, `tag ${tag}`);
  }
});

test('displaySize: width and height trade places on a quarter turn', () => {
  assert.deepEqual(displaySize(400, 300), { width: 400, height: 300 });
  assert.deepEqual(displaySize(400, 300, 6), { width: 300, height: 400 });
  assert.deepEqual(displaySize(400, 300, 1, 90), { width: 300, height: 400 });
  assert.deepEqual(displaySize(400, 300, 6, 90), { width: 400, height: 300 });
});

test('seenSize: reads the item', () => {
  assert.deepEqual(seenSize({ width: 400, height: 300, orientation: 6, rotate: 0 }),
    { width: 300, height: 400 });
});

test('placement: an untagged, unturned image maps straight onto its box', () => {
  const rect = { x: 10, y: 20, width: 100, height: 50 };
  assert.deepEqual(placement(rect), [100, 0, 0, 50, 10, 20]);
});

test('placement: a quarter turn clockwise', () => {
  const rect = { x: 0, y: 0, width: 100, height: 50 };
  // Tag 6 is [0 -1 1 0 0 1]: scaled by the box and moved to it.
  assert.deepEqual(placement(rect, 6), [0, -50, 100, 0, 0, 50]);
});

test('placement: a half turn puts the image back in the same place', () => {
  const rect = { x: 5, y: 7, width: 100, height: 50 };
  assert.deepEqual(placement(rect, 3), [-100, 0, 0, -50, 105, 57]);
});

test('placement: the tag and the buttons compose', () => {
  const rect = { x: 0, y: 0, width: 100, height: 50 };
  // A quarter turn each way is no turn at all.
  assert.deepEqual(placement(rect, 6, 270), placement(rect, 1, 0));
});

test('placement: an unknown orientation falls back to "as stored"', () => {
  const rect = { x: 0, y: 0, width: 10, height: 10 };
  assert.deepEqual(placement(rect, 99, 45), placement(rect, 1, 0));
});

test('pageSizePt: the named sizes are the millimetre ones in points', () => {
  const [width, height] = pageSizePt({ pageSize: 'a4' });
  assert.ok(Math.abs(width - 210 * PT_PER_MM) < 1e-9);
  assert.ok(Math.abs(height - 297 * PT_PER_MM) < 1e-9);
  assert.ok(Math.abs(pageSizePt({ pageSize: 'letter' })[0] - 215.9 * PT_PER_MM) < 1e-9);
});

test('pageSizePt: every named size is portrait', () => {
  for (const [name, [width, height]] of Object.entries(PAGE_SIZES)) {
    assert.ok(width < height, `${name} is taller than it is wide`);
  }
});

test('pageSizePt: an unknown name falls back to A4', () => {
  assert.deepEqual(pageSizePt({ pageSize: 'nope' }), pageSizePt({ pageSize: 'a4' }));
});

test('pageSizePt: a custom size, in either unit', () => {
  assert.deepEqual(
    pageSizePt({ pageSize: 'custom', customUnit: 'in', customWidth: 8.5, customHeight: 11 }),
    [8.5 * 72, 11 * 72],
  );
  assert.deepEqual(
    pageSizePt({ pageSize: 'custom', customUnit: 'mm', customWidth: 100, customHeight: 200 }),
    [100 * PT_PER_MM, 200 * PT_PER_MM],
  );
});

test('pageSizePt: a custom size is never zero', () => {
  const [width, height] = pageSizePt({
    pageSize: 'custom', customUnit: 'mm', customWidth: 0, customHeight: -5,
  });
  assert.equal(width, PT_PER_MM);
  assert.equal(height, PT_PER_MM);
});

test('fitRect: contain fits inside and centres', () => {
  const box = { x: 0, y: 0, width: 100, height: 100 };
  const rect = fitRect(200, 100, box, 'contain');
  assert.deepEqual(rect, { x: 0, y: 25, width: 100, height: 50 });
});

test('fitRect: cover fills and overflows', () => {
  const box = { x: 0, y: 0, width: 100, height: 100 };
  const rect = fitRect(200, 100, box, 'cover');
  assert.deepEqual(rect, { x: -50, y: 0, width: 200, height: 100 });
});

test('fitRect: stretch takes the box exactly', () => {
  const box = { x: 3, y: 4, width: 100, height: 50 };
  assert.deepEqual(fitRect(200, 100, box, 'stretch'), box);
});

test('fitRect: the box offset is carried through', () => {
  const box = { x: 10, y: 20, width: 100, height: 100 };
  assert.deepEqual(fitRect(100, 100, box, 'contain'),
    { x: 10, y: 20, width: 100, height: 100 });
});

test('layoutPage: "fit" makes the page the picture plus the margin', () => {
  const page = layoutPage(
    { width: 300, height: 150, orientation: 1, rotate: 0 },
    { pageSize: 'fit', dpi: 150, margin: 0, fit: 'contain' },
  );
  assert.equal(page.width, (300 * 72) / 150);
  assert.equal(page.height, (150 * 72) / 150);
  assert.equal(page.clip, null, 'nothing is cropped when there is no page to fit');
});

test('layoutPage: "fit" adds the margin on all four sides', () => {
  const page = layoutPage(
    { width: 300, height: 150, orientation: 1, rotate: 0 },
    { pageSize: 'fit', dpi: 150, margin: 10, fit: 'contain' },
  );
  const margin = 10 * PT_PER_MM;
  assert.ok(Math.abs(page.width - ((300 * 72) / 150 + margin * 2)) < 1e-9);
  assert.equal(page.rect.x, margin);
  assert.equal(page.rect.y, margin);
});

test('layoutPage: the dpi is clamped to something printable', () => {
  const at = (dpi) => layoutPage({ width: 300, height: 150, orientation: 1, rotate: 0 },
    { pageSize: 'fit', dpi, margin: 0, fit: 'contain' }).width;
  assert.equal(at(99999), (300 * 72) / 1200);
  assert.equal(at(1), (300 * 72) / 18);
  assert.equal(at('nonsense'), (300 * 72) / 150, 'the default');
});

test('layoutPage: auto orientation follows the picture', () => {
  const settings = { pageSize: 'a4', orientation: 'auto', margin: 0, fit: 'contain' };
  const wide = layoutPage({ width: 400, height: 300, orientation: 1, rotate: 0 }, settings);
  assert.ok(wide.width > wide.height);
  const tall = layoutPage({ width: 300, height: 400, orientation: 1, rotate: 0 }, settings);
  assert.ok(tall.height > tall.width);
});

test('layoutPage: auto orientation follows the EXIF tag, not the stored size', () => {
  // A sideways phone photo is stored landscape and seen portrait.
  const page = layoutPage(
    { width: 400, height: 300, orientation: 6, rotate: 0 },
    { pageSize: 'a4', orientation: 'auto', margin: 0, fit: 'contain' },
  );
  assert.ok(page.height > page.width);
});

test('layoutPage: an explicit orientation overrides the picture', () => {
  const page = layoutPage(
    { width: 300, height: 400, orientation: 1, rotate: 0 },
    { pageSize: 'a4', orientation: 'landscape', margin: 0, fit: 'contain' },
  );
  assert.ok(page.width > page.height);
});

test('layoutPage: only "fill the page" clips', () => {
  const settings = { pageSize: 'a4', orientation: 'portrait', margin: 10 };
  const image = { width: 400, height: 300, orientation: 1, rotate: 0 };
  assert.equal(layoutPage(image, { ...settings, fit: 'contain' }).clip, null);
  assert.equal(layoutPage(image, { ...settings, fit: 'stretch' }).clip, null);
  assert.ok(layoutPage(image, { ...settings, fit: 'cover' }).clip);
});

test('layoutPage: the picture stays inside the margins when contained', () => {
  const margin = 10 * PT_PER_MM;
  const page = layoutPage(
    { width: 400, height: 300, orientation: 1, rotate: 0 },
    { pageSize: 'a4', orientation: 'portrait', margin: 10, fit: 'contain' },
  );
  assert.ok(page.rect.x >= margin - 1e-9);
  assert.ok(page.rect.y >= margin - 1e-9);
  assert.ok(page.rect.x + page.rect.width <= page.width - margin + 1e-9);
  assert.ok(page.rect.y + page.rect.height <= page.height - margin + 1e-9);
});

test('layoutPage: a margin larger than the page still leaves a box', () => {
  const page = layoutPage(
    { width: 400, height: 300, orientation: 1, rotate: 0 },
    { pageSize: 'a5', orientation: 'portrait', margin: 500, fit: 'contain' },
  );
  assert.ok(page.rect.width > 0);
  assert.ok(page.rect.height > 0);
});

/* ============================================================= jpeg.js */

/** A baseline JPEG frame header: precision, height, width, components. */
const frame = (marker, width, height, components) =>
  segment(marker, concat([8], u16be(height), u16be(width), [components]));

const jpegFile = (parts) => concat([0xff, 0xd8], parts, [0xff, 0xda], u16be(2));

test('inspectJpeg: a baseline colour photo', () => {
  const info = inspectJpeg(jpegFile([frame(0xc0, 640, 480, 3)]));
  assert.deepEqual(info, {
    sequential: true, width: 640, height: 480, components: 3,
    orientation: 1, icc: null,
  });
});

test('inspectJpeg: extended sequential also qualifies', () => {
  assert.equal(inspectJpeg(jpegFile([frame(0xc1, 10, 10, 3)])).sequential, true);
});

test('inspectJpeg: a progressive JPEG is flagged for re-encoding', () => {
  // PDF's DCTDecode is defined over baseline and extended sequential. Many
  // readers cope with progressive; "many" is not good enough for a file
  // somebody sends to a printer.
  assert.equal(inspectJpeg(jpegFile([frame(0xc2, 10, 10, 3)])).sequential, false);
});

test('inspectJpeg: component count is reported', () => {
  assert.equal(inspectJpeg(jpegFile([frame(0xc0, 10, 10, 1)])).components, 1);
  assert.equal(inspectJpeg(jpegFile([frame(0xc0, 10, 10, 4)])).components, 4);
});

test('inspectJpeg: fill bytes before a marker are stepped over', () => {
  // A JPEG may pad the gap before a marker with 0xff. Reading a fill byte as
  // the marker, and the two after it as a length, sent a perfectly valid photo
  // down the re-encode path this whole file exists to avoid.
  const padded = concat([0xff, 0xd8], [0xff, 0xff, 0xff], frame(0xc0, 640, 480, 3),
    [0xff, 0xda], u16be(2));
  const info = inspectJpeg(padded);
  assert.ok(info, 'the file was readable');
  assert.equal(info.width, 640);
  assert.equal(info.height, 480);
  assert.equal(info.sequential, true);
});

test('inspectJpeg: fill bytes before the EXIF segment do not lose the orientation', () => {
  const tiff = new Uint8Array([
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00,
    0x01, 0x00,
    0x12, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
  ]);
  const exif = segment(0xe1, concat(ascii('Exif\0\0'), tiff));
  const padded = concat([0xff, 0xd8], [0xff], exif, [0xff, 0xff], frame(0xc0, 10, 10, 3),
    [0xff, 0xda], u16be(2));
  assert.equal(inspectJpeg(padded).orientation, 6);
});

test('inspectJpeg: anything that is not a JPEG', () => {
  assert.equal(inspectJpeg(ascii('nope')), null);
  assert.equal(inspectJpeg(new Uint8Array(2)), null);
});

test('inspectJpeg: a file with no frame header', () => {
  assert.equal(inspectJpeg(jpegFile([])), null);
});

test('inspectJpeg: a zero-sized frame is refused', () => {
  assert.equal(inspectJpeg(jpegFile([frame(0xc0, 0, 480, 3)])), null);
});

test('inspectJpeg: a segment length running past the end is refused', () => {
  const bad = concat([0xff, 0xd8], [0xff, 0xc0], [0xff, 0xff], ascii('x'));
  assert.equal(inspectJpeg(bad), null);
});

test('inspectJpeg: the EXIF orientation is read', () => {
  // A PDF reader has no equivalent tag, so this is the only place a sideways
  // phone photo gets put right.
  const tiff = new Uint8Array([
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00,
    0x01, 0x00,
    0x12, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
  ]);
  const exif = segment(0xe1, concat(ascii('Exif\0\0'), tiff));
  assert.equal(inspectJpeg(jpegFile([exif, frame(0xc0, 10, 10, 3)])).orientation, 6);
});

test('inspectJpeg: an unreadable orientation leaves the default', () => {
  // A photo shown the right way up by luck beats one thrown away over a
  // malformed tag.
  const exif = segment(0xe1, concat(ascii('Exif\0\0'), ascii('not a tiff block')));
  assert.equal(inspectJpeg(jpegFile([exif, frame(0xc0, 10, 10, 3)])).orientation, 1);
});

test('inspectJpeg: an out-of-range orientation is ignored', () => {
  const tiff = new Uint8Array([
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00,
    0x01, 0x00,
    0x12, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, 0x63, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
  ]);
  const exif = segment(0xe1, concat(ascii('Exif\0\0'), tiff));
  assert.equal(inspectJpeg(jpegFile([exif, frame(0xc0, 10, 10, 3)])).orientation, 1);
});

test('inspectJpeg: an ICC profile is pulled out', () => {
  // Without it a Display P3 photo is shown as though its numbers were sRGB.
  const icc = segment(0xe2, concat(ascii('ICC_PROFILE\0'), [1, 1], ascii('profile')));
  const info = inspectJpeg(jpegFile([icc, frame(0xc0, 10, 10, 3)]));
  assert.equal(new TextDecoder().decode(info.icc), 'profile');
});

test('inspectJpeg: a profile split over segments is rejoined by sequence number', () => {
  const part = (index, body) =>
    segment(0xe2, concat(ascii('ICC_PROFILE\0'), [index, 2], ascii(body)));
  const info = inspectJpeg(jpegFile([part(2, 'second'), part(1, 'first'), frame(0xc0, 10, 10, 3)]));
  assert.equal(new TextDecoder().decode(info.icc), 'firstsecond');
});

test('inspectJpeg: no profile means null, not an empty array', () => {
  assert.equal(inspectJpeg(jpegFile([frame(0xc0, 10, 10, 3)])).icc, null);
});

test('inspectJpeg: only the first frame header counts', () => {
  const info = inspectJpeg(jpegFile([frame(0xc0, 640, 480, 3), frame(0xc2, 1, 1, 1)]));
  assert.equal(info.width, 640);
  assert.equal(info.sequential, true);
});
