/** UI wiring and application state. */

import { wireFilePicker } from './shared/file-picker.js';
import { demux, UnsupportedFile } from './demux.js';
import { timelapseByDecoding, previewFrame, decoderConfig, averageFps } from './decode.js';
import { timelapseByPlaying } from './playback.js';
import { TimelapseWriter } from './encode.js';
import { hasEncoder, hasWebCodecs, canDecode, pickH264Codec } from './support.js';
import {
  MIN_FRAMES,
  clampSpeed, speedForLength, lengthForSpeed, sampleInterval, frameTimes, repeatsFrames,
  outputSize, chooseBitrate, estimateBytes, decodeRuns, decodeCost,
} from './plan.js';

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
  progressWrap: $('progress-wrap'),
  progressBar: $('progress-bar'),
  progressLabel: $('progress-label'),
  error: $('error'),
  result: $('result'),
  resultVideo: $('result-video'),
  resultInfo: $('result-info'),
  download: $('download'),
  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
  networkCount: $('network-count'),
  networkDot: $('network-dot'),
  offlineStatus: $('offline-status'),
  offlineDot: $('offline-dot'),
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
 * A browser that will not play a format still says so quickly, so this is also
 * the test for whether the playback path is available at all.
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

async function loadFile(picked) {
  if (working) return;

  clearError();
  releaseFile();

  file = picked;
  picker.busy('Reading the file...');

  try {
    objectUrl = URL.createObjectURL(picked);
    const played = await openInPlayer(el.preview, objectUrl);

    try {
      media = await demux(picked);
      fallbackReason = null;
    } catch (error) {
      media = null;
      fallbackReason = error instanceof UnsupportedFile
        ? error.reason
        : (error.message || 'the file could not be read as an MP4.');
    }

    let readable = false;
    if (media && hasWebCodecs()) {
      readable = await canDecode(decoderConfig(media.video));
      if (!readable) {
        fallbackReason = `this browser will not decode ${media.video.codec} directly.`;
      }
    } else if (media && !hasWebCodecs()) {
      fallbackReason = 'this browser has no WebCodecs, so frames cannot be decoded one by one.';
    }

    canReadDirectly = readable;
    canPlay = played.ok;

    if (!canReadDirectly && !canPlay) {
      showError(`This browser cannot open this file: ${fallbackReason
        ?? 'the format is not one it plays.'}`);
      resetView();
      return;
    }
    if (!hasEncoder()) {
      showError('This browser cannot encode video, so it cannot write a time-lapse. '
        + 'A recent Chrome, Edge, Safari or Firefox will.');
      resetView();
      return;
    }

    source = canReadDirectly
      ? { width: media.video.displayWidth, height: media.video.displayHeight }
      : { width: played.width, height: played.height };
    duration = played.duration || (media ? media.duration : 0);
    sourceFps = canReadDirectly ? averageFps(media.video) : 0;

    if (!(duration > 0)) {
      showError('This file does not say how long it is, so there is nothing to '
        + 'work a speed out from.');
      resetView();
      return;
    }

    await showPreview(played.ok);
    describeSource();
    fitSizeOptions();

    el.speedCard.hidden = false;
    el.exportCard.hidden = false;
    el.exportBtn.disabled = false;
    setSpeed(defaultSpeed(), null);
  } catch (error) {
    console.error(error);
    showError(error?.message || 'That file could not be opened.');
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
  el.previewNote.textContent = 'This browser will not play this file, so the frame below '
    + 'was decoded to show you what you picked. The time-lapse itself is unaffected.';

  try {
    const canvas = await previewFrame({ file, media, atSeconds: 0 });
    el.still.width = canvas.width;
    el.still.height = canvas.height;
    el.still.getContext('2d').drawImage(canvas, 0, 0);
    el.still.hidden = false;
  } catch (error) {
    el.still.hidden = true;
    el.previewNote.textContent = 'This browser will not play this file and no frame could '
      + `be decoded from it either (${error.message}).`;
  }
}

function describeSource() {
  el.source.hidden = false;
  el.srcName.textContent = file.name;
  el.srcSize.textContent = formatBytes(file.size);
  el.srcFrame.textContent = `${source.width} x ${source.height}`;
  el.srcLength.textContent = formatDuration(duration);
  el.srcFps.textContent = sourceFps
    ? `${sourceFps.toFixed(sourceFps < 10 ? 1 : 0)} fps`
    : "whatever the player reports";

  if (media) {
    const turned = media.video.rotation ? `, turned ${media.video.rotation} degrees` : '';
    el.srcCodec.textContent = `${media.video.codec} (${media.video.entryType})${turned}`;
  } else {
    el.srcCodec.textContent = "read by the browser's own player";
  }

  el.pathNote.hidden = canReadDirectly;
  if (!canReadDirectly) {
    el.pathNote.textContent = 'This one is read by seeking the browser\'s own player to each '
      + `instant, because ${fallbackReason ?? 'its layout is not one the reader here understands.'} `
      + 'That works on every format the browser plays, and is a little slower.';
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
  el.speedCard.hidden = true;
  el.exportCard.hidden = true;
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

  el.intervalNote.textContent = `One frame every ${formatInterval(plan.interval)} of the `
    + `original, played back at ${plan.fps} frames a second.`;

  el.sumFrames.textContent = `${plan.times.length.toLocaleString()} frames`;
  el.sumInterval.textContent = formatInterval(plan.interval);
  el.sumLength.textContent = formatDuration(plan.times.length / plan.fps);
  el.sumSize.textContent = `${plan.frame.width} x ${plan.frame.height}`
    + (plan.frame.width === source.width ? ' (unchanged)' : ` (from ${source.width} x ${source.height})`);
  el.sumBytes.textContent = `about ${formatBytes(plan.bytes)}`;

  if (canReadDirectly) {
    const runs = decodeRuns({
      samples: media.video.samples, timescale: media.video.timescale, times: plan.times,
    });
    const cost = decodeCost(runs, media.video.samples.length);
    el.sumRead.textContent = `${cost.read.toLocaleString()} of the `
      + `${cost.total.toLocaleString()} frames in the file`;
  } else {
    el.sumRead.textContent = `${plan.times.length.toLocaleString()} seeks through the player`;
  }

  const notes = [];
  if (!enough) {
    notes.push(`At this speed there are ${plan.times.length} frames left, which is a `
      + 'photograph rather than a clip. Slow it down, or ask for a longer finished length.');
  }
  if (repeatsFrames({ speed: plan.speed, fps: plan.fps, sourceFps })) {
    notes.push('The instants are closer together than this file has frames, so some of '
      + 'them come out twice. Nothing is wrong with that, but a lower frame rate '
      + 'would make the same clip out of fewer frames.');
  }
  el.planNote.hidden = notes.length === 0;
  el.planNote.textContent = notes.join(' ');

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

function setProgress({ phase, done, total }) {
  const fraction = total > 0 ? Math.min(1, done / total) : 0;
  el.progressBar.style.width = `${(fraction * 100).toFixed(1)}%`;

  if (phase === 'preparing') {
    el.progressLabel.textContent = 'Preparing...';
  } else if (phase === 'finishing') {
    el.progressLabel.textContent = 'Finishing up...';
  } else {
    el.progressLabel.textContent = `Frame ${done.toLocaleString()} of `
      + `${total.toLocaleString()} (${Math.round(fraction * 100)}%)`;
  }
}

function outputFilename() {
  const base = (file?.name ?? 'video').replace(/\.[^.]+$/, '');
  return `${base}-timelapse.mp4`;
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function formatDuration(seconds) {
  const whole = Math.max(0, Math.round(seconds));
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  if (hours) return `${hours}h ${String(minutes).padStart(2, '0')}m`;
  if (minutes) return `${minutes}m ${String(whole % 60).padStart(2, '0')}s`;
  return `${seconds < 10 ? seconds.toFixed(1) : whole}s`;
}

/** The interval, in the unit that makes it readable rather than always in seconds. */
function formatInterval(seconds) {
  if (seconds < 1) return `${Math.round(seconds * 1000)} ms`;
  if (seconds < 60) return `${seconds < 10 ? seconds.toFixed(2) : seconds.toFixed(1)} s`;
  return `${(seconds / 60).toFixed(1)} min`;
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
  el.progressWrap.hidden = false;
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
      throw new Error('This browser will not encode H.264 at '
        + `${plan.frame.width}x${plan.frame.height}. Choose a smaller size.`);
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
      `${plan.frame.width} x ${plan.frame.height}`,
      `${result.frames.toLocaleString()} frames`,
      formatDuration(result.frames / plan.fps),
      formatBytes(result.blob.size),
    ].join(' · ');
    el.result.hidden = false;
    el.progressWrap.hidden = true;
    el.result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) {
    el.progressWrap.hidden = true;
    if (error?.name !== 'AbortError') {
      showError(error?.message || 'Something went wrong while making the time-lapse.');
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

// Hosts belonging to the ad, measurement and donate-button scripts. This tool
// has no network feature of its own at all - there is no address to paste and
// nothing to fetch - so anything outside this list appearing here would be a
// genuine surprise, and the panel says so in those terms.
// google.com is written as a pattern because Google's measurement pixel uses
// the visitor's own country domain, and a list of literal hostnames would turn
// this panel red for a visitor in the wrong country - which is the worst
// possible failure for the one part of the page that exists to be checked.
// cloudflareinsights.com is here because the host injects its own beacon; the
// CSP blocks it from running, but a blocked script still leaves a timing entry.
const PLATFORM_HOSTS = /(^|\.)(googlesyndication\.com|doubleclick\.net|googleadservices\.com|googletagservices\.com|adtrafficquality\.google|googletagmanager\.com|google-analytics\.com|gstatic\.com|googleapis\.com|buymeacoffee\.com|cloudflareinsights\.com|google\.[a-z]{2,3}(\.[a-z]{2})?)$/;

/**
 * Report what this page has actually fetched.
 *
 * The claim on trial is not "this page is silent" - it is not, it carries ads -
 * but "nothing has carried your video away". That is the part that matters, and
 * the part a sceptical visitor can watch hold in real time.
 */
function monitorNetwork() {
  const platform = new Set();
  const external = new Set();

  const inspect = (entries) => {
    for (const entry of entries) {
      if (entry.name.startsWith('blob:') || entry.name.startsWith('data:')) continue;
      const url = new URL(entry.name, location.href);
      if (url.origin === location.origin) continue;
      if (PLATFORM_HOSTS.test(url.hostname)) platform.add(url.hostname);
      else external.add(url.hostname);
    }
    const total = performance.getEntriesByType('resource')
      .filter((entry) => !entry.name.startsWith('blob:') && !entry.name.startsWith('data:')).length;

    const clean = external.size === 0;
    const platformNote = platform.size === 0
      ? ''
      : ` The page's own ad, measurement and donate-button scripts loaded from ${platform.size} `
        + `host${platform.size === 1 ? '' : 's'}; not one of them was given a file.`;

    el.networkCount.textContent = clean
      ? `your video has gone nowhere. ${total} files loaded.${platformNote}`
      : `something contacted ${[...external].join(', ')}, which this tool never does.${platformNote}`;

    el.networkCount.className = clean ? 'good' : 'warn';
    el.networkDot.className = `live-dot ${clean ? 'good' : 'warn'}`;
  };

  inspect(performance.getEntriesByType('resource'));
  try {
    new PerformanceObserver((list) => inspect(list.getEntries()))
      .observe({ type: 'resource', buffered: true });
  } catch {
    // PerformanceObserver is unavailable; the one-time snapshot above still stands.
  }
}

async function registerServiceWorker() {
  // Keep the visible text short: this sits in the trust panel, and a raw
  // browser error dumped there reads worse than it is.
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
    fail('caching unavailable here, but nothing is uploaded either way.', error.message);
  }
}

/* -------------------------------------------------------------------- boot */

window.addEventListener('error', (event) => {
  showError(`Something broke: ${event.message}. Reload the page to start over.`);
});
window.addEventListener('unhandledrejection', (event) => {
  showError(`Something broke: ${event.reason?.message ?? event.reason}. `
    + 'Reload the page to start over.');
});

if (!hasEncoder()) {
  showError('This browser cannot encode video, so it has nothing to write a time-lapse '
    + 'with. Chrome, Edge, Safari 16.4 or Firefox 133 and newer can.');
}

monitorNetwork();
registerServiceWorker();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
