/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { wireFilePicker, readingLabel } from './shared/file-picker.js';
import { loadImages, releaseItem, rotateItem, sortItems, moveItem } from './images.js';
import { layoutPage, seenSize, PAGE_SIZES } from './layout.js';
import { buildDocument } from './document.js';

const $ = (id) => document.getElementById(id);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  loadError: $('load-error'),
  list: $('image-list'),
  listToolbar: $('list-toolbar'),
  countLabel: $('count-label'),
  reorderHint: $('reorder-hint'),
  clearAll: $('clear-all'),

  pageSize: $('page-size'),
  customSize: $('custom-size'),
  customWidth: $('custom-width'),
  customHeight: $('custom-height'),
  customUnit: $('custom-unit'),
  sizeNote: $('size-note'),
  dpiField: $('dpi-field'),
  dpi: $('dpi'),
  orientationField: $('orientation-field'),
  orientation: $('orientation'),
  fitField: $('fit-field'),
  fit: $('fit'),
  margin: $('margin'),
  background: $('background'),
  mode: $('mode'),
  modeNote: $('mode-note'),
  qualityField: $('quality-field'),
  quality: $('quality'),
  maxSide: $('max-side'),
  shrinkNote: $('shrink-note'),

  docTitle: $('doc-title'),
  docAuthor: $('doc-author'),
  fileName: $('file-name'),
  dated: $('dated'),

  preview: $('preview'),
  previewEmpty: $('preview-empty'),
  previewNav: $('preview-nav'),
  previewPrev: $('preview-prev'),
  previewNext: $('preview-next'),
  previewLabel: $('preview-label'),

  sumPages: $('sum-pages'),
  sumSize: $('sum-size'),
  sumInput: $('sum-input'),
  sumCopied: $('sum-copied'),

  exportBtn: $('export'),
  cancelBtn: $('cancel'),
  progressWrap: $('progress-wrap'),
  progressBar: $('progress-bar'),
  progressLabel: $('progress-label'),
  error: $('error'),
  result: $('result'),
  resultInfo: $('result-info'),
  download: $('download'),

  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
  networkCount: $('network-count'),
  networkDot: $('network-dot'),
  offlineStatus: $('offline-status'),
  offlineDot: $('offline-dot'),
};

/** The chosen pictures, in page order. */
let items = [];
let exporting = false;
let cancelled = false;
let abortController = null;
let resultUrl = null;
/** Which page the preview is showing. */
let previewAt = 0;

/* ------------------------------------------------------------------ adding */

// The drop zone and the picker: shared, because every tool here needs the
// same one. src/shared/file-picker.js, copied in from shared/js/ by the
// build. The resting label comes off the markup, so it is written once,
// in this tool.toml, rather than here as well.
const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles(files) {
    addFiles(files);
  },
});

async function addFiles(files) {
  if (!files?.length || exporting) return;

  picker.busy(readingLabel(files.length));

  try {
    const { items: added, skipped } = await loadImages(files);
    items.push(...added);
    if (skipped.length) showLoadError(skipped.join('\n'));
    else clearLoadError();
  } finally {
    picker.done();
  }

  render();
}


/* --------------------------------------------------------------- the pages */

let dragIndex = null;
/** Where the dragged page would land: { index, after } */
let dropAt = null;

function clearDropMarkers() {
  for (const node of el.list.querySelectorAll('.insert-before, .insert-after')) {
    node.classList.remove('insert-before', 'insert-after');
  }
}

/**
 * One tile.
 *
 * The thumbnail is drawn onto a canvas rather than hung in an <img>, because
 * the rotate buttons have to be able to turn it and a rotated <img> either
 * overflows its tile or has to be scaled back by hand in CSS. Drawing it costs
 * one canvas per tile and makes the turn exact.
 */
