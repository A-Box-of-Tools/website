/** UI wiring and application state. */

import { ltr, phrase } from './shared/phrases.js';
import { messageBox } from './shared/message-box.js';
import {
  SPECS, backgroundOf, countryLabel, documentLabel, orderedCountries,
  portalBytes, portalPixels, specById, specFromHash, specsOf, trim,
  withCustom,
} from './specs.js';
import {
  fitFrame, frameAspect, guideLines, measure, passes, printPixels, resampling,
} from './geometry.js';
import { PAPERS, bestSheet, describeSheet, paperById } from './sheet.js';
import {
  checkBackground, checkSignature, readBackground, readSignature,
} from './background.js';
import {
  decode, drawCrop, drawCropInto, drawSheet, encodePrint, encodeToBand, free,
  release, samplePixels, sizeText,
} from './encode.js';
import { WORKING_EDGE, findMarks } from './detect.js';
import { Cropper } from './cropper.js';
import { Marks } from './marks.js';
import {
  centreText, docSize, outName, readyText, resamplingText, sourceLine,
  specFacts, statusClass, stemOf, tiltText, verdictText,
} from './files.js';
import { readingLabel, wireFilePicker } from './shared/file-picker.js';
import { makeExample } from './example.js';
import { readRequirements } from './requirements.js';

const $ = (id) => document.getElementById(id);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  loaded: $('loaded'),
  loadedName: $('loaded-name'),
  clearPhoto: $('clear-photo'),
  loadError: $('load-error'),

  countryFilter: $('country-filter'),
  filterNote: $('filter-note'),
  country: $('country'),
  docList: $('doc-list'),
  outcome: $('outcome'),
  outcomeCanvas: $('outcome-canvas'),
  outcomeSize: $('outcome-size'),
  specFacts: $('spec-facts'),
  specNotes: $('spec-notes'),
  specSource: $('spec-source'),
  customPanel: $('custom-panel'),
  readRules: $('read-rules'),
  readText: $('read-text'),
  readButton: $('read-button'),
  readResult: $('read-result'),
  readStatus: $('read-status'),
  readFound: $('read-found'),
  readNotes: $('read-notes'),

  frameEmpty: $('frame-empty'),
  frameControls: $('frame-controls'),
  markHint: $('mark-hint'),
  // The switch itself, reached through one of its radios: it is the group that
  // is hidden for a signature, and the group has no id of its own to hide by.
  markModes: $('mark-mode-auto').closest('.mark-mode'),
  modeAuto: $('mark-mode-auto'),
  modeManual: $('mark-mode-manual'),
  markNote: $('mark-note'),
  markWhy: $('mark-why'),
  stage: $('stage'),
  preview: $('preview'),
  fitBox: $('fit-box'),
  resetMarks: $('reset-marks'),
  wholePhoto: $('whole-photo'),
  shortNote: $('short-note'),
  geometryChecks: $('geometry-checks'),
  resampleNote: $('resample-note'),

  backgroundLede: $('background-lede'),
  swatches: $('swatches'),
  swatchFound: $('swatch-found'),
  swatchFoundText: $('swatch-found-text'),
  swatchWanted: $('swatch-wanted'),
  swatchWantedText: $('swatch-wanted-text'),
  backgroundChecks: $('background-checks'),
  backgroundNote: $('background-note'),

  readyLine: $('ready-line'),
  dpiField: $('dpi-field'),
  printDpi: $('print-dpi'),
  dpiNote: $('dpi-note'),
  paperField: $('paper-field'),
  paper: $('paper'),
  paperNote: $('paper-note'),
  make: $('make'),
  progress: $('progress'),
  progressBar: $('progress-bar'),
  progressLabel: $('progress-label'),
  results: $('results'),
  resultList: $('result-list'),

  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
};

const { show: showLoadError, clear: clearLoadError } = messageBox(el.loadError);

/** The custom fields, by the key withCustom() reads them under. */
const CUSTOM_FIELDS = {
  widthMm: $('custom-width'),
  heightMm: $('custom-height'),
  dpi: $('custom-dpi'),
  headMinMm: $('custom-head-min'),
  headMaxMm: $('custom-head-max'),
  background: $('custom-background'),
  pxWidth: $('custom-px-width'),
  pxHeight: $('custom-px-height'),
  minKb: $('custom-min-kb'),
  maxKb: $('custom-max-kb'),
};

/**
 * @typedef {object} Photo
 * @property {File} file
 * @property {string} url       an object URL, revoked when the photo is dropped
 * @property {ImageBitmap|HTMLImageElement} bitmap
 * @property {number} width
 * @property {number} height
 */

