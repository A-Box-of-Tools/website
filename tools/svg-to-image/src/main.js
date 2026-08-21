/** UI wiring and application state. */

import {
  decodeSvgText, intrinsicSize, looksLikeSvg,
} from './svg.js';
import {
  MODES, atDensity, checkLimits, describePlan, planSize, times,
} from './sizing.js';
import {
  FORMATS, JPEG, PNG, WEBP, draw, encodableTypes, loadAt, rasterize,
} from './render.js';
import {
  bytes as humanBytes, countOf, describeSource, dimensions, outName, uniqueNames,
} from './files.js';
import { wireFilePicker, readingLabel } from './shared/file-picker.js';
import { makeZip } from './zip.js';

const $ = (id) => document.getElementById(id);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  fileList: $('file-list'),
  listToolbar: $('list-toolbar'),
  countLabel: $('count-label'),
  clearAll: $('clear-all'),
  loadError: $('load-error'),
  sizeMode: $('size-mode'),
  sizeScale: $('size-scale'),
  sizeWidth: $('size-width'),
  sizeHeight: $('size-height'),
  sizeLongest: $('size-longest'),
  boxWidth: $('box-width'),
  boxHeight: $('box-height'),
  boxFit: $('box-fit'),
  density: $('density'),
  sizeSummary: $('size-summary'),
  sizeWarning: $('size-warning'),
  format: $('format'),
  formatNote: $('format-note'),
  qualityField: $('quality-field'),
  quality: $('quality'),
  qualityValue: $('quality-value'),
  backgroundMode: $('background-mode'),
  backgroundColour: $('background-colour'),
  backgroundNote: $('background-note'),
  preview: $('preview'),
  previewCanvas: $('preview-canvas'),
  previewNote: $('preview-note'),
  previewEmpty: $('preview-empty'),
  run: $('run'),
  progress: $('progress'),
  progressBar: $('progress-bar'),
  progressLabel: $('progress-label'),
  results: $('results'),
  resultList: $('result-list'),
  resultsSummary: $('results-summary'),
  downloadZip: $('download-zip'),
  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
  networkCount: $('network-count'),
  networkDot: $('network-dot'),
  offlineStatus: $('offline-status'),
  offlineDot: $('offline-dot'),
};

/** Which panel of size fields belongs to which mode. */
const FIELDS = {
  [MODES.scale]: $('scale-fields'),
  [MODES.width]: $('width-fields'),
  [MODES.height]: $('height-fields'),
  [MODES.longest]: $('longest-fields'),
  [MODES.box]: $('box-fields'),
};

/**
 * @typedef {object} Item
 * @property {number} id
 * @property {File} file
 * @property {string} text      the SVG source, decoded once and kept
 * @property {object} intrinsic what the file says its size is
 * @property {string} thumbUrl  an object URL, revoked when the item is dropped
 */

/** @type {Item[]} */
let items = [];
let nextId = 1;
let busy = false;

/** Which drawing the preview is showing. Clicking a row changes it. */
let activeId = null;

/** Everything the run produced, kept so the rows can be redrawn without work. */
let results = [];
let resultUrls = [];

/** Which formats this browser will actually write. Filled in at boot. */
let writable = new Set([PNG, JPEG]);

/* ------------------------------------------------------------------ adding */

const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles(files) {
    addFiles(files);
  },
});

async function addFiles(files) {
  if (!files?.length || busy) return;

  picker.busy(readingLabel(files.length));
  const failures = [];

  try {
    for (const file of files) {
      if (!looksLikeSvg(file)) {
        failures.push(`${file.name}: this tool only reads SVG files. `
          + 'A PNG or a JPEG is already pixels; the Image Resizer is the one for those.');
        continue;
      }

      const text = decodeSvgText(await file.arrayBuffer());
      const intrinsic = intrinsicSize(text);
      if (!intrinsic) {
        // Named .svg and holding something else, or truncated. Either way
        // there is no root element, so there is nothing to draw.
        failures.push(`${file.name}: there is no <svg> element in this file.`);
        continue;
      }

      items.push({
        id: nextId,
        file,
        text,
        intrinsic,
        thumbUrl: URL.createObjectURL(file),
      });
      nextId += 1;
    }
  } finally {
    picker.done();
  }

  if (failures.length) showLoadError(failures.join('\n'));
  else clearLoadError();

  if (activeId === null && items.length) activeId = items[0].id;

  clearResults();
  render();
  drawPreview();
}

