"""A downloadable local tool must contain its runtime and no public frame."""

from pathlib import Path
import tempfile
import unittest
from zipfile import ZipFile

from buildlib.local_bundle import write_bundle
from buildlib.template import Loader

ROOT = Path(__file__).resolve().parents[2]


class LocalBundleTests(unittest.TestCase):
    def test_bundle_is_complete_private_and_reproducible(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            source, dest = root / 'source', root / 'built'
            (source / 'local').mkdir(parents=True)
            (dest / 'src' / 'shared').mkdir(parents=True)
            (source / 'local' / 'helper.py').write_bytes(b'print("local")\n')
            (source / 'README.md').write_bytes(b'Run python helper.py.\n')
            (dest / 'src' / 'main.js').write_bytes(b'import "./shared/phrases.js?v=abc";\n')
            (dest / 'src' / 'shared' / 'phrases.js').write_bytes(b'export const phrase = () => "";\n')
            (root / 'base.css').write_bytes(b'body { margin: 0; }\n')
            tool = {'slug': 'walkie-talkie', 'local_bundle': True, 'dir': source,
                    'name': 'Voice', 'heading': 'Voice', 'tagline': 'Local voice'}
            templates = Loader(ROOT / 'templates')
            args = (dest, templates, tool, '<main id="main"><p>Local</p>',
                    'p { color: black; }', root / 'base.css', 'abc', 'en')
            write_bundle(*args)
            package = dest / 'walkie-talkie.zip'
            first = package.read_bytes()
            with ZipFile(package) as archive:
                self.assertEqual(set(archive.namelist()), {
                    'index.html', 'site.css', 'styles.css', 'helper.py', 'README.txt',
                    'src/main.js', 'src/shared/phrases.js'})
                html = archive.read('index.html').decode()
                self.assertIn('data-local-broadcast', html)
                self.assertIn('src/main.js?v=abc', html)
                self.assertIn('connect-src \'self\'', html)
                self.assertEqual(html.count('<main'), 1)
                for forbidden in ('analytics.js', 'trust.js', 'sw.js', 'https://'):
                    self.assertNotIn(forbidden, html)
            write_bundle(*args)
            self.assertEqual(first, package.read_bytes())

    def test_other_tools_do_not_get_a_bundle(self):
        with tempfile.TemporaryDirectory() as folder:
            dest = Path(folder)
            write_bundle(dest, None, {}, '', '', None, '', 'en')
            self.assertEqual(list(dest.iterdir()), [])
