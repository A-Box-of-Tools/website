"""
A page for each rule a tool applies: /id-photo/us-passport/.

WHAT THESE ARE

One tool can hold many answers behind one address. The passport photo maker
knows what sixty-seven documents ask of a photograph, and its page can tell a
search engine none of it, because which rule is on the screen depends on a menu
nobody has opened yet. Somebody asking "Canada passport photo size" is asking
for three numbers, who published them and when they were last read. A landing
page is that answer at an address of its own - the figures, the notes, the
citation - and then a button that opens the tool with the rule already chosen.

It is deliberately not the tool again. Forty-nine copies of one interface under
forty-nine titles is the shape Google's guidance on scaled content describes,
and it would bury the only part that differs. Every sentence here that changes
from page to page is a published requirement; the part that does not change is
short, and says so by being the same.

WHERE THE WORDS COME FROM

Nothing on these pages is written for them except the frame - a title pattern,
a few headings, the button. The figures are `landing/pages.json` in the tool's
folder, which the tool's own code generates from its rulebook (see the emitter
beside it), and that file holds phrase KEYS: the same keys the tool resolves at
run time against the #phrases block of its body.html. `resolve` below is
shared/js/phrases.js over again, on purpose and in the same few lines, so a
landing page in German says exactly what the German tool says and there is no
second glossary to keep.

The frame's own strings are `[landing]` in tool.toml, translated like the rest
of that file. A language that has not translated them owes the tool a
translation and says so the way it always does - see buildlib/i18n.py.

WHAT A TOOL NEEDS TO HAVE ONE

`landing/pages.json` and a `[landing]` table. Only id-photo does. The shape of
an entry - country, document, size, facts, notes, source - is a rulebook's, and
a second tool wanting pages like these would want a different shape; that is a
reason to write its template then, and not to guess at it now.
"""

import json
import re

from buildlib.site import ConfigError, to_text
from buildlib.template import escape

DATA = 'landing/pages.json'

PHRASE = re.compile(r'<span data-phrase="([^"]+)">(.*?)</span>', re.S)
PLACEHOLDER = re.compile(r'\{(\w+)\}')

#: What [landing] must say, so that a page cannot ship with a heading missing.
REQUIRED = (
    'title', 'heading', 'nav', 'description', 'lede', 'updated',
    'facts_heading', 'facts_term', 'facts_value', 'make', 'make_note', 'notes_heading', 'source_heading',
    'how_heading', 'how', 'siblings_heading', 'all_link',
    'index_heading', 'index_lede',
)


def wanted(tool):
    """Does this tool have pages of this kind at all?"""
    return (tool['dir'] / DATA).is_file()


def load(tool):
    """The entries of landing/pages.json, checked against [landing]."""
    path = tool['dir'] / DATA
    entries = json.loads(path.read_text(encoding='utf-8'))['pages']
    strings = tool.get('landing')
    if not isinstance(strings, dict):
        raise ConfigError(
            f'{tool["slug"]}: {DATA} is there, so every entry in it becomes a '
            'page, but tool.toml has no [landing] table to say what the pages '
            'are called.')
    missing = [key for key in REQUIRED if key not in strings]
    if missing:
        raise ConfigError(f'{tool["slug"]}: [landing] is missing {", ".join(missing)}')

    seen = set()
    for entry in entries:
        # An id is an address, and it sits beside src/, styles.css and sw.js.
        if not re.fullmatch(r'[a-z0-9]+(-[a-z0-9]+)*', entry['id']) or entry['id'] == 'src':
            raise ConfigError(f'{path}: {entry["id"]!r} cannot be an address')
        if entry['id'] in seen:
            raise ConfigError(f'{path}: two entries are called {entry["id"]!r}')
        seen.add(entry['id'])
    return entries


