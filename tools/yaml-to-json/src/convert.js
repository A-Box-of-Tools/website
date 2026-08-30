/**
 * The two conversions this page offers, which are one parser and one printer
 * each with nothing in between them that knows about both formats at once.
 *
 * That is what keeps "YAML to JSON" and "JSON to YAML" from disagreeing about
 * what a document said: both go through the tree json.js describes, so there
 * is no second opinion about it anywhere.
 *
 * WHY THIS IS NOT json-formatter's convert.js
 *
 * That file is the same two functions plus the XML pair, and importing it here
 * would drag xml.js - three hundred lines of parser this page never calls -
 * into a tool that converts between two formats, neither of which is XML. The
 * JSON, YAML and error modules beside this one ARE byte-for-byte copies of that
 * tool's, declared in tests/python/test_duplicates.py so a fix to one is a fix
 * to all; this file is the deliberate exception and is declared there too, with
 * the reason. A shared module is not available: build.py copies shared/js into
 * a tool at src/shared/ at build time, and the JavaScript tests import these
 * modules straight off the disk.
 *
 * WHAT IS LOST, SAID OUT LOUD
 *
 * The two directions are not mirrors, and a converter that pretends otherwise
 * is where the surprises come from:
 *
 *   - **JSON to YAML** loses nothing. Every JSON document is a YAML document.
 *   - **YAML to JSON** loses comments, because JSON has nowhere to put one,
 *     and refuses outright on anchors, aliases and tags rather than guessing
 *     (see yaml.js).
 *
 * Both of those are on the page beside the menu that picks them, not only here.
 */

import { parseJson, printJson } from './json.js';
import { parseYaml, printYaml } from './yaml.js';

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

/**
 * The conversions the page offers. One list, so the menu and the work cannot
 * disagree, and each one carries the key of the sentence that says what it
 * costs.
 *
 * The key rather than the sentence: this file is copied byte for byte into
 * every language, and `note` is read out on the page. `name` is a key for the
 * same reason - it is what the menu says, and "to" is an English word.
 *
 * YAML to JSON is first because it is the direction the page is named for.
 */
export const CONVERSIONS = [
  {
    id: 'yaml-json',
    name: 'convert.yaml-json.name',
    note: 'convert.yaml-json',
    run: (text, options) => yamlToJson(text, { indent: options.indent, sortKeys: options.sortKeys }),
    output: 'json',
  },
  {
    id: 'json-yaml',
    name: 'convert.json-yaml.name',
    note: 'convert.json-yaml',
    run: (text, options) => jsonToYaml(text, { indent: options.spaces }),
    output: 'yaml',
  },
];

export const conversionById = (id) => CONVERSIONS.find((item) => item.id === id) ?? CONVERSIONS[0];
