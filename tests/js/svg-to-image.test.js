/**
 * tools/svg-to-image/src/{svg,sizing,files}.js.
 *
 * Two things in this tool can be wrong without anything throwing, and both are
 * here.
 *
 * The first is what an SVG says its own size is. Real files disagree wildly
 * about how to say it - width and height in points, only a viewBox, a width of
 * 100%, nothing at all - and the answer feeds every number on the page. Getting
 * it wrong does not produce an error; it produces a picture at a size nobody
 * asked for, and a page that confidently says the wrong thing underneath it.
 *
 * The second is the rewritten root tag. It is a splice into somebody's file, so
 * the tests below check both halves: that the size and viewBox come out right,
 * and that everything else in the document is still there afterwards.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_HEIGHT, DEFAULT_WIDTH, decodeSvgText, intrinsicSize, looksLikeSvg,
  parseLength, parseViewBox, readRoot, sizedSvg,
} from '../../tools/svg-to-image/src/svg.js';
import {
  FITS, MAX_SIDE, MODES, WARN_PIXELS, atDensity, checkLimits, describePlan,
  planSize, times,
} from '../../tools/svg-to-image/src/sizing.js';
import {
  countOf, describeSource, dimensions, outName, stemOf, uniqueNames,
} from '../../tools/svg-to-image/src/files.js';

/** The shape most of these are about: a 24-unit icon, the size a UI kit ships. */
const ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z"/></svg>';

/* ============================================================ parseLength */

test('parseLength: a bare number is pixels', () => {
  assert.equal(parseLength('24'), 24);
  assert.equal(parseLength('24px'), 24);
  assert.equal(parseLength(' 24 '), 24);
  assert.equal(parseLength('1.5'), 1.5);
});

test('parseLength: the absolute units convert', () => {
  assert.equal(parseLength('1in'), 96);
  assert.equal(parseLength('1cm'), 96 / 2.54);
  assert.equal(parseLength('1mm'), 96 / 25.4);
  assert.equal(parseLength('72pt'), 96);
  assert.equal(parseLength('1pc'), 16);
  assert.equal(parseLength('1PT'), 96 / 72, 'units are case-insensitive');
});

test('parseLength: a percentage is not a length', () => {
  // The commonest export in the world - width="100%" height="100%" - and the
  // whole reason the viewBox fallback exists. Answering "100" here would draw
  // every such file at 100 pixels.
  assert.equal(parseLength('100%'), null);
  assert.equal(parseLength('50%'), null);
});

test('parseLength: font-relative units are refused rather than guessed', () => {
  for (const value of ['2em', '3ex', '1rem', '4ch']) {
    assert.equal(parseLength(value), null, value);
  }
});

test('parseLength: nonsense, zero and negatives get nothing', () => {
  for (const value of ['', '   ', 'auto', 'wide', '0', '0px', '-5', '12 34', null, undefined]) {
    assert.equal(parseLength(value), null, String(value));
  }
});

/* =========================================================== parseViewBox */

test('parseViewBox: spaces or commas, either way round', () => {
  assert.deepEqual(parseViewBox('0 0 24 24'), { x: 0, y: 0, width: 24, height: 24 });
  assert.deepEqual(parseViewBox('0,0,24,24'), { x: 0, y: 0, width: 24, height: 24 });
  assert.deepEqual(parseViewBox('  -10 -5  120   60 '), { x: -10, y: -5, width: 120, height: 60 });
});

test('parseViewBox: a decimal viewBox is ordinary and survives', () => {
  assert.deepEqual(parseViewBox('0 0 8.5 11'), { x: 0, y: 0, width: 8.5, height: 11 });
});

test('parseViewBox: anything that is not four usable numbers is nothing', () => {
  for (const value of ['', '0 0 24', '0 0 24 24 24', '0 0 0 24', '0 0 24 -1', 'a b c d', null]) {
    assert.equal(parseViewBox(value), null, String(value));
  }
});

/* ================================================================ readRoot */

test('readRoot: attributes come back lowercased, quoted either way', () => {
  const root = readRoot('<svg viewBox="0 0 10 10" width=\'20\'></svg>');
  assert.equal(root.attrs.viewbox, '0 0 10 10');
  assert.equal(root.attrs.width, '20');
});

test('readRoot: everything a document may put in front of its root is stepped over', () => {
  const text = '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<!-- Generator: a drawing program, SVG Export Plug-In -->\n'
    + '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n'
    + '<svg width="48" height="48"></svg>';
  const root = readRoot(text);
  assert.equal(root.attrs.width, '48');
  assert.equal(text.slice(root.start, root.end), '<svg width="48" height="48">');
});

