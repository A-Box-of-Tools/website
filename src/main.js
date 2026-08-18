/** UI wiring and application state. */

import { loadImages, decodeFull, releaseItem, sortItems, moveItem } from './images.js';
import { drawFrame, resolveOutputSize } from './compose.js';
import { encodeToMp4, countFrames } from './encoder.js';
import { recordToWebm } from './recorder.js';
import { hasWebCodecs, hasMediaRecorder } from './support.js';
import { fetchImages, parseImageUrl } from './remote.js';

const $ = (id) => document.getElementById(id);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  list: $('image-list'),
  listToolbar: $('list-toolbar'),
  reorderHint: $('reorder-hint'),
  urlInput: $('url-input'),
  fetchUrls: $('fetch-urls'),
  urlStatus: $('url-status'),
  countLabel: $('count-label'),
  clearAll: $('clear-all'),
  bulk: $('bulk-duration'),
  bulkAmount: $('bulk-amount'),
  durationUnit: $('duration-unit'),
  bulkNote: $('bulk-note'),
  applyBulk: $('apply-bulk'),
  resolution: $('resolution'),
  resolutionCustom: $('resolution-custom'),
  customWidth: $('custom-width'),
  customHeight: $('custom-height'),
  resolutionNote: $('resolution-note'),
  fps: $('fps'),
  fpsCustom: $('fps-custom'),
  fpsNote: $('fps-note'),
  fit: $('fit'),
  background: $('background'),
  backgroundField: $('background-field'),
  quality: $('quality'),
  format: $('format'),
  formatNote: $('format-note'),
  preview: $('preview'),
  previewEmpty: $('preview-empty'),
  sumImages: $('sum-images'),
  sumDuration: $('sum-duration'),
  sumSize: $('sum-size'),
  sumFrames: $('sum-frames'),
  exportBtn: $('export'),
  cancelBtn: $('cancel'),
  progressWrap: $('progress-wrap'),
  progressBar: $('progress-bar'),
  progressLabel: $('progress-label'),
  error: $('error'),
  result: $('result'),
  resultVideo: $('result-video'),
  resultInfo: $('result-info'),
  download: $('download'),
  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
  networkCount: $('network-count'),
  offlineStatus: $('offline-status'),
};

/** @type {object[]} */
let items = [];

/**
 * 'frames' or 'seconds'. Frames is the default: one frame per image turns a
 * folder of stills into a timelapse whose speed is set purely by the frame
 * rate, which is what an image sequence usually wants.
 */
let durationUnit = 'frames';

let exporting = false;
let abortController = null;
let lastResultUrl = null;
let previewToken = 0;

/* ------------------------------------------------------------------ adding */

const dropzoneTitle = el.dropzone.querySelector('.dropzone-title');

async function addFiles(files) {
  if (!files?.length) return;

  // Decoding a batch of large photos takes a few seconds, so say so rather
  // than leaving the drop zone looking inert.
  el.dropzone.classList.add('busy');
  dropzoneTitle.textContent = `Reading ${files.length} file${files.length === 1 ? '' : 's'}…`;

  try {
    const typed = Number(el.bulkAmount.value);
    const { items: loaded, skipped } = await loadImages(files, {
      frames: durationUnit === 'frames' && typed > 0 ? Math.round(typed) : 1,
      seconds: durationUnit === 'seconds' && typed > 0 ? typed : 3,
    });
    items = items.concat(loaded);

    if (skipped.length) {
      showError(`Skipped ${skipped.length} file(s) that could not be read as images: ${skipped.slice(0, 3).join(', ')}${skipped.length > 3 ? '…' : ''}`);
    } else {
      clearError();
    }
  } finally {
    el.dropzone.classList.remove('busy');
    dropzoneTitle.textContent = 'Drop images here';
  }

  render();
}

// No click handler here on purpose: the drop zone is a <label for="file-input">,
// so the browser opens the picker itself. Driving it from JS via input.click()
// on a display:none input is what broke this before.

