/**
 * UI wiring and application state.
 *
 * The conversion itself is shared/js/image-convert.js, which the build copies
 * in at src/shared/. What is particular to this tool is the one decision on
 * the page - lossless or smaller - and the honesty around it.
 *
 * A canvas has no flag for lossless WebP. Chromium switches codings at quality
 * 1.0 exactly, which is how `encodeWebp` asks for one, but that is the
 * behaviour of an engine rather than a promise of the specification. So every
 * result is read back out of its own bytes and the row says which coding
 * actually came out. Somebody converting a screenshot to WebP because they
 * were told it would be identical deserves to be told when it was not.
 */

import { phrase, fill } from './shared/phrases.js';
import { messageBox } from './shared/message-box.js';
import { sizeText } from './shared/format.js';
import { wireFilePicker, readingLabel } from './shared/file-picker.js';
import { makeZip } from './shared/zip.js';
import { saveBlob } from './shared/download.js';
import {
  FORMATS, PNG, WEBP,
  canEncode, change, decode, encodeWebp, hasAlpha, outName, release, sniff, uniqueNames,
} from './shared/image-convert.js';
import { makeExample } from './example.js';

const $ = (id) => document.getElementById(id);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  fileList: $('file-list'),
  listToolbar: $('list-toolbar'),
  countLabel: $('count-label'),
  clearAll: $('clear-all'),
  loadError: $('load-error'),
  supportError: $('support-error'),
  settingsCard: $('settings-card'),
  qualityField: $('quality-field'),
  quality: $('quality'),
  qualityValue: $('quality-value'),
  settingsNote: $('settings-note'),
  runCard: $('run-card'),
  run: $('run'),
  progress: $('progress'),
  progressBar: $('progress-bar'),
  progressLabel: $('progress-label'),
  runError: $('run-error'),
  results: $('results'),
  resultList: $('result-list'),
  resultsSummary: $('results-summary'),
  downloadZip: $('download-zip'),
  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
};

const { show: showLoadError, clear: clearLoadError } = messageBox(el.loadError);
const { show: showRunError, clear: clearRunError } = messageBox(el.runError);
const { show: showSupportError } = messageBox(el.supportError);

/** A size through this page's own wording. */
const bytes = (n) => sizeText(n, phrase, { under: 'size.bytes', kb: 'auto' });

/** A phrase key for whatever the file turned out to be instead of a PNG. */
const FOUND = {
  'image/webp': 'found.webp',
  'image/jpeg': 'found.jpeg',
  'image/avif': 'found.avif',
  'image/gif': 'found.gif',
  'image/bmp': 'found.bmp',
};

/**
 * @typedef {object} Item
 * @property {number} id
 * @property {File} file
 * @property {number} width
 * @property {number} height
 * @property {boolean} alpha
 * @property {string} thumbUrl
 */

/** @type {Item[]} */
let items = [];
let nextId = 1;
let busy = false;

/** False once the one-pixel probe says this browser will not write WebP. */
let supported = true;

let results = [];
let resultUrls = [];

/* ------------------------------------------------------------------ adding */

const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles(files) {
    addFiles(files).catch((error) => showLoadError(phrase('error.broke', { detail: error.message })));
  },
  example: makeExample,
});

async function addFiles(files) {
  if (!files?.length || busy) return;

  picker.busy(readingLabel(files.length));
  const failures = [];

  try {
    for (const file of files) {
      // The first bytes decide, never the extension.
      const head = new Uint8Array(await file.slice(0, 64).arrayBuffer());
      const kind = sniff(head);

      if (kind !== PNG) {
        failures.push(kind
          ? phrase('read.notpng', { name: file.name, found: phrase(FOUND[kind] ?? kind) })
          : phrase('read.unknown', { name: file.name }));
        continue;
      }

      let decoded;
      try {
        decoded = await decode(file);
      } catch (error) {
        failures.push(phrase('read.failed', {
          name: file.name,
          why: phrase(error.message, fill(error.values)),
        }));
        continue;
      }

      // Read off the pixels rather than assumed from the format. Most PNGs
      // carry an alpha channel and a good half of them are opaque in it, and
      // "the transparency came across" is only worth saying about a file that
      // had some.
      const alpha = hasAlpha(decoded.bitmap, decoded.width, decoded.height);
      release(decoded.bitmap);

      items.push({
        id: nextId,
        file,
        width: decoded.width,
        height: decoded.height,
        alpha,
        thumbUrl: URL.createObjectURL(file),
      });
      nextId += 1;
    }
  } finally {
    picker.done();
  }

  if (failures.length) showLoadError(failures.join('\n'));
  else clearLoadError();

  clearResults();
  render();
}

