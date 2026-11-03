import { phrase } from './shared/phrases.js';
import { booksPerUnit, placeOnLadder } from './scale.js';

// Numbers into words. Intl does the units wherever it has them, so "kilometers" is
// already right in every language this page is built in, and the phrases only hold
// what Intl has no word for. Formatters are kept, because the ruler asks every frame.

const locale = document.documentElement.lang || undefined;
const LIGHT_YEAR_M = 9.4607e15;
const SECONDS_PER_YEAR = 31557600;
const SUPERSCRIPT = '⁰¹²³⁴⁵⁶⁷⁸⁹';

const formats = new Map();
function format(options) {
  const key = JSON.stringify(options);
  if (!formats.has(key)) formats.set(key, new Intl.NumberFormat(locale, options));
  return formats.get(key);
}
const significant = (digits = 3) => format({ maximumSignificantDigits: digits });
const compact = (digits = 3) => format({ notation: 'compact', compactDisplay: 'long', maximumSignificantDigits: digits });

// Which amounts take the singular is the language's to say: one in English, and anything
// under two in French, where it is 1,5 année-lumière.
const plurals = new Intl.PluralRules(locale);
const singular = (value, digits = 3) => plurals.select(Number(value.toPrecision(digits))) === 'one';

const phrases = new Map();
export function cached(key) {
  if (!phrases.has(key)) phrases.set(key, phrase(key));
  return phrases.get(key);
}

export function superscript(power) {
  return String(power).replace(/\d/g, digit => SUPERSCRIPT[Number(digit)]).replace('-', '⁻');
}

export function pretty(value, digits = 3) {
  if (value === 0) return significant(digits).format(0);
  if (value >= 1e15 || value < 1e-3) {
    let power = Math.floor(Math.log10(value));
    let mantissa = value / 10 ** power;
    if (Number(mantissa.toPrecision(digits)) >= 10) {
      mantissa /= 10;
      power += 1;
    }
    if (Number(mantissa.toPrecision(digits)) === 1) return `10${superscript(power)}`;
    return `${significant(digits).format(mantissa)} × 10${superscript(power)}`;
  }
  return value >= 1e6 ? compact(digits).format(value) : significant(digits).format(value);
}

export function exact(count) { return format({}).format(count); }

// The readback's three ways of saying the same count, skipping any that would only
// repeat the one before it.
export function readback(count) {
  const digits = count.toString();
  const parts = [exact(count)];
  if (digits.length >= 4 && digits.length <= 15) parts.push(compact().format(Number(count)));
  if (digits.length >= 4) {
    const power = digits.length - 1;
    const lead = /^10*$/.test(digits) ? `10${superscript(power)}` : pretty(Number(count));
    if (!parts.includes(lead)) parts.push(lead);
  }
  return parts.join(' · ');
}

export function percent(share) {
  if (share >= 1e-9) return format({ style: 'percent', maximumSignificantDigits: 2 }).format(share);
  return `${pretty(share * 100, 2)}%`;
}

export function times(value) { return phrase('ratio.times', { number: pretty(value) }); }

function unitName(unit, display, plural = 2) {
  const pieces = format({ style: 'unit', unit, unitDisplay: display }).formatToParts(plural);
  return pieces.filter(piece => piece.type === 'unit').map(piece => piece.value).join('');
}

function unitShort(value, unit, digits = 3) {
  if (value >= 1e15) return `${pretty(value, digits)} ${unitName(unit, 'short')}`;
  return format({ style: 'unit', unit, unitDisplay: 'short', maximumSignificantDigits: digits, ...(value >= 1e6 ? { notation: 'compact', compactDisplay: 'long' } : {}) }).format(value);
}

function unitLong(value, unit) {
  if (value >= 1e15) return { number: pretty(value), unit: unitName(unit, 'long') };
  const pieces = format({ style: 'unit', unit, unitDisplay: 'long', maximumSignificantDigits: 3, ...(value >= 1e6 ? { notation: 'compact', compactDisplay: 'long' } : {}) }).formatToParts(value);
  return {
    number: pieces.filter(piece => piece.type !== 'unit').map(piece => piece.value).join('').trim(),
    unit: pieces.filter(piece => piece.type === 'unit').map(piece => piece.value).join('')
  };
}

