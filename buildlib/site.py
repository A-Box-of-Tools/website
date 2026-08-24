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


REQUIRED_PAGE_KEYS = (
    'slug', 'nav', 'title', 'description', 'heading', 'lede', 'updated',
    'lastmod', 'og_title', 'og_description', 'og_image_alt',
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
            'inLanguage': site['lang'],
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
                 'name': site['name'], 'item': site['home']},
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


def roadmap_jsonld(site):
    """CollectionPage for the roadmap, and nothing else.

    No ItemList: the hub already publishes one naming the tools that exist, and
    a list here mixing those with names nobody can click would be describing
    products that are not products yet.

    No BreadcrumbList either. There was one, until the visible trail above the
    heading went - it repeated a journey the header's own brand link already
    offers. Markup is meant to describe what a visitor can see, so the two left
    together."""
    roadmap = site['roadmap']
    graph = [
        {
            '@type': 'CollectionPage',
            'url': site['roadmap_url'],
            'name': to_text(roadmap['heading']),
            'description': to_text(roadmap['description']),
            'inLanguage': site['lang'],
            'isPartOf': {'@id': site['home'] + '#website'},
        },
    ]
    return dumps_ld(graph)


def page_jsonld(site, page):
    """Structured data for a prose page, or nothing for a legal one.

    A guide is an Article and says so; a privacy policy is not, and inventing
    schema for it would be describing the page as something it is not. The
    template asks for this unconditionally and writes nothing when it is empty,
    which keeps the "is this page an Article?" decision here rather than in
    markup."""
    if page['kind'] != 'guide':
        return ''

    graph = [
        {
            '@type': 'Article',
            'headline': to_text(page['heading']),
            'description': to_text(page['description']),
            'url': page['url'],
            'datePublished': page['published'],
            'dateModified': page['lastmod'],
            'inLanguage': site['lang'],
            'mainEntityOfPage': {'@type': 'WebPage', '@id': page['url']},
            'author': {
                '@type': 'Organization',
                'name': site['name'],
                'url': site['domain'],
            },
            'publisher': {
                '@type': 'Organization',
                'name': site['name'],
                'url': site['domain'],
            },
        },
        {
            '@type': 'BreadcrumbList',
            # Three steps rather than two, because there are now three: the hub,
            # the guides index, and this guide. The visible trail at the top of
            # the page is built from the same list, which is the rule Google
            # asks for - markup describes what a visitor can see.
            'itemListElement': [
                {'@type': 'ListItem', 'position': 1,
                 'name': site['name'], 'item': site['home']},
                {'@type': 'ListItem', 'position': 2,
                 'name': to_text(site['guides']['heading']),
                 'item': site['guides_url']},
                {'@type': 'ListItem', 'position': 3,
                 'name': to_text(page['nav']), 'item': page['url']},
            ],
        },
    ]
    return dumps_ld(graph)


def guides_jsonld(site, guides):
    """CollectionPage + ItemList for the guides index.

    An ItemList here and not on the roadmap, and the difference is whether the
    names can be clicked: every entry below is a page that exists, so listing
    them is describing the page rather than advertising something that is not
    built yet.
    """
    index_url = site['guides_url']
    graph = [
        {
            '@type': 'CollectionPage',
            'url': index_url,
            'name': to_text(site['guides']['heading']),
            'description': to_text(site['guides']['description']),
            'inLanguage': site['lang'],
            'isPartOf': {'@id': site['home'] + '#website'},
            'mainEntity': {
                '@type': 'ItemList',
                'itemListElement': [
                    {
                        '@type': 'ListItem',
                        'position': position,
                        'url': guide['url'],
                        'name': to_text(guide['heading']),
                    }
                    for position, guide in enumerate(guides, start=1)
                ],
            },
        },
        {
            '@type': 'BreadcrumbList',
            'itemListElement': [
                {'@type': 'ListItem', 'position': 1,
                 'name': site['name'], 'item': site['home']},
                {'@type': 'ListItem', 'position': 2,
                 'name': to_text(site['guides']['heading']), 'item': index_url},
            ],
        },
    ]
    return dumps_ld(graph)


