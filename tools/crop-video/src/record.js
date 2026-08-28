/**
 * The fallback path: play the file, draw each frame cropped onto a canvas, and
 * record the canvas.
 *
 * This is how the tool accepts formats it has no demuxer for. If the browser
 * can play it - WebM, an MKV it happens to know, an MP4 whose layout the reader
 * next door declined - it can be cropped here, because the only thing being
 * asked of the file is that it play.
 *
 * Two costs, both said on the page rather than buried:
 *   - It runs in real time. A four-minute clip takes four minutes.
 *   - The sound is re-encoded, because it arrives as playback rather than as
 *     the samples that were in the file. The exact path copies it untouched;
 *     this one cannot.
 *
 * It plays into its own hidden <video> element rather than the one on the page,
 * so the preview keeps working normally, and the sound is captured through a
 * Web Audio graph that is never connected to the speakers - a clip being
 * cropped does not suddenly play out loud.
 */

import { drawCropped } from './draw.js';
import { pickRecorderMimeType } from './support.js';

const QUALITY_BPP = { low: 0.05, medium: 0.1, high: 0.2 };

/** How long to wait for the hidden element to become playable. */
const LOAD_TIMEOUT = 20_000;

function aborted() {
  const error = new Error('Crop cancelled.');
  error.name = 'AbortError';
  return error;
}

/**
 * A <video> the size of a full stop, in the corner of the page.
 *
 * It has to be in the document and it has to be painted: a browser that never
 * composites the element never presents a frame, and the frame callback that
 * drives the recording never fires.
 */
function hiddenPlayer(src) {
  const video = document.createElement('video');
  video.src = src;
  video.className = 'recording-player';
  video.playsInline = true;
  video.preload = 'auto';
  document.body.append(video);
  return video;
}

function whenReady(video, signal) {
  return new Promise((resolve, reject) => {
    const done = (error) => {
      clearTimeout(timer);
      video.removeEventListener('canplay', ok);
      video.removeEventListener('error', bad);
      signal?.removeEventListener('abort', cancel);
      if (error) reject(error); else resolve();
    };
    const ok = () => done(null);
    const bad = () => done(new Error('record.noplay'));
    const cancel = () => done(aborted());

    const timer = setTimeout(() => done(new Error('record.slowopen')), LOAD_TIMEOUT);
    if (video.readyState >= 2) { done(null); return; }
    video.addEventListener('canplay', ok, { once: true });
    video.addEventListener('error', bad, { once: true });
    signal?.addEventListener('abort', cancel, { once: true });
  });
}

/**
 * @param {object} args
 * @param {string} args.src  an object URL for the chosen file
 * @param {{x: number, y: number, width: number, height: number}} args.crop
 *   in the coordinates of the played picture, which is already the right way up
 * @returns {Promise<{blob: Blob, extension: string, codec: string,
 *   warnings: string[]}>} `warnings` are phrase keys; the caller resolves
 *   them and decides how two sentences are joined.
 */
