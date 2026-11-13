/** UI wiring and application state. */

import * as camera from './camera.js';
import { scan } from './scan.js';
import { createChime } from './shared/chime.js';
import { sightings } from './sightings.js';
import { wireFilePicker, readingLabel } from './shared/file-picker.js';
import { phrase } from './shared/phrases.js';
import { acceptsImageFile } from './shared/image-input.js';
import { makeExample } from './example.js';

const $ = (id) => document.getElementById(id);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  startCamera: $('start-camera'),
  stopCamera: $('stop-camera'),
  pickError: $('pick-error'),
  cameraCard: $('camera-card'),
  viewfinder: document.querySelector('.viewfinder'),
  video: $('video'),
  found: $('camera-found'),
  cameraPickRow: $('camera-pick-row'),
  cameraPick: $('camera-pick'),
  torchRow: $('torch-row'),
  torch: $('torch'),
  signal: $('camera-signal'),
  cameraStatus: $('camera-status'),
  resultsCard: $('results-card'),
  results: $('results'),
  clearResults: $('clear-results'),
  resultStatus: $('result-status'),
  resultTemplate: $('result-template'),
  preview: $('preview'),
  previewCaption: $('preview-caption'),
  previewList: $('preview-list'),
  previewTemplate: $('preview-template'),
  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
};

/* ------------------------------------------------------------ the pictures */

/**
 * The longest side a picture is examined at.
 *
 * A twelve-megapixel photograph is forty times the work of this and holds no
 * more code than it does: the modules of a symbol big enough to read are
 * several pixels across either way. A picture that fails at this size is tried
 * again whole, because the exception is a code that was small in a very large
 * frame, and that one does need the pixels.
 */
const WORKING_SIDE = 1800;

const decodeCanvas = document.createElement('canvas');
let fileGeneration = 0;

/** A decoded picture, at a given longest side, as pixels. */
function pixelsOf(source, width, height, maxSide) {
  const scale = Math.min(1, maxSide / Math.max(width, height));
  const target = {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };

  decodeCanvas.width = target.width;
  decodeCanvas.height = target.height;
  const context = decodeCanvas.getContext('2d', { willReadFrequently: true });
  // A code drawn light on dark is common; a transparent PNG of one is not
  // unheard of, and its background would otherwise come out black.
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, target.width, target.height);
  context.drawImage(source, 0, 0, target.width, target.height);
  return context.getImageData(0, 0, target.width, target.height);
}

/**
 * Get a picture out of a file.
 *
 * `createImageBitmap` is the fast path and the one every browser here has, and
 * it is the one that refuses an SVG in Safari - so an ordinary <img> stands
 * behind it. Both decode on this machine; neither fetches anything.
 */
