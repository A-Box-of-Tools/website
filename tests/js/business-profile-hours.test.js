/**
 * tools/business-profile-preview/src/profile.js - the one piece of arithmetic
 * on that page: whether the place is open at this moment.
 *
 * It is the field somebody is least able to check by eye. A name that is
 * wrong is wrong on the picture; a status line that is wrong is a confident
 * green "Open" on a Sunday evening when the shop is shut, and looking at the
 * mock-up will not tell you. So the cases that get it wrong are pinned here:
 * the window that runs past midnight, the day whose window has already passed,
 * the week with a single open day in it, and noon and midnight, which are the
 * two the twelve-hour clock gets backwards if nobody writes them down.
 *
 * Every case passes its own `now`, which is why there is no clock in this file
 * and no test here that is true only on a Wednesday.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  attributeList, clock, minutes, normalise, showCount, showHost, showTime, statusLine,
} from '../../tools/business-profile-preview/src/profile.js';

/** A week, from a map of day number to `open-close` or 'shut'. */
function week(entries) {
  const hours = Array.from({ length: 7 }, () => ({ closed: true, open: '09:00', close: '17:00' }));
  for (const [day, span] of Object.entries(entries)) {
    if (span === 'shut') continue;
    const [open, close] = span.split('-');
    hours[Number(day)] = { closed: false, open, close };
  }
  return hours;
}

/** A profile that is nothing but its hours. */
const shop = (entries, extra = {}) => normalise({ hours: week(entries), ...extra });

// 2026-09-06 is a Sunday, so `at(0, ...)` is a Sunday and the days count on
// from there. Written as a helper rather than as literal dates so that a case
// says which weekday it means.
const at = (day, hour, minute = 0) => new Date(2026, 8, 6 + day, hour, minute);

test('open, and saying when it closes', () => {
  const line = statusLine(shop({ 1: '09:00-17:00' }), at(1, 12));
  assert.deepEqual(line, { key: 'status.open', at: '17:00' });
});

test('the minute it opens counts as open, the minute it closes does not', () => {
  const place = shop({ 1: '09:00-17:00', 2: '09:00-17:00' });
  assert.equal(statusLine(place, at(1, 8, 59)).key, 'status.closedtoday');
  assert.equal(statusLine(place, at(1, 9, 0)).key, 'status.open');
  assert.equal(statusLine(place, at(1, 16, 59)).key, 'status.open');
  assert.deepEqual(statusLine(place, at(1, 17, 0)),
    { key: 'status.closeduntil', at: '09:00', day: 2 },
    'seventeen hundred is the end of the window, not a minute of it');
});

test('shut now, opening later today', () => {
  const line = statusLine(shop({ 1: '09:00-17:00' }), at(1, 7));
  assert.deepEqual(line, { key: 'status.closedtoday', at: '09:00' });
});

test('shut for the rest of today, and named the day it opens again', () => {
  const line = statusLine(shop({ 1: '09:00-17:00', 2: '10:00-16:00' }), at(1, 20));
  assert.deepEqual(line, { key: 'status.closeduntil', at: '10:00', day: 2 },
    'day 2 is Tuesday, and the sentence names it');
});

test('a week with nothing open in it says only that it is closed', () => {
  const line = statusLine(shop({}), at(3, 12));
  assert.deepEqual(line, { key: 'status.closed' },
    'no next opening to name, and inventing one would be worse than saying nothing');
});

test('one open day a week is found from six days away', () => {
  const line = statusLine(shop({ 6: '10:00-14:00' }), at(0, 12));
  assert.deepEqual(line, { key: 'status.closeduntil', at: '10:00', day: 6 });
});

/* ------------------------------------------------------ past midnight */

test('a bar open until two is open at one in the morning', () => {
  const bar = shop({ 5: '22:00-02:00' });
  assert.equal(statusLine(bar, at(5, 23)).key, 'status.open', 'Friday night');
  assert.deepEqual(statusLine(bar, at(6, 1)), { key: 'status.open', at: '02:00' },
    'and still open at one on Saturday, which is Friday`s window running on');
});

test('and shut again at three, waiting on the next Friday', () => {
  assert.deepEqual(statusLine(shop({ 5: '22:00-02:00' }), at(6, 3)),
    { key: 'status.closeduntil', at: '22:00', day: 5 },
    'six days out is still a day worth naming; only a week with no open day at '
    + 'all falls back to saying nothing');
});

test('a window written open to open is the whole day', () => {
  const line = statusLine(shop({ 1: '00:00-00:00' }), at(1, 4));
  assert.deepEqual(line, { key: 'status.open24' },
    'saying it closes at midnight would be true of no hour of it');
});

/* --------------------------------------------------- the four overrides */

