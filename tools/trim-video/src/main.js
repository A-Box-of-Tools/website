/** UI wiring and application state. */

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
import { keyframeTimes, keyframeBefore, rangesFor, totalSeconds } from './ranges.js';
import { hasWebCodecs, hasMediaRecorder, canDecode } from './support.js';

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
  exportHeading: $('export-heading'),
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

/**
 * The clips, in the order they will be joined.
 *
 * One of these is a trim, which is what this tool was before it could hold two.
 * Everything below treats that as the ordinary case of a list rather than as a
 * mode of its own, so there is no second code path to keep in step.
 *
 * @type {object[]}
 */
let clips = [];
/** Which clip the timeline and the preview are pointed at. */
let selected = -1;
/** Set while the timeline is being repointed, so the marks it emits on the way
 *  are not written back over the clip they came from. */
let restoring = false;

let exporting = false;
let abortController = null;
let lastResultUrl = null;
let nextId = 1;
/** Set while "Play the section" is running, so playback stops at the mark. */
let watchingSection = false;
/** Where the playhead is, in seconds. Read off the element where there is one,
 *  and kept here where there is not. */
let playAt = 0;

const timeline = new Timeline(el.timeline, {
  onChange: onRangeChanged,
  onSeek: seekTo,
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
  el.sectionCard.hidden = false;
  el.exportCard.hidden = false;
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
        ? error.reason
        : (error.message || 'the file could not be read as an MP4.');
    }

    // Copying needs nothing but the reader: no decoder, no encoder, no
    // WebCodecs. A browser that cannot re-encode a frame can still cut one of
    // these files without losing a thing.
    const canExact = Boolean(media) && hasWebCodecs()
      && await canDecode(decoderConfig(media.video));
    const canRecord = played.ok && hasMediaRecorder();

    if (!media && !canRecord) {
      showError(played.ok
        ? `${file.name} cannot be recorded by this browser, so it cannot be trimmed.`
        : `${file.name} could not be opened: ${fallbackReason ?? 'the format is not one this browser plays.'}`);
      URL.revokeObjectURL(objectUrl);
      return false;
    }

    const source = media
      ? { width: media.video.displayWidth, height: media.video.displayHeight }
      : { width: played.width, height: played.height };
    const duration = media ? Math.max(media.duration, played.duration) : played.duration;

    const entry = {
      id: nextId++,
      file,
      name: file.name,
      objectUrl,
      media,
      fallbackReason,
      playable: played.ok,
      source,
      duration,
      fps: media ? averageFps(media.video) : 30,
      start: 0,
      end: duration,
      mode: 'keep',
      canExact,
      canRecord,
      thumbnail: null,
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
    showError(`${file.name} could not be opened: ${error?.message ?? error}`);
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

/* -------------------------------------------------------------- the list */

function renderClips() {
  el.clipList.hidden = clips.length === 0;
  el.clipList.innerHTML = '';

  clips.forEach((entry, index) => {
    const row = document.createElement('li');
    row.className = `clip${index === selected ? ' selected' : ''}`;
    row.dataset.index = String(index);

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
    title.title = 'Mark this clip';
    title.addEventListener('click', () => selectClip(index));

    const kept = totalSeconds(rangesOf(entry));
    const facts = document.createElement('p');
    facts.className = 'clip-facts';
    facts.textContent = [
      `${entry.source.width} x ${entry.source.height}`,
      formatDuration(entry.duration),
      kept >= entry.duration - 0.005
        ? 'all of it'
        : `${formatDuration(kept)} kept`,
      entry.media
        ? (entry.media.audio ? 'with sound' : 'no sound')
        : 'recorded to trim',
    ].join(' · ');

    body.append(title, facts);

    const actions = document.createElement('div');
    actions.className = 'clip-actions';
    actions.append(
      button('↑', 'Move up', () => move(index, -1), index === 0),
      button('↓', 'Move down', () => move(index, 1), index === clips.length - 1),
      button('✕', 'Remove', () => remove(index), false, 'danger'),
    );

    row.append(shot, body, actions);
    el.clipList.append(row);
  });
}

function button(label, title, onClick, disabled = false, extra = '') {
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

function move(index, by) {
  const to = index + by;
  if (to < 0 || to >= clips.length) return;
  const [moved] = clips.splice(index, 1);
  clips.splice(to, 0, moved);
  if (selected === index) selected = to;
  else if (selected === to) selected = index;
  renderClips();
  updateMethodOptions();
}

function remove(index) {
  const [gone] = clips.splice(index, 1);
  URL.revokeObjectURL(gone.objectUrl);

  if (!clips.length) {
    selected = -1;
    el.sectionCard.hidden = true;
    el.exportCard.hidden = true;
    el.preview.removeAttribute('src');
    el.preview.load();
    renderClips();
    return;
  }

  if (selected >= clips.length) selected = clips.length - 1;
  selectClip(Math.max(0, selected === index ? Math.min(index, clips.length - 1) : selected));
  renderClips();
  updateMethodOptions();
}

/* -------------------------------------------------------- the chosen clip */

/** Which clip the timeline is pointed at, said out loud once there are two. */
function describeSelection() {
  const entry = clip();
  el.editing.hidden = clips.length < 2 || !entry;
  if (entry) el.editing.textContent = `${entry.name} — ${selected + 1} of ${clips.length}`;
}

function selectClip(index) {
  if (index < 0 || index >= clips.length) return;
  selected = index;
  const entry = clips[index];

  describeSelection();

  restoring = true;
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
    el.stageNote.textContent = 'This browser will not play this clip, so the frames below are '
      + 'decoded one at a time to show you where the marks are. The trim itself is unaffected.';
    drawStill(entry, 0);
  }

  el.stage.style.aspectRatio = `${entry.source.width} / ${entry.source.height}`;
  // Height is capped through the width, so the stage keeps the clip's exact
  // shape - see the note on .stage in styles.css.
  el.stage.style.maxWidth = `calc(52vh * ${entry.source.width / entry.source.height})`;

  timeline.setSource({
    duration: entry.duration,
    keyframes: entry.media ? keyframeTimes(entry.media.video) : null,
    frameTimes: entry.media ? frameTimesOf(entry.media.video) : null,
  });
  // Not snapped: these marks were snapped when they were set, and putting the
  // end of a whole clip through the snapper again lands it on the last frame's
  // start time - which is one frame short of the end of the clip.
  timeline.setRange({ start: entry.start, end: entry.end }, { snap: false });
  timeline.setMode(entry.mode);
  restoring = false;

  document.querySelector(`input[name="mode"][value="${entry.mode}"]`).checked = true;
  playAt = 0;
  timeline.setPlayhead(0);
  el.tlTotal.textContent = formatTime(entry.duration);
  el.tlNow.textContent = formatTime(0);

  el.pathNote.hidden = Boolean(entry.media);
  if (!entry.media) {
    el.pathNote.textContent = `${entry.name} is trimmed by playing it and recording the `
      + `result, because ${entry.fallbackReason ?? 'its layout is not one the reader here understands.'} `
      + 'That takes as long as the section is long, everything is re-encoded rather than '
      + 'copied, and it cannot be joined with anything else.';
  }

  onRangeChanged(timeline.range);
  renderClips();
}

/** Every frame's presentation time, in seconds and in order. */
function frameTimesOf(video) {
  const times = video.samples.map((sample) => sample.pts / video.timescale);
  times.sort((a, b) => a - b);
  return times;
}

function setTransportEnabled(enabled) {
  for (const control of [el.play, el.playSection, el.goStart, el.goEnd]) {
    control.disabled = !enabled;
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
    el.stageNote.textContent = 'This browser will not play this clip and no frame could be '
      + `decoded from it either (${error.message}). The marks below still work on its length.`;
  } finally {
    stillBusy = false;
  }
}

/* ------------------------------------------------------------ the playhead */

function seekTo(seconds) {
  const entry = clip();
  if (!entry) return;
  const at = Math.max(0, Math.min(seconds, entry.duration));
  watchingSection = false;
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

  if (watchingSection && at >= timeline.range.end) {
    el.preview.pause();
    watchingSection = false;
  }
});

el.preview.addEventListener('play', () => { el.play.textContent = 'Pause'; });
el.preview.addEventListener('pause', () => { el.play.textContent = 'Play'; });

function togglePlay() {
  if (!clip()?.playable) return;
  watchingSection = false;
  if (el.preview.paused) el.preview.play().catch(() => {});
  else el.preview.pause();
}

el.play.addEventListener('click', togglePlay);

el.playSection.addEventListener('click', () => {
  if (!clip()?.playable) return;
  el.preview.currentTime = timeline.range.start;
  watchingSection = true;
  el.preview.play().catch(() => {});
});

el.goStart.addEventListener('click', () => seekTo(timeline.range.start));
el.goEnd.addEventListener('click', () => seekTo(timeline.range.end));

/* ---------------------------------------------------------------- the marks */

function onRangeChanged({ start, end }) {
  const entry = clip();
  if (entry && !restoring) {
    entry.start = start;
    entry.end = end;
  }

  // Not while the field is being typed in: rewriting it under the cursor is
  // how a half-typed "1:0" becomes "1:00.000" before the rest arrives.
  if (document.activeElement !== el.markStart) el.markStart.value = formatTime(start);
  if (document.activeElement !== el.markEnd) el.markEnd.value = formatTime(end);
  el.markLength.textContent = formatDuration(Math.max(0, end - start));

  if (!restoring) {
    renderClips();
    updateSummary();
  }
}

el.setStart.addEventListener('click', () => timeline.setRange({ start: currentTime() }));
el.setEnd.addEventListener('click', () => timeline.setRange({ end: currentTime() }));

el.markAll.addEventListener('click', () => {
  const entry = clip();
  if (!entry) return;
  timeline.setRange({ start: 0, end: entry.duration });
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
    const entry = clip();
    if (!entry) return;
    entry.mode = radio.value;
    timeline.setMode(radio.value);
    renderClips();
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

/** The sections of one clip its marks and mode come down to. */
function rangesOf(entry) {
  return rangesFor({
    mode: entry.mode, start: entry.start, end: entry.end, duration: entry.duration,
  });
}

/** The clips, in order, as the export functions want them. */
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

function updateMethodOptions() {
  const chosen = exportClips();
  const keepAudio = el.keepAudio.checked;
  const join = chosen.length ? joinability(chosen, { keepAudio }) : { copy: false, reason: null, sound: 'none' };

  const everyDemuxed = chosen.length > 0 && chosen.every((entry) => entry.media);
  const canCopy = everyDemuxed && join.copy;
  const canExact = clips.length > 0 && clips.every((entry) => entry.canExact) && chosen.length > 0;
  // A recording is made in one pass from one playhead: it can keep one section
  // of one clip and nothing else.
  const canRecord = clips.length === 1 && clips[0].canRecord && clips[0].mode === 'keep';

  el.method.querySelector('option[value="copy"]').disabled = !canCopy;
  el.method.querySelector('option[value="exact"]').disabled = !canExact;
  el.method.querySelector('option[value="record"]').disabled = !canRecord;

  const available = [
    canCopy ? 'copy' : null,
    canExact ? 'exact' : null,
    canRecord ? 'record' : null,
  ].filter(Boolean);
  if (!available.includes(el.method.value)) el.method.value = available[0] ?? 'copy';

  // Why the quick path is unavailable, said once, in the terms that let
  // somebody act on it - which usually means reordering or dropping a clip.
  el.joinNote.hidden = clips.length < 2 || canCopy || !join.reason;
  if (!el.joinNote.hidden) {
    el.joinNote.textContent = `These clips cannot be joined without re-encoding: ${join.reason} `
      + 'One track carries one description of what is in it, so clips that disagree have to be '
      + 'written out again to share one.';
  }

  // Taking a piece out of the middle needs a path that can write two sections
  // into one file, and only the two MP4 paths can.
  const removeRadio = document.querySelector('input[name="mode"][value="remove"]');
  removeRadio.disabled = !(clip()?.media);

  el.exportHeading.textContent = clips.length > 1 ? 'Join them' : 'Trim it';
  updateMethodNote();
}

function updateMethodNote() {
  const method = el.method.value;
  const many = exportClips().length > 1;

  if (method === 'copy') {
    el.methodNote.textContent = many
      ? 'The frames of every clip are moved into the new file exactly as they are, one clip '
        + 'after another. Nothing is decoded and nothing is encoded.'
      : 'The frames are moved into the new file exactly as they are, so nothing is decoded '
        + 'and nothing is encoded. Quick, and it cannot cost quality. The cut starts at the '
        + 'nearest keyframe before your mark.';
  } else if (method === 'exact') {
    el.methodNote.textContent = many
      ? 'Every clip is decoded and written out again into one stream, so clips that disagree '
        + 'about size or codec can still be joined. The sound is copied where the clips agree '
        + 'about it and re-encoded where they do not.'
      : 'Starts on the frame you chose, by decoding from the keyframe in front of it and '
        + 'encoding the picture again. The sound is still copied rather than re-encoded.';
  } else {
    el.methodNote.textContent = 'Plays the section through and records it, so it takes as '
      + 'long as the section is long and everything is re-encoded. Keep this tab in front '
      + 'while it runs.';
  }

  el.qualityField.hidden = method === 'copy';
  el.frameField.hidden = !(method === 'exact' && many);

  const chosen = exportClips();
  const anySound = chosen.some((entry) => entry.media?.audio?.samples.length)
    || clips.some((entry) => !entry.media);
  const sound = joinability(chosen, { keepAudio: el.keepAudio.checked }).sound;

  if (!anySound) {
    el.audioNote.textContent = 'None of these clips has an audio track, so there is nothing '
      + 'to keep.';
  } else if (method === 'record') {
    el.audioNote.textContent = 'Captured from playback and re-encoded, because that is all '
      + 'a recording can do.';
  } else if (sound === 'encode' && method === 'exact') {
    el.audioNote.textContent = 'These clips describe their sound differently, so it is decoded '
      + 'and encoded once for the whole join. That is the only case in this tool where the '
      + 'sound is not carried across untouched.';
  } else {
    el.audioNote.textContent = 'Copied from the file sample by sample, without ever being '
      + 'decoded, so it loses nothing.';
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
    return;
  }

  const method = el.method.value;
  const keepAudio = el.keepAudio.checked && !el.keepAudio.disabled;
  const kept = chosen.reduce((total, entry) => total + totalSeconds(entry.ranges), 0);
  const sections = chosen.reduce((total, entry) => total + entry.ranges.length, 0);

  el.sumClips.textContent = chosen.length === 1
    ? (sections === 1 ? 'one section of one clip' : `${sections} sections of one clip`)
    : `${chosen.length} clips, ${sections} section${sections === 1 ? '' : 's'}`;
  el.sumLength.textContent = formatDuration(kept);

  // Where the result will begin, which is the one number a copy can surprise
  // you with.
  const first = chosen[0];
  if (method === 'copy' && first.media) {
    const behind = keyframeBefore(first.media.video, first.ranges[0].start);
    const preRoll = Math.max(0, first.ranges[0].start - behind);
    el.sumStart.textContent = preRoll < 0.001
      ? 'exactly where you marked (it is on a keyframe)'
      : 'exactly where you marked, through an edit mark';
    el.cutNote.hidden = preRoll < 0.001;
    if (preRoll >= 0.001) {
      el.cutNote.textContent = 'The nearest keyframe before your first mark is '
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
  el.sumSize.textContent = bytes ? `about ${formatBytes(bytes)}` : '—';

  if (method === 'copy') {
    el.sumPicture.textContent = 'copied, frame for frame';
  } else if (method === 'exact') {
    const bars = chosen.filter((entry) => !fittedBox({
      displayWidth: entry.source.width, displayHeight: entry.source.height, frame,
    }).fits).length;
    el.sumPicture.textContent = `re-encoded to H.264, ${frame.width} x ${frame.height}`
      + (bars ? ` (${bars} clip${bars === 1 ? '' : 's'} fitted with bars)` : '');
  } else {
    el.sumPicture.textContent = 'recorded as it plays';
  }

  const sound = joinability(chosen, { keepAudio: true }).sound;
  if (sound === 'none') el.sumSound.textContent = 'none in these clips';
  else if (!keepAudio) el.sumSound.textContent = 'left out';
  else if (method === 'record') el.sumSound.textContent = 're-encoded from playback';
  else if (sound === 'encode' && method === 'exact') el.sumSound.textContent = 'decoded and re-encoded once';
  else el.sumSound.textContent = 'copied, sample for sample';

  el.exportBtn.disabled = exporting;
  el.exportBtn.textContent = chosen.length > 1
    ? 'Join the clips'
    : (clips[0]?.mode === 'remove' ? 'Cut the section out' : 'Trim video');
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
  } else if (phase === 'sound') {
    el.progressLabel.textContent = `Encoding the sound - clip ${done + 1} of ${total}`;
  } else if (phase === 'copying') {
    el.progressLabel.textContent = `Copying sample ${done.toLocaleString()} `
      + `of ${total.toLocaleString()} (${Math.round(fraction * 100)}%)`;
  } else if (realtime) {
    el.progressLabel.textContent = 'Recording in real time - '
      + `${formatDuration(done)} of ${formatDuration(total)} (${Math.round(fraction * 100)}%)`;
  } else {
    el.progressLabel.textContent = `Frame ${done.toLocaleString()} `
      + `of ${total.toLocaleString()} (${Math.round(fraction * 100)}%)`;
  }
}

function outputFilename(extension) {
  const base = (clips[0]?.name ?? 'video').replace(/\.[^.]+$/, '');
  return `${base}-${clips.length > 1 ? 'joined' : 'trimmed'}.${extension}`;
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
  if (exporting) return;

  const chosen = exportClips();
  if (!chosen.length) {
    showError('There is nothing selected to keep. Drag the marks further apart, or add a clip.');
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
  renderClips();
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
      const sound = joinability(chosen, { keepAudio }).sound;
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

    if (result.warning) showError(result.warning);

    if (lastResultUrl) URL.revokeObjectURL(lastResultUrl);
    lastResultUrl = URL.createObjectURL(result.blob);

    el.resultVideo.src = lastResultUrl;
    el.download.href = lastResultUrl;
    el.download.download = outputFilename(result.extension);
    el.resultInfo.textContent = [
      result.extension.toUpperCase(),
      chosen.length > 1 ? `${chosen.length} clips` : null,
      formatDuration(chosen.reduce((total, entry) => total + totalSeconds(entry.ranges), 0)),
      formatBytes(result.blob.size),
      method === 'copy' ? 'not re-encoded' : result.codec,
    ].filter(Boolean).join(' · ');
    el.result.hidden = false;
    el.progressWrap.hidden = true;
    el.result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) {
    el.progressWrap.hidden = true;
    if (error?.name !== 'AbortError') {
      showError(error?.message || 'Something went wrong.');
      console.error(error);
    }
  } finally {
    exporting = false;
    abortController = null;
    el.cancelBtn.hidden = true;
    el.exportBtn.disabled = false;
    timeline.setEnabled(true);
    renderClips();
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
      ? `your videos have gone nowhere. ${total} files loaded.${platformNote}`
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
