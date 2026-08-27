/**
 * Why a file, a frame or a fragment could not be read, named rather than
 * written.
 *
 * The decoders in this folder are leaves: the JavaScript tests load them
 * straight off the disk, so they cannot reach the markup the words live in,
 * and everything under src/ is copied byte for byte into fifteen languages.
 * A decoder that threw an English sentence would refuse a German reader's file
 * in English.
 *
 * So they throw the KEY of a sentence, with the numbers that fill its blanks
 * hung on the error, and main.js resolves it against #phrases. This is the
 * arrangement compress-image already uses for the same reason - and it costs
 * nothing when the error is not ours, because phrase() hands back a key it
 * does not know unchanged, so a real message from the platform still arrives
 * intact.
 */

export function refuse(key, values = {}) {
  const error = new Error(key);
  error.values = values;
  return error;
}
