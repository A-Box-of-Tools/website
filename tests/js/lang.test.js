/**
 * shared/lang.js - which language a first-time visitor is served.
 *
 * The file is a plain script rather than a module: it has to run before the
 * page is parsed, and a module is deferred by definition. So there is nothing
 * to import, and it is run here the way a browser runs it - the source is read
 * off disk and evaluated with a hand-built window in front of it.
 *
 * That stub is about forty lines and it is the point of this file. The decision
 * being tested is "given these hreflang links, this <html lang>, these browser
 * languages and this stored choice, where does the visitor end up?", and every
 * one of those is a value in the DOM. Faking them is how the question gets
 * asked; a real browser would answer it too, and only after a deploy.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SOURCE = readFileSync(
  fileURLToPath(new URL('../../shared/lang.js', import.meta.url)),
  'utf8',
);

/** A storage that behaves like localStorage, or one that refuses to. */
function storage(refuse = false) {
  const held = new Map();
  return {
    held,
    getItem(key) {
      if (refuse) throw new Error('storage is disabled');
      return held.has(key) ? held.get(key) : null;
    },
    setItem(key, value) {
      if (refuse) throw new Error('storage is disabled');
      held.set(key, String(value));
    },
    removeItem(key) {
      if (refuse) throw new Error('storage is disabled');
      held.delete(key);
    },
  };
}

/**
 * Run the script over one situation and report where it left the visitor.
 *
 * `alternates` is the hreflang set as the build writes it, as [tag, path]
 * pairs - including x-default, because whether this page IS the x-default is
 * the thing that decides whether anything happens at all.
 */
function run({
  alternates = [],
  lang = 'en',
  at = '/',
  languages = ['en-US', 'en'],
  chosen = null,
  local = storage(),
  session = storage(),
  ready = 'loading',
} = {}) {
  if (chosen) local.setItem('abox-lang', chosen);

  const replaced = [];
  const listeners = new Map();

  const links = alternates.map(([tag, path]) => ({
    getAttribute: (name) => (name === 'hreflang' ? tag : `https://abox.tools${path}`),
  }));

  const document = {
    readyState: ready,
    documentElement: { getAttribute: (name) => (name === 'lang' ? lang : null) },
    querySelectorAll: (selector) => (
      selector.includes('rel="alternate"') ? links : []
    ),
    querySelector: () => null,
    getElementById: () => null,
    addEventListener: (type, fn) => listeners.set(type, fn),
  };

  const location = {
    pathname: at,
    search: '',
    hash: '',
    href: `https://abox.tools${at}`,
    replace: (to) => replaced.push(to),
  };

  const window = { localStorage: local, sessionStorage: session };

  // The four globals the script names, handed in as arguments. `URL` comes
  // from Node and is the same constructor the browser would give it.
  // eslint-disable-next-line no-new-func
  new Function('window', 'document', 'location', 'navigator', SOURCE)(
    window, document, location, { languages },
  );

  return {
    went: replaced.length ? replaced[replaced.length - 1] : null,
    // A function rather than a value: the click listener below writes to it
    // after run() has returned, and a snapshot taken here would never see it.
    stored: () => local.held.get('abox-lang') || null,
    from: session.held.get('abox-lang-from') || null,
    listeners,
  };
}

// The site as it stands: English at the root, German under /de/, and the two
// pages that are the same page.
const HUB = [['en', '/'], ['de', '/de/'], ['x-default', '/']];
const TOOL = [
  ['en', '/compress-image/'],
  ['de', '/de/bild-komprimieren/'],
  ['x-default', '/compress-image/'],
];

test('a German browser on the English page is taken to the German one', () => {
  const out = run({ alternates: HUB, languages: ['de-AT', 'de', 'en'] });
  assert.equal(out.went, '/de/');
});

test('the page it leaves is replaced rather than pushed', () => {
  // Asserted through the stub: `replace` is the only method it offers, so a
  // script that called assign() or set href would throw rather than pass.
  const out = run({ alternates: HUB, languages: ['de'] });
  assert.equal(out.went, '/de/');
});

test('an English browser is left where it is', () => {
  assert.equal(run({ alternates: HUB }).went, null);
});

test('a language the site does not publish is left where it is', () => {
  assert.equal(run({ alternates: HUB, languages: ['sv', 'fi'] }).went, null);
});

test('it is the page that moves, not the visitor to the front door', () => {
  const out = run({
    alternates: TOOL, at: '/compress-image/', languages: ['de'],
  });
  assert.equal(out.went, '/de/bild-komprimieren/');
});

test('a reader already on the German page is never moved off it', () => {
  // The rule that matters most: /de/ is not the x-default, so nothing here
  // fires - not for an English browser, and not for Googlebot, which crawls
  // as en-US and would otherwise be redirected out of every page it is asked
  // to index.
  const out = run({
    alternates: HUB, at: '/de/', lang: 'de', languages: ['en-US', 'en'],
  });
  assert.equal(out.went, null);
});

