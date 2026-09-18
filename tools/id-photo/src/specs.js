/**
 * The rulebook: what each country asks an ID photograph to be.
 *
 * Every number below is somebody's published requirement, transcribed from the
 * authority named in its own `source` field, and shown on the page beside the
 * photograph it is being applied to. That is the entire difference between this
 * tool and a crop box: "35 x 45 mm, head 29-34 mm" is not a preference, it is
 * what His Majesty's Passport Office measures with a ruler, and a photo that
 * misses it comes back.
 *
 * Three things are deliberate about the shape of this file.
 *
 * FIRST, THE PUBLISHED FIGURE IS WHAT IS WRITTEN DOWN. Head height and eye
 * position are used by the code as fractions of the frame, because that is what
 * a crop rectangle needs, but nobody publishes fractions - they publish
 * millimetres. So the table says `mmBand(29, 34, 45)` and the fraction is
 * derived. A reader checking this against gov.uk is comparing two numbers, not
 * doing arithmetic.
 *
 * SECOND, PRINT AND PORTAL ARE SEPARATE RULES AND OFTEN DISAGREE. A country
 * that wants 35 x 45 mm on paper wants a JPEG of a stated pixel size and a
 * stated file size in its web form, and the second is not the first at some
 * DPI. They are two exports here for that reason, and a specification may have
 * one, the other, or both.
 *
 * THIRD, A SPECIFICATION SAYS WHEN IT WAS READ. Governments change these, and
 * a tool that quietly applies a rule from three years ago is worse than one
 * that admits it is a transcription. Every entry carries the authority, the
 * document, and the date it was checked, and the page prints all three.
 *
 * Nothing here reaches the network. The rules are read off this file, which is
 * served from the same origin as the rest of the tool and cached with it.
 *
 * FOURTH, THE WORDS ARE KEYS AND THE CITATION IS NOT. `country`, `document`,
 * the upload's `label` and every note are this site's own writing about
 * somebody else's numbers, and this file is copied byte for byte into fifteen
 * languages - so they are phrase keys and main.js resolves them. A citation is
 * the other thing: an authority's name and a document's title are what a reader
 * searches for to check the transcription, and translating them is how a
 * citation stops being one. Those live in sources.js, keyed by the same ids and
 * kept in the same order, and are attached to this table at the bottom of this
 * file so that `spec.source` is still just a field. They are a separate file
 * because they are a separate kind of writing, and because a table of them
 * fifty entries long would otherwise be most of what a reader of this one saw.
 * The two rules that cite nothing - common practice, and the figures you typed
 * in yourself - keep their source here, as keys like the rest of the prose,
 * because there is no publication there to be faithful to.
 */

import { ENDONYMS, SOURCES } from './sources.js';

/* ------------------------------------------------------------ backgrounds */

/**
 * The background colours these rules ask for.
 *
 * `tolerance` is a distance in CIE Lab (see background.js), not in RGB: two
 * greys can be forty RGB units apart and indistinguishable, while forty units
 * of blue is a different colour entirely. The numbers are loose on purpose -
 * "plain light grey" is a description, not a hex code, and a photo booth's
 * grey is not a stationer's grey.
 */
const WHITE = { hex: '#ffffff', tolerance: 16 };
const GREY = { hex: '#dcdcdc', tolerance: 20 };
const BLUE = { hex: '#cfdcea', tolerance: 20 };
const CREAM = { hex: '#ebe4d7', tolerance: 22 };

export const BACKGROUNDS = {
  white: { id: 'white', hex: '#ffffff', tolerance: 14 },
  'off-white': { id: 'off-white', hex: '#f6f4f0', tolerance: 18 },
  'light-grey': { id: 'light-grey', hex: '#dcdcdc', tolerance: 20 },
  cream: { id: 'cream', hex: '#ebe4d7', tolerance: 22 },

  // A rule that names several colours. `hex` is still what the swatch shows and
  // what a transparent picture is flattened onto; `accepts` is what the reading
  // is measured against, nearest first. Averaging the three into one hex would
  // be a fourth colour nobody published, and it would fail all three.
  'white-or-grey': {
    id: 'white-or-grey', hex: '#eeeeee', tolerance: 20, accepts: [WHITE, GREY],
  },
  'white-grey-blue': {
    id: 'white-grey-blue', hex: '#e8ebef', tolerance: 22, accepts: [WHITE, GREY, BLUE],
  },
  'white-grey-cream': {
    id: 'white-grey-cream', hex: '#eeece8', tolerance: 22, accepts: [WHITE, GREY, CREAM],
  },

  // Light, and specifically not white. One hex and one tolerance cannot say
  // that: white sits nearer to light grey than the tolerance a description like
  // "light grey" has to carry, so a rule that refuses white refuses it by name.
  'grey-or-blue-not-white': {
    id: 'grey-or-blue-not-white',
    hex: '#dfe3e8',
    tolerance: 22,
    accepts: [GREY, BLUE],
    forbidden: [{ hex: '#ffffff', tolerance: 11, key: 'bg.forbid.white' }],
  },
};

