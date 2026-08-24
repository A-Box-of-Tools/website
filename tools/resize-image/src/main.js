/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import {
  decode, encodableTypes, keepFormat, release, render as renderImage,
  FORMATS, JPEG, PNG, WEBP, READABLE,
} from './codecs.js';
import {
  fromFractions, isUntouched, parseRatio, plan, ratioCrop, toFractions, wholeOf,
} from './geometry.js';
import { Cropper } from './cropper.js';
import { wireFilePicker, readingLabel } from './shared/file-picker.js';
import {
  bytes as humanBytes, change, countOf, describePlan, dimensions, outName, scaleText,
} from './files.js';
import { makeZip } from './shared/zip.js';

const $ = (id) => document.getElementById(id);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  fileList: $('file-list'),
  listToolbar: $('list-toolbar'),
  countLabel: $('count-label'),
  clearAll: $('clear-all'),
  loadError: $('load-error'),

  cropEmpty: $('crop-empty'),
  cropControls: $('crop-controls'),
  stage: $('stage'),
  stageName: $('stage-name'),
  preview: $('preview'),
  stageNote: $('stage-note'),
  aspectRow: $('aspect-row'),
  swapAspect: $('swap-aspect'),
  cropX: $('crop-x'),
  cropY: $('crop-y'),
  cropW: $('crop-w'),
  cropH: $('crop-h'),
  cropMax: $('crop-max'),
  cropCentre: $('crop-centre'),
  cropReset: $('crop-reset'),
  applyRow: $('apply-row'),
  applyNote: $('apply-note'),
  cropApplyAll: $('crop-apply-all'),

  resizeMode: $('resize-mode'),
  pixelsFields: $('pixels-fields'),
  longestFields: $('longest-fields'),
  percentFields: $('percent-fields'),
  sizeW: $('size-w'),
  sizeH: $('size-h'),
  swapSize: $('swap-size'),
  sizePresets: $('size-presets'),
  fitRow: $('fit-row'),
  fit: $('fit'),
  sizeLongest: $('size-longest'),
  longestPresets: $('longest-presets'),
  sizePercent: $('size-percent'),
  percentPresets: $('percent-presets'),
  enlargeRow: $('enlarge-row'),
  noEnlarge: $('no-enlarge'),
  sizeSummary: $('size-summary'),

  format: $('format'),
  formatNote: $('format-note'),
  qualityField: $('quality-field'),
  quality: $('quality'),
  qualityValue: $('quality-value'),
  background: $('background'),
  planSummary: $('plan-summary'),

  run: $('run'),
  progress: $('progress'),
  progressBar: $('progress-bar'),
  progressLabel: $('progress-label'),
  results: $('results'),
  resultList: $('result-list'),
  downloadZip: $('download-zip'),
  resultsSummary: $('results-summary'),

  viewer: $('viewer'),
  viewerName: $('viewer-name'),
  viewerClose: $('viewer-close'),
  viewerImage: $('viewer-image'),
  viewerCaption: $('viewer-caption'),
  viewerFacts: $('viewer-facts'),
  viewerCompare: $('viewer-compare'),
  viewerDownload: $('viewer-download'),

  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
  networkCount: $('network-count'),
  networkDot: $('network-dot'),
  offlineStatus: $('offline-status'),
  offlineDot: $('offline-dot'),
};

/**
 * @typedef {object} Item
 * @property {number} id
 * @property {File} file
 * @property {string} thumbUrl an object URL, revoked when the item is dropped
 * @property {{width: number, height: number}|null} size in pixels
 * @property {{x: number, y: number, width: number, height: number}} crop
 *   this image's own box, in its own pixels. Opens on the whole picture, so an
 *   image nobody has drawn on is not cropped at all.
 * @property {string} aspectKey which shape its box is locked to, if any
 */

/** @type {Item[]} */
let items = [];
let nextId = 1;
let busy = false;

/** Which image the crop box is currently drawn on. Only the preview: every
 *  image carries its own box, so this decides what you are looking at and
 *  nothing about what the others get. */
let referenceId = null;

/** Everything the run produced, kept so the rows can be redrawn and the zip
 *  built without encoding anything twice. */
let results = [];

/** Object URLs handed to download links and result previews. Revoked as a set
 *  when the results are replaced; holding a dozen decoded copies of somebody's
 *  photo library alive is how a browser tab ends up using two gigabytes. */
let resultUrls = [];

/** Which formats this browser will actually write. Filled in at boot. */
let writable = new Set([JPEG, PNG]);

/** Set while the preview is being pointed at another image. The three calls
 *  that do it each move the box, and none of those movements is the visitor
 *  editing a crop - so they must not overwrite one, and must not throw away
 *  results that are still perfectly true of the files that produced them. */
let loadingPreview = false;

const cropper = new Cropper(el.stage, {
  onChange(rect) {
    writeCropFields(rect);
    if (loadingPreview) return;

    const reference = referenceItem();
    if (reference?.size) reference.crop = rect;
    clearResults();
    // Everything a moved box changes, and nothing else. This runs on every
    // pointermove of a drag, so the file list is updated in place rather than
    // rebuilt - recreating a dozen <img> thumbnails sixty times a second is
    // how a smooth drag turns into a flickering one.
    refreshOutcomes();
    renderCropCard();
    renderSummaries();
  },
});

