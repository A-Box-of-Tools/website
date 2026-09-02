/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { wireFilePicker } from './shared/file-picker.js';
import { parseXml, printXml } from './xml.js';
import { CONVERSIONS, conversionById } from './convert.js';
import { SAMPLES } from './samples.js';

const $ = (id) => document.getElementById(id);

const el = {
  tabs: Array.from(document.querySelectorAll('.tab')),
  panels: {
    format: $('options-format'),
    convert: $('options-convert'),
  },
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  input: $('input'),
  inputCount: $('input-count'),
  indent: $('indent'),
  style: $('style'),
  conversion: $('conversion'),
  conversionNote: $('conversion-note'),
  rootField: $('root-field'),
  rootName: $('root-name'),
  sample: $('sample'),
  clear: $('clear'),
  error: $('error'),
  output: $('output'),
  resultNote: $('result-note'),
  copy: $('copy'),
  download: $('download'),
  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
};

/** Which of the two jobs is on screen. */
let mode = 'format';
/** The text of the last successful result, for the copy and download buttons. */
let result = null;
let downloadUrl = null;

/* ---------------------------------------------------------------- the menu */

// Filled from the list the module exports, so a conversion that exists is on
// the menu and one that does not cannot be.
for (const conversion of CONVERSIONS) {
  el.conversion.append(new Option(phrase(conversion.name), conversion.id));
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
  picker.busy(phrase('read.reading'));
  try {
    // Read as text, here, by the browser. There is no other step: the string
    // goes into the box below and never anywhere else.
    el.input.value = await files[0].text();
    run();
  } catch (error) {
    showError(phrase('read.failed', { reason: say(error) }));
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
  const size = el.input.value.length;
  timer = setTimeout(run, size > 200000 ? 500 : 120);
}

el.input.addEventListener('input', () => { updateCounts(); schedule(); });

for (const control of [el.indent, el.style, el.conversion, el.rootName]) {
  control.addEventListener('change', run);
}

el.clear.addEventListener('click', () => {
  el.input.value = '';
  updateCounts();
  run();
  el.input.focus();
});

el.sample.addEventListener('click', () => {
  const sample = SAMPLES[mode];
  el.input.value = sample.a;
  if (sample.conversion && mode === 'convert') el.conversion.value = sample.conversion;
  updateCounts();
  run();
});

function updateCounts() {
  el.inputCount.textContent = describe(el.input.value);
}

function describe(text) {
  if (text === '') return 'empty';
  const lines = text.split('\n').length;
  return `${lines.toLocaleString()} line${lines === 1 ? '' : 's'}, `
    + `${text.length.toLocaleString()} character${text.length === 1 ? '' : 's'}, `
    + humanBytes(byteLength(text));
}

const byteLength = (text) => new TextEncoder().encode(text).length;

/* ---------------------------------------------------------------- the work */

function run() {
  clearError();
  clearResult();
  updateOptionVisibility();

  const text = el.input.value;
  if (text.trim() === '') {
    el.resultNote.textContent = phrase('out.nothing');
    return;
  }

  try {
    if (mode === 'format') runFormat(text);
    else runConvert(text);
  } catch (error) {
    // A parse error is the expected outcome of pasting something broken, and
    // is reported as information rather than as a failure. Anything else is a
    // bug here and goes to the console as well.
    showError(say(error));
    if (error?.name !== 'ParseError') console.error(error);
  }
}

/**
 * The one control that only means something in one direction: XML has a single
 * element at the top and JSON does not, so going that way a name has to be
 * invented, and going the other way there is nothing to invent it for.
 */
function updateOptionVisibility() {
  el.rootField.hidden = !(mode === 'convert' && el.conversion.value === 'json-xml');
  el.conversionNote.textContent = phrase(conversionById(el.conversion.value).note);
}

function runFormat(text) {
  const minify = el.style.value === 'minify';
  const out = endWithNewline(printXml(parseXml(text), { indent: indentString(), minify }));

  const before = byteLength(text);
  const after = byteLength(out);

  // Two sentences nested rather than one built by adding clauses: what was
  // read, and then what came of it. Which mark joins them is the phrase's
  // business.
  const what = phrase(minify ? 'note.squeezed' : 'note.laid');
  const note = minify && before > 0
    ? phrase('note.smaller', {
      what,
      before: humanBytes(before),
      after: humanBytes(after),
      percent: Math.round((1 - after / before) * 100),
    })
    : phrase('note.lines', {
      what,
      lines: out.split('\n').length - 1,
      size: humanBytes(after),
    });

  show(out, note, 'formatted.xml');
}

function runConvert(text) {
  const conversion = conversionById(el.conversion.value);
  const out = conversion.run(text, {
    indent: indentString(),
    root: el.rootName.value.trim(),
  });
  show(out, phrase('note.converted', {
    name: phrase(conversion.name),
    lines: out.split('\n').length - 1,
    size: humanBytes(byteLength(out)),
  }), `converted.${conversion.output}`);
}

/**
 * One newline at the end, whatever the printer did. A file ends with a
 * newline, and the printers' disagreement about who adds it is not worth
 * carrying into the page.
 */
const endWithNewline = (text) => (text.endsWith('\n') ? text : `${text}\n`);

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
    el.copy.textContent = phrase('copy.copied');
  } catch {
    // Clipboard access can be refused outright, and there is nothing to fix.
    // Selecting the block is a route that always works.
    const range = document.createRange();
    range.selectNodeContents(el.output);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    el.copy.textContent = phrase('copy.selected');
  }
  setTimeout(() => { el.copy.textContent = phrase('copy.copy'); }, 2500);
});

