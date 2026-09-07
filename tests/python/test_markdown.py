"""
buildlib/markdown.py: the pages as Markdown.

The converter is small on purpose - it handles the dozen elements the pages
here are written in and nothing more - so these are the cases that matter:
each element the bodies use, the whitespace rules that keep a paragraph a
paragraph, and the resolution of every link to an absolute address, which is
what lets a twin be pasted somewhere the page is not.
"""

import re
import sys
import tomllib
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from buildlib import markdown  # noqa: E402

BASE = 'https://abox.tools/guides/one/'


def md(html, base=BASE):
    return markdown.convert(html, base)


class Blocks(unittest.TestCase):
    def test_headings_and_paragraphs(self):
        self.assertEqual(
            md('<section><h2>Why</h2><p>Because.</p><p>And also.</p></section>'),
            '## Why\n\nBecause.\n\nAnd also.\n')

    def test_a_heading_level_is_its_own(self):
        self.assertEqual(md('<h1>A</h1><h3>B</h3>'), '# A\n\n### B\n')

    def test_whitespace_inside_a_paragraph_collapses(self):
        html = '<p>\n      Line one\n      line two   and three.\n    </p>'
        self.assertEqual(md(html), 'Line one line two and three.\n')

    def test_a_non_breaking_space_becomes_a_space(self):
        self.assertEqual(md('<p>500&nbsp;KB</p>'), '500 KB\n')

    def test_entities_are_characters(self):
        self.assertEqual(md('<p>&ldquo;a&rdquo; &mdash; b &amp; c</p>'),
                         '“a” — b & c\n')

    def test_comments_are_dropped(self):
        self.assertEqual(md('<!-- not for the reader --><p>Yes.</p>'), 'Yes.\n')

    def test_scripts_hidden_and_decorative_blocks_are_left_out(self):
        html = ('<script>x()</script><div hidden>secret</div>'
                '<span aria-hidden="true">&rsaquo;</span><p>Kept.</p>')
        self.assertEqual(md(html), 'Kept.\n')

    def test_a_pre_block_is_fenced_and_kept_verbatim(self):
        html = '<pre>  indented\n\nkept   as is</pre>'
        self.assertEqual(md(html), '```\n  indented\n\nkept   as is\n```\n')

    def test_a_pre_holding_backticks_gets_a_longer_fence(self):
        self.assertEqual(md('<pre>```\nx\n```</pre>'), '````\n```\nx\n```\n````\n')

    def test_a_figure_is_its_image_and_its_caption(self):
        html = ('<figure><img src="/screens/one/a.webp" alt="The card" width="1" height="1">'
                '<figcaption>What it shows.</figcaption></figure>')
        self.assertEqual(
            md(html),
            '![The card](https://abox.tools/screens/one/a.webp)\n\nWhat it shows.\n')

    def test_a_horizontal_rule(self):
        self.assertEqual(md('<p>a</p><hr><p>b</p>'), 'a\n\n---\n\nb\n')

    def test_a_blockquote(self):
        self.assertEqual(md('<blockquote>Said.</blockquote>'), '> Said.\n')


class Lists(unittest.TestCase):
    def test_an_unordered_list_is_tight(self):
        self.assertEqual(md('<ul><li>one</li><li>two</li></ul>'), '- one\n- two\n')

    def test_an_ordered_list_counts(self):
        self.assertEqual(md('<ol><li>a</li><li>b</li><li>c</li></ol>'),
                         '1. a\n2. b\n3. c\n')

    def test_a_nested_list_indents_under_its_item(self):
        html = '<ul><li>outer<ul><li>inner</li></ul></li><li>next</li></ul>'
        self.assertEqual(md(html), '- outer\n  - inner\n- next\n')

    def test_a_list_item_with_two_paragraphs(self):
        html = '<ul><li><p>First.</p><p>Second.</p></li></ul>'
        self.assertEqual(md(html), '- First.\n\n  Second.\n')

    def test_a_list_between_paragraphs(self):
        html = '<p>Before.</p><ul><li>x</li></ul><p>After.</p>'
        self.assertEqual(md(html), 'Before.\n\n- x\n\nAfter.\n')

    def test_a_bold_lead_in_an_item(self):
        html = '<li><strong>Name the outcome.</strong> Say the number.</li>'
        self.assertEqual(md(f'<ul>{html}</ul>'),
                         '- **Name the outcome.** Say the number.\n')