test('readRoot: a doctype with an internal subset does not end at its first >', () => {
  const text = '<!DOCTYPE svg [<!ENTITY ns "http://example.invalid/x">]>\n<svg width="7" height="7"/>';
  assert.equal(readRoot(text).attrs.width, '7');
});

test('readRoot: a > inside an attribute value does not end the tag', () => {
  const root = readRoot('<svg data-note="a > b" width="9" height="9"></svg>');
  assert.equal(root.attrs.width, '9');
  assert.equal(root.attrs['data-note'], 'a > b');
});

test('readRoot: a self-closing root is still a root', () => {
  const root = readRoot('<svg width="3" height="4"/>');
  assert.equal(root.attrs.height, '4');
});

test('readRoot: something that is not SVG at all is not one', () => {
  assert.equal(readRoot('<html><body>nope</body></html>'), null);
  assert.equal(readRoot('not markup'), null);
  assert.equal(readRoot(''), null);
});

/* =========================================================== intrinsicSize */

test('intrinsicSize: width and height are the file\'s own answer', () => {
  const size = intrinsicSize(ICON);
  assert.equal(size.width, 24);
  assert.equal(size.height, 24);
  assert.equal(size.source, 'attributes');
});

test('intrinsicSize: units are converted, not taken as pixels', () => {
  const size = intrinsicSize('<svg width="1in" height="72pt"/>');
  assert.equal(size.width, 96);
  assert.equal(size.height, 96);
});

test('intrinsicSize: one side plus a viewBox completes itself', () => {
  const size = intrinsicSize('<svg width="800" viewBox="0 0 16 9"/>');
  assert.equal(size.width, 800);
  assert.equal(size.height, 450);
  assert.equal(size.source, 'mixed');
});

test('intrinsicSize: a viewBox alone is the size, in user units', () => {
  const size = intrinsicSize('<svg viewBox="0 0 120 60"/>');
  assert.equal(size.width, 120);
  assert.equal(size.height, 60);
  assert.equal(size.source, 'viewbox');
});

test('intrinsicSize: width="100%" falls through to the viewBox, not to 100', () => {
  const size = intrinsicSize('<svg width="100%" height="100%" viewBox="0 0 512 256"/>');
  assert.equal(size.width, 512);
  assert.equal(size.height, 256);
  assert.equal(size.source, 'viewbox');
});

test('intrinsicSize: a file that says nothing gets the browser\'s own default, and says so', () => {
  const size = intrinsicSize('<svg><circle r="5"/></svg>');
  assert.equal(size.width, DEFAULT_WIDTH);
  assert.equal(size.height, DEFAULT_HEIGHT);
  assert.equal(size.source, 'default');
});

test('intrinsicSize: the ratio is what the other numbers on the page are built from', () => {
  assert.equal(intrinsicSize('<svg viewBox="0 0 16 9"/>').ratio, 16 / 9);
  assert.equal(intrinsicSize('<svg width="200" height="100"/>').ratio, 2);
});

test('intrinsicSize: not an SVG is null rather than a guess', () => {
  assert.equal(intrinsicSize('<html></html>'), null);
});

/* ================================================================ sizedSvg */

test('sizedSvg: the size asked for is the size in the tag', () => {
  const out = sizedSvg(ICON, 512, 512);
  const root = readRoot(out);
  assert.equal(root.attrs.width, '512');
  assert.equal(root.attrs.height, '512');
});

test('sizedSvg: a file with no viewBox gets one, or it would not scale', () => {
  // The bug this exists for: without a viewBox the artwork keeps its own units
  // and sits in the corner of the larger canvas.
  const out = sizedSvg('<svg width="24" height="24"><path d="M0 0h24v24H0z"/></svg>', 512, 512);
  assert.equal(readRoot(out).attrs.viewbox, '0 0 24 24');
});

test('sizedSvg: an existing viewBox is left exactly as it was', () => {
  const out = sizedSvg('<svg width="24" height="24" viewBox="-2 -2 28 28"/>', 96, 96);
  assert.equal(readRoot(out).attrs.viewbox, '-2 -2 28 28');
});

test('sizedSvg: the viewBox keeps its capital B', () => {
  // `viewbox` is not an attribute anything reads. Lowercasing it on the way out
  // is the sort of bug that shows up as "the picture is in the corner".
  assert.match(sizedSvg(ICON, 64, 64), /viewBox="0 0 24 24"/);
  assert.doesNotMatch(sizedSvg(ICON, 64, 64), /viewbox=/);
});

