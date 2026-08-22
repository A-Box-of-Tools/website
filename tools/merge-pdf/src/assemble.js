/**
 * Building one document out of pages taken from others.
 *
 * The naive version of this tool would copy a page dictionary into a new file
 * and be done. That produces a file that opens, and it is wrong in about six
 * ways, every one of which is invisible until somebody else opens it:
 *
 *   - A page inherits its size, its crop, its rotation and its resources from
 *     the tree above it. Copy the leaf alone and the page has no size, no
 *     fonts and no pictures. pages.js carries those four down; this file
 *     writes them onto the copy.
 *   - A page dictionary is the top of a graph, not a record. Its /Contents is
 *     a stream, its /Resources name fonts, which name descriptors, which name
 *     embedded font files. All of it has to come across, exactly once each,
 *     however many pages point at the same font.
 *   - That graph does not stop at the page. /Annots point back at the page,
 *     links point at *other* pages, form fields point up at a tree that points
 *     back down at widgets on pages that may not be in the output. Following
 *     it without a rule drags the whole source document in behind one page.
 *
 * The rule is: a reference to a page is not followed. It is looked up in the
 * table of pages that were selected, and becomes either the new page or null.
 * Everything else is copied once and cached. That one rule is what keeps a
 * one-page extract from a 400-page report to one page.
 *
 * What is deliberately not carried across is listed in `SKIPPED_PAGE_KEYS` and
 * in the two action rules below, and every item of it is reported on the page
 * afterwards rather than being quietly dropped.
 */

import { isGoTo, namedDestinations, resolveDestination } from './dests.js';
import { decodeText, normalizeRotation, readPages } from './pages.js';
import { pruneOutline, readOutline, writeOutline } from './outline.js';
import {
  isName, name, Name, PdfStream, Ref,
} from './objects.js';

/**
 * Page keys that describe where a page used to live rather than what is on it.
 *
 * /Parent is rewired to the new tree. /B is an article bead, one link in a
 * chain of them that runs through a document this page is leaving. The three
 * structure keys point into a tagged-reading-order tree that is not copied.
 * /AA is "run this when the page is opened", and /PieceInfo is the private
 * blob a layout application leaves behind so it can re-import its own work.
 */
const SKIPPED_PAGE_KEYS = new Set([
  'Parent', 'B', 'StructParents', 'Metadata', 'PieceInfo', 'AA', 'Annots',
  'Rotate', 'MediaBox', 'Type', 'LastModified', 'Tabs',
]);

/**
 * Annotation keys handled by hand rather than copied.
 *
 * /P is the page it is on, which is a new object now. /Dest and /A are where
 * it goes, which has to be rewritten against the pages that came along. /AA is
 * "run this when the pointer enters, or the page opens", and goes entirely.
 */
const ANNOT_KEYS_BY_HAND = new Set(['P', 'Dest', 'A', 'AA']);

/**
 * A document being written.
 *
 * Deliberately the same shape as the reader's PdfDocument in the four places
 * writer.js touches - `objects`, `trailer`, `getObject`, `resolve` - so that
 * the writer this tool ships is the same file the compressor ships, byte for
 * byte, rather than a second one that has to be kept in step with it.
 */
export class Build {
  constructor(version = '1.5') {
    /** @type {Map<number, any>} */
    this.objects = new Map();
    this.trailer = new Map();
    this.version = version;
    this.next = 1;
  }

  /** Claim a number now and fill it in later, which is what any structure with
   *  a cycle in it needs: a page has to know its parent's number before the
   *  parent can list its children. */
  reserve() {
    const num = this.next;
    this.next += 1;
    return num;
  }

  put(num, value) {
    this.objects.set(num, value);
    return new Ref(num, 0);
  }

  add(value) {
    return this.put(this.reserve(), value);
  }

  getObject(num) {
    return this.objects.has(num) ? this.objects.get(num) : null;
  }

  resolve(value) {
    let current = value;
    let hops = 0;
    while (current instanceof Ref) {
      if (hops > 64) return null;
      hops += 1;
      current = this.getObject(current.num);
    }
    return current;
  }

