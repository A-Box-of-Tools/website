/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { SHAPES, shapeOf } from './figures.js';
import { FONT, chartSvg, isDark } from './chart.js';
import { format, formatBoth, parseHeight, toInput } from './units.js';
import { download, svgBlob, svgToPng } from './save.js';

const $ = (id) => document.getElementById(id);

const el = {
  rows: $('rows'),
  rowHead: document.querySelector('.row-head'),
  rowCount: $('row-count'),
  addPerson: $('add-person'),
  addObject: $('add-object'),
  clear: $('clear'),
  preset: $('preset'),
  inputError: $('input-error'),
  unit: $('unit'),
  order: $('order'),
  showRuler: $('show-ruler'),
  showNames: $('show-names'),
  background: $('background'),
  transparent: $('transparent'),
  size: $('size'),
  preview: $('preview'),
  facts: $('facts'),
  downloadSvg: $('download-svg'),
  downloadPng: $('download-png'),
  copyPng: $('copy-png'),
  downloadNote: $('download-note'),
  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
  networkCount: $('network-count'),
  networkDot: $('network-dot'),
  offlineStatus: $('offline-status'),
  offlineDot: $('offline-dot'),
};

/**
 * As many figures as the chart can hold and stay readable.
 *
 * Not a technical limit: the picture would draw thirty. It is that past a
 * dozen the columns are narrower than the names over them, and a chart nobody
 * can read is not a chart.
 */
const MOST = 12;

/**
 * The colours a new row gets, in order.
 *
 * Chosen to stay apart from each other on a white background and on a dark
 * one, because the chart is drawn on whichever the visitor picks and a palette
 * tuned for one of those disappears on the other.
 */
const PALETTE = [
  '#4a80d4', '#e0794a', '#3f9e72', '#a668c8',
  '#c9913a', '#3f9fae', '#cc6188', '#7c8797',
];

/** What "add a person" adds, in turn, so a fresh chart is not four identical men. */
const PEOPLE_ORDER = ['man', 'woman', 'boy', 'girl'];

/** Every row on the chart. The DOM node for each is kept on the row itself. */
let rows = [];
let counter = 0;

/** The picture as it stands, so both downloads are the thing on screen. */
let current = null;

/* ------------------------------------------------------------- measuring text */

// One canvas for the whole page. It never gets a pixel drawn on it: it exists
// so the layout can ask the browser how wide a name is going to be before the
// chart decides how wide that name's column has to be.
const gauge = document.createElement('canvas').getContext('2d');

function measure(text, fontPx, weight = 400) {
  gauge.font = `${weight} ${fontPx}px ${FONT}`;
  return gauge.measureText(String(text)).width;
}

/* --------------------------------------------------------------------- rows */

function unit() {
  return el.unit.value;
}

function heightPlaceholder() {
  return phrase(unit() === 'ft' ? 'row.heightexampleft' : 'row.heightexample');
}

/**
 * A row, ready to draw.
 *
 * The height starts at the figure's own default rather than empty, so adding a
 * person puts somebody on the chart instead of a row asking to be filled in.
 * It is a number to type over: the point of the tool is the heights you know,
 * and a chart that draws nothing until you have typed one is a chart that
 * opens as a form.
 */
function addRow(shape, values = {}) {
  if (rows.length >= MOST) return null;

  counter += 1;
  const start = shapeOf(shape).defaultCm;
  const row = {
    key: counter,
    shape,
    name: values.name ?? '',
    height: values.height ?? (start ? toInput(start, unit()) : ''),
    width: values.width ?? '',
    colour: values.colour ?? PALETTE[(rows.length) % PALETTE.length],
  };

  row.node = buildRow(row);
  rows.push(row);
  return row;
}

