"""
A very small HTML template engine.

Deliberately tiny, and deliberately not a dependency. The whole point of this
site is that a sceptical reader can check every claim it makes, and "go and read
the docs for a templating library first" is a worse answer than eighty lines of
Python sitting in the repository. It supports exactly what the templates in
`templates/` use and nothing else:

    {{ path.to.value }}     insert a value, raw
    {{ path | e }}          insert a value, HTML-escaped
    {% if path %}...{% endif %}
    {% if path %}...{% else %}...{% endif %}
    {% for item in path %}...{% endfor %}
    {% include "partial.html" %}

Values are inserted RAW by default. That is the opposite of what a web
framework should do, and it is correct here: every value comes from a config
file in this repository, most of them are HTML fragments written on purpose
(`&mdash;`, `<code>`, links between tools), and nothing a visitor types ever
reaches a template. Use `| e` for the few places where a value has to survive as
text, such as inside an attribute.

Missing names are an error, not an empty string. A page that silently loses its
description because a key was renamed is exactly the failure this build is
meant to make impossible.
"""

import re

TOKEN = re.compile(
    r"""\{\{\s*(?P<var>[^}]+?)\s*\}\}"""
    r"""|\{%\s*(?P<tag>if|else|endif|for|endfor|include)\b(?P<rest>[^%]*?)\s*%\}""",
    re.S,
)

FOR_RE = re.compile(r'^\s*(?P<name>\w+)\s+in\s+(?P<path>[\w.]+)\s*$')
INCLUDE_RE = re.compile(r'^\s*"(?P<name>[^"]+)"\s*$')

ESCAPES = (('&', '&amp;'), ('<', '&lt;'), ('>', '&gt;'), ('"', '&quot;'))


class TemplateError(Exception):
    pass


def escape(text):
    for a, b in ESCAPES:
        text = text.replace(a, b)
    return text


def resolve(context, path):
    """Look up a dotted path. `x.y` reads a key, then a key of the result."""
    value = context
    for part in path.split('.'):
        if isinstance(value, dict):
            if part not in value:
                raise TemplateError(f'no such value: {path} (stuck at {part!r})')
            value = value[part]
        else:
            value = getattr(value, part, _MISSING)
            if value is _MISSING:
                raise TemplateError(f'no such value: {path} (stuck at {part!r})')
    return value


_MISSING = object()


class Template:
    def __init__(self, source, loader=None, name='<string>'):
        self.source = source
        self.loader = loader
        self.name = name

    def render(self, context):
        out = []
        self._render(self.source, context, out, self.name)
        return ''.join(out)

    # -- the walker -----------------------------------------------------------
    #
    # One pass over the source, copying literal text through and acting on each
    # tag as it is met. Blocks are handled by finding their matching end tag and
    # recursing into the text between, which keeps nesting free.

    def _render(self, source, context, out, where):
        pos = 0
        while pos < len(source):
            match = TOKEN.search(source, pos)
            if match is None:
                out.append(source[pos:])
                return
            out.append(source[pos:match.start()])

            if match.group('var') is not None:
                out.append(self._value(match.group('var'), context, where))
                pos = match.end()
                continue

            tag, rest = match.group('tag'), match.group('rest') or ''

            if tag == 'include':
                found = INCLUDE_RE.match(rest)
                if not found:
                    raise TemplateError(f'{where}: include needs a quoted name, got {rest!r}')
                partial = self.loader(found.group('name'))
                self._render(partial, context, out, found.group('name'))
                pos = match.end()

            elif tag == 'if':
                body, alt, pos = self._block(source, match, 'if', 'endif', where)
                chosen = body if resolve(context, rest.strip()) else alt
                self._render(chosen, context, out, where)

            elif tag == 'for':
                found = FOR_RE.match(rest)
                if not found:
                    raise TemplateError(f'{where}: bad for tag: {rest!r}')
                body, _, pos = self._block(source, match, 'for', 'endfor', where)
                items = resolve(context, found.group('path'))
                for item in items:
                    scope = dict(context)
                    scope[found.group('name')] = item
                    self._render(body, scope, out, where)

            else:
                raise TemplateError(f'{where}: unexpected {{% {tag} %}}')

    def _value(self, expr, context, where):
        parts = [p.strip() for p in expr.split('|')]
        try:
            value = resolve(context, parts[0])
        except TemplateError as err:
            raise TemplateError(f'{where}: {err}') from None
        if value is None:
            raise TemplateError(f'{where}: {parts[0]} is empty')
        text = str(value)
        for filt in parts[1:]:
            if filt == 'e':
                text = escape(text)
            else:
                raise TemplateError(f'{where}: no such filter: {filt}')
        return text

    def _block(self, source, opening, open_tag, close_tag, where):
        """Return (body, else-body, position after the closing tag)."""
        depth, pos = 1, opening.end()
        body_start, body_end, alt_start = pos, None, None
        while depth:
            match = TOKEN.search(source, pos)
            if match is None:
                raise TemplateError(f'{where}: {{% {open_tag} %}} was never closed')
            tag = match.group('tag')
            pos = match.end()
            if tag == open_tag:
                depth += 1
            elif tag == close_tag:
                depth -= 1
                if depth == 0:
                    body_end = match.start() if alt_start is None else body_end
                    alt = source[alt_start:match.start()] if alt_start is not None else ''
                    return source[body_start:body_end], alt, pos
            elif tag == 'else' and depth == 1 and open_tag == 'if':
                body_end = match.start()
                alt_start = pos
        raise TemplateError(f'{where}: unreachable')


class Loader:
    """Reads templates from a directory, caching what it has already read."""

    def __init__(self, root):
        self.root = root
        self._cache = {}

    def source(self, name):
        if name not in self._cache:
            path = self.root / name
            if not path.is_file():
                raise TemplateError(f'no such template: {name} (looked in {self.root})')
            self._cache[name] = path.read_text(encoding='utf-8')
        return self._cache[name]

    def get(self, name):
        return Template(self.source(name), loader=self.source, name=name)

    def render(self, name, context):
        return self.get(name).render(context)
