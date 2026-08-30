/**
 * Nobody may call a phrase-taking function without the phrase resolver.
 *
 * This is a structural test rather than a unit one, because the bug it is
 * about has now shipped twice and neither time did any unit test come near
 * it. Both were the same shape. A translation pass gives a function that
 * writes a sentence a trailing `t` - the resolver that turns a key into words
 * in the reader's language - every call site is updated, and one is missed.
 *
 *   dicom-viewer: display() at two of its addresses, fixed in website #288.
 *   redact-image: describeRegion() and riskNote() in renderList().
 *
 * Nothing catches it before a visitor does. `t(...)` on `undefined` is not a
 * syntax error, the module loads, the page renders, and the throw arrives at
 * the first moment somebody uses the tool - "t is not a function", from
 * inside a click handler, which takes the rest of that handler with it. In
 * redact-image's case that was every box the visitor drew: the list never
 * rendered, the preview never redrew, and the buttons kept whatever state
 * they had.
 *
 * WHAT IT LOOKS FOR
 *
 * A function whose LAST parameter is named `t`, `phrase` or `say`, and has no
 * default. Such a function cannot do its job without it, so any call passing
 * fewer arguments is the bug above - a shorter call is never merely terser.
 * A parameter with a default is left alone: that is a deliberate optional.
 *
 * HOW A NAME IS RESOLVED
 *
 * The way the browser resolves it: a call counts only where the file declares
 * the function itself or imports it by name. Matching on the bare name across
 * the repository is useless - a dozen tools each have their own describe(),
 * count() and bytes(), and the first draft of this file reported a hundred
 * and eighty call sites, of which two were real.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..', '..');

/** The names that mean "the thing that turns a key into a sentence". */
const RESOLVERS = new Set(['t', 'phrase', 'say']);

/** Every .js file a tool actually ships, vendored libraries excepted. */
function sources() {
  const found = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const at = path.join(dir, entry.name);
      // vendor/ is somebody else's code, minified, and its argument counts
      // are not ours to reason about.
      if (entry.isDirectory()) {
        if (entry.name !== 'vendor' && entry.name !== 'node_modules') walk(at);
      } else if (entry.name.endsWith('.js')) {
        found.push(at);
      }
    }
  };
  for (const dir of ['tools', 'shared']) walk(path.join(ROOT, dir));
  return found;
}

/** Functions in this source whose last parameter is a resolver, and its arity. */
function declarationsIn(source) {
  const out = new Map();
  const declaration = /(?:export\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)/g;
  for (const match of source.matchAll(declaration)) {
    const [, name, params] = match;
    const list = params.split(',').map((one) => one.trim()).filter(Boolean);
    const last = list.at(-1);
    if (!last || last.includes('=')) continue;
    if (RESOLVERS.has(last)) out.set(name, list.length);
  }
  return out;
}

/**
 * What this file can call: what it declares, plus what it imports by name.
 *
 * `import { a as b }` is followed, since the local name is what the call site
 * uses. A bare specifier is somebody else's module and not our concern.
 */
function callableFrom(file, declared) {
  const out = new Map(declared.get(file) ?? []);
  const imports = /import\s*\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g;
  for (const match of fs.readFileSync(file, 'utf8').matchAll(imports)) {
    if (!match[2].startsWith('.')) continue;
    const from = path.normalize(path.join(path.dirname(file), match[2]));
    const there = declared.get(from);
    if (!there) continue;
    for (const specifier of match[1].split(',')) {
      const [name, alias] = specifier.split(/\s+as\s+/).map((one) => one.trim());
      if (there.has(name)) out.set(alias || name, there.get(name));
    }
  }
  return out;
}

/**
 * How many arguments this call passes.
 *
 * Counted by walking to the matching close paren and counting the commas at
 * depth one, so that a call carrying an object, an array or another call - all
 * three of which are common here - is counted as the one argument it is.
 */
function argumentsAt(source, from) {
  let depth = 1;
  let commas = 0;
  let anything = false;
  for (let at = from; at < source.length && depth > 0; at += 1) {
    const char = source[at];
    if (char === '(' || char === '[' || char === '{') depth += 1;
    else if (char === ')' || char === ']' || char === '}') depth -= 1;
    else if (char === ',' && depth === 1) commas += 1;
    if (depth === 1 && !/\s/.test(char) && char !== ',') anything = true;
  }
  return anything ? commas + 1 : 0;
}

test('every call passes the phrase resolver its callee needs', () => {
  const files = sources();
  const declared = new Map(
    files.map((file) => [file, declarationsIn(fs.readFileSync(file, 'utf8'))]),
  );

  // The control. If the walk stopped finding sources, or the shape of a
  // declaration changed, there would be nothing to check and this test would
  // pass by looking at nothing at all.
  const total = [...declared.values()].reduce((n, one) => n + one.size, 0);
  assert.ok(files.length > 200, `only ${files.length} sources found`);
  assert.ok(total > 20, `only ${total} functions take a resolver`);

  const short = [];
  for (const file of files) {
    const callable = callableFrom(file, declared);
    if (callable.size === 0) continue;
    const source = fs.readFileSync(file, 'utf8');
    for (const [name, arity] of callable) {
      for (const match of source.matchAll(new RegExp(`\\b${name}\\s*\\(`, 'g'))) {
        // The declaration itself is not a call.
        if (/function\s+$/.test(source.slice(Math.max(0, match.index - 30), match.index))) {
          continue;
        }
        const passed = argumentsAt(source, match.index + match[0].length);
        // Zero means a call with no arguments at all, which is a different
        // mistake and one the tools do not make; every one of these takes a
        // value first and the resolver last.
        if (passed > 0 && passed < arity) {
          const line = source.slice(0, match.index).split('\n').length;
          const where = path.relative(ROOT, file).split(path.sep).join('/');
          short.push(`${where}:${line} calls ${name}() with ${passed} of ${arity}`);
        }
      }
    }
  }

  assert.deepEqual(short, [], 'these will throw "t is not a function" when a visitor '
    + `gets that far:\n  ${short.join('\n  ')}`);
});
