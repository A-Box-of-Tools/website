/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { saveBlob } from './shared/download.js';
import { messageBox } from './shared/message-box.js';
import { encodableTypes, FORMATS, JPEG, PNG, WEBP } from './codecs.js';
import { heifBrand, isAvif, readExif } from './boxes.js';
import { describeExif } from './exif.js';
import { engine, warmEngine } from './heif.js';
import {
  bytes as humanBytes, change, dimensions, metadataText, resultTotals, uniqueNames,
} from './files.js';
import { wireFilePicker, readingLabel } from './shared/file-picker.js';
import { makeZip } from './shared/zip.js';
import { makeExample } from './example.js';
import { captureBatch, convertOne } from './convert.js';

const $ = (id) => document.getElementById(id);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  fileList: $('file-list'),
  listToolbar: $('list-toolbar'),
  countLabel: $('count-label'),
  clearAll: $('clear-all'),
  loadError: $('load-error'),
  formatSelect: $('format-select'),
  qualityRow: $('quality-row'),
  quality: $('quality'),
  qualityValue: $('quality-value'),
  formatNote: $('format-note'),
  keepExif: $('keep-exif'),
  convertAll: $('convert-all'),
  cancel: $('cancel'),
  engineStatus: $('engine-status'),
  progress: $('progress'),
  progressBar: $('progress-bar'),
  progressLabel: $('progress-label'),
  results: $('results'),
  resultList: $('result-list'),
  downloadZip: $('download-zip'),
  resultsSummary: $('results-summary'),
  resultsSettings: $('results-settings'),
  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
};

const { show: showLoadError, clear: clearLoadError } = messageBox(el.loadError);

/**
 * How much of a file is read when it is added to the list.
 *
 * Enough to find the brand and, in every file anybody has, the EXIF block -
 * which sits at the front of `mdat`, before the picture. Reading the whole
 * thing here instead would mean holding a folder of forty-megabyte photos in
 * memory for as long as the page is open, to answer a question about the first
 * few kilobytes of each. If the block turns out to live past this point the row
 * simply says nothing about it, and the conversion, which reads the whole file
 * anyway, still copies it across.
 */
const HEAD_BYTES = 256 * 1024;

/**
 * @typedef {object} Item
 * @property {number} id
 * @property {File} file
 * @property {string} brand what the container calls itself: heic, mif1, ...
 * @property {ReturnType<typeof describeExif>} exif what the metadata holds
 */

/** @type {Item[]} */
let items = [];
let nextId = 1;
let busy = false;
let stopping = false;

/** Everything the run produced, kept so the rows can be redrawn and the zip
 *  built without decoding anything twice. */
let results = [];

/** Object URLs handed to download links and previews. Revoked as a set when
 *  the results are replaced; a dozen decoded photos held alive is how a browser
 *  tab ends up using two gigabytes. */
let resultUrls = [];

/** Which formats this browser will actually write. Filled in at boot. */
let writable = new Set([JPEG, PNG]);

/* ------------------------------------------------------------------ adding */

const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles(files) {
    addFiles(files);
  },
  example: makeExample,
});

async function addFiles(files) {
  if (!files?.length || busy) return;

  picker.busy(readingLabel(files.length));

  const failures = [];

  try {
    for (const file of files) {
      const head = new Uint8Array(await file.slice(0, HEAD_BYTES).arrayBuffer());
      const avif = isAvif(head);
      const brand = avif ? 'avif' : heifBrand(head);

      if (!brand) {
        failures.push(phrase('load.refused',
          { name: file.name, why: refusal(head, file) }));
        continue;
      }

      items.push({
        id: nextId,
        file,
        brand, avif,
        exif: describeExif(avif ? null : readExif(head)),
      });
      nextId += 1;
    }
  } finally {
    picker.done();
  }

  if (failures.length) showLoadError(failures.join('\n'));
  else clearLoadError();

  // The megabyte starts arriving now rather than when the button is pressed,
  // so that in the ordinary case - choose photos, glance at the options, press
  // convert - it is already here and the wait is nobody's.
  if (items.some(item => !item.avif)) {
    warmEngine();
    watchEngine();
  }

  clearResults();
  render();
}

/**
 * Why a file was not taken, said usefully.
 *
 * "Unsupported file" is the least helpful thing a converter can say, and the
 * three cases below are the three that actually turn up. Somebody who dropped a
 * JPEG on a HEIC converter has not made a mistake worth a scolding - they have
 * a folder where only some of the photos are the awkward ones.
 */
