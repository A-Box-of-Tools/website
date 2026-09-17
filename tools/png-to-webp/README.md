# PNG to WebP

[← All tools](../README.md) · [The tool](https://abox.tools/png-to-webp/)

Decodes a PNG with the browser's own decoder, draws it on a canvas, and asks
the canvas for a WebP — losslessly, or with a quality setting. One of three
tools built on `shared/js/image-convert.js`; the others are
[WebP to JPG](../webp-to-jpg/) and [AVIF to JPG](../avif-to-jpg/).

## The lossless problem, which is the whole tool

`canvas.toBlob` has no flag for lossless WebP. What it has is a quality
argument, and Chromium switches to WebP's lossless coding at **exactly 1.0**,
using the lossy coding for everything below it. That is how `encodeWebp()` in
the shared module asks for lossless, and it works on every browser tested.

It is also engine behaviour rather than anything the HTML specification
promises, and this tool's central claim — *every pixel identical to the PNG* —
rests entirely on it. So the claim is not made on trust. `encodeWebp()` writes
the file and then reads its own first 64 bytes back through `webpFacts()`:

| chunk | means |
|---|---|
| `VP8L` | the lossless coding — the claim holds |
| `VP8 ` | the lossy coding — the claim does not hold |

and hands the caller a `lossless` boolean read out of the bytes rather than
echoed back from the request. `resultRow()` in `src/main.js` has three cases
for it, and the third — asked for lossless, got lossy — is the one the
checking exists for. It has never fired in testing, which is the point: if a
browser ever stops honouring 1.0, the page says so on the day rather than
handing people lossy files they were told were lossless.

Measured in Chromium 152 on a 128×128 test image with alpha, for the record:

```
q0.92 -> VP8X, ALPH, VP8   8000 bytes
q0.99 -> VP8X, ALPH, VP8   9836 bytes
q1.0  -> VP8X, VP8L        6560 bytes   <- lossless, and smaller than q0.99
```

The size *dropping* at the top of the range is the signature of the coding
switch, and is the quickest way to confirm the behaviour by hand.

## "Lossless" has one measured footnote, and it is the canvas

A solid pixel survives bit for bit. A **half-transparent** one does not, and
the cause is the canvas rather than WebP — so it is true of every
browser-based converter, this repository's included, and it is worth knowing
before someone reports it as a bug.

A browser holds a picture on a canvas with its colour already multiplied by
its alpha, and that multiplication cannot be undone exactly: the fainter the
pixel, the less of the original colour survives the arithmetic. Measured in
Chromium 152 with an alpha ramp written straight to a canvas, encoded at
quality 1.0 and read back — **no PNG anywhere in the path**, so nothing but
the canvas and WebP can be responsible:

| alpha of the pixel | worst channel error |
|---|---|
| 255 (solid) | 0 |
| 64–254 | 4 |
| 1–63 | 63 |
| 0 (invisible) | 0 |

The error is worst exactly where it shows least: a pixel that is a tenth
opaque contributes a tenth of its colour, so an error of 63 in it arrives as
about 2. Composited, the picture is the same picture. The same table explains
the 956 differing channels seen when converting the example mark and the 3,683
seen on the example photograph — every one of them in a pixel whose alpha was
not 255, and none at all in the solid ones.

What this costs the page: the mode row, the result line, the schema and two
FAQ answers say "every solid pixel" rather than "every pixel", and there is a
question devoted to the footnote. `resultRow()` picks
`result.lossless.alpha` over `result.lossless` for a file that has
transparency in it, so the qualification appears on the files it applies to
and nowhere else.

## Why there is no background colour here

Because WebP has an alpha channel and nothing has to be flattened. This is the
one structural difference between this tool and the two that write JPEG, where
`encode()` paints a background first for any format whose `FORMATS` entry says
`alpha: false` and the caller cannot turn it off. Here that branch never runs.

The row still reports transparency — `hasAlpha()` decodes and walks the alpha
channel — but only to say that it survived, which is the thing people
converting a logo are actually worried about. That walk is exact and runs on a
band-sized canvas; the module explains why both halves of that had to be fixed,
and the wrong answer in each case was "this has transparency", which here would
have qualified a lossless claim that needed no qualifying.

## The example makes the argument

Two files (`src/example.js`), chosen so that the page's one decision has a
right answer for each:

- the flat mark from `shared/js/example-mark.js`, with an alpha channel, where
  lossless takes a useful bite out of the file and keeps everything;
- a photograph written as a PNG, where lossless barely helps and the lossy
  setting takes it down by an order of magnitude.

A visitor who presses the example and then flips the radio button sees both
outcomes with numbers off their own machine, which the prose can only assert.

## Support

WebP encoding is checked before anything is chosen: `checkSupport()` calls
`canEncode()`, which encodes one pixel and inspects `blob.type` — because
`toBlob` hands back a PNG rather than refusing when it cannot write a format.
A browser that fails cannot be worked around, since there is no encoder to
fall back on, so the page says so and disables the run rather than writing
PNGs named `.webp`. In practice every browser since 2020 passes.

## Testing

`tests/js/image-convert.test.js` covers the pure half of the shared module,
`webpFacts` and the RIFF walk included, against byte fixtures. The canvas half
is checked in a browser: convert the example both ways and confirm the rows
report `VP8L` for lossless and the quality for lossy, and that the mark's
transparency is still there afterwards.
