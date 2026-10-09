/** UI wiring and application state. */

import { phrase, fill } from './shared/phrases.js';
import { sizeText, durationText } from './shared/format.js';
import { openInPlayer } from './shared/media.js';
import { saveBlob } from './shared/download.js';
import { messageBox } from './shared/message-box.js';
import { wireFilePicker } from './shared/file-picker.js';
import { demux, UnsupportedFile, UnsupportedTimeline } from './shared/mp4-reader.js';
import { FrameReader, decodeSeries, frameNear } from './frames.js';
import { drawUpright, frameCanvas } from './draw.js';
import { FORMATS, clockTime, encodeStill, stillName } from './still.js';
import { makeZip } from './shared/zip.js';
import { hasWebCodecs, canDecode, encodableTypes } from './support.js';
import { makeExample } from './example.js';
import { seriesPlan, coveringInterval, distinctFrameTimes } from './plan.js';
import { throwIfAborted } from './shared/errors.js';

/**
 * A reader refusal, in the reader's language. The demuxer is copied byte for
 * byte into fifteen languages, so what it hands back is a phrase key and its
 * values; `absent` is the sentence for the file that was never given to it at
 * all - the browser's own player took it instead.
 */
function why(fallback, absent) {
  return errorText({ message: fallback?.key, values: fallback?.values }, absent);
}

const $ = (id) => document.getElementById(id);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  source: $('source'),
  srcName: $('src-name'),
  srcSize: $('src-size'),
  srcFrame: $('src-frame'),
  srcLength: $('src-length'),
  srcCodec: $('src-codec'),
  srcFrames: $('src-frames'),
  pathNote: $('path-note'),
  findCard: $('find-card'),
  stage: $('stage'),
  preview: $('preview'),
  still: $('still'),
  stageBusy: $('stage-busy'),
  stepBack: $('step-back'),
  play: $('play'),
  stepOn: $('step-on'),
  scrub: $('scrub'),
  atTime: $('at-time'),
  atFrame: $('at-frame'),
  grabCard: $('grab-card'),
  format: $('format'),
  formatNote: $('format-note'),
  qualityField: $('quality-field'),
  quality: $('quality'),
  qualityValue: $('quality-value'),
  every: $('every'),
  seriesPlan: $('series-plan'),
  coverSeries: $('cover-series'),
  settings: document.querySelector('#grab-card .settings'),
  grab: $('grab'),
  grabSeries: $('grab-series'),
  cancel: $('cancel'),
  progress: $('progress'),
  progressBar: $('progress-bar'),
  progressLabel: $('progress-label'),
  error: $('error'),
  shotsCard: $('shots-card'),
  shotsCount: $('shots-count'),
  shots: $('shots'),
  downloadAll: $('download-all'),
  clear: $('clear'),
  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
};

const { show: showError, clear: clearError } = messageBox(el.error);
const formatBytes = (n) => sizeText(n, phrase, { kb: 0, mb: 1, gb: 'size.gb' });
const formatDuration = (seconds) => durationText(seconds, phrase);

/** @type {File|null} */
let file = null;
let objectUrl = null;
/** What demux() found, or null if this file is for the playback path. */
let media = null;
/** @type {FrameReader|null} */
let reader = null;
/** Whether the frames are decoded one by one rather than seen through a player. */
let exact = false;
/** Whether the browser will play this file at all. */
let playable = false;
/** Why the exact path is unavailable, in words, or null. */
let fallbackReason = null;
let source = { width: 0, height: 0 };
let duration = 0;
/** Where we are, in seconds. The one number both paths agree on. */
let position = 0;
/** Where we are, as a frame. Only meaningful on the exact path. */
let frameIndex = 0;
let playing = false;
let working = false;
let activeJob = null;
let sourceVersion = 0;
let loading = false;

/**
 * The frame the canvas is currently showing, and the one it has been asked to
 * show. Dragging a slider produces far more requests than a decoder can serve,
 * so requests collapse: whatever was asked for last is what gets decoded, and
 * everything asked for in between is dropped rather than queued.
 */
let wantedFrame = -1;
let shownFrame = -1;
let drawing = null;

/** The stills taken so far. */
let shots = [];
let nextShotId = 1;

/** Which of PNG, JPEG and WebP this browser will really write. */
let formats = new Set(['image/png']);

