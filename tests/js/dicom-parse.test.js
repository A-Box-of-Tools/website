/**
 * tools/dicom-viewer/src/ - the parser, the dictionary and the values.
 *
 * A DICOM reader is the kind of code where a mistake does not look like one. A
 * two-byte slip in the length field of one element does not throw: it puts the
 * cursor half an element out of step, and everything after it parses cleanly
 * into tags that do not exist holding values that are noise. The page then
 * renders a perfectly plausible header of nonsense.
 *
 * So the tests are arranged around the two things that catch that.
 *
 * **Round trips against a writer.** `dicom-fixtures.js` writes DICOM and this
 * reads it, and neither was written from the other - both were written from
 * PS3.5 and PS3.10. A reader derived from a writer would agree with it about a
 * shared mistake; these two can only agree by both being right about the format.
 *
 * **All four encodings, every time.** Implicit and explicit VR, little and big
 * endian, are four parser paths rather than four variations on one, and the one
 * that is never exercised is the one that is wrong.
 *
 * The refusals are here too, because a file that ends mid-element is the case a
 * viewer exists for and is the easiest one to get wrong by throwing.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  NotDicom, parseDataset, parseFile, walk,
} from '../../tools/dicom-viewer/src/dicom.js';
import { describe, formatTag, isPrivate } from '../../tools/dicom-viewer/src/dictionary.js';
import {
  age, charset, date, display, number, numbers, personName, text, time, values,
} from '../../tools/dicom-viewer/src/values.js';
import { transferSyntax } from '../../tools/dicom-viewer/src/uids.js';
import {
  ascii, concat, element, encapsulated, file, imageModule, item, sequenceEnd, short,
} from './dicom-fixtures.js';

const EXPLICIT_LE = '1.2.840.10008.1.2.1';
const IMPLICIT_LE = '1.2.840.10008.1.2';
const EXPLICIT_BE = '1.2.840.10008.1.2.2';

const latin1 = new TextDecoder('windows-1252');

/** The whole read, as main.js does it minus the one asynchronous syntax. */
function read(bytes) {
  const head = parseFile(bytes);
  const dataset = parseDataset(bytes, { start: head.datasetStart, syntax: head.syntax });
  return { ...head, dataset };
}

/* ------------------------------------------------------- the four encodings */

const SYNTAXES = [
  ['explicit VR little endian', EXPLICIT_LE, { explicit: true, little: true }],
  ['implicit VR little endian', IMPLICIT_LE, { explicit: false, little: true }],
  ['explicit VR big endian', EXPLICIT_BE, { explicit: true, little: false }],
];

for (const [name, uid, syntax] of SYNTAXES) {
  test(`a header round trips through ${name}`, () => {
    const bytes = file(uid, concat(
      element('00080020', 'DA', '20190314', syntax),
      element('00080060', 'CS', 'CT', syntax),
      element('00100010', 'PN', 'DOE^JANE^A', syntax),
      element('00100020', 'LO', 'MRN-4471', syntax),
      element('00200013', 'IS', '17', syntax),
      element('00280010', 'US', short(64, syntax.little), syntax),
      element('00280011', 'US', short(48, syntax.little), syntax),
    ));

    const { dataset, syntax: found } = read(bytes);

    assert.equal(found.uid, uid);
    assert.equal(found.explicit, syntax.explicit);
    assert.equal(found.little, syntax.little);

    assert.equal(text(dataset, '00080020', latin1), '20190314');
    assert.equal(text(dataset, '00080060', latin1), 'CT');
    assert.equal(text(dataset, '00100010', latin1), 'DOE^JANE^A');
    assert.equal(number(dataset, '00200013', latin1), 17);

    // The two that are numbers rather than text: a byte-order mistake turns 64
    // into 16384 and nothing else in the file would show it.
    assert.equal(number(dataset, '00280010', latin1), 64);
    assert.equal(number(dataset, '00280011', latin1), 48);
  });
}

test('implicit VR takes its value representations from the dictionary', () => {
  const syntax = { explicit: false, little: true };
  const bytes = file(IMPLICIT_LE, concat(
    element('00100010', 'PN', 'DOE^JANE', syntax),
    element('00280010', 'US', short(64), syntax),
  ));

  const { dataset } = read(bytes);
  assert.equal(dataset.byTag.get('00100010').vr, 'PN');
  assert.equal(dataset.byTag.get('00280010').vr, 'US');
  // And says that it did, because that column on the page is the tool's opinion
  // rather than the file's own words.
  assert.equal(dataset.byTag.get('00100010').guessedVR, true);
});