/* -------------------------------------------------------------- geometries */

/**
 * A band published in millimetres, carried as both.
 *
 * The fraction is what the crop arithmetic uses; the millimetres are what the
 * page shows and what a reader checks against the source. Deriving one from the
 * other here is the only place the two can be kept from disagreeing.
 *
 * @param {number} minMm
 * @param {number} maxMm
 * @param {number} frameMm  the height of the finished photograph
 */
const mmBand = (minMm, maxMm, frameMm, advisory = false) => ({
  min: minMm / frameMm,
  max: maxMm / frameMm,
  minMm,
  maxMm,
  ...(advisory ? { advisory } : {}),
});

/** A band that was published as a fraction, or that nobody published at all. */
const band = (min, max, advisory = false) => ({ min, max, advisory });

/**
 * ICAO Doc 9303's own portrait geometry, as fractions of the image height.
 *
 * Part 3 of the specification asks that the head, measured from the crown to
 * the bottom of the chin, occupy 70 to 80 per cent of the image, and that the
 * eye line fall between 50 and 60 per cent of the way up from the bottom edge.
 * Every ICAO travel document in the world is built on those two numbers, which
 * is why the countries below differ from each other by so little.
 */
export const ICAO_HEAD = band(0.70, 0.80);
export const ICAO_EYE = band(0.50, 0.60);

/* ---------------------------------------------------------------- the list */

/**
 * @typedef {object} Spec
 * @property {string} id
 * @property {string} country
 * @property {string} document      what this specification is for
 * @property {'portrait'|'signature'} kind
 * @property {{widthMm: number, heightMm: number, dpi: number}|null} print
 *   the size on paper and the resolution to write it at. Null where the rule
 *   is a web form's rule and there is no print size to speak of.
 * @property {{min: number, max: number, minMm?: number, maxMm?: number, advisory?: boolean}} head
 *   chin to crown, as a fraction of the frame's height
 * @property {{min: number, max: number, minMm?: number, maxMm?: number, advisory?: boolean}} eye
 *   the pupil line, as a fraction of the frame's height measured UP from the
 *   bottom edge. Published that way by every authority here, so kept that way.
 * @property {string} background    a key of BACKGROUNDS
 * @property {Digital|null} digital the web form's rule, where there is one
 * @property {string[]} notes       shown under the specification, verbatim
 * @property {string|null} native   the document's own name for itself, where
 *   that is a different word from the one this site prints. From sources.js.
 * @property {{authority: string, document: string, checked: string}} source
 *   from sources.js, except on the two rules that cite nothing
 *
 * @typedef {object} Digital
 * @property {string} label
 * @property {{exact?: number, min?: number, max?: number}} width   pixels
 * @property {{exact?: number, min?: number, max?: number}} height  pixels
 * @property {{min?: number, max?: number}} bytes
 * @property {string} format        a MIME type
 */

/**
 * The rules themselves. Not the export: see SPECS at the foot of the file.
 *
 * @type {Omit<Spec, 'native'>[]}
 */
