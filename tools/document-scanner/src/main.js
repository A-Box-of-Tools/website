/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { messageBox } from './shared/message-box.js';
import { readingLabel, wireFilePicker } from './shared/file-picker.js';
import { makeZip } from './shared/zip.js';
import { WORKING_EDGE, findPageQuad } from './detect.js';
import {
  clampPoint, copyQuad, orderCorners, outputSize, pageAspect, scaleQuad, wholeFrame,
} from './geometry.js';
import { turnQuad, warpPage } from './warp.js';
import { cleanPage } from './clean.js';
import { encodeImage, encodePage } from './encode.js';
import { buildDocument } from './document.js';
import {
  coverage, matchPaper, outName, pageName, ratioText, scanQuality, sizeText, stemOf,
} from './pages.js';
import { Corners } from './stage.js';

const $ = (id) => document.getElementById(id);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  loadError: $('load-error'),
  stripToolbar: $('strip-toolbar'),
  countLabel: $('count-label'),
  detectAll: $('detect-all'),
  clearAll: $('clear-all'),
  strip: $('page-strip'),

  editEmpty: $('edit-empty'),
  editControls: $('edit-controls'),
  stage: $('stage'),
  photo: $('photo'),
  detectNote: $('detect-note'),
  detectOne: $('detect-one'),
  wholePhoto: $('whole-photo'),
  turnLeft: $('turn-left'),
  turnRight: $('turn-right'),
  undo: $('undo'),

  cleanEmpty: $('clean-empty'),
  cleanControls: $('clean-controls'),
  scanPreview: $('scan-preview'),
  scanBusy: $('scan-busy'),
  scanFacts: $('scan-facts'),
  modeGroup: $('mode-group'),
  strengthRow: $('strength-row'),
  strength: $('strength'),
  strengthValue: $('strength-value'),
  strengthNote: $('strength-note'),

  pageSize: $('page-size'),
  sizeNote: $('size-note'),
  dpiField: $('dpi-field'),
  dpi: $('dpi'),
  marginField: $('margin-field'),
  margin: $('margin'),
  maxSide: $('max-side'),
  quality: $('quality'),
  qualityValue: $('quality-value'),
  qualityField: $('quality-field'),
  title: $('title'),
  savePdf: $('save-pdf'),
  saveImages: $('save-images'),
  busy: $('busy'),
  result: $('result'),
  resultFacts: $('result-facts'),
  download: $('download'),

  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
};

const { show: showError, clear: clearError } = messageBox(el.loadError);

/**
 * How large the photograph is kept for the editor.
 *
 * Not the photograph itself. A page of twenty of those on a phone is half a
 * gigabyte of decoded pixels, and the editor needs exactly two things from each:
 * something to draw at screen size, and something for the corner finder to read.
 * Both are satisfied at a thousand pixels, so that is what is kept, and the file
 * is decoded again at full size when the document is finally written.
 */
const EDIT_EDGE = 1000;

/** The straightened page as it is shown on screen while settings are chosen. */
const PREVIEW_EDGE = 900;

/** How many corner positions are remembered, per page. */
const HISTORY = 40;

/**
 * @typedef {object} Page
 * @property {File} file
 * @property {string} name
 * @property {number} width   the photograph's own size
 * @property {number} height
 * @property {HTMLCanvasElement} preview  the photograph, at EDIT_EDGE
 * @property {number} scale               photograph pixels per preview pixel
 * @property {{x: number, y: number}[]} quad  in the photograph's own pixels
 * @property {boolean} found
 * @property {string} reason
 * @property {boolean} edited
 * @property {Array} history
 */

/** @type {Page[]} */
let pages = [];
let current = 0;
let resultUrl = null;
let busy = false;
let previewToken = 0;
let previewTimer = 0;

