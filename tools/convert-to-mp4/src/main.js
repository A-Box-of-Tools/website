/**
 * UI wiring and application state.
 *
 * The shape of this file follows from what people arrive here with: a file
 * something refused - a WebM off a screen recorder, an MKV off a ripper, a
 * MOV off a camera - and the wish for the one file everything takes, which
 * is H.264 and AAC in an MP4. So the page reads the file, says which of its
 * two tracks can be copied as they are and which will have to be encoded
 * again, does exactly that, and opens the result again here to check it is
 * the length it was and is what it promised to be.
 */

import { ltr, phrase } from './shared/phrases.js';
import { messageBox } from './shared/message-box.js';
import { wireFilePicker, readingLabel } from './shared/file-picker.js';
import { sizeText, durationText } from './shared/format.js';
import { demux, UnsupportedFile } from './shared/mp4-reader.js';
import { demuxMatroska, isMatroska } from './shared/mkv-reader.js';
import { hasWebCodecs, hasEncoder, canDecode } from './shared/video-support.js';
import { averageFps, decoderConfig } from './shared/webcodecs.js';
import { convert } from './convert.js';
import { canDecodeSound, canEncodeAac } from './sound.js';
import {
  containerOf, describeSound, isH264, outputFrame, pictureBitrate, pictureJob, soundJob,
} from './plan.js';
import { bitrateText, codecText, containerText, frameText, outName } from './format.js';
import { makeExample } from './example.js';

const $ = (id) => document.getElementById(id);

const el = {
  dropzone: $('dropzone'),
  fileInput: $('file-input'),
  fileRow: $('file-row'),
  fileName: $('file-name'),
  fileFacts: $('file-facts'),
  clearFile: $('clear-file'),
  loadError: $('load-error'),
  loadNote: $('load-note'),
  planPicture: $('plan-picture'),
  planSound: $('plan-sound'),
  planNote: $('plan-note'),
  dropAudio: $('drop-audio'),
  runCard: $('run-card'),
  run: $('run'),
  cancel: $('cancel'),
  progress: $('progress'),
  progressBar: $('progress-bar'),
  progressLabel: $('progress-label'),
  runError: $('run-error'),
  result: $('result'),
  resultSize: $('result-size'),
  resultSub: $('result-sub'),
  download: $('download'),
  player: $('player'),
  checkLine: $('check-line'),
  resultFacts: $('result-facts'),
  privacyToggle: $('privacy-toggle'),
  privacyPanel: $('privacy-panel'),
};

const { show: showLoadError } = messageBox(el.loadError);
const { show: note } = messageBox(el.loadNote);

/**
 * @typedef {object} Loaded
 * @property {File} file
 * @property {{video: object, audio: object|null, duration: number}} media
 * @property {string} container
 * @property {object|null} sound  describeSound() of the audio track
 * @property {boolean} pictureDecodable
 * @property {boolean} soundDecodable
 * @property {number} fps
 * @property {number} sourceBitrate  what the picture spent, bits a second
 */

/** @type {Loaded|null} */
let loaded = null;
let downloadUrl = '';
let running = null;

/* ------------------------------------------------------------------ loading */

const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles(files) {
    load(files[0]);
  },
  example: makeExample,
});

async function load(file) {
  if (!file || running) return;

  reset();
  picker.busy(readingLabel(1));

  try {
    const matroska = await isMatroska(file);
    const media = matroska ? await demuxMatroska(file) : await demux(file);
    const { video, audio } = media;
    const container = containerOf(file.name, matroska);
    const sound = describeSound(audio);

    // Whether each track's encode path is open is a question for the
    // browser, asked once here so the plan can be spoken before the button.
    const codecs = hasWebCodecs();
    const pictureDecodable = isH264(video.codec)
      || (codecs && await canDecode(decoderConfig(video)));
    const soundDecodable = Boolean(sound && !sound.copyable && sound.codec)
      && codecs && await canDecodeSound(sound)
      && await canEncodeAac({ sampleRate: Math.round(sound.sampleRate), channels: Math.min(2, sound.channels) });

    const videoBytes = video.samples.reduce((sum, s) => sum + s.size, 0);
    loaded = {
      file,
      media,
      container,
      sound,
      pictureDecodable,
      soundDecodable,
      fps: averageFps(video),
      sourceBitrate: videoBytes * 8 / Math.max(0.1, media.duration),
    };

    el.fileName.textContent = file.name;
    el.fileFacts.textContent = phrase('file.facts', {
      size: size(file.size),
      length: durationText(media.duration, phrase),
      frame: say(frameText({ width: video.displayWidth, height: video.displayHeight })),
      container: say(containerText(container)),
    });
    el.fileRow.hidden = false;

    if (sound && !sound.copyable && !soundDecodable) {
      el.dropAudio.checked = true;
      el.dropAudio.disabled = true;
    } else if (!sound) {
      el.dropAudio.checked = false;
      el.dropAudio.disabled = true;
    } else {
      el.dropAudio.disabled = false;
    }

    refresh();
  } catch (error) {
    showLoadError(messageFor(error));
    picker.waiting();
  } finally {
    picker.done();
  }
}

