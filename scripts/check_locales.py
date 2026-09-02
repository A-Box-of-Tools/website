"""
Read every translation against the English it translates, and say where they
disagree.

    python scripts/check_locales.py [<report-dir>] [--locale <lang> ...]
                                    [--built <out-dir>]

Writes <report-dir>/summary.txt - a table of counts, one row per check and
one column per language - and one <report-dir>/<CHECK>.txt per check with
every finding on a line of its own: language, file, where in the file, and
the sentence with the offending characters in brackets. The summary is the
map; the per-check files are the territory. Grep them by file name to see
what a single translation owes. The report directory defaults to
`_checks/locales/`, which is ignored by git.

It is a report, not a gate: it always exits 0, and it says nothing a test
already says. What it adds is the half of translation that no test can judge
from the English side.

WHAT IT CHECKS, AND WHY EACH CHECK EXISTS

Structure. A locale's body.html has to carry the same elements as the
English body it replaces: the same ids, because the JavaScript looks them up;
the same `data-phrase` keys with the same `{blank}` placeholders, because
`shared/js/phrases.js` fills them in by name; the same `<code>` contents,
links and image sources, because those are not words. A locale's toml has to
carry the same array lengths and the same `{{ names }}`. The build's tests
catch the phrase keys; the rest of this list is what has slipped past them
before - a button added upstream and missing in fourteen languages, a
placeholder renamed on one side.

House style, per language. Each locale's `locale.toml` opens with the style
its translators agreed on, and these rules are that style as regular
expressions: no space between Japanese and Latin, one space between Chinese
and Latin, nukta on फ़ and ज़ and never on क ख ग, a non-breaking space before
a French colon, no `vosotros`, no Dutch `u`, and so on. A rule fires on the
visible text only - attributes a visitor can read included - and never on
markup, comments or `<pre>`.

Wrapping. Chinese and Japanese put no space between words, so a source line
wrapped inside a sentence arrives on the page as a space inside a sentence -
the minifier collapses the indentation to one space and nothing downstream
can tell it from one somebody meant. `CJK_WRAP` and `CJK_TAG_WRAP` find those
in the source; `--built <out-dir>` reads the pages a build wrote and counts
the holes that actually shipped, which is the check that matters, because the
template inserts a few of its own.

Two checks are inventories rather than faults and are expected to have
counts: `CJK_EMDASH` lists a lone em dash where the house style wants the
double 破折号 (`scripts/cjk_fix.py` closes those), and `ENGLISH_LEFTOVER`
lists sentences dense in English function words, which the two sentences
every locale quotes in English will always trip.

A finding is a place to look, not an order. `dieciséis` is not `vosotros`,
Turkish doubles a word to mean "very", and a Japanese quotation may end in
plain form on purpose. When a rule is wrong more often than it is right, fix
the rule here rather than the sentence.
"""

import argparse
import html
import re
import tomllib
from collections import Counter, defaultdict
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

HAN = '㐀-䶿一-鿿'
KANA = '぀-ヿ'
CJKP = '，。、；：？！“”‘’（）《》「」・｜'
CJK = f'[{HAN}{KANA}{CJKP}]'
CJKW = f'[{HAN}{KANA}]'
INLINE = {'a', 'code', 'strong', 'em', 'b', 'i', 'kbd', 'small', 'sup', 'sub',
          'abbr', 'mark', 'br', 'wbr', 'time', 'span'}
VISIBLE_ATTRS = ('alt', 'title', 'aria-label', 'placeholder', 'aria-description')

findings = defaultdict(list)  # check -> [(locale, file, where, snippet)]


def add(check, locale, file, where, snippet):
    snippet = re.sub(r'\s+', ' ', str(snippet)).strip()
    findings[check].append((locale, file, where, snippet[:240]))


def en_path(rel):
    """The English source a locale file overrides, or None if there is none."""
    if rel == 'locale.toml':
        return ROOT / 'config/site.toml'
    if rel == 'planned.toml':
        return ROOT / 'config/planned.toml'
    m = re.match(r'(tools|pages/guides|pages)/([^/]+)\.(toml|html)$', rel)
    if not m:
        return None
    kind, slug, ext = m.groups()
    if ext == 'html':
        return ROOT / kind / slug / 'body.html'
    return ROOT / kind / slug / ('tool.toml' if kind == 'tools' else 'page.toml')


