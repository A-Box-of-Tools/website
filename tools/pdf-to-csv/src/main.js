/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { messageBox } from './shared/message-box.js';
import { downloadLink } from './shared/download.js';
import { sizeText } from './shared/format.js';
import { wireFilePicker, readingLabel } from './shared/file-picker.js';
import { EncryptedPdfError, NotAPdfError, PdfDocument } from './shared/pdf-reader.js';
import { pagesOf, readPage } from './shared/pdf-text.js';
import { pageRuns } from './layout.js';
import { cellsOf, findTables } from './tables.js';
import { buildTable } from './rows.js';
import { checkBalance } from './check.js';
import { columnLetter, toCsv } from './csv.js';
import {
  dateOrder, decimalMark, formatAmount, hasAmbiguousDates, looksNumeric, parseAmount,
  parseDate,
} from './values.js';
import { makeExample } from './example.js';

const $ = (id) => document.getElementById(id);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  fileRow: $('file-row'),
  fileName: $('file-name'),
  fileFacts: $('file-facts'),
  clearFile: $('clear-file'),
  loadError: $('load-error'),
  lockedHelp: $('locked-help'),
  scannedHelp: $('scanned-help'),
  tableCard: $('table-card'),
  summary: $('summary'),
  checkLine: $('check-line'),
  tableField: $('table-field'),
  tablePick: $('table-pick'),
  orderField: $('order-field'),
  dateOrder: $('date-order'),
  orderNote: $('order-note'),
  previews: $('previews'),
  resultCard: $('result-card'),
  download: $('download'),
  resultFacts: $('result-facts'),
  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
};

const { show: showLoadError, clear: clearLoadError } = messageBox(el.loadError);
const offerCsv = downloadLink(el.download, 'text/csv;charset=utf-8');

/** How many rows each table draws on the page. The download always has all of
 *  them; this is only how much a person is shown without scrolling for a
 *  minute. */
const PREVIEW_ROWS = 25;

/** The picker's value for every table at once. */
const ALL = 'all';

/**
 * @typedef {object} Document
 * @property {File} file
 * @property {number} pages
 * @property {import('./tables.js').Table[]} tables
 * @property {string} mark    the decimal point this document uses
 * @property {'dmy'|'mdy'} order
 * @property {string} pick    ALL, or the index of one table
 */

/** @type {Document|null} */
let current = null;

/* ------------------------------------------------------------------ loading */

const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles(files) {
    load(files[0]);
  },
  example: makeExample,
});

el.clearFile.addEventListener('click', () => {
  reset();
  picker.waiting();
});

// Re-reading rather than re-parsing, for both controls: the tables are already
// found, and only which of them to show or what a date means has changed. It is
// instant, which is what lets these be controls rather than questions asked
// before anything is shown.
el.dateOrder.addEventListener('change', () => {
  if (!current) return;
  current.order = el.dateOrder.value === 'mdy' ? 'mdy' : 'dmy';
  render();
});

el.tablePick.addEventListener('change', () => {
  if (!current) return;
  current.pick = el.tablePick.value;
  render();
});

function reset() {
  current = null;
  clearLoadError();
  offerCsv.clear();
  el.lockedHelp.hidden = true;
  el.scannedHelp.hidden = true;
  el.fileRow.hidden = true;
  el.tableCard.hidden = true;
  el.resultCard.hidden = true;
  el.tableField.hidden = true;
  el.orderField.hidden = true;
  el.previews.replaceChildren();
}

/**
 * Read a PDF and find the tables in it.
 *
 * Every page is read before anything is decided, because both conventions this
 * tool settles - which character is the decimal point, and which way round the
 * dates go - are properties of the document rather than of a page, and a first
 * page that happened to be unanimous would settle them wrongly for the rest.
 */
