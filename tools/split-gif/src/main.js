/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { wireFilePicker } from './shared/file-picker.js';
import { decodeGif, GifFormatError, playedDelay, totalDuration } from './gif.js';
import { GifCanvas, flatten, parseColour, patchPixels } from './compose.js';
import {
  disposalLabel, encodePng, formatBytes, formatSeconds,
  baseName, frameName, thumbnail, timingList, zipName,
} from './frames.js';
import { makeZip } from './shared/zip.js';
import { cellAt, sheetName, sheetPlan } from './sheet.js';

const $ = (id) => document.getElementById(id);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  source: $('source'),
  srcName: $('src-name'),
  srcSize: $('src-size'),
  srcPicture: $('src-picture'),
  srcFrames: $('src-frames'),
  srcDuration: $('src-duration'),
  srcLoop: $('src-loop'),
  notice: $('notice'),
  error: $('error'),
  settingsCard: $('settings-card'),
  mode: $('mode'),
  modeNote: $('mode-note'),
  background: $('background'),
  colourRow: $('colour-row'),
  colour: $('colour'),
  every: $('every'),
  everyNote: $('every-note'),
  timing: $('timing'),
  downloadAll: $('download-all'),
  downloadSelected: $('download-selected'),
  downloadSheet: $('download-sheet'),
  cancel: $('cancel'),
  progressWrap: $('progress-wrap'),
  progressBar: $('progress-bar'),
  progressLabel: $('progress-label'),
  framesCard: $('frames-card'),
  framesCount: $('frames-count'),
  frames: $('frames'),
  selectAll: $('select-all'),
  selectNone: $('select-none'),
  clear: $('clear'),
  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
  networkCount: $('network-count'),
  networkDot: $('network-dot'),
  offlineStatus: $('offline-status'),
  offlineDot: $('offline-dot'),
};

/** @type {File|null} */
let file = null;
/** What decodeGif() made of it. */
let gif = null;
/** One row per frame: the frame, its name, its thumbnail and whether it is picked. */
let rows = [];
/** True while a ZIP or a single frame is being written. */
let working = false;
let cancelled = false;
/**
 * Which render pass owns the grid. Changing a setting starts a new pass over
 * every frame, and the old one has to stop drawing into a list that is now
 * showing something else - so each pass carries a number and drops out the
 * moment it is no longer the current one.
 */
let pass = 0;

/* ------------------------------------------------------------------ adding */

// The drop zone and the picker: shared, because every tool here needs the same
// one. src/shared/file-picker.js, copied in from shared/js/ by the build.
const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles(files) {
    const [picked] = files;
    if (picked) loadFile(picked);
  },
});

/* ----------------------------------------------------------------- loading */

async function loadFile(picked) {
  if (working) return;

  clearError();
  picker.busy('Reading the GIF...');

  try {
    const bytes = new Uint8Array(await picked.arrayBuffer());
    const decoded = decodeGif(bytes);

    reset();
    file = picked;
    gif = decoded;
    describe();
    build();
    await draw();
  } catch (error) {
    if (error instanceof GifFormatError) showError(error.message);
    else showError(`That file could not be read: ${error.message}`);
  } finally {
    picker.done();
  }
}

/** Fill in what the file turned out to be. */
function describe() {
  const partial = gif.frames.filter((frame) => frame.partial).length;
  const local = gif.frames.filter((frame) => frame.hasLocalPalette).length;

  el.srcName.textContent = file.name;
  el.srcSize.textContent = formatBytes(file.size);
  el.srcPicture.textContent = `${gif.width} x ${gif.height}`;
  el.srcFrames.textContent = String(gif.frames.length);
  el.srcDuration.textContent = formatSeconds(totalDuration(gif.frames));
  el.srcLoop.textContent = loopLabel(gif.loopCount);
  el.source.hidden = false;

  const notes = [];
  if (gif.truncated) notes.push(gif.truncated);
  if (partial) {
    notes.push(`${partial} frame${partial === 1 ? '' : 's'} stop short in the file itself; `
      + 'the missing pixels come out transparent.');
  }
  if (local) {
    notes.push(`${local} of the frames carry a colour table of their own, which is why `
      + 'this GIF is larger than its size suggests.');
  }
  if (gif.comment) notes.push(`The file carries a comment: "${gif.comment.slice(0, 120)}"`);

  el.notice.textContent = notes.join(' ');
  el.notice.hidden = notes.length === 0;
}

