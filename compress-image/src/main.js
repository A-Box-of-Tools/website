/** UI wiring and application state. */

import {
  decode, encodableTypes, release, FORMATS, JPEG, PNG, WEBP, READABLE,
} from './codecs.js';
import {
  fitToTarget, keepFormat, alternativeFormat, QUALITY_FLOOR,
} from './compress.js';
import { compare, hasTransparency } from './measure.js';
import {
  bytes as humanBytes, targetBytes, dimensions, outName, change, matchText, psnrText,
} from './files.js';
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
  targetValue: $('target-value'),
  targetUnit: $('target-unit'),
  presets: $('presets'),
  targetSummary: $('target-summary'),
  formatSelect: $('format-select'),
  allowResize: $('allow-resize'),
  formatNote: $('format-note'),
  compressAll: $('compress-all'),
  progress: $('progress'),
  progressBar: $('progress-bar'),
  progressLabel: $('progress-label'),
  results: $('results'),
  resultList: $('result-list'),
  downloadZip: $('download-zip'),
  resultsSummary: $('results-summary'),
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
 */

/** @type {Item[]} */
let items = [];
let nextId = 1;
let busy = false;

/** Everything the run produced, kept so the rows can be redrawn and the zip
 *  built without compressing anything twice. */
let results = [];

/** Object URLs handed to download links and previews. Revoked as a set when
 *  the results are replaced; holding a dozen decoded copies of somebody's
 *  photo library alive is how a browser tab ends up using two gigabytes. */
let resultUrls = [];

/** Which formats this browser will actually write. Filled in at boot. */
let writable = new Set([JPEG, PNG]);

/* ------------------------------------------------------------------ adding */

const dropzoneTitle = el.dropzone.querySelector('.dropzone-title');

async function addFiles(files) {
  if (!files?.length || busy) return;

  el.dropzone.classList.add('busy');
  dropzoneTitle.textContent = `Reading ${files.length} file${files.length === 1 ? '' : 's'}...`;

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
      };
      nextId += 1;

      // The thumbnail decode doubles as the measurement, so the picture is
      // read once here and not again until it is actually compressed.
      item.size = await measure(item.thumbUrl);
      if (!item.size) {
        URL.revokeObjectURL(item.thumbUrl);
        failures.push(`${file.name}: this browser could not decode it.`);
        continue;
      }

      items.push(item);
    }
  } finally {
    el.dropzone.classList.remove('busy');
    dropzoneTitle.textContent = 'Drop images here';
  }

  if (failures.length) showLoadError(failures.join('\n'));
  else clearLoadError();

  clearResults();
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

// No click handler here on purpose: the drop zone is a <label for="file-input">,
// so the browser opens the picker itself.

el.fileInput.addEventListener('change', () => {
  const picked = Array.from(el.fileInput.files);
  el.fileInput.value = ''; // lets the same file be picked twice in a row
  addFiles(picked);
});

for (const type of ['dragenter', 'dragover']) {
  el.dropzone.addEventListener(type, (event) => {
    event.preventDefault();
    el.dropzone.classList.add('dragover');
  });
}

for (const type of ['dragleave', 'drop']) {
  el.dropzone.addEventListener(type, () => el.dropzone.classList.remove('dragover'));
}

el.dropzone.addEventListener('drop', (event) => {
  event.preventDefault();
  addFiles(event.dataTransfer?.files);
});

function removeItem(id) {
  const at = items.findIndex((i) => i.id === id);
  if (at < 0) return;
  URL.revokeObjectURL(items[at].thumbUrl);
  items.splice(at, 1);
  clearResults();
  render();
}

el.clearAll.addEventListener('click', () => {
  for (const item of items) URL.revokeObjectURL(item.thumbUrl);
  items = [];
  clearResults();
  clearLoadError();
  render();
});

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
  el.countLabel.textContent = any
    ? `${items.length} image${items.length === 1 ? '' : 's'}, ${humanBytes(totalBytes())} in total`
    : '';
  // The button's state belongs to renderTargetSummary, which runs last here.
  renderList();
  renderTargetSummary();
  renderFormatNote();
}

const totalBytes = () => items.reduce((n, i) => n + i.file.size, 0);

