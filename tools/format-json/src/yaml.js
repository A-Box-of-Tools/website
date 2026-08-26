/**
 * YAML, in the half of it that a converter needs.
 *
 * WHAT IS SUPPORTED, AND WHY IT IS A HALF
 *
 * YAML is a large specification with several features that exist to describe
 * things JSON cannot hold at all: anchors and aliases (one node referred to
 * twice), tags (a node's type named by hand), and multiple documents in one
 * file. A converter that met one of those and guessed would produce a JSON
 * document that is not what the YAML said.
 *
 * So they are refused by name instead. Block mappings, block sequences, flow
 * collections, quoted and plain scalars, block scalars and comments are read;
 * an anchor, an alias, a tag or a second document stops the parse with a
 * message saying which one it was. A wrong answer is worse than no answer,
 * and this is the only place in the tool where the input can mean something
 * the output cannot say.
 *
 * The other decision worth knowing about is that `yes` and `no` are strings.
 * YAML 1.1 read them as booleans, which is the famous bug that turns the
 * country code NO into `false`; YAML 1.2 does not, and neither does this. Only
 * `true`, `false`, `null` and `~` are read as anything but text.
 */

import { ParseError } from './errors.js';

/* ------------------------------------------------------------------- write */

/**
 * Print the shared tree (see json.js) as YAML.
 *
 * @param {object} data
 * @param {object} [options]
 * @param {number} [options.indent]  spaces per level
 * @returns {string}
 */
export function printYaml(data, { indent = 2 } = {}) {
  const step = ' '.repeat(Math.max(1, indent));
  const lines = [];

  const scalar = (node) => {
    switch (node.t) {
      case 'num': return node.raw;
      case 'bool': return node.value ? 'true' : 'false';
      case 'null': return 'null';
      default: return yamlString(node.value);
    }
  };

  const isEmpty = (node) => (node.t === 'map' && !node.pairs.length)
    || (node.t === 'seq' && !node.items.length);

  const emptyOf = (node) => (node.t === 'map' ? '{}' : '[]');

  /**
   * Write one value that sits after `prefix` - a key, or a sequence dash.
   * A collection goes on the lines below; everything else goes on this one.
   */
  const write = (node, prefix, pad) => {
    if (node.t === 'map' || node.t === 'seq') {
      if (isEmpty(node)) { lines.push(`${pad}${prefix}${emptyOf(node)}`); return; }
      lines.push(`${pad}${prefix.trimEnd()}`);
      block(node, pad + step);
      return;
    }
    // A multi-line string is written as a block scalar, which is the one part
    // of YAML that is nicer to read than JSON, and the reason people keep
    // scripts in YAML files at all.
    const text = node.t === 'str' ? node.value : null;
    if (text !== null && text.includes('\n') && blockScalarSafe(text)) {
      const [header, body] = blockScalar(text, pad + step);
      lines.push(`${pad}${prefix}${header}`);
      lines.push(...body);
      return;
    }
    lines.push(`${pad}${prefix}${scalar(node)}`);
  };

  const block = (node, pad) => {
    if (node.t === 'map') {
      for (const pair of node.pairs) write(pair.value, `${yamlKey(pair.key)}: `, pad);
      return;
    }
    for (const item of node.items) {
      if ((item.t === 'map' || item.t === 'seq') && !isEmpty(item)) {
        // A collection inside a sequence is written in the compact form -
        // the first key on the dash's own line - because that is how every
        // YAML file anybody has read is written.
        const before = lines.length;
        block(item, pad + step);
        lines[before] = `${pad}-${lines[before].slice(pad.length + step.length - 1)}`;
        continue;
      }
      write(item, '- ', pad);
    }
  };

  if (data.t === 'map' || data.t === 'seq') {
    if (isEmpty(data)) return `${emptyOf(data)}\n`;
    block(data, '');
  } else {
    write(data, '', '');
  }
  return `${lines.join('\n')}\n`;
}

/** A key, quoted only when leaving it bare would change what it says. */
function yamlKey(key) {
  return plainSafe(key) ? key : quoteYaml(key);
}

