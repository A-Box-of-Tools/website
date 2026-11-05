import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { ENGLISH, MAX_COUNT, PLANET_REFERENCES, STAR_REFERENCES, TIME_REFERENCES, VOLUME_LADDER, VOLUME_REFERENCES, bookModel, booksPerUnit, compareVolume, countForSize, countForVolume, countReading, countText, countingModel, dialCount, heightLadder, ladderFor, log10Count, namedAmount, parseCount, placeOnLadder, roundUpCount, sandModel, sizePerUnit, textModel, waterModel } from '../../tools/number-explorer/src/scale.js';
import { CONTAINERS, containerIndex, levelForShare } from '../../tools/number-explorer/src/containers.js';
import { circleGroup, starLevel } from '../../tools/number-explorer/src/scene-stars.js';
import { chipBox, fittedSize, meets, wrapLines } from '../../tools/number-explorer/src/paint.js';
import { clearedLabelY, createBooksScene } from '../../tools/number-explorer/src/scene-books.js';
import { createFillScene } from '../../tools/number-explorer/src/scene-fill.js';
import { createTimeScene } from '../../tools/number-explorer/src/scene-time.js';

function close(actual, expected, tolerance = 1e-10) {
  assert.ok(Number.isFinite(actual));
  assert.ok(Math.abs(actual - expected) <= Math.max(Number.EPSILON, Math.abs(expected) * tolerance), `${actual} differs from ${expected}`);
}

// The translated bodies themselves, because what a language accepts is written in its
// own markup and a table copied into this file could only ever agree with itself.
const LOCALES = new URL('../../locales/', import.meta.url);
const bodyPath = lang => new URL(`${lang}/tools/number-explorer.html`, LOCALES);
const LANGUAGES = readdirSync(LOCALES).filter(lang => existsSync(bodyPath(lang)));
const ENGLISH_BODY = readFileSync(new URL('../../tools/number-explorer/body.html', import.meta.url), 'utf8');
const bodyOf = lang => (lang === 'en' ? ENGLISH_BODY : readFileSync(bodyPath(lang), 'utf8'));
const phraseIn = (body, key) => new RegExp(`data-phrase="${key.replace(/\./g, '\\.')}">([^<]*)<`).exec(body)[1].replace(/&nbsp;/g, '\u00a0');
const readingOf = lang => countReading(phraseIn(bodyOf(lang), 'count.words'), lang, phraseIn(bodyOf(lang), 'count.names'));

