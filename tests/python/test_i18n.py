"""
What a locale may do, and what it may not.

The rules being checked here are the ones that fail quietly if they are wrong.
A locale that silently drops a key ships an English sentence inside a German
page; a locale that renames a slug onto another page's address ships a sitemap
advertising a URL that serves somebody else's content. Neither shows up in a
build log, and both show up in Search Console a fortnight later.
"""

import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

import build as buildmod
from buildlib import i18n
from buildlib.site import ConfigError

SITE = {
    'lang': 'en',
    'domain': 'https://example.test/',
    'guides': {'slug': 'guides', 'heading': 'Guides'},
    'roadmap': {'slug': 'roadmap', 'nav': 'Roadmap'},
    'ui': {
        'all_tools': 'All tools',
        # Named `tool` on purpose - see the regression test below.
        'tool': {'questions': 'Questions'},
    },
}


def locale(**over):
    base = {
        'lang': 'de', 'name': 'German', 'endonym': 'Deutsch', 'hreflang': 'de',
        'dir': 'ltr', 'complete': False, 'is_base': False, 'prefix': 'de/',
        'slugs': {}, 'site': SITE, 'tools': {}, 'pages': {}, 'bodies': {},
        'planned': {}, 'frame': [], 'debt': {},
    }
    base.update(over)
    return base


class Merging(unittest.TestCase):
    def merge(self, base, over, missing=None):
        return i18n.merge(base, over, 'test', missing if missing is not None else [],
                          'x')

    def test_a_translated_value_wins(self):
        self.assertEqual(self.merge({'a': 'one'}, {'a': 'eins'}), {'a': 'eins'})

    def test_an_untranslated_value_falls_back_and_is_recorded(self):
        missing = []
        merged = self.merge({'a': 'one', 'b': 'two'}, {'a': 'eins'}, missing)
        self.assertEqual(merged, {'a': 'eins', 'b': 'two'})
        self.assertEqual(missing, ['x.b'])

    def test_an_empty_string_is_not_counted_as_missing(self):
        """A key that is blank in English is blank in every language.

        Counting it would leave a locale permanently short of complete over a
        string no translator will ever be given anything to translate."""
        missing = []
        self.merge({'a': ''}, {}, missing)
        self.assertEqual(missing, [])

    def test_a_key_the_english_does_not_have_is_refused(self):
        # A locale translates what is there. Inventing a key means inventing a
        # value no template asks for, which is a typo far more often than it is
        # a feature.
        with self.assertRaises(ConfigError) as caught:
            self.merge({'a': 'one'}, {'a': 'eins', 'b': 'zwei'})
        self.assertIn('b', str(caught.exception))

    def test_a_list_longer_than_the_english_is_refused(self):
        # Merged in order, so a locale may be behind the English but cannot be
        # ahead of it: the extra entry has nothing to translate.
        with self.assertRaises(ConfigError) as caught:
            self.merge({'faq': ['a', 'b']}, {'faq': ['a', 'b', 'c']})
        self.assertIn('3', str(caught.exception))

    def test_a_shorter_list_falls_back_and_is_counted(self):
        """English grows a category; ten locales do not break that afternoon.

        This used to raise, and raising was wrong. A list that is short is a
        locale that was finished before English added an entry - which is the
        ordinary state of every locale here, most weeks. The tail falls back and
        is counted like any other untranslated string.
        """
        missing = []
        merged = self.merge({'cats': ['one', 'two', 'three']},
                            {'cats': ['eins']}, missing)
        self.assertEqual(merged['cats'], ['eins', 'two', 'three'])
        self.assertEqual(missing, ['x.cats[1]', 'x.cats[2]'])

    def test_a_changed_type_is_refused(self):
        with self.assertRaises(ConfigError):
            self.merge({'a': 'one'}, {'a': {'nested': 'x'}})

    def test_structure_survives_translation(self):
        """A slug, an id and an order are what a thing IS, not what it is called.

        A locale that could redefine them could move a page to an address
        nothing links to, and would be doing it in the middle of a wall of
        prose rather than in [slugs] where every address it changes can be read
        at once."""
        merged = self.merge(
            {'slug': 'widget', 'id': 'images', 'order': ['a'], 'name': 'Widget'},
            {'slug': 'dings', 'id': 'bilder', 'order': ['b'], 'name': 'Dings'})
        self.assertEqual(merged['slug'], 'widget')
        self.assertEqual(merged['id'], 'images')
        self.assertEqual(merged['order'], ['a'])
        self.assertEqual(merged['name'], 'Dings')

    def test_what_counts_as_structure_is_per_file(self):
        """Regression: the planned list could not be translated at all.

        STRUCTURAL_KEYS is matched on the key name, and `group` is on it - it
        names the guides group a guide joins, in that guide's page.toml. That
        made [[group]] in config/planned.toml look structural, so the whole
        roadmap list was skipped by the merge, no locale could translate it,
        and - because a skipped key is not a missing one - no locale was ever
        told.

        The set is a parameter of the merge now. In planned.toml only `id` is
        structure, because that is what a tool's roadmap_group matches on.
        """
        planned = {
            'note': 'Not built yet.',
            'group': [{'id': 'images', 'name': 'Images',
                       'items': [['Rotate', 'quarter turns']]}],
        }
        missing = []
        merged = i18n.merge(
            planned,
            {'group': [{'id': 'images', 'name': 'Bilder',
                        'items': [['Drehen', 'Vierteldrehungen']]}]},
            'test', missing, 'planned', i18n.PLANNED_STRUCTURE)

        self.assertEqual(merged['group'][0]['name'], 'Bilder')
        self.assertEqual(merged['group'][0]['items'][0], ['Drehen', 'Vierteldrehungen'])
        # The id is what roadmap_group matches on, so it survives.
        self.assertEqual(merged['group'][0]['id'], 'images')
        # And the one string left untranslated is reported, rather than skipped.
        self.assertEqual(missing, ['planned.note'])

    def test_the_ui_table_is_all_words_however_it_is_named(self):
        """Regression: [ui.tool] was served in English on every translated page.

        STRUCTURAL_KEYS is matched on the key name at any depth, and `tool` is
        on it - it names the tool a guide is about in that guide's page.toml.
        That made [ui.tool], which is the frame's words for a tool page, look
        structural, so the pledge and the button labels stayed English while
        the page around them came out in German.

        Nothing under [ui] is ever structure. That is what [ui] is for.
        """
        merged = i18n.merge(SITE, {'ui': {'tool': {'questions': 'Fragen'}}},
                            'test', [], 'site')
        self.assertEqual(merged['ui']['tool']['questions'], 'Fragen')


