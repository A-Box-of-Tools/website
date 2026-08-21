"""
Locales: the same site, said in another language.

WHAT A LOCALE IS HERE

A locale is not a copy of the site. It is a set of overrides read on top of the
English sources, which stay the single description of what the site *is* - which
tools exist, which category each one joins, which guide is about which tool,
what the Content-Security-Policy allows. None of that is language. A locale
supplies only the words, plus the one structural thing that genuinely differs
between languages: the slug in the URL.

That split is the whole design, and it is what stops eleven languages from
becoming eleven sites to keep in step. Ship a new tool and every locale gains a
page for it the same day - in English until somebody translates it, but present,
linked, and in the right category, because the category was never a translated
string in the first place.

WHERE IT LIVES

    locales/<lang>/locale.toml            the language itself: its name, its
                                          slugs, and every string in
                                          config/site.toml worth translating
    locales/<lang>/tools/<slug>.toml      overrides for tools/<slug>/tool.toml
    locales/<lang>/tools/<slug>.html      that tool's translated body.html
    locales/<lang>/pages/<slug>.toml      overrides for pages/<slug>/page.toml
    locales/<lang>/pages/<slug>.html      that page's translated body.html

The slug in a locale's filename is always the ENGLISH slug. The localized slug
is a value, in [slugs], and never a filename - so renaming a German URL is one
line in one file, and the German translation of a tool does not become
impossible to find because somebody localized the folder it sits in too.

FALLING BACK, AND WHY IT IS ALLOWED HERE

buildlib/template.py refuses to render a missing name: "a page that silently
loses its description because a key was renamed is exactly the failure this
build is meant to make impossible". That rule is not weakened below - it is
moved. A locale may leave a key out, and the English text is used; what a locale
may NOT do is leave a key out and still be advertised as a translation.

An incomplete locale is built, so it can be read and reviewed at a real URL, and
is then held back from every place that would claim it exists:

  * no <link rel="alternate" hreflang> pointing at it, from any page;
  * no entry in sitemap.xml;
  * no link in the language switcher.

So a half-translated German site is a thing the author can open, and a thing
Google is never invited to index. Setting `complete = true` turns the fallback
back into an error: from then on a missing key fails the build, exactly as a
missing name does in a template. A locale therefore gets more strict as it gets
more finished, which is the direction that helps.
"""

from buildlib.site import ConfigError, load_toml


# ---------------------------------------------------------------------------
# What is a word, and what is a fact about the site
#
# Listed rather than inferred, for the same reason REQUIRED_TOOL_KEYS is listed:
# a rule you can read beats a rule you have to work out. Everything named here
# is prose a translator is expected to rewrite. Everything not named is either
# structure (a slug, a category id, an order), a fact that does not change with
# the language (a date, an origin, an analytics id), or a mark rather than a
# word (an emoji, an SVG path).
#
# Getting this list wrong is visible rather than silent: a key left off cannot
# be translated and shows in English on a "complete" locale, and a key added by
# mistake makes the build ask for a translation of something that has none.

TRANSLATABLE_TOOL_KEYS = (
    'name', 'heading', 'tagline',
    'title', 'description', 'og_title', 'og_description', 'og_image_alt',
    'pledge', 'live_hint', 'read_first', 'howto_heading', 'card',
    'words', 'facts', 'privacy', 'howto', 'faq', 'schema',
    # The drop zone, and the importer panel on the tools that have one. Its
    # `accept` and `multiple` are structural and stay put; what a locale
    # supplies is the two lines a visitor actually reads off it, and the noun
    # the importer's warning is written around.
    'picker',
)

TRANSLATABLE_PAGE_KEYS = (
    'nav', 'title', 'description', 'heading', 'lede',
    'og_title', 'og_description', 'og_image_alt',
    # The date as it is written on the page - "19 August 2026" - and not
    # `lastmod`, which is the machine-readable copy of it that goes in the
    # sitemap. A month has a name in every language and that name is a word;
    # 2026-08-19 is the same string everywhere and is not.
    'updated',
)

