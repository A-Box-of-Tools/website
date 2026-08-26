"""
build.py.

Three things are checked here.

The small pieces first: `write`, which exists because a build that produced
CRLF on Windows and LF in CI would show every line of every file as changed on
alternate deploys; `blob_id`, which has to agree with Git exactly or `--check`
compares nothing; and `Emitter`, which decides what gets minified.

Then the build itself, run into a temporary directory. That is more than a unit
test, and it earns its place: it is the only thing that catches a template that
stopped rendering, a tool.toml that lost a key, or a page that quietly stopped
being written. It needs nothing installed - the plain build is pure Python.
"""

import hashlib
import json
import re
import subprocess
import tempfile
import unittest
import xml.etree.ElementTree as ElementTree
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import build as buildmod


ROOT = Path(__file__).resolve().parents[2]


def warm(tree):
    """Open every file under `tree` once, many at a time.

    On Windows the antivirus prices the FIRST open of a freshly written file
    at tens of milliseconds while its scan finishes. The build no longer
    reads back anything it writes, so the first reader of most of the tree is
    whichever test method gets there - thousands of opens, one at a time, and
    the class that took two minutes took six. Paying the scans here, all at
    once, turns that wait into seconds; anywhere without a scanner this is a
    moment of warm page cache.
    """
    files = [path for path in tree.rglob('*') if path.is_file()]
    with ThreadPoolExecutor(max_workers=32) as pool:
        for _ in pool.map(Path.read_bytes, files):
            pass


