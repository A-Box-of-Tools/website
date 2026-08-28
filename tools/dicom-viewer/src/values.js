/**
 * An element's bytes as a value, and a value as something a person can read.
 *
 * These are two different jobs and both live here because they share one awkward
 * fact: what the bytes mean depends on the value representation, and there are
 * thirty-four of them.
 *
 * `values()` is the machine half. It answers with numbers where the VR is a
 * number and strings where it is text, and it is what pixels.js, series.js and
 * the window/level code read the header through. Nothing downstream of it
 * parses a string.
 *
 * `display()` is the reading half, and it is allowed to be opinionated:
 * `19750314` is shown as `14 March 1975`, `DOE^JANE^A` as `Jane A Doe`, and a
 * transfer syntax UID as its name. The raw form is never thrown away - the tag
 * table shows it on the row - because a viewer that quietly improves a value is
 * a viewer you cannot check against another tool.
 *
 * THE CHARACTER SET IS A VALUE INSIDE THE FILE
 *
 * (0008,0005) says which encoding the text is in, and the default when it is
 * absent is plain ASCII. Nearly every non-English file in existence declares
 * either ISO_IR 100, which is Latin-1, or ISO_IR 192, which is UTF-8. Decoding
 * a Latin-1 name as UTF-8 turns an accented letter into a replacement
 * character and there is no getting it back, so the set is read first and
 * everything else is decoded through it.
 */

import { uidName } from './uids.js';

/** VRs whose value is text. Everything else is bytes with a number in it. */
const TEXT = new Set(['AE', 'AS', 'CS', 'DA', 'DS', 'DT', 'IS', 'LO', 'LT',
  'PN', 'SH', 'ST', 'TM', 'UC', 'UI', 'UR', 'UT']);

/**
 * The four text VRs that may not be split on a backslash.
 *
 * A backslash separates values in every other string VR. In these four it is a
 * backslash: they hold free text, and a line of a radiologist's comment that
 * happens to contain one is not two values.
 */
const SINGLE = new Set(['LT', 'ST', 'UT', 'UR']);

/** VRs holding numbers, and how wide each one is. */
const NUMERIC = {
  US: ['getUint16', 2], SS: ['getInt16', 2],
  UL: ['getUint32', 4], SL: ['getInt32', 4],
  FL: ['getFloat32', 4], FD: ['getFloat64', 8],
  OL: ['getUint32', 4], OF: ['getFloat32', 4], OD: ['getFloat64', 8],
};

/**
 * The TextDecoder for a file, from its declared character set.
 *
 * Only the single-byte sets and UTF-8 are handled by name. The ISO 2022
 * escape-sequence sets - which is how Japanese and Korean names are written in
 * DICOM - switch encoding mid-string with escape codes no TextDecoder
 * implements, so the first component is used and the page says the name may be
 * approximate rather than showing mojibake without comment.
 */
export function charset(declared) {
  const first = String(declared ?? '').split('\\')[0].trim().toUpperCase();
  const label = {
    '': 'windows-1252',
    'ISO_IR 6': 'windows-1252',
    'ISO_IR 100': 'iso-8859-1',
    'ISO_IR 101': 'iso-8859-2',
    'ISO_IR 109': 'iso-8859-3',
    'ISO_IR 110': 'iso-8859-4',
    'ISO_IR 126': 'iso-8859-7',
    'ISO_IR 127': 'iso-8859-6',
    'ISO_IR 138': 'iso-8859-8',
    'ISO_IR 144': 'iso-8859-5',
    'ISO_IR 148': 'iso-8859-9',
    'ISO_IR 166': 'windows-874',
    'ISO_IR 192': 'utf-8',
    GB18030: 'gb18030',
    GBK: 'gbk',
  }[first] ?? 'windows-1252';

  try {
    return new TextDecoder(label);
  } catch {
    return new TextDecoder('windows-1252');
  }
}

/**
 * The values of one element, as an array.
 *
 * Always an array, even for the one-value case, because DICOM's value
 * multiplicity is a property of the tag rather than of the file: Window Center
 * is one number in a CT and two in a chest radiograph that ships a soft-tissue
 * and a bone window, and code that special-cases the single value is code that
 * breaks on the second file.
 */