  get(dict, key) {
    return dict instanceof Map ? this.resolve(dict.get(key)) : null;
  }
}

/**
 * Everything this tool needs to know about one file the visitor chose.
 *
 * Read once, when the file is chosen, and used for every assembly afterwards -
 * the page list and the destination table do not change when pages are
 * reordered, and rebuilding them per output would make splitting a long
 * document into fifty files fifty times slower than it needs to be.
 *
 * @param {import('./reader.js').PdfDocument} doc
 * @param {string} label the file's name, for bookmark groups
 */
export function readSource(doc, label) {
  const named = namedDestinations(doc);
  return {
    doc,
    label,
    pages: readPages(doc),
    named,
    outline: readOutline(doc, named),
    version: doc.version,
  };
}

/**
 * Copies an object graph from any number of source documents into one Build.
 *
 * Per source, a map from the old object number to the new one, so that a font
 * shared by three hundred pages is copied once. Across sources there is no
 * sharing at all: two documents that both contain Helvetica each bring their
 * own, because deciding that two objects are "the same" would mean comparing
 * whole subgraphs, and getting that wrong means a page rendered with somebody
 * else's font.
 */
class Copier {
  /**
   * @param {Build} build
   * @param {Map<any, Map<string, Ref>>} placed source -> page key -> new ref
   */
  constructor(build, placed) {
    this.build = build;
    this.placed = placed;
    /** @type {Map<any, Map<number, number|null>>} */
    this.maps = new Map();
    /** @type {{source: any, from: any, to: number}[]} */
    this.queue = [];
  }

  mapFor(source) {
    let map = this.maps.get(source);
    if (!map) {
      map = new Map();
      this.maps.set(source, map);
    }
    return map;
  }

  /**
   * One reference, copied.
   *
   * The two rules that keep this bounded are both here: a page is looked up
   * rather than followed, and anything already copied is handed back rather
   * than copied again.
   */
  ref(source, from) {
    const map = this.mapFor(source);
    const seen = map.get(from.num);
    if (seen !== undefined) return seen === null ? null : new Ref(seen, 0);

    const value = source.doc.getObject(from.num);
    if (isPageNode(value)) {
      // A page, or a node of the page tree. Either it is one of the pages that
      // came along, in which case that is where this points, or it is not, and
      // this reference has no meaning in the new document.
      const landed = this.placed.get(source)?.get(from.key) ?? null;
      map.set(from.num, null); // never copied, whatever the answer
      return landed;
    }

    const num = this.build.reserve();
    map.set(from.num, num);
    // Queued rather than recursed: a font that points at a descriptor that
    // points at a file is three deep, but a form field tree in a long
    // government PDF is hundreds, and the stack is not the place for it.
    this.queue.push({ source, from: value, to: num });
    return new Ref(num, 0);
  }

  /** One value, with every reference inside it copied. */
  value(source, item, depth = 0) {
    if (depth > 100) return null;

    if (item instanceof Ref) return this.ref(source, item);

    if (Array.isArray(item)) {
      return item.map((entry) => this.value(source, entry, depth + 1));
    }

    if (item instanceof PdfStream) {
      // A new dictionary and the same bytes. New because the writer sets
      // /Filter and /Length on what it is given, and the source document may
      // be assembled again into a second output afterwards.
      return new PdfStream(this.dict(source, item.dict, depth), item.raw);
    }

    if (item instanceof Map) return this.dict(source, item, depth);

    return item; // numbers, names, strings, booleans, null
  }

  dict(source, from, depth) {
    const out = new Map();
    for (const [key, item] of from) out.set(key, this.value(source, item, depth + 1));
    return out;
  }

  /** Work through what the walk queued, until nothing new is found. */
  drain() {
    for (let at = 0; at < this.queue.length; at += 1) {
      const job = this.queue[at];
      this.build.put(job.to, this.value(job.source, job.from, 0));
    }
    this.queue.length = 0;
  }
}

/** A page, or the tree node above one. Neither is ever copied by the graph
 *  walk: pages are placed by hand, and the tree is rebuilt. */
