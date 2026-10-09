/** Safe text export must disclose changes without turning real numbers into text. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { csvValue, formulaCells, toCsv } from '../../tools/pdf-to-csv/src/csv.js';

const safe = { spreadsheetSafe: true };
const numeric = (value) => ({ value, numeric: true });

test('raw export keeps BOM, CRLF, quotes and all text exactly as before', () => {
  const rows = [['=Heading', 'plain'], ['=1+1', 'comma,quote"'], ['line\r\nnext', null], []];
  assert.equal(toCsv(rows), '\ufeff=Heading,plain\r\n=1+1,"comma,quote"""\r\n"line\r\nnext",\r\n\r\n');
  assert.equal(toCsv(rows, { spreadsheetSafe: false }), toCsv(rows));
});

test('safe export protects text including headings and retains typed signed numbers', () => {
  const rows = [['=Heading', 'Amount', '-123'], ['=1+1', numeric('-12.50'), numeric('+3.00')],
    ['@SUM(A1)', numeric('1e+22'), -4.5]];
  assert.equal(formulaCells(rows), 4);
  assert.equal(toCsv(rows, safe), '\ufeff"\'=Heading",Amount,"\'-123"\r\n"\'=1+1",-12.50,+3.00\r\n"\'@SUM(A1)",1e+22,-4.5\r\n');
  assert.deepEqual(rows[1], ['=1+1', numeric('-12.50'), numeric('+3.00')]);
});

test('whitespace, control and full-width formula leaders are text without stripping characters', () => {
  for (const text of ['=1+1', '+SUM(A1)', '-cmd', '@SUM(A1)', '  =1+1', '\tplain',
    '\rplain', '\nplain', '＝1+1', '＋cmd', '－cmd', '＠cmd']) {
    assert.equal(csvValue(text, safe), `'${text}`);
    assert.equal(csvValue(text), text);
  }
  for (const text of ['', 'plain', "'=1+1", '000123', 'item=1', ' "=1+1']) {
    assert.equal(csvValue(text, safe), text);
  }
});

test('numeric metadata cannot exempt an executable expression or partial numeric token', () => {
  for (const text of ['=1+1', '-1+2', '+1;cmd', ' -12.00', '@123']) {
    assert.equal(csvValue(numeric(text), safe), `'${text}`);
  }
  for (const text of ['-0.00', '+12', '-.5', '1e-20', '-123456789012345678901234.50']) {
    assert.equal(csvValue(numeric(text), safe), text);
  }
});

test('protection quotes affected text once and preserves embedded CSV syntax', () => {
  const text = '=IF(A1,"yes","no")\r\nnext';
  assert.equal(toCsv([[text]], safe), '\ufeff"\'=IF(A1,""yes"",""no"")\r\nnext"\r\n');
  assert.equal(formulaCells([['plain'], [numeric('-12.50')], [], [text]]), 1);
});
