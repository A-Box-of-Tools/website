/** UI wiring and application state. */

import {
  compressDocument, describeSettings, PRESETS,
} from './compress.js';
import { takeInventory, verdict } from './inventory.js';
import { EncryptedPdfError, NotAPdfError, PdfDocument } from './reader.js';
import { wireFilePicker, readingLabel } from './shared/file-picker.js';
import {
  bytes as humanBytes, change, count, dimensions, dpi, outName, share,
} from './format.js';

const $ = (id) => document.getElementById(id);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  fileRow: $('file-row'),
  fileName: $('file-name'),
  fileFacts: $('file-facts'),
  clearFile: $('clear-file'),
  loadError: $('load-error'),
  loadNote: $('load-note'),
  inventoryCard: $('inventory-card'),
  verdict: $('verdict'),
  breakdownBar: $('breakdown-bar'),
  breakdownList: $('breakdown-list'),
  inventoryNotes: $('inventory-notes'),
  settingsCard: $('settings-card'),
  presets: $('presets'),
  dpiValue: $('dpi-value'),
  qualityValue: $('quality-value'),
  qualityOut: $('quality-out'),
  stripMeta: $('strip-meta'),
  settingsSummary: $('settings-summary'),
  runCard: $('run-card'),
  run: $('run'),
  cancel: $('cancel'),
  progress: $('progress'),
  progressBar: $('progress-bar'),
  progressLabel: $('progress-label'),
  runError: $('run-error'),
  result: $('result'),
  resultSize: $('result-size'),
  resultSub: $('result-sub'),
  download: $('download'),
  checkLine: $('check-line'),
  resultFacts: $('result-facts'),
  perImage: $('per-image'),
  imageList: $('image-list'),
  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
  networkCount: $('network-count'),
  networkDot: $('network-dot'),
  offlineStatus: $('offline-status'),
  offlineDot: $('offline-dot'),
};

/**
 * @typedef {object} Loaded
 * @property {File} file
 * @property {Uint8Array} bytes the whole file, read once and kept
 * @property {object} inventory what takeInventory found
 */

/** @type {Loaded|null} */
let loaded = null;
/** The object URL behind the download link, revoked when it is replaced. */
let downloadUrl = '';
let running = null;

/* ------------------------------------------------------------------ loading */

const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles(files) {
    load(files[0]);
  },
});

/**
 * Read a file, parse it, and show what is inside.
 *
 * The document parsed here is thrown away again. It exists only to fill in the
 * breakdown, and the run in step 4 starts from the file's bytes and parses
 * afresh - which costs a second pass and buys the guarantee that compressing
 * twice with different settings gives the same answer both times, rather than
 * compounding on a document the last run had already edited.
 */
async function load(file) {
  if (!file || running) return;

  reset();
  picker.busy(readingLabel(1));

  try {
    if (!looksLikePdf(file)) {
      throw new NotAPdfError('That is not a PDF. This tool only works on PDF files.');
    }

    const raw = new Uint8Array(await file.arrayBuffer());
    const doc = await PdfDocument.open(raw);
    const inventory = takeInventory(doc);

    loaded = { file, bytes: raw, inventory };

    el.fileName.textContent = file.name;
    el.fileFacts.textContent = `${humanBytes(raw.length)} · `
      + `${count(inventory.pages, 'page')}`;
    el.fileRow.hidden = false;

    renderInventory(inventory);
    el.inventoryCard.hidden = false;
    el.settingsCard.hidden = false;
    el.runCard.hidden = false;
    renderSettings();

    if (doc.repaired) {
      note('This file\'s cross-reference table did not match its contents, so it was '
        + 'read by scanning for objects instead. That is a repair, and it worked, but '
        + 'check the result before you send it anywhere.');
    } else if (doc.incremental) {
      note('This document has been edited and re-saved at least once, so it is carrying '
        + 'older copies of objects that nothing points at any more. Those are left out '
        + 'of the rewrite.');
    }
  } catch (error) {
    showLoadError(messageFor(error));
  } finally {
    picker.done();
  }
}

function looksLikePdf(file) {
  return file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
}

function messageFor(error) {
  if (error instanceof EncryptedPdfError || error instanceof NotAPdfError) {
    return error.message;
  }
  if (error?.name === 'AbortError') return 'Cancelled.';
  return `This PDF could not be read: ${error?.message ?? error}`;
}

function reset() {
  loaded = null;
  el.fileRow.hidden = true;
  el.inventoryCard.hidden = true;
  el.settingsCard.hidden = true;
  el.runCard.hidden = true;
  el.result.hidden = true;
  el.progress.hidden = true;
  el.loadError.hidden = true;
  el.loadNote.hidden = true;
  el.runError.hidden = true;
  releaseDownload();
}