/* ------------------------------------------------------------------ adding */

// The drop zone and the picker: shared, because every tool here needs the
// same one. src/shared/file-picker.js, copied in from shared/js/ by the
// build. The resting label comes off the markup, so it is written once,
// in this tool.toml, rather than here as well.
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
      if (!isImage(file)) {
        failures.push(`${file.name}: not an image this tool can read.`);
        continue;
      }

      const item = {
        id: nextId,
        file,
        thumbUrl: URL.createObjectURL(file),
        size: null,
        crop: null,
        aspectKey: 'free',
      };
      nextId += 1;

      // The thumbnail decode doubles as the measurement, so the picture is
      // read once here and not again until it is actually processed.
      item.size = await measure(item.thumbUrl);
      if (!item.size) {
        URL.revokeObjectURL(item.thumbUrl);
        failures.push(`${file.name}: this browser could not decode it.`);
        continue;
      }

      // The box opens on the whole picture. That is what makes cropping the
      // default without making it something that happens to you: the step is
      // always there, and until you drag it, it takes nothing off.
      item.crop = wholeOf(item.size);
      items.push(item);
    }
  } finally {
    picker.done();
  }

  if (failures.length) showLoadError(failures.join('\n'));
  else clearLoadError();

  clearResults();
  ensureReference();
  render();
}

/** Types the browser is likely to decode. An empty type means the platform did
 *  not recognise the file; the decode below is the real test either way. */
function isImage(file) {
  if (!file.type) return /\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(file.name);
  return READABLE.includes(file.type) || file.type.startsWith('image/');
}

