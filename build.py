#!/usr/bin/env python3
"""
Build the site into dist/.

    python build.py              build into dist/
    python build.py --clean      empty dist/ first
    python build.py --no-minify  leave the output readable, for debugging
    python build.py --mangle     rename identifiers too (needs esbuild)
    python build.py --check      build, then fail if dist/ differs from git's
                                 copy of the branch it is committed on

Nothing to install: this uses only the Python standard library, on 3.11 or
newer (for tomllib). That is the same bargain the tools themselves make - if
you have to fetch a tree of dependencies before you can check what a page
claims, the claim is not really checkable.

WHAT THIS DOES, AND WHY IT EXISTS

Three tool pages were written out by hand, and the frame around them - the
Content-Security-Policy, the header, the privacy pledge, the live check, the
FAQ, the footer - was the same on all three, give or take a noun. Keeping them
in step was a manual job, and the repository was full of comments admitting it:
"keep this list in step with the other pages", "EDIT BOTH OR NEITHER", "bump
CACHE_NAME whenever any listed file changes".

Every one of those is now a thing the build does:

  * the CSP is written once, in config/site.toml, and copied to every page;
  * the FAQ renders both as the questions at the foot of a page and as the
    FAQPage structured data in its head, from one set of answers;
  * the hub's tool cards, its ItemList structured data and sitemap.xml are all
    derived from the tools that exist in tools/;
  * a service worker's asset list is read off the disk, and its cache name is a
    hash of those files, so it changes exactly when they do.

WHAT IT DOES TO THE HTML, CSS AND JAVASCRIPT

By default: strips comments and whitespace, and nothing else. No bundler, no
transpiler, no renaming. Every module is still its own file, still an ES module,
still running the same statements in the same order on the same lines, and the
served code can still be read and grepped. buildlib/minify.py and
buildlib/cssmin.py do that work and explain what they will not touch and why;
minify.py checks its own output on every file, and the build fails rather than
ship something whose tokens moved.

With --mangle: identifiers are renamed as well, by esbuild, pinned to the
version in config/site.toml. That is what CI runs and what gets deployed, and it
is the one thing here that needs something installed. Plain `python build.py`
still needs nothing but Python and still produces a working, readable site -
which is the point, because a claim nobody can reproduce is not a claim.
buildlib/mangle.py sets out what that costs.

--check implies --mangle, because the deployed branch is mangled and comparing
against it any other way would report a difference on every file.

The build never reaches the network, whichever way it runs.
"""

import argparse
import hashlib
import html
import re
import shutil
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from buildlib import cssmin
from buildlib import i18n
from buildlib import imports
from buildlib import mangle
from buildlib import minify
from buildlib import site as sitelib
from buildlib.template import Loader, TemplateError

ROOT = Path(__file__).parent.resolve()
TEMPLATES = ROOT / 'templates'
CONFIG = ROOT / 'config'
TOOLS = ROOT / 'tools'
PAGES = ROOT / 'pages'
SHARED = ROOT / 'shared'
LOCALES = ROOT / 'locales'


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.split('\n')[1])
    parser.add_argument('--out', default='dist', help='where to write (default: dist)')
    parser.add_argument('--clean', action='store_true', help='empty the output first')
    parser.add_argument('--no-minify', dest='minify', action='store_false',
                        help='leave the output readable, for debugging')
    parser.add_argument('--mangle', action='store_true',
                        help='also rename identifiers, using the pinned esbuild')
    parser.add_argument('--check', action='store_true',
                        help='fail if the output differs from the committed dist branch')
    args = parser.parse_args(argv)

    out = (ROOT / args.out).resolve()
    # --check compares against the deployed branch, and the deployed branch is
    # mangled, so checking without mangling would report a difference on every
    # file and mean nothing.
    want_mangle = args.mangle or args.check
    try:
        pages = build(out, clean=args.clean, minify_output=args.minify,
                      mangle_names=want_mangle)
    except (sitelib.ConfigError, TemplateError, minify.MinifyError,
            cssmin.CssError, mangle.MangleError) as err:
        print(f'build failed: {err}', file=sys.stderr)
        return 1

    print(f'\n  {len(pages)} pages -> {out}')
    for page in pages:
        print(f'    {page}')

    if args.check:
        return check_against_branch(out)
    return 0


def build(out, clean=False, minify_output=True, mangle_names=False):
    if clean and out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True, exist_ok=True)

    templates = Loader(TEMPLATES)
    site = sitelib.load_toml(CONFIG / 'site.toml')
    emit = Emitter(minify_output, site, mangle_names)
    # The hub and the legal pages share one stylesheet, so they share one
    # version for it. Tool pages each hash their own assembled sheet.
    # Minified first, then hashed: the version in the URL has to be a hash of
    # the bytes a browser actually receives, or turning minifying on would serve
    # new CSS under the old version and leave returning visitors on the stale one.
    site_css = emit.css_text((SHARED / 'site.css').read_text(encoding='utf-8'))
    css_v = sitelib.text_hash(site_css)

    # The language script, hashed the same way and for a sharper reason than the
    # stylesheet. Every tool page installs a service worker that caches whatever
    # same-origin file it is asked for, and its cache is only emptied when one of
    # the files it was built with changes - which this one is not. Without a
    # version in the URL, a visitor who used a tool before this file changed
    # would keep the old copy of it until that tool shipped an update.
    lang_js = emit.js_text((SHARED / 'lang.js').read_text(encoding='utf-8'), 'shared/lang.js')
    lang_v = sitelib.text_hash(lang_js)

    # The one question a tool page asks, hashed for the same reason and served
    # from the same place. Only tool pages include it - it has nothing to ask on
    # a guide - but it is written once at the root rather than into each tool,
    # so that moving from one tool to the next is not a second copy to fetch.
    feedback_js = emit.js_text(
        (SHARED / 'feedback.js').read_text(encoding='utf-8'), 'shared/feedback.js')
    feedback_v = sitelib.text_hash(feedback_js)

    planned = sitelib.load_toml(CONFIG / 'planned.toml')

    tools = [sitelib.load_tool(path, site)
             for path in sorted(TOOLS.glob('*/tool.toml'))]
    if not tools:
        raise sitelib.ConfigError(f'no tools found under {TOOLS}')

    # ** rather than *, because a guide lives at pages/guides/<slug>/ and a
    # legal page at pages/<slug>/. The slug in each page.toml has to match the
    # folder either way, so a page cannot end up at a URL nobody wrote down.
    prose = [sitelib.load_page(path, site, PAGES)
             for path in sorted(PAGES.glob('**/page.toml'))]

    # Every language this site is written in, English first. English is the
    # sources themselves rather than a folder under locales/ - buildlib/i18n.py
    # says why at length, and the short version is that a translation of English
    # into English is a copy free to drift from what it was copied out of.
    locales = i18n.load_locales(LOCALES, site)
    for locale in locales:
        i18n.check_slugs(locale, [tool['slug'] for tool in tools],
                         [page['slug'] for page in prose], site)

    # Before anything is written, because rendering one page needs to know which
    # OTHER languages have finished that same page - the hreflang set on the
    # English tool page is the set of languages it exists in. English is
    # rendered first, so if the answer were worked out as each language went by,
    # English would be asking the question before any language had answered it,
    # and would advertise a German page that is still English.
    i18n.survey(locales, tools, prose, planned, site)

    written = []
    for locale in locales:
        written += build_locale(out, templates, locale, locales, site, tools,
                                prose, planned, css_v, lang_v, feedback_v,
                                site_css, emit)

    # After every locale, because a locale only counts as finished once every
    # page in it has been rendered and had the chance to fall back. Raising
    # here rather than at load time is what makes the report a list of
    # everything still to translate instead of the first thing missing.
    for locale in locales:
        i18n.check_complete(locale)

    # How far along each language is, said out loud on every build. A
    # translation that is 40 strings from done and one that has not been started
    # look identical in a directory listing, and the difference is the only
    # thing anybody wants to know about it.
    #
    # Two different states are worth two different sentences. A locale that has
    # not finished its frame is not published at all. A locale that has is
    # published, and owes a number of PAGES - which is the unit that decides
    # anything now, since a page with one string left is as held back as a page
    # with four hundred.
    for locale in locales:
        if locale['is_base']:
            continue
        if not locale['complete']:
            left = len(set(i18n.all_debt(locale)))
            print(f'  {locale["lang"]}: {left} strings still in English '
                  f'(not advertised until complete = true)')
            continue
        behind = i18n.debt_report(locale, tools, prose)
        if behind:
            print(f'  {locale["lang"]}: published, {len(behind)} of '
                  f'{len(tools) + len(prose)} pages still in English '
                  f'(built and readable, kept out of the sitemap): '
                  + ', '.join(sorted(behind)[:4])
                  + (' ...' if len(behind) > 4 else ''))

    # One 404 for the whole domain, in English, because GitHub Pages serves one
    # file for every address it cannot find and has no way to know which
    # language the visitor was looking for. It carries the language switcher
    # like every other page, so arriving here in the wrong language is still a
    # click away from the right one.
    base = locales[0]

    # Everything in the order the site puts it in rather than the order the
    # folders happen to sort in: tools as the hub groups them, guides as
    # config/site.toml groups them, then the legal pages. Both orderings are
    # structural rather than translated, so they are the same in every language
    # and are worked out once, here, rather than once per locale.
    by_slug = {tool['slug']: tool for tool in tools}
    ordered_tools = [by_slug[slug]
                     for category in site['hub']['categories']
                     for slug in category['order'] if slug in by_slug]

    groups = guide_groups(site, [page for page in prose if page['kind'] == 'guide'])
    ordered_prose = [guide for group in groups for guide in group['guides']]
    ordered_prose += [page for page in prose if page['kind'] == 'legal']

    # tools/README.md, from the English list and only once. It is a file in the
    # repository rather than a page of the site - the index GitHub shows when
    # somebody browses to tools/ - so it has no language to be written in and
    # no locale to be written per.
    write_tools_index(ordered_tools)

    build_404(out, templates, base, locales, site, ordered_tools, ordered_prose,
              css_v, lang_v, emit)
    written.append('404.html')

    # After the 404 and deliberately not passed it: the 404 has no address of
    # its own to list, and inviting a crawler to index it would be inviting it
    # to serve "not found" in place of a real page.
    build_sitemap(out, templates, site, locales, tools, ordered_prose)
    written.append('sitemap.xml')

    # And the same site again, in plain text, for something that reads one file
    # and decides from it whether any of this is worth mentioning. Built from
    # the same list as the sitemap above and holding back the same languages.
    build_llms(out, templates, site, locales, ordered_tools, ordered_prose)
    written.append('llms.txt')

    copy_shared(out)
    write(out / 'site.css', site_css)
    write(out / 'lang.js', lang_js)
    write(out / 'feedback.js', feedback_js)

    # Last, because it reads the finished tree rather than the sources. A link
    # is only checkable once everything it could point at has been written.
    check_links(out, locales, site)
    return written


