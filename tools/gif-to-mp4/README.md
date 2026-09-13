# GIF to MP4

[← All tools](../README.md) · [The tool](https://abox.tools/gif-to-mp4/)

Turns an animated GIF into an MP4, in the browser, without the file going
anywhere: every frame decoded and composited the way a browser shows it,
drawn on to a canvas, encoded as H.264 with the delay the GIF gave it, and
written into an MP4 whose every sample lasts exactly that long. The result
is opened again to count the frames and check the length before it is
offered.

It is the roadmap's "GIF to MP4 or WebM" line, built as "GIF to MP4" for
the reason the roadmap's "…or WebM" note gives: WebM through WebCodecs is
not dependable outside Chromium, and the MP4 is what every platform that
refuses a large GIF wanted anyway.

## The timing is the point

A GIF has no frame rate. Each frame carries a delay in hundredths of a
second, and the delays vary — a slideshow holds a frame for two seconds and
then flicks through ten. Most converters pick a frame rate and resample on
to it, which doubles some frames and drops others. This one does not:

- `frameTimes()` in `src/plan.js` turns the delays into a start time and a
  duration per frame, applying the one liberty every browser takes — a delay
  under two hundredths is played as ten (`playedDelay` in the shared decoder)
  — so the video plays for as long as the GIF plays in a browser.
- `src/encode.js` gives each `VideoFrame` that start as its timestamp and
  that duration, and the encoder hands the timestamp back on the chunk,
  which is how the chunk finds its own delay for the muxer whatever order
  chunks arrive in. `Mp4Muxer.addSample` records the duration per sample, so
  the MP4's time-to-sample table is the GIF's delay table.
- `nominalFps()` is what the encoder is *told* — one over the commonest
  delay — and is only a hint. `timingText()` says on the page whether the
  delays vary.
- `verify()` in `src/main.js` reopens the result with the shared MP4 reader
  and holds it to the GIF's play length (within a twentieth of a second or
  one per cent) and to one sample per GIF frame.

## The picture

The compositing is `shared/js/gif-compose.js`, which with the reader
`shared/js/gif-decode.js` moved out of the splitter for this tool. `GifCanvas`
replays the disposal rules the way browsers do (method 2 clears to
transparent, not to the background colour). Its buffer is reused per frame,
so the copy is what gets flattened over the chosen colour — flattening in
place would still render correctly but would be the wrong thing to do to a
canvas the disposal rules act on.

A video has no transparency, so a GIF that lets anything show through gets
a colour behind it; `hasTransparency()` decides whether the page asks, and
white is the default because that is what most pages are. H.264 needs even
edges, so `outputSize()` adds one column or row of the background for an odd
edge rather than resampling, and draws down anything wider than 3840. The
bitrate is a generous 0.15 bits per pixel per frame (flat art shows every
block) held between 400 kbit/s and 20 Mbit/s.

## What the page says that a converter usually does not

- A video does not loop by itself; the player decides. The page says so,
  reports whether the GIF was set to loop, and loops its own preview.
- A tiny or very still GIF can come out larger as an MP4; the result line
  says "larger" when it is rather than pretending.

## Tests

`tests/js/gif-to-mp4.test.js`: the delay table into times, the browser's
minimum delay, the nominal rate, the even-edge and 4K rules, the bitrate at
its floor and ceiling, transparency detection, colour parsing, and the words.
The decoder and compositor keep their own tests in
`tests/js/split-gif-decode.test.js`, now importing the shared parts. The
encoder is WebCodecs and is checked in a browser: build the site, open the
page, press "Try an example", and read the check line.

## What it does not do

- Write WebM. See the roadmap's "…or WebM".
- Resize or crop; the picture stays the GIF's own size. The compressor takes
  the result if it has to be smaller.
- Read APNG or animated WebP.