/* ------------------------------------------------------------------ adding */

// The drop zone and the picker: shared, because every tool here needs the
// same one. src/shared/file-picker.js, copied in from shared/js/ by the
// build. The resting label comes off the markup, so it is written once,
// in this tool.toml, rather than here as well.
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

/** Native error sentences are never used as CSS selectors by phrase(). */
function errorText(error, fallback) {
  const key = error?.message;
  const known = [...document.querySelectorAll('#phrases [data-phrase]')]
    .some((node) => node.dataset.phrase === key);
  return phrase(known ? key : fallback, fill(error?.values));
}

async function loadFile(picked) {
  const version = ++sourceVersion;
  const current = () => version === sourceVersion;
  cancelJob();
  clearError();
  resetView();
  loading = true;
  file = picked;
  refreshControls();
  picker.busy(phrase('step.reading'));
  try {
    objectUrl = URL.createObjectURL(picked);
    const played = await openInPlayer(el.preview, objectUrl);
    if (!current()) return;
    let found = null;
    let fallback = null;
    try {
      found = await demux(picked);
    } catch (error) {
      if (!current()) return;
      if (error instanceof UnsupportedTimeline) throw error;
      fallback = error instanceof UnsupportedFile
        ? { key: error.reason, values: error.values }
        : { key: 'read.unreadable' };
    }
    if (!current()) return;
    let decodable = false;
    if (found && hasWebCodecs()) {
      decodable = await canDecode({
        codec: found.video.codec,
        codedWidth: found.video.codedWidth,
        codedHeight: found.video.codedHeight,
        ...(found.video.description ? { description: found.video.description } : {}),
      });
      if (!current()) return;
      if (!decodable) fallback = { key: 'read.nodecoder', values: { codec: found.video.codec } };
    } else if (found) fallback = { key: 'read.nowebcodecs' };
    if (decodable && !distinctFrameTimes(found.video.samples
      .map((sample) => ({ time: sample.pts })).sort((a, b) => a.time - b.time))) {
      decodable = false;
      fallback = { key: 'read.duplicatetime' };
    }
    if (decodable && played.ok
      && (played.width !== found.video.displayWidth || played.height !== found.video.displayHeight)) {
      decodable = false;
      fallback = { key: 'read.turned' };
    }
    if (!decodable && !played.ok) {
      showError(phrase('open.failed', { reason: why(fallback, 'read.notplayed') }));
      resetView();
      return;
    }
    media = found;
    fallbackReason = fallback;
    exact = decodable;
    playable = played.ok;
    source = exact
      ? { width: found.video.displayWidth, height: found.video.displayHeight }
      : { width: played.width, height: played.height };
    duration = played.duration || (found ? found.duration : 0);
    if (exact) {
      reader = new FrameReader(picked, found.video);
      if (!duration) duration = reader.timeOf(reader.count - 1);
    }
    layOutStage();
    describeSource();
    updateFormatNote();
    setUpTransport();
    await goTo(0);
  } catch (error) {
    if (current()) {
      showError(errorText(error, 'open.notopened'));
      resetView();
    }
  } finally {
    if (current()) {
      loading = false;
      picker.done();
      refreshControls();
      updateSeriesButton();
    }
  }
}

function layOutStage() {
  el.stage.style.aspectRatio = `${source.width} / ${source.height}`;
  // Height is capped through the width, because capping the height of a box
  // that has both a width and an aspect ratio is what breaks the ratio.
  el.stage.style.maxWidth = `calc(62vh * ${source.width / source.height})`;

  // On the exact path what you look at is the decoded frame itself, so the
  // canvas is the resting view and the <video> only appears while it plays.
  el.preview.hidden = exact;
  el.still.hidden = !exact;
}