# ---------------------------------------------------------------------------
# One language
#
# Everything below the top of this function is the site as it was before there
# were locales: the same tools, the same guides, the same checks, the same
# order. What changed is that it now happens once per language rather than
# once, and that every slug it writes to disk is `out_slug` - the localized
# one - while every slug it looks something up by is `slug`, which stays
# English in every language.
#
# That distinction is the whole trick, and it is worth stating plainly because
# mixing the two is the one bug this arrangement can still have. `slug` is the
# name of a thing: which tool this is, which category lists it, which guide is
# about it. `out_slug` is an address. A German reader never sees the first and
# a build never matches on the second.


def build_locale(out, templates, locale, locales, site, tools, prose, planned,
                 css_v, lang_v, feedback_v, site_css, emit):
    """The whole site, in one language, under out/<lang>/ - or at the root of
    out/ for English, whose pages keep the addresses they have always had.

    Nothing here re-reads a source file. The tools and the prose pages were
    loaded once, in English, and are localized into copies, so eleven languages
    cost eleven renders rather than eleven parses - and, more to the point, a
    tool cannot exist in one language and not another, because there is only one
    list of which tools there are.
    """
    root = locale['site']
    dest_root = out / locale['prefix'] if locale['prefix'] else out
    dest_root.mkdir(parents=True, exist_ok=True)

    # Where this language's own front door, guides index and roadmap are. The
    # structured data needs all three as absolute URLs, and needs them to be
    # this language's rather than English's: a German page whose WebSite node
    # points at the English root is telling a search engine the two are one
    # document, which is the opposite of what hreflang beside it says.
    #
    # `lang` goes the same way. It is what every inLanguage in the graph is
    # built from, and it is the one value in config/site.toml that is a fact
    # about the language rather than about the site.
    root['lang'] = locale['hreflang']
    root['home'] = i18n.locale_url(locale, '', site)
    root['guides_url'] = i18n.locale_url(locale, site['guides']['slug'], site)
    root['roadmap_url'] = i18n.locale_url(locale, site['roadmap']['slug'], site)

    ltools = [i18n.localize_tool(tool, locale, site) for tool in tools]
    lprose = [i18n.localize_page(page, locale, site) for page in prose]
    by_slug = {tool['slug']: tool for tool in ltools}

    guides = [page for page in lprose if page['kind'] == 'guide']
    legal = [page for page in lprose if page['kind'] == 'legal']

    # The guides, grouped and in the order config/site.toml puts them in, and
    # every check that says the grouping is complete. Done here rather than
    # inside build_guides because the footer needs the same order, and an order
    # worked out twice is an order that can differ.
    groups = guide_groups(root, guides)
    ordered_guides = [guide for group in groups for guide in group['guides']]

    # Which guide belongs to which tool, so that a tool page can link to its
    # guide and the guide back to the tool. The owning line is `tool` in the
    # guide's page.toml - one place, both directions.
    guide_of = tie_guides_to_tools(ordered_guides, by_slug)

    # Tools in the order the hub shows them, not the order the folders happen to
    # sort in, so the footer and the cards above it agree. A slug named here
    # that has no tool, or a tool named nowhere, is caught by build_hub below.
    ordered = [by_slug[slug]
               for category in root['hub']['categories']
               for slug in category['order'] if slug in by_slug]

    # The few other tools each tool page points at, off the same hub order. See
    # related_tools: one ring over every tool, siblings first.
    related_of = related_tools(ordered)

    # What the footer on every page is built from. Derived from the folders that
    # exist rather than written down anywhere, so a new tool or a new legal page
    # reaches every footer on the site without a second edit.
    #
    # No guide list. The footer carries one link to the guides index instead of
    # an entry per guide - a column that grew by a line every time somebody
    # wrote one, in front of a reader who was looking for the privacy page. The
    # index is the link that keeps working however long the list gets, and it is
    # already built from the folders that exist.
    #
    # The slugs in it are localized, because a footer is a set of addresses.
    footer = {
        'tools': [{'name': tool['name'], 'slug': tool['out_slug']} for tool in ordered],
        'pages': [{'nav': page['nav'], 'slug': page['out_slug']} for page in legal],
    }

    links = locale_links(locale, site, lprose)

    written = []
    for tool in ltools:
        build_tool(dest_root, templates, locale, locales, site, tool, footer,
                   links, lang_v, feedback_v, guide_of.get(tool['slug'], {}),
                   related_of.get(tool['slug'], []), emit)
        written.append(f'{locale["prefix"]}{tool["out_slug"]}/index.html')

    for page in lprose:
        build_page(dest_root, templates, locale, locales, site, page, footer,
                   links, css_v, lang_v, by_slug, emit)
        written.append(f'{locale["prefix"]}{page["out_slug"]}/index.html')

    build_guides(dest_root, templates, locale, locales, site, groups,
                 ordered_guides, footer, links, css_v, lang_v, emit)
    written.append(f'{locale["prefix"]}{links["guides"]}/index.html')

    build_hub(dest_root, templates, locale, locales, site, by_slug, footer,
              links, css_v, lang_v, emit)
    written.append(f'{locale["prefix"]}index.html')

    build_roadmap(dest_root, templates, locale, locales, site,
                  i18n.localize_planned(planned, locale, site['roadmap']['slug']), ordered,
                  footer, links, css_v, lang_v, emit)
    written.append(f'{locale["prefix"]}{links["roadmap"]}/index.html')

    # A copy of the site stylesheet at the root of every language, so that the
    # relative path from a page to it is the same number of steps up in every
    # language and `depth` stays the only thing the frame has to know. It is the
    # same bytes under the same hashed URL, so a reader who crosses from one
    # language to another is served it from cache either way.
    if locale['prefix']:
        write(dest_root / 'site.css', site_css)

    return written


