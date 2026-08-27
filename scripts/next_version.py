"""
What the next version tag should be, or nothing at all.

Run by the deploy, after it has published. Asks git for the highest version
tag, asks git what has changed since that tag, and turns the two into an
answer using the rule in buildlib/version.py:

    python scripts/next_version.py [<head>]

Prints the version to tag and its reason, as two lines:

    1.0.3
    1.0.2 -> 1.0.3: a change a visitor could notice.

and prints nothing at all - exiting 0 - when the rule says the version does
not move. "Nothing to do" is the ordinary case, not a failure: a change to the
tests, to CI or to the documentation is required to leave the version alone.

WHY IT MEASURES FROM THE LAST TAG

Rather than from the previous commit. A push can land more than one merge at
once, and a deploy is skipped entirely when the built output is identical to
what is already published - so "since the last commit" would lose whatever
happened in the gap. Since the last TAG is the same question asked in a way
that cannot lose anything: every commit between the version that was tagged
and the one being deployed is counted exactly once.

WHY IT DOES NOT CREATE THE TAG

Because a script that prints an answer can be run by anybody, on any checkout,
to see what the next deploy will do - and one that also pushes a ref cannot.
The workflow does the pushing, where the permission to do it is granted and
visible.
"""

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from buildlib import version as rule


def git(*args):
    done = subprocess.run(
        ['git', *args], cwd=ROOT, capture_output=True, encoding='utf-8')
    if done.returncode != 0:
        raise RuntimeError(f'git {" ".join(args)} failed: {done.stderr.strip()}')
    return done.stdout


def changed_since(ref, head):
    """Every path that moved between `ref` and `head`, and the ones added.

    Two dots, not three. The three-dot form asks what changed since the two
    diverged, which is the right question about a pull request and the wrong
    one here: a tag is an ancestor of what is being deployed, not a branch
    beside it, and there is no merge base to prefer.
    """
    span = f'{ref}..{head}'
    everything = [line for line in git('diff', '--name-only', span).splitlines() if line]
    added = [line for line in
             git('diff', '--name-only', '--diff-filter=A', span).splitlines() if line]
    return everything, added


def main(argv):
    head = argv[1] if len(argv) > 1 else 'HEAD'

    current = rule.latest(git('tag', '--list').splitlines())
    if current is None:
        # Nothing has ever been tagged, so there is no span to measure and
        # nothing to compare against. The first deploy names the starting
        # point rather than trying to work out what came before it.
        print(rule.dotted(rule.FIRST))
        print(f'{rule.dotted(rule.FIRST)}: the first version.')
        return 0

    changed, added = changed_since(rule.dotted(current), head)
    need = rule.required(changed, added)
    following = rule.bump(current, need)

    if following == current:
        # Said on stderr so that stdout stays empty and the workflow can test
        # it with nothing more than [ -s ], while a person still gets told.
        print(rule.explain(current, following, need, []), file=sys.stderr)
        return 0

    print(rule.dotted(following))
    print(rule.explain(current, following, need, rule.new_tools(added)))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
