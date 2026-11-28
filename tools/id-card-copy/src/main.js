/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { messageBox } from './shared/message-box.js';
import { readingLabel, wireFilePicker } from './shared/file-picker.js';
import { acceptsImageFile } from './shared/image-input.js';
import { WORKING_EDGE, findPageQuad } from './shared/document-detect.js';
import {
  clampPoint, copyQuad, reorderCorners, scaleQuad, wholeFrame,
} from './shared/document-geometry.js';
import { turnQuad, warpPage } from './shared/document-warp.js';
import { Corners } from './shared/corner-handles.js';
import {
  cardSize, captureDpi, layoutSheet, looksUpright, sheetDpi, toPixels, MM_PER_INCH,
} from './layout.js';
import { drawSheet, finishCard } from './card.js';
import { buildPdf } from './document.js';
import { setJpegDensity, withPngDensity } from './density.js';
import { makeExample } from './example.js';

const $ = (id) => document.getElementById(id);
const SIDES = ['front', 'back'];
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'avif'];

/**
 * How large each photograph is kept for the editor and the preview.
 *
 * Two photographs is not the twenty a scanner holds, but a phone's are twelve
 * to fifty megapixels each, and the editor needs only something to draw and
 * something for the corner finder to read. The file is decoded again at full
 * size when the copy is written.
 */
const EDIT_EDGE = 1200;

/** The long side of the sheet as it is drawn on screen at step 3. */
const PREVIEW_EDGE = 1100;

const HISTORY = 40;

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  example: $('example-button'),
  loadError: $('load-error'),
  swap: $('swap'),
  sidesBox: $('sides'),

  settings: $('settings'),
  cardSize: $('card-size'),
  paper: $('paper'),
  placeRow: $('place-row'),
  round: $('round'),
  outline: $('outline'),
  words: $('words'),
  ink: $('ink'),
  strength: $('strength'),
  strengthValue: $('strength-value'),
  wordsExtra: $('words-extra'),

  previewEmpty: $('preview-empty'),
  previewBox: $('preview-box'),
  preview: $('sheet-preview'),
  previewFacts: $('preview-facts'),
  oneSide: $('one-side'),

  saveCard: $('save-card'),
  saveSettings: $('save-settings'),
  dpi: $('dpi'),
  formatNote: $('format-note'),
  save: $('save'),
  busy: $('busy'),
  result: $('result'),
  resultFacts: $('result-facts'),
  download: $('download'),

  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
};

const ui = Object.fromEntries(SIDES.map((side) => [side, {
  panel: $(`${side}-panel`),
  empty: $(`${side}-empty`),
  editor: $(`${side}-editor`),
  stage: $(`${side}-stage`),
  photo: $(`${side}-photo`),
  note: $(`${side}-note`),
  quality: $(`${side}-quality`),
  detect: $(`${side}-detect`),
  whole: $(`${side}-whole`),
  left: $(`${side}-left`),
  right: $(`${side}-right`),
  undo: $(`${side}-undo`),
  remove: $(`${side}-remove`),
  input: $(`${side}-input`),
}]));

const { show: showError, clear: clearError } = messageBox(el.loadError);

/**
 * @typedef {object} Side
 * @property {File} file
 * @property {number} width   the photograph's own size
 * @property {number} height
 * @property {HTMLCanvasElement} preview  the photograph, at EDIT_EDGE
 * @property {ImageData} pixels           the same, read once for the preview warp
 * @property {number} scale               photograph pixels per preview pixel
 * @property {{x: number, y: number}[]} quad  in the photograph's own pixels
 * @property {boolean} found
 * @property {string} reason
 * @property {boolean} edited
 * @property {Array} history
 */

/** @type {{front: Side|null, back: Side|null}} */
const sides = { front: null, back: null };
/** A ticket per side, so a slow decode never lands on top of a newer choice. */
const tickets = { front: 0, back: 0 };
const pending = new Set();

let resultUrl = null;
let busy = false;
let revision = 0;
let previewToken = 0;
let previewTimer = 0;

