/**
 * A country printed in an issuer's address can narrow an otherwise ambiguous
 * currency. It cannot tell us what a customer, destination or bank was billed
 * in, so address scope matters more than recognizing a place name.
 *
 * These small offline tables deliberately omit recent currency changes. Euro
 * countries need a readable year after their cash changeover; an old receipt
 * must not inherit today's currency merely because its address stayed put.
 * Sources: SIX's ISO 4217 currency lists and the ECB's euro changeover timeline.
 */

const COUNTRIES = [
  ['CA', 'CAD', ['CANADA']],
  ['US', 'USD', ['UNITED STATES OF AMERICA', 'UNITED STATES', 'U.S.A.', 'USA']],
  ['GB', 'GBP', ['UNITED KINGDOM', 'GREAT BRITAIN', 'NORTHERN IRELAND', 'ENGLAND', 'SCOTLAND', 'WALES', 'U.K.', 'UK']],
  ['AU', 'AUD', ['AUSTRALIA']],
  ['NZ', 'NZD', ['NEW ZEALAND']],
  ['HK', 'HKD', ['HONG KONG SAR, CHINA', 'HONG KONG SAR CHINA', 'HONG KONG, CHINA', 'HONG KONG CHINA', 'HONG KONG SAR', 'HONG KONG', 'HONGKONG']],
  ['SG', 'SGD', ['SINGAPORE']],
  ['JP', 'JPY', ['JAPAN', 'NIPPON', 'NIHON']],
  ['CN', 'CNY', ["PEOPLE'S REPUBLIC OF CHINA", 'P.R. CHINA', 'CHINA']],
  ['IN', 'INR', ['INDIA']],
  ['CH', 'CHF', ['SWITZERLAND', 'SCHWEIZ', 'SUISSE', 'SVIZZERA']],
  ['SE', 'SEK', ['SWEDEN', 'SVERIGE']],
  ['NO', 'NOK', ['NORWAY', 'NORGE']],
  ['DK', 'DKK', ['DENMARK', 'DANMARK']],
  ['PL', 'PLN', ['POLAND', 'POLSKA'], 1997],
  ['CZ', 'CZK', ['CZECH REPUBLIC', 'CZECHIA', 'CESKO']],
  ['HU', 'HUF', ['HUNGARY', 'MAGYARORSZAG']],
  ['IL', 'ILS', ['ISRAEL'], 1987],
  ['AE', 'AED', ['UNITED ARAB EMIRATES', 'U.A.E.', 'UAE']],
  ['SA', 'SAR', ['SAUDI ARABIA']],
  ['MY', 'MYR', ['MALAYSIA']],
  ['TH', 'THB', ['THAILAND']],
  ['ID', 'IDR', ['INDONESIA']],
  ['PH', 'PHP', ['PHILIPPINES']],
  ['TW', 'TWD', ['TAIWAN']],
  ['VN', 'VND', ['VIETNAM', 'VIET NAM']],
  ['ZA', 'ZAR', ['SOUTH AFRICA']],
  ['AT', 'EUR', ['AUSTRIA', 'OSTERREICH'], 2003],
  ['BE', 'EUR', ['BELGIUM', 'BELGIQUE', 'BELGIE'], 2003],
  ['DE', 'EUR', ['GERMANY', 'DEUTSCHLAND'], 2003],
  ['ES', 'EUR', ['SPAIN', 'ESPANA'], 2003],
  ['FI', 'EUR', ['FINLAND', 'SUOMI'], 2003],
  ['FR', 'EUR', ['FRANCE'], 2003],
  ['GR', 'EUR', ['GREECE', 'HELLAS'], 2003],
  ['IE', 'EUR', ['IRELAND', 'EIRE'], 2003],
  ['IT', 'EUR', ['ITALY', 'ITALIA'], 2003],
  ['LU', 'EUR', ['LUXEMBOURG'], 2003],
  ['NL', 'EUR', ['NETHERLANDS', 'NEDERLAND'], 2003],
  ['PT', 'EUR', ['PORTUGAL'], 2003],
  ['BG', '', ['BULGARIA']],
  ['HR', '', ['CROATIA', 'HRVATSKA']],
  ['CY', '', ['CYPRUS']],
  ['MT', '', ['MALTA']],
  ['EE', '', ['ESTONIA']],
  ['LV', '', ['LATVIA']],
  ['LT', '', ['LITHUANIA']],
  ['SI', '', ['SLOVENIA']],
  ['SK', '', ['SLOVAKIA']],
  ['RO', '', ['ROMANIA']],
  ['TR', '', ['TURKIYE', 'TURKEY']],
  ['BR', '', ['BRAZIL', 'BRASIL']],
  ['MX', '', ['MEXICO']],
];

