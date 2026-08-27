#!/usr/bin/env python3
# The docstring is raw because it quotes `.\og-image.ps1`, and \o is not an
# escape - Python warns about it on every run, which for a file that runs
# before other people's shell commands means noise on somebody else's stderr.
r"""
Refuse the two shell commands this repository has learned to regret.

WHY A HOOK AND NOT A SENTENCE IN CLAUDE.md

Both rules below are already written down, in CLAUDE.md and in the
tool-development skill, in bold, with the reason attached. Prose is how a rule
is explained; it is not how a rule is kept. The evidence is in the repository's
own history - `git add -A` is documented as a thing never to do BECAUSE it was
done, and swept 3,816 generated files into main (#61).

A rule that only exists as prose is one an agent has to hold in mind at the
moment it matters, which is the moment it is least likely to. So these two are
enforced by something that runs whether or not anybody remembered.

WHAT IT REFUSES, AND WHAT IT DELIBERATELY DOES NOT

  - `git add -A`, `git add --all`, `git add .`, and `git add :/`. The narrower
    forms are the point: staging explicit paths is the documented practice, so
    `git add tools/trim-video/` is not touched. A CI-style build writes
    `_plain/` into the working tree, and the difference between a tool change
    and a disaster is 20 files against 3,816.

  - a run of a WHOLE test suite. `tests/README.md` and CLAUDE.md both say an
    agent leaves the suites to CI, which runs them on every push and gates the
    deploy on them; the Python suite costs the better part of half an hour
    locally because most of its cases build the whole site first.

    Reproducing ONE named case is explicitly the documented thing to do when CI
    reports a failure, so `-k` and `--test-name-pattern` runs are allowed
    through untouched. That distinction is the whole reason this is a script
    and not a `deny` glob in settings.json: a glob can refuse a command, but it
    cannot refuse a command only when a flag is absent.

Not here on purpose:

  - `og-image.ps1` without `-Only`. It belongs on this list by every other
    measure - it is a documented trap with a real cost - and it is spelled too
    many ways to match honestly (`.\og-image.ps1`, `./og-image.ps1`,
    `powershell -File og-image.ps1`, an absolute path). A guard that catches
    three spellings out of four teaches that the guard is watching, which is
    worse than no guard: it converts a rule somebody was keeping by hand into
    one they believe is being kept for them.

  - the LF rule. `.gitattributes` already holds the line at the commit, and the
    trap it warns about - Python's `write_text()` - is not a shell command and
    is not visible from here.

HOW IT ANSWERS

A PreToolUse hook denies by printing a permission decision, and the reason
reaches whoever tried. Every reason below says what to do instead, because a
refusal that only says no gets worked around rather than learned from.

Anything it cannot read - a payload that is not JSON, a call with no command -
is allowed through. This decides whether a rule was broken, and "I could not
tell" is not a reason to stop somebody working.
"""

import json
import re
import sys

# `git add` up to the next shell separator, so that the -A in a chained
# `git add -A && git commit` is still found and an -A belonging to some later
# command in the line is not attributed to the add.
GIT_ADD = re.compile(r'\bgit\s+add\b([^&|;\n]*)')

# The four ways to say "everything". A bare `.` only counts when it stands
# alone as a path: `git add ./tools/x` names a file and is fine.
EVERYTHING = re.compile(r'(?:^|\s)(?:-A|--all|\.|:/)(?=\s|$)')

WHOLE_SUITES = (
    (re.compile(r'\b(?:python|python3|py)\s+-m\s+unittest\b'),
     re.compile(r'(?:^|\s)-k(?:\s|=)'),
     'python -m unittest tests.python.test_build -v -k <name>'),
    (re.compile(r'\bnode\s+--test\b'),
     re.compile(r'--test-name-pattern'),
     'node --test --test-name-pattern="<name>" "tests/js/*.test.js"'),
    (re.compile(r'\bnpm\s+(?:run\s+)?test\b'),
     None,
     'node --test --test-name-pattern="<name>" "tests/js/*.test.js"'),
)


def refuse(command):
    """A reason to refuse `command`, or None to let it through."""
    for match in GIT_ADD.finditer(command):
        if EVERYTHING.search(match.group(1)):
            return (
                'This repository does not stage everything. A CI-style build '
                'writes _plain/ into the working tree, and one `git add -A` '
                'once swept 3,816 generated files into main (#61).\n'
                'Name the paths instead, then check what is staged:\n'
                '    git add <path> [<path> ...]\n'
                '    git diff --cached --name-only | wc -l\n'
                'A tool change is around 20 files and a locale around 66. See '
                '"Things that will bite" in CLAUDE.md.')

    for suite, narrowed, one_case in WHOLE_SUITES:
        if suite.search(command) and not (narrowed and narrowed.search(command)):
            return (
                'The test suites are not an agent\'s to run here. CI runs both '
                'on every push and every pull request and the build job needs '
                'them, so nothing reaches dist past a failure - and the Python '
                'suite costs the better part of half an hour locally, because '
                'most of its cases build the whole site before they assert '
                'anything.\n'
                'If CI reported a failure, reproduce that one case:\n'
                f'    {one_case}\n'
                'Otherwise build and open the page - that is the part CI '
                'cannot do for you. See "Commands" in CLAUDE.md.')

    return None


def main():
    try:
        payload = json.load(sys.stdin)
    except Exception:
        return 0

    command = ''
    if isinstance(payload, dict):
        tool_input = payload.get('tool_input')
        if isinstance(tool_input, dict):
            command = tool_input.get('command') or ''
    if not isinstance(command, str) or not command.strip():
        return 0

    reason = refuse(command)
    if reason is None:
        return 0

    json.dump({'hookSpecificOutput': {
        'hookEventName': 'PreToolUse',
        'permissionDecision': 'deny',
        'permissionDecisionReason': reason,
    }}, sys.stdout)
    return 0


if __name__ == '__main__':
    sys.exit(main())