/** Read a picture's pixel size without keeping the decoded image around. */
function measure(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function removeItem(id) {
  const at = items.findIndex((i) => i.id === id);
  if (at < 0) return;
  URL.revokeObjectURL(items[at].thumbUrl);
  items.splice(at, 1);
  clearResults();
  ensureReference();
  render();
}

el.clearAll.addEventListener('click', () => {
  for (const item of items) URL.revokeObjectURL(item.thumbUrl);
  items = [];
  clearResults();
  clearLoadError();
  ensureReference();
  render();
});

/* -------------------------------------------------------- the crop preview */

const referenceItem = () => items.find((i) => i.id === referenceId) ?? null;

/**
 * Point the preview at an image, and load that image's own box into it.
 *
 * Nothing is carried across. Each image owns its rectangle, in its own pixels,
 * so moving the preview from one to another puts back exactly the box that was
 * left there - including the shape it was locked to, so the buttons under the
 * preview describe what you are looking at rather than what you last pressed.
 */
function ensureReference() {
  if (!items.some((i) => i.id === referenceId)) referenceId = items[0]?.id ?? null;

  const reference = referenceItem();
  if (!reference?.size) return;

  el.preview.src = reference.thumbUrl;
  el.preview.alt = `Preview of ${reference.file.name}`;
  el.stage.style.aspectRatio = `${reference.size.width} / ${reference.size.height}`;
  // Capped by width rather than by height. See the note beside .stage in
  // styles.css: a max-height on a box that has a width and a ratio breaks the
  // ratio, and the crop box would then sit over the wrong part of the picture.
  el.stage.style.maxWidth = `calc(62vh * ${reference.size.width / reference.size.height})`;

  // Source, then shape, then rectangle. The shape has to be in place before
  // the rectangle so that a later drag is constrained the way the buttons say
  // it is; the rectangle goes in last because setting a shape moves the box.
  loadingPreview = true;
  try {
    cropper.setSource(reference.size.width, reference.size.height);
    cropper.setAspect(aspectValue(reference.aspectKey, reference));
    cropper.setRect(reference.crop);
  } finally {
    loadingPreview = false;
  }
  markAspect();
}

function showItem(id) {
  if (id === referenceId || busy) return;
  referenceId = id;
  ensureReference();
  render();
}

/* --------------------------------------------------------------- rendering */

/*
  Everything below builds DOM nodes and sets textContent. Nothing that came out
  of a file - a name above all - is ever put through innerHTML. File names are
  chosen by whoever made the file, and some of them contain markup precisely
  because pages like this one exist.
*/

function render() {
  const any = items.length > 0;
  el.listToolbar.hidden = !any;
  // Held off during a run for the same reason each row's remove button is: the
  // run iterates the list, and emptying it mid-way would hand back results for
  // files whose thumbnails have already been revoked.
  el.clearAll.disabled = busy;
  el.countLabel.textContent = any
    ? `${countOf(items.length)}, ${humanBytes(totalBytes())} in total`
    : '';

  renderList();
  renderCropCard();
  renderSizeFields();
  renderFormatFields();
  renderSummaries();

  el.run.disabled = !any || busy;
  el.run.textContent = items.length === 1 ? 'Resize the image' : 'Resize the images';
}

const totalBytes = () => items.reduce((n, i) => n + i.file.size, 0);

function renderList() {
  el.fileList.replaceChildren();

  const choosable = items.length > 1;

  for (const item of items) {
    const li = document.createElement('li');
    li.className = 'file-row';
    const shown = item.id === referenceId && choosable;
    if (shown) li.classList.add('file-shown');

    // The whole row is the control that points the preview at this image.
    // There used to be a "Show"/"Shown" button on the end, and the two words
    // were a letter apart at the same size in the same place - so the one that
    // did nothing looked exactly like the one that did something. The row
    // being the target is a larger, more obvious hit area, and the state is
    // now said by the row's own appearance rather than by a verb.
    //
    // A <div> rather than a <button> when there is only one image: a control
    // that cannot do anything should not be reachable by keyboard and should
    // not announce itself to a screen reader as a thing to press.
    const main = document.createElement(choosable ? 'button' : 'div');
    main.className = 'file-main-wrap';
    if (choosable) {
      main.type = 'button';
      main.setAttribute('aria-pressed', String(shown));
      main.title = shown
        ? `${item.file.name} is the one in the crop preview`
        : `Draw the crop box on ${item.file.name}`;
      main.disabled = busy;
      main.addEventListener('click', () => showItem(item.id));
    }

    const thumb = document.createElement('img');
    thumb.className = 'file-thumb';
    thumb.src = item.thumbUrl;
    thumb.alt = '';
    main.appendChild(thumb);

    const text = document.createElement('div');
    text.className = 'file-main';

    const name = document.createElement('p');
    name.className = 'file-name';
    name.textContent = item.file.name;
    text.appendChild(name);

    const sub = document.createElement('p');
    sub.className = 'file-sub';
    sub.textContent = [
      FORMATS[item.file.type]?.label ?? (item.file.type || 'image').replace('image/', '').toUpperCase(),
      humanBytes(item.file.size),
      item.size ? dimensions(item.size.width, item.size.height) : null,
    ].filter(Boolean).join(' · ');
    text.appendChild(sub);

    if (item.size) {
      const note = document.createElement('p');
      paintOutcome(note, previewOf(item));
      text.appendChild(note);
    }

    main.appendChild(text);

    // The badge only ever appears on the row that is showing, so there is no
    // pair of near-identical words to tell apart at a glance.
    if (shown) {
      const badge = document.createElement('span');
      badge.className = 'file-badge';
      badge.textContent = 'In the preview';
      main.appendChild(badge);
    }

    li.appendChild(main);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'row-remove';
    remove.title = `Take ${item.file.name} off the list`;
    remove.setAttribute('aria-label', `Take ${item.file.name} off the list`);
    remove.textContent = '×';
    remove.disabled = busy;
    remove.addEventListener('click', () => removeItem(item.id));
    li.appendChild(remove);

    el.fileList.appendChild(li);
  }
}

/** What one row is about to become, on the row itself. */
function paintOutcome(node, outcome) {
  node.className = outcome.untouched ? 'file-note' : 'file-outcome';
  node.textContent = outcome.untouched
    ? 'Nothing is being changed, so this one is passed through exactly as it is.'
    : `becomes ${dimensions(outcome.canvas.width, outcome.canvas.height)}`;
}

/** The same lines again, without rebuilding the rows they sit in. */
function refreshOutcomes() {
  const rows = el.fileList.children;
  items.forEach((item, index) => {
    const node = rows[index]?.querySelector('.file-outcome, .file-note');
    if (node && item.size) paintOutcome(node, previewOf(item));
  });
}

function renderCropCard() {
  const reference = referenceItem();

  el.cropEmpty.hidden = Boolean(items.length);
  el.cropControls.hidden = !reference;
  cropper.setEnabled(Boolean(reference) && !busy);

  if (!reference) {
    el.stageNote.hidden = true;
    return;
  }

  const others = items.filter((i) => i.id !== referenceId);
  el.stageName.textContent = others.length ? `Drawing on ${reference.file.name}. ` : '';
  el.applyRow.hidden = !others.length;
  el.applyNote.textContent = others.length
    ? applyNoteText(reference, others.length)
    : '';

  // Said only when there is another image it could be true of, rather than as
  // a standing disclaimer nobody reads.
  if (!others.length) {
    el.stageNote.hidden = true;
    return;
  }

  el.stageNote.hidden = false;
  el.stageNote.textContent = `Every image keeps its own box. ${othersNoteText(others)}`;
}

/** How many of the others have actually been cropped, said as a sentence. */
function othersNoteText(others) {
  const cropped = others.filter(isCropped);

  if (others.length === 1) {
    return cropped.length
      ? `${others[0].file.name} has a box of its own.`
      : `${others[0].file.name} is still on the whole picture - pick it from the list above to crop that one too.`;
  }

  if (!cropped.length) {
    return `The other ${countOf(others.length)} are still on the whole picture - pick one from `
      + 'the list above to crop it.';
  }

  if (cropped.length === others.length) {
    return others.length === 2
      ? 'Both of the others have a box of their own.'
      : `All ${others.length} of the others have a box of their own.`;
  }

  return `${cropped.length} of the other ${others.length} ${cropped.length === 1 ? 'has' : 'have'} `
    + 'a box of its own; the rest are still on the whole picture.';
}

/** What the "use this crop on every image" button is about to do. */
function applyNoteText(reference, count) {
  const same = items.every((i) => i.size
    && i.size.width === reference.size.width && i.size.height === reference.size.height);

  if (same) {
    return `Every image on the list is exactly this size, so ${count === 1 ? 'the other one gets' : 'they all get'} `
      + 'exactly this box.';
  }

  return reference.aspectKey === 'free'
    ? 'The same relative area on each - the same fractions of its own width and height - because '
      + 'they are not all the same size.'
    : `The largest ${aspectLabel(reference.aspectKey)} box that fits the same relative area of each, `
      + 'so every result comes out the shape you locked even though they are not all the same size.';
}

/** Has anything actually been taken off this picture? */
function isCropped(item) {
  return Boolean(item.size && item.crop
    && (item.crop.width !== item.size.width || item.crop.height !== item.size.height));
}

/** The locked shape, in the words on the button that set it. */
function aspectLabel(key) {
  return key === 'source' ? "picture's own shape" : key;
}

function renderSizeFields() {
  const mode = el.resizeMode.value;
  el.pixelsFields.hidden = mode !== 'pixels';
  el.longestFields.hidden = mode !== 'longest';
  el.percentFields.hidden = mode !== 'percent';

  // A fit reconciles two numbers that disagree. With one side blank there is
  // nothing to reconcile, and with no resize at all there is nothing to fit.
  const both = Boolean(field(el.sizeW) && field(el.sizeH));
  el.fitRow.hidden = mode !== 'pixels' || !both;

  // A percentage above 100 is an enlargement somebody typed on purpose, so the
  // question does not arise there.
  el.enlargeRow.hidden = mode === 'none' || mode === 'percent';
}

function renderFormatFields() {
  const choice = el.format.value;

  // PNG has no quality dial at all, so the slider would be a control that does
  // nothing. Every other choice can reach a lossy encoder.
  el.qualityField.hidden = choice === PNG;
  el.qualityValue.textContent = el.quality.value;

  const note = {
    keep: 'A JPEG stays a JPEG, a PNG stays a PNG. Anything this browser cannot write - a GIF, a BMP - comes out as PNG, which keeps transparency and flat colour.',
    [JPEG]: 'Small and universal, and no transparency: anything see-through is filled with the background colour.',
    [PNG]: 'Lossless and transparent, and much larger than the other two on a photograph.',
    [WEBP]: 'Smaller than JPEG at the same quality, keeps transparency, and every current browser opens it.',
  }[choice] ?? '';

  el.formatNote.textContent = note;
}

/**
 * The two sentences that say what is about to happen.
 *
 * Both are worked out from the same plan the encoder is handed, so the page
 * cannot describe one thing and do another. The reference image is used for
 * the exact numbers because it is the one on screen; the batch note carries
 * the rest.
 */
function renderSummaries() {
  const reference = referenceItem();

  if (!reference?.size) {
    el.sizeSummary.textContent = 'Add an image and this will say exactly what it becomes.';
    el.planSummary.textContent = '';
    return;
  }

  const outcome = previewOf(reference);
  const crop = outcome.crop;
  const cropped = crop.width !== reference.size.width || crop.height !== reference.size.height;
  const name = reference.file.name;

  if (outcome.untouched) {
    el.sizeSummary.textContent = `Nothing is being changed: ${name} is `
      + `${dimensions(reference.size.width, reference.size.height)} and comes back exactly as it `
      + 'went in, byte for byte.';
  } else {
    const from = cropped ? 'of what the box keeps' : 'of the original';
    const scale = outcome.scale > 1
      ? `enlarged to ${scaleText(outcome.scale)} ${from}`
      : `${scaleText(outcome.scale)} ${from}`;

    el.sizeSummary.textContent = `${name} is ${dimensions(reference.size.width, reference.size.height)}.`
      + (cropped ? ` The box keeps ${dimensions(crop.width, crop.height)} of it.` : '')
      + ` It comes out ${dimensions(outcome.canvas.width, outcome.canvas.height)}`
      + (outcome.padded
        ? ` - the picture at ${scale}, on a background filling the rest of that frame.`
        : ` - ${scale}.`);
  }

  // The numbers above belong to the picture on screen, so the sentence that
  // generalises to the rest of the batch says whose numbers they were rather
  // than claiming every file comes out the same size. They do not: the size
  // and format settings are shared, and every crop is the image's own.
  const mime = outputMime(reference.file.type);
  const rest = items.length === 1
    ? ''
    : items.length === 2
      ? ' The other image gets the same size and format settings, with its own crop.'
      : ` The other ${countOf(items.length - 1)} get the same size and format settings, each with its own crop.`;

  // "Nothing is being changed" is only true of the whole batch when it is true
  // of every file in it - one image with a box drawn on it is a change, even
  // if the one in the preview has none.
  const nothingAtAll = el.format.value === 'keep'
    && items.every((i) => i.size && previewOf(i).untouched);

  el.planSummary.textContent = nothingAtAll
    ? 'Nothing is cropped, nothing is resized and the format is unchanged, so there is nothing '
      + 'to re-encode: every file is handed straight back byte for byte, EXIF tags and all, '
      + 'because none of them is ever opened up.'
    : `${items.length === 1 ? 'The image is' : `${name} is`} `
      + `${describePlan(reference.size, crop, outcome, mime).replace(/\.$/, '')}`
      + ` - and the EXIF and GPS tags do not survive, because a canvas holds pixels and nothing else.${rest}`;
}

/* ------------------------------------------------------------- the options */

/*
  Any change to the settings throws away the results below.

  It costs somebody a download link they might still have wanted, and it is
  still the right call: the sentences above the button say things like "it comes
  out 1920 x 1080", and leaving a result on screen beside a sentence that is no
  longer true of it would be the one dishonest line on the page.
*/
const settled = () => {
  clearResults();
  render();
};

el.resizeMode.addEventListener('change', settled);
el.format.addEventListener('change', settled);
el.fit.addEventListener('change', settled);
el.noEnlarge.addEventListener('change', settled);
el.background.addEventListener('change', settled);

for (const control of [el.sizeW, el.sizeH, el.sizeLongest, el.sizePercent]) {
  control.addEventListener('input', settled);
}

el.quality.addEventListener('input', () => {
  el.qualityValue.textContent = el.quality.value;
  clearResults();
});

el.swapSize.addEventListener('click', () => {
  const width = el.sizeW.value;
  el.sizeW.value = el.sizeH.value;
  el.sizeH.value = width;
  settled();
});

el.sizePresets.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-w]');
  if (!button) return;
  el.sizeW.value = button.dataset.w;
  el.sizeH.value = button.dataset.h;
  settled();
});