test('a choice already made beats what the browser asks for', () => {
  const out = run({ alternates: HUB, languages: ['de'], chosen: 'en' });
  assert.equal(out.went, null);
});

test('a choice already made is followed on a later visit', () => {
  const out = run({ alternates: HUB, languages: ['en'], chosen: 'de' });
  assert.equal(out.went, '/de/');
});

test('a choice in a language no longer published is ignored', () => {
  // Not honoured, and not treated as "no choice" either: somebody who picked
  // a language once is not then re-sorted by their browser settings.
  const out = run({ alternates: HUB, languages: ['de'], chosen: 'fr' });
  assert.equal(out.went, null);
});

test('a detected language is used and not written down', () => {
  const out = run({ alternates: HUB, languages: ['de'] });
  assert.equal(out.stored(), null);
});

test('the page being left is recorded, so the next one can offer the way back', () => {
  const out = run({ alternates: HUB, languages: ['de'] });
  assert.equal(out.from, 'en');
});

test('the page it is leaving does not eat the flag it just wrote', () => {
  // location.replace() asks for a navigation, it does not stop this document:
  // the page carries on parsing and fires its own DOMContentLoaded. If the
  // notice handler were registered there too it would read the "you were sent"
  // flag and clear it, and the page being landed on would find nothing. The
  // symptom was a redirect that happened in silence, with both halves of it
  // behaving correctly on their own.
  const out = run({ alternates: HUB, languages: ['de'] });
  assert.equal(out.went, '/de/');
  assert.equal(out.listeners.has('DOMContentLoaded'), false);
  assert.equal(out.from, 'en');
});

test('a page that stays does register the handler that shows the notice', () => {
  const out = run({ alternates: HUB });
  assert.equal(out.went, null);
  assert.equal(out.listeners.has('DOMContentLoaded'), true);
});

test('a page published in one language only does nothing at all', () => {
  const out = run({
    alternates: [], at: '/grab-frame/', languages: ['de'],
  });
  assert.equal(out.went, null);
});

test('storage that throws is the same as storage that is empty', () => {
  const out = run({
    alternates: HUB,
    languages: ['de'],
    local: storage(true),
    session: storage(true),
  });
  assert.equal(out.went, '/de/');
});

test('an exact tag is preferred to its language, in the browser order', () => {
  const both = [['pt', '/pt/'], ['pt-BR', '/pt-br/'], ['x-default', '/']];
  assert.equal(run({ alternates: both, languages: ['pt-BR'] }).went, '/pt-br/');
  // ...and a plain pt still finds pt-BR, which is the tag this site actually
  // publishes Portuguese under.
  const brOnly = [['en', '/'], ['pt-BR', '/pt-br/'], ['x-default', '/']];
  assert.equal(run({ alternates: brOnly, languages: ['pt'] }).went, '/pt-br/');
});

test('the browser is asked in the order it gave, not in the order we publish', () => {
  const many = [['en', '/'], ['de', '/de/'], ['fr', '/fr/'], ['x-default', '/']];
  assert.equal(run({ alternates: many, languages: ['fr', 'de'] }).went, '/fr/');
  assert.equal(run({ alternates: many, languages: ['de', 'fr'] }).went, '/de/');
});

test('a click on a switcher link is what writes a choice down', () => {
  const out = run({ alternates: HUB });
  const click = out.listeners.get('click');
  assert.equal(typeof click, 'function');

  const link = {
    getAttribute: (name) => (name === 'hreflang' ? 'de' : null),
    closest: (selector) => (selector.includes('.lang-switch') ? link : null),
  };
  click({ target: { closest: (selector) => (selector.includes('a[hreflang]') ? link : null) } });
  assert.equal(out.stored(), 'de');
});

test('a click on a language whose copy of this page is English still counts', () => {
  // The switcher offers every published language, not only the ones this page
  // is translated into. Those entries carry data-lang and no hreflang, because
  // hreflang would claim a translation of this page exists - but picking one is
  // every bit as much a choice, and has to stick.
  const out = run({ alternates: HUB });
  const link = {
    getAttribute: (name) => (name === 'data-lang' ? 'de' : null),
    closest: (selector) => (selector.includes('.lang-switch') ? link : null),
  };
  out.listeners.get('click')({
    target: { closest: (selector) => (selector.includes('a[data-lang]') ? link : null) },
  });
  assert.equal(out.stored(), 'de');
});

test('a click on any other link writes nothing', () => {
  const out = run({ alternates: HUB });
  out.listeners.get('click')({ target: { closest: () => null } });
  assert.equal(out.stored(), null);
});