/** The controls for one row. Rebuilt only when rows are added, moved or removed. */
function buildRow(row) {
  const node = document.createElement('div');
  node.className = 'row';

  const shape = document.createElement('select');
  shape.className = 'row-shape';
  for (const option of SHAPES) shape.append(new Option(phrase(option.label), option.id));
  shape.value = row.shape;
  shape.addEventListener('change', () => {
    const was = shapeOf(row.shape).defaultCm;
    row.shape = shape.value;
    // Swapping a figure moves the height with it, but only while the height is
    // still the one that arrived with the old figure: a number somebody typed
    // is theirs, and changing the drawing is not a reason to lose it.
    const now = shapeOf(row.shape).defaultCm;
    if (now && was && row.height.trim() === toInput(was, unit())) {
      row.height = toInput(now, unit());
      height.value = row.height;
    }
    node.classList.toggle('is-object', row.shape === 'object');
    draw();
  });

  const name = document.createElement('input');
  name.type = 'text';
  name.className = 'row-name';
  name.value = row.name;
  name.placeholder = phrase('row.nameexample');
  name.addEventListener('input', () => { row.name = name.value; draw(); });

  const heightCell = document.createElement('div');
  heightCell.className = 'row-cell';
  const height = document.createElement('input');
  height.type = 'text';
  height.className = 'row-height';
  height.value = row.height;
  height.placeholder = heightPlaceholder();
  height.inputMode = 'decimal';
  const reads = document.createElement('span');
  reads.className = 'row-reads';
  heightCell.append(height, reads);
  height.addEventListener('input', () => { row.height = height.value; draw(); });

  const width = document.createElement('input');
  width.type = 'text';
  width.className = 'row-width';
  width.value = row.width;
  width.placeholder = phrase('row.widthexample');
  width.inputMode = 'decimal';
  width.addEventListener('input', () => { row.width = width.value; draw(); });

  const colour = document.createElement('input');
  colour.type = 'color';
  colour.className = 'row-colour';
  colour.value = row.colour;
  colour.addEventListener('input', () => { row.colour = colour.value; draw(); });

  // The handle. A span rather than a button, because it does nothing a click
  // could do: the keyboard route to the same job is the two arrows beside it,
  // which is why dragging is allowed to be pointer-only without leaving
  // anybody out.
  const grip = document.createElement('span');
  grip.className = 'row-grip';
  grip.setAttribute('aria-hidden', 'true');
  grip.title = phrase('row.drag');
  grip.textContent = '⠿';
  grip.addEventListener('pointerdown', (event) => startDrag(event, row));

  const tools = document.createElement('div');
  tools.className = 'row-tools';
  const up = iconButton('&#8593;', () => move(row, -1));
  const down = iconButton('&#8595;', () => move(row, 1));
  const remove = iconButton('&#215;', () => {
    rows = rows.filter((other) => other !== row);
    paintRows();
    draw();
  });
  remove.classList.add('danger');
  tools.append(up, down, remove);

  node.append(grip, shape, name, heightCell, width, colour, tools);
  node.classList.toggle('is-object', row.shape === 'object');

  // Kept for the renaming pass in paintRows: the aria-labels carry a row
  // number, and every number after a removed row has just changed.
  row.controls = {
    shape, name, height, width, colour, up, down, remove, reads,
  };
  return node;
}

/**
 * Move one row to a new place in the list.
 *
 * Reordering by hand is a statement about the order, so it takes the chart off
 * "tallest first" if it was on it. The alternative is a drag that visibly does
 * nothing, which reads as a broken control rather than as a setting somewhere
 * else winning.
 */
function reorder(row, to) {
  const at = rows.indexOf(row);
  if (to < 0 || to >= rows.length || to === at) return false;
  rows.splice(at, 1);
  rows.splice(to, 0, row);
  if (el.order.value !== 'entered') el.order.value = 'entered';
  return true;
}

function move(row, by) {
  if (!reorder(row, rows.indexOf(row) + by)) return;
  paintRows();
  draw();
  // The button the visitor pressed has just been re-appended, and a control
  // that loses focus when it is used cannot be pressed twice by a keyboard.
  row.controls[by < 0 ? 'up' : 'down'].focus();
}

/* ------------------------------------------------------------- dragging a row */

/** The row being dragged, while one is. */
let dragged = null;

/**
 * Which slot the pointer is over.
 *
 * The rows are read from the page rather than from the model because the
 * dragged row is still in the flow: it moves as the list is reordered, which
 * is what makes the drag look like the thing it is doing.
 */
function slotAt(y) {
  for (let i = 0; i < rows.length; i += 1) {
    const box = rows[i].node.getBoundingClientRect();
    if (y < box.top + box.height / 2) return i;
  }
  return rows.length - 1;
}

function onDragMove(event) {
  if (!dragged) return;
  // Without this a touch drag scrolls the page instead of moving the row.
  event.preventDefault();
  if (reorder(dragged, slotAt(event.clientY))) {
    paintRows();
    draw();
  }
}