function describeSource() {
  el.source.hidden = false;
  el.srcName.textContent = file.name;
  el.srcSize.textContent = formatBytes(file.size);
  el.srcFrame.textContent = phrase('size.plain',
    { width: source.width, height: source.height });
  el.srcLength.textContent = duration ? formatDuration(duration) : phrase('len.unknown');

  if (exact) {
    el.srcCodec.textContent = media.video.rotation
      ? phrase('src.codec.turned', {
        codec: media.video.codec,
        entry: media.video.entryType,
        degrees: media.video.rotation,
      })
      : phrase('src.codec', { codec: media.video.codec, entry: media.video.entryType });
    el.srcFrames.textContent = phrase(reader.count === 1 ? 'n.frame.one' : 'n.frame.many',
      { n: reader.count.toLocaleString() });
  } else {
    el.srcCodec.textContent = phrase('src.byplayer');
    el.srcFrames.textContent = phrase('src.uncounted');
  }

  el.pathNote.hidden = exact && playable;
  if (!exact) {
    el.pathNote.textContent = phrase('path.player', {
      reason: why(fallbackReason, 'read.layout'),
    });
  } else if (!playable) {
    el.pathNote.textContent = phrase('path.nopreview');
  }
}

function releaseFile() {
  if (objectUrl) {
    el.preview.removeAttribute('src');
    el.preview.load();
    URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  }
  el.preview.pause();
  reader?.release();
  reader = null;
  media = null;
  file = null;
  playing = false;
  wantedFrame = -1;
  shownFrame = -1;
  drawing = null;
  exact = false;
  playable = false;
  duration = 0;
  position = 0;
  frameIndex = 0;
  source = { width: 0, height: 0 };
}

function resetView() {
  el.source.hidden = true;
  el.pathNote.hidden = true;
  releaseFile();
  el.still.width = el.still.height = 0;
  el.still.hidden = true;
  el.preview.hidden = true;
  el.stageBusy.hidden = true;
  el.play.textContent = '▶';
  el.play.setAttribute('aria-label', phrase('play.play'));
  el.atTime.textContent = clockTime(0);
  el.atFrame.textContent = '';
  el.scrub.value = '0';
  el.findCard.inert = true;
  el.settings.inert = true;
  el.seriesPlan.hidden = true;
  el.coverSeries.hidden = true;
}

/* --------------------------------------------------------------- the moment */

/**
 * The slider addresses frames on the exact path and milliseconds on the other.
 *
 * Addressing frames is the point of the first one: dragging it moves through
 * the pictures the file actually holds, one per step, rather than through a
 * time that then has to be rounded to a frame anyway.
 */
function setUpTransport() {
  if (exact) {
    el.scrub.min = '0';
    el.scrub.max = String(Math.max(0, reader.count - 1));
    el.scrub.step = '1';
  } else {
    el.scrub.min = '0';
    el.scrub.max = String(Math.max(1, Math.round(duration * 1000)));
    el.scrub.step = '1';
  }
  el.play.disabled = !playable;
  el.play.title = phrase(playable ? 'play.title' : 'play.cannot');
}

/** Move to a point in the clip, in seconds. */
async function goTo(seconds) {
  const clamped = Math.max(0, Math.min(seconds, duration || seconds));
  if (exact) {
    await goToFrame(frameNear(reader.order, clamped));
  } else {
    position = clamped;
    el.scrub.value = String(Math.round(clamped * 1000));
    updateReadout();
    await seekPlayer(clamped);
  }
}

/** Move to a frame, by its place in the order the frames are watched in. */
async function goToFrame(index) {
  if (!exact || !reader) return;
  const version = sourceVersion;
  frameIndex = Math.max(0, Math.min(index, reader.count - 1));
  position = reader.timeOf(frameIndex);
  el.scrub.value = String(frameIndex);
  updateReadout();
  await showFrame(frameIndex);
  if (version === sourceVersion) showStill();
}

/**
 * Swap the stage over to the decoded frame.
 *
 * Separate from the drawing, and deliberately: pausing on a frame that is
 * already on the canvas draws nothing at all, and a swap that lived inside the
 * drawing would leave the player showing instead of the still it had just
 * decided to show.
 */
function showStill() {
  if (!exact) return;
  el.still.hidden = false;
  el.preview.hidden = true;
}

function updateReadout() {
  el.atTime.textContent = clockTime(position);
  el.atFrame.textContent = exact
    ? phrase('at.frame', {
      n: (frameIndex + 1).toLocaleString(),
      total: reader.count.toLocaleString(),
    })
    : phrase('at.notread');
}

/**
 * Draw a decoded frame into the stage canvas.
 *
 * Requests collapse rather than queue: a drag of the slider asks for a hundred
 * frames and the only one worth having is the last.
 */