test('sizedSvg: a missing xmlns is added, because without it nothing draws', () => {
  const out = sizedSvg('<svg width="10" height="10"/>', 20, 20);
  assert.equal(readRoot(out).attrs.xmlns, 'http://www.w3.org/2000/svg');
});

test('sizedSvg: stretching is preserveAspectRatio="none" and nothing else', () => {
  const plain = readRoot(sizedSvg(ICON, 100, 50));
  assert.equal(plain.attrs.preserveaspectratio, undefined);

  const stretched = readRoot(sizedSvg(ICON, 100, 50, { stretch: true }));
  assert.equal(stretched.attrs.preserveaspectratio, 'none');
});

test('sizedSvg: everything that is not the root tag comes through untouched', () => {
  const body = '<defs><linearGradient id="g"><stop offset="0"/></linearGradient></defs>'
    + '<path d="M0 0h24v24H0z" fill="url(#g)"/><!-- a comment -->';
  const out = sizedSvg(`<svg width="24" height="24" viewBox="0 0 24 24">${body}</svg>`, 256, 256);
  assert.ok(out.includes(body), 'the artwork was changed');
  assert.ok(out.endsWith('</svg>'));
});

test('sizedSvg: an ampersand in an attribute is not turned into broken XML', () => {
  const out = sizedSvg('<svg width="10" height="10" data-title="Rock &amp; Roll"/>', 20, 20);
  assert.match(out, /data-title="Rock &amp; Roll"/);
  assert.equal(readRoot(out).attrs['data-title'], 'Rock & Roll');
});

test('sizedSvg: a file with no root element is refused rather than mangled', () => {
  assert.throws(() => sizedSvg('<html></html>', 10, 10), /no <svg> element/);
});

/* =========================================================== decodeSvgText */

const utf8 = (text) => new TextEncoder().encode(text);

const utf16le = (text, bom = true) => {
  const chars = (bom ? '﻿' : '') + text;
  const out = new Uint8Array(chars.length * 2);
  for (let i = 0; i < chars.length; i += 1) {
    const code = chars.charCodeAt(i);
    out[i * 2] = code & 0xff;
    out[i * 2 + 1] = code >> 8;
  }
  return out;
};

test('decodeSvgText: plain UTF-8 comes back as it went in', () => {
  assert.equal(decodeSvgText(utf8(ICON)), ICON);
});

test('decodeSvgText: a UTF-8 BOM is not left in front of the root tag', () => {
  const text = decodeSvgText(new Uint8Array([0xef, 0xbb, 0xbf, ...utf8(ICON)]));
  assert.equal(text, ICON);
  assert.ok(readRoot(text), 'a leading BOM hid the root element');
});

test('decodeSvgText: UTF-16 with a BOM, which is what older Windows tools write', () => {
  assert.equal(decodeSvgText(utf16le(ICON)), ICON);
});

test('decodeSvgText: UTF-16 without a BOM is caught by the NUL after the <', () => {
  assert.equal(decodeSvgText(utf16le(ICON, false)), ICON);
});

test('decodeSvgText: an encoding named in the declaration is honoured', () => {
  // Latin-1 bytes: the same file read as UTF-8 would come back with a replacement
  // character where the accented letter is.
  const head = '<?xml version="1.0" encoding="ISO-8859-1"?><svg width="10" height="10" data-by="Bj';
  const tail = 'rn"/>';
  const bytes = new Uint8Array([...utf8(head), 0xf6, ...utf8(tail)]);
  assert.match(decodeSvgText(bytes), /Björn/);
});

/* ============================================================ looksLikeSvg */

test('looksLikeSvg: by type or by extension, because a drop often has neither', () => {
  assert.equal(looksLikeSvg({ name: 'logo.svg', type: '' }), true);
  assert.equal(looksLikeSvg({ name: 'logo', type: 'image/svg+xml' }), true);
  assert.equal(looksLikeSvg({ name: 'LOGO.SVG', type: '' }), true);
  assert.equal(looksLikeSvg({ name: 'photo.png', type: 'image/png' }), false);
});

/* ================================================================ planSize */

const square = { width: 24, height: 24, ratio: 1 };
const wide = { width: 800, height: 450, ratio: 800 / 450 };

test('planSize: a multiple scales from the file\'s own size', () => {
  const plan = planSize(square, { mode: MODES.scale, scale: 4 });
  assert.equal(plan.width, 96);
  assert.equal(plan.height, 96);
});

