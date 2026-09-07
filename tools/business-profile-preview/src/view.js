/**
 * The profile as the three surfaces need it: every number turned into the
 * string a listing would print, and every sentence already in the reader's
 * language.
 *
 * WHY THIS SITS BETWEEN THE MODEL AND THE RENDERERS
 *
 * The renderers must not know any words - see the note at the top of
 * shared/js/phrases.js for what happens to a sentence written inside a module.
 * The model must not know any either, because "Closes 9 PM" is a fact about a
 * clock in one language and a different arrangement of it in the next. So the
 * words arrive here, once, as a plain object main.js fills in from the page,
 * and everything downstream is handed finished strings.
 *
 * It also means the interesting decisions - which action buttons a profile has
 * earned, what an empty rating shows instead of stars, whether the address row
 * is an address or a service area - are made in one place with no DOM in it,
 * and can be asserted on directly.
 */

import { attributeList, showCount, showHost, showTime, statusLine } from './profile.js';

/** The action buttons a listing offers, in the order Google puts them. */
const ACTIONS = [
  { id: 'directions', mark: 'route', needs: (p) => Boolean(p.address) },
  { id: 'website', mark: 'globe', needs: (p) => Boolean(p.website) },
  { id: 'call', mark: 'phone', needs: (p) => Boolean(p.phone) },
  { id: 'save', mark: 'save', needs: () => true },
  { id: 'share', mark: 'share', needs: () => true },
];

/**
 * @param {object} profile  as profile.js normalises it
 * @param {Record<string, string>} labels  the page's own words, looked up already
 * @param {Date} now  the clock the status line is worked out against
 */
export function describe(profile, labels, now) {
  // A key with nothing behind it comes back as the key, the way phrase() does
  // it and for the same reason: `label.reviewsshort` on the picture says "this
  // page is built wrong" plainly, where an empty string says nothing at all and
  // is indistinguishable from a field somebody left blank. Every lookup here
  // goes through this, so the test that watches for a key in the drawing sees
  // all of them rather than the three that happen to take a blank.
  const fill = (key, values = {}) => (labels[key] ?? key)
    .replace(/\{(\w+)\}/g, (whole, name) => (name in values ? values[name] : whole));
  const at = (value) => showTime(value, profile.clock, fill('time.am'), fill('time.pm'));

  return {
    name: profile.name || fill('sample.placeholder'),
    named: Boolean(profile.name),
    category: profile.category,
    price: profile.price,
    rating: profile.rating,
    ratingText: profile.rating === '' ? '' : Number(profile.rating).toFixed(1),
    reviewsText: reviewsText(profile, fill),
    // The same count in the form the narrow surface prints it: a local pack
    // entry has no room for the words and writes "(1,284)".
    reviewsShort: profile.reviews === '' ? fill('label.noreviews')
      : fill('label.reviewsshort', { count: showCount(profile.reviews) }),
    hasReviews: profile.rating !== '' && profile.reviews !== '',
    address: profile.address,
    addressText: addressText(profile, fill),
    phone: profile.phone,
    host: showHost(profile.website),
    description: profile.description,
    chips: attributeList(profile),
    status: status(profile, fill, at, now),
    actions: ACTIONS.filter((one) => one.needs(profile))
      .map((one) => ({ mark: one.mark, label: fill(`label.${one.id}`) })),
    photo: profile.photo,
    // The three the surfaces write themselves rather than getting from a
    // field. Named here rather than looked up there, so that surfaces.js can
    // go on knowing no words at all - which is what makes it testable with a
    // ruler and no page.
    words: {
      from: fill('label.from'),
      website: fill('label.website'),
      directions: fill('label.directions'),
    },
  };
}

/** "128 Google reviews", "1 Google review", or the line a new profile shows. */
function reviewsText(profile, fill) {
  if (profile.rating === '' || profile.reviews === '') return fill('label.noreviews');
  return Number(profile.reviews) === 1
    ? fill('label.review1')
    : fill('label.reviews', { count: showCount(profile.reviews) });
}

/** The address row: an address, or the area a business without one covers. */
function addressText(profile, fill) {
  if (!profile.address) return '';
  return profile.serviceArea ? fill('label.serves', { area: profile.address }) : profile.address;
}

/**
 * The line a listing leads with: a coloured word, and the clock behind it.
 *
 * Split in two rather than written as one sentence because Google colours the
 * first half and not the second, and a translator moving the word "Open" to
 * the end of the sentence should move the colour with it - which they can,
 * because the two halves stay separate all the way to the renderer.
 */
function status(profile, fill, at, now) {
  const line = statusLine(profile, now);
  const word = {
    'status.open': ['open', 'status.open'],
    'status.open24': ['open', 'status.open24'],
    'status.closed': ['closed', 'status.closed'],
    'status.closedtoday': ['closed', 'status.closed'],
    'status.closeduntil': ['closed', 'status.closed'],
    'status.temporary': ['closed', 'status.temporary'],
    'status.permanent': ['closed', 'status.permanent'],
  }[line.key] ?? ['closed', 'status.closed'];

  const tail = {
    'status.open': () => fill('status.closes', { at: at(line.at) }),
    'status.closedtoday': () => fill('status.opens', { at: at(line.at) }),
    'status.closeduntil': () => fill('status.opensday', {
      at: at(line.at), day: fill(`day.${DAY[line.day]}`),
    }),
  }[line.key];

  return { tone: word[0], lead: fill(word[1]), tail: tail ? tail() : '' };
}

const DAY = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