async function load(file) {
  if (!file) return;

  reset();
  el.fileRow.hidden = false;
  el.fileName.textContent = file.name;
  el.fileFacts.textContent = '';
  picker.busy(readingLabel(1));

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const doc = await PdfDocument.open(bytes);
    const pageDicts = pagesOf(doc);

    if (!pageDicts.length) {
      refuse(phrase('load.nopages'));
      return;
    }

    const pages = [];
    for (let at = 0; at < pageDicts.length; at += 1) {
      const page = await readPage(doc, pageDicts[at], at + 1);
      pages.push({ number: at + 1, lines: pageRuns(page) });
    }

    picker.done();
    el.fileFacts.textContent = `${countOf('pages', pageDicts.length)} · ${size(bytes.length)}`;

    if (!pages.some((page) => page.lines.length)) {
      refuse(phrase('scan.notext'));
      el.scannedHelp.hidden = false;
      return;
    }

    const tables = findTables(pages);
    if (!tables.length) {
      refuse(phrase('scan.notables'));
      return;
    }

    const cells = tables.flatMap((table) => table.blocks
      .flatMap((block) => block.lines.flatMap((line) => cellsOf(line, table.columns))));
    const found = dateOrder(cells);

    current = {
      file,
      pages: pages.length,
      tables,
      mark: decimalMark(cells.filter(looksNumeric)),
      order: found ?? 'dmy',
      pick: ALL,
    };

    // The date control is offered only where it would change something. A
    // document written in ISO, or with its months spelled out, has already
    // said which way round its dates are, and asking would invite somebody to
    // "fix" dates that were never in doubt.
    if (hasAmbiguousDates(cells)) {
      el.dateOrder.value = current.order;
      el.orderNote.textContent = phrase(found ? 'order.found' : 'order.guessed');
      el.orderField.hidden = false;
    }

    render();
  } catch (error) {
    fail(error);
  }
}

/**
 * Turn a file away.
 *
 * `waiting()` is the half worth remembering: the picker wakes the later cards
 * the moment files are handed over, which is right for a file that works and
 * wrong for one that does not - without this, the tables and the download sit
 * live and empty under a line saying the file could not be read.
 */
function refuse(message) {
  picker.done();
  picker.waiting();
  el.tableCard.hidden = true;
  el.resultCard.hidden = true;
  el.tableField.hidden = true;
  el.orderField.hidden = true;
  offerCsv.clear();
  showLoadError(message);
}

/** Say what went wrong, and where a document this tool will not read leaves
 *  somebody who still has to convert it. */
function fail(error) {
  if (error instanceof EncryptedPdfError) {
    refuse(phrase('load.encrypted'));
    el.lockedHelp.hidden = false;
    return;
  }
  if (error instanceof NotAPdfError) {
    const detail = error.message?.startsWith('read.') ? phrase(error.message) : '';
    refuse(detail || phrase('load.notpdf'));
    return;
  }
  refuse(phrase('load.broken', { detail: error?.message ?? '' }));
}

/* ---------------------------------------------------------------- the tables */

/** Build every table from what is already found, and show the ones picked. */
function render() {
  const { tables, order, mark, pages } = current;

  // Numbered after the empty ones are dropped, so the labels count the tables
  // a person can actually see.
  const built = tables
    .map((table) => buildTable(table, { order, mark }))
    .filter((table) => table.rows.length)
    .map((table, index) => ({ ...table, n: index + 1 }));

  if (!built.length) {
    refuse(phrase('scan.notables'));
    return;
  }

  clearLoadError();
  el.tableCard.hidden = false;
  el.resultCard.hidden = false;

  offerPicks(built);
  const shown = current.pick === ALL
    ? built
    : built.filter((table) => String(table.n) === current.pick);

  const rows = built.reduce((sum, table) => sum + table.rows.length, 0);
  el.summary.textContent = built.length === 1
    ? phrase('sum.one', { rows: countOf('rows', rows), pages: countOf('pages', pages) })
    : phrase('sum.many', {
      tables: countOf('tables', built.length),
      rows: countOf('rows', rows),
      pages: countOf('pages', pages),
    });

  const outputs = shown.map((table) => {
    const proof = checkBalance(table.rows, table.moneyColumns, mark);
    return { table, proof, grid: normalise(table, proof, order, mark) };
  });

  sayCheck(outputs, shown.length > 1);
  drawPreviews(outputs);

  // Every table's own heading row, one table after another with an empty line
  // between: the shape a spreadsheet opens as blocks, and the one a person
  // splitting the file by hand would choose.
  const grid = outputs.flatMap(({ grid: g }, index) => (index ? [[], ...g] : g));
  const csv = toCsv(grid);
  offerCsv.offer(csv, phrase('result.name', { name: baseName(current.file.name) }));
  facts(outputs, csv);
}

