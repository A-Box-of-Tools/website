/**
 * tools/dicom-viewer/src/ - the stack, the identifiers and the report.
 *
 * These three have nothing in common except that all three are claims about a
 * file that a viewer makes on the page and that nobody can check by looking at
 * the picture. A stack in the wrong order scrolls perfectly smoothly through
 * the wrong anatomy. An identifier panel that misses a field says a file is
 * clean when it is not, which is worse than saying nothing. A report that
 * silently drops an element is a report somebody trusted.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { parseDataset, parseFile, walk } from '../../tools/dicom-viewer/src/dicom.js';
import { display } from '../../tools/dicom-viewer/src/values.js';
import {
  alongNormal, describeInstance, naturalCompare, organise, sliceSpacing, sortInstances,
} from '../../tools/dicom-viewer/src/series.js';
import { identifiers } from '../../tools/dicom-viewer/src/identity.js';
import { report } from '../../tools/dicom-viewer/src/report.js';
import { transferSyntax } from '../../tools/dicom-viewer/src/uids.js';
import { concat, element, file, imageModule } from './dicom-fixtures.js';

const EXPLICIT_LE = '1.2.840.10008.1.2.1';
const latin1 = new TextDecoder('windows-1252');

/** An axial slice at `z`, which is where nearly every CT and MR series lives. */
const axial = (name, z, instanceNumber, seriesUID = '1.2.3.SERIES') => ({
  name,
  seriesUID,
  studyUID: '1.2.3',
  seriesNumber: 1,
  seriesDescription: 'AXIAL',
  modality: 'CT',
  instanceNumber,
  sliceLocation: z,
  position: [-250, -250, z],
  orientation: [1, 0, 0, 0, 1, 0],
});

/* ------------------------------------------------------------- the geometry */

test('a slice knows how far along its own stack it sits', () => {
  // The normal to an axial plane is the z axis, so the projection is the z of
  // the position and nothing else.
  assert.equal(alongNormal(axial('a', 42.5, 1)), 42.5);

  // A sagittal plane: rows run front to back, columns head to foot, so the
  // normal lies along x and the projection is the x of the position - here
  // negated, because the cross product of those two directions points at -x.
  // The sign is a direction rather than a distance, and sorting only needs it
  // to be the same for every slice of one series, which it is by construction.
  assert.equal(alongNormal({
    position: [12, -100, 80],
    orientation: [0, 1, 0, 0, 0, -1],
  }), -12);
});

test('a slice with no geometry has no position rather than a position of zero', () => {
  assert.equal(alongNormal({ position: null, orientation: [1, 0, 0, 0, 1, 0] }), null);
  assert.equal(alongNormal({ position: [0, 0, 5], orientation: null }), null);
});

/* --------------------------------------------------------------- the stack */

test('slices are ordered by where they sit, not by how they are numbered', () => {
  // A scanner that reconstructs from the feet up and numbers from the head
  // down. Sorting on Instance Number scrolls the patient backwards, and there
  // is nothing on the screen that would say so.
  const shuffled = [
    axial('IM3', 30, 1),
    axial('IM1', 10, 3),
    axial('IM2', 20, 2),
  ];

  const { instances, orderedBy } = sortInstances(shuffled);
  assert.equal(orderedBy, 'position');
  assert.deepEqual(instances.map((each) => each.name), ['IM1', 'IM2', 'IM3']);
});

test('without a geometry the fallback is the instance number, and it says so', () => {
  const flat = [
    { name: 'b', instanceNumber: 2, position: null, orientation: null, seriesUID: 'S' },
    { name: 'a', instanceNumber: 1, position: null, orientation: null, seriesUID: 'S' },
  ];

  const { instances, orderedBy } = sortInstances(flat);
  assert.equal(orderedBy, 'number');
  assert.deepEqual(instances.map((each) => each.name), ['a', 'b']);
});

test('slices that all claim the same position are not sorted on a constant', () => {
  // Localiser images do this. Sorting on a key every member shares leaves the
  // order to whatever the engine's sort happened to do with it.
  const same = [
    { ...axial('IM2', 0, 2) },
    { ...axial('IM1', 0, 1) },
  ];
  const { instances, orderedBy } = sortInstances(same);
  assert.equal(orderedBy, 'number');
  assert.deepEqual(instances.map((each) => each.name), ['IM1', 'IM2']);
});

test('with neither a position nor a number the names are compared as a person would', () => {
  const named = ['IM10', 'IM2', 'IM1'].map((name) => ({
    name, instanceNumber: null, position: null, orientation: null, seriesUID: 'S',
  }));
  assert.deepEqual(sortInstances(named).instances.map((each) => each.name),
    ['IM1', 'IM2', 'IM10']);
});