/** @type {Photo|null} One photograph at a time. An ID photo is not a batch. */
let photo = null;

// The rule the address names, where it names one: that is how the page a rule
// has to itself hands somebody on to this one. See specFromHash.
let specId = specFromHash(window.location.hash) ?? SPECS[0].id;
let busy = false;

/**
 * Where the four dots come from, and what happened the last time they were put
 * somewhere.
 *
 * Two states, not a flag on a detector: 'auto' means the picture was measured,
 * 'manual' means the dots are somebody's own. Moving one by hand moves the
 * whole page into 'manual', because from that moment the page cannot honestly
 * describe them as a measurement - and the note under the switch says so.
 */
let markMode = 'auto';

/** What detect.js last said, so the note can be redrawn without measuring again. */
let lastFinding = null;

/** The last background reading, kept so the panel redraws without re-sampling. */
let reading = null;

/**
 * The last geometry measurement, for the same reason - and for one more: the
 * summary line above the download buttons is redrawn when the background is
 * read, and a line that said "the geometry meets the rule" because it had
 * nothing to hand would be the page stating a pass it had never measured.
 */
let lastMetrics = null;
let backgroundTimer = 0;

/** Everything the last run produced. The URLs are revoked before the next one. */
let resultUrls = [];

/** sizeText() with the resolver already in it - it is called from nine places. */
const bytesText = (bytes) => sizeText(bytes, phrase);

const cropper = new Cropper(el.stage, { onChange: onCropChange, t: phrase });
const marks = new Marks(el.stage, {
  t: phrase,
  onChange: (_, why) => {
    if (why === 'drag' && markMode === 'auto') {
      markMode = 'manual';
      el.modeManual.checked = true;
      lastFinding = { quality: 'edited', notes: [] };
      renderMarkNote();
    }
    refreshFrame();
  },
});

/* -------------------------------------------------------- the specification */

/** The specification as it currently stands, with any custom figures applied. */
function currentSpec() {
  const spec = specById(specId);
  if (spec.id !== 'custom') return spec;
  const values = Object.fromEntries(
    Object.entries(CUSTOM_FIELDS).map(([key, input]) => [key, input.value]),
  );
  return withCustom(spec, values);
}

/** The page's own language, for sorting country names by it. */
const collator = new Intl.Collator(document.documentElement.lang || 'en');

/** Diacritics folded away, so "turkiye" finds Türkiye. */
const fold = (text) => text.normalize('NFD')
  .replace(/\p{Diacritic}/gu, '').toLowerCase();

/**
 * The country list, narrowed to what was typed.
 *
 * Rebuilt rather than hidden option by option: `option[hidden]` is honoured
 * unevenly and stays reachable from the keyboard in some builds, and thirty
 * options is nothing to build again. The chosen country is emitted whatever the
 * text says - a filter that quietly moved the selection would change which
 * rule the crop box is obeying, silently, while somebody was still typing.
 *
 * Both the rendered name and the endonym are searched, so "Deutschland" finds
 * Germany on the Chinese page and "护照" finds China on the English one.
 */
function buildCountrySelect() {
  const want = fold(el.countryFilter.value.trim());
  const chosen = currentSpec().country;
  const countries = orderedCountries(phrase, collator.compare);
  const matches = want
    ? countries.filter((one) => fold(one.label).includes(want)
      || one.specs.some((spec) => fold(documentLabel(spec, phrase)).includes(want)))
    : countries;

  const shown = matches.some((one) => one.country === chosen)
    ? matches
    : [...matches, ...countries.filter((one) => one.country === chosen)];

  el.country.replaceChildren(...shown.map((one) => {
    const option = document.createElement('option');
    option.value = one.country;
    option.textContent = one.label;
    return option;
  }));
  el.country.value = chosen;

  el.filterNote.textContent = want
    ? phrase(matches.length === 0 ? 'filter.none'
      : matches.length === 1 ? 'filter.one' : 'filter.count',
    { n: matches.length })
    : '';
}

/**
 * One country's documents, as the radio rows under the chooser.
 *
 * A radio each rather than a second menu: a country's documents are two or
 * three things worth reading side by side - 35 x 45 against 50 x 70 - and a
 * menu hides the comparison behind a click. They share a name, so moving
 * between them with the arrow keys is the browser's own behaviour.
 */
