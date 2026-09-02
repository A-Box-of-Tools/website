"""
Set the typography of a Chinese or Japanese locale to its house style.

    python scripts/cjk_fix.py <locale> [--apply] [--only <path> ...]

Without `--apply` it prints, per file, a count per rule and every line that
would change as `- old` / `+ new`, and writes nothing. With it, the files
are rewritten. `--only` takes paths relative to `locales/<locale>/` -
`tools/image-to-svg.toml` - and limits the run to those; the default is the
whole locale. It is idempotent: a second run over what the first wrote
changes nothing, which is what makes it safe to run after every edit.

`zh-TW` is generated from `zh` by `zh-tw-sync.py`, so run this on `zh` and
then the sync, never on `zh-TW` itself.

WHAT IT CHANGES

The rules are the two locales' own, written down at the top of their
`locale.toml`; this file is those rules as regular expressions, applied only
to prose and never inside a tag, a comment, `<pre>` or a `<code>` element:

- Chinese puts one space where Han meets Latin or a digit, and none round a
  date or an ordinal; Japanese puts none anywhere. Both are applied at every
  boundary, including across an inline tag - `你的<strong>PNG` needs the
  space before the tag, and `</code>` needs it after - because the browser
  sees the characters and not the markup.
- A lone em dash between two CJK characters becomes the double 破折号 `——`,
  and a spaced one loses its spaces. `&mdash;` inside a Latin phrase is left
  alone: it belongs to the words around it.
- Chinese straight quotes become “ ”, half-width brackets round Chinese text
  become full-width, and a bracket pair is converted as a pair even when the
  two halves sit in different text runs, because a `（` that closes with `)`
  is worse than either.
- Japanese `?` and `:` after Japanese become `？` and `：`, and a
  non-breaking space between Japanese and Latin is removed.
- A source line wrapped inside a sentence is closed up. In a body.html the
  newline and indentation go; in a toml the line keeps its indentation and
  gains a trailing backslash, which TOML reads as "join with nothing". A
  wrap between Han and Latin keeps its one space on the near side of the
  backslash, where the join cannot swallow it.

WHAT IT LEAVES ALONE

A bold label followed by a word - `<strong>注意</strong> 这里` - keeps its
gap: the strong is a heading, not a word of the sentence. `placeholder`
attributes are untouched, because they imitate a document (an address, a
case number) whose conventions are not the page's. And two Japanese files
are set in a spaced style on purpose and are listed in `JA_SPACED` below; the
spacing rules skip them and the rest still apply.

The checker in `scripts/check_locales.py` reports what this would change,
under `ZH_HAN_LATIN_NOSPACE`, `JA_SPACE_LATIN`, `CJK_EMDASH` and the two
`CJK_*WRAP` checks; run that after this to see what is left.
"""

import argparse
import difflib
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

HAN = '㐀-䶿一-鿿'
KANA = '぀-ヿ'
CJKP = '，。、；：？！“”‘’（）《》「」・｜〜'
J = f'[{HAN}{KANA}]'          # a word character of the script
C = f'[{HAN}{KANA}{CJKP}]'    # word character or CJK punctuation
LAT = 'A-Za-z0-9'
LATB = LAT + '%/'             # what counts as Latin at a boundary

# Japanese files that keep a spaced-Latin style on purpose: the hash pages
# quote long hexadecimal strings, and the space is what keeps them legible.
JA_SPACED = {'tools/hash-checksum.toml', 'tools/hash-checksum.html',
             'pages/guides/verify-a-file-checksum.toml',
             'pages/guides/verify-a-file-checksum.html'}

TOKEN = re.compile(r'(<!--.*?-->|<pre\b.*?</pre>|<script\b.*?</script>|<style\b.*?</style>|<code\b[^>]*>.*?</code>|<[^<>]+>)', re.S)
INLINE_OPEN = re.compile(r'<(a|strong|em|kbd|b|i)\b[^>]*>$|<span class="optional">$')
INLINE_CLOSE = re.compile(r'^</(a|strong|em|kbd|b|i)>$')
CODE = re.compile(r'^<code\b[^>]*>(.*)</code>$', re.S)

RULESET = 'zh'
counts = Counter()
spaced_file = False


def cnt(rule, n=1):
    if n:
        counts[rule] += n


