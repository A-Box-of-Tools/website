/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { wireFilePicker } from './shared/file-picker.js';
import { demux, UnsupportedFile } from './shared/mp4-reader.js';
import { timelapseByDecoding, previewFrame, decoderConfig, averageFps } from './decode.js';
import { timelapseByPlaying } from './playback.js';
import { TimelapseWriter } from './encode.js';
import { hasEncoder, hasWebCodecs, canDecode, pickH264Codec } from './shared/video-support.js';
import {
  MIN_FRAMES,
  clampSpeed, speedForLength, lengthForSpeed, sampleInterval, frameTimes, repeatsFrames,
  outputSize, chooseBitrate, estimateBytes, decodeRuns, decodeCost,
} from './plan.js';

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
});

/* ----------------------------------------------------------------- loading */

/**
 * Ask the <video> element to open the file, and report what it made of it.
 *
 * This says the container was parsed, and nothing more. Whether a frame can
 * actually be decoded out of it is a separate question, asked by
 * `firstFrameLands` below - see the note there for why the two are not the
 * same question.
 */
function openInPlayer(video, url) {
  return new Promise((resolve) => {
    const done = (result) => {
      clearTimeout(timer);
      video.removeEventListener('loadedmetadata', ok);
      video.removeEventListener('error', bad);
      resolve(result);
    };
    const ok = () => done({
      ok: video.videoWidth > 0 && video.videoHeight > 0,
      width: video.videoWidth,
      height: video.videoHeight,
      duration: Number.isFinite(video.duration) ? video.duration : 0,
    });
    const bad = () => done({ ok: false, width: 0, height: 0, duration: 0 });

    const timer = setTimeout(bad, 15000);
    video.addEventListener('loadedmetadata', ok, { once: true });
    video.addEventListener('error', bad, { once: true });
    video.src = url;
    video.load();
  });
}

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
function firstFrameLands(video, atSeconds) {
  return new Promise((resolve) => {
    let settled = false;

    const done = (ok) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      video.removeEventListener('error', onError);
      video.removeEventListener('seeked', onSeeked);
      resolve(ok);
    };

    const decoded = () => video.readyState >= 2 && !video.error;
    const onError = () => done(false);
    const onSeeked = () => {
      if (typeof video.requestVideoFrameCallback === 'function') {
        video.requestVideoFrameCallback(() => done(true));
      }
      setTimeout(() => done(decoded()), 500);
    };

    const timer = setTimeout(() => done(false), PROBE_TIMEOUT);
    video.addEventListener('error', onError, { once: true });
    video.addEventListener('seeked', onSeeked, { once: true });

    // Somewhere other than zero, so this is a real seek and a real decode
    // rather than whatever the element happened to buffer on load.
    if (Math.abs(video.currentTime - atSeconds) < 1e-4) onSeeked();
    else video.currentTime = atSeconds;
  });
}

async function loadFile(picked) {
  if (working) return;

  clearError();
  releaseFile();

  file = picked;
  picker.busy(phrase('step.reading'));

  try {
    objectUrl = URL.createObjectURL(picked);
    const played = await openInPlayer(el.preview, objectUrl);

    try {
      media = await demux(picked);
      fallbackReason = null;
    } catch (error) {
      media = null;
      fallbackReason = error instanceof UnsupportedFile
        ? { key: error.reason, values: error.values }
        : { key: error.message || 'read.unreadable' };
    }

    let readable = false;
    if (media && hasWebCodecs()) {
      readable = await canDecode(decoderConfig(media.video));
      if (!readable) {
        fallbackReason = { key: 'read.nodecoder', values: { codec: media.video.codec } };
      }
    } else if (media && !hasWebCodecs()) {
      fallbackReason = { key: 'read.nowebcodecs' };
    }

    canReadDirectly = readable;

    // Only the file that has to go through the player is asked for a frame.
    // The direct path already knows the answer: VideoDecoder.isConfigSupported
    // is a real decodability test on the real codec string, which is why this
    // asymmetry existed and why it was invisible until an .mkv turned up.
    let opensButCannotDecode = false;
    if (canReadDirectly) {
      canPlay = played.ok;
    } else if (played.ok) {
      picker.busy(phrase('step.checking'));
      canPlay = await firstFrameLands(el.preview,
        Math.min(1, (played.duration || 2) / 2));
      opensButCannotDecode = !canPlay;
    } else {
      canPlay = false;
    }

    if (!canReadDirectly && !canPlay) {
      // Worth separating: "I do not know this format" and "I opened it and
      // then could not decode a frame of it" send you to different answers,
      // and the second one is the case that used to fail an hour in.
      showError(opensButCannotDecode
        ? phrase('open.nodecode')
        : phrase('open.failed', { reason: why(fallbackReason, 'read.notplayed') }));
      resetView();
      return;
    }
    if (!hasEncoder()) {
      showError(phrase('nocodec.file'));
      resetView();
      return;
    }

    source = canReadDirectly
      ? { width: media.video.displayWidth, height: media.video.displayHeight }
      : { width: played.width, height: played.height };
    duration = played.duration || (media ? media.duration : 0);
    sourceFps = canReadDirectly ? averageFps(media.video) : 0;

    if (!(duration > 0)) {
      showError(phrase('open.nolength'));
      resetView();
      return;
    }

    await showPreview(canPlay);
    describeSource();
    fitSizeOptions();

    el.exportBtn.disabled = false;
    setSpeed(defaultSpeed(), null);
  } catch (error) {
    console.error(error);
    // The leaf modules throw keys; a browser that failed for its own reasons
    // throws a sentence, and phrase() hands back what it does not recognise.
    showError(error?.message
      ? phrase(error.message, fill(error.values)) : phrase('open.notopened'));
    resetView();
  } finally {
    picker.done();
  }
}

