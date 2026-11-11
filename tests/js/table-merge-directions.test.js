import test from 'node:test';
import assert from 'node:assert/strict';
import { parseTable, inferHeaders, stitchTables } from '../../shared/js/table-data.js';

const labels = { left: 'A', right: 'B', column: 'Column' };
const table = (headers, rows, header = true) => ({ headers, rows, header });
const merge = (a, b, options = {}) => stitchTables(a, b, { mode: 'both', labels, ...options });

test('add rows keeps all records and columns from either source', () => {
  const result = stitchTables(parseTable('id,name\n1,Ada\n2,Bo'),
    parseTable('email,id\nbo@example.com,2\ncy@example.com,3'), { mode: 'append', labels });
  assert.deepEqual(result.headers, ['id', 'name', 'email']);
  assert.deepEqual(result.rows, [['1', 'Ada', ''], ['2', 'Bo', ''], ['2', '', 'bo@example.com'], ['3', '', 'cy@example.com']]);
});

test('add columns keeps every row from the longer source', () => {
  const result = stitchTables(table(['id'], [['1'], ['2']]),
    table(['score', 'team'], [['10', 'North'], ['20', 'West'], ['30', 'South']]), { mode: 'position', labels });
  assert.deepEqual(result.headers, ['id', 'score', 'team']);
  assert.deepEqual(result.rows, [['1', '10', 'North'], ['2', '20', 'West'], ['', '30', 'South']]);
});

test('both directions match shared records and retain new rows and fields', () => {
  const result = merge(parseTable('id,name\n1,Ada\n2,Bo'),
    parseTable('id,email\n2,bo@example.com\n3,cy@example.com'), { join: 'inner' });
  assert.deepEqual(result.headers, ['id', 'name', 'email']);
  assert.deepEqual(result.rows, [['1', 'Ada', ''], ['2', 'Bo', 'bo@example.com'], ['3', '', 'cy@example.com']]);
  assert.equal(result.matched, 1);
  assert.equal(result.unmatchedA, 1);
  assert.equal(result.unmatchedB, 1);
  assert.equal(result.conflicts, 0);
});

test('shared fields fill exactly empty cells without losing string zeroes or multiline text', () => {
  const a = table(['id', 'name', 'score', 'note'], [['1', '', '0', ''], ['2', 'Bo', '2', 'same']]);
  const b = table(['score', 'id', 'name', 'note', 'extra'],
    [['', '1', 'Ada', 'first\r\nsecond', 'x'], ['2', '2', 'Bo', 'same', 'y']]);
  const before = JSON.stringify([a, b]);
  const result = merge(a, b, { rightKey: 1 });
  assert.deepEqual(result.headers, ['id', 'name', 'score', 'note', 'extra']);
  assert.deepEqual(result.rows, [['1', 'Ada', '0', 'first\r\nsecond', 'x'], ['2', 'Bo', '2', 'same', 'y']]);
  assert.equal(result.conflicts, 0);
  assert.equal(JSON.stringify([a, b]), before);
});

test('conflicting fields keep their full A and B columns including equal values and blanks', () => {
  const result = merge(table(['id', 'name'], [['1', '  '], ['2', 'Bo'], ['3', '']]),
    table(['id', 'name'], [['1', 'Ada'], ['2', 'Bo'], ['3', 'Lin']]));
  assert.deepEqual(result.headers, ['id', 'name (A)', 'name (B)']);
  assert.deepEqual(result.rows, [['1', '  ', 'Ada'], ['2', 'Bo', 'Bo'], ['3', '', 'Lin']]);
  assert.equal(result.conflicts, 1);
});

test('combined pattern matches preserve differing raw key spellings', () => {
  const result = merge(table(['id', 'name'], [['invoice-001', 'Ada']]),
    table(['id', 'name'], [['paid/001', 'Ada']]), { match: 'digits' });
  assert.deepEqual(result.headers, ['id (A)', 'name', 'id (B)']);
  assert.deepEqual(result.rows, [['invoice-001', 'Ada', 'paid/001']]);
});

test('combined duplicate keys keep every pair and every unmatched record', () => {
  const result = merge(table(['id', 'name'], [['x', 'a0'], ['x', 'a1'], ['a-only', 'a2']]),
    table(['id', 'email'], [['x', 'b0'], ['x', 'b1'], ['x', 'b2'], ['b-only', 'b3']]));
  assert.equal(result.matched, 6);
  assert.equal(result.rows.length, 8);
  assert.equal(result.duplicateKeys, 1);
  assert.deepEqual(result.rows.slice(-2), [['a-only', 'a2', ''], ['b-only', '', 'b3']]);
  const blanks = merge(table(['id', 'name'], [['', 'Ada']]), table(['id', 'email'], [['', 'a@example.com']]));
  assert.deepEqual(blanks.rows, [['', 'Ada', ''], ['', '', 'a@example.com']]);
});

test('inferred headers never coalesce unrelated headerless fields', () => {
  const a = parseTable('001,Ada\n002,Bo', { header: false });
  a.headers = inferHeaders(a, { id: 'ID', text: 'Text', column: 'Column' });
  const result = merge(a, table(['ID', 'Email'], [['001', 'a@example.com'], ['003', 'c@example.com']]));
  assert.deepEqual(result.headers, ['ID (A)', 'Text', 'ID (B)', 'Email']);
  assert.deepEqual(result.rows[0], ['001', 'Ada', '001', 'a@example.com']);
  assert.equal(result.rows.length, 3);
});

test('blank headings stay separate and duplicate named fields align by occurrence', () => {
  const blanks = merge(table(['id', ''], [['1', 'note']]), table(['id', ''], [['1', 'phone']]));
  assert.equal(blanks.headers.length, 3);
  assert.deepEqual(blanks.rows[0], ['1', 'note', 'phone']);
  const repeated = merge(table(['id', 'Phone', 'Phone'], [['1', 'A', 'B']]),
    table(['Phone', 'id', 'Phone'], [['A', '1', 'C']]), { rightKey: 1 });
  assert.deepEqual(repeated.headers, ['id', 'Phone', 'Phone (A)', 'Phone (B)']);
  assert.deepEqual(repeated.rows[0], ['1', 'A', 'B', 'C']);
});

test('combined merging bounds duplicate expansion and the final conflicting-field width', () => {
  assert.throws(() => merge(table(['id'], Array.from({ length: 142 }, () => ['x'])),
    table(['id'], Array.from({ length: 143 }, () => ['x']))), error => error.key === 'table.output-limit');
  const headers = Array.from({ length: 100 }, (_, index) => String(index));
  const a = table(headers, Array.from({ length: 1000 }, () => ['x', ...Array(99).fill('0')]));
  const b = table(headers, Array.from({ length: 3 }, () => ['x', ...Array(99).fill('1')]));
  assert.throws(() => merge(a, b), error => error.key === 'table.output-limit');
});
