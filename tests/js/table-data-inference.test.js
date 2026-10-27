import test from 'node:test';
import assert from 'node:assert/strict';
import { parseTable, inferHeaders, stitchTables } from '../../shared/js/table-data.js';

const labels = { column: 'Column', email: 'Email', url: 'URL', date: 'Date', datetime: 'Date and time',
  time: 'Time', boolean: 'Boolean', phone: 'Phone', id: 'ID', number: 'Number', text: 'Text' };

test('automatic headings preserve headerless and ambiguous first records', () => {
  for (const text of ['001,Ada\n002,Lin', 'Alice,London\nBob,Paris',
    'unknown,missing\n1,2026-10-27\n2,2026-10-28', 'Alice\n42\n13', 'one,two', '1\n2,3']) {
    const automatic = parseTable(text, { header: 'auto' });
    assert.equal(automatic.header, false);
    assert.deepEqual(automatic.rows, parseTable(text, { header: false }).rows);
  }
});

test('automatic headings recognize field labels and typed contrasts with explicit overrides', () => {
  for (const text of ['ID,Date\n001,2026-10-27', 'Name,City\nAlice,London',
    '識別子,日付\n001,2026-10-27\n002,2026-10-28']) {
    assert.equal(parseTable(text, { header: 'auto' }).header, true);
    assert.deepEqual(parseTable(text, { header: 'auto' }).rows, parseTable(text).rows);
    assert.equal(parseTable(text, { header: false }).rows.length, parseTable(text).rows.length + 1);
  }
  assert.equal(parseTable('Alice\nBob', { header: true }).rows.length, 1);
  assert.throws(() => parseTable('a,b', { header: 'invalid' }), error => error.key === 'table.header');
});

test('inferred names follow value patterns and number all duplicate localized labels', () => {
  const source = '001,ada@example.com,billing@example.com,2026-10-27,12.50,Ada\n002,lin@example.com,accounts@example.com,2026-10-28,20,Lin';
  const parsed = parseTable(source, { header: 'auto' });
  const before = JSON.stringify(parsed);
  assert.deepEqual(inferHeaders(parsed, labels), ['ID', 'Email 1', 'Email 2', 'Date', 'Number', 'Text']);
  assert.equal(JSON.stringify(parsed), before);
  assert.deepEqual(inferHeaders(parsed, { ...labels, email: '郵件', number: '值', id: '值' }),
    ['值 1', '郵件 1', '郵件 2', 'Date', '值 2', 'Text']);
});

test('sparse and mixed columns get labels without changing values or positional stacking', () => {
  const parsed = { headers: Array(8).fill(''), header: false, rows: [
    ['https://example.com', '2024-02-29T12:30:00Z', '23:59', 'yes', '+1 (555) 123-4567', '1e3', '2026-02-30', ''],
    ['https://example.org', '2026-10-27T01:02:03Z', '00:00', 'no', '+1 (555) 987-6543', '2.5', '2026-13-01', ''],
  ] };
  assert.deepEqual(inferHeaders(parsed, labels), ['URL', 'Date and time', 'Time', 'Boolean', 'Phone', 'Number', 'Text', 'Column']);
  const mixed = { headers: ['', ''], header: false, rows: [['1', 'a'], ['2.5', 'b'], ['-3', 'c'], ['4', 'd'], ['unknown', 'e']] };
  assert.deepEqual(inferHeaders(mixed, labels), ['Number', 'Text']);
  const result = stitchTables({ ...mixed, headers: inferHeaders(mixed, labels) },
    { headers: ['Amount', 'Label'], header: true, rows: [['5', 'f']] }, { mode: 'append' });
  assert.deepEqual(result.headers, ['Amount', 'Label']);
  assert.deepEqual(result.rows[0], ['1', 'a']);
});

test('automatic detection checks row limits after retaining the first row', () => {
  assert.equal(parseTable('ID,Date\n' + Array(5000).fill('001,2026-10-27').join('\n'), { header: 'auto' }).rows.length, 5000);
  assert.throws(() => parseTable(Array(5001).fill('001,2026-10-27').join('\n'), { header: 'auto' }), error => error.key === 'table.row-limit');
});

test('generated headings can be detected again above one data record', () => {
  const source = 'ID,Email 1,Email 2,Date,Number,Text\n001,a@example.com,b@example.com,2026-10-27,12.50,Ada';
  assert.equal(parseTable(source, { header: 'auto' }).header, true);
});