test('number explorer preserves exact counts across accepted input forms', () => {
  for (const input of ['1000000000', '1,000,000,000', '1 000 000 000', '1b', '1 billion', '1e9']) assert.deepEqual(parseCount(input), { ok: true, count: 1000000000n });
  assert.deepEqual(parseCount(' 1.5B '), { ok: true, count: 1500000000n });
  assert.deepEqual(parseCount('.5 thousand'), { ok: true, count: 500n });
  assert.deepEqual(parseCount('1,234.5k'), { ok: true, count: 1234500n });
  assert.deepEqual(parseCount('1\u202f000\u202f000'), { ok: true, count: 1000000n });
  assert.deepEqual(parseCount('1\u00a0000'), { ok: true, count: 1000n });
  assert.deepEqual(parseCount('10e-1'), { ok: true, count: 1n });
  assert.deepEqual(parseCount('9007199254740993'), { ok: true, count: 9007199254740993n });
});
test('number explorer supports named suffixes without combining them with exponents', () => {
  const cases = [['2k', 2000n], ['2 thousand', 2000n], ['2m', 2000000n], ['2 million', 2000000n], ['2b', 2000000000n], ['2 billion', 2000000000n], ['2t', 2000000000000n], ['2 trillion', 2000000000000n]];
  for (const [input, count] of cases) assert.deepEqual(parseCount(input), { ok: true, count });
  assert.deepEqual(parseCount('1e3k'), { ok: false, key: 'amount-invalid' });
});
test('number explorer names every power up to its largest count', () => {
  const names = [['quadrillion', 15n], ['quintillion', 18n], ['sextillion', 21n], ['septillion', 24n], ['octillion', 27n], ['nonillion', 30n]];
  for (const [name, power] of names) assert.deepEqual(parseCount(`1 ${name}`), { ok: true, count: 10n ** power });
  assert.deepEqual(parseCount('2 nonillion'), { ok: false, key: 'amount-too-large' });
});
test('number explorer rejects ambiguous grouping and nonnumeric input', () => {
  for (const input of ['-1', '+1', 'NaN', 'Infinity', '0xff', '1,00', '1234,567', '1 00', '1  000', '1,000 000', '1\t000', '1e', '1e3.5', '1.2.3', '.', 'one million']) assert.deepEqual(parseCount(input), { ok: false, key: 'amount-invalid' }, input);
  assert.deepEqual(parseCount(1), { ok: false, key: 'amount-invalid' });
  for (const input of ['', '   ', null, undefined]) assert.deepEqual(parseCount(input), { ok: false, key: 'amount-required' });
});
test('number explorer enforces whole counts and the exact upper boundary', () => {
  for (const input of ['0.5', '1e-1', '1.0001k']) assert.deepEqual(parseCount(input), { ok: false, key: 'amount-whole' });
  for (const input of ['0', '0.0', '0e999999999999999999999']) assert.deepEqual(parseCount(input), { ok: true, count: 0n });
  assert.deepEqual(parseCount('1e30'), { ok: true, count: MAX_COUNT });
  assert.deepEqual(parseCount(MAX_COUNT.toString()), { ok: true, count: MAX_COUNT });
  assert.deepEqual(parseCount((MAX_COUNT + 1n).toString()), { ok: false, key: 'amount-too-large' });
  assert.deepEqual(parseCount('1e999999999999999999999'), { ok: false, key: 'amount-too-large' });
  assert.deepEqual(parseCount('1e-999999999999999999999'), { ok: false, key: 'amount-whole' });
  assert.equal(parseCount('1'.repeat(1000)).ok, false);
});
test('number explorer reads a count the way each language writes it', () => {
  const written = {
    de: [['1 Milliarde', 10n ** 9n], ['eine Milliarde', 10n ** 9n], ['1,5 Milliarden', 15n * 10n ** 8n], ['1,5 Mrd.', 15n * 10n ** 8n], ['3 Billionen', 3n * 10n ** 12n], ['2 Mio', 2n * 10n ** 6n], ['5 Tsd.', 5000n], ['tausend Milliarden', 10n ** 12n], ['1 Quintillion', 10n ** 30n]],
    es: [['mil millones', 10n ** 9n], ['1 mil millones', 10n ** 9n], ['1,5 mil millones', 15n * 10n ** 8n], ['1000 M', 10n ** 9n], ['un millón', 10n ** 6n], ['1 millon', 10n ** 6n], ['2 billones', 2n * 10n ** 12n], ['1 billon', 10n ** 12n], ['1 quintillón', 10n ** 30n]],
    fr: [['1 milliard', 10n ** 9n], ['un milliard', 10n ** 9n], ['1,5 Md', 15n * 10n ** 8n], ['mille', 1000n], ['mille milliards', 10n ** 12n], ['3 billions', 3n * 10n ** 12n], ['1 Bn', 10n ** 12n], ['1 quintillion', 10n ** 30n]],
    pt: [['1 bilhão', 10n ** 9n], ['um bilhão', 10n ** 9n], ['1,5 bi', 15n * 10n ** 8n], ['3 trilhões', 3n * 10n ** 12n], ['3 trilhoes', 3n * 10n ** 12n], ['2 mi', 2n * 10n ** 6n], ['mil', 1000n], ['1 nonilhão', 10n ** 30n]],
    zh: [['10 亿', 10n ** 9n], ['10亿', 10n ** 9n], ['1.5 亿', 15n * 10n ** 7n], ['3 万亿', 3n * 10n ** 12n], ['1亿亿', 10n ** 16n], ['100 万', 10n ** 6n], ['1 billion', 10n ** 9n], ['1.5b', 15n * 10n ** 8n]],
    ja: [['10億', 10n ** 9n], ['1.5億', 15n * 10n ** 7n], ['3兆', 3n * 10n ** 12n], ['1京', 10n ** 16n], ['100穣', 10n ** 30n], ['100万', 10n ** 6n], ['1 billion', 10n ** 9n]]
  };
  for (const [lang, cases] of Object.entries(written)) {
    const reading = readingOf(lang);
    for (const [input, count] of cases) assert.deepEqual(parseCount(input, reading), { ok: true, count }, `${lang}: ${input}`);
  }
});
test('number explorer takes billion to mean what it means on the page it was typed on', () => {
  assert.deepEqual(parseCount('1 billion'), { ok: true, count: 10n ** 9n });
  assert.deepEqual(parseCount('1 Billion', readingOf('de')), { ok: true, count: 10n ** 12n });
  assert.deepEqual(parseCount('1 billion', readingOf('fr')), { ok: true, count: 10n ** 12n });
  assert.deepEqual(parseCount('1 billón', readingOf('es')), { ok: true, count: 10n ** 12n });
  assert.deepEqual(parseCount('1 bilhão', readingOf('pt')), { ok: true, count: 10n ** 9n });
  assert.deepEqual(parseCount('1 Trillion', readingOf('de')), { ok: true, count: 10n ** 18n });
});
test('number explorer refuses a word its language could mean two ways', () => {
  const refused = { zh: ['1兆', '1 兆'], pt: ['1 bilião'], es: ['1 billion'], de: ['1.5b', '1 t', '1 m'] };
  for (const [lang, inputs] of Object.entries(refused)) {
    for (const input of inputs) assert.deepEqual(parseCount(input, readingOf(lang)), { ok: false, key: 'amount-invalid' }, `${lang}: ${input}`);
  }
  assert.deepEqual(parseCount('1兆', readingOf('ja')), { ok: true, count: 10n ** 12n });
});
test('number explorer reads marks the way the page writes them', () => {
  const german = readingOf('de');
  assert.deepEqual(parseCount('1.000', german), { ok: true, count: 1000n });
  assert.deepEqual(parseCount('1.000'), { ok: true, count: 1n });
  assert.deepEqual(parseCount('1,000', german), { ok: true, count: 1n });
  assert.deepEqual(parseCount('1,000'), { ok: true, count: 1000n });
  assert.deepEqual(parseCount('1,500', german), { ok: false, key: 'amount-whole' });
  assert.deepEqual(parseCount('1.5 Milliarden', german), { ok: false, key: 'amount-invalid' });
  assert.deepEqual(parseCount('1,2e18', german), { ok: true, count: 12n * 10n ** 17n });
  assert.deepEqual(parseCount('1.2e18', german), { ok: true, count: 12n * 10n ** 17n });
  const french = readingOf('fr');
  for (const input of ['1 000 000', '1\u00a0000\u00a0000', '1\u202f000\u202f000']) assert.deepEqual(parseCount(input, french), { ok: true, count: 10n ** 6n }, input);
  assert.deepEqual(parseCount('1,5\u00a0Md', french), { ok: true, count: 15n * 10n ** 8n });
});
test('number explorer reads a number grouped twice over whichever mark groups it', () => {
  for (const lang of LANGUAGES) {
    const reading = readingOf(lang);
    for (const input of ['1,000,000', '1.000.000']) assert.deepEqual(parseCount(input, reading), { ok: true, count: 10n ** 6n }, `${lang}: ${input}`);
  }
  assert.deepEqual(parseCount('1.000.000'), { ok: true, count: 10n ** 6n });
});
test('number explorer reads what a Chinese or Japanese input method types', () => {
  const chinese = readingOf('zh');
  const said = [['一亿', 10n ** 8n], ['三亿', 3n * 10n ** 8n], ['十亿', 10n ** 9n], ['两千万', 2n * 10n ** 7n], ['五百万', 5n * 10n ** 6n], ['百万', 10n ** 6n], ['万亿', 10n ** 12n], ['１０亿', 10n ** 9n], ['３亿', 3n * 10n ** 8n], ['１，０００', 1000n], ['100\u3000万', 10n ** 6n]];
  for (const [input, count] of said) assert.deepEqual(parseCount(input, chinese), { ok: true, count }, input);
  // Multiplying these through would be a silent wrong answer, so they are not read at all.
  for (const input of ['三千五百万', '三五亿', '二十五万']) assert.deepEqual(parseCount(input, chinese), { ok: false, key: 'amount-invalid' }, input);
  const japanese = readingOf('ja');
  for (const [input, count] of [['一億', 10n ** 8n], ['十億', 10n ** 9n], ['三千万', 3n * 10n ** 7n], ['１兆', 10n ** 12n]]) assert.deepEqual(parseCount(input, japanese), { ok: true, count }, input);
});
test('number explorer lets words alone name a count, but not a letter or an article', () => {
  for (const [input, count] of [['a billion', 10n ** 9n], ['million', 10n ** 6n], ['a thousand million', 10n ** 9n]]) assert.deepEqual(parseCount(input), { ok: true, count }, input);
  for (const input of ['k', 'm', 'b', 't', 'a', 'an', 'an m', '5 a', '2 a billion', '1km', '1 km']) assert.deepEqual(parseCount(input), { ok: false, key: 'amount-invalid' }, input);
  assert.deepEqual(parseCount('eine', readingOf('de')), { ok: false, key: 'amount-invalid' });
});
test('number explorer writes back what each language reads', () => {
  const counts = [0n, 1n, 999n, 1000n, 1234567n, 999999999999999n, 10n ** 15n, 12n * 10n ** 17n, 1234n * 10n ** 20n, 12345n * 10n ** 20n, 9007199254740993n, MAX_COUNT];
  for (const lang of LANGUAGES) {
    const reading = readingOf(lang);
    for (const count of counts) assert.deepEqual(parseCount(countText(count, reading), reading), { ok: true, count }, `${lang}: ${count}`);
  }
  assert.equal(countText(10n ** 9n, readingOf('de')), '1.000.000.000');
  assert.equal(countText(10n ** 9n, readingOf('fr')), '1 000 000 000');
  assert.equal(countText(10n ** 9n, readingOf('zh')), '1,000,000,000');
  assert.equal(countText(12n * 10n ** 17n, readingOf('de')), '1,2 Trillionen');
});
test('number explorer writes a big count in the words of the page it is on', () => {
  const written = {
    en: [[10n ** 15n, '1 quadrillion'], [12n * 10n ** 17n, '1.2 quintillion'], [1234n * 10n ** 20n, '123.4 sextillion'], [MAX_COUNT, '1 nonillion']],
    de: [[10n ** 15n, '1 Billiarde'], [12n * 10n ** 17n, '1,2 Trillionen'], [2n * 10n ** 21n, '2 Trilliarden'], [MAX_COUNT, '1 Quintillion']],
    es: [[10n ** 15n, '1000 billones'], [12n * 10n ** 16n, '120.000 billones'], [12n * 10n ** 17n, '1,2 trillones'], [10n ** 18n, '1 trillón'], [MAX_COUNT, '1 quintillón']],
    // 1,5 takes the singular here, as "1,5 milhão" and "1,5 million" do.
    fr: [[10n ** 15n, '1 billiard'], [12n * 10n ** 17n, '1,2 trillion'], [2n * 10n ** 18n, '2 trillions'], [MAX_COUNT, '1 quintillion']],
    pt: [[10n ** 15n, '1 quatrilhão'], [12n * 10n ** 17n, '1,2 quintilhão'], [2n * 10n ** 18n, '2 quintilhões'], [MAX_COUNT, '1 nonilhão']],
    zh: [[10n ** 15n, '1000万亿'], [12n * 10n ** 17n, '120亿亿'], [10n ** 24n, '1亿亿亿'], [MAX_COUNT, '100万亿亿亿']],
    ja: [[10n ** 15n, '1000兆'], [12n * 10n ** 17n, '120京'], [10n ** 24n, '1秭'], [MAX_COUNT, '100穣']]
  };
  for (const [lang, cases] of Object.entries(written)) {
    for (const [count, text] of cases) assert.equal(countText(count, readingOf(lang)), text, lang);
  }
});
test('number explorer can read back every name it writes, and has one for every big count', () => {
  for (const lang of ['en', ...LANGUAGES]) {
    const reading = readingOf(lang);
    for (const { one, other, power } of reading.names) {
      assert.ok(power <= 30, `${lang}: ${one} is past the largest count`);
      for (const word of [one, other]) assert.deepEqual(parseCount(`1${reading.joint}${word}`, reading), { ok: true, count: 10n ** BigInt(power) }, `${lang}: ${word}`);
    }
    // Intl's words run out at about 10^15. Past that a name has to be in reach, or the
    // number comes out as a million of something, which is the digits all over again.
    for (let power = 15; power <= 30; power++) {
      const named = namedAmount(Number(`1e${power}`), 3, reading);
      assert.ok(named && named.amount < 1e6, `${lang}: 10^${power}`);
    }
  }
});
test('number explorer states no power of ten in superscript, in any language', () => {
  const toml = lang => new URL(lang === 'en' ? '../../tools/number-explorer/tool.toml' : `${lang}/tools/number-explorer.toml`, lang === 'en' ? import.meta.url : LOCALES);
  for (const lang of ['en', ...LANGUAGES]) {
    assert.doesNotMatch(bodyOf(lang), /10[⁰¹²³⁴⁵⁶⁷⁸⁹]/, `${lang} body`);
    assert.doesNotMatch(readFileSync(toml(lang), 'utf8'), /10[⁰¹²³⁴⁵⁶⁷⁸⁹]/, `${lang} tool.toml`);
  }
  for (const module of ['say', 'main']) assert.doesNotMatch(readFileSync(new URL(`../../tools/number-explorer/src/${module}.js`, import.meta.url), 'utf8').replace(/^\s*\/\/.*$/gm, ''), /[⁰¹²⁴⁵⁶⁷⁸⁹]/, module);
});
test('number explorer reads back the numbers the page itself prints', () => {
  for (const lang of LANGUAGES) {
    const reading = readingOf(lang);
    for (const compactDisplay of ['long', 'short']) {
      for (let power = 3; power <= 14; power++) {
        const printed = new Intl.NumberFormat(lang, { notation: 'compact', compactDisplay }).format(10 ** power);
        assert.deepEqual(parseCount(printed, reading), { ok: true, count: 10n ** BigInt(power) }, `${lang} ${compactDisplay}: ${printed}`);
      }
    }
    const grouped = new Intl.NumberFormat(lang).format(1234567);
    assert.deepEqual(parseCount(grouped, reading), { ok: true, count: 1234567n }, `${lang}: ${grouped}`);
  }
});
test('number explorer opens and runs its examples on the same numbers in every language', () => {
  const openingOf = body => /id="amount"[^>]*value="([^"]*)"/.exec(body)[1];
  const examplesOf = body => [...body.matchAll(/data-example="([^"]*)"/g)].map(match => match[1].split(':'));
  const english = examplesOf(ENGLISH_BODY).map(([world, value, unit]) => [world, parseCount(value).count, unit]);
  assert.equal(parseCount(openingOf(ENGLISH_BODY)).count, 10n ** 9n);
  for (const lang of LANGUAGES) {
    const body = bodyOf(lang);
    const reading = readingOf(lang);
    assert.deepEqual(parseCount(openingOf(body), reading), { ok: true, count: 10n ** 9n }, `${lang} opens on ${openingOf(body)}`);
    const theirs = examplesOf(body).map(([world, value, unit]) => [world, parseCount(value, reading).count, unit]);
    assert.deepEqual(theirs, english, lang);
  }
});
test('number explorer promises only numbers its box can read', () => {
  const promised = {
    en: { help: ['1,000,000', '1.5b', '3 trillion'], invalid: ['1,000,000', '1 billion', '1.5b'], largest: '1 nonillion' },
    de: { help: ['1.000.000', '1,5 Mrd.', '3 Billionen'], invalid: ['1.000.000', '1 Milliarde', '1,5 Mrd.'], largest: '1 Quintillion' },
    es: { help: ['1.000.000', '1,5 M', '3 billones'], invalid: ['1.000.000', 'mil millones', '1,5 M'], largest: '1 quintillón' },
    fr: { help: ['1\u00a0000\u00a0000', '1,5\u00a0Md', '3\u00a0billions'], invalid: ['1\u00a0000\u00a0000', '1\u00a0milliard', '1,5\u00a0Md'], largest: '1\u00a0quintillion' },
    pt: { help: ['1.000.000', '1,5 bi', '3 trilhões'], invalid: ['1.000.000', '1 bilhão', '1,5 bi'], largest: '1 nonilhão' },
    zh: { help: ['1,000,000', '1.5 亿', '3 万亿'], invalid: ['1,000,000', '10 亿', '1.5 亿'], largest: '100 万亿亿亿' },
    ja: { help: ['1,000,000', '1.5億', '3兆'], invalid: ['1,000,000', '10億', '1.5億'], largest: '100穣' }
  };
  for (const [lang, { help, invalid, largest }] of Object.entries(promised)) {
    const body = bodyOf(lang);
    const reading = readingOf(lang);
    const helpText = /id="amount-help"[^>]*>([^<]*)</.exec(body)[1].replace(/&nbsp;/g, '\u00a0');
    const invalidText = phraseIn(body, 'amount-invalid');
    assert.deepEqual(parseCount(largest, reading), { ok: true, count: MAX_COUNT }, `${lang} calls ${largest} its largest number`);
    for (const said of [helpText, phraseIn(body, 'amount-too-large'), phraseIn(body, 'step.limit')]) assert.ok(said.includes(largest), `${lang} does not say ${largest}: ${said}`);
    for (const form of help) {
      assert.ok(helpText.includes(form), `${lang} help no longer says ${form}: ${helpText}`);
      assert.equal(parseCount(form, reading).ok, true, `${lang} help promises ${form}`);
    }
    for (const form of invalid) {
      assert.ok(invalidText.includes(form), `${lang} error no longer says ${form}: ${invalidText}`);
      assert.equal(parseCount(form, reading).ok, true, `${lang} error promises ${form}`);
    }
  }
});
test('number explorer keeps the words it reads by default in step with the English markup', () => {
  const sorted = ({ words }) => [...words].sort(([a], [b]) => a.localeCompare(b));
  assert.deepEqual(sorted(readingOf('en')), sorted(ENGLISH));
  assert.deepEqual(readingOf('en').names, ENGLISH.names);
});
test('number explorer drops a landmark into a sentence without needing it declined', () => {
  // A rung name is written once, in the form it has standing alone. A preposition in
  // front of the blank would have to decline it or contract with its article, which
  // "von die Sterne" and "de el Sol" show a template cannot do.
  const dangerous = {
    de: /(?:^|\s)(?:von|zu|zum|zur|mit|bei|nach|aus|für|um|an|am|im|in|bis)\s+\{name\}/i,
    es: /(?:^|\s)(?:de|a|del|al)\s+\{name\}/i,
    fr: /(?:^|\s)(?:de|du|à|au|que|qu')\s*\{name\}/i,
    pt: /(?:^|\s)(?:de|a|em|por|do|da|ao|no|na)\s+\{name\}/i
  };
  for (const [lang, pattern] of Object.entries(dangerous)) {
    for (const [, key, text] of bodyOf(lang).matchAll(/data-phrase="([^"]+)">([^<]*)</g)) {
      assert.ok(!pattern.test(text.replace(/&nbsp;/g, ' ')), `${lang} ${key}: ${text}`);
    }
  }
});
test('number explorer leaves no hole in a Chinese or Japanese sentence', () => {
  for (const lang of ['zh', 'ja']) {
    const body = bodyOf(lang);
    const block = body.slice(body.indexOf('<div id="phrases"'));
    for (const [, key, text] of block.matchAll(/data-phrase="([^"]+)">([^<]*)</g)) {
      assert.ok(!text.includes('\n'), `${lang} ${key} is wrapped across lines`);
      // The name filling this blank is itself Chinese, so a space beside it is a gap in a sentence.
      assert.ok(!/[一-鿿] \{name\}|\{name\} [一-鿿]/.test(text), `${lang} ${key}: ${text}`);
    }
  }
});
test('number explorer wraps a label in any language without leaving the width it was given', () => {
  // Ten units a character is enough to see where a line gives way.
  const ctx = { save() {}, restore() {}, font: '', measureText: text => ({ width: [...text].length * 10 }) };
  assert.deepEqual(wrapLines(ctx, 'a stack of every', 80, 12), ['a stack', 'of every']);
  assert.deepEqual(wrapLines(ctx, '世上所有不同的书堆', 40, 12), ['世上所有', '不同的书', '堆']);
  assert.deepEqual(wrapLines(ctx, '観測可能な宇宙', 30, 12), ['観測可', '能な宇', '宙']);
  // Closing marks and small kana stay with what they follow, opening marks with what they lead.
  assert.deepEqual(wrapLines(ctx, '太阳，月亮', 20, 12), ['太', '阳，', '月亮']);
  assert.deepEqual(wrapLines(ctx, 'シャトル', 20, 12), ['シャ', 'トル']);
  assert.deepEqual(wrapLines(ctx, '火星（近）', 30, 12), ['火星', '（近）']);
  assert.deepEqual(wrapLines(ctx, 'Andromeda-Galaxie', 100, 12), ['Andromeda-', 'Galaxie']);
  // The space Intl puts in a percentage is not a place to break.
  assert.deepEqual(wrapLines(ctx, 'Ziel 0,1\u00a0%', 50, 12), ['Ziel', '0,1\u00a0%']);
  const broken = wrapLines(ctx, 'Beobachtbaren', 60, 12);
  assert.deepEqual(broken, ['Beoba-', 'chtba-', 'ren']);
  for (const line of broken) assert.ok(ctx.measureText(line).width <= 60, line);
  assert.deepEqual(wrapLines(ctx, '', 60, 12), []);
});

