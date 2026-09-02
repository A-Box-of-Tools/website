"""
Reading what a module imports, so the build can check that it is there.

WHY THIS EXISTS

Nothing is bundled here. A tool page loads `src/main.js` as an ES module and
the browser fetches every other file the imports name, one request each. That
is the point - what is in the folder is what runs - but it means a specifier
that names a file nobody shipped is not a build error. It is a 404 at runtime,
on the visitor's machine, after the page has already rendered.

Two ways that happens, and neither is hypothetical:

  - a typo in a path, which no test catches because the tests import the
    modules directly by their real names;
  - a shared module that imports a second shared module, where `js_parts` in
    tool.toml lists only the first. `shared/js/zip.js` needing
    `shared/js/crc32.js` is exactly this shape. The tool builds, the page
    loads, and the ZIP writer is missing its checksum function.

Both are invisible to `python build.py` and to CI, and both break the tool
completely. So the build reads every module it is about to emit, collects the
specifiers, and refuses a tool whose imports do not all land on a file that
tool ships.

HOW IT READS THEM

With the tokeniser in minify.py, not a regular expression. Comments are full of
things that look like imports and are not - this repository has
`@param {import('./reader.js').PdfDocument}` in its JSDoc and the words "from"
and "import" in its prose - and a regex over raw text finds those too. The
tokeniser already drops comments and understands strings, templates and regular
expressions, which is the whole difficulty. Reusing it means there is one
answer to "what does this file actually say", not two that can disagree.
"""

import posixpath

from buildlib import minify
from buildlib.site import ConfigError


def specifiers(source, where='<js>'):
    """Every module specifier `source` imports from, as (line, specifier).

    The three shapes that name a module:

        import … from '…';   export … from '…';   -> a string after `from`
        import '…';                               -> a string after `import`
        import('…')                               -> a string after `import (`

    A string in any other position is data and is ignored, which is why this
    walks tokens rather than matching text: `const from = './x.js'` is a
    variable, not an import, and the token before it is `=`.
    """
    found = []
    tokens = minify.tokenize_js(source, where)

    for index, (line, text) in enumerate(tokens):
        if not text or text[0] not in '\'"':
            continue
        previous = tokens[index - 1][1] if index else None
        if previous in ('from', 'import'):
            found.append((line, text[1:-1]))
        elif (previous == '(' and index >= 2
                and tokens[index - 2][1] == 'import'):
            found.append((line, text[1:-1]))

    return found


def bindings(source, where='<js>'):
    """Every named import, as (line, specifier, [names]).

    `import { a, b as c } from './x.js'` names `a` and `b` - what x.js has to
    export, not what this module calls them. A default or a side-effect import
    names nothing and is not listed; those are the specifier check's business.

    This exists because a specifier can land on a file that exists and still
    name something that is no longer in it. Moving a function into a shared
    part leaves every `import { it } from './old.js'` pointing at a real file,
    the build ships it, and the page's module fails to link on the visitor's
    machine - which is how the video cutter spent an afternoon showing "this
    page's code did not start" after its frame-rate helper moved.
    """
    found = []
    tokens = minify.tokenize_js(source, where)
    index = 0
    while index < len(tokens):
        line, text = tokens[index]
        if text != 'import' or index + 1 >= len(tokens):
            index += 1
            continue
        # skip a default binding before the braces: `import x, { a } from`
        cursor = index + 1
        if tokens[cursor][1] not in ('{', '(') and tokens[cursor][1][0] not in '\'"':
            cursor += 1
            if cursor < len(tokens) and tokens[cursor][1] == ',':
                cursor += 1
        if cursor >= len(tokens) or tokens[cursor][1] != '{':
            index += 1
            continue
        names = []
        cursor += 1
        while cursor < len(tokens) and tokens[cursor][1] != '}':
            item = tokens[cursor][1]
            if item != ',':
                names.append(item)
                if cursor + 2 < len(tokens) and tokens[cursor + 1][1] == 'as':
                    cursor += 2
            cursor += 1
        # `} from '…'`
        if (cursor + 2 < len(tokens) and tokens[cursor + 1][1] == 'from'
                and tokens[cursor + 2][1][0] in '\'"'):
            found.append((line, tokens[cursor + 2][1][1:-1], names))
        index = cursor + 1
    return found


