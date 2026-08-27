/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { wireFilePicker } from './shared/file-picker.js';
import { demux, UnsupportedFile } from './demux.js';
import { cropExact, grabFrame, decoderConfig, averageFps } from './transcode.js';
import { cropByRecording } from './record.js';
import { Cropper } from './cropper.js';
import { hasWebCodecs, hasMediaRecorder, canDecode } from './support.js';

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
  pathNote: $('path-note'),
  cropCard: $('crop-card'),
  stage: $('stage'),
  preview: $('preview'),
  still: $('still'),
  stageNote: $('stage-note'),
  aspectRow: document.querySelector('.aspect-row'),
  swapAspect: $('swap-aspect'),
  cropX: $('crop-x'),
  cropY: $('crop-y'),
  cropW: $('crop-w'),
  cropH: $('crop-h'),
  cropMax: $('crop-max'),
  cropCentre: $('crop-centre'),
  cropReset: $('crop-reset'),
  exportCard: $('export-card'),
  format: $('format'),
  formatNote: $('format-note'),
  quality: $('quality'),
  keepAudio: $('keep-audio'),
  audioNote: $('audio-note'),
  sumSize: $('sum-size'),
  sumKept: $('sum-kept'),
  sumLength: $('sum-length'),
  sumPath: $('sum-path'),
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
/** What demux() found, or null if this file is for the recording path. */
let media = null;
/** Why the exact path is unavailable, in words, or null. */
let fallbackReason = null;
let source = { width: 0, height: 0 };
let duration = 0;
let fps = 30;
let canCropExactly = false;
let canRecord = false;
let exporting = false;
let abortController = null;
let lastResultUrl = null;

const cropper = new Cropper(el.stage, { onChange: onCropChanged });

/* ------------------------------------------------------------------ adding */

// The drop zone and the picker: shared, because every tool here needs the
// same one. src/shared/file-picker.js, copied in from shared/js/ by the
// build. The resting label comes off the markup, so it is written once,
// in this tool.toml, rather than here as well.
const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles(files) {
    const [file] = files;
    if (file) loadFile(file);
  },
});


/* ------------------------------------------------------------------ loading */

/**
 * Ask the <video> element to open the file, and report what it made of it.
 * A browser that will not play a format still says so quickly, so this is also
 * the test for whether the recording path is available at all.
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

    let decodable = false;
    if (media && hasWebCodecs()) {
      decodable = await canDecode(decoderConfig(media.video));
      if (!decodable) {
        fallbackReason = `this browser will not decode ${media.video.codec} directly.`;
      }
    } else if (media && !hasWebCodecs()) {
      fallbackReason = 'this browser has no WebCodecs, so frames cannot be decoded one by one.';
    }

    // If the demuxer and the player disagree about the shape of the picture,
    // one of them is applying a rotation the other is not - and a crop lined up
    // against the wrong one would cut the wrong part out. The player is what
    // you are looking at, so it wins, and the exact path stands down.
    if (decodable && played.ok
      && (played.width !== media.video.displayWidth || played.height !== media.video.displayHeight)) {
      decodable = false;
      fallbackReason = 'this file is stored turned in a way the reader and the player disagree on.';
    }

    canCropExactly = decodable;
    canRecord = played.ok && hasMediaRecorder();

    if (!canCropExactly && !canRecord) {
      showError(played.ok
        ? 'This browser cannot record video, so it cannot crop this file.'
        : `This browser cannot open this file: ${fallbackReason ?? 'the format is not one it plays.'}`);
      resetView();
      return;
    }

    source = canCropExactly
      ? { width: media.video.displayWidth, height: media.video.displayHeight }
      : { width: played.width, height: played.height };
    duration = played.duration || (media ? media.duration : 0);
    fps = media ? averageFps(media.video) : 30;

    await showPreview(played.ok);
    describeSource(played);

    cropper.setSource(source.width, source.height);
    setAspect('free', el.aspectRow.querySelector('[data-aspect="free"]'));

    el.cropCard.hidden = false;
    el.exportCard.hidden = false;
    el.exportBtn.disabled = false;
    updateFormatOptions();
    updateSummary();
  } catch (error) {
    console.error(error);
    showError(error?.message || 'That file could not be opened.');
    resetView();
  } finally {
    picker.done();
  }
}

/**
 * The preview is the played file where the browser will play it, and a frame
 * decoded by WebCodecs where it will not - which is how an iPhone HEVC clip
 * still gets a picture to line the crop box up against in a browser that has no
 * licence to play one.
 */
