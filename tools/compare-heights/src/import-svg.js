/**
 * Taking a shape out of somebody's SVG, and leaving everything else behind.
 *
 * WHY THIS IS A WHITELIST AND NOT A CLEAN-UP
 *
 * An SVG is a program. It can carry `<script>`, an `onload=` on any element, a
 * `<foreignObject>` holding a whole HTML document, a `<use>` pointing into
 * another file, an `<image href="https://…">` and a stylesheet that imports
 * one. Two of those matter enormously here:
 *
 *   - the file is read on the visitor's own machine, so anything executable in
 *     it would be executing in their page, with their chart in it;
 *   - the result is DOWNLOADED and sent to other people. An `<image href>`
 *     that survived would be a chart that phones a stranger's server open on
 *     somebody else's machine, days later. This whole tool is one page-long
 *     promise that nothing here talks to anything.
 *
 * So nothing from the file is ever inserted. This module reads a tree of plain
 * objects, and BUILDS A NEW ONE containing only the handful of elements and
 * attributes below - geometry and nothing else. An attribute that is not on
 * the list does not need to be recognised as dangerous to be dropped; it is
 * dropped because it was not asked for. That is the only shape of this job
 * that stays safe when SVG grows a new feature next year.
 *
 * WHY IT TAKES PLAIN OBJECTS RATHER THAN ELEMENTS
 *
 * The parsing is the browser's - `DOMParser` on `image/svg+xml`, which builds
 * an inert document and runs nothing. main.js walks that into `{tag, attrs,
 * children}` and hands it here. Keeping the policy away from the DOM is what
 * lets the tests state it directly: a test that has to build a document to ask
 * "is `onload` dropped?" is a test nobody writes forty of.
 */

/**
 * The elements that may survive, and which of their attributes may come with
 * them. `transform` is on all of them and is safe: it is a list of numeric
 * matrix operations with nowhere to put a URL.
 *
 * Notably absent: `style` and `class` (a stylesheet can fetch), `id` (nothing
 * should be able to reference this), `fill` and `stroke` (the chart colours a
 * figure by its row, and `fill` can hold `url(#…)`), and every form of `href`.
 */
export const ALLOWED = {
  svg: ['viewBox', 'transform'],
  g: ['transform'],
  path: ['d', 'transform', 'fill-rule', 'clip-rule'],
  rect: ['x', 'y', 'width', 'height', 'rx', 'ry', 'transform'],
  circle: ['cx', 'cy', 'r', 'transform'],
  ellipse: ['cx', 'cy', 'rx', 'ry', 'transform'],
  line: ['x1', 'y1', 'x2', 'y2', 'transform'],
  polyline: ['points', 'transform'],
  polygon: ['points', 'transform'],
};

/** Elements whose geometry is worth keeping, as opposed to containers. */
const SHAPES = new Set(['path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon']);

/**
 * Numbers, and the few characters a transform list or a path needs.
 *
 * Everything kept is measured against one of these before it is written out.
 * It is belt and braces over the whitelist - `transform` cannot hold a script
 * - but a value that reaches the page should have been read by something, and
 * this is what reads it.
 */
const SAFE = {
  number: /^-?\d*\.?\d+(?:e[-+]?\d+)?$/i,
  length: /^-?\d*\.?\d+(?:e[-+]?\d+)?(?:px)?$/i,
  list: /^[\d\s,.eE+-]*$/,
  path: /^[\sMmZzLlHhVvCcSsQqTtAa\d.,+-eE]*$/,
  transform: /^[\w\s(),.eE+-]*$/,
  rule: /^(?:nonzero|evenodd)$/,
  viewBox: /^[\d\s,.eE+-]*$/,
};

const CHECK = {
  d: SAFE.path,
  points: SAFE.list,
  transform: SAFE.transform,
  viewBox: SAFE.viewBox,
  'fill-rule': SAFE.rule,
  'clip-rule': SAFE.rule,
};

/** How much of a file is worth reading. Past this it is not a shape. */
export const LIMITS = {
  bytes: 2 * 1024 * 1024,
  elements: 4000,
  path: 400000,
};

const num = (attrs, name, fallback = 0) => {
  const value = attrs[name];
  return value !== undefined && SAFE.length.test(String(value).trim())
    ? Number.parseFloat(value) : fallback;
};

/**
 * One shape as path data.
 *
 * Everything becomes a `<path>` so that what ships is one kind of element with
 * one kind of attribute, rather than six of each. A `line` and a `polyline`
 * are closed on the way through: this tool fills a silhouette in one colour
 * and never strokes, so an open outline would otherwise vanish.
 */