function removeItem(id) {
  const item = items.find((one) => one.id === id);
  if (!item || busy) return;
  URL.revokeObjectURL(item.thumbUrl);
  items = items.filter((one) => one.id !== id);
  clearResults();
  render();
}

el.clearAll.addEventListener('click', () => {
  if (busy) return;
  for (const item of items) URL.revokeObjectURL(item.thumbUrl);
  items = [];
  clearResults();
  clearLoadError();
  render();
});

/* ------------------------------------------------------------- the settings */

const chosenMode = () => document.querySelector('input[name="mode"]:checked')?.value ?? 'lossless';

const settings = () => ({
  lossless: chosenMode() === 'lossless',
  quality: Number(el.quality.value) / 100,
});

/* --------------------------------------------------------------- rendering */

function render() {
  renderList();
  renderSettings();
  gate();
}

function renderList() {
  el.fileList.replaceChildren();
  el.listToolbar.hidden = items.length === 0;
  el.countLabel.textContent = items.length === 1
    ? phrase('chosen.one')
    : phrase('chosen.many', { count: items.length.toLocaleString() });
  el.clearAll.disabled = busy;

  for (const item of items) el.fileList.append(fileRow(item));
}

function fileRow(item) {
  const row = document.createElement('li');
  row.className = 'file-row';

  const wrap = document.createElement('div');
  wrap.className = 'file-main-wrap';

  const thumb = document.createElement('img');
  thumb.className = 'file-thumb';
  // The checkerboard behind a thumbnail is a claim that the file has
  // see-through parts, so it is only made about a file that has them.
  thumb.classList.toggle('see-through', item.alpha);
  thumb.src = item.thumbUrl;
  thumb.alt = '';

  const main = document.createElement('div');
  main.className = 'file-main';

  const name = document.createElement('p');
  name.className = 'file-name';
  name.textContent = item.file.name;

  const sub = document.createElement('p');
  sub.className = 'file-sub';
  sub.textContent = phrase('file.facts', {
    size: bytes(item.file.size),
    dimensions: phrase('dimensions', { width: item.width, height: item.height }),
  });

  main.append(name, sub);

  if (item.alpha) {
    const note = document.createElement('p');
    note.className = 'file-out';
    note.textContent = phrase('file.alpha');
    main.append(note);
  }

  wrap.append(thumb, main);

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'row-remove';
  remove.textContent = '×';
  const label = phrase('row.remove', { name: item.file.name });
  remove.title = label;
  remove.setAttribute('aria-label', label);
  remove.disabled = busy;
  remove.addEventListener('click', () => removeItem(item.id));

  row.append(wrap, remove);
  return row;
}

function renderSettings() {
  const set = settings();

  el.qualityField.hidden = set.lossless;
  el.qualityValue.textContent = el.quality.value;
  el.quality.disabled = busy;
  for (const radio of document.querySelectorAll('input[name="mode"]')) radio.disabled = busy;

  const count = items.length.toLocaleString();
  const quality = el.quality.value;

  if (!items.length) el.settingsNote.textContent = phrase('settings.none');
  else if (set.lossless) {
    el.settingsNote.textContent = items.length === 1
      ? phrase('settings.lossless')
      : phrase('settings.lossless.many', { count });
  } else {
    el.settingsNote.textContent = items.length === 1
      ? phrase('settings.lossy', { quality })
      : phrase('settings.lossy.many', { count, quality });
  }

  el.run.textContent = items.length > 1
    ? phrase('run.many', { count })
    : phrase('run.one');
  el.run.disabled = busy || items.length === 0 || !supported;
}

