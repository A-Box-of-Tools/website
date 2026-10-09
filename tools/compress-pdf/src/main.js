/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { messageBox } from './shared/message-box.js';
import {
  compressDocument, describeSettings, PRESETS,
} from './compress.js';
import { takeInventory, verdict } from './inventory.js';
import { EncryptedPdfError, NotAPdfError, PdfDocument } from './shared/pdf-reader.js';
import { wireFilePicker, readingLabel } from './shared/file-picker.js';
import { makeExample } from './example.js';
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
  unlockHint: $('unlock-hint'),
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
};

const { show: showLoadError } = messageBox(el.loadError);
const { show: note } = messageBox(el.loadNote);

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
let loadGeneration = 0;

/* ------------------------------------------------------------------ loading */

const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles(files) {
    load(files[0]);
  },
  example: makeExample,
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
  if (!file) return;
  if (running) {
    // The shared picker wakes cards before handing files over. An ignored
    // replacement must leave the current export's settings locked.
    el.settingsCard.inert = true;
    return;
  }

  reset();
  const mine = loadGeneration;
  picker.busy(readingLabel(1));

  try {
    if (!looksLikePdf(file)) {
      throw new NotAPdfError('read.notpdf');
    }

    const raw = new Uint8Array(await file.arrayBuffer());
    if (mine !== loadGeneration) return;
    const doc = await PdfDocument.open(raw);
    if (mine !== loadGeneration) return;
    const inventory = takeInventory(doc);

    loaded = { file, bytes: raw, inventory };

    el.fileName.textContent = file.name;
    el.fileFacts.textContent = `${say(humanBytes(raw.length))} · `
      + `${say(count(inventory.pages, 'pages'))}`;
    el.fileRow.hidden = false;

    renderInventory(inventory);
    renderSettings();
    picker.arrived();

    if (doc.repaired) {
      note(phrase('note.repaired'));
    } else if (doc.incremental) {
      note(phrase('note.incremental'));
    }
  } catch (error) {
    if (mine !== loadGeneration) return;
    showLoadError(messageFor(error));
    sayWhereToUnlock(error instanceof EncryptedPdfError);
  } finally {
    if (mine === loadGeneration) picker.done();
  }
}


/**
 * A {key, values} pair from format.js, compress.js or inventory.js, as words.
 *
 * Those modules are copied byte for byte into fifteen languages, so what they
 * hand back names a phrase and fills its blanks; this is where it becomes a
 * sentence. A plain string passes through, which is what makes a size usable
 * inside another phrase.
 */
const say = (said) => (said && said.key ? phrase(said.key, said.values) : said ?? '');

function looksLikePdf(file) {
  return file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
}

/**
 * Say where a password can be taken off, when a password is what stopped the
 * file being read.
 *
 * Null-tolerant on purpose. The line is in this tool's body.html and in the
 * translations that have caught up with it; a locale that has not simply goes
 * on showing the refusal by itself, which is what every locale did before. A
 * missing line is a page with one sentence fewer, not a page with an exception
 * thrown on it.
 */
function sayWhereToUnlock(locked) {
  if (el.unlockHint) el.unlockHint.hidden = !locked;
}

function messageFor(error) {
  // All of them carry a phrase key rather than a sentence: the two below say
  // what kind of file it is, and the reader's own refusals go inside a
  // sentence that names the file. See shared/js/phrases.js.
  if (error instanceof EncryptedPdfError || error instanceof NotAPdfError) {
    return phrase(error.message);
  }
  if (error?.name === 'AbortError') return phrase('run.cancelled');
  return phrase('read.failed',
    { detail: phrase(error?.message ?? String(error), error?.values) });
}

function reset() {
  loadGeneration += 1;
  running?.abort();
  running = null;
  loaded = null;
  el.run.disabled = false;
  el.cancel.hidden = true;
  el.settingsCard.inert = false;
  picker.done();
  picker.waiting();
  sayWhereToUnlock(false);
  el.fileRow.hidden = true;
  el.result.hidden = true;
  el.progress.hidden = true;
  el.loadError.hidden = true;
  el.loadNote.hidden = true;
  el.runError.hidden = true;
  emptyInventory();
  releaseDownload();
}

