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

Anything not translated is built, so it can be read and reviewed at a real URL,
and is then held back from every place that would claim it exists:

  * no <link rel="alternate" hreflang> pointing at it, from any page;
  * no entry in sitemap.xml;
  * no link in the language switcher.

So a half-translated German page is a thing the author can open, and a thing
Google is never invited to index.

WHAT "FINISHED" IS MEASURED IN, AND WHY IT IS NOT THE LANGUAGE

It is measured a PAGE at a time. That is the second version of this rule, and
the first one was wrong in a way worth recording, because the failure was not
in the code.

`complete = true` used to mean "every string in this language is translated",
enforced by failing the build on any fallback at all. It reads like the strict
option, and it is - but English is not finished either. This site ships a tool
most weeks, and each one arrives untranslated in every language at once, so the
rule failed the build for ten languages every time English grew. German hit it
three times while it was being written; the third time it was also holding up
nine other languages that had nothing to do with it. A rule that turns a normal
Tuesday into a broken build is not strictness, it is a rule measuring the wrong
thing.

So the unit is the page:

  * a PAGE that still falls back is built, and kept out of the sitemap, the
    hreflang sets and the switcher until it is translated - the treatment an
    unfinished language used to get, given to the part that is unfinished;
  * the FRAME - the nav, the footer, the hub, the [ui] words - is still judged
    whole, because it is drawn around every page and there is no per-page way to
    hold it back. That is what `complete = true` now claims, and it is a set
    that does not grow when a tool ships;
  * a list SHORTER than the English one falls back entry by entry instead of
    raising, which is the same rule again: a locale is allowed to be behind
    English, and is never allowed to be ahead of it.

A list of things that have ids is matched BY id, and that is not a detail. The
first version of the rule above matched by position, which quietly assumes a
short locale list is the English one with the tail missing. The day English
inserted [[hub.categories]] for GIF between images and audio, that assumption
was wrong in seven languages at once, and every category after the insertion
took the name of the one before it: the Spanish hub put "Audio" over the GIF
maker, "Documentos y PDF" over the audio editor, and "Códigos y datos" over the
PDF tools. Nothing raised, because by position every entry still had a partner
to merge with. An id says which English entry a translation is FOR, so a locale
may be missing one, may carry them in another order, and may have been written
against an English list that has since been inserted into - and all three come
out right. A locale entry with no id, or with an id the English has not got, is
refused rather than guessed at.

Two things follow that are easy to get wrong, and both have their own tests.
Every language's debt is worked out by `survey` BEFORE any page is rendered,
because the hreflang set on the English page is a fact about German. And an
English body falling back inside German has its links rewritten by `relocate`,
because it was written for a tree whose addresses are English.

FALLING BACK TO A NEAR RELATIVE INSTEAD OF ENGLISH

English is not the only sensible thing to fall back to. Traditional Chinese
next to Simplified is the case this was built for: two scripts, one language,
and a reader of one can make out the other far better than either can make
out English. A locale names its near relative with `fallback` in
locale.toml, `link_fallbacks` resolves the name once every locale is loaded,
and `fallback_base` is where an untranslated key actually borrows the near
relative's word instead of English's - the near relative's word if it has
one, English's if it does not, so the chain never dead-ends.

This changes what a reader SEES on an unfinished page. It changes nothing
about what counts as FINISHED: `complete`, `debt`, `translated` and
`published` are all still judged against this locale's own translation
work, exactly as for a locale with no `fallback` - so a Traditional Chinese
page showing Simplified Chinese prose is exactly as unfinished, and exactly
as absent from the sitemap and the hreflang set, as one showing English
would be. `fallback` is a courtesy to the reader of a half-built locale, not
a second way to be complete.

