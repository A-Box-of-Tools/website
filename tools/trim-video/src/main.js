/** UI wiring and application state. */

import { phrase } from './shared/phrases.js';
import { wireFilePicker, readingLabel } from './shared/file-picker.js';
import { demux, UnsupportedFile } from './demux.js';
import { joinByCopy, estimateJoinCopy } from './copy.js';
import {
  joinExact, grabFrame, decoderConfig, averageFps, chooseJoinBitrate,
} from './transcode.js';
import { trimByRecording, estimateRecording } from './record.js';
import { joinability, outputFrame } from './clips.js';
import { fittedBox } from './draw.js';
import { Timeline, formatTime, parseTime } from './timeline.js';
import {
  openSegment, readTimestamps, segmentRanges, totalCaptured, writeTimestamps,
} from './segments.js';
import { keyframeTimes, keyframeBefore, invertRanges, totalSeconds } from './ranges.js';
import { hasWebCodecs, hasMediaRecorder, canDecode } from './support.js';

/**
 * A reader refusal, in the reader's language. The demuxer and the writer are
 * copied byte for byte into fifteen languages, so what they hand back is a
 * phrase key and its values; `absent` is the sentence for the file that was
 * never given to them at all - the browser's own player took it instead.
 */
function why(fallback, absent) {
  return phrase(fallback?.key ?? absent, fallback?.values);
}

const $ = (id) => document.getElementById(id);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  clipList: $('clip-list'),
  joinNote: $('join-note'),
  pathNote: $('path-note'),
  sectionCard: $('section-card'),
  editing: $('editing'),
  stage: $('stage'),
  preview: $('preview'),
  still: $('still'),
  stageNote: $('stage-note'),
  timeline: $('timeline'),
  tlNow: $('tl-now'),
  tlTotal: $('tl-total'),
  play: $('play'),
  back5: $('back-5'),
  forward5: $('forward-5'),
  markIn: $('mark-in'),
  markOut: $('mark-out'),
  undo: $('undo'),
  speedRow: document.querySelector('.speed-row'),
  segmentCount: $('segment-count'),
  totalKept: $('total-kept'),
  segmentTable: $('segment-table'),
  segmentRows: $('segment-rows'),
  segmentsEmpty: $('segments-empty'),
  addSegment: $('add-segment'),
  resetSegments: $('reset-segments'),
  importMarks: $('import-marks'),
  marksInput: $('marks-input'),
  marksFormat: $('marks-format'),
  exportMarks: $('export-marks'),
  exportCard: $('export-card'),
  method: $('method'),
  methodNote: $('method-note'),
  frameField: $('frame-field'),
  frame: $('frame'),
  qualityField: $('quality-field'),
  quality: $('quality'),
  keepAudio: $('keep-audio'),
  audioNote: $('audio-note'),
  sumClips: $('sum-clips'),
  sumLength: $('sum-length'),
  sumStart: $('sum-start'),
  sumSize: $('sum-size'),
  sumPicture: $('sum-picture'),
  sumSound: $('sum-sound'),
  cutNote: $('cut-note'),
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

/**
 * The videos, in the order they will be joined, each holding its own list of
 * marked segments.
 *
 * One video with one segment is a trim; one video with eight is what this tool
 * is for; several videos is a join. All three are the same list, so there is no
 * second code path to keep in step.
 *
 * @type {object[]}
 */
let clips = [];
/** Which video the timeline and the preview are pointed at. */
let selected = -1;
/** Which segment of it carries the handles. */
let selectedSegment = null;
/** What happens to the marked parts: keep them, or cut them out. */
let mode = 'keep';

let exporting = false;
let abortController = null;
let lastResultUrl = null;
let nextId = 1;
/** Where the playhead is, in seconds. Read off the element where there is one,
 *  and kept here where there is not. */
let playAt = 0;
/** Set while a segment is being previewed, so playback stops at its end. */
let watchUntil = null;

const timeline = new Timeline(el.timeline, {
  onSeek: seekTo,
  onSelect: (id) => { selectedSegment = id; renderSegments(); },
  onAdjust: adjustSegment,
});

const clip = () => (selected >= 0 ? clips[selected] : null);

/* ------------------------------------------------------------------ adding */

const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles(files) { addFiles(files); },
});

async function addFiles(files) {
  if (exporting || !files.length) return;
  clearError();
  picker.busy(readingLabel(files.length));

  try {
    for (const file of files) {
      const added = await addClip(file);
      if (added && selected < 0) selectClip(clips.length - 1);
    }
  } finally {
    picker.done();
  }

  if (!clips.length) return;
  describeSelection();
  renderClips();
  updateMethodOptions();
}

