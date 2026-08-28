"""
The English still living in the JavaScript, counted, so that it can only fall.

WHY THIS EXISTS

`shared/js/phrases.js` says it at length: nothing under `tools/<slug>/src/` is
translated. The build copies it byte for byte into all fifteen languages, so a
sentence written in a module is that sentence in English at fourteen of the
addresses it appears at. The rule is that the words live in the markup, where
the locale machinery already reaches them, and the JavaScript reads them back
with `phrase()`.

Most of the site does not do that yet. A sweep of every string literal in every
tool finds about fifteen hundred sentences that a visitor can be shown, and
they are not the leftovers - they are the explaining voice of the tools that
explain most. The GIF analyser's byte budget, the DICOM viewer's header
diagnostics and the EXIF editor's format refusals are all English, in every
language.

Moving them is a long job. This file is what stops it getting longer while it
happens: every tool has a number below, and a tool may go down but not up.

WHAT IS COUNTED

String literals, from `minify.tokenize_js` so that comments and regular
expressions are not mistaken for them, that read like a sentence a person is
meant to understand: more than a few characters, containing a word from
`PROSE`, and not obviously a key, a MIME type, a path or a CSS declaration.

It is a heuristic and it is allowed to be. Nothing here decides whether a
particular string is a bug - it produces a number that can be compared with the
same number tomorrow. A count that is a little too high is harmless; what would
be harmful is a count that moves when nothing moved, which is why the tokenizer
does the reading rather than a regular expression over the raw file.

WHEN THIS FAILS

Going up means a sentence was written into a module. Put it in the tool's
`#phrases` block and read it with `phrase()` instead; if the module is a leaf
that cannot reach the DOM, return the key and let `main.js` resolve it, the way
svg-to-image's `sourceKey` does.

Going down means somebody moved sentences out, which is the point - lower the
number here in the same commit, so that what is left is always what the file
says is left.
"""

import re
import unittest
from pathlib import Path

from buildlib import minify

ROOT = Path(__file__).resolve().parents[2]
TOOLS = ROOT / 'tools'

# Sentences left in each tool's JavaScript. Lower these as they are moved into
# the markup; nothing may raise one. See the module docstring.
BASELINE = {
    'compare-text': 3,
    'compress-image': 2,
    'compress-pdf': 6,
    'crop-video': 0,
    'dicom-viewer': 15,
    'document-scanner': 13,
    # A clock format, and one invariant check in each of the two speed
    # modules - main.js clamps the speed, so neither can be reached.
    'edit-audio': 3,
    'encode-text': 0,
    'exif-editor': 30,
    'format-json': 3,
    # Two key templates, a CSS pixel value and two lines of table layout.
    'gif-analyzer': 5,
    'gif-maker': 22,
    # A filename template.
    'grab-frame': 1,
    'hash-checksum': 10,
    # A CSS class name and the two halves of one internal state name.
    'heic-to-jpg': 3,
    # A filename template, a dimension pair, a CSS percentage, a phrase key, the
    # note written into a padded JPEG, and the eight published citations.
    'id-photo': 13,
    # A CSS class name and one line of the CSS rule the tool writes out.
    'image-to-data-uri': 2,
    'image-to-ico': 6,
    # The /Producer string written into the PDF, five lines of PDF syntax, a
    # CSS pixel value, a key template and the output filename.
    'images-to-pdf': 9,
    # A CSS class name the list builds.
    'images-to-video': 1,
    'merge-pdf': 5,
    'password-generator': 8,
    # The two left are a symbology's own name and a line of SVG markup.
    'qr-barcode': 2,
    'qr-barcode-reader': 13,
    'redact-image': 17,
    'redact-pdf': 15,
    'resize-image': 5,
    # The key template that picks between two whole sentences.
    'reverse-video': 1,
    'share-text': 1,
    # A filename template, one line of a template literal, and three markers the
    # reader throws internally and never shows.
    'split-gif': 5,
    'stack-images': 7,
    # An internal marker for an impossible mode, and a viewBox attribute.
    'svg-to-image': 2,
    'timelapse-video': 0,
    # A filename template, a clock format, two CSS percentages and three class
    # names the timeline builds.
    'trim-audio': 7,
    'trim-video': 9,
    # A CSS class name the range bar builds and two CSS percentages.
    'video-to-gif': 3,
}

# Modules that hold somebody else's vocabulary rather than this site's prose.
#
# A name published in a standard is not a sentence, and translating one makes a
# header harder to read rather than easier: a radiographer matching a tag
# against PS3.6, or against the last viewer they used, is looking for the
# English the standard prints. Every DICOM tool in the world shows these in
# English for that reason.
#
# The bar is that the WHOLE module is that vocabulary. exif-editor's tags.js is
# not here, though it holds the EXIF tag names, because it also holds this
# site's own readings of what a value means - "No flash on this camera" is ours
# and has to move.
NOT_OURS = {
    ('dicom-viewer', 'dictionary.js'):
        'the PS3.6 attribute names, which every DICOM tool prints in English',
    ('dicom-viewer', 'uids.js'):
        'the PS3.5 transfer syntax and PS3.4 SOP class names, likewise',
}

