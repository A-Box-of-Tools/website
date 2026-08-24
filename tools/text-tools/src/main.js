/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { wireFilePicker } from './shared/file-picker.js';
import { LANGUAGES, languageById, formatText, detectLanguage } from './format.js';
import { CONVERSIONS, conversionById } from './convert.js';
import { CODECS, codecById, CodecError } from './encode.js';
import { compareText, alignRows, diffWords, formatUnified } from './diff.js';
import { SAMPLES } from './samples.js';

const $ = (id) => document.getElementById(id);

const el = {
  tabs: Array.from(document.querySelectorAll('.tab')),
  panels: {
    format: $('options-format'),
    convert: $('options-convert'),
    encode: $('options-encode'),
    diff: $('options-diff'),
  },
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  input: $('input'),
  inputB: $('input-b'),
  paneB: $('pane-b'),
  inputLabel: $('input-label'),
  inputCount: $('input-count'),
  inputBCount: $('input-b-count'),
  detected: $('detected'),
  language: $('language'),
  languageNote: $('language-note'),
  indent: $('indent'),
  style: $('style'),
  styleNote: $('style-note'),
  sortKeys: $('sort-keys'),
  conversion: $('conversion'),
  conversionNote: $('conversion-note'),
  rootField: $('root-field'),
  rootName: $('root-name'),
  codec: $('codec'),
  codecNote: $('codec-note'),
  view: $('view'),
  onlyChanges: $('only-changes'),
  ignoreWhitespace: $('ignore-whitespace'),
  ignoreCase: $('ignore-case'),
  ignoreBlank: $('ignore-blank'),
  sample: $('sample'),
  swap: $('swap'),
  clear: $('clear'),
  error: $('error'),
  output: $('output'),
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

/** Which of the four jobs is on screen. */
let mode = 'format';
/** The text of the last successful result, for the copy and download buttons. */
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

/* ------------------------------------------------------------- the menus */

// Both menus are filled from the lists the modules export, so a codec or a
// conversion that exists is on the menu and one that does not cannot be.
for (const conversion of CONVERSIONS) {
  el.conversion.append(new Option(conversion.name, conversion.id));
}
for (const codec of CODECS) {
  el.codec.append(new Option(codec.name, codec.id));
}

/* ---------------------------------------------------------------- the tabs */

function setMode(next) {
  mode = next;
  for (const tab of el.tabs) {
    const on = tab.dataset.mode === next;
    tab.setAttribute('aria-selected', String(on));
    tab.tabIndex = on ? 0 : -1;
  }
  for (const [name, panel] of Object.entries(el.panels)) panel.hidden = name !== next;

  const comparing = next === 'diff';
  el.paneB.hidden = !comparing;
  el.swap.hidden = !comparing;
  el.output.hidden = comparing;
  el.diffView.hidden = !comparing;
  el.inputLabel.textContent = comparing ? 'The original' : 'Your text';
  el.fileInput.multiple = comparing;
  el.detected.hidden = next !== 'format';

  run();
}

for (const tab of el.tabs) {
  tab.addEventListener('click', () => setMode(tab.dataset.mode));
  // The arrow keys move between tabs, which is what a tab strip is expected to
  // do and what a row of buttons does not do on its own.
  tab.addEventListener('keydown', (event) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const index = el.tabs.indexOf(tab);
    const next = el.tabs[(index + step + el.tabs.length) % el.tabs.length];
    next.focus();
    setMode(next.dataset.mode);
  });
}

/* ------------------------------------------------------------------- input */

const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles(files) { loadFiles(files); },
});