function removeItem(id) {
  const item = items.find((one) => one.id === id);
  if (!item || busy) return;
  URL.revokeObjectURL(item.thumbUrl);
  items = items.filter((one) => one.id !== id);
  if (activeId === id) activeId = items.length ? items[0].id : null;

  clearResults();
  render();
  drawPreview();
}

el.clearAll.addEventListener('click', () => {
  if (busy) return;
  for (const item of items) URL.revokeObjectURL(item.thumbUrl);
  items = [];
  activeId = null;
  clearResults();
  clearLoadError();
  render();
  drawPreview();
});

const activeItem = () => items.find((item) => item.id === activeId) ?? null;

function setActive(id) {
  if (activeId === id) return;
  activeId = id;
  render();
  drawPreview();
}

/* -------------------------------------------------------------- the settings */

/**
 * Every control on the page, read in one place.
 *
 * The preview, the sentence under the size fields and the run all take their
 * numbers from this - so the page cannot describe one thing and then produce
 * another, which is the failure worth designing against in a tool whose whole
 * job is a number.
 */
function settings() {
  const mime = el.format.value;
  const opaque = !FORMATS[mime].alpha;
  const asked = el.backgroundMode.value === 'colour';

  return {
    mode: el.sizeMode.value,
    scale: Number(el.sizeScale.value),
    width: el.sizeMode.value === MODES.box ? Number(el.boxWidth.value) : Number(el.sizeWidth.value),
    height: el.sizeMode.value === MODES.box ? Number(el.boxHeight.value) : Number(el.sizeHeight.value),
    longest: Number(el.sizeLongest.value),
    fit: el.boxFit.value,
    densities: densities(),
    mime,
    quality: FORMATS[mime].lossy ? Number(el.quality.value) / 100 : undefined,
    // A format with no alpha channel gets a background whether one was asked
    // for or not: without it the transparent parts come out black, which reads
    // as a bug in the tool rather than as a property of JPEG.
    background: asked || opaque ? el.backgroundColour.value : null,
  };
}

const densities = () => [1, 2, 3].slice(0, Number(el.density.value));

/** The canvas one item comes out as, at 1x. */
const planFor = (item) => planSize(item.intrinsic, settings());

/* --------------------------------------------------------------- rendering */

function render() {
  renderFields();
  renderList();
  renderNotes();

  el.run.disabled = busy || items.length === 0 || !everythingFits();
  el.run.textContent = items.length > 1 ? `Rasterize ${countOf(items.length)}` : 'Rasterize';
}

function renderFields() {
  for (const [mode, panel] of Object.entries(FIELDS)) panel.hidden = mode !== el.sizeMode.value;

  const mime = el.format.value;
  el.qualityField.hidden = !FORMATS[mime].lossy;
  el.qualityValue.textContent = el.quality.value;

  // The colour is shown whenever it can be seen: when it was asked for, and
  // when the format has no alpha channel and will use it regardless.
  el.backgroundColour.hidden = el.backgroundMode.value !== 'colour' && FORMATS[mime].alpha;

  for (const control of [el.sizeMode, el.format, el.backgroundMode, el.density, el.boxFit, el.quality]) {
    control.disabled = busy;
  }
}