el.longestPresets.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-longest]');
  if (!button) return;
  el.sizeLongest.value = button.dataset.longest;
  settled();
});

el.percentPresets.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-percent]');
  if (!button) return;
  el.sizePercent.value = button.dataset.percent;
  settled();
});

/* ---------------------------------------------------------- the crop box */

el.aspectRow.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-aspect]');
  if (!button) return;
  applyAspect(button.dataset.aspect);
});

/** Turn the locked shape on its side: 16:9 becomes 9:16. */
el.swapAspect.addEventListener('click', () => {
  const reference = referenceItem();
  if (!reference || !cropper.aspect) return;
  applyAspect(flipKey(reference.aspectKey));
});

const flipKey = (key) => {
  const pair = key.match(/^(\d+):(\d+)$/);
  return pair ? `${pair[2]}:${pair[1]}` : key;
};

/** Which shape a key means, for one particular picture. "Original" is the only
 *  one that depends on the picture, and it is the reason this takes an item. */
function aspectValue(key, item) {
  if (key === 'source') return item.size.width / item.size.height;
  return key === 'free' ? null : parseRatio(key);
}

/** The shape the visitor pressed, applied to the image on screen and stored on
 *  it - so coming back to this picture later finds the same lock still on. */
function applyAspect(key) {
  const reference = referenceItem();
  if (!reference?.size) return;

  reference.aspectKey = key;
  markAspect();
  cropper.setAspect(aspectValue(key, reference));
}

