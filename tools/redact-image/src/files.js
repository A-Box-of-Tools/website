/**
 * Names, formats and the short lines that carry a number.
 *
 * Kept out of main.js because these are the strings somebody reads, and a wrong
 * one is a wrong claim about what the tool did: a row that says "18 px blocks"
 * is the only thing on the page saying how much of the original survived the
 * mosaic. They are plain functions on plain values, so the tests can check them.
 */

import { blockCount, blurRadius, strengthOf } from './regions.js';

/** A filename with its extension taken off, and nothing else changed. */
export function stemOf(name) {
  const clean = String(name ?? '').replace(/\.[^./\\]+$/, '');
  return clean || 'image';
}

/**
 * What each style is called in a row of the list.
 *
 * Verbs rather than nouns - "blacked out" says what happened to the pixels, and
 * that is the question this tool is answering.
 */
export const STYLE_LABELS = {
  fill: 'blacked out',
  pixelate: 'pixelated',
  blur: 'blurred',
};

export const FORMATS = {
  png: { id: 'png', mime: 'image/png', extension: 'png', lossy: false },
  jpeg: { id: 'jpeg', mime: 'image/jpeg', extension: 'jpg', lossy: true },
  webp: { id: 'webp', mime: 'image/webp', extension: 'webp', lossy: true },
};

/**
 * Which encoder writes the result.
 *
 * "Auto" keeps a photograph a photograph and everything else lossless. Handing
 * a JPEG back as a PNG would quadruple the size of a holiday snap for no gain,
 * and handing a screenshot back as a JPEG would put ringing around every letter
 * of the text that was left unredacted - which, on a page about hiding some of
 * the text, is the worse of the two mistakes.
 *
 * Nothing about the choice affects whether the redaction holds. The pixels are
 * already gone by the time an encoder sees them, in every format.
 *
 * @param {string} choice      'auto', or a key of FORMATS
 * @param {string} sourceType  the chosen file's MIME type, if the browser knew one
 */
export function chooseFormat(choice, sourceType = '') {
  if (choice !== 'auto') return FORMATS[choice] ?? FORMATS.png;
  return sourceType === 'image/jpeg' ? FORMATS.jpeg : FORMATS.png;
}

/**
 * What the download is called.
 *
 * "-redacted" in the name, always. Two files called scan.jpg in a downloads
 * folder is exactly how the original gets attached to the email instead of the
 * copy, and that mistake cannot be undone by anything this page does.
 */
export function outName(stem, format) {
  const safe = String(stem).replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
    || 'image';
  return `${safe}-redacted.${format.extension}`;
}

/** Bytes, as the page writes them. */
export function sizeText(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** One row of the list: where the box is, and what it does to what is under it. */
export function describeRegion(region, strength) {
  const where = `${region.width} x ${region.height} at ${region.x}, ${region.y}`;
  if (region.style === 'pixelate') {
    const blocks = blockCount(region, strength);
    return `${where} - pixelated, ${blocks.size} px blocks (${blocks.across} x ${blocks.down})`;
  }
  if (region.style === 'blur') {
    return `${where} - blurred, ${blurRadius(region, strength)} px radius`;
  }
  return `${where} - blacked out`;
}

/** "3 areas: 2 blacked out, 1 pixelated". Empty until there is something to say. */
export function countSummary(regions) {
  if (regions.length === 0) return '';
  const counts = { fill: 0, pixelate: 0, blur: 0 };
  for (const region of regions) counts[region.style] = (counts[region.style] ?? 0) + 1;
  const parts = Object.entries(counts)
    .filter(([, n]) => n > 0)
    .map(([style, n]) => `${n} ${STYLE_LABELS[style]}`);
  const noun = regions.length === 1 ? 'area' : 'areas';
  return `${regions.length} ${noun}: ${parts.join(', ')}.`;
}

/**
 * The line under the list when a box is doing something reversible.
 *
 * It reports the finest mosaic on the picture, because that is the one an
 * attempt at recovery would start with, and because it is a number rather than
 * an adjective: a strength named "heavy" tells somebody nothing about whether
 * their bank account number is still in there, and "34 blocks across the widest
 * one" tells them how many measurements of it they are handing over.
 *
 * Returns null when every box is a black fill, which is the case this page is
 * trying to talk people into.
 */
export function riskNote(regions, strength) {
  const soft = regions.filter((region) => region.style !== 'fill');
  if (soft.length === 0) return null;

  const mosaics = soft.filter((region) => region.style === 'pixelate');
  const blurs = soft.filter((region) => region.style === 'blur');
  const parts = [];

  if (mosaics.length > 0) {
    const finest = mosaics
      .map((region) => blockCount(region, strength))
      .reduce((worst, blocks) => (blocks.across * blocks.down > worst.across * worst.down
        ? blocks : worst));
    parts.push(
      `The finest mosaic here is ${finest.across} x ${finest.down} blocks of ${finest.size} px. `
      + `That is ${finest.across * finest.down} averages of what was underneath, left in the file.`,
    );
  }

  if (blurs.length > 0) {
    const radii = blurs.map((region) => blurRadius(region, strength));
    parts.push(
      `${blurs.length === 1 ? 'The blur' : 'The smallest blur'} has a radius of `
      + `${Math.min(...radii)} px. A blur is an average too, and a small one over sharp `
      + 'text is the case that has been worked backwards.',
    );
  }

  parts.push('Black out anything that reads as text.');
  return parts.join(' ');
}

/** "Medium - 9 blocks across the shorter side of each box." */
export function strengthNote(strength) {
  const chosen = strengthOf(strength);
  return `${chosen.label} - about ${chosen.blocks} blocks across the shorter side of a box, `
    + `and a blur radius of a ${chosen.blur}th of it.`;
}
