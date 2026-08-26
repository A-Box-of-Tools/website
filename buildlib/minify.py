"""
Minifying the generated HTML and JavaScript.

WHAT THIS DOES, AND WHAT IT DELIBERATELY DOES NOT

It removes comments and whitespace. It does not rename anything.

Renaming identifiers - the part of minification that makes code genuinely
unreadable - needs a real JavaScript parser with scope analysis to do safely,
because a name is only safe to change once you know every place it is bound and
every place it is read. Guessing at that with regular expressions is how a
build silently corrupts a hand-written EXIF parser or an MP4 muxer, and the
failure would not show up until somebody's file came out wrong. So this does
not attempt it. If mangled names are wanted, the honest way to get them is a
real toolchain (esbuild, terser) - see README.md.

What is left is still substantial: these files are heavily commented, and the
comments are most of their bytes.

SAFETY

Two invariants, both enforced by `check` below on every file the build emits:

  1. Line terminators are never moved. JavaScript inserts semicolons at line
     breaks, so a minifier that joins lines has to know where a statement ends -
     which again means parsing. This one keeps every newline exactly where it
     was, so automatic semicolon insertion behaves identically before and after.
     That costs about a byte per line and buys certainty.

  2. Re-tokenising the output gives back the same tokens, in the same order, on
     the same lines, as tokenising the input. If a space were dropped where one
     was load-bearing - turning `a in b` into `ainb`, or `x + +y` into `x++y` -
     the token streams would differ and the build fails rather than shipping it.

DETERMINISM

Nothing here depends on the machine, the clock, or the order a directory
happens to list in. The same sources minify to the same bytes anywhere, which
is what keeps `python build.py --check` meaningful.
"""

import json
import re

# ---------------------------------------------------------------------------
# JavaScript

# Longest first: the tokeniser takes the first that matches.
PUNCTUATORS = sorted([
    '>>>=', '...', '===', '!==', '**=', '<<=', '>>=', '>>>', '&&=', '||=', '??=',
    '=>', '==', '!=', '<=', '>=', '&&', '||', '??', '?.', '++', '--', '+=', '-=',
    '*=', '/=', '%=', '&=', '|=', '^=', '**', '<<', '>>',
    '{', '}', '(', ')', '[', ']', ';', ',', '<', '>', '+', '-', '*', '/', '%',
    '&', '|', '^', '!', '~', '?', ':', '=', '.', '#', '@',
], key=len, reverse=True)

# After one of these, a `/` opens a regular expression rather than dividing.
REGEX_OK_AFTER_WORD = frozenset("""
    return typeof instanceof in of new delete void throw case do else yield
    await return
""".split())

# ... and after any punctuator except these, which can end an expression.
REGEX_NOT_AFTER_PUNCT = frozenset([')', ']', '}', '++', '--'])

IDENT_START = re.compile(r'[A-Za-z_$\\]')
IDENT = re.compile(r'[A-Za-z_$\\][A-Za-z0-9_$\\]*')
NUMBER = re.compile(r'''
    0[xX][0-9a-fA-F_]+n?
  | 0[oO][0-7_]+n?
  | 0[bB][01_]+n?
  | (?:\d[\d_]*)?\.\d[\d_]*(?:[eE][+-]?\d+)?
  | \d[\d_]*\.?(?:[eE][+-]?\d+)?n?
''', re.X)

TWO_CHAR = frozenset(p for p in PUNCTUATORS if len(p) == 2)

# Everything JavaScript treats as whitespace except a line break. The last
# two are a no-break space and a byte-order mark: both are legal between
# tokens, both turn up in text pasted out of an editor, and neither may reach
# the output. Written as escapes so this file stays readable ASCII.
JS_SPACE = ' \t\r\f\v\u00a0\ufeff'


class MinifyError(Exception):
    pass


def _word_char(ch):
    return ch.isalnum() or ch in '_$\\'