function showLoadError(text) {
  el.loadError.textContent = text;
  el.loadError.hidden = false;
}

function note(text) {
  el.loadNote.textContent = text;
  el.loadNote.hidden = false;
}

el.clearFile.addEventListener('click', () => {
  reset();
  el.dropzone.focus();
});

/* --------------------------------------------------------------- inventory */

/**
 * The breakdown, as a bar and a list.
 *
 * Both, rather than one or the other: the bar is what makes "this is a scan"
 * legible at a glance, and the list is what makes it checkable, since a
 * coloured strip with no numbers beside it is a decoration.
 */
function renderInventory(inventory) {
  const said = verdict(inventory);
  el.verdict.textContent = said.text;
  el.verdict.className = `verdict ${said.tone}`;

  el.breakdownBar.replaceChildren();
  el.breakdownList.replaceChildren();

  for (const group of inventory.groups) {
    const slice = document.createElement('span');
    slice.className = `slice slice-${group.id}`;
    slice.style.flexGrow = String(group.bytes);
    slice.title = `${group.label}: ${humanBytes(group.bytes)}`;
    el.breakdownBar.append(slice);

    const row = document.createElement('li');
    const key = document.createElement('span');
    key.className = `key key-${group.id}`;
    const label = document.createElement('span');
    label.className = 'key-label';
    label.textContent = group.label;
    const size = document.createElement('span');
    size.className = 'key-size';
    size.textContent = `${humanBytes(group.bytes)} · ${share(group.bytes, inventory.total)}`;
    row.append(key, label, size);
    el.breakdownList.append(row);
  }

  el.inventoryNotes.textContent = notesFor(inventory);
}

/** The one or two sentences worth saying about this particular file. */
function notesFor(inventory) {
  const parts = [`${humanBytes(inventory.total)} across `
    + `${count(inventory.pages, 'page')}.`];

  const images = inventory.groups.find((group) => group.id === 'images');
  if (images) parts.push(`${count(images.count, 'image')} embedded.`);

  const orphans = inventory.groups.find((group) => group.id === 'orphans');
  if (orphans) {
    parts.push(`${humanBytes(orphans.bytes)} of it is no longer referenced by `
      + 'anything - left behind by an earlier edit - and will simply not be copied over.');
  }

  const fonts = inventory.groups.find((group) => group.id === 'fonts');
  if (fonts && fonts.bytes > inventory.total * 0.15) {
    parts.push('The embedded fonts are a large share of this file. They are kept '
      + 'whole: subsetting a font is how a document ends up missing characters '
      + 'when somebody else opens it.');
  }

  return parts.join(' ');
}

/* ---------------------------------------------------------------- settings */

el.presets.addEventListener('change', () => {
  const chosen = PRESETS[presetName()];
  if (!chosen) return;
  el.dpiValue.value = String(chosen.dpi);
  el.qualityValue.value = String(Math.round(chosen.quality * 100));
  renderSettings();
});

for (const input of [el.dpiValue, el.qualityValue]) {
  input.addEventListener('input', () => {
    // Typing a number by hand means none of the four named settings is what is
    // being asked for any more, so none of them should look selected.
    for (const radio of el.presets.querySelectorAll('input')) radio.checked = false;
    renderSettings();
  });
}

el.stripMeta.addEventListener('change', renderSettings);

function presetName() {
  return el.presets.querySelector('input:checked')?.value ?? '';
}

function settings() {
  return {
    dpi: Math.max(0, Math.min(1200, Number(el.dpiValue.value) || 0)),
    quality: Math.max(0.3, Math.min(0.95, (Number(el.qualityValue.value) || 68) / 100)),
    stripMeta: el.stripMeta.checked,
  };
}

function renderSettings() {
  const chosen = settings();
  el.qualityOut.textContent = String(Math.round(chosen.quality * 100));
  el.settingsSummary.textContent = describeSettings(chosen);
}

/* ----------------------------------------------------------------- running */

el.run.addEventListener('click', run);
el.cancel.addEventListener('click', () => running?.abort());

