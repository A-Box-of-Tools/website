/**
 * tools/json-formatter/src/convert.js - JSON to and from YAML and XML.
 *
 * The tests that matter here are the round trips, because a converter is only
 * useful if the document that comes back is the document that went in. Where
 * that is not possible - and it is not, in two of the four directions - the
 * test says what is lost instead, so that the loss is a decision on record
 * rather than something a reader discovers in their own file.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  jsonToYaml, yamlToJson, jsonToXml, xmlToJson, CONVERSIONS,
} from '../../tools/json-formatter/src/convert.js';

const round = (text) => yamlToJson(jsonToYaml(text), { indent: '' }).trim();

test('JSON to YAML and back is the same document', () => {
  const samples = [
    '{"a":1,"b":"two","c":true,"d":null}',
    '{"list":[1,2,3],"nested":{"x":{"y":"z"}}}',
    '{"empty_map":{},"empty_list":[],"empty_string":""}',
    '{"tricky":["yes","no","true","1.0","null","- dash",": colon","#hash"]}',
    '{"deep":[[1,2],[3,[4,5]]]}',
    '{"unicode":"caf\\u00e9 \\u00e0 la carte"}',
    '[{"id":1},{"id":2}]',
  ];
  for (const sample of samples) {
    assert.equal(round(sample), sample.replace(/\\u00e9/g, 'é').replace(/\\u00e0/g, 'à'),
      sample);
  }
});

test('YAML to JSON: what YAML has that JSON does not', () => {
  const yaml = [
    '# this comment cannot survive',
    'name: thing        # nor this one',
    'count: 3',
    'enabled: true',
    'missing: ~',
    'country: no',
    'version: 1.0',
    'quoted: "1.0"',
    'script: |',
    '  first',
    '  second',
    'items:',
    '  - a',
    '  - b',
  ].join('\n');

  const out = JSON.parse(yamlToJson(yaml));
  assert.deepEqual(out, {
    name: 'thing',
    count: 3,
    enabled: true,
    missing: null,
    // The Norway problem: in YAML 1.1 this was `false`, and in 1.2 - and here -
    // it is the string it looks like.
    country: 'no',
    version: 1.0,
    quoted: '1.0',
    script: 'first\nsecond\n',
    items: ['a', 'b'],
  });
});

test('YAML to JSON: a number keeps the digits it was written with', () => {
  const out = yamlToJson('big: 123456789012345678901234567890\nexp: 1e999\n', { indent: '' });
  assert.equal(out.trim(), '{"big":123456789012345678901234567890,"exp":1e999}');
});

test('YAML to JSON: what YAML allows that JSON does not is normalised', () => {
  const out = yamlToJson('a: +1\nb: .5\nc: 0x1f\nd: 0o17\n', { indent: '' });
  assert.equal(out.trim(), '{"a":1,"b":0.5,"c":31,"d":15}');
});

test('JSON to XML: an array becomes a repeated element', () => {
  const xml = jsonToXml('{"item":[1,2],"one":{"deep":"x"},"nothing":null}');
  assert.equal(xml, [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<root>',
    '  <item>1</item>',
    '  <item>2</item>',
    '  <one>',
    '    <deep>x</deep>',
    '  </one>',
    '  <nothing/>',
    '</root>',
    '',
  ].join('\n'));
});

test('JSON to XML: names an element cannot have are repaired, not emitted', () => {
  const xml = jsonToXml('{"a b":1,"1st":2,"ok-name":3}');
  assert.match(xml, /<a_b>1<\/a_b>/);
  assert.match(xml, /<_1st>2<\/_1st>/);
  assert.match(xml, /<ok-name>3<\/ok-name>/);
});

test('JSON to XML: text that would otherwise be markup is escaped', () => {
  assert.match(jsonToXml('{"a":"<b> & </b>"}'), /<a>&lt;b&gt; &amp; &lt;\/b&gt;<\/a>/);
});

test('XML to JSON: attributes, text and repeated children', () => {
  const json = JSON.parse(xmlToJson([
    '<order id="7">',
    '  <customer>Ada</customer>',
    '  <line sku="a">1</line>',
    '  <line sku="b">2</line>',
    '  <note/>',
    '</order>',
  ].join('\n')));

  assert.deepEqual(json, {
    order: {
      '@id': '7',
      customer: 'Ada',
      line: [{ '@sku': 'a', '#text': '1' }, { '@sku': 'b', '#text': '2' }],
      note: null,
    },
  });
});

test('XML to JSON: every value stays a string, because XML never said otherwise', () => {
  const json = JSON.parse(xmlToJson('<a><port>8080</port><on>true</on></a>'));
  assert.equal(json.a.port, '8080');
  assert.equal(json.a.on, 'true');
});

test('XML to JSON: entities are read', () => {
  const json = JSON.parse(xmlToJson('<a>1 &lt; 2 &amp;&#38; 3 &gt; 2</a>'));
  assert.equal(json.a, '1 < 2 && 3 > 2');
});

test('the conversions on the menu all run', () => {
  const inputs = {
    'json-yaml': '{"a":1}',
    'yaml-json': 'a: 1\n',
    'json-xml': '{"a":1}',
    'xml-json': '<a>1</a>',
  };
  for (const conversion of CONVERSIONS) {
    const out = conversion.run(inputs[conversion.id], { indent: '  ', spaces: 2, sortKeys: false });
    assert.ok(out.trim().length, conversion.id);
    assert.ok(out.endsWith('\n'), `${conversion.id} ends with a newline`);
  }
});
