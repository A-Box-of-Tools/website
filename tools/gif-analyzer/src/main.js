/** UI wiring and application state. */

import { wireFilePicker, readingLabel } from './shared/file-picker.js';
import { DISPOSALS, NotAGif, frameData, parseGif } from './gif.js';
import { lzwDecode } from './lzw.js';
import { Compositor, duration, isFullCanvas, paintFrame } from './frames.js';
import { budget, distinctColors, paletteWaste } from './budget.js';
import { findings } from './findings.js';
import { report } from './report.js';
import { clock, count, delay, exact, fileSize, hex, percent, plural, rate } from './format.js';

const $ = (id) => document.getElementById(id);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  loadError: $('load-error'),
  working: $('working'),

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
  networkCount: $('network-count'),
  networkDot: $('network-dot'),
  offlineStatus: $('offline-status'),
  offlineDot: $('offline-dot'),
};

/**
 * How much of a file is drawn rather than merely measured.
 *
 * The structure of a GIF is cheap to read at any size; expanding its pixels is
 * not. So the decoder gets a budget in pixels and stops when it runs out.
 * Everything that comes from the parse - the byte budget, the timing, the
 * palettes, most of the findings - is complete either way, and the frame list
 * says which frames it drew.
 *
 * 300 megapixels is a few seconds of LZW in JavaScript, and is more than any
 * GIF anybody sends anybody: a 500x500 animation would need 1,200 frames to
 * reach it.
 */
const PIXEL_BUDGET = 300_000_000;

/** Frames shown before the "show the rest" button, so a long file still paints. */
const FIRST_PAGE = 60;

/** The longest edge of a frame thumbnail. */
const THUMB = 120;

/** @type {{name: string, gif: object, view: object, drawn: object[]}|null} */
let current = null;
let previewUrl = null;
let shown = 0;

/* --------------------------------------------------------------- the file */

const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles(files) { openFile(files[0]); },
});

async function openFile(file) {
  hideError();
  picker.busy(readingLabel(1));
  el.working.hidden = false;
  el.working.textContent = `Reading ${file.name}…`;

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    // One turn of the event loop before the decode, so the label above is
    // actually painted. Reading the file is fast; drawing three hundred frames
    // is not, and a page that freezes without having said anything reads as
    // broken rather than as busy.
    await new Promise((resolve) => { setTimeout(resolve, 0); });
    show(file, bytes);
  } catch (error) {
    if (error instanceof NotAGif) {
      showError(`${file.name} is not a GIF: ${error.message}. `
        + 'This tool reads the GIF format itself, so it has nothing to say about other files.');
    } else {
      showError(`${file.name} could not be read: ${error.message}`);
    }
  } finally {
    picker.done();
    el.working.hidden = true;
  }
}