function markAspect() {
  const key = referenceItem()?.aspectKey ?? 'free';
  for (const button of el.aspectRow.querySelectorAll('button[data-aspect]')) {
    const active = button.dataset.aspect === key;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  }
  el.swapAspect.disabled = !/^\d+:\d+$/.test(key);
}

for (const control of [el.cropX, el.cropY, el.cropW, el.cropH]) {
  control.addEventListener('change', () => {
    cropper.setRect({
      x: Number(el.cropX.value) || 0,
      y: Number(el.cropY.value) || 0,
      width: Number(el.cropW.value) || 1,
      height: Number(el.cropH.value) || 1,
    });
  });
}

el.cropMax.addEventListener('click', () => cropper.maximize());
el.cropCentre.addEventListener('click', () => cropper.centre());
el.cropReset.addEventListener('click', () => {
  applyAspect('free');
  cropper.reset();
});

/**
 * Put this box on every other image as well.
 *
 * Each image owning its own rectangle is the point of the step, and it would
 * be a poor trade if a folder of exports that all want the same framing cost
 * one drag each. So this is the one place the old batch rule survives, now as
 * something asked for rather than something that happens: every other image
 * takes the same relative area - the same fractions of its own width and
 * height - and, if a shape is locked, the largest box of that shape inside it,
 * because somebody who pressed 1:1 wants squares.
 */
el.cropApplyAll.addEventListener('click', () => {
  const reference = referenceItem();
  if (!reference?.size || busy) return;

  const fractions = toFractions(reference.crop, reference.size);

  for (const item of items) {
    if (item.id === reference.id || !item.size) continue;
    const rect = fromFractions(fractions, item.size);
    item.aspectKey = reference.aspectKey;
    const aspect = aspectValue(reference.aspectKey, item);
    item.crop = aspect ? ratioCrop(rect, aspect) : rect;
  }

  clearResults();
  render();
});

function writeCropFields(rect) {
  el.cropX.value = String(rect.x);
  el.cropY.value = String(rect.y);
  el.cropW.value = String(rect.width);
  el.cropH.value = String(rect.height);
}

