import { ltr, phrase } from './shared/phrases.js';
import { NEAR_POINT_MM } from './optics.js';
import { MOON, SUBJECTS, arcsecPerKm } from './subjects.js';

// Numbers into words. Intl writes the figures and every unit it has a name for, so a
// German page gets its comma and a Japanese one its own word for kilometres without
// either being written here. What Intl has no unit for, micrometres and arcseconds
// and diopters among them, is a phrase in the markup with a blank for the figure.

const locale = document.documentElement.lang || undefined;
const formats = new Map();
function format(options) {
  const key = JSON.stringify(options);
  if (!formats.has(key)) formats.set(key, new Intl.NumberFormat(locale, options));
  return formats.get(key);
}

export const figure = (value, digits = 3) => format({ maximumSignificantDigits: digits }).format(value);
const measure = (value, unit, digits = 3, display = 'short') => format({ style: 'unit', unit, unitDisplay: display, maximumSignificantDigits: digits }).format(value);

// A magnification, with decimals only where they mean something: a lamp magnifier is
// sold as 1.75 times and 7.5 is not 8, but 137.4 is 137. Never grouped, because no box
// and no eyepiece says "1,000×", and the page should not print a number two ways.
export function power(value) {
  return phrase('unit.times', { number: format({ maximumFractionDigits: value < 10 ? 2 : value < 20 ? 1 : 0, useGrouping: false }).format(value) });
}

// A magnification that is a limit and not a setting: where a zone begins, or what a
// telescope tops out at. Those are rules of thumb, and "8.57×" would claim a
// precision that "about 8.6×" does not.
export function roughly(value) {
  return phrase('unit.times', { number: format({ maximumFractionDigits: value < 10 ? 1 : 0, useGrouping: false }).format(value) });
}

export const millimetres = (value, digits = 3) => measure(value, 'millimeter', digits);
export const degrees = (value, digits = 2) => measure(value, 'degree', digits, 'narrow');
export const percent = share => format({ style: 'percent', maximumSignificantDigits: 2 }).format(share);
export const arcseconds = value => phrase('unit.arcsec', { number: figure(value, 3) });
export const microns = value => phrase('unit.um', { number: figure(value, 2) });
export const diopters = value => phrase('unit.diopter', { number: figure(value) });

// A width somebody could hold: micrometres under a tenth of a millimetre, then
// millimetres, centimetres and metres.
export function width(mm) {
  if (mm < 0.1) return microns(mm * 1000);
  if (mm < 10) return millimetres(mm, 2);
  if (mm < 1000) return measure(mm / 10, 'centimeter', 2);
  return measure(mm / 1000, 'meter', 2);
}

// What Intl calls a kilometre in this language, on its own: "km" in most, and 公里 in
// Chinese, which is what it writes after every shorter distance on the page.
const kilometre = format({ style: 'unit', unit: 'kilometer', unitDisplay: 'short' }).formatToParts(2)
  .filter(part => part.type === 'unit').map(part => part.value).join('');

// A distance, to four figures, so the Moon is 384,400 km and not 384,000. Past a
// million kilometres the figure is written in words, as "629 million km". Intl would
// write the unit after those words itself, and gets it wrong wherever a language puts
// a word between them, "629 millones de km". So the words and the unit are handed to
// a phrase separately, and each language joins them its own way.
export function distance(metres, digits = 4) {
  if (metres >= 1e9) return phrase('unit.far', { number: format({ notation: 'compact', compactDisplay: 'long', maximumSignificantDigits: 3 }).format(metres / 1000), unit: kilometre });
  if (metres >= 1000) return measure(metres / 1000, 'kilometer', digits);
  if (metres >= 1) return measure(metres, 'meter');
  return width(metres * 1000);
}

// Sentences side by side. Chinese and Japanese end theirs with a mark that already
// holds its own space, so one more would be a hole in the line.
export function joined(sentences) {
  return sentences.filter(Boolean).join(' ').replace(/([。！？]) /g, '$1');
}

// Two numbers with a sign between them say nothing about which way they read, so
// the pair is told.
export const pair = (magnification, objective) => ltr(`${figure(magnification)}×${figure(objective)}`);
// An objective as it is engraved, which is the same in every language: 40×/0.65, with
// a point and two places whatever the page's own numbers look like.
export const objectiveName = (magnification, aperture) => ltr(`${Number(magnification.toPrecision(3))}×/${aperture.toFixed(2)}`);

const trueField = numbers => numbers.shownField / numbers.magnification;
const moonsWide = numbers => figure(trueField(numbers) * 3600 / SUBJECTS.moon.piece, 2);

