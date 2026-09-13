/**
 * The few things this tool has to turn into words.
 *
 * Every function here hands back a phrase key and the blanks to fill in, never
 * a sentence: this file is copied byte for byte into every language, so a
 * string written here would be English at every address but one. main.js
 * resolves them through phrase(). See "The strings in the JavaScript" in the
 * repository README.
 */

/** A bitrate as the unit people read: kbit/s under a megabit, Mbit/s above. */
export function bitrateText(bitsPerSecond) {
  if (bitsPerSecond >= 1_000_000) {
    return { key: 'rate.mbit', values: { n: (bitsPerSecond / 1_000_000).toFixed(1) } };
  }
  return { key: 'rate.kbit', values: { n: Math.round(bitsPerSecond / 1000) } };
}

/** A frame size, as the name people know it by when it has one. */
export function frameText({ width, height }) {
  const long = Math.max(width, height);
  const named = { 3840: '4K', 2560: '1440p', 1920: '1080p', 1280: '720p', 854: '480p', 640: '360p' }[long];
  return named
    ? { key: 'frame.named', values: { name: named, width, height } }
    : { key: 'frame.plain', values: { width, height } };
}

/**
 * A codec by the name a person would use for it. The ones with a name of
 * their own are keys, so a language can spell them its way; anything else is
 * shown as the file spells it.
 */
export function codecText(codec, fallback = '') {
  const id = String(codec ?? '');
  if (/^avc[13]\./.test(id)) return { key: 'codec.h264' };
  if (/^(hvc1|hev1)\./.test(id)) return { key: 'codec.hevc' };
  if (id === 'vp8') return { key: 'codec.vp8' };
  if (/^vp09\./.test(id)) return { key: 'codec.vp9' };
  if (/^av01\./.test(id)) return { key: 'codec.av1' };
  if (/^mp4a\.40\./.test(id)) return { key: 'codec.aac' };
  if (id === 'opus') return { key: 'codec.opus' };
  if (id === 'vorbis') return { key: 'codec.vorbis' };
  if (id === 'mp3') return { key: 'codec.mp3' };
  if (id === 'flac') return { key: 'codec.flac' };
  if (id === 'ac-3') return { key: 'codec.ac3' };
  if (id === 'ec-3') return { key: 'codec.eac3' };
  return { key: 'codec.other', values: { name: id || fallback || '?' } };
}

/** A container by the name on its file. */
export function containerText(container) {
  return { key: `container.${container}` };
}

/**
 * What to call the finished file. Always .mp4, because that is what it is;
 * a file that was already called that gets a word added, so the download
 * does not land on top of the original.
 */
export function outName(name) {
  const stem = name.replace(/\.[^.]+$/, '') || 'video';
  const wasMp4 = /\.mp4$/i.test(name);
  return wasMp4 ? `${stem}-converted.mp4` : `${stem}.mp4`;
}
