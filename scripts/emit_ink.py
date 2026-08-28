"""Emit the single-colour marks from shared/logo.svg.

The geometry is read out of the colour mark rather than retyped, so these
cannot drift from it. Run from the repo root after any change to logo.svg.

How it works: the whole drawing goes into a mask verbatim, and the classes are
remapped by CSS - everything the mark is made of to white, everything that
should be a hole to black. Draw order does the rest, because in the colour mark
the glyphs already sit on top of their tiles and the ribbon on top of the box.

Two things do not come for free. The tiles need a black outline so they do not
merge into each other or into the box, and that pass has to come last so it
cuts the box too. And the open rim needs a line, because in one colour the
mouth of the box and its front face are the same shape.
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.')
SRC = (ROOT / 'shared' / 'logo.svg').read_text(encoding='utf-8')

body = SRC[SRC.index('  <!-- confetti'):SRC.rindex('</svg>')]
body = re.sub(r'<!--.*?-->\n?\s*', '', body, flags=re.S).rstrip() + '\n'

# Every tile and confetto, carrying whatever group transform it sits under, so
# the outline pass can be replayed on top of the finished drawing.
tiles, stack = [], []
for line in body.splitlines():
    s = line.strip()
    if s.startswith('<g '):
        stack.append(re.search(r'transform="([^"]+)"', s).group(1))
        continue
    if s.startswith('</g>'):
        stack.pop()
        continue
    if 'class="logo-app-' in s and s.startswith('<rect'):
        attrs = dict(re.findall(r'(\w[\w-]*)="([^"]*)"', s))
        tiles.append((attrs, list(stack)))

assert len(tiles) == 7, f'expected 3 confetti + 4 tiles, found {len(tiles)}'

outline = []
for attrs, groups in tiles:
    own = f' transform="{attrs["transform"]}"' if 'transform' in attrs else ''
    rect = (f'<rect x="{attrs["x"]}" y="{attrs["y"]}" width="{attrs["width"]}" '
            f'height="{attrs["height"]}" rx="{attrs["rx"]}"{own}/>')
    for g in reversed(groups):
        rect = f'<g transform="{g}">{rect}</g>'
    outline.append('      ' + rect)

MASK_CSS = '''    .logo-app-a, .logo-app-b, .logo-app-c, .logo-app-d,
    .logo-box, .logo-band { fill: #fff; }
    .logo-glyph, .logo-latch { fill: #000; }
    .logo-stroke { stroke: #000; }'''

TEMPLATE = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="abox.tools">
  <title>abox.tools</title>
  <!--
    The site mark in one colour. Generated from shared/logo.svg - do not edit
    the shapes here, edit them there and emit this again, or the two will say
    different things about the same logo.

    One flat colour and nothing else, which is what a print shop, an embroiderer
    or any single-plate job will ask for. Everything the colour mark separates
    by hue is separated here by a hole instead: the drawing goes into a mask
    with the tiles and the box in white and the glyphs and the ribbon in black,
    then every tile is outlined and the open rim is cut, both last so that they
    also bite into the box.

    {WHICH}

    The music glyph is Lucide's; see THIRD-PARTY-NOTICES.md.
  -->
  <style>
    .ink {{ fill: {COLOUR}; }}
{DARK}  </style>
  <mask id="abox-ink" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
    <style>
{MASK_CSS}
    </style>
{BODY}
    <g fill="none" stroke="#000" stroke-width="1.6">
{OUTLINE}
    </g>
    <g transform="rotate(38 22 42)">
      <rect fill="#000" x="6.4" y="35.3" width="31.2" height="1.4"/>
    </g>
  </mask>
  <rect class="ink" width="64" height="64" mask="url(#abox-ink)"/>
</svg>
'''

indented = '\n'.join(('    ' + l) if l.strip() else l for l in body.rstrip().splitlines())


def emit(name, colour, dark, which):
    dark_block = ''
    if dark:
        dark_block = ('    @media (prefers-color-scheme: dark) {\n'
                      f'      .ink {{ fill: {dark}; }}\n'
                      '    }\n')
    out = TEMPLATE.format(COLOUR=colour, DARK=dark_block, MASK_CSS=MASK_CSS,
                          BODY=indented, OUTLINE='\n'.join(outline), WHICH=which)
    (ROOT / 'shared' / name).write_bytes(out.encode('utf-8'))
    print('wrote shared/' + name)


emit('logo-ink.svg', '#16191d', '#e8eaed',
     'Black, and light on a dark scheme so it stays visible in a tab strip.')
emit('logo-ink-graphite.svg', '#33393f', '#aab4c0',
     'Graphite: the softer one, for screen use where flat black is too hard.')