/**
 * The inventory with no file behind it.
 *
 * This card is shown before a file is chosen now, so it has an empty state
 * for the first time and needs one on the way out as well: clearing the file
 * used to hide the card and the numbers went with it. Left alone, the last
 * document's page counts and byte shares sat there under a picker that had
 * been emptied, which is a strange thing to show anybody and a stranger one
 * on a tool whose promise is that the file goes no further than the page.
 *
 * The bar is hidden rather than left empty. It is a role="img" named by the
 * list beside it, so with the list empty it is a picture with no description
 * - which is what a screen reader is told, and what an accessibility scan
 * reports.
 */
function emptyInventory() {
  el.verdict.textContent = '';
  el.verdict.className = 'verdict';
  el.breakdownBar.replaceChildren();
  el.breakdownBar.hidden = true;
  el.breakdownList.replaceChildren();
  el.inventoryNotes.textContent = '';
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
  el.verdict.textContent = say(said.text);
  el.verdict.className = `verdict ${said.tone}`;

  el.breakdownBar.replaceChildren();
  el.breakdownBar.hidden = false;
  el.breakdownList.replaceChildren();

  for (const group of inventory.groups) {
    const slice = document.createElement('span');
    slice.className = `slice slice-${group.id}`;
    slice.style.flexGrow = String(group.bytes);
    slice.title = `${phrase(group.label)}: ${say(humanBytes(group.bytes))}`;
    el.breakdownBar.append(slice);

    const row = document.createElement('li');
    const key = document.createElement('span');
    key.className = `key key-${group.id}`;
    const label = document.createElement('span');
    label.className = 'key-label';
    label.textContent = phrase(group.label);
    const size = document.createElement('span');
    size.className = 'key-size';
    size.textContent = `${say(humanBytes(group.bytes))} · ${share(group.bytes, inventory.total)}`;
    row.append(key, label, size);
    el.breakdownList.append(row);
  }

  el.inventoryNotes.textContent = notesFor(inventory);
}