el.fileInput.addEventListener('change', () => {
  // `input.files` is a live list and resetting `value` empties it, so take a
  // real array first. Clearing the input is what lets the same file be picked
  // twice in a row.
  const picked = Array.from(el.fileInput.files);
  el.fileInput.value = '';
  addFiles(picked);
});

for (const type of ['dragenter', 'dragover']) {
  el.dropzone.addEventListener(type, (event) => {
    event.preventDefault();
    el.dropzone.classList.add('dragover');
  });
}

for (const type of ['dragleave', 'drop']) {
  el.dropzone.addEventListener(type, () => el.dropzone.classList.remove('dragover'));
}

el.dropzone.addEventListener('drop', (event) => {
  event.preventDefault();
  addFiles(event.dataTransfer?.files);
});

// Dropping anywhere else on the page should not navigate away from the app.
window.addEventListener('dragover', (event) => event.preventDefault());
window.addEventListener('drop', (event) => event.preventDefault());

/* ------------------------------------------------------------ web addresses */

let fetching = false;

el.fetchUrls.addEventListener('click', async () => {
  if (fetching) return;

  const lines = el.urlInput.value.split('\n').map((s) => s.trim()).filter(Boolean);
  if (!lines.length) {
    el.urlStatus.textContent = 'Paste at least one address first.';
    return;
  }

  // Reject malformed addresses before touching the network at all.
  const valid = [];
  const rejected = [];
  for (const line of lines) {
    try {
      parseImageUrl(line);
      valid.push(line);
    } catch (error) {
      rejected.push(error.message);
    }
  }

  if (!valid.length) {
    showError(rejected.join(' '));
    el.urlStatus.textContent = 'Nothing to download.';
    return;
  }

  fetching = true;
  el.fetchUrls.disabled = true;
  clearError();

  try {
    const { downloaded, failures } = await fetchImages(valid, ({ done, total }) => {
      el.urlStatus.textContent = `Downloading ${Math.min(done + 1, total)} of ${total}...`;
    });

    el.urlStatus.textContent = downloaded.length
      ? `Downloaded ${downloaded.length} of ${valid.length}.`
      : 'Nothing could be downloaded.';

    if (downloaded.length) {
      const before = items.length;
      await addFiles(downloaded.map((d) => d.file));

      // Tag each new item with the address it actually came from. loadImages
      // can itself skip a file, so match on the File object rather than
      // assuming the two lists line up.
      for (let i = before; i < items.length; i++) {
        const origin = downloaded.find((d) => d.file === items[i].file);
        if (origin) {
          items[i].sourceUrl = origin.url.href;
          items[i].sourceHost = origin.url.hostname;
        }
      }
      render();
      el.urlInput.value = '';
    }

    const problems = [...rejected, ...failures.map((f) => `${f.url}: ${f.reason}`)];
    if (problems.length) showError(problems.join('\n'));
  } catch (error) {
    showError(error.message);
    el.urlStatus.textContent = 'Download failed.';
  } finally {
    fetching = false;
    el.fetchUrls.disabled = false;
  }
});

/* --------------------------------------------------------- image durations */

/** How long one item is on screen, in seconds, for the current unit and fps. */
function effectiveDuration(item, fps) {
  return durationUnit === 'frames'
    ? Math.max(1, Math.round(item.frames)) / fps
    : Math.max(0.05, item.seconds);
}

/**
 * Items with `duration` resolved to seconds. The encoders read that field, so
 * resolving here keeps the frames/seconds choice entirely in the UI layer.
 */
function resolvedItems(fps) {
  return items.map((item) => ({ ...item, duration: effectiveDuration(item, fps) }));
}

/* --------------------------------------------------------------- list view */

/** 'large' | 'small' | 'list' | 'details' */
let view = 'large';

let dragIndex = null;
/** Where the dragged item would land: { index, after } */
let dropAt = null;

function clearDropMarkers() {
  for (const node of el.list.querySelectorAll('.insert-before, .insert-after')) {
    node.classList.remove('insert-before', 'insert-after');
  }
}

/** Grid views insert left/right of a tile, row views insert above/below it. */
function isGridView() {
  return view === 'large' || view === 'small';
}

