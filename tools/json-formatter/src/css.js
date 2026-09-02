/**
 * CSS, laid out or squeezed flat.
 *
 * The parser here is a block parser rather than a full one: it knows about
 * strings, comments, brackets, blocks and semicolons, and it treats everything
 * between them as text to be passed through. That is all a formatter needs,
 * and it is the reason this handles at-rules and nesting it has never heard
 * of - `@container`, `@layer`, `&` selectors, whatever comes next - instead of
 * failing on them the way a parser written against a property list would.
 *
 * TWO THINGS IT WILL NOT DO
 *
 * Both are borrowed from buildlib/cssmin.py, which minifies this site's own
 * stylesheets and is written to the same rule: a minifier that occasionally
 * changes a page is worth less than no minifier.
 *
 *   - **A custom property's value is copied through untouched.** `--gap: +` is
 *     a real thing people write, and the value of a custom property is an
 *     unparsed token stream: it is not required to be valid anything until it
 *     is substituted somewhere.
 *   - **Nothing is reordered, merged or re-spelled.** No shorthand is
 *     collapsed, no colour rewritten, no duplicate rule dropped. Those are the
 *     transformations that make a minifier impressive and also the ones that
 *     occasionally change a page.
 */

import { ParseError } from './shared/parse-errors.js';

/* -------------------------------------------------------------------- read */

/**
 * @param {string} text
 * @returns {Array<object>} nodes: rule, at, decl, comment
 * @throws {ParseError}
 */
export function parseCss(text) {
  const state = { text, at: 0 };
  const nodes = readBlock(state, true);
  return nodes;
}

function readBlock(state, top) {
  const { text } = state;
  const nodes = [];
  let buffer = '';
  let bufferStart = state.at;

  const flushStatement = (end) => {
    const statement = buffer.trim();
    buffer = '';
    if (statement === '') return;
    nodes.push(statement.startsWith('@')
      ? { t: 'at', prelude: statement, children: null }
      : { t: 'decl', ...splitDeclaration(statement, bufferStart, text, end) });
  };

  while (state.at < text.length) {
    const ch = text[state.at];

    if (ch === '/' && text[state.at + 1] === '*') {
      const end = text.indexOf('*/', state.at + 2);
      if (end < 0) throw new ParseError('css.comment', state.at, text);
      // A comment between declarations is a node of its own; one in the middle
      // of a selector or a value is part of it and stays where it was written.
      if (buffer.trim() === '') {
        nodes.push({ t: 'comment', text: text.slice(state.at + 2, end) });
      } else {
        buffer += text.slice(state.at, end + 2);
      }
      state.at = end + 2;
      continue;
    }

    if (ch === '"' || ch === "'") {
      buffer += readString(state);
      continue;
    }

    if (ch === '(') {
      // Everything to the matching bracket is passed through: a `;` inside a
      // data: URI does not end a declaration, and a `{` inside `url()` does not
      // open a block.
      buffer += readBrackets(state);
      continue;
    }

    if (ch === '{') {
      const prelude = buffer.trim();
      buffer = '';
      state.at += 1;
      const children = readBlock(state, false);
      nodes.push(prelude.startsWith('@')
        ? { t: 'at', prelude, children }
        : { t: 'rule', prelude, children });
      bufferStart = state.at;
      continue;
    }

    if (ch === '}') {
      if (top) throw new ParseError('css.brace', state.at, text);
      state.at += 1;
      flushStatement(state.at);
      return nodes;
    }

    if (ch === ';') {
      state.at += 1;
      flushStatement(state.at);
      bufferStart = state.at;
      continue;
    }

    if (buffer === '') bufferStart = state.at;
    buffer += ch;
    state.at += 1;
  }

  if (!top) throw new ParseError('css.block', text.length, text);
  flushStatement(state.at);
  return nodes;
}

function readString(state) {
  const { text } = state;
  const quote = text[state.at];
  const start = state.at;
  state.at += 1;
  while (state.at < text.length) {
    const ch = text[state.at];
    if (ch === '\\') { state.at += 2; continue; }
    if (ch === quote) {
      state.at += 1;
      return text.slice(start, state.at);
    }
    state.at += 1;
  }
  throw new ParseError('css.string', start, text);
}

