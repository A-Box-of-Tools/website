/**
 * The whole job, end to end: pixels in, one SVG path out.
 *
 * Every loop becomes one subpath of a single `d`, and nothing sets a
 * fill-rule, because contour.js winds outlines and holes in opposite
 * directions and nonzero is already the default. So a shape with forty holes
 * in it is one element, and the file is the coordinates and almost nothing
 * else.
 */

import { maskFromImage, inkFraction } from './mask.js';
import { traceContours } from './contour.js';
import { fitContour, DEFAULTS } from './fit.js';

export const TRACE_DEFAULTS = {
  ...DEFAULTS,
  /** 'otsu', or a grey level 0-255. */
  threshold: 'otsu',
  /** Trace the light parts instead of the dark ones. */
  invert: false,
  /** Drop any loop enclosing fewer than this many pixels. */
  minArea: 2,
  /** Ink touching only at the corners: two shapes, or one. */
  joinDiagonals: false,
  /** Decimal places kept in the path data. */
  precision: 2,
  /** Multiply every coordinate - the SVG scales anyway, so this is for taste. */
  scale: 1,
  fill: '#000',
};

/**
 * @param {{data: Uint8ClampedArray, width: number, height: number}} image
 * @param {object} [options] see TRACE_DEFAULTS
 */
export function traceImage(image, options = {}) {
  const o = { ...TRACE_DEFAULTS, ...options };
  return traceMask(maskFromImage(image, o), o);
}

/**
 * The same, for a mask somebody has already made - and, more to the point, one
 * they have since edited. Everything past the threshold works on bits, so a
 * hand-corrected mask traces by exactly the same path as a fresh one.
 *
 * @param {{w: number, h: number, bits: Uint8Array, threshold?: number}} mask
 * @param {object} [options] see TRACE_DEFAULTS
 */
export function traceMask(mask, options = {}) {
  const o = { ...TRACE_DEFAULTS, ...options };
  const started = Date.now();

  const contours = traceContours(mask, o);
  let crackPoints = 0;
  for (const c of contours) crackPoints += c.xs.length;

  const subpaths = [];
  let curves = 0, corners = 0, flats = 0;
  for (const contour of contours) {
    const fitted = fitContour(contour, o);
    curves += fitted.smooth;
    corners += fitted.corners;
    flats += fitted.flat;
    subpaths.push(fitted);
  }

  const d = subpaths.map((s) => pathData(s, o.precision, o.scale)).join('');
  const w = mask.w * o.scale, h = mask.h * o.scale;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${trim(w, 2)} ${trim(h, 2)}" ` +
    `width="${trim(w, 2)}" height="${trim(h, 2)}">` +
    `<path fill="${o.fill}" d="${d}"/></svg>`;

  return {
    svg,
    d,
    width: w,
    height: h,
    stats: {
      threshold: mask.threshold,
      ink: inkFraction(mask),
      contours: contours.length,
      crackPoints,
      vertices: curves + corners + flats,
      curves,
      corners,
      flats,
      bytes: byteLength(svg),
      ms: Date.now() - started,
    },
  };
}

/** One closed subpath, with runs of collinear lines collapsed on the way out. */
function pathData(sub, precision, scale) {
  const s = (n) => trim(n * scale, precision);
  const out = [`M${s(sub.start[0])} ${s(sub.start[1])}`];
  const cmds = collapseLines(sub.start, sub.cmds);

  let last = 'x';
  for (const c of cmds) {
    if (c.t === 'L') {
      out.push(`${last === 'L' ? ' ' : 'L'}${s(c.p[0])} ${s(c.p[1])}`);
      last = 'L';
    } else {
      out.push(`${last === 'C' ? ' ' : 'C'}${s(c.c1[0])} ${s(c.c1[1])} ` +
               `${s(c.c2[0])} ${s(c.c2[1])} ${s(c.p[0])} ${s(c.p[1])}`);
      last = 'C';
    }
  }
  out.push('z');
  return out.join('');
}

/**
 * A corner emits a line to the vertex and a line to the next midpoint, so a
 * straight edge between two corners always arrives as two collinear lines with
 * a pointless vertex between them. Nothing downstream cares, but the file does.
 */
function collapseLines(start, cmds) {
  const out = [];
  let from = start;
  for (const c of cmds) {
    const prev = out[out.length - 1];
    if (c.t === 'L' && prev && prev.t === 'L') {
      const a = out.length > 1 ? endOf(out[out.length - 2]) : from;
      const cross = (prev.p[0] - a[0]) * (c.p[1] - a[1]) - (prev.p[1] - a[1]) * (c.p[0] - a[0]);
      const span = Math.hypot(c.p[0] - a[0], c.p[1] - a[1]);
      if (span > 0 && Math.abs(cross) / span < 1e-6) { out[out.length - 1] = c; continue; }
    }
    out.push(c);
  }
  return out;
}

const endOf = (cmd) => cmd.p;

function trim(n, precision) {
  const r = Number(n.toFixed(precision));
  return Object.is(r, -0) ? '0' : String(r);
}

function byteLength(s) {
  if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(s).length;
  return Buffer.byteLength(s, 'utf8');
}