Only one level. `fallback` is refused if it names a locale that itself has a
`fallback` - resolving a chain in dependency order is a real feature this
does not need until a second locale wants to point at the first one that
already borrows.
"""

import posixpath
import re

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
    'css_parts', 'js_parts', 'roadmap_group',
    # `analytics_extra` is prose, and is still structure, which looks like a
    # contradiction until you see where it lands: the tail of one sentence in
    # the comment at the top of templates/analytics.js. That comment is written
    # in English and is not translatable - only the `{{ words.plural }}` beside
    # it is - and the JS minifier strips the whole block before it ships, so
    # nothing a visitor can load contains either half. Translating it therefore
    # buys a sentence nobody reads, and costs a page: a locale missing it would
    # go into debt on that tool and drop out of the sitemap and the hreflang
    # set. Ten locales once carried translations of this key that the merge
    # discarded on every build; they were removed rather than made to work.
    'analytics_extra',
    # The file input's own attributes. A MIME type and a boolean are the same
    # in every language, and a locale that translated "image/*" would produce a
    # picker that accepts nothing.
    'accept', 'multiple',
})

# The list above is matched on the key name, which is what keeps it short enough
# to read. The cost is that a name meaning something structural in one file
# means it everywhere, and this has now bitten twice:
#
#   * [ui.tool], the frame's words for a tool page, collided with `tool` in a
#     guide's page.toml, which names the tool the guide is about. Every
#     translated tool page quietly served the English pledge and the English
#     button labels while the rest of the page came out correctly.
#   * [[group]] in config/planned.toml collided with `group` in a guide's
#     page.toml, which names the guides group it joins. The whole planned list
#     was treated as structure, so no locale could translate it and none was
#     ever told it had not.
#
# Neither raised. Both were found by reading a finished page. So the set is a
# parameter of the merge rather than a global: each file says what counts as
# structure inside it, and a name that is structural in one is free to be a
# word in another.
#
# Nothing under [ui] is structure - that is what [ui] is for. In planned.toml
# only the group `id` is, because that is what a tool's roadmap_group matches
# on.
NO_STRUCTURE = frozenset()
PLANNED_STRUCTURE = frozenset({'id'})


class LocaleError(ConfigError):
    pass


# ---------------------------------------------------------------------------
# Loading


REQUIRED_LOCALE_KEYS = ('lang', 'name', 'endonym')

RESERVED_LOCALE_KEYS = frozenset({
    'lang', 'name', 'endonym', 'hreflang', 'dir', 'complete', 'slugs',
    'fallback',
})

# config/planned.toml, translated in locales/<lang>/planned.toml. It is a file
# of its own rather than a table inside locale.toml because it is a file of its
# own in English, and a locale that had to flatten it into a different shape
# would be one more thing to keep in step.
#
# Only `note` and each group's `name` and `items` are words. The group `id` is
# structural and is what a tool's roadmap_group matches on.
PLANNED = 'planned.toml'


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
    link_fallbacks(locales)
    return locales


def link_fallbacks(locales):
    """Resolve each locale's `fallback` name to the locale object it names.

    A page a locale has not translated normally shows English - see
    `localize_tool` and `body_for`. `fallback` is the one exception: a
    locale written in a script another locale already has a finished
    translation in (Traditional Chinese next to Simplified, one day perhaps
    Cantonese next to Mandarin) can name that locale instead, so an
    untranslated page shows the near relative's words rather than English's.

    Resolved here, once, rather than looked up by name every time a page is
    rendered - a locale's own tools/pages tables are read straight off
    `fallback_locale`, and doing that lookup by string on every tool and
    every guide would be the same search repeated hundreds of times for an
    answer that cannot change mid-build.

    One level only. A chain would have to be resolved in dependency order,
    and a locale falling back through two near relatives to reach English is
    a design nobody has asked for yet - refusing it here is cheaper than
    writing the topological sort for a feature with no user.
    """
    by_lang = {locale['lang']: locale for locale in locales}
    for locale in locales:
        name = locale.get('fallback')
        locale['fallback_locale'] = None
        if name is None:
            continue
        if name == locale['lang']:
            raise LocaleError(
                f'locales/{locale["lang"]}/locale.toml: fallback = {name!r} names '
                'itself.')
        if name not in by_lang:
            raise LocaleError(
                f'locales/{locale["lang"]}/locale.toml: fallback = {name!r} names '
                f'no locale. Known: {", ".join(sorted(by_lang))}')
        target = by_lang[name]
        if target.get('fallback'):
            raise LocaleError(
                f'locales/{locale["lang"]}/locale.toml: fallback = {name!r}, but '
                f'{name} itself falls back to {target["fallback"]!r}. Only one '
                'level is supported - point both locales at the same target '
                'instead of chaining them.')
        locale['fallback_locale'] = target


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
        'fallback': None,
        'fallback_locale': None,
        'slugs': {},
        'site': site,
        'tools': {},
        'pages': {},
        'bodies': {},
        'planned': {},
        'frame': [],
        'debt': {},
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
        # A name, not the locale itself - locales/*/locale.toml files are
        # loaded one at a time, so the locale `fallback` names has not
        # necessarily been read yet. `link_fallbacks` resolves the name to
        # `fallback_locale` once every locale is loaded.
        'fallback': config.get('fallback'),
        'fallback_locale': None,
        'slugs': dict(config.get('slugs', {})),
        'tools': {},
        'pages': {},
        'bodies': {},
        # What the frame still owes, settled once when this file is read. The
        # nav, the footer, the hub and the [ui] words are drawn around every
        # page, so there is no per-page way to hold them back.
        'frame': [],
        # What fell back, bucketed by the slug of the page it fell back on, so
        # one untranslated guide costs that guide its place in the sitemap
        # rather than costing the whole language its place. `missing` stays as
        # the flat list, because the end-of-build report counts strings.
        'debt': {},
    }

    stray = sorted(set(config) - RESERVED_LOCALE_KEYS - set(TRANSLATABLE_SITE_PATHS))
    if stray:
        raise LocaleError(
            f'{path}/locale.toml: {", ".join(stray)} is not a translatable part of '
            'config/site.toml. A locale supplies words and slugs; everything else '
            'about the site is decided once, in English, for every language.')

    # Only the translatable tables go through the merge; everything else in
    # config/site.toml is copied through untouched and uncounted.
    #
    # Merging the whole file was the first version, and it counted the
    # Content-Security-Policy as forty-three untranslated strings, along with
    # the domain, the AdSense id and the pinned esbuild version. A locale
    # cannot translate any of them - they are not in TRANSLATABLE_SITE_PATHS,
    # so it is refused if it tries - which made those fifty-one entries a debt
    # no translator could ever pay off, sitting in the one report that is meant
    # to say what is left to do.
    overrides = {key: value for key, value in config.items()
                 if key in TRANSLATABLE_SITE_PATHS}
    locale['site'] = dict(site)
    locale['site'].update(translate(site, overrides, TRANSLATABLE_SITE_PATHS,
                                    f'{path.name}/locale.toml',
                                    locale['frame'], 'site'))

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

    planned = path / PLANNED
    locale['planned'] = load_toml(planned) if planned.is_file() else {}

    return locale


# ---------------------------------------------------------------------------
# Merging


def merge(base, over, where, missing, path, structural=STRUCTURAL_KEYS,
          transform=None):
    """English underneath, the translation on top, recursively.

    Records what was not translated in `missing` rather than raising, because
    whether an untranslated key is fatal is a question about the locale as a
    whole - see `check_complete` - and not one this function can answer while it
    is halfway down a table.

    Two shapes are refused outright, because neither is a translation:

      * a list LONGER than the English. [[faq]] and [[hub.guarantees]] are
        merged entry by entry, in order, so six questions in German against
        five in English is not a fuller translation, it is an entry with
        nothing to translate. A SHORTER list is fine, and is the ordinary state
        of a locale that was finished before English grew another entry: the
        tail falls back and is counted with everything else.
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
            # [ui] is words all the way down, however deep it goes.
            inner = NO_STRUCTURE if (path == 'site' and key == 'ui') else structural
            if key in structural:
                merged[key] = value
            elif key in over:
                merged[key] = merge(value, over[key], where, missing,
                                    f'{path}.{key}', inner, transform)
            else:
                merged[key] = fell_back(value, transform, inner)
                note_missing(value, missing, f'{path}.{key}', inner)
        return merged

    if isinstance(base, list):
        if not isinstance(over, list):
            raise LocaleError(f'{where}: {path} should be a list, not a {kind(over)}')
        if len(over) > len(base):
            raise LocaleError(
                f'{where}: {path} has {len(over)} entries and the English has only '
                f'{len(base)}. They are merged in order, so a locale can be behind '
                'the English but it cannot be ahead of it - there is nothing for '
                'the extra entries to translate.')
        # A list of things that have ids is matched BY id, not by position.
        #
        # Position was the first version and it is not safe. It assumes a short
        # locale list is the English one with the tail missing, and the day
        # English inserted [[hub.categories]] for GIF in the middle, seven
        # languages silently relabelled every category after it: the Spanish hub
        # put "Audio" over the GIF maker, "Documentos y PDF" over the audio
        # editor, and "Códigos y datos" over the PDF tools. Nothing raised,
        # because by-position every entry had something to merge with.
        #
        # An id says which entry a translation is FOR, so a locale can be missing
        # one, can carry them in another order, and can be written against an
        # English list that has since had something inserted into the middle of
        # it, and all three come out right.
        if base and all(isinstance(entry, dict) and 'id' in entry for entry in base):
            return merge_by_id(base, over, where, missing, path, structural,
                               transform)

        # Everything else is still positional, which is what a list of plain
        # strings or of tables with nothing to name them by has to be. Short is
        # allowed - it is the ordinary state of a locale finished before English
        # grew another entry - and the tail falls back and is counted.
        merged = [merge(a, b, where, missing, f'{path}[{index}]', structural,
                        transform)
                  for index, (a, b) in enumerate(zip(base, over))]
        for index in range(len(over), len(base)):
            merged.append(fell_back(base[index], transform, structural))
            note_missing(base[index], missing, f'{path}[{index}]', structural)
        return merged

    if isinstance(over, (dict, list)):
        raise LocaleError(
            f'{where}: {path} should be a {kind(base)}, not a {kind(over)}')
    return over


