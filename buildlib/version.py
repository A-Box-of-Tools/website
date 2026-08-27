"""
The version of the site: what moves it, and by how much.

THE RULE

    a new tool                          the middle number, last one to zero
    anything else a visitor can notice  the last number
    tests, CI, documentation            nothing

WHERE THE NUMBER LIVES

In git tags, and nowhere else. It used to be a line in config/site.toml that
every pull request had to move, checked by a presubmit - and that arrangement
had two faults which turned out to be one fault.

Nothing read it. No template rendered it, no page showed it; the only code
that opened that line was the check confirming somebody had moved it. It was a
counter kept for its own sake.

And because it was a single line that every visible change had to edit, two
open pull requests could not both be right. The second to merge had to rebase
and pick a new number, so a queue of five had to be merged in an order, in
lockstep, each one invalidating the rest. That is the shape of every
monotonic counter stored in a file that concurrent branches write.

Both go away when the deploy works it out. `next_version` in
scripts/next_version.py asks git what changed since the last version tag,
`required` below turns that into 'none', 'patch' or 'minor', and `bump`
applies it. A pull request carries no version at all, so there is nothing to
conflict over and no order to merge in.

A person who decides the site has reached 2.0.0 pushes that tag by hand. The
deploy reads the latest tag as its starting point, so a tag placed deliberately
is simply where counting continues from - the override needs no code and cannot
drift from the thing it overrides.

One step per deploy, not per commit, and the diff is measured from the last
tag rather than from the previous commit. So a push that lands several merges
at once, or a deploy that was skipped because the output was identical, still
moves the number exactly once and never loses a change that happened in
between.

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

#: A version tag, and nothing else that might be tagged. The deploy searches
#: the tags with this, so a tag like `split-safety-e806689` - which is in this
#: repository - is not mistaken for a version to count on from.
TAG = re.compile(r'^(\d+)\.(\d+)\.(\d+)$')

#: Where counting starts when there is no version tag yet. 1.0.0 rather than a
#: number worked backwards from the thirty-six tools already here, because a
#: version is a promise about what happens next and inventing a history for it
#: would be neither true nor useful.
FIRST = (1, 0, 0)


def parse(tag):
    """A version tag as three numbers, or None if it is not one.

    None rather than an exception: this is asked of every tag in the
    repository, and most of them being something else is normal.
    """
    found = TAG.match((tag or '').strip())
    return tuple(int(part) for part in found.groups()) if found else None


def latest(tags):
    """The highest version among `tags`, or None if there is not one yet.

    Highest rather than most recent. Tags are not ordered by their names and a
    deploy that read the newest-looking one would count on from whichever tag
    happened to be pushed last - including one pushed by hand to correct a
    mistake, which is exactly the case that must not be undone.
    """
    versions = [v for v in (parse(tag) for tag in tags) if v]
    return max(versions) if versions else None


def bump(current, need):
    """The version after `need` is applied to `current`.

    Returns `current` unchanged for 'none', so the caller can compare and
    learn that there is nothing to tag without a second rule about it.
    """
    if need == 'none':
        return current
    if need == 'minor':
        return (current[0], current[1] + 1, 0)
    return (current[0], current[1], current[2] + 1)


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


def dotted(numbers):
    """The three numbers back as they are written: 1.0.0.

    The name a tag is given, so it is the one place the spelling is decided
    and `parse` above reads back exactly what this writes.
    """
    return '.'.join(str(part) for part in numbers)


def explain(before, after, need, tools):
    """Why the version moved, for the tag's own message and the run's summary.

    A tag whose message is only its own number says nothing a reader did not
    already have. This says which of the three rules fired, and names the
    tools when it was a new one - the answer to "why is this 1.3.0 and not
    1.2.8" being the thing somebody actually wants from a release page.
    """
    if need == 'minor':
        return (f'{dotted(before)} -> {dotted(after)}: a new tool '
                f'({", ".join(tools)}).')
    if need == 'patch':
        return (f'{dotted(before)} -> {dotted(after)}: a change a visitor '
                f'could notice.')
    return (f'{dotted(before)} stands: nothing here reaches a page.')
