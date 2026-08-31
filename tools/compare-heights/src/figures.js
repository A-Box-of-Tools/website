/**
 * The silhouettes: four drawn, one built.
 *
 * WHERE THE FIGURES COME FROM
 *
 * The man, the woman, the boy and the girl are public-domain artwork, in
 * traced.js beside this file and byte for byte in vendor/. People drew those,
 * and it shows - clothes, a pose, hair, the shape of a shoe on a floor - and
 * no amount of arithmetic here was going to catch up with them. The man is the
 * one that is not quite as published: his original is a hand-traced photograph
 * with a visibly shaky edge, so the shipped copy is smoothed. traced.js says
 * so and a test re-derives it.
 *
 * WHY THE TODDLER IS STILL BUILT, AND IS NOT A SCALED ADULT
 *
 * Because there is no drawing of one to be had. Wikimedia has one usable free
 * child - the girl - and NIH BioArt the boy; below school age the public
 * domain runs out, and every coherent free family of people (Font Awesome,
 * Material, Phosphor) is a restroom pictogram about four and a half heads tall
 * at every age. So the toddler is built here, from a table of proportions.
 *
 * That is not a consolation prize. It is the thing most of these charts get
 * wrong: a two-year-old is about four and a half head-heights tall, an
 * eight-year-old six, an adult seven and a half, so a scaled-down adult
 * standing next to a real one says something false about both, and the head is
 * the first place a reader looks. A table gets that right.
 *
 * WHAT THE COORDINATES ARE
 *
 * Every figure lives in a box one unit tall: y = 0 is the top of the head,
 * y = 1 is the ground, x = 0 is the centre line. The chart places one with a
 * single `translate(cx, topY) scale(height)`, which is why nothing in here has
 * to know how tall anybody is or how many pixels a centimetre gets. A drawn
 * figure carries an `inner` transform as well, which is the artwork's own
 * bounding box mapped onto that same unit box - so the chart places both kinds
 * the same way.
 *
 * Nothing is stroked, which is what lets a built figure be several overlapping
 * subpaths - head, body, two arms - filled in one colour and read as one
 * shape, and what lets a drawn one be filled in whatever colour the row picked.
 */

import { TRACED } from './traced.js';

/** Enough decimals for a 4000-pixel chart, and not the seventeen a float has. */
const fmt = (n) => (Math.round(n * 10000) / 10000).toString();

const point = (x, y) => `${fmt(x)} ${fmt(y)}`;

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function towards(from, to, howFar) {
  const length = distance(from, to) || 1;
  const t = Math.min(howFar / length, 0.5);
  return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
}

/**
 * A closed outline through `points`, with every corner cut to its own radius.
 *
 * Each vertex carries an `r`: how far back along both of its edges the corner
 * starts bending, with the vertex itself as the quadratic's control point.
 * r = 0 leaves the corner square, which is what the sole of a foot wants;
 * everything else on a body is round.
 *
 * A polyline plus one radius per vertex is the whole modelling language here.
 * It is small enough to hold in your head, and it is what lets a table of
 * proportions become a body without anybody hand-writing control points.
 */
export function roundedLoop(points) {
  const parts = [];
  const count = points.length;

  for (let i = 0; i < count; i += 1) {
    const here = points[i];
    const previous = points[(i - 1 + count) % count];
    const next = points[(i + 1) % count];
    const radius = here.r ?? 0;

    const from = radius > 0 ? towards(here, previous, radius) : here;
    const to = radius > 0 ? towards(here, next, radius) : here;

    parts.push(`${i === 0 ? 'M' : 'L'}${point(from.x, from.y)}`);
    if (radius > 0) parts.push(`Q${point(here.x, here.y)} ${point(to.x, to.y)}`);
  }

  parts.push('Z');
  return parts.join('');
}

/** An ellipse as a path, so a figure is a list of `d` strings and nothing else. */
function ellipse(cx, cy, rx, ry) {
  return `M${point(cx - rx, cy)}`
    + `a${point(rx, ry)} 0 1 0 ${point(rx * 2, 0)}`
    + `a${point(rx, ry)} 0 1 0 ${point(-rx * 2, 0)}Z`;
}

/**
 * Mirror a right-hand outline into a whole body.
 *
 * The list runs from the centre of the neck, down the right side, and back up
 * the inside of the right leg to the crotch; this walks the same points back
 * up the left. Building both halves from one list is not tidiness - it is what
 * makes it impossible for a change to the waist to leave a body lopsided.
 */
function mirrored(right) {
  const left = right
    .slice(1, -1)
    .reverse()
    .map((p) => ({ ...p, x: -p.x }));
  return [...right, ...left];
}

/* ----------------------------------------------------------------- a person */

/**
 * One person, as a head, a body with legs, and two arms.
 *
 * @param {object} p  a proportion table from PEOPLE
 * @returns {string[]} subpaths, all filled in the one colour
 */
