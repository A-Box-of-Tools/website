/** UI wiring and application state. */

import { phrase, ltr } from './shared/phrases.js';
import { messageBox } from './shared/message-box.js';
import { wireFilePicker } from './shared/file-picker.js';
import { decodeGif, playedDelay, totalDuration } from './shared/gif-decode.js';
import { GifCanvas, flatten, parseColour, patchPixels } from './shared/gif-compose.js';
import {
  canvasPng, disposalLabel, encodePng, formatBytes, formatSeconds,
  baseName, frameName, thumbnail, timingList, zipName,
} from './frames.js';
import { makeZip } from './shared/zip.js';
import { cellAt, sheetName, sheetPlan } from './sheet.js';
import { makeExample } from './example.js';
import { throwIfAborted } from './shared/errors.js';
import { WORKING_LIMIT, PATCH_PIXEL_LIMIT, gifWorkingBase, gifWorkingPlan, withWorkingBytes, headerWorkingPlan, requireWorking, requireZipEntries } from './working.js';

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
  progress: $('progress'),
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
};

const { show: showError, clear: clearError } = messageBox(el.error);

/** @type {File|null} */
let file = null;
/** What decodeGif() made of it. */
let gif = null;
/** One row per frame: the frame, its name, its thumbnail and whether it is picked. */
let rows = [];
/** Native reads/PNG callbacks may return late; each operation owns its publication. */
let loadOwner = null;
let renderOwner = null;
let job = null;
let progressOwner = null;
let previewPlan = null;
let thumbnailBytes = 0;
let thumbnailRgbaBytes = 0;
const previewKey = () => { const { stored, colour } = settings(); return JSON.stringify({ stored, colour }); };
const previewNeeded = () => rows.some(row => !row.thumbUrl) || previewPlan !== previewKey();
const phraseKeys = new Set([$('phrases'), $('frame-phrases')]
  .flatMap(bucket => [...(bucket?.querySelectorAll('[data-phrase]') ?? [])])
  .map(node => node.dataset.phrase));
const reason = (error, fallback) => phraseKeys.has(error?.message)
  ? phrase(error.message, error.values) : phrase(fallback);
const turn = () => new Promise(resolve => { setTimeout(resolve, 0); });
const owns = task => task && !task.controller.signal.aborted
  && (task === loadOwner || task === renderOwner || task === job);

function retireRender() {
  const previous = renderOwner;
  renderOwner = null;
  previous?.controller.abort();
  hideProgress(previous);
}

function retireJob({ redraw = false } = {}) {
  const previous = job;
  job = null;
  previous?.controller.abort();
  hideProgress(previous);
  syncControls();
  if (redraw && gif && !loadOwner && previewNeeded()) draw();
}

function thumbnailStorage() {
  return { thumbnailBytes, thumbnailRgbaBytes };
}

function syncControls() {
  const unavailable = !gif || !!loadOwner || !!job;
  const picked = rows.filter(row => row.checked).length;
  el.downloadAll.disabled = unavailable;
  el.downloadSelected.disabled = unavailable || picked === 0;
  el.downloadSheet.disabled = unavailable || picked === 0;
  el.cancel.hidden = !job;
  for (const row of rows) row.save.disabled = unavailable;
}

function beginJob(kind, wanted, extra = {}) {
  retireRender();
  const task = { controller: new AbortController(), kind, gif, name: file.name,
    rows: rows.map(({ index, frame, played, name }) => ({ index, frame, played, name })),
    picked: new Set(wanted.map(row => row.index)), options: settings(),
    storage: thumbnailStorage(), ...extra };
  job = task;
  syncControls();
  clearError();
  progress(task, 0, wanted.length, phrase(kind === 'sheet'
    ? (task.options.stored ? 'sheet.stored' : 'sheet.drawing') : 'step.writing',
  { done: 0, total: wanted.length }));
  return task;
}

function finishJob(task) {
  if (job !== task) return;
  job = null;
  hideProgress(task);
  syncControls();
  if (gif && previewNeeded()) draw();
}

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
  example: makeExample,
});

/* ----------------------------------------------------------------- loading */