function renderList() {
  el.fileList.replaceChildren();
  el.listToolbar.hidden = items.length === 0;
  el.countLabel.textContent = `${countOf(items.length)} chosen`;
  el.clearAll.disabled = busy;

  for (const item of items) {
    const row = document.createElement('li');
    row.className = 'file-row';
    if (item.id === activeId) row.classList.add('active');

    const wrap = document.createElement('div');
    wrap.className = 'file-main-wrap';

    // The thumbnail is the file itself in an <img>, which is the same secure
    // static mode the renderer draws in: no script in it runs and nothing it
    // points at is fetched.
    const thumb = document.createElement('img');
    thumb.className = 'file-thumb';
    thumb.src = item.thumbUrl;
    thumb.alt = '';

    const main = document.createElement('div');
    main.className = 'file-main';

    const name = document.createElement('p');
    name.className = 'file-name';
    name.textContent = item.file.name;

    const sub = document.createElement('p');
    sub.className = 'file-sub';
    sub.textContent = `${describeSource(item.intrinsic)} · ${humanBytes(item.file.size)}`;

    const out = document.createElement('p');
    out.className = 'file-out';
    const plan = planFor(item);
    const limit = checkLimits(atDensity(plan, densities().at(-1)));
    out.textContent = limit.ok
      ? `→ ${dimensions(plan.width, plan.height)}`
      : `→ too big: ${limit.reason}`;
    out.classList.toggle('warn', !limit.ok);

    main.append(name, sub, out);
    wrap.append(thumb, main);

    // The whole row puts this drawing in the preview. More than one file is a
    // batch, and a batch still has to be looked at one at a time.
    wrap.tabIndex = 0;
    wrap.setAttribute('role', 'button');
    wrap.setAttribute('aria-pressed', String(item.id === activeId));
    wrap.title = 'Show this one in the preview';
    wrap.addEventListener('click', () => setActive(item.id));
    wrap.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setActive(item.id);
      }
    });

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'row-remove';
    remove.textContent = '×';
    remove.title = `Take ${item.file.name} off the list`;
    remove.setAttribute('aria-label', `Take ${item.file.name} off the list`);
    remove.disabled = busy;
    remove.addEventListener('click', () => removeItem(item.id));

    row.append(wrap, remove);
    el.fileList.append(row);
  }
}

function renderNotes() {
  const item = activeItem();
  const set = settings();

  el.sizeSummary.textContent = item
    ? describePlan(planFor(item), item.intrinsic, set.densities)
    : 'Add an SVG and this says what size it will come out.';

  const worst = worstLimit();
  el.sizeWarning.hidden = !worst;
  el.sizeWarning.textContent = worst?.reason ?? '';
  el.sizeWarning.classList.toggle('warn', Boolean(worst && !worst.ok));

  el.formatNote.textContent = formatSentence(set.mime);
  el.backgroundNote.textContent = backgroundSentence(set);
}

/** The unhappiest verdict across every file on the list, at its largest density. */
function worstLimit() {
  const largest = densities().at(-1);
  let worst = null;
  for (const item of items) {
    const limit = checkLimits(atDensity(planFor(item), largest));
    if (!limit.ok) return limit;
    if (limit.warn && !worst) worst = limit;
  }
  return worst;
}

const everythingFits = () => items.every(
  (item) => checkLimits(atDensity(planFor(item), densities().at(-1))).ok);

function formatSentence(mime) {
  if (mime === PNG) {
    return 'Lossless, and the only one of the three that every piece of software reads. '
      + 'Flat colour and hard edges - which is most of what a drawing is made of - compress well in it, '
      + 'so a rasterised logo is usually smaller as a PNG than as a JPEG anyway.';
  }
  if (mime === JPEG) {
    return 'No transparency, and lossy in the way that shows worst on exactly this kind of picture: '
      + 'a ring of speckle around every hard edge. Worth it for a drawing that is mostly photograph-like '
      + 'shading, and rarely otherwise.';
  }
  return writable.has(WEBP)
    ? 'Transparency like a PNG, and a smaller file than either of the others at the same quality. '
      + 'Read by every current browser; older software and some print shops still will not open one.'
    : 'This browser cannot write WebP, so a PNG would come out instead. Pick one of the other two.';
}

function backgroundSentence({ mime, background }) {
  if (!background) return 'The transparent parts of the drawing stay transparent.';
  return FORMATS[mime].alpha
    ? 'Painted behind the whole picture, so nothing in the file is transparent.'
    : `${FORMATS[mime].label} has no transparency, so this colour is painted behind the drawing. `
      + 'Without it, everything that was transparent would come out black.';
}

/* -------------------------------------------------------------- the preview */