const corners = Object.fromEntries(SIDES.map((side) => [side, new Corners(ui[side].stage, {
  onChange: (index, point) => moveCorner(side, index, point),
  onGestureStart: () => snapshot(side),
  cornerOf: (index) => sides[side]?.quad[index] ?? { x: 0, y: 0 },
  describe: (index) => describeCorner(side, index),
})]));

/* ----------------------------------------------------------- the photographs */

/**
 * Decode a file into a bitmap, the right way up.
 *
 * `imageOrientation: 'from-image'` is what makes a photograph taken with the
 * phone on its side arrive the way it was seen. The <img> fallback is for
 * older Safari builds where createImageBitmap refuses a blob.
 */
async function decode(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return { bitmap, width: bitmap.width, height: bitmap.height };
    } catch {
      // Fall through: some builds reject formats their <img> tag accepts.
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('undecodable'));
      element.src = url;
    });
    return { bitmap: image, width: image.naturalWidth, height: image.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Draw a decoded picture into a canvas no larger than `edge` on its long side. */
function shrinkTo(bitmap, width, height, edge) {
  const scale = edge > 0 ? Math.min(1, edge / Math.max(width, height)) : 1;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function clearCanvas(canvas) {
  canvas.width = 0;
  canvas.height = 0;
}

/**
 * Photographs dropped on the zone go to the empty sides first, front before
 * back, and then over the full ones in the same order. Two is the most that
 * can be used; a third is named rather than silently left out.
 */
function addFiles(files) {
  if (busy) return;
  clearError();
  const list = [...files];
  const accepted = list.filter((file) => acceptsImageFile(file, IMAGE_EXTENSIONS));
  const refused = list.filter((file) => !accepted.includes(file));

  const empty = SIDES.filter((side) => !sides[side] && !pending.has(side));
  const targets = [...empty, ...SIDES.filter((side) => !empty.includes(side))];
  accepted.slice(0, 2).forEach((file, index) => loadSide(targets[index], file));

  const notes = [];
  if (refused.length) notes.push(phrase('error.notphoto', { names: names(refused) }));
  if (accepted.length > 2) notes.push(phrase('error.extra', { names: names(accepted.slice(2)) }));
  if (notes.length) showError(notes.join(' '));
}

const names = (files) => files.slice(0, 3).map((file) => file.name).join(', ')
  + (files.length > 3 ? phrase('error.more', { count: files.length - 3 }) : '');

async function loadSide(side, file) {
  outputChanged();
  const ticket = ++tickets[side];
  pending.add(side);
  showReading();

  let decoded;
  try {
    decoded = await decode(file);
    if (ticket !== tickets[side]) return;
    const record = prepareSide(file, decoded);
    // Detection is synchronous; a real turn lets the busy label paint and
    // gives a newer choice for the same side the chance to win.
    await new Promise((resolve) => setTimeout(resolve, 0));
    if (ticket !== tickets[side]) {
      clearCanvas(record.preview);
      return;
    }
    if (sides[side]) clearCanvas(sides[side].preview);
    sides[side] = record;
  } catch {
    if (ticket === tickets[side]) {
      showError(phrase('error.decode', { name: file.name }));
    }
  } finally {
    decoded?.bitmap.close?.();
    if (ticket === tickets[side]) pending.delete(side);
    showReading();
    refresh();
    schedulePreview();
  }
}

function showReading() {
  if (pending.size) picker.busy(readingLabel(pending.size));
  else picker.done();
}

/** One side: the picture kept small, and the card found on it. */
function prepareSide(file, decoded) {
  const preview = shrinkTo(decoded.bitmap, decoded.width, decoded.height, EDIT_EDGE);
  const record = {
    file,
    width: decoded.width,
    height: decoded.height,
    preview,
    pixels: preview.getContext('2d', { willReadFrequently: true })
      .getImageData(0, 0, preview.width, preview.height),
    scale: decoded.width / preview.width,
    quad: wholeFrame(decoded.width, decoded.height),
    found: false,
    reason: 'detect.nothing',
    edited: false,
    history: [],
  };
  detect(record);
  return record;
}

/**
 * Find the card in one photograph.
 *
 * The corner finder was written for pages, and a card is the same problem
 * smaller: a rectangle with something different on each side of its edges.
 * It reads the picture at its own working size and the answer is scaled back
 * to the photograph's pixels. A card found standing on its end is turned so
 * that its long side runs across, because almost every card is printed that
 * way; the turn buttons are there for the ones that are not, and for a card
 * that came out upside down.
 */
function detect(record) {
  const working = shrinkTo(record.preview, record.preview.width, record.preview.height, WORKING_EDGE);
  try {
    const image = working.getContext('2d', { willReadFrequently: true })
      .getImageData(0, 0, working.width, working.height);
    const found = findPageQuad(image);
    const up = record.width / working.width;
    let quad = scaleQuad(found.quad, up).map((point) => clampPoint(point, record.width, record.height));
    if (looksUpright(quad)) quad = turnQuad(quad);
    record.quad = quad;
    record.found = found.found;
    record.reason = found.reason;
    record.edited = false;
    record.history = [];
  } finally {
    clearCanvas(working);
  }
}

/* ------------------------------------------------------------- the corners */

function snapshot(side) {
  if (busy) return;
  const record = sides[side];
  if (!record) return;
  record.history.push(copyQuad(record.quad));
  if (record.history.length > HISTORY) record.history.shift();
  ui[side].undo.disabled = false;
}

function moveCorner(side, index, point) {
  if (busy) return;
  const record = sides[side];
  if (!record) return;
  const quad = copyQuad(record.quad);
  quad[index] = clampPoint(point, record.width, record.height);
  outputChanged();
  // Re-ordered on every move, so that dragging a corner past its neighbour
  // swaps which corner it is rather than turning the card inside out - and
  // still led by the same corner, so a card that has been turned stays turned.
  record.quad = reorderCorners(quad);
  record.edited = true;
  drawCorners(side);
  schedulePreview();
}

function undo(side) {
  if (busy) return;
  const record = sides[side];
  const previous = record?.history.pop();
  if (!previous) return;
  outputChanged();
  record.quad = previous;
  refresh();
  schedulePreview();
}

function describeCorner(side, index) {
  const point = sides[side]?.quad[index] ?? { x: 0, y: 0 };
  return phrase(`corner.at.${side}`, {
    corner: phrase(['corner.tl', 'corner.tr', 'corner.br', 'corner.bl'][index]),
    x: Math.round(point.x),
    y: Math.round(point.y),
  });
}

/* --------------------------------------------------------------- the screen */

function refresh() {
  const any = SIDES.some((side) => sides[side]);
  for (const side of SIDES) renderSide(side);

  el.swap.disabled = busy || !any || pending.size > 0;
  el.previewEmpty.hidden = any;
  el.previewBox.hidden = !any;
  el.save.disabled = !any || busy || pending.size > 0;
  el.saveCard.inert = !any;

  const missing = SIDES.filter((side) => !sides[side]);
  el.oneSide.hidden = !any || missing.length !== 1;
  if (missing.length === 1) el.oneSide.textContent = phrase(`hint.no${missing[0]}`);
  if (!any) {
    retirePreview();
    clearCanvas(el.preview);
    el.previewFacts.replaceChildren();
  }
}

function renderSide(side) {
  const record = sides[side];
  const view = ui[side];
  view.empty.hidden = Boolean(record);
  view.editor.hidden = !record;
  view.panel.classList.toggle('filled', Boolean(record));
  if (!record) {
    clearCanvas(view.photo);
    corners[side].setSource(0, 0);
    view.note.textContent = '';
    view.quality.textContent = '';
    return;
  }

  // The stage takes the photograph's own shape and the canvas fills it, so
  // every corner over it is positioned in percentages and nothing has to be
  // worked out again when the window is resized or a phone is turned.
  view.stage.style.aspectRatio = `${record.width} / ${record.height}`;
  view.photo.width = record.preview.width;
  view.photo.height = record.preview.height;
  view.photo.getContext('2d').drawImage(record.preview, 0, 0);
  corners[side].setSource(record.width, record.height);
  drawCorners(side);
}

/** The outline, the grips and the lines under them: everything a drag changes. */
function drawCorners(side) {
  const record = sides[side];
  const view = ui[side];
  if (!record) return;
  corners[side].render(record.quad, { unsure: !record.found && !record.edited });
  view.note.textContent = record.edited ? phrase('detect.edited') : phrase(record.reason);
  view.note.className = `hint-line${record.found || record.edited ? '' : ' warn-line'}`;
  view.undo.disabled = !record.history.length;

  const size = cardSize(el.cardSize.value, looksUpright(record.quad));
  const quality = captureDpi(record.quad, size);
  view.quality.textContent = phrase(quality.key, { dpi: quality.dpi });
  view.quality.className = `hint-line${quality.key === 'quality.low' ? ' warn-line' : ''}`;
}

/* --------------------------------------------------------- the settings */

function radio(name) {
  return el.settings.querySelector(`input[name="${name}"]:checked`)?.value
    ?? el.saveSettings.querySelector(`input[name="${name}"]:checked`)?.value;
}

function settings() {
  return {
    card: el.cardSize.value,
    paper: el.paper.value,
    arrange: radio('arrange') ?? 'stack',
    place: radio('place') ?? 'middle',
    grey: radio('colour') === 'grey',
    round: el.round.checked,
    outline: el.outline.checked,
    text: el.words.value,
    ink: el.ink.value,
    strength: Number(el.strength.value) / 100,
    format: radio('format') ?? 'pdf',
    dpi: Number(el.dpi.value),
  };
}

function showSettingNotes() {
  const options = settings();
  el.placeRow.hidden = options.paper === 'cards';
  el.strengthValue.textContent = `${el.strength.value}%`;
  el.wordsExtra.hidden = !options.text.trim();
  el.formatNote.textContent = phrase(`format.${options.format}`);
}

/**
 * The sheet for the sides that are here, and which side each rectangle is.
 *
 * A side's shape follows its corners: one that has been turned onto its end
 * is an upright card, and gets an upright rectangle.
 */
function planFor(options) {
  const present = SIDES.filter((side) => sides[side]);
  const sizes = present.map((side) => cardSize(options.card, looksUpright(sides[side].quad)));
  return { present, sheet: layoutSheet(sizes, options) };
}

/* ---------------------------------------------------------- the preview */

function retirePreview() {
  previewToken += 1;
  window.clearTimeout(previewTimer);
}

function schedulePreview() {
  retirePreview();
  if (SIDES.some((side) => sides[side])) previewTimer = window.setTimeout(renderPreview, 120);
}

/**
 * The sheet, at screen size, made by the functions that make the file.
 *
 * Each side is straightened out of the copy kept for the editor rather than out
 * of the photograph, which is enough for a picture this size and keeps a drag
 * responsive. Everything after the straightening - the grey, the words, the
 * corners, the layout - is the same call the download makes.
 */
async function renderPreview() {
  const token = previewToken + 1;
  previewToken = token;
  await new Promise((resolve) => setTimeout(resolve, 0));
  if (previewToken !== token) return;

  const options = settings();
  const { present, sheet } = planFor(options);
  if (!present.length) return;

  try {
    const dpi = Math.min(options.dpi, PREVIEW_EDGE / (Math.max(sheet.width, sheet.height) / MM_PER_INCH));
    const cards = present.map((side, index) => {
      const record = sides[side];
      const rect = sheet.rects[index];
      const flat = warpPage(record.pixels, scaleQuad(record.quad, 1 / record.scale), {
        width: toPixels(rect.width, dpi), height: toPixels(rect.height, dpi),
      });
      return finishCard(flat, { ...options, pxPerMm: dpi / MM_PER_INCH });
    });
    if (previewToken !== token) return;

    const drawn = drawSheet(sheet, cards, dpi);
    el.preview.width = drawn.width;
    el.preview.height = drawn.height;
    el.preview.getContext('2d').drawImage(drawn, 0, 0);
    clearCanvas(drawn);
    for (const card of cards) clearCanvas(card);
    describeSheet(sheet, present, options);
  } catch (error) {
    if (previewToken === token) showError(phrase('error.failed', { detail: detail(error) }));
  }
}

const mm = (value) => (Math.round(value * 100) / 100).toLocaleString(document.documentElement.lang || undefined);

function describeSheet(sheet, present, options) {
  const lines = [];
  if (options.paper === 'cards') {
    lines.push(phrase('sheet.cards', { width: mm(sheet.width), height: mm(sheet.height) }));
  } else {
    lines.push(phrase(sheet.landscape ? 'sheet.landscape' : 'sheet.portrait', {
      paper: phrase(`paper.${options.paper}`),
    }));
  }
  const first = sheet.rects[0];
  lines.push(phrase('sheet.size', { width: mm(first.width), height: mm(first.height) }));
  el.previewFacts.replaceChildren(...lines.map((line) => {
    const item = document.createElement('li');
    item.textContent = line;
    return item;
  }));
}

/* ---------------------------------------------------------------- the file */

/**
 * One side, straightened at the size it is going to be saved at.
 *
 * The photograph is decoded again here, and shrunk first whenever the card is
 * being made smaller than it appears in it - that shrink is the browser's own
 * filtered downscale, and it means the resample never has to read more than
 * one sample per output pixel.
 */
async function straightenSide(record, size, options, pxPerMm) {
  const decoded = await decode(record.file);
  let canvas;
  try {
    const quad = record.quad;
    const longest = Math.max(
      Math.hypot(quad[1].x - quad[0].x, quad[1].y - quad[0].y),
      Math.hypot(quad[2].x - quad[3].x, quad[2].y - quad[3].y),
      Math.hypot(quad[3].x - quad[0].x, quad[3].y - quad[0].y),
      Math.hypot(quad[2].x - quad[1].x, quad[2].y - quad[1].y),
    );
    // A tenth over, so the resample is never the thing that softens the card.
    const factor = Math.min(1, (Math.max(size.width, size.height) * 1.1) / Math.max(1, longest));
    canvas = shrinkTo(decoded.bitmap, record.width, record.height,
      Math.max(record.width, record.height) * factor);
    const source = canvas.getContext('2d', { willReadFrequently: true })
      .getImageData(0, 0, canvas.width, canvas.height);
    const applied = canvas.width / record.width;
    clearCanvas(canvas);
    const flat = warpPage(source, scaleQuad(quad, applied), size);
    return finishCard(flat, { ...options, pxPerMm });
  } finally {
    if (canvas) clearCanvas(canvas);
    decoded.bitmap.close?.();
  }
}

function toBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('encode.failed'))), type, quality);
  });
}

