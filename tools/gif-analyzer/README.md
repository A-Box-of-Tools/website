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

### Nothing full-size survives the decode loop

Two hundred frames of a 600×600 GIF held as RGBA is nearly three hundred
megabytes, and a page that does that is killed by the browser on the file its
user most wanted to analyse. So `decodeAll` in `main.js` scales each frame into
a small canvas the moment it is drawn and drops the large buffers. About 60 KB a
frame survives, whatever the GIF's size.

The "is this frame identical to the last one" comparison happens inside the same
loop for the same reason: it needs two full canvases, and only one pair exists at
a time.

There is also a pixel budget - 300 megapixels of decoding - after which frames
are reported from their headers alone and the frame list says so. Everything
that comes from the parse rather than the pixels is complete either way.

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

The refusals are tested too: a file that is not a GIF, a file that ends
mid-block, a stream with a code that refers to a dictionary entry that does not
exist. Each has to report where it stopped and keep whatever came before it.
