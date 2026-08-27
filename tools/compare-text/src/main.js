/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { wireFilePicker } from './shared/file-picker.js';
import { compareText, alignRows, diffWords, formatUnified } from './diff.js';
import { SAMPLES } from './samples.js';

const $ = (id) => document.getElementById(id);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  input: $('input'),
  inputB: $('input-b'),
  inputCount: $('input-count'),
  inputBCount: $('input-b-count'),
  view: $('view'),
  onlyChanges: $('only-changes'),
  ignoreWhitespace: $('ignore-whitespace'),
  ignoreCase: $('ignore-case'),
  ignoreBlank: $('ignore-blank'),
  sample: $('sample'),
  swap: $('swap'),
  clear: $('clear'),
  error: $('error'),
  diffView: $('diff-view'),
  resultNote: $('result-note'),
  copy: $('copy'),
  download: $('download'),
  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
  networkCount: $('network-count'),
  networkDot: $('network-dot'),
  offlineStatus: $('offline-status'),
  offlineDot: $('offline-dot'),
};

/** The patch of the last comparison, for the copy and download buttons. */
let result = null;
let downloadUrl = null;

/** How many rows of a comparison are drawn before it stops.
 *
 *  Not a limit on what can be compared - the comparison itself is done, and
 *  the counts above it are the counts for the whole thing. It is a limit on
 *  how many elements go into the page, because a hundred thousand of them is
 *  a tab that stops responding, and nobody reads the eight thousandth row of
 *  a diff anyway. */
const MAX_ROWS = 4000;

/* ------------------------------------------------------------------- input */

const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles(files) { loadFiles(files); },
});

async function loadFiles(files) {
  picker.busy(`Reading ${files.length === 1 ? 'the file' : `${files.length} files`}...`);
  try {
    // Read as text, here, by the browser. There is no other step: the strings
    // go into the boxes below and never anywhere else.
    const texts = await Promise.all(files.slice(0, 2).map((file) => file.text()));
    if (texts.length > 1) {
      el.input.value = texts[0];
      el.inputB.value = texts[1];
    } else if (el.input.value.trim() && !el.inputB.value.trim()) {
      // One file dropped onto a comparison that already has an original fills
      // the empty side, which is the only thing it could sensibly mean.
      el.inputB.value = texts[0];
    } else {
      el.input.value = texts[0];
    }
    updateCounts();
    run();
  } catch (error) {
    showError(`That file could not be read: ${error?.message ?? error}`);
  } finally {
    picker.done();
  }
}

let timer = null;

function schedule() {
  clearTimeout(timer);
  // A long wait on a long document, a short one on a short document. The work
  // is local either way; this is only about not re-comparing a megabyte
  // between two keystrokes.
  const size = el.input.value.length + el.inputB.value.length;
  timer = setTimeout(run, size > 200000 ? 500 : 120);
}

for (const box of [el.input, el.inputB]) {
  box.addEventListener('input', () => { updateCounts(); schedule(); });
}

for (const control of [el.view, el.onlyChanges, el.ignoreWhitespace, el.ignoreCase,
  el.ignoreBlank]) {
  control.addEventListener('change', run);
}

el.swap.addEventListener('click', () => {
  const held = el.input.value;
  el.input.value = el.inputB.value;
  el.inputB.value = held;
  updateCounts();
  run();
});

el.clear.addEventListener('click', () => {
  el.input.value = '';
  el.inputB.value = '';
  updateCounts();
  run();
  el.input.focus();
});

el.sample.addEventListener('click', () => {
  el.input.value = SAMPLES.diff.a;
  el.inputB.value = SAMPLES.diff.b;
  updateCounts();
  run();
});

function updateCounts() {
  el.inputCount.textContent = describe(el.input.value);
  el.inputBCount.textContent = describe(el.inputB.value);
}

function describe(text) {
  if (text === '') return 'empty';
  const lines = text.split('\n').length;
  return `${lines.toLocaleString()} line${lines === 1 ? '' : 's'}, `
    + `${text.length.toLocaleString()} character${text.length === 1 ? '' : 's'}, `
    + humanBytes(byteLength(text));
}

