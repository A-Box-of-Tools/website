/**
 * Protecting a document, and getting it back.
 *
 * WHAT A ROUND TRIP PROVES HERE, AND WHAT IT DOES NOT
 *
 * `protect` and `standardSecurity` are two halves of one file, and a round
 * trip through them would prove nothing on its own: both halves would share
 * any misreading of the specification and agree perfectly. What makes these
 * tests worth something is that the reading half is pinned elsewhere -
 * unlock-pdf-crypt.test.js opens files written by pypdf, an implementation
 * with no connection to this one - so a writer that satisfies this reader is
 * a writer that agrees with pypdf about what the format says. The other
 * direction, pypdf opening what this writes, was checked by hand while the
 * tool was built and is described in tools/protect-pdf/README.md.
 *
 * Four things are asserted of every case, because each is a separate code
 * path in the writer and each fails silently on its own:
 *
 *   - a reader given no unlock function refuses the file outright, which is
 *     the shared reader's answer to any encrypted document and the strongest
 *     single assertion here - a file that opened would have no lock on it;
 *   - the right password opens it, and the page contents decrypt (the stream
 *     cipher, and the object streams the writer packs small objects into);
 *   - the document title decrypts (the string cipher, which is a different
 *     path through the writer and is easy to leave in the clear);
 *   - the permissions read back as the ones that went in.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { EncryptedPdfError, PdfDocument } from '../../shared/js/pdf-reader.js';
import { PdfString, Ref } from '../../shared/js/pdf-objects.js';
import { decodeStream } from '../../shared/js/pdf-filters.js';
import { writeDocument } from '../../shared/js/pdf-writer.js';
import { examplePdfFile } from '../../shared/js/example-pdf.js';
import {
  protect, standardSecurity, WrongPasswordError,
} from '../../shared/js/pdf-crypt.js';
import { permissionsIn, refusedIn } from '../../shared/js/pdf-permissions.js';
import { makeExample } from '../../tools/protect-pdf/src/example.js';
import { outName, refusedList } from '../../tools/protect-pdf/src/format.js';

const latin1 = (bytes) => Buffer.from(bytes).toString('latin1');

/** On page one of the example, and the proof that the streams decrypt. */
const MARKER = 'STATEMENT 1 / 2';

/** Printing (bit 3) and copying (bit 5) refused, everything else allowed. */
const NO_PRINT_NO_COPY = -1 & ~(4 | 16);

/**
 * The plain example, given a title.
 *
 * The example writes no /Info, and a document with no strings in it would
 * leave the string cipher - a separate path through the writer from the
 * stream cipher - entirely untested. So one is added before the document is
 * handed over, the way a reader would have parsed one: a dictionary object,
 * and a reference to it from the trailer.
 */
async function plainDocument() {
  const file = examplePdfFile('plain.pdf', { pages: 2 });
  const doc = await PdfDocument.open(new Uint8Array(await file.arrayBuffer()));
  const num = Math.max(...doc.objects.keys()) + 1;
  doc.objects.set(num, new Map([
    ['Title', new PdfString(new Uint8Array(Buffer.from('Statement', 'latin1')))],
  ]));
  doc.trailer.set('Info', new Ref(num, 0));
  return doc;
}

/** Protect the plain example with these settings; the bytes that come out. */
async function protectedBytes(settings) {
  const doc = await plainDocument();
  const id = crypto.getRandomValues(new Uint8Array(16));
  const security = await protect({ ...settings, id });
  const blob = await writeDocument(doc, { security });
  return new Uint8Array(await blob.arrayBuffer());
}

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

async function openWith(bytes, password) {
  const { unlock, report } = standardSecurity(password);
  const doc = await PdfDocument.open(bytes, { unlock });
  return { doc, report };
}

/** The title, decrypted, or null when the document has none. */
function titleOf(doc) {
  const info = doc.resolve(doc.trailer.get('Info'));
  const title = info instanceof Map ? doc.get(info, 'Title') : null;
  return title?.bytes ? latin1(title.bytes) : null;
}

/**
 * revision, user password, owner password, and what the report should say.
 */