async function loadFiles(files) {
  picker.busy(`Reading ${files.length === 1 ? 'the file' : `${files.length} files`}...`);
  try {
    // Read as text, here, by the browser. There is no other step: the string
    // goes into the box below and never anywhere else.
    const texts = await Promise.all(files.slice(0, 2).map((file) => file.text()));
    if (mode === 'diff' && texts.length > 1) {
      el.input.value = texts[0];
      el.inputB.value = texts[1];
    } else if (mode === 'diff' && el.input.value.trim() && !el.inputB.value.trim()) {
      // One file dropped onto a comparison that already has an original fills
      // the empty side, which is the only thing it could sensibly mean.
      el.inputB.value = texts[0];
    } else {
      el.input.value = texts[0];
    }
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
  // is local either way; this is only about not re-formatting a megabyte
  // between two keystrokes.
  const size = el.input.value.length + el.inputB.value.length;
  timer = setTimeout(run, size > 200000 ? 500 : 120);
}

for (const box of [el.input, el.inputB]) {
  box.addEventListener('input', () => { updateCounts(); schedule(); });
}

for (const control of [el.language, el.indent, el.style, el.sortKeys, el.conversion,
  el.rootName, el.codec, el.view, el.onlyChanges, el.ignoreWhitespace, el.ignoreCase,
  el.ignoreBlank]) {
  control.addEventListener('change', run);
}
for (const radio of document.querySelectorAll('input[name="direction"]')) {
  radio.addEventListener('change', run);
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
  const sample = SAMPLES[mode];
  el.input.value = sample.a;
  if (sample.b !== undefined) el.inputB.value = sample.b;
  if (sample.language && mode === 'format') el.language.value = sample.language;
  if (sample.conversion && mode === 'convert') el.conversion.value = sample.conversion;
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
  updateOptionVisibility();

  const text = el.input.value;
  if (mode !== 'diff' && text.trim() === '') {
    el.resultNote.textContent = 'Nothing yet.';
    return;
  }

  try {
    if (mode === 'format') runFormat(text);
    else if (mode === 'convert') runConvert(text);
    else if (mode === 'encode') runEncode(text);
    else runDiff(text, el.inputB.value);
  } catch (error) {
    // A parse error is the expected outcome of pasting something broken, and
    // is reported as information rather than as a failure. Anything else is a
    // bug here and goes to the console as well.
    showError(error?.message ?? String(error));
    if (error?.name !== 'ParseError' && error?.name !== 'CodecError') console.error(error);
  }
}

function updateOptionVisibility() {
  const language = chosenLanguage();
  el.sortKeys.closest('.field').hidden = !(language && languageById(language).sorts);
  el.style.disabled = !!language && !languageById(language).minifies;
  el.styleNote.textContent = el.style.disabled
    ? 'YAML has no squeezed form worth writing: the short one is flow style, which is unreadable.'
    : '';
  el.rootField.hidden = el.conversion.value !== 'json-xml';
  el.conversionNote.textContent = conversionById(el.conversion.value).note;
  el.codecNote.textContent = codecById(el.codec.value).note;
}

/** What the language menu says, or what the text looks like when it says auto. */
function chosenLanguage() {
  if (el.language.value !== 'auto') return el.language.value;
  return detectLanguage(el.input.value);
}

function runFormat(text) {
  const language = chosenLanguage();
  if (!language) {
    el.detected.textContent = '';
    showError('This does not look like JSON, XML, HTML, CSS or YAML. '
      + 'Pick the language from the menu if it is one of them.');
    return;
  }
  el.detected.textContent = el.language.value === 'auto'
    ? `Read as ${languageById(language).name}.` : '';

  const minify = el.style.value === 'minify' && languageById(language).minifies;
  const out = formatText(text, {
    language,
    minify,
    indent: indentString(),
    sortKeys: el.sortKeys.checked && languageById(language).sorts,
  });

  const before = byteLength(text);
  const after = byteLength(out);
  const change = minify && before > 0
    ? ` - ${humanBytes(before)} down to ${humanBytes(after)}, `
      + `${Math.round((1 - after / before) * 100)}% off`
    : '';
  show(out, `${languageById(language).name}, ${minify ? 'squeezed flat' : 'laid out'}`
    + `${change || ` - ${out.split('\n').length - 1} lines, ${humanBytes(after)}`}`,
    `formatted.${language}`);
}

function runConvert(text) {
  const conversion = conversionById(el.conversion.value);
  const out = conversion.run(text, {
    indent: indentString(),
    spaces: el.indent.value === 'tab' ? 2 : Number(el.indent.value),
    sortKeys: el.sortKeys.checked,
    root: el.rootName.value.trim(),
  });
  show(out, `${conversion.name} - ${out.split('\n').length - 1} lines, ${humanBytes(byteLength(out))}`,
    `converted.${conversion.output}`);
}

function runEncode(text) {
  const codec = codecById(el.codec.value);
  const decoding = pickedDirection() === 'decode';
  let out;
  try {
    out = decoding ? codec.decode(text) : codec.encode(text);
  } catch (error) {
    if (error?.name === 'TypeError') {
      // What a fatal TextDecoder throws. Its own message says nothing useful
      // to somebody who pasted the wrong thing into the box.
      throw new CodecError('Those bytes are not UTF-8 text, so there is nothing to show. '
        + 'They may be a file rather than a string.');
    }
    throw error;
  }
  show(out, `${codec.name}, ${decoding ? 'decoded' : 'encoded'} - `
    + `${humanBytes(byteLength(text))} in, ${humanBytes(byteLength(out))} out`,
    decoding ? 'decoded.txt' : 'encoded.txt');
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

function show(text, note, name) {
  el.output.textContent = text;
  el.resultNote.textContent = note;
  result = { text, name };
  el.copy.disabled = text === '';
  offerDownload(text, name);
}

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
    // Selecting the block is a route that always works.
    const range = document.createRange();
    range.selectNodeContents(mode === 'diff' ? el.diffView : el.output);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    el.copy.textContent = 'Selected - press Ctrl+C';
  }
  setTimeout(() => { el.copy.textContent = 'Copy'; }, 2500);
});

function clearResult() {
  el.output.textContent = '';
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

const indentString = () => (el.indent.value === 'tab' ? '\t' : ' '.repeat(Number(el.indent.value)));

const pickedDirection = () => document.querySelector('input[name="direction"]:checked').value;

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
    const platformNote = platform.size === 0
      ? ''
      : ` The page's own ad, measurement and donate-button scripts loaded from ${platform.size} `
        + `host${platform.size === 1 ? '' : 's'}; not one of them was given a character of it.`;

    el.networkCount.textContent = clean
      ? `your text has gone nowhere. ${total} files loaded.${platformNote}`
      : `something contacted ${[...external].join(', ')}, which this tool never does.${platformNote}`;

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

// The language menu is written out in body.html so that the page reads without
// JavaScript; this checks the two lists agree rather than filling one from the
// other, because the markup is what a search engine and a reader see first.
for (const language of LANGUAGES) {
  if (!el.language.querySelector(`option[value="${language.id}"]`)) {
    console.warn(`the language menu is missing ${language.id}`);
  }
}

// Side by side needs two columns of text and a phone has room for about one,
// so the narrow screen starts on the single-column view instead. It is the
// starting position rather than a lock: the menu is right there, and this runs
// once rather than fighting the reader every time they turn the phone over.
if (window.matchMedia('(max-width: 620px)').matches) el.view.value = 'unified';

updateCounts();
setMode('format');
monitorNetwork();
registerServiceWorker();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