async function showFrame(index) {
  if (!reader) return;
  wantedFrame = index;
  if (drawing) return;
  const owner = { version: sourceVersion, reader };
  drawing = owner;
  const current = () => owner.version === sourceVersion && owner.reader === reader;
  try {
    while (current() && wantedFrame !== shownFrame) {
      const target = wantedFrame;
      const slow = setTimeout(() => { if (current()) el.stageBusy.hidden = false; }, 120);
      try {
        const bitmap = await owner.reader.frameAt(target);
        if (!current()) return;
        if (wantedFrame !== target) continue;
        paintStage(bitmap);
        shownFrame = target;
      } finally {
        clearTimeout(slow);
        if (current()) el.stageBusy.hidden = true;
      }
    }
  } catch (error) {
    if (current() && error?.name !== 'AbortError') showError(errorText(error, 'decode.nodecode'));
  } finally {
    if (drawing === owner) drawing = null;
  }
}

/**
 * The preview is the same picture as the file, drawn smaller: a canvas of about
 * the size it is shown at rather than the full frame, because a 4K canvas
 * scaled down by CSS costs memory on every step for a picture nobody is
 * inspecting at that size. What gets saved is drawn separately, at full size.
 */
function paintStage(bitmap) {
  const width = Math.max(2, Math.min(source.width, Math.round(el.stage.clientWidth || 960)));
  const scale = width / source.width;

  el.still.width = width;
  el.still.height = Math.max(2, Math.round(source.height * scale));
  drawUpright(el.still.getContext('2d', { alpha: false }), bitmap, {
    rotation: media.video.rotation,
    displayWidth: source.width,
    displayHeight: source.height,
    scale,
  });
}

/** Ask the player to move, and wait until it has actually got there. */
function seekPlayer(seconds, signal) {
  throwIfAborted(signal);
  if (!playable) return Promise.resolve();
  return new Promise((resolve, reject) => {
    if (Math.abs(el.preview.currentTime - seconds) < 0.001 && el.preview.readyState >= 2) {
      resolve();
      return;
    }
    const done = () => {
      clearTimeout(timer);
      el.preview.removeEventListener('seeked', done);
      signal?.removeEventListener('abort', stopped);
      resolve();
    };
    const stopped = () => { try { throwIfAborted(signal); } catch (error) { reject(error); } done(); };
    const timer = setTimeout(done, 4000);
    signal?.addEventListener('abort', stopped, { once: true });
    el.preview.addEventListener('seeked', done, { once: true });
    el.preview.currentTime = seconds;
  });
}

/** One frame forward or back. */
function step(by) {
  if (!ready() || working) return;
  if (playing) pause();
  if (exact) {
    goToFrame(frameIndex + by);
  } else {
    // No frame list on this path, so a step is a nudge of about a frame at a
    // common rate. The page says as much rather than pretending otherwise.
    goTo(position + by / 30);
  }
}

function play() {
  if (!ready() || working || !playable || playing) return;
  playing = true;
  el.play.textContent = '⏸';
  el.play.setAttribute('aria-label', phrase('play.pause'));
  el.preview.hidden = false;
  el.still.hidden = true;
  el.preview.currentTime = position;
  el.preview.play().catch(() => pause());
  follow();
}

function pause() {
  if (!playing) return;
  playing = false;
  el.play.textContent = '▶';
  el.play.setAttribute('aria-label', phrase('play.play'));
  el.preview.pause();
  // Snap to the frame that was on screen, so what is saved is what was seen.
  goTo(el.preview.currentTime);
}

/** Keep the slider and the clock in step while it plays. */
function follow() {
  if (!playing) return;
  position = el.preview.currentTime;
  if (exact) {
    frameIndex = frameNear(reader.order, position);
    el.scrub.value = String(frameIndex);
  } else {
    el.scrub.value = String(Math.round(position * 1000));
  }
  updateReadout();
  requestAnimationFrame(follow);
}

el.play.addEventListener('click', () => (playing ? pause() : play()));

// A player stops for reasons of its own as well as ours: the clip ends, the
// browser stops video in a background tab to save power, a headset button gets
// pressed. Following the element rather than only our own button is what keeps
// the label, the canvas and the frame number honest when that happens. pause()
// clears `playing` before it touches the element, so this cannot loop.
el.preview.addEventListener('pause', () => pause());
el.preview.addEventListener('ended', () => pause());
el.stepBack.addEventListener('click', () => step(-1));
el.stepOn.addEventListener('click', () => step(1));

