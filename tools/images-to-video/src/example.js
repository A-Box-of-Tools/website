/**
 * The frames behind the "Try an example" button.
 *
 * One scene photographed twelve times with the camera moved a little each
 * time, rather than twelve unrelated pictures. A slideshow of strangers proves
 * the tool wrote a video; a pan proves it wrote the frames in the order it was
 * given them, at the rate it was asked for, which is the part worth seeing.
 */

import { photoFile } from './shared/example-photo.js';

const FRAMES = 12;

export function makeExample() {
  return Promise.all(Array.from({ length: FRAMES }, (unused, i) => photoFile(
    `example-${String(i + 1).padStart(2, '0')}.jpg`,
    { width: 1280, height: 720, shift: i * 60 },
  )));
}