function buildDocList() {
  const chosen = currentSpec().country;
  el.docList.replaceChildren(...specsOf(chosen).map((spec) => {
    const label = document.createElement('label');
    label.className = 'mode doc-choice';

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'document';
    radio.id = `doc-${spec.id}`;
    radio.value = spec.id;
    radio.checked = spec.id === specId;
    radio.addEventListener('change', () => {
      if (!radio.checked) return;
      specId = spec.id;
      renderSpec();
      readBackgroundNow();
    });

    const name = document.createElement('strong');
    name.textContent = documentLabel(spec, phrase);

    const size = document.createElement('span');
    size.className = 'doc-size';
    size.textContent = docSize(spec, phrase);

    const text = document.createElement('span');
    text.append(name, size);
    label.append(radio, text);
    return label;
  }));
}

function buildPaperSelect() {
  for (const paper of PAPERS) {
    const option = document.createElement('option');
    option.value = paper.id;
    option.textContent = phrase(paper.label);
    el.paper.append(option);
  }
}

/** The table of figures under the chooser. */
function renderSpec() {
  const spec = currentSpec();

  // The rows are files.js's, because the page each rule has to itself prints
  // the same table and the two must not be able to disagree.
  const facts = specFacts(spec, phrase);

  el.specFacts.replaceChildren(...facts.flatMap(([term, value]) => {
    const dt = document.createElement('dt');
    dt.textContent = term;
    const dd = document.createElement('dd');
    dd.textContent = value;
    return [dt, dd];
  }));

  el.specNotes.replaceChildren(...spec.notes.map((note) => {
    const li = document.createElement('li');
    li.textContent = phrase(note);
    return li;
  }));

  el.specSource.textContent = sourceLine(spec, phrase);

  el.customPanel.hidden = spec.id !== 'custom';
  el.readRules.hidden = spec.id !== 'custom';

  // The signature specification is not a portrait and does not get a portrait's
  // overlay. Saying so on the page is better than showing an eye line for a
  // rule that has never heard of eyes.
  const signature = spec.kind === 'signature';
  el.markHint.hidden = signature;
  el.markModes.hidden = signature;
  el.markNote.hidden = signature;
  el.markWhy.hidden = signature;
  el.fitBox.hidden = signature;
  el.resetMarks.hidden = signature;
  if (signature) marks.hide();
  else if (photo) {
    // Coming back from the signature rule, the dots are still where they were
    // put; they only need showing again.
    if (marks.placed) marks.show();
    else placeMarks();
  }

  el.backgroundLede.textContent = phrase(signature ? 'lede.signature' : 'lede.portrait');

  el.dpiField.hidden = !spec.print;
  el.paperField.hidden = !spec.print;

  el.dpiNote.textContent = spec.print
    ? phrase('dpi.note', {
      floor: spec.print.dpi,
      chosen: el.printDpi.value,
      size: describePrint(spec),
    })
    : '';

  if (photo) {
    cropper.setAspect(frameAspect(spec));
    // Changing the country changes the shape of the box, which throws the old
    // rectangle away. Re-fitting immediately is what makes the chooser feel
    // like a chooser: pick Canada and the box is where Canada wants it, rather
    // than sitting on the whole photograph waiting to be told again.
    if (signature) marks.hide();
    else if (marks.placed) fitToRule();
    refreshFrame();
  }
  renderPaperNote();
}

function describePrint(spec) {
  const pixels = printPixels(spec, Number(el.printDpi.value));
  return pixels ? phrase('print.pixels', { width: pixels.width, height: pixels.height }) : '';
}

function renderPaperNote() {
  const spec = currentSpec();
  if (!spec.print) {
    el.paperNote.textContent = '';
    return;
  }
  const plan = sheetPlan(spec);
  el.paperNote.textContent = phrase('paper.note', { sheet: describeSheet(plan, phrase) });
}

function sheetPlan(spec) {
  return bestSheet({
    photo: { widthMm: spec.print.widthMm, heightMm: spec.print.heightMm },
    paper: paperById(el.paper.value),
    dpi: Number(el.printDpi.value) || spec.print.dpi,
  });
}

/* ------------------------------------------------------------------ adding */

const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles(files) {
    load(files[0]);
  },
  example: makeExample,
});