function readBrackets(state) {
  const { text } = state;
  const start = state.at;
  let depth = 0;
  while (state.at < text.length) {
    const ch = text[state.at];
    if (ch === '"' || ch === "'") { readString(state); continue; }
    if (ch === '(') depth += 1;
    if (ch === ')') {
      depth -= 1;
      state.at += 1;
      if (depth === 0) return text.slice(start, state.at);
      continue;
    }
    state.at += 1;
  }
  throw new ParseError('css.bracket', start, text);
}

/**
 * Split `prop: value` at the colon that separates them - which is the first
 * one outside a string or a bracket, so `background: url(a:b)` still splits in
 * the right place.
 */
function splitDeclaration(statement, start, text, end) {
  const state = { text: statement, at: 0 };
  while (state.at < statement.length) {
    const ch = statement[state.at];
    if (ch === '"' || ch === "'") { readString(state); continue; }
    if (ch === '(') { readBrackets(state); continue; }
    if (ch === ':') {
      const prop = statement.slice(0, state.at).trim();
      const value = statement.slice(state.at + 1).trim();
      return { prop, value };
    }
    state.at += 1;
  }
  throw new ParseError('css.declaration', Math.min(start, Math.max(0, end - 1)), text, { statement });
}

/* ------------------------------------------------------------------- write */

/**
 * @param {Array<object>} nodes
 * @param {object} [options]
 * @param {string} [options.indent]
 * @param {boolean} [options.minify]  drop the comments and the whitespace too
 * @returns {string}
 */
export function printCss(nodes, { indent = '  ', minify = false } = {}) {
  if (minify) return squeeze(nodes);

  const out = [];
  const walk = (list, depth) => {
    const pad = indent.repeat(depth);
    list.forEach((node, index) => {
      switch (node.t) {
        case 'comment':
          out.push(`${pad}/*${node.text}*/`);
          break;
        case 'decl':
          out.push(`${pad}${node.prop}: ${value(node)};`);
          break;
        case 'at':
          if (!node.children) { out.push(`${pad}${collapse(node.prelude)};`); break; }
          out.push(`${pad}${collapse(node.prelude)} {`);
          walk(node.children, depth + 1);
          out.push(`${pad}}`);
          break;
        default:
          out.push(`${pad}${selectors(node.prelude).join(`,\n${pad}`)} {`);
          walk(node.children, depth + 1);
          out.push(`${pad}}`);
      }
      // A blank line between blocks, and none between the declarations inside
      // one. That is the shape every hand-written stylesheet has, including
      // the ones in this repository.
      const next = list[index + 1];
      if (next && (node.t === 'rule' || (node.t === 'at' && node.children))) out.push('');
    });
  };

  walk(nodes, 0);
  return `${out.join('\n')}\n`;
}

function squeeze(nodes) {
  return nodes.map((node) => {
    switch (node.t) {
      case 'comment': return '';
      case 'decl': return `${node.prop}:${value(node)};`;
      case 'at': return node.children
        ? `${collapse(node.prelude)}{${squeeze(node.children)}}`
        : `${collapse(node.prelude)};`;
      default: return `${selectors(node.prelude).join(',')}{${squeeze(node.children)}}`;
    }
  }).join('').replace(/;\}/g, '}');
}

/**
 * A custom property's value is passed through exactly as written. Everything
 * else has its whitespace collapsed, which is all a value's whitespace ever
 * means.
 */
function value(node) {
  return node.prop.startsWith('--') ? node.value : collapse(node.value);
}

/**
 * The parts of a selector list. Written one per line when the stylesheet is
 * laid out - which is how a rule with six selectors on it is read - and joined
 * back up with commas when it is squeezed.
 */
function selectors(prelude) {
  return splitTop(prelude, ',').map((part) => collapse(part));
}

function collapse(text) {
  return text.replace(/\s+/g, ' ').trim();
}

/** Split on a separator that is not inside a string or a bracket. */
function splitTop(text, separator) {
  const parts = [];
  const state = { text, at: 0 };
  let start = 0;
  while (state.at < text.length) {
    const ch = text[state.at];
    if (ch === '"' || ch === "'") { readString(state); continue; }
    if (ch === '(') { readBrackets(state); continue; }
    if (ch === separator) {
      parts.push(text.slice(start, state.at));
      state.at += 1;
      start = state.at;
      continue;
    }
    state.at += 1;
  }
  parts.push(text.slice(start));
  return parts.map((part) => part.trim()).filter((part) => part !== '');
}
