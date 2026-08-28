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
site never needs it - what ships is the committed output. The share tool's
pages are the one exception: they were never this script's output and it
skips them - see MAINTAINED below.

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

    # Conversions s2twp got outright WRONG, not merely mainland. 登录表单
    # (login form) was segmented as 登录表+单 and became 登錄檔單 - "registry
    # file form" - five times in password-generator. 干的活 (the work X does)
    # picked the 乾 of 乾淨 and reads "dry work". 那张表 (that table) became
    # a wristwatch, and 图像 came out as the nonword 影象.
    ('登錄檔單', '登入表單'),
    ('乾的活', '做的事'),
    ('那張錶', '那張表'),
    ('影象', '影像'),
    # 扩展 always becomes 擴充套件, the thing you install in a browser. That is
    # right in the two places that mean one - the Windows store codec and the
    # browser add-on in password-generator - and wrong in the three that mean a
    # structure inside a file: a WebP extended header, and the plain text and
    # application blocks in a GIF. Those are a 擴充標頭 and 擴充區塊.
    ('擴充套件頭', '擴充標頭'),
    ('純文字擴充套件', '純文字擴充區塊'),
    ('應用擴充套件', '應用程式擴充區塊'),

    # 兆 for a megabyte is the reading that CANNOT stay: in Taiwan 兆 is
    # 10^12, so 一兆位元組 literally claims a terabyte. Spelled out as MB,
    # which is how a Taiwan page writes file sizes anyway. Longest first,
    # and the catch-all 幾兆 last.
    ('下發一兆的引擎', '多下載 1 MB 的引擎'),
    ('一兆位元組', '整整 1 MB'),
    ('幾兆位元組', '幾 MB'),
    ('一兆開外', '超過 1 MB'),
    ('每次四兆', '每次 4 MB'),
    ('分鐘十兆', '分鐘 10 MB'),
    ('兩三兆', '兩三 MB'),
    ('幾百兆', '幾百 MB'),
    ('幾兆幾兆', '幾 MB 幾 MB'),
    ('幾兆', '幾 MB'),

    # 下發 for assets served with the page is officialese in Taiwan (it is
    # what a ministry does to a circular). The 引擎 case is in the 兆 group.
    ('隨頁面一起下發的', '隨頁面一起送來的'),
    ('隨頁面下發的', '隨頁面送來的'),
    ('從這個源下發', '從這個來源送出'),

    # The word for a browser tab is 分頁; 標籤 alone (a label, an EXIF tag)
    # stays what it is.
    ('標籤頁', '分頁'),

    # The paste verb. zh writes 粘 for every paste - 粘進, 粘到, 一粘 - and
    # Taiwan pastes with 貼. The corpus has no other sense of 粘 (checked:
    # no 粘貼, no 粘稠), so the bare character is safe to swap.
    ('粘', '貼'),

    # A barcode is a 條碼.
    ('條形碼', '條碼'),

    # Vocabulary the scanner, stacker and DICOM pages brought in. A scanned
    # document is a 掃描檔, ultrasound is 超音波, greyscale is 灰階, and
    # image noise is 雜訊 - 噪點 and 噪聲 both read mainland.
    ('掃描件', '掃描檔'),
    ('超聲', '超音波'),
    ('灰度', '灰階'),
    ('噪點', '雜訊'),
    ('噪聲', '雜訊'),
    ('位深', '位元深度'),

    # Devices and UI. 攝像頭 is the one mainland word every Taiwan reader
    # trips on; the pages that talk about cameras already use 鏡頭 half the
    # time, so this also makes them consistent.
    ('攝像頭', '鏡頭'),
    ('郵箱', '信箱'),
    ('幻燈片', '投影片'),
    ('批註', '註解'),
    ('讀屏軟體', '螢幕閱讀器'),
    ('高分屏', '高解析度螢幕'),
    ('半屏', '半個螢幕'),
    ('全屏', '全螢幕'),
    ('佔屏更多', '佔的版面更多'),
    ('這一屏', '這個畫面'),
    ('首屏', '第一屏'),

    # Portrait and landscape. Taiwan says 直式/橫式 and photography says
    # 直幅/橫幅; 豎 on its own reads translated.
    ('橫著豎著都好使', '橫拿直拿都好用'),
    ('橫豎對調', '橫直對調'),
    ('橫豎混雜', '橫直混雜'),
    ('豎構圖', '直幅構圖'),
    ('橫構圖', '橫幅構圖'),
    ('豎影片', '直式影片'),
    ('豎著拍', '直拍'),
    ('豎著的', '直式的'),
    ('豎屏', '直式'),
    ('豎版', '直式'),
    ('橫版', '橫式'),
    ('豎向', '直向'),
    ('豎的', '直的'),

    # 二維碼 is not what Taiwan calls it - everybody, down to government
    # sites, says QR Code. The spacing against Han neighbours is normalised
    # by TAIWAN_REGISTER_RE below.
    ('二維碼', 'QR Code'),
    ('掃碼人', '掃碼的人'),

    # Software vocabulary the s2twp table does not carry.
    ('生成器', '產生器'),
    ('生成', '產生'),
    ('自帶的性質', '本身的性質'),
    ('自帶', '內建'),
    ('兜底', '備援'),
    ('響應', '回應'),          # every one is an HTTP response
    ('檔位', '等級'),          # 档位: quality presets, not gears
    ('型別', '類型'),          # s2twp overreach: 型別 is for type systems
    ('IP 地址', 'IP 位址'),
    ('算力', '運算能力'),
    ('寬高比', '長寬比'),
    ('拷進', '複製進'),
    ('直接拷的', '直接複製的'),
    ('導成', '轉成'),          # bare 導 as "export" is mainland shorthand
    ('再導一次', '再匯出一次'),
    ('重導一次', '重新匯出一次'),
    ('別等導完', '別等轉完'),
    ('導回去', '匯回去'),

    # A GIF that plays again is 循環, not 迴圈 - 迴圈 is a for-loop, and the
    # pages use it for both. The code loops (src/hash.js and friends) keep
    # 迴圈; the playback senses are enumerated.
    ('迴圈次數', '循環次數'),
    ('迴圈塊', '循環塊'),
    ('一直迴圈', '一直循環'),
    ('無限迴圈', '無限循環'),
    ('迴圈幾遍', '循環幾遍'),
    ('無聲迴圈', '無聲循環'),
    ('來回迴圈', '來回循環'),
    ('讓迴圈接得住', '讓循環接得住'),
    ('迴圈不該跳', '循環不該跳'),
    ('迴圈 1 次', '循環 1 次'),
    ('沒有迴圈', '沒有循環'),
    ('迴圈回去', '循環回去'),
    ('迴圈並不屬於', '循環並不屬於'),
    ('迴圈來自', '循環來自'),
    ('差得遠，迴圈', '差得遠，循環'),
    ('每幀都一樣長的迴圈', '每幀都一樣長的循環'),
    ('>迴圈<', '>循環<'),

    # Colloquialisms that read translated-from-the-mainland. Each was checked
    # against every occurrence; the ones that are also Taiwan idiom (順手,
    # 講究, 對付, 挺得過/挺不過 as "withstand") are deliberately absent.
    ('靠譜', '可靠'),
    ('路子', '方法'),
    ('聽上去', '聽起來'),
    ('聽著像', '聽起來像'),
    ('聽著也', '聽起來也'),
    ('都挺好', '都很好'),
    ('是挺抓眼', '是很搶眼'),
    ('最銳，', '最銳利，'),
    ('不會更銳。', '不會更銳利。'),
    ('實打實的活', '實實在在的工作'),
    ('實打實', '實實在在'),
    ('活兒', '工作'),
    ('死活不收', '說什麼都不收'),
    ('標了半天的活', '標了半天的成果'),
    ('做了它的活', '做了它該做的事'),
    ('件活', '件事'),
    ('一摞', '一疊'),
    ('那玩意兒', '那東西'),
    ('它倆', '這兩個'),
    ('還湊合', '還過得去'),
    ('別抹圓過去', '別含糊帶過去'),
    ('攢起來', '累積起來'),
    ('攢出一份', '湊出一份'),
    ('很會攢', '很會囤'),
    ('摳出來', '裁出來'),
    ('岔子', '差錯'),

    # Taiwan quotes corner brackets. zh never nests the two styles, so the
    # blanket swap is safe (checked: no “…「…”… anywhere in the corpus).
    ('“', '「'), ('”', '」'), ('‘', '『'), ('’', '』'),
]