async function load(file) {
  if (!file || busy) return;
  clearLoadError();
  picker.busy(readingLabel(1));

  try {
    if (!looksLikeImage(file)) throw new Error('load.notimage');
    const decoded = await decode(file);
    clearResults();
    dropPhoto();

    photo = {
      file,
      url: URL.createObjectURL(file),
      bitmap: decoded.bitmap,
      width: decoded.width,
      height: decoded.height,
    };

    el.preview.src = photo.url;
    el.stage.style.aspectRatio = `${photo.width} / ${photo.height}`;
    // Capping the height of a box that has both a width and an aspect ratio is
    // what breaks the ratio, and a stage that is not exactly the shape of the
    // picture puts the crop box over the wrong part of it. So the cap is put on
    // the width, worked out from the height it is meant to produce.
    el.stage.style.maxWidth = `calc(62vh * ${photo.width / photo.height})`;
    el.loadedName.textContent = phrase('load.named',
      { name: file.name, width: photo.width, height: photo.height });
    el.loaded.hidden = false;
    el.frameEmpty.hidden = true;
    el.frameControls.hidden = false;

    cropper.setSource(photo.width, photo.height);
    cropper.setAspect(frameAspect(currentSpec()));
    marks.setSource(photo.width, photo.height);
    if (currentSpec().kind !== 'signature') {
      placeMarks();
      fitToRule();
    }
    refreshFrame();
  } catch (error) {
    // encode.js and geometry.js throw keys; a browser that failed for its own
    // reasons throws a sentence, and phrase() hands back what it does not know.
    showLoadError(phrase('load.failed', { name: file.name, why: phrase(error.message) }));
  } finally {
    picker.done();
  }
}

function looksLikeImage(file) {
  return file.type.startsWith('image/') || /\.(jpe?g|png|webp|bmp|gif|avif|heic)$/i.test(file.name);
}

function dropPhoto() {
  if (!photo) return;
  URL.revokeObjectURL(photo.url);
  release(photo.bitmap);
  photo = null;
}

el.clearPhoto.addEventListener('click', () => {
  clearResults();
  dropPhoto();
  el.preview.removeAttribute('src');
  el.loaded.hidden = true;
  el.frameControls.hidden = true;
  el.frameEmpty.hidden = false;
  el.outcome.hidden = true;
  el.make.disabled = true;
  reading = null;
  lastFinding = null;
  marks.clear();
  renderBackground();
});

/* --------------------------------------------------------------- the marks */

/**
 * Put the four dots somewhere to start from.
 *
 * In 'auto' that means measuring the picture; when there is nothing measurable
 * on it - a patterned wall, no subject - the dots fall back to their opening
 * positions and the note says why, rather than the page pretending the opening
 * positions were a finding.
 */
function placeMarks() {
  if (!photo) return;
  lastFinding = markMode === 'auto' ? detect() : { quality: 'manual', notes: [] };

  if (lastFinding?.marks) marks.place(lastFinding.marks);
  else marks.open();

  renderMarkNote();
}

/**
 * Measure the picture, in the picture's own pixels.
 *
 * The detector reads a small copy - see WORKING_EDGE - so what comes back is in
 * that copy's coordinates and has to be scaled up. The two axes are scaled
 * separately because the small copy's width and height were each rounded on
 * their own, and a single ratio would put every mark a fraction of a per cent
 * out on one of them.
 *
 * Wrapped because this is the one part of the tool that can fail on a picture
 * it has already decoded - a canvas the browser will not hand back pixels for -
 * and a page that stopped dead there would have taken the dragging away too.
 */
function detect() {
  try {
    const pixels = samplePixels(
      photo.bitmap,
      { x: 0, y: 0, width: photo.width, height: photo.height },
      WORKING_EDGE,
    );
    const found = findMarks(pixels);
    if (!found.marks) return found;

    const scaleX = photo.width / pixels.width;
    const scaleY = photo.height / pixels.height;
    return {
      ...found,
      marks: Object.fromEntries(Object.entries(found.marks).map(([key, point]) => [key, {
        x: point.x * scaleX,
        y: point.y * scaleY,
      }])),
    };
  } catch {
    return { marks: null, quality: 'none', notes: ['background'] };
  }
}

/** The line under the switch: what was measured, what was not, and whose the dots are. */
function renderMarkNote() {
  // 'measured', 'rough', 'none', 'manual' or 'edited' - one sentence each, and
  // nothing before a photograph is chosen, when the whole panel is hidden anyway.
  const quality = lastFinding?.quality ?? 'manual';
  el.markNote.textContent = phrase(`marks.${quality}`);

  // Whatever could not be measured, a line each rather than strung into the
  // sentence above. Joining them would have put the separator in this file, and
  // a semicolon is not what half of these languages join a clause with.
  el.markWhy.replaceChildren(...(lastFinding?.notes ?? []).map((note) => {
    const li = document.createElement('li');
    li.textContent = phrase(`marks.why.${note}`);
    return li;
  }));

  // The reset button does whichever of its two jobs matches the switch. One
  // button rather than two, because they are the same button - "put them back
  // where this page would have started them" - and what that means is exactly
  // what the switch has already been asked.
  el.resetMarks.textContent = phrase(
    markMode === 'auto' ? 'marks.button.again' : 'marks.button.back',
  );
}

