/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { wireFilePicker, readingLabel } from './shared/file-picker.js';
import {
  loadImages, releaseItem, sortItems, moveItem, decodeFull,
  clampDelay, DEFAULT_DELAY, MIN_DELAY, MAX_DELAY,
} from './images.js';
import { drawFrame, resolveOutputSize, MAX_SIDE } from './compose.js';
import { encodeGif, loopValue } from './encode.js';

const $ = (id) => document.getElementById(id);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  list: $('frame-list'),
  listToolbar: $('list-toolbar'),
  reorderHint: $('reorder-hint'),
  countLabel: $('count-label'),
  clearAll: $('clear-all'),
  bulk: $('bulk-delay'),
  bulkAmount: $('bulk-amount'),
  bulkUnit: $('bulk-unit'),
  bulkNote: $('bulk-note'),
  applyBulk: $('apply-bulk'),
  size: $('size'),
  sizeCustom: $('size-custom'),
  customWidth: $('custom-width'),
  customHeight: $('custom-height'),
  sizeNote: $('size-note'),
  fit: $('fit'),
  background: $('background'),
  backgroundField: $('background-field'),
  colors: $('colors'),
  paletteMode: $('palette-mode'),
  paletteNote: $('palette-note'),
  dither: $('dither'),
  loopMode: $('loop-mode'),
  loopTimes: $('loop-times'),
  transparent: $('transparent'),
  transparentNote: $('transparent-note'),
  previewFrame: $('preview-frame'),
  preview: $('preview'),
  previewEmpty: $('preview-empty'),
  sumFrames: $('sum-frames'),
  sumDuration: $('sum-duration'),
  sumSize: $('sum-size'),
  sumLoop: $('sum-loop'),
  exportBtn: $('export'),
  cancelBtn: $('cancel'),
  progress: $('progress'),
  progressBar: $('progress-bar'),
  progressLabel: $('progress-label'),
  error: $('error'),
  result: $('result'),
  resultImage: $('result-image'),
  resultInfo: $('result-info'),
  download: $('download'),
  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
  networkCount: $('network-count'),
  networkDot: $('network-dot'),
  offlineStatus: $('offline-status'),
  offlineDot: $('offline-dot'),
};

/** @type {object[]} */
let items = [];

let exporting = false;
let abortController = null;
let lastResultUrl = null;
let previewToken = 0;

/* ------------------------------------------------------------------ adding */

// The drop zone and the picker: shared, because every tool here needs the same
// one. src/shared/file-picker.js, copied in from shared/js/ by the build. The
// resting label comes off the markup, so it is written once, in this tool.toml,
// rather than here as well.
const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles(files) {
    addFiles(files);
  },
});

async function addFiles(files) {
  if (!files?.length) return;

  // Decoding a batch of large photos takes a few seconds, so say so rather than
  // leaving the drop zone looking inert.
  picker.busy(readingLabel(files.length));

  try {
    const { items: loaded, skipped } = await loadImages(files, defaultDelay());
    items = items.concat(loaded);

    if (skipped.length) {
      // The names are a list, and a list separator is a phrase: not every
      // language puts a comma and a space between two of them.
      const names = skipped.slice(0, 3)
        .reduce((a, b) => phrase('join.comma', { a, b }));
      showError(phrase(skipped.length === 1 ? 'read.skipped.one' : 'read.skipped.many', {
        n: skipped.length,
        names: skipped.length > 3 ? phrase('list.more', { names }) : names,
      }));
    } else {
      clearError();
    }
  } finally {
    picker.done();
  }

  render();
}

/** The bulk field read as seconds, in whichever unit is being asked about. */
function defaultDelayFrom(unit) {
  const typed = Number(el.bulkAmount.value);
  if (!Number.isFinite(typed) || typed <= 0) return DEFAULT_DELAY;
  return clampDelay(unit === 'fps' ? 1 / typed : typed);
}

/** What a newly added frame is held for: whatever the bulk field currently says. */
const defaultDelay = () => defaultDelayFrom(el.bulkUnit.value);

/* --------------------------------------------------------------- list view */

/** 'large' | 'small' */
let view = 'large';

let dragIndex = null;
/** Where the dragged frame would land: { index, after } */
let dropAt = null;

