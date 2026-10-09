/**
 * XML and HTML: read into a tree of nodes, written back out indented or
 * squeezed flat.
 *
 * GENERATED INTO EACH TOOL. This file lives at shared/js/parse-xml.js and the
 * build copies it to <tool>/src/shared/parse-xml.js for the tools that ask for
 * it with `js_parts = ["parse-xml", "parse-errors", ...]`: the JSON formatter
 * and the XML formatter. The YAML converter never mentions XML and does not
 * ask, which is how three hundred lines stay off a page that would never call
 * them. See the header of parse-json.js for how the parsers travel.
 *
 * TWO MODES, BECAUSE THEY ARE TWO LANGUAGES
 *
 * XML is strict: every tag closes, and a tag that does not is an error worth
 * reporting rather than papering over. HTML is not: `<br>` never closes, one
 * `<li>` ends the last one, and `<script>` holds JavaScript that must not be
 * read as markup at all. The same parser does both, and which rules apply is
 * one flag rather than a guess, because the guess is wrong exactly when the
 * file matters - a `<p>` inside an XML document is an element with children,
 * and in HTML it is a paragraph that the next `<div>` closes.
 *
 * WHAT INDENTING COSTS
 *
 * In HTML, whitespace between two inline elements is a space between two
 * words, so reindenting can change what a page looks like. Two things keep
 * that honest here: `<pre>` and `<textarea>` are copied through untouched, and
 * an element holding nothing but text stays on one line. Everything else is
 * laid out, and the page says so rather than pretending the transformation is
 * free.
 */

import { ParseError } from './parse-errors.js';

/** Tags that never have children in HTML, and never close. */
const VOID = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

/** Tags whose contents are not markup. Read to the matching close tag. */
const RAW_TEXT = new Set(['script', 'style']);

/** Tags whose whitespace is the point. Never reindented. */
const PRESERVE = new Set(['pre', 'textarea']);

/**
 * Which tags an unclosed tag is ended by. This is the small, well-known part
 * of HTML parsing that a formatter cannot skip: without it `<li>a<li>b` nests
 * the second item inside the first, and the output is a document that says
 * something the input did not.
 */
const CLOSED_BY = {
  li: new Set(['li']),
  dt: new Set(['dt', 'dd']),
  dd: new Set(['dt', 'dd']),
  p: new Set(['address', 'article', 'aside', 'blockquote', 'div', 'dl', 'fieldset',
    'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'main',
    'nav', 'ol', 'p', 'pre', 'section', 'table', 'ul']),
  option: new Set(['option', 'optgroup']),
  optgroup: new Set(['optgroup']),
  tr: new Set(['tr']),
  td: new Set(['td', 'th', 'tr']),
  th: new Set(['td', 'th', 'tr']),
  thead: new Set(['tbody', 'tfoot']),
  tbody: new Set(['tbody', 'tfoot']),
};

/**
 * Inline elements: the ones where the whitespace around them is a space
 * between two words rather than layout. Kept on the line they are on.
 */
const INLINE = new Set([
  'a', 'abbr', 'b', 'bdi', 'bdo', 'br', 'cite', 'code', 'data', 'dfn', 'em',
  'i', 'img', 'kbd', 'mark', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'small',
  'span', 'strong', 'sub', 'sup', 'time', 'u', 'var', 'wbr',
]);

/* -------------------------------------------------------------------- read */

/**
 * @param {string} text
 * @param {object} [options]
 * @param {boolean} [options.html]  HTML rules rather than XML rules
 * @returns {Array<object>} the nodes of the document, in order
 * @throws {ParseError}
 */
