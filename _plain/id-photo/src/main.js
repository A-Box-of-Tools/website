/** UI wiring and application state. */

import {
  SPECS, backgroundOf, pixelLabel, portalBytes, portalPixels, printLabel,
  specById, specsByCountry, trim, withCustom,
} from './specs.js';
import {
  fitFrame, frameAspect, guideLines, measure, passes, printPixels, resampling,
} from './geometry.js';
import { PAPERS, bestSheet, describeSheet, paperById } from './sheet.js';
import {
  checkBackground, checkSignature, readBackground, readSignature,
} from './background.js';
import {
  decode, drawCrop, drawSheet, encodePrint, encodeToBand, free, release,
  samplePixels, sizeText,
} from './encode.js';
import { Cropper } from './cropper.js';
import { Marks } from './marks.js';
import {
  bandText, centreText, outName, readyText, resamplingText, statusClass, stemOf,
  tiltText, verdictText,
} from './files.js';
import { readingLabel, wireFilePicker } from './shared/file-picker.js';

const $ = (id) => document.getElementById(id);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  loaded: $('loaded'),
  loadedName: $('loaded-name'),
  clearPhoto: $('clear-photo'),
  loadError: $('load-error'),

  specSelect: $('spec'),
  specFacts: $('spec-facts'),
  specNotes: $('spec-notes'),
  specSource: $('spec-source'),
  customPanel: $('custom-panel'),

  frameEmpty: $('frame-empty'),
  frameControls: $('frame-controls'),
  markHint: $('mark-hint'),
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
  networkCount: $('network-count'),
  networkDot: $('network-dot'),
  offlineStatus: $('offline-status'),
  offlineDot: $('offline-dot'),
};

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

let specId = SPECS[0].id;
let busy = false;

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

const cropper = new Cropper(el.stage, { onChange: onCropChange });
const marks = new Marks(el.stage, { onChange: () => refreshFrame() });

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

function buildSpecSelect() {
  for (const group of specsByCountry()) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = group.country;
    for (const spec of group.specs) {
      const option = document.createElement('option');
      option.value = spec.id;
      option.textContent = spec.document;
      optgroup.append(option);
    }
    el.specSelect.append(optgroup);
  }
  el.specSelect.value = specId;
}

function buildPaperSelect() {
  for (const paper of PAPERS) {
    const option = document.createElement('option');
    option.value = paper.id;
    option.textContent = paper.label;
    el.paper.append(option);
  }
}

/** The table of figures under the chooser. */
function renderSpec() {
  const spec = currentSpec();
  const background = backgroundOf(spec);
  const heightMm = spec.print?.heightMm ?? null;

  const facts = [['Print size', printLabel(spec)]];

  // A signature has no head and no eye line, and showing it "0% to 100%" for
  // both would be the panel filling a row rather than stating a rule.
  if (spec.kind !== 'signature') {
    facts.push(
      ['Head, chin to crown', bandText(spec.head, heightMm) + (spec.head.advisory ? ' (guidance)' : '')],
      ['Eye line, from the bottom', bandText(spec.eye, heightMm) + (spec.eye.advisory ? ' (guidance)' : '')],
    );
  }
  facts.push(['Background', background.label]);

  if (spec.digital) {
    const bytes = portalBytes(spec);
    // Not every rule states both ends, and one that states neither must not be
    // reported as "up to Infinity".
    const size = Number.isFinite(bytes.max)
      ? (bytes.min ? `${sizeText(bytes.min)} to ${sizeText(bytes.max)}` : `up to ${sizeText(bytes.max)}`)
      : (bytes.min ? `${sizeText(bytes.min)} and up` : 'no file-size rule stated');
    facts.push([spec.digital.label, `${pixelLabel(spec)}, JPEG, ${size}`]);
  } else {
    facts.push(['Upload rule', 'none published - this one is a print']);
  }

  el.specFacts.replaceChildren(...facts.flatMap(([term, value]) => {
    const dt = document.createElement('dt');
    dt.textContent = term;
    const dd = document.createElement('dd');
    dd.textContent = value;
    return [dt, dd];
  }));

  el.specNotes.replaceChildren(...spec.notes.map((note) => {
    const li = document.createElement('li');
    li.textContent = note;
    return li;
  }));

  el.specSource.textContent = spec.source.checked
    ? `Transcribed from ${spec.source.authority} - ${spec.source.document}. Checked ${spec.source.checked}. `
      + 'Rules change; the figures above are what to check against the form in front of you.'
    : 'Your own figures. Nothing here is checked against anything.';

  el.customPanel.hidden = spec.id !== 'custom';

  // The signature specification is not a portrait and does not get a portrait's
  // overlay. Saying so on the page is better than showing an eye line for a
  // rule that has never heard of eyes.
  const signature = spec.kind === 'signature';
  el.markHint.hidden = signature;
  el.fitBox.hidden = signature;
  el.resetMarks.hidden = signature;
  if (signature) marks.hide();
  else if (photo) {
    // Coming back from the signature rule, the dots are still where they were
    // put; they only need showing again.
    if (marks.placed) marks.show();
    else marks.open();
  }

  el.backgroundLede.textContent = signature
    ? 'A signature is checked differently: that the paper is light, that there is ink '
      + 'on it, and that the crop has not taken in a ruled line or the edge of the page.'
    : 'Read from a band across the top of the crop and down each side, above the '
      + 'shoulders - the parts of the frame that ought to be nothing but background. '
      + 'Measured in CIE Lab rather than in RGB, because two greys forty RGB units '
      + 'apart are indistinguishable and forty units of blue is a different colour.';

  el.dpiField.hidden = !spec.print;
  el.paperField.hidden = !spec.print;

  el.dpiNote.textContent = spec.print
    ? `${spec.print.dpi} dpi is this rule's floor. At ${el.printDpi.value} dpi the file `
      + `comes out ${describePrint(spec)}, and the JPEG carries that resolution in its `
      + 'header, so a print shop prints it at the right size rather than guessing.'
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
  return pixels ? `${pixels.width} x ${pixels.height} pixels` : '';
}

