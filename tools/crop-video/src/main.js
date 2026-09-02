/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { wireFilePicker } from './shared/file-picker.js';
import { demux, UnsupportedFile } from './shared/mp4-reader.js';
import { cropExact, grabFrame, decoderConfig, averageFps } from './transcode.js';
import { cropByRecording } from './record.js';
import { Cropper } from './cropper.js';
import { hasWebCodecs, hasMediaRecorder, canDecode } from './support.js';

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
  stageBusy: $('stage-busy'),
  stageNote: $('stage-note'),
  transport: $('transport'),
  stepBack: $('step-back'),
  play: $('play'),
  stepOn: $('step-on'),
  scrub: $('scrub'),
  atTime: $('at-time'),
  atLength: $('at-length'),
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
/** What demux() found, or null if this file is for the recording path. */
let media = null;
/** Why the exact path is unavailable, in words, or null. */
let fallbackReason = null;
let source = { width: 0, height: 0 };
let duration = 0;
let fps = 30;
let canCropExactly = false;
let canRecord = false;
/** Whether the picture on the stage is the player's, or a decoded still. */
let playable = false;
let playing = false;
/** Where in the clip the stage is showing, in seconds. */
let position = 0;
/** The moment the still path has been asked for, and the one it has drawn. */
let wantedTime = -1;
let shownTime = -1;
let decoding = false;
/** Bumped by every load, so a decode still in flight knows it is stale. */
let loadId = 0;
let exporting = false;
let abortController = null;
let lastResultUrl = null;