async function loadFile(picked) {
  reset();
  const task = { controller: new AbortController() };
  loadOwner = task;
  syncControls();
  clearError();
  picker.busy(phrase('read.reading'));
  try {
    if (picked.size > WORKING_LIMIT) throw new Error('gif.workinglimit');
    let bytes = new Uint8Array(await picked.arrayBuffer());
    if (!owns(task)) return;
    requireWorking(headerWorkingPlan(bytes));
    const decoded = decodeGif(bytes, { maxPixels: PATCH_PIXEL_LIMIT, strictMaxPixels: true });
    requireWorking(gifWorkingPlan(decoded, settings()));
    bytes = null;
    if (!owns(task)) return;
    file = picked;
    gif = decoded;
    picker.arrived();
    describe();
    build();
    loadOwner = null;
    picker.done();
    syncControls();
    await draw();
  } catch (error) {
    if (!owns(task)) return;
    showError(phrase('read.failed', { why: reason(error, 'read.unreadable') }));
    picker.waiting();
  } finally {
    if (loadOwner === task) {
      loadOwner = null;
      picker.done();
      syncControls();
    }
  }
}

/** Fill in what the file turned out to be. */
function describe() {
  const partial = gif.frames.filter((frame) => frame.partial).length;
  const local = gif.frames.filter((frame) => frame.hasLocalPalette).length;

  el.srcName.textContent = file.name;
  el.srcSize.textContent = formatBytes(file.size, phrase);
  el.srcPicture.textContent = ltr(`${gif.width} x ${gif.height}`);
  el.srcFrames.textContent = String(gif.frames.length);
  el.srcDuration.textContent = formatSeconds(totalDuration(gif.frames), phrase);
  el.srcLoop.textContent = loopLabel(gif.loopCount);
  el.source.hidden = false;

  const notes = [];
  if (gif.truncated) notes.push(phrase(gif.truncated.key, gif.truncated.values));
  if (partial) {
    notes.push(phrase(partial === 1 ? 'note.partial.one' : 'note.partial.many',
      { n: partial }));
  }
  if (local) notes.push(phrase('note.local', { n: local }));
  if (gif.comment) notes.push(phrase('note.comment', { comment: gif.comment.slice(0, 120) }));

  // The separator is a phrase too: ja and zh do not put a space after a full
  // stop, and one hard-coded here is one every language gets.
  el.notice.textContent = notes.length
    ? notes.reduce((a, b) => phrase('join.sentences', { a, b }))
    : '';
  el.notice.hidden = notes.length === 0;
}