/**
 * Ask a <video> element to open the file, and report what it made of it.
 *
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

async function addClip(file) {
  const objectUrl = URL.createObjectURL(file);
  const probe = document.createElement('video');
  probe.preload = 'metadata';
  probe.muted = true;
  probe.playsInline = true;

  try {
    const played = await openInPlayer(probe, objectUrl);

    let media = null;
    let fallbackReason = null;
    try {
      media = await demux(file);
    } catch (error) {
      fallbackReason = error instanceof UnsupportedFile
        ? { key: error.reason, values: error.values }
        : { key: error.message || 'read.unreadable' };
    }

    // Copying needs nothing but the reader: no decoder, no encoder, no
    // WebCodecs. A browser that cannot re-encode a frame can still cut one of
    // these files without losing a thing.
    const canExact = Boolean(media) && hasWebCodecs()
      && await canDecode(decoderConfig(media.video));
    const canRecord = played.ok && hasMediaRecorder();

    if (!media && !canRecord) {
      showError(played.ok
        ? phrase('open.norecord', { name: file.name })
        : phrase('open.failed', { name: file.name, reason: why(fallbackReason, 'read.notplayed') }));
      URL.revokeObjectURL(objectUrl);
      return false;
    }

    const source = media
      ? { width: media.video.displayWidth, height: media.video.displayHeight }
      : { width: played.width, height: played.height };

    const entry = {
      id: nextId++,
      file,
      name: file.name,
      objectUrl,
      media,
      fallbackReason,
      playable: played.ok,
      source,
      duration: media ? Math.max(media.duration, played.duration) : played.duration,
      fps: media ? averageFps(media.video) : 30,
      canExact,
      canRecord,
      thumbnail: null,
      segments: [],
      nextSegmentId: 1,
    };

    clips.push(entry);
    // The picture in the list is worth having and is not worth failing over.
    makeThumbnail(entry, probe).then((url) => {
      if (!url) return;
      entry.thumbnail = url;
      renderClips();
    });
    return true;
  } catch (error) {
    console.error(error);
    showError(phrase('open.failed', {
      name: file.name,
      reason: error?.message ? phrase(error.message) : String(error),
    }));
    URL.revokeObjectURL(objectUrl);
    return false;
  }
}

/** A still from a second or so in, which is more use than a black first frame. */
async function makeThumbnail(entry, probe) {
  const at = Math.min(1, entry.duration / 2) || 0;

  if (entry.media && entry.canExact) {
    try {
      const canvas = await grabFrame({
        file: entry.file, media: entry.media, atSeconds: at, maxWidth: 240,
      });
      return canvas.toDataURL('image/jpeg', 0.7);
    } catch {
      // Fall through to the player, which may manage what the decoder did not.
    }
  }

  if (!entry.playable) return null;
  try {
    await new Promise((resolve) => {
      const done = () => { clearTimeout(timer); resolve(); };
      const timer = setTimeout(done, 4000);
      probe.addEventListener('seeked', done, { once: true });
      probe.currentTime = at;
    });
    const scale = Math.min(1, 240 / Math.max(1, probe.videoWidth));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(2, Math.round(probe.videoWidth * scale));
    canvas.height = Math.max(2, Math.round(probe.videoHeight * scale));
    canvas.getContext('2d').drawImage(probe, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.7);
  } catch {
    return null;
  }
}

/* --------------------------------------------------------- the video list */

function renderClips() {
  // One video needs no list: the heading already says which one it is.
  el.clipList.hidden = clips.length < 2;
  el.clipList.innerHTML = '';
  if (clips.length < 2) return;

  clips.forEach((entry, index) => {
    const row = document.createElement('li');
    row.className = `clip${index === selected ? ' selected' : ''}`;

    const shot = document.createElement('div');
    shot.className = 'clip-shot';
    if (entry.thumbnail) {
      const image = document.createElement('img');
      image.src = entry.thumbnail;
      image.alt = '';
      shot.append(image);
    } else {
      shot.textContent = String(index + 1);
      shot.classList.add('clip-shot-empty');
    }

    const body = document.createElement('div');
    body.className = 'clip-body';

    const title = document.createElement('button');
    title.type = 'button';
    title.className = 'clip-name';
    title.textContent = entry.name;
    title.title = phrase('clip.mark');
    title.addEventListener('click', () => selectClip(index));

    const marked = segmentRanges(entry.segments).length;
    const facts = document.createElement('p');
    facts.className = 'clip-facts';
    facts.textContent = [
      `${entry.source.width} x ${entry.source.height}`,
      formatDuration(entry.duration),
      marked
        ? phrase(marked === 1 ? 'clip.segments.one' : 'clip.segments.many', { n: marked })
        : phrase('clip.notmarked'),
      phrase(entry.media
        ? (entry.media.audio ? 'clip.sound' : 'clip.nosound')
        : 'clip.recorded'),
    ].join(' · ');

    body.append(title, facts);

    const actions = document.createElement('div');
    actions.className = 'clip-actions';
    actions.append(
      iconButton('↑', 'Move up', () => moveClip(index, -1), index === 0),
      iconButton('↓', 'Move down', () => moveClip(index, 1), index === clips.length - 1),
      iconButton('✕', 'Remove', () => removeClip(index), false, 'danger'),
    );

    row.append(shot, body, actions);
    el.clipList.append(row);
  });
}