el.scrub.addEventListener('input', () => {
  if (!ready() || working) { el.scrub.value = String(exact ? frameIndex : Math.round(position * 1000)); return; }
  if (playing) pause();
  const value = Number(el.scrub.value);
  if (exact) goToFrame(value);
  else goTo(value / 1000);
});

document.addEventListener('keydown', (event) => {
  if (!ready() || working || el.findCard.inert || event.ctrlKey || event.metaKey || event.altKey) return;
  const tag = event.target?.tagName;
  if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

  if (event.key === 'ArrowLeft') step(event.shiftKey ? -10 : -1);
  else if (event.key === 'ArrowRight') step(event.shiftKey ? 10 : 1);
  else if (event.key === ' ' && tag !== 'BUTTON' && tag !== 'A') {
    if (!playable) return;
    if (playing) pause();
    else play();
  } else return;

  event.preventDefault();
});

/* ------------------------------------------------------------ the settings */

function currentType() {
  const type = el.format.value;
  return formats.has(type) ? type : 'image/png';
}

function updateFormatNote() {
  const type = currentType();
  el.qualityField.hidden = type === 'image/png';
  el.formatNote.textContent = type === 'image/png'
    ? phrase('note.png', { width: source.width || '?', height: source.height || '?' })
    : phrase('note.lossy');
}

el.format.addEventListener('change', () => { restoreJobSettings(); updateFormatNote(); });
el.quality.addEventListener('input', () => {
  restoreJobSettings();
  el.qualityValue.textContent = el.quality.value;
});
el.every.addEventListener('change', updateSeriesButton);
el.every.addEventListener('input', updateSeriesButton);

function plannedSeries() {
  return ready() ? seriesPlan({ order: exact ? reader.order : null, duration, every: Number(el.every.value) }) : null;
}

function updateSeriesButton() {
  restoreJobSettings();
  const every = Number(el.every.value);
  el.grabSeries.textContent = Number.isFinite(every) && every >= 0.1
    ? phrase(every === 1 ? 'series.every.one' : 'series.every.many', { n: every.toLocaleString(undefined, { maximumFractionDigits: 3 }) })
    : phrase('series.any');
  const plan = plannedSeries();
  el.seriesPlan.hidden = !plan;
  el.coverSeries.hidden = !plan?.overflow;
  if (plan) el.seriesPlan.textContent = phrase(plan.overflow ? 'series.overlimit' : exact ? 'series.plan' : 'series.plan.player', {
    n: plan.count.toLocaleString(), first: clockTime(plan.first), last: clockTime(plan.last),
  });
  el.grabSeries.disabled = working || !plan || plan.overflow || !plan.count;
}

el.coverSeries.addEventListener('click', () => {
  if (!ready() || working) return;
  el.every.value = String(coveringInterval(exact ? reader.order.at(-1).time : duration));
  updateSeriesButton();
});

/* -------------------------------------------------------------- the stills */

function addShot({ blob, time, width, height, type, sourceName }) {
  const shot = {
    id: nextShotId++,
    blob,
    time,
    width,
    height,
    type,
    name: stillName(sourceName, time, type),
    url: URL.createObjectURL(blob),
  };
  shots.push(shot);
  renderShots();
  return shot;
}

function renderShots() {
  el.shotsCard.inert = !shots.length;
  el.downloadAll.disabled = working || !shots.length;
  el.shotsCount.textContent = phrase(
    shots.length === 1 ? 'n.still.one' : 'n.still.many',
    { n: shots.length },
  );

  el.shots.replaceChildren(...shots.map((shot) => {
    const item = document.createElement('li');
    item.className = 'shot';

    const image = document.createElement('img');
    image.src = shot.url;
    image.alt = phrase('shot.alt', { time: clockTime(shot.time) });
    image.loading = 'lazy';

    const body = document.createElement('div');
    body.className = 'shot-body';
    const when = document.createElement('span');
    when.className = 'shot-time';
    when.textContent = clockTime(shot.time);
    const meta = document.createElement('span');
    meta.className = 'shot-meta';
    meta.textContent = [
      FORMATS[shot.type]?.label ?? 'PNG',
      phrase('size.plain', { width: shot.width, height: shot.height }),
      formatBytes(shot.blob.size),
    ].reduce((a, b) => phrase('join.dot', { a, b }));
    body.append(when, meta);

    const actions = document.createElement('div');
    actions.className = 'shot-actions';
    const save = document.createElement('a');
    save.className = 'as-button';
    save.href = shot.url;
    save.download = shot.name;
    save.textContent = phrase('shot.save');
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'ghost danger';
    remove.textContent = phrase('shot.remove');
    remove.addEventListener('click', () => removeShot(shot.id));
    actions.append(save, remove);

    item.append(image, body, actions);
    return item;
  }));
}

