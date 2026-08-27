"""
The version rule, and the cases it is easy to get wrong.

The deploy decides the version now, and a deploy that decided it wrongly would
put a number on a release nobody chose - or, worse, quietly stop moving it at
all, which looks exactly like a repository where nothing has shipped. So the
rule is a handful of pure functions and this file exercises them directly,
rather than leaving the only test of the logic to be whether a deploy happened
to produce a sensible tag.
"""

import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from buildlib import version


class ReadingATag(unittest.TestCase):
    def test_a_version_tag_is_three_numbers(self):
        self.assertEqual(version.parse('1.4.9'), (1, 4, 9))
        self.assertEqual(version.parse(' 2.0.1 '), (2, 0, 1))

    def test_anything_else_is_not_a_version(self):
        # This repository really does carry `split-safety-e80668985`, and a
        # deploy that counted on from it would have nowhere to go.
        for tag in ('split-safety-e80668985', 'v1.0.0', '1.2', '1.2.3.4', ''):
            with self.subTest(tag=tag):
                self.assertIsNone(version.parse(tag))


class TheLatestTag(unittest.TestCase):
    def test_it_is_the_highest_and_not_the_last(self):
        # Tags are unordered, and one pushed by hand to correct a mistake is
        # exactly the case that must not be undone by the next deploy.
        self.assertEqual(
            version.latest(['1.0.9', '1.2.0', '1.0.10', 'nightly']), (1, 2, 0))

    def test_numbers_compare_as_numbers(self):
        self.assertEqual(version.latest(['1.0.9', '1.0.10']), (1, 0, 10))

    def test_no_version_tags_at_all(self):
        self.assertIsNone(version.latest(['split-safety-e80668985', 'dist']))
        self.assertIsNone(version.latest([]))


class MovingTheVersion(unittest.TestCase):
    def test_a_patch_moves_the_last_number(self):
        self.assertEqual(version.bump((1, 2, 3), 'patch'), (1, 2, 4))

    def test_a_minor_moves_the_middle_and_zeroes_the_last(self):
        self.assertEqual(version.bump((1, 2, 3), 'minor'), (1, 3, 0))

    def test_none_leaves_it_exactly_where_it_was(self):
        # The caller compares the two to learn there is nothing to tag, so
        # this has to be equal and not merely close.
        self.assertEqual(version.bump((1, 2, 3), 'none'), (1, 2, 3))


class WhatAVisitorCanSee(unittest.TestCase):
    def test_the_site_itself_is_visible(self):
        for path in ('tools/resize-image/body.html',
                     'templates/tool.html',
                     'shared/site.css',
                     'locales/de/tools/resize-image.html',
                     'config/site.toml'):
            self.assertTrue(version.visible(path), path)

    def test_the_build_counts_as_visible(self):
        # open_links_elsewhere changed every link on every tool page and lived
        # in build.py alone. A rule that called the build invisible would have
        # let that through without a digit.
        self.assertTrue(version.visible('build.py'))
        self.assertTrue(version.visible('buildlib/site.py'))

    def test_the_scaffolding_is_not(self):
        for path in ('tests/python/test_build.py',
                     'tests/js/split-gif-sheet.test.js',
                     '.github/workflows/build.yml',
                     'docs/deploying.md',
                     '.claude/skills/tool-development/SKILL.md',
                     'workers/rendezvous/worker.js',
                     'README.md',
                     'CLAUDE.md'):
            self.assertFalse(version.visible(path), path)


class SpottingANewTool(unittest.TestCase):
    def test_an_added_tool_toml_is_a_new_tool(self):
        self.assertEqual(
            version.new_tools(['tools/sprite-sheet/tool.toml',
                               'tools/sprite-sheet/body.html']),
            ['sprite-sheet'])

    def test_editing_an_existing_one_is_not(self):
        # The list passed in is what was ADDED, so an edit never reaches here -
        # but the distinction is the whole minor-versus-patch decision and is
        # worth stating in a test rather than only in a comment.
        self.assertEqual(version.new_tools([]), [])

    def test_a_tool_file_that_is_not_the_toml_is_not_a_new_tool(self):
        self.assertEqual(version.new_tools(['tools/resize-image/styles.css']), [])

    def test_several_tools_at_once(self):
        self.assertEqual(
            version.new_tools(['tools/b/tool.toml', 'tools/a/tool.toml']),
            ['a', 'b'])


class WhatIsRequired(unittest.TestCase):
    def test_a_new_tool_asks_for_a_minor(self):
        self.assertEqual(
            version.required(['tools/new-thing/tool.toml'], ['tools/new-thing/tool.toml']),
            'minor')

    def test_a_visible_change_asks_for_a_patch(self):
        self.assertEqual(version.required(['shared/site.css'], []), 'patch')

    def test_tests_alone_ask_for_nothing(self):
        self.assertEqual(
            version.required(['tests/python/test_build.py', '.github/workflows/build.yml'], []),
            'none')

    def test_a_new_tool_wins_over_a_patch(self):
        # A pull request that adds a tool also touches the hub, the sitemap and
        # a stylesheet. The tool is the bigger fact.
        self.assertEqual(
            version.required(['tools/x/tool.toml', 'shared/site.css'], ['tools/x/tool.toml']),
            'minor')