function buildItemNode(item, index) {
  const li = document.createElement('li');
  li.className = 'image-item';
  li.dataset.index = String(index);

  // A dedicated handle makes the gesture discoverable and keeps dragging from
  // fighting with the buttons on the tile.
  const handle = document.createElement('button');
  handle.type = 'button';
  handle.className = 'drag-handle';
  handle.draggable = true;
  handle.textContent = '⋮⋮';
  handle.title = `Drag to move ${item.name}`;
  handle.setAttribute('aria-label', `Drag to move ${item.name}`);

  const thumbWrap = document.createElement('div');
  thumbWrap.className = 'thumb-wrap';
  thumbWrap.draggable = true;

  const canvas = document.createElement('canvas');
  canvas.className = 'thumb';
  drawThumb(canvas, item);
  thumbWrap.append(canvas);

  const badge = document.createElement('span');
  badge.className = 'order-badge';
  badge.textContent = String(index + 1);
  thumbWrap.append(badge);

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'remove-btn';
  remove.textContent = '×';
  remove.title = `Remove ${item.name}`;
  remove.setAttribute('aria-label', `Remove ${item.name}`);
  remove.addEventListener('click', () => {
    // Every control that changes the queue stands down while a document is
    // being written from it. The Images to Video tool hands its encoder a
    // snapshot for the same reason; the belt goes with those braces, because a
    // result that no longer matches the tiles above it is worse than a wait.
    if (exporting) return;
    releaseItem(item);
    items.splice(index, 1);
    render();
  });
  thumbWrap.append(remove);

  const meta = document.createElement('div');
  meta.className = 'image-meta';

  const seen = seenSize(item);
  const name = document.createElement('p');
  name.className = 'image-name';
  name.textContent = item.name;
  name.title = `${item.name} — ${seen.width} × ${seen.height}`;
  meta.append(name);

  const dims = document.createElement('p');
  dims.className = 'image-dims';
  dims.textContent = `${seen.width} × ${seen.height} · ${formatBytes(item.file.size)}`;
  meta.append(dims);

  const controls = document.createElement('div');
  controls.className = 'image-controls';
  controls.append(
    tileButton('↺', `Rotate ${item.name} anticlockwise`, false, () => {
      if (exporting) return;
      rotateItem(item, -1);
      render();
    }),
    tileButton('↻', `Rotate ${item.name} clockwise`, false, () => {
      if (exporting) return;
      rotateItem(item, 1);
      render();
    }),
    tileButton('‹', `Move ${item.name} earlier`, index === 0, () => {
      if (exporting) return;
      moveItem(items, index, index - 1);
      render();
    }),
    tileButton('›', `Move ${item.name} later`, index === items.length - 1, () => {
      if (exporting) return;
      moveItem(items, index, index + 1);
      render();
    }),
  );
  meta.append(controls);

  li.append(handle, thumbWrap, meta);

  const startDrag = (event) => {
    if (exporting) { event.preventDefault(); return; }
    dragIndex = index;
    li.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
    // Firefox refuses to start a drag unless some data is set.
    event.dataTransfer.setData('text/plain', String(index));
  };

  const endDrag = () => {
    dragIndex = null;
    dropAt = null;
    li.classList.remove('dragging');
    clearDropMarkers();
  };

  for (const source of [handle, thumbWrap]) {
    source.addEventListener('dragstart', startDrag);
    source.addEventListener('dragend', endDrag);
  }

  li.addEventListener('dragover', (event) => {
    if (dragIndex === null) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';

    // Which side of the tile the pointer is on decides where it lands, so the
    // marker always reads as "it goes here", not "it swaps with this".
    const rect = li.getBoundingClientRect();
    const after = event.clientX > rect.left + rect.width / 2;

    clearDropMarkers();
    li.classList.add(after ? 'insert-after' : 'insert-before');
    dropAt = { index, after };
  });

  li.addEventListener('drop', (event) => {
    event.preventDefault();
    event.stopPropagation();
    applyDrop();
  });

  return li;
}

function tileButton(glyph, label, disabled, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'tile-btn';
  button.textContent = glyph;
  button.title = label;
  button.setAttribute('aria-label', label);
  button.disabled = disabled;
  button.addEventListener('click', onClick);
  return button;
}

/** The thumbnail, turned the way the page will show it. */
function drawThumb(canvas, item) {
  const image = item.thumb.image;
  if (!image.naturalWidth) return;

  const turned = item.rotate === 90 || item.rotate === 270;
  canvas.width = turned ? image.naturalHeight : image.naturalWidth;
  canvas.height = turned ? image.naturalWidth : image.naturalHeight;

  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((item.rotate * Math.PI) / 180);
  ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
  ctx.restore();
}

/** Move the dragged page to wherever the marker currently sits. */
function applyDrop() {
  if (dragIndex === null || dropAt === null) {
    clearDropMarkers();
    return;
  }

  let target = dropAt.after ? dropAt.index + 1 : dropAt.index;
  // Removing the item first shifts everything after it down by one.
  if (dragIndex < target) target -= 1;

  const from = dragIndex;
  dragIndex = null;
  dropAt = null;

  if (from === target) {
    clearDropMarkers();
    return;
  }

  moveItem(items, from, target);
  render();
}

// Dropping in the gaps between tiles should still land somewhere sensible
// rather than being swallowed by the window-level handler.
el.list.addEventListener('dragover', (event) => {
  if (dragIndex !== null) event.preventDefault();
});
el.list.addEventListener('drop', (event) => {
  if (dragIndex === null) return;
  event.preventDefault();
  applyDrop();
});