function loopLabel(loop) {
  if (loop === null) return phrase('loop.once');
  if (loop === 0) return phrase('loop.forever');
  return phrase(loop === 1 ? 'loop.times.one' : 'loop.times.many', { n: loop });
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
    thumbBytes: 0,
    thumbRgbaBytes: 0,
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
    retireJob({ redraw: true });
    row.checked = box.checked;
    item.classList.toggle('unpicked', !box.checked);
    countFrames();
  });
  label.append(box, document.createTextNode(phrase('frame.number', { n: row.index + 1 })));

  const image = document.createElement('img');
  image.alt = phrase('frame.number', { n: row.index + 1 });
  image.loading = 'lazy';

  const meta = document.createElement('p');
  meta.className = 'frame-meta';

  const save = document.createElement('button');
  save.type = 'button';
  save.className = 'ghost';
  save.textContent = phrase('frame.download');
  save.addEventListener('click', () => downloadOne(row));

  const body = document.createElement('div');
  body.className = 'frame-body';
  body.append(label, meta, save);

  item.append(image, body);

  row.node = item;
  row.image = image;
  row.meta = meta;
  row.box = box;
  row.save = save;
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
  if (!gif || job) return;
  retireRender();
  // A partial new pass has replaced some pictures, so no completed plan survives it.
  previewPlan = null;
  const task = { controller: new AbortController(), gif, rows: [...rows], options: settings() };
  renderOwner = task;
  const { stored, colour } = task.options;
  let canvas = null;
  try {
    task.budget = gifWorkingBase(task.gif, task.options);
    requireWorking(withWorkingBytes(task.budget, thumbnailStorage()));
    canvas = stored ? null : new GifCanvas(task.gif);
    progress(task, 0, task.rows.length, phrase('step.drawing'));
    for (const row of task.rows) {
      throwIfAborted(task.controller.signal);
      let pixels, width, height;
      if (stored) {
        pixels = patchPixels(row.frame);
        width = row.frame.width; height = row.frame.height;
      } else {
        pixels = canvas.next().pixels.slice();
        width = task.gif.width; height = task.gif.height;
      }
      if (colour) flatten(pixels, colour);
      const thumb = await thumbnail(pixels, width, height, { signal: task.controller.signal });
      if (!owns(task)) { URL.revokeObjectURL(thumb.url); return; }
      try {
        requireWorking(withWorkingBytes(task.budget, { ...thumbnailStorage(), incomingBytes: thumb.bytes }));
      } catch (error) { URL.revokeObjectURL(thumb.url); throw error; }
      if (row.thumbUrl) URL.revokeObjectURL(row.thumbUrl);
      row.thumbUrl = thumb.url;
      const rgbaBytes = thumb.width * thumb.height * 4;
      thumbnailBytes += thumb.bytes - row.thumbBytes;
      thumbnailRgbaBytes += rgbaBytes - row.thumbRgbaBytes;
      row.thumbBytes = thumb.bytes;
      row.thumbRgbaBytes = rgbaBytes;
      row.image.src = thumb.url;
      row.meta.textContent = describeFrame(row, stored);
      progress(task, row.index + 1, task.rows.length, phrase('step.drawing'));
      await turn();
    }
    if (owns(task)) previewPlan = JSON.stringify({ stored, colour });
  } catch (error) {
    if (owns(task)) showError(phrase('read.failed', { why: reason(error, 'png.nopreview') }));
  } finally {
    if (canvas) { canvas.pixels = null; canvas.saved = null; }
    if (renderOwner === task) {
      renderOwner = null;
      hideProgress(task);
      countFrames();
    }
  }
}

function describeFrame(row, stored) {
  const { frame } = row;
  // The clamp note is part of the sentence rather than a suffix bolted on:
  // phrase() trims, so a phrase that is only a tail loses the space in front.
  const delay = frame.delay < 2
    ? phrase('meta.clamped', {
      played: formatSeconds(row.played, phrase), stored: (frame.delay / 100).toFixed(2),
    })
    : formatSeconds(row.played, phrase);

  if (!stored) {
    return phrase('meta.whole', { delay, width: gif.width, height: gif.height });
  }
  return phrase('meta.patch', {
    delay,
    width: frame.width,
    height: frame.height,
    x: frame.x,
    y: frame.y,
    disposal: disposalLabel(frame.disposal, phrase),
  });
}

