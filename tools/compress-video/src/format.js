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

/** What to call the finished file. Always .mp4, because that is what it is. */
export function outName(name) {
  const stem = name.replace(/\.[^.]+$/, '') || 'video';
  return `${stem}-compressed.mp4`;
}