function buildItemNode(item, index) {
  const li = document.createElement('li');
  li.className = 'image-item';
  li.dataset.index = String(index);

  // A dedicated handle makes the gesture discoverable and keeps dragging from
  // fighting with the number input and buttons on the tile.
  const handle = document.createElement('button');
  handle.type = 'button';
  handle.className = 'drag-handle';
  handle.draggable = true;
  handle.textContent = '⋮⋮'; // two vertical ellipses, a grip
  handle.title = `Drag to reorder ${item.name}`;
  handle.setAttribute('aria-label', `Drag to reorder ${item.name}`);

  const thumbWrap = document.createElement('div');
  thumbWrap.className = 'thumb-wrap';
  thumbWrap.draggable = true;

  const img = document.createElement('img');
  img.src = item.thumbUrl;
  img.alt = item.name;
  // Images are natively draggable and this one covers the whole tile, so
  // without this the browser starts dragging the picture itself and the
  // reorder gesture never reaches the tile.
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
  meta.className = 'image-meta';

  const name = document.createElement('p');
  name.className = 'image-name';
  name.textContent = item.name;
  name.title = `${item.name} — ${item.width}×${item.height}`;
  meta.append(name);

  // Shown only in the details view; the markup stays uniform so switching
  // views is pure CSS and never rebuilds state.
  const dims = document.createElement('p');
  dims.className = 'image-dims';
  dims.textContent = `${item.width} × ${item.height} · ${formatBytes(item.file.size)}`;
  if (item.sourceUrl) {
    const source = document.createElement('span');
    source.className = 'image-source';
    source.textContent = ` · from ${item.sourceHost}`;
    source.title = item.sourceUrl;
    dims.append(source);
  }
  meta.append(dims);

  const controls = document.createElement('div');
  controls.className = 'image-controls';

  const inFrames = durationUnit === 'frames';

  const amount = document.createElement('input');
  amount.type = 'number';
  amount.min = inFrames ? '1' : '0.1';
  amount.max = inFrames ? '3600' : '60';
  amount.step = inFrames ? '1' : '0.1';
  amount.value = String(inFrames ? item.frames : item.seconds);
  amount.setAttribute('aria-label', inFrames
    ? `Frames to show ${item.name}`
    : `Seconds to show ${item.name}`);
  amount.addEventListener('change', () => {
    const value = Number(amount.value);
    if (inFrames) {
      item.frames = Number.isFinite(value) ? Math.min(3600, Math.max(1, Math.round(value))) : 1;
      amount.value = String(item.frames);
    } else {
      item.seconds = Number.isFinite(value) ? Math.min(60, Math.max(0.1, value)) : 3;
      amount.value = String(item.seconds);
    }
    updateSummary();
  });
  controls.append(amount);

  const unit = document.createElement('span');
  unit.className = 'unit';
  unit.textContent = inFrames ? 'fr' : 'sec';
  controls.append(unit);

  const left = document.createElement('button');
  left.type = 'button';
  left.className = 'move-btn';
  left.textContent = '‹';
  left.title = 'Move earlier';
  left.setAttribute('aria-label', `Move ${item.name} earlier`);
  left.disabled = index === 0;
  left.addEventListener('click', () => { moveItem(items, index, index - 1); render(); });
  controls.append(left);

  const right = document.createElement('button');
  right.type = 'button';
  right.className = 'move-btn';
  right.textContent = '›';
  right.title = 'Move later';
  right.setAttribute('aria-label', `Move ${item.name} later`);
  right.disabled = index === items.length - 1;
  right.addEventListener('click', () => { moveItem(items, index, index + 1); render(); });
  controls.append(right);

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
    const after = isGridView()
      ? event.clientX > rect.left + rect.width / 2
      : event.clientY > rect.top + rect.height / 2;

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

/** Move the dragged item to wherever the marker currently sits. */
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

function render() {
  el.list.replaceChildren(...items.map(buildItemNode));
  el.list.className = `image-list view-${view}`;

  const any = items.length > 0;
  el.listToolbar.hidden = !any;
  el.reorderHint.hidden = items.length < 2;
  el.bulk.hidden = !any;
  el.countLabel.textContent = `${items.length} image${items.length === 1 ? '' : 's'}`;
  el.exportBtn.disabled = !any || exporting;

  syncCustomControls();
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
  const typed = Number(el.bulkAmount.value);

  if (durationUnit === 'frames') {
    const frames = Number.isFinite(typed) ? Math.min(3600, Math.max(1, Math.round(typed))) : 1;
    el.bulkAmount.value = String(frames);
    for (const item of items) item.frames = frames;
  } else {
    const seconds = Number.isFinite(typed) ? Math.min(60, Math.max(0.1, typed)) : 3;
    el.bulkAmount.value = String(seconds);
    for (const item of items) item.seconds = seconds;
  }
  render();
});