/* ------------------------------------------------------------- the framing */

function fitToRule() {
  if (!photo || !marks.placed) return;
  const spec = currentSpec();
  const fitted = fitFrame(marks.marks, spec, photo);
  cropper.setRect(fitted.rect);

  const short = fitted.short;
  const missing = Object.entries(short).filter(([, value]) => value > 2);
  el.shortNote.hidden = missing.length === 0;
  if (missing.length) {
    const list = missing
      .map(([side, value]) => phrase('short.side', { value, side: phrase(`side.${side}`) }))
      .reduce((a, b) => phrase('join.list', { a, b }));
    el.shortNote.textContent = phrase('short.note', { list });
  }
}

function onCropChange() {
  refreshFrame();
  // The background reading needs a canvas and a getImageData, which is far too
  // much to do on every frame of a drag. It is worth doing the moment the drag
  // settles, though, because the answer genuinely changes with the crop.
  clearTimeout(backgroundTimer);
  backgroundTimer = setTimeout(readBackgroundNow, 180);
}

/** Redraw the overlay, the checks and everything downstream of the crop box. */
/**
 * The longest side of the live preview, in CSS pixels.
 *
 * A picture of the result rather than the result: 413 x 531 of it on a phone is
 * four times the pixels of the box it is shown in, for a picture nobody is
 * going to measure with a ruler.
 */
const PREVIEW_EDGE = 220;

let previewPending = 0;

/**
 * Redraw the finished photograph, at most once a frame.
 *
 * The cropper reports on every pointer move, so this has to be cheap and it has
 * to coalesce. One drawImage into a canvas that already exists: nothing here
 * encodes, makes an object URL or reads pixels back, which is why it can run
 * during a drag when the background reading two lines below it cannot - that
 * one guards a getImageData and keeps its own debounce.
 */
function drawPreview() {
  if (!photo || previewPending) return;
  previewPending = requestAnimationFrame(() => {
    previewPending = 0;
    if (!photo) return;
    const spec = currentSpec();
    const aspect = frameAspect(spec);
    const height = PREVIEW_EDGE * (window.devicePixelRatio || 1);
    drawCropInto(el.outcomeCanvas, photo.bitmap, cropper.rect, {
      width: Math.round(height * aspect),
      height: Math.round(height),
    }, { background: backgroundOf(spec, phrase).hex });

    // The backing store is in device pixels and the box is in CSS pixels, and
    // the two are only the same number on a screen nobody has any more: left to
    // itself a canvas lays out at its own width, so on a phone the preview came
    // out at two or three times the size it was drawn for.
    el.outcomeCanvas.style.width = `${Math.round(PREVIEW_EDGE * aspect)}px`;
    el.outcomeCanvas.style.height = `${PREVIEW_EDGE}px`;
    el.outcomeSize.textContent = docSize(spec, phrase);
    el.outcome.hidden = false;
  });
}

function refreshFrame() {
  if (!photo) return;
  drawPreview();
  const spec = currentSpec();
  const rect = cropper.rect;

  if (spec.kind === 'signature' || !marks.placed) {
    cropper.setGuides(null);
    el.geometryChecks.replaceChildren();
    el.make.disabled = false;
    lastMetrics = null;
    renderResample(spec, rect);
    renderReady(spec);
    return;
  }

  const metrics = measure(rect, marks.marks, spec);
  lastMetrics = metrics;
  const lines = guideLines(spec);
  const points = marks.marks;

  cropper.setGuides({
    eye: lines.eye,
    head: lines.head,
    marks: {
      crown: (points.crown.y - rect.y) / rect.height,
      chin: (points.chin.y - rect.y) / rect.height,
    },
    pass: { head: metrics.head.status === 'ok', eye: metrics.eye.status === 'ok' },
  });

  const heightMm = spec.print?.heightMm ?? null;
  const rows = [
    [metrics.head, verdictText(metrics.head, 'head', heightMm, phrase)],
    [metrics.eye, verdictText(metrics.eye, 'eye', heightMm, phrase)],
    [metrics.centre, centreText(metrics.centre, phrase)],
    [metrics.tilt, tiltText(metrics.tilt, phrase)],
  ];

  el.geometryChecks.replaceChildren(...rows.map(([check, text]) => checkRow(
    statusClass(check.status, check.advisory), text,
  )));

  renderResample(spec, rect);
  renderReady(spec);
  el.make.disabled = false;
}

