/**
 * Reading a date and an amount off a statement, whoever wrote it.
 *
 * The two hard parts of this file are both the same problem: the notation on a
 * statement is not self-describing, and the same characters mean different
 * things depending on who printed them. `1.240,00` and `1,240.00` are the same
 * money; `03/04/2026` is two different days. Neither can be settled one value
 * at a time.
 *
 * So nothing here guesses from a single string. Each convention is decided
 * once for the whole document by `decimalMark` and `dateOrder` below, from
 * every value on every page, and then applied. A statement is internally
 * consistent even when the world is not, which is what makes that work: one
 * row somewhere in it that says 31 settles the order for all the rest.
 *
 * WHAT IS DELIBERATELY NOT DONE
 *
 * No currency is recognised beyond stripping its symbol, because a statement
 * is in one currency and saying which is the account's business rather than
 * this tool's. No time zones, no locale-aware month names beyond the English
 * ones a statement in Latin script actually prints - a month spelled in a
 * language this cannot read simply fails to parse, and a column of failures is
 * reported as a column this tool could not read rather than quietly mangled.
 */

/** Symbols that sit against an amount and are not part of the number. */
const CURRENCY = /[$£€¥₹₽¢₩₪₫₴₦₱฿]/g;

/** Spaces that are not the space bar: a statement grouping thousands uses
 *  these as often as it uses a plain one. */
const THIN_SPACES = /[    ]/g;

const MONTHS = new Map(Object.entries({
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
}));

/**
 * A number with an optional sign and separators - what an amount looks like
 * before anything has been decided about which separator means what.
 *
 * The sign is allowed at either end, which is not decoration: plenty of
 * statements write a debit as `40.00-`, and a shape this did not admit would
 * be a whole amount column never offered to the arithmetic in check.js, on
 * exactly the statements whose debits matter most.
 */
const NUMERIC = /^(?:[-+(]|(?:CR|DR)\s)?\s*\d[\d.,\s]*\d?\s*[-)]?\s*(?:CR|DR)?\.?$/i;

/**
 * Does this cell look like money at all?
 *
 * Deliberately loose. It decides which cells are *offered* to the arithmetic,
 * and a cell wrongly offered costs one failed parse, while a cell wrongly held
 * back costs a column the tool then cannot check a balance against.
 */
export function looksNumeric(text) {
  const trimmed = String(text).replace(CURRENCY, '').replace(THIN_SPACES, ' ').trim();
  return trimmed.length > 0 && /\d/.test(trimmed) && NUMERIC.test(trimmed);
}

/**
 * Which character this document uses for the decimal point.
 *
 * Three kinds of evidence, in descending order of how much they prove:
 *
 *   - a value with both separators settles it outright - the last one is the
 *     decimal point, because no notation groups digits after the point;
 *   - a value ending in a separator and exactly two digits is a decimal point,
 *     which is what almost every amount on a statement looks like;
 *   - a value ending in a separator and exactly three digits is a *grouping*
 *     separator, so the evidence is for the other character. Weakest of the
 *     three, because a round thousand is spelled that way in both notations.
 *
 * @param {string[]} samples every cell that looks numeric
 * @returns {'.'|','}
 */
export function decimalMark(samples) {
  let dot = 0;
  let comma = 0;

  for (const sample of samples) {
    const text = String(sample).replace(CURRENCY, '').replace(THIN_SPACES, '').trim();
    const lastDot = text.lastIndexOf('.');
    const lastComma = text.lastIndexOf(',');

    if (lastDot >= 0 && lastComma >= 0) {
      if (lastDot > lastComma) dot += 4; else comma += 4;
      continue;
    }

    const tail = /([.,])(\d+)$/.exec(text);
    if (!tail) continue;
    if (tail[2].length === 2) {
      if (tail[1] === '.') dot += 3; else comma += 3;
    } else if (tail[2].length === 3) {
      if (tail[1] === '.') comma += 1; else dot += 1;
    }
  }

  return comma > dot ? ',' : '.';
}

