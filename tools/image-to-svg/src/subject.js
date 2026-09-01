/**
 * Finding the thing in the picture, rather than the light half of it.
 *
 * A threshold asks "is this pixel darker than that number", and on a photograph
 * the answer has nothing to do with what is in it: a figurine of dark red
 * muscle standing on grey stone is dark on dark, and Otsu cuts straight through
 * the middle of the subject. The result is not a bad silhouette, it is confetti
 * - and no amount of moving the slider fixes it, because there is no number
 * that separates those two things.
 *
 * So this asks a different question: WHAT IS THE BACKGROUND, and what is not
 * it. Five steps, none of them clever, and each one covering for the last:
 *
 * 1. MODEL THE BACKGROUND from a band round the edge of the picture. Almost
 *    every photograph of one thing has background at its border, and nothing
 *    else does the model any harm - a subject that runs off the edge costs you
 *    the part that touches it, which is a limit worth stating rather than
 *    hiding. The model is the commonest few colours in that band, at five bits
 *    a channel, so a mottled grey wall is several entries rather than a
 *    failure.
 *
 * 2. MEASURE EVERY PIXEL against it - how far, in colour, from the nearest
 *    background colour. That distance is the picture this works on, and it is
 *    the whole trick: on it, the subject IS the bright half, whatever it was
 *    on the original. Otsu, which was useless a moment ago, now has two piles
 *    to cut between and lands where you would.
 *
 *    Far in WHICH sense is `chroma`, and what it is worth was worth measuring
 *    rather than assuming. Splitting the colour into brightness and
 *    colourfulness and weighing the second heavier does NOTHING for a subject
 *    that already differs in colour from an evenly lit ground: 0.9914 against
 *    0.9914 in tests/check-subject.mjs, which is the answer that stopped this
 *    being described as the whole trick.
 *
 *    What it does do is cover for LIGHT. A grey wall with a bright patch in
 *    the middle of it is, by brightness, as unlike the border as the subject
 *    is - the model never saw that patch, so the patch reads as subject. By
 *    colour it is the same grey wall. Same picture, same everything else:
 *    0.78 at plain RGB, 0.93 weighted. Uneven light is the ordinary condition
 *    of photographs, which is why the default is 2.2 and not 1.
 *
 * 3. CUT IT TWICE, NOT ONCE. A single cut loses every shaded part of the
 *    subject that happens to be as dark as the wall - a leg in shadow goes,
 *    and moving the cut down to save it lets the wall in everywhere else.
 *    There is no number that does both, which is the same shape of problem as
 *    step 1 and has the same shape of answer: ask a second question. A pixel
 *    is subject if it is FAR from the background, or if it is merely not-quite
 *    background AND joined to something that is far. Canny's hysteresis, on a
 *    distance map rather than a gradient. The shaded leg comes back because it
 *    is attached to a torso nobody doubts; the wall does not, because it is
 *    attached to nothing.
 *
 * 4. CLOSE THE GAPS. Stone texture and film grain punch holes in both halves.
 *    A dilate followed by an erode of the same radius seals holes smaller than
 *    the radius and leaves the outline where it was.
 *
 * 5. MAKE IT SOLID, AND PICK ONE. Anything the background cannot reach from
 *    the edge of the picture is inside the subject, whatever colour it is -
 *    that is what makes a silhouette solid, and it costs one flood fill.
 *    Then keep the largest island: "the most prominent object" is a phrase
 *    about area, and a caption in the corner is not it.
 *
 * WHERE IT FAILS, WHICH IS NOT A SECRET
 *
 * A background as busy as the subject. A subject the same colour as the wall.
 * Smoke, glass, hair, motion blur - anything whose edge is genuinely a gradient
 * rather than a line, where no threshold is right because the truth is not
 * binary.
 *
 * And the one this cannot argue its way out of: a photograph CROPPED so that
 * the subject runs off two or three sides. Then the border is largely subject,
 * the model learns the subject's own colours, and the answer is confidently
 * inverted. There is no cleverness available here - step 1 was an assumption
 * about photographs, and that picture is not one of them. What there is
 * instead is `useBorder: false` and `samples`: somebody points at the
 * background a couple of times and the model is built from that. A tool that
 * cannot always guess should be able to be told.
 */