const CA_REGIONS = 'AB|BC|MB|NB|NL|NS|NT|NU|ON|PE|QC|SK|YT|ALBERTA|BRITISH COLUMBIA|MANITOBA|NEW BRUNSWICK|NEWFOUNDLAND(?: AND LABRADOR)?|NOVA SCOTIA|NORTHWEST TERRITORIES|NUNAVUT|ONTARIO|PRINCE EDWARD ISLAND|QUEBEC|SASKATCHEWAN|YUKON';
const CA_FULL_REGIONS = 'ALBERTA|BRITISH COLUMBIA|MANITOBA|NEW BRUNSWICK|NEWFOUNDLAND(?: AND LABRADOR)?|NOVA SCOTIA|NORTHWEST TERRITORIES|NUNAVUT|ONTARIO|PRINCE EDWARD ISLAND|QUEBEC|SASKATCHEWAN|YUKON';
const US_REGIONS = 'AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC|ALABAMA|ALASKA|ARIZONA|ARKANSAS|CALIFORNIA|COLORADO|CONNECTICUT|DELAWARE|FLORIDA|GEORGIA|HAWAII|IDAHO|ILLINOIS|INDIANA|IOWA|KANSAS|KENTUCKY|LOUISIANA|MAINE|MARYLAND|MASSACHUSETTS|MICHIGAN|MINNESOTA|MISSISSIPPI|MISSOURI|MONTANA|NEBRASKA|NEVADA|NEW HAMPSHIRE|NEW JERSEY|NEW MEXICO|NEW YORK|NORTH CAROLINA|NORTH DAKOTA|OHIO|OKLAHOMA|OREGON|PENNSYLVANIA|RHODE ISLAND|SOUTH CAROLINA|SOUTH DAKOTA|TENNESSEE|TEXAS|UTAH|VERMONT|VIRGINIA|WASHINGTON|WEST VIRGINIA|WISCONSIN|WYOMING|DISTRICT OF COLUMBIA';
const AU_REGIONS = 'NSW|VIC|QLD|SA|WA|TAS|NT|ACT|NEW SOUTH WALES|VICTORIA|QUEENSLAND|SOUTH AUSTRALIA|WESTERN AUSTRALIA|TASMANIA|NORTHERN TERRITORY|AUSTRALIAN CAPITAL TERRITORY';
const CA_POSTAL = '[ABCEGHJ-NPRSTVXY]\\d[ABCEGHJ-NPRSTVWXYZ][ -]?\\d[ABCEGHJ-NPRSTVWXYZ]\\d';
const CA_PRINTED_POSTAL = '[ABCEGHJ-NPRSTVXY][\\dO][ABCEGHJ-NPRSTVWXYZ][ -]?[\\dO][ABCEGHJ-NPRSTVWXYZ][\\dO]';
const CA_ADDRESS_FRAGMENT = new RegExp(`\\b(?:${CA_FULL_REGIONS})[, ]+[ABCEGHJ-NPRSTVXY]\\d[ABCEGHJ-NPRSTVWXYZ][ -]?[A-Z\\d]{3}\\b`, 'i');
const GB_POSTAL = '(?:GIR\\s?0AA|[A-Z]{1,2}\\d[A-Z\\d]?\\s?\\d[A-Z]{2})';
const DISTINCT_POSTAL = new RegExp(`\\b(?:${CA_POSTAL}|${GB_POSTAL}|\\d{3}-\\d{4})\\b`, 'i');
const REGION_POSTALS = [
  ['CA', 'CAD', new RegExp(`\\b(?:${CA_REGIONS})[, ]+${CA_PRINTED_POSTAL}\\b`, 'i')],
  ['US', 'USD', new RegExp(`\\b(?:${US_REGIONS})[, ]+\\d{5}(?:-\\d{4})?\\b`, 'i')],
  ['AU', 'AUD', new RegExp(`\\b(?:${AU_REGIONS})[, ]+\\d{4}\\b`, 'i')],
];