/** The one or two sentences worth saying about this particular file. */
function notesFor(inventory) {
  const parts = [phrase('inv.size', {
    size: say(humanBytes(inventory.total)),
    pages: say(count(inventory.pages, 'pages')),
  })];

  const images = inventory.groups.find((group) => group.id === 'images');
  if (images) parts.push(phrase('inv.images', { images: say(count(images.count, 'images')) }));

  const orphans = inventory.groups.find((group) => group.id === 'orphans');
  if (orphans) {
    parts.push(phrase('inv.orphans', { size: say(humanBytes(orphans.bytes)) }));
  }

  const fonts = inventory.groups.find((group) => group.id === 'fonts');
  if (fonts && fonts.bytes > inventory.total * 0.15) {
    parts.push(phrase('inv.fonts'));
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
  el.settingsSummary.textContent = say(describeSettings(chosen));
}

/* ----------------------------------------------------------------- running */

el.run.addEventListener('click', run);
el.cancel.addEventListener('click', () => running?.abort());

async function run() {
  if (!loaded || running) return;

  const input = loaded;
  const chosen = settings();
  const controller = new AbortController();
  running = controller;
  el.settingsCard.inert = true;
  el.run.disabled = true;
  el.cancel.hidden = false;
  el.result.hidden = true;
  el.runError.hidden = true;
  el.progress.hidden = false;
  setProgress(0, 1, phrase('stage.reading'));
  releaseDownload();

  let cancelled = false;

  try {
    const result = await compressDocument(input.bytes, chosen, {
      signal: controller.signal,
      onStage: (stage) => {
        if (running === controller) setProgress(null, null, phrase(stage));
      },
      onProgress: (done, total) => {
        if (running === controller) setProgress(done, total, null);
      },
    });
    if (running !== controller) return;
    controller.signal.throwIfAborted();
    showResult(result, input);
  } catch (error) {
    if (running !== controller) return;
    if (error?.name === 'AbortError') {
      cancelled = true;
      el.progressLabel.textContent = phrase('run.cancelledfull');
    } else {
      el.runError.textContent = messageFor(error);
      el.runError.hidden = false;
    }
  } finally {
    // Choose another retires this owner immediately, so its delayed cleanup
    // cannot hide progress or unlock the controls of a replacement export.
    if (running === controller) {
      running = null;
      el.settingsCard.inert = false;
      el.run.disabled = false;
      el.cancel.hidden = true;
      // Keep the only explanation of a cancelled run visible.
      el.progress.hidden = !cancelled;
      if (cancelled) el.progressBar.style.width = '0%';
    }
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
function showResult(result, input) {
  const saved = result.before - result.after;

  el.resultSize.textContent = saved > 0
    ? `${say(humanBytes(result.before))} → ${say(humanBytes(result.after))}`
    : phrase('result.nosmaller', { size: say(humanBytes(result.after)) });
  el.resultSub.textContent = saved > 0
    ? phrase('result.saved', {
      change: say(change(result.before, result.after)),
      size: say(humanBytes(saved)),
    })
    : phrase('result.alreadysmall');

  el.checkLine.textContent = phrase(result.check.ok ? 'check.passed' : 'check.failed', {
    found: say(result.check.text),
  });
  el.checkLine.className = `check-line ${result.check.ok ? 'good' : 'bad'}`;

  renderFacts(result);
  renderImages(result.images);

  downloadUrl = URL.createObjectURL(result.blob);
  el.download.href = downloadUrl;
  el.download.download = outName(input.file.name);
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
    facts.push(phrase('facts.noimages'));
  } else {
    facts.push(phrase(shrunk.length ? 'facts.reencoded.shrunk' : 'facts.reencoded', {
      touched: touched.length,
      total: result.images.length,
      shrunk: shrunk.length,
    }));
  }

  if (touched.length) facts.push(phrase('facts.inspect'));

  const kept = result.images.filter((image) => image.action === 'kept' && image.note);
  if (kept.length) {
    const reasons = new Map();
    for (const image of kept) reasons.set(image.note, (reasons.get(image.note) ?? 0) + 1);
    for (const [reason, howMany] of reasons) {
      facts.push(phrase('facts.kept', {
        images: say(count(howMany, 'images')),
        reason: phrase(reason),
      }));
    }
  }

  if (result.metadataRemoved) {
    facts.push(phrase('facts.metadata', {
      entries: say(count(result.metadataRemoved, 'entries')),
    }));
  }
  if (result.incremental) {
    facts.push(phrase('facts.incremental'));
  }
  if (result.repaired) {
    facts.push(phrase('facts.repaired'));
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
    const size = dimensions(image.width, image.height);
    left.textContent = image.action === 'kept'
      ? phrase('row.kept', { why: phrase(image.note) })
      : phrase(`row.${image.action}${image.dpiAfter ? '.dpi' : ''}`, {
        size,
        dpi: dpi(image.dpiAfter),
      });

    const right = document.createElement('span');
    right.className = 'image-size';
    right.textContent = image.after < image.before
      ? `${say(humanBytes(image.before))} → ${say(humanBytes(image.after))}`
      : say(humanBytes(image.before));

    const was = document.createElement('span');
    was.className = 'image-was';
    was.textContent = image.dpiBefore ? phrase('row.was', { dpi: dpi(image.dpiBefore) }) : '';

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

/* -------------------------------------------------------------------- boot */

// An error thrown after boot would otherwise only reach the console, leaving
// the page looking functional but doing nothing.
window.addEventListener('error', (event) => {
  showLoadError(phrase('error.broke', { detail: event.message }));
});
window.addEventListener('unhandledrejection', (event) => {
  showLoadError(phrase('error.broke', { detail: event.reason?.message ?? event.reason }));
});

renderSettings();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
