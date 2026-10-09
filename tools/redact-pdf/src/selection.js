/**
 * The selection one export is responsible for.
 *
 * Reading and writing a PDF both yield to the browser. The live checkboxes
 * must not become a different verification target while that work is pending.
 * Character ranges are copied first and resolved against the run's fresh pages,
 * because a second export reopens the original document with new glyph objects.
 */
import { glyphsIn, mergeRanges } from './matches.js';

export function snapshotSelection(picked, options) {
  const ranges = new Map([...picked].map(([index, values]) => [
    index, [...values.values()].map((range) => ({ ...range })),
  ]));
  const count = [...ranges.values()].reduce((sum, values) => sum + values.length, 0);
  return { ranges, count, options: { ...options } };
}

export function planSelection(pages, selection) {
  const chosen = new Map();
  const texts = new Set();
  for (const [index, ranges] of selection.ranges) {
    const page = pages[index];
    if (!page) continue;
    const glyphs = new Set();
    for (const range of mergeRanges(ranges)) {
      for (const glyph of glyphsIn(page, range.from, range.to)) glyphs.add(glyph);
      const text = page.text.slice(range.from, range.to).trim();
      if (text) texts.add(text);
    }
    if (glyphs.size) chosen.set(index, glyphs);
  }
  const terms = [...texts].map((text) => {
    let removed = 0;
    for (const [index, ranges] of selection.ranges) {
      const page = pages[index];
      if (!page) continue;
      for (const range of ranges) {
        if (page.text.slice(range.from, range.to).trim() === text) removed += 1;
      }
    }
    return { text, removed };
  });
  return { chosen, texts, terms, count: selection.count };
}