async function pictureFrom(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file);
    } catch {
      // Fall through: some browsers refuse some formats here and manage them
      // perfectly well through an <img>.
    }
  }

  const url = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('not a picture this browser can open'));
      image.src = url;
    });
  } finally {
    // Revoked after the load either way: the pixels are copied onto a canvas
    // and nothing afterwards needs the URL.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

/**
 * The longest side a picture is drawn at for the preview.
 *
 * Twice the width the tile shows it at, so it is not soft on a screen with two
 * device pixels to the CSS pixel, and nothing like large enough to be a second
 * copy of somebody's photograph sitting in the page.
 */
const PREVIEW_SIDE = 260;

/**
 * The picture as the reader saw it, small.
 *
 * Drawn from the decoded picture rather than from the file, and on the same
 * white ground pixelsOf lays down, because the file is not what was read: a
 * transparent PNG of a code is flattened onto white before it is thresholded,
 * and a preview that showed it any other way would be a picture of something
 * the answer did not come from.
 */
function thumbnailOf(picture, width, height) {
  const scale = Math.min(1, PREVIEW_SIDE / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  // Decoration, and declared as such: the file's name and what came of it sit
  // beside this as text, so there is nothing here a screen reader is missing.
  canvas.setAttribute('aria-hidden', 'true');

  const context = canvas.getContext('2d');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(picture, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/** Read one file, at the working size and then, if that found nothing, whole. */
async function readFile(file) {
  const picture = await pictureFrom(file);
  try {
    const width = picture.width ?? picture.naturalWidth;
    const height = picture.height ?? picture.naturalHeight;

    // Before the scan rather than after it: a picture that opened is a picture
    // worth showing whatever the search makes of it, and the scan is the half
    // that can throw.
    const thumbnail = thumbnailOf(picture, width, height);

    let found = scan(pixelsOf(picture, width, height, WORKING_SIDE));
    if (!found && Math.max(width, height) > WORKING_SIDE) {
      found = scan(pixelsOf(picture, width, height, Math.max(width, height)));
    }
    return { found, thumbnail };
  } finally {
    picture.close?.();
  }
}

/* -------------------------------------------------------------- the results */

/** What is on screen, newest first, so the same code is not listed twice. */
const shown = [];
const MOST_KEPT = 20;

/** What makes two reads the same code: the symbol it is written in, and what it says. */
const keyOf = (found) => `${found.symbology}:${found.text}`;

/**
 * The symbol's own name.
 *
 * Not translated, because these are not words: EAN-13 and Code 128 are what
 * the standards are called, and what the person asking for one will say. The
 * exception is the QR code, which is an ordinary noun in most languages and is
 * spelled differently in several of them, so it comes out of the markup.
 */
const SYMBOLOGY_NAMES = {
  ean13: 'EAN-13',
  ean8: 'EAN-8',
  upca: 'UPC-A',
  upce: 'UPC-E',
  itf14: 'ITF-14',
  itf: 'Interleaved 2 of 5',
  code128: 'Code 128',
  code39: 'Code 39',
};

const symbologyName = (id) => SYMBOLOGY_NAMES[id] ?? phrase(`symbology.${id}`);

/** Draw the sampled modules back out, so the reading can be checked by eye. */
function drawGrid(canvas, size, modules) {
  const scale = Math.max(1, Math.floor(240 / size));
  const quiet = 2;
  const side = (size + quiet * 2) * scale;
  canvas.width = side;
  canvas.height = side;

  const context = canvas.getContext('2d');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, side, side);
  context.fillStyle = '#000000';
  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      if (!modules[row * size + column]) continue;
      context.fillRect((column + quiet) * scale, (row + quiet) * scale, scale, scale);
    }
  }
}

/** Fill in the technical facts, hiding the rows this kind of code has no answer for. */
function fillFacts(node, found) {
  const set = (name, value) => {
    const cell = node.querySelector(`[data-fact="${name}"]`);
    if (!cell) return;
    const holder = cell.closest('div');
    if (value === null || value === undefined || value === '') {
      if (holder?.hasAttribute('data-optional')) holder.hidden = true;
      return;
    }
    cell.textContent = String(value);
  };

  for (const holder of node.querySelectorAll('[data-only]')) {
    holder.hidden = holder.dataset.only !== found.kind;
  }

  set('symbol', symbologyName(found.symbology));
  set('characters', [...found.text].length);
  set('how', phrase(`how.${found.how}`) + (found.dense ? phrase('how.dense') : ''));

  if (found.kind === 'qr') {
    set('version', `${found.version} (${phrase('value.modules', { n: found.dimension })})`);
    set('level', found.level);
    set('mask', found.mask);
    set('repaired', found.corrections);
    const modes = [...new Set(found.segments.map((segment) => segment.mode))];
    set('mode', modes.map((mode) => phrase(`mode.${mode}`)).join(', '));
    set('eci', found.eci === null ? '' : found.eci);
    set('part', found.structuredAppend
      ? `${found.structuredAppend.index} / ${found.structuredAppend.total}` : '');
  } else {
    set('lines', found.lines);
  }
}

/** One result, cloned out of the template in body.html and filled in. */
function render(found) {
  const node = el.resultTemplate.content.firstElementChild.cloneNode(true);
  const payload = found.payload;

  node.querySelector('.result-kind').textContent = phrase(payload.kindKey);
  node.querySelector('.result-symbology').textContent = symbologyName(found.symbology);
  node.querySelector('.result-text').textContent = found.text;
  node.dataset.kind = payload.kind;
  // Focusable from script and not from Tab: the strip on the viewfinder sends
  // the keyboard here along with the scroll position, so that the next Tab is
  // this result's Copy button rather than whatever came after the camera.
  node.tabIndex = -1;

  const rows = node.querySelector('.result-rows');
  for (const entry of payload.rows) {
    const holder = document.createElement('div');
    const label = document.createElement('dt');
    const value = document.createElement('dd');
    label.textContent = phrase(entry.key);
    value.textContent = entry.phrase ? phrase(entry.phrase) : entry.value;
    if (entry.emphasis) value.className = 'emphasis';
    if (entry.secret) value.classList.add('secret');
    holder.append(label, value);
    rows.append(holder);
  }
  rows.hidden = !payload.rows.length;

  const warnings = node.querySelector('.result-warnings');
  for (const warning of payload.warnings) {
    const item = document.createElement('li');
    item.textContent = phrase(warning.key, warning.values);
    warnings.append(item);
  }
  warnings.hidden = !payload.warnings.length;

  const open = node.querySelector('.open');
  if (payload.link) {
    open.href = payload.link.href;
    open.hidden = false;
  }

  const copy = node.querySelector('.copy');
  const original = copy.textContent;
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(found.text);
      globalThis.aboxToolComplete?.();
      copy.textContent = phrase('value.copied');
      setTimeout(() => { copy.textContent = original; }, 1600);
    } catch {
      // No clipboard permission. The text is selectable, which is the fallback
      // that has always worked.
      getSelection()?.selectAllChildren(node.querySelector('.result-text'));
    }
  });

  fillFacts(node, found);

  if (found.kind === 'qr' && found.modules) {
    const figure = node.querySelector('.grid-figure');
    drawGrid(figure.querySelector('.grid'), found.dimension, found.modules);
    figure.hidden = false;
  }

  return node;
}