class Write(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.dir = Path(self.tmp.name)
        self.addCleanup(self.tmp.cleanup)

    def test_a_trailing_newline_is_added_when_missing(self):
        path = self.dir / 'a.txt'
        buildmod.write(path, 'x')
        self.assertEqual(path.read_bytes(), b'x\n')

    def test_a_trailing_newline_is_not_doubled(self):
        path = self.dir / 'a.txt'
        buildmod.write(path, 'x\n')
        self.assertEqual(path.read_bytes(), b'x\n')

    def test_line_endings_are_always_lf(self):
        # Even on Windows, and even when the text already holds CRLF.
        path = self.dir / 'a.txt'
        buildmod.write(path, 'a\nb\n')
        self.assertEqual(path.read_bytes(), b'a\nb\n')

    def test_the_text_is_utf8(self):
        path = self.dir / 'a.txt'
        buildmod.write(path, 'café\n')
        self.assertEqual(path.read_bytes(), 'café\n'.encode('utf-8'))


class BlobId(unittest.TestCase):
    """The id Git would give a file, computed without shelling out per file."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.dir = Path(self.tmp.name)
        self.addCleanup(self.tmp.cleanup)

    def test_it_matches_the_documented_rule(self):
        path = self.dir / 'a.txt'
        path.write_bytes(b'hello\n')
        expected = hashlib.sha1(b'blob 6\x00hello\n').hexdigest()
        self.assertEqual(buildmod.blob_id(path), expected)

    def test_an_empty_file_is_the_well_known_empty_blob(self):
        path = self.dir / 'empty'
        path.write_bytes(b'')
        self.assertEqual(buildmod.blob_id(path),
                         'e69de29bb2d1d6434b8b29ae775ad8c2e48c5391')

    def test_it_agrees_with_git_itself(self):
        path = self.dir / 'a.bin'
        path.write_bytes(bytes(range(256)) + b'\r\n mixed \n endings \r\n')
        found = subprocess.run(['git', 'hash-object', str(path)],
                               capture_output=True, text=True, check=True)
        self.assertEqual(buildmod.blob_id(path), found.stdout.strip())


class EmitterSetup(unittest.TestCase):
    SITE = {'source_url': 'https://example.test/repo'}

    def test_the_banner_names_the_source_and_the_check_command(self):
        emitter = buildmod.Emitter(True, self.SITE)
        self.assertIn('https://example.test/repo', emitter.js_banner)
        self.assertIn('build.py --check', emitter.js_banner)

    def test_the_banner_does_not_claim_names_were_renamed(self):
        # Identifiers are left alone, so nothing in the output should suggest
        # otherwise to somebody reading a deployed file against its source.
        emitter = buildmod.Emitter(True, self.SITE)
        self.assertNotIn('mangl', emitter.js_banner.lower())



class EmitterOutput(unittest.TestCase):
    SITE = {'source_url': 'https://example.test/repo'}

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.dir = Path(self.tmp.name)
        self.addCleanup(self.tmp.cleanup)

    def test_minifying_off_writes_the_source_through(self):
        emitter = buildmod.Emitter(False, self.SITE)
        source = '// a note\nlet x = 1\n'
        emitter.js(self.dir / 'a.js', source, where='a.js')
        self.assertEqual((self.dir / 'a.js').read_text(encoding='utf-8'), source)

    def test_minifying_on_strips_comments_and_keeps_the_banner(self):
        emitter = buildmod.Emitter(True, self.SITE)
        emitter.js(self.dir / 'a.js', '// a note\nlet x = 1\n', where='a.js')
        out = (self.dir / 'a.js').read_text(encoding='utf-8')
        self.assertNotIn('a note', out)
        self.assertIn('let x=1', out)
        self.assertIn('build.py --check', out)

    def test_html_carries_the_banner_as_a_comment(self):
        emitter = buildmod.Emitter(True, self.SITE)
        emitter.html(self.dir / 'a.html', '<p>\n  a\n</p>\n')
        out = (self.dir / 'a.html').read_text(encoding='utf-8')
        self.assertTrue(out.startswith('<!--'))
        self.assertIn('<p> a </p>', out)

    def test_css_text_returns_rather_than_writes(self):
        # The stylesheet has to be hashed after minifying and before being
        # written, because the hash goes in the URL the page asks for it by.
        emitter = buildmod.Emitter(True, self.SITE)
        out = emitter.css_text('a {\n  color: red;\n}\n')
        self.assertIn('a{color:red}', out)
        self.assertEqual(list(self.dir.iterdir()), [])

    def test_css_text_is_untouched_when_minifying_is_off(self):
        source = 'a {\n  color: red;\n}\n'
        self.assertEqual(buildmod.Emitter(False, self.SITE).css_text(source),
                         source)


class GuideGroups(unittest.TestCase):
    """Every way a guide could be written and then linked to from nowhere.

    The same three refusals the hub already makes about tools and categories,
    and they matter more here: a tool that vanished from the hub would be
    noticed the first time somebody looked at the front page, whereas a guide
    that fell out of the index is only ever missed by the reader who never
    found it.
    """

    SITE = {'guides': {'slug': 'guides', 'groups': [
        {'id': 'g', 'name': 'G', 'note': 'n', 'order': ['a', 'b']}]}}

    def guide(self, name, group='g'):
        return {'slug': f'guides/{name}', 'group': group, 'tool': ''}

    def test_the_order_in_the_config_is_the_order_on_the_page(self):
        guides = [self.guide('b'), self.guide('a')]
        groups = buildmod.guide_groups(self.SITE, guides)
        self.assertEqual([g['slug'] for g in groups[0]['guides']],
                         ['guides/a', 'guides/b'])

    def test_a_guide_no_group_lists_is_refused(self):
        guides = [self.guide('a'), self.guide('b'), self.guide('c')]
        with self.assertRaises(buildmod.sitelib.ConfigError) as caught:
            buildmod.guide_groups(self.SITE, guides)
        self.assertIn('c', str(caught.exception))

    def test_a_group_naming_a_guide_that_does_not_exist_is_refused(self):
        with self.assertRaises(buildmod.sitelib.ConfigError) as caught:
            buildmod.guide_groups(self.SITE, [self.guide('a')])
        self.assertIn('b', str(caught.exception))

    def test_the_two_halves_have_to_agree_on_the_group(self):
        guides = [self.guide('a'), self.guide('b', group='elsewhere')]
        with self.assertRaises(buildmod.sitelib.ConfigError) as caught:
            buildmod.guide_groups(self.SITE, guides)
        self.assertIn('elsewhere', str(caught.exception))


class GuidesAndTools(unittest.TestCase):
    """One line in a guide's page.toml makes both halves of the link."""

    def test_a_guide_is_found_by_the_slug_of_its_tool(self):
        guide = {'slug': 'guides/a', 'tool': 'widget'}
        owned = buildmod.tie_guides_to_tools([guide], {'widget': {}})
        self.assertIs(owned['widget'], guide)

    def test_a_guide_about_no_tool_claims_none(self):
        guide = {'slug': 'guides/a', 'tool': ''}
        self.assertEqual(buildmod.tie_guides_to_tools([guide], {'widget': {}}), {})

    def test_a_tool_that_does_not_exist_is_refused(self):
        guide = {'slug': 'guides/a', 'tool': 'gadget'}
        with self.assertRaises(buildmod.sitelib.ConfigError) as caught:
            buildmod.tie_guides_to_tools([guide], {'widget': {}})
        self.assertIn('gadget', str(caught.exception))

    def test_two_guides_cannot_claim_one_tool(self):
        # A tool page links to one guide, so the second would be written and
        # never linked.
        guides = [{'slug': 'guides/a', 'tool': 'widget'},
                  {'slug': 'guides/b', 'tool': 'widget'}]
        with self.assertRaises(buildmod.sitelib.ConfigError) as caught:
            buildmod.tie_guides_to_tools(guides, {'widget': {}})
        self.assertIn('guides/b', str(caught.exception))


class RelatedTools(unittest.TestCase):
    """The ring of links out of every tool page.

    The properties worth pinning down are the ones that make it a link graph
    rather than a decoration: nothing points at itself, nothing points at the
    same tool twice, and nothing is left with no way in.
    """

    @staticmethod
    def tools(*pairs):
        return [{'slug': slug, 'category': category} for slug, category in pairs]

    def test_siblings_come_first(self):
        ordered = self.tools(('a', 'x'), ('b', 'x'), ('c', 'y'), ('d', 'x'))
        related = buildmod.related_tools(ordered, count=2)
        self.assertEqual([t['slug'] for t in related['a']], ['b', 'd'])

    def test_a_tool_never_links_to_itself(self):
        ordered = self.tools(('a', 'x'), ('b', 'x'), ('c', 'x'))
        for slug, others in buildmod.related_tools(ordered).items():
            self.assertNotIn(slug, [t['slug'] for t in others])

    def test_a_lone_tool_in_its_category_still_gets_links(self):
        # No shipped category holds one tool at the moment, but one that has
        # just been added does until its second tool arrives, and a strict
        # reading of "same category" would leave that page the dead end this
        # exists to remove.
        ordered = self.tools(('a', 'x'), ('b', 'x'), ('lonely', 'z'))
        related = buildmod.related_tools(ordered, count=2)
        self.assertEqual([t['slug'] for t in related['lonely']], ['a', 'b'])

    def test_the_ring_wraps(self):
        # The last tool in the order reads round to the first rather than
        # running out.
        ordered = self.tools(('a', 'x'), ('b', 'x'), ('c', 'x'))
        related = buildmod.related_tools(ordered, count=2)
        self.assertEqual([t['slug'] for t in related['c']], ['a', 'b'])

    def test_fewer_tools_than_asked_for_is_not_padded(self):
        ordered = self.tools(('a', 'x'), ('b', 'x'))
        self.assertEqual(len(buildmod.related_tools(ordered, count=4)['a']), 1)

    def test_one_tool_on_its_own_gets_nothing(self):
        self.assertEqual(buildmod.related_tools(self.tools(('a', 'x'))), {'a': []})

    def test_no_tool_is_listed_twice_on_one_page(self):
        ordered = self.tools(*[(chr(97 + n), 'x' if n % 2 else 'y')
                               for n in range(9)])
        for slug, others in buildmod.related_tools(ordered).items():
            names = [t['slug'] for t in others]
            self.assertEqual(len(names), len(set(names)), slug)

    def test_every_real_tool_has_a_way_in(self):
        # The half of this that is about search engines rather than readers: a
        # tool nothing links to is a tool a crawler reaches only from the hub.
        site = buildmod.sitelib.load_toml(ROOT / 'config' / 'site.toml')
        ordered = [{'slug': slug, 'category': category['id']}
                   for category in site['hub']['categories']
                   for slug in category['order']]
        related = buildmod.related_tools(ordered)
        linked = {t['slug'] for others in related.values() for t in others}
        self.assertEqual({t['slug'] for t in ordered} - linked, set())


class DownloadHooks(unittest.TestCase):
    """Every save button a locale copy could have dropped the hook from.

    shared/feedback.js finds a download by the click, and it recognises three
    shapes in the markup: an <a download>, a button whose id starts with
    "download", and anything carrying data-download. The first two are
    structure, and a translator has no reason to touch either. The third is an
    attribute on a button whose visible words ARE translated - and a tool's
    body.html is copied whole into locales/<lang>/tools/<slug>.html, so a
    translation is a chance to lose it.

    Losing it is silent: the tool still works, the button still saves the file,
    and that one language simply stops being asked the question. This is the
    only thing that would notice.
    """

    def counts(self, text):
        return len(re.findall(r'data-download', text))

    def test_every_locale_copy_keeps_the_hook(self):
        for source in sorted(ROOT.glob('tools/*/body.html')):
            slug = source.parent.name
            wanted = self.counts(source.read_text(encoding='utf-8'))
            for copy in sorted(ROOT.glob(f'locales/*/tools/{slug}.html')):
                with self.subTest(tool=slug, lang=copy.parent.parent.name):
                    self.assertEqual(
                        self.counts(copy.read_text(encoding='utf-8')), wanted,
                        f'{copy.relative_to(ROOT)} has a different number of '
                        'data-download attributes than the English body it is a '
                        'translation of')

    def test_the_tool_that_needs_one_has_one(self):
        """exif-editor saves through a button named nothing like "download".

        Named here rather than inferred, because the rule this is protecting is
        not "some tool has the attribute" - it is that a save button which does
        not announce itself in one of the other two ways has to opt in, and
        exif-editor is the one that does not.
        """
        body = (ROOT / 'tools' / 'exif-editor' / 'body.html').read_text(encoding='utf-8')
        self.assertIn('id="save-edits"', body)
        self.assertRegex(body, r'id="save-edits"[^>]*data-download')


class BuildTheSite(unittest.TestCase):
    """A whole plain build, into a temporary directory.

    Slower than the rest of this file and worth it: everything above tests one
    piece, and this is the only thing that would notice a page that stopped
    being written at all.
    """

    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        cls.out = Path(cls.tmp.name) / 'dist'
        cls.written = buildmod.build(cls.out, clean=True, minify_output=False)
        warm(cls.out)

        # Which languages are built but not yet advertised. Read off the locale
        # files rather than written down here, so adding a language - or
        # finishing one - does not also mean remembering to edit a test.
        site = buildmod.sitelib.load_toml(ROOT / 'config' / 'site.toml')
        cls.locales = buildmod.i18n.load_locales(ROOT / 'locales', site)
        cls.unfinished = [locale['lang'] for locale in cls.locales
                          if not locale['is_base'] and not locale['complete']]

        # And which individual PAGES are advertised, which is no longer the same
        # question. A published language still holds back the pages it has not
        # translated, so the sitemap is a set of pages rather than a set of
        # languages. Worked out the way the build works it out, from the same
        # survey, so the test cannot drift from the rule it is checking.
        tools = [buildmod.sitelib.load_tool(path, site)
                 for path in sorted((ROOT / 'tools').glob('*/tool.toml'))]
        prose = [buildmod.sitelib.load_page(path, site, ROOT / 'pages')
                 for path in sorted((ROOT / 'pages').glob('**/page.toml'))]
        planned = buildmod.sitelib.load_toml(ROOT / 'config' / 'planned.toml')
        buildmod.i18n.survey(cls.locales, tools, prose, planned, site)

        slugs = ([''] + [tool['slug'] for tool in tools]
                 + [page['slug'] for page in prose]
                 + [site['guides']['slug'], site['roadmap']['slug']])
        cls.advertised = {
            buildmod.i18n.locale_path(locale, slug).strip('/')
            for locale in cls.locales for slug in slugs
            if buildmod.i18n.translated(locale, slug)
        }

    @classmethod
    def tearDownClass(cls):
        cls.tmp.cleanup()

    def unpublished(self, name):
        """Whether a written page is one the site does not advertise.

        Two reasons a page is not advertised, and both end up here: its language
        has not finished the frame, or its language has finished the frame and
        not this page.
        """
        if any(name.startswith(f'{lang}/') for lang in self.unfinished):
            return True
        return name[:-len('index.html')].strip('/') not in self.advertised

    def a_tool(self):
        return sorted(p.parent.name for p in ROOT.glob('tools/*/tool.toml'))[0]

    def tool_pages(self):
        """The written pages that are tools, in every language.

        By address rather than by name: `de/video-zuschneiden` is a tool page
        and `de/anleitungen/...` is not. The folders on disk are the only list
        of tools there is and the localized slugs are worked out the way the
        build worked them out, so this cannot drift from what was built.
        """
        slugs = [path.parent.name for path in ROOT.glob('tools/*/tool.toml')]
        folders = {buildmod.i18n.locale_path(locale, slug).strip('/')
                   for locale in self.locales for slug in slugs}
        found = [name for name in self.written
                 if name[:-len('index.html')].strip('/') in folders]
        self.assertTrue(found)
        return found

    def hub_pages(self):
        """The front page of every language: '' and 'de/' and the rest."""
        found = [f'{locale["prefix"]}index.html' for locale in self.locales]
        self.assertTrue(all(name in self.written for name in found))
        return found

    def test_it_reports_what_it_wrote(self):
        self.assertIn('index.html', self.written)
        self.assertIn('sitemap.xml', self.written)

    def test_every_reported_page_is_on_disk(self):
        for name in self.written:
            with self.subTest(page=name):
                self.assertTrue((self.out / name).is_file(), name)

    def test_every_tool_in_the_repository_got_a_page(self):
        slugs = sorted(p.parent.name for p in ROOT.glob('tools/*/tool.toml'))
        self.assertTrue(slugs)
        for slug in slugs:
            with self.subTest(tool=slug):
                self.assertIn(f'{slug}/index.html', self.written)

    def test_a_tool_page_is_complete(self):
        slug = sorted(p.parent.name for p in ROOT.glob('tools/*/tool.toml'))[0]
        for name in ('index.html', 'styles.css', 'analytics.js', 'sw.js',
                     'manifest.json', 'src/main.js'):
            with self.subTest(file=name):
                self.assertTrue((self.out / slug / name).is_file(), name)

    # -- installing a page as an app --------------------------------------
    #
    # Four things have to agree for the browser to offer it, and every one of
    # them fails silently: the page links the manifest, the policy allows the
    # file to be fetched, the manifest names icons, and the icons are there. A
    # page with any one of them missing looks and works exactly like one with
    # all four, and the only visible difference is an install button that never
    # appears - which nothing in a build log or a link check would catch.

    def test_every_installable_page_links_a_manifest_and_may_fetch_it(self):
        for name in self.tool_pages() + self.hub_pages():
            with self.subTest(page=name):
                page = (self.out / name).read_text(encoding='utf-8')
                self.assertIn('<link rel="manifest" href="manifest.json">', page)
                # manifest-src falls back to default-src, which is 'none'.
                self.assertIn("manifest-src 'self'", page)

    def test_a_page_of_prose_carries_neither(self):
        """There is nothing to install on a privacy policy.

        The permission goes with the manifest: a page that links no manifest
        should not be asking for the right to fetch one.
        """
        slug = sorted(path.parent.name for path in ROOT.glob('pages/*/page.toml'))[0]
        page = (self.out / slug / 'index.html').read_text(encoding='utf-8')
        self.assertNotIn('rel="manifest"', page)
        self.assertNotIn('manifest-src', page)

    def test_every_language_can_be_installed_as_the_whole_site(self):
        """"A Box of Tools" as one app, once per language.

        The name is the site's and is not translatable, so every language
        installs an app by the same name; what differs is where it opens and
        what language it opens in. A German reader who installed from /de/ and
        landed on the English hub would have installed the wrong site.
        """
        for locale in self.locales:
            folder = locale['prefix']
            with self.subTest(lang=locale['lang']):
                manifest = json.loads((self.out / folder / 'manifest.json')
                                      .read_text(encoding='utf-8'))
                self.assertEqual(manifest['id'], f'/{folder}')
                self.assertEqual(manifest['name'], 'A Box of Tools')
                self.assertEqual(manifest['lang'], locale['hreflang'])
                # And a worker over the same scope, or the installed app is a
                # shortcut that fails the moment the network does - which is the
                # one thing this site says it never does.
                self.assertTrue((self.out / folder / 'sw.js').is_file())
                page = (self.out / folder / 'index.html').read_text(encoding='utf-8')
                self.assertIn('/offline.js?v=', page)

    def test_the_script_that_registers_the_front_page_worker_is_written_once(self):
        self.assertTrue((self.out / 'offline.js').is_file())
        self.assertEqual(sorted(path.as_posix()
                                for path in self.out.glob('**/offline.js')),
                         [(self.out / 'offline.js').as_posix()])

    def test_no_worker_can_delete_another_worker_s_cache(self):
        """Every worker on the site claims a cache namespace of its own.

        The cache store is one per origin and every registration here shares it,
        and `activate` empties everything under its own prefix. So two workers
        sharing a prefix - or one whose prefix is a prefix of another's, which is
        what bare paths would give for `/de/` and `/de/video-zuschneiden/` -
        means opening one page silently drops another page's offline copy.

        It did. Before this rule the filter was `name !== CACHE_NAME`, so every
        worker deleted every cache on the origin but its own: two tools visited,
        one cache in the browser, and only the second of them worked offline.
        """
        prefixes = []
        for path in sorted(self.out.glob('**/sw.js')):
            found = re.search(r"CACHE_PREFIX\s*=\s*'([^']+)'",
                              path.read_text(encoding='utf-8'))
            self.assertIsNotNone(found, path)
            prefixes.append(found.group(1))

        self.assertGreater(len(prefixes), 1)
        self.assertEqual(len(set(prefixes)), len(prefixes),
                         'two workers share a cache namespace')
        for i, one in enumerate(prefixes):
            for j, other in enumerate(prefixes):
                if i != j and other.startswith(one):
                    self.fail(f'{one!r} is a prefix of {other!r}')

    def test_a_manifest_is_scoped_to_its_own_folder_in_every_language(self):
        for name in self.tool_pages() + self.hub_pages():
            folder = name[:-len('index.html')]
            with self.subTest(page=name):
                manifest = json.loads(
                    (self.out / folder / 'manifest.json').read_text(encoding='utf-8'))
                # Relative, so the app that opens is this folder and not the
                # site - and so the same two values are right in every language.
                self.assertEqual(manifest['start_url'], './')
                self.assertEqual(manifest['scope'], './')
                # The identity is written down rather than defaulted, so the
                # address can be corrected later without every reader who
                # installed the tool acquiring a second copy of it.
                self.assertEqual(manifest['id'], f'/{folder}')
                self.assertTrue(manifest['name'])

    def test_a_manifest_is_written_in_the_language_of_its_page(self):
        """And says so with the tag the rest of the page says it with.

        `hreflang`, not the folder name: Portuguese is served from /pt/ and
        advertised as pt-BR, and Chinese from /zh/ as zh-Hans. An installed app
        that claimed `pt` would be a fourth answer to a question the page, the
        sitemap and the switcher already agree on.
        """
        slug = self.a_tool()
        for locale in self.locales:
            folder = buildmod.i18n.locale_path(locale, slug).strip('/')
            with self.subTest(lang=locale['lang']):
                manifest = json.loads((self.out / folder / 'manifest.json')
                                      .read_text(encoding='utf-8'))
                self.assertEqual(manifest['lang'], locale['hreflang'])

    def test_every_icon_a_manifest_names_is_on_disk(self):
        """Nothing else would catch one that was not.

        check_links reads <a href> and never opens a manifest, and a browser
        that cannot fetch an icon does not report it either - it declines the
        install and says nothing.
        """
        for name in self.tool_pages() + self.hub_pages():
            folder = self.out / name[:-len('index.html')]
            manifest = json.loads(
                (folder / 'manifest.json').read_text(encoding='utf-8'))
            self.assertTrue(manifest['icons'])
            for icon in manifest['icons']:
                src = icon['src']
                with self.subTest(page=name, icon=src):
                    path = (self.out / src.lstrip('/') if src.startswith('/')
                            else folder / src)
                    self.assertTrue(path.is_file(), src)

    def test_a_tool_installs_as_itself_and_a_front_page_as_the_site(self):
        """Which is the whole reason there are two lists of icons.

        A launcher full of identical toolboxes tells you nothing, so a tool
        installs as the emoji beside its own heading. That icon lives in the
        tool's folder and is copied into all ten of them, so a relative `src` is
        the only form that finds the copy for the language being installed - and
        the site mark, shared by every front page, is the only one that can be
        named from the root.
        """
        tool = json.loads((self.out / self.a_tool() / 'manifest.json')
                          .read_text(encoding='utf-8'))
        site = json.loads((self.out / 'manifest.json')
                          .read_text(encoding='utf-8'))

        for icon in tool['icons']:
            with self.subTest(icon=icon['src']):
                self.assertFalse(icon['src'].startswith('/'))
        for icon in site['icons']:
            with self.subTest(icon=icon['src']):
                self.assertTrue(icon['src'].startswith('/'))

    def test_a_tool_ships_a_maskable_icon_and_a_plain_one(self):
        """Android crops an icon and Chrome on the desktop does not, so a tool
        that shipped only one of the two either loses its edges on a phone or
        looks lost in a window on a laptop."""
        manifest = json.loads((self.out / self.a_tool() / 'manifest.json')
                              .read_text(encoding='utf-8'))
        purposes = [icon.get('purpose') for icon in manifest['icons']]
        self.assertIn('maskable', purposes)
        self.assertIn(None, purposes)

    def test_a_manifest_is_precached_with_the_page_it_belongs_to(self):
        slug = self.a_tool()
        worker = (self.out / slug / 'sw.js').read_text(encoding='utf-8')
        self.assertIn("'manifest.json'", worker)

    def test_a_tool_page_carries_a_policy_and_its_structured_data(self):
        slug = sorted(p.parent.name for p in ROOT.glob('tools/*/tool.toml'))[0]
        page = (self.out / slug / 'index.html').read_text(encoding='utf-8')
        self.assertIn('Content-Security-Policy', page)
        self.assertIn('application/ld+json', page)
        self.assertIn('SoftwareApplication', page)

    def test_the_stylesheet_is_asked_for_by_a_versioned_url(self):
        slug = sorted(p.parent.name for p in ROOT.glob('tools/*/tool.toml'))[0]
        page = (self.out / slug / 'index.html').read_text(encoding='utf-8')
        self.assertIn('styles.css?v=', page)

    def test_the_service_worker_precaches_that_same_url(self):
        # A mismatch would leave the tool styled online and bare offline.
        slug = sorted(p.parent.name for p in ROOT.glob('tools/*/tool.toml'))[0]
        page = (self.out / slug / 'index.html').read_text(encoding='utf-8')
        worker = (self.out / slug / 'sw.js').read_text(encoding='utf-8')
        version = page.split('styles.css?v=')[1].split('"')[0].split("'")[0]
        self.assertIn(f'styles.css?v={version}', worker)

    def test_a_tool_page_asks_its_question(self):
        """The panel, and the one script that can act on it.

        Both halves, because either on its own is a page that looks right and
        does nothing: markup with no script never appears, and a script with no
        markup returns on its first line.
        """
        slug = sorted(p.parent.name for p in ROOT.glob('tools/*/tool.toml'))[0]
        page = (self.out / slug / 'index.html').read_text(encoding='utf-8')
        self.assertIn('id="feedback"', page)
        self.assertIn(f'data-tool="{slug}"', page)
        self.assertIn('/feedback.js?v=', page)
        self.assertTrue((self.out / 'feedback.js').is_file())

    def test_the_question_is_asked_in_the_language_of_the_page(self):
        """A translated tool page asks in that language, not in English.

        The frame's words fall back to English wherever a locale has not
        written them, and a fallback is not an error - so without this, adding a
        string to the frame and never translating it would show up as an English
        sentence in the middle of a Japanese page and nothing would say so.

        Read off the two <p class="feedback-q"> the panel renders rather than
        off the whole page, because the whole page also carries the partial's
        own comment, and that comment quotes the English question.
        """
        finished = [locale for locale in self.locales
                    if not locale['is_base'] and locale['complete']]
        if not finished:
            self.skipTest('no locale has finished the frame')

        def questions(page):
            return re.findall(r'<p class="feedback-q">(.*?)</p>',
                              page.read_text(encoding='utf-8'), re.S)

        slug = sorted(p.parent.name for p in ROOT.glob('tools/*/tool.toml'))[0]
        english = questions(self.out / slug / 'index.html')
        self.assertEqual(len(english), 2, 'the panel asks two questions')

        for locale in finished:
            with self.subTest(lang=locale['lang']):
                path = buildmod.i18n.locale_path(locale, slug).strip('/')
                asked = questions(self.out / path / 'index.html')
                self.assertEqual(len(asked), len(english))
                for said, in_english in zip(asked, english):
                    self.assertNotEqual(said.strip(), in_english.strip())

    def test_the_hub_does_not_ask_it(self):
        """Nothing to download there, so nothing to ask about."""
        hub = (self.out / 'index.html').read_text(encoding='utf-8')
        self.assertNotIn('id="feedback"', hub)
        self.assertNotIn('feedback.js', hub)

    def test_a_vendored_engine_is_copied_and_precached(self):
        """Any tool with a vendor/ folder gets it byte for byte, and cached.

        Read off the repository rather than naming the one tool that has one:
        the rule is about the folder, not about libheif, and a second vendored
        engine should not also mean remembering to edit a test.
        """
        vendored = sorted(ROOT.glob('tools/*/vendor'))
        if not vendored:
            self.skipTest('no tool vendors anything')

        for folder in vendored:
            slug = folder.parent.name
            worker = (self.out / slug / 'sw.js').read_text(encoding='utf-8')
            for source in sorted(folder.rglob('*')):
                if not source.is_file():
                    continue
                name = f'vendor/{source.relative_to(folder).as_posix()}'
                with self.subTest(file=f'{slug}/{name}'):
                    built = self.out / slug / name
                    self.assertTrue(built.is_file(), name)
                    # Byte for byte: a codec that went through the minifier, or
                    # through anything else, is not the codec that was audited.
                    self.assertEqual(built.read_bytes(), source.read_bytes())
                    # And offline, or the tool stops working with the network
                    # unplugged, which is the one thing it promises.
                    self.assertIn(f"'{name}'", worker)

    # -- the language a visitor is served ---------------------------------
    #
    # shared/lang.js reads the page rather than being told about it: the set of
    # languages it may send somebody to is the rel="alternate" set in the head,
    # which is the same set the sitemap and the switcher come from. So what is
    # worth testing here is that the three parts are on the page at all, and
    # that they agree with each other - a switcher on a page with no alternates
    # would be a control that offers a language the crawler is not told exists.

    def test_the_language_script_is_written_once_at_the_root(self):
        self.assertTrue((self.out / 'lang.js').is_file())
        # Written by the Emitter rather than copied by copy_shared, so that it
        # is minified like every other script the site serves.
        self.assertIn('abox-lang', (self.out / 'lang.js').read_text(encoding='utf-8'))

    def test_every_page_asks_for_the_language_script_by_a_versioned_url(self):
        """One URL, root-absolute, the same on every page in every language.

        The version matters more here than it does for the stylesheet: a tool
        page's service worker caches whatever same-origin file it is asked for,
        and its cache is only emptied when one of the files it was built with
        changes - which this one is not.
        """
        # This build does not minify, so the file on disk is the string that
        # was hashed, byte for byte.
        version = buildmod.sitelib.text_hash(
            (self.out / 'lang.js').read_text(encoding='utf-8'))
        asked = f'<script src="/lang.js?v={version}"></script>'
        for name in self.written:
            if not name.endswith('.html'):
                continue
            with self.subTest(page=name):
                self.assertIn(asked, (self.out / name).read_text(encoding='utf-8'))

    def test_the_notice_is_hidden_in_the_markup(self):
        """A redirect nobody made cannot leave a notice about one behind.

        The box is rendered on every page and unhidden only by the script, on a
        page it has just sent somebody to. With the script blocked it is markup
        and nothing else.
        """
        page = (self.out / 'de' / 'index.html').read_text(encoding='utf-8')
        self.assertIn('<div class="lang-auto" id="lang-auto" role="status" hidden>',
                      page)

    def test_every_page_offers_a_way_out_of_the_language_it_is_in(self):
        """The control is for a person, and a person can always want it.

        This used to be judged per page, together with the hreflang set, on the
        reasoning that the three had to be one answer to one question. The
        result was that a tool nobody had translated yet had fewer than two
        languages to offer and rendered no control at all - five tool pages
        shipped with no way to change language from them.
        """
        for name in self.written:
            if not name.endswith('.html') or name == '404.html':
                continue
            text = (self.out / name).read_text(encoding='utf-8')
            with self.subTest(page=name):
                self.assertIn('<details class="lang-pick">', text)
                self.assertIn('class="lang-switch"', text)

    def test_a_page_never_advertises_a_language_it_does_not_offer(self):
        """What the old rule was really protecting, and this keeps.

        The switcher may now offer MORE than the hreflang set names: it lists
        every published language, marking the ones whose copy of this page is
        still English. What it may never do is name a language in the head that
        a reader cannot then reach from the page - that is the disagreement
        Search Console reports as an hreflang set that does not reciprocate.
        """
        for name in self.written:
            if not name.endswith('.html') or name == '404.html':
                continue
            text = (self.out / name).read_text(encoding='utf-8')
            advertised = set(re.findall(r'<link rel="alternate" hreflang="([^"]+)"',
                                        text)) - {'x-default'}
            if not advertised:
                continue
            switch = text.split('class="lang-switch"', 1)[1]
            offered = set(re.findall(r'(?:hreflang|data-lang|lang)="([^"]+)"', switch))
            with self.subTest(page=name):
                self.assertTrue(advertised <= offered,
                                f'{sorted(advertised - offered)} advertised but '
                                'not offered')

    def test_a_page_nobody_has_translated_offers_english_and_only_english(self):
        """A page no other language has names no alternate in its head, lists no
        language it has not got - and still renders the control, because English
        is the way out of a page the reader cannot read.

        Which page that is comes off the build rather than being named here.
        This used to be spelled `gif-analyzer`, and it failed the day
        gif-analyzer was translated: a test breaking because the site got
        better. Every page now exists in every language, so the loop below
        runs on nothing today, and runs again the moment a tool ships - a tool
        page is written before its translations are, and that is the day this
        markup has to hold.

        Which is why the rule itself is not tested here. `alternates` and
        `switcher` are checked directly, on locales made up for the purpose, in
        test_i18n.APageNobodyHasTranslatedYet; what this adds is that the
        templates render that state the way the functions describe it. The pair
        above covers the other half - a page that DOES name alternates - and
        skips exactly the pages this one looks at.
        """
        for name in self.written:
            if not name.endswith('.html') or name == '404.html':
                continue
            text = (self.out / name).read_text(encoding='utf-8')
            if '<link rel="alternate" hreflang=' in text:
                continue
            switch = text.split('class="lang-switch"', 1)[1].split('</nav>', 1)[0]
            with self.subTest(page=name):
                self.assertIn('<details class="lang-pick">', text)
                self.assertEqual(switch.count('<li>'), 1)
                # And that one entry is English, whatever language the frame
                # around it is in. `lang` rather than `hreflang`, because the
                # entry for the language you are already in is a span with no
                # href to describe.
                self.assertIn('lang="en"', switch)
                for absent in ('lang-partial', 'data-lang'):
                    self.assertNotIn(absent, switch)

    def test_the_switcher_links_this_page_and_not_the_front_door(self):
        """Somebody reading about compressing an image who asks for German
        wants that page in German. The German hub is reached from the English
        hub; the German privacy page is reached from the English one."""
        page = (self.out / 'privacy' / 'index.html').read_text(encoding='utf-8')
        self.assertIn('<a href="/de/datenschutz/" lang="de" hreflang="de">Deutsch</a>', page)

    def test_no_template_tag_survives_into_the_output(self):
        for name in self.written:
            if not name.endswith('.html'):
                continue
            with self.subTest(page=name):
                text = (self.out / name).read_text(encoding='utf-8')
                self.assertNotIn('{{', text)
                self.assertNotIn('{%', text)

    def test_the_sitemap_lists_every_page_of_a_published_language(self):
        """Every page that is offered to a reader is offered to a crawler.

        Published, not built - and published a page at a time. A locale whose
        locale.toml says complete = false is built, so it can be read and
        reviewed at a real address, and is kept out of the sitemap entirely. A
        locale that IS published still keeps out the individual pages it has not
        translated yet. The companion test below checks the other half of that,
        which is the half that matters: nothing half-translated is ever
        advertised.
        """
        sitemap = (self.out / 'sitemap.xml').read_text(encoding='utf-8')
        site = buildmod.sitelib.load_toml(ROOT / 'config' / 'site.toml')
        for name in self.written:
            if not name.endswith('index.html') or self.unpublished(name):
                continue
            slug = name[:-len('index.html')]
            with self.subTest(page=slug or '/'):
                self.assertIn(f'{site["domain"]}{slug}', sitemap)

    def test_an_unfinished_language_is_not_in_the_sitemap(self):
        """The point of `complete = false`.

        A half-translated page invited into an index is how a site ends up
        ranking its untranslated half for the wrong language, and the damage
        outlasts the fix. So the sitemap, the hreflang tags and the language
        switcher are all built from one list of finished languages - see
        i18n.published - and this checks the first of the three.
        """
        sitemap = (self.out / 'sitemap.xml').read_text(encoding='utf-8')
        site = buildmod.sitelib.load_toml(ROOT / 'config' / 'site.toml')
        hidden = [name for name in self.written if self.unpublished(name)]
        self.assertTrue(hidden, 'no unfinished locale in the tree to check')
        for name in hidden:
            # The whole URL, not the path fragment. A bare "es/" is a substring
            # of "guides/", so a locale prefix that happens to fall inside an
            # English slug would report itself as published when it is not.
            slug = name[:-len('index.html')]
            with self.subTest(page=slug):
                self.assertNotIn(f'<loc>{site["domain"]}{slug}</loc>', sitemap)

    def test_every_published_language_has_a_feed_and_no_other_does(self):
        """The fourth thing built from i18n.published, held to the same rule.

        A feed for a language nobody is told about would be a way back into the
        half-translated pages that the sitemap, the hreflang set and the
        switcher all exist to keep out - and a quieter one, because a feed
        reader keeps the URL after the site stops offering it.
        """
        feeds = {name for name in self.written if name.endswith('feed.xml')}
        for locale in buildmod.i18n.published(self.locales):
            with self.subTest(lang=locale['lang']):
                self.assertIn(f'{locale["prefix"]}feed.xml', feeds)
        for lang in self.unfinished:
            with self.subTest(lang=lang):
                self.assertNotIn(f'{lang}/feed.xml', feeds)

    def test_a_feed_is_well_formed_and_stays_in_its_own_language(self):
        """Two failures at once, because they have the same cause.

        A feed is XML that nothing in this build parses, so a stray character
        in a title would ship and only break in the reader - and every title
        here comes from a TOML file where an author may well write an ampersand.
        The second half is the one that would be embarrassing: a German
        subscriber sent to English pages. Both come of assembling entries by
        hand, so both are checked on the built files rather than on the values
        that went into them.
        """
        atom = '{http://www.w3.org/2005/Atom}'
        site = buildmod.sitelib.load_toml(ROOT / 'config' / 'site.toml')
        for locale in buildmod.i18n.published(self.locales):
            home = buildmod.i18n.locale_url(locale, '', site)
            with self.subTest(lang=locale['lang']):
                feed = ElementTree.parse(
                    self.out / locale['prefix'] / 'feed.xml').getroot()
                entries = feed.findall(f'{atom}entry')
                self.assertTrue(entries, 'a feed with no entries in it')
                for entry in entries:
                    link = entry.find(f'{atom}link').get('href')
                    self.assertTrue(
                        link.startswith(home),
                        f'{locale["lang"]} feed points outside its language: {link}')

    def test_every_page_offers_the_feed_of_its_own_language(self):
        """A file nothing links to is a file nobody subscribes to.

        And the language has to match: the German pages offering the English
        feed would be the hreflang mistake again, in a place no crawler reports.
        """
        for locale in buildmod.i18n.published(self.locales):
            expected = f'href="/{locale["prefix"]}feed.xml"'
            pages = [name for name in self.written
                     if name.endswith('index.html')
                     and name.startswith(locale['prefix'])
                     and self.locale_of(name) == locale['prefix']]
            self.assertTrue(pages, f'no pages built for {locale["lang"]}')
            for name in pages:
                with self.subTest(page=name):
                    text = (self.out / name).read_text(encoding='utf-8')
                    self.assertIn(expected, text)

    def locale_of(self, name):
        """The locale prefix a built page sits under, '' for English.

        Worked out from the tree rather than from the locale list, so that a
        page under a slug that merely begins with a language's letters is not
        mistaken for a page in that language.
        """
        head = name.split('/', 1)[0]
        known = {locale['lang'] for locale in self.locales}
        return f'{head}/' if head in known else ''

    def test_an_unfinished_language_is_never_offered(self):
        """The other two of the three: no page anywhere points at it.

        Checked over every page of every language, English included, because
        reciprocity is the property that matters - one page still advertising a
        language the rest of the site has withdrawn is exactly the state Search
        Console reports and nobody can reproduce by looking at one file.
        """
        for locale in self.unfinished:
            for name in self.written:
                if not name.endswith('.html'):
                    continue
                with self.subTest(page=name, lang=locale):
                    text = (self.out / name).read_text(encoding='utf-8')
                    self.assertNotIn(f'hreflang="{locale}"', text)
                    self.assertNotIn(f'href="/{locale}/"', text)

    # -- /llms.txt ------------------------------------------------------
    #
    # The plain-text index, for a reader that fetches one address and decides
    # from it whether the site is worth mentioning. Everything checked here is
    # a way that file can be wrong without anything else on the site noticing:
    # a tool missing from it, markup leaking into it, a blockquote that ends
    # early, or a language offered before it is finished.

    def test_llms_txt_is_written(self):
        self.assertIn('llms.txt', self.written)
        self.assertTrue((self.out / 'llms.txt').is_file())

    def test_llms_txt_begins_with_the_site_name_as_a_heading(self):
        """The one thing the format requires, and the one thing a reader of it
        keys on."""
        site = buildmod.sitelib.load_toml(ROOT / 'config' / 'site.toml')
        first = (self.out / 'llms.txt').read_text(encoding='utf-8').splitlines()[0]
        self.assertEqual(first, f'# {site["name"]}')

    def test_the_llms_txt_summary_is_one_line(self):
        """A wrapped blockquote is a blockquote until markdown reads its second
        line as something else - and this summary's second line began with a
        dash, which is a list, which ends the quote. It is collapsed to one
        line in build_llms for that reason, so this is the guard on it."""
        lines = (self.out / 'llms.txt').read_text(encoding='utf-8').splitlines()
        quote = next(i for i, line in enumerate(lines) if line.startswith('> '))
        self.assertEqual(lines[quote + 1], '')

    def test_llms_txt_lists_every_tool(self):
        text = (self.out / 'llms.txt').read_text(encoding='utf-8')
        site = buildmod.sitelib.load_toml(ROOT / 'config' / 'site.toml')
        slugs = sorted(path.parent.name for path in ROOT.glob('tools/*/tool.toml'))
        self.assertTrue(slugs)
        for slug in slugs:
            with self.subTest(tool=slug):
                self.assertIn(f'({site["domain"]}{slug}/)', text)

    def test_llms_txt_lists_every_guide(self):
        text = (self.out / 'llms.txt').read_text(encoding='utf-8')
        site = buildmod.sitelib.load_toml(ROOT / 'config' / 'site.toml')
        slugs = sorted(path.parent.name
                       for path in ROOT.glob('pages/guides/*/page.toml'))
        self.assertTrue(slugs)
        for slug in slugs:
            with self.subTest(guide=slug):
                self.assertIn(f'({site["domain"]}guides/{slug}/)', text)

    def test_llms_txt_carries_no_markup(self):
        """It is built from config written as HTML fragments, and it is not
        HTML. An &mdash; or a <code> that survives into it is a value that
        skipped site.to_text on the way in."""
        text = (self.out / 'llms.txt').read_text(encoding='utf-8')
        for leak in ('&mdash;', '&amp;', '&#', '<code>', '<a ', '{{', '{%'):
            with self.subTest(leak=leak):
                self.assertNotIn(leak, text)

    def test_llms_txt_offers_exactly_the_languages_the_sitemap_does(self):
        """The same rule as the sitemap and the hreflang tags, and for the same
        reason: a language whose hub is still half English should not be handed
        to something that will quote it."""
        text = (self.out / 'llms.txt').read_text(encoding='utf-8')
        site = buildmod.sitelib.load_toml(ROOT / 'config' / 'site.toml')
        # Only the languages section. A tool's address has the same shape as a
        # language's, so searching the whole file would count `format-json` as a
        # language and pass for the wrong reason.
        after = text.split('## Other languages')[1]
        section = after.split('\n## ')[0]
        listed = set(re.findall(re.escape(site['domain']) + r'([^/)]+)/\)', section))
        for locale in self.locales:
            if locale['is_base']:
                continue
            offered = locale['lang'] in listed
            with self.subTest(lang=locale['lang']):
                self.assertEqual(offered, locale['lang'] in self.advertised)

    def test_the_404_page_is_written(self):
        self.assertIn('404.html', self.written)
        self.assertTrue((self.out / '404.html').is_file())

    def test_the_404_page_is_not_in_the_sitemap(self):
        """It has no address of its own to list.

        Inviting a crawler to index it would be inviting it to serve "not
        found" in place of a real page."""
        sitemap = (self.out / 'sitemap.xml').read_text(encoding='utf-8')
        self.assertNotIn('404', sitemap)

    def test_the_404_page_asks_not_to_be_indexed(self):
        page = (self.out / '404.html').read_text(encoding='utf-8')
        self.assertIn('noindex', page)
        self.assertNotIn('rel="canonical"', page)

    def test_the_404_page_carries_no_advertising(self):
        # Google asks that ads not be placed on error pages, and an advert on
        # top of "we could not find that" is a poor way to meet somebody.
        page = (self.out / '404.html').read_text(encoding='utf-8')
        self.assertNotIn('adsbygoogle', page)
        self.assertNotIn('pagead2.googlesyndication.com/pagead/js', page)

    def test_every_url_on_the_404_page_is_root_absolute(self):
        """It is served at whatever address was asked for.

        A visitor who mistypes /compress-imag/ gets this file while the browser
        still believes it is in a folder of that name, so a relative link would
        resolve against a folder that does not exist and the page would arrive
        unstyled."""
        page = (self.out / '404.html').read_text(encoding='utf-8')
        for attribute in ('href', 'src'):
            for match in re.finditer(attribute + r'="([^"]+)"', page):
                url = match.group(1)
                if url.startswith(('http://', 'https://', 'data:', '#', 'mailto:')):
                    continue
                with self.subTest(url=url):
                    self.assertTrue(url.startswith('/'), f'{attribute}="{url}" is relative')

    def test_the_404_page_links_every_tool(self):
        page = (self.out / '404.html').read_text(encoding='utf-8')
        for path in ROOT.glob('tools/*/tool.toml'):
            with self.subTest(tool=path.parent.name):
                self.assertIn(f'/{path.parent.name}/', page)

    def test_every_guide_in_the_repository_got_a_page(self):
        slugs = sorted(p.parent.name for p in ROOT.glob('pages/guides/*/page.toml'))
        self.assertTrue(slugs)
        for slug in slugs:
            with self.subTest(guide=slug):
                self.assertIn(f'guides/{slug}/index.html', self.written)

    def test_the_guides_index_links_every_guide(self):
        index = (self.out / 'guides' / 'index.html').read_text(encoding='utf-8')
        for path in ROOT.glob('pages/guides/*/page.toml'):
            with self.subTest(guide=path.parent.name):
                self.assertIn(f'guides/{path.parent.name}/', index)

    def test_every_page_footer_reaches_the_guides_index(self):
        # The footer is the second navigation, and the index is the one link in
        # it that keeps working however long the list of guides grows.
        #
        # In its OWN language. The index a German page links to is
        # /de/ratgeber/, not /guides/, and a footer that reached across into
        # English would be the one link on the page that changed the language
        # without saying so.
        for locale in self.locales:
            index = locale['slugs'].get('guides', 'guides')
            wanted = re.compile(r'href="(\.\./|\./|/)*' + re.escape(index) + '/"')
            for name in self.written:
                if not name.endswith('.html') or not self.belongs(name, locale):
                    continue
                with self.subTest(page=name):
                    self.assertRegex(
                        (self.out / name).read_text(encoding='utf-8'), wanted)

    def belongs(self, name, locale):
        """Whether a written page is a page of this language.

        The 404 is nobody's: it is served for the whole domain and is built in
        English, so it is left out rather than counted against every language
        in turn.
        """
        if name == '404.html':
            return False
        if locale['is_base']:
            return not any(name.startswith(f'{other["lang"]}/')
                           for other in self.locales if not other['is_base'])
        return name.startswith(f'{locale["lang"]}/')

    def test_the_footer_links_the_index_rather_than_every_guide(self):
        """One link, not a column that grows by a line per guide.

        Checked on the privacy page, because it is the one kind of page whose
        own prose links no guide at all - so anything matching here could only
        have come from the footer."""
        names = sorted(p.parent.name for p in ROOT.glob('pages/guides/*/page.toml'))
        self.assertTrue(names)
        legal = (self.out / 'privacy' / 'index.html').read_text(encoding='utf-8')
        for guide in names:
            with self.subTest(guide=guide):
                self.assertNotIn(f'guides/{guide}/', legal)

    def test_a_guide_and_its_tool_link_to_each_other(self):
        """One line - `tool` in the guide's page.toml - makes both halves.

        Checking both directions is the point: written as two settings they
        could disagree about which page is about which, and the way that shows
        up is a tool page pointing at a guide that never mentions it."""
        pages = ROOT.glob('pages/guides/*/page.toml')
        pairs = [(p.parent.name, buildmod.sitelib.load_toml(p).get('tool'))
                 for p in pages]
        pairs = [(guide, tool) for guide, tool in pairs if tool]
        self.assertTrue(pairs)
        for guide, tool in pairs:
            with self.subTest(guide=guide):
                tool_page = (self.out / tool / 'index.html').read_text(encoding='utf-8')
                self.assertIn(f'../guides/{guide}/', tool_page)
                guide_page = (self.out / 'guides' / guide / 'index.html'
                              ).read_text(encoding='utf-8')
                self.assertIn(f'../../{tool}/', guide_page)

    def test_shared_files_are_copied_but_the_css_sources_are_not(self):
        self.assertTrue((self.out / 'robots.txt').is_file())
        self.assertTrue((self.out / 'site.css').is_file())
        # shared/css is an input to the assembled stylesheets, not a file
        # anyone fetches.
        self.assertFalse((self.out / 'css').exists())

    def test_every_file_written_uses_lf(self):
        for path in self.out.rglob('*'):
            if not path.is_file() or path.suffix not in ('.html', '.css', '.js', '.xml'):
                continue
            with self.subTest(file=path.name):
                self.assertNotIn(b'\r\n', path.read_bytes())

    def test_building_twice_gives_the_same_bytes(self):
        """Nothing here depends on the machine, the clock, or directory order.

        That is what makes `python build.py --check` mean anything.
        """
        with tempfile.TemporaryDirectory() as second:
            other = Path(second) / 'dist'
            buildmod.build(other, clean=True, minify_output=False)
            # The comparison below is the first thing to open every one of
            # these ten thousand fresh files - see warm() on what that costs
            # read one at a time.
            warm(other)
            for path in sorted(self.out.rglob('*')):
                if not path.is_file():
                    continue
                name = path.relative_to(self.out)
                with self.subTest(file=name.as_posix()):
                    self.assertEqual(path.read_bytes(),
                                     (other / name).read_bytes())


class BuildMinified(unittest.TestCase):
    def test_a_minified_build_produces_the_same_file_list(self):
        """The readable build is the reference the minified one is judged
        against - the same check CI runs against the deployed output."""
        with tempfile.TemporaryDirectory() as tmp:
            plain = Path(tmp) / 'plain'
            small = Path(tmp) / 'small'
            buildmod.build(plain, clean=True, minify_output=False)
            buildmod.build(small, clean=True, minify_output=True)
            self.assertEqual(
                sorted(p.relative_to(plain).as_posix() for p in plain.rglob('*')),
                sorted(p.relative_to(small).as_posix() for p in small.rglob('*')))


class BuildDeployed(unittest.TestCase):
    """The names the outside world knows this site by, in the built output.

    This class exists because of one bug. `gtag` is a function declaration in
    analytics.js, and the build used to rename declarations - so on the live
    site the global was called something else and `window.gtag` was undefined.
    shared/feedback.js looked it up by that name and returned when it found
    nothing, so every answer anybody gave was dropped, in production only. It
    worked perfectly everywhere it was tested and nowhere that mattered.

    Renaming is gone now, which removes the cause. These stay anyway, because
    what they actually assert is not "the mangler left this alone" but "the
    file that gets deployed still publishes the names other people read it by"
    - a global, an event name, three parameter names. A minifier that broke one
    of those would fail in exactly the same silent way.
    """

    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        cls.out = Path(cls.tmp.name) / 'deployed'
        buildmod.build(cls.out, clean=True, minify_output=True)

    @classmethod
    def tearDownClass(cls):
        cls.tmp.cleanup()

    def test_the_measurement_global_keeps_its_name(self):
        """`gtag` is an interface, not an internal.

        Anything else on the page that measures anything reaches for this by
        name, because that is the name Google's own documentation gives it.
        """
        analytics = (self.out / 'analytics.js').read_text(encoding='utf-8')
        self.assertIn('window.gtag=', analytics.replace(' ', ''))

    def test_the_feedback_event_keeps_every_name_it_is_read_by(self):
        """The event name and its three parameters are strings in a report.

        A parameter name that came out wrong would arrive at Google as a
        dimension nobody had registered, which reports as nothing at all rather
        than as an error.
        """
        feedback = (self.out / 'feedback.js').read_text(encoding='utf-8')
        for name in ('tool_feedback', 'tool_slug', 'verdict', 'reason'):
            with self.subTest(name=name):
                self.assertIn(name, feedback)

    def test_the_answer_is_pushed_to_the_queue_rather_than_through_a_global(self):
        """The fix itself, pinned.

        `dataLayer` is a property and cannot be renamed; a global function
        could be. Reaching for the queue is what made this survive a build that
        renamed declarations, and is worth keeping now that one does not.
        """
        feedback = (self.out / 'feedback.js').read_text(encoding='utf-8')
        self.assertIn('dataLayer', feedback)
        self.assertNotIn('window.gtag', feedback)


if __name__ == '__main__':
    unittest.main()