export function length(metres, digits = 3) {
  if (metres >= LIGHT_YEAR_M * 0.1) {
    const value = metres / LIGHT_YEAR_M;
    return `${pretty(value, digits)} ${cached(singular(value, digits) ? 'unit.lightyear' : 'unit.lightyears')}`;
  }
  if (metres >= 1000) return unitShort(metres / 1000, 'kilometer', digits);
  if (metres >= 1) return unitShort(metres, 'meter', digits);
  if (metres >= 0.01) return unitShort(metres * 100, 'centimeter', digits);
  return unitShort(metres * 1000, 'millimeter', digits);
}

function lengthWords(metres) {
  if (metres >= LIGHT_YEAR_M * 0.1) {
    const value = metres / LIGHT_YEAR_M;
    return { number: pretty(value), unit: cached(singular(value) ? 'unit.lightyear' : 'unit.lightyears') };
  }
  if (metres >= 1000) return unitLong(metres / 1000, 'kilometer');
  if (metres >= 1) return unitLong(metres, 'meter');
  if (metres >= 0.01) return unitLong(metres * 100, 'centimeter');
  return unitLong(metres * 1000, 'millimeter');
}

export function volume(cubicMetres, digits = 3) {
  if (cubicMetres >= 1e9) return `${pretty(cubicMetres / 1e9, digits)} km³`;
  if (cubicMetres >= 1000) return `${pretty(cubicMetres, digits)} m³`;
  if (cubicMetres >= 0.001) return unitShort(cubicMetres * 1000, 'liter', digits);
  return unitShort(cubicMetres * 1e6, 'milliliter', digits);
}

function volumeWords(cubicMetres) {
  if (cubicMetres >= 1e9) {
    const value = cubicMetres / 1e9;
    return { number: pretty(value), unit: cached(singular(value) ? 'unit.km3.single' : 'unit.km3') };
  }
  if (cubicMetres >= 1000) return { number: pretty(cubicMetres), unit: cached('unit.m3') };
  if (cubicMetres >= 0.001) return unitLong(cubicMetres * 1000, 'liter');
  return unitLong(cubicMetres * 1e6, 'milliliter');
}

export function duration(seconds, digits = 3) {
  if (seconds >= SECONDS_PER_YEAR) return unitShort(seconds / SECONDS_PER_YEAR, 'year', digits);
  if (seconds >= 86400) return unitShort(seconds / 86400, 'day', digits);
  if (seconds >= 3600) return unitShort(seconds / 3600, 'hour', digits);
  if (seconds >= 60) return unitShort(seconds / 60, 'minute', digits);
  return unitShort(seconds, 'second', digits);
}

function durationWords(seconds) {
  if (seconds >= SECONDS_PER_YEAR) return unitLong(seconds / SECONDS_PER_YEAR, 'year');
  if (seconds >= 86400) return unitLong(seconds / 86400, 'day');
  if (seconds >= 3600) return unitLong(seconds / 3600, 'hour');
  if (seconds >= 60) return unitLong(seconds / 60, 'minute');
  return unitLong(seconds, 'second');
}

export function durationLong(seconds) {
  const words = durationWords(seconds);
  return `${words.number} ${words.unit}`;
}

export function rungName(world, id) {
  return cached(`${world === 'water' || world === 'sand' ? 'volume' : world === 'books' ? 'height' : world}.${id}`);
}

// Sentences side by side. Chinese and Japanese end theirs with a mark that already holds
// its own space, so one more would be a hole in the line.
export function joined(sentences) {
  return sentences.filter(Boolean).join(' ').replace(/([。！？]) /g, '$1');
}

export function capital(line) {
  return line ? line[0].toLocaleUpperCase(locale) + line.slice(1) : line;
}

export function sizeOf(world, size) {
  if (world === 'books') return length(size, 4);
  if (world === 'water' || world === 'sand') return volume(size, 4);
  if (world === 'stars') return pretty(size, 4);
  return duration(size, 4);
}

// The sentence the ladder has to say about where a number stands. Near a landmark
// "1.01 times over" says less than "about level with it", so that gets its own words.
function standing(world, place) {
  const family = world === 'water' || world === 'sand' ? 'fill' : world;
  const lines = [];
  if (place.below) {
    const name = rungName(world, place.below.id);
    if (place.times < 1.05) lines.push(phrase(`near.${family}`, { name }));
    else lines.push(phrase(`past.${family}`, { name, times: pretty(place.times) }));
  }
  if (place.above) lines.push(phrase(`next.${family}`, { name: rungName(world, place.above.id), share: percent(place.share) }));
  return joined(lines);
}

