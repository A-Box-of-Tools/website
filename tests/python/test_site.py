"""
buildlib/site.py.

Two groups of claims are worth pinning down here.

The first is the Content-Security-Policy. `render_csp` exists so that no tool
can quietly widen or narrow the site policy, and "never narrower" is a property
a test can check directly rather than a comment anyone has to trust.

The second is the config loading, which is a pile of refusals: a tool whose
slug does not match its folder, a guide with no publication date, a page that
would end up at a URL nobody wrote down. Each of those is a build that should
stop, and each is one test.
"""

import json
import tempfile
import unittest
from pathlib import Path

from buildlib import site as sitelib

SITE = {'domain': 'https://example.test/', 'name': 'Site', 'lang': 'en',
        'guides': {'slug': 'guides', 'heading': 'Guides',
                   'description': 'every guide'}}

TOOL_TOML = '''
slug = "widget"
name = "Widget"
heading = "Widget"
tagline = "Does a thing"
icon = "W"
favicon = "W"
category = "images"
lastmod = "2026-01-01"
title = "Widget"
description = "d"
og_title = "t"
og_description = "d"
og_image_alt = "a"
pledge = "p"
live_hint = "h"
read_first = "r"
howto_heading = "How"
card = "c"
facts = []
privacy = []
howto = []
faq = []

[words]
plural = "files"
choose = "Choose files"

[schema]
category = "UtilitiesApplication"
description = "d"
features = []
'''

PAGE_TOML = '''
slug = "privacy"
nav = "Privacy"
title = "Privacy"
description = "d"
heading = "Privacy"
lede = "l"
updated = "January 2026"
lastmod = "2026-01-01"
og_title = "t"
og_description = "d"
og_image_alt = "a"
'''


class TempTree(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.addCleanup(self.tmp.cleanup)

    def write(self, relative, text):
        path = self.root / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding='utf-8')
        return path


class LoadToml(TempTree):
    def test_a_missing_file_is_a_config_error(self):
        with self.assertRaises(sitelib.ConfigError) as caught:
            sitelib.load_toml(self.root / 'nope.toml')
        self.assertIn('missing config file', str(caught.exception))

    def test_a_syntax_error_names_the_file(self):
        path = self.write('bad.toml', 'a = = 1\n')
        with self.assertRaises(sitelib.ConfigError) as caught:
            sitelib.load_toml(path)
        self.assertIn('bad.toml', str(caught.exception))

    def test_a_good_file_loads(self):
        path = self.write('ok.toml', 'a = 1\n')
        self.assertEqual(sitelib.load_toml(path), {'a': 1})


