#!/usr/bin/env python3
"""Tell the search engines that accept being told, about the pages that changed.

IndexNow is a small protocol: POST a list of URLs plus a key that proves the
host is yours, and Bing, Yandex, Seznam, Naver and Yep fetch them within hours
rather than whenever a crawler next comes round. Google does not take part.
There is no equivalent for it either - its Indexing API is restricted to job
postings and livestreams, and a tool page submitted there is discarded - so
Google is still reached the slow way, through the sitemap, and nothing here
changes that.

The only real question is which URLs to send. A byte diff of the deployed tree
is the obvious idea and it is wrong: the footer lists every tool and the frame
wraps every page, so a change to either rewrites all twelve hundred without
moving a word anybody reads - #221 changed one CSS property and rewrote 468.

This used to answer that with `lastmod` from sitemap.xml: one date per page,
written by hand, moved only when that page's wording moved. The reasoning was
sound and the signal was not, because a date cannot express two changes on one
day. On 27 August thirty-seven deploys went out; sixteen of them changed words
a visitor reads and announced nothing, because the page's `lastmod` already
said 2026-08-27 and there was no value left to bump it to. That is not an
author forgetting - the rule was unfollowable, and it failed silently, which
is the worst way for a signal to fail.

So the comparison is now of the thing itself: the bytes inside <main>, which is
where a page's own content lives and where the frame does not reach. The nav,
the header, the footer and the language switcher are all outside it, so the
whole class of false positives that made a byte diff useless is excluded by
construction rather than by discipline. `lastmod` stays exactly as it was and
goes on doing its own job in the sitemap; nothing here reads it any more.

The set of URLs still comes from the sitemap, because that is what already
knows which pages are indexable - the roadmap is deliberately absent, and a
language that has not translated a page does not list it.

Sending more than that is not free. Pushing URLs that did not change is how a
host stops being trusted with the protocol, and that trust is the only lever
the site has here.

Two runs, because the deployed tree stops existing the moment it is replaced.
Before the publish, take its fingerprints:

    python indexnow.py --tree .publish --sitemap .publish/sitemap.xml \
        --write-hashes deployed-hashes.json

After it, compare the new tree against them:

    python indexnow.py --tree _site --sitemap _site/sitemap.xml \
        --old-hashes deployed-hashes.json --submit

Add --submit to actually send them; without it the list is only printed. The
key is deliberately not a secret: it is served at the site root, because being
able to fetch it there is how the protocol proves the sender owns the host.
"""

import argparse
import hashlib
import json
import pathlib
import re
import sys
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from urllib.parse import quote, urlsplit, urlunsplit

# The key, and the name of the file it is served from. The two cannot be
# allowed to drift - a key file that does not match what was submitted fails
# validation and the submission is dropped without saying so - which is why
# tests/python/test_indexnow.py asserts that shared/<KEY>.txt exists and holds
# exactly this string. build.py copies shared/ to the site root, so putting
# the file there is the whole of publishing it.
KEY = 'dce2cc4dac3134c897d6caccad94d0c2'

# The shared endpoint, which forwards one submission to every participating
# engine. Posting to bing.com/indexnow directly would reach only Bing.
ENDPOINT = 'https://api.indexnow.org/indexnow'

# The protocol's own ceiling on a single request. Nothing this site can
# honestly do comes close - the largest real change is one new tool in fifteen
# languages - so reaching it means the caller asked for something it did not
# mean, and saying so beats quietly sending the first ten thousand.
MAX_URLS = 10000

SITEMAP_NS = 'http://www.sitemaps.org/schemas/sitemap/0.9'


def read_sitemap(path):
    """A sitemap as {url: lastmod}, in the order it lists them.

    The order is worth keeping: within each language the sitemap runs hub,
    tools, guides, roadmap, legal, so a submission built from it arrives in
    the order the site would like the pages read.
    """
    root = ET.fromstring(pathlib.Path(path).read_bytes())
    pages = {}
    for url in root.findall(f'{{{SITEMAP_NS}}}url'):
        loc = url.findtext(f'{{{SITEMAP_NS}}}loc')
        if loc is None:
            continue
        lastmod = url.findtext(f'{{{SITEMAP_NS}}}lastmod') or ''
        pages[loc.strip()] = lastmod.strip()
    return pages


