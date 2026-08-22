/**
 * The picture of the sound.
 *
 * It is here to be looked at rather than measured: a track drawn before and
 * after an edit is the quickest way to see that reversing did reverse it, that
 * the speed change shortened it, and that a boost has pushed the loud parts up
 * against the ceiling. The line across the middle at full scale is the ceiling,
 * so a waveform touching it is one that is about to clip.
 */

/**
 * Reduce a recording to one high and one low value per column.
 *
 * Peaks rather than an average of the samples: an average of a waveform is
 * roughly zero everywhere, which draws a flat line for every piece of music
 * ever recorded.
 */
export function envelope(channels, columns) {
  const frames = channels[0].length;
  const low = new Float32Array(columns);
  const high = new Float32Array(columns);
  const perColumn = frames / columns;

  for (let column = 0; column < columns; column += 1) {
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
  return { low, high };
}

/**
 * Draw one onto a canvas, at the device's own pixel density.
 *
 * The colours are read off the page rather than written here, so the drawing
 * follows the site's light and dark themes without knowing about either.
 */
export function drawWaveform(canvas, channels) {
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
  context.strokeStyle = style.getPropertyValue('--wave-line') || '#888';
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(0, middle + 0.5);
  context.lineTo(width, middle + 0.5);
  context.stroke();

  if (!channels?.length || !channels[0].length) return;

  const { low, high } = envelope(channels, width);
  context.fillStyle = style.getPropertyValue('--wave-fill') || '#5b9bd8';
  for (let column = 0; column < width; column += 1) {
    // Clamped rather than scaled: a sample past full scale is drawn at the
    // ceiling, which is where it will be when the file is written.
    const top = middle - Math.min(1, high[column]) * middle;
    const bottom = middle - Math.max(-1, low[column]) * middle;
    context.fillRect(column, top, 1, Math.max(1, bottom - top));
  }
}
