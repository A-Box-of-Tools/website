"""
Every page again, as Markdown: the `index.md` beside each `index.html`.

WHY A PAGE HAS A TWIN

A page here is written for two readers that arrive by different doors. A
person opens the page and reads it. An assistant is handed the page's address,
or is asked a question the page answers, and has to get the words out of it
first - and the words on a tool page sit between a service-worker banner, a
language switcher, an ad slot and forty buttons. /llms.txt already answers
"what is on this site" in one fetch; this answers "what does this page say"
the same way, for every page, at an address anybody can guess: the page's own
with `index.md` on the end.

The same text is carried inside the page, in a hidden <pre>, for the "Copy
page as Markdown" button. Inside rather than fetched, and the reason is the
promise every page makes: no code path on a tool page reaches the network,
`connect-src` names nothing under this site's control, and a button that
fetched a file would be the first thing to widen that - for six kilobytes the
page can carry instead. The cost is the text twice in one page; brotli at
the edge prices the second copy at almost nothing, because it is a copy.

WHAT IS IN IT, AND WHAT IS NOT

A prose page's twin is its body, converted. A tool page's twin is not its body
- that is the interface, and a file picker rendered as Markdown is a list of
button labels - but the written half of the page: the pledge, the steps, the
questions, the privacy panel, the guide and the neighbouring tools. All of
that is tool.toml and [ui.tool], so it is rendered from the same dicts the
page is, through templates/tool.md, and cannot say anything the page does
not.

Links come out absolute. The twin is meant to be pasted somewhere else, and
`../compress-image/` means nothing once it has left the page it was written
on.

THE CONVERTER

`convert` below is deliberately a small thing: the pages here are written in
a dozen elements, listed in HANDLED, and anything outside that list is either
skipped whole (a script, a hidden block, a decorative mark) or treated as
transparent. It is not a general HTML-to-Markdown library and should not grow
into one; a body that uses a new element should show up as a failed test in
tests/python/test_markdown.py and be added to the list on purpose.
"""

import re
from html.parser import HTMLParser
from urllib.parse import urljoin

# Block elements that open a new paragraph of their own.
PARAGRAPHS = frozenset(('p', 'figcaption', 'summary', 'dt', 'dd', 'blockquote'))
HEADINGS = frozenset(('h1', 'h2', 'h3', 'h4', 'h5', 'h6'))
# Containers: a block boundary, and nothing else.
BOUNDARIES = frozenset((
    'section', 'article', 'aside', 'div', 'main', 'header', 'footer', 'nav',
    'figure', 'details', 'dl', 'table', 'thead', 'tbody', 'tr',
))
# Inline elements the converter writes a marker for.
INLINE = frozenset(('a', 'code', 'kbd', 'strong', 'b', 'em', 'i'))
# Elements whose whole subtree is left out, script and style among them.
SKIPPED = frozenset(('script', 'style', 'template', 'svg', 'noscript', 'head'))
# Everything else that is expected to occur, and treated as transparent.
TRANSPARENT = frozenset((
    'span', 'small', 'sup', 'sub', 'abbr', 'time', 'mark', 'u', 's', 'del',
    'ins', 'cite', 'q', 'label', 'th', 'td', 'body', 'html',
))
HANDLED = (PARAGRAPHS | HEADINGS | BOUNDARIES | INLINE | SKIPPED | TRANSPARENT
           | frozenset(('ul', 'ol', 'li', 'pre', 'img', 'br', 'hr')))

MARKER = {'strong': '**', 'b': '**', 'em': '*', 'i': '*'}