const RULES = [
  {
    id: 'icao',
    country: 'country.icao',
    document: 'spec.icao.doc',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: ICAO_HEAD,
    eye: ICAO_EYE,
    background: 'light-grey',
    digital: {
      label: 'spec.icao.upload',
      width: { min: 413 },
      height: { min: 531 },
      bytes: {},
      format: 'image/jpeg',
    },
    notes: ['spec.icao.note1', 'spec.icao.note2'],
  },

  {
    id: 'us-passport',
    country: 'country.us',
    document: 'spec.us-passport.doc',
    kind: 'portrait',
    print: { widthMm: 51, heightMm: 51, dpi: 300 },
    head: mmBand(25, 35, 51),
    // Published until 2026 and not published now - see note3. Kept, because a
    // band somebody's last photograph was accepted against is worth more than
    // no band at all, and marked so that missing it is never painted red.
    eye: mmBand(28, 35, 51, true),
    background: 'off-white',
    digital: {
      label: 'spec.us-passport.upload',
      width: { min: 600 },
      height: { min: 600 },
      bytes: { min: 54 * 1024, max: 10 * 1024 * 1024 },
      format: 'image/jpeg',
    },
    notes: [
      'spec.us-passport.note1',
      'spec.us-passport.note2',
      'spec.us-passport.note3',
    ],
  },

  {
    id: 'us-dv',
    country: 'country.us',
    document: 'spec.us-dv.doc',
    kind: 'portrait',
    print: { widthMm: 51, heightMm: 51, dpi: 300 },
    head: mmBand(25, 35, 51),
    eye: mmBand(28, 35, 51),
    background: 'off-white',
    digital: {
      label: 'spec.us-dv.upload',
      width: { exact: 600 },
      height: { exact: 600 },
      bytes: { max: 240 * 1024 },
      format: 'image/jpeg',
    },
    notes: ['spec.us-dv.note1', 'spec.us-dv.note2'],
  },

  {
    id: 'uk-passport',
    country: 'country.uk',
    document: 'spec.uk-passport.doc',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: mmBand(29, 34, 45),
    eye: ICAO_EYE,
    background: 'cream',
    digital: {
      label: 'spec.uk-passport.upload',
      width: { min: 600 },
      height: { min: 750 },
      bytes: { min: 50 * 1024, max: 10 * 1024 * 1024 },
      format: 'image/jpeg',
    },
    notes: ['spec.uk-passport.note1', 'spec.uk-passport.note2'],
  },

  {
    id: 'schengen',
    country: 'country.schengen',
    document: 'spec.schengen.doc',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: mmBand(32, 36, 45),
    eye: ICAO_EYE,
    background: 'light-grey',
    digital: null,
    notes: ['spec.schengen.note1', 'spec.schengen.note2'],
  },

  {
    id: 'de-passport',
    country: 'country.de',
    document: 'spec.de-passport.doc',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: mmBand(32, 36, 45),
    eye: ICAO_EYE,
    background: 'light-grey',
    digital: null,
    notes: ['spec.de-passport.note1', 'spec.de-passport.note2'],
  },

  {
    id: 'fr-passport',
    country: 'country.fr',
    document: 'doc.passport-id',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: mmBand(32, 36, 45),
    // Published as a fraction too - "soit 70 a 80% de la photo" - and the two
    // agree, which is the only place in this table where the source states both.
    eye: ICAO_EYE,
    background: 'grey-or-blue-not-white',
    crown: 'skull',
    digital: null,
    notes: ['note.crown-skull', 'spec.fr-passport.note1'],
  },

  {
    id: 'it-passport',
    country: 'country.it',
    document: 'doc.passport',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: ICAO_HEAD,
    eye: band(0.50, 0.60, true),
    background: 'white-grey-blue',
    digital: null,
    notes: ['spec.it-passport.note1', 'note.eye-advisory'],
  },

  {
    id: 'nl-passport',
    country: 'country.nl',
    document: 'doc.passport-id-licence',
    kind: 'portrait',
    // 400, not 300: the Netherlands is the one rule here that states a
    // resolution of its own, and printPixels takes the higher of the two.
    print: { widthMm: 35, heightMm: 45, dpi: 400 },
    head: mmBand(26, 30, 45),
    eye: band(0.50, 0.60, true),
    background: 'white-grey-blue',
    digital: null,
    notes: ['spec.nl-passport.note1', 'spec.nl-passport.note2', 'note.eye-advisory'],
  },

  {
    id: 'es-passport',
    country: 'country.es',
    document: 'doc.passport-id',
    kind: 'portrait',
    print: { widthMm: 26, heightMm: 32, dpi: 300 },
    head: band(0.70, 0.80, true),
    eye: band(0.50, 0.60, true),
    background: 'white',
    digital: null,
    notes: ['spec.es-passport.note1', 'note.head-advisory'],
  },

  {
    id: 'ie-passport',
    country: 'country.ie',
    document: 'doc.passport',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: band(0.70, 0.80, true),
    eye: band(0.50, 0.60, true),
    background: 'white-grey-cream',
    digital: null,
    notes: ['spec.ie-passport.note1', 'spec.ie-passport.note2', 'note.head-advisory'],
  },

  {
    id: 'pl-passport',
    country: 'country.pl',
    document: 'doc.passport-id',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: mmBand(31, 36, 45),
    // The only eye line in this table published in millimetres from the bottom
    // edge, which is how every authority describes one and how geometry.js
    // measures it.
    eye: mmBand(20, 30, 45),
    background: 'white-or-grey',
    crown: 'skull',
    digital: null,
    notes: ['note.crown-skull', 'spec.pl-passport.note1'],
  },

  {
    id: 'ca-passport',
    country: 'country.ca',
    document: 'spec.ca-passport.doc',
    kind: 'portrait',
    print: { widthMm: 50, heightMm: 70, dpi: 300 },
    head: mmBand(31, 36, 70),
    eye: band(0.55, 0.72, true),
    background: 'white',
    digital: null,
    notes: [
      'spec.ca-passport.note1',
      'spec.ca-passport.note2',
      'spec.ca-passport.note3',
    ],
  },

  {
    id: 'au-passport',
    country: 'country.au',
    document: 'spec.au-passport.doc',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: mmBand(32, 36, 45),
    eye: ICAO_EYE,
    background: 'light-grey',
    digital: null,
    notes: ['spec.au-passport.note1', 'spec.au-passport.note2'],
  },

  {
    id: 'in-passport',
    country: 'country.in',
    document: 'spec.in-passport.doc',
    kind: 'portrait',
    print: { widthMm: 51, heightMm: 51, dpi: 300 },
    head: mmBand(25, 35, 51),
    eye: mmBand(28, 35, 51),
    background: 'white',
    digital: null,
    notes: ['spec.in-passport.note1', 'spec.in-passport.note2'],
  },

  {
    id: 'in-print-35x45',
    country: 'country.in',
    document: 'spec.in-print-35x45.doc',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: mmBand(30, 36, 45),
    eye: ICAO_EYE,
    background: 'white',
    digital: null,
    notes: ['spec.in-print-35x45.note1', 'spec.in-print-35x45.note2'],
    source: {
      authority: 'source.common',
      document: 'source.common.doc',
      checked: '2026-08-20',
    },
  },

  {
    id: 'in-exam-photo',
    country: 'country.in',
    document: 'spec.in-exam-photo.doc',
    kind: 'portrait',
    print: null,
    head: band(0.60, 0.80, true),
    eye: band(0.52, 0.68, true),
    background: 'white',
    digital: {
      label: 'spec.in-exam-photo.upload',
      width: { exact: 200 },
      height: { exact: 230 },
      bytes: { min: 20 * 1024, max: 50 * 1024 },
      format: 'image/jpeg',
    },
    notes: [
      'spec.in-exam-photo.note1',
      'spec.in-exam-photo.note2',
      'spec.in-exam-photo.note3',
    ],
  },

  {
    id: 'in-exam-signature',
    country: 'country.in',
    document: 'spec.in-exam-signature.doc',
    kind: 'signature',
    print: null,
    head: band(0, 1, true),
    eye: band(0, 1, true),
    background: 'white',
    digital: {
      label: 'spec.in-exam-signature.upload',
      width: { exact: 140 },
      height: { exact: 60 },
      bytes: { min: 10 * 1024, max: 20 * 1024 },
      format: 'image/jpeg',
    },
    notes: [
      'spec.in-exam-signature.note1',
      'spec.in-exam-signature.note2',
      'spec.in-exam-signature.note3',
    ],
  },

  {
    id: 'cn-passport',
    country: 'country.cn',
    document: 'spec.cn-passport.doc',
    kind: 'portrait',
    print: { widthMm: 33, heightMm: 48, dpi: 300 },
    head: mmBand(28, 33, 48),
    eye: band(0.50, 0.62, true),
    background: 'white',
    digital: {
      label: 'spec.cn-passport.upload',
      width: { exact: 354 },
      height: { exact: 472 },
      bytes: { min: 40 * 1024, max: 120 * 1024 },
      format: 'image/jpeg',
    },
    notes: ['spec.cn-passport.note1', 'spec.cn-passport.note2'],
  },

  {
    id: 'cn-1inch',
    country: 'country.cn',
    document: 'spec.cn-1inch.doc',
    kind: 'portrait',
    print: { widthMm: 25, heightMm: 35, dpi: 300 },
    head: band(0.70, 0.80, true),
    eye: band(0.50, 0.60, true),
    background: 'white',
    digital: null,
    notes: ['spec.cn-1inch.note1', 'note.studio-size'],
    source: { authority: 'source.studio', document: 'source.studio.doc', checked: '2026-09-17' },
  },

  {
    id: 'cn-2inch',
    country: 'country.cn',
    document: 'spec.cn-2inch.doc',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 49, dpi: 300 },
    head: band(0.70, 0.80, true),
    eye: band(0.50, 0.60, true),
    background: 'white',
    digital: null,
    notes: ['spec.cn-2inch.note1', 'note.studio-size'],
    source: { authority: 'source.studio', document: 'source.studio.doc', checked: '2026-09-17' },
  },

  {
    id: 'jp-passport',
    country: 'country.jp',
    document: 'spec.jp-passport.doc',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: mmBand(32, 36, 45),
    eye: band(0.53, 0.64, true),
    background: 'off-white',
    digital: null,
    notes: ['spec.jp-passport.note1', 'spec.jp-passport.note2'],
  },

  {
    id: 'jp-resume',
    country: 'country.jp',
    document: 'spec.jp-resume.doc',
    kind: 'portrait',
    print: { widthMm: 30, heightMm: 40, dpi: 300 },
    head: band(0.70, 0.80, true),
    eye: band(0.50, 0.60, true),
    background: 'white',
    digital: null,
    notes: ['spec.jp-resume.note1', 'note.studio-size'],
    source: { authority: 'source.studio', document: 'source.studio.doc', checked: '2026-09-17' },
  },

  {
    id: 'kr-passport',
    country: 'country.kr',
    document: 'doc.passport',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: mmBand(32, 36, 45),
    eye: band(0.50, 0.60, true),
    background: 'white',
    crown: 'skull',
    digital: {
      label: 'upload.online',
      width: { exact: 413 },
      height: { exact: 531 },
      bytes: {},
      format: 'image/jpeg',
    },
    notes: ['note.crown-skull', 'spec.kr-passport.note1', 'note.eye-advisory'],
  },

  {
    id: 'kr-banmyeongham',
    country: 'country.kr',
    document: 'spec.kr-banmyeongham.doc',
    kind: 'portrait',
    print: { widthMm: 30, heightMm: 40, dpi: 300 },
    head: band(0.70, 0.80, true),
    eye: band(0.50, 0.60, true),
    background: 'white',
    digital: null,
    notes: ['spec.kr-banmyeongham.note1', 'note.studio-size'],
    source: { authority: 'source.studio', document: 'source.studio.doc', checked: '2026-09-17' },
  },

  {
    id: 'sg-passport',
    country: 'country.sg',
    document: 'doc.passport-id',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: band(0.70, 0.80, true),
    eye: band(0.50, 0.60, true),
    background: 'white',
    digital: {
      label: 'upload.online',
      width: { exact: 400 },
      height: { exact: 514 },
      bytes: { max: 8 * 1024 * 1024 },
      format: 'image/jpeg',
    },
    notes: ['spec.sg-passport.note1', 'note.head-advisory'],
  },

  {
    id: 'nz-passport',
    country: 'country.nz',
    document: 'doc.passport',
    kind: 'portrait',
    // No print size is published: New Zealand's own guidance is a digital
    // photograph, and it says in as many words that a scan of a printed one is
    // not accepted. So there is nothing here to print and the sheet is off.
    print: null,
    head: band(0.70, 0.80, true),
    eye: band(0.50, 0.60, true),
    background: 'white-or-grey',
    digital: {
      label: 'upload.online',
      width: { min: 900, max: 4500 },
      height: { min: 1200, max: 6000 },
      bytes: { min: 250 * 1024, max: 5 * 1024 * 1024 },
      format: 'image/jpeg',
    },
    notes: ['spec.nz-passport.note1', 'spec.nz-passport.note2', 'note.head-advisory'],
  },

  {
    id: 'custom',
    country: 'country.other',
    document: 'spec.custom.doc',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: ICAO_HEAD,
    eye: ICAO_EYE,
    background: 'white',
    digital: {
      label: 'spec.custom.upload',
      width: { exact: 413 },
      height: { exact: 531 },
      bytes: { max: 200 * 1024 },
      format: 'image/jpeg',
    },
    notes: ['spec.custom.note1', 'spec.custom.note2'],
    source: {
      authority: 'source.you',
      document: 'source.you.doc',
      checked: '',
    },
  },
];

