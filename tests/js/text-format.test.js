/**
 * shared/js/parse-{json,xml,yaml,errors}.js and
 * tools/json-formatter/src/{css,format}.js - the formatters.
 *
 * The thing being checked throughout is that formatting changes the layout and
 * nothing else. A formatter that reorders keys, rounds a number, drops a
 * duplicate or moves a space that meant something is not doing its job badly,
 * it is doing a different job on somebody's file - which is why most of what
 * follows is a round trip rather than a comparison against expected output.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { parseJson, printJson } from '../../shared/js/parse-json.js';
import { parseXml, printXml } from '../../shared/js/parse-xml.js';
import { parseCss, printCss } from '../../tools/json-formatter/src/css.js';
import { parseYaml, printYaml } from '../../shared/js/parse-yaml.js';
import { formatText, detectLanguage } from '../../tools/json-formatter/src/format.js';
import { ParseError } from '../../shared/js/parse-errors.js';

const json = (text, options) => printJson(parseJson(text), options);

/* -------------------------------------------------------------------- JSON */

test('JSON: laid out and squeezed flat', () => {
  assert.equal(json('{"a":1,"b":[1,2]}'), '{\n  "a": 1,\n  "b": [\n    1,\n    2\n  ]\n}');
  assert.equal(json('{ "a" : 1 , "b" : [ 1 , 2 ] }', { indent: '' }), '{"a":1,"b":[1,2]}');
  assert.equal(json('{}'), '{}');
  assert.equal(json('[]'), '[]');
  assert.equal(json('{"a":{}}'), '{\n  "a": {}\n}');
});

test('JSON: a tab is a valid indentation', () => {
  assert.equal(json('{"a":1}', { indent: '\t' }), '{\n\t"a": 1\n}');
});

test('JSON: keys keep the order they were written in', () => {
  // This is the one JSON.parse cannot do: its integer-like keys come back in
  // numeric order, so the round trip below would come out as 2, 10, x.
  const text = '{"10":1,"2":2,"x":3}';
  assert.equal(json(text, { indent: '' }), text);
  assert.deepEqual(Object.keys(JSON.parse(text)), ['2', '10', 'x'],
    'if this ever fails, the reason for a hand-written parser has changed');
});

test('JSON: numbers are copied, never re-computed', () => {
  for (const number of ['1e999', '0.1', '1.0', '1E+2', '123456789012345678901234567890', '-0']) {
    assert.equal(json(`{"n":${number}}`, { indent: '' }), `{"n":${number}}`);
  }
  // What the round trip through a double would have done to two of those.
  assert.equal(JSON.stringify(JSON.parse('{"n":1e999}')), '{"n":null}');
});

test('JSON: duplicate keys are both kept', () => {
  assert.equal(json('{"a":1,"a":2}', { indent: '' }), '{"a":1,"a":2}');
});

test('JSON: strings come back as they were written', () => {
  const text = '{"a":"caf\\u00e9","b":"tab\\there","c":"\\\\","d":"\\u0041"}';
  assert.equal(json(text, { indent: '' }), text);
});

test('JSON: sorting keys is by how they read, not by code point', () => {
  const sorted = json('{"item10":1,"item2":2,"item1":3}', { indent: '', sortKeys: true });
  assert.equal(sorted, '{"item1":3,"item2":2,"item10":1}');
});

test('JSON: what it refuses, and where it says the problem is', () => {
  const cases = [
    ['{"a":1,}', 'trailing comma'],
    ["{'a':1}", 'single quotes'],
    ['{a:1}', 'unquoted key'],
    ['{"a":01}', 'leading zero'],
    ['{"a":.5}', 'no digit before the point'],
    ['{"a":1}extra', 'text after the value'],
    ['{"a":"unclosed}', 'unclosed string'],
    ['[1,2', 'unclosed array'],
  ];
  for (const [text, why] of cases) {
    assert.throws(() => parseJson(text), ParseError, why);
  }
});

test('JSON: the error carries a line and a column', () => {
  try {
    parseJson('{\n  "a": 1,\n  "b": nope\n}');
    assert.fail('should have thrown');
  } catch (error) {
    assert.equal(error.line, 3);
    assert.equal(error.column, 8);
    // The message is the phrase key now. Where it stopped is these two
    // numbers, and the sentence that puts them around the reason lives in
    // body.html: "(line 3, column 8)" is English word order like any other.
    assert.equal(error.message, 'json.unexpected');
    assert.equal(error.reason, 'json.unexpected');
    assert.deepEqual(error.values, { found: { key: 'char.is', values: { ch: 'n' } } });
  }
});

/* --------------------------------------------------------------------- XML */

const xml = (text, options) => printXml(parseXml(text), options);