class Segments(HTMLParser):
    """Visible text of a body.html, one segment per block, with line numbers,
    plus the structure the locale has to preserve: tag counts, ids, phrases,
    links and image sources."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.segs = []  # (line, text, kind)
        self.cur = []
        self.cur_line = None
        self.tags = Counter()
        self.ids = set()
        self.phrases = {}
        self.hrefs = set()
        self.srcs = set()
        self.in_phrase = None
        self.in_pre = 0

    def flush(self):
        text = ''.join(self.cur)
        if text.strip():
            kind = 'phrase:' + self.in_phrase if self.in_phrase else 'text'
            self.segs.append((self.cur_line, text, kind))
        self.cur = []
        self.cur_line = None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        self.tags[tag] += 1
        if 'id' in a:
            self.ids.add(a['id'])
        if tag == 'a' and a.get('href'):
            self.hrefs.add(a['href'])
        if tag == 'img' and a.get('src'):
            self.srcs.add(a['src'])
        for k in VISIBLE_ATTRS:
            if a.get(k):
                self.segs.append((self.getpos()[0], a[k], 'attr:' + k))
        if tag == 'span' and 'data-phrase' in a:
            self.flush()
            self.in_phrase = a['data-phrase']
            self.cur_line = self.getpos()[0]
            return
        if tag == 'pre':
            self.in_pre += 1
        if tag not in INLINE:
            self.flush()
            self.cur_line = self.getpos()[0]
        if tag == 'br':
            self.cur.append(' ')

    def handle_endtag(self, tag):
        if tag == 'span' and self.in_phrase is not None:
            self.phrases[self.in_phrase] = ''.join(self.cur)
            self.flush()
            self.in_phrase = None
            return
        if tag == 'pre':
            self.in_pre -= 1
        if tag not in INLINE:
            self.flush()

    def handle_data(self, data):
        if self.in_pre:
            return
        if self.cur_line is None:
            self.cur_line = self.getpos()[0]
        self.cur.append(data)


def parse_html(path):
    p = Segments()
    p.feed(path.read_text(encoding='utf-8'))
    p.flush()
    return p


def walk_toml(obj, prefix=''):
    if isinstance(obj, dict):
        for k, v in obj.items():
            yield from walk_toml(v, f'{prefix}.{k}' if prefix else k)
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            yield from walk_toml(v, f'{prefix}[{i}]')
    elif isinstance(obj, str):
        yield prefix, obj


def toml_values(path):
    raw = path.read_text(encoding='utf-8')
    try:
        data = tomllib.loads(raw)
    except Exception as e:  # noqa: BLE001 - the parse error is the finding
        return raw, None, [('parse', str(e))]
    return raw, data, list(walk_toml(data))


def strip_tags(s):
    return html.unescape(re.sub(r'<[^>]+>', '', s))


# ---------------------------------------------------------------- prose checks

EN_WORDS = re.compile(
    r'\b(the|and|with|your|which|when|what|are|not|this|that|from|into|without'
    r'|does|will|you|have|been|than|then|there|only|also|about|because|before'
    r'|after|every|nothing|never|something|anything|browser|uploaded)\b', re.I)
DOUBLE_WORD = re.compile(r'(?<![\w-])([^\W\d_]{2,}) \1(?![\w-])')
# Reduplication is grammar in Turkish - "kat kat" is "many times over" - so a
# doubled word there is only a typo when it is not one of these.
DOUBLE_WORD_OK = {'tr': {'kat', 'tek', 'ayrı', 'yavaş', 'sık', 'adım', 'bir', 'uzun', 'ince'}}
PLACEHOLDER = re.compile(r'\{\{\s*[\w.]+\s*\}\}|\{[a-zA-Z_][\w.]*\}')
TEMPLATE_TAG = re.compile(r'\{%.*?%\}')

ASCII_PUNCT = re.compile(f'{CJKW}[,;:!?]|{CJKW}\\.(?=\\s|$|{CJKW})|\\({CJKW}|{CJKW}\\)|"{CJKW}|{CJKW}"')
LONE_EMDASH = re.compile('(?<!—)—(?!—)')

RULES = {
    'zh': [
        ('ZH_NIN', re.compile('您')),
        ('CJK_ASCII_PUNCT', ASCII_PUNCT),
        ('ZH_HAN_LATIN_NOSPACE', re.compile(f'[{HAN}][A-Za-z]|[A-Za-z][{HAN}]')),
        ('ZH_HAN_DIGIT_NOSPACE', re.compile(f'(?<!第)[{HAN}][0-9]|[0-9][{HAN}](?<![0-9][年月日时分秒点倍张个页次帧位条行列种项秒毫])')),
        ('CJK_NBSP', re.compile(f'{CJKW}\xa0|\xa0{CJKW}')),
        ('CJK_EMDASH', LONE_EMDASH),
    ],
    'ja': [
        ('CJK_ASCII_PUNCT', ASCII_PUNCT),
        ('JA_SPACE_LATIN', re.compile(f'{CJKW} [A-Za-z0-9(]|[A-Za-z0-9)] {CJKW}')),
        ('CJK_NBSP', re.compile(f'{CJKW}\xa0|\xa0{CJKW}')),
        ('CJK_EMDASH', LONE_EMDASH),
        # plain form closing a sentence; ました and でした are polite and end in
        # the same two characters, hence the two lookbehinds
        ('JA_PLAIN_FORM', re.compile('(?<![「『])(?<!ま)(?<!で)(だ|である|する|した|ない|できる|ある|いる|なる|なった|れる|られる)[。]')),
    ],
    'hi': [
        ('HI_NUKTA_KKHG', re.compile('[कखग]़')),
        ('HI_SPELLING', re.compile(r'बिल्कुल|औज़ार|औजार|पृष्ठ|(?<!\S)फाइल|(?<!\S)जरूरत|(?<!\S)साइज(?!़)|(?<!\S)मुफ्त|ब्राउजर|(?<!\S)फोल्डर|ज्यादा')),
    ],
    'fr': [
        ('FR_NO_NBSP_BEFORE', re.compile(r'[^\s\xa0 &][;!?]|[A-Za-zÀ-ÿ»)]:(?!//)')),
        ('FR_SPACE_BEFORE', re.compile(r' [;!?:]')),
        ('FR_GUILLEMET_SPACE', re.compile(r'«[^\xa0 ]|[^\xa0 ]»')),
    ],
    'de': [
        ('DE_STRAIGHT_QUOTE', re.compile(r'"')),
        ('DE_ENGLISH_QUOTE', re.compile('“[^”„]*”')),
        ('DE_DU', re.compile(r'\b(du|dein|deine|deinen|deinem|deiner|dich|dir)\b', re.I)),
    ],
    'es': [
        # dieciséis and its kin end in -éis without being a verb
        ('ES_VOSOTROS', re.compile(r'\b(vosotros|vuestr\w*|\w+áis|\w*(?<!s)éis)\b')),
        ('ES_USTED', re.compile(r'\b(usted|ustedes)\b', re.I)),
        ('ES_REGIONAL', re.compile(r'\b(ordenador|computadora|ordenadores|computadoras)\b', re.I)),
    ],
    'it': [
        ('IT_FORMAL', re.compile(r'(?<![.!?»] )(?<!^)\b(Lei|Suo|Sua|Suoi|Sue)\b')),
    ],
    'nl': [
        ('NL_FORMAL_U', re.compile(r'\b(u|uw|U|Uw)\b')),
    ],
    'pt': [
        ('PT_EUROPEAN', re.compile(r'\b(ficheiros?|ecrãs?|utilizador(es)?|rato|telemóvel|fotografias?)\b', re.I)),
        ('PT_TU', re.compile(r'\b(tu|teu|tua|teus|tuas)\b')),
    ],
    'id': [
        ('ID_INFORMAL', re.compile(r'\b(kamu|engkau|anda|kalian)\b')),
    ],
    'tr': [
        ('TR_SEN', re.compile(r'\b(sen|senin|sana|seni)\b', re.I)),
    ],
    'ar': [
        ('AR_INDIC_DIGIT', re.compile('[٠-٩]')),
        ('AR_ASCII_PUNCT', re.compile(r'[؀-ۿ][,;?]|[؀-ۿ] [,;?]')),
    ],
    'ko': [
        ('KO_HANDA', re.compile(r'(?<![「"\'])(한다|이다|된다|있다|없다|는다|않다|같다|많다|낸다|간다|온다|준다|본다|든다|난다|린다|룬다)[.!](?= |$)')),
    ],
}
RULES['zh-TW'] = list(RULES['zh'])


def prose_checks(locale, file, where, text):
    t = html.unescape(text) if '&' in text else text
    t = TEMPLATE_TAG.sub('', t)
    # ASCII whitespace only: \s would swallow the non-breaking spaces French
    # depends on, and then report them missing
    flat = re.sub(r'[ \t\r\n\f\v]+', ' ', t).strip()
    if not flat:
        return
    hits = set(m.group(0).lower() for m in EN_WORDS.finditer(flat))
    if len(hits) >= 3:
        add('ENGLISH_LEFTOVER', locale, file, where, flat)
    for m in DOUBLE_WORD.finditer(flat):
        if m.group(1).lower() in DOUBLE_WORD_OK.get(locale, ()):
            continue
        add('DOUBLE_WORD', locale, file, where, f'[{m.group(0)}] ' + flat)
    for name, rx in RULES.get(locale, []):
        for m in rx.finditer(flat):
            s = max(0, m.start() - 40)
            add(name, locale, file, where, f'[{m.group(0)}] …' + flat[s:m.end() + 40] + '…')


def raw_checks(locale, file, raw, is_toml):
    lines = raw.split('\n')
    in_comment = False
    in_pre = False
    for n, line in enumerate(lines, 1):
        if is_toml and line.lstrip().startswith('#'):
            continue
        if not is_toml:
            if '<!--' in line:
                in_comment = True
            if '<pre' in line:
                in_pre = True
            skip = in_comment or in_pre
            if '-->' in line:
                in_comment = False
            if '</pre' in line:
                in_pre = False
            if skip:
                continue
        if re.search(r'(?<=\S) {2,}(?=\S)', line):
            add('DOUBLE_SPACE', locale, file, n, line)
        if line != line.rstrip():
            add('TRAILING_SPACE', locale, file, n, line)
    if locale in ('zh', 'ja', 'zh-TW'):
        for m in re.finditer(f'({CJK})[ \\t]*\\n[ \\t]*({CJK})', raw):
            n = raw.count('\n', 0, m.start()) + 1
            add('CJK_WRAP', locale, file, n, raw[max(0, m.start() - 30):m.end() + 30])
        for m in re.finditer(f'({CJK})[ \\t]*\\n[ \\t]*<(code|a|strong|em|span|kbd)\\b|</(code|a|strong|em|span|kbd)>[ \\t]*\\n[ \\t]*({CJK})', raw):
            n = raw.count('\n', 0, m.start()) + 1
            add('CJK_TAG_WRAP', locale, file, n, raw[max(0, m.start() - 30):m.end() + 30])
        for m in re.finditer(f'{CJKW}  +{CJKW}', raw):
            n = raw.count('\n', 0, m.start()) + 1
            add('CJK_MULTISPACE', locale, file, n, raw[max(0, m.start() - 30):m.end() + 30])


# --------------------------------------------------------------- structure

STRUCT_TAGS = ['p', 'li', 'h1', 'h2', 'h3', 'h4', 'a', 'code', 'strong', 'em', 'img',
               'details', 'summary', 'table', 'tr', 'td', 'th', 'ul', 'ol', 'button',
               'input', 'select', 'option', 'label', 'figure', 'figcaption', 'kbd',
               'pre', 'span', 'div', 'section', 'small', 'br', 'textarea', 'dl', 'dt',
               'dd', 'blockquote', 'video', 'canvas', 'output', 'progress', 'fieldset',
               'legend', 'form']


def html_structure(locale, file, en, lo):
    diff = []
    for t in STRUCT_TAGS:
        if en.tags[t] != lo.tags[t]:
            diff.append(f'{t}:{en.tags[t]}->{lo.tags[t]}')
    if diff:
        add('HTML_TAG_COUNTS', locale, file, '', ' '.join(diff))
    if en.ids != lo.ids:
        add('HTML_IDS', locale, file, '', f'missing={sorted(en.ids - lo.ids)} extra={sorted(lo.ids - en.ids)}')
    if set(en.phrases) != set(lo.phrases):
        add('PHRASE_KEYS', locale, file, '', f'missing={sorted(set(en.phrases) - set(lo.phrases))} extra={sorted(set(lo.phrases) - set(en.phrases))}')
    for k in set(en.phrases) & set(lo.phrases):
        pe = set(PLACEHOLDER.findall(en.phrases[k]))
        pl = set(PLACEHOLDER.findall(lo.phrases[k]))
        if pe != pl:
            add('PHRASE_PLACEHOLDERS', locale, file, k, f'en={sorted(pe)} lo={sorted(pl)} :: {lo.phrases[k]}')
    abs_en = {h for h in en.hrefs if h.startswith(('http', '#', 'mailto'))}
    abs_lo = {h for h in lo.hrefs if h.startswith(('http', '#', 'mailto'))}
    if abs_en != abs_lo:
        add('HTML_HREFS', locale, file, '', f'missing={sorted(abs_en - abs_lo)} extra={sorted(abs_lo - abs_en)}')
    if en.srcs != lo.srcs:
        add('HTML_IMG_SRC', locale, file, '', f'missing={sorted(en.srcs - lo.srcs)} extra={sorted(lo.srcs - en.srcs)}')
    pe = Counter(PLACEHOLDER.findall(' '.join(s[1] for s in en.segs if s[2] == 'text')))
    pl = Counter(PLACEHOLDER.findall(' '.join(s[1] for s in lo.segs if s[2] == 'text')))
    if pe != pl:
        add('HTML_TEXT_PLACEHOLDERS', locale, file, '', f'en={dict(pe)} lo={dict(pl)}')


def toml_structure(locale, file, en_vals, lo_vals, en_data, lo_data):
    en_map = dict(en_vals)
    lo_map = dict(lo_vals)
    stale = [k for k in lo_map if k not in en_map]
    if stale:
        add('TOML_STALE_KEYS', locale, file, '', str(stale))
    for k, v in en_data.items():
        if isinstance(v, list) and v and k in lo_data and len(v) != len(lo_data[k]):
            add('TOML_ARRAY_COUNT', locale, file, k, f'en={len(v)} lo={len(lo_data[k])}')
    for k in lo_map:
        if k not in en_map:
            continue
        pe = set(PLACEHOLDER.findall(en_map[k]))
        pl = set(PLACEHOLDER.findall(lo_map[k]))
        if pe != pl:
            add('TOML_PLACEHOLDERS', locale, file, k, f'en={sorted(pe)} lo={sorted(pl)} :: {lo_map[k]}')
        ce = Counter(re.findall(r'<code>(.*?)</code>', en_map[k], re.S))
        cl = Counter(re.findall(r'<code>(.*?)</code>', lo_map[k], re.S))
        if ce != cl:
            add('TOML_CODE_DIFF', locale, file, k, f'en={sorted(ce.elements())} lo={sorted(cl.elements())}')
        he = set(h for h in re.findall(r'href="([^"]+)"', en_map[k]) if h.startswith(('http', '#', 'mailto')))
        hl = set(h for h in re.findall(r'href="([^"]+)"', lo_map[k]) if h.startswith(('http', '#', 'mailto')))
        if he != hl:
            add('TOML_HREFS', locale, file, k, f'en={sorted(he)} lo={sorted(hl)}')
        te = Counter(re.findall(r'<(\w+)', en_map[k]))
        tl = Counter(re.findall(r'<(\w+)', lo_map[k]))
        if te != tl:
            add('TOML_TAG_COUNTS', locale, file, k, f'en={dict(te)} lo={dict(tl)}')
        # the privacy and howto templates put the body straight after a bold
        # title with nothing between, so a body that opens with whitespace
        # ships a visible gap in a language that has no spaces
        if locale in ('zh', 'ja', 'zh-TW') and k.endswith('.body') and re.match(r'(privacy|howto)\[', k):
            if lo_map[k][:1].isspace():
                add('CJK_LEADING_SPACE', locale, file, k, lo_map[k][:60])


# -------------------------------------------------------------- built pages

BUILT_W = f'[{HAN}{KANA}，。、；：？！“”‘’（）《》「」]'
BUILT_HOLES = (
    ('text', re.compile(f'{BUILT_W} +{BUILT_W}')),
    ('close', re.compile(f'{BUILT_W}</(strong|em|a|kbd|b|i)> +{BUILT_W}')),
    ('open', re.compile(f'{BUILT_W} +<(strong|em|a|kbd|b|i)\\b[^>]*>{BUILT_W}')),
)


def built_checks(out, locales):
    """A space between two CJK characters in a page a build wrote, searched
    in the raw text nodes: stripping tags first invents holes at every inline
    element, and stripping <code> hides the ones beside it."""
    for loc in locales:
        if loc not in ('zh', 'zh-TW', 'ja') or not (out / loc).is_dir():
            continue
        for page in sorted((out / loc).rglob('index.html')):
            t = page.read_text(encoding='utf-8')
            t = re.sub(r'<(script|style|pre)\b.*?</\1>', '', t, flags=re.S)
            t = re.sub(r'<!--.*?-->', '', t, flags=re.S)
            rel = page.parent.relative_to(out).as_posix()
            for kind, rx in BUILT_HOLES:
                for m in rx.finditer(t):
                    add('BUILT_CJK_HOLE', loc, rel, kind, t[max(0, m.start() - 30):m.end() + 30])


# ------------------------------------------------------------------- main

def expected_files():
    expected = set()
    for p in (ROOT / 'tools').iterdir():
        if (p / 'tool.toml').exists():
            expected.add(f'tools/{p.name}.toml')
            expected.add(f'tools/{p.name}.html')
    for p in (ROOT / 'pages').iterdir():
        if (p / 'page.toml').exists():
            expected.add(f'pages/{p.name}.toml')
            expected.add(f'pages/{p.name}.html')
    for p in (ROOT / 'pages/guides').iterdir():
        if (p / 'page.toml').exists():
            expected.add(f'pages/guides/{p.name}.toml')
            expected.add(f'pages/guides/{p.name}.html')
    expected |= {'locale.toml', 'planned.toml'}
    return expected


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n\n')[1])
    ap.add_argument('report_dir', nargs='?', default=str(ROOT / '_checks' / 'locales'))
    ap.add_argument('--locale', action='append', help='only this language (repeatable)')
    ap.add_argument('--built', metavar='OUT', help='also scan the pages a build wrote here for CJK holes')
    args = ap.parse_args()

    out = Path(args.report_dir)
    out.mkdir(parents=True, exist_ok=True)
    locales = [p.name for p in sorted((ROOT / 'locales').iterdir()) if p.is_dir()]
    if args.locale:
        locales = [l for l in locales if l in args.locale]

    en_cache = {}

    def cached(path, fn):
        if path not in en_cache:
            en_cache[path] = fn(path)
        return en_cache[path]

    expected = expected_files()
    for locale in locales:
        base = ROOT / 'locales' / locale
        have = set()
        for path in sorted(base.rglob('*')):
            if not path.is_file():
                continue
            rel = path.relative_to(base).as_posix()
            have.add(rel)
            enp = en_path(rel)
            if enp is None or not enp.exists():
                add('STALE_FILE', locale, rel, '', 'no English counterpart')
                continue
            raw = path.read_text(encoding='utf-8')
            raw_checks(locale, rel, raw, rel.endswith('.toml'))
            if rel.endswith('.html'):
                lo = parse_html(path)
                en = cached(enp, parse_html)
                html_structure(locale, rel, en, lo)
                for line, text, kind in lo.segs:
                    prose_checks(locale, rel, line, text)
            else:
                raw, data, vals = toml_values(path)
                if data is None:
                    add('TOML_PARSE', locale, rel, '', vals)
                    continue
                _, en_data, en_vals = cached(enp, toml_values)
                toml_structure(locale, rel, en_vals, vals, en_data, data)
                for k, v in vals:
                    if rel == 'locale.toml' and k.startswith('slugs.'):
                        continue
                    prose_checks(locale, rel, k, strip_tags(v))
        for rel in sorted(expected - have):
            add('MISSING_FILE', locale, rel, '', 'not translated')

    if args.built:
        built_checks(Path(args.built), locales)

    checks = sorted(findings)
    lines = ['check'.ljust(26) + ''.join(l.rjust(7) for l in locales) + '  total']
    for c in checks:
        cnt = Counter(x[0] for x in findings[c])
        lines.append(c.ljust(26) + ''.join(str(cnt.get(l, 0) or '.').rjust(7) for l in locales) + f'{len(findings[c]):7d}')
    summary = '\n'.join(lines) + '\n'
    (out / 'summary.txt').write_bytes(summary.encode('utf-8'))
    for c in checks:
        body = ''.join(f'{locale}\t{file}\t{where}\t{snip}\n' for locale, file, where, snip in findings[c])
        (out / f'{c}.txt').write_bytes(body.encode('utf-8'))
    print(summary, end='')
    print(f'\nreport: {out}')


if __name__ == '__main__':
    main()
