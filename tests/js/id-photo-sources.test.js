/**
 * tools/id-photo/src/sources.js - the file that is exempt, held to what it is.
 *
 * tests/python/test_english_in_js.py counts the English left in every tool's
 * JavaScript and lets it fall but never rise. sources.js is excused from that
 * count, because what is in it is somebody else's writing: an authority's name,
 * a document's title, and what a country and a document are called in the
 * language they are issued in. Translating any of those is how a citation stops
 * being one, so they cannot live in the markup with the rest of the prose.
 *
 * An exemption is a hole, and this file is what fills it. The rules below say
 * nothing about whether a citation is CORRECT - no test can, which is why every
 * entry carries the date it was read - but they do say that the module is still
 * a table of names rather than somewhere sentences went to avoid being counted,
 * and that every name in it belongs to a rule that exists.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { ENDONYMS, SOURCES } from '../../tools/id-photo/src/sources.js';
import { SPECS } from '../../tools/id-photo/src/specs.js';

const COLUMNS = ['native', 'authority', 'document', 'checked'];

/** The longest thing anybody publishes as a title, with room to spare. */
const LONGEST = 90;

test('sources: every rule is cited, or says in the open that it cites nothing', () => {
  for (const spec of SPECS) {
    const cited = Object.hasOwn(SOURCES, spec.id);
    const ownWords = spec.source.authority.startsWith('source.');

    assert.notEqual(cited, ownWords,
      `${spec.id}: a rule is either transcribed from somewhere, and its `
      + 'citation is in sources.js, or it is common practice and its source is '
      + 'a pair of phrase keys. Never both and never neither');
  }
});

test('sources: nothing is cited for a rule that does not exist', () => {
  const ids = new Set(SPECS.map((spec) => spec.id));
  for (const id of Object.keys(SOURCES)) {
    assert.ok(ids.has(id), `SOURCES has ${id}, and specs.js has no such rule`);
  }
});

test('sources: the two files are in the same order', () => {
  // So that they can be read side by side. Nothing in the code depends on it;
  // a reader checking forty transcriptions against forty sets of figures does.
  const cited = SPECS.filter((spec) => Object.hasOwn(SOURCES, spec.id));
  assert.deepEqual(cited.map((spec) => spec.id), Object.keys(SOURCES));
});

test('sources: every entry says when it was read, and not in the future', () => {
  const today = new Date().toISOString().slice(0, 10);
  for (const [id, source] of Object.entries(SOURCES)) {
    assert.match(source.checked, /^\d{4}-\d{2}-\d{2}$/, id);
    assert.ok(source.checked <= today,
      `${id} says it was checked on ${source.checked}, which has not happened`);
  }
});

test('sources: a citation is a name, never a sentence', () => {
  // This is the assertion that pays for the exemption in test_english_in_js.py.
  // A name is short and has no full stop inside it; anything that does is this
  // site explaining something, and this site's explaining goes in #phrases
  // where the other fourteen languages can reach it.
  for (const [id, source] of Object.entries(SOURCES)) {
    for (const [column, value] of Object.entries(source)) {
      assert.ok(COLUMNS.includes(column), `${id}: ${column} is not a column here`);
      assert.equal(typeof value, 'string', `${id}.${column}`);
      assert.ok(value.trim() !== '', `${id}.${column} is empty`);
      assert.ok(value.length <= LONGEST,
        `${id}.${column} is ${value.length} characters. A published title is `
        + 'shorter than that, and a sentence is how this file stops being a '
        + 'table of names');
      // A full stop that ends a word ends a sentence. One after a single
      // capital does not - "U.S. Department of State" is a name, and so is
      // "gov.uk", which has no space after its stops at all.
      assert.ok(!/[a-z]\.\s/.test(value) && !value.endsWith('.'),
        `${id}.${column} reads like a sentence`);
    }
  }
});

test('sources: a country is only named if some rule is issued by it', () => {
  const countries = new Set(SPECS.map((spec) => spec.country));
  for (const key of Object.keys(ENDONYMS)) {
    assert.ok(countries.has(key), `ENDONYMS has ${key}, which no rule uses`);
    assert.match(key, /^country\.[a-z-]+$/, key);
  }
});

test('sources: a native name is only there when it is a different word', () => {
  // "Passport (Passport)" under the United Kingdom is the page taking two
  // lines to say one thing. This catches only the English reading - the guard
  // in specs.js is what catches the German and Chinese ones, where the name
  // and its native are the same word and only the English differs.
  for (const spec of SPECS) {
    if (!spec.native) continue;
    assert.ok(!spec.document.includes(spec.native), spec.id);
  }
  for (const [key, native] of Object.entries(ENDONYMS)) {
    assert.ok(!key.includes(native), key);
  }
});