# Top-level tables of config/site.toml a locale may rewrite. Naming a table
# means every string under it, however deep - [hub] carries its own lede, its
# guarantees and its categories, and all of them are words.
TRANSLATABLE_SITE_PATHS = (
    'hub', 'guides', 'roadmap', 'not_found', 'footer', 'ui',
)

# Inside those tables, the keys that are still structure and must survive
# translation untouched. `slug` above all: a locale changes a URL through
# [slugs], where every URL it changes can be read in one place, and never by
# quietly redefining one in the middle of a wall of prose.
STRUCTURAL_KEYS = frozenset({
    'slug', 'id', 'order', 'lastmod', 'published', 'category', 'group',
    'mark', 'icon', 'favicon', 'brand_mark', 'kind', 'tool',
    'css_parts', 'js_parts', 'roadmap_group', 'analytics_extra',
    # The file input's own attributes. A MIME type and a boolean are the same
    # in every language, and a locale that translated "image/*" would produce a
    # picker that accepts nothing.
    'accept', 'multiple',
})

# ...except under [ui], where the list does not apply at all, because [ui] is
# nothing but words - that is what it is for.
#
# The list above is matched on the key name at any depth, which is what makes it
# short enough to read. The cost is that a name meaning something structural in
# one table means it everywhere, and [ui.tool] - the frame's words for a tool
# page - collides with `tool` in a guide's page.toml, which names the tool the
# guide is about. Left alone, that one collision quietly served the English
# pledge and the English button labels on every translated tool page, while the
# rest of the page around them came out correctly in German.
#
# Exempting the subtree is the fix rather than renaming the table, because the
# next such collision would otherwise be found the same way: by reading a
# finished page and noticing a sentence in the wrong language.
WORDS_ONLY = 'ui'


class LocaleError(ConfigError):
    pass


# ---------------------------------------------------------------------------
# Loading


REQUIRED_LOCALE_KEYS = ('lang', 'name', 'endonym')

RESERVED_LOCALE_KEYS = frozenset({
    'lang', 'name', 'endonym', 'hreflang', 'dir', 'complete', 'slugs',
})


def load_locales(root, site):
    """Every locale under locales/, English first.

    English is not a folder. It is the sources themselves, wrapped in the same
    shape a locale has so that the build can loop over one list and not care
    which member of it is the original. That is deliberate: the moment English
    becomes locales/en/ it becomes a translation of itself, free to drift from
    the tool.toml it was copied out of, and the build loses the one copy of the
    text every other language is measured against.
    """
    locales = [base_locale(site)]
    if not root.is_dir():
        return locales

    for path in sorted(root.iterdir()):
        if path.is_dir():
            locales.append(load_locale(path, site))

    seen = set()
    for locale in locales:
        if locale['lang'] in seen:
            raise LocaleError(f'two locales both call themselves {locale["lang"]!r}')
        seen.add(locale['lang'])
    return locales


def base_locale(site):
    """English, as a locale. Complete by definition - it is what the others are
    measured against, so it cannot be missing a key it defines."""
    return {
        'lang': site['lang'],
        'name': 'English',
        'endonym': 'English',
        'hreflang': site['lang'],
        'dir': 'ltr',
        'complete': True,
        'is_base': True,
        'prefix': '',
        'slugs': {},
        'site': site,
        'tools': {},
        'pages': {},
        'bodies': {},
        'missing': [],
    }