/**
 * The preview is the played file where the browser will play it, and a decoded
 * still where it will not - which is how an iPhone HEVC clip still shows you
 * what you picked in a browser that has no licence to play one.
 */
async function showPreview(playable) {
  el.previewWrap.hidden = false;

  if (playable) {
    el.preview.hidden = false;
    el.still.hidden = true;
    el.previewNote.hidden = true;
    return;
  }

  el.preview.hidden = true;
  el.previewNote.hidden = false;
  el.previewNote.textContent = phrase('preview.still');

  try {
    const canvas = await previewFrame({ file, media, atSeconds: 0 });
    el.still.width = canvas.width;
    el.still.height = canvas.height;
    el.still.getContext('2d').drawImage(canvas, 0, 0);
    el.still.hidden = false;
  } catch (error) {
    el.still.hidden = true;
    el.previewNote.textContent = phrase('preview.none',
      { why: phrase(error.message, fill(error.values)) });
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

function releaseFile() {
  if (objectUrl) {
    el.preview.removeAttribute('src');
    el.preview.load();
    URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  }
  media = null;
  file = null;
}

function resetView() {
  el.source.hidden = true;
  el.previewWrap.hidden = true;
  el.previewNote.hidden = true;
  el.pathNote.hidden = true;
  releaseFile();
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
  const value = clampSpeed(speed);

  if (from !== el.speed) el.speed.value = round(value, 1);
  if (from !== el.length) el.length.value = round(lengthForSpeed({ duration, speed: value }), 1);

  for (const button of el.speedRow.querySelectorAll('[data-speed]')) {
    button.classList.toggle('active', Math.abs(Number(button.dataset.speed) - value) < 0.05);
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
  setSpeed(speedForLength({ duration, seconds: Number(el.length.value) }), el.length);
});
el.length.addEventListener('change', () => {
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
  if (!source.width || !duration) return;

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

function showError(message) {
  el.error.textContent = message;
  el.error.hidden = false;
}

function clearError() {
  el.error.hidden = true;
  el.error.textContent = '';
}

/**
 * An error's blanks, with any that are themselves a phrase resolved.
 *
 * playback.js quotes what the player said inside its own sentence. Both are
 * phrases, and a key dropped into a blank would reach the page as the key.
 */
function fill(values = {}) {
  return Object.fromEntries(Object.entries(values)
    .map(([name, value]) => [name, value?.key ? phrase(value.key, value.values) : value]));
}

/** An error whose message is a phrase key; showError resolves it. */
const said = (key, values = {}) => Object.assign(new Error(key), { values });

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

function outputFilename() {
  const base = (file?.name ?? 'video').replace(/\.[^.]+$/, '');
  return `${base}-timelapse.mp4`;
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return phrase('size.kb', { n: (bytes / 1024).toFixed(0) });
  if (bytes < 1024 * 1024 * 1024) {
    return phrase('size.mb', { n: (bytes / 1024 / 1024).toFixed(1) });
  }
  return phrase('size.gb', { n: (bytes / 1024 / 1024 / 1024).toFixed(2) });
}

function formatDuration(seconds) {
  const whole = Math.max(0, Math.round(seconds));
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  if (hours) {
    return phrase('time.hours', { hours, minutes: String(minutes).padStart(2, '0') });
  }
  if (minutes) {
    return phrase('time.minutes',
      { minutes, seconds: String(whole % 60).padStart(2, '0') });
  }
  return phrase('time.seconds', { n: seconds < 10 ? seconds.toFixed(1) : whole });
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
  if (working || !file) return;

  const plan = currentPlan();
  if (plan.times.length < MIN_FRAMES) return;

  clearError();
  working = true;
  abortController = new AbortController();

  el.exportBtn.disabled = true;
  el.cancelBtn.hidden = false;
  el.progress.hidden = false;
  el.result.hidden = true;
  el.preview.pause();
  setProgress({ phase: 'preparing', done: 0, total: 1 });

  let writer = null;

  try {
    const codec = await pickH264Codec({
      width: plan.frame.width,
      height: plan.frame.height,
      framerate: plan.fps,
      bitrate: plan.bitrate,
    });
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

    const result = canReadDirectly
      ? await timelapseByDecoding({
        file, media, times: plan.times,
        width: plan.frame.width, height: plan.frame.height,
        writer, onProgress: setProgress, signal: abortController.signal,
      })
      : await timelapseByPlaying({
        video: el.preview, times: plan.times,
        width: plan.frame.width, height: plan.frame.height,
        writer, onProgress: setProgress, signal: abortController.signal,
      });

    if (lastResultUrl) URL.revokeObjectURL(lastResultUrl);
    lastResultUrl = URL.createObjectURL(result.blob);

    el.resultVideo.src = lastResultUrl;
    el.download.href = lastResultUrl;
    el.download.download = outputFilename();
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
