"""
The modules that exist as more than one copy, and have to stay in step.

WHY THERE ARE COPIES AT ALL

The MP4 reader is about seven hundred lines of box parsing and it sits in every
tool that reads frames out of a video file. It is a copy because of a rule that
held until tests/js/resolve-shared.mjs: a shared module is copied into a tool
at build time, at src/shared/, so a source file importing one could not be
loaded outside a build - and the JavaScript tests import tool modules straight
off the disk with no build in front of them. Every one of those tools reaches
the reader from a leaf module that has tests (grab-frame's frames.js,
trim-video's copy.js), so sharing it would have traded those tests for the
deduplication.

That rule is gone. The tests now resolve a tool module's `./shared/` imports to
shared/js/ themselves, and exif-editor and merge-pdf were the first to give up
their copies of the CRC and the ZIP writer on the strength of it. Every group
below is a move that has not happened yet, and until it happens the copies
still have to agree - which is all this file has ever enforced. See "Shared
parts" in docs/adding-a-tool.md.

WHAT THIS ENFORCES INSTEAD

The harm in a duplicated parser is not that it is long. It is that a fix
applied to one copy leaves the others wrong, silently, with nothing to say so -
each copy has its own tests and they all keep passing. So the copies are
declared here, and this fails if any group stops agreeing.

Declaring is not left to whoever remembers. The copies are found from disk: two
files of the same name whose tokens are equal are a copy, and one that is not
declared fails. It has to work that way round, because a module copied into a
second tool arrives under a name of its author's choosing - and a file the
declarations have never heard of is exactly the one nobody will think to add.
The name alone proves nothing in the other direction: every tool has a main.js
and no two of them are the same file.

Comments are not compared. Each copy explains itself in terms of the tool it
sits in, and that is correct - `minify.tokenize_js` drops comments, so what is
compared is the code and only the code.

The groups are deliberate, not accidental:

  - demux.js has two. The trim and reverse tools write the original frames back
    untouched, so their reader carries the sample entry and the display matrix
    out of the file whole; the crop, grab-frame and video-to-gif readers
    re-encode and have no use for either. That difference is commented in the
    files and is the only difference between the groups.
  - demux.js's first group re-encodes and has no use for the sample entry or
    the display matrix, and the time-lapse maker joined it for that reason: it
    draws every frame through a canvas too. What it wants the reader for is
    different - the sample table is what lets it decode one frame in a hundred -
    but that is a use of the reader, not a change to it.
  - mp4.js has two groups. Trim and reverse write the sound that arrived back
    out with the picture, so their writer interleaves two tracks. Images-to-video
    and the time-lapse maker both write one video track and no audio - a
    time-lapse has no sound worth keeping - so they share the smaller muxer.
    crop-video's writer is its own: it carries audio like the trim pair and takes
    a different timescale and tkhd signature from either.
  - pdf.js is the PDF container writer, in the tool that puts pictures on pages
    and the one that puts straightened pages on pages. It is the same file on
    purpose and there is nothing in it either of them wants differently: an
    object table, a stream, a trailer. What sits ON TOP of it is not shared and
    should not be - images-to-pdf has to place a picture of any shape on a page
    of any other, with fit modes and rotation and a page colour, while a
    scanned page is already the right shape and its layout is twenty lines.
  - qr-tables.js is in the QR generator and the QR reader, and is the same file
    on purpose: it is the specification's tables and the arithmetic around them,
    and a reader that disagreed with the writer about the size of a symbol or
    the split of its blocks would be wrong rather than different. The field
    arithmetic beside it is NOT shared - gf256.js computes a remainder and
    reed-solomon.js finds errors, which are different halves of the same
    mathematics - so those two are not a group and are not meant to be.
  - The four PDF modules were one group each across three tools, and are the
    first group to have made the move: they are shared/js/pdf-{objects,reader,
    filters,writer}.js now, asked for by the compressor, the merger and the
    redactor alike. What is left of them here is the two singletons below, for
    the readers that share nothing with the PDF one but its old name.

Adding another copy of one of these, or a new duplicated module, means adding
it here. `test_identical_copies_are_declared` finds it on disk and fails until
it is, and `test_every_copy_is_declared` then holds the other copies of that
name to being either grouped or listed below with a reason.
"""

import collections
import itertools
import pathlib
import re
import unittest

from buildlib import minify

ROOT = pathlib.Path(__file__).resolve().parents[2]
TOOLS = ROOT / 'tools'

