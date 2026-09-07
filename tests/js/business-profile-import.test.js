/**
 * tools/business-profile-preview/src/parse-listing.js and src/saved.js - the
 * two ways an existing profile gets into that page.
 *
 * Neither can be right about everything, and that is the point of testing
 * them: what matters is which mistakes each one makes. The paste reader is
 * heuristics over lines a person copied off a screen, so what is pinned here
 * is that it reports every field it claims and refuses a week it only half
 * read. The JSON reader is given a record rather than a rendering, so what is
 * pinned there is the opposite rule - a day with no period in it means shut.
 *
 * The two shapes of paste below are the two Google actually produces: the
 * knowledge panel, which brings the words off its own buttons along, and the
 * Maps card, which puts three facts on one line separated by a dot nobody can
 * see.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { parseListing, time24 } from '../../tools/business-profile-preview/src/parse-listing.js';
import { FORMAT, fromJson, toJson } from '../../tools/business-profile-preview/src/saved.js';
import { normalise } from '../../tools/business-profile-preview/src/profile.js';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const BUTTONS = ['Website', 'Directions', 'Call', 'Save', 'Share'];

const read = (text) => parseListing(text, DAYS, BUTTONS);

/* ------------------------------------------------------------- the paste */

test('a knowledge panel, buttons and all', () => {
  const { profile, found } = read([
    'Blue Bottle Coffee',
    'Website',
    'Directions',
    'Save',
    '4.5 (1,284)',
    'Coffee shop',
    '$$',
    'Address: 123 King St W, Toronto, ON M5V 1J5',
    'Phone: (416) 555-0134',
    'bluebottle.example.com',
  ].join('\n'));

  assert.equal(profile.name, 'Blue Bottle Coffee',
    'the button words are furniture, and the first of them would otherwise be the name');
  assert.equal(profile.category, 'Coffee shop');
  assert.equal(profile.rating, '4.5');
  assert.equal(profile.reviews, '1284');
  assert.equal(profile.price, '$$');
  assert.equal(profile.address, '123 King St W, Toronto, ON M5V 1J5');
  assert.equal(profile.phone, '(416) 555-0134');
  assert.equal(profile.website, 'bluebottle.example.com');
  assert.deepEqual([...found].sort(),
    ['address', 'category', 'name', 'phone', 'price', 'rating', 'reviews', 'website']);
});

test('a Maps card, where one line holds three facts', () => {
  // U+22C5 is the dot Maps writes and U+00B7 is the one Search writes. They
  // are the same dot to a reader and different characters to a regex, which is
  // why both are split on.
  const { profile } = read('Blue Bottle Coffee\nCoffee shop ⋅ $$ ⋅ Open ⋅ Closes 5 PM');
  assert.equal(profile.name, 'Blue Bottle Coffee');
  assert.equal(profile.category, 'Coffee shop');
  assert.equal(profile.price, '$$');
});

test('the rating and its count on lines of their own', () => {
  const { profile } = read('Somewhere\n4.8\n(213)\nDentist');
  assert.equal(profile.rating, '4.8');
  assert.equal(profile.reviews, '213');
  assert.equal(profile.category, 'Dentist',
    'and the count is claimed, so it cannot also be read as something else');
});

test('a phone number written the way North America writes one', () => {
  assert.equal(read('X\n(647) 555-9021').profile.phone, '(647) 555-9021');
  assert.equal(read('X\n+44 20 7946 0958').profile.phone, '+44 20 7946 0958');
  assert.equal(read('X\n2026').profile.phone, '', 'a year is not a phone number');
});

test('an email address is not a website', () => {
  const { profile } = read('X\nhello@example.com');
  assert.equal(profile.website, '');
});

test('a full week is read, and Sunday closed stays closed', () => {
  const { profile, found } = read([
    'Northside Dental Care',
    'Monday 8 AM–6 PM',
    'Tuesday 8 AM–6 PM',
    'Wednesday 8 AM–6 PM',
    'Thursday 10 AM–8 PM',
    'Friday 8 AM–4 PM',
    'Saturday 9 AM–1 PM',
    'Sunday Closed',
  ].join('\n'));

  assert.ok(found.includes('hours'));
  assert.deepEqual(profile.hours[1], { closed: false, open: '08:00', close: '18:00' });
  assert.deepEqual(profile.hours[4], { closed: false, open: '10:00', close: '20:00' });
  assert.equal(profile.hours[0].closed, true);
  assert.equal(profile.name, 'Northside Dental Care',
    'and the day lines are claimed, so none of them is mistaken for the name');
});

test('a week missing a day is refused whole', () => {
  const { profile, found } = read([
    'Somewhere',
    'Monday 9 AM–5 PM',
    'Tuesday 9 AM–5 PM',
  ].join('\n'));
  assert.equal(found.includes('hours'), false,
    'five days short is worse than none: the missing ones would look deliberate');
  assert.deepEqual(profile.hours[1], { closed: false, open: '09:00', close: '17:00' },
    'and the week is left at its default rather than half rewritten');
});

