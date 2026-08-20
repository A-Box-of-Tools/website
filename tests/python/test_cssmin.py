"""
buildlib/cssmin.py.

That module's docstring is a list of promises about what it will and will not
touch. These are those promises written as assertions, and most of them are the
same shape: a space that looks removable and is not. Those are the ones where a
minifier changes a page rather than shrinking it.
"""

import unittest

from buildlib import cssmin


def mini(source):
    """Minify, without the trailing newline every result carries."""
    return cssmin.css(source).rstrip('\n')


class Basics(unittest.TestCase):
    def test_a_rule_loses_its_layout(self):
        self.assertEqual(mini('a {\n  color: red;\n}\n'), 'a{color:red}')

    def test_result_always_ends_in_one_newline(self):
        self.assertEqual(cssmin.css('a{color:red}'), 'a{color:red}\n')

    def test_empty_input_is_just_the_newline(self):
        self.assertEqual(cssmin.css(''), '\n')

    def test_banner_is_wrapped_in_a_comment(self):
        self.assertEqual(cssmin.css('a{color:red}', ' built '),
                         '/* built */a{color:red}\n')

    def test_comments_go(self):
        self.assertEqual(mini('/* why */ a { /* also why */ color: red }'),
                         'a{color:red}')

    def test_the_last_semicolon_in_a_block_goes(self):
        self.assertEqual(mini('a{color:red;background:blue;}'),
                         'a{color:red;background:blue}')

    def test_repeated_semicolons_collapse(self):
        self.assertEqual(mini('a{color:red;;;background:blue}'),
                         'a{color:red;background:blue}')

    def test_a_semicolon_straight_after_a_brace_goes(self):
        self.assertEqual(mini('a{;color:red}'), 'a{color:red}')


class SpacesThatMatter(unittest.TestCase):
    def test_the_descendant_combinator_survives(self):
        self.assertEqual(mini('.a .b { color: red }'), '.a .b{color:red}')

    def test_a_compound_selector_gains_nothing(self):
        self.assertEqual(mini('.a.b { color: red }'), '.a.b{color:red}')

    def test_space_between_values_survives(self):
        self.assertEqual(mini('a { margin: 1px 2px }'), 'a{margin:1px 2px}')

    def test_a_font_shorthand_survives(self):
        self.assertEqual(mini('a { font: bold 12px/1.4 serif }'),
                         'a{font:bold 12px/1.4 serif}')

    def test_calc_keeps_its_arithmetic_spaces(self):
        self.assertEqual(mini('a { width: calc(100% - 2rem) }'),
                         'a{width:calc(100% - 2rem)}')

    def test_a_combinator_in_a_selector_loses_its_spaces(self):
        self.assertEqual(mini('a > b + c ~ d { color: red }'), 'a>b+c~d{color:red}')

    def test_the_same_characters_in_a_value_keep_theirs(self):
        # In a selector `+` is a combinator; in a value it is arithmetic, and
        # `calc(1px+2px)` is invalid.
        self.assertEqual(mini('a { width: calc(1px + 2px) }'),
                         'a{width:calc(1px + 2px)}')
        self.assertEqual(mini('a { width: calc(100% - 2rem + 1px) }'),
                         'a{width:calc(100% - 2rem + 1px)}')

    def test_a_combinator_inside_a_media_block_still_binds_selectors(self):
        self.assertEqual(mini('@media screen { a > b { width: calc(1px + 2px) } }'),
                         '@media screen{a>b{width:calc(1px + 2px)}}')

    def test_colon_in_a_selector_is_left_alone(self):
        # `a :hover` is a hovered descendant of `a`; `a:hover` is a hovered `a`.
        self.assertEqual(mini('a :hover { color: red }'), 'a :hover{color:red}')

    def test_colon_in_a_declaration_loses_its_space(self):
        self.assertEqual(mini('a{ color : red }'), 'a{color:red}')

    def test_important_keeps_the_space_before_it(self):
        self.assertEqual(mini('a { color: red !important }'),
                         'a{color:red !important}')

    def test_space_before_a_closing_paren_goes(self):
        self.assertEqual(mini('a { color: rgb(1, 2, 3 ) }'), 'a{color:rgb(1,2,3)}')

    def test_commas_lose_their_spaces_between_selectors(self):
        self.assertEqual(mini('a , b { color: red }'), 'a,b{color:red}')


