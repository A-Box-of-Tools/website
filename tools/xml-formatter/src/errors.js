/**
 * The one error every parser in this tool throws.
 *
 * A formatter is only useful if it can say where the input stopped making
 * sense. `JSON.parse` says "Unexpected token } in JSON at position 41", which
 * is a position in a string nobody is looking at - the page shows lines. So
 * every parser here carries the offset it failed at, and the line and column
 * are worked out from the text once, here, rather than four times badly.
 *
 * What it does not carry is the sentence. `reason` is a phrase key and
 * `values` fills its blanks; main.js resolves the pair and puts the line and
 * column around it. See shared/js/phrases.js.
 */

export class ParseError extends Error {
  /**
   * @param {string} reason  a phrase key saying what was wrong
   * @param {number} index   where in the source it was noticed
   * @param {string} text    the source itself, for the line and column
   * @param {Record<string, unknown>} [values]  what fills the key's blanks
   */
  constructor(reason, index, text, values) {
    const { line, column } = positionOf(text, index);
    // The message is the key. Every parser in here is copied byte for
    // byte into fifteen languages and none of them can reach the DOM to
    // look a sentence up, so the sentence is main.js's to compose - with
    // the line and the column, which are a sentence of their own.
    super(reason);
    this.name = 'ParseError';
    this.index = index;
    this.line = line;
    this.column = column;
    this.reason = reason;
    this.values = values;
  }
}

/**
 * Turn an offset into a 1-based line and column.
 *
 * Counted rather than remembered: a parser that tracked the line as it went
 * would have to get it right in every branch, and the one branch that forgot
 * would report a wrong line in exactly the situation where the reader is
 * relying on it. Counting is O(n) once, when something has already gone wrong.
 */
export function positionOf(text, index) {
  const upTo = text.slice(0, Math.max(0, Math.min(index, text.length)));
  const lines = upTo.split('\n');
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}