function renderPaperNote() {
  const spec = currentSpec();
  if (!spec.print) {
    el.paperNote.textContent = '';
    return;
  }
  const plan = sheetPlan(spec);
  el.paperNote.textContent = `${describeSheet(plan)}, with cut marks in the gaps and `
    + 'nothing printed over a photograph.';
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
});

async function load(file) {
  if (!file || busy) return;
  clearLoadError();
  picker.busy(readingLabel(1));

  try {
    if (!looksLikeImage(file)) throw new Error('that is not an image this browser can open.');
    const decoded = await decode(file);
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
    el.loadedName.textContent = `${file.name} - ${photo.width} x ${photo.height} pixels`;
    el.loaded.hidden = false;
    el.frameEmpty.hidden = true;
    el.frameControls.hidden = false;

    cropper.setSource(photo.width, photo.height);
    cropper.setAspect(frameAspect(currentSpec()));
    marks.setSource(photo.width, photo.height);
    if (currentSpec().kind !== 'signature') {
      marks.open();
      fitToRule();
    }
    refreshFrame();
  } catch (error) {
    showLoadError(`${file.name}: ${error.message}`);
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
  dropPhoto();
  el.preview.removeAttribute('src');
  el.loaded.hidden = true;
  el.frameControls.hidden = true;
  el.frameEmpty.hidden = false;
  el.results.hidden = true;
  el.make.disabled = true;
  reading = null;
  marks.clear();
  renderBackground();
});

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
    const parts = missing.map(([side, value]) => `${value} px at the ${side}`);
    el.shortNote.textContent = `The rule wanted more picture than there is: ${parts.join(', ')}. `
      + 'The box has been kept inside the photograph instead, which is why the figures '
      + 'below may not all be green. A photo taken a step further back is the fix.';
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
function refreshFrame() {
  if (!photo) return;
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
    [metrics.head, verdictText(metrics.head, 'Head height', heightMm)],
    [metrics.eye, verdictText(metrics.eye, 'Eye line', heightMm)],
    [metrics.centre, centreText(metrics.centre)],
    [metrics.tilt, tiltText(metrics.tilt)],
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
  el.resampleNote.textContent = resamplingText(resampling(rect, largest));
}

function renderReady() {
  el.readyLine.textContent = readyText(
    lastMetrics ? passes(lastMetrics) : true,
    reading?.status ?? 'unknown',
  );
}

el.fitBox.addEventListener('click', fitToRule);
el.wholePhoto.addEventListener('click', () => cropper.maximize());
el.resetMarks.addEventListener('click', () => {
  marks.open();
  fitToRule();
});

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
    reading = checkBackground(read, backgroundOf(spec));
    reading.found = read;
  }

  renderBackground();
  renderReady();
}

function renderBackground() {
  const spec = currentSpec();
  const wanted = backgroundOf(spec);

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
    (finding) => checkRow(finding.status, finding.text),
  ));

  el.backgroundNote.textContent = spec.kind === 'signature'
    ? 'Nothing here changes your signature. It is measured and reported, and the crop '
      + 'is yours to move.'
    : `${wanted.note} This tool will not replace a background: cutting a person out of a `
      + 'photograph needs a segmentation model, and a bad one eats the hair of exactly '
      + 'the people whose photographs already get rejected most often. Standing a foot '
      + 'further from the wall fixes more of these than any filter would.';
}

/* --------------------------------------------------------------- the files */