# (module, tools whose copies must be identical to each other)
GROUPS = [
    ('demux.js', ['crop-video', 'grab-frame', 'timelapse-video', 'video-to-gif']),
    ('demux.js', ['reverse-video', 'trim-video']),
    ('mp4.js', ['reverse-video', 'trim-video']),
    ('mp4.js', ['images-to-video', 'timelapse-video']),
    ('qr-tables.js', ['qr-barcode', 'qr-barcode-reader']),
    ('pdf.js', ['document-scanner', 'images-to-pdf']),
    # The five below were already identical, token for token, and were found
    # by test_identical_copies_are_declared the day it was written rather than
    # by anybody noticing. They are declared as what they are. Two more sat
    # beside them - crc32.js and zip.js in exif-editor and merge-pdf - until
    # those tools were pointed at shared/js/ instead, the day the tests learned
    # to follow a ./shared/ import.
    ('wav.js', ['edit-audio', 'extract-audio-from-video', 'trim-audio']),
    ('samplerate.js', ['edit-audio', 'extract-audio-from-video', 'trim-audio']),
    ('decode.js', ['edit-audio', 'extract-audio-from-video', 'trim-audio']),
    ('support.js', ['crop-video', 'trim-video']),
    ('support.js', ['reverse-video', 'timelapse-video']),
    # The text parsers, across the three pages that read them. json-formatter
    # is the one that has all of them; yaml-to-json and xml-formatter were split
    # out of it so that "yaml to json" and "xml formatter" have an address that
    # says so, and each took the parsers it needs and no others. errors.js is
    # here because a ParseError carries the line, the column and a phrase key,
    # and three pages reporting the same broken file differently would be worse
    # than any of them reporting it badly.
    ('json.js', ['json-formatter', 'xml-formatter', 'yaml-to-json']),
    ('errors.js', ['json-formatter', 'xml-formatter', 'yaml-to-json']),
    ('xml.js', ['json-formatter', 'xml-formatter']),
    ('yaml.js', ['json-formatter', 'yaml-to-json']),
]

# Copies that are not duplicates of anything, and why. Named so that
# test_every_copy_is_declared can tell "deliberately its own" from "forgotten".
SINGLETONS = {
    ('mp4.js', 'crop-video'): 'its own timescale and tkhd signature',
    # The groups are keyed by file name, and a shared name is not a shared
    # module. Both of these are byte cursors over a format that is not PDF,
    # and the DICOM one swaps endianness inside a single file, which nothing
    # reading a PDF has any reason to do. The PDF reader they were once
    # confused with is shared/js/pdf-reader.js now; these two are each other's
    # only namesakes left under tools/.
    ('reader.js', 'gif-analyzer'): 'a GIF reader, related to the DICOM one by name only',
    ('reader.js', 'dicom-viewer'): 'a DICOM reader, related to the GIF one by name only',
    # decode.js and support.js each ask their tool's own question, and the
    # copies below answer a different one from the group that shares the name.
    ('decode.js', 'timelapse-video'):
        'decodes the few runs of samples a time-lapse samples, not a whole track',
    ('support.js', 'grab-frame'):
        'asks about still formats, because this tool writes pictures and encodes no video',
    ('support.js', 'images-to-video'):
        'asks only about encoding, because nothing here reads a video in',
    ('support.js', 'video-to-gif'):
        'asks only about reading, because the GIF encoder is in this folder',
    # The three convert.js files are the same functions in different
    # combinations, which is why they are singletons rather than a group. The
    # parsers beside them ARE grouped, so a fix to the YAML reader or the XML
    # reader still lands everywhere; what differs here is only which pair of
    # conversions the file carries, and carrying the other pair would mean
    # shipping a parser the tool never calls.
    ('convert.js', 'json-formatter'):
        'both pairs, because that page offers all four conversions',
    ('convert.js', 'yaml-to-json'):
        'the YAML pair alone, so the tool ships no XML parser it never calls',
    ('convert.js', 'xml-formatter'):
        'the XML pair alone, so the tool ships no YAML parser it never calls',
}


def tokens(module, tool):
    path = TOOLS / tool / 'src' / module
    return [text for _, text
            in minify.tokenize_js(path.read_text(encoding='utf-8'), str(path))]


class Groups(unittest.TestCase):
    def test_each_group_agrees(self):
        for module, tools in GROUPS:
            first = tools[0]
            expected = tokens(module, first)
            for other in tools[1:]:
                with self.subTest(module=module, a=first, b=other):
                    self.assertEqual(
                        expected, tokens(module, other),
                        f'tools/{first}/src/{module} and tools/{other}/src/'
                        f'{module} have drifted apart. They are copies of one '
                        f'another; a fix to one belongs in both.')

    def test_the_groups_are_not_secretly_one_group(self):
        # If the two demux groups ever become identical, the reason for having
        # two has gone and they should be one - which is worth being told.
        readers = [tokens('demux.js', tools[0])
                   for module, tools in GROUPS if module == 'demux.js']
        self.assertNotEqual(
            readers[0], readers[1],
            'the two demux.js groups now agree, so there is no longer a reason '
            'for two - collapse them into one group here')


