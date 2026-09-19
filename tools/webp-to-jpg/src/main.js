/**
 * UI wiring and application state.
 *
 * The conversion itself is shared/js/image-convert.js, which the build copies
 * in at src/shared/. What is particular to this tool, and what this file is
 * mostly about, is the two things a WebP can do that a JPEG cannot: hold
 * transparency, and hold more than one frame. Both are read off the file
 * before anything is converted, and both are reported rather than silently
 * resolved - a picture that loses its transparent background to black, or an
 * animation that arrives as a single frame with no explanation, is the sort of
 * result that reads as a broken tool.
 */

import { phrase, fill } from './shared/phrases.js';
import { messageBox } from './shared/message-box.js';
import { sizeText } from './shared/format.js';
import { wireFilePicker, readingLabel } from './shared/file-picker.js';
import { makeZip } from './shared/zip.js';
import { saveBlob } from './shared/download.js';
import {
  FORMATS, JPEG, WEBP,
  change, decode, encode, hasAlpha, outName, release, sniff, uniqueNames, webpFacts,
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
  quality: $('quality'),
  qualityValue: $('quality-value'),
  backgroundRow: $('background-row'),
  background: $('background'),
  backgroundNote: $('background-note'),
  settingsNote: $('settings-note'),
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

/** A size through this page's own wording. */
const bytes = (n) => sizeText(n, phrase, { under: 'size.bytes', kb: 'auto' });

/** A phrase key for whatever the file turned out to be instead of a WebP. */
const FOUND = {
  'image/png': 'found.png',
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
 * @property {boolean} alpha     read off the decoded pixels, not the container
 * @property {boolean} animated
 * @property {boolean} lossless
 * @property {string} thumbUrl
 */

/** @type {Item[]} */
let items = [];
let nextId = 1;
let busy = false;

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
      // The first bytes decide, never the extension: a WebP saved as ".jpg"
      // is one of the commonest reasons somebody is on this page.
      const head = new Uint8Array(await file.slice(0, 64).arrayBuffer());
      const kind = sniff(head);

      if (kind !== WEBP) {
        failures.push(kind
          ? phrase('read.notwebp', { name: file.name, found: phrase(FOUND[kind] ?? kind) })
          : phrase('read.unknown', { name: file.name }));
        continue;
      }

      const facts = webpFacts(new Uint8Array(await file.arrayBuffer()));

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

      // Whether there is really anything see-through is a question about the
      // pixels rather than the container: a WebP can carry an alpha channel
      // that is opaque from corner to corner, and offering a background
      // colour for one is a control that does nothing.
      const alpha = facts.alpha && hasAlpha(decoded.bitmap, decoded.width, decoded.height);
      release(decoded.bitmap);

      items.push({
        id: nextId,
        file,
        width: decoded.width,
        height: decoded.height,
        alpha,
        animated: facts.animated,
        lossless: facts.lossless,
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

/* --------------------------------------------------------------- the settings */

const settings = () => ({
  mime: JPEG,
  quality: Number(el.quality.value) / 100,
  // A JPEG has no alpha channel, so a colour goes behind the picture whether
  // one was asked for or not. What the field changes is which colour, never
  // whether there is one.
  background: el.background.value,
});

const anyAlpha = () => items.some((item) => item.alpha);

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

  // The three things worth knowing before the conversion, and only when they
  // are true. A row that says "Lossy WebP" about every file is a row nobody
  // reads by the third one.
  const notes = [];
  if (item.lossless) notes.push(phrase('file.lossless'));
  if (item.alpha) notes.push(phrase('file.alpha'));
  if (item.animated) notes.push(phrase('file.animated'));

  for (const text of notes) {
    const note = document.createElement('p');
    note.className = 'file-out';
    note.textContent = text;
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
  el.qualityValue.textContent = el.quality.value;
  el.quality.disabled = busy;
  el.background.disabled = busy;

  const alpha = anyAlpha();
  el.backgroundRow.hidden = !alpha;
  el.backgroundNote.textContent = phrase(alpha ? 'background.some' : 'background.none');

  const quality = el.quality.value;
  if (!items.length) el.settingsNote.textContent = phrase('settings.none');
  else if (items.length === 1) el.settingsNote.textContent = phrase('settings.one', { quality });
  else {
    el.settingsNote.textContent = phrase('settings.many', {
      count: items.length.toLocaleString(),
      quality,
    });
  }

  el.run.textContent = items.length > 1
    ? phrase('run.many', { count: items.length.toLocaleString() })
    : phrase('run.one');
  el.run.disabled = busy || items.length === 0;
}

/**
 * Dim the settings and the run until there is a file to act on.
 *
 * The picker wakes every inert card the moment files are handed over, which is
 * too eager here: a batch of files that were all refused for not being WebP
 * leaves the list empty behind a live "Convert" button. `waiting()` is the
 * picker's own way back, and it restores the frame's sentence with it, so the
 * wording stays the one every other tool uses.
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
  if (busy || !items.length) return;

  busy = true;
  clearRunError();
  clearResults();
  render();

  const set = settings();
  const names = uniqueNames(items.map((item) => outName(item.file.name, FORMATS[set.mime].ext)));

  el.progress.hidden = false;
  const made = [];

  for (const [index, item] of items.entries()) {
    setProgress(index / items.length, phrase('progress.each', { name: item.file.name }));
    // Yield so the line above is painted before the work starts.
    await new Promise((resolve) => setTimeout(resolve, 0));

    const decoded = await decode(item.file);
    try {
      const blob = await encode(decoded.bitmap, {
        width: decoded.width,
        height: decoded.height,
        mime: set.mime,
        quality: set.quality,
        background: set.background,
      });
      made.push({ item, blob, name: names[index] });
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

  const total = results.reduce((sum, one) => sum + one.blob.size, 0);

  if (results.length === 1) {
    const [one] = results;
    const delta = change(one.item.file.size, one.blob.size);
    el.resultsSummary.textContent = phrase('written.one', {
      name: one.name,
      size: bytes(one.blob.size),
      change: phrase(delta.key, fill(delta.values)),
    });
  } else {
    el.resultsSummary.textContent = phrase('written.many', {
      count: results.length.toLocaleString(),
      size: bytes(total),
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

  // What happened to this file that would otherwise be a surprise. Said per
  // file rather than once at the top, because in a batch it is usually true
  // of some of them and not others.
  for (const extra of [
    one.item.alpha ? phrase('result.flattened', { colour: el.background.value }) : null,
    one.item.animated ? phrase('result.firstframe') : null,
  ].filter(Boolean)) {
    const note = document.createElement('p');
    note.className = 'result-detail';
    note.textContent = extra;
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
  saveBlob(makeZip(files), 'converted-jpg.zip');
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

el.quality.addEventListener('input', () => {
  clearResults();
  renderSettings();
});

el.background.addEventListener('input', () => {
  clearResults();
  renderSettings();
});

/* -------------------------------------------------- privacy panel + offline */

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

render();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
