/**
 * The boxes: what one is, where it may sit, and how a drag changes it.
 *
 * Every rectangle in this tool is in the coordinates of the picture itself - a
 * box is "412 x 88 starting 120 across", never "38% of the way in". The screen
 * is a view of the picture and can be any size; the file is the thing being
 * edited, and the file is what the encoder is handed. The stage converts a
 * pointer position into these coordinates once, on the way in, and nothing
 * downstream has to know what size the picture was drawn at.
 *
 * Nothing here touches the DOM or a canvas, which is what lets the tests check
 * the arithmetic that decides which pixels are destroyed.
 */

/**
 * The smallest box worth keeping, in source pixels.
 *
 * A click that does not move is a click, not a box, and a two-pixel box left
 * behind by one is a box somebody will not find again to delete. This is the
 * line between the two.
 */
export const MIN_SIZE = 6;

/** The three things a box can do to what is under it. */
export const STYLES = ['fill', 'pixelate', 'blur'];

/**
 * How hard each style is applied.
 *
 * Both numbers are divisors of the box's shorter side rather than absolute
 * pixel counts, because "20 pixel blocks" means something completely different
 * on a 400 pixel screenshot and on a 4000 pixel photograph of the same passport.
 * Measured against the box, one setting behaves the same way on both.
 */
export const STRENGTHS = {
  // `label` is a phrase key: this module ships in fifteen languages and the
  // page is the only place a word can be read.
  light: { id: 'light', label: 'strength.light', blocks: 14, blur: 22 },
  medium: { id: 'medium', label: 'strength.medium', blocks: 9, blur: 14 },
  heavy: { id: 'heavy', label: 'strength.heavy', blocks: 5, blur: 7 },
};

export const strengthOf = (id) => STRENGTHS[id] ?? STRENGTHS.medium;

const clamp = (value, low, high) => Math.max(low, Math.min(value, high));

/**
 * The size of one mosaic block for a box, in source pixels.
 *
 * Floored at three: below that the "blocks" are noise at any normal viewing
 * size and the mosaic stops being a redaction at all - it becomes a slightly
 * blurred copy of the thing it was meant to remove.
 */
export function blockSize(rect, strength) {
  const shorter = Math.min(rect.width, rect.height);
  const size = Math.round(shorter / strengthOf(strength).blocks);
  return clamp(size, 3, Math.max(3, shorter));
}

/** The blur radius for a box, in source pixels. Same reasoning as above. */
export function blurRadius(rect, strength) {
  const shorter = Math.min(rect.width, rect.height);
  const radius = Math.round(shorter / strengthOf(strength).blur);
  return clamp(radius, 2, Math.max(2, shorter));
}

/**
 * How many blocks a mosaic will actually be made of.
 *
 * This is the number the warning on the page is about. A pixelated box is a
 * grid of averages, and a grid of averages is a small amount of information
 * about what was underneath - so few blocks means little information, and that
 * is the only thing here that can be counted rather than asserted.
 */
export function blockCount(rect, strength) {
  const size = blockSize(rect, strength);
  return {
    across: Math.ceil(rect.width / size),
    down: Math.ceil(rect.height / size),
    size,
  };
}

/** Two corners of a drag, in either order, as a rectangle. */
export function fromDrag(start, end) {
  const x = Math.round(Math.min(start.x, end.x));
  const y = Math.round(Math.min(start.y, end.y));
  return {
    x,
    y,
    width: Math.round(Math.abs(end.x - start.x)),
    height: Math.round(Math.abs(end.y - start.y)),
  };
}

/** Is this drag a box, or was it a click that wobbled? */
export const isUsable = (rect) => rect.width >= MIN_SIZE && rect.height >= MIN_SIZE;

/**
 * A rectangle rounded to whole pixels and pushed inside the picture.
 *
 * Boxes are clamped rather than rejected, because the gesture people make over
 * something at the edge of a photograph is a drag that starts outside it. The
 * box that results covers the corner, which is what was meant.
 */
export function clampRect(rect, source) {
  const width = clamp(Math.round(rect.width), 0, source.width);
  const height = clamp(Math.round(rect.height), 0, source.height);
  return {
    x: clamp(Math.round(rect.x), 0, source.width - width),
    y: clamp(Math.round(rect.y), 0, source.height - height),
    width,
    height,
  };
}

/** Move a box by a whole number of source pixels, keeping it on the picture. */
export const moveRect = (rect, dx, dy, source) => clampRect(
  { ...rect, x: rect.x + dx, y: rect.y + dy }, source,
);

/** The eight grips, named for the edges each one drags. */
export const HANDLES = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

/**
 * Resize from one handle.
 *
 * The shape is free - unlike the crop boxes elsewhere on this site, nothing
 * about a redaction has an aspect ratio - so each handle simply moves the edges
 * it touches. Dragging an edge past its opposite flips the box rather than
 * collapsing it, which is what every drawing program does and what the hand
 * expects; `fromDrag` puts the corners back in order afterwards.
 */
export function resizeRect(rect, handle, dx, dy, source) {
  const name = String(handle ?? '');
  const left = rect.x + (name.includes('w') ? dx : 0);
  const top = rect.y + (name.includes('n') ? dy : 0);
  const right = rect.x + rect.width + (name.includes('e') ? dx : 0);
  const bottom = rect.y + rect.height + (name.includes('s') ? dy : 0);
  return clampRect(
    fromDrag({ x: left, y: top }, { x: right, y: bottom }),
    source,
  );
}

/** Does a point in source coordinates fall inside this box? */
export const contains = (rect, point) => (
  point.x >= rect.x && point.x <= rect.x + rect.width
  && point.y >= rect.y && point.y <= rect.y + rect.height
);

/**
 * The box under a point, latest first.
 *
 * Later boxes are drawn over earlier ones, so the one on top is the one the
 * pointer is pointing at.
 */
export function topmostAt(regions, point) {
  for (let i = regions.length - 1; i >= 0; i -= 1) {
    if (contains(regions[i], point)) return regions[i];
  }
  return null;
}
