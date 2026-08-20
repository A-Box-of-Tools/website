"""
buildlib/mangle.py, without running esbuild.

The parts worth testing here are the ones that do not need it: the import
checker, which is the single invariant the separate-modules design rests on,
and the version pinning, which is what keeps `--check` meaningful.

`specifiers` is the interesting one. It reads imports off the token stream
rather than out of the raw text, because `from` is not a reserved word and the
word turns up inside strings all over this repository - so a regular expression
finds imports that are not there, and finds different ones before and after the
comments have been taken out.
"""

import unittest
from unittest import mock

from buildlib import mangle


class Specifiers(unittest.TestCase):
    def find(self, source):
        return mangle.specifiers(source, 'x.js')

    def test_a_named_import(self):
        self.assertEqual(self.find('import { a } from "./b.js";'), ['./b.js'])

    def test_a_default_import(self):
        self.assertEqual(self.find("import a from './b.js';"), ['./b.js'])

    def test_a_namespace_import(self):
        self.assertEqual(self.find('import * as png from "./png.js";'), ['./png.js'])

    def test_a_bare_side_effect_import(self):
        self.assertEqual(self.find('import "./setup.js";'), ['./setup.js'])

    def test_a_dynamic_import(self):
        self.assertEqual(self.find('const m = await import("./slow.js");'),
                         ['./slow.js'])

    def test_a_re_export(self):
        self.assertEqual(self.find('export { a } from "./b.js";'), ['./b.js'])

    def test_several_come_back_sorted(self):
        source = 'import "./z.js";\nimport "./a.js";\nimport "./m.js";\n'
        self.assertEqual(self.find(source), ['./a.js', './m.js', './z.js'])

    def test_a_file_with_no_imports(self):
        self.assertEqual(self.find('export function f() { return 1 }'), [])

    def test_the_word_from_inside_a_string_is_not_an_import(self):
        # A real line from the EXIF parser is "...data from 'this block is
        # unreadable'". A regular expression would call that an import.
        source = 'const msg = "read the data from \'this block\'";'
        self.assertEqual(self.find(source), [])

    def test_the_word_from_inside_a_comment_is_not_an_import(self):
        source = '// copied from "./elsewhere.js"\nexport const a = 1;\n'
        self.assertEqual(self.find(source), [])

    def test_the_word_from_inside_a_template_literal_is_not_an_import(self):
        source = 'const msg = `taken from "./nowhere.js"`;'
        self.assertEqual(self.find(source), [])

    def test_from_used_as_an_identifier_is_not_an_import(self):
        # `from` is not a reserved word.
        self.assertEqual(self.find('const from = 1; use(from);'), [])

    def test_a_comment_does_not_change_the_answer(self):
        # The same file with and without its comments must report the same
        # imports, or the check after mangling would compare two different
        # things.
        with_comments = ('// from "./ghost.js"\n'
                         'import { a } from "./real.js";\n'
                         '/* also from "./ghost.js" */\n')
        without = 'import { a } from "./real.js";\n'
        self.assertEqual(self.find(with_comments), self.find(without))


class CheckImports(unittest.TestCase):
    def test_matching_imports_pass(self):
        source = 'import { a } from "./b.js";\nexport const c = a;\n'
        output = 'import{a}from"./b.js";export const c=a;\n'
        mangle.check_imports(source, output, 'x.js')

    def test_a_dropped_import_fails(self):
        source = 'import { a } from "./b.js";\nexport const c = 1;\n'
        with self.assertRaises(mangle.MangleError) as caught:
            mangle.check_imports(source, 'export const c=1;\n', 'x.js')
        self.assertIn('changed what x.js imports', str(caught.exception))
        self.assertIn('./b.js', str(caught.exception))

    def test_a_bundled_in_module_fails(self):
        # Something that inlined a dependency would show up as a specifier that
        # went missing, which is what would break the service worker's list.
        source = 'import { a } from "./b.js";\nimport { c } from "./d.js";\n'
        output = 'import{a}from"./b.js";\n'
        with self.assertRaises(mangle.MangleError):
            mangle.check_imports(source, output, 'x.js')

    def test_an_invented_import_fails(self):
        with self.assertRaises(mangle.MangleError):
            mangle.check_imports('export const a = 1;\n',
                                 'import"./chunk.js";export const a=1;\n', 'x.js')

    def test_order_does_not_matter(self):
        source = 'import "./a.js";\nimport "./b.js";\n'
        output = 'import"./b.js";import"./a.js";\n'
        mangle.check_imports(source, output, 'x.js')


