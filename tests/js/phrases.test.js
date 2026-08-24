/**
 * shared/js/phrases.js - the words, out of the markup.
 *
 * The reason this file exists is that the thing being tested is a lookup with
 * a precedence rule in it, and a precedence rule is exactly the kind of thing
 * that works in the browser you tried it in and not in the arrangement you did
 * not think to try. Three of the four tests below are about which of two
 * blocks answers, and about what happens when neither does.
 *
 * There is no DOM here, so there is a stub. It answers only the two selectors
 * the module actually asks for, which means a test fails if the module starts
 * asking for something else - the same trick tests/js/feedback.test.js uses,
 * and for the same reason.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { phrase } from '../../shared/js/phrases.js';
import { readingLabel } from '../../shared/js/file-picker.js';

const SELECTOR = /^#(phrases|frame-phrases) \[data-phrase="(.+)"\]$/;

/**
 * A page carrying a tool's own phrases and the frame's.
 *
 * Installed on `globalThis` because that is where the module looks for
 * `document`, exactly as a browser would hand it to a module.
 */
function page({ tool = {}, frame = {} } = {}) {
  globalThis.document = {
    querySelector(selector) {
      const match = SELECTOR.exec(selector);
      if (!match) throw new Error(`unexpected selector: ${selector}`);
      const from = match[1] === 'phrases' ? tool : frame;
      const key = match[2];
      return key in from ? { textContent: from[key] } : null;
    },
  };
}

test('a phrase comes from the frame when the tool has not got one', () => {
  page({ frame: { 'offline.ready': 'ready, and cached' } });
  assert.equal(phrase('offline.ready'), 'ready, and cached');
});

test("the tool's own wording wins over the frame's", () => {
  // heic-to-jpg is the case this is for: it says the same thing about being
  // cached, and mentions the decoder, which no other tool has.
  page({
    tool: { 'offline.ready': 'ready, decoder and all' },
    frame: { 'offline.ready': 'ready, and cached' },
  });
  assert.equal(phrase('offline.ready'), 'ready, decoder and all');
});

test('a key nothing defines comes back as the key', () => {
  // Not a throw. One of the callers is the window's own `error` handler, and a
  // lookup that could throw there would replace a legible failure with an
  // illegible one.
  page();
  assert.equal(phrase('offline.ready'), 'offline.ready');
});

test('the indentation of the markup is not part of the sentence', () => {
  // A phrase written across three lines of body.html is one sentence, not a
  // sentence with two newlines in the middle of it.
  page({ frame: { 'error.broke': '\n      Something broke.\n      Reload it.\n    ' } });
  assert.equal(phrase('error.broke'), 'Something broke. Reload it.');
});

test('{name} is filled in from the values given', () => {
  page({ frame: { 'error.broke': 'Something broke: {detail}. Reload the page.' } });
  assert.equal(phrase('error.broke', { detail: 'out of memory' }),
    'Something broke: out of memory. Reload the page.');
});

test('a blank nobody filled keeps its braces', () => {
  // Visible rather than hidden: a translation naming a value the caller does
  // not pass is a mistake, and a gap in the sentence would not say so.
  page({ frame: { 'error.broke': 'Something broke: {detail}.' } });
  assert.equal(phrase('error.broke'), 'Something broke: {detail}.');
});

test('a number is substituted as text, zero included', () => {
  page({ frame: { 'reading.many': 'Reading {count} files' } });
  assert.equal(phrase('reading.many', { count: 0 }), 'Reading 0 files');
});

test('readingLabel picks the singular for one file and the plural for any other',
  () => {
    page({
      frame: {
        'reading.one': 'Reading {count} file',
        'reading.many': 'Reading {count} files',
      },
    });
    assert.equal(readingLabel(1), 'Reading 1 file');
    assert.equal(readingLabel(0), 'Reading 0 files');
    assert.equal(readingLabel(12), 'Reading 12 files');
  });
