/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { encodePixels, encodableTypes, FORMATS, JPEG, PNG, WEBP } from './codecs.js';
import { heifBrand, isAvif, readExif } from './boxes.js';
import { describeExif, fitsInJpeg, uprightExif, withExif } from './exif.js';
import { decodeHeic, engine, warmEngine } from './heif.js';
import {
  bytes as humanBytes, change, dimensions, metadataText, outName, uniqueNames,
} from './files.js';
import { wireFilePicker, readingLabel } from './shared/file-picker.js';
import { makeZip } from './shared/zip.js';

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
  engineStatus: $('engine-status'),
  progress: $('progress'),
  progressBar: $('progress-bar'),
  progressLabel: $('progress-label'),
  results: $('results'),
  resultList: $('result-list'),
  downloadZip: $('download-zip'),
  resultsSummary: $('results-summary'),
  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
  networkCount: $('network-count'),
  networkDot: $('network-dot'),
  offlineStatus: $('offline-status'),
  offlineDot: $('offline-dot'),
};

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
});

async function addFiles(files) {
  if (!files?.length || busy) return;

  picker.busy(readingLabel(files.length));

  const failures = [];

  try {
    for (const file of files) {
      const head = new Uint8Array(await file.slice(0, HEAD_BYTES).arrayBuffer());
      const brand = heifBrand(head);

      if (!brand) {
        failures.push(`${file.name}: ${refusal(head, file)}`);
        continue;
      }

      items.push({
        id: nextId,
        file,
        brand,
        exif: describeExif(readExif(head)),
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
  if (items.length) {
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
  if (isAvif(head)) {
    return 'this is an AVIF, not a HEIC. Every current browser opens one already, '
      + 'so there is nothing here it needs doing to it.';
  }
  if (head[0] === 0xff && head[1] === 0xd8) {
    return 'this is already a JPEG.';
  }
  if (head[0] === 0x89 && head[1] === 0x50) {
    return 'this is a PNG, which already opens everywhere.';
  }
  return `this is not a HEIC. Whatever ${file.name} is, the first bytes of it are `
    + 'not a HEIF container, and the name is not evidence either way.';
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
  el.countLabel.textContent = any
    ? `${items.length} photo${items.length === 1 ? '' : 's'}, ${humanBytes(totalBytes())} in total`
    : '';
  el.convertAll.disabled = !any || busy;
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
    sub.textContent = [
      `HEIC (${item.brand})`,
      humanBytes(item.file.size),
    ].join(' · ');
    text.appendChild(sub);

    const note = document.createElement('p');
    note.className = item.exif.gps ? 'file-note file-note-gps' : 'file-note';
    note.textContent = metadataText(item.exif);
    text.appendChild(note);

    main.appendChild(text);
    li.appendChild(main);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'row-remove';
    remove.title = `Take ${item.file.name} off the list`;
    remove.setAttribute('aria-label', `Take ${item.file.name} off the list`);
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

  const format = {
    [JPEG]: 'JPEG is what the phone would have written if it had been asked to. '
      + 'Every program, every website and every printer opens one.',
    [PNG]: 'PNG throws nothing away, and a photograph saved as one is typically '
      + 'five to ten times the size of the JPEG. It is the right choice for a '
      + 'screenshot or a diagram and the wrong one for a holiday.',
    [WEBP]: 'WebP is smaller than JPEG at the same quality and is opened by every '
      + 'browser released since 2020 - but not by every desktop program, which is '
      + 'the thing to check before sending one to somebody.',
  }[mime] ?? '';

  const details = !el.keepExif.checked
    ? 'The date, camera and location are left out.'
    : mime === JPEG
      ? 'The date, camera and location are copied across, with the rotation tag '
        + 'corrected because the picture itself has already been turned the right way up.'
      : `The photo details cannot come along: only JPEG has a standard place to put `
        + `them that the canvas can write, so a ${FORMATS[mime]?.label ?? 'file'} `
        + `comes out with the picture and nothing else.`;

  el.formatNote.textContent = `${format} ${details}`;
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
    clearResults();
    renderFormatNote();
  });
}

el.quality.addEventListener('input', () => {
  el.qualityValue.textContent = el.quality.value;
  clearResults();
});

/* ----------------------------------------------------------- the main event */

el.convertAll.addEventListener('click', async () => {
  if (!items.length || busy) return;

  busy = true;
  clearResults();
  clearLoadError();
  render();
  el.progress.hidden = false;

  const collected = [];
  const failures = [];

  try {
    // Waited for here, once, rather than inside the loop: the first photo
    // should not be the one that looks slow because it paid for the decoder.
    showProgress(0, items.length, '', 'waiting for the decoder');
    await engine();

    for (const [index, item] of items.entries()) {
      showProgress(index, items.length, item.file.name, 'reading');
      try {
        for (const result of await convertOne(item, (note) => {
          showProgress(index, items.length, item.file.name, note);
        })) {
          collected.push(result);
        }
      } catch (error) {
        failures.push(`${item.file.name}: ${error.message}`);
      }
      // One turn of the event loop between photos, so the progress bar is a
      // progress bar rather than a thing that appears finished at the end.
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  } catch (error) {
    failures.push(error.message);
  } finally {
    busy = false;
    el.progress.hidden = true;
    render();
  }

  if (failures.length) showLoadError(failures.join('\n'));
  results = collected;
  showResults();
});

function showProgress(index, total, name, note) {
  el.progressBar.style.width = `${Math.round((index / total) * 100)}%`;
  el.progressLabel.textContent = name
    ? `${index + 1} of ${total}: ${name} - ${note}`
    : note;
}

/**
 * Convert one file, which is usually one picture and occasionally several.
 *
 * The whole file is read here rather than at the point it was chosen. It has to
 * be - the decoder wants every byte, and the EXIF block's own offsets are
 * offsets into the complete file - and reading it here means it is held for the
 * length of one conversion instead of for the length of the visit.
 *
 * @returns {Promise<object[]>} one result per picture in the file
 */
async function convertOne(item, onStep) {
  const mime = el.formatSelect.value;
  const quality = Number(el.quality.value) / 100;
  const keepExif = el.keepExif.checked;

  const bytes = new Uint8Array(await item.file.arrayBuffer());

  onStep('decoding');
  const pictures = await decodeHeic(bytes);

  // Read from the whole file rather than from the first 256 KB the list was
  // built off, so a photo whose metadata sits further in is not quietly
  // stripped of it here after the row promised otherwise.
  const tiff = keepExif && mime === JPEG ? readExif(bytes) : null;

  const out = [];
  for (const [index, picture] of pictures.entries()) {
    onStep(pictures.length > 1
      ? `writing picture ${index + 1} of ${pictures.length}`
      : `writing the ${FORMATS[mime]?.label ?? 'file'}`);

    let blob = await encodePixels(picture, { mime, quality });
    let metadata = 'none';

    // Only the primary picture gets the metadata. In a file holding several,
    // the EXIF block describes that one - stamping the same date and place onto
    // the others would be inventing facts about them.
    if (tiff && picture.primary) {
      if (fitsInJpeg(tiff)) {
        const patched = withExif(new Uint8Array(await blob.arrayBuffer()), uprightExif(tiff));
        blob = new Blob([patched], { type: JPEG });
        metadata = 'kept';
      } else {
        metadata = 'too large';
      }
    }

    out.push({
      name: item.file.name,
      before: item.file.size,
      after: blob.size,
      blob,
      mime,
      quality,
      width: picture.width,
      height: picture.height,
      metadata,
      exif: item.exif,
      part: pictures.length > 1 ? index + 1 : 0,
      parts: pictures.length,
      outName: outName(item.file.name, mime, index),
    });
  }
  return out;
}

/* ------------------------------------------------------------- the results */

function clearResults() {
  for (const url of resultUrls) URL.revokeObjectURL(url);
  resultUrls = [];
  results = [];
  el.resultList.replaceChildren();
  el.results.hidden = true;
}

function showResults() {
  if (!results.length) return;

  // Named here rather than in convertOne, because uniqueness is a property of
  // the batch and not of any one file in it.
  const names = uniqueNames(results.map((r) => r.outName));
  results.forEach((result, at) => { result.outName = names[at]; });

  el.results.hidden = false;
  for (const result of results) el.resultList.appendChild(resultRow(result));

  // Counted over files rather than pictures on the way in, and over pictures on
  // the way out, because that is what actually happened.
  const before = new Set(results.map((r) => r.name)).size;
  const beforeBytes = [...new Map(results.map((r) => [r.name, r.before])).values()]
    .reduce((n, size) => n + size, 0);
  const afterBytes = results.reduce((n, r) => n + r.after, 0);
  const label = FORMATS[results[0].mime]?.label ?? 'the new format';

  el.resultsSummary.textContent = `${before} HEIC ${before === 1 ? 'file' : 'files'} `
    + `→ ${results.length} ${label} ${results.length === 1 ? 'picture' : 'pictures'}. `
    + `${humanBytes(beforeBytes)} → ${humanBytes(afterBytes)}, ${change(beforeBytes, afterBytes)}.`;

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
  thumb.alt = `The converted picture: ${result.outName}`;
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
    ? humanBytes(result.after)
    : `${humanBytes(result.before)} → ${humanBytes(result.after)} · ${change(result.before, result.after)}`;
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
  link.textContent = 'Download';
  actions.appendChild(link);

  li.appendChild(actions);
  return li;
}

/** One sentence saying exactly what came out, and what came with it. */
function describe(result) {
  const parts = [`${FORMATS[result.mime]?.label ?? result.mime} at ${dimensions(result.width, result.height)}`];

  if (FORMATS[result.mime]?.lossy) parts.push(`quality ${Math.round(result.quality * 100)}`);
  if (result.part) parts.push(`picture ${result.part} of ${result.parts} in the file`);

  parts.push({
    kept: `photo details kept${result.exif.gps ? ', GPS coordinates included' : ''}`,
    none: 'no photo details written',
    'too large': 'the photo details were too large for a JPEG segment and were left out',
  }[result.metadata]);

  return `${parts.join(' · ')}.`;
}

/** Hand a blob to the browser's downloads. */
function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  // Revoked late: revoking immediately can cancel a download that has not
  // started yet in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

/* ------------------------------------------------------------------ errors */

function showLoadError(message) {
  el.loadError.textContent = message;
  el.loadError.hidden = false;
}

function clearLoadError() {
  el.loadError.textContent = '';
  el.loadError.hidden = true;
}

/* ------------------------------------------------- privacy panel + offline */

el.privacyToggle.addEventListener('click', () => {
  const open = el.privacyPanel.hidden;
  el.privacyPanel.hidden = !open;
  el.privacyToggle.setAttribute('aria-expanded', String(open));
});

// Hosts belonging to the ad, measurement and donate-button scripts. This tool
// has no network feature of its own, so there is no legitimate third bucket
// here: anything that is not this origin and not on this list would be a
// request nobody asked for, and the panel says so in those words. The decoder
// is not an exception - it comes from this origin, like every other file this
// page loads. cloudflareinsights.com is included because the host injects its
// own beacon: the CSP blocks it from running, but a blocked script still leaves
// a resource timing entry, and reporting that as an unexplained request would
// be alarming and wrong. google.com is written as a pattern because Google's
// measurement pixel uses the visitor's own country domain - www.google.ca,
// www.google.co.uk - and a list of literal hostnames turns the panel red for a
// visitor in the wrong country. buymeacoffee.com and googleapis.com are here
// for the donate button in the header.
const PLATFORM_HOSTS = /(^|\.)(googlesyndication\.com|doubleclick\.net|googleadservices\.com|googletagservices\.com|adtrafficquality\.google|googletagmanager\.com|google-analytics\.com|gstatic\.com|googleapis\.com|buymeacoffee\.com|cloudflareinsights\.com|google\.[a-z]{2,3}(\.[a-z]{2})?)$/;

/**
 * Report what this page has actually fetched.
 *
 * The claim on trial is not "this page is silent" - it is not silent, it
 * carries ads, and it carries a megabyte of decoder - but "nothing has carried
 * your photos away". That is the part that matters, and the part a sceptical
 * visitor can watch hold in real time.
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
    // One phrase per number rather than a pluralising helper: a language
    // whose plural is not a suffix has to be able to translate the two
    // separately.
    const platformNote = platform.size
      ? phrase(platform.size === 1 ? 'net.platform.one' : 'net.platform.many',
               { hosts: platform.size })
      : '';

    el.networkCount.textContent = clean
      ? phrase('net.clean', { total, platform: platformNote })
      : phrase('net.dirty', { hosts: [...unexplained].join(', '), platform: platformNote });

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
  // Keep the visible text short: this sits in the trust panel, and a raw
  // browser error dumped there reads worse than it is. Detail goes in the
  // tooltip and the console for anyone debugging.
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
  // Service workers need a secure context, so file:// and plain http:// are out.
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
    // Caching is an optimisation, not the privacy guarantee. Everything the
    // page claims still holds when this fails, so say so rather than alarming.
    fail(phrase('offline.failed'), error.message);
  }
}

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

  sayEngine('Loading the HEIC decoder from this site: about 1.4 MB, once.');

  engine().then(() => {
    sayEngine('Decoder ready - served from this site, and cached so it is here '
      + 'next time and with the network unplugged.', 'good');
  }).catch((error) => {
    sayEngine(`The decoder could not start: ${error.message}`, 'warn');
  });
}

/** Take WebP off the format menu on a browser that cannot write it. */
async function checkEncoders() {
  writable = await encodableTypes();
  if (writable.has(WEBP)) return;

  for (const option of el.formatSelect.options) {
    if (option.value === WEBP) {
      option.disabled = true;
      option.textContent = 'WebP - not supported by this browser';
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
sayEngine('The HEIC decoder loads from this site the first time you use it: about 1.4 MB, once, then cached.');
render();
checkEncoders();
monitorNetwork();
registerServiceWorker();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
