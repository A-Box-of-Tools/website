const WORKING_EDGE = 400;
const MAX_INPUT_PIXELS = 80_000_000;
const RECOVERY_EDGE = 2400;
const PAPER_TILE = 64;

/** A closer header reading has its own small budget, including its border. */
export function headerReadingDimensions(width, height) {
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height)
      || width < 1 || height < 1 || width > RECOVERY_EDGE || height > RECOVERY_EDGE) return null;
  const border = 16;
  const sourceHeight = Math.max(1, Math.ceil(height * 0.22));
  const scale = Math.min((RECOVERY_EDGE - border * 2) / Math.max(width, sourceHeight), Math.max(1, 1000 / width));
  return {
    width: Math.max(1, Math.round(width * scale)) + border * 2,
    height: Math.max(1, Math.round(sourceHeight * scale)) + border * 2,
    sourceHeight, border,
  };
}

function grayAt(data, offset) {
  const alpha = data[offset + 3] / 255;
  return Math.round((data[offset] * 299 + data[offset + 1] * 587 + data[offset + 2] * 114) / 1000 * alpha
    + 255 * (1 - alpha));
}

/**
 * A global black/white threshold loses faint print when one side of a page is
 * in shadow. Estimate the paper's brightness from the lightest tenth of each
 * small tile, interpolate between those estimates and strengthen local ink
 * contrast. This changes only a bounded OCR copy, never the visitor's photo
 * or attachment. The tiled estimate avoids a full-image integral buffer.
 * @param {{width: number, height: number, data: ArrayLike<number>}} imageData
 * @returns {{width: number, height: number, data: Uint8ClampedArray} | null}
 */
export function normalizeReceiptImage(imageData) {
  const { width, height, data } = imageData ?? {};
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height)
      || width < 1 || height < 1 || width > RECOVERY_EDGE || height > RECOVERY_EDGE
      || !data || !Number.isSafeInteger(data.length) || data.length < width * height * 4) return null;

  const columns = Math.ceil(width / PAPER_TILE);
  const rows = Math.ceil(height / PAPER_TILE);
  const paper = new Uint8Array(columns * rows);
  const histogram = new Uint16Array(256);
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      histogram.fill(0);
      const left = column * PAPER_TILE;
      const top = row * PAPER_TILE;
      const right = Math.min(width, left + PAPER_TILE);
      const bottom = Math.min(height, top + PAPER_TILE);
      let count = 0;
      for (let y = top; y < bottom; y += 2) {
        for (let x = left; x < right; x += 2) {
          histogram[grayAt(data, (y * width + x) * 4)] += 1;
          count += 1;
        }
      }
      const target = Math.ceil(count * 0.9);
      let cumulative = 0;
      let level = 0;
      while (level < 255 && cumulative + histogram[level] < target) cumulative += histogram[level++];
      // A filled black logo or barcode is not dark paper that needs bleaching.
      paper[row * columns + column] = Math.max(128, level);
    }
  }

  const output = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    const gridY = Math.max(0, Math.min(rows - 1, (y + 0.5) / PAPER_TILE - 0.5));
    const top = Math.floor(gridY);
    const bottom = Math.min(rows - 1, top + 1);
    const blendY = gridY - top;
    for (let x = 0; x < width; x += 1) {
      const gridX = Math.max(0, Math.min(columns - 1, (x + 0.5) / PAPER_TILE - 0.5));
      const left = Math.floor(gridX);
      const right = Math.min(columns - 1, left + 1);
      const blendX = gridX - left;
      const upper = paper[top * columns + left] * (1 - blendX) + paper[top * columns + right] * blendX;
      const lower = paper[bottom * columns + left] * (1 - blendX) + paper[bottom * columns + right] * blendX;
      const background = upper * (1 - blendY) + lower * blendY;
      const offset = (y * width + x) * 4;
      const gray = Math.max(0, Math.min(255, Math.round(255 - 3 * (background - grayAt(data, offset)))));
      output[offset] = output[offset + 1] = output[offset + 2] = gray;
      output[offset + 3] = 255;
    }
  }
  return { width, height, data: output };
}

