/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { sizeText } from './shared/format.js';
import { downloadLink } from './shared/download.js';
import { messageBox } from './shared/message-box.js';
import { wireFilePicker } from './shared/file-picker.js';
import { CODECS, codecById, CodecError } from './encode.js';
import { SAMPLES } from './samples.js';

const $ = (id) => document.getElementById(id);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  input: $('input'),
  inputCount: $('input-count'),
  codec: $('codec'),
  codecNote: $('codec-note'),
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
  onShow: () => { el.resultNote.textContent = phrase('result.none'); },
});
const download = downloadLink(el.download);
const humanBytes = (n) => sizeText(n, phrase, { under: 'size.b', kb: 1, mb: 2 });

/** The text of the last successful result, for the copy and download buttons. */
let result = null;

/* --------------------------------------------------------------- the menu */

// Filled from the list the module exports, so a codec that exists is on the
// menu and one that does not cannot be.
for (const codec of CODECS) {
  el.codec.append(new Option(phrase(codec.name), codec.id));
}

/* ------------------------------------------------------------------- input */

const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles(files) { loadFiles(files); },
});

async function loadFiles(files) {
  picker.busy(phrase('step.reading'));
  try {
    // Read as text, here, by the browser. There is no other step: the string
    // goes into the box below and never anywhere else.
    el.input.value = await files[0].text();
    updateCounts();
    run();
  } catch (error) {
    showError(phrase('read.failed', { why: error?.message ?? error }));
  } finally {
    picker.done();
  }
}

let timer = null;

function schedule() {
  clearTimeout(timer);
  // A long wait on a long document, a short one on a short document. The work
  // is local either way; this is only about not re-encoding a megabyte
  // between two keystrokes.
  const size = el.input.value.length;
  timer = setTimeout(run, size > 200000 ? 500 : 120);
}

el.input.addEventListener('input', () => { updateCounts(); schedule(); });

el.codec.addEventListener('change', run);
for (const radio of document.querySelectorAll('input[name="direction"]')) {
  radio.addEventListener('change', run);
}

el.clear.addEventListener('click', () => {
  el.input.value = '';
  updateCounts();
  run();
  el.input.focus();
});

el.sample.addEventListener('click', () => {
  el.input.value = phrase(SAMPLES.encode.a);
  updateCounts();
  run();
});

function updateCounts() {
  el.inputCount.textContent = describe(el.input.value);
}

function describe(text) {
  if (text === '') return phrase('count.empty');
  const lines = text.split('\n').length;
  // Three phrases folded with a fourth rather than one with commas in it:
  // ja and zh separate a list with a character of their own.
  return [
    phrase(lines === 1 ? 'n.line.one' : 'n.line.many', { n: lines.toLocaleString() }),
    phrase(text.length === 1 ? 'n.character.one' : 'n.character.many',
      { n: text.length.toLocaleString() }),
    humanBytes(byteLength(text)),
  ].reduce((a, b) => phrase('join.comma', { a, b }));
}

const byteLength = (text) => new TextEncoder().encode(text).length;

/* --------------------------------------------------------------- the work */

function run() {
  clearError();
  clearResult();
  el.codecNote.textContent = phrase(codecById(el.codec.value).note);

  const text = el.input.value;
  if (text.trim() === '') {
    el.resultNote.textContent = phrase('result.nothing');
    return;
  }

  try {
    runEncode(text);
  } catch (error) {
    // Bad input is the expected outcome of pasting something broken, and is
    // reported as information rather than as a failure. Anything else is a
    // bug here and goes to the console as well.
    // A CodecError names a phrase; anything else is a bug here and arrives
    // as whatever the platform said, which phrase() hands back unchanged.
    showError(phrase(error?.message ?? String(error), error?.values));
    if (error?.name !== 'CodecError') console.error(error);
  }
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
      throw new CodecError('utf8.notext');
    }
    throw error;
  }
  show(out, phrase(decoding ? 'out.decoded' : 'out.encoded', {
    name: phrase(codec.name),
    in: humanBytes(byteLength(text)),
    out: humanBytes(byteLength(out)),
  }), decoding ? 'decoded.txt' : 'encoded.txt');
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
    el.copy.textContent = 'Copied';
  } catch {
    // Clipboard access can be refused outright, and there is nothing to fix.
    // Selecting the block is a route that always works.
    const range = document.createRange();
    range.selectNodeContents(el.output);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    el.copy.textContent = 'Selected - press Ctrl+C';
  }
  setTimeout(() => { el.copy.textContent = 'Copy'; }, 2500);
});

function clearResult() {
  el.output.textContent = '';
  el.copy.disabled = true;
  download.clear();
  result = null;
}

/* ----------------------------------------------------------------- wording */

const pickedDirection = () => document.querySelector('input[name="direction"]:checked').value;

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
run();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
