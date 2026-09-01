/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { readingLabel, wireFilePicker } from './shared/file-picker.js';
import { maskFromImage } from './mask.js';
import { subjectMask } from './subject.js';
import { traceMask } from './trace.js';
import { labelRegions, selectRegion, outlineOfSelection, MaskEdits } from './regions.js';
import { Viewport, clamp } from './view.js';

const $ = (id) => document.getElementById(id);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  loaded: $('loaded'),
  loadedName: $('loaded-name'),
  clearImage: $('clear-image'),
  loadError: $('load-error'),

  findCard: $('find-card'),
  find: $('find'),
  thresholdGroup: $('threshold-group'),
  threshold: $('threshold'),
  thresholdValue: $('threshold-value'),
  thresholdAuto: $('threshold-auto'),
  subjectGroup: $('subject-group'),
  sensitivity: $('sensitivity'),
  sensitivityValue: $('sensitivity-value'),
  reach: $('reach'),
  reachValue: $('reach-value'),
  seal: $('seal'),
  sealValue: $('seal-value'),
  solid: $('solid'),
  keepAll: $('keep-all'),
  useBorder: $('use-border'),
  subjectNote: $('subject-note'),
  invert: $('invert'),

  workCard: $('work-card'),
  stages: $('stages'),
  stagePicture: $('stage-picture'),
  stageSvg: $('stage-svg'),
  hint: $('hint'),
  zoom: $('zoom'),
  zoomValue: $('zoom-value'),
  fit: $('fit'),
  show: $('show'),
  showOutline: $('show-outline'),
  wandMode: $('wand-mode'),
  wandTolerance: $('wand-tolerance'),
  toleranceValue: $('tolerance-value'),
  sampleBackground: $('sample-background'),
  clearSamples: $('clear-samples'),
  undo: $('undo'),
  resetEdits: $('reset-edits'),
  detail: $('detail'),
  detailValue: $('detail-value'),
  detailAuto: $('detail-auto'),
  corner: $('corner'),
  cornerValue: $('corner-value'),

  saveCard: $('save-card'),
  facts: $('facts'),
  download: $('download'),
  tooBig: $('too-big'),
};

/**
 * What a preview may cost, and what a click may.
 *
 * The wand runs on every pointer move and each thing it does is the size of
 * the picture, so a preview is allowed one flood fill of a million-odd pixels
 * and no more; a click is allowed whatever it likes, because it happens once
 * and the answer has to be exact. Past OUTLINE the boundary of a selection is
 * hundreds of thousands of points, and stroking that per frame is a stopped
 * tab rather than a slow one.
 */
const PREVIEW_BUDGET = 1_200_000;
const OUTLINE_BUDGET = 120_000;

/**
 * Where a traced picture stops being a drawing.
 *
 * A page of line art at 300 dpi is three loops and six kilobytes; a page of
 * handwriting is fifty and a hundred and fifty; a photograph traced as though
 * it were line art is four thousand and a megabyte and a half. The gap is two
 * orders of magnitude wide, and past this side of it the page says what
 * happened instead of trying to draw it.
 */
const TOO_MANY_LOOPS = 1200;
const TOO_MANY_BYTES = 400_000;

const NOTHING = { at: -1, pixels: null, outline: null, size: 0, wasInk: false, truncated: false };

let picture = null;       // { name, stem, canvas, image }
let baseMask = null;      // what the threshold, or the subject finder, said
let edits = null;         // what the visitor said afterwards
let workMask = null;      // the two together - the thing that is traced
let labelled = null;      // regions of workMask; only the joined-shape wand needs them
let out = null;           // the trace
let outPath = null;       // out.d as a Path2D, parsed once rather than per frame
let overwhelming = false;
let bgSamples = [];
let hover = { ...NOTHING };
let downloadUrl = null;

const view = new Viewport({
  hosts: [el.stagePicture, el.stageSvg],
  onHover: (point) => (point ? hoverAt(point) : clearHover()),
  onPick: (point) => pick(point),
  onView: () => {
    el.fit.checked = false;
    el.zoom.value = String(Math.log2(view.zoom));
    redraw();
  },
});

/* ---- reading the picture --------------------------------------------------- */

const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles(files) {
    if (files.length > 0) load(files[0]);
  },
});

