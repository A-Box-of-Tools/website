import { phrase, ltr } from './shared/phrases.js';
import { wireFilePicker, readingLabel } from './shared/file-picker.js';
import { loadImages, releaseItem, moveItem, sortItems } from './shared/image-list.js';
import { encode, canEncode, FORMATS, PNG, JPEG, WEBP } from './shared/image-convert.js';
import { downloadLink } from './shared/download.js';
import { sizeText } from './shared/format.js';
import { messageBox } from './shared/message-box.js';
import { arrange, drawImageInCell, imagePlacement, renderLayout } from './arrange.js';
import { makeExample } from './example.js';
import { PRESETS } from './presets.js';

const $ = (id) => document.getElementById(id);
const loadError = messageBox($('load-error'));
const layoutError = messageBox($('layout-error'));
const exportError = messageBox($('export-error'));
const download = downloadLink($('download'));
const settingsIds = ['layout', 'columns', 'output-width', 'ratio', 'fit', 'gap',
  'padding', 'background', 'transparent', 'format', 'quality', 'filename'];

let items = [];
let importing = false;
let exporting = false;
let importQueue = Promise.resolve();
let controller = null;
let previewToken = 0;
let previewTimer = null;
let dragId = null;
let selectedId = null;
let frameDrag = null;
let previewPlan = null;
let previewSettings = null;
const previewImages = new Map();

const freshTransform = () => ({ zoom: 1, panX: 0, panY: 0 });
const selectedItem = () => items.find((item) => item.id === selectedId);
const clampPan = (value) => Math.max(-1, Math.min(1, value));

function releasePreview(item) {
  previewImages.get(item.id)?.close();
  previewImages.delete(item.id);
}

const picker = wireFilePicker({
  input: $('file-input'), dropzone: $('dropzone'), example: makeExample,
  onFiles(files) {
    // A second drop waits for the first decode, so files arrive in the order
    // they were chosen even when the first batch contains large photographs.
    importQueue = importQueue.then(() => addFiles(files));
  },
});

function clearResult() {
  download.clear();
  $('result').hidden = true;
  exportError.clear();
}

function currentSettings() {
  return {
    layout: $('layout').value,
    width: Number($('output-width').value),
    columns: $('layout').value === 'grid' ? Number($('columns').value) : 1,
    ratio: $('ratio').value,
    fit: $('fit').value,
    gap: Number($('gap').value),
    padding: Number($('padding').value),
    background: $('background').value,
    transparent: $('transparent').checked && $('format').value !== JPEG,
  };
}

function geometry(settings = currentSettings()) {
  const ids = ['output-width', 'gap', 'padding'];
  if (settings.layout === 'grid') ids.push('columns');
  for (const id of ids) {
    if (!$(id).value || !$(id).checkValidity()) throw new RangeError('errorSettings');
  }
  return arrange(items, settings);
}

function syncControls() {
  const busy = importing || exporting;
  if (busy) frameDrag = null;
  for (const input of document.querySelectorAll('main input, main select, main button')) {
    if (input.id !== 'cancel') input.disabled = busy;
  }
  const grid = $('layout').value === 'grid';
  $('columns-field').hidden = !grid;
  $('ratio').querySelector('[value="original"]').disabled = grid;
  if (grid && $('ratio').value === 'original') $('ratio').value = 'square';
  const original = $('ratio').value === 'original';
  $('fit').disabled = busy || original;
  const jpeg = $('format').value === JPEG;
  $('transparent').disabled = busy || jpeg;
  $('background').disabled = busy || (!jpeg && $('transparent').checked);
  $('quality-field').hidden = $('format').value === PNG;
  $('quality-label').textContent = `${$('quality').value}%`;
  $('background-note').textContent = phrase(jpeg ? 'background.jpeg'
    : $('transparent').checked ? 'background.alpha' : 'background.solid');
  $('cancel').hidden = !exporting;
  $('cancel').disabled = false;
  let valid = false;
  try { valid = Boolean(geometry()); } catch { /* The layout error explains it. */ }
  $('export').disabled = busy || !valid;
  for (const button of $('image-list').querySelectorAll('button')) {
    button.disabled = busy || button.dataset.edge === 'yes';
  }
  for (const tile of $('image-list').children) tile.draggable = !busy;
  syncFrameControls();
}