# Rules that need context a plain pair cannot see. Applied after
# TAIWAN_REGISTER, in order.
TAIWAN_REGISTER_RE = [
    # s2twp segments 还是只能 as 还是只+能 and writes the animal counter:
    # 隻能, 隻想, 隻看. A 隻 in front of a verb is always that mis-split
    # (the one idiom spelled 隻字 has no verb after it).
    (re.compile(r'隻(?=[能想看讀說播會])'), '只'),
    # s2twp reads 个中 as the idiom 箇中 ("therein") and writes the archaic
    # counter, so "一个中间夹着文件夹的编辑器" came out as 一箇中間. Nothing in
    # this corpus uses that idiom: every 个中 in it is the counter 個 followed
    # by 中間 or 中的.
    (re.compile(r'箇(?=中)'), '個'),
    # 看著 as "looks/appears" is mainland; Taiwan says 看起來. The watching
    # sense (看著它, 看著時長變化) is real in both and must survive, so the
    # appears-sense is recognised by what follows.
    (re.compile(r'看著(?=[很並不像沒順都是最真合完一發周挺<])'), '看起來'),
    # 活 as "the work": the compounds are in TAIWAN_REGISTER, this is the
    # catch-all 的活 with a guard for 活動/活頁 and friends.
    (re.compile(r'的活(?![動頁力潑口水])'), '的工作'),
    # 里 is the locative 裡 in every one of its occurrences here, and s2twp
    # converts most of them - but not the ones it mis-segments, which left
    # 軌道里 and 東西里 standing two lines from a correctly converted 檔案裡.
    # A distance or a township 里 would be wrecked by this, so main() checks
    # that locales/zh/ has none before the rule can run.
    (re.compile(r'里'), '裡'),
    # 摳字眼 wraps across a line in its TOML value.
    (re.compile(r'摳\\?\n\s*字眼'), '咬文嚼字'),
    # Spacing where a replacement above put Latin against Han: the corpus
    # spaces Latin from Han everywhere else, so QR Code and MB follow.
    (re.compile(r'(?<=[一-鿿])(?=QR Code)'), ' '),
    (re.compile(r'(?<=QR Code)(?=[一-鿿])'), ' '),
    (re.compile(r'(?<=MB)(?=[一-鿿])'), ' '),
]