/**
 * White merchant lettering on a filled dark logo needs a separate inverted
 * OCR pass. Ordinary text, frames and photographic edges must not become
 * inversion candidates. Sampling a bounded header keeps the search inexpensive
 * even when the caller has enlarged a small receipt for recognition.
 * @param {{width: number, height: number, data: ArrayLike<number>}} imageData
 * @returns {{x: number, y: number, width: number, height: number} | null}
 */
export function findDarkHeader(imageData) {
  const { width, height, data } = imageData ?? {};
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height)
      || width < 1 || height < 1 || width * height > MAX_INPUT_PIXELS
      || !data || !Number.isSafeInteger(data.length) || data.length < width * height * 4) return null;

  const headerHeight = Math.max(1, Math.floor(height * 0.35));
  const scale = Math.min(1, WORKING_EDGE / width, WORKING_EDGE / headerHeight);
  const columns = Math.max(1, Math.floor(width * scale));
  const rows = Math.max(1, Math.floor(headerHeight * scale));
  const mask = new Uint8Array(columns * rows);
  const queue = new Int32Array(mask.length);
  for (let y = 0; y < rows; y += 1) {
    const sourceY = Math.min(headerHeight - 1, Math.floor((y + 0.5) * headerHeight / rows));
    for (let x = 0; x < columns; x += 1) {
      const sourceX = Math.min(width - 1, Math.floor((x + 0.5) * width / columns));
      const offset = (sourceY * width + sourceX) * 4;
      const alpha = data[offset + 3] / 255;
      const grey = (data[offset] * 299 + data[offset + 1] * 587 + data[offset + 2] * 114) / 1000;
      if (grey * alpha + 255 * (1 - alpha) < 90) mask[y * columns + x] = 1;
    }
  }

  let best = null;
  let bestCount = 0;
  for (let start = 0; start < mask.length; start += 1) {
    if (!mask[start]) continue;
    let head = 0;
    let count = 1;
    queue[0] = start;
    mask[start] = 0;
    let left = start % columns;
    let right = left;
    let top = Math.floor(start / columns);
    let bottom = top;
    while (head < count) {
      const index = queue[head++];
      const x = index % columns;
      const y = Math.floor(index / columns);
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
      if (x && mask[index - 1]) { mask[index - 1] = 0; queue[count++] = index - 1; }
      if (x + 1 < columns && mask[index + 1]) { mask[index + 1] = 0; queue[count++] = index + 1; }
      if (y && mask[index - columns]) { mask[index - columns] = 0; queue[count++] = index - columns; }
      if (y + 1 < rows && mask[index + columns]) { mask[index + columns] = 0; queue[count++] = index + columns; }
    }
    const workingWidth = right - left + 1;
    const workingHeight = bottom - top + 1;
    const sourceWidth = workingWidth * width / columns;
    const sourceHeight = workingHeight * headerHeight / rows;
    const area = sourceWidth * sourceHeight;
    const ratio = sourceWidth / sourceHeight;
    if (count <= bestCount || sourceWidth < width * 0.2 || sourceHeight < 16
        || ratio < 1.2 || ratio > 12 || area < width * height * 0.005
        || area > width * height * 0.18 || sourceHeight > height * 0.28
        || count / (workingWidth * workingHeight) < 0.45
        || left === 0 || right === columns - 1 || bottom === rows - 1) continue;
    const x = Math.floor(left * width / columns);
    const y = Math.floor(top * headerHeight / rows);
    const edgeX = Math.min(width, Math.ceil((right + 1) * width / columns));
    const edgeY = Math.min(headerHeight, Math.ceil((bottom + 1) * headerHeight / rows));
    best = { x, y, width: edgeX - x, height: edgeY - y };
    bestCount = count;
  }
  return best;
}
