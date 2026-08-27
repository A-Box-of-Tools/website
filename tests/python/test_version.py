"""
The version rule, and the cases it is easy to get wrong.

A presubmit that is itself wrong is worse than no presubmit: it either blocks
work that was fine or waves through the thing it was written to catch, and in
both cases the next person's instinct is to stop believing it. So the rule is
a handful of pure functions and this file exercises them directly, rather than
leaving the only test of the logic to be whether a pull request happened to go
red.
"""

import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from buildlib import version


class ReadingTheVersion(unittest.TestCase):
    def test_reads_three_numbers(self):
        self.assertEqual(version.read('version = "1.4.9"\n'), (1, 4, 9))

    def test_finds_it_among_other_settings(self):
        toml = 'name = "abox"\n# a comment\nversion = "2.0.1"\nother = 3\n'
        self.assertEqual(version.read(toml), (2, 0, 1))

    def test_refuses_a_file_without_one(self):
        # Quietly assuming a version would pass every pull request that
        # deleted it, which is the one change most worth catching.
        with self.assertRaises(ValueError):
            version.read('name = "abox"\n')

    def test_refuses_a_version_that_is_not_three_numbers(self):
        with self.assertRaises(ValueError):
            version.read('version = "1.2"\n')


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


class WhetherTheMoveIsEnough(unittest.TestCase):
    def test_a_patch_satisfies_a_patch(self):
        self.assertTrue(version.satisfies((1, 0, 0), (1, 0, 1), 'patch'))

    def test_standing_still_does_not(self):
        self.assertFalse(version.satisfies((1, 0, 0), (1, 0, 0), 'patch'))

    def test_going_backwards_does_not(self):
        self.assertFalse(version.satisfies((1, 0, 1), (1, 0, 0), 'patch'))

    def test_a_minor_is_more_than_enough_for_a_patch(self):
        self.assertTrue(version.satisfies((1, 0, 0), (1, 1, 0), 'patch'))

    def test_a_minor_satisfies_a_minor(self):
        self.assertTrue(version.satisfies((1, 0, 4), (1, 1, 0), 'minor'))

    def test_a_patch_does_not_satisfy_a_new_tool(self):
        self.assertFalse(version.satisfies((1, 0, 0), (1, 0, 1), 'minor'))

    def test_a_minor_that_keeps_the_old_patch_count_does_not(self):
        # 1.1.5 is a minor bump that carried a patch number belonging to the
        # version before it, which makes the last digit mean nothing.
        self.assertFalse(version.satisfies((1, 0, 5), (1, 1, 5), 'minor'))

    def test_a_major_satisfies_a_new_tool_when_it_resets(self):
        self.assertTrue(version.satisfies((1, 4, 2), (2, 0, 0), 'minor'))

    def test_a_major_that_does_not_reset_does_not(self):
        self.assertFalse(version.satisfies((1, 4, 2), (2, 1, 0), 'minor'))

    def test_nothing_required_allows_standing_still(self):
        self.assertTrue(version.satisfies((1, 0, 0), (1, 0, 0), 'none'))

    def test_nothing_required_still_forbids_going_backwards(self):
        self.assertFalse(version.satisfies((1, 0, 1), (1, 0, 0), 'none'))


class TheMessage(unittest.TestCase):
    def test_a_new_tool_is_told_the_number_to_use(self):
        said = version.explain('minor', (1, 3, 7), (1, 3, 8), ['sprite-sheet'])
        self.assertIn('sprite-sheet', said)
        self.assertIn('1.4.0', said)
        self.assertIn('1.3.8', said)

    def test_a_visible_change_is_told_the_number_to_use(self):
        said = version.explain('patch', (1, 3, 7), (1, 3, 7), [])
        self.assertIn('1.3.8', said)


if __name__ == '__main__':
    unittest.main()