function show(file, bytes) {
  const gif = parseGif(bytes);
  const { drawn, identical } = decodeAll(gif, bytes);

  const used = drawn.map((frame) => (frame ? frame.used : null));
  const waste = paletteWaste(gif, used);
  const colors = distinctColors(gif, used).size;

  const view = {
    name: file.name,
    budget: budget(gif),
    findings: findings(gif, { decoded: drawn, waste, colors, identical }),
    colors,
    waste,
  };

  current = { name: file.name, gif, view, drawn };

  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = URL.createObjectURL(file);
  el.preview.src = previewUrl;

  renderSummary(gif, view);
  renderFindings(view.findings);
  renderBudget(gif, view.budget);
  renderFrames(gif, drawn);
  renderColors(gif, view, used);
  renderExtras(gif);

  el.summaryCard.hidden = false;
  el.budgetCard.hidden = false;
  el.findingsCard.hidden = view.findings.length === 0;
  el.framesCard.hidden = gif.frames.length === 0;
  el.colorsCard.hidden = !gif.globalPalette && !gif.frames.some((frame) => frame.palette);
  el.extrasCard.hidden = gif.extensions.length === 0;
  el.summaryCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Decode every frame the pixel budget allows, in order, stacking them as it
 * goes.
 *
 * Order matters: a frame's picture depends on what the frames before it left on
 * the canvas, so this cannot skip one and carry on. When the budget runs out it
 * stops entirely, and everything after that frame is reported from its header
 * alone.
 *
 * WHY THE THUMBNAILS ARE MADE HERE
 *
 * Because the full-size pixels must not be kept. Two hundred frames of a
 * 600x600 GIF held as RGBA is nearly three hundred megabytes, and a page that
 * does that gets killed by the browser on the file its user most wanted to
 * analyse. Each frame is scaled into a small canvas the moment it is drawn and
 * the big buffers are dropped, so what survives the loop is about 60 KB a
 * frame however large the GIF was.
 *
 * The "is this frame the same as the last one" comparison has to happen here
 * for the same reason: it needs the two full canvases, and only one pair of
 * them exists at a time.
 */
function decodeAll(gif, bytes) {
  const drawn = [];
  if (gif.width === 0 || gif.height === 0) {
    return { drawn: gif.frames.map(() => null), identical: 0 };
  }

  const canvas = new Compositor(gif.width, gif.height);
  let spent = 0;
  let identical = 0;
  let previous = null;

  for (const frame of gif.frames) {
    const pixels = frame.width * frame.height;
    if (pixels === 0 || spent + pixels > PIXEL_BUDGET) {
      drawn.push(null);
      previous = null;
      continue;
    }
    spent += pixels;

    const palette = frame.palette ?? gif.globalPalette;
    const stream = lzwDecode(frameData(bytes, frame), frame.minCodeSize, pixels);
    const painted = paintFrame(frame, stream.indices, palette);
    const composited = canvas.draw(frame, painted.pixels);

    if (previous && same(previous, composited)) identical += 1;
    previous = composited;

    drawn.push({
      stored: thumbnail(painted.pixels, frame.width, frame.height,
        `What frame ${frame.index + 1} stores, on its own`),
      composited: thumbnail(composited, gif.width, gif.height,
        `The canvas after frame ${frame.index + 1}`),
      used: painted.used,
      missing: painted.missing,
      clears: stream.clears,
      codes: stream.codes,
      pixels: stream.pixels,
      truncated: stream.truncated,
      corrupt: stream.corrupt,
      // What the compressor achieved on this frame: one index per pixel in,
      // this many bytes out. Under 1 would mean it made the frame larger, which
      // LZW can do and occasionally does on noise.
      ratio: frame.payloadBytes > 0 ? pixels / frame.payloadBytes : 0,
    });
  }

  return { drawn, identical };
}

function same(a, b) {
  for (let at = 0; at < a.length; at += 1) if (a[at] !== b[at]) return false;
  return true;
}

/**
 * One picture, as a canvas small enough to keep.
 *
 * The backing store never exceeds the thumbnail box, but the CSS size is
 * computed from the original dimensions, so a four-pixel-wide frame is blown up
 * to something visible rather than shown as a speck. `image-rendering:
 * pixelated` in the stylesheet keeps that honest: it is the stored pixels made
 * bigger, not a smoothed guess at what was between them.
 */
function thumbnail(pixels, width, height, label) {
  const scale = THUMB / Math.max(width, height);
  const shown = { width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)) };
  const store = scale >= 1 ? { width, height } : shown;

  const canvas = document.createElement('canvas');
  canvas.width = store.width;
  canvas.height = store.height;
  canvas.className = 'frame-canvas';
  canvas.style.width = `${shown.width}px`;
  canvas.style.height = `${shown.height}px`;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', label);

  const context = canvas.getContext('2d');
  const image = new ImageData(pixels, width, height);
  if (scale >= 1) {
    context.putImageData(image, 0, 0);
    return canvas;
  }

  // putImageData ignores any transform, so shrinking means going through a
  // second canvas. Smoothing is left on: this one really is a reduction, and
  // nearest-neighbour on a photograph at a fifth of the size is unreadable.
  const scratch = document.createElement('canvas');
  scratch.width = width;
  scratch.height = height;
  scratch.getContext('2d').putImageData(image, 0, 0);
  context.drawImage(scratch, 0, 0, store.width, store.height);
  return canvas;
}

/* ----------------------------------------------------------- the summary */

