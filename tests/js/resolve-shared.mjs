/**
 * Where a test finds a tool's `./shared/` imports.
 *
 * A tool's source folder imports shared modules from a path it does not
 * contain: `import { crc32 } from './shared/crc32.js'` names
 * tools/<slug>/src/shared/crc32.js, which exists only once the build has
 * copied shared/js/crc32.js there. The tests import tool modules straight off
 * the disk with no build in front of them, so without help that import fails
 * with ERR_MODULE_NOT_FOUND on a file that is not missing - only not yet put
 * where the page will find it.
 *
 * Until this file existed the repository's answer was a rule: `./shared/`
 * imports belonged in main.js, which no test loads, and every leaf module a
 * test imported had to carry its own copy of anything it would otherwise have
 * shared. That rule is what tests/python/test_duplicates.py was written to
 * police, and it is why the MP4 reader existed six times.
 *
 * WHAT THIS DOES
 *
 * It registers a resolve hook with Node's module loader - in this process,
 * and, because `node --test` starts each test file in a child process that
 * inherits the parent's execArgv, in every test file's process too. The hook
 * rewrites exactly one shape of specifier: `./shared/<name>.js`, written in a
 * module at tools/<slug>/src/<file>.js, lands on shared/js/<name>.js. Anything
 * else goes to Node as written, including a shared module importing its own
 * neighbour (shared/js/zip.js importing ./crc32.js), which resolves on its own.
 *
 * WHAT IT DOES NOT DO
 *
 * Nothing about the build changes. build.py still copies the shared file into
 * the tool at build time, buildlib/imports.py still refuses a tool whose
 * imports do not all land on a file it ships, and what is in tools/<slug>/src/
 * is still byte for byte what the browser runs. This file answers a question
 * the browser is never asked, and only while the tests are asking it.
 *
 * HOW TO RUN WITH IT
 *
 *     node --import ./tests/js/resolve-shared.mjs --test "tests/js/*.test.js"
 *
 * `npm test` says exactly that. Forgetting the flag is loud rather than
 * subtle: the first test that imports a tool module carrying a `./shared/`
 * import fails to load, naming the src/shared/ path it could not find.
 *
 * `module.registerHooks` runs the hook on the loader's own thread and is
 * synchronous, which is why this needs no second file. It arrived in Node
 * 22.15 and 23.5; CI runs the tests on 24.
 */

import { registerHooks } from 'node:module';

const TOOLS = new URL('../../tools/', import.meta.url).href;
const SHARED = new URL('../../shared/js/', import.meta.url).href;
const PREFIX = './shared/';

/**
 * The hook itself. Exported so tests/js/resolve-shared.test.js can hold it to
 * its contract directly, without importing anything through it.
 */
export function resolve(specifier, context, nextResolve) {
  const parent = context.parentURL ?? '';
  if (specifier.startsWith(PREFIX) && parent.startsWith(TOOLS)) {
    const inside = parent.slice(TOOLS.length).split('/');
    const name = specifier.slice(PREFIX.length);
    if (inside.length === 3 && inside[1] === 'src' && !name.includes('/')) {
      return nextResolve(SHARED + name, context);
    }
  }
  return nextResolve(specifier, context);
}

if (typeof registerHooks !== 'function') {
  throw new Error(
    'tests/js/resolve-shared.mjs needs module.registerHooks, which arrived in '
    + `Node 22.15 and 23.5; this is ${process.version}`);
}

registerHooks({ resolve });