/** Swap the bulk field between whole frames and fractional seconds. */
function syncDurationUnit() {
  durationUnit = el.durationUnit.value;
  const inFrames = durationUnit === 'frames';

  el.bulkAmount.min = inFrames ? '1' : '0.1';
  el.bulkAmount.max = inFrames ? '3600' : '60';
  el.bulkAmount.step = inFrames ? '1' : '0.1';

  const typed = Number(el.bulkAmount.value);
  el.bulkAmount.value = inFrames
    ? String(Number.isFinite(typed) ? Math.max(1, Math.round(typed)) : 1)
    : String(Number.isFinite(typed) ? Math.max(0.1, typed) : 3);
}

el.durationUnit.addEventListener('change', () => {
  syncDurationUnit();
  render(); // per-item inputs switch units too
});

/* ---------------------------------------------------------------- settings */

const FPS_MIN = 1;
const FPS_MAX = 120;

/** The effective frame rate, honouring the custom field and clamped to sane bounds. */
function currentFps() {
  const raw = el.fps.value === 'custom' ? Number(el.fpsCustom.value) : Number(el.fps.value);
  if (!Number.isFinite(raw) || raw <= 0) return 30;
  return Math.min(FPS_MAX, Math.max(FPS_MIN, Math.round(raw)));
}

function currentSettings() {
  const { width, height } = resolveOutputSize(el.resolution.value, items, {
    width: Number(el.customWidth.value),
    height: Number(el.customHeight.value),
  });

  return {
    width,
    height,
    fps: currentFps(),
    fit: el.fit.value,
    background: el.background.value,
    quality: el.quality.value,
    format: el.format.value,
  };
}

/**
 * Redraw the preview shortly after the user stops adjusting a setting.
 * Each redraw decodes a full-size image, so this avoids doing that once per
 * keystroke while somebody types a resolution.
 */
let previewTimer = 0;
function schedulePreview() {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(updatePreview, 150);
}

/** Show or hide the custom fields, and explain what the current choice means. */
function syncCustomControls() {
  el.fpsCustom.hidden = el.fps.value !== 'custom';
  el.resolutionCustom.hidden = el.resolution.value !== 'custom';

  if (el.fps.value === 'custom') {
    const typed = Number(el.fpsCustom.value);
    const used = currentFps();
    el.fpsNote.textContent = Number.isFinite(typed) && typed === used
      ? `${used} frames per second.`
      : `Using ${used} fps (allowed range ${FPS_MIN}-${FPS_MAX}).`;
  } else {
    el.fpsNote.textContent = '';
  }

  if (el.resolution.value === 'auto') {
    const { width, height } = currentSettings();
    el.resolutionNote.textContent = items.length
      ? `Matched to ${width} x ${height}. No image is scaled down.`
      : 'Matches the highest resolution among your images.';
  } else if (el.resolution.value === 'custom') {
    const { width, height } = currentSettings();
    el.resolutionNote.textContent = `Output ${width} x ${height} (rounded to even numbers).`;
  } else {
    el.resolutionNote.textContent = '';
  }
}

function formatDuration(seconds) {
  const whole = Math.round(seconds);
  const mins = Math.floor(whole / 60);
  const secs = whole % 60;
  return mins ? `${mins}m ${String(secs).padStart(2, '0')}s` : `${seconds.toFixed(1)}s`;
}