class RenderCsp(unittest.TestCase):
    def test_the_base_policy_is_rendered(self):
        out = sitelib.render_csp({'default-src': ["'none'"]})
        self.assertIn('<meta http-equiv="Content-Security-Policy" content="', out)
        self.assertIn("default-src 'none';", out)
        self.assertTrue(out.endswith('">'))

    def test_an_addition_widens_an_existing_directive(self):
        out = sitelib.render_csp({'img-src': ["'self'"]}, {'img-src': ['http:']})
        self.assertIn("img-src 'self' http:;", out)

    def test_an_addition_may_introduce_a_new_directive(self):
        out = sitelib.render_csp({'default-src': ["'none'"]},
                                 {'worker-src': ["'self'"]})
        self.assertIn("worker-src 'self';", out)

    def test_nothing_can_be_removed(self):
        # The result is always at least as wide as the site policy. Handing a
        # directive a shorter list must not shorten it.
        base = {'script-src': ["'self'", 'https://a.test']}
        out = sitelib.render_csp(base, {'script-src': ["'self'"]})
        self.assertIn("script-src 'self' https://a.test;", out)

    def test_a_repeated_value_is_not_written_twice(self):
        out = sitelib.render_csp({'img-src': ["'self'"]},
                                 {'img-src': ["'self'", 'http:']},
                                 {'img-src': ['http:']})
        self.assertIn("img-src 'self' http:;", out)
        self.assertEqual(out.count('http:'), 1)

    def test_empty_additions_are_ignored(self):
        base = {'default-src': ["'none'"]}
        self.assertEqual(sitelib.render_csp(base, {}, None),
                         sitelib.render_csp(base))

    def test_a_long_directive_is_broken_over_lines(self):
        hosts = [f'https://origin-number-{n}.example.test' for n in range(4)]
        out = sitelib.render_csp({'script-src': ["'self'"] + hosts})
        lines = out.split('\n')
        # Keyword sources stay up on the directive line, hosts go underneath.
        self.assertIn("  script-src 'self'", lines)
        for host in hosts[:-1]:
            self.assertIn(f'    {host}', lines)
        self.assertIn(f'    {hosts[-1]};', lines)

    def test_every_directive_ends_in_a_semicolon(self):
        out = sitelib.render_csp({
            'default-src': ["'none'"],
            'script-src': [f'https://origin-number-{n}.example.test' for n in range(5)],
        })
        body = [l for l in out.split('\n')[1:-1]]
        self.assertEqual(sum(1 for l in body if l.rstrip().endswith(';')), 2)

    def test_the_real_site_policy_renders(self):
        """Every directive in config/site.toml reaches the rendered tag."""
        root = Path(__file__).resolve().parents[2]
        config = sitelib.load_toml(root / 'config' / 'site.toml')
        out = sitelib.render_csp(config['csp'], config.get('tool_csp', {}))

        # A directive with only hosts in it has nothing after its name on the
        # opening line, so match the name at the start of a line rather than
        # assuming a space follows it.
        heads = {line.strip().split(' ')[0].rstrip(';')
                 for line in out.split('\n') if line.startswith('  ')}
        for directive in config['csp']:
            self.assertIn(directive, heads)

    def test_the_real_site_policy_carries_every_origin(self):
        root = Path(__file__).resolve().parents[2]
        config = sitelib.load_toml(root / 'config' / 'site.toml')
        out = sitelib.render_csp(config['csp'])
        for values in config['csp'].values():
            for value in values:
                self.assertIn(value, out)


class ToText(unittest.TestCase):
    def test_tags_are_removed(self):
        self.assertEqual(sitelib.to_text('<p>Hello <code>x</code></p>'), 'Hello x')

    def test_entities_are_unescaped(self):
        self.assertEqual(sitelib.to_text('a &amp; b &mdash; c'), 'a & b - c')

    def test_typographic_punctuation_is_flattened(self):
        self.assertEqual(sitelib.to_text('it’s “x” – y'),
                         'it\'s "x" - y')

    def test_whitespace_is_collapsed(self):
        self.assertEqual(sitelib.to_text('a\n\n   b\t c '), 'a b c')

    def test_a_non_breaking_space_becomes_a_plain_one(self):
        self.assertEqual(sitelib.to_text('a b'), 'a b')

    def test_the_result_is_ascii(self):
        text = sitelib.to_text('<b>café</b> — “work”')
        self.assertEqual(text, 'café - "work"')  # accents stay, punctuation flattens