/** The picker: every table at once, or any one of them. Hidden when there is
 *  only one, because a choice of one is not a choice. */
function offerPicks(built) {
  el.tableField.hidden = built.length < 2;
  if (built.length < 2) {
    current.pick = ALL;
    return;
  }

  const options = [
    [ALL, phrase('pick.all', { tables: countOf('tables', built.length) })],
    ...built.map((table) => [String(table.n), labelOf(table)]),
  ];
  el.tablePick.replaceChildren(...options.map(([value, text]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    return option;
  }));

  if (!options.some(([value]) => value === current.pick)) current.pick = ALL;
  el.tablePick.value = current.pick;
}

function labelOf(table) {
  return phrase('table.label', {
    n: table.n,
    page: table.page,
    rows: countOf('rows', table.rows.length),
    columns: countOf('columns', table.headers.length),
  });
}

/**
 * The rows as they will be written: dates with a year as ISO, money as plain
 * signed numbers, and everything else exactly as the page had it.
 *
 * Only columns the arithmetic identified as money are rewritten. A column of
 * digits this tool merely *could* parse - an account number, a cheque number -
 * is left alone, because turning 0001234 into 1234.00 would be destroying data
 * to make it look tidier. A date with no year is left alone for the same
 * reason: the year it belongs to would be a guess.
 */
function normalise(table, proof, order, mark) {
  const money = new Set(proof ? [proof.balance, ...proof.amounts] : table.moneyColumns);

  const headers = table.headers.map((given, at) => given || columnLetter(at));
  const rows = table.rows.map((row) => row.cells.map((cell, at) => {
    if (at === table.dateColumn) return parseDate(cell, order) ?? cell;
    if (!money.has(at) || !cell) return cell;
    const value = parseAmount(cell, mark);
    return value === null ? cell : formatAmount(value);
  }));

  return [headers, ...rows];
}

/**
 * The line that says whether any of this is proven.
 *
 * Only said where there is something to prove it against: a table with a
 * running balance. Most tables have none, and a line on every one of them
 * saying so would be a line people learn to skip - including on the tables
 * where it matters.
 */
function sayCheck(outputs, several) {
  el.checkLine.classList.remove('held', 'broke');
  el.checkLine.textContent = '';

  const proven = outputs.filter(({ proof }) => proof);
  if (!proven.length) return;

  const broken = proven.find(({ proof }) => proof.broken.length);
  const { table, proof } = broken ?? proven[0];

  let verdict;
  if (broken) {
    const where = proof.broken.length === 1
      ? phrase('check.row', { n: proof.broken[0] })
      : phrase('check.rows', { list: proof.broken.join(', ') });
    verdict = phrase('check.broke', { held: proof.held, links: proof.links, where });
    el.checkLine.classList.add('broke');
  } else {
    verdict = phrase('check.held');
    el.checkLine.classList.add('held');
  }

  el.checkLine.textContent = several ? phrase('check.intable', { n: table.n, verdict }) : verdict;
}