test('XML: indented, and squeezed back to one line', () => {
  const source = '<a><b x="1">text</b><c/></a>';
  assert.equal(xml(source), '<a>\n  <b x="1">text</b>\n  <c/>\n</a>\n');
  assert.equal(xml('<a>\n  <b x="1">text</b>\n  <c/>\n</a>', { minify: true }), source);
});

test('XML: attribute order and quoting are left alone', () => {
  assert.equal(xml("<a z='1' m=\"2\" a='3'/>", { minify: true }), "<a z='1' m=\"2\" a='3'/>");
});

test('XML: comments, CDATA and the declaration survive', () => {
  const source = '<?xml version="1.0"?>\n<!-- note -->\n<a><![CDATA[ <not a tag> ]]></a>';
  const out = xml(source);
  assert.match(out, /<\?xml version="1\.0"\?>/);
  assert.match(out, /<!-- note -->/);
  assert.match(out, /<!\[CDATA\[ <not a tag> \]\]>/);
});

test('XML: strictness is the whole difference from HTML', () => {
  assert.throws(() => parseXml('<a><b></a>'), ParseError);
  assert.throws(() => parseXml('<a>'), ParseError);
  assert.throws(() => parseXml('<a b=1/>'), ParseError);
  assert.throws(() => parseXml('<a disabled/>'), ParseError);
});

test('HTML: void elements never close', () => {
  const out = printXml(parseXml('<p>one<br>two</p>', { html: true }), { html: true });
  assert.equal(out, '<p>one<br>two</p>\n');
});

test('HTML: one list item ends the last one', () => {
  const out = printXml(parseXml('<ul><li>a<li>b</ul>', { html: true }), { html: true });
  assert.equal(out, '<ul>\n  <li>a</li>\n  <li>b</li>\n</ul>\n');
});

test('HTML: a script is not markup', () => {
  const source = '<script>if (a < b && c > d) { go(); }</script>';
  const out = printXml(parseXml(source, { html: true }), { html: true });
  assert.equal(out, `${source}\n`);
});

test('HTML: pre is copied through exactly', () => {
  const source = '<div><pre>  two spaces\n    and four\n</pre></div>';
  const out = printXml(parseXml(source, { html: true }), { html: true });
  assert.match(out, /<pre>  two spaces\n    and four\n<\/pre>/);
});

test('HTML: bare attributes and unquoted values are allowed', () => {
  const out = printXml(parseXml('<input disabled value=yes>', { html: true }), { html: true });
  assert.equal(out, '<input disabled value="yes">\n');
});

/* --------------------------------------------------------------------- CSS */

const css = (text, options) => printCss(parseCss(text), options);

test('CSS: laid out', () => {
  assert.equal(css('a{color:red;background:blue}'),
    'a {\n  color: red;\n  background: blue;\n}\n');
});

test('CSS: a selector list is one per line, and joins back up', () => {
  assert.equal(css('h1,h2 , h3{margin:0}'), 'h1,\nh2,\nh3 {\n  margin: 0;\n}\n');
  assert.equal(css('h1,\nh2 {\n  margin: 0;\n}', { minify: true }), 'h1,h2{margin:0}');
});

test('CSS: at-rules nest, and the ones with no block keep their semicolon', () => {
  const source = '@import url("x.css");\n@media (min-width: 40em) {\n  a { color: red; }\n}';
  assert.equal(css(source, { minify: true }),
    '@import url("x.css");@media (min-width: 40em){a{color:red}}');
  assert.match(css(source), /@media \(min-width: 40em\) \{\n {2}a \{\n {4}color: red;\n {2}\}\n\}/);
});

test('CSS: a custom property value is never touched', () => {
  // The value of a custom property is an unparsed token stream: `+` alone is
  // legal, and so is a value that would be nonsense anywhere else. Whitespace
  // inside it is part of it - only the space either side of the whole value is
  // the parser's, and that is what the standard drops too.
  assert.equal(css('a{--op:  + ;color:red}', { minify: true }), 'a{--op:+;color:red}');
  assert.equal(css('a{--gap: calc( 1px  +  2px )}', { minify: true }),
    'a{--gap:calc( 1px  +  2px )}');
  assert.equal(css('a{margin: calc( 1px  +  2px )}', { minify: true }),
    'a{margin:calc( 1px + 2px )}');
});

test('CSS: a semicolon inside a URL does not end the declaration', () => {
  const source = 'a{background:url("data:image/svg+xml;base64,AAA=");color:red}';
  assert.equal(css(source, { minify: true }), source);
});