export function values(element, decoder) {
  const { vr, value } = element;
  if (!value) return [];

  if (vr === 'AT') {
    // A tag as a value: two 16-bit numbers, which read as a tag rather than as
    // the 32-bit integer their bytes would make.
    const out = [];
    const view = new DataView(value.buffer, value.byteOffset, value.byteLength);
    for (let at = 0; at + 4 <= value.length; at += 4) {
      const group = view.getUint16(at, element.little ?? true);
      const number = view.getUint16(at + 2, element.little ?? true);
      out.push(`(${hex4(group)},${hex4(number)})`.toUpperCase());
    }
    return out;
  }

  const numeric = NUMERIC[vr];
  if (numeric) {
    const [read, width] = numeric;
    const view = new DataView(value.buffer, value.byteOffset, value.byteLength);
    const out = [];
    for (let at = 0; at + width <= value.length; at += width) {
      out.push(view[read](at, element.little ?? true));
    }
    return out;
  }

  if (!TEXT.has(vr)) return [];

  const text = trim(decoder.decode(value));
  if (SINGLE.has(vr)) return [text];

  const parts = text.split('\\');
  if (vr === 'DS' || vr === 'IS') {
    return parts.map((part) => {
      const number = Number(part.trim());
      // A DS that is not a number is left as the string it was. Files exist
      // where a slice location is `n/a`, and NaN in a geometry field would
      // silently move a slice to the wrong end of a stack.
      return part.trim() !== '' && Number.isFinite(number) ? number : part.trim();
    });
  }
  return parts;
}

/**
 * The first value, as a number, or null.
 *
 * The header is read through this everywhere a single number is wanted, which
 * is most places. It accepts both the numeric VRs and the string ones, because
 * Rows is a US and Rescale Slope is a DS and the caller should not have to know
 * which.
 */
