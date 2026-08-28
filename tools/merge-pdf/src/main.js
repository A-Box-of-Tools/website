/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { readSource } from './assemble.js';
import { bytes, count as countOf, shortName } from './format.js';
import { sizeLabel } from './pages.js';
import { describeRanges, parseRanges } from './plan.js';
import { produce } from './produce.js';
import { EncryptedPdfError, NotAPdfError, PdfDocument } from './reader.js';
import { wireFilePicker, readingLabel } from './shared/file-picker.js';

const $ = (id) => document.getElementById(id);

// format.js cannot reach the DOM, so the words come to it. Bound once here
// rather than passed at every call site.
const humanBytes = (n) => bytes(n, phrase);
const count = (n, noun) => countOf(n, noun, phrase);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  loadError: $('load-error'),
  loadNote: $('load-note'),
  sourceList: $('source-list'),

  pagesCard: $('pages-card'),
  countLabel: $('count-label'),
  reverse: $('reverse'),
  rotateAll: $('rotate-all'),
  restore: $('restore'),
  clearAll: $('clear-all'),
  range: $('range'),
  rangeKeep: $('range-keep'),
  rangeDrop: $('range-drop'),
  rangeTurn: $('range-turn'),
  rangeError: $('range-error'),
  pageList: $('page-list'),

  outputCard: $('output-card'),
  splitModes: $('split-modes'),
  splitSize: $('split-size'),
  splitAt: $('split-at'),
  byFilePreset: $('by-file-preset'),
  keepBookmarks: $('keep-bookmarks'),
  outputSummary: $('output-summary'),

  runCard: $('run-card'),
  run: $('run'),
  cancel: $('cancel'),
  progress: $('progress'),
  progressBar: $('progress-bar'),
  progressLabel: $('progress-label'),
  runError: $('run-error'),
  result: $('result'),
  resultSize: $('result-size'),
  resultSub: $('result-sub'),
  download: $('download'),
  checkLine: $('check-line'),
  resultFacts: $('result-facts'),
  fileList: $('file-list'),

  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
  networkCount: $('network-count'),
  networkDot: $('network-dot'),
  offlineStatus: $('offline-status'),
  offlineDot: $('offline-dot'),
};

/**
 * The files chosen, in the order they were chosen.
 * @type {{source: any, name: string, size: number}[]}
 */
let sources = [];

/**
 * The running order: one entry per page that will be written, which is not the
 * same thing as one per page that was read. A page can appear twice, and a page
 * that was removed has no entry at all.
 * @type {{source: any, index: number, rotate: number}[]}
 */
let entries = [];

let running = null;
/** Object URLs behind the download links, revoked when they are replaced. */
let urls = [];

/* ------------------------------------------------------------------ loading */

const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles(files) {
    addFiles(files);
  },
});

/**
 * Read the chosen files and put their pages at the end of the running order.
 *
 * Appending rather than replacing is what makes merging work at all: the
 * second file is chosen after the first, often from a different folder, and a
 * picker that started over each time would make the tool useless for the job
 * it is named after.
 */
async function addFiles(files) {
  if (running) return;

  picker.busy(readingLabel(files.length));
  el.loadError.hidden = true;

  const refused = [];
  const notes = [];

  for (const file of files) {
    try {
      if (!looksLikePdf(file)) {
        refused.push(phrase('load.notpdf', { name: file.name }));
        continue;
      }

      const raw = new Uint8Array(await file.arrayBuffer());
      const doc = await PdfDocument.open(raw);
      const source = readSource(doc, file.name);

      if (!source.pages.length) {
        refused.push(phrase('load.nopages', { name: file.name }));
        continue;
      }

      sources.push({ source, name: file.name, size: file.size });
      for (let index = 0; index < source.pages.length; index += 1) {
        entries.push({ source, index, rotate: 0 });
      }

      if (doc.repaired) {
        notes.push(phrase('load.repaired', { name: file.name }));
      }
    } catch (error) {
      refused.push(phrase('load.failed', { name: file.name, reason: messageFor(error) }));
    }
  }

  picker.done();

  if (refused.length) showLoadError(refused.join('\n'));
  if (notes.length) note(notes.join(' '));
  else el.loadNote.hidden = true;

  render();
}

function looksLikePdf(file) {
  return file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
}