function renderSummary(gif, view) {
  const timing = duration(gif.frames);
  const fps = rate(gif.frames.length, timing.real);

  el.fileName.textContent = view.name;
  el.factVersion.textContent = `GIF${gif.version}`;
  el.factCanvas.textContent = `${gif.width} × ${gif.height}`;
  el.factSize.textContent = fileSize(gif.size);
  el.factSize.title = exact(gif.size);
  el.factFrames.textContent = count(gif.frames.length);
  el.factWritten.textContent = gif.frames.length ? clock(timing.nominal) : '—';

  if (timing.clamped > 0) {
    el.factPlays.textContent = `${clock(timing.real)}${fps ? ` (${fps.toFixed(1)} fps)` : ''}`;
    el.factPlays.className = 'warn';
    el.factPlays.title = `${count(timing.clamped)} frames ask for less than 0.02s and every `
      + 'browser holds them for 0.10s instead.';
  } else {
    el.factPlays.textContent = gif.frames.length
      ? `${clock(timing.real)}${fps ? ` (${fps.toFixed(1)} fps)` : ''}`
      : '—';
    el.factPlays.className = '';
    el.factPlays.title = '';
  }

  el.factLoops.textContent = gif.loop === null
    ? 'once — no loop block'
    : gif.loop === 0 ? 'forever' : `${count(gif.loop)} times`;
  el.factColors.textContent = plural(view.colors, 'colour', 'colours');
}

/* ---------------------------------------------------------- the findings */

const LEVEL_MARK = { bad: '✖', warn: '⚠', note: '•' };
const LEVEL_NAME = { bad: 'Problem', warn: 'Worth knowing', note: 'Note' };

function renderFindings(list) {
  el.findings.replaceChildren();
  for (const finding of list) {
    const item = document.createElement('li');
    item.className = `finding ${finding.level}`;

    const mark = document.createElement('span');
    mark.className = 'finding-mark';
    mark.textContent = LEVEL_MARK[finding.level];
    mark.title = LEVEL_NAME[finding.level];

    const body = document.createElement('div');
    // Both halves are written in findings.js and are the only strings on this
    // page rendered as markup. The one value in them that comes out of the file
    // is escaped there; everything else below sets textContent.
    body.innerHTML = `<strong>${finding.title}</strong> ${finding.body}`;

    item.append(mark, body);
    el.findings.append(item);
  }
}

/* ------------------------------------------------------------ the budget */