class Context(unittest.TestCase):
    def test_a_media_block_is_still_selector_context(self):
        # The `:` in `:hover` inside @media must not be read as a declaration
        # colon, and `a :hover` inside it is still a descendant selector. The
        # space in the media feature survives for the same reason - the prelude
        # is not a declaration - which costs a byte and is always legal.
        self.assertEqual(
            mini('@media (min-width: 30em) { a :hover { color: red } }'),
            '@media (min-width: 30em){a :hover{color:red}}')

    def test_keyframe_steps_hold_declarations(self):
        self.assertEqual(mini('@keyframes spin { to { transform: rotate(1turn) } }'),
                         '@keyframes spin{to{transform:rotate(1turn)}}')

    def test_supports_is_a_rule_body(self):
        self.assertEqual(mini('@supports (display: grid) { .a .b { color: red } }'),
                         '@supports (display: grid){.a .b{color:red}}')

    def test_font_face_holds_declarations(self):
        self.assertEqual(mini('@font-face { font-family: "X"; src: url( a.woff ) }'),
                         '@font-face{font-family:"X";src:url(a.woff)}')

    def test_declaration_context_is_restored_after_a_nested_block(self):
        self.assertEqual(
            mini('@media screen { a { color: red } } b :hover { color: blue }'),
            '@media screen{a{color:red}}b :hover{color:blue}')


class LiteralRuns(unittest.TestCase):
    def test_a_string_is_copied_whole(self):
        self.assertEqual(mini('a { content: "  {  ;  }  " }'),
                         'a{content:"  {  ;  }  "}')

    def test_an_escaped_quote_does_not_end_a_string(self):
        self.assertEqual(mini(r'a { content: "he said \" then  left" }'),
                         r'a{content:"he said \" then  left"}')

    def test_unquoted_url_is_trimmed_but_not_reformatted(self):
        self.assertEqual(mini('a { background: url(  pic;{}.png  ) }'),
                         'a{background:url(pic;{}.png)}')

    def test_url_only_counts_at_the_start_of_a_token(self):
        # `blurl(` is not a url() and must not be rewritten as one.
        self.assertEqual(mini('a { x: blurl( 1 ) }'), 'a{x:blurl(1)}')

    def test_a_custom_property_value_is_untouched(self):
        self.assertEqual(mini('a { --op:  +  ; color: red }'), 'a{--op:+;color:red}')

    def test_a_custom_property_keeps_its_inner_spaces(self):
        self.assertEqual(mini('a { --gap:  1px   2px  ; color: red }'),
                         'a{--gap:1px   2px;color:red}')


class Failures(unittest.TestCase):
    def test_unterminated_comment(self):
        with self.assertRaises(cssmin.CssError):
            cssmin.css('a { /* forever')

    def test_unterminated_string(self):
        with self.assertRaises(cssmin.CssError):
            cssmin.css('a { content: "forever }')

    def test_unterminated_url(self):
        with self.assertRaises(cssmin.CssError):
            cssmin.css('a { background: url(forever')

    def test_custom_property_with_no_value(self):
        with self.assertRaises(cssmin.CssError):
            cssmin.css('a { --x }')


SAMPLE = """
    /* a sheet with most of the awkward shapes in it */
    :root { --pad: 1rem; --op:  +  ; }
    .card > .title, .card .lede { margin: 0 auto; width: calc(100% - var(--pad)) }
    @media (min-width: 40em) { .card :hover { color: red !important } }
"""


class Determinism(unittest.TestCase):
    def test_minifying_twice_gives_the_same_bytes(self):
        once = cssmin.css(SAMPLE)
        self.assertEqual(once, cssmin.css(SAMPLE))

    def test_minifying_the_output_again_changes_nothing(self):
        once = cssmin.css(SAMPLE)
        self.assertEqual(once, cssmin.css(once))

    def test_the_real_stylesheets_survive_a_round_trip(self):
        """Every sheet in the repository minifies, and minifies to a fixed point."""
        from pathlib import Path
        root = Path(__file__).resolve().parents[2]
        sheets = sorted(root.glob('shared/**/*.css')) + sorted(root.glob('tools/*/styles.css'))
        self.assertTrue(sheets, 'no stylesheets found to check')
        for path in sheets:
            with self.subTest(sheet=path.name):
                once = cssmin.css(path.read_text(encoding='utf-8'))
                self.assertEqual(once, cssmin.css(once))


if __name__ == '__main__':
    unittest.main()