# A comment, and the page's own content within what is left.
#
# Stripping the comments first is not tidiness. templates/tool.html explains
# itself in a comment that contains the characters "<main>", and on an
# unminified build a reader that did not strip it would start its match there -
# swallowing the header, the crumbs and the pledge banner into what it calls
# the page's content, which is the entire class of false positive this exists
# to avoid. The deployed pages are minified and carry no comments at all, so
# the bug would never have shown up in production; it would have shown up as a
# deploy that submitted twelve hundred URLs the first time somebody turned
# minifying off. Excluding comments is also right on its own terms: nobody
# reads them, so a change to one is not a change worth announcing.
COMMENT = re.compile(rb'<!--.*?-->', re.S)
MAIN = re.compile(rb'<main[\s/>].*?</main>', re.S)


def content_of(path):
    """The bytes inside <main>, or an error naming the page that has none.

    Refusing rather than falling back to the whole file is deliberate. A
    fallback would quietly restore the byte diff this script exists to avoid -
    one page hashing its frame is one page submitted on every unrelated deploy
    forever, and nothing would ever say so.
    """
    html = COMMENT.sub(b'', pathlib.Path(path).read_bytes())
    found = MAIN.search(html)
    if not found:
        raise ValueError(f'{path} has no <main> to compare')
    return found.group(0)


def page_path(tree, url):
    """Where a sitemap loc lands in a built tree.

    The sitemap carries translated slugs as the characters themselves, and the
    build writes directories under exactly those names, so the path needs no
    decoding - only the percent-encoding in as_uri() below happens, and it
    happens later and to a copy.
    """
    path = urlsplit(url).path.strip('/')
    if not path:
        return pathlib.Path(tree, 'index.html')
    return pathlib.Path(tree, path, 'index.html')


def hashes(tree, sitemap):
    """{url: digest of its <main>} for every page the sitemap lists.

    A URL the sitemap names and the tree does not hold is a build that
    disagrees with itself, so it is raised rather than skipped: silently
    dropping the page would mean never announcing it again.
    """
    out = {}
    for url in read_sitemap(sitemap):
        path = page_path(tree, url)
        if not path.is_file():
            raise ValueError(
                f'{url} is in the sitemap but {path} is not there')
        out[url] = hashlib.sha256(content_of(path)).hexdigest()
    return out


def changed(old, new):
    """The URLs worth submitting: new pages, and ones whose <main> moved.

    A URL that has left the sitemap is not returned. IndexNow does accept a
    removed page - it gets fetched, found to be gone, and dropped - but a tool
    retired here becomes a redirect stub rather than a 404, so the address
    goes on answering 200 and there is nothing to report. Submitting URLs that
    do not resolve is also a quick way to spend the host's standing with the
    protocol.
    """
    return [url for url, digest in new.items()
            if url not in old or old[url] != digest]


def host_of(urls):
    """The one host every URL shares, or an error naming what disagreed.

    A submission carries a host and a key location beside the list, and every
    URL in the list has to be on that host or the request is rejected whole.
    Deriving it from the URLs rather than reading it from config is what stops
    the two from ever disagreeing.
    """
    hosts = {urlsplit(url).netloc for url in urls}
    if len(hosts) != 1:
        raise ValueError(f'expected one host, found {sorted(hosts)}')
    return hosts.pop()


def as_uri(url):
    """A sitemap loc, percent-encoded so it is a URI and not just an IRI.

    Nine of the fifteen languages have slugs that are not ASCII - Arabic,
    Hindi, Japanese, Korean, both Chinese - and the sitemap carries them as the
    characters themselves. That is what a person reads, and it is what the site
    links to, so it is what stays in the sitemap and in everything this script
    prints. But a URI is defined over ASCII, and the far end is entitled to
    reject anything else, so the escaping happens here at the last moment
    rather than being pushed back into the sitemap.

    Only the path is touched. The host is ASCII and the site has no query
    strings, and quoting a '/' or a ':' would break the address rather than
    encode it.
    """
    parts = urlsplit(url)
    return urlunsplit(parts._replace(path=quote(parts.path, safe='/')))


