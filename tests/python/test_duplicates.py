"""
The modules that exist as more than one copy, and have to stay in step.

WHY THERE ARE COPIES AT ALL

The MP4 reader is about seven hundred lines of box parsing and it sits in five
tools. The obvious answer is shared/js/, and it is not available: a shared
module is copied into a tool at build time, at src/shared/, so a source file
importing one cannot be loaded outside a build - and the JavaScript tests
import tool modules straight off the disk with no build in front of them. Every
tool that reads MP4 reaches the reader from a leaf module that has tests
(grab-frame's frames.js, trim-video's copy.js), so moving it would trade those
tests for the deduplication. See "Shared parts" in README.md.

WHAT THIS ENFORCES INSTEAD

The harm in a duplicated parser is not that it is long. It is that a fix
applied to one copy leaves the others wrong, silently, with nothing to say so -
each copy has its own tests and they all keep passing. So the copies are
declared here, and this fails if any group stops agreeing.

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

Adding a sixth copy of one of these, or a new duplicated module, means adding
it here. `test_every_copy_is_declared` fails if a copy exists that no group
names, so that cannot be forgotten.
"""

import pathlib
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
]

# Copies that are not duplicates of anything, and why. Named so that
# test_every_copy_is_declared can tell "deliberately its own" from "forgotten".
SINGLETONS = {
    ('mp4.js', 'crop-video'): 'its own timescale and tkhd signature',
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


if __name__ == '__main__':
    unittest.main()
