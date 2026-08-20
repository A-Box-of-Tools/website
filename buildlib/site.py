"""
Loading and checking the configuration, and the small derivations that turn it
into what the templates want.

Everything that used to be "keep these two files in step by hand" lives here:
the Content-Security-Policy is assembled once, the structured data is derived
from the same prose that renders on the page, and the sitemap and hub cards are
derived from the list of tools that exists on disk.
"""

import hashlib
import html
import json
import re
import tomllib

REQUIRED_TOOL_KEYS = (
    'slug', 'name', 'heading', 'tagline', 'icon', 'favicon', 'category',
    'lastmod', 'title', 'description', 'og_title', 'og_description',
    'og_image_alt', 'pledge', 'live_hint', 'read_first', 'howto_heading',
    'card', 'words', 'facts', 'privacy', 'howto', 'faq', 'schema',
)


class ConfigError(Exception):
    pass


def load_toml(path):
    try:
        with open(path, 'rb') as handle:
            return tomllib.load(handle)
    except FileNotFoundError:
        raise ConfigError(f'missing config file: {path}') from None
    except tomllib.TOMLDecodeError as err:
        raise ConfigError(f'{path}: {err}') from None


# ---------------------------------------------------------------------------
# Content-Security-Policy


def render_csp(base, *additions):
    """Build the <meta http-equiv="Content-Security-Policy"> tag.

    Each addition may add values to a directive the base already has, and may
    add directives the base does not have. Nothing can remove anything: the
    result is always at least as wide as the site policy and never narrower, so
    no tool can quietly drop an origin the ads need, and no tool's policy can
    reach another tool's page.

    Added directives are emitted after the base ones. CSP does not care about
    the order directives are written in.
    """
    directives = {name: list(values) for name, values in base.items()}
    for addition in additions:
        for name, values in (addition or {}).items():
            if name in directives:
                for value in values:
                    if value not in directives[name]:
                        directives[name].append(value)
            else:
                directives[name] = list(values)

    lines = ['<meta http-equiv="Content-Security-Policy" content="']
    for name, values in directives.items():
        inline = f'  {name} {" ".join(values)};'
        if len(inline) <= 72:
            lines.append(inline)
            continue
        # Too long to read on one line. Keyword sources ('self', 'none') stay
        # up on the directive line; a list of hosts starts underneath it, one
        # per line, so that adding or removing an origin is a one-line diff.
        head, rest = [], list(values)
        while rest and rest[0].startswith("'"):
            head.append(rest.pop(0))
        lines.append(f'  {name} {" ".join(head)}'.rstrip())
        lines.extend(f'    {value}' for value in rest[:-1])
        lines.append(f'    {rest[-1]};')
    lines.append('">')
    return '\n'.join(lines)


# ---------------------------------------------------------------------------
# HTML -> plain text, for structured data
#
# The FAQ answers are authored once, as the HTML that renders on the page. The
# JSON-LD copy is derived from it here rather than typed out a second time,
# which is the whole reason the two can no longer contradict each other.

TAG = re.compile(r'<[^>]+>')


def to_text(fragment):
    text = TAG.sub('', fragment)
    text = html.unescape(text)
    text = text.replace('—', '-').replace('–', '-')
    text = text.replace('’', "'").replace('‘', "'")
    text = text.replace('“', '"').replace('”', '"')
    text = text.replace(' ', ' ')
    return ' '.join(text.split())


