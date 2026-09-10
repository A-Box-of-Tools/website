/**
 * The standard security handler, against files this code did not write.
 *
 * The fixtures come from pypdf; the argument for that is in the header of
 * unlock-pdf-fixtures.js and is the whole reason these tests are worth
 * anything. What is checked here is not "does it come back out" - a round trip
 * through one implementation always does - but "does it agree with a different
 * implementation about what the specification says".
 *
 * Four things are asserted of every scheme, because each is a separate code
 * path and each fails silently on its own:
 *
 *   - the page content streams decrypt (the stream cipher, per object);
 *   - the document title decrypts (the string cipher, which is a different
 *     entry in the crypt filter table and is easy to leave enciphered);
 *   - the permissions read back as the ones that went in;
 *   - the finished, rewritten file opens with no unlock function at all -
 *     which the shared reader refuses to do for anything still encrypted, so
 *     it is the strongest single assertion here.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { PdfDocument } from '../../shared/js/pdf-reader.js';
import { decodeStream } from '../../shared/js/pdf-filters.js';
import { writeDocument } from '../../shared/js/pdf-writer.js';
import {
  standardSecurity, UnsupportedEncryptionError, WrongPasswordError,
} from '../../tools/unlock-pdf/src/crypt.js';
import { permissionsIn, refusedIn } from '../../tools/unlock-pdf/src/permissions.js';
import {
  MARKER, OWNER_PASSWORD, SECOND_PAGE, TITLE, USER_PASSWORD, fixture,
} from './unlock-pdf-fixtures.js';

const latin1 = (bytes) => Buffer.from(bytes).toString('latin1');

/** Every stream in the document, decoded, run together. */
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

async function openWith(name, password) {
  const { unlock, report } = standardSecurity(password);
  const doc = await PdfDocument.open(fixture(name), { unlock });
  return { doc, report };
}

/**
 * name, password, and what the report should say about it.
 *
 * The "blank" four have no open password and refuse printing and copying; the
 * five below them have the open password and refuse nothing.
 */
const SCHEMES = [
  ['rc4_40_blank', '', { revision: 2, cipher: 'rc4', bits: 40, opened: 'blank' }],
  ['rc4_128_blank', '', { revision: 3, cipher: 'rc4', bits: 128, opened: 'blank' }],
  ['aes_128_blank', '', { revision: 4, cipher: 'aes', bits: 128, opened: 'blank' }],
  ['aes_256_blank', '', { revision: 6, cipher: 'aes', bits: 256, opened: 'blank' }],
  ['rc4_40_user', USER_PASSWORD, { revision: 2, cipher: 'rc4', bits: 40, opened: 'user' }],
  ['rc4_128_user', USER_PASSWORD, { revision: 3, cipher: 'rc4', bits: 128, opened: 'user' }],
  ['aes_128_user', USER_PASSWORD, { revision: 4, cipher: 'aes', bits: 128, opened: 'user' }],
  ['aes_256_user', USER_PASSWORD, { revision: 6, cipher: 'aes', bits: 256, opened: 'user' }],
  ['aes_256_r5_user', USER_PASSWORD, { revision: 5, cipher: 'aes', bits: 256, opened: 'user' }],
];

for (const [name, password, expected] of SCHEMES) {
  test(`${name}: decrypts, and the report says what it was`, async () => {
    const { doc, report } = await openWith(name, password);

    assert.equal(report.encrypted, true);
    assert.equal(report.revision, expected.revision);
    assert.equal(report.cipher, expected.cipher);
    assert.equal(report.bits, expected.bits);
    assert.equal(report.opened, expected.opened);

    const body = await contentsOf(doc);
    assert.ok(body.includes(MARKER), 'page one did not decrypt');
    assert.ok(body.includes(SECOND_PAGE), 'page two did not decrypt');
    assert.equal(doc.countPages(), 2);

    // A string rather than a stream, and a different entry in the filter table.
    assert.equal(latin1(doc.get(doc.info, 'Title').bytes), TITLE);
  });

  test(`${name}: rewrites to a file that opens with no password`, async () => {
    const { doc } = await openWith(name, password);
    const blob = await writeDocument(doc, { recompress: false });

    // No unlock function: the shared reader refuses anything still encrypted,
    // so this passing is the same statement as "the protection is gone".
    const again = await PdfDocument.open(new Uint8Array(await blob.arrayBuffer()));

    assert.equal(again.trailer.get('Encrypt'), undefined);
    assert.equal(again.countPages(), 2);
    assert.ok((await contentsOf(again)).includes(MARKER));
  });
}

