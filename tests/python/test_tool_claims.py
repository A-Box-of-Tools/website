"""An intentional app handoff needs the same qualification in both twins.

These fixtures render the real pledge fragment and Markdown template without
building the site. A tool without overrides must keep the existing promise;
the receipt extractor must not regain it through its HTML or Markdown frame.
"""

import re
import tomllib
import unittest
from pathlib import Path

from buildlib import markdown
from buildlib.site import load_tool
from buildlib.template import Loader

ROOT = Path(__file__).resolve().parents[2]


class ToolClaims(unittest.TestCase):
    def setUp(self):
        self.site = tomllib.loads(
            (ROOT / 'config/site.toml').read_text(encoding='utf-8'))
        self.templates = Loader(ROOT / 'templates')
        source = self.templates.source('tool.html')
        match = re.search(
            r'<span class="pledge-title">(.*?)</span>', source, re.S)
        self.assertIsNotNone(match, 'The tool frame has no pledge title.')
        self.pledge_template = match.group(1)

    def tool(self, slug):
        return load_tool(ROOT / 'tools' / slug / 'tool.toml', self.site)

    def ui(self, tool):
        keys = ('md_note', 'pledge_line', 'guide_heading', 'related_heading',
                'questions_heading', 'privacy_heading', 'check_yourself',
                'read_first_lead')
        return {
            key: self.templates.render_source(
                self.site['ui']['tool'][key], f'ui.tool.{key}',
                {'tool': tool, 'site': self.site})
            for key in keys
        }

    def html_pledge(self, tool, ui):
        return self.templates.render_source(
            self.pledge_template, 'tool.html pledge',
            {'tool': tool, 'ui': {'tool': ui}}).strip()

    def twin(self, tool, ui):
        return markdown.tool_page(
            self.templates, self.site, tool, ui, None, [])

    def test_existing_tool_keeps_the_default_in_html_and_markdown(self):
        tool = self.tool('compress-image')
        ui = self.ui(tool)
        self.assertEqual(self.html_pledge(tool, ui), ui['pledge_line'].strip())
        twin = self.twin(tool, ui)
        self.assertIn(
            '## ' + markdown.inline(ui['pledge_line'], tool['url']), twin)
        self.assertIn(markdown.inline(ui['md_note'], tool['url']), twin)

    def test_receipts_qualify_the_app_handoff_in_both_twins(self):
        tool = self.tool('receipt-invoice-extractor')
        ui = self.ui(tool)
        pledge = self.html_pledge(tool, ui)
        twin = self.twin(tool, ui)
        self.assertEqual(pledge, tool['pledge_line'])
        self.assertIn('You choose what to email or share.', pledge)
        self.assertIn(
            '## ' + markdown.inline(tool['pledge_line'], tool['url']), twin)
        self.assertIn(markdown.inline(tool['md_note'], tool['url']), twin)
        self.assertIn('explicit handoffs', twin)
        self.assertNotIn(markdown.inline(ui['md_note'], tool['url']), twin)
        self.assertNotIn(
            '## ' + markdown.inline(ui['pledge_line'], tool['url']), twin)

    def test_camera_qualifies_its_network_feature_in_both_twins(self):
        tool = self.tool('remote-camera')
        ui = self.ui(tool)
        pledge = self.html_pledge(tool, ui)
        twin = self.twin(tool, ui)
        self.assertEqual(pledge, tool['pledge_line'])
        self.assertIn('Internet introduces the browsers.', pledge)
        self.assertIn(
            '## ' + markdown.inline(tool['pledge_line'], tool['url']), twin)
        self.assertIn(markdown.inline(tool['md_note'], tool['url']), twin)
        self.assertIn('Internet rendezvous carries setup metadata', twin)
        self.assertNotIn(markdown.inline(ui['md_note'], tool['url']), twin)
        self.assertNotIn(
            '## ' + markdown.inline(ui['pledge_line'], tool['url']), twin)

    def test_the_two_optional_overrides_are_independent(self):
        for key in ('pledge_line', 'md_note'):
            with self.subTest(override=key):
                tool = self.tool('compress-image')
                tool[key] = 'Review the report before sharing it.'
                ui = self.ui(tool)
                twin = self.twin(tool, ui)
                self.assertIn(tool[key], twin)
                other = 'md_note' if key == 'pledge_line' else 'pledge_line'
                self.assertIn(markdown.inline(ui[other], tool['url']), twin)
                expected = (tool[key] if key == 'pledge_line'
                            else ui['pledge_line'].strip())
                self.assertEqual(self.html_pledge(tool, ui), expected)


if __name__ == '__main__':
    unittest.main()