// A canvas that paints nothing and keeps what it was told to write, with a chip counted as
// the rounded box it fills, because the box is what covers its neighbour. Characters are
// wider than most fonts make them, so a label that clears here has room to spare there.
function recordingCanvas() {
  const written = [];
  let state = { font: '12px sans-serif', globalAlpha: 1, textAlign: 'left' };
  const saved = [];
  let arcs = [];
  let round = null;
  let halo = null;
  const size = () => Number(/([\d.]+)px/.exec(state.font)?.[1] ?? 12);
  const widthOfText = text => [...String(text)].reduce((sum, char) => sum + (char.charCodeAt(0) > 0x2e7f ? 1 : 0.6), 0) * size();
  const methods = {
    save() { saved.push({ ...state }); },
    restore() { state = saved.pop(); },
    measureText: text => ({ width: widthOfText(text) }),
    beginPath() { arcs = []; round = null; },
    arcTo(a, b, c, d) { arcs.push([a, b], [c, d]); },
    fill() {
      if (arcs.length !== 8) return;
      const xs = arcs.map(point => point[0]);
      const ys = arcs.map(point => point[1]);
      round = { left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys) };
    },
    strokeText(text) { halo = String(text); },
    fillText(text, x, y) {
      const line = String(text);
      const wide = widthOfText(line);
      const left = state.textAlign === 'center' ? x - wide / 2 : state.textAlign === 'right' ? x - wide : x;
      const box = { left, right: left + wide, top: y - size() * 0.42, bottom: y + size() * 0.42 };
      const inChip = round && halo !== line && (box.left + box.right) / 2 >= round.left && (box.left + box.right) / 2 <= round.right && y >= round.top && y <= round.bottom;
      halo = null;
      if (state.globalAlpha <= 0.25) return;
      if (!inChip) written.push({ line, ...box });
      else if (!written.some(other => other.round === round)) written.push({ line, round, ...round });
    }
  };
  const nothing = () => ({ addColorStop() {} });
  const canvas = new Proxy({}, {
    get: (_, key) => methods[key] ?? (key in state ? state[key] : nothing),
    set(_, key, value) { state[key] = value; return true; }
  });
  return { canvas, written };
}