test('the permissions read back as the ones the file was written with', async () => {
  for (const name of ['rc4_40_blank', 'rc4_128_blank', 'aes_128_blank', 'aes_256_blank']) {
    const { report } = await openWith(name, '');
    const refused = refusedIn(report.restrictions).map((entry) => entry.id);
    assert.deepEqual(refused, ['perm.print', 'perm.copy'], name);
  }

  // And the five with an open password were written with every bit set.
  for (const name of ['rc4_128_user', 'aes_128_user', 'aes_256_user']) {
    const { report } = await openWith(name, USER_PASSWORD);
    assert.deepEqual(refusedIn(report.restrictions), [], name);
  }
});

test('the owner password opens a document whose user password is something else', async () => {
  for (const name of ['rc4_128_user', 'aes_128_user', 'aes_256_user']) {
    const { doc, report } = await openWith(name, OWNER_PASSWORD);
    assert.equal(report.opened, 'owner', name);
    assert.ok((await contentsOf(doc)).includes(MARKER), name);
  }
});

test('a wrong password is refused rather than answered with rubbish', async () => {
  for (const name of ['rc4_40_user', 'rc4_128_user', 'aes_128_user', 'aes_256_user']) {
    await assert.rejects(
      () => openWith(name, 'not the password'),
      WrongPasswordError,
      name,
    );
    // Including the empty one, which is the case that would otherwise look
    // like an unprotected document.
    await assert.rejects(() => openWith(name, ''), WrongPasswordError, name);
  }
});

test('every one of them is still refused by a reader given no unlock', async () => {
  for (const [name] of SCHEMES) {
    await assert.rejects(
      () => PdfDocument.open(fixture(name)),
      (error) => error.message === 'read.encrypted',
      name,
    );
  }
});

test('a document with no encryption is left entirely alone', async () => {
  const { doc, report } = await openWith('plain', '');

  assert.equal(report.encrypted, false);
  assert.equal(report.opened, '');
  assert.deepEqual(report.restrictions, []);
  assert.ok((await contentsOf(doc)).includes(MARKER));
  assert.equal(latin1(doc.get(doc.info, 'Title').bytes), TITLE);
});

test('a handler that is not a password is named rather than guessed at', async () => {
  // The public-key handlers encrypt to a certificate. Nothing typed into a box
  // opens one, and failing vaguely would send somebody looking for a password
  // that never existed.
  const bytes = fixture('aes_128_blank');
  const doctored = latin1(bytes).replace('/Filter /Standard', '/Filter /Adobe.PubSec');
  const patched = Uint8Array.from(doctored, (c) => c.charCodeAt(0) & 0xff);

  const { unlock } = standardSecurity('');
  await assert.rejects(
    () => PdfDocument.open(patched, { unlock }),
    (error) => error instanceof UnsupportedEncryptionError
      && error.message === 'crypt.handler'
      && error.values.name === 'Adobe.PubSec',
  );
});

test('an /Encrypt that points at nothing is a broken locked file, not an open one', async () => {
  // The strings and streams in it are still ciphertext, so treating it as
  // unencrypted would hand back a document full of noise. Both halves are
  // asserted: the shared reader still refuses it outright with no unlock, and
  // this tool says what is actually wrong with it.
  const bytes = fixture('aes_128_blank');
  const doctored = latin1(bytes).replace(/\/Encrypt \d+ 0 R/, '/Encrypt 998 0 R');
  const patched = Uint8Array.from(doctored, (c) => c.charCodeAt(0) & 0xff);

  await assert.rejects(() => PdfDocument.open(patched),
    (error) => error.message === 'read.encrypted');

  const { unlock } = standardSecurity('');
  await assert.rejects(
    () => PdfDocument.open(patched, { unlock }),
    (error) => error instanceof UnsupportedEncryptionError
      && error.message === 'crypt.malformed',
  );
});

/* ------------------------------------------------------------- permissions */

test('permissionsIn: a set bit means allowed, and -1 restricts nothing', () => {
  assert.deepEqual(refusedIn(permissionsIn(-1, 4)), []);
});

test('permissionsIn: the bits are numbered from one, not from zero', () => {
  // Bit 3 is printing and is worth 4. Clearing it and nothing else must refuse
  // printing and nothing else - the off-by-one here refuses "modify" instead.
  const refused = refusedIn(permissionsIn(-1 & ~4, 4)).map((entry) => entry.id);
  assert.deepEqual(refused, ['perm.print']);

  const copying = refusedIn(permissionsIn(-1 & ~16, 4)).map((entry) => entry.id);
  assert.deepEqual(copying, ['perm.copy']);
});

test('permissionsIn: revision 2 has four bits, and the rest arrived later', () => {
  // A revision 2 document that happens to have bit 11 clear is not saying
  // anything about assembling pages: that bit was not defined until revision 3.
  assert.deepEqual(permissionsIn(0, 2).map((entry) => entry.id),
    ['perm.print', 'perm.modify', 'perm.copy', 'perm.annotate']);
  assert.equal(permissionsIn(0, 3).length, 8);
});