/** A scalar string, quoted on the same test. */
function yamlString(value) {
  return plainSafe(value) ? value : quoteYaml(value);
}

/**
 * Can this string be written with no quotes at all?
 *
 * The test is deliberately strict. Being wrong in one direction adds a pair of
 * quotes nobody needed; being wrong in the other silently turns a version
 * number into a float or a country code into a boolean.
 */
function plainSafe(value) {
  if (value === '') return false;
  if (/^[\s]|[\s]$/.test(value)) return false;
  if (/[\n\r\t]/.test(value)) return false;
  // The characters YAML gives a meaning to at the start of a scalar.
  if ('-?:,[]{}#&*!|>\'"%@`'.includes(value[0])) return false;
  if (value.includes(': ') || value.endsWith(':')) return false;
  if (value.includes(' #')) return false;
  // The words YAML 1.1 read as booleans. This reads 1.2, where they are
  // strings, and writes them quoted anyway - because the thing on the other
  // end of the file may not: PyYAML still defaults to 1.1, and a bare `no` in
  // a list of country codes arrives there as `false`. Reading strictly and
  // writing conservatively is the only combination that is right whichever
  // version the next program is on.
  if (/^(y|Y|n|N|yes|Yes|YES|no|No|NO|on|On|ON|off|Off|OFF)$/.test(value)) return false;
  // Anything else that would be read back as some other type has to be quoted,
  // or the round trip stops being one.
  return resolvePlain(value).t === 'str';
}

function quoteYaml(value) {
  // Single quotes are literal in YAML apart from '' for a quote, so they are
  // the honest choice for text with backslashes in it - a Windows path stays a
  // Windows path. Anything with a line break or a control character in it needs
  // the escapes double quotes bring.
  if (/[\n\r\t\x00-\x1f]/.test(value)) {
    let out = '"';
    for (const ch of value) {
      const code = ch.codePointAt(0);
      if (ch === '"') out += '\\"';
      else if (ch === '\\') out += '\\\\';
      else if (ch === '\n') out += '\\n';
      else if (ch === '\r') out += '\\r';
      else if (ch === '\t') out += '\\t';
      else if (code < 0x20) out += `\\x${code.toString(16).padStart(2, '0')}`;
      else out += ch;
    }
    return `${out}"`;
  }
  return `'${value.replace(/'/g, "''")}'`;
}

/**
 * A block scalar can only carry lines that survive being indented and read
 * back: nothing with trailing whitespace, and no first line that starts with a
 * space, which would need an explicit indentation indicator to be unambiguous.
 */
function blockScalarSafe(text) {
  const body = text.endsWith('\n') ? text.slice(0, -1) : text;
  if (/^[ \t]/.test(body)) return false;
  return body.split('\n').every((line) => !/[ \t]$/.test(line) && !/[\r\x00-\x08\x0b\x0c\x0e-\x1f]/.test(line));
}

/** The `|` header and the indented lines under it. */
function blockScalar(text, pad) {
  let body = text;
  let header = '|-';
  if (body.endsWith('\n\n')) { header = '|+'; body = body.slice(0, -1); }
  else if (body.endsWith('\n')) { header = '|'; body = body.slice(0, -1); }
  const lines = body.split('\n').map((line) => (line === '' ? '' : pad + line));
  return [header, lines];
}

/* -------------------------------------------------------------------- read */

/**
 * Parse YAML into the shared tree.
 *
 * @param {string} text
 * @returns {object}
 * @throws {ParseError} on anything unsupported, by name
 */
export function parseYaml(text) {
  const source = text.replace(/\r\n?/g, '\n').replace(/^\ufeff/, '');
  const doc = new Doc(source);
  doc.skipBlank();
  if (doc.at >= doc.lines.length) return { t: 'null' };
  const value = doc.parseNode(0);
  doc.skipBlank();
  if (doc.at < doc.lines.length) {
    doc.fail('This line is indented less than the block it is in', doc.at);
  }
  return value;
}

