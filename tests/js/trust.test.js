/**
 * shared/js/trust.js - the live network check.
 *
 * The panel exists to be checked against the browser's own network tab, so
 * what matters is the sorting: which hosts are the page's own, which are the
 * platform's and reported as themselves, which are somebody else's and turn
 * the line red, and which the page declared in advance and are counted
 * without comment. All of that is a pure function of a list of URLs, so it is
 * tested as one; the DOM half of the module never runs here because there is
 * no document for it to fill in.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { sortHosts, describe, PLATFORM_HOSTS } from '../../shared/js/trust.js';

const ORIGIN = 'https://abox.tools';
const entries = (...names) => names.map((name) => ({ name }));
const page = (expected = []) => ({ origin: ORIGIN, expected });

test("the page's own files are counted and never reported", () => {
  const sorted = sortHosts(entries(
    `${ORIGIN}/base64/src/main.js`,
    `${ORIGIN}/site.css`,
  ), page());
  assert.equal(sorted.total, 2);
  assert.equal(sorted.platform.size, 0);
  assert.equal(sorted.external.size, 0);
});

test('blob: and data: URLs are neither counted nor reported', () => {
  const sorted = sortHosts(entries(
    'blob:https://abox.tools/3f1c-...',
    'data:image/png;base64,iVBOR',
    `${ORIGIN}/base64/`,
  ), page());
  assert.equal(sorted.total, 1);
  assert.equal(sorted.external.size, 0);
});

test('the platform hosts are reported as themselves, country domains included', () => {
  const sorted = sortHosts(entries(
    'https://www.googletagmanager.com/gtag/js?id=G-1',
    'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
    'https://www.google.co.uk/pagead/1p-user-list/',
    'https://www.google.com.au/ads/ga-audiences',
    'https://fonts.gstatic.com/s/inter.woff2',
    'https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js',
  ), page());
  assert.equal(sorted.total, 6);
  assert.equal(sorted.external.size, 0);
  assert.deepEqual([...sorted.platform].sort(), [
    'cdnjs.buymeacoffee.com',
    'fonts.gstatic.com',
    'pagead2.googlesyndication.com',
    'www.google.co.uk',
    'www.google.com.au',
    'www.googletagmanager.com',
  ]);
});

test('anything else is external, and a look-alike is not the platform', () => {
  const sorted = sortHosts(entries(
    'https://example.com/upload',
    'https://notgoogle.com/x',
    'https://google.com.evil.example/x',
  ), page());
  assert.deepEqual([...sorted.external].sort(),
    ['example.com', 'google.com.evil.example', 'notgoogle.com']);
  assert.equal(sorted.platform.size, 0);
});

test('a host the page declared is counted and not reported', () => {
  const rendezvous = 'rendezvous.a-box-of-tools.workers.dev';
  const sorted = sortHosts(entries(`wss://${rendezvous}/`, `${ORIGIN}/share-text/`),
    page([rendezvous]));
  assert.equal(sorted.total, 2);
  assert.equal(sorted.external.size, 0);
  assert.equal(sorted.platform.size, 0);
});

test('the pattern takes a country domain and nothing looser', () => {
  for (const host of ['google.com', 'www.google.de', 'google.co.jp', 'ads.google.com']) {
    assert.ok(PLATFORM_HOSTS.test(host), host);
  }
  for (const host of ['google.comx', 'google.toolong', 'mygoogle.com']) {
    assert.ok(!PLATFORM_HOSTS.test(host), host);
  }
});

/** A phrase() that reports what it was asked for. */
function recorder() {
  const asked = [];
  const t = (key, values) => { asked.push([key, values]); return `<${key}>`; };
  return { t, asked };
}

test('describe: clean, with no platform hosts, says so with the total', () => {
  const { t, asked } = recorder();
  const out = describe({ platform: new Set(), external: new Set(), total: 12 }, t);
  assert.equal(out.clean, true);
  assert.equal(out.text, '<net.clean>');
  assert.deepEqual(asked, [['net.clean', { total: 12, platform: '' }]]);
});

test('describe: one platform host and many are different phrases', () => {
  const one = recorder();
  describe({ platform: new Set(['a']), external: new Set(), total: 1 }, one.t);
  assert.equal(one.asked[0][0], 'net.platform.one');
  assert.deepEqual(one.asked[0][1], { hosts: 1 });

  const many = recorder();
  describe({ platform: new Set(['a', 'b', 'c']), external: new Set(), total: 3 }, many.t);
  assert.equal(many.asked[0][0], 'net.platform.many');
  assert.deepEqual(many.asked[0][1], { hosts: 3 });
  assert.deepEqual(many.asked[1], ['net.clean', { total: 3, platform: '<net.platform.many>' }]);
});

test('describe: an external host makes it dirty and names every one', () => {
  const { t, asked } = recorder();
  const out = describe({
    platform: new Set(['www.googletagmanager.com']),
    external: new Set(['example.com', 'evil.example']),
    total: 9,
  }, t);
  assert.equal(out.clean, false);
  assert.equal(out.text, '<net.dirty>');
  assert.deepEqual(asked[1], ['net.dirty', {
    hosts: 'example.com, evil.example',
    platform: '<net.platform.one>',
  }]);
});
