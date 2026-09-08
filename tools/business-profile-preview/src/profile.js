/**
 * What a business profile is, as far as this page is concerned, and the one
 * piece of arithmetic in it: whether the place is open right now.
 *
 * WHY THE HOURS ARE STORED BY getDay() AND SHOWN MONDAY FIRST
 *
 * The status line has to answer "is it open at this moment", and the only
 * clock available is the visitor's own. `Date.getDay()` counts from Sunday, so
 * the array does too - anything else means a modulo in every comparison, and
 * an off-by-one in an opening-hours calculation is the kind of bug that looks
 * right on a Wednesday. The form shows the week Monday first, which is what
 * the Business Profile dashboard shows, and that reordering is one line in
 * main.js rather than a second convention here.
 *
 * WHY A WINDOW MAY END BEFORE IT STARTS
 *
 * Bars, bakeries and petrol stations. `22:00` to `02:00` is a real week's
 * entry, and it means the place is open at one in the morning on the FOLLOWING
 * day - so `openNow` looks at yesterday's window as well as today's. Without
 * that, a bar open until two reports itself shut from midnight, which is the
 * hour its listing is most looked at.
 *
 * WHAT IS DELIBERATELY NOT HERE
 *
 * No words. `statusLine` returns a key and the numbers to fill it with, and
 * the caller looks the sentence up with phrase() - see the note at the top of
 * shared/js/phrases.js for why a sentence in a module is a sentence in English
 * on fourteen pages out of fifteen.
 */

/** Sunday first, because that is how `Date.getDay()` counts. */
export const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/** The week as the form shows it: Monday first, as the dashboard does. */
export const FORM_DAYS = [1, 2, 3, 4, 5, 6, 0];

/** The states a profile can be in that the hours cannot express. */
export const STATUS = ['auto', 'open24', 'temporary', 'permanent'];

/** Nothing set: what the page opens on before anything is typed. */
export function empty() {
  return {
    name: '',
    category: '',
    price: '',
    rating: '',
    reviews: '',
    address: '',
    serviceArea: false,
    phone: '',
    website: '',
    description: '',
    attributes: '',
    status: 'auto',
    clock: '12',
    hours: DAY_KEYS.map(() => ({ closed: false, open: '09:00', close: '17:00' })),
    photo: null,
  };
}

/**
 * A profile with every field present and of the right type.
 *
 * Everything that reaches the renderers goes through here, because two of the
 * three ways in - a pasted listing and a JSON file - are shapes this page did
 * not write. A missing `hours` array or a rating of "four" must land as an
 * ordinary empty profile rather than as an exception halfway through a draw.
 */
export function normalise(input) {
  const base = empty();
  const given = (input && typeof input === 'object') ? input : {};
  const text = (key) => (typeof given[key] === 'string' ? given[key].trim() : base[key]);

  const hours = Array.isArray(given.hours) ? given.hours : [];
  return {
    ...base,
    name: text('name'),
    category: text('category'),
    price: /^\$?\${0,3}$/.test(String(given.price ?? '')) ? String(given.price) : '',
    rating: ratingText(given.rating),
    reviews: reviewsText(given.reviews),
    address: text('address'),
    serviceArea: given.serviceArea === true,
    phone: text('phone'),
    website: text('website'),
    description: text('description'),
    attributes: text('attributes'),
    status: STATUS.includes(given.status) ? given.status : 'auto',
    clock: given.clock === '24' ? '24' : '12',
    hours: base.hours.map((fallback, day) => day7(hours[day], fallback)),
    photo: ownImage(given.photo),
  };
}

/** A rating as the box holds it: blank, or 0 to 5 with one decimal. */
function ratingText(value) {
  const number = Number.parseFloat(String(value ?? '').replace(',', '.'));
  if (!Number.isFinite(number)) return '';
  return String(Math.min(5, Math.max(0, Math.round(number * 10) / 10)));
}

/** A review count as the box holds it: blank, or a whole number. */
function reviewsText(value) {
  const number = Number.parseInt(String(value ?? '').replace(/[^\d]/g, ''), 10);
  return Number.isFinite(number) ? String(Math.max(0, number)) : '';
}

/** One day's entry, with anything unreadable falling back to the default. */
function day7(given, fallback) {
  if (!given || typeof given !== 'object') return { ...fallback };
  return {
    closed: given.closed === true,
    open: clock(given.open) ?? fallback.open,
    close: clock(given.close) ?? fallback.close,
  };
}