function refusal(head, file) {
  if (head[0] === 0xff && head[1] === 0xd8) return phrase('refuse.jpeg');
  if (head[0] === 0x89 && head[1] === 0x50) return phrase('refuse.png');
  return phrase('refuse.other', { name: file.name });
}

function removeItem(id) {
  const at = items.findIndex((i) => i.id === id);
  if (at < 0) return;
  items.splice(at, 1);
  clearResults();
  render();
}

el.clearAll.addEventListener('click', () => {
  items = [];
  clearResults();
  clearLoadError();
  render();
});

/* --------------------------------------------------------------- rendering */

/*
  Everything below builds DOM nodes and sets textContent. Nothing that came out
  of a file - a name above all - is ever put through innerHTML. File names are
  chosen by whoever made the file, and some of them contain markup precisely
  because pages like this one exist.
*/

function render() {
  const any = items.length > 0;
  el.listToolbar.hidden = !any;
  el.clearAll.disabled = busy;
  el.formatSelect.disabled = busy;
  el.quality.disabled = busy;
  el.countLabel.textContent = any
    ? phrase(items.length === 1 ? 'list.count.one' : 'list.count.many',
      { n: items.length, size: humanBytes(totalBytes(), phrase) })
    : '';
  el.convertAll.disabled = !any || busy;
  el.keepExif.disabled = busy || (any && items.every(item => item.avif));
  renderList();
  renderFormatNote();
}

const totalBytes = () => items.reduce((n, i) => n + i.file.size, 0);

function renderList() {
  el.fileList.replaceChildren();

  for (const item of items) {
    const li = document.createElement('li');
    li.className = 'file-row';

    const main = document.createElement('div');
    main.className = 'file-main-wrap';

    // No thumbnail. Drawing one would mean decoding the picture, and decoding
    // is the expensive half of this tool's whole job - twenty photos would be
    // converted twice, once to look at and once to keep. The row says what the
    // file is instead, and the pictures appear once, under the results.
    const text = document.createElement('div');
    text.className = 'file-main';

    const name = document.createElement('p');
    name.className = 'file-name';
    name.textContent = item.file.name;
    text.appendChild(name);

    const sub = document.createElement('p');
    sub.className = 'file-sub';
    sub.textContent = phrase(item.avif ? 'row.avif' : 'row.sub',
      { brand: item.brand, size: humanBytes(item.file.size, phrase) });
    text.appendChild(sub);

    const note = document.createElement('p');
    note.className = item.exif.gps ? 'file-note file-note-gps' : 'file-note';
    note.textContent = item.avif ? phrase('file.avif') : metadataText(item.exif, phrase);
    text.appendChild(note);

    main.appendChild(text);
    li.appendChild(main);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'row-remove';
    remove.title = phrase('row.remove', { name: item.file.name });
    remove.setAttribute('aria-label', remove.title);
    remove.textContent = '×';
    remove.disabled = busy;
    remove.addEventListener('click', () => removeItem(item.id));
    li.appendChild(remove);

    el.fileList.appendChild(li);
  }
}

/** The sentence under the format menu: what this combination will actually do. */
function renderFormatNote() {
  const mime = el.formatSelect.value;
  const lossy = FORMATS[mime]?.lossy;

  el.qualityRow.hidden = !lossy;

  const format = { [JPEG]: 'format.jpeg', [PNG]: 'format.png', [WEBP]: 'format.webp' }[mime];

  let details = !el.keepExif.checked
    ? phrase('exif.dropped')
    : mime === JPEG
      ? phrase('exif.kept')
      : phrase('exif.cannot', { format: FORMATS[mime]?.label ?? phrase('format.file') });

  if (items.some(item => item.avif)) {
    details = items.every(item => item.avif) ? phrase('file.avif')
      : phrase('join.sentences', { a: details, b: phrase('file.avif') });
  }

  el.formatNote.textContent = format
    ? phrase('join.sentences', { a: phrase(format), b: details })
    : details;
}

/* ------------------------------------------------------------- the options */

/*
  Any change to the settings throws away the results below. It costs somebody a
  download link they might still have wanted, and it is still the right call:
  the summary would otherwise describe files that were made under different
  settings from the ones on screen.
*/
for (const control of [el.formatSelect, el.keepExif]) {
  control.addEventListener('change', () => {
    if (busy) return;
    clearResults();
    renderFormatNote();
  });
}

el.quality.addEventListener('input', () => {
  if (busy) return;
  el.qualityValue.textContent = el.quality.value;
  clearResults();
});

/* ----------------------------------------------------------- the main event */