def merge_by_id(base, over, where, missing, path, structural, transform):
    """Merge two lists of tables by matching their ids, not their positions.

    Every entry of the English list is emitted, in the English order, because
    the order of the categories on the hub is a fact about the site rather than
    about any language. Each one takes its words from the locale entry with the
    same id, or falls back and is counted if the locale has not got one.

    A locale entry with no id cannot be matched to anything, and an entry whose
    id the English does not have is translating something that no longer exists;
    both are refused, and loudly, because the alternative is the silent
    mislabelling this function was written to end.
    """
    by_id = {}
    for index, entry in enumerate(over):
        if not isinstance(entry, dict):
            raise LocaleError(
                f'{where}: {path}[{index}] should be a table, not a {kind(entry)}')
        if 'id' not in entry:
            known = ', '.join(str(entry['id']) for entry in base)
            raise LocaleError(
                f'{where}: {path}[{index}] has no id, so there is no saying which '
                f'entry it translates. Give it the id of the one it is for: '
                f'{known}.')
        if entry['id'] in by_id:
            raise LocaleError(
                f'{where}: {path} has two entries with id {entry["id"]!r}.')
        by_id[entry['id']] = entry

    known = {entry['id'] for entry in base}
    stray = sorted(str(found) for found in by_id if found not in known)
    if stray:
        raise LocaleError(
            f'{where}: {path} translates {", ".join(stray)}, which the English '
            'does not have. A locale may be behind the English and may not be '
            'ahead of it.')

    merged = []
    for entry in base:
        found = by_id.get(entry['id'])
        step = f'{path}[{entry["id"]}]'
        if found is None:
            merged.append(fell_back(entry, transform, structural))
            note_missing(entry, missing, step, structural)
        else:
            merged.append(merge(entry, found, where, missing, step, structural,
                                transform))
    return merged