import { otsu } from './mask.js';

export const SUBJECT_DEFAULTS = {
  /** Share of the shorter side sampled as background, round all four edges. */
  band: 0.05,
  /**
   * Whether the border is background at all. It is not, for a photograph
   * cropped tight enough that the subject runs off three sides - and then the
   * only honest source of a background model is somebody pointing at some.
   */
  useBorder: true,
  /** Colours pointed at as background, [r, g, b] each, added to the model. */
  samples: [],
  /**
   * How much more a difference in colour counts than a difference in
   * brightness. 1 is plain RGB. Above 1 tells grey things from coloured ones
   * of the same brightness, which is the common photographic case.
   */
  chroma: 2.2,
  /** How many background colours to model. */
  palette: 8,
  /**
   * ...and how much of the border a colour must cover to be one of them.
   *
   * Taking the commonest eight bins and stopping there is wrong in a way that
   * is invisible until it happens: a caption printed across the top corner is
   * inside the band, so black joins the model, and then every dark thing in
   * the picture is background and the answer is nothing at all. One and a
   * third per cent of the border did that. A colour that is really the
   * background covers a great deal more of the border than that, so the floor
   * costs nothing and stops the whole class.
   */
  minBorderShare: 0.03,
  /** Nudge the automatic cut. Positive keeps less, negative keeps more. */
  bias: 0,
  /**
   * Where the second, forgiving cut sits, as a share of the first. Everything
   * between the two is kept only if it joins something above the first. At 1
   * there is no second cut and this is a plain threshold again.
   */
  hysteresis: 0.45,
  /** Radius of the closing that seals texture holes. 0 turns it off. */
  close: 2,
  /** Fill anything the background cannot reach from the edge. */
  solid: true,
  /** 'largest' island only, or every island at least minShare of it. */
  keep: 'largest',
  minShare: 0.15,
  /** Islands smaller than this share of the picture are never kept. */
  minArea: 0.0005,
};

/**
 * @param {{data: Uint8ClampedArray, width: number, height: number}} image
 * @param {object} [options] see SUBJECT_DEFAULTS
 * @returns {{w, h, bits, grey, rgba, threshold, share, islands}}
 */
export function subjectMask(image, options = {}) {
  const o = { ...SUBJECT_DEFAULTS, ...options };
  const { width: w, height: h, data } = image;
  const n = w * h;

  // Colour on white, once, because everything below asks for it repeatedly.
  const rgb = new Uint8Array(n * 3);
  const grey = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const p = i * 4;
    const k = data[p + 3] / 255;
    const r = data[p] * k + 255 * (1 - k);
    const g = data[p + 1] * k + 255 * (1 - k);
    const b = data[p + 2] * k + 255 * (1 - k);
    rgb[i * 3] = r; rgb[i * 3 + 1] = g; rgb[i * 3 + 2] = b;
    grey[i] = (0.299 * r + 0.587 * g + 0.114 * b) | 0;
  }

  const palette = [
    ...(o.useBorder ? backgroundPalette(rgb, w, h, o) : []),
    ...o.samples,
  ];
  if (!palette.length) palette.push([255, 255, 255]);
  const distance = distanceToPalette(rgb, n, palette, o.chroma);

  const cut = Math.max(0, Math.min(255, otsu(distance) + o.bias));
  // Hysteresis needs a BAND to be forgiving in, and a picture whose subject is
  // nothing like its background does not have one: the distance map is 0 or
  // 180 with nothing between, the cut lands at 1, and 45% of 1 rounds to 0.
  // The forgiving cut would then admit every pixel that is not exactly the
  // background colour - which, with any noise at all, is all of them - and the
  // flood walks out of the subject and over the whole picture. Below this much
  // of a band there is nothing to be forgiving about, so it is not attempted.
  const low = Math.round(cut * o.hysteresis);
  let bits = hysteresis(distance, w, h, cut, cut - low >= MIN_BAND ? low : cut);

  if (o.close > 0) bits = closing(bits, w, h, o.close);
  if (o.solid) bits = fillFromOutside(bits, w, h);
  const { kept, islands, share } = keepIslands(bits, w, h, o);

  return {
    w, h, bits: kept, grey, rgba: data,
    threshold: cut, distance, islands, share, palette,
  };
}

