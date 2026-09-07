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
| `src/orient.js` | the EXIF orientation: reading it off a JPEG head, and the turn that applies it |
| `src/plan.js` | how much memory and how many decodes, before anything runs |
| `src/stack.js` | the seven methods, as accumulators over plain RGBA |
| `src/align.js` | phase correlation, and log-polar for rotation and scale |
| `src/fft.js` | the transform the alignment is built on |

`plan.js`, `stack.js`, `align.js`, `fft.js`, `raw.js` and `orient.js` hold no
DOM and no canvas, which is what lets them be tested without either.

## Which way up a frame is

A phone held upright stores its JPEG sideways and writes an EXIF orientation
saying which way to turn it. The browser's decoder honours that tag:
`createImageBitmap` hands back the upright picture, 3000 tall, from a file
whose frame header says 3000 wide. So **every size the pipeline holds is the
size the decode will actually have**, not the size the header declares.
`declaredSize` swaps the header's numbers for the four quarter-turn values
before anything plans from them, because everything downstream — the survey
resize, the output box, the placement, the full-size decode — is asking what
the bitmap will be. Before it did, three portrait frames came back as one
landscape stack the shape of the reference forced sideways.

A RAW file's embedded preview is the awkward case, because the orientation
lives in the RAW's own IFD0, where the decoder never looks, and the preview
JPEG usually carries no EXIF of its own. That frame arrives sideways and the
pipeline has to turn it: `openFrame` gives it a `turn` (the IFD0 value) and a
`decoded` size (the stored one), and a single `drawFrame` helper — the only
`drawImage` of a frame bitmap in the file — applies `orientationMatrix` about
the box's centre with the sides swapped, as the innermost step of whatever
alignment transform is already on the context. The turn is synthesised **only
when the preview has no EXIF of its own**: when it does, the browser will
apply that, and applying the RAW's tag as well would turn the frame twice.

That decision needs the reader to distinguish three answers, which is why
`jpegOrientation` is tri-state. It walks the head of a JPEG over the same
segment walker `jpegSize` uses — one walker, so the two cannot disagree about
where a preamble ends — and returns the value when an Exif APP1 says so,
`null` when the frame header or the scan is reached without one, and
`undefined` when the bytes ran out first. It reads IFD0 from whatever of the
Exif block the head holds, because the tag sits in the block's first few
dozen bytes and the maker-note behind it can run to sixty kilobytes: a 4 KB
head that ends inside the block has almost always already passed the answer.
`undefined` is left for the head ending inside the directory itself, or before
a segment that might still hold the tag. It is not a failure, and a reader
that said "none" there would turn every such preview sideways. On `undefined`
the pipeline reads a 64 KB head of the preview — enough to reach an Exif block
written at the front, which is where every camera puts it — once, and only on
that path; a preview whose Exif sits behind more than that of other segments
is treated as having none.

A CR3 is the one RAW whose preview never carries Exif and whose directory is
not at the front of the file: its IFD0 sits whole in a `CMT1` box, and
`walkBmff` reads the orientation out of it for the same rule to apply. A RAF
needs nothing of the kind, because the JPEG it embeds carries its own.

`tests/js/stack-images-orient.test.js` pins each of the eight matrices by
where it sends the corners, against the specification's own wording of each
value, because a rotation the wrong way round does not throw or look wrong in
review: it puts one frame into the stack a half turn from the rest.

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
gated — a peak that is not a peak, or a correction larger than the coarse pass
could plausibly have been wrong by, leaves the coarse answer alone — and the
crop gives up a small margin on every side up front, because a frame that
moves after the crop was decided stops covering ground the crop assumed.

**Whether a peak is a peak is decided by two of four statistics — `plateau`
and `next`, with `live` as the guard under them and `coherence` reported for
the record — and one gate, `isMeasured`.** Every correlation returns the four
beside the shift. `plateau` asks whether the peak has a position at all;
`next` asks whether it is the answer or merely the tallest of several; the
two paragraphs after this one take each in turn. `live` is the mean weight
the whitening gave the bins, the share of the spectrum that stood above the
noise floor at all, and is there only to catch a square whose spectrum is
numerically empty. The gate is `plateau` at most 0.7, `next` at most 0.8 and
`live` at least 0.004, at every window size — both floors are ratios of the
surface to its own peak, and neither scales with the side — and the same
function decides the log-polar peak, the translation peak and the
refinement's residual, so there is one place to calibrate. The measurements
it was calibrated on — identical frames, a noisy textured shift, a noisy
low-texture shift, a noisy gradient and the same rounded to 8 bits, two
unrelated pictures, a dense star field and a sparse one, a wall at output
resolution, two JPEGs sharing a lattice, and a low-texture scene turned a few
degrees for the log-polar surface — are the fixtures in
`tests/js/stack-images-align.test.js`, with what each measured written beside
its assertion, and the comments on `P_MAX` and `N_MAX` in `align.js` carry
the ranges over ten seeds at every window size, with what each floor refuses
knowingly and why.