function endDrag() {
  if (!dragged) return;
  dragged.node.classList.remove('is-dragging');
  dragged = null;
  document.body.classList.remove('is-reordering');
  window.removeEventListener('pointermove', onDragMove);
  window.removeEventListener('pointerup', endDrag);
  window.removeEventListener('pointercancel', endDrag);
}

/**
 * Start a drag.
 *
 * The listeners go on the window rather than on the row, and there is no
 * pointer capture: paintRows() re-appends every row node as the order changes,
 * and a captured pointer is released the moment its element leaves the
 * document - so the drag would end on the first swap.
 */
function startDrag(event, row) {
  if (event.button > 0) return;
  event.preventDefault();
  dragged = row;
  row.node.classList.add('is-dragging');
  document.body.classList.add('is-reordering');
  window.addEventListener('pointermove', onDragMove, { passive: false });
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
}

function iconButton(html, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'icon';
  button.innerHTML = html;
  button.addEventListener('click', onClick);
  return button;
}

/**
 * Put the rows back on the page in their current order, and renumber them.
 *
 * The numbers are only in the aria-labels, which is exactly why they need
 * doing here: a sighted visitor can see that a row moved, and a screen reader
 * would otherwise be told about "row 3" twice.
 */
function paintRows() {
  el.rows.replaceChildren(el.rowHead, ...rows.map((row) => row.node));

  rows.forEach((row, index) => {
    const n = index + 1;
    const { controls } = row;
    controls.shape.setAttribute('aria-label', phrase('row.shape', { n }));
    controls.name.setAttribute('aria-label', phrase('row.name', { n }));
    controls.height.setAttribute('aria-label', phrase('row.height', { n }));
    controls.width.setAttribute('aria-label', phrase('row.width', { n }));
    controls.colour.setAttribute('aria-label', phrase('row.colour', { n }));
    controls.up.setAttribute('aria-label', phrase('row.up', { n }));
    controls.down.setAttribute('aria-label', phrase('row.down', { n }));
    controls.remove.setAttribute('aria-label', phrase('row.remove', { n }));
    controls.up.disabled = index === 0;
    controls.down.disabled = index === rows.length - 1;
  });

  const full = rows.length >= MOST;
  el.addPerson.disabled = full;
  el.addObject.disabled = full;
  el.preset.disabled = full;
  el.rowCount.textContent = full ? phrase('chart.full') : '';
}

/* ------------------------------------------------------------------ drawing */

/** Every row that has a height this understands, with its errors reported. */
function readRows() {
  const ready = [];

  for (const row of rows) {
    const parsed = parseHeight(row.height, unit());
    const { reads } = row.controls;

    if (parsed.error) {
      // An empty box reads as an error like any other. It used to be a neutral
      // hint, on the grounds that a row you have not filled in yet is not a
      // mistake - but every row now arrives with a height in it, so an empty
      // one is a box somebody has cleared, and a row that will not be drawn
      // should say so where the reading would have been.
      reads.textContent = phrase(parsed.error);
      reads.className = 'row-reads bad';
      continue;
    }

    reads.textContent = phrase('row.reads', { height: formatBoth(parsed.cm, unit()) });
    reads.className = 'row-reads';

    const shape = shapeOf(row.shape);
    let widthCm = 0;
    if (!shape.paths) {
      const wide = parseHeight(row.width, unit());
      widthCm = wide.error ? parsed.cm * shape.width : wide.cm;
    }

    ready.push({
      shape,
      name: row.name.trim(),
      label: format(parsed.cm, unit()),
      cm: parsed.cm,
      widthCm,
      colour: row.colour,
    });
  }

  return ready;
}

function sorted(figures) {
  if (el.order.value === 'tallest') return [...figures].sort((a, b) => b.cm - a.cm);
  if (el.order.value === 'shortest') return [...figures].sort((a, b) => a.cm - b.cm);
  return figures;
}

