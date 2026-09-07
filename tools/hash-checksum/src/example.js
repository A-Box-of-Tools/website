/**
 * The file behind the "Try an example" button.
 *
 * A picture rather than a scrap of text, because the reason to check a
 * checksum is that the file is large enough to have arrived damaged, and
 * because reading one is the part worth showing: the tool hashes a couple of
 * megabytes off disk without loading it whole.
 */

import { photoFile } from './shared/example-photo.js';

export function makeExample() {
  return photoFile('example.jpg', { width: 2048, height: 1536, seed: 20260907 });
}