async function load(file) {
  el.loadError.hidden = true;
  picker.busy(readingLabel(1));
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const g = canvas.getContext('2d', { willReadFrequently: true });
    // On white, because that is what a transparent pixel is sitting on once it
    // is a black-and-white drawing, and it is what the threshold assumes.
    g.fillStyle = '#fff';
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.drawImage(bitmap, 0, 0);
    bitmap.close?.();

    picture = {
      name: file.name,
      stem: file.name.replace(/\.[^.]+$/, '') || 'drawing',
      canvas,
      image: g.getImageData(0, 0, canvas.width, canvas.height),
    };
    el.loadedName.textContent = phrase('loaded.name', {
      name: file.name, width: canvas.width, height: canvas.height,
    });
    el.loaded.hidden = false;
    bgSamples = [];
    edits = null;
    view.setSize(canvas.width, canvas.height);
    view.fit = true;
    el.fit.checked = true;
    view.pan = { x: 0, y: 0 };
    remask({ keepEdits: false });
  } catch (why) {
    el.loadError.textContent = phrase('read.failed', {
      why: why?.message || phrase('read.nodecode'),
    });
    el.loadError.hidden = false;
    // The file was turned away, so the steps that would have acted on it go
    // back to being dimmed rather than sitting live and empty.
    picker.waiting();
  } finally {
    picker.done();
  }
}

/* ---- the pipeline, cheapest last ------------------------------------------- */

function remask({ keepEdits = true } = {}) {
  if (!picture) return;
  const subject = el.find.value === 'subject';
  el.thresholdGroup.hidden = subject;
  el.subjectGroup.hidden = !subject;

  if (subject) {
    baseMask = subjectMask(picture.image, {
      bias: +el.sensitivity.value,
      hysteresis: +el.reach.value / 100,
      close: +el.seal.value,
      solid: el.solid.checked,
      keep: el.keepAll.checked ? 'all' : 'largest',
      useBorder: el.useBorder.checked,
      samples: bgSamples,
    });
    // Inverting a silhouette means tracing what is round it, which is a
    // reasonable thing to want and one line to give.
    if (el.invert.checked) {
      baseMask = { ...baseMask, bits: baseMask.bits.map((b) => (b ? 0 : 1)) };
    }
    el.subjectNote.textContent = [
      phrase(baseMask.islands === 1 ? 'subject.found.one' : 'subject.found.many', {
        islands: baseMask.islands,
        share: (baseMask.share * 100).toFixed(1),
      }),
      el.useBorder.checked
        ? phrase('subject.border')
        : phrase('subject.told', { count: bgSamples.length }),
    ].join(' ');
  } else {
    const auto = el.thresholdAuto.checked;
    baseMask = maskFromImage(picture.image, {
      threshold: auto ? 'otsu' : +el.threshold.value,
      invert: el.invert.checked,
    });
    if (auto) el.threshold.value = String(baseMask.threshold);
    el.thresholdValue.value = auto
      ? phrase('threshold.auto', { level: baseMask.threshold })
      : phrase('threshold.set', { level: baseMask.threshold });
  }

  // Corrections outlive the threshold on purpose: they are a different kind of
  // statement about the picture, and having to redo them after every nudge of
  // a slider would make the sliders unusable.
  if (!keepEdits || !edits || edits.overrides.length !== baseMask.bits.length) {
    edits = new MaskEdits(baseMask.w, baseMask.h);
  }
  retrace();
}

/**
 * Labelling every joined region is a pass over the picture and four bytes a
 * pixel, and only one of the two wands ever reads it. On a photograph nobody
 * is using that wand on, it would be work done to answer a question nobody
 * asked.
 */
function labelsNow() {
  if (!labelled) labelled = labelRegions(workMask, {});
  return labelled;
}

function retrace() {
  workMask = edits.apply(baseMask);
  labelled = null;
  const started = performance.now();
  out = traceMask(workMask, {
    epsilon: el.detailAuto.checked ? 'auto' : +el.detail.value,
    cornerAngle: +el.corner.value,
  });
  out.took = performance.now() - started;

  overwhelming = out.stats.contours > TOO_MANY_LOOPS || out.stats.bytes > TOO_MANY_BYTES;
  outPath = overwhelming ? null : new Path2D(out.d);
  hover = { ...NOTHING };
  el.undo.disabled = edits.edits === 0;
  el.resetEdits.disabled = edits.edits === 0;
  offerDownload();
  redraw();
}

