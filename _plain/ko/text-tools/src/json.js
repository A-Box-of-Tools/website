/**
 * JSON, read and written by hand.
 *
 * WHY NOT `JSON.parse`
 *
 * Two reasons, and both of them are the difference between a formatter you can
 * trust with a file and one you cannot:
 *
 *   1. `JSON.parse` reorders keys. An object's integer-like keys come back
 *      first, in numeric order, because that is what JavaScript objects do -
 *      so `{"10":1,"2":2}` formatted through `JSON.parse`/`stringify` comes
 *      back as `{"2":2,"10":1}`. A tool that silently rearranges somebody's
 *      config file is worse than no tool.
 *   2. `JSON.parse` throws numbers away and hands back doubles. `1e999` becomes
 *      `Infinity`, which `JSON.stringify` then writes as `null`, and a 20-digit
 *      id loses its last three digits. The text of a number is kept here
 *      exactly as it was written, and printed back byte for byte.
 *
 * It also cannot say where the error was in terms a page can show. See
 * errors.js.
 *
 * THE SHAPE EVERYTHING ELSE SPEAKS
 *
 * Every parser and printer in this tool passes the same tree around, so that
 * "JSON to YAML" is one printer reading what another parser produced rather
 * than a conversion of its own:
 *
 *   { t: 'map',  pairs: [{ key, keyRaw?, value }] }   order preserved
 *   { t: 'seq',  items: [...] }
 *   { t: 'str',  value, raw? }    raw is the source token, quotes included
 *   { t: 'num',  raw }            never parsed to a double
 *   { t: 'bool', value }
 *   { t: 'null' }
 *
 * `raw` is an optimisation of honesty rather than of speed: printing it back
 * means a string written with a backslash-u escape in it comes back with that
 * escape in it, rather than with the letter it stands for. Both say the same
 * thing and only one of them is what the file said. A tree built by some other
 * parser has no raw and is escaped from its value instead.
 */

import { ParseError } from './errors.js';

/* -------------------------------------------------------------------- read */

/**
 * Parse JSON text into the tree above.
 *
 * @param {string} text
 * @returns {object} the tree
 * @throws {ParseError}
 */
export function parseJson(text) {
  const state = { text, at: 0 };
  skipSpace(state);
  const value = readValue(state);
  skipSpace(state);
  if (state.at < text.length) {
    throw new ParseError(
      `Unexpected ${describe(text[state.at])} after the end of the value`,
      state.at, text);
  }
  return value;
}

function readValue(state) {
  const { text } = state;
  const ch = text[state.at];
  if (ch === undefined) throw new ParseError('The text ended early', state.at, text);
  if (ch === '{') return readObject(state);
  if (ch === '[') return readArray(state);
  if (ch === '"') return readString(state);
  if (ch === '-' || (ch >= '0' && ch <= '9')) return readNumber(state);
  for (const word of ['true', 'false', 'null']) {
    if (text.startsWith(word, state.at)) {
      state.at += word.length;
      return word === 'null' ? { t: 'null' } : { t: 'bool', value: word === 'true' };
    }
  }
  throw new ParseError(`Unexpected ${describe(ch)}`, state.at, text);
}

function readObject(state) {
  const { text } = state;
  const start = state.at;
  state.at += 1; // {
  const pairs = [];
  skipSpace(state);
  if (text[state.at] === '}') {
    state.at += 1;
    return { t: 'map', pairs };
  }
  for (;;) {
    skipSpace(state);
    if (text[state.at] !== '"') {
      throw new ParseError(
        `A key has to be a double-quoted string, and this is ${describe(text[state.at])}`,
        state.at, text);
    }
    const key = readString(state);
    skipSpace(state);
    if (text[state.at] !== ':') {
      throw new ParseError(
        `Expected a colon after the key, found ${describe(text[state.at])}`, state.at, text);
    }
    state.at += 1;
    skipSpace(state);
    const value = readValue(state);
    // Duplicate keys are kept rather than merged. The standard says nothing
    // about which one wins, so a formatter that dropped one would be choosing
    // for the reader - and hiding the fact that there were two.
    pairs.push({ key: key.value, keyRaw: key.raw, value });
    skipSpace(state);
    if (text[state.at] === ',') { state.at += 1; continue; }
    if (text[state.at] === '}') { state.at += 1; return { t: 'map', pairs }; }
    if (state.at >= text.length) {
      throw new ParseError('This object is never closed', start, text);
    }
    throw new ParseError(
      `Expected a comma or a closing brace, found ${describe(text[state.at])}`,
      state.at, text);
  }
}

function readArray(state) {
  const { text } = state;
  const start = state.at;
  state.at += 1; // [
  const items = [];
  skipSpace(state);
  if (text[state.at] === ']') {
    state.at += 1;
    return { t: 'seq', items };
  }
  for (;;) {
    skipSpace(state);
    items.push(readValue(state));
    skipSpace(state);
    if (text[state.at] === ',') { state.at += 1; continue; }
    if (text[state.at] === ']') { state.at += 1; return { t: 'seq', items }; }
    if (state.at >= text.length) {
      throw new ParseError('This array is never closed', start, text);
    }
    throw new ParseError(
      `Expected a comma or a closing bracket, found ${describe(text[state.at])}`,
      state.at, text);
  }
}

