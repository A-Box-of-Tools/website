/** Admission precedes decoding; registry guesses must not hide valid AVIF files. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { acceptsImageFile } from '../../shared/js/image-input.js';

const photos = ['jpg', 'jpeg', 'png', 'webp', 'avif'];
const narrow = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

test('native image MIME types enter the generic decoder without a known extension', () => {
  assert.equal(acceptsImageFile({ name: 'photo', type: 'image/avif' }, photos), true);
  assert.equal(acceptsImageFile({ name: 'photo', type: 'IMAGE/AVIF' }, photos), true);
  assert.equal(acceptsImageFile({ name: 'scan', type: 'image/tiff' }, photos), true);
  assert.equal(acceptsImageFile({ name: 'report.txt', type: 'text/plain' }, photos), false);
});

test('a recognized AVIF extension survives absent, generic and incorrect registry MIME types', () => {
  for (const type of ['', 'application/octet-stream', 'application/x-unknown']) {
    assert.equal(acceptsImageFile({ name: 'invoice.AVIF', type }, photos), true, type);
    assert.equal(acceptsImageFile({ name: 'invoice.avif', type }, photos, narrow), true, type);
  }
  assert.equal(acceptsImageFile({ name: 'invoice.avif.txt', type: 'application/octet-stream' }, photos), false);
  assert.equal(acceptsImageFile({ name: 'avif', type: '' }, photos), false);
});

test('narrow tools admit their explicit types and extensions while refusing unsupported uploads', () => {
  assert.equal(acceptsImageFile({ name: 'receipt', type: 'image/avif' }, photos, narrow), true);
  assert.equal(acceptsImageFile({ name: 'receipt.gif', type: 'image/gif' }, photos, narrow), false);
  assert.equal(acceptsImageFile({ name: 'receipt.pdf', type: 'application/pdf' }, photos, narrow), false);
  assert.equal(acceptsImageFile({ name: 'receipt.heic', type: '' }, photos, narrow), false);
  assert.equal(acceptsImageFile({ name: 'receipt.AVIF', type: '' }, ['.avif'], narrow), true);
  assert.equal(acceptsImageFile(null, photos, narrow), false);
});
