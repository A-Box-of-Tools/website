/** Conversion must not cause two source photos to replace each other on disk. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { outName, cleanNames } from '../../tools/exif-editor/src/names.js';

test('EXIF outputs retain the original stem and choose their actual format', () => {
  assert.equal(outName({ name: 'photo.avif', kind: 'avif' }, 'clean'), 'photo-clean.png');
  assert.equal(outName({ name: 'photo.PNG', kind: 'png' }, 'edited'), 'photo-edited.png');
  assert.equal(outName({ name: 'two.dots.jpg', kind: 'jpeg' }, 'clean'), 'two.dots-clean.jpg');
  assert.equal(outName({ name: 'photo', kind: 'webp' }, 'clean'), 'photo-clean.webp');
  assert.equal(outName({ name: '.avif', kind: 'avif' }, 'clean'), 'photo-clean.png');
});

test('ordered AVIF and PNG outputs receive distinct names without changing sources', () => {
  const originals = [
    { name: 'photo.avif', kind: 'avif' }, { name: 'photo.png', kind: 'png' },
    { name: 'photo.avif', kind: 'avif' }, { name: 'photo.jpg', kind: 'jpeg' },
  ];
  const before = structuredClone(originals);
  assert.deepEqual(cleanNames(originals), ['photo-clean.png', 'photo-clean-2.png', 'photo-clean-3.png', 'photo-clean.jpg']);
  assert.deepEqual(originals, before);
  assert.deepEqual(cleanNames([]), []);
});

test('case and Unicode-equivalent source names cannot overwrite another output', () => {
  assert.deepEqual(cleanNames([
    { name: 'Photo.avif', kind: 'avif' }, { name: 'photo.png', kind: 'png' },
    { name: 'PHOTO.png', kind: 'png' }, { name: 'café.avif', kind: 'avif' },
    { name: 'cafe\u0301.png', kind: 'png' },
  ]), ['Photo-clean.png', 'photo-clean-2.png', 'PHOTO-clean-3.png', 'café-clean.png', 'cafe\u0301-clean-2.png']);
});
