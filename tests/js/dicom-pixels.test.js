/**
 * tools/dicom-viewer/src/ - the pixels, the two codecs, and the window.
 *
 * The failure mode this file exists for: a picture that is recognisable and
 * wrong. Nothing about a scan tells you by looking at it that the bit mask was
 * applied at the wrong offset, that the RLE segments were reassembled in the
 * wrong order, or that the rescale was applied after the window instead of
 * before. The anatomy is all there in every one of those cases. Only the
 * numbers are wrong, and the numbers are what the tool is for.
 *
 * So every pixel test here is a round trip against a known array of values,
 * checked value for value rather than by eye - and the fixtures are ramps
 * rather than flat fills, because a flat fill survives a row-order mistake, an
 * off-by-one and a byte swap without complaining.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { parseDataset, parseFile } from '../../tools/dicom-viewer/src/dicom.js';
import { charset, text } from '../../tools/dicom-viewer/src/values.js';
import { decodeFrame, imageInfo } from '../../tools/dicom-viewer/src/pixels.js';
import { decodeRLE } from '../../tools/dicom-viewer/src/rle.js';
import { decodeJPEGLossless } from '../../tools/dicom-viewer/src/jpeg-lossless.js';
import {
  CT_PRESETS, fileWindows, fullRange, measured, render, voi,
} from '../../tools/dicom-viewer/src/window.js';
import {
  concat, element, encapsulated, encodeJPEGLossless, encodeRLE, file, imageModule, ramp, words,
} from './dicom-fixtures.js';

const EXPLICIT_LE = '1.2.840.10008.1.2.1';
const EXPLICIT_BE = '1.2.840.10008.1.2.2';
const RLE = '1.2.840.10008.1.2.5';
const JPEG_LOSSLESS = '1.2.840.10008.1.2.4.70';

const latin1 = new TextDecoder('windows-1252');

/** A file, opened as main.js opens it. */
function open(bytes) {
  const head = parseFile(bytes);
  const dataset = parseDataset(bytes, { start: head.datasetStart, syntax: head.syntax });
  const decoder = charset(text(dataset, '00080005', latin1));
  return {
    bytes,
    dataset,
    decoder,
    syntax: head.syntax,
    info: imageInfo(dataset, decoder),
    pixel: dataset.byTag.get('7fe00010'),
  };
}

const frameOf = (opened, index = 0) => decodeFrame(
  opened.bytes, opened.pixel, opened.info, opened.syntax, index,
);

/* ---------------------------------------------------------- native pixels */

test('16-bit unsigned pixels come back exactly as written', () => {
  const values = ramp(8 * 6, 4096);
  const bytes = file(EXPLICIT_LE, concat(
    imageModule({ rows: 6, columns: 8, bitsAllocated: 16, bitsStored: 12, highBit: 11 }),
    element('7fe00010', 'OW', words(values)),
  ));

  const frame = frameOf(open(bytes));
  assert.equal(frame.width, 8);
  assert.equal(frame.height, 6);
  assert.equal(frame.samples, 1);
  assert.deepEqual(Array.from(frame.values), Array.from(values));
});

test('16-bit pixels in a big-endian file come back exactly as written', () => {
  const syntax = { explicit: true, little: false };
  const values = ramp(4 * 4, 4096, 100);
  const bytes = file(EXPLICIT_BE, concat(
    imageModule({ rows: 4, columns: 4, bitsAllocated: 16, bitsStored: 12, highBit: 11, syntax }),
    element('7fe00010', 'OW', words(values, false), syntax),
  ));

  const frame = frameOf(open(bytes));
  assert.deepEqual(Array.from(frame.values), Array.from(values));
});

test('signed pixels are sign-extended from Bits Stored, not from the word', () => {
  // -1000 in twelve bits is 0xC18. Read as an unsigned 16-bit word it is 3096,
  // which is a perfectly plausible number and the wrong one: on a CT it is the
  // difference between air and dense bone.
  const stored = [-1000, -1, 0, 1, 2047, -2048];
  const bytes = file(EXPLICIT_LE, concat(
    imageModule({
      rows: 1, columns: 6, bitsAllocated: 16, bitsStored: 12, highBit: 11, signed: 1,
    }),
    element('7fe00010', 'OW', words(stored)),
  ));

  const frame = frameOf(open(bytes));
  assert.deepEqual(Array.from(frame.values), stored);
});