function redraw() {
  if (!out) return;
  // Before this runs there was nothing to show and the panes were short. They
  // have to be their full height BEFORE the zoom is worked out, because fit
  // measures them.
  el.stages.classList.remove('waiting');
  const { zw, zh, zoom } = view.apply();
  drawPicture(view.panes[0], zw, zh, zoom);
  drawSvg(view.panes[1], zw, zh);
  drawOverlays(zoom);
  showNumbers();

  el.zoomValue.value = phrase('zoom.times', {
    zoom: zoom >= 1 ? +zoom.toFixed(2) : +zoom.toPrecision(2),
  });
  if (el.fit.checked) el.zoom.value = String(Math.log2(zoom));
}

/* ---- drawing ---------------------------------------------------------------- */

function drawPicture(pane, zw, zh, zoom) {
  const wanted = el.show.value;
  const field = wanted === 'measured' ? baseMask.distance : null;
  let source = picture.canvas;

  if (wanted === 'mask' || field) {
    const c = document.createElement('canvas');
    c.width = workMask.w;
    c.height = workMask.h;
    const g = c.getContext('2d');
    const id = g.createImageData(workMask.w, workMask.h);
    for (let i = 0; i < workMask.bits.length; i++) {
      const v = field ? field[i] : (workMask.bits[i] ? 0 : 255);
      id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v;
      id.data[i * 4 + 3] = 255;
    }
    g.putImageData(id, 0, 0);
    source = c;
  }

  const canvas = pane.content;
  canvas.width = zw;
  canvas.height = zh;
  canvas.setAttribute('aria-label', phrase('picture.alt', {
    width: workMask.w, height: workMask.h,
  }));
  const g = canvas.getContext('2d');
  // Nearest neighbour is the point of this pane when magnifying: it is how you
  // see the staircase the tracer is arguing with. Shrinking is the opposite -
  // dropping every other pixel invents a moire that is not in the file.
  g.imageSmoothingEnabled = zoom < 1;
  g.drawImage(source, 0, 0, zw, zh);
}

function drawSvg(pane, zw, zh) {
  if (overwhelming) {
    const said = document.createElement('div');
    said.className = 'stage-said';
    said.style.width = `${zw}px`;
    said.style.height = `${zh}px`;
    swap(pane, said);
    return;
  }
  const holder = document.createElement('div');
  holder.innerHTML = out.svg;
  const svg = holder.firstElementChild;
  svg.setAttribute('width', zw);
  svg.setAttribute('height', zh);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', phrase('picture.alt', {
    width: workMask.w, height: workMask.h,
  }));
  swap(pane, svg);
}

function swap(pane, node) {
  pane.content.replaceWith(node);
  pane.content = node;
}

/**
 * Two lines over the pictures: where the outline is now, and what the pointer
 * would take. Both are stroked from coordinates rather than painted per pixel,
 * so they stay one line wide at sixteen times instead of becoming a stripe.
 */
function drawOverlays(zoom) {
  for (const [index, pane] of view.panes.entries()) {
    const g = pane.overlay.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, pane.overlay.width, pane.overlay.height);

    if (index === 0 && el.showOutline.checked && outPath) {
      g.save();
      g.scale(zoom, zoom);
      g.strokeStyle = '#e0202a';
      g.lineWidth = Math.max(0.5, 1.1 / zoom);
      g.stroke(outPath);
      g.restore();
    }

    if (!hover.outline) continue;
    const putting = !hover.wasInk;
    g.save();
    g.scale(zoom, zoom);
    g.beginPath();
    for (const loop of hover.outline) {
      for (let i = 0; i < loop.xs.length; i++) {
        if (i === 0) g.moveTo(loop.xs[i], loop.ys[i]);
        else g.lineTo(loop.xs[i], loop.ys[i]);
      }
      g.closePath();
    }
    g.fillStyle = putting ? 'rgba(20,190,90,.22)' : 'rgba(230,30,60,.22)';
    g.fill();
    // White underneath and dark on top: it reads on ink and on paper alike.
    g.lineWidth = Math.max(0.6, 2.4 / zoom);
    g.strokeStyle = 'rgba(255,255,255,.9)';
    g.stroke();
    g.lineWidth = Math.max(0.4, 1.2 / zoom);
    g.strokeStyle = putting ? '#0a7a3a' : '#b00020';
    g.setLineDash([4 / zoom, 3 / zoom]);
    g.stroke();
    g.restore();
  }
}