/**
 * The reader's own messages are written for the compressor, which is the other
 * tool that uses it. Two of them are worth saying differently here.
 */
function messageFor(error) {
  if (error instanceof EncryptedPdfError) return phrase('read.locked');
  if (error instanceof NotAPdfError) return phrase(error.message);
  if (error?.name === 'AbortError') return phrase('read.cancelled');
  return phrase('read.unreadable', { detail: error?.message ?? error });
}

function showLoadError(text) {
  el.loadError.textContent = text;
  el.loadError.hidden = false;
}

function note(text) {
  el.loadNote.textContent = text;
  el.loadNote.hidden = false;
}

/* ------------------------------------------------------------- the sources */

function renderSources() {
  el.sourceList.hidden = sources.length === 0;
  el.sourceList.replaceChildren(...sources.map((item) => {
    const row = document.createElement('li');
    row.className = 'source-row';

    const main = document.createElement('div');
    main.className = 'source-main';

    const name = document.createElement('strong');
    name.className = 'source-name';
    name.textContent = item.name;
    name.title = item.name;

    const facts = document.createElement('span');
    facts.className = 'source-facts';
    const used = entries.filter((entry) => entry.source === item.source).length;
    const total = item.source.pages.length;
    facts.textContent = phrase(
      used === total ? 'source.facts' : 'source.facts.some',
      { size: humanBytes(item.size), pages: count(total, 'page'), used });

    main.append(name, facts);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'ghost danger';
    remove.textContent = 'Remove';
    remove.setAttribute('aria-label', phrase('source.remove', { name: item.name }));
    remove.addEventListener('click', () => {
      if (running) return;
      sources = sources.filter((other) => other !== item);
      entries = entries.filter((entry) => entry.source !== item.source);
      render();
    });

    row.append(main, remove);
    return row;
  }));
}

/* --------------------------------------------------------------- the pages */

let dragIndex = null;
/** Where the dragged page would land: { index, after } */
let dropAt = null;

function clearDropMarkers() {
  for (const node of el.pageList.querySelectorAll('.insert-before, .insert-after')) {
    node.classList.remove('insert-before', 'insert-after');
  }
}

/**
 * One page, as a tile.
 *
 * There is no picture on it, and that is a decision rather than an omission:
 * drawing a page means a renderer - fonts, shading, blend modes, the lot -
 * which is a megabyte of engine for a thumbnail. What a person reordering
 * pages actually works from is the number, the paper size and which file it
 * came out of, so the tile shows those, at the shape and the rotation the page
 * will have in the finished document.
 */
function buildPageNode(entry, index) {
  const page = entry.source.pages[entry.index];
  const li = document.createElement('li');
  li.className = 'page-item';
  li.dataset.index = String(index);

  const handle = document.createElement('button');
  handle.type = 'button';
  handle.className = 'drag-handle';
  handle.draggable = true;
  handle.textContent = '⋮⋮';
  handle.title = phrase('page.drag', { n: index + 1 });
  handle.setAttribute('aria-label', handle.title);

  const shapeWrap = document.createElement('div');
  shapeWrap.className = 'shape-wrap';
  shapeWrap.draggable = true;

  const turned = entry.rotate % 180 !== 0;
  const width = turned ? page.height : page.width;
  const height = turned ? page.width : page.height;

  const shape = document.createElement('div');
  shape.className = 'page-shape';
  shape.style.aspectRatio = `${Math.max(1, width)} / ${Math.max(1, height)}`;

  const number = document.createElement('span');
  number.className = 'page-number';
  number.textContent = String(index + 1);
  shape.append(number);

  if (entry.rotate % 360 !== 0) {
    const turn = document.createElement('span');
    turn.className = 'turn-badge';
    turn.textContent = `${((entry.rotate % 360) + 360) % 360}°`;
    turn.title = phrase('page.turned');
    shape.append(turn);
  }

  shapeWrap.append(shape);

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'remove-btn';
  remove.textContent = '×';
  remove.title = phrase('page.remove', { n: index + 1 });
  remove.setAttribute('aria-label', remove.title);
  remove.addEventListener('click', () => {
    if (running) return;
    entries.splice(index, 1);
    render();
  });
  shapeWrap.append(remove);

  const meta = document.createElement('div');
  meta.className = 'page-meta';

  if (sources.length > 1) {
    const from = document.createElement('p');
    from.className = 'page-from';
    from.textContent = shortName(entry.source.label);
    from.title = phrase('page.from',
      { name: entry.source.label, n: entry.index + 1 });
    meta.append(from);
  }

  const dims = document.createElement('p');
  dims.className = 'page-dims';
  dims.textContent = sizeLabel(width, height);
  meta.append(dims);

  const controls = document.createElement('div');
  controls.className = 'page-controls';
  controls.append(
    tileButton('↺', phrase('page.anticlockwise', { n: index + 1 }), false, () => {
      turn(entry, -90);
    }),
    tileButton('↻', phrase('page.clockwise', { n: index + 1 }), false, () => {
      turn(entry, 90);
    }),
    tileButton('‹', phrase('page.earlier', { n: index + 1 }), index === 0, () => {
      move(index, index - 1);
    }),
    tileButton('›', phrase('page.later', { n: index + 1 }),
      index === entries.length - 1, () => {
        move(index, index + 1);
      }),
  );
  meta.append(controls);

  li.append(handle, shapeWrap, meta);
  wireDrag(li, [handle, shapeWrap], index);
  return li;
}