function checkRow(status, text) {
  const li = document.createElement('li');
  li.className = `check check-${status}`;
  const mark = document.createElement('span');
  mark.className = 'check-mark';
  mark.textContent = status === 'good' ? '✓' : status === 'warn' ? '!' : '✗';
  const body = document.createElement('span');
  body.textContent = text;
  li.append(mark, body);
  return li;
}

function renderResample(spec, rect) {
  const outputs = [printPixels(spec, Number(el.printDpi.value)), portalPixels(spec)]
    .filter(Boolean);
  if (!outputs.length) {
    el.resampleNote.textContent = '';
    return;
  }
  const largest = outputs.reduce((a, b) => (a.height >= b.height ? a : b));
  el.resampleNote.textContent = resamplingText(resampling(rect, largest), phrase);
}

function renderReady() {
  el.readyLine.textContent = readyText(
    lastMetrics ? passes(lastMetrics) : true,
    reading?.status ?? 'unknown',
    phrase,
  );
}

el.fitBox.addEventListener('click', fitToRule);
el.wholePhoto.addEventListener('click', () => cropper.maximize());
el.resetMarks.addEventListener('click', () => {
  placeMarks();
  fitToRule();
});

for (const radio of [el.modeAuto, el.modeManual]) {
  radio.addEventListener('change', () => {
    if (!radio.checked) return;
    markMode = radio.value;
    // Asking to place them yourself does not move them. They are wherever they
    // were, which after a measurement is a better place to start dragging from
    // than the middle of the picture - and "Put the dots back" is right there
    // for anybody who wanted the plain opening positions.
    if (markMode === 'auto') {
      placeMarks();
      fitToRule();
    } else {
      lastFinding = { quality: 'manual', notes: [] };
      renderMarkNote();
    }
  });
}

/* ---------------------------------------------------------- the background */

function readBackgroundNow() {
  if (!photo) return;
  const spec = currentSpec();
  const pixels = samplePixels(photo.bitmap, cropper.rect);

  if (spec.kind === 'signature') {
    reading = checkSignature(readSignature(pixels));
    reading.found = null;
  } else {
    const read = readBackground(pixels);
    reading = checkBackground(read, backgroundOf(spec, phrase));
    reading.found = read;
  }

  renderBackground();
  renderReady();
}

function renderBackground() {
  const spec = currentSpec();
  const wanted = backgroundOf(spec, phrase);

  if (!reading) {
    el.swatches.hidden = true;
    el.backgroundChecks.replaceChildren();
    el.backgroundNote.textContent = '';
    return;
  }

  el.swatches.hidden = !reading.found;
  if (reading.found) {
    el.swatchFound.style.background = reading.found.hex;
    el.swatchFoundText.textContent = reading.found.hex;
    el.swatchWanted.style.background = wanted.hex;
    el.swatchWantedText.textContent = `${wanted.label} (${wanted.hex})`;
  }

  el.backgroundChecks.replaceChildren(...reading.findings.map(
    (finding) => checkRow(finding.status, phrase(finding.phrase, finding.values)),
  ));

  el.backgroundNote.textContent = spec.kind === 'signature'
    ? phrase('bg.signature.note')
    : phrase('bg.note', { colour: wanted.note });
}

/* ------------------------------------------------------ the rule, as text */

/** A box's name as the page already shows it: the words of its own label,
 *  which are in the reader's language without a phrase of their own. */
function boxName(input) {
  return input.closest('label')?.firstChild?.textContent.replace(/\s+/g, ' ').trim() ?? '';
}

/** What a box now holds: the option's words for the background, the figure
 *  isolated for the rest so that Arabic does not turn "31.5" around. */
function boxValue(input) {
  return input instanceof HTMLSelectElement
    ? input.selectedOptions[0]?.textContent.trim() ?? input.value
    : ltr(input.value);
}

/** A stretch of what was pasted, quoted back in its own direction. */
function quote(text, { from, to }) {
  const q = document.createElement('q');
  q.dir = 'auto';
  q.textContent = text.slice(from, to).replace(/\s+/g, ' ').trim();
  return q;
}

function fieldsLine(...children) {
  const line = document.createElement('span');
  line.className = 'read-fields';
  line.append(...children);
  return line;
}