/**
 * The rulebook, with each rule's citation and native name attached.
 *
 * Attached here rather than looked up at the call site so that `spec.source` is
 * a field exactly as it always was: everything downstream, and every test, goes
 * on reading it without knowing the file was ever split. A rule that cites
 * nothing brought its own `source` with it and keeps it.
 *
 * @type {Spec[]}
 */
export const SPECS = RULES.map((rule) => {
  const cited = SOURCES[rule.id];
  if (!cited) return { ...rule, native: null };
  const { native = null, ...source } = cited;
  return { ...rule, native, source };
});

/** @type {Map<string, Spec>} */
const BY_ID = new Map(SPECS.map((spec) => [spec.id, spec]));

export const specById = (id) => BY_ID.get(id) ?? SPECS[0];

/**
 * The specification list grouped by country, for the <optgroup>s.
 *
 * Grouped on the key rather than on the name, so the three Indian rules stay
 * one group in every language whatever India is called there.
 */
export function specsByCountry() {
  const groups = [];
  for (const spec of SPECS) {
    let group = groups.find((entry) => entry.country === spec.country);
    if (!group) {
      group = { country: spec.country, specs: [] };
      groups.push(group);
    }
    group.specs.push(spec);
  }
  return groups;
}

/**
 * Every country, in the order the reader's own alphabet puts them.
 *
 * Sorted on the rendered name rather than on the key, because a list sorted
 * once in English is a list only an English reader can scan: Germany sorts
 * under G in English, Deutschland under D in German, and 德国 where Chinese
 * puts it. The comparator is the caller's - an Intl.Collator wants the page's
 * language and this file has no way to know it.
 *
 * Two entries are placed rather than sorted. The ICAO standard is first because
 * every rule below it is a variation on it, and it is what a country not on the
 * list is most likely to be issuing against; "anywhere else" is last because
 * that is what it means.
 */