class TheRoadmapList(unittest.TestCase):
    """config/planned.toml, which is a page in the sitemap like any other.

    A locale that called itself finished while this list was still English
    would be advertising a half-translated page, which is the exact thing
    `complete` exists to stop."""

    def test_english_is_returned_unchanged(self):
        planned = {'note': 'x', 'group': []}
        self.assertIs(
            i18n.localize_planned(planned, i18n.base_locale(SITE), 'roadmap'),
            planned)

    def test_an_untranslated_list_is_counted_against_the_locale(self):
        planned = {
            'note': 'Not built yet.',
            'group': [{'id': 'images', 'name': 'Images',
                       'items': [['Rotate', 'quarter turns'], ['Filters', 'blur']]}],
        }
        de = locale()
        i18n.localize_planned(planned, de, 'roadmap')
        # note + name + two items of two strings each, charged to the roadmap
        # page rather than to the language as a whole.
        self.assertEqual(len(de['debt']['roadmap']), 6)
        self.assertIn('planned.group[0].items[0][0]', de['debt']['roadmap'])


class Slugs(unittest.TestCase):
    def test_renaming_something_that_does_not_exist_is_refused(self):
        with self.assertRaises(ConfigError) as caught:
            i18n.check_slugs(locale(slugs={'widgit': 'dings'}),
                             ['widget'], [], SITE)
        self.assertIn('widgit', str(caught.exception))

    def test_two_pages_may_not_land_on_one_address(self):
        # Silent otherwise: one page is written over the other, and the sitemap
        # goes on advertising an address that now serves the wrong content.
        with self.assertRaises(ConfigError) as caught:
            i18n.check_slugs(
                locale(slugs={'widget': 'dings', 'gadget': 'dings'}),
                ['widget', 'gadget'], [], SITE)
        self.assertIn('dings', str(caught.exception))

    def test_a_localized_slug_may_collide_with_nothing_and_pass(self):
        i18n.check_slugs(locale(slugs={'widget': 'dings'}), ['widget'], [], SITE)

    def test_english_slugs_are_the_keys(self):
        # Keyed by what the thing IS. Keyed the other way, a locale could not
        # be read without already knowing its own answer.
        i18n.check_slugs(locale(slugs={'guides': 'ratgeber'}), [], [], SITE)