/* --------------------------------------------------------------- the plan */

el.dropAudio.addEventListener('change', refresh);

/**
 * What will happen to each track, worked out from the file and the one
 * checkbox, or null while there is nothing loaded or the picture cannot be
 * had at all.
 */
function planned() {
  if (!loaded) return null;
  const { media, sound, pictureDecodable, soundDecodable, fps, sourceBitrate } = loaded;
  const { video } = media;
  const picture = pictureJob(video);
  if (picture === 'encode' && !pictureDecodable) return null;
  if (picture === 'encode' && !hasEncoder()) return null;

  let soundPlan = soundJob(sound, { decodable: soundDecodable });
  if (el.dropAudio.checked && soundPlan !== 'none') soundPlan = 'dropped';

  const frame = outputFrame(video);
  const bitrate = pictureBitrate({
    width: frame.width, height: frame.height, fps, codec: video.codec, sourceBitrate,
  });
  return { picture, sound: soundPlan, frame, bitrate, fps };
}

/**
 * Say what will happen, and wake or dim the last card.
 *
 * Two sentences, one a track: copied as it is, or encoded again and at
 * what, or left out and why. The visitor reads them before pressing
 * anything, which is the point of working it out first.
 */
function refresh() {
  if (!loaded) {
    el.planPicture.textContent = phrase('plan.nofile');
    el.planSound.textContent = '';
    el.planNote.hidden = true;
    gate(false);
    return;
  }

  const { media, sound, container, pictureDecodable } = loaded;
  const { video } = media;
  const plan = planned();

  if (!plan) {
    el.planPicture.textContent = phrase(
      pictureDecodable ? 'support.nowebcodecs' : 'plan.picture.nodecode',
      { codec: say(codecText(video.codec, video.entryType)) },
    );
    el.planSound.textContent = '';
    el.planNote.hidden = true;
    gate(false);
    return;
  }

  el.planPicture.textContent = plan.picture === 'copy'
    ? phrase('plan.picture.copy', { codec: say(codecText(video.codec)) })
    : phrase('plan.picture.encode', {
      codec: say(codecText(video.codec, video.entryType)),
      rate: say(bitrateText(plan.bitrate)),
      frame: say(frameText(plan.frame)),
    });

  const soundName = sound ? say(codecText(sound.codec, sound.name)) : '';
  el.planSound.textContent = {
    none: () => phrase('plan.sound.none'),
    copy: () => phrase('plan.sound.copy'),
    encode: () => phrase('plan.sound.encode', { codec: soundName }),
    unknown: () => phrase('plan.sound.unknown', { codec: soundName }),
    dropped: () => phrase('plan.sound.dropped'),
  }[plan.sound]();

  // A file that needs nothing done to it is still written again, and the
  // page says why that is not nothing.
  const already = plan.picture === 'copy' && (plan.sound === 'copy' || plan.sound === 'none');
  el.planNote.textContent = phrase(already ? 'plan.already' : 'plan.reencoded', {
    container: say(containerText(container)),
  });
  el.planNote.hidden = false;

  gate(true);
}

/**
 * Dim the last card until there is something to do, and say why.
 *
 * The picker wakes every inert card the moment a file arrives, which is
 * early for this one: a picture the browser will not decode has nowhere
 * to go. So this card is managed here, with the same line the frame draws
 * and a sentence of this tool's own. It is the only card that waits.
 */
