/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
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
  networkCount: $('network-count'),
  networkDot: $('network-dot'),
  offlineStatus: $('offline-status'),
  offlineDot: $('offline-dot'),
};

/** The text of the last successful result, for the copy and download buttons. */
let result = null;
let downloadUrl = null;

/* --------------------------------------------------------------- the menu */

// Filled from the list the module exports, so a codec that exists is on the
// menu and one that does not cannot be.
for (const codec of CODECS) {
  el.codec.append(new Option(codec.name, codec.id));
}

/* ------------------------------------------------------------------- input */

const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles(files) { loadFiles(files); },
});

async function loadFiles(files) {
  picker.busy('Reading the file...');
  try {
    // Read as text, here, by the browser. There is no other step: the string
    // goes into the box below and never anywhere else.
    el.input.value = await files[0].text();
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
  el.input.value = SAMPLES.encode.a;
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
  el.codecNote.textContent = codecById(el.codec.value).note;

  const text = el.input.value;
  if (text.trim() === '') {
    el.resultNote.textContent = 'Nothing yet.';
    return;
  }

  try {
    runEncode(text);
  } catch (error) {
    // Bad input is the expected outcome of pasting something broken, and is
    // reported as information rather than as a failure. Anything else is a
    // bug here and goes to the console as well.
    showError(error?.message ?? String(error));
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
      throw new CodecError('Those bytes are not UTF-8 text, so there is nothing to show. '
        + 'They may be a file rather than a string.');
    }
    throw error;
  }
  show(out, `${codec.name}, ${decoding ? 'decoded' : 'encoded'} - `
    + `${humanBytes(byteLength(text))} in, ${humanBytes(byteLength(out))} out`,
    decoding ? 'decoded.txt' : 'encoded.txt');
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

updateCounts();
run();
monitorNetwork();
registerServiceWorker();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
