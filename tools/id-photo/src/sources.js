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
  'country.ru': 'Россия',
  'country.dk': 'Danmark',
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
  'country.pk': 'پاکستان',
  'country.bd': 'বাংলাদেশ',
  'country.id': 'Indonesia',
  'country.my': 'Malaysia',
  'country.th': 'ประเทศไทย',
  'country.nz': 'New Zealand',
  'country.br': 'Brasil',
  'country.mx': 'México',
  'country.ar': 'Argentina',
  'country.tr': 'Türkiye',
  'country.za': 'South Africa',
  'country.ae': 'الإمارات',
  'country.sa': 'السعودية',
  'country.il': 'ישראל',
  'country.eg': 'مصر',
  'country.ng': 'Nigeria',
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
  'us-visa': {
    authority: 'U.S. Department of State',
    document: 'travel.state.gov, Photo Requirements / Digital Image Requirements / Composition Template',
    checked: '2026-09-19',
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
  'uk-ni-driving-licence': {
    authority: 'nidirect, for the Driver & Vehicle Agency',
    document: 'The photo for your driving licence',
    checked: '2026-09-21',
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
  'de-health-card': {
    native: 'Gesundheitskarte',
    authority: 'Techniker Krankenkasse',
    document: 'Wie muss das Bild für die Versichertenkarte aussehen?',
    checked: '2026-09-21',
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
  'it-id-card': {
    native: 'Carta d’identità elettronica',
    authority: 'Ministero dell’Interno',
    document: 'Carta d’identità elettronica, Modalità di acquisizione delle foto',
    checked: '2026-09-21',
  },
  'it-driving-licence': {
    native: 'Patente di guida',
    authority: 'Ministero delle Infrastrutture e dei Trasporti, Motorizzazione',
    document: 'Fotografie da apporre sulla patente di guida, protocollo 23176/8.3 del 20 ottobre 2016',
    checked: '2026-09-21',
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
  'es-driving-licence': {
    native: 'Permiso de conducir',
    authority: 'Dirección General de Tráfico',
    document: 'sede.dgt.gob.es, Renovación de permiso próximo a caducar',
    checked: '2026-09-21',
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
  'pl-driving-licence': {
    native: 'Prawo jazdy',
    authority: 'Ministerstwo Infrastruktury',
    document: 'gov.pl, Zdjęcie do prawa jazdy',
    checked: '2026-09-21',
  },
  'ch-passport': {
    authority: 'fedpol',
    document: 'Kriterien für die Annahme von Fotos für Pässe und Identitätskarten',
    checked: '2026-09-17',
  },
  'ch-driving-licence': {
    native: 'Führerausweis',
    authority: 'asa, Vereinigung der Strassenverkehrsämter',
    document: 'Qualitätskriterien für das Foto im neuen Führerausweis',
    checked: '2026-09-21',
  },
  'se-passport': {
    native: 'Pass, nationellt id-kort',
    authority: 'Polismyndigheten',
    document: 'polisen.se, Svar på vanliga frågor om pass',
    checked: '2026-09-17',
  },
  'se-driving-licence': {
    native: 'Körkort',
    authority: 'Transportstyrelsen',
    document: 'Fotot på körkortet',
    checked: '2026-09-21',
  },
  'dk-driving-licence': {
    native: 'Kørekort',
    authority: 'Færdselsstyrelsen',
    document: 'Foto til kørekort',
    checked: '2026-09-21',
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
  'ru-passport': {
    native: 'Загранпаспорт 10-летнего образца',
    authority: 'Посольство Российской Федерации в США',
    document: 'Оформление загранпаспорта, Приказ МИД России от 9 января 2025 г. N 01',
    checked: '2026-09-19',
  },
  'ru-passport-5': {
    native: 'Загранпаспорт 5-летнего образца',
    authority: 'Посольство Российской Федерации в США',
    document: 'Оформление загранпаспорта, Приказ МИД России от 9 января 2025 г. N 02',
    checked: '2026-09-19',
  },
  'ru-internal-passport': {
    native: 'Паспорт гражданина Российской Федерации',
    authority: 'Министерство внутренних дел Российской Федерации',
    document: 'Приказ МВД России от 16.11.2020 N 773, пункт 36',
    checked: '2026-09-21',
  },
  'ca-passport': {
    native: 'Passeport',
    authority: 'Immigration, Refugees and Citizenship Canada',
    document: 'canada.ca, Photo requirements for passports',
    checked: '2026-08-20',
  },
  'ca-pr-card': {
    native: 'Résidents permanents',
    authority: 'Immigration, Refugees and Citizenship Canada',
    document: 'canada.ca, Permanent resident photos',
    checked: '2026-09-19',
  },
  'ca-citizenship': {
    native: 'Citoyenneté',
    authority: 'Immigration, Refugees and Citizenship Canada',
    document: 'canada.ca, Citizenship photo specifications',
    checked: '2026-09-19',
  },
  'ca-visa': {
    native: 'Visa de résident temporaire',
    authority: 'Immigration, Refugees and Citizenship Canada',
    document: 'canada.ca, Temporary Resident Visa application photograph specifications',
    checked: '2026-09-19',
  },
  'ca-firearms-licence': {
    authority: 'Royal Canadian Mounted Police',
    document: 'Photo requirements for a firearms licence',
    checked: '2026-09-21',
  },
  'au-passport': {
    authority: 'Australian Passport Office',
    document: 'passports.gov.au, Photo guidelines',
    checked: '2026-08-20',
  },
  'au-visa': {
    authority: 'Department of Home Affairs',
    document: 'immi.homeaffairs.gov.au, Photograph - Passport',
    checked: '2026-09-19',
  },
  'au-citizenship': {
    authority: 'Department of Home Affairs',
    document: 'immi.homeaffairs.gov.au, Photo requirements for citizenship applications',
    checked: '2026-09-19',
  },
  'au-citizenship-online': {
    authority: 'Department of Home Affairs',
    document: 'immi.homeaffairs.gov.au, Photo requirements for citizenship applications',
    checked: '2026-09-19',
  },
  'in-passport': {
    native: 'पासपोर्ट',
    authority: 'Ministry of External Affairs',
    document: 'Passport Seva, photo specifications',
    checked: '2026-08-20',
  },
  'in-visa': {
    authority: 'Government of India, Bureau of Immigration',
    document: 'India Visa Online, Instructions, Photo Requirements',
    checked: '2026-09-19',
  },
  'in-evisa': {
    authority: 'Government of India, Bureau of Immigration',
    document: 'indianvisaonline.gov.in, e-Visa',
    checked: '2026-09-19',
  },
  'in-driving-licence': {
    authority: 'Ministry of Road Transport & Highways, Sarathi Parivahan',
    document: 'Photo and Signature Scan & Upload Process',
    checked: '2026-09-21',
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
  'cn-id-card': {
    native: '居民身份证',
    authority: '北京市公安局',
    document: '居民身份证照片标准，引《居民身份证制证用数字相片技术要求》GA461—2004',
    checked: '2026-09-21',
  },
  'cn-driving-licence': {
    native: '机动车驾驶证',
    authority: '北京市公安局公安交通管理局',
    document: '驾驶人相片要求',
    checked: '2026-09-21',
  },
  'jp-passport': {
    native: '旅券（パスポート）',
    authority: 'Ministry of Foreign Affairs of Japan',
    document: 'Passport photograph standards',
    checked: '2026-08-20',
  },
  'jp-mynumber': {
    native: 'マイナンバーカード',
    authority: '地方公共団体情報システム機構',
    document: 'マイナンバーカード総合サイト、顔写真のチェックポイント',
    checked: '2026-09-21',
  },
  'jp-residence-card': {
    native: '在留カード',
    authority: '出入国在留管理庁',
    document: '提出写真の規格',
    checked: '2026-09-21',
  },
  'jp-driving-licence': {
    native: '運転免許証',
    authority: '警視庁',
    document: '申請用写真及び持参写真のご案内',
    checked: '2026-09-21',
  },
  'kr-passport': {
    native: '여권',
    authority: '외교부 (Ministry of Foreign Affairs)',
    document: '여권안내 — 여권사진 규격 안내 <2022. 10. 개정>',
    checked: '2026-09-17',
  },
  'kr-driving-licence': {
    native: '운전면허증',
    authority: '한국도로교통공단',
    document: '안전운전 통합민원, 허용되는 사진 규격',
    checked: '2026-09-21',
  },
  'kr-id-card': {
    native: '주민등록증',
    authority: '행정안전부',
    document: '주민등록증, 사진',
    checked: '2026-09-21',
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
  'tw-id-card': {
    native: '國民身分證',
    authority: '內政部戶政司',
    document: '國民身分證相片規格',
    checked: '2026-09-21',
  },
  'vn-passport': {
    native: 'Hộ chiếu',
    authority: 'Cục Quản lý xuất nhập cảnh, Bộ Công an',
    document: 'Tờ khai điện tử đề nghị cấp hộ chiếu',
    checked: '2026-09-19',
  },
  'vn-driving-licence': {
    native: 'Giấy phép lái xe',
    authority: 'Cục Cảnh sát giao thông, Bộ Công an',
    document: 'Cổng dịch vụ công cấp đổi, cấp lại giấy phép lái xe',
    checked: '2026-09-21',
  },
  'ph-passport': {
    native: 'Pasaporte',
    authority: 'Department of Foreign Affairs, Office of Consular Affairs',
    document: 'consular.dfa.gov.ph, Passport — General Information',
    checked: '2026-09-19',
  },
  'pk-passport': {
    native: 'پاسپورٹ',
    authority: 'Directorate General of Immigration & Passports',
    document: 'e-Services Portal, Photograph Requirements',
    checked: '2026-09-19',
  },
  'bd-passport': {
    native: 'পাসপোর্ট',
    authority: 'Department of Immigration & Passports',
    document: 'epassport.gov.bd, Instructions',
    checked: '2026-09-19',
  },
  'bd-passport-child': {
    authority: 'Department of Immigration & Passports',
    document: 'epassport.gov.bd, Instructions',
    checked: '2026-09-19',
  },
  'id-passport': {
    native: 'Paspor',
    authority: 'Direktorat Jenderal Imigrasi, Kantor Imigrasi Kelas I TPI Malang',
    document: 'Kata Siapa Foto Paspor Nggak Boleh Diulang?',
    checked: '2026-09-19',
  },
  'id-driving-licence': {
    native: 'Surat Izin Mengemudi',
    authority: 'Korps Lalu Lintas Polri',
    document: 'Digital Korlantas, perpanjangan SIM',
    checked: '2026-09-21',
  },
  'my-passport': {
    native: 'Pasport Malaysia',
    authority: 'Kementerian Luar Negeri, Suruhanjaya Tinggi Malaysia Islamabad',
    document: 'Passport Renewal',
    checked: '2026-09-19',
  },
  'my-expat-pass': {
    authority: 'Jabatan Imigresen Malaysia, Expatriate Services Division',
    document: 'ESD Online, Passport Photo Requirements',
    checked: '2026-09-19',
  },
  'my-driving-licence': {
    native: 'Lesen memandu',
    authority: 'Jabatan Pengangkutan Jalan Malaysia',
    document: 'Pembaharuan Lesen Memandu Kompeten',
    checked: '2026-09-21',
  },
  'th-passport': {
    native: 'หนังสือเดินทาง',
    authority: 'Royal Thai Embassy, Washington DC',
    document: 'Thai Passport',
    checked: '2026-09-19',
  },
  'th-evisa': {
    authority: 'Ministry of Foreign Affairs of the Kingdom of Thailand',
    document: 'Photograph Specifications (e-Visa), Guide to Thailand E-Visa Application',
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
  'ar-passport': {
    native: 'Pasaporte',
    authority: 'Consulado General de la República Argentina en Roma',
    document: 'Requisitos para la tramitación de pasaporte argentino',
    checked: '2026-09-19',
  },
  'ar-emergency': {
    native: 'Pasaporte de emergencia, pasaporte provisorio',
    authority: 'Consulado General de la República Argentina en Roma',
    document: 'Requisitos para la tramitación de pasaporte argentino',
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
  'za-driving-licence': {
    authority: 'Western Cape Government, Mobility',
    document: 'Driving licence',
    checked: '2026-09-21',
  },
  'ae-passport': {
    authority: 'Federal Authority for Identity, Citizenship, Customs & Port Security',
    document: 'Personal Photo Specifications',
    checked: '2026-09-19',
  },
  'sa-evisa': {
    authority: 'Saudi eVisa, visa.visitsaudi.com',
    document: 'Photo Specifications',
    checked: '2026-09-19',
  },
  'il-passport': {
    native: 'דרכון',
    authority: 'Ministry of Foreign Affairs, Embassy of Israel in London',
    document: 'Issuance of travel documents (passport) for citizens and residents',
    checked: '2026-09-19',
  },
  'eg-passport': {
    native: 'جواز سفر',
    authority: 'Consulate General of Egypt in London',
    document: 'egyptconsulate.co.uk, Egyptian Passport',
    checked: '2026-09-19',
  },
  'ng-passport': {
    authority: 'Nigeria Immigration Service',
    document: 'Passport Application Portal, Passport Photo Dimensions Instructions',
    checked: '2026-09-19',
  },
};