export function orderedCountries(t, compare) {
  const place = (key) => (key === 'country.icao' ? 0 : key === 'country.other' ? 2 : 1);
  return specsByCountry()
    .map((group) => ({ ...group, label: countryLabel(group.country, t) }))
    .sort((a, b) => place(a.country) - place(b.country)
      || compare(a.label, b.label));
}

/** One country's documents, in the order the table lists them. */
export const specsOf = (country) => SPECS.filter((spec) => spec.country === country);

/**
 * A name, and the name the thing has for itself where that is a different word.
 *
 * The guard is not a nicety. Without it the German page reads "Deutschland
 * (Deutschland)" and the Chinese one "中国 (中国)": these two names are the
 * same word in the language they belong to, and differ only from the English
 * page's reading of them. Containment rather than equality, because the page
 * can also have said it already as part of something longer - China's rule
 * covers the passport and the visa, and "护照和签证 (护照)" is the page
 * translating a word into itself. One phrase key carries every pairing.
 */
const withNative = (name, native, t) => (
  native && !name.includes(native) ? t('name.native', { name, native }) : name);

/** "Germany (Deutschland)", and plain "Deutschland" on the German page. */
export const countryLabel = (country, t) => (
  withNative(t(country), ENDONYMS[country], t));

/** "Passport (旅券（パスポート）)", and plain "旅券（パスポート）" in Japanese. */
export const documentLabel = (spec, t) => (
  withNative(t(spec.document), spec.native, t));

