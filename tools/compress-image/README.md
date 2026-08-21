# Image Compressor

*Name the size. It works out the rest.*  ·  lives at `/compress-image/`  ·  [all tools](../)  ·  [how the site is built](../../README.md)

The third tool. You give it a file size; it gives you the best-looking image
that fits in it.

---

## Why a target size rather than a quality slider

Every other compressor hands you a quality dial and leaves you to guess. That is
backwards, because nobody arrives wanting "quality 62". They arrive because an
upload form said 500 KB, or an email bounced, or a page is loading too slowly,
and they want the best picture that clears that number.

So the target is the input, and the quality is what gets searched for. There is
no formula that turns a quality setting into a byte count — it depends entirely
on the picture — so the search is empirical: encode, look at the size, adjust,
encode again. Every figure the page shows is a real encoded file rather than an
estimate, which is only affordable because the encoding is happening on the
visitor's own machine and costs this project nothing.

---

## The search

`src/compress.js`. Four rules, in order, and the order is the whole argument:

1. **A file already under the target is passed through byte for byte.** Not
   re-saved, not "optimised". The best possible version of a file that already
   fits is that file, and it is the only result on the page that keeps its
   metadata.
2. **Quality is spent first, down to a floor.** Full resolution is kept and the
   dial is bisected between `QUALITY_FLOOR` (0.62) and `QUALITY_CEILING` (0.94)
   for the highest setting that fits. Six halvings land within half a percent of
   the dial, which is finer than the encoder itself distinguishes.
3. **Resolution is spent second.** Below the floor, quality stops being cheap —
   blocking and smeared edges are what people mean by "compressed" — so the
   picture is made smaller and the dial goes back up to 0.8. The opening guess
   for the scale is `sqrt(target / bytesAtThatQuality)`, because encoded size
   tracks pixel count closely enough to guess from; that lands within a few
   percent and the four halvings after it only tidy up. Bisecting blindly would
   cost about twice as many encodes.
4. **The leftover budget is then spent.** Once something fits, quality is pushed
   back up at that size until the budget is used. A result at 60% of the target
   is not a win, it is detail thrown away for nothing.

A whole search is capped at `MAX_ENCODES` (16) and a typical one takes eight.

Two paths fall outside the four rules:

- **Resizing turned off** and the floor still not enough: the search keeps going
  down to `QUALITY_HARD_MIN` (0.2), because the visitor asked for a size. If even
  that misses, the row says so in plain words rather than pretending.
- **PNG output** has no quality dial at all — it is lossless, which is the whole
  reason somebody picks it — so only the scale search runs.

---

## What "auto" does about formats

Keeping the format is the default, because a file that arrives as a `.jpg` and
leaves as a `.jpg` is what people expect, and a surprise `.webp` is a support
question for whoever they send it to.

So "auto" only reaches for another format when keeping this one actually cost
something: a resize, a quality at or below the floor, or a target that was
missed. In that case the same search is run again in WebP, both results are
**measured**, and the better-looking one wins — with the original format keeping
any tie. When the extension changes, the row says why.

---

## Measuring what it cost

`src/measure.js`. Tools of this kind all claim "minimal quality loss" and almost
none of them says how much, because saying how much means decoding the result
and comparing it against the original — work a server-side compressor would be
paying for. Here it is nearly free, so both figures are shown:

- **SSIM**, on Rec. 601 luma, over 8×8 non-overlapping windows. Not the sliding
  11×11 Gaussian of the paper: an eighth of the arithmetic, and the average over
  a whole picture lands within a couple of thousandths of the same answer.
- **PSNR**, in decibels. A poor model of the eye, but it is the number people
  expect, and it stays honest about heavy compression where SSIM is generous.

Two decisions worth keeping:

- **Both pictures are drawn at the same size, in the original's shape**, capped
  at 1280 on the long side. A result that fitted by becoming half as wide is
  stretched back up before it is judged, because that is the cost the eye
  actually pays. Comparing it against a shrunk original would hide exactly what
  this figure exists to show.
- **The cap is a trade, and it goes one way.** The smaller it is, the kinder the
  numbers, because shrinking a picture smooths out the blocking that compression
  added. 1280 keeps artefacts visible while holding the work to about a
  megapixel, which stays quick on a phone even when a 40-megapixel photo went in.

---

## Limitations

- **Metadata does not survive.** Compressing means decoding to pixels and
  encoding those pixels again, and a canvas carries no tags, so EXIF, GPS, XMP
  and the rest are simply not written to the new file. Usually a bonus, and said
  on the page either way — with a link to `/exif-editor/` for anyone who wants
  the metadata gone but the picture untouched.
- **Only what the browser can write.** JPEG, PNG and WebP. WebP is checked at
  runtime by encoding one pixel and looking at the type that comes back, because
  `toBlob` handed a type it cannot write returns a PNG rather than failing. If it
  is missing, the option is disabled with a reason.
- **AVIF and JPEG XL are read but not written**, for the same reason: no browser
  ships an encoder for them that `toBlob` will reach. That is on the FFmpeg list
  in [What can be built here](../../README.md#what-needs-a-vendored-ffmpeg).
- **A tight target on a large photo takes a few seconds.** Eight to twenty-two
  encodes of a 12-megapixel image is real work, and it is happening on the
  visitor's laptop rather than someone's server. The progress line names the file
  and the phase so the wait is legible.
- **Animated GIFs and animated WebP lose the animation**, because a canvas holds
  one frame. The first frame is what comes out.
- **Everything is held in memory**, as with the other tools. Decoded bitmaps are
  released as soon as each image is finished, so only the thumbnails and the
  results stay alive.

---

## Testing it

There is no test runner in this repository, so the checks used while writing
this are not checked in. What they covered, if it needs doing again: images
generated on a canvas and fed to the file input through a `DataTransfer`, run
against targets that fit at full quality, targets that need the quality search,
targets that force a resize, and targets no setting can reach; a file already
under the target coming back as the identical `File` object; PNG output reaching
a target by resizing alone; `compare()` returning SSIM 1 and an infinite PSNR for
a picture against itself, and dropping to ~0.83 at quality 0.05; and the zip
carrying a valid local-file header.