# A word here makes a string prose rather than a name. Deliberately ordinary
# words: what marks a sentence out is that it is made of them.
PROSE = re.compile(
    r'\b(the|and|of|to|is|are|was|were|this|that|from|with|off|it|its|has|have'
    r'|not|no|yes|all|one|too|but|so|than|then|what|which|when|where|why|how'
    r'|file|files|image|images|video|frame|frames|page|pages|colour|colours'
    r'|browser|nothing|something|anything|every|each|any|more|less|only'
    r'|cannot|will|would|does|did|can|could|should|must|make|made|take|taken'
    r'|show|shown|read|write|written|drawn|drawing|size|sizes|second|seconds)\b',
    re.I)

# Strings that are made of words and are still not prose.
NOT_PROSE = (
    # A phrase key, which is the fix rather than the fault.
    re.compile(r'^[a-z0-9]+(?:\.[a-z0-9-]+)+$'),
    # Addresses, types and selectors.
    re.compile(r'^(?:\.{0,2}/|https?:|data:|blob:|mailto:)'),
    re.compile(r'^(?:image|video|audio|application|text|font)/'),
    re.compile(r'^[.#]?[a-z][\w-]*(?:\s*[>+~]\s*[.#]?[a-z][\w-]*)*$'),
    # A run of CSS declarations, or one property name.
    re.compile(r'^[a-z-]+\s*:\s*[^;]+(?:;|$)'),
    # Markup a module builds, rather than words it shows.
    re.compile(r'^<[a-z!/]'),
)

MIN_LENGTH = 6


def prose_lines(tool):
    """[(module, line, text)] for every string in a tool that reads like a sentence.

    Adjacent literals are one sentence: the corpus builds long messages by
    adding several strings together across lines, and counting each piece would
    say a tool has three sentences where it has one.
    """
    found = []
    for module in sorted((TOOLS / tool / 'src').glob('*.js')):
        if (tool, module.name) in NOT_OURS:
            continue
        source = module.read_text(encoding='utf-8')
        for line, token in minify.tokenize_js(source, str(module)):
            if token[:1] not in ('"', "'", '`'):
                continue
            text = ' '.join(token[1:-1].split())
            if len(text) < MIN_LENGTH or not PROSE.search(text):
                continue
            if any(pattern.match(text) for pattern in NOT_PROSE):
                continue
            found.append((module.name, line, text))

    sentences, last = [], (None, -9)
    for module, line, text in found:
        if module != last[0] or line - last[1] > 1:
            sentences.append((module, line, text))
        last = (module, line)
    return sentences


class EnglishInJavaScript(unittest.TestCase):

    def test_no_tool_grows_more_english(self):
        for tool in sorted(p.parent.name for p in TOOLS.glob('*/src')):
            with self.subTest(tool=tool):
                self.assertIn(
                    tool, BASELINE,
                    f'{tool} is not in BASELINE. Count its sentences with this '
                    f'file and add the number, so the next change to it can '
                    f'only take the number down.')
                found = prose_lines(tool)
                allowed = BASELINE[tool]
                if len(found) > allowed:
                    # Which of them is new cannot be known from one number, and
                    # guessing - showing the last few, say - points at
                    # sentences that have been there for months. The whole list
                    # is one command away instead.
                    self.fail(
                        f'{tool}: {len(found)} sentences in the JavaScript, '
                        f'{allowed} allowed. A sentence a visitor reads has to '
                        f'live in body.html so the other fourteen languages '
                        f'get it too - see shared/js/phrases.js.\n'
                        f'    All {len(found)}: '
                        f'python -m tests.python.test_english_in_js {tool}')
                self.assertEqual(
                    len(found), allowed,
                    f'{tool}: {len(found)} sentences left, and BASELINE still '
                    f'says {allowed}. Somebody moved sentences into the markup '
                    f'and did not lower the number; lower it to {len(found)} in '
                    f'the same commit.')

    def test_the_exemptions_name_modules_that_exist(self):
        """An exemption for a file nobody has any more is an exemption for
        nothing, and would quietly stop covering whatever replaced it."""
        for (tool, module), reason in sorted(NOT_OURS.items()):
            with self.subTest(tool=tool, module=module):
                self.assertTrue(
                    (TOOLS / tool / 'src' / module).is_file(),
                    f'NOT_OURS names {tool}/src/{module}, which is not there')
                self.assertTrue(reason.strip(), 'an exemption needs its reason')

    def test_the_baseline_names_only_tools_that_exist(self):
        on_disk = {p.parent.name for p in TOOLS.glob('*/src')}
        self.assertEqual(
            sorted(BASELINE), sorted(on_disk),
            'BASELINE and the tools on disk disagree.')


if __name__ == '__main__':
    # `python -m tests.python.test_english_in_js <tool>` lists what it counted,
    # which is what somebody moving one tool's sentences into the markup wants
    # in front of them. With no argument it runs as a test like the rest.
    import sys
    if len(sys.argv) == 2 and (TOOLS / sys.argv[1]).is_dir():
        for module, line, text in prose_lines(sys.argv[1]):
            print(f'{module}:{line}  {text}')
    else:
        unittest.main()