function countFrames() {
  const picked = rows.filter((row) => row.checked).length;
  el.framesCount.textContent = phrase(rows.length === 1 ? 'frames.count.one' : 'frames.count.many',
    { n: rows.length, picked });
  el.downloadSelected.hidden = picked === rows.length || picked === 0;
  syncControls();
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
function pixelsFor(input, index, { stored, colour }) {
  const frame = input.frames[index];
  if (stored) {
    const pixels = patchPixels(frame);
    if (colour) flatten(pixels, colour);
    return { pixels, width: frame.width, height: frame.height };
  }
  const canvas = new GifCanvas(input);
  try {
    let step;
    for (let at = 0; at <= index; at += 1) step = canvas.next();
    const pixels = step.pixels.slice();
    if (colour) flatten(pixels, colour);
    return { pixels, width: input.width, height: input.height };
  } finally { canvas.pixels = null; canvas.saved = null; }
}

async function downloadOne(row) {
  if (job || loadOwner || !gif) return;
  const task = beginJob('frame', [row]);
  try {
    task.budget = gifWorkingBase(task.gif, task.options);
    requireWorking(withWorkingBytes(task.budget, task.storage));
    const { pixels, width, height } = pixelsFor(task.gif, row.index, task.options);
    const blob = await encodePng(pixels, width, height, { signal: task.controller.signal });
    if (!owns(task)) return;
    requireWorking(withWorkingBytes(task.budget, { ...task.storage, incomingBytes: blob.size }));
    save(blob, task.rows[row.index].name);
  } catch (error) {
    if (owns(task)) showError(phrase('save.frame.failed', { why: reason(error, 'save.unfinished') }));
  } finally { finishJob(task); }
}

/** A sheet replays every dependency, while selection controls only the emitted cells. */
async function downloadSheet() {
  if (job || loadOwner || !gif) return;
  const wanted = rows.filter(row => row.checked);
  if (!wanted.length) return;
  const plan = sheetPlan(wanted.length, gif.width, gif.height, 0);
  if (plan.tooBig) {
    showError(phrase('sheet.toobig', { width: plan.width, height: plan.height }));
    return;
  }
  const task = beginJob('sheet', wanted, { plan });
  let sheet = null, canvas = null;
  try {
    task.budget = gifWorkingBase(task.gif, { sheet: plan });
    requireWorking(withWorkingBytes(task.budget, task.storage));
    sheet = document.createElement('canvas');
    sheet.width = plan.width; sheet.height = plan.height;
    const context = sheet.getContext('2d');
    canvas = new GifCanvas(task.gif);
    let done = 0;
    for (const row of task.rows) {
      throwIfAborted(task.controller.signal);
      const step = canvas.next();
      if (task.picked.has(row.index)) {
        const pixels = step.pixels.slice();
        if (task.options.colour) flatten(pixels, task.options.colour);
        const { x, y } = cellAt(done, plan, task.gif.width, task.gif.height);
        context.putImageData(new ImageData(pixels, task.gif.width, task.gif.height), x, y);
        done += 1;
        progress(task, done, wanted.length, phrase(task.options.stored ? 'sheet.stored' : 'sheet.drawing'));
      }
      // Unselected patches still do work, and must return browser turns too.
      await turn();
    }
    throwIfAborted(task.controller.signal);
    const blob = await canvasPng(sheet, task.controller.signal);
    if (!owns(task)) return;
    requireWorking(withWorkingBytes(task.budget, { ...task.storage, incomingBytes: blob.size }));
    save(blob, sheetName(baseName(task.name), plan));
  } catch (error) {
    if (owns(task)) showError(phrase('save.sheet.failed', { why: reason(error, 'save.unfinished') }));
  } finally {
    if (sheet) sheet.width = sheet.height = 0;
    if (canvas) { canvas.pixels = null; canvas.saved = null; }
    finishJob(task);
  }
}

async function downloadZip(wanted) {
  if (job || loadOwner || !gif || !wanted.length) return;
  const task = beginJob('zip', wanted);
  const files = [], written = [];
  let canvas = null, archiveBytes = 0;
  try {
    requireZipEntries(wanted.length, task.options.timing);
    task.budget = gifWorkingBase(task.gif, task.options);
    requireWorking(withWorkingBytes(task.budget, task.storage));
    canvas = task.options.stored ? null : new GifCanvas(task.gif);
    let done = 0;
    for (const row of task.rows) {
      throwIfAborted(task.controller.signal);
      let pixels, width = task.gif.width, height = task.gif.height;
      if (task.options.stored) {
        if (!task.picked.has(row.index)) continue;
        pixels = patchPixels(row.frame); width = row.frame.width; height = row.frame.height;
      } else {
        const step = canvas.next();
        if (!task.picked.has(row.index)) { await turn(); continue; }
        pixels = step.pixels.slice();
      }
      if (task.options.colour) flatten(pixels, task.options.colour);
      const blob = await encodePng(pixels, width, height, { signal: task.controller.signal });
      if (!owns(task)) return;
      requireWorking(withWorkingBytes(task.budget, { ...task.storage, archiveBytes, incomingBytes: blob.size }));
      const data = new Uint8Array(await blob.arrayBuffer());
      if (!owns(task)) return;
      archiveBytes += data.byteLength;
      files.push({ name: row.name, data }); written.push(row);
      done += 1;
      progress(task, done, wanted.length, phrase('step.writing', { done, total: wanted.length }));
      await turn();
    }
    throwIfAborted(task.controller.signal);
    if (task.options.timing) {
      const data = new TextEncoder().encode(timingList(task.name, task.gif, written, phrase));
      requireWorking(withWorkingBytes(task.budget, { ...task.storage, archiveBytes, incomingBytes: data.byteLength }));
      archiveBytes += data.byteLength;
      files.push({ name: 'frames.txt', data });
    }
    requireWorking(withWorkingBytes(task.budget, { ...task.storage, archiveBytes }));
    save(makeZip(files), zipName(task.name));
  } catch (error) {
    if (owns(task)) showError(phrase('save.frames.failed', { why: reason(error, 'save.unfinished') }));
  } finally {
    files.length = 0; written.length = 0;
    if (canvas) { canvas.pixels = null; canvas.saved = null; }
    finishJob(task);
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

function progress(owner, done, total, label) {
  if (!owns(owner)) return;
  progressOwner = owner;
  el.progress.hidden = false;
  el.progressBar.style.width = `${total ? (done / total) * 100 : 0}%`;
  el.progressLabel.textContent = label;
}

function hideProgress(owner) {
  if (owner !== progressOwner) return;
  progressOwner = null;
  el.progress.hidden = true;
  el.progressBar.style.width = '0%';
  el.progressLabel.textContent = '';
}

/** Let go of everything the last file left behind. */
function reset() {
  loadOwner?.controller.abort();
  loadOwner = null;
  retireRender();
  retireJob();
  for (const row of rows) {
    if (row.thumbUrl) URL.revokeObjectURL(row.thumbUrl);
  }
  rows = [];
  gif = null;
  file = null;
  previewPlan = null;
  thumbnailBytes = 0;
  thumbnailRgbaBytes = 0;
  el.frames.replaceChildren();
  el.source.hidden = true;
  el.notice.hidden = true;
  el.framesCount.textContent = '';
  picker.waiting();
  picker.done();
  syncControls();
}

function updateModeNote() {
  el.modeNote.textContent = phrase(el.mode.value === 'stored' ? 'mode.stored' : 'mode.whole');
}

/**
 * "frame", "second frame", "7th frame".
 *
 * One whole phrase per case rather than an ordinal dropped into a slot: an
 * ordinal is a suffix in English, a separate word in some languages and an
 * agreement with the noun in others.
 */
function updateEveryNote() {
  const { every } = settings();
  const key = every === 1 ? 'every.one'
    : every === 2 ? 'every.two'
      : every === 3 ? 'every.three' : 'every.many';
  el.everyNote.textContent = phrase(key, { n: every });
}

/* --------------------------------------------------------------- listeners */

el.mode.addEventListener('change', () => {
  retireJob();
  updateModeNote();
  if (gif) draw();
});

el.background.addEventListener('change', () => {
  retireJob();
  el.colourRow.hidden = el.background.value !== 'flatten';
  if (gif) draw();
});

let colourTimer = null;
el.colour.addEventListener('input', () => {
  retireJob();
  clearTimeout(colourTimer);
  colourTimer = setTimeout(() => { if (gif) draw(); }, 150);
});

el.every.addEventListener('change', () => {
  retireJob({ redraw: true });
  updateEveryNote();
  if (gif) applyEvery();
});

el.timing.addEventListener('change', () => retireJob({ redraw: true }));
el.selectAll.addEventListener('click', () => { retireJob({ redraw: true }); pick(true); });
el.selectNone.addEventListener('click', () => { retireJob({ redraw: true }); pick(false); });
el.clear.addEventListener('click', () => { reset(); clearError(); el.fileInput.focus(); });

el.downloadAll.addEventListener('click', () => downloadZip(rows));
el.downloadSelected.addEventListener('click', () => downloadZip(rows.filter((row) => row.checked)));
el.downloadSheet.addEventListener('click', () => downloadSheet());
el.cancel.addEventListener('click', () => retireJob({ redraw: true }));

window.addEventListener('beforeunload', (event) => {
  if (!job) return;
  event.preventDefault();
  event.returnValue = ''; // still required by some browsers to trigger the prompt
});

/* ------------------------------------------------- privacy panel + offline */

el.privacyToggle.addEventListener('click', () => {
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

updateModeNote();
updateEveryNote();
syncControls();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
