#!/usr/bin/env python3
"""Tell the search engines that accept being told, about the pages that changed.

IndexNow is a small protocol: POST a list of URLs plus a key that proves the
host is yours, and Bing, Yandex, Seznam, Naver and Yep fetch them within hours
rather than whenever a crawler next comes round. Google does not take part.
There is no equivalent for it either - its Indexing API is restricted to job
postings and livestreams, and a tool page submitted there is discarded - so
Google is still reached the slow way, through the sitemap, and nothing here
changes that.

The only real question is which URLs to send, and this repository already
answers it. A byte diff of the deployed tree is the obvious idea and it is
wrong: the footer lists every tool, so shipping one rewrites all six hundred
pages, and a change to the frame rewrites them without moving a word anybody
reads. What does track real change is `lastmod` in sitemap.xml - one date per
page, written by hand, moved only when that page's wording moves, for the
reasons set out in templates/sitemap.xml. So this compares the sitemap about
to be deployed against the one already deployed, and sends the entries that
are new or whose date moved. A frame change sends nothing, which is correct.

Sending more than that is not free. Pushing URLs that did not change is how a
host stops being trusted with the protocol, and that trust is the only lever
the site has here.

Two sitemaps in, the list of URLs out:

    python indexnow.py --old deployed/sitemap.xml --new _site/sitemap.xml

Add --submit to actually send them. The key is deliberately not a secret: it
is served at the site root, because being able to fetch it there is how the
protocol proves the sender owns the host.
"""

import argparse
import json
import pathlib
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


def changed(old, new):
    """The URLs worth submitting: the new ones, and the ones whose date moved.

    A URL that has left the sitemap is not returned. IndexNow does accept a
    removed page - it gets fetched, found to be gone, and dropped - but a tool
    retired here becomes a redirect stub rather than a 404, so the address
    goes on answering 200 and there is nothing to report. Submitting URLs that
    do not resolve is also a quick way to spend the host's standing with the
    protocol.
    """
    return [url for url, lastmod in new.items()
            if url not in old or old[url] != lastmod]


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
    parser.add_argument('--new', required=True,
                        help='the sitemap about to be deployed')
    parser.add_argument('--old',
                        help='the sitemap already deployed; leaving it out, '
                             'or naming a file that is not there, means there '
                             'is no baseline and nothing is sent')
    parser.add_argument('--all', action='store_true',
                        help='every URL in --new, whatever --old says; for a '
                             'deliberate resubmission, not for a deploy')
    parser.add_argument('--submit', action='store_true',
                        help='send them. Without it the list is only printed')
    parser.add_argument('--out', help='also write the list to this file')
    args = parser.parse_args(argv)

    new = read_sitemap(args.new)
    if args.all:
        urls = list(new)
    elif args.old and pathlib.Path(args.old).exists():
        urls = changed(read_sitemap(args.old), new)
    else:
        # No baseline: the first run after this was added, or a dist branch
        # being created from scratch. Submitting the whole site is precisely
        # the noise this script exists to avoid, and it would tell the engines
        # nothing the sitemap does not already tell them - so send nothing and
        # let the next deploy have something to compare against. --all is
        # there for when somebody really does mean the whole site.
        print('no previous sitemap to compare against; nothing to submit',
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
