/**
 * The two pictures behind the "Try an example" button.
 *
 * The only example on this site besides the HEIC one that is a real file
 * rather than a drawing, and it has to be: nothing in a browser will encode an
 * AVIF, which is the whole reason people arrive here with one they cannot
 * open. See example-data.js for what they are and how they were made.
 */

/**
 * Turn one of the base64 blocks in example-data.js back into a File.
 *
 * The data module is loaded here, on the press, rather than imported at the
 * top of this file: it is the largest thing this tool ships, and a visitor who
 * brings their own picture - which is nearly all of them - should never pay for
 * it. See build_tool in build.py for why it is also kept out of the service
 * worker's precache.
 */
async function filesFromData() {
  const { LANDSCAPE, SQUARE } = await import('./example-data.js');

  const decode = (base64, name) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return new File([bytes], name, { type: 'image/avif' });
  };

  return [
    decode(LANDSCAPE, 'example-landscape.avif'),
    decode(SQUARE, 'example-square.avif'),
  ];
}

export function makeExample() {
  return filesFromData();
}
