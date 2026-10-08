/**
 * A preview and an export share these rectangles, so changing the output width
 * never changes which part of a picture the reader decided to keep. Full-size
 * pictures are decoded one at a time; only the finished canvas stays in memory.
 */

import { decodeFull } from './shared/image-list.js';
import { throwIfAborted } from './shared/errors.js';

// The limit is on the combined canvas, not each input photograph. A modest
// picture repeated in a tall strip can otherwise allocate gigabytes at once.
export const MAX_SIDE = 8192;
export const MAX_PIXELS = 32_000_000;

const RATIOS = { square: 1, landscape: 4 / 3, portrait: 3 / 4 };
const validInteger = (value, minimum) => Number.isSafeInteger(value) && value >= minimum;
const fail = (key) => { throw new RangeError(key); };

function validate(items, settings) {
  if (!Array.isArray(items) || !settings || typeof settings !== 'object') fail('errorSettings');
  const { layout, width, columns, ratio, gap, padding, fit } = settings;
  if (!['grid', 'horizontal', 'vertical'].includes(layout)
      || !['square', 'landscape', 'portrait', 'original'].includes(ratio)
      || !['contain', 'cover'].includes(fit)
      || !validInteger(width, 1) || !validInteger(columns, 1)
      || !validInteger(gap, 0) || !validInteger(padding, 0)
      || (layout === 'grid' && ratio === 'original')) fail('errorSettings');
  for (const item of items) {
    if (!item || !validInteger(item.width, 1) || !validInteger(item.height, 1)) fail('errorSettings');
  }
  if (width > MAX_SIDE) fail('errorSize');
}

function checkSize(width, height) {
  if (!Number.isFinite(height) || height > MAX_SIDE || width * height > MAX_PIXELS) fail('errorSize');
  if (height < 1) fail('errorSpace');
}

/**
 * @param {{width: number, height: number}[]} items  in the order they appear
 * @param {object} settings
 * @param {'grid'|'horizontal'|'vertical'} settings.layout
 * @param {number} settings.width  the finished width, including both margins
 * @param {number} settings.columns  used only for a grid
 * @param {'square'|'landscape'|'portrait'|'original'} settings.ratio
 *   Original is available for strips, where every picture keeps its own shape.
 * @param {number} settings.gap  pixels between pictures
 * @param {number} settings.padding  pixels on each outside edge
 * @param {'contain'|'cover'} settings.fit
 * @returns {{width: number, height: number, cells: object[], columns: number, rows: number}|null}
 */
export function arrange(items, settings) {
  if (Array.isArray(items) && items.length === 0) return null;
  validate(items, settings);
  const { layout, width, ratio, gap, padding } = settings;
  const columns = layout === 'horizontal' ? items.length : layout === 'vertical' ? 1 : settings.columns;
  const rows = layout === 'vertical' ? items.length : Math.ceil(items.length / columns);
  const availableWidth = width - padding * 2 - gap * (columns - 1);
  if (availableWidth < columns) fail('errorSpace');

  let cells;
  let contentHeight;
  if (ratio === 'original' && layout === 'horizontal') {
    const ratios = items.map((item) => item.width / item.height);
    contentHeight = availableWidth / ratios.reduce((sum, value) => sum + value, 0);
    let x = padding;
    cells = ratios.map((value) => {
      const cell = { x, y: padding, width: contentHeight * value, height: contentHeight };
      x += cell.width + gap;
      return cell;
    });
  } else if (ratio === 'original') {
    let y = padding;
    cells = items.map((item) => {
      const height = availableWidth * item.height / item.width;
      const cell = { x: padding, y, width: availableWidth, height };
      y += height + gap;
      return cell;
    });
    contentHeight = y - padding - gap;
  } else {
    const cellWidth = availableWidth / columns;
    const cellHeight = cellWidth / RATIOS[ratio];
    contentHeight = rows * cellHeight + (rows - 1) * gap;
    cells = items.map((item, index) => ({
      x: padding + (index % columns) * (cellWidth + gap),
      y: padding + Math.floor(index / columns) * (cellHeight + gap),
      width: cellWidth,
      height: cellHeight,
    }));
  }
  for (const cell of cells) {
    if (cell.width < 1 || cell.height < 1) fail('errorSpace');
  }
  // Fractions stay in the geometry so every column has the same width. Rounding
  // only the outside edge keeps a last row or a natural-ratio strip from losing
  // part of its last pixel when it is copied to a whole-pixel canvas.
  const height = Math.ceil(contentHeight + padding * 2);
  checkSize(width, height);
  return { width, height, cells, columns, rows };
}

/** Draw a picture without distortion; cover crops at the centre of its cell. */
export function drawImageInCell(ctx, image, cell, fit = 'contain') {
  if (!['contain', 'cover'].includes(fit)) fail('errorSettings');
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  if (!(sourceWidth > 0) || !(sourceHeight > 0)) fail('errorSettings');
  const scale = fit === 'cover'
    ? Math.max(cell.width / sourceWidth, cell.height / sourceHeight)
    : Math.min(cell.width / sourceWidth, cell.height / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  ctx.save();
  try {
    ctx.globalAlpha = 1;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.beginPath();
    ctx.rect(cell.x, cell.y, cell.width, cell.height);
    ctx.clip();
    ctx.drawImage(image, cell.x + (cell.width - width) / 2,
      cell.y + (cell.height - height) / 2, width, height);
  } finally {
    ctx.restore();
  }
}

/**
 * @param {object[]} items  imported pictures, each with its original File
 * @param {object} settings  arrange() settings, plus background and transparent
 * @param {{signal?: AbortSignal, onProgress?: (fraction: number) => void}} [options]
 * @returns {Promise<HTMLCanvasElement|null>}
 */
export async function renderLayout(items, settings, { signal, onProgress } = {}) {
  throwIfAborted(signal);
  // The editor can change during a decode. Its current order, dimensions and
  // colour belong to the next export, not a half-finished copy of this one.
  const snapshot = items.map((item) => ({ ...item }));
  const options = { ...settings };
  const plan = arrange(snapshot, options);
  if (!plan) return null;
  const { fit, background = '#ffffff', transparent = false } = options;
  if (typeof transparent !== 'boolean' || typeof background !== 'string' || !background) fail('errorSettings');
  const canvas = document.createElement('canvas');
  canvas.width = plan.width;
  canvas.height = plan.height;
  try {
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) fail('errorSize');
    if (!transparent) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, plan.width, plan.height);
    }
    for (let index = 0; index < snapshot.length; index += 1) {
      throwIfAborted(signal);
      const bitmap = await decodeFull(snapshot[index]);
      try {
        throwIfAborted(signal);
        drawImageInCell(ctx, bitmap, plan.cells[index], fit);
      } finally {
        bitmap.close();
      }
      onProgress?.((index + 1) / snapshot.length);
      // A cached decode can resolve without handing the page an event turn.
      // Let Cancel and the progress bar be heard before beginning the next one.
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    throwIfAborted(signal);
    return canvas;
  } catch (error) {
    canvas.width = 0;
    canvas.height = 0;
    throw error;
  }
}