class Doc {
  constructor(source) {
    this.source = source;
    this.lines = source.split('\n');
    this.at = 0;
    // Where each line begins in the source, so an error can be reported at an
    // offset the way every other parser here does.
    this.starts = [];
    let offset = 0;
    for (const line of this.lines) {
      this.starts.push(offset);
      offset += line.length + 1;
    }
  }

  fail(message, lineIndex, column = 0) {
    throw new ParseError(message, this.starts[Math.min(lineIndex, this.lines.length - 1)] + column,
      this.source);
  }

  /** Skip blank lines, comment lines and the document markers. */
  skipBlank() {
    while (this.at < this.lines.length) {
      const line = this.lines[this.at];
      const trimmed = line.trim();
      if (trimmed === '' || trimmed.startsWith('#')) { this.at += 1; continue; }
      if (trimmed === '---' && this.startedDocument) {
        this.fail('More than one document in this file. Convert them one at a time.', this.at);
      }
      if (trimmed === '---') { this.startedDocument = true; this.at += 1; continue; }
      if (trimmed === '...') { this.at += 1; continue; }
      return;
    }
  }

  indentOf(index) {
    const line = this.lines[index];
    return line.length - line.trimStart().length;
  }

  /**
   * A whole block at `indent` or deeper: a mapping, a sequence, or a scalar
   * standing on its own.
   */
  parseNode(indent) {
    this.skipBlank();
    if (this.at >= this.lines.length) return { t: 'null' };
    const here = this.indentOf(this.at);
    if (here < indent) return { t: 'null' };
    const rest = this.lines[this.at].slice(here);
    if (rest === '-' || rest.startsWith('- ')) return this.parseSequence(here);
    if (this.keyEnd(rest) >= 0) return this.parseMapping(here);
    this.at += 1;
    return this.scalarValue(rest, this.at - 1, here);
  }

  parseMapping(indent) {
    const pairs = [];
    for (;;) {
      this.skipBlank();
      if (this.at >= this.lines.length) break;
      const here = this.indentOf(this.at);
      if (here < indent) break;
      const lineIndex = this.at;
      if (here > indent) this.fail('This line is indented further than the key above it', lineIndex);
      const rest = this.lines[lineIndex].slice(here);
      const end = this.keyEnd(rest);
      if (end < 0) this.fail('Expected "key: value" here', lineIndex, here);

      const key = this.readKey(rest.slice(0, end), lineIndex, here);
      const after = rest.slice(end + 1).trim();
      this.at += 1;
      pairs.push({ key, value: this.valueAfterKey(after, indent, lineIndex, here + end + 1) });
    }
    return { t: 'map', pairs };
  }

  /** What follows a `key:` - on the same line, or in the block below it. */
  valueAfterKey(after, indent, lineIndex, column) {
    if (after !== '' && !after.startsWith('#')) {
      if (after[0] === '|' || after[0] === '>') return this.blockScalar(after, indent, lineIndex);
      return this.scalarValue(after, lineIndex, column);
    }
    this.skipBlank();
    if (this.at >= this.lines.length) return { t: 'null' };
    const next = this.indentOf(this.at);
    if (next > indent) return this.parseNode(next);
    // A sequence is allowed to sit at the same indentation as the key it
    // belongs to, and in the wild it usually does.
    const rest = this.lines[this.at].slice(next);
    if (next === indent && (rest === '-' || rest.startsWith('- '))) return this.parseSequence(next);
    return { t: 'null' };
  }