function iconButton(label, title, onClick, disabled = false, extra = '') {
  const element = document.createElement('button');
  element.type = 'button';
  element.className = `clip-button ghost${extra ? ` ${extra}` : ''}`;
  element.textContent = label;
  element.title = title;
  element.setAttribute('aria-label', title);
  element.disabled = disabled || exporting;
  element.addEventListener('click', onClick);
  return element;
}

function moveClip(index, by) {
  const to = index + by;
  if (to < 0 || to >= clips.length) return;
  const [moved] = clips.splice(index, 1);
  clips.splice(to, 0, moved);
  if (selected === index) selected = to;
  else if (selected === to) selected = index;
  describeSelection();
  renderClips();
  updateSummary();
}

function removeClip(index) {
  const [gone] = clips.splice(index, 1);
  URL.revokeObjectURL(gone.objectUrl);

  if (!clips.length) {
    selected = -1;
    el.preview.removeAttribute('src');
    el.preview.load();
    renderClips();
    return;
  }

  selectClip(Math.min(index, clips.length - 1));
  updateMethodOptions();
}

/* ------------------------------------------------------- the chosen video */

/** Which video is being marked, said out loud once there are two. */
function describeSelection() {
  const entry = clip();
  el.editing.hidden = clips.length < 2 || !entry;
  if (entry) {
    el.editing.textContent = phrase('clip.editing',
      { name: entry.name, index: selected + 1, total: clips.length });
  }
}

function selectClip(index) {
  if (index < 0 || index >= clips.length) return;
  selected = index;
  const entry = clips[index];
  selectedSegment = entry.segments.length ? entry.segments[entry.segments.length - 1].id : null;

  describeSelection();

  if (entry.playable) {
    if (el.preview.src !== entry.objectUrl) el.preview.src = entry.objectUrl;
    el.preview.hidden = false;
    el.still.hidden = true;
    el.stageNote.hidden = true;
    setTransportEnabled(true);
  } else {
    el.preview.removeAttribute('src');
    el.preview.hidden = true;
    el.stageNote.hidden = false;
    setTransportEnabled(false);
    el.stageNote.textContent = phrase('stage.noplay');
    drawStill(entry, 0);
  }

  el.stage.style.aspectRatio = `${entry.source.width} / ${entry.source.height}`;
  // Height is capped through the width, so the stage keeps the video's exact
  // shape - see the note on .stage in styles.css.
  el.stage.style.maxWidth = `calc(52vh * ${entry.source.width / entry.source.height})`;

  timeline.setSource({
    duration: entry.duration,
    keyframes: entry.media ? keyframeTimes(entry.media.video) : null,
    frameTimes: entry.media ? frameTimesOf(entry.media.video) : null,
  });
  playAt = 0;
  timeline.setPlayhead(0);
  el.tlTotal.textContent = formatTime(entry.duration);
  el.tlNow.textContent = formatTime(0);

  el.pathNote.hidden = Boolean(entry.media);
  if (!entry.media) {
    el.pathNote.textContent = phrase('path.record', {
      name: entry.name,
      reason: why(entry.fallbackReason, 'read.layout'),
    });
  }

  renderSegments();
  renderClips();
}

/** Every frame's presentation time, in seconds and in order. */
function frameTimesOf(video) {
  const times = video.samples.map((sample) => sample.pts / video.timescale);
  times.sort((a, b) => a - b);
  return times;
}

