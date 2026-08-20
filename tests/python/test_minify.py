"""
buildlib/minify.py.

Two invariants carry the whole module, and both are here:

  1. Line terminators never move, because automatic semicolon insertion depends
     on them.
  2. Re-tokenising the output gives back the input's tokens.

`check` enforces both on every file the build emits, so most of the damage a
minifier can do shows up as a MinifyError rather than as a wrong page. The
tests below are in two halves: the tokeniser has to be right about the awkward
corners of JavaScript (regex versus division, nested template substitutions),
and `check` has to reject output that has drifted even when it is handed
something plausible.
"""

import unittest

from buildlib import minify


def texts(source):
    return [text for _, text in minify.tokenize_js(source)]


def lines(source):
    return [line for line, _ in minify.tokenize_js(source)]


class Tokeniser(unittest.TestCase):
    def test_a_simple_statement(self):
        self.assertEqual(texts('let x = 1;'), ['let', 'x', '=', '1', ';'])

    def test_line_comments_go_and_the_line_still_counts(self):
        self.assertEqual(minify.tokenize_js('// hello\nlet x = 1'),
                         [(2, 'let'), (2, 'x'), (2, '='), (2, '1')])

    def test_a_block_comment_spanning_lines_still_advances_the_counter(self):
        # A line terminator inside a block comment counts for semicolon
        # insertion exactly as a bare newline does.
        self.assertEqual(lines('a\n/* one\ntwo */ b'), [1, 3])

    def test_longest_punctuator_wins(self):
        self.assertEqual(texts('a >>>= b'), ['a', '>>>=', 'b'])
        self.assertEqual(texts('a ?? b'), ['a', '??', 'b'])
        self.assertEqual(texts('a?.b'), ['a', '?.', 'b'])

    def test_numbers(self):
        for source in ('0x1f', '0b1010', '0o17', '1_000', '1e-7', '.5', '1.', '9n'):
            with self.subTest(number=source):
                self.assertEqual(texts(f'x = {source}'), ['x', '=', source])

    def test_a_string_is_one_token(self):
        self.assertEqual(texts('x = "a b // c /* d */"'),
                         ['x', '=', '"a b // c /* d */"'])

    def test_an_escaped_quote_does_not_end_a_string(self):
        self.assertEqual(texts(r'x = "he said \" then left"'),
                         ['x', '=', r'"he said \" then left"'])

    def test_a_regex_after_a_keyword_is_a_regex(self):
        self.assertEqual(texts('return /a\\/b/g'), ['return', '/a\\/b/g'])

    def test_a_slash_after_a_value_is_division(self):
        self.assertEqual(texts('a / b / c'), ['a', '/', 'b', '/', 'c'])
        self.assertEqual(texts('x[0] / 2'), ['x', '[', '0', ']', '/', '2'])

    def test_a_slash_in_a_character_class_does_not_end_the_regex(self):
        self.assertEqual(texts('x = /[/]/'), ['x', '=', '/[/]/'])

    def test_a_template_literal_is_one_token(self):
        self.assertEqual(texts('x = `a ${b} c`'), ['x', '=', '`a ${b} c`'])

    def test_nested_templates(self):
        self.assertEqual(texts('x = `a${`b${c}`}d`'), ['x', '=', '`a${`b${c}`}d`'])

    def test_a_brace_inside_a_string_inside_a_substitution(self):
        self.assertEqual(texts('x = `${ y("}") }`'), ['x', '=', '`${ y("}") }`'])

    def test_a_regex_inside_a_substitution(self):
        # The comment in _scan_template names this as the case that once broke
        # the build: a quote inside a regular expression opening a string.
        source = 'x = `${x.replace(/["]/g, \'\')}`'
        self.assertEqual(texts(source), ['x', '=', '`${x.replace(/["]/g, \'\')}`'])

    def test_division_inside_a_substitution(self):
        self.assertEqual(texts('x = `${ a / b }`'), ['x', '=', '`${ a / b }`'])

    def test_a_no_break_space_is_whitespace(self):
        # Legal between tokens, arrives in text pasted out of an editor,
        # and must not reach the output.
        self.assertEqual(texts('let x = 1'), ['let', 'x', '=', '1'])
        self.assertEqual(minify.js('let x = 1\n'), 'let x=1\n')

    def test_a_byte_order_mark_between_tokens_is_whitespace(self):
        self.assertEqual(texts('let﻿x = 1'), ['let', 'x', '=', '1'])
        self.assertEqual(minify.js('let﻿x = 1\n'), 'let x=1\n')


