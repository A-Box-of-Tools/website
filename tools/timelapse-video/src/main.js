/** UI wiring and application state. */

import { phrase, fill } from './shared/phrases.js';
import { decoderConfig, averageFps } from './shared/webcodecs.js';
import { sizeText, durationText } from './shared/format.js';
import { openInPlayer } from './shared/media.js';
import { messageBox } from './shared/message-box.js';
import { wireFilePicker } from './shared/file-picker.js';
import { demux, UnsupportedFile, UnsupportedTimeline } from './shared/mp4-reader.js';
import { timelapseByDecoding, previewFrame } from './decode.js';
import { timelapseByPlaying } from './playback.js';
import { TimelapseWriter } from './encode.js';
import { hasEncoder, hasWebCodecs, canDecode, pickH264Codec } from './shared/video-support.js';
import {
  MIN_FRAMES,
  clampSpeed, speedForLength, lengthForSpeed, sampleInterval, frameTimes, repeatsFrames,
  outputSize, chooseBitrate, estimateBytes, decodeRuns, decodeCost,
} from './plan.js';
import { said, throwIfAborted } from './shared/errors.js';
import { makeExample } from './example.js';

/**
 * A reader refusal, in the reader's language. The demuxer is copied byte for
 * byte into fifteen languages, so what it hands back is a phrase key and its
 * values; `absent` is the sentence for the file that was never given to it at
 * all - the browser's own player took it instead.
 */
function why(fallback, absent) {
  return phrase(fallback?.key ?? absent, fallback?.values);
}

const $ = (id) => document.getElementById(id);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  previewWrap: $('preview-wrap'),
  preview: $('preview'),
  still: $('still'),
  previewNote: $('preview-note'),
  source: $('source'),
  srcName: $('src-name'),
  srcSize: $('src-size'),
  srcFrame: $('src-frame'),
  srcLength: $('src-length'),
  srcFps: $('src-fps'),
  srcCodec: $('src-codec'),
  pathNote: $('path-note'),
  speedCard: $('speed-card'),
  speedRow: document.querySelector('.speed-row'),
  speed: $('speed'),
  length: $('length'),
  intervalNote: $('interval-note'),
  fps: $('fps'),
  size: $('size'),
  sizeNote: $('size-note'),
  quality: $('quality'),
  exportCard: $('export-card'),
  sumFrames: $('sum-frames'),
  sumInterval: $('sum-interval'),
  sumLength: $('sum-length'),
  sumSize: $('sum-size'),
  sumRead: $('sum-read'),
  sumBytes: $('sum-bytes'),
  planNote: $('plan-note'),
  exportBtn: $('export'),
  cancelBtn: $('cancel'),
  progress: $('progress'),
  progressBar: $('progress-bar'),
  progressLabel: $('progress-label'),
  error: $('error'),
  result: $('result'),
  resultVideo: $('result-video'),
  resultInfo: $('result-info'),
  download: $('download'),
  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
};

const { show: showError, clear: clearError } = messageBox(el.error);
const formatBytes = (n) => sizeText(n, phrase, { kb: 0, mb: 1, gb: 'size.gb' });
const formatDuration = (seconds) => durationText(seconds, phrase, { hours: 'time.hours' });

/** @type {File|null} */
let file = null;
let objectUrl = null;
/** What demux() found, or null if this file has to go through the player. */
let media = null;
/** Why the direct path is unavailable, in words, or null. */
let fallbackReason = null;
let source = { width: 0, height: 0 };
let duration = 0;
/** The source's own frame rate, or 0 when only the player has opened the file. */
let sourceFps = 0;
let canReadDirectly = false;
let canPlay = false;
let working = false;
let abortController = null;
let lastResultUrl = null;
let loadId = 0;
let loadController = null;
let loading = false;
let ready = false;

/* ------------------------------------------------------------------ adding */

// The drop zone and the picker: shared, because every tool here needs the same
// one. src/shared/file-picker.js, copied in from shared/js/ by the build. The
// resting label comes off the markup, so it is written once, in this tool.toml,
// rather than here as well.
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

