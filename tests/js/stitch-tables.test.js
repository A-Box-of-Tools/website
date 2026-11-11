import test from 'node:test';
import assert from 'node:assert/strict';
import { LIMITS, parseTable, extractKey, stitchTables, serializeTable } from '../../shared/js/table-data.js';

const labels = { left: 'A', right: 'B', column: 'Column' };
const table = (headers, rows, header = true) => ({ headers, rows, header });
const errorKey = key => error => error.key === key;

test('table parser detects separators outside quoted multiline text and preserves identifiers', () => {
  const parsed = parseTable('\uFEFFID;Note\r\n001;"A,B|C\nD"\r\n002;"say ""hi"""');
  assert.equal(parsed.delimiter, ';');
  assert.deepEqual(parsed.headers, ['ID', 'Note']);
  assert.deepEqual(parsed.rows, [['001', 'A,B|C\nD'], ['002', 'say "hi"']]);
  assert.equal(parseTable('a\tb\n1\t2').delimiter, '\t');
  assert.equal(parseTable('a|b\n1|2').delimiter, '|');
});

test('table parser retains quoted empty rows while skipping bare blank lines', () => {
  assert.deepEqual(parseTable('id\n\n""\n\n').rows, [['']]);
  assert.deepEqual(parseTable('a,b\n,\n').rows, [['', '']]);
  assert.deepEqual(parseTable('id\n').rows, []);
  assert.throws(() => parseTable('\n\r\n'), errorKey('table.empty'));
});

test('short table records pad to headers and no-header tables derive their width', () => {
  assert.deepEqual(parseTable('a,b,c\n1,2\n3,,4').rows, [['1', '2', ''], ['3', '', '4']]);
  const parsed = parseTable('1\n2,3', { header: false });
  assert.deepEqual(parsed.headers, ['', '']);
  assert.deepEqual(parsed.rows, [['1', ''], ['2', '3']]);
  assert.equal(parsed.header, false);
  assert.throws(() => parseTable('a\n1,2'), errorKey('table.ragged'));
});

test('malformed quoting fails instead of silently changing cells', () => {
  for (const text of ['a\n"unterminated', 'a\n"closed"tail']) {
    assert.throws(() => parseTable(text), errorKey('table.quotes'));
  }
  assert.throws(() => parseTable('x', { delimiter: '\n' }), errorKey('table.delimiter'));
});

test('table input bounds include padded cells', () => {
  assert.throws(() => parseTable('x'.repeat(LIMITS.inputChars + 1)), errorKey('table.input-limit'));
  assert.throws(() => parseTable(['h', ...Array(LIMITS.rows + 1).fill('x')].join('\n')), errorKey('table.row-limit'));
  assert.throws(() => parseTable(Array(LIMITS.columns + 1).fill('h').join(',')), errorKey('table.column-limit'));
  const wideHeader = Array(LIMITS.columns).fill('h').join(',');
  assert.throws(() => parseTable([wideHeader, ...Array(1001).fill('x')].join('\n')), errorKey('table.cell-limit'));
});

test('exact keys normalize through selected options while preserving source values', () => {
  const a = table(['id', 'name'], [['  AbC  ', 'Alice']]);
  const b = table(['id', 'total'], [['abc', '001.00']]);
  const before = JSON.stringify([a, b]);
  const result = stitchTables(a, b, { labels });
  assert.equal(result.matched, 1);
  assert.deepEqual(result.rows, [['  AbC  ', 'Alice', 'abc', '001.00']]);
  assert.equal(JSON.stringify([a, b]), before);
  assert.equal(stitchTables(a, b, { trim: false }).matched, 0);
  assert.equal(stitchTables(a, b, { ignoreCase: false }).matched, 0);
});

test('safe patterns extract the first digit run and use literal separators', () => {
  assert.equal(extractKey('invoice-001-2026', { match: 'digits' }), '001');
  assert.equal(extractKey('É-lo die 02', { match: 'letters-digits' }), 'élodie02');
  assert.equal(extractKey('A.*B.*C', { match: 'before', separator: '.*' }), 'a');
  assert.equal(extractKey('A.*B.*C', { match: 'after', separator: '.*' }), 'b.*c');
  assert.equal(extractKey('without separator', { match: 'after' }), null);
  assert.equal(extractKey('no digits', { match: 'digits' }), null);
  assert.throws(() => extractKey('a', { match: 'before', separator: '' }), errorKey('table.separator'));
  const result = stitchTables(table(['id'], [['invoice-001-2026'], ['invoice-1']]), table(['id'], [['paid/001']]), { match: 'digits' });
  assert.equal(result.matched, 1);
  assert.equal(result.unmatchedA, 1);
});