function updateSummary() {
  if (!items.length) {
    el.sumImages.textContent = '—';
    el.sumDuration.textContent = '—';
    el.sumSize.textContent = '—';
    el.sumFrames.textContent = '—';
    return;
  }

  const settings = currentSettings();
  const resolved = resolvedItems(settings.fps);
  const totalSeconds = resolved.reduce((sum, item) => sum + item.duration, 0);

  el.sumImages.textContent = String(items.length);
  el.sumDuration.textContent = formatDuration(totalSeconds);
  el.sumSize.textContent = `${settings.width} × ${settings.height}`;
  el.sumFrames.textContent = countFrames(resolved, settings.fps).toLocaleString();

  // In frames mode the running time follows the frame rate, which is not
  // obvious from the controls alone.
  el.bulkNote.textContent = durationUnit === 'frames'
    ? `at ${settings.fps} fps that is ${formatDuration(totalSeconds)} total`
    : '';
}

async function updatePreview() {
  const token = ++previewToken;

  if (!items.length) {
    el.preview.classList.add('empty');
    el.previewEmpty.hidden = false;
    return;
  }

  const settings = currentSettings();
  const width = 640;
  const height = Math.max(2, Math.round(width * settings.height / settings.width));
  el.preview.width = width;
  el.preview.height = height;

  const ctx = el.preview.getContext('2d', { alpha: false });

  let bitmap;
  try {
    bitmap = await decodeFull(items[0]);
  } catch {
    return;
  }

  // A newer preview started while this one was decoding — discard this result.
  if (token !== previewToken) {
    bitmap.close();
    return;
  }

  try {
    drawFrame(ctx, bitmap, { fit: settings.fit, background: settings.background });
    el.preview.classList.remove('empty');
    el.previewEmpty.hidden = true;
  } finally {
    bitmap.close();
  }
}

el.format.addEventListener('change', updateFormatNote);

const settingsInputs = [
  el.resolution, el.customWidth, el.customHeight,
  el.fps, el.fpsCustom,
  el.fit, el.background, el.quality,
];

for (const input of settingsInputs) {
  // 'input' as well as 'change' so typing in the number fields updates live.
  for (const type of ['change', 'input']) {
    input.addEventListener(type, () => {
      // The backdrop colour is only visible when the image is letterboxed.
      el.backgroundField.style.visibility = el.fit.value === 'contain' ? 'visible' : 'hidden';
      syncCustomControls();
      updateSummary();
      schedulePreview();
    });
  }
}

/** The WebM path records in real time and needs the tab to stay in front. */
function updateFormatNote() {
  const usingWebm = el.format.value === 'webm' || !hasWebCodecs();

  if (!hasWebCodecs() && !hasMediaRecorder()) {
    el.formatNote.textContent = 'This browser cannot encode video. Try a recent Chrome, Edge, or Safari.';
    return;
  }

  el.formatNote.textContent = usingWebm
    ? 'Records in real time — keep this tab visible until it finishes.'
    : 'Encodes faster than real time. Works in the background.';
}

