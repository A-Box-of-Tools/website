/**
 * shared/page-md.js - the button that copies a page as Markdown.
 *
 * Run the way tests/js/feedback.test.js runs its subject: the file is a frame
 * script rather than a module, so the source is read off disk and evaluated
 * with a hand-built document in front of it. Three things are worth pinning:
 *
 *   - what reaches the clipboard is the text of the hidden <pre> and nothing
 *     else - the page's twin, byte for byte, which the build has already
 *     checked against index.md;
 *   - the word beside the button says what happened and then goes away, so
 *     the row is itself again;
 *   - where there is no clipboard the button is taken off the page rather
 *     than left to fail, and the link beside it is not touched.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SOURCE = readFileSync(
  fileURLToPath(new URL('../../shared/page-md.js', import.meta.url)),
  'utf8',
);

const TWIN = '# A page\n\nWith a `code` span and a [link](https://abox.tools/).\n';

/**
 * The row as templates/partials/page-md.html renders it, and a clipboard that
 * either takes the text or refuses it. `clipboard: null` is a page with no
 * clipboard API at all.
 */
function run({ clipboard = 'accepts', markdown = TWIN } = {}) {
  const written = [];
  const timers = [];
  const listeners = new Map();

  const button = {
    hidden: false,
    addEventListener: (type, fn) => listeners.set(type, fn),
  };
  const block = { textContent: markdown };
  const status = {
    textContent: '',
    attrs: { 'data-copied': 'Copied', 'data-failed': 'Could not copy' },
    getAttribute(name) { return this.attrs[name] ?? null; },
  };

  const document = {
    querySelector: (query) => ({ '.page-md-copy': button, '.page-md-status': status }[query] || null),
    getElementById: (id) => (id === 'page-markdown' ? block : null),
  };
  const navigator = {};
  if (clipboard) {
    navigator.clipboard = {
      writeText: (text) => {
        written.push(text);
        return clipboard === 'accepts' ? Promise.resolve() : Promise.reject(new Error('denied'));
      },
    };
  }

  // eslint-disable-next-line no-new-func
  new Function('document', 'navigator', 'setTimeout', 'clearTimeout', SOURCE)(
    document,
    navigator,
    (fn, ms) => { timers.push({ fn, ms }); return timers.length; },
    () => {},
  );

  return {
    button, status, written, timers,
    listening: listeners.has('click'),
    press: async () => {
      listeners.get('click')();
      // Let the clipboard promise settle before looking.
      await new Promise((done) => setImmediate(done));
    },
    tick: () => { while (timers.length) timers.shift().fn(); },
  };
}

test('a press copies the twin and nothing else', async () => {
  const page = run();
  assert.equal(page.listening, true);
  await page.press();
  assert.deepEqual(page.written, [TWIN]);
});

test('the word beside the button says it copied, then goes away', async () => {
  const page = run();
  await page.press();
  assert.equal(page.status.textContent, 'Copied');
  assert.equal(page.timers.length, 1);
  assert.equal(page.timers[0].ms, 2000);
  page.tick();
  assert.equal(page.status.textContent, '');
});

test('a refused write says so instead', async () => {
  const page = run({ clipboard: 'refuses' });
  await page.press();
  assert.equal(page.status.textContent, 'Could not copy');
});

test('with no clipboard the button goes and the link stays', () => {
  const page = run({ clipboard: null });
  assert.equal(page.button.hidden, true);
  assert.equal(page.listening, false, 'nothing to press, nothing listened for');
});

test('a page without the row is left alone', () => {
  const document = { querySelector: () => null, getElementById: () => null };
  // eslint-disable-next-line no-new-func
  assert.doesNotThrow(() => new Function('document', 'navigator', SOURCE)(document, {}));
});
