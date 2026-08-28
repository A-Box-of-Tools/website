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
  fill: 'style.fill',
  pixelate: 'style.pixelate',
  blur: 'style.blur',
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
export function sizeText(bytes, t) {
  if (bytes < 1024) return t('size.b', { n: bytes });
  if (bytes < 1024 * 1024) return t('size.kb', { n: (bytes / 1024).toFixed(1) });
  return t('size.mb', { n: (bytes / (1024 * 1024)).toFixed(2) });
}

/** One row of the list: where the box is, and what it does to what is under it. */
export function describeRegion(region, strength, t) {
  const where = t('region.where', {
    width: region.width, height: region.height, x: region.x, y: region.y,
  });
  if (region.style === 'pixelate') {
    const blocks = blockCount(region, strength);
    return t('region.pixelated', {
      where, size: blocks.size, across: blocks.across, down: blocks.down,
    });
  }
  if (region.style === 'blur') {
    return t('region.blurred', { where, radius: blurRadius(region, strength) });
  }
  return t('region.filled', { where });
}

/** "3 areas: 2 blacked out, 1 pixelated". Empty until there is something to say. */
export function countSummary(regions, t) {
  if (regions.length === 0) return '';
  const counts = { fill: 0, pixelate: 0, blur: 0 };
  for (const region of regions) counts[region.style] = (counts[region.style] ?? 0) + 1;
  // The comma between two of these is a phrase as well: not every language
  // separates a list with one.
  const parts = Object.entries(counts)
    .filter(([, n]) => n > 0)
    .map(([style, n]) => t(`${STYLE_LABELS[style]}.${n === 1 ? 'one' : 'many'}`, { n }))
    .reduce((a, b) => t('join.comma', { a, b }));
  return t(regions.length === 1 ? 'count.one' : 'count.many',
    { n: regions.length, parts });
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
export function riskNote(regions, strength, t) {
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
    parts.push(t('risk.mosaic', {
      across: finest.across,
      down: finest.down,
      size: finest.size,
      averages: finest.across * finest.down,
    }));
  }

  if (blurs.length > 0) {
    const radii = blurs.map((region) => blurRadius(region, strength));
    parts.push(t(blurs.length === 1 ? 'risk.blur.one' : 'risk.blur.many',
      { radius: Math.min(...radii) }));
  }

  parts.push(t('risk.advice'));
  // The space between two sentences is a phrase too: ja and zh do not put
  // one after a full stop.
  return parts.reduce((a, b) => t('join.sentences', { a, b }));
}

/** "Medium - 9 blocks across the shorter side of each box." */
export function strengthNote(strength, t) {
  const chosen = strengthOf(strength);
  return t('strength.note', {
    label: t(chosen.label), blocks: chosen.blocks, blur: chosen.blur,
  });
}
