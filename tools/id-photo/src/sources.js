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
  'country.fr': 'France',
  'country.it': 'Italia',
  'country.nl': 'Nederland',
  'country.es': 'España',
  'country.ie': 'Éire',
  'country.pl': 'Polska',
  'country.ch': 'Schweiz / Suisse / Svizzera',
  'country.se': 'Sverige',
  'country.no': 'Norge',
  'country.pt': 'Portugal',
  'country.de': 'Deutschland',
  'country.ca': 'Canada',
  'country.au': 'Australia',
  'country.in': 'भारत',
  'country.cn': '中国',
  'country.kr': '대한민국',
  'country.hk': '香港',
  'country.tw': '臺灣',
  'country.vn': 'Việt Nam',
  'country.ph': 'Pilipinas',
  'country.nz': 'New Zealand',
  'country.br': 'Brasil',
  'country.mx': 'México',
  'country.tr': 'Türkiye',
  'country.za': 'South Africa',
  'country.ae': 'الإمارات',
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
    document: 'travel.state.gov, Passport Photos / Uploading a Digital Photo',
    checked: '2026-09-17',
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
  'fr-passport': {
    native: 'Passeport, carte nationale d’identité',
    authority: 'Service-Public.fr / Ministère chargé de l’intérieur',
    document: 'Quelle photo fournir pour un titre d’identité ?',
    checked: '2026-09-17',
  },
  'it-passport': {
    native: 'Passaporto',
    authority: 'Polizia di Stato',
    document: 'Le fotografie per il passaporto, conformi allo standard ICAO',
    checked: '2026-09-17',
  },
  'nl-passport': {
    native: 'Paspoort, identiteitskaart, rijbewijs',
    authority: 'Rijksdienst voor Identiteitsgegevens',
    document: 'Fotomatrix 2020, photo specification guidelines',
    checked: '2026-09-17',
  },
  'es-passport': {
    native: 'Pasaporte, Documento Nacional de Identidad',
    authority: 'Ministerio del Interior',
    document: 'Pasaporte, procedimiento de expedición',
    checked: '2026-09-17',
  },
  'ie-passport': {
    native: 'Pas',
    authority: 'Department of Foreign Affairs',
    document: 'ireland.ie, Passport photo guidelines',
    checked: '2026-09-17',
  },
  'pl-passport': {
    native: 'Paszport, dowód osobisty',
    authority: 'Ministerstwo Spraw Wewnętrznych i Administracji',
    document: 'Nowe zdjęcia do paszportu, instrukcja wykonywania zdjęć',
    checked: '2026-09-17',
  },
  'ch-passport': {
    authority: 'fedpol',
    document: 'Kriterien für die Annahme von Fotos für Pässe und Identitätskarten',
    checked: '2026-09-17',
  },
  'se-passport': {
    native: 'Pass, nationellt id-kort',
    authority: 'Polismyndigheten',
    document: 'polisen.se, Svar på vanliga frågor om pass',
    checked: '2026-09-17',
  },
  'no-passport': {
    native: 'Pass, nasjonalt ID-kort',
    authority: 'Politiet',
    document: 'Kvalitetskrav til ansiktsfoto i pass og nasjonale ID-kort',
    checked: '2026-09-17',
  },
  'pt-passport': {
    native: 'Cartão de Cidadão, passaporte',
    authority: 'Instituto dos Registos e do Notariado',
    document: 'irn.justica.gov.pt, Cartão de Cidadão',
    checked: '2026-09-17',
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
  'kr-passport': {
    native: '여권',
    authority: '외교부 (Ministry of Foreign Affairs)',
    document: '여권안내 — 여권사진 규격 안내 <2022. 10. 개정>',
    checked: '2026-09-17',
  },
  'sg-passport': {
    authority: 'Immigration & Checkpoints Authority',
    document: 'ica.gov.sg, Photo Guidelines',
    checked: '2026-09-17',
  },
  'hk-passport': {
    native: '特區護照',
    authority: 'Immigration Department, HKSAR',
    document: 'Photograph Requirements for Travel Document',
    checked: '2026-09-19',
  },
  'hk-passport-online': {
    authority: 'Immigration Department, HKSAR',
    document: 'Photograph Requirements for Travel Document',
    checked: '2026-09-19',
  },
  'tw-passport': {
    native: '護照',
    authority: '外交部領事事務局',
    document: '晶片護照照片規格',
    checked: '2026-09-19',
  },
  'vn-passport': {
    native: 'Hộ chiếu',
    authority: 'Cục Quản lý xuất nhập cảnh, Bộ Công an',
    document: 'Tờ khai điện tử đề nghị cấp hộ chiếu',
    checked: '2026-09-19',
  },
  'ph-passport': {
    native: 'Pasaporte',
    authority: 'Department of Foreign Affairs, Office of Consular Affairs',
    document: 'consular.dfa.gov.ph, Passport — General Information',
    checked: '2026-09-19',
  },
  'nz-passport': {
    authority: 'Department of Internal Affairs',
    document: 'passports.govt.nz, Passport photos',
    checked: '2026-09-17',
  },
  'br-passport': {
    native: 'Passaporte',
    authority: 'Ministério das Relações Exteriores',
    document: 'Especificações da Fotografia para o Pedido de Passaporte',
    checked: '2026-09-19',
  },
  'mx-passport': {
    native: 'Pasaporte',
    authority: 'Secretaría de Relaciones Exteriores',
    document: 'Ejemplos de cómo deben ser las fotografías para trámite de pasaporte',
    checked: '2026-09-19',
  },
  'tr-passport': {
    native: 'Pasaport, kimlik kartı, sürücü belgesi',
    authority: 'Nüfus ve Vatandaşlık İşleri Genel Müdürlüğü',
    document: 'Biyometrik Fotoğraf Özellikleri',
    checked: '2026-09-19',
  },
  'za-passport': {
    authority: 'Department of Home Affairs',
    document: 'Passport & ID Photograph Specifications',
    checked: '2026-09-19',
  },
  'ae-passport': {
    authority: 'Federal Authority for Identity, Citizenship, Customs & Port Security',
    document: 'Personal Photo Specifications',
    checked: '2026-09-19',
  },
};
