/**
 * UI wiring and application state.
 *
 * The shape of this file follows from what a watermark is for: words laid
 * over every page so that a copy says who it was for. So the words come
 * first and the last card waits on them, the preview redraws on every
 * keystroke so the visitor sees their own words where the file will put
 * them, and the finished file is opened again here and every page checked
 * for the stamp before a download is offered.
 *
 * The preview and the file share one piece of arithmetic - stamp.js - and
 * that is deliberate: this site has no PDF renderer, so the preview cannot
 * show the visitor's page, and what it shows instead has to be exactly what
 * the file will get or it is worth nothing.
 */

import { ltr, phrase } from './shared/phrases.js';
import { messageBox } from './shared/message-box.js';
import { wireFilePicker, readingLabel } from './shared/file-picker.js';
import { sizeText } from './shared/format.js';
import { decodeStream } from './shared/pdf-filters.js';
import { EncryptedPdfError, NotAPdfError, PdfDocument } from './shared/pdf-reader.js';
import { readPages } from './shared/pdf-pages.js';
import { writeDocument } from './shared/pdf-writer.js';
import { carriesStamp, stampDocument } from './apply.js';
import { COLOURS, renderStamp } from './render.js';
import { placements, visibleSize } from './stamp.js';
import { outName, pages } from './format.js';
import { makeExample } from './example.js';

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
  words: $('words'),
  chips: document.querySelectorAll('.chip'),
  opacity: $('opacity'),
  opacityValue: $('opacity-value'),
  firstOnly: $('first-only'),
  preview: $('preview'),
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
  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
};

/** A4 portrait, in points: the page the preview shows before there is a
 *  document, so that the controls have something to act on from the start. */
const A4 = [0, 0, 595.28, 841.89];

const { show: showLoadError } = messageBox(el.loadError);
const { show: note } = messageBox(el.loadNote);

/**
 * @typedef {object} Loaded
 * @property {File} file
 * @property {Uint8Array} bytes the whole file, read once and kept
 * @property {import('./shared/pdf-reader.js').PdfDocument} doc
 * @property {ReturnType<typeof readPages>} pages
 */

/** @type {Loaded|null} */
let loaded = null;
/** The object URL behind the download link, revoked when it is replaced. */
let downloadUrl = '';
let running = null;

/** What the chips currently say. */
const choice = { size: 'medium', diagonal: true, tiled: false, colour: 'grey' };

/* ------------------------------------------------------------------ loading */

const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles(files) {
    load(files[0]);
  },
  example: makeExample,
});

async function load(file) {
  if (!file || running) return;

  reset();
  picker.busy(readingLabel(1));

  try {
    if (!looksLikePdf(file)) throw new NotAPdfError('read.notpdf');

    const bytes = new Uint8Array(await file.arrayBuffer());
    el.fileName.textContent = file.name;
    el.fileFacts.textContent = size(bytes.length);
    el.fileRow.hidden = false;

    const doc = await PdfDocument.open(bytes);
    const found = readPages(doc);
    if (found.length === 0) throw new Error('read.nopages');
    loaded = { file, bytes, doc, pages: found };

    if (doc.repaired) note(phrase('note.repaired'));
    else if (doc.incremental) note(phrase('note.incremental'));
    else {
      note(phrase(found.length === 1 ? 'note.pages.one' : 'note.pages.many',
        { n: found.length, size: plainSize(bytes.length) }));
    }

    refresh();
  } catch (error) {
    if (error instanceof EncryptedPdfError) {
      // Not an error line: the hint says what to do, and the file row stays
      // so that it is clear which file it is talking about.
      el.unlockHint.hidden = false;
    } else {
      showLoadError(messageFor(error));
    }
    picker.waiting();
  } finally {
    picker.done();
  }
}

/* ----------------------------------------------------------- the settings */

el.words.addEventListener('input', refresh);
el.opacity.addEventListener('input', refresh);
el.firstOnly.addEventListener('change', refresh);