/**
 * How long to wait for the probe frame before giving up on the file.
 *
 * The same ten seconds a seek gets during the export itself, deliberately: a
 * file too slow to answer here would be too slow there several hundred times
 * over, so this is not a stricter test than the one it is standing in for.
 */
const PROBE_TIMEOUT = 10_000;

/**
 * Whether the player can actually produce a picture, and not merely a width.
 *
 * `loadedmetadata` is not a decode test, and treating it as one is what let a
 * file through that then failed an hour and a half into the export. Matroska
 * and WebM are the same container - WebM is a subset of Matroska - so Chrome
 * opens an .mkv with its WebM demuxer, reads the video track's size and
 * duration, and fires `loadedmetadata` having decoded nothing at all. A Dolby
 * Vision track inside it gets as far as "3840 x 1540, 1h 30m" on the page and
 * only fails when the first frame is demanded. `canPlayType` would have said
 * so - it answers "" for dvh1 and "probably" for hvc1 - but nothing here knows
 * which of the two is in the file until something tries to decode it.
 *
 * So: seek somewhere real and insist on a frame. `requestVideoFrameCallback`
 * is the one API that means "a frame is on screen"; where it does not fire -
 * a tab that is not compositing never presents anything - `readyState` of
 * HAVE_CURRENT_DATA or better is the element's own claim to hold a decoded
 * frame, which a track it cannot decode never reaches.
 */
function firstFrameLands(video, atSeconds, signal) {
  return new Promise((resolve) => {
    let settled = false;
    let timer;
    let fallbackTimer;
    let frameCallback;

    const done = (ok) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
      if (frameCallback !== undefined) video.cancelVideoFrameCallback?.(frameCallback);
      video.removeEventListener('error', onError);
      video.removeEventListener('seeked', onSeeked);
      signal.removeEventListener('abort', onAbort);
      resolve(ok);
    };

    const decoded = () => video.readyState >= 2 && !video.error;
    const onError = () => done(false);
    const onAbort = () => done(false);
    const onSeeked = () => {
      if (typeof video.requestVideoFrameCallback === 'function') {
        frameCallback = video.requestVideoFrameCallback(() => done(true));
      }
      fallbackTimer = setTimeout(() => done(decoded()), 500);
    };

    if (signal.aborted) { done(false); return; }
    timer = setTimeout(() => done(false), PROBE_TIMEOUT);
    video.addEventListener('error', onError, { once: true });
    video.addEventListener('seeked', onSeeked, { once: true });
    signal.addEventListener('abort', onAbort, { once: true });

    // Somewhere other than zero, so this is a real seek and a real decode
    // rather than whatever the element happened to buffer on load.
    try {
      if (Math.abs(video.currentTime - atSeconds) < 1e-4) onSeeked();
      else video.currentTime = atSeconds;
    } catch { done(false); }
  });
}

/** The example wrapper stays inert even if its own pending generator enables its button. */
function lockSourcePicker(locked) {
  el.fileInput.disabled = locked;
  el.dropzone.inert = locked;
  el.dropzone.setAttribute('aria-disabled', String(locked));
  const example = $('example-button')?.parentElement;
  if (example) example.inert = locked;
}