function finishing(seconds) {
  if (seconds < 3600) return '';
  const years = seconds / SECONDS_PER_YEAR;
  if (years > 100000) return '';
  const end = new Date(Date.now() + seconds * 1000);
  if (years < 2) return phrase('finish.date', { date: new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(end) });
  return phrase('finish.year', { year: new Intl.DateTimeFormat(locale, { year: 'numeric' }).format(end) });
}

// Everything the answer block says about one world at one count.
export function describe(world, count, settings, perUnit, rungs) {
  const amount = Number(count) * perUnit;
  const said = pretty(Number(count));
  const single = count === 1n;
  const place = placeOnLadder(amount, rungs);
  if (count === 0n) return { kicker: cached('result.empty'), number: '0', unit: '', story: cached('zero.story'), tab: '—', place };
  let answer;
  let tab;
  switch (world) {
    case 'books': {
      const words = lengthWords(amount);
      const books = Number(count) * booksPerUnit(settings.unit, settings.wordsPerBook);
      const key = settings.unit === 'book' ? (single ? 'kicker.books.single' : 'kicker.books') : `kicker.${settings.unit}s`;
      answer = {
        kicker: phrase(key, { count: said, books: pretty(books), words: pretty(books * settings.wordsPerBook) }),
        number: words.number,
        unit: phrase('unit.tall', { unit: words.unit })
      };
      tab = length(amount);
      break;
    }
    case 'water':
    case 'sand': {
      const words = volumeWords(amount);
      answer = { kicker: phrase(single ? `kicker.${world}.single` : `kicker.${world}`, { count: said }), number: words.number, unit: words.unit };
      tab = volume(amount);
      break;
    }
    case 'stars': {
      const milkyWay = rungs.find(rung => rung.id === 'milkyway').size;
      const universe = rungs.find(rung => rung.id === 'universe').size;
      const kicker = phrase(single ? 'kicker.stars.single' : 'kicker.stars', { count: said });
      if (amount >= universe) {
        const many = amount / universe;
        answer = { kicker, number: pretty(many), unit: cached(singular(many) ? 'stars.universe.single' : 'stars.universes') };
      } else if (amount >= milkyWay) {
        const many = amount / milkyWay;
        answer = { kicker, number: pretty(many), unit: cached(singular(many) ? 'stars.milkyway.single' : 'stars.milkyways') };
      } else {
        answer = { kicker, number: percent(place.share), unit: phrase('stars.of', { name: rungName(world, place.above.id) }) };
      }
      tab = amount >= milkyWay ? `${pretty(amount / milkyWay)} ${cached(singular(amount / milkyWay) ? 'stars.milkyway.single' : 'stars.milkyways')}` : phrase('stars.tab', { share: percent(amount / milkyWay) });
      break;
    }
    default: {
      const words = durationWords(amount);
      answer = { kicker: phrase('kicker.time', { count: said }), number: words.number, unit: words.unit };
      tab = duration(amount);
    }
  }
  const finish = world === 'time' ? finishing(amount) : '';
  return { ...answer, story: joined([standing(world, place), finish]), tab, place };
}

export function hud(world, log, settings, perUnit) {
  const value = 10 ** log;
  const said = pretty(value < 1000 ? Math.round(value) : value);
  const one = Math.round(value) === 1;
  switch (world) {
    case 'books': {
      const key = settings.unit === 'book' ? (one ? 'hud.books.single' : 'hud.books') : `hud.${settings.unit}s`;
      return { big: phrase(key, { count: said }), small: length(value * perUnit) };
    }
    case 'water': return { big: phrase(one ? 'hud.water.single' : 'hud.water', { count: said }), small: volume(value * perUnit) };
    case 'sand': return { big: phrase(one ? 'hud.sand.single' : 'hud.sand', { count: said }), small: volume(value * perUnit) };
    case 'stars': return { big: phrase(one ? 'hud.stars.single' : 'hud.stars', { count: said }), small: '' };
    default: return { big: phrase('hud.time', { count: said }), small: '' };
  }
}

