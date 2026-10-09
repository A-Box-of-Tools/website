/** UI wiring and application state. */

import { phrase, fill, ltr } from './shared/phrases.js';
import { messageBox } from './shared/message-box.js';
import { wireFilePicker, readingLabel } from './shared/file-picker.js';
import { DISPOSALS, NotAGif, extensionName, parseGif } from './gif.js';
import { duration, isFullCanvas } from './frames.js';
import { budget, distinctColors, paletteWaste } from './budget.js';
import { findings } from './findings.js';
import { report } from './report.js';
import { clock, count, delay, exact, fileSize, hex, percent, plural, rate } from './format.js';
import { makeExample } from './example.js';
import { drawAnalysis, releaseDrawn } from './draw-analysis.js';

const $ = (id) => document.getElementById(id);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  loadError: $('load-error'),
  working: $('working'),
  cancel: $('cancel'),
  clear: $('clear-analysis'),
  drawingStatus: $('drawing-status'),
  previewNote: $('preview-note'),

  summaryCard: $('summary-card'),
  fileName: $('file-name'),
  copyReport: $('copy-report'),
  downloadReport: $('download-report'),
  copyStatus: $('copy-status'),
  preview: $('preview'),
  factVersion: $('fact-version'),
  factCanvas: $('fact-canvas'),
  factSize: $('fact-size'),
  factFrames: $('fact-frames'),
  factWritten: $('fact-written'),
  factPlays: $('fact-plays'),
  factLoops: $('fact-loops'),
  factColors: $('fact-colors'),

  findingsCard: $('findings-card'),
  findings: $('findings'),

  budgetCard: $('budget-card'),
  budgetBar: $('budget-bar'),
  budgetRows: $('budget-rows'),
  budgetTotal: $('budget-total'),

  framesCard: $('frames-card'),
  framesLede: $('frames-lede'),
  frames: $('frames'),
  frameView: $('frame-view'),
  showMore: $('show-more'),

  colorsCard: $('colors-card'),
  colorsLede: $('colors-lede'),
  globalPaletteWrap: $('global-palette-wrap'),
  globalPaletteNote: $('global-palette-note'),
  globalPalette: $('global-palette'),
  localPalettesWrap: $('local-palettes-wrap'),
  localPalettesSummary: $('local-palettes-summary'),
  localPalettes: $('local-palettes'),

  extrasCard: $('extras-card'),
  extras: $('extras'),

  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
};

const { show: showError } = messageBox(el.loadError);

/** Frame cards stay paged independently of the bounded pixel analysis. */
const FIRST_PAGE = 60;

/** @type {{name: string, gif: object, view: object, drawn: object[]}|null} */
let current = null;
let previewUrl = null;
let shown = 0;

/* --------------------------------------------------------------- the file */

const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles(files) { openFile(files[0]); },
  example: makeExample,
});

let sourceVersion = 0;
let reading = null;
const reportUrls = new Set();
const phraseKeys = new Set([...($('phrases')?.querySelectorAll('[data-phrase]') ?? [])].map(node => node.dataset.phrase));
const ownsRead = job => reading === job && job.version === sourceVersion;
const readLives = job => ownsRead(job) && !job.controller.signal.aborted;
const safeValues = (values = {}) => Object.fromEntries(Object.entries(values && typeof values === 'object' ? values : {}).map(([name, value]) =>
  [name, value?.key ? safePhrase(value.key, safeValues(value.values)) : value]));
const safePhrase = (key, values) => phraseKeys.has(key) ? phrase(key, values) : String(key ?? '');
const messageFor = error => safePhrase(String(error?.message ?? error), safeValues(error?.values));

function focusRecovery(target, visible = target) {
  const version = sourceVersion;
  target.focus({ preventScroll: true });
  const showControl = () => {
    if (version === sourceVersion && document.activeElement === target && !visible.hidden) {
      visible.scrollIntoView({ behavior: 'instant', block: 'center' });
    }
  };
  showControl();
  // Layout and native focus scrolling may settle after the activating key event.
  requestAnimationFrame(showControl);
}

