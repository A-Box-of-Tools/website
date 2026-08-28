"""
indexnow.py: which URLs a deploy tells Bing about, and the key that lets it.

Two things here are worth a test and the rest is not. The first is the
selection rule, because getting it wrong is invisible: submitting too few
means the protocol quietly does nothing for the site, and submitting every
page on every deploy means the host stops being trusted and the protocol
quietly does nothing for the site. Neither shows up anywhere but in a Bing
Webmaster Tools chart weeks later. The rule used to read `lastmod` and it
failed the first way, silently, for sixteen deploys in one day: a date cannot
express a second change to a page on the day it already names. So what is
compared now is the bytes inside <main>, and what is tested is that the frame
around it cannot leak in.

The second is that the key in the script and the key file served at the site
root have to be the same string. A mismatch is not an error either: the
submission is accepted, validation fails out of band, and the URLs are
dropped. That one is a single assertion and it removes a whole class of
silent breakage.
"""

import json
import pathlib
import tempfile
import unittest

import indexnow

ROOT = pathlib.Path(indexnow.__file__).resolve().parent


def sitemap(*pages):
    """A sitemap holding the given (url, lastmod) pairs.

    Written out in full rather than assembled from the real template, because
    the point is to test the reader against the format, not against whatever
    the template happens to emit today.
    """
    entries = ''.join(
        f'  <url>\n'
        f'    <loc>{url}</loc>\n'
        f'    <lastmod>{lastmod}</lastmod>\n'
        f'    <changefreq>monthly</changefreq>\n'
        f'    <priority>0.8</priority>\n'
        f'  </url>\n'
        for url, lastmod in pages)
    return ('<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
            f'{entries}</urlset>')


class ReadingASitemap(unittest.TestCase):

    def read(self, text):
        path = pathlib.Path(
            self.enterContext(tempfile.TemporaryDirectory())) / 'sitemap.xml'
        path.write_bytes(text.encode('utf-8'))
        return indexnow.read_sitemap(path)

    def test_the_namespace_does_not_hide_the_entries(self):
        """The real sitemap declares a default namespace, so every element is
        named {sitemaps.org/...}url rather than url. A reader written against
        an example without one finds nothing and reports no change, forever."""
        pages = self.read(sitemap(('https://abox.tools/', '2026-08-01')))
        self.assertEqual(pages, {'https://abox.tools/': '2026-08-01'})

    def test_the_order_is_the_sitemaps(self):
        pages = self.read(sitemap(('https://abox.tools/', '2026-08-01'),
                                  ('https://abox.tools/crop-video/', '2026-07-02'),
                                  ('https://abox.tools/de/', '2026-08-01')))
        self.assertEqual(list(pages), ['https://abox.tools/',
                                       'https://abox.tools/crop-video/',
                                       'https://abox.tools/de/'])


class ChoosingWhatToSubmit(unittest.TestCase):

    def test_a_new_page_is_submitted(self):
        old = {'https://abox.tools/': 'aaaa'}
        new = {'https://abox.tools/': 'aaaa',
               'https://abox.tools/split-pdf/': 'bbbb'}
        self.assertEqual(indexnow.changed(old, new),
                         ['https://abox.tools/split-pdf/'])

    def test_a_moved_digest_is_submitted(self):
        old = {'https://abox.tools/crop-video/': 'aaaa'}
        new = {'https://abox.tools/crop-video/': 'bbbb'}
        self.assertEqual(indexnow.changed(old, new),
                         ['https://abox.tools/crop-video/'])

    def test_an_unchanged_site_submits_nothing(self):
        pages = {'https://abox.tools/': 'aaaa',
                 'https://abox.tools/crop-video/': 'bbbb',
                 'https://abox.tools/de/': 'cccc'}
        self.assertEqual(indexnow.changed(pages, dict(pages)), [])

    def test_a_page_that_left_the_sitemap_is_not_submitted(self):
        """A retired tool becomes a redirect stub, so its address goes on
        answering 200 and there is nothing to tell anyone about."""
        old = {'https://abox.tools/text-tools/': 'aaaa'}
        self.assertEqual(indexnow.changed(old, {}), [])

    def test_the_submitted_order_follows_the_new_sitemap(self):
        old = {}
        new = {'https://abox.tools/': 'aaaa',
               'https://abox.tools/split-pdf/': 'bbbb'}
        self.assertEqual(indexnow.changed(old, new), list(new))


