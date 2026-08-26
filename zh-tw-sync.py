#!/usr/bin/env python3
"""
Regenerate locales/zh-TW/ from locales/zh/.

WHY THIS IS A SCRIPT AND NOT A TRANSLATION

Traditional and Simplified Chinese are one language in two scripts. locales/zh/
is written rather than translated - its own header says so at length - and
saying the same things again by hand in Traditional would not produce a better
page, it would produce a second copy free to drift from the first. So zh-TW is
DERIVED: this script converts zh's prose and the result is committed, the same
way og-image.ps1 draws a share card that is committed rather than drawn at
build time.

Run it whenever locales/zh/ changes. Nothing in the build calls it, and the
site never needs it - what ships is the committed output.

    pip install opencc-python-reimplemented
    python zh-tw-sync.py [--check]

--check reports what would change and exits 1 if anything would, which is what
CI would run if this ever needs guarding.

WHAT THE CONVERSION ACTUALLY DOES

opencc's `s2twp` profile, which is script conversion PLUS Taiwan vocabulary.
Both halves matter here. Simplified to Traditional is not one-to-one, and this
content is full of the ambiguous cases - 复制 and 重复 and 恢复 are three
different Traditional characters (複製, 重複, 恢復), 干活 and 干净 are two
more (幹活, 乾淨), 一只 is 一隻 while 只有 stays 只有. A character table gets
these wrong and the result reads as illiterate rather than as another script.

The vocabulary half is what makes it Taiwan rather than merely Traditional:
服务器 becomes 伺服器, 视频 becomes 影片, 缓存 becomes 快取, 内存 becomes
記憶體, 接口 becomes 介面, 源码 becomes 原始碼. The one that would be easiest
to get wrong by hand it also gets right in both directions: a computer 文件 is
a 檔案, and a 文档 is a 文件.

WHAT IS NOT CONVERTED

Nothing has to be excluded, which is worth saying because it looks like it
should. opencc only rewrites Han characters, so every slug, key, filename,
CSS class and code identifier in these files is Latin and passes through
untouched. The five <code> spans in locales/zh/ that do contain Han are
illustrative prose - 「像这样」, 「文件名」, 「宽」/「高」 - and want converting
like anything else.

The exceptions are handled below rather than skipped: a header comment that
names the script it is written in, and the three strings where the locale
names ITSELF. Converting "简体中文" gives "簡體中文", which is the correct
Traditional spelling of the wrong language.
"""

import re
import sys
from pathlib import Path

try:
    from opencc import OpenCC
except ImportError:
    sys.exit('needs opencc: pip install opencc-python-reimplemented')

ROOT = Path(__file__).resolve().parent
SRC = ROOT / 'locales' / 'zh'
OUT = ROOT / 'locales' / 'zh-TW'

cc = OpenCC('s2twp')

# The locale's identity. Converting zh's copy of these would produce a
# Traditional-script page insisting it is Simplified Chinese.
IDENTITY = [
    ('name = "Chinese (Simplified)"', 'name = "Chinese (Traditional)"'),
    ('endonym = "简体中文"', 'endonym = "繁體中文"'),
    ('lang = "zh"', 'lang = "zh-TW"'),
    ('hreflang = "zh-Hans"', 'hreflang = "zh-Hant"'),
]

# Said AFTER conversion, so these are Traditional on both sides: the script
# has already turned 简体中文 into 簡體中文 by the time this runs.
SELF_NAMING = [('簡體中文', '繁體中文')]

COMMENT_LABEL = [('Simplified', 'Traditional')]

# ---------------------------------------------------------------------------
# Taiwan register, which the script conversion does not touch and which is the
# whole difference between "Traditional characters" and "Chinese as Taiwan
# writes it".
#
# opencc's s2twp gets every ambiguous CHARACTER right - 複製 and 重複 and
# 恢復 out of one 复, 幹活 against 乾淨 out of one 干 - and it swaps the
# obvious vocabulary, 伺服器 and 影片 and 快取 and 記憶體. What it leaves
# alone is idiom, because idiom is not a script question. locales/zh/ is
# written in mainland register, so the conversion produces mainland register
# in Traditional characters: 這兒 for 這裡, 賬號 for 帳號, 實時 for 即時,
# 質量 for 品質.
#
# Two of these matter more than the rest.
#
# 兒化: 這兒/那兒/哪兒 is northern mainland speech and is not written in
# Taiwan at all. 223 of them came through the conversion.
#
# 幹: correct Traditional for 干 in the sense of doing work, and in Taiwan
# also the common obscenity - 幹 on its own is roughly "f---". locales/zh/
# leans on 干活 and 照干不误 as plain workmanlike words, and converting them
# literally puts a vulgarity in the middle of a sentence about compressing a
# photograph, 115 times. Every one is reworded to 做 or 運作 rather than
# converted. The catch-all at the end of that group is only safe because the
# corpus has no 幹部/主幹/骨幹 - see the guard in main().
#
# Ordered longest-first: each rule may feed the next, so 照幹不誤 has to be
# spent before the bare 幹 rule can reach it.
TAIWAN_REGISTER = [
    # 幹/活 as "work", reworded rather than converted.
    ('照幹不誤', '照常運作'),
    ('照樣幹活', '照樣運作'),
    ('把活幹完', '把工作做完'),
    ('這活怎麼幹', '這件事怎麼做'),
    ('這活要做什麼', '這件事要做什麼'),
    ('同樣的活再幹一遍', '同樣的工作再做一遍'),
    ('幹同樣的活', '做同樣的事'),
    ('是個細緻活', '是件細緻的事'),
    ('幹這活', '做這件事'),
    ('活全在', '工作全在'),
    ('活是在', '工作是在'),
    ('活在你自己的硬體上幹', '工作在你自己的硬體上執行'),
    ('瀏覽器的活', '瀏覽器的工作'),
    ('幹活', '運作'),
    ('幹光柵化', '負責光柵化'),
    ('幹什麼', '做什麼'),
    ('幹一件事', '做一件事'),
    ('幹到一半', '做到一半'),
    ('幹不了', '做不到'),
    ('幹得了', '做得到'),
    ('幹', '做'),

    # 兒化. Northern mainland speech, not written in Taiwan.
    ('這兒', '這裡'), ('那兒', '那裡'), ('哪兒', '哪裡'),
    ('一會兒', '一下'), ('點兒', '點'), ('事兒', '事'),
    ('個兒', '個'), ('勁兒', '勁'), ('份兒', '份'), ('玩兒', '玩'),

    # Vocabulary the s2twp phrase table does not carry.
    ('賬', '帳'),                  # 賬號 -> 帳號
    ('質量', '品質'),              # in Taiwan 質量 is physics mass
    ('站點', '網站'),
    ('實時', '即時'),
    ('計劃', '計畫'),
    ('安裝包', '安裝檔'),
    ('進位制', '進位'),            # 十六進位制 -> 十六進位
    ('麵包屑導航', '麵包屑導覽'),
    # 剪切 became 剪下, which in Taiwan is the clipboard verb. Every one of
    # these is a video or audio trim, and no text tool uses the word.
    ('剪下', '剪輯'),
]