function renderList() {
  el.fileList.replaceChildren();

  for (const item of items) {
    const li = document.createElement('li');
    li.className = 'file-row';

    const main = document.createElement('div');
    main.className = 'file-main-wrap';

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

    const target = targetBytes(el.targetValue.value, el.targetUnit.value);
    if (target && item.file.size <= target) {
      const note = document.createElement('p');
      note.className = 'file-note';
      note.textContent = 'Already under the target - this one will be left exactly as it is.';
      text.appendChild(note);
    }

    main.appendChild(text);
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

/**
 * The target, restated as the sentence the button is about to act on.
 *
 * This owns whether the button is live, rather than sharing that with render():
 * a field can go from empty to valid without anything being added or removed,
 * and a button left disabled after the number was fixed is the kind of dead end
 * people do not report, they just leave.
 */
function renderTargetSummary() {
  const target = targetBytes(el.targetValue.value, el.targetUnit.value);
  el.compressAll.disabled = !target || !items.length || busy;

  if (!target) {
    el.targetSummary.textContent = 'Enter a size to aim for.';
    el.targetSummary.className = 'field-summary warn';
    return;
  }

  el.targetSummary.className = 'field-summary';

  const over = items.filter((i) => i.file.size > target).length;
  const under = items.length - over;

  if (!items.length) {
    el.targetSummary.textContent = `Every image will be brought under ${humanBytes(target)}.`;
    return;
  }

  if (items.length === 1) {
    el.targetSummary.textContent = over
      ? `This image is over ${humanBytes(target)}, so it will be compressed until it is not.`
      : `This image is already under ${humanBytes(target)}, so it will be passed through untouched.`;
    return;
  }

  const parts = [`${over} of ${items.length} ${over === 1 ? 'image is' : 'images are'} over ${humanBytes(target)}`];
  if (under > 0) parts.push(`the other ${under === 1 ? 'one' : under} will be passed through untouched`);
  el.targetSummary.textContent = `${parts.join(', and ')}.`;
}

function renderFormatNote() {
  const choice = el.formatSelect.value;
  const resize = el.allowResize.checked;

  const format = {
    auto: 'The format is kept unless the target is tight enough that keeping it would cost real quality, in which case WebP is used and the row says so.',
    keep: 'Every image keeps the format it arrived in.',
    [JPEG]: 'Everything is written as JPEG. Transparency becomes white, because JPEG has no alpha channel.',
    [WEBP]: 'Everything is written as WebP: smaller than JPEG at the same quality, and it keeps transparency.',
    [PNG]: 'Everything is written as PNG. PNG has no quality dial, so the only way to reach a target is to make the picture smaller.',
  }[choice] ?? '';

  const sizing = resize
    ? 'If quality alone cannot reach the target, the picture is made smaller rather than crushed.'
    : 'The picture keeps its full dimensions, so a tight target has to be paid for out of quality alone.';

  el.formatNote.textContent = `${format} ${sizing}`;
}

/* ------------------------------------------------------------- the options */

/*
  Any change to the settings throws away the results below.

  It costs somebody a download link they might still have wanted, and it is
  still the right call: the summary under the button says things like "every
  image is under the target", and leaving that sentence on screen beside a
  target it is no longer true of would be the one dishonest line on the page.
*/
for (const control of [el.targetValue, el.targetUnit]) {
  control.addEventListener('input', () => {
    clearResults();
    renderList();
    renderTargetSummary();
  });
}

for (const control of [el.formatSelect, el.allowResize]) {
  control.addEventListener('change', () => {
    clearResults();
    renderFormatNote();
  });
}

el.presets.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-bytes]');
  if (!button) return;
  const amount = Number(button.dataset.bytes);
  const unit = amount >= 1024 * 1024 ? 'MB' : 'KB';
  el.targetValue.value = String(amount / (unit === 'MB' ? 1024 * 1024 : 1024));
  el.targetUnit.value = unit;
  clearResults();
  renderList();
  renderTargetSummary();
});

/* ----------------------------------------------------------- the main event */

