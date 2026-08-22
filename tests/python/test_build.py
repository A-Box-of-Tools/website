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
import re
import subprocess
import tempfile
import unittest
from pathlib import Path

import build as buildmod
from buildlib import mangle


ROOT = Path(__file__).resolve().parents[2]


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
    SITE = {'source_url': 'https://example.test/repo',
            'build': {'esbuild_version': '0.25.0'}}

    def test_the_banner_names_the_source_and_the_check_command(self):
        emitter = buildmod.Emitter(True, self.SITE)
        self.assertIn('https://example.test/repo', emitter.js_banner)
        self.assertIn('build.py --check', emitter.js_banner)

    def test_the_mangled_banner_says_so(self):
        emitter = buildmod.Emitter(True, self.SITE)
        self.assertIn('mangled', emitter.js_mangled_banner)

    def test_mangling_without_minifying_is_refused(self):
        # Mangling is minifying, and more of it.
        with self.assertRaises(mangle.MangleError) as caught:
            buildmod.Emitter(False, self.SITE, mangle_names=True)
        self.assertIn('contradict', str(caught.exception))

    def test_mangling_needs_a_pinned_version(self):
        site = {'source_url': 'https://example.test/repo'}
        with self.assertRaises(mangle.MangleError) as caught:
            buildmod.Emitter(True, site, mangle_names=True)
        self.assertIn('esbuild_version', str(caught.exception))

    def test_not_mangling_never_looks_for_esbuild(self):
        self.assertIsNone(buildmod.Emitter(True, self.SITE).esbuild)


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
                     'src/main.js'):
            with self.subTest(file=name):
                self.assertTrue((self.out / slug / name).is_file(), name)

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
        against - the same check CI runs against the mangled output."""
        with tempfile.TemporaryDirectory() as tmp:
            plain = Path(tmp) / 'plain'
            small = Path(tmp) / 'small'
            buildmod.build(plain, clean=True, minify_output=False)
            buildmod.build(small, clean=True, minify_output=True)
            self.assertEqual(
                sorted(p.relative_to(plain).as_posix() for p in plain.rglob('*')),
                sorted(p.relative_to(small).as_posix() for p in small.rglob('*')))


if __name__ == '__main__':
    unittest.main()
