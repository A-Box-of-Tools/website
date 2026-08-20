"""
Minifying CSS.

The same bargain as the JavaScript half: take out what is certainly not needed,
and leave anything whose meaning depends on context alone.

WHAT IS SAFE TO REMOVE, AND WHAT LOOKS SAFE AND IS NOT

  * Comments, always.

  * Whitespace runs collapse to one space. They do not disappear, because a
    space between two simple selectors is the descendant combinator - `.a .b`
    and `.a.b` are different rules - and a space between two values is what
    separates them: `margin: 1px 2px`, `grid-template-columns: 1fr 2fr`,
    `font: bold 12px/1.4 serif`.

  * The space around `{`, `}`, `;` and `,` goes. None of those can be part of a
    value that cares.

  * The space after `:` goes only inside a declaration. In a selector it is a
    combinator: `a :hover` matches a hovered descendant of `a`, `a:hover`
    matches a hovered `a`. Telling the two apart needs to know whether the
    current block holds declarations or more rules, which is what BLOCK_AT_RULES
    and the depth tracking below are for.

  * The space around `>`, `+` and `~` goes only in a selector. In a value those
    are arithmetic: `calc(100% - 2rem)` needs its spaces, and `calc(100%-2rem)`
    is invalid.

  * The last `;` before a `}` goes.

Nothing is reordered, nothing is merged, no shorthand is rewritten and no colour
is re-spelled. Those are the transformations that make a CSS minifier fast and
also the ones that occasionally change a page, and the bytes they would save
here are not worth the argument.
"""

import re

# At-rules whose body holds rules rather than declarations, so inside them we
# are still reading selectors and a `:` may be a pseudo-class.
BLOCK_AT_RULES = frozenset([
    'media', 'supports', 'document', 'layer', 'container', 'scope', 'starting-style',
])

AT_RULE = re.compile(r'@([-a-zA-Z]+)')


class CssError(Exception):
    pass


def css(source, banner=None):
    out = []
    # True while the next `{` will open a block of declarations rather than a
    # block of rules. Selector context is the default: the top level of a file.
    stack = []
    in_declarations = False
    i, n = 0, len(source)
    at_rule = None

    while i < n:
        ch = source[i]

        # Comments
        if source.startswith('/*', i):
            end = source.find('*/', i + 2)
            if end < 0:
                raise CssError('unterminated comment')
            i = end + 2
            continue

        # Strings are copied whole: they may hold anything at all.
        if ch in '"\'':
            end = _end_of_string(source, i)
            out.append(source[i:end])
            i = end
            continue

        # url(...) without quotes is its own little grammar, and the thing
        # inside it may contain characters that mean something everywhere else.
        if (ch in 'uU' and source[i:i + 4].lower() == 'url('
                and not _last_is_ident_char(out)):
            end = source.find(')', i)
            if end < 0:
                raise CssError('unterminated url()')
            out.append('url(' + source[i + 4:end].strip() + ')')
            i = end + 1
            continue

        # A custom property's value is not parsed until it is substituted, so it
        # is an arbitrary run of tokens and every space in it is potentially
        # load-bearing: `--op: +` exists to be dropped into a calc(). Copy the
        # whole value across untouched, from the colon to the semicolon that
        # ends it. Only the whitespace at the two ends goes, which the browser
        # trims anyway.
        if (in_declarations and source.startswith('--', i)
                and _last_char(out) in ('{', ';', '')):
            colon = source.find(':', i)
            if colon < 0:
                raise CssError('custom property with no value')
            end = _end_of_value(source, colon + 1)
            out.append(source[i:colon].rstrip() + ':')
            out.append(source[colon + 1:end].strip())
            i = end
            continue

        if ch.isspace():
            j = i
            while j < n and source[j].isspace():
                j += 1
            nxt = source[j] if j < n else ''
            if not _drop_space(_last_char(out), nxt, in_declarations):
                out.append(' ')
            i = j
            continue

        if ch == '@':
            match = AT_RULE.match(source, i)
            at_rule = match.group(1).lower() if match else None

        if ch == '{':
            stack.append(in_declarations)
            # An at-rule with a rule body keeps us reading selectors; anything
            # else - a normal rule, @font-face, @page, @keyframes' inner steps -
            # opens declarations.
            in_declarations = not (at_rule in BLOCK_AT_RULES)
            at_rule = None
            _rstrip_space(out)
            out.append('{')
            i += 1
            continue

        if ch == '}':
            # `;}` -> `}`: the last semicolon in a block is optional.
            _rstrip_space(out)
            while out and out[-1] == ';':
                out.pop()
            out.append('}')
            in_declarations = stack.pop() if stack else False
            at_rule = None
            i += 1
            continue

        if ch == ';':
            _rstrip_space(out)
            # Never two in a row, and never one straight after `{`.
            if out and out[-1] in (';', '{'):
                i += 1
                continue
            out.append(';')
            at_rule = None
            i += 1
            continue

        if ch == ',':
            _rstrip_space(out)
            out.append(',')
            i += 1
            continue

        out.append(ch)
        i += 1

    result = ''.join(out).strip()
    if banner:
        result = f'/*{banner}*/' + result
    return result + '\n'


def _last_char(out):
    return out[-1][-1] if out and out[-1] else ''


def _last_is_ident_char(out):
    ch = _last_char(out)
    return ch.isalnum() or ch in '-_'


def _rstrip_space(out):
    while out and out[-1] == ' ':
        out.pop()


def _drop_space(prev, nxt, in_declarations):
    """Can the whitespace between `prev` and `nxt` simply go?"""
    if not prev or not nxt:
        return True
    # Nothing needs separating from a brace, a semicolon or a comma. A comma is
    # a delimiter everywhere it can legally appear - between selectors, between
    # the arguments of a function, between the layers of a shorthand - so the
    # space beside it is never doing any work. The one place that would not hold
    # is inside a custom property, and those never reach here: their values are
    # copied across whole.
    if prev in '{};,' or nxt in '{};,':
        return True
    # `color: red` -> `color:red`, but only where `:` introduces a value.
    if in_declarations and (prev == ':' or nxt == ':'):
        return True
    # Combinators bind selectors; in a value the same characters are arithmetic.
    if not in_declarations and (prev in '>+~' or nxt in '>+~'):
        return True
    # Inside a function call, a space before `)` never matters.
    if nxt == ')' or prev == '(':
        return True
    if prev == '!' or nxt == '!':          # `color: red !important`
        return prev == '!'
    return False


def _end_of_value(source, i):
    """Index of the `;` or `}` that ends a declaration value, skipping over
    anything nested inside brackets or quotes on the way."""
    depth = 0
    while i < len(source):
        ch = source[i]
        if ch in '"\'':
            i = _end_of_string(source, i)
            continue
        if source.startswith('/*', i):
            end = source.find('*/', i + 2)
            if end < 0:
                raise CssError('unterminated comment')
            i = end + 2
            continue
        if ch in '([{':
            depth += 1
        elif ch in ')]':
            depth -= 1
        elif ch == '}':
            if depth == 0:
                return i
            depth -= 1
        elif ch == ';' and depth == 0:
            return i
        i += 1
    return len(source)


def _end_of_string(source, i):
    quote, j = source[i], i + 1
    while j < len(source):
        if source[j] == '\\':
            j += 2
            continue
        if source[j] == quote:
            return j + 1
        j += 1
    raise CssError('unterminated string')