async function writeFile(options) {
  const { present, sheet } = planFor(options);
  if (!present.length) throw new Error('error.none');

  if (options.format === 'pdf') {
    const dpi = options.dpi;
    const images = [];
    for (const [index, side] of present.entries()) {
      el.busy.textContent = phrase('busy.side', { done: index + 1, total: present.length });
      const rect = sheet.rects[index];
      const size = { width: toPixels(rect.width, dpi), height: toPixels(rect.height, dpi) };
      const card = await straightenSide(sides[side], size, options, dpi / MM_PER_INCH);
      const blob = await toBlob(card, 'image/jpeg', 0.92);
      clearCanvas(card);
      images.push({ data: new Uint8Array(await blob.arrayBuffer()), width: size.width, height: size.height });
    }
    el.busy.textContent = phrase('busy.writing');
    return { blob: buildPdf(sheet, images), sheet, dpi, extension: 'pdf' };
  }

  // An image of the whole sheet, at the most the browser will draw.
  const dpi = sheetDpi(sheet, options.dpi);
  const cards = [];
  for (const [index, side] of present.entries()) {
    el.busy.textContent = phrase('busy.side', { done: index + 1, total: present.length });
    const rect = sheet.rects[index];
    const size = { width: toPixels(rect.width, dpi), height: toPixels(rect.height, dpi) };
    cards.push(await straightenSide(sides[side], size, options, dpi / MM_PER_INCH));
  }
  el.busy.textContent = phrase('busy.writing');
  const drawn = drawSheet(sheet, cards, dpi);
  for (const card of cards) clearCanvas(card);
  const type = options.format === 'png' ? 'image/png' : 'image/jpeg';
  const encoded = await toBlob(drawn, type, 0.92);
  clearCanvas(drawn);
  if (encoded.type !== type) throw new Error('encode.failed');
  let bytes = new Uint8Array(await encoded.arrayBuffer());
  if (type === 'image/png') bytes = withPngDensity(bytes, dpi);
  else setJpegDensity(bytes, dpi);
  return {
    blob: new Blob([bytes], { type }), sheet, dpi,
    capped: dpi < options.dpi, extension: options.format === 'png' ? 'png' : 'jpg',
    pixels: { width: Math.round((sheet.width / MM_PER_INCH) * dpi), height: Math.round((sheet.height / MM_PER_INCH) * dpi) },
  };
}