def fell_back(value, transform, structural=STRUCTURAL_KEYS):
    """A copy of some English, with `transform` applied to every string in it.

    Walks the same shapes note_missing walks, and skips the same structural
    keys - a slug or a category id is not prose and must come through a
    fallback untouched.
    """
    if transform is None:
        return value
    if isinstance(value, str):
        return transform(value)
    if isinstance(value, dict):
        return {key: (inner if key in structural
                      else fell_back(inner, transform, structural))
                for key, inner in value.items()}
    if isinstance(value, list):
        return [fell_back(inner, transform, structural) for inner in value]
    return value


def note_missing(value, missing, path, structural=STRUCTURAL_KEYS):
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
            if key not in structural:
                note_missing(inner, missing, f'{path}.{key}', structural)
    elif isinstance(value, list):
        for index, inner in enumerate(value):
            note_missing(inner, missing, f'{path}[{index}]', structural)


def kind(value):
    return {dict: 'table', list: 'list', str: 'string',
            bool: 'boolean', int: 'number', float: 'number'}.get(type(value), 'value')


# ---------------------------------------------------------------------------
# Applying a locale to one tool or one page


def charge(locale, slug):
    """Start this page's tally again, and hand back the list to fill.

    Assigned rather than appended to, because the tally is worked out twice:
    once by `survey` before any page is rendered, and again as each page is
    rendered. Appending would count everything in a published language twice.
    """
    debt = locale['debt'][slug] = []
    return debt