def tool_jsonld(site, tool):
    """SoftwareApplication + BreadcrumbList + FAQPage for one tool page."""
    graph = [
        {
            '@type': 'SoftwareApplication',
            'name': tool['name'],
            'url': tool['url'],
            'applicationCategory': tool['schema']['category'],
            'operatingSystem': 'Any (runs in a web browser)',
            'browserRequirements': tool['schema'].get(
                'browser_requirements', 'Requires JavaScript.'),
            'description': tool['schema']['description'],
            'isAccessibleForFree': True,
            'offers': {'@type': 'Offer', 'price': '0', 'priceCurrency': 'USD'},
            'featureList': tool['schema']['features'],
            'publisher': {
                '@type': 'Organization',
                'name': site['name'],
                'url': site['domain'],
            },
        },
        {
            '@type': 'BreadcrumbList',
            'itemListElement': [
                {'@type': 'ListItem', 'position': 1,
                 'name': site['name'], 'item': site['domain']},
                {'@type': 'ListItem', 'position': 2,
                 'name': tool['name'], 'item': tool['url']},
            ],
        },
        {
            '@type': 'FAQPage',
            'mainEntity': [
                {
                    '@type': 'Question',
                    'name': to_text(entry['q']),
                    'acceptedAnswer': {'@type': 'Answer', 'text': to_text(entry['a'])},
                }
                for entry in tool['faq']
            ],
        },
    ]
    return dumps_ld(graph)


def hub_jsonld(site, tools):
    graph = [
        {
            '@type': 'WebSite',
            '@id': site['domain'] + '#website',
            'url': site['domain'],
            'name': site['name'],
            'description': site['hub']['schema_description'],
            'inLanguage': site['lang'],
            'publisher': {'@id': site['domain'] + '#publisher'},
        },
        {
            '@type': 'Organization',
            '@id': site['domain'] + '#publisher',
            'name': site['name'],
            'url': site['domain'],
            'logo': {
                '@type': 'ImageObject',
                'url': site['domain'] + 'icon-180.png',
                'width': 180,
                'height': 180,
            },
        },
        {
            '@type': 'CollectionPage',
            '@id': site['domain'] + '#collection',
            'url': site['domain'],
            'name': site['name'],
            'isPartOf': {'@id': site['domain'] + '#website'},
            'about': site['hub']['schema_about'],
            'mainEntity': {
                '@type': 'ItemList',
                'itemListElement': [
                    {
                        '@type': 'ListItem',
                        'position': position,
                        'url': tool['url'],
                        'name': to_text(tool['name']),
                    }
                    for position, tool in enumerate(tools, start=1)
                ],
            },
        },
    ]
    return dumps_ld(graph)


def dumps_ld(graph):
    """Serialise a @graph. ensure_ascii keeps the generated files pure ASCII,
    which is the same promise the hand-written pages made."""
    return json.dumps(
        {'@context': 'https://schema.org', '@graph': graph},
        indent=2, ensure_ascii=True,
    )


# ---------------------------------------------------------------------------
# Tools


def load_tool(path, site):
    """Read one tools/<slug>/tool.toml and fill in what follows from it."""
    tool = load_toml(path)
    missing = [key for key in REQUIRED_TOOL_KEYS if key not in tool]
    if missing:
        raise ConfigError(f'{path}: missing {", ".join(missing)}')

    if tool['slug'] != path.parent.name:
        raise ConfigError(
            f'{path}: slug is {tool["slug"]!r} but the folder is {path.parent.name!r}')

    for key in ('plural', 'choose'):
        if key not in tool['words']:
            raise ConfigError(f'{path}: [words] needs {key}')
    tool['words'].setdefault('analytics_extra', '')
    # Optional: a tool that needs no directive of its own has nothing to add to
    # the policy comment, and no extra file worth naming in the privacy panel.
    tool.setdefault('csp_note', '')

    tool['url'] = f'{site["domain"]}{tool["slug"]}/'
    tool['dir'] = path.parent
    tool.setdefault('csp', {})
    return tool


def cache_hash(paths):
    """A short digest of everything the service worker caches, used as its cache
    name. It changes exactly when one of the cached files changes, which is what
    the old hand-bumped version number was trying and regularly failing to do."""
    digest = hashlib.sha256()
    for path in sorted(paths, key=lambda p: p.name):
        digest.update(path.name.encode('utf-8'))
        digest.update(path.read_bytes())
    return digest.hexdigest()[:10]