async function save() {
  if (busy || pending.size || !SIDES.some((side) => sides[side])) return;
  const options = Object.freeze(settings());
  const started = revision;
  clearResult();
  clearError();
  setBusy(true);
  el.busy.hidden = false;
  try {
    const made = await writeFile(options);
    if (started === revision) show(made, options);
  } catch (error) {
    if (started === revision) showError(phrase('error.failed', { detail: detail(error) }));
  } finally {
    setBusy(false);
    el.busy.hidden = true;
    refresh();
  }
}

function detail(error) {
  const message = String(error?.message ?? error ?? '');
  // Every error this page throws itself is a phrase key; anything else is the
  // browser's own words, which are better passed on than hidden.
  return /^[a-z]+(\.[a-z]+)+$/.test(message) ? phrase(message) : message;
}

function show(made, options) {
  if (resultUrl) URL.revokeObjectURL(resultUrl);
  resultUrl = URL.createObjectURL(made.blob);
  const name = `id-card-copy.${made.extension}`;
  el.download.href = resultUrl;
  el.download.download = name;
  el.download.onclick = () => globalThis.aboxToolComplete?.();

  const first = made.sheet.rects[0];
  const facts = [phrase('result.file', { name, size: sizeText(made.blob.size) })];
  if (options.paper === 'cards') {
    facts.push(phrase('result.cards', { width: mm(first.width), height: mm(first.height) }));
  } else {
    facts.push(phrase('result.paper', {
      paper: phrase(`paper.${options.paper}`), width: mm(first.width), height: mm(first.height),
    }));
  }
  if (made.extension === 'pdf') {
    facts.push(phrase('result.pdf', { dpi: made.dpi }), phrase('result.clean'));
  } else {
    facts.push(phrase('result.image', {
      width: made.pixels.width, height: made.pixels.height, dpi: made.dpi,
    }));
    if (made.capped) facts.push(phrase('result.capped', { dpi: made.dpi }));
  }
  el.resultFacts.replaceChildren(...facts.map((line) => {
    const item = document.createElement('li');
    item.textContent = line;
    return item;
  }));
  el.result.hidden = false;
}

