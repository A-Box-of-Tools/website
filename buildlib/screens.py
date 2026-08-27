"""
The screenshots in the guides.

WHERE THEY LIVE, AND WHY NOT BESIDE THE PAGE

A screenshot belongs to a guide, so the file sits with the guide:
`pages/guides/<guide>/screens/<name>.webp`. It is published somewhere else -
`/screens/<guide>/<name>.webp`, once, at the root of the site.

That split is about the fifteen languages. A guide is one page in English and
fifteen pages in all, at fifteen different addresses, and every one of them
shows the same picture: the tool in a screenshot is photographed in English and
the caption under it is translated, which is the arrangement the alternative -
fifteen photographs of fifteen translated tools - would cost several megabytes
and a recapture of the world to improve on. A file published under the guide's
own folder would therefore have to be copied into every language, so it is
published under none of them, and every body points at it with a root-absolute
path. `i18n.relocate` already leaves those alone.

WHY THE BUILD MEASURES THEM

A body carries the `<img>`; this fills in its `width` and `height` from the file
itself. Those two numbers are worth having - a reader on a slow connection gets
the space reserved before the picture arrives, instead of the paragraph they
were reading jumping down the screen - and they are exactly the kind of thing
that rots: a screenshot recaptured after the tool grew a field is a few pixels
taller, and the numbers describing it are sitting in fifteen translated copies
of one file. Written by the build from the bytes on disk, they cannot disagree
with the picture.
"""

import re
import struct

from buildlib.site import ConfigError

# The folder a guide keeps its screenshots in, and the folder they are all
# published under. One name, because they are the same word on purpose: a
# reader who finds /screens/trim-a-video/handles.webp in the markup can guess
# where it is kept without being told.
FOLDER = 'screens'

# Only the <img> tags that point into that folder. Anything else in a body is
# somebody else's picture and none of this business.
SHOT_IMG = re.compile(r'<img\s+([^>]*?)src="(/screens/[^"]+)"([^>]*?)>')


def find(page):
    """One page's screenshots: where each is now, and where it is published.

    `published` is the address a body writes, leading slash and all, so nothing
    downstream has to rebuild it and get it subtly different.
    """
    folder = page['dir'] / FOLDER
    if not folder.is_dir():
        return []
    name = page['slug'].rsplit('/', 1)[-1]
    found = []
    for shot in sorted(folder.iterdir()):
        if shot.suffix != '.webp':
            raise ConfigError(
                f'{page["slug"]}: {shot.name} is in {FOLDER}/ and is not a '
                f'.webp. The capture script writes WebP and the bodies ask for '
                f'it by name, so a second format here is a file nothing fetches.')
        found.append((shot, f'/{FOLDER}/{name}/{shot.name}'))
    return found


def sizes(page):
    """The pixel size of each of one page's screenshots, keyed by its address.

    Measured once, in the parent process, and carried on the page itself - a
    guide's screenshots belong to that guide, and every language builds the
    same body around them. A body that names a screenshot from a different
    guide therefore fails, which is the intended answer: two guides sharing a
    picture is two guides that will not stay in step about what it shows.
    """
    return {published: measure(source) for source, published in find(page)}


def measure(path):
    """The width and height of a WebP, read out of its header.

    Three shapes of file answer to `.webp` and the capture script has written
    two of them at different times, so all three are read rather than the one
    that happens to be there today. Everything here is little-endian and the
    two VP8 forms pack their dimensions into fourteen bits, which is the whole
    reason this is not four bytes at a fixed offset.
    """
    data = path.read_bytes()
    if len(data) < 30 or data[:4] != b'RIFF' or data[8:12] != b'WEBP':
        raise ConfigError(f'{path}: not a WebP file.')
    kind = data[12:16]
    if kind == b'VP8 ':
        # A lossy frame: three bytes of frame tag, a three byte start code,
        # then the two dimensions.
        if data[23:26] != b'\x9d\x01\x2a':
            raise ConfigError(f'{path}: WebP frame header not where it should be.')
        width, height = struct.unpack('<HH', data[26:30])
        return width & 0x3fff, height & 0x3fff
    if kind == b'VP8L':
        # Lossless: a signature byte, then fourteen bits each, minus one, run
        # together across four bytes.
        if data[20] != 0x2f:
            raise ConfigError(f'{path}: WebP lossless signature missing.')
        bits = struct.unpack('<I', data[21:25])[0]
        return (bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1
    if kind == b'VP8X':
        # Extended: the canvas size, three bytes each, minus one.
        width = int.from_bytes(data[24:27], 'little') + 1
        height = int.from_bytes(data[27:30], 'little') + 1
        return width, height
    raise ConfigError(f'{path}: unknown WebP chunk {kind!r}.')


def fill_sizes(html, known, where):
    """Fill in `width` and `height` on every screenshot in one body.

    An address the build has no file for is an error rather than a picture left
    unmeasured: check_links would catch it too, at the end, as one broken link
    among however many others - and this can say which guide's body wrote it and
    that the file is simply not there.
    """
    def fill(match):
        before, src, after = match.groups()
        size = known.get(src)
        if size is None:
            raise ConfigError(
                f'{where}: <img src="{src}"> names a screenshot that does not '
                f'exist. Capture it with `node screenshots/capture.mjs`, or fix '
                f'the address.')
        attributes = f'{before}src="{src}"{after}'.strip()
        if 'width=' in attributes or 'height=' in attributes:
            raise ConfigError(
                f'{where}: <img src="{src}"> carries its own width or height. '
                f'The build measures the file, so a number written by hand here '
                f'is one that can disagree with the picture.')
        width, height = size
        return f'<img {attributes} width="{width}" height="{height}">'

    return SHOT_IMG.sub(fill, html)