test('a day that never shuts', () => {
  const week = ['Somewhere', ...DAYS.slice(1), 'Sunday'].map((day, n) => (
    n === 0 ? day : `${day} Open 24 hours`
  )).join('\n');
  const { profile } = read(week);
  assert.deepEqual(profile.hours[1], { closed: false, open: '00:00', close: '00:00' });
});

test('nothing recognisable claims nothing but the name', () => {
  const { found } = read('   \n\n  ');
  assert.deepEqual(found, [], 'and an empty paste claims not even that');
});

test('every field claimed is a field reported', () => {
  const { profile, found } = read('Kim Salon\n4.2 (18)\nHair salon\n1 Queen St, Toronto\n416 555 0100');
  const filled = ['name', 'category', 'rating', 'reviews', 'address', 'phone']
    .filter((field) => profile[field] !== '');
  assert.deepEqual([...found].sort(), filled.sort(),
    'a heuristic that does not say what it guessed is a mock-up somebody signs off');
});

test('the twelve-hour clock, in the shapes a listing prints it', () => {
  assert.equal(time24('9 AM'), '09:00');
  assert.equal(time24('9:30 p.m.'), '21:30');
  assert.equal(time24('12 AM'), '00:00', 'midnight');
  assert.equal(time24('12 PM'), '12:00', 'noon');
  assert.equal(time24('17:00'), '17:00');
  assert.equal(time24('teatime'), null);
});

/* -------------------------------------------------------------- the file */

test('a profile this page saved comes back as it went in', () => {
  const written = normalise({
    name: 'Blue Bottle Coffee',
    category: 'Coffee shop',
    rating: '4.5',
    reviews: '1284',
    address: '123 King St W',
    phone: '(416) 555-0134',
    website: 'https://example.com',
    description: 'Coffee.',
    attributes: 'Dine-in, Takeaway',
    price: '$$',
    clock: '24',
    status: 'open24',
  });
  const { profile, shape } = fromJson(toJson(written));
  assert.equal(shape, 'own');
  assert.deepEqual(profile, written);
  assert.ok(toJson(written).includes(FORMAT), 'and the file says what it is');
});

test('a Business Profile location export', () => {
  const { profile, shape } = fromJson(JSON.stringify({
    name: 'locations/12345',
    title: 'Northside Dental Care',
    storefrontAddress: {
      addressLines: ['88 Bathurst St', 'Unit 4'],
      locality: 'Toronto',
      administrativeArea: 'ON',
      postalCode: 'M5V 2P7',
    },
    websiteUri: 'https://northsidedental.example.ca',
    phoneNumbers: { primaryPhone: '(647) 555-9021' },
    categories: { primaryCategory: { displayName: 'Dentist' } },
    profile: { description: 'Family dentistry since 1998.' },
    regularHours: {
      periods: [
        { openDay: 'MONDAY', openTime: { hours: 8 }, closeDay: 'MONDAY', closeTime: { hours: 18 } },
        {
          openDay: 'THURSDAY',
          openTime: { hours: 10, minutes: 30 },
          closeDay: 'THURSDAY',
          closeTime: { hours: 20 },
        },
      ],
    },
  }));

  assert.equal(shape, 'google');
  assert.equal(profile.name, 'Northside Dental Care');
  assert.equal(profile.category, 'Dentist');
  assert.equal(profile.address, '88 Bathurst St, Unit 4, Toronto, ON M5V 2P7');
  assert.equal(profile.phone, '(647) 555-9021');
  assert.equal(profile.description, 'Family dentistry since 1998.');
  assert.deepEqual(profile.hours[1], { closed: false, open: '08:00', close: '18:00' });
  assert.deepEqual(profile.hours[4], { closed: false, open: '10:30', close: '20:00' });
  assert.equal(profile.hours[2].closed, true,
    'a record with no Tuesday in it means shut, which is the opposite of what a '
    + 'paste with no Tuesday in it means');
});

test('an export that says the place has gone', () => {
  const shut = (status) => fromJson(JSON.stringify({ title: 'X', openInfo: { status } })).profile;
  assert.equal(shut('CLOSED_PERMANENTLY').status, 'permanent');
  assert.equal(shut('CLOSED_TEMPORARILY').status, 'temporary');
  assert.equal(shut('OPEN').status, 'auto');
});

test('a page of locations takes the first', () => {
  const { profile } = fromJson(JSON.stringify({
    locations: [{ title: 'First' }, { title: 'Second' }],
  }));
  assert.equal(profile.name, 'First');
});

test('what is refused, and how', () => {
  assert.throws(() => fromJson('not json at all'), /load.notjson/);
  assert.throws(() => fromJson('[1, 2, 3]'), /load.unknown/);
  assert.throws(() => fromJson('{"unrelated": true}'), /load.unknown/);
});

test('an href out of a saved file never reaches the picture', () => {
  const { profile } = fromJson(JSON.stringify({
    format: FORMAT,
    version: 1,
    profile: { name: 'X', photo: 'https://example.com/beacon.png' },
  }));
  assert.equal(profile.photo, null,
    'a saved profile is a file that gets emailed round an office, and it is '
    + 'the route by which a reference out of a downloadable SVG would arrive');
});
