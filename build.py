#!/usr/bin/env python3
"""
Build the site into dist/.

    python build.py              build into dist/
    python build.py --clean      empty dist/ first
    python build.py --no-minify  leave the output readable, for debugging
    python build.py --check      build, then fail if dist/ differs from git's
                                 copy of the branch it is committed on
    python build.py --only <tool> --locale en --quiet
                                 one tool's page in one language, for looking
                                 at while working on it - see "A scoped build"

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

Identifiers are not renamed. Minifying stops at whitespace, comments and the
things that can be proved not to change what runs, so a reader who opens a file
on the deployed site finds the same statements in the same order under the same
names they have in this repository. That is the whole bargain: this site asks to
be checked, and a served file whose every name has been replaced by a letter
cannot be read against its source by anybody.

It is also what makes `--check` mean something without help. One command, no
esbuild, nothing pinned, nothing installed: build it and diff it against the
branch that is being served.

A SCOPED BUILD

`--only` and `--locale` narrow what gets written, for the case that is most of
the work and none of the interest: changing one tool and wanting to look at it.
A full build writes about twelve hundred pages in every language the site has,
and all but one of the tools in it are not the one being worked on.

What they narrow is only what is WRITTEN. Everything is still loaded, every
language is still surveyed, and each page is still rendered knowing every other
language it exists in - so a page built this way is the same bytes as the same
page in a full build, and something that looks right in a scoped build looks
right in the deployed one. That is the property worth having; a preview that
were rendered against a shortened list of languages would differ from the real
page in its hreflang set and its switcher, which is exactly where a mistake
would hide.

What a scoped build is NOT is a site. The pages that list other pages - the
hub, the guides index, the roadmap, the 404, the sitemap, the feeds - are left
unwritten rather than written wrong, and the link check is skipped, because
every link to a page the scope left out would be reported broken and none of
them would be. So this is for looking at a page, and `--check` refuses to work
with it.

The build never reaches the network, whichever way it runs.
"""

import argparse
import html
import os
import posixpath
import re
import shutil
import sys
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from buildlib import cards
from buildlib import catalogue
from buildlib import cssmin
from buildlib import i18n
from buildlib import icons as iconlib
from buildlib import imports
from buildlib import minify
from buildlib import screens
from buildlib import site as sitelib
from buildlib.deployed import check_against_branch
# LINK comes from the emitter because that is what gathers a page's links, on
# the way past as it writes; check_links borrows the pattern for the one path
# where it has to re-read a finished page instead. See buildlib/emit.py.
from buildlib.emit import Emitter, LINK, write
from buildlib.template import Loader, TemplateError

ROOT = Path(__file__).parent.resolve()
TEMPLATES = ROOT / 'templates'
CONFIG = ROOT / 'config'
TOOLS = ROOT / 'tools'
PAGES = ROOT / 'pages'
SHARED = ROOT / 'shared'
LOCALES = ROOT / 'locales'


def main(argv=None):
    # This build writes pages whose paths are not ASCII - ar/, ja/, zh/ and the
    # translated slugs under them - and then prints every one of them. On a
    # console whose encoding is not UTF-8, which is the default on a good many
    # Windows installations, printing the first Arabic path raises
    # UnicodeEncodeError.
    #
    # The failure is worse than it sounds, because by then the build has
    # already finished: every page is written and correct, and the process dies
    # on the report. Anything reading the exit code - serve.ps1 refuses to
    # start the server, CI would call it a failed build - sees a build that
    # failed, and the only clue is a traceback about a codec.
    #
    # Replacing rather than raising: a path that cannot be spelled in the
    # console's encoding is a cosmetic problem with one line of a listing, and
    # never a reason to fail a build that has already succeeded.
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, 'reconfigure'):
            stream.reconfigure(encoding='utf-8', errors='replace')

    parser = argparse.ArgumentParser(description=__doc__.split('\n')[1])
    parser.add_argument('--out', default='dist', help='where to write (default: dist)')
    parser.add_argument('--clean', action='store_true', help='empty the output first')
    parser.add_argument('--no-minify', dest='minify', action='store_false',
                        help='leave the output readable, for debugging')
    parser.add_argument('--check', action='store_true',
                        help='fail if the output differs from the committed dist branch')
    parser.add_argument('--jobs', type=int, default=0, metavar='N',
                        help='languages to build at once (default: one per core, '
                             '1 to build them one at a time)')
    parser.add_argument('--only', action='append', metavar='SLUG',
                        help='build only this tool, and none of the pages that '
                             'list it (repeatable)')
    parser.add_argument('--locale', action='append', metavar='LANG', dest='langs',
                        help='build only this language (repeatable)')
    parser.add_argument('--quiet', action='store_true',
                        help='say how many pages were written rather than naming '
                             'every one')
    args = parser.parse_args(argv)

    out = (ROOT / args.out).resolve()
    # 0 means "decide for me". Written as a number rather than as None so that
    # --jobs 1 is a thing somebody can ask for and get: the languages build one
    # after another, which is what to reach for when a traceback from inside a
    # worker process is harder to read than the bug it is describing.
    args.jobs = args.jobs if args.jobs > 0 else (os.cpu_count() or 1)

    # --check compares a build with the whole deployed branch, so it cannot be
    # given half a build to compare: every page the scope left out would come
    # back as a file the branch has and this build does not, and the report
    # would be a list of things that are not wrong. Refused here rather than
    # explained in the diff.
    if args.check and (args.only or args.langs):
        print('build failed: --check compares against the whole deployed site, '
              'so it cannot be combined with --only or --locale.', file=sys.stderr)
        return 1

    try:
        pages = build(out, clean=args.clean, minify_output=args.minify,
                      jobs=args.jobs, only=args.only, langs=args.langs)
    except (sitelib.ConfigError, TemplateError, minify.MinifyError,
            cssmin.CssError) as err:
        print(f'build failed: {err}', file=sys.stderr)
        return 1

    print(f'\n  {len(pages)} pages -> {out}')
    if not args.quiet:
        for page in pages:
            print(f'    {page}')

    if args.check:
        return check_against_branch(out)
    return 0


