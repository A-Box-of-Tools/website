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
The one exit code other than 0 is for the one question it cannot answer
honestly, described in the last section below.

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

WHY IT WILL NOT NAME THE FIRST VERSION ON A CHECKOUT THAT CANNOT SEE ANY

A checkout with no tags looks exactly like a repository that has never been
tagged, and the deploy runs on a shallow checkout that has to fetch its tags
on purpose. For a week that fetch was silently doing nothing, and this script
proposed 1.0.0 on every deploy; the workflow found 1.0.0 already on the remote,
took that for a rerun, and exited 0 - so the version stood still through a
hundred and seventy-seven commits and five new tools. Now, before naming the
first version, the script asks origin whether it already holds one. If it
does, the answer is a sentence on stderr and exit code 1, because a deploy
that cannot measure must say so rather than measure from nothing. A
repository with no remote at all - a local experiment, the tests - is still
allowed its first version.
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


def remote_versions():
    """The tag names origin holds, or None when there is no origin to ask.

    Asked only when this checkout has no version tag, to tell "never tagged"
    from "cannot see the tags". An annotated tag lists twice in ls-remote,
    once as itself and once peeled to its commit with `^{}` on the end; the
    peeled line names the same tag and is dropped.
    """
    if 'origin' not in git('remote').split():
        return None
    names = []
    for line in git('ls-remote', '--tags', 'origin').splitlines():
        if 'refs/tags/' not in line:
            continue
        name = line.split('refs/tags/', 1)[1]
        if not name.endswith('^{}'):
            names.append(name)
    return names


def main(argv):
    head = argv[1] if len(argv) > 1 else 'HEAD'

    current = rule.latest(git('tag', '--list').splitlines())
    if current is None:
        elsewhere = remote_versions()
        held = rule.latest(elsewhere) if elsewhere else None
        if held is not None:
            # Not a first deploy: a checkout that did not fetch its tags. The
            # workflow would find the first version already on the remote,
            # call that a rerun and exit 0, which is how the version stood
            # still for a week - so this is the one answer that is an error.
            print(f'No version tag in this checkout, but origin holds '
                  f'{rule.dotted(held)}. The tags were not fetched, so there '
                  f'is nothing to measure from; fetch them and ask again.',
                  file=sys.stderr)
            return 1
        # Nothing has ever been tagged, anywhere, so there is no span to
        # measure and nothing to compare against. The first deploy names the
        # starting point rather than trying to work out what came before it.
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