/**
 * One amount as a number, or null when the cell is not one.
 *
 * The sign is the part worth reading twice. A statement may write a debit as
 * `-40.00`, `40.00-`, `(40.00)` or `40.00 DR`, and all four appear in the
 * wild; `CR` is written on credits by the same statements that write `DR`, so
 * it is recognised and means the sign is left alone rather than ignored.
 */
export function parseAmount(text, mark = '.') {
  let value = String(text).replace(CURRENCY, '').replace(THIN_SPACES, ' ').trim();
  if (!value) return null;

  let sign = 1;

  if (value.startsWith('(') && value.endsWith(')')) {
    sign = -sign;
    value = value.slice(1, -1).trim();
  }

  const marker = /(?:^(CR|DR)\b\.?|\b(CR|DR)\.?$)/i.exec(value);
  if (marker) {
    if ((marker[1] ?? marker[2]).toUpperCase() === 'DR') sign = -sign;
    value = value.replace(marker[0], '').trim();
  }

  if (value.startsWith('-')) {
    sign = -sign;
    value = value.slice(1).trim();
  } else if (value.endsWith('-')) {
    sign = -sign;
    value = value.slice(0, -1).trim();
  } else if (value.startsWith('+')) {
    value = value.slice(1).trim();
  }

  const grouping = mark === '.' ? ',' : '.';
  value = value.split(grouping).join('').split(' ').join('');
  if (mark === ',') value = value.replace(',', '.');

  if (!/^\d+(?:\.\d+)?$/.test(value)) return null;
  const number = Number(value);
  return Number.isFinite(number) ? sign * number : null;
}

/** A month by name and a day beside it, in either order, with no year - the
 *  way a card statement writes every date on it. */
const PARTIAL_DATE = /^(?:(\d{1,2})[\s-]([A-Za-z]{3,9})\.?|([A-Za-z]{3,9})\.?\s(\d{1,2}))$/;

const PERCENT = /^[-+(]?\d[\d.,\s]*%\)?$/;

/**
 * Does this read as a date at all, year or no year?
 *
 * Only ever asked in order to tell a row of data from a row of headings, never
 * to rewrite anything: a date with no year is left exactly as it was written,
 * because the year it belongs to is a guess, and a converter has no business
 * putting a guess in somebody's spreadsheet.
 */
export function looksLikeDate(text) {
  const value = String(text).trim();
  if (parseDate(value) !== null) return true;
  if (/^\d{1,2}[/.-]\d{1,2}$/.test(value)) return true;
  const partial = PARTIAL_DATE.exec(value);
  if (!partial) return false;
  const name = (partial[2] ?? partial[3]).toLowerCase();
  return MONTHS.has(name.slice(0, 4)) || MONTHS.has(name.slice(0, 3));
}

/**
 * Is this a value - a number, a percentage, a date - rather than a word?
 *
 * What tells a table's headings from its rows: headings are words, and the
 * first line with a value in it is where the data starts.
 */
export function isValue(text) {
  const value = String(text).trim();
  return value !== '' && (looksNumeric(value) || PERCENT.test(value) || looksLikeDate(value));
}

/**
 * Is this data rather than a word of a heading?
 *
 * Wider than a value. A phone number, an account number and an invoice
 * reference are none of them numbers anyone would add up, and all of them are
 * rows rather than headings - a contact list or an account box read its first
 * rows as a stacked heading before this. A run of three digits or more says
 * data, unless it is a year: "Total on May 15, 2025" is a heading, and so is
 * a column called 2024.
 */
export function isData(text) {
  const value = String(text).trim();
  // Checked before anything that parses it as a number, which a bare year also
  // is: an annual report's columns are headed 2023 and 2024, and a table whose
  // headings read as data has no headings at all.
  if (/^(?:19|20)\d\d$/.test(value)) return false;
  if (isValue(value)) return true;
  return (value.match(/\d{3,}/g) ?? []).some((digits) => !/^(?:19|20)\d\d$/.test(digits));
}