/* ---- pointing at things ----------------------------------------------------- */

let pending = 0;

const wandOptions = (budget) => ({
  mode: el.wandMode.value,
  tolerance: +el.wandTolerance.value,
  budget,
});

const labelsIfNeeded = () => (el.wandMode.value === 'shape' ? labelsNow() : null);

function clearHover() {
  if (hover.at === -1) return;
  hover = { ...NOTHING };
  el.hint.textContent = '';
  redrawOverlaysOnly();
}

function hoverAt([x, y]) {
  if (!workMask) return;
  const at = y * workMask.w + x;
  if (at === hover.at) return;
  hover.at = at;

  if (el.sampleBackground.checked && el.find.value === 'subject') {
    el.hint.textContent = phrase('hover.sample');
    return;
  }

  // One flood fill per pause, not per frame. A timer rather than
  // requestAnimationFrame, because rAF does not fire in a hidden tab and a
  // preview that silently never arrives is a bad way to find that out.
  clearTimeout(pending);
  pending = setTimeout(() => {
    if (hover.at !== at) return;
    const got = selectRegion(workMask, labelsIfNeeded(), x, y, wandOptions(PREVIEW_BUDGET));
    const outline = got.truncated
      ? null
      : outlineOfSelection(got.pixels, workMask.w, workMask.h, OUTLINE_BUDGET);
    hover = { at, ...got, outline };

    const share = ((got.size / (workMask.w * workMask.h)) * 100).toFixed(1);
    const size = got.size.toLocaleString();
    el.hint.textContent = got.truncated
      ? phrase('hover.big', { size })
      : (!outline
        ? phrase('hover.long', { size })
        : phrase(got.wasInk ? 'hover.ink' : 'hover.paper', { size, share }));
    redrawOverlaysOnly();
  }, 110);
}

function redrawOverlaysOnly() {
  drawOverlays(view.zoom);
}

function pick([x, y]) {
  if (!workMask) return;

  if (el.sampleBackground.checked && el.find.value === 'subject') {
    bgSamples.push(meanColourAround(x, y, 3));
    el.useBorder.checked = false;
    showSamples();
    remask();
    return;
  }

  const got = selectRegion(workMask, labelsIfNeeded(), x, y, wandOptions());
  if (!got.size) return;
  edits.set(got.pixels, !got.wasInk);
  retrace();
}

/** The average colour of a small patch, which is steadier than one pixel. */
function meanColourAround(x, y, r) {
  const { width: w, height: h, data } = picture.image;
  let rr = 0, gg = 0, bb = 0, n = 0;
  for (let j = Math.max(0, y - r); j <= Math.min(h - 1, y + r); j++) {
    for (let i = Math.max(0, x - r); i <= Math.min(w - 1, x + r); i++) {
      const p = (j * w + i) * 4;
      const k = data[p + 3] / 255;
      rr += data[p] * k + 255 * (1 - k);
      gg += data[p + 1] * k + 255 * (1 - k);
      bb += data[p + 2] * k + 255 * (1 - k);
      n++;
    }
  }
  return [rr / n, gg / n, bb / n];
}

/* ---- what the page says about the result ------------------------------------ */

function showNumbers() {
  const s = out.stats;
  const parts = [phrase(s.contours === 1 ? 'facts.line.one' : 'facts.line.many', {
    loops: s.contours.toLocaleString(),
    points: s.vertices.toLocaleString(),
    bytes: sizeText(s.bytes),
    ms: out.took.toFixed(1),
  })];
  if (edits.edits > 0) {
    parts.push(phrase(edits.edits === 1 ? 'facts.edits.one' : 'facts.edits.many',
      { count: edits.edits }));
  }
  el.facts.textContent = parts.join(' ');

  el.tooBig.hidden = !overwhelming;
  if (overwhelming) {
    el.tooBig.innerHTML = phrase('toobig.warning', {
      loops: s.contours.toLocaleString(),
      bytes: sizeText(s.bytes),
    });
  }
}

