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
  LEFT - 319px across, centred at x=242, so it covers x 82..401 and the bottom
  160px. That is measured off a live profile, not estimated: the first pass
  guessed 208px at x=164, which was a third too small, and the banner it
  produced put the mark directly above the avatar so the profile showed the
  same logo twice, stacked.

  Hence two layouts that leave the corner alone. `clear` carries no mark at all
  and lets the avatar be the logo; `mark` puts one at the far right, where it
  reads as a bookend rather than a repeat. Both start their type at x=452.

  The header is also cropped vertically on narrow screens, so the copy sits in
  a band about 90px clear of the top and bottom edges. And it is shown at
  roughly a third of these pixels on a phone, which is why the type is large
  and there are only two lines of it.

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


#: For the layouts that leave the bottom left alone. Nothing sits inside the
#: avatar's circle, and nothing sits behind the type.
TEXTURE_CLEAR = [
    (1330, 60, 44, -14, 'logo-app-b', .15), (1420, 176, 28, 22, 'logo-app-c', .13),
    (1272, 392, 22, 40, 'logo-app-d', .12), (1408, 320, 34, -18, 'logo-app-a', .11),
    (96, 58, 30, 18, 'logo-app-c', .13), (192, 132, 20, -24, 'logo-app-b', .11),
    (52, 196, 16, 30, 'logo-app-d', .10), (1214, 244, 16, 30, 'logo-app-d', .10)]


def tiles(palette, spec=None):
    return '\n'.join(
        f'  <div style="position:absolute;left:{x}px;top:{y}px;width:{s}px;'
        f'height:{s}px;border-radius:{s * 0.28:.0f}px;background:{palette[key]};'
        f'opacity:{op};transform:rotate({rot}deg)"></div>'
        for x, y, s, rot, key, op in (spec or TEXTURE))


HEAD_ONLY = '''<!doctype html><meta charset="utf-8">
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
  /* The layouts that leave the avatar's corner alone start here. 452 is
     clear of the circle's right edge at x=401, with room to breathe. */
  .block {{ position: absolute; left: 452px; top: 50%;
           transform: translateY(-50%); }}
  .right-mark {{ position: absolute; right: 74px; top: 50%;
                transform: translateY(-50%); line-height: 0; }}
</style>
'''

BANNER = HEAD_ONLY + '''<div class="banner">
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


#: The copy block, identical in both of the layouts that clear the avatar.
COPY = '''    <p class="kicker">abox.tools</p>
    <h1>A box of tools that<br><span class="quiet">never touch a server</span></h1>
    <div class="chips">
      <span class="chip"><span class="tick">&check;</span>always free</span>
      <span class="chip"><span class="tick">&check;</span>nothing uploaded</span>
      <span class="chip"><span class="tick">&check;</span>works offline</span>
    </div>
'''

BANNER_CLEAR = HEAD_ONLY + '''<div class="banner">
{texture}
  <div class="block">
{copy}  </div>
</div>
'''

BANNER_MARK = HEAD_ONLY + '''<div class="banner">
{texture}
  <div class="block">
{copy}  </div>
  <div class="right-mark">{mark}</div>
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
        # The original layout, mark on the left. Kept because it reads well on
        # its own; see media/README.md for what it does on a live profile.
        (SRC / f'banner-{name}.html').write_bytes(
            BANNER.format(mark=mark(palette, 260), texture=tiles(palette),
                          **page).encode('utf-8'))

        # The two that leave the avatar's corner alone. Only the light and dark
        # colourways of these are kept - the yellow one is the light palette on
        # a warm ground, which is the pairing the profile actually uses.
        if name in ('yellow', 'dark'):
            clear = tiles(palette, TEXTURE_CLEAR)
            (SRC / f'banner-clear-{name}.html').write_bytes(
                BANNER_CLEAR.format(texture=clear, copy=COPY, **page).encode('utf-8'))
            (SRC / f'banner-mark-{name}.html').write_bytes(
                BANNER_MARK.format(texture=tiles(palette, TEXTURE_CLEAR[4:]),
                                   copy=COPY, mark=mark(palette, 250),
                                   **page).encode('utf-8'))

        (SRC / f'avatar-{name}.html').write_bytes(
            AVATAR.format(bg=avatar_bg, mark=mark(palette, 296)).encode('utf-8'))
        print(f'wrote the html for {name}')

    # The mark itself, so the kit is complete without reaching into shared/.
    # A copy, not a second original: shared/logo.svg is the only place the
    # shape is authored, and this is refreshed by re-running this script.
    for svg in ('logo.svg', 'logo-ink.svg', 'logo-ink-graphite.svg'):
        shutil.copyfile(ROOT / 'shared' / svg, MEDIA / svg)
        print(f'copied media/{svg}')


if __name__ == '__main__':
    sys.exit(main())