async function run() {
  if (!loaded || running) return;

  running = new AbortController();
  el.run.disabled = true;
  el.cancel.hidden = false;
  el.result.hidden = true;
  el.runError.hidden = true;
  el.progress.hidden = false;
  setProgress(0, 1, 'Reading the document');
  releaseDownload();

  let cancelled = false;

  try {
    const result = await compressDocument(loaded.bytes, settings(), {
      signal: running.signal,
      onStage: (stage) => setProgress(null, null, stage),
      onProgress: (done, total) => setProgress(done, total, null),
    });
    showResult(result);
  } catch (error) {
    if (error?.name === 'AbortError') {
      cancelled = true;
      el.progressLabel.textContent = 'Cancelled. Nothing was changed; press Compress to start again.';
    } else {
      el.runError.textContent = messageFor(error);
      el.runError.hidden = false;
    }
  } finally {
    running = null;
    el.run.disabled = false;
    el.cancel.hidden = true;
    // The bar stays up after a cancel, because it is carrying the only message
    // that says what happened. Hiding it would leave the page looking as
    // though the button had done nothing at all.
    el.progress.hidden = !cancelled;
    if (cancelled) el.progressBar.style.width = '0%';
  }
}

let stageText = '';

function setProgress(done, total, stage) {
  if (stage !== null && stage !== undefined) stageText = stage;
  if (done !== null && done !== undefined && total) {
    const percent = Math.round((done / Math.max(1, total)) * 100);
    el.progressBar.style.width = `${percent}%`;
  }
  el.progressLabel.textContent = `${stageText}...`;
}

/**
 * What the run produced.
 *
 * The download link is offered whether or not the file got smaller, and whether
 * or not it got smaller is said in the first line rather than buried. A run
 * that saved two per cent on a text document is not a failure of the tool; it
 * is the correct answer, and it was predicted on the screen above before the
 * button was pressed.
 */
function showResult(result) {
  const saved = result.before - result.after;

  el.resultSize.textContent = saved > 0
    ? `${humanBytes(result.before)} → ${humanBytes(result.after)}`
    : `${humanBytes(result.after)} - no smaller than it started`;
  el.resultSub.textContent = saved > 0
    ? `${change(result.before, result.after)}, ${humanBytes(saved)} saved.`
    : 'Everything in this file was already about as small as it goes. The original '
      + 'is the better file to keep.';

  el.checkLine.textContent = result.check.ok
    ? `Checked: ${result.check.text}`
    : `This run did not check out - ${result.check.text}. Keep your original.`;
  el.checkLine.className = `check-line ${result.check.ok ? 'good' : 'bad'}`;

  renderFacts(result);
  renderImages(result.images);

  downloadUrl = URL.createObjectURL(result.blob);
  el.download.href = downloadUrl;
  el.download.download = outName(loaded.file.name);
  // A file the tool has just said it does not trust should not be one click
  // away from being sent to somebody.
  el.download.hidden = !result.check.ok;

  el.result.hidden = false;
}

function renderFacts(result) {
  const touched = result.images.filter((image) => image.action !== 'kept');
  const shrunk = touched.filter((image) => image.action === 'downsampled');
  const facts = [];

  if (result.images.length === 0) {
    facts.push('No images in this document, so nothing was re-encoded. The saving '
      + 'is from repacking it and leaving out what nothing referred to.');
  } else {
    facts.push(`${count(touched.length, 'image')} of ${result.images.length} re-encoded`
      + `${shrunk.length ? `, ${shrunk.length} of them with fewer pixels` : ''}.`);
  }

  const kept = result.images.filter((image) => image.action === 'kept' && image.note);
  if (kept.length) {
    const reasons = new Map();
    for (const image of kept) reasons.set(image.note, (reasons.get(image.note) ?? 0) + 1);
    for (const [reason, howMany] of reasons) {
      facts.push(`${count(howMany, 'image')} left alone: ${reason}.`);
    }
  }

  if (result.metadataRemoved) {
    facts.push(`${count(result.metadataRemoved, 'entry', 'entries')} of `
      + 'application metadata removed.');
  }
  if (result.incremental) {
    facts.push('Older, superseded copies of objects from earlier edits were not copied over.');
  }
  if (result.repaired) {
    facts.push('The original\'s cross-reference table was broken and had to be rebuilt '
      + 'by scanning. Check this file before sending it on.');
  }

  el.resultFacts.replaceChildren(...facts.map((text) => {
    const row = document.createElement('li');
    row.textContent = text;
    return row;
  }));
}

/** The per-image list, which is the part that makes the summary checkable. */
function renderImages(images) {
  el.perImage.hidden = images.length === 0;
  if (!images.length) return;

  el.imageList.replaceChildren(...images.map((image) => {
    const row = document.createElement('li');

    const left = document.createElement('span');
    left.className = 'image-what';
    left.textContent = image.action === 'kept'
      ? `Kept: ${image.note}`
      : `${image.action === 'downsampled' ? 'Downsampled' : 'Recompressed'} to `
        + `${dimensions(image.width, image.height)}`
        + `${image.dpiAfter ? ` (${dpi(image.dpiAfter)})` : ''}`;

    const right = document.createElement('span');
    right.className = 'image-size';
    right.textContent = image.after < image.before
      ? `${humanBytes(image.before)} → ${humanBytes(image.after)}`
      : humanBytes(image.before);

    const was = document.createElement('span');
    was.className = 'image-was';
    was.textContent = image.dpiBefore ? `was ${dpi(image.dpiBefore)}` : '';

    row.append(left, was, right);
    return row;
  }));
}