  parseSequence(indent) {
    const items = [];
    for (;;) {
      this.skipBlank();
      if (this.at >= this.lines.length) break;
      const here = this.indentOf(this.at);
      if (here < indent) break;
      const lineIndex = this.at;
      const rest = this.lines[lineIndex].slice(here);
      if (here > indent || !(rest === '-' || rest.startsWith('- '))) break;

      const after = rest.slice(1).replace(/^ +/, '');
      const column = this.lines[lineIndex].length - after.length;

      if (after === '' || after.startsWith('#')) {
        this.at += 1;
        this.skipBlank();
        const deeper = this.at < this.lines.length ? this.indentOf(this.at) : -1;
        items.push(deeper > indent ? this.parseNode(deeper) : { t: 'null' });
        continue;
      }

      // `- key: value` and `- - value` are the compact forms: the item starts
      // on the dash's own line. Blanking out the dash turns them into an
      // ordinary block starting at the column the item does, which is exactly
      // what they mean, and saves this parser a second way of reading a
      // mapping.
      if (after[0] === '|' || after[0] === '>') {
        this.at += 1;
        items.push(this.blockScalar(after, column - 1, lineIndex));
        continue;
      }
      if (this.keyEnd(after) >= 0 || after === '-' || after.startsWith('- ')) {
        this.lines[lineIndex] = ' '.repeat(column) + after;
        items.push(this.parseNode(column));
        continue;
      }

      this.at += 1;
      items.push(this.scalarValue(after, lineIndex, column));
    }
    return { t: 'seq', items };
  }