def build(out, clean=False, minify_output=True, jobs=None, only=None,
          langs=None):
    """Everything, into `out`. `only` and `langs` narrow what is written to the
    named tools and the named languages - see "A scoped build" above."""
    only = set(only) if only else None
    langs = set(langs) if langs else None
    scoped = bool(only or langs)

    if clean and out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True, exist_ok=True)

    templates = Loader(TEMPLATES)
    site = sitelib.load_toml(CONFIG / 'site.toml')
    emit = Emitter(minify_output, site)
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
    handoff_js = emit.js_text(
        (SHARED / 'handoff.js').read_text(encoding='utf-8'), 'shared/handoff.js')
    handoff_v = sitelib.text_hash(handoff_js)

    # What a language switch carries across with it - the chosen files and the
    # settings the visitor moved. Served and hashed like the three above, and
    # for the same reason: it lives at the root, every tool page in every
    # language asks for the same copy, and a version in the URL is what gets a
    # change past a service worker that was told to cache whatever it is asked
    # for.
    keep_js = emit.js_text(
        (SHARED / 'lang-keep.js').read_text(encoding='utf-8'), 'shared/lang-keep.js')
    keep_v = sitelib.text_hash(keep_js)


    # The eight lines that register the front page's service worker. Written
    # here rather than into each language because there is nothing in it that
    # differs between them: `register('sw.js')` resolves against the page that
    # loaded the script, so this one file registers /sw.js for the hub at the
    # root and /de/sw.js for the hub at /de/. A tool page does not load it - it
    # registers its own worker from main.js, where there is an indicator to tell
    # about it.
    offline_js = emit.js_text(
        (TEMPLATES / 'offline.js').read_text(encoding='utf-8'), 'templates/offline.js')
    offline_v = sitelib.text_hash(offline_js)

    # The hub's filter, hashed and served from the root like the four above and
    # for the same reason. Only the front page of each language loads it, and
    # every one of those loads the same bytes: what it reads is the cards in
    # the page it finds itself in, so there is nothing in it that differs
    # between languages and no reason to write a copy per language.
    filter_js = emit.js_text(
        (SHARED / 'hub-filter.js').read_text(encoding='utf-8'), 'shared/hub-filter.js')
    filter_v = sitelib.text_hash(filter_js)

    planned = sitelib.load_toml(CONFIG / 'planned.toml')

    tools = [sitelib.load_tool(path, site)
             for path in sorted(TOOLS.glob('*/tool.toml'))]
    if not tools:
        raise sitelib.ConfigError(f'no tools found under {TOOLS}')

    # The drawn mark each tool wears, read off shared/icons once and hung on the
    # tool itself. It travels with the tool from here - onto its own page, onto
    # its card on the hub, onto the neighbour tiles at the foot of every other
    # tool, and into the 404 - so there is no second place that has to be told
    # which icon this tool uses. `glyph` names the file; `glyph_svg` is the
    # geometry inside it, and the <svg> around that is written by whichever
    # template is placing it, at whatever size that page wants.
    glyphs = iconlib.load_all(ROOT, [tool['glyph'] for tool in tools])
    for tool in tools:
        tool['glyph_svg'] = glyphs[tool['glyph']]

    # A tool may declare `handoff` targets - the tools its finished result can
    # be carried straight into (see shared/handoff.js). Checked here the way
    # roadmap_group is checked elsewhere: against the tools that exist, before
    # anything renders, with the file named.
    slugs = {tool['slug'] for tool in tools}
    for tool in tools:
        for target in tool.get('handoff', []):
            if target == tool['slug']:
                raise sitelib.ConfigError(
                    f'{tool["slug"]}: handoff names itself.')
            if target not in slugs:
                raise sitelib.ConfigError(
                    f'{tool["slug"]}: handoff names {target!r}, which is not a '
                    'tool. Name a folder under tools/.')

    # A misspelled --only would otherwise build nothing at all and say it had
    # succeeded, which is the one answer a scoped build must never give: the
    # page looks unchanged because it was never written. Checked against the
    # tools that exist, here, where that list is.
    if only:
        unknown = sorted(only - slugs)
        if unknown:
            raise sitelib.ConfigError(
                f'--only names {", ".join(unknown)}, which is not a tool here. '
                f'The tools are: {", ".join(sorted(slugs))}')

    # Nothing is bundled, so the browser fetches every module by the name an
    # import gives it. A specifier naming a file this tool does not ship is
    # therefore not a build error but a 404 on the visitor's machine, after the
    # page has rendered - and the commonest cause is a shared module that needs
    # a second shared module the tool never asked for in js_parts. Checked
    # here, once per tool, rather than in build_tool: the modules are copied
    # byte for byte into every language, so asking again per locale was
    # re-reading and re-parsing every file for an answer that cannot change.
    # See buildlib/imports.py.
    #
    # The sources are in hand here anyway, so this is also where the emitter's
    # cache is filled - every module and every tool stylesheet minified once,
    # in this process, before the language workers are forked with a copy of
    # the warmed cache. The languages then emit these same bytes fifteen ways
    # without one of them minifying anything a sibling already has.
    #
    # This is also most of what a scoped build saves. Reading and minifying
    # every module of every tool is the largest fixed cost the build has, and
    # nearly all of it is work on tools the run is not going to write. The
    # import check goes with it, which is a real check being skipped - but it
    # is a check on tools this run does not touch, and CI runs the whole build
    # on every push.
    for tool in tools:
        if only and tool['slug'] not in only:
            continue
        sources = {name: path.read_text(encoding='utf-8')
                   for name, path in tool_assets(tool)}
        imports.check(set(sources), sources.__getitem__, tool['slug'])
        for name, text in sources.items():
            emit.js_text(text, f'{tool["slug"]}/{name}')
        emit.css_text(tool_css(tool))

    # ** rather than *, because a guide lives at pages/guides/<slug>/ and a
    # legal page at pages/<slug>/. The slug in each page.toml has to match the
    # folder either way, so a page cannot end up at a URL nobody wrote down.
    prose = [sitelib.load_page(path, site, PAGES)
             for path in sorted(PAGES.glob('**/page.toml'))]

    # The screenshots each guide carries, measured here and carried on the page
    # from now on. Every language shows the same pictures, so measuring them
    # inside the languages would be reading the same headers fifteen times to
    # get the same answer - and build_locale re-reads no source file, which is
    # the rule that keeps the languages from having anything to race over.
    for page in prose:
        page['shots'] = screens.sizes(page)

    # Every language this site is written in, English first. English is the
    # sources themselves rather than a folder under locales/ - buildlib/i18n.py
    # says why at length, and the short version is that a translation of English
    # into English is a copy free to drift from what it was copied out of.
    locales = i18n.load_locales(LOCALES, site)
    for locale in locales:
        i18n.check_slugs(locale, [tool['slug'] for tool in tools],
                         [page['slug'] for page in prose], site)

    # Same reasoning as --only above: a language named that does not exist has
    # to say so rather than quietly write nothing.
    if langs:
        known = {locale['lang'] for locale in locales}
        unknown = sorted(langs - known)
        if unknown:
            raise sitelib.ConfigError(
                f'--locale names {", ".join(unknown)}, which is not a language '
                f'here. The languages are: {", ".join(sorted(known))}')

    # Which languages this run writes, as against every language the site has.
    # Only the first list is looped over below; the second is what every page is
    # rendered against, and passing it whole is what keeps a scoped page's
    # hreflang set and language switcher identical to a full build's.
    targets = [locale for locale in locales
               if not langs or locale['lang'] in langs]

    # Before anything is written, because rendering one page needs to know which
    # OTHER languages have finished that same page - the hreflang set on the
    # English tool page is the set of languages it exists in. English is
    # rendered first, so if the answer were worked out as each language went by,
    # English would be asking the question before any language had answered it,
    # and would advertise a German page that is still English.
    i18n.survey(locales, tools, prose, planned, site)

    # One language at a time, or several at once. Each call writes only under
    # its own out/<lang>/ - English at the root - and re-reads nothing, so the
    # languages have nothing to say to each other and nothing to race over. The
    # files that belong to the site rather than to a language are written
    # outside this, below.
    #
    # Order is preserved by walking the futures in the order they were
    # submitted rather than as they finish, because `written` becomes the
    # printed list and a build that reports its pages in a different order
    # every time is a build that looks different every time.
    written = []
    page_links = {}

    if jobs == 1 or len(targets) < 2:
        for locale in targets:
            done, links = build_locale(out, templates, locale, locales, site,
                                       tools, prose, planned, css_v, lang_v,
                                       feedback_v, handoff_v, keep_v,
                                       offline_v, filter_v, site_css, emit, only)
            written += done
            page_links.update(links)
    else:
        with ProcessPoolExecutor(max_workers=jobs) as pool:
            pending = [
                pool.submit(build_locale, out, templates, locale, locales, site,
                            tools, prose, planned, css_v, lang_v, feedback_v,
                            handoff_v, keep_v, offline_v, filter_v, site_css, emit, only)
                for locale in targets
            ]
            for future in pending:
                done, links = future.result()
                written += done
                page_links.update(links)

    # After every locale, because a locale only counts as finished once every
    # page in it has been rendered and had the chance to fall back. Raising
    # here rather than at load time is what makes the report a list of
    # everything still to translate instead of the first thing missing.
    for locale in targets:
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
    for locale in targets:
        if locale['is_base']:
            continue
        # A scoped run built some of this language's pages, so counting the ones
        # it did not build as still in English would be counting its own scope.
        if scoped:
            continue
        if not locale['complete']:
            left = len(set(i18n.all_debt(locale)))
            print(f'  {locale["lang"]}: {left} strings still in English '
                  f'(not advertised until complete = true)')
            continue
        behind = i18n.debt_report(locale, tools, prose)
        if behind:
            # A locale with `fallback` set shows its near relative's words on
            # a page it has not translated itself, not English's - see
            # buildlib/i18n.py. The count and the pages are the same either
            # way: what changes is only what a reader sees while they wait.
            near = locale['fallback_locale']
            shows = f'still falling back to {near["lang"]}' if near else 'still in English'
            print(f'  {locale["lang"]}: published, {len(behind)} of '
                  f'{len(tools) + len(prose)} pages {shows} '
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
    # About and Contact between the guides and the legal pages, which is where
    # they sit in the footer and in the sitemap too. They are not written to be
    # searched for the way a guide is, and they are not the small print either.
    ordered_prose += [page for page in prose if page['kind'] == 'site']
    ordered_prose += [page for page in prose if page['kind'] == 'legal']

    # tools/README.md, from the English list and only once. It is a file in the
    # repository rather than a page of the site - the index GitHub shows when
    # somebody browses to tools/ - so it has no language to be written in and
    # no locale to be written per.
    write_tools_index(ordered_tools)

    # The files that describe the whole site rather than a page of it. A scoped
    # run has not built the whole site, so each of these would be a true
    # statement about a site that does not exist in this directory: a sitemap
    # naming pages nothing wrote, a 404 whose links lead nowhere. Left unwritten
    # rather than written wrong.
    if not scoped:
        build_404(out, templates, base, locales, site, ordered_tools,
                  ordered_prose, css_v, lang_v, emit)
        written.append('404.html')

        # After the 404 and deliberately not passed it: the 404 has no address
        # of its own to list, and inviting a crawler to index it would be
        # inviting it to serve "not found" in place of a real page.
        catalogue.build_sitemap(out, templates, site, locales, tools,
                                ordered_prose)
        written.append('sitemap.xml')

        # And the same site again, in plain text, for something that reads one
        # file and decides from it whether any of this is worth mentioning.
        # Built from the same list as the sitemap above and holding back the
        # same languages.
        catalogue.build_llms(out, templates, site, locales, ordered_tools,
                             ordered_prose)
        written.append('llms.txt')

        # And once more as a stream, for a reader who wants to be told when a
        # tool ships rather than to come back and check. One file per published
        # language, so this adds a name per locale rather than a single one.
        catalogue.build_feeds(out, templates, site, locales, ordered_tools,
                              ordered_prose)
        written += [f'{locale["prefix"]}feed.xml'
                    for locale in i18n.published(locales)]

    copy_shared(out)
    copy_screens(out, prose)
    write(out / 'site.css', site_css)
    write(out / 'lang.js', lang_js)
    write(out / 'offline.js', offline_js)
    write(out / 'hub-filter.js', filter_js)
    write(out / 'feedback.js', feedback_js)
    write(out / 'handoff.js', handoff_js)
    write(out / 'lang-keep.js', keep_js)

    # Last, because a link is only checkable once everything it could point at
    # has been written. The pages the parent wrote itself - the 404 - joined
    # page_links as they were emitted, the same way the workers' pages did.
    page_links.update({path.relative_to(out).as_posix(): found
                       for path, found in emit.page_links.items()})

    # Every link on a scoped build's pages that points at a page the scope left
    # out is a link to a file that is not there, and every one of them is fine.
    # Checking anyway would report the scope as a few hundred broken links and
    # bury a real one among them, so this says what it did not do instead.
    if scoped:
        print('\n  scoped build: the hub, the guides, the roadmap, the 404, the '
              'sitemap and the feeds were not written, and links were not '
              'checked. Use a full build before trusting any of those.')
    else:
        check_links(out, locales, site, page_links)
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
                 css_v, lang_v, feedback_v, handoff_v, keep_v, offline_v,
                 filter_v, site_css, emit, only=None):
    """The whole site, in one language, under out/<lang>/ - or at the root of
    out/ for English, whose pages keep the addresses they have always had.

    `only` is a set of tool slugs, from --only, and narrows that to those tools'
    pages. The narrowing is the last thing that happens: every tool and every
    page is still localized and every list is still worked out from all of them,
    because the footer, the "Also in the box" ring and the guide each tool links
    to are all facts about the whole site and have to read the same on a scoped
    page as on a full one.

    Nothing here re-reads a source file. The tools and the prose pages were
    loaded once, in English, and are localized into copies, so each language
    costs a render rather than a parse - and, more to the point, a
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
    # And this language's Contact page, which the Organization node names as
    # the place to reach a person. Same reason as the three above: pointing a
    # Japanese reader at an English contact page is the kind of small wrongness
    # that the whole per-locale arrangement exists to avoid. The slug comes
    # from config/site.toml rather than being written here, so the page can be
    # renamed in one place - the same rule `safety_guide` follows.
    root['contact_url'] = i18n.locale_url(
        locale, site['publisher']['contact_slug'], site)

    ltools = [i18n.localize_tool(tool, locale, site) for tool in tools]
    lprose = [i18n.localize_page(page, locale, site) for page in prose]
    by_slug = {tool['slug']: tool for tool in ltools}

    guides = [page for page in lprose if page['kind'] == 'guide']
    about = [page for page in lprose if page['kind'] == 'site']
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
        'pages': [{'nav': page['nav'], 'slug': page['out_slug']}
                  for page in about + legal],
    }

    links = locale_links(locale, site, lprose)

    written = []
    for tool in ltools:
        if only and tool['slug'] not in only:
            continue
        build_tool(dest_root, templates, locale, locales, site, tool, footer,
                   links, lang_v, feedback_v, handoff_v, keep_v,
                   guide_of.get(tool['slug'], {}),
                   related_of.get(tool['slug'], []),
                   [by_slug[s] for s in tool.get('handoff', [])], emit)
        written.append(f'{locale["prefix"]}{tool["out_slug"]}/index.html')

    # Everything below is the language's own pages rather than its tools, and
    # --only asked for a tool. The guides alone outnumber the tools, so this is
    # where the rest of a scoped build's time goes.
    if only:
        scoped_links = {path.relative_to(out).as_posix(): found
                        for path, found in emit.page_links.items()}
        emit.page_links.clear()
        return written, scoped_links

    # Old addresses that moved. A static host cannot answer 301, so the page
    # that used to be at the address says where the tool went and sends the
    # browser on. Only written where the address actually changed: a locale
    # whose slug for the tool survived the rename keeps its address, and a
    # stub there would shadow nothing and help nobody.
    # Not appended to `written`: that list is the site's pages, and a stub is
    # a signpost rather than a page - it carries no frame, asks for no script,
    # and must stay out of the sitemap, which is exactly what the tests hold
    # every entry in the list to.
    for old_slug, new_slug in site.get('redirects', {}).items():
        target = by_slug.get(new_slug)
        if target is None or target['out_slug'] == old_slug:
            continue
        build_redirect(dest_root, locale, site, old_slug, target)

    for page in lprose:
        build_page(dest_root, templates, locale, locales, site, page, footer,
                   links, css_v, lang_v, by_slug, emit)
        written.append(f'{locale["prefix"]}{page["out_slug"]}/index.html')

    build_guides(dest_root, templates, locale, locales, site, groups,
                 ordered_guides, footer, links, css_v, lang_v, emit)
    written.append(f'{locale["prefix"]}{links["guides"]}/index.html')

    build_hub(dest_root, templates, locale, locales, site, by_slug, footer,
              links, css_v, lang_v, offline_v, filter_v, site_css, emit)
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

    # The links of every page this call wrote, keyed the way check_links names
    # pages, carried back so the check never re-opens what was just written.
    # Cleared as well as read: when the languages build one at a time they
    # share one emitter, and one language's pages are not another's.
    links = {path.relative_to(out).as_posix(): found
             for path, found in emit.page_links.items()}
    emit.page_links.clear()
    return written, links


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
        # This language's feed, and empty for a language that has none. Only a
        # published locale gets one built, so offering the link from an
        # unpublished one would point at a file that is not there - the same
        # trap the hreflang set avoids by being built from published() too.
        'feed_href': (f'/{locale["prefix"]}feed.xml'
                      if locale['is_base'] or locale['complete'] else ''),
        'feed_title': locale['site']['name'],
    }
    context.update(extra or {})
    return context


# The islands of a tool page whose links keep replacing it: the language
# switchers, whose links ARE this page in another tongue and would only be
# duplicated by a second tab; and the carry-on row, whose click is taken over
# by shared/handoff.js to walk the result into the next tool.
KEEPS_ITS_TAB = re.compile(
    r'<details class="lang-pick".*?</details>'
    r'|<nav class="lang-switch".*?</nav>'
    r'|<div class="lang-auto".*?</div>'
    r'|<nav class="handoff".*?</nav>', re.S)

LEAVING_ANCHOR = re.compile(r'<a\s[^>]*>')


def open_links_elsewhere(html):
    """Make every link away from a tool page open in a new tab.

    A tool page holds work in progress - a file loaded, marks placed, a result
    computed - and any link that replaces the page throws that work away. So
    on this one kind of page, leaving happens elsewhere. Done to the rendered
    page rather than written into the markup, because the links live in
    fifteen languages of prose - tool.toml answers, translated overrides, the
    shared footer - and an attribute kept by hand across all of them is a rule
    nobody could keep. The exemptions and their reasons sit on KEEPS_ITS_TAB;
    beyond those, an anchor is left alone when it has no href to leave by,
    already says target, stays on the page (#), starts a download, or opens a
    mail client rather than a page.
    """
    def fix(match):
        tag = match.group(0)
        if ('href=' not in tag or 'target=' in tag or 'href="#' in tag
                or 'href="mailto:' in tag or re.search(r'\sdownload[\s>=]', tag)):
            return tag
        return tag[:-1] + ' target="_blank" rel="noopener">'

    out, last = [], 0
    for kept in KEEPS_ITS_TAB.finditer(html):
        out.append(LEAVING_ANCHOR.sub(fix, html[last:kept.start()]))
        out.append(kept.group(0))
        last = kept.end()
    out.append(LEAVING_ANCHOR.sub(fix, html[last:]))
    return ''.join(out)


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
               lang_v, feedback_v, handoff_v, keep_v, guide, related, handoff,
               emit):
    root = locale['site']
    dest = out / tool['out_slug']
    dest.mkdir(parents=True, exist_ok=True)

    # The app code. Every module keeps its own file and its own name; only the
    # comments and the indentation come out. See buildlib/minify.py. The
    # imports were already checked, once, in build() - the modules are the
    # same bytes in every language, so the answer is too.
    src_dir = tool['dir'] / 'src'
    assets = tool_assets(tool)

    emitted = []
    for name, path in assets:
        (dest / name).parent.mkdir(parents=True, exist_ok=True)
        emitted.append((name, emit.js(
            dest / name, path.read_text(encoding='utf-8'),
            where=f'{locale["prefix"]}{tool["out_slug"]}/{name}')))

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

    # The explanation each step opens with, folded behind that step's heading.
    # Done here rather than in five hundred bodies, one per tool per language,
    # which would all be saying the same thing about the same paragraph. See
    # buildlib/cards.py.
    body = cards.fold_ledes(body)

    # Setting [picker.urls] ships the module, the stylesheet and the widened
    # img-src. If the panel itself were then left off the page, the tool would
    # carry a network permission it never uses - which is exactly the kind of
    # quiet over-reach the policy is written down to prevent.
    if sitelib.wants_urls(tool) and 'id="url-panel"' not in body:
        raise sitelib.ConfigError(
            f'{tool["slug"]}: [picker.urls] is set, so this page is built with the '
            'network permission the importer needs, but body.html never includes '
            '{% include "partials/url-import.html" %}. Add it, or drop [picker.urls].')

    page = emit.html(dest / 'index.html', open_links_elsewhere(templates.render(
        'tool.html', frame(locale, locales, site, tool['slug'], '../', links, lang_v, {
            'tool': tool,
            'guide': guide,
            'related': related,
            'ui': ui,
            'modules': [name for name, _ in assets],
            'footer': footer,
            'csp': sitelib.render_csp(root['csp'], root.get('app_csp', {}),
                                      root.get('tool_csp', {}),
                                      sitelib.picker_csp(tool), tool['csp']),
            'css_href': css_href,
            # Root-absolute and versioned, exactly like lang_href beside it and
            # for the same cache reason. Only a tool page asks for this one.
            'feedback_href': f'/feedback.js?v={feedback_v}',
            # The carry-the-result-on row and its script. The row renders only
            # where tool.toml declares targets; the script goes on every tool
            # page, because the receiving half is what feeds a carried file
            # through the picker. See shared/handoff.js.
            'handoff': handoff,
            'handoff_href': f'/handoff.js?v={handoff_v}',
            # The work already on the page when somebody changes the language.
            # Every tool page, in every language, because either side of a
            # switch can be the one doing the carrying. See shared/lang-keep.js.
            'keep_href': f'/lang-keep.js?v={keep_v}',
            'jsonld': sitelib.tool_jsonld(root, tool),
            'body': body,
        }))))

    css = write(dest / 'styles.css', css)

    analytics = emit.js(dest / 'analytics.js', templates.render('analytics.js', {
        'site': root,
        'words': tool['words'],
    }), where=f'{locale["prefix"]}{tool["out_slug"]}/analytics.js')

    # What makes the tool installable, and the only file here a browser reads
    # before the page rather than because of it. It is written per language, so
    # the app the German page installs is called what the German page calls it,
    # and it is scoped to this folder - the front page has its own, scoped to the
    # language root, and build_hub says how the two sit together.
    manifest = write(dest / 'manifest.json',
                     sitelib.app_manifest(root, tool['url'], tool['name'],
                                          tool['tagline'], locale['dir'],
                                          root['manifest']['tool_icons']))

    # The service worker caches './', its own src/*.js, analytics.js and the
    # manifest. The list is derived from what was just emitted rather than
    # written down, so a new module is cached the moment it exists.
    #
    # Hashed from the files as emitted, not as authored: minifying changes the
    # bytes a browser receives, so turning it on or off has to invalidate the
    # cache. Hashing the sources instead would leave a visitor holding the old
    # copy of a file that had genuinely changed. The texts are the returns of
    # the writes above - the same bytes the files hold - so nothing written a
    # moment ago is opened again just to be hashed. The vendored files were
    # never emitted, only copied, so theirs are read from where they live.
    cached = ([('index.html', page), ('styles.css', css),
               ('analytics.js', analytics), ('manifest.json', manifest)]
              + emitted
              + [(name, (tool['dir'] / name).read_bytes()) for name in vendored])
    emit.js(dest / 'sw.js', templates.render('sw.js', {
        'words': tool['words'],
        'assets': (['index.html', css_href, 'manifest.json']
                   + [name for name, _ in assets] + vendored),
        'cache_scope': f'/{locale["prefix"]}{tool["out_slug"]}/',
        'cache_hash': sitelib.cache_hash(cached),
    }), where=f'{locale["prefix"]}{tool["out_slug"]}/sw.js')

    # Required, not optional. templates/tool.html writes og:image and
    # twitter:image on every tool page whether or not the file is there, and
    # check_links only reads <a href>, so a tool without one used to build
    # clean and serve a share card that 404s - in every language, and visible
    # only to whoever pasted the link somewhere. Draw it with
    # `.\og-image.ps1 -Only <slug>`.
    og = tool['dir'] / 'og.png'
    if not og.is_file():
        raise sitelib.ConfigError(
            f'{tool["slug"]}: no og.png. Every tool page claims one in its '
            f'og:image; draw it with .\\og-image.ps1 -Only {tool["slug"]}')
    shutil.copy2(og, dest / 'og.png')

    # And the icons the tool installs as, for the same reason and with the same
    # failure: the manifest beside them names both whether or not they exist, and
    # a manifest naming an icon that 404s is a browser that quietly declines to
    # offer the install. Which files those are is config/site.toml's business
    # rather than this function's, so the list is read from there.
    for icon in root['manifest']['tool_icons']:
        source = tool['dir'] / icon['src']
        if not source.is_file():
            raise sitelib.ConfigError(
                f'{tool["slug"]}: no {icon["src"]}. Its manifest claims one, so a '
                'browser would refuse to install the tool; draw it with '
                f'.\\og-image.ps1 -Icons -Only {tool["slug"]}')
        shutil.copy2(source, dest / icon['src'])


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


def tool_assets(tool):
    """The JavaScript this tool ships, as (path in dist, source file) pairs.

    Shared modules land in src/shared/ rather than beside the tool's own
    files, so that an import in main.js says where the thing came from. A tool
    folder in dist/ is still complete on its own - nothing is bundled, nothing
    is fetched from a neighbour, and the service worker caches these exactly
    like the rest.

    The order is the service worker's asset list, so it is part of the bytes
    the build emits and not free to change: shared modules first, then the
    tool's own, each half sorted by name.
    """
    src_dir = tool['dir'] / 'src'
    if not src_dir.is_dir():
        raise sitelib.ConfigError(f'{tool["slug"]}: no src/ folder')
    own = sorted(src_dir.glob('*.js'))
    if not any(path.name == 'main.js' for path in own):
        raise sitelib.ConfigError(f'{tool["slug"]}: src/main.js is required')

    assets = [(f'src/shared/{path.name}', path) for path in shared_js(tool)]
    assets += [(f'src/{path.name}', path) for path in own]
    return assets


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

    # How many tools there are, for the one page that says so out loud. Worked
    # out here rather than written into fifteen translations of one sentence,
    # because a number in prose is a number that goes stale: this one read
    # thirty-six in every language at once, in the description a search engine
    # quotes as well as in the paragraph, until there were forty of them.
    #
    # `by_slug` is every tool the site has rather than the ones this run
    # writes: build_language works its lists out before --only narrows
    # anything, because the footer and the "Also in the box" ring are facts
    # about the whole site. So the number is the site's and not the run's -
    # which matters here because a scoped build writes no prose page at all,
    # and the first one that did would otherwise have counted its own scope.
    #
    # It reaches the page as an ordinary template name for the reason
    # i18n.render_ui gives about the [ui] strings: a translator who mistypes
    # {{ tool_count }} gets a build that fails naming the string, rather than a
    # published sentence with a hole in the middle of it.
    counts = {'tool_count': len(by_slug)}
    where = f'pages/{page["slug"]} [{locale["lang"]}]'

    # The head strings go through the engine too, and before the JSON-LD is
    # built from them, so the count a search result shows is the same number as
    # the page under it.
    page = {**page,
            **{key: templates.render_source(page[key], f'{where} {key}', counts)
               for key in ('description', 'og_description') if key in page}}

    body = templates.render_source(
        i18n.body_for(locale, 'pages', page['slug'],
                      body_path.read_text(encoding='utf-8')),
        f'{where} body.html',
        {'site': root, 'page': page, 'base': up, 'links': links, **counts})

    context = frame(locale, locales, site, page['slug'], up, links, lang_v, {
        'page': page,
        'tool': by_slug.get(page['tool'], {}),
        'crumbs': crumbs,
        'main_class': 'legal' if page['kind'] == 'legal' else 'prose',
        'footer': footer,
        'css_href': f'{up}site.css?v={css_v}',
        'jsonld': sitelib.page_jsonld(root, page),
        'csp': sitelib.render_csp(root['csp']),
        # The screenshots are measured on the way past, because the body that
        # carries them is a different file in every language and the picture is
        # the same picture in all of them. See buildlib/screens.py.
        'body': screens.fill_sizes(body.rstrip('\n'), page['shots'],
                                   f'{page["slug"]} [{locale["lang"]}]'),
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
              css_v, lang_v, offline_v, filter_v, site_css, emit):
    """The front page of one language, and the app it can be installed as.

    Installable for the same reason a tool is, and with the same three files
    beside it: a manifest saying what to install, a worker that has already
    cached it, and the eight lines that register the worker. What differs is the
    scope. A tool's is its own folder; this one's is the language root, so an
    installed "A Box of Tools" opens on this page and keeps the guides, the
    roadmap and the legal pages inside its window rather than handing them to
    the browser.

    English is the exception that is worth knowing about: its root is the site
    root, so its scope is the whole origin, every other language included. That
    is what a front page at `/` means, and the nesting resolves the way scopes
    always resolve - most specific wins - so a reader who installed the German
    front page gets it for German pages either way.
    """
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

    css_href = f'site.css?v={css_v}'
    context = frame(locale, locales, site, '', './', links, lang_v, {
        'categories': categories,
        'footer': footer,
        'css_href': css_href,
        'csp': sitelib.render_csp(root['csp'], root.get('app_csp', {})),
        'jsonld': sitelib.hub_jsonld(root, ordered),
        # Root-absolute and versioned, like lang.js and for the same reason. It
        # is the same bytes in every language - `register('sw.js')` resolves
        # against the page that loaded it, not against the script - so a copy
        # per language would be that many ways to fetch one file.
        'offline_href': f'/offline.js?v={offline_v}',
        'filter_href': f'/hub-filter.js?v={filter_v}',
    })
    context['ui'] = i18n.render_ui(templates, root['ui'], context,
                                   f'ui [{locale["lang"]}]')

    page = emit.html(out / 'index.html', templates.render('hub.html', context))

    analytics = emit.js(out / 'analytics.js', templates.render('analytics.js', {
        'site': root,
        'words': {'plural': 'files', 'analytics_extra': ''},
    }), where=f'{locale["prefix"]}analytics.js')

    # The name is the site's and is not translated, so every language installs
    # an app called "A Box of Tools"; the description and the language tag are
    # this language's. `home` is this language's front door rather than the
    # site's, which is what keeps the German app from opening the English page.
    manifest = write(out / 'manifest.json',
                     sitelib.app_manifest(root, root['home'], site['name'],
                                          root['hub']['og_description'],
                                          locale['dir'],
                                          root['manifest']['icons']))

    # site.css goes in as `extra`: one copy of it is written per language at
    # the end of the build, which has not happened yet, and it has always been
    # hashed nameless - see cache_hash on why that must not change.
    emit.js(out / 'sw.js', templates.render('sw.js', {
        'words': {'plural': 'files'},
        'assets': ['index.html', css_href, 'manifest.json'],
        'cache_scope': f'/{locale["prefix"]}',
        'cache_hash': sitelib.cache_hash(
            [('index.html', page), ('analytics.js', analytics),
             ('manifest.json', manifest)],
            [site_css]),
    }), where=f'{locale["prefix"]}sw.js')


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
                  for page in pages if page['kind'] in ('site', 'legal')],
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


SKIP_LINK = ('http://', 'https://', 'mailto:', 'data:', 'blob:', '//')


def check_links(out, locales, site, page_links=None):
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

    `page_links` maps each page to the links on it, gathered by the emitter as
    the pages were written - see Emitter on what reading them back here used
    to cost. Without it the pages are read off the disk, which is what checking
    a tree this build did not write has to do anyway.
    """
    published = {locale['lang'] for locale in i18n.published(locales)
                 if not locale['is_base']}
    # The prefixes whose pages are still serving English bodies, and so are
    # expected to carry links this language does not have.
    unpublished = {f'{locale["lang"]}/' for locale in locales
                   if not locale['is_base'] and locale['lang'] not in published}

    # Every file the build wrote, walked once - names only, nothing opened.
    # Each link is then a set lookup rather than a question for the
    # filesystem, which is what keeps this check from being most of the build:
    # the tree holds tens of thousands of links, and a stat call per link
    # costs more than every render put together. The lookup is also exact
    # where a stat is not - is_file() on Windows matches any case, so a link
    # whose case differs from its target would pass here and 404 once GitHub
    # Pages served it.
    files = {path.relative_to(out).as_posix()
             for path in out.rglob('*') if path.is_file()}

    if page_links is None:
        page_links = {rel: LINK.findall((out / rel).read_text(encoding='utf-8'))
                      for rel in files if rel.endswith('.html')}

    broken = []
    for rel in sorted(page_links):
        # Skip a locale that is not published yet, and the 404, whose links are
        # root-absolute for a reason templates/404.html explains.
        if rel == '404.html' or rel.startswith(tuple(unpublished)):
            continue

        here = posixpath.dirname(rel)
        for href in page_links[rel]:
            if href.startswith(SKIP_LINK) or not href:
                continue
            target = posixpath.normpath(
                href.lstrip('/') if href.startswith('/')
                else posixpath.join(here, href))
            # normpath turns the root itself - "/", or "../" from one level
            # down - into ".". A link to a folder means its index.html, and a
            # path that climbs out of the tree entirely lands on neither test.
            if target == '.':
                target = 'index.html'
            elif target not in files:
                target = f'{target}/index.html'
            if target not in files:
                broken.append(f'{rel} -> {href}')

    if broken:
        shown = broken[:15]
        more = len(broken) - len(shown)
        tail = f'\n    ... and {more} more' if more > 0 else ''
        raise sitelib.ConfigError(
            f'{len(broken)} links lead to a page that was not built:\n    '
            + '\n    '.join(shown) + tail)


def copy_screens(out, prose):
    """The guides' screenshots, published once for all fifteen languages.

    Once, and not per language, because the picture is the same picture: the
    tool in it is photographed in English and the caption under it is
    translated. Copying the set into every locale would multiply a few megabytes
    by fifteen to change nothing anybody sees. buildlib/screens.py has the rest
    of the reasoning, including why the bodies address them from the root.
    """
    for page in prose:
        for source, published in screens.find(page):
            dest = out / published.lstrip('/')
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, dest)