`coherence` — the peak divided by the height every weighted bin agreeing on
one offset would have produced, 1 for a perfect match — was the gate for a
week, at 0.15 on the 256 square scaled by the side, and it is reported now
and not read. It did the job on every fixture family but the tool's own
subject. A star field is sparse in the spectrum as well as in the picture: a
few hundred points put their energy into a few hundred bins, and under the
whitening floor every one of the thousands of noise bins still carries a
small weight, so the denominator belongs to the noise and a perfect match of
a sparse field reads as a poor one. In the browser, on the built refinement
path, a field of four hundred stars at fifteen per cent noise read 0.042
against a floor of 0.075 and was refused, its frames left 1–2.7 pixels off
where the code without the floor refined them to under 0.3 — while two
unrelated smooth pictures locked on their shared JPEG lattice read 0.088 and
passed. No floor separates those two, and the z-score does not either; the
comment on `L_MIN` in `align.js` has the browser's whole table.

**`plateau` is the shape of the peak: junk that correlates perfectly well and
still has no position.**
A smooth gradient — a clear sky — is refused although it correlates with
itself, and it does correlate: what the survey square holds of it is the
slope's 8-bit banding over a letterbox, and the letterbox's hard edge along
row 171 is shared by both frames wherever the camera moved, so the correlation
is pinned vertically by the edge and free along the slope, which matches
itself at any offset. That is a ridge, not a peak. Its height is real —
coherence 0.47–0.51 in the browser, three times what was then the floor — but
its position
is wherever the noise tipped the argmax along the ridge, and the sub-pixel fit
is a parabola through the top of a plateau. Before this test, four frames of
one gradient with twelve per cent noise came back measured and were moved by
−12.9, +35.6 and −0.4 output pixels from an identity that was the truth: one
to three alignment pixels, multiplied up, and a heavier crop for a set that
had not moved at all. So `phaseCorrelate` also reports the highest point of
the surface eight pixels from the peak, at every window size, in the eight
compass directions — eight along the axes, eight times root two on the
diagonals; a true ring at eight reads 0.05–0.15 higher on real peaks and
would need its own floor — as a fraction of the peak, and the gate refuses
anything over 0.7. Eight because it is the refinement's own margin: a peak
still standing eight pixels out cannot place the frame within the margin
whatever its argmax says, and on the coarse square eight alignment pixels is
already tens of output pixels. The gradients measured 0.93–0.99 in the
browser and 0.95–1.00 on the letterboxed fixture at every noise level tried;
the weakest real match, a low-texture scene at thirty per cent noise, 0.60 in
the browser and 0.65–0.68 over ten seeds depending on the seeds; a star field
0.03–0.10, a textured scene 0.1–0.5. The same reading refuses the letterboxed
gradient's log-polar peak (0.78, at a `next` of 0.39–0.56 that passes and a
coherence of 0.22 that is no longer asked), which
similarity mode had been applying as a scale of 0.95–1.01, and the
refinement's own version of the sky: a low-texture 512 window whose features
are sixty pixels across measures 0.77–0.96 with its peak one to seven pixels
off, inside the margin, and is refused on every seed at both noise levels
tried — nothing else would have refused it, and a radius that followed the
side, sixteen at 512, read it at 0.59–0.71 and let nine seeds in ten
through. The comment on `P_MAX` in `align.js` has the browser table and the
fixture table side by side, the log-polar and other-window readings, and the
two pairs the gate knowingly lets through on the letterboxed square: two
unrelated textured pictures (coherence 0.18–0.20, plateau 0.59–0.73, nine
seeds in ten, moved by one to four alignment pixels) and two unrelated
low-texture scenes at fifteen per cent noise (0.15–0.17 and 0.59–0.83, about
half). Both are the letterbox ridge with the unrelated texture's bumps along
it, both are refused by `next` alone on a full square (0.82–0.99 and
0.70–0.91, the second passing five seeds in ten), and both are left to
the consensus check the way the JPEG lattice below is. Note that a
full-square gradient fixture does *not* reproduce the browser: it measures
coherence 0.04–0.10 and `next` 0.87–0.99, and is refused by uniqueness
alone. The letterbox is what the browser case is made of.