async function loadFile(picked) {
  if (working) {
    // A native chooser opened earlier can finish after export starts. The
    // shared handoff wakes waiting cards, so reassert this page's source lock.
    lockSourcePicker(true);
    return;
  }

  clearError();
  releaseFile();
  const mine = loadId;
  const controller = new AbortController();
  const { signal } = controller;
  loadController = controller;
  loading = true;
  el.speedCard.inert = true;
  picker.busy(phrase('step.reading'));

  // Metadata and frame probes belong to this file until it is ready. Retiring
  // one player must never cancel a newer player's native decode or callbacks.
  const preview = el.preview.cloneNode(false);
  preview.removeAttribute('src');
  preview.muted = true;
  let url = URL.createObjectURL(picked);
  let installed = false;
  let canvas = null;
  const current = () => mine === loadId && !signal.aborted;
  const dispose = () => {
    if (installed || !url) return;
    preview.pause();
    preview.removeAttribute('src');
    preview.load();
    URL.revokeObjectURL(url);
    url = null;
  };
  signal.addEventListener('abort', dispose, { once: true });

  try {
    const played = await openInPlayer(preview, url);
    throwIfAborted(signal);

    let found = null;
    let refused = null;
    try {
      found = await demux(picked);
      throwIfAborted(signal);
    } catch (error) {
      throwIfAborted(signal);
      if (error instanceof UnsupportedTimeline) throw error;
      refused = error instanceof UnsupportedFile
        ? { key: error.reason, values: error.values }
        : { key: error.message || 'read.unreadable' };
    }

    let readable = false;
    if (found && hasWebCodecs()) {
      readable = await canDecode(decoderConfig(found.video));
      throwIfAborted(signal);
      if (!readable) {
        refused = { key: 'read.nodecoder', values: { codec: found.video.codec } };
      }
    } else if (found) {
      refused = { key: 'read.nowebcodecs' };
    }

    // The direct path has already checked the real decoder configuration;
    // only the playback fallback still needs to prove that a picture lands.
    let playable = played.ok;
    let opensButCannotDecode = false;
    if (!readable && played.ok) {
      picker.busy(phrase('step.checking'));
      playable = await firstFrameLands(preview,
        Math.min(1, (played.duration || 2) / 2), signal);
      throwIfAborted(signal);
      opensButCannotDecode = !playable;
    }

    if (!readable && !playable) {
      throw opensButCannotDecode ? said('open.nodecode')
        : said('open.failed', { reason: why(refused, 'read.notplayed') });
    }
    if (!hasEncoder()) throw said('nocodec.file');

    const dimensions = readable
      ? { width: found.video.displayWidth, height: found.video.displayHeight }
      : { width: played.width, height: played.height };
    const seconds = played.duration || (found ? found.duration : 0);
    if (!(seconds > 0)) throw said('open.nolength');

    let previewFailure = null;
    if (!playable) {
      try {
        canvas = await previewFrame({ file: picked, media: found, atSeconds: 0, signal });
        throwIfAborted(signal);
      } catch (error) {
        throwIfAborted(signal);
        previewFailure = error;
      }
    }
    if (!current()) return;

    el.preview.replaceWith(preview);
    el.preview = preview;
    objectUrl = url;
    url = null;
    installed = true;
    file = picked;
    media = found;
    fallbackReason = refused;
    source = dimensions;
    duration = seconds;
    sourceFps = readable ? averageFps(found.video) : 0;
    canReadDirectly = readable;
    canPlay = playable;
    loading = false;
    ready = true;
    showPreview(canvas, previewFailure);
    describeSource();
    fitSizeOptions();
    el.speedCard.inert = false;
    el.exportCard.inert = false;
    setSpeed(defaultSpeed(), null);
  } catch (error) {
    if (!current()) return;
    console.error(error);
    showError(error?.message
      ? phrase(error.message, fill(error.values)) : phrase('open.notopened'));
  } finally {
    signal.removeEventListener('abort', dispose);
    dispose();
    if (canvas) canvas.width = canvas.height = 0;
    if (mine === loadId) {
      loadController = null;
      loading = false;
      el.speedCard.inert = false;
      el.exportCard.inert = false;
      picker.done();
    }
  }
}

/** A decoded preview is copied only after its file wins ownership of the page. */
function showPreview(canvas, failure) {
  el.previewWrap.hidden = false;
  el.preview.hidden = !canPlay;
  el.still.hidden = !canvas;
  el.previewNote.hidden = canPlay;
  if (canPlay) return;

  el.previewNote.textContent = failure
    ? phrase('preview.none', { why: phrase(failure.message, fill(failure.values)) })
    : phrase('preview.still');
  if (canvas) {
    try {
      el.still.width = canvas.width;
      el.still.height = canvas.height;
      el.still.getContext('2d').drawImage(canvas, 0, 0);
    } catch (error) {
      // The optional picture cannot refuse an otherwise usable direct source.
      el.still.hidden = true;
      el.still.width = el.still.height = 0;
      el.previewNote.textContent = phrase('preview.none',
        { why: phrase(error.message, fill(error.values)) });
    }
  }
}

