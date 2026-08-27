"""
Comparing a fresh build with the branch that is actually being served.

WHY THIS EXISTS

The whole claim of this site is that a reader can check it: the sources are
here, the build is one command with nothing to install, and the output is
committed to a branch anybody can look at. `python build.py --check` is the
command that closes that loop - build it, then diff it, file by file, against
the `dist` branch GitHub Pages serves. If they differ, the deployed site is not
what this repository says it is.

WHY IT COMPUTES GIT'S OWN HASHES

Asking `git hash-object` once per file is a process per file over ten thousand
files. `blob_id` computes the same id in-process from the rule Git uses -
sha1 of "blob <length>\0" and the bytes - and there is a test that holds it to
agreeing with `git hash-object` on a file full of mixed line endings, because
an id that disagreed would make the comparison silently compare nothing.

WHY IT IS NOT IN build.py

It runs after a build rather than during one, it is reached only by a flag, and
nothing else in the build calls it. Keeping it beside the page builders meant
that a file already long enough to be awkward carried eighty lines that only
run when somebody is verifying a deploy.
"""

import hashlib
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def check_against_branch(out, branch='dist'):
    """Compare a fresh build with what is committed on the dist branch. This is
    the command the pages point at: it answers "is the deployed site really a
    build of these sources?", which matters more now that what is served is
    minified and no longer pleasant to read straight off.

    A fresh clone has the branch only as origin/dist, so try that too rather
    than shrugging and reporting success.
    """
    for ref_name in (branch, f'origin/{branch}'):
        # utf-8 for the same reason as the call in compare() below. This one
        # reads back a hex id and would survive any codec, but it captures
        # git's stderr too, and a git that has been translated writes that in
        # whatever it likes.
        found = subprocess.run(['git', 'rev-parse', '--verify', f'{ref_name}^{{tree}}'],
                               capture_output=True, encoding='utf-8', cwd=ROOT)
        if found.returncode == 0:
            branch = ref_name
            break
    else:
        print(f'\n  no {branch} branch here to check against '
              f'(try: git fetch origin {branch})', file=sys.stderr)
        return 0

    differences = compare(out, branch)
    if differences:
        print(f'\n  {branch} is not this build ({len(differences)} files differ):',
              file=sys.stderr)
        for name in differences[:20]:
            print(f'    {name}', file=sys.stderr)
        if len(differences) > 20:
            print(f'    ... and {len(differences) - 20} more', file=sys.stderr)
        return 1
    print(f'\n  {branch} matches a fresh build of these sources')
    return 0


def compare(built, branch):
    """Which files differ between the build and a branch, by content.

    Read out of the object store rather than checked out into a worktree.
    Checking out runs the files through Git's end-of-line filters, and on a
    machine with core.autocrlf on that rewrites every text file on the way to
    disk - which made this report all sixty-odd files as changed when not one
    of them was. A blob id is the bytes as committed, and nothing can filter
    it on the way past.
    """
    # encoding rather than text=True, and this is not a style choice.
    # text=True decodes with the machine's locale encoding, and this site has
    # 1,512 paths that are not ASCII - the translated slugs, in Arabic,
    # Japanese and Chinese. On a Windows install whose locale is not UTF-8
    # (cp936 is a common one) those bytes cannot be decoded, the reader thread
    # dies, and `stdout` arrives as None. What reached the person running
    # --check was "AttributeError: 'NoneType' object has no attribute 'split'",
    # which names neither git nor an encoding. Git writes paths as UTF-8, so
    # that is what this reads them as, on every machine.
    listing = subprocess.run(['git', 'ls-tree', '-r', '-z', branch],
                             capture_output=True, encoding='utf-8', cwd=ROOT,
                             check=True)
    committed = {}
    for entry in listing.stdout.split('\0'):
        if not entry:
            continue
        info, path = entry.split('\t', 1)
        committed[path] = info.split()[2]

    fresh = {path.relative_to(built).as_posix(): blob_id(path)
             for path in built.rglob('*') if path.is_file()}

    names = sorted(set(committed) | set(fresh))
    return [name for name in names if committed.get(name) != fresh.get(name)]


def blob_id(path):
    """The id Git would give this file's contents: sha1 over the bytes with
    Git's blob header in front. The same rule Git uses, so the two are
    comparable without shelling out once per file."""
    data = path.read_bytes()
    return hashlib.sha1(b'blob %d\0' % len(data) + data).hexdigest()