def locale_links(locale, site, pages):
    """The handful of pages that are linked to from inside a sentence.

    A link written into prose - "there is a guide for every tool" - cannot be
    derived from the sentence around it, so the address is passed in beside the
    words and the translated string points at it. Three of them, and every one
    is checked here rather than discovered as a 404 later.
    """
    def address(slug):
        return locale['slugs'].get(slug, slug)

    known = {page['slug'] for page in pages}
    if site['safety_guide'] not in known:
        raise sitelib.ConfigError(
            f'config/site.toml: safety_guide is {site["safety_guide"]!r}, but there '
            f'is no pages/{site["safety_guide"]}/page.toml. The hub links to it in '
            'the middle of a sentence, so it cannot simply be dropped.')

    return {
        'guides': address(site['guides']['slug']),
        'roadmap': address(site['roadmap']['slug']),
        'safety_guide': address(site['safety_guide']),
    }


def frame(locale, locales, site, slug, base, links, lang_v, extra=None):
    """The context every page shares: which language it is in, what the words of
    the frame around it are, and where its own address is in every other
    language.

    Built in one place because the three have to agree. A page whose <html lang>
    says German, whose hreflang set leaves German out, and whose switcher offers
    German anyway is three different answers to one question, and each of them
    is a separate afternoon in Search Console.
    """
    context = {
        'site': locale['site'],
        'locale': {
            'lang': locale['lang'],
            'hreflang': locale['hreflang'],
            'endonym': locale['endonym'],
            'rtl': locale['dir'] == 'rtl',
        },
        'base': base,
        'links': links,
        'canonical': i18n.locale_url(locale, slug, site),
        'alternates': i18n.alternates(locales, slug, site),
        'languages': i18n.switcher(locales, locale, slug, site),
        # Root-absolute, and the same URL on every page in every language, so
        # that crossing from one language to another is not also a second copy
        # of this file to fetch. shared/lang.js says what it does.
        'lang_href': f'/lang.js?v={lang_v}',
    }
    context.update(extra or {})
    return context


# ---------------------------------------------------------------------------
# The guides, and how they are tied to the tools


def guide_groups(site, guides):
    """The guides, in the groups and the order config/site.toml gives them.

    Three things are checked, and each of them is a way a guide could end up
    written and then linked to from nowhere:

      * a guide naming a group that does not exist;
      * a group listing a guide that does not exist;
      * a guide that exists and that no group lists.

    The same three the hub already makes about tools and categories. A page
    nothing links to is a page that might as well not have been written, and
    the point of checking here is that the build says so rather than the
    silence of a missing card.
    """
    by_name = {guide['slug'].rsplit('/', 1)[-1]: guide for guide in guides}
    groups, listed = [], set()
    for group in site['guides']['groups']:
        chosen = []
        for name in group['order']:
            if name not in by_name:
                raise sitelib.ConfigError(
                    f'config/site.toml lists {name!r} in guide group '
                    f'{group["id"]!r}, but there is no '
                    f'pages/{site["guides"]["slug"]}/{name}/page.toml')
            guide = by_name[name]
            if guide['group'] != group['id']:
                raise sitelib.ConfigError(
                    f'{guide["slug"]} says group = {guide["group"]!r} but is listed '
                    f'under {group["id"]!r} in config/site.toml')
            chosen.append(guide)
            listed.add(name)
        groups.append({**group, 'guides': chosen})

    stray = sorted(set(by_name) - listed)
    if stray:
        raise sitelib.ConfigError(
            'these guides exist but are not listed in any [[guides.groups]] order, '
            f'so nothing would link to them: {", ".join(stray)}')
    return groups


def tie_guides_to_tools(guides, by_slug):
    """Map a tool's slug to the guide about it, from the guides' own `tool`.

    One line in one file makes both links: the guide gets a link to the tool
    under its heading, and the tool gets a link to the guide under its
    questions. Written the other way round - a `guide` key in each tool.toml -
    it would be two lines that could disagree about which page is about which.

    A slug that names no tool is an error, because it is a link to a page that
    is not there. Two guides claiming one tool is an error as well: the tool
    page has room for one, so the second would be written and never linked.
    """
    owned = {}
    for guide in guides:
        slug = guide['tool']
        if not slug:
            continue
        if slug not in by_slug:
            raise sitelib.ConfigError(
                f'{guide["slug"]}: tool is {slug!r}, but there is no '
                f'tools/{slug}/tool.toml')
        if slug in owned:
            raise sitelib.ConfigError(
                f'{guide["slug"]} and {owned[slug]["slug"]} both say they are the '
                f'guide for {slug}, and a tool page links to one guide')
        owned[slug] = guide
    return owned


# How many other tools a tool page points at. Four is enough to be a route on
# out of the page and few enough that the block stays a suggestion rather than
# a second copy of the hub halfway down every tool.
RELATED_COUNT = 4


def related_tools(ordered, count=RELATED_COUNT):
    """Map a tool's slug to the few other tools its page links to.

    A tool page used to be a dead end. It links up to the hub and across to its
    own guide and nowhere else, so a reader who arrived from a search for "heic
    to jpg" was shown one tool and no route to the resize and the compress
    sitting beside it on the front page.

    Which tools are related is not written down anywhere new, and deliberately
    so: `order` in config/site.toml already groups the tools by what they are
    for, and that grouping is the hub's own. The tools a page points at are the
    ones a reader would have found under the same heading on the front page,
    which means there is no second list here to fall out of step with the first.

    The list is a RING rather than the head of the category. Read from the
    tool's own position and wrap round, and every tool links to `count` others
    and every tool has something linking to it - inbound runs a few either side
    of `count` rather than the exact `count` a plain ring would give, because
    sorting siblings to the front pulls the crowded categories forward.
    Taking the first few of each category instead would point all ten pages of
    `video-and-animation` at the same four names and leave the tail of it with
    nothing coming in at all, which is the half of the problem that is about
    search engines rather than readers.

    No category holds a single tool today - the smallest holds five - but three
    did while the hub still had seven headings, and a category that has just
    been added holds exactly one until the second tool arrives. A strict reading
    of "same category" would leave each of those as the dead end this exists to
    remove, and which categories are small keeps changing, so the ring runs over
    every tool and the category merely sorts first: a tool with siblings gets
    siblings, and a tool without gets the nearest thing the hub has.
    """
    total = len(ordered)
    out = {}
    for index, tool in enumerate(ordered):
        ring = [ordered[(index + step) % total] for step in range(1, total)]
        # Stable, so the same-category tools keep their ring order and the rest
        # follow in theirs. Sorting on the bool is the whole of "siblings
        # first, then whatever is nearest".
        ring.sort(key=lambda other: other['category'] != tool['category'])
        out[tool['slug']] = ring[:count]
    return out