test('planSize: a fractional multiple rounds to whole pixels', () => {
  const plan = planSize(wide, { mode: MODES.scale, scale: 0.333 });
  assert.equal(plan.width, 266);
  assert.equal(plan.height, 150);
});

test('planSize: a width brings the height with it', () => {
  const plan = planSize(wide, { mode: MODES.width, width: 1600 });
  assert.equal(plan.width, 1600);
  assert.equal(plan.height, 900);
});

test('planSize: a height brings the width with it', () => {
  const plan = planSize(wide, { mode: MODES.height, height: 900 });
  assert.equal(plan.width, 1600);
  assert.equal(plan.height, 900);
});

test('planSize: the longest side is whichever side is longer', () => {
  const landscape = planSize(wide, { mode: MODES.longest, longest: 1000 });
  assert.equal(landscape.width, 1000);
  assert.equal(landscape.height, 563);

  const portrait = planSize({ width: 450, height: 800, ratio: 450 / 800 },
    { mode: MODES.longest, longest: 1000 });
  assert.equal(portrait.height, 1000);
  assert.equal(portrait.width, 563);
});

test('planSize: a box, fitted, is the picture and no padding at all', () => {
  const plan = planSize(wide, { mode: MODES.box, width: 1200, height: 1200, fit: FITS.fit });
  assert.equal(plan.width, 1200);
  assert.equal(plan.height, 675);
  assert.equal(plan.padded, false);
  assert.deepEqual(plan.draw, { x: 0, y: 0, width: 1200, height: 675 });
});

test('planSize: a box, padded, is exactly the box with the drawing centred', () => {
  const plan = planSize(wide, { mode: MODES.box, width: 1200, height: 1200, fit: FITS.pad });
  assert.equal(plan.width, 1200);
  assert.equal(plan.height, 1200);
  assert.equal(plan.padded, true);
  assert.equal(plan.draw.width, 1200);
  assert.equal(plan.draw.height, 675);
  assert.equal(plan.draw.y, Math.round((1200 - 675) / 2));
  assert.equal(plan.draw.x, 0);
});

test('planSize: a box, stretched, fills it and says the shape was changed', () => {
  const plan = planSize(wide, { mode: MODES.box, width: 1200, height: 1200, fit: FITS.stretch });
  assert.equal(plan.width, 1200);
  assert.equal(plan.height, 1200);
  assert.equal(plan.stretch, true);
  assert.deepEqual(plan.draw, { x: 0, y: 0, width: 1200, height: 1200 });
});

test('planSize: a box with one side left blank means "this wide, and whatever tall"', () => {
  // Falling through to the box would draw the picture into a one-pixel strip.
  const plan = planSize(wide, { mode: MODES.box, width: 1600, height: 0, fit: FITS.pad });
  assert.equal(plan.width, 1600);
  assert.equal(plan.height, 900);
  assert.equal(plan.padded, false);
});

test('planSize: nothing ever comes out zero pixels on a side', () => {
  const plan = planSize(wide, { mode: MODES.scale, scale: 0.0001 });
  assert.ok(plan.width >= 1 && plan.height >= 1);
});

test('planSize: a missing number falls back to the file\'s own size, not to zero', () => {
  const plan = planSize(square, { mode: MODES.width, width: NaN });
  assert.equal(plan.width, 24);
});

/* =============================================================== atDensity */

test('atDensity: @2x is exactly twice its @1x, in every field', () => {
  const base = planSize(wide, { mode: MODES.box, width: 1000, height: 1000, fit: FITS.pad });
  const twice = atDensity(base, 2);
  assert.equal(twice.width, base.width * 2);
  assert.equal(twice.height, base.height * 2);
  assert.equal(twice.draw.width, base.draw.width * 2);
  assert.equal(twice.draw.height, base.draw.height * 2);
  assert.equal(twice.draw.x, base.draw.x * 2);
  assert.equal(twice.draw.y, base.draw.y * 2);
});

test('atDensity: 1x is the plan itself', () => {
  const base = planSize(square, { mode: MODES.scale, scale: 3 });
  assert.equal(atDensity(base, 1), base);
});

test('atDensity: an odd 1x does not drift when it is doubled', () => {
  // 563 x 317 doubled is 1126 x 634. Re-planning at 2x from the ratio would
  // give 1125 x 633, and an @2x that is not twice its @1x is the bug nobody
  // sees until a phone draws it half a pixel off.
  const base = planSize(wide, { mode: MODES.longest, longest: 563 });
  const twice = atDensity(base, 2);
  assert.equal(twice.width, base.width * 2);
  assert.equal(twice.height, base.height * 2);
});