test('High Bit says where the measurement sits inside the word', () => {
  // Twelve bits of measurement in the top of a sixteen-bit word: high bit 15,
  // bits stored 12. Everything below bit 4 is padding and must be shifted off.
  const real = [0, 1, 2047, 4095];
  const bytes = file(EXPLICIT_LE, concat(
    imageModule({ rows: 1, columns: 4, bitsAllocated: 16, bitsStored: 12, highBit: 15 }),
    element('7fe00010', 'OW', words(real.map((value) => (value << 4) | 0b1011))),
  ));

  const frame = frameOf(open(bytes));
  assert.deepEqual(Array.from(frame.values), real);
});

test('8-bit pixels come back exactly as written', () => {
  const values = ramp(5 * 3, 256);
  const bytes = file(EXPLICIT_LE, concat(
    imageModule({ rows: 3, columns: 5, bitsAllocated: 8 }),
    element('7fe00010', 'OB', Uint8Array.from(values)),
  ));

  assert.deepEqual(Array.from(frameOf(open(bytes)).values), Array.from(values));
});

test('one-bit pixels are unpacked least significant bit first', () => {
  // 16 pixels in two bytes. The bit order within a byte is the one thing the
  // standard is easy to read backwards, and reading it backwards mirrors every
  // group of eight pixels.
  const bits = [1, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0];
  const packed = new Uint8Array(2);
  for (let at = 0; at < bits.length; at += 1) {
    if (bits[at]) packed[at >> 3] |= 1 << (at & 7);
  }

  const bytes = file(EXPLICIT_LE, concat(
    imageModule({ rows: 2, columns: 8, bitsAllocated: 1, bitsStored: 1, highBit: 0 }),
    element('7fe00010', 'OB', packed),
  ));

  assert.deepEqual(Array.from(frameOf(open(bytes)).values), bits);
});

test('a second frame starts where the first one ends', () => {
  const first = ramp(16, 4096, 0);
  const second = ramp(16, 4096, 500);
  const bytes = file(EXPLICIT_LE, concat(
    imageModule({ rows: 4, columns: 4, frames: 2 }),
    element('7fe00010', 'OW', words(Array.from(first).concat(Array.from(second)))),
  ));

  const opened = open(bytes);
  assert.equal(opened.info.frames, 2);
  assert.deepEqual(Array.from(frameOf(opened, 0).values), Array.from(first));
  assert.deepEqual(Array.from(frameOf(opened, 1).values), Array.from(second));
});

test('a frame that runs off the end of the file is padded rather than refused', () => {
  const values = ramp(16, 4096);
  const bytes = file(EXPLICIT_LE, concat(
    imageModule({ rows: 4, columns: 4 }),
    element('7fe00010', 'OW', words(values).subarray(0, 20)),
  ));

  const frame = frameOf(open(bytes));
  assert.equal(frame.values.length, 16);
  assert.deepEqual(Array.from(frame.values.subarray(0, 10)), Array.from(values.subarray(0, 10)));
});

/* ----------------------------------------------------------------- colour */

test('RGB pixels stored by plane are interleaved back into pixels', () => {
  const red = [10, 20, 30, 40];
  const green = [50, 60, 70, 80];
  const blue = [90, 100, 110, 120];

  const planar = file(EXPLICIT_LE, concat(
    imageModule({
      rows: 2, columns: 2, bitsAllocated: 8, samples: 3, photometric: 'RGB', planar: 1,
    }),
    element('7fe00010', 'OB', Uint8Array.from([...red, ...green, ...blue])),
  ));

  const frame = frameOf(open(planar));
  assert.equal(frame.samples, 3);
  assert.deepEqual(Array.from(frame.values), [
    10, 50, 90, 20, 60, 100, 30, 70, 110, 40, 80, 120,
  ]);
});

