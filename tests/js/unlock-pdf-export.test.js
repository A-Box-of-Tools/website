/** Repeated unlock exports must not inherit mutations from an earlier run. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { PdfDocument } from '../../shared/js/pdf-reader.js';
import { standardSecurity } from '../../shared/js/pdf-crypt.js';
import { stripMetadata, writeDocument } from '../../shared/js/pdf-writer.js';
import { decodeStream } from '../../shared/js/pdf-filters.js';
import { documentForExport } from '../../tools/unlock-pdf/src/document-for-export.js';
import { fixture, USER_PASSWORD, TITLE, MARKER } from './unlock-pdf-fixtures.js';

for (const name of ['rc4_40_user', 'rc4_128_user', 'aes_128_user', 'aes_256_r5_user', 'aes_256_user']) {
  test(`a fresh ${name} export keeps metadata after an earlier stripped document`, async () => {
    const bytes = fixture(name);
    const { unlock } = standardSecurity(USER_PASSWORD);
    const original = await PdfDocument.open(bytes, { unlock });
    const input = { bytes, doc: original };
    const first = await documentForExport(input);
    stripMetadata(first);
    assert.equal(first.info, null);

    const next = await documentForExport(input);
    assert.equal(Buffer.from(next.get(next.info, 'Title').bytes).toString('latin1'), TITLE);
    assert.equal(Buffer.from(original.get(original.info, 'Title').bytes).toString('latin1'), TITLE);
    assert.equal(next.countPages(), 2);
    let text = '';
    for (const value of next.objects.values()) {
      if (value?.raw instanceof Uint8Array) {
        const decoded = await decodeStream(value, (item) => next.resolve(item));
        text += Buffer.from(decoded.bytes).toString('latin1');
      }
    }
    assert.ok(text.includes(MARKER));
    const output = await writeDocument(next);
    const reopened = await PdfDocument.open(new Uint8Array(await output.arrayBuffer()));
    assert.equal(reopened.countPages(), 2);
    assert.equal(Buffer.from(reopened.get(reopened.info, 'Title').bytes).toString('latin1'), TITLE);
    assert.equal(reopened.trailer.has('Encrypt'), false);
  });
}