function clearDropMarkers() {
  for (const node of el.list.querySelectorAll('.insert-before, .insert-after')) {
    node.classList.remove('insert-before', 'insert-after');
  }
}

function buildItemNode(item, index) {
  const li = document.createElement('li');
  li.className = 'frame-item';
  li.dataset.index = String(index);

  // A dedicated handle makes the gesture discoverable and keeps dragging from
  // fighting with the number input and the buttons on the tile.
  const handle = document.createElement('button');
  handle.type = 'button';
  handle.className = 'drag-handle';
  handle.draggable = true;
  handle.textContent = '⋮⋮'; // two vertical ellipses, a grip
  const dragLabel = phrase('tile.drag', { name: item.name });
  handle.title = dragLabel;
  handle.setAttribute('aria-label', dragLabel);

  const thumbWrap = document.createElement('div');
  thumbWrap.className = 'thumb-wrap';
  thumbWrap.draggable = true;

  const img = document.createElement('img');
  img.src = item.thumbUrl;
  img.alt = item.name;
  // Images are natively draggable and this one covers the whole tile, so
  // without this the browser starts dragging the picture itself and the reorder
  // gesture never reaches the tile.
  img.draggable = false;
  thumbWrap.append(img);

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
    releaseItem(item);
    items.splice(index, 1);
    render();
  });
  thumbWrap.append(remove);

  const meta = document.createElement('div');
  meta.className = 'frame-meta';

  const name = document.createElement('p');
  name.className = 'frame-name';
  name.textContent = item.name;
  name.title = `${item.name} — ${item.width}×${item.height}`;
  meta.append(name);

  const controls = document.createElement('div');
  controls.className = 'frame-controls';

  const amount = document.createElement('input');
  amount.type = 'number';
  amount.min = String(MIN_DELAY);
  amount.max = String(MAX_DELAY);
  amount.step = '0.05';
  amount.value = String(item.delay);
  amount.setAttribute('aria-label', phrase('tile.delay', { name: item.name }));
  amount.addEventListener('change', () => {
    item.delay = clampDelay(amount.value);
    amount.value = String(item.delay);
    updateSummary();
  });
  controls.append(amount);

  const unit = document.createElement('span');
  unit.className = 'unit';
  unit.textContent = 'sec';
  controls.append(unit);

  const earlier = document.createElement('button');
  earlier.type = 'button';
  earlier.className = 'move-btn';
  earlier.textContent = '‹';
  earlier.title = 'Move earlier';
  earlier.setAttribute('aria-label', `Move ${item.name} earlier`);
  earlier.disabled = index === 0;
  earlier.addEventListener('click', () => { moveItem(items, index, index - 1); render(); });
  controls.append(earlier);

  const later = document.createElement('button');
  later.type = 'button';
  later.className = 'move-btn';
  later.textContent = '›';
  later.title = 'Move later';
  later.setAttribute('aria-label', `Move ${item.name} later`);
  later.disabled = index === items.length - 1;
  later.addEventListener('click', () => { moveItem(items, index, index + 1); render(); });
  controls.append(later);

  meta.append(controls);
  li.append(handle, thumbWrap, meta);

  const startDrag = (event) => {
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

/** Move the dragged frame to wherever the marker currently sits. */
function applyDrop() {
  if (dragIndex === null || dropAt === null) {
    clearDropMarkers();
    return;
  }

  let target = dropAt.after ? dropAt.index + 1 : dropAt.index;
  // Removing the frame first shifts everything after it down by one.
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

function render() {
  el.list.replaceChildren(...items.map(buildItemNode));
  el.list.className = `frame-list view-${view}`;

  const any = items.length > 0;
  el.listToolbar.hidden = !any;
  el.reorderHint.hidden = items.length < 2;
  el.bulk.hidden = !any;
  el.countLabel.textContent = phrase(items.length === 1 ? 'n.frame.one' : 'n.frame.many',
    { n: items.length });
  el.exportBtn.disabled = !any || exporting;

  syncSettingControls();
  updateSummary();
  updatePreview();
}

for (const button of document.querySelectorAll('[data-sort]')) {
  button.addEventListener('click', () => {
    sortItems(items, button.dataset.sort);
    render();
  });
}

for (const button of document.querySelectorAll('[data-view]')) {
  button.addEventListener('click', () => {
    view = button.dataset.view;
    for (const other of document.querySelectorAll('[data-view]')) {
      other.classList.toggle('active', other === button);
      other.setAttribute('aria-pressed', String(other === button));
    }
    render();
  });
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

el.clearAll.addEventListener('click', () => {
  if (!items.length) return;
  for (const item of items) releaseItem(item);
  items = [];
  render();
});

el.applyBulk.addEventListener('click', () => {
  const delay = defaultDelay();
  for (const item of items) item.delay = delay;
  render();
});

/**
 * Switch the bulk field between seconds and frames a second.
 *
 * The number is rewritten rather than left alone, because the same digits mean
 * opposite things in the two units - "12" is a twelfth of a minute in one and
 * twelve frames a second in the other - and a field that silently changed
 * meaning under somebody's cursor would apply a two-hundredth of a second to
 * every frame.
 */
el.bulkUnit.addEventListener('change', () => {
  const seconds = defaultDelayFrom(el.bulkUnit.value === 'fps' ? 'seconds' : 'fps');
  const toFps = el.bulkUnit.value === 'fps';

  el.bulkAmount.min = toFps ? '1' : String(MIN_DELAY);
  el.bulkAmount.max = toFps ? String(Math.round(1 / MIN_DELAY)) : String(MAX_DELAY);
  el.bulkAmount.step = toFps ? '1' : '0.05';
  el.bulkAmount.value = toFps
    ? String(Math.min(50, Math.max(1, Math.round(1 / seconds))))
    : String(seconds);
});

/* ---------------------------------------------------------------- settings */

function currentSettings() {
  const { width, height } = resolveOutputSize(el.size.value, items, {
    width: Number(el.customWidth.value),
    height: Number(el.customHeight.value),
  });

  const mode = el.loopMode.value;

  return {
    width,
    height,
    fit: el.fit.value,
    background: el.background.value,
    colors: Number(el.colors.value),
    dither: el.dither.value === 'on',
    sharedPalette: el.paletteMode.value === 'shared',
    transparent: el.transparent.value === 'on',
    loop: loopValue(mode, el.loopTimes.value),
    loopMode: mode,
  };
}

/**
 * Redraw the preview shortly after the user stops adjusting a setting. Each
 * redraw decodes a full-size image, so this avoids doing that once per keystroke
 * while somebody types a size.
 */
let previewTimer = 0;
function schedulePreview() {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(updatePreview, 150);
}

/** Show or hide the conditional fields, and explain what the choices mean. */
function syncSettingControls() {
  el.sizeCustom.hidden = el.size.value !== 'custom';
  el.loopTimes.hidden = el.loopMode.value !== 'times';

  const settings = currentSettings();

  // The backdrop is only visible where the picture does not reach, and only
  // painted at all when transparency is being flattened away.
  el.backgroundField.style.visibility =
    el.fit.value === 'contain' && !settings.transparent ? 'visible' : 'hidden';

  if (el.size.value === 'custom') {
    el.sizeNote.textContent = phrase('size.custom',
      { width: settings.width, height: settings.height, max: MAX_SIDE });
  } else if (items.length) {
    el.sizeNote.textContent = phrase('size.each',
      { width: settings.width, height: settings.height });
  } else {
    el.sizeNote.textContent = phrase('size.fromimages');
  }

  el.paletteNote.textContent = phrase(settings.sharedPalette
    ? 'note.shared' : 'note.sharp');

  el.transparentNote.textContent = settings.transparent
    ? phrase('note.transparent')
    : '';

  // A transparent frame is drawn over a chequerboard rather than over the
  // backdrop colour it is no longer using.
  el.previewFrame.classList.toggle('checkered', settings.transparent);
}

/** The dash a summary row shows when there is nothing to summarise. */
const EMPTY = '\u2014';

function formatDuration(seconds) {
  const whole = Math.round(seconds);
  const mins = Math.floor(whole / 60);
  const secs = whole % 60;
  return mins
    ? phrase('time.minutes', { minutes: mins, seconds: String(secs).padStart(2, '0') })
    : phrase('time.seconds', { n: seconds.toFixed(2) });
}

function updateSummary() {
  if (!items.length) {
    el.sumFrames.textContent = EMPTY;
    el.sumDuration.textContent = EMPTY;
    el.sumSize.textContent = EMPTY;
    el.sumLoop.textContent = EMPTY;
    el.bulkNote.textContent = '';
    return;
  }

  const settings = currentSettings();
  const total = items.reduce((sum, item) => sum + item.delay, 0);

  el.sumFrames.textContent = String(items.length);
  el.sumDuration.textContent = formatDuration(total);
  el.sumSize.textContent = phrase('size.plain',
    { width: settings.width, height: settings.height });
  el.sumLoop.textContent = settings.loopMode === 'forever'
    ? phrase('loop.forever')
    : (settings.loopMode === 'once'
      ? phrase('loop.once')
      : phrase(settings.loop === 1 ? 'loop.times.one' : 'loop.times.many',
        { n: settings.loop }));

  const each = total / items.length;
  el.bulkNote.textContent = phrase('bulk.note',
    { total: formatDuration(total), fps: (1 / each).toFixed(1) });
}

async function updatePreview() {
  const token = ++previewToken;

  if (!items.length) {
    el.preview.classList.add('empty');
    el.previewEmpty.hidden = false;
    return;
  }

  const settings = currentSettings();
  el.preview.width = settings.width;
  el.preview.height = settings.height;

  const ctx = el.preview.getContext('2d');

  let bitmap;
  try {
    bitmap = await decodeFull(items[0]);
  } catch {
    return;
  }

  // A newer preview started while this one was decoding - discard this result.
  if (token !== previewToken) {
    bitmap.close();
    return;
  }

  try {
    // The preview shows the framing rather than the palette: quantizing it as
    // well would mean doing the expensive half of the export on every keystroke,
    // and the colours are the one thing the finished GIF below shows honestly.
    drawFrame(ctx, bitmap, {
      fit: settings.fit,
      background: settings.transparent ? null : settings.background,
    });
    el.preview.classList.remove('empty');
    el.previewEmpty.hidden = true;
  } finally {
    bitmap.close();
  }
}

const settingsInputs = [
  el.size, el.customWidth, el.customHeight,
  el.fit, el.background, el.colors, el.paletteMode, el.dither,
  el.loopMode, el.loopTimes, el.transparent,
];

for (const input of settingsInputs) {
  // 'input' as well as 'change' so typing in the number fields updates live.
  for (const type of ['change', 'input']) {
    input.addEventListener(type, () => {
      syncSettingControls();
      updateSummary();
      schedulePreview();
    });
  }
}

/* ------------------------------------------------------------------ export */

function showError(message) {
  el.error.textContent = message;
  el.error.hidden = false;
}

function clearError() {
  el.error.hidden = true;
  el.error.textContent = '';
}

function setProgress({ phase, done, total }) {
  const fraction = total > 0 ? Math.min(1, done / total) : 0;
  el.progressBar.style.width = `${(fraction * 100).toFixed(1)}%`;

  // The whole sentence is named, not a verb glued in front of a count: where
  // that verb falls in the line is not the same in every language.
  el.progressLabel.textContent = phrase(
    phase === 'palette' ? 'step.palette' : 'step.frames',
    {
      done: done.toLocaleString(),
      total: total.toLocaleString(),
      percent: Math.round(fraction * 100),
    },
  );
}

function outputFilename() {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
  return `animation-${stamp}.gif`;
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return phrase('size.kb', { n: (bytes / 1024).toFixed(0) });
  return phrase('size.mb', { n: (bytes / 1024 / 1024).toFixed(1) });
}

async function runExport() {
  if (exporting || !items.length) return;

  clearError();
  exporting = true;
  abortController = new AbortController();

  el.exportBtn.disabled = true;
  el.cancelBtn.hidden = false;
  el.progress.hidden = false;
  el.result.hidden = true;
  setProgress({ phase: 'palette', done: 0, total: 1 });

  const settings = currentSettings();

  try {
    const { blob, frames } = await encodeGif({
      items,
      settings,
      onProgress: setProgress,
      signal: abortController.signal,
    });

    if (lastResultUrl) URL.revokeObjectURL(lastResultUrl);
    lastResultUrl = URL.createObjectURL(blob);

    el.resultImage.src = lastResultUrl;
    el.download.href = lastResultUrl;
    el.download.download = outputFilename();
    el.resultInfo.textContent = [
      'GIF',
      phrase('size.plain', { width: settings.width, height: settings.height }),
      phrase(frames === 1 ? 'n.frame.one' : 'n.frame.many', { n: frames }),
      formatBytes(blob.size),
    ].reduce((a, b) => phrase('join.dot', { a, b }));
    el.result.hidden = false;
    el.progress.hidden = true;
    el.result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) {
    el.progress.hidden = true;
    if (error?.name !== 'AbortError') {
      // The writer's invariant checks are bugs here rather than anything a
      // file can cause, and phrase() hands back what it does not recognise.
      showError(error?.message ? phrase(error.message) : phrase('export.failed'));
      console.error(error);
    }
  } finally {
    exporting = false;
    abortController = null;
    el.cancelBtn.hidden = true;
    el.exportBtn.disabled = items.length === 0;
  }
}

el.exportBtn.addEventListener('click', runExport);
el.cancelBtn.addEventListener('click', () => abortController?.abort());

window.addEventListener('beforeunload', (event) => {
  if (!exporting) return;
  event.preventDefault();
  event.returnValue = ''; // still required by some browsers to trigger the prompt
});

/* ------------------------------------------------- privacy panel + offline */

el.privacyToggle.addEventListener('click', () => {
  const open = el.privacyPanel.hidden;
  el.privacyPanel.hidden = !open;
  el.privacyToggle.setAttribute('aria-expanded', String(open));
});

// Hosts belonging to the ad, measurement and donate-button scripts. Kept
// separate from anything else rather than lumped in with it, because the two
// mean entirely different things: these carry nothing about your images, and
// this tool has no feature that fetches anything at all - so anything outside
// this list appearing in the panel is worth knowing about.
// cloudflareinsights.com is here because the host injects its own beacon into
// the page. The CSP blocks it from running, but a blocked script still leaves a
// resource timing entry, and an unknown host in that list would be reported as
// an intruder - which would be a false statement on the one panel that exists
// to be checked. Anything the page can pull in without the user asking belongs
// in this list, whether or not it is allowed to execute.
// google.com is written as a pattern because Google's measurement pixel uses
// the visitor's own country domain - www.google.ca, www.google.co.uk - and a
// list of literal hostnames turns the panel red for a visitor in the wrong
// country. That is the worst possible failure for this particular panel: the
// one place on the page meant to be checkable, saying something untrue.
// buymeacoffee.com and googleapis.com are here for the donate button in the
// header: the button's script comes from cdnjs.buymeacoffee.com and it pulls
// its lettering from fonts.googleapis.com and fonts.gstatic.com.
const PLATFORM_HOSTS = /(^|\.)(googlesyndication\.com|doubleclick\.net|googleadservices\.com|googletagservices\.com|adtrafficquality\.google|googletagmanager\.com|google-analytics\.com|gstatic\.com|googleapis\.com|buymeacoffee\.com|cloudflareinsights\.com|google\.[a-z]{2,3}(\.[a-z]{2})?)$/;

/**
 * Report what this page has actually fetched, split two ways: files from this
 * origin, and advertising.
 *
 * The claim on trial here is not "this page is silent" - it is not silent, it
 * carries ads - but "nothing has carried your images away". That is the part
 * that matters, and the part a sceptical visitor can watch hold in real time.
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
      .filter((e) => !e.name.startsWith('blob:') && !e.name.startsWith('data:')).length;

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
    new PerformanceObserver((list) => inspect(list.getEntries())).observe({ type: 'resource', buffered: true });
  } catch {
    // PerformanceObserver is unavailable; the one-time snapshot above still stands.
  }
}

async function registerServiceWorker() {
  // Keep the visible text short: this sits in the trust panel, and a raw browser
  // error dumped there reads worse than it is. Detail goes in the tooltip and
  // the console for anyone debugging.
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
    // Caching is an optimisation, not the privacy guarantee. Everything the page
    // claims still holds when this fails, so say so rather than alarming.
    fail(phrase('offline.failed'), error.message);
  }
}

/* -------------------------------------------------------------------- boot */

// An error thrown after boot would otherwise only reach the console, leaving the
// page looking functional but doing nothing.
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
document.getElementById("boot-warning")?.remove();
