/**
 * The example, which has to be a document that really is locked.
 *
 * A page demonstrating that restrictions come off a file that never had any
 * would be demonstrating nothing, so src/example.js writes a genuinely
 * encrypted PDF. That makes the example a claim, and this is the check on it.
 *
 * Deliberately not the whole of the evidence for the cipher: this pair of
 * modules would agree with each other whatever they both believed. What pins
 * the reading side down is unlock-pdf-crypt.test.js, whose fixtures were
 * written by somebody else's implementation. What this file adds is that the
 * example is really encrypted, really restricted, and really comes apart
 * again - which is what a visitor pressing the button is being shown.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { PdfDocument } from '../../shared/js/pdf-reader.js';
import { decodeStream } from '../../shared/js/pdf-filters.js';
import { writeDocument } from '../../shared/js/pdf-writer.js';
import { makeExample } from '../../tools/unlock-pdf/src/example.js';
import { standardSecurity } from '../../shared/js/pdf-crypt.js';
import { refusedIn } from '../../shared/js/pdf-permissions.js';

const latin1 = (bytes) => Buffer.from(bytes).toString('latin1');

async function contentsOf(doc) {
  let all = '';
  for (const value of doc.objects.values()) {
    if (value?.raw instanceof Uint8Array) {
      const { bytes } = await decodeStream(value, (v) => doc.resolve(v));
      all += latin1(bytes);
    }
  }
  return all;
}

const bytesOf = async (file) => new Uint8Array(await (await file).arrayBuffer());

test('the example is encrypted, and any reader without a key is turned away', async () => {
  const bytes = await bytesOf(makeExample());

  // The same refusal the compressor, the merger and the redactor give it.
  await assert.rejects(
    () => PdfDocument.open(bytes),
    (error) => error.message === 'read.encrypted',
  );

  // And it is not merely claiming to be: the words are not in the file.
  assert.ok(!latin1(bytes).includes('INV-2026-0184'),
    'the page text is sitting in the file in the clear');
});

test('the example is the commonest case: restricted, but not closed', async () => {
  const { unlock, report } = standardSecurity('');
  const doc = await PdfDocument.open(await bytesOf(makeExample()), { unlock });

  assert.equal(report.encrypted, true);
  assert.equal(report.opened, 'blank', 'the example must need no password');
  assert.equal(report.cipher, 'aes');
  assert.equal(report.bits, 128);
  assert.equal(report.revision, 4);

  assert.deepEqual(
    refusedIn(report.restrictions).map((entry) => entry.id),
    ['perm.print', 'perm.copy'],
  );

  assert.equal(doc.countPages(), 2);
  assert.ok((await contentsOf(doc)).includes('INV-2026-0184'));
});

test('two examples are different files, because the key is fresh each time', async () => {
  const one = await bytesOf(makeExample());
  const two = await bytesOf(makeExample());

  // The /ID is random and the key is derived from it, so two runs must not be
  // byte-identical - a fixed ID would mean one key for every visitor.
  assert.notEqual(latin1(one), latin1(two));
});

test('the example comes apart again, and what comes out opens with no password', async () => {
  const { unlock } = standardSecurity('');
  const doc = await PdfDocument.open(await bytesOf(makeExample()), { unlock });
  const blob = await writeDocument(doc, { recompress: false });

  const again = await PdfDocument.open(new Uint8Array(await blob.arrayBuffer()));
  assert.equal(again.trailer.get('Encrypt'), undefined);
  assert.equal(again.countPages(), 2);
  assert.ok((await contentsOf(again)).includes('INV-2026-0184'));
});