/* ------------------------------------------------------------- the plan */

/** A number field, or null when it is blank - which means "work it out". */
function field(input) {
  const value = Number.parseFloat(input.value);
  return Number.isFinite(value) && value >= 1 ? Math.round(value) : null;
}

/** The settings, read off the page once so every caller sees the same ones. */
function resizeSettings() {
  return {
    mode: el.resizeMode.value,
    width: field(el.sizeW),
    height: field(el.sizeH),
    fit: el.fit.value,
    longest: field(el.sizeLongest) ?? 1,
    percent: Number.parseFloat(el.sizePercent.value) || 100,
    noEnlarge: el.noEnlarge.checked,
  };
}

/**
 * The crop for one image: its own box.
 *
 * There is no shared rectangle and no reference image any more. Each item owns
 * a rectangle in its own pixels, opened on the whole picture when the file was
 * read, so an image nobody has drawn on is passed through whole. "Use this
 * crop on every image" is the one thing that writes another image's box, and
 * it writes it here, once, rather than being re-derived on every render.
 */
function cropFor(item) {
  return item.crop ?? wholeOf(item.size);
}

/** What one image becomes, worked out without touching a pixel. */
function previewOf(item) {
  const crop = cropFor(item);
  const laid = plan(crop, resizeSettings());
  return {
    ...laid,
    crop: laid.source,
    untouched: el.format.value === 'keep' && isUntouched(item.size, laid),
  };
}

/** The type one file is written as. "Keep" is the only choice that varies. */
function outputMime(sourceType) {
  const choice = el.format.value;
  return choice === 'keep' ? keepFormat(sourceType, writable) : choice;
}

/* ----------------------------------------------------------- the main event */

