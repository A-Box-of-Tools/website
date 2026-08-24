# Video to GIF

*Pick the section, the size, and the frame rate.*  ·  lives at `/video-to-gif/`  ·  [all tools](../)  ·  [how the site is built](../../README.md)

The eleventh tool, and the first one here that writes a GIF. It samples a
section of a video at a frame rate you choose, picks 256 colours for the whole
animation, and writes the file — palette, dithering, LZW and all — in this
folder's own code.

---

## It samples a video, it does not convert one

This is the thing worth understanding before any of the rest, because every
other decision follows from it.

A video is 25, 30 or 60 frames a second. A GIF that anybody wants is 10 to 15,
because a GIF stores whole pictures rather than motion and each of those
pictures costs. So the tool never walks the video's frames and writes them out
one for one. It works out the instants it wants — `start`, `start + 1/fps`,
`start + 2/fps`, … — and for each one asks *what was on screen then*. The answer
is the last frame at or before that instant, which is what a player would have
been showing.

That is why `src/plan.js` exists and is tested on its own. The instants, the
frame count and the delays between them are pure arithmetic, they decide whether
the animation comes out the length of the section it was cut from, and getting
them wrong is invisible: nothing throws, the GIF simply runs slow.

## Two paths, and why there are two

There is no single browser API that both opens everything and answers "what was
on screen at 4.25 seconds" precisely. So there are two, and the tool picks the
better one it can use for the file in front of it.

| | **The reader** | **The player** |
|---|---|---|
| Accepts | MP4, M4V, MOV, in any codec `VideoDecoder` will open | anything the browser will *play* |
| How | `src/demux.js` → `VideoDecoder` → canvas | seek a `<video>` to each instant → canvas |
| Speed | one decode of the section, however many frames are wanted | one decode from the previous keyframe *per frame* |
| Which frame | the one the file says is on screen then | whichever one the browser lands on, usually the same |
| Needs | WebCodecs, and a codec the machine will decode | nothing this decade |

The reader is the one to want. The player is why there is no dead end for WebM,
Ogg, or anything else this repository has no demuxer for — and it is not merely
a consolation prize, because it also covers a browser with no WebCodecs at all.

**The fallback is chosen by the reader failing, not by the extension.** Every
file goes to `src/demux.js` first; if it comes back with an `UnsupportedFile`,
the reason on it is what the page prints — "this is not an MP4 or MOV file",
"the video track is encrypted", "this browser will not decode
`hvc1.2.4.L120.B0` directly". The page says which path it used, in those terms,
rather than quietly being ten times slower on some files than on others.

`src/demux.js` is the reader from [`/crop-video/`](../crop-video/), copied
across with only its header comment changed, the same way the trimmer's copy
was. It still reads the audio track, which a GIF has no use for; pruning it
would mean the two copies could no longer be diffed against each other, which is
worth more than the lines it would save.

## Where the size actually goes

A GIF of a five-second clip is routinely ten times the size of the five-second
MP4 it came from, and no encoder can fix that: the format is from 1987 and has
no concept of motion. What it does have is three levers, and they are not equal.

| Lever | What it costs |
|---|---|
| **The section** | linear. Twice as long is twice the frames |
| **The width** | quadratic. Half the width is a *quarter* of the pixels |
| **The frame rate** | linear, and the one people reach for first even though width pays better |

The page states all three in its summary before anything runs, along with a size
range rather than a number — a still shot of a wall and a shot of confetti at
the same size and length differ by more than twenty times, so a single predicted
figure would be a lie in one direction or the other.

Two things the tool does that cost nothing and save a great deal:

- **A frame identical to the one before it is not written at all.** Its time is
  given to the frame before instead, which is what "held shot" means to a
  format that stores delays per frame. `src/encode.js` holds every frame back
  until the next one proves it has to be written, which is the only way to do
  this and still end up with the right total length.
- **Only the rectangle that changed is written**, with the pixels inside it that
  did not change marked transparent and disposal set to "leave the last frame in
  place". A talking head against a still wall costs a face per frame rather than
  a picture per frame.

