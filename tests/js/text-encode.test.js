/**
 * tools/base64/src/encode.js - the encoders.
 *
 * Base64 is checked against the vectors in RFC 4648 rather than against
 * itself, which is the same rule the CRC-32 tests follow: a codec that agrees
 * with its own decoder and with nothing else is a codec that will disagree
 * with everybody the first time it matters.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CODECS, codecById, CodecError,
  bytesToBase64, base64ToBytes, bytesToHex, hexToBytes,
  escapeHtml, unescapeHtml, escapeUnicode, unescapeUnicode,
} from '../../tools/base64/src/encode.js';

const ascii = (text) => new TextEncoder().encode(text);
const base64 = (text) => bytesToBase64(ascii(text));
const unbase64 = (text) => new TextDecoder().decode(base64ToBytes(text));

test('Base64: the test vectors from RFC 4648', () => {
  const vectors = [
    ['', ''],
    ['f', 'Zg=='],
    ['fo', 'Zm8='],
    ['foo', 'Zm9v'],
    ['foob', 'Zm9vYg=='],
    ['fooba', 'Zm9vYmE='],
    ['foobar', 'Zm9vYmFy'],
  ];
  for (const [plain, encoded] of vectors) {
    assert.equal(base64(plain), encoded, plain);
    assert.equal(unbase64(encoded), plain, encoded);
  }
});

test('Base64: text above ASCII goes through its UTF-8 bytes', () => {
  const codec = codecById('base64');
  const text = 'café — 日本語 😀';
  assert.equal(codec.decode(codec.encode(text)), text);
  assert.equal(codec.encode('é'), 'w6k=');
});

test('Base64: the URL-safe alphabet, and no padding', () => {
  const bytes = new Uint8Array([0xfb, 0xef, 0xff]);
  assert.equal(bytesToBase64(bytes), '++//');
  assert.equal(bytesToBase64(bytes, { urlSafe: true }), '--__');
  assert.equal(bytesToBase64(ascii('f'), { urlSafe: true }), 'Zg');
  // Either alphabet decodes, because a token arrives in whichever one its
  // issuer used and the reader should not have to know which.
  assert.equal(unbase64('--__'), new TextDecoder().decode(bytes));
});

test('Base64: wrapped input is still Base64', () => {
  assert.equal(unbase64('Zm9v\nYmFy\n'), 'foobar');
  assert.equal(unbase64('Zm9v YmFy'), 'foobar');
});

test('Base64: what it refuses, rather than guessing at', () => {
  assert.throws(() => base64ToBytes('Zg==='), CodecError);
  assert.throws(() => base64ToBytes('Z'), CodecError);
  assert.throws(() => base64ToBytes('Zm9v*'), CodecError);
  assert.throws(() => base64ToBytes('Zg=A'), CodecError);
});

test('Base64: bytes that are not text say so', () => {
  // 0xff is not a byte UTF-8 can start with. The decoder is deliberately
  // fatal, so this is an error rather than a string of question marks.
  assert.throws(() => codecById('base64').decode('/w=='), TypeError);
});

test('hex: both ways, and every separator a dump might use', () => {
  assert.equal(bytesToHex(ascii('hi')), '6869');
  assert.equal(bytesToHex(ascii('hi'), { spaced: true }), '68 69');
  for (const written of ['6869', '68 69', '68:69', '0x680x69', '68\n69', '\\x68\\x69']) {
    assert.deepEqual(Array.from(hexToBytes(written)), [0x68, 0x69], written);
  }
  assert.throws(() => hexToBytes('686'), CodecError);
  assert.throws(() => hexToBytes('68zz'), CodecError);
});

test('HTML: the five that matter, and nothing else', () => {
  assert.equal(escapeHtml('<a href="x">Tom & Jerry\'s</a>'),
    '&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/a&gt;');
  // An accented letter is left alone: the page said it was UTF-8.
  assert.equal(escapeHtml('café'), 'café');
});

test('HTML: decoding reads named, decimal and hex entities', () => {
  assert.equal(unescapeHtml('&lt;p&gt;&nbsp;&#65;&#x42;&mdash;&unknown;'),
    '<p> AB—&unknown;');
  assert.equal(unescapeHtml(escapeHtml('<a b="c">&')), '<a b="c">&');
});

test('backslash escapes: out and back', () => {
  assert.equal(escapeUnicode('a\tb\nc\\d'), 'a\\tb\\nc\\\\d');
  assert.equal(escapeUnicode('café'), 'caf\\u00e9');
  // Above the basic plane, one character is two escapes - which is what a
  // string literal in JavaScript or Java actually holds.
  assert.equal(escapeUnicode('😀'), '\\ud83d\\ude00');
  assert.equal(unescapeUnicode('\\ud83d\\ude00'), '😀');
  assert.equal(unescapeUnicode('\\u{1f600}'), '😀');
  assert.equal(unescapeUnicode(escapeUnicode('mixed: é\t日')), 'mixed: é\t日');
  assert.throws(() => unescapeUnicode('\\uZZZZ'), CodecError);
  assert.throws(() => unescapeUnicode('\\q'), CodecError);
});

test('percent-encoding: a value, and a whole address', () => {
  const value = codecById('url');
  const whole = codecById('url-whole');
  assert.equal(value.encode('a b&c=d/e'), 'a%20b%26c%3Dd%2Fe');
  assert.equal(whole.encode('https://x.test/a b?q=1&r=2'), 'https://x.test/a%20b?q=1&r=2');
  assert.equal(value.decode('a%20b%26c'), 'a b&c');
  assert.throws(() => value.decode('%E0%A4%A'), CodecError);
});

test('every codec round trips the same awkward string', () => {
  const sample = 'Hello, world! <tag> & "quotes" é日 \n\ttabbed';
  for (const codec of CODECS) {
    assert.equal(codec.decode(codec.encode(sample)), sample, codec.id);
  }
});

test('every codec on the menu has the parts the page reads', () => {
  for (const codec of CODECS) {
    assert.ok(codec.id && codec.name && codec.note, codec.id);
    assert.equal(typeof codec.encode, 'function');
    assert.equal(typeof codec.decode, 'function');
    // Keys off the id, not words: this file ships in fifteen languages, and the
    // page is the only place a phrase can be read.
    assert.equal(codec.name, `codec.${codec.id}.name`);
    assert.equal(codec.note, `codec.${codec.id}.note`);
  }
  assert.equal(codecById('nonsense').id, CODECS[0].id, 'an unknown id falls back to the first');
});


test('braced escapes report an out-of-range code point as a codec refusal', () => {
  for (const text of [String.raw`\u{110000}`, String.raw`\u{ffffff}`]) {
    assert.throws(() => unescapeUnicode(text), error => error instanceof CodecError && error.message === 'esc.range');
  }
  assert.equal(unescapeUnicode(String.raw`\u{10ffff}`), String.fromCodePoint(0x10ffff));
  assert.equal(unescapeUnicode(String.raw`\u{0}`), String.fromCharCode(0));
  assert.equal(unescapeUnicode(String.raw`\u{d800}`), String.fromCharCode(0xd800), 'JavaScript code-unit behavior stays available');
  assert.equal(unescapeUnicode(String.raw`\ud800`), String.fromCharCode(0xd800));
  assert.equal(unescapeUnicode(String.raw`\ud83d\ude00`), '😀');
  assert.equal(unescapeUnicode(String.raw`\u{1f600}`), '😀');
  for (const text of [String.raw`\u{}`, String.raw`\u{1234567}`, String.raw`\u{xyz}`, String.raw`\u{12`]) assert.throws(() => unescapeUnicode(text), CodecError);
});

const noncanonical = error => error instanceof CodecError && error.message === 'b64.canonical';

test('canonical standard and URL profiles accept the RFC vectors in their chosen spelling', () => {
  for (const text of ['', 'f', 'fo', 'foo', 'foob', 'fooba', 'foobar', 'café 😀']) {
    for (const id of ['base64', 'base64url']) {
      const codec = codecById(id);
      assert.equal(codec.decode(codec.encode(text), { canonical: true }), text, id + ':' + text);
    }
  }
  const bytes = new Uint8Array([0xfb, 0xef, 0xff]);
  assert.deepEqual(base64ToBytes('++//', { canonical: true }), bytes);
  assert.deepEqual(base64ToBytes('--__', { canonical: true, urlSafe: true }), bytes);
});

test('canonical decoding rejects nonzero unused bits for every one-byte value', () => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  for (let byte = 0; byte < 256; byte++) {
    const bytes = new Uint8Array([byte]), encoded = bytesToBase64(bytes);
    assert.deepEqual(base64ToBytes(encoded, { canonical: true }), bytes);
    const last = alphabet.indexOf(encoded[1]);
    for (let extra = 1; extra < 16; extra++) {
      const variant = encoded[0] + alphabet[last + extra] + '==';
      assert.deepEqual(base64ToBytes(variant), bytes, 'the compatible default still reads ' + variant);
      assert.throws(() => base64ToBytes(variant, { canonical: true }), noncanonical, variant);
    }
  }
});

test('canonical decoding rejects the unused two bits after two input bytes', () => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  for (let byte = 0; byte < 256; byte++) {
    const bytes = new Uint8Array([17, byte]), encoded = bytesToBase64(bytes), last = alphabet.indexOf(encoded[2]);
    for (let extra = 1; extra < 4; extra++) {
      const variant = encoded.slice(0, 2) + alphabet[last + extra] + '=';
      assert.deepEqual(base64ToBytes(variant), bytes);
      assert.throws(() => base64ToBytes(variant, { canonical: true }), noncanonical, variant);
    }
  }
});

test('canonical decoding distinguishes selected alphabets, padding profiles and whitespace', () => {
  for (const input of ['Zg', 'Zg==\n', ' Zg==', 'Z g==', '--__', '+-/_']) {
    assert.doesNotThrow(() => base64ToBytes(input));
    assert.throws(() => base64ToBytes(input, { canonical: true }), noncanonical, input);
  }
  for (const input of ['Zg==', 'Zg\n', '++//', '-+_/']) {
    assert.doesNotThrow(() => base64ToBytes(input));
    assert.throws(() => base64ToBytes(input, { canonical: true, urlSafe: true }), noncanonical, input);
  }
  assert.equal(codecById('base64').decode('Zh=='), 'f');
  assert.equal(codecById('base64url').decode('Zh'), 'f');
  assert.throws(() => codecById('base64').decode('Zh==', { canonical: true }), noncanonical);
  assert.throws(() => codecById('base64url').decode('Zh', { canonical: true }), noncanonical);
});

test('canonical byte validation precedes the independent UTF-8 text check', () => {
  assert.deepEqual(base64ToBytes('/w==', { canonical: true }), new Uint8Array([255]));
  assert.throws(() => codecById('base64').decode('/w==', { canonical: true }), TypeError);
  assert.throws(() => codecById('base64').decode('/x==', { canonical: true }), noncanonical);
});