function releaseDownload() {
  if (downloadUrl) URL.revokeObjectURL(downloadUrl);
  downloadUrl = '';
  el.download.removeAttribute('href');
}

/* ------------------------------------------------------------------- trust */

el.privacyToggle.addEventListener('click', () => {
  const open = el.privacyPanel.hidden;
  el.privacyPanel.hidden = !open;
  el.privacyToggle.setAttribute('aria-expanded', String(open));
});

// The hosts this page loads its own advertising, measurement and donate-button
// from. Like the ad scripts, they are something the page fetches without the
// visitor asking, and they are handed nothing - so they belong in this bucket
// rather than being reported as an intruder.
const PLATFORM_HOSTS = /(^|\.)(googlesyndication\.com|doubleclick\.net|googleadservices\.com|googletagservices\.com|adtrafficquality\.google|googletagmanager\.com|google-analytics\.com|gstatic\.com|googleapis\.com|buymeacoffee\.com|cloudflareinsights\.com|google\.[a-z]{2,3}(\.[a-z]{2})?)$/;

/**
 * Report what this page has actually fetched.
 *
 * The claim on trial is not "this page is silent" - it is not silent, it
 * carries ads - but "nothing has carried your document away".
 */
function monitorNetwork() {
  const platform = new Set();
  const unexplained = new Set();

  const inspect = (entries) => {
    for (const entry of entries) {
      if (entry.name.startsWith('blob:') || entry.name.startsWith('data:')) continue;
      const url = new URL(entry.name, location.href);
      if (url.origin === location.origin) continue;
      if (PLATFORM_HOSTS.test(url.hostname)) platform.add(url.hostname);
      else unexplained.add(url.hostname);
    }

    const total = performance.getEntriesByType('resource')
      .filter((e) => !e.name.startsWith('blob:') && !e.name.startsWith('data:')).length;

    const clean = unexplained.size === 0;
    const platformNote = platform.size === 0
      ? ''
      : ` The page's own ad, measurement and donate-button scripts loaded from ${platform.size} host${platform.size === 1 ? '' : 's'}; not one of them was given a document or a byte of one.`;

    el.networkCount.textContent = clean
      ? `your document has gone nowhere. ${total} files loaded, all of them this page's own.${platformNote}`
      : `something contacted ${[...unexplained].join(', ')}, which this tool never does. Treat that as worth investigating.${platformNote}`;

    el.networkCount.className = clean ? 'good' : 'warn';
    el.networkDot.className = `live-dot ${clean ? 'good' : 'warn'}`;
  };

  inspect(performance.getEntriesByType('resource'));
  try {
    new PerformanceObserver((list) => inspect(list.getEntries())).observe({ type: 'resource', buffered: true });
  } catch {
    // PerformanceObserver is unavailable; the one-time snapshot above still stands.
  }
}

async function registerServiceWorker() {
  const fail = (message, detail) => {
    el.offlineStatus.textContent = message;
    el.offlineDot.className = 'live-dot';
    if (detail) {
      el.offlineStatus.title = detail;
      console.info('Offline caching unavailable:', detail);
    }
  };

  if (!('serviceWorker' in navigator)) {
    fail('not available in this browser (everything else still works).');
    return;
  }
  if (!window.isSecureContext) {
    fail('needs https:// or localhost to cache for offline use.');
    return;
  }

  try {
    await navigator.serviceWorker.register('sw.js');
    await navigator.serviceWorker.ready;
    el.offlineStatus.textContent = 'ready - disconnect from the internet and this still works.';
    el.offlineStatus.className = 'good';
    el.offlineDot.className = 'live-dot good';
  } catch (error) {
    fail('caching unavailable here, but nothing is uploaded either way.', error.message);
  }
}

/* -------------------------------------------------------------------- boot */

// An error thrown after boot would otherwise only reach the console, leaving
// the page looking functional but doing nothing.
window.addEventListener('error', (event) => {
  showLoadError(`Something broke: ${event.message}. Reload the page to start over.`);
});
window.addEventListener('unhandledrejection', (event) => {
  showLoadError(`Something broke: ${event.reason?.message ?? event.reason}. Reload the page to start over.`);
});

renderSettings();
monitorNetwork();
registerServiceWorker();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
