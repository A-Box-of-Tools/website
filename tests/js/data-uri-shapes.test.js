/**
 * tools/image-to-data-uri/src/shapes.js - the line that actually gets pasted.
 *
 * Two of these rules are load-bearing in a way that is easy to miss:
 *
 *   every URI is quoted, because an unquoted url() token ends at the first
 *   space and a percent-encoded SVG is full of them. The failure is silent -
 *   CSS discards an invalid declaration and paints nothing - so it is worth a
 *   test rather than a comment;
 *
 *   two files that reduce to the same identifier are made distinct, because
 *   the alternative is one rule quietly overwriting another and one of the
 *   pictures never appearing.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  render, bundle, bundleName, fileName, identifiers,
} from '../../tools/image-to-data-uri/src/shapes.js';

const result = (over = {}) => ({
  name: 'logo.png',
  ident: 'logo',
  uri: 'data:image/png;base64,AAAA',
  width: 64,
  height: 32,
  svg: false,
  ...over,
});

/* ------------------------------------------------------------- the quoting */

test('every shape that carries a URI quotes it', () => {
  // The SVG case is the one that breaks: spaces are left unescaped on purpose,
  // which is only safe inside quotes.
  const svg = result({ uri: "data:image/svg+xml,%3Csvg viewBox='0 0 24 24'%3E%3C/svg%3E", svg: true });

  for (const shape of ['css-rule', 'css-var', 'html']) {
    assert.match(render(shape, svg), /"data:image\/svg\+xml,[^"]*"/, shape);
  }
});

/* --------------------------------------------------------------- the shapes */

test('the bare URI is the bare URI', () => {
  assert.equal(render('uri', result()), 'data:image/png;base64,AAAA');
});

test('a CSS rule is a whole rule, not a loose declaration', () => {
  assert.equal(
    render('css-rule', result()),
    '.logo {\n  background-image: url("data:image/png;base64,AAAA");\n}',
  );
});

test('a custom property is one line, ready for a :root block', () => {
  assert.equal(render('css-var', result()), '--logo: url("data:image/png;base64,AAAA");');
});

test('the img tag carries the pixel size and an empty alt', () => {
  assert.equal(
    render('html', result()),
    '<img src="data:image/png;base64,AAAA" alt="" width="64" height="32">',
  );
});

test('an SVG gets no width or height', () => {
  // An SVG with only a viewBox has no pixel size of its own; the browser
  // reports its 300x150 default, and writing that onto the tag would pin a
  // scalable picture at a size nobody chose.
  const svg = render('html', result({ svg: true, width: 300, height: 150 }));
  assert.equal(svg, '<img src="data:image/png;base64,AAAA" alt="">');
});

test('a picture that has not been measured yet gets no size either', () => {
  const unmeasured = render('html', result({ width: 0, height: 0 }));
  assert.equal(unmeasured, '<img src="data:image/png;base64,AAAA" alt="">');
});

test('markdown leaves the alt empty rather than guessing at one', () => {
  assert.equal(render('markdown', result()), '![](data:image/png;base64,AAAA)');
});

test('an unknown shape falls back to the URI rather than throwing', () => {
  assert.equal(render('nonsense', result()), 'data:image/png;base64,AAAA');
});

/* -------------------------------------------------------------- identifiers */

test('a file name becomes something CSS will accept', () => {
  assert.deepEqual(
    identifiers(['Logo Final (2).PNG', 'icon_search.svg', 'a b c.gif']),
    ['logo-final-2', 'icon-search', 'a-b-c'],
  );
});

test('an identifier may not start with a digit', () => {
  assert.deepEqual(identifiers(['2024-banner.png']), ['img-2024-banner']);
});

test('a name with nothing usable in it still gets a name', () => {
  assert.deepEqual(identifiers(['....png', '???.png']), ['image', 'image-2']);
});

test('names that collide are made distinct', () => {
  // Two files called logo.svg from different folders is the ordinary case, and
  // the failure without this is silent: the second rule wins.
  assert.deepEqual(
    identifiers(['logo.svg', 'logo.png', 'LOGO.gif']),
    ['logo', 'logo-2', 'logo-3'],
  );
});

test('the extension is dropped, not the whole name', () => {
  assert.deepEqual(identifiers(['.gitignore']), ['gitignore']);
});

/* ------------------------------------------------------------------ bundles */

test('custom properties come out wrapped in :root', () => {
  // The only form of them that can be pasted straight in and work.
  const all = bundle('css-var', [
    result({ ident: 'one', uri: 'data:a' }),
    result({ ident: 'two', uri: 'data:b' }),
  ]);
  assert.equal(all, ':root {\n  --one: url("data:a");\n  --two: url("data:b");\n}');
});

test('bare URIs are labelled, because a URI cannot hold a line break', () => {
  const all = bundle('uri', [
    result({ name: 'a.png', uri: 'data:a' }),
    result({ name: 'b.png', uri: 'data:b' }),
  ]);
  assert.equal(all, 'a.png\ndata:a\n\nb.png\ndata:b');
});

test('the other shapes are already standalone and just stack', () => {
  const all = bundle('markdown', [result({ uri: 'data:a' }), result({ uri: 'data:b' })]);
  assert.equal(all, '![](data:a)\n\n![](data:b)');
});

test('downloads are named after the shape they hold', () => {
  assert.equal(bundleName('css-rule'), 'data-uris.css');
  assert.equal(bundleName('markdown'), 'data-uris.md');
  assert.equal(bundleName('uri'), 'data-uris.txt');
  assert.equal(fileName('html', result()), 'logo-data-uri.html');
});