const stageWords = {
  name: id => `The far side of ${id}`,
  length: value => `${value.toPrecision(3)} light-years`,
  volume: value => `${value.toPrecision(3)} cubic km`,
  duration: value => `${value.toPrecision(3)} long years`,
  long: value => `${value.toPrecision(3)} long years`,
  tally: (counted, share) => `Counted so far: ${counted} (${share.toFixed(2)})`,
  top: value => `${value.toPrecision(3)} light-years`,
  before: value => `Before: ${value.toPrecision(3)} light-years`,
  passed: (id, ratio) => `Below: the far side of ${id}, ${ratio.toPrecision(3)} ×`,
  full: share => `${Math.round(share * 100)}% full`,
  times: ratio => `${ratio.toPrecision(3)} ×`
};

// Every count in sixteenths of a power of ten, come to from a tenth of it, from the step below
// and from the step above, which between them put "Before" anywhere it can stand. It has to be
// that close: quarters of a power of ten stepped straight past "Before" on a container's name.
function labelMeetings(world, createScene, perUnit, readoutBottom, words = stageWords) {
  const meetings = [];
  const rungs = ladderFor(world);
  const scene = createScene();
  for (const [w, h] of [[242, 302], [297, 371], [680, 382], [894, 503]]) {
    const readout = { left: 0, right: w * 0.72, top: 0, bottom: readoutBottom };
    for (let sixteenth = 0; sixteenth <= 480; sixteenth += 1) {
      const amount = 10 ** (sixteenth / 16) * perUnit;
      for (const from of [amount / 10, amount / 10 ** (1 / 16), amount * 10 ** (1 / 16)]) {
        const { canvas, written } = recordingCanvas();
        scene.draw(canvas, { w, h, t: 2.5, dt: 0, velocity: 0, moving: false, motion: false, still: true, amount, perUnit, zero: false, rungs, readout, thickness: perUnit, words, previous: from, sinceOpened: 0 });
        const placed = [{ line: 'the readout', ...readout }, ...written];
        placed.forEach((one, i) => placed.slice(i + 1).forEach(other => {
          if (meets(one, other)) meetings.push(`${w}px, ${amount.toPrecision(3)} from ${from.toPrecision(3)}: "${one.line}" meets "${other.line}"`);
        }));
      }
    }
  }
  return meetings;
}

