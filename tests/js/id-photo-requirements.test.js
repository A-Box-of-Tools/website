/**
 * tools/id-photo/src/requirements.js - the rule, read out of its own words.
 *
 * The risk here is a box filled confidently and wrongly: a head width in the
 * head height box, a floor read as a ceiling, a paper size read as the photo's.
 * Every one of those makes a photograph that passes every check on the page -
 * because the page checks against the boxes - and is refused by the form.
 *
 * So each test is a rule written the way rules are written, in English and in
 * both Chinese scripts, and asserts what went in which box and what was quoted
 * for it. The texts are written for these tests in the manner of the published
 * ones, not copied from any of them.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { normalise, readRequirements } from '../../tools/id-photo/src/requirements.js';

/** What was filled in, and the words each was read from. */
function filled(text) {
  const reading = readRequirements(text);
  return Object.fromEntries(reading.found.map((f) => [f.field, [f.value, text.slice(f.from, f.to)]]));
}

const quoted = (text, spans) => spans.map((s) => text.slice(s.from, s.to));

test('a square rule stated in inches and again in millimetres is one size, in millimetres', () => {
  const text = 'Photo size: 2 x 2 inches (51 x 51 mm). The head must be between 1 inch and '
    + '1 3/8 inches (25 mm - 35 mm) from the bottom of the chin to the top of the head. '
    + 'Plain white or off-white background. File size less than or equal to 240 KB.';
  const reading = readRequirements(text);
  assert.deepEqual(filled(text), {
    widthMm: [51, '51 x 51 mm'],
    heightMm: [51, '51 x 51 mm'],
    headMinMm: [25, '25 mm - 35 mm'],
    headMaxMm: [35, '25 mm - 35 mm'],
    maxKb: [240, '240 KB'],
    background: ['off-white', 'off-white'],
  });
  // The inches restate what was filled in, so nothing is left over to report.
  assert.deepEqual(reading.unused, []);
  assert.deepEqual(reading.notes, []);
});

test('a size written height first, with the words after the numbers', () => {
  const text = 'The photo must be 45mm high x 35mm wide. Head height between 29mm and 34mm. '
    + 'Plain cream or light grey background.';
  assert.deepEqual(filled(text), {
    widthMm: [35, '35mm'],
    heightMm: [45, '45mm'],
    headMinMm: [29, 'between 29mm and 34mm'],
    headMaxMm: [34, 'between 29mm and 34mm'],
    background: ['cream', 'cream'],
  });
});

test('a label before its number is not read as belonging to the number before it', () => {
  assert.deepEqual(filled('Width: 35 mm Height: 45 mm'), {
    widthMm: [35, '35 mm'],
    heightMm: [45, '45 mm'],
  });
});

test('a simplified Chinese rule: the head width is read and not used', () => {
  const text = '照片规格：宽33mm，高48mm；头部宽度15-22mm，头部长度28-33mm；白色背景；'
    + '电子照片358×441像素，分辨率300dpi，文件大小20KB至200KB。';
  const reading = readRequirements(text);
  assert.deepEqual(filled(text), {
    widthMm: [33, '33mm'],
    heightMm: [48, '48mm'],
    pxWidth: [358, '358×441像素'],
    pxHeight: [441, '358×441像素'],
    headMinMm: [28, '28-33mm'],
    headMaxMm: [33, '28-33mm'],
    dpi: [300, '300dpi'],
    minKb: [20, '20KB至200KB'],
    maxKb: [200, '20KB至200KB'],
    background: ['white', '白色'],
  });
  assert.deepEqual(reading.unused.map((u) => [u.key, text.slice(u.from, u.to)]),
    [['read.unused.headwidth', '15-22mm']]);
});

test('a traditional Chinese rule in centimetres, with a floor and a ceiling said separately', () => {
  const text = '照片尺寸：3.5公分×4.5公分，頭部長度3.2至3.6公分，白色背景，檔案大小不小於20KB，不大於200KB。';
  assert.deepEqual(filled(text), {
    widthMm: [35, '3.5公分×4.5公分'],
    heightMm: [45, '3.5公分×4.5公分'],
    headMinMm: [32, '3.2至3.6公分'],
    headMaxMm: [36, '3.2至3.6公分'],
    minKb: [20, '20KB'],
    maxKb: [200, '200KB'],
    background: ['white', '白色'],
  });
});

