/**
 * Strong body text cannot rescue an unreadable merchant logo. These fixtures
 * preserve the line boundaries and confidence evidence used for that decision.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { merchantFromRecognition, receiptFromRecognition } from '../../tools/receipt-invoice-extractor/src/ocr-results.js';

function recognition(entries) {
  return {
    confidence: 95,
    blocks: [{ paragraphs: [{ lines: entries.map(([text, confidence], index) => ({
      text, confidence, bbox: { x0: 20, y0: index * 30, x1: 400, y1: index * 30 + 20 },
    })) }] }],
  };
}

test('weak logo text and a strong generic receipt header leave the merchant blank', () => {
  const data = recognition([
    ['q', 44], ['| EC CAT', 31], ['CIDET cellar', 45], ['CIDER PROSECCO BAR', 25],
    ['SALES RECEIPT', 96], ['Qty Description Price', 67],
    ['Bulmers Original Bottle', 96], ['Total: £4.50', 98],
  ]);
  assert.equal(merchantFromRecognition(data), '');
});

test('a strong template issuer is retained above the receipt fields', () => {
  const data = recognition([
    ['LOREM IPSUM DOLOR SIT AMET', 94], ['RECEIPT #1234', 97],
    ['CASHIER: 005', 96], ['15/11/2019', 97], ['TOTAL AMOUNT $135.00', 99],
  ]);
  assert.equal(merchantFromRecognition(data), 'LOREM IPSUM DOLOR SIT AMET');
});

test('a bounded logo pass may use 55 while full-document recognition keeps 60', () => {
  const data = recognition([
    ['a |', 29], ['CIDEr CeLLar', 59], ['BEF1PrOSece|Gif', 49],
  ]);
  assert.equal(merchantFromRecognition(data), '');
  assert.equal(merchantFromRecognition(data, { minimumConfidence: 55 }), 'CIDEr CeLLar');
  for (const minimumConfidence of [54, 101, NaN, '55']) {
    assert.equal(merchantFromRecognition(data, { minimumConfidence }), '');
  }
});

test('a low-confidence item-table boundary is kept before filtering weak lines', () => {
  assert.equal(merchantFromRecognition(recognition([
    ['CIDER CELLAR', 50], ['SALES RECEIPT', 98], ['Qty Desription Price', 35],
    ['Bulmers Pear Bottle', 97], ['TOTAL £4.50', 98],
  ])), '');
});

test('merchant names preserve letters, hyphens and compact numbers', () => {
  for (const name of ['Cider Cellar', 'ACME-OFFICE 24', 'Studio54', '7-ELEVEN', '123Movies']) {
    assert.equal(merchantFromRecognition(recognition([
      [name, 90], ['SALES RECEIPT', 99], ['QTY DESCRIPTION PRICE', 95], ['TOTAL 4.50', 99],
    ])), name);
  }
  assert.equal(merchantFromRecognition(recognition([['Cider Cellar', 60], ['TOTAL £4.50', 98]])), 'Cider Cellar');
  assert.equal(merchantFromRecognition(recognition([['Cider Cellar', 59.9], ['TOTAL £4.50', 98]])), '');
});

test('an invoice issuer can follow its generic heading but cannot come from billing details', () => {
  assert.equal(merchantFromRecognition(recognition([
    ['INVOICE', 99], ['MAPLE OFFICE SUPPLIES', 94], ['Invoice Date: 2026-10-03', 99],
    ['Bill to: Someone Else', 99],
  ])), 'MAPLE OFFICE SUPPLIES');
  assert.equal(merchantFromRecognition(recognition([
    ['INVOICE', 99], ['Bill to: Someone Else', 99], ['A CUSTOMER COMPANY', 99],
  ])), '');
});

test('geometry determines the leading order across blocks without editing the spelling', () => {
  const data = recognition([['Shop & Co.', 93], ['QTY DESCRIPTION PRICE', 90], ['A PRODUCT', 99]]);
  data.blocks[0].paragraphs[0].lines.reverse();
  assert.equal(merchantFromRecognition(data), 'Shop & Co.');
});

test('missing confidence, structure or valid geometry does not manufacture a merchant', () => {
  assert.equal(merchantFromRecognition({ text: 'Cider Cellar\nTOTAL £4.50', confidence: 99 }), '');
  assert.equal(merchantFromRecognition(null), '');
  const missingConfidence = recognition([['Shop', undefined], ['TOTAL 4.50', 99]]);
  assert.equal(merchantFromRecognition(missingConfidence), '');
  const invalidBox = recognition([['Shop', 99]]);
  invalidBox.blocks[0].paragraphs[0].lines[0].bbox.x1 = NaN;
  assert.equal(merchantFromRecognition(invalidBox), '');
});

test('a logo hint can alter only the merchant, even when its text resembles financial fields', () => {
  const bodyText = `ACTUAL SHOP
Receipt No. R-184
Date: 2026-10-04
Subtotal USD 100.00
TOTAL USD 113.00
Cash tendered 200.00
Change 87.00`;
  const merchant = 'CAD SHOP Invoice # H-999 Date: 2001-01-02 Grand Total CAD 999.00';
  const result = receiptFromRecognition({ bodyText, merchant, text: `${merchant}\n${bodyText}` });
  assert.equal(result.merchant, merchant);
  assert.equal(result.reference, 'R-184');
  assert.equal(result.date, '2026-10-04');
  assert.equal(result.currency, 'USD');
  assert.equal(result.amount, '113.00');
  assert.equal(result.warning, 'reviewExtraction');
  assert.ok(result.candidates.length > 0);
  assert.ok(result.candidates.every(candidate => bodyText.split('\n').includes(candidate.label)));
  assert.ok(result.candidates.every(candidate => candidate.amount !== '999.00'));
});

test('an empty merchant hint is a deliberate filtered result rather than a fallback', () => {
  const bodyText = 'BODY NOISE\nTOTAL GBP 4.50';
  assert.equal(receiptFromRecognition({ bodyText, merchant: '' }).merchant, '');
  assert.equal(receiptFromRecognition({ bodyText }).merchant, 'BODY NOISE');
  assert.equal(receiptFromRecognition({ bodyText, merchant: 123 }).merchant, 'BODY NOISE');
  assert.equal(receiptFromRecognition({ text: 'Shop\nTOTAL GBP 4.50', merchant: 'Shop' }).amount, '');
});