function sizeText(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function offerDownload() {
  if (downloadUrl) URL.revokeObjectURL(downloadUrl);
  const blob = new Blob([out.svg], { type: 'image/svg+xml' });
  downloadUrl = URL.createObjectURL(blob);
  el.download.href = downloadUrl;
  el.download.download = phrase('save.name', { stem: picture.stem });
  el.download.hidden = false;
}

function showSamples() {
  el.clearSamples.hidden = bgSamples.length === 0;
  el.clearSamples.textContent = phrase(
    bgSamples.length === 1 ? 'samples.clear.one' : 'samples.clear.many',
    { count: bgSamples.length });
}

/* ---- the controls ----------------------------------------------------------- */

function showTolerance() {
  const joined = el.wandMode.value === 'shape';
  el.wandTolerance.disabled = joined;
  el.toleranceValue.value = joined
    ? phrase('tolerance.joined')
    : (+el.wandTolerance.value === 0
      ? phrase('tolerance.exact')
      : phrase('tolerance.near', { value: el.wandTolerance.value }));
}

function showDetail() {
  el.detail.disabled = el.detailAuto.checked;
  el.detailValue.value = el.detailAuto.checked
    ? phrase('detail.auto')
    : phrase('detail.set', { value: (+el.detail.value).toFixed(1) });
  el.cornerValue.value = phrase('corner.degrees', { value: el.corner.value });
}

function showSubjectValues() {
  el.sensitivityValue.value = el.sensitivity.value;
  el.reachValue.value = `${el.reach.value}%`;
  el.sealValue.value = el.seal.value;
}

for (const id of ['find', 'threshold', 'threshold-auto', 'invert',
  'sensitivity', 'reach', 'seal', 'solid', 'keep-all', 'use-border']) {
  $(id).addEventListener('input', () => {
    if (id === 'threshold') el.thresholdAuto.checked = false;
    if (id === 'invert' && edits) edits.flip();
    el.threshold.disabled = el.thresholdAuto.checked;
    showSubjectValues();
    remask();
  });
}

for (const id of ['detail', 'detail-auto', 'corner']) {
  $(id).addEventListener('input', () => {
    if (id === 'detail') el.detailAuto.checked = false;
    showDetail();
    if (picture) retrace();
  });
}

for (const id of ['zoom', 'fit', 'show', 'show-outline']) {
  $(id).addEventListener('input', () => {
    if (id === 'zoom') el.fit.checked = false;
    if (id === 'show') el.show.value = pickableShow();
    view.setZoom(2 ** +el.zoom.value, { fit: el.fit.checked });
    if (picture) redraw();
  });
}

/** "What it measured" is a picture only the subject finder makes. */
function pickableShow() {
  const wanted = el.show.value;
  if (wanted === 'measured' && !baseMask?.distance) return 'mask';
  return wanted;
}

for (const id of ['wand-mode', 'wand-tolerance']) {
  $(id).addEventListener('input', () => {
    showTolerance();
    hover.at = -1;   // what was highlighted was answering a different question
  });
}

el.sampleBackground.addEventListener('input', () => {
  hover.at = -1;
  el.hint.textContent = '';
});

el.clearSamples.addEventListener('click', () => {
  bgSamples = [];
  showSamples();
  remask();
});

el.undo.addEventListener('click', () => {
  if (edits?.undo()) retrace();
});

el.resetEdits.addEventListener('click', () => {
  edits?.reset();
  retrace();
});

el.clearImage.addEventListener('click', () => {
  picture = null;
  baseMask = workMask = out = outPath = null;
  edits = null;
  bgSamples = [];
  el.loaded.hidden = true;
  el.download.hidden = true;
  el.facts.textContent = '';
  el.hint.textContent = '';
  el.tooBig.hidden = true;
  el.fileInput.value = '';
  el.stages.classList.add('waiting');
  picker.waiting();
  showSamples();
});

let resizing = 0;
addEventListener('resize', () => {
  if (!picture) return;
  clearTimeout(resizing);
  resizing = setTimeout(redraw, 120);
});

// The frame puts a "this page's code did not start" panel in every tool page
// and leaves it to the tool to take out, because the tool is the only thing
// that can prove it started.
document.getElementById('boot-warning')?.remove();

el.threshold.disabled = el.thresholdAuto.checked;
showTolerance();
showDetail();
showSubjectValues();
showSamples();
