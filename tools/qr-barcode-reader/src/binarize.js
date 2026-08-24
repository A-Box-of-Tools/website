/**
 * Turning a picture into black and white, which is the step everything else
 * depends on and the one that decides whether a photograph reads at all.
 *
 * A QR code is only ever two colours, so it is tempting to pick one brightness
 * and call everything below it dark. That works on a screenshot and fails on
 * almost every photograph, because a photograph is not evenly lit: a code on a
 * page under a desk lamp can be brighter in its shadowed corner than the paper
 * is in the lit one, and no single number separates them.
 *
 * So the threshold is local. The picture is cut into eight-pixel blocks, each
 * block gets its own idea of where black stops, and each block's answer is
 * smoothed against its neighbours' so that the boundary between two blocks is
 * not itself an edge. The one case that needs care is a block with nothing in
 * it - all paper, or all ink - where the local answer would be "half of this
 * is dark" and would invent a pattern out of paper grain. Those borrow from
 * the blocks around them instead.
 *
 * A second, blunter method is here as well: one threshold for the whole
 * picture, chosen by Otsu's method. It is wrong for an unevenly lit photograph
 * and right for a small, clean, low-contrast image where eight pixels is most
 * of a module. The reader tries both rather than choosing between them.
 */

/** Below this, a picture has too few blocks for a local threshold to mean anything. */
const MINIMUM_DIMENSION = 40;

/** The side of one block, and its logarithm, which the arithmetic uses. */
const BLOCK_POWER = 3;
const BLOCK_SIZE = 1 << BLOCK_POWER;

/** A block flatter than this is assumed to hold no edge at all. */
const MIN_DYNAMIC_RANGE = 24;

/**
 * One byte of brightness per pixel.
 *
 * The weights are the usual ones for perceived brightness rather than a plain
 * average, which matters for a code printed in colour: red on white and blue
 * on white are the same picture to an average and very different to an eye,
 * and to a scanner.
 */
export function grayscale(data, width, height) {
  const gray = new Uint8Array(width * height);
  for (let i = 0; i < gray.length; i += 1) {
    const at = i * 4;
    const alpha = data[at + 3];
    // A transparent PNG has no colour where it is transparent, and the bytes
    // underneath are usually black - which would make a transparent margin
    // read as ink. Composite onto white, which is what any viewer would do.
    if (alpha === 255) {
      gray[i] = (data[at] * 77 + data[at + 1] * 151 + data[at + 2] * 28) >> 8;
    } else {
      const k = alpha / 255;
      const r = data[at] * k + 255 * (1 - k);
      const g = data[at + 1] * k + 255 * (1 - k);
      const b = data[at + 2] * k + 255 * (1 - k);
      gray[i] = (r * 77 + g * 151 + b * 28) >> 8;
    }
  }
  return gray;
}

/**
 * Otsu's method: the threshold that best separates the histogram into two
 * groups, measured by how far apart their means are.
 *
 * Returned rather than applied, so that the caller can report it - "everything
 * darker than 112" is a checkable statement about what this page did.
 */
export function otsuThreshold(gray) {
  const histogram = new Uint32Array(256);
  for (const value of gray) histogram[value] += 1;

  const total = gray.length;
  let sum = 0;
  for (let i = 0; i < 256; i += 1) sum += i * histogram[i];

  let sumBelow = 0;
  let countBelow = 0;
  let best = 0;
  let bestVariance = -1;

  for (let t = 0; t < 256; t += 1) {
    countBelow += histogram[t];
    if (countBelow === 0) continue;
    const countAbove = total - countBelow;
    if (countAbove === 0) break;

    sumBelow += t * histogram[t];
    const meanBelow = sumBelow / countBelow;
    const meanAbove = (sum - sumBelow) / countAbove;
    const variance = countBelow * countAbove * (meanBelow - meanAbove) ** 2;
    if (variance > bestVariance) {
      bestVariance = variance;
      best = t;
    }
  }

  return best;
}

/** One threshold for the whole picture. */
export function globalBinarize(gray, width, height) {
  const threshold = otsuThreshold(gray);
  const bits = new Uint8Array(width * height);
  for (let i = 0; i < bits.length; i += 1) bits[i] = gray[i] <= threshold ? 1 : 0;
  return bits;
}

/**
 * A threshold per block, smoothed across the picture.
 *
 * @returns {Uint8Array} one byte per pixel; 1 is dark
 */
