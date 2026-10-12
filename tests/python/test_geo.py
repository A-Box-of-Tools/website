"""Help changes must be discoverable without mistaking shared UI for content."""

import json
import re
import tempfile
import unittest
from pathlib import Path

import build as buildmod
import indexnow
from buildlib import landing, site


_BUILD = None


def site_build():
    """Keep this module's readable build alive until its own cleanup runs.

    Discovery finishes test_build before reaching this module, so reusing
    that module's cached path would read a directory its cleanup deleted.
    """
    global _BUILD
    if _BUILD is None:
        temporary = tempfile.TemporaryDirectory()

        def cleanup():
            global _BUILD
            _BUILD = None
            temporary.cleanup()

        unittest.addModuleCleanup(cleanup)
        out = Path(temporary.name) / 'site'
        written = buildmod.build(out, clean=True, minify_output=False)
        _BUILD = (out, written)
    return _BUILD


class ContentBoundaries(unittest.TestCase):
    def fingerprint(self, source):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'index.html'
            path.write_bytes(source.encode('utf-8'))
            return indexnow.content_of(path)

    def test_nested_frame_elements_and_void_tags_do_not_hide_later_content(self):
        source = ('<main>开始<section data-indexnow-ignore><div><img src="a">'
                  '<span>navigation</span></div></section><p>answer</p></main>')
        self.assertEqual(self.fingerprint(source), '<main>开始<p>answer</p></main>'.encode())
        self.assertEqual(self.fingerprint(source), self.fingerprint(source.replace('navigation', 'new link')))
        self.assertNotEqual(self.fingerprint(source), self.fingerprint(source.replace('answer', 'correction')))

    def test_the_built_tool_help_is_inside_the_only_main(self):
        out, written = site_build()
        count = 0
        for name in written:
            if not name.endswith('index.html'):
                continue
            source = (out / name).read_text(encoding='utf-8')
            if 'class="faq-list"' not in source:
                continue
            count += 1
            content = indexnow.content_of(out / name).decode('utf-8')
            self.assertIn('id="how-to-h"', content, name)
            self.assertIn('id="faq-h"', content, name)
            self.assertNotIn('class="tool-next"', content, name)
            self.assertNotIn('id="page-markdown"', content, name)
            self.assertEqual(len(re.findall(r'<main\b', indexnow.COMMENT.sub(b'', source.encode()).decode())), 1, name)
        self.assertGreater(count, 300)

    def test_a_real_faq_correction_changes_the_fingerprint_but_frame_copy_does_not(self):
        out, _ = site_build()
        source = (out / 'trim-video/index.html').read_text(encoding='utf-8')
        original = self.fingerprint(source)
        correction = source.replace('<h2 id="faq-h">', '<p>Corrected mode limitations.</p><h2 id="faq-h">', 1)
        self.assertNotEqual(original, self.fingerprint(correction))
        frame = source.replace('class="page-md"', 'class="page-md revised-control"', 1)
        frame = frame.replace('class="tool-next"', 'class="tool-next revised-navigation"', 1)
        frame = re.sub(r'(<script data-indexnow-ignore src=")[^"]+', r'\1/new-copy-script.js', frame)
        self.assertEqual(original, self.fingerprint(frame))


class EvidenceAndEntities(unittest.TestCase):
    def test_source_links_reject_insecure_or_credentialed_urls(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / 'landing').mkdir()
            tool = {'dir': root, 'slug': 'id-photo',
                    'landing': {key: key for key in landing.REQUIRED}}
            for url in ('http://example.org/rule', 'javascript:alert(1)',
                        'https://user:secret@example.org/rule', 'https:///rule',
                        'https://example.org/a b', 'https://[invalid/rule',
                        'https://example.org:bad/rule', None, ['https://example.org/rule']):
                (root / landing.DATA).write_bytes(json.dumps({'pages': [
                    {'id': 'sample', 'source_url': url}]}).encode())
                with self.subTest(url=url), self.assertRaises(site.ConfigError):
                    landing.load(tool)
            (root / landing.DATA).write_bytes(json.dumps({'pages': [
                {'id': 'sample', 'source_url': 'https://example.org/rule?a=1&b=2'}]}).encode())
            self.assertEqual(len(landing.load(tool)), 1)

    def test_application_text_and_entity_references_match_the_visible_page(self):
        root = {'name': 'abox.tools', 'domain': 'https://abox.tools/',
                'home': 'https://abox.tools/', 'lang': 'en'}
        tool = {'name': 'Image &amp; Text', 'url': 'https://abox.tools/sample/',
                'lastmod': '2026-10-12',
                'schema': {'category': 'UtilitiesApplication',
                           'description': 'A &amp; B', 'features': ['Local &mdash; output']},
                'faq': [{'q': 'Can I use &lt;img&gt;?', 'a': 'Keep <code>&lt;img&gt;</code> literal.'}]}
        graph = json.loads(site.tool_jsonld(root, tool))['@graph']
        app = graph[0]
        self.assertEqual(app['@id'], tool['url'] + '#app')
        self.assertEqual(app['publisher']['@id'], root['domain'] + '#publisher')
        self.assertEqual(app['featureList'], ['Local - output'])
        self.assertEqual(app['name'], 'Image & Text')
        self.assertEqual(graph[2]['mainEntity'][0]['acceptedAnswer']['text'], 'Keep <img> literal.')

    def test_article_images_are_only_the_screenshots_visible_in_that_body(self):
        root = {'name': 'abox.tools', 'domain': 'https://abox.tools/',
                'home': 'https://abox.tools/', 'guides_url': 'https://abox.tools/guides/',
                'guides': {'heading': 'Guides'}, 'lang': 'en'}
        page = {'kind': 'guide', 'url': 'https://abox.tools/guides/sample/',
                'heading': 'Sample', 'nav': 'Sample', 'description': 'Example',
                'published': '2026-09-01', 'lastmod': '2026-10-12',
                'shots': {'/screens/sample/visible.webp': (1200, 600),
                          '/screens/sample/absent.webp': (800, 400)}}
        body = '<img src="/screens/sample/visible.webp" alt="Output">'
        article = json.loads(site.page_jsonld(root, page, body))['@graph'][0]
        self.assertEqual(article['image'], [{'@type': 'ImageObject',
            'url': 'https://abox.tools/screens/sample/visible.webp', 'width': 1200, 'height': 600}])
        empty = json.loads(site.page_jsonld(root, page, 'No screenshot.'))['@graph'][0]
        self.assertNotIn('image', empty)

    def test_the_published_observations_and_summary_totals_agree(self):
        root = Path(__file__).resolve().parents[2]
        data = json.loads((root / 'shared/data/converter-observations-2026-09-17.json').read_text(encoding='utf-8'))
        rows = data['observations']
        self.assertEqual(len(rows), 20)
        self.assertEqual(sum(row['reported_upload'] for row in rows), 19)
        self.assertEqual(sum(row['reported_timing'] == 'selection' for row in rows), 13)
        self.assertEqual(data['summary']['reported_uploads_on_selection'], 13)
        self.assertIn('not a new run', data['provenance'])