class Completeness(unittest.TestCase):
    """What `complete = true` claims, and what it no longer claims.

    It used to mean "every string in this language is translated", and English
    grows a tool most weeks, so it was a claim that expired on its own. Now it
    means "the frame around every page is translated" - a set that does not grow
    when a tool ships - and an untranslated PAGE is held back by itself.
    """

    def test_an_unfinished_locale_may_fall_back(self):
        i18n.check_complete(locale(complete=False, frame=['x.y']))

    def test_a_finished_locale_may_not_fall_back_on_the_frame(self):
        with self.assertRaises(ConfigError) as caught:
            i18n.check_complete(locale(complete=True, frame=['hub.lede']))
        message = str(caught.exception)
        self.assertIn('hub.lede', message)
        # The error has to say what to do about it, because the right answer is
        # often "not yet" rather than "translate this now".
        self.assertIn('complete = false', message)

    def test_a_finished_locale_may_still_owe_whole_pages(self):
        """The change that lets English ship a tool without breaking ten builds.

        A page nobody has translated yet is not an error. It falls back, it is
        readable at its own URL, and `translated` is what keeps it out of the
        sitemap and out of every hreflang set until somebody gets to it.
        """
        de = locale(complete=True, debt={'gif-maker': ['tools.gif-maker.body']})
        i18n.check_complete(de)
        self.assertFalse(i18n.translated(de, 'gif-maker'))
        self.assertTrue(i18n.translated(de, 'compress-image'))

    def test_an_unfinished_locale_publishes_no_page_at_all(self):
        """Every page in it would be wearing an English nav."""
        de = locale(complete=False)
        self.assertFalse(i18n.translated(de, 'compress-image'))

    def test_english_is_complete_by_definition(self):
        i18n.check_complete({'is_base': True, 'complete': True, 'frame': ['x']})
        self.assertTrue(i18n.translated({'is_base': True}, 'anything'))