test('IM2 sorts before IM10', () => {
  assert.ok(naturalCompare('IM2', 'IM10') < 0);
  assert.ok(naturalCompare('IM10', 'IM2') > 0);
  assert.equal(naturalCompare('IM7', 'IM7'), 0);
  assert.ok(naturalCompare('a', 'b') < 0);
});

test('a folder is split into the series the files say they belong to', () => {
  const mixed = [
    axial('IM1', 10, 1, '1.2.3.A'),
    { ...axial('IM2', 10, 1, '1.2.3.B'), seriesNumber: 2, seriesDescription: 'CORONAL' },
    axial('IM3', 20, 2, '1.2.3.A'),
  ];

  const series = organise(mixed);
  assert.equal(series.length, 2);
  assert.equal(series[0].uid, '1.2.3.A');
  assert.equal(series[0].instances.length, 2);
  assert.equal(series[1].description, 'CORONAL');
});

test('two unrelated files with no series UID are two series, not one stack', () => {
  // Otherwise dropping two single scans of two different people produces a
  // "series" that scrolls between them.
  const loose = [
    { name: 'one.dcm', seriesUID: '', instanceNumber: 1, position: null, orientation: null },
    { name: 'two.dcm', seriesUID: '', instanceNumber: 1, position: null, orientation: null },
  ];
  assert.equal(organise(loose).length, 2);
});

test('series are offered in the order the scanner numbered them', () => {
  const study = [
    { ...axial('a', 0, 1, 'S3'), seriesNumber: 3 },
    { ...axial('b', 0, 1, 'S1'), seriesNumber: 1 },
    { ...axial('c', 0, 1, 'S2'), seriesNumber: 2 },
  ];
  assert.deepEqual(organise(study).map((each) => each.number), [1, 2, 3]);
});

/* ------------------------------------------------------------- the spacing */

test('the slice spacing is the gap between neighbours, in millimetres', () => {
  const stack = [0, 5, 10, 15].map((z, at) => axial(`IM${at}`, z, at + 1));
  assert.deepEqual(sliceSpacing(stack), { spacing: 5, irregular: false });
});

test('a missing slice makes the spacing irregular, and it is not hidden', () => {
  // The median gap is still 5, so a viewer taking the mean or the range over
  // the count would report a tidy 6.67 mm and scroll straight past the hole.
  const stack = [0, 5, 10, 20].map((z, at) => axial(`IM${at}`, z, at + 1));
  const found = sliceSpacing(stack);
  assert.equal(found.spacing, 5);
  assert.equal(found.irregular, true);
});

test('a single slice has no spacing to report', () => {
  assert.equal(sliceSpacing([axial('IM1', 0, 1)]), null);
});

/* ---------------------------------------------------- reading it off a file */

test('what a file contributes to the stack is read straight out of it', () => {
  const bytes = file(EXPLICIT_LE, concat(
    element('00080060', 'CS', 'MR'),
    element('0008103e', 'LO', 'T2 AXIAL'),
    element('0020000d', 'UI', '1.2.3'),
    element('0020000e', 'UI', '1.2.3.4'),
    element('00200011', 'IS', '4'),
    element('00200013', 'IS', '17'),
    element('00200032', 'DS', '-120\\-120\\62.5'),
    element('00200037', 'DS', '1\\0\\0\\0\\1\\0'),
    element('00201041', 'DS', '62.5'),
    element('00280008', 'IS', '24'),
  ));

  const head = parseFile(bytes);
  const dataset = parseDataset(bytes, { start: head.datasetStart, syntax: head.syntax });
  const instance = describeInstance(dataset, latin1, 'IM17');

  assert.equal(instance.modality, 'MR');
  assert.equal(instance.seriesUID, '1.2.3.4');
  assert.equal(instance.instanceNumber, 17);
  // The scrubber needs the length of the stack before it draws anything, and a
  // file holding twenty-four frames is twenty-four positions on its own.
  assert.equal(instance.frames, 24);
  assert.deepEqual(instance.position, [-120, -120, 62.5]);
  assert.deepEqual(instance.orientation, [1, 0, 0, 0, 1, 0]);
  assert.equal(alongNormal(instance), 62.5);
});

/* ----------------------------------------------------------- the identifiers */

const identified = (dataset) => identifiers(walk(dataset), (each) => display(each, latin1));

function datasetOf(...parts) {
  const bytes = file(EXPLICIT_LE, concat(...parts));
  const head = parseFile(bytes);
  return parseDataset(bytes, { start: head.datasetStart, syntax: head.syntax });
}