/** An amount as a spreadsheet wants it: a plain signed decimal, point first,
 *  no grouping, and the cents kept even when they are zero. */
export function formatAmount(value) {
  return value.toFixed(2);
}

/** The three numbers in a written date, whatever separated them. */
function dateParts(text) {
  const value = String(text).trim().replace(/,/g, ' ').replace(/\s+/g, ' ');

  const iso = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(value);
  if (iso) return { year: +iso[1], a: +iso[2], b: +iso[3], known: 'ymd' };

  const named = /^(\d{1,2})[-\s]([A-Za-z]{3,9})\.?[-\s](\d{2,4})$/.exec(value);
  if (named) {
    const month = MONTHS.get(named[2].toLowerCase().slice(0, 4))
      ?? MONTHS.get(named[2].toLowerCase().slice(0, 3));
    if (month) return { year: +named[3], a: month, b: +named[1], known: 'named' };
  }

  const leading = /^([A-Za-z]{3,9})\.?[-\s](\d{1,2})[-\s](\d{2,4})$/.exec(value);
  if (leading) {
    const month = MONTHS.get(leading[1].toLowerCase().slice(0, 4))
      ?? MONTHS.get(leading[1].toLowerCase().slice(0, 3));
    if (month) return { year: +leading[3], a: month, b: +leading[2], known: 'named' };
  }

  const numeric = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/.exec(value);
  if (numeric) return { year: +numeric[3], a: +numeric[1], b: +numeric[2], known: null };

  return null;
}

/** Two digits mean this century until that would be more than thirty years
 *  ahead, which no statement is. */
function fullYear(year) {
  if (year >= 100) return year;
  return year <= 68 ? 2000 + year : 1900 + year;
}

function valid(year, month, day) {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const at = new Date(Date.UTC(year, month - 1, day));
  return at.getUTCMonth() === month - 1 && at.getUTCDate() === day;
}

/**
 * Is there any date here whose reading depends on the convention?
 *
 * A statement written in ISO, or with its months spelled out, says which way
 * round it is on every row - so there is nothing to decide and nothing to ask
 * about. The page uses this to leave the control out entirely rather than
 * offer a choice that would change nothing.
 */
export function hasAmbiguousDates(samples) {
  return samples.some((sample) => {
    const parts = dateParts(sample);
    return parts !== null && parts.known === null;
  });
}

/**
 * Which way round this document writes a numeric date.
 *
 * A day above twelve cannot be a month, so one such row anywhere settles the
 * whole document. When no row has one - a statement covering only the first
 * twelve days of a month - there is nothing in the file that could tell them
 * apart, and this returns null so the page can ask rather than choose.
 *
 * @returns {'dmy'|'mdy'|null}
 */
export function dateOrder(samples) {
  let dayFirst = 0;
  let monthFirst = 0;

  for (const sample of samples) {
    const parts = dateParts(sample);
    if (!parts || parts.known) continue;
    if (parts.a > 12) dayFirst += 1;
    else if (parts.b > 12) monthFirst += 1;
  }

  if (dayFirst && !monthFirst) return 'dmy';
  if (monthFirst && !dayFirst) return 'mdy';
  return null;
}

/**
 * One date as `YYYY-MM-DD`, or null when the cell is not one.
 *
 * @param {string} text
 * @param {'dmy'|'mdy'} order  what to do with a numeric date that could be read
 *   either way; ignored by the forms that say which is which themselves.
 */
export function parseDate(text, order = 'dmy') {
  const parts = dateParts(text);
  if (!parts) return null;

  let year = fullYear(parts.year);
  let month;
  let day;

  if (parts.known === 'ymd' || parts.known === 'named') {
    month = parts.a;
    day = parts.b;
  } else if (order === 'mdy') {
    month = parts.a;
    day = parts.b;
  } else {
    month = parts.b;
    day = parts.a;
  }

  if (!valid(year, month, day)) return null;
  const pad = (n) => String(n).padStart(2, '0');
  return `${year}-${pad(month)}-${pad(day)}`;
}