const byteLength = (text) => new TextEncoder().encode(text).length;

/* --------------------------------------------------------------- the work */

function run() {
  clearError();
  clearResult();

  try {
    runDiff(el.input.value, el.inputB.value);
  } catch (error) {
    // The guards in diff.js turn a pathological comparison into a message
    // rather than a hang; anything else is a bug here and goes to the console
    // as well.
    showError(error?.message ?? String(error));
    console.error(error);
  }
}

function runDiff(aText, bText) {
  if (aText === '' && bText === '') {
    el.resultNote.textContent = 'Paste something into both boxes.';
    el.diffView.replaceChildren();
    return;
  }

  const options = {
    ignoreWhitespace: el.ignoreWhitespace.checked,
    ignoreCase: el.ignoreCase.checked,
    ignoreBlankLines: el.ignoreBlank.checked,
  };
  const { ops, stats } = compareText(aText, bText, options);
  const rows = alignRows(ops);

  el.diffView.replaceChildren(drawDiff(rows));
  el.diffView.classList.toggle('split', el.view.value === 'split');

  const patch = formatUnified(ops, { aLabel: 'original', bLabel: 'changed' });
  result = { text: patch, name: 'changes.patch' };
  el.copy.disabled = patch === '';
  offerDownload(patch, 'changes.patch');

  if (stats.identical) {
    el.resultNote.textContent = 'These two are identical, byte for byte.';
    return;
  }
  const sameText = stats.added === 0 && stats.removed === 0
    ? 'The same, once the differences you asked to ignore are ignored.'
    : `${stats.added.toLocaleString()} added, ${stats.removed.toLocaleString()} removed`;
  el.resultNote.textContent = `${sameText} - `
    + `${Math.round(stats.similarity * 100)}% of the lines are shared.`
    + (stats.trailingDiffers ? ' One of them ends with a newline and the other does not.' : '');
}

/* -------------------------------------------------------------- drawing it */

function drawDiff(rows) {
  const table = document.createElement('div');
  table.className = 'diff-table';
  const kept = el.onlyChanges.checked ? collapse(rows, 3) : rows.map((row) => ({ row }));

  let drawn = 0;
  for (const entry of kept) {
    if (entry.skipped) {
      const gap = document.createElement('div');
      gap.className = 'diff-skip';
      gap.textContent = `${entry.skipped.toLocaleString()} unchanged line`
        + `${entry.skipped === 1 ? '' : 's'}`;
      table.append(gap);
      continue;
    }
    if (drawn >= MAX_ROWS) {
      const gap = document.createElement('div');
      gap.className = 'diff-skip';
      gap.textContent = 'The rest is not drawn - use Download to get the whole patch.';
      table.append(gap);
      break;
    }
    table.append(el.view.value === 'split' ? splitRow(entry.row) : unifiedRow(entry.row));
    drawn += 1;
  }
  return table;
}

/**
 * Keep every changed row and `context` rows either side of one; everything
 * else becomes a count. On a file with three edits in it this is the
 * difference between reading the diff and scrolling through the file.
 */
function collapse(rows, context) {
  const keep = new Array(rows.length).fill(false);
  rows.forEach((row, index) => {
    if (row.type === 'equal') return;
    for (let i = Math.max(0, index - context); i <= Math.min(rows.length - 1, index + context); i += 1) {
      keep[i] = true;
    }
  });

  const out = [];
  let skipped = 0;
  rows.forEach((row, index) => {
    if (keep[index]) {
      if (skipped) { out.push({ skipped }); skipped = 0; }
      out.push({ row });
      return;
    }
    skipped += 1;
  });
  if (skipped) out.push({ skipped });
  return out;
}

function splitRow(row) {
  const line = document.createElement('div');
  line.className = `diff-row ${row.type}`;
  const words = row.type === 'change' ? diffWords(row.a.text, row.b.text) : null;

  line.append(
    lineNumber(row.a?.a),
    side(row.a ? row.a.text : null, words?.a, 'left', row.type === 'change' || row.type === 'delete'),
    lineNumber(row.b?.b),
    side(row.b ? row.b.text : null, words?.b, 'right', row.type === 'change' || row.type === 'insert'),
  );
  return line;
}

