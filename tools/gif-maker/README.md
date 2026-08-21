# GIF Maker

*Put pictures in order, say how long each one is held, and get one animated GIF.*  ·  lives at `/gif-maker/`  ·  [all tools](../)  ·  [how the site is built](../../README.md)

Takes a set of still images and writes a GIF89a with one frame per image. The
browser decodes the pictures and draws them into a fixed-size frame; everything
after that — choosing 256 colours, deciding which one every pixel becomes,
compressing the result and wrapping it in the file — is written out here, in
four files you can read in a sitting.

It is a sibling of [Images to Video](../images-to-video/), which does the same
job into an MP4, and the two exist for different reasons. A GIF plays by itself
in an email, in a chat window, in a forum post and inside an `<img>` tag, with
no player and no controls, and that is the whole case for it. The case against
it is the file size, which this README does not try to talk anybody out of; see
[What it costs](#what-a-gif-costs-and-why-there-is-no-quality-slider).

---

## Why the browser cannot do this on its own

Every other image tool on this site leans on an encoder the browser already
ships: `canvas.toBlob` writes PNG, JPEG and WebP, and the interesting work is
deciding what to hand it. There is no such call for GIF. `canvas.toBlob(…,
'image/gif')` is not implemented anywhere, and even if it were it would write
one frame, because a canvas is one picture.

So the two halves a GIF needs that nothing else here needs — a **colour
quantizer** and an **LZW compressor** — are written out, in the same spirit as
`src/mp4.js` in the video tool. That is about four hundred lines in total, it
needs nothing installed, and it is why this page can be opened once and then
used with the network unplugged.

## The palette is the tool

A GIF frame is one byte per pixel and a table of at most 256 colours. A
photograph has tens of thousands. Everything that decides whether the output
looks like the input happens in `src/quantize.js`, before a single byte of the
file gets written, and none of it is in the format's control.

The pipeline is three steps:

1. **A histogram in 15-bit colour.** 32,768 bins, five bits a channel, as a flat
   array — small enough to walk, which is what makes step 2 cheap. Each bin also
   keeps the *exact* sum of the pixels that landed in it, so the colours chosen
   in step 2 are averages of real pixels rather than bin centres. Without that,
   a sky is quantized to multiples of eight and bands before the palette has
   even been consulted.

2. **Median cut.** One box holding every occupied bin, then repeatedly split the
   box with the most pixels in it, along its longest axis, at the point that puts
   half its pixels either side. Stop at the number of colours asked for. The
   palette that falls out spends its entries where the pixels actually are: a
   picture that is mostly sky gets mostly blues.

   The axis is measured with green weighted heaviest and blue lightest, roughly
   in proportion to how much of brightness each channel carries. Splitting along
   the axis the eye is least able to see is how a palette ends up holding eight
   greens that all look the same.

3. **Mapping**, in `mapFrame`: for every pixel, the nearest entry by weighted
   squared distance, optionally with Floyd–Steinberg error diffusion.

The alternative — a fixed 6×6×6 web-safe cube — needs no histogram and no
search, and it is exactly why GIFs from 1998 look like GIFs from 1998: 216
colours spread evenly through a space a photograph barely visits.

### Dithering, and why it is a setting rather than a default

Without it, a gradient through a 256-colour palette comes out as bands: every
pixel in a wide stretch of nearly-the-same-colour rounds to the same entry, and
the step between entries becomes a visible edge. Floyd–Steinberg carries each
pixel's rounding error into the neighbours it has not reached yet, so that edge
becomes a mix of the two colours instead.

It is on by default because most of what people animate is photographs. It is
worth turning off for flat artwork — logos, screenshots, line drawings — where
there is no gradient to save and the noise it adds is pure cost, in appearance
*and* in bytes: dithering defeats LZW, because a run of identical pixels
compresses and a run of noisy ones does not.

The scan alternates direction row by row. Always going left to right makes the
error drift the same way on every line, which shows up as faint diagonal
streaking in skies.

### The lookup cache, and the one shortcut in it

Searching 256 colours for every pixel is thirty million comparisons for a modest
frame, so answers are remembered against the same 15-bit key the histogram uses.
That rounds the colour being looked up to the nearest 1/32 before the search —
well below the error dithering is deliberately introducing, and nowhere near the
size of a palette step. The error handed on to the neighbours is measured
against the *true* colour rather than the rounded one, so nothing accumulates.

### One palette or one per frame

Both are offered, and the choice is not about quality alone.

| | |
|---|---|
| **Per frame** (default) | Each picture gets the 256 colours that suit it. Sharpest, and the right answer for a set of unrelated photographs. |
| **Shared** | One table built from every frame at once, written once at the top of the file. Smaller, and it stops the palette *lurching* between frames of one scene — the flicker that gives a naively-made GIF away. |

Shared costs a second pass: the histogram has to see every frame before any of
them can be written, so `encode.js` decodes everything twice. The progress bar
counts both passes rather than appearing to stall halfway.

## LZW, and the one line that is easy to get wrong

`src/lzw.js` is the compressor. It is a straightforward dictionary coder — the
dictionary starts as the palette and grows by an entry for every code written —
with one detail that deserves the twenty lines of comment it has.

**The decoder is one entry behind the encoder.** When the encoder writes a code
it immediately adds the entry it just learned; the decoder can only add that
entry when it reads the *next* code, because it needs that code's first pixel to
know what the entry is. So at the moment the two sides decide how many bits wide
the next code is, they are counting different numbers of entries.

Get it wrong by one and the stream still decodes for a while, and then turns into
confetti somewhere in the middle of the picture — which looks like a problem with
the image rather than with the file around it. The check therefore happens
*after* each code is written, against the count as it stood before that code's
entry was added, which is exactly where the `compress.c` every GIF writer
descends from puts it. `tests/js/gif.test.js` decodes what this produces with an
independently written decoder, because self-consistency is the only thing a
round trip against one's own code would prove.

## The file, in `src/gif.js`

Bookkeeping, and much the shorter half: a signature, a screen descriptor, a
colour table, and per frame a graphic control extension (how long to hold it,
what to leave behind, which index is transparent) and an image descriptor.

Three things in there are worth knowing:

- **Looping is not part of the format.** It is a private application extension
  from Netscape Navigator 2.0 that everything has implemented since, which is
  why it is written with a name and a version inside it.

- **"Play once" writes no loop block at all.** The count is the one field
  decoders have never fully agreed on — some play a count of *n* exactly *n*
  times, some play it *n*+1 — and a file with no loop block is played once by
  every one of them. A count is only written when somebody asks for a specific
  number, and the page says what it means.

- **Disposal depends on transparency.** Opaque frames covering the whole canvas
  use "keep": the next frame paints over this one and nothing needs clearing.
  Transparent frames use "restore to background", because otherwise every frame
  shows the previous one through its transparent parts and an animation of
  separate pictures becomes a pile of them.

### What the writer deliberately does not do

Every frame is written whole. A GIF may instead write a frame as a rectangle
covering only the part that changed, which is how a screen recording of a mostly
still window ends up so small. That is a real saving and it is not here, because
this tool turns *separate pictures* into an animation and separate pictures
differ everywhere — the changed rectangle is the whole frame nearly every time.
A video-to-GIF tool would want it, and would be the place to write it.

## What a GIF costs, and why there is no quality slider

There is no lossy step to turn down. A GIF stores every frame as whole pixels
with no motion compensation and no transform coding, so the size is roughly area
× frames, and only three things move it:

- **The size.** Halving it quarters the file. This is why the default is 480 px
  on the long edge rather than "match the images", and why `compose.js` caps
  everything at 1000 px — not a limit of the format, which allows 65,535, but of
  what anybody can use.
- **The number of frames**, and how long each is held.
- **The palette**, weakly, and **dithering**, more than people expect — see
  above.

If none of that gets it small enough, the honest answer is on the page: the
thing being made is a video, and an MP4 of it is perhaps a tenth of the size.
[Images to Video](../images-to-video/) is next door.

### Delays under 0.02s are not offered

The format stores each frame's delay in hundredths of a second. Browsers have
clamped anything under two of them to a tenth of a second since the 1990s — a
rule written for the spinning globes of the day and never removed — so a delay
of 0.01s does not play at 100 frames a second, it plays at 10. `images.js`
therefore refuses to go below 0.02s rather than accept a number that silently
becomes something else. Saying so in the FAQ is cheaper than a tool that appears
to have a speed setting that does nothing.

## Transparency is one bit

A GIF pixel is either fully painted or entirely invisible; there is no partial
alpha. Anything anti-aliased, soft-shadowed or faded therefore gets a hard edge
at the cutoff, which is set at half alpha in `quantize.js`. The page says so next
to the setting rather than letting people discover it in the output, and the
result is drawn on a chequerboard so that "transparent" and "happens to be
white" cannot be confused.

Transparent pixels are also left out of the histogram: they will not be drawn in
any colour, so letting them vote spends palette entries on whatever sits under
the alpha — usually black, and usually a wasted eighth of the table.

## Why there is no "add from a web address"

[Images to Video](../images-to-video/) has that panel and this tool does not,
and the difference is not technical. The rule in the repository README is that a
tool may fetch a picture only if it would not then have to misdescribe what it
was given: the importer copies images through a `<canvas>`, so what arrives is a
re-encode rather than the bytes the server sent.

A GIF frame is quantized to 256 colours, so by that test this tool would qualify
on the same grounds the video tool does. It goes without anyway. The feature is
the one thing on this site that contacts anything, it carries a real privacy
caveat that then has to be explained on the page, and nobody making a GIF out of
their own photographs needs it. If somebody does, it is one table in `tool.toml`
away — see the repository README — and the paragraph in the privacy panel is
the actual cost.

## Limitations

- **No frames out of a video.** This tool takes still images. Cutting a GIF out
  of a clip is a different tool with a demuxer in it, and it is on the roadmap.
- **No text, no overlays, no crop.** Frames are fit, filled or stretched into
  one box and that is all. Crop the pictures first with
  [Image Resizer](../resize-image/).
- **Frames are written whole**, so an animation of one barely-changing scene is
  larger than it needs to be. See above.
- **One thread.** The quantizer runs on the main thread, yielding between
  frames. A worker would be tidier and would cost this page a `blob:` worker
  source in its Content-Security-Policy for a job that is already fast enough to
  watch happen.

## Testing it

`tests/js/gif.test.js` and `tests/js/gif-quantize.test.js`, run by
`node --test "tests/js/*.test.js"`.

The GIF tests are round trips through a **separately written decoder** in the
test file: build a file, read it back, and check that the pixels, the delays,
the loop block and the transparent index came out as they went in. That decoder
exists precisely because it is written from the specification rather than from
`gif.js`, which is the only way a round trip says anything about correctness
rather than about self-consistency.

The quantizer tests pin the properties that matter and not the exact palette,
which is an implementation detail a better split rule would be entitled to
change: a picture with fewer than 256 distinct colours comes back exactly, every
index is inside the table, a reserved transparent index is never chosen for an
opaque pixel, and the average error over a photograph-like gradient stays under
a threshold that a broken median cut would blow through immediately. The frame
size maths from `compose.js` is in the same file, because it is the other
decision made before a byte is written.

What is not tested there is anything needing a `<canvas>` — the drawing itself.
That, and the only test that finally matters, happen in a browser: load the
page, make a GIF, and hand it to `ImageDecoder`, which is Chromium's own GIF
reader and therefore the least sympathetic audience this writer has. Frame
count, per-frame durations, the repeat count and the transparent pixels all come
back as they went in.
