"""
Writes cloudflare/redirects.json: a real 301 for every address a tool used to
answer at.

    python cloudflare/redirects.py            # write the file
    python cloudflare/redirects.py --check    # exit 1 if the file is stale

WHY THIS EXISTS WHEN THE BUILD ALREADY WRITES A STUB

GitHub Pages cannot answer 301, so build.py leaves a page at every old address:
an instant meta refresh, a canonical, and `noindex`. That moves a person. It
does not move a ranking: `noindex` tells a search engine to drop the old
address, where a 301 tells it the new one inherits what the old one earned,
and /text-tools/ was still a landing page in the analytics weeks after it was
split, on rankings it had from before. The site sits behind Cloudflare, which
can answer 301 before the request ever reaches the stub, so the permanent
redirect is said at the edge and the stub stays underneath it for everything
the edge does not cover - a preview, a local build, a language left out below.

WHY THE FILE IS GENERATED AND THEN COMMITTED

[redirects] in config/site.toml and each language's [slugs] already say where
every old address goes; build.py writes its stubs from the same two tables, and
a list kept by hand beside them would be a third copy free to disagree. So the
rules are worked out here. They are committed rather than produced at apply
time for the reason cloudflare/README.md gives for the headers: what reaches
Cloudflare should be a file in the repository that anybody can read, and
apply-redirects.ps1 sends it byte for byte. tests/python/test_cloudflare.py
fails when the file and the two tables part company, so moving a slug without
running this is a red build rather than a redirect that quietly never happens.

WHY ONE RULE PER DESTINATION, AND WHY NOT EVERY LANGUAGE

The Free plan allows ten Single Redirect rules in a zone. One rule per old
address would spend five on English alone, so addresses are grouped by where
they lead - text-tools and format-json both end at /json-formatter/ and share
a rule - and each rule names its sources in one `in {...}` set.

That is still twelve rules for three languages, so languages are taken whole
until the next one would not fit, and one that does not fit keeps its stubs
and loses nothing it has today. Whole rather than rule by rule, so that the
answer to "is German redirected at the edge" is never "partly". Raise BUDGET
if the zone moves to a plan that allows more; nothing else has to change.

The order they are taken in is FIRST, then the rest as the site lists them,
and it is the order of what a 301 is worth. English and Chinese answer at the
English slugs, so /text-tools/ and /zh/format-json/ were real pages that were
linked to and ranked. A language that writes its own slugs never moved: the
comment on [redirects] says German was at /de/json-formatieren/ before either
rename and still is, so /de/format-json/ has a stub only because the build's
test is "the address differs", and nothing was ever earned there to pass on.

Both spellings of an old address are in the set, with and without the closing
slash. Without the bare one a request for /text-tools would miss the rule,
reach GitHub Pages, be sent to /text-tools/ and only then be redirected - a
chain of two, which is the thing the comment on [redirects] in site.toml
already goes out of its way to avoid.
"""

import json
import sys
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from buildlib import i18n
from buildlib import site as sitelib

OUTPUT = Path(__file__).with_name('redirects.json')

#: Single Redirect rules a zone may hold on the Free plan.
BUDGET = 10

#: Languages whose old addresses were live pages, served before the others.
FIRST = ('en', 'zh')


def moved(site, locale, tool_slugs):
    """One language's old addresses, grouped by where each now leads.

    The condition is build_locale's, on purpose: a stub is written only where
    the address really changed, and a rule for an address with no stub would
    redirect a page that is still the tool itself.
    """
    groups = {}
    for old_slug, new_slug in site.get('redirects', {}).items():
        if new_slug not in tool_slugs:
            continue
        if locale['slugs'].get(new_slug, new_slug) == old_slug:
            continue
        target = i18n.locale_path(locale, new_slug)
        groups.setdefault(target, []).append(f'/{locale["prefix"]}{old_slug}')
    return groups


def rule(site, locale, target, sources):
    paths = [spelling for source in sources for spelling in (source, source + '/')]
    listed = ' '.join(json.dumps(path) for path in paths)
    name = target.strip('/').split('/')[-1]
    return {
        'ref': f'moved_{locale["lang"]}_{name}'.replace('-', '_').lower(),
        'description': f'{locale["lang"]}: {", ".join(sources)} -> {target}',
        'expression': f'http.request.uri.path in {{{listed}}}',
        'action': 'redirect',
        'enabled': True,
        'action_parameters': {
            'from_value': {
                'status_code': 301,
                'target_url': {'value': site['domain'].rstrip('/') + quote(target)},
                'preserve_query_string': True,
            },
        },
    }


def ruleset(site, locales, tool_slugs, budget=BUDGET):
    """The payload, and the languages that did not fit in it."""
    rules, left_out = [], []
    ranked = sorted(locales, key=lambda locale: (
        FIRST.index(locale['lang']) if locale['lang'] in FIRST else len(FIRST)))
    for locale in ranked:
        mine = [rule(site, locale, target, sources)
                for target, sources in moved(site, locale, tool_slugs).items()]
        if left_out or len(rules) + len(mine) > budget:
            if mine:
                left_out.append(locale['lang'])
            continue
        rules.extend(mine)
    return {
        'description': ('A 301 for every address a tool used to answer at. '
                        'Generated by cloudflare/redirects.py from [redirects] '
                        'in config/site.toml - change that, not this. '
                        'See cloudflare/README.md.'),
        'rules': rules,
    }, left_out


def current():
    site = sitelib.load_toml(ROOT / 'config' / 'site.toml')
    locales = i18n.load_locales(ROOT / 'locales', site)
    tool_slugs = {path.parent.name for path in (ROOT / 'tools').glob('*/tool.toml')}
    return ruleset(site, locales, tool_slugs)


def rendered(payload):
    # Bytes, and LF: write_text() would make this CRLF on Windows, and the file
    # is sent to the API exactly as it sits on disk.
    return (json.dumps(payload, indent=2, ensure_ascii=False) + '\n').encode('utf-8')


def main(argv):
    payload, left_out = current()
    wanted = rendered(payload)

    if '--check' in argv[1:]:
        if not OUTPUT.exists() or OUTPUT.read_bytes() != wanted:
            print(f'{OUTPUT.name} is stale: run python cloudflare/redirects.py',
                  file=sys.stderr)
            return 1
        return 0

    OUTPUT.write_bytes(wanted)
    print(f'{OUTPUT.name}: {len(payload["rules"])} of {BUDGET} rules')
    for entry in payload['rules']:
        print(f'  {entry["description"]}')
    if left_out:
        print(f'  left to their stubs, because the next language would not fit: '
              f'{", ".join(left_out)}')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
