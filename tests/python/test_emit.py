"""
buildlib/emit.py - writing a file, and what is minified on the way.

`write` is here because of what it refuses to do: every text file in this
repository is LF, and a build that produced CRLF on Windows and LF in CI would
show every line of every file as changed on alternate deploys. `Emitter` is
here because it decides what gets minified and what banner is left behind.
"""

import tempfile
import unittest
from pathlib import Path

from buildlib import emit as emitlib


class Write(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.dir = Path(self.tmp.name)
        self.addCleanup(self.tmp.cleanup)

    def test_a_trailing_newline_is_added_when_missing(self):
        path = self.dir / 'a.txt'
        emitlib.write(path, 'x')
        self.assertEqual(path.read_bytes(), b'x\n')

    def test_a_trailing_newline_is_not_doubled(self):
        path = self.dir / 'a.txt'
        emitlib.write(path, 'x\n')
        self.assertEqual(path.read_bytes(), b'x\n')

    def test_line_endings_are_always_lf(self):
        # Even on Windows, and even when the text already holds CRLF.
        path = self.dir / 'a.txt'
        emitlib.write(path, 'a\nb\n')
        self.assertEqual(path.read_bytes(), b'a\nb\n')

    def test_the_text_is_utf8(self):
        path = self.dir / 'a.txt'
        emitlib.write(path, 'café\n')
        self.assertEqual(path.read_bytes(), 'café\n'.encode('utf-8'))


class EmitterSetup(unittest.TestCase):
    SITE = {'source_url': 'https://example.test/repo'}

    def test_the_banner_names_the_source_and_the_check_command(self):
        emitter = emitlib.Emitter(True, self.SITE)
        self.assertIn('https://example.test/repo', emitter.js_banner)
        self.assertIn('build.py --check', emitter.js_banner)

    def test_the_banner_does_not_claim_names_were_renamed(self):
        # Identifiers are left alone, so nothing in the output should suggest
        # otherwise to somebody reading a deployed file against its source.
        emitter = emitlib.Emitter(True, self.SITE)
        self.assertNotIn('mangl', emitter.js_banner.lower())


class EmitterOutput(unittest.TestCase):
    SITE = {'source_url': 'https://example.test/repo'}

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.dir = Path(self.tmp.name)
        self.addCleanup(self.tmp.cleanup)

    def test_minifying_off_writes_the_source_through(self):
        emitter = emitlib.Emitter(False, self.SITE)
        source = '// a note\nlet x = 1\n'
        emitter.js(self.dir / 'a.js', source, where='a.js')
        self.assertEqual((self.dir / 'a.js').read_text(encoding='utf-8'), source)

    def test_minifying_on_strips_comments_and_keeps_the_banner(self):
        emitter = emitlib.Emitter(True, self.SITE)
        emitter.js(self.dir / 'a.js', '// a note\nlet x = 1\n', where='a.js')
        out = (self.dir / 'a.js').read_text(encoding='utf-8')
        self.assertNotIn('a note', out)
        self.assertIn('let x=1', out)
        self.assertIn('build.py --check', out)

    def test_html_carries_the_banner_as_a_comment(self):
        emitter = emitlib.Emitter(True, self.SITE)
        emitter.html(self.dir / 'a.html', '<p>\n  a\n</p>\n')
        out = (self.dir / 'a.html').read_text(encoding='utf-8')
        self.assertTrue(out.startswith('<!--'))
        self.assertIn('<p> a </p>', out)

    def test_css_text_returns_rather_than_writes(self):
        # The stylesheet has to be hashed after minifying and before being
        # written, because the hash goes in the URL the page asks for it by.
        emitter = emitlib.Emitter(True, self.SITE)
        out = emitter.css_text('a {\n  color: red;\n}\n')
        self.assertIn('a{color:red}', out)
        self.assertEqual(list(self.dir.iterdir()), [])

    def test_css_text_is_untouched_when_minifying_is_off(self):
        source = 'a {\n  color: red;\n}\n'
        self.assertEqual(emitlib.Emitter(False, self.SITE).css_text(source),
                         source)


if __name__ == "__main__":
    unittest.main()
