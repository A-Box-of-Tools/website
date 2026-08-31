"""
The drawn marks: one Lucide icon per tool, inlined into the pages.

WHY THE FILES UNDER shared/icons/ ARE UPSTREAM'S, BYTE FOR BYTE

They are copied out of the Lucide repository unchanged, wrapper and all, and
this module strips the wrapper at build time rather than the wrapper being
stripped once by hand and the result checked in. That costs a few lines here
and buys the thing this site keeps asking of everything else in it: a reader
who doubts these are really Lucide's drawings can diff the folder against
Lucide's own and get nothing back. A hand-tidied copy could only be taken on
trust.

Lucide is ISC, which asks that the notice travel with the copies - so
shared/icons/LICENSE is the file that came with them, and it is why the folder
is one directory rather than a scatter of files loose in shared/.

WHY THE WRAPPER IS DROPPED AT ALL

Upstream ships each icon as a complete <svg> with its own width, height,
stroke-width and colour. Inlined as-is, every mark on the hub would carry a
fixed 24x24 and a stroke this site never chose, and the CSS could not reach
past them. What is kept is the geometry; the <svg> around it is written by the
template that is placing it, which is what lets one drawing be the 1.6rem mark
on a hub card and the 2rem one beside a tool's heading without a second copy.
"""

import re

from . import site as sitelib

# The <svg> element upstream wraps every icon in, and the closing tag. Non-greedy
# up to the first '>' so an attribute value containing one could not swallow the
# geometry - none does today, and this is not the file to find that out in.
WRAPPER = re.compile(r'\A\s*<svg\b[^>]*>(?P<inner>.*)</svg>\s*\Z', re.S)

# Two or more spaces, or a newline and its indent: upstream pretty-prints one
# element per line, and inside a page holding an icon for every tool that is a
# lot of whitespace saying nothing.
GAPS = re.compile(r'\s*\n\s*')


def inner(root, name):
    """The geometry of one icon, as a single line, ready to sit inside an <svg>
    the template writes.

    Raises rather than returning a placeholder: a tool naming an icon that is
    not here is a tool that would render an empty box on the hub, and an empty
    box is exactly the kind of failure that reaches production because nobody
    could see it in a diff.
    """
    path = root / 'shared' / 'icons' / f'{name}.svg'
    if not path.is_file():
        raise sitelib.ConfigError(
            f'no such icon: {name} (looked in shared/icons). '
            'The icons are Lucide, taken from its repository unchanged - add '
            f'shared/icons/{name}.svg from there rather than drawing one, or '
            'the folder stops being checkable against upstream.')

    text = path.read_text(encoding='utf-8')
    match = WRAPPER.match(text)
    if not match:
        raise sitelib.ConfigError(
            f'shared/icons/{name}.svg is not one <svg> element. It is meant to '
            'be upstream Lucide, unmodified; if upstream has changed shape, '
            'this is the code that has to change with it.')

    return GAPS.sub(' ', match.group('inner')).strip()


def load_all(root, names):
    """Every icon the site needs, worked out once.

    One dict for the whole build rather than a read per page: the same drawings
    are placed on the hub, on every tool page's header, and on the four
    neighbour tiles at the foot of each of them, in fifteen languages. Reading
    them off the disk each time would be about sixty thousand file opens for
    eighteen kilobytes of geometry.
    """
    return {name: inner(root, name) for name in sorted(set(names))}