def tokenize_js(source, where='<js>'):
    """Return [(line, text), ...] for every significant token.

    Comments and whitespace are dropped, but a comment that spanned lines still
    advances the line counter, because a line terminator inside a block comment
    counts for semicolon insertion exactly as a bare newline does.
    """
    tokens = []
    i, line, n = 0, 1, len(source)
    prev = None                      # previous significant token text

    while i < n:
        ch = source[i]

        if ch == '\n':
            line += 1
            i += 1
            continue
        if ch in JS_SPACE:
            i += 1
            continue

        # Comments
        if source.startswith('//', i):
            end = source.find('\n', i)
            i = n if end < 0 else end
            continue
        if source.startswith('/*', i):
            end = source.find('*/', i + 2)
            if end < 0:
                raise MinifyError(f'{where}:{line}: unterminated block comment')
            line += source.count('\n', i, end)
            i = end + 2
            continue

        start, start_line = i, line

        # Strings
        if ch in '\'"':
            i = _scan_string(source, i, ch, where, line)
            line += source.count('\n', start, i)
        # Template literals, which nest: `a${ `b${c}` }d`
        elif ch == '`':
            i = _scan_template(source, i, where, line)
            line += source.count('\n', start, i)
        # Regular expression, or division
        elif ch == '/' and _regex_allowed(prev):
            i = _scan_regex(source, i, where, line)
        elif ch.isdigit() or (ch == '.' and i + 1 < n and source[i + 1].isdigit()):
            match = NUMBER.match(source, i)
            if not match:
                raise MinifyError(f'{where}:{line}: cannot read number')
            i = match.end()
        elif IDENT_START.match(ch):
            i = IDENT.match(source, i).end()
        else:
            for punct in PUNCTUATORS:
                if source.startswith(punct, i):
                    i += len(punct)
                    break
            else:
                raise MinifyError(f'{where}:{line}: unexpected character {ch!r}')

        text = source[start:i]
        tokens.append((start_line, text))
        prev = text

    return tokens


def _scan_string(source, i, quote, where, line):
    j = i + 1
    while j < len(source):
        c = source[j]
        if c == '\\':
            j += 2
            continue
        if c == quote:
            return j + 1
        if c == '\n':
            raise MinifyError(f'{where}:{line}: newline inside a string')
        j += 1
    raise MinifyError(f'{where}:{line}: unterminated string')


def _scan_template(source, i, where, line):
    j, depth = i + 1, 0
    # Did the last thing inside the substitution end a value? It decides whether
    # a `/` divides or opens a regular expression, the same question the main
    # loop asks of the previous token. A character is enough here because the
    # answer only turns on what kind of thing came immediately before.
    after_value = False

    while j < len(source):
        c = source[j]
        if c == '\\':
            j += 2
            continue
        if depth == 0 and c == '`':
            return j + 1
        if depth == 0 and source.startswith('${', j):
            depth, j, after_value = depth + 1, j + 2, False
            continue
        if depth:
            # Inside ${...}: strings, templates, comments and regular
            # expressions all have to be skipped whole. A `}` inside any of them
            # would close the substitution early, and a quote inside a regular
            # expression would open a string that is not there - which is how a
            # minifier's `${x.replace(/["]/g, '')}` used to bring the build down.
            if c in '\'"':
                j = _scan_string(source, j, c, where, line)
                after_value = True
                continue
            if c == '`':
                j = _scan_template(source, j, where, line)
                after_value = True
                continue
            if source.startswith('//', j):
                end = source.find('\n', j)
                j = len(source) if end < 0 else end
                continue
            if source.startswith('/*', j):
                end = source.find('*/', j + 2)
                if end < 0:
                    raise MinifyError(f'{where}:{line}: unterminated block comment')
                j = end + 2
                continue
            if c == '/' and not after_value:
                j = _scan_regex(source, j, where, line)
                after_value = True
                continue
            if c == '{':
                depth += 1
            elif c == '}':
                depth -= 1
            if not c.isspace():
                # A name, a number or a closing bracket ends a value; anything
                # else - an operator, an opening bracket, a comma - does not.
                after_value = _word_char(c) or c in ')]}'
        j += 1
    raise MinifyError(f'{where}:{line}: unterminated template literal')