function retireAnalysis() {
  sourceVersion += 1;
  reading?.controller.abort();
  reading = null;
  releaseDrawn(current?.drawn);
  current = null;
  el.preview.removeAttribute('src');
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = null;
  for (const url of reportUrls) URL.revokeObjectURL(url);
  reportUrls.clear();
  for (const card of [el.summaryCard, el.findingsCard, el.budgetCard, el.framesCard, el.colorsCard, el.extrasCard]) card.hidden = true;
  el.frames.replaceChildren();
  el.copyReport.disabled = el.downloadReport.disabled = true;
  el.copyStatus.textContent = '';
  el.drawingStatus.hidden = true;
  el.cancel.hidden = el.clear.hidden = true;
}

async function openFile(file) {
  if (!file) return;
  retireAnalysis();
  hideError();
  const job = { file, version: sourceVersion, controller: new AbortController(), gif: null };
  reading = job;
  picker.busy(readingLabel(1));
  el.working.hidden = el.cancel.hidden = el.clear.hidden = false;
  el.working.textContent = phrase('read.reading', { name: file.name });
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!readLives(job)) return;
    job.gif = parseGif(bytes);
    const decoded = await drawAnalysis(job.gif, bytes, {
      signal: job.controller.signal,
      label: (key, n) => phrase(key, { n }),
      onProgress: ({ done, total }) => {
        if (readLives(job)) el.working.textContent = phrase('read.drawing', {
          name: file.name, done: count(done), total: count(total),
        });
      },
    });
    if (!ownsRead(job)) { releaseDrawn(decoded.drawn); return; }
    show(job, decoded);
  } catch (error) {
    if (!ownsRead(job)) return;
    const why = messageFor(error);
    if (job.gif) show(job, { drawn: job.gif.frames.map(() => null), identical: 0,
      reason: { key: 'drawing.failed', values: { detail: why } } });
    showError(phrase(error instanceof NotAGif ? 'read.notagif' : 'read.failed', { name: file.name, why }));
  } finally {
    if (ownsRead(job)) {
      const focused = document.activeElement;
      reading = null;
      picker.done();
      el.working.hidden = el.cancel.hidden = true;
      el.clear.hidden = !current;
      if (focused === el.cancel || (focused === el.clear && el.clear.hidden)) {
        if (current) focusRecovery(el.clear);
        else focusRecovery(el.fileInput, el.dropzone);
      }
    }
  }
}

el.cancel.addEventListener('click', () => {
  const job = reading;
  if (!job) return;
  job.controller.abort();
  el.cancel.hidden = true;
  el.working.textContent = phrase('read.cancelled');
  if (!job.gif) {
    // Native file reads cannot be interrupted; their late callback loses its owner now.
    sourceVersion += 1;
    reading = null;
    picker.done();
    el.clear.hidden = true;
    focusRecovery(el.fileInput, el.dropzone);
  } else focusRecovery(el.clear);
});
el.clear.addEventListener('click', () => {
  retireAnalysis();
  picker.done(); picker.waiting();
  el.working.hidden = true;
  hideError();
  focusRecovery(el.fileInput, el.dropzone);
});

