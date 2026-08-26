# Image Resizer

*Say the size. Draw the box. Pick the format.*  ·  lives at `/resize-image/`  ·  [all tools](../)  ·  [how the site is built](../../README.md)

The eighth tool. It resizes a picture to dimensions you choose, crops it to a
box you drag, and writes it out as whichever of JPEG, PNG and WebP you asked
for — one file or a folder of them, and none of them going anywhere.

---

## Why this is one tool and not three

Resize, crop and convert were three separate names on the planned list, and
building them as three tools would have been the obvious reading of it. They are
one tool here for a reason that only shows up once you write the code: they are
the same operation.

A crop is a source rectangle. A resize is a destination rectangle. A format
change is the argument to `toBlob`. All three are one `drawImage` and one
`toBlob`, and a browser asked to do them separately does the expensive part —
decode, scale, encode — once per tool instead of once in total. Three tools
would have meant three decodes of the same photograph, two intermediate files,
and two re-encodes that cost quality for nothing.

The other half of the argument is what people actually arrive wanting. "Make
this a 500 x 500 profile picture" is a crop *and* a resize *and*, half the time,
a JPEG. Splitting that across three pages would have made the common job the
awkward one.

## The order, and why it is not negotiable

Crop first, resize second, encode third. Always, and the page says so out loud
in step 2.

Cropping after a resize would be cutting a rectangle out of a picture that has
already thrown away most of its pixels: ask for a 500 x 500 crop of a photograph
that has just been scaled to 800 x 600 and you get 500 x 500 pixels interpolated
from a quarter of the detail that was available. Doing it the other way round —
take the region, then scale what is in it — spends the original pixels on the
part you kept.

It also makes the numbers on the page mean something. "The box keeps 1800 x 1800
of it. It comes out 800 x 800" is two sentences about two rectangles, and the
second is a percentage of the first.

## One `drawImage`

`src/geometry.js` is the whole of what this tool decides, and it decides it
without touching a pixel:

```js
plan(crop, resize)
  → { source: {x, y, width, height},   // the region read out of the picture
      canvas: {width, height},         // the canvas that is created
      draw:   {x, y, width, height},   // where that region lands on it
      padded, scale }
```

`src/codecs.js` then does exactly this with it:

```js
ctx.drawImage(source,
  plan.source.x, plan.source.y, plan.source.width, plan.source.height,
  plan.draw.x,   plan.draw.y,   plan.draw.width,   plan.draw.height);
```

Crop, resize and pad are all in that one call, which is why there is no
intermediate bitmap anywhere in the tool, and why a crop followed by a resize
costs exactly what a resize alone costs. It is also why `geometry.js` is the
file the tests are about: nothing else in the tool makes a decision, so a
mistake there is a mistake in the output and there is nowhere else it could be
caught.

## The four fits, and the case where none of them applies

Give the tool a width and leave the height blank — or the other way round — and
there is no decision to make: the blank side follows from the shape of the
picture. That is the common case, it is what "1920 wide" means, and the "if the
shapes disagree" control does not even appear.

It appears when both boxes have a number in them and the two disagree with the
shape of the picture, which is the only time anything has to be reconciled:

| Fit | What comes out | What it costs |
|---|---|---|
| Fit inside | The whole picture, inside the box | One side is shorter than asked for |
| Fill it | Exactly the size asked for | The overflow on the long side is cut off |
| Pad it | Exactly the size asked for | A background around the picture |
| Stretch it | Exactly the size asked for | The shape is distorted |

"Fill it" takes its overflow out of the *source* rectangle rather than drawing
the picture off the edge of the canvas. The result is identical either way, and
this way the crop the page reports is the region that was actually read.

## Enlarging, which is off by default

Scaling a picture up cannot add detail that was never photographed. It can only
produce a larger, softer copy — and the person who typed 1920 into a box was
usually trying to make things smaller, and did not think about the one file in
the batch that was already 800 wide.

So "never make a picture bigger than it started" is on by default, and honoured
by every mode that could enlarge by accident. Two deliberate exceptions, both of
them somebody stating a size rather than a limit:

- **A percentage.** 200% means 200%. The checkbox is not even shown in that mode.
- **Stretch.** "Exactly this size" is exact in both directions.

Padding is the interesting middle case: the frame stays exactly the size asked
for, because an exact frame is the entire point of padding, and the picture
inside it simply is not blown up to fill it.

## Every image has its own box

Cropping is not a mode. There is no "do you want to crop" question to answer,
because the answer is in the box itself: it opens on the whole picture, so an
image nobody drags on goes through whole. A step you can ignore costs nothing;
a question you have to answer first costs everybody who only wanted a resize.

Each image owns its rectangle, in its own pixels, along with the shape that
rectangle is locked to. Clicking a row puts that image in the preview with its
own box and its own lock back on it — so a batch can be cropped one way, another
way, and not at all, and nothing you do to one image touches another.