def _scan_regex(source, i, where, line):
    j, in_class = i + 1, False
    while j < len(source):
        c = source[j]
        if c == '\\':
            j += 2
            continue
        if c == '\n':
            raise MinifyError(f'{where}:{line}: newline inside a regular expression')
        if c == '[':
            in_class = True
        elif c == ']':
            in_class = False
        elif c == '/' and not in_class:
            j += 1
            while j < len(source) and source[j].isalpha():
                j += 1
            return j
        j += 1
    raise MinifyError(f'{where}:{line}: unterminated regular expression')


def _regex_allowed(prev):
    """Could a `/` here open a regular expression rather than divide?

    The usual heuristic: not after something that can end an expression. The
    two cases this gets wrong are `if (x) /re/.test(y)` and a `/re/` opening a
    statement straight after a block - both need to know what the `)` or `}`
    closed. Neither appears in this repository, and `check` below would catch
    the damage if one ever did, because the token streams would stop matching.
    """
    if prev is None:
        return True
    if prev in REGEX_NOT_AFTER_PUNCT:
        return False
    if _word_char(prev[0]):
        return prev in REGEX_OK_AFTER_WORD
    if prev[0] in '\'"`/':
        return False
    return True


def _needs_space(a, b):
    """Would writing `a` and `b` with nothing between them make a third token?"""
    if not a or not b:
        return False
    left, right = a[-1], b[0]
    if _word_char(left) and _word_char(right):
        return True
    # `1 .toString()` - without the space the dot reads as a decimal point.
    if a[0].isdigit() and right == '.':
        return True
    # `+ +x` / `- -x` must not become `++x`, and `/` beside `/` or `*` would
    # open a comment.
    if left in '+-' and right in '+-':
        return True
    if left == '/' and right in '/*':
        return True
    if not _word_char(left) and not _word_char(right) and (left + right) in TWO_CHAR:
        return True
    return False


def js(source, banner=None, where='<js>'):
    """Minify JavaScript. Comments go, indentation goes, newlines stay."""
    tokens = tokenize_js(source, where)
    out, current_line, parts = [], None, []

    for line, text in tokens:
        if current_line is None:
            current_line = line
        elif line != current_line:
            out.append(''.join(parts))
            parts, current_line = [], line
        if parts and _needs_space(parts[-1], text):
            parts.append(' ')
        parts.append(text)
    if parts:
        out.append(''.join(parts))

    result = '\n'.join(out)
    check(source, result, where, tokens)
    if banner:
        result = banner + '\n' + result
    return result + '\n' if result else ''


def check(source, minified, where, tokens=None):
    """The output must tokenise to exactly the input's tokens, in order, with a
    line break between the same pairs of them.

    Not the same line *numbers* - blank lines and comment-only lines are gone,
    so every number after the first shifts. What has to hold is whether there
    is a break between one token and the next, because that, and only that, is
    what decides where a semicolon gets inserted. Anything else means a space
    was dropped that was holding two tokens apart, or a regular expression was
    read as a division.

    `tokens` is the source's own token stream, when the caller already holds
    it - js() above always does, having just built its output from them.
    Without it the source is tokenised here a second time, only to be compared
    against what the first pass already produced.
    """
    before = tokens if tokens is not None else tokenize_js(source, where)
    after = tokenize_js(minified, where + ' (minified)')

    if len(before) != len(after):
        raise MinifyError(
            f'{where}: minifying changed the token count '
            f'({len(before)} -> {len(after)}); refusing to write it')

    for index, ((line_a, text_a), (line_b, text_b)) in enumerate(zip(before, after)):
        if text_a != text_b:
            raise MinifyError(
                f'{where}: minifying changed a token near line {line_a}: '
                f'{text_a!r} became {text_b!r}; refusing to write it')
        if index:
            broke_a = line_a != before[index - 1][0]
            broke_b = line_b != after[index - 1][0]
            if broke_a != broke_b:
                moved = 'lost' if broke_a else 'gained'
                raise MinifyError(
                    f'{where}: minifying {moved} a line break before {text_a!r} '
                    f'at line {line_a}; refusing to write it')