def all_debt(locale):
    """Every string this language still owes, frame and pages together."""
    return locale['frame'] + [entry for debt in locale['debt'].values()
                              for entry in debt]


def survey(locales, tools, prose, planned, site):
    """Work out what every language owes, before a single page is written.

    Rendering a page needs to know which OTHER languages have finished it, so
    no page can be the thing that works it out. Cheap: it is the same merge the
    render does, over tables already in memory, and it runs once per language.
    """
    for locale in locales:
        if locale['is_base']:
            continue
        for tool in tools:
            localize_tool(tool, locale, site)
            body_for(locale, 'tools', tool['slug'], '')
        for page in prose:
            localize_page(page, locale, site)
            body_for(locale, 'pages', page['slug'], '')
        localize_planned(planned, locale, site['roadmap']['slug'])


def translate(source, over, keys, where, missing, path, transform=None):
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
                 over, where, missing, path, STRUCTURAL_KEYS, transform)


def fallback_base(source, over_key, keys, locale, slug):
    """What an untranslated key in `locale` falls back to: English, or - for
    a locale with `fallback` set - its near relative's own words instead.

    Returns a tree shaped like `source` but limited to `keys`, UNRELOCATED:
    any link in it is still written relative to the page's generic position,
    exactly as English's own markup is. That is what lets the result be fed
    straight into `merge` as the new base and have `locale`'s own `relocate`
    - applied once, by the caller, to whatever ends up falling back - resolve
    it correctly for `locale`'s tree. Relocating it here, for the fallback
    locale's own tree, would leave a Traditional Chinese page linking into
    the middle of the Simplified Chinese site instead of its own.

    `missing` is thrown away: which keys the near relative has not itself
    translated is that locale's own debt, tallied when it is charged
    directly, and must not also count against `locale`.
    """
    fallback = locale['fallback_locale']
    if fallback is None:
        return {key: source[key] for key in keys if key in source}
    return translate(source, over_key(fallback), keys,
                     f'locales/{fallback["lang"]}/ (as a fallback for {locale["lang"]})',
                     [], 'fallback', transform=None)