function unifiedRow(row) {
  if (row.type === 'change') {
    // A changed line is two lines in one column, which is what a unified diff
    // has always been: the old one and then the new one.
    const wrap = document.createDocumentFragment();
    wrap.append(unifiedRow({ type: 'delete', a: row.a, b: null }));
    wrap.append(unifiedRow({ type: 'insert', a: null, b: row.b }));
    return wrap;
  }
  const line = document.createElement('div');
  line.className = `diff-row ${row.type}`;
  const sign = row.type === 'insert' ? '+' : row.type === 'delete' ? '-' : ' ';
  const text = (row.a ?? row.b).text;
  line.append(lineNumber(row.a?.a), lineNumber(row.b?.b));
  const cell = document.createElement('span');
  // The same two class names the split view uses, so one pair of colour rules
  // covers both views: what went is on the left, what arrived is on the right.
  cell.className = `side ${row.type === 'insert' ? 'right marked'
    : row.type === 'delete' ? 'left marked' : 'left'}`;
  cell.textContent = `${sign}${text}`;
  line.append(cell);
  return line;
}

function lineNumber(value) {
  const cell = document.createElement('span');
  cell.className = 'ln';
  cell.textContent = value === undefined || value === null ? '' : String(value + 1);
  return cell;
}

/**
 * One side of a row. `where` is which column it is in, because that is what
 * decides the colour: the left-hand side of a change is what went, the
 * right-hand side is what arrived.
 */
function side(text, words, where, marked) {
  const cell = document.createElement('span');
  cell.className = `side ${where}${marked ? ' marked' : ''}`;
  if (text === null) { cell.classList.add('empty'); return cell; }
  if (!words) { cell.textContent = text; return cell; }
  for (const part of words) {
    if (part.same) { cell.append(part.text); continue; }
    const mark = document.createElement('mark');
    mark.textContent = part.text;
    cell.append(mark);
  }
  return cell;
}

/* -------------------------------------------------------------- the result */

/**
 * The download is a blob: URL made in this page from a string that was already
 * in this page. Nothing is uploaded to produce it and nothing is fetched to
 * serve it.
 */
function offerDownload(text, name) {
  if (downloadUrl) URL.revokeObjectURL(downloadUrl);
  downloadUrl = null;
  if (text === '') { el.download.hidden = true; return; }
  downloadUrl = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  el.download.href = downloadUrl;
  el.download.download = name;
  el.download.hidden = false;
}

el.copy.addEventListener('click', async () => {
  if (!result) return;
  try {
    await navigator.clipboard.writeText(result.text);
    el.copy.textContent = 'Copied';
  } catch {
    // Clipboard access can be refused outright, and there is nothing to fix.
    // Selecting the view is a route that always works.
    const range = document.createRange();
    range.selectNodeContents(el.diffView);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    el.copy.textContent = 'Selected - press Ctrl+C';
  }
  setTimeout(() => { el.copy.textContent = 'Copy'; }, 2500);
});

function clearResult() {
  el.diffView.replaceChildren();
  el.copy.disabled = true;
  el.download.hidden = true;
  result = null;
  if (downloadUrl) URL.revokeObjectURL(downloadUrl);
  downloadUrl = null;
}

function showError(message) {
  el.error.textContent = message;
  el.error.hidden = false;
  el.resultNote.textContent = 'Nothing came out.';
}

function clearError() {
  el.error.hidden = true;
  el.error.textContent = '';
}

/* ----------------------------------------------------------------- wording */

function humanBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/* ------------------------------------------------- privacy panel + offline */

el.privacyToggle.addEventListener('click', () => {
  const open = el.privacyPanel.hidden;
  el.privacyPanel.hidden = !open;
  el.privacyToggle.setAttribute('aria-expanded', String(open));
});