PAGE = ('<!doctype html><html lang="en"><head><title>{title}</title></head>'
        '<body><nav class="crumbs">{crumbs}</nav>'
        '<header class="topbar">{header}</header>'
        '<main id="main">{main}</main>'
        '<footer>{footer}</footer></body></html>')


def page(main='the tool', crumbs='Home', header='abox.tools',
         footer='every tool', title='A tool'):
    return PAGE.format(main=main, crumbs=crumbs, header=header,
                       footer=footer, title=title)


class ComparingWhatThePageSays(unittest.TestCase):
    """The signal itself: <main> and nothing around it."""

    def digest(self, html):
        path = pathlib.Path(
            self.enterContext(tempfile.TemporaryDirectory())) / 'index.html'
        path.write_bytes(html.encode('utf-8'))
        return indexnow.content_of(path)

    def test_the_frame_around_it_is_not_compared(self):
        """The case this whole design exists for, and the one a byte diff gets
        wrong. The footer names every tool, the header carries the language
        switcher, the crumbs carry the section - shipping a tool or moving a
        colour rewrites all three on all twelve hundred pages. #221 changed one
        CSS property and rewrote 468 of them while moving nobody's words."""
        self.assertEqual(
            self.digest(page(crumbs='Home', header='a', footer='b',
                             title='A tool')),
            self.digest(page(crumbs='Home / Tools', header='z', footer='y',
                             title='A different title')))

    def test_a_word_inside_it_is_compared(self):
        self.assertNotEqual(self.digest(page(main='已不再分享')),
                            self.digest(page(main='已不再共享')))

    def test_a_comment_that_mentions_main_does_not_start_the_match(self):
        """templates/tool.html explains itself in a comment containing the
        characters "<main>". A reader that did not strip comments first starts
        its match there and swallows the header, the crumbs and the pledge
        banner - so every frame change would submit every page, which is the
        one thing this must never do. Minified pages carry no comments, so
        production would have looked fine until somebody built with
        --no-minify."""
        commented = PAGE.replace(
            '<body>',
            '<body><!-- the skip link lands on the <main> below -->')
        plain = self.digest(page(header='a'))
        with_comment = self.digest(
            commented.format(main='the tool', crumbs='Home', header='a',
                             footer='every tool', title='A tool'))
        self.assertEqual(plain, with_comment)

    def test_a_page_with_no_main_is_refused_rather_than_guessed_at(self):
        """Falling back to the whole file would quietly restore the byte diff
        for that one page: submitted on every unrelated deploy, forever, with
        nothing to say so."""
        with self.assertRaises(ValueError):
            self.digest('<!doctype html><html><body><p>no main</p></body>'
                        '</html>')

    def test_the_opening_tag_may_carry_attributes(self):
        """The build emits <main id="main"> for the skip link to land on."""
        self.assertIn(b'the tool', self.digest(page()))


class FindingAPageInTheTree(unittest.TestCase):

    def test_a_slug_becomes_its_directory_index(self):
        self.assertEqual(
            indexnow.page_path('_site', 'https://abox.tools/crop-video/'),
            pathlib.Path('_site', 'crop-video', 'index.html'))

    def test_the_root_is_the_top_index(self):
        self.assertEqual(indexnow.page_path('_site', 'https://abox.tools/'),
                         pathlib.Path('_site', 'index.html'))

    def test_a_translated_slug_is_not_decoded_on_the_way_in(self):
        """The sitemap carries these as the characters themselves and the build
        writes directories under exactly those names, so nothing is unquoted
        here. The percent-encoding happens later, in as_uri, and to a copy."""
        self.assertEqual(
            indexnow.page_path('_site', 'https://abox.tools/ar/ضغط-الصور/'),
            pathlib.Path('_site', 'ar', 'ضغط-الصور', 'index.html'))

    def test_a_sitemap_url_the_tree_does_not_hold_is_refused(self):
        """A build that disagrees with its own sitemap. Skipping the page would
        mean never announcing it again, and never saying why."""
        tmp = pathlib.Path(self.enterContext(tempfile.TemporaryDirectory()))
        (tmp / 'sitemap.xml').write_bytes(
            sitemap(
                ('https://abox.tools/gone/', '2026-08-01')).encode('utf-8'))
        with self.assertRaises(ValueError):
            indexnow.hashes(tmp, tmp / 'sitemap.xml')