def exports(source, where='<js>'):
    """The names `source` exports, as a set.

    Declarations (`export function f`, `export const c`, `export class C`,
    `async` and `*` included), lists (`export { a, b as c }`), and re-exports
    (`export { a } from './x.js'`, where the name this module offers is the
    one after `as`, or `a`). `export default` names nothing here, and
    `export * from` is not followed: nothing in this repository writes it.
    """
    names = set()
    tokens = minify.tokenize_js(source, where)
    index = 0
    while index < len(tokens):
        if tokens[index][1] != 'export' or index + 1 >= len(tokens):
            index += 1
            continue
        cursor = index + 1
        text = tokens[cursor][1]
        if text == '{':
            cursor += 1
            while cursor < len(tokens) and tokens[cursor][1] != '}':
                item = tokens[cursor][1]
                if item != ',':
                    if cursor + 2 < len(tokens) and tokens[cursor + 1][1] == 'as':
                        item = tokens[cursor + 2][1]
                        cursor += 2
                    names.add(item)
                cursor += 1
        elif text in ('function', 'class', 'const', 'let', 'var', 'async'):
            while cursor < len(tokens) and tokens[cursor][1] in (
                    'function', 'class', 'const', 'let', 'var', 'async', '*'):
                cursor += 1
            if cursor < len(tokens):
                names.add(tokens[cursor][1])
        index = cursor + 1
    return names


def resolve(importer, specifier):
    """Where `specifier`, written inside `importer`, points.

    Both are paths relative to the tool's own folder - `src/main.js`,
    `src/shared/file-picker.js` - because that is how the build names the files
    it emits and how the service worker lists them. Returns None for a
    specifier that is not relative: there is no import map on these pages, so a
    bare name has nothing to resolve against.
    """
    if not specifier.startswith('./') and not specifier.startswith('../'):
        return None
    return posixpath.normpath(
        posixpath.join(posixpath.dirname(importer), specifier))


def check(shipped, read, where):
    """Refuse any import that does not land on a file in `shipped`.

    `shipped` is the set of paths the tool emits, relative to its folder in
    dist/. `read` is called with one of those paths and returns its source, so
    the caller decides where the bytes come from and this stays testable
    without a filesystem.

    Raises ConfigError listing every bad specifier at once, rather than the
    first, because a missing `js_parts` entry usually breaks several modules
    and fixing them one build at a time is a poor way to spend an afternoon.
    """
    problems = []
    offered = {}

    for name in sorted(shipped):
        if not name.endswith('.js'):
            continue
        source = read(name)
        for line, specifier in specifiers(source, f'{where}/{name}'):
            target = resolve(name, specifier)
            if target is None:
                problems.append(
                    f'{name}:{line}: "{specifier}" is not a relative path, and '
                    f'these pages have no import map to resolve a bare name '
                    f'against')
            elif target not in shipped:
                problems.append(
                    f'{name}:{line}: "{specifier}" -> {target}, which this '
                    f'tool does not ship')

        # A file that exists can still lack the name asked of it; the browser
        # refuses to link the whole module and the page's code never starts.
        for line, specifier, names in bindings(source, f'{where}/{name}'):
            target = resolve(name, specifier)
            if target is None or target not in shipped:
                continue
            if target not in offered:
                offered[target] = exports(read(target), f'{where}/{target}')
            for wanted in names:
                if wanted not in offered[target]:
                    problems.append(
                        f'{name}:{line}: "{specifier}" has no export named '
                        f'{wanted}')

    if problems:
        raise ConfigError(
            f'{where}: {len(problems)} import(s) lead nowhere:\n    '
            + '\n    '.join(problems)
            + '\n  A shared module is only shipped if tool.toml asks for it by '
              'name in js_parts, and a name has to be exported by the file '
              'it is imported from.')