el.make.addEventListener('click', run);
el.printDpi.addEventListener('change', () => { renderSpec(); });
el.paper.addEventListener('change', renderPaperNote);
el.specSelect.addEventListener('change', () => {
  specId = el.specSelect.value;
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
  el.results.hidden = true;
  showProgress(0, 'cropping');

  for (const url of resultUrls) URL.revokeObjectURL(url);
  resultUrls = [];

  const spec = currentSpec();
  const rect = cropper.rect;
  const stem = stemOf(photo.file.name);
  const made = [];

  try {
    const dpi = Number(el.printDpi.value) || spec.print?.dpi || 300;
    let printCanvas = null;

    if (spec.print) {
      const size = printPixels(spec, dpi);
      showProgress(0.15, `writing the ${trim(spec.print.widthMm)} x ${trim(spec.print.heightMm)} mm print`);
      printCanvas = drawCrop(photo.bitmap, rect, size);
      const { blob } = await encodePrint(printCanvas, { dpi });
      made.push({
        blob,
        name: outName(stem, spec, 'print'),
        title: `The print - ${trim(spec.print.widthMm)} x ${trim(spec.print.heightMm)} mm`,
        detail: `${size.width} x ${size.height} pixels, ${sizeText(blob.size)}, tagged ${dpi} dpi `
          + 'in the file itself so a print shop reproduces it at the right size.',
      });

      showProgress(0.5, 'laying out the sheet');
      const plan = sheetPlan(spec);
      if (plan.count > 0) {
        const sheetCanvas = drawSheet(plan, printCanvas);
        const sheet = await encodePrint(sheetCanvas, { dpi, quality: 0.92 });
        free(sheetCanvas);
        made.push({
          blob: sheet.blob,
          name: outName(stem, spec, 'sheet', { paper: paperById(el.paper.value).id }),
          title: `The sheet - ${paperById(el.paper.value).label}`,
          detail: `${describeSheet(plan)}, ${sizeText(sheet.blob.size)}, tagged ${dpi} dpi. `
            + 'Print it at 100 per cent - "fit to page" is what makes a sheet come out '
            + 'the wrong size.',
        });
      }
    }

    if (spec.digital) {
      const size = portalPixels(spec);
      showProgress(0.75, `squeezing to ${spec.digital.label.toLowerCase()}`);
      const canvas = drawCrop(photo.bitmap, rect, size);
      const band = portalBytes(spec);
      const result = await encodeToBand(canvas, band);
      free(canvas);
      made.push({
        blob: new Blob([result.bytes], { type: 'image/jpeg' }),
        name: outName(stem, spec, 'upload', size),
        title: `The upload - ${size.width} x ${size.height}`,
        detail: `${sizeText(result.bytes.length)} after ${result.encodes} `
          + `${result.encodes === 1 ? 'encode' : 'encodes'}. ${result.how}`,
        warn: !result.fitted,
      });
    }

    if (printCanvas) free(printCanvas);

    showProgress(1, 'done');
    renderResults(made);
  } catch (error) {
    showLoadError(`Something went wrong making the files: ${error.message}`);
  } finally {
    busy = false;
    el.make.disabled = false;
    setTimeout(() => { el.progress.hidden = true; }, 600);
  }
}

function renderResults(made) {
  el.resultList.replaceChildren(...made.map((item) => {
    const url = URL.createObjectURL(item.blob);
    resultUrls.push(url);

    const li = document.createElement('li');
    li.className = `result-row${item.warn ? ' result-warn' : ''}`;

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
    link.textContent = 'Download';

    const name = document.createElement('p');
    name.className = 'result-name';
    name.textContent = item.name;

    const text = document.createElement('div');
    text.className = 'result-text';
    text.append(head, detail, name);

    li.append(text, link);
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
 * carries ads - but "nothing has carried your photograph away". That is the
 * part that matters, and the part a sceptical visitor can watch hold in real
 * time. It matters more here than on most of these tools: a passport photograph
 * is a picture of somebody's face attached to the name of the country whose
 * document they are applying for.
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
      : ` The page's own ad, measurement and donate-button scripts loaded from ${platform.size} host${platform.size === 1 ? '' : 's'}; not one of them was given a photograph or a byte of one.`;

    el.networkCount.textContent = clean
      ? `your photographs have gone nowhere. ${total} files loaded, all of them this page's own.${platformNote}`
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

/* -------------------------------------------------------------------- boot */

// An error thrown after boot would otherwise only reach the console, leaving
// the page looking functional but doing nothing.
window.addEventListener('error', (event) => {
  showLoadError(`Something broke: ${event.message}. Reload the page to start over.`);
});
window.addEventListener('unhandledrejection', (event) => {
  showLoadError(`Something broke: ${event.reason?.message ?? event.reason}. Reload the page to start over.`);
});

buildSpecSelect();
buildPaperSelect();
renderSpec();
monitorNetwork();
registerServiceWorker();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