function draw() {
  const figures = sorted(readRows());

  if (!figures.length) {
    current = null;
    el.preview.replaceChildren();
    // Two different nothings: a chart with no rows at all, and a chart whose
    // rows have all had their heights emptied. The second is a mistake to
    // correct rather than a step not taken yet.
    el.facts.textContent = phrase(rows.length ? 'chart.noheights' : 'chart.empty');
    setDownloads(false);
    return;
  }

  const background = el.background.value;
  const result = chartSvg(figures, {
    plotHeight: Number(el.size.value) || 900,
    unit: unit(),
    background: el.transparent.checked ? 'none' : background,
    // Read off the colour swatch even when the background is switched off:
    // whoever is dropping a transparent chart onto a dark slide has told us
    // what it is landing on, and the ruler has to be legible against that.
    ink: isDark(background) ? '#ffffff' : '#16191d',
    showRuler: el.showRuler.checked,
    showNames: el.showNames.checked,
  }, measure);

  current = result;
  el.preview.innerHTML = result.svg;

  el.facts.textContent = phrase(figures.length === 1 ? 'facts.one' : 'facts.chart', {
    count: figures.length,
    width: result.width,
    height: result.height,
    top: format(result.topCm, unit()),
    step: format(result.step, unit()),
  });
  setDownloads(true);
}

function setDownloads(ready) {
  el.downloadSvg.disabled = !ready;
  el.downloadPng.disabled = !ready;
  el.copyPng.disabled = !ready;
}

/* ------------------------------------------------------------ taking it away */

function note(text, bad = false) {
  el.downloadNote.textContent = text;
  el.downloadNote.className = bad ? 'field-summary warn' : 'field-summary';
}

el.downloadSvg.addEventListener('click', () => {
  if (!current) return note(phrase('save.nothing'), true);
  download(svgBlob(current.svg), 'height-chart.svg');
  return note(phrase('save.done'));
});

el.downloadPng.addEventListener('click', async () => {
  if (!current) return note(phrase('save.nothing'), true);
  try {
    download(await svgToPng(current.svg, current), 'height-chart.png');
    return note(phrase('save.done'));
  } catch (error) {
    return note(phrase('save.failed', { detail: phrase(error.message) }), true);
  }
});

el.copyPng.addEventListener('click', async () => {
  if (!current) return note(phrase('save.nothing'), true);
  try {
    const blob = await svgToPng(current.svg, current);
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    return note(phrase('save.copied'));
  } catch {
    return note(phrase('save.noclipboard'), true);
  }
});

/* ------------------------------------------------------------------ the form */

el.addPerson.addEventListener('click', () => {
  const people = rows.filter((row) => shapeOf(row.shape).paths).length;
  addRow(PEOPLE_ORDER[people % PEOPLE_ORDER.length]);
  paintRows();
  draw();
});

el.addObject.addEventListener('click', () => {
  addRow('object');
  paintRows();
  draw();
});

el.clear.addEventListener('click', () => {
  rows = [];
  paintRows();
  draw();
});

el.preset.addEventListener('change', () => {
  const option = el.preset.selectedOptions[0];
  const cm = Number(option?.dataset.cm);
  if (cm) {
    addRow('object', {
      name: option.textContent.split('—')[0].trim(),
      height: toInput(cm, unit()),
      width: toInput(Number(option.dataset.width), unit()),
    });
    paintRows();
    draw();
  }
  el.preset.value = '';
});

/**
 * Switching units rewrites what is in the boxes rather than reinterpreting it.
 *
 * A bare `178` means centimetres on a metric chart and inches on an imperial
 * one - which is the right rule for typing and a trap for switching, because
 * it would silently turn a person into a four-and-a-half-metre one. So every
 * height that already parsed is written out again in the new notation, and the
 * chart does not move.
 */
let previousUnit = 'cm';

el.unit.addEventListener('change', () => {
  const next = unit();
  for (const row of rows) {
    for (const field of ['height', 'width']) {
      const parsed = parseHeight(row[field], previousUnit);
      if (parsed.error) continue;
      row[field] = toInput(parsed.cm, next);
      row.controls[field].value = row[field];
    }
    row.controls.height.placeholder = heightPlaceholder();
  }
  previousUnit = next;
  draw();
});

for (const control of [el.order, el.showRuler, el.showNames, el.background,
  el.transparent, el.size]) {
  control.addEventListener('input', draw);
  control.addEventListener('change', draw);
}

/* ------------------------------------------------------ the live network check */

/* ------------------------------------------------- privacy panel + offline */

// The header's toggle, which every other tool on the site wires and this one
// did not. The panel it opens is the live network check - the page's own
// evidence for the claim it makes - so a toggle that does nothing is the one
// control here it is worst to leave dead. It went unnoticed because nothing
// throws: the elements are looked up, the listener is simply never added.
el.privacyToggle.addEventListener('click', () => {
  const open = el.privacyPanel.hidden;
  el.privacyPanel.hidden = !open;
  el.privacyToggle.setAttribute('aria-expanded', String(open));
});