def localize_tool(tool, locale, site):
    """One tool, said in one language, at its own URL.

    The returned tool is a copy. `dir` still points at the English source folder
    - the JavaScript, the stylesheet and the share card are the same files in
    every language, and building eleven copies of a tool out of eleven folders
    is the drift this whole arrangement exists to avoid.
    """
    slug = tool['slug']
    merged = dict(tool)
    debt = charge(locale, slug)
    base = fallback_base(tool, lambda fb: fb['tools'].get(slug, {}),
                         TRANSLATABLE_TOOL_KEYS, locale, slug)
    merged.update(merge(base, locale['tools'].get(slug, {}),
                        f'locales/{locale["lang"]}/tools/{slug}.toml',
                        debt, f'tools.{slug}', STRUCTURAL_KEYS,
                        lambda text: relocate(text, locale, slug)))
    merged['out_slug'] = locale['slugs'].get(slug, slug)
    merged['url'] = f'{site["domain"]}{locale["prefix"]}{merged["out_slug"]}/'
    return merged


def localize_page(page, locale, site):
    """One prose page, said in one language.

    `depth` is how far this page sits below the root of ITS OWN LANGUAGE, and
    not below the root of the site. The frame turns it into `base`, and every
    link built from `base` - the footer, the breadcrumb, the guides index - has
    to stay inside the language it was rendered in.

    Counting the locale prefix as another level, which the first version did,
    sent every one of those links up one level too far: the German privacy page
    linked to the English hub, the English guides index and the English privacy
    page, from a German footer. Nothing 404'd on the way out, because those
    pages all exist - it just quietly left the language.

    That is also why each locale root gets its own copy of site.css: it keeps
    `base` pointing at the language and the stylesheet reachable from it with
    the same number of steps in every language.
    """
    slug = page['slug']
    merged = dict(page)
    debt = charge(locale, slug)
    base = fallback_base(page, lambda fb: fb['pages'].get(slug, {}),
                         TRANSLATABLE_PAGE_KEYS, locale, slug)
    merged.update(merge(base, locale['pages'].get(slug, {}),
                        f'locales/{locale["lang"]}/pages/{slug}.toml',
                        debt, f'pages.{slug}', STRUCTURAL_KEYS,
                        lambda text: relocate(text, locale, slug)))
    merged['out_slug'] = locale['slugs'].get(slug, slug)
    merged['url'] = f'{site["domain"]}{locale["prefix"]}{merged["out_slug"]}/'
    merged['depth'] = merged['out_slug'].count('/') + 1
    return merged


def localize_planned(planned, locale, slug):
    """config/planned.toml, said in one language.

    The roadmap is a real page in the sitemap, so a locale that called itself
    finished while this list was still English would be advertising a page that
    is half translated - which is the exact thing `complete` exists to stop.
    Counted with everything else, so it holds the flag shut until it is done.
    """
    if locale['is_base']:
        return planned
    debt = charge(locale, slug)
    merged = merge(planned, locale['planned'],
                   f'locales/{locale["lang"]}/{PLANNED}',
                   debt, 'planned', PLANNED_STRUCTURE)
    return merged


BODY_LINK = re.compile(r'\b(href|src)="([^"]+)"')

# Hrefs that are already pointing somewhere absolute, or at nothing on the
# filesystem at all. None of them is written relative to the page.
ABSOLUTE_LINK = ('http://', 'https://', '//', '/', '#', 'mailto:', 'tel:', 'data:')