export function toPath(tag, attrs) {
  const n = (name, fallback) => num(attrs, name, fallback);
  const points = String(attrs.points ?? '').trim();

  switch (tag) {
    case 'path':
      return CHECK.d.test(String(attrs.d ?? '')) ? String(attrs.d ?? '') : null;
    case 'rect': {
      const w = n('width');
      const h = n('height');
      if (w <= 0 || h <= 0) return null;
      const x = n('x');
      const y = n('y');
      // Rounded corners are kept, because a rounded rectangle that arrived
      // rounded and came out square is the tool editing somebody's drawing.
      const rx = Math.min(n('rx', n('ry')), w / 2);
      const ry = Math.min(n('ry', n('rx')), h / 2);
      if (rx > 0 && ry > 0) {
        return `M${x + rx} ${y}H${x + w - rx}A${rx} ${ry} 0 0 1 ${x + w} ${y + ry}`
          + `V${y + h - ry}A${rx} ${ry} 0 0 1 ${x + w - rx} ${y + h}`
          + `H${x + rx}A${rx} ${ry} 0 0 1 ${x} ${y + h - ry}`
          + `V${y + ry}A${rx} ${ry} 0 0 1 ${x + rx} ${y}Z`;
      }
      return `M${x} ${y}h${w}v${h}h${-w}Z`;
    }
    case 'circle': {
      const r = n('r');
      if (r <= 0) return null;
      const cx = n('cx');
      const cy = n('cy');
      return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0Z`;
    }
    case 'ellipse': {
      const rx = n('rx');
      const ry = n('ry');
      if (rx <= 0 || ry <= 0) return null;
      const cx = n('cx');
      const cy = n('cy');
      return `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${rx * 2} 0a${rx} ${ry} 0 1 0 ${-rx * 2} 0Z`;
    }
    case 'line':
      return `M${n('x1')} ${n('y1')}L${n('x2')} ${n('y2')}Z`;
    case 'polyline':
    case 'polygon':
      return SAFE.list.test(points) && points ? `M${points}Z` : null;
    default:
      return null;
  }
}

/** XML-escape an attribute value. */
const escape = (text) => String(text)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/**
 * Rebuild one node, keeping only what is on the list.
 *
 * Returns null for anything that is not allowed, has no geometry left, or
 * holds nothing worth drawing - so a `<g>` full of `<script>` disappears with
 * its contents rather than becoming an empty group.
 */
function rebuild(node, count) {
  if (!node || typeof node.tag !== 'string') return null;
  const tag = node.tag.toLowerCase().replace(/^.*:/, '');
  const allowed = ALLOWED[tag];
  if (!allowed) return null;
  if (count.n >= LIMITS.elements) return null;
  count.n += 1;

  const attrs = {};
  for (const name of allowed) {
    const raw = node.attrs?.[name];
    if (raw === undefined || raw === null) continue;
    const value = String(raw).trim();
    if (!value) continue;
    const check = CHECK[name] ?? SAFE.length;
    if (!check.test(value)) continue;
    attrs[name] = value;
  }

  const children = [];
  for (const child of node.children ?? []) {
    const kept = rebuild(child, count);
    if (kept) children.push(kept);
  }

  if (SHAPES.has(tag)) {
    const d = toPath(tag, attrs);
    if (!d) return null;
    const kept = { tag: 'path', attrs: { d } };
    if (attrs.transform) kept.attrs.transform = attrs.transform;
    if (attrs['fill-rule']) kept.attrs['fill-rule'] = attrs['fill-rule'];
    if (attrs['clip-rule']) kept.attrs['clip-rule'] = attrs['clip-rule'];
    return kept;
  }

  if (!children.length) return null;
  // The root's own viewBox is not carried: the chart measures the shape it
  // actually got and scales that, so a viewBox with empty margins in it would
  // only make the drawing smaller than the box the chart gives it.
  const wrapper = { tag: tag === 'svg' ? 'g' : 'g', attrs: {}, children };
  if (attrs.transform) wrapper.attrs.transform = attrs.transform;
  return wrapper;
}

/** The kept tree as markup: `g` and `path`, and nothing else. */
export function serialise(node) {
  if (!node) return '';
  const attrs = Object.entries(node.attrs ?? {})
    .map(([name, value]) => ` ${name}="${escape(value)}"`).join('');
  if (node.tag === 'path') return `<path${attrs}/>`;
  return `<g${attrs}>${(node.children ?? []).map(serialise).join('')}</g>`;
}

/**
 * A parsed tree in, drawable markup out.
 *
 * @param {{tag: string, attrs: object, children: array}} root
 * @returns {{markup: string, shapes: number}|{error: string}} `error` is a
 *   phrase key: the words are in the markup, in whatever language the page is.
 */
export function importSvg(root) {
  const count = { n: 0 };
  const kept = rebuild(root, count);
  if (!kept) return { error: 'svg.noshapes' };

  const markup = serialise(kept);
  if (markup.length > LIMITS.path) return { error: 'svg.toobig' };

  const shapes = (markup.match(/<path/g) ?? []).length;
  if (!shapes) return { error: 'svg.noshapes' };
  return { markup, shapes };
}