// Google's ad and measurement scripts, and the donate button's. They are the
// price of the site being free, they are loaded without the visitor asking, and
// none of them is handed anything typed into this page - so they are reported
// as themselves rather than counted as an intruder.
const PLATFORM_HOSTS = /(^|\.)(googlesyndication\.com|doubleclick\.net|googleadservices\.com|googletagservices\.com|adtrafficquality\.google|googletagmanager\.com|google-analytics\.com|gstatic\.com|googleapis\.com|buymeacoffee\.com|cloudflareinsights\.com|google\.[a-z]{2,3}(\.[a-z]{2})?)$/;

/**
 * Report what this page has actually fetched.
 *
 * The claim on trial is not "this page is silent" - it is not, it carries ads -
 * but that nothing has carried away what was typed into it. Here that is a
 * list of names and how tall each of them is, which is a more personal thing
 * to have taken than most of what this site handles.
 */
function monitorNetwork() {
  const platform = new Set();
  const external = new Set();

  const inspect = (entries) => {
    for (const entry of entries) {
      if (entry.name.startsWith('blob:') || entry.name.startsWith('data:')) continue;
      const url = new URL(entry.name, location.href);
      if (url.origin === location.origin) continue;
      if (PLATFORM_HOSTS.test(url.hostname)) platform.add(url.hostname);
      else external.add(url.hostname);
    }
    const total = performance.getEntriesByType('resource')
      .filter((entry) => !entry.name.startsWith('blob:') && !entry.name.startsWith('data:')).length;

    const clean = external.size === 0;
    // One phrase per number rather than a pluralising helper: a language whose
    // plural is not a suffix has to be able to translate the two separately.
    const platformNote = platform.size
      ? phrase(platform.size === 1 ? 'net.platform.one' : 'net.platform.many',
               { hosts: platform.size })
      : '';

    el.networkCount.textContent = clean
      ? phrase('net.clean', { total, platform: platformNote })
      : phrase('net.dirty', { hosts: [...external].join(', '), platform: platformNote });

    el.networkCount.className = clean ? 'good' : 'warn';
    el.networkDot.className = `live-dot ${clean ? 'good' : 'warn'}`;
  };

  inspect(performance.getEntriesByType('resource'));
  try {
    new PerformanceObserver((list) => inspect(list.getEntries()))
      .observe({ type: 'resource', buffered: true });
  } catch {
    // PerformanceObserver is unavailable; the one-time snapshot above stands.
  }
}

async function registerServiceWorker() {
  // Keep the visible text short: this sits in the trust panel, and a raw
  // browser error dumped there reads worse than it is.
  const fail = (message, detail) => {
    el.offlineStatus.textContent = message;
    el.offlineDot.className = 'live-dot';
    if (detail) {
      el.offlineStatus.title = detail;
      console.info('Offline caching unavailable:', detail);
    }
  };

  if (!('serviceWorker' in navigator)) {
    fail(phrase('offline.none'));
    return;
  }
  if (!window.isSecureContext) {
    fail(phrase('offline.insecure'));
    return;
  }

  try {
    await navigator.serviceWorker.register('sw.js');
    await navigator.serviceWorker.ready;
    el.offlineStatus.textContent = phrase('offline.ready');
    el.offlineStatus.className = 'good';
    el.offlineDot.className = 'live-dot good';
  } catch (error) {
    fail(phrase('offline.failed'), error.message);
  }
}

/* -------------------------------------------------------------------- boot */

// An error thrown after boot would otherwise only reach the console, leaving
// the page looking functional but doing nothing.
window.addEventListener('error', (event) => {
  el.inputError.hidden = false;
  el.inputError.textContent = phrase('error.broke', { detail: event.message });
});
window.addEventListener('unhandledrejection', (event) => {
  el.inputError.hidden = false;
  el.inputError.textContent = phrase('error.broke', {
    detail: event.reason?.message ?? event.reason,
  });
});

// Two people to start with, so the page arrives as a chart rather than as an
// empty form. Their heights are the figures' own defaults, from the same place
// every other row gets one. Neither is named: the heights alone say what the
// tool does, and a pair of invented names would be somebody's idea of a name
// in fifteen languages.
addRow('man');
addRow('woman');
paintRows();
draw();

monitorNetwork();
registerServiceWorker();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