const corners = new Corners(el.stage, {
  onChange: (index, point) => moveCorner(index, point),
  onGestureStart: () => snapshot(),
  cornerOf: (index) => pages[current]?.quad[index] ?? { x: 0, y: 0 },
  describe: (index) => describeCorner(index),
});

/* ----------------------------------------------------------- the photographs */

/**
 * Decode a file into a bitmap.
 *
 * `createImageBitmap` is the direct route and what every current browser takes;
 * `imageOrientation: 'from-image'` is what makes a photograph taken with the
 * phone on its side arrive the way it was seen rather than on its side with a
 * tag saying so. The <img> fallback is for older Safari builds where the call is
 * missing or refuses a blob.
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
  // The browser's own downscale, which is filtered and is a great deal better
  // than reading one pixel in four would be.
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas;
}

async function addFiles(files) {
  clearError();
  const wanted = files.filter((file) => /^image\//i.test(file.type) || /\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(file.name));
  if (!wanted.length) return;

  picker.busy(readingLabel(wanted.length));
  const started = pages.length;

  for (const file of wanted) {
    try {
      const decoded = await decode(file);
      pages.push(preparePage(file, decoded));
      decoded.bitmap.close?.();
    } catch {
      showError(phrase('error.decode', { name: file.name }));
    }
    // Between photographs, so that a folder of twenty does not freeze the page
    // and the strip fills in as they arrive.
    refresh();
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  picker.done();
  if (pages.length > started) select(started);
  refresh();
  schedulePreview();
}

/**
 * One page: the picture kept small, and the corners found on it.
 *
 * The canvas is all that is kept. Its pixels are read back when they are wanted
 * - which is only ever for the page being edited - because an ImageData held
 * beside it would be another three megabytes a page of ordinary heap, and fifty
 * photographs is a number people really do put through a scanner.
 */
function preparePage(file, decoded) {
  const preview = shrinkTo(decoded.bitmap, decoded.width, decoded.height, EDIT_EDGE);

  const page = {
    file,
    name: file.name,
    width: decoded.width,
    height: decoded.height,
    preview,
    scale: decoded.width / preview.width,
    quad: wholeFrame(decoded.width, decoded.height),
    found: false,
    reason: 'detect.nothing',
    edited: false,
    history: [],
  };

  detect(page);
  return page;
}

/**
 * Find the corners of one page.
 *
 * The corner finder is given the picture at its own working size rather than the
 * editor's, so that what it reads is the same size whatever the photograph was,
 * and the answer is multiplied back up to the photograph's own pixels. Every
 * corner in this file is in those, so nothing downstream has to know that any of
 * this happened.
 */
function detect(page) {
  const working = shrinkTo(page.preview, page.preview.width, page.preview.height, WORKING_EDGE);
  const context = working.getContext('2d', { willReadFrequently: true });
  const image = context.getImageData(0, 0, working.width, working.height);

  const found = findPageQuad(image);
  const up = page.width / working.width;

  page.quad = scaleQuad(found.quad, up).map((point) => clampPoint(point, page.width, page.height));
  page.found = found.found;
  page.reason = found.reason;
  page.edited = false;
  page.history = [];

  working.width = 0;
  working.height = 0;
}

/* ------------------------------------------------------------- the page strip */

function select(index) {
  current = Math.min(pages.length - 1, Math.max(0, index));
  refresh();
  schedulePreview();
}

function removePage(index) {
  pages.splice(index, 1);
  if (current >= pages.length) current = Math.max(0, pages.length - 1);
  refresh();
  schedulePreview();
}

function movePage(index, by) {
  const to = index + by;
  if (to < 0 || to >= pages.length) return;
  [pages[index], pages[to]] = [pages[to], pages[index]];
  current = to;
  refresh();
}

