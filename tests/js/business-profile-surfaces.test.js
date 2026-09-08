/**
 * tools/business-profile-preview/src/render.js and src/surfaces.js - the
 * drawing itself.
 *
 * WHY WELL-FORMEDNESS IS THE FIRST TEST HERE
 *
 * The mock-up is put on the page as markup and handed to the browser as an
 * IMAGE to make the PNG, and those two are parsed by different parsers. The
 * HTML one forgives almost anything; the XML one forgives nothing. So a
 * mistake in an attribute is a preview that looks perfect and a download
 * button that refuses with nothing to say why - which is exactly what happened
 * here, to a font stack whose family names were double-quoted inside a
 * double-quoted attribute. The page rendered it and the PNG would not draw.
 *
 * `shared/js/parse-xml.js` is the strict parser, borrowed from the formatter
 * tools. This tool does not ship it - the browser is the only thing that has
 * to read the markup at run time - but a test may hold the ruler the browser
 * holds, and this one does, over every surface in every state that changes the
 * shape of the markup.
 *
 * The rest of the file is the layout arithmetic that has no browser in it:
 * text is measured through a callback, so a ruler that counts characters is
 * enough to pin where a line breaks.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { parseXml } from '../../shared/js/parse-xml.js';
import { ellipsis, esc, starsWidth, wrap } from '../../tools/business-profile-preview/src/render.js';
import { SURFACES } from '../../tools/business-profile-preview/src/surfaces.js';
import { normalise } from '../../tools/business-profile-preview/src/profile.js';
import { describe } from '../../tools/business-profile-preview/src/view.js';

/**
 * A ruler that counts characters.
 *
 * Not the browser's, and it does not have to be: every layout decision in
 * surfaces.js goes through this callback, so a ruler with a known answer pins
 * where a line breaks without a font anywhere near the test.
 */
const measure = (value, size, weight = 400) => (
  String(value).length * size * (weight >= 500 ? 0.58 : 0.55)
);

/**
 * The words, read off the tool's own body.html rather than written out here.
 *
 * The page does the same thing at run time, and for the same reason: a list of
 * keys kept beside the code is a second place to remember, and the first key
 * added to the markup without it went to the search result as the literal text
 * `label.reviewsshort`. Reading the block means a key added there is covered by
 * every case below without anybody adding it twice.
 */
const BODY = readFileSync(
  new URL('../../tools/business-profile-preview/body.html', import.meta.url), 'utf8');

const LABELS = Object.fromEntries(
  [...BODY.matchAll(/<span data-phrase="([^"]+)"\s*>([\s\S]*?)<\/span>/g)]
    .map(([, key, text]) => [key, text.replace(/\s+/g, ' ').trim()]));

const NOON = new Date(2026, 8, 7, 12, 0);

const view = (fields) => describe(normalise(fields), LABELS, NOON);

const FULL = {
  name: 'Blue Bottle Coffee',
  category: 'Coffee shop',
  price: '$$',
  rating: '4.6',
  reviews: '1284',
  address: '123 King St W, Toronto, ON M5V 1J5',
  phone: '(416) 555-0134',
  website: 'https://www.example.com',
  description: 'Small-batch roaster and cafe, open seven days a week.',
  attributes: 'Dine-in, Takeaway, Wheelchair accessible',
  photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
};

/* --------------------------------------------------- well-formedness */

// The states that change the SHAPE of the markup rather than the words in it:
// a photo or a grey tile, stars or no stars, an address or none, a description
// or none, chips or none, and a name with something in it that has to be
// escaped.
const STATES = {
  everything: FULL,
  nothing: {},
  'no photo': { ...FULL, photo: null },
  'no reviews': { ...FULL, rating: '', reviews: '' },
  'no address, so no Directions': { ...FULL, address: '' },
  'no website and no phone': { ...FULL, website: '', phone: '' },
  'a service area instead of an address': { ...FULL, serviceArea: true },
  'permanently closed': { ...FULL, status: 'permanent' },
  'no description and no attributes': { ...FULL, description: '', attributes: '' },
  'a name full of markup': { ...FULL, name: 'Ben & Jerry\'s <b>"Best"</b> Cafe' },
  'a name too long for any of them': { ...FULL, name: 'The '.repeat(40) },
};

