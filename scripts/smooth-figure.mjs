/**
 * Regenerate a smoothed figure for tools/compare-heights/src/traced.js.
 *
 *   node scripts/smooth-figure.mjs tools/compare-heights/vendor/man-standing-silhouette.svg
 *
 * Prints the smoothed path, the digest of the file it came from, and the two
 * numbers traced.js records beside it. Nothing is written: the output is meant
 * to be read, compared with what is already in traced.js, and pasted only if
 * you meant to change it.
 *
 * WHY THERE IS A SCRIPT AT ALL
 *
 * `smoothOutline` is exercised on every test run - compare-heights-traced.test.js
 * re-derives the man from vendor/ and fails if the answer moved - so this is
 * not what keeps the file honest. It is what you run when you are ADDING a
 * figure, or when upstream has republished one, and want the numbers without
 * hand-copying them out of a browser console.
 *
 * The one thing it cannot do is measure a bounding box: that needs a renderer,
 * and this file deliberately has none. The last lines say how to get it.
 */

import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { basename } from 'node:path';

import { smoothOutline } from './smooth-outline.mjs';

const file = process.argv[2];
if (!file) {
  console.error('usage: node scripts/smooth-figure.mjs <vendor/figure.svg>');
  process.exit(2);
}

const bytes = readFileSync(file);
const svg = bytes.toString('utf8');

// The namespace prefix is optional: one of the vendored files is published as
// <ns0:svg><ns0:path>, which is valid and would otherwise read as empty.
const paths = [...svg.matchAll(/<(?:\w+:)?path\b[^>]*?\sd="([^"]+)"/g)].map((m) => m[1]);
if (paths.length !== 1) {
  console.error(`${file} has ${paths.length} paths; the smoother expects one outline.`);
  process.exit(1);
}

const smoothed = smoothOutline(paths[0]);
const before = paths[0].length;
const after = smoothed.join('').length;

console.log(`  source: '${basename(file)}',`);
console.log(`  bytes: ${bytes.length},`);
console.log(`  sha256: '${createHash('sha256').update(bytes).digest('hex')}',`);
console.log('  smoothed: true,');
console.log('  paths: [');
for (const d of smoothed) console.log(`    ${JSON.stringify(d)},`);
console.log('  ],');
console.log();
console.log(`// ${before} characters in, ${after} out, `
  + `${smoothed.length} subpath${smoothed.length === 1 ? '' : 's'} kept.`);
console.log('// `width` and `inner` still have to be measured: put these paths in one <g>');
console.log('// in a browser, read g.getBBox(), then');
console.log('//   width = box.width / box.height');
console.log('//   inner = `scale(${1 / box.height}) translate(${-(box.x + box.width / 2)} ${-box.y})`');
