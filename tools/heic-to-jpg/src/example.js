/**
 * The picture behind the "Try an example" button.
 *
 * The one example on this site that is a real file rather than a drawn one,
 * and it has to be: no browser will encode HEIC, which is the whole reason
 * anybody arrives here with a .heic they cannot open. See example-data.js.
 */

/**
 * Turn the base64 in example-data.js back into a File.
 *
 * The data module is loaded here, on the press, rather than imported at the
 * top of the file: it is the largest thing this tool ships, and a visitor who
 * brings their own picture - which is nearly all of them - should never pay
 * for it. See build_tool in build.py for why it is also kept out of the
 * service worker's precache.
 */
async function fileFromData(name, type) {
  const { BYTES } = await import('./example-data.js');
  const binary = atob(BYTES);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], name, { type });
}

export function makeExample() {
  return fileFromData('example.heic', 'image/heic');
}
