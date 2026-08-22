/**
 * What it takes to put two clips into one file without re-encoding them.
 *
 * Joining is not concatenation. A track in an MP4 is described once, at the
 * front, by a sample entry - which codec, which profile, which resolution,
 * which parameter sets - and every sample in that track is decoded against it.
 * Two clips can therefore share a track only if they share that description,
 * byte for byte. Where they do, joining is the same trick trimming is: choose
 * the samples, write the tables, and the pictures are never touched.
 *
 * Where they do not, there is no honest way to avoid decoding. Nothing here
 * tries: the tool says so, names which clip disagrees and about what, and
 * offers the path that re-encodes.
 *
 * The checks are deliberately strict. A sample entry that differs by one byte
 * is a different SPS, and a player handed the wrong one does not fail - it
 * shows a smear of green blocks halfway through, which is a far worse outcome
 * than an honest refusal on the page in front of you.
 */

/** Byte-for-byte equality of two sample entries. */
function sameBytes(a, b) {
  if (!a || !b || a.byteLength !== b.byteLength) return false;
  for (let i = 0; i < a.byteLength; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/** How a clip is described in a message, so the reason names a real file. */
function nameOf(clip, index) {
  return clip.name || `clip ${index + 1}`;
}

/**
 * Whether these clips can share one video track.
 *
 * @param {object[]} clips  each with `media` (what demux() returned) and `name`
 * @returns {{ok: boolean, reason: string|null}}
 */
export function videoJoinable(clips) {
  if (!clips.length) return { ok: false, reason: 'there is nothing to join.' };

  const unread = clips.findIndex((clip) => !clip.media);
  if (unread >= 0) {
    return {
      ok: false,
      reason: `${nameOf(clips[unread], unread)} is not an MP4 this reader understands, `
        + 'so its frames cannot be copied.',
    };
  }

  const first = clips[0].media.video;
  for (let i = 1; i < clips.length; i++) {
    const video = clips[i].media.video;
    const name = nameOf(clips[i], i);

    // The size is checked before the entry, because "1920x1080 and 1280x720"
    // is a reason anybody can act on and "their sample entries differ" is not.
    if (video.displayWidth !== first.displayWidth || video.displayHeight !== first.displayHeight) {
      return {
        ok: false,
        reason: `${name} is ${video.displayWidth}x${video.displayHeight} and the first clip `
          + `is ${first.displayWidth}x${first.displayHeight}.`,
      };
    }
    if (video.rotation !== first.rotation) {
      return {
        ok: false,
        reason: `${name} is stored turned ${video.rotation} degrees and the first clip `
          + `${first.rotation ? `is turned ${first.rotation}` : 'is not turned'}.`,
      };
    }
    if (video.codec !== first.codec) {
      return {
        ok: false,
        reason: `${name} is ${video.codec} and the first clip is ${first.codec}.`,
      };
    }
    if (!sameBytes(video.sampleEntry, first.sampleEntry)) {
      return {
        ok: false,
        reason: `${name} is the same codec as the first clip but was encoded with different `
          + 'settings, so one description cannot cover both.',
      };
    }
  }

  return { ok: true, reason: null };
}

/**
 * Whether these clips can share one audio track.
 *
 * All or none: a join where one clip has sound and the next does not would run
 * silent for a stretch with nothing in the file to say why, and the fix - a
 * stretch of encoded silence - means encoding, which the copy path does not do.
 *
 * @returns {{ok: boolean, reason: string|null, present: boolean}}
 */
export function audioJoinable(clips) {
  if (!clips.length) return { ok: true, reason: null, present: false };
  if (clips.some((clip) => !clip.media)) {
    return { ok: false, reason: 'one of the clips could not be read.', present: false };
  }

  const withSound = clips.filter((clip) => clip.media.audio && clip.media.audio.samples.length);
  if (!withSound.length) return { ok: true, reason: null, present: false };

  if (withSound.length !== clips.length) {
    const silent = clips.findIndex(
      (clip) => !(clip.media.audio && clip.media.audio.samples.length));
    return {
      ok: false,
      reason: `${nameOf(clips[silent], silent)} has no sound and the others do, so a copy `
        + 'would go quiet partway through.',
      present: true,
    };
  }

  const first = clips[0].media.audio;
  for (let i = 1; i < clips.length; i++) {
    const audio = clips[i].media.audio;
    const name = nameOf(clips[i], i);

    if (Math.round(audio.sampleRate) !== Math.round(first.sampleRate)
      || audio.channels !== first.channels) {
      return {
        ok: false,
        reason: `${name} has ${audio.channels}-channel sound at `
          + `${Math.round(audio.sampleRate)} Hz and the first clip has ${first.channels}-channel `
          + `at ${Math.round(first.sampleRate)} Hz.`,
        present: true,
      };
    }
    if (!sameBytes(audio.sampleEntry, first.sampleEntry)) {
      return {
        ok: false,
        reason: `${name} has sound encoded differently from the first clip.`,
        present: true,
      };
    }
  }

  return { ok: true, reason: null, present: true };
}

/**
 * The whole question, answered once, in the terms the page needs to explain it.
 *
 * @param {object[]} clips
 * @param {{keepAudio: boolean}} options
 * @returns {{copy: boolean, reason: string|null, sound: 'copy'|'encode'|'none'}}
 *   `sound` is what would happen to the audio on the re-encoding path, which is
 *   not the same question: even there the samples are copied when every clip
 *   describes them the same way.
 */
export function joinability(clips, { keepAudio = true } = {}) {
  const video = videoJoinable(clips);
  const audio = audioJoinable(clips);

  let sound = 'none';
  if (keepAudio && audio.present) sound = audio.ok ? 'copy' : 'encode';

  if (!video.ok) return { copy: false, reason: video.reason, sound };
  if (keepAudio && !audio.ok) return { copy: false, reason: audio.reason, sound };

  return { copy: true, reason: null, sound };
}

/**
 * The frame the joined picture is drawn into, when it has to be drawn again.
 *
 * H.264 has no way to describe a frame with an odd number of pixels on a side,
 * so every answer here is even. Clips that are not this shape are fitted inside
 * it rather than stretched to it - see `drawFitted` in draw.js.
 */
export function outputFrame(clips, choice = 'first') {
  const sizes = clips
    .filter((clip) => clip.source && clip.source.width && clip.source.height)
    .map((clip) => ({ width: clip.source.width, height: clip.source.height }));

  if (!sizes.length) return { width: 640, height: 480 };

  const even = ({ width, height }) => ({
    width: Math.max(2, Math.floor(width / 2) * 2),
    height: Math.max(2, Math.floor(height / 2) * 2),
  });

  if (choice === '1080p') return { width: 1920, height: 1080 };
  if (choice === '720p') return { width: 1280, height: 720 };

  if (choice === 'largest') {
    return even(sizes.reduce(
      (best, size) => (size.width * size.height > best.width * best.height ? size : best)));
  }

  return even(sizes[0]);
}
