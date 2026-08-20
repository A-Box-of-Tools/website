"""
buildlib/template.py.

The engine supports five things and nothing else, so these tests are mostly
about the fifth: what happens when a template asks for something that is not
there. "Missing names are an error, not an empty string" is the design claim,
and a page that silently loses its description because a key was renamed is
the failure the whole build exists to make impossible.
"""

import tempfile
import unittest
from pathlib import Path

from buildlib.template import Loader, Template, TemplateError, escape, resolve


def render(source, context, loader=None):
    return Template(source, loader=loader).render(context)


class Escape(unittest.TestCase):
    def test_the_four_characters(self):
        self.assertEqual(escape('<a href="x">&</a>'),
                         '&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;')

    def test_ampersand_is_escaped_first(self):
        # Escaping `<` first would turn `<` into `&lt;` and then into `&amp;lt;`.
        self.assertEqual(escape('<'), '&lt;')

    def test_text_with_nothing_to_escape_is_unchanged(self):
        self.assertEqual(escape('plain text'), 'plain text')


class Resolve(unittest.TestCase):
    def test_a_plain_key(self):
        self.assertEqual(resolve({'a': 1}, 'a'), 1)

    def test_a_dotted_path(self):
        self.assertEqual(resolve({'a': {'b': {'c': 2}}}, 'a.b.c'), 2)

    def test_an_attribute_on_an_object(self):
        self.assertEqual(resolve({'p': Path('/x/y.html')}, 'p.name'), 'y.html')

    def test_a_missing_key_names_the_path_and_the_part(self):
        with self.assertRaises(TemplateError) as caught:
            resolve({'a': {'b': 1}}, 'a.nope')
        self.assertIn('a.nope', str(caught.exception))
        self.assertIn('nope', str(caught.exception))

    def test_a_missing_attribute_is_the_same_error(self):
        with self.assertRaises(TemplateError):
            resolve({'p': Path('/x')}, 'p.nope')


class Values(unittest.TestCase):
    def test_a_value_is_inserted_raw(self):
        # Raw is deliberate: values come from config files in this repository
        # and most of them are HTML fragments written on purpose.
        self.assertEqual(render('{{ a }}', {'a': '<b>hi</b>'}), '<b>hi</b>')

    def test_the_e_filter_escapes(self):
        self.assertEqual(render('{{ a | e }}', {'a': '<b>'}), '&lt;b&gt;')

    def test_whitespace_inside_the_braces_is_ignored(self):
        self.assertEqual(render('{{a}}|{{   a   }}|{{ a|e }}',
                                {'a': '&'}), '&|&|&amp;')

    def test_a_number_becomes_text(self):
        self.assertEqual(render('{{ n }}', {'n': 180}), '180')

    def test_a_missing_name_is_an_error(self):
        with self.assertRaises(TemplateError):
            render('{{ nope }}', {})

    def test_a_none_value_is_an_error(self):
        # An empty description should stop the build, not render as "None".
        with self.assertRaises(TemplateError) as caught:
            render('{{ a }}', {'a': None})
        self.assertIn('is empty', str(caught.exception))

    def test_an_unknown_filter_is_an_error(self):
        with self.assertRaises(TemplateError) as caught:
            render('{{ a | upper }}', {'a': 'x'})
        self.assertIn('no such filter', str(caught.exception))

    def test_text_around_the_tags_survives_exactly(self):
        self.assertEqual(render('a {{ x }} b\n', {'x': '-'}), 'a - b\n')


class Conditionals(unittest.TestCase):
    def test_true_takes_the_body(self):
        self.assertEqual(render('{% if a %}yes{% endif %}', {'a': 1}), 'yes')

    def test_false_takes_nothing(self):
        self.assertEqual(render('{% if a %}yes{% endif %}', {'a': ''}), '')

    def test_else(self):
        source = '{% if a %}yes{% else %}no{% endif %}'
        self.assertEqual(render(source, {'a': True}), 'yes')
        self.assertEqual(render(source, {'a': False}), 'no')

    def test_an_empty_list_is_false(self):
        self.assertEqual(render('{% if a %}yes{% else %}no{% endif %}',
                                {'a': []}), 'no')

    def test_nesting(self):
        source = '{% if a %}[{% if b %}b{% else %}!b{% endif %}]{% endif %}'
        self.assertEqual(render(source, {'a': 1, 'b': 0}), '[!b]')
        self.assertEqual(render(source, {'a': 1, 'b': 1}), '[b]')

    def test_an_else_only_binds_to_its_own_if(self):
        source = '{% if a %}{% if b %}B{% endif %}A{% else %}X{% endif %}'
        self.assertEqual(render(source, {'a': 1, 'b': 0}), 'A')
        self.assertEqual(render(source, {'a': 0, 'b': 1}), 'X')

    def test_a_dotted_condition(self):
        self.assertEqual(render('{% if a.b %}yes{% endif %}', {'a': {'b': 1}}), 'yes')

    def test_an_unclosed_if_is_an_error(self):
        with self.assertRaises(TemplateError) as caught:
            render('{% if a %}yes', {'a': 1})
        self.assertIn('never closed', str(caught.exception))

    def test_a_missing_condition_name_is_an_error(self):
        with self.assertRaises(TemplateError):
            render('{% if nope %}yes{% endif %}', {})