function renderBudget(gif, plan) {
  el.budgetBar.replaceChildren();
  el.budgetRows.replaceChildren();
  el.budgetTotal.textContent = exact(gif.size);

  for (const row of plan.rows) {
    if (row.bytes === 0 && row.key !== 'pixels') continue;

    const slice = document.createElement('span');
    slice.className = `slice slice-${row.key}`;
    slice.style.width = `${row.share * 100}%`;
    slice.title = `${row.label}: ${fileSize(row.bytes)}`;
    el.budgetBar.append(slice);

    const line = document.createElement('tr');
    const head = document.createElement('th');
    head.scope = 'row';

    const swatch = document.createElement('span');
    swatch.className = `key key-${row.key}`;
    const label = document.createElement('span');
    label.textContent = row.label;
    const note = document.createElement('span');
    note.className = 'budget-note';
    note.textContent = row.note;
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
  el.framesLede.textContent = undrawn > 0
    ? `${plural(gif.frames.length, 'frame', 'frames')}. `
      + `${count(gif.frames.length - undrawn)} of them are drawn here; the rest are too large `
      + 'to hold in memory all at once and are reported from their headers alone.'
    : `${plural(gif.frames.length, 'frame', 'frames')}, `
      + `${full === 0 ? 'none' : full === gif.frames.length ? 'all' : count(full)} of them `
      + 'covering the whole canvas.';

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
  el.showMore.textContent = `Show the other ${plural(left, 'frame', 'frames')}`;
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
    blank.textContent = 'not drawn';
    figure.append(blank);
  }

  const heading = document.createElement('p');
  heading.className = 'frame-head';
  heading.textContent = `Frame ${frame.index + 1}`;

  const rows = [
    ['Delay', delay(frame.delay) + (frame.delay < 2 ? ' → 0.10s' : '')],
    ['Rectangle', `${frame.width} × ${frame.height} at ${frame.left}, ${frame.top}`],
    ['Disposal', DISPOSALS[frame.disposal] ?? `Reserved (${frame.disposal})`],
    ['Palette', frame.palette
      ? `${count(frame.palette.count)} of its own`
      : gif.globalPalette ? 'the global one' : 'none at all'],
    ['Transparent', frame.transparentIndex >= 0 ? `index ${frame.transparentIndex}` : 'no'],
    ['Size', `${fileSize(frame.bytes)} — ${percent(frame.bytes / gif.size)}`],
  ];
  if (frame.interlaced) rows.push(['Interlaced', 'yes']);
  if (drawn && drawn.ratio > 0) rows.push(['Compressed', `${drawn.ratio.toFixed(1)}×`]);
  if (drawn && (drawn.corrupt || drawn.truncated)) {
    rows.push(['Trouble', drawn.corrupt ?? 'the data ends early']);
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

  el.colorsLede.textContent = 'The tables in this file declare '
    + `${plural(waste.declared, 'colour', 'colours')} between them, the pixels refer to `
    + `${count(waste.referenced)} of those, and ${count(view.colors)} of those are different `
    + 'from each other.';

  el.globalPaletteWrap.hidden = !gif.globalPalette;
  if (gif.globalPalette) {
    const union = new Uint8Array(256);
    for (const [index, frame] of gif.frames.entries()) {
      if (frame.palette || !used[index]) continue;
      for (let at = 0; at < 256; at += 1) if (used[index][at]) union[at] = 1;
    }
    const sharing = gif.frames.filter((frame) => !frame.palette).length;
    el.globalPaletteNote.textContent = `${plural(gif.globalPalette.count, 'entry', 'entries')}, `
      + `${fileSize(gif.globalPalette.bytes)}, shared by `
      + `${plural(sharing, 'frame', 'frames')}. `
      + 'Faded entries are ones no pixel ever refers to.';
    el.globalPalette.replaceChildren(...swatches(gif.globalPalette, union));
  }

  el.localPalettesWrap.hidden = locals.length === 0;
  if (locals.length > 0) {
    el.localPalettesSummary.textContent = `${plural(locals.length, 'per-frame table', 'per-frame tables')} `
      + `(${fileSize(locals.reduce((sum, frame) => sum + frame.palette.bytes, 0))} in total)`;
    el.localPalettes.replaceChildren();
    // Capped for the same reason the frame list is: a file with six hundred
    // local palettes would put a hundred and fifty thousand swatches in the
    // document, and the browser would stop being a browser.
    for (const frame of locals.slice(0, 24)) {
      const heading = document.createElement('h4');
      heading.textContent = `Frame ${frame.index + 1} — `
        + `${plural(frame.palette.count, 'colour', 'colours')}`;
      const list = document.createElement('ul');
      list.className = 'palette';
      list.append(...swatches(frame.palette, used[frame.index]));
      el.localPalettes.append(heading, list);
    }
    if (locals.length > 24) {
      const note = document.createElement('p');
      note.className = 'palette-note';
      note.textContent = `The first 24 of ${count(locals.length)} are shown. `
        + 'The rest are in the downloadable report.';
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
      ? `${index}: ${code} — never used`
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
    // textContent, and deliberately: `name` is eight bytes copied out of
    // somebody else's file.
    head.textContent = `${extension.name} — ${fileSize(extension.bytes)}`;
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
  if (extension.kind === 'comment') {
    return 'A comment. No viewer shows it, and every copy of the file carries it.';
  }
  if (extension.loop !== undefined) {
    return extension.loop === 0
      ? 'The loop block, saying to play forever. It is not part of the GIF specification: '
        + 'Netscape invented it in 1995 and everything implemented it anyway.'
      : `The loop block, saying to play ${plural(extension.loop, 'time', 'times')}.`;
  }
  if (extension.name.startsWith('XMP')) {
    return 'An XMP packet: the XML an image editor writes to record what it did. Nothing '
      + 'draws it.';
  }
  if (extension.name.startsWith('ICCRGBG1')) {
    return 'An ICC colour profile, saying what the palette’s numbers mean as colours. '
      + 'Almost nothing reads one out of a GIF.';
  }
  if (extension.kind === 'plain-text') {
    return 'A plain-text block, which asks the viewer to draw text over the picture. It was '
      + 'in the 1989 specification and was never implemented by anything.';
  }
  return 'An application block. Viewers skip the ones they do not recognise.';
}

/* ------------------------------------------------------------ the report */

el.downloadReport.addEventListener('click', () => {
  if (!current) return;
  const text = report(current.gif, current.view);
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${current.name.replace(/\.gif$/i, '')}-analysis.txt`;
  link.click();
  // Long enough for the download to have started, and revoked either way so a
  // page left open all afternoon does not accumulate them.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
});

el.copyReport.addEventListener('click', async () => {
  if (!current) return;
  const text = report(current.gif, current.view);
  try {
    await navigator.clipboard.writeText(text);
    el.copyStatus.textContent = 'Copied. It is plain text, and it went to your clipboard only.';
  } catch {
    el.copyStatus.textContent = 'This browser would not let the page write to the clipboard. '
      + 'Use "Download it" instead.';
  }
});

/* ------------------------------------------------------------- the frame */

function showError(message) {
  el.loadError.textContent = message;
  el.loadError.hidden = false;
}

function hideError() {
  el.loadError.hidden = true;
  el.copyStatus.textContent = '';
}

el.privacyToggle?.addEventListener('click', () => {
  const open = el.privacyPanel.hidden;
  el.privacyPanel.hidden = !open;
  el.privacyToggle.setAttribute('aria-expanded', String(open));
});

// Hosts belonging to the ad, measurement and donate-button scripts. This tool
// has no network feature of its own at all - there is no address to paste and
// nothing to fetch - so anything outside this list appearing here would be a
// genuine surprise, and the panel says so in those terms.
// google.com is written as a pattern because Google's measurement pixel uses
// the visitor's own country domain, and a list of literal hostnames would turn
// this panel red for a visitor in the wrong country - which is the worst
// possible failure for the one part of the page that exists to be checked.
// cloudflareinsights.com is here because the host injects its own beacon; the
// CSP blocks it from running, but a blocked script still leaves a timing entry.
const PLATFORM_HOSTS = /(^|\.)(googlesyndication\.com|doubleclick\.net|googleadservices\.com|googletagservices\.com|adtrafficquality\.google|googletagmanager\.com|google-analytics\.com|gstatic\.com|googleapis\.com|buymeacoffee\.com|cloudflareinsights\.com|google\.[a-z]{2,3}(\.[a-z]{2})?)$/;

/**
 * Report what this page has actually fetched.
 *
 * The claim on trial is not "this page is silent" - it is not, it carries ads -
 * but "nothing has carried your file away". That is the part that matters, and
 * the part a sceptical visitor can watch hold in real time.
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
    const platformNote = platform.size === 0
      ? ''
      : ` The page's own ad, measurement and donate-button scripts loaded from ${platform.size} `
        + `host${platform.size === 1 ? '' : 's'}; not one of them was given a file.`;

    el.networkCount.textContent = clean
      ? `your GIF has gone nowhere. ${total} files loaded.${platformNote}`
      : `something contacted ${[...external].join(', ')}, which this tool never does.${platformNote}`;

    el.networkCount.className = clean ? 'good' : 'warn';
    el.networkDot.className = `live-dot ${clean ? 'good' : 'warn'}`;
  };

  inspect(performance.getEntriesByType('resource'));
  try {
    new PerformanceObserver((list) => inspect(list.getEntries()))
      .observe({ type: 'resource', buffered: true });
  } catch {
    // PerformanceObserver is unavailable; the one-time snapshot above still stands.
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
    fail('not available in this browser (everything else still works).');
    return;
  }
  if (!window.isSecureContext) {
    fail('needs https:// or localhost to cache for offline use.');
    return;
  }

  try {
    await navigator.serviceWorker.register('sw.js');
    await navigator.serviceWorker.ready;
    el.offlineStatus.textContent = 'ready - disconnect from the internet and this still works.';
    el.offlineStatus.className = 'good';
    el.offlineDot.className = 'live-dot good';
  } catch (error) {
    fail('caching unavailable here, but nothing is uploaded either way.', error.message);
  }
}

/* -------------------------------------------------------------------- boot */

window.addEventListener('error', (event) => {
  showError(`Something broke: ${event.message}. Reload the page to start over.`);
});
window.addEventListener('unhandledrejection', (event) => {
  showError(`Something broke: ${event.reason?.message ?? event.reason}. `
    + 'Reload the page to start over.');
});

monitorNetwork();
registerServiceWorker();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