def build_guides(out, templates, locale, locales, site, groups, guides, footer,
                 links, css_v, lang_v, emit):
    """The index of the written half of the site.

    Built like the roadmap and for the same reason: it is a frame around a list
    that lives somewhere else. Nothing on the page is written in the template or
    in config/site.toml except the grouping - every card is a guide's own
    heading and description, the two strings that also draw that guide's <h1>
    and its <meta name="description">, so the index cannot promise something the
    guide does not deliver.
    """
    root = locale['site']
    dest = out / links['guides']
    dest.mkdir(parents=True, exist_ok=True)

    context = frame(locale, locales, site, root['guides']['slug'], '../', links, lang_v, {
        'groups': groups,
        'guide_count': len(guides),
        'guide_noun': (root['ui']['guide_one'] if len(guides) == 1
                       else root['ui']['guide_many']),
        'footer': footer,
        'css_href': f'../site.css?v={css_v}',
        'csp': sitelib.render_csp(root['csp']),
        'jsonld': sitelib.guides_jsonld(root, guides),
    })
    context['ui'] = i18n.render_ui(templates, root['ui'], context,
                                   f'ui [{locale["lang"]}]')

    emit.html(dest / 'index.html', templates.render('guides.html', context))

    emit.js(dest / 'analytics.js', templates.render('analytics.js', {
        'site': root,
        'words': {'plural': 'files', 'analytics_extra': ''},
    }), where=f'{locale["prefix"]}{links["guides"]}/analytics.js')


# ---------------------------------------------------------------------------
# One tool


def build_tool(out, templates, locale, locales, site, tool, footer, links,
               lang_v, feedback_v, guide, related, emit):
    root = locale['site']
    dest = out / tool['out_slug']
    dest.mkdir(parents=True, exist_ok=True)

    # The app code. Every module keeps its own file and its own name; only the
    # comments and the indentation come out. See buildlib/minify.py.
    src_dir = tool['dir'] / 'src'
    if not src_dir.is_dir():
        raise sitelib.ConfigError(f'{tool["slug"]}: no src/ folder')
    own = sorted(src_dir.glob('*.js'))
    if not any(path.name == 'main.js' for path in own):
        raise sitelib.ConfigError(f'{tool["slug"]}: src/main.js is required')

    # Shared modules land in src/shared/ rather than beside the tool's own
    # files, so that an import in main.js says where the thing came from. A tool
    # folder in dist/ is still complete on its own - nothing is bundled, nothing
    # is fetched from a neighbour, and the service worker below caches these
    # exactly like the rest.
    shared = shared_js(tool)
    assets = [(f'src/shared/{path.name}', path) for path in shared]
    assets += [(f'src/{path.name}', path) for path in own]

    # Nothing is bundled, so the browser fetches every module by the name an
    # import gives it. A specifier naming a file this tool does not ship is
    # therefore not a build error but a 404 on the visitor's machine, after the
    # page has rendered - and the commonest cause is a shared module that needs
    # a second shared module the tool never asked for in js_parts. This is the
    # one place that knows exactly what the tool ships, so it is where that is
    # checked. See buildlib/imports.py.
    sources = dict(assets)
    imports.check(set(sources),
                  lambda name: sources[name].read_text(encoding='utf-8'),
                  tool['slug'])

    for name, path in assets:
        (dest / name).parent.mkdir(parents=True, exist_ok=True)
        emit.js(dest / name, path.read_text(encoding='utf-8'),
                where=f'{locale["prefix"]}{tool["out_slug"]}/{name}')

    for extra in sorted(src_dir.iterdir()):
        if extra.is_file() and extra.suffix != '.js':
            shutil.copy2(extra, dest / 'src' / extra.name)

    vendored = vendor_files(tool, dest)

    body_path = tool['dir'] / 'body.html'
    if not body_path.is_file():
        raise sitelib.ConfigError(f'{tool["slug"]}: no body.html')

    # A tool documents itself, in its own folder. The repository README covers
    # the site and the build and is not the place for it, which is the whole
    # reason this is checked rather than trusted: an explanation that went into
    # the wrong file would read perfectly well there and leave its own folder
    # bare for whoever came looking beside the code.
    if not (tool['dir'] / 'README.md').is_file():
        raise sitelib.ConfigError(
            f'{tool["slug"]}: no README.md. Every tool explains itself in its own '
            'folder; see "Adding a tool" in the repository README.')

    # Assembled first, so the page can ask for it by a URL carrying a hash of
    # what is in it. The service worker below precaches that same URL: it
    # matches on the whole request, query and all, so a mismatch would leave a
    # tool styled online and bare offline.
    css = emit.css_text(tool_css(tool))
    css_href = f'styles.css?v={sitelib.text_hash(css)}'

    # The frame's own words, rendered before the body is, because the body can
    # {% include %} a partial that uses them - the URL importer's warning being
    # the one that does.
    #
    # [ui.tool] and [ui.feedback] on every tool page, and [ui.picker] only where
    # there is a picker to describe. The last is not a tidiness: those strings
    # name {{ tool.picker.urls.noun }}, which a tool that does not fetch
    # addresses has never defined, so rendering them everywhere fails the build
    # on the first tool that does not.
    parts = (['tool', 'feedback']
             + (['picker'] if sitelib.wants_urls(tool) else []))
    ui_context = {'site': root, 'tool': tool, 'base': '../', 'links': links}
    ui = i18n.render_ui(templates, root['ui'], ui_context,
                        f'ui [{locale["lang"]}]', include=parts)

    # body.html goes through the template engine before it is dropped into the
    # page, so a tool can {% include %} a shared partial - the drop zone being
    # the one every tool wants - instead of copying the markup for it.
    body = templates.render_source(
        i18n.body_for(locale, 'tools', tool['slug'],
                      body_path.read_text(encoding='utf-8')),
        f'{tool["slug"]}/body.html [{locale["lang"]}]',
        {'site': root, 'tool': tool, 'ui': ui, 'base': '../',
         'links': links}).rstrip('\n')

    # Setting [picker.urls] ships the module, the stylesheet and the widened
    # img-src. If the panel itself were then left off the page, the tool would
    # carry a network permission it never uses - which is exactly the kind of
    # quiet over-reach the policy is written down to prevent.
    if sitelib.wants_urls(tool) and 'id="url-panel"' not in body:
        raise sitelib.ConfigError(
            f'{tool["slug"]}: [picker.urls] is set, so this page is built with the '
            'network permission the importer needs, but body.html never includes '
            '{% include "partials/url-import.html" %}. Add it, or drop [picker.urls].')

    emit.html(dest / 'index.html', templates.render(
        'tool.html', frame(locale, locales, site, tool['slug'], '../', links, lang_v, {
            'tool': tool,
            'guide': guide,
            'related': related,
            'ui': ui,
            'footer': footer,
            'csp': sitelib.render_csp(root['csp'], root.get('tool_csp', {}),
                                      sitelib.picker_csp(tool), tool['csp']),
            'css_href': css_href,
            # Root-absolute and versioned, exactly like lang_href beside it and
            # for the same cache reason. Only a tool page asks for this one.
            'feedback_href': f'/feedback.js?v={feedback_v}',
            'jsonld': sitelib.tool_jsonld(root, tool),
            'body': body,
        })))

    write(dest / 'styles.css', css)

    emit.js(dest / 'analytics.js', templates.render('analytics.js', {
        'site': root,
        'words': tool['words'],
    }), where=f'{locale["prefix"]}{tool["out_slug"]}/analytics.js')

    # The service worker caches './', its own src/*.js, and analytics.js. The
    # list is read off the disk rather than written down, so a new module is
    # cached the moment it exists.
    #
    # Hashed from the files as emitted, not as authored: minifying changes the
    # bytes a browser receives, so turning it on or off has to invalidate the
    # cache. Hashing the sources instead would leave a visitor holding the old
    # copy of a file that had genuinely changed.
    cached = ([dest / 'index.html', dest / 'styles.css', dest / 'analytics.js']
              + [dest / name for name, _ in assets]
              + [dest / name for name in vendored])
    emit.js(dest / 'sw.js', templates.render('sw.js', {
        'tool': tool,
        'assets': ['index.html', css_href] + [name for name, _ in assets] + vendored,
        'cache_hash': sitelib.cache_hash(cached),
    }), where=f'{locale["prefix"]}{tool["out_slug"]}/sw.js')

    # Required, not optional. templates/tool.html writes og:image and
    # twitter:image on every tool page whether or not the file is there, and
    # check_links only reads <a href>, so a tool without one used to build
    # clean and serve a share card that 404s - in ten languages, and visible
    # only to whoever pasted the link somewhere. Draw it with
    # `.\og-image.ps1 -Only <slug>`.
    og = tool['dir'] / 'og.png'
    if not og.is_file():
        raise sitelib.ConfigError(
            f'{tool["slug"]}: no og.png. Every tool page claims one in its '
            f'og:image; draw it with .\\og-image.ps1 -Only {tool["slug"]}')
    shutil.copy2(og, dest / 'og.png')