class TheHostInTheSubmission(unittest.TestCase):

    def test_one_host_is_taken_from_the_urls(self):
        self.assertEqual(
            indexnow.host_of(['https://abox.tools/', 'https://abox.tools/de/']),
            'abox.tools')

    def test_two_hosts_are_refused(self):
        """Every URL in a submission has to be on the host the submission
        names, or the request is rejected whole. Finding that out here beats
        finding it out from a 422 in a deploy log."""
        with self.assertRaises(ValueError):
            indexnow.host_of(['https://abox.tools/', 'https://example.com/'])


class EscapingTheTranslatedSlugs(unittest.TestCase):
    """Nine of the fifteen languages have slugs that are not ASCII, and the
    sitemap carries them as the characters themselves - 137 of its 1047 URLs
    on the day this was written. They read correctly and they resolve, but a
    URI is defined over ASCII, so they are escaped on the way out."""

    def test_an_arabic_slug_is_percent_encoded(self):
        self.assertEqual(
            indexnow.as_uri('https://abox.tools/ar/محرر/'),
            'https://abox.tools/ar/%D9%85%D8%AD%D8%B1%D8%B1/')

    def test_an_ascii_url_is_left_exactly_as_it_was(self):
        for url in ('https://abox.tools/',
                    'https://abox.tools/crop-video/',
                    'https://abox.tools/de/video-zuschneiden/'):
            with self.subTest(url=url):
                self.assertEqual(indexnow.as_uri(url), url)

    def test_the_separators_are_not_encoded(self):
        """quote() with the wrong safe list turns the slashes into %2F, which
        is not an escaped address but a different one."""
        encoded = indexnow.as_uri('https://abox.tools/ja/画像/')
        self.assertTrue(encoded.startswith('https://abox.tools/ja/'))
        self.assertTrue(encoded.endswith('/'))
        self.assertNotIn('%2F', encoded)

    def test_what_goes_on_the_wire_is_ascii_and_still_points_home(self):
        sent = {}

        class Response:
            status = 200

            def __enter__(self):
                return self

            def __exit__(self, *exc):
                return False

        def opener(request, timeout=None):
            sent['body'] = json.loads(request.data.decode('utf-8'))
            return Response()

        indexnow.submit(['https://abox.tools/ko/자르기/',
                         'https://abox.tools/crop-video/'], opener=opener)
        self.assertEqual(sent['body']['host'], 'abox.tools')
        self.assertEqual(sent['body']['keyLocation'],
                         f'https://abox.tools/{indexnow.KEY}.txt')
        for url in sent['body']['urlList']:
            with self.subTest(url=url):
                self.assertTrue(url.isascii())
                self.assertTrue(url.startswith('https://abox.tools/'))


class TheKeyFile(unittest.TestCase):

    def test_the_key_is_served_at_the_root_under_its_own_name(self):
        """The protocol proves the sender owns the host by fetching
        https://<host>/<key>.txt and finding the key inside. shared/ is copied
        to the site root, so the file living there is the whole of publishing
        it - but nothing in the build would notice if the two strings drifted
        apart, and a submission with a stale key is accepted and then silently
        dropped."""
        path = ROOT / 'shared' / f'{indexnow.KEY}.txt'
        self.assertTrue(path.is_file(), f'{path.name} is not in shared/')
        self.assertEqual(path.read_bytes().decode('utf-8').strip(),
                         indexnow.KEY)

    def test_the_key_is_the_shape_the_protocol_accepts(self):
        """Eight to 128 characters, and only hex digits and dashes. A key
        outside that is refused at submission time."""
        self.assertTrue(8 <= len(indexnow.KEY) <= 128)
        self.assertTrue(set(indexnow.KEY) <= set('0123456789abcdef-'))


if __name__ == '__main__':
    unittest.main()