test('a palette image keeps its indexes, and the tables come back with it', () => {
  const indexes = [0, 1, 2, 3];
  const bytes = file(EXPLICIT_LE, concat(
    imageModule({ rows: 2, columns: 2, bitsAllocated: 8, photometric: 'PALETTE COLOR' }),
    element('00281101', 'US', words([4, 10, 8])),
    element('00281102', 'US', words([4, 10, 8])),
    element('00281103', 'US', words([4, 10, 8])),
    element('00281201', 'OW', Uint8Array.from([255, 0, 0, 0])),
    element('00281202', 'OW', Uint8Array.from([0, 255, 0, 0])),
    element('00281203', 'OW', Uint8Array.from([0, 0, 255, 0])),
    element('7fe00010', 'OB', Uint8Array.from(indexes)),
  ));

  const opened = open(bytes);
  assert.equal(opened.info.palette.count, 4);
  // The value the first entry stands for. A table that starts somewhere other
  // than zero is normal in nuclear medicine, and ignoring it draws black.
  assert.equal(opened.info.palette.first, 10);

  const frame = frameOf(opened);
  assert.deepEqual(Array.from(frame.values), indexes);

  const image = render(frame, opened.info, { center: 0, width: 1, invert: false });
  // Index 0 is 10 short of the table's first entry, so it clamps to row 0: red.
  assert.deepEqual(Array.from(image.data.subarray(0, 4)), [255, 0, 0, 255]);
});

/* -------------------------------------------------------------------- RLE */

test('an RLE frame round trips through the segment header', () => {
  const values = ramp(16 * 8, 4096);
  const raw = words(values);
  const compressed = encodeRLE(raw, 16 * 8, 1, 2);

  const bytes = file(RLE, concat(
    imageModule({ rows: 8, columns: 16, bitsAllocated: 16, bitsStored: 12, highBit: 11 }),
    encapsulated([compressed]),
  ));

  assert.deepEqual(Array.from(frameOf(open(bytes)).values), Array.from(values));
});

test('RLE puts the most significant byte in the first segment', () => {
  // The whole of annex G in one assertion. Every value here has a different
  // high byte and low byte, so swapping the two segments changes every number
  // and leaves a picture that still looks like something.
  const values = [0x0102, 0x0304, 0x0506, 0x0708];
  const compressed = encodeRLE(words(values), 4, 1, 2);

  const raw = decodeRLE(compressed, 4, 1, 2);
  // Back in the little-endian order an uncompressed element would have held.
  assert.deepEqual(Array.from(raw), [0x02, 0x01, 0x04, 0x03, 0x06, 0x05, 0x08, 0x07]);
});

test('an RLE colour frame comes back sample-interleaved', () => {
  const pixels = [
    10, 50, 90,
    20, 60, 100,
    30, 70, 110,
    40, 80, 120,
  ];
  const compressed = encodeRLE(Uint8Array.from(pixels), 4, 3, 1);
  const raw = decodeRLE(compressed, 4, 3, 1);
  assert.deepEqual(Array.from(raw), pixels);
});

test('a long run of one value survives the replicate coding', () => {
  const flat = new Uint8Array(500).fill(0x5a);
  const compressed = encodeRLE(flat, 500, 1, 1);
  assert.ok(compressed.length < 100, 'a flat plane compresses');
  assert.deepEqual(Array.from(decodeRLE(compressed, 500, 1, 1)), Array.from(flat));
});

test('an RLE frame with too few segments for the image is refused by name', () => {
  const compressed = encodeRLE(new Uint8Array(4), 4, 1, 1);
  assert.throws(() => decodeRLE(compressed, 4, 1, 2), /needs 2 RLE segments/);
});

/* ---------------------------------------------------------- JPEG lossless */

