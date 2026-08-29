"""Build the social media kit in media/ from the site mark.

    python scripts/emit_media.py

Writes the HTML the images are rendered from into media/src/, and copies the
mark itself alongside them. The PNGs in media/ are rendered from that HTML at
exact pixel sizes; media/README.md carries the command, because rasterising
needs a browser and this repository does not otherwise depend on one being
present.

Everything here derives from shared/logo.svg, which stays the only place the
shape is authored. Change the mark and run this again.

The layout is built around what X does to a header image, none of which is
guessable from the file on its own:

  1500x500 is the header size. The avatar is a circle overlapping the BOTTOM
  LEFT, covering roughly the first 210px across and 130px up from the bottom -
  so nothing that has to be read goes there. The header is cropped vertically
  on narrow screens, so the copy sits in a band about 90px clear of the top and
  bottom edges. And it is shown at roughly a third of these pixels on a phone,
  which is why the type is 72px and there are only two lines of it.

  The avatar is 400x400 and X crops it to a circle, so the mark is inset well
  clear of the corners.

Nothing in the copy states a fact that expires. A banner is a static image
nobody re-renders, so a tool count would be wrong the week after the next tool
ships and would sit there being wrong; the three chips are claims that stay
true at any size of catalogue.
"""

import pathlib
import re
import shutil
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
MEDIA = ROOT / 'media'
SRC = MEDIA / 'src'

#: The mark's palette, baked in. Same values as shared/logo.svg, repeated here
#: for the same reason og-image.ps1 repeats them: these images are rendered by
#: a headless browser that cannot be told which colour scheme to pretend to be
#: in, so the choice is made by overriding the classes instead.
LIGHT = {'logo-box': '#b07d10', 'logo-band': '#f0b429', 'logo-latch': '#e8618f',
         'logo-app-a': '#2b6cb0', 'logo-app-b': '#8b5cc7', 'logo-app-c': '#2f9e63',
         'logo-app-d': '#d94a4a', 'logo-glyph': '#ffffff', 'logo-stroke': '#ffffff'}
DARK = {'logo-box': '#c4922a', 'logo-band': '#f5c655', 'logo-latch': '#ef7fa8',
        'logo-app-a': '#5b9bd8', 'logo-app-b': '#b18ae4', 'logo-app-c': '#5cc48c',
        'logo-app-d': '#ef8080', 'logo-glyph': '#16202b', 'logo-stroke': '#16202b'}


def mark(palette, size):
    """The site mark with its colours baked in, at a given pixel size."""
    src = (ROOT / 'shared' / 'logo.svg').read_text(encoding='utf-8')
    body = src[src.index('  <!-- confetti'):src.rindex('</svg>')]
    body = re.sub(r'<!--.*?-->\n?\s*', '', body, flags=re.S)
    for cls, colour in palette.items():
        prop = 'stroke' if cls == 'logo-stroke' else 'fill'
        body = body.replace(f'class="{cls}"', f'{prop}="{colour}"')
    return (f'<svg viewBox="0 0 64 64" width="{size}" height="{size}" '
            f'aria-hidden="true">{body}</svg>')


#: Loose app tiles, at low opacity, as background texture. Kept out of the
#: middle so they never sit behind the type.
TEXTURE = [(1352, 54, 44, -14, 'logo-app-b', .15), (1428, 168, 28, 22, 'logo-app-c', .13),
           (1300, 396, 22, 40, 'logo-app-d', .12), (1418, 322, 34, -18, 'logo-app-a', .11),
           (62, 52, 26, 18, 'logo-app-c', .11), (128, 428, 18, -24, 'logo-app-b', .10),
           (1245, 250, 16, 30, 'logo-app-d', .10)]


def tiles(palette):
    return '\n'.join(
        f'  <div style="position:absolute;left:{x}px;top:{y}px;width:{s}px;'
        f'height:{s}px;border-radius:{s * 0.28:.0f}px;background:{palette[key]};'
        f'opacity:{op};transform:rotate({rot}deg)"></div>'
        for x, y, s, rot, key, op in TEXTURE)


