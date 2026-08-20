"""
Identifier mangling, via esbuild.

This is the part buildlib/minify.py deliberately refuses to do by hand. Renaming
a variable is only safe once you know every place it is bound and every place it
is read, which means a real parser with real scope analysis. esbuild has one.

WHAT THIS COSTS, STATED PLAINLY

Everything else in this repository builds with Python and nothing else, so that
anyone can check the site's claims without first installing a tree of
dependencies. This breaks that, for the JavaScript, when it is switched on:

  * `python build.py` still needs nothing but Python, and still produces a
    readable, working site. That is the default and it stays the default.
  * `python build.py --mangle` needs esbuild, at the exact version named in
    config/site.toml. It is what CI runs and what is deployed.
  * `python build.py --check` therefore needs esbuild too, because it compares
    against the deployed branch, and the deployed branch is mangled.

The version is pinned and verified rather than merely requested. Two versions of
esbuild do not have to agree on the names they invent, and if the checker and
the deploy disagree then `--check` says the site has been tampered with when it
has not - which is worse than not having a checker at all.

WHAT IS PASSED TO IT, AND WHY

  --minify            whitespace, identifiers and syntax
  --format=esm        every file here is an ES module and stays one; nothing is
                      bundled, so each module keeps its own file and its own
                      imports, and the service worker's asset list still matches
  --target=esnext     no lowering. The output uses the same syntax the source
                      does, so nothing is rewritten for a browser that is not
                      being targeted anyway
  --legal-comments=none   no comment survives; the banner is added afterwards,
                      here, rather than through esbuild's own flag for it
  --sourcefile=       gives esbuild a name to put in an error message, since the
                      source arrives on stdin

Exported names are never renamed - they cannot be, because another module
imports them - so the module graph is untouched. What changes is the names of
things inside a function, which nothing outside can see. That is asserted rather
than assumed: check_imports below reads the imports back off the output and
fails the build if a single specifier moved.
"""

import shutil
import subprocess

from buildlib import minify


class MangleError(Exception):
    pass


def resolve(pinned, command=None):
    """Find esbuild, or say clearly what to do about it."""
    found = shutil.which(command or 'esbuild')
    if not found:
        raise MangleError(
            'esbuild is needed to rename identifiers, and is not on PATH.\n'
            f'    Install the pinned version:  npm install --global esbuild@{pinned}\n'
            '    Or leave it out: plain `python build.py` produces a working,\n'
            '    readable site with nothing but Python.')
    return found


def version(command):
    try:
        result = subprocess.run([command, '--version'],
                                capture_output=True, text=True, timeout=60)
    except OSError as err:
        raise MangleError(f'could not run {command}: {err}') from None
    if result.returncode != 0:
        raise MangleError(f'{command} --version failed: {result.stderr.strip()}')
    return result.stdout.strip()


def require_version(command, wanted):
    """Refuse to run against a version other than the pinned one.

    Not pedantry: esbuild does not promise that two versions invent the same
    names, and the whole value of `--check` is that a fresh build reproduces the
    deployed bytes exactly. A near-miss version would make it report tampering
    where there was none.
    """
    found = version(command)
    if found != wanted:
        raise MangleError(
            f'esbuild {wanted} is pinned in config/site.toml but {command} is {found}.\n'
            f'    Install the pinned one:  npm install --global esbuild@{wanted}\n'
            f'    or change esbuild_version in config/site.toml if you mean to move.')
    return found


def js(source, command, banner=None, sourcefile='input.js'):
    """Minify and mangle one ES module. Source in, source out, no temp files."""
    argv = [
        command,
        '--minify',
        '--format=esm',
        '--target=esnext',
        '--loader=js',
        '--legal-comments=none',
        f'--sourcefile={sourcefile}',
        '--log-level=warning',
    ]

    try:
        result = subprocess.run(argv, input=source, capture_output=True,
                                text=True, encoding='utf-8', timeout=120)
    except OSError as err:
        raise MangleError(f'could not run esbuild on {sourcefile}: {err}') from None

    if result.returncode != 0:
        raise MangleError(f'esbuild failed on {sourcefile}:\n{result.stderr.strip()}')
    if result.stderr.strip():
        # A warning is not a failure, but on this site it is worth reading.
        print(f'  esbuild on {sourcefile}: {result.stderr.strip()}')
    if not result.stdout.strip():
        raise MangleError(f'esbuild produced nothing for {sourcefile}')

    output = result.stdout
    check_imports(source, output, sourcefile)

    # The banner is put on here rather than asked of esbuild.
    #
    # esbuild spells that flag two ways: `--banner:js=` when it is building
    # files, and `--banner=` when it is transforming a stream, which is what
    # this is. Getting it wrong is not a quiet failure - it refused outright -
    # but its own advice for the mistake is to write `--banner=js=...`, which
    # would set the banner to the literal text `js=/* ... */` and put a syntax
    # error at the top of every module on the site. A comment is one string
    # concatenation; it does not need to be somebody else's flag.
    if banner:
        output = banner + '\n' + output.lstrip('\n')
    return output


def specifiers(text, where):
    """Every module path this file pulls in: `from "x"`, a bare `import "x"`,
    and `import("x")`.

    Read off the token stream rather than matched in the raw text. `from` is not
    a reserved word and the word turns up inside strings and template literals
    all over this repository - "...data from 'this block is unreadable'" is a
    real line in the EXIF parser - so a regular expression finds imports that
    are not there, and finds different ones before and after the comments have
    been taken out. The tokeniser steps over strings and comments by
    construction, which is the whole reason it exists.
    """
    tokens = [text for _, text in minify.tokenize_js(text, where)]
    found = []
    for index, token in enumerate(tokens):
        rest = tokens[index + 1:index + 3]
        if token in ('from', 'import') and rest and rest[0][:1] in '"\'':
            found.append(rest[0][1:-1])
        elif token == 'import' and len(rest) == 2 and rest[0] == '(' and rest[1][:1] in '"\'':
            found.append(rest[1][1:-1])
    return sorted(found)


def check_imports(source, output, sourcefile):
    """Every module this file pulled in, it must still pull in.

    Renaming is safe for the names a module keeps to itself and must not touch
    the ones it shares. If a specifier went missing, or a new one appeared, then
    something was bundled or dropped, and the service worker's list of files no
    longer describes the site. Cheap to check, and it is the one invariant the
    separate-modules design rests on.
    """
    before = specifiers(source, sourcefile)
    after = specifiers(output, sourcefile + ' (mangled)')
    if before != after:
        raise MangleError(
            f'esbuild changed what {sourcefile} imports.\n'
            f'    before: {before}\n'
            f'    after:  {after}\n'
            '    Every module here keeps its own file; nothing should be bundled.')
