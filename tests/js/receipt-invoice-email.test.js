/**
 * A draft only fulfils the attachment promise if another MIME reader can
 * recover the report and every picture byte. Header injection and Unicode
 * filenames exercise the inputs that are unsafe to interpolate into email.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { buildEmailDraft } from '../../tools/receipt-invoice-extractor/src/email.js';

function readEntity(entity) {
  const separator = entity.indexOf('\r\n\r\n');
  assert.ok(separator >= 0);
  const headerText = entity.slice(0, separator);
  const headers = Object.fromEntries(headerText.replace(/\r\n[ \t]+/g, ' ').split('\r\n').map(line => {
    const colon = line.indexOf(':');
    assert.ok(colon > 0, line);
    return [line.slice(0, colon).toLowerCase(), line.slice(colon + 1).trim()];
  }));
  return { headers, headerText, payload: entity.slice(separator + 4) };
}

async function readDraft(file) {
  const source = await file.text();
  assert.equal(/(?<!\r)\n|\r(?!\n)/.test(source), false, 'MIME line endings must be CRLF');
  assert.ok(Array.from(source).every(character => character.codePointAt(0) < 128), 'email transport stays ASCII');
  const outer = readEntity(source);
  const boundary = /boundary="([^"]+)"/.exec(outer.headers['content-type'])?.[1];
  assert.ok(boundary);
  const blocks = outer.payload.split(`--${boundary}`);
  assert.equal(blocks.shift(), '');
  assert.equal(blocks.pop(), '--\r\n');
  const parts = blocks.map(block => {
    assert.ok(block.startsWith('\r\n') && block.endsWith('\r\n'));
    const part = readEntity(block.slice(2, -2));
    assert.equal(part.headers['content-transfer-encoding'], 'base64');
    for (const line of part.payload.split('\r\n')) {
      assert.ok(line.length <= 76, 'base64 lines fit the MIME limit');
      assert.match(line, /^[A-Za-z0-9+/=]*$/);
    }
    return { ...part, bytes: Buffer.from(part.payload, 'base64') };
  });
  return { source, headers: outer.headers, headerText: outer.headerText, parts };
}

function decodedSubject(value) {
  const words = [...value.matchAll(/=\?UTF-8\?B\?([^?]+)\?=/g)];
  return words.map(word => Buffer.from(word[1], 'base64').toString('utf8')).join('');
}

function decodedFilename(value) {
  const segments = [...value.matchAll(/filename\*(\d+)\*=([^; ]+)/g)];
  assert.ok(segments.length);
  assert.deepEqual(segments.map(segment => Number(segment[1])), segments.map((_, index) => index));
  const encoded = segments.map(segment => segment[2]).join('');
  assert.ok(encoded.startsWith("UTF-8''"));
  return decodeURIComponent(encoded.slice(7));
}

test('a local email draft contains the complete report and actual image attachments in order', async () => {
  const first = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 4, 0x41, 0x42, 0xff, 0xd9]);
  const second = new Uint8Array([0xff, 0xd8, 0xff, 0xda, 0, 2, 0, 0xff, 0xd9]);
  const body = 'Document 1: CAD 24.30\nDocument 2: CAD 45.20\rCount: 2\r\nTotal CAD 69.50';
  const file = await buildEmailDraft({
    to: 'owner+receipts@example.com', subject: 'October receipts — 2 documents', body,
    attachments: [new File([first], '01-receipt.jpg', { type: 'image/jpeg' }),
      { filename: '02-invoice.jpg', type: 'image/jpeg', bytes: second.buffer }],
  });
  assert.equal(file.name, 'receipt-invoice-email.eml');
  assert.equal(file.type, 'message/rfc822');
  const draft = await readDraft(file);
  assert.equal(draft.headers['x-unsent'], '1');
  assert.equal(draft.headers.to, 'owner+receipts@example.com');
  assert.equal(draft.headers['mime-version'], '1.0');
  assert.match(draft.headers['content-type'], /^multipart\/mixed;/);
  assert.equal(decodedSubject(draft.headers.subject), 'October receipts — 2 documents');
  assert.equal(draft.parts.length, 3);
  assert.equal(draft.parts[0].headers['content-type'], 'text/plain; charset=UTF-8');
  assert.equal(draft.parts[0].bytes.toString('utf8'), body.replace(/\r\n|\r|\n/g, '\r\n'));
  for (const [index, expected] of [first, second].entries()) {
    assert.equal(draft.parts[index + 1].headers['content-type'], 'image/jpeg');
    assert.deepEqual(draft.parts[index + 1].bytes, Buffer.from(expected));
    assert.equal(decodedFilename(draft.parts[index + 1].headers['content-disposition']), index ? '02-invoice.jpg' : '01-receipt.jpg');
  }
});

test('binary attachment bytes survive base64 block boundaries, padding and offset views', async () => {
  const storage = Uint8Array.from({ length: 60011 }, (_, index) => index % 256);
  const bytes = storage.subarray(7, 60009);
  const draft = await readDraft(await buildEmailDraft({ attachments: [{ filename: 'photo.jpg', type: 'image/jpeg', bytes }] }));
  assert.deepEqual(draft.parts[1].bytes, Buffer.from(bytes));
  assert.ok(draft.parts[1].payload.includes('\r\n'));
});

test('long Unicode subjects fold at complete characters and filenames use MIME continuations', async () => {
  const subject = 'Receipts 🧾 商店 café € '.repeat(35);
  const filename = `${'領収書-café-🧾-'.repeat(30)}.jpg`;
  const draft = await readDraft(await buildEmailDraft({ subject, attachments: [{ filename, type: 'image/jpeg', bytes: new Uint8Array([0, 255]) }] }));
  assert.equal(decodedSubject(draft.headers.subject), subject);
  assert.ok(!decodedSubject(draft.headers.subject).includes('\uFFFD'));
  for (const word of draft.headers.subject.match(/=\?UTF-8\?B\?[^?]+\?=/g)) assert.ok(word.length <= 75);
  for (const line of draft.headerText.split('\r\n')) assert.ok(line.length <= 76, line);
  const attachment = draft.parts[1];
  assert.equal(decodedFilename(attachment.headers['content-disposition']), filename);
  assert.ok(attachment.headers['content-disposition'].includes('filename*1*='));
  for (const line of attachment.headerText.split('\r\n')) assert.ok(line.length <= 76, line);
});

test('hostile report contents cannot create recipients, MIME headers or extra attachments', async () => {
  const body = 'merchant\r\nBcc: victim@example.com\r\n\r\n--=_abox_foo\r\nContent-Type: text/html\n<script>alert(1)</script>\0 🧾';
  const bytes = new TextEncoder().encode('base64-looking +/=\r\n--=_abox_foo\r\nBcc: attacker@example.com');
  const draft = await readDraft(await buildEmailDraft({ to: 'owner@example.com', body, attachments: [{ filename: 'document.jpg', type: 'image/jpeg', bytes }] }));
  assert.equal(draft.headers.bcc, undefined);
  assert.equal(draft.parts.length, 2);
  assert.equal(draft.parts[0].bytes.toString('utf8'), body.replace(/\r\n|\r|\n/g, '\r\n'));
  assert.deepEqual(draft.parts[1].bytes, Buffer.from(bytes));
  assert.equal(draft.source.includes('Bcc:'), false);
  assert.equal(draft.source.includes('<script>'), false);
});

test('filenames cannot carry paths, control characters, quotes or injected header fields', async () => {
  const filename = '../private/receipt";\r\nBcc: victim@example.com.jpg';
  const draft = await readDraft(await buildEmailDraft({ filename: '../../draft', attachments: [{ filename, type: 'image/jpeg', bytes: new Uint8Array([1]) }] }));
  assert.equal(decodedFilename(draft.parts[1].headers['content-disposition']), 'receipt";Bcc: victim@example.com.jpg');
  assert.equal(draft.parts[1].headers.bcc, undefined);
  assert.equal(draft.parts[1].headerText.includes('Bcc:'), false);
  const file = await buildEmailDraft({ filename: '../../draft' });
  assert.equal(file.name, 'draft.eml');
});

test('recipient and subject controls and unsupported mailbox forms are refused before export', async () => {
  for (const to of ['owner@example.com\r\nBcc: attacker@example.com', '\nowner@example.com', 'owner@example.com\n',
    'owner@example.com\0', 'owner@example.com\u0085', 'a@example.com,b@example.com', 'Name <owner@example.com>',
    'owner@example..com', 'owner..name@example.com', '.owner@example.com', 'owner.@example.com', 'owner@-example.com',
    `owner@${'x'.repeat(64)}.com`, `${'x'.repeat(65)}@example.com`, 'not an address']) {
    await assert.rejects(buildEmailDraft({ to }), /email\.invalid/, to);
  }
  for (const subject of ['Receipts\r\nBcc: other@example.com', 'Receipts\t', 'Receipts\0', 'Receipts\u0085']) {
    await assert.rejects(buildEmailDraft({ subject }), /email\.invalid/);
  }
  const draft = await readDraft(await buildEmailDraft({ to: ' owner@example.com ' }));
  assert.equal(draft.headers.to, 'owner@example.com');
});

test('an empty recipient stays editable and empty reports remain valid text parts', async () => {
  const draft = await readDraft(await buildEmailDraft());
  assert.equal(draft.headers.to, undefined);
  assert.equal(draft.headers.subject, '');
  assert.equal(draft.parts.length, 1);
  assert.equal(draft.parts[0].bytes.length, 0);
});

test('invalid attachment headers and unreadable files produce phrase keys', async () => {
  for (const type of ['image/jpeg\r\nBcc: owner@example.com', 'image/jpeg\n', 'image/jpeg; charset=UTF-8', 'text/html\0', 'not a type']) {
    await assert.rejects(buildEmailDraft({ attachments: [{ filename: 'photo.jpg', type, bytes: new Uint8Array([1]) }] }), /email\.invalid/);
  }
  for (const attachments of [null, {}, [null], [{ filename: 'photo.jpg', type: 'image/jpeg', bytes: 'not bytes' }]]) {
    await assert.rejects(buildEmailDraft({ attachments }), /email\.invalid/);
  }
  class UnreadableFile extends File {
    async arrayBuffer() { throw new Error('failed read'); }
  }
  await assert.rejects(buildEmailDraft({ attachments: [new UnreadableFile([], 'photo.jpg', { type: 'image/jpeg' })] }), /email\.failed/);
});