function renderStrip() {
  el.strip.replaceChildren(...pages.map((page, index) => {
    const item = document.createElement('li');
    item.className = `page-tile${index === current ? ' selected' : ''}`;

    const choose = document.createElement('button');
    choose.type = 'button';
    choose.className = 'tile-choose';
    choose.setAttribute('aria-label', phrase('page.select', { index: index + 1 }));
    choose.setAttribute('aria-pressed', String(index === current));
    choose.addEventListener('click', () => select(index));

    const thumb = document.createElement('canvas');
    thumb.className = 'tile-thumb';
    drawThumb(thumb, page);
    choose.append(thumb);

    const badge = document.createElement('span');
    badge.className = 'tile-badge';
    badge.textContent = String(index + 1);
    choose.append(badge);

    // The mark that says "this one needs looking at", which is the whole reason
    // the strip has thumbnails rather than file names. It goes as soon as the
    // corners have been touched: a page whose corners somebody has put where
    // they want them is not a page anything here has an opinion about.
    if (!page.found && !page.edited) {
      const warn = document.createElement('span');
      warn.className = 'tile-warn';
      warn.textContent = '?';
      warn.title = phrase(page.reason);
      choose.append(warn);
    }

    item.append(choose);

    const actions = document.createElement('div');
    actions.className = 'tile-actions';
    actions.append(
      tileButton('‹', phrase('page.earlier', { index: index + 1 }), () => movePage(index, -1), index === 0),
      tileButton('›', phrase('page.later', { index: index + 1 }), () => movePage(index, 1), index === pages.length - 1),
      tileButton('×', phrase('page.remove', { index: index + 1 }), () => removePage(index), false, 'danger'),
    );
    item.append(actions);

    return item;
  }));
}

function tileButton(glyph, label, onClick, disabled, extra = '') {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `tile-button ${extra}`.trim();
  button.textContent = glyph;
  button.setAttribute('aria-label', label);
  button.disabled = disabled;
  button.addEventListener('click', onClick);
  return button;
}

