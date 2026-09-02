/**
 * Formatting: which language this is, and laying it out or squeezing it flat.
 *
 * Nothing here does any of the work - the shared parse-json, parse-xml and
 * parse-yaml modules and css.js do -
 * and that is the point of the file. The page needs one function that takes
 * some text and a choice of language, and one that guesses the language when
 * the choice is "whatever this is", and neither belongs inside a parser.
 */

import { parseJson, printJson } from './shared/parse-json.js';
import { parseXml, printXml } from './shared/parse-xml.js';
import { parseCss, printCss } from './css.js';
import { parseYaml, printYaml } from './shared/parse-yaml.js';

/** Everything the language menu offers, and what each one can be asked for. */
export const LANGUAGES = [
  { id: 'json', name: 'JSON', minifies: true, sorts: true },
  { id: 'xml', name: 'XML', minifies: true, sorts: false },
  { id: 'html', name: 'HTML', minifies: true, sorts: false },
  { id: 'css', name: 'CSS', minifies: true, sorts: false },
  { id: 'yaml', name: 'YAML', minifies: false, sorts: false },
];

export const languageById = (id) => LANGUAGES.find((item) => item.id === id) ?? LANGUAGES[0];

/**
 * @param {string} text
 * @param {object} options
 * @param {string} options.language   one of the ids above
 * @param {boolean} [options.minify]
 * @param {string} [options.indent]   one level of indentation
 * @param {boolean} [options.sortKeys]
 * @returns {string}
 */
export function formatText(text, { language, minify = false, indent = '  ', sortKeys = false }) {
  return endWithNewline(run());

  function run() {
    switch (language) {
      case 'json':
        return printJson(parseJson(text), { indent: minify ? '' : indent, sortKeys });
      case 'xml':
        return printXml(parseXml(text), { indent, minify });
      case 'html':
        return printXml(parseXml(text, { html: true }), { indent, minify, html: true });
      case 'css':
        return printCss(parseCss(text), { indent, minify });
      case 'yaml':
        // YAML has no minified form worth writing: flow style is shorter and
        // unreadable, which is the opposite of the reason to keep a file in
        // YAML at all. The button that would ask for it is disabled instead.
        return printYaml(parseYaml(text), { indent: indent === '\t' ? 2 : indent.length || 2 });
      default:
        const wrong = new Error('format.unknown');
  wrong.values = { language };
  throw wrong;
    }
  }
}

/**
 * One newline at the end, whatever the printer did. Every printer here is
 * writing a file, and a file ends with a newline; the difference between them
 * about whether they add it themselves is not worth carrying into the page.
 */
function endWithNewline(text) {
  return text.endsWith('\n') ? text : `${text}\n`;
}

/**
 * Guess what was pasted in.
 *
 * The guess is a starting position, not a verdict: it sets the menu, the menu
 * is visible, and a wrong guess is one click to correct. So the tests are the
 * cheap ones - what the text starts with, and whether it parses - rather than
 * an attempt at certainty that would be slower and still sometimes wrong.
 *
 * @returns {string|null} a language id, or null if nothing here fits
 */
export function detectLanguage(text) {
  const trimmed = stripLeadingComments(text.trim());
  if (trimmed === '') return null;

  if (trimmed.startsWith('<')) {
    return looksLikeHtml(trimmed) ? 'html' : 'xml';
  }

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    if (parses(() => parseJson(text))) return 'json';
    // A stylesheet that opens with a `{` is not a thing, so anything that
    // starts this way and is not JSON is still JSON - broken JSON, whose error
    // the reader wants to see.
    return 'json';
  }

  if (looksLikeCss(trimmed)) return 'css';
  if (parses(() => parseJson(text))) return 'json';
  if (looksLikeYaml(trimmed) && parses(() => parseYaml(text))) return 'yaml';
  return null;
}

function parses(run) {
  try {
    run();
    return true;
  } catch {
    return false;
  }
}

/** A leading comment says nothing about the language, so it is stepped over. */
function stripLeadingComments(text) {
  let rest = text;
  for (;;) {
    if (rest.startsWith('/*')) {
      const end = rest.indexOf('*/');
      if (end < 0) return rest;
      rest = rest.slice(end + 2).trimStart();
      continue;
    }
    if (rest.startsWith('//')) {
      const end = rest.indexOf('\n');
      if (end < 0) return '';
      rest = rest.slice(end + 1).trimStart();
      continue;
    }
    return rest;
  }
}

const HTML_MARKERS = /^<(!doctype html|html|head|body|div|p|span|table|ul|ol|section|main|nav|header|footer|h[1-6]|script|style|meta|link|form|a|img|br)\b/i;

function looksLikeHtml(trimmed) {
  if (/^<\?xml/i.test(trimmed)) return false;
  if (HTML_MARKERS.test(trimmed)) return true;
  // A tag that never closes is HTML by definition; XML has no such thing.
  return /<(br|hr|img|meta|link|input)\b[^>]*[^/]>/i.test(trimmed);
}

/**
 * CSS is `selector { property: value; }`, and the shape is distinctive enough
 * to test for directly: a brace, with a colon and a semicolon inside it, and
 * something in front of it that is not a quote.
 */
function looksLikeCss(trimmed) {
  if (/^@(media|import|charset|font-face|supports|layer|keyframes|tailwind|use)\b/i.test(trimmed)) return true;
  const open = trimmed.indexOf('{');
  if (open < 1) return false;
  const close = trimmed.indexOf('}', open);
  if (close < 0) return false;
  const body = trimmed.slice(open + 1, close);
  return /[-a-zA-Z]\s*:\s*[^;]+;/.test(body) && !/^\s*["']/.test(trimmed);
}

/** `key: value` or `- item`, at the start of a line, more than once or once. */
function looksLikeYaml(trimmed) {
  if (trimmed.startsWith('---')) return true;
  return /^[ \t]*(-\s+\S|[A-Za-z_"'][^\n:]*:(\s|$))/m.test(trimmed);
}