That leaves the case where a folder of exports all want the same framing, which
would otherwise cost one drag each. **Use this crop on every image** is the one
control that writes another image's box, and it does it once, when pressed,
rather than deriving it on every render: every other image takes the same
relative area — the same fractions of its own width and height — and the boxes
stay editable afterwards.

With a shape locked it does one thing more, and that is the difference between a
tool that works and one that is merely correct. Somebody who pressed **1:1**
wants squares. The same relative area of a picture with a different shape is not
a square — so the relative area is treated as the region of interest, and the
largest box of the locked shape *inside* it is what is kept. Press 1:1, press
the button, and a folder of mixed portrait and landscape shots comes out square,
each framed on the same part of its own picture.

The note under the preview says how many of the others have a box of their own
and how many are still on the whole picture, and only when there is another
image for it to be true of.

## Looking at the result

Every finished file opens full size in a `<dialog>` — click the thumbnail, or
the **View** button beside the download. A real `<dialog>` opened with
`showModal()` rather than a `div` pretending to be one: Escape, the focus trap
and an inert background all come free from the browser and all come correct.
Only the backdrop click is written here, and it is one line, because a click
that lands on the dialog element rather than on anything inside it *is* the
backdrop.

What it adds over the row is the part a thumbnail cannot answer: the picture at
a size worth judging, on a chequerboard so that transparency reads as
transparency rather than as whatever colour the theme happens to be, and every
figure behind the result — before and after, the crop in source pixels and where
it was taken from, the scale, the quality that was spent, and whether the
metadata survived. **Show the original** swaps the two in place, which is the
only fair way to compare them.

It costs nothing to open. Both pictures are object URLs this page already holds
— the result's, and the original's, which has existed since the thumbnail was
drawn — so the dialog fetches nothing and decodes nothing that was not already
decoded. A small picture is shown at its own size rather than blown up to fill
the dialog, because this is the view people open to judge a result and scaling
it up would be showing them something the file is not.

## A file nobody asked to change is not changed

With no crop, no resize and no format change, the file you chose is handed back
as the `File` object it arrived as. Not re-saved, not "optimised": the same
bytes.

That is not politeness. Re-encoding costs a little quality every time, and a
canvas holds pixels and nothing else — so a re-save would silently drop the
EXIF, the GPS, the timestamps and the colour profile of a picture whose owner
had changed nothing about it. `isUntouched()` is checked before the file is
opened at all, and the result row says which of the two happened.

Anything the tool *does* process loses its metadata, for the same reason and
unavoidably. The page says that too, and points at `/exif-editor/` for anyone
who wanted the tags gone without the picture being touched.

## Limitations

- **Enlarging is a plain bilinear scale.** The browser's, at
  `imageSmoothingQuality: 'high'`. There is no sharpening pass and no upscaling
  model, and there is not going to be one — that is a different tool with a
  different argument behind it.
- **The formats are what the browser writes.** JPEG, PNG and WebP. AVIF is
  written only by Chromium's `canvas.toBlob`, so it is not offered; the tool
  checks what this browser will actually encode by asking it to encode a single
  pixel, because Safari quietly returns a PNG when handed a type it cannot write.
- **A GIF comes out as a still.** Its first frame, as PNG. Animated GIF is its
  own group on the planned list and needs a real GIF writer.
- **Rotation is not here.** Straightening a scan by two degrees needs a
  transform, a background, and a decision about what happens to the corners, and
  it is a separate name on the planned list for that reason.
- **The size and the format are the whole batch's.** The crop is per-image; the
  dimensions and the output format are not. A batch that genuinely wants two
  different output sizes is a batch that wants running twice.

## Testing it

`tests/js/resize-image.test.js` covers `geometry.js`, `files.js` and the format
table, which is everything in the tool that is not a canvas call. The cases that
get the most attention are the ones with a decision in them: what a blank height
means, what each fit does to a 4:3 photograph in a 3:2 box, whether every fit
that could enlarge honours the checkbox that says not to, and whether the four
fits are four genuinely different answers — if two of them ever agreed, one of
them would be a control on the page that does nothing.

The rest was checked by hand in the browser, the same way the compressor's was:
images generated on a canvas and fed to the file input through a `DataTransfer`,
then

- a three-image batch cropped three different ways — a locked 1:1 box on one, a
  hand-typed rectangle on another, nothing at all on the third — with each box,
  and each locked shape, still in place after clicking away to another row and
  back;
- **Use this crop on every image** over that batch, which put a 1:1 box on all
  three at 1800 x 1800, 900 x 900 and 600 x 600, each centred on the same part
  of its own picture;
- a transparent PNG padded into a square JPEG and its pixels read back to
  confirm the background colour reached both the padding *and* the
  transparency;
- a file with nothing asked of it coming back as the identical `File`, name and
  all;
- the viewer opened from the thumbnail and from the button, closed by Escape, by
  the backdrop and by its own button, with the compare toggle swapping a 500 x
  333 result for its 1200 x 1600 original in place;
- and the whole of the above again against the **minified** build, which is what
  actually deploys.
