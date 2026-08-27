"""
The presubmit for the version rule.

Reads what a pull request changed, works out what the rule asks of it, and
compares that with what actually happened to config/site.toml's version. The
rule and every decision in it live in buildlib/version.py, which is unit
tested; this file is the part that talks to git and to the person reading the
log.

Usage:

    python scripts/check_version.py <base-sha> <head-sha>

Exits 0 when the rule is met, 1 when it is not, and 2 when it could not tell -
which is treated as a failure by the workflow, because "I could not work out
whether this is allowed" is not a reason to allow it.
"""

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from buildlib import version as rule

CONFIG = 'config/site.toml'


def git(*args):
    done = subprocess.run(
        ['git', *args], cwd=ROOT, capture_output=True, text=True, encoding='utf-8')
    if done.returncode != 0:
        raise RuntimeError(f'git {" ".join(args)} failed: {done.stderr.strip()}')
    return done.stdout


def changed(base, head):
    """Every path this change touches, and separately the ones it adds.

    --diff-filter=A is what tells a new tool from an edited one, and that
    distinction is the whole of the minor-versus-patch decision.
    """
    everything = [line for line in git('diff', '--name-only', f'{base}...{head}').splitlines() if line]
    added = [line for line in git('diff', '--name-only', '--diff-filter=A', f'{base}...{head}').splitlines() if line]
    return everything, added


def version_at(ref):
    return rule.read(git('show', f'{ref}:{CONFIG}'))


def main(argv):
    if len(argv) != 3:
        print(__doc__.strip())
        return 2

    base, head = argv[1], argv[2]

    try:
        paths, added = changed(base, head)
    except RuntimeError as why:
        print(f'::error::could not read what this change touched - {why}')
        return 2

    if not paths:
        print('Nothing changed; nothing to ask of the version.')
        return 0

    need = rule.required(paths, added)
    tools = rule.new_tools(added)

    if need == 'none':
        print('Nothing here a visitor could notice; the version may stay where it is.')

    try:
        before = version_at(base)
    except (RuntimeError, ValueError) as why:
        # The base having no version is not the author's fault - it happens on
        # the first pull request after this rule lands.
        print(f'::notice::no version to compare against on the base ({why}); '
              'nothing to enforce this time.')
        return 0

    try:
        after = version_at(head)
    except (RuntimeError, ValueError) as why:
        print(f'::error::{CONFIG} on this branch has no usable version - {why}')
        return 1

    if rule.satisfies(before, after, need):
        moved = '.'.join(str(n) for n in before) + ' -> ' + '.'.join(str(n) for n in after)
        if before == after:
            print(f'Version stays at {".".join(str(n) for n in after)}, which is allowed here.')
        else:
            print(f'Version {moved}: what the rule asks for.')
        return 0

    print(f'::error::{rule.explain(need, before, after, tools)}')
    return 1


if __name__ == '__main__':
    sys.exit(main(sys.argv))
