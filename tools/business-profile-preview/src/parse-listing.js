/**
 * Reading a listing back out of text somebody copied off it.
 *
 * WHY THIS EXISTS RATHER THAN A LOOKUP
 *
 * "Import my existing profile" would ordinarily mean asking Google for it, and
 * this page cannot ask anybody anything: `connect-src` names no address it
 * could fetch from, which is the promise the whole site is built on. So the
 * profile arrives the only way it can without one - through the clipboard. Open
 * your own listing, select it, copy it, paste it here.
 *
 * WHAT THAT COSTS, AND WHY IT IS SAID OUT LOUD
 *
 * Pasted text is a rendering, not a record: the fields are not labelled, the
 * order changes between Search and Maps, and a category and a district are the
 * same shape of thing. So this returns not just a profile but a list of which
 * fields it believes it filled in, and the page reports that list rather than
 * quietly presenting a guess as an import. A wrong category that announces
 * itself is a five-second fix; a wrong category that does not is a mock-up
 * somebody signs off on.
 *
 * Nothing here is a parser in the sense the JSON and YAML tools use the word.
 * It is a set of recognisers run over lines, each taking the first line it is
 * confident about, written to give up rather than to guess.
 */

import { empty } from './profile.js';

/** Middots, bullets and pipes: how one line of a listing holds three facts.
 *
 * Four dots, not one. Search writes U+00B7 and Maps writes U+22C5, they are
 * indistinguishable on screen, and a paste split on only one of them arrives
 * as a single line holding a category, a price band and an opening time. */
const SPLIT = /\s*[\u00b7\u22c5\u2022\u2219|]\s*|\s{3,}/;

/** A price band, as a listing prints it. */
const PRICE = /^\$\${0,3}$/;

/** "4.5 (1,234)" and "4.5(1,234)". */
const RATING = /^(\d(?:[.,]\d)?)\s*(?:\(\s*([\d.,\s]+)\s*\))?$/;

/** The review count when it arrived on a line of its own. */
const REVIEWS = /^\(?\s*([\d.,\s]{1,15})\s*\)?$/;

/** Enough digits to be a telephone number, and little else in it. The leading
 * bracket is not decoration: North America writes (416) 555-0134, and a
 * pattern insisting on a digit first reads that as an address instead. */
const PHONE = /^[+(]?\d[\d\s().\u2011-]{6,20}$/;

/** A bare host or a URL, and deliberately not an email address. */
const WEBSITE = /^(?:https?:\/\/)?(?:www\.)?[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9-]+)+(?:\/\S*)?$/i;

/** Labels Google prints in front of a field, in some of the languages it does. */
const LABEL = /^(?:address|adresse|direcci\u00f3n|indirizzo|endere\u00e7o|adres|hours|\u00f6ffnungszeiten|horario|phone|telefon|t\u00e9l\u00e9phone|tel\u00e9fono|telefono|website|web)\s*[:\uff1a]\s*/i;

/**
 * A profile read out of pasted text, and the fields it is claiming.
 *
 * @param {string} pasted
 * @param {string[]} [dayNames]  the long day names in the page's language,
 *   Sunday first, so a German paste can be read on a German page
 * @param {string[]} [ignore]  lines that are the listing's own furniture rather
 *   than anything about the business - the words on its buttons. Copying a
 *   knowledge panel brings them along, and the first of them would otherwise be
 *   taken for the business name.
 * @returns {{profile: object, found: string[]}}
 */
export function parseListing(pasted, dayNames = [], ignore = []) {
  const lines = String(pasted || '')
    .replace(/[\u00a0\u202f\u2009]/g, ' ')
    .split(/\r?\n/)
    .flatMap((line) => line.split(SPLIT))
    .map((line) => line.trim())
    .filter(Boolean);

  const furniture = new Set(ignore.map((word) => word.toLowerCase()));

  const profile = empty();
  const found = [];
  const taken = new Set();
  const note = (field) => { if (!found.includes(field)) found.push(field); };
  const claim = (index, field) => { taken.add(index); note(field); };

  const week = readHours(lines, dayNames, taken);
  if (week) {
    profile.hours = week;
    note('hours');
  }

  lines.forEach((line, index) => {
    if (taken.has(index)) return;
    const bare = line.replace(LABEL, '').trim();
    if (!bare || furniture.has(bare.toLowerCase())) { taken.add(index); return; }

    if (profile.rating === '') {
      const rating = RATING.exec(bare);
      if (rating) {
        profile.rating = rating[1].replace(',', '.');
        claim(index, 'rating');
        if (rating[2] && /\d/.test(rating[2])) {
          profile.reviews = digits(rating[2]);
          note('reviews');
          return;
        }
        // "4.5" and "(1,234)" arrive on lines of their own as often as not.
        const next = lines[index + 1];
        const count = next && !taken.has(index + 1) ? REVIEWS.exec(next) : null;
        if (count && /\d/.test(count[1])) {
          profile.reviews = digits(count[1]);
          claim(index + 1, 'reviews');
        }
        return;
      }
    }

    if (profile.price === '' && PRICE.test(bare)) {
      profile.price = bare;
      claim(index, 'price');
      return;
    }
    if (profile.phone === '' && PHONE.test(bare) && countDigits(bare) >= 7) {
      profile.phone = bare;
      claim(index, 'phone');
      return;
    }
    if (profile.website === '' && !bare.includes('@') && WEBSITE.test(bare)) {
      profile.website = bare;
      claim(index, 'website');
      return;
    }
    if (profile.address === '' && bare.includes(',') && /\d/.test(bare) && bare.length > 8) {
      profile.address = bare;
      claim(index, 'address');
    }
  });

  // The name and the category are decided last, out of what nothing else
  // wanted: the first unclaimed line is the heading, and the first short wordy
  // one after it is the category. That is how a listing is laid out and the
  // only thing about it this can lean on.
  const spare = lines
    .map((line, index) => ({ line, index }))
    .filter((one) => !taken.has(one.index));

  if (spare.length) {
    profile.name = spare[0].line;
    claim(spare[0].index, 'name');
  }
  const category = spare.slice(1).find((one) => (
    one.line.length <= 44 && !/\d/.test(one.line)
  ));
  if (category) {
    profile.category = category.line;
    claim(category.index, 'category');
  }

  return { profile, found };
}