class Inline(unittest.TestCase):
    def test_links_are_absolute(self):
        html = '<p>Open the <a href="../../compress-image/">compressor</a>.</p>'
        self.assertEqual(md(html),
                         'Open the [compressor](https://abox.tools/compress-image/).\n')

    def test_a_root_absolute_link_gets_the_domain(self):
        self.assertEqual(md('<p><a href="/llms.txt">map</a></p>'),
                         '[map](https://abox.tools/llms.txt)\n')

    def test_an_absolute_link_and_a_mailto_are_left_alone(self):
        html = '<p><a href="https://example.org/x">x</a> <a href="mailto:hi@abox.tools">hi</a></p>'
        self.assertEqual(md(html),
                         '[x](https://example.org/x) [hi](mailto:hi@abox.tools)\n')

    def test_an_anchor_without_an_href_is_its_text(self):
        self.assertEqual(md('<p><a name="x">plain</a></p>'), 'plain\n')

    def test_code_and_kbd(self):
        self.assertEqual(md('<p>Run <code>build.py</code>, press <kbd>Ctrl</kbd>.</p>'),
                         'Run `build.py`, press `Ctrl`.\n')

    def test_code_holding_a_backtick_is_double_fenced(self):
        self.assertEqual(md('<p><code>a`b</code></p>'), '`` a`b ``\n')

    def test_strong_and_em(self):
        self.assertEqual(md('<p><strong>bold</strong> and <em>soft</em></p>'),
                         '**bold** and *soft*\n')

    def test_b_and_i_are_the_same_marks(self):
        self.assertEqual(md('<p><b>bold</b> and <i>soft</i></p>'),
                         '**bold** and *soft*\n')

    def test_space_inside_an_inline_element_moves_outside_the_marks(self):
        self.assertEqual(md('<p>a<strong> b </strong>c</p>'), 'a **b** c\n')

    def test_an_empty_inline_element_is_nothing(self):
        self.assertEqual(md('<p>a<strong> </strong>b</p>'), 'a b\n')

    def test_nested_inline_elements(self):
        html = '<p><strong>Read <a href="/x/">this</a></strong></p>'
        self.assertEqual(md(html), '**Read [this](https://abox.tools/x/)**\n')

    def test_a_line_break_is_a_hard_break(self):
        self.assertEqual(md('<p>one<br>two</p>'), 'one\\\ntwo\n')

    def test_a_span_is_transparent(self):
        html = '<h1>Image Compressor <span class="h1-kw">&mdash; to a size</span></h1>'
        self.assertEqual(md(html), '# Image Compressor — to a size\n')

    def test_inline_gives_one_line(self):
        self.assertEqual(markdown.inline(' Drop them <em>here</em>. ', BASE),
                         'Drop them *here*.')


class TheBodies(unittest.TestCase):
    """Every element the real bodies use is one the converter knows. A body
    that reaches for something new should fail here, by name, rather than be
    silently flattened."""

    def test_every_element_in_the_prose_is_handled(self):
        seen = set()
        for path in list(ROOT.glob('pages/**/body.html')) + list(
                ROOT.glob('locales/*/pages/**/*.html')):
            seen |= set(re.findall(r'<([a-z][a-z0-9]*)',
                                   path.read_text(encoding='utf-8').lower()))
        unknown = sorted(seen - markdown.HANDLED)
        self.assertEqual(unknown, [], f'elements the converter does not know: {unknown}')

    def test_every_element_in_the_tool_prose_is_handled(self):
        # Only the prose is converted: a tool's body.html is the interface
        # and never goes through this, so the census is of the configs - and
        # of the fields the twin is built from, read as TOML rather than as
        # text, because a comment in one of these files is free to mention
        # an <input>.
        seen = set()
        for path in list(ROOT.glob('tools/*/tool.toml')) + list(
                ROOT.glob('locales/*/tools/*.toml')):
            config = tomllib.loads(path.read_text(encoding='utf-8'))
            prose = [config.get(key, '') for key in
                     ('heading', 'tagline', 'description', 'pledge',
                      'howto_heading', 'read_first')]
            for table in ('facts', 'howto', 'faq', 'privacy'):
                for entry in config.get(table, []):
                    prose += [value for value in entry.values()
                              if isinstance(value, str)]
            seen |= set(re.findall(r'<([a-z][a-z0-9]*)', '\n'.join(prose).lower()))
        unknown = sorted(seen - markdown.HANDLED)
        self.assertEqual(unknown, [], f'elements the converter does not know: {unknown}')


if __name__ == '__main__':
    unittest.main()