class Loops(unittest.TestCase):
    def test_a_simple_loop(self):
        self.assertEqual(render('{% for x in xs %}[{{ x }}]{% endfor %}',
                                {'xs': [1, 2, 3]}), '[1][2][3]')

    def test_an_empty_list_renders_nothing(self):
        self.assertEqual(render('{% for x in xs %}[{{ x }}]{% endfor %}',
                                {'xs': []}), '')

    def test_the_loop_variable_does_not_escape_the_body(self):
        with self.assertRaises(TemplateError):
            render('{% for x in xs %}{% endfor %}{{ x }}', {'xs': [1]})

    def test_the_outer_context_is_visible_inside(self):
        self.assertEqual(
            render('{% for x in xs %}{{ sep }}{{ x }}{% endfor %}',
                   {'xs': [1, 2], 'sep': '-'}), '-1-2')

    def test_loops_nest(self):
        source = '{% for a in as %}{% for b in bs %}{{ a }}{{ b }} {% endfor %}{% endfor %}'
        self.assertEqual(render(source, {'as': [1, 2], 'bs': ['x', 'y']}),
                         '1x 1y 2x 2y ')

    def test_a_loop_over_dicts(self):
        self.assertEqual(
            render('{% for t in tools %}{{ t.name }};{% endfor %}',
                   {'tools': [{'name': 'a'}, {'name': 'b'}]}), 'a;b;')

    def test_an_if_inside_a_loop(self):
        self.assertEqual(
            render('{% for x in xs %}{% if x %}{{ x }}{% endif %}{% endfor %}',
                   {'xs': [0, 1, 0, 2]}), '12')

    def test_a_bad_for_tag_is_an_error(self):
        with self.assertRaises(TemplateError) as caught:
            render('{% for x of xs %}{% endfor %}', {'xs': []})
        self.assertIn('bad for tag', str(caught.exception))


class Includes(unittest.TestCase):
    def test_a_partial_is_rendered_in_the_same_context(self):
        parts = {'p.html': '<b>{{ a }}</b>'}
        self.assertEqual(render('[{% include "p.html" %}]', {'a': 'x'},
                                loader=parts.__getitem__), '[<b>x</b>]')

    def test_a_partial_may_include_another(self):
        parts = {'one.html': '1{% include "two.html" %}', 'two.html': '2'}
        self.assertEqual(render('{% include "one.html" %}', {},
                                loader=parts.__getitem__), '12')

    def test_an_unquoted_include_is_an_error(self):
        with self.assertRaises(TemplateError) as caught:
            render('{% include p.html %}', {}, loader=lambda n: '')
        self.assertIn('quoted name', str(caught.exception))


class LoaderTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.addCleanup(self.tmp.cleanup)
        (self.root / 'partials').mkdir()
        (self.root / 'page.html').write_text(
            'A{% include "partials/b.html" %}C', encoding='utf-8')
        (self.root / 'partials' / 'b.html').write_text('{{ b }}', encoding='utf-8')

    def test_render_reads_from_disk(self):
        self.assertEqual(Loader(self.root).render('page.html', {'b': 'B'}), 'ABC')

    def test_a_missing_template_names_where_it_looked(self):
        with self.assertRaises(TemplateError) as caught:
            Loader(self.root).render('nope.html', {})
        self.assertIn('no such template', str(caught.exception))
        self.assertIn(str(self.root), str(caught.exception))

    def test_a_template_is_only_read_once(self):
        # The source is cached, not the rendering: a second render sees the new
        # context but the old file.
        loader = Loader(self.root)
        self.assertEqual(loader.render('page.html', {'b': '1'}), 'A1C')
        (self.root / 'page.html').write_text('changed', encoding='utf-8')
        self.assertEqual(loader.render('page.html', {'b': '2'}), 'A2C')

    def test_render_source_can_reach_a_shared_partial(self):
        # This is how a tool's body.html includes the drop zone without living
        # in templates/ itself.
        out = Loader(self.root).render_source(
            'own {% include "partials/b.html" %}', 'tool/body.html', {'b': 'B'})
        self.assertEqual(out, 'own B')

    def test_an_error_in_a_partial_names_the_partial(self):
        with self.assertRaises(TemplateError) as caught:
            Loader(self.root).render('page.html', {})
        self.assertIn('partials/b.html', str(caught.exception))


if __name__ == '__main__':
    unittest.main()
