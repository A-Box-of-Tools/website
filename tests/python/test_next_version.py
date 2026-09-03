"""
What the deploy will tag, and why.

buildlib/version.py holds the rule and is tested next door. This file tests
the part that stands between the rule and git: which tag it measures from,
which span it asks about, and what it prints - because the workflow decides
whether to tag anything at all by whether stdout is empty, and a script that
printed a reason on the wrong stream would tag every deploy.

There are two kinds of test here on purpose.

The first kind hands the script a fake git and reads what it decides. That is
where the awkward cases live - no tags at all, a version that does not move -
and a real repository would only make them slower to set up and no more
convincing.

The second kind builds an actual git repository, copies the script and the
rule into it, and runs it as the workflow does. That is what proves the
plumbing: that git is asked the questions it is meant to be asked, that
--diff-filter=A really does tell an added tool from an edited one, and that a
change two commits back is still counted.

Which of the two catches what is worth being exact about, because the first
draft of this comment had it backwards. The range - `..` against `...`, one
character apart and two different questions - is pinned by the FAKE git,
which can be asked what string it was handed. The real repository cannot tell
them apart at all: in a history with no branching the two forms mean the same
thing, and a mutation from one to the other leaves every test in the second
class passing. Checked, rather than assumed.
"""

import importlib.util
import io
import shutil
import subprocess
import sys
import tempfile
import unittest
from contextlib import redirect_stdout, redirect_stderr
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))


