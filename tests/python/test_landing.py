"""
buildlib/landing.py - the page each of a tool's rules has to itself.

The pages are generated, forty-nine to a language, and nobody reads all of
them. So the ways one can be quietly wrong are held here rather than left to
be noticed: a phrase resolved differently from how the tool resolves it, a
name escaped twice, a blank left unfilled in a title, and a native name glued
on to a word that already is one.

`resolve` is shared/js/phrases.js over again in Python, which is a second
implementation of one rule and would ordinarily be the thing to avoid. It is
four lines, the build has no JavaScript in it on purpose, and the cases below
are phrase()'s own: a key that is not there comes back as itself, a blank that
is not passed stays a blank, and white space folds.
"""

import unittest
from pathlib import Path

from buildlib import landing
from buildlib.site import ConfigError, load_toml

ROOT = Path(__file__).resolve().parents[2]

TABLE = {
    'print.size': '&#x2066;{width} x {height}&#x2069; mm at {dpi} dpi',
    'band.mm': '{range} ({min}&ndash;{max} mm)',
    'band.range': '{min} to {max}',
    'name.native': '{name} ({native})',
    'source.line': 'Transcribed from {authority} &mdash; {document}.',
    'country.de': 'Germany',
    'doc.passport': 'Passport',
}


class ReadingThePhrases(unittest.TestCase):
    def test_white_space_folds_the_way_phrase_folds_it(self):
        body = ('<div id="phrases" hidden>\n'
                '  <span data-phrase="a">one\n      two</span>\n'
                '  <span data-phrase="b">three</span>\n</div>')
        self.assertEqual(landing.phrases(body), {'a': 'one two', 'b': 'three'})

    def test_a_phrase_with_markup_in_it_is_refused(self):
        # It would go into a <title> and a description as well as on the page.
        with self.assertRaises(ConfigError):
            landing.phrases('<span data-phrase="a">one <b>two</b></span>')


class Resolving(unittest.TestCase):
    def test_a_sentence_takes_its_values(self):
        asked = {'key': 'print.size', 'values': {'width': '35', 'height': '45', 'dpi': 300}}
        self.assertEqual(landing.resolve(asked, TABLE),
                         '&#x2066;35 x 45&#x2069; mm at 300 dpi')

    def test_a_value_may_be_another_question(self):
        asked = {'key': 'band.mm', 'values': {
            'range': {'key': 'band.range', 'values': {'min': '70%', 'max': '80%'}},
            'min': '32', 'max': '36'}}
        self.assertEqual(landing.resolve(asked, TABLE), '70% to 80% (32&ndash;36 mm)')

    def test_a_key_the_table_lacks_comes_back_as_itself_and_escaped(self):
        # How a citation passes through: an authority's name is not a phrase.
        asked = {'key': 'source.line', 'values': {
            'authority': {'key': 'Ministry of Works & Housing'},
            'document': {'key': 'Form <7>'}}}
        self.assertEqual(
            landing.resolve(asked, TABLE),
            'Transcribed from Ministry of Works &amp; Housing &mdash; Form &lt;7&gt;.')

    def test_a_blank_nobody_passed_stays_a_blank(self):
        self.assertEqual(landing.resolve({'key': 'band.range', 'values': {'min': '1'}}, TABLE),
                         '1 to {max}')

    def test_what_has_been_resolved_is_not_escaped_again(self):
        once = landing.resolve({'key': 'Ministry of Works & Housing'}, TABLE)
        self.assertEqual(landing.resolve(once, TABLE), 'Ministry of Works &amp; Housing')


class TheNativeName(unittest.TestCase):
    def test_it_follows_the_name_in_brackets(self):
        name = landing.resolve({'key': 'country.de'}, TABLE)
        self.assertEqual(landing.with_native(name, 'Deutschland', TABLE),
                         'Germany (Deutschland)')

    def test_a_name_that_already_is_the_native_word_is_left_alone(self):
        # specs.js's rule is `includes`, not `!==`, or the German page reads
        # "Reisepass und Personalausweis (Reisepass)".
        name = landing.Markup('Reisepass und Personalausweis')
        self.assertEqual(landing.with_native(name, 'Reisepass', TABLE), name)

    def test_no_native_name_is_no_brackets(self):
        name = landing.Markup('Schengen area')
        self.assertEqual(landing.with_native(name, None, TABLE), name)


class FillingAPattern(unittest.TestCase):
    def test_it_fills_every_name(self):
        self.assertEqual(landing.fill('{document}, {country}',
                                      {'document': 'Visa', 'country': 'India'}),
                         'Visa, India')

    def test_a_name_the_page_cannot_supply_is_an_error(self):
        # "{county}" would otherwise ship in forty-nine titles.
        with self.assertRaises(ConfigError):
            landing.fill('{document}, {county}', {'document': 'Visa', 'country': 'India'})


class TheRealPages(unittest.TestCase):
    """id-photo's own, in English: the file, the table and the body as they are."""

    @classmethod
    def setUpClass(cls):
        folder = ROOT / 'tools' / 'id-photo'
        cls.tool = load_toml(folder / 'tool.toml')
        cls.tool['dir'] = folder
        cls.entries = landing.load(cls.tool)
        cls.table = landing.phrases((folder / 'body.html').read_text(encoding='utf-8'))
        cls.pages = landing.pages(cls.tool, cls.entries, cls.table)

    def test_every_key_a_page_needs_is_a_phrase_the_body_defines(self):
        """A key with no phrase is printed as itself - `spec.xx.note2`, on the
        page, in a title - and a citation is the one thing allowed to be."""
        def keys(asked):
            if isinstance(asked, dict):
                yield asked['key']
                for value in asked.get('values', {}).values():
                    yield from keys(value)

        for entry in self.entries:
            cited = {entry['authority'],
                     entry['source']['values']['document']['key']}
            needed = {entry['country'], entry['document'], *entry['notes']}
            for asked in [entry['size'], entry['background'], entry['source'],
                          *[cell for row in entry['facts'] for cell in row]]:
                needed.update(keys(asked))
            missing = sorted(needed - cited - set(self.table))
            self.assertEqual(missing, [], entry['id'])

    def test_no_page_is_left_with_a_blank_or_a_bare_key(self):
        for page in self.pages:
            said = ' '.join([*page['text'].values(), page['source'], page['size'],
                             *page['notes'],
                             *[cell for fact in page['facts'] for cell in fact.values()]])
            with self.subTest(page=page['id']):
                self.assertNotRegex(said, r'\{\w+\}')
                self.assertNotRegex(said, r'\b(spec|doc|country|facts|bg)\.[a-z0-9.-]+')

    def test_titles_are_all_different(self):
        titles = [page['text']['title'] for page in self.pages]
        self.assertEqual(len(titles), len(set(titles)))

    def test_siblings_are_the_same_country_and_never_the_page_itself(self):
        by_id = {page['id']: page for page in self.pages}
        others = {other['id'] for other in by_id['us-passport']['siblings']}
        self.assertEqual(others, {'us-visa', 'us-dv'})
        # A country with one rule has nobody to point at. The Netherlands, since
        # its one entry already covers the passport, the card and the licence.
        self.assertEqual(by_id['nl-passport']['siblings'], [])

    def test_the_index_groups_them_by_country_in_the_rulebooks_order(self):
        groups = landing.index(self.pages)
        listed = [page['id'] for group in groups for page in group['pages']]
        self.assertEqual(sorted(listed), sorted(page['id'] for page in self.pages))
        self.assertEqual(len({group['country'] for group in groups}), len(groups))


if __name__ == '__main__':
    unittest.main()
