"""
buildlib/imports.py.

Nothing on this site is bundled, so an import that names a file nobody shipped
is a 404 on the visitor's machine rather than a build error. These tests are in
two halves, matching the two ways that goes wrong:

  1. Reading the imports has to be exact. This repository puts the words
     "import" and "from" in its prose and `@param {import('./reader.js').T}` in
     its JSDoc, and a checker that believed those would fail every build. The
     specifier reader walks tokens for that reason, and the tests below hold it
     to it.
  2. Resolving them has to match how the build lays a tool out - a shared
     module sits in src/shared/ and its own siblings are beside it, so the same
     './crc32.js' means different files depending on who wrote it.
"""

import unittest

from buildlib import imports
from buildlib.site import ConfigError


def found(source):
    return [spec for _, spec in imports.specifiers(source)]


class Specifiers(unittest.TestCase):
    def test_a_named_import(self):
        self.assertEqual(found("import { a } from './x.js';"), ['./x.js'])

    def test_a_default_import(self):
        self.assertEqual(found("import a from './x.js';"), ['./x.js'])

    def test_a_side_effect_import(self):
        self.assertEqual(found("import './x.js';"), ['./x.js'])

    def test_a_re_export(self):
        self.assertEqual(found("export { a } from './x.js';"), ['./x.js'])

    def test_a_dynamic_import(self):
        self.assertEqual(found("const m = await import('./x.js');"), ['./x.js'])

    def test_double_quotes_too(self):
        self.assertEqual(found('import a from "./x.js";'), ['./x.js'])

    def test_the_line_is_reported(self):
        source = "\n\nimport a from './x.js';"
        self.assertEqual(imports.specifiers(source), [(3, './x.js')])

    # The three shapes that look like imports and are not. Each of these is in
    # the repository already, which is why the reader uses the tokeniser.

    def test_a_line_comment_is_not_an_import(self):
        self.assertEqual(found("// we import from './nope.js' here"), [])

    def test_a_jsdoc_type_import_is_not_an_import(self):
        # tools/compress-pdf carries several of these.
        self.assertEqual(
            found("/** @param {import('./nope.js').Doc} d */\nlet d;"), [])

    def test_a_variable_called_from_is_not_an_import(self):
        self.assertEqual(found("const from = './nope.js';"), [])

    def test_a_string_that_is_merely_data(self):
        self.assertEqual(found("const paths = ['./nope.js'];"), [])


class Resolve(unittest.TestCase):
    def test_a_sibling_of_the_tools_own_module(self):
        self.assertEqual(imports.resolve('src/main.js', './zip.js'),
                         'src/zip.js')

    def test_a_shared_module_reaching_its_own_sibling(self):
        # The case that matters: shared/js/zip.js is emitted at
        # src/shared/zip.js, so its './crc32.js' is src/shared/crc32.js and
        # needs crc32 in js_parts as well.
        self.assertEqual(imports.resolve('src/shared/zip.js', './crc32.js'),
                         'src/shared/crc32.js')

    def test_a_tool_reaching_into_shared(self):
        self.assertEqual(
            imports.resolve('src/main.js', './shared/file-picker.js'),
            'src/shared/file-picker.js')

    def test_going_up_a_level(self):
        self.assertEqual(imports.resolve('src/shared/a.js', '../main.js'),
                         'src/main.js')

    def test_a_bare_specifier_does_not_resolve(self):
        self.assertIsNone(imports.resolve('src/main.js', 'lodash'))


class Check(unittest.TestCase):
    def test_a_tool_whose_imports_all_land(self):
        files = {'src/main.js': "import { z } from './zip.js';",
                 'src/zip.js': ''}
        imports.check(set(files), files.get, 'demo')       # does not raise

    def test_a_typo_is_refused(self):
        files = {'src/main.js': "import z from './zpi.js';", 'src/zip.js': ''}
        with self.assertRaises(ConfigError) as caught:
            imports.check(set(files), files.get, 'demo')
        self.assertIn('./zpi.js', str(caught.exception))

    def test_a_shared_module_missing_its_own_dependency(self):
        # zip is in js_parts, crc32 is not. The tool builds and the page 404s.
        files = {'src/main.js': "import { z } from './shared/zip.js';",
                 'src/shared/zip.js': "import { crc32 } from './crc32.js';"}
        with self.assertRaises(ConfigError) as caught:
            imports.check(set(files), files.get, 'demo')
        self.assertIn('src/shared/crc32.js', str(caught.exception))
        self.assertIn('js_parts', str(caught.exception))

    def test_a_bare_specifier_is_refused(self):
        files = {'src/main.js': "import x from 'lodash';"}
        with self.assertRaises(ConfigError) as caught:
            imports.check(set(files), files.get, 'demo')
        self.assertIn('import map', str(caught.exception))

    def test_every_problem_is_reported_at_once(self):
        files = {'src/main.js': "import a from './a.js';\n"
                                "import b from './b.js';"}
        with self.assertRaises(ConfigError) as caught:
            imports.check(set(files), files.get, 'demo')
        self.assertIn('2 import(s)', str(caught.exception))

    def test_non_javascript_is_not_read(self):
        # A tool's src/ can hold other files; they are copied, not parsed.
        files = {'src/main.js': '', 'src/table.bin': 'not javascript at all'}
        imports.check(set(files), files.get, 'demo')       # does not raise


if __name__ == '__main__':
    unittest.main()