el.run.addEventListener('click', async () => {
  if (!items.length || busy) return;

  busy = true;
  clearResults();
  clearLoadError();
  render();
  el.progress.hidden = false;

  const collected = [];
  const failures = [];

  try {
    for (const [index, item] of items.entries()) {
      showProgress(index, items.length, item.file.name);
      try {
        collected.push(await processOne(item));
      } catch (error) {
        failures.push(`${item.file.name}: ${error.message}`);
      }
      // One turn of the event loop between images, so the progress bar is a
      // progress bar rather than a thing that appears finished at the end.
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  } finally {
    busy = false;
    el.progress.hidden = true;
    render();
  }

  if (failures.length) showLoadError(failures.join('\n'));
  results = collected;
  showResults();
});

function showProgress(index, total, name) {
  el.progressBar.style.width = `${Math.round((index / total) * 100)}%`;
  el.progressLabel.textContent = `${index + 1} of ${total}: ${name}`;
}

/**
 * Do one image.
 *
 * The first branch is the one worth reading. A file that is not being cropped,
 * not being resized and not changing format is handed back byte for byte -
 * not re-saved, not "optimised". Decoding and re-encoding it would cost a
 * little quality and would drop every EXIF tag, and doing that to a file
 * nobody asked to change would be the tool quietly damaging something.
 */
async function processOne(item) {
  const laid = previewOf(item);
  const base = { item, name: item.file.name, before: item.file.size, size: item.size };

  if (laid.untouched) {
    return {
      ...base,
      blob: item.file,
      after: item.file.size,
      mime: item.file.type || JPEG,
      crop: laid.source,
      canvas: laid.canvas,
      scale: 1,
      padded: false,
      untouched: true,
      outName: item.file.name,
    };
  }

  const source = await decode(item.file);
  try {
    const mime = outputMime(item.file.type);
    const blob = await renderImage(source.bitmap, laid, {
      mime,
      quality: Number(el.quality.value) / 100,
      background: el.background.value,
    });

    return {
      ...base,
      blob,
      after: blob.size,
      mime,
      crop: laid.source,
      canvas: laid.canvas,
      scale: laid.scale,
      padded: laid.padded,
      untouched: false,
      outName: outName(item.file.name, mime, laid.canvas.width, laid.canvas.height),
    };
  } finally {
    release(source.bitmap);
  }
}

/* ---------------------------------------------------------------- results */

function clearResults() {
  // The viewer is showing one of the URLs about to be revoked, so it cannot be
  // left open over a picture that no longer exists.
  if (el.viewer.open) el.viewer.close();
  for (const url of resultUrls) URL.revokeObjectURL(url);
  resultUrls = [];
  results = [];
  el.resultList.replaceChildren();
  el.results.hidden = true;
  el.downloadZip.hidden = true;
  el.resultsSummary.textContent = '';
}

function showResults() {
  el.resultList.replaceChildren();
  if (!results.length) return;

  el.results.hidden = false;

  for (const result of results) {
    // One object URL per result, made here and kept on the result itself: the
    // row, the download link and the viewer all want the same picture, and
    // three URLs for one blob would be three things to remember to revoke.
    result.url = URL.createObjectURL(result.blob);
    resultUrls.push(result.url);
    el.resultList.appendChild(resultRow(result));
  }

  const before = results.reduce((n, r) => n + r.before, 0);
  const after = results.reduce((n, r) => n + r.after, 0);
  const untouched = results.filter((r) => r.untouched).length;

  const totals = `${humanBytes(before)} in, ${humanBytes(after)} out - ${change(before, after)}.`;
  el.resultsSummary.textContent = untouched === results.length
    ? 'Nothing was asked for, so nothing was done: every file came back exactly as it went in.'
    : untouched
      ? `${totals} ${countOf(untouched)} needed no change and were passed straight through.`
      : totals;

  el.downloadZip.hidden = results.length < 2;
  el.downloadZip.onclick = async () => {
    el.downloadZip.disabled = true;
    try {
      const files = await Promise.all(results.map(async (r) => ({
        name: r.outName,
        data: new Uint8Array(await r.blob.arrayBuffer()),
      })));
      saveBlob(makeZip(files), 'resized-images.zip');
    } finally {
      el.downloadZip.disabled = false;
    }
  };
}

function resultRow(result) {
  const li = document.createElement('li');
  li.className = 'result-row';
  if (result.untouched) li.classList.add('result-untouched');

  // The thumbnail is the obvious thing to click for a closer look, so it is a
  // real button rather than a picture that happens to have a handler on it.
  const open = document.createElement('button');
  open.type = 'button';
  open.className = 'result-open';
  open.title = `Look at ${result.outName} full size`;
  open.setAttribute('aria-label', `Look at ${result.outName} full size`);
  open.addEventListener('click', () => openViewer(result));

  const thumb = document.createElement('img');
  thumb.className = 'result-thumb';
  thumb.src = result.url;
  thumb.alt = '';
  thumb.loading = 'lazy';
  open.appendChild(thumb);
  li.appendChild(open);

  const text = document.createElement('div');
  text.className = 'result-text';

  const name = document.createElement('p');
  name.className = 'result-name';
  name.textContent = result.outName;
  text.appendChild(name);

  const headline = document.createElement('p');
  headline.className = 'result-headline';
  headline.textContent = headlineOf(result);
  text.appendChild(headline);

  const detail = document.createElement('p');
  detail.className = 'result-detail';
  detail.textContent = detailOf(result);
  text.appendChild(detail);

  li.appendChild(text);

  const actions = document.createElement('div');
  actions.className = 'result-actions';

  const view = document.createElement('button');
  view.type = 'button';
  view.className = 'ghost';
  view.textContent = 'View';
  view.addEventListener('click', () => openViewer(result));
  actions.appendChild(view);

  const link = document.createElement('a');
  link.className = 'primary as-button';
  link.href = result.url;
  link.download = result.outName;
  link.textContent = 'Download';
  actions.appendChild(link);

  li.appendChild(actions);
  return li;
}

/** The before-and-after line, used on the row and again in the viewer. */
function headlineOf(result) {
  return result.untouched
    ? `${dimensions(result.size.width, result.size.height)} · ${humanBytes(result.before)} - unchanged`
    : `${dimensions(result.size.width, result.size.height)} → ${dimensions(result.canvas.width, result.canvas.height)}`
      + ` · ${humanBytes(result.before)} → ${humanBytes(result.after)} · ${change(result.before, result.after)}`;
}

function detailOf(result) {
  return result.untouched
    ? 'Passed through byte for byte, metadata and all: nothing about this file was being changed.'
    : describePlan(result.size, result.crop, result, result.mime);
}

/* ------------------------------------------------------------------ viewer */

/*
  The big look at one result.

  A <dialog> opened with showModal(), not a div pretending to be one: Escape,
  the focus trap and an inert background all come free and all come correct.

  Everything in it is already on this page - the result's own object URL, and
  the original's, which has existed since the thumbnail was drawn - so opening
  it fetches nothing and decodes nothing that was not already decoded.
*/

/** Which result the viewer is showing, and whether it is showing the original
 *  rather than the result. Held here so the compare toggle has something to
 *  toggle without the dialog being rebuilt. */
let viewing = null;
let viewingOriginal = false;

function openViewer(result) {
  viewing = result;
  viewingOriginal = false;
  paintViewer();
  el.viewer.showModal();
}

function paintViewer() {
  const result = viewing;
  if (!result) return;
  const original = viewingOriginal;

  el.viewerName.textContent = result.outName;
  el.viewerImage.src = original ? result.item.thumbUrl : result.url;
  el.viewerImage.alt = `${original ? 'The original' : 'The result'}: ${result.name}`;

  el.viewerCaption.textContent = original
    ? `The original ${result.name}, at ${dimensions(result.size.width, result.size.height)}. Both are shown at the size this dialog has room for, which is the only fair way to compare them.`
    : detailOf(result);

  // A file that was passed through untouched *is* the original, so there is
  // nothing to compare it against and the toggle would swap in the same
  // picture twice.
  el.viewerCompare.hidden = result.untouched;
  el.viewerCompare.textContent = original ? 'Show the result' : 'Show the original';
  el.viewerCompare.setAttribute('aria-pressed', String(original));

  el.viewerDownload.href = result.url;
  el.viewerDownload.download = result.outName;

  el.viewerFacts.replaceChildren();
  for (const [term, value] of viewerFacts(result)) {
    const row = document.createElement('div');
    const dt = document.createElement('dt');
    dt.textContent = term;
    const dd = document.createElement('dd');
    dd.textContent = value;
    row.append(dt, dd);
    el.viewerFacts.appendChild(row);
  }
}

/** Everything worth knowing about one finished file, as pairs. */
function viewerFacts(result) {
  const facts = [
    ['Saved as', result.outName],
    ['Format', FORMATS[result.mime]?.label ?? result.mime],
    ['Before', `${dimensions(result.size.width, result.size.height)} · ${humanBytes(result.before)}`],
  ];

  if (result.untouched) {
    facts.push(['After', 'the same file, byte for byte']);
    facts.push(['Metadata', 'kept - this file was never opened up']);
    return facts;
  }

  facts.push(['After', `${dimensions(result.canvas.width, result.canvas.height)} · ${humanBytes(result.after)}`]);
  facts.push(['File size', change(result.before, result.after)]);

  const cropped = result.crop.width !== result.size.width || result.crop.height !== result.size.height;
  facts.push(['Cropped', cropped
    ? `${dimensions(result.crop.width, result.crop.height)}, from ${result.crop.x} across and ${result.crop.y} down`
    : 'no - the whole picture went through']);

  facts.push(['Scale', `${scaleText(result.scale)} of ${cropped ? 'the crop' : 'the original'}`]);
  if (result.padded) facts.push(['Padding', 'yes - the picture sits on the background colour']);
  if (FORMATS[result.mime]?.lossy) facts.push(['Quality', el.quality.value]);
  facts.push(['Metadata', 'not carried over - a canvas holds pixels and nothing else']);

  return facts;
}

el.viewerCompare.addEventListener('click', () => {
  viewingOriginal = !viewingOriginal;
  paintViewer();
});

el.viewerClose.addEventListener('click', () => el.viewer.close());

// A click that lands on the <dialog> itself rather than on anything inside it
// is a click on the backdrop, which is the other way people expect to close
// one. Escape is the browser's, and needs nothing here.
el.viewer.addEventListener('click', (event) => {
  if (event.target === el.viewer) el.viewer.close();
});

el.viewer.addEventListener('close', () => {
  viewing = null;
  viewingOriginal = false;
  // Let go of the picture rather than leaving a decoded copy attached to a
  // hidden element for as long as the tab is open.
  el.viewerImage.removeAttribute('src');
});

/** Hand a blob to the browser's downloads. */
function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  // Revoked late: revoking immediately can cancel a download that has not
  // started yet in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 60000);
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
// buymeacoffee.com and googleapis.com are here for the donate button in the
// header: its script comes from cdnjs.buymeacoffee.com and it pulls its
// lettering from fonts.googleapis.com and fonts.gstatic.com. Like the ad
// scripts, it is something the page loads without the visitor asking, and it
// is handed nothing - so it belongs in this bucket rather than being reported
// as an intruder.
const PLATFORM_HOSTS = /(^|\.)(googlesyndication\.com|doubleclick\.net|googleadservices\.com|googletagservices\.com|adtrafficquality\.google|googletagmanager\.com|google-analytics\.com|gstatic\.com|googleapis\.com|buymeacoffee\.com|cloudflareinsights\.com|google\.[a-z]{2,3}(\.[a-z]{2})?)$/;

/**
 * Report what this page has actually fetched.
 *
 * The claim on trial is not "this page is silent" - it is not silent, it
 * carries ads - but "nothing has carried your pictures away". That is the part
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
      : ` The page's own ad, measurement and donate-button scripts loaded from ${platform.size} host${platform.size === 1 ? '' : 's'}; not one of them was given an image or a byte of one.`;

    el.networkCount.textContent = clean
      ? `your images have gone nowhere. ${total} files loaded, all of them this page's own.${platformNote}`
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
  // Keep the visible text short: this sits in the trust panel, and a raw
  // browser error dumped there reads worse than it is. Detail goes in the
  // tooltip and the console for anyone debugging.
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
  // Service workers need a secure context, so file:// and plain http:// are out.
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
    // Caching is an optimisation, not the privacy guarantee. Everything the
    // page claims still holds when this fails, so say so rather than alarming.
    fail(phrase('offline.failed'), error.message);
  }
}

/** Take WebP off the format menu on a browser that cannot write it. */
async function checkEncoders() {
  writable = await encodableTypes();
  if (writable.has(WEBP)) return;

  for (const option of el.format.options) {
    if (option.value === WEBP) {
      option.disabled = true;
      option.textContent = 'WebP - not supported by this browser';
    }
  }
  if (el.format.value === WEBP) el.format.value = 'keep';
  render();
}

/* -------------------------------------------------------------------- boot */

// An error thrown after boot would otherwise only reach the console, leaving
// the page looking functional but doing nothing.
window.addEventListener('error', (event) => {
  showLoadError(phrase('error.broke', { detail: event.message }));
});
window.addEventListener('unhandledrejection', (event) => {
  showLoadError(phrase('error.broke', { detail: event.reason?.message ?? event.reason }));
});

markAspect();
render();
checkEncoders();
monitorNetwork();
registerServiceWorker();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
