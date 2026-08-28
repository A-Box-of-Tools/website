/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { wireFilePicker } from './shared/file-picker.js';
import { demux, UnsupportedFile } from './demux.js';
import { reverseExact, decoderConfig } from './reverse.js';
import { measureFps, reverseByPlayback } from './playback.js';
import { averageFps, gopRanges } from './timeline.js';
import { hasWebCodecs, hasEncoder, canDecode } from './support.js';

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
  srcAudio: $('src-audio'),
  previewWrap: $('preview-wrap'),
  preview: $('preview'),
  stageNote: $('stage-note'),
  pathNote: $('path-note'),
  exportCard: $('export-card'),
  quality: $('quality'),
  keepAudio: $('keep-audio'),
  audioNote: $('audio-note'),
  sumSize: $('sum-size'),
  sumLength: $('sum-length'),
  sumFrames: $('sum-frames'),
  sumPath: $('sum-path'),
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
/** What demux() found, or null if this file is for the playback path. */
let media = null;
/** Why the exact path is unavailable, in words, or null. */
let fallbackReason = null;
let source = { width: 0, height: 0 };
let duration = 0;
let frames = 0;
let fps = 30;
let fpsMeasured = false;
let canReverseExactly = false;
let canPlay = false;
/** True from the moment a file is chosen until the page has finished reading it. */
let loading = false;
let exporting = false;
let abortController = null;
let lastResultUrl = null;

/**
 * A second <video>, never shown, which the playback path steps through.
 *
 * Separate from the preview on purpose: measuring the frame rate means playing
 * a second of the clip muted, and stepping through it means seeking a few
 * hundred times. Doing either to the player you are watching would be rude, and
 * would also mean the export moved the picture under you while it ran.
 */
const worker = document.createElement('video');
worker.muted = true;
worker.playsInline = true;
worker.preload = 'auto';

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
});

/* ------------------------------------------------------------------ loading */