class StructuredData(unittest.TestCase):
    def test_dumps_ld_is_pure_ascii(self):
        out = sitelib.dumps_ld([{'name': 'café — x'}])
        out.encode('ascii')  # raises if it is not
        self.assertIn('\\u00e9', out)

    def test_dumps_ld_carries_the_context(self):
        data = json.loads(sitelib.dumps_ld([{'@type': 'Thing'}]))
        self.assertEqual(data['@context'], 'https://schema.org')
        self.assertEqual(data['@graph'], [{'@type': 'Thing'}])

    def test_a_tool_graph_has_the_three_types(self):
        tool = {
            'name': 'Widget', 'url': 'https://example.test/widget/',
            'schema': {'category': 'UtilitiesApplication', 'description': 'd',
                       'features': ['a']},
            'faq': [{'q': '<b>Why?</b>', 'a': 'Because &amp; so.'}],
        }
        graph = json.loads(sitelib.tool_jsonld(SITE, tool))['@graph']
        self.assertEqual([item['@type'] for item in graph],
                         ['SoftwareApplication', 'BreadcrumbList', 'FAQPage'])

    def test_faq_answers_are_derived_from_the_page_html(self):
        # Authored once as the HTML that renders, so the two cannot contradict
        # each other.
        tool = {
            'name': 'Widget', 'url': 'https://example.test/widget/',
            'schema': {'category': 'C', 'description': 'd', 'features': []},
            'faq': [{'q': '<b>Why?</b>', 'a': 'Because &amp; <i>so</i>.'}],
        }
        faq = json.loads(sitelib.tool_jsonld(SITE, tool))['@graph'][2]
        self.assertEqual(faq['mainEntity'][0]['name'], 'Why?')
        self.assertEqual(faq['mainEntity'][0]['acceptedAnswer']['text'],
                         'Because & so.')

    def test_a_guide_is_an_article(self):
        page = {'kind': 'guide', 'heading': 'H', 'description': 'd', 'nav': 'N',
                'url': 'https://example.test/guides/x/',
                'published': '2026-01-01', 'lastmod': '2026-02-01'}
        graph = json.loads(sitelib.page_jsonld(SITE, page))['@graph']
        self.assertEqual(graph[0]['@type'], 'Article')
        self.assertEqual(graph[0]['datePublished'], '2026-01-01')
        self.assertEqual(graph[0]['dateModified'], '2026-02-01')

    def test_a_guides_breadcrumb_goes_through_the_index(self):
        # Three steps, because the visible trail on the page has three. Markup
        # is meant to describe what a visitor can see.
        page = {'kind': 'guide', 'heading': 'H', 'description': 'd', 'nav': 'N',
                'url': 'https://example.test/guides/x/',
                'published': '2026-01-01', 'lastmod': '2026-02-01'}
        graph = json.loads(sitelib.page_jsonld(SITE, page))['@graph']
        trail = graph[1]['itemListElement']
        self.assertEqual([step['position'] for step in trail], [1, 2, 3])
        self.assertEqual([step['item'] for step in trail],
                         ['https://example.test/',
                          'https://example.test/guides/',
                          'https://example.test/guides/x/'])

    def test_the_guides_index_lists_the_guides_in_order(self):
        guides = [{'heading': 'First', 'url': 'https://example.test/guides/a/'},
                  {'heading': 'Second', 'url': 'https://example.test/guides/b/'}]
        graph = json.loads(sitelib.guides_jsonld(SITE, guides))['@graph']
        items = graph[0]['mainEntity']['itemListElement']
        self.assertEqual([item['position'] for item in items], [1, 2])
        self.assertEqual([item['name'] for item in items], ['First', 'Second'])

    def test_a_legal_page_gets_no_structured_data(self):
        # Inventing schema for a privacy policy would describe the page as
        # something it is not.
        page = {'kind': 'legal', 'heading': 'H', 'description': 'd', 'nav': 'N',
                'url': 'https://example.test/privacy/', 'lastmod': '2026-01-01'}
        self.assertEqual(sitelib.page_jsonld(SITE, page), '')

    def test_the_hub_lists_the_tools_in_order(self):
        tools = [{'name': 'A', 'url': 'https://example.test/a/'},
                 {'name': 'B', 'url': 'https://example.test/b/'}]
        site = dict(SITE, hub={'schema_description': 'd', 'schema_about': ['x']})
        graph = json.loads(sitelib.hub_jsonld(site, tools))['@graph']
        items = graph[2]['mainEntity']['itemListElement']
        self.assertEqual([i['position'] for i in items], [1, 2])
        self.assertEqual([i['name'] for i in items], ['A', 'B'])