const CASES = [
  [6, 'open-sesame', 'owner-only', { cipher: 'aes', bits: 256, opened: 'user' }],
  [6, '', 'owner-only', { cipher: 'aes', bits: 256, opened: 'blank' }],
  [4, 'open-sesame', 'owner-only', { cipher: 'aes', bits: 128, opened: 'user' }],
  [4, '', 'owner-only', { cipher: 'aes', bits: 128, opened: 'blank' }],
];

for (const [revision, userPassword, ownerPassword, expected] of CASES) {
  const label = `R${revision}, ${userPassword ? 'an open password' : 'restrictions only'}`;

  test(`${label}: a reader with no key is turned away`, async () => {
    const bytes = await protectedBytes({
      userPassword, ownerPassword, permissions: NO_PRINT_NO_COPY, revision,
    });
    await assert.rejects(PdfDocument.open(bytes), EncryptedPdfError);
  });

  test(`${label}: the right password opens it, and everything comes back`, async () => {
    const bytes = await protectedBytes({
      userPassword, ownerPassword, permissions: NO_PRINT_NO_COPY, revision,
    });
    const { doc, report } = await openWith(bytes, userPassword);

    assert.equal(report.encrypted, true);
    assert.equal(report.revision, revision);
    assert.equal(report.cipher, expected.cipher);
    assert.equal(report.bits, expected.bits);
    assert.equal(report.opened, expected.opened);
    if (revision === 6) {
      // /Perms is the document's own check on the key, and this writer
      // fills it in; a reader that finds it wrong reports it rather than
      // failing, so it has to be asserted here or it would never be seen.
      assert.equal(report.keyConfirmed, true);
    }

    assert.equal(doc.countPages(), 2);
    assert.ok((await contentsOf(doc)).includes(MARKER), 'the page streams decrypt');
    assert.equal(titleOf(doc), 'Statement', 'the title string decrypts');

    assert.deepEqual(
      refusedIn(report.restrictions).map((entry) => entry.id),
      ['perm.print', 'perm.copy'],
    );
  });

  test(`${label}: the owner password opens it too, and is reported as the owner's`, async () => {
    const bytes = await protectedBytes({
      userPassword, ownerPassword, permissions: NO_PRINT_NO_COPY, revision,
    });
    const { report } = await openWith(bytes, ownerPassword);
    // A blank user password opens first, whatever was typed - the report
    // says 'blank' because the document was never closed, and that is right.
    assert.equal(report.opened, userPassword ? 'owner' : 'blank');
  });

  test(`${label}: a wrong password is refused rather than answered with rubbish`, async () => {
    const bytes = await protectedBytes({
      userPassword: 'open-sesame', ownerPassword, permissions: NO_PRINT_NO_COPY, revision,
    });
    await assert.rejects(openWith(bytes, 'not-it'), WrongPasswordError);
  });
}

test('no restrictions is -1, and reads back as nothing refused', async () => {
  const bytes = await protectedBytes({ userPassword: 'pw', permissions: -1 });
  const { report } = await openWith(bytes, 'pw');
  assert.equal(refusedIn(report.restrictions).length, 0);
});

test('an owner password left blank is the open password, so it lifts the restrictions', async () => {
  const bytes = await protectedBytes({ userPassword: 'pw', permissions: NO_PRINT_NO_COPY });
  // Both routes accept it; the user route is tried first and wins.
  const { report } = await openWith(bytes, 'pw');
  assert.equal(report.opened, 'user');
  // And there is no third password that would: the owner entry was made
  // from 'pw', so 'other' is refused outright.
  await assert.rejects(openWith(bytes, 'other'), WrongPasswordError);
});

test('with no password at all, the restrictions still cannot be lifted by a blank one', async () => {
  // The empty string opens it - the document is only restricted - but as the
  // USER, which lifts nothing; a writer that left the owner password blank
  // too would report 'owner' here, and the restrictions would be worthless.
  const bytes = await protectedBytes({ permissions: NO_PRINT_NO_COPY });
  const { report } = await openWith(bytes, '');
  assert.equal(report.opened, 'blank');
  assert.equal(refusedIn(report.restrictions).length, 2);

  // Two such documents get two different random owner passwords, so the
  // owner entries differ - which a shared constant would not.
  const again = await protectedBytes({ permissions: NO_PRINT_NO_COPY });
  const ownerOf = async (bytes) => {
    const { doc } = await openWith(bytes, '');
    const encrypt = doc.resolve(doc.trailer.get('Encrypt'));
    return latin1(doc.get(encrypt, 'O').bytes);
  };
  assert.notEqual(await ownerOf(bytes), await ownerOf(again));
});

