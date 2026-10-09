# GIF Analyzer

Opens a GIF and says what is in it: every frame with its delay, rectangle and
disposal method, the colour tables, the loop block, any text the file carries,
and a byte-by-byte account of where the file size went. It writes nothing and
changes nothing.

Live at [abox.tools/gif-analyzer/](https://abox.tools/gif-analyzer/).

## Why this is not `<img>` plus `ImageDecoder`

The browser has a GIF decoder built in, and both `<img>` and `ImageDecoder`
will happily hand back the frames. Neither will answer the question this tool
exists for.

`ImageDecoder` gives frame count, repetition count and per-frame duration. It
does not say whether a frame carries a palette of its own, how many bytes that
palette cost, how much of the file is XMP an editor left behind, or which of the
256 declared colours no pixel ever refers to. Those are properties of the
*file*, and a decoder's job is to forget the file and produce pictures.

So the format is read out here by hand, and the header of every module says
which part of the specification it implements. The parse is deliberately
literal - a header, a screen descriptor, a colour table whose length is a power
of two, then a stream of blocks - because that shape is the thing being
reported on.

## The files

| | |
|---|---|
| `src/reader.js` | a byte cursor that refuses to read past the end of the file |
| `src/gif.js` | the block walk: what is in the file, and where each part starts |
| `src/lzw.js` | the decompressor, and what it noticed about the stream |
| `src/frames.js` | indices to pixels, interlacing, and the disposal rules |
| `src/analysis-steps.js` | synchronous and cooperative consumers of the same algorithms |
| `src/analysis-memory.js` | conservative admission for owned screen, patch and thumbnail buffers |
| `src/draw-analysis.js` | cancellable drawing, prefix retention and canvas lifetime |
| `src/budget.js` | the byte accounting, and what the colour tables cost |
| `src/findings.js` | the readings: what is worth saying about this particular file |
| `src/format.js` | numbers as a person would say them |
| `src/report.js` | the whole analysis as plain text |
| `src/main.js` | the page |

`reader.js` through `budget.js` touch no DOM at all, which is what lets
`tests/js/gif-analyzer.test.js` build files with the GIF *writer* from
`tools/gif-maker/` and read them back with this one.

## The three things worth knowing

### The byte budget has to add up, and says so when it does not

`budget.js` puts every byte of the file in exactly one bucket and then checks
the buckets against the file's own length. Where they disagree - which happens
on a file that ends mid-block - the difference appears as a row called "not
accounted for" rather than the percentages being quietly normalised so the bar
still reaches the end.

That check is the point of the module rather than a precaution. A breakdown that
does not add up is a breakdown that is wrong somewhere, and a bar chart is very
good at hiding that.

The buckets are the ones somebody can act on: compressed pixels, colour tables
global and per-frame, the eight bytes of timing and eleven of descriptor per
frame, the sub-block framing, metadata, the trailer, and anything sitting past
it.

### Disposal is applied after the frame is shown, not before it is drawn

This is the rule people get wrong, and getting it wrong produces an animation
that flickers on exactly the frames whose disposal method was chosen to stop it
flickering. `Compositor.draw` in `frames.js` therefore draws, takes the copy the
page displays, and only then clears the rectangle or restores what was saved.

The other half of that: the specification says "restore to the background
colour" and names an index in the screen descriptor, and every browser has
cleared to transparent instead for twenty-five years. This follows the browsers,
because the question the page answers is what a viewer does.

### Pixel analysis is bounded before allocating a screen or patch

Two hundred frames of a 600×600 GIF held as RGBA approach three hundred
megabytes. `draw-analysis.js` keeps the compositor and previous shown screen
only during drawing, scales each frame into two thumbnails, and drops its large
buffers. Each thumbnail has at most 120×120 backing pixels; tiny frames retain
their original backing size even when CSS enlarges them.

`analysis-memory.js` uses the shared `gif-working-budget` arithmetic before
constructing the compositor and again before each patch's first LZW allocation.
The 512 MiB estimate includes the encoded buffer, retained thumbnail backing
stores and palette-use flags, five screen copies for current/previous pictures
and disposal-snapshot turnover, patch indices and RGBA, compressed sub-block
copies, interlace rows, dictionaries and native thumbnail scratch. It bounds
known buffers owned by this page, not browser internals, JavaScript object
metadata, garbage-collection timing or the native preview decoder. Drawing also
retains the existing ceiling of 300 million decoded pixels.

Any refused or empty patch permanently ends drawing. A smaller later patch
cannot be composited correctly after a missing dependency. Parsed headers,
byte accounting, palettes, extensions and timing remain available; the page and
text report identify the completed prefix and why drawing stopped. Whole-file
pixel-use, unused-entry, colour, dictionary-reset and identical-frame totals
are withheld until every frame has been drawn. Measured per-frame diagnostics
remain available for the completed prefix. An incomplete source is never given
to the native animation preview as another unchecked allocation path.

LZW expansion, painting, composition and comparison yield after bounded work;
the browser checkpoint yields a real turn after about 8 ms and at least every
eight completed frames. The existing synchronous public exports drain these
same algorithms, preserving their pixel and diagnostic contracts. The literal
parser, initial file read, native typed-array copies and canvas calls remain
synchronous within each operation and cannot be interrupted mid-call.

### Reads, reports and native resources belong to one source

Selecting another file or pressing Clear retires the prior read, report,
preview URL and canvas backing stores immediately. Late read completions,
errors and clipboard feedback cannot replace a newer source. Cancel during a
native file read retires its callback; Cancel during drawing retains only the
completed prefix and marks the rest as header-only. Clear and read cancellation
return keyboard focus to the native picker; drawing cancellation focuses the
stable Clear control and keeps it in view when the partial report appears.
Owned completion or failure also recovers focus if it hides a focused Cancel or
Clear button, while leaving other focused controls alone. Pending thumbnails,
full-size scratch canvases and compositor buffers retire on every success,
refusal, failure and cancellation path. Report download URLs retire on source
replacement, Clear or their existing timeout.

Ordinary complete analysis keeps the same plain-text report bytes. The new
drawing qualification is added only when drawing is incomplete. Known message
keys are resolved against the page's phrase inventory; unknown native error
detail stays text, including quotes or brackets.

## What it deliberately does not do

- **It does not write a GIF, or write anything out of one.** Getting the frames
  out as PNGs is [`../split-gif/`](../split-gif/), which already exists;
  resizing, reversing and retiming are each still their own tool on the roadmap.
  Each is a different job from reading, and the only download here is a
  plain-text copy of the analysis.
- **It does not repair anything.** It reads a damaged file as far as it goes and
  says where it stopped. Guessing at the missing bytes would produce a file that
  looked fine and was not.
- **It does not recommend a tool.** A findings list that turns into an
  advertisement stops being a finding.
- **It does not check the LZW stream against the browser's decoder.** It could -
  the page holds the file and could put it through `ImageDecoder` as well - but a
  disagreement would be reported as a fact about the file rather than as the bug
  in this code that it would actually be. The animation preview at the top is the
  browser's own rendering of the same file, side by side with the frames drawn
  here, which puts the comparison in front of a person instead.

## The findings, and the rules they follow

`findings.js` is where an analyzer earns its keep and also where one goes wrong,
so it holds itself to three rules:

- **Say the number.** "This file spends 41 KB on colour tables" earns its line;
  "consider optimising your palette" does not.
- **Only when it is true of this file.** Nothing fires on a threshold somebody
  guessed at. Every level is either a property of the format - browsers clamp any
  delay under 0.02s to 0.10s - or a measured quantity with arithmetic behind it.
- **Never recommend a tool.** See above.

The clamping one is worth calling out because it is the single most common
surprise in this format. Every browser since Netscape 2.0 rounds a delay under
two hundredths of a second up to ten, a rule written in 1996 and never removed,
so a GIF whose frames all say 0.01s plays at 10 frames a second rather than 100.
The page reports the nominal duration and the real one side by side.

## Tests

`tests/js/gif-analyzer.test.js` covers the parser, the decompressor and the
compositing, mostly as round trips: build a file with `tools/gif-maker/src/`,
read it back with this one, and check every field survived. The LZW tests go the
other way as well - compress with the maker's encoder, expand with this
decoder - because a compressor and a decompressor that agree with each other and
with nothing else is the failure neither one can show on its own.

`tests/js/gif-analyzer-owned-analysis.test.js` additionally covers stepped and
synchronous parity, disposal history, admission boundaries, permanent
header-only latching, cancellation, pending-canvas cleanup and qualified
reports. The browser checks exercise current-source ownership and real native
canvas/clipboard behaviour.

The refusals are tested too: a file that is not a GIF, a file that ends
mid-block, a stream with a code that refers to a dictionary entry that does not
exist. Each has to report where it stopped and keep whatever came before it.