def convert(text):
    out = cc.convert(text)
    for a, b in SELF_NAMING + COMMENT_LABEL + TAIWAN_REGISTER:
        out = out.replace(a, b)
    return out


def locale_header():
    """zh-TW's own front matter, replacing zh's house-style essay.

    zh's header explains decisions a writer made. This file has no writer, so
    it says where it came from instead.
    """
    return '''#
# 繁體中文.
#
# GENERATED. Do not edit this file by hand - run zh-tw-sync.py, which derives
# every locales/zh-TW/ file from the locales/zh/ file beside it. An edit here
# is lost the next time somebody touches the Simplified copy.
#
# Traditional and Simplified are one language in two scripts, so zh-TW is a
# conversion of zh rather than a second translation: opencc's s2twp profile,
# which does the script AND the Taiwan vocabulary (伺服器, 影片, 快取, 記憶體,
# 介面, 原始碼, and 檔案 for a computer file against 文件 for a document).
# zh-tw-sync.py explains what that profile gets right that a character table
# does not.
#
# What that means for reviewing it: this is a faithful conversion of prose a
# Chinese writer wrote, not prose a Taiwan writer wrote. The vocabulary is
# Taiwanese and the phrasing is not always. A native reviewer improving a line
# should improve it in locales/zh/ if it is wrong in both, and should say so
# here if it is only wrong in Traditional - at which point this file stops
# being generated and starts being maintained, which is a decision worth
# making deliberately.
#
# No [slugs] table, for the reason locales/zh/ gives: a Han slug percent-encodes
# and pinyin is not a phrase anybody searches for.
#
# `hreflang` is zh-Hant rather than zh-TW, on the reasoning zh gives for
# zh-Hans over zh-CN: the distinction that matters to a reader is the script.
#

'''


def main():
    check = '--check' in sys.argv
    if not SRC.is_dir():
        sys.exit(f'{SRC} is not there')

    corpus = ''.join(p.read_text(encoding='utf-8')
                     for p in SRC.rglob('*')
                     if p.suffix in ('.toml', '.html') and p.is_file())
    legit = re.findall(r'干部|主干|骨干|树干|躯干|干线|才干', corpus)
    if legit:
        sys.exit('locales/zh/ now uses 干 in a sense the catch-all rule in '
                 f'TAIWAN_REGISTER would wreck: {set(legit)}. Give it its own '
                 'rule above that one before running this again.')

    changed, written = [], 0
    for src in sorted(SRC.rglob('*')):
        if src.suffix not in ('.toml', '.html') or not src.is_file():
            continue
        rel = src.relative_to(SRC)
        text = src.read_text(encoding='utf-8')

        if rel.as_posix() == 'locale.toml':
            # Drop zh's header essay - everything up to the first key - and
            # put this locale's provenance note in its place.
            body = text[text.index('lang = "zh"'):]
            for a, b in IDENTITY:
                body = body.replace(a, b, 1)
            body = convert(body)
            # Declared here rather than in the conversion because it is a fact
            # about this locale, not a translation of one of zh's.
            body = body.replace('complete = true',
                                'fallback = "zh"\n\ncomplete = true', 1)
            out_text = locale_header() + body
        else:
            out_text = convert(text)

        dest = OUT / rel
        before = dest.read_text(encoding='utf-8') if dest.is_file() else None
        if before != out_text:
            changed.append(rel.as_posix())
        if not check:
            dest.parent.mkdir(parents=True, exist_ok=True)
            # write_bytes, never write_text: Python turns \n into \r\n on
            # Windows and every file in this repository is LF.
            dest.write_bytes(out_text.encode('utf-8'))
            written += 1

    if check:
        for name in changed:
            print(f'  would change {name}')
        print(f'{len(changed)} of {written or len(changed)} files differ')
        return 1 if changed else 0

    print(f'{written} files written, {len(changed)} changed')
    return 0


if __name__ == '__main__':
    sys.exit(main())