/** The narrowest gap between the two cuts that is worth having two of. */
const MIN_BAND = 4;

/* ---- 1. what the border is made of ---------------------------------------- */

function backgroundPalette(rgb, w, h, o) {
  const band = Math.max(1, Math.round(Math.min(w, h) * o.band));
  const count = new Int32Array(32768);
  const sums = new Float64Array(32768 * 3);
  let total = 0;

  const add = (i) => {
    const r = rgb[i * 3], g = rgb[i * 3 + 1], b = rgb[i * 3 + 2];
    const bin = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    count[bin]++;
    sums[bin * 3] += r; sums[bin * 3 + 1] += g; sums[bin * 3 + 2] += b;
    total++;
  };
  for (let y = 0; y < h; y++) {
    const edgeRow = y < band || y >= h - band;
    for (let x = 0; x < w; x++) {
      if (edgeRow || x < band || x >= w - band) add(y * w + x);
    }
  }
  if (!total) return [[255, 255, 255]];

  // The commonest bins, as the true average of the pixels that fell in them -
  // a bin centre would band a gradient before the distance map even started.
  const order = [];
  for (let bin = 0; bin < 32768; bin++) if (count[bin]) order.push(bin);
  order.sort((a, b) => count[b] - count[a]);

  const floor = total * o.minBorderShare;
  const out = [];
  for (const bin of order.slice(0, o.palette)) {
    // The commonest bin is kept whatever its share: a border that is a smooth
    // gradient spreads itself thinly over many bins, and a model of nothing at
    // all is worse than a model of one colour.
    if (out.length > 0 && count[bin] < floor) break;
    out.push([
      sums[bin * 3] / count[bin],
      sums[bin * 3 + 1] / count[bin],
      sums[bin * 3 + 2] / count[bin],
    ]);
  }
  return out;
}

/* ---- 2. how far everything is from it ------------------------------------- */

function distanceToPalette(rgb, n, palette, chroma) {
  // Brightness and the two colour differences, which is YCbCr without the
  // constants nobody remembers: how bright, how blue, how red.
  const parts = palette.map(([r, g, b]) => {
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    return [y, b - y, r - y];
  });
  const out = new Uint8Array(n);
  const k = chroma * chroma;
  for (let i = 0; i < n; i++) {
    const r = rgb[i * 3], g = rgb[i * 3 + 1], b = rgb[i * 3 + 2];
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    const cb = b - y, cr = r - y;
    let best = Infinity;
    for (const [py, pcb, pcr] of parts) {
      const dy = y - py, dcb = cb - pcb, dcr = cr - pcr;
      const d = dy * dy + k * (dcb * dcb + dcr * dcr);
      if (d < best) best = d;
    }
    // Rooted, so the number is a colour difference rather than its square, and
    // Otsu is cutting a histogram with the shape it expects.
    out[i] = Math.min(255, Math.sqrt(best));
  }
  return out;
}

/* ---- 3. the two cuts ------------------------------------------------------ */

/**
 * Sure of the bright half, and willing to be talked into the dim half.
 *
 * Everything above `high` is subject outright. Everything above `low` is a
 * candidate, and becomes subject only by being connected to something above
 * `high`. One flood fill outwards from the sure pixels does it.
 */
function hysteresis(distance, w, h, high, low) {
  const bits = new Uint8Array(w * h);
  const stack = new Int32Array(w * h);
  let top = 0;
  for (let i = 0; i < bits.length; i++) {
    if (distance[i] > high) { bits[i] = 1; stack[top++] = i; }
  }
  const maybe = (i) => {
    if (!bits[i] && distance[i] > low) { bits[i] = 1; stack[top++] = i; }
  };
  while (top > 0) {
    const at = stack[--top];
    const x = at % w, y = (at / w) | 0;
    if (x > 0) maybe(at - 1);
    if (x < w - 1) maybe(at + 1);
    if (y > 0) maybe(at - w);
    if (y < h - 1) maybe(at + w);
    if (x > 0 && y > 0) maybe(at - w - 1);
    if (x < w - 1 && y > 0) maybe(at - w + 1);
    if (x > 0 && y < h - 1) maybe(at + w - 1);
    if (x < w - 1 && y < h - 1) maybe(at + w + 1);
  }
  return bits;
}

