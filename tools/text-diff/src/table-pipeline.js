import { parseTable, LIMITS } from './shared/table-data.js';

// These are source strings, with their own line endings and quoted cells.
// Parsing only decides whether the next tool can read them; it must not
// serialize them or turn the diff's ignored differences into lost data.
export function tablePair(a, b) {
  const texts = [a, b];
  try {
    const tables = texts.map(text => parseTable(text, { header: 'auto' }));
    if (tables.some(table => table.headers.length < 2 || !table.rows.length)) return null;
    const files = texts.map((text, index) => new File([text], index ? 'table-b.csv' : 'table-a.csv', { type: 'text/csv' }));
    return files.some(file => file.size > LIMITS.inputChars) ? null : files;
  } catch {
    return null;
  }
}