def vendor_files(tool, dest):
    """A vendored engine: `tools/<slug>/vendor/` copied byte for byte.

    Most tools need nothing here, and that is the point - `src/` is code written
    in this repository and is read, minified and token-checked as such. A codec
    nobody here wrote is a different kind of file and gets a different door:

      - **It is never minified.** buildlib/minify.py is a tokeniser, and it
        refuses anything it cannot tokenise exactly - a compiled bundle carries
        strings with line continuations in them, which is legal JavaScript and
        not something that minifier will touch. That refusal is correct. The
        answer is not to loosen it for third-party code; it is to copy the file.
      - **It is precached with everything else**, so a tool carrying an engine
        still works with the network unplugged. An engine downloaded on first
        use would make the offline promise conditional, which is no promise.
      - **Its licence rides along**, because a vendored library is only vendored
        honestly if what it is and what it is licensed under arrive with it.

    Everything in the folder is copied and everything is cached; there is no
    list to keep in step, and a file that is here but not wanted is a file that
    should not have been committed.

    Returns the paths, relative to the tool's folder in dist/, in the order the
    service worker should list them.
    """
    root = tool['dir'] / 'vendor'
    if not root.is_dir():
        return []

    shipped = []
    for path in sorted(root.rglob('*')):
        if not path.is_file():
            continue
        name = f'vendor/{path.relative_to(root).as_posix()}'
        (dest / name).parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, dest / name)
        shipped.append(name)
    return shipped


def shared_js(tool):
    """The shared modules this tool asked for, in `js_parts`.

    The same arrangement as `css_parts` and for the same reason: a component
    more than one tool needs, and no tool should own. Opt-in rather than given
    to everybody, so a tool that has no use for a drop zone does not ship one.
    """
    chosen = []
    for name in sitelib.js_parts(tool):
        path = SHARED / 'js' / f'{name}.js'
        if not path.is_file():
            raise sitelib.ConfigError(
                f'{tool["slug"]}: no such js part: {name} (looked in shared/js)')
        chosen.append(path)
    return chosen


def tool_css(tool):
    """The shared frame, then any optional parts this tool asked for, then the
    tool's own rules. Order matters: the tool's own rules come last so that a
    tool can override the frame, and never the other way round."""
    parts = [(SHARED / 'css' / 'tool-frame.css').read_text(encoding='utf-8')]
    for name in sitelib.css_parts(tool):
        path = SHARED / 'css' / f'{name}.css'
        if not path.is_file():
            raise sitelib.ConfigError(f'{tool["slug"]}: no such css part: {name}')
        parts.append(path.read_text(encoding='utf-8'))
    own = tool['dir'] / 'styles.css'
    if own.is_file():
        parts.append(own.read_text(encoding='utf-8'))
    banner = ('/*\n'
              '  GENERATED FILE - do not edit.\n'
              '\n'
              '  Assembled by build.py from shared/css/tool-frame.css (the frame every\n'
              '  tool page wears), any shared/css parts this tool asked for, and\n'
              f'  tools/{tool["slug"]}/styles.css (the rules only this tool needs).\n'
              '*/\n\n')
    return banner + '\n'.join(part.strip('\n') + '\n' for part in parts)


# ---------------------------------------------------------------------------
# One prose page (a legal page or a guide)


def build_page(out, templates, locale, locales, site, page, footer, links,
               css_v, lang_v, by_slug, emit):
    """A prose page: the site frame around a body.html, and nothing else.

    No service worker, because there is nothing here worth keeping offline, and
    no CSP of its own - it gets the site policy unchanged, which is the point.
    When these pages were written by hand they carried a hand-narrowed copy that
    left out the donate button's origins; one policy in one file ended that
    argument by making it impossible to have.

    `up` is how the frame climbs back to the root. A legal page sits one level
    down and a guide two, and neither template should have to know which.

    A guide gets two things a legal page does not, and both are worked out here
    rather than tested for in markup: a breadcrumb through the guides index -
    the visible half of the trail the structured data describes - and, when it
    names a tool, the tool itself, so the page can offer a way to go and use the
    thing it has just spent two thousand words explaining."""
    root = locale['site']
    dest = out / page['out_slug']
    dest.mkdir(parents=True, exist_ok=True)

    body_path = page['dir'] / 'body.html'
    if not body_path.is_file():
        raise sitelib.ConfigError(f'{page["slug"]}: no body.html')

    # How far this page sits below the root of its own language, which is one
    # more step under a locale prefix than it is in English. `depth` was worked
    # out for this locale when the page was localized, so the frame still does
    # not have to know which language it is wearing.
    up = '../' * page['depth']

    crumbs = []
    if page['kind'] == 'guide':
        crumbs = [
            {'name': root['ui']['all_tools'], 'href': up},
            {'name': root['guides']['heading'],
             'href': f'{up}{links["guides"]}/'},
        ]

    context = frame(locale, locales, site, page['slug'], up, links, lang_v, {
        'page': page,
        'tool': by_slug.get(page['tool'], {}),
        'crumbs': crumbs,
        'main_class': 'prose' if page['kind'] == 'guide' else 'legal',
        'footer': footer,
        'css_href': f'{up}site.css?v={css_v}',
        'jsonld': sitelib.page_jsonld(root, page),
        'csp': sitelib.render_csp(root['csp']),
        'body': i18n.body_for(
            locale, 'pages', page['slug'],
            body_path.read_text(encoding='utf-8')).rstrip('\n'),
    })
    # [ui.guide] only where the page names a tool. It reaches for {{ tool }},
    # and a legal page has not got one - nor has a guide about no tool in
    # particular, which is what "is it safe to upload files" is.
    context['ui'] = i18n.render_ui(
        templates, root['ui'], context, f'ui [{locale["lang"]}]',
        include=['guide'] if context['tool'] else [])

    emit.html(dest / 'index.html', templates.render('page.html', context))

    emit.js(dest / 'analytics.js', templates.render('analytics.js', {
        'site': root,
        'words': {'plural': 'files', 'analytics_extra': ''},
    }), where=f'{locale["prefix"]}{page["out_slug"]}/analytics.js')


# ---------------------------------------------------------------------------
# The hub


def build_hub(out, templates, locale, locales, site, by_slug, footer, links,
              css_v, lang_v, emit):
    root = locale['site']
    categories = []
    listed = set()
    for category in root['hub']['categories']:
        chosen = []
        for slug in category['order']:
            if slug not in by_slug:
                raise sitelib.ConfigError(
                    f'config/site.toml lists {slug!r} in category {category["id"]!r}, '
                    f'but there is no tools/{slug}/tool.toml')
            tool = by_slug[slug]
            if tool['category'] != category['id']:
                raise sitelib.ConfigError(
                    f'{slug} says category = {tool["category"]!r} but is listed under '
                    f'{category["id"]!r} in config/site.toml')
            chosen.append(tool)
            listed.add(slug)
        categories.append({**category, 'tools': chosen})

    stray = sorted(set(by_slug) - listed)
    if stray:
        raise sitelib.ConfigError(
            'these tools exist but are not listed in any [[hub.categories]] order, '
            f'so nothing would link to them: {", ".join(stray)}')

    ordered = [tool for category in categories for tool in category['tools']]

    context = frame(locale, locales, site, '', './', links, lang_v, {
        'categories': categories,
        'footer': footer,
        'css_href': f'site.css?v={css_v}',
        'csp': sitelib.render_csp(root['csp']),
        'jsonld': sitelib.hub_jsonld(root, ordered),
    })
    context['ui'] = i18n.render_ui(templates, root['ui'], context,
                                   f'ui [{locale["lang"]}]')

    emit.html(out / 'index.html', templates.render('hub.html', context))

    emit.js(out / 'analytics.js', templates.render('analytics.js', {
        'site': root,
        'words': {'plural': 'files', 'analytics_extra': ''},
    }), where=f'{locale["prefix"]}analytics.js')