/** Put a result on the page, unless it is one that is already there. */
function report(found, measure = true) {
  if (measure) globalThis.aboxToolComplete?.();
  const key = keyOf(found);
  if (shown.includes(key)) return false;

  // Drawn before it is recorded, so that a result which could not be drawn is
  // not remembered as one that was. `shown` and the list are read side by
  // side, by position, when the camera meets a code again: see raise().
  const node = render(found);
  shown.unshift(key);
  shown.length = Math.min(shown.length, MOST_KEPT);

  el.resultStatus.textContent = '';
  el.results.prepend(node);
  while (el.results.children.length > MOST_KEPT) el.results.lastElementChild.remove();
  return true;
}

/**
 * The result on the page for a code, moved to the top if it was lower down.
 *
 * A code the camera meets again gets no second copy, and leaving the first
 * where it was would put the thing just scanned eleventh in a list that is
 * otherwise newest first. `shown` and the list hold the same codes in the
 * same order - report() and Clear are the only things that write either - so
 * a position in one is the position in the other.
 */
function raise(key) {
  const at = shown.indexOf(key);
  const node = el.results.children[at] ?? null;
  if (node && at > 0) {
    shown.unshift(...shown.splice(at, 1));
    el.results.prepend(node);
  }
  return node;
}

function fail(key) {
  el.pickError.hidden = false;
  el.pickError.textContent = phrase(key);
}

/* -------------------------------------------------------------- the preview
 *
 * What went in, beside what came of it.
 *
 * The results are cumulative and this is not: it is the batch that was just
 * handed over, cleared when the next one arrives. That is the question it
 * answers - is the picture I chose the picture that arrived, and which of the
 * four did the one answer come from - and a preview that kept growing would
 * stop answering it after the second drop.
 *
 * The camera has no entry here on purpose. Its preview is the viewfinder,
 * which is live, and a still of a frame that has already been thrown away
 * would say the opposite of what the card underneath it says.
 */

/** Start again: the preview is this batch, not the last one. */
function clearPreview() {
  el.previewList.replaceChildren();
  el.preview.hidden = true;
}

/** One picture, whatever came of it. */
function showPicture(file, thumbnail, found) {
  const node = el.previewTemplate.content.firstElementChild.cloneNode(true);

  // Absent only for a file that would not open as a picture at all, where the
  // name and the reason are the whole of what there is to say.
  if (thumbnail) node.querySelector('.preview-shot').append(thumbnail);

  const name = node.querySelector('.preview-name');
  name.textContent = file.name;
  // A phone's file names are long, alike, and different only near the end,
  // which is the end the ellipsis eats.
  name.title = file.name;

  const state = node.querySelector('.preview-state');
  if (found) {
    state.textContent = symbologyName(found.symbology);
  } else {
    state.textContent = phrase(thumbnail ? 'preview.nothing' : 'preview.broken');
    node.classList.add(thumbnail ? 'nothing' : 'broken');
  }

  el.previewList.append(node);
  const count = el.previewList.children.length;
  el.previewCaption.textContent = phrase(count === 1 ? 'preview.one' : 'preview.many', { n: count });
  el.preview.hidden = false;
}

