/** UI wiring and application state. */

import { wireFilePicker } from './shared/file-picker.js';
import { demux, UnsupportedFile } from './demux.js';
import { trimByCopy, estimateCopy } from './copy.js';
import {
  trimExact, grabFrame, decoderConfig, averageFps, outputSize, chooseBitrate,
} from './transcode.js';
import { trimByRecording, estimateRecording } from './record.js';
import { Timeline, formatTime, parseTime } from './timeline.js';
import { keyframeTimes, keyframeBefore, rangesFor, totalSeconds } from './ranges.js';
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
  sectionCard: $('section-card'),
  stage: $('stage'),
  preview: $('preview'),
  still: $('still'),
  stageNote: $('stage-note'),
  timeline: $('timeline'),
  tlNow: $('tl-now'),
  tlTotal: $('tl-total'),
  play: $('play'),
  playSection: $('play-section'),
  goStart: $('go-start'),
  goEnd: $('go-end'),
  markStart: $('mark-start'),
  markEnd: $('mark-end'),
  setStart: $('set-start'),
  setEnd: $('set-end'),
  markLength: $('mark-length'),
  markAll: $('mark-all'),
  exportCard: $('export-card'),
  method: $('method'),
  methodNote: $('method-note'),
  qualityField: $('quality-field'),
  quality: $('quality'),
  keepAudio: $('keep-audio'),
  audioNote: $('audio-note'),
  sumKeeping: $('sum-keeping'),
  sumLength: $('sum-length'),
  sumStart: $('sum-start'),
  sumSize: $('sum-size'),
  sumPicture: $('sum-picture'),
  sumSound: $('sum-sound'),
  cutNote: $('cut-note'),
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
/** Why the file could not be read as an MP4, in words, or null. */
let fallbackReason = null;
let source = { width: 0, height: 0 };
let duration = 0;
let fps = 30;
let playable = false;
/** Where the playhead is, in seconds. Read off the element where there is one,
 *  and kept here where there is not - a file the browser will not play still
 *  has a point you are marking against. */
let playAt = 0;

/** Which of the three ways of cutting this particular file allows. */
let canCopy = false;
let canCutExactly = false;
let canRecord = false;

let mode = 'keep';
let exporting = false;
let abortController = null;
let lastResultUrl = null;
/** Set while "Play the section" is running, so playback stops at the mark. */
let watchingSection = false;

const timeline = new Timeline(el.timeline, {
  onChange: onRangeChanged,
  onSeek: seekTo,
});

/* ------------------------------------------------------------------ adding */

// The drop zone and the picker: shared, because every tool here needs the
// same one. src/shared/file-picker.js, copied in from shared/js/ by the build.
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

    // Copying needs nothing but the reader: no decoder, no encoder, no
    // WebCodecs. A browser that cannot re-encode a frame can still cut one of
    // these files without losing a thing.
    canCopy = Boolean(media);
    canRecord = played.ok && hasMediaRecorder();
    canCutExactly = false;

    if (media && hasWebCodecs()) {
      canCutExactly = await canDecode(decoderConfig(media.video));
    }

    if (!canCopy && !canRecord) {
      showError(played.ok
        ? 'This browser cannot record video, so it cannot trim this file.'
        : `This browser cannot open this file: ${fallbackReason ?? 'the format is not one it plays.'}`);
      resetView();
      return;
    }

    playable = played.ok;
    source = media
      ? { width: media.video.displayWidth, height: media.video.displayHeight }
      : { width: played.width, height: played.height };
    duration = media ? Math.max(media.duration, played.duration) : played.duration;
    fps = media ? averageFps(media.video) : 30;

    await showPreview(played.ok);
    describeSource(played);

    timeline.setSource({
      duration,
      keyframes: media ? keyframeTimes(media.video) : null,
      frameTimes: media ? frameTimesOf(media.video) : null,
    });
    playAt = 0;
    timeline.setPlayhead(0);
    el.tlTotal.textContent = formatTime(duration);
    el.tlNow.textContent = formatTime(0);

    el.sectionCard.hidden = false;
    el.exportCard.hidden = false;
    el.exportBtn.disabled = false;
    updateMethodOptions();
  } catch (error) {
    console.error(error);
    showError(error?.message || 'That file could not be opened.');
    resetView();
  } finally {
    picker.done();
  }
}