/* ---- 4. sealing the texture ----------------------------------------------- */

/** Box dilate then box erode of the same radius: holes go, the outline stays. */
function closing(bits, w, h, r) {
  return boxFilter(boxFilter(bits, w, h, r, 'max'), w, h, r, 'min');
}

function boxFilter(bits, w, h, r, kind) {
  // One integral image, so a window of any radius is four lookups.
  const sum = new Int32Array((w + 1) * (h + 1));
  for (let y = 0; y < h; y++) {
    let row = 0;
    for (let x = 0; x < w; x++) {
      row += bits[y * w + x];
      sum[(y + 1) * (w + 1) + x + 1] = sum[y * (w + 1) + x + 1] + row;
    }
  }
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    const y0 = Math.max(0, y - r), y1 = Math.min(h - 1, y + r);
    for (let x = 0; x < w; x++) {
      const x0 = Math.max(0, x - r), x1 = Math.min(w - 1, x + r);
      const total = sum[(y1 + 1) * (w + 1) + x1 + 1] - sum[y0 * (w + 1) + x1 + 1] -
                    sum[(y1 + 1) * (w + 1) + x0] + sum[y0 * (w + 1) + x0];
      // The window is clipped at the edges and the count it is compared with is
      // clipped with it, which is replicate padding - so a subject running off
      // the edge of the picture is not eroded away for touching it.
      const area = (y1 - y0 + 1) * (x1 - x0 + 1);
      out[y * w + x] = kind === 'max' ? (total > 0 ? 1 : 0) : (total === area ? 1 : 0);
    }
  }
  return out;
}

/* ---- 5. solid, and only the main one -------------------------------------- */

/**
 * Everything the background cannot reach from the edge of the picture belongs
 * to the subject. One flood fill, and every window, eye socket and gap between
 * the ribs stops being a hole in the silhouette.
 */
function fillFromOutside(bits, w, h) {
  const outside = new Uint8Array(w * h);
  const stack = new Int32Array(w * h);
  let top = 0;
  const push = (i) => { if (!outside[i] && !bits[i]) { outside[i] = 1; stack[top++] = i; } };

  for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }

  while (top > 0) {
    const at = stack[--top];
    const x = at % w, y = (at / w) | 0;
    if (x > 0) push(at - 1);
    if (x < w - 1) push(at + 1);
    if (y > 0) push(at - w);
    if (y < h - 1) push(at + w);
  }

  const out = new Uint8Array(w * h);
  for (let i = 0; i < out.length; i++) out[i] = outside[i] ? 0 : 1;
  return out;
}

/** The most prominent object is a claim about area. Settle it by measuring. */
function keepIslands(bits, w, h, o) {
  const labels = new Int32Array(w * h);
  const sizes = [0];
  const stack = new Int32Array(w * h);
  let next = 0;

  for (let seed = 0; seed < labels.length; seed++) {
    if (labels[seed] !== 0 || !bits[seed]) continue;
    const id = ++next;
    let size = 0, top = 0;
    stack[top++] = seed;
    labels[seed] = id;
    while (top > 0) {
      const at = stack[--top];
      size++;
      const x = at % w, y = (at / w) | 0;
      if (x > 0 && !labels[at - 1] && bits[at - 1]) { labels[at - 1] = id; stack[top++] = at - 1; }
      if (x < w - 1 && !labels[at + 1] && bits[at + 1]) { labels[at + 1] = id; stack[top++] = at + 1; }
      if (y > 0 && !labels[at - w] && bits[at - w]) { labels[at - w] = id; stack[top++] = at - w; }
      if (y < h - 1 && !labels[at + w] && bits[at + w]) { labels[at + w] = id; stack[top++] = at + w; }
    }
    sizes[id] = size;
  }

  const biggest = sizes.reduce((a, b) => Math.max(a, b), 0);
  const floor = Math.max(biggest * (o.keep === 'largest' ? 1 : o.minShare),
                         w * h * o.minArea);
  const kept = new Uint8Array(w * h);
  let area = 0;
  for (let i = 0; i < kept.length; i++) {
    const id = labels[i];
    if (id && sizes[id] >= floor) { kept[i] = 1; area++; }
  }
  return { kept, islands: next, share: area / (w * h) };
}
