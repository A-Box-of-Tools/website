import test from 'node:test';
import assert from 'node:assert/strict';
import { ParseError } from '../../shared/js/parse-errors.js';
import { parseXml } from '../../shared/js/parse-xml.js';
import { parseJson } from '../../shared/js/parse-json.js';
import { sourceOffset, editorFeedback, conversionDiagnostics } from '../../shared/js/editor-feedback.js';

function controls(work, { withoutNotes = false } = {}) {
  const originalDocument = globalThis.document;
  const originalStyle = globalThis.getComputedStyle;
  const input = { value: 'broken text', clientHeight: 80, attributes: {}, focused: false,
    focus() { this.focused = true; }, setSelectionRange(start, end) { this.selection = [start, end]; },
    setAttribute(key, value) { this.attributes[key] = value; }, removeAttribute(key) { delete this.attributes[key]; } };
  const go = { hidden: true, addEventListener(name, action) { this.click = action; } };
  const notes = { hidden: true, items: [], append(item) { this.items.push(item); }, replaceChildren() { this.items = []; } };
  globalThis.document = { createElement() { return { textContent: '' }; } };
  globalThis.getComputedStyle = () => ({ lineHeight: '20px' });
  let context = 'format:json';
  const feedback = editorFeedback({ input, go, notes: withoutNotes ? undefined : notes, phrase: (key, values) => `${key}:${JSON.stringify(values)}`,
    context: () => context });
  try { work({ input, go, notes, feedback, setContext(value) { context = value; } }); }
  finally { globalThis.document = originalDocument; globalThis.getComputedStyle = originalStyle; }
}

test('a parser error offers navigation without moving focus until the visitor asks', () => {
  controls(({ input, go, feedback }) => {
    feedback.error(new ParseError('json.unexpected', 7, input.value));
    assert.equal(go.hidden, false); assert.equal(input.focused, false);
    go.click(); assert.equal(input.focused, true); assert.deepEqual(input.selection, [7, 7]);
    assert.equal(input.attributes['aria-invalid'], 'true');
  });
});

test('the same error cannot navigate a changed source or parser mode', () => {
  for (const change of ['source', 'context']) controls(({ input, go, notes, feedback, setContext }) => {
    feedback.error(new ParseError('json.unexpected', 3, input.value));
    if (change === 'source') input.value = 'new text'; else setContext('convert:yaml-json');
    go.click(); assert.equal(input.focused, false); assert.equal(go.hidden, true);
    assert.equal(notes.hidden, true); assert.equal(input.attributes['aria-invalid'], undefined);
  });
});

test('clearing and generic read errors leave no parser caret action', () => {
  controls(({ input, go, feedback }) => {
    feedback.error(new ParseError('yaml.anchors', 3, input.value)); feedback.clear();
    feedback.error(new Error('file read failed')); go.click();
    assert.equal(go.hidden, true); assert.equal(input.focused, false);
  });
});

test('normalized YAML coordinates map through BOM, CRLF, lone CR and non-BMP text', () => {
  for (const newline of ['\n', '\r\n', '\r']) {
    const text = `\ufeffemoji: 😀${newline}bad: &anchor`;
    const normalized = text.slice(1).replace(/\r\n?/g, '\n');
    const error = new ParseError('yaml.anchors', normalized.indexOf('&'), normalized);
    const index = sourceOffset(text, error, { normalized: true });
    assert.equal(index, text.indexOf('&')); assert.equal(text[index], '&');
  }
  assert.equal(sourceOffset('abc', { index: 100 }), 3);
  assert.equal(sourceOffset('abc', { index: -10 }), 0);
  assert.equal(sourceOffset('abc\ndef', { line: 2, column: 99 }, { normalized: true }), 7);
});