def load_locale(path, site):
    """Read one locales/<lang>/ folder."""
    config = load_toml(path / 'locale.toml')
    missing = [key for key in REQUIRED_LOCALE_KEYS if key not in config]
    if missing:
        raise LocaleError(f'{path}/locale.toml: missing {", ".join(missing)}')

    if config['lang'] != path.name:
        raise LocaleError(
            f'{path}/locale.toml: lang is {config["lang"]!r} but the folder is '
            f'{path.name!r}')
    if config['lang'] == site['lang']:
        raise LocaleError(
            f'{path}: {config["lang"]!r} is the language the sources are already '
            'written in. English is not a locale folder - see buildlib/i18n.py.')

    locale = {
        'lang': config['lang'],
        # `name` is the language in English, for a build log and an error
        # message. `endonym` is the language in its own language, which is what
        # the switcher shows: a reader looking for their own language scans for
        # the word they would use for it, not for the word English uses.
        'name': config['name'],
        'endonym': config['endonym'],
        # Usually the same as `lang`, and not always: pt-BR is a language and a
        # region, and hreflang is the one place that distinction is expressed.
        'hreflang': config.get('hreflang', config['lang']),
        'dir': config.get('dir', 'ltr'),
        'complete': bool(config.get('complete', False)),
        'is_base': False,
        'prefix': f'{config["lang"]}/',
        'slugs': dict(config.get('slugs', {})),
        'tools': {},
        'pages': {},
        'bodies': {},
        'missing': [],
    }

    stray = sorted(set(config) - RESERVED_LOCALE_KEYS - set(TRANSLATABLE_SITE_PATHS))
    if stray:
        raise LocaleError(
            f'{path}/locale.toml: {", ".join(stray)} is not a translatable part of '
            'config/site.toml. A locale supplies words and slugs; everything else '
            'about the site is decided once, in English, for every language.')

    overrides = {key: value for key, value in config.items()
                 if key in TRANSLATABLE_SITE_PATHS}
    locale['site'] = merge(site, overrides, f'{path.name}/locale.toml',
                           locale['missing'], 'site')

    for kind_name, keys in (('tools', TRANSLATABLE_TOOL_KEYS),
                            ('pages', TRANSLATABLE_PAGE_KEYS)):
        folder = path / kind_name
        if not folder.is_dir():
            continue

        for entry in sorted(folder.glob('**/*.toml')):
            slug = entry.relative_to(folder).with_suffix('').as_posix()
            table = load_toml(entry)
            unknown = sorted(set(table) - set(keys))
            if unknown:
                raise LocaleError(
                    f'{entry}: {", ".join(unknown)} is not translatable. A '
                    f'{kind_name[:-1]} locale file carries only: {", ".join(keys)}')
            locale[kind_name][slug] = table

        for entry in sorted(folder.glob('**/*.html')):
            slug = entry.relative_to(folder).with_suffix('').as_posix()
            locale['bodies'][f'{kind_name}/{slug}'] = entry.read_text(encoding='utf-8')

    return locale


# ---------------------------------------------------------------------------
# Merging


def merge(base, over, where, missing, path, words_only=False):
    """English underneath, the translation on top, recursively.

    Records what was not translated in `missing` rather than raising, because
    whether an untranslated key is fatal is a question about the locale as a
    whole - see `check_complete` - and not one this function can answer while it
    is halfway down a table.

    Two shapes are refused outright, because neither is a translation:

      * a list whose length changed. [[faq]] and [[hub.guarantees]] are merged
        entry by entry, in order, so five questions in English and four in
        German is not a shorter translation, it is a question that will render
        in English inside a German page with nothing to say which one it was.
      * a value whose type changed. A table where the English has a string is a
        translator having restructured the page, which the templates cannot
        follow.
    """
    if isinstance(base, dict):
        if not isinstance(over, dict):
            raise LocaleError(f'{where}: {path} should be a table, not a {kind(over)}')

        unknown = sorted(set(over) - set(base))
        if unknown:
            raise LocaleError(
                f'{where}: {path} has {", ".join(unknown)}, which the English does '
                'not. A locale translates what is there; it cannot add a key the '
                'templates never ask for.')

        merged = {}
        for key, value in base.items():
            # Once inside [ui] the whole subtree is words, however deep it
            # goes, so STRUCTURAL_KEYS stops applying from here down.
            inner = words_only or (path == 'site' and key == WORDS_ONLY)
            if key in STRUCTURAL_KEYS and not words_only:
                merged[key] = value
            elif key in over:
                merged[key] = merge(value, over[key], where, missing,
                                    f'{path}.{key}', inner)
            else:
                merged[key] = value
                note_missing(value, missing, f'{path}.{key}', inner)
        return merged

    if isinstance(base, list):
        if not isinstance(over, list):
            raise LocaleError(f'{where}: {path} should be a list, not a {kind(over)}')
        if len(base) != len(over):
            raise LocaleError(
                f'{where}: {path} has {len(over)} entries and the English has '
                f'{len(base)}. They are merged in order, so the counts have to '
                'match - a missing entry would render in English with nothing to '
                'say which one it was.')
        return [merge(a, b, where, missing, f'{path}[{index}]', words_only)
                for index, (a, b) in enumerate(zip(base, over))]

    if isinstance(over, (dict, list)):
        raise LocaleError(
            f'{where}: {path} should be a {kind(base)}, not a {kind(over)}')
    return over