def submit(urls, endpoint=ENDPOINT, key=KEY, opener=urllib.request.urlopen):
    """POST the list, and return the HTTP status.

    200 is accepted. 202 is accepted with the key still to be validated, which
    is the ordinary answer to a first submission from a host and not a
    problem. Anything else is worth reading, so it is printed rather than
    raised: by the time this runs the deploy has already happened, and a
    refused submission is not a reason to paint it red.
    """
    host = host_of(urls)
    body = json.dumps({
        'host': host,
        'key': key,
        'keyLocation': f'https://{host}/{key}.txt',
        'urlList': [as_uri(url) for url in urls],
    }).encode('utf-8')
    request = urllib.request.Request(
        endpoint, data=body, method='POST',
        headers={'Content-Type': 'application/json; charset=utf-8'})
    try:
        with opener(request, timeout=30) as response:
            return response.status
    except urllib.error.HTTPError as error:
        detail = error.read().decode('utf-8', 'replace').strip()[:500]
        print(f'{error.code} {error.reason}: {detail}', file=sys.stderr)
        return error.code


def main(argv=None):
    # A hundred and thirty-seven of this site's URLs are Arabic, Hindi,
    # Japanese, Korean or Chinese rather than ASCII, and a Windows console
    # defaults to a codepage that cannot spell them: printing the list raises
    # UnicodeEncodeError and takes an otherwise working submission down with
    # it. Say which encoding these streams speak instead of inheriting a guess.
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, 'reconfigure'):
            stream.reconfigure(encoding='utf-8')

    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--tree', required=True,
                        help='the built site the sitemap describes')
    parser.add_argument('--sitemap',
                        help='its sitemap; defaults to sitemap.xml inside '
                             '--tree')
    parser.add_argument('--old-hashes',
                        help='fingerprints of the tree already deployed, from '
                             'an earlier --write-hashes; leaving it out, or '
                             'naming a file that is not there, means there is '
                             'no baseline and nothing is sent')
    parser.add_argument('--write-hashes',
                        help="write this tree's fingerprints here and stop. "
                             'Run before the deploy replaces the tree, which '
                             'is the last moment it can be measured')
    parser.add_argument('--all', action='store_true',
                        help='every URL in the sitemap, whatever the baseline '
                             'says; for a deliberate resubmission, not for a '
                             'deploy')
    parser.add_argument('--submit', action='store_true',
                        help='send them. Without it the list is only printed')
    parser.add_argument('--out', help='also write the list to this file')
    args = parser.parse_args(argv)

    sitemap = args.sitemap or str(pathlib.Path(args.tree, 'sitemap.xml'))
    new = hashes(args.tree, sitemap)

    if args.write_hashes:
        pathlib.Path(args.write_hashes).write_bytes(
            json.dumps(new, ensure_ascii=False, indent=1).encode('utf-8'))
        return 0

    if args.all:
        urls = list(new)
    elif args.old_hashes and pathlib.Path(args.old_hashes).exists():
        old = json.loads(pathlib.Path(args.old_hashes).read_bytes())
        urls = changed(old, new)
    else:
        # No baseline: the first run after this was added, or a dist branch
        # being created from scratch. Submitting the whole site is precisely
        # the noise this script exists to avoid, and it would tell the engines
        # nothing the sitemap does not already tell them - so send nothing and
        # let the next deploy have something to compare against. --all is
        # there for when somebody really does mean the whole site.
        print('no fingerprints to compare against; nothing to submit',
              file=sys.stderr)
        urls = []

    if len(urls) > MAX_URLS:
        parser.error(f'{len(urls)} URLs is more than the {MAX_URLS} one '
                     f'submission may carry; that is not a change, it is a '
                     f'mistake')

    for url in urls:
        print(url)
    if args.out:
        pathlib.Path(args.out).write_bytes(
            ''.join(f'{url}\n' for url in urls).encode('utf-8'))

    if not urls or not args.submit:
        return 0

    status = submit(urls)
    print(f'submitted {len(urls)} URLs to {ENDPOINT}: HTTP {status}',
          file=sys.stderr)
    return 0 if status in (200, 202) else 1


if __name__ == '__main__':
    sys.exit(main())