function initFormatNote() {
  el.backgroundField.style.visibility = el.fit.value === 'contain' ? 'visible' : 'hidden';

  if (!hasWebCodecs()) {
    if (hasMediaRecorder()) {
      el.format.value = 'webm';
      el.format.querySelector('option[value="auto"]').disabled = true;
    } else {
      el.exportBtn.disabled = true;
    }
  }

  updateFormatNote();
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

function setProgress({ phase, done, total, realtime }) {
  const fraction = total > 0 ? Math.min(1, done / total) : 0;
  el.progressBar.style.width = `${(fraction * 100).toFixed(1)}%`;

  if (phase === 'preparing') {
    el.progressLabel.textContent = 'Preparing…';
  } else if (phase === 'finishing') {
    el.progressLabel.textContent = 'Finishing up…';
  } else if (realtime) {
    el.progressLabel.textContent =
      `Recording in real time — ${formatDuration(done)} of ${formatDuration(total)} (${Math.round(fraction * 100)}%)`;
  } else {
    el.progressLabel.textContent =
      `Encoding frame ${done.toLocaleString()} of ${total.toLocaleString()} (${Math.round(fraction * 100)}%)`;
  }
}

function outputFilename(extension) {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
  return `slideshow-${stamp}.${extension}`;
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function runExport() {
  if (exporting || !items.length) return;

  clearError();
  exporting = true;
  abortController = new AbortController();

  el.exportBtn.disabled = true;
  el.cancelBtn.hidden = false;
  el.progressWrap.hidden = false;
  el.result.hidden = true;
  setProgress({ phase: 'preparing', done: 0, total: 1 });

  const settings = currentSettings();
  const useMp4 = settings.format !== 'webm' && hasWebCodecs();

  try {
    const run = useMp4 ? encodeToMp4 : recordToWebm;
    const { blob, extension, codec, warning } = await run({
      items: resolvedItems(settings.fps),
      settings,
      onProgress: setProgress,
      signal: abortController.signal,
    });

    if (warning) showError(warning);

    if (lastResultUrl) URL.revokeObjectURL(lastResultUrl);
    lastResultUrl = URL.createObjectURL(blob);

    el.resultVideo.src = lastResultUrl;
    el.download.href = lastResultUrl;
    el.download.download = outputFilename(extension);
    el.resultInfo.textContent =
      `${extension.toUpperCase()} · ${settings.width}×${settings.height} · ${settings.fps} fps · ${formatBytes(blob.size)} · ${codec}`;
    el.result.hidden = false;
    el.progressWrap.hidden = true;
    el.result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) {
    el.progressWrap.hidden = true;
    if (error?.name !== 'AbortError') {
      showError(error?.message || 'Something went wrong while creating the video.');
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

/**
 * Report what this page has actually fetched. Every entry should be a file
 * from this origin, loaded before the app started; blob: URLs are local
 * object URLs and never touch the network. If anything else ever appears
 * here, that is worth knowing about.
 */
function monitorNetwork() {
  const external = new Set();

  const inspect = (entries) => {
    for (const entry of entries) {
      if (entry.name.startsWith('blob:') || entry.name.startsWith('data:')) continue;
      if (new URL(entry.name, location.href).origin !== location.origin) external.add(entry.name);
    }
    const total = performance.getEntriesByType('resource')
      .filter((e) => !e.name.startsWith('blob:') && !e.name.startsWith('data:')).length;

    el.networkCount.textContent = external.size === 0
      ? `${total} — all from this site, none to any third party`
      : `${external.size} third-party request(s) detected: ${[...external].join(', ')}`;
    el.networkCount.className = external.size === 0 ? 'good' : 'warn';
  };

  inspect(performance.getEntriesByType('resource'));
  try {
    new PerformanceObserver((list) => inspect(list.getEntries())).observe({ type: 'resource', buffered: true });
  } catch {
    // PerformanceObserver is unavailable; the one-time snapshot above still stands.
  }
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    el.offlineStatus.textContent = 'Not available in this browser (the app still works while online).';
    return;
  }
  // Service workers need a secure context, so file:// and plain http:// are out.
  if (!window.isSecureContext) {
    el.offlineStatus.textContent = 'Needs https:// or localhost — serve the folder over one to enable offline use.';
    return;
  }

  try {
    await navigator.serviceWorker.register('sw.js');
    await navigator.serviceWorker.ready;
    el.offlineStatus.textContent = 'Ready — this app now works with the network switched off.';
    el.offlineStatus.className = 'good';
  } catch (error) {
    el.offlineStatus.textContent = `Could not be enabled: ${error.message}`;
  }
}

/* -------------------------------------------------------------------- boot */

// An error thrown after boot would otherwise only reach the console, leaving
// the page looking functional but doing nothing.
window.addEventListener('error', (event) => {
  showError(`Something broke: ${event.message}. Reload the page to start over.`);
});
window.addEventListener('unhandledrejection', (event) => {
  showError(`Something broke: ${event.reason?.message ?? event.reason}. Reload the page to start over.`);
});

initFormatNote();
syncDurationUnit();
syncCustomControls();
render();
monitorNetwork();
registerServiceWorker();

// Reached only if every step above ran without throwing.
document.getElementById("boot-warning")?.remove();
