/**
 * tools/qr-barcode/src/payload.js - what actually goes in the code.
 *
 * A QR code holds a string. "A Wi-Fi code" is an ordinary code holding a string
 * in a shape the camera app recognises, so everything that can go wrong here is
 * a string that looks right and means something else - and none of it throws.
 *
 * The case that matters most is escaping. A Wi-Fi password with a semicolon in
 * it, written out plainly, ends the field early: the phone reads a shorter
 * password, fails to join, and the person who printed the sign has no way to
 * tell that from a typo. Every fixture below that carries punctuation carries
 * the punctuation that ends a field in the format it is going into.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { KINDS, compose, missing } from '../../tools/qr-barcode/src/payload.js';

/**
 * Stands in for the caller's phrase(). The real one reads the markup; what is
 * asserted here is which key came back, because the sentence is body.html's in
 * fifteen languages.
 */
const say = (key, values = {}) => {
  const filled = Object.entries(values).map(([k, v]) => `${k}=${v}`).join(' ');
  return filled ? `${key} ${filled}` : key;
};

/* ------------------------------------------------------------------- Wi-Fi */

test('a Wi-Fi payload names the network, the secret and the scheme', () => {
  assert.equal(
    compose('wifi', { ssid: 'Cafe', password: 'hunter2', security: 'WPA' }, say),
    'WIFI:T:WPA;S:Cafe;P:hunter2;;',
  );
});

test('a Wi-Fi password keeps every character that would end a field', () => {
  // Each of these is a separator somewhere in the format. Unescaped, the first
  // one truncates the password and the network is never joined.
  const password = 'a;b:c,d"e\\f';
  const built = compose('wifi', { ssid: 'Cafe', password, security: 'WPA' }, say);

  assert.equal(built, 'WIFI:T:WPA;S:Cafe;P:a\\;b\\:c\\,d\\"e\\\\f;;');

  // And reading it back the way a phone does returns what was typed.
  assert.equal(unescapeWifi(field(built, 'P')), password);
});

test('a network name is escaped the same way as the password', () => {
  const built = compose('wifi', { ssid: 'Bar;Grill', password: 'x', security: 'WPA' }, say);
  assert.equal(field(built, 'S'), 'Bar\\;Grill');
  assert.equal(unescapeWifi(field(built, 'S')), 'Bar;Grill');
});

test('an open network carries no password at all', () => {
  // Not an empty P field: a phone that sees one may prompt for a key on a
  // network that has none.
  const built = compose('wifi', { ssid: 'Cafe', password: 'ignored', security: 'nopass' }, say);
  assert.equal(built, 'WIFI:T:nopass;S:Cafe;;');
  assert.ok(!built.includes('ignored'));
});

test('a Wi-Fi payload with no scheme chosen assumes WPA', () => {
  const built = compose('wifi', { ssid: 'Cafe', password: 'x', security: '' }, say);
  assert.equal(field(built, 'T'), 'WPA');
});

test('a hidden network says so, and a visible one says nothing', () => {
  const hidden = compose('wifi', { ssid: 'Cafe', password: 'x', security: 'WPA', hidden: true }, say);
  assert.ok(hidden.includes(';H:true;'));

  const visible = compose('wifi', { ssid: 'Cafe', password: 'x', security: 'WPA', hidden: false }, say);
  assert.ok(!visible.includes('H:'));
});

test('a blank Wi-Fi password is left out rather than written empty', () => {
  const built = compose('wifi', { ssid: 'Cafe', password: '   ', security: 'WPA' }, say);
  assert.equal(built, 'WIFI:T:WPA;S:Cafe;;');
});

/* ----------------------------------------------------------------- contact */

test('a contact card is a vCard with the name in both shapes', () => {
  const built = compose('contact', { first: 'Ada', last: 'Lovelace' }, say);
  const lines = built.split('\n');

  assert.equal(lines[0], 'BEGIN:VCARD');
  assert.equal(lines[1], 'VERSION:3.0');
  // N is family-first and structured; FN is the one a phone shows.
  assert.ok(lines.includes('N:Lovelace;Ada;;;'));
  assert.ok(lines.includes('FN:Ada Lovelace'));
  assert.equal(lines.at(-1), 'END:VCARD');
});

test('a contact card leaves out every field nobody filled in', () => {
  const built = compose('contact', { first: 'Ada' }, say);
  assert.deepEqual(built.split('\n'), [
    'BEGIN:VCARD', 'VERSION:3.0', 'N:;Ada;;;', 'FN:Ada', 'END:VCARD',
  ]);
});

test('a contact card carries the details it was given', () => {
  const built = compose('contact', {
    first: 'Ada', last: 'Lovelace', org: 'Analytical Engines',
    title: 'Mathematician', phone: '+44 20 7946 0000',
    email: 'ada@example.com', url: 'https://example.com',
    address: '12 Example Street, London',
  }, say);

  assert.ok(built.includes('ORG:Analytical Engines'));
  assert.ok(built.includes('TITLE:Mathematician'));
  assert.ok(built.includes('TEL;TYPE=CELL:+44 20 7946 0000'));
  assert.ok(built.includes('EMAIL:ada@example.com'));
  assert.ok(built.includes('URL:https://example.com'));
  // One line of address goes in the street slot, with the other six empty.
  assert.ok(built.includes('ADR:;;12 Example Street\\, London;;;;'));
});