class MatchingListsById(unittest.TestCase):
    """Which English entry a translation is FOR.

    Matching by position looks fine until English inserts something in the
    middle. It did - [[hub.categories]] gained GIF between images and audio -
    and seven languages silently relabelled every category after it: the Spanish
    hub put "Audio" over the GIF maker and "Documentos y PDF" over the audio
    editor. Nothing raised, because by position every entry had a partner.
    """

    def merge(self, base, over, missing=None):
        return i18n.merge(base, over, 'test',
                          missing if missing is not None else [], 'x')

    def english(self):
        return {'cats': [{'id': 'images', 'name': 'Images'},
                         {'id': 'gif', 'name': 'GIF'},
                         {'id': 'audio', 'name': 'Audio'}]}

    def test_an_entry_english_gained_in_the_middle_falls_back_in_place(self):
        """The case that was silently wrong: the locale predates `gif`."""
        missing = []
        found = self.merge(self.english(),
                           {'cats': [{'id': 'images', 'name': 'Bilder'},
                                     {'id': 'audio', 'name': 'Ton'}]},
                           missing)
        self.assertEqual([c['name'] for c in found['cats']],
                         ['Bilder', 'GIF', 'Ton'])
        self.assertIn('x.cats[gif].name', missing)

    def test_the_english_order_is_kept_whatever_order_the_locale_is_in(self):
        found = self.merge(self.english(),
                           {'cats': [{'id': 'audio', 'name': 'Ton'},
                                     {'id': 'gif', 'name': 'GIF-Bilder'},
                                     {'id': 'images', 'name': 'Bilder'}]})
        self.assertEqual([c['id'] for c in found['cats']],
                         ['images', 'gif', 'audio'])
        self.assertEqual([c['name'] for c in found['cats']],
                         ['Bilder', 'GIF-Bilder', 'Ton'])

    def test_an_entry_with_no_id_is_refused(self):
        with self.assertRaises(ConfigError) as caught:
            self.merge(self.english(), {'cats': [{'name': 'Bilder'}]})
        message = str(caught.exception)
        self.assertIn('no id', message)
        # The error has to list what the ids are, or it cannot be acted on.
        self.assertIn('images', message)

    def test_an_id_the_english_does_not_have_is_refused(self):
        with self.assertRaises(ConfigError) as caught:
            self.merge(self.english(), {'cats': [{'id': 'wat', 'name': 'x'}]})
        self.assertIn('wat', str(caught.exception))

    def test_the_same_id_twice_is_refused(self):
        with self.assertRaises(ConfigError) as caught:
            self.merge(self.english(), {'cats': [{'id': 'gif', 'name': 'a'},
                                                 {'id': 'gif', 'name': 'b'}]})
        self.assertIn('gif', str(caught.exception))

    def test_a_list_without_ids_is_still_matched_by_position(self):
        """Plain strings have nothing to name them by, and are unchanged."""
        missing = []
        found = self.merge({'faq': ['one', 'two', 'three']},
                           {'faq': ['eins']}, missing)
        self.assertEqual(found['faq'], ['eins', 'two', 'three'])
        self.assertEqual(missing, ['x.faq[1]', 'x.faq[2]'])


class FallingBackInsideALanguage(unittest.TestCase):
    """An English body sitting at a German address.

    This could not happen before: a language with a fallback left in it was
    never published, so nobody could reach the page. Holding pages back one at a
    time means English prose now appears inside a published language, and the
    links inside it were written for the English tree.
    """

    def relocate(self, html, slug, slugs=None):
        de = locale(slugs=slugs if slugs is not None else
                    {'trim-video': 'video-schneiden'})
        return i18n.relocate(html, de, slug)

    def test_a_link_is_pointed_at_the_translated_address(self):
        found = self.relocate('<a href="../trim-video/">Trim</a>', 'reverse-video')
        self.assertIn('href="/de/video-schneiden/"', found)

    def test_a_page_with_no_translated_slug_keeps_its_english_one(self):
        """It is falling back too, and lives at its English address here."""
        found = self.relocate('<a href="../gif-maker/">GIF</a>', 'reverse-video')
        self.assertIn('href="/de/gif-maker/"', found)

    def test_a_guide_two_levels_down_resolves_from_its_own_folder(self):
        found = self.relocate('<a href="../../trim-video/">Trim</a>',
                              'guides/reverse-a-video')
        self.assertIn('href="/de/video-schneiden/"', found)

    def test_an_asset_is_left_where_it_is(self):
        found = self.relocate('<img src="../../assets/x.svg">', 'guides/a-guide')
        self.assertIn('src="/assets/x.svg"', found)

    def test_an_absolute_or_external_link_is_untouched(self):
        for href in ('https://example.com/x/', '/de/already/', '#section',
                     'mailto:a@b.c'):
            with self.subTest(href=href):
                found = self.relocate(f'<a href="{href}">x</a>', 'a-tool')
                self.assertIn(f'href="{href}"', found)

    def test_a_fragment_survives_the_rewrite(self):
        found = self.relocate('<a href="../trim-video/#faq">Trim</a>',
                              'reverse-video')
        self.assertIn('href="/de/video-schneiden/#faq"', found)