function show(job, decoded) {
  const { file, gif } = job;
  const { drawn, identical, reason } = decoded;
  const used = drawn.map(frame => frame?.used ?? null);
  const complete = drawn.every(Boolean);
  const waste = complete ? paletteWaste(gif, used) : {
    declared: (gif.globalPalette?.count ?? 0) + gif.frames.reduce((n, frame) => n + (frame.palette?.count ?? 0), 0),
  };
  const colors = complete ? distinctColors(gif, used).size : undefined;
  const drawing = { reason, drawn: drawn.filter(Boolean).length, total: gif.frames.length };
  const view = { name: file.name, budget: budget(gif), complete, drawing,
    findings: findings(gif, { decoded: drawn, complete, waste: complete ? waste : undefined, colors, identical }), colors, waste };
  current = { name: file.name, gif, view, drawn };
  // A refused source is not handed to the native preview decoder as a second allocation path.
  el.preview.hidden = Boolean(reason);
  if (!reason) {
    previewUrl = URL.createObjectURL(file);
    el.preview.src = previewUrl;
  }
  el.previewNote.textContent = phrase(reason ? 'preview.refused' : 'preview.native');
  el.drawingStatus.hidden = !reason;
  el.drawingStatus.textContent = reason ? phrase('drawing.partial', {
    drawn: count(drawing.drawn), total: count(drawing.total), why: safePhrase(reason.key, reason.values),
  }) : '';
  renderSummary(gif, view);
  renderFindings(view.findings);
  renderBudget(gif, view.budget);
  renderFrames(gif, drawn);
  renderColors(gif, view, used);
  renderExtras(gif);
  el.summaryCard.hidden = el.budgetCard.hidden = false;
  el.findingsCard.hidden = view.findings.length === 0;
  el.framesCard.hidden = gif.frames.length === 0;
  el.colorsCard.hidden = !gif.globalPalette && !gif.frames.some(frame => frame.palette);
  el.extrasCard.hidden = gif.extensions.length === 0;
  el.copyReport.disabled = el.downloadReport.disabled = false;
  // Recovery controls stay in view even if normal completion wins the race with Cancel.
  const recovering = document.activeElement === el.cancel || document.activeElement === el.clear;
  if (!job.controller.signal.aborted && !recovering) el.summaryCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ----------------------------------------------------------- the summary */

function renderSummary(gif, view) {
  const timing = duration(gif.frames);
  const fps = rate(gif.frames.length, timing.real);

  el.fileName.textContent = view.name;
  el.factVersion.textContent = `GIF${gif.version}`;
  el.factCanvas.textContent = ltr(`${gif.width} × ${gif.height}`);
  el.factSize.textContent = fileSize(gif.size);
  el.factSize.title = exact(gif.size, phrase);
  el.factFrames.textContent = count(gif.frames.length);
  el.factWritten.textContent = gif.frames.length ? clock(timing.nominal, phrase) : '—';

  if (timing.clamped > 0) {
    el.factPlays.textContent = played(timing.real, fps);
    el.factPlays.className = 'warn';
    el.factPlays.title = phrase('clamped.note', { n: count(timing.clamped) });
  } else {
    el.factPlays.textContent = gif.frames.length ? played(timing.real, fps) : '—';
    el.factPlays.className = '';
    el.factPlays.title = '';
  }

  el.factLoops.textContent = gif.loop === null
    ? phrase('loops.none')
    : gif.loop === 0 ? phrase('loops.forever') : phrase('loops.times', { n: count(gif.loop) });
  el.factColors.textContent = view.colors === undefined ? phrase('colours.unknown') : plural(view.colors, 'n.colour', phrase);
}

/** "1.20s (8.3 fps)", or just the clock where there is no rate to give. */
function played(real, fps) {
  const time = clock(real, phrase);
  return fps ? phrase('plays.rate', { time, fps: fps.toFixed(1) }) : time;
}

/* ---------------------------------------------------------- the findings */

const LEVEL_MARK = { bad: '✖', warn: '⚠', note: '•' };
const LEVEL_NAME = { bad: 'level.bad', warn: 'level.warn', note: 'level.note' };

function renderFindings(list) {
  el.findings.replaceChildren();
  for (const finding of list) {
    const item = document.createElement('li');
    item.className = `finding ${finding.level}`;

    const mark = document.createElement('span');
    mark.className = 'finding-mark';
    mark.textContent = LEVEL_MARK[finding.level];
    mark.title = phrase(LEVEL_NAME[finding.level]);

    const body = document.createElement('div');
    // findings.js names both halves and this resolves them; they are the only
    // strings on this page rendered as markup. The one value in them that comes
    // out of the file is escaped where it is put in; everything else below
    // sets textContent.
    const values = fill(finding.values);
    const title = phrase(finding.title, values);
    const said = phrase(finding.body, values);
    body.innerHTML = `<strong>${title}</strong> ${said}`;

    item.append(mark, body);
    el.findings.append(item);
  }
}

/* ------------------------------------------------------------ the budget */

function renderBudget(gif, plan) {
  el.budgetBar.replaceChildren();
  el.budgetRows.replaceChildren();
  el.budgetTotal.textContent = exact(gif.size, phrase);

  for (const row of plan.rows) {
    if (row.bytes === 0 && row.key !== 'pixels') continue;

    const slice = document.createElement('span');
    slice.className = `slice slice-${row.key}`;
    slice.style.width = `${row.share * 100}%`;
    slice.title = `${phrase(row.label)}: ${fileSize(row.bytes)}`;
    el.budgetBar.append(slice);

    const line = document.createElement('tr');
    const head = document.createElement('th');
    head.scope = 'row';

    const swatch = document.createElement('span');
    swatch.className = `key key-${row.key}`;
    const label = document.createElement('span');
    label.textContent = phrase(row.label);
    const note = document.createElement('span');
    note.className = 'budget-note';
    note.textContent = phrase(row.note, row.values);
    head.append(swatch, label, note);

    const size = document.createElement('td');
    size.className = 'num';
    size.textContent = count(row.bytes);

    const portion = document.createElement('td');
    portion.className = 'num';
    portion.textContent = percent(row.share);

    line.append(head, size, portion);
    el.budgetRows.append(line);
  }
}

/* ------------------------------------------------------------ the frames */

function renderFrames(gif, drawn) {
  el.frames.replaceChildren();
  shown = 0;

  const undrawn = drawn.filter((frame) => frame === null).length;
  const full = gif.frames.filter((frame) => isFullCanvas(gif, frame)).length;
  const frames = plural(gif.frames.length, 'n.frame', phrase);
  // "none", "all" and a number are three sentences rather than one word
  // dropped into a slot: a language that inflects what follows cannot take
  // the word on its own.
  el.framesLede.textContent = undrawn > 0
    ? phrase('frames.partial', { frames, drawn: count(gif.frames.length - undrawn) })
    : phrase(full === 0 ? 'frames.none' : full === gif.frames.length ? 'frames.all'
      : 'frames.some', { frames, n: count(full) });

  more(gif, drawn);
}

function more(gif, drawn) {
  const end = Math.min(gif.frames.length, shown + FIRST_PAGE);
  for (let index = shown; index < end; index += 1) {
    el.frames.append(frameCard(gif, gif.frames[index], drawn[index]));
  }
  shown = end;

  const left = gif.frames.length - shown;
  el.showMore.hidden = left <= 0;
  el.showMore.textContent = phrase('frames.more', { frames: plural(left, 'n.frame', phrase) });
}

function frameCard(gif, frame, drawn) {
  const item = document.createElement('li');
  item.className = 'frame';

  const figure = document.createElement('div');
  figure.className = 'frame-shot';
  if (drawn) {
    figure.append(el.frameView.value === 'stored' ? drawn.stored : drawn.composited);
  } else {
    const blank = document.createElement('p');
    blank.className = 'frame-blank';
    blank.textContent = phrase('frame.notdrawn');
    figure.append(blank);
  }

  const heading = document.createElement('p');
  heading.className = 'frame-head';
  heading.textContent = phrase('frame.number', { n: frame.index + 1 });

  const rows = [
    [phrase('frame.delay'), frame.delay < 2
      ? phrase('frame.clamped', { delay: delay(frame.delay, phrase) })
      : delay(frame.delay, phrase)],
    [phrase('frame.rectangle'), phrase('frame.rect', {
      width: frame.width, height: frame.height, left: frame.left, top: frame.top,
    })],
    [phrase('frame.disposal'),
      phrase(DISPOSALS[frame.disposal] ?? 'disposal.reserved', { n: frame.disposal })],
    [phrase('frame.palette'), frame.palette
      ? phrase('palette.own', { n: count(frame.palette.count) })
      : phrase(gif.globalPalette ? 'palette.global' : 'palette.none')],
    [phrase('frame.transparent'), frame.transparentIndex >= 0
      ? phrase('frame.transparent.index', { n: frame.transparentIndex })
      : phrase('frame.transparent.no')],
    [phrase('frame.size'), phrase('frame.sizevalue', {
      size: fileSize(frame.bytes), share: percent(frame.bytes / gif.size),
    })],
  ];
  if (frame.interlaced) rows.push([phrase('frame.interlaced'), phrase('frame.yes')]);
  if (drawn && drawn.ratio > 0) {
    rows.push([phrase('frame.compressed'),
      phrase('frame.ratio', { ratio: drawn.ratio.toFixed(1) })]);
  }
  if (drawn && (drawn.corrupt || drawn.truncated)) {
    rows.push([phrase('frame.trouble'), drawn.corrupt
      ? phrase(drawn.corrupt.key, drawn.corrupt.values)
      : phrase('frame.endsearly')]);
  }

  const list = document.createElement('dl');
  list.className = 'frame-facts';
  for (const [label, value] of rows) {
    const pair = document.createElement('div');
    const term = document.createElement('dt');
    term.textContent = label;
    const detail = document.createElement('dd');
    detail.textContent = value;
    pair.append(term, detail);
    list.append(pair);
  }

  item.append(figure, heading, list);
  return item;
}

el.frameView.addEventListener('change', () => {
  if (!current) return;
  const { gif, drawn } = current;
  el.frames.replaceChildren();
  const upTo = shown;
  shown = 0;
  while (shown < upTo) more(gif, drawn);
});

el.showMore.addEventListener('click', () => {
  if (current) more(current.gif, current.drawn);
});

/* ----------------------------------------------------------- the colours */

function renderColors(gif, view, used) {
  const locals = gif.frames.filter((frame) => frame.palette);
  const waste = view.waste;

  el.colorsLede.textContent = phrase(view.complete ? 'colours.lede' : 'colours.partial', {
    declared: view.complete ? plural(waste.declared, 'n.colour', phrase) : count(waste.declared),
    ...(view.complete ? { referenced: count(waste.referenced), different: count(view.colors) } : {}),
  });

  el.globalPaletteWrap.hidden = !gif.globalPalette;
  if (gif.globalPalette) {
    const union = new Uint8Array(256);
    for (const [index, frame] of gif.frames.entries()) {
      if (frame.palette || !used[index]) continue;
      for (let at = 0; at < 256; at += 1) if (used[index][at]) union[at] = 1;
    }
    const sharing = gif.frames.filter((frame) => !frame.palette).length;
    el.globalPaletteNote.textContent = phrase(view.complete ? 'palette.globalnote' : 'palette.globalpartial', {
      entries: plural(gif.globalPalette.count, 'n.entry', phrase),
      size: fileSize(gif.globalPalette.bytes),
      frames: plural(sharing, 'n.frame', phrase),
    });
    el.globalPalette.replaceChildren(...swatches(gif.globalPalette, view.complete ? union : null));
  }

  el.localPalettesWrap.hidden = locals.length === 0;
  if (locals.length > 0) {
    el.localPalettesSummary.textContent = phrase('palette.locals', {
      tables: plural(locals.length, 'n.localtable', phrase),
      size: fileSize(locals.reduce((sum, frame) => sum + frame.palette.bytes, 0)),
    });
    el.localPalettes.replaceChildren();
    // Capped for the same reason the frame list is: a file with six hundred
    // local palettes would put a hundred and fifty thousand swatches in the
    // document, and the browser would stop being a browser.
    for (const frame of locals.slice(0, 24)) {
      const heading = document.createElement('h4');
      heading.textContent = phrase('palette.frameheading', {
        n: frame.index + 1, colours: plural(frame.palette.count, 'n.colour', phrase),
      });
      const list = document.createElement('ul');
      list.className = 'palette';
      list.append(...swatches(frame.palette, used[frame.index]));
      el.localPalettes.append(heading, list);
    }
    if (locals.length > 24) {
      const note = document.createElement('p');
      note.className = 'palette-note';
      note.textContent = phrase('palette.capped', { n: count(locals.length) });
      el.localPalettes.append(note);
    }
  }
}

function swatches(palette, used) {
  const out = [];
  for (let index = 0; index < palette.count; index += 1) {
    const item = document.createElement('li');
    const code = hex(palette.colors, index);
    item.className = used && !used[index] ? 'swatch unused' : 'swatch';
    item.style.background = code;
    item.title = used && !used[index]
      ? phrase('palette.unused', { index, colour: code })
      : `${index}: ${code}`;
    out.push(item);
  }
  return out;
}

/* ------------------------------------------------------------ the extras */

function renderExtras(gif) {
  el.extras.replaceChildren();
  for (const extension of gif.extensions) {
    const item = document.createElement('li');

    const head = document.createElement('p');
    head.className = 'extra-head';
    // Application names are bytes from the file; the other block headings
    // belong to the page. Both stay textContent, never parsed as markup.
    head.textContent = `${extensionName(extension, phrase)} — ${fileSize(extension.bytes)}`;
    item.append(head);

    const what = document.createElement('p');
    what.className = 'extra-note';
    what.textContent = describe(extension);
    item.append(what);

    if (extension.text) {
      const body = document.createElement('pre');
      body.className = 'extra-text';
      const text = extension.text.trim();
      body.textContent = text.length > 4000 ? `${text.slice(0, 4000)}…` : text;
      item.append(body);
    }

    el.extras.append(item);
  }
}

function describe(extension) {
  if (extension.kind === 'comment') return phrase('block.comment');
  if (extension.loop !== undefined) {
    return extension.loop === 0
      ? phrase('block.loop.forever')
      : phrase('block.loop.times', { times: plural(extension.loop, 'n.time', phrase) });
  }
  if (extension.kind === 'application' && extension.name.startsWith('XMP')) return phrase('block.xmp');
  if (extension.kind === 'application' && extension.name.startsWith('ICCRGBG1')) return phrase('block.icc');
  if (extension.kind === 'plain-text') return phrase('block.plaintext');
  return phrase('block.application');
}

/* ------------------------------------------------------------ the report */

el.downloadReport.addEventListener('click', () => {
  if (!current) return;
  const source = current;
  const text = report(source.gif, source.view, phrase);
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${source.name.replace(/\.gif$/i, '')}-analysis.txt`;
  link.click();
  // Long enough for the download to have started, and revoked either way so a
  // page left open all afternoon does not accumulate them.
  reportUrls.add(url);
  setTimeout(() => { URL.revokeObjectURL(url); reportUrls.delete(url); }, 10_000);
});

el.copyReport.addEventListener('click', async () => {
  if (!current) return;
  const source = current;
  const text = report(source.gif, source.view, phrase);
  try {
    await navigator.clipboard.writeText(text);
    if (current === source) el.copyStatus.textContent = phrase('copy.done');
  } catch {
    if (current === source) el.copyStatus.textContent = phrase('copy.refused');
  }
});

/* ------------------------------------------------------------- the frame */

function hideError() {
  el.loadError.hidden = true;
  el.copyStatus.textContent = '';
}

el.privacyToggle?.addEventListener('click', () => {
  const open = el.privacyPanel.hidden;
  el.privacyPanel.hidden = !open;
  el.privacyToggle.setAttribute('aria-expanded', String(open));
});

/* -------------------------------------------------------------------- boot */

window.addEventListener('error', (event) => {
  showError(phrase('error.broke', { detail: event.message }));
});
window.addEventListener('unhandledrejection', (event) => {
  showError(phrase('error.broke', { detail: event.reason?.message ?? event.reason }));
});

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