test('a JPEG lossless frame round trips value for value', () => {
  const width = 17;      // deliberately not a multiple of anything
  const height = 9;
  const values = ramp(width * height, 4096);
  const jpeg = encodeJPEGLossless(values, width, height, 12);

  const decoded = decodeJPEGLossless(jpeg);
  assert.equal(decoded.width, width);
  assert.equal(decoded.height, height);
  assert.equal(decoded.precision, 12);
  assert.deepEqual(Array.from(decoded.samples), Array.from(values));
});

test('JPEG lossless through the whole pixel path, with the DICOM sign applied', () => {
  const width = 8;
  const height = 4;
  // Stored as twelve unsigned bits, read as twelve signed ones: everything
  // above 2047 comes back negative, which is what a CT actually does.
  const written = ramp(width * height, 4096, 2040);
  const jpeg = encodeJPEGLossless(written, width, height, 12);

  const bytes = file(JPEG_LOSSLESS, concat(
    imageModule({
      rows: height, columns: width, bitsAllocated: 16, bitsStored: 12, highBit: 11, signed: 1,
    }),
    encapsulated([jpeg]),
  ));

  const frame = frameOf(open(bytes));
  const expected = Array.from(written, (value) => (value & 0x800 ? (value & 0xfff) - 4096 : value & 0xfff));
  assert.deepEqual(Array.from(frame.values), expected);
});

test('a three-component JPEG lossless scan keeps its components apart', () => {
  const width = 4;
  const height = 3;
  const values = new Int32Array(width * height * 3);
  for (let at = 0; at < width * height; at += 1) {
    values[at * 3] = at;
    values[at * 3 + 1] = 100 + at;
    values[at * 3 + 2] = 200 + at;
  }

  const decoded = decodeJPEGLossless(encodeJPEGLossless(values, width, height, 12, 3));
  assert.equal(decoded.components, 3);
  assert.deepEqual(Array.from(decoded.samples), Array.from(values));
});

test('a baseline JPEG inside a lossless transfer syntax is named rather than mangled', () => {
  // 0xFFC0 is SOF0: a DCT frame. It happens when a converter transcodes the
  // pixels and forgets to change (0002,0010).
  const baseline = Uint8Array.from([0xff, 0xd8, 0xff, 0xc0, 0, 11, 8, 0, 4, 0, 4, 1, 1, 0x11, 0]);
  assert.throws(() => decodeJPEGLossless(baseline), /DCT-based JPEG, not a lossless one/);
});

/* ------------------------------------------------------- window and level */

test('the linear VOI transform has the half-unit offsets the standard specifies', () => {
  // PS3.3 C.11.2.1.2. The edges are at c - 0.5 - (w-1)/2 and c - 0.5 + (w-1)/2,
  // which look like a rounding quirk and are not: writing it the obvious way
  // puts every rendering half a grey level away from every other viewer's.
  assert.equal(voi(-1000, 40, 400), 0);
  assert.equal(voi(1000, 40, 400), 255);
  assert.equal(voi(39.5, 40, 400), 128);
  assert.equal(voi(-160, 40, 400), 0);      // exactly at the low edge
  assert.equal(voi(240, 40, 400), 255);     // past the high edge
});

test('the sigmoid and exact forms are the ones the file asks for', () => {
  assert.equal(voi(40, 40, 400, 'SIGMOID'), 128);
  assert.equal(voi(40, 40, 400, 'LINEAR_EXACT'), 128);
  assert.equal(voi(-160, 40, 400, 'LINEAR_EXACT'), 0);
});

test('the rescale happens before the window, not after it', () => {
  // A CT that stores 1024 for water with an intercept of -1024. Under a
  // soft-tissue window that pixel is mid-grey. Windowing the stored value
  // instead puts it hard against white, and nothing on screen says so.
  const info = {
    slope: 1, intercept: -1024, photometric: 'MONOCHROME2', bitsStored: 12,
    palette: null, modality: 'CT',
  };
  const frame = {
    width: 1, height: 1, samples: 1, values: Int32Array.from([1024]), min: 1024, max: 1024,
  };

  const image = render(frame, info, { center: 40, width: 400, invert: false });
  assert.equal(image.data[0], voi(0, 40, 400));
  assert.ok(image.data[0] > 100 && image.data[0] < 160, 'water is mid-grey');
});

