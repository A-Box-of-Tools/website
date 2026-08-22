# Video Frame Grabber

*A full-quality still from any point.*  ·  lives at `/grab-frame/`  ·  [all tools](../)  ·  [how the site is built](../../README.md)

The twelfth tool. It saves any frame of a clip as a picture, at the video's own
resolution, and never uploads a byte of it.

---

## What "full quality" is supposed to mean

Everybody already has a way to get a picture out of a video: pause it and press
the screenshot key. What comes out is the size of the window, after the player
has scaled the frame to fit it, after the compositor has colour-managed it, with
the play controls fading out across the bottom. It is a photograph of a screen
showing a video, and for most uses it is fine.

This tool is for the times it is not, so it has two things to be:

- **The video's own size.** A 4K clip gives a 3840 × 2160 picture, whatever size
  the preview on the page happens to be. Nothing here scales a frame down on the
  way out; the preview and the saved still are drawn from the same decoded frame
  at two different sizes, by [`src/draw.js`](src/draw.js), and only one of them
  is small.
- **The frame, not a copy of it.** With PNG chosen, the file holds exactly the
  pixels the decoder produced. JPEG and WebP are offered because an 8 MB PNG is
  not always what somebody wants, but they are a second compression on top of
  the video's own, and the page says so where you pick them rather than in a
  footnote.

The third thing, and the one that took the most code, is that it has to be the
frame you *asked for*.

## Two paths, and why there are two

A grabber is only as useful as the list of files it will accept, and there is no
single browser API that both opens everything and addresses frames properly. So
there are two paths, and the tool picks the better one it can use for the file
in front of it.

| | **Exact** | **Playback** |
|---|---|---|
| Accepts | MP4, M4V, MOV, in any codec `VideoDecoder` will open | anything the browser will *play* |
| How | demux → find the frame → decode from the keyframe in front of it → draw | seek a `<video>`, draw whatever it is showing |
| Which frame | the one asked for, by its place in the file | the one the player chose to land on |
| Stepping | one frame, exactly, including on a variable frame rate | a nudge of about a thirtieth of a second |
| Frame count | known, and shown | not known |
| Needs | WebCodecs | a `<video>` element and a canvas |

The exact path is the one to want, and the playback path is why the tool has no
"unsupported format" dead end for anything the browser itself can open. The page
says which one it is using and why, in those words.

**The fallback is chosen by the reader failing, not by the extension.** Every
file goes to [`src/demux.js`](src/demux.js) first; if it comes back with an
`UnsupportedFile`, the reason on it is what the page prints — "this is not an
MP4 or MOV file", "the video track is encrypted", "this browser will not decode
`hvc1.2.4.L120.B0` directly". A tool that says *which* thing it could not do is
worth a good deal more than one that says "unsupported file".

There is one more way the exact path stands down: if the reader and the player
disagree about the shape of the picture, one of them is applying a rotation the
other is not. The player is what you are looking at, so it wins, and the
playback path takes over. Getting that wrong produces a plausible picture of the
right moment, sideways, which nothing about the result would tell you.

## The frame list

`src/demux.js` is the reader from [`/crop-video/`](../crop-video/), unchanged.
It hands back the samples of the video track in the order they are **decoded**.
What somebody scrubbing a video is moving through is the order they are
**watched** in, and in any file with B-frames those are not the same order.

So [`src/frames.js`](src/frames.js) sorts the list once by presentation time,
and every number on the page — "frame 812 of 3,540", the time under the slider,
where the arrow keys go — is an index into that sorted list. On the exact path
the slider addresses frames directly: one step, one picture, with no rounding
between what the slider says and what gets saved.

Asking for frame 812 is then three steps:

1. **Walk back to the last keyframe at or before it.** A frame that is not one
   cannot be decoded without the frames it was predicted from.
2. **Feed everything from there up to it, in decode order.** By definition
   everything a frame depends on comes before it in that order, so nothing after
   it is needed.
3. **Flush, and keep the frame whose timestamp is the one that was asked for.**

Step three is not "keep the last frame the decoder handed back". A decoder
outputs in presentation order, and the last frame out of a run that stopped
mid-GOP can easily be one that is watched *after* the frame wanted. Matching on
the timestamp is the only version of this that is right on a file with B-frames,
and a file with B-frames is most of them.

### The one optimisation, and why it is measured in pixels

Stepping forward a frame at a time is how people actually use this, and doing
the walk above for every step means decoding a whole GOP to advance by one
picture. So a run decodes a little past the frame it was asked for and keeps
what it saw, as `ImageBitmap`s: the next dozen steps are then instant.

The budget is in **pixels, not frames**. Sixteen frames is 130 MB at 1080p and
half a gigabyte at 4K, and the second one is not a cache, it is a crash. So
`lookaheadFor()` divides a fixed byte budget by the size of a frame and keeps
between two and sixteen of them, which is a dozen on ordinary footage and three
on a 4K clip.

