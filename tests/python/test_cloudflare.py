"""
cloudflare/redirects.py, and the file it writes.

The generator is small, and what can go wrong with it is not inside it. A slug
moves in config/site.toml, the build writes a stub at the old address the same
afternoon, and cloudflare/redirects.json goes on describing last month - until
somebody applies it, or never does. Nothing about that looks broken from any
page. So the first test here is the one that matters: the committed file is
exactly what the generator would write today. The rest hold the decisions the
top of that script argues for, so that changing one is a choice and not a slip.

Whether the rules name the addresses the build really writes stubs at is a
question about the build, and test_build.py asks it of a built site.
"""

import importlib.util
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def load_generator():
    # cloudflare/ is a folder of things applied by hand, not a package.
    spec = importlib.util.spec_from_file_location(
        'cloudflare_redirects', ROOT / 'cloudflare' / 'redirects.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


redirects = load_generator()

SITE = {
    'domain': 'https://example.test/',
    'redirects': {'old-a': 'new', 'old-b': 'new', 'older': 'other', 'gone': 'unbuilt'},
}
TOOLS = {'new', 'other'}


def locale(lang, slugs=None):
    return {'lang': lang, 'prefix': '' if lang == 'en' else f'{lang}/',
            'slugs': slugs or {}}


class TheCommittedFile(unittest.TestCase):
    def test_it_is_what_the_generator_would_write_today(self):
        payload, _ = redirects.current()
        self.assertEqual(
            redirects.OUTPUT.read_bytes(), redirects.rendered(payload),
            'cloudflare/redirects.json is stale: run python cloudflare/redirects.py '
            'and commit the result')

    def test_it_is_lf_and_ends_in_a_newline(self):
        raw = redirects.OUTPUT.read_bytes()
        self.assertNotIn(b'\r', raw)
        self.assertTrue(raw.endswith(b'}\n'))

    def test_it_fits_the_plan(self):
        rules = json.loads(redirects.OUTPUT.read_bytes())['rules']
        self.assertLessEqual(len(rules), redirects.BUDGET)
        refs = [rule['ref'] for rule in rules]
        self.assertEqual(len(refs), len(set(refs)), 'two rules share a ref')


class OneLanguage(unittest.TestCase):
    def test_addresses_are_grouped_by_where_they_lead(self):
        payload, _ = redirects.ruleset(SITE, [locale('en')], TOOLS)
        self.assertEqual(
            [rule['action_parameters']['from_value']['target_url']['value']
             for rule in payload['rules']],
            ['https://example.test/new/', 'https://example.test/other/'])

    def test_both_spellings_of_an_old_address_are_matched(self):
        # Without the bare one, /old-a reaches the origin, is sent to /old-a/
        # and only then redirected: a chain of two.
        payload, _ = redirects.ruleset(SITE, [locale('en')], TOOLS)
        self.assertEqual(
            payload['rules'][0]['expression'],
            'http.request.uri.path in {"/old-a" "/old-a/" "/old-b" "/old-b/"}')

    def test_every_rule_is_a_permanent_redirect_that_keeps_the_query(self):
        payload, _ = redirects.ruleset(SITE, [locale('en')], TOOLS)
        for rule in payload['rules']:
            with self.subTest(rule=rule['ref']):
                self.assertEqual(rule['action'], 'redirect')
                moved = rule['action_parameters']['from_value']
                self.assertEqual(moved['status_code'], 301)
                self.assertIs(moved['preserve_query_string'], True)

    def test_a_target_that_is_not_a_tool_gets_no_rule(self):
        # build_locale skips it too, so there is no stub and nothing moved.
        payload, _ = redirects.ruleset(SITE, [locale('en')], TOOLS)
        self.assertNotIn('unbuilt', json.dumps(payload))

    def test_a_language_that_kept_the_address_gets_no_rule_for_it(self):
        # The page at /xx/old-a/ is the tool itself. A rule there would
        # redirect a live page to its own address.
        kept = locale('xx', {'new': 'old-a'})
        payload, _ = redirects.ruleset(SITE, [kept], TOOLS)
        self.assertNotIn('"/xx/old-a"', payload['rules'][0]['expression'])
        self.assertIn('"/xx/old-b"', payload['rules'][0]['expression'])
        self.assertEqual(
            payload['rules'][0]['action_parameters']['from_value']['target_url']['value'],
            'https://example.test/xx/old-a/')

    def test_a_localized_address_is_percent_encoded_in_the_target(self):
        arabic = locale('ar', {'new': 'جديد'})
        payload, _ = redirects.ruleset(SITE, [arabic], TOOLS)
        self.assertEqual(
            payload['rules'][0]['action_parameters']['from_value']['target_url']['value'],
            'https://example.test/ar/%D8%AC%D8%AF%D9%8A%D8%AF/')


class TheBudget(unittest.TestCase):
    def test_languages_are_taken_whole_or_not_at_all(self):
        locales = [locale('en'), locale('zh'), locale('de')]
        payload, left_out = redirects.ruleset(SITE, locales, TOOLS, budget=5)
        self.assertEqual(len(payload['rules']), 4)
        self.assertEqual(left_out, ['de'])
        self.assertNotIn('/de/', json.dumps(payload))

    def test_the_languages_whose_addresses_were_live_come_first(self):
        # The site lists German before Chinese. What a 301 is worth does not.
        locales = [locale('en'), locale('de'), locale('zh')]
        payload, left_out = redirects.ruleset(SITE, locales, TOOLS, budget=5)
        self.assertEqual(left_out, ['de'])
        self.assertIn('/zh/', json.dumps(payload))

    def test_nothing_later_slips_in_past_a_language_that_did_not_fit(self):
        # German needs two rules and has one left. French kept one of the two
        # addresses, needs a single rule and would fit - and still waits its
        # turn, because the order is the order of what a rule is worth.
        french = locale('fr', {'other': 'older'})
        locales = [locale('en'), locale('de'), french]
        site = dict(SITE, redirects={'old-a': 'new', 'older': 'other'})
        payload, left_out = redirects.ruleset(site, locales, TOOLS, budget=3)
        self.assertEqual(len(payload['rules']), 2)
        self.assertEqual(left_out, ['de', 'fr'])


if __name__ == '__main__':
    unittest.main()
