/**
 * A local inventory, not a second SVG renderer. The browser still decides what
 * the untouched drawing means; this only makes ordinary linked resources
 * visible before the static image context omits them. Nothing here opens a URL.
 */

import { sizedSvg } from './svg.js';

const SVG = 'http://www.w3.org/2000/svg';
const XLINK = 'http://www.w3.org/1999/xlink';
const RESOURCES = new Set(['image', 'feImage', 'use', 'font-face-uri']);

/** Fragments and embedded data stay inside this drawing; other URLs do not. */
export function isLinkedAsset(value) {
  const reference = String(value ?? '').trim();
  return Boolean(reference) && !reference.startsWith('#') && !/^data:/i.test(reference);
}

const space = (ch) => ch != null && /[\t\n\f\r ]/.test(ch);
const namePart = (ch) => ch != null && /[-_a-z0-9\u0080-\uffff]/i.test(ch);

// Escapes matter for classification too: url(\23 shade) is an internal fragment,
// and an escaped spelling of data: does not become an external dependency.
function escapeAt(text, at) {
  let next = at + 1;
  if (next >= text.length) return { value: '', next };
  if (/[0-9a-f]/i.test(text[next])) {
    const start = next;
    while (next < start + 6 && /[0-9a-f]/i.test(text[next] ?? '')) next += 1;
    const code = parseInt(text.slice(start, next), 16);
    if (space(text[next])) {
      if (text[next] === '\r' && text[next + 1] === '\n') next += 1;
      next += 1;
    }
    return {
      value: code === 0 || code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff)
        ? '\ufffd' : String.fromCodePoint(code),
      next,
    };
  }
  const value = text[next];
  if (value === '\r' && text[next + 1] === '\n') next += 1;
  return { value: /[\n\r\f]/.test(value) ? '' : value, next: next + 1 };
}

function quotedAt(text, at) {
  const quote = text[at];
  let value = '', next = at + 1;
  while (next < text.length) {
    if (text[next] === quote) return { value, next: next + 1, closed: true };
    if (/[\n\r\f]/.test(text[next])) return { value, next, closed: false };
    if (text[next] === '\\') {
      const escaped = escapeAt(text, next);
      value += escaped.value;
      next = escaped.next;
    } else {
      value += text[next];
      next += 1;
    }
  }
  return { value, next, closed: false };
}

function nameAt(text, at) {
  let value = '', next = at;
  while (namePart(text[next]) || text[next] === '\\') {
    if (text[next] === '\\') {
      const escaped = escapeAt(text, next);
      value += escaped.value;
      next = escaped.next;
    } else {
      value += text[next];
      next += 1;
    }
  }
  return { value: value.toLowerCase(), next };
}

function skipSpace(text, at) {
  let next = at;
  for (;;) {
    if (space(text[next])) next += 1;
    else if (text.startsWith('/*', next)) {
      const end = text.indexOf('*/', next + 2);
      next = end < 0 ? text.length : end + 2;
    } else return next;
  }
}

function urlAt(text, at) {
  let next = skipSpace(text, at), value = '';
  if (text[next] === '"' || text[next] === "'") {
    const quoted = quotedAt(text, next);
    next = skipSpace(text, quoted.next);
    return { value: quoted.value, next: next + 1, closed: quoted.closed && text[next] === ')' };
  }
  while (next < text.length && text[next] !== ')') {
    if (space(text[next])) {
      next = skipSpace(text, next);
      return { value, next: next + 1, closed: text[next] === ')' };
    }
    if (text[next] === '"' || text[next] === "'" || text[next] === '(') {
      return { value, next: next + 1, closed: false };
    }
    if (text[next] === '\\') {
      const escaped = escapeAt(text, next);
      value += escaped.value;
      next = escaped.next;
    } else {
      value += text[next];
      next += 1;
    }
  }
  return { value, next: next + 1, closed: text[next] === ')' };
}

/** Ordinary CSS resource tokens, without mistaking comments or content for links. */
export function cssLinksAssets(text) {
  let at = 0;
  while (at < text.length) {
    if (text.startsWith('/*', at) || space(text[at])) {
      at = skipSpace(text, at);
    } else if (text[at] === '"' || text[at] === "'") {
      at = quotedAt(text, at).next;
    } else if (text[at] === '@') {
      const name = nameAt(text, at + 1);
      at = skipSpace(text, name.next);
      if (name.value === 'import' && (text[at] === '"' || text[at] === "'")) {
        const value = quotedAt(text, at);
        if (value.closed && isLinkedAsset(value.value)) return true;
        at = value.next;
      }
    } else if (namePart(text[at]) || text[at] === '\\') {
      const name = nameAt(text, at);
      at = skipSpace(text, name.next);
      if (name.value === 'url' && text[at] === '(') {
        const value = urlAt(text, at + 1);
        if (value.closed && isLinkedAsset(value.value)) return true;
        at = value.next;
      }
    } else at += 1;
  }
  return false;
}

/** XML stylesheet instructions have pseudo-attributes, not DOM attributes. */
export function stylesheetLinksAssets(instruction) {
  const reference = /(?:^|\s)href\s*=\s*("[^"]*"|'[^']*')/.exec(instruction)?.[1];
  if (!reference) return false;
  const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
  const value = reference.slice(1, -1).replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (whole, entity) => {
    if (!entity.startsWith('#')) return entities[entity] ?? whole;
    const code = entity[1].toLowerCase() === 'x'
      ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
    return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff)
      ? String.fromCodePoint(code) : whole;
  });
  return isLinkedAsset(value);
}

/**
 * Parse into a detached XML document solely for inspection. Its nodes never
 * enter the page, and neither scripts nor dependency URLs gain a load step.
 * The renderer's own root adjustment also covers SVGs missing xmlns.
 * Parser failures remain the existing rasteriser's decision, not a new refusal.
 */
export function svgLinksAssets(text) {
  try {
    const document = new DOMParser().parseFromString(sizedSvg(text, 1, 1), 'image/svg+xml');
    if (document.getElementsByTagName('parsererror').length) return false;
    for (const node of document.childNodes) {
      if (node.nodeType === 7 && node.target === 'xml-stylesheet'
          && stylesheetLinksAssets(node.data)) return true;
    }
    for (const node of document.getElementsByTagName('*')) {
      if (node.namespaceURI !== SVG) continue;
      if (RESOURCES.has(node.localName)
          && isLinkedAsset(node.getAttribute('href') ?? node.getAttributeNS(XLINK, 'href'))) return true;
      if (node.localName === 'style' && cssLinksAssets(node.textContent)) return true;
      if (cssLinksAssets(node.getAttribute('style') ?? '')) return true;
    }
    return false;
  } catch {
    return false;
  }
}
