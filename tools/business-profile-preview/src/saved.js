/**
 * A profile as a file: what this page writes, and the two shapes it will read.
 *
 * WHY IT READS GOOGLE'S OWN SHAPE AS WELL AS ITS OWN
 *
 * The Business Profile API hands a location back as JSON - `title`,
 * `storefrontAddress`, `regularHours.periods` - and anybody who can export
 * their profile at all has that shape rather than this one. Reading it costs
 * about sixty lines and turns "type it all in again" into "drop the export in",
 * which is the difference between a preview tool and a form.
 *
 * It is read defensively and never trusted: every field goes through
 * profile.js's `normalise` afterwards, so a hostile or simply wrong file lands
 * as an ordinary empty profile rather than as an exception halfway through a
 * draw. The `photo` field is the one that matters there - it becomes an href
 * inside a downloadable SVG, and only an image this page's own canvas produced
 * survives that check.
 *
 * WHY THE SAVED FILE IS NOT JUST THE FIELDS
 *
 * It carries a version and a name. A file with neither is a file that cannot
 * be told from somebody else's, and this one has to survive being emailed
 * round an office and opened six months later.
 */

import { DAY_KEYS, empty, normalise } from './profile.js';

/** What this page writes at the top of a saved profile. */
export const FORMAT = 'abox.tools/business-profile-preview';
export const VERSION = 1;

/** A profile as the file it downloads as. */
export function toJson(profile) {
  return `${JSON.stringify({ format: FORMAT, version: VERSION, profile }, null, 2)}\n`;
}

/**
 * A profile out of a file, whichever of the two shapes it is in.
 *
 * @param {string} text
 * @returns {{profile: object, shape: 'own'|'google'}}
 * @throws {Error} with a phrase key, never a sentence
 */
export function fromJson(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('load.notjson');
  }
  if (!parsed || typeof parsed !== 'object') throw new Error('load.notjson');

  if (parsed.format === FORMAT && parsed.profile) {
    return { profile: normalise(parsed.profile), shape: 'own' };
  }

  // An export may be one location or a page of them; the first is the one
  // somebody meant, and a page of forty would be a different tool.
  const location = Array.isArray(parsed.locations) ? parsed.locations[0] : parsed;
  if (location && typeof location === 'object'
      && (location.title || location.storefrontAddress || location.categories)) {
    return { profile: normalise(fromLocation(location)), shape: 'google' };
  }

  // Nothing recognised the file, but a flat object of the right field names is
  // still worth reading: somebody hand-writing one should not have to know the
  // wrapper.
  if (typeof parsed.name === 'string' || typeof parsed.category === 'string') {
    return { profile: normalise(parsed), shape: 'own' };
  }

  throw new Error('load.unknown');
}

/** The Business Profile API's `Location`, in the fields this page draws. */
function fromLocation(location) {
  const profile = empty();
  const address = location.storefrontAddress ?? {};

  profile.name = string(location.title);
  profile.category = string(location.categories?.primaryCategory?.displayName);
  profile.address = [
    ...(Array.isArray(address.addressLines) ? address.addressLines : []),
    address.locality,
    [address.administrativeArea, address.postalCode].filter(Boolean).join(' '),
  ].map(string).filter(Boolean).join(', ');
  profile.serviceArea = Boolean(location.serviceArea) && !profile.address;
  profile.phone = string(location.phoneNumbers?.primaryPhone);
  profile.website = string(location.websiteUri);
  profile.description = string(location.profile?.description);

  const status = string(location.openInfo?.status).toUpperCase();
  if (status === 'CLOSED_PERMANENTLY') profile.status = 'permanent';
  else if (status === 'CLOSED_TEMPORARILY') profile.status = 'temporary';

  const week = fromPeriods(location.regularHours?.periods);
  if (week) profile.hours = week;
  return profile;
}

/**
 * `regularHours.periods` as the seven days this page keeps.
 *
 * A period names its own day, and a day with no period is shut - which is the
 * opposite of the paste importer's rule, and correct here for the reason it is
 * wrong there: this file is a record rather than a rendering, so a day missing
 * from it means the place is closed rather than that nobody copied it.
 */
function fromPeriods(periods) {
  if (!Array.isArray(periods) || !periods.length) return null;
  const week = DAY_KEYS.map(() => ({ closed: true, open: '09:00', close: '17:00' }));

  for (const period of periods) {
    const day = DAY_KEYS.indexOf(String(period?.openDay ?? '').toLowerCase().slice(0, 3));
    if (day < 0) continue;
    week[day] = {
      closed: false,
      open: hhmm(period.openTime) ?? '00:00',
      close: hhmm(period.closeTime) ?? '00:00',
    };
  }
  return week;
}

/** `{hours: 9, minutes: 30}`, in which either half may simply be absent. */
function hhmm(time) {
  if (!time || typeof time !== 'object') return null;
  const hour = Number(time.hours ?? 0);
  const minute = Number(time.minutes ?? 0);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
  if (hour < 0 || hour > 24 || minute < 0 || minute > 59) return null;
  // The API writes the end of a day as hour 24; this page writes it as 00:00,
  // which profile.js reads as a window that runs to midnight.
  return `${String(hour % 24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

const string = (value) => (typeof value === 'string' ? value.trim() : '');