export function number(dataset, tag, decoder, fallback = null) {
  const element = dataset?.byTag.get(tag);
  if (!element) return fallback;
  const first = values(element, decoder)[0];
  if (typeof first === 'number') return first;
  const parsed = Number(String(first ?? '').trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Every value of a tag, as numbers, dropping anything that is not one. */
export function numbers(dataset, tag, decoder) {
  const element = dataset?.byTag.get(tag);
  if (!element) return [];
  return values(element, decoder)
    .map((value) => (typeof value === 'number' ? value : Number(String(value).trim())))
    .filter((value) => Number.isFinite(value));
}

/** The first value as trimmed text, or an empty string. */
export function text(dataset, tag, decoder) {
  const element = dataset?.byTag.get(tag);
  if (!element) return '';
  const first = values(element, decoder)[0];
  return first === undefined ? '' : String(first).trim();
}

/**
 * Trailing padding, gone.
 *
 * A DICOM value is padded to an even length: text with a space, and UI with a
 * null. Leaving either on turns a comparison against a UID into a comparison
 * that fails for a reason nobody can see.
 */
const trim = (value) => value.replace(/[\0\s]+$/, '');

const hex4 = (value) => value.toString(16).padStart(4, '0');

/* ----------------------------------------------------- the reading half */

/**
 * One element's value, written out for a person.
 *
 * Returns both halves: `shown` is what the row displays, and `raw` is what the
 * file holds, which the row shows underneath when the two differ. That pair is
 * the whole design. A viewer that shows only the tidied form cannot be checked
 * against anything, and one that shows only the raw form is a hex dump.
 */
export function display(element, decoder, t) {
  const { vr } = element;

  if (element.items) {
    const count = element.items.length;
    return { shown: count === 1 ? '1 item' : `${count} items`, raw: '', sequence: true };
  }
  if (element.fragments) {
    const total = element.fragments.reduce((sum, part) => sum + part.length, 0);
    const count = element.fragments.length;
    return {
      shown: t(count === 1 ? 'value.fragment.one' : 'value.fragment.many',
        { n: count, bytes: total.toLocaleString() }),
      raw: '',
    };
  }
  if (!element.value) {
    return {
      shown: t('value.notshown', { bytes: element.length.toLocaleString() }),
      raw: '',
    };
  }

  const list = values(element, decoder);
  if (list.length === 0) {
    return {
      shown: element.length === 0 ? t('value.empty') : binary(element, t),
      raw: '',
    };
  }

  const raw = TEXT.has(vr) ? trim(decoder.decode(element.value)) : '';
  const shown = list.map((value) => pretty(vr, value, t)).join(' \\ ');
  return { shown, raw: shown === raw ? '' : raw };
}

/** Bytes with no readable form: the first of them, and how many there are. */
function binary(element, t) {
  const head = Array.from(element.value.subarray(0, 16))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join(' ');
  return t(element.value.length > 16 ? 'value.bytes.more' : 'value.bytes', {
    bytes: element.length.toLocaleString(),
    head,
  });
}

function pretty(vr, value, t) {
  if (vr === 'DA') return date(String(value)) ?? String(value);
  if (vr === 'TM') return time(String(value)) ?? String(value);
  if (vr === 'DT') return dateTime(String(value)) ?? String(value);
  if (vr === 'PN') return personName(String(value));
  if (vr === 'AS') return age(String(value), t) ?? String(value);
  if (vr === 'UI') {
    const name = uidName(trim(String(value)));
    return name ? `${name} (${trim(String(value))})` : trim(String(value));
  }
  if (vr === 'CS') return code(String(value), t);
  return String(value);
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];

/** `YYYYMMDD` as a date. PS3.5 allows the old `YYYY.MM.DD` too, and files use it. */
export function date(value) {
  const digits = value.replace(/[.\s]/g, '');
  if (!/^\d{8}$/.test(digits)) return null;
  const year = Number(digits.slice(0, 4));
  const month = Number(digits.slice(4, 6));
  const day = Number(digits.slice(6, 8));
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

/** `HHMMSS.FFFFFF`, to the second. The fraction is kept where the file has one. */
export function time(value) {
  const digits = value.replace(/[:\s]/g, '');
  if (!/^\d{2}(\d{2}(\d{2}(\.\d+)?)?)?$/.test(digits)) return null;
  const hour = digits.slice(0, 2);
  const minute = digits.slice(2, 4) || '00';
  const second = digits.slice(4, 6) || '00';
  const fraction = digits.includes('.') ? digits.slice(digits.indexOf('.')) : '';
  return `${hour}:${minute}:${second}${fraction}`;
}

/** `YYYYMMDDHHMMSS`, with an optional offset this deliberately keeps as written. */
export function dateTime(value) {
  const clean = value.trim();
  const match = /^(\d{8})(\d{2})?(\d{2})?(\d{2})?/.exec(clean);
  if (!match) return null;
  const day = date(match[1]);
  if (!day) return null;
  if (!match[2]) return day;
  return `${day}, ${match[2]}:${match[3] ?? '00'}:${match[4] ?? '00'}`;
}

/**
 * `Family^Given^Middle^Prefix^Suffix` as a name.
 *
 * The five components are positional and any of them may be empty, which is why
 * this is a join of what is there rather than a template. The other two
 * component groups a PN can carry - an ideographic and a phonetic
 * representation, separated by `=` - are kept and shown after the alphabetic
 * one, because for a Japanese name the second group is the name.
 */
export function personName(value) {
  return String(value).split('=').map((group) => {
    const [family = '', given = '', middle = '', prefix = '', suffix = ''] = group.split('^');
    const parts = [prefix, given, middle, family, suffix].map((part) => part.trim());
    const joined = parts.filter(Boolean).join(' ');
    return joined || group.trim();
  }).filter(Boolean).join(' — ');
}

/** `045Y` as `45 years`, which is the only form the VR allows. */
export function age(value, t) {
  const match = /^(\d{3})([DWMY])$/.exec(value.trim().toUpperCase());
  if (!match) return null;
  const count = Number(match[1]);
  // Eight whole phrases rather than a noun with an `s` on it: a language
  // whose plural is not a suffix cannot be served by appending one.
  const unit = { D: 'day', W: 'week', M: 'month', Y: 'year' }[match[2]];
  return t(`age.${unit}.${count === 1 ? 'one' : 'many'}`, { n: count });
}

/**
 * The handful of coded values worth spelling out.
 *
 * Deliberately short. A CS holds a code from a table in PS3.16 and there are
 * thousands of them; expanding the ones a viewer's own controls depend on -
 * what the picture is, which way round it is - is useful, and expanding the
 * rest would be a dictionary of its own that went out of date.
 */
// The code itself is the standard's and is the same everywhere; the gloss
// after it is this tool's own, so each entry is a phrase key and the phrase
// carries both. RGB needs no gloss and so needs no key.
const CODES = {
  MONOCHROME1: 'code.monochrome1',
  MONOCHROME2: 'code.monochrome2',
  'PALETTE COLOR': 'code.palette',
  'YBR_FULL': 'code.ybrfull',
  'YBR_FULL_422': 'code.ybr422',
  HFS: 'code.hfs',
  HFP: 'code.hfp',
  FFS: 'code.ffs',
  FFP: 'code.ffp',
  M: 'code.male',
  F: 'code.female',
  O: 'code.other',
};

const code = (value, t) => {
  const clean = String(value).trim();
  const key = CODES[clean.toUpperCase()];
  return key ? t(key) : clean;
};