The second of those is worth more than it sounds. On the clip this was built
against - a moving box over a fixed gradient, 36 frames at 320x180 - writing
every frame whole came to 707 KB and writing only what changed came to 115 KB:
**84 per cent off, for the same pixels**. It is also why the dither below has
to be the kind it is.

Note what the first one does *not* do on real footage. Two frames of a held
shot that have been through a video codec are almost never identical - the
encoder leaves a pixel or two of noise, so the frames differ and both get
written. The saving there comes from the rectangle and the transparency rather
than from dropping anything, which is the sort of thing worth measuring rather
than assuming.

## The palette

GIF stores one table of at most 256 colours and one index per pixel. Choosing
those 256 is the whole of what a GIF looks like, and `src/quantize.js` does it
in three steps.

**A histogram, filled while the frames are read.** Every frame counts towards
it, not just the first, because the colour that matters may only appear at the
end: a title card, a lamp coming on, a cut to another scene. It is binned to
five bits a channel — 32,768 buckets — which is fine enough that colours a
person can tell apart land in different buckets, and flat enough that a
two-minute clip costs the same memory as a two-second one. The exact sums are
kept alongside the counts, so a group's final colour is the true average of the
pixels in it rather than the average of the buckets they fell into.

**Median cut**, Heckbert's method from 1982. Repeatedly take a box of colours,
split it along its longest axis at the point where half the *pixels* lie, and
stop at 256 boxes. The one judgement in it is which box to split next, and this
one uses the product of a box's pixel count and its longest side: by count alone
a photograph's dominant colour gets dozens of near-identical entries, by size
alone the palette is spent on stray pixels nobody will notice.

**One palette for the whole animation, not one per frame.** A local table costs
768 bytes a frame, and — much worse — it makes each frame a different set of
colours, so an unchanged background quantizes to different indices in every
frame and the differencing above finds nothing to skip. One table is both
smaller and what makes the rest possible.

### Why the dithering is ordered

Where a colour is missing, dithering mixes the two nearest ones so that a
gradient stays a gradient instead of becoming four flat bands. Floyd–Steinberg
error diffusion is what a still image would use and it is the wrong choice here,
for two reasons that are both about this being an animation:

- **It is unstable.** Diffusion carries each pixel's error into its neighbours,
  so one changed pixel changes the dither of everything after it. Two frames
  that differ in one corner come out differing everywhere, and a still
  background visibly boils.
- **It would undo the differencing.** Almost every pixel changes slightly every
  frame, so every frame is a whole picture again and the file is several times
  the size.

An ordered (Bayer) dither depends only on where a pixel is, so an unchanged part
of the picture quantizes to exactly the same indices every time and simply sits
still. Its amplitude is measured off the palette rather than fixed — the median
distance from an entry to its nearest neighbour, which is one quantization step
— so a flat cartoon with twelve colours in it dithers almost not at all and a
photographic gradient dithers as much as it needs.

## Delays, and the one number the format will not give you

GIF stores how long a frame stays on screen in hundredths of a second, and that
is coarse enough to matter. At 15 fps a frame lasts 6.67 hundredths; round each
one to 7 on its own and a ten-second animation runs five per cent slow, which is
a whole second by the end of a minute. So `frameDelays` rounds the *ends* rather
than the durations — the delays come out 7, 7, 6, which is what 15 fps actually
is on a clock that only counts hundredths, and the total is right.

The other number is the floor. The format allows a delay of zero and no renderer
honours it: a delay under two hundredths is treated as ten by every browser, a
rule inherited from Netscape and since written into the HTML specification. So
the real ceiling is 50 frames a second, the page offers 25 at the top, and
nothing here can ask for a rate it would silently not get.

## Memory, which is the real limit

Every frame is held in memory at once, as four bytes a pixel, because the
palette cannot be chosen until the last frame has been counted. That is the
constraint, not the length of the file: 300 frames at 480×270 is 155 MB, and
the same at 1280×720 is 1.1 GB.