def load_script():
    """scripts/next_version.py, imported by path - it is not in a package."""
    spec = importlib.util.spec_from_file_location(
        'next_version', ROOT / 'scripts' / 'next_version.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class FakeGit:
    """Enough of git to answer the four questions the script asks."""

    def __init__(self, tags, changed=(), added=(), remote_tags=None):
        self.tags = list(tags)
        self.changed = list(changed)
        self.added = list(added)
        # None is a repository with no remote at all; a list is what origin
        # would answer, handed back in the shape ls-remote prints it.
        self.remote_tags = remote_tags
        self.spans = []

    def __call__(self, *args):
        if args[0] == 'tag':
            return '\n'.join(self.tags) + '\n'
        if args[0] == 'diff':
            self.spans.append(args[-1])
            if '--diff-filter=A' in args:
                return '\n'.join(self.added) + '\n'
            return '\n'.join(self.changed) + '\n'
        if args[0] == 'remote':
            return '' if self.remote_tags is None else 'origin\n'
        if args[0] == 'ls-remote':
            return ''.join(f'{"0" * 40}\trefs/tags/{name}\n' for name in self.remote_tags)
        raise AssertionError(f'the script asked git something unexpected: {args}')


def run(module, argv=('next_version.py',)):
    """Run main() and hand back what it printed, on both streams."""
    out, err = io.StringIO(), io.StringIO()
    with redirect_stdout(out), redirect_stderr(err):
        code = module.main(list(argv))
    return code, out.getvalue(), err.getvalue()


class WhatItDecides(unittest.TestCase):
    def setUp(self):
        self.module = load_script()

    def test_the_first_deploy_names_a_starting_point(self):
        # Nothing tagged yet and no remote to ask: there is no span to measure,
        # so there is nothing to work out and the answer is the first version
        # rather than an error.
        self.module.git = FakeGit(tags=[])
        code, out, _ = run(self.module)
        self.assertEqual(code, 0)
        self.assertEqual(out.splitlines()[0], '1.0.0')

    def test_a_checkout_that_cannot_see_the_tags_origin_holds_is_an_error(self):
        # No local tag but a version on the remote is not a first deploy; it is
        # a checkout that did not fetch its tags. Naming 1.0.0 here is what let
        # the version stand still for a week, so the answer is exit 1 with
        # nothing on stdout - the workflow must not tag anything from it.
        self.module.git = FakeGit(tags=[], remote_tags=['1.0.0', '1.0.2'])
        code, out, err = run(self.module)
        self.assertNotEqual(code, 0)
        self.assertEqual(out, '')
        self.assertIn('1.0.2', err)

    def test_a_remote_with_no_version_tag_still_allows_the_first(self):
        # Tags that are not versions do not make the remote a versioned one.
        self.module.git = FakeGit(tags=[], remote_tags=['split-safety-e80668985'])
        code, out, _ = run(self.module)
        self.assertEqual(code, 0)
        self.assertEqual(out.splitlines()[0], '1.0.0')

    def test_a_visible_change_moves_the_last_number(self):
        self.module.git = FakeGit(tags=['1.0.2'], changed=['shared/site.css'])
        code, out, _ = run(self.module)
        self.assertEqual(code, 0)
        self.assertEqual(out.splitlines()[0], '1.0.3')

    def test_a_new_tool_moves_the_middle_one(self):
        self.module.git = FakeGit(
            tags=['1.0.2'],
            changed=['tools/sprite-sheet/tool.toml', 'shared/site.css'],
            added=['tools/sprite-sheet/tool.toml'])
        code, out, _ = run(self.module)
        self.assertEqual(code, 0)
        self.assertEqual(out.splitlines()[0], '1.1.0')
        self.assertIn('sprite-sheet', out)

    def test_a_change_nobody_can_see_prints_nothing_at_all(self):
        # The workflow tests this with [ -s ], so the reason has to go to
        # stderr. A reason on stdout would tag every deploy with a filename.
        self.module.git = FakeGit(
            tags=['1.0.2'], changed=['tests/python/test_build.py', '.github/workflows/build.yml'])
        code, out, err = run(self.module)
        self.assertEqual(code, 0)
        self.assertEqual(out, '')
        self.assertNotEqual(err.strip(), '')

    def test_it_measures_from_the_highest_tag_not_the_last_listed(self):
        # git tag --list is alphabetical, so 1.10.0 sorts before 1.9.0 and the
        # last line is not the newest version.
        self.module.git = FakeGit(tags=['1.0.0', '1.10.0', '1.9.0'],
                                  changed=['shared/site.css'])
        code, out, _ = run(self.module)
        self.assertEqual(out.splitlines()[0], '1.10.1')

    def test_tags_that_are_not_versions_are_ignored(self):
        # This repository carries at least one - split-safety-e80668985 - and a
        # script that tried to read it as a version would fail on a real deploy
        # rather than in a test.
        self.module.git = FakeGit(
            tags=['1.0.2', 'split-safety-e80668985', 'v-something'],
            changed=['shared/site.css'])
        code, out, _ = run(self.module)
        self.assertEqual(out.splitlines()[0], '1.0.3')

    def test_it_measures_from_the_tag_to_the_head_it_was_given(self):
        fake = FakeGit(tags=['1.0.2'], changed=['shared/site.css'])
        self.module.git = fake
        run(self.module, argv=('next_version.py', 'deadbeef'))
        # Two dots: a tag is an ancestor of what is being deployed, not a
        # branch beside it. Three would ask what changed since they diverged,
        # which is a different question with a different answer.
        self.assertIn('1.0.2..deadbeef', fake.spans)
        self.assertNotIn('1.0.2...deadbeef', fake.spans)


class AgainstARealRepository(unittest.TestCase):
    """The plumbing, run the way the deploy runs it."""

    def setUp(self):
        self.dir = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.dir, ignore_errors=True)

        # The script derives its root from its own path, so it has to live
        # inside the repository under test.
        (self.dir / 'scripts').mkdir()
        shutil.copy(ROOT / 'scripts' / 'next_version.py', self.dir / 'scripts')
        shutil.copytree(ROOT / 'buildlib', self.dir / 'buildlib',
                        ignore=shutil.ignore_patterns('__pycache__'))

        self.git('init', '-q')
        self.git('config', 'user.email', 'qa@example.invalid')
        self.git('config', 'user.name', 'QA')
        self.write('shared/site.css', 'body { color: red }\n')
        self.git('add', '-A')
        self.git('commit', '-qm', 'first')

    def git(self, *args):
        subprocess.run(['git', *args], cwd=self.dir, check=True,
                       capture_output=True, encoding='utf-8')

    def write(self, path, text):
        target = self.dir / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(text, encoding='utf-8')

    def ask(self):
        done = subprocess.run(
            [sys.executable, str(self.dir / 'scripts' / 'next_version.py')],
            cwd=self.dir, capture_output=True, encoding='utf-8')
        return done.returncode, done.stdout, done.stderr

    def test_untagged_history_gets_the_first_version(self):
        code, out, _ = self.ask()
        self.assertEqual(code, 0)
        self.assertEqual(out.splitlines()[0], '1.0.0')

    def test_a_stylesheet_edit_since_the_tag_moves_the_last_number(self):
        self.git('tag', '1.0.0')
        self.write('shared/site.css', 'body { color: blue }\n')
        self.git('commit', '-qam', 'a colour')

        code, out, _ = self.ask()
        self.assertEqual(code, 0)
        self.assertEqual(out.splitlines()[0], '1.0.1')

    def test_a_new_tool_since_the_tag_moves_the_middle_one(self):
        self.git('tag', '1.0.0')
        self.write('tools/thing/tool.toml', 'slug = "thing"\n')
        self.git('add', '-A')
        self.git('commit', '-qm', 'a tool')

        code, out, _ = self.ask()
        self.assertEqual(out.splitlines()[0], '1.1.0')
        self.assertIn('thing', out)

    def test_tests_only_since_the_tag_says_nothing(self):
        self.git('tag', '1.0.0')
        self.write('tests/python/test_thing.py', '# nothing a visitor sees\n')
        self.git('add', '-A')
        self.git('commit', '-qm', 'a test')

        code, out, err = self.ask()
        self.assertEqual(code, 0)
        self.assertEqual(out, '')
        self.assertNotEqual(err.strip(), '')

    def test_everything_since_the_tag_counts_not_only_the_last_commit(self):
        # A push can land more than one merge, and a deploy is skipped when the
        # output is unchanged - so measuring from the previous commit would
        # lose whatever happened in the gap. Here the visible change is two
        # commits back, behind a commit that changes nothing anybody can see.
        self.git('tag', '1.0.0')
        self.write('shared/site.css', 'body { color: green }\n')
        self.git('commit', '-qam', 'the visible one')
        self.write('tests/python/test_thing.py', '# not visible\n')
        self.git('add', '-A')
        self.git('commit', '-qm', 'the invisible one')

        code, out, _ = self.ask()
        self.assertEqual(out.splitlines()[0], '1.0.1')

    def test_a_tag_that_is_not_a_version_does_not_confuse_it(self):
        self.git('tag', '1.0.0')
        self.git('tag', 'split-safety-e80668985')
        self.write('shared/site.css', 'body { color: black }\n')
        self.git('commit', '-qam', 'a colour')

        code, out, _ = self.ask()
        self.assertEqual(code, 0)
        self.assertEqual(out.splitlines()[0], '1.0.1')

    def test_a_clone_that_left_the_tags_behind_refuses_to_start_over(self):
        # The deploy's own failure, reproduced: an annotated version tag on the
        # remote, a shallow clone made without tags, and the script run inside
        # the clone. Annotated on purpose - ls-remote lists such a tag twice,
        # once peeled, and the script must count it once. The clone carries
        # the script and the rule from the commit, so nothing is copied in.
        self.git('tag', '-a', '1.0.0', '-m', 'the first version')
        clone = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, clone, ignore_errors=True)
        subprocess.run(['git', 'clone', '-q', '--no-tags', '--depth=1',
                        self.dir.as_uri(), str(clone)],
                       check=True, capture_output=True, encoding='utf-8')

        done = subprocess.run(
            [sys.executable, str(clone / 'scripts' / 'next_version.py')],
            cwd=clone, capture_output=True, encoding='utf-8')
        self.assertNotEqual(done.returncode, 0)
        self.assertEqual(done.stdout, '')
        self.assertIn('1.0.0', done.stderr)


if __name__ == '__main__':
    unittest.main()