function isPageNode(value) {
  if (!(value instanceof Map)) return false;
  if (isName(value.get('Type'), 'Page') || isName(value.get('Type'), 'Pages')) return true;
  // A page with no /Type, which is legal and not rare. /Contents alone is not
  // enough - plenty of things have one - but with a box or a parent it is.
  return value.has('Contents') && (value.has('MediaBox') || value.has('Parent'));
}

/**
 * Build one document.
 *
 * @param {{source: any, index: number, rotate: number}[]} entries the pages to
 *   put in it, in order. `index` is into `source.pages`; `rotate` is the extra
 *   quarter turns asked for, in degrees.
 * @param {{bookmarks?: boolean}} options
 * @returns {{build: Build, notes: string[], fields: number, links: number}}
 */
export function assemble(entries, { bookmarks = true } = {}) {
  if (!entries.length) throw new Error('a document with no pages in it is not a document');

  const version = entries.reduce(
    (best, entry) => (entry.source.version > best ? entry.source.version : best), '1.5');
  const build = new Build(version);

  const catalogNum = build.reserve();
  const pagesNum = build.reserve();
  const pagesRef = new Ref(pagesNum, 0);

  // Every page gets its number before any of them is copied, so that a link on
  // page 1 to page 40 can be written while page 40 is still unwritten.
  const numbers = entries.map(() => build.reserve());

  /** @type {Map<any, Map<string, Ref>>} */
  const placed = new Map();
  entries.forEach((entry, at) => {
    const page = entry.source.pages[entry.index];
    if (!page?.ref) return;
    let map = placed.get(entry.source);
    if (!map) {
      map = new Map();
      placed.set(entry.source, map);
    }
    // First occurrence wins: a page put in the output twice is one page as far
    // as any link to it is concerned, and the first is the one to land on.
    if (!map.has(page.ref.key)) map.set(page.ref.key, new Ref(numbers[at], 0));
  });

  const copier = new Copier(build, placed);
  const state = { widgets: [], links: 0, actionsDropped: 0, brokenLinks: 0 };

  entries.forEach((entry, at) => {
    build.put(numbers[at], copyPage(copier, entry, pagesRef,
      new Ref(numbers[at], 0), state));
  });

  copier.drain();

  build.put(pagesNum, new Map([
    ['Type', name('Pages')],
    ['Kids', numbers.map((num) => new Ref(num, 0))],
    ['Count', numbers.length],
  ]));

  const catalog = new Map([
    ['Type', name('Catalog')],
    ['Pages', pagesRef],
  ]);

  const notes = [];

  if (bookmarks) {
    const tree = collectOutlines(entries, placed);
    const root = writeOutline(build, tree);
    if (root) {
      catalog.set('Outlines', root);
      catalog.set('PageMode', name('UseOutlines'));
    }
  }

  const form = buildAcroForm(build, copier, state.widgets, notes);
  if (form) catalog.set('AcroForm', form);

  build.put(catalogNum, catalog);
  build.trailer.set('Root', new Ref(catalogNum, 0));
  // No /Info at all: no producer line, no creation date, no name for the tool
  // that made it. The same argument the EXIF tool makes, in a container that
  // people post to strangers rather more often than they post a JPEG.

  copier.drain(); // the form fields the widgets pointed up at

  if (state.brokenLinks) {
    notes.push(`${state.brokenLinks} link${state.brokenLinks === 1 ? '' : 's'} pointed at `
      + 'a page that is not in this file, so they were left in place with nothing behind '
      + 'them rather than sending the reader somewhere wrong.');
  }
  if (state.actionsDropped) {
    notes.push(`${state.actionsDropped} action${state.actionsDropped === 1 ? '' : 's'} `
      + 'that were neither "go to a page" nor "open a web address" - run this JavaScript, '
      + 'open this file, submit this form - were not copied.');
  }

  return { build, notes, fields: state.widgets.length, links: state.links };
}

/**
 * One page, as a new dictionary.
 *
 * The inherited four are written on explicitly rather than left to a parent,
 * because the new parent is a flat node shared by pages from several files and
 * cannot carry any of them.
 */