So the page works out what the current settings would cost and shows it, and
refuses above a limit rather than letting the tab run out of memory and vanish
without explaining itself. The frames are released as they are quantized, so
the peak is the frames plus one index buffer rather than both formats of
everything.

## Limitations

- **No sound.** The format has none. If the sound matters, keep the video —
  [the trimmer](../trim-video/) cuts a section out without re-encoding a frame.
- **The section is limited by memory**, as above, and the page says so before
  you press the button rather than after.
- **The player path lands where the browser lands.** A seek is supposed to
  produce the frame in front of the mark and mostly does; on a clip with long
  gaps between keyframes it can be a frame out. The reader path has no such
  looseness, which is why it is preferred whenever it is available.
- **Edit lists on the way in are ignored**, the same as in the cropper: a file
  that says "start playing 40 milliseconds in" is read from its first sample.
- **Encrypted tracks are refused**, with that as the reason.
- **AVI, WMV, FLV and most MKVs** are neither readable here nor playable in most
  browsers. That is the FFmpeg question in
  [What can be built here](../../docs/what-can-be-built-here.md#what-needs-a-vendored-engine), not a
  gap a few more lines would close.
- **No captions, no cropping, no speed change.** Those are separate tools on the
  roadmap; this one picks a section, a size and a rate.

## Testing it

The parts that can be checked without a browser are, in `tests/js/`:

- `gif-lzw.test.js` — the compressor against a decompressor written in the test,
  over random data, runs, a stream long enough to fill the dictionary and force
  a reset, and the two-colour edge case where the code size is larger than the
  palette needs. A round trip is the only test worth having here: a stream that
  decodes to something else is exactly the failure that would ship.
- `gif-writer.test.js` — the file structure parsed back: the header and screen
  descriptor, the palette padded to a power of two, the looping extension, one
  graphic control block per frame with the delay and disposal it was given, and
  the frame rectangles a difference produces.
- `gif-quantize.test.js` — that median cut returns the exact colours when there
  are fewer than the palette holds, that it never returns more than it was asked
  for, that the mapping picks the nearest entry, and that the ordered dither
  gives the same answer for the same pixel in two different frames, which is the
  property the whole differencing scheme rests on.
- `gif-plan.test.js` — the instants, the frame count and the delays: that the
  delays sum to the length of the section, that no frame is sampled past the
  end, and that the floor of two hundredths is applied.

- `gif-encode.test.js` - the held shot: that identical frames are dropped, that
  their time lands on the frame in front of them, that dropping them does not
  change how long the animation runs, and that a one-pixel change writes a
  one-pixel frame.

`gif-fixtures.js` is the reader those two lean on, written from the
specification rather than from the writer it checks.

What only a browser can check, and what was run there while writing this - all
of it against MP4s built inside the page by `VideoEncoder` and the muxer from
[`/crop-video/`](../crop-video/), so nothing had to be committed as a fixture:

- **The finished GIF decoded again by `ImageDecoder`**, frame by frame: 36
  frames, 3000 ms end to end, and the moving box at the pixel the source put it
  at on every frame checked. The colour cost of the palette came out at 1.96 per
  channel on average and 9 at worst.
- **Both paths against the same clip**, frame by frame. They choose the same
  frames - the nearest match for every played frame is the decoded frame at the
  same instant, except across the held second where consecutive frames are
  indistinguishable anyway. They do not produce quite the same *pixels*: a
  `<video>` element and a `VideoFrame` drawn to a canvas differ by about 3.7 per
  channel, which is colour conversion rather than a fault in either. The player
  path took 4.6 seconds over what the reader path did in 0.2.
- **A portrait clip**, made by patching a landscape file's `tkhd` matrix to ask
  for a quarter turn the way a phone does. The reader reports 180x320 for a
  320x180 file, the player agrees with it, and the yellow box that sat at x
  20-60, y 60-100 in the source lands at x 80-120, y 20-60 in the output, which
  is where a quarter turn puts it.
- **The interface end to end**: typed times, `I` and `O`, a letter typed into a
  field staying a letter, a custom width, dithering off, cancelling mid-run and
  converting again afterwards, and a text file dropped in to be refused.