export function parseXml(text, { html = false } = {}) {
  const root = { t: 'element', name: '#document', attrs: [], children: [] };
  const stack = [root];
  const top = () => stack[stack.length - 1];
  const beginning = !html && text.startsWith('\ufeff') ? 1 : 0;
  let at = beginning;
  let documentElement = false;
  let doctype = false;
  let xmlVersion = '1.0';

  const pushText = (raw, start) => {
    if (raw === '') return;
    if (!html) {
      if (stack.length === 1 && /[^ \t\r\n]/.test(raw)) {
        throw new ParseError('xml.document', start + raw.search(/[^ \t\r\n]/), text);
      }
      validateReferences(raw, start, text, xmlVersion);
    }
    top().children.push({ t: 'text', text: raw });
  };

  while (at < text.length) {
    const next = text.indexOf('<', at);
    if (next < 0) { pushText(text.slice(at), at); break; }
    pushText(text.slice(at, next), at);
    at = next;

    if (text.startsWith('<!--', at)) {
      const end = text.indexOf('-->', at + 4);
      if (end < 0) throw new ParseError('xml.comment', at, text);
      top().children.push({ t: 'comment', text: text.slice(at + 4, end) });
      at = end + 3;
      continue;
    }

    if (text.startsWith('<![CDATA[', at)) {
      if (!html && stack.length === 1) throw new ParseError('xml.document', at, text);
      const end = text.indexOf(']]>', at + 9);
      if (end < 0) throw new ParseError('xml.cdata', at, text);
      top().children.push({ t: 'cdata', text: text.slice(at + 9, end) });
      at = end + 3;
      continue;
    }

    if (text.startsWith('<?', at) || text.startsWith('<!', at)) {
      const processing = text.startsWith('<?', at);
      const end = processing ? text.indexOf('?>', at + 2) + 2
        : html ? text.indexOf('>', at + 2) + 1 : declarationEnd(text, at);
      if (end < at + 2) throw new ParseError('xml.declaration', at, text);
      const raw = text.slice(at, end);
      if (!html) {
        if (/^<\?xml(?=[ \t\r\n?])/i.test(raw)) {
          if (at !== beginning) throw new ParseError('xml.declarationorder', at, text);
          const declaration = XML_DECLARATION.exec(raw);
          if (!declaration) throw new ParseError('xml.declarationinvalid', at, text);
          xmlVersion = declaration[2];
        } else if (!processing) {
          if (!/^<!DOCTYPE[ \t\r\n]/.test(raw) || stack.length !== 1 || documentElement || doctype) {
            throw new ParseError('xml.declarationorder', at, text);
          }
          doctype = true;
        }
      }
      top().children.push({ t: 'directive', text: raw });
      at = end;
      continue;
    }

    if (text.startsWith('</', at)) {
      const end = text.indexOf('>', at);
      if (end < 0) throw new ParseError('xml.closing', at, text);
      const name = normalise(text.slice(at + 2, end).trim(), html);
      at = end + 1;

      const depth = findOpen(stack, name);
      if (depth < 0) {
        if (!html) {
          throw new ParseError('xml.stray', next, text, { name });
        }
        continue; // a stray close tag in HTML is ignored, which is what a browser does
      }
      if (depth < stack.length - 1 && !html) {
        throw new ParseError('xml.crossed', next, text, { name, open: top().name });
      }
      stack.length = depth;
      continue;
    }

    // An opening tag.
    if (!html && stack.length === 1) {
      if (documentElement) throw new ParseError('xml.document', at, text);
      documentElement = true;
    }
    const tag = readTag(text, at, html, xmlVersion);
    at = tag.end;
    const element = {
      t: 'element',
      name: tag.name,
      attrs: tag.attrs,
      children: [],
      selfClosed: tag.selfClosed,
    };

    if (html) {
      // Close whatever this tag is documented to close first, so that the
      // element lands beside its sibling rather than inside it.
      while (stack.length > 1 && CLOSED_BY[top().name]?.has(tag.name)) stack.pop();
    }

    top().children.push(element);

    if (tag.selfClosed || (html && VOID.has(tag.name))) continue;

    if (html && RAW_TEXT.has(tag.name)) {
      const close = new RegExp(`</${tag.name}\\s*>`, 'i');
      const rest = text.slice(at);
      const found = close.exec(rest);
      const body = found ? rest.slice(0, found.index) : rest;
      if (body !== '') element.children.push({ t: 'text', text: body, raw: true });
      at += body.length + (found ? found[0].length : 0);
      continue;
    }

    stack.push(element);
  }

  if (stack.length > 1 && !html) {
    const open = stack[stack.length - 1];
    throw new ParseError('xml.unclosed', text.length, text, { name: open.name });
  }
  if (!html && !documentElement) throw new ParseError('xml.document', text.length, text);
  return root.children;
}

/** How far down the stack the matching open tag is, or -1. */
function findOpen(stack, name) {
  for (let i = stack.length - 1; i > 0; i -= 1) {
    if (stack[i].name === name) return i;
  }
  return -1;
}

/** HTML tag names are case-insensitive; XML names are not. */
function normalise(name, html) {
  return html ? name.toLowerCase() : name;
}

const NAME_START = /[A-Za-z_:]/;

