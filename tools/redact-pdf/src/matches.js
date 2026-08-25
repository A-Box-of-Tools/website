/**
 * Finding the things worth taking out.
 *
 * Two ways in, because people arrive at a redaction from two directions. One
 * knows the word - a name, an address, a reference number - and wants every
 * occurrence of it in a forty-page bundle. The other does not know what is in
 * the document and wants to be shown the things that are usually sensitive
 * before they send it.
 *
 * WHAT A PATTERN IS AND IS NOT
 *
 * The finders below are patterns with arithmetic behind them where arithmetic
 * exists: a card number has a check digit and an IBAN has a checksum, so those
 * two can be told from a run of digits that merely looks like one. A telephone
 * number cannot - there is nothing about "0161 496 0000" that distinguishes it
 * from a reference or a badly formatted date, and any tool claiming otherwise
 * is guessing.
 *
 * So none of this decides anything. Every match is listed with the words
 * around it and a box to tick, nothing is ticked by a pattern alone, and the
 * page says as much. A redaction tool that quietly redacted what it thought
 * was a phone number would be doing the one thing worse than missing one.
 */

/** Letters and digits in any script, for deciding where a word ends. */
const WORD = /[\p{L}\p{N}_]/u;

/**
 * The patterns, in the order they are offered.
 *
 * Each `find` hands back character ranges into a page's text. `confirm` is the
 * arithmetic, where the format has any - it runs after the pattern matches and
 * before the match is offered.
 */
export const FINDERS = [
  {
    id: 'email',
    pattern: /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.[\p{L}]{2,}/gu,
  },
  {
    id: 'card',
    // Thirteen to nineteen digits, in the groups a card is printed in.
    pattern: /\b(?:\d[ -]?){12,18}\d\b/g,
    confirm: (text) => luhn(text.replace(/\D/g, '')),
  },
  {
    id: 'iban',
    pattern: /\b[A-Z]{2}\d{2}(?:[ ]?[A-Z0-9]{4}){2,7}(?:[ ]?[A-Z0-9]{1,3})?\b/g,
    confirm: (text) => mod97(text.replace(/\s/g, '')),
  },
  {
    id: 'nationalid',
    // A United States social security number, and a United Kingdom national
    // insurance number, which are the two written on forms people send on.
    pattern: /\b(?:\d{3}-\d{2}-\d{4}|[A-CEGHJ-PR-TW-Z]{2}[ ]?(?:\d{2}[ ]?){3}[A-D])\b/g,
  },
  {
    id: 'phone',
    pattern: /(?:\+\d{1,3}[ .-]?)?(?:\(\d{1,5}\)[ .-]?)?\d{2,5}(?:[ .-]\d{2,6}){1,4}/g,
    confirm: (text) => {
      const digits = text.replace(/\D/g, '').length;
      return digits >= 7 && digits <= 15;
    },
  },
];

/**
 * Every occurrence of a pattern in one page's text.
 *
 * @param {string} text
 * @param {string} id  which of FINDERS
 * @returns {{from: number, to: number}[]}
 */
export function findPattern(text, id) {
  const finder = FINDERS.find((item) => item.id === id);
  if (!finder) return [];

  const found = [];
  const pattern = new RegExp(finder.pattern.source, finder.pattern.flags);

  for (const match of text.matchAll(pattern)) {
    const value = match[0];
    if (finder.confirm && !finder.confirm(value)) continue;
    // A pattern that swallowed a trailing separator would take the space after
    // a name with it, which reads as a mistake in the list of matches.
    const trimmed = value.replace(/[\s.,;:]+$/, '');
    if (!trimmed) continue;
    found.push({ from: match.index, to: match.index + trimmed.length });
  }

  return found;
}

/**
 * Every occurrence of a word or phrase.
 *
 * The one liberty taken with what was typed: a space in the search stands for
 * any amount of whitespace in the document, including none. A PDF does not
 * store the spaces between words - it moves the pen and lets the gap be the
 * space - so "John Smith" can arrive as two words on one line, as two words
 * either side of a line break, or with no gap wide enough to have been read as
 * a space at all. Somebody typing a name should not have to know which.
 *
 * Nothing else is loosened. A search with no space in it will not match across
 * one, because "in voice" is not a match for "invoice" and a tool that ticked
 * it by default would be removing a word nobody asked about.
 *
 * @param {string} text
 * @param {string} term
 * @param {{matchCase?: boolean, wholeWord?: boolean}} how
 */