function copyPage(copier, entry, pagesRef, selfRef, state) {
  const { source } = entry;
  const page = source.pages[entry.index];
  const out = new Map([['Type', name('Page')], ['Parent', pagesRef]]);

  const merged = new Map();
  for (const [key, value] of page.inherited) merged.set(key, value);
  for (const [key, value] of page.dict) merged.set(key, value);

  for (const [key, value] of merged) {
    if (SKIPPED_PAGE_KEYS.has(key)) continue;
    out.set(key, copier.value(source, value, 0));
  }

  out.set('MediaBox', [...page.box]);
  const turned = normalizeRotation(page.rotate + entry.rotate);
  if (turned) out.set('Rotate', turned);

  const annots = copyAnnots(copier, source, merged.get('Annots'), selfRef, state);
  if (annots.length) out.set('Annots', annots);

  return out;
}

/** The annotations on one page: links, comments, form widgets, stamps. */
function copyAnnots(copier, source, value, selfRef, state) {
  const list = source.doc.resolve(value);
  if (!Array.isArray(list)) return [];

  const out = [];
  for (const item of list) {
    const annot = source.doc.resolve(item);
    if (!(annot instanceof Map)) continue;

    const copy = new Map();
    for (const [key, entry] of annot) {
      if (ANNOT_KEYS_BY_HAND.has(key)) continue;
      copy.set(key, copier.value(source, entry, 0));
    }
    copy.set('P', selfRef);

    if (isName(annot.get('Subtype'), 'Link')) state.links += 1;

    const dest = mapDestination(copier, source, annot.get('Dest'), state);
    if (dest) copy.set('Dest', dest);

    const action = mapAction(copier, source, annot.get('A'), state);
    if (action) copy.set('A', action);

    // A widget is one end of a form field; the other end is a tree of field
    // dictionaries that the copier has already pulled across by following
    // /Parent. Which of them is the root is worked out once, later.
    if (isName(annot.get('Subtype'), 'Widget')) {
      state.widgets.push({ source, annot });
    }

    out.push(copier.build.add(copy));
  }

  return out;
}

/** A destination, rewritten to point at where its page landed. */
function mapDestination(copier, source, value, state) {
  if (value === undefined || value === null) return null;

  const raw = value instanceof Ref ? source.doc.resolve(value) : value;
  const found = resolveDestination(source.doc, raw, source.named);
  if (!found) return null;

  const landed = copier.placed.get(source)?.get(found.ref.key);
  if (!landed) {
    state.brokenLinks += 1;
    return null;
  }

  return [landed, ...(found.view.length ? found.view.map(
    (item) => copier.value(source, item, 1)) : [name('Fit')])];
}

/**
 * An action, or nothing.
 *
 * Two kinds survive: going to a page in this document, and opening a web
 * address. Everything else - running JavaScript, launching a program, playing
 * a sound, submitting a form to a server, resetting one - is either meaningless
 * once the page has moved or is something a document should not be doing to
 * somebody who only asked for the pages in a different order.
 */
function mapAction(copier, source, value, state) {
  const action = source.doc.resolve(value);
  if (!(action instanceof Map)) return null;

  if (isGoTo(source.doc, action)) {
    const dest = mapDestination(copier, source, action.get('D'), state);
    if (!dest) return null;
    return new Map([['S', name('GoTo')], ['D', dest]]);
  }

  const kind = source.doc.resolve(action.get('S'));
  if (isName(kind, 'URI')) {
    const uri = source.doc.resolve(action.get('URI'));
    if (uri === null || uri === undefined) return null;
    const copy = new Map([['S', name('URI')], ['URI', copier.value(source, uri, 1)]]);
    if (action.has('IsMap')) copy.set('IsMap', source.doc.resolve(action.get('IsMap')));
    return copy;
  }

  if (kind instanceof Name) state.actionsDropped += 1;
  return null;
}

/* ---------------------------------------------------------------- bookmarks */

/**
 * The output's bookmark tree.
 *
 * With one file in, it is that file's own outline with the entries whose pages
 * are gone taken out. With several, each file's outline goes under a heading
 * named after the file, which is what makes a merged report navigable at all -
 * and a file with no bookmarks of its own still gets its heading, pointing at
 * its first page, so that every source is reachable from the panel.
 */