function readTag(text, start, html, xmlVersion) {
  let at = start + 1;
  if (!NAME_START.test(text[at] ?? '')) {
    throw new ParseError('xml.tagname', at, text);
  }
  while (at < text.length && !/[\s/>]/.test(text[at])) at += 1;
  const name = normalise(text.slice(start + 1, at), html);
  const attrs = [];

  for (;;) {
    while (at < text.length && /\s/.test(text[at])) at += 1;
    if (at >= text.length) throw new ParseError('xml.unfinished', start, text, { name });
    if (text[at] === '>') return { name, attrs, selfClosed: false, end: at + 1 };
    if (text.startsWith('/>', at)) return { name, attrs, selfClosed: true, end: at + 2 };

    const nameStart = at;
    while (at < text.length && !/[\s=/>]/.test(text[at])) at += 1;
    const attrName = text.slice(nameStart, at);
    if (attrName === '') {
      throw new ParseError('xml.inside', at, text, { ch: text[at], name });
    }

    while (at < text.length && /\s/.test(text[at])) at += 1;
    if (text[at] !== '=') {
      // A bare attribute - `disabled`, `hidden`. Legal in HTML and not in XML.
      if (!html) {
        throw new ParseError('xml.attrvalue', nameStart, text, { name: attrName });
      }
      attrs.push({ name: attrName, value: null, quote: '"' });
      continue;
    }
    at += 1;
    while (at < text.length && /\s/.test(text[at])) at += 1;

    const quote = text[at];
    if (quote === '"' || quote === "'") {
      const end = text.indexOf(quote, at + 1);
      if (end < 0) throw new ParseError('xml.attrstring', at, text);
      const value = text.slice(at + 1, end);
      if (!html) validateReferences(value, at + 1, text, xmlVersion);
      attrs.push({ name: attrName, value, quote });
      at = end + 1;
      continue;
    }
    if (!html) {
      throw new ParseError('xml.attrquote', at, text);
    }
    const valueStart = at;
    while (at < text.length && !/[\s>]/.test(text[at])) at += 1;
    attrs.push({ name: attrName, value: text.slice(valueStart, at), quote: '"' });
  }
}

// A declaration has an ordered version, optional encoding and optional
// standalone flag. Ordinary processing instructions are not declarations.
const XML_DECLARATION = /^<\?xml[ \t\r\n]+version[ \t\r\n]*=[ \t\r\n]*(["'])(1\.[0-9]+)\1(?:[ \t\r\n]+encoding[ \t\r\n]*=[ \t\r\n]*(["'])([A-Za-z][A-Za-z0-9._-]*)\3)?(?:[ \t\r\n]+standalone[ \t\r\n]*=[ \t\r\n]*(["'])(yes|no)\5)?[ \t\r\n]*\?>$/;

/** Read a DOCTYPE as literal text, including its quoted/internal subset. */
function declarationEnd(text, start) {
  let quote = '';
  let subset = 0;
  for (let at = start + 2; at < text.length; at += 1) {
    const ch = text[at];
    if (quote) { if (ch === quote) quote = ''; continue; }
    if (text.startsWith('<!--', at)) {
      const end = text.indexOf('-->', at + 4);
      if (end < 0) throw new ParseError('xml.declaration', start, text);
      at = end + 2;
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === '[') subset += 1;
    else if (ch === ']') subset -= 1;
    else if (ch === '>' && subset === 0) return at + 1;
  }
  throw new ParseError('xml.declaration', start, text);
}

