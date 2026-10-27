"""Extract only public tool descriptions from a complete, canonical site build.

Nothing here packages the site's assets. The MCP view receives public catalogue
text, never a file-processing module, advertising tag or service worker.
"""

import argparse
import html
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import subprocess
import tomllib
from urllib.parse import urljoin, urlsplit


ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent


class HubData(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.language = None
        self._in_ld = False
        self._parts = []
        self.documents = []
        self.cards = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == 'html':
            self.language = values.get('lang')
        if tag == 'a' and 'tool-card' in values.get('class', '').split():
            self.cards.append(values.get('href', ''))
        if tag == 'script' and values.get('type') == 'application/ld+json':
            self._in_ld = True
            self._parts = []

    def handle_data(self, data):
        if self._in_ld:
            self._parts.append(data)

    def handle_endtag(self, tag):
        if tag == 'script' and self._in_ld:
            self.documents.append(json.loads(''.join(self._parts)))
            self._in_ld = False


def _types(node):
    value = node.get('@type', [])
    return [value] if isinstance(value, str) else value


def _text(value, field):
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f'Missing public {field}')
    value = html.unescape(value).strip()
    if '<' in value or '>' in value or any(ord(char) < 32 for char in value):
        raise ValueError(f'{field} must be plain text')
    return value


def read_hub(path, locale, expected_count=None):
    parser = HubData()
    parser.feed(path.read_text(encoding='utf-8'))
    graphs = [node for doc in parser.documents for node in doc.get('@graph', [doc])]
    collections = [node for node in graphs if 'CollectionPage' in _types(node)]
    if len(collections) != 1:
        raise ValueError(f'{path}: expected one CollectionPage')
    listing = collections[0].get('mainEntity', {})
    if 'ItemList' not in _types(listing):
        raise ValueError(f'{path}: missing public ItemList')
    tools = []
    seen = set()
    for entry in listing.get('itemListElement', []):
        app = entry.get('item', {})
        if 'WebApplication' not in _types(app):
            raise ValueError(f'{path}: catalogue item is not a WebApplication')
        url = app.get('url')
        parsed = urlsplit(url or '')
        if (parsed.scheme != 'https' or parsed.netloc != 'abox.tools'
                or parsed.query or parsed.fragment or not parsed.path.endswith('/')
                or not re.fullmatch(r'/(?:[a-zA-Z0-9-]+/)+', parsed.path)):
            raise ValueError(f'{path}: tool URL is not a canonical abox.tools path')
        if url in seen or entry.get('url') != url:
            raise ValueError(f'{path}: duplicate or mismatched tool URL')
        if app.get('@id') != url + '#app':
            raise ValueError(f'{path}: application identity does not match its URL')
        seen.add(url)
        tools.append({'name': _text(app.get('name'), 'name'),
                      'description': _text(app.get('description'), 'description'),
                      'url': url})
    if expected_count is not None and len(tools) != expected_count:
        raise ValueError(f'{path}: expected {expected_count} tools, found {len(tools)}')
    home = collections[0].get('url', '')
    cards = [urljoin(home, href) for href in parser.cards]
    if not tools or len(cards) != len(set(cards)) or set(cards) != seen:
        raise ValueError(f'{path}: public cards and structured catalogue disagree')
    if not parser.language:
        raise ValueError(f'{path}: missing page language')
    return {'language': parser.language, 'tools': tools}


def prepare(site_dir, output_dir, revision=None, tag=None, dirty=None):
    config = tomllib.loads((ROOT / 'config/site.toml').read_text(encoding='utf-8'))
    frozen = set(config.get('frozen_languages', []))
    locales = ['en'] + sorted(path.name for path in (ROOT / 'locales').iterdir()
                              if path.is_dir() and (path / 'locale.toml').is_file()
                              and path.name != 'en' and path.name not in frozen)
    count = sum(len(category['order']) for category in config['hub']['categories'])
    if any(value is not None for value in (revision, tag, dirty)):
        if revision is None or tag is None or dirty is None:
            raise ValueError('Explicit build identity requires --revision, --tag and --dirty or --clean-source')
    else:
        revision = subprocess.check_output(['git', '-C', str(ROOT), 'rev-parse', 'HEAD'],
                                           text=True).strip()
        tags = subprocess.check_output(['git', '-C', str(ROOT), 'tag', '--list'], text=True).splitlines()
        versions = [value for value in tags if re.fullmatch(r'\d+\.\d+\.\d+', value)]
        if not versions:
            raise ValueError('Fetch the existing site version tags before building the service')
        tag = max(versions, key=lambda value: tuple(map(int, value.split('.'))))
        dirty = bool(subprocess.check_output(['git', '-C', str(ROOT), 'status', '--porcelain',
                                             '--untracked-files=normal'], text=True).strip())
    if not re.fullmatch(r'[0-9a-f]{40}', revision) or not re.fullmatch(r'\d+\.\d+\.\d+', tag):
        raise ValueError('Preparation needs the actual source revision and a site version tag')
    version = f'{tag}+sha.{revision[:12]}' + ('.dirty' if dirty else '')
    result = {'schemaVersion': 1,
              'build': {'version': version, 'revision': revision, 'dirty': dirty},
              'locales': {}}
    for locale in locales:
        relative = Path('index.html') if locale == 'en' else Path(locale) / 'index.html'
        # Translations offer only the tools actually published in that language.
        # The built cards, not English's count, define that public catalogue.
        result['locales'][locale] = read_hub(site_dir / relative, locale,
                                           count if locale == 'en' else None)
    output_dir.mkdir(parents=True, exist_ok=True)
    body = json.dumps(result, ensure_ascii=False, indent=2) + '\n'
    (output_dir / 'catalogue.json').write_bytes(body.encode('utf-8'))
    counts = ', '.join(f'{locale}={len(section["tools"])}'
                       for locale, section in result['locales'].items())
    print(f'Prepared public catalogue: {counts}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--site-dir', type=Path, default=ROOT / '_plain')
    parser.add_argument('--out', type=Path, default=HERE / 'generated')
    parser.add_argument('--revision', help='Actual full source commit, when Git metadata is supplied by the caller')
    parser.add_argument('--tag', help='Existing numeric site version tag paired with --revision')
    state = parser.add_mutually_exclusive_group()
    state.add_argument('--dirty', dest='dirty', action='store_true', default=None)
    state.add_argument('--clean-source', dest='dirty', action='store_false')
    args = parser.parse_args()
    prepare(args.site_dir.resolve(), args.out.resolve(), args.revision, args.tag, args.dirty)