/**
 * The background a rule asks for, in the reader's language.
 *
 * Three phrases rather than two: `label` is what the swatch says, `inline` is
 * the same words where a sentence carries them ("...which passes as plain
 * white"), and the second is not the first lowercased - German capitalises its
 * nouns and would be wrong either way round.
 */
export function backgroundOf(spec, t) {
  const found = BACKGROUNDS[spec.background] ?? BACKGROUNDS.white;
  return {
    ...found,
    label: t(`bg.${found.id}.label`),
    inline: t(`bg.${found.id}.inline`),
    note: t(`bg.${found.id}.note`),
  };
}

/**
 * The pixel size a portal file should be written at.
 *
 * An exact size is an exact size. Where a range is published, the smallest
 * allowed size is the answer, and deliberately: the other half of these rules
 * is a file-size ceiling, and every pixel above the minimum is bytes spent
 * fighting it for detail nobody will look at on a form.
 *
 * @returns {{width: number, height: number}|null}
 */
export function portalPixels(spec) {
  const digital = spec.digital;
  if (!digital) return null;
  const side = (axis) => axis.exact ?? axis.min ?? axis.max ?? null;
  const width = side(digital.width);
  const height = side(digital.height);
  return width && height ? { width, height } : null;
}

/** The byte band a portal file has to land inside. Either end may be absent. */
export function portalBytes(spec) {
  const bytes = spec.digital?.bytes ?? {};
  return { min: bytes.min ?? 0, max: bytes.max ?? Infinity };
}

