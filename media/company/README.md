# The company mark

Artwork for **Abox Technologies**, the company. The mark next door in
[`../`](../README.md) is for **abox.tools**, the site. They are not the same
mark and neither substitutes for the other.

Nothing here is published. The build copies `shared/`, not this folder, so
these files exist for people rather than for pages: a registry form, a social
profile, an invoice, anyone who asks the company for a logo.

## What is here

| File | For |
|---|---|
| `abox-technologies-mark.svg` | the mark, in colour; light and dark palettes baked in |
| `abox-technologies-mark-reverse.svg` | fixed light palette, for dark grounds you control |
| `abox-technologies-mark-mono.svg` | one colour, for print and any single-plate job |
| `abox-technologies-icon.svg` | the tile — favicon, app icon, avatar |
| `abox-technologies-horizontal.svg` | mark and name side by side |
| `abox-technologies-horizontal-reverse.svg` | the same, on a fixed light palette |
| `abox-technologies-stacked.svg` | mark over name, for square-ish slots |
| `abox-technologies-icon-{400,512}.png` | avatar and app icon, rasterised |
| `abox-technologies-favicon-{16,32,48,180}.png` | favicon and touch-icon sizes |
| `abox-technologies-horizontal-900.png` | raster lockup, for slides |

## Why the mark is what it is

The name says *a box*, so the mark is a box with an A in it, drawn in the one
notation where a bracket already means a container. That is the whole idea, and
it is meant to be readable without this paragraph.

Three things in the drawing are load-bearing, and none of them is guessable
from looking at it:

- **The apex is flat, not pointed.** A pointed apex makes the mark look like
  somebody typed `[A]` in Helvetica. The flat top is the single detail that
  says a letter was drawn for this, and it is the first thing to protect if the
  geometry is ever edited.
- **The brackets are lighter than the letter** — 3.6 against 4.4 on a 64 grid.
  At equal weights the punctuation shouts as loudly as the name. The brackets
  are the container and should read as one thing, once.
- **The bracket returns are short.** Full-length arms read as punctuation.
  Short ones read as the corners of a box, which is the entire point of having
  chosen brackets.

## Two traps

**The main file cannot know what it has been put on.** It picks its palette
from the viewer's OS theme, which is right for a favicon and wrong for a dark
band inside a light page — there the OS is in light mode and the file draws
near-black on near-black. Use `-reverse` wherever you control the background.

**Below about 20px the strokes thin to under a pixel** and grey into whatever
is behind them. That is what the tile is for: it is not a decorative
alternative, it is the small-size instrument. Bare mark where there is room,
tile for favicons and avatars.

## The type is live text

The two lockups carry `<text>`, not outlines, so they render in Archivo where
Archivo is installed and fall back to the platform UI face where it is not.
That is fine on the web and wrong for print. Convert the text to outlines in a
vector editor before sending either file to be reproduced at a fixed size;
Archivo is free under the SIL Open Font License, so the font can also be handed
to a printer.

## Rebuilding the rasters

The PNGs are rendered from the SVGs at exact pixel sizes rather than scaled
from one master, so each favicon size keeps its own crisp strokes. Rasterising
needs a browser, which this repository does not otherwise depend on, so it is a
command rather than a script — serve this folder and point a headless browser
at an HTML file holding the SVG at the size wanted, the same way
[`../README.md`](../README.md) describes for the banners.

## Licence

These are trade marks, and they are **not** covered by this repository's MIT or
CC BY licences — see [`LICENSE-BRAND`](../../LICENSE-BRAND) at the root, which
now names this mark and the name "Abox Technologies" alongside the site's.
