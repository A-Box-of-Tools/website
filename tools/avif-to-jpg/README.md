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

- `checkSupport()` decodes a known-good, 493-byte AVIF through the same path
  as the visitor's file. `src/avif-support.js` holds the project's own generated
  four-quadrant QA fixture, so this check needs neither a network request nor
  the much larger example photographs.
- A file whose brand says AVIF but whose pixels cannot be decoded receives a
  file-specific refusal. A truncated file can have a perfectly valid header;
  using that failure to disable the tool would also reject every good file
  chosen afterwards.

## The example is committed bytes, and has to be

`src/example-data.js` holds three real AVIFs as base64. This is the only example
on the site besides the HEIC one that is not drawn in the page at the moment it
is pressed, and the reason is the tool's own premise: nothing in a browser will
encode an AVIF, so there is no way to draw one.

The two photographs are the same landscape `shared/js/example-photo.js` draws for two dozen
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

The third example is the project's own `shared/js/example-mark.js` artwork at
256 x 256, with transparent corners and partly transparent antialiased edges.
It makes the background control visible, so a visitor can see which colour
will replace transparency in the JPEG. Its 6.8 KB of AVIF bytes preserve the
PNG source's alpha plane; no browser encoder or dependency is added.

ffmpeg's AVIF muxer drops the alpha plane even when given `-pix_fmt yuva420p`,
so the mark uses an alpha-capable libavif encoder instead. Draw `markCanvas(256)`
in a built page, save its PNG, then encode offline with Pillow/libavif:

```python
from PIL import Image

Image.open('mark.png').save('mark.avif', format='AVIF', quality=100, speed=6,
                            subsampling='4:4:4', max_threads=2)
```

Check the decoded alpha before replacing its base64 block. The two opaque
photographs remain the representative website case; the mark demonstrates
the decision a photograph cannot.

## What a JPEG cannot carry over

Stated on the page rather than discovered afterwards: AVIF can hold ten or
twelve bits a channel and describe HDR highlights, and a JPEG is eight bits
with no such notion, so any of that is flattened. Almost nothing saved off an
ordinary web page uses it. Transparency is the other one, and is handled the
same way as in [WebP to JPG](../webp-to-jpg/) — `encode()` paints the
background first for any format whose `FORMATS` entry says `alpha: false`, and
the caller cannot turn it off, because the alternative is black where the
transparency was.

## Keeping completed conversions

`shared/js/image-batch.js` captures the selected sources, allocated output names,
quality and background before conversion begins. Each file has its own refusal,
so an input that passed inspection but cannot be decoded or written on export
does not remove completed files or prevent later files from being attempted.
The page resolves the converter's own phrase keys, names the failed input, and
keeps native error details as text. Only completed files enter the ZIP, using
the names allocated for their original positions even when an input failed.

Cancel is cooperative because native decoding and canvas encoding cannot be
interrupted. A stop before decoding starts no work; a stop during decoding
releases that bitmap without writing; a stop during encoding keeps that finished
JPEG and starts no later input. The stopped count remains visible and the native
limit is explained beside the controls. Settings remain locked for the run, and
the result's flattening note describes its captured background. Decoded bitmaps
and scratch canvases are released on success, refusal and stopping, including
when alpha inspection itself fails.

## Testing

`tests/js/image-convert.test.js` covers the pure half of the shared module,
including AVIF brand sniffing against a real file's header bytes. The shared
`tests/js/image-batch.test.js` pins captured facts/settings, retained outputs,
allocated names, deferred stopping and bitmap disposal.
`tests/js/avif-example.test.js` checks the actual example Files and the mark's
alpha auxiliary item relationship, so an opaque regeneration cannot silently
remove the demonstration.

The native half is checked in a built browser: convert all three examples and
confirm JPEG types and original dimensions. Change the background on the mark
and inspect its formerly transparent corner pixels. Hold native decode/encoding
to check captured quality/background and cooperative Cancel, force a later
refusal to retain earlier/later downloads and their ZIP names, and check that
corrupt input does not disable support for good AVIFs. Exercise all translated
390-pixel pages with long filenames and verify settled resources are released.