for (const [name, surface] of Object.entries(SURFACES)) {
  for (const [state, fields] of Object.entries(STATES)) {
    test(`the ${name} is well-formed XML: ${state}`, () => {
      const drawn = surface(view(fields), measure);
      assert.doesNotThrow(() => parseXml(drawn.svg),
        'the page would show this and the PNG would refuse it');
      assert.ok(drawn.width > 0 && drawn.height > 0);
    });
  }
}

/**
 * The failure this whole arrangement is prone to: `phrase()` and view.js's
 * `fill` both resolve a key they cannot find to the key itself, on purpose, so
 * a word the drawing asks for and the markup does not define arrives on screen
 * as `label.reviewsshort` rather than as an exception. It did, in the search
 * result, for exactly as long as there was a hand-written list of keys beside
 * the code.
 *
 * The check is a NAMESPACE and not the set of keys read out of body.html,
 * which would be circular: a key missing from that file is missing from both
 * sides of the comparison and the test would pass. The five prefixes below are
 * this tool's own, and nothing a visitor could type into a field looks like
 * one - "example.com" is a domain and does not begin `label.`.
 */
const KEY = /^(?:label|status|time|day|sample)\.[a-z0-9.]+$/;

test('no phrase key reaches the picture as its own name', () => {
  for (const [name, surface] of Object.entries(SURFACES)) {
    for (const [state, fields] of Object.entries(STATES)) {
      const drawn = surface(view(fields), measure);
      for (const [, drawnText] of drawn.svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)) {
        assert.equal(KEY.test(drawnText.trim()), false,
          `${name}, ${state}: "${drawnText}" is a key, not a sentence`);
      }
    }
  }
});

test('the name a visitor typed cannot end an attribute or open a tag', () => {
  const drawn = SURFACES.panel(view({ ...FULL, name: '</svg><script>x</script>' }), measure);
  assert.equal(drawn.svg.includes('<script'), false);
  assert.ok(drawn.svg.includes('&lt;/svg&gt;'));
  assert.equal(esc('a & b < c > d " e \' f'), 'a &amp; b &lt; c &gt; d &quot; e &#39; f');
});

