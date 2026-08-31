/**
 * tools/compare-heights/src/import-image.js - a picture on the ruler.
 *
 * The sanitiser next door is a list of what an uploaded SVG may keep. This
 * module has the opposite job and one rule worth a test file of its own: the
 * chart is downloaded and sent on, so the `href` it writes must be provably a
 * picture and not a place. import-svg.js drops every href a stranger's file
 * has; this one writes an href, so the two have to be able to sit in the same
 * repository without the second undoing the first.
 *
 * The rest is arithmetic that decides how many bytes a chart grows by, which
 * is the kind of thing that is wrong by a factor of ten and looks fine.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  IMAGE_LIMITS, fit, imageMarkup, nameFromFile,
} from '../../tools/compare-heights/src/import-image.js';

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==';

test('a picture bigger than the bound is brought down to it', () => {
  const big = fit(4000, 3000);
  assert.equal(Math.max(big.width, big.height), IMAGE_LIMITS.side);
  assert.ok(Math.abs(big.width / big.height - 4 / 3) < 0.01, 'and keeps its shape');

  const tall = fit(1000, 5000);
  assert.equal(Math.max(tall.width, tall.height), IMAGE_LIMITS.side);
  assert.ok(Math.abs(tall.width / tall.height - 1 / 5) < 0.01);
});

test('a small picture is left alone rather than blown up', () => {
  // Enlarging would be more bytes for the same blur, and the chart scales
  // whatever it is given anyway.
  assert.deepEqual(fit(120, 90), { width: 120, height: 90 });
});

test('a picture with no size at all is refused rather than divided by', () => {
  assert.equal(fit(0, 100), null);
  assert.equal(fit(100, 0), null);
  assert.equal(fit(0, 0), null);
});

test('the markup puts the picture in the unit box every figure lives in', () => {
  const markup = imageMarkup(PNG, 0.5);
  // y from 0 at the top of the head to 1 on the ground, x centred on 0 - the
  // same box a drawn figure gets, which is why chart.js needs no raster case.
  assert.match(markup, /y="0"/);
  assert.match(markup, /height="1"/);
  assert.match(markup, /width="0\.5"/);
  assert.match(markup, /x="-0\.25"/);
});

test('the href may only ever be a picture this page encoded', () => {
  // The whole point of the file. Everything below is a place rather than a
  // picture, and import-svg.js exists to keep exactly these out of a chart.
  for (const href of [
    'https://evil.example/x.png',
    'http://evil.example/x.png',
    '//evil.example/x.png',
    '/local.png',
    'x.png',
    'data:text/html;base64,PHNjcmlwdD4=',
    'data:image/svg+xml;base64,PHN2Zz4=',
    'data:image/png;base64,AAAA" onload="alert(1)',
    'data:image/png;base64,AAAA);background:url(https://evil.example',
    ' data:image/png;base64,AAAA',
    'DATA:image/png;base64,AAAA',
    'javascript:alert(1)',
    '',
    null,
    undefined,
    42,
  ]) {
    assert.equal(imageMarkup(href, 1), null, `let through: ${href}`);
  }
});

test('a nonsense aspect is refused rather than drawn', () => {
  for (const aspect of [0, -1, NaN, Infinity, null, undefined, 'wide']) {
    assert.equal(imageMarkup(PNG, aspect), null, `let through: ${aspect}`);
  }
});

test('the markup carries nothing but the picture and its box', () => {
  const markup = imageMarkup(PNG, 1.25);
  for (const bad of ['<script', 'xlink', 'style=', 'class=', ' id=', 'filter', 'onload']) {
    assert.ok(!markup.includes(bad), `markup carries ${bad}`);
  }
  assert.ok(markup.startsWith('<image '), markup.slice(0, 20));
  assert.ok(markup.endsWith('/>'));
});

test('the row is named from the file, without the extension', () => {
  assert.equal(nameFromFile('my-bottle.png'), 'my-bottle');
  assert.equal(nameFromFile('Logo.SVG'), 'Logo');
  assert.equal(nameFromFile('holiday.jpeg'), 'holiday.jpeg', 'only the two it reads');
  assert.equal(nameFromFile('x'.repeat(80)).length, 40, 'a name is drawn above a figure');
});