def build_roadmap(out, templates, locale, locales, site, planned, ordered,
                  footer, links, css_v, lang_v, emit):
    """The roadmap: what is built, then what is planned.

    This was the last section of the hub until the planned list passed about
    fifty names. A front page that ends on a long list of things the site cannot
    do reads as an apology, and it pushed the tools that do exist off the bottom
    of the screen. Moving it here keeps the list - saying out loud where this is
    going is the same habit as saying out loud what the tools do with your files
    - without letting it be the last word on the hub.

    Neither half is written here. The built half is `ordered`, the same tool
    list the hub and the footer are drawn from; the planned half is
    config/planned.toml. A tool that ships moves from one to the other by
    appearing in tools/ and leaving that file."""
    root = locale['site']
    roadmap = root['roadmap']

    # planned.toml stores each entry as a two-item array, which is compact to
    # write by hand and unusable in a template. Named here rather than in the
    # file so the file stays a list of names and descriptions.
    #
    # Built as a new list rather than by editing `planned` in place, and that is
    # not tidiness. The first version did edit it, and the same dict is handed
    # to every language in turn: the second language round found the arrays
    # already turned into tables, unpacked those tables into their own key
    # names, and rendered "name - desc" thirty-seven times down the page.
    # Nothing raised. The page just quietly stopped saying anything, in every
    # language but the first.
    groups = [
        {**group,
         'items': [{'name': name, 'desc': desc} for name, desc in group['items']],
         'built': []}
        for group in planned['group']
    ]

    # The shipped tools go into the group each one names, at the top of it, as
    # links. A group is then the whole story for that kind of file - what exists
    # and what is still to come - rather than two lists in different places that
    # a reader has to hold together in their head.
    by_group = {group['id']: group for group in groups}
    for tool in ordered:
        gid = tool.get('roadmap_group')
        if gid is None:
            raise sitelib.ConfigError(
                f'{tool["slug"]}: no roadmap_group, so it would appear nowhere on '
                f'the roadmap. Name one of: {", ".join(by_group)}')
        if gid not in by_group:
            raise sitelib.ConfigError(
                f'{tool["slug"]}: roadmap_group is {gid!r}, which is not a group in '
                f'config/planned.toml. Name one of: {", ".join(by_group)}')
        by_group[gid]['built'].append(tool)

    dest = out / links['roadmap']
    dest.mkdir(parents=True, exist_ok=True)

    context = frame(locale, locales, site, roadmap['slug'], '../', links, lang_v, {
        'planned': {**planned, 'group': groups},
        'planned_count': sum(len(group['items']) for group in groups),
        'built_count': len(ordered),
        'tools': ordered,
        'footer': footer,
        'css_href': f'../site.css?v={css_v}',
        'csp': sitelib.render_csp(root['csp']),
        'jsonld': sitelib.roadmap_jsonld(root),
    })
    context['ui'] = i18n.render_ui(templates, root['ui'], context,
                                   f'ui [{locale["lang"]}]')

    emit.html(dest / 'index.html', templates.render('roadmap.html', context))

    emit.js(dest / 'analytics.js', templates.render('analytics.js', {
        'site': root,
        'words': {'plural': 'files', 'analytics_extra': ''},
    }), where=f'{locale["prefix"]}{links["roadmap"]}/analytics.js')


def build_404(out, templates, locale, locales, site, tools, pages, css_v, lang_v,
              emit):
    """The page GitHub Pages returns for anything it cannot find.

    One file, at the root of the publishing source, per its documentation:
    docs.github.com -> Pages -> Creating a custom 404 page. For this site that
    root is the root of the dist branch, which is what the build writes.

    `base` is '/' rather than './' or '../'. Every other page here knows where
    it is standing; this one does not, because it is served at whatever address
    was asked for. A visitor who mistypes /compress-imag/ gets this file while
    the browser still believes it is in a folder of that name, so a relative
    link would resolve against a folder that does not exist and the error page
    would arrive unstyled. Absolute is the only form that works from every
    depth at once.
    """
    root = locale['site']
    links = locale_links(locale, site, pages)

    # Built from the English lists, because this is the English page, and every
    # link on it is root-absolute for the reason in the docstring above. `base`
    # is '/', so a slug appended to it is already the English address.
    footer = {
        'tools': [{'name': tool['name'], 'slug': tool['slug']} for tool in tools],
        'pages': [{'nav': page['nav'], 'slug': page['slug']}
                  for page in pages if page['kind'] == 'legal'],
    }

    context = frame(locale, locales, site, '', '/', links, lang_v, {
        'tools': [dict(tool, out_slug=tool['slug']) for tool in tools],
        'footer': footer,
        'css_href': f'/site.css?v={css_v}',
        'csp': sitelib.render_csp(root['csp']),
        # No hreflang set, deliberately. This file has no address of its own -
        # it is what a thousand wrong addresses return - so there is no page
        # for a German one to be the alternate of, and a set claiming otherwise
        # would be pointing every language at the same error page. The switcher
        # underneath still works: "take me to the German front door" is a
        # useful answer even where "this page in German" is not.
        'alternates': [],
    })
    context['ui'] = i18n.render_ui(templates, root['ui'], context,
                                   f'ui [{locale["lang"]}]')

    emit.html(out / '404.html', templates.render('404.html', context))


def write_tools_index(tools):
    """Write tools/README.md: the index GitHub shows when you browse to tools/.

    The one file this build writes back into the repository rather than into the
    output, and worth being deliberate about. It exists so that shipping a tool
    never means editing the repository README: a tool documents itself in its
    own folder, and the list of them is derived from the folders that exist
    rather than kept in step by hand.

    Rewritten only when it would actually change, so a build does not dirty the
    working tree for nothing.
    """
    lines = [
        '<!--',
        '  GENERATED FILE - do not edit. Written by build.py from the tool.toml of',
        '  every folder here, in the order the hub shows them.',
        '',
        '  It is generated so that shipping a tool never means editing a list kept',
        '  somewhere else. Each tool explains itself in its own README, beside its',
        '  own code; this is only the way in.',
        '-->',
        '',
        '# The tools',
        '',
        'One folder each, and each with its own README. Everything here runs in the',
        'browser and uploads nothing; how the site around them is built is in the',
        '[repository README](../README.md).',
        '',
        '| Tool | Lives at | What it does |',
        '|---|---|---|',
    ]
    for tool in tools:
        # A tagline is written as HTML, for the page. This is markdown, so
        # `&mdash;` arrives as an em dash rather than as five characters.
        tagline = html.unescape(tool['tagline'])
        lines.append(f'| [{tool["name"]}]({tool["slug"]}/) '
                     f'| `/{tool["slug"]}/` '
                     f'| {tagline} |')

    text = '\n'.join(lines) + '\n'
    path = TOOLS / 'README.md'
    if not path.is_file() or path.read_text(encoding='utf-8') != text:
        write(path, text)
        print(f'  wrote {path.relative_to(ROOT).as_posix()}')


