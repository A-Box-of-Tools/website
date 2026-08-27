/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { MIN_SIZE, clampRect } from './regions.js';
import { applyRegions } from './redact.js';
import { Preview } from './preview.js';
import { Stage } from './stage.js';
import {
  chooseFormat, countSummary, describeRegion, outName, riskNote, sizeText,
  stemOf, strengthNote,
} from './files.js';
import { readingLabel, wireFilePicker } from './shared/file-picker.js';

const $ = (id) => document.getElementById(id);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  loaded: $('loaded'),
  loadedName: $('loaded-name'),
  clearImage: $('clear-image'),
  loadError: $('load-error'),

  editEmpty: $('edit-empty'),
  editControls: $('edit-controls'),
  stage: $('stage'),
  preview: $('preview'),
  styleGroup: $('style-group'),
  strength: $('strength'),
  strengthNote: $('strength-note'),
  addBox: $('add-box'),
  undo: $('undo'),
  clearBoxes: $('clear-boxes'),
  boxSummary: $('box-summary'),
  regionList: $('region-list'),
  riskNote: $('risk-note'),

  format: $('format'),
  qualityRow: $('quality-row'),
  quality: $('quality'),
  qualityValue: $('quality-value'),
  save: $('save'),
  busy: $('busy'),
  result: $('result'),
  resultImage: $('result-image'),
  resultFacts: $('result-facts'),
  download: $('download'),

  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
  networkCount: $('network-count'),
  networkDot: $('network-dot'),
  offlineStatus: $('offline-status'),
  offlineDot: $('offline-dot'),
};

/**
 * @typedef {object} Picture
 * @property {File} file
 * @property {ImageBitmap|HTMLImageElement} bitmap
 * @property {number} width
 * @property {number} height
 */

/** @type {Picture|null} One picture at a time: redaction is not a batch job. */
let picture = null;

/** @type {Array<{id: string, x: number, y: number, width: number, height: number, style: string}>} */
let regions = [];

/**
 * Snapshots of `regions`, oldest first.
 *
 * A box drawn over the wrong thing, or dragged off the thing it was covering,
 * is the mistake this tool most needs to be forgiving about - and the one that
 * matters, because the result is a file somebody is about to send. So every
 * gesture that changes a box takes a copy first, and undo puts the last one
 * back. Nothing else in the tool is undoable, because nothing else destroys
 * anything: the picture itself is untouched until the button is pressed.
 */
let history = [];

let selectedId = null;
let style = 'fill';
let counter = 0;
let busy = false;
let resultUrl = null;
let pending = 0;

const preview = new Preview(el.preview);
const stage = new Stage(el.stage, {
  onCreate: (rect) => addRegion(rect),
  onChange: (id, rect) => moveRegion(id, rect),
  onSelect: (id) => select(id),
  onDelete: (id) => removeRegion(id),
  onGestureStart: () => snapshot(),
  regionOf: (id) => regions.find((region) => region.id === id),
  describe: (region, index) => `Area ${index + 1}: ${describeRegion(region, el.strength.value)}. `
    + 'The arrow keys move it, Alt and the arrow keys resize it, and Delete removes it.',
});

/* ------------------------------------------------------------- the picture */

/**
 * Decode a file into a bitmap.
 *
 * `createImageBitmap` is the direct route and what every current browser takes.
 * The `<img>` fallback is for older Safari builds where it is missing or
 * refuses a blob; same picture, same pipeline, an object URL in the middle.
 */
async function decode(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      return { bitmap, width: bitmap.width, height: bitmap.height };
    } catch {
      // Fall through: some builds reject formats their <img> tag accepts.
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('this browser could not decode the picture.'));
      element.src = url;
    });
    return { bitmap: image, width: image.naturalWidth, height: image.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function load(file) {
  clearLoadError();
  wired.busy(readingLabel(1));
  try {
    const decoded = await decode(file);
    dropPicture();
    picture = { file, ...decoded };

    el.stage.style.aspectRatio = `${decoded.width} / ${decoded.height}`;
    preview.setSource(decoded.bitmap, decoded);
    stage.setSource(decoded.width, decoded.height);

    regions = [];
    history = [];
    selectedId = null;
    counter = 0;

    el.loadedName.textContent = `${file.name} - ${decoded.width} x ${decoded.height}`;
    el.loaded.hidden = false;
    el.editEmpty.hidden = true;
    el.editControls.hidden = false;
    showFormatRow();
    refresh();
  } catch (error) {
    showLoadError(`That file could not be opened: ${error.message}`);
  } finally {
    wired.done();
  }
}

/** Let go of the bitmap and of anything made from it. */
function dropPicture() {
  if (picture?.bitmap && typeof picture.bitmap.close === 'function') picture.bitmap.close();
  picture = null;
  if (resultUrl) URL.revokeObjectURL(resultUrl);
  resultUrl = null;
  el.result.hidden = true;
  el.resultImage.removeAttribute('src');
}

const wired = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles(files) {
    if (files.length > 0) load(files[0]);
  },
});