/**
 * Dim the settings and the run until there is a file to act on.
 *
 * See the same function in webp-to-jpg for why the picker's own `waiting()`
 * is the way back rather than a line written here.
 */
function gate() {
  if (items.length) picker.arrived();
  else picker.waiting();
}

/* ----------------------------------------------------------------- the run */

el.run.addEventListener('click', () => {
  runAll().catch((error) => {
    showRunError(phrase('run.failed', { detail: error.message }));
    busy = false;
    el.progress.hidden = true;
    render();
  });
});

async function runAll() {
  if (busy || !items.length || !supported) return;

  busy = true;
  clearRunError();
  clearResults();
  render();

  const set = settings();
  const names = uniqueNames(items.map((item) => outName(item.file.name, FORMATS[WEBP].ext)));

  el.progress.hidden = false;
  const made = [];

  for (const [index, item] of items.entries()) {
    setProgress(index / items.length, phrase('progress.each', { name: item.file.name }));
    // Yield so the line above is painted before the work starts.
    await new Promise((resolve) => setTimeout(resolve, 0));

    const decoded = await decode(item.file);
    try {
      // `lossless` comes back read out of the written bytes, not echoed from
      // what was asked for. That is the whole point of going through
      // encodeWebp rather than encode.
      const { blob, lossless } = await encodeWebp(decoded.bitmap, {
        width: decoded.width,
        height: decoded.height,
        lossless: set.lossless,
        quality: set.quality,
      });
      made.push({
        item, blob, lossless, asked: set.lossless, quality: el.quality.value, name: names[index],
      });
    } finally {
      release(decoded.bitmap);
    }
  }

  setProgress(1, phrase('progress.done'));
  busy = false;
  results = made;
  renderResults();
  render();
  el.progress.hidden = true;
}

function setProgress(fraction, label) {
  el.progressBar.style.width = `${Math.round(fraction * 100)}%`;
  el.progressLabel.textContent = label;
}

/* ------------------------------------------------------------- the results */

function renderResults() {
  el.resultList.replaceChildren();
  el.results.hidden = results.length === 0;
  if (!results.length) return;

  const after = results.reduce((sum, one) => sum + one.blob.size, 0);
  const before = results.reduce((sum, one) => sum + one.item.file.size, 0);

  if (results.length === 1) {
    const [one] = results;
    const delta = change(one.item.file.size, one.blob.size);
    el.resultsSummary.textContent = phrase('written.one', {
      name: one.name,
      size: bytes(one.blob.size),
      change: phrase(delta.key, fill(delta.values)),
    });
  } else {
    const delta = change(before, after);
    el.resultsSummary.textContent = phrase('written.many', {
      count: results.length.toLocaleString(),
      size: bytes(after),
      change: phrase(delta.key, fill(delta.values)),
    });
  }

  for (const one of results) el.resultList.append(resultRow(one));

  el.downloadZip.hidden = results.length < 2;
  el.downloadZip.onclick = () => zipAll();
}