# ---------------------------------------------------------------------------
# Files that are NOT generated. The locale header names the moment a file
# stops being generated and starts being maintained; these four crossed it.
# The share tool's pages were written by hand at Taiwan register in the
# commit that gave the tool its languages, and every zh edit since has been
# carried into them by hand in the same commit. Converting zh would be a
# strict regression - it puts back 倉庫 for 儲存庫, IP地址 for IP位址,
# mainland ASCII quotes for 「」, and mis-segmentations like 復制 - so the
# committed text is the truth and this script leaves it alone. An edit to
# the zh side of any of these has to be carried over by hand.
MAINTAINED = {
    'pages/guides/share-text-between-devices.html',
    'pages/guides/share-text-between-devices.toml',
    'tools/share-text.html',
    'tools/share-text.toml',
}


def convert(text):
    out = cc.convert(text)
    for a, b in SELF_NAMING + COMMENT_LABEL + TAIWAN_REGISTER:
        out = out.replace(a, b)
    for pattern, repl in TAIWAN_REGISTER_RE:
        out = pattern.sub(repl, out)
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
# every locales/zh-TW/ file from the locales/zh/ file beside it, except the
# hand-maintained few its MAINTAINED list names. An edit here is lost the
# next time somebody touches the Simplified copy.
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
# making deliberately. It has been made once: the share tool's pages are
# maintained, and zh-tw-sync.py's MAINTAINED list says why.
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

    miles = re.findall(r'公里|英里|海里|里程', corpus)
    if miles:
        sys.exit('locales/zh/ now uses 里 in a sense that is not the locative '
                 f'裡: {set(miles)}. The rule in TAIWAN_REGISTER_RE converts '
                 'every 里; give this one an exception before running again.')

    changed, written = [], 0
    for src in sorted(SRC.rglob('*')):
        if src.suffix not in ('.toml', '.html') or not src.is_file():
            continue
        rel = src.relative_to(SRC)
        if rel.as_posix() in MAINTAINED:
            continue
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
