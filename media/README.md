# Media

Artwork for places that are not the site: a social profile, a directory
listing, a press mention, anyone who asks for a logo.

Nothing here is published. The build copies `shared/`, not this folder, so
these files exist for people rather than for pages.

## What is here

| File | Size | For |
|---|---|---|
| `banner-dark.png` `banner-light.png` `banner-yellow.png` | 1500&times;500 | X/Twitter header |
| `avatar-dark.png` `avatar-light.png` `avatar-yellow.png` | 400&times;400 | X/Twitter profile picture |
| `logo.svg` | vector | the mark, in colour |
| `logo-ink.svg` `logo-ink-graphite.svg` | vector | the mark in one colour, for print and any single-plate job |

The dark banner is the one to reach for by default: it holds the most contrast
against X's own chrome in either of its themes, and the app tiles read
brightest against it.

## Where the mark actually lives

`shared/logo.svg` — that is the only place the shape is authored. The three
SVGs here are **copies**, refreshed by the script below. Do not edit them; edit
the mark and re-run.

The mark's own file explains why its geometry is the way it is, and which four
numbers are load-bearing. The music glyph in it is Lucide's, under ISC and MIT
— see [`THIRD-PARTY-NOTICES.md`](../THIRD-PARTY-NOTICES.md).

## Rebuilding

```bash
python scripts/emit_media.py
```

That refreshes the SVG copies and writes the HTML each PNG is rendered from
into `media/src/`, which is not committed. Rasterising needs a browser, and
this repository does not otherwise depend on one being installed, so that step
is a command rather than part of the script:

```bash
msedge --headless=new --screenshot=media/banner-dark.png --window-size=1500,500 media/src/banner-dark.html
```

Banners are 1500&times;500 and avatars 400&times;400. Render at exactly those
sizes — X re-encodes anything else and the type softens.

## Why the banner is laid out the way it is

None of this is guessable from looking at the image:

- **The avatar overlaps the bottom left.** A circle covering roughly the first
  210px across and 130px up from the bottom. Nothing that has to be read goes
  there.
- **The header is cropped vertically on narrow screens**, so the copy sits in a
  band about 90px clear of the top and bottom edges.
- **It is shown at about a third of these pixels on a phone.** That is why the
  headline is 72px and why there are only two lines of it.

## Why there is no tool count

A banner is a static image that nobody re-renders. A count would be wrong the
week after the next tool ships, and would then sit there being wrong on a
profile page. The three chips are claims that stay true at any size of
catalogue — they are the site's own three guarantees, compressed.

The same reasoning applies to anything else that might be added here. If a fact
expires, it belongs in the bio or the pinned post, where changing it is one
edit rather than a re-render.