class Resolve(unittest.TestCase):
    def test_a_missing_esbuild_says_what_to_install(self):
        with mock.patch('shutil.which', return_value=None):
            with self.assertRaises(mangle.MangleError) as caught:
                mangle.resolve('0.25.0')
        message = str(caught.exception)
        self.assertIn('esbuild@0.25.0', message)
        # ... and that leaving it out is still a working build.
        self.assertIn('python build.py', message)

    def test_a_found_esbuild_comes_back(self):
        with mock.patch('shutil.which', return_value='/usr/bin/esbuild') as which:
            self.assertEqual(mangle.resolve('0.25.0'), '/usr/bin/esbuild')
        which.assert_called_once_with('esbuild')


def completed(code=0, out='', err=''):
    return mock.Mock(returncode=code, stdout=out, stderr=err)


class RequireVersion(unittest.TestCase):
    def test_the_pinned_version_is_accepted(self):
        with mock.patch('subprocess.run', return_value=completed(out='0.25.0\n')):
            self.assertEqual(mangle.require_version('esbuild', '0.25.0'), '0.25.0')

    def test_any_other_version_is_refused(self):
        # Two versions of esbuild need not invent the same names, and --check
        # would then report tampering where there was none.
        with mock.patch('subprocess.run', return_value=completed(out='0.24.2\n')):
            with self.assertRaises(mangle.MangleError) as caught:
                mangle.require_version('esbuild', '0.25.0')
        message = str(caught.exception)
        self.assertIn('0.24.2', message)
        self.assertIn('0.25.0', message)
        self.assertIn('config/site.toml', message)

    def test_a_failing_version_call_is_reported(self):
        with mock.patch('subprocess.run', return_value=completed(1, err='boom')):
            with self.assertRaises(mangle.MangleError) as caught:
                mangle.version('esbuild')
        self.assertIn('boom', str(caught.exception))

    def test_an_unrunnable_esbuild_is_reported(self):
        with mock.patch('subprocess.run', side_effect=OSError('no such file')):
            with self.assertRaises(mangle.MangleError) as caught:
                mangle.version('esbuild')
        self.assertIn('could not run', str(caught.exception))


class Js(unittest.TestCase):
    """`js` shells out, so esbuild is stubbed and the wiring is what is checked."""

    def run_with(self, result, source='import { a } from "./b.js";\n', **kwargs):
        with mock.patch('subprocess.run', return_value=result) as run:
            out = mangle.js(source, 'esbuild', **kwargs)
        return out, run.call_args

    def test_the_pinned_flags_are_passed(self):
        _, call = self.run_with(completed(out='import{a}from"./b.js";\n'))
        argv = call.args[0]
        for flag in ('--minify', '--format=esm', '--target=esnext',
                     '--legal-comments=none'):
            self.assertIn(flag, argv)

    def test_the_source_file_name_reaches_esbuild(self):
        _, call = self.run_with(completed(out='import"./b.js";\n'),
                                sourcefile='widget/src/main.js')
        self.assertIn('--sourcefile=widget/src/main.js', call.args[0])

    def test_a_banner_is_prepended_rather_than_asked_of_esbuild(self):
        out, call = self.run_with(completed(out='import{a}from"./b.js";\n'),
                                  banner='/* built */')
        self.assertTrue(out.startswith('/* built */\n'))
        self.assertFalse(any(a.startswith('--banner') for a in call.args[0]))

    def test_a_failing_esbuild_stops_the_build(self):
        with self.assertRaises(mangle.MangleError) as caught:
            self.run_with(completed(1, err='syntax error'))
        self.assertIn('syntax error', str(caught.exception))

    def test_empty_output_stops_the_build(self):
        with self.assertRaises(mangle.MangleError) as caught:
            self.run_with(completed(out='   \n'))
        self.assertIn('produced nothing', str(caught.exception))

    def test_output_that_lost_an_import_stops_the_build(self):
        with self.assertRaises(mangle.MangleError) as caught:
            self.run_with(completed(out='const a=1;\n'))
        self.assertIn('imports', str(caught.exception))


if __name__ == '__main__':
    unittest.main()
