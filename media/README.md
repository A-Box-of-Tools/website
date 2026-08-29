# Media

Artwork for places that are not the site: a social profile, a directory
listing, a press mention, anyone who asks for a logo.

Nothing here is published. The build copies `shared/`, not this folder, so
these files exist for people rather than for pages.

## What is here

| File | Size | For |
|---|---|---|
| `banner-clear-{yellow,dark}.png` | 1500&times;500 | X header &mdash; no mark, the avatar is the logo |
| `banner-mark-{yellow,dark}.png` | 1500&times;500 | X header &mdash; mark at the far right |
| `banner-{dark,light,yellow}.png` | 1500&times;500 | X header &mdash; mark at the left (see below) |
| `avatar-{dark,light,yellow}.png` | 400&times;400 | X profile picture |
| `logo.svg` | vector | the mark, in colour |
| `logo-ink.svg` `logo-ink-graphite.svg` | vector | the mark in one colour, for print and any single-plate job |

**Use `banner-mark-*` or `banner-clear-*`.** The `banner-{dark,light,yellow}`
set puts the mark at the left, where X's avatar sits directly underneath it, so
a live profile shows the same logo twice, stacked. They are kept because they
read well on their own - in a README, a slide, an og card - but they are the
wrong choice for a profile header.

`mark` keeps a logo at the opposite end, where it reads as a bookend rather
than a repeat, and fills the right side that `clear` leaves empty. `clear` is
the safer of the two and lets the avatar do all the identifying.

Dark or yellow is a taste question. Dark holds the most contrast against X's
own chrome in either of its themes.

## Licence

These are trade marks, and they are **not** covered by this repository's MIT or
CC BY licences — see [`LICENSE-BRAND`](../LICENSE-BRAND) at the root, which says
what you may do with them without asking (refer to the site, link to it, use the
mark unaltered to identify it) and what needs permission (using it as your own,
altering it, implying endorsement).

That boundary is the reason the file exists: an MIT grant over a logo would let
anyone put it on their own product.

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

- **The avatar overlaps the bottom left.** A circle 319px across, centred at
  x=242, so it covers x 82..401 and the bottom 160px. That is measured off a
  live profile. The first pass guessed 208px at x=164, which was a third too
  small, and produced a banner whose mark sat directly on top of the avatar.
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