export async function cropByRecording({
  src, crop, quality = 'medium', keepAudio = true, fps = 30, onProgress, signal,
}) {
  const mimeType = pickRecorderMimeType();
  if (!mimeType) throw new Error('record.norecord');

  const canvas = document.createElement('canvas');
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d', { alpha: false });

  const video = hiddenPlayer(src);
  let audioContext = null;
  let audioMissing = false;
  let tracks = [];
  let recorder = null;

  const teardown = () => {
    video.pause();
    for (const track of tracks) track.stop();
    video.removeAttribute('src');
    video.load();
    video.remove();
    audioContext?.close().catch(() => {});
  };

  let wentHidden = document.hidden;
  const onVisibility = () => { if (document.hidden) wentHidden = true; };
  document.addEventListener('visibilitychange', onVisibility);

  try {
    onProgress?.({ phase: 'preparing', done: 0, total: 1 });
    await whenReady(video, signal);

    // captureStream(0) hands back a track that emits a frame only when asked,
    // so one drawn frame becomes exactly one recorded frame. Where that is
    // missing, a timed capture at the source frame rate is the next best thing.
    let stream = canvas.captureStream(0);
    let [videoTrack] = stream.getVideoTracks();
    const onDemand = typeof videoTrack.requestFrame === 'function';
    if (!onDemand) {
      stream = canvas.captureStream(Math.max(1, Math.round(fps)));
      [videoTrack] = stream.getVideoTracks();
    }
    tracks = [videoTrack];

    if (keepAudio) {
      try {
        audioContext = new (window.AudioContext ?? window.webkitAudioContext)();
        const destination = audioContext.createMediaStreamDestination();
        // Routing the element into the graph takes it off the speakers, which
        // is the point: this clip is being recorded, not played to the room.
        audioContext.createMediaElementSource(video).connect(destination);
        const [audioTrack] = destination.stream.getAudioTracks();
        if (audioTrack) tracks.push(audioTrack);
        else audioMissing = true;
      } catch {
        // No Web Audio here. Record the picture and say the sound was left out,
        // rather than failing the whole export over it.
        audioMissing = true;
        video.muted = true;
      }
    } else {
      video.muted = true;
    }

    const bitsPerPixel = QUALITY_BPP[quality] ?? QUALITY_BPP.medium;
    recorder = new MediaRecorder(new MediaStream(tracks), {
      mimeType,
      videoBitsPerSecond: Math.min(50_000_000,
        Math.round(crop.width * crop.height * fps * bitsPerPixel)),
    });

    const parts = [];
    recorder.ondataavailable = (event) => { if (event.data.size) parts.push(event.data); };
    const finished = new Promise((resolve, reject) => {
      recorder.onstop = resolve;
      recorder.onerror = (event) => reject(event.error ?? new Error('Recording failed.'));
    });

    const duration = Number.isFinite(video.duration) ? video.duration : 0;

    const draw = () => {
      drawCropped(ctx, video, {
        rotation: 0,       // a <video> has already turned the picture for us
        displayWidth: video.videoWidth,
        displayHeight: video.videoHeight,
        crop,
      });
      if (onDemand) videoTrack.requestFrame();
      onProgress?.({
        phase: 'recording', done: video.currentTime, total: duration, realtime: true,
      });
    };

    await audioContext?.resume().catch(() => {});
    draw();
    recorder.start();
    await video.play();

    await new Promise((resolve, reject) => {
      let settled = false;
      const done = (fn, value) => {
        if (settled) return;
        settled = true;
        clearInterval(ticker);
        video.removeEventListener('ended', onEnded);
        signal?.removeEventListener('abort', onAbort);
        fn(value);
      };

      const onEnded = () => done(resolve);
      const onAbort = () => done(reject, aborted());

      // requestVideoFrameCallback fires once per presented frame, which is
      // exactly the cadence wanted: every frame the browser decodes is drawn
      // once and recorded once.
      let presented = 0;
      let byCallback = typeof video.requestVideoFrameCallback === 'function';
      const pump = () => {
        if (settled) return;
        presented++;
        draw();
        if (video.ended) done(resolve);
        else if (byCallback) video.requestVideoFrameCallback(pump);
      };
      if (byCallback) video.requestVideoFrameCallback(pump);

      // The timer does three jobs: it draws where there is no frame callback;
      // it takes over if the callback turns out never to fire, which is what a
      // tab that is not being painted does; and it decides when playback is
      // over.
      //
      // That last one is not simply `ended`. A file whose header rounds its own
      // length - which is most of what MediaRecorder writes - can run its clock
      // to the last frame and stop there without ever firing the event, so a
      // clock that has stopped moving is treated as the end too. Nothing here
      // is being streamed, so there is no such thing as a legitimate stall.
      const interval = Math.max(10, 1000 / Math.max(1, fps));
      const startedAt = performance.now();
      let lastTime = -1;
      let stalled = 0;

      const ticker = setInterval(() => {
        if (settled) return;
        if (byCallback && presented === 0 && performance.now() - startedAt > 700) {
          byCallback = false;
        }
        if (!byCallback) draw();

        const now = video.currentTime;
        if (now === lastTime) stalled += interval;
        else { stalled = 0; lastTime = now; }

        const atEnd = Number.isFinite(video.duration) && video.duration > 0
          && now >= video.duration - 0.05;

        if (video.ended
          || (video.paused && now > 0)
          || (atEnd && stalled > 400)
          || stalled > 3000) done(resolve);
      }, interval);

      video.addEventListener('ended', onEnded);
      signal?.addEventListener('abort', onAbort);
    });

    recorder.stop();
    await finished;

    return {
      blob: new Blob(parts, { type: mimeType }),
      extension: mimeType.includes('webm') ? 'webm' : 'mp4',
      codec: mimeType,
      warnings: [
        wentHidden ? 'record.hidden' : null,
        audioMissing && keepAudio ? 'record.nosound' : null,
      ].filter(Boolean),
    };
  } catch (error) {
    if (recorder && recorder.state !== 'inactive') recorder.stop();
    throw error;
  } finally {
    document.removeEventListener('visibilitychange', onVisibility);
    teardown();
  }
}