test('number explorer keeps every label on the books, fill and time stages clear of every other, at any count', t => {
  // Only the deep-space backdrops ask for these, and they are only ever painted on.
  globalThis.Path2D = class {};
  globalThis.document = { createElement: () => ({ getContext: () => recordingCanvas().canvas }) };
  t.after(() => {
    delete globalThis.Path2D;
    delete globalThis.document;
  });
  assert.deepEqual(labelMeetings('books', createBooksScene, 0.03, 84), []);
  for (const world of ['water', 'sand']) assert.deepEqual(labelMeetings(world, () => createFillScene(world), sizePerUnit(world), 52), [], world);
  assert.deepEqual(labelMeetings('time', createTimeScene, sizePerUnit('time'), 62), []);
  // A flag's name long enough to take a second line reaches up to the big line over it.
  const longFlags = { ...stageWords, name: id => `The long and winding way to ${id} as it is written` };
  assert.deepEqual(labelMeetings('time', createTimeScene, sizePerUnit('time'), 62, longFlags), []);
});

test('number explorer keeps the name of what the stack has just reached on a phone, whatever the chip says', t => {
  globalThis.Path2D = class {};
  globalThis.document = { createElement: () => ({ getContext: () => recordingCanvas().canvas }) };
  t.after(() => {
    delete globalThis.Path2D;
    delete globalThis.document;
  });
  const rungs = ladderFor('books');
  const scene = createBooksScene();
  const [w, h] = [297, 371];
  for (const id of ['iss', 'moon', 'sun', 'voyager', 'proxima', 'andromeda', 'edge']) {
    const { canvas, written } = recordingCanvas();
    const amount = rungs.find(rung => rung.id === id).size * 1.001;
    scene.draw(canvas, { w, h, t: 2.5, dt: 0, velocity: 0, moving: false, motion: false, still: true, amount, perUnit: 0.03, zero: false, rungs, readout: { left: 0, right: w * 0.72, top: 0, bottom: 84 }, thickness: 0.03, words: stageWords, previous: null, sinceOpened: 0 });
    assert.ok(written.some(item => item.line.endsWith(id)), id);
  }
});