/* --------------------------------------------------------------- the files */

const exampleFiles = new WeakSet();
const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles(files) { void readFiles(files); },
  example: async () => {
    const file = await makeExample();
    exampleFiles.add(file);
    return file;
  },
});

async function readFiles(files) {
  const mine = ++fileGeneration;
  el.pickError.hidden = true;
  el.resultStatus.textContent = '';
  picker.busy(readingLabel(files.length));
  clearPreview();

  let any = false;
  let broken = false;
  try {
    for (const file of files) {
      try {
        const { found, thumbnail } = await readFile(file);
        if (mine !== fileGeneration) return;
        if (found) {
          // A duplicate was still read successfully, even when it adds no row.
          any = true;
          report(found, !exampleFiles.has(file));
        }
        showPicture(file, thumbnail, found);
      } catch {
        if (mine !== fileGeneration) return;
        broken = true;
        showPicture(file, null, null);
      }
    }

    if (broken) fail('status.broken');
    else if (!any) fail('status.nothing');
  } finally {
    if (mine === fileGeneration) picker.done();
  }
}

function clearResults() {
  fileGeneration += 1;
  stopCamera();
  picker.done();
  shown.length = 0;
  el.results.replaceChildren();
  clearPreview();
  el.pickError.hidden = true;
  el.resultStatus.textContent = phrase('status.cleared');
}

el.clearResults.addEventListener('click', clearResults);

// A screenshot on the clipboard is the fastest way to read a code that is on
// screen, and it is the one route into this page that needs no file at all.
window.addEventListener('paste', (event) => {
  const files = [...(event.clipboardData?.files ?? [])]
    .filter((file) => acceptsImageFile(file, ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'avif', 'svg']));
  if (files.length) {
    event.preventDefault();
    // A pasted picture never passes through the picker, which is the only
    // thing that wakes step 2 by itself. Without this the answer was written
    // into a card that stayed dimmed and unclickable, under a line saying it
    // would open as soon as a file was chosen.
    picker.arrived();
    void readFiles(files);
  }
});

/* -------------------------------------------------------------- the camera */

const cameraSession = camera.session();
const chime = createChime();
const seen = sightings();
let stream = null;
let looking = false;
let lastLook = 0;
let cameraFrame = 0;
let cameraStatusTimer = null;

/** How often a frame is examined. */
const EVERY_MS = 120;

/**
 * How close together two reads may light the viewfinder and sound.
 *
 * A camera swept across a sheet of codes can read a new one on every frame.
 * Eight flashes a second is past the three a second the accessibility
 * guidelines draw as the line for a seizure risk, and eight beeps a second is
 * a buzzer. A read that lands sooner than this still reaches the list, the
 * strip and the status line; it borrows the flash that is already running.
 */
const SIGNAL_GAP_MS = 400;

/** How long the viewfinder stays lit, and how long a result stays marked as the new one. */
const HIT_MS = 1000;
const FRESH_MS = 2400;

let lastSignal = -Infinity;
let hitTimer = null;
let freshTimer = null;
/** The result the strip on the viewfinder goes to. */
let latest = null;
/** Which of its two spellings the status line used last: see announce(). */
let spelled = false;
/** Built from its number, so that the source has no character in it nobody can see. */
const ZERO_WIDTH_SPACE = String.fromCharCode(0x200b);

/** Scrolling that follows the visitor's own setting for how much may move. */
const glide = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');

/** Put a class on so that its animation starts from the beginning, even when it is already there. */
function restart(element, name) {
  element.classList.remove(name);
  // Reading a layout property is what makes the browser notice the class
  // went away. Off and on again inside one task is otherwise no change at all.
  void element.offsetWidth;
  element.classList.add(name);
}

/**
 * Bring a result into view, for somebody who is watching the camera.
 *
 * Only as far as it takes to show the string and the buttons under it, so
 * that as much of the viewfinder as will fit stays on screen for the next
 * code. And only while the viewfinder is on screen at all: a visitor who has
 * scrolled away to read the page is not pulled back by a camera they left
 * pointing at the desk.
 */
