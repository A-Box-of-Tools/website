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
 * whole module stays names and official publication addresses. The exemption is only honest while
 * that holds, so tests/js/id-photo-sources.test.js asserts the shape rather
 * than trusting it: every id a rule that exists, every name short, every URL an
 * HTTPS address, and none of the names a sentence.
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
    url: 'https://www.icao.int/publications/documents/9303_p3_cons_en.pdf',
    checked: '2026-08-20',
  },
  'us-passport': {
    authority: 'U.S. Department of State',
    document: 'travel.state.gov, Passport Photos / Uploading a Digital Photo',
    url: 'https://travel.state.gov/en/passports/apply/help/photos.html',
    checked: '2026-09-17',
  },
  'us-visa': {
    authority: 'U.S. Department of State',
    document: 'travel.state.gov, Photo Requirements / Digital Image Requirements / Composition Template',
    url: 'https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos.html',
    checked: '2026-10-12',
  },
  'us-dv': {
    authority: 'U.S. Department of State',
    document: 'travel.state.gov, Photo Requirements, Diversity Visa (DV) Program',
    url: 'https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos.html',
    checked: '2026-08-20',
  },
  'uk-passport': {
    authority: 'HM Passport Office',
    document: 'gov.uk, Passport photo requirements',
    url: 'https://www.gov.uk/photos-for-passports',
    checked: '2026-08-20',
  },
  'uk-ni-driving-licence': {
    authority: 'nidirect, for the Driver & Vehicle Agency',
    document: 'The photo for your driving licence',
    url: 'https://www.nidirect.gov.uk/articles/photo-your-driving-licence',
    checked: '2026-09-21',
  },
  schengen: {
    authority: 'European Commission',
    document: 'Visa Code, common photograph standards (ICAO-aligned)',
    url: 'https://home-affairs.ec.europa.eu/system/files/2016-12/icao_photograph_guidelines_en.pdf',
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
    url: 'https://www.germany.info/resource/blob/1216632/c66e7e46592ebf65c7e1ab4281a234a4/pass-passbild-schablone-data.pdf',
    checked: '2026-08-20',
  },
  'de-health-card': {
    native: 'Gesundheitskarte',
    authority: 'Techniker Krankenkasse',
    document: 'Wie muss das Bild für die Versichertenkarte aussehen?',
    url: 'https://www.tk.de/techniker/versicherung/tk-leistungen/versichertenkarte/gesundheitskarte-bild/aussehen-passbild-versichertenkarte-2002316',
    checked: '2026-09-21',
  },
  'fr-passport': {
    native: 'Passeport, carte nationale d’identité',
    authority: 'Service-Public.fr / Ministère chargé de l’intérieur',
    document: 'Quelle photo fournir pour un titre d’identité ?',
    url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F10619',
    checked: '2026-09-17',
  },
  'it-passport': {
    native: 'Passaporto',
    authority: 'Polizia di Stato',
    document: 'Le fotografie per il passaporto, conformi allo standard ICAO',
    url: 'https://questure.poliziadistato.it/statics/35/foto-per-passaporto.pdf',
    checked: '2026-09-17',
  },
  'it-id-card': {
    native: 'Carta d’identità elettronica',
    authority: 'Ministero dell’Interno',
    document: 'Carta d’identità elettronica, Modalità di acquisizione delle foto',
    url: 'https://www.cartaidentita.interno.gov.it/richiedi/modalita-di-acquisizione-delle-foto/',
    checked: '2026-09-21',
  },
  'it-driving-licence': {
    native: 'Patente di guida',
    authority: 'Ministero delle Infrastrutture e dei Trasporti, Motorizzazione',
    document: 'Fotografie da apporre sulla patente di guida, protocollo 23176/8.3 del 20 ottobre 2016',
    url: 'https://www.ilportaledellautomobilista.it/web/portale-automobilista/-/fotografie-da-apporre-sulla-patente-di-guida',
    checked: '2026-09-21',
  },
  'nl-passport': {
    native: 'Paspoort, identiteitskaart, rijbewijs',
    authority: 'Rijksdienst voor Identiteitsgegevens',
    document: 'Fotomatrix 2020, photo specification guidelines',
    url: 'https://rvig.nl/fotomatrix',
    checked: '2026-09-17',
  },
  'es-passport': {
    native: 'Pasaporte, Documento Nacional de Identidad',
    authority: 'Ministerio del Interior',
    document: 'Pasaporte, procedimiento de expedición',
    url: 'https://www.interior.gob.es/opencms/es/servicios-al-ciudadano/tramites-y-gestiones/pasaporte/procedimiento-de-expedicion/',
    checked: '2026-09-17',
  },
  'es-driving-licence': {
    native: 'Permiso de conducir',
    authority: 'Dirección General de Tráfico',
    document: 'sede.dgt.gob.es, Renovación de permiso próximo a caducar',
    url: 'https://sede.dgt.gob.es/es/permisos-de-conducir/obtencion-y-gestion-de-permisos/renovacion-de-permiso-proximo-a-caducar/',
    checked: '2026-09-21',
  },
  'ie-passport': {
    native: 'Pas',
    authority: 'Department of Foreign Affairs',
    document: 'ireland.ie, Passport photo guidelines',
    url: 'https://www.ireland.ie/en/dfa/passports/photo-guidelines/',
    checked: '2026-09-17',
  },
  'pl-passport': {
    native: 'Paszport, dowód osobisty',
    authority: 'Ministerstwo Spraw Wewnętrznych i Administracji',
    document: 'Nowe zdjęcia do paszportu, instrukcja wykonywania zdjęć',
    url: 'https://www.gov.pl/attachment/f36a05f9-7f17-4c34-a2ae-ccbcb93c0116',
    checked: '2026-09-17',
  },
  'pl-driving-licence': {
    native: 'Prawo jazdy',
    authority: 'Ministerstwo Infrastruktury',
    document: 'gov.pl, Zdjęcie do prawa jazdy',
    url: 'https://www.gov.pl/web/gov/zdjecie-do-prawa-jazdy',
    checked: '2026-09-21',
  },
  'ch-passport': {
    authority: 'fedpol',
    document: 'Kriterien für die Annahme von Fotos für Pässe und Identitätskarten',
    url: 'https://www.fedpol.admin.ch/dam/fedpol/de/data/pass-id/fotomustertafel.pdf',
    checked: '2026-09-17',
  },
  'ch-driving-licence': {
    native: 'Führerausweis',
    authority: 'asa, Vereinigung der Strassenverkehrsämter',
    document: 'Qualitätskriterien für das Foto im neuen Führerausweis',
    url: 'https://www.sg.ch/content/dam/sgch/verkehr/strassenverkehr/formulare-und-merkbl%C3%A4tter/infobl%C3%A4tter/Anforderungen%20Foto%20F%C3%BChrerausweis',
    checked: '2026-09-21',
  },
  'se-passport': {
    native: 'Pass, nationellt id-kort',
    authority: 'Polismyndigheten',
    document: 'polisen.se, Svar på vanliga frågor om pass',
    url: 'https://polisen.se/tjanster-tillstand/pass-och-nationellt-id-kort/svar-pa-vanliga-fragor-om-pass/',
    checked: '2026-09-17',
  },
  'se-driving-licence': {
    native: 'Körkort',
    authority: 'Transportstyrelsen',
    document: 'Fotot på körkortet',
    url: 'https://www.transportstyrelsen.se/sv/vagtrafik/korkort/har-korkort/fornya-korkortet/fotot-pa-korkortet/',
    checked: '2026-09-21',
  },
  'dk-driving-licence': {
    native: 'Kørekort',
    authority: 'Færdselsstyrelsen',
    document: 'Foto til kørekort',
    url: 'https://www.fstyr.dk/publikationer/krav-til-koerekortfoto',
    checked: '2026-09-21',
  },
  'no-passport': {
    native: 'Pass, nasjonalt ID-kort',
    authority: 'Politiet',
    document: 'Kvalitetskrav til ansiktsfoto i pass og nasjonale ID-kort',
    url: 'https://www.politiet.no/globalassets/02-tjenester-admin/pass-og-id-kort/kvalitetskrav-til-passfoto.pdf',
    checked: '2026-09-17',
  },
  'pt-passport': {
    native: 'Cartão de Cidadão, passaporte',
    authority: 'Instituto dos Registos e do Notariado',
    document: 'irn.justica.gov.pt, Cartão de Cidadão',
    url: 'https://irn.justica.gov.pt/Documentos-de-Identificacao/Cartao-de-Cidadao',
    checked: '2026-09-17',
  },
  'ru-passport': {
    native: 'Загранпаспорт 10-летнего образца',
    authority: 'Посольство Российской Федерации в США',
    document: 'Оформление загранпаспорта, Приказ МИД России от 9 января 2025 г. N 01',
    url: 'https://www.kdmid.ru/regulatory-frameworks/orders/PR_%E2%84%9601_09.01.2025.docx',
    checked: '2026-09-19',
  },
  'ru-passport-5': {
    native: 'Загранпаспорт 5-летнего образца',
    authority: 'Посольство Российской Федерации в США',
    document: 'Оформление загранпаспорта, Приказ МИД России от 9 января 2025 г. N 02',
    url: 'https://www.kdmid.ru/regulatory-frameworks/orders/PR_%E2%84%9602_09.01.2025.docx',
    checked: '2026-09-19',
  },
  'ru-internal-passport': {
    native: 'Паспорт гражданина Российской Федерации',
    authority: 'Министерство внутренних дел Российской Федерации',
    document: 'Приказ МВД России от 16.11.2020 N 773, пункт 36',
    url: 'https://epp.genproc.gov.ru/upload/iblock/701/11rtwhq8z58el7ebz3gm0lqtlnz21y86.pdf',
    checked: '2026-09-21',
  },
  'ca-passport': {
    native: 'Passeport',
    authority: 'Immigration, Refugees and Citizenship Canada',
    document: 'canada.ca, Photo requirements for passports',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-passports/photos.html',
    checked: '2026-08-20',
  },
  'ca-pr-card': {
    native: 'Résidents permanents',
    authority: 'Immigration, Refugees and Citizenship Canada',
    document: 'canada.ca, Permanent resident photos',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/permanent-residents/card/photos.html',
    checked: '2026-09-19',
  },
  'ca-citizenship': {
    native: 'Citoyenneté',
    authority: 'Immigration, Refugees and Citizenship Canada',
    document: 'canada.ca, Citizenship photo specifications',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/citizenship-application-photograph-specifications.html',
    checked: '2026-09-19',
  },
  'ca-visa': {
    native: 'Visa de résident temporaire',
    authority: 'Immigration, Refugees and Citizenship Canada',
    document: 'canada.ca, Temporary Resident Visa application photograph specifications',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/temporary-resident-visa-application-photograph-specifications.html',
    checked: '2026-09-19',
  },
  'ca-firearms-licence': {
    authority: 'Royal Canadian Mounted Police',
    document: 'Photo requirements for a firearms licence',
    url: 'https://www.rcmp.ca/en/firearms/licensing/photo-requirements-firearms-licence',
    checked: '2026-09-21',
  },
  'au-passport': {
    authority: 'Australian Passport Office',
    document: 'passports.gov.au, Photo guidelines',
    url: 'https://www.passports.gov.au/passports-explained/how-apply/passport-photo-guidelines',
    checked: '2026-08-20',
  },
  'au-visa': {
    authority: 'Department of Home Affairs',
    document: 'Form 47OF, Application for migration to Australia by other family members',
    url: 'https://immi.homeaffairs.gov.au/form-listing/forms/47OF.pdf',
    checked: '2026-10-12',
  },
  'au-citizenship': {
    authority: 'Department of Home Affairs',
    document: 'immi.homeaffairs.gov.au, Photo requirements for citizenship applications',
    url: 'https://immi.homeaffairs.gov.au/citizenship/photo-requirements-for-citizenship-applications',
    checked: '2026-09-19',
  },
  'au-citizenship-online': {
    authority: 'Department of Home Affairs',
    document: 'immi.homeaffairs.gov.au, Photo requirements for citizenship applications',
    url: 'https://immi.homeaffairs.gov.au/citizenship/photo-requirements-for-citizenship-applications',
    checked: '2026-10-12',
  },
  'in-passport': {
    native: 'पासपोर्ट',
    authority: 'Ministry of External Affairs',
    document: 'Passport Seva, photo specifications',
    url: 'https://embassy6.passportindia.gov.in/AppMissionUIProject/pdf/GPSP_PhotoGraph_SOP.pdf',
    checked: '2026-08-20',
  },
  'in-visa': {
    authority: 'Government of India, Bureau of Immigration',
    document: 'India Visa Online, Online Visa Registration, Photo Uploading Process',
    url: 'https://indianvisaonline.gov.in/visa/VSS_IMAGE.pdf',
    checked: '2026-10-12',
  },
  'in-evisa': {
    authority: 'Government of India, Bureau of Immigration',
    document: 'indianvisaonline.gov.in, e-Visa',
    url: 'https://www.indianvisaonline.gov.in/evisa/tvoa.html',
    checked: '2026-10-12',
  },
  'in-driving-licence': {
    authority: 'Ministry of Road Transport & Highways, Sarathi Parivahan',
    document: 'Photo and Signature Scan & Upload Process',
    url: 'https://sarathi.parivahan.gov.in/sarathiservice/pdf/PhotoSign.pdf',
    checked: '2026-09-21',
  },
  'in-exam-photo': {
    authority: 'Institute of Banking Personnel Selection',
    document: 'CRP PO/MT XIII, Annexure III: Guidelines for scanning and Upload of Documents',
    url: 'https://www.ibps.in/wp-content/uploads/2024/01/Detailed_Notification_CRP_PO_XIII.pdf',
    checked: '2026-10-12',
  },
  'in-exam-signature': {
    authority: 'Institute of Banking Personnel Selection',
    document: 'CRP PO/MT XIII, Annexure III: Guidelines for scanning and Upload of Documents',
    url: 'https://www.ibps.in/wp-content/uploads/2024/01/Detailed_Notification_CRP_PO_XIII.pdf',
    checked: '2026-10-12',
  },
  'cn-passport': {
    native: '护照',
    authority: 'National Immigration Administration',
    document: 'Published photograph standard for exit and entry documents',
    url: 'https://chicago.china-consulate.gov.cn/lsfw/zj/hzlxz/202605/t20260501_11903971.htm',
    checked: '2026-08-20',
  },
  'cn-id-card': {
    native: '居民身份证',
    authority: '北京市公安局',
    document: '居民身份证照片标准，引《居民身份证制证用数字相片技术要求》GA461—2004',
    url: 'https://gaj.beijing.gov.cn/hudong/rddf/202003/t20200331_1771797.html',
    checked: '2026-09-21',
  },
  'cn-driving-licence': {
    native: '机动车驾驶证',
    authority: '北京市公安局公安交通管理局',
    document: '驾驶人相片要求',
    url: 'https://jtgl.beijing.gov.cn/jgj/qaknowledge/d6e41d3a-7.html',
    checked: '2026-09-21',
  },
  'jp-passport': {
    native: '旅券（パスポート）',
    authority: 'Ministry of Foreign Affairs of Japan',
    document: 'Passport photograph standards',
    url: 'https://www.mofa.go.jp/mofaj/toko/passport/ic_photo.html',
    checked: '2026-08-20',
  },
  'jp-mynumber': {
    native: 'マイナンバーカード',
    authority: '地方公共団体情報システム機構',
    document: 'マイナンバーカード総合サイト、顔写真のチェックポイント',
    url: 'https://www.kojinbango-card.go.jp/apprec/apply/facephoto/',
    checked: '2026-09-21',
  },
  'jp-residence-card': {
    native: '在留カード',
    authority: '出入国在留管理庁',
    document: '提出写真の規格',
    url: 'https://www.moj.go.jp/isa/applications/status/photo_info00002.html',
    checked: '2026-09-21',
  },
  'jp-driving-licence': {
    native: '運転免許証',
    authority: '警視庁',
    document: '申請用写真及び持参写真のご案内',
    url: 'https://www.keishicho.metro.tokyo.lg.jp/menkyo/koshin/koshin/koshin02_2.html',
    checked: '2026-09-21',
  },
  'kr-passport': {
    native: '여권',
    authority: '외교부 (Ministry of Foreign Affairs)',
    document: '여권안내 — 여권사진 규격 안내 <2022. 10. 개정>',
    url: 'https://passport.go.kr/home/kor/contents.do?menuPos=32',
    checked: '2026-09-17',
  },
  'kr-driving-licence': {
    native: '운전면허증',
    authority: '한국도로교통공단',
    document: '안전운전 통합민원, 허용되는 사진 규격',
    url: 'https://www.safedriving.or.kr/commonManage/selectCommonPhotoRulePop.do',
    checked: '2026-09-21',
  },
  'kr-id-card': {
    native: '주민등록증',
    authority: '행정안전부',
    document: '주민등록증, 사진',
    url: 'https://mois.go.kr/frt/sub/a06/b06/IDCard_5/screen.do',
    checked: '2026-09-21',
  },
  'sg-passport': {
    authority: 'Immigration & Checkpoints Authority',
    document: 'ica.gov.sg, Photo Guidelines',
    url: 'https://www.ica.gov.sg/photo-guidelines',
    checked: '2026-09-17',
  },
  'hk-passport': {
    native: '特區護照',
    authority: 'Immigration Department, HKSAR',
    document: 'Photograph Requirements for Travel Document',
    url: 'https://www.immd.gov.hk/eng/residents/immigration/traveldoc/photorequirements.html',
    checked: '2026-09-19',
  },
  'hk-passport-online': {
    authority: 'Immigration Department, HKSAR',
    document: 'Photograph Requirements for Travel Document',
    url: 'https://www.immd.gov.hk/eng/residents/immigration/traveldoc/photorequirements.html',
    checked: '2026-09-19',
  },
  'tw-passport': {
    native: '護照',
    authority: '外交部領事事務局',
    document: '晶片護照照片規格',
    url: 'https://www.boca.gov.tw/fp-25-4123-c2932-1.html',
    checked: '2026-09-19',
  },
  'tw-id-card': {
    native: '國民身分證',
    authority: '內政部戶政司',
    document: '國民身分證相片規格',
    url: 'https://www.ris.gov.tw/documents/html/5/3/187.html',
    checked: '2026-09-21',
  },
  'vn-passport': {
    native: 'Hộ chiếu',
    authority: 'Cục Quản lý xuất nhập cảnh, Bộ Công an',
    document: 'Tờ khai điện tử đề nghị cấp hộ chiếu',
    url: 'https://hochieu.xuatnhapcanh.gov.vn/faces/faq.jspx',
    checked: '2026-09-19',
  },
  'vn-driving-licence': {
    native: 'Giấy phép lái xe',
    authority: 'Cục Cảnh sát giao thông, Bộ Công an',
    document: 'Cổng dịch vụ công cấp đổi, cấp lại giấy phép lái xe',
    url: 'https://dvc-gplx.csgt.bocongan.gov.vn/p/home/dvc-cap-doi-gplx.html',
    checked: '2026-09-21',
  },
  'ph-passport': {
    native: 'Pasaporte',
    authority: 'Department of Foreign Affairs, Embassy of the Philippines in Rome',
    document: 'Requirements for regular passport application',
    url: 'https://romepe.dfa.gov.ph/images/2018/Forms/Passport-Requirements.pdf',
    checked: '2026-10-12',
  },
  'pk-passport': {
    native: 'پاسپورٹ',
    authority: 'Directorate General of Immigration & Passports',
    document: 'e-Services Portal, Photograph Requirements',
    url: 'https://dgip.gov.pk/eServices/online-passport.php',
    checked: '2026-09-19',
  },
  'bd-passport': {
    native: 'পাসপোর্ট',
    authority: 'Department of Immigration & Passports',
    document: 'epassport.gov.bd, Instructions',
    url: 'https://www.epassport.gov.bd/landing/faqs/4',
    checked: '2026-09-19',
  },
  'bd-passport-child': {
    authority: 'Department of Immigration & Passports',
    document: 'epassport.gov.bd, Instructions',
    url: 'https://www.epassport.gov.bd/landing/faqs/4',
    checked: '2026-09-19',
  },
  'id-passport': {
    native: 'Paspor',
    authority: 'Direktorat Jenderal Imigrasi, Kantor Imigrasi Kelas I Non TPI Bogor',
    document: 'Layanan Warga Negara Indonesia, Permohonan Paspor Baru',
    url: 'https://bogor.imigrasi.go.id/layanan-warga-negara-indonesia/',
    checked: '2026-10-12',
  },
  'id-driving-licence': {
    native: 'Surat Izin Mengemudi',
    authority: 'Korps Lalu Lintas Polri',
    document: 'Digital Korlantas, perpanjangan SIM',
    url: 'https://www.digitalkorlantas.id/sim/',
    checked: '2026-09-21',
  },
  'my-passport': {
    native: 'Pasport Malaysia',
    authority: 'Kementerian Luar Negeri, Suruhanjaya Tinggi Malaysia Islamabad',
    document: 'Passport Renewal',
    url: 'https://www.kln.gov.my/web/pak_islamabad/passport_renewal',
    checked: '2026-09-19',
  },
  'my-expat-pass': {
    authority: 'Jabatan Imigresen Malaysia, Expatriate Services Division',
    document: 'ESD Online, Passport Photo Requirements',
    url: 'https://esd.imi.gov.my/portal/photo-requirements/',
    checked: '2026-09-19',
  },
  'my-driving-licence': {
    native: 'Lesen memandu',
    authority: 'Jabatan Pengangkutan Jalan Malaysia',
    document: 'Pembaharuan Lesen Memandu Kompeten',
    url: 'https://www.jpj.gov.my/pusat-media-3/informasi-perkhidmatan-jpj/pemandu/pembaharuan-lesen-memandu-kompeten-cdl/',
    checked: '2026-09-21',
  },
  'th-passport': {
    native: 'หนังสือเดินทาง',
    authority: 'Royal Thai Embassy, Washington DC',
    document: 'Thai Passport',
    url: 'https://washingtondc.thaiembassy.org/en/page/thai-passport',
    checked: '2026-09-19',
  },
  'th-evisa': {
    authority: 'Ministry of Foreign Affairs of the Kingdom of Thailand',
    document: 'Photograph Specifications (e-Visa), Guide to Thailand E-Visa Application',
    url: 'https://singapore.thaiembassy.org/en/page/photograph-specifications-e-visa',
    checked: '2026-09-19',
  },
  'nz-passport': {
    authority: 'Department of Internal Affairs',
    document: 'passports.govt.nz, Passport photos',
    url: 'https://www.passports.govt.nz/passport-photos',
    checked: '2026-09-17',
  },
  'br-passport': {
    native: 'Passaporte',
    authority: 'Ministério das Relações Exteriores',
    document: 'Especificações da Fotografia para o Pedido de Passaporte',
    url: 'https://www.gov.br/mre/pt-br/recuperacao-dados-marselha/consulado-marselha/servicos-consulares/passaporte/especificacoes-da-fotografia-para-o-pedido-de-passaporte',
    checked: '2026-09-19',
  },
  'mx-passport': {
    native: 'Pasaporte',
    authority: 'Secretaría de Relaciones Exteriores',
    document: 'Ejemplos de cómo deben ser las fotografías para trámite de pasaporte',
    url: 'https://consulmex.sre.gob.mx/frankfurt/images/stories/pdf/fotosejemp.pdf',
    checked: '2026-09-19',
  },
  'ar-passport': {
    native: 'Pasaporte',
    authority: 'Consulado General de la República Argentina en Roma',
    document: 'Requisitos para la tramitación de pasaporte argentino',
    url: 'https://croma.cancilleria.gob.ar/es/node/73992',
    checked: '2026-09-19',
  },
  'ar-emergency': {
    native: 'Pasaporte de emergencia, pasaporte provisorio',
    authority: 'Consulado General de la República Argentina en Roma',
    document: 'Requisitos para la tramitación de pasaporte argentino',
    url: 'https://croma.cancilleria.gob.ar/es/node/73992',
    checked: '2026-09-19',
  },
  'tr-passport': {
    native: 'Pasaport, kimlik kartı, sürücü belgesi',
    authority: 'Nüfus ve Vatandaşlık İşleri Genel Müdürlüğü',
    document: 'Biyometrik Fotoğraf Özellikleri',
    url: 'https://www.nvi.gov.tr/istanbul/biyometrik-fotograf-nasil-olmalidir',
    checked: '2026-09-19',
  },
  'za-passport': {
    authority: 'Department of Home Affairs',
    document: 'Passport & ID Photograph Specifications',
    url: 'https://stanonprodmtpdxpzan.blob.core.windows.net/dxp/2024-04/dha-passport-id-photo-specifications.pdf',
    checked: '2026-09-19',
  },
  'za-driving-licence': {
    authority: 'Western Cape Government, Mobility',
    document: 'Driving licence',
    url: 'https://www.westerncape.gov.za/service/driving-licence',
    checked: '2026-09-21',
  },
  'ae-passport': {
    authority: 'Federal Authority for Identity, Citizenship, Customs & Port Security',
    document: 'Personal Photo Specifications',
    url: 'https://icp.gov.ae/wp-content/uploads/2021/11/icao_english.pdf',
    checked: '2026-09-19',
  },
  'sa-evisa': {
    authority: 'Saudi eVisa, visa.visitsaudi.com',
    document: 'Photo Specifications',
    url: 'https://visa.visitsaudi.com/Home/PhotoSpecifications',
    checked: '2026-09-19',
  },
  'il-passport': {
    native: 'דרכון',
    authority: 'Ministry of Foreign Affairs, Embassy of Israel in London',
    document: 'Issuance of travel documents (passport) for citizens and residents',
    url: 'https://embassies.gov.il/england/en/services/israeli-citizens/issuance-travel-documents-passport-citizens-and-residents-israel',
    checked: '2026-09-19',
  },
  'eg-passport': {
    native: 'جواز سفر',
    authority: 'Consulate General of Egypt in London',
    document: 'egyptconsulate.co.uk, Egyptian Passport',
    url: 'https://egyptconsulate.co.uk/ar/consular-services/egyptian-passport',
    checked: '2026-09-19',
  },
  'ng-passport': {
    authority: 'Nigeria Immigration Service',
    document: 'Passport Application Portal, Passport Photo Dimensions Instructions',
    url: 'https://passport.immigration.gov.ng/',
    checked: '2026-09-19',
  },
};
