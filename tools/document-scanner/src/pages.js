/**
 * The small decisions around a page: what it is called, what it is worth saying
 * about it, and what shape it turned out to be.
 *
 * Pure functions on numbers and strings, kept out of main.js so that they can be
 * read and tested without a browser. Nothing here writes a sentence a visitor
 * sees: where words are needed it returns a key, and main.js looks the words up
 * in the markup, because src/ is copied byte for byte into every language.
 */

/**
 * The standard paper shapes, as width over height in portrait.
 *
 * The A series is a single number because that is what the series is: a sheet
 * whose sides are in the ratio 1 to the square root of two is the only shape
 * that halves into two sheets of itself, which is why A4, A5 and A3 are all the
 * same entry here and why a scan cannot be told apart from any other member of
 * the family by its shape alone.
 */
const PAPER = [
  { key: 'paper.a', aspect: 1 / Math.SQRT2 },
  { key: 'paper.letter', aspect: 215.9 / 279.4 },
  { key: 'paper.legal', aspect: 215.9 / 355.6 },
  { key: 'paper.card', aspect: 53.98 / 85.6 },
];

/**
 * How far from a standard shape a page may be and still be called it.
 *
 * Three per cent, which is wide enough to cover what the corner finder is
 * actually accurate to on a page that does not fill the frame, and far narrower
 * than the nine per cent between A4 and US Letter - which is the one pair this
 * must never confuse, because they are the two shapes an office asks for.
 */
const TOLERANCE = 0.03;

/**
 * Which standard sheet this shape is, if it is one.
 *
 * Both ways up: a landscape scan of A4 is still A4, and the tool has no business
 * insisting the page was portrait. Returns a key and whether it was on its side,
 * or null - which is the honest answer for a till receipt or a torn-out page.
 *
 * @param {number} aspect width / height
 * @returns {{key: string, landscape: boolean}|null}
 */
export function matchPaper(aspect) {
  if (!Number.isFinite(aspect) || aspect <= 0) return null;

  for (const paper of PAPER) {
    if (Math.abs(Math.log(aspect / paper.aspect)) <= TOLERANCE) {
      return { key: paper.key, landscape: false };
    }
    if (Math.abs(Math.log(aspect / (1 / paper.aspect))) <= TOLERANCE) {
      return { key: paper.key, landscape: true };
    }
  }

  return null;
}

/** A file name with its extension taken off, and nothing else changed. */
export function stemOf(name) {
  const clean = String(name ?? '').replace(/\.[a-z0-9]{1,8}$/i, '').trim();
  return clean || 'scan';
}

/**
 * What the finished file is called.
 *
 * Built from the name of the first photograph rather than from the date, so that
 * a folder of scans sorts beside the photographs they came from - and so that
 * nothing in the file name says when the scan was made, which is a small piece
 * of the same promise the document itself keeps.
 */
export function outName(stem, extension) {
  return `${safeStem(stem)}-scan.${extension}`;
}

/** One page inside the archive, numbered so that ten pages sort correctly. */
export function pageName(stem, index, total, extension) {
  const width = String(total).length;
  return `${safeStem(stem)}-page-${String(index + 1).padStart(width, '0')}.${extension}`;
}

/** Nothing a file system would refuse, and nothing unreasonably long. */
function safeStem(stem) {
  return String(stem ?? '').replace(/[\\/:*?"<>|]+/g, '-').slice(0, 60) || 'scan';
}

/** A byte count, in the units a person would say it in. */
export function sizeText(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} MB`;
}

/**
 * The ratio of a page, written the way a stationer would: 1 to something, with
 * the long side second whichever way up it is.
 */
export function ratioText(aspect) {
  if (!Number.isFinite(aspect) || aspect <= 0) return '';
  const ratio = aspect > 1 ? aspect : 1 / aspect;
  return `1:${ratio.toFixed(2)}`;
}

/**
 * How much of the photograph a scan kept.
 *
 * Worth showing because it is the number that explains a disappointing result
 * without anybody having to guess: a page that filled a tenth of the frame was
 * photographed from too far away, and no amount of straightening will put back
 * detail that was never in the file.
 */
export function coverage(quad, width, height) {
  const area = Math.abs(
    (quad[0].x * quad[1].y - quad[1].x * quad[0].y)
    + (quad[1].x * quad[2].y - quad[2].x * quad[1].y)
    + (quad[2].x * quad[3].y - quad[3].x * quad[2].y)
    + (quad[3].x * quad[0].y - quad[0].x * quad[3].y),
  ) / 2;
  const frame = width * height;
  return frame > 0 ? area / frame : 0;
}

/**
 * Whether a scan is detailed enough for what it is going to be used for.
 *
 * The number that matters for a document is dots per inch across the real page,
 * and it can be worked out here because the shape of the page is known: a
 * straightened A4 that came out 1000 pixels wide is 1000 pixels across 8.27
 * inches, which is 121 dpi, which will print visibly soft. 150 is the floor for
 * something to be read on paper and 300 is what an office scanner is set to.
 *
 * Where the page is not a standard size there is nothing to measure against, so
 * this returns null rather than inventing a page size to compare with.
 *
 * @returns {{dpi: number, key: string}|null}
 */
export function scanQuality(widthPx, aspect) {
  const paper = matchPaper(aspect);
  if (!paper) return null;

  const millimetres = {
    'paper.a': [210, 297],
    'paper.letter': [215.9, 279.4],
    'paper.legal': [215.9, 355.6],
    'paper.card': [85.6, 53.98],
  }[paper.key];
  if (!millimetres) return null;

  const across = paper.landscape ? Math.max(...millimetres) : Math.min(...millimetres);
  const dpi = Math.round((widthPx / across) * 25.4);

  let key = 'quality.good';
  if (dpi < 120) key = 'quality.low';
  else if (dpi < 200) key = 'quality.fair';
  return { dpi, key };
}
