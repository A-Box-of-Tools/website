/** UI wiring and application state. */

import { phrase, fill } from './shared/phrases.js';
import { sizeText } from './shared/format.js';
import { downloadLink } from './shared/download.js';
import { messageBox } from './shared/message-box.js';
import { wireFilePicker } from './shared/file-picker.js';
import { LANGUAGES, languageById, formatText, detectLanguage } from './format.js';
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

const { show: showError, clear: clearError } = messageBox(el.error, {
  onShow: () => { el.resultNote.textContent = phrase('out.empty'); },
});
const download = downloadLink(el.download);
const humanBytes = (n) => sizeText(n, phrase, { under: 'size.bytes', kb: 1, mb: 2 });

/** Which of the two jobs is on screen. */
let mode = 'format';
/** The text of the last successful result, for the copy and download buttons. */
let result = null;

/* ------------------------------------------------------------- the menu */

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

for (const control of [el.language, el.indent, el.style, el.sortKeys, el.conversion,
  el.rootName]) {
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
  if (sample.language && mode === 'format') el.language.value = sample.language;
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

/* --------------------------------------------------------------- the work */

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

function updateOptionVisibility() {
  const language = chosenLanguage();
  el.sortKeys.closest('.field').hidden = !(language && languageById(language).sorts);
  el.style.disabled = !!language && !languageById(language).minifies;
  el.styleNote.textContent = el.style.disabled ? phrase('style.noyaml') : '';
  el.rootField.hidden = el.conversion.value !== 'json-xml';
  el.conversionNote.textContent = phrase(conversionById(el.conversion.value).note);
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
    showError(phrase('detect.unknown'));
    return;
  }
  el.detected.textContent = el.language.value === 'auto'
    ? phrase('detect.read', { name: languageById(language).name })
    : '';

  const minify = el.style.value === 'minify' && languageById(language).minifies;
  const out = formatText(text, {
    language,
    minify,
    indent: indentString(),
    sortKeys: el.sortKeys.checked && languageById(language).sorts,
  });

  const before = byteLength(text);
  const after = byteLength(out);

  // Two sentences nested rather than one built by adding clauses: what
  // was read, and then what came of it. Which mark joins them is the
  // phrase's business.
  const what = phrase(minify ? 'note.squeezed' : 'note.laid',
    { name: languageById(language).name });
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

  show(out, note, `formatted.${language}`);
}

function runConvert(text) {
  const conversion = conversionById(el.conversion.value);
  const out = conversion.run(text, {
    indent: indentString(),
    spaces: el.indent.value === 'tab' ? 2 : Number(el.indent.value),
    sortKeys: el.sortKeys.checked,
    root: el.rootName.value.trim(),
  });
  show(out, phrase('note.converted', {
    name: phrase(conversion.name),
    lines: out.split('\n').length - 1,
    size: humanBytes(byteLength(out)),
  }), `converted.${conversion.output}`);
}

/* -------------------------------------------------------------- the result */

function show(text, note, name) {
  el.output.textContent = text;
  el.resultNote.textContent = note;
  result = { text, name };
  el.copy.disabled = text === '';
  download.offer(text, name);
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
  download.clear();
  result = null;
}

/**
 * Whatever went wrong, as a sentence.
 *
 * A ParseError carries a phrase key, the blanks that fill it, and the line and
 * column it stopped at; those two numbers are a sentence of their own and are
 * put around the reason here rather than inside every parser. A blank can be a
 * {key, values} pair in its own right - `describe()` hands one back for the
 * character it found - so one level of nesting is resolved on the way in.
 *
 * Anything else is the platform talking, and phrase() hands back what it
 * cannot find, so it still reads as itself.
 */
function say(error) {
  if (error?.name === 'ParseError') {
    return phrase('parse.at', {
      reason: phrase(error.reason, fill(error.values)),
      line: error.line,
      column: error.column,
    });
  }
  return error?.message ? phrase(error.message, fill(error.values)) : String(error);
}

/* ----------------------------------------------------------------- wording */

const indentString = () => (el.indent.value === 'tab' ? '\t' : ' '.repeat(Number(el.indent.value)));

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

// The language menu is written out in body.html so that the page reads without
// JavaScript; this checks the two lists agree rather than filling one from the
// other, because the markup is what a search engine and a reader see first.
for (const language of LANGUAGES) {
  if (!el.language.querySelector(`option[value="${language.id}"]`)) {
    console.warn(`the language menu is missing ${language.id}`);
  }
}

updateCounts();
setMode('format');

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
