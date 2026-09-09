/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { messageBox } from './shared/message-box.js';
import { downloadLink } from './shared/download.js';
import { sizeText } from './shared/format.js';
import { wireFilePicker, readingLabel } from './shared/file-picker.js';
import { EncryptedPdfError, NotAPdfError, PdfDocument } from './shared/pdf-reader.js';
import { pagesOf, readPage } from './shared/pdf-text.js';
import { findColumns, intoCells, pageRuns } from './layout.js';
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
  orderField: $('order-field'),
  dateOrder: $('date-order'),
  orderNote: $('order-note'),
  previewCaption: $('preview-caption'),
  previewHead: $('preview-head'),
  previewBody: $('preview-body'),
  previewMore: $('preview-more'),
  resultCard: $('result-card'),
  download: $('download'),
  resultFacts: $('result-facts'),
  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
};

const { show: showLoadError, clear: clearLoadError } = messageBox(el.loadError);
const offerCsv = downloadLink(el.download, 'text/csv;charset=utf-8');

/** How many rows the page draws. The download always has all of them; this is
 *  only how much of the check a person is shown without scrolling for a
 *  minute. */
const PREVIEW_ROWS = 25;

/**
 * @typedef {object} Statement
 * @property {File} file
 * @property {{number: number, lines: object[]}[]} pages
 * @property {{x0: number, x1: number}[]} columns
 * @property {string} mark    the decimal point this document uses
 * @property {'dmy'|'mdy'} order
 */

/** @type {Statement|null} */
let statement = null;

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

// Re-reading rather than re-parsing: the pages are already in memory, and only
// what a date means changes. It is instant, which is what lets this be a
// control rather than a question asked before anything is shown.
el.dateOrder.addEventListener('change', () => {
  if (!statement) return;
  statement.order = el.dateOrder.value === 'mdy' ? 'mdy' : 'dmy';
  render();
});

function reset() {
  statement = null;
  clearLoadError();
  offerCsv.clear();
  el.lockedHelp.hidden = true;
  el.scannedHelp.hidden = true;
  el.fileRow.hidden = true;
  el.tableCard.hidden = true;
  el.resultCard.hidden = true;
  el.orderField.hidden = true;
}

/**
 * Read a statement and take it apart.
 *
 * Every page is read before anything is decided, because both conventions this
 * tool has to settle - which character is the decimal point, and which way
 * round the dates go - are properties of the document rather than of a page,
 * and a first page that happened to be unanimous would settle them wrongly for
 * the rest.
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
    el.fileFacts.textContent = `${countPages(pageDicts.length)} · ${size(bytes.length)}`;

    const all = pages.flatMap((page) => page.lines);
    if (!all.length) {
      refuse(phrase('scan.notext'));
      el.scannedHelp.hidden = false;
      return;
    }

    const columns = findColumns(all);
    if (columns.length < 2) {
      refuse(phrase('scan.nocolumns'));
      return;
    }

    const cells = all.map((line) => intoCells(line, columns));
    const mark = decimalMark(cells.flat().filter(looksNumeric));
    const found = dateOrder(cells.flat());

    statement = {
      file, pages, columns, mark,
      order: found ?? 'dmy',
    };

    // The control is offered only where it would change something. A statement
    // written in ISO, or with its months spelled out, has already said which
    // way round its dates are on every row, and asking about it would invite
    // somebody to "fix" dates that were never in doubt.
    if (hasAmbiguousDates(cells.flat())) {
      el.dateOrder.value = statement.order;
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
 * wrong for one that does not - without this, the table and the download sit
 * live and empty under a line saying the statement could not be read.
 */
