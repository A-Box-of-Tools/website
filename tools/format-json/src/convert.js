/**
 * Converting between the formats, which is four conversions and one shared
 * tree.
 *
 * The tree is the one json.js describes. A conversion is therefore never a
 * conversion: it is one parser and one printer, chosen from the list, with
 * nothing in between them that knows about both formats at once. That is what
 * keeps "JSON to YAML" and "YAML to JSON" from disagreeing about what a
 * document said.
 *
 * WHAT IS LOST, SAID OUT LOUD
 *
 * No two of these formats hold the same set of things, and a converter that
 * pretends otherwise is where the surprises come from:
 *
 *   - **JSON to YAML** loses nothing. Every JSON document is a YAML document.
 *   - **YAML to JSON** loses comments, because JSON has nowhere to put one,
 *     and refuses outright on anchors, aliases and tags rather than guessing
 *     (see yaml.js).
 *   - **JSON to XML** has to invent element names for the members of an array
 *     and cannot represent an empty object and an empty string differently.
 *   - **XML to JSON** loses the order of mixed content, comments, and the
 *     distinction between an attribute and a child element - the last one is
 *     softened by the usual `@` prefix rather than erased.
 *
 * Each of those is on the page beside the button that does it, not only here.
 */

import { parseJson, printJson } from './json.js';
import { parseYaml, printYaml } from './yaml.js';
import { parseXml, printXml } from './xml.js';

/* -------------------------------------------------------------- JSON, YAML */

export function jsonToYaml(text, { indent = 2 } = {}) {
  return printYaml(parseJson(text), { indent });
}

export function yamlToJson(text, { indent = '  ', sortKeys = false } = {}) {
  return `${printJson(stripRaw(parseYaml(text)), { indent, sortKeys })}\n`;
}

/**
 * Drop the `raw` tokens a JSON parse leaves behind.
 *
 * They exist so that formatting JSON does not rewrite its own strings, and
 * they are exactly wrong on the way out of another format: a YAML string
 * carrying a JSON token would be printed as that token. Nothing that has been
 * through another parser has one, so this only matters for JSON in and JSON
 * out - where the point is to keep them.
 */
function stripRaw(node) {
  switch (node.t) {
    case 'map': return { t: 'map', pairs: node.pairs.map((pair) => ({ key: pair.key, value: stripRaw(pair.value) })) };
    case 'seq': return { t: 'seq', items: node.items.map(stripRaw) };
    case 'str': return { t: 'str', value: node.value };
    default: return node;
  }
}

/* --------------------------------------------------------------- JSON, XML */

/**
 * JSON to XML.
 *
 * An array becomes one element per item, repeating the key - which is how
 * every XML schema that holds a list is written, and the only shape that
 * survives being read back. A top-level array has no key to repeat, so its
 * items are called `item`.
 */
export function jsonToXml(text, { indent = '  ', root = 'root' } = {}) {
  const data = parseJson(text);
  const lines = [];
  const pad = (depth) => indent.repeat(depth);

  const write = (name, node, depth) => {
    const tag = xmlName(name);
    switch (node.t) {
      case 'map':
        if (!node.pairs.length) { lines.push(`${pad(depth)}<${tag}/>`); return; }
        lines.push(`${pad(depth)}<${tag}>`);
        for (const pair of node.pairs) write(pair.key, pair.value, depth + 1);
        lines.push(`${pad(depth)}</${tag}>`);
        return;
      case 'seq':
        if (!node.items.length) { lines.push(`${pad(depth)}<${tag}/>`); return; }
        for (const item of node.items) write(name, item, depth);
        return;
      case 'null':
        lines.push(`${pad(depth)}<${tag}/>`);
        return;
      default:
        lines.push(`${pad(depth)}<${tag}>${escapeXml(scalarText(node))}</${tag}>`);
    }
  };

  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  if (data.t === 'seq') {
    lines.push(`<${xmlName(root)}>`);
    for (const item of data.items) write('item', item, 1);
    lines.push(`</${xmlName(root)}>`);
  } else {
    write(root, data, 0);
  }
  return `${lines.join('\n')}\n`;
}

function scalarText(node) {
  if (node.t === 'num') return node.raw;
  if (node.t === 'bool') return node.value ? 'true' : 'false';
  return node.value;
}

/**
 * A JSON key is any string; an XML element name is not. Anything an element
 * name cannot hold is replaced rather than dropped, and a name that would
 * start with a digit gets a leading underscore, because the alternative is
 * emitting a document that no XML parser will read back.
 */