function collectOutlines(entries, placed) {
  const sources = [];
  for (const entry of entries) {
    if (!sources.includes(entry.source)) sources.push(entry.source);
  }

  const locate = (source) => (ref) => placed.get(source)?.get(ref.key) ?? null;

  if (sources.length === 1) {
    return pruneOutline(sources[0].outline, locate(sources[0]));
  }

  const tree = [];
  for (const source of sources) {
    const kids = pruneOutline(source.outline, locate(source));
    const first = entries.find((entry) => entry.source === source);
    const opening = first ? source.pages[first.index]?.ref : null;
    const page = opening ? locate(source)(opening) : null;
    if (!kids.length && !page) continue;
    tree.push({ title: source.label, page, view: [], kids });
  }
  return tree;
}

/* ------------------------------------------------------------------- forms */

/**
 * The interactive form, when the pages that came across carry one.
 *
 * A form is not the widgets on the page. The widgets are the boxes you click
 * in; the *field* - the thing with a name and a value - is a dictionary above
 * them, and the catalogue has to list every field or no reader will treat the
 * document as a form at all. So each copied widget is walked up its /Parent
 * chain to the root field, and those are what /Fields gets.
 *
 * /DR is the resource dictionary a reader uses when it has to draw a field's
 * appearance itself. Merging two documents' /DR by taking the first of each
 * name is a compromise: it is right whenever the two agree, which is nearly
 * always, since almost every form in existence draws its fields in Helvetica.
 */
function buildAcroForm(build, copier, widgets, notes) {
  if (!widgets.length) return null;

  const roots = new Map();
  /** Field name -> the files it was seen in, for the warning below. */
  const owners = new Map();

  for (const { source, annot } of widgets) {
    let node = annot;
    let ref = null;
    let hops = 0;

    // Up to the top of the field tree. A widget with no /Parent is its own
    // field, which is how every one-widget field is written.
    for (;;) {
      const parent = node.get('Parent');
      if (!(parent instanceof Ref) || hops > 32) break;
      const above = source.doc.resolve(parent);
      if (!(above instanceof Map)) break;
      ref = parent;
      node = above;
      hops += 1;
    }

    const copied = ref ? copier.ref(source, ref) : null;
    if (!copied) continue;
    roots.set(`${source.label}:${ref.key}`, copied);

    const title = decodeText(source.doc.resolve(node.get('T')));
    if (title) {
      if (!owners.has(title)) owners.set(title, new Set());
      owners.get(title).add(source.label);
    }
  }

  if (!roots.size) return null;

  const form = new Map([['Fields', [...roots.values()]]]);

  for (const { source } of widgets) {
    const acro = source.doc.get(source.doc.catalog, 'AcroForm');
    if (!(acro instanceof Map)) continue;
    for (const key of ['DA', 'Q', 'NeedAppearances', 'SigFlags']) {
      if (acro.has(key) && !form.has(key)) {
        form.set(key, copier.value(source, acro.get(key), 1));
      }
    }
    const resources = source.doc.resolve(acro.get('DR'));
    if (resources instanceof Map) {
      const into = form.get('DR') ?? new Map();
      for (const [key, value] of resources) {
        if (!into.has(key)) into.set(key, copier.value(source, value, 1));
      }
      form.set('DR', into);
    }
  }

  // Two fields with one name are one field: a reader keys on the name, so
  // typing in either fills both. That is right when the same form is in the
  // output twice and wrong when two different forms happen to call a box
  // "Name", and there is no way from here to tell which this is - so it is
  // said out loud rather than guessed at.
  const shared = [...owners.entries()].filter(([, files]) => files.size > 1);
  if (shared.length) {
    notes.push(`${shared.length} form field${shared.length === 1 ? '' : 's'} have the `
      + `same name in more than one of these files (${shared.slice(0, 3)
        .map(([field]) => `"${field}"`).join(', ')}${shared.length > 3 ? ', …' : ''}). `
      + 'A reader treats fields sharing a name as one field, so filling one will fill '
      + 'the other.');
  }

  return build.add(form);
}