/** How the print size reads in a sentence: "35 x 45 mm at 300 dpi". */
export function printLabel(spec, t) {
  if (!spec.print) return t('print.none');
  const { widthMm, heightMm, dpi } = spec.print;
  return t('print.size', { width: trim(widthMm), height: trim(heightMm), dpi });
}

/** How a pixel rule reads: "exactly 200 x 230", "at least 600 x 750". */
export function pixelLabel(spec, t) {
  const digital = spec.digital;
  if (!digital) return null;
  const axis = (value) => (value.exact ? `${value.exact}` : value.min ? `${value.min}+` : '-');
  if (digital.width.exact && digital.height.exact) {
    return t('px.exact', { width: digital.width.exact, height: digital.height.exact });
  }
  if (digital.width.max || digital.height.max) {
    return t('px.upto', {
      width: axis(digital.width),
      height: axis(digital.height),
      maxWidth: digital.width.max ?? '?',
      maxHeight: digital.height.max ?? '?',
    });
  }
  return t('px.least', { width: digital.width.min, height: digital.height.min });
}

/** 35 rather than 35.0, and 16.9 rather than 16.933333333333334. */
export function trim(mm) {
  return String(Math.round(mm * 10) / 10);
}

/**
 * A copy of a specification with the custom figures applied.
 *
 * Only the `custom` entry is editable, and the edit is a fresh object rather
 * than a mutation: the table above is the rulebook and nothing at runtime is
 * allowed to write into it. Doing it the other way round means an edit made on
 * the custom entry survives a switch to Germany and back, which is the kind of
 * bug that hands somebody a passport photo cropped to a size they typed in for
 * something else half an hour ago.
 *
 * @param {Spec} spec
 * @param {object} values
 * @returns {Spec}
 */
export function withCustom(spec, values) {
  const heightMm = positive(values.heightMm) ?? spec.print?.heightMm ?? 45;
  const widthMm = positive(values.widthMm) ?? spec.print?.widthMm ?? 35;
  const dpi = positive(values.dpi) ?? spec.print?.dpi ?? 300;

  const headMinMm = positive(values.headMinMm) ?? heightMm * spec.head.min;
  const headMaxMm = positive(values.headMaxMm) ?? heightMm * spec.head.max;

  return {
    ...spec,
    print: { widthMm, heightMm, dpi },
    head: mmBand(Math.min(headMinMm, headMaxMm), Math.max(headMinMm, headMaxMm), heightMm),
    background: BACKGROUNDS[values.background] ? values.background : spec.background,
    digital: {
      ...spec.digital,
      width: { exact: positive(values.pxWidth) ?? spec.digital.width.exact },
      height: { exact: positive(values.pxHeight) ?? spec.digital.height.exact },
      bytes: {
        min: values.minKb ? Math.round(values.minKb * 1024) : undefined,
        max: values.maxKb ? Math.round(values.maxKb * 1024) : undefined,
      },
      format: 'image/jpeg',
    },
  };
}

function positive(value) {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}