class TheMessage(unittest.TestCase):
    """What the tag and the release page say. A tag whose message is only its
    own number tells a reader nothing they did not already have."""

    def test_a_new_tool_is_named(self):
        said = version.explain((1, 3, 7), (1, 4, 0), 'minor', ['sprite-sheet'])
        self.assertIn('sprite-sheet', said)
        self.assertIn('1.3.7', said)
        self.assertIn('1.4.0', said)

    def test_a_visible_change_says_so(self):
        said = version.explain((1, 3, 7), (1, 3, 8), 'patch', [])
        self.assertIn('1.3.8', said)
        self.assertIn('notice', said)

    def test_standing_still_says_why_it_stood(self):
        said = version.explain((1, 3, 7), (1, 3, 7), 'none', [])
        self.assertIn('1.3.7', said)
        self.assertIn('page', said)


class WritingTheVersionBack(unittest.TestCase):
    """`dotted` names the tag, so it decides the spelling `parse` has to read
    back. A tag written one way and looked up another would be a version
    nobody can find."""

    def test_three_numbers_come_back_as_they_are_written(self):
        self.assertEqual(version.dotted((1, 0, 0)), '1.0.0')
        self.assertEqual(version.dotted((0, 12, 30)), '0.12.30')

    def test_it_round_trips_with_parse(self):
        for numbers in ((1, 0, 0), (2, 11, 5), (1, 0, 10)):
            with self.subTest(version=numbers):
                self.assertEqual(version.parse(version.dotted(numbers)), numbers)

    def test_what_bump_produces_is_always_a_readable_tag(self):
        # The deploy tags whatever bump returns, so anything it can produce
        # has to survive being read back on the next deploy.
        for need in ('patch', 'minor', 'none'):
            with self.subTest(need=need):
                nxt = version.bump((1, 9, 9), need)
                self.assertEqual(version.parse(version.dotted(nxt)), nxt)


class TheCheckoutTheDeployRunsOn(unittest.TestCase):
    """The rule above is pure, and the deploy still got the version wrong.

    Not because the arithmetic failed. Because the checkout it runs on carried
    no tags: `git tag --list` came back empty, `latest` returned None, and
    next_version.py took its "nothing has ever been tagged" branch and proposed
    FIRST. The remote has held 1.0.0 since the day the scheme started, so every
    push was rejected - nine deploys in a row, each failing after the site was
    already live and taking the IndexNow submission down with it.

    Nothing in the rule could have caught that, because the rule was right. The
    wrong thing was the ground it stood on, and the only place that is written
    down is the workflow.

    Read as text rather than parsed. The test job installs Python and Node and
    nothing else, so there is no YAML parser here to reach for - and the
    alternative to a crude assertion is the one the workflow's own comments
    warn about: a decision that can only be tested by opening a pull request
    against it.
    """

    @classmethod
    def setUpClass(cls):
        text = (ROOT / '.github' / 'workflows' / 'build.yml').read_text(
            encoding='utf-8')
        # The build job, and not the test job above it: both check out, and
        # only one of them works out a version.
        head, sep, tail = text.partition('\n  build:\n')
        assert sep, 'build.yml has no build job'
        cls.build = tail

    def test_it_asks_for_the_tags(self):
        # Without this the version is worked out on a checkout that cannot see
        # a single tag, and the answer is always FIRST.
        checkout = self.build.partition('actions/checkout')[2]
        self.assertIn('fetch-tags: true', checkout.partition('- name:')[0])

    def test_the_tag_guard_asks_the_remote(self):
        # A local `git rev-parse refs/tags/...` is worth nothing on a checkout
        # with no tags, which is exactly the case it existed to survive: the
        # guard and the failure were blind to the same fact.
        self.assertIn('git ls-remote --exit-code --tags origin', self.build)
        self.assertNotIn('git rev-parse -q --verify "refs/tags/$version"',
                         self.build)

    def test_indexnow_does_not_ride_on_the_tag_step(self):
        # `continue-on-error` stops IndexNow failing the deploy. It does not
        # stop IndexNow being SKIPPED when an earlier step fails, which is how
        # nine deploys went out with no search engine told about any of them.
        indexnow = self.build.partition('Tell IndexNow what changed')[2]
        condition = indexnow.partition('run:')[0]
        self.assertIn('!cancelled()', condition)
        self.assertIn("steps.publish.outcome == 'success'", condition)


if __name__ == '__main__':
    unittest.main()