el.clearImage.addEventListener('click', () => {
  dropPicture();
  preview.clear();
  regions = [];
  history = [];
  selectedId = null;
  el.loaded.hidden = true;
  el.editControls.hidden = true;
  el.editEmpty.hidden = false;
  el.fileInput.value = '';
  refresh();
});

/* --------------------------------------------------------------- the boxes */

const snapshot = () => {
  history.push(regions.map((region) => ({ ...region })));
  if (history.length > 100) history.shift();
};

function addRegion(rect, { focus = false } = {}) {
  snapshot();
  counter += 1;
  const region = { id: `r${counter}`, ...clampRect(rect, picture), style };
  regions.push(region);
  selectedId = region.id;
  refresh();
  if (focus) stage.focus(region.id);
}

function moveRegion(id, rect) {
  const region = regions.find((item) => item.id === id);
  if (!region) return;
  Object.assign(region, rect);
  refresh();
}

function removeRegion(id) {
  regions = regions.filter((region) => region.id !== id);
  if (selectedId === id) selectedId = regions.at(-1)?.id ?? null;
  refresh();
}

function select(id) {
  if (selectedId === id) return;
  selectedId = id;
  refresh();
}

function setStyle(next) {
  style = next;
  const region = regions.find((item) => item.id === selectedId);
  if (region && region.style !== next) {
    snapshot();
    region.style = next;
  }
  refresh();
}

/** A box in the middle of the picture, a quarter of its size. The keyboard route in. */
el.addBox.addEventListener('click', () => {
  if (!picture) return;
  const width = Math.max(MIN_SIZE, Math.round(picture.width / 4));
  const height = Math.max(MIN_SIZE, Math.round(picture.height / 6));
  addRegion({
    x: Math.round((picture.width - width) / 2),
    y: Math.round((picture.height - height) / 2),
    width,
    height,
  }, { focus: true });
});

el.undo.addEventListener('click', () => {
  const previous = history.pop();
  if (!previous) return;
  regions = previous;
  if (!regions.some((region) => region.id === selectedId)) selectedId = regions.at(-1)?.id ?? null;
  refresh();
});

el.clearBoxes.addEventListener('click', () => {
  if (regions.length === 0) return;
  snapshot();
  regions = [];
  selectedId = null;
  refresh();
});

el.styleGroup.addEventListener('change', (event) => {
  if (event.target.name === 'style') setStyle(event.target.value);
});

el.strength.addEventListener('change', () => refresh());

/* ------------------------------------------------------------- redrawing */

/**
 * Repaint everything that depends on the boxes.
 *
 * The canvas redraw is held to one a frame. A pointer can report a hundred
 * moves a second and each redraw is a full copy of the preview plus the blurs
 * on it, so without this the queue grows faster than it drains and the outline
 * slides away from the pointer.
 */
function refresh() {
  stage.render(regions, selectedId);
  renderList();

  if (!pending) {
    pending = requestAnimationFrame(() => {
      pending = 0;
      preview.draw(regions, el.strength.value);
    });
  }

  el.undo.disabled = history.length === 0;
  el.clearBoxes.disabled = regions.length === 0;
  el.save.disabled = !picture || busy;
  el.strengthNote.textContent = strengthNote(el.strength.value);
}

function renderList() {
  const strength = el.strength.value;
  el.boxSummary.textContent = countSummary(regions);

  const risk = riskNote(regions, strength);
  el.riskNote.textContent = risk ?? '';
  el.riskNote.hidden = risk === null;

  el.regionList.replaceChildren(...regions.map((region, index) => {
    const row = document.createElement('li');
    row.className = `region-row${region.id === selectedId ? ' selected' : ''}`;

    const tag = document.createElement('span');
    tag.className = 'region-tag';
    tag.textContent = String(index + 1);

    const text = document.createElement('button');
    text.type = 'button';
    text.className = 'region-text';
    text.textContent = describeRegion(region, strength);
    text.addEventListener('click', () => {
      select(region.id);
      stage.focus(region.id);
    });

    const choice = document.createElement('select');
    choice.className = 'region-style';
    choice.setAttribute('aria-label', `What area ${index + 1} does`);
    for (const [value, label] of [
      ['fill', 'Black out'], ['pixelate', 'Pixelate'], ['blur', 'Blur'],
    ]) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      option.selected = region.style === value;
      choice.append(option);
    }
    choice.addEventListener('change', () => {
      snapshot();
      region.style = choice.value;
      refresh();
    });

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'ghost danger region-remove';
    remove.textContent = 'Remove';
    remove.addEventListener('click', () => {
      snapshot();
      removeRegion(region.id);
    });

    row.append(tag, text, choice, remove);
    return row;
  }));
}

/* -------------------------------------------------------------- the output */

/**
 * The quality slider only exists for the formats that have one.
 *
 * It moves on its own when "auto" is chosen and a file is loaded, because auto
 * means JPEG for a photograph and PNG for everything else - so which of the two
 * a picture is deciding the row is the honest behaviour rather than a surprise.
 */
