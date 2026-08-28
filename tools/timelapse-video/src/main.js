/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
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
      picker.busy('Checking this browser can decode it...');
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

    await showPreview(canPlay);
    describeSource();
    fitSizeOptions();

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
    el.progress.hidden = true;
    el.result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) {
    el.progress.hidden = true;
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
    // One phrase per number rather than a pluralising helper: a language
    // whose plural is not a suffix has to be able to translate the two
    // separately.
    const platformNote = platform.size
      ? phrase(platform.size === 1 ? 'net.platform.one' : 'net.platform.many',
               { hosts: platform.size })
      : '';

    el.networkCount.textContent = clean
      ? phrase('net.clean', { total, platform: platformNote })
      : phrase('net.dirty', { hosts: [...external].join(', '), platform: platformNote });

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
    fail(phrase('offline.none'));
    return;
  }
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
    fail(phrase('offline.failed'), error.message);
  }
}

/* -------------------------------------------------------------------- boot */

window.addEventListener('error', (event) => {
  showError(phrase('error.broke', { detail: event.message }));
});
window.addEventListener('unhandledrejection', (event) => {
  showError(phrase('error.broke', { detail: event.reason?.message ?? event.reason }));
});

if (!hasEncoder()) {
  showError('This browser cannot encode video, so it has nothing to write a time-lapse '
    + 'with. Chrome, Edge, Safari 16.4 or Firefox 133 and newer can.');
}

monitorNetwork();
registerServiceWorker();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