function removeShot(id) {
  if (activeJob?.kind === 'zip') cancelJob();
  const shot = shots.find((other) => other.id === id);
  if (shot) URL.revokeObjectURL(shot.url);
  shots = shots.filter((other) => other.id !== id);
  renderShots();
}

function clearShots() {
  cancelJob();
  for (const shot of shots) URL.revokeObjectURL(shot.url);
  shots = [];
  renderShots();
}

el.clear.addEventListener('click', clearShots);

/**
 * One archive rather than a save prompt per still. Names are made unique on the
 * way in: two stills of the same frame in the same format would otherwise land
 * on one name, and a ZIP with two entries called the same thing is a ZIP that
 * unpacks to one file.
 */
el.downloadAll.addEventListener('click', async () => {
  if (!shots.length || working || loading) return;
  const selected = shots.slice();
  const job = beginJob('zip');
  const base = (job.name ?? 'video').replace(/\.[^.]+$/, '');
  clearError();
  el.progress.hidden = false;
  setProgress({ done: 0, total: selected.length, step: 'step.packing' });
  try {
    const used = new Set();
    const files = [];
    for (const [index, shot] of selected.entries()) {
      checkJob(job);
      let name = shot.name;
      for (let n = 2; used.has(name); n++) name = shot.name.replace(/(\.[^.]+)$/, `-${n}$1`);
      used.add(name);
      const data = new Uint8Array(await shot.blob.arrayBuffer());
      checkJob(job);
      files.push({ name, data });
      setProgress({ done: index + 1, total: selected.length, step: 'step.packing' });
    }
    checkJob(job);
    saveBlob(makeZip(files), `${base}-stills.zip`);
  } catch (error) {
    if (ownsJob(job) && error?.name !== 'AbortError') showError(errorText(error, 'zip.failed'));
  } finally { finishJob(job); }
});

/* ------------------------------------------------------------- the grabbing */

/** The frame on screen, at its full size, ready to encode. */
async function currentCanvas(job, at = job.time, index = job.index) {
  checkJob(job);
  if (job.exact) {
    const bitmap = await job.reader.frameAt(index);
    checkJob(job);
    return frameCanvas(bitmap, { rotation: job.video.rotation, displayWidth: job.width, displayHeight: job.height });
  }
  await seekPlayer(at, job.controller.signal);
  checkJob(job);
  return frameCanvas(el.preview, { rotation: 0, displayWidth: job.width, displayHeight: job.height });
}

function encodeOptions() {
  return { type: currentType(), quality: Number(el.quality.value) / 100 };
}

el.grab.addEventListener('click', async () => {
  if (working || !ready()) return;
  if (playing) pause();
  clearError();
  const job = beginJob('still');
  let canvas;
  try {
    canvas = await currentCanvas(job);
    const time = job.exact ? job.time : el.preview.currentTime;
    const blob = await encodeStill(canvas, job.options);
    checkJob(job);
    const shot = addShot({ blob, time, width: canvas.width, height: canvas.height, type: job.options.type, sourceName: job.name });
    el.shotsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    el.grab.title = phrase('grab.last', { name: shot.name });
  } catch (error) {
    if (ownsJob(job) && error?.name !== 'AbortError') showError(errorText(error, 'save.failed'));
  } finally {
    if (canvas) canvas.width = canvas.height = 0;
    finishJob(job);
  }
});