test('number explorer brings a landmark\'s name down clear of what is over it, and no further than its icon', () => {
  const column = { left: 200, right: 280 };
  const over = { left: 150, right: 260, top: 86, bottom: 110 };
  assert.equal(clearedLabelY(200, column, 14, 16, [over]), 200);
  assert.equal(clearedLabelY(120, column, 14, 16, [over]), 125);
  // One line under the chip would leave the icon above its name altogether.
  assert.equal(clearedLabelY(90, column, 14, 16, [over]), null);
  // What is under it cannot be got round by coming down.
  assert.equal(clearedLabelY(300, column, 14, 16, [{ ...over, top: 305, bottom: 340 }]), null);
  // Clear of it sideways, it stays where it is.
  assert.equal(clearedLabelY(90, { left: 270, right: 340 }, 14, 16, [over]), 90);
});

test('number explorer knows where a chip will go before painting it, and steps it off what is there', () => {
  const ctx = { save() {}, restore() {}, font: '', measureText: text => ({ width: [...text].length * 10 }) };
  const box = chipBox(ctx, 'abcd', 100, 50, { size: 10 });
  assert.deepEqual([box.left, box.right, box.top, box.bottom], [100, 153, 40, 60]);
  const taken = { left: 90, right: 200, top: 45, bottom: 70 };
  assert.equal(chipBox(ctx, 'abcd', 100, 50, { size: 10, clear: taken }).bottom, 42);
  assert.equal(chipBox(ctx, 'abcd', 100, 50, { size: 10, clear: taken, downward: true }).top, 73);
  // Taken in turn, so a step off the first can be a step off the second as well.
  const above = { left: 90, right: 200, top: 20, bottom: 44 };
  assert.equal(chipBox(ctx, 'abcd', 100, 50, { size: 10, clear: [taken, above] }).bottom, 17);
  assert.equal(chipBox(ctx, 'abcd', 100, 50, { size: 10, clear: [null, undefined] }).top, 40);
  assert.equal(meets({ left: 0, right: 10, top: 0, bottom: 10 }, { left: 10, right: 20, top: 0, bottom: 10 }), false);
  assert.equal(fittedSize(ctx, 'abcd', 12, 700, 100), 12);
  assert.equal(fittedSize(ctx, 'abcd', 12, 700, 20), 10);
});

test('number explorer turns the default billion grains into approximately 109 liters', () => {
  const result = sandModel(1000000000n);
  close(result.volumeM3, 0.109083078, 1e-7);
  close(result.liters, 109.083078, 1e-7);
  close(result.cubeSideM, 0.477807, 1e-5);
});
test('number explorer scales grain diameter as volume and cube edge as length', () => {
  const fine = sandModel(1000000000n, 0.25), medium = sandModel(1000000000n, 0.5), coarse = sandModel(1000000000n, 1);
  close(medium.volumeM3 / fine.volumeM3, 8);
  close(coarse.volumeM3 / medium.volumeM3, 8);
  close(medium.cubeSideM / fine.cubeSideM, 2);
  close(coarse.cubeSideM / medium.cubeSideM, 2);
});
test('number explorer keeps a thousandfold volume increase distinct from its height increase', () => {
  const small = sandModel(1000n), large = sandModel(1000000n);
  close(large.volumeM3 / small.volumeM3, 1000);
  close(large.cubeSideM / small.cubeSideM, 10);
});
test('number explorer includes the gaps between grains in bulk volume', () => {
  close(sandModel(1000000n, 0.5, 0.3).volumeM3 / sandModel(1000000n, 0.5, 0.6).volumeM3, 2);
});
test('number explorer turns the default billion drops into fifty thousand liters', () => {
  const result = waterModel(1000000000n);
  close(result.liters, 50000);
  close(result.volumeM3, 50);
  close(waterModel(1000000000n, 0.25).liters, 250000);
  close(compareVolume(result.volumeM3, 'pool').ratio, 0.02);
  close(compareVolume(result.volumeM3, 'bath').ratio, 250);
});
test('number explorer stacks a billion default books about 30,000 km high', () => {
  const { heightM, books, words } = bookModel(1000000000n);
  close(heightM, 30000000);
  assert.equal(books, 1000000000);
  assert.equal(words, 75000000000000);
  close(bookModel(1000000000n, { thicknessM: 0.05 }).heightM, 50000000);
});
test('number explorer distinguishes reference books from token counts', () => {
  assert.deepEqual(textModel(100000n), { words: 75000, books: 1 });
  assert.deepEqual(textModel(100000n, 150000), { words: 75000, books: 0.5 });
});
test('number explorer turns words and tokens into shares of a book, not books of their own', () => {
  const tokens = bookModel(1000000n, { unit: 'token' });
  assert.equal(tokens.books, 10);
  close(tokens.heightM, 0.3);
  assert.equal(bookModel(75000n, { unit: 'word' }).books, 1);
  assert.equal(booksPerUnit('book'), 1);
  close(booksPerUnit('token', 150000), 0.75 / 150000);
  assert.equal(textModel(1000000n).books, tokens.books);
});
test('number explorer counts continuously at the selected rate with a defined year length', () => {
  assert.equal(countingModel(60n).seconds, 60);
  assert.equal(countingModel(60n, 2).seconds, 30);
  close(countingModel(31557600n).years, 1);
});
test('number explorer gives empty counts zero amounts without an infinite inverse', () => {
  assert.deepEqual(sandModel(0n), { volumeM3: 0, liters: 0, cubeSideM: 0 });
  assert.deepEqual(waterModel(0n), { volumeM3: 0, liters: 0, cubeSideM: 0 });
  assert.deepEqual(bookModel(0n), { books: 0, words: 0, heightM: 0 });
  assert.deepEqual(textModel(0n), { words: 0, books: 0 });
  assert.deepEqual(countingModel(0n), { seconds: 0, years: 0 });
  assert.deepEqual(compareVolume(0, 'bucket'), { ratio: 0, inverse: null });
});
test('number explorer compares like volumes', () => {
  const buckets = compareVolume(0.2, 'bucket');
  close(buckets.ratio, 20);
  close(buckets.inverse, 0.05);
  for (const reference of VOLUME_LADDER) close(compareVolume(reference.size, reference.id).ratio, 1);
});
test('number explorer defines the mountain by volume rather than by height alone', () => {
  close(VOLUME_REFERENCES.find(reference => reference.id === 'mountain').size, 1047197551.1965976);
  close(compareVolume(sandModel(9600000000000000000n).volumeM3, 'mountain').ratio, 1);
});
test('number explorer reverses references within the rounding precision of one grain', () => {
  for (const diameterMm of [0.25, 0.5, 1]) {
    const oneGrain = sandModel(1n, diameterMm).volumeM3;
    for (const reference of VOLUME_REFERENCES) {
      const count = countForVolume(reference.id, diameterMm);
      assert.equal(typeof count, 'bigint');
      assert.ok(count > 0n && count <= MAX_COUNT);
      const rebuilt = sandModel(count, diameterMm).volumeM3;
      assert.ok(Math.abs(rebuilt - reference.size) <= oneGrain / 2 + reference.size * 1e-14);
    }
  }
});
test('number explorer stays finite across all presets at its maximum count', () => {
  for (const diameterMm of [0.25, 0.5, 1]) for (const value of Object.values(sandModel(MAX_COUNT, diameterMm))) assert.ok(Number.isFinite(value) && value > 0);
  for (const dropMl of [0.05, 0.25]) for (const value of Object.values(waterModel(MAX_COUNT, dropMl))) assert.ok(Number.isFinite(value) && value > 0);
  for (const result of [textModel(MAX_COUNT), countingModel(MAX_COUNT), bookModel(MAX_COUNT)]) for (const value of Object.values(result)) assert.ok(Number.isFinite(value) && value > 0);
});
test('number explorer rejects invalid model inputs before producing misleading amounts', () => {
  for (const count of [-1n, MAX_COUNT + 1n, 1, NaN]) {
    assert.throws(() => sandModel(count), RangeError);
    assert.throws(() => waterModel(count), RangeError);
    assert.throws(() => bookModel(count), RangeError);
    assert.throws(() => textModel(count), RangeError);
    assert.throws(() => countingModel(count), RangeError);
  }
  for (const value of [0, -1, NaN, Infinity]) {
    assert.throws(() => sandModel(1n, value), RangeError);
    assert.throws(() => sandModel(1n, 0.5, value), RangeError);
    assert.throws(() => waterModel(1n, value), RangeError);
    assert.throws(() => bookModel(1n, { thicknessM: value }), RangeError);
    assert.throws(() => bookModel(1n, { wordsPerBook: value }), RangeError);
    assert.throws(() => heightLadder(value), RangeError);
    assert.throws(() => textModel(1n, value), RangeError);
    assert.throws(() => countingModel(1n, value), RangeError);
  }
  assert.throws(() => sandModel(1n, 0.5, 1.1), RangeError);
  for (const value of [-1, NaN, Infinity]) assert.throws(() => compareVolume(value, 'bucket'), RangeError);
  assert.throws(() => compareVolume(1, 'unknown'), RangeError);
  assert.throws(() => countForVolume('unknown'), RangeError);
  assert.throws(() => sizePerUnit('unknown'), RangeError);
  assert.throws(() => ladderFor('unknown'), RangeError);
});