test('diagnostic counts stay complete while key examples stay bounded and are rendered as text', () => {
  const diagnostics = conversionDiagnostics();
  for (let i = 0; i < 100; i++) diagnostics.record({ kind: 'xml.name', from: '<img src=x>' + '😀'.repeat(100), to: '_'.repeat(200) });
  diagnostics.record({ kind: 'xml.collision' }); diagnostics.record({ kind: 'yaml.comment' });
  assert.equal(diagnostics.report.names, 100); assert.equal(diagnostics.report.examples.length, 4);
  controls(({ notes, feedback }) => {
    feedback.conversion(diagnostics.report, { yaml: true });
    assert.equal(notes.items.length, 7);
    assert.ok(notes.items[3].textContent.includes('<img src=x>'));
    assert.ok(notes.items[3].textContent.includes('…'));
    assert.ok(notes.items[3].textContent.length < 300);
  });
});


test('unsupported conversion summaries describe conversions rather than formatter failures', () => {
  controls(({ input, notes, feedback }) => {
    const error = new ParseError('yaml.anchors', 3, input.value);
    feedback.error(error); assert.equal(notes.hidden, true);
    feedback.clear(); feedback.error(error, { conversion: true });
    assert.equal(notes.hidden, false); assert.equal(notes.items.length, 1);
    assert.ok(notes.items[0].textContent.startsWith('convert.refused'));
  });
});


test('caret-only consumers navigate real XML and JSON source offsets without a notes sink', () => {
  const cases = [
    { parse: parseXml, text: '\ufeff<r>😀<child>x</r>', token: '</r>', context: 'format:xml' },
    { parse: parseXml, text: '<r a="😀&#x110000;"/>', token: '&#', context: 'convert:xml-json' },
    { parse: parseXml, text: '<r>\r\n  <child>x</r>', token: '</r>', context: 'format:xml' },
    { parse: parseJson, text: '{"emoji":"😀","bad" 2}', token: '2', context: 'convert:json-xml' },
    { parse: parseXml, text: '<r><open>', context: 'format:xml' },
    { parse: parseJson, text: '{"a":', context: 'convert:json-xml' },
  ];
  for (const entry of cases) controls(({ input, go, feedback, setContext }) => {
    input.value = entry.text; setContext(entry.context);
    let error;
    try { entry.parse(entry.text); } catch (caught) { error = caught; }
    assert.equal(error?.name, 'ParseError');
    const expected = entry.token ? entry.text.indexOf(entry.token) : entry.text.length;
    assert.equal(error.index, expected);
    feedback.error(error);
    assert.equal(input.focused, false); assert.equal(go.hidden, false);
    go.click();
    assert.equal(input.focused, true); assert.deepEqual(input.selection, [expected, expected]);
    assert.equal(input.value, entry.text);
    feedback.clear();
    assert.equal(go.hidden, true); assert.equal(input.attributes['aria-invalid'], undefined);
  }, { withoutNotes: true });
});

test('caret-only consumers retire changed XML sources and changed conversion contexts', () => {
  for (const change of ['source', 'context']) controls(({ input, go, feedback, setContext }) => {
    input.value = '<r><a></r>'; setContext('format:xml');
    let error;
    try { parseXml(input.value); } catch (caught) { error = caught; }
    feedback.error(error);
    if (change === 'source') input.value = '<r>new text</r>';
    else setContext('convert:xml-json');
    go.click();
    assert.equal(input.focused, false); assert.equal(go.hidden, true);
    assert.equal(input.attributes['aria-invalid'], undefined);
  }, { withoutNotes: true });
});

test('omitting notes leaves generic failures without a caret and makes discarded summaries harmless', () => {
  controls(({ input, go, feedback }) => {
    feedback.error(new ParseError('yaml.anchors', 3, input.value), { conversion: true });
    feedback.conversion({ comments: 2, names: 1, collisions: 1, examples: [{ from: 'a:b', to: 'a_b' }] }, { yaml: true });
    feedback.clear();
    feedback.error(new TypeError('quoted " [read] refusal'));
    go.click();
    assert.equal(input.focused, false); assert.equal(go.hidden, true);
    assert.equal(input.attributes['aria-invalid'], undefined);
  }, { withoutNotes: true });
});
