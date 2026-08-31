/**
 * The chart itself: figures in, one string of SVG out.
 *
 * WHY THERE IS ONE RENDERER AND NOT TWO
 *
 * What is on screen, what the SVG download contains and what the PNG download
 * contains are the same string of markup. The PNG is that SVG painted onto a
 * canvas at its own size. A tool that draws the preview on a canvas and writes
 * the download separately has two renderers to keep in step, and eventually
 * ships a picture that disagrees with the one somebody approved.
 *
 * WHY THE TEXT IS MEASURED BY THE CALLER
 *
 * A column has to be as wide as the widest of three things: the figure, the
 * name over it and the height under that. Only the browser knows how wide a
 * name is going to be, and this file has no browser in it - so `measure` is
 * passed in. That keeps every layout decision here testable with a ruler that
 * counts characters, and it is the only reason this module has no DOM in it at
 * all.
 *
 * WHAT IS DELIBERATELY NOT HERE
 *
 * No words. Names come from the caller and the ruler's labels come from
 * units.js, which returns numbers with their unit rather than sentences.
 */

import { ceilTo, gridLabel, gridStep } from './units.js';

export const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

/** XML-escape: the four characters that could end an attribute or a tag. */
function escape(text) {
  return String(text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const round = (n) => Math.round(n * 100) / 100;

/**
 * Whether a colour is dark enough to want light ink on it.
 *
 * Relative luminance, the sRGB one, so the ruler on a navy background is
 * legible for the same reason it is legible on white - rather than because
 * somebody eyeballed a threshold on their own monitor.
 */
export function isDark(hex) {
  const match = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!match) return false;
  const value = parseInt(match[1], 16);
  const channels = [(value >> 16) & 255, (value >> 8) & 255, value & 255]
    .map((c) => c / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const luminance = 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  return luminance < 0.4;
}

/**
 * How tall the chart reaches, and how far apart its lines are.
 *
 * The ceiling is a whole number of gridlines above the tallest figure, and
 * then far enough above it that the tallest figure's own two lines of label
 * still fit under the top of the picture. Without that second condition a
 * chart of two people who happen to be 179 and 180 puts the name of the taller
 * one off the top of the image, and the only way to find out is to look.
 */
export function ceiling(tallestCm, plotHeight, labelHeight, unit) {
  const step = gridStep(tallestCm, unit);
  let topCm = ceilTo(tallestCm, step);

  // Four is a limit rather than a count: the loop adds a step at a time and
  // each one buys more room than the last, so it has never needed a third.
  for (let tries = 0; tries < 4; tries += 1) {
    const scale = plotHeight / topCm;
    if ((topCm - tallestCm) * scale >= labelHeight) break;
    topCm += step;
  }

  return { topCm, step };
}

/**
 * One column per figure, each as wide as the widest thing that goes in it.
 *
 * A 40 cm cat named "Mrs Tiddlywinks" is the case this exists for: the drawing
 * is narrow and the label is not, and a chart that sized columns by the
 * drawing alone would have that name written across its neighbours.
 */
function columns(figures, scale, font, measure) {
  const gap = font * 1.7;

  return figures.map((figure) => {
    const height = figure.cm * scale;
    const drawn = figure.shape.markup
      ? figure.shape.width * height
      : Math.max((figure.widthCm || figure.cm * 0.6) * scale, 6);
    const name = figure.name ? measure(figure.name, font, 600) : 0;
    const label = measure(figure.label, font * 0.86);
    return { figure, height, drawn, width: Math.max(drawn, name, label) + gap };
  });
}

/**
 * The whole picture.
 *
 * @param {Array} figures  `{shape, name, label, cm, widthCm, colour}`, in the
 *   order they are to be drawn. `label` is the height already written out in
 *   the chart's unit - this file does no formatting.
 * @param {object} options `{plotHeight, unit, background, ink, showRuler, showNames}`
 * @param {(text: string, fontPx: number, weight?: number) => number} measure
 * @returns {{svg: string, width: number, height: number, topCm: number, step: number}}
 */
export function chartSvg(figures, options, measure) {
  const {
    plotHeight, unit, background, ink, showRuler = true, showNames = true,
  } = options;

  const font = Math.max(11, Math.round(plotHeight * 0.026));
  const pad = Math.round(font * 1.1);
  const labelHeight = showNames ? Math.round(font * 2.5) : Math.round(font * 0.6);

  const tallest = figures.reduce((most, f) => Math.max(most, f.cm), 0) || 100;
  const { topCm, step } = ceiling(tallest, plotHeight, labelHeight, unit);
  const scale = plotHeight / topCm;

  // Every line the ruler will draw, worked out before the gutters are sized:
  // the gutter has to be as wide as the widest of these labels, and the widest
  // is not always the last one.
  const lines = [];
  for (let cm = 0; cm <= topCm + 1e-6; cm += step) {
    lines.push({ cm, text: gridLabel(cm, unit) });
  }

  const rulerFont = Math.round(font * 0.8);
  const gutter = showRuler
    ? Math.round(lines.reduce((wide, l) => Math.max(wide, measure(l.text, rulerFont)), 0)
      + rulerFont * 0.9)
    : 0;

  const laid = columns(figures, scale, font, measure);
  const plotWidth = Math.max(laid.reduce((sum, c) => sum + c.width, 0), font * 8);

  const width = Math.round(pad * 2 + gutter * 2 + plotWidth);
  const height = Math.round(pad * 2 + labelHeight + plotHeight);
  const groundY = height - pad;
  const left = pad + gutter;

  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" `
    + `viewBox="0 0 ${width} ${height}" font-family='${FONT}'>`,
  ];

  if (background !== 'none') {
    parts.push(`<rect width="${width}" height="${height}" fill="${escape(background)}"/>`);
  }

  /* ------------------------------------------------------------- the ruler */

  if (showRuler) {
    const rules = [];
    for (const line of lines) {
      const y = round(groundY - line.cm * scale);
      // A hairline offset to a half pixel, so a one-pixel rule lands on one
      // row of pixels instead of being spread grey across two.
      const at = Math.round(y) + 0.5;
      rules.push(`M${pad} ${at}H${width - pad}`);
    }
    parts.push(`<path d="${rules.join('')}" stroke="${escape(ink)}" `
      + `stroke-width="1" opacity="0.18" fill="none"/>`);

    for (const line of lines) {
      const y = round(groundY - line.cm * scale + rulerFont * 0.36);
      const text = escape(line.text);
      parts.push(`<text x="${left - rulerFont * 0.5}" y="${y}" font-size="${rulerFont}" `
        + `fill="${escape(ink)}" opacity="0.65" text-anchor="end">${text}</text>`);
      parts.push(`<text x="${width - left + rulerFont * 0.5}" y="${y}" `
        + `font-size="${rulerFont}" fill="${escape(ink)}" opacity="0.65">${text}</text>`);
    }
  }

  // The ground. Drawn darker than the rules above it and after them, because
  // it is the one line in the picture that every height is measured from.
  parts.push(`<path d="M${pad} ${Math.round(groundY) + 0.5}H${width - pad}" `
    + `stroke="${escape(ink)}" stroke-width="1.5" opacity="0.55" fill="none"/>`);

  /* ----------------------------------------------------------- the figures */

  let x = left;
  for (const column of laid) {
    const { figure } = column;
    const centre = round(x + column.width / 2);
    const top = round(groundY - column.height);
    const colour = escape(figure.colour);

    if (figure.shape.markup) {
      const scaled = round(column.height);
      // Two transforms, not one. The outer puts a unit-tall figure where this
      // column wants it; the inner - which a drawn figure carries and a built
      // one does not - is what makes that figure unit-tall in the first place,
      // out of whatever coordinates the artist happened to draw it in. Kept
      // separate so the vendored path data can stay byte for byte what
      // upstream published, and so an uploaded shape is never rewritten
      // either.
      const inner = figure.shape.inner
        ? `<g transform="${escape(figure.shape.inner)}">` : '';
      // `markup` is already markup, and is the only string here that is not
      // escaped on the way out. For the four figures that ship it is built
      // from traced.js; for an uploaded one it is whatever survived
      // import-svg.js, which builds a new tree out of a whitelist rather than
      // cleaning up the old one. Nothing else may be passed through here.
      parts.push(`<g fill="${colour}" transform="translate(${centre} ${top}) `
        + `scale(${scaled})">${inner}${figure.shape.markup}`
        + `${inner ? '</g>' : ''}</g>`);
    } else {
      parts.push(`<rect x="${round(centre - column.drawn / 2)}" y="${top}" `
        + `width="${round(column.drawn)}" height="${round(column.height)}" `
        + `fill="${colour}"/>`);
    }

    if (showNames) {
      const heightBaseline = round(top - font * 0.5);
      if (figure.name) {
        parts.push(`<text x="${centre}" y="${round(heightBaseline - font * 1.15)}" `
          + `font-size="${font}" font-weight="600" fill="${colour}" `
          + `text-anchor="middle">${escape(figure.name)}</text>`);
      }
      parts.push(`<text x="${centre}" y="${heightBaseline}" font-size="${round(font * 0.86)}" `
        + `fill="${escape(ink)}" opacity="0.75" text-anchor="middle">`
        + `${escape(figure.label)}</text>`);
    }

    x += column.width;
  }

  parts.push('</svg>');
  return { svg: parts.join(''), width, height, topCm, step };
}