test('"不大于" is a ceiling, not the "大于" inside it', () => {
  assert.deepEqual(filled('照片大小不大于200KB'), { maxKb: [200, '200KB'] });
  assert.deepEqual(filled('照片大小不小于20KB'), { minKb: [20, '20KB'] });
  assert.deepEqual(filled('no less than 20 KB'), { minKb: [20, '20 KB'] });
  assert.deepEqual(filled('not more than 200 KB'), { maxKb: [200, '200 KB'] });
});

test('以上 and 以下 bound the number before them', () => {
  assert.deepEqual(filled('文件大小20KB以上，200KB以下'), {
    minKb: [20, '20KB'],
    maxKb: [200, '200KB'],
  });
});

test('a bare file size is a ceiling', () => {
  assert.deepEqual(filled('File size: 500 KB'), { maxKb: [500, '500 KB'] });
  assert.deepEqual(filled('Max 1 MB'), { maxKb: [1024, '1 MB'] });
});

test('"2M" is a file size in a sentence about the file, and a distance otherwise', () => {
  assert.deepEqual(filled('大小不超过2M'), { maxKb: [2048, '2M'] });
  assert.deepEqual(filled('Stand 1.5m from the wall.'), {});
});

test('two different photo sizes are not chosen between', () => {
  const text = 'Passport photo 35 x 45 mm; visa photo 50 x 50 mm.';
  const reading = readRequirements(text);
  assert.deepEqual(reading.found, []);
  assert.equal(reading.notes.length, 1);
  assert.equal(reading.notes[0].key, 'read.sizes');
  assert.deepEqual(quoted(text, reading.notes[0].spans), ['35 x 45 mm', '50 x 50 mm']);
});

test('a size given by name is reported, not converted', () => {
  const text = '上传照片要求：蓝底，二寸，大小不超过2M，jpg格式。';
  const reading = readRequirements(text);
  assert.deepEqual(filled(text), { maxKb: [2048, '2M'] });
  assert.deepEqual(reading.notes.map((n) => [n.key, quoted(text, n.spans)]), [
    ['read.named', ['二寸']],
    ['read.colour', ['蓝底']],
  ]);
});

test('a colour the page can check wins over one it cannot, and one it cannot is not swapped', () => {
  assert.deepEqual(filled('Background: white or light blue.').background, ['white', 'white']);
  const text = 'Background must be plain blue.';
  const reading = readRequirements(text);
  assert.equal(reading.values.background, undefined);
  assert.deepEqual(reading.notes.map((n) => [n.key, quoted(text, n.spans)]), [['read.colour', ['blue']]]);
});

test('a range of upload sizes fills in the smallest and says so', () => {
  const text = 'Digital: 600 x 600 pixels minimum, 1200 x 1200 pixels maximum.';
  const reading = readRequirements(text);
  assert.deepEqual(filled(text), {
    pxWidth: [600, '600 x 600 pixels'],
    pxHeight: [600, '600 x 600 pixels'],
  });
  assert.deepEqual(reading.notes.map((n) => n.key), ['read.pxrange']);
});

test('a paper size is not the photo size', () => {
  const text = 'Print on 4x6 inch photo paper. The photo is 35 x 45 mm.';
  const reading = readRequirements(text);
  assert.deepEqual(filled(text), { widthMm: [35, '35 x 45 mm'], heightMm: [45, '35 x 45 mm'] });
  assert.deepEqual(reading.unused.map((u) => [u.key, text.slice(u.from, u.to)]),
    [['read.unused.paper', '4x6 inch']]);
});

test('an eye position is read and not used', () => {
  const text = 'Eyes must be between 28 and 35 mm from the bottom of the photo.';
  const reading = readRequirements(text);
  assert.deepEqual(reading.found, []);
  assert.deepEqual(reading.unused.map((u) => u.key), ['read.unused.eye']);
});

test('text with nothing in it reads as nothing', () => {
  const reading = readRequirements('Please bring two recent photographs to the appointment.');
  assert.deepEqual(reading, { values: {}, found: [], notes: [], unused: [] });
});

test('normalising keeps every offset where it was', () => {
  const text = '照片３５ｍｍ×４５ｍｍ，头部３２–３６ｍｍ 😀 2” x 2”';
  const out = normalise(text);
  assert.equal(out.length, text.length);
  assert.ok(out.includes('35mmx45mm'));
  assert.ok(out.includes('32-36mm'));
  assert.ok(out.includes('2" x 2"'));
  // A full-width rule is read, and quoted back in the characters it was pasted in.
  assert.deepEqual(filled('照片３５ｍｍ×４５ｍｍ'), {
    widthMm: [35, '３５ｍｍ×４５ｍｍ'],
    heightMm: [45, '３５ｍｍ×４５ｍｍ'],
  });
});
