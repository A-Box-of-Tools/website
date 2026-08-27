"""
The whole site as one file, three times over, for something that is not a
person: sitemap.xml, llms.txt, and one Atom feed per language.

WHY THE THREE ARE TOGETHER

They are the same job with three audiences. Each is built from the same two
lists - the tools and the prose pages, in the order the site puts them in - and
each holds back the same languages, because a locale still being translated
carries no hreflang tag and no switcher entry, and a line in any of these files
would be the one remaining way a crawler could still be sent to a page that is
half in English. Getting that rule right in three places and wrong in a fourth
is the mistake this arrangement is meant to make hard, and keeping them in one
file is most of how.

WHY THEY ARE NOT IN build.py

None of them is a page. They take no frame, no stylesheet, no service worker
and no locale to be rendered in - they take the finished lists and write one
file at the root of the site. build.py is one function per kind of page, and
these three were sitting in the middle of it answering a different question.
"""

from buildlib import i18n
from buildlib import site as sitelib
from buildlib.emit import write


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


# How many entries a feed carries. The site has more tools and guides than
# this, and deliberately so: a feed answers "what has changed lately", which a
# reader checks repeatedly, and the whole catalogue is already two files away
# in sitemap.xml and llms.txt. Every entry past the first screenful is weight
# on every poll for something nobody scrolls to.
FEED_ENTRIES = 30


def build_feeds(out, templates, site, locales, tools, prose):
    """One Atom feed per published language, at /feed.xml and /<lang>/feed.xml.

    Per language rather than one for the site, because a feed is a reading
    experience and not an index: a German subscriber wants German titles at
    German URLs, and mixing fifteen languages into one file would make it
    useless to all of them. The same rule as everywhere else decides who gets
    one - a locale that has not finished its frame is built and readable and
    advertised to nobody, so it has no feed and no link to one.

    Tools and guides, newest first. Not the legal pages, whose dates move for
    reasons no reader subscribed to hear about, and not the hub or the roadmap,
    which are indexes of things that appear here already.
    """
    for locale in i18n.published(locales):
        entries = []
        for tool in tools:
            if not i18n.translated(locale, tool['slug']):
                continue
            said = i18n.localize_tool(tool, locale, site)
            entries.append({'title': said['name'], 'url': said['url'],
                            'summary': said['description'],
                            'lastmod': said['lastmod']})
        for page in prose:
            if page['kind'] != 'guide' or not i18n.translated(locale, page['slug']):
                continue
            said = i18n.localize_page(page, locale, site)
            entries.append({'title': said['heading'], 'url': said['url'],
                            'summary': said['description'],
                            'lastmod': said['lastmod']})

        # Two passes, because Python's sort is stable: alphabetical first, then
        # by date descending. A day on which four guides shipped then reads in
        # a fixed order rather than in whatever order the folders were walked,
        # which is what keeps a rebuild from reshuffling a feed that did not
        # change and re-notifying everyone who subscribes to it.
        entries.sort(key=lambda entry: entry['title'])
        entries.sort(key=lambda entry: entry['lastmod'], reverse=True)
        entries = entries[:FEED_ENTRIES]

        for entry in entries:
            entry['updated'] = f'{entry["lastmod"]}T00:00:00Z'

        home = i18n.locale_url(locale, '', site)
        said_site = locale['site']
        feed = {
            'lang': locale['hreflang'],
            'title': said_site['name'],
            'subtitle': said_site['hub']['description'],
            'home': home,
            'self': f'{home}feed.xml',
            'author': said_site['name'],
            # The newest entry, not the moment of the build. A feed whose
            # timestamp moves on every deploy teaches a reader to ignore it,
            # which is the same reason lastmod in the sitemap is a date somebody
            # changed on purpose.
            'updated': entries[0]['updated'] if entries else f'{site["lastmod"]}T00:00:00Z',
            'entries': entries,
        }
        write(out / locale['prefix'] / 'feed.xml',
              templates.render('feed.xml', {'feed': feed}))


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