function refuse(message) {
  picker.done();
  picker.waiting();
  el.tableCard.hidden = true;
  el.resultCard.hidden = true;
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

/* ----------------------------------------------------------------- the table */

/** Build the table from what is already parsed, and show it. */
function render() {
  const { pages, columns, order, mark } = statement;
  const cellsOf = (line) => intoCells(line, columns);
  const table = buildTable(pages, cellsOf, { order, mark });

  if (!table.rows.length) {
    el.tableCard.hidden = true;
    el.resultCard.hidden = true;
    offerCsv.clear();
    showLoadError(phrase('scan.norows'));
    return;
  }

  clearLoadError();
  el.tableCard.hidden = false;
  el.resultCard.hidden = false;

  const proof = checkBalance(table.rows, table.moneyColumns, mark);
  const out = normalise(table, proof, order, mark);

  el.summary.textContent = phrase(
    table.rows.length === 1 ? 'sum.rows.one' : 'sum.rows.many',
    { rows: table.rows.length, pages: countPages(pages.length) });

  sayCheck(proof);
  drawPreview(out);

  const csv = toCsv(out);
  offerCsv.offer(csv, phrase('result.name', { name: baseName(statement.file.name) }));
  facts(out, csv);
}

/**
 * The rows as they will be written: dates as ISO, money as plain signed
 * numbers, and everything else exactly as the page had it.
 *
 * Only columns the arithmetic identified as money are rewritten. A column of
 * digits this tool merely *could* parse - an account number, a cheque number -
 * is left alone, because turning 0001234 into 1234.00 would be destroying data
 * to make it look tidier.
 */
function normalise(table, proof, order, mark) {
  const money = new Set(proof
    ? [proof.balance, ...proof.amounts]
    : table.moneyColumns);

  const headers = table.headers.map((given, at) => given || columnLetter(at));
  const rows = table.rows.map((row) => row.cells.map((cell, at) => {
    if (at === table.dateColumn) return parseDate(cell, order) ?? cell;
    if (!money.has(at) || !cell) return cell;
    const value = parseAmount(cell, mark);
    return value === null ? cell : formatAmount(value);
  }));

  return [headers, ...rows];
}

/** The line that says whether any of this is proven. */
function sayCheck(proof) {
  el.checkLine.classList.remove('held', 'broke');

  if (!proof) {
    el.checkLine.textContent = phrase('check.none');
    return;
  }

  if (!proof.broken.length) {
    el.checkLine.classList.add('held');
    el.checkLine.textContent = phrase('check.held');
    return;
  }

  const where = proof.broken.length === 1
    ? phrase('check.row', { n: proof.broken[0] })
    : phrase('check.rows', { list: proof.broken.join(', ') });

  el.checkLine.classList.add('broke');
  el.checkLine.textContent = phrase('check.broke', {
    held: proof.held, links: proof.links, where,
  });
}

function drawPreview([headers, ...rows]) {
  el.previewHead.replaceChildren(...headers.map((name) => {
    const cell = document.createElement('th');
    cell.scope = 'col';
    cell.textContent = name;
    return cell;
  }));

  const shown = rows.slice(0, PREVIEW_ROWS);
  el.previewBody.replaceChildren(...shown.map((row) => {
    const line = document.createElement('tr');
    line.replaceChildren(...row.map((value) => {
      const cell = document.createElement('td');
      cell.textContent = value;
      return cell;
    }));
    return line;
  }));

  el.previewCaption.textContent = rows.length > shown.length
    ? phrase('preview.caption', { shown: shown.length, rows: rows.length })
    : phrase('preview.all', { rows: rows.length });

  el.previewMore.hidden = rows.length <= shown.length;
  el.previewMore.textContent = phrase('preview.more',
    { shown: shown.length, rows: rows.length });
}

function facts([headers], csv) {
  const lines = [
    phrase('fact.columns', { n: headers.length }),
    phrase('fact.dates'),
    phrase('fact.amounts'),
    `${phrase('fact.encoding')} · ${size(new Blob([csv]).size)}`,
  ];

  el.resultFacts.replaceChildren(...lines.map((text) => {
    const item = document.createElement('li');
    item.textContent = text;
    return item;
  }));
}

/* ---------------------------------------------------------------- the words */

const countPages = (n) => phrase(n === 1 ? 'count.pages.one' : 'count.pages.many', { n });
const size = (n) => sizeText(n, phrase, { under: 'size.bytes' });

/** The statement's name without its extension, for the CSV beside it. */
function baseName(name) {
  return name.replace(/\.[^.]+$/, '') || 'statement';
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
