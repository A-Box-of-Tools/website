"""Small HTML fixtures protect the public catalogue's source of truth."""

import html
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from urllib.parse import urlsplit


SPEC = importlib.util.spec_from_file_location(
    'catalogue_prepare', Path(__file__).resolve().parents[1] / 'prepare.py')
PREPARE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(PREPARE)


def hub_document(tools, *, language='en', home='https://abox.tools/', cards=None, mutate=None):
    entries = [{
        '@type': 'ListItem', 'position': index, 'url': tool['url'],
        'item': {'@type': 'WebApplication', '@id': tool['url'] + '#app', **tool},
    } for index, tool in enumerate(tools, 1)]
    collection = {'@type': 'CollectionPage', 'url': home,
                  'mainEntity': {'@type': 'ItemList', 'itemListElement': entries}}
    if mutate:
        mutate(collection)
    linked_data = json.dumps({'@context': 'https://schema.org', '@graph': [collection]},
                             ensure_ascii=False)
    if cards is None:
        cards = [urlsplit(tool['url']).path for tool in tools]
    anchors = ''.join(f'<a class="tool-card" href="{html.escape(href, quote=True)}">Tool</a>'
                      for href in cards)
    return (f'<!doctype html><html lang="{language}"><head>'
            f'<script type="application/ld+json">{linked_data}</script></head>'
            f'<body>{anchors}</body></html>')


class ReadHubTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.directory = Path(temporary.name)
        self.tools = [
            {'name': 'Image Compressor', 'description': 'Compress JPEG and PNG images.',
             'url': 'https://abox.tools/compress-image/'},
            {'name': 'PDF Compressor', 'description': 'Reduce PDF size.',
             'url': 'https://abox.tools/compress-pdf/'},
        ]

    def write_hub(self, tools=None, **kwargs):
        path = self.directory / 'index.html'
        path.write_bytes(hub_document(self.tools if tools is None else tools, **kwargs).encode('utf-8'))
        return path

    def test_cards_and_json_ld_describe_the_same_public_tools(self):
        result = PREPARE.read_hub(self.write_hub(), 'en', expected_count=2)
        self.assertEqual(result, {'language': 'en', 'tools': self.tools})

    def test_a_translation_can_publish_fewer_genuine_cards_than_english(self):
        english = PREPARE.read_hub(self.write_hub(), 'en', expected_count=2)
        german_tools = [{'name': 'Bilder komprimieren', 'description': 'JPEG und PNG komprimieren.',
                         'url': 'https://abox.tools/de/compress-image/'}]
        german = PREPARE.read_hub(self.write_hub(
            german_tools, language='de', home='https://abox.tools/de/'), 'de')
        self.assertEqual(len(english['tools']), 2)
        self.assertEqual(german, {'language': 'de', 'tools': german_tools})
        with self.assertRaises(ValueError):
            PREPARE.read_hub(self.write_hub(), 'en', expected_count=3)

    def test_missing_extra_or_duplicate_visible_cards_are_rejected(self):
        for cards in [
                ['/compress-image/'],
                ['/compress-image/', '/compress-pdf/', '/other-tool/'],
                ['/compress-image/', '/compress-image/']]:
            with self.subTest(cards=cards), self.assertRaises(ValueError):
                PREPARE.read_hub(self.write_hub(cards=cards), 'en')

    def test_unsafe_or_noncanonical_tool_urls_are_rejected(self):
        for url in [
                'https://other.example/compress-image/',
                'http://abox.tools/compress-image/',
                'https://user:password@abox.tools/compress-image/',
                'https://abox.tools/compress-image/?private=file',
                'https://abox.tools/compress-image/#private-file',
                'file:///private/image.png',
                'javascript:alert(1)']:
            with self.subTest(url=url), self.assertRaises(ValueError):
                tool = {**self.tools[0], 'url': url}
                PREPARE.read_hub(self.write_hub([tool]), 'en')

    def test_list_item_and_application_identity_must_match_the_tool_url(self):
        def mismatched_item(collection):
            collection['mainEntity']['itemListElement'][0]['url'] = 'https://abox.tools/other-tool/'

        def mismatched_identity(collection):
            collection['mainEntity']['itemListElement'][0]['item']['@id'] = 'https://abox.tools/other-tool/#app'

        for mutate in [mismatched_item, mismatched_identity]:
            with self.subTest(mutate=mutate.__name__), self.assertRaises(ValueError):
                PREPARE.read_hub(self.write_hub(mutate=mutate), 'en')

    def test_encoded_markup_cannot_become_a_plain_text_description(self):
        tool = {**self.tools[0], 'description': 'Use &lt;script&gt; in a description.'}
        with self.assertRaises(ValueError):
            PREPARE.read_hub(self.write_hub([tool]), 'en')


if __name__ == '__main__':
    unittest.main()