function reveal(node) {
  const finder = el.viewfinder.getBoundingClientRect();
  if (finder.bottom <= 0 || finder.top >= window.innerHeight) return;
  (node.querySelector('.run-row') ?? node).scrollIntoView({ block: 'nearest', behavior: glide() });
}

/**
 * Say that a code was read, everywhere somebody might be attending.
 *
 * Their eyes are on the viewfinder, so it lights up and names what was read.
 * Their ears may be all that is free - a phone held at arm's length over a
 * label - so it sounds. A screen reader is listening to the status line. And
 * the answer is in the list underneath, so the list is brought into view.
 *
 * It used to be a two-pixel border that turned green for 0.7 seconds, above a
 * status line that went on saying it was looking.
 */
function announce(found, node, now) {
  const kind = phrase(found.payload.kindKey);
  const symbol = symbologyName(found.symbology);

  el.found.querySelector('.found-kind').textContent = kind;
  el.found.querySelector('.found-symbology').textContent = symbol;
  el.found.hidden = false;
  latest = node;

  clearTimeout(cameraStatusTimer);
  cameraStatusTimer = null;
  // A live region speaks when its text changes, and two web addresses in a
  // row make the same sentence twice. The zero-width space turns the second
  // into a change without making it look like one.
  spelled = !spelled;
  el.cameraStatus.textContent = phrase('status.read', { kind, symbol }) + (spelled ? ZERO_WIDTH_SPACE : '');
  el.cameraStatus.classList.add('read');

  if (now - lastSignal >= SIGNAL_GAP_MS) {
    lastSignal = now;
    restart(el.cameraCard, 'hit');
    clearTimeout(hitTimer);
    hitTimer = setTimeout(() => el.cameraCard.classList.remove('hit'), HIT_MS);
    if (el.signal.checked) chime.play();
  }

  if (!node) return;
  for (const other of el.results.querySelectorAll('.fresh')) other.classList.remove('fresh');
  restart(node, 'fresh');
  clearTimeout(freshTimer);
  freshTimer = setTimeout(() => node.classList.remove('fresh'), FRESH_MS);
  reveal(node);
}

function look() {
  if (!looking) return;
  cameraFrame = requestAnimationFrame(look);

  const now = performance.now();
  if (now - lastLook < EVERY_MS) return;
  lastLook = now;

  const frame = camera.frameInto(el.video, decodeCanvas);
  if (!frame) return;

  const found = scan(frame, { thorough: false });
  if (!found) return;

  // A code that has not left the frame is read again on every pass, and has
  // already been announced: see sightings.js.
  const key = keyOf(found);
  if (seen.note(key, now) === 'still') return;

  // False for a code that is on the page already - read from a file earlier,
  // or shown to the camera a second time. Either way it is the one that was
  // just scanned, so it goes to the top and is announced like any other.
  report(found);
  announce(found, raise(key), now);
}

async function startCamera(deviceId) {
  stopCamera();
  // Here, inside the tap and before anything is awaited, or not at all: see
  // shared/js/chime.js for why a sound has to be asked for this early.
  if (el.signal.checked) chime.arm();
  el.pickError.hidden = true;
  el.startCamera.hidden = true;
  el.stopCamera.hidden = false;
  let active;
  try {
    active = await cameraSession.open({ deviceId });
  } catch (error) {
    fail(camera.reasonFor(error));
    stopCamera();
    return;
  }
  if (!active) return;

  stream = active;
  el.video.srcObject = active;
  el.cameraCard.hidden = false;
  // The camera is a way in like any other, and step 2 is where its answers
  // go. Nothing woke that card on this route, so a code read here landed in
  // one that was dimmed, unclickable and still asking for a file.
  picker.arrived();
  seen.forget();
  el.cameraStatus.textContent = phrase('status.on');
  el.cameraStatus.classList.remove('read');
  await el.video.play().catch(() => {});
  if (!cameraSession.isCurrent(active)) return;

  const devices = await camera.cameras();
  if (!cameraSession.isCurrent(active)) return;
  if (devices.length > 1 && !el.cameraPick.options.length) {
    for (const device of devices) el.cameraPick.append(new Option(device.label, device.deviceId));
    el.cameraPickRow.hidden = false;
  }
  if (devices.length > 1) {
    const selected = active.getVideoTracks()[0]?.getSettings?.().deviceId;
    if (selected) el.cameraPick.value = selected;
  }

  el.torchRow.hidden = !camera.torchable(active);
  el.torch.checked = false;

  // The button that opened this card is above it, and on a phone the card
  // opens below the bottom of the screen: somebody pressed "Use the camera"
  // and was shown no camera. Done last, once the card has every row it is
  // going to have, and only as far as it takes to show the whole of it.
  el.cameraCard.scrollIntoView({ block: 'nearest', behavior: glide() });

  looking = true;
  lastLook = 0;
  cameraFrame = requestAnimationFrame(look);
  cameraStatusTimer = setTimeout(() => {
    if (looking && cameraSession.isCurrent(active)) {
      el.cameraStatus.textContent = phrase('status.looking');
    }
  }, 2500);
}