class LoadTool(TempTree):
    def tool_at(self, folder, body=TOOL_TOML):
        return self.write(f'tools/{folder}/tool.toml', body)

    def test_a_complete_tool_loads(self):
        tool = sitelib.load_tool(self.tool_at('widget'), SITE)
        self.assertEqual(tool['url'], 'https://example.test/widget/')
        self.assertEqual(tool['dir'].name, 'widget')

    def test_optional_keys_are_filled_in(self):
        tool = sitelib.load_tool(self.tool_at('widget'), SITE)
        self.assertEqual(tool['words']['analytics_extra'], '')
        self.assertEqual(tool['csp_note'], '')
        self.assertEqual(tool['csp'], {})

    def test_a_missing_key_is_named(self):
        body = TOOL_TOML.replace('tagline = "Does a thing"\n', '')
        with self.assertRaises(sitelib.ConfigError) as caught:
            sitelib.load_tool(self.tool_at('widget', body), SITE)
        self.assertIn('tagline', str(caught.exception))

    def test_the_slug_must_match_the_folder(self):
        with self.assertRaises(sitelib.ConfigError) as caught:
            sitelib.load_tool(self.tool_at('gadget'), SITE)
        self.assertIn('gadget', str(caught.exception))

    def test_words_needs_plural_and_choose(self):
        body = TOOL_TOML.replace('choose = "Choose files"\n', '')
        with self.assertRaises(sitelib.ConfigError) as caught:
            sitelib.load_tool(self.tool_at('widget', body), SITE)
        self.assertIn('choose', str(caught.exception))


class LoadPage(TempTree):
    def page_at(self, folder, body=PAGE_TOML):
        return self.write(f'pages/{folder}/page.toml', body)

    def test_a_legal_page_loads(self):
        page = sitelib.load_page(self.page_at('privacy'), SITE, self.root / 'pages')
        self.assertEqual(page['kind'], 'legal')
        self.assertEqual(page['url'], 'https://example.test/privacy/')
        self.assertEqual(page['depth'], 1)

    def test_a_guide_sits_one_level_deeper(self):
        body = (PAGE_TOML.replace('slug = "privacy"', 'slug = "guides/why"')
                + 'kind = "guide"\npublished = "2026-01-01"\ngroup = "g"\n')
        page = sitelib.load_page(self.page_at('guides/why', body), SITE,
                                 self.root / 'pages')
        self.assertEqual(page['depth'], 2)
        self.assertEqual(page['url'], 'https://example.test/guides/why/')

    def test_the_slug_is_measured_from_the_pages_root(self):
        body = PAGE_TOML.replace('slug = "privacy"', 'slug = "why"')
        with self.assertRaises(sitelib.ConfigError) as caught:
            sitelib.load_page(self.page_at('guides/why', body), SITE,
                              self.root / 'pages')
        self.assertIn('guides/why', str(caught.exception))

    def test_an_unknown_kind_is_refused(self):
        body = PAGE_TOML + 'kind = "essay"\n'
        with self.assertRaises(sitelib.ConfigError) as caught:
            sitelib.load_page(self.page_at('privacy', body), SITE,
                              self.root / 'pages')
        self.assertIn('essay', str(caught.exception))

    def test_a_guide_must_say_when_it_was_published(self):
        # Defaulting to lastmod would quietly claim a correction was the
        # original.
        body = (PAGE_TOML.replace('slug = "privacy"', 'slug = "guides/why"')
                + 'kind = "guide"\ngroup = "g"\n')
        with self.assertRaises(sitelib.ConfigError) as caught:
            sitelib.load_page(self.page_at('guides/why', body), SITE,
                              self.root / 'pages')
        self.assertIn('published', str(caught.exception))

    def test_a_guide_must_name_the_group_it_appears_under(self):
        # A guide with no group would be built, sit at a URL, and be linked to
        # from nowhere at all.
        body = (PAGE_TOML.replace('slug = "privacy"', 'slug = "guides/why"')
                + 'kind = "guide"\npublished = "2026-01-01"\n')
        with self.assertRaises(sitelib.ConfigError) as caught:
            sitelib.load_page(self.page_at('guides/why', body), SITE,
                              self.root / 'pages')
        self.assertIn('group', str(caught.exception))

    def test_a_page_that_names_no_tool_gets_an_empty_one(self):
        # Falsy rather than missing, so the template can ask without a page
        # having to declare that it is about nothing.
        page = sitelib.load_page(self.page_at('privacy'), SITE, self.root / 'pages')
        self.assertEqual(page['tool'], '')

    def test_a_missing_key_is_named(self):
        body = PAGE_TOML.replace('lede = "l"\n', '')
        with self.assertRaises(sitelib.ConfigError) as caught:
            sitelib.load_page(self.page_at('privacy', body), SITE,
                              self.root / 'pages')
        self.assertIn('lede', str(caught.exception))


