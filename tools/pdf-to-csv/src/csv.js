/**
 * The file at the end of it.
 *
 * RFC 4180, kept to exactly: a field is quoted when it holds a comma, a quote
 * or a line break, a quote inside a quoted field is doubled, and rows end with
 * a carriage return and a line feed. None of that is negotiable for a file
 * whose entire purpose is to be opened by somebody else's program.
 *
 * TWO CHOICES THAT LOOK WRONG AND ARE NOT
 *
 * The line ending is CRLF although every text file in this repository is LF.
 * That rule is about source; this is output, and 4180 says CRLF.
 *
 * The file starts with a byte order mark. It is the one thing here that is not
 * in the standard, and it is there because of who opens these files: Excel on
 * Windows reads a CSV without one as the system's legacy code page, so a
 * statement in pounds or euros arrives with the currency symbol replaced by a
 * letter, and the first thing a person does is retype it. Every other reader
 * that matters skips the mark silently. The cost falls on parsers strict enough
 * to hand back a first heading with an invisible character on the front; the
 * benefit falls on the spreadsheet this file is for.
 */

/** Spreadsheet-style names for columns the statement did not label: A, B, C,
 *  which is language-independent in a way any English word would not be. */
export function columnLetter(index) {
  let name = '';
  let at = index;
  do {
    name = String.fromCharCode(65 + (at % 26)) + name;
    at = Math.floor(at / 26) - 1;
  } while (at >= 0);
  return name;
}

/** A known numeric cell still has to be a whole numeric token. */
const NUMBER = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
const FORMULA = /^[\s]*[=+\-@＝＋－＠]|^[\t\r\n]/;

/**
 * Only cells already parsed as amounts carry numeric metadata. Guessing from
 * text here would exempt a heading or identifier that merely looks numeric.
 */
export function csvValue(cell, { spreadsheetSafe = false } = {}) {
  const typed = cell !== null && typeof cell === 'object';
  const text = String((typed ? cell.value : cell) ?? '');
  const numeric = typeof cell === 'number' && Number.isFinite(cell)
    || typed && cell.numeric === true && NUMBER.test(text);
  return spreadsheetSafe && !numeric && FORMULA.test(text) ? `'${text}` : text;
}

/** Count the text changes before the visitor chooses a download. */
export function formulaCells(rows) {
  return rows.reduce((count, row) => count + row.filter((cell) =>
    csvValue(cell, { spreadsheetSafe: true }) !== csvValue(cell)).length, 0);
}

/** One field, quoted if it has to be. */
function field(value, options) {
  const text = csvValue(value, options);
  const quote = /[",\r\n]/.test(text) || text !== csvValue(value);
  return quote ? `"${text.split('"').join('""')}"` : text;
}

/**
 * @param {(string | number | {value: string, numeric: boolean})[][]} rows  headings included
 * @param {{spreadsheetSafe?: boolean}} options  raw text remains available
 * @returns {string}
 */
export function toCsv(rows, options = {}) {
  return '\ufeff' + rows.map((row) => row.map((cell) => field(cell, options)).join(','))
    .join('\r\n') + '\r\n';
}