/** `HH:MM` on a 24-hour clock, or null. */
export function clock(value) {
  const match = /^\s*(\d{1,2}):(\d{2})\s*$/.exec(String(value ?? ''));
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/**
 * Only what this page's own canvas produced.
 *
 * The photo ends up as an `href` inside an SVG that gets downloaded and sent
 * on, and the one thing that markup must never carry is a reference to
 * somewhere else. Anything that is not a base64 image of this page's own making
 * is dropped rather than repaired - a saved profile somebody was handed is
 * exactly the route by which an `https://` href would otherwise arrive.
 */
const OWN_IMAGE = /^data:image\/(jpeg|png);base64,[A-Za-z0-9+/]+={0,2}$/;

function ownImage(value) {
  return (typeof value === 'string' && OWN_IMAGE.test(value)) ? value : null;
}

/** Minutes since midnight, from `HH:MM`. */
export function minutes(value) {
  const at = clock(value);
  if (!at) return null;
  return Number(at.slice(0, 2)) * 60 + Number(at.slice(3));
}

/**
 * Every window that could cover `day`: its own, and the previous day's if that
 * one runs past midnight.
 *
 * Each is returned in minutes from the start of `day`, so a Friday night that
 * ends at 2 am on Saturday is `1320 .. 1560` on Friday and `-120 .. 120` on
 * Saturday. One number line, no special cases at the call site.
 */
function windows(hours, day) {
  const found = [];
  for (const offset of [0, -1]) {
    const index = (day + offset + 7) % 7;
    const entry = hours[index];
    if (!entry || entry.closed) continue;
    const from = minutes(entry.open);
    const to = minutes(entry.close);
    if (from === null || to === null) continue;
    // A window that ends before it starts crosses midnight; one that ends
    // exactly where it starts is the way a 24-hour day is written by hand.
    const span = to > from ? to - from : (to === from ? 1440 : 1440 - from + to);
    found.push({ from: from + offset * 1440, to: from + offset * 1440 + span, day: index });
  }
  return found;
}

/**
 * What the status line says, as a phrase key and the blanks to fill it with.
 *
 * `now` is passed in rather than read here so a test can ask what a Tuesday
 * teatime looks like without waiting for one.
 *
 * @param {object} profile
 * @param {Date} now
 * @returns {{key: string, at?: string, day?: number}|null}
 */
export function statusLine(profile, now) {
  if (profile.status === 'permanent') return { key: 'status.permanent' };
  if (profile.status === 'temporary') return { key: 'status.temporary' };
  if (profile.status === 'open24') return { key: 'status.open24' };

  const day = now.getDay();
  const at = now.getHours() * 60 + now.getMinutes();
  const open = windows(profile.hours, day).find((w) => at >= w.from && at < w.to);
  if (open) {
    // A window written 09:00-09:00 is the whole day; saying it closes at nine
    // in the morning would be true of no hour of it.
    if (open.to - open.from >= 1440) return { key: 'status.open24' };
    return { key: 'status.open', at: fromMinutes(open.to) };
  }

  const next = nextOpening(profile.hours, day, at);
  if (!next) return { key: 'status.closed' };
  return next.days === 0
    ? { key: 'status.closedtoday', at: fromMinutes(next.from) }
    : { key: 'status.closeduntil', at: fromMinutes(next.from), day: next.day };
}

/** The first window starting at or after `at` on `day`, up to a week out. */
function nextOpening(hours, day, at) {
  for (let ahead = 0; ahead < 8; ahead += 1) {
    const which = (day + ahead) % 7;
    const starts = windows(hours, which)
      .filter((w) => w.from >= 0 && (ahead > 0 || w.from > at))
      .sort((a, b) => a.from - b.from);
    if (starts.length) return { days: ahead, day: which, from: starts[0].from };
  }
  return null;
}

/** Minutes from midnight back to `HH:MM`, wrapping past a day's end. */
function fromMinutes(total) {
  const within = ((total % 1440) + 1440) % 1440;
  const hour = Math.floor(within / 60);
  return `${String(hour).padStart(2, '0')}:${String(within % 60).padStart(2, '0')}`;
}

/**
 * A time as a listing writes it: `9 AM`, `9:30 PM`, or `21:30` on a 24-hour
 * clock. The meridiem strings come from the caller, because "AM" is not "AM"
 * in every language this site is published in.
 */
export function showTime(value, clockKind, am, pm) {
  const at = clock(value);
  if (!at) return '';
  const hour = Number(at.slice(0, 2));
  const minute = at.slice(3);
  if (clockKind === '24') return at;
  const suffix = hour < 12 ? am : pm;
  const shown = hour % 12 === 0 ? 12 : hour % 12;
  return minute === '00' ? `${shown} ${suffix}` : `${shown}:${minute} ${suffix}`;
}

/** The website as a listing shows it: no scheme, no `www.`, no trailing slash. */
export function showHost(website) {
  return String(website || '')
    .trim()
    .replace(/^[a-z][a-z0-9+.-]*:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/+$/, '');
}

/** The attributes box, as the list of chips it stands for. */
export function attributeList(profile) {
  return String(profile.attributes || '')
    .split(/[,\n]/)
    .map((one) => one.trim())
    .filter(Boolean)
    .slice(0, 6);
}

/** A review count with the thousands separators a listing prints. */
export function showCount(reviews) {
  if (reviews === '') return '';
  return Number(reviews).toLocaleString();
}