/**
 * Ask a <video> element to open the file, and report what it made of it.
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
  if (exporting) return;

  clearError();
  releaseFile();

  // Nothing may be exported while this runs. Opening a file takes a moment -
  // the player has to read it, the demuxer has to walk it, and on the playback
  // path a second of it is played to measure the frame rate - and for that
  // moment the page is still describing the file before this one. Leaving the
  // button live is how "reverse" gets pressed against a half-open file.
  loading = true;
  file = picked;
  el.exportBtn.disabled = true;
  picker.busy('Reading the file...');

  try {
    objectUrl = URL.createObjectURL(picked);
    const played = await openInPlayer(el.preview, objectUrl);
    if (played.ok) await openInPlayer(worker, objectUrl);

    try {
      media = await demux(picked);
      fallbackReason = null;
    } catch (error) {
      media = null;
      fallbackReason = error instanceof UnsupportedFile
        ? error.reason
        : (error.message || 'the file could not be read as an MP4.');
    }

    let decodable = false;
    if (media && hasWebCodecs()) {
      decodable = await canDecode(decoderConfig(media.video));
      if (!decodable) {
        fallbackReason = `this browser will not decode ${media.video.codec} directly.`;
      }
    } else if (media && !hasWebCodecs()) {
      fallbackReason = 'this browser has no WebCodecs, so frames cannot be decoded one by one.';
    }

    // If the reader and the player disagree about the shape of the picture, one
    // of them is applying a rotation the other is not. The player is what you
    // are looking at, so it wins and the exact path stands down - the same rule
    // /crop-video/ uses, for the same reason.
    if (decodable && played.ok
      && (played.width !== media.video.displayWidth
        || played.height !== media.video.displayHeight)) {
      decodable = false;
      fallbackReason = 'this file is stored turned in a way the reader and the player '
        + 'disagree on.';
    }

    canReverseExactly = decodable;
    canPlay = played.ok;

    if (!canReverseExactly && !canPlay) {
      showError('This browser cannot open this file: '
        + `${fallbackReason ?? 'the format is not one it plays.'}`);
      resetView();
      return;
    }
    if (!hasEncoder()) {
      showError('This browser has no video encoder, so nothing here can write the reversed '
        + 'clip. A recent Chrome, Edge or Safari will.');
      resetView();
      return;
    }

    source = canReverseExactly
      ? { width: media.video.displayWidth, height: media.video.displayHeight }
      : { width: played.width, height: played.height };
    duration = played.duration || (media ? media.duration : 0);

    if (canReverseExactly) {
      fps = averageFps(media.video);
      fpsMeasured = true;
      frames = media.video.samples.length;
    } else {
      // Out on the playback path the file's own frame times cannot be seen, so
      // the clip is sampled at a fixed rate - measured here if the browser will
      // report one, assumed if it will not. The page says which.
      picker.busy('Measuring the frame rate...');
      const measured = await measureFps(worker);
      fps = measured.fps;
      fpsMeasured = measured.measured;
      frames = Math.max(1, Math.floor(duration * fps));
    }

    showPreview(played.ok);
    describeSource(played);

    el.exportBtn.disabled = false;
    updateAudioNote();
    updateSummary();
  } catch (error) {
    console.error(error);
    showError(error?.message || 'That file could not be opened.');
    resetView();
  } finally {
    loading = false;
    picker.done();
  }
}

function showPreview(playable) {
  el.previewWrap.hidden = !playable;
  el.stageNote.hidden = playable;

  if (!playable) {
    // The exact path does not need the player at all: it reads the file itself.
    // So a clip this browser has no licence to play - iPhone HEVC in Chrome, the
    // usual case - is still reversible, it just cannot be shown first.
    el.stageNote.textContent = 'This browser will not play this file, so there is no preview. '
      + 'Reversing it does not go through the player, so it will still work.';
  }
}

function describeSource(played) {
  el.source.hidden = false;
  el.srcName.textContent = file.name;
  el.srcSize.textContent = formatBytes(file.size);
  el.srcFrame.textContent = `${source.width} x ${source.height}`;
  el.srcLength.textContent = duration ? formatDuration(duration) : 'unknown';

  if (media) {
    const turned = media.video.rotation ? `, turned ${media.video.rotation} degrees` : '';
    el.srcCodec.textContent = `${media.video.codec} (${media.video.entryType})${turned}`;
    el.srcAudio.textContent = media.audio
      ? `${media.audio.entryType}, ${media.audio.channels} channel`
        + `${media.audio.channels === 1 ? '' : 's'}, ${Math.round(media.audio.sampleRate)} Hz`
      : 'none';
  } else {
    el.srcCodec.textContent = played.ok ? "read by the browser's own player" : 'unknown';
    el.srcAudio.textContent = 'whatever the player finds';
  }

  el.pathNote.hidden = canReverseExactly;
  if (!canReverseExactly) {
    const why = fallbackReason ?? 'its layout is not one the reader here understands.';
    const rate = fpsMeasured
      ? `${fps} frames a second, measured off a second of it`
      : `${fps} frames a second - assumed, because this browser will not report a frame rate`;
    el.pathNote.textContent = "This one is reversed by stepping the browser's own player "
      + `backwards through it, because ${why} That is slower than reading the file directly, `
      + `and the clip is sampled at ${rate}.`;
  }
}

function releaseFile() {
  if (objectUrl) {
    el.preview.removeAttribute('src');
    el.preview.load();
    worker.removeAttribute('src');
    worker.load();
    URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  }
  media = null;
  file = null;
}

function resetView() {
  el.exportBtn.disabled = true;
  el.source.hidden = true;
  el.previewWrap.hidden = true;
  el.stageNote.hidden = true;
  el.pathNote.hidden = true;
  releaseFile();
}

/* ------------------------------------------------------------- the output */

function updateAudioNote() {
  const off = !el.keepAudio.checked;
  if (off) {
    el.audioNote.textContent = 'The reversed clip will have no sound at all.';
    return;
  }
  el.audioNote.textContent = canReverseExactly && media?.audio
    ? 'Decoded, turned round sample by sample, and encoded again as AAC. That second '
      + 'encode is unavoidable: packets played in the other order are not a reversal.'
    : 'Read by the browser, turned round sample by sample, and encoded again as AAC.';
}

/** What the output frame will be: the picture as watched, at even numbers. */
function outputFrame() {
  return {
    width: Math.max(2, Math.floor(source.width / 2) * 2),
    height: Math.max(2, Math.floor(source.height / 2) * 2),
  };
}