function describeSource() {
  el.source.hidden = false;
  el.srcName.textContent = file.name;
  el.srcSize.textContent = formatBytes(file.size);
  el.srcFrame.textContent = phrase('size.plain',
    { width: source.width, height: source.height });
  el.srcLength.textContent = formatDuration(duration);
  el.srcFps.textContent = sourceFps
    ? phrase('src.fps', { n: sourceFps.toFixed(sourceFps < 10 ? 1 : 0) })
    : phrase('src.fps.player');

  if (media) {
    el.srcCodec.textContent = media.video.rotation
      ? phrase('src.codec.turned', {
        codec: media.video.codec,
        entry: media.video.entryType,
        degrees: media.video.rotation,
      })
      : phrase('src.codec', { codec: media.video.codec, entry: media.video.entryType });
  } else {
    el.srcCodec.textContent = phrase('src.byplayer');
  }

  el.pathNote.hidden = canReadDirectly;
  if (!canReadDirectly) {
    el.pathNote.textContent = phrase('path.seek', {
      reason: why(fallbackReason, 'read.layout'),
    });
  }
}

/**
 * A first speed that produces something worth watching: about fifteen seconds
 * of output, rounded to one of the buttons, rather than a fixed number that
 * turns a thirty-second clip into three frames.
 */
function defaultSpeed() {
  const presets = [...el.speedRow.querySelectorAll('[data-speed]')]
    .map((button) => Number(button.dataset.speed));
  const wanted = duration / 15;
  let best = presets[0];
  for (const preset of presets) {
    if (Math.abs(preset - wanted) < Math.abs(best - wanted)) best = preset;
  }
  return clampSpeed(Math.min(best, duration / (MIN_FRAMES / outputFps())));
}

function releaseResult() {
  el.result.hidden = true;
  el.resultVideo.pause();
  el.resultVideo.removeAttribute('src');
  el.resultVideo.load();
  el.resultInfo.textContent = '';
  el.download.removeAttribute('href');
  el.download.removeAttribute('download');
  if (lastResultUrl) URL.revokeObjectURL(lastResultUrl);
  lastResultUrl = null;
}

function releaseFile() {
  loadId += 1;
  loadController?.abort();
  loadController = null;
  loading = false;
  ready = false;
  el.preview.pause();
  el.preview.removeAttribute('src');
  el.preview.load();
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = null;
  media = null;
  file = null;
  fallbackReason = null;
  source = { width: 0, height: 0 };
  duration = 0;
  sourceFps = 0;
  canReadDirectly = false;
  canPlay = false;
  el.source.hidden = true;
  el.previewWrap.hidden = true;
  el.previewNote.hidden = true;
  el.pathNote.hidden = true;
  el.still.hidden = true;
  el.still.width = el.still.height = 0;
  el.length.value = '';
  for (const value of [el.srcName, el.srcSize, el.srcFrame, el.srcLength,
    el.srcFps, el.srcCodec, el.intervalNote, el.sumFrames, el.sumInterval,
    el.sumLength, el.sumSize, el.sumRead, el.sumBytes, el.planNote]) {
    value.textContent = '';
  }
  el.planNote.hidden = true;
  el.exportCard.inert = true;
  el.exportBtn.disabled = true;
  el.speedCard.inert = false;
  el.progress.hidden = true;
  releaseResult();
}

/* ------------------------------------------------------------- the settings */

function outputFps() {
  return Number(el.fps.value) || 30;
}

function currentSpeed() {
  return clampSpeed(Number(el.speed.value));
}

/** Offer only the sizes that are a reduction; upscaling a time-lapse helps nothing. */
function fitSizeOptions() {
  const shorter = Math.min(source.width, source.height);
  for (const option of el.size.options) {
    const edge = Number(option.value);
    option.disabled = edge > 0 && edge >= shorter;
  }
  if (el.size.selectedOptions[0]?.disabled) el.size.value = '0';
}

/**
 * Set the speed everywhere it is written: the box, the buttons, the length
 * beside it. One function, so the three can never disagree.
 */
function setSpeed(speed, from) {
  if (loading) return;
  const value = clampSpeed(speed);

  if (from !== el.speed) el.speed.value = round(value, 1);
  if (ready && from !== el.length) el.length.value = round(lengthForSpeed({ duration, speed: value }), 1);

  for (const button of el.speedRow.querySelectorAll('[data-speed]')) {
    const selected = Math.abs(Number(button.dataset.speed) - value) < 0.05;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  }

  updateSummary();
}