const cropper = new Cropper(el.stage, {
  onChange: onCropChanged,
  label: phrase('crop.aria'),
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
  loadId += 1;

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

    let decodable = false;
    if (media && hasWebCodecs()) {
      decodable = await canDecode(decoderConfig(media.video));
      if (!decodable) {
        fallbackReason = { key: 'read.nodecoder', values: { codec: media.video.codec } };
      }
    } else if (media && !hasWebCodecs()) {
      fallbackReason = { key: 'read.nowebcodecs' };
    }

    // If the demuxer and the player disagree about the shape of the picture,
    // one of them is applying a rotation the other is not - and a crop lined up
    // against the wrong one would cut the wrong part out. The player is what
    // you are looking at, so it wins, and the exact path stands down.
    if (decodable && played.ok
      && (played.width !== media.video.displayWidth || played.height !== media.video.displayHeight)) {
      decodable = false;
      fallbackReason = { key: 'read.turned' };
    }

    canCropExactly = decodable;
    canRecord = played.ok && hasMediaRecorder();

    if (!canCropExactly && !canRecord) {
      showError(played.ok
        ? phrase('open.norecord')
        : phrase('open.failed', { reason: why(fallbackReason, 'read.notplayed') }));
      resetView();
      return;
    }

    source = canCropExactly
      ? { width: media.video.displayWidth, height: media.video.displayHeight }
      : { width: played.width, height: played.height };
    duration = played.duration || (media ? media.duration : 0);
    fps = media ? averageFps(media.video) : 30;
    playable = played.ok;

    showPreview();
    setUpTransport();
    goTo(0);
    describeSource(played);

    cropper.setSource(source.width, source.height);
    setAspect('free', el.aspectRow.querySelector('[data-aspect="free"]'));

    el.exportBtn.disabled = false;
    updateFormatOptions();
    updateSummary();
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
 * The preview is the played file where the browser will play it, and frames
 * decoded by WebCodecs where it will not - which is how an iPhone HEVC clip
 * still gets a picture to line the crop box up against in a browser that has no
 * licence to play one.
 */
function showPreview() {
  el.stage.style.aspectRatio = `${source.width} / ${source.height}`;
  // Height is capped through the width, so the stage keeps the video's exact
  // shape - see the note on .stage in styles.css.
  el.stage.style.maxWidth = `calc(62vh * ${source.width / source.height})`;

  el.preview.hidden = !playable;
  el.still.hidden = playable;
  el.stageNote.hidden = playable;

  if (!playable) {
    el.stageNote.textContent = phrase('preview.still');
  }
}

function describeSource(played) {
  el.source.hidden = false;
  el.srcName.textContent = file.name;
  el.srcSize.textContent = formatBytes(file.size);
  el.srcFrame.textContent = phrase('size.plain',
    { width: source.width, height: source.height });
  el.srcLength.textContent = duration ? formatDuration(duration) : phrase('len.unknown');

  if (media) {
    el.srcCodec.textContent = media.video.rotation
      ? phrase('src.codec.turned', {
        codec: media.video.codec,
        entry: media.video.entryType,
        degrees: media.video.rotation,
      })
      : phrase('src.codec', { codec: media.video.codec, entry: media.video.entryType });
    el.srcAudio.textContent = media.audio
      ? phrase(media.audio.channels === 1 ? 'src.audio.one' : 'src.audio.many', {
        entry: media.audio.entryType,
        n: media.audio.channels,
        rate: Math.round(media.audio.sampleRate),
      })
      : phrase('src.audio.none');
  } else {
    el.srcCodec.textContent = phrase(played.ok ? 'src.byplayer' : 'src.unknown');
    el.srcAudio.textContent = phrase('src.audio.whatever');
  }

  el.pathNote.hidden = canCropExactly;
  if (!canCropExactly) {
    el.pathNote.textContent = phrase('path.record', {
      reason: why(fallbackReason, 'read.layout'),
    });
  }
}

function releaseFile() {
  playing = false;
  playable = false;
  position = 0;
  wantedTime = -1;
  shownTime = -1;
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
  el.pathNote.hidden = true;
  el.transport.hidden = true;
  releaseFile();
}

/* ------------------------------------------------- moving through the clip */

/*
 * The stage shows one moment of the clip, and this row is how that moment is
 * chosen. It replaces the player's own controls, which used to sit inside the
 * picture, over the bottom edge of the very rectangle being dragged.
 *
 * Both preview paths answer the same three calls. Where the browser plays the
 * file, moving is a seek; where it does not, it is another frame decoded by
 * WebCodecs, which is slower and so collapses repeated requests rather than
 * queueing them.
 */

/** The button's resting title, kept so an unplayable file can borrow it back. */
const playTitle = el.play.title;

function setUpTransport() {
  el.transport.hidden = false;
  el.scrub.min = '0';
  // Counted in milliseconds and stepped by one frame, so the arrow keys on the
  // slider move through the clip exactly as the buttons beside it do. A clip
  // whose frame rate wanders gets the average, which is close enough for
  // lining a box up and is not what the encoder is told.
  el.scrub.max = String(Math.max(1, Math.round(duration * 1000)));
  el.scrub.step = String(Math.max(1, Math.round(1000 / (fps || 30))));
  el.scrub.value = '0';
  el.scrub.disabled = !duration;
  el.play.disabled = !playable;
  el.play.title = playable ? playTitle : phrase('play.cannot');
  el.atLength.textContent = duration ? `/ ${clockTime(duration)}` : '';
}

/** Show the clip at `seconds`, wherever the picture is coming from. */
function goTo(seconds) {
  position = Math.max(0, Math.min(seconds, duration || seconds));
  el.scrub.value = String(Math.round(position * 1000));
  el.atTime.textContent = clockTime(position);
  if (playable) el.preview.currentTime = position;
  else drawStill(position);
}

/** One frame on or back, at the clip's average rate. */
function step(frames) {
  pause();
  goTo(position + frames / (fps || 30));
}

function play() {
  if (!playable || playing) return;
  playing = true;
  el.play.textContent = '⏸';
  el.play.setAttribute('aria-label', phrase('play.pause'));
  el.preview.play().catch(() => pause());
  follow();
}

function pause() {
  if (!playing) return;
  playing = false;
  el.play.textContent = '▶';
  el.play.setAttribute('aria-label', phrase('play.play'));
  el.preview.pause();
  // Snap to where it actually stopped, so the numbers agree with the picture.
  goTo(el.preview.currentTime);
}

/** Keep the slider and the clock in step while it plays. */
function follow() {
  if (!playing) return;
  position = el.preview.currentTime;
  el.scrub.value = String(Math.round(position * 1000));
  el.atTime.textContent = clockTime(position);
  requestAnimationFrame(follow);
}

/**
 * Draw the frame at `seconds` onto the stage canvas.
 *
 * Requests collapse rather than queue: dragging the slider asks for a hundred
 * frames and the only one worth having is the last. Decoding starts at the
 * keyframe before the moment asked for, so how long it takes depends on the
 * file rather than on how far the slider moved - hence the note over the
 * picture once it has been more than a moment.
 */
async function drawStill(seconds) {
  wantedTime = seconds;
  if (decoding) return;

  const mine = loadId;
  decoding = true;
  try {
    while (wantedTime !== shownTime && media && loadId === mine) {
      const target = wantedTime;
      const slow = setTimeout(() => { el.stageBusy.hidden = false; }, 120);
      try {
        const canvas = await grabFrame({ file, media, atSeconds: target });
        // Something newer came in, or another file did; that one wins.
        if (wantedTime !== target || loadId !== mine) continue;
        el.still.width = canvas.width;
        el.still.height = canvas.height;
        el.still.getContext('2d').drawImage(canvas, 0, 0);
        el.still.hidden = false;
        shownTime = target;
      } finally {
        clearTimeout(slow);
        el.stageBusy.hidden = true;
      }
    }
  } catch (error) {
    if (loadId !== mine) return;
    el.still.hidden = true;
    el.stageNote.textContent = phrase('preview.none',
      { why: phrase(error.message, fill(error.values)) });
  } finally {
    decoding = false;
  }
}

el.play.addEventListener('click', () => (playing ? pause() : play()));
el.stepBack.addEventListener('click', () => step(-1));
el.stepOn.addEventListener('click', () => step(1));

el.scrub.addEventListener('input', () => {
  pause();
  goTo(Number(el.scrub.value) / 1000);
});

// A player stops for reasons of its own as well as ours: the clip ends, the
// browser stops video in a background tab to save power, a headset button gets
// pressed. Following the element rather than only our own button is what keeps
// the label, the slider and the clock honest when that happens. pause() clears
// `playing` before it touches the element, so this cannot loop.
el.preview.addEventListener('pause', () => pause());
el.preview.addEventListener('ended', () => pause());

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
  el.formatNote.textContent = phrase(usingExact() ? 'note.exact' : 'note.record');
  el.audioNote.textContent = phrase(usingExact() ? 'note.audio.exact'
    : 'note.audio.record');

  updateSummary();
}

el.format.addEventListener('change', updateFormatNote);
el.quality.addEventListener('change', updateSummary);
el.keepAudio.addEventListener('change', updateSummary);

function updateSummary() {
  const rect = cropper.rect;
  if (!source.width) return;

  el.sumSize.textContent = phrase('size.from', {
    width: rect.width,
    height: rect.height,
    fromWidth: source.width,
    fromHeight: source.height,
  });

  const kept = (rect.width * rect.height) / (source.width * source.height);
  el.sumKept.textContent = kept >= 0.999
    ? phrase('kept.whole')
    : phrase('kept.part', { percent: Math.round(kept * 100) });

  el.sumLength.textContent = duration ? formatDuration(duration) : phrase('len.unknown');
  // Three whole sentences rather than one with the container in a blank:
  // where the name of the format falls in the line is the language's call.
  el.sumPath.textContent = phrase(usingExact() ? 'out.exact'
    : (el.format.value === 'webm' ? 'out.record.webm' : 'out.record.mp4'));
}

/* ------------------------------------------------------------------ export */

/**
 * An error's blanks, with any that are themselves a phrase resolved.
 *
 * transcode.js names the size it will not encode; the reader's sentence is
 * built here, where a phrase can be read.
 */
function fill(values = {}) {
  return Object.fromEntries(Object.entries(values)
    .map(([name, value]) => [name, value?.key ? phrase(value.key, value.values) : value]));
}

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
    el.progressLabel.textContent = phrase('step.preparing');
  } else if (phase === 'finishing') {
    el.progressLabel.textContent = phrase('step.finishing');
  } else if (realtime) {
    el.progressLabel.textContent = phrase('step.realtime', {
      done: formatDuration(done),
      total: formatDuration(total),
      percent: Math.round(fraction * 100),
    });
  } else {
    el.progressLabel.textContent = phrase('step.frame', {
      done: done.toLocaleString(),
      total: total.toLocaleString(),
      percent: Math.round(fraction * 100),
    });
  }
}