function loopLabel(loop) {
  if (loop === null) return 'plays once (no loop block)';
  if (loop === 0) return 'forever';
  return `${loop} more time${loop === 1 ? '' : 's'}`;
}

/* ---------------------------------------------------------------- the grid */

/** One row per frame, built once per file. Thumbnails arrive afterwards. */
function build() {
  const total = gif.frames.length;

  rows = gif.frames.map((frame, index) => ({
    index,
    frame,
    played: playedDelay(frame.delay),
    name: frameName(file.name, index + 1, total),
    checked: true,
    thumbUrl: null,
    node: null,
    image: null,
    meta: null,
  }));

  el.frames.replaceChildren(...rows.map(makeRow));
  applyEvery();
}

function makeRow(row) {
  const item = document.createElement('li');
  item.className = 'frame';

  const label = document.createElement('label');
  label.className = 'frame-pick';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = row.checked;
  box.addEventListener('change', () => {
    row.checked = box.checked;
    item.classList.toggle('unpicked', !box.checked);
    countFrames();
  });
  label.append(box, document.createTextNode(`Frame ${row.index + 1}`));

  const image = document.createElement('img');
  image.alt = `Frame ${row.index + 1}`;
  image.loading = 'lazy';

  const meta = document.createElement('p');
  meta.className = 'frame-meta';

  const save = document.createElement('button');
  save.type = 'button';
  save.className = 'ghost';
  save.textContent = 'Download';
  save.addEventListener('click', () => downloadOne(row));

  const body = document.createElement('div');
  body.className = 'frame-body';
  body.append(label, meta, save);

  item.append(image, body);

  row.node = item;
  row.image = image;
  row.meta = meta;
  row.box = box;
  return item;
}

/** What the settings currently say. */
function settings() {
  return {
    stored: el.mode.value === 'stored',
    colour: el.background.value === 'flatten' ? parseColour(el.colour.value) : null,
    every: Math.max(1, Math.min(100, Math.round(Number(el.every.value) || 1))),
    timing: el.timing.value === 'yes',
  };
}

/**
 * Redraw every thumbnail under the current settings.
 *
 * Composited frames have to be walked in order - frame 12 is frames 1 to 12 on
 * top of each other - so this is one pass forward through the animation, giving
 * the browser a turn every so often so the page stays alive on a long GIF.
 */