  /**
   * Where the `:` that ends a key is, or -1 if this line is not a key at all.
   * A colon only ends a key when a space or the end of the line follows it,
   * which is what keeps `http://example.com` a value rather than a key.
   */
  keyEnd(rest) {
    let quote = null;
    for (let i = 0; i < rest.length; i += 1) {
      const ch = rest[i];
      if (quote) {
        if (ch === '\\' && quote === '"') { i += 1; continue; }
        if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'") { quote = ch; continue; }
      if (ch === '#' && i > 0 && rest[i - 1] === ' ') return -1;
      if (ch === ':' && (i + 1 === rest.length || rest[i + 1] === ' ')) return i;
      if (ch === '[' || ch === '{') return -1;
    }
    return -1;
  }

  readKey(raw, lineIndex, column) {
    const text = raw.trim();
    if (text.startsWith('"') || text.startsWith("'")) {
      return readQuoted(text, (message) => this.fail(message, lineIndex, column));
    }
    if (text.startsWith('&') || text.startsWith('*') || text.startsWith('!')) {
      this.fail(unsupported(text[0]), lineIndex, column);
    }
    if (text === '?') this.fail('A "?" key is not supported here', lineIndex, column);
    return text;
  }

  /** A `|` or `>` scalar, and the lines under it. */
  blockScalar(header, indent, lineIndex) {
    const match = /^([|>])([+-]?)([0-9]?)([+-]?)\s*(#.*)?$/.exec(header.trim());
    if (!match) this.fail(`"${header.trim()}" is not a block scalar this reads`, lineIndex);
    const folded = match[1] === '>';
    const chomp = match[2] || match[4] || '';
    const explicit = match[3] ? Number(match[3]) : 0;

    const body = [];
    let contentIndent = explicit ? indent + explicit : 0;
    while (this.at < this.lines.length) {
      const line = this.lines[this.at];
      if (line.trim() === '') { body.push(''); this.at += 1; continue; }
      const here = this.indentOf(this.at);
      if (here <= indent) break;
      if (!contentIndent) contentIndent = here;
      if (here < contentIndent) break;
      body.push(line.slice(contentIndent));
      this.at += 1;
    }
    while (body.length && body[body.length - 1] === '') body.pop();

    let value = folded ? fold(body) : body.join('\n');
    if (chomp !== '-' && body.length) value += '\n';
    if (chomp === '+') {
      // Keep every blank line that followed. They were popped above because
      // the common case wants them gone.
      const kept = this.trailingBlanks(indent);
      value += '\n'.repeat(kept);
    }
    return { t: 'str', value };
  }

  trailingBlanks() {
    let count = 0;
    let index = this.at - 1;
    while (index >= 0 && this.lines[index].trim() === '') { count += 1; index -= 1; }
    return count;
  }

  /** One scalar written on one line: quoted, flow, or plain. */
  scalarValue(text, lineIndex, column) {
    const trimmed = text.trim();
    if (trimmed.startsWith('&') || trimmed.startsWith('*') || trimmed.startsWith('!')) {
      this.fail(unsupported(trimmed[0]), lineIndex, column);
    }
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      return parseFlow(trimmed, (message) => this.fail(message, lineIndex, column));
    }
    if (trimmed.startsWith('"') || trimmed.startsWith("'")) {
      const [value, end] = readQuotedWithEnd(trimmed, (message) => this.fail(message, lineIndex, column));
      const after = trimmed.slice(end).trim();
      if (after !== '' && !after.startsWith('#')) {
        this.fail('There is text after the closing quote', lineIndex, column);
      }
      return { t: 'str', value };
    }
    return resolvePlain(stripComment(trimmed));
  }
}

function unsupported(mark) {
  if (mark === '&') return 'Anchors (&name) are not supported - JSON has no way to say "the same node twice"';
  if (mark === '*') return 'Aliases (*name) are not supported - JSON has no way to say "the same node twice"';
  return 'Tags (!name) are not supported - the type would have to be guessed';
}

/** A trailing ` # comment` is not part of a plain scalar. */
function stripComment(text) {
  const at = text.search(/(^|\s)#/);
  return at < 0 ? text : text.slice(0, at === 0 ? 0 : at).trimEnd();
}

/**
 * What a plain, unquoted scalar means.
 *
 * The YAML 1.2 core schema and nothing beyond it: `yes`, `no`, `on` and `off`
 * are text, and so is anything that only looks like a date. Numbers are kept
 * as text too, and only normalised where JSON would refuse what YAML allows -
 * `+1`, `.5` and `0x1f` are all numbers in YAML and none of them is a number
 * in JSON.
 */
export function resolvePlain(text) {
  if (text === '' || text === '~' || /^(null|Null|NULL)$/.test(text)) return { t: 'null' };
  if (/^(true|True|TRUE)$/.test(text)) return { t: 'bool', value: true };
  if (/^(false|False|FALSE)$/.test(text)) return { t: 'bool', value: false };

  if (/^[-+]?[0-9]+$/.test(text) || /^[-+]?[0-9]*\.[0-9]*(?:[eE][-+]?[0-9]+)?$/.test(text)
      || /^[-+]?[0-9]+[eE][-+]?[0-9]+$/.test(text)) {
    if (text === '.' || text === '-.' || text === '+.') return { t: 'str', value: text };
    return { t: 'num', raw: jsonNumber(text) };
  }
  if (/^[-+]?0x[0-9a-fA-F]+$/.test(text) || /^[-+]?0o[0-7]+$/.test(text)) {
    const negative = text.startsWith('-');
    const digits = text.replace(/^[-+]/, '');
    const value = digits.startsWith('0x')
      ? parseInt(digits.slice(2), 16) : parseInt(digits.slice(2), 8);
    return { t: 'num', raw: String(negative ? -value : value) };
  }
  return { t: 'str', value: text };
}

/**
 * The same number, written the way JSON insists on it. Only touched when it
 * has to be: a plain `1.5` is passed through as the characters that were
 * typed, so nothing is lost to a round trip through a double.
 */
function jsonNumber(text) {
  if (/^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][-+]?[0-9]+)?$/.test(text)) return text;
  const value = Number(text);
  return Number.isFinite(value) ? String(value) : '0';
}

/* ------------------------------------------------------- quoted, and flow */

function readQuoted(text, fail) {
  const [value, end] = readQuotedWithEnd(text, fail);
  if (text.slice(end).trim() !== '') fail('There is text after the closing quote');
  return value;
}

