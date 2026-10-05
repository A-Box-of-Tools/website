const WORKING_EDGE = 400;
const MAX_INPUT_PIXELS = 80_000_000;

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