/** Every frame's presentation time, in seconds and in order. */
function frameTimesOf(video) {
  const times = video.samples.map((sample) => sample.pts / video.timescale);
  times.sort((a, b) => a - b);
  return times;
}

/**
 * The preview is the played file where the browser will play it, and a frame
 * decoded by WebCodecs where it will not - which is how an iPhone HEVC clip
 * still gets a picture to mark against in a browser that has no licence to play
 * one.
 */
async function showPreview(canPlay) {
  el.stage.style.aspectRatio = `${source.width} / ${source.height}`;
  // Height is capped through the width, so the stage keeps the video's exact
  // shape - see the note on .stage in styles.css.
  el.stage.style.maxWidth = `calc(52vh * ${source.width / source.height})`;

  if (canPlay) {
    el.preview.hidden = false;
    el.still.hidden = true;
    el.stageNote.hidden = true;
    setTransportEnabled(true);
    return;
  }

  el.preview.hidden = true;
  el.stageNote.hidden = false;
  setTransportEnabled(false);
  el.stageNote.textContent = 'This browser will not play this file, so the frames below are '
    + 'decoded one at a time to show you where the marks are. The trim itself is unaffected.';

  await drawStill(0);
}

function setTransportEnabled(enabled) {
  for (const button of [el.play, el.playSection, el.goStart, el.goEnd]) {
    button.disabled = !enabled;
  }
}

/* -------------------------------------------------- the still-frame preview */

let stillBusy = false;
let stillWanted = null;
let stillTimer = null;

/**
 * Decode one frame and put it on the canvas.
 *
 * Only ever one decode at a time, and only ever the most recent request: a drag
 * along the timeline asks for a hundred frames and wants the last of them.
 */
async function drawStill(atSeconds) {
  if (!media || playable) return;
  stillWanted = atSeconds;
  if (stillBusy) return;

  stillBusy = true;
  try {
    while (stillWanted !== null) {
      const at = stillWanted;
      stillWanted = null;
      const canvas = await grabFrame({ file, media, atSeconds: at });
      el.still.width = canvas.width;
      el.still.height = canvas.height;
      el.still.getContext('2d').drawImage(canvas, 0, 0);
      el.still.hidden = false;
    }
  } catch (error) {
    el.stageNote.textContent = 'This browser will not play this file and no frame could be '
      + `decoded from it either (${error.message}). The marks below still work on its length.`;
  } finally {
    stillBusy = false;
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

  el.pathNote.hidden = Boolean(media);
  if (!media) {
    el.pathNote.textContent = 'This one is trimmed by playing it and recording the result, '
      + `because ${fallbackReason ?? 'its layout is not one the reader here understands.'} `
      + 'That takes as long as the section is long, and everything is re-encoded rather '
      + 'than copied.';
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
  stillWanted = null;
}

function resetView() {
  el.source.hidden = true;
  el.sectionCard.hidden = true;
  el.exportCard.hidden = true;
  el.pathNote.hidden = true;
  releaseFile();
}

/* ------------------------------------------------------------ the playhead */

function seekTo(seconds) {
  const at = Math.max(0, Math.min(seconds, duration));
  watchingSection = false;
  playAt = at;
  if (playable) el.preview.currentTime = at;
  else scheduleStill(at);
  timeline.setPlayhead(at);
  el.tlNow.textContent = formatTime(at);
}

/** Debounced, because a drag is a hundred requests and a decode is not free. */
function scheduleStill(at) {
  clearTimeout(stillTimer);
  stillTimer = setTimeout(() => drawStill(at), 180);
}

function currentTime() {
  return playable ? el.preview.currentTime : playAt;
}

el.preview.addEventListener('timeupdate', () => {
  const at = el.preview.currentTime;
  playAt = at;
  timeline.setPlayhead(at);
  el.tlNow.textContent = formatTime(at);

  if (watchingSection && at >= timeline.range.end) {
    el.preview.pause();
    watchingSection = false;
  }
});

el.preview.addEventListener('play', () => { el.play.textContent = 'Pause'; });
el.preview.addEventListener('pause', () => { el.play.textContent = 'Play'; });

function togglePlay() {
  if (!playable) return;
  watchingSection = false;
  if (el.preview.paused) el.preview.play().catch(() => {});
  else el.preview.pause();
}

el.play.addEventListener('click', togglePlay);

el.playSection.addEventListener('click', () => {
  if (!playable) return;
  const { start } = timeline.range;
  el.preview.currentTime = start;
  watchingSection = true;
  el.preview.play().catch(() => {});
});

el.goStart.addEventListener('click', () => seekTo(timeline.range.start));
el.goEnd.addEventListener('click', () => seekTo(timeline.range.end));

/* ---------------------------------------------------------------- the marks */

function onRangeChanged({ start, end }) {
  // Not while the field is being typed in: rewriting it under the cursor is
  // how a half-typed "1:0" becomes "1:00.000" before the rest arrives.
  if (document.activeElement !== el.markStart) el.markStart.value = formatTime(start);
  if (document.activeElement !== el.markEnd) el.markEnd.value = formatTime(end);
  el.markLength.textContent = formatDuration(Math.max(0, end - start));
  updateSummary();
}

el.setStart.addEventListener('click', () => {
  timeline.setRange({ start: currentTime() });
});

el.setEnd.addEventListener('click', () => {
  timeline.setRange({ end: currentTime() });
});

el.markAll.addEventListener('click', () => {
  timeline.setRange({ start: 0, end: duration });
  seekTo(0);
});

for (const [input, which] of [[el.markStart, 'start'], [el.markEnd, 'end']]) {
  const commit = () => {
    const seconds = parseTime(input.value);
    if (seconds === null) {
      input.value = formatTime(timeline.range[which]);
      return;
    }
    timeline.setRange({ [which]: seconds });
    input.value = formatTime(timeline.range[which]);
  };
  input.addEventListener('change', commit);
  input.addEventListener('blur', commit);
}

document.querySelectorAll('input[name="mode"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    mode = radio.value;
    timeline.setMode(mode);
    updateMethodOptions();
  });
});