/** A thumbnail with the found corners drawn on it, so the strip is scannable. */
function drawThumb(canvas, page) {
  const edge = 96;
  const scale = Math.min(edge / page.preview.width, edge / page.preview.height);
  canvas.width = Math.max(1, Math.round(page.preview.width * scale));
  canvas.height = Math.max(1, Math.round(page.preview.height * scale));

  const context = canvas.getContext('2d');
  context.drawImage(page.preview, 0, 0, canvas.width, canvas.height);

  const shrink = canvas.width / page.width;
  context.beginPath();
  page.quad.forEach((point, index) => {
    const x = point.x * shrink;
    const y = point.y * shrink;
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.closePath();
  context.lineWidth = 2;
  context.strokeStyle = page.found ? 'rgba(64, 220, 160, 0.95)' : 'rgba(255, 190, 80, 0.95)';
  context.stroke();
}

/* ------------------------------------------------------------- the corners */

function snapshot() {
  const page = pages[current];
  if (!page) return;
  page.history.push(copyQuad(page.quad));
  if (page.history.length > HISTORY) page.history.shift();
  el.undo.disabled = false;
}

function moveCorner(index, point) {
  const page = pages[current];
  if (!page) return;

  const quad = copyQuad(page.quad);
  quad[index] = clampPoint(point, page.width, page.height);

  // Re-ordered every time, so that dragging a corner past its neighbours swaps
  // which corner it is rather than turning the page inside out. The alternative
  // - refusing the drag - is worse: it is not obvious from the picture which
  // corner is being refused or why.
  page.quad = orderCorners(quad);
  page.edited = true;

  // Only the outline, and not the rest of the page. This runs on every pointer
  // move of a drag, and a full refresh redraws the photograph and every
  // thumbnail in the strip - which on a twenty page document is twenty canvas
  // draws per frame and a drag that visibly stutters. The strip and the
  // straightened page catch up when the drag pauses.
  drawCorners();
  schedulePreview();
}

function undo() {
  const page = pages[current];
  const previous = page?.history.pop();
  if (!previous) return;
  page.quad = previous;
  el.undo.disabled = !page.history.length;
  refresh();
  schedulePreview();
}

function describeCorner(index) {
  const page = pages[current];
  const point = page?.quad[index] ?? { x: 0, y: 0 };
  return phrase('corner.at', {
    corner: phrase(['corner.tl', 'corner.tr', 'corner.br', 'corner.bl'][index]),
    x: Math.round(point.x),
    y: Math.round(point.y),
  });
}

/* --------------------------------------------------------------- the screen */

function refresh() {
  const page = pages[current];
  const any = pages.length > 0;

  el.stripToolbar.hidden = !any;
  el.editControls.hidden = !any;
  el.editEmpty.hidden = any;
  el.cleanControls.hidden = !any;
  el.cleanEmpty.hidden = any;
  el.savePdf.disabled = !any || busy;
  el.saveImages.disabled = !any || busy;

  el.countLabel.textContent = any
    ? phrase(pages.length === 1 ? 'page.count' : 'page.counts', { count: pages.length })
    : '';

  renderStrip();
  if (!page) return;

  // The photograph, at whatever size it is being shown. The stage is given the
  // picture's own shape and the canvas fills it, so every corner over it can be
  // positioned as a percentage and nothing has to be recalculated when the
  // window is resized or a phone is turned.
  el.stage.style.aspectRatio = `${page.width} / ${page.height}`;
  el.photo.width = page.preview.width;
  el.photo.height = page.preview.height;
  el.photo.getContext('2d').drawImage(page.preview, 0, 0);

  corners.setSource(page.width, page.height);
  drawCorners();
}

/** The corner outline and the line under it: everything a drag changes. */
function drawCorners() {
  const page = pages[current];
  if (!page) return;

  corners.render(page.quad, { unsure: !page.found && !page.edited });
  el.detectNote.textContent = page.edited ? phrase('detect.edited') : phrase(page.reason);
  el.detectNote.className = `hint-line${page.found || page.edited ? '' : ' warn-line'}`;
  el.undo.disabled = !page.history.length;
}

/* ---------------------------------------------------------- the scan preview */

function schedulePreview() {
  window.clearTimeout(previewTimer);
  previewTimer = window.setTimeout(renderPreview, 120);
}

/**
 * Straighten and clean the page that is being edited, at screen size.
 *
 * Deliberately the same two functions the file is made with, on a smaller
 * picture. A preview drawn any other way is a promise about the result rather
 * than the result, and the whole point of the panel is that what is on screen is
 * what will be in the document.
 */
async function renderPreview() {
  const page = pages[current];
  if (!page) return;

  const token = previewToken + 1;
  previewToken = token;
  el.scanBusy.hidden = false;

  // One frame, so the busy line is actually painted before the main thread is
  // taken for the resample.
  await new Promise((resolve) => setTimeout(resolve, 0));
  if (previewToken !== token) return;

  try {
    const quad = scaleQuad(page.quad, 1 / page.scale);
    const shape = pageAspect(quad, page.preview.width, page.preview.height);
    const size = outputSize(quad, shape.aspect, PREVIEW_EDGE);

    const source = page.preview
      .getContext('2d', { willReadFrequently: true })
      .getImageData(0, 0, page.preview.width, page.preview.height);
    const flat = warpPage(source, quad, size);
    const cleaned = cleanPage(flat, settings());

    if (previewToken !== token) return;

    el.scanPreview.width = cleaned.width;
    el.scanPreview.height = cleaned.height;
    el.scanPreview.getContext('2d')
      .putImageData(new ImageData(cleaned.data, cleaned.width, cleaned.height), 0, 0);

    describeScan(page, shape);
    // The strip is redrawn here rather than during a drag: this is the moment
    // the drag has stopped moving, which is exactly when the thumbnail's outline
    // is worth putting right.
    renderStrip();
  } catch (error) {
    // The leaf modules throw keys; a browser that failed for its own
    // reasons throws a sentence, and phrase() hands back what it does not
    // recognise.
    showError(phrase('error.failed', { detail: phrase(error.message) }));
  } finally {
    if (previewToken === token) el.scanBusy.hidden = true;
  }
}

/**
 * What the page will come out as, in the numbers that decide whether to take the
 * photograph again.
 */
function describeScan(page, shape) {
  const quad = page.quad;
  const size = outputSize(quad, shape.aspect, Number(el.maxSide.value) || 0);
  const paper = matchPaper(shape.aspect);
  const quality = scanQuality(size.width, shape.aspect);
  const share = Math.round(coverage(quad, page.width, page.height) * 100);

  const lines = [
    paper
      // Two whole sentences rather than one with a bit stitched on the end.
      // phrase() collapses and trims the whitespace around what it finds, so a
      // fragment that has to begin with a space cannot - and a translator
      // reading "{paper}{turned}" could not tell where the space was meant to go
      // either.
      ? phrase(paper.landscape ? 'shape.sideways' : 'shape.known', {
        ratio: ratioText(shape.aspect),
        paper: phrase(paper.key),
      })
      : phrase('shape.unknown', { ratio: ratioText(shape.aspect) }),
    phrase(`method.${shape.method}`),
    quality
      ? phrase(quality.key, { width: size.width, height: size.height, dpi: quality.dpi })
      : phrase('quality.pixels', { width: size.width, height: size.height }),
    phrase(share < 25 ? 'coverage.small' : 'coverage.note', { percent: share }),
  ];

  el.scanFacts.replaceChildren(...lines.map((line) => {
    const item = document.createElement('li');
    item.textContent = line;
    return item;
  }));
}

/* ------------------------------------------------------------- the settings */

function settings() {
  return {
    mode: el.modeGroup.querySelector('input[name="mode"]:checked')?.value ?? 'colour',
    strength: Number(el.strength.value),
    pageSize: el.pageSize.value,
    dpi: Number(el.dpi.value),
    margin: Number(el.margin.value),
    maxSide: Number(el.maxSide.value),
    quality: Number(el.quality.value) / 100,
    title: el.title.value,
  };
}

function showSettingNotes() {
  const mode = settings().mode;
  el.strengthRow.hidden = mode === 'photo';
  el.strengthNote.hidden = mode === 'photo';
  el.qualityField.hidden = mode === 'mono';

  const strength = Number(el.strength.value);
  el.strengthValue.textContent = String(strength);
  el.strengthNote.textContent = phrase(
    strength < 34 ? 'strength.gentle' : (strength > 66 ? 'strength.hard' : 'strength.middling'),
  );

  const fit = el.pageSize.value === 'fit';
  el.dpiField.hidden = !fit;
  el.marginField.hidden = fit;
  el.sizeNote.textContent = fit
    ? phrase('size.fit')
    : phrase('size.named', { name: el.pageSize.selectedOptions[0].textContent.split('—')[0].trim() });

  el.qualityValue.textContent = `${el.quality.value}%`;
}

/* ---------------------------------------------------------------- the files */

/**
 * Straighten one page at the size it is actually going to be saved at.
 *
 * The photograph is decoded again here rather than being held since it was
 * chosen - see EDIT_EDGE - and it is shrunk before it is resampled, whenever the
 * page is being made smaller than it appears in the photograph. That shrink is
 * `drawImage` on a canvas, which is the browser's own filtered downscale: better
 * than anything worth writing here, and enough on its own that the resample
 * itself never has to read more than one sample per output pixel.
 */
async function renderFull(page, options) {
  const decoded = await decode(page.file);
  try {
    const quad = page.quad;
    const shape = pageAspect(quad, page.width, page.height);
    const size = outputSize(quad, shape.aspect, options.maxSide);

    const longestEdge = Math.max(
      Math.hypot(quad[1].x - quad[0].x, quad[1].y - quad[0].y),
      Math.hypot(quad[2].x - quad[3].x, quad[2].y - quad[3].y),
      Math.hypot(quad[3].x - quad[0].x, quad[3].y - quad[0].y),
      Math.hypot(quad[2].x - quad[1].x, quad[2].y - quad[1].y),
    );
    const wanted = Math.max(size.width, size.height);
    // A tenth over, so that the resample is never the thing that softens the
    // page: shrinking to exactly the output size and then sampling it would
    // land every output pixel between two source pixels.
    const factor = Math.min(1, (wanted * 1.1) / Math.max(1, longestEdge));

    const canvas = shrinkTo(
      decoded.bitmap, page.width, page.height, Math.max(page.width, page.height) * factor,
    );
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const source = context.getImageData(0, 0, canvas.width, canvas.height);

    // What the shrink actually did, not what it was asked for: the canvas has
    // whole-number sides, and the corners have to be scaled by the same amount
    // the pixels were or the page comes out shifted by a pixel or two.
    const applied = canvas.width / page.width;
    canvas.width = 0;
    canvas.height = 0;

    const flat = warpPage(source, scaleQuad(quad, applied), size);
    return cleanPage(flat, options);
  } finally {
    decoded.bitmap.close?.();
  }
}

async function savePdf() {
  await run(async (report) => {
    const options = settings();
    const encoded = [];

    for (const [index, page] of pages.entries()) {
      report(phrase('busy.page', { done: index + 1, total: pages.length }));
      const cleaned = await renderFull(page, options);
      encoded.push(await encodePage(cleaned, options));
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    report(phrase('busy.writing'));
    const blob = buildDocument(encoded, options);
    const name = outName(stemOf(pages[0].name), 'pdf');
    const mono = options.mode === 'mono';

    show(blob, name, [
      phrase('result.pdf', {
        name,
        size: sizeText(blob.size),
        pages: phrase(pages.length === 1 ? 'page.count' : 'page.counts', { count: pages.length }),
      }),
      phrase(mono ? 'result.mono' : 'result.jpeg'),
      phrase('result.clean'),
    ]);
  });
}

async function saveImages() {
  await run(async (report) => {
    const options = settings();
    const stem = stemOf(pages[0].name);
    const files = [];
    let extension = 'jpg';

    for (const [index, page] of pages.entries()) {
      report(phrase('busy.page', { done: index + 1, total: pages.length }));
      const cleaned = await renderFull(page, options);
      const written = await encodeImage(cleaned, options);
      extension = written.extension;
      files.push({
        name: pageName(stem, index, pages.length, written.extension),
        blob: written.blob,
      });
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    // One page is one file. Putting a single picture in an archive to be
    // consistent would mean everybody who scanned one page had to unzip it.
    if (files.length === 1) {
      show(files[0].blob, files[0].name, [
        phrase('result.images', {
          name: files[0].name,
          size: sizeText(files[0].blob.size),
          pages: phrase('page.count', { count: 1 }),
        }),
      ]);
      return;
    }

    // The bytes are only read out of the blobs here, at the end. Reading them
    // as each page is finished would hold every page twice over - once as a
    // blob, which the browser may have put on disk, and once as an array, which
    // it certainly has not.
    const zip = makeZip(await Promise.all(files.map(async ({ name, blob }) => ({
      name,
      data: new Uint8Array(await blob.arrayBuffer()),
    }))));
    const name = outName(stem, 'zip');
    show(zip, name, [
      phrase('result.images', {
        name,
        size: sizeText(zip.size),
        pages: phrase('page.counts', { count: files.length }),
      }),
      phrase(extension === 'png' ? 'result.png' : 'result.jpeg'),
    ]);
  });
}

/** The one place that turns the buttons off, reports progress and puts them back. */
async function run(work) {
  if (busy || !pages.length) {
    if (!pages.length) showError(phrase('error.none'));
    return;
  }

  busy = true;
  el.savePdf.disabled = true;
  el.saveImages.disabled = true;
  el.busy.hidden = false;
  clearError();

  const report = (text) => {
    el.busy.textContent = text;
  };
  report(phrase('busy.page', { done: 1, total: pages.length }));

  try {
    // A frame, so that the disabled buttons and the progress line are painted
    // before the main thread is taken. setTimeout rather than
    // requestAnimationFrame: a background tab never gets a frame, and the file
    // has to be written whether or not anybody is looking at the page.
    await new Promise((resolve) => setTimeout(resolve, 0));
    await work(report);
  } catch (error) {
    // The leaf modules throw keys; a browser that failed for its own
    // reasons throws a sentence, and phrase() hands back what it does not
    // recognise.
    showError(phrase('error.failed', { detail: phrase(error.message) }));
  } finally {
    busy = false;
    el.busy.hidden = true;
    refresh();
  }
}

function show(blob, name, facts) {
  if (resultUrl) URL.revokeObjectURL(resultUrl);
  resultUrl = URL.createObjectURL(blob);

  el.download.href = resultUrl;
  el.download.download = name;
  el.resultFacts.replaceChildren(...facts.map((line) => {
    const item = document.createElement('li');
    item.textContent = line;
    return item;
  }));
  el.result.hidden = false;
}

/* ------------------------------------------------------------------ errors */

/* --------------------------------------------------------------- the wiring */

const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles: (files) => addFiles(files),
});

el.detectOne.addEventListener('click', () => {
  const page = pages[current];
  if (!page) return;
  detect(page);
  refresh();
  schedulePreview();
});

el.detectAll.addEventListener('click', () => {
  for (const page of pages) detect(page);
  refresh();
  schedulePreview();
});

el.wholePhoto.addEventListener('click', () => {
  const page = pages[current];
  if (!page) return;
  snapshot();
  page.quad = wholeFrame(page.width, page.height);
  page.edited = true;
  refresh();
  schedulePreview();
});

// Turning does not move a corner - it changes which of the four is treated as
// the top left - so a turned page is still a page whose corners were found, and
// the note under the photo should not start claiming otherwise.
const turn = (times) => {
  const page = pages[current];
  if (!page) return;
  snapshot();
  for (let i = 0; i < times; i += 1) page.quad = turnQuad(page.quad);
  refresh();
  schedulePreview();
};

el.turnRight.addEventListener('click', () => turn(1));
el.turnLeft.addEventListener('click', () => turn(3));
el.undo.addEventListener('click', undo);

el.clearAll.addEventListener('click', () => {
  pages = [];
  current = 0;
  refresh();
});

el.modeGroup.addEventListener('change', () => {
  showSettingNotes();
  schedulePreview();
});
el.strength.addEventListener('input', () => {
  showSettingNotes();
  schedulePreview();
});
el.maxSide.addEventListener('change', () => renderPreview());
el.pageSize.addEventListener('change', showSettingNotes);
el.quality.addEventListener('input', showSettingNotes);
el.savePdf.addEventListener('click', savePdf);
el.saveImages.addEventListener('click', saveImages);

/* ------------------------------------------------- privacy panel + offline */

el.privacyToggle.addEventListener('click', () => {
  const open = el.privacyPanel.hidden;
  el.privacyPanel.hidden = !open;
  el.privacyToggle.setAttribute('aria-expanded', String(open));
});

/* -------------------------------------------------------------------- boot */

// An error thrown after boot would otherwise only reach the console, leaving the
// page looking functional but doing nothing.
window.addEventListener('error', (event) => {
  showError(phrase('error.broke', { detail: event.message }));
});
window.addEventListener('unhandledrejection', (event) => {
  showError(phrase('error.broke', { detail: event.reason?.message ?? event.reason }));
});

showSettingNotes();
refresh();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