function resultRow(one) {
  const li = document.createElement('li');
  li.className = 'result-row';

  const text = document.createElement('div');
  text.className = 'result-text';

  const name = document.createElement('p');
  name.className = 'result-name';
  name.textContent = one.name;

  const headline = document.createElement('p');
  headline.className = 'result-headline';
  const delta = change(one.item.file.size, one.blob.size);
  // Joined through a phrase rather than a template literal: the dash between
  // the two halves is punctuation a translator may want to change, and a
  // string built in here would be the one English fragment on the row.
  headline.textContent = phrase('result.headline', {
    size: bytes(one.blob.size),
    change: phrase(delta.key, fill(delta.values)),
  });

  const detail = document.createElement('p');
  detail.className = 'result-detail';
  detail.textContent = phrase('result.detail', {
    name: one.item.file.name,
    dimensions: phrase('dimensions', { width: one.item.width, height: one.item.height }),
    was: bytes(one.item.file.size),
  });

  text.append(name, headline, detail);

  // Which coding actually came out, read from the file rather than echoed
  // back. The third case - lossless asked for and not delivered - is the one
  // this reporting exists for, and on every browser tested it does not happen.
  //
  // "Lossless" is qualified for a file that has transparency in it, and the
  // distinction is real rather than lawyerly: a canvas stores colour
  // premultiplied by alpha, so the colour under a near-transparent pixel
  // cannot be recovered exactly whatever the encoder does. Solid pixels come
  // through bit for bit either way. See the README for the measurement.
  const coding = [];
  if (one.lossless) coding.push(phrase(one.item.alpha ? 'result.lossless.alpha' : 'result.lossless'));
  else if (one.asked) coding.push(phrase('result.askedlossless'));
  else coding.push(phrase('result.lossy', { quality: one.quality }));
  if (one.item.alpha) coding.push(phrase('result.alpha'));

  for (const line of coding) {
    const note = document.createElement('p');
    note.className = 'result-detail';
    note.textContent = line;
    text.append(note);
  }

  const actions = document.createElement('div');
  actions.className = 'result-actions';

  const download = document.createElement('a');
  download.className = 'primary as-button';
  download.textContent = phrase('result.download');
  download.href = urlFor(one.blob);
  download.download = one.name;
  actions.append(download);

  li.append(text, actions);
  return li;
}

async function zipAll() {
  const files = [];
  for (const one of results) {
    files.push({ name: one.name, data: new Uint8Array(await one.blob.arrayBuffer()) });
  }
  saveBlob(makeZip(files), 'converted-webp.zip');
}

function urlFor(blob) {
  const url = URL.createObjectURL(blob);
  resultUrls.push(url);
  return url;
}

function clearResults() {
  for (const url of resultUrls) URL.revokeObjectURL(url);
  resultUrls = [];
  results = [];
  el.results.hidden = true;
  el.resultList.replaceChildren();
  el.resultsSummary.textContent = '';
  // The button is hidden with the panel, but its handler would still hold
  // every blob from the last run in a closure nobody can reach.
  el.downloadZip.hidden = true;
  el.downloadZip.onclick = null;
}

/* ------------------------------------------------------------- the controls */

for (const radio of document.querySelectorAll('input[name="mode"]')) {
  radio.addEventListener('change', () => {
    clearResults();
    renderSettings();
  });
}

el.quality.addEventListener('input', () => {
  clearResults();
  renderSettings();
});

/* -------------------------------------------------- privacy panel + offline */

el.privacyToggle.addEventListener('click', () => {
  const open = el.privacyPanel.hidden;
  el.privacyPanel.hidden = !open;
  el.privacyToggle.setAttribute('aria-expanded', String(open));
});

/**
 * Find out whether this browser writes WebP at all, before anything is chosen.
 *
 * `toBlob` hands back a PNG rather than refusing, so the only way to know is to
 * encode a pixel and look at the type. A browser that fails this cannot be
 * worked around here - there is no encoder to fall back on - so the page says
 * so plainly instead of letting somebody convert a batch into PNGs named
 * ".webp".
 */
async function checkSupport() {
  supported = await canEncode(WEBP);
  if (supported) return;
  showSupportError(phrase('support.nowebp'));
  render();
}

/* -------------------------------------------------------------------- boot */

// An error thrown after boot would otherwise only reach the console, leaving
// the page looking functional but doing nothing.
window.addEventListener('error', (event) => {
  showLoadError(phrase('error.broke', { detail: event.message }));
});
window.addEventListener('unhandledrejection', (event) => {
  showLoadError(phrase('error.broke', { detail: event.reason?.message ?? event.reason }));
});

render();
checkSupport();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