for (const button of document.querySelectorAll('[data-sort]')) {
  button.addEventListener('click', () => {
    if (exporting) return;
    sortItems(items, button.dataset.sort);
    render();
  });
}

el.clearAll.addEventListener('click', () => {
  if (!items.length || exporting) return;
  for (const item of items) releaseItem(item);
  items = [];
  clearLoadError();
  render();
});

/* ---------------------------------------------------------------- settings */

function currentSettings() {
  return {
    pageSize: el.pageSize.value,
    customWidth: Number(el.customWidth.value),
    customHeight: Number(el.customHeight.value),
    customUnit: el.customUnit.value,
    dpi: Number(el.dpi.value),
    orientation: el.orientation.value,
    fit: el.fit.value,
    margin: Number(el.margin.value),
    background: el.background.value,
    mode: el.mode.value,
    quality: Number(el.quality.value),
    maxSide: Number(el.maxSide.value),
    title: el.docTitle.value,
    author: el.docAuthor.value,
    dated: el.dated.checked,
  };
}

/**
 * Show only the settings that mean anything for the choice above them.
 *
 * Fitting the page to the image leaves nothing for orientation or fit to
 * decide - there is no page for the picture to be arranged on - so those two
 * are hidden rather than left on screen doing nothing.
 */
function syncSettingVisibility() {
  const fitPage = el.pageSize.value === 'fit';
  el.customSize.hidden = el.pageSize.value !== 'custom';
  el.dpiField.hidden = !fitPage;
  el.orientationField.hidden = fitPage;
  el.fitField.hidden = fitPage;
  el.qualityField.hidden = el.mode.value === 'lossless';

  el.sizeNote.textContent = fitPage
    ? 'Every page is exactly its picture, so nothing is cropped or letterboxed.'
    : 'Pictures are placed on a page of this size.';

  el.modeNote.textContent = {
    keep: 'JPEG photos go in byte for byte, with no decoding and no quality lost. '
      + 'Other formats are re-encoded, or kept lossless if they are see-through.',
    jpeg: 'Everything is decoded and encoded again. Smallest file, and the only '
      + 'setting that costs quality on a picture that was already a JPEG.',
    lossless: 'Every picture is stored exactly, deflated. Largest file by some way, '
      + 'and the right answer for scans of text, line art and screenshots.',
  }[el.mode.value];

  el.shrinkNote.textContent = el.maxSide.value === '0'
    ? 'Full resolution. A folder of phone photos makes a large PDF.'
    : 'Anything larger is scaled down, which means it is re-encoded rather than copied.';
}

const settingInputs = [
  [el.pageSize, 'change'], [el.customWidth, 'input'], [el.customHeight, 'input'],
  [el.customUnit, 'change'], [el.dpi, 'change'], [el.orientation, 'change'],
  [el.fit, 'change'], [el.margin, 'input'], [el.background, 'input'],
  [el.mode, 'change'], [el.quality, 'change'], [el.maxSide, 'change'],
];

for (const [input, type] of settingInputs) {
  input.addEventListener(type, () => {
    clearResult();
    // Only the page changes here, never the queue - so the tiles, and the
    // hundred canvases that may be in them, are left alone.
    refresh();
  });
}

/* ----------------------------------------------------------------- preview */

el.previewPrev.addEventListener('click', () => {
  previewAt = Math.max(0, previewAt - 1);
  drawPreview();
});

el.previewNext.addEventListener('click', () => {
  previewAt = Math.min(items.length - 1, previewAt + 1);
  drawPreview();
});

/** The longest side the preview canvas is allowed to be, in CSS pixels. */
const PREVIEW_MAX = 360;

/**
 * Draw one page as it will be printed.
 *
 * This is the same layout the document is written from - layoutPage is called
 * once here and once again in document.js - so what is on screen is not an
 * impression of the result, it is the result at a smaller size. The y axis is
 * flipped on the way in, because PDF measures up from the bottom of the page
 * and a canvas measures down from the top.
 */
