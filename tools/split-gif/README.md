# GIF Splitter

*Every frame of an animation as its own PNG.*  ·  lives at `/split-gif/`  ·  [all tools](../)  ·  [how the site is built](../../README.md)

Reads an animated GIF, hands back one PNG per frame, and tells you what each
frame actually is: how long it was held, where it sits, how big it is, and what
happens to its rectangle before the next one lands. The reader is written out
here — the container in `src/gif.js`, the LZW decompressor in the same file, and
the disposal rules in `src/compose.js` — and the PNGs are written by the
browser's own encoder.

It is the mirror of [GIF Maker](../gif-maker/), and the two share a
specification rather than any code. The writer's `src/lzw.js` and this reader's
`lzwDecode` are the two halves of the same algorithm written from the same
document, which is exactly what makes a round trip between them worth testing:
if either had been written from the other, agreeing would prove nothing.

---

## Why this is hand-written when the browser can already decode a GIF

The browser can *play* one. It will not hand you the parts.

| What you might reach for | What it gives you |
|---|---|
| `<img src="…gif">` | an animation that plays; no way to address a frame |
| `drawImage` of that `<img>` | the first frame, forever, whatever is on screen |
| `createImageBitmap(file)` | the first frame again |
| `ImageDecoder` | composited frames and durations — in Chromium and Firefox, not in Safari |

`ImageDecoder` is the only real candidate, and it was rejected for two reasons
rather than one. It is missing from Safari, so the tool would either not work
there or would need this parser anyway as a fallback — and a fallback that only
runs in one browser is a fallback nobody tests. More importantly it decodes the
wrong thing: it composites, so it cannot tell you that frame 12 is a 40×30 patch
at (100, 8) with index 7 held back as transparent. That is precisely what
somebody taking a GIF apart is asking about, and it is the difference between
this tool and every "GIF to PNG" page that uploads your file.

So the format is read here, the same way in every browser, and both answers are
available: the frame as it is *seen* and the frame as it is *stored*.

## The two answers, and why both are on the page

A GIF is not a stack of pictures. It is a first picture and then a series of
patches, each with a rule about what to do with the canvas afterwards. So
"frame 14" is genuinely ambiguous:

- **As it appears** — frame 14 drawn on top of everything before it. The default,
  because it is what almost everybody means, and what a contact sheet, a
  thumbnail or a video editor needs.
- **As it is stored** — the patch on its own, at its own size and position, with
  everything it does not carry transparent. Nothing else will show you this, and
  it is the only view that explains why a 400-frame GIF is 900 KB.

Splitting them apart is also why `src/gif.js` and `src/compose.js` are separate
files. Parsing is about bytes and is either right or wrong. Composition is about
what a renderer *chooses* to do with an under-specified rule, and there is more
than one defensible answer — see below.

## The disposal methods, and the one that is a judgement call

Four of them, and they are the whole of the composition machine:

| | Meaning | What `GifCanvas` does |
|---|---|---|
| 0 | unspecified | treated as 1 |
| 1 | do not dispose | nothing; the canvas keeps what the frame drew |
| 2 | restore to background | clears that frame's rectangle |
| 3 | restore to previous | puts back the canvas as it was before that frame |

Method 2 says "background", and the specification means the background colour
from the screen descriptor. **Every browser written since about 1997 clears to
transparent instead**, because that is what the animations of the era assumed,
and honouring the letter of the specification makes a large number of old GIFs
render with coloured holes punched through them. This follows the browsers
deliberately: the tool exists to hand back the frames somebody *saw*, and what
they saw is what their browser drew.

The order inside `GifCanvas.next()` is the other thing worth reading twice. For
each frame: apply the *previous* frame's disposal, then take the snapshot that
method 3 will restore, then paint. Taking the snapshot before the previous
disposal is applied — which is the natural way to write it, because the snapshot
belongs to this frame — restores a canvas that never existed on screen. It is
wrong on exactly the files that use method 3 and right on everything else, which
is the worst kind of bug to have.

## LZW, and the code that is not in the dictionary yet

The decompressor is the other half of the coder in
[`/gif-maker/src/lzw.js`](../gif-maker/src/lzw.js), and it has the same one hard
part, seen from the other side.

The decoder runs one entry behind the encoder. When the encoder writes a code it
immediately learns the entry it has just proved; the decoder cannot learn that
entry until it reads the *next* code, because the new entry ends with that
code's first pixel. Which means a legal stream can contain a code the decoder
has not defined yet — the encoder used an entry the instant it created it — and
the answer for that one case is "the previous run, plus its own first pixel".
A decoder without that branch produces confetti on perfectly valid files.

The code width grows on the same one-behind schedule: `next === (1 << width)`,
checked *after* the entry is added. The encoder's mirror of that check, and the
reason it sits where it does, is documented at the top of `gif.js` in the maker.

Both are pinned by tests. `tests/js/split-gif-decode.test.js` compresses with the
maker's encoder and decompresses with this decoder, over payloads long enough to
force several width increases and a dictionary reset.

## Interlacing

Still legal, still occasionally used, and invisible until it is not: an
interlaced GIF stores its rows in four passes, and a reader that ignores the bit
produces a recognisable picture with its rows in the wrong order. `deinterlace()`
is eight lines and it is tested against a hand-built file, because the failure
looks like a corrupt image rather than like a bug in a decoder.

## What it is lenient about

GIFs in the wild are damaged constantly: truncated downloads, a missing trailer,
a last frame whose code stream stops mid-run, padding bytes between blocks. A
reader that throws on those tells somebody their file is "not a GIF" when their
browser plays it perfectly well.

