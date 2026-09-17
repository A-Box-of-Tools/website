/**
 * Somebody else's words: what each country calls itself, what each document is
 * called in the language it is issued in, and the authority and title behind
 * every figure in specs.js.
 *
 * NOTHING IN THIS FILE IS THIS SITE'S PROSE, and that is the whole reason it is
 * a file of its own. specs.js says it at length under FOURTH: an authority's
 * name and a document's title are what a reader searches for to check a
 * transcription, and translating one is how a citation stops being one. The
 * same is true of the other two columns. "Reisepass" is not a translation of
 * "passport" - it is the word printed on the cover, and somebody holding the
 * document is matching that word rather than ours.
 *
 * tests/python/test_english_in_js.py exempts this module from the count of
 * English left in the JavaScript, for that reason and on the condition that the
 * whole module stays this and nothing else. The exemption is only honest while
 * that holds, so tests/js/id-photo-sources.test.js asserts the shape rather
 * than trusting it: every id a rule that exists, every value short, and not one
 * of them a sentence.
 *
 * A name is only here when it is a different word from the one this site would
 * print anyway. "Passport" under the United Kingdom is not a second fact, and
 * the page would read "Passport (Passport)"; 旅券 under Japan is the word on the
 * form somebody is filling in.
 */

/**
 * What a country calls itself.
 *
 * Keyed by the country phrase key, so it is written once however many documents
 * that country issues. Three of the eleven groups have no entry and cannot: a
 * standard, a treaty area and "anywhere else" are not places with a name for
 * themselves.
 */
export const ENDONYMS = {
  'country.us': 'United States',
  'country.uk': 'United Kingdom',
  'country.de': 'Deutschland',
  'country.ca': 'Canada',
  'country.au': 'Australia',
  'country.in': 'भारत',
  'country.cn': '中国',
  'country.jp': '日本',
};

/**
 * The citation behind each rule, and the document's own name for itself.
 *
 * Keyed by the spec id and kept in the same order as the table in specs.js, so
 * that the two files can be read side by side; a test holds them in step. The
 * two rules that cite nothing - common practice, and the figures you typed in
 * yourself - are not here at all: there is no publication to be faithful to, so
 * their source is a pair of phrase keys and lives with the rest of the prose.
 */
export const SOURCES = {
  icao: {
    authority: 'International Civil Aviation Organization',
    document: 'Doc 9303, Machine Readable Travel Documents, Part 3',
    checked: '2026-08-20',
  },
  'us-passport': {
    authority: 'U.S. Department of State',
    document: 'travel.state.gov, Photo Requirements',
    checked: '2026-08-20',
  },
  'us-dv': {
    authority: 'U.S. Department of State',
    document: 'dvprogram.state.gov, Photo Requirements',
    checked: '2026-08-20',
  },
  'uk-passport': {
    authority: 'HM Passport Office',
    document: 'gov.uk, Passport photo requirements',
    checked: '2026-08-20',
  },
  schengen: {
    authority: 'European Commission',
    document: 'Visa Code, common photograph standards (ICAO-aligned)',
    checked: '2026-08-20',
  },
  'de-passport': {
    // The cover word alone. The rule covers the identity card too, and
    // "Reisepass, Personalausweis" would have the German page reading
    // "Reisepass und Personalausweis (Reisepass, Personalausweis)" -
    // the same two words back again, past the guard on a comma.
    native: 'Reisepass',
    authority: 'Bundesministerium des Innern',
    document: 'Passbildschablone / biometric photo template',
    checked: '2026-08-20',
  },
  'ca-passport': {
    native: 'Passeport',
    authority: 'Immigration, Refugees and Citizenship Canada',
    document: 'canada.ca, Photo requirements for passports',
    checked: '2026-08-20',
  },
  'au-passport': {
    authority: 'Australian Passport Office',
    document: 'passports.gov.au, Photo guidelines',
    checked: '2026-08-20',
  },
  'in-passport': {
    native: 'पासपोर्ट',
    authority: 'Ministry of External Affairs',
    document: 'Passport Seva, photo specifications',
    checked: '2026-08-20',
  },
  'in-exam-photo': {
    authority: 'Staff Selection Commission / UPSC',
    document: 'Notice of Examination, photograph and signature specifications',
    checked: '2026-08-20',
  },
  'in-exam-signature': {
    authority: 'Staff Selection Commission / UPSC',
    document: 'Notice of Examination, photograph and signature specifications',
    checked: '2026-08-20',
  },
  'cn-passport': {
    native: '护照',
    authority: 'National Immigration Administration',
    document: 'Published photograph standard for exit and entry documents',
    checked: '2026-08-20',
  },
  'jp-passport': {
    native: '旅券（パスポート）',
    authority: 'Ministry of Foreign Affairs of Japan',
    document: 'Passport photograph standards',
    checked: '2026-08-20',
  },
};
