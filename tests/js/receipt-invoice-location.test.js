/**
 * Location can explain a bare dollar or yen sign only when it belongs to the
 * issuer. These fixtures keep customer addresses, products and conflicting
 * currency evidence from acquiring the issuer's local currency by accident.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { extractReceipt, parseAmount } from '../../tools/receipt-invoice-extractor/src/receipt.js';
import { inferLocationCurrency } from '../../tools/receipt-invoice-extractor/src/location-currency.js';

function receipt(address, total = 'TOTAL $12.50', date = '2026-10-04') {
  return extractReceipt(`ACME STORE\n${address}\nDate: ${date}\nQty Description Price\n1 Coffee 12.50\n${total}`);
}

test('a Canadian province and postal code resolve a bare dollar without needing a country name', () => {
  const result = receipt('100 King Street\nToronto, ON M5V 2T6');
  assert.equal(result.currency, 'CAD');
  assert.equal(result.currencySource, 'location');
  assert.equal(result.locationEvidence, 'Toronto, ON M5V 2T6');
  assert.equal(result.amount, '12.50');
  assert.equal(result.warning, 'reviewExtraction');
  assert.equal(receipt('Montreal, Québec H2Y 1C6').currency, 'CAD');
  const confusedZero = receipt('Markham, Ontario, L3R OY5');
  assert.equal(confusedZero.currency, 'CAD');
  assert.equal(confusedZero.locationEvidence, 'Markham, Ontario, L3R OY5');
  assert.equal(receipt('Markham L3R OY5').currency, '');
});

test('a full Canadian province and intact postal prefix can survive a damaged suffix inside a street address', () => {
  const result = receipt('5000 Hwy7 East Unit 200\nMarkham, Ontario, L3R AMI');
  assert.equal(result.currency, 'CAD');
  assert.equal(result.locationEvidence, 'Markham, Ontario, L3R AMI');
  assert.equal(receipt('5000 Highway 7 East\nMarkham, Ontario, L3R AMI').currency, 'CAD');
  for (const address of ['Markham, Ontario, L3R AMI', '5000 Hwy7 East\nMarkham Ontario',
    '5000 Hwy7 East\nMarkham ON L3R AMI', '5000 Hwy7 East\nOntario L3R AMI',
    '5000 Hwy7 East\nMarkham Ontario XXX AMI']) {
    assert.equal(receipt(address).currency, '', address);
  }
  assert.equal(receipt('5000 Hwy7 East\nMarkham, Ontario, L3R AMI\nUSA').currency, '');
  assert.equal(extractReceipt('A STORE\nQty Description Price\nTotal $27.10\n5000 Hwy7 East\nMarkham, Ontario, L3R AMI').currency, '');
});

test('broken adjacent item currency symbols do not outweigh a valid store address', () => {
  const result = extractReceipt('NORTH MARKET\nMarkham, Ontario, L3R OY5\nQty Description Price\nx1 € $14.99 14,991\nTotal $36.14');
  assert.equal(result.currency, 'CAD');
  assert.equal(result.currencySource, 'location');
  assert.equal(extractReceipt('NORTH MARKET\nStore country: Canada\nItem €14.99 $20.00\nTotal $36.14').currency, '');
  assert.equal(extractReceipt('NORTH MARKET\nStore country: Canada\nTotal €36.14').currency, 'EUR');
  const brokenTotal = extractReceipt('NORTH MARKET\nStore country: Canada\nTotal € $36.14');
  assert.equal(brokenTotal.currency, '');
  assert.equal(brokenTotal.currencyBlocked, true);
});

test('OCR decimal whitespace cannot promote a fractional suffix to a whole total', () => {
  for (const total of ['Total after Tax 36. 14', 'Total after Tax 36 .14', 'Total after Tax 36 . 14', 'Total after Tax 36, 14']) {
    const result = receipt('Store country: Canada', total);
    assert.equal(result.amount, '36.14', total);
    assert.equal(result.currency, 'CAD', total);
  }
  assert.equal(receipt('Store country: Canada', 'Total after Tax\n$36. 14').amount, '36.14');
  assert.equal(receipt('Store country: Canada', 'Total after Tax 36. 140').amount, '');
  for (const space of ['\u00a0', '\u2007', '\u2009', '\u202f']) {
    for (const value of [`36.${space}14`, `36${space}.14`, `36${space}.${space}14`, `36,${space}14`]) {
      assert.equal(receipt('Store country: Canada', `Total after Tax ${value}`).amount, '36.14', value);
      assert.equal(parseAmount(value), null, value);
    }
    assert.equal(receipt('Store country: Canada', `Total after Tax 36.${space}140`).amount, '');
  }
});

test('after-tax total labels cannot become merchant names or leave the issuer address open', () => {
  for (const tax of ['Tax', 'VAT', 'GST', 'HST', 'PST']) {
    const label = `Total after ${tax}`;
    assert.equal(extractReceipt(`${label} 36.14`).merchant, '', label);
    assert.equal(extractReceipt(`${label}\n36.14`).merchant, '', label);
    assert.equal(extractReceipt(`ANONYMOUS MARKET\n${label} 36\n100 King Street\nToronto ON M5V 2T6`).currency, '', label);
  }
});

test('a specific province and postal fragment outrank a UK shape only for the same token', () => {
  const result = receipt('100 King Street\nMarkham, Ontario, L3R 4MI');
  assert.equal(result.currency, 'CAD');
  assert.equal(result.locationEvidence, 'Markham, Ontario, L3R 4MI');
  assert.equal(receipt('100 King Street\nMarkham, Ontario, L3R 4MI SW1A 2AA').currency, '');
  assert.equal(receipt('100 King Street\nMarkham, Ontario, L3R 4MI\nUnited Kingdom').currency, '');
  assert.equal(receipt('10 Downing Street\nLondon SW1A 2AA', 'TOTAL 36.14').currency, 'GBP');
});

function terminalBlock(date, amount) {
  return `TRANSACTION RECORD
CardNumber: MASKED
CardType: VISA
CardEntry: TAPCHIP
TransType: PURCHASE
Amount $${amount}
Auth#: OMITTED
Reference#: CARD-EXAMPLE
TermID: OMITTED
Date: ${date}`;
}

test('main receipt header date and plural inline reference beat an attached terminal record', () => {
  const result = extractReceipt(`ANONYMOUS RESTAURANT
Markham, Ontario, L3R OY5
2026/09/26 13:06 Receipts P1042
Qty Description Price
Item 31.98
SubTotal 31. 98
HST 4.16
Total after Tax 36. 14
CreditCard 36. 14
${terminalBlock('26/09/26', '36.14')}`);
  assert.equal(result.amount, '36.14');
  assert.equal(result.currency, 'CAD');
  assert.equal(result.date, '2026/09/26');
  assert.equal(result.reference, 'P1042');
  assert.ok(!Object.hasOwn(result, 'dateSource'));
});

test('a second numeric receipt date remains printed and terminal references stay excluded', () => {
  const result = extractReceipt(`ANONYMOUS ELECTRONICS STORE
100 King Street
Toronto ON M5V 2T6
09/16/2026
Qty Description Price
Total: $113.56
${terminalBlock('26/09/16', '113.56')}`);
  assert.equal(result.amount, '113.56');
  assert.equal(result.date, '09/16/2026');
  assert.equal(result.reference, '');
});

test('an unreadable receipt date can fall back to an appended payment date without guessing its order', () => {
  const result = extractReceipt(`ANONYMOUS MARKET
Markham, Ontario, L3R 0Y5
202f10 04
Receipts P2042
Qty Description Price
Total $27.10
${terminalBlock('26/10/04', '27.10')}`);
  assert.equal(result.amount, '27.10');
  assert.equal(result.currency, 'CAD');
  assert.equal(result.date, '26/10/04');
  assert.equal(result.dateSource, 'payment');
  assert.equal(result.reference, 'P2042');
});

test('a narrowly damaged payment title still requires a preceding sale total and two terminal cues', () => {
  const body = `ANONYMOUS ELECTRONICS STORE
202f09 16
TOTAL CAD 113.56
TRANSACT [ON RECORD
TYPE:PURCHASE
CARD NUMBER: MASKED
DATE/TIME:26/09/16 10:33:03
REFERENCE#: CARD-EXAMPLE`;
  const result = extractReceipt(body);
  assert.equal(result.amount, '113.56');
  assert.equal(result.date, '26/09/16');
  assert.equal(result.dateSource, 'payment');
  assert.equal(result.reference, '');
  const readableHeader = extractReceipt(body.replace('202f09 16', '09/16/2026'));
  assert.equal(readableHeader.date, '09/16/2026');
  assert.ok(!Object.hasOwn(readableHeader, 'dateSource'));
  for (const cues of ['', 'CardNumber: MASKED\nCardType: VISA\n']) {
    const weak = extractReceipt(`ANONYMOUS MARKET\nTOTAL CAD 27.10\nTRANSACT [ON RECORD\n${cues}Date:26/10/04\nReference#: DOCUMENT-EXAMPLE`);
    assert.equal(weak.date, '26/10/04');
    assert.equal(weak.reference, 'DOCUMENT-EXAMPLE');
    assert.ok(!Object.hasOwn(weak, 'dateSource'));
  }
  const standalone = extractReceipt(body.replace('TOTAL CAD 113.56\n', '') + '\nTOTAL CAD 113.56');
  assert.equal(standalone.reference, 'CARD-EXAMPLE');
  assert.ok(!Object.hasOwn(standalone, 'dateSource'));
});

test('a standalone terminal receipt retains its own date and amount', () => {
  const result = extractReceipt(`ANONYMOUS MARKET\n${terminalBlock('26/10/04', '27.10')}\nTOTAL CAD 27.10`);
  assert.equal(result.amount, '27.10');
  assert.equal(result.date, '26/10/04');
  assert.equal(result.currency, 'CAD');
  assert.ok(!Object.hasOwn(result, 'dateSource'));
  const datedHeader = extractReceipt(`ANONYMOUS MARKET\nDate: 2026-10-04\n${terminalBlock('26/10/04', '27.10')}\nTOTAL CAD 27.10`);
  assert.equal(datedHeader.amount, '27.10');
  assert.equal(datedHeader.reference, 'CARD-EXAMPLE');
  assert.ok(!Object.hasOwn(datedHeader, 'dateSource'));
});

test('obviously invalid numeric date ranges do not become suggested dates', () => {
  for (const date of ['2026/00/16', '2026/09/00', '2026/13/16', '2026/09/40', '26/00/16', '26/35/45']) {
    assert.equal(extractReceipt(`A SHOP\nDate: ${date}\nTotal CAD 12.50`).date, '', date);
  }
  for (const date of ['09/16/2026', '16/09/2026', '26/09/16', '24/09/2018']) {
    assert.equal(extractReceipt(`A SHOP\nDate: ${date}\nTotal CAD 12.50`).date, date, date);
  }
});

test('US and Australian regions require their matching postcode and address context', () => {
  const us = receipt('40 Main Street\nSeattle, WA 98101');
  assert.equal(us.currency, 'USD');
  assert.equal(us.locationEvidence, 'Seattle, WA 98101');
  const au = receipt('12 George Street\nSydney NSW 2000');
  assert.equal(au.currency, 'AUD');
  assert.equal(au.locationEvidence, 'Sydney NSW 2000');
  assert.equal(receipt('California').currency, '');
  assert.equal(receipt('NSW').currency, '');
  assert.equal(receipt('98101').currency, '');
  assert.equal(receipt('Order ref: WA 98101').currency, '');
  assert.equal(receipt('Sydney New South Wales 2000').currency, 'AUD');
});

test('a merchant containing TOTAL does not close its own address block', () => {
  const result = extractReceipt('TOTAL WINE & MORE\n40 Main Street\nSeattle WA 98101\nDate: 2026-10-04\nTOTAL $12.50');
  assert.equal(result.merchant, 'TOTAL WINE & MORE');
  assert.equal(result.currency, 'USD');
  assert.equal(result.currencySource, 'location');
});

test('an unsupported three-letter currency adjoining a final amount blocks location guesses', () => {
  for (const total of ['TOTAL BHD12.00', 'TOTAL BHD 12.00', 'TOTAL 12.00 BHD', 'TOTAL\nBHD12.00']) {
    const result = receipt('10 Downing Street\nLondon SW1A 2AA', total);
    assert.equal(result.currency, '', total);
    assert.equal(result.currencyBlocked, true, total);
    assert.ok(!Object.hasOwn(result, 'currencySource'), total);
  }
  assert.equal(receipt('Store country: Canada', 'TOTAL 12.50').currencyBlocked, undefined);
});

test('standalone item-table headings do not become a merchant name', () => {
  for (const heading of ['Price', 'Description', 'Qty', 'Quantity', 'Item', 'Unit price', 'Rate']) {
    assert.equal(extractReceipt(`${heading}\nTOTAL 12.50`).merchant, '', heading);
    assert.equal(extractReceipt(`${heading}\nplies $20.00\nTOTAL $20.00`).merchant, '', heading);
    assert.equal(extractReceipt(`NORTH MARKET\n${heading}\nplies $20.00\nTOTAL $20.00`).merchant, 'NORTH MARKET', heading);
  }
});

test('a UK postcode is useful inside a short address rather than as an arbitrary reference', () => {
  const result = receipt('10 Downing Street\nLondon SW1A 2AA', 'TOTAL 12.50');
  assert.equal(result.currency, 'GBP');
  assert.equal(result.locationEvidence, 'London SW1A 2AA');
  assert.equal(receipt('Reference: SW1A 2AA', 'TOTAL 12.50').currency, '');
  assert.equal(receipt('SW1A 2AA', 'TOTAL 12.50').currency, '');
});

test('an explicit country in an issuer address supports common dollar and Asian currencies', () => {
  const fixtures = [
    ['20 Queen Street\nAuckland 1010\nNew Zealand', 'TOTAL $12.50', 'NZD'],
    ['12 Queens Road\nCentral\nHong Kong', 'TOTAL $12.50', 'HKD'],
    ['12 Queens Road\nHong Kong, China', 'TOTAL $12.50', 'HKD'],
    ['10 Marina Boulevard\nSingapore 018956', 'TOTAL $12.50', 'SGD'],
    ['Shibuya 1-2-3\nTokyo 150-0001\nJapan', 'TOTAL ¥1200', 'JPY'],
    ['88 Nanjing Road\nShanghai 200001\nChina', 'TOTAL ¥1200', 'CNY'],
    ['10 Park Street\nMumbai, Maharashtra 400001\nIndia', 'TOTAL 12.50', 'INR'],
  ];
  for (const [address, total, currency] of fixtures) {
    const result = receipt(address, total);
    assert.equal(result.currency, currency, address);
    assert.equal(result.currencySource, 'location', address);
  }
});

test('explicit store location labels can anchor a country while a country or city alone cannot', () => {
  const result = receipt('Store location: Canada');
  assert.equal(result.currency, 'CAD');
  assert.equal(result.locationEvidence, 'Store location: Canada');
  for (const address of ['Canada', 'Country: Canada', 'Toronto', 'London', 'Tokyo', 'China', 'CANADA CAFE', 'CAFE CANADA']) {
    assert.equal(receipt(address).currency, '', address);
  }
});

test('a printed currency on the selected total wins over the store location', () => {
  const result = receipt('100 King Street\nToronto ON M5V 2T6', 'TOTAL USD 12.50');
  assert.equal(result.currency, 'USD');
  assert.equal(result.amount, '12.50');
  assert.ok(!Object.hasOwn(result, 'currencySource'));
  assert.ok(!Object.hasOwn(result, 'locationEvidence'));
  assert.equal(receipt('Store country: Canada', 'TOTAL £12.50').currency, 'GBP');
});

test('location cannot settle competing printed currencies or an incompatible total symbol', () => {
  for (const text of [
    'ACME\nStore country: Canada\nUSD exchange rate 1.50\nCAD accepted\nTOTAL $12.50',
    'ACME\nStore country: Canada\nTOTAL USD 12.50 EUR',
    'ACME\nStore country: Canada\nTOTAL USD 12.50\nTOTAL EUR 12.50',
    'ACME\nStore country: Canada\nTOTAL $12.50\nCASH £20.00',
    'ACME\nStore country: Canada\nCurrency GBP\nTOTAL $12.50',
    'ACME\nStore country: Canada\nCurrency XYZ\nTOTAL $12.50',
    'ACME\nStore country: Canada\nTOTAL ¥1200',
    'ACME\nStore country: Japan\nTOTAL $12.50',
  ]) {
    const result = extractReceipt(text);
    assert.equal(result.currency, '', text);
    assert.ok(!Object.hasOwn(result, 'currencySource'), text);
  }
});

test('customer, shipping and remittance addresses cannot provide an issuer currency', () => {
  const address = '100 King Street\nToronto ON M5V 2T6\nCanada';
  for (const section of ['Bill to:', 'Billed to:', 'Ship to:', 'Delivery address:', 'Customer:',
    'Client:', 'Buyer:', 'Sold to:', 'Remit to:', 'Bank details:', 'Payment address:', 'Beneficiary:', 'Destination:']) {
    const result = extractReceipt(`ACME COMPANY\nInvoice 1001\n${section}\n${address}\nTOTAL $12.50`);
    assert.equal(result.currency, '', section);
    assert.ok(!Object.hasOwn(result, 'currencySource'), section);
  }
});

test('an issuer address stays useful when a customer address follows it', () => {
  const result = extractReceipt(`ACME COMPANY
100 King Street
Toronto ON M5V 2T6
Canada
Bill to:
Customer Company
40 Main Street
Seattle WA 98101
USA
Amount due $12.50`);
  assert.equal(result.currency, 'CAD');
  assert.equal(result.currencySource, 'location');
});

test('explicit seller address scope can reopen after a customer section', () => {
  const result = extractReceipt(`INVOICE 1001
Bill to:
CUSTOMER COMPANY
100 King Street
Toronto ON M5V 2T6
Canada
Seller:
ACME COMPANY
40 Main Street
Seattle WA 98101
USA
TOTAL $12.50`);
  assert.equal(result.currency, 'USD');
  assert.equal(result.currencySource, 'location');
});

test('mixed issuer and customer columns on one OCR line are not treated as a clean address', () => {
  const result = extractReceipt('ACME\nStore address: 100 King Street, Canada | Bill to: 40 Main Street, USA\nTOTAL $12.50');
  assert.equal(result.currency, '');
});

test('product origins and travel destinations stay outside the merchant address scope', () => {
  for (const body of [
    '100 Main Street\nQty Description Price\n1 Canada souvenir 12.50',
    '100 Main Street\nMade in Canada',
    '100 Main Street\nCountry of origin: Canada',
    '100 Main Street\nTrip to Canada',
    '100 Main Street\nFlight destination: Canada',
    '100 Main Street\nProducts from Canada',
  ]) assert.equal(extractReceipt(`ACME\n${body}\nTOTAL $12.50`).currency, '', body);
});

test('phone dialing codes and website names are not location evidence', () => {
  for (const text of ['ACME\nTel +1 416 555 0199\nTOTAL $12.50',
    'ACME\nTel +852 1234 5678\nTOTAL $12.50',
    'ACME\nwww.shop-canada.com\nTOTAL $12.50']) {
    assert.equal(extractReceipt(text).currency, '', text);
  }
});

test('conflicting issuer countries stay unresolved even when both use the same currency', () => {
  const addresses = [
    '100 King Street\nToronto ON M5V 2T6\nCanada\n40 Main Street\nSeattle WA 98101\nUSA',
    '10 Main Street\nParis 75001\nFrance\n20 Main Street\nBerlin 10115\nGermany',
    '10 Main Street\nSofia 1000\nBulgaria\n100 King Street\nToronto ON M5V 2T6\nCanada',
  ];
  for (const address of addresses) assert.equal(receipt(address, 'TOTAL 12.50').currency, '', address);
});

test('Northern Ireland stays GBP rather than matching the shorter Ireland country name', () => {
  assert.equal(receipt('100 Main Street\nBelfast\nNorthern Ireland', 'TOTAL 12.50').currency, 'GBP');
  assert.equal(receipt('100 Main Street\nDublin\nIreland', 'TOTAL 12.50').currency, 'EUR');
});

test('stable euro countries need a clear year after the cash transition', () => {
  const address = '10 Main Street\nParis 75001\nFrance';
  assert.equal(receipt(address, 'TOTAL 12.50', '2026-10-04').currency, 'EUR');
  assert.equal(receipt(address, 'TOTAL 12.50', '24/09/2018').currency, 'EUR');
  for (const date of ['', '24/09/18', '1997-10-04', '2002-01-15']) {
    assert.equal(receipt(address, 'TOTAL 12.50', date).currency, '', date);
  }
  assert.equal(receipt(address, 'TOTAL FRF 12.50').currency, '');
  assert.equal(receipt('Store country: Bulgaria', 'TOTAL 12.50', '2019-10-04').currency, '');
  assert.equal(receipt('Store country: Bulgaria', 'TOTAL 12.50', '2026-10-04').currency, '');
});

test('unsupported territories and recent currency changes are left for review', () => {
  for (const address of ['10 Main Street\nMacau\nChina', 'Store country: Croatia', 'Store country: Romania', 'Store country: Turkey']) {
    assert.equal(receipt(address, 'TOTAL 12.50').currency, '', address);
  }
});

test('location evidence remains bounded printed text and oversized OCR columns are ignored', () => {
  const prefix = 'Store address: 100 Main Street, ';
  const longLine = `${prefix}${'A'.repeat(150)}, Canada`;
  const result = receipt(longLine);
  assert.equal(result.currency, 'CAD');
  assert.ok(result.locationEvidence.length <= 180);
  assert.ok(longLine.endsWith(result.locationEvidence));
  assert.ok(result.locationEvidence.endsWith('Canada'));
  assert.equal(receipt(`${prefix}${'A'.repeat(250)}, Canada`).currency, '');
});

test('direct location inference does not depend on a browser or a network request', () => {
  assert.deepEqual(inferLocationCurrency(['ACME', 'Store country: Canada']), {
    currency: 'CAD', evidence: 'Store country: Canada',
  });
  assert.equal(inferLocationCurrency('ACME\nCanada'), null);
  assert.equal(inferLocationCurrency('ACME\nBill to:\nStore country: Canada'), null);
});