The one rule that matters is that **the frame asked for is kept whatever the
budget says**. Everything after it is a bonus, and a full budget is a reason to
skip a bonus rather than a reason to fail — which is what an earlier version of
that line did, on the first jump after the cache filled up: it returned the
picture from two jumps ago and said the frame could not be decoded.

Decoded frames are also handed back to the decoder the moment they are copied.
Holding a GOP's worth of `VideoFrame`s open is how a pipeline ends up stalled
waiting for its own output buffers, and that failure looks like the tool hanging
rather than like a bug in a cache.

## Rotation, which is where a grabber usually goes wrong

A phone films in landscape and writes a rotation into the file rather than
turning the pixels. Every player turns the picture on the way to the screen, so
what you see is portrait and what the decoder hands over is landscape.

`src/draw.js` applies that turn before anything is drawn, and the canvas it
draws into is in display coordinates — the ones you can see. The preview and the
saved still go through the same four lines, so what you are looking at is what
lands in your downloads, at a different size.

A frame taken from a `<video>` element on the playback path is drawn with no
rotation at all, because the element has already applied it.

## Every N seconds

The second way to use this is a still every few seconds — contact sheets,
thumbnails, a strip of a long recording. That is not a hundred separate grabs:
`decodeSeries()` picks the frames first, then walks the file forward **once**,
feeding the decoder from the first keyframe it needs and taking each wanted
frame as it goes past.

Two details in `seriesFrames()` are deliberate:

- it takes the frame *at or before* each mark, so the times you asked for are
  the times you get rather than the times rounded up to the next frame;
- it never returns the same frame twice, which is what an interval shorter than
  a frame would otherwise produce — a hundred copies of one picture, each with a
  different name.

The stills come out as one ZIP, because twenty downloads is twenty save prompts
and that is the sort of thing that makes people give up and use the upload site
instead. `src/zip.js` is the stored-only writer the image tools already use.

## The names

A folder of stills called `frame1.png`, `frame2.png` is worthless a week later.
Every file here carries the time it was taken at — `holiday-01-23.480.png` — so
it can be lined up against the video again by anybody, and sorts into the right
order in every file manager, which is what the padding is for. Colons are not
legal in a Windows filename, so the usual `01:23.480` becomes `01-23.480`, and
hours only appear when there are any.

## Limitations

- **The playback path lands where the player lands.** It saves a full-size
  picture, but which frame that is, on a file this reader cannot open, is the
  browser's decision and not this tool's. The page says so rather than implying
  an accuracy it has not got.
- **Stepping on that path is approximate**, for the same reason: there is no
  frame list to step through, so a step is a nudge of about a thirtieth of a
  second.
- **A still is 8-bit.** The frame is drawn through a canvas, so an HDR or 10-bit
  source is converted on the way — a tone-mapped SDR picture is what canvas
  gives, in every browser, and PNG at that point is an exact copy of *that*.
- **No resizing or cropping.** This tool saves the frame as it is; changing its
  size or its shape is a separate job with its own decisions in it, and
  [`/resize-image/`](../resize-image/) does both.
- **The stills are held in the page** until they are downloaded, so a few
  hundred 4K PNGs is the practical ceiling — the video itself is not, since it
  is never read into memory whole.
- **Edit lists on the way in are ignored**, as in the sibling tools: a file that
  says "start playing 40 milliseconds in" is read from the first sample instead.
- **Encrypted tracks are refused**, with that as the reason.
- **AVI, WMV, FLV and most MKVs** are not readable here and not playable in most
  browsers. That is the FFmpeg question in
  [What can be built here](../../README.md#what-needs-a-vendored-ffmpeg), not a
  gap that a few more lines would close.

## Testing it

The arithmetic — the display order, the search for the frame being watched at a
given second, the keyframe walk, the series picker, the names — is in
`tests/js/grab-frame.test.js` and needs nothing installed:

```bash
node --test "tests/js/*.test.js"
```

The rest needs a real decoder and a real canvas, so it is checked in a browser.
What that covered, if it needs doing again:

- an MP4 with B-frames, where the file's decode order and its presentation order
  differ: stepping forward through it must show each picture once, in order, and
  the frame saved at index *n* must be the frame the player shows when it is
  paused at that frame's own timestamp;
- a portrait iPhone clip, checked by eye against the same frame in a player, and
  by its dimensions: 1080 × 1920 out of a file whose track is 1920 × 1080;
- an HEVC clip in a browser with no licence to play one, which must lose the
  preview player and keep the exact path;
- a WebM, which must take the playback path and still save a full-size picture;
- a variable-frame-rate screen recording, where stepping must follow the file's
  own frame times rather than a constant step;
- "every 2 seconds" over a five-minute clip: 150 stills, each within a frame of
  its mark, with the ZIP unpacking to 150 differently-named files;
- cancelling a series halfway, and grabbing again afterwards;
- a text file dropped in, to be refused.
