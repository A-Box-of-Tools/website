"""A worker rule change must change its URL even when its assets stay the same."""
from pathlib import Path
import re
import tempfile
import unittest

import build
from buildlib.emit import Emitter
from buildlib.template import Loader


ROOT = Path(__file__).resolve().parents[2]
PAGE = '<html data-offline-version="__ABOX_OFFLINE_VERSION__">page</html>\n'


class OfflineGeneration(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.out = Path(temporary.name)
        self.templates = Loader(ROOT / 'templates')
        self.emit = Emitter(False, {'source_url': 'https://example.test/source'})

    def write(self, page=PAGE, asset='original asset'):
        build.write_worker(self.out, self.templates, self.emit, page,
                           [('index.html', page), ('src/main.js', asset)],
                           ['index.html', 'src/main.js?v=0123456789'], '/tool/', {'plural': 'files'})
        html = (self.out / 'index.html').read_text(encoding='utf-8')
        worker = (self.out / 'sw.js').read_text(encoding='utf-8')
        generation = re.search(r'data-offline-version="([0-9a-f]{10})"', html)[1]
        self.assertIn(f"CACHE_VERSION = '{generation}'", worker)
        return generation

    def test_template_changes_alone_move_the_registered_worker_generation(self):
        before = self.write()
        self.templates._cache['sw.js'] = self.templates.source('sw.js') + '\n// a changed caching rule\n'
        self.assertNotEqual(self.write(), before)

    def test_page_and_module_changes_move_the_generation_independently(self):
        before = self.write()
        self.assertNotEqual(self.write(page=PAGE.replace('>page', '>updated page')), before)
        self.assertNotEqual(self.write(asset='changed module'), before)

    def test_identical_inputs_keep_the_same_generation(self):
        self.assertEqual(self.write(), self.write())
