/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { wireFilePicker } from './shared/file-picker.js';
import { CONVERSIONS, conversionById } from './convert.js';
import { SAMPLES } from './samples.js';

const $ = (id) => document.getElementById(id);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  input: $('input'),
  inputLabel: $('input-label'),
  inputCount: $('input-count'),
  conversion: $('conversion'),
  conversionNote: $('conversion-note'),
  indent: $('indent'),
  sortKeys: $('sort-keys'),
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

/* ---------------------------------------------------------------- the menu */

// Filled from the list the module exports, so a direction that exists is on the
// menu and one that does not cannot be.
for (const conversion of CONVERSIONS) {
  el.conversion.append(new Option(phrase(conversion.name), conversion.id));
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
    // A dropped .json is almost never a request to read JSON as if it were
    // YAML, so the direction follows the file rather than leaving the reader
    // to notice that the menu was pointing the other way.
    const name = files[0].name.toLowerCase();
    if (name.endsWith('.json')) el.conversion.value = 'json-yaml';
    else if (name.endsWith('.yaml') || name.endsWith('.yml')) el.conversion.value = 'yaml-json';
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
  // is local either way; this is only about not re-converting a megabyte
  // between two keystrokes.
  const size = el.input.value.length;
  timer = setTimeout(run, size > 200000 ? 500 : 120);
}

el.input.addEventListener('input', () => { updateCounts(); schedule(); });

for (const control of [el.conversion, el.indent, el.sortKeys]) {
  control.addEventListener('change', run);
}

el.clear.addEventListener('click', () => {
  el.input.value = '';
  updateCounts();
  run();
  el.input.focus();
});

el.sample.addEventListener('click', () => {
  el.input.value = SAMPLES[el.conversion.value].a;
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
    const conversion = conversionById(el.conversion.value);
    const out = conversion.run(text, {
      indent: indentString(),
      spaces: el.indent.value === 'tab' ? 2 : Number(el.indent.value),
      sortKeys: el.sortKeys.checked,
    });
    show(out, phrase('note.converted', {
      name: phrase(conversion.name),
      lines: out.split('\n').length - 1,
      size: humanBytes(byteLength(out)),
    }), `converted.${conversion.output}`);
  } catch (error) {
    // A parse error is the expected outcome of pasting something broken, and
    // is reported as information rather than as a failure. Anything else is a
    // bug here and goes to the console as well.
    showError(say(error));
    if (error?.name !== 'ParseError') console.error(error);
  }
}

/**
 * The controls that only mean something in one direction.
 *
 * Sorting the keys and indenting with a tab are both questions about JSON, so
 * they are taken away rather than disabled when the answer is going the other
 * way: YAML has no sorted form worth offering and cannot be indented with a
 * tab at all, and a control that cannot do anything is worse company than one
 * that is not there. The label above the box moves for the same reason - it is
 * the only thing on screen that says which of the two you are meant to paste.
 */
function updateOptionVisibility() {
  const toJson = conversionById(el.conversion.value).output === 'json';
  el.sortKeys.closest('.field').hidden = !toJson;
  el.indent.querySelector('option[value="tab"]').hidden = !toJson;
  if (!toJson && el.indent.value === 'tab') el.indent.value = '2';
  el.conversionNote.textContent = phrase(conversionById(el.conversion.value).note);
  el.inputLabel.textContent = phrase(toJson ? 'label.yaml' : 'label.json');
  el.input.placeholder = phrase(toJson ? 'placeholder.yaml' : 'placeholder.json');
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

updateCounts();
run();
monitorNetwork();
registerServiceWorker();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
