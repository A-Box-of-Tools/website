import test from 'node:test';
import assert from 'node:assert/strict';
import { parseYaml } from '../../shared/js/parse-yaml.js';
import { jsonToXml, yamlToJson as formatterYaml, CONVERSIONS as formatterConversions } from '../../tools/json-formatter/src/convert.js';
import { yamlToJson as converterYaml, CONVERSIONS as yamlConversions } from '../../tools/yaml-to-json/src/convert.js';
import { conversionDiagnostics } from '../../shared/js/editor-feedback.js';

const yaml = `# top
empty: # null
items:
  - # null item
  - plain # trailing
quoted: "hash # stays" # dropped
flow: ["# quoted", value#kept] # dropped
script: | # header
  # literal text
  echo hi
`;

test('comment diagnostics come only from reader branches that discard a comment', () => {
  let count = 0;
  const data = parseYaml(yaml, { onComment() { count += 1; } });
  assert.equal(count, 7);
  assert.deepEqual(parseYaml(yaml), data, 'collecting comments must not alter the parsed value');
  const map = Object.fromEntries(data.pairs.map(({ key, value }) => [key, value]));
  assert.equal(map.quoted.value, 'hash # stays'); assert.equal(map.script.value, '# literal text\necho hi\n');
  assert.equal(map.flow.items[1].value, 'value#kept');
});

test('both YAML conversion consumers publish identical counts without changing output', () => {
  for (const convert of [formatterYaml, converterYaml]) {
    const diagnostics = conversionDiagnostics();
    assert.equal(convert(yaml, { onDiagnostic: diagnostics.record }), convert(yaml));
    assert.equal(diagnostics.report.comments, 7);
    assert.equal(JSON.parse(convert(yaml)).script, '# literal text\necho hi\n');
  }
  for (const conversions of [formatterConversions, yamlConversions]) {
    const diagnostics = conversionDiagnostics();
    conversions.find(item => item.id === 'yaml-json').run(yaml, { indent: '  ', onDiagnostic: diagnostics.record });
    assert.equal(diagnostics.report.comments, 7, 'the visible conversion must forward diagnostics');
  }
});

test('comment-free quoted hashes and block scalar content do not claim discarded comments', () => {
  let count = 0;
  parseYaml(String.raw`url: https://host/#part
single: 'it''s # text'
double: "escaped \" # text"
script: >-
  # text
  &literal
`, { onComment() { count += 1; } });
  assert.equal(count, 0);
});

test('unsupported constructs still fail at the first actual refusal instead of producing guessed data', () => {
  const cases = [['base: &a 1\ncopy: *a', 'yaml.anchors'], ['copy: *a', 'yaml.aliases'],
    ['value: !str 1', 'yaml.tags'], ['---\na: 1\n---\nb: 2', 'yaml.documents']];
  for (const [text, reason] of cases) {
    for (const convert of [formatterYaml, converterYaml]) assert.throws(() => convert(text, { onDiagnostic() {} }),
      error => error.name === 'ParseError' && error.reason === reason && error.line >= 1);
  }
});

test('repaired names disclose distinct sibling collisions and remove unbound namespace prefixes', () => {
  const diagnostics = conversionDiagnostics();
  const out = jsonToXml('{"a b":1,"a_b":2,"scope:key":3,"scope_key":4}', { onDiagnostic: diagnostics.record });
  assert.equal(diagnostics.report.names, 2); assert.equal(diagnostics.report.collisions, 2);
  assert.match(out, /<scope_key>3<\/scope_key>/); assert.doesNotMatch(out, /<scope:key>/);
  assert.deepEqual(diagnostics.report.examples, [{ from: 'a b', to: 'a_b' }, { from: 'scope:key', to: 'scope_key' }]);
});

test('array repetition and identical keys are not distinct-key name collisions', () => {
  const diagnostics = conversionDiagnostics();
  const out = jsonToXml('{"a b":[1,2,3],"repeat":1,"repeat":2}', { onDiagnostic: diagnostics.record });
  assert.equal(diagnostics.report.names, 1, 'one source key is repaired once regardless of array length');
  assert.equal(diagnostics.report.collisions, 0); assert.equal((out.match(/<a_b>/g) || []).length, 3);
});

test('collisions are scoped to siblings while nested maps and chosen root names still report repairs', () => {
  const diagnostics = conversionDiagnostics();
  jsonToXml('{"a b":1,"nested":{"a_b":2,"x y":3,"x_y":4}}', { root: 'scope:root', onDiagnostic: diagnostics.record });
  assert.equal(diagnostics.report.names, 3); assert.equal(diagnostics.report.collisions, 1);
  const array = conversionDiagnostics();
  assert.match(jsonToXml('[1,2]', { root: 'scope:root', onDiagnostic: array.record }), /<scope_root>/);
  assert.equal(array.report.names, 1);
  const forwarded = conversionDiagnostics();
  formatterConversions.find(item => item.id === 'json-xml').run('{"a b":1}', { indent: '  ', root: 'root', onDiagnostic: forwarded.record });
  assert.equal(forwarded.report.names, 1);
});