test('explicit VR does not consult the dictionary', () => {
  const syntax = { explicit: true, little: true };
  // A tag the dictionary has as LO, written as an ST. The file wins.
  const bytes = file(EXPLICIT_LE, element('00081030', 'ST', 'CHEST', syntax));
  const { dataset } = read(bytes);
  assert.equal(dataset.byTag.get('00081030').vr, 'ST');
  assert.equal(dataset.byTag.get('00081030').guessedVR, false);
});

test('the 32-bit length forms are read as 32-bit lengths', () => {
  const syntax = { explicit: true, little: true };
  // OB is one of the eleven VRs with two reserved bytes and a 32-bit length.
  // Reading it as a 16-bit one leaves the cursor four bytes out and every
  // element after it becomes rubbish - so the element that follows is the test.
  const bytes = file(EXPLICIT_LE, concat(
    element('00020102', 'OB', new Uint8Array(300), syntax),
    element('00080060', 'CS', 'MR', syntax),
  ));

  const { dataset } = read(bytes);
  assert.equal(dataset.byTag.get('00020102').length, 300);
  assert.equal(text(dataset, '00080060', latin1), 'MR');
});

/* -------------------------------------------------------------- sequences */

test('a sequence of defined length holds its items', () => {
  const syntax = { explicit: true, little: true };
  const inner = concat(
    element('00081150', 'UI', '1.2.840.10008.5.1.4.1.1.2', syntax),
    element('00081155', 'UI', '1.2.3.4.5', syntax),
  );
  const items = concat(item(inner), item(inner));

  const bytes = file(EXPLICIT_LE, concat(
    element('00081140', 'SQ', items, syntax),
    element('00080060', 'CS', 'CT', syntax),
  ));

  const { dataset } = read(bytes);
  const sequence = dataset.byTag.get('00081140');
  assert.equal(sequence.items.length, 2);
  assert.equal(text(sequence.items[0], '00081155', latin1), '1.2.3.4.5');
  // And the element after the sequence is still found, which is the half of
  // this that a wrong item length would break.
  assert.equal(text(dataset, '00080060', latin1), 'CT');
});

test('a sequence of undefined length ends at its delimiter', () => {
  const syntax = { explicit: true, little: true };
  const inner = element('00081155', 'UI', '1.2.3.4.5', syntax);

  const bytes = file(EXPLICIT_LE, concat(
    concat(
      [0x08, 0x00, 0x40, 0x11], ascii('SQ'), [0, 0], [0xff, 0xff, 0xff, 0xff],
      item(inner, { delimited: true }),
      sequenceEnd(),
    ),
    element('00080060', 'CS', 'CT', syntax),
  ));

  const { dataset } = read(bytes);
  const sequence = dataset.byTag.get('00081140');
  assert.equal(sequence.items.length, 1);
  assert.equal(text(sequence.items[0], '00081155', latin1), '1.2.3.4.5');
  assert.equal(text(dataset, '00080060', latin1), 'CT');
});

test('an item of undefined length ends at its own delimiter and not a nested one', () => {
  const syntax = { explicit: true, little: true };

  // A sequence, inside an item, inside a sequence. A reader that stops at the
  // first ItemDelimitationItem it meets ends the outer item at the inner one's
  // delimiter, and everything after it is lost without a word.
  const deepest = element('00081155', 'UI', '9.9.9', syntax);
  const nested = concat(
    [0x08, 0x00, 0x40, 0x11], ascii('SQ'), [0, 0], [0xff, 0xff, 0xff, 0xff],
    item(deepest, { delimited: true }),
    sequenceEnd(),
  );
  const outerItem = concat(
    element('00081150', 'UI', '1.1.1', syntax),
    nested,
    element('00200013', 'IS', '42', syntax),
  );

  const bytes = file(EXPLICIT_LE, concat(
    concat(
      [0x08, 0x00, 0x12, 0x11], ascii('SQ'), [0, 0], [0xff, 0xff, 0xff, 0xff],
      item(outerItem, { delimited: true }),
      sequenceEnd(),
    ),
    element('00080060', 'CS', 'CT', syntax),
  ));

  const { dataset } = read(bytes);
  const outer = dataset.byTag.get('00081112');
  assert.equal(outer.items.length, 1);
  assert.equal(number(outer.items[0], '00200013', latin1), 42);
  assert.equal(text(dataset, '00080060', latin1), 'CT');
});