for (const chip of el.chips) {
  chip.addEventListener('click', () => {
    const { size, diagonal, tiled, colour } = chip.dataset;
    if (size) choice.size = size;
    if (diagonal) choice.diagonal = diagonal === 'yes';
    if (tiled) choice.tiled = tiled === 'yes';
    if (colour) choice.colour = colour;
    // One pressed chip per row, and the row is the chips' parent.
    for (const other of chip.parentElement.querySelectorAll('.chip')) {
      other.setAttribute('aria-pressed', String(other === chip));
    }
    refresh();
  });
}

/** What the controls say, in the form apply.js takes. */
function settings() {
  return {
    size: choice.size,
    diagonal: choice.diagonal,
    tiled: choice.tiled,
    opacity: Number(el.opacity.value) / 100,
    firstPageOnly: el.firstOnly.checked,
  };
}

/**
 * Redraw the preview and wake or dim the last card.
 *
 * Called on every keystroke and every click, and cheap enough to be: the
 * preview is one small canvas, and the stamp on it is drawn with the
 * browser's own text call rather than through render.js, which would draw
 * a 2400-pixel picture to scale it down again.
 */
function refresh() {
  el.opacityValue.textContent = el.opacity.value;
  drawPreview();
  gate(Boolean(loaded) && el.words.value.trim().length > 0);
}

/**
 * The preview: a blank sheet the shape of the first page, and the stamp on
 * it where the file will put it.
 *
 * The placements come from stamp.js, the same call the writer makes, with
 * the stamp's aspect ratio measured from the words in the same bold face
 * render.js draws them in. What is drawn is text rotated and scaled to each
 * placement's rectangle, which is what the picture in the file is.
 */