def sub(rule, pattern, repl, text, flags=0):
    new, n = re.subn(pattern, repl, text, flags=flags)
    cnt(rule, n)
    return new


def kind(ch):
    if not ch:
        return None
    if re.match(J, ch):
        return 'word'
    if ch in CJKP:
        return 'punct'
    if re.match(f'[{LATB}]', ch):
        return 'latin'
    return None


def sep(left, right):
    """The whitespace that belongs between two visible characters, or None to
    leave whatever is there alone."""
    kl, kr = kind(left), kind(right)
    if kl is None or kr is None:
        return None
    if kl == 'punct' or kr == 'punct':
        return ''
    if kl == 'word' and kr == 'word':
        return ''
    if RULESET == 'ja':
        return None if spaced_file else ''
    # zh: Han meets Latin with one space
    if 'word' in (kl, kr) and 'latin' in (kl, kr):
        return ' '
    return None


def prose(text, is_toml):
    """Rules on a run of visible text (no tags inside)."""
    t = text
    t = sub('dash.pair', r'(&mdash;|—)[ \t]*(&mdash;|—)', '——', t)
    t = sub('dash.single', rf'(?<={C})\s*(?<!&mdash;)(?<!—)(?:&mdash;|—)(?!&mdash;|—)\s*(?={C})', '——', t)
    t = sub('dash.spaced', r'[ \t]+——[ \t]*(?=' + C + ')|(?<=' + C + r')[ \t]*——[ \t]+', '——', t)
    if RULESET == 'zh':
        t = sub('quotes', rf'(?<=[{HAN}{CJKP}>])(?<!\\)"([^"\\<>=\n]*[{HAN}][^"\\<>=\n]*)(?<!\\)"(?=[{HAN}{CJKP}&<\n ])', '“\\1”', t)
        if not is_toml:
            t = sub('quotes', rf'(?<=\n)([ \t]*)"([^"\\<>=\n]*[{HAN}][^"\\<>=\n]*)"(?=[{HAN}{CJKP}])', '\\1“\\2”', t)
        t = sub('parens', rf'\((?=[{HAN}])', '（', t)
        t = sub('parens', rf'(?<=[{HAN}])\)', '）', t)
        t = sub('paren.space', rf'(?<=[{HAN}]) +(?=（)|(?<=）) +(?=[{HAN}])', '', t)
        t = sub('multispace', rf'(?<={J}) {{2,}}(?={J})', '', t)
        t = sub('space.han-lat', rf'(?<=[{HAN}])(?=[A-Za-z%])', ' ', t)
        t = sub('space.lat-han', rf'(?<=[A-Za-z%])(?=[{HAN}])', ' ', t)
        t = sub('space.han-dig', rf'(?<=[{HAN}])(?<![年月第])(?=[0-9])', ' ', t)
        t = sub('space.dig-han', rf'(?<=[0-9])(?=[{HAN}])(?![年月日时分秒点])', ' ', t)
        t = sub('space.blank', rf'(?<=[{HAN}])(?=\{{(?!\{{))', ' ', t)
        t = sub('space.blank', rf'(?<=(?<!\}})\}})(?=[{HAN}])', ' ', t)
        if is_toml:
            # a continuation backslash joins the lines with nothing between,
            # so Han meeting Latin across one needs its space before the slash
            t = sub('space.wrap', rf'(?<=[{HAN}])(\\\n[ \t]*)(?=[A-Za-z0-9%])', r' \1', t)
            t = sub('space.wrap', rf'(?<=[A-Za-z0-9%])(\\\n[ \t]*)(?=[{HAN}])', r' \1', t)
    else:
        t = sub('question', rf'(?<={J})\?', '？', t)
        t = sub('colon', rf'(?<={J}): ?', '：', t)
        t = sub('parens', rf'(?<={J}) ?\(([^()\n]{{1,40}})\) ?(?={J})', '（\\1）', t)
        t = sub('parens', rf'(?<={J}) ?\(([^()\n]{{1,40}})\)(?=[{CJKP}]|$)', '（\\1）', t)
        t = sub('parens', rf'\((?={J})', '（', t)
        t = sub('parens', rf'(?<={J}) ?\((?=<|$|[A-Za-z])', '（', t)
        t = sub('parens', rf'(?<={C})\)', '）', t)
        t = sub('paren.space', rf'(?<={J}) +(?=（)|(?<=）) +(?={J})', '', t)
        t = sub('multispace', rf'(?<={J}) {{2,}}(?={J})', '', t)
        if not spaced_file:
            # an entity (&mdash;, &rarr;) keeps its spaces: closing one side
            # of it up would leave the other open
            t = sub('space.j-lat', rf'(?<={J}) +(?=[{LAT}(\[{{%])', '', t)
            t = sub('space.lat-j', rf'(?<=[{LAT})\]}}%/]) +(?={J})', '', t)
            t = sub('nbsp', rf'(?<=[{LAT}])&nbsp;(?={J})|(?<={J})&nbsp;(?=[{LAT}])', '', t)
    return t


