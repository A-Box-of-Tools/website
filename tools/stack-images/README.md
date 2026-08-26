# Image Stacker

Combines a set of photographs into one. Averages them, takes their median,
sigma-clips them, keeps the brightest or the darkest, adds them, or takes each
part of the picture from whichever frame had it in focus. Reads camera RAW
files without a RAW converter.

This file is for somebody reading the code. What the tool is for, and what it
claims, is on [the page itself](https://abox.tools/stack-images/).

## The two decisions that shaped everything else

### 1. A RAW file is opened by reading about a hundred kilobytes of it

Camera RAW is on the ruled-out list in
[docs/what-can-be-built-here.md](../../docs/what-can-be-built-here.md), and it
still is. Decoding sensor data means LibRaw or dcraw: a second engine, tens of
megabytes, for one family of formats, most of it per-vendor compression.

What made this tool possible is that stacking does not need it. Every RAW file
already contains a full-size JPEG that the camera rendered when it took the
shot — it is what the back of the camera shows and what the operating system
draws as the thumbnail. `src/raw.js` finds it by walking directory entries and
then asking for one slice.

The consequence is the number this tool is built around: **opening a 60 MB
frame costs about 100 KB of reading and one ordinary JPEG decode.** Twenty
frames open in the time a RAW converter would spend on one. The page shows the
figure against the size of the files, because it is the whole justification.

What it costs is honesty about what the pixels are: the camera's white balance
and picture style at eight bits a channel, not linear sensor data. The page
says so in its second FAQ answer rather than in a footnote.

Three container shapes, one rule:

| Shape | Files | Where the preview is |
|---|---|---|
| TIFF | CR2, NEF, ARW, DNG, ORF, PEF, SRW, RW2, NRW, 3FR, IIQ, DCR | a directory whose compression says JPEG, or the thumbnail tag pair, or Panasonic's single `JpgFromRaw` field |
| RAF | Fujifilm | offset at byte 84, length at byte 88, both big-endian |
| ISO-BMFF | CR3 | a track's first sample, found through `stco` and `stsz` exactly as a video frame would be |

**The rule that decides, in all three cases, is the bytes and not the tag.** A
candidate is only a candidate once it starts `FF D8 FF`. Cameras write
directories that point at packed sensor data with a compression tag saying
JPEG, and the alternative to checking is handing that to a decoder and
believing whatever it reports. `tests/js/stack-images-raw.test.js` has that
case as a fixture.

### 2. The work runs in a Worker

This is the first tool in this repository with one, so it is worth saying why
it is not a precedent for the others. Every other tool here does something that
takes a second or two. Stacking twenty large frames is minutes of solid
arithmetic over hundreds of megabytes, and on the main thread that is a frozen
page: no progress bar moving, a Cancel button that does not answer, and
eventually a browser offering to kill the tab.

`src/worker.js` is a shim. All of the work is in `src/pipeline.js`, which
touches no DOM and therefore also runs on the main thread unchanged — the
fallback for a browser without module workers, which Firefox only gained in
114.

Two things this costs, both small and both stated on the page:

- `worker-src 'self'` in the tool's own `[csp]`. It is not inherited silently
  and there is no `blob:` on it, because nothing here ever builds a script at
  runtime.
- Cancelling is noticed within one frame rather than instantly, because it
  arrives as a message and the worker only returns to its event loop between
  frames. A `SharedArrayBuffer` would be immediate and needs cross-origin
  isolation, which breaks the advertising that pays for the site.

**`OffscreenCanvas` is a hard requirement** and has no fallback, because every
surface in the pipeline is one. A document canvas cannot go to a worker.

## The files

| File | What it is |
|---|---|
| `src/main.js` | the page: the list, the settings, the predicted cost, the progress |
| `src/worker.js` | a shim around the pipeline, and the cancel flag |
| `src/pipeline.js` | the run — open, survey, measure, stack, encode |
| `src/raw.js` | finding the preview inside a RAW file. Reads offsets; never a pixel |
| `src/plan.js` | how much memory and how many decodes, before anything runs |
| `src/stack.js` | the seven methods, as accumulators over plain RGBA |
| `src/align.js` | phase correlation, and log-polar for rotation and scale |
| `src/fft.js` | the transform the alignment is built on |

`plan.js`, `stack.js`, `align.js`, `fft.js` and `raw.js` hold no DOM and no
canvas, which is what lets them be tested without either.

## Why six of the seven methods are free and one is not

An accumulator that can be updated from the frame in front of it does not have
to remember the frames behind it. A running maximum, minimum, sum and mean are
all like that, and so is focus stacking's best-so-far. Those methods hold one
accumulator no matter how many frames arrive: **a hundred frames costs the same
memory as two, and each frame is read once.**

The median is not like that, because the middle value of a set is not knowable
until the set is complete. Twenty 24-megapixel frames at three bytes a pixel is
1.4 GB, so the picture is cut into horizontal bands and one band is stacked at a
time, which trades memory for re-reading the frames per band.

Sigma clipping is the interesting middle: two passes over a constant amount of
memory. Pass one learns what each pixel usually is and how much it varies; pass
two averages only the values that agree. It cannot be folded into one pass,
because the threshold a value is tested against depends on frames that have not
been read yet. It is the mode to reach for when the median will not fit.

`plan.js` bands every method through one formula rather than having two
engines. A streaming method's working set is small enough that the band is the
whole picture and the loop runs once — the fast path, without being a separate
path.

**The numbers `plan.js` produces are shown on the page before the run starts.**
That is the reason it is a separate module with its own tests: `decodes` is the
tool's promise about its speed and `peak` is its promise about memory, and both
are checked against the allocations that actually happen rather than against
whatever the code did the day it was written.

Per pixel of a band, with the RGBA readback included:

| Method | Bytes | Passes | Bands at 24 MP, 20 frames |
|---|---|---|---|
| Lighten / Darken | 7 | 1 | 1 |
| Average / Add | 16 | 1 | 1 |
| Focus | 19 | 1 | 2 |
| Sigma clipping | 34 | 2 | 2 |
| Median | 4 + 3 per frame | 1 | 4 |

**The output canvas is in the figure too, and is not part of the band
arithmetic.** The picture being accumulated into exists at full size whether or
not the run is banded, at four bytes a pixel — 96 MB at 24 megapixels, a fifth
of the budget. It comes off the top and the bands are sized in what is left,
because a memory figure that omits a fifth of the memory is not a memory figure.
Counting it is what moves focus stacking from one band to two at full size.

The three methods that do not fit at 24 megapixels are a real limit and the page
says so, along with the working resolution that would fix it. Memory falls with
the square of the scale, so one step down is four times less and all three fit
comfortably.

## The alignment, and the sign

Phase correlation. Shifting a picture does not change the magnitude of its
spectrum, only the phase, so multiplying one frame's spectrum by the conjugate
of another's and transforming back gives a surface with a single spike at the
offset between them. One transform each finds a two-hundred-pixel shift as
cheaply as a two-pixel one; searching offsets is quadratic in the range and
would be the slowest thing in the tool.

It measures twice. The first pass runs on a 256-pixel square, which finds a
two-hundred-pixel shift as cheaply as a two-pixel one — but only the *integer*
part of the answer survives the trip back up. The sub-pixel part is estimated,
and multiplying a 256-square answer up to 6000 across multiplies its estimation
error by twenty-three: a twentieth of a pixel of fitting error comes back as
more than a pixel of blur, per frame, which is exactly the softness the
alignment exists to prevent. Measured on synthetic bursts with known shifts,
the coarse answer alone was off by one to two output pixels per frame and the
stack came out *worse* than a single input frame.

So the answer is finished during the stack itself: when each frame's full-size
decode is first in hand — a decode the stack was going to pay for anyway — a
512-pixel window from the middle of the crop is correlated against the same
window of the reference at output resolution, and the residual corrects the
coarse answer in place. At output resolution there is nothing to multiply up,
so a twentieth of a pixel of error stays a twentieth of a pixel. The same
synthetic bursts land within a quarter of a pixel per frame. The residual is
gated — a weak peak, or a correction larger than the coarse pass could
plausibly have been wrong by, leaves the coarse answer alone — and the crop
gives up a small margin on every side up front, because a frame that moves
after the crop was decided stops covering ground the crop assumed.

Rotation and scale come from the same trick applied twice: in log-polar
coordinates a rotation *is* a shift along one axis and a scale *is* a shift
along the other. That is Fourier–Mellin, and it is why the "rotation too"
setting costs one more transform rather than a feature detector.

**Everything `estimate` returns is a correction, never a measurement.** `scale`
is what the frame must be multiplied by, not how much larger it is; `angle` is
the turn that puts it straight, not the turn it arrived with. Mixing the two
conventions in one object is the mistake the whole module is arranged to avoid,
because getting it backwards does not throw, does not warn and does not look
wrong in review — it produces a stack blurred by exactly twice the camera
shake instead of by none of it, which reads as the alignment simply not working
very well. `tests/js/stack-images-align.test.js` pins it against a shift the
test itself created, exactly, with no windowing and no tolerance.

Two limits, both on the page:

- everything is global — one shift, one angle, one scale for the whole frame.
  A camera that moved is corrected; a *subject* that moved is not, and neither
  is a photograph taken from a step to the left, because parallax moves near
  things further than far ones and no single transform describes that;
- rotation is only ever recovered within half a turn, because the magnitude
  spectrum of a real picture is symmetric and 175° looks exactly like −5°.

The refinement corrects translation only. The angle and the scale keep the
coarse pass's answer — good to roughly a tenth of a degree — and a tenth of a
degree is a pixel and a half at the corner of a 24-megapixel frame, so a
similarity stack keeps a corner softness its middle does not have. Refining
them too would mean correlating the window at a spread of candidate angles,
which is a different cost class, and the translation-only refinement already
removes the error that affected every pixel equally.

**Aligning means cropping, and the crop is not cosmetic.** A frame moved twenty
pixels left stops covering the right-hand edge, whatever is not covered is
transparent, and transparent reads as zero to an accumulator — so without the
crop an averaged hand-held burst comes back with a dark border, which somebody
would reasonably blame on the stacking. `commonArea` in `plan.js` returns the
largest rectangle every frame still covers, taking the inner of each pair of
corners so a rotated quad is handled conservatively. When the refinement is
running, the crop then gives up `refineMargin`'s allowance on every side —
eight pixels for a set that really moved, one for a set that did not — which is
the room the refined corrections spend. With no alignment every transform is
the identity, nothing is refined and nothing is cropped. A set that overlaps in almost
nothing falls back to the whole frame rather than a sliver: a stack with visible
edges is something a person can look at and understand, and a postage stamp is
not.

A rotation past 30° or a scale outside 0.8–1.25 is refused and the frame falls
back to translation alone. That is not tidiness: two unrelated pictures still
produce a peak somewhere, and turning that peak into a 90° rotation and
applying it is worse than doing nothing.

## Things that will bite

**The correlation is whitened, so a picture with a narrow spectrum is all
rounding error.** Dividing by the magnitude of each frequency is what makes
phase correlation immune to one frame being brighter than another, and it also
amplifies bins the picture put nothing into. Bins below a millionth of the
strongest are dropped rather than normalised. This costs nothing on a
photograph and is the difference between an answer and noise on anything
smooth — which is also why the test fixtures are value noise over three
octaves rather than a few sinusoids.

**Focus stacking needs its bands to overlap.** Sharpness is measured from a
pixel's neighbours, so a band edge scored without them draws a seam across the
picture — invisible until somebody stacks something with a horizon in it.
`plan.js` gives that method two rows of context on each side and `bands()`
returns the read window separately from the written one.

**The alignment square must be built from the *output* box, not from each
frame.** Every frame is drawn into it the same way — the output box,
letterboxed into 256 — so that one number converts a shift there into a shift
in the output. Fitting each frame to the square separately makes that number
different per frame, and different per axis for any frame of a different shape.

**A minimum over no frames is not white.** The accumulator starts at 255 so the
first frame can only lower it, and reporting that starting point as an answer
gives a white rectangle that reads as a bug rather than as no input.

**The variance of identical frames is slightly negative.** Computed from a sum
and a sum of squares it can round below zero when every value was the same,
which is exactly what a clean stack of a static scene hits, and the square root
of that is `NaN`.