el.convertAll.addEventListener('click', async () => {
  if (!items.length || busy) return;

  const { settings, batch } = captureBatch(items, {
    mime: el.formatSelect.value, quality: Number(el.quality.value) / 100,
    keepExif: el.keepExif.checked,
  });
  busy = true;
  stopping = false;
  clearResults();
  clearLoadError();
  render();
  el.progress.hidden = false;
  el.cancel.hidden = false;

  const collected = [];
  const failures = [];
  let stopped = false;

  try {
    // Waited for here, once, rather than inside the loop: the first photo
    // should not be the one that looks slow because it paid for the decoder.
    if (batch.some(item => !item.avif)) {
      showProgress(0, batch.length, '', phrase('step.waiting'));
      await engine();
    }

    for (const [index, item] of batch.entries()) {
      if (stopping) { stopped = true; break; }
      showProgress(index, batch.length, item.file.name, phrase('step.reading'));
      try {
        for (const result of await convertOne(item, settings, (key, values) => {
          // convertOne reports as it decodes, so a press of Cancel lands
          // inside a photo rather than after it. The largest HEIC on a phone
          // is the slowest single thing this site does.
          if (stopping) throw new DOMException('Cancelled', 'AbortError');
          showProgress(index, batch.length, item.file.name, phrase(key, values));
        })) {
          collected.push(result);
        }
      } catch (error) {
        if (error?.name === 'AbortError') { stopped = true; break; }
        // The leaf modules throw keys; a browser that failed for its own
        // reasons throws a sentence, and phrase() hands back what it does
        // not recognise.
        failures.push(phrase('load.refused', {
          name: item.file.name, why: phrase(error.message, error.values),
        }));
      }
      // One turn of the event loop between photos, so the progress bar is a
      // progress bar rather than a thing that appears finished at the end.
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  } catch (error) {
    failures.push(phrase(error.message, error.values));
  } finally {
    busy = false;
    stopping = false;
    el.cancel.hidden = true;
    // Left up after a stop, so pressing Cancel and watching the bar vanish
    // does not read as nothing having happened.
    el.progress.hidden = !stopped;
    render();
  }

  if (stopped) {
    el.progressLabel.textContent = collected.length
      ? phrase('progress.stopped', { done: resultTotals(collected).files, total: batch.length })
      : phrase('progress.stopped.none');
  }
  if (failures.length) showLoadError(failures.join('\n'));
  // What finished is kept: one JPEG per photo means a run stopped halfway
  // still leaves half of them converted.
  results = collected;
  showResults(settings);
});

el.cancel.addEventListener('click', () => { stopping = true; });

function showProgress(index, total, name, note) {
  el.progressBar.style.width = `${Math.round((index / total) * 100)}%`;
  el.progressLabel.textContent = name
    ? phrase('progress.line', { index: index + 1, total, name, note })
    : note;
}

/* ------------------------------------------------------------- the results */

function clearResults() {
  for (const url of resultUrls) URL.revokeObjectURL(url);
  resultUrls = [];
  results = [];
  el.resultList.replaceChildren();
  el.results.hidden = true;
  el.resultsSummary.textContent = '';
  el.resultsSettings.textContent = '';
  el.downloadZip.hidden = true;
}

function showResults(settings) {
  if (!results.length) return;

  // Named here rather than in convertOne, because uniqueness is a property of
  // the batch and not of any one file in it.
  const names = uniqueNames(results.map((r) => r.outName));
  results.forEach((result, at) => { result.outName = names[at]; });

  el.results.hidden = false;
  el.resultsSettings.textContent = phrase('results.settings', {
    format: FORMATS[settings.mime].label, quality: Math.round(settings.quality * 100),
    metadata: phrase(settings.hasHeic && settings.keepExif && settings.mime === JPEG
      ? 'results.metadata.requested' : 'results.metadata.omitted'),
  });
  for (const result of results) el.resultList.appendChild(resultRow(result));

  // Counted over files rather than pictures on the way in, and over pictures on
  // the way out, because that is what actually happened.
  const { files: before, beforeBytes, afterBytes } = resultTotals(results);
  const label = FORMATS[settings.mime].label;

  // Two counts, each with its own plural, so each is a whole phrase.
  el.resultsSummary.textContent = phrase('results.summary', {
    files: phrase(before === 1 ? 'n.heic.one' : 'n.heic.many', { n: before }),
    pictures: phrase(results.length === 1 ? 'n.picture.one' : 'n.picture.many',
      { n: results.length, format: label }),
    before: humanBytes(beforeBytes, phrase),
    after: humanBytes(afterBytes, phrase),
    change: change(beforeBytes, afterBytes, phrase),
  });

  el.downloadZip.hidden = results.length < 2;
  el.downloadZip.onclick = async () => {
    el.downloadZip.disabled = true;
    try {
      const files = await Promise.all(results.map(async (r) => ({
        name: r.outName,
        data: new Uint8Array(await r.blob.arrayBuffer()),
      })));
      saveBlob(makeZip(files), 'converted-photos.zip');
    } finally {
      el.downloadZip.disabled = false;
    }
  };
}

function resultRow(result) {
  const li = document.createElement('li');
  li.className = 'result-row';

  const url = URL.createObjectURL(result.blob);
  resultUrls.push(url);

  const thumb = document.createElement('img');
  thumb.className = 'result-thumb';
  thumb.src = url;
  thumb.alt = phrase('result.alt', { name: result.outName });
  thumb.loading = 'lazy';
  li.appendChild(thumb);

  const text = document.createElement('div');
  text.className = 'result-text';

  const name = document.createElement('p');
  name.className = 'result-name';
  name.textContent = result.outName;
  text.appendChild(name);

  const headline = document.createElement('p');
  headline.className = 'result-headline';
  // Only a file that held one picture can be compared with its result. Saying
  // "701 KB to 455 KB" about each of two pictures out of one 701 KB file counts
  // the same bytes twice and reads as a saving that did not happen; the summary
  // above has the honest total.
  headline.textContent = result.parts > 1
    ? humanBytes(result.after, phrase)
    : phrase('result.headline', {
      before: humanBytes(result.before, phrase),
      after: humanBytes(result.after, phrase),
      change: change(result.before, result.after, phrase),
    });
  text.appendChild(headline);

  const detail = document.createElement('p');
  detail.className = 'result-detail';
  detail.textContent = describe(result);
  text.appendChild(detail);

  li.appendChild(text);

  const actions = document.createElement('div');
  actions.className = 'result-actions';

  const link = document.createElement('a');
  link.className = 'primary as-button';
  link.href = url;
  link.download = result.outName;
  link.textContent = phrase('result.download');
  actions.appendChild(link);

  li.appendChild(actions);
  return li;
}

/** One sentence saying exactly what came out, and what came with it. */
function describe(result) {
  const parts = [phrase('out.format', {
    format: FORMATS[result.mime]?.label ?? result.mime,
    size: dimensions(result.width, result.height),
  })];

  if (FORMATS[result.mime]?.lossy) {
    parts.push(phrase('out.quality', { n: Math.round(result.quality * 100) }));
  }
  if (result.part) {
    parts.push(phrase('out.part', { n: result.part, total: result.parts }));
  }

  parts.push({
    kept: phrase(result.exif.gps ? 'out.exif.keptgps' : 'out.exif.kept'),
    none: phrase('out.exif.none'),
    'too large': phrase('out.exif.toolarge'),
  }[result.metadata]);

  // The separator and the full stop are the sentence's, not this file's.
  return phrase('out.line', { list: parts.reduce((a, b) => phrase('join.dot', { a, b })) });
}

/* ------------------------------------------------------------------ errors */

/* ------------------------------------------------- privacy panel + offline */

el.privacyToggle.addEventListener('click', () => {
  const open = el.privacyPanel.hidden;
  el.privacyPanel.hidden = !open;
  el.privacyToggle.setAttribute('aria-expanded', String(open));
});

/**
 * The decoder's own line under the button.
 *
 * A megabyte is worth admitting to. It is also the one thing on this page that
 * a visitor might otherwise mistake for the tool phoning home, so it says where
 * it came from in the same breath as saying it arrived.
 *
 * Nothing here starts the load. Reporting on it must not be the reason it
 * happens, or every visitor who read the page and left would have paid for a
 * decoder they never used.
 */
function sayEngine(text, state = '') {
  el.engineStatus.textContent = text;
  el.engineStatus.className = `engine-status ${state}`.trim();
}

let watching = false;

function watchEngine() {
  if (watching) return;
  watching = true;

  sayEngine(phrase('engine.loading'));

  engine().then(() => {
    sayEngine(phrase('engine.ready'), 'good');
  }).catch((error) => {
    sayEngine(phrase('engine.failed',
      { why: phrase(error.message, error.values) }), 'warn');
  });
}

/** Take WebP off the format menu on a browser that cannot write it. */
async function checkEncoders() {
  writable = await encodableTypes();
  if (writable.has(WEBP)) return;

  for (const option of el.formatSelect.options) {
    if (option.value === WEBP) {
      option.disabled = true;
      option.textContent = phrase('webp.unsupported');
    }
  }
  if (el.formatSelect.value === WEBP) el.formatSelect.value = JPEG;
  renderFormatNote();
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

el.qualityValue.textContent = el.quality.value;
sayEngine(phrase('engine.first'));
render();
checkEncoders();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