class Coverage(unittest.TestCase):
    def test_identical_copies_are_declared(self):
        """A file copied to a second tool has to be declared, whatever it is called.

        The test below this one only ever looked at module names it had already
        been told about, so it could confirm that the copies of a DECLARED name
        were all accounted for and could not see a name nobody had mentioned.
        That is the wrong way round for the thing the file exists to catch: a
        module copied into a second tool arrives under a name of its author's
        choosing, and stayed invisible here precisely because it was new.

        So this one starts from disk. Two files with the same name whose token
        streams are equal are a copy by any reading, and have to sit in a group
        that keeps them in step. Nothing is inferred from the name alone -
        every tool has a main.js and no two of them are the same file.
        """
        by_name = collections.defaultdict(list)
        for path in sorted(TOOLS.glob('*/src/*.js')):
            by_name[path.name].append(path.parts[-3])

        for module, tools in sorted(by_name.items()):
            if len(tools) < 2:
                continue
            streams = {tool: tokens(module, tool) for tool in tools}
            groups = [set(group) for name, group in GROUPS if name == module]
            for one, other in itertools.combinations(tools, 2):
                if streams[one] != streams[other]:
                    continue
                with self.subTest(module=module, tools=(one, other)):
                    self.assertTrue(
                        any({one, other} <= group for group in groups),
                        f'{module}: the copies in {one} and {other} are identical '
                        f'and are not declared together in GROUPS. Declare them, '
                        f'or give one of them a reason to differ.')

    def test_every_copy_is_declared(self):
        for module in sorted({module for module, _ in GROUPS}
                             | {m for m, _ in SINGLETONS}):
            on_disk = {path.parts[-3]
                       for path in TOOLS.glob(f'*/src/{module}')}
            declared = {tool for m, tools in GROUPS if m == module
                        for tool in tools}
            declared |= {t for m, t in SINGLETONS if m == module}
            with self.subTest(module=module):
                self.assertEqual(
                    on_disk, declared,
                    f'{module}: the copies on disk and the ones declared in '
                    f'this file disagree. A new copy has to join a group or '
                    f'be listed as a singleton with the reason.')

    def test_declared_copies_exist(self):
        for module, tools in GROUPS:
            for tool in tools:
                with self.subTest(module=module, tool=tool):
                    self.assertTrue(
                        (TOOLS / tool / 'src' / module).is_file(),
                        f'tools/{tool}/src/{module} is declared here and is '
                        f'not on disk')


# The two stylesheets. `.footer-*` is not a module and could not be declared
# above, but it is the same failure in another language: one footer partial,
# rendered on every page in the site, and two hand-kept copies of the rules
# that dress it - shared/site.css for the hub, the guides and the prose pages,
# shared/css/tool-frame.css for the tool pages.
#
# Every simple selector in a group has to mention the footer for the group to
# count here. That is not fussiness: `main, .topbar, ..., footer` sets the page
# width, and the list either side of `footer` is legitimately different in the
# two sheets, because a tool page and a hub page are not made of the same parts.
FOOTER_SHEETS = ('shared/site.css', 'shared/css/tool-frame.css')
RULE = re.compile(r'([^{}]+)\{([^{}]*)\}')
COMMENT = re.compile(r'/\*.*?\*/', re.S)


def footer_rules(path):
    """The footer rules of one sheet, as {selectors: declarations}, whitespace
    and comments normalised away."""
    css = COMMENT.sub('', (ROOT / path).read_text(encoding='utf-8'))
    rules = {}
    for group, body in RULE.findall(css):
        parts = [' '.join(part.split()) for part in group.split(',')]
        if all('footer' in part for part in parts):
            rules[', '.join(parts)] = ' '.join(body.split())
    return rules


class TheFooterInBothSheets(unittest.TestCase):
    """The footer is one partial and has to look like one thing.

    This is here because it drifted: the row of marks under "Get in touch" was
    written into the tool sheet and not the other, so it was checked on a tool
    page, looked right, and shipped as three enormous unstyled logos down the
    side of every page that is not a tool. Nothing in the build could say so -
    a stylesheet missing a rule is not an error, it is a page.
    """

    def test_the_two_sheets_dress_the_footer_the_same(self):
        site, frame = (footer_rules(path) for path in FOOTER_SHEETS)
        for selector in sorted(set(site) | set(frame)):
            with self.subTest(selector=selector):
                self.assertEqual(
                    site.get(selector), frame.get(selector),
                    f'{selector}: the two sheets disagree. The footer is one '
                    f'partial on every page, so a rule added to '
                    f'{FOOTER_SHEETS[1]} belongs in {FOOTER_SHEETS[0]} too, '
                    f'and identically.')


if __name__ == '__main__':
    unittest.main()