async function addFiles(files) {
  if (exporting) return;
  importing = true;
  ++previewToken;
  for (const item of items) releasePreview(item);
  clearResult();
  syncControls();
  picker.busy(readingLabel(files.length));
  loadError.clear();
  try {
    const loaded = await loadImages(files, { thumbMax: 240, fields: () => ({ transform: freshTransform() }) });
    items.push(...loaded.items);
    if (loaded.skipped.length) {
      loadError.show(phrase('skipped', {
        n: loaded.skipped.length,
        names: new Intl.ListFormat(document.documentElement.lang, { style: 'short', type: 'conjunction' }).format(loaded.skipped),
      }));
    }
  } catch {
    loadError.show(phrase('error.read'));
  } finally {
    importing = false;
    picker.done();
    renderList();
    refresh();
    if (!items.length) picker.waiting();
  }
}

function tileButton(symbol, key, item, edge, action) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'ghost';
  button.textContent = symbol;
  button.title = phrase(key, { name: item.name });
  button.setAttribute('aria-label', button.title);
  button.dataset.edge = edge ? 'yes' : 'no';
  button.dataset.action = key;
  button.disabled = edge;
  button.addEventListener('click', action);
  return button;
}

function editOrder(item, offset) {
  const at = items.indexOf(item);
  moveItem(items, at, at + offset);
  clearResult();
  renderList();
  refresh();
  const key = offset < 0 ? 'move.earlier' : 'move.later';
  const tile = $('image-list').querySelector(`[data-id="${item.id}"]`);
  const wanted = tile?.querySelector(`[data-action="${key}"]`);
  (wanted?.disabled ? tile.querySelector('button:not(:disabled)') : wanted)?.focus();
}

function renderList() {
  $('image-list').replaceChildren(...items.map((item, index) => {
    const tile = document.createElement('li');
    tile.className = 'image-tile';
    tile.dataset.id = item.id;
    tile.draggable = true;
    const image = document.createElement('img');
    image.src = item.thumbUrl;
    image.alt = '';
    image.draggable = false;
    const info = document.createElement('div');
    info.className = 'tile-info';
    const name = document.createElement('p');
    name.className = 'tile-name';
    name.textContent = item.name;
    const size = document.createElement('p');
    size.className = 'tile-size';
    size.textContent = dimensions(item.width, item.height);
    const actions = document.createElement('div');
    actions.className = 'tile-actions';
    actions.append(
      tileButton('←', 'move.earlier', item, index === 0, () => editOrder(item, -1)),
      tileButton('→', 'move.later', item, index === items.length - 1, () => editOrder(item, 1)),
      tileButton('×', 'remove', item, false, () => {
        releasePreview(item);
        releaseItem(item);
        items.splice(items.indexOf(item), 1);
        clearResult();
        renderList();
        refresh();
        const next = $('image-list').children[Math.min(index, items.length - 1)];
        (next?.querySelector('[data-action="remove"]') ?? $('file-input')).focus();
        if (!items.length) picker.waiting();
      }),
    );
    info.append(name, size, actions);
    tile.append(image, info);
    return tile;
  }));
  $('list-toolbar').hidden = !items.length;
  $('reorder-hint').hidden = items.length < 2;
  $('count-label').textContent = phrase(items.length === 1 ? 'count.one' : 'count.many', { n: items.length });
  if (!selectedItem()) selectedId = items[0]?.id ?? null;
  $('frame-select').replaceChildren(...items.map((item, index) => {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = phrase('frame.option', { n: index + 1, name: item.name });
    return option;
  }));
  $('frame-select').value = selectedId ?? '';
}