test('CSS: comments are kept when laying out and dropped when squeezing', () => {
  assert.match(css('/* why */\na{color:red}'), /\/\* why \*\//);
  assert.equal(css('/* why */\na{color:red}', { minify: true }), 'a{color:red}');
});

test('CSS: what it refuses', () => {
  assert.throws(() => parseCss('a{color:red'), ParseError);
  assert.throws(() => parseCss('a{color red;}'), ParseError);
  assert.throws(() => parseCss('a{content:"x}'), ParseError);
});

/* -------------------------------------------------------------------- YAML */

test('YAML: a document laid out again is the same document', () => {
  const source = 'name: thing\nlist:\n  - one\n  - two\nnested:\n  a: 1\n  b: true\n';
  assert.equal(printYaml(parseYaml(source)), source);
});

test('YAML: strings are quoted exactly when leaving them bare would lie', () => {
  const data = parseYaml('a: yes\nb: "1.0"\nc: plain text\nd: "true"\ne: ""\n');
  const out = printYaml(data);
  // `yes` is a string in YAML 1.2 and is read as one - and written back
  // quoted, so that a reader still on 1.1 cannot turn it into a boolean.
  assert.match(out, /^a: 'yes'$/m);
  assert.match(out, /^b: '1\.0'$/m);
  assert.match(out, /^c: plain text$/m);
  assert.match(out, /^d: 'true'$/m);
  assert.match(out, /^e: ''$/m);
});

test('YAML: a multi-line string comes back as a block scalar', () => {
  const data = parseYaml('script: |\n  line one\n  line two\n');
  assert.equal(data.pairs[0].value.value, 'line one\nline two\n');
  assert.equal(printYaml(data), 'script: |\n  line one\n  line two\n');
});

test('YAML: comments and flow collections are read', () => {
  const data = parseYaml('# a note\na: [1, 2, "three"]  # trailing\nb: {x: 1, y: two}\n');
  assert.equal(data.pairs[0].value.items.length, 3);
  assert.equal(data.pairs[0].value.items[2].value, 'three');
  assert.equal(data.pairs[1].value.pairs[1].value.value, 'two');
});

test('YAML: a sequence of mappings, in both indentations', () => {
  const flat = parseYaml('items:\n- name: a\n  id: 1\n- name: b\n  id: 2\n');
  const deep = parseYaml('items:\n  - name: a\n    id: 1\n  - name: b\n    id: 2\n');
  assert.deepEqual(flat, deep);
  assert.equal(flat.pairs[0].value.items[1].pairs[0].value.value, 'b');
});

test('YAML: what it refuses to guess at', () => {
  assert.throws(() => parseYaml('a: &anchor 1\nb: *anchor\n'), /^ParseError: yaml\.anchors$/);
  assert.throws(() => parseYaml('a: !!binary aGk=\n'), /^ParseError: yaml\.tags$/);
  assert.throws(() => parseYaml('---\na: 1\n---\nb: 2\n'),
    /^ParseError: yaml\.documents$/);
});

test('YAML: a colon inside a value is not a key', () => {
  const data = parseYaml('url: http://example.com/a\n');
  assert.equal(data.pairs[0].value.value, 'http://example.com/a');
});

/* ---------------------------------------------------------------- the menu */

test('the language is guessed from the text', () => {
  assert.equal(detectLanguage('{"a": 1}'), 'json');
  assert.equal(detectLanguage('[1, 2]'), 'json');
  assert.equal(detectLanguage('<?xml version="1.0"?><a/>'), 'xml');
  assert.equal(detectLanguage('<!doctype html><html><body>hi</body></html>'), 'html');
  assert.equal(detectLanguage('<p>one<br>two</p>'), 'html');
  assert.equal(detectLanguage('a { color: red; }'), 'css');
  assert.equal(detectLanguage('@media screen { a { color: red } }'), 'css');
  assert.equal(detectLanguage('name: thing\nlist:\n  - one\n'), 'yaml');
  assert.equal(detectLanguage('   '), null);
  assert.equal(detectLanguage('just some prose, honestly'), null);
});

test('formatText is the one door the page uses', () => {
  assert.equal(formatText('{"a":1}', { language: 'json', minify: true }), '{"a":1}\n');
  assert.equal(formatText('a{color:red}', { language: 'css', minify: true }), 'a{color:red}\n');
  assert.equal(formatText('<a><b/></a>', { language: 'xml' }), '<a>\n  <b/>\n</a>\n');
  assert.throws(() => formatText('x', { language: 'klingon' }),
    (error) => error.message === 'format.unknown'
      && error.values.language === 'klingon');
});

test('formatting is idempotent - running it twice changes nothing', () => {
  const samples = [
    ['json', '{"b":2,"a":[1,{"c":null}]}'],
    ['xml', '<r><a x="1">t</a><b/></r>'],
    ['html', '<div><p>one<br>two</p><ul><li>a<li>b</ul></div>'],
    ['css', '@media (min-width:1px){a,b{color:red;--x:  raw }}'],
    ['yaml', 'a: 1\nb:\n  - x\n  - y: 2\n'],
  ];
  for (const [language, source] of samples) {
    const once = formatText(source, { language });
    assert.equal(formatText(once, { language }), once, language);
  }
});