test('walk visits everything, nested elements included', () => {
  const syntax = { explicit: true, little: true };
  const bytes = file(EXPLICIT_LE, concat(
    element('00080060', 'CS', 'CT', syntax),
    element('00081140', 'SQ', item(element('00081155', 'UI', '1.2', syntax)), syntax),
  ));

  const { dataset } = read(bytes);
  const seen = [...walk(dataset)];
  assert.deepEqual(seen.map((each) => each.element.tag),
    ['00080060', '00081140', '00081155']);
  assert.deepEqual(seen.map((each) => each.depth), [0, 0, 1]);
});

/* ------------------------------------------------------ encapsulated pixels */

test('encapsulated pixel data comes back as fragments, with the offset table apart', () => {
  const first = Uint8Array.from([1, 2, 3, 4]);
  const second = Uint8Array.from([5, 6, 7, 8, 9, 10]);

  const bytes = file('1.2.840.10008.1.2.5', concat(
    imageModule({ rows: 2, columns: 2, bitsAllocated: 8, frames: 2 }),
    encapsulated([first, second], [0, 12]),
  ));

  const { dataset } = read(bytes);
  const pixel = dataset.byTag.get('7fe00010');

  assert.equal(pixel.fragments.length, 2);
  assert.equal(pixel.fragments[0].length, 4);
  assert.equal(pixel.fragments[1].length, 6);
  // The offset table is the first item and is not a frame. A reader that counts
  // it as one produces a first slice made of four-byte integers, which looks
  // exactly like noise and is a bug people have shipped.
  assert.deepEqual(pixel.offsetTable, [0, 12]);
  assert.deepEqual(Array.from(bytes.subarray(
    pixel.fragments[0].offset, pixel.fragments[0].offset + 4,
  )), [1, 2, 3, 4]);
});

/* --------------------------------------------------------------- refusals */

test('a file that ends part-way through keeps everything before the damage', () => {
  const syntax = { explicit: true, little: true };
  const whole = file(EXPLICIT_LE, concat(
    element('00080060', 'CS', 'CT', syntax),
    element('00100010', 'PN', 'DOE^JANE', syntax),
    element('00081030', 'LO', 'A LONG STUDY DESCRIPTION', syntax),
  ));

  const truncated = whole.subarray(0, whole.length - 14);
  const { dataset } = read(truncated);

  assert.equal(text(dataset, '00080060', latin1), 'CT');
  assert.equal(text(dataset, '00100010', latin1), 'DOE^JANE');
  assert.ok(dataset.warnings.length > 0, 'it says where it stopped');
  // Warnings are keys and their numbers now, not sentences.
  const keys = dataset.warnings.map((note) => note.key);
  assert.ok(keys.includes('stop.toolong') || keys.includes('note.truncated'), keys.join(' '));
});

test('an element claiming more bytes than the file has does not throw', () => {
  const syntax = { explicit: true, little: true };
  const bytes = file(EXPLICIT_LE, concat(
    element('00080060', 'CS', 'CT', syntax),
    // An LO whose declared length is far past the end of the file.
    [0x08, 0x00, 0x30, 0x10], ascii('LO'), [0xff, 0x7f],
    ascii('CHEST'),
  ));

  const { dataset } = read(bytes);
  assert.equal(text(dataset, '00080060', latin1), 'CT');
  assert.ok(dataset.elements.some((each) => each.tag === '00081030'));
});

test('a file with no DICM marker is read as a bare dataset, and says so', () => {
  const syntax = { explicit: true, little: true };
  const bare = concat(
    element('00080005', 'CS', 'ISO_IR 100', syntax),
    element('00080060', 'CS', 'CT', syntax),
  );

  const head = parseFile(bare);
  assert.equal(head.hasPreamble, false);
  assert.equal(head.syntax.uid, EXPLICIT_LE);
  assert.deepEqual(head.warnings.map((note) => note.key), ['note.baredataset']);

  const dataset = parseDataset(bare, { start: 0, syntax: head.syntax });
  assert.equal(text(dataset, '00080060', latin1), 'CT');
});

