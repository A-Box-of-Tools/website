/**
 * Rates are decimal ratios, and a report sums each document after rounding
 * that document to hundredths. Binary floating-point must not decide which
 * side of half a cent a receipt lands on. The optional provider request is
 * separate from that arithmetic and is called only by an explicit UI action.
 */
import { parseAmount, formatMinor, csvCell } from './receipt.js';

const currencyCode = /^[A-Z]{3}$/;
const maximumMinor = BigInt(Number.MAX_SAFE_INTEGER);

export function mostUsedCurrency(records) {
  const counts = new Map();
  for (const record of records) {
    const currency = String(record?.currency ?? '').trim().toUpperCase();
    if (currencyCode.test(currency)) counts.set(currency, (counts.get(currency) ?? 0) + 1);
  }
  let selected = '', highest = 0;
  // Map order preserves the first document even when a later currency led
  // during counting and only returned to a tie at the end of the batch.
  for (const [currency, count] of counts) {
    if (count > highest) { selected = currency; highest = count; }
  }
  return selected;
}

export function isoDate(value) {
  const text = String(value ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return '';
  const date = new Date(`${text}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === text ? text : '';
}

export function parseRate(value) {
  const text = String(value ?? '').trim();
  if (!/^\d{1,15}(?:\.\d{1,12})?$/.test(text)) return null;
  const [integer, fraction = ''] = text.split('.');
  const numerator = BigInt(integer + fraction);
  if (numerator <= 0n) return null;
  const denominator = 10n ** BigInt(fraction.length);
  const canonical = `${BigInt(integer)}${fraction ? `.${fraction.replace(/0+$/, '')}` : ''}`.replace(/\.$/, '');
  return { numerator, denominator, text: canonical };
}

/** Refunds use the same half-away-from-zero rule as positive documents. */
export function convertMinor(minor, rate) {
  const parsed = parseRate(rate);
  if (!Number.isSafeInteger(minor) || !parsed) return null;
  const absolute = BigInt(Math.abs(minor)) * parsed.numerator;
  const rounded = (absolute + parsed.denominator / 2n) / parsed.denominator;
  if (rounded > maximumMinor) return null;
  return rounded === 0n ? 0 : Number(minor < 0 ? -rounded : rounded);
}

export function conversionFor(record, finalCurrency) {
  const target = String(finalCurrency ?? '').trim().toUpperCase();
  const base = String(record.currency ?? '').trim().toUpperCase();
  const minor = parseAmount(record.amount);
  if (minor === null) return { error: 'invalidAmount' };
  if (!currencyCode.test(base)) return { error: 'invalidCurrency' };
  if (!currencyCode.test(target) || record.finalCurrency !== target) return { error: 'finalCurrencyRequired' };
  if (base === target) return { minor, rate: '1', source: 'same', currency: target, date: '', requestedDate: '' };
  const source = record.rateMode === 'online' ? 'online' : 'manual';
  const enteredDate = String(record.conversionDate ?? '').trim();
  const requestedDate = isoDate(record.conversionDate);
  if ((source === 'online' || enteredDate) && !requestedDate) return { error: 'invalidConversionDate' };
  const rate = parseRate(record.rate);
  if (!rate) return { error: 'invalidRate' };
  const date = source === 'online' ? isoDate(record.rateDate) : requestedDate;
  if (source === 'online' && (record.rateSource !== 'online' || record.rateBase !== base
    || record.rateQuote !== target || record.rateRequestDate !== requestedDate || !date || date > requestedDate)) {
    return { error: 'rateRequired' };
  }
  const converted = convertMinor(minor, rate.text);
  if (converted === null) return { error: 'conversionOverflow' };
  return { minor: converted, rate: rate.text, source, currency: target, date, requestedDate };
}

export function summarizeConverted(records, finalCurrency) {
  let total = 0n;
  let confirmedCount = 0;
  let invalidCount = 0;
  let reviewCount = 0;
  for (const record of records) {
    if (record.confirmed !== true) { reviewCount++; continue; }
    const conversion = conversionFor(record, finalCurrency);
    if (conversion.error) { invalidCount++; continue; }
    total += BigInt(conversion.minor);
    confirmedCount++;
  }
  const currency = String(finalCurrency ?? '').trim().toUpperCase();
  const safe = total <= maximumMinor && total >= -maximumMinor;
  const ready = safe && currencyCode.test(currency);
  return {
    count: records.length, confirmedCount, invalidCount, reviewCount,
    currency,
    minor: ready ? Number(total) : null, amount: ready ? formatMinor(Number(total)) : '',
    warning: safe ? '' : 'totalOverflow',
  };
}

export function buildConversionCsv(records, finalCurrency, labels = {}) {
  const keys = ['filename', 'merchant', 'date', 'reference', 'currency', 'amount', 'conversionDate', 'rate', 'rateSource', 'rateDate', 'finalCurrency', 'convertedAmount', 'confirmed'];
  const row = values => values.map((value, index) => csvCell(value, [5, 7, 11].includes(index) && /^-?\d+(?:\.\d+)?$/.test(String(value)))).join(',');
  const rows = [keys.map(key => csvCell(labels[key] ?? key)).join(',')];
  for (const record of records) {
    const sourceMinor = parseAmount(record.amount);
    const conversion = conversionFor(record, finalCurrency);
    const manualWithoutDate = !conversion.error && conversion.source === 'manual' && !conversion.date;
    rows.push(row([
      record.name ?? record.filename, record.merchant, record.date, record.reference, record.currency,
      sourceMinor === null ? record.amount : formatMinor(sourceMinor), manualWithoutDate ? labels.notEntered ?? '' : record.conversionDate,
      conversion.error ? record.rate : conversion.rate,
      conversion.error ? '' : labels[conversion.source] ?? conversion.source,
      conversion.error ? '' : manualWithoutDate ? labels.notEntered ?? '' : conversion.date, finalCurrency,
      conversion.error ? '' : formatMinor(conversion.minor),
      record.confirmed === true && !conversion.error ? labels.yes ?? 'true' : labels.no ?? 'false',
    ]));
  }
  const summary = summarizeConverted(records, finalCurrency);
  const count = Array(keys.length).fill('');
  count[0] = labels.documentCount ?? 'document_count'; count[5] = summary.count;
  rows.push(row(count));
  const checked = Array(keys.length).fill('');
  checked[0] = labels.checkedCount ?? 'checked_count'; checked[5] = summary.confirmedCount;
  rows.push(row(checked));
  const total = Array(keys.length).fill('');
  total[0] = labels.grandTotal ?? 'grand_total'; total[10] = summary.currency; total[11] = summary.warning ? '' : summary.amount;
  rows.push(row(total));
  return `${rows.join('\r\n')}\r\n`;
}

function decimalNumber(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null;
  const text = String(value);
  if (!/[eE]/.test(text)) return parseRate(text)?.text ?? null;
  const [mantissa, exponentText] = text.toLowerCase().split('e');
  const exponent = Number(exponentText);
  if (!Number.isInteger(exponent) || Math.abs(exponent) > 15) return null;
  const [integer, fraction = ''] = mantissa.split('.');
  const digits = integer + fraction;
  const point = integer.length + exponent;
  const expanded = point <= 0 ? `0.${'0'.repeat(-point)}${digits}`
    : point >= digits.length ? `${digits}${'0'.repeat(point - digits.length)}`
      : `${digits.slice(0, point)}.${digits.slice(point)}`;
  return parseRate(expanded)?.text ?? null;
}

/** Only the pair and requested date leave the device, never document data. */
export async function fetchHistoricalRate({ base, quote, date, signal }, { fetchImpl = globalThis.fetch, timeoutMs = 15000 } = {}) {
  base = String(base ?? '').trim().toUpperCase();
  quote = String(quote ?? '').trim().toUpperCase();
  date = isoDate(date);
  if (!currencyCode.test(base) || !currencyCode.test(quote)) throw new Error('invalidCurrency');
  if (!date || date > new Date().toISOString().slice(0, 10)) throw new Error('invalidConversionDate');
  if (signal?.aborted) throw new Error('fx.cancelled');
  if (base === quote) return { base, quote, rate: '1', date, requestedDate: date };
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  try {
    const response = await fetchImpl(`https://api.frankfurter.dev/v2/rate/${base.toLowerCase()}/${quote.toLowerCase()}?date=${date}`, {
      credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store', redirect: 'error',
      headers: { Accept: 'application/json' }, signal: controller.signal,
    });
    if (!response.ok) throw new Error([404, 422].includes(response.status) ? 'fx.unsupported' : 'fx.failed');
    const data = await response.json();
    if (controller.signal.aborted) throw new Error('fx.cancelled');
    const actualDate = isoDate(data.date);
    const rate = typeof data.rate === 'string' ? parseRate(data.rate)?.text : decimalNumber(data.rate);
    if (data.base !== base || data.quote !== quote || !actualDate || actualDate > date || !rate) throw new Error('fx.failed');
    return { base, quote, rate, date: actualDate, requestedDate: date };
  } catch (error) {
    if (timedOut) throw new Error('fx.timeout');
    if (signal?.aborted) throw new Error('fx.cancelled');
    if (['fx.unsupported', 'fx.failed'].includes(error?.message)) throw error;
    throw new Error('fx.failed');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}