function sizeText(bytes) {
  if (bytes < 1024 * 1024) return phrase('size.kb', { n: Math.max(1, Math.round(bytes / 1024)) });
  return phrase('size.mb', { n: (bytes / (1024 * 1024)).toFixed(1) });
}

function clearResult() {
  if (resultUrl) URL.revokeObjectURL(resultUrl);
  resultUrl = null;
  el.result.hidden = true;
  el.resultFacts.replaceChildren();
  el.download.removeAttribute('href');
  el.download.removeAttribute('download');
}

/** Anything that changes the copy takes away the file made from the old one. */
function outputChanged() {
  revision += 1;
  clearResult();
}

function setBusy(active) {
  busy = active;
  for (const area of [el.dropzone, el.sidesBox, el.settings, el.saveSettings]) area.inert = active;
  el.fileInput.disabled = active;
  if (el.example) el.example.inert = active;
  el.save.disabled = active;
}

/* --------------------------------------------------------------- the wiring */

const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles: (files) => addFiles(files),
  example: makeExample,
});

for (const side of SIDES) {
  const view = ui[side];
  view.input.addEventListener('change', () => {
    const [file] = view.input.files ?? [];
    view.input.value = '';
    if (!file || busy) return;
    clearError();
    if (!acceptsImageFile(file, IMAGE_EXTENSIONS)) {
      showError(phrase('error.notphoto', { names: file.name }));
      return;
    }
    loadSide(side, file);
  });

  view.detect.addEventListener('click', () => {
    const record = sides[side];
    if (busy || !record) return;
    outputChanged();
    detect(record);
    refresh();
    schedulePreview();
  });

  view.whole.addEventListener('click', () => {
    const record = sides[side];
    if (busy || !record) return;
    snapshot(side);
    outputChanged();
    let quad = wholeFrame(record.width, record.height);
    if (looksUpright(quad)) quad = turnQuad(quad);
    record.quad = quad;
    record.edited = true;
    refresh();
    schedulePreview();
  });

  // A quarter turn moves no corner: it changes which of the four is the top
  // left, and the card's shape on the sheet follows.
  const turn = (times) => {
    const record = sides[side];
    if (busy || !record) return;
    snapshot(side);
    outputChanged();
    for (let i = 0; i < times; i += 1) record.quad = turnQuad(record.quad);
    refresh();
    schedulePreview();
  };
  view.right.addEventListener('click', () => turn(1));
  view.left.addEventListener('click', () => turn(3));
  view.undo.addEventListener('click', () => undo(side));

  view.remove.addEventListener('click', () => {
    if (busy) return;
    tickets[side] += 1;
    pending.delete(side);
    showReading();
    outputChanged();
    if (sides[side]) clearCanvas(sides[side].preview);
    sides[side] = null;
    refresh();
    schedulePreview();
  });
}