function drawPreviews(outputs) {
  el.previews.replaceChildren(...outputs.map(({ table, grid: [headers, ...rows] }) => {
    const block = document.createElement('div');
    block.className = 'preview-block';
    const wrap = document.createElement('div');
    wrap.className = 'preview-wrap';
    block.append(wrap);

    const element = document.createElement('table');
    element.className = 'preview';

    const caption = document.createElement('caption');
    caption.className = 'preview-caption';
    caption.textContent = labelOf(table);

    const head = document.createElement('thead');
    const headRow = document.createElement('tr');
    headRow.replaceChildren(...headers.map((name) => {
      const cell = document.createElement('th');
      cell.scope = 'col';
      cell.textContent = name;
      return cell;
    }));
    head.append(headRow);

    const body = document.createElement('tbody');
    body.replaceChildren(...rows.slice(0, PREVIEW_ROWS).map((row) => {
      const line = document.createElement('tr');
      line.replaceChildren(...row.map((value) => {
        const cell = document.createElement('td');
        cell.textContent = value;
        return cell;
      }));
      return line;
    }));

    element.append(caption, head, body);
    wrap.append(element);

    // Outside the scrolling box, so a wide table does not carry it away.
    if (rows.length > PREVIEW_ROWS) {
      const more = document.createElement('p');
      more.className = 'field-summary';
      more.textContent = phrase('preview.more', { shown: PREVIEW_ROWS });
      block.append(more);
    }

    return block;
  }));
}

function facts(outputs, csv) {
  const rows = outputs.reduce((sum, { table }) => sum + table.rows.length, 0);
  const lines = [outputs.length === 1
    ? phrase('fact.shape', {
      rows: countOf('rows', rows),
      columns: countOf('columns', outputs[0].table.headers.length),
    })
    : phrase('fact.tables', {
      rows: countOf('rows', rows),
      tables: countOf('tables', outputs.length),
    })];

  if (outputs.some(({ table }) => table.dateColumn >= 0)) lines.push(phrase('fact.dates'));
  if (outputs.some(({ table, proof }) => proof || table.moneyColumns.length)) {
    lines.push(phrase('fact.amounts'));
  }
  lines.push(`${phrase('fact.encoding')} · ${size(new Blob([csv]).size)}`);

  el.resultFacts.replaceChildren(...lines.map((text) => {
    const item = document.createElement('li');
    item.textContent = text;
    return item;
  }));
}

/* ---------------------------------------------------------------- the words */

/** Every key spelled out, so that searching for one finds where it is used. */
const COUNTS = {
  pages: ['count.pages.one', 'count.pages.many'],
  rows: ['count.rows.one', 'count.rows.many'],
  columns: ['count.columns.one', 'count.columns.many'],
  tables: ['count.tables.one', 'count.tables.many'],
};

/** "1 page", "3 tables": a count in the words for the thing it counts. */
function countOf(thing, n) {
  const [one, many] = COUNTS[thing];
  return phrase(n === 1 ? one : many, { n });
}

const size = (n) => sizeText(n, phrase, { under: 'size.bytes' });

/** The document's name without its extension, for the CSV beside it. */
function baseName(name) {
  return name.replace(/\.[^.]+$/, '') || 'tables';
}

// The frame draws the privacy panel but leaves the opening of it to the tool,
// as it does on the other forty-one.
el.privacyToggle.addEventListener('click', () => {
  const open = el.privacyPanel.hidden;
  el.privacyPanel.hidden = !open;
  el.privacyToggle.setAttribute('aria-expanded', String(open));
});

/* -------------------------------------------------------------------- boot */

// An error thrown after boot would otherwise only reach the console, leaving
// the page looking functional but doing nothing.
window.addEventListener('error', (event) => {
  showLoadError(phrase('error.broke', { detail: event.message }));
});
window.addEventListener('unhandledrejection', (event) => {
  showLoadError(phrase('error.broke', { detail: event.reason?.message ?? event.reason }));
});

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