/**
 * The biggest the preview is drawn, in CSS pixels.
 *
 * The output is not drawn at its real size and then scaled down by the layout:
 * a 4096 pixel canvas held live while somebody drags a slider is 64 MB and a
 * visible stutter. The vector is re-rasterised at the preview's own size
 * instead, which is what a vector is for - it is the same code path, the same
 * plan, and the same background, only smaller.
 */
const PREVIEW_MAX = 420;

let previewToken = 0;

async function drawPreview() {
  const item = activeItem();
  el.preview.hidden = !item;
  el.previewEmpty.hidden = Boolean(item);
  if (!item) return;

  const token = (previewToken += 1);
  const set = settings();
  const full = planFor(item);
  const shown = shrinkPlan(full, PREVIEW_MAX);

  try {
    const held = await loadAt(item.text, shown.draw.width, shown.draw.height, { stretch: shown.stretch });
    try {
      // Another file or another setting arrived while this was decoding. Its
      // own call is already on the way; drawing this one would be a flicker of
      // the wrong picture.
      if (token !== previewToken) return;
      const canvas = draw(held.image, shown, { background: set.background });
      const ctx = el.previewCanvas.getContext('2d');
      el.previewCanvas.width = canvas.width;
      el.previewCanvas.height = canvas.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(canvas, 0, 0);
      canvas.width = 0;
      canvas.height = 0;
    } finally {
      held.release();
    }
  } catch (error) {
    if (token === previewToken) showLoadError(`${item.file.name}: ${error.message}`);
    return;
  }

  el.previewCanvas.classList.toggle('opaque', Boolean(set.background));
  el.previewNote.textContent = previewSentence(full, shown, set);
}

/** The same plan, small enough to look at. */
function shrinkPlan(plan, maxSide) {
  const factor = Math.min(1, maxSide / Math.max(plan.width, plan.height));
  if (factor === 1) return plan;
  const at = (n) => Math.max(1, Math.round(n * factor));
  return {
    width: at(plan.width),
    height: at(plan.height),
    draw: {
      x: Math.round(plan.draw.x * factor),
      y: Math.round(plan.draw.y * factor),
      width: at(plan.draw.width),
      height: at(plan.draw.height),
    },
    padded: plan.padded,
    stretch: plan.stretch,
  };
}

function previewSentence(full, shown, set) {
  const scale = shown.width === full.width
    ? 'Shown at the size it will be.'
    : `Shown at ${times(shown.width / full.width)} of the ${dimensions(full.width, full.height)} `
      + 'file, redrawn from the vector rather than shrunk - so this is what that size looks like.';

  const alpha = set.background
    ? ''
    : ' The checkerboard is where the file will be transparent.';

  return `${scale}${alpha}`;
}

/* ----------------------------------------------------------------- the run */

el.run.addEventListener('click', () => {
  runAll().catch((error) => {
    showLoadError(`Something broke: ${error.message}. Reload the page to start over.`);
    busy = false;
    el.progress.hidden = true;
    render();
  });
});

async function runAll() {
  if (busy || !items.length || !everythingFits()) return;

  busy = true;
  clearResults();
  render();

  const set = settings();
  const { ext } = FORMATS[set.mime];
  const jobs = items.flatMap((item) => set.densities.map((density) => ({ item, density })));
  const names = uniqueNames(jobs.map((job) => outName(job.item.file.name, ext, job.density)));

  el.progress.hidden = false;
  setProgress(0, `Drawing ${countOf(jobs.length)}…`);

  const made = [];

  for (const [index, job] of jobs.entries()) {
    setProgress(index / jobs.length, `Drawing ${names[index]}…`);
    // Yield so the line above is painted before the work starts.
    await new Promise((resolve) => setTimeout(resolve, 0));

    const plan = atDensity(planSize(job.item.intrinsic, set), job.density);
    const blob = await rasterize(job.item.text, plan, set);
    made.push({ ...job, plan, blob, name: names[index] });
  }

  setProgress(1, 'Done.');
  busy = false;
  results = made;
  renderResults();
  render();
  el.progress.hidden = true;
}

function setProgress(fraction, label) {
  el.progressBar.style.width = `${Math.round(fraction * 100)}%`;
  el.progressLabel.textContent = label;
}

/* ------------------------------------------------------------ the results */