el.compressAll.addEventListener('click', async () => {
  const target = targetBytes(el.targetValue.value, el.targetUnit.value);
  if (!target || !items.length || busy) return;

  busy = true;
  clearResults();
  clearLoadError();
  render();
  el.progress.hidden = false;

  const collected = [];
  const failures = [];

  try {
    for (const [index, item] of items.entries()) {
      showProgress(index, items.length, item.file.name, 'reading');
      try {
        collected.push(await compressOne(item, target, (note) => {
          showProgress(index, items.length, item.file.name, note);
        }));
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

function showProgress(index, total, name, note) {
  const done = index / total;
  el.progressBar.style.width = `${Math.round(done * 100)}%`;
  el.progressLabel.textContent = `${index + 1} of ${total}: ${name} - ${note}`;
}

/**
 * Compress one image.
 *
 * The order of the checks here is the tool's whole argument about quality, so
 * it is worth reading in one go:
 *
 *   - A file already under the target is returned as it arrived. Not re-saved,
 *     not re-encoded, not "optimised": handed back byte for byte, because the
 *     best possible version of a file that already fits is the file.
 *   - Otherwise the search in compress.js finds the cheapest way to fit.
 *   - On "auto", if fitting cost real quality - a resize, or a quality below
 *     the floor - the same search runs again in WebP and the two results are
 *     compared by measurement, not by rule of thumb. The better-looking one
 *     wins, and if the original format wins a tie it keeps the tie.
 *   - Whatever comes out is then measured against the original, so the row can
 *     say what the compression cost rather than promising it was small.
 */
async function compressOne(item, target, onStep) {
  const base = {
    item,
    name: item.file.name,
    before: item.file.size,
    size: item.size,
  };

  if (item.file.size <= target) {
    return {
      ...base,
      blob: item.file,
      after: item.file.size,
      mime: item.file.type || JPEG,
      untouched: true,
      fitted: true,
      width: item.size?.width ?? 0,
      height: item.size?.height ?? 0,
      outName: item.file.name,
    };
  }

  onStep('decoding');
  const source = await decode(item.file);

  try {
    const alpha = hasTransparency(source.bitmap, source);
    const choice = el.formatSelect.value;
    const allowResize = el.allowResize.checked;

    const firstMime = choice === 'auto' || choice === 'keep'
      ? keepFormat(item.file.type, writable)
      : choice;

    let winner = await fitToTarget(source, {
      targetBytes: target, mime: firstMime, allowResize, onStep,
    });
    let winnerScore = await score(source, winner);
    // The winner's own count is the length of the search that produced it. The
    // row says how many times this picture was encoded in total, including a
    // search that was tried and thrown away, because that is the honest answer
    // to "what did this cost my laptop".
    let encodes = winner.encodes;

    // Only "auto" is allowed to change the extension, and only when keeping it
    // actually cost something. A tool that quietly hands back a .webp when a
    // .jpg would have been fine is not being clever, it is being surprising.
    const compromised = winner.resized || winner.quality < QUALITY_FLOOR + 0.001 || !winner.fitted;
    if (choice === 'auto' && compromised) {
      const other = alternativeFormat(firstMime, writable, alpha);
      if (other) {
        onStep(`trying ${FORMATS[other].label} instead`);
        const rival = await fitToTarget(source, {
          targetBytes: target, mime: other, allowResize, onStep,
        });
        const rivalScore = await score(source, rival);
        encodes += rival.encodes;
        if (isBetter(rival, rivalScore, winner, winnerScore)) {
          winner = rival;
          winnerScore = rivalScore;
        }
      }
    }

    return {
      ...base,
      blob: winner.blob,
      after: winner.blob.size,
      mime: winner.mime,
      quality: winner.quality,
      width: winner.width,
      height: winner.height,
      resized: winner.resized,
      fitted: winner.fitted,
      encodes,
      changedFormat: winner.mime !== firstMime,
      match: winnerScore,
      untouched: false,
      outName: outName(item.file.name, winner.mime),
    };
  } finally {
    release(source.bitmap);
  }
}

/** Decode a candidate and measure it against the original it came from. */
async function score(source, candidate) {
  let decoded;
  try {
    decoded = await decode(candidate.blob);
  } catch {
    return null;
  }
  try {
    return compare(source.bitmap, decoded.bitmap, source);
  } finally {
    release(decoded.bitmap);
  }
}

/**
 * Is the challenger the better result?
 *
 * Meeting the target comes first - a prettier file that missed the budget is
 * not a better answer to "make it fit". After that it is the measurement, with
 * a small margin: SSIM differences under a couple of thousandths are noise,
 * and on a tie the format the visitor's file arrived in keeps its place.
 */
function isBetter(challenger, challengerScore, holder, holderScore) {
  if (challenger.fitted !== holder.fitted) return challenger.fitted;
  if (!challengerScore || !holderScore) return false;
  return challengerScore.ssim > holderScore.ssim + 0.002;
}

/* ---------------------------------------------------------------- results */

function clearResults() {
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
    el.resultList.appendChild(resultRow(result));
  }

  const before = results.reduce((n, r) => n + r.before, 0);
  const after = results.reduce((n, r) => n + r.after, 0);
  const missed = results.filter((r) => !r.fitted).length;

  el.resultsSummary.textContent = missed
    ? `${humanBytes(before)} down to ${humanBytes(after)}. ${missed} ${missed === 1 ? 'image' : 'images'} could not reach the target - see the rows below.`
    : `${humanBytes(before)} down to ${humanBytes(after)} - ${change(before, after)}, and every image is under the target.`;

  el.downloadZip.hidden = results.length < 2;
  el.downloadZip.onclick = async () => {
    el.downloadZip.disabled = true;
    try {
      const files = await Promise.all(results.map(async (r) => ({
        name: r.outName,
        data: new Uint8Array(await r.blob.arrayBuffer()),
      })));
      saveBlob(makeZip(files), 'compressed-images.zip');
    } finally {
      el.downloadZip.disabled = false;
    }
  };
}

function resultRow(result) {
  const li = document.createElement('li');
  li.className = 'result-row';
  if (!result.fitted) li.classList.add('result-missed');
  if (result.untouched) li.classList.add('result-untouched');

  const text = document.createElement('div');
  text.className = 'result-text';

  const name = document.createElement('p');
  name.className = 'result-name';
  name.textContent = result.outName;
  text.appendChild(name);

  const headline = document.createElement('p');
  headline.className = 'result-headline';
  headline.textContent = result.untouched
    ? `${humanBytes(result.before)} - already under the target, so nothing was touched.`
    : `${humanBytes(result.before)} → ${humanBytes(result.after)} · ${change(result.before, result.after)}`;
  text.appendChild(headline);

  const detail = document.createElement('p');
  detail.className = 'result-detail';
  detail.textContent = describe(result);
  text.appendChild(detail);

  if (result.match) {
    const match = document.createElement('p');
    match.className = 'result-match';
    match.textContent = `Measured against the original: ${matchText(result.match.ssim)} (SSIM ${result.match.ssim.toFixed(3)}, PSNR ${psnrText(result.match.psnr)}).`;
    text.appendChild(match);
  }

  if (!result.fitted) {
    const warn = document.createElement('p');
    warn.className = 'result-warn';
    warn.textContent = 'This is the smallest this picture could be made under the settings above, and it is still over the target. Allow resizing, or ask for a larger target.';
    text.appendChild(warn);
  }

  li.appendChild(text);

  const actions = document.createElement('div');
  actions.className = 'result-actions';

  const url = URL.createObjectURL(result.blob);
  resultUrls.push(url);

  const link = document.createElement('a');
  link.className = 'primary as-button';
  link.href = url;
  link.download = result.outName;
  link.textContent = 'Download';
  actions.appendChild(link);

  if (!result.untouched) {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'ghost';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = 'Compare';
    actions.appendChild(toggle);

    const panel = comparePanel(result, url);
    panel.hidden = true;
    li.appendChild(panel);

    toggle.addEventListener('click', () => {
      panel.hidden = !panel.hidden;
      toggle.setAttribute('aria-expanded', String(!panel.hidden));
      toggle.textContent = panel.hidden ? 'Compare' : 'Hide';
    });
  }

  li.appendChild(actions);
  return li;
}

/** One sentence saying exactly what was done to this picture, and at what. */
function describe(result) {
  if (result.untouched) {
    return 'Compressing it would have cost quality to reach a size it already had, so it was passed through byte for byte - metadata and all.';
  }

  const parts = [];
  const format = FORMATS[result.mime]?.label ?? result.mime;

  parts.push(result.changedFormat
    ? `Written as ${format}, which held the picture together better at this size than the original format did`
    : `Written as ${format}`);

  if (FORMATS[result.mime]?.lossy) parts.push(`quality ${result.quality.toFixed(2)}`);

  parts.push(result.resized
    ? `resized to ${dimensions(result.width, result.height)} from ${dimensions(result.size.width, result.size.height)}`
    : `full size at ${dimensions(result.width, result.height)}`);

  parts.push(`found in ${result.encodes} ${result.encodes === 1 ? 'encode' : 'encodes'}`);

  return `${parts.join(', ')}.`;
}

/** Original and result, side by side and the same size on screen. */
function comparePanel(result, resultUrl) {
  const panel = document.createElement('div');
  panel.className = 'compare';

  for (const [label, src, note] of [
    ['Original', result.item.thumbUrl, `${humanBytes(result.before)} · ${dimensions(result.size.width, result.size.height)}`],
    ['Compressed', resultUrl, `${humanBytes(result.after)} · ${dimensions(result.width, result.height)}`],
  ]) {
    const figure = document.createElement('figure');
    figure.className = 'compare-side';

    const img = document.createElement('img');
    img.src = src;
    img.alt = `${label}: ${result.name}`;
    img.loading = 'lazy';
    figure.appendChild(img);

    const caption = document.createElement('figcaption');
    const strong = document.createElement('strong');
    strong.textContent = label;
    caption.appendChild(strong);
    caption.appendChild(document.createTextNode(` ${note}`));
    figure.appendChild(caption);

    panel.appendChild(figure);
  }

  const hint = document.createElement('p');
  hint.className = 'compare-hint';
  hint.textContent = 'Both are shown at the same width, which is how the difference is actually judged. Open the two files at full size for the close look.';
  panel.appendChild(hint);

  return panel;
}

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

/** Take WebP off the format menu on a browser that cannot write it. */
async function checkEncoders() {
  writable = await encodableTypes();
  if (writable.has(WEBP)) return;

  for (const option of el.formatSelect.options) {
    if (option.value === WEBP) {
      option.disabled = true;
      option.textContent = 'WebP - not supported by this browser';
    }
  }
  if (el.formatSelect.value === WEBP) el.formatSelect.value = 'auto';
  renderFormatNote();
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
checkEncoders();
monitorNetwork();
registerServiceWorker();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