test('a bare dataset in implicit VR is recognised as one', () => {
  const syntax = { explicit: false, little: true };
  const bare = element('00080060', 'CS', 'CT', syntax);
  const head = parseFile(bare);
  assert.equal(head.syntax.uid, IMPLICIT_LE);
});

test('something that is not DICOM at all is refused', () => {
  const jpeg = concat([0xff, 0xd8, 0xff, 0xe0], new Uint8Array(400));
  assert.throws(() => parseFile(jpeg), NotDicom);
});

test('a file with no transfer syntax falls back to the standard default', () => {
  // A meta group with everything but (0002,0010). PS3.5 section 10 says to
  // assume implicit VR little endian, and the page says that it did.
  const metaSyntax = { explicit: true, little: true };
  const meta = element('00020002', 'UI', '1.2.840.10008.5.1.4.1.1.7', metaSyntax);
  const bytes = concat(
    new Uint8Array(128), ascii('DICM'),
    element('00020000', 'UL', Uint8Array.from([meta.length, 0, 0, 0]), metaSyntax),
    meta,
    element('00080060', 'CS', 'CT', { explicit: false, little: true }),
  );

  const head = parseFile(bytes);
  assert.equal(head.syntax.uid, IMPLICIT_LE);
  assert.ok(head.warnings.some((note) => note.key === 'note.nosyntax'));
});

/* ------------------------------------------------------------ the dictionary */

test('the dictionary knows the tags the viewer depends on', () => {
  assert.deepEqual(describe('00100010'), { vr: 'PN', name: 'Patient’s Name' });
  assert.equal(describe('00280010').vr, 'US');
  assert.equal(describe('00281052').vr, 'DS');
});

test('an unknown tag is described rather than dropped', () => {
  const unknown = describe('00080099');
  assert.equal(unknown.vr, 'UN');
  assert.equal(unknown.name, null);
});

test('a group length is a UL in every group there is', () => {
  assert.equal(describe('00180000').vr, 'UL');
  assert.equal(describe('7fe00000').name, 'Group Length');
});

test('the overlay groups are matched by pattern, not by sixteen rows', () => {
  assert.equal(describe('60000010').name, 'Overlay Rows');
  assert.equal(describe('601e0010').name, 'Overlay Rows');
  assert.equal(describe('60023000').name, 'Overlay Data');
});

test('an odd group number is a private element', () => {
  assert.equal(isPrivate('00090010'), true);
  assert.equal(isPrivate('00080010'), false);
  assert.equal(describe('00091001').private, true);
});

test('a tag is written the way the standard writes it', () => {
  assert.equal(formatTag('00100010'), '(0010,0010)');
  assert.equal(formatTag('7fe00010'), '(7FE0,0010)');
});

/* ---------------------------------------------------------------- the values */

test('a multi-valued DS comes back as numbers', () => {
  const syntax = { explicit: true, little: true };
  const bytes = file(EXPLICIT_LE, element('00281050', 'DS', '40\\-600', syntax));
  const { dataset } = read(bytes);
  assert.deepEqual(numbers(dataset, '00281050', latin1), [40, -600]);
});

test('a DS that is not a number keeps the text it was', () => {
  // Files exist where a slice location is `n/a`, and a NaN in a geometry field
  // silently moves a slice to the wrong end of a stack.
  const syntax = { explicit: true, little: true };
  const bytes = file(EXPLICIT_LE, element('00201041', 'DS', 'n/a', syntax));
  const { dataset } = read(bytes);
  assert.deepEqual(values(dataset.byTag.get('00201041'), latin1), ['n/a']);
  assert.equal(number(dataset, '00201041', latin1, null), null);
});

test('trailing padding is stripped, and a UID does not keep its null', () => {
  const syntax = { explicit: true, little: true };
  const bytes = file(EXPLICIT_LE, concat(
    element('00080016', 'UI', '1.2.840.10008.5.1.4.1.1.2', syntax),
    element('00081030', 'LO', 'CHEST', syntax),
  ));
  const { dataset } = read(bytes);
  assert.equal(text(dataset, '00080016', latin1), '1.2.840.10008.5.1.4.1.1.2');
  assert.equal(text(dataset, '00081030', latin1), 'CHEST');
});