function stopCamera() {
  cameraSession.stop();
  looking = false;
  cancelAnimationFrame(cameraFrame);
  cameraFrame = 0;
  clearTimeout(cameraStatusTimer);
  cameraStatusTimer = null;
  clearTimeout(hitTimer);
  hitTimer = null;
  lastSignal = -Infinity;
  latest = null;
  chime.release();
  stream = null;
  el.video.srcObject = null;
  el.cameraCard.hidden = true;
  el.cameraCard.classList.remove('hit');
  el.found.hidden = true;
  el.startCamera.hidden = false;
  el.stopCamera.hidden = true;
}

el.startCamera.addEventListener('click', () => { void startCamera(); });
el.stopCamera.addEventListener('click', stopCamera);
el.cameraPick.addEventListener('change', () => { void startCamera(el.cameraPick.value); });
el.torch.addEventListener('change', () => {
  void camera.setTorch(stream, el.torch.checked);
});

// The strip on the viewfinder is the way down to what it names.
el.found.addEventListener('click', () => {
  if (!latest?.isConnected) return;
  latest.scrollIntoView({ block: 'start', behavior: glide() });
  latest.focus({ preventScroll: true });
});

/*
 * Whether a read makes a sound is the visitor's to decide, once.
 *
 * Only "off" is ever written down. The markup's own answer is on, so a
 * visitor who never touches the box leaves nothing behind, and one who turns
 * it off is not beeped at on the next visit by a page that forgot.
 */
const SIGNAL_STORE = 'qr-barcode-reader-signal';

try {
  if (localStorage.getItem(SIGNAL_STORE) === 'off') el.signal.checked = false;
} catch {
  // Storage is refused in some private windows. The box keeps the markup's
  // answer and the choice lasts as long as the page does.
}

el.signal.addEventListener('change', () => {
  try {
    if (el.signal.checked) localStorage.removeItem(SIGNAL_STORE);
    else localStorage.setItem(SIGNAL_STORE, 'off');
  } catch {
    // As above: remembered until the page is closed, and no longer.
  }
  // Ticking the box is itself a tap, which is the moment a sound may be
  // asked for.
  if (el.signal.checked) chime.arm();
  else chime.release();
});

// A context can be suspended again after it was armed - by a permission sheet
// over the page, by a phone call - and is only let back from a gesture. The
// tap that started the camera has been spent by then; any later one will do.
document.addEventListener('pointerdown', () => {
  if (stream && el.signal.checked) chime.arm();
}, { passive: true });

// A tab put into the background keeps the camera light on and the frames
// coming, which is both a waste and a thing nobody asked for.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopCamera();
});
window.addEventListener('pagehide', stopCamera);

el.privacyToggle.addEventListener('click', () => {
  const open = el.privacyPanel.hidden;
  el.privacyPanel.hidden = !open;
  el.privacyToggle.setAttribute('aria-expanded', String(open));
});

/* -------------------------------------------------------------------- boot */

// An error thrown after boot would otherwise only reach the console, leaving
// the page looking functional and doing nothing.
window.addEventListener('error', (event) => {
  el.pickError.hidden = false;
  el.pickError.textContent = phrase('error.broke', { detail: event.message });
});
window.addEventListener('unhandledrejection', (event) => {
  el.pickError.hidden = false;
  el.pickError.textContent = phrase('error.broke', { detail: event.reason?.message ?? event.reason });
});

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