export function localBinarize(gray, width, height) {
  if (width < MINIMUM_DIMENSION || height < MINIMUM_DIMENSION) {
    return globalBinarize(gray, width, height);
  }

  const across = Math.ceil(width / BLOCK_SIZE);
  const down = Math.ceil(height / BLOCK_SIZE);
  const points = new Uint8Array(across * down);

  for (let by = 0; by < down; by += 1) {
    const top = Math.min(by * BLOCK_SIZE, height - BLOCK_SIZE);
    for (let bx = 0; bx < across; bx += 1) {
      const left = Math.min(bx * BLOCK_SIZE, width - BLOCK_SIZE);

      let sum = 0;
      let min = 255;
      let max = 0;
      for (let y = 0; y < BLOCK_SIZE; y += 1) {
        const row = (top + y) * width + left;
        for (let x = 0; x < BLOCK_SIZE; x += 1) {
          const value = gray[row + x];
          sum += value;
          if (value < min) min = value;
          if (value > max) max = value;
        }
      }

      let average;
      if (max - min > MIN_DYNAMIC_RANGE) {
        average = sum >> (BLOCK_POWER * 2);
      } else {
        // Nothing in this block but one shade. Half of the darkest pixel puts
        // the threshold below everything here, so the block comes out all
        // light - which is right for paper and wrong for ink, so a block
        // surrounded by darker neighbours takes their answer instead.
        average = min >> 1;
        if (by > 0 && bx > 0) {
          const neighbours = (points[(by - 1) * across + bx]
            + 2 * points[by * across + bx - 1]
            + points[(by - 1) * across + bx - 1]) >> 2;
          if (min < neighbours) average = neighbours;
        }
      }
      points[by * across + bx] = average;
    }
  }

  const bits = new Uint8Array(width * height);
  for (let by = 0; by < down; by += 1) {
    const top = Math.min(by * BLOCK_SIZE, height - BLOCK_SIZE);
    const yFrom = Math.max(by - 2, 0);
    const yTo = Math.min(by + 2, down - 1);

    for (let bx = 0; bx < across; bx += 1) {
      const left = Math.min(bx * BLOCK_SIZE, width - BLOCK_SIZE);
      const xFrom = Math.max(bx - 2, 0);
      const xTo = Math.min(bx + 2, across - 1);

      // The threshold for this block is the average of the twenty-five around
      // it. Without the smoothing, two neighbouring blocks that disagree put a
      // straight edge through the picture every eight pixels.
      let total = 0;
      let count = 0;
      for (let y = yFrom; y <= yTo; y += 1) {
        for (let x = xFrom; x <= xTo; x += 1) {
          total += points[y * across + x];
          count += 1;
        }
      }
      const threshold = total / count;

      for (let y = 0; y < BLOCK_SIZE; y += 1) {
        const row = (top + y) * width + left;
        for (let x = 0; x < BLOCK_SIZE; x += 1) {
          bits[row + x] = gray[row + x] <= threshold ? 1 : 0;
        }
      }
    }
  }

  return bits;
}

/**
 * A three-by-three average of the brightness.
 *
 * Softening a picture before thresholding it sounds like the opposite of what
 * a reader wants, and for a clean screenshot it is - which is why it is one
 * attempt among several rather than the only one. What it fixes is grain: in a
 * photograph taken in poor light, single pixels swing far enough either side of
 * the threshold to break up a bar, and a finder pattern with a hole in it is
 * not a finder pattern. Averaging over nine pixels costs a little sharpness at
 * every edge and takes most of that noise out.
 */
export function blur(gray, width, height) {
  const out = new Uint8Array(gray.length);
  for (let y = 0; y < height; y += 1) {
    const up = Math.max(y - 1, 0) * width;
    const here = y * width;
    const down = Math.min(y + 1, height - 1) * width;
    for (let x = 0; x < width; x += 1) {
      const left = Math.max(x - 1, 0);
      const right = Math.min(x + 1, width - 1);
      out[here + x] = (gray[up + left] + gray[up + x] + gray[up + right]
        + gray[here + left] + gray[here + x] + gray[here + right]
        + gray[down + left] + gray[down + x] + gray[down + right]) / 9;
    }
  }
  return out;
}

/** The same bits with dark and light swapped, for a code printed in reverse. */
export function invert(bits) {
  const out = new Uint8Array(bits.length);
  for (let i = 0; i < bits.length; i += 1) out[i] = bits[i] ^ 1;
  return out;
}