export function findTerm(text, term, { matchCase = false, wholeWord = false } = {}) {
  const needle = term.trim();
  if (!needle) return [];

  const pattern = needle
    .split(/\s+/)
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('\\s*');

  const found = [];
  const search = new RegExp(pattern, matchCase ? 'g' : 'gi');

  for (const match of text.matchAll(search)) {
    const from = match.index;
    const to = from + match[0].length;
    if (!match[0]) break;
    if (wholeWord && !standsAlone(text, from, to)) continue;
    found.push({ from, to });
  }

  return found;
}

function standsAlone(text, from, to) {
  const before = text[from - 1];
  const after = text[to];
  return !(before && WORD.test(before)) && !(after && WORD.test(after));
}

/**
 * The words of a page, so that one can be clicked rather than typed.
 *
 * Split on whitespace within each line, which is how the text was assembled -
 * a "word" here is a run of characters with no gap in it, which is what
 * somebody pointing at the page means by one.
 */
export function wordsOf(page) {
  const words = [];

  for (const line of page.lines) {
    let start = -1;
    for (let at = line.from; at <= line.to; at += 1) {
      const character = at < line.to ? page.text[at] : ' ';
      if (/\s/.test(character)) {
        if (start >= 0) {
          words.push({ from: start, to: at, text: page.text.slice(start, at) });
          start = -1;
        }
      } else if (start < 0) {
        start = at;
      }
    }
  }

  return words;
}

/**
 * The glyphs a range of characters was drawn by.
 *
 * One glyph can stand behind several characters - a ligature copies as "fi"
 * and is one mark on the paper - so touching either character removes the
 * glyph and both characters with it. That is the honest answer: half a
 * ligature cannot be removed, and leaving it would leave half the word.
 *
 * The same rule, one level up, applies to a marked span. Where a document says
 * "these glyphs spell Smith", the text came from the span rather than from the
 * glyphs, so touching any of it takes every glyph the span covers.
 */
export function glyphsIn(page, from, to) {
  const found = new Set();

  for (let at = from; at < to && at < page.owner.length; at += 1) {
    const index = page.owner[at];
    if (index < 0) continue;
    found.add(index);

    const group = page.glyphs[index]?.group;
    if (group === null || group === undefined) continue;
    for (const sibling of page.groups.get(group) ?? []) found.add(sibling);
  }

  return found;
}

/** The line a character sits on, with the match marked, for the list of hits. */
export function contextOf(page, from, to) {
  const line = page.lines.find((item) => from >= item.from && from <= item.to)
    ?? { from: Math.max(0, from - 40), to: Math.min(page.text.length, to + 40) };

  return {
    before: page.text.slice(line.from, from),
    hit: page.text.slice(from, to),
    after: page.text.slice(to, line.to),
  };
}

/**
 * Merge ranges that touch, so that a phone number found by two patterns, or a
 * term inside another term, is one entry rather than two overlapping ones.
 */
export function mergeRanges(ranges) {
  const ordered = [...ranges].sort((a, b) => a.from - b.from || a.to - b.to);
  const out = [];

  for (const range of ordered) {
    const last = out[out.length - 1];
    if (last && range.from <= last.to) last.to = Math.max(last.to, range.to);
    else out.push({ ...range });
  }

  return out;
}

/* -------------------------------------------------------------- arithmetic */

/** The check digit every payment card carries, which is what separates a card
 *  number from sixteen digits that are not one. */
export function luhn(digits) {
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let double = false;
  for (let at = digits.length - 1; at >= 0; at -= 1) {
    let value = digits.charCodeAt(at) - 48;
    if (value < 0 || value > 9) return false;
    if (double) {
      value *= 2;
      if (value > 9) value -= 9;
    }
    sum += value;
    double = !double;
  }
  return sum % 10 === 0;
}

/** An IBAN's checksum: move the country code to the end, spell the letters as
 *  numbers, and the whole thing modulo 97 has to be 1. */
export function mod97(account) {
  if (account.length < 15 || account.length > 34) return false;
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(account)) return false;

  const moved = account.slice(4) + account.slice(0, 4);
  let remainder = 0;
  for (const character of moved) {
    const value = /\d/.test(character)
      ? character
      : String(character.charCodeAt(0) - 55);
    for (const digit of value) {
      remainder = (remainder * 10 + Number(digit)) % 97;
    }
  }
  return remainder === 1;
}