const OTHER_PARTY = /\b(?:bill(?:ed|ing)?\s+(?:to|address)|ship(?:ped|ping)?\s+(?:to|address)|deliver(?:y|ed)\s+(?:to|address)|sold\s+to|customer|client|buyer|purchaser|recipient|consignee|remit(?:tance)?(?:\s+to)?|payment\s+(?:address|instructions|details)|bank\s+(?:address|details)|beneficiary|destination|itinerary|boarding|departure|arrival)\b|^to\s*:/i;
const ISSUER = /^(?:from|seller|vendor|supplier|issuer|issued\s+by|sold\s+by|merchant|store|shop|branch|business|registered\s+office)(?:\s+(?:address|location|country|details))?\s*[:=-]\s*/i;
const ISSUER_REOPEN = /^(?:seller|vendor|supplier|issuer|issued\s+by|sold\s+by|from)(?:\s+(?:address|details))?\s*[:=-]/i;
const LOCATION_LABEL = /^(?:(?:merchant|store|shop|branch|business)\s+(?:address|location|country)|registered\s+office)\s*[:=-]/i;
const NOT_ADDRESS = /\b(?:made\s+in|manufactured|imported|exported|country\s+of\s+origin|products?|travel|tours?|trips?|flights?|souvenirs?|exchange\s+rate|currency|phone|telephone|fax)\b|^(?:tel\b|tax\b|vat\b|gst\b|hst\b|pst\b|date\b|invoice\b|receipt\b|order\b|reference\b|ref\b|www\.|https?:)/i;
const STREET = /\b(?:\d+[A-Z]?(?:[-/]\d+)?\s+[\p{L}\d][\p{L}\d .'-]{0,55}\b(?:st(?:reet)?|rd|road|ave(?:nue)?|blvd|boulevard|dr(?:ive)?|lane|ln|way|court|ct|place|pl|terrace|crescent|close|chome|block)\b|P\.?\s*O\.?\s+BOX\s+[A-Z\d-]+|(?:rue|via|calle|rua|strasse|straße|gasse|jalan|jln|lorong)\s+[\p{L}\d .'-]{0,55}\d)\b/iu;
const HIGHWAY_ADDRESS = /\b\d+[A-Z]?(?:[-/]\d+)?\s*(?:HWY|HIGHWAY)\s*\d+(?:\s*[A-Z][A-Z\d .'-]*)?/i;
const UNSUPPORTED_TERRITORY = /\b(?:MACAO|MACAU)\b/i;

function normalized(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss').toUpperCase();
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function printedYear(date) {
  const years = String(date).match(/\b(?:19|20)\d{2}\b/g) ?? [];
  return years.length === 1 ? Number(years[0]) : null;
}

function postalAddress(line) {
  if (DISTINCT_POSTAL.test(line)) return true;
  // A bare four-digit number may be a year. Numeric postcodes need adjoining
  // locality words, not a date or an invoice number, to anchor an address.
  return /^(?:\d{4,6}(?:-\d{3,4})?[, ]+[A-Z][A-Z .'-]+|[A-Z][A-Z .'-]+[, ]+\d{4,6}(?:-\d{3,4})?)$/.test(line);
}

function closesAddressScope(line) {
  const tableWords = line.match(/\b(?:qty|quantity|items?|desc(?:ription)?|desription|unit\s+price|price)\b/gi) ?? [];
  return tableWords.length >= 2 || /^(?:qty|quantity|items?|desc(?:ription)?|desription|unit\s+price|price|rate)\s*[:.]?$/i.test(line)
    || /^(?:(?:grand|invoice|receipt)\s+total|sub\s*[- ]?\s*total|total(?:\s+(?:amount|due|payable|paid|after\s+(?:tax|vat|gst|hst|pst)))?|amount\s+due|balance\s+due)\b\s*[:=]?\s*(?:$|[+\-(\d$€£¥₹]|[A-Z]{3}\s*[+\-(]?\s*\d)/i.test(line)
    || /[A-Za-z].*[$€£¥₹]\s*\d|\b\d+[.,]\d{2}\s*(?:[$€£¥₹]|$)/.test(line);
}

function issuerBlocks(input) {
  const lines = (Array.isArray(input) ? input : String(input ?? '').replace(/\r\n?/g, '\n').split('\n'))
    .map((line) => String(line).trim()).filter(Boolean).slice(0, 48);
  const blocks = [];
  let block = [];
  let issuer = true;
  const finish = () => {
    if (block.length) blocks.push(block);
    block = [];
  };
  for (const raw of lines) {
    if (raw.length > 240 || OTHER_PARTY.test(raw)) {
      finish();
      issuer = false;
      continue;
    }
    const marker = ISSUER.exec(raw);
    if (marker) {
      if (!issuer && !ISSUER_REOPEN.test(raw)) continue;
      finish();
      issuer = true;
    }
    if (!issuer) continue;
    const text = marker ? raw.slice(marker[0].length).trim() : raw;
    if (!text) continue;
    if (closesAddressScope(text) || block.length >= 16) {
      finish();
      issuer = false;
      continue;
    }
    if (!NOT_ADDRESS.test(text)) block.push({ raw, text, locationLabel: LOCATION_LABEL.test(raw) });
  }
  finish();
  return blocks;
}

function countryAtEnd(line) {
  const tail = `(?:[, ]+(?:${CA_POSTAL}|${GB_POSTAL}|\\d{4,6}(?:-\\d{3,4})?))?[, .]*$`;
  const matches = [];
  for (const [country, currency, aliases, since] of COUNTRIES) {
    for (const alias of aliases) {
      const match = new RegExp(`(?:^|[ ,])(${escapeRegex(alias)})${tail}`, 'i').exec(line);
      if (alias === 'WALES' && /\bNEW SOUTH WALES\b/.test(line)) continue;
      if (match) matches.push({ country, currency, since, length: alias.length });
    }
  }
  // Northern Ireland is more specific than Ireland; Hong Kong, China has its
  // own currency. A shorter suffix must not undo the printed jurisdiction.
  return matches.sort((a, b) => b.length - a.length)[0] ?? null;
}

/** The returned evidence is a bounded printed line, never a fabricated place. */
export function inferLocationCurrency(input, date = '') {
  const found = [];
  const year = printedYear(date);
  for (const block of issuerBlocks(input)) {
    if (block.some((entry) => UNSUPPORTED_TERRITORY.test(entry.text))) continue;
    for (let index = 0; index < block.length; index++) {
      const entry = block[index];
      const line = normalized(entry.text);
      const nearby = block.slice(Math.max(0, index - 3), index + 1);
      const street = nearby.some((part) => STREET.test(part.text) || HIGHWAY_ADDRESS.test(part.text));
      const labelled = entry.locationLabel || nearby.some((part) => part.locationLabel);
      const postal = nearby.some((part) => postalAddress(normalized(part.text)));
      const country = countryAtEnd(line);
      if (country && (street || labelled || postal)) {
        const supportedDate = !country.since || year !== null && year >= country.since;
        found.push({ ...country, currency: supportedDate ? country.currency : '', evidence: entry.raw.slice(-180) });
      }
      const regionPostalRanges = [];
      for (const [id, currency, pattern] of REGION_POSTALS) {
        const region = pattern.exec(line);
        if (!region) continue;
        // A region and postcode form an address when a locality precedes
        // them, or a street/location label already anchors this short block.
        const locality = line.slice(0, region.index).replace(/[, ]+$/, '');
        if (street || labelled || /^[A-Z][A-Z .'-]{1,45}$/.test(locality)) {
          found.push({ country: id, currency, evidence: entry.raw.slice(-180) });
          regionPostalRanges.push([region.index, region.index + region[0].length]);
        }
      }
      const fragment = CA_ADDRESS_FRAGMENT.exec(line);
      const locality = fragment && line.slice(0, fragment.index).replace(/[, ]+$/, '');
      // An OCR-damaged postal suffix alone proves nothing. A valid Canadian
      // first half can still anchor a full province and locality when a nearby
      // street independently confirms this is the issuer's address block.
      if (street && fragment && /^[A-Z][A-Z .'-]{1,45}$/.test(locality)) {
        found.push({ country: 'CA', currency: 'CAD', evidence: entry.raw.slice(-180) });
        regionPostalRanges.push([fragment.index, fragment.index + fragment[0].length]);
      }
      if (street || labelled) {
        for (const match of line.matchAll(new RegExp(`\\b${GB_POSTAL}\\b`, 'gi'))) {
          // A damaged Canadian suffix can fit the generic UK shape. Its full
          // province and postal prefix are stronger evidence for that token;
          // a separate UK postcode still conflicts with the issuer address.
          if (regionPostalRanges.some(([start, end]) => match.index >= start && match.index + match[0].length <= end)) continue;
          found.push({ country: 'GB', currency: 'GBP', evidence: entry.raw.slice(-180) });
        }
      }
    }
  }
  if (new Set(found.map((match) => match.country)).size !== 1) return null;
  const match = found[0];
  return match?.currency ? { currency: match.currency, evidence: match.evidence } : null;
}