function round(value, places) {
  const factor = 10 ** places;
  return String(Math.round(value * factor) / factor);
}

el.speedRow.addEventListener('click', (event) => {
  const button = event.target.closest('[data-speed]');
  if (button) setSpeed(Number(button.dataset.speed), null);
});

el.speed.addEventListener('input', () => setSpeed(Number(el.speed.value), el.speed));
el.speed.addEventListener('change', () => setSpeed(Number(el.speed.value), null));

el.length.addEventListener('input', () => {
  if (!ready || loading) return;
  setSpeed(speedForLength({ duration, seconds: Number(el.length.value) }), el.length);
});
el.length.addEventListener('change', () => {
  if (!ready || loading) return;
  setSpeed(speedForLength({ duration, seconds: Number(el.length.value) }), null);
});

el.fps.addEventListener('change', () => setSpeed(currentSpeed(), null));
el.size.addEventListener('change', updateSummary);
el.quality.addEventListener('change', updateSummary);

/** Everything the settings currently add up to, worked out in one place. */
function currentPlan() {
  const speed = currentSpeed();
  const fps = outputFps();
  const times = frameTimes({ duration, speed, fps });
  const frame = outputSize({
    width: source.width, height: source.height, shortEdge: Number(el.size.value),
  });
  const bitrate = chooseBitrate({
    width: frame.width, height: frame.height, fps, quality: el.quality.value,
  });

  return {
    speed, fps, times, frame, bitrate,
    interval: sampleInterval({ speed, fps }),
    bytes: estimateBytes({ frames: times.length, fps, bitrate }),
  };
}

function updateSummary() {
  if (!ready || loading || !source.width || !duration) return;

  const plan = currentPlan();
  const enough = plan.times.length >= MIN_FRAMES;

  el.intervalNote.textContent = phrase('plan.interval',
    { every: formatInterval(plan.interval), fps: plan.fps });

  el.sumFrames.textContent = phrase(plan.times.length === 1 ? 'n.frame.one' : 'n.frame.many',
    { n: plan.times.length.toLocaleString() });
  el.sumInterval.textContent = formatInterval(plan.interval);
  el.sumLength.textContent = formatDuration(plan.times.length / plan.fps);
  el.sumSize.textContent = plan.frame.width === source.width
    ? phrase('size.unchanged', { width: plan.frame.width, height: plan.frame.height })
    : phrase('size.from', {
      width: plan.frame.width,
      height: plan.frame.height,
      fromWidth: source.width,
      fromHeight: source.height,
    });
  el.sumBytes.textContent = phrase('plan.about', { size: formatBytes(plan.bytes) });

  if (canReadDirectly) {
    const runs = decodeRuns({
      samples: media.video.samples, timescale: media.video.timescale, times: plan.times,
    });
    const cost = decodeCost(runs, media.video.samples.length);
    el.sumRead.textContent = phrase('plan.read', {
      read: cost.read.toLocaleString(), total: cost.total.toLocaleString(),
    });
  } else {
    el.sumRead.textContent = phrase(plan.times.length === 1 ? 'plan.seeks.one' : 'plan.seeks.many',
      { n: plan.times.length.toLocaleString() });
  }

  const notes = [];
  if (!enough) {
    notes.push(phrase(plan.times.length === 1 ? 'plan.toofew.one' : 'plan.toofew.many',
      { n: plan.times.length }));
  }
  if (repeatsFrames({ speed: plan.speed, fps: plan.fps, sourceFps })) {
    notes.push(phrase('plan.repeats'));
  }
  el.planNote.hidden = notes.length === 0;
  // The separator is a phrase too: ja and zh do not put a space after a full
  // stop, and one hard-coded here is one every language gets.
  el.planNote.textContent = notes.length
    ? notes.reduce((a, b) => phrase('join.sentences', { a, b }))
    : '';

  el.exportBtn.disabled = working || !enough;
}

/* ------------------------------------------------------------------ export */

