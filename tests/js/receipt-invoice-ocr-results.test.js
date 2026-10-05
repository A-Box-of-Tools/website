/**
 * Strong body text cannot rescue an unreadable merchant logo. These fixtures
 * preserve the line boundaries and confidence evidence used for that decision.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { merchantFromRecognition, receiptFromRecognition, needsRecoveryRecognition, needsHeaderRecognition } from '../../tools/receipt-invoice-extractor/src/ocr-results.js';

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

test('a single table-column heading is a boundary before a strong product fragment can become the merchant', () => {
  for (const heading of ['Price', 'Description', 'Qty', 'Quantity', 'Unit price', 'Rate']) {
    assert.equal(merchantFromRecognition(recognition([
      ['NORTH MARKET', 35], [heading, 45], ['plies $20.00', 98], ['TOTAL $22.60', 99],
    ])), '', heading);
    assert.equal(merchantFromRecognition(recognition([
      ['NORTH MARKET', 95], [heading, 99], ['Office supplies', 98], ['TOTAL $22.60', 99],
    ])), 'NORTH MARKET', heading);
  }
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

test('recovery is bounded to missing or weak critical evidence rather than ambiguous bare currency symbols', () => {
  const data = recognition([
    ['A SHOP', 94], ['Date: 24/09/2018', 95], ['TOTAL $4.50', 97],
  ]);
  data.text = 'A SHOP\nDate: 24/09/2018\nTOTAL $4.50';
  assert.equal(needsRecoveryRecognition(data), false);
  data.blocks[0].paragraphs[0].lines[2].confidence = 45;
  assert.equal(needsRecoveryRecognition(data), true);
  data.blocks[0].paragraphs[0].lines[2].confidence = 97;
  data.confidence = 71;
  assert.equal(needsRecoveryRecognition(data), true);
  data.confidence = 95;
  data.text = 'A SHOP\nDate: 24/09/2018\nSubtotal $4.50';
  assert.equal(needsRecoveryRecognition(data), true);
  data.text = 'A SHOP\nTOTAL $4.50';
  assert.equal(needsRecoveryRecognition(data), true);
});

test('a recovery reading fills missing fields without parsing a combined two-document text', () => {
  const result = receiptFromRecognition({
    bodyText: 'A SHOP\nSubtotal CAD 12.00', merchant: 'A SHOP',
    recoveryText: 'A SHOP\nReceipt No. R-9\nDate: 2026-10-04\nTOTAL CAD 13.56',
    recoveryMerchant: 'A SHOP', recoveryConfidence: 85,
  });
  assert.equal(result.merchant, 'A SHOP');
  assert.equal(result.reference, 'R-9');
  assert.equal(result.date, '2026-10-04');
  assert.equal(result.currency, 'CAD');
  assert.equal(result.amount, '13.56');
  assert.equal(result.warning, 'reviewExtraction');
});

test('conflicting body passes blank financial, date and reference fields for explicit review', () => {
  const result = receiptFromRecognition({
    bodyText: 'A SHOP\nReceipt No. R-9\nDate: 2026-10-04\nTOTAL CAD 13.56',
    merchant: 'A SHOP',
    recoveryText: 'A SHOP\nReceipt No. R-8\nDate: 2026-10-05\nTOTAL USD 18.56',
    recoveryMerchant: 'ANOTHER NAME', recoveryConfidence: 93,
  });
  for (const field of ['amount', 'date', 'reference', 'currency']) assert.equal(result[field], '');
  assert.equal(result.merchant, 'A SHOP');
  assert.equal(result.warning, 'conflictingRecognition');
  assert.ok(result.candidates.some(candidate => candidate.source === 'recovery' && candidate.amount === '18.56'));
});

test('alternate punctuation and letter case are agreement rather than conflicting extraction', () => {
  const result = receiptFromRecognition({
    bodyText: 'A SHOP\nReceipt No. R-9\nDate: 24/09/2018\nTOTAL GBP 4.50',
    recoveryText: 'A SHOP\nReceipt No. r-9\nDate: 24-09-2018\nTOTAL GBP 4.50',
    recoveryConfidence: 92,
  });
  assert.equal(result.reference, 'R-9');
  assert.equal(result.date, '24/09/2018');
  assert.equal(result.amount, '4.50');
  assert.equal(result.warning, 'reviewExtraction');
});

test('unambiguous written, ISO and numeric dates compare by calendar day while retaining the primary spelling', () => {
  for (const [primary, recovery] of [
    ['Oct 04 2026', '2026/10/04'], ['4 October 2026', '2026-10-04'],
    ['24/10/2026', '2026-10-24'], ['10/24/2026', '24/10/2026'],
  ]) {
    const result = receiptFromRecognition({
      bodyText: `A SHOP\nDate: ${primary}\nTOTAL CAD 27.10`,
      recoveryText: `A SHOP\nDate: ${recovery}\nTOTAL CAD 27.10`, recoveryConfidence: 94,
    });
    assert.equal(result.date, primary, `${primary} versus ${recovery}`);
    assert.equal(result.warning, 'reviewExtraction');
  }
});

test('different calendar dates and ambiguous numeric orders remain conflicts rather than locale guesses', () => {
  for (const [primary, recovery] of [
    ['Oct 04 2026', '2026/10/05'], ['03/04/2026', '2026-03-04'],
    ['03/04/2026', '2026-04-03'], ['03/04/2026', '04/03/2026'],
  ]) {
    const result = receiptFromRecognition({
      bodyText: `A SHOP\nDate: ${primary}\nTOTAL CAD 27.10`,
      recoveryText: `A SHOP\nDate: ${recovery}\nTOTAL CAD 27.10`, recoveryConfidence: 94,
    });
    assert.equal(result.date, '', `${primary} versus ${recovery}`);
    assert.equal(result.warning, 'conflictingRecognition');
  }
  const sameAmbiguous = receiptFromRecognition({
    bodyText: 'A SHOP\nDate: 03/04/2026\nTOTAL CAD 27.10',
    recoveryText: 'A SHOP\nDate: 03-04-2026\nTOTAL CAD 27.10', recoveryConfidence: 94,
  });
  assert.equal(sameAmbiguous.date, '03/04/2026');
  assert.equal(sameAmbiguous.warning, 'reviewExtraction');
});

test('a misread foreign symbol on cash cannot fill a missing dollar-sale currency', () => {
  const result = receiptFromRecognition({
    bodyText: 'A SHOP\nDate: 24/09/2018\nTOTAL $4.50\nCASH $5.00',
    recoveryText: 'A SHOP\nDate: 24/09/2018\nTOTAL $4.50\nCASH £5.00',
    recoveryConfidence: 86,
  });
  assert.equal(result.amount, '4.50');
  assert.equal(result.currency, '');
  assert.equal(result.warning, 'reviewExtraction');
});

test('a recovery cannot silently settle an ambiguous primary total or fill weak missing fields', () => {
  const ambiguous = receiptFromRecognition({
    bodyText: 'A SHOP\nTOTAL CAD 13.56\nTOTAL CAD 18.56',
    recoveryText: 'A SHOP\nTOTAL CAD 13.56', recoveryConfidence: 95,
  });
  assert.equal(ambiguous.amount, '');
  assert.equal(ambiguous.warning, 'ambiguousTotal');
  const weak = receiptFromRecognition({
    bodyText: 'A SHOP\nTOTAL CAD 13.56',
    recoveryText: 'A SHOP\nDate: 2026-10-04\nTOTAL CAD 13.56', recoveryConfidence: 45,
  });
  assert.equal(weak.amount, '13.56');
  assert.equal(weak.date, '');
});

test('an ambiguous second body reading cannot silently leave a confident first amount', () => {
  const result = receiptFromRecognition({
    bodyText: 'A SHOP\nTOTAL CAD 13.56',
    recoveryText: 'A SHOP\nTOTAL CAD 13.56\nTOTAL CAD 18.56', recoveryConfidence: 90,
  });
  assert.equal(result.amount, '');
  assert.equal(result.warning, 'conflictingRecognition');
});

test('missing recovery fields require finite numeric confidence of at least sixty', () => {
  const evidence = {
    bodyText: 'A SHOP', merchant: 'A SHOP',
    recoveryText: 'A SHOP\nReceipt No. R-9\nDate: 2026-10-04\nTOTAL CAD 13.56',
  };
  for (const confidence of [undefined, null, NaN, Infinity, -Infinity, '95', 59.9]) {
    const result = receiptFromRecognition({ ...evidence, recoveryConfidence: confidence });
    for (const field of ['amount', 'date', 'reference', 'currency']) assert.equal(result[field], '', `${field}, ${confidence}`);
    assert.equal(result.warning, 'missingTotal');
  }
  const accepted = receiptFromRecognition({ ...evidence, recoveryConfidence: 60 });
  assert.equal(accepted.amount, '13.56');
  assert.equal(accepted.date, '2026-10-04');
  assert.equal(accepted.reference, 'R-9');
  assert.equal(accepted.currency, 'CAD');
  assert.equal(accepted.warning, 'reviewExtraction');
});

test('recovery location guesses cannot settle primary competing currencies or override a printed currency', () => {
  const address = 'Store country: Canada';
  const ambiguous = receiptFromRecognition({
    bodyText: `A SHOP\n${address}\nUSD accepted\nCAD accepted\nDate: 2026-10-04\nTOTAL $13.56`,
    recoveryText: `A SHOP\n${address}\nDate: 2026-10-04\nTOTAL $13.56`,
    recoveryConfidence: 92,
  });
  assert.equal(ambiguous.currency, '');
  assert.ok(!ambiguous.currencySource);
  const explicit = receiptFromRecognition({
    bodyText: `A SHOP\n${address}\nDate: 2026-10-04\nTOTAL USD 13.56`,
    recoveryText: `A SHOP\n${address}\nDate: 2026-10-04\nTOTAL $13.56`,
    recoveryConfidence: 92,
  });
  assert.equal(explicit.currency, 'USD');
  assert.equal(explicit.amount, '13.56');
  assert.equal(explicit.warning, 'reviewExtraction');
  assert.ok(!explicit.currencySource);
});

test('an unknown printed currency in the primary pass cannot become a location guess in recovery', () => {
  const result = receiptFromRecognition({
    bodyText: 'A SHOP\nStore country: Canada\nDate: 2026-10-04\nTOTAL BHD 13.56',
    recoveryText: 'A SHOP\nStore country: Canada\nDate: 2026-10-04\nTOTAL 13.56',
    recoveryConfidence: 92,
  });
  assert.equal(result.currency, '');
  assert.ok(!result.currencySource);
});

test('conflicting dates withdraw date-dependent location currency guesses without discarding stable currencies', () => {
  for (const [country, currency] of [['France', ''], ['Canada', 'CAD']]) {
    const result = receiptFromRecognition({
      bodyText: `A SHOP\nStore country: ${country}\nDate: 2026-10-04\nTOTAL 13.56`,
      recoveryText: `A SHOP\nStore country: ${country}\nDate: 1999-10-04\nTOTAL 13.56`,
      recoveryConfidence: 92,
    });
    assert.equal(result.date, '', country);
    assert.equal(result.currency, currency, country);
    assert.equal(result.warning, 'conflictingRecognition', country);
    if (!currency) assert.ok(!result.currencySource && !result.locationEvidence);
  }
});

test('a recovery date can support its own historically valid location currency', () => {
  const result = receiptFromRecognition({
    bodyText: 'A SHOP\nStore country: France\nTOTAL 13.56',
    recoveryText: 'A SHOP\nStore country: France\nDate: 2026-10-04\nTOTAL 13.56',
    recoveryConfidence: 92,
  });
  assert.equal(result.date, '2026-10-04');
  assert.equal(result.currency, 'EUR');
  assert.equal(result.currencySource, 'location');
  assert.equal(result.locationEvidence, 'Store country: France');
});

test('the closer header is conditional on missing issuer or unresolved dollar/yen currency evidence', () => {
  assert.equal(needsHeaderRecognition({ bodyText: 'A SHOP\nDate: 2026-10-04\nTOTAL USD 13.56', merchant: 'A SHOP' }), false);
  assert.equal(needsHeaderRecognition({ bodyText: 'A SHOP\nDate: 2026-10-04\nTOTAL GBP 13.56', merchant: '' }), true);
  assert.equal(needsHeaderRecognition({ bodyText: 'A SHOP\nDate: 2026-10-04\nTOTAL $13.56', merchant: 'A SHOP' }), true);
  assert.equal(needsHeaderRecognition({ bodyText: 'A SHOP\nDate: 2026-10-04\nTOTAL ¥1356', merchant: 'A SHOP' }), true);
});

test('closer header text supplies only a missing merchant and never its financial fields', () => {
  const result = receiptFromRecognition({
    bodyText: 'Receipt No. R-9\nDate: 2026-10-04\nTOTAL CAD 13.56', merchant: '',
    headerText: 'GOOD SHOP\nStore country: Canada\nInvoice No. H-999\nDate: 2001-01-02\nGrand Total USD 999.00',
    headerMerchant: 'GOOD SHOP', headerConfidence: 96,
  });
  assert.equal(result.merchant, 'GOOD SHOP');
  assert.equal(result.reference, 'R-9');
  assert.equal(result.date, '2026-10-04');
  assert.equal(result.amount, '13.56');
  assert.equal(result.currency, 'CAD');
  assert.ok(result.candidates.every(candidate => candidate.amount !== '999.00'));
});

test('a closer issuer address can resolve bare dollars without overriding printed or conflicting body codes', () => {
  for (const [total, currency] of [['TOTAL $13.56', 'CAD'], ['TOTAL USD 13.56', 'USD'], ['TOTAL BHD 13.56', '']]) {
    const result = receiptFromRecognition({
      bodyText: `A SHOP\nDate: 2026-10-04\n${total}`, merchant: 'A SHOP',
      headerText: 'ANOTHER SHOP\nStore country: Canada', headerMerchant: 'ANOTHER SHOP', headerConfidence: 94,
    });
    assert.equal(result.currency, currency, total);
    assert.equal(result.merchant, 'A SHOP', total);
  }
  const conflict = receiptFromRecognition({
    bodyText: 'A SHOP\nDate: 2026-10-04\nTOTAL CAD 13.56',
    recoveryText: 'A SHOP\nDate: 2026-10-04\nTOTAL USD 13.56', recoveryConfidence: 94,
    headerText: 'A SHOP\nStore country: Canada', headerMerchant: 'A SHOP', headerConfidence: 94,
  });
  assert.equal(conflict.currency, '');
  assert.equal(conflict.warning, 'conflictingRecognition');
});

test('header location respects the body date and money-symbol family rather than its own date or currency words', () => {
  for (const [date, currency] of [['2026-10-04', 'EUR'], ['1999-10-04', '']]) {
    const result = receiptFromRecognition({
      bodyText: `A SHOP\nDate: ${date}\nTOTAL 13.56`, merchant: '',
      headerText: 'A SHOP\nStore country: France\nDate: 2026-10-04', headerMerchant: 'A SHOP', headerConfidence: 94,
    });
    assert.equal(result.date, date);
    assert.equal(result.currency, currency);
  }
  const dollars = receiptFromRecognition({
    bodyText: 'A SHOP\nDate: 2026-10-04\nTOTAL $13.56', merchant: '',
    headerText: 'A SHOP\nStore country: United Kingdom', headerMerchant: 'A SHOP', headerConfidence: 94,
  });
  assert.equal(dollars.currency, '');
});

test('a receipt date outranks an appended card-slip fallback while true receipt date conflicts stay blank', () => {
  const primaryPayment = receiptFromRecognition({
    bodyText: 'A SHOP\nTOTAL CAD 13.56\nTRANSACTION RECORD\nCard type: VISA\nAuth# 1234\nDate: 2023-01-19',
    recoveryText: 'A SHOP\nDate: 2023-01-18\nTOTAL CAD 13.56\nTRANSACTION RECORD\nCard type: VISA\nAuth# 1234\nDate: 2023-01-19',
    recoveryConfidence: 94,
  });
  assert.equal(primaryPayment.date, '2023-01-18');
  assert.ok(!primaryPayment.dateSource);
  assert.equal(primaryPayment.warning, 'reviewExtraction');
  const recoveryPayment = receiptFromRecognition({
    bodyText: 'A SHOP\nDate: 2023-01-18\nTOTAL CAD 13.56',
    recoveryText: 'A SHOP\nTOTAL CAD 13.56\nTRANSACTION RECORD\nCard type: VISA\nAuth# 1234\nDate: 2023-01-19', recoveryConfidence: 94,
  });
  assert.equal(recoveryPayment.date, '2023-01-18');
  assert.equal(recoveryPayment.warning, 'reviewExtraction');
});