function outputFilename(extension) {
  const base = (file?.name ?? 'video').replace(/\.[^.]+$/, '');
  return `${base}-cropped.${extension}`;
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return phrase('size.kb', { n: (bytes / 1024).toFixed(0) });
  if (bytes < 1024 * 1024 * 1024) {
    return phrase('size.mb', { n: (bytes / 1024 / 1024).toFixed(1) });
  }
  return phrase('size.gb', { n: (bytes / 1024 / 1024 / 1024).toFixed(2) });
}

/** A moment in the clip, written the way a person reads it. */
function clockTime(seconds) {
  const whole = Math.max(0, seconds);
  const minutes = Math.floor(whole / 60);
  const rest = whole - minutes * 60;
  return `${minutes}:${rest.toFixed(3).padStart(6, '0')}`;
}

function formatDuration(seconds) {
  const whole = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(whole / 60);
  return minutes
    ? phrase('time.minutes', { minutes, seconds: String(whole % 60).padStart(2, '0') })
    : phrase('time.seconds', { n: seconds < 10 ? seconds.toFixed(1) : whole });
}

async function runExport() {
  if (exporting || !file) return;

  const crop = cropper.rect;
  if (crop.width < 16 || crop.height < 16) {
    showError(phrase('crop.toosmall'));
    return;
  }

  clearError();
  exporting = true;
  abortController = new AbortController();

  el.exportBtn.disabled = true;
  el.cancelBtn.hidden = false;
  el.progress.hidden = false;
  el.result.hidden = true;
  cropper.setEnabled(false);
  pause();
  setTransportEnabled(false);
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

    // The recorder hands back keys; the separator between two sentences is a
    // phrase too, because not every language puts a space after a full stop.
    if (result.warnings?.length) {
      showError(result.warnings.map((key) => phrase(key))
        .reduce((a, b) => phrase('join.sentences', { a, b })));
    }

    if (lastResultUrl) URL.revokeObjectURL(lastResultUrl);
    lastResultUrl = URL.createObjectURL(result.blob);

    el.resultVideo.src = lastResultUrl;
    el.download.href = lastResultUrl;
    el.download.download = outputFilename(result.extension);
    el.resultInfo.textContent = [
      result.extension.toUpperCase(),
      phrase('size.plain', { width: crop.width, height: crop.height }),
      formatBytes(result.blob.size),
      result.codec,
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
    exporting = false;
    abortController = null;
    el.cancelBtn.hidden = true;
    el.exportBtn.disabled = false;
    cropper.setEnabled(true);
    setTransportEnabled(true);
  }
}

/** The transport is left alone while a crop runs, along with the box itself. */
function setTransportEnabled(enabled) {
  for (const control of [el.play, el.stepBack, el.stepOn, el.scrub]) {
    control.disabled = !enabled;
  }
  if (enabled) {
    el.play.disabled = !playable;
    el.scrub.disabled = !duration;
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

/* -------------------------------------------------------------------- boot */

window.addEventListener('error', (event) => {
  showError(phrase('error.broke', { detail: event.message }));
});
window.addEventListener('unhandledrejection', (event) => {
  showError(phrase('error.broke', { detail: event.reason?.message ?? event.reason }));
});

if (!hasWebCodecs() && !hasMediaRecorder()) {
  showError(phrase('nocodec.page'));
}

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