def note_missing(value, missing, path, words_only=False):
    """Record an untranslated string, and walk into a table or a list to record
    the strings inside it.

    Only strings are counted. Numbers, booleans and dates are the same in every
    language, and counting them would leave a locale permanently short of
    complete over keys no translator will ever touch.
    """
    if isinstance(value, str):
        if value.strip():
            missing.append(path)
    elif isinstance(value, dict):
        for key, inner in value.items():
            if words_only or key not in STRUCTURAL_KEYS:
                note_missing(inner, missing, f'{path}.{key}', words_only)
    elif isinstance(value, list):
        for index, inner in enumerate(value):
            note_missing(inner, missing, f'{path}[{index}]', words_only)


def kind(value):
    return {dict: 'table', list: 'list', str: 'string',
            bool: 'boolean', int: 'number', float: 'number'}.get(type(value), 'value')


# ---------------------------------------------------------------------------
# Applying a locale to one tool or one page


def translate(source, over, keys, where, missing, path):
    """Merge a translation over just the keys that are words.

    Merging over the whole table instead was the first version, and it counted
    things nobody will ever translate as untranslated: the `url` the build had
    already worked out, the `dir` it was read from, and - because a
    Content-Security-Policy is a table of lists of strings and looks exactly
    like prose from the inside - every origin in the policy. A locale reported
    hundreds of missing strings it could not have supplied, which made the one
    report that says what is left to do useless for saying it.

    Naming the keys fixes that at the source. The lists are the same ones a
    locale file is checked against when it is read, so what may be translated
    and what is counted as untranslated cannot drift apart.
    """
    return merge({key: source[key] for key in keys if key in source},
                 over, where, missing, path)


def localize_tool(tool, locale, site):
    """One tool, said in one language, at its own URL.

    The returned tool is a copy. `dir` still points at the English source folder
    - the JavaScript, the stylesheet and the share card are the same files in
    every language, and building eleven copies of a tool out of eleven folders
    is the drift this whole arrangement exists to avoid.
    """
    slug = tool['slug']
    merged = dict(tool)
    merged.update(translate(tool, locale['tools'].get(slug, {}),
                            TRANSLATABLE_TOOL_KEYS,
                            f'locales/{locale["lang"]}/tools/{slug}.toml',
                            locale['missing'], f'tools.{slug}'))
    merged['out_slug'] = locale['slugs'].get(slug, slug)
    merged['url'] = f'{site["domain"]}{locale["prefix"]}{merged["out_slug"]}/'
    return merged