function drawPreview() {
  const first = loaded?.pages[0];
  const box = first ? first.box : A4;
  const rotate = first ? first.rotate : 0;
  const visible = visibleSize(rotate, box);

  // Pixels per point: the sheet is drawn at up to 640 pixels across its
  // longer side, sharp on a high-density screen, and CSS scales it down.
  const scale = 640 / Math.max(visible.width, visible.height);
  const width = Math.round(visible.width * scale);
  const height = Math.round(visible.height * scale);
  el.preview.width = width;
  el.preview.height = height;

  const ctx = el.preview.getContext('2d');
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, width - 1, height - 1);

  const words = el.words.value.trim() || el.words.placeholder;
  const family = 'system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif';
  ctx.font = `bold 100px ${family}`;
  const measured = ctx.measureText(words);
  const ascent = measured.actualBoundingBoxAscent || 80;
  const descent = measured.actualBoundingBoxDescent || 20;
  // The same padding render.js leaves round the words, so the rectangle the
  // preview fills and the picture the file carries have the same shape.
  const padded = { width: measured.width * 1.3, height: (ascent + descent) * 1.3 };
  const aspect = padded.width / Math.max(padded.height, 1);

  const colour = COLOURS[choice.colour] ?? COLOURS.grey;
  ctx.fillStyle = `rgb(${colour.r} ${colour.g} ${colour.b})`;
  ctx.globalAlpha = el.words.value.trim() ? Number(el.opacity.value) / 100 : 0.15;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  for (const spot of placements(visible, aspect, settings())) {
    ctx.save();
    // Canvas y runs down and the page's runs up, so the centre flips and the
    // angle turns the other way.
    ctx.translate(spot.cx * scale, (visible.height - spot.cy) * scale);
    ctx.rotate((-spot.angle * Math.PI) / 180);
    const fontSize = (spot.height * scale) / (padded.height / 100);
    ctx.font = `bold ${fontSize}px ${family}`;
    const baseline = (fontSize / 100) * ((ascent + descent) / 2 - descent);
    ctx.fillText(words, 0, baseline);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

/**
 * Dim the last card until there is something to do, and say why.
 *
 * The picker wakes every inert card the moment a file arrives, which is
 * early for this one: there may be no words yet. So this card is managed
 * here, with the same line the frame draws and a sentence of this tool's
 * own. It is the only card that waits.
 */
function gate(ready) {
  const line = el.runCard.querySelector('.card-waiting');
  if (ready) {
    el.runCard.removeAttribute('inert');
    line?.remove();
    return;
  }
  el.runCard.setAttribute('inert', '');
  if (!line) {
    const waiting = document.createElement('p');
    waiting.className = 'card-waiting';
    waiting.textContent = phrase('waiting.words');
    el.runCard.querySelector('h2').after(waiting);
  }
}

/* ----------------------------------------------------------------- running */

el.run.addEventListener('click', run);
el.cancel.addEventListener('click', () => running?.abort());
el.clearFile.addEventListener('click', () => {
  reset();
  picker.waiting();
});

async function run() {
  const words = el.words.value.trim();
  if (!loaded || !words || running) return;

  running = new AbortController();
  el.run.disabled = true;
  el.cancel.hidden = false;
  el.result.hidden = true;
  el.runError.hidden = true;
  el.progress.hidden = false;
  setProgress(0, 1, phrase('stage.drawing'));
  releaseDownload();

  let cancelled = false;

  try {
    const chosen = settings();
    const image = renderStamp(words, COLOURS[choice.colour] ?? COLOURS.grey);

    // The document is stamped in place and written; a second run on the
    // same file would stamp it twice, so it is reopened from the bytes.
    const doc = await PdfDocument.open(loaded.bytes);
    const signed = hasSignature(doc);
    const done = stampDocument(doc, image, chosen);

    setProgress(0, 1, phrase('stage.writing'));
    const blob = await writeDocument(doc, {
      signal: running.signal,
      onProgress: (count, total) => setProgress(count, total, null),
    });

    setProgress(1, 1, phrase('stage.checking'));
    const check = await verify(blob, chosen, loaded.pages.length);

    showResult({ blob, check, chosen, done, words, signed });
  } catch (error) {
    if (error?.name === 'AbortError') {
      cancelled = true;
      el.progressLabel.textContent = phrase('run.cancelled');
    } else {
      el.runError.textContent = messageFor(error);
      el.runError.hidden = false;
    }
  } finally {
    running = null;
    el.run.disabled = false;
    el.cancel.hidden = true;
    el.progress.hidden = !cancelled;
    if (cancelled) el.progressBar.style.width = '0%';
  }
}

/**
 * Open the finished file again, here, and look for the stamp on every page.
 *
 * This is the claim the page makes, checked rather than asserted: the same
 * reader every PDF tool on this site uses opens the bytes, and each page
 * that should carry the stamp has to name it in its resources and end with
 * the instruction that draws it.
 */
async function verify(blob, chosen, expected) {
  let again;
  try {
    again = await PdfDocument.open(new Uint8Array(await blob.arrayBuffer()));
  } catch (error) {
    return { ok: false, text: { key: 'check.reopen', values: { detail: messageFor(error) } } };
  }

  const found = readPages(again);
  if (found.length !== expected) {
    return { ok: false, text: { key: 'check.pages', values: { pages: found.length, expected } } };
  }

  const decode = async (stream) => {
    const { bytes } = await decodeStream(stream, (v) => again.resolve(v));
    let text = '';
    for (let i = 0; i < bytes.length; i += 1) text += String.fromCharCode(bytes[i]);
    return text;
  };
  const wanted = chosen.firstPageOnly ? found.slice(0, 1) : found;
  for (let i = 0; i < wanted.length; i += 1) {
    if (!(await carriesStamp(again, wanted[i], decode))) {
      return { ok: false, text: { key: 'check.missing', values: { n: i + 1 } } };
    }
  }

  let key = 'check.ok.all';
  if (found.length === 1) key = 'check.ok.single';
  else if (chosen.firstPageOnly) key = 'check.ok.first';
  return { ok: true, text: { key, values: { pages: say(pages(found.length)) } } };
}

function showResult({ blob, check, chosen, done, words, signed }) {
  el.resultSize.textContent = phrase('result.ready', { size: size(blob.size) });
  el.resultSub.textContent = phrase('result.sub');

  el.checkLine.textContent = phrase(check.ok ? 'check.passed' : 'check.failed',
    { found: say(check.text) });
  el.checkLine.className = `check-line ${check.ok ? 'good' : 'bad'}`;

  renderFacts({ chosen, done, words, signed });

  downloadUrl = URL.createObjectURL(blob);
  el.download.href = downloadUrl;
  el.download.download = outName(loaded.file.name);
  // A file the tool has just said it does not trust should not be one click
  // away from being sent to somebody.
  el.download.hidden = !check.ok;

  el.result.hidden = false;
}

function renderFacts({ chosen, done, words, signed }) {
  const { doc } = loaded;
  const facts = [];

  facts.push(phrase('facts.words', { words }));

  const values = {
    size: phrase(`size.${chosen.size}`),
    angle: phrase(chosen.diagonal ? 'angle.diagonal' : 'angle.flat'),
    opacity: Math.round(chosen.opacity * 100),
    n: done.pages ? Math.round(done.stamps / done.pages) : 0,
  };
  facts.push(phrase(chosen.tiled ? 'facts.placement.tiled' : 'facts.placement.once', values));

  if (chosen.firstPageOnly && loaded.pages.length > 1) {
    facts.push(phrase('facts.firstonly', { n: loaded.pages.length - 1 }));
  }
  facts.push(phrase('facts.picture'));
  if (signed) facts.push(phrase('facts.signature'));
  if (doc.incremental) facts.push(phrase('facts.incremental'));
  if (doc.repaired) facts.push(phrase('facts.repaired'));

  el.resultFacts.replaceChildren(...facts.map((text) => {
    const row = document.createElement('li');
    row.textContent = text;
    return row;
  }));
}

/**
 * Was this document signed?
 *
 * Worth saying, because a signature cannot survive what this tool does and the
 * visitor should hear that from the page rather than from whoever they send
 * the file to. The catalogue's /AcroForm carries the flag, and a signature
 * field is a widget whose /FT is /Sig; either is enough to warn on.
 */
function hasSignature(doc) {
  const form = doc.get(doc.catalog, 'AcroForm');
  if (form instanceof Map && doc.get(form, 'SigFlags')) return true;

  for (const value of doc.objects.values()) {
    const dict = value instanceof Map ? value : null;
    if (dict && dict.get('FT')?.value === 'Sig') return true;
  }
  return false;
}

/* ------------------------------------------------------------------ scraps */

/**
 * A size, marked as reading left to right.
 *
 * Measured in a browser rather than reasoned about: on an Arabic page a bare
 * "3.7 KB" lands as "KB 3.7", and inside a sentence it is worse - the number
 * walks to the far end of the line. `plainSize` is the same thing without
 * the isolate, for the one place that composes a size with something else.
 */
const plainSize = (n) => sizeText(n, phrase, { under: 'size.bytes', kb: 'auto' });
const size = (n) => ltr(plainSize(n));

/** A {key, values} pair from format.js, as words. A plain string passes
 *  through. */
const say = (said) => (said && said.key ? phrase(said.key, said.values) : said ?? '');

function looksLikePdf(file) {
  return file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
}

function messageFor(error) {
  // Every one of them carries a phrase key rather than a sentence. The ones
  // that name a kind of file are shown on their own; anything else goes
  // inside a sentence saying the document could not be read.
  if (error instanceof NotAPdfError || error?.message === 'read.nopages') {
    return phrase(error.message, error.values);
  }
  if (error?.name === 'AbortError') return phrase('run.cancelled');
  return phrase('read.failed',
    { detail: phrase(error?.message ?? String(error), error?.values) });
}

let stageText = '';

function setProgress(done, total, stage) {
  if (stage !== null && stage !== undefined) stageText = stage;
  if (done !== null && done !== undefined && total) {
    el.progressBar.style.width = `${Math.round((done / Math.max(1, total)) * 100)}%`;
  }
  el.progressLabel.textContent = `${stageText}...`;
}

function reset() {
  loaded = null;
  el.fileRow.hidden = true;
  el.result.hidden = true;
  el.progress.hidden = true;
  el.loadError.hidden = true;
  el.unlockHint.hidden = true;
  el.loadNote.hidden = true;
  el.runError.hidden = true;
  releaseDownload();
  refresh();
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

refresh();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