def build_sitemap(out, templates, site, locales, tools, prose):
    """One sitemap for the whole domain, listing every published language.

    Published, not built. A locale still being translated is deliberately
    absent: it carries no hreflang tag pointing at it and no link in the
    switcher either, and a sitemap entry would be the one remaining way a
    crawler could still be told to go and index a page that is half in English.

    The order within a language is the order it always was - the hub, the
    tools, the guides, the roadmap, the legal pages - and the languages follow
    each other in the order locales/ sorts in, English first.

    Priority does not decay down the list. It says what a page is worth against
    the rest of the site, not against the rest of its own language: the German
    hub is as much a front door as the English one, and marking it lower would
    be saying the opposite of what the hreflang tags beside it say.
    """
    entries = []
    for locale in i18n.published(locales):
        def url(slug, locale=locale):
            return i18n.locale_url(locale, slug, site)

        # A page this language has not translated yet is built and readable,
        # but it is not listed here. Inviting a crawler to index an English
        # page sitting at a German URL is how a site ends up ranking its own
        # untranslated half for the wrong language, and it is the single
        # failure this whole arrangement exists to avoid.
        def ready(slug, locale=locale):
            return i18n.translated(locale, slug)

        if ready(''):
            entries.append({'url': url(''), 'lastmod': site['lastmod'],
                            'changefreq': 'weekly', 'priority': '1.0'})
        entries += [{'url': url(tool['slug']), 'lastmod': tool['lastmod'],
                     'changefreq': 'monthly', 'priority': '0.8'}
                    for tool in tools if ready(tool['slug'])]
        # Guides below the tools and above the legal pages. A tool is what
        # somebody came for; a guide is how they find out this site exists. The
        # index they are listed on goes first and slightly higher: it is the
        # page that gains from being crawled as a set rather than as nine
        # unrelated articles.
        if ready(site['guides']['slug']):
            entries.append({'url': url(site['guides']['slug']),
                            'lastmod': site['guides']['lastmod'],
                            'changefreq': 'monthly', 'priority': '0.7'})
        entries += [{'url': url(page['slug']), 'lastmod': page['lastmod'],
                     'changefreq': 'monthly', 'priority': '0.6'}
                    for page in prose
                    if page['kind'] == 'guide' and ready(page['slug'])]
        # The roadmap: a real page, but not one anybody searches for. Below the
        # guides, above the legal pages.
        if ready(site['roadmap']['slug']):
            entries.append({'url': url(site['roadmap']['slug']),
                            'lastmod': site['roadmap']['lastmod'],
                            'changefreq': 'monthly', 'priority': '0.5'})
        # The legal pages last, and low: they matter for trust, not for search.
        entries += [{'url': url(page['slug']), 'lastmod': page['lastmod'],
                     'changefreq': 'yearly', 'priority': '0.3'}
                    for page in prose
                    if page['kind'] == 'legal' and ready(page['slug'])]

    write(out / 'sitemap.xml', templates.render('sitemap.xml', {'pages': entries}))


def build_llms(out, templates, site, locales, tools, prose):
    """/llms.txt: the whole site as plain text, for a reader that gets one fetch.

    A search engine is handed a page of structured data per tool and has the
    patience to crawl all of them. An assistant deciding whether this site is
    worth mentioning at all does not - it fetches one address, and if that
    address does not say what the tools are and what they cannot do, it writes
    its own EXIF parser instead of linking to the page that already strips one.
    This is that address.

    Built from the same tool.toml files as the hub, the sitemap and
    tools/README.md, and in the same hub order, so it cannot fall behind the
    tools that exist. That is the whole reason it is generated rather than
    written: a hand-kept index of twenty-four tools is an index that is wrong.

    Two deliberate departures from every other generated file here:

      * No GENERATED FILE banner at the top. An llms.txt begins with an H1 by
        convention, and the readers of one are strict about that shape. The
        sentence saying the file is generated is the last paragraph of the
        intro instead, where it reads as a fact about the file rather than as a
        comment standing in front of it.
      * English only, and at the root. It is an index OF the site, not a page
        of it: the languages are a section inside it, and each hub linked from
        there carries the rest of that language on its own.

    Everything goes through site.to_text on the way in. This file is markdown,
    and the configs it is built from are HTML fragments full of &mdash; and
    <code>.
    """
    text = sitelib.to_text
    by_slug = {tool['slug']: tool for tool in tools}

    # The hub's categories, in the hub's order, carrying the hub's own note
    # about each - so a machine reading this groups the tools the same way a
    # visitor looking at the front page does.
    groups = []
    for category in site['hub']['categories']:
        listed = [by_slug[slug] for slug in category['order'] if slug in by_slug]
        if not listed:
            continue
        groups.append({
            'name': text(category['name']),
            'note': text(category['note']),
            # `schema.description` rather than the tagline. The tagline is
            # written to be read by somebody already looking at the page; this
            # is the sentence written to tell a machine what the tool does, and
            # it is the one that lets a task be matched to an address.
            'tools': [{'name': text(tool['name']),
                       'url': tool['url'],
                       'description': text(tool['schema']['description'])}
                      for tool in listed],
        })

    def entry(page):
        return {'name': text(page['heading']), 'url': page['url'],
                'description': text(page['description'])}

    guides = [entry(page) for page in prose if page['kind'] == 'guide']

    # A language is listed only if it has finished the frame AND its own hub -
    # the same test the sitemap and the hreflang tags are built from. Handing a
    # half-English hub to something that will quote it is the one failure worth
    # avoiding here, and it is avoided the way it is avoided everywhere else.
    # Named in English and described by the two things a machine wants next:
    # the word the language calls itself, which is what the switcher on the
    # site shows, and the hreflang code, which is how the addresses are keyed.
    # One shape for every line in the file, rather than a special one here.
    languages = [{'name': locale['name'],
                  'url': i18n.locale_url(locale, '', site),
                  'description': f'{text(locale["endonym"])} - {locale["hreflang"]}'}
                 for locale in i18n.published(locales, '')
                 if not locale['is_base']]

    optional = [
        {'name': text(site['guides']['nav']),
         'url': f'{site["domain"]}{site["guides"]["slug"]}/',
         'description': text(site['guides']['description'])},
        {'name': text(site['roadmap']['nav']),
         'url': f'{site["domain"]}{site["roadmap"]["slug"]}/',
         'description': text(site['roadmap']['description'])},
        {'name': site['source_label'],
         'url': site['source_url'],
         'description': text(site['llms']['source_note'])},
        {'name': 'Sitemap',
         'url': f'{site["domain"]}sitemap.xml',
         'description': text(site['llms']['sitemap_note'])},
    ]
    # The legal pages last, for the same reason the sitemap puts them last.
    optional += [entry(page) for page in prose if page['kind'] == 'legal']

    write(out / 'llms.txt', templates.render('llms.txt', {
        'site': site,
        # Trimmed here rather than in the template: these are TOML multi-line
        # strings, so each arrives with the newline its closing quotes sit on,
        # and the template spaces its own sections.
        'llms': {key: value.strip() for key, value in site['llms'].items()},
        # One line, whatever config/site.toml wrapped it as. It is a
        # blockquote, and a wrapped blockquote whose second line starts with
        # "- " is read as a list that ends the quote - which is exactly how
        # this one is worded.
        'summary': ' '.join(site['llms']['summary'].split()),
        'groups': groups,
        'guides': guides,
        'languages': languages,
        'optional': optional,
    }))


LINK = re.compile(r'(?:href|src)="([^"#?]+)(?:[#?][^"]*)?"')

SKIP_LINK = ('http://', 'https://', 'mailto:', 'data:', 'blob:', '//')