def visible_edge(text, side):
    """First or last visible character of a text run, ignoring whitespace and
    a TOML line-continuation backslash, which renders as nothing."""
    if side == 'last':
        s = re.sub(r'\\\s*$', '', text.rstrip()).rstrip()
    else:
        s = re.sub(r'^\\[ \t]*\n\s*', '', text).strip()
    if not s:
        return ''
    return s[0] if side == 'first' else s[-1]


def set_leading(text, ws):
    # a run that opens with a continuation backslash: the space goes in front
    # of the backslash, which then swallows the newline and indentation
    if re.match(r'\\[ \t]*\n', text):
        return ws + text
    return ws + re.sub(r'^\s+', '', text)


def set_trailing(text, ws):
    # a continuation backslash swallows everything after it, so the space
    # has to sit before the backslash to survive
    m = re.search(r'[ \t]*\\[ \t]*\n([ \t]*)$', text)
    if m:
        return text[:m.start()] + ws + '\\\n' + m.group(1)
    return re.sub(r'\s+$', '', text) + ws


def boundaries(parts):
    """Whitespace round every inline tag and code element, decided by the
    characters that meet across it."""
    for i in range(1, len(parts), 2):
        tag = parts[i]
        prev_t = parts[i - 1]
        next_t = parts[i + 1] if i + 1 < len(parts) else None
        m = CODE.match(tag)
        if m:
            inner = re.sub(r'<[^>]+>', '', m.group(1)).strip()
            if not inner:
                continue
            # code is set in its own face: zh spaces it from Han on both sides
            # whatever it holds, ja closes up
            left = visible_edge(prev_t, 'last')
            if left:
                ws = sep(left, 'x' if RULESET == 'zh' else inner[0])
                if RULESET == 'zh' and kind(left) == 'word':
                    ws = ' '
                cur = re.search(r'\s*$', prev_t).group(0)
                if ws is not None and cur != ws and (cur or ws):
                    parts[i - 1] = set_trailing(prev_t, ws)
                    cnt('code.before')
            if next_t is not None:
                right = visible_edge(next_t, 'first')
                if right:
                    ws = sep('x' if RULESET == 'zh' else inner[-1], right)
                    if RULESET == 'zh' and kind(right) == 'word':
                        ws = ' '
                    cur = re.match(r'\s*', next_t).group(0)
                    if ws is not None and cur != ws and (cur or ws):
                        parts[i + 1] = set_leading(next_t, ws)
                        cnt('code.after')
            continue
        if INLINE_OPEN.match(tag) and next_t is not None:
            left = visible_edge(prev_t, 'last')
            right = visible_edge(next_t, 'first')
            cur = re.search(r'\s*$', prev_t).group(0)
            ws = sep(left, right)
            if ws is not None and cur != ws:
                parts[i - 1] = set_trailing(prev_t, ws)
                cnt('inline.before')
            continue
        if INLINE_CLOSE.match(tag) and next_t is not None:
            left = visible_edge(prev_t, 'last')      # what the element ends with
            right = visible_edge(next_t, 'first')
            cur = re.match(r'\s*', next_t).group(0)
            ws = sep(left, right)
            # a bold label followed by its explanation keeps a gap: the strong
            # is a heading, not a word of the sentence
            if kind(left) == 'word' and kind(right) == 'word' and cur and tag in ('</strong>', '</em>', '</b>'):
                ws = ' '
            if ws is not None and cur != ws:
                parts[i + 1] = set_leading(next_t, ws)
                cnt('inline.after')
    return parts