async function showPreview(playable) {
  el.stage.style.aspectRatio = `${source.width} / ${source.height}`;
  // Height is capped through the width, so the stage keeps the video's exact
  // shape - see the note on .stage in styles.css.
  el.stage.style.maxWidth = `calc(62vh * ${source.width / source.height})`;

  if (playable) {
    el.preview.hidden = false;
    el.still.hidden = true;
    el.stageNote.hidden = true;
    return;
  }

  el.preview.hidden = true;
  el.stageNote.hidden = false;
  el.stageNote.textContent = 'This browser will not play this file, so the frame below was '
    + 'decoded to show you what you are cropping. The crop itself is unaffected.';

  try {
    const canvas = await grabFrame({ file, media, atSeconds: 0 });
    const ctx = el.still.getContext('2d');
    el.still.width = canvas.width;
    el.still.height = canvas.height;
    ctx.drawImage(canvas, 0, 0);
    el.still.hidden = false;
  } catch (error) {
    el.still.hidden = true;
    el.stageNote.textContent = 'This browser will not play this file and no frame could be '
      + `decoded from it either (${error.message}). The crop box below still works on its size.`;
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

  el.pathNote.hidden = canCropExactly;
  if (!canCropExactly) {
    el.pathNote.textContent = `This one is cropped by playing it and recording the result, `
      + `because ${fallbackReason ?? 'its layout is not one the reader here understands.'} `
      + 'That takes as long as the video is long, and the sound is re-encoded rather than copied.';
  }
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
  el.cropCard.hidden = true;
  el.exportCard.hidden = true;
  el.pathNote.hidden = true;
  releaseFile();
}

/* --------------------------------------------------------------- the crop */

/** The aspect currently locked, as width/height, or null for free. */
let aspect = null;

function onCropChanged(rect) {
  el.cropX.value = String(rect.x);
  el.cropY.value = String(rect.y);
  el.cropW.value = String(rect.width);
  el.cropH.value = String(rect.height);
  el.cropX.max = String(Math.max(0, source.width - rect.width));
  el.cropY.max = String(Math.max(0, source.height - rect.height));
  el.cropW.max = String(source.width);
  el.cropH.max = String(source.height);
  updateSummary();
}

function setAspect(value, button) {
  for (const other of el.aspectRow.querySelectorAll('[data-aspect]')) {
    other.classList.toggle('active', other === button);
  }

  if (value === 'free') aspect = null;
  else if (value === 'source') aspect = source.width / source.height;
  else {
    const [w, h] = value.split(':').map(Number);
    aspect = w / h;
  }

  cropper.setAspect(aspect);
}

el.aspectRow.addEventListener('click', (event) => {
  const button = event.target.closest('[data-aspect]');
  if (button) setAspect(button.dataset.aspect, button);
});

el.swapAspect.addEventListener('click', () => {
  if (!aspect) return;
  aspect = 1 / aspect;
  cropper.setAspect(aspect);
});

el.cropMax.addEventListener('click', () => cropper.maximize());
el.cropCentre.addEventListener('click', () => cropper.centre());
el.cropReset.addEventListener('click', () => {
  setAspect('free', el.aspectRow.querySelector('[data-aspect="free"]'));
  cropper.reset();
});

for (const input of [el.cropX, el.cropY, el.cropW, el.cropH]) {
  input.addEventListener('change', () => {
    // A typed box is taken literally, so any locked shape is let go rather than
    // quietly overruling what was typed - and the buttons say so, instead of
    // going on claiming a lock the box no longer keeps.
    if (aspect && (input === el.cropW || input === el.cropH)) {
      setAspect('free', el.aspectRow.querySelector('[data-aspect="free"]'));
    }
    cropper.setRect({
      x: Number(el.cropX.value) || 0,
      y: Number(el.cropY.value) || 0,
      width: Number(el.cropW.value) || 16,
      height: Number(el.cropH.value) || 16,
    });
  });
}

/* ------------------------------------------------------------- the output */

function usingExact() {
  return el.format.value === 'mp4' && canCropExactly;
}

function updateFormatOptions() {
  const mp4 = el.format.querySelector('option[value="mp4"]');
  const webm = el.format.querySelector('option[value="webm"]');

  mp4.disabled = !canCropExactly;
  webm.disabled = !canRecord;
  // Chosen afresh for every file rather than carried over from the last one: a
  // clip that had to be recorded because it was a WebM should not leave the
  // next MP4 being recorded too.
  el.format.value = canCropExactly ? 'mp4' : 'webm';

  updateFormatNote();
}

function updateFormatNote() {
  el.formatNote.textContent = usingExact()
    ? 'Decodes and re-encodes every frame, faster than real time, and copies the '
      + 'original sound across untouched.'
    : 'Plays the clip through and records it, so it takes as long as the video is '
      + 'long and the sound is re-encoded. Keep this tab in front while it runs.';

  el.audioNote.textContent = usingExact()
    ? 'Copied from the file byte for byte, so it loses nothing.'
    : 'Captured from playback and re-encoded, because that is all a recording can do.';

  updateSummary();
}

el.format.addEventListener('change', updateFormatNote);
el.quality.addEventListener('change', updateSummary);
el.keepAudio.addEventListener('change', updateSummary);

function updateSummary() {
  const rect = cropper.rect;
  if (!source.width) return;

  el.sumSize.textContent = `${rect.width} x ${rect.height}`
    + ` (from ${source.width} x ${source.height})`;

  const kept = (rect.width * rect.height) / (source.width * source.height);
  el.sumKept.textContent = kept >= 0.999
    ? 'the whole frame'
    : `${Math.round(kept * 100)}% of the picture`;

  el.sumLength.textContent = duration ? formatDuration(duration) : 'unknown';
  el.sumPath.textContent = usingExact()
    ? 'Re-encoded frame by frame, into MP4'
    : 'Recorded in real time, into ' + (el.format.value === 'webm' ? 'WebM' : 'MP4');
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

function setProgress({ phase, done, total, realtime }) {
  const fraction = total > 0 ? Math.min(1, done / total) : 0;
  el.progressBar.style.width = `${(fraction * 100).toFixed(1)}%`;

  if (phase === 'preparing') {
    el.progressLabel.textContent = 'Preparing...';
  } else if (phase === 'finishing') {
    el.progressLabel.textContent = 'Finishing up...';
  } else if (realtime) {
    el.progressLabel.textContent = 'Recording in real time - '
      + `${formatDuration(done)} of ${formatDuration(total)} (${Math.round(fraction * 100)}%)`;
  } else {
    el.progressLabel.textContent = `Cropping frame ${done.toLocaleString()} `
      + `of ${total.toLocaleString()} (${Math.round(fraction * 100)}%)`;
  }
}

function outputFilename(extension) {
  const base = (file?.name ?? 'video').replace(/\.[^.]+$/, '');
  return `${base}-cropped.${extension}`;
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
  if (exporting || !file) return;

  const crop = cropper.rect;
  if (crop.width < 16 || crop.height < 16) {
    showError('The crop is too small. Drag it out to at least 16 pixels each way.');
    return;
  }

  clearError();
  exporting = true;
  abortController = new AbortController();

  el.exportBtn.disabled = true;
  el.cancelBtn.hidden = false;
  el.progressWrap.hidden = false;
  el.result.hidden = true;
  cropper.setEnabled(false);
  el.preview.pause();
  setProgress({ phase: 'preparing', done: 0, total: 1 });

  const quality = el.quality.value;
  const keepAudio = el.keepAudio.checked;

  try {
    const result = usingExact()
      ? await cropExact({
        file, media, crop, quality, keepAudio,
        onProgress: setProgress, signal: abortController.signal,
      })
      : await cropByRecording({
        src: objectUrl, crop, quality, keepAudio, fps,
        onProgress: setProgress, signal: abortController.signal,
      });

    if (result.warning) showError(result.warning);

    if (lastResultUrl) URL.revokeObjectURL(lastResultUrl);
    lastResultUrl = URL.createObjectURL(result.blob);

    el.resultVideo.src = lastResultUrl;
    el.download.href = lastResultUrl;
    el.download.download = outputFilename(result.extension);
    el.resultInfo.textContent = [
      result.extension.toUpperCase(),
      `${crop.width} x ${crop.height}`,
      formatBytes(result.blob.size),
      result.codec,
    ].join(' · ');
    el.result.hidden = false;
    el.progressWrap.hidden = true;
    el.result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) {
    el.progressWrap.hidden = true;
    if (error?.name !== 'AbortError') {
      showError(error?.message || 'Something went wrong while cropping.');
      console.error(error);
    }
  } finally {
    exporting = false;
    abortController = null;
    el.cancelBtn.hidden = true;
    el.exportBtn.disabled = false;
    cropper.setEnabled(true);
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

if (!hasWebCodecs() && !hasMediaRecorder()) {
  showError('This browser can neither decode nor record video, so this tool has nothing '
    + 'to work with. A recent Chrome, Edge, Firefox or Safari will.');
}

monitorNetwork();
registerServiceWorker();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