function updateSummary() {
  if (!source.width) return;

  const frame = outputFrame();
  el.sumSize.textContent = frame.width === source.width && frame.height === source.height
    ? `${frame.width} x ${frame.height}`
    : `${frame.width} x ${frame.height} (from ${source.width} x ${source.height}; `
      + 'H.264 has no way to store an odd-sided frame)';
  el.sumLength.textContent = duration ? formatDuration(duration) : 'unknown';
  el.sumFrames.textContent = canReverseExactly
    ? `${frames.toLocaleString()} in ${gopRanges(media.video.samples).length.toLocaleString()} `
      + 'groups'
    : `about ${frames.toLocaleString()}, at ${fps} a second`;
  el.sumPath.textContent = canReverseExactly
    ? 'Decoded group by group from the end, into MP4'
    : 'Stepped backwards through the player, into MP4';
}

el.quality.addEventListener('change', updateSummary);
el.keepAudio.addEventListener('change', updateAudioNote);

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

  if (phase === 'preparing') {
    el.progressLabel.textContent = 'Preparing...';
  } else if (phase === 'sound-reading') {
    el.progressLabel.textContent = 'Reading the sound...';
  } else if (phase === 'sound-writing') {
    el.progressLabel.textContent = 'Reversing the sound...';
  } else if (phase === 'finishing') {
    el.progressLabel.textContent = 'Finishing up...';
  } else {
    el.progressBar.style.width = `${(fraction * 100).toFixed(1)}%`;
    el.progressLabel.textContent = `Reversing frame ${done.toLocaleString()} `
      + `of ${total.toLocaleString()} (${Math.round(fraction * 100)}%)`;
    return;
  }

  // The sound is done after the picture and is a small fraction of the work, so
  // the bar is left where the frames put it rather than starting again at zero.
  if (phase === 'preparing') el.progressBar.style.width = '0%';
}

function outputFilename(extension) {
  const base = (file?.name ?? 'video').replace(/\.[^.]+$/, '');
  return `${base}-reversed.${extension}`;
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function formatDuration(seconds) {
  const whole = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(whole / 60);
  return minutes
    ? `${minutes}m ${String(whole % 60).padStart(2, '0')}s`
    : `${seconds < 10 ? seconds.toFixed(1) : whole}s`;
}

async function runExport() {
  if (exporting || loading || !file) return;

  clearError();
  exporting = true;
  abortController = new AbortController();

  el.exportBtn.disabled = true;
  el.cancelBtn.hidden = false;
  el.progress.hidden = false;
  el.result.hidden = true;
  el.preview.pause();
  setProgress({ phase: 'preparing', done: 0, total: 1 });

  const quality = el.quality.value;
  const keepAudio = el.keepAudio.checked;

  try {
    const result = canReverseExactly
      ? await reverseExact({
        file, media, quality, keepAudio,
        onProgress: setProgress, signal: abortController.signal,
      })
      : await reverseByPlayback({
        file, video: worker, duration, fps, quality, keepAudio,
        onProgress: setProgress, signal: abortController.signal,
      });

    if (result.warning) showError(result.warning);

    if (lastResultUrl) URL.revokeObjectURL(lastResultUrl);
    lastResultUrl = URL.createObjectURL(result.blob);

    el.resultVideo.src = lastResultUrl;
    el.download.href = lastResultUrl;
    el.download.download = outputFilename(result.extension);
    const frame = outputFrame();
    el.resultInfo.textContent = [
      result.extension.toUpperCase(),
      `${frame.width} x ${frame.height}`,
      `${result.frames.toLocaleString()} frames`,
      formatBytes(result.blob.size),
      result.codec,
    ].join(' · ');
    el.result.hidden = false;
    el.progress.hidden = true;
    el.result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) {
    el.progress.hidden = true;
    if (error?.name !== 'AbortError') {
      showError(error?.message || 'Something went wrong while reversing.');
      console.error(error);
    }
  } finally {
    exporting = false;
    abortController = null;
    el.cancelBtn.hidden = true;
    el.exportBtn.disabled = false;
  }
}

el.exportBtn.addEventListener('click', runExport);
el.cancelBtn.addEventListener('click', () => abortController?.abort());

window.addEventListener('beforeunload', (event) => {
  if (!exporting) return;
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

// Both paths encode, so this is the one thing the tool cannot do without. Said
// now, on an empty page, rather than after somebody has chosen a file and
// waited: a reversal is not something that can be faked with a canvas and a
// recorder, because a recorder writes frames in the order they are painted and
// in real time, which is neither what this needs nor what it promises.
if (!hasEncoder()) {
  showError('This browser has no video encoder (WebCodecs), so it cannot write a reversed '
    + 'video. Chrome, Edge and Safari 16.4 or newer can; so can Firefox 133 and newer.');
}

monitorNetwork();
registerServiceWorker();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
