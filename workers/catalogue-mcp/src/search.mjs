const LOCALE = /^[a-z]{2}(?:-[A-Za-z]{2})?$/;
const URL_PATH = /^\/(?:[a-zA-Z0-9-]+\/)+$/;
const validated = new WeakSet();

export function validQuery(query) {
  return typeof query === 'string' && Array.from(query).length <= 200
    && !/[\u0000-\u001f\u007f]/u.test(query) && query.isWellFormed();
}

export function validateCatalogue(catalogue) {
  if (catalogue && validated.has(catalogue)) return catalogue;
  if (!catalogue || catalogue.schemaVersion !== 1 || !catalogue.locales
      || !Object.hasOwn(catalogue.locales, 'en')) throw new TypeError('Invalid catalogue');
  if (!catalogue.build || typeof catalogue.build.version !== 'string'
      || !/^\d+\.\d+\.\d+\+[a-zA-Z0-9.-]+$/.test(catalogue.build.version)
      || !/^[0-9a-f]{40}$/.test(catalogue.build.revision)
      || typeof catalogue.build.dirty !== 'boolean') throw new TypeError('Invalid build identity');
  for (const [locale, section] of Object.entries(catalogue.locales)) {
    if (!LOCALE.test(locale) || typeof section.language !== 'string'
        || !Array.isArray(section.tools) || !section.tools.length) throw new TypeError('Invalid locale');
    const seen = new Set();
    for (const tool of section.tools) {
      if (typeof tool.name !== 'string' || !tool.name.trim()
          || typeof tool.description !== 'string' || !tool.description.trim()
          || typeof tool.url !== 'string') throw new TypeError('Invalid tool');
      const url = new URL(tool.url);
      if (url.origin !== 'https://abox.tools' || !URL_PATH.test(url.pathname)
          || url.username || url.password || url.search || url.hash || seen.has(url.href)) {
        throw new TypeError('Invalid tool URL');
      }
      seen.add(url.href);
      Object.freeze(tool);
    }
    Object.freeze(section.tools);
    Object.freeze(section);
  }
  Object.freeze(catalogue.locales);
  Object.freeze(catalogue.build);
  Object.freeze(catalogue);
  validated.add(catalogue);
  return catalogue;
}

function fold(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[-\u2010-\u2015\u2212]/g, '').replace(/\bjpeg\b/g, 'jpg');
}

export function matchingTools(catalogue, query, locale) {
  if (!validQuery(query) || !Object.hasOwn(catalogue.locales, locale)) {
    throw new TypeError('Invalid public catalogue query or language');
  }
  const words = fold(query.trim()).split(/\s+/u).filter(Boolean);
  const connectors = /^(to|into|a|al|para|de|em|en|zu|in|nach|convert|convertir|converter|umwandeln)$/;
  const formats = /^(jpg|png|webp|gif|bmp|avif|heic|heif|svg|ico|icns|webm|mkv|mov|mp4|yaml|yml|json|xml|html|css|pdf|mp3|wav)$/;
  const terms = words.filter(word => !connectors.test(word));
  const conversion = words.length > terms.length && terms.length === 2 && terms.every(term => formats.test(term));
  return catalogue.locales[locale].tools.filter(tool => {
    const haystack = fold(`${tool.name} ${tool.description}`);
    if (conversion) {
      // Descriptions can mention formats without promising conversion between
      // them. A directional request needs that pair in the public tool name.
      const name = fold(tool.name);
      const source = name.indexOf(terms[0]);
      const target = name.indexOf(terms[1]);
      return source !== -1 && target !== -1
        && (source <= target || /[↔⇄⇆]/u.test(name));
    }
    return terms.every(term => haystack.includes(term));
  });
}

export function searchCatalogue(catalogue, args) {
  if (!args || typeof args !== 'object' || Array.isArray(args)
      || !Object.hasOwn(args, 'query') || !validQuery(args.query)
      || Object.keys(args).some(key => !['query', 'limit', 'locale'].includes(key))) {
    throw new TypeError('Use public catalogue keywords, at most 200 characters');
  }
  const limit = args.limit === undefined ? 10 : args.limit;
  const locale = args.locale === undefined ? 'en' : args.locale;
  if (!Number.isInteger(limit) || limit < 1 || limit > 20
      || typeof locale !== 'string' || !Object.hasOwn(catalogue.locales, locale)) {
    throw new TypeError('Invalid result limit or catalogue language');
  }
  const found = matchingTools(catalogue, args.query, locale);
  return { locale, total: found.length, hasMore: found.length > limit,
    tools: found.slice(0, limit).map(tool => ({ ...tool })) };
}