function readQuotedWithEnd(text, fail) {
  const quote = text[0];
  let value = '';
  let i = 1;
  for (; i < text.length; i += 1) {
    const ch = text[i];
    if (quote === "'") {
      if (ch === "'") {
        if (text[i + 1] === "'") { value += "'"; i += 1; continue; }
        return [value, i + 1];
      }
      value += ch;
      continue;
    }
    if (ch === '\\') {
      const next = text[i + 1];
      const short = { n: '\n', t: '\t', r: '\r', '0': '\0', b: '\b', f: '\f', '"': '"', '\\': '\\', '/': '/' };
      if (next === 'u' || next === 'x' || next === 'U') {
        const width = next === 'x' ? 2 : next === 'u' ? 4 : 8;
        const digits = text.slice(i + 2, i + 2 + width);
        if (!new RegExp(`^[0-9a-fA-F]{${width}}$`).test(digits)) {
          fail(`\\${next} needs ${width} hex digits after it`);
        }
        value += String.fromCodePoint(parseInt(digits, 16));
        i += 1 + width;
        continue;
      }
      if (next in short) { value += short[next]; i += 1; continue; }
      fail(`\\${next ?? ''} is not an escape this reads`);
    }
    if (ch === '"') return [value, i + 1];
    value += ch;
  }
  fail('This quoted string is never closed');
  return ['', text.length];
}

/**
 * A flow collection - `[1, 2]`, `{a: 1}` - which is JSON's syntax with the
 * quotes made optional. Read here rather than handed to the JSON parser
 * because of exactly that: `{a: 1}` is not JSON.
 */
export function parseFlow(text, fail) {
  const state = { at: 0 };
  const value = readFlowValue(text, state, fail);
  skipFlowSpace(text, state);
  if (state.at < text.length && !text.slice(state.at).trim().startsWith('#')) {
    fail('There is text after the end of the flow collection');
  }
  return value;
}

function skipFlowSpace(text, state) {
  while (state.at < text.length && ' \t'.includes(text[state.at])) state.at += 1;
}

function readFlowValue(text, state, fail) {
  skipFlowSpace(text, state);
  const ch = text[state.at];
  if (ch === undefined) fail('The flow collection ends early');
  if (ch === '[') return readFlowSeq(text, state, fail);
  if (ch === '{') return readFlowMap(text, state, fail);
  if (ch === '"' || ch === "'") {
    const [value, end] = readQuotedWithEnd(text.slice(state.at), fail);
    state.at += end;
    return { t: 'str', value };
  }
  const start = state.at;
  while (state.at < text.length && !',]}'.includes(text[state.at])) state.at += 1;
  return resolvePlain(text.slice(start, state.at).trim());
}

function readFlowSeq(text, state, fail) {
  state.at += 1;
  const items = [];
  skipFlowSpace(text, state);
  if (text[state.at] === ']') { state.at += 1; return { t: 'seq', items }; }
  for (;;) {
    items.push(readFlowValue(text, state, fail));
    skipFlowSpace(text, state);
    if (text[state.at] === ',') { state.at += 1; continue; }
    if (text[state.at] === ']') { state.at += 1; return { t: 'seq', items }; }
    fail('Expected a comma or a closing bracket in this flow sequence');
  }
}

function readFlowMap(text, state, fail) {
  state.at += 1;
  const pairs = [];
  skipFlowSpace(text, state);
  if (text[state.at] === '}') { state.at += 1; return { t: 'map', pairs }; }
  for (;;) {
    skipFlowSpace(text, state);
    let key;
    if (text[state.at] === '"' || text[state.at] === "'") {
      const [value, end] = readQuotedWithEnd(text.slice(state.at), fail);
      state.at += end;
      key = value;
    } else {
      const start = state.at;
      while (state.at < text.length && !':,}'.includes(text[state.at])) state.at += 1;
      key = text.slice(start, state.at).trim();
    }
    skipFlowSpace(text, state);
    if (text[state.at] !== ':') fail('Expected a colon after a key in this flow mapping');
    state.at += 1;
    pairs.push({ key, value: readFlowValue(text, state, fail) });
    skipFlowSpace(text, state);
    if (text[state.at] === ',') { state.at += 1; continue; }
    if (text[state.at] === '}') { state.at += 1; return { t: 'map', pairs }; }
    fail('Expected a comma or a closing brace in this flow mapping');
  }
}

/** What `>` means: line breaks inside a paragraph become spaces. */
function fold(lines) {
  let out = '';
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (i === 0) { out = line; continue; }
    if (line === '' || lines[i - 1] === '' || /^[ \t]/.test(line)) out += `\n${line}`;
    else out += ` ${line}`;
  }
  return out;
}