function setTransportEnabled(enabled) {
  for (const control of [el.play, el.back5, el.forward5]) control.disabled = !enabled;
  for (const control of el.speedRow.querySelectorAll('.speed')) control.disabled = !enabled;
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
async function drawStill(entry, atSeconds) {
  if (!entry?.media || entry.playable) return;
  stillWanted = atSeconds;
  if (stillBusy) return;

  stillBusy = true;
  try {
    while (stillWanted !== null) {
      const at = stillWanted;
      stillWanted = null;
      const canvas = await grabFrame({ file: entry.file, media: entry.media, atSeconds: at });
      el.still.width = canvas.width;
      el.still.height = canvas.height;
      el.still.getContext('2d').drawImage(canvas, 0, 0);
      el.still.hidden = false;
    }
  } catch (error) {
    el.stageNote.textContent = phrase('stage.noframe',
      { detail: phrase(error.message, error.values) });
  } finally {
    stillBusy = false;
  }
}

/* ------------------------------------------------------------ the playhead */

function seekTo(seconds) {
  const entry = clip();
  if (!entry) return;
  const at = Math.max(0, Math.min(seconds, entry.duration));
  watchUntil = null;
  playAt = at;
  if (entry.playable) el.preview.currentTime = at;
  else scheduleStill(entry, at);
  timeline.setPlayhead(at);
  el.tlNow.textContent = formatTime(at);
}

/** Debounced, because a drag is a hundred requests and a decode is not free. */
function scheduleStill(entry, at) {
  clearTimeout(stillTimer);
  stillTimer = setTimeout(() => drawStill(entry, at), 180);
}

function currentTime() {
  const entry = clip();
  return entry?.playable ? el.preview.currentTime : playAt;
}

el.preview.addEventListener('timeupdate', () => {
  const at = el.preview.currentTime;
  playAt = at;
  timeline.setPlayhead(at);
  el.tlNow.textContent = formatTime(at);

  if (watchUntil !== null && at >= watchUntil) {
    el.preview.pause();
    watchUntil = null;
  }
});

el.preview.addEventListener('play', () => { el.play.textContent = '❚❚'; });
el.preview.addEventListener('pause', () => { el.play.textContent = '▶'; });

function togglePlay() {
  if (!clip()?.playable) return;
  watchUntil = null;
  if (el.preview.paused) el.preview.play().catch(() => {});
  else el.preview.pause();
}

el.play.addEventListener('click', togglePlay);
el.back5.addEventListener('click', () => seekTo(currentTime() - 5));
el.forward5.addEventListener('click', () => seekTo(currentTime() + 5));

el.speedRow.addEventListener('click', (event) => {
  const button = event.target.closest('.speed');
  if (!button) return;
  for (const other of el.speedRow.querySelectorAll('.speed')) {
    other.classList.toggle('active', other === button);
  }
  el.preview.playbackRate = Number(button.dataset.speed);
});

/* ------------------------------------------------------------- the marking */

/**
 * `i`: open a segment here.
 *
 * Pressing it again while one is still open moves that start rather than
 * opening a second - which is what you want when you meant to mark the run-up
 * and pressed a beat too early.
 */
function markIn() {
  const entry = clip();
  if (!entry) return;
  const at = timeline.snap(currentTime());
  const open = openSegment(entry.segments);

  if (open) open.start = at;
  else entry.segments.push({ id: entry.nextSegmentId++, start: at, end: null });

  selectedSegment = entry.segments[entry.segments.length - 1].id;
  clearError();
  renderSegments();
}

/** `o`: close the last segment here. */
function markOut() {
  const entry = clip();
  if (!entry) return;
  const last = entry.segments[entry.segments.length - 1];
  if (!last) {
    showError(phrase('mark.noopen'));
    return;
  }

  const at = timeline.snap(currentTime());
  if (at <= last.start) {
    showError(phrase('mark.before',
      { at: formatTime(at), start: formatTime(last.start) }));
    return;
  }

  last.end = at;
  selectedSegment = last.id;
  clearError();
  renderSegments();
}

/** `u`: take the last one back. */
function undoSegment() {
  const entry = clip();
  if (!entry?.segments.length) return;
  entry.segments.pop();
  selectedSegment = entry.segments.length
    ? entry.segments[entry.segments.length - 1].id
    : null;
  renderSegments();
}

el.markIn.addEventListener('click', markIn);
el.markOut.addEventListener('click', markOut);
el.undo.addEventListener('click', undoSegment);

el.addSegment.addEventListener('click', () => {
  const entry = clip();
  if (!entry) return;
  const start = timeline.snap(currentTime());
  const end = Math.min(entry.duration, start + Math.min(5, entry.duration - start));
  if (end - start < 0.05) {
    showError(phrase('mark.nospace'));
    return;
  }
  entry.segments.push({ id: entry.nextSegmentId++, start, end });
  selectedSegment = entry.segments[entry.segments.length - 1].id;
  renderSegments();
});

el.resetSegments.addEventListener('click', () => {
  const entry = clip();
  if (!entry?.segments.length) return;
  // eslint-disable-next-line no-alert
  if (!window.confirm(phrase('mark.clearall',
    { n: entry.segments.length, name: entry.name }))) return;
  entry.segments = [];
  selectedSegment = null;
  renderSegments();
});

function adjustSegment(id, { start, end }) {
  const entry = clip();
  const segment = entry?.segments.find((one) => one.id === id);
  if (!segment) return;
  segment.start = start;
  segment.end = end;
  renderSegments();
}

/* ------------------------------------------------------- the segment table */

function renderSegments() {
  const entry = clip();
  const segments = entry?.segments ?? [];
  const finished = segmentRanges(segments);

  el.segmentTable.hidden = segments.length === 0;
  el.segmentsEmpty.hidden = segments.length > 0;
  el.segmentRows.innerHTML = '';

  el.segmentCount.textContent = segments.length === 0
    ? phrase('segments.none')
    : phrase('segments.some', { done: finished.length, total: segments.length });
  el.totalKept.textContent = formatTime(
    mode === 'keep' && finished.length
      ? totalCaptured(segments)
      : totalSeconds(rangesOf(entry ?? { segments: [], duration: 0 })));

  segments.forEach((segment, index) => {
    const row = document.createElement('tr');
    row.className = `segment${segment.id === selectedSegment ? ' selected' : ''}`;
    if (segment.end === null) row.classList.add('open');
    row.addEventListener('click', () => {
      selectedSegment = segment.id;
      renderSegments();
    });

    const number = document.createElement('td');
    number.className = 'col-index';
    number.textContent = String(index + 1);

    row.append(
      number,
      timeCell(segment, 'start'),
      timeCell(segment, 'end'),
      lengthCell(segment),
      actionsCell(segment, index),
    );
    el.segmentRows.append(row);
  });

  timeline.setSegments(segments, selectedSegment);
  timeline.setPending(openSegment(segments)?.start ?? null);
  renderClips();
  updateSummary();
}

/** A start or an end, typed as freely as it is read. */
function timeCell(segment, which) {
  const cell = document.createElement('td');
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'segment-time';
  input.inputMode = 'decimal';
  input.spellcheck = false;
  input.autocomplete = 'off';
  input.setAttribute('aria-label', which === 'start' ? 'Start time' : 'End time');
  input.value = segment[which] === null ? '' : formatTime(segment[which]);
  input.placeholder = which === 'end' ? 'press O' : '';

  const commit = () => {
    const entry = clip();
    const seconds = parseTime(input.value);
    if (seconds === null) {
      input.value = segment[which] === null ? '' : formatTime(segment[which]);
      return;
    }
    const at = Math.max(0, Math.min(seconds, entry.duration));
    if (which === 'start' && segment.end !== null && at >= segment.end) {
      input.value = formatTime(segment.start);
      return;
    }
    if (which === 'end' && at <= segment.start) {
      input.value = segment.end === null ? '' : formatTime(segment.end);
      return;
    }
    segment[which] = at;
    renderSegments();
  };

  input.addEventListener('change', commit);
  input.addEventListener('blur', commit);
  cell.append(input);
  return cell;
}

function lengthCell(segment) {
  const cell = document.createElement('td');
  cell.className = 'segment-length';
  cell.textContent = segment.end === null ? '—' : formatTime(segment.end - segment.start);
  return cell;
}

function actionsCell(segment, index) {
  const cell = document.createElement('td');
  cell.className = 'segment-buttons';
  const entry = clip();

  cell.append(
    iconButton('▶', phrase('seg.play'), () => playSegment(segment), segment.end === null),
    iconButton('↑', phrase('seg.up'), () => moveSegment(index, -1), index === 0),
    iconButton('↓', phrase('seg.down'), () => moveSegment(index, 1),
      index === entry.segments.length - 1),
    iconButton('✕', phrase('seg.remove'), () => removeSegment(index), false, 'danger'),
  );
  return cell;
}

function playSegment(segment) {
  const entry = clip();
  if (!entry?.playable || segment.end === null) return;
  el.preview.currentTime = segment.start;
  watchUntil = segment.end;
  selectedSegment = segment.id;
  el.preview.play().catch(() => {});
  renderSegments();
}

function moveSegment(index, by) {
  const entry = clip();
  const to = index + by;
  if (!entry || to < 0 || to >= entry.segments.length) return;
  const [moved] = entry.segments.splice(index, 1);
  entry.segments.splice(to, 0, moved);
  renderSegments();
}

function removeSegment(index) {
  const entry = clip();
  if (!entry) return;
  const [gone] = entry.segments.splice(index, 1);
  if (selectedSegment === gone.id) {
    selectedSegment = entry.segments.length
      ? entry.segments[Math.min(index, entry.segments.length - 1)].id
      : null;
  }
  renderSegments();
}

/* ----------------------------------------------------- saving the marks */

el.exportMarks.addEventListener('click', () => {
  const entry = clip();
  if (!entry) return;
  const ranges = segmentRanges(entry.segments);
  if (!ranges.length) {
    showError(phrase('marks.nothing'));
    return;
  }

  const text = writeTimestamps(entry.segments, {
    format: el.marksFormat.value,
    name: entry.name,
  });
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${entry.name.replace(/\.[^.]+$/, '')}-marks.txt`;
  link.click();
  // Revoked on the next turn of the loop: the click has to have been handled
  // before the URL stops meaning anything.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

el.importMarks.addEventListener('click', () => el.marksInput.click());

el.marksInput.addEventListener('change', async () => {
  const [file] = el.marksInput.files ?? [];
  el.marksInput.value = '';
  const entry = clip();
  if (!file || !entry) return;

  try {
    const parsed = readTimestamps(await file.text());
    const kept = parsed.segments.filter((segment) => segment.start < entry.duration);

    if (!kept.length) {
      showError(phrase('marks.pastend', { name: file.name }));
      return;
    }

    entry.segments = kept.map((segment) => ({
      id: entry.nextSegmentId++,
      start: segment.start,
      end: Math.min(segment.end, entry.duration),
    }));
    selectedSegment = entry.segments[entry.segments.length - 1].id;
    el.marksFormat.value = parsed.format;

    // Nothing to say when the whole file loaded: the rows appearing is the
    // report. The box below is red, and red should mean something went wrong.
    const dropped = parsed.segments.length - kept.length;
    clearError();
    if (dropped || parsed.skipped) {
      // Three sentences, each whole. The English one picked a noun and
      // two verbs with ternaries - "1 segment ... starts ... it was"
      // against "3 segments ... start ... they were" - which is a
      // sentence assembled out of English grammar rather than translated.
      const says = [];
      if (dropped) {
        says.push(phrase(dropped === 1 ? 'marks.dropped.one' : 'marks.dropped.many',
          { n: dropped, name: file.name }));
      }
      if (parsed.skipped) {
        says.push(phrase(
          parsed.skipped === 1 ? 'marks.skipped.one' : 'marks.skipped.many',
          { n: parsed.skipped }));
      }
      says.push(phrase('marks.loaded', { n: kept.length }));
      showError(sentences(says));
    }
    renderSegments();
  } catch (error) {
    showError(phrase('marks.failed',
      { name: file.name, reason: phrase(error.message, error.values) }));
  }
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
    markIn();
  } else if (key === 'o') {
    event.preventDefault();
    markOut();
  } else if (key === 'u') {
    event.preventDefault();
    undoSegment();
  } else if (event.key === ' ' && !(event.target instanceof HTMLButtonElement)) {
    event.preventDefault();
    togglePlay();
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault();
    seekTo(currentTime() - (event.shiftKey ? timeline.frameStep : 5));
  } else if (event.key === 'ArrowRight') {
    event.preventDefault();
    seekTo(currentTime() + (event.shiftKey ? timeline.frameStep : 5));
  }
});

/* ------------------------------------------------------------- the output */

/** The sections of one video its marks and the chosen mode come down to. */
function rangesOf(entry) {
  const marked = segmentRanges(entry.segments);
  if (mode === 'cut') return invertRanges(marked, entry.duration);
  return marked.length ? marked : [{ start: 0, end: entry.duration }];
}

/** The videos, in order, as the export functions want them. */
function exportClips() {
  return clips
    .map((entry) => ({
      file: entry.file,
      media: entry.media,
      name: entry.name,
      source: entry.source,
      ranges: rangesOf(entry),
    }))
    .filter((entry) => entry.ranges.length);
}

document.querySelectorAll('input[name="mode"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    mode = radio.value;
    renderSegments();
    updateMethodOptions();
  });
});

function updateMethodOptions() {
  const chosen = exportClips();
  const keepAudio = el.keepAudio.checked;
  const join = chosen.length
    ? joinability(chosen, { keepAudio, t: phrase })
    : { copy: false, reason: null, sound: 'none' };

  const everyDemuxed = chosen.length > 0 && chosen.every((entry) => entry.media);
  const canCopy = everyDemuxed && join.copy;
  const canExact = clips.length > 0 && clips.every((entry) => entry.canExact) && chosen.length > 0;
  // A recording is made in one pass from one playhead: it can keep one section
  // of one video and nothing else.
  const canRecord = clips.length === 1 && clips[0].canRecord && chosen.length === 1
    && chosen[0].ranges.length === 1;

  el.method.querySelector('option[value="copy"]').disabled = !canCopy;
  el.method.querySelector('option[value="exact"]').disabled = !canExact;
  el.method.querySelector('option[value="record"]').disabled = !canRecord;

  const available = [
    canCopy ? 'copy' : null,
    canExact ? 'exact' : null,
    canRecord ? 'record' : null,
  ].filter(Boolean);
  if (!available.includes(el.method.value)) el.method.value = available[0] ?? 'copy';

  // Why the quick path is unavailable, said once, in terms somebody can act on
  // - which usually means dropping or reordering a video.
  el.joinNote.hidden = clips.length < 2 || canCopy || !join.reason;
  if (!el.joinNote.hidden) {
    el.joinNote.textContent = phrase('join.note', { reason: join.reason });
  }

  updateMethodNote();
}

function updateMethodNote() {
  const method = el.method.value;
  const chosen = exportClips();
  const sections = chosen.reduce((total, entry) => total + entry.ranges.length, 0);
  const many = chosen.length > 1;

  if (method === 'copy') {
    el.methodNote.textContent = phrase(sections > 1 ? 'method.copy.many' : 'method.copy.one');
  } else if (method === 'exact') {
    el.methodNote.textContent = phrase(many ? 'method.exact.many' : 'method.exact.one');
  } else {
    el.methodNote.textContent = phrase('method.record');
  }

  el.qualityField.hidden = method === 'copy';
  el.frameField.hidden = !(method === 'exact' && many);

  const anySound = chosen.some((entry) => entry.media?.audio?.samples.length)
    || clips.some((entry) => !entry.media);
  const sound = joinability(chosen, { keepAudio: el.keepAudio.checked, t: phrase }).sound;

  if (!anySound) {
    el.audioNote.textContent = phrase('audio.none');
  } else if (method === 'record') {
    el.audioNote.textContent = phrase('audio.record');
  } else if (sound === 'encode' && method === 'exact') {
    el.audioNote.textContent = phrase('audio.encode');
  } else {
    el.audioNote.textContent = phrase('audio.copy');
  }
  el.keepAudio.disabled = !anySound;

  updateSummary();
}

el.method.addEventListener('change', updateMethodNote);
el.frame.addEventListener('change', updateSummary);
el.quality.addEventListener('change', updateSummary);
el.keepAudio.addEventListener('change', () => updateMethodOptions());

function updateSummary() {
  const chosen = exportClips();
  if (!chosen.length) {
    el.exportBtn.disabled = true;
    el.sumLength.textContent = '0s';
    el.sumClips.textContent = phrase(
      mode === 'cut' ? 'sum.nothing.cut' : 'sum.nothing.keep');
    return;
  }

  const method = el.method.value;
  const keepAudio = el.keepAudio.checked && !el.keepAudio.disabled;
  const kept = chosen.reduce((total, entry) => total + totalSeconds(entry.ranges), 0);
  const sections = chosen.reduce((total, entry) => total + entry.ranges.length, 0);

  const parts = phrase(sections === 1 ? 'sum.parts.one' : 'sum.parts.many',
    { n: sections });
  el.sumClips.textContent = chosen.length === 1
    ? (mode === 'cut' ? phrase('sum.parts.cut', { parts }) : parts)
    : phrase('sum.parts.videos', { parts, n: chosen.length });
  el.sumLength.textContent = formatDuration(kept);

  // Where the result will begin, which is the one number a copy can surprise
  // you with.
  const first = chosen[0];
  if (method === 'copy' && first.media) {
    const behind = keyframeBefore(first.media.video, first.ranges[0].start);
    const preRoll = Math.max(0, first.ranges[0].start - behind);
    el.sumStart.textContent = phrase(preRoll < 0.001
      ? 'sum.start.keyframe'
      : 'sum.start.editmark');
    el.cutNote.hidden = preRoll < 0.001;
    if (preRoll >= 0.001) {
      el.cutNote.textContent = phrase('cut.note', { seconds: preRoll.toFixed(2) });
    }
  } else {
    el.sumStart.textContent = phrase('sum.start.exact');
    el.cutNote.hidden = true;
  }

  const frame = method === 'exact' && chosen.length > 1
    ? outputFrame(chosen, el.frame.value)
    : outputFrame(chosen.slice(0, 1), 'first');

  // What it will roughly weigh. Every figure is arithmetic on what is already
  // known - no part of any file is read to work one out.
  let bytes = 0;
  if (method === 'copy') {
    bytes = estimateJoinCopy(chosen, keepAudio).bytes;
  } else if (method === 'exact') {
    const fps = Math.max(...chosen.map((entry) => averageFps(entry.media.video)));
    const bitrate = chooseJoinBitrate({ clips: chosen, frame, fps, quality: el.quality.value });
    bytes = (bitrate / 8) * kept + (keepAudio ? 20_000 * kept : 0);
  } else {
    bytes = estimateRecording({
      size: first.source, fps: clips[0].fps, quality: el.quality.value, seconds: kept,
    });
  }
  el.sumSize.textContent = bytes
    ? phrase('sum.size', { size: formatBytes(bytes) })
    : '—';

  if (method === 'copy') {
    el.sumPicture.textContent = phrase('sum.picture.copy');
  } else if (method === 'exact') {
    const bars = chosen.filter((entry) => !fittedBox({
      displayWidth: entry.source.width, displayHeight: entry.source.height, frame,
    }).fits).length;
    el.sumPicture.textContent = phrase(
      bars ? 'sum.picture.exact.bars' : 'sum.picture.exact',
      { size: `${frame.width} x ${frame.height}`, n: bars });
  } else {
    el.sumPicture.textContent = phrase('sum.picture.record');
  }

  // "There is none" comes before "you turned it off": no audio track at all is
  // not a choice anybody made.
  const sound = joinability(chosen, { keepAudio: true, t: phrase }).sound;
  if (sound === 'none') el.sumSound.textContent = phrase('sum.sound.none');
  else if (!keepAudio) el.sumSound.textContent = phrase('sum.sound.left');
  else if (method === 'record') el.sumSound.textContent = phrase('sum.sound.record');
  else if (sound === 'encode' && method === 'exact') {
    el.sumSound.textContent = phrase('sum.sound.encode');
  } else el.sumSound.textContent = phrase('sum.sound.copy');

  el.exportBtn.disabled = exporting;
  el.exportBtn.textContent = sections > 1
    ? phrase('export.many', { n: sections })
    : phrase('export.one');
}

/* ------------------------------------------------------------------ export */

/**
 * Two or three whole sentences, run together.
 *
 * A space is how English separates them and is not how every language does, so
 * even this is a phrase. Joined one pair at a time, the way a list is.
 */
const sentences = (said) => said.reduce((a, b) => phrase('join.sentences', { a, b }));

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

  const percent = Math.round(fraction * 100);

  if (phase === 'preparing') {
    el.progressLabel.textContent = phrase('progress.preparing');
  } else if (phase === 'finishing') {
    el.progressLabel.textContent = phrase('progress.finishing');
  } else if (phase === 'sound') {
    el.progressLabel.textContent = phrase('progress.sound',
      { done: done + 1, total });
  } else if (phase === 'copying') {
    el.progressLabel.textContent = phrase('progress.copying', {
      done: done.toLocaleString(), total: total.toLocaleString(), percent,
    });
  } else if (realtime) {
    el.progressLabel.textContent = phrase('progress.realtime', {
      done: formatDuration(done), total: formatDuration(total), percent,
    });
  } else {
    el.progressLabel.textContent = phrase('progress.frame', {
      done: done.toLocaleString(), total: total.toLocaleString(), percent,
    });
  }
}

function outputFilename(extension) {
  const base = (clips[0]?.name ?? 'video').replace(/\.[^.]+$/, '');
  return `${base}-cut.${extension}`;
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
  const minutes = Math.floor(whole / 60);
  return minutes
    ? phrase('dur.minutes', { m: minutes, s: String(whole % 60).padStart(2, '0') })
    : phrase('dur.seconds', { s: seconds < 10 ? seconds.toFixed(1) : whole });
}

async function runExport() {
  if (exporting) return;

  const chosen = exportClips();
  if (!chosen.length) {
    showError(phrase(
      mode === 'cut' ? 'export.nothing.cut' : 'export.nothing.keep'));
    return;
  }

  clearError();
  exporting = true;
  abortController = new AbortController();

  el.exportBtn.disabled = true;
  el.cancelBtn.hidden = false;
  el.progress.hidden = false;
  el.result.hidden = true;
  timeline.setEnabled(false);
  el.preview.pause();
  setProgress({ phase: 'preparing', done: 0, total: 1 });

  const method = el.method.value;
  const quality = el.quality.value;
  const keepAudio = el.keepAudio.checked && !el.keepAudio.disabled;
  const onProgress = setProgress;
  const signal = abortController.signal;

  try {
    let result;
    if (method === 'copy') {
      result = await joinByCopy({ clips: chosen, keepAudio, onProgress, signal });
    } else if (method === 'exact') {
      const frame = chosen.length > 1
        ? outputFrame(chosen, el.frame.value)
        : outputFrame(chosen.slice(0, 1), 'first');
      const sound = joinability(chosen, { keepAudio, t: phrase }).sound;
      result = await joinExact({
        clips: chosen,
        frame,
        quality,
        audioMode: keepAudio ? sound : 'none',
        onProgress,
        signal,
      });
    } else {
      result = await trimByRecording({
        src: clips[0].objectUrl,
        range: chosen[0].ranges[0],
        size: clips[0].source,
        quality,
        keepAudio,
        fps: clips[0].fps,
        onProgress,
        signal,
      });
    }

    if (result.warning?.length) {
      showError(sentences(result.warning.map((key) => phrase(key))));
    }

    if (lastResultUrl) URL.revokeObjectURL(lastResultUrl);
    lastResultUrl = URL.createObjectURL(result.blob);

    const sections = chosen.reduce((total, entry) => total + entry.ranges.length, 0);
    el.resultVideo.src = lastResultUrl;
    el.download.href = lastResultUrl;
    el.download.download = outputFilename(result.extension);
    el.resultInfo.textContent = [
      result.extension.toUpperCase(),
      sections > 1 ? phrase('result.parts', { n: sections }) : null,
      formatDuration(chosen.reduce((total, entry) => total + totalSeconds(entry.ranges), 0)),
      formatBytes(result.blob.size),
      method === 'copy' ? phrase('result.notreencoded') : result.codec,
    ].filter(Boolean).join(' · ');
    el.result.hidden = false;
    el.progress.hidden = true;
    el.result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) {
    el.progress.hidden = true;
    if (error?.name !== 'AbortError') {
      showError(error?.message
        ? phrase(error.message, error.values)
        : phrase('error.generic'));
      console.error(error);
    }
  } finally {
    exporting = false;
    abortController = null;
    el.cancelBtn.hidden = true;
    el.exportBtn.disabled = false;
    timeline.setEnabled(true);
    renderSegments();
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

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