# ---------------------------------------------------------------------------
# HTML
#
# Whitespace between HTML elements can be significant - it is the space between
# two words when the elements are inline - so runs are collapsed to one space
# rather than removed. That still takes out every line of indentation, which is
# where the bytes are. Elements whose content is not whitespace-collapsible are
# copied through untouched.

RAW_TEXT = ('pre', 'textarea', 'script', 'style')
TAG = re.compile(r'<(/?)([a-zA-Z][-a-zA-Z0-9]*)')
LD_JSON = re.compile(
    r'(<script\b[^>]*\btype\s*=\s*["\']application/ld\+json["\'][^>]*>)(.*?)(</script>)',
    re.S | re.I)


def html(source, banner=None):
    out = []
    i, n = 0, len(source)

    while i < n:
        ch = source[i]

        if source.startswith('<!--', i):
            end = source.find('-->', i + 4)
            i = n if end < 0 else end + 3
            continue

        if ch == '<':
            match = TAG.match(source, i)
            if match:
                end = _end_of_tag(source, i)
                out.append(_collapse_attrs(source[i:end]))
                name = match.group(2).lower()
                if not match.group(1) and name in RAW_TEXT:
                    close = re.compile(r'</\s*' + re.escape(name) + r'\s*>', re.I)
                    found = close.search(source, end)
                    stop = found.end() if found else n
                    out.append(source[end:stop])
                    i = stop
                    continue
                i = end
                continue
            # A bare `<` that is not a tag: text, and legal in HTML.
            out.append(ch)
            i += 1
            continue

        if ch.isspace():
            j = i
            while j < n and source[j].isspace():
                j += 1
            # Nothing before it and nothing after it means nothing to separate.
            if out and j < n:
                out.append(' ')
            i = j
            continue

        j = i
        while j < n and source[j] != '<' and not source[j].isspace():
            j += 1
        out.append(source[i:j])
        i = j

    result = ''.join(out).strip()
    result = LD_JSON.sub(_compact_ld, result)
    if banner:
        result = f'<!--{banner}-->' + result
    return result + '\n'


def _end_of_tag(source, i):
    """Index just past the `>` closing the tag starting at `i`, respecting
    quoted attribute values - the favicon on every page is a data: URI with a
    whole SVG, angle brackets and all, inside one attribute."""
    j, quote = i + 1, None
    while j < len(source):
        c = source[j]
        if quote:
            if c == quote:
                quote = None
        elif c in '"\'':
            quote = c
        elif c == '>':
            return j + 1
        j += 1
    return len(source)


def _collapse_attrs(tag):
    """Squeeze the whitespace between attributes, leaving values alone."""
    out, i, n = [], 0, len(tag)
    while i < n:
        c = tag[i]
        if c in '"\'':
            end = tag.find(c, i + 1)
            end = n if end < 0 else end + 1
            out.append(tag[i:end])
            i = end
            continue
        if c.isspace():
            while i < n and tag[i].isspace():
                i += 1
            # No space needed before the closing `>` or `/>`.
            if i < n and tag[i] not in '>/':
                out.append(' ')
            continue
        out.append(c)
        i += 1
    return ''.join(out)


def _compact_ld(match):
    """Structured data is JSON, so whitespace outside its strings means
    nothing. Re-serialising is safer than editing the text."""
    open_tag, body, close_tag = match.groups()
    try:
        data = json.loads(body)
    except json.JSONDecodeError as err:
        raise MinifyError(f'structured data is not valid JSON: {err}') from None
    compact = json.dumps(data, separators=(',', ':'), ensure_ascii=True)
    return open_tag + compact + close_tag