So everything after the header is best-effort. Whatever frames were complete come
back, with a note on the page saying what was wrong, and only two things are
refused outright: bytes that do not start `GIF87a` or `GIF89a`, and a file that
yields no frame at all. Inside a frame, a code stream that runs out early fills
the rest of the rectangle with index 0 and marks the frame partial rather than
throwing away the pixels that did arrive.

There is one deliberate ceiling. A GIF expands to about a byte per pixel per
frame while it is being read, so a 5 MB file can be a gigabyte of indices — a
tab dying rather than an error anybody can act on. `decodeGif` stops at 512
megapixels of decoded frames and reports what it managed.

## Why PNG and only PNG

A GIF frame is at most 256 colours with one bit of transparency. PNG stores
exactly that, losslessly. Every lossy format a browser can write would throw the
transparency away, invent colours the frame never had, and — on flat artwork,
which is most of what GIFs are — produce a *larger* file. There is no version of
"every frame out as its own JPEG" that is not worse at this job, so the format
is not offered and the FAQ says why. Anybody who genuinely needs JPEGs can run
the PNGs through [the resizer](../resize-image/).

The encoder itself is `canvas.toBlob`, which is the browser's own. This tool
vendors nothing: what the browser lacks is the *reader*, and that is the part
written out here.

## The timing list

Splitting an animation destroys the one thing the frames cannot carry: how long
each was held. A PNG has nowhere to put it, and it cannot be reconstructed from
a folder of images afterwards.

So the ZIP can carry `frames.txt` — every frame's delay as stored, its delay as
actually played, its position, its size and its disposal. It costs a couple of
kilobytes and it is the difference between "I split this GIF" and "I can put
this GIF back together". The two delay columns are there because they routinely
differ; see below.

## Delays, and the clamp everybody trips over

A GIF stores each delay in hundredths of a second. **Browsers have clamped
anything under two of them to a tenth of a second since the 1990s** — a rule
written for the spinning globes of the era and never removed. A file claiming
0.01 s per frame claims 100 fps and plays at 10.

`playedDelay()` is that rule, in one line, and the page shows the played number
with the stored one beside it whenever they differ. Reporting only the stored
delay would tell somebody their animation runs at 100 fps; reporting only the
played one would hide what their file says. The gap between them is also the
usual reason a GIF that is split and rebuilt comes out slower than the original.

## The names

`name-001.png`, numbered from one and zero-padded to the width of the last
number. Both halves matter. Frame 1 is frame 1 to everybody who is not a
programmer, and `frame9.png` sorts after `frame10.png` in every file manager
there is, because they sort text. Padded names sort correctly everywhere, and
every video editor that imports an image sequence expects them.

"Keep every second frame" does not renumber anything. Frame 42 is still called
frame 42, so a thinned set still lines up against the original and against the
timing list.

## Memory, which is what shapes the code

The composited frames are never all held at once. `GifCanvas` keeps **one**
canvas and walks forward, because 300 frames of 500×500 RGBA is 300 MB and one
canvas is 1 MB. The thumbnails on the page are shrunk before they are encoded,
and a single frame's download replays the animation from the start rather than
keeping anything — which sounds expensive and is not, because the indices are
already decoded and a frame costs a copy and a paint.

The ZIP pass is the same walk, once, with the frames nobody asked for skipped on
the way out but still drawn on the way through: frame 40 depends on frames 1–39
whether or not you wanted them. In the stored view they do not, so those frames
are never touched at all.

## Limitations

- **No editing.** This takes a GIF apart; it does not put one back together.
  That is [GIF Maker](../gif-maker/), and `frames.txt` is the bridge between
  them.
- **No resizing on the way out.** Frames come out at the size the GIF holds
  them. Scaling belongs to [the resizer](../resize-image/), and doing it here
  would mean choosing an interpolation for pixel art, which is a decision worth
  making deliberately rather than by default.
- **A still GIF is a GIF with one frame**, and the tool handles it, but that is
  a job [the resizer](../resize-image/) does with fewer steps.
- **The plain-text extension is skipped.** It is a block of text the renderer of
  1990 was meant to draw in a grid of cells. Nothing has honoured it in thirty
  years, and drawing it would mean shipping a bitmap font.
- **Frames are not deduplicated.** A GIF that stores the same picture twice comes
  out as two identical PNGs, because it is two frames.

## Testing it

`tests/js/split-gif-decode.test.js` covers the parts that have a right answer:

- **A round trip against this repository's own writer.** Frames are compressed
  with `/video-to-gif/src/gif.js` and read back here, so the indices, the
  palette, the delays, the loop count, the transparent index and the frame
  rectangles all have to survive. The two files were written from the
  specification independently, which is what makes agreement mean something.
- **The LZW edge cases**, over payloads long enough to force several code-width
  increases and a full dictionary reset, plus the run-that-is-not-in-the-table-
  yet case that a naive decoder gets wrong.
- **Interlacing**, against a hand-built file whose rows are known.
- **Composition**, frame by frame: transparency showing the frame underneath,
  method 2 clearing to transparent, method 3 restoring the canvas from *before*
  the frame it belongs to, and a patch that hangs off the edge of the logical
  screen being clipped rather than wrapping.
- **The refusals and the tolerances**: a PNG offered as a GIF, a truncated file
  that still yields its complete frames, and a frame whose code stream stops
  mid-run.

What is not tested there is anything needing a `<canvas>` — the thumbnails, the
PNG encoding and the ZIP download. Those are exercised in a browser, and the
check that finally matters is the round trip a person can run: split a GIF, feed
the frames back into [GIF Maker](../gif-maker/) with the delays from
`frames.txt`, and compare the result with what went in.
