import { phrase, ltr } from './shared/phrases.js';
import { wireFilePicker, readingLabel } from './shared/file-picker.js';
import { loadImages, releaseItem, moveItem, sortItems } from './shared/image-list.js';
import { encode, canEncode, FORMATS, PNG, JPEG, WEBP } from './shared/image-convert.js';
import { downloadLink } from './shared/download.js';
import { sizeText } from './shared/format.js';
import { messageBox } from './shared/message-box.js';
import { arrange, drawImageInCell, renderLayout } from './arrange.js';
import { makeExample } from './example.js';

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
}

async function addFiles(files) {
  if (exporting) return;
  importing = true;
  clearResult();
  syncControls();
  picker.busy(readingLabel(files.length));
  loadError.clear();
  try {
    const loaded = await loadImages(files, { thumbMax: 240 });
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
  for (const item of items) releaseItem(item);
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
  syncControls();
  layoutError.clear();
  const token = ++previewToken;
  clearTimeout(previewTimer);
  $('preview').hidden = true;
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
  const canvas = document.createElement('canvas');
  // The same cell geometry is scaled once for the screen; source transparency
  // is kept by decoding resized bitmaps rather than drawing JPEG thumbnails.
  const scale = Math.min(1, 900 / Math.max(layout.width, layout.height));
  canvas.width = Math.max(1, Math.ceil(layout.width * scale));
  canvas.height = Math.max(1, Math.ceil(layout.height * scale));
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.imageSmoothingQuality = 'high';
  if (!settings.transparent) {
    ctx.fillStyle = settings.background;
    ctx.fillRect(0, 0, layout.width, layout.height);
  }
  const queue = items.slice();
  try {
    for (let i = 0; i < queue.length; i += 1) {
      if (token !== previewToken) return;
      const item = queue[i];
      const resize = Math.min(1, 600 / Math.max(item.width, item.height));
      const bitmap = await createImageBitmap(item.file, {
        imageOrientation: 'from-image',
        resizeWidth: Math.max(1, Math.round(item.width * resize)),
        resizeHeight: Math.max(1, Math.round(item.height * resize)),
      });
      try {
        if (token !== previewToken) return;
        drawImageInCell(ctx, bitmap, layout.cells[i], settings.fit);
      } finally {
        bitmap.close();
      }
    }
    if (token !== previewToken) return;
    const preview = $('preview');
    preview.width = canvas.width;
    preview.height = canvas.height;
    preview.getContext('2d').drawImage(canvas, 0, 0);
    preview.hidden = false;
    $('preview-summary').textContent = phrase('preview.summary', {
      dimensions: dimensions(layout.width, layout.height), n: queue.length,
    });
  } catch {
    if (token === previewToken) layoutError.show(phrase('error.preview'));
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}

for (const id of settingsIds) {
  $(id).addEventListener('input', () => {
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