class Advertising(unittest.TestCase):
    """What the sitemap, the hreflang tags and the switcher are built from.

    All three come from i18n.published, so they cannot disagree about which
    languages the site claims to have - which is the failure Google reports as
    "hreflang points to a page that is not indexed"."""

    def setUp(self):
        self.english = i18n.base_locale(SITE)
        self.german = locale(complete=True, slugs={'widget': 'dings'})
        self.draft = locale(lang='fr', hreflang='fr', prefix='fr/', complete=False)

    def test_one_language_advertises_nothing(self):
        # A lone hreflang="en" beside an x-default pointing at the same URL
        # says nothing the canonical above it has not already said.
        self.assertEqual(i18n.alternates([self.english], 'widget', SITE), [])
        self.assertEqual(
            i18n.switcher([self.english], self.english, 'widget', SITE), [])

    def test_two_languages_point_at_each_other_and_at_themselves(self):
        found = i18n.alternates([self.english, self.german], 'widget', SITE)
        self.assertEqual(
            [(entry['hreflang'], entry['href']) for entry in found],
            [('en', 'https://example.test/widget/'),
             ('de', 'https://example.test/de/dings/'),
             ('x-default', 'https://example.test/widget/')])

    def test_an_unfinished_language_is_never_advertised(self):
        locales = [self.english, self.german, self.draft]
        langs = [entry['hreflang']
                 for entry in i18n.alternates(locales, 'widget', SITE)]
        self.assertNotIn('fr', langs)
        self.assertNotIn('fr', [entry['lang'] for entry in
                                i18n.switcher(locales, self.english, 'widget', SITE)])

    def test_the_switcher_stays_on_the_same_page(self):
        """Not on the front door of the other language.

        Somebody reading about a widget who wants it in German wants that page
        in German. Dropping them on the hub to find it again is the commonest
        way a switcher gets built wrong."""
        found = i18n.switcher([self.english, self.german], self.english,
                              'widget', SITE)
        self.assertEqual([entry['href'] for entry in found],
                         ['/widget/', '/de/dings/'])
        self.assertEqual([entry['current'] for entry in found], [True, False])


class Addresses(unittest.TestCase):
    def test_depth_is_measured_from_the_language_not_from_the_site(self):
        """Regression: every prose page linked its way out of its own language.

        `depth` becomes `base`, and `base` builds the footer, the breadcrumb
        and the link to the guides index. Counting the locale prefix as another
        level - which the first version did - sent all of those up one step too
        far, so a German page's German footer linked to the English hub, the
        English guides index and the English privacy page. Nothing 404'd,
        because those pages exist; the links just quietly changed language.

        So the same page is the same depth in every language, and each locale
        root carries its own copy of site.css to keep it that way.
        """
        page = {'slug': 'guides/resize', 'kind': 'guide', 'nav': 'Resize'}
        english = i18n.localize_page(page, i18n.base_locale(SITE), SITE)
        german = i18n.localize_page(
            page, locale(slugs={'guides/resize': 'ratgeber/skalieren'}), SITE)
        self.assertEqual(english['depth'], 2)
        self.assertEqual(german['depth'], 2)
        self.assertEqual(german['url'],
                         'https://example.test/de/ratgeber/skalieren/')

    def test_the_english_slug_is_kept_alongside_the_translated_one(self):
        """`slug` names the thing and `out_slug` is where it is served.

        Mixing the two is the one bug this arrangement can still have: every
        lookup - which category lists this tool, which guide is about it -
        matches on the first, and only the address uses the second."""
        page = {'slug': 'privacy', 'kind': 'legal', 'nav': 'Privacy'}
        german = i18n.localize_page(page, locale(slugs={'privacy': 'datenschutz'}),
                                    SITE)
        self.assertEqual(german['slug'], 'privacy')
        self.assertEqual(german['out_slug'], 'datenschutz')


