"""
The #phrases blocks, held in step across fifteen copies of every body.

WHY THIS IS A TEST

A sentence a visitor reads never lives in the JavaScript: src/ is copied byte
for byte into every language, so a string written there is English at all of a
page's addresses but one. The answer the repository settled on is a hidden
block of <span data-phrase> in the tool's body.html, read back by
shared/js/phrases.js - and body.html *is* translated, once per language.

Which moves the failure rather than removing it. phrases.js resolves a key it
cannot find to the key itself, deliberately: a bare `result.summary` on screen
says "this page is built wrong" plainly, and unlike a throw it cannot break the
window's own error handler. But nothing in the build looks at a translated body
and notices that it defines fourteen of the tool's fifteen keys. The page still
renders, in the right language, with one line of it reading `copy.done`.

So the rules are:

  - a locale's copy of a tool that has a #phrases block defines exactly the
    same keys - none missing, none left behind by an English block that has
    since dropped one;
  - a translated phrase fills in only blanks the caller actually passes. A
    `{files}` invented by a translator survives phrases.js untouched and
    arrives on screen with its braces on. Leaving one *out* is allowed and is
    sometimes right: Arabic says "one line" without the numeral;
  - a key is defined once per block, because the second copy is dead text that
    nobody can tell from the live one.

Regex rather than an HTML parser, for the reason test_accessibility.py gives:
these files carry template syntax that no parser accepts, and the pattern
matched is the repository's own idiom.
"""

import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

BLOCK = re.compile(r'<div id="phrases".*?</div>', re.S)
SPAN = re.compile(r'<span data-phrase="([^"]+)"\s*>(.*?)</span>', re.S)
BLANK = re.compile(r'\{(\w+)\}')


def phrases(text):
    """Every key in a body's own #phrases block, mapped to its wording."""
    block = BLOCK.search(text)
    if not block:
        return None
    return SPAN.findall(block.group(0))


def read(path):
    return path.read_text(encoding='utf-8')


def tools_with_phrases():
    """(slug, keys) for every tool whose English body defines phrases."""
    for path in sorted(ROOT.glob('tools/*/body.html')):
        found = phrases(read(path))
        if found is not None:
            yield path.parent.name, found


def locales():
    return sorted(d.name for d in (ROOT / 'locales').iterdir() if d.is_dir())


class Phrases(unittest.TestCase):
    def test_every_language_defines_every_key(self):
        wrong = []
        for slug, english in tools_with_phrases():
            keys = {key for key, _ in english}
            for lang in locales():
                path = ROOT / 'locales' / lang / 'tools' / f'{slug}.html'
                if not path.exists():
                    continue
                found = phrases(read(path))
                if found is None:
                    wrong.append(f'{lang}/{slug}: no #phrases block at all, so '
                                 f'{len(keys)} sentences render as their keys')
                    continue
                theirs = {key for key, _ in found}
                for key in sorted(keys - theirs):
                    wrong.append(f'{lang}/{slug}: {key} is not translated')
                for key in sorted(theirs - keys):
                    wrong.append(f'{lang}/{slug}: {key} is not a key the tool asks for')
        self.assertEqual([], wrong, '\n' + '\n'.join(wrong))

    def test_a_translation_invents_no_blanks(self):
        wrong = []
        for slug, english in tools_with_phrases():
            blanks = {key: set(BLANK.findall(text)) for key, text in english}
            for lang in locales():
                path = ROOT / 'locales' / lang / 'tools' / f'{slug}.html'
                if not path.exists():
                    continue
                for key, text in phrases(read(path)) or []:
                    extra = set(BLANK.findall(text)) - blanks.get(key, set())
                    for name in sorted(extra):
                        wrong.append(f'{lang}/{slug}: {key} fills in a blank the '
                                     f'caller never passes, so {{{name}}} reaches '
                                     'the page with its braces on')
        self.assertEqual([], wrong, '\n' + '\n'.join(wrong))

    def test_no_key_is_defined_twice(self):
        wrong = []
        paths = sorted(ROOT.glob('tools/*/body.html')) + \
            sorted(ROOT.glob('locales/*/tools/*.html'))
        for path in paths:
            found = phrases(read(path))
            if not found:
                continue
            seen = set()
            name = path.relative_to(ROOT).as_posix()
            for key, _ in found:
                if key in seen:
                    wrong.append(f'{name}: {key} is defined twice')
                seen.add(key)
        self.assertEqual([], wrong, '\n' + '\n'.join(wrong))


if __name__ == '__main__':
    unittest.main()