function person(p) {
  const { y, w, arm } = p;
  // Small. A radius near the width of the waist rounds the chest, the waist and
  // the hip into one arc, and a figure with no waist reads as inflated rather
  // than as a person.
  const soft = w.waist * 0.3;

  const body = mirrored([
    { x: 0, y: y.chin - 0.01, r: 0 },
    { x: w.neck, y: y.chin, r: w.neck * 0.4 },
    { x: w.shoulder, y: y.shoulder, r: w.shoulder * 0.3 },
    { x: w.chest, y: y.chest, r: soft },
    { x: w.waist, y: y.waist, r: soft },
    { x: w.hip, y: y.hip, r: soft },
    { x: w.thigh, y: y.crotch + (y.knee - y.crotch) * 0.25, r: soft },
    { x: w.knee, y: y.knee, r: w.knee * 0.5 },
    { x: w.ankle, y: y.ankle, r: w.ankle * 0.5 },
    // The foot is flat on the ground, so its inner ground corner stays square.
    { x: w.foot, y: 1, r: w.foot * 0.3 },
    { x: w.footIn, y: 1, r: 0 },
    // Back up the inside of the right leg. Both edges of a leg are in the
    // table: a leg described by its outer edge alone came out four centimetres
    // wide on a grown man.
    { x: w.ankleIn, y: y.ankle, r: w.ankle * 0.4 },
    { x: w.kneeIn, y: y.knee, r: w.knee * 0.4 },
    { x: w.thighIn, y: y.crotch, r: w.thigh * 0.15 },
    { x: 0, y: y.crotch - 0.015, r: 0 },
  ]);

  const taper = arm.elbowOuter - arm.elbowInner;
  const armLoop = (side) => roundedLoop([
    { x: side * arm.topInner, y: y.shoulder + 0.014, r: arm.topInner * 0.2 },
    { x: side * arm.topOuter, y: y.shoulder + 0.004, r: (arm.topOuter - arm.topInner) * 0.6 },
    { x: side * arm.elbowOuter, y: arm.elbowY, r: taper * 0.9 },
    { x: side * arm.wristOuter, y: arm.wristY, r: (arm.wristOuter - arm.wristInner) * 0.5 },
    { x: side * arm.wristInner, y: arm.wristY, r: (arm.wristOuter - arm.wristInner) * 0.5 },
    { x: side * arm.elbowInner, y: arm.elbowY, r: taper * 0.9 },
  ]);

  return [
    ellipse(0, p.headRatio / 2, w.head, p.headRatio / 2),
    roundedLoop(body),
    armLoop(1),
    armLoop(-1),
  ];
}

/* --------------------------------------------------------- the proportions */

/**
 * Where the landmarks sit, and how wide the body is at each of them.
 *
 * One table, because the toddler is the only figure still built. It stays a
 * table rather than becoming a handful of constants so that the next age that
 * needs building is thirty numbers rather than a rewrite.
 *
 * `y` is measured down from the top of the head, `w` is a distance from the
 * centre line, and both are fractions of the figure's own total height - so
 * every table is read the same way whoever it describes. The heads-tall count
 * in each comment is the number the rest of that table was laid out from.
 *
 * A leg carries two numbers at each joint, `knee` and `kneeIn`, because it has
 * two edges and only one of them is the silhouette's outline. Describing a leg
 * by its outer edge alone and letting the inner one be a fraction of it is how
 * the first draft of this file drew a grown man with four-centimetre shins.
 */
const PEOPLE = {


  // Four and a half heads: about two years old. Short legs, no waist to speak
  // of, and a head very nearly a quarter of the whole child.
  toddler: {
    headRatio: 0.222,
    y: {
      chin: 0.222, shoulder: 0.3, chest: 0.39, waist: 0.5,
      hip: 0.565, crotch: 0.62, knee: 0.795, ankle: 0.955,
    },
    w: {
      head: 0.088, neck: 0.034, shoulder: 0.108, chest: 0.104, waist: 0.1,
      hip: 0.102, thigh: 0.1, thighIn: 0.009, knee: 0.068, kneeIn: 0.022,
      ankle: 0.048, ankleIn: 0.016, foot: 0.062, footIn: 0.014,
    },
    arm: {
      topOuter: 0.108, topInner: 0.072, elbowY: 0.47, elbowOuter: 0.156,
      elbowInner: 0.126, wristY: 0.635, wristOuter: 0.19, wristInner: 0.163,
    },
  },
};

/* ------------------------------------------------------------------ the list */

/**
 * Every shape, in the order the menu offers them.
 *
 * `width` is the figure's own width as a multiple of its height, which is how
 * the chart works out the column it needs. `label` is a phrase key: the words
 * are in the markup, in whatever language the page is.
 *
 * `inner` is null for a figure built here, because a built figure is already
 * in the unit box; a traced one carries the transform that puts it there.
 *
 * The order is the order the menu offers: the two adults, the two children,
 * the toddler, then the rectangle.
 *
 * THERE IS NO DOG HERE, AND THERE WAS
 *
 * A dog and a cat were built, in profile, with the head level with the withers
 * so that the top of the drawing would be the number beside it. Three attempts
 * in they still read as a hippopotamus and a smudge, and a quadruped seen from
 * the side standing next to four people seen from the front reads as a mistake
 * even when the drawing is good. The rectangle covers a crate or a kennel
 * honestly; a badly drawn animal would have been the first thing anybody
 * noticed about this page.
 */
export const SHAPES = [
  ...Object.entries(TRACED).map(([id, art]) => ({
    id,
    label: `shape.${id}`,
    width: art.width,
    inner: art.inner,
    paths: art.paths,
  })),
  ...Object.entries(PEOPLE).map(([id, p]) => ({
    id,
    label: `shape.${id}`,
    // The widest thing on a standing person is the hands, with a little air
    // past them so two neighbours never touch.
    width: Math.max(p.arm.wristOuter, p.w.shoulder, p.w.hip, p.w.foot) * 2 + 0.02,
    inner: null,
    paths: person(p),
  })),
  // The rectangle. It carries no paths because its shape is two numbers the
  // visitor types - a door is 90 by 200 - so the chart draws it directly.
  { id: 'object', label: 'shape.object', width: 0.6, inner: null, paths: null },
];

const BY_ID = new Map(SHAPES.map((shape) => [shape.id, shape]));

/**
 * One shape by id.
 *
 * Falls back to the first rather than throwing: an id this does not know can
 * only have come from a stale menu, and a chart drawn with one figure wrong is
 * more use than a page that stops.
 */
export function shapeOf(id) {
  return BY_ID.get(id) ?? SHAPES[0];
}