const clearDrag = () => {
  dragId = null;
  for (const tile of $('image-list').children) tile.classList.remove('dragging', 'drop-target');
};
$('image-list').addEventListener('dragstart', (event) => {
  if (importing || exporting || event.target.closest('button')) {
    event.preventDefault();
    return;
  }
  const tile = event.target.closest('.image-tile');
  if (!tile) return;
  dragId = Number(tile.dataset.id);
  tile.classList.add('dragging');
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', String(dragId));
});
$('image-list').addEventListener('dragover', (event) => {
  if (dragId === null) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  for (const tile of $('image-list').children) tile.classList.remove('drop-target');
  event.target.closest('.image-tile')?.classList.add('drop-target');
});
$('image-list').addEventListener('drop', (event) => {
  if (dragId === null) return;
  event.preventDefault();
  event.stopPropagation();
  const target = event.target.closest('.image-tile');
  if (target) {
    const from = items.findIndex((item) => item.id === dragId);
    const to = items.findIndex((item) => item.id === Number(target.dataset.id));
    moveItem(items, from, to);
    clearResult();
    renderList();
    refresh();
  }
  clearDrag();
});
$('image-list').addEventListener('dragend', clearDrag);

for (const button of document.querySelectorAll('[data-sort]')) {
  button.addEventListener('click', () => {
    sortItems(items, button.dataset.sort);
    clearResult();
    renderList();
    refresh();
  });
}
$('clear-all').addEventListener('click', () => {
  for (const item of items) {
    releasePreview(item);
    releaseItem(item);
  }
  items = [];
  loadError.clear();
  clearResult();
  renderList();
  refresh();
  picker.waiting();
});

function dimensions(width, height) {
  return ltr(phrase('image.dimensions', { width, height }));
}

function refresh() {
  frameDrag = null;
  previewPlan = null;
  previewSettings = null;
  syncControls();
  layoutError.clear();
  const token = ++previewToken;
  clearTimeout(previewTimer);
  $('preview').hidden = true;
  $('preview-wrap').hidden = true;
  $('frame-layer').replaceChildren();
  $('preview-empty').hidden = Boolean(items.length);
  if (!items.length) {
    $('preview-summary').textContent = '';
    return;
  }
  try {
    const settings = currentSettings();
    const layout = geometry(settings);
    $('preview-summary').textContent = phrase('preview.drawing');
    previewTimer = setTimeout(() => drawPreview(layout, settings, token), 120);
  } catch (error) {
    layoutError.show(phrase(error.message));
    $('preview-summary').textContent = '';
    $('export').disabled = true;
  }
}

async function drawPreview(layout, settings, token) {
  const queue = items.slice();
  try {
    for (let i = 0; i < queue.length; i += 1) {
      if (token !== previewToken) return;
      const item = queue[i];
      if (previewImages.has(item.id)) continue;
      // Small bitmaps make dragging immediate, while a shared pixel budget
      // keeps a large contact sheet from retaining a full photo per frame.
      const resize = Math.min(1, 600 / Math.max(item.width, item.height),
        Math.sqrt(8_000_000 / queue.length / (item.width * item.height)));
      const bitmap = await createImageBitmap(item.file, {
        imageOrientation: 'from-image',
        resizeWidth: Math.max(1, Math.round(item.width * resize)),
        resizeHeight: Math.max(1, Math.round(item.height * resize)),
      });
      if (token !== previewToken) {
        bitmap.close();
        return;
      }
      previewImages.set(item.id, bitmap);
    }
    if (token !== previewToken) return;
    previewPlan = layout;
    previewSettings = settings;
    paintPreview();
    buildFrames();
    syncFrameControls();
    $('preview-summary').textContent = phrase('preview.summary', {
      dimensions: dimensions(layout.width, layout.height), n: queue.length,
    });
  } catch {
    if (token === previewToken) layoutError.show(phrase('error.preview'));
  }
}

function paintPreview() {
  if (!previewPlan) return;
  const { width, height, cells } = previewPlan;
  const scale = Math.min(1, 900 / Math.max(width, height));
  const preview = $('preview');
  preview.width = Math.max(1, Math.ceil(width * scale));
  preview.height = Math.max(1, Math.ceil(height * scale));
  const ctx = preview.getContext('2d');
  ctx.scale(scale, scale);
  if (!previewSettings.transparent) {
    ctx.fillStyle = previewSettings.background;
    ctx.fillRect(0, 0, width, height);
  }
  items.forEach((item, index) => {
    drawImageInCell(ctx, previewImages.get(item.id), cells[index], previewSettings.fit, item.transform, item);
  });
  preview.hidden = false;
  $('preview-wrap').hidden = false;
}