/** Character references cannot name a surrogate, zero or a non-XML character. */
function referenceCode(reference, version = '1.0') {
  if (!/^&#(?:[0-9]+|x[0-9a-fA-F]+);$/.test(reference)) return null;
  const hexadecimal = reference.startsWith('&#x');
  const code = parseInt(reference.slice(hexadecimal ? 3 : 2, -1), hexadecimal ? 16 : 10);
  if (!Number.isInteger(code)) return null;
  if (code >= 0x20 && code <= 0xd7ff || code >= 0xe000 && code <= 0xfffd
      || code >= 0x10000 && code <= 0x10ffff) return code;
  if (version === '1.1' && code >= 1 && code < 0x20 || code === 9 || code === 10 || code === 13) return code;
  return null;
}

function validateReferences(raw, start, source, version) {
  for (const match of raw.matchAll(/&#[^;\s<&]*;?/g)) {
    if (referenceCode(match[0], version) === null) {
      throw new ParseError('xml.character', start + match.index, source);
    }
  }
}

/** Decode only XML's five built-ins and numeric references, never custom entities. */
export function unescapeXml(text) {
  validateReferences(text, 0, text, '1.1');
  return text.replace(/&(lt|gt|amp|quot|apos|#[0-9]+|#x[0-9a-fA-F]+);/g, (whole, body, at) => {
    if (body[0] === '#') {
      // The parser has checked the document's declared version. The decoder
      // accepts the union of its character ranges without inventing a version.
      const code = referenceCode(whole, '1.1');
      if (code === null) throw new ParseError('xml.character', at, text);
      return String.fromCodePoint(code);
    }
    return { lt: '<', gt: '>', amp: '&', quot: '"', apos: "'" }[body];
  });
}

/** xml:space is inherited, with an explicit default restoring normal layout. */
export function xmlSpace(element, inherited = false) {
  const value = unescapeXml(element.attrs.find((attr) => attr.name === 'xml:space')?.value ?? '');
  if (value === 'preserve') return true;
  return value === 'default' ? false : inherited;
}

/* ------------------------------------------------------------------- write */

/**
 * @param {Array<object>} nodes
 * @param {object} [options]
 * @param {string} [options.indent]  one level; ignored when minifying
 * @param {boolean} [options.minify]
 * @param {boolean} [options.html]   write void tags the HTML way
 * @returns {string}
 */
export function printXml(nodes, { indent = '  ', minify = false, html = false } = {}) {
  const out = [];

  const openTag = (node) => {
    const attrs = node.attrs.map((attr) => (attr.value === null
      ? ` ${attr.name}`
      : ` ${attr.name}=${attr.quote}${attr.value}${attr.quote}`)).join('');
    if (node.selfClosed || (html && VOID.has(node.name) && !node.children.length)) {
      return html && VOID.has(node.name) ? `<${node.name}${attrs}>` : `<${node.name}${attrs}/>`;
    }
    return `<${node.name}${attrs}>`;
  };

  const isClosed = (node) => !(node.selfClosed || (html && VOID.has(node.name)));

  /**
   * An element holding nothing that wants a line of its own: text, and - in
   * HTML - the elements whose whitespace is a space between two words. The
   * inline list is HTML's, so it is only consulted for HTML: `<b>` in an XML
   * document is an element that happens to be called b, and laying it out is
   * what was asked for.
   */
  const inlineOnly = (node) => node.children.every(
    (child) => child.t === 'text'
      || (html && child.t === 'element' && INLINE.has(child.name) && inlineOnly(child)));

  const xmlTextual = (node) => node.children.some((child) => child.t === 'cdata'
    || child.t === 'text' && /[^ \t\r\n]/.test(child.text))
    || !node.children.some((child) => child.t === 'element')
      && node.children.some((child) => child.t === 'text');

  const flat = (node, inherited = false) => {
    if (node.t === 'text') return html ? collapse(node.text) : node.text;
    if (node.t === 'comment') return `<!--${node.text}-->`;
    if (node.t === 'cdata') return `<![CDATA[${node.text}]]>`;
    if (node.t === 'directive') return node.text;
    const preserve = !html && xmlSpace(node, inherited);
    const children = html || preserve || xmlTextual(node) ? node.children
      : node.children.filter((child) => child.t !== 'text' || /[^ \t\r\n]/.test(child.text));
    const inner = children.map((child) => flat(child, preserve)).join('');
    return isClosed(node) ? `${openTag(node)}${inner}</${node.name}>` : openTag(node);
  };

  const walk = (list, depth, inherited = false) => {
    const pad = minify ? '' : indent.repeat(depth);
    for (const node of list) {
      if (node.t === 'text') {
        if (node.raw) { out.push(pad + node.text.trim()); continue; }
        const text = collapse(node.text);
        if (text.trim() === '') continue;
        out.push(pad + text.trim());
        continue;
      }
      if (node.t === 'comment') { out.push(`${pad}<!--${node.text}-->`); continue; }
      if (node.t === 'cdata') { out.push(`${pad}<![CDATA[${node.text}]]>`); continue; }
      if (node.t === 'directive') { out.push(pad + node.text); continue; }

      const preserve = !html && xmlSpace(node, inherited);
      if (!html && (preserve || xmlTextual(node))) {
        // In XML a run of spaces can be data. Keep mixed content together so
        // indentation cannot insert or delete characters between its nodes.
        out.push(pad + flat(node, inherited));
        continue;
      }
      if (!isClosed(node) || !node.children.length) {
        out.push(pad + openTag(node) + (isClosed(node) ? `</${node.name}>` : ''));
        continue;
      }
      if (PRESERVE.has(node.name) && html) {
        // Copied through exactly: every space inside one of these is content.
        const inner = node.children.map((child) => (child.t === 'text' ? child.text : flat(child))).join('');
        out.push(`${pad}${openTag(node)}${inner}</${node.name}>`);
        continue;
      }
      if (inlineOnly(node)) {
        const inner = node.children.map(flat).join('').trim();
        out.push(`${pad}${openTag(node)}${inner}</${node.name}>`);
        continue;
      }
      out.push(pad + openTag(node));
      walk(node.children, depth + 1, preserve);
      out.push(`${pad}</${node.name}>`);
    }
  };

  walk(nodes, 0);
  return minify ? out.join('') : `${out.join('\n')}\n`;
}

/** Runs of whitespace become one space, which is what they already mean. */
function collapse(text) {
  return text.replace(/\s+/g, ' ');
}