const SHORT_ESCAPES = { '"': '"', '\\': '\\', '/': '/', b: '\b', f: '\f', n: '\n', r: '\r', t: '\t' };

function readString(state) {
  const { text } = state;
  const start = state.at;
  state.at += 1; // "
  let value = '';
  for (;;) {
    const ch = text[state.at];
    if (ch === undefined) throw new ParseError('This string is never closed', start, text);
    if (ch === '"') {
      state.at += 1;
      return { t: 'str', value, raw: text.slice(start, state.at) };
    }
    if (ch === '\\') {
      const next = text[state.at + 1];
      if (next === 'u') {
        const digits = text.slice(state.at + 2, state.at + 6);
        if (!/^[0-9a-fA-F]{4}$/.test(digits)) {
          throw new ParseError('\\u has to be followed by four hex digits', state.at, text);
        }
        value += String.fromCharCode(parseInt(digits, 16));
        state.at += 6;
        continue;
      }
      if (next in SHORT_ESCAPES) {
        value += SHORT_ESCAPES[next];
        state.at += 2;
        continue;
      }
      throw new ParseError(`\\${next ?? ''} is not an escape JSON knows`, state.at, text);
    }
    // A raw control character inside a string is the error a hand-written
    // config hits most often: a real tab or newline pasted in where \t or \n
    // was meant.
    if (ch < ' ') {
      throw new ParseError(
        'A raw control character in a string - write it as an escape', state.at, text);
    }
    value += ch;
    state.at += 1;
  }
}

const NUMBER = /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/;

function readNumber(state) {
  const { text } = state;
  const match = NUMBER.exec(text.slice(state.at));
  if (!match) throw new ParseError('This is not a number JSON allows', state.at, text);
  // Caught here rather than let through, because both are things people write
  // and neither is JSON: a leading zero, and a decimal point with no digit
  // after it.
  const raw = match[0];
  const after = text[state.at + raw.length];
  if (after === '.' || after === 'e' || after === 'E' || /[0-9]/.test(after ?? '')) {
    throw new ParseError('This is not a number JSON allows', state.at, text);
  }
  state.at += raw.length;
  return { t: 'num', raw };
}

function skipSpace(state) {
  const { text } = state;
  while (state.at < text.length && ' \t\n\r'.includes(text[state.at])) state.at += 1;
}

function describe(ch) {
  if (ch === undefined) return 'the end of the text';
  if (ch === '\n') return 'a line break';
  if (ch === '\t') return 'a tab';
  return `"${ch}"`;
}

/* ------------------------------------------------------------------- write */

/**
 * Print the tree back as JSON.
 *
 * @param {object} data
 * @param {object} [options]
 * @param {string} [options.indent]  one level of indentation; '' minifies
 * @param {boolean} [options.sortKeys]
 * @returns {string}
 */
export function printJson(data, { indent = '  ', sortKeys = false } = {}) {
  const gap = indent === '' ? '' : '\n';
  const colon = indent === '' ? ':' : ': ';

  const walk = (node, depth) => {
    const pad = indent === '' ? '' : indent.repeat(depth + 1);
    const closePad = indent === '' ? '' : indent.repeat(depth);

    switch (node.t) {
      case 'map': {
        if (!node.pairs.length) return '{}';
        const pairs = sortKeys ? sortPairs(node.pairs) : node.pairs;
        const body = pairs
          .map((pair) => `${pad}${jsonString(pair.key, pair.keyRaw)}${colon}${walk(pair.value, depth + 1)}`)
          .join(`,${gap}`);
        return `{${gap}${body}${gap}${closePad}}`;
      }
      case 'seq': {
        if (!node.items.length) return '[]';
        const body = node.items
          .map((item) => `${pad}${walk(item, depth + 1)}`)
          .join(`,${gap}`);
        return `[${gap}${body}${gap}${closePad}]`;
      }
      case 'str': return jsonString(node.value, node.raw);
      case 'num': return node.raw;
      case 'bool': return node.value ? 'true' : 'false';
      default: return 'null';
    }
  };

  return walk(data, 0);
}

/**
 * Sorting is by the key as it reads, not by its code points: a config with
 * `item2` and `item10` in it sorts the way a person would write them. `numeric`
 * is what makes that true, and it is the browser's own collator rather than a
 * comparison invented here.
 */
function sortPairs(pairs) {
  const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'variant' });
  return [...pairs].sort((a, b) => collator.compare(a.key, b.key));
}

/**
 * A JSON string literal. The source token is preferred when there is one, so
 * that formatting is the only thing that changes: an escaped character comes
 * back escaped, and a letter written as itself stays a letter. Sorting keys
 * moves a pair without touching its token, so that holds there too.
 */
export function jsonString(value, raw) {
  if (raw !== undefined) return raw;
  let out = '"';
  for (const ch of value) {
    const code = ch.codePointAt(0);
    if (ch === '"') out += '\\"';
    else if (ch === '\\') out += '\\\\';
    else if (ch === '\n') out += '\\n';
    else if (ch === '\r') out += '\\r';
    else if (ch === '\t') out += '\\t';
    else if (ch === '\b') out += '\\b';
    else if (ch === '\f') out += '\\f';
    else if (code < 0x20) out += `\\u${code.toString(16).padStart(4, '0')}`;
    else out += ch;
  }
  return `${out}"`;
}