function tileButton(glyph, label, disabled, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'tile-btn';
  button.textContent = glyph;
  button.title = label;
  button.setAttribute('aria-label', label);
  button.disabled = disabled;
  button.addEventListener('click', onClick);
  return button;
}

function turn(entry, degrees) {
  if (running) return;
  entry.rotate = (((entry.rotate + degrees) % 360) + 360) % 360;
  render();
}

function move(from, to) {
  if (running || to < 0 || to >= entries.length) return;
  const [item] = entries.splice(from, 1);
  entries.splice(to, 0, item);
  render();
}

function wireDrag(li, handles, index) {
  const startDrag = (event) => {
    if (running) { event.preventDefault(); return; }
    dragIndex = index;
    li.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
    // Firefox refuses to start a drag unless some data is set.
    event.dataTransfer.setData('text/plain', String(index));
  };

  const endDrag = () => {
    dragIndex = null;
    dropAt = null;
    li.classList.remove('dragging');
    clearDropMarkers();
  };

  for (const source of handles) {
    source.addEventListener('dragstart', startDrag);
    source.addEventListener('dragend', endDrag);
  }

  li.addEventListener('dragover', (event) => {
    if (dragIndex === null) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';

    // Which side of the tile the pointer is on decides where it lands, so the
    // marker always reads as "it goes here", not "it swaps with this".
    const rect = li.getBoundingClientRect();
    const after = event.clientX > rect.left + rect.width / 2;

    clearDropMarkers();
    li.classList.add(after ? 'insert-after' : 'insert-before');
    dropAt = { index, after };
  });

  li.addEventListener('drop', (event) => {
    event.preventDefault();
    event.stopPropagation();
    applyDrop();
  });
}

/** Move the dragged page to wherever the marker currently sits. */
function applyDrop() {
  if (dragIndex === null || dropAt === null) {
    clearDropMarkers();
    return;
  }

  let target = dropAt.after ? dropAt.index + 1 : dropAt.index;
  // Removing the item first shifts everything after it down by one.
  if (dragIndex < target) target -= 1;

  const from = dragIndex;
  dragIndex = null;
  dropAt = null;

  if (from === target) {
    clearDropMarkers();
    return;
  }

  move(from, target);
}

// Dropping in the gaps between tiles should still land somewhere sensible
// rather than being swallowed by the window-level handler.
el.pageList.addEventListener('dragover', (event) => {
  if (dragIndex !== null) event.preventDefault();
});
el.pageList.addEventListener('drop', (event) => {
  if (dragIndex === null) return;
  event.preventDefault();
  applyDrop();
});

/* ------------------------------------------------------------ bulk actions */

el.reverse.addEventListener('click', () => {
  if (running) return;
  entries.reverse();
  render();
});

el.rotateAll.addEventListener('click', () => {
  if (running) return;
  for (const entry of entries) entry.rotate = (entry.rotate + 90) % 360;
  render();
});

el.restore.addEventListener('click', () => {
  if (running) return;
  entries = [];
  for (const item of sources) {
    for (let index = 0; index < item.source.pages.length; index += 1) {
      entries.push({ source: item.source, index, rotate: 0 });
    }
  }
  el.range.value = '';
  render();
});

