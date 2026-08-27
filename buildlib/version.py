"""
The version of the site, and the rule a pull request has to satisfy.

THE RULE

    a new tool                          the middle number, last one to zero
    anything else a visitor can notice  the last number
    tests, CI, documentation            nothing

One step per pull request, not per commit: a branch with six commits in it is
one change as far as anybody reading the site is concerned, and asking each
commit to move the number would only mean six numbers nobody chose.

WHY THE ANSWER COMES FROM A LIST OF PATHS

Because the honest question - "did the rendered site change?" - can only be
answered by building both sides and comparing them, and that is two builds on
every pull request to learn something a list of filenames gets right almost
every time. The same trade is already made in .github/workflows/build.yml,
which decides whether to run the suites the same way and says so.

So the list below is an allowlist of what a visitor cannot see, and it is
short on purpose. Anything not on it counts as visible, including build.py
itself: a change there reaches the site through every page it renders, and
open_links_elsewhere - which changed every link on every tool page - lived
nowhere else. A refactor that genuinely alters nothing still asks for a digit
under this rule. That is the cheaper mistake of the two.
"""

import re

#: Files a visitor could never notice a change in.
INVISIBLE = (
    'tests/',
    '.github/',
    'docs/',
    '.claude/',
    'workers/',          # deployed by hand, and not part of a page
)

#: Individual files, rather than trees, that are equally invisible.
INVISIBLE_FILES = (
    'README.md',
    'CLAUDE.md',
    'ROADMAP.md',
    'LICENSE',
    'LICENSE-CONTENT',
    '.gitignore',
    '.gitattributes',
)

#: A tool announces itself by its configuration file and nothing else.
NEW_TOOL = re.compile(r'^tools/([^/]+)/tool\.toml$')

VERSION = re.compile(r'^\s*version\s*=\s*"(\d+)\.(\d+)\.(\d+)"\s*$', re.M)


def read(toml_text):
    """The version in a config/site.toml, as three numbers.

    Raises rather than guessing: a missing or malformed version is a thing to
    fix, and a check that quietly assumed 0.0.0 would pass every pull request
    that deleted it.
    """
    found = VERSION.search(toml_text or '')
    if not found:
        raise ValueError('config/site.toml has no version = "x.y.z"')
    return tuple(int(part) for part in found.groups())


def visible(path):
    """Whether a visitor could notice a change to this file."""
    if path in INVISIBLE_FILES:
        return False
    return not any(path.startswith(prefix) for prefix in INVISIBLE)


def new_tools(added_paths):
    """The slugs of tools this change introduces.

    Only files that were *added* count. Editing an existing tool.toml is a
    change to a tool, not a new one, and the difference is the whole of the
    minor-versus-patch decision.
    """
    slugs = []
    for path in added_paths:
        found = NEW_TOOL.match(path)
        if found:
            slugs.append(found.group(1))
    return sorted(slugs)


def required(changed_paths, added_paths):
    """What this change has to do to the version: 'minor', 'patch' or 'none'."""
    if new_tools(added_paths):
        return 'minor'
    if any(visible(path) for path in changed_paths):
        return 'patch'
    return 'none'


def satisfies(before, after, need):
    """Whether the move from one version to another meets what is required.

    A bigger step than asked for always passes. Somebody who decides a change
    deserves a minor, or that the site has reached 2.0.0, is making a
    judgement this rule has no business overruling - it is a floor, not a
    timetable.
    """
    if need == 'none':
        return after >= before

    if after <= before:
        return False

    if need == 'minor':
        # A new tool moves the middle number and puts the last back to zero,
        # or moves the major. "1.1.5 -> 1.2.5" would be a minor bump that quietly
        # kept a patch count belonging to the version before it.
        if after[0] > before[0]:
            return after[1] == 0 and after[2] == 0
        return after[1] > before[1] and after[2] == 0

    return True  # 'patch': any increase at all is at least a patch


def explain(need, before, after, tools):
    """The sentence the presubmit prints when the rule is not met."""
    dotted = lambda v: '.'.join(str(part) for part in v)

    if need == 'minor':
        want = (before[0], before[1] + 1, 0)
        return (
            f'This pull request adds a tool ({", ".join(tools)}), so '
            f'config/site.toml\'s version has to move its middle number and put '
            f'the last one back to zero: {dotted(before)} -> {dotted(want)}. '
            f'It is {dotted(after)}.'
        )

    want = (before[0], before[1], before[2] + 1)
    return (
        'This pull request changes something a visitor could notice, so '
        f'config/site.toml\'s version has to move its last number: '
        f'{dotted(before)} -> {dotted(want)}. It is {dotted(after)}.'
    )