test('duplicate keys preserve every pair and count original unpaired rows', () => {
  const a = table(['id'], [['x'], ['x'], ['a-only']]);
  const b = table(['id'], [['x'], ['x'], ['x'], ['b-only']]);
  const result = stitchTables(a, b);
  assert.equal(result.matched, 6);
  assert.equal(result.rows.length, 8);
  assert.equal(result.duplicateKeys, 1);
  assert.equal(result.unmatchedA, 1);
  assert.equal(result.unmatchedB, 1);
  assert.deepEqual(result.rows.slice(-2), [['a-only', ''], ['', 'b-only']]);
  assert.equal(stitchTables(a, b, { join: 'left' }).rows.length, 7);
  assert.equal(stitchTables(a, b, { join: 'inner' }).rows.length, 6);
});

test('empty and failed-extraction keys never join each other', () => {
  const a = table(['id'], [[''], ['   ']]), b = table(['id'], [[''], ['']]);
  const result = stitchTables(a, b);
  assert.equal(result.matched, 0);
  assert.equal(result.duplicateKeys, 0);
  assert.equal(result.rows.length, 4);
  assert.deepEqual(stitchTables(a, b, { join: 'inner' }).rows, []);
  assert.equal(stitchTables(a, b, { join: 'left' }).rows.length, 2);
  assert.equal(stitchTables(table(['id'], [['abc']]), table(['id'], [['def']]), { match: 'digits' }).matched, 0);
});

test('manual pairs are one-to-one and retention policies include the unpaired sources', () => {
  const a = table(['a'], [['a0'], ['a1']]), b = table(['b'], [['b0'], ['b1']]);
  const options = { mode: 'manual', pairs: [[1, 0]] };
  const result = stitchTables(a, b, options);
  assert.deepEqual(result.rows, [['a0', ''], ['a1', 'b0'], ['', 'b1']]);
  assert.equal(result.matched, 1);
  assert.equal(result.unmatchedA, 1);
  assert.equal(result.unmatchedB, 1);
  assert.deepEqual(stitchTables(a, b, { ...options, join: 'inner' }).rows, [['a1', 'b0']]);
  assert.equal(stitchTables(a, b, { ...options, join: 'left' }).rows.length, 2);
  for (const pairs of [[[0, 0], [1, 0]], [[0, 0], [0, 1]], [[2, 0]], [[0, -1]], [[0, 0.5]]]) {
    assert.throws(() => stitchTables(a, b, { mode: 'manual', pairs }), errorKey('table.pairs'));
  }
});

test('stacked rows align reordered and duplicate header occurrences without losing extra columns', () => {
  const a = table(['Name', 'Name', 'Amount'], [['a1', 'a2', '10']]);
  const b = table(['Amount', 'Name', 'Name', 'Extra'], [['20', 'b1', 'b2', 'x']]);
  const result = stitchTables(a, b, { mode: 'append', labels });
  assert.deepEqual(result.headers, ['Name', 'Name (2)', 'Amount', 'Extra']);
  assert.deepEqual(result.rows, [['a1', 'a2', '10', ''], ['b1', 'b2', '20', 'x']]);
});

test('stacked rows use positions when either source has no header', () => {
  const a = parseTable('a,b\nc,d', { header: false });
  const b = parseTable('Name,Budget\nEve,9');
  const result = stitchTables(a, b, { mode: 'append', labels });
  assert.deepEqual(result.headers, ['Name', 'Budget']);
  assert.deepEqual(result.rows, [['a', 'b'], ['c', 'd'], ['Eve', '9']]);
});

test('side-by-side rows retain the longer source and keep output headings distinct', () => {
  const a = table(['id', 'id (A)'], [['a', 'x'], ['b', 'y']]);
  const b = table(['id', ''], [['1', 'z']]);
  const result = stitchTables(a, b, { mode: 'position', labels });
  assert.deepEqual(result.rows, [['a', 'x', '1', 'z'], ['b', 'y', '', '']]);
  assert.equal(result.matched, 1);
  assert.equal(result.unmatchedA, 1);
  assert.equal(new Set(result.headers).size, result.headers.length);
  assert.ok(result.headers.every(Boolean));
});