el.swap.addEventListener('click', () => {
  if (busy || pending.size) return;
  outputChanged();
  [sides.front, sides.back] = [sides.back, sides.front];
  refresh();
  schedulePreview();
});

for (const [input, event] of [
  [el.cardSize, 'change'], [el.paper, 'change'], [el.round, 'change'], [el.outline, 'change'],
  [el.words, 'input'], [el.ink, 'change'], [el.strength, 'input'],
]) {
  input.addEventListener(event, () => {
    outputChanged();
    showSettingNotes();
    if (input === el.cardSize) refresh();
    schedulePreview();
  });
}
el.settings.addEventListener('change', (event) => {
  if (event.target.type !== 'radio') return;
  outputChanged();
  showSettingNotes();
  schedulePreview();
});
el.saveSettings.addEventListener('change', () => {
  outputChanged();
  showSettingNotes();
});
el.save.addEventListener('click', save);

el.privacyToggle.addEventListener('click', () => {
  const open = el.privacyPanel.hidden;
  el.privacyPanel.hidden = !open;
  el.privacyToggle.setAttribute('aria-expanded', String(open));
});

/* -------------------------------------------------------------------- boot */

/**
 * Letter where Letter is the paper in the tray.
 *
 * Read from the region in the browser's own language setting and nothing
 * else, and only as the starting choice - it is a select, and the visitor's
 * own choice is never overridden.
 */
const region = (navigator.language || '').split('-')[1]?.toUpperCase();
if (['US', 'CA', 'MX', 'PH'].includes(region)) el.paper.value = 'letter';

window.addEventListener('error', (event) => {
  showError(phrase('error.broke', { detail: event.message }));
});
window.addEventListener('unhandledrejection', (event) => {
  showError(phrase('error.broke', { detail: event.reason?.message ?? event.reason }));
});

showSettingNotes();
refresh();

document.getElementById('boot-warning')?.remove();
