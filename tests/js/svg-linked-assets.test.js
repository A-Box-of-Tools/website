/**
 * A warning that labels embedded artwork as missing is worse than silence.
 * The URL and CSS cases exercise real reference spelling rather than a second
 * renderer; inert XML harvesting is checked against native browser documents.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cssLinksAssets, isLinkedAsset, stylesheetLinksAssets,
} from '../../tools/svg-to-image/src/svg-linked-assets.js';

test('linked SVG resources include relative paths but exclude embedded data and fragments', () => {
  for (const value of ['art/photo.png', '../fonts/face.woff2', '/marks.svg#mark', '//assets.test/pic.png', 'https://assets.test/pic.png', 'blob:elsewhere']) {
    assert.equal(isLinkedAsset(value), true, value);
  }
  for (const value of [null, '', '  ', '#clip', ' #gradient ', 'data:image/png;base64,AA==', ' DATA:image/svg+xml,%3Csvg/%3E ']) {
    assert.equal(isLinkedAsset(value), false, String(value));
  }
});

test('ordinary CSS imports and URL tokens identify styles, fonts and other linked artwork', () => {
  for (const text of [
    '@import "theme.css" screen;',
    "@import 'fonts.css';",
    '@import url(../theme.css);',
    '@font-face{font-family:Mark;src:url("../fonts/mark.woff2") format("woff2")}',
    'fill: URL( https://assets.test/pattern.svg#paint );',
    'filter:url(//assets.test/filter.svg#effect)',
    '@IMPORT/**/"theme.css";',
  ]) assert.equal(cssLinksAssets(text), true, text);
});

test('CSS quoted content and comments do not invent a resource dependency', () => {
  for (const text of [
    '/* url(https://assets.test/pic.png) */ fill: red;',
    'content:"url(https://assets.test/pic.png)";',
    "content:'@import \"theme.css\"';",
    'fill:myurl(https://assets.test/paint.svg);',
    'fill:url("broken);',
    'fill:url(two words.svg);',
    'fill:url("x.svg" broken);',
  ]) assert.equal(cssLinksAssets(text), false, text);
});

test('embedded and same-document CSS paint sources stay local in quoted and escaped forms', () => {
  for (const text of [
    'fill:url(#shade);filter:url("#blur")',
    'background:url("data:image/svg+xml,<svg><!-- url(external.png) --></svg>")',
    'src:local("Mark"),url(data:font/woff2;base64,AA==)',
    'fill:url(\\23 shade)',
    'src:url(\\64 ata:font/woff2;base64,AA==)',
    'fill:u\\72l("#shade")',
    '@import "data:text/css,rect%7Bfill:red%7D";',
  ]) assert.equal(cssLinksAssets(text), false, text);
  assert.equal(cssLinksAssets('src:u\\72l("marks.woff2")'), true);
  assert.equal(cssLinksAssets('@\\69mport "theme.css"'), true);
});

test('CSS escaped punctuation and continued strings retain their resource meaning', () => {
  assert.equal(cssLinksAssets('src:url("fonts/ma\\"rk.woff2")'), true);
  assert.equal(cssLinksAssets('src:url("fonts/mark\\\n.woff2")'), true);
  assert.equal(cssLinksAssets('fill:url("\\000023 shade")'), false);
  assert.equal(cssLinksAssets('src:url("\\000064 ata:font/woff2;base64,AA==")'), false);
});

test('XML stylesheet pseudo-attributes distinguish local fragments and embedded stylesheets', () => {
  for (const text of ['type="text/css" href="theme.css"', "href='https://assets.test/theme.css'", 'href="styles&amp;theme.css"']) {
    assert.equal(stylesheetLinksAssets(text), true, text);
  }
  for (const text of ['type="text/css"', 'not-href="theme.css"', 'href="#style"', 'href="&#35;style"', 'href="&#x23;style"', 'href="data:text/css,rect{fill:red}"']) {
    assert.equal(stylesheetLinksAssets(text), false, text);
  }
});