function renderResults() {
  el.resultList.replaceChildren();
  el.results.hidden = results.length === 0;
  if (!results.length) return;

  const total = results.reduce((n, one) => n + one.blob.size, 0);
  const sources = new Set(results.map((one) => one.item.id)).size;

  el.resultsSummary.textContent = results.length === 1
    ? `${results[0].name}, ${dimensions(results[0].plan.width, results[0].plan.height)}, ${humanBytes(total)}.`
    : `${countOf(results.length)} written from ${countOf(sources).replace('file', 'drawing')}, `
      + `${humanBytes(total)} in total.`;

  for (const one of results) el.resultList.append(resultRow(one));

  el.downloadZip.hidden = results.length < 2;
  el.downloadZip.onclick = () => zipAll();
}

function resultRow(one) {
  const li = document.createElement('li');
  li.className = 'result-row';

  const textBlock = document.createElement('div');
  textBlock.className = 'result-text';

  const name = document.createElement('p');
  name.className = 'result-name';
  name.textContent = one.name;

  const headline = document.createElement('p');
  headline.className = 'result-headline';
  headline.textContent = `${dimensions(one.plan.width, one.plan.height)}, ${humanBytes(one.blob.size)}`;

  const detail = document.createElement('p');
  detail.className = 'result-detail';
  detail.textContent = `From ${one.item.file.name}, which draws itself at `
    + `${dimensions(one.item.intrinsic.width, one.item.intrinsic.height)} - `
    + `${times(one.plan.width / one.item.intrinsic.width)} that`
    + (one.density > 1 ? `, and the @${one.density}x of the file above it.` : '.');

  textBlock.append(name, headline, detail);

  const actions = document.createElement('div');
  actions.className = 'result-actions';

  const download = document.createElement('a');
  download.className = 'primary as-button';
  download.textContent = 'Download';
  download.href = urlFor(one.blob);
  download.download = one.name;
  actions.append(download);

  li.append(textBlock, actions);
  return li;
}

async function zipAll() {
  const files = [];
  for (const one of results) {
    files.push({ name: one.name, data: new Uint8Array(await one.blob.arrayBuffer()) });
  }
  save(makeZip(files), 'rasterized.zip');
}

function urlFor(blob) {
  const url = URL.createObjectURL(blob);
  resultUrls.push(url);
  return url;
}

function save(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  // Revoked late: revoking immediately can cancel a download that has not
  // started yet in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function clearResults() {
  for (const url of resultUrls) URL.revokeObjectURL(url);
  resultUrls = [];
  results = [];
  el.results.hidden = true;
  el.resultList.replaceChildren();
  el.resultsSummary.textContent = '';
  // The button is hidden with the panel, but its handler would still be
  // holding the blobs from the last run in a closure nobody can reach.
  el.downloadZip.hidden = true;
  el.downloadZip.onclick = null;
}

/* ------------------------------------------------------------- the controls */

for (const control of [el.sizeMode, el.density, el.boxFit, el.format, el.backgroundMode]) {
  control.addEventListener('change', () => {
    clearResults();
    render();
    drawPreview();
  });
}

for (const field of [el.sizeScale, el.sizeWidth, el.sizeHeight, el.sizeLongest,
  el.boxWidth, el.boxHeight, el.backgroundColour, el.quality]) {
  field.addEventListener('input', () => {
    clearResults();
    render();
    drawPreview();
  });
}

for (const [group, key] of [[$('scale-presets'), 'scale'], [$('width-presets'), 'width']]) {
  group.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-' + key + ']');
    if (!button) return;
    (key === 'scale' ? el.sizeScale : el.sizeWidth).value = button.dataset[key];
    clearResults();
    render();
    drawPreview();
  });
}

/* ------------------------------------------------------------------ errors */

function showLoadError(message) {
  el.loadError.textContent = message;
  el.loadError.hidden = false;
}

function clearLoadError() {
  el.loadError.textContent = '';
  el.loadError.hidden = true;
}

/* ------------------------------------------------- privacy panel + offline */

el.privacyToggle.addEventListener('click', () => {
  const open = el.privacyPanel.hidden;
  el.privacyPanel.hidden = !open;
  el.privacyToggle.setAttribute('aria-expanded', String(open));
});