el.clearAll.addEventListener('click', () => {
  if (running) return;
  sources = [];
  entries = [];
  el.range.value = '';
  el.loadError.hidden = true;
  el.loadNote.hidden = true;
  render();
  el.dropzone.focus();
});

el.rangeKeep.addEventListener('click', () => applyRange('keep'));
el.rangeDrop.addEventListener('click', () => applyRange('drop'));
el.rangeTurn.addEventListener('click', () => applyRange('turn'));

/**
 * Do something to the pages named in the box.
 *
 * Nothing at all happens when the box could not be understood, or when it
 * names no pages. A bulk action that half-applied would be the worst kind of
 * bug here, because the thing it damaged is the order somebody has just spent
 * five minutes building by hand.
 */
function applyRange(what) {
  if (running) return;

  const { pages, error } = parseRanges(el.range.value, entries.length, phrase);
  el.rangeError.hidden = !error;
  el.rangeError.textContent = error;
  if (error) return;

  if (!pages.length) {
    el.rangeError.textContent = phrase('range.empty');
    el.rangeError.hidden = false;
    return;
  }

  const chosen = new Set(pages.map((page) => page - 1));

  if (what === 'keep') entries = entries.filter((_, index) => chosen.has(index));
  if (what === 'drop') entries = entries.filter((_, index) => !chosen.has(index));
  if (what === 'turn') {
    for (const index of chosen) {
      const entry = entries[index];
      if (entry) entry.rotate = (entry.rotate + 90) % 360;
    }
  }

  if (what !== 'turn') el.range.value = '';
  render();
}

/* ---------------------------------------------------------------- the plan */

el.splitModes.addEventListener('change', renderPlan);
for (const input of [el.splitSize, el.splitAt]) {
  input.addEventListener('input', () => {
    // Typing in one of the two boxes means that is the mode being asked for.
    const owner = input.closest('.preset')?.querySelector('input[type="radio"]');
    if (owner) owner.checked = true;
    renderPlan();
  });
}
el.keepBookmarks.addEventListener('change', renderPlan);

function splitMode() {
  return el.splitModes.querySelector('input:checked')?.value ?? 'single';
}

/** The split as `plan.js` wants it, and as the summary line describes it. */
function currentSplit() {
  const mode = splitMode();
  const at = mode === 'at'
    ? parseRanges(el.splitAt.value, entries.length, phrase).pages
    : [];
  return { mode, size: Number(el.splitSize.value) || 1, at };
}

function renderPlan() {
  const split = currentSplit();
  const files = countOutputs(split);
  const from = new Set(entries.map((entry) => entry.source)).size;

  const parts = [
    phrase('plan.from', {
      pages: count(entries.length, 'page'),
      files: count(from, 'file'),
    }),
    files === 1
      ? phrase('plan.one')
      : phrase('plan.many', { files: count(files, 'pdf'), n: files }),
  ];

  if (split.mode === 'at' && !split.at.length && el.splitAt.value.trim()) {
    parts.push(phrase('plan.nosplit'));
  }

  // The clauses are run together by a phrase too: a space between two of
  // them is English punctuation and is not how every language does it.
  el.outputSummary.textContent = phrase('plan.line',
    { parts: parts.reduce((a, b) => phrase('plan.join', { a, b })) });
  el.run.textContent = files === 1
    ? phrase('run.one')
    : phrase('run.many', { n: files });
}

/** How many files the current plan produces, without building any of them. */
function countOutputs(split) {
  if (!entries.length) return 0;
  if (split.mode === 'each') return entries.length;
  if (split.mode === 'every') return Math.ceil(entries.length / Math.max(1, split.size));
  if (split.mode === 'at') {
    return new Set(split.at.filter((n) => n > 1 && n <= entries.length)).size + 1;
  }
  if (split.mode === 'file') return new Set(entries.map((entry) => entry.source)).size;
  return 1;
}

/* --------------------------------------------------------------- rendering */