// How the magnification was arrived at, as the sum itself.
export function how(world, values, numbers) {
  if (world === 'telescope') {
    return phrase(values.barlow > 1 ? 'how.telescope.barlow' : 'how.telescope', {
      focal: millimetres(values.focal, 4),
      barlow: figure(values.barlow),
      eyepiece: millimetres(values.eyepiece)
    });
  }
  if (world === 'binoculars') return phrase('how.binoculars');
  if (world === 'microscope') return phrase('how.microscope', { objective: figure(values.objective), eyepiece: figure(values.eyepiece) });
  return phrase(values.close ? 'how.magnifier.close' : 'how.magnifier', { focal: millimetres(numbers.focal) });
}

const LIGHTS = ['full', 'less', 'dim'];
const HANDS = ['steady', 'care', 'tripod'];
const GRADES = ['sharp', 'full', 'empty'];

// Which zone of the dial a setting is in, and what that means in a sentence or two.
export function verdict(world, numbers) {
  if (world === 'binoculars') {
    // Two things limit binoculars and they are independent, so both are named, and
    // the colour is that of whichever is worse: a pair that is steady and dim is
    // not a green one.
    const blanks = { pupil: millimetres(numbers.exitPupil, 3), share: percent(numbers.brightness) };
    const worse = Math.max(LIGHTS.indexOf(numbers.light), HANDS.indexOf(numbers.hand));
    return {
      zone: numbers.hand,
      tone: GRADES[worse],
      name: `${phrase(`zone.light.${numbers.light}`)} · ${phrase(`zone.${numbers.hand}`)}`,
      text: joined([phrase(`verdict.binoculars.light.${numbers.light}`, blanks), phrase(`verdict.binoculars.hand.${numbers.hand}`)])
    };
  }
  if (world === 'magnifier') {
    return {
      zone: numbers.band,
      name: phrase(`zone.${numbers.band}`),
      text: phrase(`verdict.magnifier.${numbers.band}`, { focal: millimetres(numbers.focal), field: millimetres(numbers.fieldMm) })
    };
  }
  const blanks = {
    pupil: millimetres(numbers.exitPupil, 2),
    sharp: roughly(numbers.sharpFrom),
    full: roughly(numbers.fullFrom),
    high: roughly(numbers.highest)
  };
  if (world === 'telescope') blanks.low = roughly(numbers.lowest);
  return {
    zone: numbers.regime,
    name: phrase(`zone.${numbers.regime}`),
    text: joined([phrase(`verdict.${world}.${numbers.regime}`, blanks), numbers.seeing ? phrase('verdict.seeing') : ''])
  };
}

// What the instrument does to the chosen subject, as one sentence.
export function story(id, numbers, sight) {
  const subject = SUBJECTS[id];
  const name = phrase(`subject.${id}`);
  if (subject.points) return phrase('story.span', { name, width: degrees(subject.piece / 3600) });
  if (subject.distance) {
    return phrase(sight.detailBound ? 'story.far.bound' : 'story.far', {
      name,
      far: distance(subject.distance),
      near: distance(sight.asIfFrom),
      detail: distance(sight.detailFrom)
    });
  }
  if (subject.tall) return phrase('story.tall', { name, real: width(subject.piece), lookalike: width(sight.lookalike) });
  return phrase(sight.detailBound ? 'story.near.bound' : 'story.near', {
    name,
    real: width(subject.piece),
    lookalike: width(sight.lookalike),
    power: roughly(numbers.detailPower)
  });
}

// How much of the view the subject takes, and how wide the view is in its own terms.
export function fit(id, numbers, sight) {
  const subject = SUBJECTS[id];
  const lines = [];
  // A cluster of stars has no edge to measure, and a line of print is measured by
  // its height while it runs right across the view, so neither is given a share.
  if (!subject.points && !subject.tall) {
    if (sight.share > 1) lines.push(phrase('fit.over', { times: figure(sight.share, 2) }));
    else if (sight.share < 0.01) lines.push(phrase('fit.speck'));
    else lines.push(phrase('fit.share', { share: percent(sight.share) }));
  }
  const field = trueField(numbers);
  if (subject.kind === 'sky') lines.push(phrase('fit.field.sky', { field: degrees(field), moons: moonsWide(numbers) }));
  else if (subject.kind === 'land') lines.push(phrase('fit.field.land', { width: distance(subject.range * field * Math.PI / 180) }));
  else lines.push(phrase('fit.field.near', { width: width(NEAR_POINT_MM * field * Math.PI / 180) }));
  return joined(lines);
}

