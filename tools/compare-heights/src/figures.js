/**
 * The figures a chart can hold, and how wide each one is.
 *
 * WHERE THEY COME FROM
 *
 * All four people are public-domain artwork, in traced.js beside this file and
 * as published in vendor/. People drew those, and it shows - clothes, a pose,
 * hair, the shape of a shoe on a floor. The man is the one that is not quite
 * as published: his original is a hand-traced photograph with a visibly shaky
 * edge, so the shipped copy is smoothed. traced.js says so, and a test
 * re-derives it from vendor/ rather than trusting it.
 *
 * THERE IS NO TODDLER, AND THERE WAS
 *
 * One was built here from a table of body proportions, because below school
 * age the public domain runs out: Wikimedia has one usable free child - the
 * girl - and NIH BioArt the boy, and nothing smaller. It was the only figure
 * on the chart that nobody had drawn, and it looked it standing next to four
 * that somebody had. A chart of four figures in one hand beats a chart of five
 * in two, so it is gone along with the two hundred lines that built it.
 *
 * That leaves the age argument to the artwork rather than to arithmetic, which
 * is where it belonged anyway. A two-year-old is about four and a half
 * head-heights tall, an eight-year-old six, an adult seven and a half - so a
 * scaled-down adult standing next to a real one says something false about
 * both. The boy and the girl are drawings of actual children, so the chart
 * never has to make that mistake.
 *
 * WHAT THE COORDINATES ARE
 *
 * Every figure is placed in a box one unit tall: y = 0 is the top of the head,
 * y = 1 is the ground, x = 0 is the centre line. The chart places one with a
 * single `translate(cx, topY) scale(height)`, which is why nothing here has to
 * know how tall anybody is or how many pixels a centimetre gets. `inner` is
 * the second half of that: the artwork's own bounding box mapped onto the unit
 * box, so the drawing's own coordinates never have to be rewritten.
 *
 * Nothing is stroked, which is what lets a figure of several subpaths be
 * filled in whatever colour its row picked and read as one shape.
 */

import { OBJECTS } from './objects.js';
import { TRACED } from './traced.js';

/**
 * Every shape, in the order the menu offers them: the two adults, the two
 * children, then the rectangle.
 *
 * `width` is the figure's own width as a multiple of its height, which is how
 * the chart works out the column it needs. `label` is a phrase key: the words
 * are in the markup, in whatever language the page is. `defaultCm` is what a
 * row starts at, so that adding a person draws somebody rather than an error -
 * a starting point to type over, not a claim about averages.
 */
export const SHAPES = [
  ...Object.entries(TRACED).map(([id, art]) => ({
    id,
    label: `shape.${id}`,
    width: art.width,
    inner: art.inner,
    paths: art.paths,
    // What the chart actually emits. The four that ship are path data, so it
    // is built here once; an uploaded shape arrives as markup already, from
    // import-svg.js, and is the only other thing the chart will draw.
    markup: art.paths.map((d) => `<path d="${d}"/>`).join(''),
    defaultCm: art.defaultCm,
  })),
  // The rectangle. It carries no paths because its shape is two numbers the
  // visitor types - a door is 90 by 200 - so the chart draws it directly, and
  // no default height either: it arrives from the menu of objects with both of
  // its numbers already in it, or from a person who has one in mind.
  {
    id: 'object',
    label: 'shape.object',
    width: 0.6,
    inner: null,
    paths: null,
    markup: null,
    defaultCm: 0,
  },
];

const BY_ID = new Map(SHAPES.map((shape) => [shape.id, shape]));

/**
 * The rectangle, with one of the drawings from objects.js in it.
 *
 * A preset - a door, a fridge, a sofa - arrives with both of its numbers
 * already filled in, and this is the picture that goes with them. It is still
 * the object shape: the row keeps its width box, and the drawing is stretched
 * to whatever is typed there.
 *
 * That stretching is the difference between an object and a person, and it is
 * deliberate. A person keeps the proportions the artist drew, because nobody
 * types a person's width. An object's proportions are the two numbers in front
 * of the visitor, so the drawing has to answer to them - `inner` maps the
 * artwork's own box onto the unit SQUARE rather than onto a unit-tall figure,
 * and chart.js scales the two axes separately from there.
 *
 * An id this does not know falls back to the plain rectangle, which is what
 * every object was before there was any artwork at all.
 */
export function objectShape(id) {
  const art = OBJECTS[id];
  if (!art) return BY_ID.get('object');

  const { x, y, width, height } = art.box;
  return {
    id: 'object',
    label: 'shape.object',
    width: width / height,
    inner: `scale(${1 / width} ${1 / height}) translate(${-(x + width / 2)} ${-y})`,
    paths: null,
    markup: art.markup,
    stretch: true,
    defaultCm: 0,
  };
}

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