function drawPreview() {
  const ctx = el.preview.getContext('2d');
  previewAt = Math.min(previewAt, Math.max(0, items.length - 1));

  const any = items.length > 0;
  el.preview.classList.toggle('empty', !any);
  el.previewEmpty.hidden = any;
  el.previewNav.hidden = items.length < 2;
  el.previewLabel.textContent = `Page ${previewAt + 1} of ${items.length}`;
  el.previewPrev.disabled = previewAt === 0;
  el.previewNext.disabled = previewAt >= items.length - 1;
  if (!any) return;

  const item = items[previewAt];
  const page = layoutPage(item, currentSettings());
  const scale = PREVIEW_MAX / Math.max(page.width, page.height);
  const ratio = Math.min(2, window.devicePixelRatio || 1);

  el.preview.width = Math.max(1, Math.round(page.width * scale * ratio));
  el.preview.height = Math.max(1, Math.round(page.height * scale * ratio));
  el.preview.style.width = `${Math.round(page.width * scale)}px`;
  el.preview.style.height = `${Math.round(page.height * scale)}px`;

  ctx.setTransform(scale * ratio, 0, 0, scale * ratio, 0, 0);
  ctx.fillStyle = el.background.value;
  ctx.fillRect(0, 0, page.width, page.height);

  const image = item.thumb.image;
  if (!image.naturalWidth) return;

  ctx.save();
  if (page.clip) {
    ctx.beginPath();
    ctx.rect(page.clip.x, page.height - page.clip.y - page.clip.height,
      page.clip.width, page.clip.height);
    ctx.clip();
  }

  const { rect } = page;
  ctx.translate(rect.x + rect.width / 2, page.height - rect.y - rect.height / 2);
  ctx.rotate((item.rotate * Math.PI) / 180);
  // After a quarter turn the box the picture is drawn into is the page rectangle
  // with its sides exchanged, because the rotation happens around its middle.
  const turned = item.rotate === 90 || item.rotate === 270;
  const width = turned ? rect.height : rect.width;
  const height = turned ? rect.width : rect.height;
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
  ctx.restore();
}

/* ----------------------------------------------------------------- summary */

/**
 * Rebuild the tiles, then everything that follows from them.
 *
 * Every change to the queue comes through here, which is why the finished PDF
 * is dropped here: reordering the pages changes the document as surely as
 * changing the page size does, and a download button offering the version from
 * before the change is worse than no download button.
 */
function render() {
  clearResult();
  el.list.replaceChildren(...items.map(buildItemNode));
  refresh();
}

/** Everything except the tiles: the counts, the preview, and what is enabled. */
function refresh() {
  const any = items.length > 0;
  el.listToolbar.hidden = !any;
  el.reorderHint.hidden = items.length < 2;
  el.countLabel.textContent = `${items.length} image${items.length === 1 ? '' : 's'}`;
  el.exportBtn.disabled = !any || exporting;

  syncSettingVisibility();
  updateSummary();
  drawPreview();
}

function updateSummary() {
  const settings = currentSettings();

  el.sumPages.textContent = items.length
    ? `${items.length} page${items.length === 1 ? '' : 's'}`
    : '—';

  el.sumSize.textContent = describePageSize(settings);

  const bytes = items.reduce((total, item) => total + item.file.size, 0);
  el.sumInput.textContent = items.length ? formatBytes(bytes) : '—';

  const kept = items.filter((item) => likelyCopied(item, settings)).length;
  el.sumCopied.textContent = items.length ? `${kept} of ${items.length}` : '—';
}

/**
 * Whether a picture looks like it will go in untouched.
 *
 * A guess, and labelled as one: whether a JPEG can really be copied depends on
 * how it was encoded inside, which is only known once the whole file has been
 * read. The line under the finished PDF reports what actually happened.
 */
function likelyCopied(item, settings) {
  if (settings.mode !== 'keep') return false;
  if (settings.maxSide && Math.max(item.width, item.height) > settings.maxSide) return false;
  return /^image\/jpe?g$/i.test(item.file.type) || /\.jpe?g$/i.test(item.name);
}

function describePageSize(settings) {
  if (!items.length) return '—';
  if (settings.pageSize === 'fit') return 'matches each image';

  const named = PAGE_SIZES[settings.pageSize];
  const label = named
    ? `${trim(named[0])} × ${trim(named[1])} mm`
    : `${trim(settings.customWidth)} × ${trim(settings.customHeight)} ${settings.customUnit}`;

  if (settings.orientation === 'auto') {
    const upright = items.filter((item) => {
      const seen = seenSize(item);
      return seen.height >= seen.width;
    }).length;
    if (upright && upright < items.length) return `${label}, mixed`;
    return `${label}, ${upright ? 'portrait' : 'landscape'}`;
  }
  return `${label}, ${settings.orientation}`;
}