def check_links(out, locales, site):
    """Every link on a finished page has to lead to a page that was built.

    Added after two bugs that produced no error and no visible breakage, only
    pages that quietly pointed at the wrong thing:

      * a prose page counted the locale prefix as another level up, so every
        link built from `base` - the whole footer, the breadcrumb, the guides
        index - left the language it was rendered in and landed on the English
        equivalent. Nothing 404'd, because those pages exist.
      * a body.html reused as an English fallback inside a locale carries
        English slugs, so its cross-links point at addresses that language does
        not have.

      Both are the kind of thing that only shows up when somebody clicks, which
      on a translated page is somebody who does not read the language it went to.

    Only published locales are checked, and that is the point rather than a
    softening: an unfinished locale is still serving English bodies with English
    slugs in them, so broken cross-links are the expected state until it is
    translated. `complete = true` is the claim that the language is whole, and a
    link out of it that leads nowhere means it is not.
    """
    published = {locale['lang'] for locale in i18n.published(locales)
                 if not locale['is_base']}
    # The prefixes whose pages are still serving English bodies, and so are
    # expected to carry links this language does not have.
    unpublished = {f'{locale["lang"]}/' for locale in locales
                   if not locale['is_base'] and locale['lang'] not in published}

    broken = []
    for path in sorted(out.rglob('*.html')):
        rel = path.relative_to(out).as_posix()
        # Skip a locale that is not published yet, and the 404, whose links are
        # root-absolute for a reason templates/404.html explains.
        if rel == '404.html' or rel.startswith(tuple(unpublished)):
            continue

        text = path.read_text(encoding='utf-8')
        for href in LINK.findall(text):
            if href.startswith(SKIP_LINK) or not href:
                continue
            target = (out / href.lstrip('/')) if href.startswith('/') \
                else (path.parent / href)
            target = target.resolve()
            if target.is_dir():
                target = target / 'index.html'
            if not target.is_file():
                broken.append(f'{rel} -> {href}')

    if broken:
        shown = broken[:15]
        more = len(broken) - len(shown)
        tail = f'\n    ... and {more} more' if more > 0 else ''
        raise sitelib.ConfigError(
            f'{len(broken)} links lead to a page that was not built:\n    '
            + '\n    '.join(shown) + tail)


def copy_shared(out):
    """Everything in shared/ that is served as-is. shared/css and shared/js are
    not: they are inputs to what the build assembles, not files anyone fetches."""
    for path in sorted(SHARED.iterdir()):
        # shared/css feeds the stylesheets the build assembles, and shared/js is
        # copied into each tool's src/shared/ by build_tool - minified, cached by
        # that tool's service worker. Copying either here would publish a second,
        # raw copy at the site root that nothing references; site.css, lang.js
        # and feedback.js are written separately, minified, by the caller -
        # copying the source over one of them here would undo that.
        if path.name in ('css', 'js', 'site.css', 'lang.js', 'feedback.js'):
            continue
        if path.is_dir():
            shutil.copytree(path, out / path.name, dirs_exist_ok=True)
        else:
            shutil.copy2(path, out / path.name)


# ---------------------------------------------------------------------------


def write(path, text):
    """Always LF, always UTF-8. A build that produced CRLF on Windows and LF in
    CI would show every line of every file as changed on alternate deploys."""
    path.write_text(text if text.endswith('\n') else text + '\n',
                    encoding='utf-8', newline='\n')


class Emitter:
    """Writes the HTML, CSS and JavaScript, minified or not.

    One object rather than a flag threaded everywhere, because the two things
    that have to stay together - whether to minify, and what banner to leave
    behind when we do - belong together.

    The banner is the one comment minifying does not remove. A page that spends
    four links telling you to go and read the code should not then hand you a
    file with no way back to it, so every generated file keeps one line saying
    where it came from and how to prove it.
    """

    def __init__(self, minify_output, site, mangle_names=False):
        self.enabled = bool(minify_output)
        source = site['source_url']

        # Mangling is opt-in and needs esbuild at the pinned version. Resolved
        # once, here, so a missing or wrong esbuild stops the build before it
        # has written half a site rather than partway through.
        self.esbuild = None
        if mangle_names:
            if not self.enabled:
                raise mangle.MangleError(
                    '--mangle and --no-minify contradict each other: mangling is '
                    'minifying, and more of it.')
            pinned = site.get('build', {}).get('esbuild_version')
            if not pinned:
                raise mangle.MangleError(
                    'no esbuild_version pinned under [build] in config/site.toml, '
                    'so the build could not be reproduced from it.')
            self.esbuild = mangle.resolve(pinned)
            mangle.require_version(self.esbuild, pinned)
        # The same sentence in three comment syntaxes. Each minifier wraps it
        # itself, so what is kept here is the text with no delimiters on it.
        verify = (f'Built from {source} by build.py. '
                  f'Verify with: python build.py --check')
        self.js_banner = f'/* {verify} */'
        self.js_mangled_banner = f'/* {verify} (names mangled by esbuild) */'
        self.html_banner = f' {verify} '
        self.css_banner = f' {verify} '

    def html(self, path, text):
        write(path, minify.html(text, self.html_banner) if self.enabled else text)

    def js(self, path, text, where):
        write(path, self.js_text(text, where))

    def js_text(self, text, where):
        """Returns rather than writes, for the one script that is hashed before
        it is written - see the note beside lang.js in build(). Everything else
        goes through js() and never sees the string."""
        if self.esbuild:
            # esbuild does the whitespace as well as the names, so the Python
            # minifier stands aside rather than running first and being redone.
            return mangle.js(text, self.esbuild, self.js_mangled_banner, where)
        if self.enabled:
            return minify.js(text, self.js_banner, where)
        return text

    def css_text(self, text):
        """Returns rather than writes, because a stylesheet has to be hashed
        after minifying and before being written - the hash goes in the URL the
        page asks for it by."""
        return cssmin.css(text, self.css_banner) if self.enabled else text


def check_against_branch(out, branch='dist'):
    """Compare a fresh build with what is committed on the dist branch. This is
    the command the pages point at: it answers "is the deployed site really a
    build of these sources?", which matters more now that what is served is
    minified and no longer pleasant to read straight off.

    A fresh clone has the branch only as origin/dist, so try that too rather
    than shrugging and reporting success.
    """
    for ref_name in (branch, f'origin/{branch}'):
        found = subprocess.run(['git', 'rev-parse', '--verify', f'{ref_name}^{{tree}}'],
                               capture_output=True, text=True, cwd=ROOT)
        if found.returncode == 0:
            branch = ref_name
            break
    else:
        print(f'\n  no {branch} branch here to check against '
              f'(try: git fetch origin {branch})', file=sys.stderr)
        return 0

    differences = compare(out, branch)
    if differences:
        print(f'\n  {branch} is not this build ({len(differences)} files differ):',
              file=sys.stderr)
        for name in differences[:20]:
            print(f'    {name}', file=sys.stderr)
        if len(differences) > 20:
            print(f'    ... and {len(differences) - 20} more', file=sys.stderr)
        return 1
    print(f'\n  {branch} matches a fresh build of these sources')
    return 0


def compare(built, branch):
    """Which files differ between the build and a branch, by content.

    Read out of the object store rather than checked out into a worktree.
    Checking out runs the files through Git's end-of-line filters, and on a
    machine with core.autocrlf on that rewrites every text file on the way to
    disk - which made this report all sixty-odd files as changed when not one
    of them was. A blob id is the bytes as committed, and nothing can filter
    it on the way past.
    """
    listing = subprocess.run(['git', 'ls-tree', '-r', '-z', branch],
                             capture_output=True, text=True, cwd=ROOT, check=True)
    committed = {}
    for entry in listing.stdout.split('\0'):
        if not entry:
            continue
        info, path = entry.split('\t', 1)
        committed[path] = info.split()[2]

    fresh = {path.relative_to(built).as_posix(): blob_id(path)
             for path in built.rglob('*') if path.is_file()}

    names = sorted(set(committed) | set(fresh))
    return [name for name in names if committed.get(name) != fresh.get(name)]


def blob_id(path):
    """The id Git would give this file's contents: sha1 over the bytes with
    Git's blob header in front. The same rule Git uses, so the two are
    comparable without shelling out once per file."""
    data = path.read_bytes()
    return hashlib.sha1(b'blob %d\0' % len(data) + data).hexdigest()


if __name__ == '__main__':
    sys.exit(main())
