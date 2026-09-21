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

  // Indonesia asks for blue, and no particular blue, so the check is wide. The
  // hex is the swatch and what a transparent picture is flattened onto.
  blue: { id: 'blue', hex: '#2f6fc4', tolerance: 38 },

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

  // For a rule that asks for a plain, evenly lit background and never says
  // which colour. Wide on purpose: refusing a wall the authority has not
  // refused would be this tool inventing a requirement, which is the one thing
  // the whole table exists not to do.
  'light-unstated': {
    id: 'light-unstated',
    hex: '#e9eaec',
    tolerance: 26,
    accepts: [WHITE, GREY, BLUE, CREAM],
  },

  // "Plain white or light-coloured": a colour is published, and it is any
  // light one. The same wide check as the rule that names none, under a label
  // that does not claim nothing was said.
  'white-or-light': {
    id: 'white-or-light',
    hex: '#f4f4f4',
    tolerance: 26,
    accepts: [WHITE, GREY, BLUE, CREAM],
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
 * @property {'words'} [published]  set where the authority describes the
 *   photograph and never gives a measurement, so that the citation under the
 *   figures does not claim they were transcribed from it. Such a rule owes the
 *   reader `note.no-measurements`, and a test checks that it carries it.
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
    id: 'us-visa',
    country: 'country.us',
    document: 'doc.visa',
    kind: 'portrait',
    print: { widthMm: 51, heightMm: 51, dpi: 300 },
    head: mmBand(25, 35, 51),
    // Still published for a visa, where the passport rule has dropped it.
    eye: mmBand(28, 35, 51),
    background: 'off-white',
    // Not the passport's upload: a square between 600 and 1200 pixels and
    // 240 kB at most, where online renewal takes anything up to 10 MB.
    digital: {
      label: 'upload.online',
      width: { min: 600 },
      height: { min: 600 },
      bytes: { max: 240 * 1024 },
      format: 'image/jpeg',
    },
    notes: ['spec.us-visa.note1'],
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
    id: 'uk-ni-driving-licence',
    country: 'country.uk',
    document: 'spec.uk-ni-driving-licence.doc',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    // No head size is published, only a shaded band for the eyes in a diagram.
    // The passport's band is what a booth will have used, so it is shown, and
    // marked as guidance.
    head: mmBand(29, 34, 45, true),
    eye: band(0.50, 0.62, true),
    background: 'cream',
    digital: null,
    notes: ['spec.uk-ni-driving-licence.note1', 'note.head-loose'],
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
    id: 'de-health-card',
    country: 'country.de',
    document: 'doc.health-card',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: band(0.70, 0.80, true),
    eye: band(0.50, 0.60, true),
    background: 'light-unstated',
    digital: null,
    notes: ['spec.de-health-card.note1', 'note.head-advisory'],
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
    id: 'it-id-card',
    country: 'country.it',
    document: 'doc.id-card',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: band(0.70, 0.80),
    eye: mmBand(23, 31, 45),
    background: 'white-or-light',
    digital: null,
    notes: ['spec.it-id-card.note1'],
  },

  {
    id: 'it-driving-licence',
    country: 'country.it',
    document: 'doc.driving-licence',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    // The circular gives the head twice and the two do not agree: 60 to 90 per
    // cent in its text, 28 to 32 mm under its figure. The millimetres are the
    // narrower claim and sit inside the percentages, so they are what is held.
    head: mmBand(28, 32, 45),
    eye: band(0.50, 0.62, true),
    background: 'white-or-light',
    digital: null,
    notes: ['spec.it-driving-licence.note1', 'note.eye-advisory'],
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
    id: 'es-driving-licence',
    country: 'country.es',
    document: 'doc.driving-licence',
    kind: 'portrait',
    print: { widthMm: 26, heightMm: 32, dpi: 300 },
    head: band(0.70, 0.80, true),
    eye: band(0.50, 0.60, true),
    background: 'light-unstated',
    digital: null,
    notes: ['spec.es-driving-licence.note1', 'note.head-advisory'],
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
    digital: {
      label: 'upload.online',
      width: { min: 492 },
      height: { min: 633 },
      bytes: { max: 2.5 * 1024 * 1024 },
      format: 'image/jpeg',
    },
    notes: ['note.crown-skull', 'spec.pl-passport.note1', 'spec.pl-passport.note2'],
  },

  {
    id: 'pl-driving-licence',
    country: 'country.pl',
    document: 'doc.driving-licence',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: band(0.70, 0.80),
    eye: band(0.50, 0.60, true),
    background: 'white-or-light',
    digital: {
      label: 'upload.online',
      width: { exact: 480 },
      height: { exact: 615 },
      bytes: { max: 100 * 1024 },
      format: 'image/jpeg',
    },
    notes: ['spec.pl-driving-licence.note1', 'note.eye-advisory'],
  },

  {
    id: 'ch-passport',
    country: 'country.ch',
    document: 'doc.passport-id',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: band(0.70, 0.80, true),
    eye: band(0.50, 0.60, true),
    background: 'light-unstated',
    published: 'words',
    digital: null,
    notes: ['spec.ch-passport.note1', 'note.no-measurements', 'note.taken-at-the-office'],
  },

  {
    id: 'ch-driving-licence',
    country: 'country.ch',
    document: 'doc.driving-licence',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: mmBand(29, 34, 45),
    eye: band(0.50, 0.62, true),
    background: 'light-unstated',
    crown: 'skull',
    digital: null,
    notes: ['spec.ch-driving-licence.note1', 'note.crown-skull', 'note.eye-advisory'],
  },

  {
    id: 'se-passport',
    country: 'country.se',
    document: 'doc.passport-id',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: band(0.70, 0.80, true),
    eye: band(0.50, 0.60, true),
    background: 'light-unstated',
    published: 'words',
    digital: null,
    notes: ['spec.se-passport.note1', 'note.no-measurements', 'note.taken-at-the-office'],
  },

  {
    id: 'se-driving-licence',
    country: 'country.se',
    document: 'doc.driving-licence',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    // Sweden measures pupil to chin, 14 to 17 mm, which is neither of the two
    // things this tool measures. On most faces that is a head of 31 to 37 mm,
    // so the ICAO band shown lands inside it; it stays guidance.
    head: band(0.70, 0.80, true),
    eye: band(0.50, 0.60, true),
    background: 'light-unstated',
    digital: null,
    notes: ['spec.se-driving-licence.note1', 'note.head-advisory'],
  },

  {
    id: 'dk-driving-licence',
    country: 'country.dk',
    document: 'doc.driving-licence',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: mmBand(30, 36, 45),
    eye: band(0.50, 0.62, true),
    background: 'white-or-light',
    digital: null,
    notes: ['spec.dk-driving-licence.note1', 'note.eye-advisory'],
  },

  {
    id: 'no-passport',
    country: 'country.no',
    document: 'doc.passport-id',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: band(0.70, 0.80, true),
    eye: band(0.50, 0.60, true),
    background: 'light-unstated',
    published: 'words',
    digital: null,
    notes: ['spec.no-passport.note1', 'note.no-measurements', 'note.taken-at-the-office'],
  },

  {
    id: 'pt-passport',
    country: 'country.pt',
    document: 'doc.passport-id',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: band(0.70, 0.80, true),
    eye: band(0.50, 0.60, true),
    background: 'light-unstated',
    published: 'words',
    digital: null,
    notes: ['spec.pt-passport.note1', 'note.no-measurements', 'note.taken-at-the-office'],
  },

  {
    id: 'ru-passport',
    country: 'country.ru',
    document: 'spec.ru-passport.doc',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: band(0.70, 0.80, true),
    eye: band(0.50, 0.60, true),
    background: 'light-unstated',
    published: 'words',
    digital: null,
    notes: ['spec.ru-passport.note1', 'note.no-measurements', 'note.taken-at-the-office'],
  },

  {
    id: 'ru-passport-5',
    country: 'country.ru',
    document: 'spec.ru-passport-5.doc',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: band(0.70, 0.80),
    eye: band(0.50, 0.60, true),
    background: 'white',
    digital: null,
    notes: ['spec.ru-passport-5.note1', 'note.eye-advisory'],
  },

  {
    id: 'ru-internal-passport',
    country: 'country.ru',
    document: 'spec.ru-internal-passport.doc',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    // Only the ceiling is published: "no more than eighty per cent", with
    // 5 mm, give or take one, clear above the head. The floor is this table's
    // and is set low, so that nothing the regulation allows is painted red.
    head: band(0.60, 0.80),
    eye: band(0.50, 0.60, true),
    background: 'white',
    digital: null,
    notes: ['spec.ru-internal-passport.note1', 'note.eye-advisory'],
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
    id: 'ca-pr-card',
    country: 'country.ca',
    document: 'spec.ca-pr-card.doc',
    kind: 'portrait',
    print: { widthMm: 50, heightMm: 70, dpi: 300 },
    head: mmBand(31, 36, 70),
    eye: band(0.55, 0.72, true),
    background: 'white',
    crown: 'skull',
    digital: {
      label: 'upload.online',
      width: { min: 715 },
      height: { min: 1000 },
      bytes: { max: 4 * 1024 * 1024 },
      format: 'image/jpeg',
    },
    notes: ['spec.ca-pr-card.note1', 'note.crown-skull', 'note.eye-advisory'],
  },

  {
    id: 'ca-citizenship',
    country: 'country.ca',
    document: 'spec.ca-citizenship.doc',
    kind: 'portrait',
    print: { widthMm: 50, heightMm: 70, dpi: 300 },
    head: mmBand(31, 36, 70),
    eye: band(0.55, 0.72, true),
    background: 'white-or-light',
    // "At least 420 by 540" is not the shape of a 50 x 70 frame. 420 wide at
    // five to seven is 588 tall, which clears both figures.
    digital: {
      label: 'upload.online',
      width: { min: 420 },
      height: { min: 588 },
      bytes: { max: 4 * 1024 * 1024 },
      format: 'image/jpeg',
    },
    notes: ['spec.ca-citizenship.note1', 'note.eye-advisory'],
  },

  {
    id: 'ca-visa',
    country: 'country.ca',
    document: 'spec.ca-visa.doc',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: mmBand(31, 36, 45),
    eye: band(0.50, 0.62, true),
    background: 'white-or-light',
    crown: 'skull',
    digital: null,
    notes: ['spec.ca-visa.note1', 'note.crown-skull', 'note.eye-advisory'],
  },

  {
    id: 'ca-firearms-licence',
    country: 'country.ca',
    document: 'spec.ca-firearms-licence.doc',
    kind: 'portrait',
    print: { widthMm: 45, heightMm: 57, dpi: 300 },
    head: mmBand(30, 45, 57),
    eye: band(0.50, 0.68, true),
    background: 'white-or-light',
    digital: {
      label: 'upload.online',
      width: { min: 531 },
      height: { min: 673 },
      bytes: { min: 200 * 1024, max: 6 * 1024 * 1024 },
      format: 'image/jpeg',
    },
    notes: ['spec.ca-firearms-licence.note1', 'note.eye-advisory'],
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
    id: 'au-visa',
    country: 'country.au',
    document: 'doc.visa',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: band(0.70, 0.80, true),
    eye: band(0.50, 0.60, true),
    background: 'light-unstated',
    digital: null,
    notes: ['spec.au-visa.note1', 'note.head-advisory'],
  },

  {
    id: 'au-citizenship',
    country: 'country.au',
    document: 'spec.au-citizenship.doc',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: mmBand(32, 36, 45),
    eye: band(0.50, 0.60, true),
    background: 'light-grey',
    digital: null,
    notes: ['spec.au-citizenship.note1', 'note.eye-advisory'],
  },

  {
    id: 'au-citizenship-online',
    country: 'country.au',
    document: 'spec.au-citizenship-online.doc',
    kind: 'portrait',
    // Three to four, where the print is seven to nine: the same split Hong
    // Kong needs, for the same reason.
    print: null,
    head: band(0.60, 0.75, true),
    eye: band(0.50, 0.62, true),
    background: 'light-grey',
    digital: {
      label: 'upload.online',
      width: { min: 1200 },
      height: { min: 1600 },
      bytes: { min: 70 * 1024, max: 3.5 * 1024 * 1024 },
      format: 'image/jpeg',
    },
    notes: ['spec.au-citizenship-online.note1', 'note.head-loose'],
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
    id: 'in-visa',
    country: 'country.in',
    document: 'doc.visa',
    kind: 'portrait',
    // The head is published in millimetres and the frame is not. 25 to 35 mm
    // is the head of a two-inch square, which is the passport entry above, so
    // that is the proportion applied - as a fraction, since no print is asked
    // for here.
    print: null,
    head: band(25 / 51, 35 / 51),
    eye: band(28 / 51, 35 / 51, true),
    background: 'white-or-light',
    digital: {
      label: 'upload.online',
      width: { min: 600 },
      height: { min: 600 },
      bytes: { min: 10 * 1024, max: 300 * 1024 },
      format: 'image/jpeg',
    },
    notes: ['spec.in-visa.note1'],
  },

  {
    id: 'in-evisa',
    country: 'country.in',
    document: 'doc.evisa',
    kind: 'portrait',
    print: null,
    head: band(0.50, 0.70, true),
    eye: band(0.52, 0.68, true),
    background: 'white-or-light',
    digital: {
      label: 'upload.online',
      width: { min: 600 },
      height: { min: 600 },
      bytes: { min: 10 * 1024, max: 1024 * 1024 },
      format: 'image/jpeg',
    },
    notes: ['spec.in-evisa.note1', 'note.head-loose'],
  },

  {
    id: 'in-driving-licence',
    country: 'country.in',
    document: 'doc.driving-licence',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: band(0.70, 0.80, true),
    eye: band(0.50, 0.60, true),
    background: 'white-or-light',
    digital: {
      label: 'upload.online',
      width: { min: 420 },
      height: { min: 525 },
      bytes: { min: 10 * 1024, max: 20 * 1024 },
      format: 'image/jpeg',
    },
    notes: ['spec.in-driving-licence.note1', 'note.head-advisory'],
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
    id: 'cn-id-card',
    country: 'country.cn',
    document: 'doc.id-card',
    kind: 'portrait',
    print: { widthMm: 26, heightMm: 32, dpi: 300 },
    head: band(0.60, 0.72, true),
    eye: band(0.50, 0.62, true),
    background: 'white',
    digital: null,
    notes: ['spec.cn-id-card.note1', 'note.head-loose'],
  },

  {
    id: 'cn-driving-licence',
    country: 'country.cn',
    document: 'doc.driving-licence',
    kind: 'portrait',
    print: { widthMm: 22, heightMm: 32, dpi: 300 },
    head: mmBand(19, 22, 32),
    eye: band(0.50, 0.62, true),
    background: 'white',
    digital: null,
    notes: ['spec.cn-driving-licence.note1', 'note.eye-advisory'],
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
    id: 'jp-mynumber',
    country: 'country.jp',
    document: 'spec.jp-mynumber.doc',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: mmBand(32, 36, 45, true),
    eye: band(0.50, 0.60, true),
    background: 'light-unstated',
    digital: {
      label: 'upload.online',
      width: { min: 480 },
      height: { min: 617 },
      bytes: { min: 20 * 1024, max: 7 * 1024 * 1024 },
      format: 'image/jpeg',
    },
    notes: ['spec.jp-mynumber.note1', 'note.head-loose'],
  },

  {
    id: 'jp-residence-card',
    country: 'country.jp',
    document: 'doc.residence-card',
    kind: 'portrait',
    print: { widthMm: 30, heightMm: 40, dpi: 300 },
    head: mmBand(22, 28, 40),
    eye: band(0.45, 0.60, true),
    background: 'light-unstated',
    digital: null,
    notes: ['spec.jp-residence-card.note1', 'note.eye-advisory'],
  },

  {
    id: 'jp-driving-licence',
    country: 'country.jp',
    document: 'doc.driving-licence',
    kind: 'portrait',
    print: { widthMm: 24, heightMm: 30, dpi: 300 },
    head: band(0.55, 0.75, true),
    eye: band(0.50, 0.65, true),
    background: 'light-unstated',
    digital: null,
    notes: ['spec.jp-driving-licence.note1', 'note.head-loose'],
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
    id: 'kr-driving-licence',
    country: 'country.kr',
    document: 'doc.driving-licence',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: mmBand(32, 36, 45),
    eye: band(0.50, 0.60, true),
    background: 'white',
    digital: {
      label: 'upload.online',
      width: { exact: 413 },
      height: { exact: 531 },
      bytes: { max: 500 * 1024 },
      format: 'image/jpeg',
    },
    notes: ['spec.kr-driving-licence.note1', 'note.eye-advisory'],
  },

  {
    id: 'kr-id-card',
    country: 'country.kr',
    document: 'doc.id-card',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: band(0.70, 0.80, true),
    eye: band(0.50, 0.60, true),
    background: 'white-or-light',
    digital: null,
    notes: ['spec.kr-id-card.note1', 'note.head-advisory'],
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
    id: 'hk-passport',
    country: 'country.hk',
    document: 'doc.passport',
    kind: 'portrait',
    print: { widthMm: 40, heightMm: 50, dpi: 300 },
    head: mmBand(32, 36, 50),
    eye: band(0.50, 0.60, true),
    background: 'white',
    digital: null,
    notes: ['spec.hk-passport.note1', 'note.eye-advisory'],
  },

  {
    id: 'hk-passport-online',
    country: 'country.hk',
    document: 'spec.hk-passport-online.doc',
    kind: 'portrait',
    // The online form is not the print at some resolution: it is 3:4 where the
    // print is 4:5, so it is a rule of its own with nothing to put on paper.
    print: null,
    head: band(0.60, 0.75, true),
    eye: band(0.50, 0.62, true),
    background: 'white',
    digital: {
      label: 'upload.online',
      width: { min: 1200 },
      height: { min: 1600 },
      bytes: { max: 5 * 1024 * 1024 },
      format: 'image/jpeg',
    },
    notes: ['spec.hk-passport-online.note1', 'note.head-loose'],
  },

  {
    id: 'tw-passport',
    country: 'country.tw',
    document: 'doc.passport',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: mmBand(32, 36, 45),
    eye: band(0.50, 0.60, true),
    background: 'white',
    digital: {
      label: 'upload.online',
      width: { min: 413 },
      height: { min: 531 },
      bytes: { max: 5 * 1024 * 1024 },
      format: 'image/jpeg',
    },
    notes: ['spec.tw-passport.note1', 'note.eye-advisory'],
  },

  {
    id: 'tw-id-card',
    country: 'country.tw',
    document: 'doc.id-card',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: mmBand(32, 36, 45),
    eye: band(0.50, 0.60, true),
    background: 'white',
    digital: {
      label: 'upload.online',
      width: { min: 413 },
      height: { min: 531 },
      bytes: { max: 5 * 1024 * 1024 },
      format: 'image/jpeg',
    },
    notes: ['spec.tw-id-card.note1', 'note.eye-advisory'],
  },

  {
    id: 'vn-passport',
    country: 'country.vn',
    document: 'doc.passport',
    kind: 'portrait',
    print: { widthMm: 40, heightMm: 60, dpi: 300 },
    head: band(0.70, 0.80, true),
    eye: band(0.50, 0.60, true),
    background: 'white',
    digital: null,
    notes: ['spec.vn-passport.note1', 'note.head-advisory'],
  },

  {
    id: 'vn-driving-licence',
    country: 'country.vn',
    document: 'doc.driving-licence',
    kind: 'portrait',
    print: { widthMm: 30, heightMm: 40, dpi: 300 },
    head: band(0.65, 0.80, true),
    eye: band(0.50, 0.62, true),
    background: 'white',
    digital: {
      label: 'upload.online',
      width: { min: 473 },
      height: { min: 630 },
      bytes: { max: 700 * 1024 },
      format: 'image/jpeg',
    },
    notes: ['spec.vn-driving-licence.note1', 'note.head-loose'],
  },

  {
    id: 'ph-passport',
    country: 'country.ph',
    document: 'doc.passport',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: band(0.70, 0.80, true),
    eye: band(0.50, 0.60, true),
    background: 'light-unstated',
    published: 'words',
    digital: null,
    notes: ['spec.ph-passport.note1', 'note.no-measurements', 'note.taken-at-the-office'],
  },

  {
    id: 'pk-passport',
    country: 'country.pk',
    document: 'doc.passport',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: mmBand(29, 34, 45),
    eye: band(0.50, 0.60, true),
    background: 'white',
    // A ceiling on the file and nothing on its pixels, so the size written is
    // the print at 300 dpi - the same answer the American rule gets, for the
    // same reason.
    digital: {
      label: 'upload.online',
      width: { min: 413 },
      height: { min: 531 },
      bytes: { max: 5 * 1024 * 1024 },
      format: 'image/jpeg',
    },
    notes: ['spec.pk-passport.note1', 'note.eye-advisory'],
  },

  {
    id: 'bd-passport',
    country: 'country.bd',
    document: 'doc.passport',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: band(0.70, 0.80, true),
    eye: band(0.50, 0.60, true),
    background: 'light-unstated',
    published: 'words',
    digital: null,
    notes: ['spec.bd-passport.note1', 'note.no-measurements', 'note.taken-at-the-office'],
  },

  {
    id: 'bd-passport-child',
    country: 'country.bd',
    document: 'spec.bd-passport-child.doc',
    kind: 'portrait',
    // 3R: three and a half inches by five. The office crops the face out of it
    // itself, so the head is nowhere near the 70 per cent of a finished
    // passport photograph and the band is wide to match.
    print: { widthMm: 89, heightMm: 127, dpi: 300 },
    head: band(0.35, 0.70, true),
    eye: band(0.45, 0.70, true),
    background: 'light-grey',
    digital: null,
    notes: ['spec.bd-passport-child.note1', 'note.head-loose'],
  },

  {
    id: 'id-passport',
    country: 'country.id',
    document: 'doc.passport',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: band(0.70, 0.80, true),
    eye: band(0.50, 0.60, true),
    background: 'white',
    published: 'words',
    digital: null,
    notes: ['spec.id-passport.note1', 'note.no-measurements', 'note.taken-at-the-office'],
  },

  {
    id: 'id-driving-licence',
    country: 'country.id',
    document: 'doc.driving-licence',
    kind: 'portrait',
    print: null,
    head: band(0.55, 0.75, true),
    eye: band(0.50, 0.65, true),
    background: 'blue',
    digital: {
      label: 'upload.online',
      width: { exact: 480 },
      height: { exact: 640 },
      bytes: { max: 100 * 1024 },
      format: 'image/jpeg',
    },
    notes: ['spec.id-driving-licence.note1', 'note.head-loose'],
  },

  {
    id: 'my-passport',
    country: 'country.my',
    document: 'doc.passport',
    kind: 'portrait',
    // Five millimetres taller than the usual frame and a smaller face in it:
    // 25 to 30 mm, which the rule itself calls 50 to 60 per cent.
    print: { widthMm: 35, heightMm: 50, dpi: 300 },
    head: mmBand(25, 30, 50),
    eye: band(0.50, 0.62, true),
    background: 'white',
    digital: null,
    notes: ['spec.my-passport.note1', 'note.eye-advisory'],
  },

  {
    id: 'my-expat-pass',
    country: 'country.my',
    document: 'spec.my-expat-pass.doc',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 50, dpi: 300 },
    head: mmBand(30, 35, 50),
    eye: band(0.50, 0.62, true),
    background: 'white',
    // A ceiling of 25 KB and nothing on the pixels, so the size written is the
    // print at 300 dpi and the squeeze does the rest.
    digital: {
      label: 'upload.online',
      width: { min: 413 },
      height: { min: 591 },
      bytes: { max: 25 * 1024 },
      format: 'image/jpeg',
    },
    notes: ['spec.my-expat-pass.note1', 'note.eye-advisory'],
  },

  {
    id: 'my-driving-licence',
    country: 'country.my',
    document: 'doc.driving-licence',
    kind: 'portrait',
    print: { widthMm: 25, heightMm: 32, dpi: 300 },
    head: band(0.65, 0.80, true),
    eye: band(0.50, 0.62, true),
    background: 'white',
    digital: null,
    notes: ['spec.my-driving-licence.note1', 'note.head-loose'],
  },

  {
    id: 'th-passport',
    country: 'country.th',
    document: 'doc.passport',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: band(0.70, 0.80, true),
    eye: band(0.50, 0.60, true),
    background: 'light-unstated',
    published: 'words',
    digital: null,
    notes: ['spec.th-passport.note1', 'note.no-measurements', 'note.taken-at-the-office'],
  },

  {
    id: 'th-evisa',
    country: 'country.th',
    document: 'doc.evisa',
    kind: 'portrait',
    // "Around 70 per cent" and "vertical" are the whole of the geometry, and
    // 3 MB the whole of the file. The shape written is 35 x 45 at 300 dpi
    // because a shape has to be written, not because Thailand asks for it.
    print: null,
    head: band(0.65, 0.75),
    eye: band(0.50, 0.62, true),
    background: 'off-white',
    digital: {
      label: 'upload.online',
      width: { min: 413 },
      height: { min: 531 },
      bytes: { max: 3 * 1024 * 1024 },
      format: 'image/jpeg',
    },
    notes: ['spec.th-evisa.note1', 'note.eye-advisory'],
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
    id: 'br-passport',
    country: 'country.br',
    document: 'doc.passport',
    kind: 'portrait',
    print: { widthMm: 50, heightMm: 70, dpi: 300 },
    head: mmBand(31, 36, 70),
    eye: band(0.55, 0.72, true),
    background: 'white',
    crown: 'skull',
    digital: null,
    notes: ['note.crown-skull', 'spec.br-passport.note1', 'note.eye-advisory'],
  },

  {
    id: 'mx-passport',
    country: 'country.mx',
    document: 'doc.passport',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: band(0.70, 0.80, true),
    eye: band(0.50, 0.60, true),
    background: 'white',
    digital: null,
    notes: ['spec.mx-passport.note1', 'note.head-advisory'],
  },

  {
    id: 'ar-passport',
    country: 'country.ar',
    document: 'doc.passport',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: band(0.70, 0.80, true),
    eye: band(0.50, 0.60, true),
    background: 'light-unstated',
    published: 'words',
    digital: null,
    notes: ['spec.ar-passport.note1', 'note.no-measurements', 'note.taken-at-the-office'],
  },

  {
    id: 'ar-emergency',
    country: 'country.ar',
    document: 'spec.ar-emergency.doc',
    kind: 'portrait',
    // "Medio busto": the shoulders are in the picture, so the head is nowhere
    // near the 70 per cent of an ICAO crop.
    print: { widthMm: 40, heightMm: 40, dpi: 300 },
    head: band(0.50, 0.70, true),
    eye: band(0.50, 0.65, true),
    background: 'white',
    digital: null,
    notes: ['spec.ar-emergency.note1', 'note.head-loose'],
  },

  {
    id: 'tr-passport',
    country: 'country.tr',
    document: 'doc.passport-id-licence',
    kind: 'portrait',
    print: { widthMm: 50, heightMm: 60, dpi: 300 },
    head: band(0.70, 0.80, true),
    eye: band(0.50, 0.60, true),
    background: 'white',
    digital: null,
    notes: ['spec.tr-passport.note1', 'note.head-advisory'],
  },

  {
    id: 'za-passport',
    country: 'country.za',
    document: 'doc.passport-id',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: mmBand(29, 34, 45),
    eye: band(0.50, 0.60, true),
    background: 'cream',
    digital: null,
    notes: ['spec.za-passport.note1', 'note.eye-advisory'],
  },

  {
    id: 'za-driving-licence',
    country: 'country.za',
    document: 'doc.driving-licence',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: band(0.70, 0.80, true),
    eye: band(0.50, 0.60, true),
    background: 'light-unstated',
    digital: null,
    notes: ['spec.za-driving-licence.note1', 'note.head-advisory'],
  },

  {
    id: 'ae-passport',
    country: 'country.ae',
    document: 'doc.passport-id',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: ICAO_HEAD,
    eye: band(0.50, 0.60, true),
    background: 'light-unstated',
    digital: null,
    notes: ['spec.ae-passport.note1', 'note.eye-advisory'],
  },

  {
    id: 'sa-evisa',
    country: 'country.sa',
    document: 'doc.evisa',
    kind: 'portrait',
    print: null,
    head: band(0.70, 0.80),
    eye: band(0.50, 0.65, true),
    background: 'white',
    digital: {
      label: 'upload.online',
      width: { exact: 200 },
      height: { exact: 200 },
      bytes: { min: 5 * 1024, max: 100 * 1024 },
      format: 'image/jpeg',
    },
    notes: ['spec.sa-evisa.note1', 'note.eye-advisory'],
  },

  {
    id: 'il-passport',
    country: 'country.il',
    document: 'doc.passport',
    kind: 'portrait',
    print: { widthMm: 50, heightMm: 50, dpi: 300 },
    head: band(0.50, 0.70, true),
    eye: band(0.50, 0.65, true),
    background: 'white',
    digital: null,
    notes: ['spec.il-passport.note1', 'note.head-loose'],
  },

  {
    id: 'eg-passport',
    country: 'country.eg',
    document: 'doc.passport',
    kind: 'portrait',
    print: { widthMm: 35, heightMm: 45, dpi: 300 },
    head: band(0.70, 0.80, true),
    eye: band(0.50, 0.60, true),
    background: 'white',
    published: 'words',
    digital: null,
    notes: ['spec.eg-passport.note1', 'note.no-measurements'],
  },

  {
    id: 'ng-passport',
    country: 'country.ng',
    document: 'doc.passport',
    kind: 'portrait',
    print: null,
    head: band(0.60, 0.80, true),
    eye: band(0.50, 0.62, true),
    background: 'white',
    digital: {
      label: 'upload.online',
      width: { exact: 600 },
      height: { exact: 800 },
      bytes: { max: 2 * 1024 * 1024 },
      format: 'image/jpeg',
    },
    notes: ['spec.ng-passport.note1', 'note.head-loose'],
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

/** Diacritics folded away and case with them, so "turkiye" finds Türkiye. */
const folded = (text) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

/**
 * The countries that answer what has been typed, best answer first.
 *
 * Both the rendered name and the endonym are searched - they are one label -
 * and so is every document the country lists, so "Deutschland" finds Germany on
 * the Chinese page and "PR card" finds Canada on any of them.
 *
 * Ranked rather than left in the alphabet's order, because the first row is the
 * one the Enter key takes. "in" is inside Argentina, China and the Philippines
 * and is the start of India and Indonesia; somebody typing it means the last
 * two. A name that begins with the text comes first, then a name with a word
 * that does, then a name that merely contains it, then a country found only
 * through one of its documents. Inside a rank the order is the caller's, which
 * is the page's own alphabet.
 *
 * @param {ReturnType<typeof orderedCountries>} countries
 * @param {string} typed
 * @param {(key: string, values?: object) => string} t
 */
export function matchCountries(countries, typed, t) {
  const want = folded(typed.trim());
  if (!want) return countries;
  const rank = (one) => {
    const label = folded(one.label);
    if (label.startsWith(want)) return 0;
    if (label.split(/[\s(/,-]+/).some((word) => word.startsWith(want))) return 1;
    if (label.includes(want)) return 2;
    return one.specs.some((spec) => folded(documentLabel(spec, t)).includes(want)) ? 3 : 4;
  };
  return countries
    .map((one, index) => ({ one, index, rank: rank(one) }))
    .filter((entry) => entry.rank < 4)
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map((entry) => entry.one);
}

/**
 * The rule an address asks for: "#us-passport" is the United States passport.
 *
 * Every rule with figures of its own has a page of its own, and the button on
 * that page has to open this one with the rule already chosen - somebody who
 * has just read Canada's numbers should not be handed the ICAO standard and a
 * list of forty-four countries to find Canada in again. A fragment rather than
 * a query, because a fragment is never sent to a server and so cannot turn one
 * page into sixty-seven addresses for a crawler to find.
 *
 * Anything else comes back null - "#main" is where the skip link lands - and
 * so does `custom`, which is a form to fill in rather than a rule to arrive at.
 *
 * @param {string} hash  location.hash, with or without its "#"
 * @returns {string|null}
 */
export function specFromHash(hash) {
  const id = String(hash ?? '').replace(/^#/, '');
  if (!id || id === 'custom') return null;
  return SPECS.some((spec) => spec.id === id) ? id : null;
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