test('the header claims the version the scheme needs, and no lower', async () => {
  const r6 = await protectedBytes({ userPassword: 'pw', revision: 6 });
  const r4 = await protectedBytes({ userPassword: 'pw', revision: 4 });
  assert.ok(latin1(r6.subarray(0, 8)) >= '%PDF-1.7');
  assert.ok(latin1(r4.subarray(0, 8)) >= '%PDF-1.6');
});

test('the /Encrypt dictionary is a plain object the reader can find before it has a key', async () => {
  const bytes = await protectedBytes({ userPassword: 'pw' });
  const text = latin1(bytes);
  // Written as "N 0 obj\n<< /Filter /Standard ...", never inside an object
  // stream, where a reader would need the key to reach it.
  assert.match(text, /\d+ 0 obj\n<< \/Filter \/Standard \/V 5 \/R 6/);
  assert.match(text, /\/Encrypt \d+ 0 R \/ID \[<[0-9a-f]{32}> <[0-9a-f]{32}>\]/);
});

test('a null security leaves the writer exactly as it was', async () => {
  const doc = await plainDocument();
  const plain = new Uint8Array(await (await writeDocument(doc)).arrayBuffer());
  const same = new Uint8Array(await (await writeDocument(await plainDocument(), {
    security: null,
  })).arrayBuffer());
  assert.deepEqual(same, plain);
  assert.ok(!latin1(plain).includes('/Encrypt'));
  await PdfDocument.open(plain);
});

test('a document that arrived restricted can be protected again', async () => {
  // Restrictions only, then re-protected with an open password: the reader
  // decrypts on the way in, the writer encrypts on the way out, and nothing
  // is enciphered twice.
  const first = await protectedBytes({ permissions: NO_PRINT_NO_COPY, revision: 4 });
  const { doc } = await openWith(first, '');
  const id = crypto.getRandomValues(new Uint8Array(16));
  const security = await protect({ userPassword: 'new-one', permissions: -1, id });
  const second = new Uint8Array(await (await writeDocument(doc, { security })).arrayBuffer());

  await assert.rejects(PdfDocument.open(second), EncryptedPdfError);
  const { doc: again, report } = await openWith(second, 'new-one');
  assert.equal(report.revision, 6);
  assert.equal(refusedIn(report.restrictions).length, 0);
  assert.ok((await contentsOf(again)).includes(MARKER));
});

test('the example is an ordinary document with nothing on it', async () => {
  const file = makeExample();
  assert.equal(file.name, 'statement.pdf');
  const doc = await PdfDocument.open(new Uint8Array(await file.arrayBuffer()));
  assert.equal(doc.countPages(), 2);
  assert.equal(doc.trailer.has('Encrypt'), false);
});

test('the permissions the page composes are the ones the reader lists', () => {
  // main.js clears these bits for the three boxes; the reader's table has to
  // agree about which entries that refuses, or the check afterwards would
  // fail on every run.
  const bit = (n) => 1 << (n - 1);
  const noPrint = -1 & ~(bit(3) | bit(12));
  const noChange = -1 & ~(bit(4) | bit(6) | bit(9) | bit(11));
  assert.deepEqual(refusedIn(permissionsIn(noPrint, 6)).map((e) => e.id),
    ['perm.print', 'perm.printhq']);
  assert.deepEqual(refusedIn(permissionsIn(noChange, 6)).map((e) => e.id),
    ['perm.modify', 'perm.annotate', 'perm.forms', 'perm.assemble']);
});

test('format: the finished file is named for what happened, and the list reads in order', () => {
  assert.equal(outName('statement.pdf'), 'statement-protected.pdf');
  assert.equal(outName('Scan.PDF'), 'Scan-protected.pdf');
  assert.equal(outName('.pdf'), 'document-protected.pdf');

  assert.equal(refusedList([]), null);
  assert.deepEqual(refusedList(['a']), { key: 'a', values: {} });
  assert.deepEqual(refusedList(['a', 'b']), { key: 'list.two', values: { a: 'a', b: 'b' } });
  assert.deepEqual(refusedList(['a', 'b', 'c']),
    { key: 'list.three', values: { a: 'a', b: 'b', c: 'c' } });
});