test('number explorer keeps every ladder running smallest to largest', () => {
  const ladders = { STAR_REFERENCES, TIME_REFERENCES, VOLUME_LADDER, thin: heightLadder(0.02), default: heightLadder(0.03), thick: heightLadder(0.05) };
  for (const [name, rungs] of Object.entries(ladders)) {
    for (let i = 1; i < rungs.length; i++) assert.ok(rungs[i - 1].size < rungs[i].size, `${name}: ${rungs[i - 1].id} before ${rungs[i].id}`);
    assert.equal(new Set(rungs.map(rung => rung.id)).size, rungs.length, name);
  }
  assert.deepEqual([...VOLUME_LADDER], [...VOLUME_REFERENCES, ...PLANET_REFERENCES]);
});
test('number explorer moves book-count landmarks with thickness and leaves heights alone', () => {
  const size = (thickness, id) => heightLadder(thickness).find(rung => rung.id === id).size;
  close(size(0.03, 'congress'), 25.77e6 * 0.03);
  close(size(0.05, 'congress') / size(0.03, 'congress'), 5 / 3);
  assert.equal(size(0.03, 'moon'), size(0.05, 'moon'));
});
test('number explorer places a value between the landmarks either side of it', () => {
  const rungs = [{ id: 'a', size: 10 }, { id: 'b', size: 100 }];
  assert.deepEqual(placeOnLadder(1, rungs), { index: -1, below: null, above: rungs[0], times: null, share: 0.1 });
  assert.deepEqual(placeOnLadder(50, rungs), { index: 0, below: rungs[0], above: rungs[1], times: 5, share: 0.5 });
  assert.deepEqual(placeOnLadder(1000, rungs), { index: 1, below: rungs[1], above: null, times: 10, share: null });
  // A count worked back from a landmark has reached it, not stopped just short.
  assert.equal(placeOnLadder(100 * (1 - 1e-14), rungs).below.id, 'b');
});
test('number explorer places the default numbers where the page says they are', () => {
  const books = placeOnLadder(Number(bookModel(1000000000n).heightM), heightLadder());
  assert.equal(books.above.id, 'around');
  close(placeOnLadder(30000000, heightLadder()).share, 30000000 / 40075000);
  close(placeOnLadder(30000000, heightLadder().filter(rung => rung.id === 'moon')).share, 30000000 / 3.844e8);
  assert.equal(placeOnLadder(1e9, STAR_REFERENCES).above.id, 'milkyway');
  close(placeOnLadder(1e9, STAR_REFERENCES).share, 0.01);
  assert.equal(placeOnLadder(1e9, TIME_REFERENCES).below.id, 'decade');
});
test('number explorer measures one counted thing in each world', () => {
  const settings = { unit: 'book', thicknessM: 0.03, wordsPerBook: 75000, dropMl: 0.05, diameterMm: 0.5, rate: 10 };
  close(sizePerUnit('books', settings), bookModel(1n, settings).heightM);
  close(sizePerUnit('books', { ...settings, unit: 'token' }), bookModel(1n, { ...settings, unit: 'token' }).heightM);
  close(sizePerUnit('water', settings), waterModel(1n, 0.05).volumeM3);
  close(sizePerUnit('sand', settings), sandModel(1n, 0.5).volumeM3);
  assert.equal(sizePerUnit('stars', settings), 1);
  assert.equal(sizePerUnit('time', settings), 0.1);
});
test('number explorer works back to a count that reaches a landmark', () => {
  const perUnit = sizePerUnit('books');
  const reach = countForSize(3.844e8, perUnit);
  assert.ok(Number(reach) * perUnit >= 3.844e8);
  assert.equal(reach, 12900000000n);
  assert.equal(countForSize(1, 1), 1n);
  assert.equal(countForSize(0.001, 1), 1n);
  assert.equal(countForSize(1e40, 1), null);
  assert.equal(countForSize(Infinity, 1), null);
});
test('number explorer rounds a worked-back count up, within the largest count', () => {
  assert.equal(roundUpCount(12813333334n), 12900000000n);
  assert.equal(roundUpCount(12800000000n), 12800000000n);
  assert.equal(roundUpCount(999n), 999n);
  assert.equal(roundUpCount(1001n), 1010n);
  assert.equal(roundUpCount(9991n), 10000n);
  assert.equal(roundUpCount(MAX_COUNT - 1n), MAX_COUNT);
});
test('number explorer reads the power of ten of a count of any length', () => {
  assert.equal(log10Count(0n), 0);
  assert.equal(log10Count(1n), 0);
  close(log10Count(1000n), 3);
  close(log10Count(MAX_COUNT), 30);
  close(log10Count(3n * 10n ** 25n), 25 + Math.log10(3));
  close(log10Count(123456789012345678901234n), Math.log10(1.23456789012345) + 23, 1e-9);
});
test('number explorer lands the dial on readable counts within its range', () => {
  assert.equal(dialCount(0), 1n);
  assert.equal(dialCount(-1), 1n);
  assert.equal(dialCount(9), 1000000000n);
  assert.equal(dialCount(9.01), 1000000000n);
  assert.equal(dialCount(0.5), 3n);
  assert.equal(dialCount(3.3), 2000n);
  assert.equal(dialCount(30), MAX_COUNT);
  assert.equal(dialCount(31), MAX_COUNT);
  for (let position = 0; position <= 30; position += 0.137) {
    const count = dialCount(position);
    assert.ok(count >= 1n && count <= MAX_COUNT, String(position));
    assert.ok(count.toString().replace(/0+$/, '').length <= 2, `${position}: ${count}`);
    // Below ten there are only whole numbers to land on, and they are far apart.
    assert.ok(Math.abs(log10Count(count) - position) < (position < 1 ? 0.18 : 0.06), `${position}: ${count}`);
  }
});
test('number explorer writes back only what its own parser reads', () => {
  const counts = [0n, 1n, 999n, 1000n, 1234567n, 999999999999999n, 10n ** 15n, 12n * 10n ** 17n, 1234n * 10n ** 20n, 12345n * 10n ** 20n, 9007199254740993n, MAX_COUNT];
  for (const count of counts) assert.deepEqual(parseCount(countText(count)), { ok: true, count }, count.toString());
  assert.equal(countText(1000000000n), '1,000,000,000');
  assert.equal(countText(MAX_COUNT), '1 nonillion');
  assert.equal(countText(12n * 10n ** 17n), '1.2 quintillion');
});