def hub_jsonld(site, tools):
    graph = [
        {
            '@type': 'WebSite',
            '@id': site['home'] + '#website',
            'url': site['home'],
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
            '@id': site['home'] + '#collection',
            'url': site['home'],
            'name': site['name'],
            'isPartOf': {'@id': site['home'] + '#website'},
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


PAGE_KINDS = ('legal', 'guide')


def load_page(path, site, root):
    """Read one pages/<slug>/page.toml.

    A page is a prose page that is neither a tool nor the hub. There are two
    kinds and they differ only in where they are meant to be read:

      legal - privacy and terms. They matter for trust, not for search, which
              is why the sitemap gives them the lowest priority it has.
      guide - written to be found. Same frame, same policy, but it carries
              Article structured data and sits above the legal pages in the
              sitemap and the footer.

    Either way it needs far less than a tool does: no words, no FAQ, no service
    worker, and no CSP of its own, because it does nothing the site policy does
    not already allow.

    The slug is a path, not a name, so a page can live at a depth: `guides/x`
    is a folder pages/guides/x/ and a URL /guides/x/. It has to match the folder
    it was found in, the same rule as before, only measured from pages/ rather
    than from the immediate parent."""
    page = load_toml(path)
    missing = [key for key in REQUIRED_PAGE_KEYS if key not in page]
    if missing:
        raise ConfigError(f'{path}: missing {", ".join(missing)}')

    where = path.parent.relative_to(root).as_posix()
    if page['slug'] != where:
        raise ConfigError(
            f'{path}: slug is {page["slug"]!r} but the folder is {where!r}')

    page.setdefault('kind', 'legal')
    if page['kind'] not in PAGE_KINDS:
        raise ConfigError(
            f'{path}: kind is {page["kind"]!r}, expected one of {", ".join(PAGE_KINDS)}')

    # A guide is an Article, and an Article has a date it was published as well
    # as a date it last changed. Required rather than defaulted to `lastmod`,
    # because the two drift apart the first time a guide is corrected and a
    # silent default would quietly claim the correction was the original.
    if page['kind'] == 'guide' and 'published' not in page:
        raise ConfigError(f'{path}: a guide needs `published`')

    # Which group on the guides index it joins. Required for the same reason a
    # tool's `roadmap_group` is: a guide that named no group would be built,
    # sit at a URL, and be linked to from nowhere at all. The group has to
    # exist, and has to list this guide back; build.py checks both, because it
    # is the only place that can see every guide at once.
    if page['kind'] == 'guide' and 'group' not in page:
        raise ConfigError(
            f'{path}: a guide needs `group`, naming one of the [[guides.groups]] '
            'in config/site.toml, or nothing would link to it')

    # Optional, and in practice only a guide sets it: the slug of the tool this
    # guide is about. It puts a link to the tool on the guide and to the guide on
    # the tool, from one line rather than two edits that can disagree. A guide
    # about no tool in particular - "is it safe to upload files" - leaves it
    # out. build.py checks the slug names a tool that exists.
    page.setdefault('tool', '')

    page['url'] = f'{site["domain"]}{page["slug"]}/'
    page['dir'] = path.parent
    # How far this page sits below the root, so the frame around it can point at
    # the stylesheet and the hub without knowing where it was put.
    page['depth'] = page['slug'].count('/') + 1
    return page


def text_hash(text):
    """A short digest of one generated file's contents, used to version the URL
    a page asks for it by.

    GitHub Pages serves HTML with max-age=600 and everything else with
    max-age=14400. A deploy that changes a stylesheet therefore reaches a
    returning visitor as new markup wearing the stylesheet from four hours ago,
    which is how the footer arrived on a page unstyled. Naming the file with a
    hash of what is in it makes that impossible: change the CSS and the URL
    changes, so there is nothing stale to hand back."""
    return hashlib.sha256(text.encode('utf-8')).hexdigest()[:10]


# ---------------------------------------------------------------------------
# Shared parts
#
# A tool names the parts it wants in `js_parts` and `css_parts`. Some parts are
# not a free choice, though: switching the URL importer on means its module, its
# stylesheet and a widened img-src, and a tool that had to remember all three
# would eventually remember two. So the flag implies the rest.

URL_IMPORT_PART = 'url-import'

# The one shared module no tool asks for, because every tool page needs it:
# shared/js/phrases.js reads the words off the page, and every tool page has
# words on it that JavaScript puts there. Listing it in twenty-nine tool.toml
# files would make it look like a choice, and the first tool to leave it out
# would build clean and then fail in the browser on a module that is not there.
FRAME_PART = 'phrases'


def wants_urls(tool):
    return bool(tool.get('picker', {}).get('urls'))


def js_parts(tool):
    parts = list(tool.get('js_parts', []))
    if FRAME_PART not in parts:
        parts.insert(0, FRAME_PART)
    if wants_urls(tool) and URL_IMPORT_PART not in parts:
        parts.append(URL_IMPORT_PART)
    return parts


def css_parts(tool):
    parts = list(tool.get('css_parts', []))
    if wants_urls(tool) and URL_IMPORT_PART not in parts:
        parts.append(URL_IMPORT_PART)
    return parts


def picker_csp(tool):
    """What the importer needs, and only for the page that uses it.

    img-src rather than connect-src, and that distinction is the whole design:
    pictures can come in, and nothing can go out. See shared/js/url-import.js.
    """
    if not wants_urls(tool):
        return {}
    return {'img-src': ['http:']}


def cache_hash(paths):
    """A short digest of everything the service worker caches, used as its cache
    name. It changes exactly when one of the cached files changes, which is what
    the old hand-bumped version number was trying and regularly failing to do."""
    digest = hashlib.sha256()
    for path in sorted(paths, key=lambda p: p.name):
        digest.update(path.name.encode('utf-8'))
        digest.update(path.read_bytes())
    return digest.hexdigest()[:10]
