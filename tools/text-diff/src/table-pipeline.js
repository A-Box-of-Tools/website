import { parseTable, typedColumns, LIMITS } from './shared/table-data.js';

// Any text with a comma in it parses as a table, so parsing alone would offer to
// stitch two letters or two functions. A table is mostly rectangular, and its
// separators are not punctuation: a comma in a sentence has a space after it. A
// recognised heading row, a tab or a typed column outweighs that last test, so
// `id, name` and `1, Ada` still count.
function readsAsTable(table) {
  const records = table.rows.length + (table.header ? 1 : 0);
  if (table.headers.length < 2 || !table.rows.length || records < 2) return false;
  if (table.shortRows > records * .2) return false;
  if (table.header || table.delimiter === '\t') return true;
  const cells = table.rows.flatMap(row => row.slice(1)).filter(Boolean);
  const spaced = cells.filter(cell => cell.startsWith(' ')).length;
  return spaced <= cells.length / 2 || typedColumns(table) > 0;
}

// These are source strings, with their own line endings and quoted cells.
// Parsing only decides whether the next tool can read them; it must not
// serialize them or turn the diff's ignored differences into lost data.
export function tablePair(a, b) {
  const texts = [a, b];
  try {
    const tables = texts.map(text => parseTable(text, { header: 'auto' }));
    if (!tables.every(readsAsTable)) return null;
    const files = texts.map((text, index) => new File([text], index ? 'table-b.csv' : 'table-a.csv', { type: 'text/csv' }));
    return files.some(file => file.size > LIMITS.inputChars) ? null : files;
  } catch {
    return null;
  }
}