function gate(ready) {
  const line = el.runCard.querySelector('.card-waiting');
  if (ready) {
    el.runCard.removeAttribute('inert');
    line?.remove();
    return;
  }
  el.runCard.setAttribute('inert', '');
  if (!line) {
    const waiting = document.createElement('p');
    waiting.className = 'card-waiting';
    waiting.textContent = phrase('waiting.file');
    el.runCard.querySelector('h2').after(waiting);
  }
}

/* ----------------------------------------------------------------- running */

el.run.addEventListener('click', run);
el.cancel.addEventListener('click', () => running?.abort());
el.clearFile.addEventListener('click', () => {
  reset();
  picker.waiting();
});

async function run() {
  const plan = planned();
  if (!plan || running) return;

  running = new AbortController();
  el.run.disabled = true;
  el.cancel.hidden = false;
  el.result.hidden = true;
  el.runError.hidden = true;
  el.progress.hidden = false;
  releaseDownload();

  let cancelled = false;
  const started = performance.now();

  try {
    const { file, media, sound } = loaded;
    const jobs = {
      picture: plan.picture,
      sound: plan.sound === 'copy' || plan.sound === 'encode' ? plan.sound : 'none',
    };

    const out = await convert({
      file,
      media,
      sound,
      jobs,
      frame: plan.frame,
      bitrate: plan.bitrate,
      fps: plan.fps,
      signal: running.signal,
      onProgress: setProgress,
    });

    setProgress({ phase: 'checking', done: 1, total: 1 });
    const check = await verify(out.blob, media.duration, jobs.sound !== 'none');

    showResult({ out, check, plan, jobs, seconds: (performance.now() - started) / 1000 });
  } catch (error) {
    if (error?.name === 'AbortError' || error?.message === 'aborted') {
      cancelled = true;
      el.progressLabel.textContent = phrase('run.cancelled');
    } else {
      el.runError.textContent = messageFor(error);
      el.runError.hidden = false;
    }
  } finally {
    running = null;
    el.run.disabled = false;
    el.cancel.hidden = true;
    el.progress.hidden = !cancelled;
    if (cancelled) el.progressBar.style.width = '0%';
  }
}

/**
 * Open the finished file again, here, and hold it to three things: that it
 * is as long as the original, that its picture is H.264, and that it has
 * the sound it was meant to have.
 *
 * The length is the claim that matters. A converter that dropped the last
 * second, or the sound, would still be an MP4, and nothing but reading the
 * result back can tell the difference.
 */
async function verify(blob, expectedSeconds, expectSound) {
  let again;
  try {
    again = await demux(new File([blob], 'check.mp4', { type: 'video/mp4' }));
  } catch (error) {
    return { ok: false, text: { key: 'check.reopen', values: { detail: messageFor(error) } } };
  }

  const drift = Math.abs(again.duration - expectedSeconds);
  if (drift > Math.max(0.25, expectedSeconds * 0.02)) {
    return {
      ok: false,
      text: {
        key: 'check.length',
        values: { got: durationText(again.duration, phrase), want: durationText(expectedSeconds, phrase) },
      },
    };
  }
  if (!isH264(again.video.codec)) {
    return { ok: false, text: { key: 'check.codec', values: { codec: again.video.codec } } };
  }
  if (expectSound && !again.audio?.samples.length) {
    return { ok: false, text: { key: 'check.sound' } };
  }

  return {
    ok: true,
    text: {
      key: 'check.ok',
      values: {
        length: durationText(again.duration, phrase),
        sound: phrase(again.audio?.samples.length ? 'check.sound.aac' : 'check.sound.none'),
      },
    },
  };
}

