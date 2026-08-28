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

/**
 * How a clip is described in a message, so the reason names a real file.
 *
 * A file with no name falls back to a phrase rather than to "clip 3",
 * which is two English words. The caller resolves it along with the
 * sentence it ends up inside.
 */
function nameOf(clip, index, t) {
  return clip.name || t('clip.nth', { n: index + 1 });
}

/**
 * Whether these clips can share one video track.
 *
 * @param {object[]} clips  each with `media` (what demux() returned) and `name`
 * @returns {{ok: boolean, reason: string|null}}
 */
export function videoJoinable(clips, t) {
  if (!clips.length) return { ok: false, reason: t('join.nothing') };

  const unread = clips.findIndex((clip) => !clip.media);
  if (unread >= 0) {
    return {
      ok: false,
      reason: t('join.unread', { name: nameOf(clips[unread], unread, t) }),
    };
  }

  const first = clips[0].media.video;
  for (let i = 1; i < clips.length; i++) {
    const video = clips[i].media.video;
    const name = nameOf(clips[i], i, t);

    // The size is checked before the entry, because "1920x1080 and 1280x720"
    // is a reason anybody can act on and "their sample entries differ" is not.
    if (video.displayWidth !== first.displayWidth || video.displayHeight !== first.displayHeight) {
      return {
        ok: false,
        reason: t('join.size', {
          name,
          size: `${video.displayWidth}x${video.displayHeight}`,
          first: `${first.displayWidth}x${first.displayHeight}`,
        }),
      };
    }
    if (video.rotation !== first.rotation) {
      // Two whole sentences rather than one with a clause spliced into
      // it: "is turned 90" against "is not turned" is a verb and its
      // negation, and those are not one shape in every language.
      return {
        ok: false,
        reason: t(first.rotation ? 'join.rotated' : 'join.rotated.none',
          { name, degrees: video.rotation, first: first.rotation }),
      };
    }
    if (video.codec !== first.codec) {
      return {
        ok: false,
        reason: t('join.codec', { name, codec: video.codec, first: first.codec }),
      };
    }
    if (!sameBytes(video.sampleEntry, first.sampleEntry)) {
      return { ok: false, reason: t('join.settings', { name }) };
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
export function audioJoinable(clips, t) {
  if (!clips.length) return { ok: true, reason: null, present: false };
  if (clips.some((clip) => !clip.media)) {
    return { ok: false, reason: t('join.unreadable'), present: false };
  }

  const withSound = clips.filter((clip) => clip.media.audio && clip.media.audio.samples.length);
  if (!withSound.length) return { ok: true, reason: null, present: false };

  if (withSound.length !== clips.length) {
    const silent = clips.findIndex(
      (clip) => !(clip.media.audio && clip.media.audio.samples.length));
    return {
      ok: false,
      reason: t('join.silent', { name: nameOf(clips[silent], silent, t) }),
      present: true,
    };
  }

  const first = clips[0].media.audio;
  for (let i = 1; i < clips.length; i++) {
    const audio = clips[i].media.audio;
    const name = nameOf(clips[i], i, t);

    if (Math.round(audio.sampleRate) !== Math.round(first.sampleRate)
      || audio.channels !== first.channels) {
      return {
        ok: false,
        reason: t('join.sound', {
          name,
          channels: audio.channels,
          rate: Math.round(audio.sampleRate),
          firstchannels: first.channels,
          firstrate: Math.round(first.sampleRate),
        }),
        present: true,
      };
    }
    if (!sameBytes(audio.sampleEntry, first.sampleEntry)) {
      return { ok: false, reason: t('join.soundentry', { name }), present: true };
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
export function joinability(clips, { keepAudio = true, t } = {}) {
  const video = videoJoinable(clips, t);
  const audio = audioJoinable(clips, t);

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