BANNER = '''<!doctype html><meta charset="utf-8">
<style>
  * {{ box-sizing: border-box; }}
  body {{ margin: 0; width: 1500px; height: 500px; overflow: hidden; }}
  .banner {{
    position: relative; width: 1500px; height: 500px; overflow: hidden;
    background: {bg};
    font-family: "Segoe UI", system-ui, -apple-system, Roboto, sans-serif;
    color: {fg};
  }}
  .inner {{
    position: absolute; inset: 0; display: flex; align-items: center; gap: 60px;
    padding: 0 96px 0 118px;
  }}
  .copy {{ min-width: 0; flex: 1; }}
  .kicker {{
    margin: 0 0 18px; font-size: 24px; font-weight: 700; letter-spacing: 0.16em;
    text-transform: uppercase; color: {brand};
  }}
  h1 {{
    margin: 0; font-size: 72px; line-height: 1.04; letter-spacing: -0.03em;
    font-weight: 700;
  }}
  h1 .quiet {{ color: {dim}; font-weight: 600; }}
  .chips {{ display: flex; gap: 14px; margin-top: 34px; flex-wrap: wrap; }}
  .chip {{
    font-size: 22px; font-weight: 600; padding: 11px 22px; border-radius: 99px;
    background: {chipbg}; color: {chipfg}; border: 1px solid {chipbd};
    white-space: nowrap;
  }}
  .tick {{ color: {ok}; margin-right: 9px; font-weight: 700; }}
  .mark {{ flex: none; line-height: 0; }}
</style>
<div class="banner">
{texture}
  <div class="inner">
    <div class="mark">{mark}</div>
    <div class="copy">
      <p class="kicker">abox.tools</p>
      <h1>A box of tools that<br><span class="quiet">never touch a server</span></h1>
      <div class="chips">
        <span class="chip"><span class="tick">&check;</span>always free</span>
        <span class="chip"><span class="tick">&check;</span>nothing uploaded</span>
        <span class="chip"><span class="tick">&check;</span>works offline</span>
      </div>
    </div>
  </div>
</div>
'''

AVATAR = '''<!doctype html><meta charset="utf-8">
<style>
  body {{ margin: 0; width: 400px; height: 400px; overflow: hidden; }}
  .a {{ width: 400px; height: 400px; background: {bg};
       display: flex; align-items: center; justify-content: center; }}
  .a svg {{ display: block; }}
</style>
<div class="a">{mark}</div>
'''

#: name, palette, and the colours the surrounding page is drawn in
THEMES = [
    ('dark', DARK,
     dict(bg='linear-gradient(120deg,#14171b 0%,#1b2028 55%,#151a20 100%)',
          fg='#e8eaed', dim='#9aa4b2', chipbg='rgba(255,255,255,.06)',
          chipfg='#e8eaed', chipbd='rgba(255,255,255,.14)', ok='#6cc79b',
          brand='#f5c655'),
     'linear-gradient(135deg,#171b21,#20262e)'),
    ('light', LIGHT,
     dict(bg='linear-gradient(120deg,#ffffff 0%,#f2f5f9 55%,#eef2f7 100%)',
          fg='#16191d', dim='#5d6672', chipbg='#ffffff', chipfg='#16191d',
          chipbd='#d9dee5', ok='#1a6a43', brand='#b07d10'),
     'linear-gradient(135deg,#ffffff,#eef2f7)'),
    ('yellow', LIGHT,
     dict(bg='linear-gradient(120deg,#fff8e6 0%,#ffeec4 55%,#ffe3ad 100%)',
          fg='#3b2c05', dim='#7a6224', chipbg='rgba(255,255,255,.75)',
          chipfg='#3b2c05', chipbd='rgba(176,125,16,.28)', ok='#1a6a43',
          brand='#8a5300'),
     'linear-gradient(135deg,#fff5dc,#ffe3ad)'),
]


def main():
    SRC.mkdir(parents=True, exist_ok=True)
    for name, palette, page, avatar_bg in THEMES:
        (SRC / f'banner-{name}.html').write_bytes(
            BANNER.format(mark=mark(palette, 260), texture=tiles(palette),
                          **page).encode('utf-8'))
        (SRC / f'avatar-{name}.html').write_bytes(
            AVATAR.format(bg=avatar_bg, mark=mark(palette, 296)).encode('utf-8'))
        print(f'wrote media/src/banner-{name}.html and avatar-{name}.html')

    # The mark itself, so the kit is complete without reaching into shared/.
    # A copy, not a second original: shared/logo.svg is the only place the
    # shape is authored, and this is refreshed by re-running this script.
    for svg in ('logo.svg', 'logo-ink.svg', 'logo-ink-graphite.svg'):
        shutil.copyfile(ROOT / 'shared' / svg, MEDIA / svg)
        print(f'copied media/{svg}')


if __name__ == '__main__':
    sys.exit(main())