class _Converter(HTMLParser):
    def __init__(self, base):
        super().__init__(convert_charrefs=True)
        self.base = base
        # Finished blocks, each a (text, kind) pair: 'item' for a line that
        # carries a bullet, 'more' for a further paragraph inside that item,
        # 'plain' for everything else. Two items in a row are joined tight -
        # one newline - so a list reads as one list; anything else gets the
        # blank line a paragraph needs.
        self.blocks = []
        # The paragraph being assembled: string pieces, and the index in that
        # list where each still-open inline element began.
        self.buf = []
        self.open = []
        self.prefix = ''
        # The lists this paragraph sits inside: (kind, count, indent).
        self.lists = []
        # Whether the paragraph now being built is the first in its <li>,
        # which is the one that carries the bullet.
        self.first_in_item = False
        self.raw = None
        self.skip = 0

    # -- output -------------------------------------------------------------

    def flush(self):
        text = ''.join(self.buf)
        self.buf = []
        self.open = []
        # Inline whitespace was collapsed as it came in; what is left is the
        # room between pieces, which a line break inside a paragraph turns
        # into indentation nobody asked for.
        lines = [line.strip() for line in text.split('\n')]
        text = '\n'.join(lines).strip('\n')
        text = re.sub(r' {2,}', ' ', text)
        prefix, self.prefix = self.prefix, ''
        if not text:
            return
        indent = ''.join(width for _, _, width in self.lists)
        if self.lists and self.first_in_item:
            kind, count, width = self.lists[-1]
            bullet = f'{count}.' if kind == 'ol' else '-'
            bullet = bullet.ljust(len(width))
            outer = ''.join(width for _, _, width in self.lists[:-1])
            first, *rest = text.split('\n')
            text = '\n'.join([outer + bullet + prefix + first]
                             + [indent + line for line in rest])
            self.first_in_item = False
            self.blocks.append((text, 'item'))
            return
        text = '\n'.join(indent + prefix + line for line in text.split('\n'))
        self.blocks.append((text, 'more' if self.lists else 'plain'))

    def result(self):
        self.flush()
        out = []
        previous = 'plain'
        for text, kind in self.blocks:
            if out:
                out.append('\n' if kind == previous == 'item' else '\n\n')
            out.append(text)
            previous = kind
        return ''.join(out).strip() + '\n'

    # -- the parser ---------------------------------------------------------

    def handle_starttag(self, tag, attrs):
        if self.skip:
            self.skip += 1
            return
        attrs = dict(attrs)
        if tag in SKIPPED or 'hidden' in attrs or attrs.get('aria-hidden') == 'true':
            self.skip = 1
            return
        if self.raw is not None:
            return

        if tag == 'pre':
            self.flush()
            self.raw = []
        elif tag in HEADINGS:
            self.flush()
            self.prefix = '#' * int(tag[1]) + ' '
        elif tag in PARAGRAPHS:
            self.flush()
            if tag == 'blockquote':
                self.prefix = '> '
        elif tag in BOUNDARIES or tag == 'hr':
            self.flush()
            if tag == 'hr':
                self.blocks.append(('---', 'plain'))
        elif tag in ('ul', 'ol'):
            self.flush()
            # Nested content aligns under the item's text, so the indent is
            # as wide as the bullet that opened the list.
            self.lists.append((tag, 0, '  ' if tag == 'ul' else '   '))
        elif tag == 'li':
            self.flush()
            if self.lists:
                kind, count, width = self.lists[-1]
                self.lists[-1] = (kind, count + 1, width)
            self.first_in_item = True
        elif tag == 'br':
            self.buf.append('\\\n')
        elif tag == 'img':
            alt = ' '.join(attrs.get('alt', '').split())
            self.buf.append(f'![{alt}]({self.link(attrs.get("src", ""))})')
        elif tag in INLINE:
            self.open.append((tag, len(self.buf), attrs))

    def handle_endtag(self, tag):
        if self.skip:
            self.skip -= 1
            return
        if self.raw is not None:
            if tag == 'pre':
                self.blocks.append((self.fence(''.join(self.raw)), 'plain'))
                self.raw = None
            return

        if tag in INLINE:
            self.close_inline(tag)
        elif tag in HEADINGS or tag in PARAGRAPHS or tag in BOUNDARIES:
            self.flush()
        elif tag in ('ul', 'ol'):
            self.flush()
            if self.lists:
                self.lists.pop()
        elif tag == 'li':
            self.flush()
            self.first_in_item = False

    def handle_data(self, data):
        if self.skip:
            return
        if self.raw is not None:
            self.raw.append(data)
            return
        # `\xa0` is a non-breaking space in the page and an invisible oddity
        # in a text file; the space it stands for is what the reader wants.
        self.buf.append(re.sub(r'\s+', ' ', data.replace('\xa0', ' ')))

    # -- helpers ------------------------------------------------------------

    def close_inline(self, tag):
        # The nearest open element of this kind. Markup here is well formed,
        # so that is the last one opened; anything left open inside it is
        # abandoned, which is what a browser would do too.
        for depth in range(len(self.open) - 1, -1, -1):
            if self.open[depth][0] == tag:
                break
        else:
            return
        _, start, attrs = self.open[depth]
        del self.open[depth:]
        inner = ''.join(self.buf[start:])
        del self.buf[start:]
        # Markdown puts its markers hard against the text, so any space at
        # either end of the element moves outside them.
        lead = inner[:len(inner) - len(inner.lstrip())]
        trail = inner[len(inner.rstrip()):]
        inner = inner.strip()
        if not inner:
            self.buf.append(lead + trail)
            return
        if tag in ('code', 'kbd'):
            fence = '`' * (max(map(len, re.findall(r'`+', inner)), default=0) + 1)
            pad = ' ' if fence != '`' or inner.startswith('`') or inner.endswith('`') else ''
            wrapped = f'{fence}{pad}{inner}{pad}{fence}'
        elif tag == 'a':
            href = attrs.get('href', '')
            wrapped = f'[{inner}]({self.link(href)})' if href else inner
        else:
            wrapped = f'{MARKER[tag]}{inner}{MARKER[tag]}'
        self.buf.append(lead + wrapped + trail)

    def link(self, href):
        href = href.strip()
        if not href or href.startswith(('mailto:', 'tel:', 'data:', 'javascript:')):
            return href
        return urljoin(self.base, href)

    @staticmethod
    def fence(code):
        code = code.strip('\n')
        longest = max(map(len, re.findall(r'`+', code)), default=0)
        fence = '`' * max(3, longest + 1)
        return f'{fence}\n{code}\n{fence}'