function buildFrames() {
  $('frame-layer').replaceChildren(...items.map((item, index) => {
    const cell = previewPlan.cells[index];
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.id = item.id;
    button.setAttribute('aria-label', phrase('frame.select', { n: index + 1, name: item.name }));
    button.style.left = `${100 * cell.x / previewPlan.width}%`;
    button.style.top = `${100 * cell.y / previewPlan.height}%`;
    button.style.width = `${100 * cell.width / previewPlan.width}%`;
    button.style.height = `${100 * cell.height / previewPlan.height}%`;
    return button;
  }));
}

function syncFrameControls() {
  const item = selectedItem();
  $('frame-editor').hidden = !item;
  if (!item) return;
  const transform = item.transform;
  $('frame-select').value = item.id;
  $('frame-zoom').value = Math.round(transform.zoom * 100);
  $('frame-zoom-label').textContent = `${Math.round(transform.zoom * 100)}%`;
  $('frame-pan-x').value = Math.round(transform.panX * 100);
  $('frame-pan-y').value = Math.round(transform.panY * 100);
  const cell = previewPlan?.cells[items.indexOf(item)];
  const placement = cell ? imagePlacement(item, cell, previewSettings.fit, transform) : null;
  const busy = importing || exporting;
  for (const id of ['frame-select', 'frame-zoom', 'frame-reset', 'frames-reset']) $(id).disabled = busy;
  $('frame-pan-x').disabled = busy || !placement?.panRangeX;
  $('frame-pan-y').disabled = busy || !placement?.panRangeY;
  for (const button of $('frame-layer').children) {
    button.disabled = busy;
    button.setAttribute('aria-pressed', String(Number(button.dataset.id) === item.id));
  }
}

function selectFrame(id) {
  selectedId = id;
  syncFrameControls();
}

function updateFrame() {
  clearResult();
  paintPreview();
  syncFrameControls();
}

$('frame-select').addEventListener('change', () => selectFrame(Number($('frame-select').value)));
$('frame-layer').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (button && !button.disabled) selectFrame(Number(button.dataset.id));
});
$('frame-layer').addEventListener('pointerdown', (event) => {
  const button = event.target.closest('button');
  if (!button || button.disabled || !previewPlan || event.button !== 0) return;
  selectFrame(Number(button.dataset.id));
  const item = selectedItem();
  const placement = imagePlacement(item, previewPlan.cells[items.indexOf(item)], previewSettings.fit, item.transform);
  const rect = $('preview').getBoundingClientRect();
  frameDrag = {
    id: event.pointerId, item,
    x: event.clientX, y: event.clientY,
    panX: item.transform.panX, panY: item.transform.panY,
    rangeX: placement.panRangeX * rect.width / previewPlan.width,
    rangeY: placement.panRangeY * rect.height / previewPlan.height,
  };
  button.setPointerCapture(event.pointerId);
});
$('frame-layer').addEventListener('pointermove', (event) => {
  if (importing || exporting || !frameDrag || frameDrag.id !== event.pointerId) return;
  const { item, x, y, panX, panY, rangeX, rangeY } = frameDrag;
  item.transform.panX = rangeX ? clampPan(panX + (event.clientX - x) / rangeX) : 0;
  item.transform.panY = rangeY ? clampPan(panY + (event.clientY - y) / rangeY) : 0;
  updateFrame();
});
for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
  $('frame-layer').addEventListener(type, () => { frameDrag = null; });
}
for (const [id, key, divisor] of [['frame-zoom', 'zoom', 100],
  ['frame-pan-x', 'panX', 100], ['frame-pan-y', 'panY', 100]]) {
  $(id).addEventListener('input', () => {
    const item = selectedItem();
    if (!item || importing || exporting) return;
    item.transform[key] = Number($(id).value) / divisor;
    updateFrame();
  });
}
$('frame-reset').addEventListener('click', () => {
  const item = selectedItem();
  if (item) item.transform = freshTransform();
  updateFrame();
});
$('frames-reset').addEventListener('click', () => {
  for (const item of items) item.transform = freshTransform();
  updateFrame();
});