def wraps(text, is_toml):
    """A source line wrap inside a sentence ships as a visible space."""
    if is_toml:
        return sub('wrap', rf'(?<={C})[ \t]*\n(?=[ \t]*{C})', '\\\\\n', text)
    return sub('wrap', rf'(?<={C})[ \t]*\n[ \t]*(?={C})', '', text)


def attr_values(tag):
    def fix(m):
        return m.group(1) + prose(m.group(2), False) + m.group(3)
    # placeholder is left alone: it imitates a document (an address, a case
    # number) whose own conventions are not the page's
    return re.sub(r'((?:alt|title|aria-label)=")([^"]*)(")', fix, tag)


def process(text, is_toml):
    parts = TOKEN.split(text)
    for i, part in enumerate(parts):
        if i % 2 == 0:
            parts[i] = prose(part, is_toml)
        elif part.startswith('<') and not part.startswith(('<!--', '<pre', '<script', '<style', '<code')):
            parts[i] = attr_values(part)
    parts = boundaries(parts)
    # a bracket pair is full-width or half-width as a pair, whichever half was
    # decided by its own neighbours; the pair may straddle an inline tag
    chars = [list(p) if i % 2 == 0 else None for i, p in enumerate(parts)]
    stack = []
    for i in range(0, len(parts), 2):
        for k, ch in enumerate(chars[i]):
            if ch in '(（':
                stack.append((i, k, ch))
            elif ch in ')）':
                top = stack.pop() if stack else None
                if top is None:
                    continue
                oi, ok, oc = top
                if ch == ')' and oc == '（':
                    chars[i][k] = '）'
                    cnt('parens')
                elif ch == '）' and oc == '(':
                    chars[oi][ok] = '（'
                    cnt('parens')
    for i in range(0, len(parts), 2):
        parts[i] = ''.join(chars[i])
    out = ''.join(parts)
    parts = TOKEN.split(out)
    for i in range(0, len(parts), 2):
        parts[i] = wraps(parts[i], is_toml)
    return ''.join(parts)


def process_toml(text):
    # comment lines are left exactly as they are, and break the text into
    # chunks so a wrap rule never joins across one
    out, chunk = [], []
    for line in text.split('\n'):
        if line.lstrip().startswith('#'):
            if chunk:
                out.append(process('\n'.join(chunk), True))
                chunk = []
            out.append(line)
        else:
            chunk.append(line)
    if chunk:
        out.append(process('\n'.join(chunk), True))
    return '\n'.join(out)


def main():
    global RULESET, counts, spaced_file
    ap = argparse.ArgumentParser(description=__doc__.split('\n\n')[0].strip())
    ap.add_argument('locale', help='zh or ja (zh-TW is generated from zh by zh-tw-sync.py)')
    ap.add_argument('--apply', action='store_true', help='write the changes instead of printing them')
    ap.add_argument('--only', nargs='+', metavar='PATH', help='paths relative to locales/<locale>/')
    args = ap.parse_args()

    RULESET = 'zh' if args.locale.startswith('zh') else 'ja'
    base = ROOT / 'locales' / args.locale
    if not base.is_dir():
        ap.error(f'no locale at {base}')
    files = [base / p for p in args.only] if args.only else sorted(p for p in base.rglob('*') if p.is_file())
    total = Counter()
    changed = 0
    for path in files:
        rel = path.relative_to(base).as_posix()
        spaced_file = RULESET == 'ja' and rel in JA_SPACED
        counts = Counter()
        old = path.read_text(encoding='utf-8')
        new = process_toml(old) if path.suffix == '.toml' else process(old, False)
        if new == old:
            continue
        changed += 1
        total.update(counts)
        print(f'=== {rel}: ' + ' '.join(f'{k}={v}' for k, v in sorted(counts.items())))
        ol, nl = old.split('\n'), new.split('\n')
        for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, ol, nl, autojunk=False).get_opcodes():
            if op == 'equal':
                continue
            for k in range(i1, i2):
                print('  - ' + ol[k].strip()[:170])
            for k in range(j1, j2):
                print('  + ' + nl[k].strip()[:170])
        if args.apply:
            # write_bytes: write_text would give the file CRLF on Windows,
            # and every file in this repository is LF
            path.write_bytes(new.encode('utf-8'))
    verb = 'changed' if args.apply else 'would change'
    print(f'\n{changed} files {verb}; ' + ' '.join(f'{k}={v}' for k, v in sorted(total.items())))


if __name__ == '__main__':
    main()