def relocate(html, locale, slug):
    """Point an English body's links at the language it is falling back into.

    A body that falls back is English prose sitting at a German URL, and the
    links inside it were written relative to the ENGLISH page - `../trim-video/`
    from `/guides/reverse-a-video/`. Dropped into `/de/` unchanged they lead to
    pages that do not exist, because German addresses are German: the tool is at
    `/de/video-schneiden/`.

    This is a problem the old arrangement never had, and only because it never
    published a language that had a fallback left in it. Holding pages back one
    at a time means English bodies now appear inside a published language, so
    their links have to be made to work there.

    Each one is resolved against the English page's own folder, turned back into
    the slug it names, and re-emitted as a root-absolute address in this locale -
    root-absolute because the English tree and the German tree are not the same
    shape, and a relative path counted from the wrong one is how this broke in
    the first place. Anything that is not a page keeps its resolved path, which
    is what assets want anyway.
    """
    here = '/' + (f'{slug}/' if slug else '')

    def fix(match):
        attr, href = match.group(1), match.group(2)
        if href.startswith(ABSOLUTE_LINK) or not href:
            return match.group(0)
        # Keep a fragment or a query on the end of whatever the path becomes.
        cut = min((i for i in (href.find('#'), href.find('?')) if i >= 0),
                  default=len(href))
        path, tail = href[:cut], href[cut:]
        if not path:
            return match.group(0)
        resolved = posixpath.normpath(posixpath.join(here, path))
        if path.endswith('/') and not resolved.endswith('/'):
            resolved += '/'
        # A page of this site is a folder and ends in a slash; an asset is a
        # file and has an extension. Only the first kind has an address that
        # differs between languages.
        if resolved.endswith('/'):
            # A slug with no translation maps to itself, which is right rather
            # than a gap: that page is falling back too, and in this language it
            # lives at its English address under this language's prefix.
            return f'{attr}="{locale_path(locale, resolved.strip("/"))}{tail}"'
        return f'{attr}="{resolved}{tail}"'

    return BODY_LINK.sub(fix, html)


def body_for(locale, kind_name, slug, fallback):
    """The translated body.html for a tool or a page - this locale's own, its
    `fallback` locale's, or the English one.

    Prose bodies are whole files rather than keys in a table, so they fall back
    as whole files too: a guide is either translated or it is not, and there is
    no useful halfway state where three of its paragraphs are in German.

    A body borrowed from the fallback locale is read straight off disk,
    UNRELOCATED - it is written relative to the generic page position, the
    same as an English body is, so `relocate` below resolves it correctly
    for THIS locale in one pass. Relocating it twice, once for the fallback
    locale and once for this one, is how a Traditional Chinese page would
    end up linking into the middle of the Simplified Chinese site instead of
    its own - see `fallback_base`, which the same reasoning is written out
    in full for.
    """
    key = f'{kind_name}/{slug}'
    if key in locale['bodies']:
        return locale['bodies'][key]
    if not locale['is_base']:
        locale['debt'].setdefault(slug, []).append(f'{kind_name}.{slug}.body')
        near = locale['fallback_locale']
        source = near['bodies'].get(key) if near else None
        return relocate(fallback if source is None else source, locale, slug)
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
    """A locale that claims to be finished has to have finished the FRAME.

    This used to be judged over the whole language, and the whole language is
    the wrong unit. English is not finished either - it grows a tool most
    weeks - and a rule that fails the build the moment it does makes every new
    English tool wait for ten translations before the site will build at all.
    That happened three times to German while it was being written, and the
    third time it was holding up nine other languages that had nothing to do
    with it.

    So an untranslated PAGE is no longer an error. It falls back, it is built
    and readable at its own URL, and it is kept out of the sitemap, out of
    every hreflang set and out of the switcher until it is translated - the
    same treatment an unfinished locale used to get, applied to the page that
    is actually unfinished. See `translated`.

    What is still an error is claiming a language and not having said the words
    around every page in it. That set is small, it is stable, and it does not
    grow when a new tool ships.
    """
    if locale['is_base'] or not locale['complete']:
        return
    debt = locale['frame']
    if not debt:
        return

    shown = sorted(set(debt))
    more = len(shown) - 12
    tail = f'\n    ... and {more} more' if more > 0 else ''
    raise LocaleError(
        f'locales/{locale["lang"]}/ says complete = true, but {len(shown)} strings '
        'in the frame around every page still fall back to English:\n    '
        + '\n    '.join(shown[:12]) + tail
        + '\n  The frame is the nav, the footer, the hub and the [ui] words, and it '
          'is drawn around every page in the language, so there is no per-page way '
          'to hold it back. Translate these, or set complete = false: the locale is '
          'then still built and still readable at its own URL, and is kept out of '
          'the sitemap, the hreflang tags and the switcher until it is ready.')