test('free-text VRs are not split on a backslash', () => {
  const syntax = { explicit: true, little: true };
  const bytes = file(EXPLICIT_LE, element('00104000', 'LT', 'seen 3\\4 in clinic', syntax));
  const { dataset } = read(bytes);
  assert.deepEqual(values(dataset.byTag.get('00104000'), latin1), ['seen 3\\4 in clinic']);
});

test('the character set is read out of the file', () => {
  assert.equal(charset('ISO_IR 192').encoding, 'utf-8');
  assert.equal(charset('ISO_IR 100').encoding, 'windows-1252');
  assert.equal(charset('').encoding, 'windows-1252');
  assert.equal(charset('NOT A REAL SET').encoding, 'windows-1252');
});

test('a UTF-8 name survives being declared', () => {
  const syntax = { explicit: true, little: true };
  const name = new TextEncoder().encode('Müller^Jörg');
  const bytes = file(EXPLICIT_LE, concat(
    element('00080005', 'CS', 'ISO_IR 192', syntax),
    element('00100010', 'PN', name, syntax),
  ));
  const { dataset } = read(bytes);
  const decoder = charset(text(dataset, '00080005', latin1));
  assert.equal(text(dataset, '00100010', decoder), 'Müller^Jörg');
});

test('dates, times, ages and names are written out for a person', () => {
  assert.equal(date('20190314'), '14 March 2019');
  assert.equal(date('1975.03.14'), '14 March 1975');
  assert.equal(date('not a date'), null);
  assert.equal(time('134522'), '13:45:22');
  assert.equal(time('1345'), '13:45:00');
  assert.equal(age('045Y'), '45 years');
  assert.equal(age('001M'), '1 month');
  // Reordered and not recased. Names in DICOM files are conventionally written
  // in capitals, and a viewer that title-cased them would turn MCDONALD into
  // Mcdonald and O'BRIEN into O'brien - which is inventing, on the one field
  // where being wrong is least acceptable.
  assert.equal(personName('DOE^JANE^A^Dr^PhD'), 'Dr JANE A DOE PhD');
  assert.equal(personName('DOE^JANE'), 'JANE DOE');
  assert.equal(personName('SINGLENAME'), 'SINGLENAME');
});

test('display keeps the raw value beside the tidied one', () => {
  const syntax = { explicit: true, little: true };
  const bytes = file(EXPLICIT_LE, element('00100010', 'PN', 'DOE^JANE', syntax));
  const { dataset } = read(bytes);
  const shown = display(dataset.byTag.get('00100010'), latin1);
  assert.equal(shown.shown, 'JANE DOE');
  // A viewer that quietly improves a value is a viewer you cannot check against
  // another tool, so the file's own words are kept.
  assert.equal(shown.raw, 'DOE^JANE');
});

test('a sequence and a fragment list say what they are rather than showing bytes', () => {
  const syntax = { explicit: true, little: true };
  const bytes = file(EXPLICIT_LE,
    element('00081140', 'SQ', concat(item(element('00081155', 'UI', '1.2', syntax))), syntax));
  const { dataset } = read(bytes);
  assert.equal(display(dataset.byTag.get('00081140'), latin1).shown, '1 item');
});

/* ---------------------------------------------------------- transfer syntaxes */

test('a transfer syntax knows what can be done with it', () => {
  assert.equal(transferSyntax(EXPLICIT_LE).pixels, 'native');
  assert.equal(transferSyntax('1.2.840.10008.1.2.5').pixels, 'rle');
  assert.equal(transferSyntax('1.2.840.10008.1.2.4.70').pixels, 'lossless');
  assert.equal(transferSyntax('1.2.840.10008.1.2.4.50').pixels, 'jpeg');
  assert.equal(transferSyntax('1.2.840.10008.1.2.4.90').pixels, 'no');
  assert.equal(transferSyntax('1.2.840.10008.1.2.4.90').encapsulated, true);
});

test('an unrecognised transfer syntax gets the safe reading and no decoder', () => {
  const unknown = transferSyntax('1.2.840.10008.1.2.4.999');
  assert.equal(unknown.known, false);
  assert.equal(unknown.explicit, true);
  assert.equal(unknown.little, true);
  assert.equal(unknown.pixels, 'no');
});