def localize_page(page, locale, site):
    """One prose page, said in one language.

    `depth` is recomputed rather than carried over: a guide sits two levels down
    in English and three under a locale prefix, and the frame around it works
    out where the stylesheet and the hub are from that number alone.
    """
    slug = page['slug']
    merged = dict(page)
    merged.update(translate(page, locale['pages'].get(slug, {}),
                            TRANSLATABLE_PAGE_KEYS,
                            f'locales/{locale["lang"]}/pages/{slug}.toml',
                            locale['missing'], f'pages.{slug}'))
    merged['out_slug'] = locale['slugs'].get(slug, slug)
    merged['url'] = f'{site["domain"]}{locale["prefix"]}{merged["out_slug"]}/'
    merged['depth'] = (merged['out_slug'].count('/') + 1
                       + (0 if locale['is_base'] else 1))
    return merged


def body_for(locale, kind_name, slug, fallback):
    """The translated body.html for a tool or a page, or the English one.

    Prose bodies are whole files rather than keys in a table, so they fall back
    as whole files too: a guide is either translated or it is not, and there is
    no useful halfway state where three of its paragraphs are in German.
    """
    key = f'{kind_name}/{slug}'
    if key in locale['bodies']:
        return locale['bodies'][key]
    if not locale['is_base']:
        locale['missing'].append(f'{kind_name}.{slug}.body')
    return fallback


# ---------------------------------------------------------------------------
# The frame's own words


def render_ui(templates, ui, context, where, include=()):
    """Render the [ui] strings from config/site.toml as small templates.

    They are not plain strings, and that is the point. "Your files are never
    uploaded" is subject-verb-object; the German for it is not, and a string cut
    into a before-half and an after-half around the noun could only ever be one
    word order or the other. Written whole, with {{ tool.words.plural }} sitting
    wherever the language puts it, it can be either.

    Using the site's own template syntax rather than inventing a placeholder
    syntax for translations buys the checking for free: buildlib/template.py
    refuses to render a name it cannot resolve, so a translator who mistypes
    {{ tool.words.plural }} gets a failed build naming the string, rather than a
    published sentence with a hole in the middle of it.

    `include` names the nested tables to render as well - [ui.tool] and
    [ui.picker] - and every one not named is left out rather than rendered.
    They reach for names only some pages have: [ui.tool] needs {{ tool }}, which
    a hub page has not got, and [ui.picker] needs {{ tool.picker.urls }}, which
    only the tools that offer to fetch an address define. Rendering one where
    its names are missing is a build failure; carrying it unrendered would put
    template syntax on screen. Asking for it by name where it belongs is
    neither.
    """
    include = set(include)
    out = {}
    for key, value in ui.items():
        if isinstance(value, dict):
            if key in include:
                out[key] = render_ui(templates, value, context, f'{where}.{key}')
            continue
        out[key] = templates.render_source(value, f'{where}.{key}', context)
    return out


# ---------------------------------------------------------------------------
# Slugs


def check_slugs(locale, tool_slugs, page_slugs, site):
    """Every slug a locale renames has to name something, and no two things may
    end up at one address.

    Neither failure is visible in the output, which is why both are checked
    here: a typo in [slugs] silently leaves that one page at its English URL
    inside a German site, and two entries colliding silently means one page is
    written over the other while the sitemap goes on advertising an address that
    now serves somebody else's content.
    """
    known = set(tool_slugs) | set(page_slugs) | {
        site['guides']['slug'], site['roadmap']['slug']}
    where = f'locales/{locale["lang"]}/locale.toml'

    for english in sorted(locale['slugs']):
        if english not in known:
            raise LocaleError(
                f'{where}: [slugs] renames {english!r}, which is not a tool, a page, '
                'the guides index or the roadmap. Slugs are keyed by the ENGLISH '
                f'slug. Known: {", ".join(sorted(known))}')

    taken = {}
    for english in sorted(known):
        localized = locale['slugs'].get(english, english)
        if localized in taken:
            raise LocaleError(
                f'{where}: {english!r} and {taken[localized]!r} both become '
                f'{localized!r} in {locale["lang"]}, so one page would be written '
                'over the other.')
        taken[localized] = english