def translated(locale, slug):
    """Is this one page finished in this one language?

    English is finished by definition. A locale that has not finished its frame
    publishes nothing at all, however many of its pages are done, because every
    one of them would be wearing an English nav.
    """
    if locale['is_base']:
        return True
    if not locale['complete']:
        return False
    return not locale['debt'].get(slug)


def published(locales, slug=None):
    """The locales fit to be advertised - for the whole site, or for one page.

    The sitemap, the hreflang tags and the switcher are all built from this one
    function, so the three cannot disagree about which languages the site
    claims a page to be available in - which is the failure Google reports as
    "hreflang tags point to a page that is not indexed".

    Without a slug this is the set of locales that have finished their frame,
    which is what the language switcher on the 404 has to work from. With one,
    it is the narrower set that has also finished that page.
    """
    ready = [locale for locale in locales if locale['is_base'] or locale['complete']]
    if slug is None:
        return ready
    return [locale for locale in ready if translated(locale, slug)]


def debt_report(locale, tools, prose):
    """One line per language about what is left, for the end of a build.

    Counted in pages rather than strings, because pages are the unit that now
    decides anything: a page with one string left is as unpublished as a page
    with four hundred.
    """
    slugs = [tool['slug'] for tool in tools] + [page['slug'] for page in prose]
    behind = [slug for slug in slugs if locale['debt'].get(slug)]
    return behind


def alternates(locales, slug, site):
    """The <link rel="alternate" hreflang> set for one page, in every language
    it is published in.

    Google's rule is that the set is reciprocal and self-inclusive: every page
    lists every version of itself, its own included, and each of those pages
    lists the same set back. Built from one list here, so reciprocity is a
    property of the code rather than something to be audited afterwards.

    x-default points at English, which is what a reader whose language is not
    one of these is meant to be given.

    Judged for THIS page, not for the site. A language that has translated the
    hub but not this guide does not appear in this guide's set, and the guide it
    has not translated does not appear in anyone else's - which is the
    reciprocity rule holding at the level the translation actually happens at.
    """
    ready = published(locales, slug)
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

    Plain links. A crawler has to be able to walk from one language into the
    next, and every reader has to be able to leave a language whether or not
    any script ran.

    This list is also the data shared/lang.js works from - it is where the
    endonyms and the per-page addresses come from - so a language offered here
    is a language a visitor can be sent to, and no other list decides that.

    Offers the languages this page is actually translated into, and says so by
    listing nothing else. That is the third version of this rule, and the two
    before it were each wrong in the opposite direction.

    Judging it per page and rendering nothing below two entries removed the
    control altogether from any page nobody had translated yet - five tool pages
    shipped with no way to change language at all. Offering every published
    language instead, with the untranslated ones badged, put an EN chip beside
    eight of the eleven entries on a page like /id-photo/, which reads as
    breakage rather than as information.

    So the list is per page again, and what changed is the floor. A switcher is
    rendered whenever the SITE has more than one published language, even where
    THIS page has only English to offer - a list of one is not furniture when it
    is the way out of a page the reader cannot read. What is never done again is
    listing a language and then explaining that it will not be in it.

    `alternates` and the sitemap are built from the same per-page set, so the
    three still cannot disagree about which languages claim to have this page.
    """
    # The floor is the SITE, the list is the PAGE. On a site with one language
    # there is nothing to switch to and no control; on a site with ten there is
    # always a control, even on a page only one of them has.
    if len(published(locales)) < 2:
        return []
    ready = published(locales, slug)
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
