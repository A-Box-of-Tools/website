/**
 * The picture behind the "Try an example" button.
 *
 * Big on purpose - 2400 by 1600 - because this tool's job is making something
 * smaller, and an example that arrived at a sensible size already would leave
 * the width box with nothing useful to say.
 */

import { photoFile } from './shared/example-photo.js';

export function makeExample() {
  return photoFile('example.jpg', { width: 2400, height: 1600, seed: 20260907 });
}
