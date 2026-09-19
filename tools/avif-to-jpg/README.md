# AVIF to JPG

[← All tools](../README.md) · [The tool](https://abox.tools/avif-to-jpg/)

Decodes an AVIF with the browser's own decoder, draws it on a canvas, and asks
the canvas for a JPEG. One of three tools built on
`shared/js/image-convert.js`; the others are [WebP to JPG](../webp-to-jpg/) and
[PNG to WebP](../png-to-webp/).

## The mirror of heic-to-jpg

These two pages are best read together, because they are the same problem
inverted and the difference decides everything about each.

|  | HEIC | AVIF |
|---|---|---|
| decoded by | Safari only | everything current |
| encoded by | nothing in a browser | nothing in a browser |
| so the tool ships | 1.4 MB of `libheif` | no engine at all |
| and its CSP | adds `'wasm-unsafe-eval'` | adds nothing |

An AVIF that will not open in somebody's photo viewer opens perfectly in a
browser tab — which is both why they have the file and why this page can help
without downloading anything. The interesting claim here is the *absence* of a
codec, and the `csp_note` says so explicitly rather than leaving a reader to
notice that nothing was widened.

**This tool does not resolve the roadmap's "AVIF" line.** That line is about
*writing* AVIF, which is container work on top of `VideoEncoder`'s AV1 and is
argued out in `ROADMAP.md`. This page only reads.

## Sniffing an AVIF

`sniff()` in the shared module reads the `ftyp` box and looks through the brand
list for `avif` or `avis` (the image-sequence brand, which decodes to its first
picture like any other still). The extension is never consulted: a download
that renamed the file, or a `.jpg` that is really an AVIF, both still work.

## Detecting a browser that cannot read the format

The only visitor this page genuinely cannot help is one whose browser predates
AVIF, and it is worth telling them that rather than letting them conclude their
picture is broken. Two things catch it:

- `checkSupport()` asks `ImageDecoder.isTypeSupported('image/avif')` at boot
  where that API exists. Where it does not, **nothing is assumed and nothing
  is said** — guessing out loud would be worse than waiting.
- `addFiles()` settles it on real evidence: if every file that sniffed as a
  genuine AVIF was refused by the decoder and none got through, that is a
  browser without a decoder rather than a batch of damaged files, and
  `noDecoder()` says so once instead of leaving three identical complaints
  about files that are perfectly good.

## The example is committed bytes, and has to be

`src/example-data.js` holds two real AVIFs as base64. This is the only example
on the site besides the HEIC one that is not drawn in the page at the moment it
is pressed, and the reason is the tool's own premise: nothing in a browser will
encode an AVIF, so there is no way to draw one.

They are the same landscape `shared/js/example-photo.js` draws for two dozen
other tools — flattened onto white, since a real photograph has no alpha
channel — encoded with `libaom` at crf 32 in 4:2:0, which is what a website
serves. 32 KB and 28 KB. So the example looks like the rest of the site's
examples and behaves like the file somebody actually arrived with.

The module is named `example-data*` deliberately: `build_tool` in `build.py`
keeps anything with that prefix out of the service worker's precache, so a
visitor who brings their own picture never fetches it. `example.js` imports it
dynamically, on the press, for the same reason.

If it ever needs regenerating, the recipe is: draw the canvases in a built page
over CDP, save them as PNGs, and

```
ffmpeg -i photo.png -c:v libaom-av1 -crf 32 -cpu-used 3 -pix_fmt yuv420p -frames:v 1 out.avif
```

Note that ffmpeg's AVIF muxer **drops the alpha plane** — `-pix_fmt yuva420p`
is accepted and silently writes `yuv420p` — so it cannot produce a transparent
AVIF to demonstrate the background-colour field with. That is why both examples
are opaque photographs, which is the representative case anyway.

## What a JPEG cannot carry over

Stated on the page rather than discovered afterwards: AVIF can hold ten or
twelve bits a channel and describe HDR highlights, and a JPEG is eight bits
with no such notion, so any of that is flattened. Almost nothing saved off an
ordinary web page uses it. Transparency is the other one, and is handled the
same way as in [WebP to JPG](../webp-to-jpg/) — `encode()` paints the
background first for any format whose `FORMATS` entry says `alpha: false`, and
the caller cannot turn it off, because the alternative is black where the
transparency was.

## Testing

`tests/js/image-convert.test.js` covers the pure half of the shared module,
including AVIF brand sniffing against a real file's header bytes. The canvas
half is checked in a browser: convert the example and confirm two JPEGs come
back at the source dimensions, several times larger than the AVIFs they came
from.