function showFormatRow() {
  el.qualityRow.hidden = !chooseFormat(el.format.value, picture?.file.type ?? '').lossy;
}

el.format.addEventListener('change', showFormatRow);

el.quality.addEventListener('input', () => {
  el.qualityValue.textContent = `${el.quality.value}%`;
});

el.save.addEventListener('click', () => save());

/**
 * Redact the picture at its own size, and hand back the file.
 *
 * This is the only place the full-resolution pixels are touched, and it is one
 * pass: decode to a canvas, rewrite the boxes, encode. The canvas is thrown
 * away immediately afterwards, and what is left is a blob whose bytes went
 * through `applyRegions` - there is no version of the picture in this page with
 * the boxes as a separate layer, because no such version is ever made.
 */
async function save() {
  if (!picture || busy) return;
  busy = true;
  el.save.disabled = true;
  el.busy.hidden = false;
  el.result.hidden = true;

  // Yield once, so the "Redacting" line is painted before the main thread is
  // taken for however long a large photograph needs. A timer rather than
  // requestAnimationFrame: a background tab never gets a frame, and the file
  // has to be written whether or not anybody is looking at the page.
  await new Promise((resolve) => setTimeout(resolve, 0));

  try {
    const format = chooseFormat(el.format.value, picture.file.type);
    const canvas = document.createElement('canvas');
    canvas.width = picture.width;
    canvas.height = picture.height;
    const context = canvas.getContext('2d', { willReadFrequently: true });

    // JPEG has no alpha channel. A transparent PNG drawn onto an unpainted
    // canvas and written as JPEG comes back with black where the transparency
    // was, which on this page reads as a redaction that was never asked for.
    if (format.mime === 'image/jpeg') {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.drawImage(picture.bitmap, 0, 0);

    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    applyRegions(pixels, regions, el.strength.value);
    context.putImageData(pixels, 0, 0);

    const quality = format.lossy ? Number(el.quality.value) / 100 : undefined;
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (made) => (made ? resolve(made) : reject(new Error('the browser could not encode it.'))),
        format.mime,
        quality,
      );
    });

    canvas.width = 0;
    canvas.height = 0;
    showResult(blob, format);
  } catch (error) {
    showLoadError(`Something went wrong writing the file: ${error.message}`);
  } finally {
    busy = false;
    el.busy.hidden = true;
    el.save.disabled = false;
  }
}

/**
 * Show the finished file.
 *
 * The picture on screen is the blob itself, decoded again by the browser - not
 * the canvas it came from. So what is being looked at is the file that is about
 * to be downloaded, and if anything had survived the redaction it would be
 * visible here.
 */
function showResult(blob, format) {
  if (resultUrl) URL.revokeObjectURL(resultUrl);
  resultUrl = URL.createObjectURL(blob);

  const name = outName(stemOf(picture.file.name), format);
  el.resultImage.src = resultUrl;
  el.resultImage.alt = `The redacted picture, ${picture.width} by ${picture.height} pixels`;
  el.download.href = resultUrl;
  el.download.download = name;

  const facts = [
    `${name} - ${sizeText(blob.size)}, ${picture.width} x ${picture.height}`,
    countSummary(regions) || 'No areas were marked, so this is the same picture re-encoded.',
    'Written from the redacted pixels, so it carries no EXIF, no GPS, no embedded '
    + 'thumbnail and no layer with the original in it.',
  ];
  el.resultFacts.replaceChildren(...facts.map((line) => {
    const item = document.createElement('li');
    item.textContent = line;
    return item;
  }));

  el.result.hidden = false;
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
// request nobody asked for, and the panel says so in those words.
// cloudflareinsights.com is included because the host injects its own beacon.
// The CSP blocks it from running, but a blocked script still leaves a resource
// timing entry, and reporting that as an unexplained request would be alarming
// and wrong. Anything the page can pull in without the user asking belongs here.
// google.com is written as a pattern because Google's measurement pixel uses
// the visitor's own country domain - www.google.ca, www.google.co.uk - and a
// list of literal hostnames turns the panel red for a visitor in the wrong
// country. That is the worst possible failure for this particular panel: the
// one place on the page meant to be checkable, saying something untrue.
const PLATFORM_HOSTS = /(^|\.)(googlesyndication\.com|doubleclick\.net|googleadservices\.com|googletagservices\.com|adtrafficquality\.google|googletagmanager\.com|google-analytics\.com|gstatic\.com|googleapis\.com|buymeacoffee\.com|cloudflareinsights\.com|google\.[a-z]{2,3}(\.[a-z]{2})?)$/;

/**
 * Report what this page has actually fetched.
 *
 * The claim on trial is not "this page is silent" - it is not silent, it
 * carries ads - but "nothing has carried your picture away". It matters more
 * here than on most of these tools: the pictures people bring to a redaction
 * tool are the ones with a name, an address or an account number on them, and
 * they arrive on this page before anything has been covered up.
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
showFormatRow();
monitorNetwork();
registerServiceWorker();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