function xmlName(key) {
  const cleaned = String(key).replace(/[^A-Za-z0-9_.:-]/g, '_');
  return /^[A-Za-z_]/.test(cleaned) ? cleaned : `_${cleaned}`;
}

function escapeXml(text) {
  return String(text).replace(/[&<>]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]));
}

/**
 * XML to JSON, in the arrangement everything else uses: an attribute becomes a
 * member whose name starts with `@`, an element's own text becomes `#text`
 * when it has to sit beside something else, and repeated children become an
 * array.
 *
 * Everything is a string. XML has no types - `<port>8080</port>` says nothing
 * about whether that is a number - and a converter that decided for you would
 * be inventing information that then travels on as if it were in the file.
 */
export function xmlToJson(text, { indent = '  ' } = {}) {
  const nodes = parseXml(text);
  const elements = nodes.filter((node) => node.t === 'element');
  if (!elements.length) {
    return `${printJson({ t: 'map', pairs: [] }, { indent })}\n`;
  }
  const root = elements[0];
  const data = { t: 'map', pairs: [{ key: root.name, value: elementData(root) }] };
  return `${printJson(data, { indent })}\n`;
}

function elementData(element) {
  const pairs = [];
  for (const attr of element.attrs) {
    pairs.push({ key: `@${attr.name}`, value: { t: 'str', value: unescapeXml(attr.value ?? '') } });
  }

  const children = element.children.filter((child) => child.t === 'element');
  const text = element.children
    .filter((child) => child.t === 'text' || child.t === 'cdata')
    .map((child) => (child.t === 'cdata' ? child.text : unescapeXml(child.text)))
    .join('')
    .trim();

  if (!children.length) {
    if (!pairs.length) {
      return text === '' ? { t: 'null' } : { t: 'str', value: text };
    }
    if (text !== '') pairs.push({ key: '#text', value: { t: 'str', value: text } });
    return { t: 'map', pairs };
  }

  // Children with the same name are one array, wherever they appeared. Two
  // elements called `item` separated by a third called something else are
  // still two items of the same list.
  const order = [];
  const byName = new Map();
  for (const child of children) {
    if (!byName.has(child.name)) { byName.set(child.name, []); order.push(child.name); }
    byName.get(child.name).push(elementData(child));
  }
  for (const name of order) {
    const list = byName.get(name);
    pairs.push({ key: name, value: list.length === 1 ? list[0] : { t: 'seq', items: list } });
  }
  if (text !== '') pairs.push({ key: '#text', value: { t: 'str', value: text } });
  return { t: 'map', pairs };
}

function unescapeXml(text) {
  return text.replace(/&(lt|gt|amp|quot|apos|#[0-9]+|#[xX][0-9a-fA-F]+);/g, (whole, body) => {
    if (body[0] === '#') {
      const code = body[1] === 'x' || body[1] === 'X'
        ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
    }
    return { lt: '<', gt: '>', amp: '&', quot: '"', apos: "'" }[body];
  });
}

/* ---------------------------------------------------------------- the list */

/**
 * The conversions the page offers. One list again, so the menu and the work
 * cannot disagree, and each one carries the key of the sentence that says
 * what it costs.
 *
 * The key rather than the sentence: this file is copied byte for byte into
 * every language, and `note` is read out on the page. `name` stays as it is,
 * `name` is a key as well: it is what the menu says, and "to" is an
 * English word.
 */
export const CONVERSIONS = [
  {
    id: 'json-yaml',
    name: 'convert.json-yaml.name',
    note: 'convert.json-yaml',
    run: (text, options) => jsonToYaml(text, { indent: options.spaces }),
    output: 'yaml',
  },
  {
    id: 'yaml-json',
    name: 'convert.yaml-json.name',
    note: 'convert.yaml-json',
    run: (text, options) => yamlToJson(text, { indent: options.indent, sortKeys: options.sortKeys }),
    output: 'json',
  },
  {
    id: 'json-xml',
    name: 'convert.json-xml.name',
    note: 'convert.json-xml',
    run: (text, options) => jsonToXml(text, { indent: options.indent, root: options.root || 'root' }),
    output: 'xml',
  },
  {
    id: 'xml-json',
    name: 'convert.xml-json.name',
    note: 'convert.xml-json',
    run: (text, options) => xmlToJson(text, { indent: options.indent }),
    output: 'json',
  },
];

export const conversionById = (id) => CONVERSIONS.find((item) => item.id === id) ?? CONVERSIONS[0];