def convert(html, base):
    """An HTML fragment as Markdown, every link resolved against `base` - the
    absolute URL of the page the fragment was written for."""
    converter = _Converter(base)
    converter.feed(html)
    converter.close()
    return converter.result()


def inline(html, base):
    """A fragment that is expected to be one paragraph: the same conversion,
    without the trailing newline, so it can sit inside a line of a template."""
    return convert(html, base).strip()


# ---------------------------------------------------------------------------
# The two page kinds


def tool_page(templates, site, tool, ui, guide, related):
    """A tool page's twin: the written half of the page, from the same dicts.

    `ui` is the rendered [ui.tool] table for this page and language, so every
    heading here is the heading the page shows. `guide` and `related` are the
    ones build_tool was handed for the page itself.
    """
    url = tool['url']
    text = lambda fragment: inline(fragment, url)  # noqa: E731
    block = lambda fragment: convert(fragment, url).strip()  # noqa: E731

    def item(fragment, width):
        """A block that sits inside a list item: every line after the first
        is indented under the marker, so a two-paragraph step stays one step."""
        return block(fragment).replace('\n', '\n' + ' ' * width)

    return templates.render('tool.md', {
        'site': site,
        'name': text(tool['heading']),
        'tagline': text(tool['tagline']),
        'description': text(tool['description']),
        'url': url,
        'note': text(ui['md_note']),
        'pledge_line': text(ui['pledge_line']),
        'pledge': block(tool['pledge']),
        'facts': [f'{text(fact["mark"])} {text(fact["text"])}'.strip()
                  for fact in tool['facts']],
        'howto_heading': text(tool['howto_heading']),
        'howto': [{'n': n, 'title': text(step['title']),
                   'body': item(step['body'], len(f'{n}. '))}
                  for n, step in enumerate(tool['howto'], 1)],
        'guide_heading': text(ui['guide_heading']),
        'guide': ({'name': text(guide['heading']), 'url': guide['url'],
                   'description': text(guide['description'])}
                  if guide else None),
        'related_heading': text(ui['related_heading']),
        'related': [{'name': text(other['name']), 'url': other['url'],
                     'tagline': text(other['tagline'])}
                    for other in related],
        'questions_heading': text(ui['questions_heading']),
        'faq': [{'q': text(entry['q']), 'a': block(entry['a'])}
                for entry in tool['faq']],
        'privacy_heading': text(ui['privacy_heading']),
        'privacy': [{'title': text(point['title']), 'body': item(point['body'], 2)}
                    for point in tool['privacy']],
        'check_yourself': text(ui['check_yourself']),
        'read_first': text(ui['read_first_lead'] + tool['read_first']),
    })


def prose_page(templates, site, page, tool, ui, body):
    """A prose page's twin: heading, lede, the way to the tool if there is
    one, and the body converted. `body` is the rendered body, screenshots
    measured and all, exactly as the page carries it."""
    url = page['url']
    text = lambda fragment: inline(fragment, url)  # noqa: E731
    return templates.render('page.md', {
        'site': site,
        'name': text(page['heading']),
        'lede': text(page['lede']),
        'url': url,
        'tool': ({'cta': text(ui['guide']['open_tool']), 'url': tool['url'],
                  'tagline': text(tool['tagline'])}
                 if tool else None),
        'last_updated': text(ui['last_updated']),
        'updated': text(page['updated']),
        'body': convert(body, url).strip(),
    })