def phrases(body):
    """The #phrases block of a tool's body, as the table phrase() reads.

    The inner text is kept as markup - it is entities and words, never tags,
    which `load` would not know how to carry into a title - with its white
    space folded the way phrase() folds it.
    """
    table = {}
    for key, inner in PHRASE.findall(body):
        if '<' in inner:
            raise ConfigError(
                f'phrase {key!r} contains markup, and a landing page would put '
                'it in a title and a description as well as on the page')
        table[key] = ' '.join(inner.split())
    return table


class Markup(str):
    """A value that has been through `resolve` already, and is markup.

    `resolve` escapes a plain value, because an authority's name may hold an
    ampersand. A country's name that was resolved a moment ago already has, and
    escaping it twice puts "&amp;amp;" on the page.
    """


def resolve(asked, table):
    """What phrase() would have answered, as an HTML fragment.

    `asked` is what the emitter recorded: a key, with the values its sentence
    takes, any of which may be another question. A key the table does not hold
    comes back as itself, which is phrase()'s rule too and is how a citation -
    an authority's own name, never translated - passes through untouched.
    """
    if isinstance(asked, Markup):
        return asked
    if not isinstance(asked, dict):
        return Markup(escape(str(asked)))
    text = table.get(asked['key'])
    if text is None:
        return Markup(escape(asked['key']))
    values = asked.get('values', {})
    return Markup(PLACEHOLDER.sub(
        lambda found: (resolve(values[found.group(1)], table)
                       if found.group(1) in values else found.group(0)),
        text))


def with_native(name, native, table):
    """ "Germany (Deutschland)", and plain "Deutschland" on the German page.

    specs.js's rule, including the part that is easy to get wrong: the test is
    whether the name already CONTAINS the native word, or the Chinese page
    reads "护照 (护照)".
    """
    if not native or to_text(native) in to_text(name):
        return name
    return resolve({'key': 'name.native',
                    'values': {'name': Markup(name), 'native': native}}, table)


def fill(pattern, values):
    """One of [landing]'s patterns, with its {names} filled in.

    A name the pattern uses and the page cannot supply is an error rather than
    a hole: "{county}" would otherwise ship in forty-nine titles.
    """
    def one(found):
        name = found.group(1)
        if name not in values:
            raise ConfigError(f'[landing] uses {{{name}}}, which a landing page has no value for')
        return values[name]
    return PLACEHOLDER.sub(one, pattern)


def pages(tool, entries, table):
    """Every landing page of one tool in one language, ready to render.

    `tool` is the localized tool, so [landing] and the phrase table are already
    this language's. Each page carries the two shapes the build needs: `page`,
    which is what templates/page.html and the Markdown twin expect of any prose
    page, and the rule itself for the body.
    """
    strings = tool['landing']
    built = []
    for entry in entries:
        country = resolve({'key': entry['country']}, table)
        document = resolve({'key': entry['document']}, table)
        values = {
            'country': country,
            'document': document,
            'size': resolve(entry['size'], table),
            'background': resolve(entry['background'], table),
            'authority': escape(entry['authority']),
            'checked': entry['checked'],
        }
        text = {key: fill(strings[key], values)
                for key in ('title', 'heading', 'nav', 'description', 'lede',
                            'updated', 'siblings_heading')}
        built.append({
            'id': entry['id'],
            'country_key': entry['country'],
            'country': with_native(country, entry['endonym'], table),
            'document': with_native(document, entry['native'], table),
            'short': fill(strings['nav'], values),
            'size': values['size'],
            'facts': [{'term': resolve(term, table), 'value': resolve(value, table)}
                      for term, value in entry['facts']],
            'notes': [resolve({'key': note}, table) for note in entry['notes']],
            'source': resolve(entry['source'], table),
            'checked': entry['checked'],
            'text': text,
        })

    for page in built:
        page['siblings'] = [other for other in built
                            if other['country_key'] == page['country_key']
                            and other['id'] != page['id']]
    return built


def index(built):
    """The pages grouped by country, for the list on the tool's own page."""
    groups = {}
    for page in built:
        groups.setdefault(page['country_key'], {
            'country': page['country'], 'pages': []})['pages'].append(page)
    return list(groups.values())