el.grabSeries.addEventListener('click', async () => {
  if (working || !ready()) return;
  const plan = plannedSeries();
  if (!plan || !plan.count) { showError(phrase('series.nointerval')); return; }
  if (plan.overflow) { updateSeriesButton(); return; }
  if (playing) pause();
  clearError();
  const job = beginJob('series');
  el.progress.hidden = false;
  setProgress({ done: 0, total: plan.count, step: 'step.grabbing' });
  const accept = async (time, canvas) => {
    try {
      checkJob(job);
      const blob = await encodeStill(canvas, job.options);
      checkJob(job);
      addShot({ blob, time, width: canvas.width, height: canvas.height, type: job.options.type, sourceName: job.name });
    } finally { canvas.width = canvas.height = 0; }
  };
  try {
    if (job.exact) {
      await decodeSeries({
        file: job.file, video: job.video, indexes: plan.indexes, signal: job.controller.signal,
        onProgress: ({ done, total }) => { if (ownsJob(job)) setProgress({ done, total, step: 'step.grabbing' }); },
        onFrame: (index, canvas) => accept(job.reader.timeOf(index), canvas),
      });
    } else {
      for (let n = 0; n < plan.count; n++) {
        const at = n * job.every;
        const canvas = await currentCanvas(job, at);
        const time = el.preview.currentTime;
        await accept(time, canvas);
        checkJob(job);
        position = time;
        el.scrub.value = String(Math.round(time * 1000));
        updateReadout();
        setProgress({ done: n + 1, total: plan.count, step: 'step.grabbing' });
      }
    }
    checkJob(job);
    el.shotsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) {
    if (ownsJob(job) && error?.name !== 'AbortError') showError(errorText(error, 'series.failed'));
  } finally { finishJob(job); }
});

function ready() { return Boolean(file && !loading && (exact || playable)); }
function ownsJob(job) { return activeJob === job && job.version === sourceVersion && !job.controller.signal.aborted; }
function checkJob(job) {
  if (!ownsJob(job)) job.controller.abort();
  throwIfAborted(job.controller.signal);
}
function beginJob(kind) {
  const job = { kind, version: sourceVersion, controller: new AbortController(), file, name: file?.name,
    exact, reader, video: media?.video, width: source.width, height: source.height,
    time: position, index: frameIndex, options: encodeOptions(), every: Number(el.every.value) };
  activeJob = job;
  setWorking(true);
  el.cancel.hidden = false;
  return job;
}
function finishJob(job) {
  if (activeJob !== job) return;
  activeJob = null;
  el.cancel.hidden = true;
  el.progress.hidden = true;
  setWorking(false);
}
function cancelJob() {
  if (!activeJob) return;
  const job = activeJob;
  job.controller.abort();
  finishJob(job);
}
el.cancel.addEventListener('click', cancelJob);
function restoreJobSettings() {
  if (!activeJob) return;
  el.format.value = activeJob.options.type;
  el.quality.value = String(activeJob.options.quality * 100);
  el.every.value = String(activeJob.every);
}
function refreshControls() {
  const locked = working || !ready();
  el.findCard.inert = locked;
  el.settings.inert = locked;
  el.grab.disabled = locked;
  el.downloadAll.disabled = working || loading || !shots.length;
  updateSeriesButton();
}
function setWorking(state) {
  working = state;
  refreshControls();
}

// `step` names the whole sentence rather than a word glued in front of a
// count: where the verb falls in that line is not the same in every language.
function setProgress({ done, total, step }) {
  const fraction = total > 0 ? Math.min(1, done / total) : 0;
  el.progressBar.style.width = `${(fraction * 100).toFixed(1)}%`;
  el.progressLabel.textContent = phrase(step, {
    done: done.toLocaleString(),
    total: total.toLocaleString(),
    percent: Math.round(fraction * 100),
  });
}

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

/* -------------------------------------------------------------------- boot */

window.addEventListener('error', (event) => {
  showError(phrase('error.broke', { detail: event.message }));
});
window.addEventListener('unhandledrejection', (event) => {
  showError(phrase('error.broke', { detail: event.reason?.message ?? event.reason }));
});

/** Hide the formats this browser would only pretend to write. */
async function offerFormats() {
  formats = await encodableTypes();
  for (const option of el.format.options) {
    option.disabled = !formats.has(option.value);
  }
  if (!formats.has(el.format.value)) el.format.value = 'image/png';
  updateFormatNote();
}

refreshControls();
updateFormatNote();
offerFormats();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
