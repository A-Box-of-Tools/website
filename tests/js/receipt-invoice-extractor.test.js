/**
 * Totals are useful only when they preserve the document's meaning. These
 * fixtures keep tender, tax, currency ambiguity and unreviewed OCR out of the
 * arithmetic, and exercise the two export formats with hostile field text.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseAmount, formatMinor, extractReceipt, summarize, buildCsv, buildMailto, duplicatePhotoCounts,
} from '../../tools/receipt-invoice-extractor/src/receipt.js';

test('amounts use integer hundredths across decimal and grouping conventions', () => {
  for (const text of ['1,234.56', '1.234,56', '1 234,56', '1\u202f234.56', "1'234.56", '€1.234,56', 'USD 1,234.56']) {
    assert.equal(parseAmount(text), 123456, text);
  }
  assert.equal(parseAmount('1,234,567'), 123456700);
  assert.equal(parseAmount('1.234.567'), 123456700);
  assert.equal(parseAmount('1 234'), 123400);
  assert.equal(parseAmount('0.1'), 10);
  assert.equal(parseAmount(',50'), 50);
  assert.equal(parseAmount('42'), 4200);
});

test('refunds retain their sign without interpreting a double negative', () => {
  for (const text of ['-12.34', '12,34-', '(12.34)', '(€12,34)', '-USD 12.34', 'C$-12.34']) {
    assert.equal(parseAmount(text), -1234, text);
  }
  assert.equal(parseAmount('+12.34'), 1234);
  assert.equal(parseAmount('-0.00'), 0);
  for (const text of ['(-12.34)', '-12.34-', '+(12.34)', '--12.34']) {
    assert.equal(parseAmount(text), null, text);
  }
});

test('ambiguous separators, invalid grouping and excess precision need correction', () => {
  for (const text of ['', '1,234', '1.234', '0.123', '1,23,456.78', '12 34.00',
    '1,234.567', '1.23.45', '1e3', 'Infinity', 'NaN', 'INV-12', '12%', '9007199254740992']) {
    assert.equal(parseAmount(text), null, text);
  }
});

test('decimal formatting has no floating-point residue and rejects unsafe arithmetic', () => {
  assert.equal(formatMinor(0), '0.00');
  assert.equal(formatMinor(10), '0.10');
  assert.equal(formatMinor(-123456), '-1234.56');
  assert.equal(formatMinor(Number.MAX_SAFE_INTEGER), '90071992547409.91');
  assert.throws(() => formatMinor(1.5), /invalidAmount/);
});

test('a receipt total wins over subtotal, tax, cash and change', () => {
  const receipt = extractReceipt(`ACME SUPPLIES
Receipt No. R-184
Date: 2026-10-04
Subtotal USD 100.00
Sales tax 13.00
TOTAL USD 113.00
Cash tendered 200.00
Change 87.00`);
  assert.equal(receipt.merchant, 'ACME SUPPLIES');
  assert.equal(receipt.reference, 'R-184');
  assert.equal(receipt.date, '2026-10-04');
  assert.equal(receipt.amount, '113.00');
  assert.equal(receipt.currency, 'USD');
  assert.equal(receipt.warning, 'reviewExtraction');
});

test('discount and tendered totals do not conflict with the amount of the sale', () => {
  const receipt = extractReceipt(`Cider Cellar
Sales Receipt
Sub Total: £8.00
Line Discount: -£3.00
Transaction Discount: -£0.50
Discount Total: -£3.50
Total: £4.50
Cash £5.00
Tendered Total: £5.00
Change: £0.50
22285 24/09/2018 14:30 Admin`);
  assert.equal(receipt.merchant, 'Cider Cellar');
  assert.equal(receipt.amount, '4.50');
  assert.equal(receipt.currency, 'GBP');
  assert.equal(receipt.date, '24/09/2018');
  assert.equal(receipt.warning, 'reviewExtraction');
  assert.equal(extractReceipt('Shop\nTOTAL DISCOUNT £3.50\nTOTAL TENDERED £5.00\nTOTAL £4.50').amount, '4.50');
});

test('a receipt header does not become the merchant when its logo was missed', () => {
  const receipt = extractReceipt(`SALES RECEIPT
Cay tam Desription Price
1x Bulmers Original Bottle £4.00
1x Bulmers Pear Bottle £4.00
2x Items Sold
Sub Total: £8.00
Line Discount: £3.00
Transaction Discount! £0.50
Discount Total: -£3.50
Total: £4.50
Cash £5.00
Tendered Total: £5.00
Change: £0.50
THANK YOU
2228% 24/09/2018 14:30 Admin`);
  assert.equal(receipt.merchant, '');
  assert.equal(receipt.reference, '');
  assert.equal(receipt.amount, '4.50');
  assert.equal(receipt.currency, 'GBP');
  assert.equal(receipt.date, '24/09/2018');
  assert.equal(extractReceipt('Cider Cellar\nSALES RECEIPT\nQty Item Description Price\n1 Cider £4.50\nTOTAL £4.50').merchant, 'Cider Cellar');
});

test('a receipt template uses its discounted total and keeps a bare dollar currency unresolved', () => {
  const receipt = extractReceipt(`LOREM IPSUM DOLOR SIT AMET
RECEIPT #1234
CASHIER: 005
15/11/2019
QTY DESCRIPTION PRICE
SUBTOTAL $140.00
LOYALTY MEMBER -$5.00
TOTAL AMOUNT $135.00
CASH $150.00
CHANGE $15.00`);
  assert.equal(receipt.merchant, 'LOREM IPSUM DOLOR SIT AMET');
  assert.equal(receipt.reference, '1234');
  assert.equal(receipt.amount, '135.00');
  assert.equal(receipt.currency, '');
  assert.equal(receipt.date, '15/11/2019');
});

test('stronger final labels win over an ordinary total', () => {
  assert.equal(extractReceipt('Shop\nTOTAL 20.00\nGrand total EUR 24,00').amount, '24.00');
  assert.equal(extractReceipt('Shop\nTOTAL 30.00\nAmount due GBP 12.50').amount, '12.50');
  assert.equal(extractReceipt('Shop\nBalance due C$0.00').amount, '0.00');
});

test('a total printed on the next line is recognized without eating another label', () => {
  const receipt = extractReceipt('Shop\nGRAND TOTAL\nEUR 1.234,56');
  assert.equal(receipt.amount, '1234.56');
  assert.equal(receipt.currency, 'EUR');
  assert.equal(extractReceipt('Shop\nTOTAL\nTax 12.30').amount, '');
});

test('competing totals remain blank while duplicate identical totals are harmless', () => {
  const receipt = extractReceipt('Shop\nTOTAL USD 20.00\nTOTAL USD 30.00');
  assert.equal(receipt.amount, '');
  assert.equal(receipt.warning, 'ambiguousTotal');
  assert.deepEqual(receipt.candidates.map((candidate) => candidate.amount), ['20.00', '30.00']);
  assert.equal(extractReceipt('Shop\nTOTAL 20.00\nTOTAL PAID 20.00').amount, '20.00');
});

test('item counts accompanying a total are not monetary values or unit prices', () => {
  assert.equal(extractReceipt('Shop\nTOTAL 2 items $23.00').amount, '23.00');
  assert.equal(extractReceipt('Shop\nTOTAL (2 ITEMS) CAD 23.00').amount, '23.00');
  assert.equal(extractReceipt('Shop\nTOTAL 2 items @ $11.50').amount, '');
  assert.equal(extractReceipt('Shop\nTOTAL 2 items @ $11.50\n99.00').amount, '');
  assert.equal(extractReceipt('Shop\nTOTAL 2 items').amount, '');
});

test('an explicit refund total is negative without applying a refund policy to a sale', () => {
  assert.equal(extractReceipt('Shop\nREFUND TOTAL CAD 12.34').amount, '-12.34');
  assert.equal(extractReceipt('Shop\nTOTAL REFUND CAD -12.34').amount, '-12.34');
  assert.equal(extractReceipt('Shop\nAMOUNT REFUNDED £12.34').amount, '-12.34');
  assert.equal(extractReceipt('Shop\nRefund policy: 30 days\nTOTAL CAD 12.34').amount, '12.34');
});

test('the largest unlabeled number and nonpayment totals do not become document totals', () => {
  for (const text of ['Shop\nItem 500.00\nTax 50.00\nCash 1000.00',
    'Shop\nSUBTOTAL 20.00\nTOTAL TAX 2.00\nTOTAL SAVINGS 30.00',
    'Shop\nTOTAL SALES TAX 2.00\nGST TOTAL 2.00\nTOTAL BEFORE TAX 20.00',
    'Shop\nTotal items 12\nTotal quantity 12\nTotal points 9999',
    'Shop\nTotal 1e3', 'Shop\nTotal 1.234', 'Shop\nTotal 20%', 'Shop\nTotal 2026/10/04']) {
    const receipt = extractReceipt(text);
    assert.equal(receipt.amount, '', text);
    assert.equal(receipt.warning, 'missingTotal', text);
  }
});

test('currency evidence never expands a bare dollar or yen sign into a guess', () => {
  assert.equal(extractReceipt('Shop\nTOTAL $12.00').currency, '');
  assert.equal(extractReceipt('Shop\nTOTAL ¥1200').currency, '');
  assert.equal(extractReceipt('Shop\nTOTAL C$12.00').currency, 'CAD');
  assert.equal(extractReceipt('Shop\nTOTAL €12,00').currency, 'EUR');
  assert.equal(extractReceipt('Shop\nTOTAL £12.00').currency, 'GBP');
  assert.equal(extractReceipt('Shop\nTOTAL ₹12.00').currency, 'INR');
  assert.equal(extractReceipt('Shop\nCurrency CAD\nTOTAL 12.00').currency, 'CAD');
});

test('a foreign symbol misread on tender cannot assign the bare-dollar sale currency', () => {
  const receipt = extractReceipt(`LOREM IPSUM DOLOR SIT AMET
RECEIPT #1234
15/11/2019
SUBTOTAL $140.00
LOYALTY MEMBER -$5.00
TOTAL AMOUNT $135.00
CASH £150.00
CHANGE $15.00`);
  assert.equal(receipt.amount, '135.00');
  assert.equal(receipt.currency, '');
  assert.equal(extractReceipt('Shop\nTOTAL $135.00\nCASH €150.00').currency, '');
  assert.equal(extractReceipt('Shop\nTOTAL\n$135.00\nCASH £150.00').currency, '');
  assert.equal(extractReceipt('Shop\nTOTAL ¥1350\nCASH £1500').currency, '');
  assert.equal(extractReceipt('Shop\nCurrency CAD\nTOTAL $135.00').currency, 'CAD');
  assert.equal(extractReceipt('Shop\nPrices in C$\nTOTAL $135.00').currency, 'CAD');
  assert.equal(extractReceipt('Shop\nCurrency GBP\nTOTAL $135.00').currency, '');
  assert.equal(extractReceipt('Shop\nCurrency JPY\nTOTAL ¥1350').currency, 'JPY');
  assert.equal(extractReceipt('Shop\nCurrency CAD\nTOTAL ¥1350').currency, '');
  assert.equal(extractReceipt('Shop\nUSD exchange rate 1.50\nTOTAL\nCAD 135.00').currency, 'CAD');
});

test('currency on the chosen total beats a document mentioning another currency', () => {
  assert.equal(extractReceipt('Shop\nUSD exchange rate 1.50\nTOTAL CAD 12.00').currency, 'CAD');
  assert.equal(extractReceipt('Shop\nUSD exchange rate 1.50\nCAD accepted\nTOTAL 12.00').currency, '');
  assert.equal(extractReceipt('Shop\nTOTAL USD 12.00 EUR').currency, '');
  assert.equal(extractReceipt('Shop\nTOTAL USD 12.00\nTOTAL EUR 12.00').amount, '');
  assert.equal(extractReceipt('Shop\nTOTAL USD 12.00\nTOTAL EUR 12.00').warning, 'ambiguousTotal');
});

test('printed dates keep their order and invoice dates take priority over due dates', () => {
  const receipt = extractReceipt('Invoice\nAcme Company\nDue date: 2026-11-04\nInvoice Date: 03/04/2026\nInvoice # A-99\nAmount Due 25.00');
  assert.equal(receipt.merchant, 'Acme Company');
  assert.equal(receipt.date, '03/04/2026');
  assert.equal(receipt.reference, 'A-99');
  assert.equal(extractReceipt('Acme\nDate: Oct 4, 2026\nTotal 25.00').date, 'Oct 4, 2026');
});

test('plain invoice and receipt references do not become merchants or date labels', () => {
  const invoice = extractReceipt('INVOICE INV-208\nMAPLE OFFICE SUPPLIES\nInvoice Date: 2026-10-03\nAMOUNT DUE CAD 45.20');
  assert.equal(invoice.reference, 'INV-208');
  assert.equal(invoice.merchant, 'MAPLE OFFICE SUPPLIES');
  assert.equal(extractReceipt('NORTH STREET CAFE\nRECEIPT R-1042\nTOTAL CAD 24.30').reference, 'R-1042');
  assert.equal(extractReceipt('INVOICE\nACME\nInvoice Date: 2026-10-03\nTotal 5.00').reference, '');
});

test('only confirmed valid records enter totals and currencies never share a sum', () => {
  const summary = summarize([
    { currency: 'usd', amount: '0.10', confirmed: true },
    { currency: 'USD', amount: '0.20', confirmed: true },
    { currency: 'EUR', amount: '2,00', confirmed: true },
    { currency: 'EUR', amount: '-0.50', confirmed: true },
    { currency: '', amount: '3.00', confirmed: true },
    { currency: 'USD', amount: '999.00', confirmed: false },
    { currency: 'USD', amount: '1.234', confirmed: true },
    { currency: 'dollars', amount: '1.00', confirmed: true },
  ]);
  assert.equal(summary.count, 8);
  assert.equal(summary.confirmedCount, 5);
  assert.equal(summary.reviewCount, 1);
  assert.equal(summary.invalidCount, 2);
  assert.deepEqual(summary.totals.map(({ currency, count, minor, amount }) => ({ currency, count, minor, amount })), [
    { currency: '', count: 1, minor: 300, amount: '3.00' },
    { currency: 'EUR', count: 2, minor: 150, amount: '1.50' },
    { currency: 'USD', count: 2, minor: 30, amount: '0.30' },
  ]);
});

test('unsafe aggregate totals are reported instead of rounded', () => {
  const summary = summarize([
    { currency: 'USD', amount: '90071992547409.91', confirmed: true },
    { currency: 'USD', amount: '0.01', confirmed: true },
  ]);
  assert.equal(summary.totals[0].minor, null);
  assert.equal(summary.totals[0].amount, '');
  assert.equal(summary.totals[0].warning, 'totalOverflow');
});

test('CSV retains every document and escapes separators, quotes and spreadsheet formulas', () => {
  const csv = buildCsv([
    { name: '=HYPERLINK("x")', merchant: 'ACME, "North"\nBranch', date: '2026-10-04', reference: '@SUM(1)', currency: 'USD', amount: '-12.30', confirmed: true },
    { name: 'photo2.jpg', merchant: ' +1+2', amount: '1.234', confirmed: false },
  ], { filename: 'Document', amount: 'Value', confirmed: 'Reviewed', yes: 'Yes', no: 'No' });
  assert.ok(csv.startsWith('"Document","merchant","date","reference","currency","Value","Reviewed"\r\n'));
  assert.ok(csv.includes('"\'=HYPERLINK(""x"")"'));
  assert.ok(csv.includes('"ACME, ""North""\nBranch"'));
  assert.ok(csv.includes('"\'@SUM(1)"'));
  assert.ok(csv.includes('"-12.30","Yes"'));
  assert.ok(csv.includes('"\' +1+2"'));
  assert.ok(csv.includes('"1.234","No"'));
});

test('mailto encodes report data as a body and uses CRLF without adding headers', () => {
  const uri = buildMailto({
    to: 'owner@example.com', subject: 'Receipts & invoices?',
    body: 'Document: 1&bcc=other@example.com\nValue: €12.30\rCount: 1\r\nEnd',
  });
  assert.ok(uri.startsWith('mailto:owner@example.com?subject=Receipts%20%26%20invoices%3F&body='));
  assert.equal(decodeURIComponent(uri.split('&body=')[1]), 'Document: 1&bcc=other@example.com\r\nValue: €12.30\r\nCount: 1\r\nEnd');
  assert.equal((uri.match(/&body=/g) ?? []).length, 1);
});

test('mailto rejects recipient and subject header injection, including surrounding newlines', () => {
  for (const to of ['owner@example.com\r\nbcc:other@example.com', '\nowner@example.com', 'owner@example.com\n', 'not an address', 'owner@example..com']) {
    assert.equal(buildMailto({ to, subject: 'Receipts', body: 'One' }), null, to);
  }
  assert.equal(buildMailto({ to: 'owner@example.com', subject: 'Receipts\nbcc:other@example.com' }), null);
  assert.ok(buildMailto({ to: '', subject: 'Receipts' }).startsWith('mailto:?subject='));
  assert.ok(buildMailto({ to: 'a@example.com, b@example.com' }).startsWith('mailto:a@example.com,b@example.com?'));
  assert.ok(buildMailto({ to: 'name+tag@example.com' }).startsWith('mailto:name%2Btag@example.com?'));
});


test('possible photo duplicates use filename and size without merging their records', () => {
  const first = { file: { name: 'IMG_0001.jpg', size: 123 }, confirmed: true, amount: '10.00' };
  const second = { file: { name: 'IMG_0001.jpg', size: 123 }, confirmed: false, amount: '20.00' };
  const resized = { file: { name: 'IMG_0001.jpg', size: 124 } };
  const renamed = { file: { name: 'invoice.jpg', size: 123 } };
  const records = [first, second, resized, renamed];
  const before = JSON.stringify(records);
  assert.deepEqual([...duplicatePhotoCounts(records)], [[first, 2], [second, 2]]);
  assert.equal(JSON.stringify(records), before);
  assert.equal(duplicatePhotoCounts([first, resized, renamed]).size, 0);
  assert.equal(duplicatePhotoCounts([first, second, { file: first.file }]).get(first), 3);
});

test('filename and byte count groups cannot collide through a delimiter or folded name', () => {
  const a = { file: { name: 'photo:1', size: 23 } };
  const b = { file: { name: 'photo', size: 123 } };
  const c = { file: { name: 'PHOTO:1', size: 23 } };
  assert.equal(duplicatePhotoCounts([a, b, c]).size, 0);
  assert.equal(duplicatePhotoCounts([{ file: null }, {}, { file: { name: 'photo', size: NaN } }]).size, 0);
});