test('nothing in the markup points anywhere but at itself', () => {
  const drawn = SURFACES.mobile(view(FULL), measure);
  const hrefs = [...drawn.svg.matchAll(/href="([^"]*)"/g)].map((one) => one[1]);
  assert.ok(hrefs.length, 'there is a photo in this one');
  for (const href of hrefs) {
    assert.ok(href.startsWith('data:image/'),
      `${href.slice(0, 40)} is a reference out of a file that gets downloaded`);
  }
  // The namespace on the root element is the one absolute URL a self-contained
  // SVG is allowed - it names the language rather than fetching anything - so
  // it is removed before looking. Anything left would be a stylesheet, a font
  // or a picture that had crept in.
  const outward = drawn.svg.replace(' xmlns="http://www.w3.org/2000/svg"', '');
  assert.equal(/https?:\/\//.test(outward), false, 'the file must reach for nothing');
});

/* ------------------------------------------------------ what each shows */

test('a profile with no reviews shows a line, not five empty stars', () => {
  const drawn = SURFACES.panel(view({ ...FULL, rating: '', reviews: '' }), measure);
  assert.ok(drawn.svg.includes('No reviews yet'));
  assert.equal(drawn.svg.includes('clipPath id="panel-stars"'), false,
    'five empty stars is what one star looks like at a glance');
});

test('the gold row is clipped to the fraction the rating actually is', () => {
  const width = starsWidth(14);
  const clipped = (rating) => {
    const drawn = SURFACES.panel(view({ ...FULL, rating }), measure);
    return Number(/id="panel-stars"><rect [^>]*width="([\d.]+)"/.exec(drawn.svg)[1]);
  };
  assert.ok(Math.abs(clipped('5') - width) < 0.02, 'five stars fills the row');
  assert.ok(Math.abs(clipped('2.5') - width / 2) < 0.02, 'and two and a half is half of it');
  assert.ok(clipped('4.6') < clipped('4.7'));
});

test('a button appears only when the field behind it does', () => {
  const has = (fields, label) => SURFACES.panel(view(fields), measure).svg.includes(`>${label}<`);
  assert.ok(has(FULL, 'Directions') && has(FULL, 'Website') && has(FULL, 'Call'));
  assert.equal(has({ ...FULL, address: '' }, 'Directions'), false);
  assert.equal(has({ ...FULL, website: '' }, 'Website'), false);
  assert.equal(has({ ...FULL, phone: '' }, 'Call'), false);
  assert.ok(has({}, 'Save'), 'Save and Share need nothing, so they are always there');
});

test('the narrow surface prints the count in brackets and the wide one in words', () => {
  assert.ok(SURFACES.listing(view(FULL), measure).svg.includes('(1,284)'));
  assert.ok(SURFACES.panel(view(FULL), measure).svg.includes('1,284 Google reviews'));
});

test('a card with less in it is a shorter card', () => {
  const full = SURFACES.panel(view(FULL), measure).height;
  const bare = SURFACES.panel(view({ ...FULL, description: '', attributes: '' }), measure).height;
  assert.ok(bare < full, 'an empty field must not leave a hole where it was');
});

test('the three surfaces are the three widths they claim to be', () => {
  assert.equal(SURFACES.panel(view(FULL), measure).width, 428);
  assert.equal(SURFACES.mobile(view(FULL), measure).width, 390);
  assert.equal(SURFACES.listing(view(FULL), measure).width, 640);
});

test('an unnamed profile draws the placeholder, and says it is one', () => {
  const empty = view({});
  assert.equal(empty.named, false);
  assert.ok(SURFACES.panel(empty, measure).svg.includes('Your business name'));
});

/* ------------------------------------------------------------ wrapping */

test('words are broken between words while they can be', () => {
  assert.deepEqual(wrap('one two three four', 10 * 10 * 0.55, { size: 10, lines: 3 }, measure),
    ['one two', 'three four']);
});

test('past the last line, the last line says so', () => {
  const lines = wrap('one two three four five six', 7 * 10 * 0.55, { size: 10, lines: 2 }, measure);
  assert.equal(lines.length, 2);
  assert.ok(lines[1].endsWith('…'), 'a cut that does not say so reads as a shorter name');
});

test('a word wider than the column is cut rather than hung out of the card', () => {
  const lines = wrap('averyveryverylongsingleword', 6 * 10 * 0.55, { size: 10, lines: 2 }, measure);
  assert.equal(lines.length, 2);
  assert.ok(lines.every((line) => line.length <= 7));
  assert.ok(lines[1].endsWith('…'));
});

test('text that fits is left alone', () => {
  const lines = wrap('short', 100, { size: 10, lines: 2 }, measure);
  assert.deepEqual(lines, ['short']);
  assert.deepEqual(wrap('', 100, { size: 10, lines: 2 }, measure), []);
  assert.deepEqual(wrap('   ', 100, { size: 10, lines: 2 }, measure), []);
});

test('an ellipsis is added by taking characters away, not by adding width', () => {
  const width = 5 * 10 * 0.55;
  const cut = ellipsis('abcdefghij', width, { size: 10 }, measure);
  assert.ok(measure(cut, 10, 400) <= width, `"${cut}" still does not fit`);
  assert.ok(cut.endsWith('…'));
});