/* --------------------------------------------------------------- shortcuts */

/** True while the keyboard belongs to something that takes typing. */
function typing(target) {
  return target instanceof HTMLInputElement
    || target instanceof HTMLTextAreaElement
    || target instanceof HTMLSelectElement
    || target?.isContentEditable;
}

window.addEventListener('keydown', (event) => {
  if (el.sectionCard.hidden || exporting) return;
  if (typing(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;

  const key = event.key.toLowerCase();

  if (key === 'i') {
    event.preventDefault();
    timeline.setRange({ start: currentTime() });
  } else if (key === 'o') {
    event.preventDefault();
    timeline.setRange({ end: currentTime() });
  } else if (event.key === ' ' && !(event.target instanceof HTMLButtonElement)) {
    event.preventDefault();
    togglePlay();
  } else if (event.key === 'ArrowLeft' && !event.target.closest?.('.tl-handle')) {
    event.preventDefault();
    seekTo(currentTime() - (event.shiftKey ? 1 : timeline.frameStep));
  } else if (event.key === 'ArrowRight' && !event.target.closest?.('.tl-handle')) {
    event.preventDefault();
    seekTo(currentTime() + (event.shiftKey ? 1 : timeline.frameStep));
  }
});

/* ------------------------------------------------------------- the output */

/** The sections of the source the current marks and mode come down to. */
function currentRanges() {
  const { start, end } = timeline.range;
  return rangesFor({ mode, start, end, duration });
}

function updateMethodOptions() {
  const copy = el.method.querySelector('option[value="copy"]');
  const exact = el.method.querySelector('option[value="exact"]');
  const record = el.method.querySelector('option[value="record"]');

  copy.disabled = !canCopy;
  exact.disabled = !canCutExactly;
  // A recording is made in one pass from one playhead, so it can keep a section
  // but cannot take one out and close the gap behind it.
  record.disabled = !canRecord || mode === 'remove';

  const available = [
    canCopy ? 'copy' : null,
    canCutExactly ? 'exact' : null,
    record.disabled ? null : 'record',
  ].filter(Boolean);

  if (!available.includes(el.method.value)) el.method.value = available[0] ?? 'copy';

  // Taking a piece out of the middle needs a path that can write two sections
  // into one file, and only the two MP4 paths can.
  const removeRadio = document.querySelector('input[name="mode"][value="remove"]');
  const canRemove = canCopy || canCutExactly;
  removeRadio.disabled = !canRemove;
  if (!canRemove && mode === 'remove') {
    mode = 'keep';
    document.querySelector('input[name="mode"][value="keep"]').checked = true;
    timeline.setMode('keep');
  }

  updateMethodNote();
}

function methodValue() {
  return el.method.value;
}

function updateMethodNote() {
  const method = methodValue();

  if (method === 'copy') {
    el.methodNote.textContent = 'The frames are moved into the new file exactly as they '
      + 'are, so nothing is decoded and nothing is encoded. Quick, and it cannot cost '
      + 'quality. The cut starts at the nearest keyframe before your mark.';
  } else if (method === 'exact') {
    el.methodNote.textContent = 'Starts on the frame you chose, by decoding from the '
      + 'keyframe in front of it and encoding the picture again. The sound is still '
      + 'copied rather than re-encoded.';
  } else {
    el.methodNote.textContent = 'Plays the section through and records it, so it takes as '
      + 'long as the section is long and everything is re-encoded. Keep this tab in front '
      + 'while it runs.';
  }

  el.qualityField.hidden = method === 'copy';

  const hasAudio = media ? Boolean(media.audio) : true;
  if (!hasAudio) {
    el.audioNote.textContent = 'This file has no audio track, so there is nothing to keep.';
  } else if (method === 'record') {
    el.audioNote.textContent = 'Captured from playback and re-encoded, because that is all '
      + 'a recording can do.';
  } else {
    el.audioNote.textContent = 'Copied from the file sample by sample, without ever being '
      + 'decoded, so it loses nothing.';
  }
  el.keepAudio.disabled = !hasAudio;

  updateSummary();
}

el.method.addEventListener('change', updateMethodNote);
el.quality.addEventListener('change', updateSummary);
el.keepAudio.addEventListener('change', updateSummary);

function updateSummary() {
  if (!duration) return;

  const ranges = currentRanges();
  const method = methodValue();
  const { start, end } = timeline.range;
  const kept = totalSeconds(ranges);
  const keepAudio = el.keepAudio.checked && !el.keepAudio.disabled;

  el.sumKeeping.textContent = mode === 'keep'
    ? `${formatTime(start)} to ${formatTime(end)}`
    : `everything but ${formatTime(start)} to ${formatTime(end)}`;
  el.sumLength.textContent = formatDuration(kept);

  // Where the result will actually begin, which is the one number a copy can
  // surprise you with.
  if (method === 'copy' && media && ranges.length) {
    const behind = keyframeBefore(media.video, ranges[0].start);
    const preRoll = Math.max(0, ranges[0].start - behind);
    el.sumStart.textContent = preRoll < 0.001
      ? 'exactly where you marked (it is on a keyframe)'
      : 'exactly where you marked, through an edit mark';
    el.cutNote.hidden = preRoll < 0.001;
    if (preRoll >= 0.001) {
      el.cutNote.textContent = 'The nearest keyframe before your mark is '
        + `${preRoll.toFixed(2)}s earlier, and the frames in between have to stay in the `
        + 'file - nothing after them can be decoded without them. They are marked not to '
        + 'be played, which every mainstream player honours. A player that ignores edit '
        + `marks will show those ${preRoll.toFixed(2)}s at the front. Choose "Cut exactly `
        + 'here" if that matters more than keeping the original bytes.';
    }
  } else {
    el.sumStart.textContent = 'exactly where you marked';
    el.cutNote.hidden = true;
  }

  // What it will roughly weigh. Every figure here is arithmetic on what is
  // already known - no part of the file is read to work one out.
  let bytes = 0;
  if (method === 'copy' && media && ranges.length) {
    bytes = estimateCopy({ media, ranges, keepAudio }).bytes;
  } else if (method === 'exact' && media && ranges.length) {
    const size = outputSize(media.video);
    const bitrate = chooseBitrate({ video: media.video, size, fps, quality: el.quality.value });
    bytes = (bitrate / 8) * kept + (keepAudio ? audioBytesFor(kept) : 0);
  } else if (ranges.length) {
    bytes = estimateRecording({
      size: source, fps, quality: el.quality.value, seconds: kept,
    });
  }
  el.sumSize.textContent = bytes ? `about ${formatBytes(bytes)}` : '—';

  if (method === 'copy') {
    el.sumPicture.textContent = 'copied, frame for frame';
  } else if (method === 'exact') {
    const size = media ? outputSize(media.video) : source;
    el.sumPicture.textContent = `re-encoded to H.264, ${size.width} x ${size.height}`;
  } else {
    el.sumPicture.textContent = 'recorded as it plays';
  }

  // "There is none" comes first: a file with no audio track disables the
  // checkbox, and reporting that as "left out" reads like a choice you made.
  if (media && !media.audio) el.sumSound.textContent = 'none in this file';
  else if (!keepAudio) el.sumSound.textContent = 'left out';
  else if (method === 'record') el.sumSound.textContent = 're-encoded from playback';
  else el.sumSound.textContent = 'copied, sample for sample';

  el.exportBtn.disabled = exporting || !ranges.length;
  el.exportBtn.textContent = mode === 'keep' ? 'Trim video' : 'Cut the section out';
}

/** Roughly what the kept sound weighs, at the source's own rate. */
function audioBytesFor(seconds) {
  if (!media?.audio?.samples.length) return 0;
  const total = media.audio.samples.reduce((sum, sample) => sum + sample.size, 0);
  const length = media.audio.duration / media.audio.timescale;
  return length > 0 ? total / length * seconds : 0;
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
    el.progressLabel.textContent = 'Writing the file...';
  } else if (phase === 'copying') {
    el.progressLabel.textContent = `Copying sample ${done.toLocaleString()} `
      + `of ${total.toLocaleString()} (${Math.round(fraction * 100)}%)`;
  } else if (realtime) {
    el.progressLabel.textContent = 'Recording in real time - '
      + `${formatDuration(done)} of ${formatDuration(total)} (${Math.round(fraction * 100)}%)`;
  } else {
    el.progressLabel.textContent = `Trimming frame ${done.toLocaleString()} `
      + `of ${total.toLocaleString()} (${Math.round(fraction * 100)}%)`;
  }
}

function outputFilename(extension) {
  const base = (file?.name ?? 'video').replace(/\.[^.]+$/, '');
  return `${base}-trimmed.${extension}`;
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

  const ranges = currentRanges();
  if (!ranges.length) {
    showError(mode === 'keep'
      ? 'The section is too short to keep. Drag the marks further apart.'
      : 'That would remove the whole clip, which would leave nothing to save.');
    return;
  }

  clearError();
  exporting = true;
  abortController = new AbortController();

  el.exportBtn.disabled = true;
  el.cancelBtn.hidden = false;
  el.progressWrap.hidden = false;
  el.result.hidden = true;
  timeline.setEnabled(false);
  el.preview.pause();
  setProgress({ phase: 'preparing', done: 0, total: 1 });

  const method = methodValue();
  const quality = el.quality.value;
  const keepAudio = el.keepAudio.checked && !el.keepAudio.disabled;

  try {
    let result;
    if (method === 'copy') {
      result = await trimByCopy({
        file, media, ranges, keepAudio,
        onProgress: setProgress, signal: abortController.signal,
      });
    } else if (method === 'exact') {
      result = await trimExact({
        file, media, ranges, quality, keepAudio,
        onProgress: setProgress, signal: abortController.signal,
      });
    } else {
      result = await trimByRecording({
        src: objectUrl, range: ranges[0], size: source, quality, keepAudio, fps,
        onProgress: setProgress, signal: abortController.signal,
      });
    }

    if (result.warning) showError(result.warning);

    if (lastResultUrl) URL.revokeObjectURL(lastResultUrl);
    lastResultUrl = URL.createObjectURL(result.blob);

    el.resultVideo.src = lastResultUrl;
    el.download.href = lastResultUrl;
    el.download.download = outputFilename(result.extension);
    el.resultInfo.textContent = [
      result.extension.toUpperCase(),
      formatDuration(totalSeconds(ranges)),
      formatBytes(result.blob.size),
      method === 'copy' ? 'not re-encoded' : result.codec,
    ].join(' · ');
    el.result.hidden = false;
    el.progressWrap.hidden = true;
    el.result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) {
    el.progressWrap.hidden = true;
    if (error?.name !== 'AbortError') {
      showError(error?.message || 'Something went wrong while trimming.');
      console.error(error);
    }
  } finally {
    exporting = false;
    abortController = null;
    el.cancelBtn.hidden = true;
    el.exportBtn.disabled = false;
    timeline.setEnabled(true);
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

monitorNetwork();
registerServiceWorker();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