# ---------------------------------------------------------------------------
# Completeness, and what it gates


def check_complete(locale):
    """A locale that claims to be finished has to be finished.

    Called after every page has been localized, so `missing` holds everything
    that fell back across the whole site rather than whatever happened to have
    been reached by the time some earlier check ran.
    """
    if locale['is_base'] or not locale['complete']:
        return
    if not locale['missing']:
        return

    shown = sorted(set(locale['missing']))
    more = len(shown) - 12
    tail = f'\n    ... and {more} more' if more > 0 else ''
    raise LocaleError(
        f'locales/{locale["lang"]}/ says complete = true, but {len(shown)} strings '
        'still fall back to English:\n    '
        + '\n    '.join(shown[:12]) + tail
        + '\n  Translate them, or set complete = false: the locale is then still '
          'built and still readable at its own URL, and is kept out of the '
          'sitemap, the hreflang tags and the language switcher until it is ready.')


def published(locales):
    """The locales fit to be advertised: English, and every locale that says it
    is finished.

    The sitemap, the hreflang tags and the switcher are all built from this one
    list, so the three cannot disagree about which languages the site claims to
    be available in - which is the failure Google reports as "hreflang tags
    point to a page that is not indexed".
    """
    return [locale for locale in locales if locale['is_base'] or locale['complete']]


def alternates(locales, slug, site):
    """The <link rel="alternate" hreflang> set for one page, in every language
    it is published in.

    Google's rule is that the set is reciprocal and self-inclusive: every page
    lists every version of itself, its own included, and each of those pages
    lists the same set back. Built from one list here, so reciprocity is a
    property of the code rather than something to be audited afterwards.

    x-default points at English, which is what a reader whose language is not
    one of these is meant to be given.
    """
    ready = published(locales)
    # One language is not a set of alternates, it is a page. A lone
    # hreflang="en" beside an x-default pointing at the same URL says nothing
    # that the canonical above it has not already said, so until there is a
    # second language to point at, nothing is written at all.
    if len(ready) < 2:
        return []

    entries = [{'hreflang': locale['hreflang'], 'href': locale_url(locale, slug, site)}
               for locale in ready]
    entries.append({'hreflang': 'x-default', 'href': entries[0]['href']})
    return entries


def switcher(locales, current, slug, site):
    """What the language switcher on one page offers.

    Every published language, linked to this same page in that language rather
    than to its front door. A reader who wants this page in German wants this
    page; dropping them on the hub to find it again is the commonest way a
    switcher gets built wrong.

    Plain links, with no JavaScript, no cookie and no redirect anywhere near
    them. A crawler has to be able to walk from one language into the next, and
    a site whose whole claim is that it does not track you cannot be storing a
    preference in order to do it.
    """
    ready = published(locales)
    # Nothing to switch to. A control offering only the language you are already
    # reading is furniture, so it is not rendered until a second language is
    # finished enough to be offered.
    if len(ready) < 2:
        return []

    return [
        {
            'lang': locale['lang'],
            'hreflang': locale['hreflang'],
            'endonym': locale['endonym'],
            'dir': locale['dir'],
            # Root-absolute, unlike every other link on the page. The switcher
            # is the one set of links that leaves the language it is written
            # in, so it cannot be resolved against a folder whose name is
            # itself localized.
            'href': locale_path(locale, slug),
            'current': locale['lang'] == current['lang'],
        }
        for locale in ready
    ]


def locale_path(locale, slug):
    """Where one page lives in one language, as a root-absolute path."""
    localized = locale['slugs'].get(slug, slug)
    return f'/{locale["prefix"]}' + (f'{localized}/' if localized else '')


def locale_url(locale, slug, site):
    """The same, as the absolute URL a canonical or an hreflang needs."""
    return site['domain'].rstrip('/') + locale_path(locale, slug)