class TokeniserFailures(unittest.TestCase):
    def test_unterminated_block_comment(self):
        with self.assertRaises(minify.MinifyError):
            minify.tokenize_js('/* forever')

    def test_unterminated_string(self):
        with self.assertRaises(minify.MinifyError):
            minify.tokenize_js('x = "forever')

    def test_a_newline_inside_a_string(self):
        with self.assertRaises(minify.MinifyError):
            minify.tokenize_js('x = "one\ntwo"')

    def test_unterminated_template(self):
        with self.assertRaises(minify.MinifyError):
            minify.tokenize_js('x = `forever')

    def test_unterminated_regex(self):
        with self.assertRaises(minify.MinifyError):
            minify.tokenize_js('x = /forever')

    def test_the_message_names_the_file_and_the_line(self):
        with self.assertRaises(minify.MinifyError) as caught:
            minify.tokenize_js('a\nb\nx = "oops', where='src/main.js')
        self.assertIn('src/main.js:3', str(caught.exception))


class MinifyJs(unittest.TestCase):
    def test_comments_and_indentation_go(self):
        self.assertEqual(minify.js('// note\nlet x = 1; // trailing\n'),
                         'let x=1;\n')

    def test_every_newline_stays_where_it_was(self):
        source = 'let a = 1\nlet b = 2\nlet c = 3\n'
        self.assertEqual(minify.js(source), 'let a=1\nlet b=2\nlet c=3\n')

    def test_a_blank_line_does_not_survive_as_a_line(self):
        # Numbers shift; what must not change is whether there is a break
        # between one token and the next, which `check` verifies.
        self.assertEqual(minify.js('let a = 1\n\n\nlet b = 2\n'),
                         'let a=1\nlet b=2\n')

    def test_a_space_that_holds_two_words_apart_survives(self):
        self.assertEqual(minify.js('if (a in b) c()\n'), 'if(a in b)c()\n')
        self.assertEqual(minify.js('let x = typeof y\n'), 'let x=typeof y\n')

    def test_plus_plus_is_not_invented(self):
        self.assertEqual(minify.js('let x = a + +b\n'), 'let x=a+ +b\n')
        self.assertEqual(minify.js('let x = a - -b\n'), 'let x=a- -b\n')

    def test_a_sign_after_an_operator_keeps_its_space(self):
        # `+-` is not a token, so joining these would not trip `check` - the
        # space is kept because two operators running together is unreadable
        # and one character from being wrong.
        self.assertEqual(minify.js('let x = a + -b\n'), 'let x=a+ -b\n')
        self.assertEqual(minify.js('let x = a - +b\n'), 'let x=a- +b\n')

    def test_a_comment_is_not_invented(self):
        self.assertEqual(minify.js('let x = a / /b/.source\n'),
                         'let x=a/ /b/.source\n')

    def test_a_number_keeps_the_space_before_a_method_call(self):
        self.assertEqual(minify.js('1 .toString()\n'), '1 .toString()\n')

    def test_a_banner_goes_on_its_own_first_line(self):
        out = minify.js('let x = 1\n', banner='/* built */')
        self.assertEqual(out, '/* built */\nlet x=1\n')

    def test_empty_input_produces_nothing_at_all(self):
        self.assertEqual(minify.js(''), '')
        self.assertEqual(minify.js('// only a comment\n'), '')

    def test_result_ends_in_a_newline(self):
        self.assertTrue(minify.js('let x = 1').endswith('\n'))

    def test_minifying_the_output_again_changes_nothing(self):
        source = 'export function f(a) {\n  return a in b ? /x/g : a + +1\n}\n'
        once = minify.js(source)
        self.assertEqual(once, minify.js(once))

    def test_the_real_modules_survive_a_round_trip(self):
        """Every module in the repository minifies to a fixed point.

        This is the whole build's safety net exercised directly: minify.js
        already calls `check` on its own output, so a failure here is a file
        the build would have refused to write.
        """
        from pathlib import Path
        root = Path(__file__).resolve().parents[2]
        modules = sorted(root.glob('shared/js/*.js')) + sorted(root.glob('tools/*/src/*.js'))
        self.assertTrue(modules, 'no modules found to check')
        for path in modules:
            with self.subTest(module=path.name):
                once = minify.js(path.read_text(encoding='utf-8'),
                                 where=path.name)
                self.assertEqual(once, minify.js(once, where=path.name))