function clearResult() {
  el.output.textContent = '';
  el.copy.disabled = true;
  el.download.hidden = true;
  result = null;
  if (downloadUrl) URL.revokeObjectURL(downloadUrl);
  downloadUrl = null;
}

/**
 * Whatever went wrong, as a sentence.
 *
 * A ParseError carries a phrase key, the blanks that fill it, and the line and
 * column it stopped at; those two numbers are a sentence of their own and are
 * put around the reason here rather than inside every parser. A blank can be a
 * {key, values} pair in its own right, so one level of nesting is resolved on
 * the way in.
 *
 * Anything else is the platform talking, and phrase() hands back what it
 * cannot find, so it still reads as itself.
 */
function say(error) {
  const fill = (values = {}) => Object.fromEntries(Object.entries(values)
    .map(([name, value]) => [name, value?.key ? phrase(value.key, value.values) : value]));

  if (error?.name === 'ParseError') {
    return phrase('parse.at', {
      reason: phrase(error.reason, fill(error.values)),
      line: error.line,
      column: error.column,
    });
  }
  return error?.message ? phrase(error.message, fill(error.values)) : String(error);
}

function showError(message) {
  el.error.textContent = message;
  el.error.hidden = false;
  el.resultNote.textContent = phrase('out.empty');
}

function clearError() {
  el.error.hidden = true;
  el.error.textContent = '';
}

/* ----------------------------------------------------------------- wording */

const indentString = () => (el.indent.value === 'tab' ? '\t' : ' '.repeat(Number(el.indent.value)));

function humanBytes(bytes) {
  if (bytes < 1024) return phrase('size.bytes', { n: bytes });
  if (bytes < 1024 * 1024) return phrase('size.kb', { n: (bytes / 1024).toFixed(1) });
  return phrase('size.mb', { n: (bytes / (1024 * 1024)).toFixed(2) });
}

/* ------------------------------------------------- privacy panel + offline */

el.privacyToggle.addEventListener('click', () => {
  const open = el.privacyPanel.hidden;
  el.privacyPanel.hidden = !open;
  el.privacyToggle.setAttribute('aria-expanded', String(open));
});

/* -------------------------------------------------------------------- boot */

window.addEventListener('error', (event) => {
  showError(phrase('error.broke', { detail: event.message }));
});
window.addEventListener('unhandledrejection', (event) => {
  showError(phrase('error.broke', { detail: event.reason?.message ?? event.reason }));
});

updateCounts();
setMode('format');

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