class LinksThatLeadNowhere(unittest.TestCase):
    """build.check_links, added after two bugs that broke no build and threw no
    error - they just left pages pointing at the wrong thing."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.out = Path(self.tmp.name)
        self.locales = [i18n.base_locale(SITE),
                        locale(complete=True), locale(lang='fr', complete=False)]

    def tearDown(self):
        self.tmp.cleanup()

    def page(self, where, body):
        path = self.out / where
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(body, encoding='utf-8', newline='\n')

    def test_a_link_to_a_page_that_exists_passes(self):
        self.page('index.html', '<a href="widget/">Widget</a>')
        self.page('widget/index.html', '<a href="../">Home</a>')
        buildmod.check_links(self.out, self.locales, SITE)

    def test_a_link_to_a_page_that_was_never_built_fails(self):
        self.page('index.html', '<a href="widget/">Widget</a>')
        with self.assertRaises(ConfigError) as caught:
            buildmod.check_links(self.out, self.locales, SITE)
        self.assertIn('widget/', str(caught.exception))

    def test_a_finished_locale_is_held_to_it(self):
        # de says complete = true, so a link out of it that leads nowhere means
        # the claim is false.
        self.page('de/index.html', '<a href="../compress-image/">nope</a>')
        with self.assertRaises(ConfigError):
            buildmod.check_links(self.out, self.locales, SITE)

    def test_an_unfinished_locale_is_not(self):
        """fr is still serving English bodies, and an English body carries
        English slugs. Broken cross-links are the expected state there until it
        is translated, which is what complete = false says."""
        self.page('fr/index.html', '<a href="../compress-image/">nope</a>')
        buildmod.check_links(self.out, self.locales, SITE)

    def test_off_site_and_inert_links_are_left_alone(self):
        self.page('index.html',
                  '<a href="https://example.test/x">x</a>'
                  '<a href="mailto:a@b.test">mail</a>'
                  '<img src="data:image/gif;base64,AA">')
        buildmod.check_links(self.out, self.locales, SITE)

    def test_a_query_string_does_not_count_as_part_of_the_name(self):
        # The stylesheet is asked for by a URL carrying a hash of its contents.
        self.page('index.html', '<link href="site.css?v=abc123">')
        self.page('site.css', 'body{}')
        buildmod.check_links(self.out, self.locales, SITE)


class LoadingALocale(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)

    def tearDown(self):
        self.tmp.cleanup()

    def write(self, lang, text):
        folder = self.root / lang
        folder.mkdir(parents=True, exist_ok=True)
        (folder / 'locale.toml').write_text(text, encoding='utf-8', newline='\n')

    def test_english_is_first_and_is_not_a_folder(self):
        """English is the sources, not a translation of itself.

        The moment it becomes locales/en/ it is a copy free to drift from the
        tool.toml it was made from, and the build loses the one text every
        other language is measured against."""
        found = i18n.load_locales(self.root, SITE)
        self.assertEqual([entry['lang'] for entry in found], ['en'])
        self.assertTrue(found[0]['is_base'])

    def test_a_locale_folder_for_english_is_refused(self):
        self.write('en', 'lang = "en"\nname = "English"\nendonym = "English"\n')
        with self.assertRaises(ConfigError):
            i18n.load_locales(self.root, SITE)

    def test_the_folder_has_to_match_the_language(self):
        self.write('de', 'lang = "fr"\nname = "French"\nendonym = "Francais"\n')
        with self.assertRaises(ConfigError) as caught:
            i18n.load_locales(self.root, SITE)
        self.assertIn('folder', str(caught.exception))

    def test_a_locale_may_not_restate_the_site(self):
        # Words and slugs. Everything else about the site is decided once, in
        # English, for every language - a locale that could set its own
        # Content-Security-Policy would be a second site to keep in step.
        self.write('de', 'lang = "de"\nname = "German"\nendonym = "Deutsch"\n'
                         'domain = "https://evil.test/"\n')
        with self.assertRaises(ConfigError) as caught:
            i18n.load_locales(self.root, SITE)
        self.assertIn('domain', str(caught.exception))

    def test_hreflang_defaults_to_the_language_and_can_be_set(self):
        # pt-BR is a language and a region, and hreflang is where that is said.
        self.write('de', 'lang = "de"\nname = "German"\nendonym = "Deutsch"\n')
        self.write('pt', 'lang = "pt"\nname = "Portuguese"\n'
                         'endonym = "Portugues"\nhreflang = "pt-BR"\n')
        found = {entry['lang']: entry['hreflang']
                 for entry in i18n.load_locales(self.root, SITE)}
        self.assertEqual(found['de'], 'de')
        self.assertEqual(found['pt'], 'pt-BR')


if __name__ == '__main__':
    unittest.main()