test('the overrides answer without looking at the week at all', () => {
  const open = week({ 1: '09:00-17:00' });
  for (const [status, key] of [['open24', 'status.open24'], ['temporary', 'status.temporary'],
    ['permanent', 'status.permanent']]) {
    assert.equal(statusLine(normalise({ hours: open, status }), at(1, 3)).key, key);
  }
  assert.equal(statusLine(normalise({ hours: open, status: 'auto' }), at(1, 12)).key,
    'status.open', 'and auto goes back to the week');
});

test('an override nobody has heard of is auto', () => {
  assert.equal(normalise({ status: 'sometimes' }).status, 'auto');
});

/* --------------------------------------------------------- the clock */

test('noon and midnight, which are the two that get swapped', () => {
  assert.equal(showTime('00:00', '12', 'AM', 'PM'), '12 AM');
  assert.equal(showTime('12:00', '12', 'AM', 'PM'), '12 PM');
  assert.equal(showTime('00:30', '12', 'AM', 'PM'), '12:30 AM');
  assert.equal(showTime('12:30', '12', 'AM', 'PM'), '12:30 PM');
});

test('a listing drops the minutes when there are none', () => {
  assert.equal(showTime('09:00', '12', 'AM', 'PM'), '9 AM');
  assert.equal(showTime('21:30', '12', 'AM', 'PM'), '9:30 PM');
  assert.equal(showTime('21:30', '24', 'AM', 'PM'), '21:30');
});

test('the meridiem is the caller`s word, not this file`s', () => {
  assert.equal(showTime('09:00', '12', 'vorm.', 'nachm.'), '9 vorm.',
    'because "AM" is not "AM" in every language this site is published in');
});

test('a clock time is either HH:MM or nothing', () => {
  assert.equal(clock('9:05'), '09:05');
  assert.equal(clock(' 09:05 '), '09:05');
  assert.equal(clock('24:00'), null);
  assert.equal(clock('09:60'), null);
  assert.equal(clock('nine'), null);
  assert.equal(minutes('09:30'), 570);
});

/* ------------------------------------------------------- the fields */

test('a rating is clamped and rounded, or empty', () => {
  assert.equal(normalise({ rating: '4.63' }).rating, '4.6');
  assert.equal(normalise({ rating: '4,6' }).rating, '4.6', 'a decimal comma too');
  assert.equal(normalise({ rating: '9' }).rating, '5');
  assert.equal(normalise({ rating: '-2' }).rating, '0');
  assert.equal(normalise({ rating: 'four' }).rating, '');
});

test('a review count is digits or nothing', () => {
  assert.equal(normalise({ reviews: '1,284' }).reviews, '1284');
  assert.equal(normalise({ reviews: 'lots' }).reviews, '');
  assert.equal(showCount('1284'), Number(1284).toLocaleString());
});

test('a price band is one of five things', () => {
  for (const price of ['', '$', '$$', '$$$', '$$$$']) {
    assert.equal(normalise({ price }).price, price);
  }
  assert.equal(normalise({ price: '$$$$$' }).price, '', 'five is not a band');
  assert.equal(normalise({ price: 'cheap' }).price, '');
});

test('a website is shown the way a listing prints one', () => {
  assert.equal(showHost('https://www.example.com/'), 'example.com');
  assert.equal(showHost('HTTP://Example.com/menu'), 'Example.com/menu');
  assert.equal(showHost(''), '');
});

test('attributes are commas or newlines, and six of them at most', () => {
  assert.deepEqual(attributeList(normalise({ attributes: 'Dine-in, Takeaway,, Delivery' })),
    ['Dine-in', 'Takeaway', 'Delivery']);
  assert.equal(attributeList(normalise({ attributes: 'a,b,c,d,e,f,g,h' })).length, 6);
});

/**
 * The check that stops a saved profile carrying a reference out of the picture.
 * It is the one field where a wrong value is not a cosmetic mistake: the SVG is
 * downloaded and sent on, and an href pointing anywhere but at itself would
 * make the file report back to whoever wrote it.
 */
test('only an image this page could have made survives normalising', () => {
  const own = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
  assert.equal(normalise({ photo: own }).photo, own);
  assert.equal(normalise({ photo: 'data:image/png;base64,iVBORw0KGgo=' }).photo,
    'data:image/png;base64,iVBORw0KGgo=', 'PNG as well, which is what a canvas also writes');
  for (const hostile of [
    'https://example.com/tracker.png',
    'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
    'data:image/jpeg;base64,abc" onload="alert(1)',
    '/relative.png',
    42,
  ]) {
    assert.equal(normalise({ photo: hostile }).photo, null, String(hostile));
  }
});

test('a profile made of nothing is still a whole profile', () => {
  const nothing = normalise(null);
  assert.equal(nothing.hours.length, 7);
  assert.equal(nothing.name, '');
  assert.equal(nothing.clock, '12');
  assert.equal(statusLine(nothing, at(0, 12)).key, 'status.open',
    'the default week is nine to five every day, so a Sunday noon is inside it');
});