// Hosts belonging to the ad, measurement and donate-button scripts. This tool
// has no network feature of its own at all - there is no address to paste and
// nothing to fetch - so anything outside this list appearing here would be a
// genuine surprise, and the panel says so in those terms.
// google.com is written as a pattern because Google's measurement pixel uses
// the visitor's own country domain, and a list of literal hostnames would turn
// this panel red for a visitor in the wrong country - which is the worst
// possible failure for the one part of the page that exists to be checked.
// cloudflareinsights.com is here because the host injects its own beacon; the
// CSP blocks it from running, but a blocked script still leaves a timing entry.
const PLATFORM_HOSTS = /(^|\.)(googlesyndication\.com|doubleclick\.net|googleadservices\.com|googletagservices\.com|adtrafficquality\.google|googletagmanager\.com|google-analytics\.com|gstatic\.com|googleapis\.com|buymeacoffee\.com|cloudflareinsights\.com|google\.[a-z]{2,3}(\.[a-z]{2})?)$/;

/**
 * Report what this page has actually fetched.
 *
 * The claim on trial is not "this page is silent" - it is not, it carries ads -
 * but "nothing has carried your text away". That is the part that matters, and
 * the part a sceptical visitor can watch hold in real time.
 */
function monitorNetwork() {
  const platform = new Set();
  const external = new Set();

  const inspect = (entries) => {
    for (const entry of entries) {
      if (entry.name.startsWith('blob:') || entry.name.startsWith('data:')) continue;
      const url = new URL(entry.name, location.href);
      if (url.origin === location.origin) continue;
      if (PLATFORM_HOSTS.test(url.hostname)) platform.add(url.hostname);
      else external.add(url.hostname);
    }
    const total = performance.getEntriesByType('resource')
      .filter((entry) => !entry.name.startsWith('blob:') && !entry.name.startsWith('data:')).length;

    const clean = external.size === 0;
    // One phrase per number rather than a pluralising helper: a language
    // whose plural is not a suffix has to be able to translate the two
    // separately.
    const platformNote = platform.size
      ? phrase(platform.size === 1 ? 'net.platform.one' : 'net.platform.many',
               { hosts: platform.size })
      : '';

    el.networkCount.textContent = clean
      ? phrase('net.clean', { total, platform: platformNote })
      : phrase('net.dirty', { hosts: [...external].join(', '), platform: platformNote });

    el.networkCount.className = clean ? 'good' : 'warn';
    el.networkDot.className = `live-dot ${clean ? 'good' : 'warn'}`;
  };

  inspect(performance.getEntriesByType('resource'));
  try {
    new PerformanceObserver((list) => inspect(list.getEntries()))
      .observe({ type: 'resource', buffered: true });
  } catch {
    // PerformanceObserver is unavailable; the one-time snapshot above still stands.
  }
}

async function registerServiceWorker() {
  // Keep the visible text short: this sits in the trust panel, and a raw
  // browser error dumped there reads worse than it is.
  const fail = (message, detail) => {
    el.offlineStatus.textContent = message;
    el.offlineDot.className = 'live-dot';
    if (detail) {
      el.offlineStatus.title = detail;
      console.info('Offline caching unavailable:', detail);
    }
  };

  if (!('serviceWorker' in navigator)) {
    fail(phrase('offline.none'));
    return;
  }
  if (!window.isSecureContext) {
    fail(phrase('offline.insecure'));
    return;
  }

  try {
    await navigator.serviceWorker.register('sw.js');
    await navigator.serviceWorker.ready;
    el.offlineStatus.textContent = phrase('offline.ready');
    el.offlineStatus.className = 'good';
    el.offlineDot.className = 'live-dot good';
  } catch (error) {
    fail(phrase('offline.failed'), error.message);
  }
}

/* -------------------------------------------------------------------- boot */

window.addEventListener('error', (event) => {
  showError(phrase('error.broke', { detail: event.message }));
});
window.addEventListener('unhandledrejection', (event) => {
  showError(phrase('error.broke', { detail: event.reason?.message ?? event.reason }));
});

// Side by side needs two columns of text and a phone has room for about one,
// so the narrow screen starts on the single-column view instead. It is the
// starting position rather than a lock: the menu is right there, and this runs
// once rather than fighting the reader every time they turn the phone over.
if (window.matchMedia('(max-width: 620px)').matches) el.view.value = 'unified';

updateCounts();
run();
monitorNetwork();
registerServiceWorker();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