test('join expansion stops at output row and cell bounds', () => {
  const a = table(['key'], Array.from({ length: 142 }, () => ['x']));
  const b = table(['key'], Array.from({ length: 143 }, () => ['x']));
  assert.throws(() => stitchTables(a, b), errorKey('table.output-limit'));
  const headers = Array.from({ length: 100 }, (_, index) => String(index));
  const wideA = table(headers, Array.from({ length: 1000 }, () => Array(100).fill('x')));
  const wideB = table(headers, Array.from({ length: 3 }, () => Array(100).fill('x')));
  assert.throws(() => stitchTables(wideA, wideB), errorKey('table.output-limit'));
});

test('CSV and TSV serialization round-trip strings including markup and significant whitespace', () => {
  const headers = ['id', 'note'];
  const rows = [['001', 'comma, quote " and\nnewline'], ['002', 'semicolon;pipe|tab\t'], ['003', '<img src=x onerror=alert(1)>']];
  const csv = serializeTable(headers, rows, { protectFormulas: false });
  assert.deepEqual(parseTable(csv, { delimiter: ',' }).rows, rows);
  const tsv = serializeTable(headers, rows, { delimiter: '\t', protectFormulas: false, includeHeader: false });
  assert.deepEqual(parseTable(tsv, { delimiter: '\t', header: false }).rows, rows);
});

test('formula protection covers headings, leading whitespace, operators and control characters', () => {
  const rows = [['=1'], [' +A1'], ['-SUM(A1)'], ['-2+3+cmd|calc'], ['@SUM(A1)'], ['\tvalue'], ['\t-3'], ['\nvalue'], ['text']];
  const encoded = serializeTable(['=heading'], rows);
  const decoded = parseTable(encoded, { delimiter: ',' });
  assert.deepEqual(decoded.headers, ["'=heading"]);
  assert.deepEqual(decoded.rows, rows.map(([value]) => [value === 'text' ? value : "'" + value]));
  assert.deepEqual(parseTable(serializeTable(['id'], rows, { protectFormulas: false }), { delimiter: ',' }).rows, rows);
});

test('formula protection leaves cells alone that hold only a number', () => {
  const rows = [['-12.50'], ['+1 555 010 1234'], ['-1,234.50'], ['+1 (555) 010-1234'], ['-5%'], ['-'], [' -3'], ['12']];
  assert.deepEqual(parseTable(serializeTable(['value'], rows), { delimiter: ',' }).rows, rows);
});

test('a quote inside an unquoted cell is that cell\'s text', () => {
  assert.deepEqual(parseTable('sku,name\nA1,the "big" one\nA2,5" screen').rows,
    [['A1', 'the "big" one'], ['A2', '5" screen']]);
});

test('tab-separated cells only quote when a closing quote really ends the cell', () => {
  const text = 'SKU\tName\nA1\t5" screen\nA2\t"big" one\nA3\t"open\nA4\t"first\nsecond"\nA5\t"say ""hi"""';
  const expected = [['A1', '5" screen'], ['A2', '"big" one'], ['A3', '"open'], ['A4', 'first\nsecond'], ['A5', 'say "hi"']];
  assert.equal(parseTable(text).delimiter, '\t');
  assert.deepEqual(parseTable(text).rows, expected);
  assert.deepEqual(parseTable(text, { delimiter: '\t' }).rows, expected);
});

test('a stray quote does not hide the separators after it from detection', () => {
  assert.equal(parseTable('a\tb\n5" x\t1\n6" y\t2\n7" z\t3').delimiter, '\t');
  assert.equal(parseTable('a;b\n5" x;1\n6" y;2').delimiter, ';');
});

test('matching keeps marks with their letters and one form of each accent', () => {
  const key = (value, match) => extractKey(value, { match });
  assert.notEqual(key('किताब', 'letters-digits'), key('कताब', 'letters-digits'));
  assert.notEqual(key('กี', 'letters-digits'), key('กู', 'letters-digits'));
  for (const match of ['exact', 'letters-digits']) {
    assert.equal(key('José', match), key('José', match));
    assert.notEqual(key('José', match), key('Jose', match));
  }
});

test('one long cell repeated by a duplicate key stops at the text bound', () => {
  const a = table(['id', 'note'], [['x', 'y'.repeat(1_900_000)]]);
  const b = table(['id', 'other'], Array.from({ length: 100 }, (_, index) => ['x', String(index)]));
  assert.throws(() => stitchTables(a, b, { labels }), errorKey('table.output-limit'));
  assert.equal(stitchTables(a, table(['id', 'other'], [['x', '1']]), { labels }).matched, 1);
});

test('a one-column row holding nothing survives export and reading back', () => {
  const rows = [['1'], [''], ['2']];
  assert.deepEqual(parseTable(serializeTable(['id'], rows), { delimiter: ',' }).rows, rows);
});
