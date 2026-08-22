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

    for name in sorted(shipped):
        if not name.endswith('.js'):
            continue
        for line, specifier in specifiers(read(name), f'{where}/{name}'):
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

    if problems:
        raise ConfigError(
            f'{where}: {len(problems)} import(s) lead nowhere:\n    '
            + '\n    '.join(problems)
            + '\n  A shared module is only shipped if tool.toml asks for it by '
              'name in js_parts.')