test('number explorer marks a world only on the buttons that choose one', () => {
  // main.js finds a tab by this attribute, so anything else carrying it, ahead of the
  // tabs in the page, would take the pressed state that belongs to the tab.
  const body = readFileSync(new URL('../../tools/number-explorer/body.html', import.meta.url), 'utf8');
  const marked = [...body.matchAll(/<(\w+)[^>]*\bdata-world="(\w+)"/g)];
  assert.deepEqual(marked.map(match => match[1]), ['button', 'button', 'button', 'button', 'button']);
  assert.deepEqual(marked.map(match => match[2]).sort(), ['books', 'sand', 'stars', 'time', 'water']);
});
test('number explorer has a container shape for every volume on its ladder', () => {
  for (const rung of VOLUME_LADDER) assert.ok(CONTAINERS[rung.id], rung.id);
});
test('number explorer fills a container by area rather than by height', () => {
  const square = [[0, 0], [1, 0], [1, 1], [0, 1]];
  close(levelForShare(square, 0.25), 0.75, 1e-3);
  // A cone is half full by area well below half its height.
  const cone = [[0.5, 0], [1, 1], [0, 1]];
  close(levelForShare(cone, 0.5), Math.SQRT1_2, 1e-2);
  assert.equal(levelForShare(cone, 0), 1);
  assert.equal(levelForShare(cone, 1), 0);
});
test('number explorer raises the level steadily in every container', () => {
  for (const [id, { inside }] of Object.entries(CONTAINERS)) {
    let last = Infinity;
    for (let share = 0; share <= 1.0001; share += 0.05) {
      const level = levelForShare(inside, share);
      assert.ok(level < last + 1e-9, `${id} at ${share}`);
      assert.ok(level >= -1e-9 && level <= 1 + 1e-9, `${id} at ${share}`);
      last = level;
    }
  }
});
test('number explorer pours into the smallest container not yet overflowing', () => {
  const rungs = [{ size: 1 }, { size: 10 }];
  assert.equal(containerIndex(0, rungs), 0);
  assert.equal(containerIndex(1, rungs), 0);
  assert.equal(containerIndex(1.5, rungs), 1);
  assert.equal(containerIndex(100, rungs), 1);
});
test('number explorer says how many stars one dot stands for at every scale', () => {
  assert.deepEqual(starLevel(1), { id: 'sky', perDot: 1 });
  assert.deepEqual(starLevel(9100), { id: 'sky', perDot: 1 });
  assert.equal(starLevel(9101).id, 'ball');
  assert.equal(starLevel(1e7).id, 'ball');
  assert.equal(starLevel(1e11).id, 'spiral');
  assert.equal(starLevel(1e15).id, 'galaxies');
  assert.equal(starLevel(1e23).id, 'web');
  assert.equal(starLevel(1e24).id, 'multi');
  assert.equal(circleGroup(50), 1);
  assert.equal(circleGroup(1000), 10);
  assert.equal(circleGroup(1e7), 1e5);
  for (const universes of [101, 5000, 1e7]) assert.ok(universes / circleGroup(universes) <= 100);
});