/**
 * Fill the boxes from the pasted rule, and show where every figure came from.
 *
 * The boxes are filled first and the list drawn from them afterwards, so what
 * the list says is what the boxes hold, in the words and number format the
 * boxes themselves use.
 */
function readRules() {
  const text = el.readText.value;
  if (!text.trim()) {
    el.readResult.hidden = true;
    el.readText.focus();
    return;
  }
  const reading = readRequirements(text);
  for (const { field, value } of reading.found) CUSTOM_FIELDS[field].value = String(value);

  // One entry per stretch of the text, with every box it filled: "35 x 45 mm"
  // is the width and the height.
  const stretches = new Map();
  for (const found of reading.found) {
    const at = [found.from, found.to].join(':');
    if (!stretches.has(at)) stretches.set(at, { from: found.from, to: found.to, fields: [] });
    stretches.get(at).fields.push(found.field);
  }
  el.readFound.replaceChildren(...[...stretches.values()]
    .sort((a, b) => a.from - b.from)
    .map((stretch) => {
      const li = document.createElement('li');
      li.append(quote(text, stretch), fieldsLine(...stretch.fields.map((field) => {
        const box = document.createElement('span');
        const value = document.createElement('b');
        value.textContent = boxValue(CUSTOM_FIELDS[field]);
        box.append(`${boxName(CUSTOM_FIELDS[field])} `, value);
        return box;
      })));
      return li;
    }));

  el.readNotes.replaceChildren(
    ...reading.notes.map((note) => {
      const li = document.createElement('li');
      li.append(`${phrase(note.key)} `, ...note.spans.map((s) => quote(text, s)));
      return li;
    }),
    ...reading.unused.map((unused) => {
      const li = document.createElement('li');
      li.append(quote(text, unused), fieldsLine(phrase(unused.key)));
      return li;
    }),
  );

  const anything = reading.notes.length || reading.unused.length;
  el.readStatus.textContent = phrase(reading.found.length ? 'read.done'
    : anything ? 'read.kept' : 'read.none');
  el.readFound.hidden = !reading.found.length;
  el.readNotes.hidden = !anything;
  el.readResult.hidden = false;

  if (reading.found.length) {
    el.customPanel.open = true;
    renderSpec();
    readBackgroundNow();
  }
}

el.readButton.addEventListener('click', readRules);

/* --------------------------------------------------------------- the files */

el.make.addEventListener('click', run);
el.printDpi.addEventListener('change', () => { renderSpec(); });
el.paper.addEventListener('change', renderPaperNote);
el.countryFilter.addEventListener('input', buildCountrySelect);
el.country.addEventListener('change', () => {
  // Picking a country picks its first document, so the panel is never showing
  // a country whose rule nothing is being measured against.
  const [first] = specsOf(el.country.value);
  if (!first) return;
  specId = first.id;
  buildDocList();
  renderSpec();
  readBackgroundNow();
});
for (const input of Object.values(CUSTOM_FIELDS)) {
  input.addEventListener('change', () => { renderSpec(); readBackgroundNow(); });
}