function showResult({ out, check, plan, jobs, seconds }) {
  const { file, media, container, fps } = loaded;
  const { video } = media;

  el.resultSize.textContent = phrase('result.ready', {
    size: size(out.blob.size), from: size(file.size), container: say(containerText(container)),
  });
  el.resultSub.textContent = phrase('result.sub');

  el.checkLine.textContent = phrase(check.ok ? 'check.passed' : 'check.failed', { found: say(check.text) });
  el.checkLine.className = `check-line ${check.ok ? 'good' : 'bad'}`;

  const facts = [
    plan.picture === 'copy'
      ? phrase('facts.picture.copied', {
        codec: say(codecText(video.codec)),
        frame: say(frameText({ width: video.displayWidth, height: video.displayHeight })),
      })
      : phrase('facts.picture.encoded', {
        from: say(codecText(video.codec, video.entryType)),
        rate: say(bitrateText(plan.bitrate)),
        frame: say(frameText(plan.frame)),
        fps: Math.round(fps),
      }),
    phrase({ copy: 'facts.sound.copied', encode: 'facts.sound.encoded', none: 'facts.sound.none' }[jobs.sound]),
    phrase('facts.time', { seconds: durationText(seconds, phrase), frames: out.frames }),
  ];
  el.resultFacts.replaceChildren(...facts.map((text) => {
    const row = document.createElement('li');
    row.textContent = text;
    return row;
  }));

  downloadUrl = URL.createObjectURL(out.blob);
  el.download.href = downloadUrl;
  el.download.download = outName(file.name);
  el.download.hidden = !check.ok;

  // The result played from memory, so "did it survive" is a thing that can
  // be looked at rather than inferred from a number.
  el.player.src = downloadUrl;
  el.player.hidden = !check.ok;

  el.result.hidden = false;
}

/* ---------------------------------------------------------------- progress */

function setProgress({ phase, done, total }) {
  const fraction = total > 0 ? Math.min(1, done / total) : 0;
  el.progressBar.style.width = `${(fraction * 100).toFixed(1)}%`;
  const percent = Math.round(fraction * 100);

  let text = '';
  if (phase === 'sound') {
    text = phrase('progress.sound', { done: done.toLocaleString(), total: total.toLocaleString() });
  } else if (phase === 'preparing') {
    text = phrase('progress.preparing');
  } else if (phase === 'encoding') {
    text = phrase('progress.frame', {
      done: done.toLocaleString(), total: total.toLocaleString(), percent,
    });
  } else if (phase === 'finishing') {
    text = phrase('progress.finishing');
  } else if (phase === 'writing') {
    text = phrase('progress.writing');
  } else if (phase === 'checking') {
    text = phrase('progress.checking');
  }
  if (text) el.progressLabel.textContent = text;
}

/* ------------------------------------------------------------------ scraps */

/** A size, marked as reading left to right, for the reason in the trimmer. */
const size = (n) => ltr(sizeText(n, phrase, { kb: 0, mb: 1, gb: 'size.gb' }));

/** A {key, values} pair from format.js, as words. A plain string passes through. */
const say = (said) => (said && said.key ? phrase(said.key, said.values) : said ?? '');

function messageFor(error) {
  if (error instanceof UnsupportedFile) return phrase(error.message, error.values);
  if (error?.name === 'AbortError') return phrase('run.cancelled');
  const key = String(error?.message ?? '');
  if (/^(support|stall|encode|decode|read|sound|write)\./.test(key)) return phrase(key, error.values);
  return phrase('run.failed', { detail: key || String(error) });
}

function reset() {
  loaded = null;
  el.fileRow.hidden = true;
  el.result.hidden = true;
  el.progress.hidden = true;
  el.loadError.hidden = true;
  el.loadNote.hidden = true;
  el.runError.hidden = true;
  el.dropAudio.disabled = false;
  el.dropAudio.checked = false;
  releaseDownload();
  refresh();
}

function releaseDownload() {
  if (downloadUrl) URL.revokeObjectURL(downloadUrl);
  downloadUrl = '';
  el.download.removeAttribute('href');
  el.player.removeAttribute('src');
  el.player.hidden = true;
}

/* ------------------------------------------------------------------- trust */

el.privacyToggle.addEventListener('click', () => {
  const open = el.privacyPanel.hidden;
  el.privacyPanel.hidden = !open;
  el.privacyToggle.setAttribute('aria-expanded', String(open));
});

/* -------------------------------------------------------------------- boot */

window.addEventListener('error', (event) => {
  showLoadError(phrase('error.broke', { detail: event.message }));
});
window.addEventListener('unhandledrejection', (event) => {
  showLoadError(phrase('error.broke', { detail: event.reason?.message ?? event.reason }));
});

refresh();

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
