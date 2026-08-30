/**
 * tools/xml-formatter/src/convert.js - what is particular to the split-out page.
 *
 * The conversions themselves are covered by tests/js/text-convert.test.js and
 * the parser by tests/js/text-format.test.js, both of which import
 * json-formatter's copies; tests/python/test_duplicates.py holds those
 * identical to these, so testing the arithmetic twice would only prove that a
 * copy is a copy.
 *
 * What is tested here is what this page claims that no other test covers:
 * that the menu is the two XML directions and neither YAML one, that no YAML
 * parser is shipped, and - the one that matters - that a DOCTYPE carrying an
 * external entity is text and never anything else.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

import {
  jsonToXml, xmlToJson, CONVERSIONS, conversionById,
} from '../../tools/xml-formatter/src/convert.js';
import { parseXml, printXml } from '../../tools/xml-formatter/src/xml.js';

test('the menu is the two XML directions, in the order the page is named for', () => {
  assert.deepEqual(CONVERSIONS.map((item) => item.id), ['xml-json', 'json-xml']);
  assert.equal(CONVERSIONS[0].id, 'xml-json');
});

test('every conversion carries the keys the page reads out', () => {
  for (const conversion of CONVERSIONS) {
    // Keys rather than sentences: src/ is copied byte for byte into fifteen
    // languages, so a sentence written here would be English in all of them.
    assert.match(conversion.name, /^convert\./);
    assert.match(conversion.note, /^convert\./);
    assert.equal(typeof conversion.run, 'function');
    assert.ok(['json', 'xml'].includes(conversion.output));
  }
});

test('an unknown id falls back to the first direction rather than throwing', () => {
  assert.equal(conversionById('yaml-json').id, 'xml-json');
  assert.equal(conversionById(undefined).id, 'xml-json');
});

test('this tool ships no YAML parser, and nothing here reaches for one', () => {
  const files = readdirSync('tools/xml-formatter/src');
  assert.ok(!files.includes('yaml.js'), 'a YAML parser has appeared in a tool that never mentions YAML');
  const source = readFileSync('tools/xml-formatter/src/convert.js', 'utf8');
  assert.ok(!/from '\.\/yaml\.js'/.test(source), 'convert.js has grown an import of yaml.js');
});

/*
 * The claim the page makes in its privacy panel, in its FAQ and in its README,
 * and the one worth a test of its own: external entities are not resolved.
 *
 * Not "are disabled" - there is no resolver in src/xml.js to disable. This
 * test is what stops somebody adding one for a plausible-sounding reason, so
 * it asserts the payload comes back as the characters it went in as.
 */
test('an external entity is never resolved, in either direction', () => {
  const xxe = '<?xml version="1.0"?>'
    + '<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>'
    + '<root><data>&xxe;</data></root>';

  const formatted = printXml(parseXml(xxe), { indent: '  ' });
  assert.ok(formatted.includes('&xxe;'), 'the entity reference was rewritten');
  assert.ok(!formatted.includes('root:x:'), 'an entity was resolved off the disk');

  const json = xmlToJson(xxe, { indent: '  ' });
  assert.match(json, /"data":\s*"&xxe;"/);
});

test('only the five entities XML defines are expanded', () => {
  const json = xmlToJson('<r><a>&lt;&amp;&gt;&quot;&apos;</a><b>&#65;&#x42;</b><c>&custom;</c></r>',
    { indent: '' });
  // Parsed rather than matched: the five expand to characters two of which
  // JSON then escapes again on the way out, and a regex over that reads as a
  // puzzle rather than as the claim being made.
  const { r } = JSON.parse(json);
  assert.equal(r.a, '<&>"\'');
  assert.equal(r.b, 'AB');
  // Anything else is somebody's own entity, and this has no way to know what
  // it meant - so it stays the text it was.
  assert.equal(r.c, '&custom;');
});

test('a broken document names the tag rather than the offset', () => {
  assert.throws(() => parseXml('<a><b>text</a>'), (error) => {
    assert.equal(error.name, 'ParseError');
    // The whole reason for a hand-written reader rather than DOMParser: it can
    // say which element was still open.
    assert.equal(error.reason, 'xml.crossed');
    assert.ok(error.line >= 1 && error.column >= 1);
    return true;
  });
});

test('every value out of XML is a string, because XML has no types', () => {
  const json = xmlToJson('<r><port>8080</port><on>true</on></r>', { indent: '' });
  assert.match(json, /"port":"8080"/);
  assert.match(json, /"on":"true"/);
});

test('an array becomes a repeated element, which is the shape that reads back', () => {
  const xml = jsonToXml('{"region":["eu-west","us-east"]}', { indent: '  ' });
  assert.equal((xml.match(/<region>/g) ?? []).length, 2);
  assert.match(xmlToJson(xml, { indent: '' }), /"region":\["eu-west","us-east"\]/);
});

test('the examples the page offers actually format and convert', () => {
  const url = new URL('../../tools/xml-formatter/src/samples.js', import.meta.url);
  return import(url).then(({ SAMPLES }) => {
    assert.doesNotThrow(() => printXml(parseXml(SAMPLES.format.a), { indent: '  ' }));
    assert.doesNotThrow(() => xmlToJson(SAMPLES.convert.a, { indent: '  ' }));

    // The formatting example has to have slack in it, or "squeeze it flat"
    // reports 0% off and reads as a broken button.
    const flat = printXml(parseXml(SAMPLES.format.a), { indent: '  ', minify: true });
    assert.ok(flat.length < SAMPLES.format.a.length,
      'the formatting sample is already flat, so minifying it saves nothing');
  });
});