test('MONOCHROME1 is inverted, and the invert control inverts it back', () => {
  const base = {
    slope: 1, intercept: 0, bitsStored: 8, palette: null, modality: '',
  };
  const frame = {
    width: 2, height: 1, samples: 1, values: Int32Array.from([0, 255]), min: 0, max: 255,
  };
  const window = { center: 128, width: 256, invert: false };

  const normal = render(frame, { ...base, photometric: 'MONOCHROME2' }, window);
  const inverted = render(frame, { ...base, photometric: 'MONOCHROME1' }, window);

  assert.ok(normal.data[0] < normal.data[4], 'MONOCHROME2: 0 is black');
  assert.ok(inverted.data[0] > inverted.data[4], 'MONOCHROME1: 0 is white');

  const both = render(frame, { ...base, photometric: 'MONOCHROME1' },
    { ...window, invert: true });
  assert.equal(both.data[0], normal.data[0]);
});

test('the lookup table and the arithmetic agree', () => {
  // The greyscale path builds a table over the frame's value range where it can
  // and does the arithmetic per pixel where it cannot. Both have to give the
  // same picture, or a 32-bit dose grid would render differently from a CT.
  const info = {
    slope: 1, intercept: -1024, photometric: 'MONOCHROME2', bitsStored: 16,
    palette: null, modality: 'CT',
  };
  const values = Int32Array.from(ramp(64, 4096));
  const window = { center: 40, width: 400, invert: false };

  const tabled = render({ width: 8, height: 8, samples: 1, values, min: 0, max: 4095 },
    info, window);
  // A range too wide for a table forces the other path over the same values.
  const direct = render({ width: 8, height: 8, samples: 1, values, min: 0, max: 100000 },
    info, window);

  assert.deepEqual(Array.from(tabled.data), Array.from(direct.data));
});

test('the pixel padding value is kept out of the frame range', () => {
  // A scanner writes -2000 outside the reconstruction circle, where the anatomy
  // is -100 to 300. Leaving it in makes the automatic window two greys.
  const bytes = file(EXPLICIT_LE, concat(
    concat(
      imageModule({
        rows: 1, columns: 4, bitsAllocated: 16, bitsStored: 12, highBit: 11, signed: 1,
      }),
      element('00280120', 'US', words([-2000 & 0xffff])),
    ),
    element('7fe00010', 'OW', words([-2000, 100, 200, 300])),
  ));

  const frame = frameOf(open(bytes));
  assert.equal(frame.min, 100);
  assert.equal(frame.max, 300);
});

test('the windows a file asks for are offered in the order it lists them', () => {
  const bytes = file(EXPLICIT_LE, concat(
    imageModule({ rows: 2, columns: 2, bitsAllocated: 8 }),
    element('00281055', 'LO', 'LUNG\\MEDIASTINUM'),
    element('7fe00010', 'OB', Uint8Array.from([0, 1, 2, 3])),
  ));

  // Written by hand rather than through imageModule, because two centres and
  // two widths in one element is the case that matters here.
  const withWindows = file(EXPLICIT_LE, concat(
    imageModule({ rows: 2, columns: 2, bitsAllocated: 8 }),
    element('00281050', 'DS', '-600\\50'),
    element('00281051', 'DS', '1500\\350'),
    element('00281055', 'LO', 'LUNG\\MEDIASTINUM'),
    element('7fe00010', 'OB', Uint8Array.from([0, 1, 2, 3])),
  ));

  assert.deepEqual(fileWindows(open(bytes).info), []);

  const windows = fileWindows(open(withWindows).info);
  assert.equal(windows.length, 2);
  assert.deepEqual(windows[0], { id: 'file-0', name: 'LUNG', center: -600, width: 1500 });
  assert.deepEqual(windows[1], { id: 'file-1', name: 'MEDIASTINUM', center: 50, width: 350 });

  // A file that gives centres and widths but no names leaves the naming to the
  // page, which is where this site's own words live.
  const unnamed = file(EXPLICIT_LE, concat(
    imageModule({ rows: 2, columns: 2, bitsAllocated: 8, center: 40, width: 400 }),
    element('7fe00010', 'OB', Uint8Array.from([0, 1, 2, 3])),
  ));
  assert.deepEqual(fileWindows(open(unnamed).info),
    [{ id: 'file-0', name: null, center: 40, width: 400 }]);
});