/* ============================================================= checkLimits */

test('checkLimits: an ordinary size passes without a word', () => {
  const verdict = checkLimits({ width: 1024, height: 1024 });
  assert.equal(verdict.ok, true);
  assert.equal(verdict.warn, false);
  assert.equal(verdict.reason, '');
});

test('checkLimits: past what Safari on a phone will do, it warns and still runs', () => {
  const side = Math.ceil(Math.sqrt(WARN_PIXELS)) + 100;
  const verdict = checkLimits({ width: side, height: side });
  assert.equal(verdict.ok, true);
  assert.equal(verdict.warn, true);
  assert.match(verdict.reason, /iPhone|iPad/);
});

test('checkLimits: past the side a canvas has, it refuses', () => {
  const verdict = checkLimits({ width: MAX_SIDE + 1, height: 10 });
  assert.equal(verdict.ok, false);
  assert.match(verdict.reason, /blank/);
});

test('checkLimits: past what a browser will hold, it refuses', () => {
  const verdict = checkLimits({ width: 16000, height: 16000 });
  assert.equal(verdict.ok, false);
  assert.match(verdict.reason, /megapixels/);
});

/* ================================================================ describe */

test('describePlan: the sentence carries the numbers the run will use', () => {
  const intrinsic = { width: 24, height: 24, ratio: 1 };
  const plan = planSize(intrinsic, { mode: MODES.scale, scale: 4 });
  const said = describePlan(plan, intrinsic, [1, 2]);
  assert.match(said, /24 × 24/);
  assert.match(said, /96 × 96/);
  assert.match(said, /192 × 192/, 'the @2x size is not in the sentence');
});

test('describePlan: padding and stretching are said out loud', () => {
  const intrinsic = { width: 800, height: 450, ratio: 800 / 450 };
  const padded = planSize(intrinsic, { mode: MODES.box, width: 600, height: 600, fit: FITS.pad });
  assert.match(describePlan(padded, intrinsic, [1]), /centred/);

  const stretched = planSize(intrinsic, { mode: MODES.box, width: 600, height: 600, fit: FITS.stretch });
  assert.match(describePlan(stretched, intrinsic, [1]), /distorted/);
});

test('times: a whole multiple has no decimals on it', () => {
  assert.equal(times(4), '4×');
  assert.equal(times(0.5), '0.5×');
  assert.equal(times(1.333), '1.33×');
});

/* =================================================================== names */

test('stemOf: the extension goes, .svgz included', () => {
  assert.equal(stemOf('logo.svg'), 'logo');
  assert.equal(stemOf('logo.svgz'), 'logo');
  assert.equal(stemOf('my.logo.v2.svg'), 'my.logo.v2');
  assert.equal(stemOf('.svg'), 'image');
  assert.equal(stemOf(''), 'image');
});

test('outName: @1x is not written, because the plain name is the one a page points at', () => {
  assert.equal(outName('logo.svg', 'png'), 'logo.png');
  assert.equal(outName('logo.svg', 'png', 1), 'logo.png');
  assert.equal(outName('logo.svg', 'png', 2), 'logo@2x.png');
  assert.equal(outName('logo.svg', 'jpg', 3), 'logo@3x.jpg');
});

test('uniqueNames: two files called the same thing do not overwrite each other', () => {
  assert.deepEqual(
    uniqueNames(['icon.png', 'icon.png', 'other.png', 'icon.png']),
    ['icon.png', 'icon-2.png', 'other.png', 'icon-3.png'],
  );
});

test('uniqueNames: the clash is judged the way a file system judges it', () => {
  assert.deepEqual(uniqueNames(['Icon.png', 'icon.png']), ['Icon.png', 'icon-2.png']);
});

test('describeSource: a size that was assumed does not read like one that was found', () => {
  assert.match(describeSource({ width: 24, height: 24, source: 'attributes' }), /the file asks for/);
  assert.match(describeSource({ width: 24, height: 24, source: 'viewbox' }), /viewBox/);
  assert.match(describeSource({ width: 300, height: 150, source: 'default' }), /assumed/);
});

test('dimensions and countOf: said the same way wherever they appear', () => {
  assert.equal(dimensions(16, 9), '16 × 9');
  assert.equal(countOf(1), '1 file');
  assert.equal(countOf(4), '4 files');
});