function setProgress({ phase, done, total }) {
  const fraction = total > 0 ? Math.min(1, done / total) : 0;
  el.progressBar.style.width = `${(fraction * 100).toFixed(1)}%`;

  if (phase === 'preparing') {
    el.progressLabel.textContent = phrase('step.preparing');
  } else if (phase === 'finishing') {
    el.progressLabel.textContent = phrase('step.finishing');
  } else {
    el.progressLabel.textContent = phrase('step.frame', {
      done: done.toLocaleString(),
      total: total.toLocaleString(),
      percent: Math.round(fraction * 100),
    });
  }
}

function outputFilename(picked) {
  const base = (picked?.name ?? 'video').replace(/\.[^.]+$/, '');
  return `${base}-timelapse.mp4`;
}

/** The interval, in the unit that makes it readable rather than always in seconds. */
function formatInterval(seconds) {
  if (seconds < 1) return phrase('unit.ms', { n: Math.round(seconds * 1000) });
  if (seconds < 60) {
    return phrase('unit.s',
      { n: seconds < 10 ? seconds.toFixed(2) : seconds.toFixed(1) });
  }
  return phrase('unit.min', { n: (seconds / 60).toFixed(1) });
}

async function runExport() {
  if (working || loading || !ready || !file || (!canReadDirectly && !canPlay)) return;

  const plan = currentPlan();
  if (plan.times.length < MIN_FRAMES) return;
  const job = { file, media, preview: el.preview, direct: canReadDirectly };

  clearError();
  working = true;
  lockSourcePicker(true);
  abortController = new AbortController();

  el.exportBtn.disabled = true;
  el.cancelBtn.hidden = false;
  el.progress.hidden = false;
  releaseResult();
  job.preview.pause();
  setProgress({ phase: 'preparing', done: 0, total: 1 });

  let writer = null;

  try {
    const codec = await pickH264Codec({
      width: plan.frame.width,
      height: plan.frame.height,
      framerate: plan.fps,
      bitrate: plan.bitrate,
    });
    throwIfAborted(abortController.signal);
    if (!codec) {
      throw said('encode.noh264',
        { width: plan.frame.width, height: plan.frame.height });
    }

    writer = new TimelapseWriter({
      width: plan.frame.width,
      height: plan.frame.height,
      fps: plan.fps,
      bitrate: plan.bitrate,
      codec,
    });
    writer.open();

    const result = job.direct
      ? await timelapseByDecoding({
        file: job.file, media: job.media, times: plan.times,
        width: plan.frame.width, height: plan.frame.height,
        writer, onProgress: setProgress, signal: abortController.signal,
      })
      : await timelapseByPlaying({
        video: job.preview, times: plan.times,
        width: plan.frame.width, height: plan.frame.height,
        writer, onProgress: setProgress, signal: abortController.signal,
      });

    throwIfAborted(abortController.signal);
    if (lastResultUrl) URL.revokeObjectURL(lastResultUrl);
    lastResultUrl = URL.createObjectURL(result.blob);

    el.resultVideo.src = lastResultUrl;
    el.download.href = lastResultUrl;
    el.download.download = outputFilename(job.file);
    el.resultInfo.textContent = [
      phrase('size.plain', { width: plan.frame.width, height: plan.frame.height }),
      phrase(result.frames === 1 ? 'n.frame.one' : 'n.frame.many',
        { n: result.frames.toLocaleString() }),
      formatDuration(result.frames / plan.fps),
      formatBytes(result.blob.size),
    ].reduce((a, b) => phrase('join.dot', { a, b }));
    el.result.hidden = false;
    el.progress.hidden = true;
    el.result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) {
    el.progress.hidden = true;
    if (error?.name !== 'AbortError') {
      showError(error?.message
        ? phrase(error.message, fill(error.values)) : phrase('export.failed'));
      console.error(error);
    }
  } finally {
    writer?.close();
    working = false;
    lockSourcePicker(false);
    abortController = null;
    el.cancelBtn.hidden = true;
    updateSummary();
  }
}

el.exportBtn.addEventListener('click', runExport);
el.cancelBtn.addEventListener('click', () => abortController?.abort());

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

if (!hasEncoder()) {
  showError(phrase('nocodec.page'));
}

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
