"""
The screenshots in the guides.

WHAT IS WORTH TESTING HERE

Not that the pictures are good - nothing here can know that. What can be
checked is the two claims buildlib/screens.py makes about them, both of which
are the kind that fail silently:

  * that the width and height written into the markup are the real size of the
    file. They are filled in by the build precisely so that a recapture cannot
    leave fifteen translated bodies describing a picture that is no longer that
    shape, and a reader on a slow connection is the only person who would ever
    notice they were wrong;
  * that a body naming a screenshot which is not there is an error rather than
    a broken image. check_links would find it eventually, at the end of the
    build, as one line among however many others; this says which guide wrote
    it.

The WebP reader is worth its own tests because it is the only code in this
repository that parses an image header, and because a wrong answer from it is
not visibly wrong anywhere - the page still renders, just with the space
reserved for the wrong box.
"""

import struct
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

from buildlib import screens
from buildlib.site import ConfigError

ROOT = Path(__file__).resolve().parents[2]
GUIDES = ROOT / 'pages' / 'guides'


def lossy_webp(width, height):
    """The bytes of a lossy WebP header, which is what the capture writes."""
    frame = b'\x00\x00\x00' + b'\x9d\x01\x2a' + struct.pack('<HH', width, height)
    body = b'VP8 ' + struct.pack('<I', len(frame)) + frame
    return b'RIFF' + struct.pack('<I', len(body) + 4) + b'WEBP' + body


def lossless_webp(width, height):
    bits = (width - 1) | ((height - 1) << 14)
    frame = b'\x2f' + struct.pack('<I', bits)[:4]
    body = b'VP8L' + struct.pack('<I', len(frame)) + frame
    return b'RIFF' + struct.pack('<I', len(body) + 4) + b'WEBP' + body + b'\0' * 16


class Measuring(unittest.TestCase):
    def measured(self, data):
        with TemporaryDirectory() as folder:
            path = Path(folder) / 'shot.webp'
            path.write_bytes(data)
            return screens.measure(path)

    def test_lossy(self):
        self.assertEqual(self.measured(lossy_webp(1704, 904)), (1704, 904))

    def test_lossless(self):
        self.assertEqual(self.measured(lossless_webp(640, 480)), (640, 480))

    def test_fourteen_bits(self):
        # A lossy frame carries the dimension in fourteen bits and the top two
        # are a scaling hint, so a reader that takes all sixteen is right until
        # the day something sets them.
        raw = bytearray(lossy_webp(1200, 800))
        raw[26:30] = struct.pack('<HH', 1200 | 0xc000, 800 | 0x4000)
        self.assertEqual(self.measured(bytes(raw)), (1200, 800))

    def test_not_a_webp(self):
        with self.assertRaises(ConfigError):
            self.measured(b'\x89PNG\r\n\x1a\n' + b'\0' * 40)


class Filling(unittest.TestCase):
    known = {'/screens/trim-a-video/marks.webp': (1610, 786)}

    def test_size_is_written_in(self):
        filled = screens.fill_sizes(
            '<img src="/screens/trim-a-video/marks.webp" alt="a timeline">',
            self.known, 'a body')
        self.assertIn('width="1610"', filled)
        self.assertIn('height="786"', filled)
        self.assertIn('alt="a timeline"', filled)

    def test_other_images_are_left_alone(self):
        markup = '<img src="/logo.svg" alt="the mark">'
        self.assertEqual(screens.fill_sizes(markup, self.known, 'a body'), markup)

    def test_missing_file_names_the_body(self):
        with self.assertRaises(ConfigError) as raised:
            screens.fill_sizes('<img src="/screens/trim-a-video/gone.webp" alt="">',
                               self.known, 'guides/trim-a-video [de]')
        self.assertIn('guides/trim-a-video [de]', str(raised.exception))

    def test_a_size_written_by_hand_is_refused(self):
        # Because the point of measuring the file is that the two cannot
        # disagree, and a number in the markup is a number that can.
        with self.assertRaises(ConfigError):
            screens.fill_sizes(
                '<img src="/screens/trim-a-video/marks.webp" width="800" alt="">',
                self.known, 'a body')


class InTheTree(unittest.TestCase):
    """The screenshots actually checked in, against the bodies that use them."""

    def setUp(self):
        self.used = {}
        self.have = {}
        for guide in sorted(GUIDES.iterdir()):
            body = guide / 'body.html'
            if not body.is_file():
                continue
            found = screens.SHOT_IMG.findall(body.read_text(encoding='utf-8'))
            self.used[guide.name] = {src for _, src, _ in found}
            self.have[guide.name] = {
                f'/{screens.FOLDER}/{guide.name}/{shot.name}'
                for shot in (guide / screens.FOLDER).iterdir()
            } if (guide / screens.FOLDER).is_dir() else set()

    def test_every_screenshot_is_used(self):
        # A guide that was rewritten around a different set of pictures leaves
        # the old ones on disk, and they are then shipped and fetched by nobody.
        orphans = {guide: sorted(have - self.used[guide])
                   for guide, have in self.have.items()
                   if have - self.used[guide]}
        self.assertEqual(orphans, {})

    def test_no_guide_borrows_another_guide_s_screenshot(self):
        # The build measures each page's own screenshots and would fail on a
        # borrowed one anyway. This says why, in one line, rather than leaving
        # the next person to work it out from "names a screenshot that does not
        # exist" about a file they can plainly see.
        for guide, used in self.used.items():
            for src in used:
                self.assertTrue(
                    src.startswith(f'/{screens.FOLDER}/{guide}/'),
                    f'{guide} uses {src}, which belongs to another guide')

    def test_every_shot_has_alt_text(self):
        for guide in sorted(GUIDES.iterdir()):
            body = guide / 'body.html'
            if not body.is_file():
                continue
            for before, src, after in screens.SHOT_IMG.findall(
                    body.read_text(encoding='utf-8')):
                self.assertIn('alt="', before + after, f'{src} has no alt text')


if __name__ == '__main__':
    unittest.main()