// Hosts belonging to the ad, measurement and donate-button scripts. This tool
// has no network feature of its own, so there is no legitimate third bucket
// here: anything that is not this origin and not on this list would be a
// request nobody asked for, and the panel says so in those words.
// cloudflareinsights.com is included because the host injects its own beacon.
// The CSP blocks it from running, but a blocked script still leaves a resource
// timing entry, and reporting that as an unexplained request would be alarming
// and wrong. Anything the page can pull in without the user asking belongs here.
// google.com is written as a pattern because Google's measurement pixel uses
// the visitor's own country domain - www.google.ca, www.google.co.uk - and a
// list of literal hostnames turns the panel red for a visitor in the wrong
// country. That is the worst possible failure for this particular panel: the
// one place on the page meant to be checkable, saying something untrue.
const PLATFORM_HOSTS = /(^|\.)(googlesyndication\.com|doubleclick\.net|googleadservices\.com|googletagservices\.com|adtrafficquality\.google|googletagmanager\.com|google-analytics\.com|gstatic\.com|googleapis\.com|buymeacoffee\.com|cloudflareinsights\.com|google\.[a-z]{2,3}(\.[a-z]{2})?)$/;

/**
 * Report what this page has actually fetched.
 *
 * The claim on trial is not "this page is silent" - it is not silent, it
 * carries ads - but "nothing has carried your drawing away". That is the part
 * that matters, and the part a sceptical visitor can watch hold in real time.
 */
function monitorNetwork() {
  const platform = new Set();
  const unexplained = new Set();

  const inspect = (entries) => {
    for (const entry of entries) {
      if (entry.name.startsWith('blob:') || entry.name.startsWith('data:')) continue;
      const url = new URL(entry.name, location.href);
      if (url.origin === location.origin) continue;
      if (PLATFORM_HOSTS.test(url.hostname)) platform.add(url.hostname);
      else unexplained.add(url.hostname);
    }

    const total = performance.getEntriesByType('resource')
      .filter((e) => !e.name.startsWith('blob:') && !e.name.startsWith('data:')).length;

    const clean = unexplained.size === 0;
    const platformNote = platform.size === 0
      ? ''
      : ` The page's own ad, measurement and donate-button scripts loaded from ${platform.size} host${platform.size === 1 ? '' : 's'}; not one of them was given a file or a byte of one.`;

    el.networkCount.textContent = clean
      ? `your files have gone nowhere. ${total} files loaded, all of them this page's own.${platformNote}`
      : `something contacted ${[...unexplained].join(', ')}, which this tool never does. Treat that as worth investigating.${platformNote}`;

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
    fail('not available in this browser (everything else still works).');
    return;
  }
  // Service workers need a secure context, so file:// and plain http:// are out.
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
    // Caching is an optimisation, not the privacy guarantee. Everything the
    // page claims still holds when this fails, so say so rather than alarming.
    fail('caching unavailable here, but nothing is uploaded either way.', error.message);
  }
}

/**
 * Take WebP off the menu on a browser that cannot write it.
 *
 * `toBlob` does not fail on a type it does not know; it quietly hands back a
 * PNG. Leaving the option there would produce a file called .webp that is a
 * PNG inside, which is worse than not offering it.
 */
async function checkFormats() {
  writable = await encodableTypes();
  if (writable.has(WEBP)) return;

  const option = el.format.querySelector(`option[value="${WEBP}"]`);
  if (option) {
    option.disabled = true;
    option.textContent = 'WebP - this browser cannot write it';
  }
  if (el.format.value === WEBP) el.format.value = PNG;
  render();
}

/* -------------------------------------------------------------------- boot */

// An error thrown after boot would otherwise only reach the console, leaving
// the page looking functional but doing nothing.
window.addEventListener('error', (event) => {
  showLoadError(`Something broke: ${event.message}. Reload the page to start over.`);
});
window.addEventListener('unhandledrejection', (event) => {
  showLoadError(`Something broke: ${event.reason?.message ?? event.reason}. Reload the page to start over.`);
});

render();
checkFormats();
monitorNetwork();
registerServiceWorker();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();