function render() {
  renderSources();

  const has = entries.length > 0;

  el.countLabel.textContent = has
    ? phrase('list.count', { pages: count(entries.length, 'page') })
    : phrase('list.empty');

  el.byFilePreset.hidden = new Set(entries.map((entry) => entry.source)).size < 2;
  if (el.byFilePreset.hidden && splitMode() === 'file') {
    el.splitModes.querySelector('input[value="single"]').checked = true;
  }

  el.pageList.replaceChildren(...entries.map(buildPageNode));
  renderPlan();
}

/* ----------------------------------------------------------------- running */

el.run.addEventListener('click', run);
el.cancel.addEventListener('click', () => running?.abort());

async function run() {
  if (!entries.length || running) return;

  running = new AbortController();
  el.run.disabled = true;
  el.cancel.hidden = false;
  el.result.hidden = true;
  el.runError.hidden = true;
  el.progress.hidden = false;
  setProgress(0, 1, phrase('progress.copying'));
  releaseDownloads();

  let cancelled = false;

  try {
    const result = await produce(entries, {
      split: currentSplit(),
      stem: sources[0]?.name ?? 'document',
      suffix: sources.length > 1 ? 'merged' : 'edited',
      bookmarks: el.keepBookmarks.checked,
    }, {
      signal: running.signal,
      t: phrase,
      onProgress: (done, total, what) => setProgress(done, total, what
        ? phrase('progress.writing', { what })
        : phrase('progress.checking')),
    });
    showResult(result);
  } catch (error) {
    if (error?.name === 'AbortError') {
      cancelled = true;
      el.progressLabel.textContent = phrase('run.cancelled');
    } else {
      el.runError.textContent = phrase('run.failed',
        { detail: phrase(error?.message ?? String(error)) });
      el.runError.hidden = false;
    }
  } finally {
    running = null;
    el.run.disabled = false;
    el.cancel.hidden = true;
    // The bar stays up after a cancel, because it is carrying the only message
    // that says what happened.
    el.progress.hidden = !cancelled;
    if (cancelled) el.progressBar.style.width = '0%';
  }
}

let stageText = '';

function setProgress(done, total, stage) {
  if (stage) stageText = stage;
  if (Number.isFinite(done) && total) {
    el.progressBar.style.width = `${Math.round((done / Math.max(1, total)) * 100)}%`;
  }
  el.progressLabel.textContent = phrase('progress.at', { stage: stageText });
}

/* ----------------------------------------------------------------- results */

function showResult(result) {
  const total = result.files.reduce((sum, file) => sum + file.size, 0);
  const pages = result.files.reduce((sum, file) => sum + file.pages, 0);

  el.resultSize.textContent = result.files.length === 1
    ? phrase('result.one', { size: humanBytes(total) })
    : phrase('result.many', {
      documents: count(result.files.length, 'document'),
      size: humanBytes(total),
    });
  el.resultSub.textContent = phrase('result.sub', {
    pages: count(pages, 'page'),
    files: count(sources.length, 'file'),
  });

  el.checkLine.textContent = result.ok
    ? phrase('result.checked')
    : phrase('result.unchecked', { problem: result.problem });
  el.checkLine.className = `check-line ${result.ok ? 'good' : 'bad'}`;

  renderFacts(result);
  renderFiles(result);

  const handed = result.archive ?? { name: result.files[0].name, blob: blobFor(result.files[0]) };
  el.download.href = keepUrl(handed.blob);
  el.download.download = handed.name;
  el.download.textContent = result.archive
    ? phrase('result.zip', { n: result.files.length })
    : phrase('result.download');
  // A file this tool has just said it does not trust should not be one click
  // away from being sent to somebody.
  el.download.hidden = !result.ok;

  el.result.hidden = false;
}

function renderFacts(result) {
  const facts = [...result.notes];
  const fields = result.files.reduce((sum, file) => sum + file.fields, 0);
  const links = result.files.reduce((sum, file) => sum + file.links, 0);

  if (links) {
    facts.push(phrase('facts.links', { links: count(links, 'link') }));
  }
  if (fields) {
    facts.push(phrase('facts.fields', { fields: count(fields, 'field') }));
  }

  facts.push(phrase('facts.dropped'));

  el.resultFacts.replaceChildren(...facts.map((text) => {
    const row = document.createElement('li');
    row.textContent = text;
    return row;
  }));
}

/** The per-file list, which is what makes a split checkable one file at a
 *  time rather than only as an archive. */