$('preset').addEventListener('change', () => {
  const preset = PRESETS[$('preset').value];
  if (!preset) return;
  for (const [key, value] of Object.entries(preset)) {
    const input = $(key === 'width' ? 'output-width' : key);
    if (input.type === 'checkbox') input.checked = value;
    else input.value = value;
  }
  clearResult();
  refresh();
});

for (const id of settingsIds) {
  $(id).addEventListener('input', () => {
    if (id !== 'filename') $('preset').value = 'custom';
    clearResult();
    refresh();
  });
}

function outputName(mime) {
  const name = $('filename').value.trim().replace(/\.(png|jpe?g|webp)$/i, '')
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, '-').slice(0, 100).trim();
  return `${name || 'image-layout'}.${FORMATS[mime].ext}`;
}

$('export').addEventListener('click', async () => {
  if (exporting || importing || !items.length) return;
  let canvas;
  try {
    const settings = currentSettings();
    const layout = geometry(settings);
    const mime = $('format').value;
    const quality = Number($('quality').value) / 100;
    const name = outputName(mime);
    clearResult();
    exporting = true;
    controller = new AbortController();
    syncControls();
    $('progress').hidden = false;
    $('progress-bar').style.width = '0%';
    $('progress-label').textContent = phrase('export.starting');
    canvas = await renderLayout(items, settings, {
      signal: controller.signal,
      onProgress: (fraction) => {
        $('progress-bar').style.width = `${Math.round(fraction * 100)}%`;
        $('progress-label').textContent = phrase('export.drawing', {
          done: Math.min(items.length, Math.floor(fraction * items.length) + 1), total: items.length,
        });
      },
    });
    controller.signal.throwIfAborted();
    $('progress-label').textContent = phrase('export.encoding');
    const blob = await encode(canvas, {
      width: layout.width, height: layout.height, mime, quality,
      background: settings.transparent ? undefined : settings.background,
    });
    controller.signal.throwIfAborted();
    download.offer(blob, name);
    $('result-info').textContent = phrase('result.info', {
      dimensions: dimensions(layout.width, layout.height), format: FORMATS[mime].label,
      size: sizeText(blob.size, phrase, { kb: 1, mb: 1 }),
    });
    $('result').hidden = false;
  } catch (error) {
    if (error.name === 'AbortError') exportError.show(phrase('export.cancelled'));
    else {
      const known = ['errorSettings', 'errorSpace', 'errorSize', 'error.encode', 'error.wrongtype'];
      exportError.show(phrase(known.includes(error.message) ? error.message : 'error.export', error.values));
    }
  } finally {
    if (canvas) { canvas.width = 0; canvas.height = 0; }
    exporting = false;
    controller = null;
    $('progress').hidden = true;
    syncControls();
  }
});
$('cancel').addEventListener('click', () => controller?.abort());

$('privacy-toggle').addEventListener('click', () => {
  const open = $('privacy-panel').hidden;
  $('privacy-panel').hidden = !open;
  $('privacy-toggle').setAttribute('aria-expanded', String(open));
});
window.addEventListener('beforeunload', (event) => {
  if (!exporting) return;
  event.preventDefault();
  event.returnValue = '';
});
window.addEventListener('error', () => loadError.show(phrase('error.broke')));
window.addEventListener('unhandledrejection', () => loadError.show(phrase('error.broke')));

renderList();
refresh();
canEncode(WEBP).then((supported) => {
  if (supported) return;
  $('format').querySelector(`[value="${WEBP}"]`).disabled = true;
  $('support-note').textContent = phrase('support.webp');
  $('support-note').hidden = false;
  if ($('format').value === WEBP) {
    $('format').value = PNG;
    clearResult();
    refresh();
  }
}).catch(() => {});
document.getElementById('boot-warning')?.remove();
