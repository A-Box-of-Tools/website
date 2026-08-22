/**
 * The picture of the sound.
 *
 * On this tool the waveform is not decoration. Marking audio without seeing it
 * is marking blind: the gap before the answer, the cough, the four seconds of
 * room tone at the top of the take are all *visible* long before they are
 * findable by scrubbing, and the whole point of the timeline is to put them
 * under the marks rather than beside them.
 *
 * ## Why it is summarised once
 *
 * An hour of stereo at 48 kHz is three hundred and forty million samples. Ten
 * minutes of dragging a window edge around would rescan all of them on every
 * frame, so the scan happens once - into a fixed number of columns, far more
 * than any screen has - and every later drawing is a cheap reduction of that
 * summary. Resizing the window, switching to dark mode and redrawing after an
 * export all cost the same handful of milliseconds.
 *
 * Peaks rather than an average: the average of a waveform is roughly zero
 * everywhere, which draws a flat line for every piece of music ever recorded.
 */

/** Columns in the stored summary. Wider than any display, so reductions of it
 *  never have to invent detail they do not have. */
export const SUMMARY_COLUMNS = 4096;

/**
 * Reduce a recording to one high and one low value per column.
 *
 * @param {Float32Array[]} channels
 * @param {number} [columns]
 * @returns {{low: Float32Array, high: Float32Array, columns: number}}
 */
export function summarise(channels, columns = SUMMARY_COLUMNS) {
  const frames = channels[0]?.length ?? 0;
  const width = Math.max(1, Math.min(columns, frames || 1));
  const low = new Float32Array(width);
  const high = new Float32Array(width);
  if (!frames) return { low, high, columns: width };

  const perColumn = frames / width;

  for (let column = 0; column < width; column += 1) {
    const start = Math.floor(column * perColumn);
    const end = Math.max(start + 1, Math.min(frames, Math.floor((column + 1) * perColumn)));
    let lowest = 0;
    let highest = 0;
    for (const samples of channels) {
      for (let i = start; i < end; i += 1) {
        const value = samples[i];
        if (value < lowest) lowest = value;
        if (value > highest) highest = value;
      }
    }
    low[column] = lowest;
    high[column] = highest;
  }

  return { low, high, columns: width };
}

/**
 * Reduce a summary to exactly `width` columns.
 *
 * Peaks again on the way down, not an average of peaks: a column that covers a
 * loud moment should be drawn as loud, and averaging is what makes a waveform
 * of a long recording flatten into a grey band.
 */
function reduce(summary, width) {
  if (width >= summary.columns) return summary;

  const low = new Float32Array(width);
  const high = new Float32Array(width);
  const per = summary.columns / width;

  for (let column = 0; column < width; column += 1) {
    const start = Math.floor(column * per);
    const end = Math.max(start + 1, Math.min(summary.columns, Math.floor((column + 1) * per)));
    let lowest = 0;
    let highest = 0;
    for (let i = start; i < end; i += 1) {
      if (summary.low[i] < lowest) lowest = summary.low[i];
      if (summary.high[i] > highest) highest = summary.high[i];
    }
    low[column] = lowest;
    high[column] = highest;
  }

  return { low, high, columns: width };
}

/**
 * Draw a summary onto a canvas, at the device's own pixel density.
 *
 * The colours are read off the page rather than written here, so the drawing
 * follows the site's light and dark themes without knowing about either.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {ReturnType<typeof summarise>|null} summary
 */
export function drawWaveform(canvas, summary) {
  const style = getComputedStyle(canvas);
  const width = Math.max(1, Math.round(canvas.clientWidth));
  const height = Math.max(1, Math.round(canvas.clientHeight));
  const density = Math.min(2, window.devicePixelRatio || 1);

  canvas.width = Math.round(width * density);
  canvas.height = Math.round(height * density);

  const context = canvas.getContext('2d');
  context.scale(density, density);
  context.clearRect(0, 0, width, height);

  const middle = height / 2;
  context.strokeStyle = style.getPropertyValue('--wave-line').trim() || '#888';
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(0, middle + 0.5);
  context.lineTo(width, middle + 0.5);
  context.stroke();

  if (!summary) return;

  const shown = reduce(summary, width);
  const scale = width / shown.columns;
  context.fillStyle = style.getPropertyValue('--wave-fill').trim() || '#5b9bd8';

  for (let column = 0; column < shown.columns; column += 1) {
    // Clamped rather than scaled: a sample past full scale is drawn at the
    // ceiling, which is where it will be when the file is written.
    const top = middle - Math.min(1, shown.high[column]) * middle;
    const bottom = middle - Math.max(-1, shown.low[column]) * middle;
    context.fillRect(column * scale, top, Math.max(1, scale), Math.max(1, bottom - top));
  }
}