function trim(value) {
  return String(Math.round(Number(value) * 10) / 10);
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ------------------------------------------------------------------ export */

function showError(message) {
  el.error.textContent = message;
  el.error.hidden = false;
}

function clearError() {
  el.error.textContent = '';
  el.error.hidden = true;
}

function showLoadError(message) {
  el.loadError.textContent = message;
  el.loadError.hidden = false;
}

function clearLoadError() {
  el.loadError.textContent = '';
  el.loadError.hidden = true;
}

/** Drop a finished PDF, because the settings or the pages have moved on. */
function clearResult() {
  if (resultUrl) {
    URL.revokeObjectURL(resultUrl);
    resultUrl = null;
  }
  el.result.hidden = true;
  el.download.removeAttribute('href');
}

/** A file name that a file system will accept, from whatever was typed. */
function outputName() {
  const typed = el.fileName.value.trim().replace(/\.pdf$/i, '');
  const safe = typed.replace(/[\\/:*?"<>|]/g, '-').slice(0, 120).trim();
  return `${safe || 'images'}.pdf`;
}

async function runExport() {
  if (!items.length || exporting) return;

  exporting = true;
  cancelled = false;
  abortController = new AbortController();
  clearError();
  clearResult();
  el.exportBtn.disabled = true;
  el.cancelBtn.hidden = false;
  el.progressWrap.hidden = false;
  el.progressBar.style.width = '0%';
  el.progressLabel.textContent = 'Starting...';

  // The document is built from a copy of the queue, the way the Images to
  // Video tool hands its encoder one: buildDocument yields to the page between
  // pictures, and a queue edit landing in one of those gaps would shift the
  // list under the iteration - a page skipped, or written twice.
  const queue = items.map((item) => ({ ...item }));

  try {
    const { blob, pages, copied } = await buildDocument(queue, currentSettings(), {
      signal: abortController.signal,
      onProgress: ({ done, total, name }) => {
        el.progressBar.style.width = `${Math.round((done / total) * 100)}%`;
        el.progressLabel.textContent = done < total
          ? `Page ${done + 1} of ${total} ${name}`
          : 'Writing the document...';
      },
    });

    resultUrl = URL.createObjectURL(blob);
    el.download.href = resultUrl;
    el.download.download = outputName();
    el.resultInfo.textContent = `${pages} page${pages === 1 ? '' : 's'}, `
      + `${formatBytes(blob.size)}. `
      + (copied
        ? `${copied} of ${pages} put in exactly as ${copied === 1 ? 'it was' : 'they were'}.`
        : 'Every picture was encoded again for the document.');
    el.result.hidden = false;
  } catch (error) {
    cancelled = error?.name === 'AbortError';
    if (cancelled) el.progressLabel.textContent = 'Cancelled.';
    else showError(error?.message ?? String(error));
  } finally {
    exporting = false;
    abortController = null;
    el.cancelBtn.hidden = true;
    el.exportBtn.disabled = !items.length;
    // Left on screen after a cancel, so that pressing the button and then
    // changing your mind does not look like nothing happened.
    el.progressWrap.hidden = !cancelled;
  }
}

el.exportBtn.addEventListener('click', runExport);
el.cancelBtn.addEventListener('click', () => abortController?.abort());

window.addEventListener('beforeunload', (event) => {
  if (!exporting) return;
  event.preventDefault();
  event.returnValue = '';
});

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
// buymeacoffee.com and googleapis.com are here for the donate button in the
// header: its script comes from cdnjs.buymeacoffee.com and it pulls its
// lettering from fonts.googleapis.com and fonts.gstatic.com. Like the ad
// scripts, it is something the page loads without the visitor asking, and it
// is handed nothing - so it belongs in this bucket rather than being reported
// as an intruder.
const PLATFORM_HOSTS = /(^|\.)(googlesyndication\.com|doubleclick\.net|googleadservices\.com|googletagservices\.com|adtrafficquality\.google|googletagmanager\.com|google-analytics\.com|gstatic\.com|googleapis\.com|buymeacoffee\.com|cloudflareinsights\.com|google\.[a-z]{2,3}(\.[a-z]{2})?)$/;

/**
 * Report what this page has actually fetched.
 *
 * The claim on trial is not "this page is silent" - it is not silent, it
 * carries ads - but "nothing has carried your pictures away". That is the part
 * that matters, and the part a sceptical visitor can watch hold in real time.
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

/* -------------------------------------------------------------------- boot */

// An error thrown after boot would otherwise only reach the console, leaving
// the page looking functional but doing nothing.
window.addEventListener('error', (event) => {
  showError(phrase('error.broke', { detail: event.message }));
});
window.addEventListener('unhandledrejection', (event) => {
  showError(phrase('error.broke', { detail: event.reason?.message ?? event.reason }));
});

render();
monitorNetwork();
registerServiceWorker();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