/** Just the digits of a count, so "1,234" and "1 234" both come back 1234. */
const digits = (value) => String(value).replace(/\D/g, '');

const countDigits = (value) => (String(value).match(/\d/g) || []).length;

/* ------------------------------------------------------------------- hours */

const ENGLISH_DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/** "9 AM-5 PM", "09:00 - 17:00", "9 a.m. to 5 p.m." */
const SPAN = new RegExp(
  '(\\d{1,2}(?::\\d{2})?\\s*(?:[ap]\\.?\\s?m\\.?)?)'
  + '\\s*(?:[-~\u2010\u2011\u2012\u2013\u2014\u2015]|to|bis|a|\u00e0|at\u00e9|hingga)\\s*'
  + '(\\d{1,2}(?::\\d{2})?\\s*(?:[ap]\\.?\\s?m\\.?)?)', 'i');

/** A day whose line says it is shut, in the words a listing uses for it. */
const SHUT = /closed|geschlossen|cerrado|ferm\u00e9|chiuso|fechado|gesloten|kapal\u0131|tutup/i;

/** A day that never shuts. */
const ALL_DAY = /24\s*(?:hours|hrs|h\b)|24\/7|24 horas|24 heures|24\u6642\u9593|24\u5c0f\u65f6/i;

/**
 * The week, if the paste contains one.
 *
 * Returns null rather than a half-filled week: a paste whose hours were not
 * copied should leave the ones already in the form alone, and six days out of
 * seven is worse than none, because the missing one looks deliberate.
 */
function readHours(lines, dayNames, taken) {
  const forms = ENGLISH_DAYS.map((english, day) => [
    english,
    english.slice(0, 3),
    (dayNames[day] || '').toLowerCase(),
    (dayNames[day] || '').toLowerCase().slice(0, 3),
  ].filter(Boolean).sort((a, b) => b.length - a.length));

  const week = new Array(7).fill(null);
  const claimed = [];

  lines.forEach((line, index) => {
    const lower = line.toLowerCase();
    const day = forms.findIndex((names) => names.some((name) => lower.startsWith(name)));
    if (day < 0 || week[day]) return;

    // The longest matching name first, so "sun" never eats the head of a day
    // whose local name happens to start the same way.
    const name = forms[day].find((one) => lower.startsWith(one));
    const rest = line.slice(name.length);

    if (ALL_DAY.test(rest)) week[day] = { closed: false, open: '00:00', close: '00:00' };
    else if (SHUT.test(rest)) week[day] = { closed: true, open: '09:00', close: '17:00' };
    else {
      const span = SPAN.exec(rest);
      const open = span && time24(span[1]);
      const close = span && time24(span[2]);
      if (!open || !close) return;
      week[day] = { closed: false, open, close };
    }
    claimed.push(index);
  });

  if (week.some((day) => day === null)) return null;
  claimed.forEach((index) => taken.add(index));
  return week;
}

/**
 * A clock time in any of the shapes a listing prints it, as `HH:MM`.
 *
 * Noon and midnight are the two that catch everybody: 12 AM is 00:00 and 12 PM
 * is 12:00, and arithmetic that gets one right gets the other wrong unless it
 * is written down.
 */
export function time24(value) {
  const match = /^\s*(\d{1,2})(?::(\d{2}))?\s*(?:([ap])\.?\s?m\.?)?\s*$/i.exec(String(value || ''));
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = match[2] ?? '00';
  const half = match[3]?.toLowerCase();
  if (half === 'a') hour = hour === 12 ? 0 : hour;
  else if (half === 'p') hour = hour === 12 ? 12 : hour + 12;
  if (hour > 24 || Number(minute) > 59) return null;
  return `${String(hour % 24).padStart(2, '0')}:${minute}`;
}
