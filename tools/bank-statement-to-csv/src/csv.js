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

/** One field, quoted if it has to be. */
function field(value) {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\r\n]/.test(text) ? `"${text.split('"').join('""')}"` : text;
}

/**
 * @param {string[][]} rows  the heading row included
 * @returns {string}
 */
export function toCsv(rows) {
  return '\ufeff' + rows.map((row) => row.map(field).join(',')).join('\r\n') + '\r\n';
}