// The figures of the decoded list, each under the id of the place it goes.
export function stats(world, values, numbers) {
  if (world === 'telescope') {
    return {
      'tel-s-power': power(numbers.magnification),
      'tel-s-field': phrase('stat.field.sky', { field: degrees(trueField(numbers)), moons: moonsWide(numbers) }),
      'tel-s-pupil': millimetres(numbers.exitPupil, 2),
      'tel-s-detail': phrase('stat.detail.sky', { detail: arcseconds(numbers.limitArcsec), size: distance(numbers.limitArcsec / arcsecPerKm(MOON) * 1000, 2) }),
      'tel-s-light': phrase('stat.light', { number: figure(numbers.lightGrasp, 2) }),
      'tel-s-range': phrase('stat.range', { low: roughly(numbers.lowest), high: roughly(numbers.highest) }),
      'tel-s-ratio': ltr(phrase('unit.ratio', { number: figure(numbers.focalRatio, 2) }))
    };
  }
  if (world === 'binoculars') {
    return {
      'bin-s-power': power(numbers.magnification),
      'bin-s-objective': millimetres(values.objective),
      'bin-s-pupil': millimetres(numbers.exitPupil, 3),
      'bin-s-light': percent(numbers.brightness),
      'bin-s-field': phrase('stat.field.land', { field: degrees(numbers.trueField, 3), metres: measure(numbers.metres, 'meter'), feet: measure(numbers.feet, 'foot') }),
      'bin-s-twilight': figure(numbers.twilight),
      'bin-s-hand': phrase(`zone.${numbers.hand}`)
    };
  }
  if (world === 'microscope') {
    return {
      'mic-s-power': power(numbers.magnification),
      'mic-s-field': width(numbers.fieldMm),
      'mic-s-detail': microns(numbers.limitUm),
      'mic-s-range': phrase('stat.range', { low: roughly(numbers.sharpFrom), high: roughly(numbers.highest) }),
      'mic-s-pupil': millimetres(numbers.exitPupil, 2)
    };
  }
  return {
    'mag-s-power': power(numbers.magnification),
    'mag-s-focal': phrase('stat.focal', { focal: millimetres(numbers.focal) }),
    'mag-s-diopters': diopters(numbers.dioptres),
    'mag-s-field': millimetres(numbers.fieldMm),
    'mag-s-detail': microns(numbers.detailUm)
  };
}

// What the page understood of a box, written under it, or what it took in its place.
export function readings(world, values, numbers) {
  if (world === 'binoculars') {
    const blanks = { field: degrees(numbers.trueField, 3), metres: measure(numbers.metres, 'meter'), feet: measure(numbers.feet, 'foot') };
    return { 'bin-field-read': phrase(values.field === null ? 'read.field.typical' : 'read.field', blanks) };
  }
  if (world === 'microscope') {
    return { 'mic-fn-read': values.fieldNumber === null ? phrase('read.number.typical', { number: millimetres(numbers.fieldNumber), eyepiece: power(values.eyepiece) }) : '' };
  }
  if (world === 'magnifier') {
    return {
      'mag-read': phrase('read.magnifier', { power: power(numbers.magnification), focal: millimetres(numbers.focal), diopters: diopters(numbers.dioptres) }),
      'mag-lens-read': values.lens === null ? phrase('read.lens.typical', { width: millimetres(numbers.lens) }) : ''
    };
  }
  return {};
}

// One row of "the same instrument at other powers": what it is called, the facts
// under the name, and the whole thing as a sentence for somebody not looking at it.
export function row(world, label, numbers, spoken) {
  if (world === 'telescope') {
    const blanks = { eyepiece: label, power: power(numbers.magnification), field: degrees(trueField(numbers)), pupil: millimetres(numbers.exitPupil, 2), zone: spoken.name };
    return { facts: [blanks.power, blanks.field, blanks.pupil], aloud: phrase('row.telescope', blanks) };
  }
  if (world === 'binoculars') {
    const blanks = { pair: label, pupil: millimetres(numbers.exitPupil, 3), share: percent(numbers.brightness), zone: spoken.name };
    return { facts: [blanks.pupil, blanks.share], aloud: phrase('row.binoculars', blanks) };
  }
  if (world === 'microscope') {
    const blanks = { objective: label, power: power(numbers.magnification), field: width(numbers.fieldMm), detail: microns(numbers.limitUm), zone: spoken.name };
    return { facts: [blanks.power, blanks.field, blanks.detail], aloud: phrase('row.microscope', blanks) };
  }
  const blanks = { power: label, focal: millimetres(numbers.focal), field: millimetres(numbers.fieldMm), zone: spoken.name };
  return { facts: [blanks.focal, blanks.field], aloud: phrase('row.magnifier', blanks) };
}

// A grain of salt is on a glass slide under the microscope and on paper under the
// magnifier, so what a caption says of the backdrop goes by the instrument.
export function caption(world, id) {
  const kind = SUBJECTS[id].kind;
  const key = world === 'magnifier' ? 'near' : kind === 'sky' ? id : kind === 'land' ? 'bird' : kind;
  return joined([phrase(`caption.${key}`), phrase('caption.scale')]);
}

export function fault(name, low, high, missing) {
  return missing ? phrase('error.missing', { name }) : phrase('error.range', { name, low: figure(low, 4), high: figure(high, 4) });
}