function renderFiles(result) {
  el.fileList.hidden = result.files.length < 2;
  if (result.files.length < 2) {
    el.fileList.replaceChildren();
    return;
  }

  el.fileList.replaceChildren(...result.files.map((file) => {
    const row = document.createElement('li');

    const name = document.createElement('span');
    name.className = 'out-name';
    name.textContent = file.name;

    const facts = document.createElement('span');
    facts.className = 'out-facts';
    facts.textContent = phrase('result.facts', {
      pages: count(file.pages, 'page'),
      size: humanBytes(file.size),
    });

    const link = document.createElement('a');
    link.className = 'ghost';
    link.textContent = phrase('result.download');
    link.download = file.name;
    link.href = keepUrl(blobFor(file));
    link.hidden = !file.check.ok;

    const problem = document.createElement('span');
    problem.className = 'out-problem';
    problem.textContent = file.check.ok ? '' : file.check.text;

    row.append(name, facts, problem, link);
    return row;
  }));
}

function blobFor(file) {
  return new Blob([file.data], { type: 'application/pdf' });
}

function keepUrl(blob) {
  const url = URL.createObjectURL(blob);
  urls.push(url);
  return url;
}

function releaseDownloads() {
  for (const url of urls) URL.revokeObjectURL(url);
  urls = [];
  el.download.removeAttribute('href');
  el.fileList.replaceChildren();
}

/* ------------------------------------------------------------------- trust */

el.privacyToggle.addEventListener('click', () => {
  const open = el.privacyPanel.hidden;
  el.privacyPanel.hidden = !open;
  el.privacyToggle.setAttribute('aria-expanded', String(open));
});

// The hosts this page loads its own advertising, measurement and donate-button
// from. Like the ad scripts, they are something the page fetches without the
// visitor asking, and they are handed nothing - so they belong in this bucket
// rather than being reported as an intruder.
const PLATFORM_HOSTS = /(^|\.)(googlesyndication\.com|doubleclick\.net|googleadservices\.com|googletagservices\.com|adtrafficquality\.google|googletagmanager\.com|google-analytics\.com|gstatic\.com|googleapis\.com|buymeacoffee\.com|cloudflareinsights\.com|google\.[a-z]{2,3}(\.[a-z]{2})?)$/;

/**
 * Report what this page has actually fetched.
 *
 * The claim on trial is not "this page is silent" - it is not silent, it
 * carries ads - but "nothing has carried your documents away".
 */
function monitorNetwork() {
  const platform = new Set();
  const unexplained = new Set();

  const inspect = (found) => {
    for (const entry of found) {
      if (entry.name.startsWith('blob:') || entry.name.startsWith('data:')) continue;
      const url = new URL(entry.name, location.href);
      if (url.origin === location.origin) continue;
      if (PLATFORM_HOSTS.test(url.hostname)) platform.add(url.hostname);
      else unexplained.add(url.hostname);
    }

    const total = performance.getEntriesByType('resource')
      .filter((e) => !e.name.startsWith('blob:') && !e.name.startsWith('data:')).length;

    const clean = unexplained.size === 0;
    // One phrase per number rather than a pluralising helper: a language
    // whose plural is not a suffix has to be able to translate the two
    // separately.
    const platformNote = platform.size
      ? phrase(platform.size === 1 ? 'net.platform.one' : 'net.platform.many',
               { hosts: platform.size })
      : '';

    el.networkCount.textContent = clean
      ? phrase('net.clean', { total, platform: platformNote })
      : phrase('net.dirty', { hosts: [...unexplained].join(', '), platform: platformNote });

    el.networkCount.className = clean ? 'good' : 'warn';
    el.networkDot.className = `live-dot ${clean ? 'good' : 'warn'}`;
  };

  inspect(performance.getEntriesByType('resource'));
  try {
    new PerformanceObserver((list) => inspect(list.getEntries())).observe({ type: 'resource', buffered: true });
  } catch {
    // PerformanceObserver is unavailable; the one-time snapshot above still stands.
  }
}

async function registerServiceWorker() {
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
  showLoadError(phrase('error.broke', { detail: event.message }));
});
window.addEventListener('unhandledrejection', (event) => {
  showLoadError(phrase('error.broke', { detail: event.reason?.message ?? event.reason }));
});

render();
monitorNetwork();
registerServiceWorker();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