def copy_shared(out):
    """Everything in shared/ that is served as-is. shared/css and shared/js are
    not: they are inputs to what the build assembles, not files anyone fetches."""
    for path in sorted(SHARED.iterdir()):
        # shared/css feeds the stylesheets the build assembles, and shared/js is
        # copied into each tool's src/shared/ by build_tool - minified, cached by
        # that tool's service worker. Copying either here would publish a second,
        # raw copy at the site root that nothing references; site.css and the
        # frame scripts are written separately, minified, by the caller -
        # copying the source over one of them here would undo that.
        # `icons` is the same kind of input: shared/icons holds upstream Lucide
        # for buildlib/icons.py to inline into the pages, and nothing fetches an
        # .svg from there - publishing the folder would put a directory of
        # SVGs at the site root that no page links to.
        if path.name in ('css', 'js', 'icons', 'site.css', 'lang.js',
                         'feedback.js', 'handoff.js', 'lang-keep.js',
                         'hub-filter.js'):
            continue
        if path.is_dir():
            shutil.copytree(path, out / path.name, dirs_exist_ok=True)
        else:
            shutil.copy2(path, out / path.name)


# ---------------------------------------------------------------------------


def build_redirect(out, locale, site, old_slug, target):
    """The page at an address a tool used to have, saying where it went.

    GitHub Pages cannot be told to answer 301, so the redirect is the page
    itself: an instant meta refresh for a person, a canonical for a crawler,
    and a plain link for whichever of the two ignores the other. It is not in
    the sitemap - build_sitemap works from the tool list, and this is not a
    tool - and it never carries the old page's content, so nothing here can
    drift out of date except the target's address, which comes from the same
    table every real link to the tool comes from.
    """
    url = i18n.locale_url(locale, target['out_slug'], site)
    name = target['name']
    write(_redirect_path(out, old_slug),
          f'<!doctype html>\n'
          f'<html lang="{locale["hreflang"]}" dir="{locale.get("dir", "ltr")}">\n'
          f'<meta charset="utf-8">\n'
          f'<meta http-equiv="refresh" content="0; url=../{target["out_slug"]}/">\n'
          f'<meta name="robots" content="noindex">\n'
          f'<link rel="canonical" href="{url}">\n'
          f'<title>{name}</title>\n'
          f'<p><a href="../{target["out_slug"]}/">{name}</a></p>\n')


def _redirect_path(out, old_slug):
    path = out / old_slug
    path.mkdir(parents=True, exist_ok=True)
    return path / 'index.html'


if __name__ == '__main__':
    sys.exit(main())