async function draw() {
  const mine = (pass += 1);
  const { stored, colour } = settings();

  const canvas = stored ? null : new GifCanvas(gif);
  progress(0, rows.length, 'Drawing the frames...');

  for (const row of rows) {
    if (mine !== pass) return;

    const { frame } = row;
    let pixels;
    let width;
    let height;

    if (stored) {
      pixels = patchPixels(frame);
      width = frame.width;
      height = frame.height;
    } else {
      const step = canvas.next();
      pixels = step.pixels.slice();
      width = gif.width;
      height = gif.height;
    }

    if (colour) flatten(pixels, colour);

    const thumb = await thumbnail(pixels, width, height);
    if (mine !== pass) {
      URL.revokeObjectURL(thumb.url);
      return;
    }

    if (row.thumbUrl) URL.revokeObjectURL(row.thumbUrl);
    row.thumbUrl = thumb.url;
    row.image.src = thumb.url;
    row.meta.textContent = describeFrame(row, stored);

    progress(row.index + 1, rows.length, 'Drawing the frames...');
    // One turn back to the browser per frame keeps the grid filling in visibly
    // and the page answering clicks. It costs a few milliseconds on a long
    // animation and buys a page that is never locked.
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  if (mine === pass) {
    hideProgress();
    countFrames();
  }
}

function describeFrame(row, stored) {
  const { frame } = row;
  const delay = `${formatSeconds(row.played)}`;
  const clamped = frame.delay < 2 ? ` (stored as ${(frame.delay / 100).toFixed(2)}s)` : '';

  if (!stored) return `${delay}${clamped} - ${gif.width} x ${gif.height}`;
  return `${delay}${clamped} - ${frame.width} x ${frame.height} at ${frame.x}, ${frame.y}`
    + ` - ${disposalLabel(frame.disposal)}`;
}

function countFrames() {
  const picked = rows.filter((row) => row.checked).length;
  el.framesCount.textContent = `${rows.length} frame${rows.length === 1 ? '' : 's'}`
    + `, ${picked} selected`;
  el.downloadSelected.hidden = picked === rows.length || picked === 0;
  el.downloadAll.disabled = rows.length === 0;
}

/** "Keep every N" ticks the frames it keeps and unticks the rest. */
function applyEvery() {
  const { every } = settings();
  for (const row of rows) {
    row.checked = row.index % every === 0;
    if (row.box) row.box.checked = row.checked;
    row.node?.classList.toggle('unpicked', !row.checked);
  }
  countFrames();
}

function pick(all) {
  for (const row of rows) {
    row.checked = all;
    if (row.box) row.box.checked = all;
    row.node?.classList.toggle('unpicked', !all);
  }
  countFrames();
}

/* -------------------------------------------------------------- the output */

/**
 * The pixels of one frame under the current settings.
 *
 * For a stored frame that is the patch on its own. For a composited one it
 * means replaying the animation from the start, which sounds expensive and is
 * not: the indices are already decoded, so a frame costs a copy and a paint.
 */
function pixelsFor(index, { stored, colour }) {
  const frame = gif.frames[index];

  if (stored) {
    const pixels = patchPixels(frame);
    if (colour) flatten(pixels, colour);
    return { pixels, width: frame.width, height: frame.height };
  }

  const canvas = new GifCanvas(gif);
  let step = null;
  for (let at = 0; at <= index; at += 1) step = canvas.next();

  const pixels = step.pixels.slice();
  if (colour) flatten(pixels, colour);
  return { pixels, width: gif.width, height: gif.height };
}

async function downloadOne(row) {
  if (working) return;
  clearError();

  try {
    const options = settings();
    const { pixels, width, height } = pixelsFor(row.index, options);
    save(await encodePng(pixels, width, height), row.name);
  } catch (error) {
    showError(`That frame could not be written: ${error.message}`);
  }
}

/**
 * Every selected frame, as one ZIP.
 *
 * One archive rather than a folder of downloads: a hundred frames is a hundred
 * save prompts otherwise, which is the point at which people give up and go
 * back to the upload site. The frames are encoded one at a time and the pass
 * runs forward through the animation exactly once, so a long GIF costs memory
 * for one canvas plus the PNGs themselves.
 */
/**
 * Every kept frame on one sheet, in a grid.
 *
 * The same forward walk the ZIP export makes, painting each frame into its cell
 * instead of encoding it on its own, so the cost is one working canvas plus the
 * sheet rather than every frame at once - which is the whole reason `GifCanvas`
 * exists and the one rule a sheet could easily have broken.
 *
 * Always the composited view. A sheet's cells have to be the same size and sit
 * on the same grid, and a stored frame is a patch of its own size at its own
 * offset; laying those out would produce a grid of unrelated rectangles that no
 * sprite-sheet reader could cut back up. The page says so when it applies
 * rather than silently ignoring the setting.
 *
 * `putImageData` rather than `drawImage`, because it writes the pixels through
 * untouched: no smoothing, no compositing, no alpha applied twice. Cells do not
 * overlap, so nothing is lost by skipping the blend - and a resampled sheet
 * would put a hairline of the next cell down every edge, which is exactly what
 * ruins pixel art.
 */
async function downloadSheet() {
  if (working) return;

  const options = settings();
  const wanted = rows.filter((row) => row.checked);
  const kept = wanted.length ? wanted : rows;
  if (!kept.length) return;

  const plan = sheetPlan(kept.length, gif.width, gif.height, 0);
  if (plan.tooBig) {
    showError(phrase('sheet.toobig', { width: plan.width, height: plan.height }));
    return;
  }

  working = true;
  cancelled = false;
  clearError();
  el.cancel.hidden = false;
  el.downloadAll.disabled = true;
  el.downloadSelected.disabled = true;
  el.downloadSheet.disabled = true;

  try {
    const sheet = document.createElement('canvas');
    sheet.width = plan.width;
    sheet.height = plan.height;
    const context = sheet.getContext('2d');

    const picked = new Set(kept.map((row) => row.index));
    const canvas = new GifCanvas(gif);
    let done = 0;

    for (const row of rows) {
      if (cancelled) break;

      // Every frame is drawn even when only every fifth is kept: frame 40 is
      // frames 1 to 39 underneath it whether or not anybody asked for them.
      const step = canvas.next();
      if (!picked.has(row.index)) continue;

      const pixels = step.pixels.slice();
      if (options.colour) flatten(pixels, options.colour);

      const { x, y } = cellAt(done, plan, gif.width, gif.height);
      context.putImageData(new ImageData(pixels, gif.width, gif.height), x, y);

      done += 1;
      // The stored setting cannot apply to a sheet, and saying so while the
      // sheet is drawing is the one moment somebody is looking at this line.
      progress(done, kept.length,
        options.stored ? phrase('sheet.stored') : phrase('sheet.drawing'));
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    if (cancelled) {
      hideProgress();
      return;
    }

    const blob = await new Promise((resolve, reject) => {
      sheet.toBlob((made) => {
        if (made) resolve(made);
        else reject(new Error('This browser would not write a PNG.'));
      }, 'image/png');
    });
    save(blob, sheetName(baseName(file.name), plan));
    hideProgress();
  } catch (error) {
    hideProgress();
    showError(`That sheet could not be written: ${error.message}`);
  } finally {
    working = false;
    el.cancel.hidden = true;
    el.downloadAll.disabled = false;
    el.downloadSelected.disabled = false;
    el.downloadSheet.disabled = false;
  }
}


async function downloadZip(wanted) {
  if (working || !wanted.length) return;

  working = true;
  cancelled = false;
  clearError();
  el.cancel.hidden = false;
  el.downloadAll.disabled = true;
  el.downloadSelected.disabled = true;

  const options = settings();
  const canvas = options.stored ? null : new GifCanvas(gif);
  const picked = new Set(wanted.map((row) => row.index));
  const files = [];
  const written = [];

  try {
    let done = 0;
    for (const row of rows) {
      if (cancelled) break;

      let pixels = null;
      let width = gif.width;
      let height = gif.height;

      if (options.stored) {
        // Nothing to replay: a stored frame does not depend on the ones before
        // it, so the frames nobody asked for are never touched.
        if (!picked.has(row.index)) continue;
        pixels = patchPixels(row.frame);
        width = row.frame.width;
        height = row.frame.height;
      } else {
        // Composited frames do depend on their predecessors, so every frame is
        // drawn even when only every fifth is being saved.
        const step = canvas.next();
        if (!picked.has(row.index)) continue;
        pixels = step.pixels.slice();
      }

      if (options.colour) flatten(pixels, options.colour);

      const blob = await encodePng(pixels, width, height);
      files.push({ name: row.name, data: new Uint8Array(await blob.arrayBuffer()) });
      written.push(row);

      done += 1;
      progress(done, wanted.length, `Writing frame ${done} of ${wanted.length}...`);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    if (cancelled) {
      hideProgress();
      return;
    }

    if (options.timing) {
      files.push({
        name: 'frames.txt',
        data: new TextEncoder().encode(timingList(file.name, gif, written)),
      });
    }

    save(makeZip(files), zipName(file.name));
    hideProgress();
  } catch (error) {
    showError(`The frames could not be written: ${error.message}`);
    hideProgress();
  } finally {
    working = false;
    cancelled = false;
    el.cancel.hidden = true;
    el.downloadAll.disabled = false;
    el.downloadSelected.disabled = false;
  }
}

/** Hand a blob to the browser as a download, and let go of it afterwards. */
function save(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  // Revoked on the next turn: revoking immediately races the download in
  // Firefox, which has not necessarily started reading the blob yet.
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

/* -------------------------------------------------------------- the frame */

function progress(done, total, label) {
  el.progressWrap.hidden = false;
  el.progressBar.style.width = `${total ? (done / total) * 100 : 0}%`;
  el.progressLabel.textContent = label;
}

function hideProgress() {
  el.progressWrap.hidden = true;
  el.progressBar.style.width = '0%';
  el.progressLabel.textContent = '';
}

function showError(message) {
  el.error.textContent = message;
  el.error.hidden = false;
}

function clearError() {
  el.error.hidden = true;
  el.error.textContent = '';
}

/** Let go of everything the last file left behind. */
function reset() {
  pass += 1;
  for (const row of rows) {
    if (row.thumbUrl) URL.revokeObjectURL(row.thumbUrl);
  }
  rows = [];
  gif = null;
  file = null;
  el.frames.replaceChildren();
  el.source.hidden = true;
  el.notice.hidden = true;
  hideProgress();
}

function updateModeNote() {
  el.modeNote.textContent = el.mode.value === 'stored'
    ? 'What the file holds: the patch each frame redraws, at its own size. '
      + 'This is how a GIF stays small, and it is not what the animation looks like.'
    : 'Every PNG is the whole picture, exactly as that moment of the animation '
      + 'looks. This is what almost everybody wants.';
}

function updateEveryNote() {
  const { every } = settings();
  el.everyNote.textContent = every === 1 ? 'frame' : `${ordinal(every)} frame`;
}

function ordinal(value) {
  if (value === 2) return 'second';
  if (value === 3) return 'third';
  return `${value}th`;
}

/* --------------------------------------------------------------- listeners */

el.mode.addEventListener('change', () => {
  updateModeNote();
  if (gif) draw();
});

el.background.addEventListener('change', () => {
  el.colourRow.hidden = el.background.value !== 'flatten';
  if (gif) draw();
});

let colourTimer = null;
el.colour.addEventListener('input', () => {
  clearTimeout(colourTimer);
  colourTimer = setTimeout(() => { if (gif) draw(); }, 150);
});

el.every.addEventListener('change', () => {
  updateEveryNote();
  if (gif) applyEvery();
});

el.selectAll.addEventListener('click', () => pick(true));
el.selectNone.addEventListener('click', () => pick(false));
el.clear.addEventListener('click', () => { reset(); clearError(); });

el.downloadAll.addEventListener('click', () => downloadZip(rows));
el.downloadSelected.addEventListener('click', () => downloadZip(rows.filter((row) => row.checked)));
el.downloadSheet.addEventListener('click', () => downloadSheet());
el.cancel.addEventListener('click', () => { cancelled = true; });

window.addEventListener('beforeunload', (event) => {
  if (!working) return;
  event.preventDefault();
  event.returnValue = ''; // still required by some browsers to trigger the prompt
});

/* ------------------------------------------------- privacy panel + offline */

el.privacyToggle.addEventListener('click', () => {
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
 * but "nothing has carried your GIF away". That is the part that matters, and
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
    // One phrase per number rather than a pluralising helper: a language
    // whose plural is not a suffix has to be able to translate the two
    // separately.
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

window.addEventListener('error', (event) => {
  showError(phrase('error.broke', { detail: event.message }));
});
window.addEventListener('unhandledrejection', (event) => {
  showError(phrase('error.broke', { detail: event.reason?.message ?? event.reason }));
});

updateModeNote();
updateEveryNote();
monitorNetwork();
registerServiceWorker();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