**`next` is whether the peak is alone, for the junk `plateau` cannot see.**
It is the tallest point of the surface outside a box of ten pixels around
the peak, as a fraction of the peak: the peak-to-sidelobe ratio, the oldest
test of a correlation peak there is. A genuine match has one peak and the
rest of the surface is noise; two unrelated pictures have many noise peaks
of much the same height, and the argmax is whichever happened to be tallest;
a lattice has a row of equal peaks. The box is ten because the plateau is
read at eight — inside eight the shape of the peak is the other floor's
question — and it was measured at 6, 8, 12, 16 and 20 too. A real broad peak's
skirt is wider than the box, reaching eleven or twelve pixels, so at ten the
reading is still partly the peak itself: that costs 0.03–0.10 against a reach
past the skirt, and moves neither the unrelated pairs nor the star fields,
whose next peak is far away. The browser's table at the 512 window separates
every right answer (`next` at most 0.69) from every wrong or junk one (at
least 0.83); on the fixtures every photograph and every dense field is under
0.65 at every size, and the junk at 0.70–1.00 — gradients 0.76–0.99,
unrelated pairs 0.75–0.99 at 512, two unrelated JPEGs 0.72–1.00. The floor
is 0.8, and the case that set it is the noisy sparse sky at the survey
square: the browser's 400-star field, shrunk twelvefold into the 256×171
thumbnail with fifteen per cent noise averaged down with it, read 0.76 with
the right answer in the browser and 0.63–0.89 with the right answer on every
seed in node; 0.8 admits the browser's and six seeds in ten — about what the
old floor admitted, at coherence 0.14–0.17 against 0.15 — where 0.75 admits
two. It sits nearer the junk than the middle for the reason the plateau
floor does: a coarse move refused is a frame stacked at the identity,
unaligned by its whole shift, and a junk frame admitted was junk in the
stack already. It is also the sparse sky and nothing else that spends this
margin: which draw of the sky a window caught, not how much noise is on it,
decides how near the floor a real answer lands, and over ten draws a
twenty-star window at six per cent noise reached 0.72 and a seventeen-star
one 0.96 — the second refused on one draw in ten although its answer was
right. What the floor lets through, with the numbers, is in the comment on
`N_MAX`: a seed here and there of the unrelated pairs, about one seed in ten
of two unrelated JPEGs (eight of eighty over four qualities, worst at 50 on
smooth content, where the lattice's nearest aliases sit inside the box and
the pair sixteen pixels out falls with the scene's own envelope), and the one
family the old floor caught and
this does not — two unrelated pictures of which one has little texture,
whose surface is a few broad bumps rather than many sharp ones (0.67–0.84 at
512, eight seeds in ten under the floor, at a plateau of 0.43–0.70 the other
floor does not catch either). The letterbox refuses that pair on the survey
square (0.82–0.95), so it reaches the refinement only from a square frame.
The log-polar surface goes through the same floor and is given none of its
own: real turns read 0.20–0.81 and all but one seed in forty are admitted,
where the old floor refused fourteen seeds in twenty of a textured
scene turned nine degrees at thirty per cent noise. The one refused is a
third of a degree at thirty per cent noise, reading 0.811 — the smaller the
turn, the nearer its peak sits to the surface's own junk peak at zero shift,
and the two read as one crowd — and what that costs is the rotation, not the
frame, which is still aligned by translation. A floor of 0.85 for this
surface alone would admit it and would also admit the unrelated pairs sitting
at 0.71–0.86 there, one of which reads a seven-degree turn between two
pictures that share nothing; that trade was not taken. What neither floor sees
there is the surface's own junk peak at zero shift — the structure every
spectrum shares, its axes and its window — which a small turn of a
low-texture scene lands on one seed in four or five and reads as no turn;
for a turn under seven degrees the true peak is inside the box of it.
Coherence did not see it either (the wrong angles read 0.12–0.18, the right
ones 0.11–0.21), and the test pins one such seed as what happens.

The statistic it replaced was a z-score, the peak over the surface's standard
deviation, and it did not measure what it seemed to. After whitening every
live bin has unit magnitude, so a perfect match peaks at *k/n* over a floor of
about *√k/n* by Parseval, and the score was *√k* — a count of the bins that
survived the whitening, not a measure of whether the two pictures agreed. It
read 27 on a featureless gradient and 150 on a textured scene, the gate was set
at 4, and no frame ever failed it: featureless frames were moved by up to nine
pixels, with a spurious rotation in similarity mode, while the page reported
that they had been left where they were.

**A frame the gate refuses is left at the identity.** Not at the shift the
peak reported — that is the tallest point of a featureless surface, and
applying it is what the old gate did by never firing. The pipeline discards
the coarse `dx`, `dy`, angle and scale, records the frame as `measured: false`
with its four statistics, skips its refinement (a residual measured from the
identity is not a residual but the whole shift, which was just refused), and
`commonArea` runs over the final moves with that identity among them. The
page's "left where they were" is then a description of what happened. The
reference frame is always `measured: true`: it is what everything else is
measured against. A log-polar peak the gate refuses is a smaller event: the
frame is aligned by translation alone and `clamped` stays false, because
"reported a rotation too large to be a burst" would be untrue of a frame that
reported no rotation at all — `clamped` is kept for the plausibility bounds
only.

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

**The whitening is regularised, and the constant is large on purpose.**
Dividing each frequency by its magnitude is what makes phase correlation
immune to one frame being brighter than another, and it also lifts the
thousands of bins a photograph put nothing into — sensor noise, whose phases
say nothing about the shift — to the same vote as a real edge. On a
low-texture scene with fifteen per cent noise that put the coarse answer 1.3
to 2.8 pixels off. So each bin is divided by its magnitude *plus* a floor of
`WHITEN` times the median bin: a bin well above the floor is whitened, a bin
below it fades in proportion to how far below it is, and the noise barely
votes. The median rather than the mean because the mean belongs to the handful
of low-frequency bins. The constant is 128, not the 0.1–0.3 a regularisation
constant usually is, because the median of a noisy square *is* the noise
floor: a small constant leaves the noise bins at nine-tenths of the weight of
a real one, which measured as no help at all. The comment on `WHITEN` in
`align.js` has the table; the exponent |X|^0.75 was tried as the alternative
and was no better than full whitening. The old millionth-of-the-strongest cut
survives only as a guard against dividing by nothing on a square whose whole
spectrum is numerically empty: on a picture no bin is zeroed any more, it is
faded by the floor instead. This is also why the test fixtures are value noise
over three octaves rather than a few sinusoids: a fixture that puts nothing
into most of its bins is all rounding error by the time it reaches the peak.

**A sky correlates with itself and still cannot be aligned, and the
letterbox is why.** Every 3:2 frame reaches the coarse square as 256 by 171
of picture over transparent black, so two frames of a smooth gradient share a
hard edge that did not move with the camera and a slope that matches itself at
any offset — coherence 0.5, a ridge for a peak, and an argmax that wanders by
one to three alignment pixels, which the multiply-up turned into tens of
output pixels of movement on frames that had not moved. `coherence` cannot
see it, because the content genuinely correlates; the `plateau` reading in
`phaseCorrelate` — how much of the peak is still standing eight pixels away —
can, and `isMeasured` refuses anything over `P_MAX`. The same edge also
biases every real low-texture answer the survey square accepts: letterboxed,
the low-texture fixture lands 1.3–1.9 alignment pixels off at fifteen per
cent noise and 1.0–2.0 at thirty, pulled towards the ridge, where the full
square lands it within 0.1–0.7 and 0.3–1.9; on a 3000-pixel frame that is
15–22 output pixels, beyond the refinement's 8-pixel margin, so the 512
residual — itself within half a pixel there — is refused by the margin test
and the coarse error stands. That is a cost of the survey square, not of the
gate, and the fix is the same one that would remove the ridge under the
gradients and the unrelated pairs: taper the picture's own box in
`lumaSquare` — a window over `fit`'s rectangle, or fill outside it with the
picture's mean before windowing — so the edge is not a feature both frames
share. It is a follow-up. Two things follow for anyone extending the gate
meanwhile. A fixture of the gradient over the whole square measures a tenth
of the coherence and is refused without the plateau's help, so a fixture that
does not letterbox does not reproduce the browser; the tests' `letterbox`
helper exists for that. And the plateau radius is eight at every window size,
not a fraction of the side: a radius of four at 128 refused the low-texture
pair with its peak in the right place, and a radius of sixteen at 512 kept
the wall with its peak five pixels wrong. `plateauRadius` in `align.js` says
why, and the comment on `P_MAX` has the readings at both.

**The gate mostly catches a JPEG's block lattice, and where it does is not
where it was designed to.** Every frame of a phone burst is a JPEG, and every
JPEG carries the same 8-pixel grid, so two frames share a feature that did
not move with the picture. Two unrelated smooth pictures both compressed
correlate on nothing else, and `next` reads the row of equal peaks for what
it is — 0.72–1.00 at 512 over eighty seed pairs at qualities 95, 75, 50 and
20 — but eight of those eighty are admitted, about one in ten, worst on
smooth content at quality 50. The leak is where the lattice puts its aliases:
the nearest sit eight pixels from the peak, inside the ten-pixel box, so what
is read is the pair sixteen or seventeen pixels out, and those fall away with
the scene's own smooth envelope where the near ones stand level with the
peak. It is harmless as the pipeline is arranged — the survey square
letterboxes the same pairs to 0.91–0.99 and refuses every one, and at 512 an
argmax on a random lattice peak is outside the refinement's 8-pixel margin
and discarded there — but the consensus check is what should be catching it.

The refinement's own scenario is the same lattice between two frames of *one*
smooth scene: the coarse move a third of a pixel short, and the residual
landing on the lattice's alias at +3 pixels, inside the margin. Uniqueness
cannot see that one at all, for the same reason — it reads 0.46–0.93 at
quality 75 and 0.27–0.40 at 20, the noise beyond the lattice rather than the
lattice. What refuses it is the plateau, by a coincidence nobody chose: its
radius is eight because that is the refinement's margin, and eight is also
the block pitch, so the shoulder is read on the lattice's first alias and
spikes there — 0.71–0.96 at a radius of eight against 0.50–0.69 at six and
0.47–0.74 at ten. At qualities 95, 75 and 50 that refuses the lock on every
seed pair tried. Only at quality 20, where the blocking buries the alias,
does it get through: eight of ten seed pairs, applying the alias. Textured
content is immune (0.77–0.91, correct to 0.03 pixels), and so is the coarse
pass — the thumbnail averages the blocks away. This is a peak of the wrong
thing, not a weak one; full whitening landed on the same alias, so it is
inherited rather than introduced by the gate. The tests pin both sides, so a
plateau radius moved off eight cannot quietly hand the lock back, and
whatever finally catches it has to say so there.

**A sparse sky is refined at 512 again, and the 64 window is not gated at
all.** Twenty stars in a 512 window at six per cent noise read `next`
0.40–0.53 and `plateau` 0.05–0.30 and are refined to within 0.2 pixels,
where the coherence floor refused them at 0.04 — level with junk, for the
reason above. That range is one draw of the sky over ten noise seeds; over
ten different draws the same window reads 0.32–0.72, and a seventeen-star
one 0.37–0.96, so it is which stars the window caught rather than how much
noise is on them that decides how near the floor a right answer lands. At
fifteen per cent the same twenty stars are wrong by 10–105
pixels and `next` refuses every seed at 0.80–0.99; the browser's own field
keeps twenty-two stars in its window and is right at fifteen per cent, at
0.36–0.57. Neither floor scales with the side, and at 128 both hold: the
real pairs read 0.04–0.45 and the junk 0.67–1.00. At 64 the surface has too
few bins for junk to read as junk — an 8-bit gradient at one per cent noise
reads 0.41–0.70 and passes eight seeds in ten, an unrelated pair 0.63–0.97 —
where the old floor at 0.60 refused both, and every noisy real pair with
them. That is accepted rather than fixed: `plan.js` gives the 64 window only
to crops under 272 pixels on the short side, where the coarse square is
within a factor of 1.6 of output resolution, and `refineMargin` caps what an
applied residual can move a frame that did not move at one pixel. The
comment on `N_MAX` has the numbers at every size.

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