test('a vCard field escapes its separators and its line breaks', () => {
  // A comma is a separator in a vCard value, and a raw newline ends the
  // property - so an address typed across two lines would silently truncate.
  const built = compose('contact', {
    first: 'Ada',
    org: 'Lovelace, Babbage; Co',
    address: '12 Example Street\nLondon',
  }, say);

  assert.ok(built.includes('ORG:Lovelace\\, Babbage\\; Co'));
  assert.ok(built.includes('ADR:;;12 Example Street\\nLondon;;;;'));
  // The escaped break is two characters, not a real one: the card is still
  // five lines plus the address line, not six plus one.
  assert.equal(built.split('\n').filter((line) => line.startsWith('ADR:')).length, 1);
});

/* ------------------------------------------------------------------- links */

test('an email payload puts the subject and body in the query', () => {
  const built = compose('email', {
    to: 'hi@abox.tools', subject: 'Hello there', body: 'Line one\nLine two',
  }, say);

  assert.equal(built,
    'mailto:hi@abox.tools?subject=Hello%20there&body=Line%20one%0ALine%20two');
});

test('an email payload with nothing but an address has no query at all', () => {
  assert.equal(compose('email', { to: 'hi@abox.tools' }, say), 'mailto:hi@abox.tools');
});

test('an ampersand in a subject does not start a second parameter', () => {
  const built = compose('email', { to: 'a@b.c', subject: 'Tea & cake', body: 'x' }, say);
  assert.ok(built.includes('subject=Tea%20%26%20cake'));
  // One separator between the two parameters, and no more.
  assert.equal(built.split('&').length, 2);
});

test('a text payload is passed through exactly as typed', () => {
  // Not trimmed: what the box says is what the code holds, and the page shows
  // the finished string so a stray space is visible rather than guessed at.
  assert.equal(compose('text', { text: '  https://abox.tools/  ' }, say),
    '  https://abox.tools/  ');
});

test('SMS and telephone payloads drop the spaces people type', () => {
  assert.equal(compose('phone', { number: '+1 555 123 4567' }, say), 'tel:+15551234567');
  assert.equal(compose('sms', { number: '+1 555 123 4567' }, say), 'SMSTO:+15551234567');
  assert.equal(compose('sms', { number: '+1 555 123 4567', message: 'on my way' }, say),
    'SMSTO:+15551234567:on my way');
});

test('a location payload is a geo URI', () => {
  assert.equal(compose('location', { latitude: '51.5007', longitude: '-0.1246' }, say),
    'geo:51.5007,-0.1246');
});

test('a kind that does not exist is refused, and says which', () => {
  assert.throws(
    () => compose('telegram', {}, say),
    (error) => error instanceof RangeError && error.message === 'payload.nosuch kind=telegram',
  );
});

/* ------------------------------------------------------ what is still blank */

test('the required fields are named when they are empty', () => {
  assert.deepEqual(missing('wifi', {}), ['field.ssid', 'field.security']);
  assert.deepEqual(missing('location', { latitude: '51.5' }), ['field.longitude']);
  assert.deepEqual(missing('email', { to: 'hi@abox.tools' }), []);
});

test('whitespace does not count as filling a field in', () => {
  assert.deepEqual(missing('phone', { number: '   ' }), ['field.number']);
});

test('an optional field is never asked for, and neither is a checkbox', () => {
  // hidden is a checkbox and password is optional; neither can hold up a code.
  assert.deepEqual(missing('wifi', { ssid: 'Cafe', security: 'WPA' }), []);
});

test('a contact card needs one detail rather than any particular one', () => {
  // Every field on the card is optional, so the ordinary rule would accept an
  // empty card. A card with only a phone number on it is a perfectly good card.
  assert.deepEqual(missing('contact', {}), ['payload.anydetail']);
  assert.deepEqual(missing('contact', { phone: '+15551234567' }), []);
  assert.deepEqual(missing('contact', { first: '  ' }), ['payload.anydetail']);
});

/* ------------------------------------------------------------- the catalogue */

test('every kind compose handles is offered, and every kind offered composes', () => {
  const offered = KINDS.map((kind) => kind.id);
  assert.deepEqual(offered,
    ['text', 'wifi', 'contact', 'email', 'sms', 'phone', 'location']);

  // A kind in the menu that compose does not know throws at the moment somebody
  // picks it, which is a blank page rather than a message.
  for (const kind of offered) {
    assert.doesNotThrow(() => compose(kind, {}, say), `${kind} did not compose`);
    assert.doesNotThrow(() => missing(kind, {}), `${kind} could not be checked`);
  }
});

test('no kind has two fields with the same id', () => {
  // Two fields sharing an id means the second input silently overwrites the
  // first, and the code is built from half of what was typed.
  for (const kind of KINDS) {
    const ids = kind.fields.map((field) => field.id);
    assert.equal(new Set(ids).size, ids.length, `${kind.id} has a repeated field id`);
  }
});

test('every select offers a value and a label for it', () => {
  for (const kind of KINDS) {
    for (const field of kind.fields.filter((one) => one.type === 'select')) {
      assert.ok(field.options.length, `${kind.id}.${field.id} has no options`);
      for (const option of field.options) {
        assert.equal(option.length, 2, `${kind.id}.${field.id} has a malformed option`);
      }
    }
  }
});

/* ----------------------------------------------------------------- helpers */

/** Pull one field out of a WIFI: payload the way a reader walks it. */
function field(payload, key) {
  const body = payload.replace(/^WIFI:/, '').replace(/;;$/, '');
  // Split on separators that are not escaped, which is the whole point.
  const parts = body.match(/(?:\\.|[^;])+/g) ?? [];
  const found = parts.find((part) => part.startsWith(`${key}:`));
  return found === undefined ? null : found.slice(key.length + 1);
}

/** Undo wifiEscape, so a round trip can be asserted rather than a spelling. */
const unescapeWifi = (value) => value.replace(/\\(.)/g, '$1');