async function run() {
  if (!photo || busy) return;
  busy = true;
  el.make.disabled = true;
  clearResults();
  showProgress(0, 'cropping');

  const spec = currentSpec();
  const rect = cropper.rect;
  const stem = stemOf(photo.file.name);
  const made = [];

  try {
    const dpi = Number(el.printDpi.value) || spec.print?.dpi || 300;
    let printCanvas = null;

    if (spec.print) {
      const size = printPixels(spec, dpi);
      showProgress(0.15, phrase('step.print',
        { width: trim(spec.print.widthMm), height: trim(spec.print.heightMm) }));
      printCanvas = drawCrop(photo.bitmap, rect, size);
      const { blob } = await encodePrint(printCanvas, { dpi });
      made.push({
        blob,
        pixels: size,
        name: outName(stem, spec, 'print'),
        title: phrase('out.print',
          { width: trim(spec.print.widthMm), height: trim(spec.print.heightMm) }),
        detail: phrase('out.print.detail', {
          width: size.width, height: size.height, size: bytesText(blob.size), dpi,
        }),
      });

      showProgress(0.5, phrase('step.sheet'));
      const plan = sheetPlan(spec);
      if (plan.count > 0) {
        const sheetCanvas = drawSheet(plan, printCanvas);
        const sheet = await encodePrint(sheetCanvas, { dpi, quality: 0.92 });
        free(sheetCanvas);
        made.push({
          blob: sheet.blob,
          pixels: plan.canvas,
          name: outName(stem, spec, 'sheet', { paper: paperById(el.paper.value).id }),
          title: phrase('out.sheet', { paper: phrase(paperById(el.paper.value).label) }),
          detail: phrase('out.sheet.detail', {
            sheet: describeSheet(plan, phrase), size: bytesText(sheet.blob.size), dpi,
          }),
        });
      }
    }

    if (spec.digital) {
      const size = portalPixels(spec);
      // The label goes in as it is written. Lowercasing it is an English habit
      // and a German noun loses its capital to it.
      showProgress(0.75, phrase('step.upload', { label: phrase(spec.digital.label) }));
      const canvas = drawCrop(photo.bitmap, rect, size);
      const band = portalBytes(spec);
      const result = await encodeToBand(canvas, band, phrase);
      free(canvas);
      made.push({
        blob: new Blob([result.bytes], { type: 'image/jpeg' }),
        pixels: size,
        name: outName(stem, spec, 'upload', size),
        title: phrase('out.upload', { width: size.width, height: size.height }),
        detail: phrase(result.encodes === 1 ? 'out.upload.detail.one' : 'out.upload.detail.many', {
          size: bytesText(result.bytes.length), n: result.encodes, how: result.how,
        }),
        warn: !result.fitted,
      });
    }

    if (printCanvas) free(printCanvas);

    showProgress(1, phrase('step.done'));
    renderResults(made);
  } catch (error) {
    showLoadError(phrase('make.failed', { why: phrase(error.message) }));
  } finally {
    busy = false;
    el.make.disabled = false;
    setTimeout(() => { el.progress.hidden = true; }, 600);
  }
}

/**
 * The rows, and the object URLs behind them, dropped together.
 *
 * Before this existed the rows outlived the photograph they were made from:
 * load() revokes the old picture's URL through dropPhoto, and the moment a row
 * holds a picture of its own that left three blank boxes under a heading
 * saying "Finished".
 */
function clearResults() {
  for (const url of resultUrls) URL.revokeObjectURL(url);
  resultUrls = [];
  el.resultList.replaceChildren();
  el.results.hidden = true;
}

function renderResults(made) {
  el.resultList.replaceChildren(...made.map((item) => {
    const url = URL.createObjectURL(item.blob);
    resultUrls.push(url);

    const li = document.createElement('li');
    li.className = `result-row${item.warn ? ' result-warn' : ''}`;

    // The file itself, at its own proportions. The attributes are the real
    // pixel sizes and the CSS normalises on HEIGHT, so a 51 x 51 square and a
    // 35 x 45 portrait are visibly different shapes beside each other - which
    // is the whole of what looking at them is for.
    const thumb = document.createElement('img');
    thumb.className = 'result-thumb';
    thumb.src = url;
    thumb.width = item.pixels.width;
    thumb.height = item.pixels.height;
    thumb.alt = phrase('thumb.alt', { title: item.title });
    thumb.loading = 'lazy';

    const head = document.createElement('p');
    head.className = 'result-title';
    head.textContent = item.title;

    const detail = document.createElement('p');
    detail.className = 'result-detail';
    detail.textContent = item.detail;

    const link = document.createElement('a');
    link.className = 'primary as-button';
    link.href = url;
    link.download = item.name;
    link.textContent = phrase('out.download');

    const name = document.createElement('p');
    name.className = 'result-name';
    name.textContent = item.name;

    const text = document.createElement('div');
    text.className = 'result-text';
    text.append(head, detail, name);

    li.append(thumb, text, link);
    return li;
  }));

  el.results.hidden = made.length === 0;
}

function showProgress(fraction, label) {
  el.progress.hidden = false;
  el.progressBar.style.width = `${Math.round(fraction * 100)}%`;
  el.progressLabel.textContent = label;
}

/* ------------------------------------------------------------------ errors */

/* ------------------------------------------------- privacy panel + offline */

el.privacyToggle.addEventListener('click', () => {
  const open = el.privacyPanel.hidden;
  el.privacyPanel.hidden = !open;
  el.privacyToggle.setAttribute('aria-expanded', String(open));
});

/* -------------------------------------------------------------------- boot */

// An error thrown after boot would otherwise only reach the console, leaving
// the page looking functional but doing nothing.
window.addEventListener('error', (event) => {
  showLoadError(phrase('error.broke', { detail: event.message }));
});
window.addEventListener('unhandledrejection', (event) => {
  showLoadError(phrase('error.broke', { detail: event.reason?.message ?? event.reason }));
});

buildCountrySelect();
buildDocList();
buildPaperSelect();
renderSpec();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
