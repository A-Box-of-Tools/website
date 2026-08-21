/**
 * tools/image-to-data-uri/src/encode.js - the two encodings.
 *
 * This is the one place in the repository where a mistake would be invisible
 * rather than loud. A data URI that is subtly wrong does not throw; it produces
 * a broken image in somebody else's page, weeks later, with no error message
 * anywhere useful. So the tests here are round trips: encode, decode with the
 * platform's own decoder, and check the bytes that come back are the bytes that
 * went in.
 *
 * The SVG half has a second job. Its escaping set is deliberately minimal - the
 * whole reason to percent-encode rather than base64 is that most characters are
 * left alone - so the tests pin both halves of that: the five characters that
 * must go, and the space that must stay, since dropping either rule silently
 * costs a fifth of the output size or breaks every SVG in an unquoted url().
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  base64, fromBase64, encodeSvg, svgDataUri, base64DataUri,
} from '../../tools/image-to-data-uri/src/encode.js';

const ascii = (text) => new Uint8Array([...text].map((ch) => ch.charCodeAt(0)));

/* ------------------------------------------------------------------ base64 */

test('base64 agrees with the platform encoder', () => {
  const bytes = ascii('Man is distinguished, not only by his reason');
  assert.equal(base64(bytes), Buffer.from(bytes).toString('base64'));
});

test('base64 pads the two awkward lengths', () => {
  // One and two bytes over a multiple of three are where a hand-written
  // encoder gets the padding wrong, and where the classic example comes from.
  assert.equal(base64(ascii('any carnal pleasure.')), 'YW55IGNhcm5hbCBwbGVhc3VyZS4=');
  assert.equal(base64(ascii('any carnal pleasure')), 'YW55IGNhcm5hbCBwbGVhc3VyZQ==');
  assert.equal(base64(ascii('any carnal pleasur')), 'YW55IGNhcm5hbCBwbGVhc3Vy');
});

test('base64 of nothing is nothing', () => {
  assert.equal(base64(new Uint8Array(0)), '');
});

test('base64 survives every byte value', () => {
  const all = new Uint8Array(256);
  for (let i = 0; i < 256; i += 1) all[i] = i;
  assert.deepEqual(fromBase64(base64(all)), all);
});

test('base64 chunks past the argument limit', () => {
  // The bug this catches: String.fromCharCode(...bytes) passes one argument
  // per byte and overflows the call stack somewhere around a hundred thousand
  // of them. A photograph is several million, so the chunk boundary at 32 KB
  // has to be crossed several times here to mean anything.
  const big = new Uint8Array(200_000);
  for (let i = 0; i < big.length; i += 1) big[i] = (i * 31) & 0xff;

  const encoded = base64(big);
  assert.equal(encoded, Buffer.from(big).toString('base64'));
  assert.deepEqual(fromBase64(encoded), big);
});

test('base64DataUri writes the type it was given', () => {
  const uri = base64DataUri(ascii('hello'), 'image/png');
  assert.equal(uri, 'data:image/png;base64,aGVsbG8=');
});

/* --------------------------------------------------------------------- SVG */

const ROUND_TRIP = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">'
  + '<path d="M4 4 L20 20" stroke="#333"/><text>café \u{1f600}</text></svg>';

test('the SVG encoding is reversible', () => {
  assert.equal(decodeURIComponent(encodeSvg(ROUND_TRIP)), ROUND_TRIP);
});

test('the five characters that have to go, go', () => {
  assert.equal(encodeSvg('%'), '%25');
  assert.equal(encodeSvg('#'), '%23');
  assert.equal(encodeSvg('<'), '%3C');
  assert.equal(encodeSvg('>'), '%3E');
  assert.equal(encodeSvg('"'), '%22');
});

test('spaces stay, because the output is always quoted', () => {
  // Escaping these would cost three characters for every space in a path
  // definition, which is most of what an SVG is made of. They are legal
  // inside a quoted URL; shapes.js is what guarantees the quotes.
  assert.equal(encodeSvg('a b  c'), 'a b  c');
});

test('an apostrophe stays, so single-quoted attributes cost nothing', () => {
  assert.equal(encodeSvg("<svg xmlns='x'/>"), "%3Csvg xmlns='x'/%3E");
});

test('line breaks are escaped rather than removed', () => {
  // Removing them would be smaller and would change what an SVG renders:
  // whitespace inside a <text> element is content.
  assert.equal(encodeSvg('<a/>\n<b/>'), '%3Ca/%3E%0A%3Cb/%3E');
  assert.equal(encodeSvg('\t'), '%09');
  assert.equal(encodeSvg('\r'), '%0D');
});

test('non-ASCII becomes its UTF-8 bytes', () => {
  assert.equal(encodeSvg('café'), 'caf%C3%A9');
});

test('an astral character is encoded whole', () => {
  // Iterating by code unit rather than code point encodes half a surrogate
  // pair, and the URI then decodes to a replacement character.
  const emoji = '\u{1f600}';
  assert.equal(encodeSvg(emoji), encodeURIComponent(emoji));
  assert.equal(decodeURIComponent(encodeSvg(emoji)), emoji);
});

test('a byte-order mark is dropped', () => {
  assert.equal(encodeSvg('﻿<svg/>'), '%3Csvg/%3E');
});

test('ordinary markup characters are left alone', () => {
  // The point of percent-encoding an SVG is that it stays readable in the
  // stylesheet. If this starts failing, that benefit has quietly gone.
  assert.equal(encodeSvg("viewBox='0 0 24 24' fill=none"), "viewBox='0 0 24 24' fill=none");
});

test('svgDataUri does not declare a charset', () => {
  // Legal, and pure cost: every non-ASCII character is already percent-encoded
  // as UTF-8 above, which is what a data URI is read as when nothing says
  // otherwise.
  assert.equal(svgDataUri('<svg/>'), 'data:image/svg+xml,%3Csvg/%3E');
});

test('percent-encoding an icon beats base64 on size', () => {
  // The claim the tool makes on its own page, checked against a real icon
  // rather than asserted. A generous margin: the point is the direction.
  const icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" '
    + 'stroke="currentColor" stroke-width="2"><path d="M3 12h18M12 3v18"/></svg>';
  const percent = svgDataUri(icon).length;
  const b64 = base64DataUri(ascii(icon), 'image/svg+xml').length;
  assert.ok(percent < b64, `percent-encoded ${percent} should be under base64 ${b64}`);
});
