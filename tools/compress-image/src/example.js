/**
 * The pictures behind the "Try an example" button.
 *
 * Three of them, at three sizes, because this tool takes a batch and a batch
 * of one demonstrates none of what it does with a batch: the per-file rows,
 * the running total, and the zip at the end all only mean something once there
 * is more than one row.
 *
 * They are drawn rather than fetched - see shared/js/example-photo.js for why
 * that is not a choice - and they are drawn at quality 0.92, which is roughly
 * where a phone leaves a photograph. Starting from something already squeezed
 * would leave the tool nothing to take out and no honest number to report.
 */

import { photoFile } from './shared/example-photo.js';

export function makeExample() {
  return Promise.all([
    photoFile('example-1.jpg', { width: 1600, height: 1200, seed: 20260907 }),
    photoFile('example-2.jpg', { width: 1280, height: 1280, seed: 481207 }),
    photoFile('example-3.jpg', { width: 2048, height: 1152, seed: 90210 }),
  ]);
}