test('the identifiers a file carries are found and graded', () => {
  const dataset = datasetOf(
    element('00080020', 'DA', '20190314'),
    element('00080050', 'SH', 'ACC-99812'),
    element('00080080', 'LO', 'ST ELSEWHERE GENERAL'),
    element('00080090', 'PN', 'SMITH^JOHN'),
    element('00100010', 'PN', 'DOE^JANE'),
    element('00100020', 'LO', 'MRN-4471'),
    element('00100030', 'DA', '19750314'),
  );

  const { found } = identified(dataset);
  const byTag = new Map(found.map((each) => [each.tag, each]));

  // A name and a hospital number are the person. A birth date, an institution
  // and a referring doctor narrow down who the person could be, which is the
  // half that survives a careless anonymisation.
  assert.equal(byTag.get('00100010').level, 'direct');
  assert.equal(byTag.get('00100020').level, 'direct');
  assert.equal(byTag.get('00080050').level, 'direct');
  assert.equal(byTag.get('00100030').level, 'context');
  assert.equal(byTag.get('00080080').level, 'context');
  assert.equal(byTag.get('00080090').level, 'context');

  // And the value shown is the readable one, because the point of the panel is
  // that somebody can see what is actually in their file.
  assert.equal(byTag.get('00100030').value, '14 March 1975');
});

test('a field that has been emptied is not reported as an identifier', () => {
  // A file whose Patient's Name is a zero-length value has had the name taken
  // out. Listing it would tell somebody their anonymiser had failed when it had
  // worked.
  const dataset = datasetOf(
    element('00100010', 'PN', ''),
    element('00100020', 'LO', 'MRN-4471'),
  );

  const { found } = identified(dataset);
  assert.deepEqual(found.map((each) => each.tag), ['00100020']);
});

test('a file with nothing identifying in it comes back with nothing', () => {
  const dataset = datasetOf(
    element('00080060', 'CS', 'CT'),
    imageModule({ rows: 2, columns: 2, bitsAllocated: 8 }),
  );
  assert.deepEqual(identified(dataset).found, []);
});

test('the UIDs and the private elements are counted rather than listed', () => {
  const dataset = datasetOf(
    element('00080018', 'UI', '1.2.3.4.5'),
    element('0020000d', 'UI', '1.2.3'),
    element('0020000e', 'UI', '1.2.3.4'),
    element('00090010', 'LO', 'SIEMENS CSA HEADER'),
    element('00091001', 'UN', Uint8Array.from([1, 2, 3, 4])),
  );

  const { found, uidCount, privateCount } = identified(dataset);
  // None of them is a name, so none of them is in the list. Every one of them
  // is a key into the archive that made the file, so all of them are counted.
  assert.deepEqual(found, []);
  assert.equal(uidCount, 3);
  assert.equal(privateCount, 2);
});

/* ---------------------------------------------------------------- the report */

test('the report holds every element, nesting included', () => {
  const dataset = datasetOf(
    element('00080060', 'CS', 'CT'),
    element('00100010', 'PN', 'DOE^JANE'),
    imageModule({ rows: 4, columns: 4, bitsAllocated: 8, spacing: '0.5\\0.5' }),
  );

  const text = report({
    name: 'IM1.dcm',
    size: 1234,
    syntax: transferSyntax(EXPLICIT_LE),
    sopClass: 'CT Image',
    image: {
      rows: 4, columns: 4, samplesPerPixel: 1, bitsStored: 8, frames: 1,
      photometric: 'MONOCHROME2', spacing: { row: 0.5, column: 0.5 },
    },
    warnings: [],
    meta: dataset,
    dataset,
    origin: 'https://abox.tools/dicom-viewer/',
  }, latin1);

  assert.match(text, /IM1\.dcm/);
  assert.match(text, /Explicit VR Little Endian/);
  // One line per element, in the layout dcmdump uses, so that somebody who
  // already has a text dump of the header can diff the two.
  assert.match(text, /\(0010,0010\) PN Patient’s Name\s+JANE DOE/);
  assert.match(text, /\(0028,0030\) DS Pixel Spacing\s+0\.5 \\ 0\.5/);
  assert.match(text, /uploads nothing/);
});

test('the report says what it could not read', () => {
  const dataset = datasetOf(element('00080060', 'CS', 'CT'));
  const text = report({
    name: 'broken.dcm',
    size: 40,
    syntax: transferSyntax('1.2.840.10008.1.2.4.90'),
    sopClass: null,
    image: null,
    warnings: ['The file ends part-way through the element at byte 900.'],
    meta: dataset,
    dataset,
    origin: 'https://abox.tools/dicom-viewer/',
  }, latin1);

  assert.match(text, /Notes on reading this file/);
  assert.match(text, /ends part-way through/);
  assert.match(text, /JPEG 2000/);
});