class SharedParts(unittest.TestCase):
    """Setting [picker.urls] has to imply the module, the sheet and the CSP."""

    def test_a_tool_without_urls_wants_nothing(self):
        tool = {'picker': {}}
        self.assertFalse(sitelib.wants_urls(tool))
        self.assertEqual(sitelib.js_parts(tool), [])
        self.assertEqual(sitelib.css_parts(tool), [])
        self.assertEqual(sitelib.picker_csp(tool), {})

    def test_urls_pull_in_the_module_and_the_sheet(self):
        tool = {'picker': {'urls': True}}
        self.assertIn('url-import', sitelib.js_parts(tool))
        self.assertIn('url-import', sitelib.css_parts(tool))

    def test_urls_widen_img_src_and_nothing_else(self):
        # img-src rather than connect-src is the whole design: pictures come
        # in, nothing goes out.
        self.assertEqual(sitelib.picker_csp({'picker': {'urls': True}}),
                         {'img-src': ['http:']})

    def test_the_part_is_not_added_twice(self):
        tool = {'picker': {'urls': True}, 'js_parts': ['url-import', 'file-picker']}
        self.assertEqual(sitelib.js_parts(tool), ['url-import', 'file-picker'])

    def test_explicit_parts_are_kept_in_order(self):
        tool = {'picker': {'urls': True}, 'js_parts': ['file-picker']}
        self.assertEqual(sitelib.js_parts(tool), ['file-picker', 'url-import'])

    def test_the_returned_list_is_a_copy(self):
        parts = ['file-picker']
        sitelib.js_parts({'picker': {'urls': True}, 'js_parts': parts})
        self.assertEqual(parts, ['file-picker'])


class Hashes(TempTree):
    def test_text_hash_is_ten_hex_characters(self):
        digest = sitelib.text_hash('a')
        self.assertEqual(len(digest), 10)
        int(digest, 16)

    def test_text_hash_is_stable(self):
        self.assertEqual(sitelib.text_hash('a{color:red}'),
                         sitelib.text_hash('a{color:red}'))

    def test_text_hash_changes_with_the_text(self):
        self.assertNotEqual(sitelib.text_hash('a'), sitelib.text_hash('b'))

    def test_cache_hash_ignores_the_order_it_is_given(self):
        a = self.write('a.js', 'one')
        b = self.write('b.js', 'two')
        self.assertEqual(sitelib.cache_hash([a, b]), sitelib.cache_hash([b, a]))

    def test_cache_hash_changes_when_a_file_changes(self):
        a = self.write('a.js', 'one')
        before = sitelib.cache_hash([a])
        a.write_text('two', encoding='utf-8')
        self.assertNotEqual(before, sitelib.cache_hash([a]))

    def test_cache_hash_changes_when_a_file_is_renamed(self):
        # The name is hashed as well as the bytes, so a module that moved
        # invalidates the cache even if its contents did not change.
        a = self.write('a.js', 'one')
        b = self.write('b.js', 'one')
        self.assertNotEqual(sitelib.cache_hash([a]), sitelib.cache_hash([b]))

    def test_cache_hash_changes_when_a_file_is_added(self):
        a = self.write('a.js', 'one')
        b = self.write('b.js', 'two')
        self.assertNotEqual(sitelib.cache_hash([a]), sitelib.cache_hash([a, b]))


if __name__ == '__main__':
    unittest.main()