class Check(unittest.TestCase):
    """`check` is what stands between a bad minify and a deployed site."""

    def test_identical_streams_pass(self):
        minify.check('let x = 1\n', 'let x=1\n', 'x.js')

    def test_a_lost_token_is_caught(self):
        with self.assertRaises(minify.MinifyError) as caught:
            minify.check('let x = 1\n', 'let x\n', 'x.js')
        self.assertIn('token count', str(caught.exception))

    def test_a_changed_token_is_caught(self):
        with self.assertRaises(minify.MinifyError) as caught:
            minify.check('let x = 1\n', 'let x = 2\n', 'x.js')
        self.assertIn('changed a token', str(caught.exception))

    def test_a_lost_line_break_is_caught(self):
        # Joining two lines is exactly the transformation that changes where a
        # semicolon gets inserted.
        with self.assertRaises(minify.MinifyError) as caught:
            minify.check('let a = 1\nlet b = 2\n', 'let a=1 let b=2\n', 'x.js')
        self.assertIn('lost a line break', str(caught.exception))

    def test_a_gained_line_break_is_caught(self):
        with self.assertRaises(minify.MinifyError) as caught:
            minify.check('let a = 1 + 2\n', 'let a = 1 +\n2\n', 'x.js')
        self.assertIn('gained a line break', str(caught.exception))


class MinifyHtml(unittest.TestCase):
    def test_comments_go(self):
        self.assertEqual(minify.html('<p>a</p><!-- why --><p>b</p>'),
                         '<p>a</p><p>b</p>\n')

    def test_indentation_collapses_to_one_space(self):
        # Not to nothing: between two inline elements it is the space between
        # two words.
        self.assertEqual(minify.html('<p>\n  <b>a</b>\n  <i>b</i>\n</p>\n'),
                         '<p> <b>a</b> <i>b</i> </p>\n')

    def test_leading_and_trailing_whitespace_goes(self):
        self.assertEqual(minify.html('\n\n  <p>a</p>  \n\n'), '<p>a</p>\n')

    def test_attribute_whitespace_collapses(self):
        self.assertEqual(minify.html('<a   href="/x"\n   rel="me"  >a</a>'),
                         '<a href="/x" rel="me">a</a>\n')

    def test_no_space_is_left_before_a_self_closing_slash(self):
        self.assertEqual(minify.html('<img src="/x"  />'), '<img src="/x"/>\n')

    def test_an_attribute_value_is_never_touched(self):
        # The favicon on every page is a data: URI with a whole SVG, angle
        # brackets and double spaces and all, inside one attribute.
        tag = '<link rel="icon" href="data:image/svg+xml,<svg  a=\'1\'>  </svg>">'
        self.assertEqual(minify.html(tag), tag + '\n')

    def test_pre_is_copied_through(self):
        self.assertEqual(minify.html('<pre>  a\n   b  </pre>'),
                         '<pre>  a\n   b  </pre>\n')

    def test_script_contents_are_copied_through(self):
        self.assertEqual(minify.html('<script>\n  let x = 1\n</script>'),
                         '<script>\n  let x = 1\n</script>\n')

    def test_a_bare_less_than_in_text_is_legal_and_kept(self):
        self.assertEqual(minify.html('<p>a < b</p>'), '<p>a < b</p>\n')

    def test_structured_data_is_re_serialised_compactly(self):
        source = ('<script type="application/ld+json">\n'
                  '{\n  "@context": "https://schema.org",\n  "a": 1\n}\n'
                  '</script>')
        self.assertEqual(
            minify.html(source),
            '<script type="application/ld+json">'
            '{"@context":"https://schema.org","a":1}</script>\n')

    def test_structured_data_is_escaped_to_ascii(self):
        source = '<script type="application/ld+json">{"a": "—"}</script>'
        self.assertIn('\\u2014', minify.html(source))

    def test_invalid_structured_data_fails_the_build(self):
        with self.assertRaises(minify.MinifyError):
            minify.html('<script type="application/ld+json">{ nope }</script>')

    def test_a_banner_is_wrapped_in_a_comment(self):
        self.assertEqual(minify.html('<p>a</p>', ' built '),
                         '<!-- built --><p>a</p>\n')


if __name__ == '__main__':
    unittest.main()