test('the full-range window is in the units the file is measured in', () => {
  const info = { slope: 1, intercept: -1024 };
  const window = fullRange({ min: 0, max: 4095 }, info);
  assert.equal(window.center, (-1024 + 3071) / 2);
  assert.equal(window.width, 4095);
});

test('a CT value reads out in Hounsfield units whether or not the file says so', () => {
  assert.deepEqual(measured(1124, { slope: 1, intercept: -1024, rescaleType: '', modality: 'CT' }),
    { value: 100, unit: 'HU' });
  // "US" in Rescale Type means unspecified, and is not a unit to print.
  assert.deepEqual(measured(5, { slope: 2, intercept: 0, rescaleType: 'US', modality: 'PT' }),
    { value: 10, unit: '' });
});

test('the CT presets are the windows a reading room actually uses', () => {
  const lung = CT_PRESETS.find((preset) => preset.id === 'lung');
  const bone = CT_PRESETS.find((preset) => preset.id === 'bone');
  // Ids and no names: the words are in the markup, where a translator can
  // reach them.
  assert.ok(CT_PRESETS.every((preset) => preset.name === undefined));
  assert.deepEqual({ center: lung.center, width: lung.width }, { center: -600, width: 1500 });

  // The point of a lung window is that air, inflated lung and soft tissue are
  // three distinguishable greys rather than one black and one white. A window
  // that clipped any of them would still look like a chest.
  const air = voi(-1000, lung.center, lung.width);
  const parenchyma = voi(-700, lung.center, lung.width);
  const soft = voi(40, lung.center, lung.width);
  assert.ok(air > 0 && air < parenchyma && parenchyma < soft && soft < 255);

  // And under a bone window all three of them are the same black, which is why
  // there is more than one preset.
  assert.equal(voi(-1000, bone.center, bone.width), 0);
  assert.equal(voi(-700, bone.center, bone.width), 0);
});

/* --------------------------------------------------------------- the header */

test('imageInfo reads the fields the rest of the tool depends on', () => {
  const bytes = file(EXPLICIT_LE, concat(
    element('00080060', 'CS', 'CT'),
    imageModule({
      rows: 512, columns: 512, bitsAllocated: 16, bitsStored: 12, highBit: 11, signed: 1,
      slope: 1, intercept: -1024, center: 40, width: 400, spacing: '0.4785\\0.4785',
    }),
    element('7fe00010', 'OW', new Uint8Array(8)),
  ));

  const { info } = open(bytes);
  assert.equal(info.rows, 512);
  assert.equal(info.columns, 512);
  assert.equal(info.signed, true);
  assert.equal(info.intercept, -1024);
  assert.equal(info.modality, 'CT');
  assert.deepEqual(info.spacing, { row: 0.4785, column: 0.4785 });
  assert.deepEqual(info.windowCenters, [40]);
});

test('a file that does not say how far apart its pixels are says so rather than guessing', () => {
  const bytes = file(EXPLICIT_LE, concat(
    imageModule({ rows: 4, columns: 4, bitsAllocated: 8 }),
    element('7fe00010', 'OB', new Uint8Array(16)),
  ));
  assert.equal(open(bytes).info.spacing, null);
});

test('a rescale slope of zero is not allowed to erase the image', () => {
  // A slope of 0 maps every value to the intercept. Files carrying one exist,
  // and every viewer treats it as the 1 the standard's default would have been.
  const bytes = file(EXPLICIT_LE, concat(
    imageModule({ rows: 2, columns: 2, bitsAllocated: 8, slope: 0, intercept: 5 }),
    element('7fe00010', 'OB', new Uint8Array(4)),
  ));
  assert.equal(open(bytes).info.slope, 1);
});
