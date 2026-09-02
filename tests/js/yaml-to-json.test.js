/**
 * tools/yaml-to-json/src/convert.js - what is particular to the split-out page.
 *
 * The conversions themselves are covered by tests/js/text-convert.test.js,
 * which imports json-formatter's copy; tests/python/test_duplicates.py holds
 * the two parsers identical, so testing the arithmetic twice would only prove
 * that the copy is a copy.
 *
 * What is NOT covered there is the reason this page exists as its own tool:
 * that its menu offers the two YAML directions and neither XML one, and that
 * it does so without shipping an XML parser. A future tidy-up that "restored"
 * the missing conversions here, or reunited this convert.js with the one it
 * was trimmed from, would pass every other test in the repository.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

import {
  jsonToYaml, yamlToJson, CONVERSIONS, conversionById,
} from '../../tools/yaml-to-json/src/convert.js';

test('the menu is the two YAML directions, in the order the page is named for', () => {
  assert.deepEqual(CONVERSIONS.map((item) => item.id), ['yaml-json', 'json-yaml']);
  // The page is /yaml-to-json/, so YAML to JSON is what it opens on.
  assert.equal(CONVERSIONS[0].id, 'yaml-json');
});

test('every conversion carries the keys the page reads out', () => {
  for (const conversion of CONVERSIONS) {
    // Keys rather than sentences: src/ is copied byte for byte into fifteen
    // languages, so a sentence written here would be English in all of them.
    assert.match(conversion.name, /^convert\./);
    assert.match(conversion.note, /^convert\./);
    assert.equal(typeof conversion.run, 'function');
    assert.ok(['json', 'yaml'].includes(conversion.output));
  }
});

test('an unknown id falls back to the first direction rather than throwing', () => {
  assert.equal(conversionById('xml-json').id, 'yaml-json');
  assert.equal(conversionById(undefined).id, 'yaml-json');
});

test('this tool ships no XML parser, and nothing here reaches for one', () => {
  // The parsers are shared parts now, so "ships" is decided by tool.toml: a
  // part a tool does not ask for is not copied into it, and an import of one
  // fails the build. Both halves are checked, because either alone would let
  // three hundred lines of XML parser onto a page that never mentions XML.
  const files = readdirSync('tools/yaml-to-json/src');
  assert.ok(!files.includes('xml.js'), 'an XML parser has appeared in a tool that never mentions XML');
  const toml = readFileSync('tools/yaml-to-json/tool.toml', 'utf8');
  assert.ok(!/"parse-xml"/.test(toml), 'tool.toml has started asking for the shared XML parser');
  const source = readFileSync('tools/yaml-to-json/src/convert.js', 'utf8');
  assert.ok(!/parse-xml\.js|\/xml\.js/.test(source), 'convert.js has grown an import of the XML parser');
});

test('YAML to JSON keeps 1.2 semantics and the digits it was given', () => {
  const out = yamlToJson('country: no\naccount: 90071992547409931234\n', { indent: '' });
  // The Norway bug: YAML 1.1 read `no` as false. 1.2 does not, and neither
  // does this - and JSON.parse would have rounded the account number.
  assert.match(out, /"country":"no"/);
  assert.match(out, /"account":90071992547409931234/);
});

test('an anchor stops the conversion rather than being guessed at', () => {
  assert.throws(() => yamlToJson('base: &a\n  x: 1\n'), (error) => {
    assert.equal(error.name, 'ParseError');
    assert.equal(error.reason, 'yaml.anchors');
    return true;
  });
});

test('JSON to YAML quotes the words a 1.1 reader would misread', () => {
  const out = jsonToYaml('{"a":"no","b":"yes","c":"1.10"}');
  for (const value of ["'no'", "'yes'", "'1.10'"]) {
    assert.ok(out.includes(value), `${value} was written back unquoted: ${out}`);
  }
});

test('the example the page offers actually converts', () => {
  // A "Try an example" button that reports a parse error is worse than no
  // button at all, and json-formatter shipped exactly that for four days:
  // its JSON sample held a real newline inside a string, which is not JSON.
  const url = new URL('../../tools/yaml-to-json/src/samples.js', import.meta.url);
  return import(url).then(({ SAMPLES }) => {
    assert.doesNotThrow(() => yamlToJson(SAMPLES['yaml-json'].a, { indent: '  ' }));
    assert.doesNotThrow(() => jsonToYaml(SAMPLES['json-yaml'].a, { indent: 2 }));
  });
});
