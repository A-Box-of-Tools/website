/**
 * Parse every emitted script as an ES module, in one process.
 *
 *   node --experimental-vm-modules .github/scripts/parse-modules.mjs <dir>
 *
 * This is the second opinion on buildlib/minify.py: it compares its own
 * tokens on every file and fails the build if they moved, and this asks a
 * real parser the same question. It used to be `node --check`, once per file,
 * and that was the shape of the problem: the site emits about nine hundred
 * scripts per language and fifteen languages, and thirteen thousand Node
 * start-ups at twenty-five milliseconds each were six minutes of a seven
 * minute job - four times what the two builds it was checking took together.
 *
 * `vm.SourceTextModule` parses the text as a module - so `import` and
 * `export` are grammar rather than the syntax error a bare .js read as
 * CommonJS would have reported, which is why the old loop copied every file
 * to .mjs first - and the constructor throws the SyntaxError itself, before
 * anything is linked or evaluated. Nothing in the file runs. The whole tree
 * takes a few seconds.
 *
 * The constructor is behind --experimental-vm-modules on every Node this
 * runs on, and has been since 9.6; the flag is the only thing about it that
 * is experimental for this use, which reads a source and throws or does not.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

const root = process.argv[2];
if (!root) {
  console.error('usage: node --experimental-vm-modules parse-modules.mjs <dir>');
  process.exit(2);
}

const scripts = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (name.endsWith('.js')) scripts.push(path);
  }
}(root));
scripts.sort();

// One annotation per file that fails, in the form the Actions log turns into
// a mark on the file, exactly as the per-file loop reported it.
let broken = 0;
for (const path of scripts) {
  try {
    // eslint-disable-next-line no-new
    new vm.SourceTextModule(readFileSync(path, 'utf8'), { identifier: path });
  } catch (error) {
    broken += 1;
    console.log(`::error file=${path}::does not parse after minifying`);
    console.log(`    ${error.message}`);
  }
}
console.log(`parsed ${scripts.length} scripts`);
process.exit(broken === 0 ? 0 : 1);
