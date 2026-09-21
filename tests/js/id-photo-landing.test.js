/**
 * tools/id-photo/landing/ - the page each cited rule has to itself.
 *
 * Those pages are written by the build, which is Python, from landing/pages.json,
 * which is generated from src/specs.js by landing/emit.mjs and committed. So
 * there are two copies of every figure, and the second is the one a search
 * engine reads. What keeps them the same figure is here:
 *
 *   - the committed file is exactly what the emitter writes today. A rule
 *     corrected in specs.js without running it is a page quoting last month's
 *     numbers under this month's "checked" date, and nothing about that page
 *     would look wrong;
 *   - the rows on a page are the rows the tool's own panel draws, because both
 *     come from specFacts(). The test is that it runs on every rule with a
 *     resolver that answers in words and with one that answers in keys, and
 *     says the same thing through both;
 *   - only a rule that has something to cite gets an address;
 *   - an address names a rule. "#us-passport" on the tool's page is how a
 *     landing page hands somebody on, and it must not be able to open the form
 *     you fill in yourself, or anything that is not a rule.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { SPECS, specById, specFromHash } from '../../tools/id-photo/src/specs.js';
import { SOURCES } from '../../tools/id-photo/src/sources.js';
import { sourceLine, specFacts } from '../../tools/id-photo/src/files.js';
import { hasPage, pages, rendered } from '../../tools/id-photo/landing/emit.mjs';

const COMMITTED = new URL('../../tools/id-photo/landing/pages.json', import.meta.url);

/** phrase(), near enough: the key, with its blanks filled and visible. */
const words = (key, values = {}) => `${key}(${Object.entries(values)
  .map(([name, value]) => `${name}=${value}`).join(',')})`;

/** The emitter's resolver, and the same flattening applied to what it records. */
const asked = (key, values) => (values ? { key, values } : { key });
const flatten = (answer) => (typeof answer === 'object' && answer !== null
  ? words(answer.key, Object.fromEntries(Object.entries(answer.values ?? {})
    .map(([name, value]) => [name, flatten(value)])))
  : String(answer));

test('pages.json is what landing/emit.mjs would write today', () => {
  assert.equal(readFileSync(COMMITTED, 'utf8'), rendered(),
    'run: node --import ./tests/js/resolve-shared.mjs tools/id-photo/landing/emit.mjs');
});

test('pages.json is LF and ends in a newline', () => {
  const raw = readFileSync(COMMITTED, 'utf8');
  assert.ok(!raw.includes('\r'));
  assert.ok(raw.endsWith('}\n'));
});

test('only a portrait with a citation and published figures gets a page', () => {
  for (const spec of SPECS) {
    const expected = spec.kind === 'portrait' && !spec.published
      && Object.hasOwn(SOURCES, spec.id);
    assert.equal(hasPage(spec), expected, spec.id);
  }
  for (const id of ['custom', 'in-exam-signature', 'se-passport', 'cn-1inch']) {
    assert.ok(specById(id), `${id} is still a rule`);
    assert.equal(hasPage(specById(id)), false, id);
  }
});

test('every page says when its rule was read, and by whom', () => {
  const built = pages();
  assert.ok(built.length >= 40, `${built.length} pages`);
  for (const page of built) {
    assert.match(page.checked, /^\d{4}-\d{2}-\d{2}$/, page.id);
    assert.ok(page.authority, page.id);
    assert.ok(page.facts.length >= 4, page.id);
    // An id is an address beside src/ and sw.js - see buildlib/landing.py.
    assert.match(page.id, /^[a-z0-9]+(-[a-z0-9]+)*$/, page.id);
  }
});

test('specFacts says the same thing in keys as it does in words', () => {
  for (const spec of SPECS) {
    const spoken = specFacts(spec, words).map((row) => row.join(' = '));
    const recorded = specFacts(spec, asked)
      .map(([term, value]) => `${flatten(term)} = ${flatten(value)}`);
    assert.deepEqual(recorded, spoken, spec.id);
  }
});

test('specFacts: a signature has no head and no eye line', () => {
  const rows = specFacts(specById('in-exam-signature'), words);
  assert.ok(!rows.some(([term]) => term.startsWith('facts.head')));
  assert.ok(!rows.some(([term]) => term.startsWith('facts.eye')));
});

test('specFacts: a band nobody published is marked as guidance', () => {
  const [, , eye] = specFacts(specById('us-passport'), words);
  assert.match(eye[1], /^band\.guidance\(/);
  const [, head] = specFacts(specById('us-passport'), words);
  assert.doesNotMatch(head[1], /guidance/);
});

test('specFacts: an upload rule that states no size does not say "Infinity"', () => {
  for (const spec of SPECS) {
    const said = specFacts(spec, words).flat().join(' ');
    assert.doesNotMatch(said, /Infinity|NaN|undefined/, spec.id);
  }
});

test('sourceLine: a citation keeps its wording, and a rule that cites nothing says so', () => {
  assert.match(sourceLine(specById('us-passport'), words),
    /^source\.line\(authority=U\.S\. Department of State\(\)/);
  assert.match(sourceLine(specById('se-passport'), words), /^source\.line\.words\(/);
  assert.equal(sourceLine(specById('custom'), words), 'source.own()');
});

test('specFromHash: an address names a rule, and only a rule', () => {
  assert.equal(specFromHash('#us-passport'), 'us-passport');
  assert.equal(specFromHash('de-passport'), 'de-passport');
  for (const page of pages()) assert.equal(specFromHash(`#${page.id}`), page.id);

  // Where the skip link lands, the form you fill in yourself, and nothing.
  for (const hash of ['#main', '#custom', '#', '', null, undefined, '#us-passport/x']) {
    assert.equal(specFromHash(hash), null, String(hash));
  }
});
