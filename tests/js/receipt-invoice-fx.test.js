/**
 * Conversion must retain the direction and date the visitor reviewed. These
 * cases also keep half-cent rounding, refunds and hostile spreadsheet cells
 * from changing the grand total or the meaning of an exported document.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mostUsedCurrency, isoDate, parseRate, convertMinor, conversionFor, summarizeConverted,
  buildConversionCsv, fetchHistoricalRate,
} from '../../tools/receipt-invoice-extractor/src/fx.js';

const document = (fields = {}) => ({
  filename: 'receipt.avif', merchant: 'Cafe', date: '2024-02-29', reference: 'R-1',
  amount: '24.30', currency: 'CAD', finalCurrency: 'USD', confirmed: true,
  conversionDate: '2024-02-29', rateMode: 'manual', rate: '0.70295', ...fields,
});
const response = (data, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => data });

test('the default currency counts documents regardless of their amount or review status', () => {
  assert.equal(mostUsedCurrency([
    document({ currency: 'USD', amount: '999999.00', confirmed: true }),
    document({ currency: ' cad ', amount: '', confirmed: false }),
    document({ currency: 'CAD', amount: '-1.00', confirmed: false }),
  ]), 'CAD');
  assert.equal(mostUsedCurrency([
    document({ currency: '' }), document({ currency: 'usd$' }),
    document({ currency: 'CA' }), document({ currency: '123' }),
    document({ currency: ' xyz ' }), document({ currency: 'XYZ' }),
  ]), 'XYZ');
  assert.equal(mostUsedCurrency([]), '');
  assert.equal(mostUsedCurrency([{ currency: null }, {}, { currency: ' ' }, { currency: 'US' }]), '');
});

test('a tied currency follows the first valid document in the current batch order', () => {
  const records = ['USD', 'CAD', 'CAD', 'USD'].map(currency => document({ currency }));
  assert.equal(mostUsedCurrency(records), 'USD');
  assert.equal(mostUsedCurrency(records.slice(1).concat(records[0])), 'CAD');
  assert.equal(mostUsedCurrency([{ currency: '?' }, { currency: ' eur ' }, { currency: 'USD' }]), 'EUR');
});

test('only complete unambiguous calendar dates can become conversion dates', () => {
  assert.equal(isoDate(' 2024-02-29 '), '2024-02-29');
  for (const value of ['2023-02-29', '2024-02-30', '2024-13-01', '2024-2-9',
    '02/03/2024', 'Mar 3 2024', '2024-02-29T12:00:00Z', '']) {
    assert.equal(isoDate(value), '', value);
  }
});

test('rates are positive decimal ratios without executable or ambiguous notation', () => {
  assert.deepEqual(parseRate(' 000.7029500 '), { numerator: 7029500n, denominator: 10000000n, text: '0.70295' });
  assert.equal(parseRate('001.000').text, '1');
  for (const value of ['0', '0.000', '-1', '+1', '.5', '1.', '1,2', '1e-7',
    'NaN', 'Infinity', '1/2', '=1+2', '0.1234567890123', '1000000000000000']) {
    assert.equal(parseRate(value), null, value);
  }
});

test('each document uses exact half-away-from-zero rounding including refunds', () => {
  assert.equal(convertMinor(2430, '0.70295'), 1708);
  assert.equal(convertMinor(4520, '0.70295'), 3177);
  assert.equal(convertMinor(1000, '0.1005'), 101);
  assert.equal(convertMinor(-1000, '0.1005'), -101);
  assert.equal(convertMinor(1, '0.5'), 1);
  assert.equal(convertMinor(-1, '0.5'), -1);
  assert.equal(convertMinor(-1, '0.499999999999'), 0);
  assert.equal(Object.is(convertMinor(-1, '0.1'), -0), false);
  assert.equal(convertMinor(Number.MAX_SAFE_INTEGER, '1'), Number.MAX_SAFE_INTEGER);
  assert.equal(convertMinor(Number.MAX_SAFE_INTEGER, '1.000000000001'), null);
  assert.equal(convertMinor(1.5, '1'), null);
});

test('same-currency conversion fixes the rate at one without needing a date', () => {
  const record = document({ currency: 'USD', rate: '', conversionDate: '', rateMode: 'online' });
  assert.deepEqual(conversionFor(record, 'USD'), {
    minor: 2430, rate: '1', source: 'same', currency: 'USD', date: '', requestedDate: '',
  });
  assert.equal(conversionFor(record, 'EUR').error, 'finalCurrencyRequired');
});

test('a manual conversion requires the chosen final currency while its date is optional', () => {
  assert.deepEqual(conversionFor(document(), 'USD'), {
    minor: 1708, rate: '0.70295', source: 'manual', currency: 'USD',
    date: '2024-02-29', requestedDate: '2024-02-29',
  });
  assert.deepEqual(conversionFor(document({ conversionDate: '' }), 'USD'), {
    minor: 1708, rate: '0.70295', source: 'manual', currency: 'USD', date: '', requestedDate: '',
  });
  assert.equal(conversionFor(document({ rate: '' }), 'USD').error, 'invalidRate');
  assert.equal(conversionFor(document({ conversionDate: '02/03/2024' }), 'USD').error, 'invalidConversionDate');
  assert.equal(conversionFor(document({ finalCurrency: 'EUR' }), 'USD').error, 'finalCurrencyRequired');
  assert.equal(conversionFor(document({ amount: '9007199254740992' }), 'USD').error, 'invalidAmount');
  assert.equal(conversionFor(document({ currency: 'CA' }), 'USD').error, 'invalidCurrency');
  assert.equal(conversionFor(document({ amount: '90071992547409.91', rate: '2' }), 'USD').error, 'conversionOverflow');
});

test('a historical rate remains bound to its requested pair and receipt date', () => {
  const record = document({
    rateMode: 'online', rateSource: 'online', rateBase: 'CAD', rateQuote: 'USD',
    rateDate: '2024-02-28', rateRequestDate: '2024-02-29',
  });
  assert.equal(conversionFor(record, 'USD').date, '2024-02-28');
  assert.equal(conversionFor({ ...record, conversionDate: '' }, 'USD').error, 'invalidConversionDate');
  for (const changes of [{ currency: 'EUR' }, { rateQuote: 'EUR' },
    { conversionDate: '2024-03-01' }, { rateDate: '2024-03-01' },
    { rateRequestDate: '2024-02-28' }, { rateSource: 'manual' }]) {
    assert.equal(conversionFor({ ...record, ...changes }, 'USD').error, 'rateRequired');
  }
});

test('the grand total adds individually rounded checked documents only', () => {
  const records = [document({ amount: '0.01', rate: '0.5' }), document({ amount: '0.01', rate: '0.5' }),
    document({ amount: '100.00', confirmed: false }), document({ rate: '' }), document({ confirmed: 'true' })];
  assert.deepEqual(summarizeConverted(records, 'USD'), {
    count: 5, confirmedCount: 2, invalidCount: 1, reviewCount: 2,
    currency: 'USD', minor: 2, amount: '0.02', warning: '',
  });
  assert.equal(summarizeConverted([document(), document({ amount: '45.20' })], 'USD').amount, '48.85');
  assert.equal(summarizeConverted([document()], 'US').amount, '');
});

test('grand total overflow cannot become a plausible rounded export', () => {
  const record = document({ amount: '90071992547409.91', currency: 'USD' });
  const summary = summarizeConverted([record, record], 'USD');
  assert.equal(summary.warning, 'totalOverflow');
  assert.equal(summary.minor, null);
  assert.equal(summary.amount, '');
});

// Parse exported CSV independently so commas and escaped quotes cannot hide a
// shifted currency, rate or grand-total cell from a string-only assertion.
function csvRows(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let index = 0; index < text.length; index++) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') { cell += '"'; index++; }
      else quoted = !quoted;
    } else if (!quoted && character === ',') { row.push(cell); cell = ''; }
    else if (!quoted && character === '\r' && text[index + 1] === '\n') {
      row.push(cell); rows.push(row); row = []; cell = ''; index++;
    } else cell += character;
  }
  assert.equal(quoted, false);
  assert.deepEqual(row, []);
  assert.equal(cell, '');
  return rows;
}

test('CSV preserves source values, conversion provenance, final total and safe text cells', () => {
  const online = document({
    filename: '=HYPERLINK("x")', merchant: 'Cafe, "north"', reference: '\t=1+1',
    rateMode: 'online', rateSource: 'online', rateBase: 'CAD', rateQuote: 'USD',
    rateDate: '2024-02-28', rateRequestDate: '2024-02-29',
  });
  const rows = csvRows(buildConversionCsv([online, document({ amount: '-0.01', rate: '0.5' }), document({ confirmed: false })], 'USD'));
  assert.equal(rows[0].length, 13);
  assert.equal(rows[1][0], '\'=HYPERLINK("x")');
  assert.equal(rows[1][1], 'Cafe, "north"');
  assert.equal(rows[1][3], '\'\t=1+1');
  assert.deepEqual(rows[1].slice(4), ['CAD', '24.30', '2024-02-29', '0.70295', 'online', '2024-02-28', 'USD', '17.08', 'true']);
  assert.equal(rows[2][11], '-0.01');
  assert.equal(rows[3][12], 'false');
  assert.equal(rows[4][0], 'document_count');
  assert.equal(rows[4][5], '3');
  assert.equal(rows[5][5], '2');
  assert.equal(rows[6][0], 'grand_total');
  assert.deepEqual(rows[6].slice(10), ['USD', '17.07', '']);
  assert.ok(rows.every(row => row.length === 13));
});

test('undated manual CSV conversions identify the missing date with the caller label', () => {
  const rows = csvRows(buildConversionCsv([document({ conversionDate: '' })], 'USD', { notEntered: 'Not entered' }));
  assert.equal(rows[1][6], 'Not entered');
  assert.equal(rows[1][9], 'Not entered');
  assert.equal(rows[1][11], '17.08');
  assert.equal(rows[1][12], 'true');
});

test('historical requests disclose only a pair and date and preserve the returned date', async () => {
  let calls = 0;
  const result = await fetchHistoricalRate({ base: ' cad ', quote: 'usd', date: '2024-02-29' }, {
    fetchImpl: async (url, options) => {
      calls++;
      assert.equal(url, 'https://api.frankfurter.dev/v2/rate/cad/usd?date=2024-02-29');
      assert.equal(options.credentials, 'omit');
      assert.equal(options.referrerPolicy, 'no-referrer');
      assert.equal(options.cache, 'no-store');
      assert.equal(options.redirect, 'error');
      assert.equal(options.body, undefined);
      return response({ base: 'CAD', quote: 'USD', date: '2024-02-28', rate: 0.70295 });
    },
  });
  assert.equal(calls, 1);
  assert.deepEqual(result, { base: 'CAD', quote: 'USD', date: '2024-02-28', requestedDate: '2024-02-29', rate: '0.70295' });
});

test('same-currency and invalid historical requests never call the provider', async () => {
  const options = { fetchImpl: () => { throw new Error('unexpected-request'); } };
  assert.equal((await fetchHistoricalRate({ base: 'USD', quote: 'USD', date: '2024-02-29' }, options)).rate, '1');
  await assert.rejects(fetchHistoricalRate({ base: 'USD/eur', quote: 'CAD', date: '2024-02-29' }, options), /invalidCurrency/);
  await assert.rejects(fetchHistoricalRate({ base: 'USD', quote: 'CAD', date: '02/03/2024' }, options), /invalidConversionDate/);
  await assert.rejects(fetchHistoricalRate({ base: 'USD', quote: 'CAD', date: '2099-01-01' }, options), /invalidConversionDate/);
});

test('provider mismatches and unavailable pairs cannot fall back to a latest rate', async () => {
  const query = { base: 'CAD', quote: 'USD', date: '2024-02-29' };
  for (const data of [
    { base: 'USD', quote: 'CAD', date: '2024-02-29', rate: 0.7 },
    { base: 'CAD', quote: 'USD', date: '2024-03-01', rate: 0.7 },
    { base: 'CAD', quote: 'USD', date: '2024-02-29', rate: 0 },
    { base: 'CAD', quote: 'USD', date: 'invalid', rate: 0.7 }, null,
  ]) await assert.rejects(fetchHistoricalRate(query, { fetchImpl: async () => response(data) }), /fx.failed/);
  for (const status of [404, 422]) {
    await assert.rejects(fetchHistoricalRate(query, { fetchImpl: async () => response({}, status) }), /fx.unsupported/);
  }
  await assert.rejects(fetchHistoricalRate(query, { fetchImpl: async () => { throw null; } }), /fx.failed/);
});

test('tiny provider numeric rates become decimal ratios instead of scientific manual input', async () => {
  const result = await fetchHistoricalRate({ base: 'VND', quote: 'USD', date: '2024-02-29' }, {
    fetchImpl: async () => response({ base: 'VND', quote: 'USD', date: '2024-02-29', rate: 1e-7 }),
  });
  assert.equal(result.rate, '0.0000001');
});

test('cancellation and timeout abort the request instead of retaining its rate', async () => {
  const controller = new AbortController();
  const waitingFetch = async (_url, options) => new Promise((_resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
  });
  const pending = fetchHistoricalRate({ base: 'CAD', quote: 'USD', date: '2024-02-29', signal: controller.signal }, { fetchImpl: waitingFetch });
  controller.abort();
  await assert.rejects(pending, /fx.cancelled/);
  await assert.rejects(fetchHistoricalRate({ base: 'CAD', quote: 'USD', date: '2024-02-29' }, { fetchImpl: waitingFetch, timeoutMs: 1 }), /fx.timeout/);
});
