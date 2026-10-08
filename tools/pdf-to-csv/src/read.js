/** Reading stays local until the current load can commit its complete result. */
import { PdfDocument } from './shared/pdf-reader.js';
import { pagesOf, readPage } from './shared/pdf-text.js';
import { pageRuns } from './layout.js';
import { cellsOf, findTables } from './tables.js';
import { dateOrder, decimalMark, looksNumeric } from './values.js';

export class TableReadError extends Error {
  constructor(reason, facts = {}) {
    super(reason);
    this.reason = reason;
    this.pages = facts.pages;
    this.bytes = facts.bytes;
  }
}

const yieldTask = () => new Promise((done) => setTimeout(done, 0));

/**
 * File reads and stream decoding cannot be interrupted in the middle. Checking
 * after each await discards their results; bounded task yields let a visitor
 * actually press Cancel even when every page resolves in microtasks.
 */
export async function readTables(file, { signal, onProgress = () => {} } = {}, {
  open = (bytes) => PdfDocument.open(bytes), pageList = pagesOf, read = readPage,
  lines = pageRuns, tablesIn = findTables, pause = yieldTask,
  now = () => performance.now(),
} = {}) {
  const check = () => signal?.throwIfAborted();
  check();
  const bytes = new Uint8Array(await file.arrayBuffer());
  check();
  const doc = await open(bytes);
  check();
  const pageDicts = pageList(doc);
  if (!pageDicts.length) throw new TableReadError('load.nopages');

  const pages = [];
  let deadline = now() + 24;
  onProgress(0, pageDicts.length);
  for (let at = 0; at < pageDicts.length; at += 1) {
    check();
    const page = await read(doc, pageDicts[at], at + 1);
    check();
    pages.push({ number: at + 1, lines: lines(page) });
    onProgress(at + 1, pageDicts.length);
    if ((at + 1) % 8 === 0 || now() >= deadline) {
      await pause();
      check();
      deadline = now() + 24;
    }
  }
  const facts = { pages: pages.length, bytes: bytes.length };
  if (!pages.some((page) => page.lines.length)) throw new TableReadError('scan.notext', facts);

  // A completed page count is shown before the final synchronous table pass.
  await pause();
  check();
  const tables = tablesIn(pages);
  if (!tables.length) throw new TableReadError('scan.notables', facts);
  const cells = tables.flatMap((table) => table.blocks
    .flatMap((block) => block.lines.flatMap((line) => cellsOf(line, table.columns))));
  check();
  return {
    file, pages: pages.length, bytes: bytes.length, tables, cells,
    mark: decimalMark(cells.filter(looksNumeric)), found: dateOrder(cells),
  };
}
